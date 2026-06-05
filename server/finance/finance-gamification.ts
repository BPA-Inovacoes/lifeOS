import type { ActivityContext } from "../gamification/xp-rules";

export const FINANCE_METHOD_STEP_XP = 20;
export const FINANCE_REVIEW_XP = 40;
export const FINANCE_GOAL_REACHED_XP = 60;
export const FINANCE_BUDGET_RESPECTED_XP = 50;
export const FINANCE_REVIEW_STREAK_XP = 80;
export const FINANCE_METHOD_COMPLETED_XP = 120;

export function financeMethodStepContext(
  userId: string,
  methodId: string,
  stepIndex: number
): ActivityContext {
  return {
    type: "finance.method.step",
    eventId: `finance:method-step:${userId}:${methodId}:${stepIndex}`,
    userId,
    points: FINANCE_METHOD_STEP_XP,
    metadata: { methodId, stepIndex },
  };
}

export function financeReviewCompletedContext(
  userId: string,
  weekStartIso: string
): ActivityContext {
  return {
    type: "finance.review.completed",
    eventId: `finance:review:${userId}:${weekStartIso}`,
    userId,
    points: FINANCE_REVIEW_XP,
    metadata: { weekStart: weekStartIso },
  };
}

export function financeReviewStreakContext(userId: string, monthKey: string): ActivityContext {
  return {
    type: "finance.review.streak",
    eventId: `finance:review-streak:${userId}:${monthKey}`,
    userId,
    points: FINANCE_REVIEW_STREAK_XP,
    metadata: { month: monthKey },
  };
}

export function financeGoalReachedContext(userId: string, goalId: string): ActivityContext {
  return {
    type: "finance.goal.reached",
    eventId: `finance:goal:${userId}:${goalId}`,
    userId,
    points: FINANCE_GOAL_REACHED_XP,
    metadata: { goalId },
  };
}

export function financeMethodCompletedContext(
  userId: string,
  methodId: string
): ActivityContext {
  return {
    type: "finance.method.completed",
    eventId: `finance:method-done:${userId}:${methodId}`,
    userId,
    points: FINANCE_METHOD_COMPLETED_XP,
    metadata: { methodId },
  };
}

export function financeBudgetRespectedContext(userId: string, monthKey: string): ActivityContext {
  return {
    type: "finance.budget.respected",
    eventId: `finance:budget:${userId}:${monthKey}`,
    userId,
    points: FINANCE_BUDGET_RESPECTED_XP,
    metadata: { month: monthKey },
  };
}
