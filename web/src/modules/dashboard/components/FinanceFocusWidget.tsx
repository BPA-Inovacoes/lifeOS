import { ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import type { FinanceFocusSnapshot } from "@/services/dashboardApi";
import { formatMoney } from "@/services/financeApi";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

type Props = {
  finance: FinanceFocusSnapshot;
};

export function FinanceFocusWidget({ finance }: Props) {
  if (!finance.enabled) return null;

  return (
    <section className="relative border border-amber-300/50 bg-amber-50/40 backdrop-blur-sm dark:border-amber-800/40 dark:bg-amber-950/20">
      <div className="absolute left-0 top-0 h-0.5 w-full bg-amber-600/80" aria-hidden />
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-200/60 px-4 py-3 dark:border-amber-900/40">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-700/90 dark:text-amber-500/80">
            // finanças
          </p>
          <h3 className="mt-0.5 text-sm font-medium text-foreground">Resumo financeiro</h3>
        </div>
        <Link
          to={paths.finance.home}
          className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-amber-800 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-200"
        >
          Modo Finanças
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-3">
        {finance.hasAccounts ? (
          <>
            <div className="flex gap-3">
              <Wallet className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" />
              <div>
                <p className="font-mono text-xs uppercase text-muted-foreground">Património</p>
                <p className="text-lg font-semibold tabular-nums text-foreground">
                  {formatMoney(finance.netWorth, finance.currency)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <PiggyBank className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" />
              <div>
                <p className="font-mono text-xs uppercase text-muted-foreground">Poupança mês</p>
                <p className="text-lg font-semibold tabular-nums text-foreground">
                  {finance.savingsRate}%
                </p>
              </div>
            </div>
            <div className="sm:col-span-1">
              <p className="font-mono text-xs uppercase text-muted-foreground">Próximo passo</p>
              <p className="mt-1 text-sm leading-snug text-foreground">
                {finance.activeMethod ? (
                  <>
                    <span className="font-medium">{finance.activeMethod.name}</span>
                    {finance.activeMethod.stepTitle ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {finance.activeMethod.stepIndex}/{finance.activeMethod.totalSteps}{" "}
                        {finance.activeMethod.stepTitle}
                      </span>
                    ) : null}
                  </>
                ) : (
                  finance.nextStepLabel
                )}
              </p>
              {finance.weeklyReviewPending ? (
                <Link
                  to={paths.finance.review}
                  className={cn(
                    "mt-2 inline-block font-mono text-xs uppercase tracking-wider",
                    "text-amber-800 hover:underline dark:text-amber-400"
                  )}
                >
                  Revisão semanal pendente →
                </Link>
              ) : null}
              {finance.overBudgetCount && finance.overBudgetCount > 0 ? (
                <p className="mt-2 text-xs text-red-700 dark:text-red-400">
                  {finance.overBudgetCount} envelope
                  {finance.overBudgetCount === 1 ? "" : "s"} acima do limite este mês
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground sm:col-span-3">
            {finance.nextStepLabel}.{" "}
            <Link to={paths.finance.home} className="text-amber-800 underline dark:text-amber-400">
              Abrir Finanças
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
