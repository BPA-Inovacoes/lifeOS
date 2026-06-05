import type { PrismaClient } from "@prisma/client";

import { findProp, parsePoints } from "../utils/points";

export type FinanceIncomeSuggestion = {
  clientRowId: string;
  clientName: string;
  amount: number;
  accountId: string | null;
  categoryId: string;
  note: string;
};

type ClientRowShape = {
  id: string;
};

type Prop = { id: string; name: string; type: string };

export async function buildClientIncomeSuggestion(
  prisma: PrismaClient,
  userId: string,
  row: ClientRowShape,
  properties: Prop[],
  merged: Record<string, unknown>
): Promise<FinanceIncomeSuggestion | null> {
  const valueProp =
    findProp(properties, "Valor (€)") ??
    findProp(properties, "Valor") ??
    findProp(properties, "Valor EUR");
  const amount = valueProp ? parsePoints(merged[valueProp.id]) : 0;
  if (amount <= 0) return null;

  const existing = await prisma.financeMovement.findFirst({
    where: { userId, linkedClientRowId: row.id },
    select: { id: true },
  });
  if (existing) return null;

  const nameProp =
    findProp(properties, "Cliente") ??
    findProp(properties, "Nome") ??
    findProp(properties, "Título");
  const clientName = nameProp ? String(merged[nameProp.id] ?? "Cliente").trim() || "Cliente" : "Cliente";

  const profile = await prisma.financialProfile.findUnique({
    where: { userId },
    select: { defaultIncomeAccountId: true },
  });

  return {
    clientRowId: row.id,
    clientName,
    amount,
    accountId: profile?.defaultIncomeAccountId ?? null,
    categoryId: "inc-freelance",
    note: `Receita — ${clientName}`,
  };
}
