import { useMemo, useState } from "react";

import { LifeOSLoading } from "@/components/LifeOSLoading";
import { AccountFormDialog } from "@/modules/finance/components/AccountFormDialog";
import { toCreateAccountBody } from "@/modules/finance/lib/accountFormPayload";
import { FinanceAccountCard } from "@/modules/finance/components/FinanceAccountCard";
import { FinanceQueryError } from "@/modules/finance/components/FinanceQueryError";
import { FinanceViewToggle } from "@/modules/finance/components/FinanceViewToggle";
import { FinanceButton } from "@/modules/finance/components/finance-ui";
import {
  financeViewContainerClass,
  useFinanceViewMode,
} from "@/modules/finance/hooks/useFinanceViewMode";
import {
  useFinanceAccounts,
  useFinanceCurrency,
  useFinanceMutations,
} from "@/modules/finance/hooks/useFinance";
import {
  financeChipActiveClass,
  financeChipIdleClass,
  financeLoadingMessages,
  financePanelClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

function AccountList({
  accounts,
  currency,
  view,
  dimmed,
}: {
  accounts: ReturnType<typeof useFinanceAccounts>["data"];
  currency: string;
  view: ReturnType<typeof useFinanceViewMode>[0];
  dimmed?: boolean;
}) {
  const list = accounts ?? [];
  if (list.length === 0) return null;

  return (
    <ul
      className={cn(
        "list-none",
        view === "grid" && "grid gap-3 sm:grid-cols-2",
        view === "compact" && financeViewContainerClass("compact"),
        view === "cards" && "space-y-3"
      )}
    >
      {list.map((account) => (
        <li key={account.id}>
          <FinanceAccountCard
            account={account}
            currency={currency}
            dimmed={dimmed}
            view={view}
          />
        </li>
      ))}
    </ul>
  );
}

export function FinanceAccountsPage() {
  const [view, setView] = useFinanceViewMode("accounts");
  const { data: activeAccounts = [], isLoading, isError, refetch } = useFinanceAccounts(false);
  const { data: allAccounts = [] } = useFinanceAccounts(true);
  const { createAccount } = useFinanceMutations();
  const currency = useFinanceCurrency();
  const [open, setOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const archivedAccounts = useMemo(
    () => allAccounts.filter((a) => a.isArchived),
    [allAccounts]
  );

  if (isLoading) {
    return (
      <LifeOSLoading
        variant="finance"
        message="A carregar contas"
        rotatingMessages={financeLoadingMessages}
      />
    );
  }

  if (isError) {
    return (
      <FinanceQueryError
        title="Erro"
        message="Não foi possível carregar contas."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className={financeSectionLabelClass}>// contas</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">Contas</h1>
        <div className="flex items-center gap-2">
          {activeAccounts.length > 0 ? (
            <FinanceViewToggle value={view} onChange={setView} compact />
          ) : null}
          <FinanceButton size="sm" onClick={() => setOpen(true)}>
            Adicionar conta
          </FinanceButton>
        </div>
      </div>

      {activeAccounts.length === 0 ? (
        <p className={cn(financePanelClass, "mt-8 px-4 py-10 text-center text-sm text-muted-foreground")}>
          Começa com conta à ordem + poupança — recomendado no método «Primeiros 30 dias».
        </p>
      ) : (
        <div className="mt-6">
          <AccountList accounts={activeAccounts} currency={currency} view={view} />
        </div>
      )}

      {archivedAccounts.length > 0 ? (
        <section className="mt-10">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className={cn(
              "border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
              showArchived ? financeChipActiveClass : financeChipIdleClass
            )}
          >
            {showArchived ? "Ocultar arquivadas" : `Ver arquivadas (${archivedAccounts.length})`}
          </button>
          {showArchived ? (
            <div className="mt-4">
              <AccountList
                accounts={archivedAccounts}
                currency={currency}
                view={view}
                dimmed
              />
            </div>
          ) : null}
        </section>
      ) : null}

      <AccountFormDialog
        open={open}
        loading={createAccount.isPending}
        currency={currency}
        onClose={() => setOpen(false)}
        onSubmit={(payload) =>
          createAccount.mutate(toCreateAccountBody(payload), {
            onSuccess: () => {
              setOpen(false);
              toast.success("Conta criada");
            },
            onError: () => toast.error("Erro ao criar conta."),
          })
        }
      />
    </div>
  );
}
