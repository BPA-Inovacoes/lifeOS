/** Templates de base de dados seleccionáveis ao criar um espaço. */
export const WORKSPACE_DATABASE_TEMPLATES = [
  "TASKS",
  "HABITS",
  "GOALS",
  "STUDIES",
  "PROJECTS",
  "WEEKLY_PLANNING",
] as const;

export type WorkspaceDatabaseTemplate =
  (typeof WORKSPACE_DATABASE_TEMPLATES)[number];

export function isWorkspaceDatabaseTemplate(
  value: string
): value is WorkspaceDatabaseTemplate {
  return (WORKSPACE_DATABASE_TEMPLATES as readonly string[]).includes(value);
}

export const WEEKLY_PLANNING_DATABASE_NAME = "Planeamento semanal";

/** Mapeia bases existentes no espaço → templates do picker. */
export function inferTemplatesFromDatabases(
  databases: { template: string; name: string }[]
): WorkspaceDatabaseTemplate[] {
  const out: WorkspaceDatabaseTemplate[] = [];
  for (const db of databases) {
    if (
      db.template === "CUSTOM" &&
      db.name.trim().toLowerCase() ===
        WEEKLY_PLANNING_DATABASE_NAME.toLowerCase()
    ) {
      if (!out.includes("WEEKLY_PLANNING")) out.push("WEEKLY_PLANNING");
      continue;
    }
    if (isWorkspaceDatabaseTemplate(db.template) && !out.includes(db.template)) {
      out.push(db.template);
    }
  }
  return out;
}
