import type { NextFunction, Request, Response } from "express";

import type { GameService } from "../services/game.service";
import type { ShopService } from "../services/shop.service";

export type GameDeps = {
  game: GameService;
  shop: ShopService;
};

export class GameController {
  constructor(private deps: GameDeps) {}

  profile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
        return;
      }
      const profile = await this.deps.game.getProfile(req.user.id);
      res.status(200).json(profile);
    } catch (e) {
      next(e);
    }
  };

  dashboard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
        return;
      }
      const dashboard = await this.deps.game.getDashboard(req.user.id);
      res.status(200).json(dashboard);
    } catch (e) {
      next(e);
    }
  };

  toggleMode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
        return;
      }
      const { enabled } = this.deps.game.parseToggle(req.body);
      const profile = await this.deps.game.toggleMode(req.user.id, enabled);
      res.status(200).json(profile);
    } catch (e) {
      next(e);
    }
  };

  prestige = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
        return;
      }
      const profile = await this.deps.game.prestige(req.user.id);
      if (!profile) {
        res.status(409).json({
          code: "PRESTIGE_NOT_AVAILABLE",
          message: "O prestige só fica disponível no nível 100.",
        });
        return;
      }
      res.status(200).json(profile);
    } catch (e) {
      next(e);
    }
  };

  rebuild = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
        return;
      }
      await this.deps.game.getEngine().rebuildProfile(req.user.id);
      const dashboard = await this.deps.game.getDashboard(req.user.id);
      res.status(200).json(dashboard);
    } catch (e) {
      next(e);
    }
  };

  shop = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
        return;
      }
      const data = await this.deps.shop.getShop(req.user.id);
      res.status(200).json(data);
    } catch (e) {
      next(e);
    }
  };

  purchaseShopItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
        return;
      }
      const { itemId, equip } = this.deps.shop.parsePurchase(req.body);
      const data = await this.deps.shop.purchase(req.user.id, itemId, equip);
      res.status(200).json(data);
    } catch (e) {
      next(e);
    }
  };

  equipShopItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
        return;
      }
      const { itemId } = this.deps.shop.parseEquip(req.body);
      const data = await this.deps.shop.equip(req.user.id, itemId);
      res.status(200).json(data);
    } catch (e) {
      next(e);
    }
  };
}
