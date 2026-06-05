import { Search, X } from "lucide-react";

import {
  FinanceButton,
  FinanceDateInput,
  FinanceInput,
  FinanceSelect,
} from "@/modules/finance/components/finance-ui";
import {
  financeChipActiveClass,
  financeChipIdleClass,
  financeLabelClass,
  financePanelClass,
} from "@/modules/finance/styles/financeTokens";
import {
  MOVEMENT_TYPE_LABELS,
  type FinanceAccount,
  type FinanceCategory,
  type FinanceMovementFilters,
  type FinanceMovementType,
} from "@/services/financeApi";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS: (FinanceMovementType | "")[] = [
  "",
  "EXPENSE",
  "INCOME",
  "TRANSFER",
  "ADJUSTMENT",
];

type Props = {
  filters: FinanceMovementFilters;
  searchInput: string;
  accounts: FinanceAccount[];
  categories: FinanceCategory[];
  onSearchInputChange: (value: string) => void;
  onFiltersChange: (filters: FinanceMovementFilters) => void;
  onClear: () => void;
};

export function countActiveMovementFilters(filters: FinanceMovementFilters, searchInput: string) {
  let n = 0;
  if (searchInput.trim()) n++;
  if (filters.accountId) n++;
  if (filters.type) n++;
  if (filters.categoryId) n++;
  if (filters.dateFrom) n++;
  if (filters.dateTo) n++;
  return n;
}

export function FinanceMovementFilters({
  filters,
  searchInput,
  accounts,
  categories,
  onSearchInputChange,
  onFiltersChange,
  onClear,
}: Props) {
  const activeCount = countActiveMovementFilters(filters, searchInput);
  const filteredCategories =
    filters.type === "EXPENSE"
      ? categories.filter((c) => c.kind === "EXPENSE")
      : filters.type === "INCOME"
        ? categories.filter((c) => c.kind === "INCOME")
        : categories;

  const patch = (partial: Partial<FinanceMovementFilters>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  return (
    <div className={cn(financePanelClass, "mt-6 space-y-4 p-4")}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <FinanceInput
          className="pl-9"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          placeholder="Pesquisar nota, conta ou categoria…"
          aria-label="Pesquisar movimentos"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((type) => {
          const active = (filters.type ?? "") === type;
          const label = type ? MOVEMENT_TYPE_LABELS[type] : "Todos";
          return (
            <button
              key={type || "all"}
              type="button"
              onClick={() => patch({ type: type || undefined, categoryId: undefined })}
              className={cn(
                "border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
                active ? financeChipActiveClass : financeChipIdleClass
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="mov-filter-account" className={financeLabelClass}>
            Conta
          </label>
          <FinanceSelect
            id="mov-filter-account"
            className="mt-1"
            value={filters.accountId ?? ""}
            onChange={(e) => patch({ accountId: e.target.value || undefined })}
          >
            <option value="">Todas as contas</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </FinanceSelect>
        </div>
        <div>
          <label htmlFor="mov-filter-category" className={financeLabelClass}>
            Categoria
          </label>
          <FinanceSelect
            id="mov-filter-category"
            className="mt-1"
            value={filters.categoryId ?? ""}
            onChange={(e) => patch({ categoryId: e.target.value || undefined })}
          >
            <option value="">Todas as categorias</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FinanceSelect>
        </div>
        <div>
          <label htmlFor="mov-filter-from" className={financeLabelClass}>
            Desde
          </label>
          <FinanceDateInput
            id="mov-filter-from"
            className="mt-1"
            value={filters.dateFrom ?? ""}
            onChange={(e) => patch({ dateFrom: e.target.value || undefined })}
          />
        </div>
        <div>
          <label htmlFor="mov-filter-to" className={financeLabelClass}>
            Até
          </label>
          <FinanceDateInput
            id="mov-filter-to"
            className="mt-1"
            value={filters.dateTo ?? ""}
            onChange={(e) => patch({ dateTo: e.target.value || undefined })}
          />
        </div>
      </div>

      {activeCount > 0 ? (
        <FinanceButton variant="ghost" size="sm" onClick={onClear}>
          <X className="size-3.5" />
          Limpar filtros ({activeCount})
        </FinanceButton>
      ) : null}
    </div>
  );
}
