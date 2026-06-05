import { expect, type APIRequestContext } from "@playwright/test";

export const DEV_EMAIL = "xavier@bpa.com";
export const DEV_PASSWORD = "xavier123";

export type DbProperty = { id: string; name: string; type: string };

export type GameProfile = {
  lifeCoins: number;
  lifetimeCoins: number;
  totalXp: number;
  habitsCompleted: number;
  tasksCompleted: number;
  goalsCompleted: number;
};

export type GameDashboard = {
  profile: GameProfile;
  attributes: { key: string; value: number }[];
  xpDistribution: {
    tasks: number;
    habits: number;
    goals: number;
    studies: number;
    clients: number;
  };
};

function propId(properties: DbProperty[], name: string) {
  const match = properties.find((p) => p.name === name);
  if (!match) {
    throw new Error(`Propriedade «${name}» não encontrada`);
  }
  return match.id;
}

export class LifeosApi {
  constructor(
    private request: APIRequestContext,
    private token: string
  ) {}

  static async login(
    request: APIRequestContext,
    email = DEV_EMAIL,
    password = DEV_PASSWORD
  ) {
    const res = await request.post("/api/auth/login", {
      data: { email, password },
    });
    expect(res.ok(), `login falhou: ${res.status()}`).toBeTruthy();
    const json = (await res.json()) as { token: string };
    return new LifeosApi(request, json.token);
  }

  private headers() {
    return { Authorization: `Bearer ${this.token}` };
  }

  async createRpgWorkspace(label: string) {
    const slug = `e2e-rpg-${label}-${Date.now()}`.slice(0, 48);
    const res = await this.request.post("/api/workspaces", {
      headers: this.headers(),
      data: {
        name: `E2E RPG ${label}`,
        slug,
        databases: ["HABITS", "CLIENTS"],
      },
    });
    expect(res.ok(), `criar workspace falhou: ${res.status()}`).toBeTruthy();
    const json = (await res.json()) as { workspace: { id: string } };
    return json.workspace;
  }

  async getDatabaseByTemplate(workspaceId: string, template: string) {
    const listRes = await this.request.get(
      `/api/workspaces/${workspaceId}/databases`,
      { headers: this.headers() }
    );
    expect(listRes.ok()).toBeTruthy();
    const listJson = (await listRes.json()) as {
      databases: { id: string; template: string }[];
    };
    const summary = listJson.databases.find((db) => db.template === template);
    if (!summary) {
      throw new Error(`Base ${template} não encontrada no workspace`);
    }

    const detailRes = await this.request.get(
      `/api/workspaces/${workspaceId}/databases/${summary.id}`,
      { headers: this.headers() }
    );
    expect(detailRes.ok()).toBeTruthy();
    const detailJson = (await detailRes.json()) as {
      database: { id: string; template: string; properties: DbProperty[] };
    };
    return detailJson.database;
  }

  async createRowInWorkspace(
    workspaceId: string,
    databaseId: string,
    properties: Record<string, unknown>
  ) {
    const res = await this.request.post(
      `/api/workspaces/${workspaceId}/databases/${databaseId}/rows`,
      { headers: this.headers(), data: { properties } }
    );
    expect(res.ok(), `criar linha falhou: ${res.status()}`).toBeTruthy();
    const json = (await res.json()) as { row: { id: string } };
    return json.row;
  }

  async updateRow(rowId: string, properties: Record<string, unknown>) {
    const res = await this.request.patch(`/api/database-rows/${rowId}`, {
      headers: this.headers(),
      data: { properties },
    });
    expect(res.ok(), `actualizar linha falhou: ${res.status()}`).toBeTruthy();
    const json = (await res.json()) as { row: { id: string } };
    return json.row;
  }

  async getGameProfile() {
    const res = await this.request.get("/api/game/profile", {
      headers: this.headers(),
    });
    expect(res.ok()).toBeTruthy();
    return (await res.json()) as GameProfile;
  }

  async getGameDashboard() {
    const res = await this.request.get("/api/game/dashboard", {
      headers: this.headers(),
    });
    expect(res.ok()).toBeTruthy();
    return (await res.json()) as GameDashboard;
  }

  async createHabitRow(
    workspaceId: string,
    database: { id: string; properties: DbProperty[] },
    opts: { title: string; area: string; done?: boolean }
  ) {
    const properties: Record<string, unknown> = {
      [propId(database.properties, "Hábito")]: opts.title,
      [propId(database.properties, "Frequência")]: "Diário",
      [propId(database.properties, "Área RPG")]: opts.area,
      [propId(database.properties, "Feito hoje")]: opts.done ?? false,
    };
    return this.createRowInWorkspace(workspaceId, database.id, properties);
  }

  async createClientRow(
    workspaceId: string,
    database: { id: string; properties: DbProperty[] },
    opts: { name: string; status: string; value?: number }
  ) {
    const properties: Record<string, unknown> = {
      [propId(database.properties, "Cliente")]: opts.name,
      [propId(database.properties, "Estado")]: opts.status,
    };
    if (opts.value !== undefined) {
      properties[propId(database.properties, "Valor (€)")] = opts.value;
    }
    return this.createRowInWorkspace(workspaceId, database.id, properties);
  }

  async markHabitDone(
    database: { properties: DbProperty[] },
    rowId: string
  ) {
    return this.updateRow(rowId, {
      [propId(database.properties, "Feito hoje")]: true,
    });
  }

  async closeClient(
    database: { properties: DbProperty[] },
    rowId: string
  ) {
    return this.updateRow(rowId, {
      [propId(database.properties, "Estado")]: "Fechado",
    });
  }

  async getShop() {
    const res = await this.request.get("/api/game/shop", {
      headers: this.headers(),
    });
    expect(res.ok(), `shop GET falhou: ${res.status()}`).toBeTruthy();
    return (await res.json()) as {
      balance: { lifeCoins: number; lifetimeCoins: number };
      items: {
        id: string;
        label: string;
        price: number;
        owned: boolean;
        locked: boolean;
      }[];
    };
  }

  async purchaseShopItem(itemId: string, equip = false) {
    const res = await this.request.post("/api/game/shop/purchase", {
      headers: this.headers(),
      data: { itemId, equip },
    });
    expect(res.ok(), `shop purchase falhou: ${res.status()}`).toBeTruthy();
    return (await res.json()) as {
      balance: { lifeCoins: number };
      items: { id: string; owned: boolean; equipped: boolean }[];
    };
  }

  /** Fecha clientes até ter LifeCoins suficientes para um item da loja. */
  async ensureLifeCoins(minCoins: number) {
    let profile = await this.getGameProfile();
    if (profile.lifeCoins >= minCoins) return profile;

    const workspace = await this.createRpgWorkspace("shop-coins");
    const clientsDb = await this.getDatabaseByTemplate(workspace.id, "CLIENTS");

    for (let i = 0; i < 20 && profile.lifeCoins < minCoins; i++) {
      const row = await this.createClientRow(workspace.id, clientsDb, {
        name: `E2E Shop ${Date.now()}-${i}`,
        status: "Lead",
        value: 500,
      });
      await this.closeClient(clientsDb, row.id);
      profile = await this.getGameProfile();
    }

    expect(profile.lifeCoins).toBeGreaterThanOrEqual(minCoins);
    return profile;
  }

  async getFinanceMethods() {
    const res = await this.request.get("/api/finance/methods", {
      headers: this.headers(),
    });
    expect(res.ok(), `finance methods falhou: ${res.status()}`).toBeTruthy();
    const json = (await res.json()) as { methods: { id: string }[] };
    return json.methods;
  }

  async updateFinanceProfile(body: { currency?: string; payYourselfPercent?: number | null }) {
    const res = await this.request.patch("/api/finance/profile", {
      headers: this.headers(),
      data: body,
    });
    expect(res.ok(), `update profile falhou: ${res.status()}`).toBeTruthy();
    const json = (await res.json()) as { profile: { currency: string } };
    return json.profile;
  }

  async getFinanceDashboard() {
    const res = await this.request.get("/api/finance/dashboard", {
      headers: this.headers(),
    });
    expect(res.ok(), `finance dashboard falhou: ${res.status()}`).toBeTruthy();
    return (await res.json()) as {
      netWorth: number;
      profile: { currency: string };
      accounts: { id: string; balance: number }[];
    };
  }

  async createFinanceAccount(body: {
    name: string;
    type: string;
    initialBalance: number;
    creditLimit?: number;
    billingCycleDay?: number;
    paymentDueDay?: number;
    aprPercent?: number;
    minimumPayment?: number;
    originalPrincipal?: number;
  }) {
    const res = await this.request.post("/api/finance/accounts", {
      headers: this.headers(),
      data: body,
    });
    expect(res.ok(), `create account falhou: ${res.status()}`).toBeTruthy();
    const json = (await res.json()) as {
      account: {
        id: string;
        balance: number;
        billingCycleDay?: number | null;
        aprPercent?: number | null;
      };
    };
    return json.account;
  }

  async getFinanceDebts() {
    const res = await this.request.get("/api/finance/debts", {
      headers: this.headers(),
    });
    expect(res.ok(), `debts GET falhou: ${res.status()}`).toBeTruthy();
    return (await res.json()) as {
      totalDebt: number;
      snowball: { accountId: string; debtAmount: number; rank: number }[];
      avalanche: { accountId: string; debtAmount: number; aprPercent: number | null }[];
    };
  }

  async downloadFinanceMonthlyPdf(month?: string) {
    const q = month ? `?month=${month}` : "";
    const res = await this.request.get(`/api/finance/reports/monthly${q}`, {
      headers: this.headers(),
    });
    expect(res.ok(), `monthly PDF falhou: ${res.status()}`).toBeTruthy();
    return res;
  }

  async createFinanceMovement(body: Record<string, unknown>) {
    const res = await this.request.post("/api/finance/movements", {
      headers: this.headers(),
      data: body,
    });
    expect(res.ok(), `create movement falhou: ${res.status()}`).toBeTruthy();
    return res.json();
  }

  async getDatabase(workspaceId: string, databaseId: string) {
    const res = await this.request.get(
      `/api/workspaces/${workspaceId}/databases/${databaseId}`,
      { headers: this.headers() }
    );
    expect(res.ok(), `get database falhou: ${res.status()}`).toBeTruthy();
    return (await res.json()) as {
      database: {
        id: string;
        template: string;
        clientFinanceLinks?: Record<
          string,
          { movementId: string; amount: number; date: string }
        >;
      };
    };
  }

  async getFinanceMovements() {
    const res = await this.request.get("/api/finance/movements", {
      headers: this.headers(),
    });
    expect(res.ok(), `movements GET falhou: ${res.status()}`).toBeTruthy();
    const json = (await res.json()) as {
      movements: { id: string; type: string }[];
    };
    return json.movements;
  }

  async startFinanceMethod(methodId: string) {
    const res = await this.request.post(`/api/finance/methods/${methodId}/start`, {
      headers: this.headers(),
    });
    expect(res.ok(), `start method falhou: ${res.status()}`).toBeTruthy();
    const json = (await res.json()) as {
      methods: { id: string; active: boolean; totalSteps: number }[];
    };
    return json.methods;
  }

  async upsertFinanceBudgets(month: string, budgets: { categoryId: string; limitAmount: number }[]) {
    const res = await this.request.put("/api/finance/budgets", {
      headers: this.headers(),
      data: { month, budgets },
    });
    expect(res.ok(), `budgets PUT falhou: ${res.status()}`).toBeTruthy();
    return res.json();
  }

  async createFinanceGoal(body: {
    name: string;
    targetAmount: number;
    targetAccountId: string;
  }) {
    const res = await this.request.post("/api/finance/goals", {
      headers: this.headers(),
      data: body,
    });
    expect(res.ok(), `create goal falhou: ${res.status()}`).toBeTruthy();
    return res.json();
  }

  async exportFinanceWorkbook() {
    const res = await this.request.get("/api/finance/export", {
      headers: this.headers(),
    });
    expect(res.ok(), `export falhou: ${res.status()}`).toBeTruthy();
    return res;
  }

  async suggestFinanceMethodHabits(methodId: string) {
    const res = await this.request.post(`/api/finance/methods/${methodId}/suggest-habits`, {
      headers: this.headers(),
    });
    expect(res.ok(), `suggest habits falhou: ${res.status()}`).toBeTruthy();
    return (await res.json()) as { created: number; skipped: number };
  }

  async getCaseInsights(mode: "focus" | "game" | "finance" = "focus") {
    const res = await this.request.get(`/api/case/insights?mode=${mode}`, {
      headers: this.headers(),
    });
    expect(res.ok(), `case insights falhou: ${res.status()}`).toBeTruthy();
    return (await res.json()) as {
      generatedAt: string;
      mode: string;
      items: { id: string; priority: string; text: string; prompt: string; mode: string }[];
    };
  }

  async getCaseStatus() {
    const res = await this.request.get("/api/case/status", {
      headers: this.headers(),
    });
    expect(res.ok(), `case status falhou: ${res.status()}`).toBeTruthy();
    return (await res.json()) as {
      llmAvailable: boolean;
      llmOptIn: boolean;
      llmEnabled: boolean;
      engine: "llm" | "local";
      modes: string[];
    };
  }

  async caseChat(body: { content: string; mode?: "focus" | "game" | "finance" }) {
    const res = await this.request.post("/api/case/chat", {
      headers: this.headers(),
      data: body,
    });
    expect(res.ok(), `case chat falhou: ${res.status()}`).toBeTruthy();
    return (await res.json()) as {
      conversationId: string;
      engine: "llm" | "local";
      message: { id: string; role: string; content: string; createdAt: string };
      proposal?: {
        id: string;
        tool: string;
        phase: "form" | "summary";
        preview: { title: string; fields: { label: string; value: string }[] };
        form?: { key: string; label: string; value: string; type: string }[];
      };
    };
  }

  async confirmCaseAction(proposalId: string) {
    const res = await this.request.post(`/api/case/actions/${proposalId}/confirm`, {
      headers: this.headers(),
    });
    expect(res.ok(), `case confirm falhou: ${res.status()}`).toBeTruthy();
    return (await res.json()) as { message: { content: string; role: string } };
  }

  async updateCaseAction(
    proposalId: string,
    body: {
      fields: Record<string, string>;
      advanceToSummary?: boolean;
      backToForm?: boolean;
    }
  ) {
    const res = await this.request.patch(`/api/case/actions/${proposalId}`, {
      headers: this.headers(),
      data: body,
    });
    if (!res.ok()) {
      const errBody = await res.text();
      throw new Error(`case update falhou: ${res.status()} — ${errBody}`);
    }
    const json = (await res.json()) as {
      proposal: {
        id: string;
        tool: string;
        phase: "form" | "summary";
        preview: { title: string; fields: { label: string; value: string }[] };
        form?: { key: string; value: string }[];
      };
    };
    return json;
  }

  async cancelCaseAction(proposalId: string) {
    const res = await this.request.post(`/api/case/actions/${proposalId}/cancel`, {
      headers: this.headers(),
    });
    expect(res.ok(), `case cancel falhou: ${res.status()}`).toBeTruthy();
    return (await res.json()) as { ok: boolean };
  }

  async sendCaseMessage(
    conversationId: string,
    body: { content: string; mode?: "focus" | "game" | "finance" }
  ) {
    const res = await this.request.post(`/api/case/conversations/${conversationId}/messages`, {
      headers: this.headers(),
      data: body,
    });
    expect(res.ok(), `case message falhou: ${res.status()}`).toBeTruthy();
    return (await res.json()) as {
      engine: "llm" | "local";
      message: { id: string; role: string; content: string; createdAt: string };
      proposal?: {
        id: string;
        tool: string;
        phase: "form" | "summary";
        preview: { title: string; fields: { label: string; value: string }[] };
        form?: { key: string; label: string; value: string; type: string }[];
      };
    };
  }

  async submitFinanceQuestionnaire(body: {
    hasHighInterestDebt: boolean;
    incomeType: "fixed" | "variable";
    hasEmergencyFund: boolean;
    weeklyTime: "minimal" | "moderate" | "full";
    wantsGameLink: boolean;
    shortTermGoal: "pay_debt" | "save" | "organize";
  }) {
    const res = await this.request.post("/api/finance/questionnaire", {
      headers: this.headers(),
      data: body,
    });
    expect(res.ok(), `questionnaire falhou: ${res.status()}`).toBeTruthy();
    return (await res.json()) as {
      suggestion: { methodId: string; reason: string };
      answers: typeof body;
    };
  }
}
