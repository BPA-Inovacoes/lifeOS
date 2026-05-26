import type { PrismaClient } from "@prisma/client";

import type { ActivityService } from "./activity.service";
import { WorkspaceService } from "./workspace.service";
import { isTaskCompleted, rowPoints } from "../utils/points";

function isToday(value: unknown): boolean {
  if (!value || typeof value !== "string") return false;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function rowTitle(
  properties: { id: string; type: string }[],
  values: Record<string, unknown>
) {
  const text = properties.find((p) => p.type === "TEXT");
  if (text) return String(values[text.id] ?? "Sem título");
  return "Entrada";
}

function findFocusProp(properties: { id: string; name: string; type: string }[]) {
  return properties.find(
    (p) =>
      p.type === "CHECKBOX" &&
      (p.name === "Foco hoje" || p.name.toLowerCase().includes("foco"))
  );
}

function priorityScore(priority: string) {
  if (priority === "Alta") return 30;
  if (priority === "Média") return 20;
  return 10;
}

export class DashboardService {
  constructor(
    private prisma: PrismaClient,
    private workspaces: WorkspaceService,
    private activity: ActivityService
  ) {}

  async getSummary(userId: string) {
    const [workspaceList, todayPts, weeklyXp, habitDoneToday] =
      await Promise.all([
        this.workspaces.listForUser(userId),
        this.activity.getTodayPoints(userId),
        this.activity.getWeeklyXp(userId),
        this.activity.getHabitDoneTodaySet(userId),
      ]);

    const workspaceIds = workspaceList.map((w) => w.id);

    let tasksOpen = 0;
    let tasksDueToday = 0;
    let tasksDone = 0;
    let habitsTotal = 0;
    let habitsDoneToday = 0;
    let pointsAvailable = 0;

    const taskPreview: {
      id: string;
      title: string;
      status: string;
      points: number;
      earned: boolean;
      workspaceId: string;
      databaseId: string;
    }[] = [];

    const habitPreview: {
      id: string;
      title: string;
      done: boolean;
      points: number;
      earned: boolean;
      streak: number;
      bestStreak: number;
      workspaceId: string;
      databaseId: string;
    }[] = [];

    const habitStreaks: {
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
    }[] = [];

    const focusCandidates: {
      id: string;
      title: string;
      status: string;
      points: number;
      focusToday: boolean;
      dueToday: boolean;
      priority: string;
      score: number;
      workspaceId: string;
      databaseId: string;
      statusPropertyId: string;
      focusPropertyId: string;
    }[] = [];

    let primaryWorkspaceId: string | null = workspaceList[0]?.id ?? null;
    let tasksDatabaseId: string | null = null;
    let habitsDatabaseId: string | null = null;
    let taskInbox: {
      workspaceId: string;
      databaseId: string;
      titlePropertyId: string;
      statusPropertyId: string;
    } | null = null;

    const habitRowsForActivity: { id: string; frequencyValue: unknown }[] = [];

    if (workspaceIds.length > 0) {
      const databases = await this.prisma.database.findMany({
        where: { workspaceId: { in: workspaceIds } },
        include: {
          properties: { orderBy: { sortOrder: "asc" } },
          rows: { orderBy: { sortOrder: "asc" } },
        },
      });

      for (const db of databases) {
        const props = db.properties;
        const statusProp = props.find((p) => p.type === "STATUS");
        const dateProp = props.find((p) => p.type === "DATE");
        const priorityProp = props.find((p) => p.name === "Prioridade");
        const focusProp = findFocusProp(props);

        if (db.template === "TASKS") {
          if (!tasksDatabaseId) {
            tasksDatabaseId = db.id;
            primaryWorkspaceId = db.workspaceId;
            const titleProp = props.find((p) => p.type === "TEXT");
            if (titleProp && statusProp) {
              taskInbox = {
                workspaceId: db.workspaceId,
                databaseId: db.id,
                titlePropertyId: titleProp.id,
                statusPropertyId: statusProp.id,
              };
            }
          }

          for (const row of db.rows) {
            const vals = row.properties as Record<string, unknown>;
            const status = statusProp
              ? String(vals[statusProp.id] ?? "Por fazer")
              : "Por fazer";
            const pts = rowPoints(props, vals);
            const done = isTaskCompleted(status);
            const priority = priorityProp
              ? String(vals[priorityProp.id] ?? "Média")
              : "Média";
            const focusToday = focusProp
              ? Boolean(vals[focusProp.id])
              : false;
            const dueToday = dateProp ? isToday(vals[dateProp.id]) : false;

            if (done) {
              tasksDone += 1;
            } else {
              tasksOpen += 1;
              pointsAvailable += pts;
              if (dueToday) tasksDueToday += 1;

              if (statusProp && focusProp) {
                let score = priorityScore(priority);
                if (focusToday) score += 100;
                if (dueToday) score += 50;

                if (focusToday || dueToday || score >= 30) {
                  focusCandidates.push({
                    id: row.id,
                    title: rowTitle(props, vals),
                    status,
                    points: pts,
                    focusToday,
                    dueToday,
                    priority,
                    score,
                    workspaceId: db.workspaceId,
                    databaseId: db.id,
                    statusPropertyId: statusProp.id,
                    focusPropertyId: focusProp.id,
                  });
                }
              }
            }

            if (taskPreview.length < 5 && !done) {
              taskPreview.push({
                id: row.id,
                title: rowTitle(props, vals),
                status,
                points: pts,
                earned: false,
                workspaceId: db.workspaceId,
                databaseId: db.id,
              });
            }
          }
        }

        if (db.template === "HABITS") {
          if (!habitsDatabaseId) {
            habitsDatabaseId = db.id;
          }

          const freqProp = props.find(
            (p) => p.name === "Frequência" || p.name === "Frequencia"
          );

          for (const row of db.rows) {
            habitsTotal += 1;
            const vals = row.properties as Record<string, unknown>;
            const done = habitDoneToday.has(row.id);
            const pts = rowPoints(props, vals);

            habitRowsForActivity.push({
              id: row.id,
              frequencyValue: freqProp ? vals[freqProp.id] : "Diário",
            });

            if (done) {
              habitsDoneToday += 1;
            } else {
              pointsAvailable += pts;
            }

            habitStreaks.push({
              id: row.id,
              title: rowTitle(props, vals),
              streak: 0,
              bestStreak: 0,
              doneToday: done,
              frequency: "daily",
              consistency: 0,
              heatmap: [],
              workspaceId: db.workspaceId,
              databaseId: db.id,
            });

            if (habitPreview.length < 5) {
              habitPreview.push({
                id: row.id,
                title: rowTitle(props, vals),
                done,
                points: pts,
                earned: done,
                streak: 0,
                bestStreak: 0,
                workspaceId: db.workspaceId,
                databaseId: db.id,
              });
            }
          }
        }
      }
    }

    const activityMap = await this.activity.getHabitRowActivityBatch(
      habitRowsForActivity,
      habitDoneToday
    );

    for (const h of habitStreaks) {
      const s = activityMap.get(h.id);
      if (s) {
        h.streak = s.streak;
        h.bestStreak = s.bestStreak;
        h.frequency = s.frequency;
        h.consistency = s.consistency;
        h.heatmap = s.heatmap;
      }
    }

    habitStreaks.sort((a, b) => b.streak - a.streak);

    for (const h of habitPreview) {
      const s = activityMap.get(h.id);
      if (s) {
        h.streak = s.streak;
        h.bestStreak = s.bestStreak;
      }
    }

    const focusNow = focusCandidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ score: _score, ...item }) => item);

    const weekXpTotal = weeklyXp.reduce((n, d) => n + d.total, 0);
    const bestHabitStreak = habitStreaks.reduce(
      (max, h) => Math.max(max, h.streak),
      0
    );

    const weeklyProgress =
      habitsTotal > 0
        ? Math.round((habitsDoneToday / habitsTotal) * 100)
        : tasksOpen + tasksDone > 0
          ? Math.round((tasksDone / (tasksOpen + tasksDone)) * 100)
          : 0;

    const pointsToday = todayPts.total;
    const pointsGoal = pointsToday + pointsAvailable;

    return {
      metrics: {
        tasksOpen,
        tasksDueToday,
        tasksDone,
        habitsTotal,
        habitsDoneToday,
        weeklyProgress,
        pointsToday,
        pointsAvailable,
        pointsGoal,
        pointsFromTasksToday: todayPts.taskPoints,
        pointsFromHabitsToday: todayPts.habitPoints,
        weekXpTotal,
        bestHabitStreak,
      },
      focusNow,
      weeklyXp,
      habitStreaks: habitStreaks.slice(0, 6),
      taskPreview,
      habitPreview,
      links: {
        workspaceId: primaryWorkspaceId,
        tasksDatabaseId,
        habitsDatabaseId,
        inbox: taskInbox,
      },
      workspaces: workspaceList,
    };
  }
}
