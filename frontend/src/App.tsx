import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import type { FileInfo, ChatMessage, ContextDoc } from './types';
import * as api from './lib/api';

function App() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [sources, setSources] = useState<ContextDoc[]>([]);
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await api.listFiles();
      setFiles(data);
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await api.uploadFile(file);
      await loadFiles();

      // Get questions for the new file
      const qRes = await api.getQuestions(file.name);
      setSuggestedQuestions(qRes.questions);

      // Reset chat if it's the first file or user wants a fresh start? 
      // For now, let's keep chat history but show new questions.
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete ${filename}?`)) return;
    try {
      await api.deleteFile(filename);
      await loadFiles();
      if (files.length <= 1) {
        setSuggestedQuestions([]);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSendMessage = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsProcessing(true);
    setSources([]); // Clear previous sources while thinking

    try {
      const res = await api.chat(text, selectedModel);
      setMessages(prev => [...prev, { role: 'assistant', content: res.answer }]);
      setSources(res.context_docs);
    } catch (err) {
      console.error('Chat failed:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectFile = async (filename: string) => {
    // Maybe get questions for this specific file?
    // Or just show it's selected.
    // For now, let's fetch questions for it.
    try {
      const qRes = await api.getQuestions(filename);
      setSuggestedQuestions(qRes.questions);
    } catch (err) {
      console.error('Failed to get questions:', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans antialiased selection:bg-indigo-500/30">
      <Sidebar
        files={files}
        onUpload={handleUpload}
        onDelete={handleDelete}
        onSelect={handleSelectFile}
        isUploading={isUploading}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing}
        suggestedQuestions={suggestedQuestions}
        sources={sources}
      />
    </div>
  );
}

export default App;
