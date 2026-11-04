import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const chromePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : "");
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions:
      chromePath && existsSync(chromePath)
        ? { executablePath: chromePath }
        : {},
  },
  webServer: {
    command: `node node_modules/next/dist/bin/next ${process.env.TEST_PRODUCTION_BUILD === "1" ? "start" : "dev"} --hostname 127.0.0.1 --port ${new URL(process.env.TEST_BASE_URL || "http://127.0.0.1:3100").port}`,
    url: `${process.env.TEST_BASE_URL || "http://127.0.0.1:3100"}/admin/login`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
