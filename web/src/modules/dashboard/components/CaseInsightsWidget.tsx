import { useQuery } from "@tanstack/react-query";

import { CaseIcon } from "@/modules/case/components/CaseIcon";
import { fetchCaseInsights, type CaseInsightItem } from "@/services/caseApi";
import { useCaseStore } from "@/store/caseStore";
import { cn } from "@/lib/utils";

const priorityClass: Record<CaseInsightItem["priority"], string> = {
  high: "border-lime-500/50 bg-lime-500/10",
  medium: "border-lime-500/30 bg-lime-500/5",
  low: "border-border bg-muted/20",
};

export function CaseInsightsWidget() {
  const openWithPrompt = useCaseStore((s) => s.openWithPrompt);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["case", "insights", "focus"],
    queryFn: () => fetchCaseInsights("focus"),
    staleTime: 120_000,
  });

  if (isLoading || isError || !data?.items.length) return null;

  return (
    <section className="relative border border-lime-500/35 bg-zinc-950/40 backdrop-blur-sm dark:bg-zinc-950/60">
      <div className="absolute left-0 top-0 h-0.5 w-full bg-lime-500/70" aria-hidden />
      <div className="flex items-start gap-3 border-b border-lime-500/20 px-4 py-3">
        <CaseIcon size="chat" motion="active" />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime-500/90">// case</p>
          <h3 className="mt-0.5 text-sm font-medium text-foreground">Insights do dia</h3>
        </div>
      </div>

      <ul className="space-y-2 p-4">
        {data.items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={cn(
                "w-full border px-3 py-2.5 text-left transition-colors hover:border-lime-400/50 hover:bg-lime-500/10",
                priorityClass[item.priority]
              )}
              onClick={() => openWithPrompt(item.prompt, item.mode)}
            >
              <p className="text-sm leading-snug text-foreground">{item.text}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-lime-600/80 dark:text-lime-400/70">
                Perguntar ao Case →
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
