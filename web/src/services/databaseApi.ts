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

export type DatabaseDetail = DatabaseEngine & {
  icon: string | null;
  template: string;
  workspaceId: string;
  rowActivity?: Record<string, RowActivityMeta>;
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

export async function fetchDatabase(workspaceId: string, databaseId: string) {
  return apiJson<{ database: DatabaseDetail }>(
    `/workspaces/${workspaceId}/databases/${databaseId}`
  );
}

export async function createDatabaseRow(
  workspaceId: string,
  databaseId: string,
  properties?: Record<string, unknown>
) {
  return apiJson<{ row: DatabaseRow }>(
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
  return apiJson<{ row: DatabaseRow }>(`/database-rows/${rowId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

export async function deleteDatabaseRow(rowId: string) {
  return apiJson<void>(`/database-rows/${rowId}`, { method: "DELETE" });
}
