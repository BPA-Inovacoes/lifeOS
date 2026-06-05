import { apiJson } from "@/services/http";

export type GameProfile = {
  gameModeEnabled: boolean;
  lifeCoins: number;
  lifetimeCoins: number;
  totalXp: number;
  progressXp: number;
  level: number;
  rank: string;
  rankLabel: string;
  rankTitle: string;
  playerClass: string;
  playerClassLabel: string;
  phase: string;
  phaseKey: string;
  phaseTheme: string;
  prestige: number;
  prestigeLabel: string;
  canPrestige: boolean;
  ascensionCount: number;
  xpInLevel: number;
  xpNeeded: number;
  xpToNextLevel: number;
  levelPercent: number;
  avatarIcon: string;
  displayTitle: string | null;
  currentStreak: number;
  tasksCompleted: number;
  habitsCompleted: number;
  studyHours: number;
  goalsCompleted: number;
  activeDays: number;
  deepWorkDays: number;
  perfectWeeks: number;
  consistencyRate: number;
  evolution: {
    completedLevels: number;
    totalLevels: number;
    percent: number;
  };
};

export type GameAttribute = {
  key: string;
  label: string;
  value: number;
  percent: number;
  tier: string;
  delta: number;
};

export type GameAchievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  category: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type GameMission = {
  key: string;
  title: string;
  description: string;
  icon: string;
  period?: "DAILY" | "WEEKLY" | "MONTHLY";
  target: number;
  progress: number;
  completed: boolean;
  xpReward: number;
};

export type GameChallenge = {
  id: string;
  type: "dungeon" | "boss";
  title: string;
  workspaceId: string;
  databaseId: string;
  rowId: string;
  status: string;
  progress: number;
  xpReward: number;
  completed: boolean;
};

export type GameActivityItem = {
  id: string;
  type: string;
  message: string;
  xpDelta: number;
  createdAt: string;
};

export type GameHeatmapCell = {
  date: string;
  points: number;
  level: number;
};

export type PrestigeHistoryItem = {
  id: string;
  prestigeLevel: number;
  createdAt: string;
};

export type GameDashboard = {
  profile: GameProfile;
  attributes: GameAttribute[];
  achievements: GameAchievement[];
  missions: GameMission[];
  missionsDaily: GameMission[];
  missionsWeekly: GameMission[];
  missionsMonthly: GameMission[];
  challenges: GameChallenge[];
  activityFeed: GameActivityItem[];
  weeklyXp: {
    date: string;
    label: string;
    taskPoints: number;
    habitPoints: number;
    total: number;
    isToday: boolean;
  }[];
  xpDistribution: {
    tasks: number;
    habits: number;
    goals: number;
    studies: number;
    clients: number;
  };
  heatmap: GameHeatmapCell[];
  prestigeHistory: PrestigeHistoryItem[];
};

export function fetchGameProfile() {
  return apiJson<GameProfile>("/game/profile");
}

export function fetchGameDashboard() {
  return apiJson<GameDashboard>("/game/dashboard");
}

export function toggleGameMode(enabled: boolean) {
  return apiJson<GameProfile>("/game/mode", {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
}

export function prestigeGameMode() {
  return apiJson<GameProfile>("/game/prestige", {
    method: "POST",
  });
}

export function rebuildGameMode() {
  return apiJson<GameDashboard>("/game/rebuild", {
    method: "POST",
  });
}

export type GameShopItem = {
  id: string;
  type: "TITLE" | "AVATAR";
  label: string;
  description: string;
  icon: string;
  price: number;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  payload: string;
  minLevel: number;
  minPrestige: number;
  locked: boolean;
  lockReason?: string;
  owned: boolean;
  equipped: boolean;
};

export type GameShopResponse = {
  balance: { lifeCoins: number; lifetimeCoins: number };
  equipped: { avatarIcon: string; displayTitle: string | null };
  items: GameShopItem[];
};

export function fetchGameShop() {
  return apiJson<GameShopResponse>("/game/shop");
}

export function purchaseShopItem(itemId: string, equip: boolean) {
  return apiJson<GameShopResponse>("/game/shop/purchase", {
    method: "POST",
    body: JSON.stringify({ itemId, equip }),
  });
}

export function equipShopItem(itemId: string) {
  return apiJson<GameShopResponse>("/game/shop/equip", {
    method: "PATCH",
    body: JSON.stringify({ itemId }),
  });
}
