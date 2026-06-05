-- Resumos de movimentos (lotes de 25) — padrão fin-roll-{user8}-{seq}

CREATE TABLE "FinanceMovementRollup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "periodFrom" DATE NOT NULL,
    "periodTo" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 25,
    "totals" JSONB NOT NULL,
    "lines" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceMovementRollup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FinanceMovementRollup_userId_sequence_key" ON "FinanceMovementRollup"("userId", "sequence");
CREATE INDEX "FinanceMovementRollup_userId_idx" ON "FinanceMovementRollup"("userId");

ALTER TABLE "FinanceMovementRollup" ADD CONSTRAINT "FinanceMovementRollup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
