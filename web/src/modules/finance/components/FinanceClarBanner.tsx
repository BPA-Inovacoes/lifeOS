import { Lightbulb } from "lucide-react";

import { CLAR_STEPS } from "@/modules/finance/content/financeLearnClar";
import { financePanelClass, financeSectionLabelClass } from "@/modules/finance/styles/financeTokens";
import { cn } from "@/lib/utils";

export function FinanceClarBanner() {
  return (
    <aside
      className={cn(
        financePanelClass,
        "border border-amber-300/50 bg-amber-50/80 p-4 dark:border-amber-800/40 dark:bg-amber-950/25"
      )}
    >
      <div className="flex gap-3">
        <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-400" />
        <div>
          <p className={financeSectionLabelClass}>// método clar</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Cada lição segue quatro passos para absorver melhor — sem ler passivamente.
          </p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {CLAR_STEPS.map((s) => (
              <li key={s.id} className="flex gap-2 text-sm">
                <span className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400">
                  {s.letter}
                </span>
                <span>
                  <span className="font-medium text-foreground">{s.label}</span>
                  <span className="text-muted-foreground"> — {s.hint}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </aside>
  );
}
