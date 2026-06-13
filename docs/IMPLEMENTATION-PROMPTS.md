# Implementation Prompts for Future Work

Use these prompts directly in Copilot Chat later to implement the selected priorities.

## 2) Smarter Adaptive Difficulty (Performance-Based)

Prompt:

You are editing fiona-game/index.html. Replace the current auto difficulty logic so it adapts based on real performance, not just completion counts.

Requirements:
- Keep manual modes unchanged: easy, med, hard must still force tiers 0, 1, 2.
- In auto mode, compute tier from a persistent per-level performance model in localStorage.
- Track and store at least these metrics per level:
  - roundsPlayed
  - roundsNoMistake
  - roundsWithManyMistakes
  - emaScore (exponential moving average of round quality)
- Round quality scoring:
  - 0 mistakes -> 1.0
  - 1 mistake -> 0.75
  - 2 mistakes -> 0.5
  - 3+ mistakes -> 0.2
- Update the model at every round completion before advancing.
- Tier mapping in auto mode:
  - low skill -> tier 0
  - medium skill -> tier 1
  - high skill -> tier 2
- Add immediate downshift behavior: if a round has 3+ mistakes, lower next round tier by one (floor at 0).
- Slow early progression: before enough data exists, remain conservative and avoid jumping to tier 2 quickly.
- Persist model under a new key such as fionaPerf and keep backward compatibility with existing saves.
- Do not change game content, only difficulty adaptation behavior.

Validation:
- Start a level in auto mode and verify tier changes across rounds based on mistakes.
- Confirm manual difficulty buttons still behave exactly as before.
- Ensure no runtime errors.

## 6) Hint Ladder for Wrong Answers

Prompt:

You are editing fiona-game/index.html. Add a progressive hint ladder to improve learning feedback after mistakes.

Requirements:
- Introduce a shared helper API for hints so each level can use it consistently.
- For each round, track wrong attempts count.
- Hint ladder behavior:
  - 1st wrong: gentle verbal cue
  - 2nd wrong: visual cue (highlight correct target category/item)
  - 3rd wrong: guided assist (demo tap/animation or temporarily reduce choices)
- Reset hint state when a new round starts.
- Integrate into at least these levels first:
  - pattern
  - ocean colors
  - petmatch
  - whosays
- Keep tone supportive and non-punitive.
- Avoid blocking progression forever; guided assist should help complete the round.

Validation:
- Trigger repeated wrong taps and verify cues escalate in order.
- Confirm cues reset on next round.
- Ensure no new UI overlap/regression on mobile.

## 7) Audio Controls (Voice, Music, SFX Levels)

Prompt:

You are editing fiona-game/index.html. Expand settings to include separate volume controls for voice, music, and SFX.

Requirements:
- Add three sliders in grown-up settings:
  - Voice volume (0 to 100)
  - Music volume (0 to 100)
  - SFX volume (0 to 100)
- Keep existing on/off and music style options working.
- Persist values in fionaSettings with safe defaults for existing users.
- Apply controls to runtime systems:
  - speech synthesis volume for voice
  - background music tone amplitude for music
  - all sfx methods for SFX
- Clamp values and guard against invalid saved settings.
- Keep UX toddler-safe and parent-readable.

Validation:
- Move each slider and verify immediate audible effect.
- Reload page and confirm values persist.
- Confirm music off still fully mutes background music regardless of slider value.

## Combined Sprint Prompt (2 + 6 + 7 Together)

Prompt:

You are editing fiona-game/index.html. Implement three upgrades in one coherent pass:
1) performance-based auto difficulty,
2) progressive hint ladder,
3) separate voice/music/sfx volume sliders.

Constraints:
- Preserve existing game behaviors and visuals unless needed for these features.
- Keep no-fail-state design principles.
- Keep mobile performance stable.
- Update README feature bullets to mention adaptive difficulty v2, hint ladder, and audio sliders.
- After edits, run a quick sanity check for syntax/runtime issues.

Return:
- Summary of files changed.
- Short test checklist for manual QA on phone.
