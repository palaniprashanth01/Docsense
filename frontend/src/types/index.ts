export interface FileInfo {
    name: string;
    size: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ContextDoc {
    page_content: string;
    metadata: Record<string, any>;
}

export interface ChatResponse {
    answer: string;
    context_docs: ContextDoc[];
}

export interface QuestionResponse {
    questions: string[];
}
