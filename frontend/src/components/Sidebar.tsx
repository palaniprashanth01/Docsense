import { useRef } from 'react';
import { FileText, Trash2, Plus, Loader2 } from 'lucide-react';
import type { FileInfo } from '../types';

interface SidebarProps {
    files: FileInfo[];
    onUpload: (file: File) => Promise<void>;
    onDelete: (filename: string) => Promise<void>;
    onSelect: (filename: string) => void;
    isUploading: boolean;
    selectedModel: string;
    onModelChange: (model: string) => void;
}

export function Sidebar({ files, onUpload, onDelete, onSelect, isUploading, selectedModel, onModelChange }: SidebarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="w-64 bg-slate-900 border-r border-white/5 flex flex-col h-full">
            <div className="p-6 border-b border-white/5">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🧠</span> DocSense
                </h1>
            </div>

            <div className="p-4">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-primary/20"
                >
                    {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Plus className="w-5 h-5" />
                    )}
                    Upload Document
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                    Documents
                </h2>

                {files.length === 0 ? (
                    <div className="text-center py-8 px-2">
                        <div className="bg-slate-800/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                            <FileText className="w-6 h-6 text-slate-600" />
                        </div>
                        <p className="text-sm text-slate-500">No documents yet</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {files.map((file) => (
                            <div
                                key={file.name}
                                className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => onSelect(file.name)}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0" />
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm text-slate-300 truncate group-hover:text-white transition-colors">
                                            {file.name}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {file.size}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(file.name);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-400 text-slate-500 rounded-md transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/5">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Model
                    </label>
                    <select
                        value={selectedModel}
                        onChange={(e) => onModelChange(e.target.value)}
                        className="w-full bg-slate-800 border border-white/10 rounded-lg py-2 px-3 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                    >
                        <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
                        <option value="llama-3.1-70b-versatile">Llama 3.1 70B</option>
                        <option value="llama-3.1-8b-instant">Llama 3.1 8B</option>
                        <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                        <option value="gemma2-9b-it">Gemma 2 9B</option>
                    </select>
                </div>
                <div className="flex items-center gap-3 px-2 py-2 mt-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <span className="text-xs font-bold text-indigo-400">AI</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-300">Powered by Groq</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

