# CLAUDE.md — Little Explorer's World

## Project Overview
**Little Explorer's World** is a voice-guided educational game for toddlers (2–5). It is a **PWA** that
runs entirely in the browser as static files — **no build step, no dependencies, no backend**. The whole
app (HTML, CSS, JS, SVG art, audio synthesis) is hand-written static assets: `index.html` for markup,
`css/style.css`, `js/core.js` (engine, i18n, audio, quest), `js/hub.js` (map, navigation, story, sticker
book) and one file per game under `js/games/`. Scripts are plain `<script src>` tags — no modules, no
bundler — so every top-level `const`/`function` shares one global scope.

## Quality system (read before building or reviewing)
This repo has a hard quality bar. Use it; don't freelance.
- `docs/skills/01-product-quality-bar.md` — 7-axis rubric (0/1/2, **pass ≥ 11/14**, auto-fail on Learning efficacy / Emotional safety / Reliability / any Core Bar item).
- `docs/skills/02-learning-design`, `03-content-quality`, `04-accessibility-safety`, `05-release-gate`.
- `docs/skills/06-stem-scope-and-sequence.md` — STEM curriculum map + coverage gaps; every game needs a STEM objective tag.
- `docs/skills/BAR-CONFIG.md` — current policy (primary goal: **learning outcomes**; sensory: balanced; difficulty: auto-assist quickly; parent controls: medium gate).
- Slash commands: `/review-game <id>` (score a game), `/release-check` (pre-deploy gate).

## Architecture
- **Hub** (`buildHub`): a world map of island discs (`CATEGORIES`) → a world's game grid (`GAMES`) → a game.
  Nodes are the self-contained `.node`/`.node-disc` system; navigation goes through `hideAllScreens()` +
  `animScreen()` (never leave two screens visible).
- **World map**: each world has a **fixed spot** on the map from `HUB_LAYOUT` (percent coords, one set per
  orientation), so a disc never moves between devices — she navigates by place, not by reading. `buildHub`
  draws the islands, the dashed trail and the scenery from that same table; add a world by adding a
  `HUB_LAYOUT` entry (without one it still renders, via `defaultSlot`).
- **World trail** (`js/worldtrail.js`, the `worldTrail` object — *not* `trail`, which core.js already owns
  for the pointer sparkle): a world is one long horizontal path she scrolls, Super Mario 3 style. Her buddy
  stands on the game she last played there (`fionaTrail`), walks the road to whatever she taps, and the
  camera follows it. Games keep `cat.games` order, so the newest is always furthest along; when a world
  holds an unplayed new game the camera travels the path to it on entry. Geometry is **pixels** measured
  against the live viewport (`measure()`), so it is rebuilt on resize — unlike the hub's percent coords.
  Nothing on the trail is ever locked; the path is wayfinding and story, never gating.
- **Hub progress**: `worldStars()` counts *distinct games tried*, never a fraction of the world's size —
  shipping a game into a world must never take away a star. New games are tagged `v: <APP_VERSION>` in
  `GAMES`; `isNewGame()` flies a "New!" flag until she plays it, and it ages out on the next version bump.
- **38 games** (`LEVELS` + specials `paint`/`story`/`dressup`). Each level object has `theme`, `rounds`,
  `startRound()`, and reads `state.tier` (0–2).
- **Difficulty**: `tierFor(level)` — manual easy/med/hard force 0/1/2; **auto mode uses a performance model**
  (`fionaPerf`: `autoTierFor`, EMA of round quality, down-shift on ≥3 mistakes). Mistakes are counted via the
  wrapped `sfx.bad`; `roundComplete` records perf and can lower the next round's tier.
- **Audio**: `speak()` (Web Speech), `voice()`/`sfx` (Web Audio synth), `MUSIC` styles. No audio files.
- **Quest**: collect Star Sparks (`sparks`) across any game to launch a rocket (`rocketLaunch`); `QUEST_GOAL`.
- **Persistence** (localStorage): `fionaStars` (completions), `fionaStickers`, `fionaSettings`, `fionaSparks`/
  `fionaTrips`, `fionaPerf`, `fionaName`, `fionaBuddy`, `fionaDecor`, `fionaTrail` (where the buddy stands
  in each world).

## Conventions
- Drawn SVG for hero objects (rocket, dragon, fish, dress-up character); emoji only as **whole objects**,
  never fake-layered. Tie number **symbol ↔ quantity** (growing numeral/badge, burst-exactly-N).
- Per-action juice (sparkle + rising tone + squish) — but per BAR-CONFIG, **don't stack intense effects**;
  keep a calm path.
- Big targets (≥44px), no fail states, voice-first, `clamp()`/`vmin` everywhere.
- **Prefer real-time, child-driven mechanics** (steer/drag/move in a `requestAnimationFrame` loop, motion/
  scrolling) over tap-and-wait, when the concept supports it — the interaction should *be* the learning
  practice. Reference: **Dolphin Dive** (`js/games/dolphin.js`). See BAR-CONFIG "Interaction & Game-Feel".
- Bump `sw.js` `CACHE` when shipping (network-first SW).

## Run / verify
- Serve: `python -m http.server 8765` (or the `fiona-game` preview config).
- The preview tab is backgrounded → CSS animations freeze at frame 0 and `preview_screenshot` times out.
  Verify via `preview_eval` / `preview_console_logs`; to measure true layout, inject
  `*{animation:none!important;transition:none!important}` or use `offsetWidth`.
- `startLevel(id)` resets tier via `tierFor`; in tests set `state.tier`/`round` **after** `startLevel`, then call `LEVELS[id].startRound()`.

## Deploy
- Push to `main` → `.github/workflows/pages-deploy.yml` validates (required files, JSON, JS syntax) then
  auto-deploys to GitHub Pages. Don't push code that fails `/release-check`.
- **Shipping a new game**: add it to `LEVELS`/`GAMES`/a `CATEGORIES` world as usual, tag its `GAMES` entry
  with `v: <the APP_VERSION it ships in>` so it flies the "New!" flag on the map, and add its file to the
  `sw.js` `ASSETS` list. Nothing needs switching off later — the flag expires on its own.

## Privacy
- The child's name lives only in localStorage; it must not appear in any committed/public file
  (manifest, README, docs). Default display name is "Explorer".
