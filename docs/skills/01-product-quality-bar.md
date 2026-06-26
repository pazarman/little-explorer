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

## Scoring Rubric (0 / 1 / 2 per axis — 12 axes, max 24)

Score each axis with the anchors. Record the per-axis numbers, not just the total.

### Learning & Curriculum

1. **Learning efficacy** ⚠️ auto-fail — teaches a specific named concept and reinforces the *right mental model*.
   - 0: no clear concept, or pure rote "tap the right thing." 1: a concept is present but weakly reinforced.
   - 2: concept is explicit, reinforced across modalities (see + hear + do), and deepens across tiers.

2. **Vocabulary / language load** — each round introduces, uses in context, and confirms at least one word.
   - 0: no explicit vocabulary; objects are unnamed or incidental. 1: words are named but not used in context.
   - 2: word introduced by name + used in a sentence + confirmed by the child's action (e.g., "Find the *triangle* — the shape with three sides. Tap it!").

3. **Active construction** — the child generates or builds an answer, not just reacts to a binary prompt.
   - 0: every interaction is tap-the-right-one with immediate binary feedback only.
   - 1: some open-ended steps (ordering, matching more than 2 items, tracing).
   - 2: child constructs a unique output (sequencing, creative placement, open-ended expression) at least once per round.

4. **Social-emotional scaffolding (SEL)** — models or reinforces an SEL concept (persistence, emotion naming, kindness, self-regulation).
   - 0: no SEL framing; purely task-focused. 1: incidental SEL (e.g., encouraging tone only).
   - 2: an SEL concept is explicitly named and demonstrated through the game mechanic or narrative (e.g., "The dragon feels sad — let's help!" → child action → "You were so kind!").

5. **STEM coverage value** — fills a real developmental gap per `06-stem-scope-and-sequence.md`.
   - 0: duplicates a domain already well-covered (e.g., a fifth counting game) with no new concept or age-band.
   - 1: extends an existing domain meaningfully (new concept within a covered domain).
   - 2: addresses a gap domain (spatial reasoning, more/less, pattern depth, positional language) at the correct developmental tier.

### Interaction & Pacing

6. **Clarity** — one concrete objective, sayable in 4–8 words.
   - 0: ambiguous or multi-step. 1: clear but wordy. 2: obvious from audio + the first frame.

7. **Pacing / adaptivity** — ramps gradually; de-escalates within ~3 mistakes.
   - 0: flat or spikes. 1: ramps but slow to assist. 2: ramps and a hint ladder reaches guided assist by the 3rd wrong.

### Safety & Accessibility

8. **Emotional safety** ⚠️ auto-fail — supportive under repeated failure; no pressure or urgency.
   - 0: any punishment or time pressure. 1: neutral. 2: actively reassuring on mistakes.

9. **Motor accessibility** — targets >= 44px, forgiving hit/drop zones, no precision traps.
   - 0: small/precise targets. 1: adequate. 2: generous, snap-assisted.

### Polish & Reliability

10. **Sensory balance** — effects proportionate; no stacking of intense effects; a reduced-motion / calm path exists.
    - 0: overstimulating or stacked. 1: a bit busy. 2: balanced and calm-mode honored.

11. **Aesthetic cohesion** — the game feels like it belongs to the same world as the rest of the app.
    - 0: generic or visually inconsistent with the app's design language (mismatched emoji scale, clashing color grammar, no audio personality).
    - 1: mostly consistent but one element feels out of place.
    - 2: character voice, visual grammar, and emotional tone are coherent with the broader Little Explorer world.

12. **Reliability** ⚠️ auto-fail — works in browser, installed PWA, and offline; no console errors; holds on phone + tablet.
    - 0: errors or breaks. 1: works with minor jank. 2: clean across surfaces.

## Pass Threshold

- Minimum total: **18 / 24** (75%).
- Auto-fail if ANY of these scores 0: **Learning efficacy, Emotional safety, Reliability**, or any Core Bar item.
- A "weak but working" game (16–17/24) is a backlog item, not a ship.

## Rubric changelog

| Version | Date | Change |
|---|---|---|
| v1 | 2026-06-13 | Original 7-axis rubric (max 14, pass ≥ 11) |
| v2 | 2026-06-18 | Added axes 2–5 (Vocabulary, Active Construction, SEL, STEM Coverage Value) and axis 11 (Aesthetic Cohesion). Max → 24, pass → 18. Wired Skill 06 coverage gap into scoring. Informed by competitive research: KAK, Sago Mini, Homer, Pok Pok, Duolingo ABC, Four Pillars of Learning framework (Hirsh-Pasek et al.). |

## How to use

- Use `/review-game <name>` (or the `pr-review` template) to score a game with file:line evidence.
- A score of 2 on every axis is the published bar. Reference games: Ocean (Colors), Dress-Up, Numbers world.
- New games must also declare a STEM objective tag per `06-stem-scope-and-sequence.md`:
  `Domain · Concept · Age band · Success = (what the child can now do)`.
