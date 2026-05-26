import type { PrismaClient } from "@prisma/client";

export async function ensureDatabaseViews(prisma: PrismaClient) {
  const databases = await prisma.database.findMany({
    include: { views: true },
  });

  for (const db of databases) {
    const types = new Set(db.views.map((v) => v.type));
    const maxSort = Math.max(...db.views.map((v) => v.sortOrder), -1);
    let next = maxSort + 1;

    if (db.template === "TASKS" && !types.has("CALENDAR")) {
      await prisma.databaseView.create({
        data: {
          databaseId: db.id,
          name: "Calendário",
          type: "CALENDAR",
          sortOrder: next++,
        },
      });
    }

    if (db.template === "HABITS" && !types.has("LIST")) {
      await prisma.databaseView.create({
        data: {
          databaseId: db.id,
          name: "Lista",
          type: "LIST",
          sortOrder: 0,
        },
      });
    }

    if (db.template === "HABITS" && !types.has("TABLE")) {
      await prisma.databaseView.create({
        data: {
          databaseId: db.id,
          name: "Tabela",
          type: "TABLE",
          sortOrder: next++,
        },
      });
    }

    if (db.template === "GOALS" && !types.has("BOARD")) {
      await prisma.databaseView.create({
        data: {
          databaseId: db.id,
          name: "Quadro",
          type: "BOARD",
          sortOrder: next++,
        },
      });
    }

    if (db.template === "STUDIES" && !types.has("CALENDAR")) {
      await prisma.databaseView.create({
        data: {
          databaseId: db.id,
          name: "Calendário",
          type: "CALENDAR",
          sortOrder: next++,
        },
      });
    }

    if (db.template === "STUDIES" && !types.has("BOARD")) {
      await prisma.databaseView.create({
        data: {
          databaseId: db.id,
          name: "Quadro",
          type: "BOARD",
          sortOrder: next++,
        },
      });
    }
  }
}
