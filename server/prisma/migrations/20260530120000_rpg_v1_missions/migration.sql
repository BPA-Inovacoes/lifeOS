-- LifeOS RPG v1: mission periods (daily / weekly / monthly)

CREATE TYPE "MissionPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

ALTER TABLE "DailyMissionProgress"
  ADD COLUMN "period" "MissionPeriod" NOT NULL DEFAULT 'DAILY';

DROP INDEX IF EXISTS "DailyMissionProgress_userId_missionKey_date_key";

CREATE UNIQUE INDEX "DailyMissionProgress_userId_missionKey_date_period_key"
  ON "DailyMissionProgress"("userId", "missionKey", "date", "period");

CREATE INDEX "DailyMissionProgress_userId_period_date_idx"
  ON "DailyMissionProgress"("userId", "period", "date");
