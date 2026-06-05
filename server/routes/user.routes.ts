import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import type { UserController } from "../controllers/user.controller";

export function createUserRouter(controller: UserController): Router {
  const r = Router();
  const guard = requireAuth();
  r.get("/me", guard, controller.me);
  r.put("/me", guard, controller.updateMe);
  r.post("/me/password", guard, controller.changePassword);
  return r;
}
