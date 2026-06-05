import type { PrismaClient } from "@prisma/client";

import type { DatabaseService } from "../services/database.service";
import type { FinanceService } from "../services/finance.service";
import { AppError } from "../middlewares/error.middleware";
import type {
  CaseActionPayload,
  CaseActionTool,
  CompleteHabitActionPayload,
  CreateAccountActionPayload,
  CreateGoalActionPayload,
  CreateHabitActionPayload,
  CreateMovementActionPayload,
} from "./case-action-types";

type Deps = {
  prisma: PrismaClient;
  finance: FinanceService;
  database: DatabaseService;
};

export async function executeCaseAction(
  deps: Deps,
  userId: string,
  tool: CaseActionTool,
  payload: CaseActionPayload
): Promise<string> {
  switch (tool) {
    case "finance.create_account":
      return executeCreateAccount(deps, userId, payload as CreateAccountActionPayload);
    case "finance.create_movement":
      return executeCreateMovement(deps, userId, payload as CreateMovementActionPayload);
    case "finance.create_goal":
      return executeCreateGoal(deps, userId, payload as CreateGoalActionPayload);
    case "focus.create_habit":
      return executeCreateHabit(deps, userId, payload as CreateHabitActionPayload);
    case "focus.complete_habit":
      return executeCompleteHabit(deps, userId, payload as CompleteHabitActionPayload);
    default:
      throw new AppError(400, {
        code: "VALIDATION_ERROR",
        message: "Acção Case desconhecida.",
      });
  }
}

async function executeCreateAccount(
  deps: Deps,
  userId: string,
  payload: CreateAccountActionPayload
) {
  const input = deps.finance.parseCreateAccount({
    name: payload.name,
    type: payload.type,
    initialBalance: payload.initialBalance,
  });
  const account = await deps.finance.createAccount(userId, input);
  return `Conta **${account.name}** criada (${account.type}, saldo ${account.balance} ${account.currency}).`;
}

async function executeCreateMovement(
  deps: Deps,
  userId: string,
  payload: CreateMovementActionPayload
) {
  const input = deps.finance.parseCreateMovement({
    type: payload.type,
    accountId: payload.accountId,
    amount: payload.amount,
    date: payload.date,
    categoryId: payload.categoryId,
    note: payload.note,
  });
  const { movement } = await deps.finance.createMovement(userId, input);
  const label = payload.type === "INCOME" ? "Receita" : "Despesa";
  return `${label} de **${movement.amount}** registada (${movement.accountName}).`;
}

async function executeCreateGoal(
  deps: Deps,
  userId: string,
  payload: CreateGoalActionPayload
) {
  const input = deps.finance.parseCreateGoal({
    name: payload.name,
    targetAmount: payload.targetAmount,
    targetAccountId: payload.targetAccountId,
    deadline: payload.deadline,
  });
  await deps.finance.createGoal(userId, input);
  return `Meta **${payload.name}** criada (alvo ${payload.targetAmount}).`;
}

async function executeCreateHabit(
  deps: Deps,
  userId: string,
  payload: CreateHabitActionPayload
) {
  const db = await deps.prisma.database.findFirst({
    where: {
      id: payload.databaseId,
      workspaceId: payload.workspaceId,
      template: "HABITS",
    },
    include: { properties: { orderBy: { sortOrder: "asc" } } },
  });
  if (!db) {
    throw new AppError(404, {
      code: "NOT_FOUND",
      message: "Base de hábitos não encontrada.",
    });
  }

  const byName = Object.fromEntries(db.properties.map((p) => [p.name, p.id]));
  const habitProp = byName["Hábito"];
  if (!habitProp) {
    throw new AppError(500, {
      code: "INTERNAL_ERROR",
      message: "Base de hábitos inválida.",
    });
  }

  const properties: Record<string, unknown> = {
    [habitProp]: payload.title,
  };
  if (byName["Frequência"]) properties[byName["Frequência"]] = payload.frequency;
  if (byName["Área RPG"]) properties[byName["Área RPG"]] = payload.area;
  if (byName["Feito hoje"]) properties[byName["Feito hoje"]] = false;

  await deps.database.createRow(payload.databaseId, userId, { properties });
  return `Hábito **${payload.title}** criado (${payload.frequency}, área ${payload.area}).`;
}

async function executeCompleteHabit(
  deps: Deps,
  userId: string,
  payload: CompleteHabitActionPayload
) {
  const row = await deps.prisma.databaseRow.findFirst({
    where: { id: payload.rowId },
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
  if (!row || row.database.template !== "HABITS") {
    throw new AppError(404, {
      code: "NOT_FOUND",
      message: "Hábito não encontrado.",
    });
  }

  const byName = Object.fromEntries(row.database.properties.map((p) => [p.name, p.id]));
  const doneProp = byName["Feito hoje"];
  if (!doneProp) {
    throw new AppError(500, {
      code: "INTERNAL_ERROR",
      message: "Base de hábitos inválida.",
    });
  }

  await deps.database.updateRow(payload.rowId, userId, {
    properties: { [doneProp]: true },
  });
  return `Hábito **${payload.title}** marcado como feito hoje.`;
}
