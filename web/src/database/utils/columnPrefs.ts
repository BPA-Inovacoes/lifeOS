import type { DatabaseProperty } from "@/types/database";

export const DEFAULT_COLUMN_WIDTH = 160;
export const MIN_COLUMN_WIDTH = 72;
export const MAX_COLUMN_WIDTH = 480;

export type TableColumnPrefs = {
  hiddenIds: string[];
  widths: Record<string, number>;
  /** Ordem personalizada de propIds (só colunas visíveis). */
  order: string[];
};

export const emptyColumnPrefs = (): TableColumnPrefs => ({
  hiddenIds: [],
  widths: {},
  order: [],
});

export function normalizeColumnPrefs(raw: unknown): TableColumnPrefs {
  if (!raw || typeof raw !== "object") return emptyColumnPrefs();
  const o = raw as Partial<TableColumnPrefs>;
  return {
    hiddenIds: Array.isArray(o.hiddenIds) ? [...o.hiddenIds] : [],
    widths:
      o.widths && typeof o.widths === "object" && !Array.isArray(o.widths)
        ? { ...o.widths }
        : {},
    order: Array.isArray(o.order) ? [...o.order] : [],
  };
}

export function getColumnWidth(
  prefs: TableColumnPrefs,
  propId: string
): number {
  const w = prefs.widths[propId];
  if (w == null || Number.isNaN(w)) return DEFAULT_COLUMN_WIDTH;
  return Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, w));
}

export function visibleProperties(
  properties: DatabaseProperty[],
  hiddenIds: string[]
): DatabaseProperty[] {
  const hidden = new Set(hiddenIds);
  const visible = properties.filter((p) => !hidden.has(p.id));
  return visible.length > 0 ? visible : properties;
}

/** Colunas visíveis na ordem guardada (ou sortOrder do servidor). */
export function orderedVisibleProperties(
  properties: DatabaseProperty[],
  prefs: TableColumnPrefs
): DatabaseProperty[] {
  const visible = visibleProperties(properties, prefs.hiddenIds);
  if (prefs.order.length === 0) return visible;

  const byId = new Map(visible.map((p) => [p.id, p]));
  const ordered: DatabaseProperty[] = [];

  for (const id of prefs.order) {
    const prop = byId.get(id);
    if (prop) {
      ordered.push(prop);
      byId.delete(id);
    }
  }
  for (const prop of visible) {
    if (byId.has(prop.id)) ordered.push(prop);
  }

  return ordered.length > 0 ? ordered : visible;
}

export function toggleColumnHidden(
  prefs: TableColumnPrefs,
  propId: string,
  properties: DatabaseProperty[]
): TableColumnPrefs {
  const hidden = new Set(prefs.hiddenIds);
  if (hidden.has(propId)) {
    hidden.delete(propId);
  } else {
    const visibleCount = properties.filter((p) => !hidden.has(p.id)).length;
    if (visibleCount <= 1) return prefs;
    hidden.add(propId);
  }
  const next = { ...prefs, hiddenIds: [...hidden] };
  return { ...next, order: syncOrderWithVisible(properties, next) };
}

export function setColumnWidth(
  prefs: TableColumnPrefs,
  propId: string,
  width: number
): TableColumnPrefs {
  const w = Math.min(
    MAX_COLUMN_WIDTH,
    Math.max(MIN_COLUMN_WIDTH, Math.round(width))
  );
  return {
    ...prefs,
    widths: { ...prefs.widths, [propId]: w },
  };
}

export function showAllColumns(prefs: TableColumnPrefs): TableColumnPrefs {
  return { ...prefs, hiddenIds: [] };
}

function syncOrderWithVisible(
  properties: DatabaseProperty[],
  prefs: TableColumnPrefs
): string[] {
  const visibleIds = new Set(
    orderedVisibleProperties(properties, { ...prefs, order: [] }).map((p) => p.id)
  );
  const kept = prefs.order.filter((id) => visibleIds.has(id));
  for (const id of visibleIds) {
    if (!kept.includes(id)) kept.push(id);
  }
  return kept;
}

export function reorderColumn(
  prefs: TableColumnPrefs,
  properties: DatabaseProperty[],
  fromId: string,
  toId: string
): TableColumnPrefs {
  if (fromId === toId) return prefs;

  const visible = orderedVisibleProperties(properties, prefs);
  const ids = visible.map((p) => p.id);
  const from = ids.indexOf(fromId);
  const to = ids.indexOf(toId);
  if (from === -1 || to === -1) return prefs;

  const nextIds = [...ids];
  const [moved] = nextIds.splice(from, 1);
  nextIds.splice(to, 0, moved!);

  return { ...prefs, order: nextIds };
}

/** Pesos relativos → % da largura da tabela (evita scroll horizontal). */
const INDEX_COL_WEIGHT = 36;
const ACTIONS_COL_WEIGHT = 44;

export function tableColumnPercents(
  visibleProps: DatabaseProperty[],
  columns: TableColumnPrefs
): Map<string, number> {
  const weights = visibleProps.map((p) => getColumnWidth(columns, p.id));
  const total =
    weights.reduce((a, b) => a + b, 0) + INDEX_COL_WEIGHT + ACTIONS_COL_WEIGHT;
  const map = new Map<string, number>();
  visibleProps.forEach((p, i) => {
    map.set(p.id, (weights[i]! / total) * 100);
  });
  return map;
}
