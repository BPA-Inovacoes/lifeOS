/** Detecta `/comando` no fim do texto (estilo Notion). */
export function detectSlashTrigger(
  text: string
): { slashIndex: number; query: string } | null {
  const match = text.match(/(?:^|\s)\/([^\s/]*)$/);
  if (!match) return null;
  const slashIndex = text.lastIndexOf("/");
  if (slashIndex < 0) return null;
  return { slashIndex, query: match[1] ?? "" };
}

export function textBeforeSlash(text: string, slashIndex: number): string {
  return text.slice(0, slashIndex).replace(/\s+$/, "");
}
