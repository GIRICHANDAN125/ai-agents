import { callGeminiJSON } from "../services/gemini.service";
import { AgentContext, AgentResult } from "./types";

interface BoardVoice {
  persona: string;
  position: string;
  argument: string;
}

interface CeoOutput {
  summary: string;
  debate: BoardVoice[];
  finalVerdict: string;
  confidenceAdjustment: number; // -20..+20 applied on top of decision agent's confidence
  explainLikeImFive: string;
}

/**
 * The CEO Agent powers the "AI Board of Directors" and "Debate Engine" features.
 * It stages a short structured debate between three board personas (Growth Advocate,
 * Risk Skeptic, Macro Realist) before rendering a final executive verdict.
 */
export async function ceoAgent(ctx: AgentContext): Promise<AgentResult> {
  const prior = JSON.stringify(ctx.priorOutputs).slice(0, 6000);
  const prompt = `You are orchestrating the NEXUS AI Board of Directors for "${ctx.ticker}".
Stage a short debate between three board personas using the evidence below:
Evidence: ${prior}
Personas:
1. "Growth Advocate" - argues from opportunity and upside.
2. "Risk Skeptic" - argues from downside and hidden risk.
3. "Macro Realist" - argues from cycle timing and macro context.
Each gets ONE argument (2-3 sentences), grounded in the evidence, not generic platitudes.
Then render a CEO final verdict that reconciles the debate, plus a confidenceAdjustment (integer -20 to +20) to apply to the Decision Agent's confidence score, and an "explain like I'm five" one-paragraph version for the Student Mode feature.
Return strict JSON:
{
  "summary": string,
  "debate": [{"persona": string, "position": string, "argument": string}, ...3 items],
  "finalVerdict": string,
  "confidenceAdjustment": integer,
  "explainLikeImFive": string
}
Raw JSON only.`;

  const result = await callGeminiJSON<CeoOutput>(prompt, {
    systemInstruction:
      "You are the CEO Agent chairing an AI board debate. Keep each persona's argument distinct and evidence-grounded; do not let them agree trivially.",
    temperature: 0.6,
  });

  return {
    agent: "ceo",
    summary: result.finalVerdict,
    data: result as unknown as Record<string, unknown>,
    confidence: Math.max(0, Math.min(100, 70 + result.confidenceAdjustment)),
    timestampMs: Date.now(),
  };
}
