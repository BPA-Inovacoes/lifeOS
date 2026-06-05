import type { PrismaClient } from "@prisma/client";

import { toMoney } from "./finance-balance";

export const DEFAULT_PAY_YOURSELF_PERCENT = 10;

export type FinanceTransferSuggestion = {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  percent: number;
  note: string;
};

export async function buildPayYourselfTransferSuggestion(
  prisma: PrismaClient,
  userId: string,
  income: { accountId: string; amount: number }
): Promise<FinanceTransferSuggestion | null> {
  const profile = await prisma.financialProfile.findUnique({
    where: { userId },
    select: {
      activeMethodId: true,
      defaultSavingsAccountId: true,
      payYourselfPercent: true,
    },
  });

  if (!profile || profile.activeMethodId !== "pay-yourself-first") return null;
  if (!profile.defaultSavingsAccountId) return null;
  if (profile.defaultSavingsAccountId === income.accountId) return null;

  const savings = await prisma.financeAccount.findFirst({
    where: {
      id: profile.defaultSavingsAccountId,
      userId,
      isArchived: false,
      type: "SAVINGS",
    },
    select: { id: true },
  });
  if (!savings) return null;

  const source = await prisma.financeAccount.findFirst({
    where: { id: income.accountId, userId, isArchived: false },
    select: { id: true },
  });
  if (!source) return null;

  const percentRaw =
    profile.payYourselfPercent != null
      ? toMoney(profile.payYourselfPercent)
      : DEFAULT_PAY_YOURSELF_PERCENT;
  const percent = Math.min(80, Math.max(1, percentRaw));
  const amount = Math.round(income.amount * (percent / 100) * 100) / 100;
  if (amount <= 0) return null;

  return {
    fromAccountId: income.accountId,
    toAccountId: savings.id,
    amount,
    percent,
    note: `Paga-te a ti primeiro — ${percent}%`,
  };
}
