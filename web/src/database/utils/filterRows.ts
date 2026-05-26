import type { DatabaseProperty, DatabaseRow } from "@/types/database";

export type FilterLogic = "and" | "or";

export type TableFiltersState = {
  search: string;
  /** Combinação entre filtros de coluna activos (pesquisa é sempre AND). */
  logic: FilterLogic;
  /** propId → valor codificado; vazio = sem filtro */
  byProperty: Record<string, string>;
};

export const emptyTableFilters = (): TableFiltersState => ({
  search: "",
  logic: "and",
  byProperty: {},
});

/** Compatível com prefs antigas (sem `logic`). */
export function normalizeTableFilters(raw: unknown): TableFiltersState {
  if (!raw || typeof raw !== "object") return emptyTableFilters();
  const o = raw as Partial<TableFiltersState>;
  return {
    search: typeof o.search === "string" ? o.search : "",
    logic: o.logic === "or" ? "or" : "and",
    byProperty:
      o.byProperty && typeof o.byProperty === "object" && !Array.isArray(o.byProperty)
        ? { ...o.byProperty }
        : {},
  };
}

export function hasActiveFilters(filters: TableFiltersState): boolean {
  if (filters.search.trim()) return true;
  return Object.values(filters.byProperty).some((v) => v !== "");
}

export function isFilterableProperty(prop: DatabaseProperty): boolean {
  return (
    prop.type === "STATUS" ||
    prop.type === "SELECT" ||
    prop.type === "CHECKBOX" ||
    prop.type === "RELATION" ||
    prop.type === "DATE" ||
    prop.type === "NUMBER"
  );
}

function activePropertyFilters(
  properties: DatabaseProperty[],
  filters: TableFiltersState
): DatabaseProperty[] {
  return properties.filter((p) => {
    const fv = filters.byProperty[p.id] ?? "";
    return fv !== "" && isFilterableProperty(p);
  });
}

function parseIsoDate(value: string): number | null {
  const d = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const t = new Date(`${d}T12:00:00`).getTime();
  return Number.isNaN(t) ? null : t;
}

function rowDateMs(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const t = new Date(String(raw)).getTime();
  return Number.isNaN(t) ? null : t;
}

function rowNumber(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function matchesDateFilter(raw: unknown, filterValue: string): boolean {
  // Legado
  if (filterValue === "set") {
    return rowDateMs(raw) !== null;
  }
  if (filterValue === "empty") {
    return rowDateMs(raw) === null;
  }

  if (!filterValue.startsWith("date:")) return true;

  const rest = filterValue.slice(5);
  const ms = rowDateMs(raw);

  if (rest === "set") return ms !== null;
  if (rest === "empty") return ms === null;

  if (rest.startsWith("before:")) {
    const bound = parseIsoDate(rest.slice(7));
    if (bound === null || ms === null) return false;
    return ms < bound;
  }
  if (rest.startsWith("after:")) {
    const bound = parseIsoDate(rest.slice(6));
    if (bound === null || ms === null) return false;
    return ms > bound;
  }
  if (rest.startsWith("between:")) {
    const [a, b] = rest.slice(8).split(",");
    const lo = parseIsoDate(a ?? "");
    const hi = parseIsoDate(b ?? "");
    if (lo === null || hi === null || ms === null) return false;
    const min = Math.min(lo, hi);
    const max = Math.max(lo, hi);
    return ms >= min && ms <= max;
  }

  return true;
}

function matchesNumberFilter(raw: unknown, filterValue: string): boolean {
  if (filterValue === "num:set") return rowNumber(raw) !== null;
  if (filterValue === "num:empty") return rowNumber(raw) === null;

  if (!filterValue.startsWith("num:")) return true;

  const rest = filterValue.slice(4);
  const n = rowNumber(raw);

  if (rest.startsWith("eq:")) {
    const target = Number(rest.slice(3));
    if (Number.isNaN(target) || n === null) return false;
    return n === target;
  }
  if (rest.startsWith("gt:")) {
    const target = Number(rest.slice(3));
    if (Number.isNaN(target) || n === null) return false;
    return n > target;
  }
  if (rest.startsWith("gte:")) {
    const target = Number(rest.slice(4));
    if (Number.isNaN(target) || n === null) return false;
    return n >= target;
  }
  if (rest.startsWith("lt:")) {
    const target = Number(rest.slice(3));
    if (Number.isNaN(target) || n === null) return false;
    return n < target;
  }
  if (rest.startsWith("lte:")) {
    const target = Number(rest.slice(4));
    if (Number.isNaN(target) || n === null) return false;
    return n <= target;
  }
  if (rest.startsWith("between:")) {
    const [a, b] = rest.slice(8).split(",");
    const lo = Number(a);
    const hi = Number(b);
    if (Number.isNaN(lo) || Number.isNaN(hi) || n === null) return false;
    const min = Math.min(lo, hi);
    const max = Math.max(lo, hi);
    return n >= min && n <= max;
  }

  return true;
}

function matchesSearch(
  row: DatabaseRow,
  properties: DatabaseProperty[],
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  for (const prop of properties) {
    if (prop.type !== "TEXT" && prop.type !== "EMAIL" && prop.type !== "URL") {
      continue;
    }
    const raw = row.properties[prop.id];
    if (raw == null || raw === "") continue;
    if (String(raw).toLowerCase().includes(q)) return true;
  }
  return false;
}

function matchesPropertyFilter(
  row: DatabaseRow,
  prop: DatabaseProperty,
  filterValue: string
): boolean {
  if (!filterValue) return true;

  const raw = row.properties[prop.id];

  if (prop.type === "CHECKBOX") {
    if (filterValue === "yes") return Boolean(raw) === true;
    if (filterValue === "no") return Boolean(raw) !== true;
    return true;
  }

  if (prop.type === "STATUS" || prop.type === "SELECT") {
    return String(raw ?? "") === filterValue;
  }

  if (prop.type === "RELATION") {
    return String(raw ?? "") === filterValue;
  }

  if (prop.type === "DATE") {
    return matchesDateFilter(raw, filterValue);
  }

  if (prop.type === "NUMBER") {
    return matchesNumberFilter(raw, filterValue);
  }

  return true;
}

export function filterTableRows(
  rows: DatabaseRow[],
  properties: DatabaseProperty[],
  filters: TableFiltersState
): DatabaseRow[] {
  if (!hasActiveFilters(filters)) return rows;

  const active = activePropertyFilters(properties, filters);

  return rows.filter((row) => {
    if (!matchesSearch(row, properties, filters.search)) return false;

    if (active.length === 0) return true;

    if (filters.logic === "or") {
      return active.some((prop) =>
        matchesPropertyFilter(row, prop, filters.byProperty[prop.id] ?? "")
      );
    }

    return active.every((prop) =>
      matchesPropertyFilter(row, prop, filters.byProperty[prop.id] ?? "")
    );
  });
}

/** Texto legível para chips de filtros activos. */
export function describeFilterValue(
  prop: DatabaseProperty,
  encoded: string,
  relationLabel?: string
): string {
  if (prop.type === "CHECKBOX") {
    if (encoded === "yes") return "Sim";
    if (encoded === "no") return "Não";
  }
  if (prop.type === "RELATION" && relationLabel) return relationLabel;

  if (prop.type === "DATE") {
    if (encoded === "set" || encoded === "date:set") return "Com data";
    if (encoded === "empty" || encoded === "date:empty") return "Sem data";
    if (encoded.startsWith("date:before:")) return `Antes de ${encoded.slice(12)}`;
    if (encoded.startsWith("date:after:")) return `Depois de ${encoded.slice(11)}`;
    if (encoded.startsWith("date:between:")) {
      const [a, b] = encoded.slice(13).split(",");
      return `${a} – ${b}`;
    }
  }

  if (prop.type === "NUMBER") {
    if (encoded === "num:set") return "Com valor";
    if (encoded === "num:empty") return "Sem valor";
    if (encoded.startsWith("num:eq:")) return `= ${encoded.slice(7)}`;
    if (encoded.startsWith("num:gt:")) return `> ${encoded.slice(7)}`;
    if (encoded.startsWith("num:gte:")) return `≥ ${encoded.slice(8)}`;
    if (encoded.startsWith("num:lt:")) return `< ${encoded.slice(7)}`;
    if (encoded.startsWith("num:lte:")) return `≤ ${encoded.slice(8)}`;
    if (encoded.startsWith("num:between:")) {
      const [a, b] = encoded.slice(12).split(",");
      return `${a} – ${b}`;
    }
  }

  return encoded;
}
