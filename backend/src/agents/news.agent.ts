import { callGeminiJSON } from "../services/gemini.service";
import { AgentContext, AgentResult } from "./types";

interface NewsOutput {
  summary: string;
  headlineThemes: string[];
  sentimentShift: "improving" | "stable" | "deteriorating";
  confidence: number;
}

export async function newsAgent(ctx: AgentContext): Promise<AgentResult> {
  const prompt = `You are the News Agent inside NEXUS. Based on your training knowledge of recent coverage patterns for "${ctx.ticker}", synthesize the kinds of headline themes that typically surround this company.
Return strict JSON: summary (string), headlineThemes (string array, 3-5 items), sentimentShift ("improving"|"stable"|"deteriorating"), confidence (integer 0-100).
Be explicit that this reflects general patterns, not live headlines, since you do not have real-time news access.
Raw JSON only, no markdown.`;

  const result = await callGeminiJSON<NewsOutput>(prompt, {
    systemInstruction:
      "You are a financial news synthesis agent. You never fabricate specific dated headlines; you describe general thematic patterns and clearly caveat recency limits.",
    cacheKey: `news:${ctx.ticker}`,
  });

  return {
    agent: "news",
    summary: result.summary,
    data: result as unknown as Record<string, unknown>,
    confidence: result.confidence,
    timestampMs: Date.now(),
  };
}
