import type { CaseAppMode, CaseContextSnapshot } from "./case-types";

/** Contexto mínimo enviado a providers externos (Groq, OpenAI, etc.). */
export type CaseLlmContextPayload = {
  mode: CaseAppMode;
  focus: {
    tasksOpen: number;
    habitsDoneToday: number;
    habitsTotal: number;
    pointsToday: number;
  };
  finance?: {
    currency: string;
    netWorth: number;
    monthIncome: number;
    monthExpense: number;
    monthNet: number;
    savingsRate: number;
    activeMethodName: string | null;
    activeMethodStep: string | null;
    topExpenseCategories: { name: string; total: number }[];
    totalDebt: number;
    weeklyReviewPending: boolean;
    overBudgetCount: number;
    accountCount: number;
  };
  game?: {
    level: number;
    totalXp: number;
    lifeCoins: number;
    rankTitle: string;
  };
};

/**
 * Remove títulos de tarefas e limita o contexto ao modo activo.
 * Nunca inclui: email, nomes de contas, notas de movimentos, clientes.
 */
export function sanitizeCaseContextForLlm(ctx: CaseContextSnapshot): CaseLlmContextPayload {
  const payload: CaseLlmContextPayload = {
    mode: ctx.mode,
    focus: {
      tasksOpen: ctx.focus.tasksOpen,
      habitsDoneToday: ctx.focus.habitsDoneToday,
      habitsTotal: ctx.focus.habitsTotal,
      pointsToday: ctx.focus.pointsToday,
    },
  };

  if (ctx.mode === "finance" && ctx.finance.enabled) {
    payload.finance = {
      currency: ctx.finance.currency,
      netWorth: ctx.finance.netWorth,
      monthIncome: ctx.finance.monthIncome,
      monthExpense: ctx.finance.monthExpense,
      monthNet: ctx.finance.monthNet,
      savingsRate: ctx.finance.savingsRate,
      activeMethodName: ctx.finance.activeMethodName,
      activeMethodStep: ctx.finance.activeMethodStep,
      topExpenseCategories: ctx.finance.topExpenseCategories,
      totalDebt: ctx.finance.totalDebt,
      weeklyReviewPending: ctx.finance.weeklyReviewPending,
      overBudgetCount: ctx.finance.overBudgetCount,
      accountCount: ctx.finance.accountCount,
    };
    if (ctx.game.enabled) {
      payload.game = {
        level: ctx.game.level,
        totalXp: ctx.game.totalXp,
        lifeCoins: ctx.game.lifeCoins,
        rankTitle: ctx.game.rankTitle,
      };
    }
    return payload;
  }

  if (ctx.mode === "game" && ctx.game.enabled) {
    payload.game = {
      level: ctx.game.level,
      totalXp: ctx.game.totalXp,
      lifeCoins: ctx.game.lifeCoins,
      rankTitle: ctx.game.rankTitle,
    };
    return payload;
  }

  if (ctx.mode === "focus") {
    if (ctx.finance.enabled && ctx.finance.accountCount > 0) {
      payload.finance = {
        currency: ctx.finance.currency,
        netWorth: ctx.finance.netWorth,
        monthIncome: ctx.finance.monthIncome,
        monthExpense: ctx.finance.monthExpense,
        monthNet: ctx.finance.monthNet,
        savingsRate: ctx.finance.savingsRate,
        activeMethodName: ctx.finance.activeMethodName,
        activeMethodStep: ctx.finance.activeMethodStep,
        topExpenseCategories: [],
        totalDebt: ctx.finance.totalDebt,
        weeklyReviewPending: ctx.finance.weeklyReviewPending,
        overBudgetCount: ctx.finance.overBudgetCount,
        accountCount: ctx.finance.accountCount,
      };
    }
    if (ctx.game.enabled) {
      payload.game = {
        level: ctx.game.level,
        totalXp: ctx.game.totalXp,
        lifeCoins: ctx.game.lifeCoins,
        rankTitle: ctx.game.rankTitle,
      };
    }
  }

  return payload;
}
