import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { FINANCE_PILLARS } from "@/modules/finance/content/financeLearnContent";
import type { LearnTrail } from "@/modules/finance/content/financeLearnTrails";
import { useLearnProgress } from "@/modules/finance/hooks/useLearnProgress";
import { financeExploreCtaClass, financePanelClass } from "@/modules/finance/styles/financeTokens";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

type Props = {
  trail: LearnTrail;
};

export function FinanceLearnTrailCard({ trail }: Props) {
  const { trailProgress, getLessonProgress } = useLearnProgress();
  const { done, total } = trailProgress(trail.lessonIds);
  const pillar = FINANCE_PILLARS[trail.pillar];
  const nextLessonId =
    trail.lessonIds.find((id) => getLessonProgress(id)?.step !== "done") ??
    trail.lessonIds[0]!;
  const allDone = done === total;

  return (
    <article className={cn(financePanelClass, "border p-4")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs uppercase text-amber-500/80">{pillar.label}</p>
          <h3 className="mt-0.5 font-medium text-foreground">{trail.title}</h3>
        </div>
        <span className="font-mono text-xs uppercase text-muted-foreground">
          {done}/{total} lições
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{trail.description}</p>
      <div className="mt-3 h-1.5 overflow-hidden bg-muted">
        <div
          className="h-full bg-amber-600 transition-all dark:bg-amber-500"
          style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
        />
      </div>
      <Link
        to={paths.finance.lesson(nextLessonId)}
        className={cn(financeExploreCtaClass, "mt-4 items-center justify-between gap-3")}
      >
        <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
          {allDone ? "Rever trilho" : "Continuar trilho"}
        </span>
        <ChevronRight className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
      </Link>
    </article>
  );
}
