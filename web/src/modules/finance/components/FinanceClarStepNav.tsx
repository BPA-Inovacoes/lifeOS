import { Check } from "lucide-react";

import {
  CLAR_STEPS,
  type ClarStepId,
} from "@/modules/finance/content/financeLearnClar";
import {
  financeChipActiveClass,
  financeCompletedText,
  financePanelClass,
} from "@/modules/finance/styles/financeTokens";
import { cn } from "@/lib/utils";

type Props = {
  current: ClarStepId;
  completedSteps: ClarStepId[];
  onSelect?: (step: ClarStepId) => void;
};

export function FinanceClarStepNav({ current, completedSteps, onSelect }: Props) {
  return (
    <nav aria-label="Passos Método CLAR" className={cn(financePanelClass, "border p-4")}>
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Método CLAR
      </p>
      <ol className="mt-3 grid gap-2 sm:grid-cols-4">
        {CLAR_STEPS.map((step) => {
          const isActive = step.id === current;
          const isDone = completedSteps.includes(step.id);
          const canSelect = onSelect && (isDone || isActive);

          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!canSelect}
                onClick={() => canSelect && onSelect(step.id)}
                className={cn(
                  "flex w-full flex-col border px-3 py-2.5 text-left transition-colors",
                  isActive && financeChipActiveClass,
                  !isActive && !isDone && "border-border text-muted-foreground",
                  isDone && !isActive && "border-amber-300/50 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/15",
                  canSelect && !isActive && "hover:border-amber-400/50"
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center font-mono text-xs font-semibold",
                      isActive && "bg-amber-700 text-white dark:bg-amber-600",
                      isDone && !isActive && financeCompletedText,
                      !isActive && !isDone && "border border-border text-muted-foreground"
                    )}
                  >
                    {isDone && !isActive ? <Check className="size-3.5" /> : step.letter}
                  </span>
                  <span className="text-sm font-medium text-foreground">{step.label}</span>
                </span>
                <span className="mt-1 pl-8 text-xs text-muted-foreground">{step.hint}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
