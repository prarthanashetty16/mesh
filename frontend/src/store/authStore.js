import { create } from 'zustand';

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('mesh_user')); } catch { return null; }
};

export const useAuthStore = create((set) => ({
  user:  getStoredUser(),
  token: localStorage.getItem('mesh_token') || null,

  login(user, token) {
    localStorage.setItem('mesh_token', token);
    localStorage.setItem('mesh_user', JSON.stringify(user));
    set({ user, token });
  },

  logout() {
    localStorage.removeItem('mesh_token');
    localStorage.removeItem('mesh_user');
    set({ user: null, token: null });
  },

  setUser(user) {
    localStorage.setItem('mesh_user', JSON.stringify(user));
    set({ user });
  },
}));
