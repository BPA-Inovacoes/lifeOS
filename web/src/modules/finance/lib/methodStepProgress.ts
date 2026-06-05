import type {
  FinanceAccount,
  FinanceMovement,
} from "@/services/financeApi";

export function isMethodStepSatisfied(
  methodId: string,
  stepIndex: number,
  ctx: {
    accounts: FinanceAccount[];
    movements: FinanceMovement[];
  }
): boolean {
  const { accounts, movements } = ctx;
  const activeAccounts = accounts.filter((a) => !a.isArchived);

  switch (methodId) {
    case "first-30-days":
      if (stepIndex === 0) return activeAccounts.some((a) => a.type === "CHECKING");
      if (stepIndex === 1) return activeAccounts.some((a) => a.type === "SAVINGS");
      if (stepIndex === 2) return activeAccounts.length >= 2;
      if (stepIndex === 3) return movements.some((m) => m.type === "INCOME");
      if (stepIndex === 4) return movements.some((m) => m.type === "EXPENSE");
      if (stepIndex === 5) return movements.filter((m) => m.type === "EXPENSE").length >= 3;
      if (stepIndex === 7) return movements.some((m) => m.type === "TRANSFER");
      return false;
    case "pay-yourself-first":
      if (stepIndex === 3) return movements.some((m) => m.type === "TRANSFER");
      return false;
    case "emergency-fund":
      if (stepIndex === 2) return movements.some((m) => m.type === "TRANSFER");
      return false;
    case "debt-snowball":
    case "debt-avalanche":
      if (stepIndex === 0) return activeAccounts.some((a) => a.isLiability);
      return false;
    case "intro-investing":
      if (stepIndex === 5) return activeAccounts.some((a) => a.type === "INVESTMENT");
      return false;
    default:
      return false;
  }
}
