"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAgentStream } from "@/hooks/useAgentStream";
import { apiFetch, ApiError } from "@/lib/api";
import { AnalysisRunResponse } from "@/lib/types";
import { TickerForm, NexusMode } from "@/components/dashboard/TickerForm";
import { LiveAgentMonitor } from "@/components/dashboard/LiveAgentMonitor";
import { ResultsPanel } from "@/components/dashboard/ResultsPanel";

export default function DashboardPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const { events, connected, clear } = useAgentStream(token);

  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<NexusMode>("investor");
  const [result, setResult] = useState<AnalysisRunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  async function handleAnalyze(ticker: string, companyName: string, selectedMode: NexusMode) {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    clear();
    setMode(selectedMode);
    try {
      const response = await apiFetch<AnalysisRunResponse>("/api/agents/analyze", {
        method: "POST",
        token,
        body: { ticker, companyName: companyName || undefined, mode: selectedMode },
      });
      setResult(response);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Analysis failed. Check that the backend is running and GEMINI_API_KEY is set."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-nexus-void flex items-center justify-center">
        <p className="hud-label animate-pulseGlow">connecting to nexus…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-nexus-void bg-nexus-radial pb-24">
      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-nexus-accent/10">
        <div>
          <p className="font-display text-xl tracking-tight">NEXUS</p>
          <p className="hud-label">Command Center</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-nexus-muted">
            {user.name} · <span className="uppercase text-xs">{user.role}</span>
          </span>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-xs font-mono uppercase tracking-widest text-nexus-muted hover:text-nexus-warn transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 md:px-0 mt-10 space-y-6">
        <TickerForm onSubmit={handleAnalyze} submitting={submitting} />

        {(submitting || events.length > 0) && (
          <LiveAgentMonitor events={events} connected={connected} />
        )}

        {error && (
          <div className="bg-nexus-warn/10 border border-nexus-warn/40 rounded-sm p-4 text-nexus-warn text-sm">
            {error}
          </div>
        )}

        {result && token && <ResultsPanel result={result} mode={mode} token={token} />}
      </div>
    </main>
  );
}
