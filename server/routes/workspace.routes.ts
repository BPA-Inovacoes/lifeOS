import { Router } from "express";
import type { WorkspaceController } from "../controllers/workspace.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export function createWorkspaceRouter(controller: WorkspaceController): Router {
  const r = Router();
  r.use(requireAuth());
  r.get("/", controller.list);
  r.post("/", controller.create);
  r.get("/:workspaceId", controller.get);
  r.patch("/:workspaceId", controller.update);
  r.delete("/:workspaceId", controller.remove);
  return r;
}
