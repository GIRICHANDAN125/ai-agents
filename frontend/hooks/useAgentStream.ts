"use client";

import { useEffect, useRef, useState } from "react";
import { WS_BASE_URL } from "@/lib/api";

export interface AgentEvent {
  type: "connected" | "run_started" | "agent_complete" | "run_completed";
  [key: string]: unknown;
}

/**
 * Subscribes to the NEXUS Live Agent Monitor websocket channel. Powers the
 * "Live Agent Monitor" dashboard feature by streaming each agent's completion
 * event in real time as the LangGraph workflow executes on the backend.
 */
export function useAgentStream(token: string | null) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(`${WS_BASE_URL}/ws/agents?token=${encodeURIComponent(token)}`);
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (message) => {
      try {
        const parsed = JSON.parse(message.data) as AgentEvent;
        setEvents((prev) => [...prev, parsed]);
      } catch {
        // ignore malformed frames
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [token]);

  const clear = () => setEvents([]);

  return { events, connected, clear };
}
