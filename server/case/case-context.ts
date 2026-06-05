import type { PrismaClient } from "@prisma/client";

import { monthKey } from "../finance/finance-balance";
import type { FinanceService } from "../services/finance.service";
import type { DashboardService } from "../services/dashboard.service";
import type { CaseAppMode, CaseContextSnapshot, CaseHabitCatalogEntry } from "./case-types";

async function loadWorkspacesWithHabits(prisma: PrismaClient, userId: string) {
  const owned = await prisma.workspace.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true },
  });
  const memberOf = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: { select: { id: true, name: true } } },
  });

  const byId = new Map<string, { id: string; name: string }>();
  for (const w of owned) byId.set(w.id, w);
  for (const m of memberOf) byId.set(m.workspace.id, m.workspace);

  const workspaces = [...byId.values()];
  const habitsDbs = await prisma.database.findMany({
    where: {
      workspaceId: { in: workspaces.map((w) => w.id) },
      template: "HABITS",
    },
    select: { id: true, workspaceId: true },
  });
  const dbByWs = new Map(habitsDbs.map((d) => [d.workspaceId, d.id]));

  return workspaces.map((w) => ({
    id: w.id,
    name: w.name,
    habitsDatabaseId: dbByWs.get(w.id) ?? null,
  }));
}

async function loadHabitsCatalog(
  prisma: PrismaClient,
  workspacesWithHabits: { id: string; name: string; habitsDatabaseId: string | null }[]
): Promise<CaseHabitCatalogEntry[]> {
  const dbIds = workspacesWithHabits
    .map((w) => w.habitsDatabaseId)
    .filter((id): id is string => Boolean(id));
  if (dbIds.length === 0) return [];

  const databases = await prisma.database.findMany({
    where: { id: { in: dbIds } },
    include: {
      properties: true,
      rows: { orderBy: { sortOrder: "asc" } },
      workspace: { select: { id: true, name: true } },
    },
  });

  const catalog: CaseHabitCatalogEntry[] = [];
  for (const db of databases) {
    const habitProp = db.properties.find((p) => p.name === "Hábito");
    if (!habitProp) continue;
    for (const row of db.rows) {
      const props = row.properties as Record<string, unknown>;
      const title = String(props[habitProp.id] ?? "").trim();
      if (!title) continue;
      catalog.push({
        rowId: row.id,
        title,
        workspaceId: db.workspace.id,
        workspaceName: db.workspace.name,
        databaseId: db.id,
      });
    }
  }
  return catalog;
}

export async function buildCaseContext(
  prisma: PrismaClient,
  userId: string,
  mode: CaseAppMode,
  finance: FinanceService,
  dashboard: DashboardService
): Promise<CaseContextSnapshot> {
  const [dash, debts, gameProfile, workspacesWithHabits, accounts, categories] =
    await Promise.all([
      dashboard.getSummary(userId),
      finance.getDebts(userId).catch(() => ({
        totalDebt: 0,
        currency: "EUR",
        snowball: [],
        avalanche: [],
      })),
      prisma.userGameProfile.findUnique({ where: { userId } }),
      loadWorkspacesWithHabits(prisma, userId),
      finance.listAccounts(userId).catch(() => []),
      finance.listCategories().catch(() => []),
    ]);

  const habitsCatalog = await loadHabitsCatalog(prisma, workspacesWithHabits);

  const financeDash = await finance.getDashboard(userId).catch(() => null);

  const currency = financeDash?.profile.currency ?? debts.currency ?? "EUR";
  const month = financeDash?.month ?? {
    income: 0,
    expense: 0,
    net: 0,
    savingsRate: 0,
  };

  const expenseCategories = categories
    .filter((c) => c.kind === "EXPENSE")
    .map((c) => ({ id: c.id, name: c.name }));
  const incomeCategories = categories
    .filter((c) => c.kind === "INCOME")
    .map((c) => ({ id: c.id, name: c.name }));

  const financeCtx = {
    enabled: Boolean(financeDash),
    currency,
    netWorth: financeDash?.netWorth ?? 0,
    monthIncome: month.income,
    monthExpense: month.expense,
    monthNet: month.net,
    savingsRate: month.savingsRate,
    activeMethodName: financeDash?.activeMethod?.name ?? null,
    activeMethodStep: financeDash?.activeMethod?.currentStep?.title ?? null,
    topExpenseCategories: (financeDash?.topExpenseCategories ?? []).map((c) => ({
      name: c.name,
      total: c.total,
    })),
    totalDebt: debts.totalDebt,
    weeklyReviewPending: financeDash ? !financeDash.weeklyReview.completed : true,
    overBudgetCount: 0,
    accountCount: financeDash?.accounts.filter((a) => !a.isArchived).length ?? 0,
    accounts: accounts.map((a) => ({ id: a.id, name: a.name })),
    expenseCategories,
    incomeCategories,
  };

  if (financeDash) {
    const monthKeyStr = monthKey(new Date());
    const envelopes = await finance.getBudgets(userId, monthKeyStr).catch(() => ({
      items: [] as { limitAmount: number; spent: number }[],
    }));
    financeCtx.overBudgetCount = envelopes.items.filter(
      (e) => e.limitAmount > 0 && e.spent > e.limitAmount
    ).length;
  }

  const withHabits = workspacesWithHabits.filter((w) => w.habitsDatabaseId);
  const defaultWs = withHabits[0] ?? null;

  const focusCtx = {
    tasksOpen: dash.metrics.tasksOpen,
    habitsDoneToday: dash.metrics.habitsDoneToday,
    habitsTotal: dash.metrics.habitsTotal,
    pointsToday: dash.metrics.pointsToday,
    focusTasks: dash.focusNow.slice(0, 3).map((t) => t.title),
    defaultWorkspaceId: defaultWs?.id ?? null,
    defaultWorkspaceName: defaultWs?.name ?? null,
    habitsDatabaseId: defaultWs?.habitsDatabaseId ?? null,
    workspacesWithHabits,
    habitsCatalog,
  };

  const gameCtx = {
    enabled: Boolean(gameProfile?.gameModeEnabled),
    level: gameProfile?.level ?? 1,
    totalXp: gameProfile?.totalXp ?? 0,
    lifeCoins: gameProfile?.lifeCoins ?? 0,
    rankTitle: gameProfile?.rankTitle ?? "Wanderer",
  };

  return {
    mode,
    generatedAt: new Date().toISOString(),
    finance: financeCtx,
    focus: focusCtx,
    game: gameCtx,
  };
}

export function financeSnapshotFromContext(
  finance: CaseContextSnapshot["finance"]
): import("./case-types").CaseFinanceSnapshot {
  return {
    accounts: finance.accounts,
    expenseCategories: finance.expenseCategories,
    incomeCategories: finance.incomeCategories,
  };
}
