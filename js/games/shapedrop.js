"use strict";
/* LEVEL: Shape Drop (spatial fitting)
   STEM objective · Spatial reasoning · "simple fit" — place a shape piece into the matching
   cutout hole · age band 2–4 · Success = child drags each piece to the hole whose form (and,
   at tier 2, size) matches, discovering that FORM DETERMINES FIT through child-driven trial.

   Why a drag loop, not tap-and-wait: fitting is a motor act. The child picks a piece, tries it,
   and feels it click — the interaction IS the spatial-matching practice (BAR-CONFIG "Interaction
   & Game-Feel", ref Dolphin Dive). No fail state: a wrong spot just springs back, the right hole
   lights up by the 2nd miss, and by the 3rd — or after a quiet spell with no moves at all — the
   piece gently drops itself home so a passive or stuck child always moves forward. */

const SHD_COLORS = {
  circle:   { fill: "#ec5a52", light: "#ff8f87", stroke: "#bd382f" },
  square:   { fill: "#2f82d8", light: "#7cb4f0", stroke: "#1f5ea6" },
  triangle: { fill: "#3fae5c", light: "#82d89a", stroke: "#2a8143" },
  star:     { fill: "#f4b528", light: "#ffd977", stroke: "#cd8f10" },
};
// Eye height tuned per shape so the face sits on the shape's visual mass (triangle lower).
const SHD_EYE = { circle: 52, square: 50, triangle: 64, star: 54 };

// One geometry per shape, shared by the solid piece and the empty recess, so a hole and the
// piece that fills it are the exact same outline — the match is honest, not approximate.
function shdPrim(kind, attrs) {
  switch (kind) {
    case "circle":   return `<circle cx="50" cy="52" r="37" ${attrs}/>`;
    case "square":   return `<rect x="14" y="16" width="72" height="72" rx="14" ${attrs}/>`;
    case "triangle": return `<path d="M50 13 L88 83 L12 83 Z" stroke-linejoin="round" ${attrs}/>`;
    case "star":     return `<path d="M50 9 L61 38 L92 38 L67 57 L76 88 L50 69 L24 88 L33 57 L8 38 L39 38 Z" stroke-linejoin="round" ${attrs}/>`;
  }
  return "";
}
function shdFace(kind) {
  const y = SHD_EYE[kind];
  return `<g>
    <circle cx="41" cy="${y}" r="6.6" fill="#2a2a3a"/><circle cx="59" cy="${y}" r="6.6" fill="#2a2a3a"/>
    <circle cx="43.4" cy="${y - 2.4}" r="2.3" fill="#fff"/><circle cx="61.4" cy="${y - 2.4}" r="2.3" fill="#fff"/>
    <circle cx="31" cy="${y + 9}" r="5.2" fill="#ff7fb6" opacity=".5"/><circle cx="69" cy="${y + 9}" r="5.2" fill="#ff7fb6" opacity=".5"/>
    <path d="M42 ${y + 11} Q50 ${y + 18} 58 ${y + 11}" fill="none" stroke="#2a2a3a" stroke-width="3.6" stroke-linecap="round"/>
  </g>`;
}
function shdPieceSVG(kind) {
  const c = SHD_COLORS[kind];
  return `<svg viewBox="0 0 100 100" class="shd-svg">
    ${shdPrim(kind, `fill="${c.fill}" stroke="${c.stroke}" stroke-width="5"`)}
    <ellipse cx="40" cy="34" rx="13" ry="8" fill="${c.light}" opacity=".55"/>
    ${shdFace(kind)}
  </svg>`;
}
function shdHoleSVG(kind) {
  return `<svg viewBox="0 0 100 100" class="shd-svg">
    ${shdPrim(kind, `fill="rgba(58,40,24,.34)" stroke="rgba(255,255,255,.9)" stroke-width="4" stroke-dasharray="7 6"`)}
  </svg>`;
}

const SHD_IDLE_MS = 7000;   // a quiet spell with no move → start guiding
const SHD_DEMO_MS = 3400;   // still nothing → drop the next piece home ourselves

const shapedropLevel = {
  theme: "theme-shapedrop", rounds: 4,
  startRound() {
    this.mistakes = 0;
    this.idleT = null;
    const tier = state.tier;
    // tier 0 → 3 distinct shapes, 1:1. tier 1 → 4 pieces, one shape doubled (two matching holes,
    // so a shape must be matched by its form, not by elimination). tier 2 → form AND size.
    let pieces;
    if (tier === 0) {
      pieces = shuffle(["circle", "square", "triangle"]).map(s => ({ shape: s, size: "n" }));
    } else if (tier === 1) {
      const base = shuffle(["circle", "square", "triangle", "star"]).slice(0, 3);
      pieces = base.map(s => ({ shape: s, size: "n" }));
      pieces.push({ shape: rand(base), size: "n" });   // one shape appears twice
    } else {
      const two = shuffle(["circle", "square", "triangle", "star"]).slice(0, 2);
      pieces = [];
      two.forEach(s => { pieces.push({ shape: s, size: "big" }); pieces.push({ shape: s, size: "sm" }); });
    }

    setInstruction("🔷 " + t("shapedrop_show"), t("shapedrop_say"));
    $("playArea").innerHTML =
      // indoor, cozy "toy box" scenery; no ground band — the board + tray fill the floor
      scene.html("cozy", { seed: 51 + state.round * 4, layers: ["canopy", "far", "drift", "motes"] }) +
      `<div class="shd-stage">
         <div class="shd-board" id="shdBoard"></div>
         <div class="shd-tray" id="shdTray"></div>
       </div>`;

    const board = $("shdBoard"), tray = $("shdTray");
    // Holes follow the piece list (so every piece has a home) but in a shuffled order.
    shuffle(pieces).forEach(p => {
      const hole = document.createElement("div");
      hole.className = "shd-hole shd-empty" + (p.size === "sm" ? " sm" : p.size === "big" ? " big" : "");
      hole.dataset.shape = p.shape; hole.dataset.size = p.size;
      hole.innerHTML = shdHoleSVG(p.shape) + `<div class="shd-slot"></div>`;
      board.appendChild(hole);
    });
    this.remaining = pieces.length;
    shuffle(pieces).forEach(p => {
      const piece = document.createElement("button");
      piece.className = "shd-piece" + (p.size === "sm" ? " sm" : p.size === "big" ? " big" : "");
      piece.dataset.shape = p.shape; piece.dataset.size = p.size;
      piece.innerHTML = shdPieceSVG(p.shape);
      piece.setAttribute("aria-label", p.shape);
      makeDraggable(piece, (el, ev, info) => this.release(el, ev, info));
      tray.appendChild(piece);
    });
    this.armIdle();
  },

  holes() { return [...document.querySelectorAll("#shdBoard .shd-hole")]; },
  pieces() { return [...document.querySelectorAll("#shdTray .shd-piece")]; },
  fits(hole, piece) {
    if (hole.dataset.filled) return false;
    if (hole.dataset.shape !== piece.dataset.shape) return false;
    if (state.tier >= 2 && hole.dataset.size !== piece.dataset.size) return false;
    return true;
  },
  holeFor(piece) { return this.holes().find(h => this.fits(h, piece)) || null; },

  release(el, ev, info) {
    if (state.busy) { info.reset(); return; }
    const c = centerOf(el);
    const over = this.holes().find(h => inside(c, h));
    if (over && this.fits(over, el)) { this.place(el, over, ev); return; }
    // Dropped on a wrong/occupied hole = a gentle miss that escalates help. Dropped in open
    // space = no penalty, just springs back (the child is still exploring).
    info.reset();
    if (over) this.miss(el);
  },

  place(piece, hole, ev) {
    this.clearIdle();
    hole.dataset.filled = "1";
    hole.classList.remove("shd-empty", "shd-hint");
    this.holes().forEach(h => h.classList.remove("shd-hint"));
    piece.classList.add("on-plate", "shd-fit");
    piece.style.position = "static"; piece.style.left = piece.style.top = piece.style.zIndex = "";
    hole.querySelector(".shd-slot").appendChild(piece);
    sfx.tap(); tone(560, 0, .14, "sine", .14);
    miniStar(ev.clientX, ev.clientY);
    const cc = centerOf(hole); floaters(["✨"], cc.x, cc.y, 3);
    speak(t("shd_fit", { x: word(piece.dataset.shape) }));
    this.remaining--;
    if (this.remaining === 0) { speak(praise()); roundComplete(); }
    else this.armIdle();
  },

  miss(piece) {
    sfx.bad(); wiggle(piece);
    this.mistakes++;
    const hole = this.holeFor(piece);
    if (this.mistakes >= 3 && hole) {
      // Assist: by the 3rd miss, show the child exactly where it goes instead of asking again.
      state.busy = true;
      this.clearIdle();
      hole.classList.add("shd-hint");
      core.wait(() => { if (hole.isConnected && !hole.dataset.filled) this.demo(piece, hole); else state.busy = false; }, 650);
    } else {
      if (this.mistakes === 2 && hole) hole.classList.add("shd-hint");
      speak(t("shd_try", { x: word(piece.dataset.shape) }));
    }
  },

  // Nobody has moved in a while — guide, then (if still nothing) let the piece find its home.
  armIdle() {
    this.clearIdle();
    this.idleT = core.wait(() => this.idleHint(), SHD_IDLE_MS);
  },
  clearIdle() { if (this.idleT) { clearTimeout(this.idleT); core.timers.delete(this.idleT); this.idleT = null; } },
  idleHint() {
    if (state.busy || this.remaining === 0) return;
    const piece = this.pieces().find(p => !p.classList.contains("on-plate"));
    const hole = piece && this.holeFor(piece);
    if (!piece || !hole) return;
    hole.classList.add("shd-hint"); piece.classList.add("shd-wake");
    speak(t("shd_look", { x: word(piece.dataset.shape) }));
    this.idleT = core.wait(() => { if (!state.busy) this.demo(piece, hole); }, SHD_DEMO_MS);
  },
  demo(piece, hole) {
    piece.classList.remove("shd-wake");
    const r = hole.getBoundingClientRect();
    state.busy = false;   // place() manages flow; allow it to run cleanly
    this.place(piece, hole, { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
    if (this.remaining > 0) state.busy = false;
  }
};

registerGame({
  id: "shapedrop", world: "shape", icon: "🔷",
  name: "Shape Drop", es: "Encaja la Figura", yue: "放形狀",
  lvl: 0, v: 55, cue: "wood", level: shapedropLevel
});
