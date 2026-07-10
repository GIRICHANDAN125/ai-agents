import { callGeminiJSON } from "../services/gemini.service";
import { AgentContext, AgentResult } from "./types";

interface MacroOutput {
  summary: string;
  rateSensitivity: "high" | "medium" | "low";
  sectorTailwinds: string[];
  sectorHeadwinds: string[];
  confidence: number;
}

export async function macroAgent(ctx: AgentContext): Promise<AgentResult> {
  const prompt = `You are the Macro Economy Agent inside NEXUS. Evaluate how broad macroeconomic conditions (rates, inflation, cycles) typically affect the sector that "${ctx.ticker}" operates in.
Return strict JSON: summary (string), rateSensitivity ("high"|"medium"|"low"), sectorTailwinds (string array), sectorHeadwinds (string array), confidence (integer 0-100).
Raw JSON only.`;

  const result = await callGeminiJSON<MacroOutput>(prompt, {
    systemInstruction:
      "You are a macroeconomic strategist connecting top-down conditions to sector and company-level exposure.",
    cacheKey: `macro:${ctx.ticker}`,
  });

  return {
    agent: "macro",
    summary: result.summary,
    data: result as unknown as Record<string, unknown>,
    confidence: result.confidence,
    timestampMs: Date.now(),
  };
}
