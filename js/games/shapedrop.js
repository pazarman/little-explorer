"use strict";
/* LEVEL: Shape Drop (spatial fitting)
   STEM objective · Spatial reasoning · the classic shape-sorter mechanic: choose a
   piece and discover whether its FORM (and, at tier 2, its SIZE) belongs in a hole.
   Learned through real-time drag-to-fit + trial-and-error, not tap-and-wait — the
   interaction IS the practice. Age band 2-4.
   Success = child drags each shape piece into the hole whose outline matches it;
   wrong holes gently refuse (no fail state), assist guides a stuck/passive player home. */

// ---- Drawn SVG shape buddies: round, chunky, saturated, eyes-with-a-highlight + cheeks ----
const SD_FACE = (cx, cy, s = 1) => `
  <circle cx="${(cx - 9 * s).toFixed(1)}" cy="${cy}" r="${(6 * s).toFixed(1)}" fill="#fff"/>
  <circle cx="${(cx + 9 * s).toFixed(1)}" cy="${cy}" r="${(6 * s).toFixed(1)}" fill="#fff"/>
  <circle cx="${(cx - 8 * s).toFixed(1)}" cy="${(cy + 1 * s).toFixed(1)}" r="${(3.2 * s).toFixed(1)}" fill="#2a2140"/>
  <circle cx="${(cx + 10 * s).toFixed(1)}" cy="${(cy + 1 * s).toFixed(1)}" r="${(3.2 * s).toFixed(1)}" fill="#2a2140"/>
  <circle cx="${(cx - 9.2 * s).toFixed(1)}" cy="${(cy - 0.6 * s).toFixed(1)}" r="${(1.1 * s).toFixed(1)}" fill="#fff"/>
  <circle cx="${(cx + 8.8 * s).toFixed(1)}" cy="${(cy - 0.6 * s).toFixed(1)}" r="${(1.1 * s).toFixed(1)}" fill="#fff"/>
  <circle cx="${(cx - 15 * s).toFixed(1)}" cy="${(cy + 8 * s).toFixed(1)}" r="${(4 * s).toFixed(1)}" fill="#ff7fb6" opacity=".5"/>
  <circle cx="${(cx + 15 * s).toFixed(1)}" cy="${(cy + 8 * s).toFixed(1)}" r="${(4 * s).toFixed(1)}" fill="#ff7fb6" opacity=".5"/>
  <path d="M${(cx - 7 * s).toFixed(1)} ${(cy + 9 * s).toFixed(1)} Q${cx} ${(cy + 15 * s).toFixed(1)} ${(cx + 7 * s).toFixed(1)} ${(cy + 9 * s).toFixed(1)}"
        fill="none" stroke="#2a2140" stroke-width="${(2.6 * s).toFixed(1)}" stroke-linecap="round"/>`;

const SD_SHAPES = {
  circle:   { fill: "#ec5a45", line: "#b83a28", face: [50, 52, 1],
              body: (f, ln) => `<circle cx="50" cy="52" r="40" fill="${f}" stroke="${ln}" stroke-width="5"/>`,
              sheen: `<ellipse cx="37" cy="38" rx="15" ry="10" fill="#fff" opacity=".22"/>` },
  square:   { fill: "#2f7fde", line: "#1f57a0", face: [50, 50, 1],
              body: (f, ln) => `<rect x="13" y="15" width="74" height="74" rx="16" fill="${f}" stroke="${ln}" stroke-width="5"/>`,
              sheen: `<rect x="20" y="22" width="30" height="15" rx="8" fill="#fff" opacity=".2"/>` },
  triangle: { fill: "#38a24d", line: "#237a36", face: [50, 60, 0.78],
              body: (f, ln) => `<path d="M50 12 Q57 12 61 20 L88 76 Q93 88 81 88 L19 88 Q7 88 12 76 L39 20 Q43 12 50 12 Z" fill="${f}" stroke="${ln}" stroke-width="5" stroke-linejoin="round"/>`,
              sheen: `<path d="M50 24 L41 48 L59 48 Z" fill="#fff" opacity=".18"/>` },
  star:     { fill: "#f4b400", line: "#c98a00", face: [50, 54, 0.74],
              body: (f, ln) => `<path d="M50 10 L61 37 L90 39 L67 58 L75 88 L50 71 L25 88 L33 58 L10 39 L39 37 Z" fill="${f}" stroke="${ln}" stroke-width="5" stroke-linejoin="round"/>`,
              sheen: `<circle cx="42" cy="42" r="8" fill="#fff" opacity=".2"/>` },
  heart:    { fill: "#e8529a", line: "#b43474", face: [50, 48, 0.86],
              body: (f, ln) => `<path d="M50 86 C16 60 12 34 30 24 C43 17 50 29 50 34 C50 29 57 17 70 24 C88 34 84 60 50 86 Z" fill="${f}" stroke="${ln}" stroke-width="5" stroke-linejoin="round"/>`,
              sheen: `<ellipse cx="36" cy="38" rx="9" ry="6" fill="#fff" opacity=".22"/>` }
};

function sdPieceSVG(kind) {
  const d = SD_SHAPES[kind], [fx, fy, fs] = d.face;
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">${d.body(d.fill, d.line)}${d.sheen}${SD_FACE(fx, fy, fs)}</svg>`;
}
// The slot: the same silhouette, recessed and muted, so the child matches by outline.
function sdHoleSVG(kind) {
  const d = SD_SHAPES[kind];
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">${d.body("rgba(60,45,80,.16)", "rgba(60,45,80,.5)")}</svg>`;
}

// ---- Strings (inline, like Fill It Up! / Dolphin Dive). ES is Panamanian. ----
const sdL = o => o[curLang()] || o.en;
const sdFill = (str, p) => { for (const k in p) str = str.split(`{${k}}`).join(p[k]); return str; };
const SD_NAME = {
  circle:   { en: "circle",   es: "círculo",   yue: "圓形" },
  square:   { en: "square",   es: "cuadrado",  yue: "四方形" },
  triangle: { en: "triangle", es: "triángulo", yue: "三角形" },
  star:     { en: "star",     es: "estrella",  yue: "星形" },
  heart:    { en: "heart",    es: "corazón",   yue: "心形" }
};
const SD_SIZE = { big: { en: "big", es: "grande", yue: "大" }, small: { en: "little", es: "pequeño", yue: "細" } };
const SD_TXT = {
  show:    { en: "🧩 Drop each shape in its hole!", es: "🧩 ¡Pon cada figura en su hueco!", yue: "🧩 將每個形狀放入佢嘅窿度！" },
  say:     { en: "Drag each shape to the hole that matches it!",
             es: "¡Arrastra cada figura al hueco que le toca!",
             yue: "將每個形狀拖去啱佢嘅窿度！" },
  showBig: { en: "🧩 Match the shape AND the size!", es: "🧩 ¡Haz coincidir la figura Y el tamaño!", yue: "🧩 形狀同大細都要啱！" },
  sayBig:  { en: "Drag each shape to the hole that matches its shape and its size!",
             es: "¡Arrastra cada figura al hueco de su misma figura y tamaño!",
             yue: "將每個形狀拖去形狀同大細都啱嘅窿度！" },
  wrong:   { en: "Hmm, that one doesn't fit there. Try another hole!",
             es: "Mmm, ahí no cabe. ¡Prueba otro hueco!",
             yue: "唔啱喎，放唔入。試吓第個窿！" },
  hint:    { en: "The {shape} goes here!", es: "¡El {shape} va aquí!", yue: "{shape}放呢度！" },
  hintBig: { en: "The {size} {shape} goes here!", es: "¡El {shape} {size} va aquí!", yue: "{size}{shape}放呢度！" },
  fit:     { en: "A {shape}! It fits!", es: "¡{shape}! ¡Cabe perfecto!", yue: "{shape}！啱啱好！" },
  fitBig:  { en: "The {size} {shape}! It fits!", es: "¡El {shape} {size}! ¡Cabe!", yue: "{size}{shape}！啱晒！" },
  allDone: { en: "You fit them all!", es: "¡Las pusiste todas!", yue: "全部都放好喇！" }
};

const shapedropLevel = {
  theme: "theme-shapedrop", rounds: 5,

  startRound() {
    this.cleanup();
    this.done = false;
    this.autoRunning = false;
    this.mistakes = 0;
    this.reduced = reducedMotion();

    const plan = this.buildPlan();              // [{shape, size}]
    const t = state.tier;
    setInstruction(sdL(t === 2 ? SD_TXT.showBig : SD_TXT.show), sdL(t === 2 ? SD_TXT.sayBig : SD_TXT.say));

    const sw = s => (s === "big" ? 18 : s === "small" ? 12 : 15);   // piece size, vmin
    const hw = s => (s === "big" ? 20 : s === "small" ? 14 : 17);   // hole size, vmin

    const holeHTML = shuffle(plan).map((p, i) =>
      `<div class="sd-hole" data-i="${i}" data-shape="${p.shape}" data-size="${p.size}"
            style="width:${hw(p.size)}vmin;height:${hw(p.size)}vmin">
         <span class="sd-holeart">${sdHoleSVG(p.shape)}</span>
       </div>`).join("");
    const pieceHTML = shuffle(plan).map((p, i) =>
      `<div class="sd-piece" data-i="${i}" data-shape="${p.shape}" data-size="${p.size}"
            role="button" aria-label="${p.size ? p.size + " " : ""}${p.shape}"
            style="width:${sw(p.size)}vmin;height:${sw(p.size)}vmin">${sdPieceSVG(p.shape)}</div>`).join("");

    $("playArea").innerHTML =
      scene.html("meadow", { seed: 31 + state.round * 5, layers: ["canopy", "far", "drift", "motes", "frame"] }) +
      `<style>
        .sd-stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
                  justify-content:space-between;gap:2vmin;padding:4% 3% 5%;z-index:5;
                  touch-action:none;-webkit-user-select:none;user-select:none}
        .sd-board{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;
                  gap:clamp(10px,3.5vmin,30px);padding:3vmin 4vmin;border-radius:7vmin;
                  background:linear-gradient(180deg,rgba(255,255,255,.5),rgba(240,230,255,.32));
                  box-shadow:inset 0 2px 6px rgba(80,60,110,.14),0 6px 14px rgba(90,70,130,.16)}
        .sd-hole{position:relative;display:flex;align-items:center;justify-content:center;flex:0 0 auto;
                 border-radius:4vmin;box-shadow:inset 0 3px 7px rgba(60,45,80,.2)}
        .sd-holeart{position:absolute;inset:8%;display:block}
        .sd-hole.sd-hint{box-shadow:inset 0 0 0 4px #ffd54f,0 0 16px rgba(255,213,79,.85);
                         animation:sdPulse 1s ease-in-out infinite}
        @keyframes sdPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        .sd-tray{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;
                 gap:clamp(10px,3.5vmin,28px);min-height:20vmin}
        .sd-piece{flex:0 0 auto;cursor:grab;touch-action:none;
                  filter:drop-shadow(0 4px 5px rgba(60,45,80,.3));transition:transform .12s ease}
        .sd-piece:active{cursor:grabbing;transform:scale(1.04)}
        .sd-piece.on-plate{cursor:default;pointer-events:none;width:100%!important;height:100%!important;
                           filter:drop-shadow(0 2px 3px rgba(60,45,80,.25))}
        .sd-pop{animation:sdPop .45s ease}
        @keyframes sdPop{0%{transform:scale(.6)}55%{transform:scale(1.12)}100%{transform:scale(1)}}
      </style>
      <div class="sd-stage" id="sdStage">
        <div class="sd-board" id="sdBoard">${holeHTML}</div>
        <div class="sd-tray" id="sdTray">${pieceHTML}</div>
      </div>`;

    this.holes = [...$("sdBoard").querySelectorAll(".sd-hole")].map(el =>
      ({ el, shape: el.dataset.shape, size: el.dataset.size, filled: false }));
    this.pieces = [...$("sdTray").querySelectorAll(".sd-piece")].map(el =>
      ({ el, shape: el.dataset.shape, size: el.dataset.size, placed: false }));
    this.remaining = this.pieces.length;

    this.pieces.forEach(p => {
      p.el.addEventListener("pointerdown", () => this.engage());
      makeDraggable(p.el, (el, ev, info) => this.release(p, ev, info));
    });

    // Assist ladder for a stuck or passive player: hint, then guide the pieces home so
    // she is never stranded on a screen where nothing happens.
    this.hintT = core.wait(() => this.showHint(null), 5500);
    this.autoT = core.wait(() => this.startAuto(), 8500);
  },

  // Pieces (and holes) for this tier. Keys are matched by shape (+ size at tier 2).
  buildPlan() {
    const t = state.tier;
    if (t === 2) {
      // form AND size: two shapes, each in a big and a small copy (ES-safe: all masculine nouns)
      const kinds = shuffle(["circle", "square", "triangle", "heart"]).slice(0, 2);
      const out = [];
      kinds.forEach(k => { out.push({ shape: k, size: "big" }); out.push({ shape: k, size: "small" }); });
      return out;                                   // 4 pieces, 4 holes
    }
    if (t === 1) {
      // match more carefully: a doubled shape (two matching holes) plus two others
      const all = shuffle(["circle", "square", "triangle", "star", "heart"]);
      return [{ shape: all[0], size: "" }, { shape: all[0], size: "" },
              { shape: all[1], size: "" }, { shape: all[2], size: "" }];   // 4 pieces
    }
    // tier 0: three distinct shapes, one obvious hole each
    return shuffle(["circle", "square", "triangle", "star", "heart"]).slice(0, 3).map(s => ({ shape: s, size: "" }));
  },

  fits(piece, hole) {
    return !hole.filled && piece.shape === hole.shape && (state.tier !== 2 || piece.size === hole.size);
  },

  // Nearest UNFILLED hole within a generous snap reach (forgiving of fine-motor aim).
  nearestHole(pt) {
    let best = null, bd = Infinity;
    this.holes.forEach(h => {
      if (h.filled) return;
      const r = h.el.getBoundingClientRect();
      const d = Math.hypot(pt.x - (r.left + r.width / 2), pt.y - (r.top + r.height / 2));
      if (d < r.width * 0.75 + 36 && d < bd) { bd = d; best = h; }
    });
    return best;
  },

  release(piece, ev, info) {
    if (state.busy || this.done || piece.placed) { info.reset(); return; }
    const hole = this.nearestHole(centerOf(piece.el));
    if (hole && this.fits(piece, hole)) { this.place(piece, hole, false); return; }
    info.reset();
    if (hole) this.miss(piece);     // aimed at a hole that doesn't match → gentle nudge; empty space → silent
  },

  place(piece, hole, auto) {
    if (this.done || piece.placed || hole.filled) return;
    piece.placed = true; hole.filled = true;
    piece.el.classList.add("on-plate");
    piece.el.style.position = "static";
    piece.el.style.left = piece.el.style.top = piece.el.style.zIndex = "";
    const art = hole.el.querySelector(".sd-holeart"); if (art) art.style.visibility = "hidden";
    hole.el.appendChild(piece.el);
    this.clearHint();

    sfx.tap(); tone(560, 0, .12, "sine", .14);
    const c = centerOf(hole.el);
    miniStar(c.x, c.y);
    if (!this.reduced) { floaters(["✨"], c.x, c.y, 3); hole.el.classList.remove("sd-pop"); void hole.el.offsetWidth; hole.el.classList.add("sd-pop"); }

    this.remaining--;
    if (this.remaining <= 0) {
      speak(this.sayFit(piece) + " " + sdL(SD_TXT.allDone) + " " + praise());
      this.finish();
    } else {
      speak(this.sayFit(piece));
      if (auto) this.startAuto(1100);
    }
  },

  miss(piece) {
    this.mistakes++;
    sfx.bad(); wiggle(piece.el);          // sfx.bad also nudges the auto-difficulty model down
    speak(sdL(SD_TXT.wrong));
    if (this.mistakes >= 2) this.showHint(piece);
    if (this.mistakes >= 3) this.startAuto(1300);   // by the ~3rd miss, guide it home
  },

  sayFit(piece) {
    const lang = curLang();
    const nm = SD_NAME[piece.shape][lang] || SD_NAME[piece.shape].en;
    if (state.tier === 2) {
      const sz = (SD_SIZE[piece.size] || {})[lang] || SD_SIZE[piece.size].en;
      return sdFill(sdL(SD_TXT.fitBig), { shape: nm, size: sz });
    }
    return sdFill(sdL(SD_TXT.fit), { shape: nm });
  },

  // Highlight a correct hole. With a piece, point at its match; idle → point at the first
  // still-empty hole and name what it wants.
  showHint(piece) {
    let target;
    if (piece) target = this.holes.find(h => this.fits(piece, h));
    else {
      const p = this.pieces.find(x => !x.placed);
      target = p && this.holes.find(h => this.fits(p, h));
      piece = p;
    }
    if (!target || !piece) return;
    this.clearHint();
    target.el.classList.add("sd-hint");
    const lang = curLang(), nm = SD_NAME[piece.shape][lang] || SD_NAME[piece.shape].en;
    if (state.tier === 2) {
      const sz = (SD_SIZE[piece.size] || {})[lang] || SD_SIZE[piece.size].en;
      speak(sdFill(sdL(SD_TXT.hintBig), { shape: nm, size: sz }));
    } else speak(sdFill(sdL(SD_TXT.hint), { shape: nm }));
  },

  clearHint() { this.holes.forEach(h => h.el.classList.remove("sd-hint")); },

  // Real engagement resets the passive-rescue clock (unless auto is already finishing it).
  engage() {
    if (this.done || this.autoRunning) return;
    if (this.hintT) { clearTimeout(this.hintT); this.hintT = null; }
    if (this.autoT) { clearTimeout(this.autoT); this.autoT = null; }
    this.hintT = core.wait(() => this.showHint(null), 6000);
    this.autoT = core.wait(() => this.startAuto(), 9000);
  },

  // Guide remaining pieces home, one at a time, so a passive player always completes.
  startAuto(delay = 0) {
    if (this.done) return;
    this.autoRunning = true;
    const tray = $("sdTray"); if (tray) tray.style.pointerEvents = "none";   // avoid a tug-of-war with the hand
    if (this.autoT) { clearTimeout(this.autoT); this.autoT = null; }
    this.autoT = core.wait(() => this.autoStep(), delay);
  },

  autoStep() {
    if (this.done) return;
    const piece = this.pieces.find(p => !p.placed);
    if (!piece) return;
    const hole = this.holes.find(h => this.fits(piece, h));
    if (!hole) return;
    this.showHint(piece);
    this.autoStepT = core.wait(() => this.place(piece, hole, true), this.reduced ? 120 : 650);
  },

  finish() {
    if (this.done) return;
    this.done = true;
    this.clearTimers();
    roundComplete();     // plays the signature cue + advances; speech already queued in place()
  },

  clearTimers() {
    if (this.hintT) { clearTimeout(this.hintT); this.hintT = null; }
    if (this.autoT) { clearTimeout(this.autoT); this.autoT = null; }
    if (this.autoStepT) { clearTimeout(this.autoStepT); this.autoStepT = null; }
  },

  cleanup() {
    this.clearTimers();
    this.done = true;               // stop any in-flight auto callbacks from the previous round
    this.holes = this.pieces = null;
    this.autoRunning = false;
  }
};

registerGame({
  id: "shapedrop", world: "shape", icon: "🧩", name: "Shape Drop",
  es: "Encaja la Figura", yue: "放形狀", lvl: 0, v: 55, cue: "wood", level: shapedropLevel
});
