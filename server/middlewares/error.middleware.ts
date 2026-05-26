import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { logger } from "../utils/logger";

export type HttpErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "NOT_FOUND";

export type HttpErrorPayload = {
  code: HttpErrorCode;
  message: string;
  details?: Record<string, string[]>;
};

export class AppError extends Error {
  status: number;
  payload: HttpErrorPayload;

  constructor(status: number, payload: HttpErrorPayload) {
    super(payload.message);
    this.status = status;
    this.payload = payload;
  }
}

function isJsonBodyParseError(err: unknown): boolean {
  return (
    err instanceof SyntaxError &&
    typeof err === "object" &&
    err !== null &&
    "body" in err
  );
}

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (isJsonBodyParseError(err)) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Corpo JSON inválido.",
    });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.status).json(err.payload);
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Dados inválidos.",
      details: err.flatten().fieldErrors as Record<string, string[]>,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2028") {
      res.status(503).json({
        code: "INTERNAL_ERROR",
        message:
          "Operação demorou demasiado. Tenta novamente (criação de workspace com muitas bases).",
      } satisfies HttpErrorPayload);
      return;
    }
    if (err.code === "P2021") {
      res.status(503).json({
        code: "INTERNAL_ERROR",
        message:
          "Base de dados desactualizada. Corre «npx prisma migrate deploy» na pasta server.",
      } satisfies HttpErrorPayload);
      return;
    }
  }

  logger.error(
    { err, requestId: req.id, path: req.path, method: req.method },
    "unhandled_error"
  );
  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "Erro interno do servidor.",
  } satisfies HttpErrorPayload);
}
