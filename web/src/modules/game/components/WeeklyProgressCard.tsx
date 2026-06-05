import {
  gameAccentLineClass,
  gameNeonTextClass,
  gamePanelClass,
  gamePanelGlowClass,
  gameSectionLabelClass,
} from "@/modules/game/styles/gameTokens";

type WeeklyProgressCardProps = {
  days: {
    date: string;
    label: string;
    total: number;
    isToday: boolean;
  }[];
};

export function WeeklyProgressCard({ days }: WeeklyProgressCardProps) {
  const weekTotal = days.reduce((s, d) => s + d.total, 0);
  const max = Math.max(...days.map((d) => d.total), 1);

  return (
    <section className={gamePanelClass}>
      <div className={gamePanelGlowClass} aria-hidden />
      <div className={gameAccentLineClass} aria-hidden />
      <div className="border-b border-border px-4 py-4 md:px-6">
        <p className={gameSectionLabelClass}>
          // progresso
        </p>
        <h2 className="mt-1 text-lg font-medium text-foreground">XP semanal</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className={`font-mono ${gameNeonTextClass}`}>{weekTotal}</span> XP esta
          semana
        </p>
      </div>
      <WeeklyBars days={days} max={max} />
    </section>
  );
}

function WeeklyBars({
  days,
  max,
}: {
  days: WeeklyProgressCardProps["days"];
  max: number;
}) {
  return (
    <div className="flex items-end justify-between gap-2 px-4 pb-4 pt-6 md:gap-3 md:px-6">
      {days.map((day) => {
        const h =
          day.total > 0 ? Math.max(12, Math.round((day.total / max) * 100)) : 4;
        return (
          <div
            key={day.date}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <span className="font-mono text-sm text-muted-foreground">
              {day.total > 0 ? day.total : "·"}
            </span>
            <div
              className="flex w-full max-w-[40px] flex-col justify-end"
              style={{ height: 108 }}
            >
              <div
                className={cnBar(day)}
                style={{ height: h }}
              />
            </div>
            <span className={cnLabel(day)}>{day.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function cnBar(day: { total: number; isToday: boolean }) {
  const base =
    "w-full border border-violet-900/40 transition-all duration-500";
  if (day.total === 0) return `${base} border-border bg-muted/80`;
  if (day.isToday)
    return `${base} bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.4)]`;
  return `${base} bg-violet-600/50`;
}

function cnLabel(day: { isToday: boolean }) {
  return day.isToday
    ? "font-mono text-xs uppercase text-violet-900 dark:text-violet-400"
    : "font-mono text-xs uppercase text-muted-foreground";
}

