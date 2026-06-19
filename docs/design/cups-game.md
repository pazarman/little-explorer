# Design: "Three Cups" — find the hidden object after a shuffle

Status: design (not yet built). Target branch: `claude/three-cup-shell-game-y15zsj`.
Scored against `docs/skills/01` (7-axis bar) and mapped to `docs/skills/06` (STEM scope).

## 1. What it is (and what it is NOT)

A ball is hidden under one of three drawn cups. The child **watches** the cups shuffle,
then taps the cup the ball is under.

It is **not** a guess-the-cup gambling game. The learning is **visual tracking + working
memory + object permanence**, plus **ordinal/positional language** (left / middle / right).
This is deliberately distinct from `hideseek.js`, which already owns in / on / under at rest.

### STEM objective tag (goes in a comment by the level object, per skill 06)
```
Spatial Reasoning + Working Memory · object tracking through a swap; left/middle/right ·
Age band 3–5 · Success = Child keeps track of a hidden object as positions swap and names where it is.
```
Fills the **Spatial reasoning Gap** (skill 06, gap #4) without duplicating hideseek →
candidate **2 on STEM Coverage Value**.

## 2. Placement in the app

- Level id: `cups`. Object name: `cupsLevel` in `js/games/cups.js`.
- Register in three places in `js/hub.js`:
  - `LEVELS` → `cups: cupsLevel`
  - `GAMES` → `cups: { icon: "🥤", name: "Three Cups", es: "Tres Vasos", lvl: 1 }`
  - `CATEGORIES` → add `"cups"` to the **`brain`** ("Brain Games") world (working-memory fit).
- Add `<script src="js/games/cups.js"></script>` in `index.html` (before `js/hub.js`).
- Bump `APP_VERSION` in `js/hub.js` and `CACHE` in `sw.js` (deploy convention).

## 3. Difficulty ladder (read `state.tier`, like every level)

Tiers follow the developmental ladder (skill 06 §sequencing), not arbitrary counts.

| Tier | Age | Swaps | Swap speed | What it trains |
|---|---|---|---|---|
| 0 | 2–3 | **0** | — | Object permanence + naming. Ball goes under a cup, cups settle, child finds it. No tracking load. |
| 1 | 3–4 | 2 | ~700 ms / swap, 250 ms gap | Track through a couple of slow, clearly-arced swaps. |
| 2 | 4–5 | 4 | ~480 ms / swap, 150 ms gap | Sustained tracking through faster swaps. |

`fionaPerf` auto-mode already down-shifts after ≥3 mistakes; tier maps cleanly onto the
swap-count/speed knob, so **Pacing/adaptivity is a strong 2** with no special code.

## 4. Round flow

```
startRound():
  this.mistakes = 0; state.busy = true
  pick ballSlot = rand(0..2)
  render 3 cups at slots [0,1,2]; draw ball under cup at ballSlot
  REVEAL: lift all cups ~900ms so the start position is seen
          voice: t("cups_watch")  // "Watch the ball! Where does it go?"
  lower cups (ball now hidden)
  runShuffle(nSwaps):           // see §5 — sequential, chained via core.wait
    each swap: pick two distinct slots, animate arc, swap their logical mapping
  on shuffle end:
    state.busy = false
    voice: t("cups_find")        // "Where is the ball now? Tap the cup!"
    enable taps
```

State is two small arrays so **correctness never depends on the animation** (reliability —
the preview tab freezes CSS at frame 0):
- `slotX = [x0, x1, x2]` — pixel/%-x of each of the 3 fixed slots.
- `cupAt[slot] = cupId` — which cup occupies each slot (updated on every swap).
- `ballCup` — the cup id the ball lives under (constant; never moves relative to its cup).
- Child is correct when the tapped cup's id === `ballCup`.

## 5. The shuffle animation ("bang on" — see it move)

Goal: a crisp, **arcing** swap you can clearly follow — two cups trade places, one hopping
over the top while the other slides under. The trick is to **decouple X and Y** so a CSS
transition (slide) and a keyframe (hop) run at once without fighting over `transform`:

```
.cup-slot   { position:absolute; transition: transform .55s cubic-bezier(.34,1.2,.64,1); }
            /* transform = translateX(slotX) — set in JS, the slide */
.cup-lift   { /* inner wrapper; holds the hop so it doesn't clobber the slide */ }
.cup-lift.hop-over  { animation: cupHopOver var(--swapMs) ease-in-out; }
.cup-lift.hop-under { animation: cupHopUnder var(--swapMs) ease-in-out; }

@keyframes cupHopOver  { 50% { transform: translateY(-46%) scale(1.04); } }  /* arcs above */
@keyframes cupHopUnder { 50% { transform: translateY(12%)   scale(.97); } }  /* dips below */
```

Per swap (`swap(a, b)`):
1. `--swapMs` = tier speed; set on both cups.
2. Outer `.cup-slot` of cup A → `translateX(slotX[b])`; cup B → `translateX(slotX[a])`
   (the CSS transition does the horizontal glide).
3. Add `hop-over` to one inner `.cup-lift`, `hop-under` to the other (the vertical arc),
   alternating which hops each swap so it reads as a real cross.
4. Update logical state: swap `cupAt[a] ↔ cupAt[b]`; raise z-index of the hopping cup.
5. `core.wait(nextSwap, swapMs + gap)`; on the last, clear hop classes + `state.busy`.
6. Light juice: a soft `sfx.tick()` at each swap's apex — **one** sound, no sparkle storm
   (sensory balance: never stack intense effects).

Why this survives our constraints:
- X via `transition` + Y via `animation` on a **nested** element = no transform conflict.
- Positions come from `slotX` (computed from the real play-area rect, like `memory.js`
  sizes cards), so it's responsive (`clamp()/vmin`) and testable via `offsetWidth`.
- Logic is in `cupAt`/`ballCup`, so a frozen preview still lets us assert correctness with
  `preview_eval` even when the animation doesn't visibly run.

`@media (prefers-reduced-motion)`: drop the hop, keep a slower straight slide, and cap tier-2
to 2 swaps — still playable, calmer path (sensory balance + accessibility).

## 6. No-fail + hint ladder (Core Bar — auto-fail axes)

The shell game's natural failure mode (you guessed wrong) is engineered out:

- **Wrong tap** → that cup lifts, shows empty, gentle `t("cups_nope")` ("Not there — peek
  under another!"). Ball stays on screen and findable. **No reshuffle, no penalty, no
  dead-end.** `sfx.bad()` fires (wrapped → feeds the difficulty model) but tone is warm.
- **Hint ladder** (skill 02), mirroring `hideseek`/`memory`:
  - miss 1 → verbal nudge only.
  - miss 2 → the correct cup `wiggle()`s (`hint-glow`).
  - miss 3 → the correct cup lifts ~halfway to reveal the ball (guided assist).
- **Right tap** → cup lifts, ball bounces, `sfx.good()`, `miniStar(ev.clientX, ev.clientY)`,
  `speak(praise())`, `roundComplete()`. Celebration is identical regardless of try count.

→ **Emotional safety and Learning efficacy both clear 0**; expected total ≈ **12–13/14**.

## 7. Art (project conventions)

- **Drawn SVG cup** (hero object — emoji only as whole objects). Inverted cup, viewBox
  `0 0 100 100`, e.g.:
  ```
  <svg viewBox="0 0 100 100"><path d="M24 16 H76 L70 86 Q50 94 30 86 Z" fill="#e2584b"/>
    <ellipse cx="50" cy="16" rx="26" ry="6" fill="#c2453a"/>
    <path d="M30 86 Q50 94 70 86" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="3"/></svg>
  ```
- **Ball**: drawn SVG circle with a highlight (or a whole-object emoji like 🔴/⚽ — never
  fake-layered). Sits at `bottom` of the active slot, behind the cups (`z-index` below cups).

## 8. i18n keys to add (en + es)
`cups_watch`, `cups_find`, `cups_nope`, `cups_retry`, `cups_win`, plus `GAMES.cups.name/es`.

## 9. Build / verify checklist
- [ ] `js/games/cups.js` with objective-tag comment; register in `LEVELS`/`GAMES`/`CATEGORIES`.
- [ ] `<script>` tag in `index.html`; CSS in `css/style.css`.
- [ ] Tiers 0/1/2 give 0/2/4 swaps; `cupAt`/`ballCup` correct after a scripted swap sequence
      (assert via `preview_eval`, animation-independent).
- [ ] Wrong tap never reshuffles, never dead-ends; hint ladder at miss 2 / 3.
- [ ] One screen visible per nav step; zero console errors.
- [ ] `prefers-reduced-motion` path works; targets ≥44px; mobile 375×812.
- [ ] Bump `APP_VERSION` + `sw.js` CACHE. Run `/release-check`.
