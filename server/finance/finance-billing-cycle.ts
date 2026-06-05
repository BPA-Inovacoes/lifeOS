/** Dia de ciclo válido (evita 29–31 por variação de meses). */
export function isValidCycleDay(day: number | null | undefined): day is number {
  return typeof day === "number" && Number.isInteger(day) && day >= 1 && day <= 28;
}

function atUtcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

function clampCycleDay(day: number, year: number, month: number): number {
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Math.min(day, last);
}

export type BillingPeriod = {
  from: string;
  to: string;
  nextClosing: string;
  nextPaymentDue: string | null;
};

/**
 * Período de facturação actual para um cartão com fecho no `cycleDay`.
 * `ref` — data de referência (normalmente hoje).
 */
export function computeBillingPeriod(cycleDay: number, ref = new Date()): BillingPeriod {
  const y = ref.getUTCFullYear();
  const m = ref.getUTCMonth();
  const d = ref.getUTCDate();

  const closingThisMonth = clampCycleDay(cycleDay, y, m);
  let periodEndYear = y;
  let periodEndMonth = m;

  if (d > closingThisMonth) {
    periodEndMonth += 1;
    if (periodEndMonth > 11) {
      periodEndMonth = 0;
      periodEndYear += 1;
    }
  }

  const periodEndDay = clampCycleDay(cycleDay, periodEndYear, periodEndMonth);
  const periodEnd = atUtcDate(periodEndYear, periodEndMonth, periodEndDay);

  let periodStartMonth = periodEndMonth - 1;
  let periodStartYear = periodEndYear;
  if (periodStartMonth < 0) {
    periodStartMonth = 11;
    periodStartYear -= 1;
  }
  const periodStartDay = clampCycleDay(cycleDay, periodStartYear, periodStartMonth);
  const periodStart = atUtcDate(periodStartYear, periodStartMonth, periodStartDay);
  const from = new Date(periodStart);
  from.setUTCDate(from.getUTCDate() + 1);

  let nextCloseMonth = periodEndMonth + 1;
  let nextCloseYear = periodEndYear;
  if (nextCloseMonth > 11) {
    nextCloseMonth = 0;
    nextCloseYear += 1;
  }
  const nextClosing = atUtcDate(
    nextCloseYear,
    nextCloseMonth,
    clampCycleDay(cycleDay, nextCloseYear, nextCloseMonth)
  );

  return {
    from: from.toISOString().slice(0, 10),
    to: periodEnd.toISOString().slice(0, 10),
    nextClosing: nextClosing.toISOString().slice(0, 10),
    nextPaymentDue: null,
  };
}

export function withPaymentDue(period: BillingPeriod, paymentDueDay: number | null): BillingPeriod {
  if (!isValidCycleDay(paymentDueDay)) {
    return period;
  }
  const close = new Date(`${period.nextClosing}T12:00:00.000Z`);
  let y = close.getUTCFullYear();
  let m = close.getUTCMonth();
  const closeDay = close.getUTCDate();
  if (paymentDueDay <= closeDay) {
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  const due = atUtcDate(y, m, clampCycleDay(paymentDueDay, y, m));
  return { ...period, nextPaymentDue: due.toISOString().slice(0, 10) };
}
