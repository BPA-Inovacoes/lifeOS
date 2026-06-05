import { useQuery } from "@tanstack/react-query";
import { Layers } from "lucide-react";

import { AppModal } from "@/components/AppModal";
import { LifeOSLoading } from "@/components/LifeOSLoading";
import { QueryErrorPanel } from "@/components/QueryErrorPanel";
import { FinanceButton } from "@/modules/finance/components/finance-ui";
import {
  financeExpenseText,
  financeIncomeText,
  financeModalClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import {
  fetchFinanceMovementRollup,
  formatMoney,
  MOVEMENT_TYPE_LABELS,
  type FinanceRollupEntry,
} from "@/services/financeApi";
import { formatDisplayDate } from "@/lib/datePickerUtils";
import { cn } from "@/lib/utils";

type Props = {
  rollupId: string | null;
  currency: string;
  onClose: () => void;
};

function entryTitle(e: FinanceRollupEntry, showAccount: boolean) {
  if (e.type === "TRANSFER") {
    return showAccount
      ? `Transferência · ${e.accountName} → ${e.transferDestAccountName}`
      : `${e.accountName} → ${e.transferDestAccountName}`;
  }
  return showAccount
    ? `${e.categoryName ?? MOVEMENT_TYPE_LABELS[e.type]} · ${e.accountName}`
    : (e.categoryName ?? MOVEMENT_TYPE_LABELS[e.type]);
}

function entryAmountClass(type: FinanceRollupEntry["type"]) {
  if (type === "INCOME") return financeIncomeText;
  if (type === "EXPENSE") return financeExpenseText;
  return "text-muted-foreground";
}

export function FinanceRollupDetailDialog({ rollupId, currency, onClose }: Props) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["finance", "movement-rollup", rollupId],
    queryFn: async () => {
      const res = await fetchFinanceMovementRollup(rollupId!);
      return res.rollup;
    },
    enabled: Boolean(rollupId),
  });

  return (
    <AppModal
      open={Boolean(rollupId)}
      onClose={onClose}
      ariaLabel="Detalhe do resumo de movimentos"
      panelClassName={cn(financeModalClass, "max-w-lg max-h-[85vh] flex flex-col")}
    >
      {isLoading ? (
        <LifeOSLoading message="A carregar movimentos do resumo" />
      ) : isError || !data ? (
        <QueryErrorPanel
          title="Resumo indisponível"
          message="Não foi possível carregar os movimentos deste lote."
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <div className="flex items-start gap-3 border-b border-border pb-4">
            <Layers className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-400" />
            <div className="min-w-0">
              <p className={financeSectionLabelClass}>// resumo compactado</p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                Lote #{data.sequence} · {data.count} movimentos
              </h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{data.id}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDisplayDate(data.periodFrom)} → {formatDisplayDate(data.periodTo)}
              </p>
              <p className="mt-2 text-sm">
                <span className={financeIncomeText}>+{formatMoney(data.totals.income, currency)}</span>
                {" · "}
                <span className={financeExpenseText}>−{formatMoney(data.totals.expense, currency)}</span>
              </p>
              {!data.hasFullDetail ? (
                <p className="mt-2 text-xs text-amber-800 dark:text-amber-400">
                  Resumo antigo — alguns campos (data, categoria) podem estar incompletos.
                </p>
              ) : null}
            </div>
          </div>

          <ul className="mt-4 min-h-0 flex-1 divide-y divide-border overflow-y-auto">
            {data.entries.map((e) => {
              const prefix = e.type === "EXPENSE" ? "−" : e.type === "INCOME" ? "+" : "";
              return (
                <li key={e.id} className="py-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{entryTitle(e, true)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {e.date ? formatDisplayDate(e.date) : "—"}
                        {e.note ? ` · ${e.note}` : ""}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/80">{e.id}</p>
                    </div>
                    <span className={cn("shrink-0 font-mono text-sm", entryAmountClass(e.type))}>
                      {prefix}
                      {formatMoney(Math.abs(e.amount), currency)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 border-t border-border pt-4">
            <FinanceButton variant="outline" className="w-full" onClick={onClose}>
              Fechar
            </FinanceButton>
          </div>
        </>
      )}
    </AppModal>
  );
}
