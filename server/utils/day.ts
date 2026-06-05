/** Data civil local (sem hora) para chaves e comparações de streak. */
export function toDayDate(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function toDayKey(d: Date = new Date()): string {
  const x = toDayDate(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(day: Date, delta: number): Date {
  const d = new Date(day);
  d.setDate(d.getDate() + delta);
  return toDayDate(d);
}

/** Segunda-feira da semana civil de `d`. */
export function startOfWeek(d: Date = new Date()): Date {
  const day = toDayDate(d);
  const dow = day.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  return addDays(day, offset);
}

/** Primeiro dia do mês de `d`. */
export function startOfMonth(d: Date = new Date()): Date {
  const day = toDayDate(d);
  return new Date(day.getFullYear(), day.getMonth(), 1);
}

const WEEKDAY_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function weekdayLabel(day: Date): string {
  return WEEKDAY_PT[day.getDay()];
}
