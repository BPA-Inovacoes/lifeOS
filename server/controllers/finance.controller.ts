import type { NextFunction, Request, Response } from "express";

import { localeHintsFromRequest } from "../finance/finance-default-currency";
import type { FinanceService } from "../services/finance.service";

export class FinanceController {
  constructor(private finance: FinanceService) {}

  private locale(req: Request) {
    return localeHintsFromRequest(req);
  }

  dashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const data = await this.finance.getDashboard(req.user.id, this.locale(req));
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  accounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const includeArchived = req.query.includeArchived === "1" || req.query.includeArchived === "true";
      const data = await this.finance.listAccounts(req.user.id, { includeArchived });
      res.json({ accounts: data });
    } catch (e) {
      next(e);
    }
  };

  account = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const account = await this.finance.getAccount(req.user.id, req.params.accountId);
      res.json({ account });
    } catch (e) {
      next(e);
    }
  };

  createAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.finance.parseCreateAccount(req.body);
      const account = await this.finance.createAccount(req.user.id, input, this.locale(req));
      res.status(201).json({ account });
    } catch (e) {
      next(e);
    }
  };

  updateAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.finance.parseUpdateAccount(req.body);
      const account = await this.finance.updateAccount(req.user.id, req.params.accountId, input);
      res.json({ account });
    } catch (e) {
      next(e);
    }
  };

  movements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const accountId = typeof req.query.accountId === "string" ? req.query.accountId : undefined;
      const typeRaw = typeof req.query.type === "string" ? req.query.type : undefined;
      const type =
        typeRaw === "EXPENSE" ||
        typeRaw === "INCOME" ||
        typeRaw === "TRANSFER" ||
        typeRaw === "ADJUSTMENT"
          ? typeRaw
          : undefined;
      const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
      const dateFrom = typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined;
      const dateTo = typeof req.query.dateTo === "string" ? req.query.dateTo : undefined;
      const q = typeof req.query.q === "string" ? req.query.q.trim() : undefined;
      const data = await this.finance.listMovements(req.user.id, {
        accountId,
        type,
        categoryId,
        dateFrom,
        dateTo,
        q: q || undefined,
      });
      res.json({ movements: data });
    } catch (e) {
      next(e);
    }
  };

  movementRollup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const rollupId = req.params.rollupId;
      if (!rollupId) {
        return void res.status(400).json({ code: "VALIDATION_ERROR", message: "ID do resumo em falta." });
      }
      const data = await this.finance.getMovementRollup(req.user.id, rollupId);
      res.json({ rollup: data });
    } catch (e) {
      next(e);
    }
  };

  createMovement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.finance.parseCreateMovement(req.body);
      const result = await this.finance.createMovement(req.user.id, input);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  };

  categories = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.finance.listCategories();
      res.json({ categories: data });
    } catch (e) {
      next(e);
    }
  };

  methods = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const data = await this.finance.listMethods(req.user.id, this.locale(req));
      res.json({ methods: data });
    } catch (e) {
      next(e);
    }
  };

  suggestMethodHabits = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const data = await this.finance.suggestMethodHabits(req.user.id, req.params.methodId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  startMethod = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const data = await this.finance.startMethod(req.user.id, req.params.methodId, this.locale(req));
      res.json({ methods: data });
    } catch (e) {
      next(e);
    }
  };

  advanceMethod = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const data = await this.finance.advanceMethodStep(req.user.id, this.locale(req));
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  submitReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.finance.parseReview(req.body);
      const review = await this.finance.submitReview(req.user.id, input);
      res.status(201).json({ review });
    } catch (e) {
      next(e);
    }
  };

  currentReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const data = await this.finance.getCurrentReview(req.user.id);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  listReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const limitRaw = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 12;
      const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 52) : 12;
      const reviews = await this.finance.listReviews(req.user.id, limit);
      res.json({ reviews });
    } catch (e) {
      next(e);
    }
  };

  profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const data = await this.finance.getProfile(req.user.id, this.locale(req));
      res.json({ profile: data });
    } catch (e) {
      next(e);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.finance.parseUpdateProfile(req.body);
      const profile = await this.finance.updateProfile(req.user.id, input);
      res.json({ profile });
    } catch (e) {
      next(e);
    }
  };

  budgets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const month =
        typeof req.query.month === "string"
          ? req.query.month
          : new Date().toISOString().slice(0, 7);
      const data = await this.finance.getBudgets(req.user.id, month);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  upsertBudgets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.finance.parseUpsertBudgets(req.body);
      const data = await this.finance.upsertBudgets(req.user.id, input);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  goals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const goals = await this.finance.listGoals(req.user.id);
      res.json({ goals });
    } catch (e) {
      next(e);
    }
  };

  createGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.finance.parseCreateGoal(req.body);
      const data = await this.finance.createGoal(req.user.id, input);
      res.status(201).json(data);
    } catch (e) {
      next(e);
    }
  };

  updateGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.finance.parseUpdateGoal(req.body);
      const data = await this.finance.updateGoal(req.user.id, req.params.goalId, input);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  deleteGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const data = await this.finance.deleteGoal(req.user.id, req.params.goalId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  debts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const data = await this.finance.getDebts(req.user.id);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  monthlyReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const month = typeof req.query.month === "string" ? req.query.month : undefined;
      const pdf = await this.finance.exportMonthlyPdf(req.user.id, month);
      const label = month && /^\d{4}-\d{2}$/.test(month) ? month : new Date().toISOString().slice(0, 7);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="lifeos-financas-${label}.pdf"`
      );
      res.send(pdf);
    } catch (e) {
      next(e);
    }
  };

  exportCsv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const workbook = await this.finance.exportCsv(req.user.id);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="lifeos-financas-${new Date().toISOString().slice(0, 10)}.xlsx"`
      );
      res.send(workbook);
    } catch (e) {
      next(e);
    }
  };

  questionnaire = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return void res.status(401).json({ code: "UNAUTHORIZED", message: "Não autenticado." });
      const input = this.finance.parseQuestionnaire(req.body);
      const data = await this.finance.submitQuestionnaire(req.user.id, input);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };
}
