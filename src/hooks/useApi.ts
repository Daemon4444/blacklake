import { useCallback, useRef, useState } from "react";
import { Snapshot } from "../data";

export function useApi(userId: string) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number>(undefined);

  function toast(message: string) {
    setNotice(message);
    setError(null);
    clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setNotice(null), 3200);
  }

  const request = useCallback(async <T>(path: string, uid: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(path, {
      headers: { "content-type": "application/json", "x-user-id": uid },
      ...options,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }, []);

  const refresh = useCallback(async (uid = userId) => {
    const next = await request<Snapshot>("/api/snapshot", uid);
    setSnapshot(next);
    return next;
  }, [userId, request]);

  const mutate = useCallback(async (path: string, label: string) => {
    setBusy(label);
    try {
      const next = await request<Snapshot>(path, userId, { method: "POST", body: "{}" });
      setSnapshot(next);
      toast("操作已写入事件流与审计日志");
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setBusy(null);
    }
  }, [userId, request]);

  return { snapshot, setSnapshot, busy, setBusy, notice, error, setError, toast, request, refresh, mutate };
}
