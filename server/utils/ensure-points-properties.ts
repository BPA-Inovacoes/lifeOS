import { Prisma, type PrismaClient } from "@prisma/client";

import { parsePoints, rowPoints, suggestHabitPoints, suggestTaskPoints } from "./points";

/** Garante coluna Pontos (e Prioridade em Tarefas) em databases existentes. */
export async function ensurePointsProperties(prisma: PrismaClient) {
  const databases = await prisma.database.findMany({
    where: { template: { in: ["TASKS", "HABITS"] } },
    include: {
      properties: { orderBy: { sortOrder: "asc" } },
      rows: true,
    },
  });

  for (const db of databases) {
    let props = [...db.properties];
    const maxOrder = props.reduce((m, p) => Math.max(m, p.sortOrder), -1);

    if (db.template === "TASKS") {
      const hasPriority = props.some((p) => p.name === "Prioridade");
      if (!hasPriority) {
        const created = await prisma.databaseProperty.create({
          data: {
            databaseId: db.id,
            name: "Prioridade",
            type: "SELECT",
            sortOrder: maxOrder + 1,
            config: { options: ["Alta", "Média", "Baixa"] },
          },
        });
        props = [...props, created];
      } else {
        const pri = props.find((p) => p.name === "Prioridade")!;
        const cfg = pri.config as { options?: string[] };
        if (!cfg.options?.length) {
          await prisma.databaseProperty.update({
            where: { id: pri.id },
            data: {
              config: { options: ["Alta", "Média", "Baixa"] },
            },
          });
        }
      }
    }

    if (db.template === "TASKS") {
      const hasFocus = props.some((p) => p.name === "Foco hoje");
      if (!hasFocus) {
        const sortOrder = Math.max(...props.map((p) => p.sortOrder), -1) + 1;
        const created = await prisma.databaseProperty.create({
          data: {
            databaseId: db.id,
            name: "Foco hoje",
            type: "CHECKBOX",
            sortOrder,
          },
        });
        props = [...props, created];
      }
    }

    const hasPoints = props.some((p) => p.name === "Pontos");
    if (!hasPoints) {
      const sortOrder =
        Math.max(...props.map((p) => p.sortOrder), -1) + 1;
      const created = await prisma.databaseProperty.create({
        data: {
          databaseId: db.id,
          name: "Pontos",
          type: "NUMBER",
          sortOrder,
        },
      });
      props = [...props, created];
    }

    const pointsProp = props.find((p) => p.name === "Pontos")!;
    const priorityProp = props.find((p) => p.name === "Prioridade");
    const freqProp = props.find(
      (p) => p.name === "Frequência" || p.name === "Frequencia"
    );

    for (const row of db.rows) {
      const vals =
        typeof row.properties === "object" && row.properties !== null
          ? (row.properties as Record<string, unknown>)
          : {};

      if (parsePoints(vals[pointsProp.id]) > 0) continue;

      let pts = 10;
      if (db.template === "TASKS" && priorityProp) {
        pts = suggestTaskPoints(String(vals[priorityProp.id] ?? "Média"));
      }
      if (db.template === "HABITS" && freqProp) {
        pts = suggestHabitPoints(String(vals[freqProp.id] ?? "Diário"));
      } else if (db.template === "HABITS") {
        pts = rowPoints(props, vals) || 10;
      }

      await prisma.databaseRow.update({
        where: { id: row.id },
        data: {
          properties: {
            ...vals,
            [pointsProp.id]: pts,
          } as Prisma.InputJsonValue,
        },
      });
    }
  }
}
