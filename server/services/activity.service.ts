import type { PointsEventSource, PrismaClient } from "@prisma/client";

import type { FinanceIncomeSuggestion } from "../finance/finance-income-suggestion";
import { buildClientIncomeSuggestion } from "../finance/finance-income-suggestion";
import type { GamificationFeedbackPayload } from "../gamification/feedback";
import { toGamificationFeedback } from "../gamification/feedback";
import type { GamificationEngine } from "../gamification/engine";
import type { ActivityContext } from "../gamification/xp-rules";
import { addDays, toDayDate, toDayKey, weekdayLabel } from "../utils/day";
import {
  buildHabitRowStats,
  parseHabitFrequency,
  type HabitRowStats,
} from "../utils/habit-stats";
import {
  findProp,
  isClientClosed,
  isGoalCompleted,
  isStudyCompleted,
  isTaskCompleted,
  rowPoints,
  type Prop,
} from "../utils/points";
import { workspaceIdsForUser } from "../utils/user-workspaces";

type RowShape = {
  id: string;
  databaseId: string;
  properties: unknown;
  database: { workspaceId: string; template: string };
};

export type RowActivityResult = {
  gamification: GamificationFeedbackPayload | null;
  financeSuggestion: FinanceIncomeSuggestion | null;
};

function findDoneProp(properties: Prop[]) {
  return properties.find(
    (p) => p.type === "CHECKBOX" && p.name.toLowerCase().includes("feito")
  );
}

export function computeHabitStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const keys = new Set(dates.map((d) => toDayKey(toDayDate(d))));
  const today = toDayDate();
  const yesterday = addDays(today, -1);

  let cursor: Date | null = null;
  if (keys.has(toDayKey(today))) cursor = today;
  else if (keys.has(toDayKey(yesterday))) cursor = yesterday;
  else return 0;

  let streak = 0;
  let check = cursor;
  while (keys.has(toDayKey(check))) {
    streak += 1;
    check = addDays(check, -1);
  }
  return streak;
}

export function computeBestStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates]
    .map((d) => toDayDate(d))
    .sort((a, b) => a.getTime() - b.getTime());

  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    const diff =
      (cur.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);
    if (diff === 1) {
      run += 1;
      best = Math.max(best, run);
    } else if (diff > 1) {
      run = 1;
    }
  }
  return best;
}

export class ActivityService {
  constructor(
    private prisma: PrismaClient,
    private gamification?: GamificationEngine
  ) {}

  /**
   * Legado: antes fazia writes em GETs para "resetar" hábitos.
   * Mantido apenas por compatibilidade, sem efeitos colaterais.
   */
  async syncHabitCheckboxesForUser(_userId: string) {
    return;
  }

  async upsertPointsEvent(
    userId: string,
    workspaceId: string,
    rowId: string,
    source: PointsEventSource,
    points: number,
    date: Date = toDayDate()
  ) {
    if (points <= 0) {
      await this.prisma.pointsEvent.deleteMany({
        where: { rowId, date },
      });
      return;
    }

    await this.prisma.pointsEvent.upsert({
      where: { rowId_date: { rowId, date } },
      create: {
        userId,
        workspaceId,
        rowId,
        source,
        date,
        points,
      },
      update: { points, source, userId, workspaceId },
    });
  }

  async clearPointsEvent(rowId: string, date: Date = toDayDate()) {
    await this.prisma.pointsEvent.deleteMany({
      where: { rowId, date },
    });
  }

  async applyRowActivity(
    userId: string,
    row: RowShape,
    properties: Prop[],
    merged: Record<string, unknown>,
    previous: Record<string, unknown>
  ): Promise<RowActivityResult> {
    const empty: RowActivityResult = { gamification: null, financeSuggestion: null };
    const template = row.database.template;
    const workspaceId = row.database.workspaceId;
    const today = toDayDate();
    const pts = rowPoints(properties, merged);

    if (template === "HABITS") {
      const doneProp = findDoneProp(properties);
      if (!doneProp) return empty;

      const wasDone = Boolean(previous[doneProp.id]);
      const isDone = Boolean(merged[doneProp.id]);
      const frequency = this.readHabitFrequency(properties, merged);

      if (isDone && !wasDone) {
        const todayKey = toDayKey(today);
        await this.upsertPointsEvent(
          userId,
          workspaceId,
          row.id,
          "HABIT",
          pts,
          today
        );
        const habitSnapshot = await this.getHabitCompletionSnapshot(userId);
        return {
          gamification: await this.emitGamification(userId, {
            type: "habit.completed",
            eventId: `habit:${row.id}:${todayKey}`,
            workspaceId,
            source: "HABIT",
            points: pts,
            rowId: row.id,
            template,
            frequency,
            habitArea: this.readHabitRpgArea(properties, merged),
            allHabitsCompletedToday: habitSnapshot.allDone,
          }),
          financeSuggestion: null,
        };
      } else if (!isDone && wasDone) {
        await this.clearPointsEvent(row.id, today);
      } else if (isDone) {
        await this.upsertPointsEvent(
          userId,
          workspaceId,
          row.id,
          "HABIT",
          pts,
          today
        );
      }
      return empty;
    }

    if (template === "TASKS") {
      const statusProp = properties.find((p) => p.type === "STATUS");
      if (!statusProp) return empty;

      const wasDone = isTaskCompleted(String(previous[statusProp.id] ?? ""));
      const isDone = isTaskCompleted(String(merged[statusProp.id] ?? ""));

      if (isDone && !wasDone) {
        const todayKey = toDayKey(today);
        await this.upsertPointsEvent(
          userId,
          workspaceId,
          row.id,
          "TASK",
          pts,
          today
        );
        return {
          gamification: await this.emitGamification(userId, {
            type: "task.completed",
            eventId: `task:${row.id}:${todayKey}`,
            workspaceId,
            source: "TASK",
            points: pts,
            rowId: row.id,
            template,
            priority: this.readPriority(properties, merged),
          }),
          financeSuggestion: null,
        };
      } else if (!isDone && wasDone) {
        await this.clearPointsEvent(row.id, today);
      } else if (isDone) {
        await this.upsertPointsEvent(
          userId,
          workspaceId,
          row.id,
          "TASK",
          pts,
          today
        );
      }
      return empty;
    }

    if (template === "GOALS") {
      const statusProp = properties.find((p) => p.type === "STATUS");
      if (!statusProp) return empty;

      const wasDone = isGoalCompleted(String(previous[statusProp.id] ?? ""));
      const isDone = isGoalCompleted(String(merged[statusProp.id] ?? ""));
      const goalPts = pts || 50;

      if (isDone && !wasDone) {
        const todayKey = toDayKey(today);
        await this.upsertPointsEvent(
          userId,
          workspaceId,
          row.id,
          "GOAL",
          goalPts,
          today
        );
        return {
          gamification: await this.emitGamification(userId, {
            type: "goal.completed",
            eventId: `goal:${row.id}:${todayKey}`,
            workspaceId,
            source: "GOAL",
            points: goalPts,
            rowId: row.id,
            template,
            goalArea: this.readGoalArea(properties, merged),
          }),
          financeSuggestion: null,
        };
      } else if (!isDone && wasDone) {
        await this.clearPointsEvent(row.id, today);
      }
      return empty;
    }

    if (template === "CLIENTS") {
      const statusProp = properties.find((p) => p.type === "STATUS");
      if (!statusProp) return empty;

      const wasClosed = isClientClosed(String(previous[statusProp.id] ?? ""));
      const isClosed = isClientClosed(String(merged[statusProp.id] ?? ""));
      const clientPts = pts || 300;

      if (isClosed && !wasClosed) {
        const todayKey = toDayKey(today);
        await this.upsertPointsEvent(
          userId,
          workspaceId,
          row.id,
          "CLIENT",
          clientPts,
          today
        );
        const financeSuggestion = await buildClientIncomeSuggestion(
          this.prisma,
          userId,
          row,
          properties,
          merged
        );
        return {
          gamification: await this.emitGamification(userId, {
            type: "client.closed",
            eventId: `client:${row.id}:${todayKey}`,
            workspaceId,
            source: "CLIENT",
            points: clientPts,
            rowId: row.id,
            template,
          }),
          financeSuggestion,
        };
      } else if (!isClosed && wasClosed) {
        await this.clearPointsEvent(row.id, today);
      }
      return empty;
    }

    if (template === "STUDIES") {
      const statusProp = properties.find((p) => p.type === "STATUS");
      const minutesProp = properties.find(
        (p) => p.name.toLowerCase() === "minutos"
      );

      const wasDone = statusProp
        ? isStudyCompleted(String(previous[statusProp.id] ?? ""))
        : false;
      const isDone = statusProp
        ? isStudyCompleted(String(merged[statusProp.id] ?? ""))
        : false;

      const prevMinutes = minutesProp
        ? Number(previous[minutesProp.id] ?? 0) || 0
        : 0;
      const nextMinutes = minutesProp
        ? Number(merged[minutesProp.id] ?? 0) || 0
        : 0;
      const minutesDelta = Math.max(0, nextMinutes - prevMinutes);

      if (isDone && !wasDone) {
        const studyPts = Math.max(20, Math.round(nextMinutes / 3) || 20);
        const todayKey = toDayKey(today);
        await this.upsertPointsEvent(
          userId,
          workspaceId,
          row.id,
          "STUDY",
          studyPts,
          today
        );
        return {
          gamification: await this.emitGamification(userId, {
            type: "study.session.completed",
            eventId: `study:${row.id}:${todayKey}:done:${nextMinutes}`,
            workspaceId,
            source: "STUDY",
            points: studyPts,
            rowId: row.id,
            template,
            studyMinutesDelta: minutesDelta || nextMinutes,
          }),
          financeSuggestion: null,
        };
      } else if (minutesDelta > 0) {
        const studyPts = Math.max(10, Math.round(minutesDelta / 3));
        const todayKey = toDayKey(today);
        await this.upsertPointsEvent(
          userId,
          workspaceId,
          row.id,
          "STUDY",
          studyPts,
          today
        );
        return {
          gamification: await this.emitGamification(userId, {
            type: "study.session.completed",
            eventId: `study:${row.id}:${todayKey}:delta:${prevMinutes}-${nextMinutes}`,
            workspaceId,
            source: "STUDY",
            points: studyPts,
            rowId: row.id,
            template,
            studyMinutesDelta: minutesDelta,
          }),
          financeSuggestion: null,
        };
      } else if (!isDone && wasDone) {
        await this.clearPointsEvent(row.id, today);
      }
    }

    return empty;
  }

  normalizeHabitValues(
    properties: Prop[],
    values: Record<string, unknown>,
    doneToday: boolean
  ) {
    const out = { ...values };
    const doneProp = findDoneProp(properties);
    if (doneProp) out[doneProp.id] = doneToday;
    return out;
  }

  private readPriority(properties: Prop[], merged: Record<string, unknown>) {
    const priorityProp = properties.find(
      (p) => p.name.toLowerCase() === "prioridade"
    );
    return priorityProp ? String(merged[priorityProp.id] ?? "") : undefined;
  }

  private readHabitFrequency(properties: Prop[], merged: Record<string, unknown>) {
    const freqProp =
      findProp(properties, "Frequência") ?? findProp(properties, "Frequencia");
    return freqProp ? String(merged[freqProp.id] ?? "Diário") : "Diário";
  }

  private readHabitRpgArea(properties: Prop[], merged: Record<string, unknown>) {
    const areaProp =
      findProp(properties, "Área RPG") ?? findProp(properties, "Area RPG");
    return areaProp ? String(merged[areaProp.id] ?? "Geral") : "Geral";
  }

  private readGoalArea(properties: Prop[], merged: Record<string, unknown>) {
    const areaProp = findProp(properties, "Área");
    return areaProp ? String(merged[areaProp.id] ?? "") : undefined;
  }

  async emitFinanceActivity(
    userId: string,
    ctx: ActivityContext
  ): Promise<GamificationFeedbackPayload | null> {
    return this.emitGamification(userId, ctx);
  }

  private async emitGamification(
    userId: string,
    ctx: ActivityContext
  ): Promise<GamificationFeedbackPayload | null> {
    if (!this.gamification) return null;
    const result = await this.gamification.processActivity(userId, ctx);
    return toGamificationFeedback(result);
  }

  async getHabitCompletionSnapshot(userId: string) {
    const workspaceIds = await workspaceIdsForUser(this.prisma, userId);
    if (workspaceIds.length === 0) {
      return { total: 0, doneToday: 0, allDone: false };
    }

    const [total, doneToday] = await Promise.all([
      this.prisma.databaseRow.count({
        where: {
          database: {
            workspaceId: { in: workspaceIds },
            template: "HABITS",
          },
        },
      }),
      this.prisma.pointsEvent.count({
        where: {
          userId,
          source: "HABIT",
          date: toDayDate(),
        },
      }),
    ]);

    return {
      total,
      doneToday,
      allDone: total > 0 && doneToday >= total,
    };
  }

  async getTodayPoints(userId: string) {
    const today = toDayDate();
    const events = await this.prisma.pointsEvent.findMany({
      where: { userId, date: today },
    });

    let taskPoints = 0;
    let habitPoints = 0;
    for (const e of events) {
      if (e.source === "TASK") taskPoints += e.points;
      else if (e.source === "HABIT") habitPoints += e.points;
    }

    return {
      taskPoints,
      habitPoints,
      total: taskPoints + habitPoints,
    };
  }

  async getWeeklyXp(userId: string, days = 7) {
    const today = toDayDate();
    const start = addDays(today, -(days - 1));

    const events = await this.prisma.pointsEvent.findMany({
      where: {
        userId,
        date: { gte: start, lte: today },
      },
    });

    const byDay = new Map<
      string,
      { taskPoints: number; habitPoints: number; total: number }
    >();

    for (let i = 0; i < days; i++) {
      const d = addDays(start, i);
      byDay.set(toDayKey(d), {
        taskPoints: 0,
        habitPoints: 0,
        total: 0,
      });
    }

    for (const e of events) {
      const key = toDayKey(toDayDate(e.date));
      const bucket = byDay.get(key);
      if (!bucket) continue;
      if (e.source === "TASK") bucket.taskPoints += e.points;
      else if (e.source === "HABIT") bucket.habitPoints += e.points;
      bucket.total += e.points;
    }

    const out: {
      date: string;
      label: string;
      taskPoints: number;
      habitPoints: number;
      total: number;
      isToday: boolean;
    }[] = [];

    for (let i = 0; i < days; i++) {
      const d = addDays(start, i);
      const key = toDayKey(d);
      const bucket = byDay.get(key)!;
      out.push({
        date: key,
        label: weekdayLabel(d),
        taskPoints: bucket.taskPoints,
        habitPoints: bucket.habitPoints,
        total: bucket.total,
        isToday: key === toDayKey(today),
      });
    }

    return out;
  }

  async getHabitStreakForRow(rowId: string) {
    const events = await this.prisma.pointsEvent.findMany({
      where: { rowId, source: "HABIT" },
      select: { date: true },
      orderBy: { date: "desc" },
    });
    const dates = events.map((e) => e.date);
    return {
      current: computeHabitStreak(dates),
      best: computeBestStreak(dates),
    };
  }

  async getHabitStreaksBatch(rowIds: string[]) {
    const stats = await this.getHabitRowActivityBatch(
      rowIds.map((id) => ({ id, frequencyValue: "Diário" })),
      new Set()
    );
    const out = new Map<string, { current: number; best: number }>();
    for (const id of rowIds) {
      const s = stats.get(id);
      out.set(id, {
        current: s?.streak ?? 0,
        best: s?.bestStreak ?? 0,
      });
    }
    return out;
  }

  async getHabitRowActivityBatch(
    rows: { id: string; frequencyValue: unknown }[],
    doneTodaySet: Set<string>
  ): Promise<Map<string, HabitRowStats>> {
    if (rows.length === 0) return new Map();

    const rowIds = rows.map((r) => r.id);
    const events = await this.prisma.pointsEvent.findMany({
      where: { rowId: { in: rowIds }, source: "HABIT" },
      select: { rowId: true, date: true },
      orderBy: { date: "desc" },
    });

    const byRow = new Map<string, Date[]>();
    for (const e of events) {
      const list = byRow.get(e.rowId) ?? [];
      list.push(e.date);
      byRow.set(e.rowId, list);
    }

    const out = new Map<string, HabitRowStats>();
    for (const row of rows) {
      const dates = byRow.get(row.id) ?? [];
      out.set(
        row.id,
        buildHabitRowStats(
          dates,
          parseHabitFrequency(row.frequencyValue),
          doneTodaySet.has(row.id)
        )
      );
    }
    return out;
  }

  async getHabitDoneTodaySet(userId: string) {
    const today = toDayDate();
    const events = await this.prisma.pointsEvent.findMany({
      where: { userId, source: "HABIT", date: today },
      select: { rowId: true },
    });
    return new Set(events.map((e) => e.rowId));
  }

  /** Sincroniza eventos a partir do estado atual das linhas (seed / migração). */
  async backfillFromRows(userId: string) {
    const workspaceIds = await workspaceIdsForUser(this.prisma, userId);
    if (workspaceIds.length === 0) return;

    const today = toDayDate();
    const databases = await this.prisma.database.findMany({
      where: { workspaceId: { in: workspaceIds } },
      include: {
        properties: { orderBy: { sortOrder: "asc" } },
        rows: true,
      },
    });

    for (const db of databases) {
      const props = db.properties;
      for (const row of db.rows) {
        const vals = row.properties as Record<string, unknown>;
        const pts = rowPoints(props, vals);

        if (db.template === "HABITS") {
          const doneProp = findDoneProp(props);
          if (doneProp && Boolean(vals[doneProp.id])) {
            await this.upsertPointsEvent(
              userId,
              db.workspaceId,
              row.id,
              "HABIT",
              pts,
              today
            );
          }
        }

        if (db.template === "TASKS") {
          const statusProp = props.find((p) => p.type === "STATUS");
          if (
            statusProp &&
            isTaskCompleted(String(vals[statusProp.id] ?? ""))
          ) {
            await this.upsertPointsEvent(
              userId,
              db.workspaceId,
              row.id,
              "TASK",
              pts,
              today
            );
          }
        }

        if (db.template === "GOALS") {
          const statusProp = props.find((p) => p.type === "STATUS");
          if (
            statusProp &&
            isGoalCompleted(String(vals[statusProp.id] ?? ""))
          ) {
            await this.upsertPointsEvent(
              userId,
              db.workspaceId,
              row.id,
              "GOAL",
              50,
              today
            );
          }
        }

        if (db.template === "STUDIES") {
          const statusProp = props.find((p) => p.type === "STATUS");
          const minutesProp = props.find(
            (p) => p.name.toLowerCase() === "minutos"
          );
          const minutes = minutesProp ? Number(vals[minutesProp.id] ?? 0) || 0 : 0;
          if (
            (statusProp &&
              isStudyCompleted(String(vals[statusProp.id] ?? ""))) ||
            minutes > 0
          ) {
            await this.upsertPointsEvent(
              userId,
              db.workspaceId,
              row.id,
              "STUDY",
              Math.max(10, Math.round(Math.max(30, minutes) / 3)),
              today
            );
          }
        }
      }
    }
  }

  /** Histórico de demonstração (últimos 7 dias). */
  async seedDemoWeeklyHistory(userId: string) {
    const workspaceIds = await workspaceIdsForUser(this.prisma, userId);
    if (workspaceIds.length === 0) return;

    const habitRow = await this.prisma.databaseRow.findFirst({
      where: {
        database: {
          workspaceId: { in: workspaceIds },
          template: "HABITS",
        },
      },
      include: { database: { select: { workspaceId: true, properties: true } } },
    });

    if (!habitRow) return;

    const props = habitRow.database.properties;
    const pts = rowPoints(
      props,
      habitRow.properties as Record<string, unknown>
    );
    const today = toDayDate();

    const offsets = [6, 5, 4, 3, 2, 1, 0];
    for (const off of offsets) {
      const date = addDays(today, -off);
      const points = off === 0 ? pts : Math.max(5, pts - (off % 3) * 3);
      await this.prisma.pointsEvent.upsert({
        where: {
          rowId_date: { rowId: habitRow.id, date },
        },
        create: {
          userId,
          workspaceId: habitRow.database.workspaceId,
          rowId: habitRow.id,
          source: "HABIT",
          date,
          points,
        },
        update: { points },
      });
    }

    const taskRow = await this.prisma.databaseRow.findFirst({
      where: {
        database: {
          workspaceId: { in: workspaceIds },
          template: "TASKS",
        },
      },
      include: { database: { select: { workspaceId: true, properties: true } } },
    });

    if (taskRow) {
      const tProps = taskRow.database.properties;
      const tPts = rowPoints(
        tProps,
        taskRow.properties as Record<string, unknown>
      );
      for (const off of [3, 1]) {
        const date = addDays(today, -off);
        await this.prisma.pointsEvent.upsert({
          where: {
            rowId_date: { rowId: taskRow.id, date },
          },
          create: {
            userId,
            workspaceId: taskRow.database.workspaceId,
            rowId: taskRow.id,
            source: "TASK",
            date,
            points: tPts,
          },
          update: { points: tPts },
        });
      }
    }
  }
}
