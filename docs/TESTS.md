# Test Coverage Log

Auto-updated by the Analyst agent after each merge. Do not edit manually.
Last updated: 2026-06-25

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
