"use client";

import { AgentEvent } from "@/hooks/useAgentStream";

const AGENT_ORDER = [
  "research",
  "news",
  "financial",
  "macro",
  "risk",
  "sentiment",
  "forecast",
  "memory",
  "decision",
  "ceo",
];

interface LiveAgentMonitorProps {
  events: AgentEvent[];
  connected: boolean;
}

export function LiveAgentMonitor({ events, connected }: LiveAgentMonitorProps) {
  const completedAgents = new Set(
    events.filter((e) => e.type === "agent_complete").map((e) => e.agentName as string)
  );
  const isRunning = events.some((e) => e.type === "run_started") && !events.some((e) => e.type === "run_completed");

  return (
    <div className="bg-nexus-panel border border-nexus-accent/15 rounded-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="hud-label">Live Agent Monitor</p>
        <span
          className={`text-xs font-mono px-2 py-1 rounded-sm ${
            connected ? "text-nexus-signal border border-nexus-signal/40" : "text-nexus-muted border border-nexus-muted/30"
          }`}
        >
          {connected ? "● LINK ACTIVE" : "○ OFFLINE"}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {AGENT_ORDER.map((agent) => {
          const done = completedAgents.has(agent);
          const active = isRunning && !done;
          return (
            <div
              key={agent}
              className={`border rounded-sm px-3 py-3 text-center transition-colors ${
                done
                  ? "border-nexus-signal/50 bg-nexus-signal/5"
                  : active
                  ? "border-nexus-accent/60 animate-pulseGlow"
                  : "border-nexus-accent/10"
              }`}
            >
              <p className="text-xs font-mono uppercase tracking-widest">{agent}</p>
              <p className="text-[10px] mt-1 text-nexus-muted">
                {done ? "complete" : active ? "running…" : "idle"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
