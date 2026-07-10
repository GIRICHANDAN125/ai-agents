import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { logger } from "./services/logger.service";
import { initDatabase } from "./db/database";
import { apiRateLimiter } from "./middleware/rateLimit.middleware";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { initLiveMonitor } from "./ws/liveMonitor";

import authRoutes from "./routes/auth.routes";
import agentsRoutes from "./routes/agents.routes";
import reportRoutes from "./routes/report.routes";

async function bootstrap() {
  await initDatabase();

  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(
    morgan("combined", {
      stream: { write: (message: string) => logger.info(message.trim()) },
    })
  );
  app.use("/api", apiRateLimiter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "nexus-backend", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/agents", agentsRoutes);
  app.use("/api/reports", reportRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const port = Number(process.env.PORT || 4000);
  const server = http.createServer(app);
  initLiveMonitor(server);

  server.listen(port, () => {
    logger.info(`NEXUS backend listening on port ${port}`);
    logger.info(`Live agent monitor available at ws://localhost:${port}/ws/agents`);
  });
}

bootstrap().catch((err) => {
  logger.error("Fatal error during bootstrap", { error: err.message, stack: err.stack });
  process.exit(1);
});
