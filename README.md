# 🧠 DocSense

**Intelligent, Local, and Private Document Chat.**

DocSense is a modern RAG (Retrieval-Augmented Generation) application that allows you to chat with your documents (PDF, DOCX, TXT) completely offline (except for the LLM inference). It features a premium **React** frontend and a robust **FastAPI** backend.

---

## ✨ Features

*   **Modern UI**: Built with React, Vite, and Tailwind CSS v4 (Dark SaaS Theme).
*   **Fast Backend**: Powered by FastAPI for efficient file handling and RAG processing.
*   **Multi-Model Support**: Switch between **Llama 3.3 70B**, **Mixtral 8x7B**, and more via Groq.
*   **Local Vector Store**: Uses Qdrant for secure, local document indexing.
*   **Smart Suggestions**: Automatically generates relevant questions for your documents.

---

## 🚀 How to Run

You need to run the **Backend** and **Frontend** in two separate terminal windows.

### Prerequisites
1.  **Python 3.10+**
2.  **Node.js 20+**
3.  **Groq API Key** (Get one [here](https://console.groq.com/))

### 1. Setup (First Time Only)

**Backend:**
```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

**Environment Variables:**
Create a `.env` file in the root directory:
```bash
GROQ_API_KEY=gsk_your_api_key_here
```

### 2. Start the Application

**Terminal 1: Backend (API)**
```bash
source .venv/bin/activate
uvicorn backend.main:app --reload
```
*Server running at: http://localhost:8000*

**Terminal 2: Frontend (UI)**
```bash
cd frontend
npm run dev
```
*App running at: http://localhost:5173*

---

## 🛑 How to Stop

To stop the application:
1.  Go to the terminal running the **Backend**.
2.  Press `Ctrl + C`.
3.  Go to the terminal running the **Frontend**.
4.  Press `Ctrl + C`.

---

## 🚫 What NOT To Do

*   **❌ Do NOT commit your `.env` file**: This contains your private API key. We have added it to `.gitignore`, but be careful not to force add it.
*   **❌ Do NOT delete the `data/` folder manually** while the app is running. This contains your vector database. Use the "Delete" button in the app UI instead.
*   **❌ Do NOT upload sensitive PII (Personally Identifiable Information)**: While your documents are stored locally, the text chunks are sent to Groq's API for inference. Treat it like using ChatGPT.
*   **❌ Do NOT run `npm run build` for development**: Use `npm run dev` for a faster, interactive development experience.

---

## 🛠️ Tech Stack

*   **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Axios, React Markdown.
*   **Backend**: FastAPI, Uvicorn, LangChain, Qdrant.
*   **AI**: Groq (Llama 3, Mixtral, Gemma).

---

**Built with ❤️ by [Your Name]**
