# Game Boilerplate Template

Use this structure when creating a new mini-game in `js/games/`.

```javascript
"use strict";

/**
 * STEM Objective: [Domain] · [Concept] · [Age band] · Success = [Expected Outcome]
 * Example: Measurement · Size comparison · 2–3 · Success = Child identifies the "big" object vs "small".
 */

/* ================= LEVEL: [Game Name] ================= */

/**
 * Helper to generate SVG art for the game objects.
 * Prefer procedural SVG over external assets.
 * Targets should be >= 44px.
 */
function objectSVG(props) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- SVG Content -->
  </svg>`;
}

const gameLevelName = {
  theme: "theme-[name]", // CSS class for playArea styling
  rounds: 5,             // Standard round count

  /**
   * Called to set up each round.
   * Responds to state.tier (0, 1, or 2).
   */
  startRound() {
    // 1. Logic for difficulty tiers
    const difficulty = [/* Easy */, /* Med */, /* Hard */][state.tier];

    // 2. Set the goal/target
    this.target = /* ... */;

    // 3. Update instructions (Voice + Visual Text)
    // speak() is called automatically by setInstruction if requested
    setInstruction(t("instruction_key", { x: this.target }), t("instruction_key", { x: this.target }));

    // 4. Render to playArea
    const area = $("playArea");
    area.innerHTML = ""; // Clear previous round

    // 5. Position objects (use scatter() or layout helpers)
    const spots = scatter(count);
    items.forEach((item, i) => {
      const b = document.createElement("button");
      b.className = "game-btn";
      b.style.left = spots[i].left;
      b.style.top = spots[i].top;
      b.innerHTML = objectSVG(item);
      b.onclick = e => this.tap(b, item, e);
      area.appendChild(b);
    });
  },

  /**
   * Handle user interaction.
   */
  tap(btn, value, e) {
    if (state.busy) return; // Prevent double-taps

    if (value === this.target) {
      // Success Path
      btn.classList.add("popped");
      miniStar(e.clientX, e.clientY);
      speak(praise());
      roundComplete(); // Progress to next round/level
    } else {
      // Failure Path (No fail state, just assistance)
      sfx.bad();
      wiggle(btn);
      // Hint ladder (verbal cue -> highlight -> guide)
      speak(t("hint_key", { x: this.target }));
    }
  }
};
```

## Essential Shared Helpers
- `state.tier`: Current difficulty (0, 1, 2).
- `setInstruction(text, speech)`: Updates the top bar and speaks.
- `scatter(n)`: Returns `n` random `{left, top}` positions that don't overlap much.
- `shuffle(arr)`: Standard Fisher-Yates shuffle.
- `rand(arr)`: Pick a random item from an array.
- `speak(text)`: Text-to-speech.
- `sfx.bad()`: Plays the "whoops" synth sound.
- `roundComplete()`: Records performance and moves forward.
- `t(key, vars)`: Translation helper.
