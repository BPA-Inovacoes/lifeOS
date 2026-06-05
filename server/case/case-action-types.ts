import type { CaseAppMode, CaseFinanceSnapshot, CaseFocusContext } from "./case-types";

export const CASE_ACTION_TOOLS = [
  "finance.create_account",
  "finance.create_movement",
  "finance.create_goal",
  "focus.create_habit",
  "focus.complete_habit",
] as const;
export type CaseActionTool = (typeof CASE_ACTION_TOOLS)[number];

export type CaseActionPreview = {
  title: string;
  fields: { label: string; value: string }[];
};

export type CaseActionProposalPhase = "form" | "summary";

export type CaseActionFormField = {
  key: string;
  label: string;
  type: "text" | "select" | "number";
  value: string;
  required: boolean;
  readOnly?: boolean;
  options?: { value: string; label: string }[];
};

export type CreateAccountActionPayload = {
  name: string;
  type: "CHECKING" | "SAVINGS" | "CREDIT_CARD" | "INVESTMENT" | "LOAN" | "OTHER";
  initialBalance: number;
};

export type CreateMovementActionPayload = {
  type: "EXPENSE" | "INCOME";
  accountId: string;
  amount: number;
  date: string;
  categoryId?: string;
  note?: string;
};

export type CreateGoalActionPayload = {
  name: string;
  targetAmount: number;
  targetAccountId: string;
  deadline?: string;
};

export type CreateHabitActionPayload = {
  workspaceId: string;
  databaseId: string;
  title: string;
  frequency: "Diário" | "Semanal";
  area: string;
};

export type CompleteHabitActionPayload = {
  rowId: string;
  databaseId: string;
  workspaceId: string;
  title: string;
};

export type CaseActionPayload =
  | CreateAccountActionPayload
  | CreateMovementActionPayload
  | CreateGoalActionPayload
  | CreateHabitActionPayload
  | CompleteHabitActionPayload;

export type CaseActionProposalRecord = {
  id: string;
  userId: string;
  tool: CaseActionTool;
  mode: CaseAppMode;
  phase: CaseActionProposalPhase;
  preview: CaseActionPreview;
  form?: CaseActionFormField[];
  payload: CaseActionPayload;
  currency: string;
  focusSnapshot: CaseFocusContext;
  financeSnapshot: CaseFinanceSnapshot;
  expiresAt: number;
};

export type CaseActionProposalPublic = {
  id: string;
  tool: CaseActionTool;
  phase: CaseActionProposalPhase;
  preview: CaseActionPreview;
  form?: CaseActionFormField[];
  expiresAt: string;
};
