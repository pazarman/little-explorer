"use strict";
/* LEVEL: Shape Drop (spatial fitting)
   STEM objective · Spatial reasoning · spatial fitting — drag a shape piece into the
   cutout hole whose outline matches it; at tier 2 size must match too (form AND size).
   Age band 2–4. Success = child places shape pieces into matching holes, learning that
   form (and size) determines fit, through forgiving trial-and-error with no fail state. */

// Each shape is authored once as an outline path in a 0..100 viewBox, so the draggable
// piece and its cutout hole share the exact same silhouette. `face` is the centroid the
// friendly face sits on (shapes aren't flat — they're little shape friends with eyes).
const SD_SHAPES = {
  circle:   { color: "#ff6f61", face: [50, 52], fs: 1.0,
              path: "M8 50 A42 42 0 1 0 92 50 A42 42 0 1 0 8 50 Z" },
  square:   { color: "#4d9de0", face: [50, 55], fs: 1.0,
              path: "M20 16 H80 A8 8 0 0 1 88 24 V80 A8 8 0 0 1 80 88 H20 A8 8 0 0 1 12 80 V24 A8 8 0 0 1 20 16 Z" },
  triangle: { color: "#52c66b", face: [50, 66], fs: 0.82,
              path: "M50 10 L87 80 A7 7 0 0 1 81 90 H19 A7 7 0 0 1 13 80 Z" },
  star:     { color: "#f6c445", face: [50, 54], fs: 0.78,
              path: "M50 8 L61 37 L92 38 L68 58 L77 90 L50 71 L23 90 L32 58 L8 38 L39 37 Z" },
  heart:    { color: "#e86ab0", face: [50, 50], fs: 0.8,
              path: "M50 86 C12 60 14 24 37 24 C47 24 50 34 50 40 C50 34 53 24 63 24 C86 24 88 60 50 86 Z" },
};
const sdName = id => t("shape_" + id);

// A friendly toddler face authored around (50,50); placed on a shape at (cx,cy) scaled s.
function sdFace(cx, cy, s) {
  const dx = cx - 50 * s, dy = cy - 50 * s;
  return `<g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)}) scale(${s})" class="sd-face">
    <ellipse cx="40" cy="49" rx="6" ry="7.2" fill="#fff"/>
    <ellipse cx="60" cy="49" rx="6" ry="7.2" fill="#fff"/>
    <circle cx="41" cy="50.5" r="3.4" fill="#2a2a3a"/>
    <circle cx="61" cy="50.5" r="3.4" fill="#2a2a3a"/>
    <circle cx="39.4" cy="48.8" r="1.4" fill="#fff"/>
    <circle cx="59.4" cy="48.8" r="1.4" fill="#fff"/>
    <circle cx="32" cy="60" r="4.6" fill="#ff7fb6" opacity=".5"/>
    <circle cx="68" cy="60" r="4.6" fill="#ff7fb6" opacity=".5"/>
    <path d="M41 61 Q50 69 59 61" stroke="#2a2a3a" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  </g>`;
}
function sdPieceSVG(id) {
  const s = SD_SHAPES[id];
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="${s.path}" fill="${s.color}" stroke="rgba(0,0,0,.14)" stroke-width="2.4" stroke-linejoin="round"/>
    <ellipse cx="40" cy="30" rx="15" ry="9" fill="#fff" opacity=".22"/>
    ${sdFace(s.face[0], s.face[1], s.fs)}
  </svg>`;
}
function sdHoleSVG(id) {
  const s = SD_SHAPES[id];
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="${s.path}" fill="rgba(38,28,52,.40)" stroke="rgba(255,255,255,.9)" stroke-width="3.2"
          stroke-dasharray="5 4" stroke-linejoin="round"/>
  </svg>`;
}

const shapeDropLevel = {
  theme: "theme-shapedrop", rounds: 5,
  idleT: null, idleStage: 0,

  // Which pieces this round, per difficulty tier.
  //  tier 0 — 3 distinct basic shapes, one size: obvious 1:1 fit.
  //  tier 1 — 4 distinct shapes, one size: more forms to tell apart.
  //  tier 2 — 2 shapes in BIG and SMALL: form AND size must match.
  spec() {
    if (state.tier >= 2) {
      const two = shuffle(Object.keys(SD_SHAPES)).slice(0, 2);
      const out = [];
      two.forEach(id => { out.push({ shape: id, size: "big" }); out.push({ shape: id, size: "small" }); });
      return out;
    }
    const n = state.tier === 1 ? 4 : 3;
    const pool = state.tier === 1
      ? shuffle(Object.keys(SD_SHAPES)).slice(0, n)
      : ["circle", "square", "triangle"];
    return pool.map(id => ({ shape: id, size: "mid" }));
  },

  startRound() {
    this.mistakes = 0; this.idleStage = 0; this.clearIdle();
    const spec = this.spec();
    this.remaining = spec.length;
    setInstruction("🔷 " + t("sd_show"), t("sd_say"));
    $("playArea").innerHTML =
      scene.html("cozy", { seed: 11 + state.round * 5 }) +
      `<div class="sd-stage">
         <div class="sd-board" id="sdBoard"></div>
         <div class="sd-tray" id="sdTray"></div>
       </div>`;

    // Holes (the sorter box) and pieces (the tray) share the same spec, shuffled apart
    // so a piece never sits right under its own hole.
    this.holes = [];
    shuffle(spec).forEach(it => {
      const cell = document.createElement("div");
      cell.className = "sd-hole sd-" + it.size;
      cell.innerHTML = sdHoleSVG(it.shape);
      $("sdBoard").appendChild(cell);
      this.holes.push({ el: cell, shape: it.shape, size: it.size, filled: false });
    });

    this.pieces = [];
    shuffle(spec).forEach(it => {
      const p = document.createElement("button");
      p.className = "sd-piece sd-" + it.size;
      p.innerHTML = sdPieceSVG(it.shape);
      p._sd = { shape: it.shape, size: it.size };
      p._placed = false;
      makeDraggable(p, (el, ev, info) => this.resolve(el, ev, info));
      $("sdTray").appendChild(p);
      this.pieces.push(p);
    });

    this.armIdle();
  },

  // Drag release: did the piece land on its matching hole?
  resolve(el, ev, info) {
    if (state.busy || el._placed) { info.reset(); return; }
    const c = centerOf(el);
    const hole = this.holes.find(h => !h.filled && inside(c, h.el));
    const want = el._sd;
    if (hole && hole.shape === want.shape && hole.size === want.size) {
      info.reset();                                   // clear the drag inline styles first
      this.snap(el, hole, ev, false);
    } else if (hole) {                                // wrong hole: gentle correction, never a fail
      info.reset(); sfx.bad(); wiggle(el);
      this.mistakes++;
      speak(t("sd_wrong", { shape: sdName(want.shape) }));
      this.hintLadder(el);
      this.armIdle();
    } else {
      info.reset();                                   // dropped on empty space: just goes home
    }
  },

  // Settle a piece into its hole. `assisted` = the game placed it for a passive player.
  snap(el, hole, ev, assisted) {
    hole.filled = true; el._placed = true;
    el.style.position = ""; el.style.left = el.style.top = el.style.zIndex = "";
    el.classList.add("sd-placed");
    hole.el.classList.remove("hint-highlight");
    hole.el.appendChild(el);
    const cc = centerOf(hole.el);
    sfx.tap(); miniStar(ev ? ev.clientX : cc.x, ev ? ev.clientY : cc.y);
    floaters(["✨"], cc.x, cc.y, 3);
    speak(t(assisted ? "sd_here" : "sd_yes", { shape: sdName(el._sd.shape) }));
    this.remaining--;
    if (this.remaining <= 0) { this.clearIdle(); speak(praise()); roundComplete(); }
    else { this.idleStage = 0; this.armIdle(); }
  },

  // Guided assist on wrong taps: light the right hole by the 2nd miss, wiggle it by the 3rd.
  hintLadder(el) {
    const hole = this.holes.find(h => !h.filled && h.shape === el._sd.shape && h.size === el._sd.size);
    if (!hole) return;
    if (this.mistakes === 2) hole.el.classList.add("hint-highlight");
    else if (this.mistakes >= 3) { hole.el.classList.add("hint-highlight"); wiggle(hole.el); }
  },

  // The passive-player rescue: if nothing happens, first nudge toward a hole, then — still
  // idle — place a piece so she always moves forward. A game here is never a dead end.
  armIdle() {
    this.clearIdle();
    this.idleT = core.wait(() => this.idleStep(), reducedMotion() ? 4200 : 5200);
  },
  clearIdle() {
    if (this.idleT) { clearTimeout(this.idleT); core.timers.delete(this.idleT); this.idleT = null; }
  },
  idleStep() {
    this.idleT = null;
    if (state.busy || this.remaining <= 0) return;
    const piece = this.pieces.find(p => !p._placed);
    if (!piece) return;
    const hole = this.holes.find(h => !h.filled && h.shape === piece._sd.shape && h.size === piece._sd.size);
    if (!hole) return;
    if (this.idleStage === 0) {                       // first: show where it goes
      hole.el.classList.add("hint-highlight");
      wiggle(piece);
      speak(t("sd_find", { shape: sdName(piece._sd.shape) }));
      this.idleStage = 1;
      this.idleT = core.wait(() => this.idleStep(), reducedMotion() ? 4600 : 6000);
    } else {                                          // then: fit it for her
      this.snap(piece, hole, null, true);
    }
  },
};

registerGame({
  id: "shapedrop", world: "shape", icon: "🔷",
  name: "Shape Drop", es: "Encaja Formas", yue: "放形狀",
  lvl: 0, cue: "wood", v: 55, level: shapeDropLevel,
});
