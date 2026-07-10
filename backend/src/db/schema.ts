export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "investor" | "ceo" | "student" | "admin";
  createdAt: string;
}

export interface AnalysisRunRecord {
  id: string;
  userId: string;
  ticker: string;
  mode: "investor" | "ceo" | "student";
  status: "pending" | "running" | "completed" | "failed";
  agentOutputs: Record<string, unknown>;
  finalDecision: FinalDecision | null;
  createdAt: string;
  completedAt: string | null;
}

export interface FinalDecision {
  action: "BUY" | "SELL" | "HOLD" | "WATCH";
  confidence: number; // 0-100
  rationale: string;
  risks: string[];
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  horizon: "short_term" | "mid_term" | "long_term";
  label: string;
  description: string;
  probability: number;
}

export interface MemoryEntry {
  id: string;
  ticker: string;
  insight: string;
  source: string;
  createdAt: string;
}

export interface NexusDBSchema {
  users: UserRecord[];
  analysisRuns: AnalysisRunRecord[];
  memory: MemoryEntry[];
}

export const defaultData: NexusDBSchema = {
  users: [],
  analysisRuns: [],
  memory: [],
};
