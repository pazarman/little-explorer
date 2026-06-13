---
description: Run the pre-deploy release gate (skill 05) against the current working tree before pushing to the live site.
---

Run the release gate before this change deploys to the live GitHub Pages site (push to `main` auto-deploys).

1. Read `docs/skills/05-release-gate-skill.md`.
2. Start the preview (`preview_start`) and drive the app to verify:
   - Core navigation: hub → world → game → home, exactly one screen visible at each step.
   - No blocked progression: the changed game(s) can be completed; no console errors (`preview_console_logs`).
   - Settings/progress persist across a reload.
   - Parent gate: settings + reset are not reachable by a single child tap.
   - Sensory balance: no stacked intense effects on the changed screens.
3. Re-check layout at mobile (375×812) for the changed screens — remember the preview tab freezes CSS animations, so measure with `*{animation:none!important;transition:none!important}` injected or via `offsetWidth`.
4. Confirm `sw.js` CACHE was bumped if shipping changes.
5. Output a ship / no-ship decision. If no-ship, list each blocker with file:line and a fix plan.
