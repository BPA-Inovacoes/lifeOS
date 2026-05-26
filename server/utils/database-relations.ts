import type { DatabaseTemplate, Prisma, PrismaClient } from "@prisma/client";

import type { WorkspaceDatabaseTemplate } from "./workspace-database-templates";

type DbClient = PrismaClient | Prisma.TransactionClient;

/** Relações outbound declarativas (source → target). */
export type WorkspaceRelationDef = {
  sourceTemplate: "TASKS";
  propertyName: string;
  targetTemplate: WorkspaceDatabaseTemplate;
};

/** Colunas RELATION em Tarefas quando a base alvo existe no espaço. */
export const WORKSPACE_RELATION_REGISTRY: WorkspaceRelationDef[] = [
  { sourceTemplate: "TASKS", propertyName: "Projeto", targetTemplate: "PROJECTS" },
  { sourceTemplate: "TASKS", propertyName: "Objetivo", targetTemplate: "GOALS" },
  { sourceTemplate: "TASKS", propertyName: "Estudo", targetTemplate: "STUDIES" },
];

const TARGET_TEMPLATES: DatabaseTemplate[] = ["PROJECTS", "GOALS", "STUDIES"];

function relationConfig(relatedDatabaseId: string): Prisma.InputJsonValue {
  return { relatedDatabaseId };
}

/**
 * Sincroniza colunas RELATION com o registry.
 * Cria colunas em falta, actualiza `relatedDatabaseId`, remove órfãs.
 */
export async function syncWorkspaceRelations(
  prisma: DbClient,
  workspaceId: string
) {
  const tasks = await prisma.database.findFirst({
    where: { workspaceId, template: "TASKS" },
    include: { properties: { orderBy: { sortOrder: "asc" } } },
  });
  if (!tasks) return;

  const targets = await prisma.database.findMany({
    where: { workspaceId, template: { in: TARGET_TEMPLATES } },
    select: { id: true, template: true },
  });
  const targetIdByTemplate = new Map(
    targets.map((t) => [t.template, t.id] as const)
  );

  let maxSort = tasks.properties.reduce((m, p) => Math.max(m, p.sortOrder), -1);

  for (const def of WORKSPACE_RELATION_REGISTRY) {
    const targetId = targetIdByTemplate.get(
      def.targetTemplate as DatabaseTemplate
    );
    const existing = tasks.properties.find(
      (p) => p.type === "RELATION" && p.name === def.propertyName
    );

    if (targetId) {
      if (existing) {
        const cfg = existing.config as { relatedDatabaseId?: string };
        if (cfg.relatedDatabaseId !== targetId) {
          await prisma.databaseProperty.update({
            where: { id: existing.id },
            data: { config: relationConfig(targetId) },
          });
        }
      } else {
        maxSort += 1;
        await prisma.databaseProperty.create({
          data: {
            databaseId: tasks.id,
            name: def.propertyName,
            type: "RELATION",
            sortOrder: maxSort,
            config: relationConfig(targetId),
          },
        });
      }
      continue;
    }

    if (existing) {
      await prisma.databaseProperty.delete({ where: { id: existing.id } });
    }
  }
}

/** Valida valores RELATION num patch de propriedades. */
export async function validateRelationProperties(
  prisma: DbClient,
  workspaceId: string,
  properties: { id: string; type: string; config: unknown }[],
  merged: Record<string, unknown>
) {
  for (const prop of properties) {
    if (prop.type !== "RELATION") continue;

    const raw = merged[prop.id];
    if (raw === null || raw === undefined || raw === "") continue;

    const rowId = String(raw);
    const cfg = prop.config as { relatedDatabaseId?: string };
    const relatedDatabaseId = cfg.relatedDatabaseId;
    if (!relatedDatabaseId) continue;

    const relatedRow = await prisma.databaseRow.findFirst({
      where: {
        id: rowId,
        databaseId: relatedDatabaseId,
        database: { workspaceId },
      },
      select: { id: true },
    });

    if (!relatedRow) {
      throw new Error(`RELATION_INVALID:${prop.id}`);
    }
  }
}

export function isRelationValidationError(err: unknown): err is Error {
  return err instanceof Error && err.message.startsWith("RELATION_INVALID:");
}
