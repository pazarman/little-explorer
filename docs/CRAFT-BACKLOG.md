# Craft backlog — ranked

Work aimed at the axes where an outside critic scored us lowest. Companion to
`docs/CRITIC-REVIEW.md` (the scoring and evidence) — this file is the plan.

Distinct from the other two backlogs on purpose:
- `GAME_BACKLOG.md` — **new games**
- `PLATFORM-BACKLOG.md` — **new features**
- **this file** — making what already exists good

---

## Where we actually stand

| Axis | Score | Evidence |
|---|---|---|
| Navigation & structure | 9 | the world map and trail |
| Values & trust | 9 | no ads/IAP/streaks/timers, offline, free |
| Content breadth | 8 | 38 activities |
| **Art direction** | **5** | three visual languages in one frame |
| **Pacing & game feel** | **5** | 2.7s dead air between rounds; ~2 taps per round |
| **Screen composition** | **4** | **average 15% foreground occupancy; 20 of 35 games under 15%** |
| **Audio** | **4** | 5 cues and 3 tunes shared across 38 games; zero ambience |
| **Onboarding** | **4** | two adult forms before a child can touch anything |

**Measured occupancy at tier 0, 393×851** — share of the play area carrying a discrete
foreground object. It deliberately ignores full-bleed backdrops, so a game with a painted
scene and nothing in it still scores low; that is the point, because density is *things*,
not gradients.

```
  1% trace     2% dolphin   2% eggcatch  5% music     5% petmatch
  8% ocean     8% whosays   8% petfeed  10% pasta    10% icecream
 10% measure  10% fuelup   10% senses   11% snow     11% dragon
 11% petcare  12% pizza    13% feelings 14% dino     14% hideseek
 15% bike     16% hippo    17% letternames  18% meerkat  20% scavenger
 21% rocket   21% pattern  22% monkey   25% sort     26% runway
 29% cups     29% nightday 30% sortkind 31% memory   46% body
```

## How this is ranked

`priority = (axis deficit × reach) ÷ effort`

- **deficit** — how far the axis sits below 8/10
- **reach** — how many screens the item touches (a shared system beats a one-off)
- **effort** — S ≈ hours, M ≈ a session, L ≈ several, XL ≈ a project

The consequence worth noting up front: **the top of this list is mostly shared systems,
not individual screens.** Filling 20 games one at a time is XL and never finishes; building
the kit that fills them is L and makes each one S.

---

## Tier 0 — do these first

### C1 · A shared scene kit  ·  effort L  ·  lifts Composition + Art  ·  ✅ **BUILT (v49)**
The force multiplier for the whole list. A small set of reusable layers every game can
compose from: a foreground frame (things at the screen edges, nearest the eye), a
mid-ground prop band, a far parallax band, and a consistent ground line. One system, applied
per-world with that world's palette and props.

Without this, C2 is 20 bespoke art jobs. With it, each is a few lines.

**Done when:** a game can go from 8% to 35%+ occupancy by declaring which layers it wants,
and three pilot games prove it.

> **Shipped in v49** as `js/scene.js` — 7 biomes, 7 layers, one shape vocabulary, all drawn
> SVG. Piloted on Ocean (8% → 21%), Egg Catch (2% → 15%) and Counting Critters. Adds ~110–160
> nodes per screen at a measured 61fps, so the cost is not the constraint.
>
> **Partly done, honestly:** the target was 35%+ and the pilots reached ~20%. The kit fills the
> canopy, the floor and the edges; the *middle* of a tall phone screen is where a game's own
> objects live, and only the game can decide how many of those there are. Raising the pilots
> further means denser game content, not more scenery.
>
> **Still weak and worth a second pass:** `space` reads thin (few forms suit it), and `snow`'s
> frame is white-on-white so it barely registers. Both are recipe tweaks, not structural.
>
> **Measurement caveat:** the occupancy metric hit-tests, so it cannot see the kit unless
> `pointer-events` is temporarily enabled, and it under-reports on any game with a full-bleed
> overlay (Counting Critters' snowfield hides its gain entirely). Trust the screenshots over
> the number on those.

### P1 · Close the dead air between rounds  ·  effort S  ·  lifts Pacing
Measured: **2,676ms** from a correct answer to the next playable round, against ~2 taps of
actual play. `waitSpeech` holds a 900ms floor, then animation and a 650ms hand-off stack on
top. Cut the floor, overlap the praise with the next round painting in, and let a tap skip
the remainder.

**Watch:** don't clip the praise so hard it stops feeling warm. Target ~1.2s, not zero.

**Done when:** round-to-round is under 1.5s and a tap during praise moves things along.

### X1 · Rebuild the celebration as one composed moment  ·  effort M  ·  lifts Composition + Art
The single most important emotional beat, currently the most chaotic screen. Today it fires
eight unrelated confetti emoji at once (pizza slices in an ocean game), draws text straight
over moving art — a flower covered a letter and the button read **"Wor!d map"** — and leaves
the finished game visible behind it with its instruction bar still contradicting the moment.

**Done when:** confetti is themed to the world, all text sits on its own plate, and the game
screen is fully covered.

### O1 · Let her play before anyone fills in a form  ·  effort M  ·  lifts Onboarding
A pre-reader's first two screens are a text input asking for a name and an age-band picker
written for adults. Open on the map instead; ask for the name the first time it would be
spoken, and put the difficulty picker behind the parent gate (it is an adult control, and we
now have a gate for those).

**Done when:** a cold start reaches a playable game in one tap, with no typing.

---

## Tier 1 — next

### A1 · Ambience beds per world  ·  effort M  ·  ✅ **BUILT (v52)**
There are **five sound cues and three tunes for thirty-eight games, and no ambience at all**.
A quiet ocean wash under the sea worlds, wind and birds over the meadow, a room tone for the
cosy scenes. Cheap in code — the synth engine already exists — and it fills a screen as much
as art does. Correcting my own review here: the *palette* is well made (layered voices, real
filter envelopes); it is the **coverage** that is thin.

### C2 · Fill the eight emptiest games  ·  effort M (with C1)  ·  ✅ **DONE (v49) — 14 games**
`trace, dolphin, eggcatch, music, petmatch, ocean, whosays, petfeed` — all under 9%.

> **Shipped in v49.** The kit is now in **14 games**: ocean, snow, eggcatch, pasta, icecream,
> measure, fuelup, senses, dragon, pizza, dino, hideseek, whosays, music. Four of them
> (dragon, music, pasta, icecream) pass a `tint` so the scenery adopts their theme's hue.
>
> **Deliberately skipped, with reasons:**
> - **dolphin** — it scrolls, with its own parallax marquees. Static bands would slide wrong
>   against them; it needs a scroll-aware variant of the kit. Still the most important one to do.
> - **trace** — a tracing canvas needs maximum contrast on the guide path, and it writes to
>   `area.innerHTML` with a different shape from every other game.
> - **feelings** — a calm-down check-in. Busy scenery is the wrong feeling for that screen.
> - **petmatch / petcare / petfeed** — all three live in `pets.js` and share one surface; worth
>   doing together rather than piecemeal.
>
> **On the occupancy metric: stop trusting it here.** It hit-tests, and almost every game wraps
> its content in a full-bleed transparent `-wrap` div at a higher z-index, so the probe hits the
> wrap and the scenery underneath is invisible to it. Twelve of the fourteen show "no gain" while
> carrying 105–182 scenery nodes each and looking obviously fuller. The metric was right for
> finding the problem and is the wrong tool for confirming the fix — screenshots are.

### C3 · Retire the flat primitives  ·  effort S  ·  lifts Art
Specific offenders found while playing: the "moon" in Counting Critters is an untextured pale
ellipse; Dolphin Dive's seabed is a row of evenly-spaced emoji on a hard line. These are what
make the art read as three languages at once.

### R1 · Enforce the emoji ↔ SVG boundary  ·  effort S (rule) + M (audit)  ·  lifts Art
`docs/ART-STYLE-GUIDE.md` exists and is not being kept. Write the boundary as a rule with
examples, then audit against it.

---

## Tier 2 — worth doing, lower leverage

### C4 · Make the sticker-book scenes into places  ·  effort M  ·  lifts Composition
"Park" is a thin row of same-sized emoji along the bottom of an empty gradient. It is the
app's main creative surface and its emptiest screen.

### C5 · Give the dress-up character arms and legs  ·  effort M  ·  lifts Composition + Content
Currently a head on a bell shape, so nothing below the torso can be dressed. The face is the
best art in the app and the skin-tone range is genuinely good — the body is what limits it.

### A2 · Per-game signature cues  ·  effort M  ·  ✅ **BUILT (v52) — all 38 games, enforced**
One recognisable sound per game on its key action, instead of the same universal `good()`.

### P2 · One progress indicator per screen  ·  effort S  ·  lifts Pacing
Dolphin Dive shows a hoop-pip row **and** the round dots at once, tracking different things.

### A3 · Character vocalisations  ·  effort M  ·  lifts Audio
The dolphin never squeaks, the hippo never grunts. Synth voices, no audio files.

---

## Tier 3 — carried over, still true

Not craft, but open and ranked here so one list covers the work.

- **STEM gaps** (from the re-baselined `06`): phonological awareness beyond letters — rhyme,
  syllables, blending; explicit sequencing; pattern depth. `Blend-It!` is top of the READY queue.
- **7 games carry no STEM objective tag** — `bike, icecream, music, ocean, pets, rocket, story`.
  This is what let the curriculum map drift in the first place.
- **23 games still have no dedicated gameplay test.** The blunt sweep covers all 35 at all
  tiers; the ones with real tests are the recently built ones.
- **The party's completion attribution** — `celebrateWith()` credits whichever game came last,
  so a party can retire an unplayed game's "New!" flag.

---

## Deliberately not doing

- **A full art re-draw.** The drawn heroes (dolphin, dress-up face, hippo, dragon) are good.
  The problem is what surrounds them, which C1 fixes far more cheaply.
- **More games, for now.** 38 activities at 15% occupancy is a worse product than 38 at 40%.
  Breadth is our second-best score; composition is our worst. Fix the floor before adding.
- **Anything that trades away the 9s.** No streaks, no timers, no scores, no gating. The
  values score is the most valuable thing we have and it is the cheapest to lose.

---

## Running order

Updated 2026-09-06 — the original first pass (C1 → P1 → X1 → O1) is half
done: **C1 and C2 shipped in v49–v50**, and the vertical trail (v51) came out of a separate observation.
What follows is the sequence from here, one coherent session per play.

### Play 1 — Fix the rhythm  ·  P1 + X1  ·  effort S + M
The two things she feels on **every single round and every single win**, and the reason to do them
together: the celebration *is* the inter-round beat. Cutting the dead air and leaving the win screen
chaotic would only make the chaos arrive sooner.

- P1: 2,676ms from a correct answer to the next playable round, against ~2 taps of play. Cut the
  `waitSpeech` floor, overlap praise with the next round painting in, let a tap skip the rest. Target
  ~1.2s — not zero, or the praise stops feeling warm.
- X1: one themed confetti palette, text on its own plate, the finished game fully covered.

**Moves:** Pacing 5 → 7, Art 5 → 6. **Verify by:** re-measuring round-to-round, and a test that a tap
during praise advances.

### Play 2 — Give it a voice  ·  A1 + A2  ·  ✅ **DONE (v52)**

> Ambience beds for all 7 biomes, keyed off `scene.forLevel` so every game got its sound from its theme
> with no per-game work; 14 signature cues across all 38 games; and `cue` made a **required** field so a
> new game cannot ship silent. Both enforcement paths mutation-tested. Measured bed output at RMS 0.0098,
> stopping clean and not stacking across 24 level changes. A3 (character vocalisations) is still open.
Audio is a **4 and entirely untouched** — the last completely cold axis. It also pairs with what just
shipped: ambience keys off the same 7 biome names the scene kit already uses, so `reef` gets a wash and
`meadow` gets birds with no new taxonomy.

- A1: an ambience bed per biome. Cheap in code — the synth engine exists — and it fills a screen as much
  as art does.
- A2: one signature cue per game on its key action, instead of the universal `good()`.

**Moves:** Audio 4 → 7. **Watch:** BAR-CONFIG's calm path — ambience must sit under the voice, never
compete with it.

### Play 3 — The first minute  ·  O1  ·  effort M
A pre-reader's first two screens are a text field and an age-band picker written for adults. Open on the
map; ask for the name the first time it would be spoken; put difficulty behind the parent gate that now
exists. **Moves:** Onboarding 4 → 7. This is what a parent judges the app on before anything else.

### Play 4 — Finish the scene kit  ·  C2 remainder + C3  ·  effort M–L  ·  **done (v53)**
Twenty-one games had no scenery; all 35 levels carry it now, plus Story and Dress-Up. Dolphin came
first, since it is the reference build every new game is told to imitate — it needed the scroll-aware
variant, `scene.strip()`, which Bike Ride and Monkey Swing then reused for their emoji treelines. C3
went with it: Dress-Up's 🌈 button cycled six flat fills and now cycles six places.

`SCENERY_FLOOR` is pinned to the full level count, so this cannot regress and a new game cannot ship
on a bare gradient. **Moves:** Composition 4 → 7 across the whole app rather than 14 games.

Still open from this play: **R1** — the emoji↔SVG boundary rule written down and audited. Several
games still use emoji where a drawn hero object belongs (Monkey Swing's monkey and bananas, Meerkat
Pop's animals, Hippo Feast's food); the kit gave them a place to stand, not a body.

### Play 5 — Build again  ·  Blend-It!  ·  effort M
Only now. The floor is raised, so a 39th game adds instead of diluting. Blend-It! is top of the READY
queue and fills the **#1 real STEM gap** — phonological awareness beyond letter names, which is the
strongest predictor of reading and which Letter Lights does not cover.

### Riding along
Small, and each prevents a specific known rot. Fold one into whichever play it fits:
- **7 games carry no STEM objective tag** (`bike, icecream, music, ocean, pets, rocket, story`) — this is
  what let the curriculum map drift in the first place.
- **23 games still have no dedicated gameplay test.** The blunt sweep covers all 35 at all tiers; the
  ones with real tests are the recent ones.
- **The party credits its completion to whichever game came last**, so it can retire an unplayed game's
  "New!" flag.
- **`space` and `snow` scene recipes** are the weakest two; small tweaks, not structural.

### Still deliberately not doing
No streaks, no timers, no scores, no gating. The values score is the most valuable thing here and the
cheapest to lose — treat it as a constraint on every play above, not a preference.
