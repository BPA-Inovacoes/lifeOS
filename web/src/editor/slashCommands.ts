import type { BlockType } from "@/types/block";

export type SlashCommand = {
  id: string;
  type: BlockType;
  label: string;
  description: string;
  keywords: string[];
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "paragraph",
    type: "PARAGRAPH",
    label: "Texto",
    description: "Parágrafo simples",
    keywords: ["texto", "text", "p", "paragrafo"],
  },
  {
    id: "h1",
    type: "HEADING_1",
    label: "Título 1",
    description: "Secção principal",
    keywords: ["h1", "titulo", "heading"],
  },
  {
    id: "h2",
    type: "HEADING_2",
    label: "Título 2",
    description: "Subsecção",
    keywords: ["h2", "subtitulo"],
  },
  {
    id: "h3",
    type: "HEADING_3",
    label: "Título 3",
    description: "Subsecção menor",
    keywords: ["h3"],
  },
  {
    id: "todo",
    type: "TODO",
    label: "Tarefa",
    description: "Checkbox de tarefa",
    keywords: ["todo", "tarefa", "check"],
  },
  {
    id: "quote",
    type: "QUOTE",
    label: "Citação",
    description: "Bloco de citação",
    keywords: ["quote", "citacao", "citar"],
  },
  {
    id: "callout",
    type: "CALLOUT",
    label: "Destaque",
    description: "Caixa de destaque",
    keywords: ["callout", "destaque", "nota"],
  },
  {
    id: "divider",
    type: "DIVIDER",
    label: "Divisor",
    description: "Linha horizontal",
    keywords: ["divider", "divisor", "linha", "hr"],
  },
  {
    id: "code",
    type: "CODE",
    label: "Código",
    description: "Bloco de código",
    keywords: ["code", "codigo"],
  },
];

export function filterSlashCommands(query: string): SlashCommand[] {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.includes(q) || q.includes(k))
  );
}
