import { LayoutGrid, LayoutList, Rows3 } from "lucide-react";

import {
  financeChipActiveClass,
  financeChipIdleClass,
} from "@/modules/finance/styles/financeTokens";
import type { FinanceViewMode } from "@/modules/finance/hooks/useFinanceViewMode";
import { cn } from "@/lib/utils";

const OPTIONS: { mode: FinanceViewMode; icon: typeof LayoutList; label: string }[] = [
  { mode: "cards", icon: LayoutList, label: "Cartões" },
  { mode: "grid", icon: LayoutGrid, label: "Grelha" },
  { mode: "compact", icon: Rows3, label: "Compacto" },
];

type Props = {
  value: FinanceViewMode;
  onChange: (mode: FinanceViewMode) => void;
  className?: string;
  /** Ocultar labels em ecrãs pequenos no header */
  compact?: boolean;
};

export function FinanceViewToggle({ value, onChange, className, compact }: Props) {
  return (
    <div
      className={cn("inline-flex border border-border", className)}
      role="group"
      aria-label="Tipo de visualização"
    >
      {OPTIONS.map(({ mode, icon: Icon, label }) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => onChange(mode)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors sm:px-3",
              active ? financeChipActiveClass : financeChipIdleClass,
              !active && "border-transparent"
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            {!compact ? (
              <span className="hidden font-mono text-xs uppercase tracking-wider sm:inline">
                {label}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
