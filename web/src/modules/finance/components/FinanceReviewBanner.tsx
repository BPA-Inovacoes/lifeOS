import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";

import {
  financeAccentBorder,
  financeLinkClass,
  financeSuccessBoxClass,
} from "@/modules/finance/styles/financeTokens";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

type Props = {
  completed: boolean;
  weekStart: string;
};

export function FinanceReviewBanner({ completed, weekStart }: Props) {
  if (completed) {
    return (
      <div className={cn("mt-6 flex items-center gap-2 px-4 py-3 text-sm", financeSuccessBoxClass)}>
        <CalendarCheck className="size-4 shrink-0 text-amber-900/90 dark:text-amber-400/90" />
        <span>Revisão da semana de {weekStart} concluída.</span>
      </div>
    );
  }

  return (
    <div className={cn("mt-6 border px-4 py-3 text-sm text-amber-200/90", financeAccentBorder, "bg-amber-950/10")}>
      Revisão semanal pendente —{" "}
      <Link to={paths.finance.review} className={cn("underline", financeLinkClass)}>
        fazer agora (~15 min)
      </Link>
    </div>
  );
}
