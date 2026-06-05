-- F1.1: envelopes (budgets), metas por conta, questionário de onboarding

ALTER TABLE "FinancialProfile"
ADD COLUMN IF NOT EXISTS "questionnaireCompletedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "onboardingAnswers" JSONB NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS "FinanceCategoryBudget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "categoryId" TEXT NOT NULL,
    "limitAmount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceCategoryBudget_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FinanceCategoryBudget_userId_month_categoryId_key"
ON "FinanceCategoryBudget"("userId", "month", "categoryId");

CREATE INDEX IF NOT EXISTS "FinanceCategoryBudget_userId_month_idx"
ON "FinanceCategoryBudget"("userId", "month");

ALTER TABLE "FinanceCategoryBudget"
ADD CONSTRAINT "FinanceCategoryBudget_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FinanceCategoryBudget"
ADD CONSTRAINT "FinanceCategoryBudget_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "FinanceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "FinanceAccountGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DECIMAL(14,2) NOT NULL,
    "targetAccountId" TEXT NOT NULL,
    "deadline" DATE,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceAccountGoal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FinanceAccountGoal_userId_idx" ON "FinanceAccountGoal"("userId");
CREATE INDEX IF NOT EXISTS "FinanceAccountGoal_targetAccountId_idx" ON "FinanceAccountGoal"("targetAccountId");

ALTER TABLE "FinanceAccountGoal"
ADD CONSTRAINT "FinanceAccountGoal_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FinanceAccountGoal"
ADD CONSTRAINT "FinanceAccountGoal_targetAccountId_fkey"
FOREIGN KEY ("targetAccountId") REFERENCES "FinanceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
