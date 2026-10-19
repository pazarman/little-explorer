"use strict";
/* LEVEL: Shape Drop
   STEM objective · Spatial reasoning · spatial fitting (form — and at tier 2, size — determines fit) · age 2–4.
   Success = child drags a shape piece to the matching cutout "home" in a themed scene and feels it click into
   place; higher tiers add a same-shape decoy hole, then a second size, so she must attend to form AND size and
   learn to try-before-giving-up. No reading, no fail state — a passive or stuck child is guided in and always
   finishes the round.

   NOTE (audio): this project ships no audio files, so the voice names whole shape words ("circle", "square")
   with warm emphasis — it never voices an isolated phoneme. */

// Per-game i18n (same inline pattern as Letter Lights): no global DICT edits.
const sdL = obj => obj[curLang()] || obj.en;

// A friendly face — white eye + dark pupil + the mandatory white highlight dot, rosy cheeks, a little smile.
// Centered on (cx, cy); s scales it for smaller shapes. (Art guide: eyes must be alive.)
function sdFace(cx, cy, s = 1) {
  return `<g pointer-events="none">
    <ellipse cx="${cx - 11 * s}" cy="${cy}" rx="${6.6 * s}" ry="${8.2 * s}" fill="#fff"/>
    <ellipse cx="${cx + 11 * s}" cy="${cy}" rx="${6.6 * s}" ry="${8.2 * s}" fill="#fff"/>
    <circle cx="${cx - 10 * s}" cy="${cy + 1.6 * s}" r="${3.5 * s}" fill="#3a2b1a"/>
    <circle cx="${cx + 12 * s}" cy="${cy + 1.6 * s}" r="${3.5 * s}" fill="#3a2b1a"/>
    <circle cx="${cx - 11.4 * s}" cy="${cy - 0.6 * s}" r="${1.3 * s}" fill="#fff"/>
    <circle cx="${cx + 10.6 * s}" cy="${cy - 0.6 * s}" r="${1.3 * s}" fill="#fff"/>
    <circle cx="${cx - 18 * s}" cy="${cy + 8.5 * s}" r="${4.8 * s}" fill="#ff7fb6" opacity=".5"/>
    <circle cx="${cx + 18 * s}" cy="${cy + 8.5 * s}" r="${4.8 * s}" fill="#ff7fb6" opacity=".5"/>
    <path d="M${cx - 7 * s} ${cy + 10 * s} Q${cx} ${cy + 16 * s} ${cx + 7 * s} ${cy + 10 * s}"
      stroke="#c74268" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round"/>
  </g>`;
}

// Each shape: a saturated body (el() draws the outline with the attrs you pass), its face position, a name per
// language, and a little fit-flourish spoken when it clicks home.
const SD_SHAPES = {
  circle: {
    color: "#ff8a3d", fy: 48, fs: 1,
    name: { en: "circle", es: "círculo", yue: "圓形" },
    fit: { en: "A circle! It rolled right in!", es: "¡Un círculo! ¡Rodó justo adentro!", yue: "圓形！轆正入去！" },
    el: a => `<circle cx="50" cy="50" r="42" ${a}/>`
  },
  square: {
    color: "#4fc3f7", fy: 50, fs: 1,
    name: { en: "square", es: "cuadrado", yue: "正方形" },
    fit: { en: "A square! It snapped right in!", es: "¡Un cuadrado! ¡Entró perfecto!", yue: "正方形！啱啱好入到去！" },
    el: a => `<rect x="10" y="10" width="80" height="80" rx="15" ${a}/>`
  },
  triangle: {
    color: "#66bb6a", fy: 64, fs: .92,
    name: { en: "triangle", es: "triángulo", yue: "三角形" },
    fit: { en: "A triangle! It fits just right!", es: "¡Un triángulo! ¡Encaja perfecto!", yue: "三角形！啱啱好！" },
    el: a => `<path d="M50 12 L87 80 Q90 88 82 88 L18 88 Q10 88 13 80 Z" stroke-linejoin="round" ${a}/>`
  },
  star: {
    color: "#ffd54f", fy: 52, fs: .82,
    name: { en: "star", es: "estrella", yue: "星形" },
    fit: { en: "A star! It fits just right!", es: "¡Una estrella! ¡Encaja perfecto!", yue: "星形！啱啱好！" },
    el: a => `<path d="M50 8 L60.6 35.4 L89.9 37 L67.1 55.6 L74.7 84 L50 68 L25.3 84 L32.9 55.6 L10.1 37 L39.4 35.4 Z" stroke-linejoin="round" ${a}/>`
  },
  heart: {
    color: "#ff6f91", fy: 46, fs: .9,
    name: { en: "heart", es: "corazón", yue: "心形" },
    fit: { en: "A heart! It fits just right!", es: "¡Un corazón! ¡Encaja perfecto!", yue: "心形！啱啱好！" },
    el: a => `<path d="M50 86 C18 60 10 40 24 28 C34 19 46 24 50 34 C54 24 66 19 76 28 C90 40 82 60 50 86 Z" stroke-linejoin="round" ${a}/>`
  }
};

// A finished piece: saturated body + alive face. A hole: the same outline sunk into the board (soft recess fill
// + a dashed "put-it-here" outline), so she can SEE where every shape belongs before she tries.
function sdPieceSVG(shape) {
  const d = SD_SHAPES[shape];
  return `<svg viewBox="0 0 100 100" width="100%" height="100%">${d.el(`fill="${d.color}"`)}${sdFace(50, d.fy, d.fs)}</svg>`;
}
function sdHoleSVG(shape) {
  const d = SD_SHAPES[shape];
  return `<svg viewBox="0 0 100 100" width="100%" height="100%">${d.el('fill="rgba(42,30,18,.16)" stroke="#8a6d49" stroke-width="3" stroke-dasharray="7 6"')}</svg>`;
}

// px sizes per fit-size. Pieces are a touch smaller than their holes so the drop reads as "in". All ≥ 60px
// (drag targets) → comfortably past the 44px floor.
const SD_HOLE = { l: "clamp(96px,23vmin,138px)", m: "clamp(90px,21vmin,128px)", s: "clamp(78px,16vmin,102px)" };
const SD_PIECE = { l: "clamp(80px,19vmin,116px)", m: "clamp(74px,17vmin,106px)", s: "clamp(64px,13vmin,84px)" };

const shapedropLevel = {
  theme: "theme-shapedrop", rounds: 5,

  // Build the round's pieces. Each spec is one {shape, size} with a 1:1 matching hole.
  specsFor(tier) {
    const base = Object.keys(SD_SHAPES);
    if (tier === 0) {                                   // 3 distinct shapes, obvious 1:1, single size
      return shuffle(base).slice(0, 3).map(s => ({ shape: s, size: "m" }));
    }
    if (tier === 1) {                                   // 4 pieces incl. a same-shape decoy hole → match carefully
      const pick = shuffle(base).slice(0, 3);
      const specs = pick.map(s => ({ shape: s, size: "m" }));
      specs.push({ shape: pick[0], size: "m" });
      return shuffle(specs);
    }
    const pick = shuffle(base).slice(0, 2);             // tier 2: 2 shapes × 2 sizes → form AND size must match
    const specs = [];
    pick.forEach(s => { specs.push({ shape: s, size: "l" }); specs.push({ shape: s, size: "s" }); });
    return shuffle(specs);
  },

  startRound() {
    this.done = false;
    this.mistakes = 0;
    this.remaining = 0;
    this.idleSeq = (this.idleSeq || 0) + 1;             // guards idle timers against stale rounds/progress

    const tier = state.tier;
    const specs = this.specsFor(tier);
    this.remaining = specs.length;

    setInstruction(
      "🧩 " + sdL({ en: "Shape Drop", es: "Encaja la Figura", yue: "放形狀" }),
      sdL({
        en: "Drag each shape into the hole that fits it!",
        es: "¡Arrastra cada figura al hueco que le queda!",
        yue: "將每個形狀拖去啱佢嘅窿度！"
      })
    );

    // Holes keep spec order so the board reads left-to-right; pieces are shuffled in the tray.
    const holeHtml = specs.map((sp, i) =>
      `<div class="sd-hole" data-i="${i}" style="width:${SD_HOLE[sp.size]};height:${SD_HOLE[sp.size]}">${sdHoleSVG(sp.shape)}</div>`
    ).join("");
    const pieceHtml = shuffle(specs.map((sp, i) => ({ sp, i })))
      .map(({ sp, i }) =>
        `<button class="sd-piece" data-i="${i}" data-shape="${sp.shape}" data-size="${sp.size}"
          aria-label="${sdL(SD_SHAPES[sp.shape].name)}"
          style="width:${SD_PIECE[sp.size]};height:${SD_PIECE[sp.size]}">${sdPieceSVG(sp.shape)}</button>`
      ).join("");

    $("playArea").innerHTML =
      scene.html("cozy", { seed: 21 + state.round * 4, layers: ["canopy", "far", "drift", "mid", "motes"] }) + `
      <style>
        .sd-stage{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;
          justify-content:center;gap:clamp(14px,4.5vmin,40px);padding:2.5vmin}
        .sd-board,.sd-tray{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;
          gap:clamp(10px,3.4vmin,30px);max-width:min(94vw,780px)}
        .sd-board{padding:clamp(10px,2.6vmin,22px) clamp(14px,3.4vmin,30px);border-radius:28px;
          background:rgba(255,255,255,.34);box-shadow:inset 0 3px 10px rgba(0,0,0,.12)}
        .sd-hole{display:flex;align-items:center;justify-content:center;border-radius:18px;
          transition:transform .15s,filter .15s}
        .sd-hole.sd-hint{animation:sdHoleGlow 1s ease-in-out infinite}
        @keyframes sdHoleGlow{0%,100%{transform:scale(1);filter:drop-shadow(0 0 0 rgba(255,214,77,0))}
          50%{transform:scale(1.08);filter:drop-shadow(0 0 10px rgba(255,214,77,.85))}}
        .sd-hole.sd-filled{filter:none}
        .sd-piece{border:none;background:none;padding:0;cursor:grab;touch-action:none;position:relative;
          min-width:60px;min-height:60px;filter:drop-shadow(0 5px 6px rgba(0,0,0,.22));transition:transform .14s}
        .sd-piece:active{cursor:grabbing}
        .sd-piece.sd-placed{cursor:default;filter:drop-shadow(0 2px 3px rgba(0,0,0,.2))}
        .sd-piece.sd-pop{animation:sdPop .45s ease}
        @keyframes sdPop{0%{transform:scale(1)}45%{transform:scale(1.16)}100%{transform:scale(1)}}
        .sd-tray{min-height:clamp(70px,16vmin,110px)}
        @media(prefers-reduced-motion:reduce){
          .sd-hole.sd-hint{animation:none;filter:drop-shadow(0 0 8px rgba(255,214,77,.9))}
          .sd-piece.sd-pop{animation:none}
          .sd-hole,.sd-piece{transition:none}
        }
      </style>
      <div class="sd-stage" id="sdStage">
        <div class="sd-board" id="sdBoard">${holeHtml}</div>
        <div class="sd-tray" id="sdTray">${pieceHtml}</div>
      </div>`;

    this.holes = [...$("sdBoard").querySelectorAll(".sd-hole")].map((el, i) =>
      ({ el, shape: specs[i].shape, size: specs[i].size, filled: false }));
    this.pieces = [...$("sdTray").querySelectorAll(".sd-piece")];
    this.pieces.forEach(p => makeDraggable(p, (el, ev, info) => this.release(el, ev, info)));

    this.armIdle(this.idleSeq);
  },

  // The matching unfilled hole for a piece: same shape, and (tier 2) same size.
  holeFor(shape, size) {
    return this.holes.find(h => !h.filled && h.shape === shape && (state.tier < 2 || h.size === size));
  },

  release(el, ev, info) {
    if (this.done || state.busy || el.classList.contains("sd-placed")) { info.reset(); return; }
    const c = centerOf(el);
    const hole = this.holes.find(h => !h.filled && inside(c, h.el));
    if (hole && hole.shape === el.dataset.shape && (state.tier < 2 || hole.size === el.dataset.size)) {
      info.reset();
      this.place(el, hole, false);
    } else if (hole) {                       // dropped on a hole that doesn't fit → a real try, gently corrected
      this.mistakes++;
      info.reset(); sfx.bad(); wiggle(el);
      speak(sdL({ en: "Not that one — try another spot!", es: "Ese no — ¡prueba otro lugar!", yue: "唔係嗰個 — 試下第二度！" }));
      if (this.mistakes === 2) this.pointTo(el);          // guided assist around the 2nd–3rd miss
      else if (this.mistakes >= 3) core.wait(() => this.guideOne(el), 650);
    } else {
      info.reset();                          // dropped on empty space: no penalty, just float back (calm path)
    }
  },

  // Snap a piece home: nest it in its hole, celebrate, advance. A fresh idle ladder is armed after a manual
  // placement so a slow-but-progressing child is never force-completed; an auto placement keeps the cascade.
  place(piece, hole, auto) {
    hole.filled = true;
    hole.el.classList.add("sd-filled"); hole.el.classList.remove("sd-hint");
    piece.classList.add("sd-placed", "on-plate", "sd-pop");
    piece.style.position = "absolute"; piece.style.left = "50%"; piece.style.top = "50%";
    piece.style.transform = "translate(-50%,-50%)"; piece.style.width = piece.style.height = "90%";
    piece.style.zIndex = "";
    hole.el.appendChild(piece);
    const c = centerOf(hole.el);
    sfx.tap(); miniStar(c.x, c.y); floaters(["✨"], c.x, c.y, 3);
    this.remaining--;

    if (this.remaining <= 0) {
      this.done = true;
      speak(sdL(SD_SHAPES[hole.shape].fit) + " " + praise());
      roundComplete();
    } else {
      speak(sdL(SD_SHAPES[hole.shape].fit));
      if (auto) { core.wait(() => this.guidedReveal(this.idleSeq), 850); }
      else { this.idleSeq++; this.armIdle(this.idleSeq); }    // reset the idle clock on real progress
    }
  },

  // Highlight the right home for a piece (used by the 2nd-miss assist and the idle ladder).
  pointTo(piece) {
    const hole = this.holeFor(piece.dataset.shape, piece.dataset.size);
    if (hole) { hole.el.classList.add("sd-hint"); }
    wiggle(piece);
  },

  // Finish the job for a stuck child: glow the home, then drop the piece in for her. Never a fail.
  guideOne(piece) {
    if (this.done) return;
    const hole = this.holeFor(piece.dataset.shape, piece.dataset.size);
    if (!hole) return;
    hole.el.classList.add("sd-hint");
    speak(sdL({ en: "Here it goes!", es: "¡Aquí va!", yue: "放呢度！" }));
    core.wait(() => { if (!this.done) this.place(piece, hole, true); }, 650);
  },

  // Idle-assist ladder — a passive child who never drags is nudged, then shown, then gently completed.
  armIdle(seq) {
    const live = () => this.idleSeq === seq && !this.done && state.level === "shapedrop" && !state.busy;
    const firstPiece = () => this.pieces.find(p => !p.classList.contains("sd-placed"));
    core.wait(() => { if (live()) { const p = firstPiece(); if (p) wiggle(p); speak(sdL({
      en: "Pick a shape and find its home!", es: "¡Toma una figura y busca su hueco!", yue: "揀個形狀，搵佢嘅窿！" })); } }, 6500);
    core.wait(() => { if (live()) { const p = firstPiece(); if (p) this.pointTo(p); } }, 12000);
    core.wait(() => { if (live()) { const p = firstPiece(); if (p) this.guideOne(p); } }, 17500);
  },

  // Auto-cascade the rest home once a guided placement starts (keeps completing without re-arming the ladder).
  guidedReveal(seq) {
    if (this.idleSeq !== seq || this.done) return;
    const p = this.pieces.find(x => !x.classList.contains("sd-placed"));
    if (!p) return;
    this.guideOne(p);
  }
};

registerGame({
  id: "shapedrop", world: "shape", icon: "🧩", name: "Shape Drop", es: "Encaja la Figura",
  yue: "放形狀", lvl: 0, v: 55, cue: "wood", level: shapedropLevel
});
