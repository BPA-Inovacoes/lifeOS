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
    case "prestige.reset":
      return "PRESTIGE_RESET";
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
    default:
      return "progresso";
  }
}
