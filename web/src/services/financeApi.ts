import { API_PREFIX } from "@/constants/env";
import { apiJson } from "@/services/http";
import { getFinanceLocaleHeaders } from "@/modules/finance/financeLocale";
import { useAuthStore } from "@/store/authStore";

function financeApiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const localeHeaders = getFinanceLocaleHeaders();
  const headers = new Headers(init?.headers);
  for (const [key, value] of Object.entries(localeHeaders)) {
    if (!headers.has(key)) headers.set(key, value);
  }
  return apiJson<T>(path, { ...init, headers });
}

export type FinanceAccountType =
  | "CHECKING"
  | "SAVINGS"
  | "CASH"
  | "CREDIT_CARD"
  | "INVESTMENT"
  | "LOAN"
  | "OTHER";

export type FinanceMovementType = "EXPENSE" | "INCOME" | "TRANSFER" | "ADJUSTMENT" | "SUMMARY";

/** Máximo de movimentos em detalhe na BD; lotes de 25 viram resumo fin-roll-* */
export const FINANCE_MOVEMENT_DETAIL_CAP = 25;

export type FinanceMovementFilters = {
  accountId?: string;
  type?: FinanceMovementType;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
};

export type FinanceBillingPeriod = {
  from: string;
  to: string;
  nextClosing: string;
  nextPaymentDue: string | null;
};

export type FinanceAccountLiabilityFields = {
  creditLimit: number | null;
  billingCycleDay: number | null;
  paymentDueDay: number | null;
  aprPercent: number | null;
  minimumPayment: number | null;
  originalPrincipal: number | null;
  billingPeriod: FinanceBillingPeriod | null;
  cycleSpend: number | null;
};

export type FinanceAccount = {
  id: string;
  name: string;
  type: FinanceAccountType;
  currency: string;
  icon: string | null;
  color: string | null;
  initialBalance: number;
  initialBalanceDate: string;
  institution: string | null;
  maskedIdentifier: string | null;
  includeInNetWorth: boolean;
  isArchived: boolean;
  sortOrder: number;
  balance: number;
  isLiability: boolean;
} & FinanceAccountLiabilityFields;

export type FinanceDebtEntry = {
  accountId: string;
  name: string;
  type: FinanceAccountType;
  balance: number;
  debtAmount: number;
  aprPercent: number | null;
  minimumPayment: number | null;
  creditLimit: number | null;
  availableCredit: number | null;
  billingPeriod: FinanceBillingPeriod | null;
  originalPrincipal: number | null;
  paidOffPercent: number | null;
  rank: number;
};

export type FinanceDebts = {
  totalDebt: number;
  snowball: FinanceDebtEntry[];
  avalanche: FinanceDebtEntry[];
  currency: string;
};

export type FinanceMovementRollupTotals = {
  income: number;
  expense: number;
  savingsTransfer: number;
};

/** Movimento guardado dentro de um resumo fin-roll-* (id original). */
export type FinanceRollupEntry = {
  id: string;
  type: Exclude<FinanceMovementType, "SUMMARY">;
  accountId: string;
  accountName: string;
  transferDestAccountId: string | null;
  transferDestAccountName: string | null;
  amount: number;
  date: string;
  categoryId: string | null;
  categoryName: string | null;
  note: string | null;
};

export type FinanceMovementRollupDetail = {
  id: string;
  sequence: number;
  periodFrom: string;
  periodTo: string;
  count: number;
  totals: FinanceMovementRollupTotals;
  entries: FinanceRollupEntry[];
  hasFullDetail: boolean;
};

export type FinanceLinkedClient = {
  rowId: string;
  clientName: string;
  workspaceId: string;
  databaseId: string;
};

export type FinanceTransferSuggestion = {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  percent: number;
  note: string;
};

export type FinanceMovement = {
  id: string;
  type: FinanceMovementType;
  accountId: string;
  accountName: string;
  transferDestAccountId: string | null;
  transferDestAccountName: string | null;
  amount: number;
  date: string;
  categoryId: string | null;
  categoryName: string | null;
  note: string | null;
  linkedClientRowId?: string | null;
  linkedClient?: FinanceLinkedClient | null;
  isRollup?: boolean;
  rollupSequence?: number;
  rollupCount?: number;
  rollupPeriodFrom?: string;
  rollupPeriodTo?: string;
  rollupTotals?: FinanceMovementRollupTotals;
};

export type FinanceCategory = {
  id: string;
  kind: "EXPENSE" | "INCOME";
  name: string;
  icon: string | null;
};

export type FinanceMethodStep = {
  title: string;
  description: string;
  lesson?: string;
  done?: boolean;
  current?: boolean;
};

export type FinanceMethod = {
  id: string;
  name: string;
  tagline: string;
  level: string;
  duration: string;
  durationLabel: string;
  totalSteps: number;
  stepIndex: number;
  completed: boolean;
  active: boolean;
  progressPercent: number;
  currentStep: FinanceMethodStep | null;
  steps: FinanceMethodStep[];
};

export type FinanceEnvelope = {
  id: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  spent: number;
  percent: number;
  remaining: number;
};

export type FinanceAccountGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  targetAccountId: string;
  targetAccountName: string;
  deadline: string | null;
  status: string;
  reached: boolean;
};

export type FinanceShortTermGoal = "pay_debt" | "save" | "organize";

export type FinanceQuestionnaireAnswers = {
  hasHighInterestDebt: boolean;
  incomeType: "fixed" | "variable";
  hasEmergencyFund: boolean;
  weeklyTime: "minimal" | "moderate" | "full";
  wantsGameLink: boolean;
  shortTermGoal: FinanceShortTermGoal;
};

export type FinanceQuestionnaireResult = {
  suggestion: { methodId: string; reason: string };
  answers: FinanceQuestionnaireAnswers;
};

export type FinanceDashboard = {
  profile: {
    currency: string;
    onboardingDone: boolean;
    questionnaireCompletedAt: string | null;
    activeMethodId: string | null;
    methodStepIndex: number;
    defaultExpenseAccountId: string | null;
    defaultIncomeAccountId: string | null;
    defaultSavingsAccountId: string | null;
    payYourselfPercent: number | null;
  };
  netWorth: number;
  month: {
    income: number;
    expense: number;
    net: number;
    savingsTransfer: number;
    savingsRate: number;
  };
  accounts: FinanceAccount[];
  recentMovements: FinanceMovement[];
  activeMethod: FinanceMethod | null;
  methods: FinanceMethod[];
  weeklyReview: { weekStart: string; completed: boolean };
  topExpenseCategories: { id: string; name: string; total: number }[];
  envelopes: FinanceEnvelope[];
  goals: FinanceAccountGoal[];
  insight: string;
};

export function fetchFinanceDashboard() {
  return financeApiJson<FinanceDashboard>("/finance/dashboard");
}

export function fetchFinanceAccounts(opts?: { includeArchived?: boolean }) {
  const q = opts?.includeArchived ? "?includeArchived=1" : "";
  return financeApiJson<{ accounts: FinanceAccount[] }>(`/finance/accounts${q}`);
}

export function fetchFinanceAccount(accountId: string) {
  return financeApiJson<{ account: FinanceAccount }>(`/finance/accounts/${encodeURIComponent(accountId)}`);
}

export type FinanceAccountLiabilityInput = {
  creditLimit?: number | null;
  billingCycleDay?: number | null;
  paymentDueDay?: number | null;
  aprPercent?: number | null;
  minimumPayment?: number | null;
  originalPrincipal?: number | null;
};

export function updateFinanceAccount(
  accountId: string,
  body: {
    name?: string;
    type?: FinanceAccountType;
    institution?: string | null;
    maskedIdentifier?: string | null;
    includeInNetWorth?: boolean;
    color?: string | null;
    isArchived?: boolean;
  } & FinanceAccountLiabilityInput
) {
  return financeApiJson<{ account: FinanceAccount }>(
    `/finance/accounts/${encodeURIComponent(accountId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
}

export function createFinanceAccount(
  body: {
    name: string;
    type: FinanceAccountType;
    initialBalance: number;
    initialBalanceDate?: string;
    institution?: string;
    maskedIdentifier?: string;
    includeInNetWorth?: boolean;
    color?: string;
  } & FinanceAccountLiabilityInput
) {
  return financeApiJson<{ account: FinanceAccount }>("/finance/accounts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchFinanceMovements(filters?: FinanceMovementFilters) {
  const params = new URLSearchParams();
  if (filters?.accountId) params.set("accountId", filters.accountId);
  if (filters?.type) params.set("type", filters.type);
  if (filters?.categoryId) params.set("categoryId", filters.categoryId);
  if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters?.dateTo) params.set("dateTo", filters.dateTo);
  if (filters?.q) params.set("q", filters.q);
  const q = params.toString();
  return financeApiJson<{ movements: FinanceMovement[] }>(
    `/finance/movements${q ? `?${q}` : ""}`
  );
}

export function fetchFinanceMovementRollup(rollupId: string) {
  return financeApiJson<{ rollup: FinanceMovementRollupDetail }>(
    `/finance/movement-rollups/${encodeURIComponent(rollupId)}`
  );
}

export function createFinanceMovement(body: Record<string, unknown>) {
  return financeApiJson<{
    movement: FinanceMovement;
    gamification?: import("@/services/databaseApi").GamificationFeedback | null;
    transferSuggestion?: FinanceTransferSuggestion | null;
  }>("/finance/movements", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchFinanceCategories() {
  return financeApiJson<{ categories: FinanceCategory[] }>("/finance/categories");
}

export function fetchFinanceMethods() {
  return financeApiJson<{ methods: FinanceMethod[] }>("/finance/methods");
}

export function startFinanceMethod(methodId: string) {
  return financeApiJson<{ methods: FinanceMethod[] }>(`/finance/methods/${methodId}/start`, {
    method: "POST",
  });
}

export function advanceFinanceMethod() {
  return financeApiJson<{
    methods: FinanceMethod[];
    gamification?: import("@/services/databaseApi").GamificationFeedback | null;
  }>("/finance/methods/active/advance", {
    method: "POST",
  });
}

export function suggestFinanceMethodHabits(methodId: string) {
  return financeApiJson<{ created: number; skipped: number; workspaceId: string }>(
    `/finance/methods/${encodeURIComponent(methodId)}/suggest-habits`,
    { method: "POST" }
  );
}

export function fetchCurrentFinanceReview() {
  return financeApiJson<FinanceReviewContext>("/finance/reviews/current");
}

export function fetchFinanceReviewHistory(limit = 12) {
  return financeApiJson<{ reviews: FinanceWeeklyReview[] }>(
    `/finance/reviews?limit=${limit}`
  );
}

export type FinanceWeeklyReview = {
  id: string;
  weekStart: string;
  answers: Record<string, string>;
  accountSnapshots: Record<string, number>;
  createdAt?: string;
};

export type FinanceReviewContext = {
  weekStart: string;
  weekEnd: string;
  review: FinanceWeeklyReview | null;
  weekSummary: {
    income: number;
    expense: number;
    net: number;
    movementCount: number;
    topExpenseCategories: { id: string; name: string; total: number }[];
  };
  activeMethod: {
    id: string;
    name: string;
    currentStepTitle: string | null;
  } | null;
};

export function submitFinanceReview(body: {
  answers: Record<string, string | undefined>;
  accountSnapshots?: Record<string, number>;
}) {
  return financeApiJson<{ review: unknown }>("/finance/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type FinanceProfile = {
  currency: string;
  onboardingDone: boolean;
  questionnaireCompletedAt: string | null;
  activeMethodId: string | null;
  payYourselfPercent: number | null;
};

export function fetchFinanceProfile() {
  return financeApiJson<{ profile: FinanceProfile }>("/finance/profile");
}

export function updateFinanceProfile(body: {
  currency?: string;
  payYourselfPercent?: number | null;
}) {
  return financeApiJson<{ profile: FinanceProfile }>("/finance/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function fetchFinanceBudgets(month: string) {
  return financeApiJson<{ month: string; items: FinanceEnvelope[] }>(
    `/finance/budgets?month=${encodeURIComponent(month)}`
  );
}

export function upsertFinanceBudgets(body: {
  month: string;
  budgets: { categoryId: string; limitAmount: number }[];
}) {
  return financeApiJson<{ month: string; items: FinanceEnvelope[] }>("/finance/budgets", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function fetchFinanceGoals() {
  return financeApiJson<{ goals: FinanceAccountGoal[] }>("/finance/goals");
}

export function createFinanceGoal(body: {
  name: string;
  targetAmount: number;
  targetAccountId: string;
  deadline?: string;
}) {
  return financeApiJson<{ goals: FinanceAccountGoal[] }>("/finance/goals", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateFinanceGoal(
  goalId: string,
  body: Partial<{
    name: string;
    targetAmount: number;
    targetAccountId: string;
    deadline: string | null;
    status: "ACTIVE" | "REACHED" | "PAUSED";
  }>
) {
  return financeApiJson<{ goals: FinanceAccountGoal[] }>(`/finance/goals/${goalId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteFinanceGoal(goalId: string) {
  return financeApiJson<{ goals: FinanceAccountGoal[] }>(`/finance/goals/${goalId}`, {
    method: "DELETE",
  });
}

export function submitFinanceQuestionnaire(answers: FinanceQuestionnaireAnswers) {
  return financeApiJson<FinanceQuestionnaireResult>("/finance/questionnaire", {
    method: "POST",
    body: JSON.stringify(answers),
  });
}

export function fetchFinanceDebts() {
  return financeApiJson<FinanceDebts>("/finance/debts");
}

export async function downloadFinanceMonthlyReport(month?: string) {
  const token = useAuthStore.getState().token;
  const headers = new Headers(getFinanceLocaleHeaders());
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const base = API_PREFIX.replace(/\/$/, "");
  const q = month ? `?month=${encodeURIComponent(month)}` : "";
  const res = await fetch(`${base}/finance/reports/monthly${q}`, { headers });
  if (!res.ok) throw new Error("Relatório PDF falhou");
  const blob = new Blob([await res.arrayBuffer()], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const label = month ?? new Date().toISOString().slice(0, 7);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lifeos-financas-${label}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadFinanceExport() {
  const token = useAuthStore.getState().token;
  const headers = new Headers(getFinanceLocaleHeaders());
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const base = API_PREFIX.replace(/\/$/, "");
  const res = await fetch(`${base}/finance/export`, { headers });
  if (!res.ok) throw new Error("Exportação falhou");
  const blob = new Blob([await res.arrayBuffer()], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lifeos-financas-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

import { DEFAULT_FINANCE_CURRENCY } from "@/modules/finance/financeCurrencies";

export function formatMoney(value: number, currency: string = DEFAULT_FINANCE_CURRENCY) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(value);
}

export function currencyAmountLabel(currency: string, liability = false) {
  const sample = formatMoney(0, currency);
  const symbol = sample.replace(/[\d\s.,\-]/g, "").trim() || currency;
  return liability ? `Valor em dívida (${symbol})` : `Saldo actual (${symbol})`;
}

export const ACCOUNT_TYPE_LABELS: Record<FinanceAccountType, string> = {
  CHECKING: "Conta à ordem",
  SAVINGS: "Poupança",
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão crédito",
  INVESTMENT: "Investimento",
  LOAN: "Empréstimo",
  OTHER: "Outro",
};

export const METHOD_FOLLOWED_LABELS: Record<"yes" | "partial" | "no", string> = {
  yes: "Sim",
  partial: "Parcialmente",
  no: "Não",
};

export const MOVEMENT_TYPE_LABELS: Record<FinanceMovementType, string> = {
  EXPENSE: "Despesa",
  INCOME: "Receita",
  TRANSFER: "Transferência",
  ADJUSTMENT: "Ajuste",
  SUMMARY: "Resumo (25 mov.)",
};
