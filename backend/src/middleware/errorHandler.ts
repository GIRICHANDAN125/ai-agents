import { Request, Response, NextFunction } from "express";
import { logger } from "../services/logger.service";

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  logger.error(err.message, { stack: err.stack, path: req.path });
  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error" : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}
