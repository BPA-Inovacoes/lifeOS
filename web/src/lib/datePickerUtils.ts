const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export const WEEKDAYS_PT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

export type CalendarDay = {
  iso: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
};

export function isoTodayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return "";
  const parsed = parseIsoDate(iso);
  if (!parsed) return iso;
  const { year, month, day } = parsed;
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function parseIsoDate(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function monthLabel(monthIndex: number): string {
  return MONTHS_PT[monthIndex] ?? "";
}

export function buildMonthGrid(viewYear: number, viewMonth: number, selectedIso: string): CalendarDay[] {
  const today = isoTodayLocal();
  const first = new Date(viewYear, viewMonth, 1);
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const start = new Date(viewYear, viewMonth, 1 - startOffset);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const iso = toIsoDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
    days.push({
      iso,
      day: d.getDate(),
      inMonth: d.getMonth() === viewMonth,
      isToday: iso === today,
      isSelected: iso === selectedIso,
    });
  }
  return days;
}

export function viewFromValue(value: string): { year: number; month: number } {
  const parsed = parseIsoDate(value);
  if (parsed) return { year: parsed.year, month: parsed.month - 1 };
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}
