import type { CaseActionTool } from "./case-action-types";

/** Definições OpenAI-compatible para tool calling (C2). */
export const CASE_LLM_TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "finance_create_account",
      description: "Propor criar uma conta financeira. Requer confirmação do utilizador.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nome da conta" },
          type: {
            type: "string",
            enum: ["CHECKING", "SAVINGS", "CREDIT_CARD", "INVESTMENT", "LOAN", "OTHER"],
          },
          initialBalance: { type: "number", description: "Saldo inicial (default 0)" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "finance_create_movement",
      description: "Propor registar receita ou despesa. Requer confirmação.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["EXPENSE", "INCOME"] },
          amount: { type: "number" },
          accountName: { type: "string", description: "Nome parcial da conta" },
          categoryName: { type: "string", description: "Categoria (opcional)" },
          note: { type: "string" },
        },
        required: ["type", "amount"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "finance_create_goal",
      description: "Propor criar meta de poupança. Requer confirmação.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          targetAmount: { type: "number" },
          accountName: { type: "string", description: "Conta destino (opcional)" },
          deadline: { type: "string", description: "YYYY-MM-DD opcional" },
        },
        required: ["name", "targetAmount"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "focus_create_habit",
      description: "Propor criar hábito num Espaço. Requer confirmação.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          workspaceName: { type: "string", description: "Nome do Espaço (se vários)" },
          frequency: { type: "string", enum: ["Diário", "Semanal"] },
          area: { type: "string", description: "Área RPG: Saúde, Mente, etc." },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "focus_complete_habit",
      description: "Propor marcar hábito como feito hoje. Requer confirmação.",
      parameters: {
        type: "object",
        properties: {
          habitTitle: { type: "string", description: "Título parcial do hábito" },
        },
        required: ["habitTitle"],
      },
    },
  },
];

export const LLM_TOOL_TO_CASE: Record<string, CaseActionTool> = {
  finance_create_account: "finance.create_account",
  finance_create_movement: "finance.create_movement",
  finance_create_goal: "finance.create_goal",
  focus_create_habit: "focus.create_habit",
  focus_complete_habit: "focus.complete_habit",
};
