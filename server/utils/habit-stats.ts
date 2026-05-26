import { addDays, parseDayKey, toDayDate, toDayKey } from "./day";

export type HabitFrequency = "daily" | "weekly";

export type HeatmapCell = {
  date: string;
  level: number;
};

export type HabitRowStats = {
  streak: number;
  bestStreak: number;
  doneToday: boolean;
  frequency: HabitFrequency;
  consistency: number;
  completionRate: number;
  activeDays: number;
  heatmap: HeatmapCell[];
};

export const HABIT_HEATMAP_DAYS = 90;

export function parseHabitFrequency(value: unknown): HabitFrequency {
  const v = String(value ?? "").trim().toLowerCase();
  if (v.startsWith("sem")) return "weekly";
  return "daily";
}

/** Segunda-feira da semana da data (calendário local). */
export function weekStartKey(d: Date): string {
  const day = toDayDate(d);
  const dow = day.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  return toDayKey(addDays(day, mondayOffset));
}

export function computeWeeklyHabitStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const weeks = new Set(dates.map((d) => weekStartKey(d)));
  const today = toDayDate();
  const thisWeek = weekStartKey(today);
  const lastWeek = weekStartKey(addDays(today, -7));

  let cursor: string | null = null;
  if (weeks.has(thisWeek)) cursor = thisWeek;
  else if (weeks.has(lastWeek)) cursor = lastWeek;
  else return 0;

  let streak = 0;
  let check = parseDayKey(cursor);
  while (weeks.has(weekStartKey(check))) {
    streak += 1;
    check = addDays(check, -7);
  }
  return streak;
}

export function computeBestWeeklyStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const sortedWeeks = [...new Set(dates.map((d) => weekStartKey(d)))].sort();
  if (sortedWeeks.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedWeeks.length; i++) {
    const prev = parseDayKey(sortedWeeks[i - 1]!);
    const cur = parseDayKey(sortedWeeks[i]!);
    const diffDays = (cur.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);
    if (diffDays === 7) {
      run += 1;
      best = Math.max(best, run);
    } else if (diffDays > 7) {
      run = 1;
    }
  }
  return best;
}

export function buildHabitHeatmap(
  eventDates: Set<string>,
  days = HABIT_HEATMAP_DAYS
): HeatmapCell[] {
  const today = toDayDate();
  const out: HeatmapCell[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    const key = toDayKey(d);
    out.push({ date: key, level: eventDates.has(key) ? 4 : 0 });
  }
  return out;
}

export function computeHabitConsistency(
  eventDates: Set<string>,
  frequency: HabitFrequency,
  windowDays = 30
): { consistency: number; completionRate: number; activeDays: number } {
  const today = toDayDate();
  let activeDays = 0;

  if (frequency === "weekly") {
    const weeks = new Set<string>();
    for (let i = 0; i < windowDays; i++) {
      const key = toDayKey(addDays(today, -i));
      if (eventDates.has(key)) {
        weeks.add(weekStartKey(addDays(today, -i)));
      }
    }
    activeDays = weeks.size;
    const expectedWeeks = Math.max(1, Math.ceil(windowDays / 7));
    const rate = Math.round((activeDays / expectedWeeks) * 100);
    return {
      consistency: rate,
      completionRate: rate,
      activeDays,
    };
  }

  for (let i = 0; i < windowDays; i++) {
    const key = toDayKey(addDays(today, -i));
    if (eventDates.has(key)) activeDays += 1;
  }
  const rate = Math.round((activeDays / windowDays) * 100);
  return {
    consistency: rate,
    completionRate: rate,
    activeDays,
  };
}

function computeDailyStreakFromDates(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const keys = new Set(dates.map((d) => toDayKey(toDayDate(d))));
  const today = toDayDate();
  const yesterday = addDays(today, -1);

  let cursor: Date | null = null;
  if (keys.has(toDayKey(today))) cursor = today;
  else if (keys.has(toDayKey(yesterday))) cursor = yesterday;
  else return 0;

  let streak = 0;
  let check = cursor;
  while (keys.has(toDayKey(check))) {
    streak += 1;
    check = addDays(check, -1);
  }
  return streak;
}

function computeBestDailyStreakFromDates(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates]
    .map((d) => toDayDate(d))
    .sort((a, b) => a.getTime() - b.getTime());

  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const cur = sorted[i]!;
    const diff = (cur.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);
    if (diff === 1) {
      run += 1;
      best = Math.max(best, run);
    } else if (diff > 1) {
      run = 1;
    }
  }
  return best;
}

export function buildHabitRowStats(
  dates: Date[],
  frequency: HabitFrequency,
  doneToday: boolean
): HabitRowStats {
  const keys = new Set(dates.map((d) => toDayKey(toDayDate(d))));
  const heatmap = buildHabitHeatmap(keys);
  const { consistency, completionRate, activeDays } = computeHabitConsistency(
    keys,
    frequency
  );

  const streak =
    frequency === "weekly"
      ? computeWeeklyHabitStreak(dates)
      : computeDailyStreakFromDates(dates);
  const bestStreak =
    frequency === "weekly"
      ? computeBestWeeklyStreak(dates)
      : computeBestDailyStreakFromDates(dates);

  return {
    streak,
    bestStreak,
    doneToday,
    frequency,
    consistency,
    completionRate,
    activeDays,
    heatmap,
  };
}
