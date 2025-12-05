# 🧠 DocSense

**Intelligent, Local, and Private Document Chat.**

DocSense is a powerful RAG (Retrieval-Augmented Generation) application that allows you to chat with your documents (PDF, DOCX, TXT) completely offline (except for the LLM inference). It uses **Llama-3.3-70B** (via Groq) for high-speed, high-quality answers and **Qdrant** for local vector storage.

---

## ✨ Features

*   **100% Local Data Storage**: Your documents and embeddings are stored locally on your machine.
*   **Multi-Model Support**: Switch between **Llama-3.3-70B**, **Llama-3.1-8b**, and others instantly.
*   **Blazing Fast Inference**: Powered by Groq's LPU for near-instant responses.
*   **Smart "Quick Questions"**: Automatically generates 5 relevant questions for every uploaded document.
*   **Persistent File Management**: Upload, list, and delete files with a simple sidebar interface.
*   **Clean & Modern UI**: Built with Streamlit, featuring a sticky source viewer and ghost-style buttons.
*   **Robust RAG Pipeline**: Uses LangChain and Qdrant for accurate retrieval and context-aware answers.

---

## 🚀 Getting Started

### Prerequisites

*   Python 3.10 or higher
*   A [Groq API Key](https://console.groq.com/) (Free beta access available)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/docsense.git
    cd docsense
    ```

2.  **Create a virtual environment:**
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up configuration:**
    Create a `.env` file in the root directory and add your Groq API key:
    ```bash
    GROQ_API_KEY=gsk_your_api_key_here
    ```

---

## 🏃‍♂️ Usage

Run the application using Streamlit:

```bash
streamlit run streamlit_app.py
```

1.  **Upload**: Drag and drop your PDF, DOCX, or TXT file in the sidebar.
2.  **Analyze**: DocSense will ingest the file and generate "Quick Questions".
3.  **Chat**: Click a quick question or type your own to start chatting.
4.  **Manage**: Use the sidebar to delete files you no longer need.

---

## 🚫 What NOT To Do

*   **Do NOT commit your `.env` file**: This contains your private API key.
*   **Do NOT upload sensitive personal data** to public LLM endpoints (even though storage is local, the text is sent to Groq for inference).
*   **Do NOT delete the `data/` folder manually** while the app is running, as it may corrupt the vector database. Use the "Delete" button in the app instead.

---

## 🔮 Future Plans

*   [ ] **Chat History Persistence**: Save and load chat sessions.
*   [ ] **Multi-Model Support**: Add support for OpenAI (GPT-4) and Anthropic (Claude).
*   [ ] **Local LLM Support**: Integrate Ollama for a truly 100% offline experience.
*   [ ] **Advanced RAG**: Implement re-ranking and hybrid search for better accuracy.

---

**Built with ❤️ by [Your Name]**
