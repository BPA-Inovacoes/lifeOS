import type { GamificationResult } from "./engine";

export type GamificationFeedbackPayload = {
  xpGained: number;
  bonusXp: number;
  lifeCoinsGained: number;
  levelUp: boolean;
  newLevel?: number;
  rankTitle?: string;
  missions: { title: string; xpReward: number }[];
  achievements: { name: string; xpReward: number }[];
};

export function toGamificationFeedback(
  result: GamificationResult
): GamificationFeedbackPayload | null {
  const hasReward =
    result.xpGained > 0 ||
    result.bonusXp > 0 ||
    result.lifeCoinsGained > 0 ||
    result.levelUp ||
    result.missionCompleted.length > 0 ||
    result.achievementsUnlocked.length > 0;

  if (!hasReward) return null;

  return {
    xpGained: result.xpGained,
    bonusXp: result.bonusXp,
    lifeCoinsGained: result.lifeCoinsGained,
    levelUp: result.levelUp,
    newLevel: result.newLevel,
    rankTitle: result.rankTitle,
    missions: result.missionCompleted.map((item) => ({
      title: item.title,
      xpReward: item.xpReward,
    })),
    achievements: result.achievementsUnlocked.map((item) => ({
      name: item.name,
      xpReward: item.xpReward,
    })),
  };
}
