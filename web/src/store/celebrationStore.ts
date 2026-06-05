import { create } from "zustand";

export type LevelUpPayload = {
  level: number;
  rankTitle?: string;
};

type CelebrationState = {
  levelUp: LevelUpPayload | null;
  showLevelUp: (payload: LevelUpPayload) => void;
  dismissLevelUp: () => void;
};

export const useCelebrationStore = create<CelebrationState>((set) => ({
  levelUp: null,
  showLevelUp: (payload) => set({ levelUp: payload }),
  dismissLevelUp: () => set({ levelUp: null }),
}));
