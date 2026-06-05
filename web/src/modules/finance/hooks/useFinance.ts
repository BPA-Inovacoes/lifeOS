import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  advanceFinanceMethod,
  createFinanceAccount,
  createFinanceMovement,
  fetchCurrentFinanceReview,
  fetchFinanceReviewHistory,
  fetchFinanceAccount,
  fetchFinanceAccounts,
  fetchFinanceCategories,
  fetchFinanceDashboard,
  fetchFinanceMethods,
  fetchFinanceMovements,
  fetchFinanceProfile,
  startFinanceMethod,
  submitFinanceReview,
  updateFinanceAccount,
  updateFinanceProfile,
  upsertFinanceBudgets,
  createFinanceGoal,
  updateFinanceGoal,
  deleteFinanceGoal,
  submitFinanceQuestionnaire,
  suggestFinanceMethodHabits,
  downloadFinanceExport,
  downloadFinanceMonthlyReport,
  fetchFinanceDebts,
  type FinanceDashboard,
  type FinanceMovementFilters,
  type FinanceQuestionnaireAnswers,
} from "@/services/financeApi";
import { detectClientDefaultCurrency } from "@/modules/finance/financeLocale";
import { applyRowGamificationFeedback } from "@/modules/game/utils/gamificationFeedback";
import { useFinanceTransferSuggestionStore } from "@/store/financeTransferSuggestionStore";

export const financeKeys = {
  all: ["finance"] as const,
  dashboard: ["finance", "dashboard"] as const,
  profile: ["finance", "profile"] as const,
  accounts: (includeArchived?: boolean) =>
    ["finance", "accounts", includeArchived ? "all" : "active"] as const,
  account: (accountId: string) => ["finance", "account", accountId] as const,
  movements: (filters?: FinanceMovementFilters) =>
    ["finance", "movements", filters ?? {}] as const,
  categories: ["finance", "categories"] as const,
  methods: ["finance", "methods"] as const,
  review: ["finance", "review", "current"] as const,
  reviewHistory: ["finance", "review", "history"] as const,
  debts: ["finance", "debts"] as const,
};

function invalidateFinance(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: financeKeys.all });
}

export function useFinanceDashboard() {
  return useQuery({ queryKey: financeKeys.dashboard, queryFn: fetchFinanceDashboard });
}

export function useFinanceProfile() {
  return useQuery({
    queryKey: financeKeys.profile,
    queryFn: async () => {
      const res = await fetchFinanceProfile();
      return res.profile;
    },
  });
}

export function useFinanceCurrency() {
  const { data: profile } = useFinanceProfile();
  return profile?.currency ?? detectClientDefaultCurrency();
}

export function useFinanceAccounts(includeArchived = false) {
  return useQuery({
    queryKey: financeKeys.accounts(includeArchived),
    queryFn: async () => {
      const res = await fetchFinanceAccounts({ includeArchived });
      return res.accounts;
    },
  });
}

export function useFinanceAccount(accountId: string | undefined) {
  return useQuery({
    queryKey: financeKeys.account(accountId ?? ""),
    queryFn: async () => {
      const res = await fetchFinanceAccount(accountId!);
      return res.account;
    },
    enabled: Boolean(accountId),
  });
}

export function useFinanceMovements(filters?: FinanceMovementFilters) {
  return useQuery({
    queryKey: financeKeys.movements(filters),
    queryFn: async () => {
      const res = await fetchFinanceMovements(filters);
      return res.movements;
    },
  });
}

export function useFinanceCategories() {
  return useQuery({ queryKey: financeKeys.categories, queryFn: async () => {
    const res = await fetchFinanceCategories();
    return res.categories;
  }});
}

export function useFinanceMethods() {
  return useQuery({ queryKey: financeKeys.methods, queryFn: async () => {
    const res = await fetchFinanceMethods();
    return res.methods;
  }});
}

export function useFinanceReview() {
  return useQuery({ queryKey: financeKeys.review, queryFn: fetchCurrentFinanceReview });
}

export function useFinanceReviewHistory(limit = 12) {
  return useQuery({
    queryKey: financeKeys.reviewHistory,
    queryFn: async () => {
      const res = await fetchFinanceReviewHistory(limit);
      return res.reviews;
    },
  });
}

export function useFinanceDebts() {
  return useQuery({
    queryKey: financeKeys.debts,
    queryFn: fetchFinanceDebts,
  });
}

export function useFinanceMutations() {
  const qc = useQueryClient();

  const syncDashboard = (data?: FinanceDashboard) => {
    if (data) qc.setQueryData(financeKeys.dashboard, data);
    invalidateFinance(qc);
  };

  const createAccount = useMutation({
    mutationFn: createFinanceAccount,
    onSuccess: () => invalidateFinance(qc),
  });

  const updateAccount = useMutation({
    mutationFn: ({ accountId, body }: { accountId: string; body: Parameters<typeof updateFinanceAccount>[1] }) =>
      updateFinanceAccount(accountId, body),
    onSuccess: () => invalidateFinance(qc),
  });

  const createMovement = useMutation({
    mutationFn: createFinanceMovement,
    onSuccess: (data) => {
      invalidateFinance(qc);
      applyRowGamificationFeedback(qc, data.gamification);
      if (data.transferSuggestion) {
        useFinanceTransferSuggestionStore.getState().open(data.transferSuggestion);
      }
    },
  });

  const startMethod = useMutation({
    mutationFn: startFinanceMethod,
    onSuccess: () => invalidateFinance(qc),
  });

  const advanceMethod = useMutation({
    mutationFn: advanceFinanceMethod,
    onSuccess: (data) => {
      invalidateFinance(qc);
      applyRowGamificationFeedback(qc, data.gamification);
    },
  });

  const submitReview = useMutation({
    mutationFn: submitFinanceReview,
    onSuccess: (data) => {
      invalidateFinance(qc);
      const review = data.review as { gamification?: Parameters<typeof applyRowGamificationFeedback>[1] };
      applyRowGamificationFeedback(qc, review.gamification);
    },
  });

  const suggestMethodHabits = useMutation({
    mutationFn: suggestFinanceMethodHabits,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const updateProfile = useMutation({
    mutationFn: updateFinanceProfile,
    onSuccess: () => invalidateFinance(qc),
  });

  const saveBudgets = useMutation({
    mutationFn: upsertFinanceBudgets,
    onSuccess: () => invalidateFinance(qc),
  });

  const addGoal = useMutation({
    mutationFn: createFinanceGoal,
    onSuccess: () => invalidateFinance(qc),
  });

  const patchGoal = useMutation({
    mutationFn: ({
      goalId,
      body,
    }: {
      goalId: string;
      body: Parameters<typeof updateFinanceGoal>[1];
    }) => updateFinanceGoal(goalId, body),
    onSuccess: () => invalidateFinance(qc),
  });

  const removeGoal = useMutation({
    mutationFn: deleteFinanceGoal,
    onSuccess: () => invalidateFinance(qc),
  });

  const submitQuestionnaire = useMutation({
    mutationFn: submitFinanceQuestionnaire,
    onSuccess: () => {
      invalidateFinance(qc);
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const exportCsv = useMutation({
    mutationFn: downloadFinanceExport,
  });

  const monthlyReport = useMutation({
    mutationFn: (month?: string) => downloadFinanceMonthlyReport(month),
  });

  return {
    createAccount,
    updateAccount,
    createMovement,
    startMethod,
    advanceMethod,
    submitReview,
    updateProfile,
    saveBudgets,
    addGoal,
    patchGoal,
    removeGoal,
    submitQuestionnaire,
    suggestMethodHabits,
    exportCsv,
    monthlyReport,
    syncDashboard,
  };
}

export type { FinanceQuestionnaireAnswers };
