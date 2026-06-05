import { Link } from "react-router-dom";

import { formatDisplayDate } from "@/lib/datePickerUtils";
import { paths } from "@/routes/paths";
import type { FinanceViewMode } from "@/modules/finance/hooks/useFinanceViewMode";
import {
  formatRollupPeriod,
  rollupListSubtitle,
  rollupListTitle,
} from "@/modules/finance/lib/rollupLabels";
import {
  financeExpenseText,
  financeIncomeText,
  financePanelClass,
} from "@/modules/finance/styles/financeTokens";
import {
  formatMoney,
  MOVEMENT_TYPE_LABELS,
  type FinanceMovement,
} from "@/services/financeApi";
import { cn } from "@/lib/utils";

type RowProps = {
  movement: FinanceMovement;
  currency: string;
  showAccount?: boolean;
  view?: FinanceViewMode;
  onRollupOpen?: (rollupId: string) => void;
};

function movementTitle(m: FinanceMovement, showAccount: boolean) {
  if (m.isRollup || m.type === "SUMMARY") {
    return rollupListTitle(m);
  }
  if (m.type === "TRANSFER") {
    return showAccount
      ? `Transferência · ${m.accountName} → ${m.transferDestAccountName}`
      : `${m.accountName} → ${m.transferDestAccountName}`;
  }
  return showAccount
    ? `${m.categoryName ?? MOVEMENT_TYPE_LABELS[m.type]} · ${m.accountName}`
    : (m.categoryName ?? MOVEMENT_TYPE_LABELS[m.type]);
}

function amountClass(m: FinanceMovement) {
  if (m.isRollup || m.type === "SUMMARY") return "text-amber-800 dark:text-amber-300";
  if (m.type === "INCOME") return financeIncomeText;
  if (m.type === "EXPENSE") return financeExpenseText;
  return "text-muted-foreground";
}

export function FinanceMovementRow({
  movement: m,
  currency,
  showAccount = true,
  view = "cards",
  onRollupOpen,
}: RowProps) {
  const title = movementTitle(m, showAccount);
  const isSummary = m.isRollup || m.type === "SUMMARY";
  const amountPrefix =
    isSummary ? "Σ " : m.type === "EXPENSE" ? "−" : m.type === "INCOME" ? "+" : "";
  const amount = isSummary
    ? `${amountPrefix}${formatMoney(m.amount, currency)} líq.`
    : `${amountPrefix}${formatMoney(Math.abs(m.amount), currency)}`;

  const clientLink =
    !isSummary && m.linkedClient ? (
      <Link
        to={paths.focus.database(m.linkedClient.workspaceId, m.linkedClient.databaseId)}
        className="mt-0.5 block text-xs text-amber-800/90 underline-offset-2 hover:underline dark:text-amber-400/90"
      >
        Cliente: {m.linkedClient.clientName}
      </Link>
    ) : null;

  const summarySubtitle = isSummary ? (
    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
      {rollupListSubtitle(m, currency)}
    </span>
  ) : null;

  const summaryHint = isSummary ? (
    <span className="mt-1 block text-xs font-medium text-amber-800/90 dark:text-amber-400/90">
      Ver movimentos do lote →
    </span>
  ) : null;

  const rowInner = (layout: "compact" | "grid" | "cards") => {
    if (layout === "compact") {
      return (
        <>
          <span className="font-mono text-muted-foreground">
            {isSummary
              ? formatRollupPeriod(m.rollupPeriodFrom, m.rollupPeriodTo) || formatDisplayDate(m.date)
              : formatDisplayDate(m.date)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-foreground">{title}</span>
            {summarySubtitle}
            {summaryHint}
          </span>
          <span className={cn("shrink-0 font-mono", amountClass(m))}>{amount}</span>
        </>
      );
    }
    if (layout === "grid") {
      return (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 text-sm text-foreground">{title}</p>
            <span className={cn("shrink-0 font-mono text-sm", amountClass(m))}>{amount}</span>
          </div>
          {isSummary ? (
            <>
              {summarySubtitle}
              {summaryHint}
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDisplayDate(m.date)}
                {m.note ? ` · ${m.note}` : ""}
              </p>
              {clientLink}
            </>
          )}
        </>
      );
    }
    return (
      <>
        <div className="min-w-0">
          <p className="truncate text-foreground">{title}</p>
          {isSummary ? (
            <>
              {summarySubtitle}
              {summaryHint}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {formatDisplayDate(m.date)}
                {m.note ? ` · ${m.note}` : ""}
              </p>
              {clientLink}
            </>
          )}
        </div>
        <span className={cn("shrink-0 font-mono text-sm", amountClass(m))}>{amount}</span>
      </>
    );
  };

  if (isSummary && onRollupOpen) {
    const layoutClass =
      view === "compact"
        ? "grid w-full grid-cols-[4.5rem_1fr_auto] items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-amber-950/15 sm:grid-cols-[5.5rem_1fr_auto] sm:px-4 sm:text-sm"
        : view === "grid"
          ? cn(
              financePanelClass,
              "block w-full border p-3 text-left transition-colors hover:border-amber-500/40 hover:bg-amber-950/10"
            )
          : "flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm transition-colors hover:bg-amber-950/10";

    return (
      <li>
        <button type="button" className={layoutClass} onClick={() => onRollupOpen(m.id)}>
          {rowInner(view)}
        </button>
      </li>
    );
  }

  if (view === "compact") {
    return (
      <li className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2 px-3 py-2 text-xs sm:grid-cols-[5.5rem_1fr_auto] sm:px-4 sm:text-sm">
        {rowInner("compact")}
      </li>
    );
  }

  if (view === "grid") {
    return <li className={cn(financePanelClass, "border p-3")}>{rowInner("grid")}</li>;
  }

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
      {rowInner("cards")}
    </li>
  );
}

type ListProps = {
  movements: FinanceMovement[];
  currency: string;
  showAccount?: boolean;
  emptyMessage?: string;
  view?: FinanceViewMode;
  onRollupOpen?: (rollupId: string) => void;
};

export function FinanceMovementList({
  movements,
  currency,
  showAccount = true,
  emptyMessage = "Sem movimentos.",
  view = "cards",
  onRollupOpen,
}: ListProps) {
  if (movements.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  if (view === "grid") {
    return (
      <ul className="grid gap-3 sm:grid-cols-2">
        {movements.map((m) => (
          <FinanceMovementRow
            key={m.id}
            movement={m}
            currency={currency}
            showAccount={showAccount}
            view="grid"
            onRollupOpen={onRollupOpen}
          />
        ))}
      </ul>
    );
  }

  if (view === "compact") {
    return (
      <div className={cn(financePanelClass, "border")}>
        <div className="hidden grid-cols-[4.5rem_1fr_auto] gap-2 border-b border-border px-3 py-2 font-mono text-xs uppercase text-muted-foreground sm:grid sm:grid-cols-[5.5rem_1fr_auto] sm:px-4">
          <span>Data</span>
          <span>Descrição</span>
          <span className="text-right">Valor</span>
        </div>
        <ul className="divide-y divide-zinc-800">
          {movements.map((m) => (
            <FinanceMovementRow
              key={m.id}
              movement={m}
              currency={currency}
              showAccount={showAccount}
              view="compact"
              onRollupOpen={onRollupOpen}
            />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <ul className={cn("divide-y divide-zinc-800", financePanelClass, "border")}>
      {movements.map((m) => (
        <FinanceMovementRow
          key={m.id}
          movement={m}
          currency={currency}
          showAccount={showAccount}
          view="cards"
          onRollupOpen={onRollupOpen}
        />
      ))}
    </ul>
  );
}

export function summarizeMovements(movements: FinanceMovement[]) {
  let income = 0;
  let expense = 0;
  for (const m of movements) {
    if (m.isRollup || m.type === "SUMMARY") {
      if (m.rollupTotals) {
        income += m.rollupTotals.income;
        expense += m.rollupTotals.expense;
      }
      continue;
    }
    if (m.type === "INCOME") income += m.amount;
    else if (m.type === "EXPENSE") expense += m.amount;
  }
  return { income, expense, net: income - expense };
}
