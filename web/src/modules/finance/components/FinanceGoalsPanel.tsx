import { useState } from "react";
import { Target, Trash2 } from "lucide-react";

import { FinanceButton, FinanceInput, FinanceSelect } from "@/modules/finance/components/finance-ui";
import {
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

export function FinanceGoalsPanel() {
  const { data } = useFinanceDashboard();
  const { addGoal, removeGoal } = useFinanceMutations();
  const [name, setName] = useState("Fundo de emergência");
  const [target, setTarget] = useState("");
  const [accountId, setAccountId] = useState("");

  const currency = data?.profile?.currency ?? "EUR";
  const goals = data?.goals ?? [];
  const savingsAccounts =
    data?.accounts.filter((a) => a.type === "SAVINGS" && !a.isArchived) ?? [];

  const submit = () => {
    const targetAmount = parseFloat(target.replace(",", "."));
    if (!name.trim() || !accountId || !Number.isFinite(targetAmount) || targetAmount <= 0) {
      toast.error("Preenche nome, conta e valor objectivo.");
      return;
    }
    addGoal.mutate(
      { name: name.trim(), targetAmount, targetAccountId: accountId },
      {
        onSuccess: () => {
          toast.success("Meta criada");
          setTarget("");
        },
        onError: () => toast.error("Erro ao criar meta."),
      }
    );
  };

  if (!data || data.accounts.length === 0) return null;

  return (
    <section className={cn(financePanelClass, "mt-8 border p-4")}>
      <p className={financeSectionLabelClass}>// metas</p>
      <h2 className="mt-1 font-medium text-foreground">Metas por conta</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Liga objectivos (ex. emergência) ao saldo de uma conta poupança.
      </p>

      {goals.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {goals.map((g) => (
            <li key={g.id} className="border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-amber-700 dark:text-amber-400" />
                  <div>
                    <p className="font-medium text-foreground">{g.name}</p>
                    <p className="text-xs text-muted-foreground">{g.targetAccountName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-red-600"
                  aria-label="Remover meta"
                  onClick={() =>
                    removeGoal.mutate(g.id, {
                      onSuccess: () => toast.success("Meta removida"),
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <p className="mt-2 font-mono text-sm text-muted-foreground">
                {formatMoney(g.currentAmount, currency)} / {formatMoney(g.targetAmount, currency)}
              </p>
              <div className="mt-2 h-2 overflow-hidden bg-muted">
                <div
                  className={cn(
                    "h-full",
                    g.reached ? "bg-emerald-600" : "bg-amber-600 dark:bg-amber-500"
                  )}
                  style={{ width: `${g.progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{g.progress}% · {g.status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Ainda sem metas definidas.</p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="text-muted-foreground">Nome da meta</span>
          <FinanceInput className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Valor objectivo</span>
          <FinanceInput
            type="number"
            min={0}
            className="mt-1"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Conta</span>
          <FinanceSelect
            className="mt-1"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            <option value="">Escolher…</option>
            {savingsAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </FinanceSelect>
        </label>
      </div>
      <FinanceButton size="sm" className="mt-3" disabled={addGoal.isPending} onClick={submit}>
        Adicionar meta
      </FinanceButton>
    </section>
  );
}
