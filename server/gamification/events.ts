import type { ActivityEventType, PointsEventSource } from "@prisma/client";

import type { ActivityContext } from "./xp-rules";

export function activityEventType(ctx: ActivityContext): ActivityEventType {
  switch (ctx.type) {
    case "task.completed":
      return "TASK_COMPLETED";
    case "habit.completed":
      return "HABIT_COMPLETED";
    case "study.session.completed":
      return "STUDY_SESSION_COMPLETED";
    case "goal.completed":
      return "GOAL_COMPLETED";
    case "week.perfect":
      return "WEEK_PERFECT";
    case "streak.updated":
      return "STREAK_UPDATED";
    case "level.up":
      return "LEVEL_UP";
    case "attribute.increased":
      return "ATTRIBUTE_INCREASED";
    case "achievement.unlocked":
      return "ACHIEVEMENT_UNLOCKED";
    case "mission.completed":
      return "MISSION_COMPLETED";
    case "client.closed":
      return "CLIENT_CLOSED";
    case "finance.method.step":
      return "FINANCE_METHOD_STEP";
    case "finance.review.completed":
      return "FINANCE_REVIEW_COMPLETED";
    case "finance.review.streak":
      return "FINANCE_REVIEW_STREAK";
    case "finance.goal.reached":
      return "FINANCE_GOAL_REACHED";
    case "finance.budget.respected":
      return "FINANCE_BUDGET_RESPECTED";
    case "finance.method.completed":
      return "FINANCE_METHOD_COMPLETED";
    case "prestige.reset":
      return "PRESTIGE_RESET";
    default:
      return "TASK_COMPLETED";
  }
}

export function sourceLabel(source?: PointsEventSource | null) {
  switch (source) {
    case "TASK":
      return "tarefa";
    case "HABIT":
      return "hábito";
    case "GOAL":
      return "objectivo";
    case "STUDY":
      return "estudo";
    case "CLIENT":
      return "cliente";
    default:
      return "progresso";
  }
}
