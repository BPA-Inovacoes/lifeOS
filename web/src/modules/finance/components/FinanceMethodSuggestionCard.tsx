import { Lightbulb } from "lucide-react";

import { FinanceMethodExploreLink } from "@/modules/finance/components/FinanceMethodExploreLink";
import { FinanceButton } from "@/modules/finance/components/finance-ui";
import {
  financeAccentBorder,
  financePanelClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import type { FinanceMethod } from "@/services/financeApi";
import { cn } from "@/lib/utils";

type Props = {
  method: FinanceMethod;
  reason: string;
  disabled?: boolean;
  loading?: boolean;
  onStart: () => void;
};

export function FinanceMethodSuggestionCard({
  method,
  reason,
  disabled,
  loading,
  onStart,
}: Props) {
  return (
    <div className={cn("mt-6 border p-5", financeAccentBorder, financePanelClass)}>
      <p className={financeSectionLabelClass}>// sugerido para ti</p>
      <div className="mt-2 flex items-start gap-3">
        <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-500/80" />
        <div className="min-w-0 flex-1">
          <h2 className="font-medium text-foreground">{method.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{method.tagline}</p>
          <p className="mt-2 text-sm leading-relaxed text-amber-900/90 dark:text-amber-400/90">{reason}</p>
        </div>
      </div>
      <FinanceMethodExploreLink method={method} className="mt-4 w-full sm:w-auto" />
      <FinanceButton
        size="sm"
        className="mt-3"
        disabled={disabled || loading}
        onClick={onStart}
      >
        Começar este método
      </FinanceButton>
    </div>
  );
}
