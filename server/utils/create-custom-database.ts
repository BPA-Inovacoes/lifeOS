import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

const include = {
  properties: { orderBy: { sortOrder: "asc" as const } },
  views: { orderBy: { sortOrder: "asc" as const } },
};

/** Base personalizada (template CUSTOM) — independente das bases default do espaço. */
export async function createCustomDatabase(
  prisma: DbClient,
  workspaceId: string,
  input: { name: string; icon?: string | null }
) {
  return prisma.database.create({
    data: {
      workspaceId,
      name: input.name,
      icon: input.icon?.trim() || "briefcase",
      template: "CUSTOM",
      properties: {
        create: [
          { name: "Título", type: "TEXT", sortOrder: 0 },
          {
            name: "Estado",
            type: "STATUS",
            sortOrder: 1,
            config: {
              options: ["Por fazer", "Em progresso", "Concluído"],
            },
          },
        ],
      },
      views: {
        create: [
          { name: "Tabela", type: "TABLE", sortOrder: 0 },
          { name: "Quadro", type: "BOARD", sortOrder: 1 },
        ],
      },
    },
    include,
  });
}
