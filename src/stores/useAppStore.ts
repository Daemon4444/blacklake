import { create } from "zustand";
import type { Snapshot } from "../types";
import api from "../services/api";

interface AppState {
  snapshot: Snapshot | null;
  loading: boolean;
  sideCollapsed: boolean;
  lastFetchAt: number;
  fetchSnapshot: (force?: boolean) => Promise<void>;
  setSideCollapsed: (v: boolean) => void;
}

// 5 秒内重复调用直接复用上次结果，避免页面切换时重复拉 22KB
const CACHE_MS = 5000;

export const useAppStore = create<AppState>((set, get) => ({
  snapshot: null,
  loading: false,
  sideCollapsed: false,
  lastFetchAt: 0,
  fetchSnapshot: async (force = false) => {
    const { lastFetchAt, snapshot, loading } = get();
    if (loading) return;
    if (!force && snapshot && Date.now() - lastFetchAt < CACHE_MS) return;
    set({ loading: true });
    try {
      const { data } = await api.get("/snapshot");
      set({ snapshot: data, loading: false, lastFetchAt: Date.now() });
    } catch { set({ loading: false }); }
  },
  setSideCollapsed: (v) => set({ sideCollapsed: v }),
}));
