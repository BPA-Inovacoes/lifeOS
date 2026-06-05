import type { FinanceAccount, FinanceAccountType, FinanceMovementType } from "@prisma/client";

const LIABILITY_TYPES: FinanceAccountType[] = ["CREDIT_CARD", "LOAN"];

export function isLiabilityAccount(type: FinanceAccountType) {
  return LIABILITY_TYPES.includes(type);
}

export function toMoney(value: unknown): number {
  if (typeof value === "number") return Math.round(value * 100) / 100;
  if (typeof value === "string") return Math.round(parseFloat(value) * 100) / 100;
  if (value && typeof value === "object" && "toNumber" in value) {
    return Math.round((value as { toNumber: () => number }).toNumber() * 100) / 100;
  }
  return 0;
}

export function normalizeInitialBalance(type: FinanceAccountType, amount: number) {
  if (isLiabilityAccount(type) && amount > 0) {
    return -Math.abs(amount);
  }
  return amount;
}

export type BalanceMovementInput = {
  type: FinanceMovementType;
  accountId: string;
  transferDestAccountId: string | null;
  amount: unknown;
};

export function computeBalances(
  accounts: Pick<FinanceAccount, "id" | "initialBalance">[],
  movements: BalanceMovementInput[]
): Map<string, number> {
  const balances = new Map<string, number>();
  for (const account of accounts) {
    balances.set(account.id, toMoney(account.initialBalance));
  }

  for (const m of movements) {
    const amount = Math.abs(toMoney(m.amount));
    const signed = toMoney(m.amount);

    switch (m.type as FinanceMovementType) {
      case "INCOME":
        balances.set(m.accountId, (balances.get(m.accountId) ?? 0) + amount);
        break;
      case "EXPENSE":
        balances.set(m.accountId, (balances.get(m.accountId) ?? 0) - amount);
        break;
      case "TRANSFER":
        balances.set(m.accountId, (balances.get(m.accountId) ?? 0) - amount);
        if (m.transferDestAccountId) {
          balances.set(
            m.transferDestAccountId,
            (balances.get(m.transferDestAccountId) ?? 0) + amount
          );
        }
        break;
      case "ADJUSTMENT":
        balances.set(m.accountId, (balances.get(m.accountId) ?? 0) + signed);
        break;
      default:
        break;
    }
  }

  return balances;
}

export function computeNetWorth(
  accounts: Pick<FinanceAccount, "id" | "initialBalance" | "includeInNetWorth">[],
  balances: Map<string, number>
) {
  let total = 0;
  for (const account of accounts) {
    if (!account.includeInNetWorth) continue;
    total += balances.get(account.id) ?? toMoney(account.initialBalance);
  }
  return Math.round(total * 100) / 100;
}

export function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function startOfWeek(date: Date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}
