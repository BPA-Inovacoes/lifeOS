import type { PrismaClient } from "@prisma/client";

import { findProp } from "../utils/points";

export type ClientFinanceLink = {
  rowId: string;
  clientName: string;
  movementId: string;
  amount: number;
  date: string;
  workspaceId: string;
  databaseId: string;
};

export type ClientFinanceLinkPublic = {
  rowId: string;
  clientName: string;
  movementId: string;
  amount: number;
  date: string;
  workspaceId: string;
  databaseId: string;
};

function clientNameFromProperties(
  properties: { id: string; name: string; type: string }[],
  rowProps: Record<string, unknown>
): string {
  const nameProp =
    findProp(properties, "Cliente") ??
    findProp(properties, "Nome") ??
    findProp(properties, "Título");
  if (!nameProp) return "Cliente";
  const raw = rowProps[nameProp.id];
  const name = raw != null ? String(raw).trim() : "";
  return name || "Cliente";
}

export async function loadClientFinanceLinkMap(
  prisma: PrismaClient,
  userId: string
): Promise<Map<string, ClientFinanceLink>> {
  const movements = await prisma.financeMovement.findMany({
    where: { userId, linkedClientRowId: { not: null }, type: "INCOME" },
    select: {
      id: true,
      linkedClientRowId: true,
      amount: true,
      date: true,
    },
  });

  const rowIds = [
    ...new Set(
      movements
        .map((m) => m.linkedClientRowId)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    ),
  ];

  if (!rowIds.length) return new Map();

  const rows = await prisma.databaseRow.findMany({
    where: { id: { in: rowIds } },
    include: {
      database: {
        select: {
          id: true,
          workspaceId: true,
          template: true,
          properties: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  const rowById = new Map(rows.map((r) => [r.id, r]));
  const map = new Map<string, ClientFinanceLink>();

  for (const m of movements) {
    const rowId = m.linkedClientRowId;
    if (!rowId) continue;
    const row = rowById.get(rowId);
    if (!row || row.database.template !== "CLIENTS") continue;

    const props = row.database.properties;
    const rowProps = row.properties as Record<string, unknown>;
    map.set(rowId, {
      rowId,
      clientName: clientNameFromProperties(props, rowProps),
      movementId: m.id,
      amount: Math.round(Number(m.amount) * 100) / 100,
      date: m.date.toISOString().slice(0, 10),
      workspaceId: row.database.workspaceId,
      databaseId: row.database.id,
    });
  }

  return map;
}

export async function clientFinanceLinksForRows(
  prisma: PrismaClient,
  userId: string,
  rowIds: string[],
  workspaceId: string,
  databaseId: string
): Promise<Record<string, Omit<ClientFinanceLink, "workspaceId" | "databaseId">>> {
  if (!rowIds.length) return {};

  const map = await loadClientFinanceLinkMap(prisma, userId);
  const out: Record<string, Omit<ClientFinanceLink, "workspaceId" | "databaseId">> = {};

  for (const rowId of rowIds) {
    const link = map.get(rowId);
    if (!link || link.workspaceId !== workspaceId || link.databaseId !== databaseId) continue;
    out[rowId] = {
      rowId: link.rowId,
      clientName: link.clientName,
      movementId: link.movementId,
      amount: link.amount,
      date: link.date,
    };
  }

  return out;
}
