import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { METHOD_EXPLORE_SUMMARY } from "@/modules/finance/lib/methodExploreLabels";
import { financeExploreCtaClass } from "@/modules/finance/styles/financeTokens";
import type { FinanceMethod } from "@/services/financeApi";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

type Props = {
  method: FinanceMethod;
  className?: string;
};

export function FinanceMethodExploreLink({ method, className }: Props) {
  return (
    <Link
      to={paths.finance.method(method.id)}
      className={cn(financeExploreCtaClass, "items-center justify-between gap-3", className)}
      aria-label={`${method.name}: ${METHOD_EXPLORE_SUMMARY}`}
    >
      <span className="text-base font-medium text-amber-900 group-hover:text-amber-950 dark:text-amber-100 dark:group-hover:text-foreground">
        {METHOD_EXPLORE_SUMMARY}
      </span>
      <ChevronRight
        className="size-5 shrink-0 text-amber-600 transition-transform group-hover:translate-x-0.5 dark:text-amber-400"
        aria-hidden
      />
    </Link>
  );
}
