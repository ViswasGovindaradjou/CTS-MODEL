import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Bearer Token from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const appLang = localStorage.getItem('app_language') || 'en';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Accept-Language'] = appLang;
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor for global error logging and 401 handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default API;
