import { Router } from "express";

import type { GameController } from "../controllers/game.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export function createGameRouter(controller: GameController): Router {
  const r = Router();
  r.use(requireAuth());
  r.get("/profile", controller.profile);
  r.get("/dashboard", controller.dashboard);
  r.patch("/mode", controller.toggleMode);
  r.post("/prestige", controller.prestige);
  r.post("/rebuild", controller.rebuild);
  r.get("/shop", controller.shop);
  r.post("/shop/purchase", controller.purchaseShopItem);
  r.patch("/shop/equip", controller.equipShopItem);
  return r;
}
