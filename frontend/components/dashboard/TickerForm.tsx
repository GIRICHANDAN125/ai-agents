"use client";

import { useState } from "react";

export type NexusMode = "investor" | "ceo" | "student";

interface TickerFormProps {
  onSubmit: (ticker: string, companyName: string, mode: NexusMode) => void;
  submitting: boolean;
}

const MODES: { value: NexusMode; label: string; description: string }[] = [
  { value: "investor", label: "Investor Mode", description: "Full agent findings + decision" },
  { value: "ceo", label: "CEO Mode", description: "Board debate + executive verdict" },
  { value: "student", label: "Student Mode", description: "Explain-like-I'm-five view" },
];

export function TickerForm({ onSubmit, submitting }: TickerFormProps) {
  const [ticker, setTicker] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [mode, setMode] = useState<NexusMode>("investor");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!ticker.trim()) return;
        onSubmit(ticker.trim().toUpperCase(), companyName.trim(), mode);
      }}
      className="bg-nexus-panel border border-nexus-accent/15 rounded-sm p-6"
    >
      <p className="hud-label mb-4">Run New Analysis</p>
      <div className="flex flex-col md:flex-row gap-3">
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Ticker (e.g. AAPL)"
          maxLength={10}
          className="flex-1 bg-nexus-abyss border border-nexus-accent/20 rounded-sm px-4 py-3 text-sm outline-none focus:border-nexus-accent transition-colors uppercase"
        />
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company name (optional)"
          className="flex-1 bg-nexus-abyss border border-nexus-accent/20 rounded-sm px-4 py-3 text-sm outline-none focus:border-nexus-accent transition-colors"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-nexus-accent text-nexus-void font-mono text-sm uppercase tracking-widest rounded-sm hover:bg-nexus-signal transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {submitting ? "Running 10 agents…" : "Analyze"}
        </button>
      </div>

      <div className="flex gap-3 mt-4">
        {MODES.map((m) => (
          <button
            type="button"
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`flex-1 text-left px-4 py-2 rounded-sm border transition-colors ${
              mode === m.value
                ? "border-nexus-accent bg-nexus-accent/10"
                : "border-nexus-accent/15 hover:border-nexus-accent/40"
            }`}
          >
            <span className="text-sm font-medium block">{m.label}</span>
            <span className="text-xs text-nexus-muted">{m.description}</span>
          </button>
        ))}
      </div>
    </form>
  );
}
