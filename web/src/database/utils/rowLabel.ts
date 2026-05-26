import type { DatabaseProperty } from "@/types/database";

type PropertyLike = Pick<DatabaseProperty, "id" | "type" | "name">;

/** Label legível para uma linha (primeira coluna TEXT). */
export function rowLabelFromProperties(
  properties: PropertyLike[],
  rowProperties: Record<string, unknown>
): string {
  const text = properties.find((p) => p.type === "TEXT");
  if (text) {
    const t = String(rowProperties[text.id] ?? "").trim();
    if (t) return t;
  }
  return "Sem nome";
}

/** Mapa rowId → label para sort/filtro de colunas RELATION. */
export function buildRelationLabelMap(
  databases: {
    properties: PropertyLike[];
    rows: { id: string; properties: Record<string, unknown> }[];
  }[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const db of databases) {
    for (const row of db.rows) {
      map.set(row.id, rowLabelFromProperties(db.properties, row.properties));
    }
  }
  return map;
}
