# Skill 01: Product Quality Bar

Hard gate. A feature ships only if it (a) passes every Core Bar item and (b) scores >= the threshold,
with no auto-fail axis at 0.

Primary product goal (see `BAR-CONFIG.md`) is **Learning outcomes**, so Learning Efficacy is a scored
axis and an auto-fail axis. Pair this file with `02-learning-design`, `03-content-quality`,
`04-accessibility-safety`, and `06-stem-scope-and-sequence`.

## Core Bar (pass/fail — all required)

- Child-first: understandable without reading; audio-first.
- No fail-state: a wrong attempt never punishes or dead-ends; the round is always completable.
- Calm confidence: feedback encourages; effects never overwhelm or stack.
- Parent trust: settings + destructive actions are gated (long-press + a simple parent check), never one child tap.
- Fast interaction: input feels immediate (<100ms perceived) on a low-end phone.

## Scoring Rubric (0 / 1 / 2 per axis — 7 axes, max 14)

Score each axis with the anchors. Record the per-axis numbers, not just the total.

1. **Learning efficacy** — teaches a specific named concept and reinforces the *right mental model*.
   - 0: no clear concept, or pure rote "tap the right thing." 1: a concept is present but weakly reinforced.
   - 2: concept is explicit, reinforced across modalities (see + hear + do — e.g. quantity tied to the numeral), and deepens across tiers.
2. **Clarity** — one concrete objective, sayable in 4–8 words.
   - 0: ambiguous or multi-step. 1: clear but wordy. 2: obvious from audio + the first frame.
3. **Pacing / adaptivity** — ramps gradually; de-escalates within ~3 mistakes.
   - 0: flat or spikes. 1: ramps but slow to assist. 2: ramps and a hint ladder reaches guided assist by the 3rd wrong.
4. **Emotional safety** — supportive under repeated failure; no pressure or urgency.
   - 0: any punishment or time pressure. 1: neutral. 2: actively reassuring on mistakes.
5. **Motor accessibility** — targets >= 44px, forgiving hit/drop zones, no precision traps.
   - 0: small/precise targets. 1: adequate. 2: generous, snap-assisted.
6. **Sensory balance** — effects proportionate; no stacking of intense effects; a reduced-motion / calm path exists.
   - 0: overstimulating or stacked. 1: a bit busy. 2: balanced and calm-mode honored.
7. **Reliability** — works in browser, installed PWA, and offline; no console errors; holds on phone + tablet.
   - 0: errors or breaks. 1: works with minor jank. 2: clean across surfaces.

## Pass Threshold

- Minimum total: **11 / 14**.
- Auto-fail if ANY of these scores 0: **Learning efficacy, Emotional safety, Reliability**, or any Core Bar item.
- A "weak but working" game (10/14) is a backlog item, not a ship.

## How to use

- Use `/review-game <name>` (or the `pr-review` template) to score a game with file:line evidence.
- A score of 2 on every axis is the published bar (Dress-Up, Ocean, the upgraded Numbers world).
