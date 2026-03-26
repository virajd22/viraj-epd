import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Backend URL
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('auth-storage');
  if (userStr) {
    try {
      const user = JSON.parse(userStr)?.state?.user;
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch(e) { console.error('Error parsing auth storage', e); }
  }
  return config;
});

export default api;
