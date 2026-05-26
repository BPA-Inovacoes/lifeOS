import { Router } from "express";
import type { AuthController } from "../controllers/auth.controller";

export function createAuthRouter(controller: AuthController): Router {
  const r = Router();
  r.post("/register", controller.register);
  r.post("/login", controller.login);
  r.post("/forgot-password", controller.forgotPassword);
  r.post("/reset-password", controller.resetPassword);
  return r;
}
