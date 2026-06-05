import { formatDisplayDate } from "@/lib/datePickerUtils";
import { formatMoney, type FinanceMovement } from "@/services/financeApi";

export function formatRollupPeriod(from?: string, to?: string) {
  if (!from && !to) return "";
  const end = to ?? from;
  if (!end) return "";
  if (!from || from === to) return formatDisplayDate(end);
  return `${formatDisplayDate(from)} – ${formatDisplayDate(end)}`;
}

export function rollupListTitle(m: FinanceMovement) {
  const seq = m.rollupSequence ?? "?";
  const count = m.rollupCount ?? 25;
  return `Resumo #${seq} — ${count} movimento${count === 1 ? "" : "s"}`;
}

export function rollupListSubtitle(m: FinanceMovement, currency: string) {
  const period = formatRollupPeriod(m.rollupPeriodFrom, m.rollupPeriodTo);
  const t = m.rollupTotals;
  if (!t) return period;

  const parts: string[] = [];
  if (period) parts.push(period);
  if (t.income > 0) parts.push(`Receitas ${formatMoney(t.income, currency)}`);
  if (t.expense > 0) parts.push(`Despesas ${formatMoney(t.expense, currency)}`);
  if (t.income === 0 && t.expense === 0) parts.push("Sem receitas nem despesas");

  return parts.join(" · ");
}
