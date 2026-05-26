import type { DatabaseEngine, DatabaseRow, DatabaseView, PropertyType } from "@/types/database";

/** Agrupa rows por valor de propriedade (ex.: STATUS para board view). */
export function groupRowsByProperty(
  rows: DatabaseRow[],
  propertyKey: string
): Map<string, DatabaseRow[]> {
  const map = new Map<string, DatabaseRow[]>();
  for (const row of rows) {
    const key = String(row.properties[propertyKey] ?? "Sem valor");
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return map;
}

export function getDefaultView(engine: DatabaseEngine): DatabaseView | undefined {
  return [...engine.views].sort((a, b) => a.sortOrder - b.sortOrder)[0];
}

export function propertyTypeLabel(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    TEXT: "Texto",
    NUMBER: "Número",
    SELECT: "Seleção",
    MULTI_SELECT: "Multi-seleção",
    STATUS: "Estado",
    CHECKBOX: "Checkbox",
    RELATION: "Relação",
    DATE: "Data",
    EMAIL: "Email",
    URL: "URL",
    FORMULA: "Fórmula",
  };
  return labels[type] ?? type;
}
