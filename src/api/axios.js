import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    const status  = error.response?.status;
    const url     = error.config?.url || '';

    if (status === 401) {
      // Only clear token + redirect if it's NOT the login/register/me call
      const isAuthCall = url.includes('/auth/login')
        || url.includes('/auth/register')
        || url.includes('/auth/me');

      if (!isAuthCall) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
        // Delay redirect slightly so toast shows
        setTimeout(() => { window.location.href = '/login'; }, 1000);
      }
      // For auth calls, just reject — let the page handle the error
    } else if (status === 403) {
      toast.error(message);
    } else if (status === 429) {
      toast.error('Too many requests. Please slow down.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again.');
    } else if (!error.response) {
      toast.error('Network error. Check your connection and that the backend is running.');
    }

    return Promise.reject(error);
  }
);

export default api;