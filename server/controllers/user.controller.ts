import type { NextFunction, Request, Response } from "express";
import type { AuthService } from "../services/auth.service";

export type UserDeps = {
  auth: AuthService;
};

export class UserController {
  constructor(private deps: UserDeps) {}

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
        return;
      }
      const profile = await this.deps.auth.getProfile(req.user.id);
      res.status(200).json(profile);
    } catch (e) {
      next(e);
    }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
        return;
      }
      const body = this.deps.auth.parseUpdateProfile(req.body);
      const profile = await this.deps.auth.updateProfile(req.user.id, body);
      res.status(200).json(profile);
    } catch (e) {
      next(e);
    }
  };

  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
        return;
      }
      const body = this.deps.auth.parseChangePassword(req.body);
      await this.deps.auth.changePassword(req.user.id, body);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
