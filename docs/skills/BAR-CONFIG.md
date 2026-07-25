# Quality Bar Configuration

This file captures current product-quality decisions and should be treated as default policy for new features.

## Current Decisions

- Primary goal (next 30 days): Learning outcomes
- Sensory profile: Balanced
- Difficulty philosophy: Auto assist quickly
- Parent controls: Medium gate
- Language rollout priority: English + Spanish first
- Interaction model: Prefer real-time, child-driven mechanics (steer/drag/move) over tap-and-wait

## Policy Implications

### Learning Outcomes
- Prefer depth over breadth when choosing roadmap items.
- Every new game must have clear learning objective and measurable progression.

### Sensory Balance
- Keep celebratory effects, but use sparingly and avoid stacking intense effects repeatedly.
- Include reduced-motion/calm-friendly alternatives when touching animation-heavy areas.

### Difficulty + Assistance
- Escalate help quickly for repeated mistakes.
- Hint ladder should reach guided assist by the third wrong attempt.

### Parent Trust
- Settings and reset should not be one-tap accessible to children.
- Use at least long-press plus simple parent check for destructive actions.

### Language Rollout
- Ship English + Spanish first with phrase-key architecture.
- Ensure Cantonese can be added without refactoring core audio logic.

### Interaction & Game-Feel
- **Default to continuous, real-time interaction the child actively drives** — steer / drag / move inside a
  `requestAnimationFrame` loop, with motion or scrolling — over "tap one thing, then wait." It should feel
  like a real game. Reference build: **Dolphin Dive** (scrolling steer-and-collect swim).
- The learning objective still leads; the interactive mechanic is *how* the child practices it (e.g. steering
  the dolphin up/down IS the positional-language practice). Don't bolt on motion that doesn't teach.
- Non-negotiables still hold: no fail states, big targets (≥44px), voice-first, calm sensory path (no stacked
  intense effects), auto-assist by the 3rd miss.
- Tap-and-place is still correct for concepts that need deliberation (sorting, exact-set counting, matching).
  Choose the mechanic that best fits the skill — but when there's a genuine choice, bias toward active/continuous.
- Verify game-loop builds by driving the loop headlessly (spawn/steer/collide), not just static layout;
  watch for loop bugs like objects never leaving the active list (see Dolphin Dive spawn-stall fix).
