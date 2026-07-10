"use client";

import { AnalysisRunResponse, BoardVoice } from "@/lib/types";
import { downloadReportUrl } from "@/lib/api";
import { NexusMode } from "./TickerForm";

interface ResultsPanelProps {
  result: AnalysisRunResponse;
  mode: NexusMode;
  token: string;
}

const ACTION_COLORS: Record<string, string> = {
  BUY: "text-nexus-signal border-nexus-signal/50",
  SELL: "text-nexus-warn border-nexus-warn/50",
  HOLD: "text-nexus-accent border-nexus-accent/50",
  WATCH: "text-nexus-muted border-nexus-muted/50",
};

export function ResultsPanel({ result, mode, token }: ResultsPanelProps) {
  const { outputs, finalDecision } = result;
  const ceoData = outputs.ceo?.data as { debate?: BoardVoice[]; explainLikeImFive?: string } | undefined;

  return (
    <div className="space-y-6">
      {finalDecision && (
        <div className="bg-nexus-panel border border-nexus-accent/15 rounded-sm p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="hud-label mb-2">Final Decision · {result.ticker}</p>
              <span
                className={`inline-block text-2xl font-display font-medium border rounded-sm px-4 py-1 ${
                  ACTION_COLORS[finalDecision.action] || "text-nexus-text"
                }`}
              >
                {finalDecision.action}
              </span>
              <span className="ml-3 text-nexus-muted text-sm">
                {finalDecision.confidence}% confidence
              </span>
            </div>
            <a
              href={`${downloadReportUrl(result.runId)}`}
              onClick={(e) => {
                // Report endpoint requires auth; fetch as blob then trigger download
                e.preventDefault();
                fetch(downloadReportUrl(result.runId), {
                  headers: { Authorization: `Bearer ${token}` },
                })
                  .then((res) => res.blob())
                  .then((blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `NEXUS-Report-${result.ticker}.pdf`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  });
              }}
              className="px-5 py-2 border border-nexus-accent/40 rounded-sm text-sm font-mono uppercase tracking-widest hover:border-nexus-accent transition-colors"
            >
              Download PDF Report
            </a>
          </div>
          <p className="mt-4 text-nexus-text leading-relaxed">{finalDecision.rationale}</p>

          {finalDecision.risks?.length > 0 && (
            <div className="mt-4">
              <p className="hud-label mb-2">Key Risks</p>
              <ul className="space-y-1">
                {finalDecision.risks.map((risk, i) => (
                  <li key={i} className="text-sm text-nexus-muted">
                    · {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {finalDecision.timeline?.length > 0 && (
            <div className="mt-4 grid md:grid-cols-3 gap-3">
              {finalDecision.timeline.map((t, i) => (
                <div key={i} className="border border-nexus-accent/10 rounded-sm p-3">
                  <p className="text-xs font-mono uppercase text-nexus-accent">
                    {t.horizon.replace("_", " ")}
                  </p>
                  <p className="text-sm font-medium mt-1">{t.label}</p>
                  <p className="text-xs text-nexus-muted mt-1">{t.description}</p>
                  <p className="text-xs text-nexus-signal mt-1">{t.probability}% probability</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "student" && ceoData?.explainLikeImFive && (
        <div className="bg-nexus-panel border border-nexus-accent/15 rounded-sm p-6">
          <p className="hud-label mb-3">Explain Like I'm Five</p>
          <p className="text-nexus-text leading-relaxed">{ceoData.explainLikeImFive}</p>
        </div>
      )}

      {mode === "ceo" && ceoData?.debate && (
        <div className="bg-nexus-panel border border-nexus-accent/15 rounded-sm p-6">
          <p className="hud-label mb-4">AI Board Debate</p>
          <div className="space-y-4">
            {ceoData.debate.map((voice, i) => (
              <div key={i} className="border-l-2 border-nexus-accent/40 pl-4">
                <p className="font-mono text-xs uppercase tracking-widest text-nexus-signal">
                  {voice.persona} · <span className="text-nexus-muted">{voice.position}</span>
                </p>
                <p className="text-sm text-nexus-text mt-1">{voice.argument}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-nexus-panel border border-nexus-accent/15 rounded-sm p-6">
        <p className="hud-label mb-4">Agent Findings</p>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.values(outputs).map((agent) => (
            <div key={agent.agent} className="border border-nexus-accent/10 rounded-sm p-4">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-widest text-nexus-accent">
                  {agent.agent}
                </p>
                <span className="text-xs text-nexus-muted">{agent.confidence}%</span>
              </div>
              <p className="text-sm text-nexus-text mt-2 leading-relaxed">{agent.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
