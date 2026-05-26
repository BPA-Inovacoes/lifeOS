import { defineConfig, devices } from "@playwright/test";

const API_PORT = process.env.API_PORT ?? "3333";
const WEB_PORT = process.env.WEB_PORT ?? "5173";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://127.0.0.1:${WEB_PORT}`,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "npm run dev",
      cwd: "../server",
      url: `http://127.0.0.1:${API_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: API_PORT,
        NODE_ENV: "test",
        LOG_LEVEL: "warn",
      },
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${WEB_PORT}`,
      url: `http://127.0.0.1:${WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
