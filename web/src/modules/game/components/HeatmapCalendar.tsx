import { cn } from "@/lib/utils";
import type { GameHeatmapCell } from "@/services/gameApi";
import {
  gameAccentLineClass,
  gameHeatmapLevelClass,
  gamePanelClass,
  gamePanelGlowClass,
  gameSectionLabelClass,
} from "@/modules/game/styles/gameTokens";

type HeatmapCalendarProps = {
  cells: GameHeatmapCell[];
  className?: string;
};

function buildWeekColumns(cells: GameHeatmapCell[]): GameHeatmapCell[][] {
  const weeks: GameHeatmapCell[][] = [];
  let currentWeek: GameHeatmapCell[] = [];

  for (const cell of cells) {
    const dow = new Date(`${cell.date}T12:00:00`).getDay();
    if (currentWeek.length > 0 && dow === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(cell);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return weeks;
}

/** 7 linhas (Dom–Sáb) por coluna de semana — alinha a grelha entre colunas. */
function weekRows(week: GameHeatmapCell[]): (GameHeatmapCell | null)[] {
  const rows: (GameHeatmapCell | null)[] = Array(7).fill(null);
  for (const cell of week) {
    const dow = new Date(`${cell.date}T12:00:00`).getDay();
    rows[dow] = cell;
  }
  return rows;
}

export function HeatmapCalendar({ cells, className }: HeatmapCalendarProps) {
  if (cells.length === 0) return null;

  const weeks = buildWeekColumns(cells);

  return (
    <section className={cn(gamePanelClass, "flex min-h-[300px] flex-col", className)}>
      <div className={gamePanelGlowClass} aria-hidden />
      <div className={gameAccentLineClass} aria-hidden />
      <div className="shrink-0 border-b border-border px-4 py-4 md:px-6">
        <p className={gameSectionLabelClass}>// consistência</p>
        <h2 className="mt-1 text-lg font-medium text-foreground">Heatmap de XP</h2>
      </div>
      <div
        className="flex min-h-0 flex-1 p-4 md:p-6"
        role="img"
        aria-label="Heatmap XP 90 dias"
      >
        <div className="flex h-full w-full min-h-[180px] gap-1">
          {weeks.map((week, weekIndex) => (
            <div
              key={week[0]?.date ?? weekIndex}
              className="flex min-w-0 flex-1 flex-col gap-1"
            >
              {weekRows(week).map((cell, rowIndex) =>
                cell ? (
                  <span
                    key={cell.date}
                    title={`${cell.date}: ${cell.points} XP`}
                    className={cn(
                      "min-h-0 flex-1 rounded-[2px] border border-zinc-900/50",
                      gameHeatmapLevelClass[cell.level] ?? gameHeatmapLevelClass[0]
                    )}
                  />
                ) : (
                  <span
                    key={`empty-${weekIndex}-${rowIndex}`}
                    className="min-h-0 flex-1 rounded-[2px] border border-transparent"
                    aria-hidden
                  />
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
