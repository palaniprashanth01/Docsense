import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, FileText, ChevronRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import type { ChatMessage, ContextDoc } from '../types';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => Promise<void>;
    isProcessing: boolean;
    suggestedQuestions: string[];
    sources: ContextDoc[];
}

export function ChatInterface({
    messages,
    onSendMessage,
    isProcessing,
    suggestedQuestions,
    sources
}: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isProcessing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;

        const msg = input;
        setInput('');
        await onSendMessage(msg);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
                            <Sparkles className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Welcome to DocSense
                        </h2>
                        <p className="text-slate-400 mb-8 max-w-md">
                            Upload a document to get started. I can summarize content, answer questions, and help you find information instantly.
                        </p>

                        {suggestedQuestions.length > 0 && (
                            <div className="w-full grid gap-3 text-left">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Suggested Questions
                                </p>
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onSendMessage(q)}
                                        className="p-4 rounded-xl bg-slate-900 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all text-slate-300 hover:text-white text-sm flex items-center justify-between group"
                                    >
                                        {q}
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex gap-4 max-w-3xl mx-auto",
                                    msg.role === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot className="w-5 h-5 text-indigo-400" />
                                    </div>
                                )}

                                <div
                                    className={cn(
                                        "rounded-2xl p-4 max-w-[85%] shadow-sm",
                                        msg.role === 'user'
                                            ? "bg-indigo-600 text-white rounded-tr-sm"
                                            : "bg-slate-900 border border-white/5 text-slate-200 rounded-tl-sm"
                                    )}
                                >
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center flex-shrink-0 mt-1">
                                        <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isProcessing && (
                            <div className="flex gap-4 max-w-3xl mx-auto">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div className="bg-slate-900 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                                    <span className="text-sm text-slate-400">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Sources Panel (Inline for now, could be collapsible) */}
            {sources.length > 0 && messages.length > 0 && (
                <div className="border-t border-white/5 bg-slate-900/50 p-4 max-h-48 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Sources
                        </h3>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {sources.map((doc, i) => (
                                <div
                                    key={i}
                                    className="min-w-[200px] max-w-[250px] bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-slate-400 hover:border-indigo-500/30 transition-colors cursor-help"
                                    title={doc.page_content}
                                >
                                    <p className="line-clamp-3 mb-1">{doc.page_content}</p>
                                    <span className="text-[10px] text-slate-600 font-mono">
                                        {doc.metadata?.source || 'Unknown source'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-slate-950 border-t border-white/5">
                <div className="max-w-3xl mx-auto relative">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            disabled={isProcessing}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 pl-5 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-lg shadow-black/20"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isProcessing}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-0 disabled:pointer-events-none"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-slate-600 mt-3">
                        AI can make mistakes. Please verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
}
