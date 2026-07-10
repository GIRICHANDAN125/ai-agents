import { Router } from "express";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { getDb } from "../db/database";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware";
import { ApiError } from "../middleware/errorHandler";
import { runInvestmentGraph } from "../graph/investmentGraph";
import { logger } from "../services/logger.service";
import { broadcastAgentEvent } from "../ws/liveMonitor";

const router = Router();

const startAnalysisSchema = z.object({
  ticker: z.string().min(1).max(10),
  companyName: z.string().optional(),
  mode: z.enum(["investor", "ceo", "student"]).default("investor"),
});

/**
 * POST /api/agents/analyze
 * Kicks off the full 10-agent NEXUS investment graph for a ticker.
 * Streams per-agent progress over the "Live Agent Monitor" websocket channel
 * while returning the complete synthesized result once the graph finishes.
 */
router.post("/analyze", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsed = startAnalysisSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(", "));
    }
    const { ticker, companyName, mode } = parsed.data;
    const userId = req.user!.id;

    const db = getDb();
    await db.read();

    const runId = uuid();
    const run = {
      id: runId,
      userId,
      ticker: ticker.toUpperCase(),
      mode,
      status: "running" as const,
      agentOutputs: {},
      finalDecision: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    db.data.analysisRuns.push(run);
    await db.write();

    broadcastAgentEvent(userId, { type: "run_started", runId, ticker: run.ticker });

    const outputs = await runInvestmentGraph({
      ticker: ticker.toUpperCase(),
      companyName,
      mode,
      onAgentComplete: (agentName, result) => {
        broadcastAgentEvent(userId, { type: "agent_complete", runId, agentName, result });
      },
    });

    const finalDecision = outputs.ceo
      ? {
          action: (outputs.decision?.data as any)?.action ?? "WATCH",
          confidence: outputs.ceo.confidence,
          rationale: (outputs.ceo.data as any)?.finalVerdict ?? outputs.ceo.summary,
          risks: (outputs.decision?.data as any)?.risks ?? [],
          timeline: (outputs.forecast?.data as any)?.timeline ?? [],
        }
      : null;

    const updatedRun = db.data.analysisRuns.find((r) => r.id === runId)!;
    updatedRun.status = "completed";
    updatedRun.agentOutputs = outputs;
    updatedRun.finalDecision = finalDecision;
    updatedRun.completedAt = new Date().toISOString();
    await db.write();

    broadcastAgentEvent(userId, { type: "run_completed", runId, finalDecision });

    res.json({ runId, ticker: run.ticker, outputs, finalDecision });
  } catch (err) {
    logger.error("Analysis run failed", { error: (err as Error).message });
    next(err);
  }
});

router.get("/runs", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDb();
    await db.read();
    const runs = db.data.analysisRuns
      .filter((r) => r.userId === req.user!.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json(runs);
  } catch (err) {
    next(err);
  }
});

router.get("/runs/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDb();
    await db.read();
    const run = db.data.analysisRuns.find(
      (r) => r.id === req.params.id && r.userId === req.user!.id
    );
    if (!run) throw new ApiError(404, "Analysis run not found");
    res.json(run);
  } catch (err) {
    next(err);
  }
});

router.get("/memory/:ticker", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDb();
    await db.read();
    const memories = db.data.memory.filter(
      (m) => m.ticker.toUpperCase() === req.params.ticker.toUpperCase()
    );
    res.json(memories);
  } catch (err) {
    next(err);
  }
});

export default router;
