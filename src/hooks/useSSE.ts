import { useEffect, useRef } from "react";
import { useAppStore } from "../stores/useAppStore";

// SSE 推送会很密集，使用节流（最少 3 秒间隔）触发 snapshot 刷新，避免不停拉 22KB 数据
export function useSSE() {
  const fetchSnapshot = useAppStore((s) => s.fetchSnapshot);
  const lastFetchAt = useRef(0);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/events/stream");
    es.onmessage = () => {
      const now = Date.now();
      const elapsed = now - lastFetchAt.current;
      if (elapsed > 3000) {
        lastFetchAt.current = now;
        fetchSnapshot();
      } else if (!pending.current) {
        pending.current = setTimeout(() => {
          lastFetchAt.current = Date.now();
          pending.current = null;
          fetchSnapshot();
        }, 3000 - elapsed);
      }
    };
    es.onerror = () => { setTimeout(() => es.close(), 5000); };
    return () => {
      es.close();
      if (pending.current) clearTimeout(pending.current);
    };
  }, [fetchSnapshot]);
}
