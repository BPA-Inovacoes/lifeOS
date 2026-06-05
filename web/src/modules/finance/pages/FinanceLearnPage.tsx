import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { FinanceClarBanner } from "@/modules/finance/components/FinanceClarBanner";
import {
  FinanceGlossaryCard,
  FinanceLearnPillarFilter,
  FinanceMicroLessonCard,
} from "@/modules/finance/components/FinanceLearnCards";
import { FinanceLearnTrailCard } from "@/modules/finance/components/FinanceLearnTrailCard";
import { FinanceInput } from "@/modules/finance/components/finance-ui";
import { FinanceViewToggle } from "@/modules/finance/components/FinanceViewToggle";
import {
  financeViewContainerClass,
  useFinanceViewMode,
} from "@/modules/finance/hooks/useFinanceViewMode";
import { useLearnProgress } from "@/modules/finance/hooks/useLearnProgress";
import {
  filterLearnContent,
  FINANCE_GLOSSARY,
  FINANCE_MICRO_LESSONS,
  FINANCE_PILLARS,
  type FinancePillar,
} from "@/modules/finance/content/financeLearnContent";
import { FINANCE_LEARN_TRAILS } from "@/modules/finance/content/financeLearnTrails";
import {
  financeChipActiveClass,
  financeChipIdleClass,
  financeLinkClass,
  financePanelClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

type Tab = "lessons" | "glossary";

export function FinanceLearnPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useFinanceViewMode("learn");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [pillar, setPillar] = useState<FinancePillar | "all">("all");
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<Tab>(tabParam === "glossary" ? "glossary" : "lessons");
  const { completedCount, totalLessons } = useLearnProgress();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
    if (searchParams.get("tab") === "glossary") setTab("glossary");
  }, [searchParams]);

  const { terms, lessons } = useMemo(
    () => filterLearnContent(query, pillar),
    [query, pillar]
  );

  const showLessons = tab === "lessons";
  const count = showLessons ? lessons.length : terms.length;
  const total = showLessons ? FINANCE_MICRO_LESSONS.length : FINANCE_GLOSSARY.length;

  const setTabAndUrl = (next: Tab) => {
    setTab(next);
    const params = new URLSearchParams(searchParams);
    if (next === "glossary") params.set("tab", "glossary");
    else params.delete("tab");
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <p className={financeSectionLabelClass}>// aprender</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Aprender</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Método CLAR — micro-lições guiadas, trilhos por tema e glossário.
      </p>
      <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Progresso: {completedCount}/{totalLessons} lições CLAR
      </p>

      <div className="mt-6">
        <FinanceClarBanner />
      </div>

      <div className="mt-8">
        <p className={financeSectionLabelClass}>// trilhos</p>
        <div className="mt-3 space-y-4">
          {FINANCE_LEARN_TRAILS.map((trail) => (
            <FinanceLearnTrailCard key={trail.id} trail={trail} />
          ))}
        </div>
      </div>

      <div className={cn(financePanelClass, "mt-8 grid gap-3 border p-4 sm:grid-cols-3")}>
        {(Object.entries(FINANCE_PILLARS) as [FinancePillar, (typeof FINANCE_PILLARS)[FinancePillar]][]).map(
          ([id, p]) => (
            <div key={id}>
              <p className="font-mono text-xs uppercase text-amber-500/70">{p.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{p.description}</p>
            </div>
          )
        )}
      </div>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <FinanceInput
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar lições ou termos…"
          aria-label="Pesquisar conteúdo educativo"
        />
      </div>

      <div className="mt-4">
        <FinanceLearnPillarFilter value={pillar} onChange={setPillar} />
      </div>

      <div className={cn(financePanelClass, "mt-6 border p-4")}>
        <p className={financeSectionLabelClass}>// conteúdo</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(
            [
              { id: "lessons" as const, label: "Micro-lições", hint: `${FINANCE_MICRO_LESSONS.length} lições CLAR` },
              { id: "glossary" as const, label: "Glossário", hint: `${FINANCE_GLOSSARY.length} termos` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTabAndUrl(t.id)}
              className={cn(
                "border px-4 py-3 text-left transition-colors",
                tab === t.id ? financeChipActiveClass : financeChipIdleClass
              )}
            >
              <span className="block font-medium text-sm">{t.label}</span>
              <span className="mt-0.5 block font-mono text-xs uppercase tracking-wider opacity-80">
                {t.hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {count} de {total} {showLessons ? "lições" : "termos"}
          {query.trim() ? ` · «${query.trim()}»` : ""}
        </p>
        <FinanceViewToggle value={view} onChange={setView} compact />
      </div>

      <div
        className={cn(
          "mt-4",
          view === "grid" && "grid gap-4 sm:grid-cols-2",
          view === "compact" && financeViewContainerClass("compact"),
          view === "cards" && "space-y-4"
        )}
      >
        {showLessons ? (
          lessons.length === 0 ? (
            <p className={cn(financePanelClass, "col-span-full px-4 py-8 text-center text-sm text-muted-foreground")}>
              Nenhuma lição corresponde — experimenta outro pilar ou pesquisa.
            </p>
          ) : (
            lessons.map((lesson) => (
              <FinanceMicroLessonCard key={lesson.id} lesson={lesson} view={view} />
            ))
          )
        ) : terms.length === 0 ? (
          <p className={cn(financePanelClass, "col-span-full px-4 py-8 text-center text-sm text-muted-foreground")}>
            Nenhum termo corresponde — experimenta outro pilar ou pesquisa.
          </p>
        ) : (
          terms.map((term) => <FinanceGlossaryCard key={term.id} term={term} view={view} />)
        )}
      </div>

      <div
        className={cn(
          "mt-10 flex flex-wrap items-center justify-between gap-3 border border-amber-900/30 bg-amber-950/10 px-4 py-4"
        )}
      >
        <div className="flex items-center gap-3">
          <BookOpen className="size-5 text-amber-900/90 dark:text-amber-400/80" />
          <p className="text-sm text-muted-foreground">Queres o guia completo passo a passo?</p>
        </div>
        <Link
          to={paths.finance.manual}
          className={cn("font-mono text-xs uppercase tracking-wider", financeLinkClass)}
        >
          Manual →
        </Link>
      </div>
    </div>
  );
}
