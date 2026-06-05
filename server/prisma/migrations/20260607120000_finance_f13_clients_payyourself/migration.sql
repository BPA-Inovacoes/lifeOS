-- F1.3: regra paga-te a ti primeiro + missão método completo
ALTER TABLE "FinancialProfile" ADD COLUMN "payYourselfPercent" DECIMAL(5,2);

ALTER TYPE "ActivityEventType" ADD VALUE 'FINANCE_METHOD_COMPLETED';
