# Game Backlog

This file is the shared state between three agents and you:
- **Backlog Curator** proposes new games (status: PROPOSED)
- **You** review, reorder, and mark items READY
- **Implementer** picks the top READY item and builds it
- **Analyst** scores the result and updates COVERAGE.md

---

## How to use this file

1. Review PROPOSED items below — edit the description or reject by changing status to REJECTED
2. Reorder items by dragging/cutting (priority = top of list)
3. Change status from PROPOSED → READY when you want it built
4. Implementer picks the #1 READY item automatically

---

## Status legend

- `PROPOSED` — Curator added it, needs your review
- `READY` — You approved it, Implementer will pick it up next run
- `IN_PROGRESS` — Implementer is currently building it
- `IN_REVIEW` — PR is open, waiting for merge
- `DONE` — Merged and scored by Analyst
- `REJECTED` — Skipped

---

## Queue

<!-- Implementer always picks the first READY item -->

### [PROPOSED] Sound Safari
- **STEM:** Phonological awareness / literacy · letter sounds (phoneme matching) · age 3–5
- **Success:** Child can tap the picture whose name starts with the sound the voice makes (e.g., voice says "/b/" → taps "ball" not "fish")
- **Fills gap:** Phonological awareness — Rhyme Time covers rhyme recognition; letter phoneme matching is a distinct zero-coverage sub-concept; highest-ROI domain for ages 3–5 per STEM doc
- **Rubric focus:** Learning efficacy (phoneme isolated and repeated, then matched to object name), Clarity (2 choices tier 0 → 3 choices tier 2), Pacing (tier 0=initial consonant yes/no, tier 1=pick the right picture from 2, tier 2=same vs. different starting sound from 3)
- **Estimated complexity:** Medium — voice-first phoneme delivery, curated word-picture pairs for 6–8 consonant sounds; no reading required
- **File:** `js/games/sounds.js`

### [PROPOSED] Line Them Up (Seriation)
- **STEM:** Measurement / comparison · ordering 3 objects by size/length (seriation) · age 3–4
- **Success:** Child can drag 3 objects into correct size order from smallest to biggest (or tallest to shortest)
- **Fills gap:** Measurement/comparison — Tall or Short compares 2 objects; More or Less compares quantities; neither covers seriation (ordering 3+ by magnitude), which is the "order by size" sub-concept explicitly listed in the STEM doc
- **Rubric focus:** Learning efficacy (comparative language spoken at each placement: "bigger!" "biggest!"), Motor (big drag targets), Pacing (tier 0=2 items, tier 1=3 items, tier 2=4 items with mixed reveal order)
- **Estimated complexity:** Low-Medium — 3–4 SVG objects with clear size variation; drag-to-slot interaction; voice confirms order at each step
- **File:** `js/games/lineup.js`

### [PROPOSED] Seasons Wheel
- **STEM:** Scientific thinking · seasons + time-of-year observation · age 3–5
- **Success:** Child can look at a nature scene (leaves falling, snow on ground, flowers blooming, sunny beach) and tap the correct season name, then match one season-appropriate item (coat, swimsuit, umbrella, boots) to it
- **Fills gap:** Scientific thinking — Night & Day Sort (IN_REVIEW) covers day/night; Weather Dresser (PROPOSED) covers daily weather; seasons is explicitly flagged as a roadmap item in the STEM doc and is zero-coverage as a distinct concept
- **Rubric focus:** Learning efficacy (observation chain: visual cues → season name → real-world implication), Clarity (one visible scene per round, four season choices shown as icons), Emotional safety (gentle voice redirect on wrong tap, no fail state)
- **Estimated complexity:** Medium — 4 SVG season scenes with characteristic nature cues; seasonal item matching at tier 1; voice names each season on reveal
- **File:** `js/games/seasons.js`

### [PROPOSED] Rhyme Time
- **STEM:** Phonological awareness / literacy · rhyme recognition → onset sounds · age 2–4
- **Success:** Child can tap the picture that rhymes with the one the voice names (e.g., "cat" → taps "hat" not "dog")
- **Fills gap:** Phonological awareness — zero coverage; single highest-ROI domain for ages 3–5 per STEM doc
- **Rubric focus:** Learning efficacy (phoneme pair made explicit by voice + visual highlight), Clarity (2 choices tier 0 → 3 choices tier 2), Pacing (tier 0=rhyme yes/no, tier 1=pick rhyme from 3, tier 2=match onset sound)
- **Estimated complexity:** Medium — new game with SVG picture cards; audio-first (no reading); needs curated rhyme word pairs
- **File:** `js/games/rhyme.js`

### [PROPOSED] Feelings Friends
- **STEM:** Social-emotional learning (SEL) · emotion naming → cause of feelings · age 2–4
- **Success:** Child can point to the face that shows "happy" / "sad" / "surprised" / "scared" and, at tier 1, match an emotion to its cause ("Bunny dropped her ice cream — how does she feel?")
- **Fills gap:** SEL — zero explicit coverage; Daniel Tiger, PBS Kids, and Sago Mini all treat this as a first-class domain
- **Rubric focus:** Learning efficacy (emotion word spoken + face shown simultaneously), Emotional safety (all feelings are valid — no wrong answer path, gentle correction only), Pacing (tier 0=2 emotions, tier 1=4 emotions with cause scene, tier 2=self-regulation choice)
- **Estimated complexity:** Medium — SVG character faces with animated expressions; scenario scenes at tier 1; voice-first
- **File:** `js/games/feelings.js`

### [PROPOSED] Where's Teddy?
- **STEM:** Spatial reasoning · positional language (in / on / under / behind / next to) · age 2–4
- **Success:** Child can tap the correct hiding spot when voice says "Teddy is UNDER the table" and, at tier 1, drag Teddy to the place the voice names
- **Fills gap:** Spatial reasoning — hideseek.js teaches object permanence but not explicit prepositional vocabulary; this is the zero-coverage positional-language track from the STEM doc
- **Rubric focus:** Learning efficacy (preposition spoken + spatially highlighted on each reveal), Clarity (single scene, one highlighted spot per round), Motor (large tap / drag targets)
- **Estimated complexity:** Low — single SVG room scene with 3–5 named positions; tier 0=receptive (tap), tier 1=expressive (place), tier 2=4+ positions
- **File:** `js/games/position.js`

### [PROPOSED] Sort & Classify by Color
- **STEM:** Sorting / classification · sort by 1 attribute (color) · age 2–3
- **Success:** Child can tap all the red items (or blue, or yellow) into the correct bucket
- **Fills gap:** Sorting/classification — currently only size exists
- **Rubric focus:** Learning efficacy (concept explicit + multi-modal), Motor (big targets)
- **Estimated complexity:** Medium — extend sort.js with color mode
- **File:** `js/games/sort.js` (new color mode) or new `js/games/sortcolor.js`

### [PROPOSED] More or Less (Set Comparison)
- **STEM:** Measurement / comparison · more / less · age 3–4
- **Success:** Child can point to which group has MORE animals/stars/fruit
- **Fills gap:** Measurement/comparison — zero coverage for more/less
- **Rubric focus:** Learning efficacy (quantity language tied to visual)
- **Estimated complexity:** Medium — new game with two side-by-side groups
- **File:** `js/games/moreorless.js`

### [PROPOSED] Pattern Maker
- **STEM:** Patterns / algebra · AB + ABC patterns · age 3–4
- **Success:** Child can extend a color/shape pattern by choosing the next piece
- **Fills gap:** Patterns — only one thin game exists
- **Rubric focus:** Learning efficacy (pattern rule made explicit), Pacing (tier 0=AB, tier 1=ABC, tier 2=create)
- **Estimated complexity:** Medium — new game
- **File:** `js/games/patterns.js`

### [IN_REVIEW] Tall or Short (Measurement)
- **STEM:** Measurement · tall/short, long/short · age 3–4
- **Success:** Child can say which of two objects is taller / shorter
- **Fills gap:** Measurement / comparison — length/height not covered
- **Rubric focus:** Learning efficacy (comparative language), Clarity (two objects, one question)
- **Estimated complexity:** Low — simple comparison game
- **File:** `js/games/measure.js`

### [PROPOSED] What Comes Next? (Sequencing)
- **STEM:** Logic / cause–effect · sequence / order · age 3–4
- **Success:** Child can pick what comes next in a daily-routine sequence (wake → eat → play → sleep)
- **Fills gap:** Logic/cause–effect — zero explicit coverage
- **Rubric focus:** Learning efficacy (cause-effect made explicit with voice), Pacing (tier 0=2-step, tier 1=3-step, tier 2=4-step)
- **Estimated complexity:** Medium — new game with SVG routine cards
- **File:** `js/games/sequence.js`

### [PROPOSED] Shadow Match
- **STEM:** Geometry / shapes · shape recognition + spatial matching · age 2–4
- **Success:** Child can drag an object onto its matching shadow silhouette
- **Fills gap:** Spatial reasoning — shapes from a new angle (matching silhouettes builds spatial mental rotation)
- **Rubric focus:** Learning efficacy (same shape, different form = concept depth), Motor (big drag targets), Clarity (obvious from first frame)
- **Estimated complexity:** Low — SVG silhouettes + drag-to-match, similar to puzzle games
- **File:** `js/games/shadow.js`
- **Fun factor:** Magical reveal when object "lands" on its shadow — great juice moment

### [PROPOSED] Grocery Sort
- **STEM:** Sorting / classification · sort by category (fruit / veggie / dairy / snack) · age 3–4
- **Success:** Child can drag each food item into the correct grocery bag or shelf section
- **Fills gap:** Sorting/classification by kind — higher-order than color, teaches real-world categories
- **Rubric focus:** Learning efficacy (category labels spoken aloud on each drop), Emotional safety (any bag accepts item with a gentle redirect if wrong)
- **Estimated complexity:** Medium — 3–4 category buckets, food SVGs, drag interaction
- **File:** `js/games/grocery.js`
- **Fun factor:** Satisfying "plop into bag" sound + animated food items wobbling in

### [PROPOSED] Weather Dresser
- **STEM:** Scientific thinking · weather observation → prediction → action · age 3–5
- **Success:** Child can look at the weather outside the window and pick the right clothes to dress the character
- **Fills gap:** Scientific thinking (weather/seasons) — explicitly on the roadmap in the STEM doc, zero coverage
- **Rubric focus:** Learning efficacy (observation → reasoning → action chain), Clarity (window shows weather, wardrobe shows clothes)
- **Estimated complexity:** Medium — SVG window scene + dress-up subset, 4 weather types
- **File:** `js/games/weather.js`
- **Fun factor:** Character reacts with a happy dance when dressed correctly; shivers/sweats if wrong

### [PROPOSED] Animal Hospital
- **STEM:** Scientific thinking · living things have needs · cause–effect · age 3–5
- **Success:** Child can identify what a sick animal needs (food / water / rest / bandage) and give it to them
- **Fills gap:** Logic/cause–effect (explicit) + Scientific thinking (living things have needs) — hits two gaps at once
- **Rubric focus:** Learning efficacy (need → action → reaction chain), Emotional safety (animals cheer up, never die), Pacing (tier 0=1 need, tier 1=2 needs, tier 2=diagnose first)
- **Estimated complexity:** Medium-High — SVG animals with visible symptoms, item-matching interaction
- **File:** `js/games/hospital.js`
- **Fun factor:** Animal does a happy wiggle + heart burst when healed; kids love nurturing games

### [PROPOSED] Bubble Counting
- **STEM:** Number sense · subitize + count to 5 with 1:1 correspondence · age 2–3
- **Success:** Child can pop exactly the right number of bubbles when asked "pop THREE bubbles!"
- **Fills gap:** Number sense reinforcement at the youngest tier — subitizing through touch
- **Rubric focus:** Learning efficacy (quantity spoken + shown as numeral badge), Motor (big bubble targets), Sensory (satisfying pop without overwhelming)
- **Estimated complexity:** Low — floating SVG bubbles, tap-to-pop, count tracker
- **File:** `js/games/bubbles.js`
- **Fun factor:** Bubbles float around the screen, pop with a gentle sound and sparkle — pure toddler joy

### [IN_REVIEW] Night & Day Sort
- **STEM:** Scientific thinking · day/night cycle · sorting by time context · age 2–4
- **Success:** Child can sort objects and activities (sun, pajamas, moon, toothbrush, breakfast) into a Day basket and a Night basket
- **Fills gap:** Scientific thinking (observation of natural patterns) — concrete, age-appropriate entry point
- **Rubric focus:** Learning efficacy (day/night labels spoken + shown with sky background), Clarity (two buckets, clear sky cues), Sensory (calm nighttime palette vs bright daytime)
- **Estimated complexity:** Low — drag-to-bucket with two clear zones, 8–10 SVG items
- **File:** `js/games/nightday.js`
- **Fun factor:** Background animates between sunny sky and starry night as items are sorted correctly

---

## Done

<!-- Analyst moves completed games here after scoring -->

