import type { NextFunction, Request, Response } from "express";
import type { BlockService, PageService } from "../services/page.service";

export class PageController {
  constructor(
    private page: PageService,
    private block: BlockService
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pages = await this.page.list(req.params.workspaceId!, req.user!.id);
      res.json({ pages });
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = this.page.parseCreate(req.body);
      const page = await this.page.create(
        req.params.workspaceId!,
        req.user!.id,
        data
      );
      res.status(201).json({ page });
    } catch (e) {
      next(e);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = await this.page.getWithBlocks(req.params.pageId!, req.user!.id);
      res.json({ page });
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = this.page.parseUpdate(req.body);
      const page = await this.page.update(req.params.pageId!, req.user!.id, data);
      res.json({ page });
    } catch (e) {
      next(e);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.page.remove(req.params.pageId!, req.user!.id);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  createBlock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = this.block.parseCreate(req.body);
      const block = await this.block.create(req.params.pageId!, req.user!.id, data);
      res.status(201).json({ block });
    } catch (e) {
      next(e);
    }
  };

  updateBlock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = this.block.parseUpdate(req.body);
      const block = await this.block.update(
        req.params.blockId!,
        req.user!.id,
        data
      );
      res.json({ block });
    } catch (e) {
      next(e);
    }
  };

  deleteBlock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.block.remove(req.params.blockId!, req.user!.id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };

  reorderBlocks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = this.block.parseReorder(req.body);
      const blocks = await this.block.reorder(
        req.params.pageId!,
        req.user!.id,
        data
      );
      res.json({ blocks });
    } catch (e) {
      next(e);
    }
  };
}
