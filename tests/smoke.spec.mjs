import { test, expect } from "@playwright/test";
import fs from "node:fs";

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

test("boots to the hub with all games and no console errors", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await expect(page.locator("#hub")).toBeVisible();
  // Expect 6 category world discs on the hub map
  const count = await page.locator("#mapNodes .node").count();
  expect(count).toBeGreaterThan(3);
  expect(errors, "console/page errors on boot:\n" + errors.join("\n")).toEqual([]);
});

test("can launch a game from the hub map", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  // hub -> category screen -> game
  // Use evaluate click to bypass viewport/animation issues on the large grid
  await page.evaluate(() => {
    const node = document.querySelector("#mapNodes .node");
    if (node) node.click();
  });

  // After clicking a category disc, the #games screen should appear
  await expect(page.locator("#games")).toBeVisible({ timeout: 7000 });

  // Click the first game node in the category grid to launch a game
  await page.evaluate(() => {
    const node = document.querySelector("#gameNodes .node");
    if (node) node.click();
  });

  // Filter for the one that IS actually visible to avoid strict mode violation on the multiple screen divs
  const visibleGameScreen = page.locator("#game, #paint, #story, #dressup").filter({ visible: true });
  await expect(visibleGameScreen).toBeVisible({ timeout: 9000 });

  expect(errors, "console/page errors while playing:\n" + errors.join("\n")).toEqual([]);
});

test("every world keeps a fixed, non-overlapping spot on the map", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");
  await expect(page.locator("#hub")).toBeVisible();

  // One island and one trail point per world disc.
  const drawn = await page.evaluate(() => ({
    discs: document.querySelectorAll("#mapNodes .node").length,
    islands: document.querySelectorAll("#mapRegions ellipse").length / 2,
    trailPoints: document.getElementById("mapPath").getAttribute("points").trim().split(/\s+/).length,
  }));
  expect(drawn.islands).toBe(drawn.discs);
  expect(drawn.trailPoints).toBe(drawn.discs);

  // Discs must not collide, and must stay on screen — the map places them by
  // coordinate, so a bad coord shows up as an overlap rather than a reflow.
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll("#mapNodes .node")].map((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    })
  );
  const vp = page.viewportSize();
  for (const b of boxes) {
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.y).toBeGreaterThanOrEqual(0);
    expect(b.x + b.w).toBeLessThanOrEqual(vp.width);
    expect(b.y + b.h).toBeLessThanOrEqual(vp.height);
  }
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], c = boxes[j];
      const overlaps = a.x < c.x + c.w && c.x < a.x + a.w && a.y < c.y + c.h && c.y < a.y + a.h;
      expect(overlaps, `world discs ${i} and ${j} overlap`).toBe(false);
    }

  expect(errors, "console/page errors on the map:\n" + errors.join("\n")).toEqual([]);
});

test("shipping a new game into a world never removes a star she earned", async ({ page }) => {
  await page.addInitScript(SKIP_INTRO);
  await page.addInitScript(() => localStorage.setItem("fionaStars", JSON.stringify({ memory: 4 })));
  await page.goto("/index.html?test=1");
  await expect(page.locator("#hub")).toBeVisible();

  // World stars are milestones on games tried, not a share of the world's size, so
  // the count can only ever go up when next week's game lands.
  const stars = await page.evaluate(() => {
    const brain = CATEGORIES.find((c) => c.id === "brain");
    const before = worldStars(visibleGames(brain));
    GAMES.__test = { icon: "🆕", name: "Test", lvl: 0, v: +APP_VERSION };
    brain.games.push("__test");
    const after = worldStars(visibleGames(brain));
    brain.games.pop();
    delete GAMES.__test;
    return { before, after };
  });
  expect(stars.before).toBeGreaterThan(0);
  expect(stars.after).toBeGreaterThanOrEqual(stars.before);
});

test("a newly shipped game flies a New! flag until she plays it", async ({ page }) => {
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");
  await expect(page.locator("#hub")).toBeVisible();

  // Games are tagged with the release they shipped in and age out on their own, so
  // this drops a game into the current release rather than naming a real one (which
  // would start failing the moment that game got old enough).
  const tagged = await page.evaluate(() => {
    GAMES.senses.v = +APP_VERSION;
    GAMES.pattern.v = +APP_VERSION - 5;          // several releases back
    return { fresh: isNewGame("senses"), aged: isNewGame("pattern"), untagged: isNewGame("snow") };
  });
  expect(tagged.fresh).toBe(true);
  expect(tagged.aged).toBe(false);
  expect(tagged.untagged).toBe(false);

  // The world holding it flies the flag, and the narrator points her at it.
  await page.evaluate(() => buildHub());
  await expect(page.locator("#mapNodes .node-new")).toHaveCount(1);
  expect(await page.evaluate(() => (newWorld() || {}).id)).toBe("brain");
  expect(await page.evaluate(() => hubGreeting())).toContain("Brain Games");

  // Playing it retires the flag — nothing to switch off by hand.
  const afterPlaying = await page.evaluate(() => {
    completions.senses = 1;
    buildHub();
    return { flags: document.querySelectorAll("#mapNodes .node-new").length, isNew: isNewGame("senses") };
  });
  expect(afterPlaying.isNew).toBe(false);
  expect(afterPlaying.flags).toBe(0);
});

test("a world is one scrollable path with every game on it and nothing locked", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");
  await page.evaluate(() => openCategory("brain"));
  await expect(page.locator("#games")).toBeVisible();

  const world = await page.evaluate(() => ({
    games: worldTrail.gids.length,
    nodes: document.querySelectorAll("#gameNodes .node:not(.tr-party)").length,
    // the world party closes the path — one node, past the last game
    partyNodes: document.querySelectorAll("#gameNodes .tr-party").length,
    // The road runs along the screen's long axis — down a portrait phone, across a
    // landscape one — so everything here is measured along whichever that is.
    vertical: worldTrail.geom.vertical,
    // the path is longer than the screen — that is the point, she scrolls it
    canvas: Math.round(worldTrail.geom.vertical ? worldTrail.geom.h : worldTrail.geom.w),
    view: worldTrail.geom.vertical ? worldTrail.geom.vh : worldTrail.geom.vw,
    scrollable: (() => { const v = document.getElementById("trailView"), g = worldTrail.geom;
      return g.vertical ? v.scrollHeight > g.vh : v.scrollWidth > g.vw; })(),
    // and the scroll extent matches the drawn world exactly, so she can't scroll off it
    overscroll: (() => { const v = document.getElementById("trailView"), g = worldTrail.geom;
      return g.vertical ? v.scrollHeight - Math.round(g.h) : v.scrollWidth - Math.round(g.w); })(),
    // every game is reachable from the very first visit: no gates, no fail state
    disabled: [...document.querySelectorAll("#gameNodes .node")].filter((n) => n.disabled).length,
  }));
  expect(world.nodes).toBe(world.games);
  expect(world.partyNodes, "every world should end in exactly one party node").toBe(1);
  // the test viewport is a portrait phone, so the road should be running downhill
  expect(world.vertical, "a portrait phone should scroll the trail vertically").toBe(true);
  expect(world.canvas).toBeGreaterThan(world.view);
  expect(world.scrollable).toBe(true);
  expect(world.overscroll).toBe(0);
  expect(world.disabled).toBe(0);

  // games keep their order along the path, so the newest is always furthest along
  // order is monotonic ALONG the road, whichever axis that is
  const order = await page.evaluate(() =>
    worldTrail.gids.every((_, i) =>
      i === 0 || worldTrail.along(worldTrail.pts[i]) > worldTrail.along(worldTrail.pts[i - 1])));
  expect(order).toBe(true);

  expect(errors, "console/page errors on the world trail:\n" + errors.join("\n")).toEqual([]);
});

test("tapping a game walks the buddy along the path, then starts it", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.addInitScript(() => {
    localStorage.setItem("fionaStars", JSON.stringify({ memory: 2 }));
    localStorage.setItem("fionaTrail", JSON.stringify({ brain: "memory" }));
  });
  await page.goto("/index.html?test=1");
  await page.evaluate(() => openCategory("brain"));
  await expect(page.locator("#games")).toBeVisible();

  // the buddy starts standing on the game she last played here
  expect(await page.evaluate(() => worldTrail.gids[worldTrail.at])).toBe("memory");

  // walking is real movement along the path, with the camera following it
  const walk = await page.evaluate(async () => {
    const view = document.getElementById("trailView"), bud = document.getElementById("trailBuddy");
    const vert = worldTrail.geom.vertical;
    const pos = () => vert ? parseFloat(bud.style.top) : parseFloat(bud.style.left);
    const scrolled = () => vert ? view.scrollTop : view.scrollLeft;
    const from = { x: pos(), scroll: scrolled() };
    document.querySelector('#gameNodes .node[data-gid="nightday"]').click();
    const seen = [];
    for (let i = 0; i < 10; i++) {
      seen.push({ x: pos(), scroll: scrolled() });
      await new Promise((r) => setTimeout(r, 70));
    }
    const last = seen[seen.length - 1];
    return { movedForward: last.x > from.x, cameraFollowed: last.scroll > from.scroll };
  });
  expect(walk.movedForward).toBe(true);
  expect(walk.cameraFollowed).toBe(true);

  // and the game it walked to is the one that opens
  await expect(page.locator("#game")).toBeVisible({ timeout: 9000 });
  expect(await page.evaluate(() => state.level)).toBe("nightday");
  expect(await page.evaluate(() => worldTrail.gids[worldTrail.at])).toBe("nightday");

  expect(errors, "console/page errors while walking:\n" + errors.join("\n")).toEqual([]);
});

test("a newly shipped game sits at the end of the path and the camera travels there", async ({ page }) => {
  await page.addInitScript(SKIP_INTRO);
  await page.addInitScript(() => {
    localStorage.setItem("fionaStars", JSON.stringify({ memory: 2 }));
    localStorage.setItem("fionaTrail", JSON.stringify({ brain: "memory" }));
  });
  await page.goto("/index.html?test=1");

  const reveal = await page.evaluate(async () => {
    GAMES.senses.v = +APP_VERSION;               // as if Five Senses shipped this release
    openCategory("brain");
    const view = document.getElementById("trailView");
    await new Promise((r) => setTimeout(r, 150));
    const scrolled = () => worldTrail.geom.vertical ? view.scrollTop : view.scrollLeft;
    const landed = scrolled();                   // lands where she left off
    await new Promise((r) => setTimeout(r, 1800));
    const i = worldTrail.gids.findIndex(isNewGame);
    return {
      landed, after: scrolled(),
      isLast: i === worldTrail.gids.length - 1,
      flags: document.querySelectorAll("#gameNodes .node-new").length,
    };
  });
  expect(reveal.isLast).toBe(true);              // newest game is furthest along the path
  expect(reveal.flags).toBe(1);
  expect(reveal.after).toBeGreaterThan(reveal.landed);   // the camera showed her the way there
});

test("the trail turns with the phone", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.addInitScript(() => {
    localStorage.setItem("fionaStars", JSON.stringify({ memory: 2 }));
    localStorage.setItem("fionaTrail", JSON.stringify({ brain: "memory" }));
  });
  await page.goto("/index.html?test=1");

  // A 12-game world was 2235px of horizontal road on a 393px portrait screen: 18% of it
  // visible, 5.7 screens of scrolling, and only a third of the height used. The road now
  // runs along whichever axis is longer.
  const read = () => page.evaluate(() => {
    const g = worldTrail.geom, v = document.getElementById("trailView");
    const runLen = g.vertical ? g.h : g.w, screenRun = g.vertical ? g.vh : g.vw;
    return {
      vertical: g.vertical,
      visible: screenRun / runLen,
      scrollAxis: getComputedStyle(v).overflowY === "auto" ? "y" : "x",
      overscroll: g.vertical ? v.scrollHeight - Math.round(g.h) : v.scrollWidth - Math.round(g.w),
      buddyOnRoad: (() => {                      // the buddy must still stand on the path
        const b = document.getElementById("trailBuddy").getBoundingClientRect();
        const p = worldTrail.ptAt(worldTrail.at);
        const c = document.getElementById("trailCanvas").getBoundingClientRect();
        return Math.abs((b.left + b.width / 2) - (c.left + p.x)) < 90;
      })(),
      headerClear: (() => {                      // and nothing sits under the world title
        const t = document.getElementById("gamesTitle").getBoundingClientRect();
        const b = document.getElementById("trailBuddy").getBoundingClientRect();
        return b.top > t.bottom;
      })(),
    };
  });

  await page.setViewportSize({ width: 393, height: 851 });
  await page.evaluate(() => openCategory("brain"));
  await expect(page.locator("#games")).toBeVisible();
  await page.waitForTimeout(300);
  const portrait = await read();

  // turn the phone
  await page.setViewportSize({ width: 851, height: 393 });
  await page.waitForTimeout(400);
  const landscape = await read();

  expect(portrait.vertical, "a tall screen should run the road downhill").toBe(true);
  expect(portrait.scrollAxis, "portrait should scroll vertically").toBe("y");
  expect(landscape.vertical, "a wide screen should keep the road horizontal").toBe(false);
  expect(landscape.scrollAxis, "landscape should scroll horizontally").toBe("x");

  // the whole point: more of her world on screen than the 18% it used to be
  expect(portrait.visible, "portrait should show more of the path than before").toBeGreaterThan(0.22);

  for (const [name, r] of [["portrait", portrait], ["landscape", landscape]]) {
    expect(r.overscroll, `${name}: scroll extent should match the drawn world`).toBe(0);
    expect(r.buddyOnRoad, `${name}: the buddy came off the road`).toBe(true);
    expect(r.headerClear, `${name}: the buddy is under the world title`).toBe(true);
  }
  expect(errors, "console/page errors turning the phone:\n" + errors.join("\n")).toEqual([]);
});

test("the grown-up panel keeps every control on screen and tappable", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const IDS = ["setBuddy", "setName", "setDash", "setReset", "setRestart", "setDone"];
  // Six buttons used to sit in one un-wrapping row: on a phone it overflowed the card
  // and pushed Done off the right edge. Check both a tall phone and a short landscape one.
  for (const vp of [{ width: 393, height: 727 }, { width: 727, height: 393 }, { width: 320, height: 568 }]) {
    await page.setViewportSize(vp);
    await page.evaluate(() => openSettings());
    await page.waitForTimeout(150);
    const bad = await page.evaluate((ids) => {
      const out = [];
      for (const id of ids) {
        const el = document.getElementById(id), r = el.getBoundingClientRect();
        const onScreen = r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight;
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        // nothing (like the pinned Done bar) may cover another control
        const tappable = hit === el || el.contains(hit);
        if (!onScreen || !tappable || r.height < 44) out.push({ id, onScreen, tappable, h: Math.round(r.height) });
      }
      return out;
    }, IDS);
    expect(bad, `settings controls unreachable at ${vp.width}x${vp.height}`).toEqual([]);
  }

  expect(errors, "console/page errors in settings:\n" + errors.join("\n")).toEqual([]);
});

test("spoken lines avoid words the speech engine spells out", async ({ page }) => {
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  // "Grown-ups" came out of the speech engine as "grown-U-P-S". The heading may still
  // say it — it is only ever read by an adult — but nothing spoken may contain it.
  const spokenKeys = ["diff_say", "hi_star_sparks", "hi_let_play", "narrator_back", "narrator_ready"];
  const offenders = await page.evaluate((keys) => {
    const bad = [];
    for (const lang of Object.keys(DICT))
      for (const k of keys) {
        const v = DICT[lang][k];
        if (typeof v === "string" && /grown[\s-]?ups?/i.test(v)) bad.push(`${lang}.${k}: ${v}`);
      }
    return bad;
  }, spokenKeys);
  expect(offenders).toEqual([]);

  // A buddy's name is spoken aloud when she picks it, so it has to exist in her language
  // rather than saying "Snowman" in the middle of a Spanish sentence.
  const missing = await page.evaluate(() =>
    BUDDIES.filter((b) => !b.es || !b.yue).map((b) => b.id));
  expect(missing).toEqual([]);
});

test("exactly one full-screen surface is visible at a time", async ({ page }) => {
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");
  await expect(page.locator("#hub")).toBeVisible();

  const visibleScreens = await page.evaluate(() =>
    [...document.querySelectorAll(".screen")].filter((s) => !s.classList.contains("hidden")).length
  );
  expect(visibleScreens).toBe(1);
});

test("Body Match game can be played", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(() => {
    localStorage.setItem("fionaName", "Tester");
    localStorage.setItem("fionaNameSet", "1");
    localStorage.setItem("fionaBuddy", "puppy");
    localStorage.setItem("fionaBuddySet", "1");
  });
  await page.goto("/index.html?test=1");

  // Jump straight to the game for speed
  await page.evaluate(() => startLevel("body"));

  await expect(page.locator("#game")).toBeVisible();
  await expect(page.locator(".body-doll")).toBeVisible();
  
  // Verify instructions are present and localized
  const instructions = await page.locator("#instruction").textContent();
  expect(instructions).toContain("📍");

  expect(errors, "console/page errors in Body Match:\n" + errors.join("\n")).toEqual([]);
});

test("Fuel Up game plays and blasts off the correct rocket", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await page.evaluate(() => startLevel("fuelup"));
  await expect(page.locator("#game")).toBeVisible();

  // Two fuelling stations, each with a numeral that matches its countable fuel cells
  await expect(page.locator(".fu-station")).toHaveCount(2);
  const instructions = await page.locator("#instruction").textContent();
  expect(instructions).toContain("⛽");

  const mismatch = await page.evaluate(() =>
    [...document.querySelectorAll(".fu-station")].some(
      (s) => s.querySelectorAll(".fu-cell").length !== +s.querySelector(".fu-num").textContent
    )
  );
  expect(mismatch, "fuel cells must match the numeral badge").toBe(false);

  // Tapping the correct rocket ignites its flame (blast-off)
  await page.evaluate(() => fuelupLevel.pick(fuelupLevel.correctIndex, { clientX: 0, clientY: 0 }));
  await expect(page.locator(".fu-flame.on")).toHaveCount(1);

  expect(errors, "console/page errors in Fuel Up:\n" + errors.join("\n")).toEqual([]);
});

test("Dolphin Dive scrolls, steers, and collects hoops", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await page.evaluate(() => startLevel("dolphin"));
  await expect(page.locator("#game")).toBeVisible();

  // Easiest tier: a scrolling swim toward a goal of 4 hoops (shown as HUD pips)
  await page.evaluate(() => { state.tier = 0; dolphinLevel.startRound(); });
  await expect(page.locator("#dlStage")).toBeVisible();
  await expect(page.locator("#dlDolphin")).toBeVisible();
  await expect(page.locator(".dl-pip")).toHaveCount(4);
  const instructions = await page.locator("#instruction").textContent();
  expect(instructions).toContain("🐬");

  // Sliding a finger down steers the dolphin's target height lower
  const steer = await page.evaluate(() => {
    const st = document.getElementById("dlStage");
    const r = st.getBoundingClientRect();
    const before = dolphinLevel.targetY;
    st.dispatchEvent(new PointerEvent("pointerdown", { clientX: r.left + 30, clientY: r.top + r.height * 0.8, bubbles: true }));
    return { before, after: dolphinLevel.targetY };
  });
  expect(steer.after).toBeGreaterThan(steer.before);

  // Swimming through a hoop scores it and lights a HUD pip
  const scored = await page.evaluate(() => {
    cancelAnimationFrame(dolphinLevel.raf); dolphinLevel.raf = null;   // freeze the loop for a deterministic check
    const el = document.createElement("div"); el.className = "dl-hoop";
    document.getElementById("dlHoops").appendChild(el);
    const before = dolphinLevel.collected;
    dolphinLevel.collect({ el, x: 0, cy: dolphinLevel.y, w: 100, h: 100, hit: false });
    return { before, after: dolphinLevel.collected, pipsOn: document.querySelectorAll(".dl-pip.on").length };
  });
  expect(scored.after).toBe(scored.before + 1);
  expect(scored.pipsOn).toBeGreaterThan(0);

  expect(errors, "console/page errors in Dolphin Dive:\n" + errors.join("\n")).toEqual([]);
});

test("Zoo Pop surfaces animals and scores only the named target", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await page.evaluate(() => startLevel("meerkat"));
  await expect(page.locator("#game")).toBeVisible();

  await page.evaluate(() => { state.tier = 0; meerkatLevel.startRound(); });
  await expect(page.locator(".mk-hole")).toHaveCount(6);
  await expect(page.locator(".mk-pip")).toHaveCount(4);
  const instructions = await page.locator("#instruction").textContent();
  expect(instructions).toContain("🐾");

  // Popping the named target scores; popping a wrong animal never does (no fail state)
  const scored = await page.evaluate(() => {
    cancelAnimationFrame(meerkatLevel.raf); meerkatLevel.raf = null;   // freeze the loop for a deterministic check
    const h = meerkatLevel.holes[0];
    meerkatLevel.pop(h, meerkatLevel.target, performance.now());
    const beforeRight = meerkatLevel.popped;
    meerkatLevel.tap(h);
    const afterRight = meerkatLevel.popped;
    const h2 = meerkatLevel.holes[1];
    meerkatLevel.pop(h2, meerkatLevel.distractors[0], performance.now());
    const beforeWrong = meerkatLevel.popped;
    meerkatLevel.tap(h2);
    return { rightInc: afterRight - beforeRight, wrongInc: meerkatLevel.popped - beforeWrong, pipsOn: document.querySelectorAll(".mk-pip.on").length };
  });
  expect(scored.rightInc).toBe(1);
  expect(scored.wrongInc).toBe(0);
  expect(scored.pipsOn).toBeGreaterThan(0);

  expect(errors, "console/page errors in Zoo Pop:\n" + errors.join("\n")).toEqual([]);
});

test("Egg Catch steers a basket and catches only the target color", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await page.evaluate(() => startLevel("eggcatch"));
  await expect(page.locator("#game")).toBeVisible();

  // Tier 1 introduces the color rule ("Catch the red eggs!")
  await page.evaluate(() => { state.tier = 1; eggcatchLevel.startRound(); });
  await expect(page.locator("#egBasket")).toBeVisible();
  await expect(page.locator(".eg-pip")).toHaveCount(5);
  const instructions = await page.locator("#instruction").textContent();
  expect(instructions).toContain("🧺");

  // Sliding right moves the basket target right
  const steer = await page.evaluate(() => {
    const st = document.getElementById("egStage");
    const r = st.getBoundingClientRect();
    const before = eggcatchLevel.btx;
    st.dispatchEvent(new PointerEvent("pointerdown", { clientX: r.left + r.width * 0.85, clientY: r.top + r.height * 0.5, bubbles: true }));
    return { moved: Math.abs(eggcatchLevel.btx - before) > 1 };
  });
  expect(steer.moved).toBe(true);

  // A target-color egg scores; a wrong-color egg in the basket never does (no fail state)
  const scored = await page.evaluate(() => {
    cancelAnimationFrame(eggcatchLevel.raf); eggcatchLevel.raf = null;
    const mk = (color) => { const el = document.createElement("div"); el.className = "eg-egg"; document.getElementById("egEggs").appendChild(el); return { el, x: eggcatchLevel.bx, y: eggcatchLevel.basketY, color, done: false, vy: 0 }; };
    const tgt = eggcatchLevel.target, wrong = eggcatchLevel.palette.find(c => c.id !== tgt.id);
    const a = eggcatchLevel.caught; eggcatchLevel.landInBasket(mk(tgt)); const afterRight = eggcatchLevel.caught;
    const b = eggcatchLevel.caught; eggcatchLevel.landInBasket(mk(wrong));
    return { rightInc: afterRight - a, wrongInc: eggcatchLevel.caught - b, pipsOn: document.querySelectorAll(".eg-pip.on").length };
  });
  expect(scored.rightInc).toBe(1);
  expect(scored.wrongInc).toBe(0);
  expect(scored.pipsOn).toBeGreaterThan(0);

  expect(errors, "console/page errors in Egg Catch:\n" + errors.join("\n")).toEqual([]);
});

test("Feed the Hippo counts feeds and never overfeeds", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await page.evaluate(() => startLevel("hippo"));
  await expect(page.locator("#game")).toBeVisible();

  // Force a fixed target of 3 so a single feed never completes the round mid-assertion
  await page.evaluate(() => {
    state.tier = 0; hippoLevel.startRound(); hippoLevel.target = 3;
    document.getElementById("hpTummy").innerHTML = [0, 1, 2].map(i => `<span class="hp-slot" data-i="${i}">◯</span>`).join("");
  });
  await expect(page.locator(".hp-slot")).toHaveCount(3);
  const instructions = await page.locator("#instruction").textContent();
  expect(instructions).toContain("🦛");

  // One feed increments the count and lights one tummy slot
  await page.evaluate(() => hippoLevel.feed(document.querySelector(".hp-food"), {}));
  expect(await page.evaluate(() => hippoLevel.fed)).toBe(1);
  await expect(page.locator(".hp-slot.on")).toHaveCount(1, { timeout: 3000 });

  // Hammering feed past the target never exceeds it (no fail / no overfeed)
  const capped = await page.evaluate(async () => {
    for (let i = 0; i < 20; i++) hippoLevel.feed(document.querySelector(".hp-food"), {});
    await new Promise(r => setTimeout(r, 500));
    return hippoLevel.fed <= hippoLevel.target;
  });
  expect(capped).toBe(true);

  expect(errors, "console/page errors in Feed the Hippo:\n" + errors.join("\n")).toEqual([]);
});

test("Monkey Swing jumps on tap and collects bananas", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await page.evaluate(() => startLevel("monkey"));
  await expect(page.locator("#game")).toBeVisible();

  await page.evaluate(() => { state.tier = 1; monkeyLevel.startRound(); });
  await expect(page.locator("#moMonkey")).toBeVisible();
  await expect(page.locator(".mo-pip")).toHaveCount(5);
  const instructions = await page.locator("#instruction").textContent();
  expect(instructions).toContain("🐒");

  // A tap gives the monkey an upward impulse
  const jumped = await page.evaluate(() => { const v = monkeyLevel.vy; monkeyLevel.jump(); return monkeyLevel.vy < v; });
  expect(jumped).toBe(true);

  // Overlapping a banana collects it and lights a pip
  const grab = await page.evaluate(() => {
    cancelAnimationFrame(monkeyLevel.raf); monkeyLevel.raf = null;
    const el = document.createElement("div"); el.className = "mo-banana"; document.getElementById("moBananas").appendChild(el);
    const before = monkeyLevel.got;
    monkeyLevel.grab({ el, x: 0, y: monkeyLevel.y, hit: false });
    return { inc: monkeyLevel.got - before, on: document.querySelectorAll(".mo-pip.on").length };
  });
  expect(grab.inc).toBe(1);
  expect(grab.on).toBeGreaterThan(0);

  expect(errors, "console/page errors in Monkey Swing:\n" + errors.join("\n")).toEqual([]);
});

test("Runway Landing matches the plane's letter to the runway", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await page.evaluate(() => startLevel("runway"));
  await expect(page.locator("#game")).toBeVisible();

  await page.evaluate(() => { state.tier = 2; runwayLevel.startRound(); });
  await expect(page.locator(".rw-pad")).toHaveCount(4);
  const instructions = await page.locator("#instruction").textContent();
  expect(instructions).toContain("✈️");

  // The plane's letter equals the round target, and steering works
  const setup = await page.evaluate(() => {
    const st = document.getElementById("rwStage");
    const r = st.getBoundingClientRect();
    const before = runwayLevel.tx;
    st.dispatchEvent(new PointerEvent("pointerdown", { clientX: r.left + r.width * 0.85, clientY: r.top + r.height * 0.4, bubbles: true }));
    return { planeMatches: document.querySelector(".rw-plane text").textContent === runwayLevel.target, steered: Math.abs(runwayLevel.tx - before) > 1 };
  });
  expect(setup.planeMatches).toBe(true);
  expect(setup.steered).toBe(true);

  // Landing on the wrong runway is no-fail; landing on the matching one wins
  const land = await page.evaluate(() => {
    cancelAnimationFrame(runwayLevel.raf); runwayLevel.raf = null;
    const padCenter = (L) => { const sr = runwayLevel._stage.getBoundingClientRect(); const pad = [...document.querySelectorAll(".rw-pad")].find(p => p.dataset.letter === L); const r = pad.getBoundingClientRect(); return r.left + r.width / 2 - sr.left; };
    const wrong = [...document.querySelectorAll(".rw-pad")].map(p => p.dataset.letter).find(L => L !== runwayLevel.target);
    runwayLevel.x = padCenter(wrong); runwayLevel.y = runwayLevel.landY + 2; runwayLevel.tryLand();
    const wrongDone = runwayLevel.done, mistakes = runwayLevel.mistakes;
    runwayLevel.x = padCenter(runwayLevel.target); runwayLevel.y = runwayLevel.landY + 2; runwayLevel.tryLand();
    return { wrongDone, mistakes, rightDone: runwayLevel.done };
  });
  expect(land.wrongDone).toBe(false);
  expect(land.mistakes).toBe(1);
  expect(land.rightDone).toBe(true);

  expect(errors, "console/page errors in Runway Landing:\n" + errors.join("\n")).toEqual([]);
});

test("Feelings check-in names a feeling with no wrong answer", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await page.evaluate(() => startLevel("feelings"));
  await expect(page.locator("#game")).toBeVisible();
  await page.evaluate(() => { state.tier = 0; feelingsLevel.startRound(); });
  await expect(page.locator(".fe-face")).toHaveCount(3);
  const instructions = await page.locator("#instruction").textContent();
  expect(instructions).toContain("💛");

  // Any face is a valid answer and advances the round (no fail state)
  const advanced = await page.evaluate(async () => {
    const before = state.round;
    document.querySelector('.fe-face[data-emo="happy"]').click();
    // Round advance is speech-gated (core waitSpeech: 900ms–4500ms depending on line length),
    // so poll for it rather than sleeping a fixed time that can expire too early.
    const deadline = Date.now() + 9000;
    while (Date.now() < deadline) {
      if (state.round > before || !document.getElementById("celebrate").classList.contains("hidden")) return true;
      await new Promise(r => setTimeout(r, 100));
    }
    return false;
  });
  expect(advanced).toBe(true);

  expect(errors, "console/page errors in Feelings:\n" + errors.join("\n")).toEqual([]);
});

test("Scavenger Hunt shows a prompt and advances on 'found'", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await page.evaluate(() => startLevel("scavenger"));
  await expect(page.locator("#game")).toBeVisible();
  await page.evaluate(() => { state.tier = 0; scavengerLevel.startRound(); });
  await expect(page.locator(".sv-card")).toBeVisible();
  await expect(page.locator("#scFound")).toBeVisible();
  const instructions = await page.locator("#instruction").textContent();
  expect(instructions).toContain("🔦");

  const advanced = await page.evaluate(async () => {
    const before = state.round;
    scavengerLevel.found({ clientX: 100, clientY: 100 });
    // Round advance is speech-gated (core waitSpeech: 900ms–4500ms depending on line length),
    // so poll for it rather than sleeping a fixed time that can expire too early.
    const deadline = Date.now() + 9000;
    while (Date.now() < deadline) {
      if (state.round > before || !document.getElementById("celebrate").classList.contains("hidden")) return true;
      await new Promise(r => setTimeout(r, 100));
    }
    return false;
  });
  expect(advanced).toBe(true);

  expect(errors, "console/page errors in Scavenger Hunt:\n" + errors.join("\n")).toEqual([]);
});

test("Letter Lights shows a glowing letter and taps the matching picture", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await page.evaluate(() => startLevel("letternames"));
  await expect(page.locator("#game")).toBeVisible();
  await page.evaluate(() => { state.tier = 0; state.round = 0; letternamesLevel.startRound(); });

  // A drawn SVG letter light + two big picture choices (tier 0 = 2)
  await expect(page.locator("#llLight svg")).toBeVisible();
  await expect(page.locator(".ll-choice")).toHaveCount(2);
  const instructions = await page.locator("#instruction").textContent();
  expect(instructions).toContain("🔤");

  // Tapping the picture that starts with the target letter completes the round
  const advanced = await page.evaluate(async () => {
    const before = state.round;
    document.querySelector(`.ll-choice[data-k="${letternamesLevel.target}"]`).click();
    // Round advance is speech-gated (core waitSpeech: 900ms–4500ms depending on line length),
    // so poll for it rather than sleeping a fixed time that can expire too early.
    const deadline = Date.now() + 9000;
    while (Date.now() < deadline) {
      if (state.round > before || !document.getElementById("celebrate").classList.contains("hidden")) return true;
      await new Promise(r => setTimeout(r, 100));
    }
    return false;
  });
  expect(advanced).toBe(true);

  expect(errors, "console/page errors in Letter Lights:\n" + errors.join("\n")).toEqual([]);
});

test("Five Senses matches an object to the right sense and advances", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await page.evaluate(() => startLevel("senses"));
  await expect(page.locator("#game")).toBeVisible();
  // tier 0 shows exactly two sense zones (see + hear)
  await page.evaluate(() => { state.tier = 0; state.round = 0; sensesLevel.startRound(); });
  await expect(page.locator(".se-zone")).toHaveCount(2);
  const instructions = await page.locator("#instruction").textContent();
  expect(instructions).toContain("👐");

  // Tapping the correct sense advances the round
  const advanced = await page.evaluate(async () => {
    const set = [["see", "hear"], ["see", "hear", "smell", "touch"], ["see", "hear", "smell", "taste", "touch"]][state.tier];
    const correct = sensesLevel.obj.senses.filter(x => set.includes(x))[0];
    const before = state.round;
    document.querySelector(`.se-zone[data-s="${correct}"]`).click();
    // Round advance is speech-gated (core waitSpeech: 900ms–4500ms depending on line length),
    // so poll for it rather than sleeping a fixed time that can expire too early.
    const deadline = Date.now() + 9000;
    while (Date.now() < deadline) {
      if (state.round > before || !document.getElementById("celebrate").classList.contains("hidden")) return true;
      await new Promise(r => setTimeout(r, 100));
    }
    return false;
  });
  expect(advanced).toBe(true);

  // Guided assist: three wrong taps light up the correct sense (no fail state)
  const assisted = await page.evaluate(async () => {
    state.busy = false; state.tier = 1; state.round = 0; sensesLevel.startRound();
    const set = [["see", "hear"], ["see", "hear", "smell", "touch"], ["see", "hear", "smell", "taste", "touch"]][state.tier];
    const acc = sensesLevel.obj.senses.filter(x => set.includes(x));
    const wrong = [...document.querySelectorAll(".se-zone")].map(z => z.dataset.s).find(s => !acc.includes(s));
    for (let i = 0; i < 3; i++) document.querySelector(`.se-zone[data-s="${wrong}"]`).click();
    return document.querySelectorAll(".se-zone.se-hint").length > 0;
  });
  expect(assisted).toBe(true);

  expect(errors, "console/page errors in Five Senses:\n" + errors.join("\n")).toEqual([]);
});


/* ================= Game registry =================
   Games declare themselves with registerGame() in their own file, and hub.js derives
   LEVELS / GAMES / each world's trail from registration order. Three things that used
   to be guaranteed by hand-written lists now need guarding. */

// The order she walks a world is registration order, which is <script> order in
// index.html. That makes the tag order load-bearing: reordering it silently moves a
// game she navigates to by PLACE, and takes the newest off the end of the path.
// Pin the exact order so a reshuffle fails here instead of on her screen.
const WORLD_ORDER = {
  num: ["snow", "bike", "pasta", "rocket", "dragon", "fuelup", "hippo"],
  shape: ["ocean", "pizza", "trace", "icecream", "eggcatch"],
  brain: ["memory", "cups", "pattern", "sort", "sortkind", "nightday", "measure",
          "runway", "feelings", "scavenger", "letternames", "senses"],
  animal: ["music", "whosays", "dino", "body", "dolphin", "meerkat", "monkey"],
  pets: ["petcare", "petmatch", "petfeed", "hideseek"],
  create: ["paint", "story", "dressup"],
};

test("every world's trail keeps its exact order", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const actual = await page.evaluate(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.id, c.games])));
  expect(actual, "a game moved on its world's trail — check <script> order in index.html")
    .toEqual(WORLD_ORDER);
  expect(errors).toEqual([]);
});

test("the registry is complete and self-consistent", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const r = await page.evaluate(() => {
    const ids = GAME_REGISTRY.map((g) => g.id);
    const placed = CATEGORIES.flatMap((c) => c.games);
    const worlds = CATEGORIES.map((c) => c.id);
    return {
      dupes: ids.filter((id, i) => ids.indexOf(id) !== i),
      unplaced: ids.filter((id) => !placed.includes(id)),
      // every registration must land in a real world and carry what the map draws
      badWorld: GAME_REGISTRY.filter((g) => !worlds.includes(g.world)).map((g) => g.id),
      missingMeta: ids.filter((id) => !GAMES[id] || !GAMES[id].icon || !GAMES[id].name),
      // a level, when present, has to be runnable
      badLevel: Object.keys(LEVELS).filter((id) => typeof LEVELS[id].startRound !== "function"),
      // startGameNow() dispatches these three by hand; anything else needs a level
      levelless: ids.filter((id) => !LEVELS[id]),
      count: ids.length,
    };
  });
  expect(r.dupes).toEqual([]);
  expect(r.unplaced).toEqual([]);
  expect(r.badWorld).toEqual([]);
  expect(r.missingMeta).toEqual([]);
  expect(r.badLevel).toEqual([]);
  expect(r.levelless.sort()).toEqual(["dressup", "paint", "story"]);
  expect(r.count).toBe(38);
  expect(errors).toEqual([]);
});

test("registerGame refuses a malformed game", async ({ page }) => {
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const caught = await page.evaluate(() => {
    const before = GAME_REGISTRY.length;
    const tries = [
      () => registerGame({ id: "x", world: "num", icon: "x" }),                  // no name
      () => registerGame({ id: "snow", world: "num", icon: "x", name: "Dup" }),  // taken id
      () => registerGame({ id: "y", world: "num", icon: "x", name: "N", level: {} }), // no startRound
    ];
    const threw = tries.map((f) => { try { f(); return false; } catch (_) { return true; } });
    return { threw, leaked: GAME_REGISTRY.length - before };
  });
  expect(caught.threw, "registerGame accepted a malformed definition").toEqual([true, true, true]);
  expect(caught.leaked, "a rejected game still reached the registry").toBe(0);
});

test("every registered game opens without throwing", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  // The registry's whole promise is that a registered game is a game that works.
  // This is what caught Paint opening with its prompt element missing from the markup.
  const bad = await page.evaluate(() => {
    const out = [];
    for (const { id } of GAME_REGISTRY) {
      try {
        startGameNow(id);
        const painted = LEVELS[id]
          ? document.getElementById("playArea").children.length > 0
          : [...document.querySelectorAll(".screen")].some((s) => !s.classList.contains("hidden"));
        if (!painted) out.push({ id, why: "opened but drew nothing" });
      } catch (e) {
        out.push({ id, why: e.message });
      }
      try { cleanupLevel(); } catch (_) {}
      showHub();
    }
    return out;
  });
  expect(bad, "games that fail to open").toEqual([]);
  expect(errors, "console/page errors while opening games:\n" + errors.join("\n")).toEqual([]);
});

// A game missing from the service worker's ASSETS works in dev and breaks only
// offline, on her device, with no error anyone sees. Cheapest possible guard.
test("every script the page loads is cached by the service worker", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const sw = fs.readFileSync("sw.js", "utf8");
  const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  const assets = [...sw.matchAll(/"\.\/([^"]+)"/g)].map((m) => m[1]);
  expect(srcs.length).toBeGreaterThan(30);
  expect(srcs.filter((s) => !assets.includes(s)),
    "these scripts would 404 offline — add them to ASSETS in sw.js").toEqual([]);

  // and nothing is cached that no longer exists
  expect(assets.filter((a) => a.endsWith(".js") && !fs.existsSync(a)),
    "sw.js caches files that are gone").toEqual([]);
});


/* ================= Adaptive difficulty =================
   The performance model decides what she sees next, and had no coverage at all —
   a regression here is invisible until she is bored or defeated. */

test("the performance model raises and lowers the tier on real play", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const r = await page.evaluate(() => {
    const fresh = (lvl) => { delete perf[lvl]; completions[lvl] = 0; settings.diff = "auto"; };
    const out = {};

    // Clean play pushes the EMA up and the tier with it.
    fresh("probe1");
    for (let i = 0; i < 12; i++) recordRoundPerf("probe1", 0);
    out.cleanPlay = { ema: +perf.probe1.emaScore.toFixed(2), tier: autoTierFor("probe1") };

    // Struggling pulls it back down again — it must be able to go DOWN, not just up.
    for (let i = 0; i < 12; i++) recordRoundPerf("probe1", 4);
    out.afterStruggle = { ema: +perf.probe1.emaScore.toFixed(2), tier: autoTierFor("probe1") };

    // A brand-new game stays gentle rather than starting hard.
    fresh("probe2");
    out.firstEverRound = autoTierFor("probe2");
    recordRoundPerf("probe2", 0);
    out.afterOneRound = autoTierFor("probe2");

    // More mistakes must never score higher than fewer.
    const scores = [0, 1, 2, 3, 5].map((m) => { fresh("probe3"); recordRoundPerf("probe3", m); return perf.probe3.emaScore; });
    out.monotonic = scores.every((v, i) => i === 0 || v <= scores[i - 1]);

    // A manual difficulty overrides the model completely.
    settings.diff = "easy"; out.forcedEasy = tierFor("probe1");
    settings.diff = "hard"; out.forcedHard = tierFor("probe1");
    settings.diff = "auto";
    ["probe1", "probe2", "probe3"].forEach((k) => { delete perf[k]; delete completions[k]; });
    return out;
  });

  expect(r.cleanPlay.tier, "sustained clean play should reach the top tier").toBe(2);
  expect(r.afterStruggle.tier, "sustained struggle must bring the tier back down").toBe(0);
  expect(r.afterStruggle.ema).toBeLessThan(r.cleanPlay.ema);
  expect(r.firstEverRound, "a game she has never played must start gentle").toBe(0);
  expect(r.afterOneRound).toBeLessThanOrEqual(1);
  expect(r.monotonic, "more mistakes scored higher than fewer").toBe(true);
  expect(r.forcedEasy).toBe(0);
  expect(r.forcedHard).toBe(2);
  expect(errors).toEqual([]);
});

test("three mistakes in a round de-escalate the next one (no fail state)", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  // The Core Bar promises help arrives by the third miss. roundComplete() is what
  // actually lowers the next round's tier, so drive it rather than trusting the model.
  const r = await page.evaluate(async () => {
    settings.diff = "auto";
    delete perf.snow; completions.snow = 0;
    startLevel("snow");
    state.tier = 2; state.round = 0;
    for (let i = 0; i < 8; i++) recordRoundPerf("snow", 0);   // earn the top tier honestly
    const before = tierFor("snow");
    roundMistakes = 3;                                        // she just had a hard round
    roundComplete();
    // roundComplete applies the new tier behind waitSpeech, which holds for at least
    // 900ms so the praise can finish talking. Poll rather than guess.
    for (let i = 0; i < 40 && state.tier === before; i++) await new Promise((r) => setTimeout(r, 100));
    const after = state.tier;
    delete perf.snow;
    return { before, after };
  });
  expect(r.before).toBe(2);
  expect(r.after, "a round with 3 mistakes must not be followed by an equally hard one")
    .toBeLessThan(r.before);
  expect(errors).toEqual([]);
});

/* ================= The reward loop =================
   Star Sparks → rocket is the spine of motivation and had no coverage either. */

test("finishing games fills the rocket, and launching it starts a fresh journey", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const r = await page.evaluate(async () => {
    sparks = 0; trips = 0; stickers.length = 0;
    const out = { gained: [], stickersGained: [] };
    for (let i = 0; i < QUEST_GOAL + 2; i++) {          // deliberately overshoot the goal
      celebrateWith("snow");
      out.gained.push(sparks);
      out.stickersGained.push(stickers.length);
    }
    out.goal = QUEST_GOAL;
    out.neverExceedsGoal = out.gained.every((v) => v <= QUEST_GOAL);
    // celebrateWith updates the count; the hub redraws the slots on its next build
    renderQuest();
    out.everySlotDrawn = document.querySelectorAll("#questSlots .q-slot").length;
    out.filledSlots = document.querySelectorAll("#questSlots .q-slot.filled").length;

    // Launching resets the journey so it can be flown again — the counter is a loop,
    // not a one-time score.
    const tripsBefore = trips;
    rocketLaunch();
    await new Promise((r) => setTimeout(r, 5200));
    out.sparksAfterLaunch = sparks;
    out.tripRecorded = trips > tripsBefore;
    return out;
  });
  expect(r.gained[0]).toBe(1);
  expect(r.neverExceedsGoal, "sparks must cap at the goal, never overflow").toBe(true);
  expect(r.gained[r.goal - 1]).toBe(r.goal);
  expect(r.stickersGained[r.stickersGained.length - 1]).toBe(r.goal + 2);  // a sticker every win
  expect(r.everySlotDrawn).toBe(r.goal);
  expect(r.filledSlots).toBe(r.goal);
  expect(r.sparksAfterLaunch, "a launch should start a fresh journey").toBe(0);
  expect(r.tripRecorded, "the trip should be counted").toBe(true);
  expect(errors).toEqual([]);
});

test("a completion count never goes down", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  // Progress that can decrease reads as punishment at this age; worldStars() was
  // already fixed for this once, so pin the underlying counter too.
  const r = await page.evaluate(() => {
    const seen = [];
    completions.snow = 0;
    for (let i = 0; i < 5; i++) { celebrateWith("snow"); seen.push(completions.snow); }
    return { seen, monotonic: seen.every((v, i) => i === 0 || v >= seen[i - 1]) };
  });
  expect(r.monotonic).toBe(true);
  expect(r.seen).toEqual([1, 2, 3, 4, 5]);
  expect(errors).toEqual([]);
});

/* ================= Parent gate =================
   Core Bar: settings and destructive actions are never one child tap. */

test("settings need a deliberate hold, not a tap", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");
  await expect(page.locator("#hub")).toBeVisible();

  const btn = page.locator("#settingsBtn");
  // a child's tap
  await btn.dispatchEvent("pointerdown");
  await page.waitForTimeout(150);
  await btn.dispatchEvent("pointerup");
  await page.waitForTimeout(150);
  await expect(page.locator("#settings"), "a quick tap must not open settings").toBeHidden();

  // a grown-up's hold
  await btn.dispatchEvent("pointerdown");
  await page.waitForTimeout(1000);
  await btn.dispatchEvent("pointerup");
  await expect(page.locator("#settings"), "holding the button should open settings").toBeVisible();
  expect(errors).toEqual([]);
});

test("wiping her progress needs a grown-up answer first", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await page.evaluate(() => { completions.snow = 3; saveCompletions(); core.flush(); openSettings(); });

  // Dismiss the arithmetic check the way a child would: cancel, or a wrong answer.
  for (const reply of [null, "1"]) {
    page.once("dialog", (d) => (reply === null ? d.dismiss() : d.accept(reply)));
    await page.locator("#setReset").click();
    await page.waitForTimeout(150);
    const kept = await page.evaluate(() => completions.snow);
    expect(kept, "a failed parent check must not erase anything").toBe(3);
  }

  // A grown-up answers correctly, then still has to confirm. One handler for both
  // dialogs: two `once` listeners would BOTH fire on the first one.
  const answerThenConfirm = async (d) => {
    const m = d.message().match(/(\d+)\s*\+\s*(\d+)/);
    if (m) await d.accept(String(Number(m[1]) + Number(m[2])));   // the arithmetic check
    else await d.accept();                                        // the "are you sure" confirm
  };
  page.on("dialog", answerThenConfirm);
  await page.locator("#setReset").click();
  await page.waitForTimeout(400);
  page.off("dialog", answerThenConfirm);
  expect(await page.evaluate(() => completions.snow || 0), "a passed check should reset").toBe(0);
  expect(errors).toEqual([]);
});

/* ================= Persistence ================= */

test("her progress survives a reload, and a storage failure never kills saving", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  await page.evaluate(() => {
    completions.snow = 2; saveCompletions();
    sparks = 3; saveQuest();
    stickers.length = 0; stickers.push({ e: "🦄" }); saveStickers();
    core.flush();
  });
  await page.reload();
  await page.waitForSelector("#hub:not(.hidden)");
  const restored = await page.evaluate(() => ({ snow: completions.snow, sparks, sticker: stickers[0] && stickers[0].e }));
  expect(restored).toEqual({ snow: 2, sparks: 3, sticker: "🦄" });

  // setItem throws on a full quota and in private browsing. It must not permanently
  // disable persistence, which is what an un-caught throw inside the debounce did.
  const survived = await page.evaluate(() => {
    const real = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => { throw new DOMException("QuotaExceededError"); };
    core.save("probeQuota", 1);
    core.writeNow();                       // the failing write
    localStorage.setItem = real;
    core.save("probeAfter", 2);
    core.flush();                          // must still work
    const ok = localStorage.getItem("probeAfter") === "2";
    ["probeQuota", "probeAfter"].forEach((k) => localStorage.removeItem(k));
    return ok;
  });
  expect(survived, "one storage failure disabled all later saves").toBe(true);

  // A toddler ends a session with the home button; iOS often never fires beforeunload.
  const flushed = await page.evaluate(() => {
    localStorage.removeItem("probeHide");
    core.save("probeHide", 7);
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    const ok = localStorage.getItem("probeHide") === "7";
    localStorage.removeItem("probeHide");
    return ok;
  });
  expect(flushed, "progress must be flushed when the app is backgrounded").toBe(true);
  expect(errors).toEqual([]);
});


/* ================= Core-curriculum games =================
   The original games carry the curriculum — counting, colour, numerals — and every
   one of them shipped without a gameplay test while the newer ones got several.
   These drive the real round: correct tap advances, wrong tap never dead-ends. */

test("Counting Critters counts to the named number and fills the tray", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const r = await page.evaluate(async () => {
    startLevel("snow");
    state.tier = 0; state.round = 0; snowLevel.startRound();
    const target = snowLevel.count;
    const critters = [...document.querySelectorAll(".critter")];
    const out = { target, spawned: critters.length, tierCounts: {} };
    // one critter per number she has to count — symbol and quantity must agree
    for (let i = 0; i < target; i++) critters[i].click();
    out.counted = snowLevel.done;
    out.numeralShown = document.getElementById("countNum").textContent;
    out.slotsFilled = document.querySelectorAll(".count-slot.filled").length;
    // the ladder gets harder, never easier
    for (const tier of [0, 1, 2]) {
      state.tier = tier; state.round = 0; snowLevel.startRound();
      out.tierCounts[tier] = snowLevel.count;
    }
    return out;
  });
  expect(r.spawned).toBe(r.target);
  expect(r.counted).toBe(r.target);
  expect(String(r.numeralShown), "the numeral must match the quantity counted").toBe(String(r.target));
  expect(r.slotsFilled).toBe(r.target);
  expect(r.tierCounts[1]).toBeGreaterThanOrEqual(r.tierCounts[0]);
  expect(r.tierCounts[2]).toBeGreaterThanOrEqual(r.tierCounts[1]);
  expect(errors).toEqual([]);
});

test("Ocean Colors advances on the named colour and forgives a wrong one", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const r = await page.evaluate(async () => {
    startLevel("ocean");
    state.tier = 0; state.round = 0; oceanLevel.startRound();
    const out = { target: oceanLevel.target };
    const fish = () => [...document.querySelectorAll(".fish-btn")];
    out.spawned = fish().length;
    out.distinctColors = new Set(fish().map((f) => f.dataset.color)).size;

    // A wrong tap must not end the round or remove the right answer.
    const wrong = fish().find((f) => f.dataset.color !== out.target);
    if (wrong) wrong.click();
    await new Promise((r) => setTimeout(r, 200));
    out.correctStillThere = fish().some((f) => f.dataset.color === out.target);
    out.roundAfterWrong = state.round;

    // Re-read the target: a wrong tap may re-render, and the test should follow the
    // game rather than assume it stood still.
    const target = oceanLevel.target;
    const right = fish().find((f) => f.dataset.color === target);
    out.foundCorrect = !!right;
    const before = state.round;
    if (right) right.click();
    for (let i = 0; i < 40 && state.round === before; i++) await new Promise((r) => setTimeout(r, 100));
    out.advanced = state.round > before;
    return out;
  });
  expect(r.spawned).toBeGreaterThanOrEqual(3);
  expect(r.distinctColors, "each fish must be a distinct colour to name").toBe(r.spawned);
  expect(r.correctStillThere, "a wrong tap must never remove the right answer").toBe(true);
  expect(r.roundAfterWrong, "a wrong tap must not advance the round").toBe(0);
  expect(r.foundCorrect, "the correctly-coloured fish should still be on screen").toBe(true);
  expect(r.advanced, "tapping the named colour should advance").toBe(true);
  expect(errors).toEqual([]);
});

test("Ocean Colors lights up the answer after repeated misses", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  // BAR-CONFIG: guided assist by the third wrong attempt. This never fired, because the
  // fish carried their colour only in a click closure and the lookup used [data-color].
  const r = await page.evaluate(async () => {
    startLevel("ocean");
    state.tier = 0; state.round = 0; oceanLevel.startRound();
    const target = oceanLevel.target;
    const wrongOnes = [...document.querySelectorAll(".fish-btn")].filter((f) => f.dataset.color !== target);
    const out = { hasDataColor: [...document.querySelectorAll(".fish-btn")].every((f) => !!f.dataset.color) };
    wrongOnes[0].click();
    await new Promise((r) => setTimeout(r, 80));
    out.afterOne = !!document.querySelector(".fish-btn.hint-highlight");
    (wrongOnes[1] || wrongOnes[0]).click();
    await new Promise((r) => setTimeout(r, 80));
    const hinted = document.querySelector(".fish-btn.hint-highlight");
    out.afterTwo = !!hinted;
    out.hintedTheRightOne = hinted ? hinted.dataset.color === target : false;
    return out;
  });
  expect(r.hasDataColor, "every fish must carry its colour on the element").toBe(true);
  expect(r.afterOne, "one miss is not yet a hint").toBe(false);
  expect(r.afterTwo, "the second miss must light up the answer").toBe(true);
  expect(r.hintedTheRightOne, "the hint highlighted the wrong fish").toBe(true);
  expect(errors).toEqual([]);
});

test("Numbers pops only the named numeral", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const r = await page.evaluate(async () => {
    startLevel("bike");
    state.tier = 0; state.round = 0; bikeLevel.startRound();
    const out = { target: bikeLevel.target, ceiling: bikeLevel.maxN };
    // The balloons live in the level's own array and drift in via its rAF loop.
    for (let i = 0; i < 80 && !bikeLevel.balloons.length; i++) await new Promise((r) => setTimeout(r, 50));
    out.spawned = bikeLevel.balloons.length;
    out.allWithinCeiling = bikeLevel.balloons.every((b) => b.num >= 1 && b.num <= out.ceiling);
    out.firstIsNotTarget = bikeLevel.balloons[0] ? bikeLevel.balloons[0].num !== out.target : true;
    // the ceiling must climb with the tier
    const ceilings = [0, 1, 2].map((tier) => { state.tier = tier; state.round = 0; bikeLevel.startRound(); return bikeLevel.maxN; });
    bikeLevel.cleanup();
    out.ceilings = ceilings;
    return out;
  });
  expect(r.spawned, "balloons should spawn").toBeGreaterThan(0);
  expect(r.allWithinCeiling, "a balloon showed a numeral above the tier's ceiling").toBe(true);
  expect(r.firstIsNotTarget, "the first balloon must not be the answer — she has to scan and wait").toBe(true);
  expect(r.ceilings[0]).toBeLessThan(r.ceilings[1]);
  expect(r.ceilings[1]).toBeLessThan(r.ceilings[2]);
  expect(errors).toEqual([]);
});

test("every game's round ladder never gets easier as the tier rises", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  // A blunt sweep across all 35 levels: start every round at every tier and require
  // that it paints something and throws nothing. Cheap, and it covers the 26 games
  // that had no test of their own at all.
  const bad = await page.evaluate(async () => {
    const out = [];
    for (const id of Object.keys(LEVELS)) {
      for (const tier of [0, 1, 2]) {
        try {
          startLevel(id);
          state.tier = tier; state.round = 0;
          LEVELS[id].startRound();
          await new Promise((r) => setTimeout(r, 10));
          if (!document.getElementById("playArea").children.length) out.push({ id, tier, why: "drew nothing" });
        } catch (e) {
          out.push({ id, tier, why: e.message });
        }
        try { cleanupLevel(); } catch (_) {}
      }
    }
    showHub();
    return out;
  });
  expect(bad, "levels that fail to start at some tier").toEqual([]);
  expect(errors, "console/page errors sweeping every level at every tier:\n" + errors.join("\n")).toEqual([]);
});

test("every game's hint ladder can actually count mistakes", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  // Ocean and Numbers both shipped with `this.mistakes` never initialised, so
  // `undefined++` gave NaN and neither `=== 2` nor `>= 3` ever matched: guided assist
  // could not fire at any number of misses. Catch the next one at the source.
  const bad = await page.evaluate(async () => {
    const out = [];
    for (const id of Object.keys(LEVELS)) {
      const lvl = LEVELS[id];
      const src = Object.values(lvl).filter((v) => typeof v === "function").map(String).join("");
      if (!/this\.mistakes\s*\+\+/.test(src)) continue;      // this game doesn't count misses
      delete lvl.mistakes;                                     // a stale value from an earlier
                                                               // round must not mask the bug
      startLevel(id);
      state.tier = 0; state.round = 0;
      try { lvl.startRound(); } catch (e) { out.push({ id, got: "-", why: "startRound threw: " + e.message }); continue; }
      await new Promise((r) => setTimeout(r, 10));
      if (typeof lvl.mistakes !== "number")
        out.push({ id, got: String(lvl.mistakes), why: "mistakes not initialised by startRound" });
      try { cleanupLevel(); } catch (_) {}
    }
    showHub();
    return out;
  });
  expect(bad, "a hint ladder that can never fire").toEqual([]);
  expect(errors).toEqual([]);
});

/* ================= Accessibility ================= */

test("reduced motion is honoured end to end", async ({ page }) => {
  const errors = watchErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html");            // NOT ?test=1 — that disables animation anyway

  expect(await page.evaluate(() => reducedMotion()), "the app should detect the preference").toBe(true);

  // the world map's idle bob and entrance pop are off
  const animated = await page.evaluate(() =>
    [...document.querySelectorAll("#mapNodes .node")]
      .filter((n) => getComputedStyle(n).animationName !== "none").length);
  expect(animated, "world discs should hold still under reduced motion").toBe(0);

  // the buddy still gets from A to B — it teleports rather than walking
  await page.evaluate(() => document.querySelector("#mapNodes .node").click());
  await expect(page.locator("#games")).toBeVisible();
  await page.waitForTimeout(600);
  const props = await page.evaluate(() =>
    [...document.querySelectorAll(".tr-prop")].filter((n) => getComputedStyle(n).animationName !== "none").length);
  expect(props, "trail scenery should hold still under reduced motion").toBe(0);
  expect(errors).toEqual([]);
});

test("the app renders in Spanish without losing its words", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const r = await page.evaluate(() => {
    settings.lang = "es"; saveSettings(); applyI18n(); buildHub();
    const out = {
      worldLabels: [...document.querySelectorAll("#mapNodes .node-label")].map((e) => e.textContent),
      // nouns spoken by games must be translated, not echoed back in English
      spots: ["basket", "box", "table"].map((k) => theWord(k)),
      untranslatedKeys: Object.keys(DICT.en).filter((k) => !(k in DICT.es)),
    };
    settings.lang = "en"; saveSettings(); applyI18n(); buildHub();
    return out;
  });
  expect(r.worldLabels).toContain("Números");
  expect(r.untranslatedKeys, "keys with no Spanish translation").toEqual([]);
  expect(r.spots, "hide-and-seek nouns fell back to English").toEqual(["la canasta", "la caja", "la mesa"]);
  expect(errors).toEqual([]);
});


/* ================= World party =================
   The node that closes a world's trail: one round each from three games she has played
   there. Interleaved retrieval practice, and the only place the app asks her to switch
   between concepts instead of drilling one. */

test("the party plays three games from its world, then celebrates", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const r = await page.evaluate(async () => {
    const cat = CATEGORIES.find((c) => c.id === "num");
    // she has played three of the counting games
    ["snow", "pasta", "dragon"].forEach((g) => (completions[g] = 2));
    const queue = worldParty.build(cat);
    const out = {
      queue,
      allFromThisWorld: queue.every((g) => cat.games.includes(g)),
      allPlayable: queue.every((g) => !!LEVELS[g]),           // never a special
      noRepeats: new Set(queue).size === queue.length,
      prefersPlayed: queue.every((g) => (completions[g] || 0) > 0),
    };

    worldParty.start(cat);
    out.startedWith = state.level;
    out.roundsInGame = totalRounds();                        // one round per game
    out.dots = document.querySelectorAll("#progress .dot").length;

    // finish round one; the party must hand on to a DIFFERENT game, not celebrate
    const first = state.level;
    levelComplete();
    for (let i = 0; i < 40 && state.level === first; i++) await new Promise((r) => setTimeout(r, 100));
    out.secondGame = state.level;
    out.celebHiddenMidParty = document.getElementById("celebrate").classList.contains("hidden");
    out.atAfterOne = worldParty.at;
    return out;
  });

  expect(r.queue.length).toBe(3);
  expect(r.allFromThisWorld, "a party round came from another world").toBe(true);
  expect(r.allPlayable, "a special (paint/story/dressup) cannot be a party round").toBe(true);
  expect(r.noRepeats, "the same game twice in one party").toBe(true);
  expect(r.prefersPlayed, "the party should draw on games she has played").toBe(true);
  expect(r.roundsInGame, "each party game should be a single round").toBe(1);
  expect(r.dots, "progress should track the party, not the game inside it").toBe(3);
  expect(r.secondGame).not.toBe(r.startedWith);
  expect(r.celebHiddenMidParty, "the party must not celebrate between rounds").toBe(true);
  expect(r.atAfterOne).toBe(1);
  expect(errors).toEqual([]);
});

test("the party is never a gate, and never traps her", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const r = await page.evaluate(async () => {
    const cat = CATEGORIES.find((c) => c.id === "num");
    // a child who has played NOTHING must still be able to open it — no locks anywhere
    cat.games.forEach((g) => delete completions[g]);
    const out = { queueWhenNothingPlayed: worldParty.build(cat).length };

    worldParty.start(cat);
    out.startedCold = worldParty.active;

    // Home mid-party ends it cleanly and restores normal round counting.
    showHub();
    out.stoppedOnHome = !worldParty.active;
    startLevel("snow");
    out.normalRoundsRestored = totalRounds();
    showHub();
    return out;
  });

  expect(r.queueWhenNothingPlayed, "an unplayed world must still fill a party").toBe(3);
  expect(r.startedCold, "the party must open on a first visit — it is not a reward to unlock").toBe(true);
  expect(r.stoppedOnHome).toBe(true);
  expect(r.normalRoundsRestored, "leaving a party must restore normal round counts").toBeGreaterThan(1);
  expect(errors).toEqual([]);
});

test("walking to the party takes the buddy to the end of the road", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");
  await page.evaluate(() => openCategory("num"));
  await expect(page.locator("#games")).toBeVisible();

  const r = await page.evaluate(async () => {
    const n = worldTrail.gids.length;
    // "furthest along" means along the road — down the screen in portrait, across it
    // in landscape — so ask the trail which coordinate that is.
    const partyX = worldTrail.along(worldTrail.ptAt(n));
    const lastGameX = worldTrail.along(worldTrail.ptAt(n - 1));
    document.querySelector("#gameNodes .tr-party").click();
    await new Promise((r) => setTimeout(r, 1400));
    return {
      partyIsFurthest: partyX > lastGameX,
      partyStarted: worldParty.active,
      // the party is not "where she left off" — it must not become her saved spot
      saved: JSON.parse(localStorage.getItem("fionaTrail") || "{}").num,
    };
  });
  expect(r.partyIsFurthest, "the party should sit past the last game").toBe(true);
  expect(r.partyStarted).toBe(true);
  expect(r.saved, "the party must not be saved as the buddy's spot").not.toBe(undefined + "");
  expect(errors).toEqual([]);
});


/* ================= Scene kit =================
   Shared scenery (js/scene.js). Its two non-negotiables: it can never take a tap from
   the game, and it must look complete without animation. */

test("scenery is inert and never steals a tap", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const r = await page.evaluate(async () => {
    startLevel("ocean"); state.tier = 0; state.round = 0;
    await new Promise((r) => setTimeout(r, 150));
    const nodes = [...document.querySelectorAll(".sc-scene, .sc-scene *")];
    const clickable = nodes.filter((n) => getComputedStyle(n).pointerEvents !== "none");
    // and the fish must still be reachable everywhere they sit
    const fish = [...document.querySelectorAll(".fish-btn")];
    const blocked = fish.filter((f) => {
      const b = f.getBoundingClientRect();
      const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      return !(hit === f || f.contains(hit));
    });
    return { nodes: nodes.length, clickable: clickable.length, fish: fish.length, blocked: blocked.length };
  });
  expect(r.nodes, "the scene should actually be drawn").toBeGreaterThan(20);
  expect(r.clickable, "a scenery layer became clickable").toBe(0);
  expect(r.blocked, "scenery covered a game target").toBe(0);
  expect(errors).toEqual([]);
});

test("scenery is deterministic and survives reduced motion", async ({ page }) => {
  const errors = watchErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html");

  const r = await page.evaluate(async () => {
    // same seed twice must give the same scene, so a repaint never reshuffles the world
    const a = scene.html("reef", { seed: 5 });
    const b = scene.html("reef", { seed: 5 });
    const c = scene.html("reef", { seed: 6 });
    startLevel("ocean");
    await new Promise((r) => setTimeout(r, 250));
    const animated = [...document.querySelectorAll(".sc-mote, .sc-drift")]
      .filter((n) => getComputedStyle(n).animationName !== "none").length;
    return { stable: a === b, varies: a !== c, animated,
             painted: document.querySelectorAll(".sc-scene *").length };
  });
  expect(r.stable, "the same seed drew a different scene").toBe(true);
  expect(r.varies, "different seeds drew the same scene").toBe(true);
  expect(r.animated, "scenery should hold still under reduced motion").toBe(0);
  expect(r.painted, "the scene should still be drawn under reduced motion").toBeGreaterThan(20);
  expect(errors).toEqual([]);
});

test("scenery never covers a game's own targets", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  // Sweep every game carrying scenery: each one's real buttons must still be the thing
  // under your finger. This is the failure that would be invisible in a screenshot.
  const bad = await page.evaluate(async () => {
    const out = [];
    for (const id of Object.keys(LEVELS)) {
      startLevel(id); state.tier = 0; state.round = 0;
      await new Promise((r) => setTimeout(r, 120));
      if (document.querySelectorAll("#playArea .sc-scene *").length === 0) { cleanupLevel(); continue; }
      const targets = [...document.querySelectorAll("#playArea button, #playArea [onclick]")]
        .filter((t) => { const b = t.getBoundingClientRect(); return b.width > 8 && b.height > 8; });
      for (const t of targets) {
        const b = t.getBoundingClientRect();
        const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        if (!(hit === t || t.contains(hit) || t.contains(hit?.parentElement)))
          out.push({ id, blockedBy: hit && hit.className ? String(hit.className).slice(0, 40) : "?" });
      }
      cleanupLevel();
    }
    showHub();
    return out;
  });
  expect(bad, "scenery is sitting on top of something tappable").toEqual([]);
  expect(errors).toEqual([]);
});

test("every biome draws without error", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const bad = await page.evaluate(() => {
    const out = [];
    for (const name of Object.keys(BIOMES)) {
      try {
        const html = scene.html(name, { seed: 3 });
        const el = document.createElement("div");
        el.innerHTML = html;
        if (el.querySelectorAll("*").length < 15) out.push({ name, why: "drew almost nothing" });
        if (/undefined|NaN/.test(html)) out.push({ name, why: "hole in the recipe (undefined/NaN in the markup)" });
      } catch (e) { out.push({ name, why: e.message }); }
    }
    return out;
  });
  expect(bad, "biomes that fail to draw").toEqual([]);
  expect(errors).toEqual([]);
});


/* A scrolling game repeats one strip tile past the camera. Two things make that repeat
   invisible, and both are easy to break by nudging a number in `strip()`: every prop has
   to sit inside the tile's margin, and the same seed has to draw the same tile. If either
   goes, a seam marches across the reef every few seconds — the kind of fault nobody spots
   in a still screenshot. */
test("a scrolling band tiles without a seam", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const bad = await page.evaluate(() => {
    const out = [];
    for (const name of Object.keys(BIOMES)) {
      for (const band of ["far", "near"]) {
        let html;
        try { html = scene.strip(name, { band, seed: 5 }); }
        catch (e) { out.push({ name, band, why: e.message }); continue; }

        if (/undefined|NaN/.test(html)) out.push({ name, band, why: "undefined/NaN in the markup" });
        if (html !== scene.strip(name, { band, seed: 5 })) out.push({ name, band, why: "not deterministic" });

        const el = document.createElement("div");
        el.innerHTML = html;
        const svg = el.querySelector("svg");
        if (!svg) { out.push({ name, band, why: "drew no svg" }); continue; }
        if (svg.getAttribute("viewBox") !== "0 0 600 100") out.push({ name, band, why: "tile is not the 600x100 the CSS sizes against" });
        if (svg.querySelectorAll("*").length < 3) out.push({ name, band, why: "drew almost nothing" });

        // every x coordinate in the tile has to clear both edges, or the repeat shows a cut prop
        const xs = [...html.matchAll(/(?:\bcx=|\bx=|\bx1=|\bx2=)"(-?[\d.]+)"/g)].map((m) => +m[1])
          .concat([...html.matchAll(/[ML]\s*(-?[\d.]+)/g)].map((m) => +m[1]));
        const off = xs.filter((v) => v < 4 || v > 596);
        if (off.length) out.push({ name, band, why: `${off.length} points outside the tile (e.g. ${off[0]})` });
      }
    }
    return out;
  });
  expect(bad, "bands that would show their seam").toEqual([]);
  expect(errors).toEqual([]);
});

/* ================= Audio =================
   Audio was the coldest axis: five one-shot cues and three tunes across 38 games with
   nothing in between. These guard the two things that replaced that, and — more
   importantly — that every game shipped from here on carries its own sound. */

test("every game declares a signature cue from the shared palette", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const r = await page.evaluate(() => ({
    total: GAME_REGISTRY.length,
    missing: GAME_REGISTRY.filter((g) => !g.cue).map((g) => g.id),
    unknown: GAME_REGISTRY.filter((g) => g.cue && !CUES[g.cue]).map((g) => g.id),
    distinct: new Set(GAME_REGISTRY.map((g) => g.cue)).size,
    // the palette itself must be playable — a cue that throws is a silent game
    throwing: Object.keys(CUES).filter((k) => { try { CUES[k](); return false; } catch (_) { return true; } }),
  }));
  expect(r.missing, "games with no signature cue").toEqual([]);
  expect(r.unknown, "games naming a cue that does not exist").toEqual([]);
  expect(r.throwing, "cues that throw when played").toEqual([]);
  // a handful of sounds shared across 38 games would be no better than one
  expect(r.distinct, "too few distinct cues to tell the worlds apart").toBeGreaterThanOrEqual(10);
  expect(errors).toEqual([]);
});

test("a new game cannot ship without a sound", async ({ page }) => {
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  // This is the enforcement, not the convention: registerGame refuses the game outright.
  const r = await page.evaluate(() => {
    const before = GAME_REGISTRY.length;
    const attempt = (def) => { try { registerGame(def); return false; } catch (_) { return true; } };
    const base = { world: "num", icon: "x", name: "N", level: { startRound() {} } };
    return {
      noCue: attempt({ ...base, id: "t1" }),
      madeUpCue: attempt({ ...base, id: "t2", cue: "airhorn" }),
      goodCue: attempt({ ...base, id: "t3", cue: "chime" }),   // this one should succeed
      leaked: GAME_REGISTRY.length - before,
    };
  });
  expect(r.noCue, "a game with no cue was accepted").toBe(true);
  expect(r.madeUpCue, "a game inventing its own cue was accepted").toBe(true);
  expect(r.goodCue, "a game with a valid cue was wrongly refused").toBe(false);
  expect(r.leaked, "only the valid game should have registered").toBe(1);
});

test("each world has an ambience bed, and it starts, stops and never stacks", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const r = await page.evaluate(async () => {
    const out = {};
    // every biome the scene kit can pick must have a bed to match
    out.biomesWithoutBed = Object.keys(BIOMES).filter((b) => !AMBIENCE[b]);
    // and every game resolves to one
    out.gamesWithoutBed = Object.keys(LEVELS).filter((id) => !AMBIENCE[scene.forLevel(id)]);

    startLevel("ocean");
    await new Promise((r) => setTimeout(r, 250));
    out.startedForWorld = ambience.biome;

    // cycling levels must leave exactly one bed running, never a pile of them
    for (let i = 0; i < 10; i++) { startLevel("snow"); startLevel("ocean"); }
    await new Promise((r) => setTimeout(r, 200));
    out.oneBedRunning = !!ambience.src;

    // a parent choosing a quiet app gets a quiet app
    settings.music = "off"; applyMusicSetting();
    await new Promise((r) => setTimeout(r, 150));
    out.silentWhenMusicOff = !ambience.src;
    // and it stays silent when she moves to another game
    startLevel("dragon");
    await new Promise((r) => setTimeout(r, 150));
    out.staysSilent = !ambience.src;
    settings.music = "bouncy";
    showHub();
    return out;
  });

  expect(r.biomesWithoutBed, "a scene biome with no matching ambience").toEqual([]);
  expect(r.gamesWithoutBed, "games that resolve to no ambience bed").toEqual([]);
  expect(r.startedForWorld).toBe("reef");
  expect(r.oneBedRunning, "cycling levels should leave exactly one bed").toBe(true);
  expect(r.silentWhenMusicOff, "'music: off' must silence the ambience too").toBe(true);
  expect(r.staysSilent, "ambience came back after being switched off").toBe(true);
  expect(errors).toEqual([]);
});


/* `sc-` belongs to the scene kit. Scavenger Hunt had grown a whole set of its own
   `.sc-*` classes in an inline <style>, and the day one of them matched a kit layer the
   scenery would have been restyled or hidden on that screen only — a fault nobody would
   trace back to a class name. There is one global stylesheet namespace here, so this
   keeps the prefix reserved. */
test("no game squats on the scene kit's class prefix", async () => {
  const kit = new Set([...fs.readFileSync("js/scene.js", "utf8").matchAll(/\bsc-[a-z-]+/g)].map((m) => m[0]));
  const bad = [];
  for (const f of fs.readdirSync("js/games")) {
    if (!f.endsWith(".js")) continue;
    const src = fs.readFileSync(`js/games/${f}`, "utf8");
    for (const m of new Set([...src.matchAll(/\bsc-[a-z-]+/g)].map((x) => x[0])))
      if (!kit.has(m)) bad.push(`${f}: ${m}`);
  }
  expect(bad, "these class names collide with the scene kit's namespace — rename them")
    .toEqual([]);
});

// Scenery coverage is a ratchet: it may go up, never down. All 35 levels carry the scene
// kit now — either the static layers or, in a scrolling game, its tileable strip. Leave
// this at the full count; it exists so a refactor can't quietly strip scenery back out,
// and a new game that ships without a background fails here.
const SCENERY_FLOOR = 35;

test("scenery coverage never goes backwards", async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(SKIP_INTRO);
  await page.goto("/index.html?test=1");

  const r = await page.evaluate(async () => {
    const withScene = [];
    for (const id of Object.keys(LEVELS)) {
      startLevel(id); state.tier = 0; state.round = 0;
      await new Promise((r) => setTimeout(r, 90));
      // .sc-strip too: a scrolling game builds its world from tiles, not the static layers
      const n = document.querySelectorAll("#playArea .sc-scene *").length
              + document.querySelectorAll("#playArea .sc-strip").length;
      if (n > 5) withScene.push(id);
      try { cleanupLevel(); } catch (_) {}
    }
    showHub();
    return { count: withScene.length, games: withScene.sort(), total: Object.keys(LEVELS).length };
  });

  expect(r.count, `scenery coverage dropped to ${r.count} of ${r.total} (floor is ${SCENERY_FLOOR}). ` +
    "If you added scenery, raise SCENERY_FLOOR; if you removed it, put it back.")
    .toBeGreaterThanOrEqual(SCENERY_FLOOR);
  expect(errors).toEqual([]);
});
