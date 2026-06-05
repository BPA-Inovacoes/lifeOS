-- LifeOS RPG Phase C: Clientes, LifeCoins, eventos CLIENT

ALTER TYPE "DatabaseTemplate" ADD VALUE 'CLIENTS';
ALTER TYPE "PointsEventSource" ADD VALUE 'CLIENT';
ALTER TYPE "ActivityEventType" ADD VALUE 'CLIENT_CLOSED';

ALTER TABLE "UserGameProfile"
  ADD COLUMN "lifeCoins" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lifetimeCoins" INTEGER NOT NULL DEFAULT 0;
