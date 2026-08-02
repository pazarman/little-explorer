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

### [PROPOSED] Graphics / SVG art overhaul  ⭐ high priority (owner-requested)
- **What:** A cohesive art pass across the drawn SVG heroes. Several read as rough or off-model — the owner specifically flagged the **hippo** (it should feel chunky, round, and fun — "Hungry Hungry Hippos" energy — not flat), and noted other animals could improve. Define a shared visual style (proportions, outline weight, shading, palette), then audit every hero SVG and rebuild the weakest ones, hippo first.
- **Why:** art quality is currently uneven; consistent, charming characters lift the Aesthetic-Cohesion axis across the whole app and make it feel professionally made.
- **Unblocks:** **Build-a-Buddy** (needs a quality, consistent part library to assemble from).
- **Fit/effort:** High effort, high payoff. Run as a dedicated initiative: (1) a one-page style guide, (2) a prioritized rebuild list starting with the hippo, (3) per-game art tasks.
- **Route:** cross-cutting platform initiative → then per-game art tickets.

### [PROPOSED] Dedicated "Feelings & Me" world
- **What:** Give the SEL / well-being games their own hub category. Right now **Feelings** and **Go Find It** live in Brain Games; add a category disc (e.g., 💛 "Feelings") and move them there, with room for Wind-Down and Build-a-Buddy.
- **Why:** SEL is a first-class developmental domain; a dedicated world signals it and keeps Brain Games from overflowing.
- **Fit/effort:** Low-Medium — a new `CATEGORIES` entry + a `c-*` color class; no new art required.
- **Route:** platform (hub/navigation).
