import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";

// Some sandboxes ship a pre-installed Chromium that may not match this Playwright
// version's expected build. Use it when present; in CI the path is absent and
// Playwright falls back to the browser it downloads itself.
const LOCAL_CHROMIUM = "/opt/pw-browsers/chromium";
const localBrowser = fs.existsSync(LOCAL_CHROMIUM)
  ? { launchOptions: { executablePath: LOCAL_CHROMIUM } }
  : {};

// Smoke tests run against the static files served locally. No app build step — just a static server.
export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:8765",
    // emulate a phone — this is a toddler PWA, mobile is the real surface
    ...devices["Pixel 5"],
    ...localBrowser,
  },
  webServer: {
    command: "python3 -m http.server 8765",
    port: 8765,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
