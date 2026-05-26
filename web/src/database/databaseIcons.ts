import {
  Calendar,
  Database,
  Flame,
  FolderKanban,
  GraduationCap,
  ListTodo,
  Target,
  type LucideIcon,
} from "lucide-react";

const BY_TEMPLATE: Record<string, LucideIcon> = {
  TASKS: ListTodo,
  HABITS: Flame,
  GOALS: Target,
  STUDIES: GraduationCap,
  PROJECTS: FolderKanban,
};

const BY_NAME: Record<string, LucideIcon> = {
  "planeamento semanal": Calendar,
  tarefas: ListTodo,
  hábitos: Flame,
  habitos: Flame,
  objetivos: Target,
  estudos: GraduationCap,
  projetos: FolderKanban,
};

export function resolveDatabaseIcon(
  template: string,
  name?: string
): LucideIcon {
  const nameKey = name?.trim().toLowerCase() ?? "";
  if (nameKey && BY_NAME[nameKey]) return BY_NAME[nameKey];
  if (nameKey.includes("planeamento")) return Calendar;

  return BY_TEMPLATE[template] ?? Database;
}
