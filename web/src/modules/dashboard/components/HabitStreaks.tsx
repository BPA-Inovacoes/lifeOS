import { Flame } from "lucide-react";
import { Link } from "react-router-dom";

import { HabitHeatmap } from "@/database/components/HabitHeatmap";
import { HabitStreakBadge } from "@/database/components/HabitStreakBadge";
import { Button } from "@/components/ui/button";
import type { DashboardSummary, HabitStreakItem } from "@/services/dashboardApi";
import { paths } from "@/routes/paths";
import { listItemClass, sectionLabelMutedClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";

function StreakRow({ item }: { item: HabitStreakItem }) {
  return (
    <li>
      <Link
        to={paths.focus.database(item.workspaceId, item.databaseId)}
        className={cn(listItemClass, "flex-col items-stretch gap-2 sm:flex-row sm:items-center")}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Flame
            className={cn(
              "size-4 shrink-0",
              item.streak > 0 ? "text-amber-500" : "text-zinc-700"
            )}
          />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-foreground">{item.title}</span>
            <span className="mt-0.5 block font-mono text-xs uppercase text-muted-foreground hover:text-muted-foreground">
              {item.consistency}% consistência ·{" "}
              {item.frequency === "weekly" ? "semanal" : "diário"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {item.doneToday ? (
            <span className="font-mono text-xs uppercase text-emerald-800 dark:text-emerald-500">
              hoje ✓
            </span>
          ) : (
            <span className="font-mono text-xs uppercase text-muted-foreground">
              pendente
            </span>
          )}
          <HabitStreakBadge
            streak={item.streak}
            bestStreak={item.bestStreak}
            frequency={item.frequency}
          />
        </div>

        {item.heatmap.length > 0 ? (
          <HabitHeatmap cells={item.heatmap} compact className="w-full sm:max-w-[140px]" />
        ) : null}
      </Link>
    </li>
  );
}

export function HabitStreaks({ data }: { data: DashboardSummary }) {
  const { habitStreaks, links, metrics } = data;
  const habitsHref =
    links.habitsDatabaseId && links.workspaceId
      ? paths.focus.database(links.workspaceId, links.habitsDatabaseId)
      : null;

  const avgConsistency =
    habitStreaks.length > 0
      ? Math.round(
          habitStreaks.reduce((n, h) => n + h.consistency, 0) /
            habitStreaks.length
        )
      : null;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={sectionLabelMutedClass}>// sequências</p>
          <h2 className="mt-1 text-lg font-medium text-foreground">Sequências de hábitos</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {avgConsistency !== null ? (
            <span className="border border-border px-2 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              consistência média: {avgConsistency}%
            </span>
          ) : null}
          {metrics.bestHabitStreak > 0 ? (
            <span className="border border-amber-900/50 bg-amber-950/30 px-2 py-1 font-mono text-xs uppercase tracking-wider text-amber-500/90">
              melhor sequência: {metrics.bestHabitStreak}
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative border border-border bg-background/85 p-4 backdrop-blur-sm md:p-5">
        {habitStreaks.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sem hábitos registados. Marca «Feito hoje» para começar a sequência.
          </p>
        ) : (
          <ul className="space-y-2">
            {habitStreaks.map((item) => (
              <StreakRow key={item.id} item={item} />
            ))}
          </ul>
        )}
        {habitsHref ? (
          <div className="mt-4 border-t border-border pt-4">
            <Button variant="outline" size="sm" asChild>
              <Link to={habitsHref}>Gerir hábitos →</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
