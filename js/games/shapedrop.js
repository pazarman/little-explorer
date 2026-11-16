"use strict";
/* LEVEL: Shape Drop — spatial fitting (the classic shape-sorter mechanic)
   STEM OBJECTIVE · Spatial reasoning · spatial fitting: match a shape piece to the
   hole that shares its form (and, at the hardest tier, its size too) · age 2–4.
   Success = the child discovers that FORM determines FIT, through forgiving
   trial-and-error — no fail state, generous snapping, and an assist that places a
   piece itself if she stalls. Each shape is a friendly little character (eyes with a
   highlight + rosy cheeks) so the screen feels alive, per docs/ART-STYLE-GUIDE.md. */

const SD_SHAPES = {
  circle:   { d: `<circle cx="50" cy="50" r="42"/>`,                               face: [50, 52] },
  square:   { d: `<rect x="11" y="11" width="78" height="78" rx="13"/>`,           face: [50, 52] },
  triangle: { d: `<path d="M50 9 L90 85 L10 85 Z"/>`,                              face: [50, 63] },
  star:     { d: `<path d="M50 6 L61 38 L95 38 L68 59 L78 92 L50 72 L22 92 L32 59 L5 38 L39 38 Z"/>`, face: [50, 54] },
  heart:    { d: `<path d="M50 86 C22 64 8 46 8 30 C8 15 20 7 31 7 C40 7 47 12 50 20 C53 12 60 7 69 7 C80 7 92 15 92 30 C92 46 78 64 50 86 Z"/>`, face: [50, 44] },
};
// Saturated, cheerful fills (base + a lighter sheen) — no muddy tones.
const SD_COLORS = {
  circle:   ["#ff5d5d", "#ffb4b4"],
  square:   ["#ffb020", "#ffd98a"],
  triangle: ["#35c15e", "#9bebb4"],
  star:     ["#3f8cff", "#a9ccff"],
  heart:    ["#ff5fa8", "#ffb3d8"],
};
// Hole positions (percent of the board) for each piece-count, non-overlapping.
const SD_SPOTS = {
  3: [{ left: "26%", top: "40%" }, { left: "74%", top: "40%" }, { left: "50%", top: "76%" }],
  4: [{ left: "28%", top: "34%" }, { left: "72%", top: "34%" }, { left: "28%", top: "76%" }, { left: "72%", top: "76%" }],
  5: [{ left: "21%", top: "33%" }, { left: "50%", top: "25%" }, { left: "79%", top: "33%" }, { left: "33%", top: "77%" }, { left: "67%", top: "77%" }],
};

// A friendly face: white eyes each with a highlight dot, rosy cheeks, a soft smile.
function sdFace(cx, cy) {
  return `<g class="sd-no-pick">
    <circle cx="${cx - 11}" cy="${cy - 3}" r="8" fill="#fff"/><circle cx="${cx + 11}" cy="${cy - 3}" r="8" fill="#fff"/>
    <circle cx="${cx - 10}" cy="${cy - 1}" r="4.2" fill="#2b2b35"/><circle cx="${cx + 12}" cy="${cy - 1}" r="4.2" fill="#2b2b35"/>
    <circle cx="${cx - 11.4}" cy="${cy - 2.6}" r="1.6" fill="#fff"/><circle cx="${cx + 10.6}" cy="${cy - 2.6}" r="1.6" fill="#fff"/>
    <circle cx="${cx - 18}" cy="${cy + 7}" r="5" fill="#ff7fb6" opacity=".5"/><circle cx="${cx + 18}" cy="${cy + 7}" r="5" fill="#ff7fb6" opacity=".5"/>
    <path d="M${cx - 7} ${cy + 8} Q${cx} ${cy + 14} ${cx + 7} ${cy + 8}" stroke="#2b2b35" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  </g>`;
}
function sdPieceSVG(shape) {
  const [base, lite] = SD_COLORS[shape];
  const [fx, fy] = SD_SHAPES[shape].face;
  return `<svg viewBox="0 0 100 100" class="sd-shape-svg">
    <g fill="${base}">${SD_SHAPES[shape].d}</g>
    <ellipse cx="${fx - 13}" cy="${fy - 18}" rx="11" ry="6.5" fill="${lite}" opacity=".7"/>
    ${sdFace(fx, fy)}
  </svg>`;
}
function sdHoleSVG(shape) {
  return `<svg viewBox="0 0 100 100" class="sd-hole-svg">
    <g fill="rgba(0,0,0,.10)">${SD_SHAPES[shape].d}</g>
    <g fill="none" stroke="#5a4632" stroke-width="4" stroke-dasharray="9 7" stroke-linejoin="round" stroke-linecap="round">${SD_SHAPES[shape].d}</g>
  </svg>`;
}

const shapedropLevel = {
  theme: "theme-shapedrop", rounds: 4,

  startRound() {
    this.mistakes = 0;
    this.filled = 0;
    this.assisting = false;
    clearTimeout(this.idle); this.idle = null;
    this.holes = [];
    const tier = state.tier;

    // Choose the (shape, size) pairs for this round.
    const pool = shuffle(["circle", "square", "triangle", "star", "heart"]);
    let specs;
    if (tier === 0) {                                   // 3 distinct shapes, obvious 1:1 holes
      specs = pool.slice(0, 3).map(s => ({ shape: s, size: "big" }));
    } else if (tier === 1) {                            // 5 pieces, one shape twice — match more carefully
      specs = pool.slice(0, 4).map(s => ({ shape: s, size: "big" }));
      specs.push({ shape: specs[0].shape, size: "big" });
    } else {                                            // 2 shapes × 2 sizes — form AND size must match
      specs = [];
      pool.slice(0, 2).forEach(s => { specs.push({ shape: s, size: "big" }); specs.push({ shape: s, size: "small" }); });
    }
    specs = shuffle(specs);
    this.specs = specs;

    setInstruction("🧩 " + t("sd_show"), t("sd_say"));

    $("playArea").innerHTML =
      scene.html("meadow", { seed: 17 + state.round * 6 }) +
      `<div class="sd-wrap">
         <div class="sd-board" id="sdBoard"></div>
         <div class="choice-row sd-tray" id="sdTray"></div>
       </div>`;

    const board = $("sdBoard"), spots = SD_SPOTS[specs.length];
    specs.forEach((sp, i) => {
      const hole = document.createElement("div");
      hole.className = "sd-hole" + (sp.size === "small" ? " sd-small" : "");
      hole.style.left = spots[i].left; hole.style.top = spots[i].top;
      hole.innerHTML = sdHoleSVG(sp.shape);
      board.appendChild(hole);
      this.holes.push({ el: hole, shape: sp.shape, size: sp.size, filled: false });
    });

    const tray = $("sdTray");
    shuffle(specs.slice()).forEach(sp => {
      const b = document.createElement("button");
      b.className = "choice sd-piece" + (sp.size === "small" ? " sd-small" : "");
      b.dataset.shape = sp.shape; b.dataset.size = sp.size;
      b.setAttribute("aria-label", sp.shape);
      b.innerHTML = sdPieceSVG(sp.shape);
      makeDraggable(b, (el, ev, info) => this.onDrop(el, ev, info, sp));
      tray.appendChild(b);
    });

    this.armIdle();
  },

  matches(sp, hole) {
    return !hole.filled && hole.shape === sp.shape && (state.tier < 2 || hole.size === sp.size);
  },

  onDrop(el, ev, info, sp) {
    if (state.busy) { info.reset(); return; }
    if (!info.moved) {                                  // a tap, not a drag — teach, never penalize
      speak(t("sd_tap", { x: word(sp.shape) }));
      this.pulseHoleFor(sp);
      info.reset(); this.armIdle();
      return;
    }
    const pc = centerOf(el);
    const dist = h => { const c = centerOf(h.el); return Math.hypot(pc.x - c.x, pc.y - c.y); };
    const open = this.holes.filter(h => !h.filled);

    // Prefer this piece's own matching hole, very generously (toddler motor).
    const mine = open.filter(h => this.matches(sp, h)).sort((a, b) => dist(a) - dist(b))[0];
    if (mine && dist(mine) < mine.el.getBoundingClientRect().width * 0.85) {
      this.place(el, mine, sp, ev); return;
    }
    // Dropped onto a wrong hole? That is a genuine "try" — gentle bounce, count it.
    const near = open.sort((a, b) => dist(a) - dist(b))[0];
    if (near && dist(near) < near.el.getBoundingClientRect().width * 0.7) {
      this.wrongHole(el, sp);
    }
    info.reset(); this.armIdle();
  },

  place(el, hole, sp, ev) {
    hole.filled = true;
    hole.el.classList.remove("hint-highlight");
    hole.el.classList.add("sd-filled");
    hole.el.innerHTML = `<div class="sd-landed">${sdPieceSVG(sp.shape)}</div>`;
    if (el) el.remove();
    this.filled++;
    clearTimeout(this.idle);
    const x = (ev && ev.clientX) || innerWidth / 2, y = (ev && ev.clientY) || innerHeight / 2;
    sfx.tap(); tone(560 + this.filled * 70, 0, .16, "triangle", .15);
    miniStar(x, y); floaters(["✨", "🌟"], x, y, 4);
    if (this.filled >= this.holes.length) {
      speak(t("sd_all_home") + " " + praise());
      roundComplete();
    } else {
      speak(t("sd_fits", { x: word(sp.shape) }));
      this.armIdle();
    }
  },

  wrongHole(el, sp) {
    this.mistakes++;
    sfx.bad(); wiggle(el);
    if (this.mistakes >= 2) this.pulseHoleFor(sp);       // assist ladder: show the right home
    speak(t("sd_wrong"));
  },

  pulseHoleFor(sp) {
    const h = this.holes.find(x => this.matches(sp, x));
    if (h) { h.el.classList.remove("hint-highlight"); void h.el.offsetWidth; h.el.classList.add("hint-highlight"); }
  },

  /* Passive-player rescue. If nothing happens, first point to a hole; if still
     nothing, gently fly a piece into its own hole so the round always resolves.
     There is no way to get stuck and no way to fail. */
  armIdle() {
    clearTimeout(this.idle);                              // core.wait ids are plain timeout ids
    if (!this.holes || this.filled >= this.holes.length) return;
    this.idle = core.wait(() => this.nudge(this.assisting ? 1 : 0), this.assisting ? 3500 : 6000);
  },

  nudge(stage) {
    if (state.level !== "shapedrop") return;              // left the game — let the chain die
    if (state.busy) { this.armIdle(); return; }           // between rounds — try again shortly
    const tray = $("sdTray"); if (!tray) return;
    const piece = tray.querySelector(".sd-piece"); if (!piece) return;
    const sp = { shape: piece.dataset.shape, size: piece.dataset.size };
    if (stage === 0) {
      this.pulseHoleFor(sp);
      speak(t("sd_hint", { x: word(sp.shape) }));
      this.idle = core.wait(() => this.nudge(1), 5000);
    } else {
      this.assisting = true;
      this.autoPlace(piece, sp);
    }
  },

  autoPlace(piece, sp) {
    const hole = this.holes.find(h => this.matches(sp, h));
    if (!hole) { this.armIdle(); return; }
    if (reducedMotion()) { this.place(piece, hole, sp, null); return; }
    const pr = piece.getBoundingClientRect(), hr = hole.el.getBoundingClientRect();
    piece.style.transition = "transform .6s ease"; piece.style.zIndex = 60;
    piece.style.transform =
      `translate(${hr.left + hr.width / 2 - (pr.left + pr.width / 2)}px, ${hr.top + hr.height / 2 - (pr.top + pr.height / 2)}px)`;
    hole.el.classList.add("hint-highlight");
    this.idle = core.wait(() => this.place(piece, hole, sp, null), 650);
  },
};

registerGame({
  id: "shapedrop", world: "shape", icon: "🧩",
  name: "Shape Drop", es: "Encaja Figuras", yue: "放形狀",
  lvl: 1, v: 55, cue: "wood",
  level: shapedropLevel
});
