import { Prisma, type PrismaClient, type UserGameProfile } from "@prisma/client";

import { ACHIEVEMENTS, achievementMetric } from "./achievements";
import {
  ATTRIBUTE_KEYS,
  attributeLabel,
  normalizeAttributeKey,
} from "./attributes";
import { activityEventType } from "./events";
import { levelProgress, rankTitleForLevel } from "./levels";
import { DAILY_MISSIONS, missionIncrement, type DailyMissionKey } from "./missions";
import { phaseForLevel } from "./phases";
import { canPrestige } from "./prestige";
import {
  attributeDeltasForActivity,
  baseXpForActivity,
  type ActivityContext,
} from "./xp-rules";
import { addDays, toDayDate, toDayKey } from "../utils/day";
import { logger } from "../utils/logger";
import { workspaceIdsForUser } from "../utils/user-workspaces";

export type GamificationResult = {
  xpGained: number;
  levelUp: boolean;
  newLevel?: number;
  achievementsUnlocked: { id: string; name: string; xpReward: number }[];
  missionCompleted: { key: string; title: string; xpReward: number }[];
  perfectWeekAwarded: boolean;
};

function activeDayStreak(dayKeys: string[]): number {
  if (dayKeys.length === 0) return 0;

  const today = toDayDate();
  const yesterday = addDays(today, -1);
  const keySet = new Set(dayKeys);
  let cursor: Date | null = null;

  if (keySet.has(toDayKey(today))) cursor = today;
  else if (keySet.has(toDayKey(yesterday))) cursor = yesterday;
  else return 0;

  let streak = 0;
  let check = cursor;
  while (keySet.has(toDayKey(check))) {
    streak += 1;
    check = addDays(check, -1);
  }
  return streak;
}

export class GamificationEngine {
  constructor(private prisma: PrismaClient) {}

  private emptyResult(): GamificationResult {
    return {
      xpGained: 0,
      levelUp: false,
      achievementsUnlocked: [],
      missionCompleted: [],
      perfectWeekAwarded: false,
    };
  }

  async ensureProfile(userId: string) {
    await this.ensureAchievementsCatalog();
    await this.ensureAttributes(userId);

    let profile = await this.prisma.userGameProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.userGameProfile.create({
        data: {
          userId,
          rankTitle: rankTitleForLevel(1),
          phase: phaseForLevel(1).key,
        },
      });
      await this.rebuildProfile(userId);
      profile = await this.prisma.userGameProfile.findUniqueOrThrow({
        where: { userId },
      });
    } else {
      await this.migrateLegacyAttributes(userId);
      await this.syncDerivedProfile(userId, profile);
      profile = await this.prisma.userGameProfile.findUniqueOrThrow({
        where: { userId },
      });
    }

    await this.ensureDailyMissions(userId);
    return profile;
  }

  async ensureAchievementsCatalog() {
    for (const achievement of ACHIEVEMENTS) {
      await this.prisma.achievementDefinition.upsert({
        where: { id: achievement.id },
        create: achievement,
        update: {
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          rarity: achievement.rarity,
          category: achievement.category,
          xpReward: achievement.xpReward,
          criteriaKey: achievement.criteriaKey,
          criteriaValue: achievement.criteriaValue,
          sortOrder: achievement.sortOrder,
        },
      });
    }
  }

  async migrateLegacyAttributes(userId: string) {
    const attrs = await this.prisma.userAttribute.findMany({ where: { userId } });
    for (const attr of attrs) {
      const canonical = normalizeAttributeKey(attr.key);
      if (!canonical || canonical === attr.key) continue;

      const existing = await this.prisma.userAttribute.findFirst({
        where: { userId, key: canonical },
      });

      if (existing) {
        await this.prisma.userAttribute.update({
          where: { id: existing.id },
          data: { value: { increment: attr.value } },
        });
        await this.prisma.userAttribute.delete({ where: { id: attr.id } });
      } else {
        await this.prisma.userAttribute.update({
          where: { id: attr.id },
          data: { key: canonical },
        });
      }
    }
  }

  async ensureAttributes(userId: string) {
    await this.migrateLegacyAttributes(userId);
    for (const key of ATTRIBUTE_KEYS) {
      await this.prisma.userAttribute.upsert({
        where: { userId_key: { userId, key } },
        create: { userId, key, value: 0, lastDelta: 0 },
        update: {},
      });
    }
  }

  async ensureDailyMissions(userId: string) {
    const today = toDayDate();
    const habitCount = await this.countHabits(userId);

    for (const mission of DAILY_MISSIONS) {
      const target =
        mission.key === "habits-all"
          ? Math.max(1, habitCount)
          : mission.defaultTarget;

      await this.prisma.dailyMissionProgress.upsert({
        where: {
          userId_missionKey_date: {
            userId,
            missionKey: mission.key,
            date: today,
          },
        },
        create: {
          userId,
          missionKey: mission.key,
          date: today,
          target,
          xpReward: mission.xpReward,
        },
        update: {
          target,
          xpReward: mission.xpReward,
        },
      });
    }
  }

  private async syncDerivedProfile(userId: string, profile: UserGameProfile) {
    const progress = levelProgress(profile.totalXp);
    const updates: Prisma.UserGameProfileUpdateInput = {};

    if (profile.rankTitle !== progress.rank) updates.rankTitle = progress.rank;
    if (profile.level !== progress.level) updates.level = progress.level;
    if (profile.phase !== progress.phase.key) updates.phase = progress.phase.key;
    if (profile.lifetimeXp < profile.totalXp) updates.lifetimeXp = profile.totalXp;

    if (Object.keys(updates).length > 0) {
      await this.prisma.userGameProfile.update({
        where: { userId },
        data: updates,
      });
    }
  }

  async rebuildProfile(userId: string) {
    logger.info({ userId }, "game.rebuild.start");
    await this.ensureAttributes(userId);
    const [pointsEvents, activityEvents] = await Promise.all([
      this.prisma.pointsEvent.findMany({
        where: { userId },
        orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      }),
      this.prisma.activityEvent.findMany({
        where: { userId },
        orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    let progressXp = 0;
    let lifetimeXp = 0;
    let tasksCompleted = 0;
    let habitsCompleted = 0;
    let goalsCompleted = 0;
    let studyMinutes = 0;
    let deepWorkDays = 0;
    let perfectWeeks = 0;
    const activeDays = new Set<string>();
    const deepWorkDayKeys = new Set<string>();

    await this.prisma.userAttribute.updateMany({
      where: { userId },
      data: { value: 0, lastDelta: 0 },
    });

    for (const event of pointsEvents) {
      const ctx = this.inferContextFromPointsEvent(event);
      const xp = baseXpForActivity(ctx);
      progressXp += xp;
      lifetimeXp += xp;
      activeDays.add(toDayKey(event.date));

      if (event.source === "TASK") tasksCompleted += 1;
      if (event.source === "HABIT") habitsCompleted += 1;
      if (event.source === "GOAL") goalsCompleted += 1;

      const attrDeltas = attributeDeltasForActivity(ctx);
      for (const [key, delta] of Object.entries(attrDeltas)) {
        if (!delta) continue;
        await this.prisma.userAttribute.update({
          where: { userId_key: { userId, key } },
          data: { value: { increment: delta } },
        });
      }
    }

    for (const event of activityEvents) {
      const payload =
        typeof event.payload === "object" && event.payload !== null
          ? (event.payload as Record<string, unknown>)
          : {};
      if (event.type === "STUDY_SESSION_COMPLETED") {
        studyMinutes += Number(payload.studyMinutesDelta ?? 0) || 0;
      }
      if (event.type === "WEEK_PERFECT") {
        perfectWeeks += 1;
      }
      if (
        event.type === "STUDY_SESSION_COMPLETED" &&
        (Number(payload.studyMinutesDelta ?? 0) || 0) >= 45
      ) {
        deepWorkDayKeys.add(toDayKey(event.eventDate));
      }
      if (event.type === "TASK_COMPLETED" && event.xpDelta >= 25) {
        deepWorkDayKeys.add(toDayKey(event.eventDate));
      }
    }

    deepWorkDays = deepWorkDayKeys.size;

    const progress = levelProgress(progressXp);
    const activityDayKeys = [...activeDays].sort();
    const currentStreak = activeDayStreak(activityDayKeys);

    await this.prisma.userGameProfile.update({
      where: { userId },
      data: {
        totalXp: progressXp,
        lifetimeXp,
        level: progress.level,
        rankTitle: progress.rank,
        phase: progress.phase.key,
        tasksCompleted,
        habitsCompleted,
        goalsCompleted,
        studyMinutes,
        activeDays: activeDays.size,
        deepWorkDays,
        perfectWeeks,
        currentStreak,
        lastActiveDate:
          activityDayKeys.length > 0 ? toDayDate(new Date(activityDayKeys.at(-1)!)) : null,
      },
    });
    logger.info(
      {
        userId,
        progressXp,
        lifetimeXp,
        tasksCompleted,
        habitsCompleted,
        goalsCompleted,
        studyMinutes,
        activeDays: activeDays.size,
      },
      "game.rebuild.done"
    );
  }

  private inferContextFromPointsEvent(event: {
    source: "TASK" | "HABIT" | "GOAL" | "STUDY";
    points: number;
  }): ActivityContext {
    switch (event.source) {
      case "TASK":
        return {
          type: "task.completed",
          source: "TASK",
          priority: event.points >= 30 ? "Alta" : event.points >= 20 ? "Média" : "Baixa",
        };
      case "HABIT":
        return {
          type: "habit.completed",
          source: "HABIT",
          frequency: event.points >= 40 ? "Semanal" : "Diário",
        };
      case "GOAL":
        return { type: "goal.completed", source: "GOAL" };
      case "STUDY":
        return {
          type: "study.session.completed",
          source: "STUDY",
          studyMinutesDelta: Math.max(30, event.points * 3),
        };
    }
  }

  async processActivity(userId: string, ctx: ActivityContext): Promise<GamificationResult> {
    await this.ensureProfile(userId);

    const profile = await this.prisma.userGameProfile.findUniqueOrThrow({
      where: { userId },
    });
    const today = toDayDate();
    const xpGained = baseXpForActivity(ctx);
    logger.info(
      {
        userId,
        eventId: ctx.eventId,
        type: ctx.type,
        rowId: ctx.rowId,
        source: ctx.source,
        xpGained,
      },
      "game.activity.start"
    );

    const created = await this.recordActivityEvent(userId, {
      ...ctx,
      userId,
      xpDelta: xpGained,
      eventDate: today,
    });
    if (!created) {
      logger.warn(
        {
          userId,
          eventId: ctx.eventId,
          type: ctx.type,
          rowId: ctx.rowId,
        },
        "game.activity.duplicate"
      );
      return this.emptyResult();
    }

    const isNewActiveDay =
      !profile.lastActiveDate || toDayKey(profile.lastActiveDate) !== toDayKey(today);
    const yesterdayKey = toDayKey(addDays(today, -1));
    const currentStreak =
      !profile.lastActiveDate
        ? 1
        : toDayKey(profile.lastActiveDate) === toDayKey(today)
          ? profile.currentStreak
          : toDayKey(profile.lastActiveDate) === yesterdayKey
            ? profile.currentStreak + 1
            : 1;

    const nextProgressXp = profile.totalXp + xpGained;
    const nextProgress = levelProgress(nextProgressXp);
    const previousLevel = profile.level;
    const incrementTasks = ctx.type === "task.completed" ? 1 : 0;
    const incrementHabits = ctx.type === "habit.completed" ? 1 : 0;
    const incrementGoals = ctx.type === "goal.completed" ? 1 : 0;
    const studyMinutesDelta =
      ctx.type === "study.session.completed" ? ctx.studyMinutesDelta ?? 0 : 0;
    const deepWorkGain =
      ctx.type === "study.session.completed" && studyMinutesDelta >= 45
        ? 1
        : ctx.type === "task.completed" && xpGained >= 25
          ? 1
          : 0;

    await this.prisma.userGameProfile.update({
      where: { userId },
      data: {
        totalXp: nextProgressXp,
        lifetimeXp: profile.lifetimeXp + xpGained,
        level: nextProgress.level,
        rankTitle: nextProgress.rank,
        phase: nextProgress.phase.key,
        currentStreak,
        lastActiveDate: today,
        tasksCompleted: { increment: incrementTasks },
        habitsCompleted: { increment: incrementHabits },
        goalsCompleted: { increment: incrementGoals },
        studyMinutes: { increment: studyMinutesDelta },
        activeDays: isNewActiveDay ? { increment: 1 } : undefined,
        deepWorkDays: deepWorkGain > 0 && isNewActiveDay ? { increment: 1 } : undefined,
      },
    });

    await this.applyAttributeDeltas(userId, ctx);
    await this.logActivity(
      userId,
      ctx.type,
      this.defaultFeedMessage(ctx, xpGained),
      xpGained,
      { rowId: ctx.rowId, source: ctx.source }
    );

    const result: GamificationResult = {
      xpGained,
      levelUp: nextProgress.level > previousLevel,
      newLevel: nextProgress.level > previousLevel ? nextProgress.level : undefined,
      achievementsUnlocked: [],
      missionCompleted: [],
      perfectWeekAwarded: false,
    };

    if (result.levelUp) {
      await this.recordDerivedEvent(userId, "level.up", {
        level: nextProgress.level,
      });
      await this.logActivity(
        userId,
        "level.up",
        `Subiste para ${nextProgress.rank} (Lv.${nextProgress.level})`,
        0,
        { level: nextProgress.level }
      );
    }

    result.missionCompleted = await this.updateMissions(userId, ctx, xpGained);
    result.perfectWeekAwarded = await this.maybeAwardPerfectWeek(userId, ctx);
    result.achievementsUnlocked = await this.checkAchievements(userId);

    const bonusXp =
      result.missionCompleted.reduce((sum, item) => sum + item.xpReward, 0) +
      result.achievementsUnlocked.reduce((sum, item) => sum + item.xpReward, 0) +
      (result.perfectWeekAwarded ? baseXpForActivity({ type: "week.perfect" }) : 0);

    if (bonusXp > 0) {
      await this.applyBonusXp(userId, bonusXp);
    }

    logger.info(
      {
        userId,
        eventId: ctx.eventId,
        type: ctx.type,
        xpGained,
        bonusXp,
        levelUp: result.levelUp,
        achievementsUnlocked: result.achievementsUnlocked.length,
        missionsCompleted: result.missionCompleted.length,
        perfectWeekAwarded: result.perfectWeekAwarded,
      },
      "game.activity.done"
    );

    return result;
  }

  private async applyBonusXp(userId: string, bonusXp: number) {
    const profile = await this.prisma.userGameProfile.findUniqueOrThrow({
      where: { userId },
    });
    const nextProgress = levelProgress(profile.totalXp + bonusXp);

    await this.prisma.userGameProfile.update({
      where: { userId },
      data: {
        totalXp: profile.totalXp + bonusXp,
        lifetimeXp: profile.lifetimeXp + bonusXp,
        level: nextProgress.level,
        rankTitle: nextProgress.rank,
        phase: nextProgress.phase.key,
      },
    });
  }

  private defaultFeedMessage(ctx: ActivityContext, xpGained: number) {
    switch (ctx.type) {
      case "task.completed":
        return `Tarefa concluída · +${xpGained} XP`;
      case "habit.completed":
        return `Hábito registado · +${xpGained} XP`;
      case "study.session.completed":
        return `Sessão de estudo concluída · +${xpGained} XP`;
      case "goal.completed":
        return `Objectivo atingido · +${xpGained} XP`;
      default:
        return `Progresso registado · +${xpGained} XP`;
    }
  }

  async applyAttributeDeltas(userId: string, ctx: ActivityContext) {
    const deltas = attributeDeltasForActivity(ctx);
    const summary: string[] = [];

    for (const [key, delta] of Object.entries(deltas)) {
      if (!delta) continue;
      const rounded = Math.round(delta * 10) / 10;
      await this.prisma.userAttribute.update({
        where: { userId_key: { userId, key } },
        data: {
          value: { increment: rounded },
          lastDelta: rounded,
        },
      });
      summary.push(`${attributeLabel(key)} +${Math.round(rounded)}`);
    }

    if (summary.length > 0) {
      await this.recordDerivedEvent(userId, "attribute.increased", { summary });
      await this.logActivity(
        userId,
        "attribute.increased",
        summary.join(" · "),
        0,
        { summary }
      );
    }
  }

  async logActivity(
    userId: string,
    type: string,
    message: string,
    xpDelta: number,
    meta: Record<string, unknown> = {}
  ) {
    await this.prisma.gameActivityLog.create({
      data: {
        userId,
        type,
        message,
        xpDelta,
        meta: meta as Prisma.InputJsonValue,
      },
    });
  }

  private async recordActivityEvent(
    userId: string,
    event: ActivityContext & {
      xpDelta: number;
      eventDate: Date;
    }
  ) {
    try {
      await this.prisma.activityEvent.create({
        data: {
          userId,
          workspaceId: event.workspaceId ?? "",
          rowId: event.rowId ?? null,
          type: activityEventType(event),
          source: event.source ?? null,
          eventDate: event.eventDate,
          xpDelta: event.xpDelta,
          dedupeKey: event.eventId ?? null,
          payload: {
            priority: event.priority,
            frequency: event.frequency,
            studyMinutesDelta: event.studyMinutesDelta,
            ...(event.metadata ?? {}),
          } as Prisma.InputJsonValue,
        },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return false;
      }
      throw error;
    }
  }

  private async recordDerivedEvent(
    userId: string,
    type: Exclude<
      ActivityContext["type"],
      "task.completed" | "habit.completed" | "study.session.completed" | "goal.completed"
    >,
    metadata: Record<string, unknown> = {}
  ) {
    await this.recordActivityEvent(userId, {
      type,
      eventId: this.derivedEventId(userId, type, metadata),
      userId,
      eventDate: toDayDate(),
      xpDelta: 0,
      metadata,
    });
  }

  private derivedEventId(
    userId: string,
    type: Exclude<
      ActivityContext["type"],
      "task.completed" | "habit.completed" | "study.session.completed" | "goal.completed"
    >,
    metadata: Record<string, unknown>
  ) {
    const todayKey = toDayKey(toDayDate());
    switch (type) {
      case "level.up":
        return `level:${userId}:${String(metadata.level ?? "unknown")}`;
      case "achievement.unlocked":
        return `achievement:${userId}:${String(metadata.achievementId ?? "unknown")}`;
      case "mission.completed":
        return `mission:${userId}:${String(metadata.missionKey ?? "unknown")}:${todayKey}`;
      case "week.perfect":
        return `perfect-week:${userId}:${todayKey}`;
      case "attribute.increased":
        return undefined;
      case "prestige.reset":
        return `prestige:${userId}:${String(metadata.prestigeLevel ?? "unknown")}`;
      case "streak.updated":
        return `streak:${userId}:${todayKey}`;
    }
  }

  async checkAchievements(userId: string) {
    const profile = await this.prisma.userGameProfile.findUniqueOrThrow({
      where: { userId },
    });
    const unlocked = await this.prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const unlockedSet = new Set(unlocked.map((item) => item.achievementId));

    const results: { id: string; name: string; xpReward: number }[] = [];
    for (const achievement of ACHIEVEMENTS) {
      if (unlockedSet.has(achievement.id)) continue;
      if (
        achievementMetric(profile, achievement.criteriaKey) <
        achievement.criteriaValue
      ) {
        continue;
      }

      await this.prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });
      await this.recordDerivedEvent(userId, "achievement.unlocked", {
        achievementId: achievement.id,
      });
      await this.logActivity(
        userId,
        "achievement.unlocked",
        `Conquista desbloqueada: ${achievement.name}`,
        achievement.xpReward,
        { achievementId: achievement.id }
      );

      results.push({
        id: achievement.id,
        name: achievement.name,
        xpReward: achievement.xpReward,
      });
    }

    return results;
  }

  async updateMissions(userId: string, ctx: ActivityContext, xpGained: number) {
    await this.ensureDailyMissions(userId);
    const today = toDayDate();
    const missions = await this.prisma.dailyMissionProgress.findMany({
      where: { userId, date: today, completed: false },
    });

    const completed: { key: string; title: string; xpReward: number }[] = [];
    for (const mission of missions) {
      const increment = missionIncrement(mission.missionKey as DailyMissionKey, ctx, xpGained);
      if (increment <= 0) continue;

      const progress = Math.min(mission.target, mission.progress + increment);
      const isComplete = progress >= mission.target;
      await this.prisma.dailyMissionProgress.update({
        where: { id: mission.id },
        data: {
          progress,
          completed: isComplete,
        },
      });

      if (!isComplete) continue;
      const definition = DAILY_MISSIONS.find((item) => item.key === mission.missionKey)!;
      await this.recordDerivedEvent(userId, "mission.completed", {
        missionKey: mission.missionKey,
      });
      await this.logActivity(
        userId,
        "mission.completed",
        `Missão concluída: ${definition.title}`,
        mission.xpReward,
        { missionKey: mission.missionKey }
      );
      completed.push({
        key: mission.missionKey,
        title: definition.title,
        xpReward: mission.xpReward,
      });
    }

    return completed;
  }

  private async maybeAwardPerfectWeek(userId: string, ctx: ActivityContext) {
    if (ctx.type !== "habit.completed" || !ctx.allHabitsCompletedToday) {
      return false;
    }

    const habitCount = await this.countHabits(userId);
    if (habitCount <= 0) return false;

    const today = toDayDate();
    const monday = addDays(today, today.getDay() === 0 ? -6 : 1 - today.getDay());
    const existing = await this.prisma.activityEvent.findFirst({
      where: {
        userId,
        type: "WEEK_PERFECT",
        eventDate: { gte: monday, lte: today },
      },
    });
    if (existing) return false;

    for (let offset = 0; offset < 7; offset++) {
      const day = addDays(today, -offset);
      const doneCount = await this.prisma.pointsEvent.count({
        where: {
          userId,
          source: "HABIT",
          date: day,
        },
      });
      if (doneCount < habitCount) return false;
    }

    await this.recordDerivedEvent(userId, "week.perfect", { habitCount });
    await this.logActivity(
      userId,
      "week.perfect",
      "Semana perfeita desbloqueada",
      100,
      { habitCount }
    );
    await this.prisma.userGameProfile.update({
      where: { userId },
      data: { perfectWeeks: { increment: 1 } },
    });
    return true;
  }

  async countHabits(userId: string) {
    const workspaceIds = await workspaceIdsForUser(this.prisma, userId);
    if (workspaceIds.length === 0) return 0;
    return this.prisma.databaseRow.count({
      where: {
        database: {
          workspaceId: { in: workspaceIds },
          template: "HABITS",
        },
      },
    });
  }

  async setGameMode(userId: string, enabled: boolean) {
    await this.ensureProfile(userId);
    return this.prisma.userGameProfile.update({
      where: { userId },
      data: { gameModeEnabled: enabled },
    });
  }

  async prestige(userId: string) {
    const profile = await this.ensureProfile(userId);
    if (!canPrestige(profile.level)) return null;

    const nextPrestige = profile.prestigeLevel + 1;
    await this.prisma.prestigeReset.create({
      data: {
        userId,
        prestigeLevel: nextPrestige,
        previousLevel: profile.level,
        previousXp: profile.totalXp,
        lifetimeXp: profile.lifetimeXp,
      },
    });

    await this.recordDerivedEvent(userId, "prestige.reset", {
      prestigeLevel: nextPrestige,
    });

    const fresh = await this.prisma.userGameProfile.update({
      where: { userId },
      data: {
        totalXp: 0,
        level: 1,
        rankTitle: rankTitleForLevel(1),
        phase: phaseForLevel(1).key,
        prestigeLevel: nextPrestige,
        ascensionCount: { increment: 1 },
      },
    });

    await this.logActivity(
      userId,
      "prestige.reset",
      `Prestige ${nextPrestige} desbloqueado`,
      0,
      { prestigeLevel: nextPrestige }
    );

    const unlocked = await this.checkAchievements(userId);
    const bonus = unlocked.reduce((sum, item) => sum + item.xpReward, 0);
    if (bonus > 0) {
      await this.applyBonusXp(userId, bonus);
    }

    return fresh;
  }
}
