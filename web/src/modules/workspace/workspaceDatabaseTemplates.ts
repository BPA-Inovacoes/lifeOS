import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Briefcase,
  Flame,
  FolderKanban,
  GraduationCap,
  ListTodo,
  Target,
} from "lucide-react";

/** Alinhado com `server/utils/workspace-database-templates.ts`. */
export const WORKSPACE_DATABASE_TEMPLATES = [
  "TASKS",
  "HABITS",
  "GOALS",
  "STUDIES",
  "CLIENTS",
  "PROJECTS",
  "WEEKLY_PLANNING",
] as const;

export type WorkspaceDatabaseTemplate =
  (typeof WORKSPACE_DATABASE_TEMPLATES)[number];

export const DEFAULT_WORKSPACE_DATABASES: WorkspaceDatabaseTemplate[] = [
  "TASKS",
  "HABITS",
];

export type WorkspaceDatabaseOption = {
  id: WorkspaceDatabaseTemplate;
  label: string;
  description: string;
  Icon: LucideIcon;
};

export const WORKSPACE_DATABASE_OPTIONS: WorkspaceDatabaseOption[] = [
  {
    id: "TASKS",
    label: "Tarefas",
    description: "Tabela, quadro e calendário",
    Icon: ListTodo,
  },
  {
    id: "HABITS",
    label: "Hábitos",
    description: "Lista diária e sequências",
    Icon: Flame,
  },
  {
    id: "GOALS",
    label: "Objetivos",
    description: "Metas e progresso",
    Icon: Target,
  },
  {
    id: "STUDIES",
    label: "Estudos",
    description: "Disciplinas e exames",
    Icon: GraduationCap,
  },
  {
    id: "CLIENTS",
    label: "Clientes",
    description: "Pipeline comercial e fechos",
    Icon: Briefcase,
  },
  {
    id: "PROJECTS",
    label: "Projetos",
    description: "Relaciona com tarefas",
    Icon: FolderKanban,
  },
  {
    id: "WEEKLY_PLANNING",
    label: "Planeamento semanal",
    description: "Foco da semana",
    Icon: Calendar,
  },
];

const WEEKLY_PLANNING_NAME = "Planeamento semanal";

export function isWorkspaceDatabaseTemplate(
  value: string
): value is WorkspaceDatabaseTemplate {
  return (WORKSPACE_DATABASE_TEMPLATES as readonly string[]).includes(value);
}

/** Mapeia bases existentes no espaço → templates do picker. */
export function inferTemplatesFromDatabases(
  databases: { template: string; name: string }[]
): WorkspaceDatabaseTemplate[] {
  const out: WorkspaceDatabaseTemplate[] = [];
  for (const db of databases) {
    if (
      db.template === "CUSTOM" &&
      db.name.trim().toLowerCase() === WEEKLY_PLANNING_NAME.toLowerCase()
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

export function formatSelectedDatabases(
  selected: WorkspaceDatabaseTemplate[]
): string {
  if (selected.length === 0) return "Nenhuma base de dados";
  const labels = WORKSPACE_DATABASE_OPTIONS.filter((o) =>
    selected.includes(o.id)
  ).map((o) => o.label);
  return labels.join(", ");
}
