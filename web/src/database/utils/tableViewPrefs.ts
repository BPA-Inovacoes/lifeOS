import type { TableColumnPrefs } from "@/database/utils/columnPrefs";
import { normalizeColumnPrefs } from "@/database/utils/columnPrefs";
import {
  normalizeTableFilters,
  type TableFiltersState,
} from "@/database/utils/filterRows";
import {
  emptyTableSort,
  normalizeTableSort,
  type TableSortState,
} from "@/database/utils/sortRows";

export type TableViewPrefs = {
  filters: TableFiltersState;
  sort: TableSortState;
  columns?: TableColumnPrefs;
};

const PREFS_VERSION = 3;

type StoredPrefs = TableViewPrefs & { v?: number };

function storageKey(workspaceId: string, databaseId: string) {
  return `lifeos:table-prefs:${workspaceId}:${databaseId}`;
}

function parsePrefs(raw: string): TableViewPrefs | null {
  try {
    const parsed = JSON.parse(raw) as StoredPrefs;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      filters: normalizeTableFilters(parsed.filters),
      sort: normalizeTableSort(parsed.sort),
      columns: normalizeColumnPrefs(parsed.columns),
    };
  } catch {
    return null;
  }
}

export function loadTableViewPrefs(
  workspaceId: string,
  databaseId: string
): TableViewPrefs | null {
  const key = storageKey(workspaceId, databaseId);

  try {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal) {
      const prefs = parsePrefs(fromLocal);
      if (prefs) return prefs;
    }

    const fromSession = sessionStorage.getItem(key);
    if (fromSession) {
      const prefs = parsePrefs(fromSession);
      if (prefs) {
        saveTableViewPrefs(workspaceId, databaseId, prefs);
        sessionStorage.removeItem(key);
        return prefs;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function saveTableViewPrefs(
  workspaceId: string,
  databaseId: string,
  prefs: TableViewPrefs
) {
  const payload: StoredPrefs = {
    v: PREFS_VERSION,
    filters: normalizeTableFilters(prefs.filters),
    sort: normalizeTableSort(prefs.sort),
    columns: normalizeColumnPrefs(prefs.columns),
  };

  try {
    localStorage.setItem(
      storageKey(workspaceId, databaseId),
      JSON.stringify(payload)
    );
  } catch {
    /* quota / private mode */
  }
}

export { emptyTableSort };
