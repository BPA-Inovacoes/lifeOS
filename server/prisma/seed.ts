import { Prisma, PrismaClient, UserRole } from "@prisma/client";

import { ActivityService } from "../services/activity.service";
import { env } from "../utils/env";
import { hashPassword } from "../utils/password";
import { ensurePointsProperties } from "../utils/ensure-points-properties";
import { ensureDatabaseViews } from "../utils/ensure-views";
import { ensureHabitsDatabase } from "../utils/ensure-workspace-databases";
import { suggestHabitPoints, suggestTaskPoints } from "../utils/points";

const DEV_EMAIL = "xavier@bpa.com";
const DEV_PASSWORD = "xavier123";

const prisma = new PrismaClient();

async function seedSampleRows(
  tasksDb: { id: string; properties: { id: string; type: string }[] },
  habitsDb: { id: string; properties: { id: string; type: string }[] }
) {
  const taskCount = await prisma.databaseRow.count({
    where: { databaseId: tasksDb.id },
  });
  if (taskCount === 0) {
    const title = tasksDb.properties.find((p) => p.type === "TEXT")!;
    const status = tasksDb.properties.find((p) => p.type === "STATUS")!;
    const priority = tasksDb.properties.find((p) => p.name === "Prioridade");
    const points = tasksDb.properties.find((p) => p.name === "Pontos");
    const date = tasksDb.properties.find((p) => p.type === "DATE");

    const focus = tasksDb.properties.find((p) => p.name === "Foco hoje");

    const row = (
      t: string,
      st: string,
      pr: string,
      d: string | null,
      foco = false
    ) => {
      const props: Record<string, unknown> = {
        [title.id]: t,
        [status.id]: st,
      };
      if (priority) props[priority.id] = pr;
      if (points) props[points.id] = suggestTaskPoints(pr);
      if (focus) props[focus.id] = foco;
      if (date) props[date.id] = d;
      return props as Prisma.InputJsonValue;
    };

    await prisma.databaseRow.createMany({
      data: [
        {
          databaseId: tasksDb.id,
          sortOrder: 0,
          properties: row(
            "Revisar objetivos da semana",
            "Em progresso",
            "Alta",
            new Date().toISOString().slice(0, 10),
            true
          ),
        },
      ],
    });
  }

  const habitCount = await prisma.databaseRow.count({
    where: { databaseId: habitsDb.id },
  });
  if (habitCount === 0) {
    const name = habitsDb.properties.find((p) => p.type === "TEXT")!;
    const freq = habitsDb.properties.find(
      (p) => p.name === "Frequência" || p.type === "SELECT"
    )!;
    const points = habitsDb.properties.find((p) => p.name === "Pontos");
    const done = habitsDb.properties.find(
      (p) => p.type === "CHECKBOX" && p.name.toLowerCase().includes("feito")
    )!;

    const habitRow = (title: string, frequency: string, isDone: boolean) => {
      const props: Record<string, unknown> = {
        [name.id]: title,
        [freq.id]: frequency,
        [done.id]: isDone,
      };
      if (points) props[points.id] = suggestHabitPoints(frequency);
      return props as Prisma.InputJsonValue;
    };

    await prisma.databaseRow.createMany({
      data: [
        {
          databaseId: habitsDb.id,
          sortOrder: 0,
          properties: habitRow("Meditar 10 min", "Diário", true),
        },
        {
          databaseId: habitsDb.id,
          sortOrder: 1,
          properties: habitRow("Treino", "Diário", false),
        },
        {
          databaseId: habitsDb.id,
          sortOrder: 2,
          properties: habitRow("Leitura", "Diário", false),
        },
      ],
    });
  }
}

async function main() {
  const passwordHash = await hashPassword(DEV_PASSWORD);

  const user = await prisma.user.upsert({
    where: { email: DEV_EMAIL },
    update: {
      passwordHash,
      name: "Xavier",
      role: UserRole.ADMIN,
    },
    create: {
      email: DEV_EMAIL,
      passwordHash,
      name: "Xavier",
      role: UserRole.ADMIN,
    },
  });

  let ws = await prisma.workspace.findFirst({
    where: { ownerId: user.id, slug: "pessoal" },
  });

  if (!ws) {
    ws = await prisma.workspace.create({
      data: {
        name: "Pessoal",
        slug: "pessoal",
        icon: "briefcase",
        ownerId: user.id,
        members: { create: { userId: user.id, role: "OWNER" } },
      },
    });

    const home = await prisma.page.create({
      data: {
        workspaceId: ws.id,
        title: "Início",
        icon: "🏠",
        createdById: user.id,
      },
    });

    await prisma.block.createMany({
      data: [
        {
          pageId: home.id,
          type: "HEADING_1",
          sortOrder: 0,
          content: { text: "LifeOS" },
        },
        {
          pageId: home.id,
          type: "PARAGRAPH",
          sortOrder: 1,
          content: {
            text: "O teu sistema operacional pessoal. Organiza páginas, tarefas e hábitos num só lugar.",
          },
        },
      ],
    });

    await prisma.database.create({
      data: {
        workspaceId: ws.id,
        name: "Tarefas",
        icon: "✓",
        template: "TASKS",
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
            {
              name: "Prioridade",
              type: "SELECT",
              sortOrder: 2,
              config: { options: ["Alta", "Média", "Baixa"] },
            },
            { name: "Pontos", type: "NUMBER", sortOrder: 3 },
            { name: "Foco hoje", type: "CHECKBOX", sortOrder: 4 },
            { name: "Data limite", type: "DATE", sortOrder: 5 },
          ],
        },
        views: {
          create: [
            { name: "Tabela", type: "TABLE", sortOrder: 0 },
            { name: "Quadro", type: "BOARD", sortOrder: 1 },
            { name: "Calendário", type: "CALENDAR", sortOrder: 2 },
          ],
        },
      },
    });
  }

  await ensurePointsProperties(prisma);
  await ensureDatabaseViews(prisma);

  const tasksDb = await prisma.database.findFirst({
    where: { workspaceId: ws.id, template: "TASKS" },
    include: { properties: { orderBy: { sortOrder: "asc" } } },
  });

  const habitsDb = await ensureHabitsDatabase(prisma, ws.id);

  if (env.SEED_DEMO && tasksDb) {
    await seedSampleRows(tasksDb, habitsDb);
  }

  const activity = new ActivityService(prisma);
  await activity.backfillFromRows(user.id);
  if (env.SEED_DEMO) {
    await activity.seedDemoWeeklyHistory(user.id);
  }

  console.log(`LifeOS — acesso: ${DEV_EMAIL} / ${DEV_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
