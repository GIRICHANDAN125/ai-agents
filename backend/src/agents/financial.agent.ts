import { callGeminiJSON } from "../services/gemini.service";
import { AgentContext, AgentResult } from "./types";

interface FinancialOutput {
  summary: string;
  revenueTrend: "growing" | "flat" | "declining";
  marginProfile: string;
  balanceSheetHealth: "strong" | "moderate" | "weak";
  valuationView: string;
  confidence: number;
}

export async function financialAgent(ctx: AgentContext): Promise<AgentResult> {
  const prompt = `You are the Financial Agent inside NEXUS. Assess the general financial profile of "${ctx.ticker}" based on your knowledge.
Return strict JSON: summary (string), revenueTrend ("growing"|"flat"|"declining"), marginProfile (string), balanceSheetHealth ("strong"|"moderate"|"weak"), valuationView (string, note this is directional not real-time), confidence (integer 0-100).
Raw JSON only.`;

  const result = await callGeminiJSON<FinancialOutput>(prompt, {
    systemInstruction:
      "You are a financial statement analyst. Distinguish clearly between durable structural traits and figures that require live data to confirm.",
    cacheKey: `financial:${ctx.ticker}`,
  });

  return {
    agent: "financial",
    summary: result.summary,
    data: result as unknown as Record<string, unknown>,
    confidence: result.confidence,
    timestampMs: Date.now(),
  };
}
