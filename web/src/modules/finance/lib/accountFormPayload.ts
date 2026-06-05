import type { AccountFormValues } from "@/modules/finance/components/AccountFormDialog";
import type { createFinanceAccount } from "@/services/financeApi";

export function toCreateAccountBody(
  payload: AccountFormValues
): Parameters<typeof createFinanceAccount>[0] {
  if (payload.initialBalance === undefined) {
    throw new Error("Saldo inicial obrigatório");
  }
  return {
    name: payload.name,
    type: payload.type,
    initialBalance: payload.initialBalance,
    initialBalanceDate: payload.initialBalanceDate,
    institution: payload.institution,
    maskedIdentifier: payload.maskedIdentifier,
    includeInNetWorth: payload.includeInNetWorth,
    color: payload.color,
    creditLimit: payload.creditLimit,
    billingCycleDay: payload.billingCycleDay,
    paymentDueDay: payload.paymentDueDay,
    aprPercent: payload.aprPercent,
    minimumPayment: payload.minimumPayment,
    originalPrincipal: payload.originalPrincipal,
  };
}
