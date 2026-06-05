import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";

import { AppError } from "../middlewares/error.middleware";
import { clientFinanceLinksForRows } from "../finance/finance-client-links";
import type { FinanceIncomeSuggestion } from "../finance/finance-income-suggestion";
import type { GamificationFeedbackPayload } from "../gamification/feedback";
import type { ActivityService } from "./activity.service";
import {
  isRelationValidationError,
  syncWorkspaceRelations,
  validateRelationProperties,
} from "../utils/database-relations";
import { createCustomDatabase } from "../utils/create-custom-database";
import { applyRowPoints } from "../utils/points";
import { assertWorkspaceAccess } from "../utils/workspace-access";

const createDatabaseSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(80),
  icon: z.string().trim().max(32).optional(),
});

const createRowSchema = z.object({
  properties: z.record(z.unknown()).optional(),
});

const updateRowSchema = z.object({
  properties: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

type PropertyShape = {
  id: string;
  type: string;
  config: unknown;
};

function defaultValueForProperty(prop: PropertyShape): unknown {
  const config = prop.config as { options?: string[] };
  switch (prop.type) {
    case "CHECKBOX":
      return false;
    case "NUMBER":
      return null;
    case "STATUS":
    case "SELECT":
      return config.options?.[0] ?? "";
    case "MULTI_SELECT":
      return [];
    case "DATE":
      return null;
    case "RELATION":
      return null;
    default:
      return "";
  }
}

function buildDefaultProperties(properties: PropertyShape[]) {
  const out: Record<string, unknown> = {};
  for (const prop of properties) {
    out[prop.id] = defaultValueForProperty(prop);
  }
  if (properties[0]?.type === "TEXT") {
    out[properties[0].id] = "";
  }
  return out;
}

export class DatabaseService {
  constructor(
    private prisma: PrismaClient,
    private activity?: ActivityService
  ) {}

  parseCreateDatabase(raw: unknown) {
    return createDatabaseSchema.parse(raw);
  }

  parseCreateRow(raw: unknown) {
    return createRowSchema.parse(raw);
  }

  parseUpdateRow(raw: unknown) {
    return updateRowSchema.parse(raw);
  }

  private async getDatabaseOrThrow(databaseId: string) {
    const db = await this.prisma.database.findUnique({
      where: { id: databaseId },
      select: { id: true, workspaceId: true, template: true },
    });
    if (!db) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Base de dados não encontrada.",
      });
    }
    return db;
  }

  async create(
    workspaceId: string,
    userId: string,
    payload: z.infer<typeof createDatabaseSchema>
  ) {
    await assertWorkspaceAccess(this.prisma, userId, workspaceId, "MEMBER");

    const database = await createCustomDatabase(this.prisma, workspaceId, {
      name: payload.name,
      icon: payload.icon,
    });

    return {
      id: database.id,
      name: database.name,
      icon: database.icon,
      template: database.template,
      updatedAt: database.updatedAt,
    };
  }

  async list(workspaceId: string, userId: string) {
    await assertWorkspaceAccess(this.prisma, userId, workspaceId, "VIEWER");
    return this.prisma.database.findMany({
      where: { workspaceId },
      orderBy: [{ template: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        icon: true,
        template: true,
        updatedAt: true,
      },
    });
  }

  async getById(databaseId: string, userId: string) {
    const db = await this.getDatabaseOrThrow(databaseId);
    await assertWorkspaceAccess(this.prisma, userId, db.workspaceId, "VIEWER");

    if (db.template === "TASKS") {
      await syncWorkspaceRelations(this.prisma, db.workspaceId);
    }

    const database = await this.prisma.database.findUnique({
      where: { id: databaseId },
      include: {
        properties: { orderBy: { sortOrder: "asc" } },
        views: { orderBy: { sortOrder: "asc" } },
        rows: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!database) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Base de dados não encontrada.",
      });
    }

    let rowActivity:
      | Record<string, import("../utils/habit-stats").HabitRowStats>
      | undefined;

    if (database.template === "HABITS" && this.activity) {
      const freqProp = database.properties.find(
        (p) => p.name === "Frequência" || p.name === "Frequencia"
      );
      const rowIds = database.rows.map((r) => r.id);
      const doneSet = await this.activity.getHabitDoneTodaySet(userId);
      const activityMap = await this.activity.getHabitRowActivityBatch(
        database.rows.map((r) => ({
          id: r.id,
          frequencyValue: freqProp
            ? (r.properties as Record<string, unknown>)[freqProp.id]
            : "Diário",
        })),
        doneSet
      );
      rowActivity = {};
      for (const id of rowIds) {
        rowActivity[id] = activityMap.get(id) ?? {
          streak: 0,
          bestStreak: 0,
          doneToday: doneSet.has(id),
          frequency: "daily",
          consistency: 0,
          completionRate: 0,
          activeDays: 0,
          heatmap: [],
        };
      }

      database.rows = database.rows.map((row) => ({
        ...row,
        properties: this.activity!.normalizeHabitValues(
          database.properties,
          row.properties as Record<string, unknown>,
          doneSet.has(row.id)
        ) as Prisma.JsonValue,
      }));
    }

    let clientFinanceLinks:
      | Record<
          string,
          {
            rowId: string;
            clientName: string;
            movementId: string;
            amount: number;
            date: string;
          }
        >
      | undefined;

    if (database.template === "CLIENTS") {
      const rowIds = database.rows.map((r) => r.id);
      clientFinanceLinks = await clientFinanceLinksForRows(
        this.prisma,
        userId,
        rowIds,
        database.workspaceId,
        database.id
      );
    }

    return { ...database, rowActivity, clientFinanceLinks };
  }

  async createRow(
    databaseId: string,
    userId: string,
    payload: z.infer<typeof createRowSchema>
  ) {
    const db = await this.getDatabaseOrThrow(databaseId);
    await assertWorkspaceAccess(this.prisma, userId, db.workspaceId, "MEMBER");

    const database = await this.prisma.database.findUnique({
      where: { id: databaseId },
      select: { template: true },
    });

    const properties = await this.prisma.databaseProperty.findMany({
      where: { databaseId },
      orderBy: { sortOrder: "asc" },
    });

    const max = await this.prisma.databaseRow.aggregate({
      where: { databaseId },
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;

    const defaults = buildDefaultProperties(properties);
    let merged = { ...defaults, ...payload.properties };
    merged = applyRowPoints(database!.template, properties, merged);

    try {
      await validateRelationProperties(
        this.prisma,
        db.workspaceId,
        properties,
        merged
      );
    } catch (e) {
      if (isRelationValidationError(e)) {
        throw new AppError(400, {
          code: "VALIDATION_ERROR",
          message: "Relação inválida — a linha ligada não existe.",
        });
      }
      throw e;
    }

    const created = await this.prisma.databaseRow.create({
      data: {
        databaseId,
        properties: merged as Prisma.InputJsonValue,
        sortOrder,
      },
      include: {
        database: { select: { workspaceId: true, template: true } },
      },
    });

    let gamification: GamificationFeedbackPayload | null = null;
    let financeSuggestion: FinanceIncomeSuggestion | null = null;
    if (this.activity) {
      const activity = await this.activity.applyRowActivity(
        userId,
        created,
        properties,
        merged,
        defaults
      );
      gamification = activity.gamification;
      financeSuggestion = activity.financeSuggestion;
    }

    return { row: created, gamification, financeSuggestion };
  }

  async updateRow(
    rowId: string,
    userId: string,
    payload: z.infer<typeof updateRowSchema>
  ) {
    const row = await this.prisma.databaseRow.findUnique({
      where: { id: rowId },
      include: {
        database: {
          select: {
            workspaceId: true,
            template: true,
            properties: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });
    if (!row) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Linha não encontrada.",
      });
    }
    await assertWorkspaceAccess(
      this.prisma,
      userId,
      row.database.workspaceId,
      "MEMBER"
    );

    const properties = row.database.properties;
    const current =
      typeof row.properties === "object" && row.properties !== null
        ? (row.properties as Record<string, unknown>)
        : {};

    let merged = payload.properties
      ? { ...current, ...payload.properties }
      : current;

    if (payload.properties) {
      merged = applyRowPoints(
        row.database.template,
        properties,
        merged,
        current
      );
    }

    if (payload.properties) {
      try {
        await validateRelationProperties(
          this.prisma,
          row.database.workspaceId,
          properties,
          merged
        );
      } catch (e) {
        if (isRelationValidationError(e)) {
          throw new AppError(400, {
            code: "VALIDATION_ERROR",
            message: "Relação inválida — a linha ligada não existe.",
          });
        }
        throw e;
      }
    }

    const updated = await this.prisma.databaseRow.update({
      where: { id: rowId },
      data: {
        sortOrder: payload.sortOrder,
        properties: payload.properties
          ? (merged as Prisma.InputJsonValue)
          : undefined,
      },
      include: {
        database: { select: { workspaceId: true, template: true } },
      },
    });

    let gamification: GamificationFeedbackPayload | null = null;
    let financeSuggestion: FinanceIncomeSuggestion | null = null;
    if (payload.properties && this.activity) {
      const activity = await this.activity.applyRowActivity(
        userId,
        updated,
        properties,
        merged,
        current
      );
      gamification = activity.gamification;
      financeSuggestion = activity.financeSuggestion;
    }

    return { row: updated, gamification, financeSuggestion };
  }

  async deleteRow(rowId: string, userId: string) {
    const row = await this.prisma.databaseRow.findUnique({
      where: { id: rowId },
      include: { database: true },
    });
    if (!row) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Linha não encontrada.",
      });
    }
    await assertWorkspaceAccess(
      this.prisma,
      userId,
      row.database.workspaceId,
      "MEMBER"
    );
    await this.prisma.databaseRow.delete({ where: { id: rowId } });
  }
}
