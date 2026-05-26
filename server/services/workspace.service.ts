import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { AppError } from "../middlewares/error.middleware";
import {
  provisionWorkspaceDatabases,
  removeWorkspaceDatabases,
} from "../utils/ensure-workspace-databases";
import {
  inferTemplatesFromDatabases,
  WORKSPACE_DATABASE_TEMPLATES,
} from "../utils/workspace-database-templates";
import { assertWorkspaceAccess } from "../utils/workspace-access";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "workspace";

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(2).max(48).optional(),
  icon: z.string().max(32, "Ícone inválido.").optional(),
  description: z.string().max(500).optional(),
  databases: z
    .array(z.enum(WORKSPACE_DATABASE_TEMPLATES))
    .min(1, "Escolhe pelo menos uma base de dados."),
});

const updateWorkspaceSchema = z
  .object({
    name: z.string().min(1).max(80).optional(),
    icon: z.string().max(32, "Ícone inválido.").optional().nullable(),
    description: z.string().max(500).optional().nullable(),
    addDatabases: z.array(z.enum(WORKSPACE_DATABASE_TEMPLATES)).optional(),
    removeDatabases: z
      .array(z.enum(WORKSPACE_DATABASE_TEMPLATES))
      .optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.icon !== undefined ||
      data.description !== undefined ||
      (data.addDatabases !== undefined && data.addDatabases.length > 0) ||
      (data.removeDatabases !== undefined && data.removeDatabases.length > 0),
    { message: "Nenhum campo para atualizar." }
  );

export class WorkspaceService {
  constructor(private prisma: PrismaClient) {}

  parseCreate(raw: unknown) {
    return createWorkspaceSchema.parse(raw);
  }

  parseUpdate(raw: unknown) {
    return updateWorkspaceSchema.parse(raw);
  }

  async listForUser(userId: string) {
    const owned = await this.prisma.workspace.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        updatedAt: true,
      },
    });

    const memberOf = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            updatedAt: true,
          },
        },
      },
    });

    const byId = new Map<string, (typeof owned)[0]>();
    for (const w of owned) byId.set(w.id, w);
    for (const m of memberOf) byId.set(m.workspace.id, m.workspace);

    return [...byId.values()];
  }

  async create(userId: string, payload: z.infer<typeof createWorkspaceSchema>) {
    const baseSlug = payload.slug ?? slugify(payload.name);
    let slug = baseSlug;
    let n = 0;
    while (
      await this.prisma.workspace.findFirst({
        where: { ownerId: userId, slug },
      })
    ) {
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    const workspace = await this.prisma.$transaction(
      async (tx) => {
      const ws = await tx.workspace.create({
        data: {
          name: payload.name,
          slug,
          icon: payload.icon,
          description: payload.description,
          ownerId: userId,
          members: {
            create: { userId, role: "OWNER" },
          },
        },
      });

      const home = await tx.page.create({
        data: {
          workspaceId: ws.id,
          title: "Início",
          icon: "🏠",
          createdById: userId,
        },
      });

      await tx.block.createMany({
        data: [
          {
            pageId: home.id,
            type: "HEADING_1",
            sortOrder: 0,
            content: { text: "Bem-vindo ao LifeOS" },
          },
          {
            pageId: home.id,
            type: "PARAGRAPH",
            sortOrder: 1,
            content: {
              text: "Este é o teu espaço. Cria páginas, blocos e databases para organizar a tua vida.",
            },
          },
        ],
      });

      await provisionWorkspaceDatabases(tx, ws.id, payload.databases);

      return ws;
      },
      {
        maxWait: 15_000,
        timeout: 30_000,
      }
    );

    return workspace;
  }

  async getById(userId: string, workspaceId: string) {
    await assertWorkspaceAccess(this.prisma, userId, workspaceId, "VIEWER");
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        pages: {
          where: { isArchived: false, parentId: null },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            icon: true,
            sortOrder: true,
          },
        },
        databases: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, icon: true, template: true },
        },
      },
    });
    if (!workspace) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Espaço não encontrado.",
      });
    }
    return workspace;
  }

  async update(
    userId: string,
    workspaceId: string,
    payload: z.infer<typeof updateWorkspaceSchema>
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, ownerId: true, slug: true, name: true },
    });

    if (!workspace) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Espaço não encontrado.",
      });
    }

    if (workspace.ownerId !== userId) {
      const member = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId },
        },
      });
      if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
        throw new AppError(403, {
          code: "FORBIDDEN",
          message: "Sem permissão para editar este espaço.",
        });
      }
    }

    let slug = workspace.slug;
    if (payload.name !== undefined && payload.name !== workspace.name) {
      const baseSlug = slugify(payload.name);
      slug = baseSlug;
      let n = 0;
      while (
        await this.prisma.workspace.findFirst({
          where: {
            ownerId: workspace.ownerId,
            slug,
            NOT: { id: workspaceId },
          },
        })
      ) {
        n += 1;
        slug = `${baseSlug}-${n}`;
      }
    }

    const hasMeta =
      payload.name !== undefined ||
      payload.icon !== undefined ||
      payload.description !== undefined;
    const toAdd = payload.addDatabases ?? [];
    const toRemove = payload.removeDatabases ?? [];

    return this.prisma.$transaction(
      async (tx) => {
        if (toRemove.length > 0 || toAdd.length > 0) {
          const dbs = await tx.database.findMany({
            where: { workspaceId },
            select: { template: true, name: true },
          });
          const current = inferTemplatesFromDatabases(dbs);

          for (const t of toRemove) {
            if (!current.includes(t)) {
              throw new AppError(400, {
                code: "VALIDATION_ERROR",
                message: `A base «${t}» não está activa neste espaço.`,
              });
            }
          }

          const afterRemove = current.filter((t) => !toRemove.includes(t));
          const after = new Set([...afterRemove, ...toAdd]);
          if (after.size < 1) {
            throw new AppError(400, {
              code: "VALIDATION_ERROR",
              message: "O espaço tem de manter pelo menos uma base de dados.",
            });
          }
        }

        if (hasMeta) {
          await tx.workspace.update({
            where: { id: workspaceId },
            data: {
              name: payload.name,
              slug: payload.name !== undefined ? slug : undefined,
              icon: payload.icon,
              description: payload.description,
            },
          });
        }

        if (toRemove.length > 0) {
          await removeWorkspaceDatabases(tx, workspaceId, toRemove);
        }

        if (toAdd.length > 0) {
          await provisionWorkspaceDatabases(tx, workspaceId, toAdd);
        }

        return tx.workspace.findUniqueOrThrow({
          where: { id: workspaceId },
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            description: true,
            updatedAt: true,
          },
        });
      },
      { maxWait: 15_000, timeout: 30_000 }
    );
  }

  async remove(userId: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, ownerId: true },
    });

    if (!workspace) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Espaço não encontrado.",
      });
    }

    if (workspace.ownerId !== userId) {
      throw new AppError(403, {
        code: "FORBIDDEN",
        message: "Apenas o proprietário pode apagar este espaço.",
      });
    }

    await this.prisma.workspace.delete({ where: { id: workspaceId } });
  }
}
