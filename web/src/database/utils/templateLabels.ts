const TEMPLATE_LABELS: Record<string, string> = {
  TASKS: "Tarefas",
  HABITS: "Hábitos",
  GOALS: "Objetivos",
  STUDIES: "Estudos",
  PROJECTS: "Projetos",
  CLIENTS: "Clientes",
  CUSTOM: "Personalizada",
  NOTES: "Notas",
};

export function templateLabel(template: string): string {
  return TEMPLATE_LABELS[template] ?? template;
}

export function findDatabaseByTemplate(
  databases: { id: string; name: string; template: string }[],
  template: string
) {
  return databases.find((d) => d.template === template);
}
