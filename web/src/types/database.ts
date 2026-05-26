export const PROPERTY_TYPES = [
  "TEXT",
  "NUMBER",
  "SELECT",
  "MULTI_SELECT",
  "STATUS",
  "CHECKBOX",
  "RELATION",
  "DATE",
  "EMAIL",
  "URL",
  "FORMULA",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const VIEW_TYPES = ["TABLE", "BOARD", "CALENDAR", "LIST"] as const;

export type ViewType = (typeof VIEW_TYPES)[number];

export type DatabaseProperty = {
  id: string;
  name: string;
  type: PropertyType;
  config: Record<string, unknown>;
  sortOrder: number;
};

export type DatabaseView = {
  id: string;
  name: string;
  type: ViewType;
  config: Record<string, unknown>;
  sortOrder: number;
};

export type DatabaseRow = {
  id: string;
  properties: Record<string, unknown>;
  sortOrder: number;
};

/** Contrato do database engine (UI + API futura). */
export type DatabaseEngine = {
  id: string;
  name: string;
  template: string;
  properties: DatabaseProperty[];
  views: DatabaseView[];
  rows: DatabaseRow[];
};
