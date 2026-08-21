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

### [PROPOSED] Grow With Me
- **STEM:** Scientific thinking · life cycle / growth sequencing · age 3–4
- **Success:** Child can drag the stage cards of a life cycle (egg → caterpillar → cocoon → butterfly; seed → sprout → flower) into the correct order, then watch a fast-forward animation of the full cycle — demonstrating they understand that living things change through distinct, observable stages
- **Fills gap:** Scientific thinking, 3–4 age band sub-concept "observe living things change over time." Alive or Not! (READY) teaches living/nonliving *classification*; Weather Dresser teaches weather observation; Seasons Wheel teaches time-of-year cycles. Life cycle stages — the observable growth sequence within a single organism — are a canonical preschool science concept (caterpillar→butterfly, tadpole→frog, seed→plant) entirely absent from the backlog and all existing game files.
- **Rubric focus:** Learning efficacy (sequencing requires noticing the key change between each stage; voice names the observable difference — "the caterpillar wrapped itself in a cozy cocoon!"; correct ordering triggers a fast-forward animation of the full cycle so the concept is *shown*, not just labeled), Pacing (tier 0 = 2-stage cycle, egg→chick, two large cards with obvious visual difference; tier 1 = 3-stage cycle with one distractor card to ignore; tier 2 = 4-stage butterfly or frog cycle with two distractor cards), Clarity (one cycle at a time; stage cards are large, illustrated, placed in a single row — no reading required)
- **Estimated complexity:** Low-Medium — 3 SVG life cycle sets (caterpillar/butterfly, seed/plant, tadpole/frog), each with 2–4 stage cards; drag-to-slot ordering interaction (reuses the ordering mechanic from Line Them Up); fast-forward animation after correct order is the reward moment; voice narrates each stage transition
- **File:** `js/games/lifecycle.js`

### [PROPOSED] Treasure Trail
- **STEM:** Spatial reasoning · sequential directional navigation (multi-step path planning) · age 4–5
- **Success:** Child can listen to a 2-step direction ("go RIGHT 2 squares, then DOWN 1") and tap the arrow buttons in that sequence to move a character to the treasure — demonstrating they can hold a spatial plan in mind and execute directional steps in order
- **Fills gap:** Spatial reasoning, 4–5 age band. Which Way? (direction.js, PROPOSED) teaches *receptive* single-label recognition ("tap the bunny to the LEFT of the tree"). Treasure Trail is the productive complement: child *applies* left/right/up/down in a multi-step sequence to navigate a simple grid toward a goal. Sequential spatial planning — holding a 2-3 step route in working memory and executing it — is a distinct, more demanding 4–5 skill than single-label recognition. Zero backlog and zero existing-game-file coverage for this sub-concept.
- **Rubric focus:** Learning efficacy (voice says the plan before the child acts — "go RIGHT, then DOWN — ready? go!"; each arrow tap hops the character one cell; arriving at the treasure replays the full route as a glowing trail, so child sees "you planned that path!"), Interaction (child-driven: 4 large directional arrow buttons below a simple grid — tap each step; no reading; the grid is the visual map), Pacing (tier 0 = 1-step direction, single arrow tap, large character and 3×3 grid; tier 1 = 2-step right-angle path on a 4×4 grid; tier 2 = 3-step path with a decoy route that looks right but doesn't reach the treasure)
- **Estimated complexity:** Medium — SVG grid (4×4 max) with character hop animation; 4 large directional arrow buttons; path-trace rendering for the celebration replay; voice delivers direction sequence at a toddler-paced tempo; the design challenge is making the grid legible at a glance without numbers or labels, and keeping the spoken plan slow enough for working memory
- **File:** `js/games/navmap.js`

### [PROPOSED] Beat Keeper
- **STEM:** Patterns / algebra · auditory rhythm patterns (hear + extend AB / ABB patterns) · age 2–4
- **Success:** Child can hear a short rhythmic pattern (boom–clap–boom–clap) played twice and tap the correct sound button to add the next beat — demonstrating they can perceive, hold, and extend a repeating auditory pattern
- **Fills gap:** Patterns/algebra, 2–3 and 3–4 age bands. Pattern Maker (patterns.js, PROPOSED) covers visual color/shape AB and ABC patterns. Beat Keeper covers the same AB/ABC pattern structure in the *auditory* modality — rhythm patterns. These are developmentally distinct skills: a child who can extend a red-blue-red-blue visual sequence may not yet hear that boom–clap–boom–clap is the same structure. Auditory pattern recognition is also a bridge concept to phonological awareness (rhyme and syllable patterns are auditory patterns). sort.js gives partial visual pattern coverage only. Zero backlog and zero existing-game-file coverage for rhythm/auditory patterns.
- **Rubric focus:** Learning efficacy (pattern plays in full before child acts — hears the complete pattern loop twice, then the next slot lights up and child must choose; voice labels the structure aloud — "listen: BOOM, CLAP, BOOM, CLAP — what's next?"; correct tap plays the sound *and* completes the loop so the ear hears the pattern resolve), Interaction (2–3 large synthesised percussion buttons with SVG icons — drum, bell, shaker — using the existing `sfx` Web Audio infrastructure; no audio files needed), Pacing (tier 0 = AB pattern with 2 maximally distinct sounds + a gentle glow hint on the correct button; tier 1 = ABB or AAB pattern, hint removed; tier 2 = ABC pattern with 3 sounds and 2 beats to fill in), Sensory balance (pattern plays at calm tempo; celebration triggers only after a complete cycle is filled, not after each tap — avoids cumulative overstimulation)
- **Estimated complexity:** Low-Medium — 3 synthesised percussion sounds via existing Web Audio sfx; 3 SVG instrument buttons; rhythm sequence engine (array of sound IDs + playback timer with rAF); pattern display strip showing previous beats as colored icons; hint-glow at tier 0; the design challenge is making the "listen first, then respond" structure feel natural rather than passive
- **File:** `js/games/rhythm.js`

### [READY] Letter Lights
- **STEM:** Phonological awareness / literacy · letter name recognition + symbol-sound link · age 3–4
- **Success:** Child can see a glowing letter ("A") on screen, hear the voice say its name and sound ("This is A — it says /a/ like in apple"), and tap the picture from a choice of three whose name starts with that letter — demonstrating they can connect a printed letter symbol to both its name and its beginning sound
- **Fills gap:** Phonological awareness, 3–4 age band — Sound Safari covers phoneme matching (auditory /b/ → tap ball); Clap the Beat covers syllable segmentation; Blend-It! covers onset-rime blending; but **letter NAME recognition** — connecting the visual letter SYMBOL to its spoken name AND phoneme — is the explicit "letter names" sub-concept listed in the STEM doc alongside "letter sounds" for ages 3–4 and is the foundational bridge between phoneme awareness and actual reading. Zero backlog and zero game-file coverage for this specific symbol-to-name-to-sound triple mapping.
- **Rubric focus:** Learning efficacy (three-part cue every round: voice names the letter, demonstrates its sound, links it to a keyword — "A says /a/ like APPLE"; tapping the correct picture triggers the letter lighting up with keyword confirmed — symbol + name + sound reinforced in one celebration), Clarity (one large glowing letter per round stays visible throughout; three picture choices below with no text labels — child matches by picture, not reading), Pacing (tier 0 = 3 maximally distinct letters A/B/M with maximally distinct picture choices; tier 1 = 5 letters with 3 choices per round including one phonetically similar foil e.g. /b/ vs /d/ pictures; tier 2 = 8 letters where child sees the letter, hears the sound, and picks the correct picture from 3 including two near-miss foils)
- **Estimated complexity:** Low-Medium — large SVG letter display; 3-choice picture tap (no drag, no reading required from child); curated letter-word pairs for 8 letters (2 keyword pictures each); voice script per letter (name + sound + example word); no special physics or drag infrastructure needed
- **File:** `js/games/letternames.js`

### [PROPOSED] Pass the Smile
- **STEM:** Social-emotional learning (SEL) · self-regulation — impulse control + turn-taking · age 2–3
- **Success:** Child can watch each animal friend take a turn (bunny wiggles, bear claps, fox waves) and then tap when voice says "YOUR turn!" — demonstrating basic turn-taking: attending, waiting, and acting at the right moment rather than tapping impulsively through every frame
- **Fills gap:** SEL, 2–3 age band — Feelings Friends targets emotion naming; How Does Bunny Feel? targets perspective-taking (ages 4–5); Wind-Down Corner targets self-regulation through breathing. **Turn-taking** — watching, waiting, and acting in sequence — is the core 2–3 social-emotional milestone and the foundational prerequisite for cooperative play; it is treated as first-class in all top competitors (Daniel Tiger "take a turn, take a turn"; Sago Mini's shared-activity games). Zero backlog and zero game-file coverage for this specific sub-skill.
- **Rubric focus:** Emotional safety (no fail state — if child taps early, voice gently says "Let's wait for our friends first" and continues; no score or "wrong" path — only celebration when child taps at the right moment), Learning efficacy (each round models the wait explicitly: animal acts → holds an anticipation pose → child's turn indicator glows; voice narrates each phase — "It's Bunny's turn… now it's YOUR turn! Go!"), Pacing (tier 0 = 1 animal before child's turn, very short wait, strong visual cue; tier 1 = 2 animals, slightly longer wait, fainter cue; tier 2 = 3 animals, child must also INITIATE an action — "show me how YOU wiggle!")
- **Estimated complexity:** Low — 3 SVG animal characters with simple keyframe animations (wiggle, clap, wave); an animated "waiting" indicator (e.g. gentle pulsing ring) so the wait is visually engaging; voice carries all narration; no drag; design challenge is making the WAIT feel exciting rather than empty — animals hold an "anticipation" pose with eyes wide, not frozen
- **File:** `js/games/turntake.js`

### [READY] My Five Senses
- **STEM:** Scientific thinking · observation — naming and matching the five senses to how we explore objects · age 2–4
- **Success:** Child can tap or drag an object (fluffy bunny, ringing bell, bright flower, tangy lemon, warm soup) onto the sense icon it corresponds to (touch, hear, see, smell, taste) — demonstrating that each sense is a distinct tool for exploring the world and that different objects are explored with different senses
- **Fills gap:** Scientific thinking, 2–3 and 3–4 age bands — the STEM doc's 2–3 tier is "name + observe" and the 3–4 tier includes observing natural phenomena; Alive or Not! covers living/nonliving (READY); Seasons Wheel, Weather Dresser, Sink or Float? address environmental prediction. **The five senses as an observation framework** — naming which sense you'd use to explore each object — is the canonical 2–4 preschool science concept present in every early-childhood curriculum and is completely absent from the backlog and all existing games. Who Says? (whosays.js) uses animal sounds but teaches animal identity, not hearing as a sense.
- **Rubric focus:** Learning efficacy (each match is paired with a concrete sense verb and body-part glyph: "a ringing bell — you HEAR that with your EARS!" + ear icon highlights; confirmatory micro-animation matches the sense — the bunny emits a soft tactile ripple, the bell rings, the flower zooms toward the nose glyph — so the sense is demonstrated, not just stated), Clarity (five sense-zone icons always visible as fixed destination targets — eye, ear, hand, nose, mouth — one object presented at a time), Pacing (tier 0 = 2 senses only, see + hear, with maximally obvious objects; tier 1 = 4 senses with 3–4 objects; tier 2 = all 5 senses including one "ambiguous" object per round that could plausibly match two senses e.g. a strawberry you can see AND taste — discovery conversation confirms both are right)
- **Estimated complexity:** Medium — 5 SVG sense-zone destination icons with friendly body-part glyphs; 8–10 SVG object cards (≥2 per sense); drag-to-zone or tap-to-confirm interaction; per-sense confirmatory voice line and micro-animation for each zone; tier 2 ambiguous-object design is the key challenge (must feel like a joyful discovery, not a trick)
- **File:** `js/games/senses.js`

### [PROPOSED] Sink or Float?
- **STEM:** Scientific thinking · material-property prediction (will it sink or float?) · age 4–5
- **Success:** Child can drag an object (rubber duck, rock, apple, coin, leaf, sponge) to a water tank, predict "sink" or "float" by tapping a choice before dropping it, then watch the outcome and hear WHY — demonstrating early scientific prediction using observable material cues (heavy/light, dense/fluffy)
- **Fills gap:** Scientific thinking, 4–5 age band — the STEM doc's 4–5 tier is "predict." What Happens If? (Logic/cause–effect, PROPOSED) targets everyday IF-THEN reasoning (ice cream in the sun). Sink or Float? fills the distinct scientific-thinking slot: **material-property prediction** — child reasons from a physical cue ("it's heavy and hard") to a testable outcome, then observes confirmation or surprise. This is the canonical introductory science experiment for pre-K classrooms (no backlog or game-file equivalent). Zero gap overlap: fuelup.js = quantity more/less; cups.js = positional tracking; eggcatch.js = color discrimination.
- **Rubric focus:** Learning efficacy (two-step structure: predict → observe → hear WHY — "The rock sank because it's heavier than water!"; voice names the material cue that drives the outcome, building causal vocabulary), Interaction (real-time drag-and-drop to water tank; object animates sinking or floating with bubbles/ripples — child-driven, not tap-and-wait), Pacing (tier 0 = 2 maximally obvious objects e.g. feather vs. rock, predict by tapping a sun/anchor icon before drop; tier 1 = 4 objects with less-obvious contrasts e.g. apple vs. grape; tier 2 = 5 objects including surprises like a ball of foil that floats vs. a crumpled one that sinks — teaching that shape matters too)
- **Estimated complexity:** Medium — SVG water tank with animated fill-level + sink/float physics (CSS transform: sink = translateY to bottom, float = stay at surface with gentle bob); 6–8 distinct SVG objects; predict-tap UI before each drop is the core design challenge (must not feel like a quiz — frame it as "what do YOU think?")
- **File:** `js/games/sinkfloat.js`

### [PROPOSED] Which Way?
- **STEM:** Spatial reasoning · relative left/right directionality (positional language) · age 4–5
- **Success:** Child can tap the character or object on the correct side when voice says "the bunny is to the LEFT of the tree" — demonstrating left/right as a **relative** spatial relationship (not just near/far or in/on/under)
- **Fills gap:** Spatial reasoning, 4–5 age band — Where's Teddy? (PROPOSED) covers 2–4 ("in/on/under/behind/next to"); Shape Drop (PROPOSED) covers spatial fitting (2–4); Shadow Match (PROPOSED) covers silhouette matching (2–4). cups.js covers left/middle/right as absolute positions in a working-memory tracking game — that is a distinct skill (object tracking). **Relative left/right directionality** — "to the LEFT of [landmark]" — is the explicit 4–5 positional-language milestone in the STEM ladder and has zero backlog or game-file coverage. Left/right is also a critical pre-reading and pre-writing foundation (directionality of print).
- **Rubric focus:** Learning efficacy (voice delivers the spatial phrase before child acts — "The bunny is to the LEFT of the tree. Can you find it?"; after correct tap, an animated arrow reinforces the direction with a confirming cue so the word-direction link is always explicit), Clarity (each scene has a single central landmark — tree, house, fence — with exactly two characters/objects on opposing sides; the question is always relational to the landmark, not absolute), Pacing (tier 0 = "tap the LEFT one" with only two choices and a hand-cue arrow; tier 1 = "who is to the LEFT of the tree?" with two characters in different positions; tier 2 = three characters, child identifies which is "BETWEEN" the tree and the house — introduces a new preposition)
- **Estimated complexity:** Low-Medium — 6–8 SVG scene layouts (meadow, kitchen, playground); 2–3 character positions per scene; no drag; voice delivers the spatial direction; the design challenge is always making "left" feel *relative to the landmark*, not as a body-reference absolute (keep the landmark clearly in the middle, characters clearly on each side)
- **File:** `js/games/direction.js`

### [READY] Fill It Up!
- **STEM:** Measurement / comparison · capacity — which container holds more? · age 3–4
- **Success:** Child can hold/tap to pour water into two containers and identify which one is full first — demonstrating they can compare **volume capacity** through an active, continuous cause-and-effect mechanic rather than visual estimation alone
- **Fills gap:** Measurement/comparison, 3–4 age band — the STEM doc marks Measurement as a Gap with "length/height, more/less, ordering" listed as missing sub-concepts. **Capacity** (how much a container holds) is a distinct measurement sub-concept that none of the backlog or existing games address: Tall or Short (IN_REVIEW) = linear height; More or Less (PROPOSED) = discrete quantity; Line Them Up (PROPOSED) = size seriation; fuelup.js = quantity comparison via countable cells. Pouring water/sand between containers is the canonical toddler measurement experience (Piaget's conservation of volume; children ages 3–4 actively explore this with real containers). Zero backlog overlap.
- **Rubric focus:** Learning efficacy (fill animation makes capacity concrete and continuous — child watches the level rise and hears "almost full… it's full!" — teaching measurement as a process, not a label; voice names the winner: "That cup holds MORE!"), Interaction (real-time pour: hold the screen to pour, release to stop; rAF loop updates the SVG fill level — child-driven, sustained engagement, not tap-and-wait; matches how toddlers interact with actual containers), Pacing (tier 0 = two containers with very different sizes, single jug to pour; tier 1 = three containers, child picks the biggest one to hold all the water before overflowing the small ones; tier 2 = two containers that LOOK different in height but hold the same amount — child discovers that taller ≠ more, a gentle introduction to conservation)
- **Estimated complexity:** Medium — animated SVG containers with a fill-level arc (rising water line); rAF pour-rate loop; 4–6 container shapes (tall cup, wide bowl, jug, bucket); the design challenge is making "full" instantly readable at a glance and keeping the comparison question ("which holds more?") clear before pouring begins; tier 2 conservation scenario is the key design risk (keep it discovery-framed, not confusing)
- **File:** `js/games/pour.js`

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

### [READY] Shape Drop
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


### [READY] Blend-It!  ⟵ PM-approved · build #1 (top of READY queue)
- **PM note:** Promoted to READY — literacy/phonological-awareness is the #1 highest-ROI gap domain, this completes the onset-rime step of that track, it's voice-first and low-medium complexity (reuses the Sound Safari word bank), so it's a safe, high-value build. Implementer: build this first.
- **STEM:** Phonological awareness / literacy · onset-rime blending (simple CVC blending) · age 4–5
- **Success:** Child can hear the voice say an onset and rime separately (e.g., "/b/…/oat/") and tap the correct picture (boat, not goat or coat) — demonstrating they can blend two phoneme chunks into a whole word
- **Fills gap:** Phonological awareness, 4–5 age band — Rhyme Time covers rhyme recognition (2–4), Clap the Beat covers syllable segmentation (2–4), Sound Safari covers initial-phoneme matching (3–5); onset-rime blending is the next developmental sub-skill on the literacy ladder and has zero backlog coverage; completing the full phonological awareness track is the #1 highest-ROI domain per the STEM doc
- **Rubric focus:** Learning efficacy (onset and rime voiced with a clear pause, then merged aloud on correct tap — child hears the two parts collapse into one word), Clarity (2 picture choices tier 0 → 3 minimally-contrasting pictures tier 2), Pacing (tier 0 = obvious onset contrast like /b/+/all vs /f/+/all/, tier 1 = rime contrasts with 2 foils, tier 2 = 3-phoneme CVC words with two plausible foils)
- **Estimated complexity:** Low-Medium — voice-first phoneme delivery (Web Speech can do paused segments); curated 12–16 onset+rime pairs; picture cards are reusable from Sound Safari word bank; no drag, no reading
- **File:** `js/games/blend.js`

### [READY] Alive or Not?  ⟵ PM-approved · build #2
- **PM note:** Promoted to READY — foundational scientific-thinking concept (living/nonliving) that other science games presuppose; two big tap-zones, voice carries the content, low-medium complexity → reliable build. Implementer: build after Blend-It!.
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

### [DONE] Tall or Short (Measurement)
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

### [DONE] Night & Day Sort
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

