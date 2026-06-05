import { apiJson } from "@/services/http";

import type { WorkspaceSummary } from "@/types/workspace";



export type DashboardMetrics = {

  tasksOpen: number;

  tasksDueToday: number;

  tasksDone: number;

  habitsTotal: number;

  habitsDoneToday: number;

  weeklyProgress: number;

  pointsToday: number;

  pointsAvailable: number;

  pointsGoal: number;

  pointsFromTasksToday: number;

  pointsFromHabitsToday: number;

  weekXpTotal: number;

  bestHabitStreak: number;

};



export type WeeklyXpDay = {

  date: string;

  label: string;

  taskPoints: number;

  habitPoints: number;

  total: number;

  isToday: boolean;

};



export type HabitStreakItem = {

  id: string;

  title: string;

  streak: number;

  bestStreak: number;

  doneToday: boolean;

  frequency: "daily" | "weekly";

  consistency: number;

  heatmap: { date: string; level: number }[];

  workspaceId: string;

  databaseId: string;

};



export type TaskPreview = {

  id: string;

  title: string;

  status: string;

  points: number;

  earned: boolean;

  workspaceId: string;

  databaseId: string;

};



export type HabitPreview = {

  id: string;

  title: string;

  done: boolean;

  points: number;

  earned: boolean;

  streak: number;

  bestStreak: number;

  workspaceId: string;

  databaseId: string;

};



export type FocusTask = {

  id: string;

  title: string;

  status: string;

  points: number;

  focusToday: boolean;

  dueToday: boolean;

  priority: string;

  workspaceId: string;

  databaseId: string;

  statusPropertyId: string;

  focusPropertyId: string;

};



export type FinanceFocusSnapshot =
  | { enabled: false }
  | {
      enabled: true;
      hasAccounts: false;
      currency: string;
      netWorth: number;
      savingsRate: number;
      weeklyReviewPending: boolean;
      activeMethod: null;
      nextStepLabel: string;
      overBudgetCount?: number;
    }
  | {
      enabled: true;
      hasAccounts: true;
      currency: string;
      netWorth: number;
      savingsRate: number;
      weeklyReviewPending: boolean;
      activeMethod: {
        id: string;
        name: string;
        stepTitle: string | null;
        stepIndex: number;
        totalSteps: number;
      } | null;
      nextStepLabel: string;
      overBudgetCount?: number;
    };

export type DashboardSummary = {

  metrics: DashboardMetrics;

  focusNow: FocusTask[];

  weeklyXp: WeeklyXpDay[];

  habitStreaks: HabitStreakItem[];

  taskPreview: TaskPreview[];

  habitPreview: HabitPreview[];

  finance: FinanceFocusSnapshot;

  links: {

    workspaceId: string | null;

    tasksDatabaseId: string | null;

    habitsDatabaseId: string | null;

    inbox: {

      workspaceId: string;

      databaseId: string;

      titlePropertyId: string;

      statusPropertyId: string;

    } | null;

  };

  workspaces: WorkspaceSummary[];

};



export async function fetchDashboard() {

  return apiJson<DashboardSummary>("/dashboard");

}


