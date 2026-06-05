import { normalizeHabitRpgArea } from "../gamification/habit-areas";
import type { DetectedCaseAction } from "./case-action-intent";
import {
  accountPreview,
  buildAccountFormFields,
  buildCompleteHabitFormFields,
  buildGoalFormFields,
  buildHabitFormFields,
  buildMovementFormFields,
  completeHabitPreview,
  goalPreview,
  habitPreview,
  habitSpaces,
  matchHabits,
  movementPreview,
  needsFinanceAccountPick,
  needsHabitForm,
  todayIso,
} from "./case-action-form";
import type {
  CaseActionTool,
  CompleteHabitActionPayload,
  CreateAccountActionPayload,
  CreateGoalActionPayload,
  CreateHabitActionPayload,
  CreateMovementActionPayload,
} from "./case-action-types";
import { financeSnapshotFromContext } from "./case-context";
import type { CaseAppMode, CaseContextSnapshot, CaseFinanceSnapshot } from "./case-types";
import { LLM_TOOL_TO_CASE } from "./case-llm-tools";

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function resolveAccount(finance: CaseFinanceSnapshot, name?: string) {
  if (!name?.trim()) {
    return finance.accounts.length === 1 ? finance.accounts[0]!.id : "";
  }
  const q = norm(name);
  const exact = finance.accounts.find((a) => norm(a.name) === q);
  if (exact) return exact.id;
  const partial = finance.accounts.find(
    (a) => norm(a.name).includes(q) || q.includes(norm(a.name))
  );
  return partial?.id ?? "";
}

function resolveCategory(
  finance: CaseFinanceSnapshot,
  type: "EXPENSE" | "INCOME",
  name?: string
) {
  if (!name?.trim()) return undefined;
  const q = norm(name);
  const list = type === "EXPENSE" ? finance.expenseCategories : finance.incomeCategories;
  return list.find((c) => norm(c.name).includes(q) || q.includes(norm(c.name)))?.id;
}

function resolveWorkspace(focus: CaseContextSnapshot["focus"], name?: string) {
  const spaces = habitSpaces(focus);
  if (!name?.trim()) {
    return spaces.length === 1 ? spaces[0]! : null;
  }
  const q = norm(name);
  return (
    spaces.find((w) => norm(w.name).includes(q) || q.includes(norm(w.name))) ??
    (spaces.length === 1 ? spaces[0]! : null)
  );
}

function formHint(title: string) {
  return `Preparei esta acção — **preenche os campos** e confirma para ${title}.`;
}

export function buildActionFromLlmTool(
  llmToolName: string,
  rawArgs: string,
  ctx: CaseContextSnapshot,
  _mode: CaseAppMode
): DetectedCaseAction | null {
  const tool = LLM_TOOL_TO_CASE[llmToolName];
  if (!tool) return null;

  let args: Record<string, unknown>;
  try {
    args = JSON.parse(rawArgs) as Record<string, unknown>;
  } catch {
    return null;
  }

  const financeSnap = financeSnapshotFromContext(ctx.finance);
  const cur = ctx.finance.currency;

  switch (tool) {
    case "finance.create_account": {
      const name = String(args.name ?? "").trim().slice(0, 80);
      const type = (args.type as CreateAccountActionPayload["type"]) ?? "CHECKING";
      const initialBalance = Number(args.initialBalance ?? 0) || 0;
      if (!name) {
        return {
          tool,
          phase: "form",
          form: buildAccountFormFields({ name: "", type, initialBalance }, cur),
          payload: { name: "", type, initialBalance },
          preview: { title: "Criar conta financeira", fields: [] },
          assistantHint: formHint("criar a conta"),
        };
      }
      const payload: CreateAccountActionPayload = { name, type, initialBalance };
      return {
        tool,
        phase: "summary",
        payload,
        preview: accountPreview(payload, cur),
        assistantHint:
          "A IA propôs criar esta conta — **confirma abaixo** para a registar em Finanças.",
      };
    }

    case "finance.create_movement": {
      if (!ctx.finance.enabled || financeSnap.accounts.length === 0) return null;
      const type = (args.type as "EXPENSE" | "INCOME") ?? "EXPENSE";
      const amount = Number(args.amount);
      const accountId = resolveAccount(financeSnap, String(args.accountName ?? ""));
      const categoryId = resolveCategory(financeSnap, type, String(args.categoryName ?? ""));
      const note = args.note ? String(args.note).slice(0, 200) : undefined;
      const draft: Partial<CreateMovementActionPayload> = {
        type,
        amount: Number.isFinite(amount) ? amount : undefined,
        accountId,
        date: todayIso(),
        categoryId,
        note,
      };

      if (!Number.isFinite(amount) || amount <= 0 || !accountId || needsFinanceAccountPick(financeSnap)) {
        return {
          tool,
          phase: "form",
          form: buildMovementFormFields(financeSnap, draft),
          payload: {
            type,
            accountId: accountId || financeSnap.accounts[0]!.id,
            amount: Number.isFinite(amount) ? amount : 0,
            date: todayIso(),
            categoryId,
            note,
          },
          preview: { title: "Registar movimento", fields: [] },
          assistantHint: formHint("registar o movimento"),
        };
      }

      const payload: CreateMovementActionPayload = {
        type,
        accountId,
        amount,
        date: todayIso(),
        categoryId,
        note,
      };
      return {
        tool,
        phase: "summary",
        payload,
        preview: movementPreview(financeSnap, payload, cur),
        assistantHint:
          "A IA propôs este movimento — **confirma abaixo** para o registar.",
      };
    }

    case "finance.create_goal": {
      if (!ctx.finance.enabled || financeSnap.accounts.length === 0) return null;
      const name = String(args.name ?? "").trim().slice(0, 80);
      const targetAmount = Number(args.targetAmount);
      const targetAccountId =
        resolveAccount(financeSnap, String(args.accountName ?? "")) ||
        financeSnap.accounts[0]?.id ||
        "";
      const deadline = args.deadline ? String(args.deadline).slice(0, 10) : undefined;
      const draft: Partial<CreateGoalActionPayload> = {
        name,
        targetAmount: Number.isFinite(targetAmount) ? targetAmount : undefined,
        targetAccountId,
        deadline,
      };

      if (!name || !Number.isFinite(targetAmount) || targetAmount <= 0 || needsFinanceAccountPick(financeSnap)) {
        return {
          tool,
          phase: "form",
          form: buildGoalFormFields(financeSnap, draft),
          payload: {
            name: name || "",
            targetAmount: Number.isFinite(targetAmount) ? targetAmount : 0,
            targetAccountId,
            deadline,
          },
          preview: { title: "Criar meta", fields: [] },
          assistantHint: formHint("criar a meta"),
        };
      }

      const payload: CreateGoalActionPayload = { name, targetAmount, targetAccountId, deadline };
      return {
        tool,
        phase: "summary",
        payload,
        preview: goalPreview(financeSnap, payload, cur),
        assistantHint: "A IA propôs esta meta — **confirma abaixo** para a registar.",
      };
    }

    case "focus.create_habit": {
      const spaces = habitSpaces(ctx.focus);
      if (spaces.length === 0) return null;
      const title = String(args.title ?? "").trim().slice(0, 80);
      const ws = resolveWorkspace(ctx.focus, String(args.workspaceName ?? ""));
      const frequency = (args.frequency as "Diário" | "Semanal") ?? "Diário";
      const area = args.area
        ? normalizeHabitRpgArea(String(args.area))
        : normalizeHabitRpgArea("Saúde");
      const workspaceId = ws?.id ?? spaces[0]!.id;
      const databaseId =
        ws?.habitsDatabaseId ?? spaces.find((s) => s.id === workspaceId)?.habitsDatabaseId ?? "";

      if (!title || needsHabitForm(ctx.focus) || !databaseId) {
        const draft: Partial<CreateHabitActionPayload> = {
          title: title || "",
          workspaceId,
          databaseId,
          frequency,
          area,
        };
        return {
          tool,
          phase: "form",
          form: buildHabitFormFields(ctx.focus, draft),
          payload: {
            title: title || "",
            workspaceId,
            databaseId: databaseId || "",
            frequency,
            area,
          },
          preview: { title: "Criar hábito", fields: [] },
          assistantHint: formHint("criar o hábito"),
        };
      }

      const payload: CreateHabitActionPayload = {
        title,
        workspaceId,
        databaseId,
        frequency,
        area,
      };
      return {
        tool,
        phase: "summary",
        payload,
        preview: habitPreview(ctx.focus, payload),
        assistantHint: "A IA propôs este hábito — **confirma abaixo** para o criar.",
      };
    }

    case "focus.complete_habit": {
      if (ctx.focus.habitsCatalog.length === 0) return null;
      const query = String(args.habitTitle ?? "").trim();
      const matches = query ? matchHabits(ctx.focus, query) : [];

      if (matches.length === 1) {
        const h = matches[0]!;
        const payload: CompleteHabitActionPayload = {
          rowId: h.rowId,
          databaseId: h.databaseId,
          workspaceId: h.workspaceId,
          title: h.title,
        };
        return {
          tool,
          phase: "summary",
          payload,
          preview: completeHabitPreview(ctx.focus, payload),
          assistantHint: `A IA propôs marcar **${h.title}** como feito — confirma abaixo.`,
        };
      }

      return {
        tool,
        phase: "form",
        form: buildCompleteHabitFormFields(ctx.focus, { rowId: matches[0]?.rowId ?? "" }),
        payload: {
          rowId: matches[0]?.rowId ?? "",
          databaseId: matches[0]?.databaseId ?? "",
          workspaceId: matches[0]?.workspaceId ?? "",
          title: matches[0]?.title ?? "",
        },
        preview: { title: "Marcar hábito", fields: [] },
        assistantHint:
          matches.length > 1
            ? "Encontrei vários hábitos — **escolhe qual** marcar como feito."
            : formHint("marcar o hábito"),
      };
    }

    default:
      return null;
  }
}

export function caseToolAllowedInMode(tool: CaseActionTool, mode: CaseAppMode): boolean {
  if (tool.startsWith("finance.")) return mode === "finance" || mode === "focus";
  if (tool.startsWith("focus.")) return mode === "focus" || mode === "game";
  return true;
}
