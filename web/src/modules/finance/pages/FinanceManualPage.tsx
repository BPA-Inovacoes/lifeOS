import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

import { getFinanceManualMarkdown } from "@/modules/finance/help/financeManualSource";
import {
  financeAccentBorder,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import { ManualViewer } from "@/modules/help/ManualViewer";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

export function FinanceManualPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className={financeSectionLabelClass}>// manual</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        Manual — Modo Finanças
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Educação financeira prática: contas, métodos, movimentos e revisão semanal.
      </p>

      <div
        className={cn(
          "mt-6 flex flex-wrap items-center justify-between gap-3 border bg-background/80 px-4 py-3",
          financeAccentBorder
        )}
      >
        <div className="flex items-center gap-3">
          <BookOpen className="size-5 text-amber-900/90 dark:text-amber-400/90" />
          <p className="text-sm text-muted-foreground">
            Método e hábito · clareza sobre o teu dinheiro
          </p>
        </div>
        <Link
          to={paths.finance.home}
          className="font-mono text-xs uppercase tracking-wider text-amber-900/90 dark:text-amber-400/90 hover:text-amber-300"
        >
          ← Início
        </Link>
      </div>

      <div className="mt-8">
        <ManualViewer
          getMarkdown={getFinanceManualMarkdown}
          accent="amber"
          linkClassName="text-amber-900 dark:text-amber-400 decoration-amber-800/60 hover:text-amber-300"
        />
      </div>
    </div>
  );
}
