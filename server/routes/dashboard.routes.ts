import { Router } from "express";
import type { DashboardController } from "../controllers/dashboard.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export function createDashboardRouter(
  controller: DashboardController
): Router {
  const r = Router();
  r.use(requireAuth());
  r.get("/", controller.summary);
  return r;
}
