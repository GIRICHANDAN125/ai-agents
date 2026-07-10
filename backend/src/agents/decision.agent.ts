import { callGeminiJSON } from "../services/gemini.service";
import { AgentContext, AgentResult } from "./types";
import { FinalDecision } from "../db/schema";

export async function decisionAgent(ctx: AgentContext): Promise<AgentResult> {
  const prior = JSON.stringify(ctx.priorOutputs).slice(0, 6000);
  const prompt = `You are the Decision Agent inside NEXUS. Synthesize ALL prior agent findings for "${ctx.ticker}" into a single investment decision.
Prior findings from Research, News, Financial, Macro, Risk, Sentiment, Forecast, and Memory agents: ${prior}
Weigh conflicting signals explicitly rather than averaging them blindly.
Return strict JSON matching this shape:
{
  "action": "BUY" | "SELL" | "HOLD" | "WATCH",
  "confidence": integer 0-100,
  "rationale": string (3-5 sentences explaining the weighing of evidence),
  "risks": string array (top 3-5 risks carried forward),
  "timeline": array of {horizon, label, description, probability} (reuse or refine the forecast agent's timeline)
}
Raw JSON only.`;

  const decision = await callGeminiJSON<FinalDecision>(prompt, {
    systemInstruction:
      "You are the Decision Agent, the analytical synthesis layer before the CEO Agent's board review. You are rigorous, not diplomatic — call out contradictions in the evidence.",
  });

  return {
    agent: "decision",
    summary: decision.rationale,
    data: decision as unknown as Record<string, unknown>,
    confidence: decision.confidence,
    timestampMs: Date.now(),
  };
}
