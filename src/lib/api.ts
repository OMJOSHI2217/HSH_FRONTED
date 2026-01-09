import axios from 'axios';

// 1. Define the Backend URL (Dynamic)
// - If VITE_API_URL is set in .env, use it.
// - If PROD (Vercel), use configured URL.
// - If DEV (Localhost), use Local Backend.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
