import { useEffect, useMemo, useState } from "react";

import { FinanceButton, FinanceInput } from "@/modules/finance/components/finance-ui";
import {
  useFinanceCategories,
  useFinanceDashboard,
  useFinanceMutations,
} from "@/modules/finance/hooks/useFinance";
import {
  financePanelClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import { formatMoney } from "@/services/financeApi";
import { cn } from "@/lib/utils";
import { toast } from "@/store/toastStore";

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function FinanceEnvelopesPanel() {
  const { data } = useFinanceDashboard();
  const { data: categories = [] } = useFinanceCategories();
  const { saveBudgets } = useFinanceMutations();
  const month = currentMonthKey();
  const currency = data?.profile?.currency ?? "EUR";

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.kind === "EXPENSE"),
    [categories]
  );

  const existing = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of data?.envelopes ?? []) {
      map.set(e.categoryId, e.limitAmount);
    }
    return map;
  }, [data?.envelopes]);

  const [limits, setLimits] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const c of expenseCategories) {
      const v = existing.get(c.id);
      if (v != null) next[c.id] = String(v);
    }
    setLimits(next);
  }, [expenseCategories, existing]);

  const envelopes = data?.envelopes ?? [];

  const save = () => {
    const budgets = Object.entries(limits)
      .map(([categoryId, raw]) => ({
        categoryId,
        limitAmount: parseFloat(raw.replace(",", ".")),
      }))
      .filter((b) => Number.isFinite(b.limitAmount) && b.limitAmount > 0);

    if (budgets.length === 0) {
      toast.error("Define pelo menos um tecto.");
      return;
    }

    saveBudgets.mutate(
      { month, budgets },
      {
        onSuccess: () => toast.success("Envelopes guardados"),
        onError: () => toast.error("Erro ao guardar envelopes."),
      }
    );
  };

  if (!data || data.accounts.length === 0) return null;

  return (
    <section className={cn(financePanelClass, "mt-8 border p-4")}>
      <p className={financeSectionLabelClass}>// envelopes</p>
      <h2 className="mt-1 font-medium text-foreground">Orçamento por categoria</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tectos mensais — o gasto actual vem dos teus movimentos.
      </p>

      {envelopes.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {envelopes.map((e) => (
            <li key={e.id}>
              <div className="flex justify-between text-sm">
                <span className="text-foreground">{e.categoryName}</span>
                <span className="font-mono text-muted-foreground">
                  {formatMoney(e.spent, currency)} / {formatMoney(e.limitAmount, currency)}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden bg-muted">
                <div
                  className={cn(
                    "h-full transition-all",
                    e.percent >= 100 ? "bg-red-600" : "bg-amber-600 dark:bg-amber-500"
                  )}
                  style={{ width: `${Math.min(100, e.percent)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {expenseCategories.slice(0, 8).map((c) => (
          <label key={c.id} className="block text-sm">
            <span className="text-muted-foreground">{c.name}</span>
            <FinanceInput
              type="number"
              min={0}
              step="1"
              placeholder="Tecto mensal"
              value={limits[c.id] ?? ""}
              onChange={(ev) =>
                setLimits((p) => ({ ...p, [c.id]: ev.target.value }))
              }
              className="mt-1"
            />
          </label>
        ))}
      </div>

      <FinanceButton className="mt-4" size="sm" disabled={saveBudgets.isPending} onClick={save}>
        {saveBudgets.isPending ? "A guardar…" : "Guardar envelopes"}
      </FinanceButton>
    </section>
  );
}
