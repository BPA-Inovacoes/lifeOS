import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import {
  financeGlossaryHref,
  getGlossaryTerm,
} from "@/modules/finance/content/financeLearnContent";
import { cn } from "@/lib/utils";

type Props = {
  termId: string;
  className?: string;
  /** Mostrar definição curta entre parênteses antes do link */
  showShort?: boolean;
};

export function FinanceGlossaryLink({ termId, className, showShort = false }: Props) {
  const term = getGlossaryTerm(termId);
  if (!term) return null;

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-1 gap-y-0.5", className)}>
      {showShort ? (
        <span className="text-muted-foreground">({term.short})</span>
      ) : null}
      <Link
        to={financeGlossaryHref(termId)}
        className="inline-flex items-center gap-0.5 font-mono text-xs text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
        onClick={(e) => e.stopPropagation()}
      >
        {term.term}
        <ArrowUpRight className="size-3" aria-hidden />
      </Link>
    </span>
  );
}
