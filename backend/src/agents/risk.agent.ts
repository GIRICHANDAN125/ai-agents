import { callGeminiJSON } from "../services/gemini.service";
import { AgentContext, AgentResult } from "./types";

interface RiskOutput {
  summary: string;
  hiddenRisks: string[];
  regulatoryExposure: "high" | "medium" | "low";
  concentrationRisk: string;
  confidence: number;
}

export async function riskAgent(ctx: AgentContext): Promise<AgentResult> {
  const prior = JSON.stringify(ctx.priorOutputs).slice(0, 4000);
  const prompt = `You are the Risk Agent inside NEXUS, specialized in hidden risk detection. Using the prior agent findings below, surface risks that are easy to overlook for "${ctx.ticker}".
Prior findings: ${prior}
Return strict JSON: summary (string), hiddenRisks (string array, 3-6 non-obvious risks), regulatoryExposure ("high"|"medium"|"low"), concentrationRisk (string, e.g. customer/supplier/geographic concentration), confidence (integer 0-100).
Raw JSON only.`;

  const result = await callGeminiJSON<RiskOutput>(prompt, {
    systemInstruction:
      "You are a skeptical risk officer whose job is to find what optimistic analysts miss. Prioritize non-obvious, structural risks over generic ones.",
  });

  return {
    agent: "risk",
    summary: result.summary,
    data: result as unknown as Record<string, unknown>,
    confidence: result.confidence,
    timestampMs: Date.now(),
  };
}
