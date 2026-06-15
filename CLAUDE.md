# CLAUDE.md — Little Explorer's World

## Project Overview
**Little Explorer's World** is a voice-guided educational game for toddlers (2–5). It is a **PWA** that
runs entirely in the browser as static files — **no build step, no dependencies, no backend**. The whole
app (HTML, CSS, JS, SVG art, audio synthesis) lives inline in `index.html`.

## Quality system (read before building or reviewing)
This repo has a hard quality bar. Use it; don't freelance.
- `docs/skills/01-product-quality-bar.md` — 7-axis rubric (0/1/2, **pass ≥ 11/14**, auto-fail on Learning efficacy / Emotional safety / Reliability / any Core Bar item).
- `docs/skills/02-learning-design`, `03-content-quality`, `04-accessibility-safety`, `05-release-gate`.
- `docs/skills/06-stem-scope-and-sequence.md` — STEM curriculum map + coverage gaps; every game needs a STEM objective tag.
- `docs/skills/BAR-CONFIG.md` — current policy (primary goal: **learning outcomes**; sensory: balanced; difficulty: auto-assist quickly; parent controls: medium gate).
- Slash commands: `/review-game <id>` (score a game), `/release-check` (pre-deploy gate).

## Architecture
- **Hub** (`buildHub`): 8 world discs (`CATEGORIES`) → a world's game grid (`GAMES`) → a game.
  Nodes are the self-contained `.node`/`.node-disc` system; navigation goes through `hideAllScreens()` +
  `animScreen()` (never leave two screens visible).
- **~22 games** (`LEVELS` + specials `paint`/`story`/`dressup`). Each level object has `theme`, `rounds`,
  `startRound()`, and reads `state.tier` (0–2).
- **Difficulty**: `tierFor(level)` — manual easy/med/hard force 0/1/2; **auto mode uses a performance model**
  (`fionaPerf`: `autoTierFor`, EMA of round quality, down-shift on ≥3 mistakes). Mistakes are counted via the
  wrapped `sfx.bad`; `roundComplete` records perf and can lower the next round's tier.
- **Audio**: `speak()` (Web Speech), `voice()`/`sfx` (Web Audio synth), `MUSIC` styles. No audio files.
- **Quest**: collect Star Sparks (`sparks`) across any game to launch a rocket (`rocketLaunch`); `QUEST_GOAL`.
- **Persistence** (localStorage): `fionaStars` (completions), `fionaStickers`, `fionaSettings`, `fionaSparks`/
  `fionaTrips`, `fionaPerf`, `fionaName`, `fionaBuddy`, `fionaDecor`.

## Conventions
- Drawn SVG for hero objects (rocket, dragon, fish, dress-up character); emoji only as **whole objects**,
  never fake-layered. Tie number **symbol ↔ quantity** (growing numeral/badge, burst-exactly-N).
- Per-action juice (sparkle + rising tone + squish) — but per BAR-CONFIG, **don't stack intense effects**;
  keep a calm path.
- Big targets (≥44px), no fail states, voice-first, `clamp()`/`vmin` everywhere.
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

## Privacy
- The child's name lives only in localStorage; it must not appear in any committed/public file
  (manifest, README, docs). Default display name is "Explorer".
