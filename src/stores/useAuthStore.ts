import { create } from "zustand";
import type { User } from "../types";
import api from "../services/api";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadUser: () => Promise<void>;
  switchUser: (userId: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  login: async (userId, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post("/auth/login", { userId, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", userId);
      set({ user: data.user, token: data.token, loading: false });
      return true;
    } catch { set({ loading: false }); return false; }
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    set({ user: null, token: null });
  },
  loadUser: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data });
    } catch { set({ user: null, token: null }); }
  },
  switchUser: (userId) => {
    localStorage.setItem("userId", userId);
  },
}));
