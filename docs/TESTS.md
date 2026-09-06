# Test Coverage Log

> **This file is not auto-updated, whatever it used to say.** It sat at "Last updated:
> 2026-06-25" with a coverage table reading "(none yet)" while the suite grew to 30+
> tests, so an agent reading it concluded there were no tests at all. The suite in
> `tests/smoke.spec.mjs` is the record; run `npm test` to see it. What follows is the
> standard a game's tests should meet, which is still worth having written down.

Last reviewed: 2026-09-06

---

## Coverage Summary

| Game | File | Happy path | Mistake + hint ladder | Tier 0→1→2 transitions | Notes |
|---|---|---|---|---|---|
| (none yet) | — | — | — | — | Analyst agent will populate this |

---

## Test files

Tests live in `tests/`. Each game should have at minimum:
1. **Happy path** — `startRound()` completes successfully at tier 0
2. **Mistake + hint** — wrong answer triggers hint escalation (stage 1 → 2 → 3)
3. **Tier transitions** — roundComplete downgrades tier on repeated mistakes, upgrades on success

## Analyst agent instructions

When adding tests for a game:
1. Read `js/games/<name>.js` to understand `startRound()` and answer-check logic
2. Add a test file at `tests/<name>.spec.mjs`
3. Update the table above with coverage status
4. Run `npx playwright test tests/<name>.spec.mjs` to verify tests pass before committing
