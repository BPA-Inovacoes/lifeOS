import { Router } from "express";
import type { AuthController } from "../controllers/auth.controller";
import type { PageController } from "../controllers/page.controller";
import type { UserController } from "../controllers/user.controller";
import type { CaseController } from "../controllers/case.controller";
import type { FinanceController } from "../controllers/finance.controller";
import type { GameController } from "../controllers/game.controller";
import type { DashboardController } from "../controllers/dashboard.controller";
import type { DatabaseController } from "../controllers/database.controller";
import type { SearchController } from "../controllers/search.controller";
import type { WorkspaceController } from "../controllers/workspace.controller";
import { createAuthRouter } from "./auth.routes";
import { createCaseRouter } from "./case.routes";
import { createFinanceRouter } from "./finance.routes";
import { createGameRouter } from "./game.routes";
import { createDashboardRouter } from "./dashboard.routes";
import {
  createDatabaseRouter,
  createDatabaseRowRouter,
} from "./database.routes";
import { createSearchRouter } from "./search.routes";
import { createBlockRouter, createPageRouter } from "./page.routes";
import { createUserRouter } from "./user.routes";
import { createWorkspaceRouter } from "./workspace.routes";

export function createRootRouter(opts: {
  authController: AuthController;
  userController: UserController;
  workspaceController: WorkspaceController;
  pageController: PageController;
  databaseController: DatabaseController;
  searchController: SearchController;
  dashboardController: DashboardController;
  gameController: GameController;
  financeController: FinanceController;
  caseController: CaseController;
}): Router {
  const r = Router();
  r.get("/health", (_req, res) => {
    res.json({ ok: true, product: "LifeOS" });
  });
  r.use("/auth", createAuthRouter(opts.authController));
  r.use("/users", createUserRouter(opts.userController));
  r.use("/workspaces", createWorkspaceRouter(opts.workspaceController));
  r.use(
    "/workspaces/:workspaceId/pages",
    createPageRouter(opts.pageController)
  );
  r.use("/blocks", createBlockRouter(opts.pageController));
  r.use(
    "/workspaces/:workspaceId/databases",
    createDatabaseRouter(opts.databaseController)
  );
  r.use("/database-rows", createDatabaseRowRouter(opts.databaseController));
  r.use("/search", createSearchRouter(opts.searchController));
  r.use("/dashboard", createDashboardRouter(opts.dashboardController));
  r.use("/game", createGameRouter(opts.gameController));
  r.use("/finance", createFinanceRouter(opts.financeController));
  r.use("/case", createCaseRouter(opts.caseController));
  return r;
}
