import { callGeminiJSON } from "../services/gemini.service";
import { AgentContext, AgentResult } from "./types";

interface SentimentOutput {
  summary: string;
  overallSentiment: "bullish" | "neutral" | "bearish";
  retailVsInstitutional: string;
  confidence: number;
}

export async function sentimentAgent(ctx: AgentContext): Promise<AgentResult> {
  const prior = JSON.stringify(ctx.priorOutputs).slice(0, 3000);
  const prompt = `You are the Sentiment Agent inside NEXUS. Given the prior findings below for "${ctx.ticker}", infer the likely market sentiment posture.
Prior findings: ${prior}
Return strict JSON: summary (string), overallSentiment ("bullish"|"neutral"|"bearish"), retailVsInstitutional (string describing likely divergence), confidence (integer 0-100).
Raw JSON only.`;

  const result = await callGeminiJSON<SentimentOutput>(prompt, {
    systemInstruction: "You are a market psychology and positioning specialist.",
  });

  return {
    agent: "sentiment",
    summary: result.summary,
    data: result as unknown as Record<string, unknown>,
    confidence: result.confidence,
    timestampMs: Date.now(),
  };
}
