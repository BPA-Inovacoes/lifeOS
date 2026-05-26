import type { NextFunction, Request, Response } from "express";
import type { SearchService } from "../services/search.service";

export class SearchController {
  constructor(private search: SearchService) {}

  query = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { q } = this.search.parseQuery({ q: req.query.q });
      const result = await this.search.search(req.user!.id, q);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };
}
