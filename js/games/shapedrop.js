"use strict";
// STEM: Spatial reasoning · spatial fitting — match a shape piece to its matching cutout
// hole (form, and at tier 2 form + size) · age 2–4. Success = child drags each friendly
// shape piece into the hole it belongs in, discovering that FORM (and size) determine fit.

// ---- Drawn SVG shape friends (viewBox 100x100) -----------------------------------------
// Chunky, saturated, round-cornered (fill + matching thick round stroke rounds the tips).
// Each wears a face so she's helping a little friend find its home, not solving a test.
// Shape — not colour — is the answer, so pieces may share hues; every piece keeps a face.
const SD_FILL = {
  circle:   { base: "#ff7a4d", lite: "#ffa877" },
  square:   { base: "#4d9be6", lite: "#86c2f3" },
  triangle: { base: "#45c96b", lite: "#86e0a0" },
  star:     { base: "#ffc23d", lite: "#ffe08a" },
  heart:    { base: "#ef5da8", lite: "#ff93c8" },
  diamond:  { base: "#a06be0", lite: "#c6a2f0" },
};
// where the face sits inside each silhouette, and how big
const SD_FACE = {
  circle: [50, 48, 1], square: [50, 50, 1], triangle: [50, 62, .82],
  star: [50, 54, .72], heart: [50, 52, .9], diamond: [50, 52, .82],
};
// silhouette path (everything but circle/square is a polygon rounded by a thick same-colour stroke)
function sdSilhouette(shape, fill) {
  if (shape === "circle") return `<circle cx="50" cy="50" r="40" fill="${fill}"/>`;
  if (shape === "square") return `<rect x="12" y="12" width="76" height="76" rx="16" fill="${fill}"/>`;
  const d = {
    triangle: "M50 22 L80 78 L20 78 Z",
    star:     "M50 16 L61 40 L87 41 L66 58 L74 84 L50 69 L26 84 L34 58 L13 41 L39 40 Z",
    heart:    "M50 82 C20 60 22 30 42 30 C50 30 50 38 50 42 C50 38 50 30 58 30 C78 30 80 60 50 82 Z",
    diamond:  "M50 14 L84 50 L50 86 L16 50 Z",
  }[shape];
  return `<path d="${d}" fill="${fill}" stroke="${fill}" stroke-width="13" stroke-linejoin="round"/>`;
}
function sdFace() {
  return `<g opacity=".95">
    <circle cx="-10" cy="-4" r="5.2" fill="#fff"/><circle cx="10" cy="-4" r="5.2" fill="#fff"/>
    <circle cx="-9.4" cy="-3" r="2.8" fill="#28324a"/><circle cx="10.6" cy="-3" r="2.8" fill="#28324a"/>
    <circle cx="-10.6" cy="-4.6" r="1.1" fill="#fff"/><circle cx="9.4" cy="-4.6" r="1.1" fill="#fff"/>
    <circle cx="-16" cy="6" r="4.6" fill="#ff7fb6" opacity=".5"/><circle cx="16" cy="6" r="4.6" fill="#ff7fb6" opacity=".5"/>
    <path d="M-7 6 Q0 13 7 6" stroke="#28324a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  </g>`;
}
function sdPieceSVG(shape) {
  const c = SD_FILL[shape] || SD_FILL.circle;
  const [fx, fy, fs] = SD_FACE[shape];
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" style="overflow:visible">
    ${sdSilhouette(shape, c.base)}
    <ellipse cx="50" cy="34" rx="26" ry="15" fill="${c.lite}" opacity=".55"/>
    <g transform="translate(${fx} ${fy}) scale(${fs})">${sdFace()}</g>
  </svg>`;
}
// the empty slot: the same silhouette as a dashed, recessed cut-out
function sdHoleSVG(shape) {
  const inner = shape === "circle"
    ? `<circle cx="50" cy="50" r="39" fill="rgba(0,0,0,.13)" stroke="rgba(0,0,0,.30)" stroke-width="4" stroke-dasharray="7 7"/>`
    : shape === "square"
      ? `<rect x="13" y="13" width="74" height="74" rx="15" fill="rgba(0,0,0,.13)" stroke="rgba(0,0,0,.30)" stroke-width="4" stroke-dasharray="7 7"/>`
      : (() => {
          const m = sdSilhouette(shape, "rgba(0,0,0,.13)");
          // reuse the silhouette path but draw it as a dashed outline
          return m.replace('stroke-width="13"', 'stroke="rgba(0,0,0,.30)" stroke-width="4" stroke-dasharray="7 7"')
                  .replace(/stroke="rgba\(0,0,0,\.13\)" /, "");
        })();
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" style="overflow:visible">${inner}</svg>`;
}

// ---- strings (inline, EN / ES-Panamanian / YUE) ----------------------------------------
const sdL = o => o[curLang()] || o.en;
const SD_TXT = {
  show:  { en: "🧩 Find each shape's home!", es: "🧩 ¡Busca la casa de cada figura!", yue: "🧩 搵每個形狀嘅屋企！" },
  say:   { en: "Drag each shape to the hole that fits!", es: "¡Arrastra cada figura al hueco que le queda!", yue: "拖每個形狀去啱嘅窿度！" },
  say2:  { en: "Match the shape AND the size!", es: "¡Une la figura Y el tamaño!", yue: "形狀同大細都要啱！" },
  wrong: { en: "Hmm, try another spot!", es: "¡Mmm, prueba otro lugar!", yue: "唔係度，試下第二度！" },
  help:  { en: "This shape goes here!", es: "¡Esta figura va aquí!", yue: "呢個形狀放呢度！" },
};
const SD_SHAPE = {
  circle:   { en: "circle",   es: "círculo",   yue: "圓形",   esf: false },
  square:   { en: "square",   es: "cuadrado",  yue: "正方形", esf: false },
  triangle: { en: "triangle", es: "triángulo", yue: "三角形", esf: false },
  star:     { en: "star",     es: "estrella",  yue: "星形",   esf: true  },
  heart:    { en: "heart",    es: "corazón",   yue: "心形",   esf: false },
  diamond:  { en: "diamond",  es: "rombo",     yue: "菱形",   esf: false },
};
const SD_SIZE = { big: { en: "Big", es: "grande", yue: "大" }, small: { en: "Small", es: "pequeño", yue: "細" } };
const sdCap = s => s.charAt(0).toUpperCase() + s.slice(1);
// "It fit right in!" spoken when a shape lands home — names the shape (and size at tier 2)
function sdFitLine(shape, size) {
  const l = curLang(), sh = SD_SHAPE[shape], nm = sh[l] || sh.en;
  if (l === "es") {
    const art = sh.esf ? "La" : "El";
    const szw = size ? (size === "big" ? "grande" : (sh.esf ? "pequeña" : "pequeño")) : "";
    return `¡${art} ${nm}${szw ? " " + szw : ""}! ¡Adentro va!`;
  }
  if (l === "yue") return `${size ? SD_SIZE[size].yue : ""}${nm}！啱啱好！`;
  const szw = size ? SD_SIZE[size].en + " " : "";
  return `${sdCap(szw + nm)}! It fit right in!`;
}

const SHAPES_BASE = ["circle", "square", "triangle"];
const SHAPES_MORE = ["circle", "square", "triangle", "star", "heart", "diamond"];

const shapedropLevel = {
  theme: "theme-shapes", rounds: 4,
  // Build the pieces/holes for this round from the tier.
  plan() {
    const tier = state.tier;
    if (tier === 2) {
      // form AND size: one shape in both sizes (so size disambiguates), plus a second shape
      const [a, b] = shuffle(SHAPES_MORE).slice(0, 2);
      return shuffle([
        { shape: a, size: "big" },
        { shape: a, size: "small" },
        { shape: b, size: Math.random() < .5 ? "big" : "small" },
      ]);
    }
    const n = tier === 1 ? 4 : 3;
    const pool = tier === 1 ? SHAPES_MORE : SHAPES_BASE;
    return shuffle(shuffle(pool).slice(0, n).map(shape => ({ shape, size: "" })));
  },
  startRound() {
    this.misses = 0;
    this.reduced = reducedMotion();
    const specs = this.plan();
    this.remaining = specs.length;
    const sized = state.tier === 2;

    setInstruction(sdL(SD_TXT.show), sized ? sdL(SD_TXT.say2) : sdL(SD_TXT.say));

    const key = s => s.shape + "|" + s.size;
    const holes = shuffle(specs).map((s, i) =>
      `<div class="sd-hole ${s.size}" data-key="${key(s)}" data-shape="${s.shape}" data-size="${s.size}" id="sdHole${i}">${sdHoleSVG(s.shape)}</div>`
    ).join("");
    const tray = specs.map((s, i) =>
      `<button class="sd-piece ${s.size} ${this.reduced ? "" : "sd-bob"}" data-key="${key(s)}" data-shape="${s.shape}" data-size="${s.size}"
               aria-label="${(SD_SHAPE[s.shape][curLang()] || SD_SHAPE[s.shape].en)}" style="animation-delay:${i * 0.25}s" id="sdPiece${i}">${sdPieceSVG(s.shape)}</button>`
    ).join("");

    $("playArea").innerHTML =
      scene.html("meadow", { seed: 12 + state.round * 7, layers: ["canopy", "far", "drift", "motes", "frame"] }) +
      `<style>
        .sd-stage{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;
                  justify-content:space-between;padding:clamp(6px,2.2vmin,18px);gap:clamp(6px,2vmin,16px)}
        .sd-board{flex:1;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;
                  gap:clamp(10px,3.5vmin,30px);align-items:center}
        /* no filter/transform/backdrop-filter on the tray or any ancestor of a piece:
           makeDraggable drags with position:fixed, and an ancestor filter would make
           "fixed" resolve against the tray instead of the viewport and the piece would jump */
        /* min-height keeps the tray from collapsing as pieces leave it, so the board above
           doesn't jump when she lifts the last piece */
        .sd-tray{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;
                 gap:clamp(8px,3vmin,26px);background:rgba(255,255,255,.38);border-radius:clamp(14px,4vmin,28px);
                 padding:clamp(8px,2.4vmin,18px);min-height:clamp(96px,26vmin,160px)}
        .sd-hole,.sd-piece{width:clamp(72px,19vmin,120px);height:clamp(72px,19vmin,120px);
                           flex:0 0 auto;display:block;position:relative}
        .sd-hole.big,.sd-piece.big{width:clamp(86px,23vmin,140px);height:clamp(86px,23vmin,140px)}
        .sd-hole.small,.sd-piece.small{width:clamp(58px,15vmin,94px);height:clamp(58px,15vmin,94px)}
        .sd-piece{border:0;background:none;padding:0;cursor:grab;touch-action:none;
                  filter:drop-shadow(0 5px 6px rgba(40,60,90,.28));transition:transform .12s ease}
        .sd-piece:active{cursor:grabbing}
        .sd-piece.on-plate{cursor:default;filter:drop-shadow(0 3px 4px rgba(40,60,90,.22));animation:none}
        .sd-hole{border-radius:16px}
        .sd-hole.sd-filled{filter:drop-shadow(0 3px 5px rgba(40,60,90,.22))}
        .sd-hole.sd-hint{animation:sdHint 1s ease-in-out infinite}
        .sd-hole.sd-hint-strong{animation:sdHintStrong .7s ease-in-out infinite}
        @keyframes sdBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .sd-bob{animation:sdBob 2.4s ease-in-out infinite}
        @keyframes sdHint{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes sdHintStrong{0%,100%{transform:scale(1);filter:drop-shadow(0 0 0 rgba(255,210,70,0))}
                                50%{transform:scale(1.14);filter:drop-shadow(0 0 14px rgba(255,210,70,.95))}}
        .sd-shake{animation:sdShake .4s}
        @keyframes sdShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
        @media (prefers-reduced-motion: reduce){
          .sd-bob,.sd-hole.sd-hint,.sd-hole.sd-hint-strong,.sd-shake{animation:none}
          .sd-hole.sd-hint-strong{filter:drop-shadow(0 0 12px rgba(255,210,70,.95))}
          .sd-hole.sd-hint{outline:3px dashed rgba(255,170,40,.9);outline-offset:3px}
        }
      </style>
      <div class="sd-stage">
        <div class="sd-board" id="sdBoard">${holes}</div>
        <div class="sd-tray" id="sdTray">${tray}</div>
      </div>`;

    $("sdTray").querySelectorAll(".sd-piece").forEach(el =>
      makeDraggable(el, (e, ev, info) => this.release(e, ev, info)));
  },

  correctHole(piece) {
    return [...document.querySelectorAll(".sd-hole")]
      .find(h => h.dataset.key === piece.dataset.key && !h.classList.contains("sd-filled"));
  },

  release(piece, ev, info) {
    if (state.busy || piece.classList.contains("on-plate")) { info.reset(); return; }
    const c = centerOf(piece);
    const open = [...document.querySelectorAll(".sd-hole")].filter(h => !h.classList.contains("sd-filled"));
    let over = open.find(h => inside(c, h));
    const want = this.correctHole(piece);
    const assist = this.misses >= 3;

    // after repeated misses, a loose drop near the right home still counts — rescue the stuck child
    if (!over && assist && want) {
      const w = centerOf(want), r = want.getBoundingClientRect();
      if (Math.hypot(c.x - w.x, c.y - w.y) < r.width * 1.1) over = want;
    }
    if (!over) { info.reset(); return; }                 // empty space: no home, no penalty

    if (over.dataset.key === piece.dataset.key) {
      this.place(piece, over, ev);
    } else {
      this.misses++;
      info.reset(); sfx.bad();
      piece.classList.remove("sd-shake"); void piece.offsetWidth; piece.classList.add("sd-shake");
      if (want) {
        want.classList.remove("sd-hint", "sd-hint-strong"); void want.offsetWidth;
        want.classList.add(this.misses >= 3 ? "sd-hint-strong" : "sd-hint");
      }
      speak(this.misses >= 3 ? sdL(SD_TXT.help) : sdL(SD_TXT.wrong));
    }
  },

  place(piece, hole, ev) {
    piece.classList.add("on-plate");
    hole.classList.add("sd-filled");
    hole.classList.remove("sd-hint", "sd-hint-strong");
    // seat the piece inside its home
    piece.style.position = "absolute";
    piece.style.left = piece.style.top = piece.style.zIndex = "";
    piece.style.inset = "0";
    piece.style.width = piece.style.height = "100%";
    piece.classList.remove("sd-bob");
    hole.innerHTML = "";
    hole.appendChild(piece);

    sfx.tap();
    const cx = (ev && ev.clientX) || centerOf(hole).x, cy = (ev && ev.clientY) || centerOf(hole).y;
    miniStar(cx, cy);
    if (!this.reduced) floaters(["✨", "⭐", "💫"], cx, cy, 4);
    speak(sdFitLine(piece.dataset.shape, piece.dataset.size));

    this.remaining--;
    if (this.remaining <= 0) { waitSpeech(() => { speak(praise()); roundComplete(); }, { min: 500, cap: 1600 }); }
  },
};

registerGame({
  id: "shapedrop", world: "shape", icon: "🧩",
  name: "Shape Drop", es: "Encaja Figuras", yue: "放形狀",
  lvl: 0, v: 55, cue: "wood", level: shapedropLevel,
});
