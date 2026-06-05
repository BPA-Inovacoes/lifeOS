import type { ActivityContext } from "./xp-rules";

/** LifeCoins — recompensa paralela ao XP (loja futura). */
export function lifeCoinsForActivity(ctx: ActivityContext, xpGained: number): number {
  switch (ctx.type) {
    case "client.closed":
      return 15;
    case "goal.completed":
      return 10;
    case "task.completed":
      if (xpGained >= 100) return 5;
      if (xpGained >= 30) return 3;
      return 2;
    case "habit.completed":
      return 1;
    case "study.session.completed":
      return 2;
    case "week.perfect":
      return 8;
    case "finance.method.step":
      return 2;
    case "finance.review.completed":
      return 3;
    case "finance.review.streak":
      return 8;
    case "finance.goal.reached":
      return 6;
    case "finance.budget.respected":
      return 5;
    case "finance.method.completed":
      return 10;
    default:
      return 0;
  }
}

export function lifeCoinsForMission(xpReward: number): number {
  return Math.max(1, Math.ceil(xpReward / 10));
}
