import { test, expect } from "@playwright/test";

import { mockGameApi } from "./helpers/game-ui";
import { DEV_EMAIL, DEV_PASSWORD, LifeosApi } from "./helpers/lifeos-api";

test.describe("RPG Fase D — Loja LifeCoins", () => {
  test.setTimeout(120_000);

  test("GET /game/shop devolve catálogo e saldo", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const shop = await api.getShop();

    expect(shop.balance.lifeCoins).toBeGreaterThanOrEqual(0);
    expect(shop.items.length).toBeGreaterThan(0);
    expect(shop.items.some((item) => item.id === "title-rookie")).toBeTruthy();
  });

  test("compra de item debita LifeCoins e marca owned", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const before = await api.getShop();
    const candidates = before.items
      .filter((item) => !item.owned && !item.locked)
      .sort((a, b) => a.price - b.price);

    test.skip(
      candidates.length === 0,
      "Todos os itens compráveis já estão no inventário deste utilizador"
    );

    const target = candidates[0]!;
    await api.ensureLifeCoins(target.price);

    const refreshed = await api.getShop();
    const item = refreshed.items.find((i) => i.id === target.id);
    test.skip(item?.owned, "Item ficou owned entre leituras");

    const after = await api.purchaseShopItem(target.id, false);
    const bought = after.items.find((i) => i.id === target.id);

    expect(bought?.owned).toBeTruthy();
    expect(after.balance.lifeCoins).toBe(
      refreshed.balance.lifeCoins - target.price
    );
  });
});

test.describe("RPG Fase D — UI Loja", () => {
  test("loja: comprar e guardar no inventário", async ({ page }) => {
    await mockGameApi(page);

    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/mode/, { timeout: 15_000 });

    await page.getByRole("button", { name: /game mode/i }).click();
    await expect(page).toHaveURL(/\/game/, { timeout: 15_000 });

    await page.goto("/game/loja");
    await expect(
      page.getByRole("heading", { name: /loja lifecoins/i })
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText("200")).toBeVisible();
    await expect(page.getByText("Recruta LifeOS")).toBeVisible();

    await page.getByRole("button", { name: /^comprar$/i }).first().click();
    const dialog = page.getByRole("dialog", { name: /confirmar compra/i });
    await expect(dialog.getByRole("heading", { name: /recruta lifeos/i })).toBeVisible();
    await dialog.getByRole("button", { name: /guardar no inventário/i }).click();

    await expect(page.getByText("150")).toBeVisible({ timeout: 10_000 });
  });

  test("sidebar inclui entrada Loja", async ({ page }) => {
    await mockGameApi(page);

    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.getByRole("button", { name: /game mode/i }).click();

    await expect(page.getByRole("link", { name: /^loja$/i })).toBeVisible();
  });
});
