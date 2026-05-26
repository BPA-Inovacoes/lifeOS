import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function requireAuth() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      return;
    }
    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      res.status(401).json({ code: "UNAUTHORIZED", message: "Token em falta." });
      return;
    }
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub };
      next();
      return;
    } catch {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Token inválido ou expirado.",
      });
      return;
    }
  };
}
