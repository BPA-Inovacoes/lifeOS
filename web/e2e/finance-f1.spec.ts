import { test, expect } from "@playwright/test";

import { DEV_EMAIL, DEV_PASSWORD, LifeosApi } from "./helpers/lifeos-api";

test.describe("Finanças F1.0 — API", () => {
  test.setTimeout(90_000);

  test("criar contas, movimento e transferência", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const dashBefore = await api.getFinanceDashboard();
    expect(dashBefore.netWorth).toBeDefined();

    const checking = await api.createFinanceAccount({
      name: `E2E Corrente ${Date.now()}`,
      type: "CHECKING",
      initialBalance: 1000,
    });
    const savings = await api.createFinanceAccount({
      name: `E2E Poupança ${Date.now()}`,
      type: "SAVINGS",
      initialBalance: 200,
    });

    expect(checking.balance).toBe(1000);
    expect(savings.balance).toBe(200);

    await api.createFinanceMovement({
      type: "EXPENSE",
      accountId: checking.id,
      amount: 50,
      date: new Date().toISOString().slice(0, 10),
      categoryId: "exp-food",
    });

    await api.createFinanceMovement({
      type: "TRANSFER",
      accountId: checking.id,
      transferDestAccountId: savings.id,
      amount: 100,
      date: new Date().toISOString().slice(0, 10),
    });

    const dashAfter = await api.getFinanceDashboard();
    expect(dashAfter.accounts.length).toBeGreaterThanOrEqual(dashBefore.accounts.length + 2);
    expect(dashAfter.netWorth).toBeGreaterThan(0);
  });

  test("catálogo expõe 12 métodos", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const methods = await api.getFinanceMethods();
    expect(methods).toHaveLength(12);
  });

  test("alterar moeda do perfil", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const profile = await api.updateFinanceProfile({ currency: "USD" });
    expect(profile.currency).toBe("USD");
    const dash = await api.getFinanceDashboard();
    expect(dash.profile.currency).toBe("USD");
  });

  test("iniciar método Primeiros 30 dias", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const methods = await api.startFinanceMethod("first-30-days");
    const active = methods.find((m) => m.id === "first-30-days");
    expect(active?.active).toBeTruthy();
    expect(active?.totalSteps).toBeGreaterThanOrEqual(20);
  });

  test("ao exceder 25 movimentos compacta lote em resumo fin-roll", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const checking = await api.createFinanceAccount({
      name: `E2E Roll ${Date.now()}`,
      type: "CHECKING",
      initialBalance: 1000,
    });

    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < 26; i++) {
      await api.createFinanceMovement({
        type: "EXPENSE",
        accountId: checking.id,
        amount: 1,
        date: today,
        categoryId: "exp-food",
        note: `e2e-${i}`,
      });
    }

    const movements = await api.getFinanceMovements();
    const summaries = movements.filter((m) => m.type === "SUMMARY");
    const details = movements.filter((m) => m.type !== "SUMMARY");
    expect(summaries.length).toBeGreaterThanOrEqual(1);
    expect(summaries[0]!.id).toMatch(/^fin-roll-/);
    expect(details.length).toBeLessThanOrEqual(25);
  });

  test("questionário 6 respostas — objectivo pagar dívida sugere avalanche", async ({
    request,
  }) => {
    const api = await LifeosApi.login(request);
    await api.createFinanceAccount({
      name: `E2E Q Checking ${Date.now()}`,
      type: "CHECKING",
      initialBalance: 500,
    });
    await api.createFinanceAccount({
      name: `E2E Q Poupança ${Date.now()}`,
      type: "SAVINGS",
      initialBalance: 100,
    });

    const result = await api.submitFinanceQuestionnaire({
      hasHighInterestDebt: false,
      incomeType: "fixed",
      hasEmergencyFund: true,
      weeklyTime: "moderate",
      wantsGameLink: false,
      shortTermGoal: "pay_debt",
    });

    expect(result.suggestion.methodId).toBe("debt-avalanche");
    expect(result.answers.shortTermGoal).toBe("pay_debt");
  });
});

test.describe("Finanças F1.1 — API", () => {
  test("envelopes, metas e export Excel", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const savings = await api.createFinanceAccount({
      name: `E2E Meta ${Date.now()}`,
      type: "SAVINGS",
      initialBalance: 100,
    });

    const month = new Date().toISOString().slice(0, 7);
    await api.upsertFinanceBudgets(month, [{ categoryId: "exp-food", limitAmount: 500 }]);

    const goals = await api.createFinanceGoal({
      name: "Fundo emergência",
      targetAmount: 1000,
      targetAccountId: savings.id,
    });
    expect(goals).toBeTruthy();

    const exportRes = await api.exportFinanceWorkbook();
    expect(exportRes.headers()["content-type"]).toContain("spreadsheetml");
  });

  test("hábitos sugeridos para revisão semanal", async ({ request }) => {
    const api = await LifeosApi.login(request);
    await api.startFinanceMethod("weekly-money-review");
    const result = await api.suggestFinanceMethodHabits("weekly-money-review");
    expect(result.created + result.skipped).toBeGreaterThan(0);
  });
});

test.describe("Finanças F1.2 — dívidas e PDF", () => {
  test.setTimeout(90_000);

  test("cartão com ciclo, empréstimo, plano snowball/avalanche e PDF mensal", async ({
    request,
  }) => {
    const api = await LifeosApi.login(request);
    const ts = Date.now();

    const card = await api.createFinanceAccount({
      name: `E2E Cartão ${ts}`,
      type: "CREDIT_CARD",
      initialBalance: 800,
      creditLimit: 2000,
      billingCycleDay: 5,
      paymentDueDay: 20,
      aprPercent: 22,
    });
    expect(card.balance).toBeLessThan(0);
    expect(card.billingCycleDay).toBe(5);

    const loan = await api.createFinanceAccount({
      name: `E2E Empréstimo ${ts}`,
      type: "LOAN",
      initialBalance: 5000,
      aprPercent: 6,
      minimumPayment: 120,
      originalPrincipal: 8000,
    });
    expect(loan.balance).toBeLessThan(0);

    const debts = await api.getFinanceDebts();
    expect(debts.totalDebt).toBeGreaterThan(0);
    expect(debts.snowball[0]?.debtAmount).toBeLessThanOrEqual(debts.snowball[1]?.debtAmount ?? Infinity);
    expect(debts.avalanche[0]?.aprPercent).toBeGreaterThanOrEqual(
      debts.avalanche[1]?.aprPercent ?? 0
    );

    const pdfRes = await api.downloadFinanceMonthlyPdf(new Date().toISOString().slice(0, 7));
    expect(pdfRes.headers()["content-type"]).toContain("application/pdf");
    const body = await pdfRes.body();
    expect(body.byteLength).toBeGreaterThan(500);
    expect(body.slice(0, 4).toString()).toBe("%PDF");
  });
});

test.describe("Finanças F1.3 — CLIENTS e paga-te primeiro", () => {
  test.setTimeout(90_000);

  test("receita ligada a cliente e sugestão de transferência", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const ts = Date.now();

    await api.startFinanceMethod("pay-yourself-first");

    const checking = await api.createFinanceAccount({
      name: `E2E Corrente F13 ${ts}`,
      type: "CHECKING",
      initialBalance: 500,
    });
    const savings = await api.createFinanceAccount({
      name: `E2E Poupança F13 ${ts}`,
      type: "SAVINGS",
      initialBalance: 0,
    });

    await api.updateFinanceProfile({ payYourselfPercent: 20 });

    const incomeRes = await api.createFinanceMovement({
      type: "INCOME",
      accountId: checking.id,
      amount: 1000,
      date: new Date().toISOString().slice(0, 10),
      categoryId: "inc-salary",
    });
    const incomeJson = incomeRes as {
      transferSuggestion?: { amount: number; percent: number } | null;
    };
    expect(incomeJson.transferSuggestion?.amount).toBe(200);
    expect(incomeJson.transferSuggestion?.percent).toBe(20);

    const workspace = await api.createRpgWorkspace("f13-clients");
    const clientsDb = await api.getDatabaseByTemplate(workspace.id, "CLIENTS");
    const clientRow = await api.createClientRow(workspace.id, clientsDb, {
      name: `Cliente F13 ${ts}`,
      value: 750,
      status: "Fechado",
    });

    const linked = await api.createFinanceMovement({
      type: "INCOME",
      accountId: checking.id,
      amount: 750,
      date: new Date().toISOString().slice(0, 10),
      categoryId: "inc-freelance",
      linkedClientRowId: clientRow.id,
    });
    const linkedJson = linked as { movement: { linkedClientRowId: string } };
    expect(linkedJson.movement.linkedClientRowId).toBe(clientRow.id);

    const db = await api.getDatabase(workspace.id, clientsDb.id);
    expect(db.database.clientFinanceLinks?.[clientRow.id]?.movementId).toBeTruthy();
  });
});

test.describe("Finanças F1.0 — UI", () => {
  test("home carrega património após login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.getByRole("button", { name: /modo finanças/i }).click();
    await expect(page).toHaveURL(/\/finance/, { timeout: 15_000 });
    await expect(page.getByText("Património líquido", { exact: true })).toBeVisible({ timeout: 15_000 });
  });

  test("questionário mostra ligação ao glossário", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.getByRole("button", { name: /modo finanças/i }).click();
    await expect(page).toHaveURL(/\/finance/, { timeout: 15_000 });

    const startBtn = page.getByRole("button", { name: /iniciar questionário/i });
    if (!(await startBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, "Questionário já completo nesta conta");
      return;
    }

    await startBtn.click();
    await expect(page.getByRole("dialog", { name: /questionário financeiro/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /juro alto/i })).toBeVisible();
    await page.getByRole("link", { name: /juro alto/i }).click();
    await expect(page).toHaveURL(/\/finance\/aprender.*tab=glossary/, { timeout: 10_000 });
  });
});
