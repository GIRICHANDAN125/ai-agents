import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import jwt from "jsonwebtoken";
import { logger } from "../services/logger.service";

const JWT_SECRET = process.env.JWT_SECRET || "insecure_dev_secret";

// Maps userId -> set of connected sockets, so a user can have the Live Agent
// Monitor open in multiple tabs/devices and receive the same events.
const connections = new Map<string, Set<WebSocket>>();

export function initLiveMonitor(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/agents" });

  wss.on("connection", (socket, request) => {
    const url = new URL(request.url || "", "http://localhost");
    const token = url.searchParams.get("token");

    let userId: string | null = null;
    try {
      if (token) {
        const payload = jwt.verify(token, JWT_SECRET) as { id: string };
        userId = payload.id;
      }
    } catch {
      socket.close(4001, "Invalid token");
      return;
    }

    if (!userId) {
      socket.close(4001, "Missing token");
      return;
    }

    if (!connections.has(userId)) connections.set(userId, new Set());
    connections.get(userId)!.add(socket);
    logger.info(`Live monitor connected`, { userId });

    socket.on("close", () => {
      connections.get(userId!)?.delete(socket);
    });

    socket.send(JSON.stringify({ type: "connected", message: "NEXUS live agent monitor online" }));
  });

  return wss;
}

export function broadcastAgentEvent(userId: string, event: Record<string, unknown>) {
  const sockets = connections.get(userId);
  if (!sockets) return;
  const payload = JSON.stringify(event);
  for (const socket of sockets) {
    if (socket.readyState === WebSocket.OPEN) socket.send(payload);
  }
}
