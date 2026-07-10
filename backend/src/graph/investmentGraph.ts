import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { researchAgent } from "../agents/research.agent";
import { newsAgent } from "../agents/news.agent";
import { financialAgent } from "../agents/financial.agent";
import { macroAgent } from "../agents/macro.agent";
import { riskAgent } from "../agents/risk.agent";
import { sentimentAgent } from "../agents/sentiment.agent";
import { forecastAgent } from "../agents/forecast.agent";
import { memoryAgent } from "../agents/memory.agent";
import { decisionAgent } from "../agents/decision.agent";
import { ceoAgent } from "../agents/ceo.agent";
import { AgentContext, AgentResult } from "../agents/types";
import { logger } from "../services/logger.service";

/**
 * NEXUS Investment Graph
 * -----------------------------------------------------------------------
 * Stage 1 (parallel/independent): Research, News, Financial, Macro
 * Stage 2 (depends on Stage 1):   Risk, Sentiment
 * Stage 3 (depends on Stage 1+2): Forecast, Memory
 * Stage 4 (synthesis):            Decision
 * Stage 5 (board review):        CEO
 *
 * Each node runs an independent agent and merges its typed result into
 * shared graph state under `outputs.<agentName>`, so downstream agents can
 * read everything produced so far.
 */

const NexusState = Annotation.Root({
  ticker: Annotation<string>(),
  companyName: Annotation<string | undefined>(),
  mode: Annotation<"investor" | "ceo" | "student">(),
  outputs: Annotation<Record<string, AgentResult>>({
    reducer: (current, update) => ({ ...current, ...update }),
    default: () => ({}),
  }),
});

type NexusStateType = typeof NexusState.State;

function toContext(state: NexusStateType): AgentContext {
  return {
    ticker: state.ticker,
    companyName: state.companyName,
    mode: state.mode,
    priorOutputs: Object.fromEntries(
      Object.entries(state.outputs).map(([k, v]) => [k, v.data])
    ),
  };
}

function makeNode(name: string, agentFn: (ctx: AgentContext) => Promise<AgentResult>) {
  return async (state: NexusStateType) => {
    logger.info(`[graph] running agent: ${name}`, { ticker: state.ticker });
    const result = await agentFn(toContext(state));
    return { outputs: { [name]: result } };
  };
}

export function buildInvestmentGraph() {
  const graph = new StateGraph(NexusState)
    .addNode("research", makeNode("research", researchAgent))
    .addNode("news", makeNode("news", newsAgent))
    .addNode("financial", makeNode("financial", financialAgent))
    .addNode("macro", makeNode("macro", macroAgent))
    .addNode("risk", makeNode("risk", riskAgent))
    .addNode("sentiment", makeNode("sentiment", sentimentAgent))
    .addNode("forecast", makeNode("forecast", forecastAgent))
    .addNode("memory", makeNode("memory", memoryAgent))
    .addNode("decision", makeNode("decision", decisionAgent))
    .addNode("ceo", makeNode("ceo", ceoAgent))
    // Stage 1: independent agents fan out from START
    .addEdge(START, "research")
    .addEdge(START, "news")
    .addEdge(START, "financial")
    .addEdge(START, "macro")
    // Stage 2: risk + sentiment need stage 1 context
    .addEdge("research", "risk")
    .addEdge("financial", "risk")
    .addEdge("news", "sentiment")
    .addEdge("macro", "sentiment")
    // Stage 3: forecast + memory need stage 1+2
    .addEdge("risk", "forecast")
    .addEdge("sentiment", "forecast")
    .addEdge("risk", "memory")
    .addEdge("sentiment", "memory")
    // Stage 4: decision needs everything
    .addEdge("forecast", "decision")
    .addEdge("memory", "decision")
    // Stage 5: CEO board review has final word
    .addEdge("decision", "ceo")
    .addEdge("ceo", END);

  return graph.compile();
}

export interface RunInvestmentGraphParams {
  ticker: string;
  companyName?: string;
  mode: "investor" | "ceo" | "student";
  onAgentComplete?: (agentName: string, result: AgentResult) => void;
}

/**
 * Runs the full multi-agent graph to completion and returns all agent
 * outputs keyed by agent name, in the order they were produced.
 */
export async function runInvestmentGraph(
  params: RunInvestmentGraphParams
): Promise<Record<string, AgentResult>> {
  const app = buildInvestmentGraph();

  const finalState = await app.invoke(
    {
      ticker: params.ticker,
      companyName: params.companyName,
      mode: params.mode,
      outputs: {},
    },
    {
      // Stream node-by-node so callers (e.g. websocket "Live Agent Monitor") can
      // surface progress as each agent finishes, rather than waiting on the whole graph.
      configurable: {},
    }
  );

  if (params.onAgentComplete) {
    for (const [name, result] of Object.entries(finalState.outputs)) {
      params.onAgentComplete(name, result);
    }
  }

  return finalState.outputs;
}
