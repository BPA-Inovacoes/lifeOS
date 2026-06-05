import type { FinanceCategoryKind } from "@prisma/client";

export type FinanceCategorySeed = {
  id: string;
  kind: FinanceCategoryKind;
  name: string;
  icon: string;
  sortOrder: number;
};

export const FINANCE_CATEGORIES: FinanceCategorySeed[] = [
  { id: "exp-food", kind: "EXPENSE", name: "Alimentação", icon: "utensils", sortOrder: 1 },
  { id: "exp-transport", kind: "EXPENSE", name: "Transportes", icon: "car", sortOrder: 2 },
  { id: "exp-housing", kind: "EXPENSE", name: "Habitação", icon: "home", sortOrder: 3 },
  { id: "exp-utilities", kind: "EXPENSE", name: "Utilities", icon: "zap", sortOrder: 4 },
  { id: "exp-health", kind: "EXPENSE", name: "Saúde", icon: "heart-pulse", sortOrder: 5 },
  { id: "exp-leisure", kind: "EXPENSE", name: "Lazer", icon: "gamepad-2", sortOrder: 6 },
  { id: "exp-shopping", kind: "EXPENSE", name: "Compras", icon: "shopping-bag", sortOrder: 7 },
  { id: "exp-subscriptions", kind: "EXPENSE", name: "Subscrições", icon: "repeat", sortOrder: 8 },
  { id: "exp-education", kind: "EXPENSE", name: "Educação", icon: "graduation-cap", sortOrder: 9 },
  { id: "exp-other", kind: "EXPENSE", name: "Outros", icon: "circle-dashed", sortOrder: 99 },
  { id: "inc-salary", kind: "INCOME", name: "Salário", icon: "briefcase", sortOrder: 1 },
  { id: "inc-freelance", kind: "INCOME", name: "Freelance", icon: "laptop", sortOrder: 2 },
  { id: "inc-refund", kind: "INCOME", name: "Reembolso", icon: "rotate-ccw", sortOrder: 3 },
  { id: "inc-investment", kind: "INCOME", name: "Investimentos", icon: "trending-up", sortOrder: 4 },
  { id: "inc-other", kind: "INCOME", name: "Outros", icon: "circle-dashed", sortOrder: 99 },
];
