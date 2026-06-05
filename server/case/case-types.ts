export type CaseAppMode = "focus" | "game" | "finance";

export type CaseFinanceAccountOption = { id: string; name: string };
export type CaseFinanceCategoryOption = { id: string; name: string };

export type CaseFinanceContext = {
  enabled: boolean;
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
  accounts: CaseFinanceAccountOption[];
  expenseCategories: CaseFinanceCategoryOption[];
  incomeCategories: CaseFinanceCategoryOption[];
};

export type CaseHabitCatalogEntry = {
  rowId: string;
  title: string;
  workspaceId: string;
  workspaceName: string;
  databaseId: string;
};

export type CaseFocusContext = {
  tasksOpen: number;
  habitsDoneToday: number;
  habitsTotal: number;
  pointsToday: number;
  focusTasks: string[];
  defaultWorkspaceId: string | null;
  defaultWorkspaceName: string | null;
  habitsDatabaseId: string | null;
  workspacesWithHabits: { id: string; name: string; habitsDatabaseId: string | null }[];
  habitsCatalog: CaseHabitCatalogEntry[];
};

export type CaseGameContext = {
  enabled: boolean;
  level: number;
  totalXp: number;
  lifeCoins: number;
  rankTitle: string;
};

export type CaseContextSnapshot = {
  mode: CaseAppMode;
  generatedAt: string;
  finance: CaseFinanceContext;
  focus: CaseFocusContext;
  game: CaseGameContext;
};

export type CaseFinanceSnapshot = {
  accounts: CaseFinanceAccountOption[];
  expenseCategories: CaseFinanceCategoryOption[];
  incomeCategories: CaseFinanceCategoryOption[];
};
