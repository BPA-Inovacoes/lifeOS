import { Router } from "express";

import type { FinanceController } from "../controllers/finance.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export function createFinanceRouter(controller: FinanceController): Router {
  const r = Router();
  r.use(requireAuth());
  r.get("/dashboard", controller.dashboard);
  r.get("/accounts", controller.accounts);
  r.get("/accounts/:accountId", controller.account);
  r.post("/accounts", controller.createAccount);
  r.patch("/accounts/:accountId", controller.updateAccount);
  r.get("/movements", controller.movements);
  r.get("/movement-rollups/:rollupId", controller.movementRollup);
  r.post("/movements", controller.createMovement);
  r.get("/categories", controller.categories);
  r.get("/methods", controller.methods);
  r.post("/methods/:methodId/start", controller.startMethod);
  r.post("/methods/:methodId/suggest-habits", controller.suggestMethodHabits);
  r.post("/methods/active/advance", controller.advanceMethod);
  r.get("/reviews", controller.listReviews);
  r.get("/reviews/current", controller.currentReview);
  r.post("/reviews", controller.submitReview);
  r.get("/profile", controller.profile);
  r.patch("/profile", controller.updateProfile);
  r.get("/budgets", controller.budgets);
  r.put("/budgets", controller.upsertBudgets);
  r.get("/goals", controller.goals);
  r.post("/goals", controller.createGoal);
  r.patch("/goals/:goalId", controller.updateGoal);
  r.delete("/goals/:goalId", controller.deleteGoal);
  r.get("/debts", controller.debts);
  r.get("/reports/monthly", controller.monthlyReport);
  r.get("/export", controller.exportCsv);
  r.post("/questionnaire", controller.questionnaire);
  return r;
}
