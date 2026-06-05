import type { AttributeKey } from "./attributes";
import { attributeDeltasForGoal } from "./goal-areas";
import { attributeDeltasForHabit } from "./habit-areas";

export type GameEventType =
  | "task.completed"
  | "habit.completed"
  | "study.session.completed"
  | "goal.completed"
  | "client.closed"
  | "finance.method.step"
  | "finance.review.completed"
  | "finance.review.streak"
  | "finance.goal.reached"
  | "finance.budget.respected"
  | "finance.method.completed"
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
  source?: import("@prisma/client").PointsEventSource;
  rowId?: string;
  points?: number;
  template?: string;
  priority?: string;
  frequency?: string;
  habitArea?: string;
  goalArea?: string;
  studyMinutesDelta?: number;
  allHabitsCompletedToday?: boolean;
  metadata?: Record<string, unknown>;
};

export function baseXpForActivity(ctx: ActivityContext): number {
  switch (ctx.type) {
    case "task.completed":
      if (ctx.priority === "Alta") return 100;
      if (ctx.priority === "Média") return 30;
      return 10;
    case "habit.completed":
      if (ctx.frequency?.toLowerCase().startsWith("sem")) return 12;
      return 5;
    case "study.session.completed":
      return Math.max(20, Math.round((ctx.studyMinutesDelta ?? 30) / 3));
    case "goal.completed":
      return Math.max(60, ctx.points ?? 60);
    case "client.closed":
      return Math.max(300, ctx.points ?? 300);
    case "finance.method.step":
      return ctx.points ?? 20;
    case "finance.review.completed":
      return ctx.points ?? 40;
    case "finance.review.streak":
      return ctx.points ?? 80;
    case "finance.goal.reached":
      return ctx.points ?? 60;
    case "finance.budget.respected":
      return ctx.points ?? 50;
    case "finance.method.completed":
      return ctx.points ?? 120;
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
        leadership: xp * 0.35,
        discipline: xp * 0.35,
        knowledge: xp * 0.15,
        finance: xp * 0.15,
      };
    case "habit.completed":
      return attributeDeltasForHabit(xp, ctx.habitArea ?? "Geral");
    case "study.session.completed":
      return {
        knowledge: xp * 0.55,
        discipline: xp * 0.25,
        leadership: xp * 0.2,
      };
    case "goal.completed":
      return attributeDeltasForGoal(xp, ctx.goalArea ?? "");
    case "client.closed":
      return {
        finance: xp * 0.65,
        leadership: xp * 0.35,
      };
    case "finance.method.step":
    case "finance.review.completed":
    case "finance.review.streak":
    case "finance.goal.reached":
    case "finance.budget.respected":
    case "finance.method.completed":
      return {
        finance: xp * 0.75,
        discipline: xp * 0.25,
      };
    case "week.perfect":
      return {
        discipline: 18,
        health: 8,
        relationships: 6,
      };
    default:
      return {};
  }
}
