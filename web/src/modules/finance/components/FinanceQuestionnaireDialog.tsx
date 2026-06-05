import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppModal } from "@/components/AppModal";
import { FinanceGlossaryLink } from "@/modules/finance/components/FinanceGlossaryLink";
import { FINANCE_QUESTIONNAIRE_STEPS } from "@/modules/finance/components/financeQuestionnaireSteps";
import { FinanceButton } from "@/modules/finance/components/finance-ui";
import type { FinanceQuestionnaireAnswers } from "@/modules/finance/hooks/useFinance";
import { useFinanceDashboard, useFinanceMutations } from "@/modules/finance/hooks/useFinance";
import { financeModalClass } from "@/modules/finance/styles/financeTokens";
import { paths } from "@/routes/paths";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function FinanceQuestionnaireDialog({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { data } = useFinanceDashboard();
  const { submitQuestionnaire, startMethod } = useFinanceMutations();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<FinanceQuestionnaireAnswers>>({});

  const current = FINANCE_QUESTIONNAIRE_STEPS[step];
  if (!current) return null;

  const pick = (value: boolean | string) => {
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    if (step < FINANCE_QUESTIONNAIRE_STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    const complete = next as FinanceQuestionnaireAnswers;
    submitQuestionnaire.mutate(complete, {
      onSuccess: (res) => {
        toast.success(`Sugerimos: ${res.suggestion.methodId}`);
        onClose();
        const method = data?.methods.find((m) => m.id === res.suggestion.methodId);
        if (method && !method.completed) {
          startMethod.mutate(res.suggestion.methodId, {
            onSuccess: () => navigate(paths.finance.method(res.suggestion.methodId)),
          });
        } else {
          navigate(paths.finance.methods);
        }
      },
      onError: () => toast.error("Erro ao guardar questionário."),
    });
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  return (
    <AppModal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      disabled={submitQuestionnaire.isPending}
      ariaLabel="Questionário financeiro"
      panelClassName={financeModalClass}
    >
      <div>
        <p className="font-mono text-xs uppercase text-muted-foreground">
          Pergunta {step + 1} / {FINANCE_QUESTIONNAIRE_STEPS.length}
        </p>
        <h3 className="mt-2 text-lg font-medium text-foreground">{current.title}</h3>
        {current.subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">({current.subtitle})</p>
        ) : null}
        {current.glossaryId ? (
          <p className="mt-2">
            <FinanceGlossaryLink termId={current.glossaryId} showShort />
          </p>
        ) : null}
        <div className="mt-4 space-y-2">
          {current.options.map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              className={cn(
                "w-full border px-4 py-3 text-left text-sm transition-colors",
                "border-border hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
              )}
              disabled={submitQuestionnaire.isPending}
              onClick={() => pick(opt.value)}
            >
              <span className="font-medium text-foreground">{opt.label}</span>
              {opt.hint ? (
                <span className="mt-0.5 block text-xs text-muted-foreground">({opt.hint})</span>
              ) : null}
              {opt.glossaryId ? (
                <span className="mt-1.5 block">
                  <FinanceGlossaryLink termId={opt.glossaryId} />
                </span>
              ) : null}
            </button>
          ))}
        </div>
        {step > 0 ? (
          <FinanceButton variant="ghost" className="mt-4" onClick={() => setStep(step - 1)}>
            Anterior
          </FinanceButton>
        ) : null}
      </div>
    </AppModal>
  );
}
