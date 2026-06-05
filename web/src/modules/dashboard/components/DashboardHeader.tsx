import { Calendar, Flame, ListTodo, Plus, Search, Zap } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PRODUCT_NAME } from "@/constants/product";
import type { DashboardSummary } from "@/services/dashboardApi";
import { paths } from "@/routes/paths";
import { useUiStore } from "@/store/uiStore";
import { kbdClass, sectionLabelClass } from "@/styles/designTokens";
import {
  formatDashboardClock,
  formatDashboardDate,
} from "@/utils/formatRelative";

type DashboardHeaderProps = {
  userName?: string | null;
  data?: DashboardSummary | null;
  onNewWorkspace: () => void;
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}

export function DashboardHeader({
  userName,
  data,
  onNewWorkspace,
}: DashboardHeaderProps) {
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const firstName = userName?.split(" ")[0];
  const links = data?.links;
  const metrics = data?.metrics;

  return (
    <header className="border-b border-border pb-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3">
          <p className={sectionLabelClass}>// painel</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Resumo do teu {PRODUCT_NAME} — tarefas, hábitos e espaços num só
            painel.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          <div className="inline-flex items-center gap-2 border border-border bg-card px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-500">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping bg-emerald-500 opacity-40" />
              <span className="relative inline-flex size-2 bg-emerald-500" />
            </span>
            em linha
          </div>
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span className="capitalize">{formatDashboardDate()}</span>
            <span className="text-zinc-700">·</span>
            <span>{formatDashboardClock()}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search className="size-4" />
          Comandos
          <kbd className={kbdClass}>⌘K</kbd>
        </Button>

        {links?.tasksDatabaseId && links?.workspaceId ? (
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link
              to={paths.focus.database(links.workspaceId, links.tasksDatabaseId)}
            >
              <ListTodo className="size-4" />
              Tarefas
              {metrics && metrics.tasksOpen > 0 ? (
                <span className="font-mono text-sm text-emerald-800 dark:text-emerald-500">
                  {metrics.tasksOpen}
                </span>
              ) : null}
            </Link>
          </Button>
        ) : null}

        {links?.habitsDatabaseId && links?.workspaceId ? (
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link
              to={paths.focus.database(links.workspaceId, links.habitsDatabaseId)}
            >
              <Flame className="size-4" />
              Hábitos
              {metrics && metrics.habitsTotal > 0 ? (
                <span className="font-mono text-sm text-emerald-800 dark:text-emerald-500">
                  {metrics.habitsDoneToday}/{metrics.habitsTotal}
                </span>
              ) : null}
            </Link>
          </Button>
        ) : null}

        {metrics && metrics.pointsToday > 0 ? (
          <span className="inline-flex items-center gap-2 border border-emerald-900/50 bg-emerald-950/40 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-500">
            <Zap className="size-3.5" />
            {metrics.pointsToday} XP hoje
          </span>
        ) : null}

        <Button
          type="button"
          size="sm"
          className="gap-2"
          onClick={onNewWorkspace}
        >
          <Plus className="size-4" />
          Novo espaço
        </Button>
      </div>
    </header>
  );
}
