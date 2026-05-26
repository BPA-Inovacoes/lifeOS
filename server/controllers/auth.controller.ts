import type { NextFunction, Request, Response } from "express";
import type { AuthService } from "../services/auth.service";
import { signAccessToken } from "../utils/jwt";

export type AuthDeps = {
  auth: AuthService;
};

export class AuthController {
  constructor(private deps: AuthDeps) {}

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = this.deps.auth.parseRegister(req.body);
      const user = await this.deps.auth.register(data);
      const token = signAccessToken(user.id);
      res.status(201).json({ user, token });
    } catch (e) {
      next(e);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = this.deps.auth.parseLogin(req.body);
      const user = await this.deps.auth.login(data);
      const token = signAccessToken(user.id);
      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (e) {
      next(e);
    }
  };

  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = this.deps.auth.parseForgotPassword(req.body);
      const result = await this.deps.auth.forgotPassword(data);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = this.deps.auth.parseResetPassword(req.body);
      await this.deps.auth.resetPassword(data);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
