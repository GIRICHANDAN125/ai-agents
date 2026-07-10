export interface AgentContext {
  ticker: string;
  companyName?: string;
  mode: "investor" | "ceo" | "student";
  priorOutputs: Record<string, unknown>;
}

export interface AgentResult {
  agent: string;
  summary: string;
  data: Record<string, unknown>;
  confidence: number; // 0-100
  timestampMs: number;
}

export type AgentFn = (ctx: AgentContext) => Promise<AgentResult>;
