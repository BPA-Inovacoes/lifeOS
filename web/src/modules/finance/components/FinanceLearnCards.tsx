import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronRight } from "lucide-react";

import type { FinanceViewMode } from "@/modules/finance/hooks/useFinanceViewMode";
import { useLearnProgress } from "@/modules/finance/hooks/useLearnProgress";
import {
  financeChipActiveClass,
  financeChipIdleClass,
  financeExploreCtaClass,
  financeLinkClass,
  financePanelClass,
} from "@/modules/finance/styles/financeTokens";
import {
  FINANCE_PILLARS,
  getGlossaryTerm,
  type FinanceAppLink,
  type FinanceGlossaryTerm,
  type FinanceMicroLesson,
  type FinancePillar,
} from "@/modules/finance/content/financeLearnContent";
import { cn } from "@/lib/utils";
import { paths } from "@/routes/paths";

function AppLinkButton({ link }: { link: FinanceAppLink }) {
  return (
    <Link
      to={link.to}
      className={cn(
        "inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider",
        financeLinkClass
      )}
    >
      {link.label}
      <ArrowUpRight className="size-3" />
    </Link>
  );
}

export function FinanceMicroLessonCard({
  lesson,
  view = "cards",
}: {
  lesson: FinanceMicroLesson;
  view?: FinanceViewMode;
}) {
  const pillar = FINANCE_PILLARS[lesson.pillar];
  const { getLessonProgress } = useLearnProgress();
  const progress = getLessonProgress(lesson.id);
  const done = progress?.step === "done";

  const lessonLink = (
    <Link
      to={paths.finance.lesson(lesson.id)}
      className={cn(financeExploreCtaClass, "items-center justify-between gap-2")}
    >
      <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
        {done ? "Rever lição CLAR" : "Iniciar lição CLAR"}
      </span>
      <ChevronRight className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
    </Link>
  );

  if (view === "compact") {
    return (
      <article className="px-4 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-mono text-xs uppercase text-amber-500/70">{pillar.label}</p>
          {done ? (
            <span className="font-mono text-xs uppercase text-amber-700 dark:text-amber-400">Feita</span>
          ) : null}
        </div>
        <Link to={paths.finance.lesson(lesson.id)} className="mt-0.5 block text-sm font-medium text-foreground hover:text-amber-800 dark:hover:text-amber-200">
          {lesson.title}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{lesson.body}</p>
      </article>
    );
  }

  if (view === "grid") {
    return (
      <article className={cn(financePanelClass, "flex h-full flex-col border p-4")}>
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono text-xs uppercase text-amber-500/80">{pillar.label}</p>
          {done ? (
            <span className="font-mono text-xs uppercase text-amber-700 dark:text-amber-400">Feita</span>
          ) : null}
        </div>
        <h3 className="mt-1 font-medium text-foreground">{lesson.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{lesson.body}</p>
        <div className="mt-3">{lessonLink}</div>
      </article>
    );
  }

  return (
    <article className={cn(financePanelClass, "border p-4")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-mono text-xs uppercase text-amber-500/80">{pillar.label}</p>
        {done ? (
          <span className="font-mono text-xs uppercase text-amber-700 dark:text-amber-400">Feita</span>
        ) : null}
      </div>
      <h3 className="mt-1 font-medium text-foreground">{lesson.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lesson.body}</p>
      <p className="mt-3 border-l-2 border-amber-900/50 pl-3 text-sm text-muted-foreground">
        <span className="text-muted-foreground">Exemplo: </span>
        {lesson.example}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {lesson.relatedTermIds?.map((id) => {
          const term = getGlossaryTerm(id);
          if (!term) return null;
          return (
            <Link
              key={id}
              to={`${paths.finance.learn}?tab=glossary&q=${encodeURIComponent(term.term)}`}
              className="font-mono text-sm text-muted-foreground hover:text-amber-800 dark:hover:text-amber-300"
            >
              #{term.term.toLowerCase()}
            </Link>
          );
        })}
      </div>
      <div className="mt-4">{lessonLink}</div>
    </article>
  );
}

export function FinanceGlossaryCard({
  term,
  view = "cards",
}: {
  term: FinanceGlossaryTerm;
  view?: FinanceViewMode;
}) {
  const pillar = FINANCE_PILLARS[term.pillar];

  if (view === "compact") {
    return (
      <article className="px-4 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-medium text-foreground">{term.term}</h3>
          <span className="shrink-0 font-mono text-xs uppercase text-muted-foreground">
            {pillar.label}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-amber-900/90 dark:text-amber-400/80">{term.short}</p>
      </article>
    );
  }

  if (view === "grid") {
    return (
      <article className={cn(financePanelClass, "flex h-full flex-col border p-4")}>
        <h3 className="font-medium text-foreground">{term.term}</h3>
        <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-400/80">{term.short}</p>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{term.definition}</p>
      </article>
    );
  }

  return (
    <article className={cn(financePanelClass, "border p-4")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-foreground">{term.term}</h3>
          <p className="mt-0.5 text-sm text-amber-900/90 dark:text-amber-400/80">{term.short}</p>
        </div>
        <span className="font-mono text-xs uppercase text-muted-foreground">{pillar.label}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{term.definition}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="text-zinc-700">Ex.: </span>
        {term.example}
      </p>
      {term.appLink ? (
        <div className="mt-3">
          <AppLinkButton link={term.appLink} />
        </div>
      ) : null}
    </article>
  );
}

type PillarFilterProps = {
  value: FinancePillar | "all";
  onChange: (value: FinancePillar | "all") => void;
};

export function FinanceLearnPillarFilter({ value, onChange }: PillarFilterProps) {
  const options: { id: FinancePillar | "all"; label: string }[] = [
    { id: "all", label: "Todos" },
    ...(Object.entries(FINANCE_PILLARS) as [FinancePillar, (typeof FINANCE_PILLARS)[FinancePillar]][]).map(
      ([id, p]) => ({ id, label: p.label })
    ),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
            value === opt.id ? financeChipActiveClass : financeChipIdleClass
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
