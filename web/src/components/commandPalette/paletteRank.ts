export type PaletteKind =
  | "create"
  | "nav"
  | "page"
  | "database"
  | "row"
  | "workspace";

const KIND_BASE: Record<PaletteKind, number> = {
  create: 120,
  nav: 90,
  row: 70,
  page: 60,
  database: 50,
  workspace: 40,
};

/** Pontuação maior = aparece primeiro. */
export function scorePaletteItem(
  query: string,
  label: string,
  hint?: string,
  opts?: { kind?: PaletteKind; inActiveWorkspace?: boolean }
): number {
  const q = query.trim().toLowerCase();
  const labelL = label.toLowerCase();
  const hintL = hint?.toLowerCase() ?? "";
  const kind = opts?.kind ?? "nav";
  let score = KIND_BASE[kind];

  if (opts?.inActiveWorkspace) score += 15;

  if (!q) return score;

  if (labelL === q) score += 1000;
  else if (labelL.startsWith(q)) score += 500;
  else if (labelL.includes(q)) score += 220;
  else if (hintL.includes(q)) score += 120;
  else {
    const words = labelL.split(/\s+/);
    if (words.some((w) => w.startsWith(q))) score += 80;
    else return 0;
  }

  if (kind === "create" && /^nov|^criar|^add|^\+/.test(q)) score += 180;
  if (q.length <= 2 && labelL.startsWith(q)) score += 40;

  return score;
}
