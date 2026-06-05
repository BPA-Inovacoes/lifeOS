import { test, expect } from "@playwright/test";

import {
  DEV_EMAIL,
  DEV_PASSWORD,
  LifeosApi,
} from "./helpers/lifeos-api";
import { mockGameApi } from "./helpers/game-ui";

test.describe("RPG Fase C — integração", () => {
  test.setTimeout(120_000);

  test("hábito com Área RPG Saúde aumenta LifeCoins e hábitos concluídos", async ({
    request,
  }) => {
    const api = await LifeosApi.login(request);
    const before = await api.getGameProfile();
    const workspace = await api.createRpgWorkspace("habit-health");
    const habitsDb = await api.getDatabaseByTemplate(workspace.id, "HABITS");

    const row = await api.createHabitRow(workspace.id, habitsDb, {
      title: `E2E Saúde ${Date.now()}`,
      area: "Saúde",
      done: false,
    });
    await api.markHabitDone(habitsDb, row.id);

    const after = await api.getGameProfile();
    expect(after.habitsCompleted).toBeGreaterThan(before.habitsCompleted);
    expect(after.lifeCoins).toBeGreaterThanOrEqual(before.lifeCoins + 1);
  });

  test("cliente fechado aumenta XP, LifeCoins e distribuição Clientes", async ({
    request,
  }) => {
    const api = await LifeosApi.login(request);
    const beforeProfile = await api.getGameProfile();
    const beforeDash = await api.getGameDashboard();
    const workspace = await api.createRpgWorkspace("client-close");
    const clientsDb = await api.getDatabaseByTemplate(workspace.id, "CLIENTS");

    const row = await api.createClientRow(workspace.id, clientsDb, {
      name: `E2E Cliente ${Date.now()}`,
      status: "Lead",
      value: 1000,
    });
    await api.closeClient(clientsDb, row.id);

    const afterProfile = await api.getGameProfile();
    const afterDash = await api.getGameDashboard();

    expect(afterProfile.totalXp).toBeGreaterThan(beforeProfile.totalXp);
    expect(afterProfile.lifeCoins).toBeGreaterThanOrEqual(
      beforeProfile.lifeCoins + 15
    );
    expect(afterDash.xpDistribution.clients).toBeGreaterThan(
      beforeDash.xpDistribution.clients
    );
  });
});

test.describe("RPG Fase C — UI Game Mode", () => {
  test("perfil mostra LifeCoins e manual documenta Fase C", async ({ page }) => {
    await mockGameApi(page);

    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/mode/, { timeout: 15_000 });

    await page.getByRole("button", { name: /game mode/i }).click();
    await expect(page).toHaveURL(/\/game/, { timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: /perfil do jogador/i })
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText("LifeCoins")).toBeVisible();
    await expect(page.getByText("42")).toBeVisible();

    await page.goto("/game/manual");
    await expect(
      page.getByRole("heading", { name: /LifeCoins/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Hábitos tipados \(Área RPG\)/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Base Clientes/i })
    ).toBeVisible();
  });

  test("estatísticas incluem origem Clientes na distribuição de XP", async ({
    page,
  }) => {
    await mockGameApi(page);

    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.getByRole("button", { name: /game mode/i }).click();
    await expect(page).toHaveURL(/\/game/, { timeout: 15_000 });

    await page.goto("/game/stats");
    await expect(
      page.getByRole("heading", { name: /origem do xp/i })
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Clientes")).toBeVisible();
    await expect(
      page.locator("li").filter({ hasText: "Clientes" }).getByText("300", {
        exact: true,
      })
    ).toBeVisible();
  });
});
