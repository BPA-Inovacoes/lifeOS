import type { MissionPeriod } from "@prisma/client";

import type { ActivityContext } from "./xp-rules";

export type DailyMissionKey =
  | "tasks-5"
  | "study-60"
  | "habits-all"
  | "xp-50"
  | "deep-work-1";

export type WeeklyMissionKey =
  | "tasks-10"
  | "study-300"
  | "goals-1"
  | "clients-1"
  | "finance-review-1"
  | "perfect-week";

export type MonthlyMissionKey =
  | "tasks-40"
  | "goals-month"
  | "streak-30"
  | "finance-review-streak-4"
  | "finance-foundation";

export type MissionKey = DailyMissionKey | WeeklyMissionKey | MonthlyMissionKey;

export type MissionDef = {
  key: MissionKey;
  title: string;
  description: string;
  defaultTarget: number;
  xpReward: number;
  icon: string;
  period: MissionPeriod;
};

export const DAILY_MISSIONS: MissionDef[] = [
  {
    key: "tasks-5",
    title: "Executor do dia",
    description: "Concluir 5 tarefas.",
    defaultTarget: 5,
    xpReward: 30,
    icon: "check-square",
    period: "DAILY",
  },
  {
    key: "study-60",
    title: "Sessão de estudo",
    description: "Estudar 60 minutos.",
    defaultTarget: 60,
    xpReward: 25,
    icon: "book-open",
    period: "DAILY",
  },
  {
    key: "habits-all",
    title: "Rotina completa",
    description: "Completar todos os hábitos do dia.",
    defaultTarget: 1,
    xpReward: 20,
    icon: "flame",
    period: "DAILY",
  },
  {
    key: "xp-50",
    title: "Momentum",
    description: "Ganhar 50 XP no dia.",
    defaultTarget: 50,
    xpReward: 15,
    icon: "zap",
    period: "DAILY",
  },
  {
    key: "deep-work-1",
    title: "Deep work",
    description: "Fechar uma sessão profunda de trabalho ou estudo.",
    defaultTarget: 1,
    xpReward: 20,
    icon: "moon-star",
    period: "DAILY",
  },
];

export const WEEKLY_MISSIONS: MissionDef[] = [
  {
    key: "tasks-10",
    title: "Executor da semana",
    description: "Concluir 10 tarefas.",
    defaultTarget: 10,
    xpReward: 80,
    icon: "check-square",
    period: "WEEKLY",
  },
  {
    key: "study-300",
    title: "Estudioso",
    description: "Estudar 5 horas (300 min).",
    defaultTarget: 300,
    xpReward: 60,
    icon: "book-open",
    period: "WEEKLY",
  },
  {
    key: "goals-1",
    title: "Objectivo semanal",
    description: "Atingir 1 objectivo.",
    defaultTarget: 1,
    xpReward: 100,
    icon: "target",
    period: "WEEKLY",
  },
  {
    key: "clients-1",
    title: "Closer da semana",
    description: "Fechar 1 cliente.",
    defaultTarget: 1,
    xpReward: 120,
    icon: "briefcase",
    period: "WEEKLY",
  },
  {
    key: "finance-review-1",
    title: "Revisão financeira",
    description: "Completar a revisão semanal de dinheiro.",
    defaultTarget: 1,
    xpReward: 80,
    icon: "wallet",
    period: "WEEKLY",
  },
  {
    key: "perfect-week",
    title: "Semana perfeita",
    description: "Completar todos os hábitos durante 7 dias.",
    defaultTarget: 1,
    xpReward: 100,
    icon: "flame",
    period: "WEEKLY",
  },
];

export const MONTHLY_MISSIONS: MissionDef[] = [
  {
    key: "tasks-40",
    title: "Máquina de execução",
    description: "Concluir 40 tarefas no mês.",
    defaultTarget: 40,
    xpReward: 200,
    icon: "check-square",
    period: "MONTHLY",
  },
  {
    key: "goals-month",
    title: "Meta do mês",
    description: "Completar o objectivo principal do mês.",
    defaultTarget: 1,
    xpReward: 500,
    icon: "target",
    period: "MONTHLY",
  },
  {
    key: "streak-30",
    title: "Consistência mensal",
    description: "Manter sequência activa de 30 dias.",
    defaultTarget: 30,
    xpReward: 150,
    icon: "flame",
    period: "MONTHLY",
  },
  {
    key: "finance-review-streak-4",
    title: "Consistência financeira",
    description: "Quatro revisões semanais seguidas.",
    defaultTarget: 4,
    xpReward: 150,
    icon: "calendar-check",
    period: "MONTHLY",
  },
  {
    key: "finance-foundation",
    title: "Fundação",
    description: "Completar o método «Primeiros 30 dias».",
    defaultTarget: 1,
    xpReward: 200,
    icon: "landmark",
    period: "MONTHLY",
  },
];

export const ALL_MISSIONS: MissionDef[] = [
  ...DAILY_MISSIONS,
  ...WEEKLY_MISSIONS,
  ...MONTHLY_MISSIONS,
];

export function missionsForPeriod(period: MissionPeriod): MissionDef[] {
  return ALL_MISSIONS.filter((mission) => mission.period === period);
}

export function missionIncrement(
  missionKey: MissionKey,
  ctx: ActivityContext,
  xpGained: number,
  context?: { currentStreak?: number; perfectWeekAwarded?: boolean }
): number {
  switch (missionKey) {
    case "tasks-5":
    case "tasks-10":
    case "tasks-40":
      return ctx.type === "task.completed" ? 1 : 0;
    case "study-60":
    case "study-300":
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
    case "goals-1":
    case "goals-month":
      return ctx.type === "goal.completed" ? 1 : 0;
    case "clients-1":
      return ctx.type === "client.closed" ? 1 : 0;
    case "finance-review-1":
      return ctx.type === "finance.review.completed" ? 1 : 0;
    case "finance-review-streak-4":
      return ctx.type === "finance.review.streak" ? 1 : 0;
    case "finance-foundation":
      return ctx.type === "finance.method.completed" &&
        ctx.metadata?.methodId === "first-30-days"
        ? 1
        : 0;
    case "perfect-week":
      return context?.perfectWeekAwarded ? 1 : 0;
    case "streak-30":
      return context?.currentStreak && context.currentStreak >= 30 ? 1 : 0;
    default:
      return 0;
  }
}
