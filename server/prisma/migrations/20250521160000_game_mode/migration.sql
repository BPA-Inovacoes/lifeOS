-- Game Mode: perfil, achievements, atributos, missões, activity log

-- AlterEnum
ALTER TYPE "PointsEventSource" ADD VALUE 'GOAL';
ALTER TYPE "PointsEventSource" ADD VALUE 'STUDY';

-- CreateEnum
CREATE TYPE "AchievementRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateTable
CREATE TABLE "UserGameProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameModeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "avatarIcon" TEXT NOT NULL DEFAULT 'user',
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "habitsCompleted" INTEGER NOT NULL DEFAULT 0,
    "studyMinutes" INTEGER NOT NULL DEFAULT 0,
    "goalsCompleted" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGameProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AchievementDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "rarity" "AchievementRarity" NOT NULL DEFAULT 'COMMON',
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "criteriaKey" TEXT NOT NULL,
    "criteriaValue" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AchievementDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserAttribute" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "UserAttribute_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GameActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "xpDelta" INTEGER NOT NULL DEFAULT 0,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DailyMissionProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionKey" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "xpReward" INTEGER NOT NULL,

    CONSTRAINT "DailyMissionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGameProfile_userId_key" ON "UserGameProfile"("userId");
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");
CREATE INDEX "UserAttribute_userId_idx" ON "UserAttribute"("userId");
CREATE UNIQUE INDEX "UserAttribute_userId_key_key" ON "UserAttribute"("userId", "key");
CREATE INDEX "GameActivityLog_userId_createdAt_idx" ON "GameActivityLog"("userId", "createdAt");
CREATE INDEX "DailyMissionProgress_userId_date_idx" ON "DailyMissionProgress"("userId", "date");
CREATE UNIQUE INDEX "DailyMissionProgress_userId_missionKey_date_key" ON "DailyMissionProgress"("userId", "missionKey", "date");

-- AddForeignKey
ALTER TABLE "UserGameProfile" ADD CONSTRAINT "UserGameProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "AchievementDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAttribute" ADD CONSTRAINT "UserAttribute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameActivityLog" ADD CONSTRAINT "GameActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyMissionProgress" ADD CONSTRAINT "DailyMissionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed achievement definitions
INSERT INTO "AchievementDefinition" ("id", "name", "description", "icon", "rarity", "xpReward", "criteriaKey", "criteriaValue", "sortOrder") VALUES
('streak-7', 'Semana de fogo', '7 dias consecutivos activos', 'flame', 'RARE', 50, 'currentStreak', 7, 1),
('tasks-100', 'Executor', '100 tarefas concluídas', 'check-circle', 'EPIC', 100, 'tasksCompleted', 100, 2),
('study-50h', 'Estudioso', '50 horas de estudo registadas', 'book-open', 'EPIC', 75, 'studyMinutes', 3000, 3),
('week-perfect', 'Semana perfeita', 'Todos os hábitos completos numa semana', 'sparkles', 'LEGENDARY', 100, 'perfectWeek', 1, 4),
('first-goal', 'Primeiro objectivo', 'Primeiro objectivo atingido', 'target', 'COMMON', 25, 'goalsCompleted', 1, 5),
('level-10', 'Builder', 'Alcançar nível 10', 'zap', 'RARE', 50, 'level', 10, 6),
('habits-50', 'Disciplina', '50 hábitos completos', 'repeat', 'RARE', 40, 'habitsCompleted', 50, 7);
