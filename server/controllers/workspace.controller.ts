import type { NextFunction, Request, Response } from "express";
import type { WorkspaceService } from "../services/workspace.service";

export class WorkspaceController {
  constructor(private workspace: WorkspaceService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.workspace.listForUser(req.user!.id);
      res.json({ workspaces: items });
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = this.workspace.parseCreate(req.body);
      const workspace = await this.workspace.create(req.user!.id, data);
      res.status(201).json({ workspace });
    } catch (e) {
      next(e);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspace = await this.workspace.getById(
        req.user!.id,
        req.params.workspaceId!
      );
      res.json({ workspace });
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = this.workspace.parseUpdate(req.body);
      const workspace = await this.workspace.update(
        req.user!.id,
        req.params.workspaceId!,
        data
      );
      res.json({ workspace });
    } catch (e) {
      next(e);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.workspace.remove(req.user!.id, req.params.workspaceId!);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
