import { Router } from "express";
import type { PageController } from "../controllers/page.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export function createPageRouter(controller: PageController): Router {
  const r = Router({ mergeParams: true });
  r.use(requireAuth());
  r.get("/", controller.list);
  r.post("/", controller.create);
  r.get("/:pageId", controller.get);
  r.patch("/:pageId", controller.update);
  r.delete("/:pageId", controller.remove);
  r.post("/:pageId/blocks/reorder", controller.reorderBlocks);
  r.post("/:pageId/blocks", controller.createBlock);
  return r;
}

export function createBlockRouter(controller: PageController): Router {
  const r = Router();
  r.use(requireAuth());
  r.patch("/:blockId", controller.updateBlock);
  r.delete("/:blockId", controller.deleteBlock);
  return r;
}
