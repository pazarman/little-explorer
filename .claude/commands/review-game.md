---
description: Critically score a mini-game against the toddler quality bar and propose upgrades to reach 14/14.
argument-hint: <game-id> (e.g. snow, bike, pizza, trace, memory, pattern, sort, music, whosays, dino, petcare, petmatch, petfeed, paint, story, dressup, icecream, ocean)
---

Critically review the game `$ARGUMENTS` in `index.html` against this project's quality system. Be a tough reviewer; do not inflate scores.

1. Read `docs/skills/01-product-quality-bar.md` (the 7-axis rubric), plus `02-learning-design`, `03-content-quality`, `04-accessibility-safety`, and `06-stem-scope-and-sequence`.
2. Locate the game's level object and its CSS/markup in `index.html`.
3. Score each of the 7 axes 0/1/2 using the anchors, each with a one-line justification and exact `file:line` evidence.
4. Give the total and a ship / no-ship call against the 11/14 threshold and the auto-fail rules.
5. Tag the game's STEM objective (Domain · Concept · Age band · Success) per skill 06, and flag if it's weak or missing.
6. List the 2–4 highest-ROI upgrades to reach 14/14, each tied to a specific axis or STEM gap.

Do not modify code in this command — output the review only.
