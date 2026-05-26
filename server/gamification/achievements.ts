import type {
  AchievementCategory,
  AchievementDefinition as PrismaAchievementDefinition,
  UserGameProfile,
} from "@prisma/client";

export type AchievementSeed = {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: PrismaAchievementDefinition["rarity"];
  category: AchievementCategory;
  xpReward: number;
  criteriaKey: string;
  criteriaValue: number;
  sortOrder: number;
};

export const ACHIEVEMENTS: AchievementSeed[] = [
  {
    id: "streak-7",
    name: "Semana de fogo",
    description: "7 dias consecutivos activos.",
    icon: "flame",
    rarity: "RARE",
    category: "STREAK",
    xpReward: 50,
    criteriaKey: "currentStreak",
    criteriaValue: 7,
    sortOrder: 1,
  },
  {
    id: "tasks-100",
    name: "Executor",
    description: "100 tarefas concluídas.",
    icon: "check-circle",
    rarity: "EPIC",
    category: "TASKS",
    xpReward: 100,
    criteriaKey: "tasksCompleted",
    criteriaValue: 100,
    sortOrder: 2,
  },
  {
    id: "study-50h",
    name: "Estudioso",
    description: "50 horas de estudo registadas.",
    icon: "book-open",
    rarity: "EPIC",
    category: "STUDY",
    xpReward: 75,
    criteriaKey: "studyMinutes",
    criteriaValue: 3_000,
    sortOrder: 3,
  },
  {
    id: "week-perfect",
    name: "Semana perfeita",
    description: "Completar uma semana perfeita de hábitos.",
    icon: "sparkles",
    rarity: "LEGENDARY",
    category: "CONSISTENCY",
    xpReward: 100,
    criteriaKey: "perfectWeeks",
    criteriaValue: 1,
    sortOrder: 4,
  },
  {
    id: "first-goal",
    name: "Primeiro objectivo",
    description: "Concluir o primeiro objectivo.",
    icon: "target",
    rarity: "COMMON",
    category: "GOALS",
    xpReward: 25,
    criteriaKey: "goalsCompleted",
    criteriaValue: 1,
    sortOrder: 5,
  },
  {
    id: "active-30",
    name: "Sem falhar",
    description: "30 dias activos.",
    icon: "calendar",
    rarity: "EPIC",
    category: "CONSISTENCY",
    xpReward: 80,
    criteriaKey: "activeDays",
    criteriaValue: 30,
    sortOrder: 6,
  },
  {
    id: "deep-work-10",
    name: "Deep Work",
    description: "10 dias de trabalho profundo.",
    icon: "moon-star",
    rarity: "RARE",
    category: "DEEP_WORK",
    xpReward: 60,
    criteriaKey: "deepWorkDays",
    criteriaValue: 10,
    sortOrder: 7,
  },
  {
    id: "level-10",
    name: "Awakened",
    description: "Alcançar nível 10.",
    icon: "zap",
    rarity: "RARE",
    category: "LEVEL",
    xpReward: 60,
    criteriaKey: "level",
    criteriaValue: 10,
    sortOrder: 8,
  },
  {
    id: "prestige-1",
    name: "Ascension I",
    description: "Conquistar o primeiro prestige.",
    icon: "crown",
    rarity: "LEGENDARY",
    category: "PRESTIGE",
    xpReward: 150,
    criteriaKey: "prestigeLevel",
    criteriaValue: 1,
    sortOrder: 9,
  },
];

type AchievementProfile = Pick<
  UserGameProfile,
  | "currentStreak"
  | "tasksCompleted"
  | "studyMinutes"
  | "goalsCompleted"
  | "perfectWeeks"
  | "activeDays"
  | "deepWorkDays"
  | "level"
  | "prestigeLevel"
>;

export function achievementMetric(
  profile: AchievementProfile,
  criteriaKey: string
) {
  switch (criteriaKey) {
    case "currentStreak":
      return profile.currentStreak;
    case "tasksCompleted":
      return profile.tasksCompleted;
    case "studyMinutes":
      return profile.studyMinutes;
    case "goalsCompleted":
      return profile.goalsCompleted;
    case "perfectWeeks":
      return profile.perfectWeeks;
    case "activeDays":
      return profile.activeDays;
    case "deepWorkDays":
      return profile.deepWorkDays;
    case "level":
      return profile.level;
    case "prestigeLevel":
      return profile.prestigeLevel;
    default:
      return 0;
  }
}
