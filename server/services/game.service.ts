import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { attributeLabel, attributeTier } from "../gamification/attributes";
import { GamificationEngine } from "../gamification/engine";
import { levelProgress } from "../gamification/levels";
import { DAILY_MISSIONS } from "../gamification/missions";
import { phaseProgress } from "../gamification/phases";
import { canPrestige, prestigeLabel } from "../gamification/prestige";
import { addDays, toDayDate, toDayKey } from "../utils/day";
import type { ActivityService } from "./activity.service";

const toggleSchema = z.object({
  enabled: z.boolean(),
});

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
    const profile = await this.engine.ensureProfile(userId);
    const progress = levelProgress(profile.totalXp);
    const phase = phaseProgress(progress.level);

    return {
      gameModeEnabled: profile.gameModeEnabled,
      totalXp: profile.lifetimeXp,
      progressXp: profile.totalXp,
      level: progress.level,
      rank: progress.rank,
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
    const profile = await this.engine.ensureProfile(userId);
    const progress = levelProgress(profile.totalXp);
    const phase = phaseProgress(progress.level);

    const [attributes, achievements, activity, missions, weeklyXp, prestigeHistory] =
      await Promise.all([
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
        this.getMissionsWithDefs(userId),
        this.activity.getWeeklyXp(userId, 7),
        this.prisma.prestigeReset.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
      ]);

    const maxAttr = Math.max(1, ...attributes.map((item) => item.value));
    const normalizedAttributes = attributes.map((item) => ({
      key: item.key,
      label: attributeLabel(item.key),
      value: Math.round(item.value),
      percent: Math.min(100, Math.round((item.value / maxAttr) * 100)),
      tier: attributeTier(item.value),
      delta: Math.round(item.lastDelta),
    }));

    const xpDistribution = await this.getXpDistribution(userId);
    const heatmap = await this.getActivityHeatmap(userId, 90);

    return {
      profile: {
        gameModeEnabled: profile.gameModeEnabled,
        totalXp: profile.lifetimeXp,
        progressXp: profile.totalXp,
        level: progress.level,
        rank: progress.rank,
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
      },
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
      missions,
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

  private async getMissionsWithDefs(userId: string) {
    const today = toDayDate();
    await this.engine.ensureDailyMissions(userId);
    const rows = await this.prisma.dailyMissionProgress.findMany({
      where: { userId, date: today },
    });

    return DAILY_MISSIONS.map((def) => {
      const row = rows.find((item) => item.missionKey === def.key);
      return {
        key: def.key,
        title: def.title,
        description: def.description,
        icon: def.icon,
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
