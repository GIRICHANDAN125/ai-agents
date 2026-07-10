import { Router } from "express";
import PDFDocument from "pdfkit";
import { getDb } from "../db/database";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware";
import { ApiError } from "../middleware/errorHandler";
import { AgentResult } from "../agents/types";

const router = Router();

router.get("/:runId/pdf", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDb();
    await db.read();
    const run = db.data.analysisRuns.find(
      (r) => r.id === req.params.runId && r.userId === req.user!.id
    );
    if (!run) throw new ApiError(404, "Analysis run not found");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="NEXUS-Report-${run.ticker}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc
      .fontSize(24)
      .fillColor("#0b0f1a")
      .text("NEXUS", { continued: true })
      .fillColor("#4f8cff")
      .text(" INTELLIGENCE REPORT");
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor("#555").text(`Ticker: ${run.ticker}  |  Mode: ${run.mode}`);
    doc.text(`Generated: ${new Date(run.completedAt || run.createdAt).toLocaleString()}`);
    doc.moveDown();

    if (run.finalDecision) {
      doc.fontSize(16).fillColor("#0b0f1a").text("Final Decision");
      doc
        .fontSize(12)
        .fillColor("#111")
        .text(`Action: ${run.finalDecision.action}  |  Confidence: ${run.finalDecision.confidence}%`);
      doc.moveDown(0.5);
      doc.fontSize(11).text(run.finalDecision.rationale, { align: "justify" });
      doc.moveDown();

      if (run.finalDecision.risks?.length) {
        doc.fontSize(14).fillColor("#0b0f1a").text("Key Risks");
        run.finalDecision.risks.forEach((r) => doc.fontSize(11).fillColor("#111").text(`• ${r}`));
        doc.moveDown();
      }

      if (run.finalDecision.timeline?.length) {
        doc.fontSize(14).fillColor("#0b0f1a").text("Investment Timeline");
        run.finalDecision.timeline.forEach((t) =>
          doc
            .fontSize(11)
            .fillColor("#111")
            .text(`[${t.horizon.replace("_", " ")}] ${t.label} (${t.probability}%): ${t.description}`)
        );
        doc.moveDown();
      }
    }

    doc.fontSize(16).fillColor("#0b0f1a").text("Agent Findings");
    Object.values(run.agentOutputs as Record<string, AgentResult>).forEach((agent) => {
      doc.moveDown(0.5);
      doc.fontSize(13).fillColor("#4f8cff").text(agent.agent.toUpperCase() + " AGENT");
      doc
        .fontSize(10)
        .fillColor("#333")
        .text(`Confidence: ${agent.confidence}%`);
      doc.fontSize(11).fillColor("#111").text(agent.summary, { align: "justify" });
    });

    doc.end();
  } catch (err) {
    next(err);
  }
});

export default router;
