import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";
import type { HabitFrequency } from "@/services/databaseApi";

type HabitStreakBadgeProps = {
  streak: number;
  bestStreak?: number;
  frequency?: HabitFrequency;
  className?: string;
};

export function HabitStreakBadge({
  streak,
  bestStreak,
  frequency = "daily",
  className,
}: HabitStreakBadgeProps) {
  if (streak <= 0) {
    return (
      <span className={cn("shrink-0 font-mono text-sm text-zinc-700", className)}>
        —
      </span>
    );
  }

  const unit = frequency === "weekly" ? "sem" : "d";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1 border border-amber-900/50 px-2 py-1 font-mono text-xs uppercase text-amber-500",
        className
      )}
      title={
        bestStreak && bestStreak > streak ? `Recorde: ${bestStreak}${unit}` : undefined
      }
    >
      <Flame className="size-3.5" />
      {streak}
      {unit}
      {bestStreak && bestStreak > streak ? (
        <span className="text-muted-foreground">· máx {bestStreak}</span>
      ) : null}
    </span>
  );
}
