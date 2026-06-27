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

### [PROPOSED] Dolphin Echo
- **STEM:** Patterns / algebra · repeat + extend AB/ABC sequences · age 2–4
- **Success:** Child can watch a dolphin tap out a click-pattern (shown as colored bubbles) and repeat it in order
- **Fills gap:** Patterns — thin coverage; plus bonus phonological rhythm (listening + repeating sequences)
- **Rubric focus:** Learning efficacy (pattern rule made explicit by voice: "blue… yellow… blue… your turn!"), Sensory (dolphin clicks are satisfying but calm), Pacing (tier 0=2-element repeat, tier 1=3-element, tier 2=child leads)
- **Estimated complexity:** Low–Medium — colored bubble grid, sequence playback, tap-to-replay
- **File:** `js/games/dolphinecho.js`
- **Fun factor:** Dolphin jumps and squeaks with joy when the child nails the pattern; missed step = gentle "oops, let me show you again" with no penalty
- **Theme origin:** Daughter requested a dolphin game 🐬

### [PROPOSED] Dolphin Dive (Positional Language)
- **STEM:** Spatial reasoning · positional language · in / on / under / beside · age 2–4
- **Success:** Child can guide the dolphin to the fish by following instructions: "swim UNDER the boat", "jump OVER the wave", "go BESIDE the seal"
- **Fills gap:** Spatial reasoning — zero coverage; highest-ROI spatial gap in STEM doc
- **Rubric focus:** Learning efficacy (positional word spoken + shown simultaneously), Clarity (one instruction at a time, arrow hint if stuck), Motor (big tap targets for each position)
- **Estimated complexity:** Medium — SVG ocean scene with positioned objects, dolphin animation path
- **File:** `js/games/dolphindive.js`
- **Fun factor:** Dolphin zooms through the scene with a splash trail; fish caught = star burst; kids love directing the dolphin
- **Theme origin:** Daughter requested a dolphin game 🐬

### [PROPOSED] Happy Dolphin (Emotions / SEL)
- **STEM:** Social-emotional learning · name + recognize emotions · age 2–4
- **Success:** Child can identify how the dolphin is feeling (happy / sad / tired / surprised) from its body language and choose the matching emotion card
- **Fills gap:** SEL — zero explicit coverage; highest-competitor gap (Daniel Tiger, Sago Mini all treat this as first-class); dolphin body language makes emotions readable without a human face
- **Rubric focus:** Learning efficacy (emotion label + cause spoken aloud: "Splash is SAD because she lost her friend"), Emotional safety (all emotions are valid, all paths lead to comfort), Pacing (tier 0=happy/sad, tier 1=+tired/surprised, tier 2=cause of feeling)
- **Estimated complexity:** Medium — SVG dolphin with animated expression states, 4-card emotion picker
- **File:** `js/games/happydolphin.js`
- **Fun factor:** When child picks correctly the dolphin does its signature move (happy=leap, tired=yawn-bubble, surprised=startled splash); gentle empathy voice for sad state
- **Theme origin:** Daughter requested a dolphin game 🐬

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

### [PROPOSED] Tall or Short (Measurement)
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

