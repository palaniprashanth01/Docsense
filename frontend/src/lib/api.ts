import axios from 'axios';
import type { FileInfo, ChatResponse, QuestionResponse } from '../types';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
});

export async function uploadFile(file: File): Promise<{ filename: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.detail || 'Upload failed');
    }
}

export async function listFiles(): Promise<FileInfo[]> {
    try {
        const res = await api.get('/files');
        return res.data;
    } catch (error) {
        throw new Error('Failed to list files');
    }
}

export async function deleteFile(filename: string): Promise<void> {
    try {
        await api.delete(`/files/${filename}`);
    } catch (error) {
        throw new Error('Failed to delete file');
    }
}

export async function chat(question: string, model_name: string = "llama-3.3-70b-versatile"): Promise<ChatResponse> {
    try {
        const res = await api.post('/chat', { question, model_name });
        return res.data;
    } catch (error) {
        throw new Error('Chat failed');
    }
}

export async function getQuestions(filename: string): Promise<QuestionResponse> {
    try {
        const res = await api.get(`/questions/${filename}`);
        return res.data;
    } catch (error) {
        throw new Error('Failed to get questions');
    }
}
