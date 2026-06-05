import { HABIT_RPG_AREA_OPTIONS, normalizeHabitRpgArea } from "../gamification/habit-areas";
import type {
  CaseActionFormField,
  CaseActionPreview,
  CaseActionTool,
  CompleteHabitActionPayload,
  CreateAccountActionPayload,
  CreateGoalActionPayload,
  CreateHabitActionPayload,
  CreateMovementActionPayload,
} from "./case-action-types";
import type { CaseFinanceSnapshot, CaseFocusContext } from "./case-types";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CHECKING: "Conta à ordem",
  SAVINGS: "Poupança",
  CREDIT_CARD: "Cartão de crédito",
  INVESTMENT: "Investimento",
  LOAN: "Empréstimo / dívida",
  OTHER: "Outra",
};

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  EXPENSE: "Despesa",
  INCOME: "Receita",
};

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function habitSpaces(focus: CaseFocusContext) {
  return focus.workspacesWithHabits.filter((w) => w.habitsDatabaseId);
}

export function needsHabitForm(focus: CaseFocusContext) {
  return habitSpaces(focus).length > 1;
}

export function needsFinanceAccountPick(finance: CaseFinanceSnapshot) {
  return finance.accounts.length > 1;
}

function accountLabel(finance: CaseFinanceSnapshot, accountId: string) {
  return finance.accounts.find((a) => a.id === accountId)?.name ?? accountId;
}

function categoryLabel(
  finance: CaseFinanceSnapshot,
  type: "EXPENSE" | "INCOME",
  categoryId?: string
) {
  if (!categoryId) return "—";
  const list =
    type === "EXPENSE" ? finance.expenseCategories : finance.incomeCategories;
  return list.find((c) => c.id === categoryId)?.name ?? categoryId;
}

function workspaceName(focus: CaseFocusContext, workspaceId: string) {
  return habitSpaces(focus).find((w) => w.id === workspaceId)?.name ?? "Espaço";
}

export function buildHabitFormFields(
  focus: CaseFocusContext,
  values: Partial<CreateHabitActionPayload>
): CaseActionFormField[] {
  const spaces = habitSpaces(focus);
  const fields: CaseActionFormField[] = [];

  if (spaces.length > 1) {
    fields.push({
      key: "workspaceId",
      label: "Espaço",
      type: "select",
      value: values.workspaceId ?? "",
      required: true,
      options: spaces.map((w) => ({ value: w.id, label: w.name })),
    });
  }

  fields.push(
    {
      key: "title",
      label: "Hábito",
      type: "text",
      value: values.title ?? "",
      required: true,
    },
    {
      key: "frequency",
      label: "Frequência",
      type: "select",
      value: values.frequency ?? "Diário",
      required: true,
      options: [
        { value: "Diário", label: "Diário" },
        { value: "Semanal", label: "Semanal" },
      ],
    },
    {
      key: "area",
      label: "Área RPG",
      type: "select",
      value: values.area ?? "Geral",
      required: true,
      options: HABIT_RPG_AREA_OPTIONS.map((a) => ({ value: a, label: a })),
    }
  );

  return fields;
}

export function buildAccountFormFields(
  values: Partial<CreateAccountActionPayload>,
  currency: string
): CaseActionFormField[] {
  return [
    {
      key: "name",
      label: "Nome",
      type: "text",
      value: values.name ?? "",
      required: true,
    },
    {
      key: "type",
      label: "Tipo",
      type: "select",
      value: values.type ?? "CHECKING",
      required: true,
      options: Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: "initialBalance",
      label: "Saldo inicial",
      type: "number",
      value: String(values.initialBalance ?? 0),
      required: false,
    },
    {
      key: "currency",
      label: "Moeda",
      type: "text",
      value: currency,
      required: false,
      readOnly: true,
    },
  ];
}

export function buildMovementFormFields(
  finance: CaseFinanceSnapshot,
  values: Partial<CreateMovementActionPayload>
): CaseActionFormField[] {
  const type = values.type ?? "EXPENSE";
  const categories =
    type === "INCOME" ? finance.incomeCategories : finance.expenseCategories;

  return [
    {
      key: "type",
      label: "Tipo",
      type: "select",
      value: type,
      required: true,
      options: [
        { value: "EXPENSE", label: "Despesa" },
        { value: "INCOME", label: "Receita" },
      ],
    },
    {
      key: "amount",
      label: "Valor",
      type: "number",
      value: values.amount != null ? String(values.amount) : "",
      required: true,
    },
    {
      key: "accountId",
      label: "Conta",
      type: "select",
      value: values.accountId || finance.accounts[0]?.id || "",
      required: true,
      options: finance.accounts.map((a) => ({ value: a.id, label: a.name })),
    },
    {
      key: "categoryId",
      label: "Categoria",
      type: "select",
      value: values.categoryId ?? "",
      required: false,
      options: [{ value: "", label: "— Nenhuma —" }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
    },
    {
      key: "date",
      label: "Data",
      type: "text",
      value: values.date ?? todayIso(),
      required: true,
    },
    {
      key: "note",
      label: "Nota",
      type: "text",
      value: values.note ?? "",
      required: false,
    },
  ];
}

export function refreshMovementFormCategories(
  finance: CaseFinanceSnapshot,
  form: CaseActionFormField[]
): CaseActionFormField[] {
  const type = form.find((f) => f.key === "type")?.value === "INCOME" ? "INCOME" : "EXPENSE";
  const categories =
    type === "INCOME" ? finance.incomeCategories : finance.expenseCategories;
  return form.map((f) =>
    f.key === "categoryId"
      ? {
          ...f,
          value: categories.some((c) => c.id === f.value) ? f.value : "",
          options: [
            { value: "", label: "— Nenhuma —" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ],
        }
      : f.key === "type"
        ? f
        : f
  );
}

export function buildGoalFormFields(
  finance: CaseFinanceSnapshot,
  values: Partial<CreateGoalActionPayload>
): CaseActionFormField[] {
  return [
    {
      key: "name",
      label: "Meta",
      type: "text",
      value: values.name ?? "",
      required: true,
    },
    {
      key: "targetAmount",
      label: "Valor alvo",
      type: "number",
      value: values.targetAmount != null ? String(values.targetAmount) : "",
      required: true,
    },
    {
      key: "targetAccountId",
      label: "Conta",
      type: "select",
      value: values.targetAccountId || finance.accounts[0]?.id || "",
      required: true,
      options: finance.accounts.map((a) => ({ value: a.id, label: a.name })),
    },
    {
      key: "deadline",
      label: "Prazo (AAAA-MM-DD)",
      type: "text",
      value: values.deadline ?? "",
      required: false,
    },
  ];
}

export function buildCompleteHabitFormFields(
  focus: CaseFocusContext,
  values: Partial<CompleteHabitActionPayload>
): CaseActionFormField[] {
  const options = focus.habitsCatalog.map((h) => ({
    value: h.rowId,
    label: `${h.title} (${h.workspaceName})`,
  }));

  return [
    {
      key: "rowId",
      label: "Hábito",
      type: "select",
      value: values.rowId ?? "",
      required: true,
      options,
    },
  ];
}

export function habitPreview(
  focus: CaseFocusContext,
  payload: CreateHabitActionPayload
): CaseActionPreview {
  return {
    title: "Resumo — criar hábito",
    fields: [
      { label: "Hábito", value: payload.title },
      { label: "Frequência", value: payload.frequency },
      { label: "Área RPG", value: payload.area },
      { label: "Espaço", value: workspaceName(focus, payload.workspaceId) },
    ],
  };
}

export function accountPreview(
  payload: CreateAccountActionPayload,
  currency: string
): CaseActionPreview {
  return {
    title: "Resumo — criar conta",
    fields: [
      { label: "Nome", value: payload.name },
      { label: "Tipo", value: ACCOUNT_TYPE_LABELS[payload.type] ?? payload.type },
      { label: "Saldo inicial", value: String(payload.initialBalance) },
      { label: "Moeda", value: currency },
    ],
  };
}

export function movementPreview(
  finance: CaseFinanceSnapshot,
  payload: CreateMovementActionPayload,
  currency: string
): CaseActionPreview {
  return {
    title: "Resumo — registar movimento",
    fields: [
      { label: "Tipo", value: MOVEMENT_TYPE_LABELS[payload.type] ?? payload.type },
      { label: "Valor", value: `${payload.amount} ${currency}` },
      { label: "Conta", value: accountLabel(finance, payload.accountId) },
      {
        label: "Categoria",
        value: categoryLabel(finance, payload.type, payload.categoryId),
      },
      { label: "Data", value: payload.date },
      ...(payload.note ? [{ label: "Nota", value: payload.note }] : []),
    ],
  };
}

export function goalPreview(
  finance: CaseFinanceSnapshot,
  payload: CreateGoalActionPayload,
  currency: string
): CaseActionPreview {
  return {
    title: "Resumo — criar meta",
    fields: [
      { label: "Meta", value: payload.name },
      { label: "Valor alvo", value: `${payload.targetAmount} ${currency}` },
      { label: "Conta", value: accountLabel(finance, payload.targetAccountId) },
      ...(payload.deadline ? [{ label: "Prazo", value: payload.deadline }] : []),
    ],
  };
}

export function completeHabitPreview(
  focus: CaseFocusContext,
  payload: CompleteHabitActionPayload
): CaseActionPreview {
  const ws =
    focus.habitsCatalog.find((h) => h.rowId === payload.rowId)?.workspaceName ??
    workspaceName(focus, payload.workspaceId);
  return {
    title: "Resumo — marcar hábito",
    fields: [
      { label: "Hábito", value: payload.title },
      { label: "Espaço", value: ws },
      { label: "Acção", value: "Marcar como feito hoje" },
    ],
  };
}

export function parseHabitFromForm(
  focus: CaseFocusContext,
  fields: Record<string, string>
): CreateHabitActionPayload {
  const spaces = habitSpaces(focus);
  const workspaceId =
    fields.workspaceId?.trim() || (spaces.length === 1 ? spaces[0]!.id : "");
  const ws = spaces.find((w) => w.id === workspaceId);
  if (!ws?.habitsDatabaseId) {
    throw new Error("Escolhe um Espaço com base de hábitos.");
  }
  const title = fields.title?.trim() ?? "";
  if (title.length < 2) {
    throw new Error("Indica o nome do hábito.");
  }
  const frequency = fields.frequency === "Semanal" ? "Semanal" : "Diário";
  const area = normalizeHabitRpgArea(fields.area ?? "Geral");
  return {
    workspaceId: ws.id,
    databaseId: ws.habitsDatabaseId,
    title: title.slice(0, 80),
    frequency,
    area,
  };
}

export function parseAccountFromForm(
  fields: Record<string, string>
): CreateAccountActionPayload {
  const name = fields.name?.trim() ?? "";
  if (!name) throw new Error("Indica o nome da conta.");
  const type = (fields.type ?? "CHECKING") as CreateAccountActionPayload["type"];
  const initialBalance = Number.parseFloat(fields.initialBalance ?? "0");
  return {
    name: name.slice(0, 80),
    type,
    initialBalance: Number.isFinite(initialBalance) ? initialBalance : 0,
  };
}

export function parseMovementFromForm(
  fields: Record<string, string>
): CreateMovementActionPayload {
  const type = fields.type === "INCOME" ? "INCOME" : "EXPENSE";
  const amount = Number.parseFloat(fields.amount ?? "");
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Indica um valor válido.");
  }
  const accountId = fields.accountId?.trim() ?? "";
  if (!accountId) throw new Error("Escolhe uma conta.");
  const date = fields.date?.trim() ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Data inválida (usa AAAA-MM-DD).");
  }
  const categoryId = fields.categoryId?.trim() || undefined;
  const note = fields.note?.trim() || undefined;
  return { type, accountId, amount, date, categoryId, note };
}

export function parseGoalFromForm(fields: Record<string, string>): CreateGoalActionPayload {
  const name = fields.name?.trim() ?? "";
  if (!name) throw new Error("Indica o nome da meta.");
  const targetAmount = Number.parseFloat(fields.targetAmount ?? "");
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    throw new Error("Indica um valor alvo válido.");
  }
  const targetAccountId = fields.targetAccountId?.trim() ?? "";
  if (!targetAccountId) throw new Error("Escolhe uma conta.");
  const deadline = fields.deadline?.trim() || undefined;
  if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    throw new Error("Prazo inválido (usa AAAA-MM-DD).");
  }
  return {
    name: name.slice(0, 80),
    targetAmount,
    targetAccountId,
    deadline,
  };
}

export function parseCompleteHabitFromForm(
  focus: CaseFocusContext,
  fields: Record<string, string>
): CompleteHabitActionPayload {
  const rowId = fields.rowId?.trim() ?? "";
  const entry = focus.habitsCatalog.find((h) => h.rowId === rowId);
  if (!entry) throw new Error("Escolhe um hábito.");
  return {
    rowId: entry.rowId,
    databaseId: entry.databaseId,
    workspaceId: entry.workspaceId,
    title: entry.title,
  };
}

export function validateFormFields(form: CaseActionFormField[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of form) {
    if (f.readOnly) continue;
    const v = f.value.trim();
    if (f.required && !v) {
      throw new Error(`Preenche o campo «${f.label}».`);
    }
    out[f.key] = v;
  }
  return out;
}

export function applyFormValues(
  form: CaseActionFormField[],
  incoming: Record<string, string>
): CaseActionFormField[] {
  return form.map((f) =>
    f.readOnly || incoming[f.key] === undefined ? f : { ...f, value: incoming[f.key]! }
  );
}

export function rebuildProposalFromForm(
  tool: CaseActionTool,
  focus: CaseFocusContext,
  finance: CaseFinanceSnapshot,
  currency: string,
  form: CaseActionFormField[]
): { payload: import("./case-action-types").CaseActionPayload; preview: CaseActionPreview } {
  const values = validateFormFields(form);
  switch (tool) {
    case "focus.create_habit": {
      const payload = parseHabitFromForm(focus, values);
      return { payload, preview: habitPreview(focus, payload) };
    }
    case "finance.create_account": {
      const payload = parseAccountFromForm(values);
      return { payload, preview: accountPreview(payload, currency) };
    }
    case "finance.create_movement": {
      const payload = parseMovementFromForm(values);
      return { payload, preview: movementPreview(finance, payload, currency) };
    }
    case "finance.create_goal": {
      const payload = parseGoalFromForm(values);
      return { payload, preview: goalPreview(finance, payload, currency) };
    }
    case "focus.complete_habit": {
      const payload = parseCompleteHabitFromForm(focus, values);
      return { payload, preview: completeHabitPreview(focus, payload) };
    }
    default:
      throw new Error("Acção desconhecida.");
  }
}

export function matchHabits(focus: CaseFocusContext, query: string) {
  const q = query.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").trim();
  if (!q) return [];
  return focus.habitsCatalog.filter((h) => {
    const t = h.title.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
    return t.includes(q) || q.includes(t);
  });
}

export function formTitleForTool(tool: CaseActionTool) {
  switch (tool) {
    case "finance.create_account":
      return "Criar conta financeira";
    case "finance.create_movement":
      return "Registar movimento";
    case "finance.create_goal":
      return "Criar meta";
    case "focus.create_habit":
      return "Criar hábito";
    case "focus.complete_habit":
      return "Marcar hábito";
    default:
      return "Detalhes";
  }
}

export function summaryTitleForTool(tool: CaseActionTool) {
  switch (tool) {
    case "finance.create_account":
      return "Resumo — criar conta";
    case "finance.create_movement":
      return "Resumo — registar movimento";
    case "finance.create_goal":
      return "Resumo — criar meta";
    case "focus.create_habit":
      return "Resumo — criar hábito";
    case "focus.complete_habit":
      return "Resumo — marcar hábito";
    default:
      return "Resumo";
  }
}
