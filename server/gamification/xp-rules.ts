import type { PointsEventSource } from "@prisma/client";

import type { AttributeKey } from "./attributes";

export type GameEventType =
  | "task.completed"
  | "habit.completed"
  | "study.session.completed"
  | "goal.completed"
  | "week.perfect"
  | "streak.updated"
  | "level.up"
  | "attribute.increased"
  | "achievement.unlocked"
  | "mission.completed"
  | "prestige.reset";

export type ActivityContext = {
  type: GameEventType;
  eventId?: string;
  userId?: string;
  workspaceId?: string;
  source?: PointsEventSource;
  rowId?: string;
  points?: number;
  template?: string;
  priority?: string;
  frequency?: string;
  studyMinutesDelta?: number;
  allHabitsCompletedToday?: boolean;
  metadata?: Record<string, unknown>;
};

export function baseXpForActivity(ctx: ActivityContext): number {
  switch (ctx.type) {
    case "task.completed":
      if (ctx.priority === "Alta") return 25;
      if (ctx.priority === "Média") return 18;
      return 10;
    case "habit.completed":
      if (ctx.frequency?.toLowerCase().startsWith("sem")) return 12;
      return 5;
    case "study.session.completed":
      return Math.max(20, Math.round((ctx.studyMinutesDelta ?? 30) / 3));
    case "goal.completed":
      return 60;
    case "week.perfect":
      return 100;
    default:
      return Math.max(0, ctx.points ?? 0);
  }
}

export function attributeDeltasForActivity(
  ctx: ActivityContext
): Partial<Record<AttributeKey, number>> {
  const xp = baseXpForActivity(ctx);
  if (xp <= 0) return {};

  switch (ctx.type) {
    case "task.completed":
      return {
        execution: xp * 0.45,
        focus: xp * 0.2,
        strategy: xp * 0.15,
        consistency: xp * 0.1,
      };
    case "habit.completed":
      return {
        discipline: xp * 0.45,
        consistency: xp * 0.35,
        energy: xp * 0.2,
      };
    case "study.session.completed":
      return {
        knowledge: xp * 0.4,
        focus: xp * 0.25,
        discipline: xp * 0.15,
        creativity: xp * 0.2,
      };
    case "goal.completed":
      return {
        strategy: xp * 0.35,
        execution: xp * 0.35,
        focus: xp * 0.15,
        consistency: xp * 0.15,
      };
    case "week.perfect":
      return {
        discipline: 18,
        consistency: 24,
        energy: 12,
      };
    default:
      return {};
  }
}
