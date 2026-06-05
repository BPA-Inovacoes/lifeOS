import { Coins } from "lucide-react";

import { CurrencySelect } from "@/modules/finance/components/CurrencySelect";
import { getFinanceCurrency } from "@/modules/finance/financeCurrencies";
import { useFinanceMutations, useFinanceProfile } from "@/modules/finance/hooks/useFinance";
import { detectClientDefaultCurrency } from "@/modules/finance/financeLocale";
import {
  financeLabelClass,
  financePanelClass,
} from "@/modules/finance/styles/financeTokens";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Versão minimalista para cabeçalhos — mantém legibilidade */
  compact?: boolean;
};

export function FinanceCurrencyPicker({ className, compact }: Props) {
  const { data: profile } = useFinanceProfile();
  const { updateProfile } = useFinanceMutations();
  const currency = profile?.currency ?? detectClientDefaultCurrency();
  const current = getFinanceCurrency(currency);

  return (
    <div
      className={cn(
        compact ? "space-y-2" : cn("space-y-3 border p-3", financePanelClass, "border-amber-900/25"),
        className
      )}
    >
      <div className={cn("flex items-start gap-2", compact && "items-center justify-between gap-3")}>
        {!compact ? (
          <Coins className="mt-0.5 size-5 shrink-0 text-amber-500/80" aria-hidden />
        ) : null}
        <div className={cn("min-w-0 flex-1", compact && "shrink-0")}>
          <label
            htmlFor="finance-currency"
            className={cn(
              financeLabelClass,
              "block font-medium text-foreground",
              compact && "text-sm"
            )}
          >
            Moeda padrão
          </label>
          {!compact ? (
            <p className="mt-1 text-sm leading-snug text-muted-foreground">
              Património, movimentos e relatórios em{" "}
              <span className="text-muted-foreground">{current?.label ?? currency}</span>.
            </p>
          ) : null}
        </div>
      </div>

      <CurrencySelect
        id="finance-currency"
        className="w-full"
        value={currency}
        disabled={updateProfile.isPending}
        onChange={(code) => {
          if (code === currency) return;
          updateProfile.mutate(
            { currency: code },
            {
              onSuccess: () => {
                const next = getFinanceCurrency(code);
                toast.success(`Moeda: ${next?.shortLabel ?? code}`);
              },
              onError: () => toast.error("Não foi possível alterar a moeda."),
            }
          );
        }}
      />
    </div>
  );
}
