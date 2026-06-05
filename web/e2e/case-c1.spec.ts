import { test, expect } from "@playwright/test";

import { DEV_EMAIL, DEV_PASSWORD, LifeosApi } from "./helpers/lifeos-api";

test.describe("Case C1 — API", () => {
  test.setTimeout(60_000);

  test("status e chat local com contexto finanças", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const status = await api.getCaseStatus();
    expect(status.modes).toContain("finance");
    if (status.llmOptIn && status.llmAvailable) {
      expect(status.engine).toBe("llm");
    } else {
      expect(status.engine).toBe("local");
    }

    const first = await api.caseChat({
      content: "Como está o meu património?",
      mode: "finance",
    });
    expect(first.conversationId).toBeTruthy();
    expect(first.message.role).toBe("assistant");
    expect(first.message.content.length).toBeGreaterThan(10);

    const second = await api.sendCaseMessage(first.conversationId, {
      content: "O que devo priorizar esta semana?",
      mode: "finance",
    });
    expect(second.message.role).toBe("assistant");
    expect(second.message.content.length).toBeGreaterThan(10);
  });
});

test.describe("Case C1+ — acções com confirmação", () => {
  test.setTimeout(60_000);

  test("propõe e confirma criação de conta financeira", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const accountName = `Reserva E2E ${Date.now()}`;
    const dashBefore = await api.getFinanceDashboard();

    const chat = await api.caseChat({
      content: `Cria uma conta poupança chamada ${accountName}`,
      mode: "finance",
    });
    expect(chat.proposal).toBeTruthy();
    expect(chat.proposal!.tool).toBe("finance.create_account");
    expect(chat.proposal!.phase).toBe("summary");
    expect(
      chat.proposal!.preview.fields.some((f) => f.value.includes(accountName))
    ).toBeTruthy();

    const confirmed = await api.confirmCaseAction(chat.proposal!.id);
    expect(confirmed.message.content).toContain(accountName);

    const dashAfter = await api.getFinanceDashboard();
    expect(dashAfter.accounts.length).toBeGreaterThan(dashBefore.accounts.length);
  });

  test("cancelar proposta não cria conta", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const dashBefore = await api.getFinanceDashboard();

    const chat = await api.caseChat({
      content: "Cria uma conta poupança chamada CancelTest E2E",
      mode: "finance",
    });
    expect(chat.proposal).toBeTruthy();

    await api.cancelCaseAction(chat.proposal!.id);

    const dashAfter = await api.getFinanceDashboard();
    expect(dashAfter.accounts.length).toBe(dashBefore.accounts.length);
  });

  test("propõe e confirma criação de hábito", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const ws = await api.createRpgWorkspace("case-habit");
    const habitName = `Beber agua E2E ${Date.now()}`;

    const chat = await api.caseChat({
      content: `Cria um hábito chamado ${habitName}`,
      mode: "focus",
    });
    expect(chat.proposal).toBeTruthy();
    expect(chat.proposal!.tool).toBe("focus.create_habit");

    let proposal = chat.proposal!;
    if (proposal.phase === "form") {
      expect(proposal.form?.some((f) => f.key === "workspaceId")).toBeTruthy();
      const summary = await api.updateCaseAction(proposal.id, {
        fields: {
          workspaceId: ws.id,
          title: habitName,
          frequency: "Diário",
          area: "Saúde",
        },
        advanceToSummary: true,
      });
      proposal = summary.proposal;
    }

    expect(proposal.phase).toBe("summary");
    expect(
      proposal.preview.fields.some((f) => f.value.includes(habitName))
    ).toBeTruthy();

    const confirmed = await api.confirmCaseAction(proposal.id);
    expect(confirmed.message.content).toContain(habitName);
  });

  test("propõe e confirma movimento financeiro", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const dash = await api.getFinanceDashboard();
    expect(dash.accounts.length).toBeGreaterThan(0);
    const movementsBefore = await api.getFinanceMovements();

    const chat = await api.caseChat({
      content: "Regista despesa 12 euros",
      mode: "finance",
    });
    expect(chat.proposal?.tool).toBe("finance.create_movement");

    let proposal = chat.proposal!;
    if (proposal.phase === "form") {
      const accountId =
        proposal.form?.find((f) => f.key === "accountId")?.value ||
        dash.accounts[0]!.id;
      const summary = await api.updateCaseAction(proposal.id, {
        fields: {
          type: "EXPENSE",
          amount: "12",
          accountId,
          date: new Date().toISOString().slice(0, 10),
          categoryId: "",
          note: "E2E Case",
        },
        advanceToSummary: true,
      });
      proposal = summary.proposal;
    }

    expect(proposal.phase).toBe("summary");
    const confirmed = await api.confirmCaseAction(proposal.id);
    expect(confirmed.message.content).toMatch(/12|Despesa/i);

    const movementsAfter = await api.getFinanceMovements();
    expect(movementsAfter.length).toBeGreaterThan(movementsBefore.length);
  });

  test("propõe e confirma meta financeira", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const dash = await api.getFinanceDashboard();
    expect(dash.accounts.length).toBeGreaterThan(0);
    const goalName = `Ferias E2E ${Date.now()}`;

    const chat = await api.caseChat({
      content: `Cria meta ${goalName} 500 euros`,
      mode: "finance",
    });
    expect(chat.proposal?.tool).toBe("finance.create_goal");

    let proposal = chat.proposal!;
    if (proposal.phase === "form") {
      const summary = await api.updateCaseAction(proposal.id, {
        fields: {
          name: goalName,
          targetAmount: "500",
          targetAccountId: dash.accounts[0]!.id,
          deadline: "",
        },
        advanceToSummary: true,
      });
      proposal = summary.proposal;
    }

    expect(proposal.phase).toBe("summary");
    const confirmed = await api.confirmCaseAction(proposal.id);
    expect(confirmed.message.content).toContain(goalName);
  });

  test("propõe e confirma marcar hábito feito", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const ws = await api.createRpgWorkspace("case-complete");
    const habitName = `Meditar E2E ${Date.now()}`;

    const createChat = await api.caseChat({
      content: `Cria um hábito chamado ${habitName}`,
      mode: "focus",
    });
    let createProposal = createChat.proposal!;
    if (createProposal.phase === "form") {
      const summary = await api.updateCaseAction(createProposal.id, {
        fields: {
          workspaceId: ws.id,
          title: habitName,
          frequency: "Diário",
          area: "Geral",
        },
        advanceToSummary: true,
      });
      createProposal = summary.proposal;
    }
    await api.confirmCaseAction(createProposal.id);

    const markChat = await api.caseChat({
      content: `Marca o hábito ${habitName} como feito`,
      mode: "focus",
    });
    expect(markChat.proposal?.tool).toBe("focus.complete_habit");

    let proposal = markChat.proposal!;
    if (proposal.phase === "form") {
      const rowId = proposal.form?.find((f) => f.key === "rowId")?.value;
      expect(rowId).toBeTruthy();
      const summary = await api.updateCaseAction(proposal.id, {
        fields: { rowId: rowId! },
        advanceToSummary: true,
      });
      proposal = summary.proposal;
    }

    expect(proposal.phase).toBe("summary");
    const confirmed = await api.confirmCaseAction(proposal.id);
    expect(confirmed.message.content).toContain(habitName);
  });
});

test.describe("Case C1 — UI", () => {
  test("FAB abre painel no modo finanças", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.getByRole("button", { name: /modo finanças/i }).click();
    await expect(page).toHaveURL(/\/finance/, { timeout: 15_000 });

    await page.getByRole("button", { name: /abrir case/i }).click();
    await expect(page.getByRole("dialog", { name: /case assistente/i })).toBeVisible();
    await expect(page.getByText(/coach lifeos/i)).toBeVisible();
  });
});
