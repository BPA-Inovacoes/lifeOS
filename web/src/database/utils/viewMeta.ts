import type { ViewType } from "@/types/database";

export const VIEW_LABELS: Record<ViewType, string> = {
  TABLE: "// tabela",
  BOARD: "// quadro",
  CALENDAR: "// calendário",
  LIST: "// lista",
};

export function formatRowCount(count: number, template?: string): string {
  if (template === "HABITS") {
    return `${count} ${count === 1 ? "hábito" : "hábitos"}`;
  }
  return `${count} ${count === 1 ? "linha" : "linhas"}`;
}

export function addRowButtonLabel(template?: string): string {
  if (template === "HABITS") return "Novo hábito";
  return "Nova linha";
}

export function viewHint(
  view: ViewType,
  template?: string
): string | undefined {
  switch (view) {
    case "TABLE":
      return "Filtros, ordenação e colunas — preferências guardadas na sessão";
    case "BOARD":
      return "Arrasta os cartões entre colunas para mudar o estado";
    case "CALENDAR":
      return "Tarefas com data limite aparecem no mês";
    case "LIST":
      return template === "HABITS"
        ? "Marca feito hoje e acompanha sequências"
        : "Vista compacta para revisão rápida";
    default:
      return undefined;
  }
}
