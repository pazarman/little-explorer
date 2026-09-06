# Art Style Guide — Little Explorer's World

The one-page reference for drawn SVG hero art. Every character should feel like it
belongs to the same friendly, chunky, storybook cast. Use this before drawing or
reviewing any hero SVG. Reference the **dragon** (`js/games/dragon.js`), the
**Feelings faces** (`js/games/feelings.js`), the **hippo** (`js/games/hippo.js`),
and the **dress-up doll** (`js/games/dressup.js`) — these are on-model.

## The look in one line
**Round, chunky, bright, and alive.** Big soft shapes, bold saturated fills, and
eyes that feel awake. If it looks flat or muddy, it's off-model.

## Proportions
- **Big head, small body.** Toddler-cute = oversized head, short chunky limbs, low
  center of gravity. Round every silhouette; avoid sharp corners on bodies.
- Fill the viewBox generously — the character should be the hero, not float small.
- Whatever the game's focal action is, make that feature the biggest, boldest thing
  (the hippo's **open mouth** is huge because the game is about feeding it).

## Color
- **Saturated, cheerful fills.** No greyed-out or muddy tones (the old hippo's
  `#9c8aa8` mauve was the anti-pattern — it read as dirty, not fun).
- 2 tones per form: a base + a lighter belly/muzzle (`+~20% lightness`) for soft volume.
- Accent warmth with **rosy cheeks**: a pink circle (`#ff7fb6`) at `opacity .4–.55`.
- Keep a small, consistent accent palette across characters: cheek pink `#ff7fb6`,
  mouth/tongue coral `#ff6f91` over throat `#c74268`, teeth/highlights `#fff`.

## Eyes — the #1 rule: **eyes must be alive**
Flat "white circle + dark dot" is the most common way art dies. Always:
1. White of the eye (circle or tall ellipse),
2. Dark pupil/iris,
3. **A small white highlight dot** on the pupil (up/inner side).

The highlight is what makes a character feel awake and friendly. Never skip it on a
hero. (See the hippo, fish, and dolphin — each got a highlight in the overhaul.)

## Line & shading
- Prefer **shape-on-shape** (layered fills) over heavy outlines. When you stroke,
  use a consistent weight (**~5–6** on a ~100px viewBox), `stroke-linecap="round"`,
  `stroke-linejoin="round"`.
- Suggest volume with one lighter overlay shape (belly, muzzle, cheek sheen) — don't
  render realistic gradients on characters (the dolphin's single vertical gradient is
  the max; everything else is flat cel-shading).
- Mouths: a darker throat shape behind a brighter tongue reads as depth cheaply.

## Color-learning art is special
For games where the child names the **color** of the object (ocean fish, cups),
the whole object must be **one clear color** — fins, tail, and body all share the
target hue. Add life with **neutral/white overlays only** (white belly sheen,
black-at-low-opacity gill/smile). Never tint a sub-part a different color, or you
break the "what color is it?" learning goal.

## Backgrounds: use the scene kit, don't hand-roll one

`js/scene.js` is the shared scenery library — drawn SVG layers every game composes its
screen from. It exists because measured occupancy across all 35 levels averaged **15%** of
the play area, with 20 games under 15%: objects floating in a gradient.

```js
$("playArea").innerHTML = scene.html("reef", { seed: 3 + state.round * 5 }) + `…the game…`;
```

- **Biomes:** `snow, reef, meadow, savanna, forest, space, cozy`. Most games can pass their
  body theme instead and let `THEME_BIOME` pick.
- **Layers**, back to front: `canopy, far, drift, mid, ground, motes, frame`. Pass a subset
  via `{ layers: [...] }` when a game already paints its own floor or sky — doubling up looks
  worse than nothing.
- **Order matters.** If a game draws its own full-bleed backdrop, put the kit call *after* it
  or the backdrop paints straight over it (this happened to Counting Critters).
- **The frame is the important one.** Something nearest the eye at the screen edges is what
  makes a flat screen read as a place. Skip it last.
- **Drifters stay neutral.** In colour-naming games the tappable objects carry the answer, so
  background shapes are silhouettes only — never a nameable colour.
- Everything is seeded, so a scene lands identically on every repaint; vary `seed` per round
  for variety within one game.
- Everything is `pointer-events:none` and looks complete at frame 0. Both are covered by tests.
- **Tint when the biome fights the theme.** `{ tint: "#8d5bb0" }` keeps every form and its
  relative lightness but adopts one hue, so the scene reads as depth in the game's own palette.
  Forest greens over Dragon Feed's purple sky looked like scenery from a different app; tinted,
  the same shapes read as violet hills and the green dragon becomes the hero again.


## Non-negotiables (from CLAUDE.md)
- Drawn SVG for hero objects; emoji only as **whole objects**, never fake-layered.
- Tie number **symbol ↔ quantity** where counting is the goal.
- Respect `reducedMotion()` — art should look complete at frame 0 (no reliance on
  animation to look right).

## Rebuild priority (living list)
1. ~~**Hippo**~~ ✅ done — chunky HHH-energy rebuild (flagship).
2. ~~**Ocean fish**~~ ✅ done — living eye, fins, gill, belly; color-safe.
3. ~~**Dolphin**~~ ✅ done — eye highlight + subtle cheek + brighter gradient.
4. Audit remaining heroes against this guide as they're touched; objects
   (rocket, plane, plants, basket) are lower priority than living characters.

## Unblocks
A consistent character style + the dress-up doll's part system are the foundation
for **Build-a-Buddy** (backlogged) — build its part library to this guide.
