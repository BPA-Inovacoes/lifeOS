import { test, expect } from "@playwright/test";

const DEV_EMAIL = "xavier@bpa.com";
const DEV_PASSWORD = "xavier123";

test.describe("fluxo principal", () => {
  test("login → dashboard → abrir paleta e ajuda", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.getByRole("button", { name: /comandos/i }).first().click();
    const palette = page.getByPlaceholder(/pesquisar ou criar/i);
    await expect(palette).toBeVisible();
    await palette.fill("Manual");
    await page.getByRole("option", { name: /manual de utilizador/i }).click();
    await expect(page).toHaveURL(/\/ajuda/, { timeout: 10_000 });
  });

  test("login → activar game mode → abrir command center", async ({ page }) => {
    let gameModeEnabled = false;

    await page.route("**/game/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockProfile(gameModeEnabled)),
      });
    });

    await page.route("**/game/mode", async (route) => {
      const request = route.request();
      const body = request.postDataJSON() as { enabled?: boolean };
      gameModeEnabled = Boolean(body.enabled);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockProfile(gameModeEnabled)),
      });
    });

    await page.route("**/game/dashboard", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockDashboard()),
      });
    });

    await page.goto("/login");
    await page.getByLabel(/e-mail/i).fill(DEV_EMAIL);
    await page.locator("#password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.getByRole("link", { name: /game mode/i }).click();
    await expect(page).toHaveURL(/\/game/, { timeout: 10_000 });

    await expect(page.getByText(/camada de progressão/i)).toBeVisible();

    const activate = page.getByRole("button", { name: /^game$/i }).last();
    await activate.click();

    await expect(page.getByRole("heading", { name: /command center/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});

function mockProfile(enabled: boolean) {
  return {
    gameModeEnabled: enabled,
    totalXp: 1240,
    progressXp: 1240,
    level: 8,
    rank: "Achiever",
    phase: "Awakening",
    phaseKey: "AWAKENING",
    phaseTheme: "awakening",
    prestige: 0,
    prestigeLabel: "Sem prestige",
    canPrestige: false,
    ascensionCount: 0,
    xpInLevel: 240,
    xpNeeded: 500,
    xpToNextLevel: 260,
    levelPercent: 48,
    avatarIcon: "user",
    currentStreak: 3,
    tasksCompleted: 12,
    habitsCompleted: 9,
    studyHours: 4.5,
    goalsCompleted: 2,
    activeDays: 6,
    deepWorkDays: 2,
    perfectWeeks: 0,
    consistencyRate: 20,
    evolution: {
      completedLevels: 8,
      totalLevels: 10,
      percent: 80,
    },
  };
}

function mockDashboard() {
  return {
    profile: mockProfile(true),
    attributes: [
      { key: "focus", label: "Focus", value: 82, percent: 100, tier: "A", delta: 4 },
      { key: "discipline", label: "Discipline", value: 68, percent: 83, tier: "B", delta: 3 },
      { key: "execution", label: "Execution", value: 76, percent: 93, tier: "B", delta: 5 },
      { key: "knowledge", label: "Knowledge", value: 54, percent: 66, tier: "C", delta: 2 },
      { key: "creativity", label: "Creativity", value: 48, percent: 58, tier: "C", delta: 1 },
      { key: "consistency", label: "Consistency", value: 62, percent: 76, tier: "B", delta: 3 },
      { key: "strategy", label: "Strategy", value: 58, percent: 71, tier: "C", delta: 2 },
      { key: "energy", label: "Energy", value: 44, percent: 54, tier: "C", delta: 1 },
    ],
    achievements: [
      {
        id: "streak-7",
        name: "Semana de fogo",
        description: "7 dias consecutivos activos.",
        icon: "flame",
        rarity: "RARE",
        category: "STREAK",
        xpReward: 50,
        unlocked: false,
        unlockedAt: null,
      },
    ],
    missions: [
      {
        key: "tasks-5",
        title: "Executor do dia",
        description: "Concluir 5 tarefas.",
        icon: "check-square",
        target: 5,
        progress: 2,
        completed: false,
        xpReward: 30,
      },
    ],
    activityFeed: [
      {
        id: "1",
        type: "task.completed",
        message: "Tarefa concluída · +25 XP",
        xpDelta: 25,
        createdAt: new Date().toISOString(),
      },
    ],
    weeklyXp: [
      { date: "2026-05-19", label: "Ter", taskPoints: 20, habitPoints: 5, total: 25, isToday: false },
      { date: "2026-05-20", label: "Qua", taskPoints: 0, habitPoints: 10, total: 10, isToday: false },
      { date: "2026-05-21", label: "Qui", taskPoints: 30, habitPoints: 5, total: 35, isToday: false },
      { date: "2026-05-22", label: "Sex", taskPoints: 15, habitPoints: 5, total: 20, isToday: false },
      { date: "2026-05-23", label: "Sáb", taskPoints: 0, habitPoints: 0, total: 0, isToday: false },
      { date: "2026-05-24", label: "Dom", taskPoints: 10, habitPoints: 5, total: 15, isToday: false },
      { date: "2026-05-25", label: "Seg", taskPoints: 25, habitPoints: 10, total: 35, isToday: true },
    ],
    xpDistribution: {
      tasks: 320,
      habits: 140,
      goals: 80,
      studies: 110,
    },
    heatmap: Array.from({ length: 30 }, (_, index) => ({
      date: `2026-05-${String(index + 1).padStart(2, "0")}`,
      points: index % 4 === 0 ? 0 : 20 + index,
      level: index % 4 === 0 ? 0 : 2,
    })),
    prestigeHistory: [],
  };
}
