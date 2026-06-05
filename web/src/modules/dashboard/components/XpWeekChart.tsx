import type { WeeklyXpDay } from "@/services/dashboardApi";
import { cn } from "@/lib/utils";

type XpWeekChartProps = {
  days: WeeklyXpDay[];
  weekTotal: number;
};

export function XpWeekChart({ days, weekTotal }: XpWeekChartProps) {
  const max = Math.max(...days.map((d) => d.total), 1);

  return (
    <section className="relative border border-border bg-background/85 backdrop-blur-sm">
      <div
        className="absolute left-0 top-0 h-0.5 w-full bg-emerald-600/70"
        aria-hidden
      />
      <div className="border-b border-border px-4 py-4 md:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600/80">
          // xp
        </p>
        <h2 className="mt-1 text-lg font-medium text-foreground">XP — últimos 7 dias</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-mono text-emerald-800 dark:text-emerald-500">{weekTotal} pt</span> esta
          semana · barras = tarefas + hábitos concluídos nesse dia
        </p>
      </div>

      <div className="flex items-end justify-between gap-2 px-4 pb-2 pt-6 md:gap-3 md:px-6">
        {days.map((day) => {
          const h = day.total > 0 ? Math.max(12, Math.round((day.total / max) * 120)) : 4;
          return (
            <div
              key={day.date}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <span className="font-mono text-sm text-muted-foreground">
                {day.total > 0 ? day.total : "·"}
              </span>
              <div
                className="flex w-full max-w-[48px] flex-col justify-end"
                style={{ height: 128 }}
                title={`${day.label}: ${day.total} pt (tarefas ${day.taskPoints}, hábitos ${day.habitPoints})`}
              >
                <div
                  className={cn(
                    "w-full border border-emerald-900/40 transition-all",
                    day.isToday ? "bg-emerald-500" : "bg-emerald-600/60",
                    day.total === 0 && "bg-muted/80 border-border"
                  )}
                  style={{ height: h }}
                />
              </div>
              <span
                className={cn(
                  "font-mono text-xs uppercase",
                  day.isToday ? "text-emerald-800 dark:text-emerald-500" : "text-muted-foreground"
                )}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
