# Platform Backlog

Non-game platform improvements — onboarding, parent features, accessibility, performance,
cross-device/PWA, and other wrapper-level work. (Game ideas live in `GAME_BACKLOG.md`.)

The **Product Researcher** (`.claude/agents/product-researcher.md`) appends evidence-backed,
values-filtered proposals here; the **Project Manager** vets them against the quality bar; the
Implementer builds the approved ones. Dated research briefs live in `docs/research/`.

## Status legend
- `PROPOSED` — Researcher added it, needs review
- `READY` — approved, ready to build
- `IN_PROGRESS` / `DONE` / `REJECTED`

---

## Queue

<!-- Researcher appends [PROPOSED] items here, each with: what · why (evidence + source) · fit/risk · effort -->

### [IN_PROGRESS] Graphics / SVG art overhaul  ⭐ high priority (owner-requested)
- **What:** A cohesive art pass across the drawn SVG heroes. Several read as rough or off-model — the owner specifically flagged the **hippo** (it should feel chunky, round, and fun — "Hungry Hungry Hippos" energy — not flat), and noted other animals could improve. Define a shared visual style (proportions, outline weight, shading, palette), then audit every hero SVG and rebuild the weakest ones, hippo first.
- **Why:** art quality is currently uneven; consistent, charming characters lift the Aesthetic-Cohesion axis across the whole app and make it feel professionally made.
- **Unblocks:** **Build-a-Buddy** (needs a quality, consistent part library to assemble from).
- **Fit/effort:** High effort, high payoff. Run as a dedicated initiative: (1) a one-page style guide, (2) a prioritized rebuild list starting with the hippo, (3) per-game art tasks.
- **Route:** cross-cutting platform initiative → then per-game art tickets.
- **Progress (v40):**
  - ✅ **Style guide** written — `docs/ART-STYLE-GUIDE.md` (proportions, saturated palette, the eyes-must-be-alive highlight rule, cheeks, color-learning-safe rule; dragon / Feelings faces / dress-up doll named as on-model references).
  - ✅ **Hippo** rebuilt (flagship) — chunky round body, big open coral mouth + teeth, glossy highlighted eyes, round ears, rosy cheeks, feet. Real "Hungry Hungry Hippos" energy.
  - ✅ **Ocean fish** rebuilt — living eye + highlight, fins, tail, gill line, belly sheen, smile; stays **one clear color** so color-learning integrity holds across all palettes.
  - ✅ **Dolphin** polished — eye highlight, subtle cheek, brighter body gradient.
  - Audit found the **dress-up doll** (`dressup.js`) already on-model (layered parts, cheeks, rich options) — leave as-is; it's the Build-a-Buddy foundation. The **dragon** is also on-model.
  - **Remaining (lower priority):** object heroes (rocket, plane, plants, basket, cups) are simpler but clean; touch them against the guide as their games are next edited.

### [DONE] World map hub — Layer 1 (v43)  ⭐ owner-requested
- **What:** Turned the hub from an auto-fit grid floating on decorative wallpaper into a real map. Each
  world now has a **fixed spot** (`HUB_LAYOUT` in `js/hub.js`, one coordinate set per orientation), sits on
  its own painted island with scenery, and is joined by the dashed trail — `#mapPath` existed in the markup
  but had been fed empty `points` on every build, so the map metaphor was scaffolded and never finished.
- **Why:** the discs reflowed with viewport width and with the difficulty filter, so a world sat in a
  different place on a phone than a tablet. Fixed coordinates are *better* for findability, not worse —
  a 2–5 year old navigates by place and colour, not by reading.
- **Also fixed — a live bug:** world stars were `round(totalCompletions / gamesInWorld)`, a rounded
  *average*, so adding a game to a world could take away a star she had already earned (verified: Brain
  Games went 1 ⭐ → 0 ⭐ on a simulated ship). Now `worldStars()` counts *distinct games tried* against fixed
  milestones — monotonic, and it rewards breadth, which is what we want the weekly drop to earn.
- **New-game beacon:** a game tagged `v: <APP_VERSION>` in `GAMES` flies a gold "New!" pennant on its world
  disc and its game node, and the narrator points her at that world on hub entry ("Look! Something new in
  Brain Games!"). Both stop the moment she plays it, and the tag ages out on the next version bump — no
  manual cleanup, which is what makes it survive a weekly cadence.
- **Deliberately not done (see Layer 2/3 below):** no trail *inside* a world, no locks or gating, no
  streaks, no decor accumulation.
- **Verified:** 320/393/727/820/1180-wide viewports in both orientations, no disc overlap or off-screen
  nodes; portrait↔landscape flip redraws, an in-orientation resize does not; reduced-motion honoured;
  18/18 smoke tests (3 new: fixed placement, star monotonicity, the New! flag lifecycle).

### [PROPOSED] World map — Layer 2: a trail inside each world
- **What:** Replace a world's flat game grid with a winding path of stepping stones, oldest → newest, so a
  weekly game arrives as a new stone at the end of the trail. No locks — the path is wayfinding, not gating.
- **Blocked on a real problem:** Brain Games already holds 12 games. A trail through 12 stones does not fit
  a phone screen, and making her *scroll* to reach a familiar game is a straight regression on the one
  thing the current hub does well. Split the oversized worlds first (the "Feelings & Me" item below is
  exactly that split) and only then trail the smaller worlds.
- **Open question:** newest-at-the-far-end keeps every existing game's position stable but puts the game we
  most want tried furthest from the entrance. Current lean: keep order stable and let the Layer 1 hub
  beacon carry discovery instead of position.

### [PROPOSED] World map — Layer 3: a map that accumulates
- **What:** Give the map a visible record of the journey, so it looks different after six weeks than on day
  one. Sparks reset to 0 on every rocket launch, so nothing durable is currently shown anywhere she looks.
- **Route worth taking:** the sticker book is *already* a decorate-a-place feature (`fionaDecor`, drag-place,
  a "this sticker belongs here" bonus) but its 5 `SCENES` are a second, disconnected world taxonomy next to
  the 6 `CATEGORIES`. Merge them — earn a sticker in the Ocean world, place it on the ocean island — rather
  than building a third collection system.
- **Guardrails:** primary goal is learning outcomes and every auto-fail rubric axis lives inside games, so
  cap the effort. No streaks, no daily-login mechanic, no counter that can go down.

### [PROPOSED] Dedicated "Feelings & Me" world
- **What:** Give the SEL / well-being games their own hub category. Right now **Feelings** and **Go Find It** live in Brain Games; add a category disc (e.g., 💛 "Feelings") and move them there, with room for Wind-Down and Build-a-Buddy.
- **Why:** SEL is a first-class developmental domain; a dedicated world signals it and keeps Brain Games from overflowing.
- **Fit/effort:** Low-Medium — a new `CATEGORIES` entry + a `c-*` color class; no new art required.
- **Route:** platform (hub/navigation).
