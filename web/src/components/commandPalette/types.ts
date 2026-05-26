import type { LucideIcon } from "lucide-react";

import type { PaletteKind } from "@/components/commandPalette/paletteRank";

export type PaletteSection = "create" | "go" | "search";

export type PaletteItem = {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  kind: PaletteKind;
  section: PaletteSection;
  run: () => void;
  disabled?: boolean;
  /** Prioridade quando o workspace activo está em contexto. */
  boost?: boolean;
};

export const SECTION_LABELS: Record<PaletteSection, string> = {
  create: "Criar",
  go: "Ir para",
  search: "Resultados",
};
