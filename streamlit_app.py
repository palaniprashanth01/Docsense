import os
import streamlit as st
from pathlib import Path
from docsense.rag_pipeline import process_document, ask, delete_document, generate_suggested_questions
from docsense.config import DOCS_DIR

st.set_page_config(page_title="DocSense — Intelligent Document Chat", layout="wide")

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "sources" not in st.session_state:
    st.session_state.sources = []
if "suggested_questions" not in st.session_state:
    st.session_state.suggested_questions = []

# Custom CSS for sticky sources column
st.markdown("""
<style>
    div[data-testid="stColumn"]:nth-of-type(2) {
        position: sticky;
        top: 4rem;
        height: calc(100vh - 8rem);
        overflow-y: auto;
    }
    
    /* Ghost Button for Delete in Sidebar */
    section[data-testid="stSidebar"] button {
        background: transparent !important;
        border: none !important;
        color: #c9d1d9 !important;
        font-size: 1rem !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        line-height: 1 !important;
    }
    section[data-testid="stSidebar"] button:hover {
        background: transparent !important;
        color: #FF4B4B !important;
        transform: scale(1.1);
    }
</style>
""", unsafe_allow_html=True)

st.title("🧠 DocSense")

# Sidebar
with st.sidebar:
    st.header("⚙️ Settings")
    model_name = st.selectbox(
        "Choose LLM",
        ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant"],
        index=0
    )
    
    st.divider()
    st.header("Upload Document")
    uploaded = st.file_uploader("Choose a file", type=["pdf", "docx", "txt"])
    
    if uploaded:
        # Save and process immediately
        save_path = DOCS_DIR / uploaded.name
        
        if not save_path.exists():
            with open(save_path, "wb") as f:
                f.write(uploaded.getbuffer())

            with st.spinner(f"Ingesting {uploaded.name}..."):
                res = process_document(str(save_path))
                if res.get("status") == "success":
                    st.success(f"Processed: {uploaded.name}")
                    
                    # Generate suggested questions
                    with st.spinner("Generating quick questions..."):
                        qs = generate_suggested_questions(str(save_path), model_name)
                        st.session_state.suggested_questions = qs
                    
                    st.rerun() 
                else:
                    st.error(f"Error: {res.get('message')}")
        else:
            st.info(f"File '{uploaded.name}' already exists.")

    # Display Suggested Questions
    if st.session_state.suggested_questions:
        st.divider()
        st.header("⚡ Quick Questions")
        for q in st.session_state.suggested_questions:
            if st.button(q, key=q):
                # Simulate user input
                st.session_state.messages.append({"role": "user", "content": q})
                
                with st.spinner(f"Thinking with {model_name}..."):
                    res = ask(q, model_name=model_name)
                    answer = res["answer"]
                    docs = res.get("context_docs", [])
                    st.session_state.sources = docs
                    st.session_state.messages.append({"role": "assistant", "content": answer})
                    st.rerun()

    st.divider()
    st.header("Uploaded Documents")
    
    # List files in DOCS_DIR
    files = [f for f in DOCS_DIR.iterdir() if f.is_file()]
    
    if not files:
        st.caption("No documents uploaded yet.")
    else:
        # Helper for file size
        def get_size(path):
            size = path.stat().st_size
            for unit in ['B', 'KB', 'MB', 'GB']:
                if size < 1024:
                    return f"{size:.1f}{unit}"
                size /= 1024
            return f"{size:.1f}TB"

        for f in files:
            # Custom styled row
            col_icon, col_name, col_del = st.columns([0.15, 0.7, 0.15], vertical_alignment="center")
            
            with col_icon:
                st.markdown("📄")
            
            with col_name:
                size_str = get_size(f)
                # Truncate long names
                disp_name = f.name if len(f.name) < 18 else f.name[:15] + "..."
                st.markdown(f"**{disp_name}** <span style='color:#8b949e; font-size:0.8em; margin-left:4px'>{size_str}</span>", unsafe_allow_html=True)
            
            with col_del:
                if st.button("✕", key=f"del_{f.name}", help=f"Delete {f.name}"):
                    delete_document(f.name)
                    os.remove(f)
                    if len(files) == 1:
                        st.session_state.suggested_questions = []
                    st.rerun()

# Main Layout
col_chat, col_sources = st.columns([0.7, 0.3])

with col_chat:
    # Display chat history
    if not st.session_state.messages:
        st.info("Upload a document and start asking questions!")
    
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

with col_sources:
    st.subheader("Sources")
    if st.session_state.sources:
        for i, doc in enumerate(st.session_state.sources, start=1):
            with st.expander(f"Source {i}", expanded=False):
                st.markdown(f"**Content:**\n{doc.page_content}")
                if hasattr(doc, "metadata"):
                    st.caption(f"Metadata: {doc.metadata}")
    else:
        st.markdown("*No sources available yet.*")

# Chat Input
if prompt := st.chat_input("Ask a question about your docs..."):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with col_chat:
        with st.chat_message("user"):
            st.markdown(prompt)

    # Generate answer
    with st.spinner(f"Thinking with {model_name}..."):
        res = ask(prompt, model_name=model_name)
        answer = res["answer"]
        docs = res.get("context_docs", [])
        
        # Update sources
        st.session_state.sources = docs
        
        # Add assistant message
        st.session_state.messages.append({"role": "assistant", "content": answer})
        
        # Rerun to update the sources column immediately
        st.rerun()
