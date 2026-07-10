export interface AgentResult {
  agent: string;
  summary: string;
  data: Record<string, unknown>;
  confidence: number;
  timestampMs: number;
}

export interface TimelineEvent {
  horizon: "short_term" | "mid_term" | "long_term";
  label: string;
  description: string;
  probability: number;
}

export interface FinalDecision {
  action: "BUY" | "SELL" | "HOLD" | "WATCH";
  confidence: number;
  rationale: string;
  risks: string[];
  timeline: TimelineEvent[];
}

export interface AnalysisRunResponse {
  runId: string;
  ticker: string;
  outputs: Record<string, AgentResult>;
  finalDecision: FinalDecision | null;
}

export interface BoardVoice {
  persona: string;
  position: string;
  argument: string;
}
