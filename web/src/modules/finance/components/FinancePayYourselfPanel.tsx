import { useState } from "react";

import { FinanceButton, FinanceInput } from "@/modules/finance/components/finance-ui";
import { useFinanceMutations, useFinanceProfile } from "@/modules/finance/hooks/useFinance";
import { financePanelClass, financeSectionLabelClass } from "@/modules/finance/styles/financeTokens";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

const DEFAULT_PERCENT = 10;

type Props = {
  className?: string;
  active?: boolean;
};

export function FinancePayYourselfPanel({ className, active = false }: Props) {
  const { data: profile } = useFinanceProfile();
  const { updateProfile } = useFinanceMutations();
  const current = profile?.payYourselfPercent ?? DEFAULT_PERCENT;
  const [percent, setPercent] = useState(String(current));

  if (!active && profile?.activeMethodId !== "pay-yourself-first") return null;

  const save = () => {
    const parsed = parseFloat(percent.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 80) {
      toast.error("Indica uma percentagem entre 1 e 80.");
      return;
    }
    updateProfile.mutate(
      { payYourselfPercent: parsed },
      {
        onSuccess: () => toast.success("Regra de poupança actualizada"),
        onError: () => toast.error("Erro ao guardar."),
      }
    );
  };

  return (
    <section className={className}>
      <p className={financeSectionLabelClass}>// regra automática</p>
      <div className={cn(financePanelClass, "mt-3 space-y-3 p-4")}>
        <p className="text-sm text-muted-foreground">
          Ao registar uma <strong className="text-foreground">receita</strong>, sugerimos transferir
          esta percentagem para a conta poupança por defeito — «paga-te a ti primeiro».
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="pay-yourself-pct" className="font-mono text-xs uppercase text-muted-foreground">
              % a poupar
            </label>
            <FinanceInput
              id="pay-yourself-pct"
              className="mt-1 w-24"
              inputMode="decimal"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
            />
          </div>
          <FinanceButton size="sm" disabled={updateProfile.isPending} onClick={save}>
            Guardar
          </FinanceButton>
        </div>
      </div>
    </section>
  );
}
