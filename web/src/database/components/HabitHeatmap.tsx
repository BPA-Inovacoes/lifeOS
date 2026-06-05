import { cn } from "@/lib/utils";
import type { HeatmapCell } from "@/services/databaseApi";

const LEVEL_CLASS: Record<number, string> = {
  0: "bg-card",
  1: "bg-emerald-950",
  2: "bg-emerald-900/70",
  3: "bg-emerald-800/80",
  4: "bg-emerald-600",
};

type HabitHeatmapProps = {
  cells: HeatmapCell[];
  compact?: boolean;
  className?: string;
};

/** Grelha estilo GitHub: colunas = semanas, linhas = dias da semana (Dom–Sáb). */
export function HabitHeatmap({
  cells,
  compact = false,
  className,
}: HabitHeatmapProps) {
  if (cells.length === 0) return null;

  const weeks: HeatmapCell[][] = [];
  let currentWeek: HeatmapCell[] = [];

  for (const cell of cells) {
    const dow = new Date(`${cell.date}T12:00:00`).getDay();
    if (currentWeek.length > 0 && dow === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(cell);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const cellSize = compact ? "size-2" : "size-2.5";
  const gap = compact ? "gap-0.5" : "gap-1";

  return (
    <div
      className={cn("overflow-x-auto", className)}
      role="img"
      aria-label="Histórico de conclusões nos últimos 90 dias"
    >
      <div className={cn("flex", gap)}>
        {weeks.map((week, wi) => (
          <div key={week[0]?.date ?? wi} className={cn("flex flex-col", gap)}>
            {week.map((cell) => (
              <span
                key={cell.date}
                title={cell.date}
                className={cn(
                  "shrink-0 border border-zinc-900/50",
                  cellSize,
                  LEVEL_CLASS[cell.level] ?? LEVEL_CLASS[0]
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
