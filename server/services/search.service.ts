import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { workspaceIdsForUser } from "../utils/user-workspaces";

const searchSchema = z.object({
  q: z.string().min(1).max(120),
});

export class SearchService {
  constructor(private prisma: PrismaClient) {}

  parseQuery(raw: unknown) {
    return searchSchema.parse(raw);
  }

  async search(userId: string, query: string) {
    const q = query.trim().toLowerCase();
    const workspaceIds = await workspaceIdsForUser(this.prisma, userId);
    if (workspaceIds.length === 0) {
      return { pages: [], databases: [], rows: [] };
    }

    const pages = await this.prisma.page.findMany({
      where: {
        workspaceId: { in: workspaceIds },
        isArchived: false,
        title: { contains: q, mode: "insensitive" },
      },
      take: 12,
      select: {
        id: true,
        title: true,
        icon: true,
        workspaceId: true,
        workspace: { select: { name: true } },
      },
    });

    const databases = await this.prisma.database.findMany({
      where: {
        workspaceId: { in: workspaceIds },
        name: { contains: q, mode: "insensitive" },
      },
      take: 8,
      select: {
        id: true,
        name: true,
        icon: true,
        template: true,
        workspaceId: true,
      },
    });

    const allRows = await this.prisma.databaseRow.findMany({
      where: {
        database: { workspaceId: { in: workspaceIds } },
      },
      take: 200,
      include: {
        database: {
          select: { id: true, name: true, workspaceId: true, properties: true },
        },
      },
    });

    const rows = allRows
      .filter((row) => {
        const blob = JSON.stringify(row.properties).toLowerCase();
        return blob.includes(q);
      })
      .slice(0, 12)
      .map((row) => {
        const titleProp = row.database.properties.find((p) => p.type === "TEXT");
        const title = titleProp
          ? String(
              (row.properties as Record<string, unknown>)[titleProp.id] ?? ""
            )
          : "Entrada";
        return {
          id: row.id,
          title,
          databaseId: row.database.id,
          databaseName: row.database.name,
          workspaceId: row.database.workspaceId,
        };
      });

    return {
      pages: pages.map((p) => ({
        id: p.id,
        title: p.title,
        icon: p.icon,
        workspaceId: p.workspaceId,
        workspaceName: p.workspace.name,
      })),
      databases,
      rows,
    };
  }
}
