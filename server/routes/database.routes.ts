import { Router } from "express";
import type { DatabaseController } from "../controllers/database.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export function createDatabaseRouter(controller: DatabaseController): Router {
  const r = Router({ mergeParams: true });
  r.use(requireAuth());
  r.get("/", controller.list);
  r.post("/", controller.create);
  r.get("/:databaseId", controller.get);
  r.post("/:databaseId/rows", controller.createRow);
  return r;
}

export function createDatabaseRowRouter(
  controller: DatabaseController
): Router {
  const r = Router();
  r.use(requireAuth());
  r.patch("/:rowId", controller.updateRow);
  r.delete("/:rowId", controller.deleteRow);
  return r;
}
