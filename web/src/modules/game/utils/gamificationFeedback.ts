import type { QueryClient } from "@tanstack/react-query";

import type { GamificationFeedback } from "@/services/databaseApi";
import { useCelebrationStore } from "@/store/celebrationStore";
import { toast } from "@/store/toastStore";

export function showGamificationToast(feedback: GamificationFeedback) {
  const xp = feedback.xpGained + feedback.bonusXp;
  const parts: string[] = [];

  if (xp > 0) parts.push(`+${xp} XP`);
  if (feedback.lifeCoinsGained > 0) parts.push(`+${feedback.lifeCoinsGained} LC`);

  if (feedback.levelUp && feedback.newLevel) {
    useCelebrationStore.getState().showLevelUp({
      level: feedback.newLevel,
      rankTitle: feedback.rankTitle,
    });
  }

  if (parts.length > 0) {
    toast.rpg(parts.join(" · "));
  }

  for (const mission of feedback.missions) {
    toast.rpg(`Missão: ${mission.title} (+${mission.xpReward} XP)`);
  }

  for (const achievement of feedback.achievements) {
    toast.rpg(`Conquista: ${achievement.name} (+${achievement.xpReward} XP)`);
  }
}

export function applyRowGamificationFeedback(
  qc: QueryClient,
  feedback: GamificationFeedback | null | undefined
) {
  if (!feedback) return;

  showGamificationToast(feedback);

  void qc.invalidateQueries({
    queryKey: ["game", "dashboard"],
    refetchType: "none",
  });
  void qc.invalidateQueries({
    queryKey: ["game", "profile"],
    refetchType: "none",
  });
}
