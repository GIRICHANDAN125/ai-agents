import { callGeminiJSON } from "../services/gemini.service";
import { AgentContext, AgentResult } from "./types";

interface ResearchOutput {
  summary: string;
  businessModel: string;
  competitivePosition: string;
  keyProducts: string[];
  confidence: number;
}

export async function researchAgent(ctx: AgentContext): Promise<AgentResult> {
  const prompt = `You are the Research Agent inside NEXUS, an autonomous investment intelligence system.
Analyze the company with ticker "${ctx.ticker}"${ctx.companyName ? ` (${ctx.companyName})` : ""}.
Return strict JSON with keys: summary (string, 2-3 sentences), businessModel (string), competitivePosition (string), keyProducts (string array, 3-6 items), confidence (integer 0-100 reflecting how well-established this company's fundamentals are in your knowledge).
Do not include markdown formatting, only raw JSON.`;

  const result = await callGeminiJSON<ResearchOutput>(prompt, {
    systemInstruction:
      "You are a rigorous equity research analyst. Be precise, avoid speculation presented as fact, and flag uncertainty in confidence scores rather than in prose.",
    cacheKey: `research:${ctx.ticker}`,
  });

  return {
    agent: "research",
    summary: result.summary,
    data: result as unknown as Record<string, unknown>,
    confidence: result.confidence,
    timestampMs: Date.now(),
  };
}
