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

### [PROPOSED] Dedicated "Feelings & Me" world
- **What:** Give the SEL / well-being games their own hub category. Right now **Feelings** and **Go Find It** live in Brain Games; add a category disc (e.g., 💛 "Feelings") and move them there, with room for Wind-Down and Build-a-Buddy.
- **Why:** SEL is a first-class developmental domain; a dedicated world signals it and keeps Brain Games from overflowing.
- **Fit/effort:** Low-Medium — a new `CATEGORIES` entry + a `c-*` color class; no new art required.
- **Route:** platform (hub/navigation).
