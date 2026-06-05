-- F1.2: cartões (ciclo/limite) e empréstimos (TAEG, prestação)
ALTER TABLE "FinanceAccount" ADD COLUMN "creditLimit" DECIMAL(14,2);
ALTER TABLE "FinanceAccount" ADD COLUMN "billingCycleDay" INTEGER;
ALTER TABLE "FinanceAccount" ADD COLUMN "paymentDueDay" INTEGER;
ALTER TABLE "FinanceAccount" ADD COLUMN "aprPercent" DECIMAL(6,3);
ALTER TABLE "FinanceAccount" ADD COLUMN "minimumPayment" DECIMAL(14,2);
ALTER TABLE "FinanceAccount" ADD COLUMN "originalPrincipal" DECIMAL(14,2);
