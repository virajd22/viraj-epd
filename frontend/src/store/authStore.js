import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axiosConfig';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        set({ user: res.data, isAuthenticated: true });
        return res.data;
      },
      register: async (userData) => {
        const res = await api.post('/auth/register', userData);
        set({ user: res.data, isAuthenticated: true });
        return res.data;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // name of item in the storage (must be unique)
    }
  )
);
