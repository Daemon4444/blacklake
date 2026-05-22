import { useEffect, useRef } from "react";

export function useSSE(userId: string, authenticated: boolean, onMessage: () => void) {
  const cbRef = useRef(onMessage);
  cbRef.current = onMessage;

  useEffect(() => {
    if (!authenticated) return undefined;
    const stream = new EventSource(`/api/events/stream?userId=${userId}`);
    stream.onmessage = () => cbRef.current();
    stream.onerror = () => stream.close();
    return () => stream.close();
  }, [authenticated, userId]);
}
