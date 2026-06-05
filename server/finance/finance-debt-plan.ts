import type { FinanceAccountType } from "@prisma/client";

import {
  computeBillingPeriod,
  isValidCycleDay,
  withPaymentDue,
  type BillingPeriod,
} from "./finance-billing-cycle";
import { isLiabilityAccount, toMoney } from "./finance-balance";

export type DebtAccountInput = {
  id: string;
  name: string;
  type: FinanceAccountType;
  balance: number;
  aprPercent: number | null;
  minimumPayment: number | null;
  creditLimit: number | null;
  billingCycleDay: number | null;
  paymentDueDay: number | null;
  originalPrincipal: number | null;
  cycleSpend?: number;
};

export type DebtPlanEntry = {
  accountId: string;
  name: string;
  type: FinanceAccountType;
  balance: number;
  debtAmount: number;
  aprPercent: number | null;
  minimumPayment: number | null;
  creditLimit: number | null;
  availableCredit: number | null;
  billingPeriod: BillingPeriod | null;
  originalPrincipal: number | null;
  paidOffPercent: number | null;
  rank: number;
};

function debtAmount(balance: number): number {
  return Math.round(Math.abs(balance) * 100) / 100;
}

function paidOffPercent(original: number | null, balance: number): number | null {
  if (original == null || original <= 0) return null;
  const remaining = debtAmount(balance);
  const paid = Math.max(0, original - remaining);
  return Math.min(100, Math.round((paid / original) * 1000) / 10);
}

function enrichEntry(
  account: DebtAccountInput,
  rank: number
): DebtPlanEntry {
  const debt = debtAmount(account.balance);
  let billingPeriod: BillingPeriod | null = null;
  if (account.type === "CREDIT_CARD" && isValidCycleDay(account.billingCycleDay)) {
    billingPeriod = withPaymentDue(
      computeBillingPeriod(account.billingCycleDay),
      account.paymentDueDay
    );
  }

  const availableCredit =
    account.creditLimit != null && account.creditLimit > 0
      ? Math.round((account.creditLimit - debt) * 100) / 100
      : null;

  return {
    accountId: account.id,
    name: account.name,
    type: account.type,
    balance: account.balance,
    debtAmount: debt,
    aprPercent: account.aprPercent,
    minimumPayment: account.minimumPayment,
    creditLimit: account.creditLimit,
    availableCredit,
    billingPeriod,
    originalPrincipal: account.originalPrincipal,
    paidOffPercent: paidOffPercent(account.originalPrincipal, account.balance),
    rank,
  };
}

export function orderSnowball(accounts: DebtAccountInput[]): DebtPlanEntry[] {
  const active = accounts
    .filter((a) => isLiabilityAccount(a.type) && debtAmount(a.balance) > 0)
    .sort((a, b) => debtAmount(a.balance) - debtAmount(b.balance));
  return active.map((a, i) => enrichEntry(a, i + 1));
}

export function orderAvalanche(accounts: DebtAccountInput[]): DebtPlanEntry[] {
  const active = accounts
    .filter((a) => isLiabilityAccount(a.type) && debtAmount(a.balance) > 0)
    .sort((a, b) => {
      const aprA = a.aprPercent ?? -1;
      const aprB = b.aprPercent ?? -1;
      if (aprB !== aprA) return aprB - aprA;
      return debtAmount(b.balance) - debtAmount(a.balance);
    });
  return active.map((a, i) => enrichEntry(a, i + 1));
}

export function mapAccountToDebtInput(
  account: {
    id: string;
    name: string;
    type: FinanceAccountType;
    creditLimit: unknown;
    billingCycleDay: number | null;
    paymentDueDay: number | null;
    aprPercent: unknown;
    minimumPayment: unknown;
    originalPrincipal: unknown;
  },
  balance: number,
  cycleSpend?: number
): DebtAccountInput {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    balance,
    aprPercent: account.aprPercent != null ? toMoney(account.aprPercent) : null,
    minimumPayment: account.minimumPayment != null ? toMoney(account.minimumPayment) : null,
    creditLimit: account.creditLimit != null ? toMoney(account.creditLimit) : null,
    billingCycleDay: account.billingCycleDay,
    paymentDueDay: account.paymentDueDay,
    originalPrincipal:
      account.originalPrincipal != null ? toMoney(account.originalPrincipal) : null,
    cycleSpend,
  };
}
