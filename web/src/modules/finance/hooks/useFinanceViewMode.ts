import { useCallback, useState } from "react";

export type FinanceViewMode = "cards" | "grid" | "compact";

export type FinanceViewSection =
  | "accounts"
  | "movements"
  | "methods"
  | "learn"
  | "review-history"
  | "home-accounts"
  | "home-movements";

const STORAGE_PREFIX = "finance-view-";

function readStored(section: FinanceViewSection, fallback: FinanceViewMode): FinanceViewMode {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${section}`);
    if (stored === "cards" || stored === "grid" || stored === "compact") return stored;
  } catch {
    /* ignore */
  }
  return fallback;
}

export function useFinanceViewMode(
  section: FinanceViewSection,
  defaultMode: FinanceViewMode = "cards"
) {
  const [mode, setModeState] = useState<FinanceViewMode>(() =>
    readStored(section, defaultMode)
  );

  const setMode = useCallback(
    (next: FinanceViewMode) => {
      setModeState(next);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${section}`, next);
      } catch {
        /* ignore */
      }
    },
    [section]
  );

  return [mode, setMode] as const;
}

export function financeViewContainerClass(view: FinanceViewMode) {
  switch (view) {
    case "grid":
      return "grid gap-3 sm:grid-cols-2";
    case "compact":
      return "border border-border bg-background/60 divide-y divide-zinc-800";
    default:
      return "space-y-3";
  }
}
