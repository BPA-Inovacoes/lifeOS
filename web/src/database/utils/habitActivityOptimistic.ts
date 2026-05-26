import type { HeatmapCell, RowActivityMeta } from "@/services/databaseApi";

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function patchHabitActivityOptimistic(
  prev: RowActivityMeta | undefined,
  isDone: boolean,
  wasDone: boolean
): RowActivityMeta {
  const base: RowActivityMeta = prev ?? {
    streak: 0,
    bestStreak: 0,
    doneToday: false,
    frequency: "daily",
    consistency: 0,
    completionRate: 0,
    activeDays: 0,
    heatmap: [],
  };

  let streak = base.streak;
  let bestStreak = base.bestStreak;
  let activeDays = base.activeDays ?? 0;
  let heatmap = base.heatmap ?? [];

  if (isDone && !wasDone) {
    streak = base.streak > 0 ? base.streak + 1 : 1;
    bestStreak = Math.max(base.bestStreak, streak);
    if (!base.doneToday) activeDays += 1;
  } else if (!isDone && wasDone) {
    streak = Math.max(0, base.streak - 1);
    if (base.doneToday && activeDays > 0) activeDays -= 1;
  }

  const key = todayKey();
  heatmap = patchHeatmapToday(heatmap, key, isDone);

  return {
    ...base,
    streak,
    bestStreak,
    doneToday: isDone,
    activeDays,
    heatmap,
  };
}

function patchHeatmapToday(
  heatmap: HeatmapCell[],
  today: string,
  isDone: boolean
): HeatmapCell[] {
  if (heatmap.length === 0) {
    return [{ date: today, level: isDone ? 4 : 0 }];
  }

  const idx = heatmap.findIndex((c) => c.date === today);
  if (idx >= 0) {
    const next = [...heatmap];
    next[idx] = { ...next[idx]!, level: isDone ? 4 : 0 };
    return next;
  }

  return [...heatmap, { date: today, level: isDone ? 4 : 0 }];
}
