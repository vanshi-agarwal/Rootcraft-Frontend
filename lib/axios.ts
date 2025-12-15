import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true, // Important for cookies
});

export default api;
