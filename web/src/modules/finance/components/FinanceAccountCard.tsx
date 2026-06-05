import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import type { FinanceViewMode } from "@/modules/finance/hooks/useFinanceViewMode";
import { ACCOUNT_COLOR_PRESETS } from "@/modules/finance/lib/accountFormCopy";
import { financePanelClass } from "@/modules/finance/styles/financeTokens";
import { paths } from "@/routes/paths";
import { ACCOUNT_TYPE_LABELS, formatMoney, type FinanceAccount } from "@/services/financeApi";
import { cn } from "@/lib/utils";

type Props = {
  account: FinanceAccount;
  currency: string;
  dimmed?: boolean;
  view?: FinanceViewMode;
};

export function FinanceAccountCard({
  account,
  currency,
  dimmed,
  view = "cards",
}: Props) {
  const balanceDisplay =
    account.isLiability && account.balance < 0
      ? `−${formatMoney(Math.abs(account.balance), currency)}`
      : formatMoney(account.balance, currency);

  const colorPreset = ACCOUNT_COLOR_PRESETS.find((p) => p.id === account.color);

  if (view === "compact") {
    return (
      <Link
        to={paths.finance.account(account.id)}
        className={cn(
          "group flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-amber-950/10",
          dimmed && "opacity-60"
        )}
      >
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate font-medium text-foreground group-hover:text-amber-100">
            {colorPreset ? (
              <span className={cn("size-2 shrink-0", colorPreset.className)} aria-hidden />
            ) : null}
            {account.name}
          </p>
          <p className="truncate font-mono text-xs uppercase text-muted-foreground">
            {ACCOUNT_TYPE_LABELS[account.type]}
            {account.institution ? ` · ${account.institution}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-amber-950 dark:text-amber-300">{balanceDisplay}</span>
          <ChevronRight className="size-3.5 text-muted-foreground" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={paths.finance.account(account.id)}
      className={cn(
        financePanelClass,
        "group block p-4 transition-colors hover:border-amber-900/40 hover:bg-amber-950/10",
        view === "grid" && "h-full",
        dimmed && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase text-muted-foreground">
            {ACCOUNT_TYPE_LABELS[account.type]}
            {account.isArchived ? " · arquivada" : ""}
          </p>
          <p className="flex items-center gap-2 text-lg font-medium text-foreground group-hover:text-amber-100">
            {colorPreset ? (
              <span
                className={cn("size-2.5 shrink-0", colorPreset.className)}
                aria-hidden
              />
            ) : null}
            {account.name}
          </p>
          {account.institution || account.maskedIdentifier ? (
            <p className="text-sm text-muted-foreground">
              {[account.institution, account.maskedIdentifier].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <p className={cn("text-amber-950 dark:text-amber-300", view === "grid" ? "text-lg" : "text-xl")}>
            {balanceDisplay}
          </p>
          <ChevronRight className="size-4 text-muted-foreground transition-colors group-hover:text-amber-500/80" />
        </div>
      </div>
      {!account.isArchived && view === "cards" ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Saldo inicial {formatMoney(account.initialBalance, currency)} · ref.{" "}
          {account.initialBalanceDate}
        </p>
      ) : null}
    </Link>
  );
}
