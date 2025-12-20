import axios from 'axios';

const API_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Authenticated API instance (for protected routes)
const api = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true, // Important for cookies/auth
});

// Public API instance (for public routes - categories, products, blogs)
// Doesn't send credentials to avoid 401 errors on public endpoints
const publicApi = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: false, // No credentials for public endpoints
});

export default api;
export { publicApi };
