import type { ReactNode } from "react";
import { CheckCircle2, Circle, Flame } from "lucide-react";
import { Link } from "react-router-dom";

import type { DashboardSummary } from "@/services/dashboardApi";
import { paths } from "@/routes/paths";
import { listItemClass, sectionLabelMutedClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";
import { formatPoints, pointsBadgeClass } from "@/utils/points";

function TodayPanel({
  title,
  sectionTag,
  children,
}: {
  title: string;
  sectionTag: string;
  children: ReactNode;
}) {
  return (
    <section className="relative border border-border bg-background/85 backdrop-blur-sm">
      <div
        className="absolute left-0 top-0 h-0.5 w-full bg-emerald-600/70"
        aria-hidden
      />
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600/80">
          {sectionTag}
        </p>
        <h3 className="mt-0.5 text-sm font-medium text-foreground">{title}</h3>
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

export function TodayLists({ data }: { data: DashboardSummary }) {
  const { links } = data;
  const tasksHref =
    links.tasksDatabaseId && links.workspaceId
      ? paths.focus.database(links.workspaceId, links.tasksDatabaseId)
      : undefined;
  const habitsHref =
    links.habitsDatabaseId && links.workspaceId
      ? paths.focus.database(links.workspaceId, links.habitsDatabaseId)
      : undefined;

  return (
    <section className="space-y-4">
      <div>
        <p className={sectionLabelMutedClass}>// agenda</p>
        <h2 className="mt-1 text-lg font-medium text-foreground">Prioridades</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TodayPanel title="Tarefas em aberto" sectionTag="// tarefas">
          {data.taskPreview.length === 0 ? (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">
              Nenhuma tarefa em aberto.
              {tasksHref ? (
                <>
                  {" "}
                  <Link
                    to={tasksHref}
                    className="text-emerald-800 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    Abrir tarefas
                  </Link>
                </>
              ) : null}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {data.taskPreview.map((t) => (
                <li key={t.id}>
                  <Link
                    to={paths.focus.database(t.workspaceId, t.databaseId)}
                    className={listItemClass}
                  >
                    <Circle className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-foreground">
                      {t.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {t.points > 0 ? (
                        <span
                          className={cn(
                            "border px-1.5 py-0.5 font-mono text-xs uppercase",
                            pointsBadgeClass(t.earned)
                          )}
                        >
                          {t.earned ? formatPoints(t.points) : `${t.points} pt`}
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "border px-1.5 py-0.5 font-mono text-xs uppercase",
                          t.status === "Em progresso"
                            ? "border-amber-900/50 text-amber-500/90"
                            : t.status === "Concluído"
                              ? "border-emerald-900/50 text-emerald-800 dark:text-emerald-500"
                              : "border-border text-muted-foreground"
                        )}
                      >
                        {t.status}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TodayPanel>

        <TodayPanel title="Hábitos de hoje" sectionTag="// hábitos">
          {data.habitPreview.length === 0 ? (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">
              Sem hábitos. Cria entradas na base de dados Hábitos.
              {habitsHref ? (
                <>
                  {" "}
                  <Link
                    to={habitsHref}
                    className="text-emerald-800 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    Abrir hábitos
                  </Link>
                </>
              ) : null}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {data.habitPreview.map((h) => (
                <li key={h.id}>
                  <Link
                    to={paths.focus.database(h.workspaceId, h.databaseId)}
                    className={listItemClass}
                  >
                    <CheckCircle2
                      className={cn(
                        "size-4 shrink-0",
                        h.done ? "text-emerald-800 dark:text-emerald-500" : "text-zinc-700"
                      )}
                    />
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate",
                        h.done ? "text-muted-foreground line-through" : "text-foreground"
                      )}
                    >
                      {h.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {h.streak > 0 ? (
                        <span className="flex items-center gap-0.5 font-mono text-xs uppercase text-amber-500/90">
                          <Flame className="size-3" />
                          {h.streak}d
                        </span>
                      ) : null}
                      {h.points > 0 ? (
                        <span
                          className={cn(
                            "border px-1.5 py-0.5 font-mono text-xs uppercase",
                            pointsBadgeClass(h.earned)
                          )}
                        >
                          {h.earned ? formatPoints(h.points) : `${h.points} pt`}
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "font-mono text-xs uppercase",
                          h.done ? "text-emerald-800 dark:text-emerald-500" : "text-muted-foreground"
                        )}
                      >
                        {h.done ? "feito" : "pendente"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TodayPanel>
      </div>
    </section>
  );
}
