"use strict";
// STEM: Spatial reasoning · spatial fitting — place a shape piece into its matching cutout hole · age 2–4
// Success = child drags a shape (circle / square / triangle …) to the hole whose outline matches it and
// feels it click into place; at higher tiers she must match more shapes, then form AND size — building
// the idea that form (and size) determine fit, through forgiving trial-and-error with no fail state.

// This game keeps its strings inline (like Dolphin Dive / Day & Night) rather than in the core DICT.
const sdL = obj => obj[curLang()] || obj.en;

// Shape names + a size word, localized. Spanish puts the size adjective AFTER the noun
// ("círculo grande"), English and Cantonese before it ("big circle" / "大圓形").
const SD_NAME = {
  circle:   { en: "circle",   es: "círculo",   yue: "圓形" },
  square:   { en: "square",   es: "cuadrado",  yue: "正方形" },
  triangle: { en: "triangle", es: "triángulo", yue: "三角形" },
  star:     { en: "star",     es: "estrella",  yue: "星形" },
  heart:    { en: "heart",    es: "corazón",   yue: "心形" }
};
const SD_SIZE = {
  big:   { en: "big",   es: "grande",  yue: "大" },
  small: { en: "small", es: "pequeño", yue: "細" }
};
function sdPieceName(shape, size) {
  const lang = curLang();
  const nm = sdL(SD_NAME[shape]);
  if (!size) return nm;
  const sz = sdL(SD_SIZE[size]);
  if (lang === "es")  return `${nm} ${sz}`;   // círculo grande
  return `${sz}${lang === "yue" ? "" : " "}${nm}`;  // big circle / 大圓形
}

const SD_TXT = {
  show: { en: "🧩 Drop the shapes in!", es: "🧩 ¡Mete las figuras!", yue: "🧩 放啲形狀入窿！" },
  say:  { en: "Drag each shape to the hole that fits it!",
          es: "¡Arrastra cada figura al hueco que le queda!",
          yue: "將每個形狀拖去啱佢嘅窿度！" },
  fit:  { en: "{s}! It fits right in!", es: "¡{s}! ¡Entra justo!", yue: "{s}！啱啱好！" },
  try:  { en: "Hmm, try another hole!", es: "Mmm, ¡prueba otro hueco!", yue: "唔，試下第二個窿！" },
  here: { en: "The {s} goes right here!", es: "¡El {s} va aquí!", yue: "{s}放呢度！" },
  done: { en: "All the shapes fit!", es: "¡Todas las figuras entran!", yue: "全部形狀都入晒！" }
};

// Saturated, cheerful fills — one clear colour per shape (Art Style Guide).
const SD_COLOR = { circle: "#ef5a3d", square: "#3b82f6", triangle: "#39b559", star: "#f5c21e", heart: "#ff6f91" };
const SD_STARPTS = "50,8 60,36 90,37 66,55 75,84 50,67 25,84 34,55 10,37 40,36";

// Per-shape face placement — the face has to sit in the shape's visual middle, which is
// lower on a triangle and higher on a heart.
const SD_FACE = {
  circle:   { cy: 50, sp: 13 }, square: { cy: 50, sp: 13 }, triangle: { cy: 62, sp: 11 },
  star:     { cy: 52, sp: 11 }, heart:  { cy: 44, sp: 12 }
};

// Eyes-with-a-highlight + rosy cheeks + a soft smile — keeps every shape on-model and awake.
function sdFace(shape) {
  const f = SD_FACE[shape], cy = f.cy, sp = f.sp;
  const eye = dx => `
    <ellipse cx="${50 + dx}" cy="${cy}" rx="7" ry="8" fill="#fff"/>
    <circle cx="${50 + dx}" cy="${cy + 1}" r="3.6" fill="#2a2140"/>
    <circle cx="${50 + dx - 1.3}" cy="${cy - 1.4}" r="1.5" fill="#fff"/>`;
  return `
    ${eye(-sp)}${eye(sp)}
    <circle cx="${50 - sp - 6}" cy="${cy + 9}" r="4.2" fill="#ff7fb6" opacity=".5"/>
    <circle cx="${50 + sp + 6}" cy="${cy + 9}" r="4.2" fill="#ff7fb6" opacity=".5"/>
    <path d="M${50 - 7} ${cy + 10} Q50 ${cy + 16} ${50 + 7} ${cy + 10}" stroke="#2a2140" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
}

// The shape body (fill + a soft top sheen). `face` adds the eyes etc. for a tappable piece;
// a hole passes face:false and draws the same outline as an empty socket instead.
function sdBody(shape, fill, face) {
  const sheen = `<ellipse cx="42" cy="34" rx="20" ry="11" fill="#fff" opacity=".16"/>`;
  let body;
  if (shape === "circle")        body = `<circle cx="50" cy="50" r="40" fill="${fill}"/>`;
  else if (shape === "square")   body = `<rect x="12" y="12" width="76" height="76" rx="16" fill="${fill}"/>`;
  else if (shape === "triangle") body = `<path d="M50 20 L80 78 L20 78 Z" fill="${fill}" stroke="${fill}" stroke-width="14" stroke-linejoin="round"/>`;
  else if (shape === "star")     body = `<polygon points="${SD_STARPTS}" fill="${fill}" stroke="${fill}" stroke-width="7" stroke-linejoin="round"/>`;
  else                           body = `<path d="M50 84 C18 60 10 36 28 25 C40 18 50 28 50 33 C50 28 60 18 72 25 C90 36 82 60 50 84 Z" fill="${fill}"/>`;
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">${body}${face ? sheen + sdFace(shape) : ""}</svg>`;
}
function sdHole(shape) {
  // same geometry as a muted socket: dark fill + a dashed rim so the outline reads as a target.
  let body;
  const st = `fill="rgba(60,44,30,.22)" stroke="rgba(255,255,255,.75)" stroke-width="3.5" stroke-dasharray="7 6" stroke-linejoin="round"`;
  if (shape === "circle")        body = `<circle cx="50" cy="50" r="38" ${st}/>`;
  else if (shape === "square")   body = `<rect x="14" y="14" width="72" height="72" rx="15" ${st}/>`;
  else if (shape === "triangle") body = `<path d="M50 22 L78 76 L22 76 Z" ${st}/>`;
  else if (shape === "star")     body = `<polygon points="${SD_STARPTS}" ${st}/>`;
  else                           body = `<path d="M50 82 C20 60 13 37 29 27 C40 20 50 29 50 34 C50 29 60 20 71 27 C87 37 80 60 50 82 Z" ${st}/>`;
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">${body}</svg>`;
}

const shapedropLevel = {
  theme: "theme-shapedrop", rounds: 5,

  // Build this round's set of pieces so that each piece has EXACTLY ONE matching hole
  // (shape unique at t0/t1; shape+size unique at t2) — the fit stays unambiguous.
  plan() {
    if (state.tier === 0) return shuffle(["circle", "square", "triangle"]).map(s => ({ shape: s, size: null }));
    if (state.tier === 1) return shuffle(["circle", "square", "triangle", "star"]).map(s => ({ shape: s, size: null }));
    // tier 2: two shapes, each in BIG and SMALL — form AND size must match.
    const two = shuffle(["circle", "square", "triangle"]).slice(0, 2);
    return shuffle(two.flatMap(s => [{ shape: s, size: "big" }, { shape: s, size: "small" }]));
  },

  startRound() {
    this.miss = 0;
    this.reduced = reducedMotion();
    const set = this.plan();
    this.left = set.length;
    setInstruction(sdL(SD_TXT.show), sdL(SD_TXT.say));

    const holeHtml = shuffle(set).map(p =>
      `<div class="sd-hole" data-shape="${p.shape}" data-size="${p.size || ""}" ${p.size === "small" ? 'data-small="1"' : ""}>
         <div class="sd-art">${sdHole(p.shape)}</div></div>`).join("");
    const pieceHtml = shuffle(set).map(p =>
      `<button class="sd-piece" data-shape="${p.shape}" data-size="${p.size || ""}" ${p.size === "small" ? 'data-small="1"' : ""}
               aria-label="${sdPieceName(p.shape, p.size)}"><div class="sd-art">${sdBody(p.shape, SD_COLOR[p.shape], true)}</div></button>`).join("");

    $("playArea").innerHTML =
      // board + tray fill the screen, so only the back layers of the kit show behind them
      scene.html("meadow", { seed: 19 + state.round * 5, layers: ["canopy", "far", "drift", "motes"] }) +
      `<style>
        .sd-stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
                  justify-content:space-between;padding:clamp(8px,2.4vmin,22px);z-index:5;gap:clamp(6px,1.8vmin,16px)}
        .sd-board{display:flex;flex-wrap:wrap;gap:clamp(8px,3vmin,26px);justify-content:center;align-items:center;
                  background:linear-gradient(#caa06a,#a9814d);border:clamp(5px,1.4vmin,12px) solid #8a6336;
                  border-radius:clamp(14px,3.4vmin,30px);padding:clamp(10px,3vmin,28px);
                  box-shadow:inset 0 3px 10px rgba(255,255,255,.25),0 8px 18px rgba(60,40,20,.28);max-width:96%}
        .sd-tray{display:flex;flex-wrap:wrap;gap:clamp(8px,3vmin,24px);justify-content:center;align-items:center;max-width:96%}
        .sd-hole,.sd-piece{width:clamp(64px,19vmin,128px);height:clamp(64px,19vmin,128px);
                  display:flex;align-items:center;justify-content:center;padding:0}
        .sd-hole[data-small],.sd-piece[data-small]{width:clamp(44px,12.5vmin,84px);height:clamp(44px,12.5vmin,84px)}
        .sd-hole{border-radius:16px}
        .sd-piece{border:0;background:transparent;cursor:grab;touch-action:none;
                  filter:drop-shadow(0 5px 6px rgba(40,25,10,.3));${this.reduced ? "" : "animation:sdIn .4s ease both"}}
        .sd-piece:active{cursor:grabbing}
        .sd-art{width:100%;height:100%;pointer-events:none}
        .sd-piece.on-plate{filter:drop-shadow(0 2px 3px rgba(40,25,10,.25))}
        .sd-hole.sd-filled .sd-art:first-child{display:none}
        .sd-hole.sd-assist{animation:sdPulse 1s ease infinite}
        .sd-pop{animation:sdPop .4s cubic-bezier(.34,1.56,.64,1)}
        @keyframes sdIn{0%{opacity:0;transform:translateY(14px) scale(.8)}100%{opacity:1;transform:none}}
        @keyframes sdPop{0%{transform:scale(.6)}60%{transform:scale(1.18)}100%{transform:scale(1)}}
        @keyframes sdPulse{0%,100%{filter:drop-shadow(0 0 0 rgba(255,227,107,0))}50%{filter:drop-shadow(0 0 12px rgba(255,227,107,.95))}}
        @media (prefers-reduced-motion:reduce){.sd-piece,.sd-hole.sd-assist,.sd-pop{animation:none!important}}
      </style>
      <div class="sd-stage">
        <div class="sd-board" id="sdBoard">${holeHtml}</div>
        <div class="sd-tray" id="sdTray">${pieceHtml}</div>
      </div>`;

    this.holes = [...document.querySelectorAll(".sd-hole")];
    [...document.querySelectorAll(".sd-piece")].forEach(el =>
      makeDraggable(el, (p, ev, info) => this.release(p, ev, info)));
  },

  // the one unfilled hole that this piece belongs in
  holeFor(el) {
    return this.holes.find(h => !h.classList.contains("sd-filled") &&
      h.dataset.shape === el.dataset.shape && h.dataset.size === el.dataset.size);
  },

  release(el, ev, info) {
    if (state.busy || el.classList.contains("on-plate")) { info.reset(); return; }
    const c = centerOf(el);
    const hole = this.holeFor(el);
    if (!hole) { info.reset(); return; }               // nothing to match (shouldn't happen) — just go back
    const hc = centerOf(hole);
    const assist = this.miss >= 3;                      // after repeated misses the correct hole gets a big catch radius
    const r = hole.offsetWidth * (assist ? 1.5 : 0.85);
    if (Math.hypot(hc.x - c.x, hc.y - c.y) <= r) { this.place(el, hole, ev); return; }

    // dropped somewhere else: a miss only if it landed on a (wrong) hole, else a free retry
    const onHole = this.holes.find(h => inside(c, h));
    info.reset();
    if (onHole) this.wrong(el);
  },

  place(el, hole, ev) {
    el.classList.add("on-plate");
    el.style.position = "static"; el.style.left = el.style.top = el.style.zIndex = "";
    hole.appendChild(el);
    hole.classList.add("sd-filled"); hole.classList.remove("sd-assist");
    if (!this.reduced) { el.classList.remove("sd-pop"); void el.offsetWidth; el.classList.add("sd-pop"); }
    sfx.tap(); tone(520, 0, .14, "sine", .14);
    const cc = centerOf(hole);
    miniStar(cc.x, cc.y); floaters(["✨", "⭐"], cc.x, cc.y, 3);
    speak(sdL(SD_TXT.fit).replace("{s}", sdPieceName(el.dataset.shape, el.dataset.size || null)));
    if (--this.left <= 0) { core.wait(() => { speak(sdL(SD_TXT.done) + " " + praise()); roundComplete(); }, 420); }
  },

  wrong(el) {
    this.miss++;
    sfx.bad(); wiggle(el);                               // sfx.bad also feeds the auto-difficulty model
    const hole = this.holeFor(el);
    if (this.miss === 2 && hole) hole.classList.add("sd-assist");          // 2nd miss: show where it goes
    else if (this.miss >= 3 && hole) { hole.classList.add("sd-assist"); wiggle(hole); // 3rd: guide her home
      speak(sdL(SD_TXT.here).replace("{s}", sdPieceName(el.dataset.shape, el.dataset.size || null))); return; }
    speak(sdL(SD_TXT.try));
  }
};

registerGame({
  id: "shapedrop", world: "shape", icon: "🧩", name: "Shape Drop",
  es: "Encaja Figuras", yue: "放形狀", lvl: 0, v: 55, cue: "wood", level: shapedropLevel
});
