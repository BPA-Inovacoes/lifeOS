import type { DatabaseEngine, DatabaseRow } from "@/types/database";
import { apiJson } from "@/services/http";

export type HeatmapCell = {
  date: string;
  level: number;
};

export type HabitFrequency = "daily" | "weekly";

export type RowActivityMeta = {
  streak: number;
  bestStreak: number;
  doneToday: boolean;
  frequency?: HabitFrequency;
  consistency?: number;
  completionRate?: number;
  activeDays?: number;
  heatmap?: HeatmapCell[];
};

export type ClientFinanceLinkMeta = {
  rowId: string;
  clientName: string;
  movementId: string;
  amount: number;
  date: string;
};

export type DatabaseDetail = DatabaseEngine & {
  icon: string | null;
  template: string;
  workspaceId: string;
  rowActivity?: Record<string, RowActivityMeta>;
  clientFinanceLinks?: Record<string, ClientFinanceLinkMeta>;
};

export type DatabaseSummary = {
  id: string;
  name: string;
  icon: string | null;
  template: string;
  updatedAt: string;
};

export async function listDatabases(workspaceId: string) {
  return apiJson<{ databases: DatabaseSummary[] }>(
    `/workspaces/${workspaceId}/databases`
  );
}

export type CreateDatabaseInput = {
  name: string;
  icon?: string;
};

export async function createDatabase(
  workspaceId: string,
  input: CreateDatabaseInput
) {
  return apiJson<{ database: DatabaseSummary }>(
    `/workspaces/${workspaceId}/databases`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function fetchDatabase(workspaceId: string, databaseId: string) {
  return apiJson<{ database: DatabaseDetail }>(
    `/workspaces/${workspaceId}/databases/${databaseId}`
  );
}

export type GamificationFeedback = {
  xpGained: number;
  bonusXp: number;
  lifeCoinsGained: number;
  levelUp: boolean;
  newLevel?: number;
  rankTitle?: string;
  missions: { title: string; xpReward: number }[];
  achievements: { name: string; xpReward: number }[];
};

export type FinanceIncomeSuggestion = {
  clientRowId: string;
  clientName: string;
  amount: number;
  accountId: string | null;
  categoryId: string;
  note: string;
};

export type DatabaseRowResponse = {
  row: DatabaseRow;
  gamification?: GamificationFeedback | null;
  financeSuggestion?: FinanceIncomeSuggestion | null;
};

export async function createDatabaseRow(
  workspaceId: string,
  databaseId: string,
  properties?: Record<string, unknown>
) {
  return apiJson<DatabaseRowResponse>(
    `/workspaces/${workspaceId}/databases/${databaseId}/rows`,
    {
      method: "POST",
      body: JSON.stringify({ properties }),
    }
  );
}

export async function updateDatabaseRow(
  rowId: string,
  properties: Record<string, unknown>
) {
  return apiJson<DatabaseRowResponse>(`/database-rows/${rowId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

export async function deleteDatabaseRow(rowId: string) {
  return apiJson<void>(`/database-rows/${rowId}`, { method: "DELETE" });
}
