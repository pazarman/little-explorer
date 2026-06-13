import { test, expect } from "@playwright/test";

// Skip the first-run name/buddy flow so we land on the hub deterministically.
const SKIP_INTRO = () => {
  localStorage.setItem("fionaName", "Tester");
  localStorage.setItem("fionaNameSet", "1");
  localStorage.setItem("fionaBuddy", "puppy");
  localStorage.setItem("fionaBuddySet", "1");
};

// Collect runtime errors on every test — a toddler-facing site must boot clean.
function watchErrors(page) {
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

test("boots to the hub with all worlds and no console errors", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html");

  await expect(page.locator("#hub")).toBeVisible();
  await expect(page.locator("#mapNodes .node")).toHaveCount(8);
  expect(errors, "console/page errors on boot:\n" + errors.join("\n")).toEqual([]);
});

test("can drill into a world and launch a game", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html");

  // hub -> world grid
  await page.locator("#mapNodes .node").first().click();
  await expect(page.locator("#games")).toBeVisible();
  await expect(page.locator("#gameNodes .node").first()).toBeVisible();

  // world -> a game (or creative special) screen
  await page.locator("#gameNodes .node").first().click();
  await expect(page.locator("#game, #paint, #story, #dressup")).toBeVisible();

  expect(errors, "console/page errors while playing:\n" + errors.join("\n")).toEqual([]);
});

test("exactly one full-screen surface is visible at a time", async ({ page }) => {
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html");
  await expect(page.locator("#hub")).toBeVisible();

  const visibleScreens = await page.evaluate(() =>
    [...document.querySelectorAll(".screen")].filter((s) => !s.classList.contains("hidden")).length
  );
  expect(visibleScreens).toBe(1);
});
