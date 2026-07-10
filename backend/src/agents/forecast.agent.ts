import { callGeminiJSON } from "../services/gemini.service";
import { AgentContext, AgentResult } from "./types";
import { TimelineEvent } from "../db/schema";

interface ForecastOutput {
  summary: string;
  timeline: TimelineEvent[];
  alternateRealityScenario: string;
  confidence: number;
}

export async function forecastAgent(ctx: AgentContext): Promise<AgentResult> {
  const prior = JSON.stringify(ctx.priorOutputs).slice(0, 4000);
  const prompt = `You are the Forecast Agent inside NEXUS, responsible for the Future Simulator and Alternate Reality Simulation features.
Given prior findings for "${ctx.ticker}": ${prior}
Produce a plausible forward-looking investment timeline AND one alternate-reality scenario (a plausible divergent path, e.g. "if a key competitor stumbles" or "if regulation tightens").
Return strict JSON: summary (string), timeline (array of {horizon: "short_term"|"mid_term"|"long_term", label: string, description: string, probability: integer 0-100}, exactly 3 items, one per horizon), alternateRealityScenario (string), confidence (integer 0-100).
Raw JSON only.`;

  const result = await callGeminiJSON<ForecastOutput>(prompt, {
    systemInstruction:
      "You are a scenario-planning strategist. Probabilities must be your genuine calibrated estimates, not decorative numbers.",
  });

  return {
    agent: "forecast",
    summary: result.summary,
    data: result as unknown as Record<string, unknown>,
    confidence: result.confidence,
    timestampMs: Date.now(),
  };
}
