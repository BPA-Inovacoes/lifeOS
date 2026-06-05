import type { MissionPeriod, PrismaClient } from "@prisma/client";
import { z } from "zod";

import { fetchGameChallenges } from "../gamification/challenges";
import { resolvePlayerClass } from "../gamification/classes";
import { attributeLabel, attributeTier, ATTRIBUTE_KEYS } from "../gamification/attributes";
import { GamificationEngine } from "../gamification/engine";
import { levelProgress } from "../gamification/levels";
import { missionsForPeriod } from "../gamification/missions";
import { phaseProgress } from "../gamification/phases";
import { canPrestige, prestigeLabel } from "../gamification/prestige";
import { addDays, startOfMonth, startOfWeek, toDayDate, toDayKey } from "../utils/day";
import type { ActivityService } from "./activity.service";

const toggleSchema = z.object({
  enabled: z.boolean(),
});

function profilePayload(
  profile: Awaited<ReturnType<GamificationEngine["ensureProfile"]>>,
  attributes: { key: string; value: number }[]
) {
  const progress = levelProgress(profile.totalXp);
  const phase = phaseProgress(progress.level);
  const attrMap = Object.fromEntries(
    attributes.map((item) => [item.key, Math.round(item.value)])
  ) as Partial<Record<(typeof ATTRIBUTE_KEYS)[number], number>>;
  const playerClass = resolvePlayerClass(attrMap);

  return {
    lifeCoins: profile.lifeCoins,
    lifetimeCoins: profile.lifetimeCoins,
    gameModeEnabled: profile.gameModeEnabled,
    totalXp: profile.lifetimeXp,
    progressXp: profile.totalXp,
    level: progress.level,
    rank: progress.rank,
    rankLabel: progress.rankLabel,
    rankTitle: progress.rankTitle,
    playerClass: playerClass.key,
    playerClassLabel: playerClass.label,
    phase: phase.phase.label,
    phaseKey: phase.phase.key,
    phaseTheme: phase.phase.theme,
    prestige: profile.prestigeLevel,
    prestigeLabel: prestigeLabel(profile.prestigeLevel),
    canPrestige: canPrestige(progress.level),
    ascensionCount: profile.ascensionCount,
    xpInLevel: progress.xpInLevel,
    xpNeeded: progress.xpNeeded,
    xpToNextLevel: progress.xpToNextLevel,
    levelPercent: progress.percent,
    avatarIcon: profile.avatarIcon,
    displayTitle: profile.displayTitle,
    currentStreak: profile.currentStreak,
    tasksCompleted: profile.tasksCompleted,
    habitsCompleted: profile.habitsCompleted,
    studyHours: Math.round((profile.studyMinutes / 60) * 10) / 10,
    goalsCompleted: profile.goalsCompleted,
    activeDays: profile.activeDays,
    deepWorkDays: profile.deepWorkDays,
    perfectWeeks: profile.perfectWeeks,
    consistencyRate: Math.min(100, Math.round((profile.activeDays / 30) * 100)),
    evolution: {
      completedLevels: phase.completedLevels,
      totalLevels: phase.totalLevels,
      percent: phase.percent,
    },
  };
}

export class GameService {
  constructor(
    private prisma: PrismaClient,
    private activity: ActivityService,
    private engine: GamificationEngine
  ) {}

  parseToggle(raw: unknown) {
    return toggleSchema.parse(raw);
  }

  getEngine() {
    return this.engine;
  }

  async getProfile(userId: string) {
    const profile = await this.engine.loadProfile(userId);
    const attributes = await this.prisma.userAttribute.findMany({
      where: { userId },
    });
    return profilePayload(profile, attributes);
  }

  async toggleMode(userId: string, enabled: boolean) {
    await this.engine.setGameMode(userId, enabled);
    return this.getProfile(userId);
  }

  async prestige(userId: string) {
    const result = await this.engine.prestige(userId);
    if (!result) return null;
    return this.getProfile(userId);
  }

  async getDashboard(userId: string) {
    const profile = await this.engine.loadProfile(userId);

    const [
      attributes,
      achievements,
      activity,
      missions,
      weeklyXp,
      prestigeHistory,
      challenges,
      xpDistribution,
      heatmap,
    ] = await Promise.all([
      this.prisma.userAttribute.findMany({
        where: { userId },
        orderBy: { value: "desc" },
      }),
      this.prisma.achievementDefinition.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          userAchievements: {
            where: { userId },
            take: 1,
          },
        },
      }),
      this.prisma.gameActivityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      this.getAllMissions(userId),
      this.activity.getWeeklyXp(userId, 7),
      this.prisma.prestigeReset.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      fetchGameChallenges(this.prisma, userId),
      this.getXpDistribution(userId),
      this.getActivityHeatmap(userId, 365),
    ]);

    const maxAttr = Math.max(1, ...attributes.map((item) => item.value));
    const normalizedAttributes = attributes
      .filter((item) => ATTRIBUTE_KEYS.includes(item.key as (typeof ATTRIBUTE_KEYS)[number]))
      .map((item) => ({
        key: item.key,
        label: attributeLabel(item.key),
        value: Math.round(item.value),
        percent: Math.min(100, Math.round((item.value / maxAttr) * 100)),
        tier: attributeTier(item.value),
        delta: Math.round(item.lastDelta),
      }));

    return {
      profile: profilePayload(profile, attributes),
      attributes: normalizedAttributes,
      achievements: achievements.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        icon: item.icon,
        rarity: item.rarity,
        category: item.category,
        xpReward: item.xpReward,
        unlocked: item.userAchievements.length > 0,
        unlockedAt: item.userAchievements[0]?.unlockedAt?.toISOString() ?? null,
      })),
      missions: missions.daily,
      missionsDaily: missions.daily,
      missionsWeekly: missions.weekly,
      missionsMonthly: missions.monthly,
      challenges,
      activityFeed: activity.map((item) => ({
        id: item.id,
        type: item.type,
        message: item.message,
        xpDelta: item.xpDelta,
        createdAt: item.createdAt.toISOString(),
      })),
      weeklyXp,
      xpDistribution,
      heatmap,
      prestigeHistory: prestigeHistory.map((item) => ({
        id: item.id,
        prestigeLevel: item.prestigeLevel,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }

  private async getAllMissions(userId: string) {
    await this.engine.ensureMissions(userId);

    const [daily, weekly, monthly] = await Promise.all([
      this.loadMissions(userId, "DAILY", toDayDate()),
      this.loadMissions(userId, "WEEKLY", startOfWeek()),
      this.loadMissions(userId, "MONTHLY", startOfMonth()),
    ]);

    return { daily, weekly, monthly };
  }

  private async loadMissions(userId: string, period: MissionPeriod, date: Date) {
    const rows = await this.prisma.dailyMissionProgress.findMany({
      where: { userId, period, date },
    });

    return missionsForPeriod(period).map((def) => {
      const row = rows.find((item) => item.missionKey === def.key);
      return {
        key: def.key,
        title: def.title,
        description: def.description,
        icon: def.icon,
        period: def.period,
        target: row?.target ?? def.defaultTarget,
        progress: row?.progress ?? 0,
        completed: row?.completed ?? false,
        xpReward: def.xpReward,
      };
    });
  }

  private async getXpDistribution(userId: string) {
    const grouped = await this.prisma.pointsEvent.groupBy({
      by: ["source"],
      where: { userId },
      _sum: { points: true },
    });

    const map = new Map(grouped.map((entry) => [entry.source, entry._sum.points ?? 0]));
    return {
      tasks: map.get("TASK") ?? 0,
      habits: map.get("HABIT") ?? 0,
      goals: map.get("GOAL") ?? 0,
      studies: map.get("STUDY") ?? 0,
      clients: map.get("CLIENT") ?? 0,
    };
  }

  private async getActivityHeatmap(userId: string, days: number) {
    const today = toDayDate();
    const start = addDays(today, -(days - 1));

    const events = await this.prisma.activityEvent.findMany({
      where: { userId, eventDate: { gte: start, lte: today } },
      select: { eventDate: true, xpDelta: true },
    });

    const byDay = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      byDay.set(toDayKey(addDays(start, i)), 0);
    }
    for (const event of events) {
      const key = toDayKey(event.eventDate);
      byDay.set(key, (byDay.get(key) ?? 0) + event.xpDelta);
    }

    const max = Math.max(1, ...byDay.values());
    return [...byDay.entries()].map(([date, points]) => ({
      date,
      points,
      level: points === 0 ? 0 : Math.min(4, Math.ceil((points / max) * 4)),
    }));
  }
}
