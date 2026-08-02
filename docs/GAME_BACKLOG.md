# Game Backlog

This file is the shared state between the agents and you:
- **Backlog Curator** proposes new games (status: PROPOSED)
- **You** review, reorder, and mark items READY
- **Implementer** picks the top READY item and builds it
- **Analyst** scores the result and updates COVERAGE.md
- **Project Manager** (`.claude/agents/project-manager.md`) oversees the whole pipeline —
  audits games vs the quality bar, flags STEM/quality gaps, keeps this backlog and COVERAGE.md
  honest, and **approves ~2 top PROPOSED items to READY each week** so the Implementer always has
  work. Invoke it on demand; it also runs weekly. It never writes game code, merges, or deploys —
  the human still approves what ships (and can veto any READY by resetting its status).
- **Product Researcher** (`.claude/agents/product-researcher.md`) looks outward — mines
  early-childhood learning science and best-in-class kids' apps and files evidence-backed
  proposals (game ideas here; platform ideas in `PLATFORM-BACKLOG.md`). Researches and proposes
  only. Flow: Researcher proposes → PM vets → Implementer builds.

---

## How to use this file

1. Review PROPOSED items below — edit the description or reject by changing status to REJECTED
2. Reorder items by dragging/cutting (priority = top of list)
3. The **Project Manager auto-promotes ~2 top items PROPOSED → READY each week**; you can also promote/veto any item yourself by changing its status
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

<!-- Arcade / game-feel concepts — per BAR-CONFIG "Interaction & Game-Feel", prefer real-time,
     child-driven mechanics. These are distinct game genres, not tap-and-wait. -->

### [PROPOSED] Wind-Down Corner
- **Genre:** Calm / self-regulation ritual. **STEM:** SEL · self-regulation + bedtime routine · age 2–5
- **Success:** Child follows a slow "balloon breath" with the buddy, then says goodnight to the animals (tap each → it curls up under a blanket) in a dimmed, quiet scene.
- **Fills gap:** SEL self-regulation; extends the shipped Feelings game into a daily wind-down ritual. Uniquely on-brand (calm, anti-overstimulation — the opposite of engagement-maximizing apps).
- **Rubric focus:** Emotional safety (2), Sensory balance (calm by design, reduced-motion native), Learning efficacy (co-regulation practice).
- **Estimated complexity:** Low-Medium — dimmed palette, one breath animation (reuse the Feelings breath), tap-to-tuck-in animals.
- **File:** `js/games/winddown.js`

### [PROPOSED] Build-a-Buddy
- **Genre:** Creative construction. **STEM:** Active construction + SEL (ownership, creativity) · age 2–5
- **Success:** Child assembles a creature from parts (body, eyes, ears, color, an accessory), names it, and it comes alive — waves and thanks them.
- **Fills gap:** **Active construction** — the child builds a unique output, the one rubric axis nothing currently scores on — plus SEL ownership/pride.
- **Rubric focus:** Active construction (2), Emotional safety, Aesthetic cohesion.
- **⚠️ Blocked on:** the Graphics/SVG art overhaul (see `PLATFORM-BACKLOG.md`). A build-a-creature toy needs a cohesive, high-quality part library first, or the assembled buddy looks mismatched. Build this after the art system lands.
- **Estimated complexity:** Medium — drag/tap-to-assemble parts, name step, come-alive celebration.
- **File:** `js/games/buildbuddy.js`

### [DONE] Zoo Pop (Meerkat Pop!)
- **Genre:** Whack-a-mole / reaction. **STEM:** Sorting / classification · match pop-ups to a named target (listen + discriminate) · age 2–4
- **Success:** Zoo animals surface from burrows; child pops only the animal the voice names (e.g. "Pop the penguin!"), ignoring the rest, until the goal is met
- **File:** `js/games/meerkat.js` — shipped. Difficulty scales pop speed, simultaneous burrows, and number of distractor animals (4/5/6 goal). No fail state (a wrong pop is harmless; a missed target just ducks back). Reference for the pop-up game loop.

### [DONE] Feed the Hippo
- **Genre:** Tap-to-feed counting arcade. **STEM:** Number sense · count to N with 1:1 correspondence · age 2–4
- **Success:** Child taps food to feed a drawn hippo exactly the number the voice asks for; each tap flies a food into the mouth, chomps, fills one tummy slot, grows the numeral, and the voice counts.
- **File:** `js/games/hippo.js` — shipped (Numbers world). Tummy slots (= target N) fill one-per-feed for 1:1 correspondence; input caps at N (no overfeed). Difficulty scales the target range (1–3 / 2–5 / 4–8). No fail state.

### [PROPOSED] Chain Reaction
- **STEM:** Logic / cause–effect · tap → explicit reaction chain (cause + immediate effect) · age 2–3
- **Success:** Child can tap a character or object, watch the direct reaction (frog jumps on lily pad → splash!), then tap again to continue the chain — demonstrating they understand that their action caused the effect
- **Fills gap:** Logic/cause-effect, 2–3 age band — What Comes Next? targets 3–4 band (sequence/order); What Happens If? targets 4–5 band (if-then prediction); the foundational 2–3 concept ("tap → reaction") has zero backlog coverage; making cause-effect EXPLICIT as the learning objective (voice says "YOU did that — you made the frog jump!") is distinct from the implicit tap feedback in all other games
- **Rubric focus:** Learning efficacy (voice narrates the cause-effect link explicitly — "You tapped the log and the frog jumped!"; 2-step chains progress to 3-step by tier 2), Clarity (one tapable object per scene, reaction is large and immediate), Pacing (tier 0 = single tap → single obvious reaction; tier 1 = 2-step chain where each tap advances the story; tier 2 = 3-step chain with a predictable-but-surprising ending)
- **Estimated complexity:** Low — 6–8 SVG scenes with scripted reaction animations; no drag; rAF animation triggered on each tap; voice attribution ("you did that!") is the core learning design challenge
- **File:** `js/games/chain.js`

### [PROPOSED] Tally Tots
- **STEM:** Sorting / classification / data · data reading — compare sorted group counts (simple "which has more?") · age 4–5
- **Success:** Child can look at two sorted groups of objects already arranged in picture-graph rows (4 red apples vs. 2 blue apples), tap the group that has more, and hear the count confirmed — demonstrating they can READ organized visual data, not just compare scattered piles
- **Fills gap:** Sorting/classification/data, 4–5 age band — Sort & Classify by Color, Shape Sorter, and Grocery Sort all teach SORTING (organizing by attribute); the 4–5 sub-skill "simple 'which has more'" is the DATA INTERPRETATION step (reading an already-organized display and comparing group sizes); More or Less teaches scattered quantity comparison (subitizing), which is cognitively distinct from reading a picture-graph arrangement; no backlog entry explicitly covers this foundational data-literacy concept
- **Rubric focus:** Learning efficacy (picture-graph layout makes counting rows explicit — "there are 4 red ones and 2 blue ones, so red wins!"; quantity comparison is built on a structured visual), Pacing (tier 0 = 2 groups of 1–3 items with large spacing; tier 1 = 3 groups of 2–5 items in picture-graph rows; tier 2 = 3 groups of 3–6 items where child picks which attribute to compare), Clarity (one question per round, group counts spoken aloud)
- **Estimated complexity:** Low-Medium — SVG picture-graph layout (rows of repeated icons); 3–4 object types in 2–3 colors; no drag (tap the winning group); voice confirms count per group; readable grid layout is the main design challenge
- **File:** `js/games/tally.js`

### [PROPOSED] Shape Drop
- **STEM:** Spatial reasoning · spatial fitting — place shape pieces into matching cutout holes · age 2–4
- **Success:** Child can drag a shape piece (circle, square, triangle) to its matching hole in a scene and feel it "click" into place; at tier 1, must try pieces in multiple holes before finding the fit — demonstrating spatial matching by form through trial-and-error problem-solving
- **Fills gap:** Spatial reasoning, 2–3 and 3–4 age bands — the STEM doc lists "simple fit" for ages 3–4 as a distinct spatial concept; Where's Teddy? teaches prepositional LANGUAGE (in/on/under); Shadow Match teaches shape-to-silhouette IDENTIFICATION; spatial FITTING (classic shape-sorter toy mechanic — choosing a piece and discovering whether it belongs in a hole) builds a different skill: understanding that form determines fit, learning to try before giving up; zero backlog coverage for this sub-skill
- **Rubric focus:** Learning efficacy (voice names shape on each correct fit — "A circle! It rolled right in!"; each hole has a visual boundary that matches the piece's outline), Motor (large drag targets ≥ 60px; pieces snap to the correct hole within a generous radius so fine motor errors don't penalize), Pacing (tier 0 = 3 distinct shapes, 1:1 obvious holes, no distractors; tier 1 = 5 pieces with 2 same-shape holes so child must match more carefully; tier 2 = shapes in 2 sizes — form AND size must match)
- **Estimated complexity:** Medium — SVG shape pieces + cutout holes in a themed scene (barn, rocket, cookie cutter); drag-to-zone with snap radius; size-matching at tier 2 is the design challenge; no reading required
- **File:** `js/games/shapedrop.js`

### [PROPOSED] Animal Stack
- **Genre:** Physics stacking tower. **STEM:** Measurement / spatial · size + balance (big base, ordering) · age 3–5
- **Success:** Child taps to drop zoo animals onto a growing tower; placing bigger animals lower keeps it steady, and the stack height is counted aloud as it grows
- **Fills gap:** measurement/seriation and spatial reasoning in an active genre; "big on the bottom" makes size-ordering physical
- **Rubric focus:** Learning efficacy (size comparison made physical + height counted), Emotional safety (keep it forgiving — gentle wobble, no harsh topple/fail; consider a soft catch), Sensory (satisfying settle without stacking intense effects)
- **Estimated complexity:** Medium-High — lightweight drop + settle physics (or scripted snap), wobble feedback; the no-fail balance is the design challenge

### [DONE] Monkey Swing
- **Genre:** Endless runner / rhythm. **STEM:** Patterns / logic · rhythm + timing (tap to swing) · age 3–5
- **Success:** Child taps the screen to swing a monkey up and grab bananas at different heights across a scrolling zoo; bananas are counted toward a goal.
- **File:** `js/games/monkey.js` — shipped (Animals world). rAF loop: tap = upward impulse, gravity returns the monkey to the ground (never falls off). Bananas spawn at varied heights (some low enough to grab at a run, so progress is always possible). Difficulty scales scroll speed, height spread, and goal (4/5/6). No fail state.


### [PROPOSED] Blend-It!
- **STEM:** Phonological awareness / literacy · onset-rime blending (simple CVC blending) · age 4–5
- **Success:** Child can hear the voice say an onset and rime separately (e.g., "/b/…/oat/") and tap the correct picture (boat, not goat or coat) — demonstrating they can blend two phoneme chunks into a whole word
- **Fills gap:** Phonological awareness, 4–5 age band — Rhyme Time covers rhyme recognition (2–4), Clap the Beat covers syllable segmentation (2–4), Sound Safari covers initial-phoneme matching (3–5); onset-rime blending is the next developmental sub-skill on the literacy ladder and has zero backlog coverage; completing the full phonological awareness track is the #1 highest-ROI domain per the STEM doc
- **Rubric focus:** Learning efficacy (onset and rime voiced with a clear pause, then merged aloud on correct tap — child hears the two parts collapse into one word), Clarity (2 picture choices tier 0 → 3 minimally-contrasting pictures tier 2), Pacing (tier 0 = obvious onset contrast like /b/+/all vs /f/+/all/, tier 1 = rime contrasts with 2 foils, tier 2 = 3-phoneme CVC words with two plausible foils)
- **Estimated complexity:** Low-Medium — voice-first phoneme delivery (Web Speech can do paused segments); curated 12–16 onset+rime pairs; picture cards are reusable from Sound Safari word bank; no drag, no reading
- **File:** `js/games/blend.js`

### [PROPOSED] Alive or Not?
- **STEM:** Scientific thinking · living vs. nonliving classification · age 3–4
- **Success:** Child can look at an object (puppy, flower, rock, toy car, fish, cloud, book, caterpillar) and tap the "alive" side (animated heartbeat) or "not alive" side (still icon), correctly sorting at least 6 of 8 objects
- **Fills gap:** Scientific thinking, 3–4 age band — the STEM doc lists "living/nonliving" as an explicit 3–4 concept; Weather Dresser targets weather observation, Seasons Wheel targets seasonal change, Animal Hospital targets needs of living things (which presupposes knowing something is alive); none teaches the foundational living/nonliving distinction itself, which is the prerequisite concept for those games
- **Rubric focus:** Learning efficacy (voice names one observable property that makes the answer clear — "A puppy breathes and grows — it's alive!"; gives a concrete observable reason, not an abstract rule), Emotional safety (no fail state; wrong tap leads to gentle discovery narration — "Let's look closer…"), Pacing (tier 0 = 2 maximally different objects per round e.g. dog vs. rock, tier 1 = 4 objects mixed, tier 2 = borderline cases like a seed or a candle flame with explicit reasoning)
- **Estimated complexity:** Low-Medium — two large tap zones; 8–10 SVG object illustrations; voice carries the science content; no drag required; tier 2 borderline cases are the design challenge (keep reasoning concrete and age-appropriate)
- **File:** `js/games/alive.js`

### [PROPOSED] How Does Bunny Feel?
- **STEM:** Social-emotional learning (SEL) · empathy + perspective-taking · age 4–5
- **Success:** Child can look at a scenario scene (Bunny's tower fell; Bunny is left out of a game; Bunny shares their last cookie) and (a) name what Bunny is probably feeling and (b) choose one kind action from two options — demonstrating they can take another character's perspective, not just label their own face
- **Fills gap:** SEL, 4–5 age band — Feelings Friends covers emotion naming and cause-of-feelings (2–4 age band, receptive/expressive labeling); perspective-taking and social action ("what could YOU do to help Bunny?") is the distinct 4–5 developmental step, with zero backlog coverage; SEL is the #2 highest-ROI domain per the STEM doc and all top competitors (Daniel Tiger, PBS Kids, Sago Mini) treat this tier as first-class
- **Rubric focus:** Learning efficacy (two-step structure: identify feeling → choose kind action; voice narrates both Bunny's inner state and the child's potential role — builds theory of mind explicitly), Emotional safety (all feelings are valid and named without judgment; no wrong-answer path — both action choices are gentle; child is never asked to feel bad for Bunny's situation), Pacing (tier 0 = obvious emotion + single kind action offered, tier 1 = child picks from two actions with voice reflecting on the better choice, tier 2 = child initiates the kind action by dragging a comfort item to Bunny)
- **Estimated complexity:** Medium — 6–8 SVG scenario scenes with Bunny in different emotional states; animated face expression shifts; voice scripting is the core design challenge (empathy language must be warm, specific, and non-preachy); tier 2 drag interaction reuses existing drag infrastructure
- **File:** `js/games/empathy.js`

### [PROPOSED] Clap the Beat
- **STEM:** Phonological awareness / literacy · syllable segmentation (clap the beats) · age 2–4
- **Success:** Child can tap the clap button once per syllable in a spoken word (e.g., "cat" = 1 tap, "mon-key" = 2 taps, "el-e-phant" = 3 taps) and hear the syllables highlighted as they tap
- **Fills gap:** Phonological awareness — Rhyme Time covers rhyme recognition; Sound Safari covers phoneme matching; syllable segmentation is a distinct, earlier-developing sub-skill (emerges at age 2–3) with zero backlog coverage; all three sub-concepts must be present for a complete literacy track
- **Rubric focus:** Learning efficacy (voice breaks word into syllables on each tap with a visible pulse, then praises the total count), Clarity (one picture + one large clap-pad per round, nothing else on screen), Pacing (tier 0 = 1-syllable words tap-confirm, tier 1 = 2-syllable words, tier 2 = 3-syllable words with animated syllable beats)
- **Estimated complexity:** Low — one SVG picture card + large tap target; voice does the segmentation work; needs a curated 20-word bank (1/2/3 syllable); no drag, no reading
- **File:** `js/games/syllable.js`

### [PROPOSED] Shape Sorter
- **STEM:** Sorting / classification / data · sort by shape attribute (1 attribute → 2 attributes) · age 2–4
- **Success:** Child can drag each object into the correct shape bucket (circles here, squares there) and, at tier 1, sort by two attributes at once (color + shape)
- **Fills gap:** Sorting/classification — Sort & Classify by Color covers single-attribute color sorting; Grocery Sort covers sort-by-kind; sorting by **shape** as a discrete attribute (a distinct early-math concept) has no backlog entry; also advances Geometry/shapes coverage from recognition to active classification
- **Rubric focus:** Learning efficacy (shape name spoken on each drop + bucket label highlighted), Motor (large drag targets ≥ 60px), Pacing (tier 0 = 2 shapes/circle+square, tier 1 = 3 shapes, tier 2 = sort by shape AND color simultaneously into 4 buckets)
- **Estimated complexity:** Medium — 3–4 bucket zones; items are simple filled SVG shapes in 2–3 colors; drag-to-zone interaction; voice confirms shape name on every drop
- **File:** `js/games/shapesort.js`

### [PROPOSED] What Happens If?
- **STEM:** Logic / cause–effect · prediction (simple if-then) · age 4–5
- **Success:** Child can look at a "before" scene (ice cream in the sun, a seed with a watering can, a puddle after rain) and tap the correct "after" picture that shows what happens next — explicitly making the IF-THEN link the voice narrates
- **Fills gap:** Logic/cause-effect — What Comes Next? covers daily-routine sequencing (ages 3–4); Animal Hospital covers needs-of-living-things reactions; "simple if-then **prediction**" (ages 4–5) per the STEM ladder is a distinct cognitive skill (hypothetical reasoning, not memory of a sequence) with no backlog entry
- **Rubric focus:** Learning efficacy (voice says "IF the ice cream stays in the sun… THEN…" on each round, making the conditional structure explicit; child predicts before reveal), Emotional safety (both wrong and right predictions end with a neutral discovery frame — "let's find out!"), Pacing (tier 0 = single-step obvious physical change, tier 1 = 2-choice cause–effect, tier 2 = 3-choice with a decoy that's a plausible but wrong outcome)
- **Estimated complexity:** Medium — 6–8 scenario pairs (before SVG + 2–3 outcome SVGs); no drag; voice-first conditional framing is the core design challenge; scenarios must be concrete and observable (physical changes, not social abstractions)
- **File:** `js/games/predict.js`

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

