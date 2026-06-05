-- Moeda padrão: Kwanza angolano (AOA)
ALTER TABLE "FinancialProfile" ALTER COLUMN "currency" SET DEFAULT 'AOA';
ALTER TABLE "FinanceAccount" ALTER COLUMN "currency" SET DEFAULT 'AOA';
