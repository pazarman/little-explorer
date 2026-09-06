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

### C1 · A shared scene kit  ·  effort L  ·  lifts Composition + Art
The force multiplier for the whole list. A small set of reusable layers every game can
compose from: a foreground frame (things at the screen edges, nearest the eye), a
mid-ground prop band, a far parallax band, and a consistent ground line. One system, applied
per-world with that world's palette and props.

Without this, C2 is 20 bespoke art jobs. With it, each is a few lines.

**Done when:** a game can go from 8% to 35%+ occupancy by declaring which layers it wants,
and three pilot games prove it.

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

### A1 · Ambience beds per world  ·  effort M  ·  lifts Audio + Composition
There are **five sound cues and three tunes for thirty-eight games, and no ambience at all**.
A quiet ocean wash under the sea worlds, wind and birds over the meadow, a room tone for the
cosy scenes. Cheap in code — the synth engine already exists — and it fills a screen as much
as art does. Correcting my own review here: the *palette* is well made (layered voices, real
filter envelopes); it is the **coverage** that is thin.

### C2 · Fill the eight emptiest games  ·  effort M (with C1)  ·  lifts Composition
`trace, dolphin, eggcatch, music, petmatch, ocean, whosays, petfeed` — all under 9%.
Dolphin Dive matters most: it is the reference build every new game is told to imitate.

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

### A2 · Per-game signature cues  ·  effort M  ·  lifts Audio
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

## Suggested first pass

**C1 → P1 → X1 → O1.** One shared system, one measurable pacing fix, and the two screens a
parent judges the app by in the first minute. That is the whole Tier 0, and it moves the four
weakest axes without touching the four strongest.
