import { normalizeHabitRpgArea } from "../gamification/habit-areas";
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
  CaseActionPayload,
  CaseActionPreview,
  CaseActionProposalPhase,
  CaseActionTool,
  CompleteHabitActionPayload,
  CreateAccountActionPayload,
  CreateGoalActionPayload,
  CreateHabitActionPayload,
  CreateMovementActionPayload,
} from "./case-action-types";
import { financeSnapshotFromContext } from "./case-context";
import type { CaseAppMode, CaseContextSnapshot } from "./case-types";

export type DetectedCaseAction = {
  tool: CaseActionTool;
  phase: CaseActionProposalPhase;
  preview: CaseActionPreview;
  form?: ReturnType<typeof buildHabitFormFields>;
  payload: CaseActionPayload;
  assistantHint: string;
};

function norm(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function extractName(raw: string): string | null {
  const quoted =
    raw.match(/["«]([^"»]+)["»]/)?.[1]?.trim() ??
    raw.match(/\bnome\s+(.+?)(?:\.|$)/i)?.[1]?.trim() ??
    raw.match(/\bchamad[oa]\s+(.+?)(?:\.|$)/i)?.[1]?.trim();
  if (!quoted) return null;
  return quoted.replace(/\s+(conta|habito|hábito|meta)$/i, "").trim().slice(0, 80) || null;
}

function extractAmount(raw: string): number | null {
  const m =
    raw.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:€|eur|euros?)?/i) ??
    raw.match(/(?:€|eur)\s*(\d+(?:[.,]\d{1,2})?)/i);
  if (!m?.[1]) return null;
  const n = Number.parseFloat(m[1].replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function accountTypeFromText(q: string): CreateAccountActionPayload["type"] {
  if (/poupan|savings/.test(q)) return "SAVINGS";
  if (/cartao|cartão|credito|crédito/.test(q)) return "CREDIT_CARD";
  if (/invest/.test(q)) return "INVESTMENT";
  if (/emprest|loan|divida|dívida/.test(q)) return "LOAN";
  return "CHECKING";
}

function extractHabitTitle(message: string): string | null {
  const named = extractName(message);
  if (named) return named;
  const stripped = message
    .replace(/.*(?:habito|hábito)\s+/i, "")
    .replace(/^(?:de|para|chamad[oa]|como\s+feito)\s+/i, "")
    .trim()
    .slice(0, 80);
  return stripped.length >= 2 ? stripped : null;
}

function extractHabitQueryForComplete(message: string): string | null {
  const patterns = [
    /(?:marc(?:a|ar)|regist(?:a|ar))\s+(?:o\s+)?(?:habito|hábito)\s+(.+?)(?:\.|$)/i,
    /(?:completei|fiz)\s+(?:o\s+)?(?:habito|hábito)?\s*(.+?)(?:\.|$)/i,
    /(?:habito|hábito)\s+(.+?)\s+(?:feito|completo)/i,
    /(?:habito|hábito)\s+(.+?)(?:\.|$)/i,
  ];
  for (const re of patterns) {
    const m = message.match(re);
    if (m?.[1]?.trim()) {
      return m[1].replace(/^["«]|["»]$/g, "").trim().slice(0, 80);
    }
  }
  return extractHabitTitle(message);
}

function movementTypeFromText(q: string): "EXPENSE" | "INCOME" {
  return /receita|entrada|ganh|salario|salário|vencimento/.test(q) ? "INCOME" : "EXPENSE";
}

function formHint(title: string) {
  return `Preciso de alguns detalhes — **preenche os campos abaixo** e revê o resumo antes de ${title}.`;
}

export function detectCaseActionIntent(
  message: string,
  ctx: CaseContextSnapshot,
  mode: CaseAppMode
): DetectedCaseAction | null {
  const q = norm(message);
  const financeSnap = financeSnapshotFromContext(ctx.finance);

  if (
    (mode === "finance" || /despesa|receita|movimento|financ/.test(q)) &&
    /regist(?:a|ar)|adicion(?:a|ar)|lanç(?:a|ar)|anot(?:a|ar)/.test(q) &&
    /(?:despesa|receita|movimento|gast|pag)/.test(q)
  ) {
    if (!ctx.finance.enabled || financeSnap.accounts.length === 0) return null;
    const type = movementTypeFromText(q);
    const amount = extractAmount(message);
    const accountId =
      financeSnap.accounts.length === 1 ? financeSnap.accounts[0]!.id : "";
    const draft: Partial<CreateMovementActionPayload> = {
      type,
      amount: amount ?? undefined,
      accountId,
      date: todayIso(),
    };

    const needsForm =
      needsFinanceAccountPick(financeSnap) || amount == null || !accountId;

    if (needsForm) {
      return {
        tool: "finance.create_movement",
        phase: "form",
        form: buildMovementFormFields(financeSnap, draft),
        payload: {
          type,
          accountId: accountId || financeSnap.accounts[0]!.id,
          amount: amount ?? 0,
          date: todayIso(),
        },
        preview: { title: "Registar movimento", fields: [] },
        assistantHint: formHint("registar o movimento"),
      };
    }

    const payload: CreateMovementActionPayload = {
      type,
      accountId,
      amount: amount!,
      date: todayIso(),
    };
    return {
      tool: "finance.create_movement",
      phase: "summary",
      payload,
      preview: movementPreview(financeSnap, payload, ctx.finance.currency),
      assistantHint: "Preparei este movimento — **confirma abaixo** para o registar.",
    };
  }

  if (
    (mode === "finance" || /meta|financ/.test(q)) &&
    /cri(?:ar|a)\s+(?:uma?\s+)?meta|nova\s+meta/.test(q)
  ) {
    if (!ctx.finance.enabled || financeSnap.accounts.length === 0) return null;
    const name = extractName(message) ?? "";
    const amount = extractAmount(message);
    const draft: Partial<CreateGoalActionPayload> = {
      name: name || "",
      targetAmount: amount ?? undefined,
      targetAccountId: financeSnap.accounts[0]?.id ?? "",
    };

    if (!name || amount == null || needsFinanceAccountPick(financeSnap)) {
      return {
        tool: "finance.create_goal",
        phase: "form",
        form: buildGoalFormFields(financeSnap, draft),
        payload: {
          name: name || "",
          targetAmount: amount ?? 0,
          targetAccountId: draft.targetAccountId ?? "",
        },
        preview: { title: "Criar meta", fields: [] },
        assistantHint: formHint("criar a meta"),
      };
    }

    const payload: CreateGoalActionPayload = {
      name,
      targetAmount: amount,
      targetAccountId: financeSnap.accounts[0]!.id,
    };
    return {
      tool: "finance.create_goal",
      phase: "summary",
      payload,
      preview: goalPreview(financeSnap, payload, ctx.finance.currency),
      assistantHint: "Preparei esta meta — **confirma abaixo** para a registar.",
    };
  }

  if (
    (mode === "finance" || /conta|financ/.test(q)) &&
    /cri(?:ar|a)\s+(?:uma?\s+)?conta|nova\s+conta/.test(q)
  ) {
    if (!ctx.finance.enabled) return null;
    const name = extractName(message) ?? "";
    const type = accountTypeFromText(q);
    const hasName = name.length >= 2;

    if (!hasName) {
      return {
        tool: "finance.create_account",
        phase: "form",
        form: buildAccountFormFields({ name: "", type, initialBalance: 0 }, ctx.finance.currency),
        payload: { name: "", type, initialBalance: 0 },
        preview: { title: "Criar conta financeira", fields: [] },
        assistantHint: formHint("criar a conta"),
      };
    }

    const payload: CreateAccountActionPayload = { name, type, initialBalance: 0 };
    return {
      tool: "finance.create_account",
      phase: "summary",
      payload,
      preview: accountPreview(payload, ctx.finance.currency),
      assistantHint:
        "Preparei a criação desta conta — **confirma abaixo** para a registar em Finanças.",
    };
  }

  if (
    (mode === "focus" || /habito|hábito/.test(q)) &&
    /(?:marc(?:a|ar|ado)|regist(?:a|ar)|completei|fiz)\s+.*(?:habito|hábito)|(?:habito|hábito).*(?:feito|completo)/.test(
      q
    )
  ) {
    if (ctx.focus.habitsCatalog.length === 0) return null;
    const query = extractHabitQueryForComplete(message);
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
        tool: "focus.complete_habit",
        phase: "summary",
        payload,
        preview: completeHabitPreview(ctx.focus, payload),
        assistantHint: `Posso marcar **${h.title}** como feito hoje — confirma abaixo.`,
      };
    }

    const draft: Partial<CompleteHabitActionPayload> = {
      rowId: matches[0]?.rowId ?? "",
    };
    return {
      tool: "focus.complete_habit",
      phase: "form",
      form: buildCompleteHabitFormFields(ctx.focus, draft),
      payload: {
        rowId: draft.rowId ?? "",
        databaseId: matches[0]?.databaseId ?? "",
        workspaceId: matches[0]?.workspaceId ?? "",
        title: matches[0]?.title ?? "",
      },
      preview: { title: "Marcar hábito", fields: [] },
      assistantHint:
        matches.length > 1
          ? "Encontrei vários hábitos — **escolhe qual** marcar como feito."
          : "Escolhe o hábito a marcar como feito hoje.",
    };
  }

  if (
    (mode === "focus" || /habito|hábito/.test(q)) &&
    /cri(?:ar|a)\s+(?:um?\s+)?(?:habito|hábito)|novo\s+(?:habito|hábito)/.test(q)
  ) {
    const spaces = habitSpaces(ctx.focus);
    if (spaces.length === 0) return null;

    const title = extractHabitTitle(message);
    const areaExplicit = message.match(/\b(?:area|área)\s+(\w+)/i)?.[1];
    const frequencyExplicit = /semanal/i.test(message);
    const area = areaExplicit ? normalizeHabitRpgArea(areaExplicit) : null;
    const frequency = frequencyExplicit ? ("Semanal" as const) : null;

    if (needsHabitForm(ctx.focus)) {
      const draft: Partial<CreateHabitActionPayload> = {
        title: title ?? "",
        frequency: frequency ?? "Diário",
        area: area ?? "Geral",
        workspaceId: spaces.length === 1 ? spaces[0]!.id : "",
      };
      return {
        tool: "focus.create_habit",
        phase: "form",
        form: buildHabitFormFields(ctx.focus, draft),
        payload: {
          workspaceId: draft.workspaceId ?? "",
          databaseId: "",
          title: draft.title ?? "",
          frequency: draft.frequency ?? "Diário",
          area: draft.area ?? "Geral",
        },
        preview: { title: "Criar hábito", fields: [] },
        assistantHint:
          "Tens vários Espaços — **escolhe o destino e completa os campos**. No fim mostro um resumo para confirmares.",
      };
    }

    if (!title) return null;

    const ws = spaces[0]!;
    const payload: CreateHabitActionPayload = {
      workspaceId: ws.id,
      databaseId: ws.habitsDatabaseId!,
      title,
      frequency: frequency ?? "Diário",
      area: area ?? "Geral",
    };
    return {
      tool: "focus.create_habit",
      phase: "summary",
      payload,
      preview: habitPreview(ctx.focus, payload),
      assistantHint:
        "Posso criar este hábito na tua base — **confirma abaixo** para o adicionar.",
    };
  }

  return null;
}
