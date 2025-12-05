import os
import shutil
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path

from docsense.rag_pipeline import (
    process_document, 
    ask, 
    delete_document, 
    generate_suggested_questions
)
from docsense.config import DOCS_DIR

app = FastAPI(title="DocSense API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str
    model_name: str = "llama-3.3-70b-versatile"

class ChatResponse(BaseModel):
    answer: str
    context_docs: List[dict]

class FileInfo(BaseModel):
    name: str
    size: str

@app.get("/")
def read_root():
    return {"message": "Welcome to DocSense API"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = DOCS_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = process_document(str(file_path))
        if result.get("status") == "error":
            # Cleanup if processing failed
            if file_path.exists():
                os.remove(file_path)
            raise HTTPException(status_code=400, detail=result.get("message"))
            
        return {"filename": file.filename, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files", response_model=List[FileInfo])
def list_files():
    files = []
    if DOCS_DIR.exists():
        for f in DOCS_DIR.iterdir():
            if f.is_file():
                size = f.stat().st_size
                # Convert size to readable format
                for unit in ['B', 'KB', 'MB', 'GB']:
                    if size < 1024:
                        size_str = f"{size:.1f}{unit}"
                        break
                    size /= 1024
                else:
                    size_str = f"{size:.1f}TB"
                
                files.append(FileInfo(name=f.name, size=size_str))
    return files

@app.delete("/files/{filename}")
def delete_file(filename: str):
    file_path = DOCS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        delete_document(filename)
        os.remove(file_path)
        return {"status": "success", "message": f"Deleted {filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        result = ask(request.question, model_name=request.model_name)
        # Convert Documents to dicts for JSON serialization
        context_docs = []
        for doc in result.get("context_docs", []):
            context_docs.append({
                "page_content": doc.page_content,
                "metadata": doc.metadata
            })
            
        return ChatResponse(
            answer=result["answer"],
            context_docs=context_docs
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/questions/{filename}")
def get_questions(filename: str, model_name: str = "llama-3.1-8b-instant"):
    file_path = DOCS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
        
    questions = generate_suggested_questions(str(file_path), model_name)
    return {"questions": questions}
