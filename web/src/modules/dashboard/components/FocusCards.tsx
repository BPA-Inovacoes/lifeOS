import { Flame, ListTodo, Target, Zap } from "lucide-react";

import { MetricCard } from "@/modules/dashboard/components/MetricCard";
import type { DashboardSummary } from "@/services/dashboardApi";
import { paths } from "@/routes/paths";
import { sectionLabelMutedClass } from "@/styles/designTokens";

export function FocusCards({ data }: { data: DashboardSummary }) {
  const { metrics, links } = data;
  const habitsPct =
    metrics.habitsTotal > 0
      ? Math.round((metrics.habitsDoneToday / metrics.habitsTotal) * 100)
      : 0;

  const pointsPct =
    metrics.pointsGoal > 0
      ? Math.round((metrics.pointsToday / metrics.pointsGoal) * 100)
      : 0;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className={sectionLabelMutedClass}>// métricas</p>
          <h2 className="mt-1 text-lg font-medium text-foreground">Resumo de hoje</h2>
        </div>
        {metrics.tasksDueToday > 0 ? (
          <span className="border border-amber-900/50 bg-amber-950/40 px-2 py-1 font-mono text-xs uppercase tracking-wider text-amber-500/90">
            {metrics.tasksDueToday} tarefa
            {metrics.tasksDueToday === 1 ? "" : "s"} com prazo hoje
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={ListTodo}
          label="tarefas"
          hint={
            metrics.tasksDueToday > 0
              ? `${metrics.tasksDueToday} com data hoje · ${metrics.tasksDone} concluídas`
              : `${metrics.tasksDone} concluídas no total`
          }
          value={metrics.tasksOpen}
          href={
            links.tasksDatabaseId && links.workspaceId
              ? paths.focus.database(links.workspaceId, links.tasksDatabaseId)
              : undefined
          }
          linkLabel="Ver tarefas →"
        />

        <MetricCard
          icon={Flame}
          label="hábitos"
          hint={
            metrics.habitsTotal > 0
              ? `${habitsPct}% hoje · melhor seq. ${metrics.bestHabitStreak}d`
              : "Adiciona hábitos na base de dados"
          }
          value={
            <>
              {metrics.habitsDoneToday}
              <span className="text-lg font-normal text-muted-foreground">
                /{metrics.habitsTotal || "—"}
              </span>
            </>
          }
          footer={
            metrics.habitsTotal > 0 ? (
              <div className="h-1 overflow-hidden rounded-none bg-muted">
                <div
                  className="h-full rounded-none bg-emerald-600 transition-all"
                  style={{ width: `${habitsPct}%` }}
                />
              </div>
            ) : null
          }
          href={
            links.habitsDatabaseId && links.workspaceId
              ? paths.focus.database(links.workspaceId, links.habitsDatabaseId)
              : undefined
          }
          linkLabel="Ver hábitos →"
        />

        <MetricCard
          icon={Zap}
          label="xp"
          hint={
            metrics.pointsAvailable > 0
              ? `+${metrics.pointsAvailable} disponíveis · semana ${metrics.weekXpTotal} pt`
              : `Semana ${metrics.weekXpTotal} pt · hoje tarefas ${metrics.pointsFromTasksToday} · hábitos ${metrics.pointsFromHabitsToday}`
          }
          value={
            <>
              {metrics.pointsToday}
              <span className="text-lg font-normal text-muted-foreground">
                /{metrics.pointsGoal || "—"}
              </span>
            </>
          }
          highlight
          footer={
            <div className="h-1 overflow-hidden rounded-none bg-muted">
              <div
                className="h-full rounded-none bg-emerald-500 transition-all"
                style={{ width: `${pointsPct}%` }}
              />
            </div>
          }
        />

        <MetricCard
          icon={Target}
          label="foco"
          hint="Progresso combinado (tarefas + hábitos)"
          value={`${metrics.weeklyProgress}%`}
          footer={
            <div className="h-1 overflow-hidden rounded-none bg-muted">
              <div
                className="h-full rounded-none bg-zinc-600 transition-all"
                style={{ width: `${metrics.weeklyProgress}%` }}
              />
            </div>
          }
        />
      </div>

      <p className="font-mono text-sm text-muted-foreground">
        Ajusta os pontos em cada tarefa/hábito na tabela — prioridade e frequência
        sugerem valores base (Alta 30 · Média 20 · Baixa 10 · Hábito diário 15).
      </p>
    </section>
  );
}
