import type { NextFunction, Request, Response } from "express";
import type { DatabaseService } from "../services/database.service";

export class DatabaseController {
  constructor(private database: DatabaseService) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = this.database.parseCreateDatabase(req.body);
      const database = await this.database.create(
        req.params.workspaceId!,
        req.user!.id,
        data
      );
      res.status(201).json({ database });
    } catch (e) {
      next(e);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const databases = await this.database.list(
        req.params.workspaceId!,
        req.user!.id
      );
      res.json({ databases });
    } catch (e) {
      next(e);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const database = await this.database.getById(
        req.params.databaseId!,
        req.user!.id
      );
      res.json({ database });
    } catch (e) {
      next(e);
    }
  };

  createRow = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = this.database.parseCreateRow(req.body);
      const result = await this.database.createRow(
        req.params.databaseId!,
        req.user!.id,
        data
      );
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  };

  updateRow = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = this.database.parseUpdateRow(req.body);
      const result = await this.database.updateRow(
        req.params.rowId!,
        req.user!.id,
        data
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  deleteRow = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.database.deleteRow(req.params.rowId!, req.user!.id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
