import { defineConfig, devices } from "@playwright/test";

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
  },
  webServer: {
    command: "python3 -m http.server 8765",
    port: 8765,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
