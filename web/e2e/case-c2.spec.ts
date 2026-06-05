import { test, expect } from "@playwright/test";

import { DEV_EMAIL, DEV_PASSWORD, LifeosApi } from "./helpers/lifeos-api";

test.describe("Case C2 — API", () => {
  test.setTimeout(60_000);

  test("status expõe insights, streaming e llm tool calling", async ({ request }) => {
    const loginRes = await request.post("/api/auth/login", {
      data: { email: DEV_EMAIL, password: DEV_PASSWORD },
    });
    const { token } = (await loginRes.json()) as { token: string };
    const res = await request.get("/api/case/status", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.insights).toMatchObject({ enabled: true });
    expect(body.streaming).toMatchObject({ enabled: true });
    expect(body.actions).toMatchObject({ llmToolCalling: true });
  });

  test("insights devolve lista para dashboard Agora", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const insights = await api.getCaseInsights("focus");
    expect(insights.mode).toBe("focus");
    expect(insights.generatedAt).toBeTruthy();
    expect(Array.isArray(insights.items)).toBeTruthy();
    for (const item of insights.items) {
      expect(item.id).toBeTruthy();
      expect(item.text.length).toBeGreaterThan(5);
      expect(item.prompt.length).toBeGreaterThan(5);
      expect(["high", "medium", "low"]).toContain(item.priority);
    }
  });

  test("chat stream responde com evento done", async ({ request }) => {
    const api = await LifeosApi.login(request);
    const loginRes = await request.post("/api/auth/login", {
      data: { email: DEV_EMAIL, password: DEV_PASSWORD },
    });
    const { token } = (await loginRes.json()) as { token: string };

    const res = await request.post("/api/case/chat/stream", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
      },
      data: { content: "Resumo rápido do meu dia.", mode: "focus" },
    });
    expect(res.ok(), `stream falhou: ${res.status()}`).toBeTruthy();
    const text = await res.text();
    expect(text).toContain("event: done");
    expect(text).toMatch(/"role"\s*:\s*"assistant"/);
  });
});

test.describe("Case C2 — UI Agora", () => {
  test("widget Case Insights visível no dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.getByRole("button", { name: /modo focus/i }).click();
    await expect(page).toHaveURL(/\/focus/, { timeout: 15_000 });

    await expect(page.getByText(/insights do dia/i)).toBeVisible({ timeout: 15_000 });
  });
});
