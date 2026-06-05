import type { FinanceAccount, FinanceMovement, FinanceMovementType } from "@prisma/client";

import { monthKey, toMoney } from "./finance-balance";

/** Máximo de movimentos em detalhe antes de empacotar o lote mais antigo. */
export const FINANCE_MOVEMENT_DETAIL_CAP = 25;

/** Prefixo de IDs de resumo: fin-roll-{user8}-{000001} */
export const FINANCE_ROLLUP_ID_PREFIX = "fin-roll";

export type RollupLine = {
  type: FinanceMovementType;
  accountId: string;
  transferDestAccountId: string | null;
  amount: number;
};

/** Snapshot imutável de cada movimento compactado (id original preservado). */
export type RollupEntry = {
  id: string;
  type: FinanceMovementType;
  accountId: string;
  accountName: string;
  transferDestAccountId: string | null;
  transferDestAccountName: string | null;
  amount: number;
  date: string;
  categoryId: string | null;
  categoryName: string | null;
  note: string | null;
};

export type RollupMonthSlice = {
  income: number;
  expense: number;
  savingsTransfer: number;
};

export type RollupTotals = {
  income: number;
  expense: number;
  savingsTransfer: number;
  byMonth: Record<string, RollupMonthSlice>;
};

/** Persistido em FinanceMovementRollup.totals — inclui snapshot para a UI. */
export type RollupTotalsStored = RollupTotals & {
  entries?: RollupEntry[];
};

type MovementWithRelations = FinanceMovement & {
  category: { id: string; name: string } | null;
  account: Pick<FinanceAccount, "id" | "name" | "type">;
  transferDestAccount: Pick<FinanceAccount, "id" | "name" | "type"> | null;
};

export function buildRollupId(userId: string, sequence: number) {
  const short = userId.replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase() || "user";
  return `${FINANCE_ROLLUP_ID_PREFIX}-${short}-${String(sequence).padStart(6, "0")}`;
}

export function extractRollupLines(movements: MovementWithRelations[]): RollupLine[] {
  return movements.map((m) => ({
    type: m.type,
    accountId: m.accountId,
    transferDestAccountId: m.transferDestAccountId,
    amount: toMoney(m.amount),
  }));
}

export function extractRollupEntries(movements: MovementWithRelations[]): RollupEntry[] {
  return movements.map((m) => ({
    id: m.id,
    type: m.type,
    accountId: m.accountId,
    accountName: m.account.name,
    transferDestAccountId: m.transferDestAccountId,
    transferDestAccountName: m.transferDestAccount?.name ?? null,
    amount: toMoney(m.amount),
    date: m.date.toISOString().slice(0, 10),
    categoryId: m.categoryId,
    categoryName: m.category?.name ?? null,
    note: m.note,
  }));
}

export function buildRollupTotals(movements: MovementWithRelations[]): RollupTotals {
  const byMonth: Record<string, RollupMonthSlice> = {};
  let income = 0;
  let expense = 0;
  let savingsTransfer = 0;

  const addMonth = (date: Date, slice: Partial<RollupMonthSlice>) => {
    const key = monthKey(date);
    const prev = byMonth[key] ?? { income: 0, expense: 0, savingsTransfer: 0 };
    byMonth[key] = {
      income: prev.income + (slice.income ?? 0),
      expense: prev.expense + (slice.expense ?? 0),
      savingsTransfer: prev.savingsTransfer + (slice.savingsTransfer ?? 0),
    };
  };

  for (const m of movements) {
    const amount = Math.abs(toMoney(m.amount));
    if (m.type === "INCOME") {
      income += amount;
      addMonth(m.date, { income: amount });
    } else if (m.type === "EXPENSE") {
      expense += amount;
      addMonth(m.date, { expense: amount });
    } else if (m.type === "TRANSFER" && m.transferDestAccount?.type === "SAVINGS") {
      savingsTransfer += amount;
      addMonth(m.date, { savingsTransfer: amount });
    }
  }

  const round = (n: number) => Math.round(n * 100) / 100;
  income = round(income);
  expense = round(expense);
  savingsTransfer = round(savingsTransfer);
  for (const key of Object.keys(byMonth)) {
    const s = byMonth[key];
    byMonth[key] = {
      income: round(s.income),
      expense: round(s.expense),
      savingsTransfer: round(s.savingsTransfer),
    };
  }

  return { income, expense, savingsTransfer, byMonth };
}

export function rollupLinesToBalanceInput(lines: RollupLine[]) {
  return lines.map((line) => ({
    type: line.type,
    accountId: line.accountId,
    transferDestAccountId: line.transferDestAccountId,
    amount: line.amount,
  }));
}

export function mergeRollupMonthFlow(
  totals: RollupTotals,
  month: string
): RollupMonthSlice | null {
  const slice = totals.byMonth[month];
  return slice ?? null;
}

export type WeekFlowTotals = {
  income: number;
  expense: number;
  savingsTransfer: number;
  movementCount: number;
  expenseByCategory: Record<string, { id: string; name: string; total: number }>;
};

function inDateRange(dateIso: string, fromIso: string, toIso: string) {
  return Boolean(dateIso.trim()) && dateIso >= fromIso && dateIso <= toIso;
}

function parseIsoDay(iso: string) {
  return new Date(`${iso}T12:00:00.000Z`);
}

/** Dias de sobreposição entre o período do resumo e a semana da revisão (0–1). */
export function rollupWeekOverlapRatio(
  periodFrom: Date,
  periodTo: Date,
  weekStartIso: string,
  weekEndIso: string
): number {
  const weekStart = parseIsoDay(weekStartIso);
  const weekEnd = parseIsoDay(weekEndIso);
  const fromMs = Date.UTC(
    periodFrom.getUTCFullYear(),
    periodFrom.getUTCMonth(),
    periodFrom.getUTCDate()
  );
  const toMs = Date.UTC(
    periodTo.getUTCFullYear(),
    periodTo.getUTCMonth(),
    periodTo.getUTCDate()
  );
  const overlapStartMs = Math.max(fromMs, weekStart.getTime());
  const overlapEndMs = Math.min(toMs, weekEnd.getTime());
  if (overlapStartMs > overlapEndMs) return 0;

  const dayMs = 86_400_000;
  const overlapDays = Math.floor((overlapEndMs - overlapStartMs) / dayMs) + 1;
  const periodDays = Math.floor((toMs - fromMs) / dayMs) + 1;
  if (periodDays <= 0) return 0;
  return Math.min(1, overlapDays / periodDays);
}

export function hasRollupEntryDates(entries: RollupEntry[]): boolean {
  return entries.some((e) => Boolean(e.date?.trim()));
}

const ROLLUP_COMPACT_CATEGORY = {
  id: "rollup-compact",
  name: "Resumo compactado",
} as const;

/** Soma receitas/despesas/categorias de entradas compactadas num intervalo (ex.: semana da revisão). */
export function sumRollupEntriesInRange(
  entries: RollupEntry[],
  fromIso: string,
  toIso: string
): WeekFlowTotals {
  const categoryTotals = new Map<string, { id: string; name: string; total: number }>();
  let income = 0;
  let expense = 0;
  let savingsTransfer = 0;
  let movementCount = 0;

  for (const e of entries) {
    if (!inDateRange(e.date, fromIso, toIso)) continue;
    movementCount += 1;
    const amount = Math.abs(e.amount);
    if (e.type === "INCOME") {
      income += amount;
    } else if (e.type === "EXPENSE") {
      expense += amount;
      const id = e.categoryId ?? "uncategorized";
      const name = e.categoryName ?? "Sem categoria";
      const prev = categoryTotals.get(id);
      categoryTotals.set(id, {
        id,
        name,
        total: (prev?.total ?? 0) + amount,
      });
    } else if (e.type === "TRANSFER") {
      // Entradas antigas não guardam tipo da conta destino — só contamos no total de movimentos.
      savingsTransfer += 0;
    }
  }

  const round = (n: number) => Math.round(n * 100) / 100;
  const expenseByCategory: WeekFlowTotals["expenseByCategory"] = {};
  for (const [id, v] of categoryTotals) {
    expenseByCategory[id] = { ...v, total: round(v.total) };
  }

  return {
    income: round(income),
    expense: round(expense),
    savingsTransfer: round(savingsTransfer),
    movementCount,
    expenseByCategory,
  };
}

/** Resumos legados (sem `date` nas entries) — atribui totais pelo overlap do período do lote. */
export function sumRollupPeriodOverlap(
  totals: RollupTotals,
  periodFrom: Date,
  periodTo: Date,
  weekStartIso: string,
  weekEndIso: string,
  lineCount: number
): WeekFlowTotals | null {
  const ratio = rollupWeekOverlapRatio(periodFrom, periodTo, weekStartIso, weekEndIso);
  if (ratio <= 0) return null;

  const round = (n: number) => Math.round(n * 100) / 100;
  const income = round(totals.income * ratio);
  const expense = round(totals.expense * ratio);
  const savingsTransfer = round(totals.savingsTransfer * ratio);
  const movementCount =
    Math.round(lineCount * ratio) || (income + expense + savingsTransfer > 0 ? 1 : 0);

  const expenseByCategory: WeekFlowTotals["expenseByCategory"] = {};
  if (expense > 0) {
    expenseByCategory[ROLLUP_COMPACT_CATEGORY.id] = {
      ...ROLLUP_COMPACT_CATEGORY,
      total: expense,
    };
  }

  return {
    income,
    expense,
    savingsTransfer,
    movementCount,
    expenseByCategory,
  };
}

/** Entradas com data → filtro exacto; legado → overlap do período do lote. */
export function weekFlowFromRollup(
  stored: RollupTotalsStored,
  periodFrom: Date,
  periodTo: Date,
  weekStartIso: string,
  weekEndIso: string,
  lineCount: number
): WeekFlowTotals | null {
  const entries = stored.entries ?? [];
  if (hasRollupEntryDates(entries)) {
    const slice = sumRollupEntriesInRange(entries, weekStartIso, weekEndIso);
    if (slice.movementCount > 0 || slice.income > 0 || slice.expense > 0) {
      return slice;
    }
    return null;
  }

  const totals: RollupTotals = {
    income: stored.income ?? 0,
    expense: stored.expense ?? 0,
    savingsTransfer: stored.savingsTransfer ?? 0,
    byMonth: stored.byMonth ?? {},
  };
  return sumRollupPeriodOverlap(
    totals,
    periodFrom,
    periodTo,
    weekStartIso,
    weekEndIso,
    lineCount
  );
}

export function mergeWeekFlowSlices(...slices: WeekFlowTotals[]): WeekFlowTotals {
  const categoryTotals = new Map<string, { id: string; name: string; total: number }>();
  let income = 0;
  let expense = 0;
  let savingsTransfer = 0;
  let movementCount = 0;

  for (const s of slices) {
    income += s.income;
    expense += s.expense;
    savingsTransfer += s.savingsTransfer;
    movementCount += s.movementCount;
    for (const c of Object.values(s.expenseByCategory)) {
      const prev = categoryTotals.get(c.id);
      categoryTotals.set(c.id, {
        id: c.id,
        name: c.name,
        total: (prev?.total ?? 0) + c.total,
      });
    }
  }

  const round = (n: number) => Math.round(n * 100) / 100;
  const expenseByCategory: WeekFlowTotals["expenseByCategory"] = {};
  for (const [id, v] of categoryTotals) {
    expenseByCategory[id] = { id, name: v.name, total: round(v.total) };
  }

  return {
    income: round(income),
    expense: round(expense),
    savingsTransfer: round(savingsTransfer),
    movementCount,
    expenseByCategory,
  };
}

export type RollupListFilters = {
  accountId?: string;
  type?: "EXPENSE" | "INCOME" | "TRANSFER" | "ADJUSTMENT";
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
};

function entryMatchesAccount(entry: RollupEntry, accountId: string) {
  return entry.accountId === accountId || entry.transferDestAccountId === accountId;
}

function lineMatchesAccount(line: RollupLine, accountId: string) {
  return line.accountId === accountId || line.transferDestAccountId === accountId;
}

function entryInDateRange(entry: RollupEntry, dateFrom?: string, dateTo?: string) {
  if (!entry.date?.trim()) return true;
  if (dateFrom && entry.date < dateFrom) return false;
  if (dateTo && entry.date > dateTo) return false;
  return true;
}

function entryMatchesSearch(entry: RollupEntry, q: string) {
  const hay = [
    entry.note,
    entry.accountName,
    entry.categoryName,
    entry.transferDestAccountName,
    entry.id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

/** O período do resumo intersecta o intervalo de datas pedido na listagem. */
export function rollupPeriodOverlapsRange(
  periodFrom: Date,
  periodTo: Date,
  dateFrom?: string,
  dateTo?: string
) {
  const from = dateFrom ? parseIsoDay(dateFrom) : null;
  const to = dateTo ? parseIsoDay(dateTo) : null;
  if (from && periodTo < from) return false;
  if (to && periodFrom > to) return false;
  return true;
}

/** Resumo visível na listagem quando alguma entrada (ou linha legada) cumpre os filtros. */
export function rollupMatchesListFilters(
  rollup: {
    lines: unknown;
    totals: unknown;
    periodFrom: Date;
    periodTo: Date;
  },
  opts?: RollupListFilters
) {
  if (!opts) return true;
  if (
    !rollupPeriodOverlapsRange(rollup.periodFrom, rollup.periodTo, opts.dateFrom, opts.dateTo)
  ) {
    return false;
  }

  const stored = rollup.totals as RollupTotalsStored;
  const entries = stored.entries ?? [];
  const q = opts.q?.trim().toLowerCase();

  if (entries.length > 0 && hasRollupEntryDates(entries)) {
    return entries.some((entry) => {
      if (opts.type && entry.type !== opts.type) return false;
      if (opts.categoryId && entry.categoryId !== opts.categoryId) return false;
      if (opts.accountId && !entryMatchesAccount(entry, opts.accountId)) return false;
      if (!entryInDateRange(entry, opts.dateFrom, opts.dateTo)) return false;
      if (q && !entryMatchesSearch(entry, q)) return false;
      return true;
    });
  }

  const lines = rollup.lines as RollupLine[];
  if (!Array.isArray(lines) || lines.length === 0) return false;

  if (opts.type && !lines.some((line) => line.type === opts.type)) return false;
  if (opts.accountId && !lines.some((line) => lineMatchesAccount(line, opts.accountId!))) {
    return false;
  }
  if (opts.categoryId || q) return false;

  return true;
}

function monthKeyFromIso(dateIso: string) {
  return dateIso.slice(0, 7);
}

/** Totais por categoria num mês, incluindo movimentos compactados em resumos. */
export function collectRollupCategoryTotalsForMonth(
  rollups: { totals: unknown }[],
  month: string,
  movementType: "EXPENSE" | "INCOME"
) {
  const totals = new Map<string, { name: string; total: number }>();
  const round = (n: number) => Math.round(n * 100) / 100;

  for (const rollup of rollups) {
    const stored = rollup.totals as RollupTotalsStored;
    const entries = stored.entries ?? [];

    if (entries.length > 0 && hasRollupEntryDates(entries)) {
      for (const entry of entries) {
        if (!entry.date?.trim() || monthKeyFromIso(entry.date) !== month) continue;
        if (entry.type !== movementType) continue;
        const id = entry.categoryId ?? "uncategorized";
        const name = entry.categoryName ?? "Sem categoria";
        const amount = Math.abs(entry.amount);
        const prev = totals.get(id) ?? { name, total: 0 };
        totals.set(id, { name, total: prev.total + amount });
      }
      continue;
    }

    const rollupTotals: RollupTotals = {
      income: stored.income ?? 0,
      expense: stored.expense ?? 0,
      savingsTransfer: stored.savingsTransfer ?? 0,
      byMonth: stored.byMonth ?? {},
    };
    const slice = mergeRollupMonthFlow(rollupTotals, month);
    if (!slice) continue;

    const amount = movementType === "EXPENSE" ? slice.expense : slice.income;
    if (amount <= 0) continue;

    const prev = totals.get(ROLLUP_COMPACT_CATEGORY.id) ?? {
      name: ROLLUP_COMPACT_CATEGORY.name,
      total: 0,
    };
    totals.set(ROLLUP_COMPACT_CATEGORY.id, {
      name: ROLLUP_COMPACT_CATEGORY.name,
      total: prev.total + amount,
    });
  }

  for (const [id, value] of totals) {
    totals.set(id, { ...value, total: round(value.total) });
  }
  return totals;
}
