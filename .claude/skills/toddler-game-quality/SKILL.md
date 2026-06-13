---
name: toddler-game-quality
description: Apply when building, reviewing, scoring, or shipping any mini-game, screen, or UI in Little Explorer (the toddler PWA in index.html) — enforces the 7-axis product quality bar, learning design, STEM scope, accessibility/safety, and the pre-deploy release gate. Trigger on any change to game logic, new games, difficulty/audio, or before pushing to the live site.
---

# Toddler Game Quality

This project ships to 2–5 year olds on a live site. Hold every change to the bar in `docs/skills/`.
This skill is the operating layer; `docs/skills/01–06` are the authoritative detail — open them when scoring.

## Non-negotiables (Core Bar — any failure blocks ship)
- Child-first & audio-first: understandable without reading.
- No fail-state: a wrong attempt never punishes or dead-ends; the round is always completable.
- Parent trust: settings + destructive actions are gated, never one child tap.
- Fast input (<100ms perceived) on a low-end phone; targets ≥44px.

## Score before shipping (skill 01, 7 axes ×0/1/2, pass ≥ 11/14)
Learning efficacy · Clarity · Pacing/adaptivity · Emotional safety · Motor accessibility · Sensory balance · Reliability.
Auto-fail if Learning efficacy, Emotional safety, or Reliability is 0. Use `/review-game <id>` to score with file:line evidence.

## Build conventions (match the published bar: Ocean, Dress-Up, upgraded Numbers world)
- **Learning first** (BAR-CONFIG primary goal). Every game declares a STEM objective per skill 06:
  `Domain · Concept · Age band · Success`. Tie number **symbol ↔ quantity** (growing numeral/badge, burst-exactly-N).
- **Drawn SVG for hero objects**; emoji only as whole objects, never fake-layered.
- **Juice with restraint**: sparkle + rising tone + squish per action, but never stack intense effects; keep a calm path (sensory balance).
- **Hint ladder** (skill 02): 1st wrong = verbal cue, 2nd = highlight the target, 3rd = guided assist. De-escalate difficulty within ~3 mistakes (auto mode already down-shifts via the `fionaPerf` model).
- `clamp()`/`vmin` everywhere; verify mobile (375×812).

## Before pushing (deploy is automatic on push to main)
Run `/release-check`. Verify zero console errors, exactly one screen visible per nav step, and bump `sw.js` CACHE.
Note: the preview tab freezes CSS animations — measure layout with `*{animation:none!important;transition:none!important}` injected, or use `offsetWidth`.
