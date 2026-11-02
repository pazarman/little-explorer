"use strict";
/* LEVEL: Shape Drop (spatial fitting)
   STEM OBJECTIVE · Spatial reasoning · spatial fitting — the child drags each shape
   piece to the one cut-out hole it belongs in, so form (and, at the hardest tier,
   size) is what decides whether a piece fits · age band 2–4.
   Success = she drops a shape into its matching hole and feels it click home; by
   tier 1 she must look across several holes to find the one that fits; tier 2 asks
   her to match shape AND size. No fail state: a wrong drop bounces back gently, a
   hint lights the right hole after a couple of misses, and if she stalls the toy
   shows her how — so even a passive player is always carried to the finish. */

const SHAPEDROP_SHAPES = {
  circle:   { color: "#e8503a", light: "#ff8f74" },
  square:   { color: "#2f7fde", light: "#79b4ff" },
  triangle: { color: "#3fa84f", light: "#86d98f" },
  star:     { color: "#f4c42a", light: "#ffe07a" },
  heart:    { color: "#ff6f91", light: "#ffb3c6" },
};

// The primary shape body only — reused for both the coloured piece and the dark hole
// silhouette so a piece and its hole always share the exact same outline.
function sdBase(shape, fill) {
  switch (shape) {
    case "circle":   return `<circle cx="50" cy="52" r="38" fill="${fill}"/>`;
    case "square":   return `<rect x="14" y="16" width="72" height="72" rx="16" fill="${fill}"/>`;
    case "triangle": return `<path d="M50 12 L88 82 Q92 90 82 90 L18 90 Q8 90 12 82 Z" fill="${fill}"/>`;
    case "star":     return `<path d="M50 8 L61 39 L94 40 L68 61 L77 93 L50 74 L23 93 L32 61 L6 40 L39 39 Z" fill="${fill}"/>`;
    case "heart":    return `<path d="M50 88 C16 64 10 38 28 25 C41 16 50 27 50 35 C50 27 59 16 72 25 C90 38 84 64 50 88 Z" fill="${fill}"/>`;
  }
  return "";
}

// A friendly face so each shape reads as a little character that wants to go home —
// eyes with a highlight dot, rosy cheeks, a soft smile (per the art style guide).
const SD_FACE = `
  <ellipse cx="40" cy="50" rx="6.4" ry="7.4" fill="#fff"/>
  <ellipse cx="60" cy="50" rx="6.4" ry="7.4" fill="#fff"/>
  <circle cx="41" cy="51" r="3.3" fill="#26323a"/>
  <circle cx="61" cy="51" r="3.3" fill="#26323a"/>
  <circle cx="39.4" cy="49.2" r="1.3" fill="#fff"/>
  <circle cx="59.4" cy="49.2" r="1.3" fill="#fff"/>
  <circle cx="31" cy="61" r="4.3" fill="#ff7fb6" opacity=".5"/>
  <circle cx="69" cy="61" r="4.3" fill="#ff7fb6" opacity=".5"/>
  <path d="M43 60 Q50 67 57 60" stroke="#26323a" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;

function sdPieceSVG(shape) {
  const s = SHAPEDROP_SHAPES[shape];
  return `<svg viewBox="0 0 100 100" class="sd-piece-svg" aria-hidden="true">
    ${sdBase(shape, s.color)}
    <ellipse cx="42" cy="34" rx="16" ry="9" fill="${s.light}" opacity=".5"/>
    ${SD_FACE}
  </svg>`;
}

function sdHoleSVG(shape) {
  return `<svg viewBox="0 0 100 100" class="sd-hole-svg" aria-hidden="true">
    ${sdBase(shape, "#3a2817")}
    <g transform="translate(0,2)">${sdBase(shape, "rgba(0,0,0,.28)")}</g>
  </svg>`;
}

const SD_IDLE = 4500;     // how long she can pause before the toy offers a gentle nudge
const SD_DEMO_GAP = 1500; // once it is demonstrating, the pace it carries her through

const shapedropLevel = {
  theme: "theme-shapedrop", rounds: 4,
  startRound() {
    this.clearIdle();
    this.clearArrow();
    this.mistakes = 0;
    this.placed = 0;
    this.nudged = false;
    this.demoing = false;
    const tier = state.tier;
    this.sizeMatters = tier === 2;

    // Each round is a set of {shape, size} specs; a hole and a piece are made per spec.
    let specs;
    if (tier === 0) {
      specs = ["circle", "square", "triangle"].map(shape => ({ shape, size: "big" }));
    } else if (tier === 1) {
      specs = shuffle(Object.keys(SHAPEDROP_SHAPES)).slice(0, 4).map(shape => ({ shape, size: "big" }));
    } else {
      specs = [];
      shuffle(Object.keys(SHAPEDROP_SHAPES)).slice(0, 2).forEach(shape => {
        specs.push({ shape, size: "big" });
        specs.push({ shape, size: "small" });
      });
    }
    this.total = specs.length;

    setInstruction("🧩 " + t("shapedrop_show"), t("shapedrop_say"));
    $("playArea").innerHTML =
      scene.html("cozy", { seed: 11 + state.round * 5, layers: ["canopy", "far", "drift", "mid", "motes"] }) +
      `<div class="sd-stage"><div class="sd-board" id="sdBoard"></div><div class="sd-tray" id="sdTray"></div></div>`;

    // Holes and pieces are shuffled independently so a piece is never simply below its hole.
    this.holes = [];
    shuffle(specs).forEach(sp => {
      const h = document.createElement("div");
      h.className = "sd-hole sd-" + sp.size;
      h.dataset.shape = sp.shape; h.dataset.size = sp.size;
      h.innerHTML = sdHoleSVG(sp.shape);
      $("sdBoard").appendChild(h);
      this.holes.push(h);
    });
    this.pieces = [];
    shuffle(specs).forEach(sp => {
      const b = document.createElement("button");
      b.className = "sd-piece sd-" + sp.size;
      b.dataset.shape = sp.shape; b.dataset.size = sp.size;
      b.setAttribute("aria-label", t("sd_" + sp.shape));
      b.innerHTML = sdPieceSVG(sp.shape);
      makeDraggable(b, (el, ev, info) => this.release(el, ev, info));
      $("sdTray").appendChild(b);
      this.pieces.push(b);
    });

    this.scheduleIdle();
  },

  release(piece, ev, info) {
    if (state.busy) { info.reset(); return; }
    const c = centerOf(piece);
    const hole = this.holes.find(h => !h.classList.contains("sd-filled") && inside(c, h));
    if (!hole) { info.reset(); return; }          // dropped in open space — no penalty, no fuss
    const fits = hole.dataset.shape === piece.dataset.shape &&
                 (!this.sizeMatters || hole.dataset.size === piece.dataset.size);
    if (fits) {
      this.place(piece, hole, ev);
    } else {
      info.reset(); sfx.bad(); wiggle(piece);
      this.mistakes++;
      this.hintLadder(piece);
      speak(t("shapedrop_try", { shape: t("sd_" + piece.dataset.shape) }));
    }
  },

  // Settle a piece into its hole — the one path both a real drop and the demo use.
  place(piece, hole, ev) {
    piece.classList.add("on-plate", "sd-home");
    piece.style.position = "static";
    piece.style.left = piece.style.top = piece.style.zIndex = piece.style.transform = piece.style.transition = "";
    hole.classList.add("sd-filled");
    hole.classList.remove("sd-hint");
    hole.appendChild(piece);
    this.clearArrow();
    sfx.tap();
    const cc = centerOf(hole);
    miniStar(ev ? ev.clientX : cc.x, ev ? ev.clientY : cc.y);
    floaters(["✨"], cc.x, cc.y, 3);
    speak(t("shapedrop_in", { shape: t("sd_" + piece.dataset.shape) }));
    this.placed++;
    this.clearIdle();
    if (this.placed >= this.total) {
      speak(praise());
      roundComplete();
    } else {
      this.scheduleIdle();
    }
  },

  // Guided assist on misses: light the right hole on the 2nd, point a hand on the 3rd.
  hintLadder(piece) {
    const target = this.holeFor(piece);
    if (!target) return;
    if (this.mistakes === 2) {
      target.classList.add("sd-hint");
    } else if (this.mistakes >= 3) {
      target.classList.add("sd-hint");
      wiggle(target);
      this.pointTo(target);
    }
  },

  holeFor(piece) {
    return this.holes.find(h => !h.classList.contains("sd-filled") &&
      h.dataset.shape === piece.dataset.shape &&
      (!this.sizeMatters || h.dataset.size === piece.dataset.size));
  },

  firstUnplaced() {
    return this.pieces.find(p => p.isConnected && !p.classList.contains("on-plate"));
  },

  pointTo(hole) {
    this.clearArrow();
    const board = $("sdBoard");
    if (!board || !hole) return;
    const a = document.createElement("div");
    a.className = "sd-arrow"; a.textContent = "👇";
    board.appendChild(a);
    const br = board.getBoundingClientRect(), hr = hole.getBoundingClientRect();
    a.style.left = (hr.left + hr.width / 2 - br.left) + "px";
    a.style.top = (hr.top - br.top) + "px";
    this.arrow = a;
  },

  clearArrow() { if (this.arrow) { this.arrow.remove(); this.arrow = null; } },
  clearIdle() {
    if (this.idleTimer) { clearTimeout(this.idleTimer); core.timers.delete(this.idleTimer); this.idleTimer = null; }
  },
  scheduleIdle() {
    this.clearIdle();
    this.idleTimer = core.wait(() => this.onIdle(), this.demoing ? SD_DEMO_GAP : SD_IDLE);
  },

  // Nobody has moved. First time, nudge; if she is still stalled, the toy shows her,
  // then keeps going so she is never stranded in front of a round she can't finish.
  onIdle() {
    if (state.busy) { this.scheduleIdle(); return; }
    const piece = this.firstUnplaced();
    if (!piece) return;
    const target = this.holeFor(piece);
    if (!this.nudged) {
      this.nudged = true;
      if (target) { target.classList.add("sd-hint"); this.pointTo(target); }
      piece.classList.add("sd-bounce");
      speak(t("shapedrop_help", { shape: t("sd_" + piece.dataset.shape) }));
      this.scheduleIdle();
    } else {
      this.demoing = true;
      this.demoPlace(piece, target);
    }
  },

  demoPlace(piece, hole) {
    if (!piece || !hole) return;
    state.busy = true;
    piece.classList.remove("sd-bounce");
    speak(t("shapedrop_demo", { shape: t("sd_" + piece.dataset.shape) }));
    const pr = piece.getBoundingClientRect(), hr = hole.getBoundingClientRect();
    const dx = (hr.left + hr.width / 2) - (pr.left + pr.width / 2);
    const dy = (hr.top + hr.height / 2) - (pr.top + pr.height / 2);
    const slow = !reducedMotion();
    if (slow) {
      piece.style.zIndex = 60;
      piece.style.transition = "transform .6s ease";
      piece.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    core.wait(() => {
      state.busy = false;
      this.place(piece, hole, null);   // place() reschedules the idle timer or completes
    }, slow ? 640 : 60);
  },
};

registerGame({
  id: "shapedrop", world: "brain", icon: "🧩",
  name: "Shape Drop", es: "Encaja la Figura", yue: "放形狀",
  lvl: 1, v: 55, cue: "wood", level: shapedropLevel,
});
