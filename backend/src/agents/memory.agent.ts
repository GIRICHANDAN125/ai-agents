import { v4 as uuid } from "uuid";
import { getDb } from "../db/database";
import { AgentContext, AgentResult } from "./types";
import { callGeminiJSON } from "../services/gemini.service";

interface DistilledInsight {
  insight: string;
}

/**
 * The Memory Agent gives NEXUS "company memory": it recalls past analysis runs
 * for the same ticker and distills the current run into a durable insight
 * that future runs can draw on.
 */
export async function memoryAgent(ctx: AgentContext): Promise<AgentResult> {
  const db = getDb();
  await db.read();

  const priorMemories = db.data.memory
    .filter((m) => m.ticker.toUpperCase() === ctx.ticker.toUpperCase())
    .slice(-5);

  const prior = JSON.stringify(ctx.priorOutputs).slice(0, 3000);
  const prompt = `You are the Memory Agent inside NEXUS. Distill the current analysis findings for "${ctx.ticker}" into ONE durable, reusable insight (a single sentence) that would be useful to recall in future analyses of this company.
Current findings: ${prior}
Return strict JSON: { "insight": string }.
Raw JSON only.`;

  const distilled = await callGeminiJSON<DistilledInsight>(prompt, {
    systemInstruction: "You compress analysis into durable institutional memory, not fleeting observations.",
  });

  const entry = {
    id: uuid(),
    ticker: ctx.ticker.toUpperCase(),
    insight: distilled.insight,
    source: "memory-agent",
    createdAt: new Date().toISOString(),
  };

  db.data.memory.push(entry);
  await db.write();

  return {
    agent: "memory",
    summary: distilled.insight,
    data: {
      newInsight: entry,
      recalledMemories: priorMemories,
    },
    confidence: priorMemories.length > 0 ? 80 : 50,
    timestampMs: Date.now(),
  };
}
