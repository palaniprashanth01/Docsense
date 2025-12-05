import os
import shutil
from typing import List, Dict, Any
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_core.documents import Document

from .config import (
    QDRANT_PATH, QDRANT_COLLECTION, CHUNK_SIZE, CHUNK_OVERLAP, 
    get_groq_api_key
)

# ---- 1. Embeddings ----
def get_embeddings():
    return HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")

# ---- 2. Qdrant Client & VectorStore ----
def _get_qdrant_client():
    return QdrantClient(path=str(QDRANT_PATH))

def _get_vectorstore():
    client = _get_qdrant_client()
    
    # Ensure collection exists
    if not client.collection_exists(QDRANT_COLLECTION):
        client.create_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )
        
    return QdrantVectorStore(
        client=client,
        collection_name=QDRANT_COLLECTION,
        embedding=get_embeddings(),
    )

# ---- 3. Ingestion ----
def process_document(file_path: str) -> Dict[str, Any]:
    """
    Loads a file, splits it, and indexes it into Qdrant.
    """
    if not os.path.exists(file_path):
        return {"status": "error", "message": "File not found"}

    try:
        # Load
        ext = file_path.lower()
        if ext.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
        elif ext.endswith(".txt"):
            loader = TextLoader(file_path)
        elif ext.endswith(".docx"):
            loader = Docx2txtLoader(file_path)
        else:
            return {"status": "error", "message": f"Unsupported file type: {ext}"}
        
        docs = loader.load()
        if not docs:
            return {"status": "error", "message": "No text found in document"}

        # Split
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE, 
            chunk_overlap=CHUNK_OVERLAP
        )
        chunks = splitter.split_documents(docs)

        # Add metadata (source filename)
        filename = os.path.basename(file_path)
        for chunk in chunks:
            chunk.metadata["source"] = filename

        # Index
        vectorstore = _get_vectorstore()
        vectorstore.add_documents(chunks)

        return {"status": "success", "chunks": len(chunks)}

    except Exception as e:
        return {"status": "error", "message": str(e)}

def delete_document(filename: str):
    """
    Deletes all chunks associated with a filename from Qdrant.
    """
    client = _get_qdrant_client()
    if client.collection_exists(QDRANT_COLLECTION):
        client.delete(
            collection_name=QDRANT_COLLECTION,
            points_selector=qdrant_client.models.Filter(
                must=[
                    qdrant_client.models.FieldCondition(
                        key="metadata.source",
                        match=qdrant_client.models.MatchValue(value=filename)
                    )
                ]
            )
        )
        # Note: The above delete syntax might need adjustment depending on qdrant-client version.
        # A safer, simpler way for local Qdrant (which might not support complex filters fully in all versions)
        # is to iterate. But let's try the standard filter first.
        # Actually, for simplicity and robustness in this script, let's use the scroll API to find points.
        
        # Robust deletion:
        points, _ = client.scroll(
            collection_name=QDRANT_COLLECTION,
            scroll_filter=qdrant_client.models.Filter(
                must=[
                    qdrant_client.models.FieldCondition(
                        key="metadata.source",
                        match=qdrant_client.models.MatchValue(value=filename)
                    )
                ]
            ),
            limit=10000 
        )
        if points:
            client.delete(
                collection_name=QDRANT_COLLECTION,
                points_selector=qdrant_client.models.PointIdsList(
                    points=[p.id for p in points]
                )
            )

import qdrant_client.models # Needed for the delete logic above

# ---- 4. Retrieval & Generation ----
def get_llm(model_name: str):
    return ChatGroq(
        groq_api_key=get_groq_api_key(),
        model_name=model_name,
        temperature=0.3
    )

def get_retriever():
    vectorstore = _get_vectorstore()
    return vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 5, "fetch_k": 20}
    )

def ask(question: str, model_name: str = "llama-3.3-70b-versatile") -> Dict[str, Any]:
    """
    RAG pipeline: Retrieve -> Generate
    """
    retriever = get_retriever()
    llm = get_llm(model_name)

    system_prompt = """You are DocSense — a senior technical documentation assistant.

Use ONLY the retrieved context to answer.
If the answer is not found, reply with: "Not found in docs."

Format your answer cleanly with bullets, tables, or code blocks.
CONTEXT:
{context}
"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{question}")
    ])

    _rag_chain = (
        RunnableParallel({
            "context_docs": retriever,
            "question": RunnablePassthrough(),
        })
        | (lambda x: {
            "context": "\n\n".join(d.page_content for d in x["context_docs"]),
            "question": x["question"],
            "context_docs": x["context_docs"]
        })
        | RunnableParallel({
            "answer": prompt | llm,
            "context_docs": lambda x: x["context_docs"]
        })
    )

    result = _rag_chain.invoke(question)
    return {
        "answer": result["answer"].content,
        "context_docs": result["context_docs"]
    }

# ---- 5. Quick Questions ----
def generate_suggested_questions(file_path: str, model_name: str = "llama-3.1-8b-instant") -> List[str]:
    """
    Generates 5 short, relevant questions based on the document content.
    """
    if not os.path.exists(file_path):
        return []

    try:
        ext = file_path.lower()
        if ext.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
        elif ext.endswith(".txt"):
            loader = TextLoader(file_path)
        elif ext.endswith(".docx"):
            loader = Docx2txtLoader(file_path)
        else:
            return []
        
        docs = loader.load()
        # Take first 3 pages/chunks for context
        context_text = "\n\n".join([d.page_content for d in docs[:3]])
        
        llm = get_llm(model_name)
        
        prompt = f"""
        Based on the following document excerpt, generate 5 short, specific questions that a user might ask about this document.
        Return ONLY the questions, one per line. Do not number them.
        
        DOCUMENT EXCERPT:
        {context_text[:4000]}
        
        QUESTIONS:
        """
        
        response = llm.invoke(prompt)
        questions = [q.strip() for q in response.content.split('\n') if q.strip()]
        questions = [q for q in questions if q.endswith('?')]
        return questions[:5]
        
    except Exception as e:
        print(f"Error generating questions: {e}")
        return []
