import type { DatabaseProperty, DatabaseRow, PropertyType } from "@/types/database";

export type SortDirection = "asc" | "desc";

export type TableSortEntry = {
  propId: string;
  direction: SortDirection;
};

/** Lista de critérios — vazia = ordem original. */
export type TableSortState = TableSortEntry[];

export function emptyTableSort(): TableSortState {
  return [];
}

/** Compatível com sort simples antigo `{ propId, direction }`. */
export function normalizeTableSort(raw: unknown): TableSortState {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter(
      (e): e is TableSortEntry =>
        Boolean(e) &&
        typeof e === "object" &&
        typeof (e as TableSortEntry).propId === "string" &&
        ((e as TableSortEntry).direction === "asc" ||
          (e as TableSortEntry).direction === "desc")
    );
  }
  const legacy = raw as { propId?: string; direction?: SortDirection };
  if (
    legacy.propId &&
    (legacy.direction === "asc" || legacy.direction === "desc")
  ) {
    return [{ propId: legacy.propId, direction: legacy.direction }];
  }
  return [];
}

export function sortEntryForProp(
  sort: TableSortState,
  propId: string
): TableSortEntry | undefined {
  return sort.find((e) => e.propId === propId);
}

export function isSortableProperty(prop: DatabaseProperty): boolean {
  return (
    prop.type === "TEXT" ||
    prop.type === "NUMBER" ||
    prop.type === "DATE" ||
    prop.type === "STATUS" ||
    prop.type === "SELECT" ||
    prop.type === "CHECKBOX" ||
    prop.type === "EMAIL" ||
    prop.type === "URL" ||
    prop.type === "RELATION"
  );
}

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

function compareRelationValues(
  a: unknown,
  b: unknown,
  labels?: Map<string, string>
): number {
  const emptyA = isEmptyValue(a);
  const emptyB = isEmptyValue(b);
  if (emptyA && emptyB) return 0;
  if (emptyA) return 1;
  if (emptyB) return -1;

  const la = labels?.get(String(a)) ?? String(a);
  const lb = labels?.get(String(b)) ?? String(b);
  return la.localeCompare(lb, "pt", { sensitivity: "base" });
}

function comparePropValues(
  a: unknown,
  b: unknown,
  type: PropertyType,
  relationLabels?: Map<string, string>
): number {
  const emptyA = isEmptyValue(a);
  const emptyB = isEmptyValue(b);
  if (emptyA && emptyB) return 0;
  if (emptyA) return 1;
  if (emptyB) return -1;

  if (type === "RELATION") {
    return compareRelationValues(a, b, relationLabels);
  }

  switch (type) {
    case "NUMBER": {
      const na = Number(a);
      const nb = Number(b);
      if (Number.isNaN(na) && Number.isNaN(nb)) return 0;
      if (Number.isNaN(na)) return 1;
      if (Number.isNaN(nb)) return -1;
      return na - nb;
    }
    case "CHECKBOX":
      return Number(Boolean(a)) - Number(Boolean(b));
    case "DATE": {
      const da = String(a).slice(0, 10);
      const db = String(b).slice(0, 10);
      return da.localeCompare(db);
    }
    default:
      return String(a).localeCompare(String(b), "pt", { sensitivity: "base" });
  }
}

export function sortTableRows(
  rows: DatabaseRow[],
  properties: DatabaseProperty[],
  sort: TableSortState,
  relationLabels?: Map<string, string>
): DatabaseRow[] {
  if (sort.length === 0) return rows;

  const entries = sort
    .map((entry) => ({
      entry,
      prop: properties.find((p) => p.id === entry.propId),
    }))
    .filter(
      (item): item is { entry: TableSortEntry; prop: DatabaseProperty } =>
        Boolean(item.prop && isSortableProperty(item.prop))
    );

  if (entries.length === 0) return rows;

  return [...rows].sort((rowA, rowB) => {
    for (const { entry, prop } of entries) {
      const cmp = comparePropValues(
        rowA.properties[prop.id],
        rowB.properties[prop.id],
        prop.type,
        relationLabels
      );
      if (cmp !== 0) {
        return cmp * (entry.direction === "asc" ? 1 : -1);
      }
    }
    return rowA.sortOrder - rowB.sortOrder;
  });
}

export function nextTableSort(
  current: TableSortState,
  propId: string,
  options: { additive: boolean }
): TableSortState {
  const idx = current.findIndex((e) => e.propId === propId);

  if (options.additive) {
    if (idx === -1) {
      return [...current, { propId, direction: "asc" }];
    }
    const entry = current[idx]!;
    if (entry.direction === "asc") {
      return current.map((e, i) =>
        i === idx ? { propId, direction: "desc" as const } : e
      );
    }
    return current.filter((e) => e.propId !== propId);
  }

  if (idx === -1 || current.length !== 1) {
    return [{ propId, direction: "asc" }];
  }
  if (current[0]!.direction === "asc") {
    return [{ propId, direction: "desc" }];
  }
  return [];
}
