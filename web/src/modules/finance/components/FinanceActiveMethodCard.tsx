import { Link } from "react-router-dom";

import { FinanceMethodStepPanel } from "@/modules/finance/components/FinanceMethodStepPanel";
import { FinanceMethodProgressBar } from "@/modules/finance/components/FinanceProgressBars";
import { type MethodStepAction } from "@/modules/finance/lib/methodStepActions";
import {
  financeAccentBorder,
  financeLinkClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import { paths } from "@/routes/paths";
import type { FinanceAccount, FinanceMethod, FinanceMovement } from "@/services/financeApi";
import { cn } from "@/lib/utils";

type Props = {
  method: FinanceMethod;
  accounts: FinanceAccount[];
  movements: FinanceMovement[];
  advancing: boolean;
  onAdvance: () => void;
  onStepAction: (action: MethodStepAction) => void;
};

export function FinanceActiveMethodCard({
  method,
  accounts,
  movements,
  advancing,
  onAdvance,
  onStepAction,
}: Props) {
  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className={financeSectionLabelClass}>// método activo</p>
        <Link
          to={paths.finance.methods}
          className={cn("font-mono text-xs uppercase", financeLinkClass)}
        >
          Ver método →
        </Link>
      </div>
      <h2 className="mb-3 font-medium text-foreground">{method.name}</h2>
      <FinanceMethodStepPanel
        method={method}
        accounts={accounts}
        movements={movements}
        advancing={advancing}
        showStepList={false}
        onAdvance={onAdvance}
        onStepAction={onStepAction}
      />
    </div>
  );
}

/** Barra compacta quando só precisamos de progresso visual */
export function FinanceMethodProgressSnippet({ method }: { method: FinanceMethod }) {
  return (
    <div className={cn("border p-3", financeAccentBorder)}>
      <FinanceMethodProgressBar stepIndex={method.stepIndex} totalSteps={method.totalSteps} />
    </div>
  );
}
