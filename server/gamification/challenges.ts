import type { PrismaClient } from "@prisma/client";

import {
  findProp,
  isGoalCompleted,
  parsePoints,
  type Prop,
} from "../utils/points";
import { workspaceIdsForUser } from "../utils/user-workspaces";

export type GameChallengeType = "dungeon" | "boss";

export type GameChallenge = {
  id: string;
  type: GameChallengeType;
  title: string;
  workspaceId: string;
  databaseId: string;
  rowId: string;
  status: string;
  progress: number;
  xpReward: number;
  completed: boolean;
};

function rowTitle(properties: Prop[], values: Record<string, unknown>) {
  const text = properties.find((p) => p.type === "TEXT");
  if (text) return String(values[text.id] ?? "Sem título");
  return "Objectivo";
}

function readStatus(properties: Prop[], values: Record<string, unknown>) {
  const statusProp = properties.find((p) => p.type === "STATUS");
  return statusProp ? String(values[statusProp.id] ?? "") : "";
}

function readProgress(properties: Prop[], values: Record<string, unknown>) {
  const progressProp = findProp(properties, "Progresso %");
  if (!progressProp) return 0;
  const n = Number(values[progressProp.id]);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 0;
}

function readPriority(properties: Prop[], values: Record<string, unknown>) {
  const priorityProp = findProp(properties, "Prioridade");
  return priorityProp ? String(values[priorityProp.id] ?? "") : "";
}

function classifyChallenge(
  priority: string,
  points: number,
  progress: number
): GameChallengeType {
  if (priority === "Alta" || points >= 200) return "boss";
  if (progress >= 75 && points >= 100) return "boss";
  return "dungeon";
}

function xpRewardForChallenge(type: GameChallengeType, points: number) {
  if (type === "boss") return Math.max(500, points * 5, 5000);
  return Math.max(300, points * 3, 1000);
}

export async function fetchGameChallenges(
  prisma: PrismaClient,
  userId: string
): Promise<GameChallenge[]> {
  const workspaceIds = await workspaceIdsForUser(prisma, userId);
  if (workspaceIds.length === 0) return [];

  const goalsDbs = await prisma.database.findMany({
    where: { workspaceId: { in: workspaceIds }, template: "GOALS" },
    include: {
      properties: { orderBy: { sortOrder: "asc" } },
      rows: { orderBy: { sortOrder: "asc" }, take: 50 },
    },
  });

  const challenges: GameChallenge[] = [];

  for (const db of goalsDbs) {
    const props = db.properties as Prop[];

    for (const row of db.rows) {
      const values = row.properties as Record<string, unknown>;
      const status = readStatus(props, values);
      const completed = isGoalCompleted(status);
      const progress = readProgress(props, values);
      const priority = readPriority(props, values);
      const pointsProp = findProp(props, "Pontos");
      const points = pointsProp ? parsePoints(values[pointsProp.id]) : 60;
      const type = classifyChallenge(priority, points, progress);

      if (completed) continue;

      challenges.push({
        id: row.id,
        type,
        title: rowTitle(props, values),
        workspaceId: db.workspaceId,
        databaseId: db.id,
        rowId: row.id,
        status: status || "Não iniciado",
        progress,
        xpReward: xpRewardForChallenge(type, points),
        completed: false,
      });
    }
  }

  return challenges.sort((a, b) => {
    if (a.type === b.type) return b.xpReward - a.xpReward;
    return a.type === "boss" ? -1 : 1;
  });
}
