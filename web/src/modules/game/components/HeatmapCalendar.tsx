import { cn } from "@/lib/utils";
import type { GameHeatmapCell } from "@/services/gameApi";
import {
  gameAccentLineClass,
  gamePanelClass,
  gamePanelGlowClass,
} from "@/modules/game/styles/gameTokens";

const LEVEL_CLASS: Record<number, string> = {
  0: "bg-zinc-900",
  1: "bg-emerald-950",
  2: "bg-emerald-900/70",
  3: "bg-emerald-800/80",
  4: "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.35)]",
};

type HeatmapCalendarProps = {
  cells: GameHeatmapCell[];
};

export function HeatmapCalendar({ cells }: HeatmapCalendarProps) {
  if (cells.length === 0) return null;

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

  return (
    <section className={gamePanelClass}>
      <div className={gamePanelGlowClass} aria-hidden />
      <div className={gameAccentLineClass} aria-hidden />
      <div className="border-b border-zinc-800 px-4 py-4 md:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-600/80">
          // consistência
        </p>
        <h2 className="mt-1 text-lg font-medium text-white">Heatmap de XP</h2>
      </div>
      <div className="overflow-x-auto p-4 md:p-6" role="img" aria-label="Heatmap XP 90 dias">
        <div className="flex gap-1">
          {weeks.map((week) => (
            <div key={week[0]?.date} className="flex flex-col gap-1">
              {week.map((cell) => (
                <span
                  key={cell.date}
                  title={`${cell.date}: ${cell.points} XP`}
                  className={cn(
                    "size-2.5 shrink-0 border border-zinc-900/50",
                    LEVEL_CLASS[cell.level] ?? LEVEL_CLASS[0]
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

