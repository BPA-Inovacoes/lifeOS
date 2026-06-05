import { Check, Circle, Sparkles } from "lucide-react";

import { FinanceMethodProgressBar } from "@/modules/finance/components/FinanceProgressBars";
import { FinanceButton } from "@/modules/finance/components/finance-ui";
import { getMethodStepAction, type MethodStepAction } from "@/modules/finance/lib/methodStepActions";
import { isMethodStepSatisfied } from "@/modules/finance/lib/methodStepProgress";
import {
  financeAccentBorder,
  financeCompletedText,
  financeMetaLabelClass,
  financeSuccessBoxClass,
} from "@/modules/finance/styles/financeTokens";
import type {
  FinanceAccount,
  FinanceMethod,
  FinanceMovement,
} from "@/services/financeApi";
import { cn } from "@/lib/utils";

type Props = {
  method: FinanceMethod;
  accounts: FinanceAccount[];
  movements: FinanceMovement[];
  advancing: boolean;
  showStepList?: boolean;
  onAdvance: () => void;
  onStepAction: (action: MethodStepAction) => void;
};

export function FinanceMethodStepPanel({
  method,
  accounts,
  movements,
  advancing,
  showStepList = true,
  onAdvance,
  onStepAction,
}: Props) {
  const stepIndex = method.stepIndex;
  const action = getMethodStepAction(method.id, stepIndex);
  const satisfied = isMethodStepSatisfied(method.id, stepIndex, { accounts, movements });

  return (
    <div className={cn("border p-5", financeAccentBorder)}>
      <FinanceMethodProgressBar stepIndex={method.stepIndex} totalSteps={method.totalSteps} />

      <p className="mt-3 text-base text-foreground">
        Passo {Math.min(stepIndex + 1, method.totalSteps)} / {method.totalSteps}:{" "}
        <span className="font-medium text-foreground">{method.currentStep?.title}</span>
      </p>
      {method.currentStep?.description ? (
        <div className="mt-3">
          <p className={financeMetaLabelClass}>Instruções</p>
          <p className="mt-2 text-base leading-relaxed text-foreground">
            {method.currentStep.description}
          </p>
        </div>
      ) : null}
      {method.currentStep?.lesson ? (
        <p className="mt-3 border-l-2 border-amber-500/40 pl-3 text-sm leading-relaxed text-amber-900/90 dark:text-amber-400/90">
          {method.currentStep.lesson}
        </p>
      ) : null}

      {satisfied ? (
        <p className={cn("mt-3 px-3 py-2.5 text-sm", financeSuccessBoxClass)}>
          <Sparkles className="mr-1 inline size-3.5" />
          Parece cumprido — conclui o passo quando estiveres pronto.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {action ? (
          <FinanceButton size="sm" onClick={() => onStepAction(action)}>
            {action.label}
          </FinanceButton>
        ) : null}
        <FinanceButton
          size="sm"
          variant={action ? "outline" : "default"}
          disabled={advancing}
          onClick={onAdvance}
        >
          Concluir passo
        </FinanceButton>
      </div>

      {showStepList ? (
        <details className="mt-5 border-t border-border pt-4">
          <summary className={cn("cursor-pointer", financeMetaLabelClass)}>
            Ver todos os passos ({method.totalSteps})
          </summary>
          <ol className="mt-3 space-y-4">
            {method.steps.map((step, idx) => (
              <li
                key={`${method.id}-${idx}`}
                className={cn(
                  "flex gap-2",
                  step.done ? "text-muted-foreground" : step.current ? "text-amber-200" : "text-muted-foreground"
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {step.done ? (
                    <Check className={cn("size-3.5", financeCompletedText)} />
                  ) : step.current ? (
                    <Circle className="size-3.5 fill-amber-500/30 text-amber-500" />
                  ) : (
                    <Circle className="size-3.5 text-zinc-700" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground">{step.title}</span>
                  {step.description ? (
                    <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </span>
                  ) : null}
                  {step.lesson && step.current ? (
                    <span className="mt-2 block border-l border-amber-500/30 pl-2 text-sm leading-relaxed text-amber-900/90 dark:text-amber-400/80">
                      {step.lesson}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </div>
  );
}
