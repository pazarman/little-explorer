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
- **Hub progress**: `worldStars()` counts *distinct games tried*, never a fraction of the world's size —
  shipping a game into a world must never take away a star. New games are tagged `v: <APP_VERSION>` in
  `GAMES`; `isNewGame()` flies a "New!" flag until she plays it, and it ages out on the next version bump.
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


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:6cd5cc61 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->
