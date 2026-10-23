import axios from 'axios';

// When running on production, default to deployed Render backend if environment variable is not injected
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://exam-portal-api-k39z.onrender.com' : '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout to allow free-tier cloud instances time to wake up smoothly
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('exam_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't clear on login attempt failures
      if (!error.config.url.includes('/api/v1/auth/login')) {
        localStorage.removeItem('exam_token');
        localStorage.removeItem('exam_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
