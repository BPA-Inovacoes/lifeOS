-- LifeOS Finance F1.0: contas, movimentos, métodos, revisão semanal

CREATE TYPE "FinanceAccountType" AS ENUM ('CHECKING', 'SAVINGS', 'CASH', 'CREDIT_CARD', 'INVESTMENT', 'LOAN', 'OTHER');
CREATE TYPE "FinanceMovementType" AS ENUM ('EXPENSE', 'INCOME', 'TRANSFER', 'ADJUSTMENT');
CREATE TYPE "FinanceCategoryKind" AS ENUM ('EXPENSE', 'INCOME');

CREATE TABLE "FinancialProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "activeMethodId" TEXT,
    "methodStepIndex" INTEGER NOT NULL DEFAULT 0,
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "defaultExpenseAccountId" TEXT,
    "defaultIncomeAccountId" TEXT,
    "defaultSavingsAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinanceAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FinanceAccountType" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "icon" TEXT,
    "color" TEXT,
    "initialBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "initialBalanceDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "institution" TEXT,
    "maskedIdentifier" TEXT,
    "includeInNetWorth" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinanceCategory" (
    "id" TEXT NOT NULL,
    "kind" "FinanceCategoryKind" NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FinanceCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinanceMovement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "FinanceMovementType" NOT NULL,
    "accountId" TEXT NOT NULL,
    "transferDestAccountId" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "date" DATE NOT NULL,
    "categoryId" TEXT,
    "note" TEXT,
    "linkedClientRowId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceMovement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinanceWeeklyReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "accountSnapshots" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceWeeklyReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserMethodProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserMethodProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FinancialProfile_userId_key" ON "FinancialProfile"("userId");
CREATE INDEX "FinanceAccount_userId_idx" ON "FinanceAccount"("userId");
CREATE INDEX "FinanceCategory_kind_idx" ON "FinanceCategory"("kind");
CREATE INDEX "FinanceMovement_userId_date_idx" ON "FinanceMovement"("userId", "date");
CREATE INDEX "FinanceMovement_accountId_idx" ON "FinanceMovement"("accountId");
CREATE UNIQUE INDEX "FinanceWeeklyReview_userId_weekStart_key" ON "FinanceWeeklyReview"("userId", "weekStart");
CREATE INDEX "FinanceWeeklyReview_userId_idx" ON "FinanceWeeklyReview"("userId");
CREATE UNIQUE INDEX "UserMethodProgress_userId_methodId_key" ON "UserMethodProgress"("userId", "methodId");
CREATE INDEX "UserMethodProgress_userId_idx" ON "UserMethodProgress"("userId");

ALTER TABLE "FinancialProfile" ADD CONSTRAINT "FinancialProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinanceAccount" ADD CONSTRAINT "FinanceAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinanceMovement" ADD CONSTRAINT "FinanceMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinanceMovement" ADD CONSTRAINT "FinanceMovement_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinanceAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinanceMovement" ADD CONSTRAINT "FinanceMovement_transferDestAccountId_fkey" FOREIGN KEY ("transferDestAccountId") REFERENCES "FinanceAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FinanceMovement" ADD CONSTRAINT "FinanceMovement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinanceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FinanceWeeklyReview" ADD CONSTRAINT "FinanceWeeklyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserMethodProgress" ADD CONSTRAINT "UserMethodProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
