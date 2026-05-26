import type { NextFunction, Request, Response } from "express";
import type { DashboardService } from "../services/dashboard.service";

export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  summary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const summary = await this.dashboard.getSummary(req.user!.id);
      res.json(summary);
    } catch (e) {
      next(e);
    }
  };
}
