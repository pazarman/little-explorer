# Agent Org — Little Explorer

The team of agents that research, build, and oversee the game. **Only the human merges to `main` and
deploys** — every agent stops at "review-ready."

## The pipeline

```
Researcher + Curator ──propose──▶ Backlog ──vet & approve ~2/wk──▶ Project Manager ──marks READY──┐
                                                                                                   │
                                                                                                   ▼
                                     Human ◀──review · merge · deploy──── Implementer ──builds READY item
                                       │                                                            ▲
                                       └────────── can veto / promote any item ─────────────────────┘
```

## Roles

| Role | Looks | What it does | Writes code? | Merges/Deploys? | Def |
|---|---|---|---|---|---|
| **Product Researcher** | Outward | Mines learning science + best-in-class kids' apps; files evidence-backed, values-filtered proposals | No | No | `.claude/agents/product-researcher.md` |
| **Project Manager** | Inward | Audits games vs the quality bar, flags gaps, keeps docs honest, and **approves ~2 items to READY/week** | No (docs/status only) | No | `.claude/agents/project-manager.md` |
| **Implementer** | Build | Builds the #1 `READY` item to spec, verifies + runs the release gate, pushes a review-ready branch | Yes | **No** | `.claude/agents/implementer.md` |
| **Backlog Curator** | — | Proposes new game ideas into the backlog (existing automation) | No | No | (existing) |
| **You (human)** | — | Review, mark items `READY`, merge to `main`, deploy | — | **Yes** | — |

## Schedule — one weekly cycle

Everything runs in **one orchestrated session, Mondays at 9:00 AM Panama** (`0 13 * * 1`,
`trig_0148bnc2QDi9Wm4NTrbrEyrM`), in dependency order, ending with **one summary email**:

> **Analyst** (score) → **Researcher** + **Curator** (propose) → **PM** (audit + approve ~2 READY) →
> **Implementer** (build top READY) → dashboard refresh → single summary email.

All work lands on a `weekly/<date>` branch for the human to review, merge, and deploy — nothing ships
automatically. Each agent can still be invoked on demand any time.

The individual per-agent triggers are **disabled** in favor of this cycle. (Two legacy triggers —
Backlog Curator and Analyst, created via the older API — must be disabled by the owner in the
claude.ai Routines UI; agents can't toggle them.)

## Where each agent's work shows up

- **Project Manager** → a report (email/push); doc corrections on a `pm/weekly-audit-<date>` branch.
- **Product Researcher** → a report (email/push); dated briefs in `docs/research/`; proposals appended to
  `docs/GAME_BACKLOG.md` (games) or `docs/PLATFORM-BACKLOG.md` (platform); on a `research/<date>-<topic>` branch.
- **Implementer** → a built game on a `feat/<item-id>` branch, the backlog item flipped to `IN_REVIEW`, and a
  report with the release-gate result for your review.

## Where to watch it live

- **Scheduled runs & history:** the Routines page on claude.ai (shows each firing, status, and next run).
- **What they produced:** the branches above on GitHub — `github.com/pazarman/little-explorer/branches`.
- **Current priorities & status:** `docs/GAME_BACKLOG.md`, `docs/PLATFORM-BACKLOG.md`, `docs/COVERAGE.md`.
