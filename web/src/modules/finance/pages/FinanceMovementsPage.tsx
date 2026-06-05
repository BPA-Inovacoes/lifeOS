import { useEffect, useMemo, useState } from "react";

import { LifeOSLoading } from "@/components/LifeOSLoading";
import { FinanceMovementFilters } from "@/modules/finance/components/FinanceMovementFilters";
import {
  FinanceMovementList,
  summarizeMovements,
} from "@/modules/finance/components/FinanceMovementList";
import { FinanceQueryError } from "@/modules/finance/components/FinanceQueryError";
import { FinanceViewToggle } from "@/modules/finance/components/FinanceViewToggle";
import { FinanceRollupDetailDialog } from "@/modules/finance/components/FinanceRollupDetailDialog";
import { MovementFormDialog } from "@/modules/finance/components/MovementFormDialog";
import { FinanceButton } from "@/modules/finance/components/finance-ui";
import { useFinanceViewMode } from "@/modules/finance/hooks/useFinanceViewMode";
import {
  useFinanceAccounts,
  useFinanceCategories,
  useFinanceCurrency,
  useFinanceMovements,
  useFinanceMutations,
} from "@/modules/finance/hooks/useFinance";
import {
  financeIncomeText,
  financeExpenseText,
  financeLoadingMessages,
  financePanelClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import {
  FINANCE_MOVEMENT_DETAIL_CAP,
  formatMoney,
  type FinanceMovementFilters as MovementFilters,
} from "@/services/financeApi";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

export function FinanceMovementsPage() {
  const [view, setView] = useFinanceViewMode("movements");
  const [filters, setFilters] = useState<MovementFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [open, setOpen] = useState(false);
  const [rollupId, setRollupId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryFilters = useMemo(
    (): MovementFilters => ({
      ...filters,
      q: debouncedQ || undefined,
    }),
    [filters, debouncedQ]
  );

  const { data: movements = [], isLoading, isError, refetch, isFetching } =
    useFinanceMovements(queryFilters);
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: categories = [] } = useFinanceCategories();
  const { createMovement } = useFinanceMutations();
  const currency = useFinanceCurrency();

  const summary = useMemo(() => summarizeMovements(movements), [movements]);
  const hasActiveFilters =
    Boolean(debouncedQ) ||
    Boolean(filters.accountId) ||
    Boolean(filters.type) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  const clearFilters = () => {
    setFilters({});
    setSearchInput("");
    setDebouncedQ("");
  };

  if (isLoading) {
    return (
      <LifeOSLoading
        variant="finance"
        message="A carregar movimentos"
        rotatingMessages={financeLoadingMessages}
      />
    );
  }

  if (isError) {
    return (
      <FinanceQueryError
        title="Erro"
        message="Não foi possível carregar movimentos."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className={financeSectionLabelClass}>// movimentos</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Mantemos até {FINANCE_MOVEMENT_DETAIL_CAP} registos em detalhe; lotes anteriores viram resumos
        únicos (id <span className="font-mono">fin-roll-*</span>).
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">Movimentos</h1>
        <div className="flex items-center gap-2">
          {movements.length > 0 ? (
            <FinanceViewToggle value={view} onChange={setView} compact />
          ) : null}
          <FinanceButton size="sm" disabled={accounts.length === 0} onClick={() => setOpen(true)}>
            Registar
          </FinanceButton>
        </div>
      </div>

      {accounts.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Cria uma conta antes de registar movimentos.</p>
      ) : (
        <>
          <FinanceMovementFilters
            filters={filters}
            searchInput={searchInput}
            accounts={accounts}
            categories={categories}
            onSearchInputChange={setSearchInput}
            onFiltersChange={setFilters}
            onClear={clearFilters}
          />

          {movements.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>
                {movements.length} movimento{movements.length === 1 ? "" : "s"}
                {isFetching ? " · a actualizar…" : ""}
              </span>
              {summary.income > 0 ? (
                <span className={financeIncomeText}>
                  +{formatMoney(summary.income, currency)} receitas
                </span>
              ) : null}
              {summary.expense > 0 ? (
                <span className={financeExpenseText}>
                  −{formatMoney(summary.expense, currency)} despesas
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4">
            {movements.length === 0 ? (
              <p
                className={cn(
                  financePanelClass,
                  "px-4 py-10 text-center text-sm text-muted-foreground"
                )}
              >
                {hasActiveFilters
                  ? "Nenhum movimento corresponde aos filtros."
                  : "Sem movimentos — regista despesas e receitas para ver o fluxo."}
              </p>
            ) : (
              <FinanceMovementList
                movements={movements}
                currency={currency}
                view={view}
                onRollupOpen={setRollupId}
              />
            )}
          </div>
        </>
      )}

      <FinanceRollupDetailDialog
        rollupId={rollupId}
        currency={currency}
        onClose={() => setRollupId(null)}
      />

      <MovementFormDialog
        open={open}
        loading={createMovement.isPending}
        accounts={accounts}
        categories={categories}
        currency={currency}
        defaultAccountId={filters.accountId}
        onClose={() => setOpen(false)}
        onSubmit={(body) =>
          createMovement.mutate(body, {
            onSuccess: () => {
              setOpen(false);
              toast.success("Movimento registado");
            },
            onError: () => toast.error("Erro ao registar."),
          })
        }
      />
    </div>
  );
}
