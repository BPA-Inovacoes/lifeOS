import { Router } from "express";
import type { SearchController } from "../controllers/search.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export function createSearchRouter(controller: SearchController): Router {
  const r = Router();
  r.use(requireAuth());
  r.get("/", controller.query);
  return r;
}
