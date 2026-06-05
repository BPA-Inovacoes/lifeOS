import { Link } from "react-router-dom";
import { Scale, Snowflake, TrendingDown } from "lucide-react";

import { useFinanceDebts } from "@/modules/finance/hooks/useFinance";
import {
  financePanelClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import { formatMoney } from "@/services/financeApi";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function FinanceDebtsPanel({ className }: Props) {
  const { data, isLoading } = useFinanceDebts();

  if (isLoading || !data || data.totalDebt <= 0) return null;

  const snowTarget = data.snowball[0];
  const avaTarget = data.avalanche[0];

  return (
    <section className={className}>
      <p className={financeSectionLabelClass}>// dívidas</p>
      <div className={cn(financePanelClass, "mt-3 space-y-4 p-4")}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-muted-foreground">Total em dívida</p>
          <p className="text-xl font-medium text-rose-800 dark:text-rose-300">
            {formatMoney(data.totalDebt, data.currency)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {snowTarget ? (
            <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="flex items-center gap-1.5 font-mono text-xs uppercase text-muted-foreground">
                <Snowflake className="size-3.5" />
                Snowball
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{snowTarget.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatMoney(snowTarget.debtAmount, data.currency)}
              </p>
            </div>
          ) : null}
          {avaTarget ? (
            <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="flex items-center gap-1.5 font-mono text-xs uppercase text-muted-foreground">
                <TrendingDown className="size-3.5" />
                Avalanche
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{avaTarget.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatMoney(avaTarget.debtAmount, data.currency)}
                {avaTarget.aprPercent != null ? ` · ${avaTarget.aprPercent}% TAEG` : ""}
              </p>
            </div>
          ) : null}
        </div>

        <ul className="space-y-2 text-sm">
          {data.snowball.map((d) => (
            <li key={d.accountId} className="flex justify-between gap-2">
              <span className="text-foreground">
                {d.rank}. {d.name}
              </span>
              <span className="text-muted-foreground">
                {formatMoney(d.debtAmount, data.currency)}
              </span>
            </li>
          ))}
        </ul>

        <Link
          to={paths.finance.methods}
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 px-3 py-1.5 text-sm text-amber-950 hover:bg-amber-500/10 dark:text-amber-200"
        >
          <Scale className="size-3.5" />
          Métodos Snowball / Avalanche
        </Link>
      </div>
    </section>
  );
}
