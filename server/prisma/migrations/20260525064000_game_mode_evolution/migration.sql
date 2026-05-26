-- Game Mode evolution: append-only events, phases, prestige, richer profile

CREATE TYPE "AchievementCategory" AS ENUM (
  'STREAK',
  'TASKS',
  'STUDY',
  'GOALS',
  'CONSISTENCY',
  'DEEP_WORK',
  'LEVEL',
  'PRESTIGE'
);

CREATE TYPE "GamePhase" AS ENUM (
  'AWAKENING',
  'MOMENTUM',
  'EXECUTION',
  'MASTERY',
  'EVOLUTION',
  'TRANSCENDENCE',
  'GOD_MODE'
);

CREATE TYPE "ActivityEventType" AS ENUM (
  'TASK_COMPLETED',
  'HABIT_COMPLETED',
  'STUDY_SESSION_COMPLETED',
  'GOAL_COMPLETED',
  'WEEK_PERFECT',
  'STREAK_UPDATED',
  'LEVEL_UP',
  'ATTRIBUTE_INCREASED',
  'ACHIEVEMENT_UNLOCKED',
  'MISSION_COMPLETED',
  'PRESTIGE_RESET'
);

ALTER TABLE "UserGameProfile"
  ADD COLUMN "lifetimeXp" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "rankTitle" TEXT NOT NULL DEFAULT 'Wanderer',
  ADD COLUMN "phase" "GamePhase" NOT NULL DEFAULT 'AWAKENING',
  ADD COLUMN "prestigeLevel" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "ascensionCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "activeDays" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "deepWorkDays" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "perfectWeeks" INTEGER NOT NULL DEFAULT 0;

UPDATE "UserGameProfile"
SET "lifetimeXp" = "totalXp";

ALTER TABLE "AchievementDefinition"
  ADD COLUMN "category" "AchievementCategory" NOT NULL DEFAULT 'CONSISTENCY';

ALTER TABLE "UserAttribute"
  ADD COLUMN "lastDelta" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "ActivityEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "rowId" TEXT,
  "type" "ActivityEventType" NOT NULL,
  "source" "PointsEventSource",
  "eventDate" DATE NOT NULL,
  "xpDelta" INTEGER NOT NULL DEFAULT 0,
  "payload" JSONB NOT NULL DEFAULT '{}',
  "dedupeKey" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PrestigeReset" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "prestigeLevel" INTEGER NOT NULL,
  "previousLevel" INTEGER NOT NULL,
  "previousXp" INTEGER NOT NULL,
  "lifetimeXp" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PrestigeReset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ActivityEvent_dedupeKey_key" ON "ActivityEvent"("dedupeKey");
CREATE INDEX "ActivityEvent_userId_eventDate_idx" ON "ActivityEvent"("userId", "eventDate");
CREATE INDEX "ActivityEvent_workspaceId_eventDate_idx" ON "ActivityEvent"("workspaceId", "eventDate");
CREATE INDEX "ActivityEvent_type_createdAt_idx" ON "ActivityEvent"("type", "createdAt");
CREATE INDEX "PrestigeReset_userId_createdAt_idx" ON "PrestigeReset"("userId", "createdAt");

ALTER TABLE "ActivityEvent"
  ADD CONSTRAINT "ActivityEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityEvent"
  ADD CONSTRAINT "ActivityEvent_rowId_fkey"
  FOREIGN KEY ("rowId") REFERENCES "DatabaseRow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PrestigeReset"
  ADD CONSTRAINT "PrestigeReset_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
