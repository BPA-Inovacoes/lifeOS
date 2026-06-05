import type { Page } from "@playwright/test";

import { mockDashboard, mockProfile, mockShop } from "./game-fixtures";

/** Mocks de API para testes UI do Game Mode. */
export async function mockGameApi(page: Page, enabled = true) {
  const profile = mockProfile(enabled);
  const dashboard = mockDashboard();
  let shop = mockShop();

  await page.route("**/game/mode", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(profile),
    });
  });

  await page.route("**/game/profile", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(profile),
    });
  });

  await page.route("**/game/dashboard", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(dashboard),
    });
  });

  await page.route("**/game/shop", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(shop),
      });
      return;
    }
    await route.continue();
  });

  await page.route("**/game/shop/purchase", async (route) => {
    const body = route.request().postDataJSON() as {
      itemId: string;
      equip?: boolean;
    };
    const item = shop.items.find((i) => i.id === body.itemId);
    if (item && !item.owned) {
      shop = {
        ...shop,
        balance: {
          ...shop.balance,
          lifeCoins: shop.balance.lifeCoins - item.price,
        },
        items: shop.items.map((i) =>
          i.id === body.itemId
            ? { ...i, owned: true, equipped: Boolean(body.equip) }
            : i
        ),
        equipped: body.equip
          ? {
              avatarIcon: shop.equipped.avatarIcon,
              displayTitle: item.payload,
            }
          : shop.equipped,
      };
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(shop),
    });
  });

  await page.route("**/game/shop/equip", async (route) => {
    const body = route.request().postDataJSON() as { itemId: string };
    shop = {
      ...shop,
      items: shop.items.map((i) => ({
        ...i,
        equipped: i.id === body.itemId,
      })),
      equipped: (() => {
        const item = shop.items.find((i) => i.id === body.itemId);
        if (!item) return shop.equipped;
        if (item.type === "TITLE") {
          return { ...shop.equipped, displayTitle: item.payload };
        }
        return { ...shop.equipped, avatarIcon: item.payload };
      })(),
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(shop),
    });
  });
}

export async function mockFocusModeApi(page: Page) {
  await page.route("**/game/mode", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockProfile(false)),
    });
  });
}
