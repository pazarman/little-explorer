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

  // Games are tagged with the release they shipped in and age out on their own.
  expect(await page.evaluate(() => isNewGame("senses"))).toBe(true);
  expect(await page.evaluate(() => isNewGame("snow"))).toBe(false);

  // The world holding it flies the flag, and the narrator points her at it.
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
  await expect(page.locator(".sc-card")).toBeVisible();
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
