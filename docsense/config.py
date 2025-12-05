import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ---- RAG / chunking settings ----
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
MAX_PAGES_PER_DOC = 1000
MAX_CHUNKS_PER_DOC = 10000

# ---- Paths ----
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
QDRANT_PATH = DATA_DIR / "qdrant_db"
QDRANT_COLLECTION = "docsense_docs"
DOCS_DIR = DATA_DIR / "docs"

DATA_DIR.mkdir(parents=True, exist_ok=True)
DOCS_DIR.mkdir(parents=True, exist_ok=True)

def get_groq_api_key() -> str:
    key = os.getenv("GROQ_API_KEY")
    if not key:
        raise RuntimeError(
            "GROQ_API_KEY is not set.\n"
            "Set it in VS Code → .vscode/launch.json → env\n"
            "OR in a .env file in the project root."
        )
    return key
