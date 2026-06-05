import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Circle, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import type { DashboardSummary, FocusTask } from "@/services/dashboardApi";
import { applyRowGamificationFeedback } from "@/modules/game/utils/gamificationFeedback";
import { updateDatabaseRow } from "@/services/databaseApi";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";
import { formatPoints, pointsBadgeClass } from "@/utils/points";

type FocusNowProps = {
  data: DashboardSummary;
};

function FocusTaskRow({ task }: { task: FocusTask }) {
  const qc = useQueryClient();

  const patch = useMutation({
    mutationFn: (props: Record<string, unknown>) =>
      updateDatabaseRow(task.id, props),
    onSuccess: (data) => {
      applyRowGamificationFeedback(qc, data.gamification);
      void qc.invalidateQueries({
        queryKey: ["dashboard"],
        refetchType: "none",
      });
    },
  });

  const complete = () => {
    patch.mutate({ [task.statusPropertyId]: "Concluído" });
  };

  const toggleFocus = () => {
    patch.mutate({ [task.focusPropertyId]: !task.focusToday });
  };

  return (
    <li className="flex items-center gap-3 border border-border bg-secondary/80 px-3 py-3 transition-colors hover:border-border">
      <button
        type="button"
        className="shrink-0 text-muted-foreground transition-colors hover:text-emerald-500"
        aria-label="Marcar como concluída"
        disabled={patch.isPending}
        onClick={complete}
      >
        <Circle className="size-5" />
      </button>

      <div className="min-w-0 flex-1">
        <Link
          to={paths.focus.database(task.workspaceId, task.databaseId)}
          className="block truncate font-medium text-foreground hover:text-emerald-700 dark:hover:text-emerald-400"
        >
          {task.title}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {task.focusToday ? (
            <span className="font-mono text-xs uppercase text-amber-500/90">
              foco
            </span>
          ) : null}
          {task.dueToday ? (
            <span className="font-mono text-xs uppercase text-muted-foreground">
              prazo hoje
            </span>
          ) : null}
          <span className="font-mono text-xs uppercase text-muted-foreground">
            {task.priority}
          </span>
        </div>
      </div>

      {task.points > 0 ? (
        <span
          className={cn(
            "shrink-0 border px-1.5 py-0.5 font-mono text-xs uppercase",
            pointsBadgeClass(false)
          )}
        >
          {formatPoints(task.points)}
        </span>
      ) : null}

      <button
        type="button"
        className={cn(
          "shrink-0 p-1 transition-colors",
          task.focusToday
            ? "text-amber-500 hover:text-amber-900 dark:hover:text-amber-400"
            : "text-zinc-700 hover:text-amber-500/80"
        )}
        aria-label={task.focusToday ? "Remover foco" : "Marcar foco de hoje"}
        disabled={patch.isPending}
        onClick={toggleFocus}
      >
        <Star
          className={cn("size-4", task.focusToday && "fill-amber-500/30")}
        />
      </button>
    </li>
  );
}

export function FocusNow({ data }: FocusNowProps) {
  const { focusNow, links } = data;
  const tasksHref =
    links.tasksDatabaseId && links.workspaceId
      ? paths.focus.database(links.workspaceId, links.tasksDatabaseId)
      : null;

  return (
    <section className="relative border border-emerald-900/40 bg-background/85 backdrop-blur-sm">
      <div className="absolute left-0 top-0 h-1 w-full bg-emerald-500" aria-hidden />
      <div className="border-b border-border px-4 py-4 md:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-500">
          // agora
        </p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">
          O que fazer agora
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Até 3 tarefas — marca com estrela na tabela ou com prazo/foco de hoje.
        </p>
      </div>

      <div className="p-4 md:p-6">
        {focusNow.length === 0 ? (
          <div className="py-8 text-center">
            <Check className="mx-auto size-8 text-emerald-600/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              Nada em foco. Marca «Foco hoje» numa tarefa ou define prazo para
              hoje.
            </p>
            {tasksHref ? (
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to={tasksHref}>Abrir tarefas</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <ul className="space-y-2">
            {focusNow.map((task) => (
              <FocusTaskRow key={task.id} task={task} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
