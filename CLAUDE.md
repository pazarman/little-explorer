# CLAUDE.md — Little Explorer's World

## Project Overview
**Little Explorer's World** is a voice-guided educational game for toddlers (2–5). It is a **PWA** that
runs entirely in the browser as static files — **no build step, no dependencies, no backend**. The whole
app (HTML, CSS, JS, SVG art, audio synthesis) is hand-written static assets: `index.html` for markup,
`css/style.css`, `js/core.js` (engine, i18n, audio, quest, **game registry**), `js/hub.js` (map,
navigation, sticker book) and one file per game under `js/games/`. Scripts are plain `<script src>` tags — no modules, no
bundler — so every top-level `const`/`function` shares one global scope.

## Quality system (read before building or reviewing)
This repo has a hard quality bar. Use it; don't freelance.
- `docs/skills/01-product-quality-bar.md` — **v2 12-axis rubric** (0/1/2 per axis, **pass ≥ 18/24**, auto-fail on Learning efficacy / Emotional safety / Reliability / any Core Bar item). The 7-axis / 11-of-14 bar is retired — don't score against it.
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
  for the pointer sparkle): a world is one long path she scrolls, Super Mario 3 style. **The road runs
  along the screen's LONG axis** — down a portrait phone, across a landscape one (`geom.vertical`, same
  1.15 threshold the hub uses, mirrored by a `max-aspect-ratio` rule that flips the scroll axis). It was
  horizontal everywhere, which on a 2.17:1 phone showed 18% of a 12-game world at a time over 5.7 screens
  of scrolling while using a third of the height. Only `measure()` and `center()` know the axis;
  everything else works in `{x, y}` and asks `along(pt)` for the coordinate that scrolls. Her buddy
  stands on the game she last played there (`fionaTrail`), walks the road to whatever she taps, and the
  camera follows it. Games keep `cat.games` order, so the newest is always furthest along; when a world
  holds an unplayed new game the camera travels the path to it on entry. Geometry is **pixels** measured
  against the live viewport (`measure()`), so it is rebuilt on resize — unlike the hub's percent coords.
  Nothing on the trail is ever locked; the path is wayfinding and story, never gating.
- **Hub progress**: `worldStars()` counts *distinct games tried*, never a fraction of the world's size —
  shipping a game into a world must never take away a star. New games are tagged `v: <APP_VERSION>` in
  `GAMES`; `isNewGame()` flies a "New!" flag until she plays it, and it ages out on the next version bump.
- **Game registry** (`registerGame()` in core.js): a game declares itself **once, in its own file** —
  id, world, icon, names, `lvl`, optional `v`, and its level object. `hub.js` derives `LEVELS`, `GAMES`
  and each world's game list from `GAME_REGISTRY`; `WORLDS` there declares only a world's identity and
  colour. **Registration order — i.e. `<script>` order in index.html — is the order she walks a world's
  trail**, so an appended game lands at the far end of its path. That order is pinned by a test, so
  reordering the tags fails CI instead of quietly moving a game she finds by place.
- **38 games** (35 `LEVELS` + specials `paint`/`story`/`dressup`, which own a whole screen and are
  dispatched by `startGameNow`). Each level object has `theme`, `rounds`, `startRound()`, and reads
  `state.tier` (0–2).
- **World party** (`worldParty` in core.js): the node closing each world's trail. It plays **one round
  each from three games she has already played in that world** — interleaved retrieval practice, the
  one well-evidenced lever the app lacked, since every game otherwise drills its concept alone. It
  reuses the normal round engine through three hooks: `totalRounds()` returns 1 while a party is
  active, `levelComplete()` hands on to `worldParty.next()` instead of celebrating, and
  `drawProgress()` tracks the party rather than the game inside it. **Never a gate** — tappable from
  the first visit, and an unplayed world tops the queue up from its other games, so it is a sampler
  early and real review later. `showHub()` stops it; the party is not saved as the buddy's spot.
- **Difficulty**: `tierFor(level)` — manual easy/med/hard force 0/1/2; **auto mode uses a performance model**
  (`fionaPerf`: `autoTierFor`, EMA of round quality, down-shift on ≥3 mistakes). Mistakes are counted via the
  wrapped `sfx.bad`; `roundComplete` records perf and can lower the next round's tier.
- **Scene kit** (`scene.html(biome, opts)` in `js/scene.js`): the shared drawn-SVG scenery every
  game composes its background from — 7 biomes, layers `canopy/far/drift/mid/ground/motes/frame`.
  Built because measured foreground occupancy averaged 15% of the play area across all levels.
  Call it *after* a game's own full-bleed backdrop or that backdrop paints over it; pass a
  `layers` subset when a game already draws its own floor or sky. Seeded (identical on repaint),
  inert (`pointer-events:none`), and complete at frame 0. See `docs/ART-STYLE-GUIDE.md`.
- **Audio**: `speak()` (Web Speech), `voice()`/`sfx` (Web Audio synth), `MUSIC` styles. No audio files.
  - **Ambience** (`ambience` + `AMBIENCE` in core.js): a quiet continuous bed per world — filtered
    noise that sways, plus sparse details (a bubble, a bird). It keys off the same 7 biomes as the
    scene kit via `scene.forLevel(id)`, so a game gets its sound from its theme with no per-game work.
    `startLevel` starts it, `showHub` moves it to the hub's sea, and **"Music: off" silences it** —
    that control governs all background sound. It sits far under the speaking voice; per BAR-CONFIG
    the calm path beats atmosphere, so ambience must never compete with an instruction.
  - **Signature cues** (`CUES` in core.js): the sound a game makes on a correct round. Every game used
    the same `good()` chime, so 38 activities were acoustically identical. A game now picks one by name
    — `registerGame({ cue: "splash" })` — and `roundComplete()` plays it. **`cue` is required and must
    come from the palette**; `registerGame` throws otherwise, so a game literally cannot ship silent.
    Add to `CUES` rather than inventing a sound in a game file, or the family drifts.
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
- Serve: `python -m http.server 8765` (or the `little-explorer` preview config).
- The preview tab is backgrounded → CSS animations freeze at frame 0 and `preview_screenshot` times out.
  Verify via `preview_eval` / `preview_console_logs`; to measure true layout, inject
  `*{animation:none!important;transition:none!important}` or use `offsetWidth`.
- `startLevel(id)` resets tier via `tierFor`; in tests set `state.tier`/`round` **after** `startLevel`, then call `LEVELS[id].startRound()`.

## Deploy
- Push to `main` → `.github/workflows/pages-deploy.yml` validates (required files, JSON, JS syntax) then
  auto-deploys to GitHub Pages. Don't push code that fails `/release-check`.
- **Shipping a new game** — three edits, no lists to keep in step:
  1. `js/games/<id>.js` — write the level, then call `registerGame({ id, world, icon, name, es, yue, lvl,
     v: <the APP_VERSION it ships in>, level })` at the bottom. `v` flies the "New!" flag on the map and
     expires on its own — nothing to switch off later.
  2. `index.html` — append its `<script src>`. Append, don't insert: position in the list is position on
     the world's trail, and the newest belongs at the end.
  3. `sw.js` — add the file to `ASSETS` and bump `CACHE`. A test fails if you forget the `ASSETS` entry,
     because that break only shows up offline, on her device, with nobody watching.
  Then update the world-order list in `tests/smoke.spec.mjs` to include it.

  **A new game must also look and sound like the rest — both are enforced, not merely asked for:**
  - **Sound:** `cue` is a required `registerGame` field and must name an entry in `CUES`. Ambience
    comes free from the theme. There is nothing optional here; the registration throws.
  - **Scenery:** compose the background from `scene.html(biome, opts)` (see `docs/ART-STYLE-GUIDE.md`).
    A ratchet test pins how many games carry scenery and fails if that number ever drops, so coverage
    can go up and never back down.

## Privacy
- The child's name lives only in localStorage; it must not appear in any committed/public file
  (manifest, README, docs). Default display name is "Explorer".
