import type { Prisma, PrismaClient } from "@prisma/client";

import { HABIT_RPG_AREA_OPTIONS } from "../gamification/habit-areas";
import {
  syncWorkspaceRelations,
} from "./database-relations";
import {
  WEEKLY_PLANNING_DATABASE_NAME,
  type WorkspaceDatabaseTemplate,
} from "./workspace-database-templates";

type DbClient = PrismaClient | Prisma.TransactionClient;

const include = {
  properties: { orderBy: { sortOrder: "asc" as const } },
};

/** Database Tarefas (template TASKS). */
export async function ensureTasksDatabase(
  prisma: DbClient,
  workspaceId: string
) {
  const existing = await prisma.database.findFirst({
    where: { workspaceId, template: "TASKS" },
    include,
  });
  if (existing) return existing;

  return prisma.database.create({
    data: {
      workspaceId,
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
    include,
  });
}

/** Garante database Hábitos no workspace (criação ou workspaces antigos sem template). */
export async function ensureHabitsDatabase(
  prisma: DbClient,
  workspaceId: string
) {
  const existing = await prisma.database.findFirst({
    where: { workspaceId, template: "HABITS" },
    include,
  });
  if (existing) return existing;

  return prisma.database.create({
    data: {
      workspaceId,
      name: "Hábitos",
      icon: "◎",
      template: "HABITS",
      properties: {
        create: [
          { name: "Hábito", type: "TEXT", sortOrder: 0 },
          {
            name: "Frequência",
            type: "SELECT",
            sortOrder: 1,
            config: { options: ["Diário", "Semanal"] },
          },
          {
            name: "Área RPG",
            type: "SELECT",
            sortOrder: 2,
            config: { options: [...HABIT_RPG_AREA_OPTIONS] },
          },
          { name: "Pontos", type: "NUMBER", sortOrder: 3 },
          { name: "Feito hoje", type: "CHECKBOX", sortOrder: 4 },
        ],
      },
      views: {
        create: [
          { name: "Lista", type: "LIST", sortOrder: 0 },
          { name: "Tabela", type: "TABLE", sortOrder: 1 },
        ],
      },
    },
    include,
  });
}

/** Database Clientes (pipeline comercial → Finanças no RPG). */
export async function ensureClientsDatabase(
  prisma: DbClient,
  workspaceId: string
) {
  const existing = await prisma.database.findFirst({
    where: { workspaceId, template: "CLIENTS" },
    include,
  });
  if (existing) return existing;

  return prisma.database.create({
    data: {
      workspaceId,
      name: "Clientes",
      icon: "💼",
      template: "CLIENTS",
      properties: {
        create: [
          { name: "Cliente", type: "TEXT", sortOrder: 0 },
          {
            name: "Estado",
            type: "STATUS",
            sortOrder: 1,
            config: {
              options: ["Lead", "Negociação", "Fechado"],
            },
          },
          { name: "Valor (€)", type: "NUMBER", sortOrder: 2 },
          { name: "Pontos", type: "NUMBER", sortOrder: 3 },
          { name: "Data fecho", type: "DATE", sortOrder: 4 },
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

/** Database Projetos para relações com tarefas. */
export async function ensureProjectsDatabase(
  prisma: DbClient,
  workspaceId: string
) {
  const existing = await prisma.database.findFirst({
    where: { workspaceId, template: "PROJECTS" },
    include,
  });
  if (existing) return existing;

  return prisma.database.create({
    data: {
      workspaceId,
      name: "Projetos",
      icon: "◇",
      template: "PROJECTS",
      properties: {
        create: [
          { name: "Projeto", type: "TEXT", sortOrder: 0 },
          {
            name: "Estado",
            type: "SELECT",
            sortOrder: 1,
            config: { options: ["Activo", "Pausado", "Concluído"] },
          },
        ],
      },
      views: {
        create: [{ name: "Tabela", type: "TABLE", sortOrder: 0 }],
      },
    },
    include,
  });
}

/** @deprecated Use syncWorkspaceRelations */
export async function ensureTaskProjectRelation(
  prisma: DbClient,
  workspaceId: string
) {
  await syncWorkspaceRelations(prisma, workspaceId);
}

/** Database Objetivos (metas de vida / OKRs pessoais). */
export async function ensureGoalsDatabase(
  prisma: DbClient,
  workspaceId: string
) {
  const existing = await prisma.database.findFirst({
    where: { workspaceId, template: "GOALS" },
    include,
  });
  if (existing) return existing;

  return prisma.database.create({
    data: {
      workspaceId,
      name: "Objetivos",
      icon: "🎯",
      template: "GOALS",
      properties: {
        create: [
          { name: "Objetivo", type: "TEXT", sortOrder: 0 },
          {
            name: "Estado",
            type: "STATUS",
            sortOrder: 1,
            config: {
              options: ["Não iniciado", "Em progresso", "Atingido"],
            },
          },
          {
            name: "Área",
            type: "SELECT",
            sortOrder: 2,
            config: {
              options: ["Saúde", "Carreira", "Finanças", "Pessoal", "Outro"],
            },
          },
          { name: "Prazo", type: "DATE", sortOrder: 3 },
          {
            name: "Prioridade",
            type: "SELECT",
            sortOrder: 4,
            config: { options: ["Alta", "Média", "Baixa"] },
          },
          { name: "Progresso %", type: "NUMBER", sortOrder: 5 },
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

/** Planeamento semanal (template CUSTOM, nome fixo). */
export async function ensureWeeklyPlanningDatabase(
  prisma: DbClient,
  workspaceId: string
) {
  const existing = await prisma.database.findFirst({
    where: { workspaceId, name: WEEKLY_PLANNING_DATABASE_NAME },
    include,
  });
  if (existing) return existing;

  return prisma.database.create({
    data: {
      workspaceId,
      name: WEEKLY_PLANNING_DATABASE_NAME,
      icon: "📅",
      template: "CUSTOM",
      properties: {
        create: [
          { name: "Semana", type: "TEXT", sortOrder: 0 },
          {
            name: "Foco principal",
            type: "TEXT",
            sortOrder: 1,
          },
          {
            name: "Estado",
            type: "STATUS",
            sortOrder: 2,
            config: {
              options: ["Planeado", "Em curso", "Concluído"],
            },
          },
          { name: "Prioridade", type: "SELECT", sortOrder: 3, config: { options: ["Alta", "Média", "Baixa"] } },
          { name: "Notas", type: "TEXT", sortOrder: 4 },
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

/** Cria as bases seleccionadas que ainda não existem no espaço. */
export async function provisionWorkspaceDatabases(
  prisma: DbClient,
  workspaceId: string,
  templates: WorkspaceDatabaseTemplate[]
) {
  const selected = new Set(templates);

  if (selected.has("TASKS")) {
    await ensureTasksDatabase(prisma, workspaceId);
  }
  if (selected.has("HABITS")) {
    await ensureHabitsDatabase(prisma, workspaceId);
  }
  if (selected.has("GOALS")) {
    await ensureGoalsDatabase(prisma, workspaceId);
  }
  if (selected.has("STUDIES")) {
    await ensureStudiesDatabase(prisma, workspaceId);
  }
  if (selected.has("CLIENTS")) {
    await ensureClientsDatabase(prisma, workspaceId);
  }
  if (selected.has("PROJECTS")) {
    await ensureProjectsDatabase(prisma, workspaceId);
  }
  if (selected.has("WEEKLY_PLANNING")) {
    await ensureWeeklyPlanningDatabase(prisma, workspaceId);
  }

  await syncWorkspaceRelations(prisma, workspaceId);
}

/** Apaga bases do espaço pelos templates (dados incluídos). */
export async function removeWorkspaceDatabases(
  prisma: DbClient,
  workspaceId: string,
  templates: WorkspaceDatabaseTemplate[]
) {
  const toRemove = [...new Set(templates)];
  if (toRemove.length === 0) return;

  for (const template of toRemove) {
    if (template === "WEEKLY_PLANNING") {
      await prisma.database.deleteMany({
        where: { workspaceId, name: WEEKLY_PLANNING_DATABASE_NAME },
      });
      continue;
    }
    await prisma.database.deleteMany({
      where: { workspaceId, template },
    });
  }

  await syncWorkspaceRelations(prisma, workspaceId);
}

export async function ensureStudiesDatabase(
  prisma: DbClient,
  workspaceId: string
) {
  const existing = await prisma.database.findFirst({
    where: { workspaceId, template: "STUDIES" },
    include,
  });
  if (existing) return existing;

  return prisma.database.create({
    data: {
      workspaceId,
      name: "Estudos",
      icon: "📚",
      template: "STUDIES",
      properties: {
        create: [
          { name: "Disciplina", type: "TEXT", sortOrder: 0 },
          { name: "Tópico", type: "TEXT", sortOrder: 1 },
          {
            name: "Estado",
            type: "STATUS",
            sortOrder: 2,
            config: {
              options: ["A estudar", "Em revisão", "Dominado"],
            },
          },
          { name: "Data exame", type: "DATE", sortOrder: 3 },
          {
            name: "Prioridade",
            type: "SELECT",
            sortOrder: 4,
            config: { options: ["Alta", "Média", "Baixa"] },
          },
          { name: "Minutos", type: "NUMBER", sortOrder: 5 },
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
    include,
  });
}
