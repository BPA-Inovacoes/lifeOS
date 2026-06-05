import {
  Briefcase,
  Calendar,
  Database,
  Flame,
  FolderKanban,
  GraduationCap,
  ListTodo,
  Target,
  type LucideIcon,
} from "lucide-react";

import { resolveWorkspaceIcon } from "@/modules/workspace/workspaceIcons";

const BY_TEMPLATE: Record<string, LucideIcon> = {
  TASKS: ListTodo,
  HABITS: Flame,
  GOALS: Target,
  STUDIES: GraduationCap,
  PROJECTS: FolderKanban,
  CLIENTS: Briefcase,
};

const BY_NAME: Record<string, LucideIcon> = {
  "planeamento semanal": Calendar,
  tarefas: ListTodo,
  hábitos: Flame,
  habitos: Flame,
  objetivos: Target,
  estudos: GraduationCap,
  projetos: FolderKanban,
  clientes: Briefcase,
};

export function resolveDatabaseIcon(
  template: string,
  name?: string,
  icon?: string | null
): LucideIcon {
  if (template === "CUSTOM" && icon) {
    return resolveWorkspaceIcon(icon);
  }

  const nameKey = name?.trim().toLowerCase() ?? "";
  if (nameKey && BY_NAME[nameKey]) return BY_NAME[nameKey];
  if (nameKey.includes("planeamento")) return Calendar;

  return BY_TEMPLATE[template] ?? Database;
}
