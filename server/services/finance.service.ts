import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { AppError } from "../middlewares/error.middleware";
import {
  computeBalances,
  computeNetWorth,
  isLiabilityAccount,
  monthKey,
  normalizeInitialBalance,
  startOfWeek,
  toMoney,
} from "../finance/finance-balance";
import { FINANCE_CATEGORIES } from "../finance/finance-categories";
import { isFinanceCurrency } from "../finance/finance-currencies";
import {
  resolveDefaultCurrency,
  type FinanceLocaleHints,
} from "../finance/finance-default-currency";
import {
  FINANCE_METHODS,
  getFinanceMethod,
  type FinanceMethodDefinition,
} from "../finance/finance-methods-catalog";
import {
  suggestMethodFromQuestionnaire,
  type FinanceQuestionnaireAnswers,
} from "../finance/finance-questionnaire";
import {
  computeBillingPeriod,
  isValidCycleDay,
  withPaymentDue,
} from "../finance/finance-billing-cycle";
import {
  mapAccountToDebtInput,
  orderAvalanche,
  orderSnowball,
} from "../finance/finance-debt-plan";
import { buildFinanceExportXlsx } from "../finance/finance-export-xlsx";
import { buildFinanceMonthlyPdf } from "../finance/finance-monthly-pdf";
import { loadClientFinanceLinkMap } from "../finance/finance-client-links";
import {
  financeBudgetRespectedContext,
  financeGoalReachedContext,
  financeMethodCompletedContext,
  financeMethodStepContext,
  financeReviewCompletedContext,
  financeReviewStreakContext,
} from "../finance/finance-gamification";
import { buildPayYourselfTransferSuggestion } from "../finance/finance-pay-yourself";
import {
  getSuggestedHabitsForMethod,
} from "../finance/finance-method-habits";
import type { GamificationFeedbackPayload } from "../gamification/feedback";
import type { ActivityService } from "./activity.service";
import { ensureHabitsDatabase } from "../utils/ensure-workspace-databases";
import { workspaceIdsForUser } from "../utils/user-workspaces";
import {
  buildRollupId,
  buildRollupTotals,
  collectRollupCategoryTotalsForMonth,
  extractRollupLines,
  extractRollupEntries,
  FINANCE_MOVEMENT_DETAIL_CAP,
  mergeRollupMonthFlow,
  mergeWeekFlowSlices,
  rollupLinesToBalanceInput,
  rollupMatchesListFilters,
  weekFlowFromRollup,
  type WeekFlowTotals,
  type RollupEntry,
  type RollupLine,
  type RollupTotals,
  type RollupTotalsStored,
} from "../finance/movement-rollup";

const accountTypeSchema = z.enum([
  "CHECKING",
  "SAVINGS",
  "CASH",
  "CREDIT_CARD",
  "INVESTMENT",
  "LOAN",
  "OTHER",
]);

const cycleDaySchema = z.union([z.number().int().min(1).max(28), z.null()]).optional();

const accountLiabilitySchema = z.object({
  creditLimit: z.number().positive().nullable().optional(),
  billingCycleDay: cycleDaySchema,
  paymentDueDay: cycleDaySchema,
  aprPercent: z.number().min(0).max(999).nullable().optional(),
  minimumPayment: z.number().positive().nullable().optional(),
  originalPrincipal: z.number().positive().nullable().optional(),
});

const createAccountSchema = z
  .object({
    name: z.string().min(1).max(80),
    type: accountTypeSchema,
    currency: z
      .string()
      .length(3)
      .transform((c) => c.toUpperCase())
      .refine(isFinanceCurrency, "Moeda não suportada.")
      .optional(),
    icon: z.string().max(32).optional(),
    color: z.string().max(32).optional(),
    initialBalance: z.number(),
    initialBalanceDate: z.string().optional(),
    institution: z.string().max(80).optional(),
    maskedIdentifier: z.string().max(32).optional(),
    includeInNetWorth: z.boolean().optional(),
  })
  .merge(accountLiabilitySchema);

const updateAccountSchema = createAccountSchema.partial().extend({
  isArchived: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const movementBaseSchema = z.object({
  accountId: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
  categoryId: z.string().optional(),
  note: z.string().max(500).optional(),
  linkedClientRowId: z.string().optional(),
});

const createMovementSchema = z.discriminatedUnion("type", [
  movementBaseSchema.extend({ type: z.literal("EXPENSE") }),
  movementBaseSchema.extend({ type: z.literal("INCOME") }),
  movementBaseSchema.extend({
    type: z.literal("TRANSFER"),
    transferDestAccountId: z.string().min(1),
  }),
  z.object({
    type: z.literal("ADJUSTMENT"),
    accountId: z.string().min(1),
    amount: z.number().refine((n) => n !== 0, "Ajuste não pode ser zero."),
    date: z.string(),
    note: z.string().min(1).max(500),
  }),
]);

const reviewSchema = z.object({
  weekStart: z.string().optional(),
  answers: z.object({
    incomeNote: z.string().optional(),
    expenseNote: z.string().optional(),
    methodFollowed: z.enum(["yes", "partial", "no"]).optional(),
    improvement: z.string().optional(),
  }),
  accountSnapshots: z.record(z.string(), z.number()).optional(),
});

const updateProfileSchema = z.object({
  currency: z
    .string()
    .length(3)
    .transform((c) => c.toUpperCase())
    .refine(isFinanceCurrency, "Moeda não suportada.")
    .optional(),
  payYourselfPercent: z.number().min(1).max(80).nullable().optional(),
});

const upsertBudgetsSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Mês inválido (YYYY-MM)."),
  budgets: z.array(
    z.object({
      categoryId: z.string().min(1),
      limitAmount: z.number().positive(),
    })
  ),
});

const createGoalSchema = z.object({
  name: z.string().min(1).max(80),
  targetAmount: z.number().positive(),
  targetAccountId: z.string().min(1),
  deadline: z.string().optional(),
});

const updateGoalSchema = createGoalSchema.partial().extend({
  status: z.enum(["ACTIVE", "REACHED", "PAUSED"]).optional(),
});

const questionnaireSchema = z.object({
  hasHighInterestDebt: z.boolean(),
  incomeType: z.enum(["fixed", "variable"]),
  hasEmergencyFund: z.boolean(),
  weeklyTime: z.enum(["minimal", "moderate", "full"]),
  wantsGameLink: z.boolean(),
  shortTermGoal: z.enum(["pay_debt", "save", "organize"]),
});

export class FinanceService {
  private categoriesEnsured = false;

  constructor(
    private prisma: PrismaClient,
    private activity?: ActivityService
  ) {}

  private async emitFinanceGamification(
    userId: string,
    ctx: Parameters<ActivityService["emitFinanceActivity"]>[1]
  ): Promise<GamificationFeedbackPayload | null> {
    if (!this.activity) return null;
    return this.activity.emitFinanceActivity(userId, ctx);
  }

  private async rewardReachedGoals(userId: string) {
    const goals = await this.listGoals(userId);
    let feedback: GamificationFeedbackPayload | null = null;
    for (const goal of goals) {
      if (!goal.reached || goal.status === "REACHED") continue;
      await this.prisma.financeAccountGoal.update({
        where: { id: goal.id },
        data: { status: "REACHED" },
      });
      const result = await this.emitFinanceGamification(
        userId,
        financeGoalReachedContext(userId, goal.id)
      );
      if (result) feedback = result;
    }
    return feedback;
  }

  private async rewardBudgetRespected(userId: string, month: string) {
    const envelopes = await this.listBudgetsForMonth(userId, month);
    const withLimits = envelopes.filter((e) => e.limitAmount > 0);
    if (withLimits.length === 0) return null;
    const respected = withLimits.every((e) => e.spent <= e.limitAmount);
    if (!respected) return null;
    return this.emitFinanceGamification(userId, financeBudgetRespectedContext(userId, month));
  }

  private async countConsecutiveFinanceReviews(userId: string) {
    const reviews = await this.prisma.financeWeeklyReview.findMany({
      where: { userId },
      orderBy: { weekStart: "desc" },
      take: 8,
      select: { weekStart: true },
    });
    if (reviews.length === 0) return 0;

    let streak = 1;
    for (let i = 1; i < reviews.length; i++) {
      const prev = reviews[i - 1]!.weekStart;
      const curr = reviews[i]!.weekStart;
      const expected = new Date(prev);
      expected.setUTCDate(expected.getUTCDate() - 7);
      if (curr.toISOString().slice(0, 10) === expected.toISOString().slice(0, 10)) {
        streak += 1;
      } else break;
    }
    return streak;
  }

  parseCreateAccount(raw: unknown) {
    return createAccountSchema.parse(raw);
  }

  parseUpdateAccount(raw: unknown) {
    return updateAccountSchema.parse(raw);
  }

  parseCreateMovement(raw: unknown) {
    return createMovementSchema.parse(raw);
  }

  parseReview(raw: unknown) {
    return reviewSchema.parse(raw);
  }

  parseUpdateProfile(raw: unknown) {
    return updateProfileSchema.parse(raw);
  }

  parseUpsertBudgets(raw: unknown) {
    return upsertBudgetsSchema.parse(raw);
  }

  parseCreateGoal(raw: unknown) {
    return createGoalSchema.parse(raw);
  }

  parseUpdateGoal(raw: unknown) {
    return updateGoalSchema.parse(raw);
  }

  parseQuestionnaire(raw: unknown) {
    return questionnaireSchema.parse(raw);
  }

  async ensureCategories() {
    if (this.categoriesEnsured) return;
    await Promise.all(
      FINANCE_CATEGORIES.map((cat) =>
        this.prisma.financeCategory.upsert({
          where: { id: cat.id },
          create: cat,
          update: {
            kind: cat.kind,
            name: cat.name,
            icon: cat.icon,
            sortOrder: cat.sortOrder,
          },
        })
      )
    );
    this.categoriesEnsured = true;
  }

  async ensureProfile(userId: string, hints?: FinanceLocaleHints) {
    await this.ensureCategories();
    const existing = await this.prisma.financialProfile.findUnique({ where: { userId } });
    if (existing) return existing;

    const currency = resolveDefaultCurrency(hints);
    return this.prisma.financialProfile.create({
      data: { userId, currency },
    });
  }

  private parseDateOnly(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      throw new AppError(400, { code: "VALIDATION_ERROR", message: "Data inválida." });
    }
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  private parseMonthStart(month: string) {
    const m = /^(\d{4})-(\d{2})$/.exec(month);
    if (!m) {
      throw new AppError(400, { code: "VALIDATION_ERROR", message: "Mês inválido (YYYY-MM)." });
    }
    const year = Number(m[1]);
    const mon = Number(m[2]);
    if (mon < 1 || mon > 12) {
      throw new AppError(400, { code: "VALIDATION_ERROR", message: "Mês inválido." });
    }
    return new Date(Date.UTC(year, mon - 1, 1));
  }

  private movementInclude() {
    return { category: true, account: true, transferDestAccount: true } as const;
  }

  private async loadUserFinance(userId: string, opts?: { includeArchived?: boolean }) {
    await this.packMovementsIfNeeded(userId);

    const [accounts, movements, rollups] = await Promise.all([
      this.prisma.financeAccount.findMany({
        where: {
          userId,
          ...(opts?.includeArchived ? {} : { isArchived: false }),
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      this.prisma.financeMovement.findMany({
        where: { userId },
        include: this.movementInclude(),
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      }),
      this.prisma.financeMovementRollup.findMany({
        where: { userId },
        orderBy: { sequence: "desc" },
      }),
    ]);

    const rollupBalanceLines = rollups.flatMap((r) =>
      rollupLinesToBalanceInput(r.lines as Parameters<typeof rollupLinesToBalanceInput>[0])
    );
    const balanceInputs = [
      ...movements.map((m) => ({
        type: m.type,
        accountId: m.accountId,
        transferDestAccountId: m.transferDestAccountId,
        amount: m.amount,
      })),
      ...rollupBalanceLines,
    ];
    const balances = computeBalances(accounts, balanceInputs);
    return { accounts, movements, rollups, balances };
  }

  /** Compacta os 25 movimentos mais antigos num resumo único (padrão fin-roll-*). */
  private async packMovementsIfNeeded(userId: string) {
    const total = await this.prisma.financeMovement.count({ where: { userId } });
    if (total <= FINANCE_MOVEMENT_DETAIL_CAP) return;

    const toPack = await this.prisma.financeMovement.findMany({
      where: { userId },
      include: this.movementInclude(),
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      take: FINANCE_MOVEMENT_DETAIL_CAP,
    });
    if (toPack.length < FINANCE_MOVEMENT_DETAIL_CAP) return;

    const lastRollup = await this.prisma.financeMovementRollup.findFirst({
      where: { userId },
      orderBy: { sequence: "desc" },
      select: { sequence: true },
    });
    const sequence = (lastRollup?.sequence ?? 0) + 1;
    const id = buildRollupId(userId, sequence);
    const lines = extractRollupLines(toPack);
    const totals: RollupTotalsStored = {
      ...buildRollupTotals(toPack),
      entries: extractRollupEntries(toPack),
    };
    const periodFrom = toPack[0]!.date;
    const periodTo = toPack[toPack.length - 1]!.date;

    await this.prisma.$transaction([
      this.prisma.financeMovementRollup.create({
        data: {
          id,
          userId,
          sequence,
          periodFrom,
          periodTo,
          count: toPack.length,
          totals,
          lines,
        },
      }),
      this.prisma.financeMovement.deleteMany({
        where: { id: { in: toPack.map((m) => m.id) } },
      }),
    ]);

    const remaining = await this.prisma.financeMovement.count({ where: { userId } });
    if (remaining > FINANCE_MOVEMENT_DETAIL_CAP) {
      await this.packMovementsIfNeeded(userId);
    }
  }

  private rollupTotalsPublic(stored: unknown): RollupTotals {
    const raw = stored as RollupTotalsStored;
    return {
      income: raw.income ?? 0,
      expense: raw.expense ?? 0,
      savingsTransfer: raw.savingsTransfer ?? 0,
      byMonth: raw.byMonth ?? {},
    };
  }

  private mapRollup(
    rollup: {
      id: string;
      sequence: number;
      periodFrom: Date;
      periodTo: Date;
      count: number;
      totals: unknown;
    }
  ) {
    const totals = this.rollupTotalsPublic(rollup.totals);
    const net = Math.round((totals.income - totals.expense) * 100) / 100;
    const from = rollup.periodFrom.toISOString().slice(0, 10);
    const to = rollup.periodTo.toISOString().slice(0, 10);
    return {
      id: rollup.id,
      type: "SUMMARY" as const,
      accountId: "",
      accountName: "Várias contas",
      transferDestAccountId: null,
      transferDestAccountName: null,
      amount: net,
      date: to,
      categoryId: null,
      categoryName: null,
      note: null,
      linkedClientRowId: null,
      isRollup: true as const,
      rollupSequence: rollup.sequence,
      rollupCount: rollup.count,
      rollupPeriodFrom: from,
      rollupPeriodTo: to,
      rollupTotals: totals,
    };
  }

  private mapAccount(
    account: Awaited<ReturnType<typeof this.loadUserFinance>>["accounts"][0],
    balance: number,
    cycleSpend?: number
  ) {
    const billingPeriod =
      account.type === "CREDIT_CARD" && isValidCycleDay(account.billingCycleDay)
        ? withPaymentDue(
            computeBillingPeriod(account.billingCycleDay),
            account.paymentDueDay
          )
        : null;

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      currency: account.currency,
      icon: account.icon,
      color: account.color,
      initialBalance: toMoney(account.initialBalance),
      initialBalanceDate: account.initialBalanceDate.toISOString().slice(0, 10),
      institution: account.institution,
      maskedIdentifier: account.maskedIdentifier,
      includeInNetWorth: account.includeInNetWorth,
      isArchived: account.isArchived,
      sortOrder: account.sortOrder,
      balance,
      isLiability: isLiabilityAccount(account.type),
      creditLimit: account.creditLimit != null ? toMoney(account.creditLimit) : null,
      billingCycleDay: account.billingCycleDay,
      paymentDueDay: account.paymentDueDay,
      aprPercent: account.aprPercent != null ? toMoney(account.aprPercent) : null,
      minimumPayment: account.minimumPayment != null ? toMoney(account.minimumPayment) : null,
      originalPrincipal:
        account.originalPrincipal != null ? toMoney(account.originalPrincipal) : null,
      billingPeriod,
      cycleSpend: cycleSpend ?? null,
    };
  }

  private liabilityDataFromInput(
    type: z.infer<typeof accountTypeSchema>,
    input: z.infer<typeof accountLiabilitySchema>
  ) {
    if (!isLiabilityAccount(type)) {
      return {
        creditLimit: null,
        billingCycleDay: null,
        paymentDueDay: null,
        aprPercent: null,
        minimumPayment: null,
        originalPrincipal: null,
      };
    }
    return {
      creditLimit: type === "CREDIT_CARD" ? (input.creditLimit ?? null) : null,
      billingCycleDay: type === "CREDIT_CARD" ? (input.billingCycleDay ?? null) : null,
      paymentDueDay: type === "CREDIT_CARD" ? (input.paymentDueDay ?? null) : null,
      aprPercent: input.aprPercent ?? null,
      minimumPayment: type === "LOAN" ? (input.minimumPayment ?? null) : null,
      originalPrincipal: type === "LOAN" ? (input.originalPrincipal ?? null) : null,
    };
  }

  private computeCycleSpend(
    accountId: string,
    billingCycleDay: number,
    movements: Awaited<ReturnType<typeof this.loadUserFinance>>["movements"]
  ) {
    const period = computeBillingPeriod(billingCycleDay);
    let total = 0;
    for (const m of movements) {
      if (m.accountId !== accountId || m.type !== "EXPENSE") continue;
      const d = m.date.toISOString().slice(0, 10);
      if (d <= period.from || d > period.to) continue;
      total += Math.abs(toMoney(m.amount));
    }
    return Math.round(total * 100) / 100;
  }

  private mapMovement(
    m: Awaited<ReturnType<typeof this.loadUserFinance>>["movements"][0],
    clientLinks?: Map<string, import("../finance/finance-client-links").ClientFinanceLink>
  ) {
    const link =
      m.linkedClientRowId && clientLinks
        ? (clientLinks.get(m.linkedClientRowId) ?? null)
        : null;

    return {
      id: m.id,
      type: m.type,
      accountId: m.accountId,
      accountName: m.account.name,
      transferDestAccountId: m.transferDestAccountId,
      transferDestAccountName: m.transferDestAccount?.name ?? null,
      amount: toMoney(m.amount),
      date: m.date.toISOString().slice(0, 10),
      categoryId: m.categoryId,
      categoryName: m.category?.name ?? null,
      note: m.note,
      linkedClientRowId: m.linkedClientRowId,
      linkedClient: link
        ? {
            rowId: link.rowId,
            clientName: link.clientName,
            workspaceId: link.workspaceId,
            databaseId: link.databaseId,
          }
        : null,
      isRollup: false as const,
    };
  }

  private buildMovementFeed(
    movements: Awaited<ReturnType<typeof this.loadUserFinance>>["movements"],
    rollups: Awaited<ReturnType<typeof this.loadUserFinance>>["rollups"],
    limit?: number,
    clientLinks?: Map<string, import("../finance/finance-client-links").ClientFinanceLink>
  ) {
    const feed = [
      ...movements.map((m) => this.mapMovement(m, clientLinks)),
      ...rollups.map((r) => this.mapRollup(r)),
    ].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    return limit ? feed.slice(0, limit) : feed;
  }

  private mapMethod(
    method: FinanceMethodDefinition,
    progress: { stepIndex: number; completedAt: Date | null; startedAt: Date } | null,
    active: boolean
  ) {
    const totalSteps = method.steps.length;
    const stepIndex = progress?.stepIndex ?? 0;
    return {
      id: method.id,
      name: method.name,
      tagline: method.tagline,
      level: method.level,
      duration: method.duration,
      durationLabel: method.durationLabel,
      totalSteps,
      stepIndex,
      completed: Boolean(progress?.completedAt),
      active,
      progressPercent: totalSteps
        ? Math.min(100, Math.round((stepIndex / totalSteps) * 100))
        : 0,
      currentStep: method.steps[stepIndex] ?? null,
      steps: method.steps.map((step, idx) => ({
        ...step,
        done: idx < stepIndex,
        current: active && idx === stepIndex && !progress?.completedAt,
      })),
      startedAt: progress?.startedAt.toISOString() ?? null,
      completedAt: progress?.completedAt?.toISOString() ?? null,
    };
  }

  private computeMonthFlow(
    data: Pick<
      Awaited<ReturnType<typeof this.loadUserFinance>>,
      "movements" | "rollups"
    >,
    month: string
  ) {
    let income = 0;
    let expense = 0;
    let savingsTransfer = 0;

    for (const m of data.movements) {
      if (monthKey(m.date) !== month) continue;
      const amount = Math.abs(toMoney(m.amount));
      if (m.type === "INCOME") income += amount;
      if (m.type === "EXPENSE") expense += amount;
      if (m.type === "TRANSFER" && m.transferDestAccount?.type === "SAVINGS") {
        savingsTransfer += amount;
      }
    }

    for (const rollup of data.rollups) {
      const slice = mergeRollupMonthFlow(this.rollupTotalsPublic(rollup.totals), month);
      if (!slice) continue;
      income += slice.income;
      expense += slice.expense;
      savingsTransfer += slice.savingsTransfer;
    }

    const savingsRate = income > 0 ? Math.round((savingsTransfer / income) * 100) : 0;
    return {
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      net: Math.round((income - expense) * 100) / 100,
      savingsTransfer: Math.round(savingsTransfer * 100) / 100,
      savingsRate,
    };
  }

  async getProfile(userId: string, hints?: FinanceLocaleHints) {
    const profile = await this.ensureProfile(userId, hints);
    return {
      currency: profile.currency,
      onboardingDone: profile.onboardingDone,
      questionnaireCompletedAt: profile.questionnaireCompletedAt?.toISOString() ?? null,
      activeMethodId: profile.activeMethodId,
      payYourselfPercent:
        profile.payYourselfPercent != null ? toMoney(profile.payYourselfPercent) : null,
    };
  }

  async updateProfile(userId: string, input: z.infer<typeof updateProfileSchema>) {
    await this.ensureProfile(userId);
    const updates: {
      currency?: string;
      payYourselfPercent?: number | null;
    } = {};
    if (input.currency !== undefined) updates.currency = input.currency;
    if (input.payYourselfPercent !== undefined) {
      updates.payYourselfPercent = input.payYourselfPercent;
    }

    if (updates.currency) {
      await this.prisma.$transaction([
        this.prisma.financialProfile.update({
          where: { userId },
          data: updates,
        }),
        this.prisma.financeAccount.updateMany({
          where: { userId },
          data: { currency: updates.currency },
        }),
      ]);
    } else if (Object.keys(updates).length) {
      await this.prisma.financialProfile.update({
        where: { userId },
        data: updates,
      });
    }

    return this.getProfile(userId);
  }

  async getDashboard(userId: string, hints?: FinanceLocaleHints) {
    const profile = await this.ensureProfile(userId, hints);
    const finance = await this.loadUserFinance(userId);
    const { accounts, movements, balances, rollups } = finance;
    const now = new Date();
    const month = monthKey(now);
    const monthFlow = this.computeMonthFlow(finance, month);

    const progressRows = await this.prisma.userMethodProgress.findMany({
      where: { userId },
    });
    const progressMap = new Map(progressRows.map((p) => [p.methodId, p]));

    const methods = FINANCE_METHODS.map((method) =>
      this.mapMethod(
        method,
        progressMap.get(method.id) ?? null,
        profile.activeMethodId === method.id
      )
    );

    const activeMethod = profile.activeMethodId
      ? methods.find((m) => m.id === profile.activeMethodId) ?? null
      : null;

    const weekStart = startOfWeek(now);
    const review = await this.prisma.financeWeeklyReview.findUnique({
      where: {
        userId_weekStart: { userId, weekStart },
      },
    });

    const topExpenseCategories = this.topCategories(movements, rollups, month, "EXPENSE");
    const [envelopes, goals] = await Promise.all([
      this.listBudgetsForMonth(userId, month, movements, rollups),
      this.listGoals(userId, accounts, balances),
    ]);

    void this.rewardReachedGoals(userId);
    void this.rewardBudgetRespected(userId, month);

    return {
      profile: {
        currency: profile.currency,
        onboardingDone: profile.onboardingDone,
        questionnaireCompletedAt: profile.questionnaireCompletedAt?.toISOString() ?? null,
        activeMethodId: profile.activeMethodId,
        methodStepIndex: profile.methodStepIndex,
        defaultExpenseAccountId: profile.defaultExpenseAccountId,
        defaultIncomeAccountId: profile.defaultIncomeAccountId,
        defaultSavingsAccountId: profile.defaultSavingsAccountId,
        payYourselfPercent:
          profile.payYourselfPercent != null ? toMoney(profile.payYourselfPercent) : null,
      },
      netWorth: computeNetWorth(accounts, balances),
      month: monthFlow,
      accounts: accounts.map((a) => this.mapAccount(a, balances.get(a.id) ?? 0)),
      recentMovements: this.buildMovementFeed(
        movements,
        rollups,
        8,
        await loadClientFinanceLinkMap(this.prisma, userId)
      ),
      activeMethod,
      methods,
      weeklyReview: {
        weekStart: weekStart.toISOString().slice(0, 10),
        completed: Boolean(review),
      },
      topExpenseCategories,
      envelopes,
      goals,
      insight: this.buildInsight(monthFlow, activeMethod, accounts.length),
    };
  }

  private topCategories(
    movements: Awaited<ReturnType<typeof this.loadUserFinance>>["movements"],
    rollups: Awaited<ReturnType<typeof this.loadUserFinance>>["rollups"],
    month: string,
    type: "EXPENSE" | "INCOME"
  ) {
    const totals = new Map<string, { name: string; total: number }>();
    for (const m of movements) {
      if (monthKey(m.date) !== month || m.type !== type || !m.category) continue;
      const amount = Math.abs(toMoney(m.amount));
      const prev = totals.get(m.category.id) ?? { name: m.category.name, total: 0 };
      prev.total += amount;
      totals.set(m.category.id, prev);
    }

    for (const [id, value] of collectRollupCategoryTotalsForMonth(rollups, month, type)) {
      const prev = totals.get(id) ?? { name: value.name, total: 0 };
      totals.set(id, { name: value.name, total: prev.total + value.total });
    }

    return [...totals.entries()]
      .map(([id, v]) => ({ id, name: v.name, total: Math.round(v.total * 100) / 100 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }

  private buildInsight(
    month: ReturnType<FinanceService["computeMonthFlow"]>,
    activeMethod: ReturnType<FinanceService["mapMethod"]> | null,
    accountCount: number
  ) {
    if (accountCount === 0) {
      return "Começa por criar a tua conta à ordem e poupança — dia 1 do método «Primeiros 30 dias».";
    }
    if (activeMethod && !activeMethod.completed) {
      return `Próximo passo: ${activeMethod.currentStep?.title ?? "continua o teu método"}.`;
    }
    if (month.savingsRate >= 20) {
      return `Taxa de poupança de ${month.savingsRate}% este mês — acima da meta 20%.`;
    }
    if (month.expense > month.income && month.income > 0) {
      return "Gastaste mais do que entraste este mês — a revisão semanal ajuda a ajustar.";
    }
    return "Registar movimentos com consistência vale mais do que perfeição.";
  }

  async listAccounts(userId: string, opts?: { includeArchived?: boolean }) {
    const { accounts, balances } = await this.loadUserFinance(userId, opts);
    return accounts.map((a) => this.mapAccount(a, balances.get(a.id) ?? 0));
  }

  async getAccount(userId: string, accountId: string) {
    const finance = await this.loadUserFinance(userId);
    const account = finance.accounts.find((a) => a.id === accountId);
    if (!account) {
      throw new AppError(404, { code: "NOT_FOUND", message: "Conta não encontrada." });
    }
    const balance = finance.balances.get(account.id) ?? 0;
    const cycleSpend =
      account.type === "CREDIT_CARD" && isValidCycleDay(account.billingCycleDay)
        ? this.computeCycleSpend(account.id, account.billingCycleDay, finance.movements)
        : undefined;
    return this.mapAccount(account, balance, cycleSpend);
  }

  async createAccount(
    userId: string,
    input: z.infer<typeof createAccountSchema>,
    hints?: FinanceLocaleHints
  ) {
    const profile = await this.ensureProfile(userId, hints);
    const count = await this.prisma.financeAccount.count({ where: { userId } });
    const balance = normalizeInitialBalance(input.type, input.initialBalance);
    const date = input.initialBalanceDate
      ? this.parseDateOnly(input.initialBalanceDate)
      : new Date();

    const liability = this.liabilityDataFromInput(input.type, input);

    const account = await this.prisma.financeAccount.create({
      data: {
        userId,
        name: input.name.trim(),
        type: input.type,
        currency: input.currency ?? profile.currency,
        icon: input.icon,
        color: input.color,
        initialBalance: balance,
        initialBalanceDate: date,
        institution: input.institution,
        maskedIdentifier: input.maskedIdentifier,
        includeInNetWorth: input.includeInNetWorth ?? true,
        sortOrder: count,
        ...liability,
      },
    });

    const updates: Record<string, string> = {};
    if (input.type === "CHECKING" && !profile.defaultExpenseAccountId) {
      updates.defaultExpenseAccountId = account.id;
      updates.defaultIncomeAccountId = account.id;
    }
    if (input.type === "SAVINGS" && !profile.defaultSavingsAccountId) {
      updates.defaultSavingsAccountId = account.id;
    }
    if (Object.keys(updates).length) {
      await this.prisma.financialProfile.update({ where: { userId }, data: updates });
    }

    return this.mapAccount(account, balance);
  }

  async updateAccount(
    userId: string,
    accountId: string,
    input: z.infer<typeof updateAccountSchema>
  ) {
    const existing = await this.prisma.financeAccount.findFirst({
      where: { id: accountId, userId },
    });
    if (!existing) {
      throw new AppError(404, { code: "NOT_FOUND", message: "Conta não encontrada." });
    }

    const nextType = input.type ?? existing.type;
    const liability = this.liabilityDataFromInput(nextType, input);

    const account = await this.prisma.financeAccount.update({
      where: { id: accountId },
      data: {
        name: input.name?.trim(),
        type: input.type,
        currency: input.currency,
        icon: input.icon,
        color: input.color,
        initialBalance:
          input.initialBalance !== undefined && input.type
            ? normalizeInitialBalance(input.type, input.initialBalance)
            : input.initialBalance !== undefined
              ? normalizeInitialBalance(existing.type, input.initialBalance)
              : undefined,
        initialBalanceDate: input.initialBalanceDate
          ? this.parseDateOnly(input.initialBalanceDate)
          : undefined,
        institution: input.institution,
        maskedIdentifier: input.maskedIdentifier,
        includeInNetWorth: input.includeInNetWorth,
        isArchived: input.isArchived,
        sortOrder: input.sortOrder,
        ...(input.creditLimit !== undefined ||
        input.billingCycleDay !== undefined ||
        input.paymentDueDay !== undefined ||
        input.aprPercent !== undefined ||
        input.minimumPayment !== undefined ||
        input.originalPrincipal !== undefined ||
        input.type !== undefined
          ? liability
          : {}),
      },
    });

    if (input.isArchived === true && !existing.isArchived) {
      const profile = await this.prisma.financialProfile.findUnique({ where: { userId } });
      if (profile) {
        const profileUpdates: Record<string, null> = {};
        if (profile.defaultExpenseAccountId === accountId) {
          profileUpdates.defaultExpenseAccountId = null;
        }
        if (profile.defaultIncomeAccountId === accountId) {
          profileUpdates.defaultIncomeAccountId = null;
        }
        if (profile.defaultSavingsAccountId === accountId) {
          profileUpdates.defaultSavingsAccountId = null;
        }
        if (Object.keys(profileUpdates).length) {
          await this.prisma.financialProfile.update({
            where: { userId },
            data: profileUpdates,
          });
        }
      }
    }

    const { balances } = await this.loadUserFinance(userId);
    return this.mapAccount(account, balances.get(account.id) ?? 0);
  }

  async listMovements(
    userId: string,
    opts?: {
      accountId?: string;
      type?: "EXPENSE" | "INCOME" | "TRANSFER" | "ADJUSTMENT";
      categoryId?: string;
      dateFrom?: string;
      dateTo?: string;
      q?: string;
      limit?: number;
    }
  ) {
    const and: Array<Record<string, unknown>> = [{ userId }];

    if (opts?.accountId) {
      and.push({
        OR: [{ accountId: opts.accountId }, { transferDestAccountId: opts.accountId }],
      });
    }

    if (opts?.type) {
      and.push({ type: opts.type });
    }

    if (opts?.categoryId) {
      and.push({ categoryId: opts.categoryId });
    }

    if (opts?.dateFrom || opts?.dateTo) {
      and.push({
        date: {
          ...(opts.dateFrom ? { gte: this.parseDateOnly(opts.dateFrom) } : {}),
          ...(opts.dateTo ? { lte: this.parseDateOnly(opts.dateTo) } : {}),
        },
      });
    }

    if (opts?.q) {
      and.push({
        OR: [
          { note: { contains: opts.q, mode: "insensitive" } },
          { account: { name: { contains: opts.q, mode: "insensitive" } } },
          { category: { name: { contains: opts.q, mode: "insensitive" } } },
          { transferDestAccount: { name: { contains: opts.q, mode: "insensitive" } } },
        ],
      });
    }

    await this.packMovementsIfNeeded(userId);

    const [movements, rollups] = await Promise.all([
      this.prisma.financeMovement.findMany({
        where: { AND: and },
        include: this.movementInclude(),
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      }),
      this.prisma.financeMovementRollup.findMany({
        where: { userId },
        orderBy: { sequence: "desc" },
      }),
    ]);

    const filteredRollups = rollups.filter((r) => rollupMatchesListFilters(r, opts));

    const limit = opts?.limit ?? 200;
    const clientLinks = await loadClientFinanceLinkMap(this.prisma, userId);
    return this.buildMovementFeed(movements, filteredRollups, limit, clientLinks);
  }

  async getMovementRollup(userId: string, rollupId: string) {
    const rollup = await this.prisma.financeMovementRollup.findFirst({
      where: { id: rollupId, userId },
    });
    if (!rollup) {
      throw new AppError(404, { code: "NOT_FOUND", message: "Resumo não encontrado." });
    }

    const stored = rollup.totals as RollupTotalsStored;
    const entries =
      Array.isArray(stored.entries) && stored.entries.length > 0
        ? stored.entries
        : await this.legacyLinesToEntries(userId, rollup.id, rollup.lines);

    const from = rollup.periodFrom.toISOString().slice(0, 10);
    const to = rollup.periodTo.toISOString().slice(0, 10);
    const totals = this.rollupTotalsPublic(stored);

    return {
      id: rollup.id,
      sequence: rollup.sequence,
      periodFrom: from,
      periodTo: to,
      count: rollup.count,
      totals,
      entries,
      hasFullDetail: Array.isArray(stored.entries) && stored.entries.length > 0,
    };
  }

  /** Resumos antigos só tinham `lines` — reconstrói lista mínima para consulta. */
  private async legacyLinesToEntries(
    userId: string,
    rollupId: string,
    linesJson: unknown
  ): Promise<RollupEntry[]> {
    const lines = linesJson as RollupLine[];
    if (!Array.isArray(lines)) return [];

    const accounts = await this.prisma.financeAccount.findMany({
      where: { userId },
      select: { id: true, name: true },
    });
    const nameById = new Map(accounts.map((a) => [a.id, a.name]));

    return lines.map((line, index) => ({
      id: `${rollupId}-line-${String(index + 1).padStart(2, "0")}`,
      type: line.type,
      accountId: line.accountId,
      accountName: nameById.get(line.accountId) ?? line.accountId,
      transferDestAccountId: line.transferDestAccountId,
      transferDestAccountName: line.transferDestAccountId
        ? (nameById.get(line.transferDestAccountId) ?? line.transferDestAccountId)
        : null,
      amount: line.amount,
      date: "",
      categoryId: null,
      categoryName: null,
      note: "Resumo antigo — data e categoria não guardadas neste lote.",
    }));
  }

  async createMovement(userId: string, input: z.infer<typeof createMovementSchema>) {
    const account = await this.prisma.financeAccount.findFirst({
      where: { id: input.accountId, userId, isArchived: false },
    });
    if (!account) {
      throw new AppError(404, { code: "NOT_FOUND", message: "Conta não encontrada." });
    }

    const date = this.parseDateOnly(input.date);

    if (input.type === "TRANSFER") {
      const dest = await this.prisma.financeAccount.findFirst({
        where: { id: input.transferDestAccountId, userId, isArchived: false },
      });
      if (!dest) {
        throw new AppError(404, { code: "NOT_FOUND", message: "Conta destino não encontrada." });
      }
      if (dest.id === account.id) {
        throw new AppError(400, {
          code: "VALIDATION_ERROR",
          message: "Origem e destino devem ser contas diferentes.",
        });
      }
    }

    if (input.type !== "ADJUSTMENT" && input.categoryId) {
      const cat = await this.prisma.financeCategory.findUnique({
        where: { id: input.categoryId },
      });
      if (!cat) {
        throw new AppError(404, { code: "NOT_FOUND", message: "Categoria não encontrada." });
      }
    }

    const linkedClientRowId =
      input.type === "INCOME" ? input.linkedClientRowId ?? null : null;
    if (linkedClientRowId) {
      const dup = await this.prisma.financeMovement.findFirst({
        where: { userId, linkedClientRowId },
        select: { id: true },
      });
      if (dup) {
        throw new AppError(409, {
          code: "CONFLICT",
          message: "Já existe receita ligada a este cliente.",
        });
      }
    }

    const amount =
      input.type === "ADJUSTMENT" ? input.amount : Math.abs(input.amount);

    const movement = await this.prisma.financeMovement.create({
      data: {
        userId,
        type: input.type,
        accountId: input.accountId,
        transferDestAccountId:
          input.type === "TRANSFER" ? input.transferDestAccountId : null,
        amount,
        date,
        categoryId:
          input.type === "EXPENSE" || input.type === "INCOME"
            ? input.categoryId
            : null,
        note: input.note,
        linkedClientRowId,
      },
      include: this.movementInclude(),
    });

    await this.packMovementsIfNeeded(userId);
    const gamification = await this.rewardReachedGoals(userId);
    const clientLinks = await loadClientFinanceLinkMap(this.prisma, userId);

    let transferSuggestion = null;
    if (input.type === "INCOME") {
      transferSuggestion = await buildPayYourselfTransferSuggestion(this.prisma, userId, {
        accountId: movement.accountId,
        amount: toMoney(movement.amount),
      });
    }

    return {
      movement: this.mapMovement(movement, clientLinks),
      gamification,
      transferSuggestion,
    };
  }

  async listCategories() {
    await this.ensureCategories();
    const rows = await this.prisma.financeCategory.findMany({
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
    });
    return rows.map((c) => ({
      id: c.id,
      kind: c.kind,
      name: c.name,
      icon: c.icon,
    }));
  }

  async listMethods(userId: string, hints?: FinanceLocaleHints) {
    const profile = await this.ensureProfile(userId, hints);
    const progressRows = await this.prisma.userMethodProgress.findMany({
      where: { userId },
    });
    const progressMap = new Map(progressRows.map((p) => [p.methodId, p]));
    return FINANCE_METHODS.map((method) =>
      this.mapMethod(
        method,
        progressMap.get(method.id) ?? null,
        profile.activeMethodId === method.id
      )
    );
  }

  async startMethod(userId: string, methodId: string, hints?: FinanceLocaleHints) {
    const method = getFinanceMethod(methodId);
    if (!method) {
      throw new AppError(404, { code: "NOT_FOUND", message: "Método não encontrado." });
    }

    await this.ensureProfile(userId, hints);
    await this.prisma.userMethodProgress.upsert({
      where: { userId_methodId: { userId, methodId } },
      create: { userId, methodId, stepIndex: 0 },
      update: { stepIndex: 0, completedAt: null, startedAt: new Date() },
    });

    await this.prisma.financialProfile.update({
      where: { userId },
      data: { activeMethodId: methodId, methodStepIndex: 0, onboardingDone: true },
    });

    return this.listMethods(userId, hints);
  }

  async advanceMethodStep(userId: string, hints?: FinanceLocaleHints) {
    const profile = await this.ensureProfile(userId, hints);
    if (!profile.activeMethodId) {
      throw new AppError(409, {
        code: "CONFLICT",
        message: "Nenhum método activo.",
      });
    }

    const method = getFinanceMethod(profile.activeMethodId);
    if (!method) {
      throw new AppError(404, { code: "NOT_FOUND", message: "Método não encontrado." });
    }

    const progress = await this.prisma.userMethodProgress.findUnique({
      where: {
        userId_methodId: { userId, methodId: profile.activeMethodId },
      },
    });

    const current = progress?.stepIndex ?? profile.methodStepIndex;
    const next = current + 1;
    const completed = next >= method.steps.length;

    await this.prisma.userMethodProgress.upsert({
      where: {
        userId_methodId: { userId, methodId: profile.activeMethodId },
      },
      create: {
        userId,
        methodId: profile.activeMethodId,
        stepIndex: completed ? method.steps.length : next,
        completedAt: completed ? new Date() : null,
      },
      update: {
        stepIndex: completed ? method.steps.length : next,
        completedAt: completed ? new Date() : null,
      },
    });

    await this.prisma.financialProfile.update({
      where: { userId },
      data: { methodStepIndex: completed ? method.steps.length : next },
    });

    let gamification = await this.emitFinanceGamification(
      userId,
      financeMethodStepContext(userId, profile.activeMethodId, current)
    );

    if (completed) {
      const completedFeedback = await this.emitFinanceGamification(
        userId,
        financeMethodCompletedContext(userId, profile.activeMethodId)
      );
      if (completedFeedback) gamification = completedFeedback;
    }

    return { methods: await this.listMethods(userId, hints), gamification };
  }

  async submitReview(userId: string, input: z.infer<typeof reviewSchema>) {
    const weekStart = input.weekStart
      ? this.parseDateOnly(input.weekStart)
      : startOfWeek(new Date());

    const { accounts, balances } = await this.loadUserFinance(userId);
    const snapshots =
      input.accountSnapshots ??
      Object.fromEntries(
        accounts.map((a) => [a.id, balances.get(a.id) ?? toMoney(a.initialBalance)])
      );

    const review = await this.prisma.financeWeeklyReview.upsert({
      where: { userId_weekStart: { userId, weekStart } },
      create: {
        userId,
        weekStart,
        answers: input.answers,
        accountSnapshots: snapshots,
      },
      update: {
        answers: input.answers,
        accountSnapshots: snapshots,
      },
    });

    const weekStartIso = review.weekStart.toISOString().slice(0, 10);
    let gamification = await this.emitFinanceGamification(
      userId,
      financeReviewCompletedContext(userId, weekStartIso)
    );

    const streak = await this.countConsecutiveFinanceReviews(userId);
    if (streak >= 4) {
      const month = weekStartIso.slice(0, 7);
      const streakFeedback = await this.emitFinanceGamification(
        userId,
        financeReviewStreakContext(userId, month)
      );
      if (streakFeedback) gamification = streakFeedback;
    }

    return {
      id: review.id,
      weekStart: weekStartIso,
      answers: review.answers,
      accountSnapshots: review.accountSnapshots,
      gamification,
    };
  }

  async suggestMethodHabits(userId: string, methodId: string) {
    const method = getFinanceMethod(methodId);
    if (!method) {
      throw new AppError(404, { code: "NOT_FOUND", message: "Método não encontrado." });
    }

    const habits = getSuggestedHabitsForMethod(methodId);
    if (habits.length === 0) {
      throw new AppError(400, {
        code: "VALIDATION_ERROR",
        message: "Este método não tem hábitos sugeridos.",
      });
    }

    const workspaceIds = await workspaceIdsForUser(this.prisma, userId);
    if (workspaceIds.length === 0) {
      throw new AppError(409, {
        code: "CONFLICT",
        message: "Cria um workspace antes de adicionar hábitos.",
      });
    }

    const habitsDb = await ensureHabitsDatabase(this.prisma, workspaceIds[0]!);
    const props = habitsDb.properties;
    const habitProp = props.find((p) => p.name === "Hábito");
    const freqProp = props.find((p) => p.name === "Frequência");
    const areaProp = props.find((p) => p.name === "Área RPG");
    const doneProp = props.find((p) => p.name.toLowerCase().includes("feito"));
    if (!habitProp || !freqProp) {
      throw new AppError(500, {
        code: "INTERNAL_ERROR",
        message: "Base de hábitos incompleta.",
      });
    }

    const existingRows = await this.prisma.databaseRow.findMany({
      where: { databaseId: habitsDb.id },
      select: { properties: true },
    });
    const existingNames = new Set(
      existingRows
        .map((r) => {
          const p = r.properties as Record<string, unknown>;
          return String(p[habitProp.id] ?? "").trim().toLowerCase();
        })
        .filter(Boolean)
    );

    let created = 0;
    for (const habit of habits) {
      if (existingNames.has(habit.name.toLowerCase())) continue;
      const values: Record<string, unknown> = {
        [habitProp.id]: habit.name,
        [freqProp.id]: habit.frequency,
      };
      if (areaProp) values[areaProp.id] = "Finanças";
      if (doneProp) values[doneProp.id] = false;

      await this.prisma.databaseRow.create({
        data: {
          databaseId: habitsDb.id,
          properties: values as import("@prisma/client").Prisma.InputJsonValue,
        },
      });
      created += 1;
    }

    return { created, skipped: habits.length - created, workspaceId: habitsDb.workspaceId };
  }

  private computeWeekFlowFromMovements(
    movements: {
      type: string;
      amount: unknown;
      categoryId: string | null;
      category: { id: string; name: string } | null;
      transferDestAccount: { type: string } | null;
    }[]
  ): WeekFlowTotals {
    const categoryTotals = new Map<string, { id: string; name: string; total: number }>();
    let income = 0;
    let expense = 0;
    let savingsTransfer = 0;

    for (const m of movements) {
      const amount = Math.abs(toMoney(m.amount));
      if (m.type === "INCOME") income += amount;
      if (m.type === "EXPENSE") {
        expense += amount;
        const id = m.categoryId ?? "uncategorized";
        const name = m.category?.name ?? "Sem categoria";
        const prev = categoryTotals.get(id);
        categoryTotals.set(id, {
          id,
          name,
          total: (prev?.total ?? 0) + amount,
        });
      }
      if (m.type === "TRANSFER" && m.transferDestAccount?.type === "SAVINGS") {
        savingsTransfer += amount;
      }
    }

    const round = (n: number) => Math.round(n * 100) / 100;
    const expenseByCategory: WeekFlowTotals["expenseByCategory"] = {};
    for (const [id, v] of categoryTotals) {
      expenseByCategory[id] = { id, name: v.name, total: round(v.total) };
    }

    return {
      income: round(income),
      expense: round(expense),
      savingsTransfer: round(savingsTransfer),
      movementCount: movements.length,
      expenseByCategory,
    };
  }

  async getCurrentReview(userId: string) {
    const weekStart = startOfWeek(new Date());
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    const weekStartIso = weekStart.toISOString().slice(0, 10);
    const weekEndIso = weekEnd.toISOString().slice(0, 10);

    const [review, movements, rollups, profile] = await Promise.all([
      this.prisma.financeWeeklyReview.findUnique({
        where: { userId_weekStart: { userId, weekStart } },
      }),
      this.prisma.financeMovement.findMany({
        where: {
          userId,
          date: { gte: weekStart, lte: weekEnd },
        },
        include: { category: true, transferDestAccount: true },
      }),
      this.prisma.financeMovementRollup.findMany({
        where: { userId },
        select: { totals: true, periodFrom: true, periodTo: true, count: true },
      }),
      this.prisma.financialProfile.findUnique({ where: { userId } }),
    ]);

    const detailFlow = this.computeWeekFlowFromMovements(movements);
    const rollupSlices: WeekFlowTotals[] = [];
    for (const rollup of rollups) {
      const stored = rollup.totals as RollupTotalsStored;
      const slice = weekFlowFromRollup(
        stored,
        rollup.periodFrom,
        rollup.periodTo,
        weekStartIso,
        weekEndIso,
        rollup.count
      );
      if (slice) rollupSlices.push(slice);
    }
    const weekFlow = mergeWeekFlowSlices(detailFlow, ...rollupSlices);

    const topExpenseCategories = Object.values(weekFlow.expenseByCategory)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    const activeMethodDef = profile?.activeMethodId
      ? getFinanceMethod(profile.activeMethodId)
      : null;

    return {
      weekStart: weekStart.toISOString().slice(0, 10),
      weekEnd: weekEnd.toISOString().slice(0, 10),
      review: review
        ? {
            id: review.id,
            answers: review.answers as Record<string, string>,
            accountSnapshots: review.accountSnapshots as Record<string, number>,
            createdAt: review.createdAt.toISOString(),
          }
        : null,
      weekSummary: {
        income: weekFlow.income,
        expense: weekFlow.expense,
        net: Math.round((weekFlow.income - weekFlow.expense) * 100) / 100,
        movementCount: weekFlow.movementCount,
        topExpenseCategories,
      },
      activeMethod: activeMethodDef
        ? {
            id: activeMethodDef.id,
            name: activeMethodDef.name,
            currentStepTitle:
              activeMethodDef.steps[profile?.methodStepIndex ?? 0]?.title ?? null,
          }
        : null,
    };
  }

  async listReviews(userId: string, limit = 12) {
    const reviews = await this.prisma.financeWeeklyReview.findMany({
      where: { userId },
      orderBy: { weekStart: "desc" },
      take: limit,
    });
    return reviews.map((r) => ({
      id: r.id,
      weekStart: r.weekStart.toISOString().slice(0, 10),
      answers: r.answers as Record<string, string>,
      accountSnapshots: r.accountSnapshots as Record<string, number>,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async getFocusSnapshot(userId: string) {
    const profile = await this.prisma.financialProfile.findUnique({ where: { userId } });
    if (!profile) {
      return { enabled: false as const };
    }

    const finance = await this.loadUserFinance(userId);
    const { accounts, balances } = finance;
    const activeAccounts = accounts.filter((a) => !a.isArchived);
    if (activeAccounts.length === 0) {
      return {
        enabled: true as const,
        hasAccounts: false,
        currency: profile.currency,
        netWorth: 0,
        savingsRate: 0,
        weeklyReviewPending: true,
        activeMethod: null,
        nextStepLabel: "Cria a tua primeira conta no Modo Finanças",
      };
    }

    const now = new Date();
    const month = monthKey(now);
    const monthFlow = this.computeMonthFlow(finance, month);
    const weekStart = startOfWeek(now);
    const review = await this.prisma.financeWeeklyReview.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
    });

    let activeMethod: {
      id: string;
      name: string;
      stepTitle: string | null;
      stepIndex: number;
      totalSteps: number;
    } | null = null;

    if (profile.activeMethodId) {
      const def = getFinanceMethod(profile.activeMethodId);
      if (def) {
        const idx = Math.min(profile.methodStepIndex, def.steps.length - 1);
        activeMethod = {
          id: def.id,
          name: def.name,
          stepTitle: def.steps[idx]?.title ?? null,
          stepIndex: idx + 1,
          totalSteps: def.steps.length,
        };
      }
    }

    const nextStepLabel = activeMethod?.stepTitle
      ? `Próximo passo: ${activeMethod.stepTitle}`
      : this.buildInsight(monthFlow, null, activeAccounts.length);

    const envelopes = await this.listBudgetsForMonth(userId, month, finance.movements, finance.rollups);
    const overBudgetCount = envelopes.filter((e) => e.limitAmount > 0 && e.spent > e.limitAmount).length;

    return {
      enabled: true as const,
      hasAccounts: true,
      currency: profile.currency,
      netWorth: computeNetWorth(accounts, balances),
      savingsRate: monthFlow.savingsRate,
      weeklyReviewPending: !review,
      activeMethod,
      nextStepLabel,
      overBudgetCount,
    };
  }

  async listBudgetsForMonth(
    userId: string,
    monthKeyStr: string,
    movements?: Awaited<ReturnType<typeof this.loadUserFinance>>["movements"],
    rollups?: Awaited<ReturnType<typeof this.loadUserFinance>>["rollups"]
  ) {
    const monthStart = this.parseMonthStart(monthKeyStr);
    const rows = await this.prisma.financeCategoryBudget.findMany({
      where: { userId, month: monthStart },
      include: { category: true },
    });

    let movs = movements;
    let rollupRows = rollups;
    if (!movs || !rollupRows) {
      const loaded = await this.loadUserFinance(userId);
      movs = movs ?? loaded.movements;
      rollupRows = rollupRows ?? loaded.rollups;
    }

    const spentByCategory = new Map<string, number>();
    for (const m of movs) {
      if (monthKey(m.date) !== monthKeyStr || m.type !== "EXPENSE" || !m.categoryId) continue;
      spentByCategory.set(
        m.categoryId,
        (spentByCategory.get(m.categoryId) ?? 0) + Math.abs(toMoney(m.amount))
      );
    }

    for (const [categoryId, value] of collectRollupCategoryTotalsForMonth(
      rollupRows,
      monthKeyStr,
      "EXPENSE"
    )) {
      if (categoryId === "rollup-compact") continue;
      spentByCategory.set(
        categoryId,
        (spentByCategory.get(categoryId) ?? 0) + value.total
      );
    }

    return rows.map((r) => {
      const limit = toMoney(r.limitAmount);
      const spent = Math.round((spentByCategory.get(r.categoryId) ?? 0) * 100) / 100;
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      return {
        id: r.id,
        categoryId: r.categoryId,
        categoryName: r.category.name,
        limitAmount: limit,
        spent,
        percent,
        remaining: Math.round((limit - spent) * 100) / 100,
      };
    });
  }

  async getBudgets(userId: string, month: string) {
    await this.ensureProfile(userId);
    const items = await this.listBudgetsForMonth(userId, month);
    return { month, items };
  }

  async upsertBudgets(userId: string, input: z.infer<typeof upsertBudgetsSchema>) {
    await this.ensureProfile(userId);
    const monthStart = this.parseMonthStart(input.month);

    const invalid = input.budgets.find(
      (b) => !FINANCE_CATEGORIES.some((c) => c.id === b.categoryId)
    );
    if (invalid) {
      throw new AppError(400, {
        code: "VALIDATION_ERROR",
        message: "Categoria de envelope inválida.",
      });
    }

    await this.prisma.$transaction(
      input.budgets.map((b) =>
        this.prisma.financeCategoryBudget.upsert({
          where: {
            userId_month_categoryId: {
              userId,
              month: monthStart,
              categoryId: b.categoryId,
            },
          },
          create: {
            userId,
            month: monthStart,
            categoryId: b.categoryId,
            limitAmount: b.limitAmount,
          },
          update: { limitAmount: b.limitAmount },
        })
      )
    );

    return this.getBudgets(userId, input.month);
  }

  async listGoals(
    userId: string,
    accounts?: Awaited<ReturnType<typeof this.loadUserFinance>>["accounts"],
    balances?: Map<string, number>
  ) {
    const rows = await this.prisma.financeAccountGoal.findMany({
      where: { userId, status: { not: "PAUSED" } },
      include: { targetAccount: true },
      orderBy: { createdAt: "asc" },
    });

    let accs = accounts;
    let bals = balances;
    if (!accs || !bals) {
      const loaded = await this.loadUserFinance(userId);
      accs = loaded.accounts;
      bals = loaded.balances;
    }

    return rows.map((g) => {
      const account = accs!.find((a) => a.id === g.targetAccountId);
      const balance = account ? (bals!.get(account.id) ?? 0) : 0;
      const target = toMoney(g.targetAmount);
      const current = Math.max(0, balance);
      const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
      return {
        id: g.id,
        name: g.name,
        targetAmount: target,
        currentAmount: Math.round(current * 100) / 100,
        progress,
        targetAccountId: g.targetAccountId,
        targetAccountName: g.targetAccount.name,
        deadline: g.deadline?.toISOString().slice(0, 10) ?? null,
        status: g.status,
        reached: current >= target,
      };
    });
  }

  async createGoal(userId: string, input: z.infer<typeof createGoalSchema>) {
    await this.ensureProfile(userId);
    const account = await this.prisma.financeAccount.findFirst({
      where: { id: input.targetAccountId, userId },
    });
    if (!account) {
      throw new AppError(404, { code: "NOT_FOUND", message: "Conta não encontrada." });
    }

    await this.prisma.financeAccountGoal.create({
      data: {
        userId,
        name: input.name,
        targetAmount: input.targetAmount,
        targetAccountId: input.targetAccountId,
        deadline: input.deadline ? this.parseDateOnly(input.deadline) : null,
      },
    });

    return { goals: await this.listGoals(userId) };
  }

  async updateGoal(
    userId: string,
    goalId: string,
    input: z.infer<typeof updateGoalSchema>
  ) {
    const existing = await this.prisma.financeAccountGoal.findFirst({
      where: { id: goalId, userId },
    });
    if (!existing) {
      throw new AppError(404, { code: "NOT_FOUND", message: "Meta não encontrada." });
    }

    if (input.targetAccountId) {
      const account = await this.prisma.financeAccount.findFirst({
        where: { id: input.targetAccountId, userId },
      });
      if (!account) {
        throw new AppError(404, { code: "NOT_FOUND", message: "Conta não encontrada." });
      }
    }

    await this.prisma.financeAccountGoal.update({
      where: { id: goalId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.targetAmount !== undefined ? { targetAmount: input.targetAmount } : {}),
        ...(input.targetAccountId !== undefined
          ? { targetAccountId: input.targetAccountId }
          : {}),
        ...(input.deadline !== undefined
          ? { deadline: input.deadline ? this.parseDateOnly(input.deadline) : null }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });

    return { goals: await this.listGoals(userId) };
  }

  async deleteGoal(userId: string, goalId: string) {
    const existing = await this.prisma.financeAccountGoal.findFirst({
      where: { id: goalId, userId },
    });
    if (!existing) {
      throw new AppError(404, { code: "NOT_FOUND", message: "Meta não encontrada." });
    }
    await this.prisma.financeAccountGoal.delete({ where: { id: goalId } });
    return { goals: await this.listGoals(userId) };
  }

  async exportCsv(userId: string) {
    const { accounts, movements, rollups, balances } = await this.loadUserFinance(userId, {
      includeArchived: true,
    });
    const goals = await this.listGoals(userId, accounts, balances);
    const month = monthKey(new Date());
    const envelopes = await this.listBudgetsForMonth(userId, month, movements, rollups);
    const generatedAt = new Date().toISOString();

    const rollupEntryRows: (string | number)[][] = [];
    for (const r of rollups) {
      const stored = r.totals as RollupTotalsStored;
      for (const e of stored.entries ?? []) {
        rollupEntryRows.push([
          r.id,
          e.id,
          e.type,
          e.accountName,
          e.date,
          e.amount,
          e.categoryName ?? "",
          e.note ?? "",
        ]);
      }
    }

    const allMovementRows: (string | number)[][] = [
      ...movements.map((m) => [
        "detalhe",
        "",
        m.id,
        m.type,
        m.account.name,
        m.date.toISOString().slice(0, 10),
        toMoney(m.amount),
        m.category?.name ?? "",
        m.note ?? "",
      ]),
      ...rollupEntryRows.map((row) => ["resumo", row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7]]),
    ];

    return buildFinanceExportXlsx(generatedAt, [
      {
        sheetName: "Contas",
        table: {
          header: ["id", "nome", "tipo", "moeda", "saldo", "arquivada"],
          rows: accounts.map((a) => [
            a.id,
            a.name,
            a.type,
            a.currency,
            balances.get(a.id) ?? 0,
            a.isArchived ? "sim" : "nao",
          ]),
        },
      },
      {
        sheetName: "Mov. detalhe",
        table: {
          header: ["id", "tipo", "conta", "data", "valor", "categoria", "nota"],
          rows: movements.map((m) => [
            m.id,
            m.type,
            m.account.name,
            m.date.toISOString().slice(0, 10),
            toMoney(m.amount),
            m.category?.name ?? "",
            m.note ?? "",
          ]),
        },
      },
      {
        sheetName: "Mov. resumo",
        table: {
          header: [
            "id",
            "sequencia",
            "de",
            "ate",
            "quantidade",
            "receitas",
            "despesas",
            "poupanca_transfer",
          ],
          rows: rollups.map((r) => {
            const t = this.rollupTotalsPublic(r.totals);
            return [
              r.id,
              r.sequence,
              r.periodFrom.toISOString().slice(0, 10),
              r.periodTo.toISOString().slice(0, 10),
              r.count,
              t.income,
              t.expense,
              t.savingsTransfer,
            ];
          }),
        },
      },
      {
        sheetName: "Resumo entradas",
        table: {
          header: ["resumo_id", "id", "tipo", "conta", "data", "valor", "categoria", "nota"],
          rows: rollupEntryRows,
        },
      },
      {
        sheetName: "Movimentos",
        table: {
          header: [
            "origem",
            "resumo_id",
            "id",
            "tipo",
            "conta",
            "data",
            "valor",
            "categoria",
            "nota",
          ],
          rows: allMovementRows,
        },
      },
      {
        sheetName: "Envelopes",
        table: {
          header: ["mes", "categoria", "limite", "gasto", "restante", "percentagem"],
          rows: envelopes.map((e) => [
            month,
            e.categoryName,
            e.limitAmount,
            e.spent,
            e.remaining,
            e.percent,
          ]),
        },
      },
      {
        sheetName: "Metas",
        table: {
          header: ["id", "nome", "conta", "objectivo", "actual", "progresso_pct", "estado"],
          rows: goals.map((g) => [
            g.id,
            g.name,
            g.targetAccountName,
            g.targetAmount,
            g.currentAmount,
            g.progress,
            g.status,
          ]),
        },
      },
    ]);
  }

  async submitQuestionnaire(userId: string, answers: FinanceQuestionnaireAnswers) {
    await this.ensureProfile(userId);
    const { accounts } = await this.loadUserFinance(userId);
    const active = accounts.filter((a) => !a.isArchived);
    const suggestion = suggestMethodFromQuestionnaire(answers, {
      hasAccounts: active.length > 0,
      hasChecking: active.some((a) => a.type === "CHECKING"),
      hasSavings: active.some((a) => a.type === "SAVINGS"),
    });

    await this.prisma.financialProfile.update({
      where: { userId },
      data: {
        onboardingAnswers: answers,
        questionnaireCompletedAt: new Date(),
      },
    });

    return { suggestion, answers };
  }

  async getDebts(userId: string) {
    const finance = await this.loadUserFinance(userId);
    const active = finance.accounts.filter((a) => !a.isArchived);

    const inputs = active.map((a) => {
      const balance = finance.balances.get(a.id) ?? 0;
      const cycleSpend =
        a.type === "CREDIT_CARD" && isValidCycleDay(a.billingCycleDay)
          ? this.computeCycleSpend(a.id, a.billingCycleDay, finance.movements)
          : undefined;
      return mapAccountToDebtInput(a, balance, cycleSpend);
    });

    const snowball = orderSnowball(inputs);
    const avalanche = orderAvalanche(inputs);
    const totalDebt = snowball.reduce((s, d) => s + d.debtAmount, 0);

    return {
      totalDebt: Math.round(totalDebt * 100) / 100,
      snowball,
      avalanche,
      currency: (await this.ensureProfile(userId)).currency,
    };
  }

  async exportMonthlyPdf(userId: string, monthInput?: string) {
    const profile = await this.ensureProfile(userId);
    const finance = await this.loadUserFinance(userId);
    const month =
      monthInput && /^\d{4}-\d{2}$/.test(monthInput)
        ? monthInput
        : monthKey(new Date());
    const monthFlow = this.computeMonthFlow(finance, month);
    const netWorth = computeNetWorth(finance.accounts, finance.balances);
    const topCategories = this.topCategories(
      finance.movements,
      finance.rollups,
      month,
      "EXPENSE"
    );
    const debts = await this.getDebts(userId);

    const monthLabel = new Date(`${month}-15T12:00:00.000Z`).toLocaleDateString("pt-PT", {
      month: "long",
      year: "numeric",
    });

    return buildFinanceMonthlyPdf({
      monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      generatedAt: new Date().toISOString(),
      currency: profile.currency,
      netWorth,
      month: monthFlow,
      accounts: finance.accounts
        .filter((a) => !a.isArchived)
        .map((a) => ({
          name: a.name,
          type: a.type,
          balance: finance.balances.get(a.id) ?? 0,
          isLiability: isLiabilityAccount(a.type),
        })),
      topCategories: topCategories.map((c) => ({ name: c.name, total: c.total })),
      debts: {
        totalDebt: debts.totalDebt,
        snowballTarget: debts.snowball[0] ?? null,
        avalancheTarget: debts.avalanche[0] ?? null,
        entries: debts.snowball,
      },
    });
  }
}
