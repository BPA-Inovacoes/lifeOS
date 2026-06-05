import cors from "cors";
import type { CorsOptions } from "cors";
import express from "express";
import { env } from "./utils/env";
import { PrismaClient } from "@prisma/client";

import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";
import { PageController } from "./controllers/page.controller";
import { UserController } from "./controllers/user.controller";
import { CaseController } from "./controllers/case.controller";
import { FinanceController } from "./controllers/finance.controller";
import { GameController } from "./controllers/game.controller";
import { DashboardController } from "./controllers/dashboard.controller";
import { DatabaseController } from "./controllers/database.controller";
import { SearchController } from "./controllers/search.controller";
import { WorkspaceController } from "./controllers/workspace.controller";
import { createRootRouter } from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { httpLogger } from "./middlewares/http-logger.middleware";
import { requestIdMiddleware } from "./middlewares/request-id.middleware";
import { securityHeaders } from "./middlewares/security.middleware";
import { GamificationEngine } from "./gamification/engine";
import { ActivityService } from "./services/activity.service";
import { CaseService } from "./services/case.service";
import { FinanceService } from "./services/finance.service";
import { GameService } from "./services/game.service";
import { ShopService } from "./services/shop.service";
import { DashboardService } from "./services/dashboard.service";
import { DatabaseService } from "./services/database.service";
import { SearchService } from "./services/search.service";
import { BlockService, PageService } from "./services/page.service";
import { WorkspaceService } from "./services/workspace.service";
import { logger } from "./utils/logger";

const prisma = new PrismaClient();
const authService = new AuthService(prisma);
const workspaceService = new WorkspaceService(prisma);
const pageService = new PageService(prisma);
const blockService = new BlockService(prisma);
const authController = new AuthController({ auth: authService });
const userController = new UserController({ auth: authService });
const workspaceController = new WorkspaceController(workspaceService);
const gamificationEngine = new GamificationEngine(prisma);
const activityService = new ActivityService(prisma, gamificationEngine);
const databaseService = new DatabaseService(prisma, activityService);
const pageController = new PageController(pageService, blockService);
const searchService = new SearchService(prisma);
const gameService = new GameService(prisma, activityService, gamificationEngine);
const shopService = new ShopService(prisma, gamificationEngine);
const financeService = new FinanceService(prisma, activityService);
const dashboardService = new DashboardService(
  prisma,
  workspaceService,
  activityService,
  financeService
);
const databaseController = new DatabaseController(databaseService);
const searchController = new SearchController(searchService);
const dashboardController = new DashboardController(dashboardService);
const gameController = new GameController({ game: gameService, shop: shopService });
const financeController = new FinanceController(financeService);
const caseService = new CaseService(prisma, financeService, dashboardService, databaseService);
const caseController = new CaseController(caseService);

const app = express();

app.use(securityHeaders);
app.use(requestIdMiddleware);
app.use(httpLogger);

const corsOrigin: CorsOptions["origin"] =
  process.env.NODE_ENV === "production" && env.CLIENT_ORIGIN?.trim()
    ? env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
    : true;

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  "/",
  createRootRouter({
    authController,
    userController,
    workspaceController,
    pageController,
    databaseController,
    searchController,
    dashboardController,
    gameController,
    financeController,
    caseController,
  })
);

app.use(errorMiddleware);

const port = env.PORT;
app.listen(port, () => {
  logger.info({ port }, "API a escutar");
});
