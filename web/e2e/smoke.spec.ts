import { test, expect } from "@playwright/test";

import { mockGameApi, mockFocusModeApi } from "./helpers/game-ui";
import { DEV_EMAIL, DEV_PASSWORD } from "./helpers/lifeos-api";

test.describe("fluxo principal", () => {
  test("login → escolher Focus → dashboard → abrir paleta e ajuda", async ({
    page,
  }) => {
    await mockFocusModeApi(page);

    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/mode/, { timeout: 15_000 });

    await page.getByRole("button", { name: /focus mode/i }).click();
    await expect(page).toHaveURL(/\/focus\/dashboard/, { timeout: 15_000 });

    await page.getByRole("button", { name: /comandos/i }).first().click();
    const palette = page.getByPlaceholder(/pesquisar ou criar/i);
    await expect(palette).toBeVisible();
    await palette.fill("Manual");
    await page.getByRole("option", { name: /manual de utilizador/i }).click();
    await expect(page).toHaveURL(/\/focus\/ajuda/, { timeout: 10_000 });
  });

  test("login → escolher Game Mode → command center", async ({ page }) => {
    await mockGameApi(page);

    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/mode/, { timeout: 15_000 });

    await page.getByRole("button", { name: /game mode/i }).click();
    await expect(page).toHaveURL(/\/game/, { timeout: 15_000 });

    await expect(page.getByRole("heading", { name: /perfil do jogador/i })).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByText("LifeCoins")).toBeVisible();
    await expect(page.getByText("42")).toBeVisible();
  });

  test("login → escolher Modo Finanças → home finance", async ({ page }) => {
    await mockFocusModeApi(page);

    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/mode/, { timeout: 15_000 });
    await expect(page.getByRole("button", { name: /modo finanças/i })).toBeVisible();

    await page.getByRole("button", { name: /modo finanças/i }).click();
    await expect(page).toHaveURL(/\/finance/, { timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: /modo finanças/i })
    ).toBeVisible();
  });

  test("/mode mostra Focus, Game e Finanças", async ({ page }) => {
    await mockFocusModeApi(page);

    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/mode/, { timeout: 15_000 });
    await expect(page.getByRole("button", { name: /focus mode/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /game mode/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /modo finanças/i })).toBeVisible();
  });
});
