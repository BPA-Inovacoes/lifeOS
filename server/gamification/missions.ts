import type { ActivityContext } from "./xp-rules";

export type DailyMissionKey =
  | "tasks-5"
  | "study-60"
  | "habits-all"
  | "xp-50"
  | "deep-work-1";

export type DailyMissionDef = {
  key: DailyMissionKey;
  title: string;
  description: string;
  defaultTarget: number;
  xpReward: number;
  icon: string;
};

export const DAILY_MISSIONS: DailyMissionDef[] = [
  {
    key: "tasks-5",
    title: "Executor do dia",
    description: "Concluir 5 tarefas.",
    defaultTarget: 5,
    xpReward: 30,
    icon: "check-square",
  },
  {
    key: "study-60",
    title: "Sessão de estudo",
    description: "Estudar 60 minutos.",
    defaultTarget: 60,
    xpReward: 25,
    icon: "book-open",
  },
  {
    key: "habits-all",
    title: "Rotina completa",
    description: "Completar todos os hábitos do dia.",
    defaultTarget: 1,
    xpReward: 20,
    icon: "flame",
  },
  {
    key: "xp-50",
    title: "Momentum",
    description: "Ganhar 50 XP no dia.",
    defaultTarget: 50,
    xpReward: 15,
    icon: "zap",
  },
  {
    key: "deep-work-1",
    title: "Deep work",
    description: "Fechar uma sessão profunda de trabalho ou estudo.",
    defaultTarget: 1,
    xpReward: 20,
    icon: "moon-star",
  },
];

export function missionIncrement(
  missionKey: DailyMissionKey,
  ctx: ActivityContext,
  xpGained: number
) {
  switch (missionKey) {
    case "tasks-5":
      return ctx.type === "task.completed" ? 1 : 0;
    case "study-60":
      return ctx.type === "study.session.completed" ? ctx.studyMinutesDelta ?? 0 : 0;
    case "habits-all":
      return ctx.type === "habit.completed" && ctx.allHabitsCompletedToday ? 1 : 0;
    case "xp-50":
      return xpGained;
    case "deep-work-1":
      return ctx.type === "study.session.completed" &&
        (ctx.studyMinutesDelta ?? 0) >= 45
        ? 1
        : 0;
    default:
      return 0;
  }
}
