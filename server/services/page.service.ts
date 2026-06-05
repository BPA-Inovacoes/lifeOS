import { BlockType, Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";

import { AppError } from "../middlewares/error.middleware";
import { assertWorkspaceAccess } from "../utils/workspace-access";

const createPageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  icon: z.string().trim().max(32).optional(),
  parentId: z.string().cuid().optional(),
});

const updatePageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  icon: z.string().trim().max(32).nullable().optional(),
  parentId: z.string().cuid().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export class PageService {
  constructor(private prisma: PrismaClient) {}

  parseCreate(raw: unknown) {
    return createPageSchema.parse(raw);
  }

  parseUpdate(raw: unknown) {
    return updatePageSchema.parse(raw);
  }

  async list(workspaceId: string, userId: string) {
    await assertWorkspaceAccess(this.prisma, userId, workspaceId, "VIEWER");
    return this.prisma.page.findMany({
      where: { workspaceId, isArchived: false },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        parentId: true,
        title: true,
        icon: true,
        sortOrder: true,
        updatedAt: true,
      },
    });
  }

  async create(
    workspaceId: string,
    userId: string,
    payload: z.infer<typeof createPageSchema>
  ) {
    await assertWorkspaceAccess(this.prisma, userId, workspaceId, "MEMBER");

    if (payload.parentId) {
      const parent = await this.prisma.page.findFirst({
        where: { id: payload.parentId, workspaceId },
      });
      if (!parent) {
        throw new AppError(400, {
          code: "VALIDATION_ERROR",
          message: "Página pai inválida.",
        });
      }
    }

    const page = await this.prisma.page.create({
      data: {
        workspaceId,
        parentId: payload.parentId,
        title: payload.title ?? "Sem título",
        icon: payload.icon,
        createdById: userId,
      },
    });

    await this.prisma.block.create({
      data: {
        pageId: page.id,
        type: "PARAGRAPH",
        sortOrder: 0,
        content: { text: "" },
      },
    });

    return page;
  }

  async getWithBlocks(pageId: string, userId: string) {
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
      include: {
        blocks: { orderBy: { sortOrder: "asc" } },
        workspace: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!page) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Página não encontrada.",
      });
    }

    await assertWorkspaceAccess(
      this.prisma,
      userId,
      page.workspaceId,
      "VIEWER"
    );

    return page;
  }

  async update(pageId: string, userId: string, payload: z.infer<typeof updatePageSchema>) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Página não encontrada.",
      });
    }
    await assertWorkspaceAccess(this.prisma, userId, page.workspaceId, "MEMBER");

    return this.prisma.page.update({
      where: { id: pageId },
      data: payload,
    });
  }

  async remove(pageId: string, userId: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Página não encontrada.",
      });
    }
    await assertWorkspaceAccess(this.prisma, userId, page.workspaceId, "MEMBER");

    await this.prisma.page.delete({ where: { id: pageId } });
    return { workspaceId: page.workspaceId };
  }
}

const createBlockSchema = z.object({
  type: z.nativeEnum(BlockType),
  content: z.record(z.unknown()).optional(),
  parentId: z.string().cuid().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const updateBlockSchema = z.object({
  type: z.nativeEnum(BlockType).optional(),
  content: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const reorderBlocksSchema = z.object({
  blockIds: z.array(z.string().cuid()).min(1),
});

export class BlockService {
  constructor(private prisma: PrismaClient) {}

  parseCreate(raw: unknown) {
    return createBlockSchema.parse(raw);
  }

  parseUpdate(raw: unknown) {
    return updateBlockSchema.parse(raw);
  }

  parseReorder(raw: unknown) {
    return reorderBlocksSchema.parse(raw);
  }

  private async getPageForUser(pageId: string, userId: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Página não encontrada.",
      });
    }
    await assertWorkspaceAccess(this.prisma, userId, page.workspaceId, "MEMBER");
    return page;
  }

  async create(pageId: string, userId: string, payload: z.infer<typeof createBlockSchema>) {
    await this.getPageForUser(pageId, userId);
    const max = await this.prisma.block.aggregate({
      where: { pageId },
      _max: { sortOrder: true },
    });
    const sortOrder = payload.sortOrder ?? (max._max.sortOrder ?? -1) + 1;

    return this.prisma.block.create({
      data: {
        pageId,
        parentId: payload.parentId,
        type: payload.type,
        content: (payload.content ?? {}) as Prisma.InputJsonValue,
        sortOrder,
      },
    });
  }

  async update(blockId: string, userId: string, payload: z.infer<typeof updateBlockSchema>) {
    const block = await this.prisma.block.findUnique({
      where: { id: blockId },
      include: { page: true },
    });
    if (!block) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Bloco não encontrado.",
      });
    }
    await assertWorkspaceAccess(
      this.prisma,
      userId,
      block.page.workspaceId,
      "MEMBER"
    );

    return this.prisma.block.update({
      where: { id: blockId },
      data: {
        type: payload.type,
        content: payload.content as Prisma.InputJsonValue | undefined,
        sortOrder: payload.sortOrder,
      },
    });
  }

  async remove(blockId: string, userId: string) {
    const block = await this.prisma.block.findUnique({
      where: { id: blockId },
      include: { page: true },
    });
    if (!block) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Bloco não encontrado.",
      });
    }
    await assertWorkspaceAccess(
      this.prisma,
      userId,
      block.page.workspaceId,
      "MEMBER"
    );
    await this.prisma.block.delete({ where: { id: blockId } });
  }

  async reorder(
    pageId: string,
    userId: string,
    payload: z.infer<typeof reorderBlocksSchema>
  ) {
    await this.getPageForUser(pageId, userId);

    const blocks = await this.prisma.block.findMany({
      where: { pageId },
      select: { id: true },
    });
    const existing = new Set(blocks.map((b) => b.id));
    if (
      payload.blockIds.length !== blocks.length ||
      payload.blockIds.some((id) => !existing.has(id))
    ) {
      throw new AppError(400, {
        code: "VALIDATION_ERROR",
        message: "Lista de blocos inválida para reordenar.",
      });
    }

    await this.prisma.$transaction(
      payload.blockIds.map((id, sortOrder) =>
        this.prisma.block.update({
          where: { id },
          data: { sortOrder },
        })
      )
    );

    return this.prisma.block.findMany({
      where: { pageId },
      orderBy: { sortOrder: "asc" },
    });
  }
}
