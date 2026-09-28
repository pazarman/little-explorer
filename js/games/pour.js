"use strict";
// Measurement · comparison · capacity / volume — which container holds MORE? · age 3-4
// STEM objective: capacity (how much a container holds) as a measurable property, learned
// through an active pour → fits-or-spills cause-and-effect, not visual estimation.
// Success = child pours all the water from the jug into the cup that can hold it ALL,
// discovering that a bigger container holds more (and, at tier 2, that taller ≠ more).

// Little watering-jug buddy (chunky, round, eyes-with-a-highlight, rosy cheeks). Its
// belly is a water tank whose level the game updates as it empties into the cups.
const PF_JUG = fill => {
  const wy = 34 + (1 - clamp(fill, 0, 1)) * 30;   // water surface: y=34 full → y=64 empty
  return `<svg viewBox="0 0 120 110" width="100%" height="100%">
    <defs><clipPath id="pfJugIn"><path d="M30 34 Q30 30 34 30 H86 Q90 30 90 34 V60 Q90 66 84 66 H36 Q30 66 30 60 Z"/></clipPath></defs>
    <!-- spout -->
    <path d="M86 40 Q108 34 112 46 Q104 46 90 52 Z" fill="#7fc4e6"/>
    <path d="M86 40 Q108 34 112 46" fill="none" stroke="#4d96bd" stroke-width="3" stroke-linecap="round"/>
    <!-- body -->
    <path d="M28 34 Q28 26 36 26 H84 Q92 26 92 34 V60 Q92 70 82 70 H38 Q28 70 28 60 Z" fill="#bfe6f5" stroke="#4d96bd" stroke-width="4"/>
    <!-- water inside -->
    <g clip-path="url(#pfJugIn)">
      <rect x="28" y="${wy.toFixed(1)}" width="64" height="40" fill="#39a7dd"/>
      <rect x="28" y="${wy.toFixed(1)}" width="64" height="4" fill="#6fc6ec"/>
    </g>
    <!-- handle -->
    <path d="M92 38 Q108 40 106 54 Q104 62 94 62" fill="none" stroke="#4d96bd" stroke-width="6" stroke-linecap="round"/>
    <!-- face -->
    <circle cx="48" cy="46" r="6.5" fill="#fff"/><circle cx="72" cy="46" r="6.5" fill="#fff"/>
    <circle cx="49.5" cy="47.5" r="3.4" fill="#20455a"/><circle cx="73.5" cy="47.5" r="3.4" fill="#20455a"/>
    <circle cx="48.3" cy="46" r="1.2" fill="#fff"/><circle cx="72.3" cy="46" r="1.2" fill="#fff"/>
    <circle cx="40" cy="54" r="5" fill="#ff7fb6" opacity=".5"/><circle cx="80" cy="54" r="5" fill="#ff7fb6" opacity=".5"/>
    <path d="M54 55 Q60 60 66 55" fill="none" stroke="#20455a" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
};

// this game holds its strings inline (like Dolphin Dive / Night & Day) rather than in the core DICT
const pfL = obj => obj[curLang()] || obj.en;
const PF_TXT = {
  show:  { en: "🫗 Which cup can hold ALL the water?", es: "🫗 ¿Qué vaso aguanta TODA el agua?", yue: "🫗 邊個杯裝得晒啲水？" },
  say:   { en: "Hold your finger on a cup to pour. Which one holds it ALL?",
           es: "Deja el dedo en un vaso para verter. ¿Cuál la aguanta TODA?",
           yue: "㩒住一個杯倒水。邊個裝得晒啲水呀？" },
  same:  { en: "🫗 These cups look different. Can they hold all the water?",
           es: "🫗 Estos vasos se ven distintos. ¿Aguantan toda el agua?",
           yue: "🫗 呢啲杯樣衰唔同。裝唔裝得晒啲水？" },
  spill: { en: "Oh! It's full — it spilled! That cup holds less.",
           es: "¡Ay! Se llenó y se derramó. Ese vaso aguanta menos.",
           yue: "哎呀！滿咗，濺出嚟喇！嗰個杯裝得少啲。" },
  winBig:{ en: "You did it! That cup holds MORE — all the water fit!",
           es: "¡Lo lograste! Ese vaso aguanta MÁS — ¡cabe toda el agua!",
           yue: "你做到喇！嗰個杯裝得多啲——啲水裝晒！" },
  winSame:{ en: "Look — they look different, but BOTH hold it all. Same amount!",
           es: "¡Mira! Se ven distintos, pero los DOS la aguantan. ¡Igual!",
           yue: "睇吓——樣唔同，但係兩個都裝得晒。一樣咁多呀！" },
  hint:  { en: "Try the BIG cup — it holds more!", es: "¡Prueba el vaso GRANDE — aguanta más!", yue: "試吓個大杯——裝多啲！" }
};

// A cup shape: drawn size in vmin (so bigger capacity looks bigger) + how much water it
// can hold before it overflows, as a multiple of one jug-full (jug = 1.0). clip is the
// silhouette; the water div is clipped to it, so a tapered cup fills as a taper.
const PF_SHAPES = {
  glass:  { w: 20, h: 34, clip: "polygon(6% 0,94% 0,90% 100%,10% 100%)",   radius: "6px 6px 12px 12px" },
  tall:   { w: 16, h: 42, clip: "polygon(12% 0,88% 0,84% 100%,16% 100%)", radius: "6px 6px 14px 14px" },
  wide:   { w: 34, h: 24, clip: "polygon(2% 0,98% 0,88% 100%,12% 100%)",  radius: "8px 8px 40% 40%" },
  mug:    { w: 24, h: 26, clip: "polygon(4% 0,96% 0,92% 100%,8% 100%)",   radius: "6px 6px 16px 16px" }
};

const pourLevel = {
  theme: "theme-measure", rounds: 5, raf: null,

  startRound() {
    this.cleanup();
    this.done = false;
    this.reduced = reducedMotion();
    this.misses = 0;
    this.attempt = null;      // the side she committed this attempt to (locked until spill/win)
    this.pouring = null;      // the side water is flowing into right now
    this.auto = null;         // when set, the jug auto-pours here (assist / passive rescue)
    this.jug = 1;             // one jug-full of water
    this.rate = 0.62;         // units per second → a full pour takes ~1.6s

    const cups = this.buildCups();     // [{side, shape, cap, held, correct}]
    this.cups = cups;
    this.correct = cups.filter(c => c.correct).map(c => c.side);

    setInstruction(pfL(state.tier === 2 ? PF_TXT.same : PF_TXT.show), pfL(state.tier === 2 ? PF_TXT.same : PF_TXT.say));

    const cupHTML = cups.map(c => {
      const s = PF_SHAPES[c.shape];
      return `<button class="pf-cup" data-side="${c.side}" style="width:${s.w}vmin;height:${s.h}vmin">
          <span class="pf-jar" style="clip-path:${s.clip};border-radius:${s.radius}">
            <span class="pf-water" data-w="${c.side}"></span>
            <span class="pf-stream" data-s="${c.side}"></span>
          </span>
          <span class="pf-rim" style="border-radius:${s.radius}"></span>
        </button>`;
    }).join("");

    $("playArea").innerHTML =
      scene.html("meadow", { seed: 21 + state.round * 5, layers: ["canopy", "far", "drift", "motes", "frame"] }) +
      `<style>
        .pf-stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;
                  gap:clamp(6px,2vmin,16px);padding-bottom:6%;z-index:5;touch-action:none;-webkit-user-select:none;user-select:none}
        .pf-jug{width:clamp(96px,26vmin,190px);height:auto;filter:drop-shadow(0 6px 8px rgba(0,60,90,.28));
                transform-origin:60% 70%;transition:transform .25s ease}
        .pf-jug.pf-tiltL{transform:rotate(-20deg) translateX(-4%)}
        .pf-jug.pf-tiltR{transform:rotate(20deg) translateX(4%)}
        .pf-jug.pf-bob{animation:pfBob 2.4s ease-in-out infinite}
        @keyframes pfBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .pf-row{display:flex;align-items:flex-end;justify-content:center;gap:clamp(18px,7vmin,64px)}
        .pf-cup{border:none;background:none;padding:0;cursor:pointer;display:flex;align-items:flex-end;
                justify-content:center;position:relative;touch-action:none}
        .pf-cup:active{transform:translateY(1px)}
        .pf-jar{position:relative;display:block;width:100%;height:100%;overflow:hidden;
                background:linear-gradient(180deg,rgba(255,255,255,.5),rgba(200,235,250,.32));
                box-shadow:inset 0 0 0 3px rgba(120,185,215,.7),inset -6px 0 10px rgba(255,255,255,.5)}
        .pf-rim{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 3px rgba(90,160,195,.85)}
        .pf-water{position:absolute;left:-6%;right:-6%;bottom:0;height:0%;
                  background:linear-gradient(180deg,#5cc0ee,#2f96d6);transition:height .06s linear}
        .pf-water::before{content:"";position:absolute;top:-4px;left:0;right:0;height:6px;
                          background:rgba(150,215,245,.9);border-radius:50%}
        .pf-cup.pf-hint .pf-rim{box-shadow:inset 0 0 0 4px #ffd54f,0 0 14px rgba(255,213,79,.8)}
        .pf-cup.pf-win .pf-jar{animation:pfWin .5s ease}
        @keyframes pfWin{0%{transform:scale(1)}45%{transform:scale(1.08)}100%{transform:scale(1.04)}}
        .pf-cup.pf-spill .pf-jar{animation:pfShake .4s ease}
        @keyframes pfShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
        .pf-stream{position:absolute;top:-14%;left:50%;width:clamp(6px,1.6vmin,12px);height:16%;margin-left:-3px;
                   background:linear-gradient(180deg,rgba(120,205,240,0),#4fb0e6);border-radius:4px;opacity:0}
        .pf-stream.on{opacity:.95;animation:pfFall .5s linear infinite}
        @keyframes pfFall{0%{background-position:0 -10px}100%{background-position:0 10px}}
        .pf-drop{position:fixed;font-size:clamp(14px,4vmin,26px);pointer-events:none;z-index:60;animation:pfDrop .8s ease forwards}
        @keyframes pfDrop{0%{transform:translateY(0);opacity:1}100%{transform:translateY(46px);opacity:0}}
      </style>
      <div class="pf-stage" id="pfStage">
        <div class="pf-jug ${this.reduced ? "" : "pf-bob"}" id="pfJug">${PF_JUG(1)}</div>
        <div class="pf-row" id="pfRow">${cupHTML}</div>
      </div>`;

    this._stage = $("pfStage");
    this._cupEls = {};
    this._waterEls = {};
    cups.forEach(c => {
      const el = this._stage.querySelector(`.pf-cup[data-side="${c.side}"]`);
      this._cupEls[c.side] = el;
      this._waterEls[c.side] = el.querySelector(".pf-water");
      el.addEventListener("pointerdown", ev => this.grab(c.side, ev));
    });
    this._up = () => this.release();
    window.addEventListener("pointerup", this._up);
    window.addEventListener("pointercancel", this._up);

    // Assist ladder: if she's stuck or just watching, guide then gently finish the round
    // so a passive player is never stranded on a screen with nothing happening.
    this.hintT = core.wait(() => this.showHint(), 5200);
    this.autoT = core.wait(() => { this.auto = this.correct[0]; }, 9000);

    this.lastT = performance.now();
    const loop = t => { this.frame(t); if (this.raf !== null) this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  },

  // Lay out the cups for this tier. Capacity is a multiple of one jug-full (1.0):
  // < 1 spills, ≥ 1 holds it all.
  buildCups() {
    if (state.tier === 2) {
      // conservation: two cups that LOOK different but hold the same (both hold it all)
      const shapes = shuffle(["tall", "wide"]);
      return [
        { side: "left",  shape: shapes[0], cap: 1.35, held: 0, correct: true },
        { side: "right", shape: shapes[1], cap: 1.35, held: 0, correct: true }
      ];
    }
    if (state.tier === 1) {
      // three cups, only the big one holds it all
      const order = shuffle(["left", "mid", "right"]);
      const caps  = shuffle([0.5, 0.8, 1.55]);
      const shape = { 0.5: "mug", 0.8: "glass", 1.55: "tall" };
      return order.map((side, i) => ({ side, shape: shape[caps[i]], cap: caps[i], held: 0, correct: caps[i] >= 1 }));
    }
    // tier 0: two very different cups, the big one holds it all
    const bigLeft = Math.random() < 0.5;
    return [
      { side: "left",  shape: bigLeft ? "tall" : "mug", cap: bigLeft ? 1.5 : 0.55, held: 0, correct: bigLeft },
      { side: "right", shape: bigLeft ? "mug" : "tall", cap: bigLeft ? 0.55 : 1.5, held: 0, correct: !bigLeft }
    ];
  },

  grab(side, ev) {
    if (this.done || state.busy) return;
    if (ev) { ev.preventDefault(); try { this._cupEls[side].setPointerCapture(ev.pointerId); } catch (_) {} }
    // lock the attempt to the first cup she touches; ignore taps on the others until it resets
    if (this.attempt === null) this.attempt = side;
    if (side !== this.attempt) return;
    // real engagement — hold off the passive-rescue timers
    if (this.hintT) { clearTimeout(this.hintT); this.hintT = null; }
    if (this.autoT) { clearTimeout(this.autoT); this.autoT = null; }
    this.pouring = side;
    this.setStream(side, true);
    this.tiltJug(side);
  },

  release() {
    if (this.pouring) { this.setStream(this.pouring, false); this.pouring = null; }
    this.tiltJug(null);
  },

  frame(t) {
    const dt = Math.min(50, t - this.lastT) / 1000;
    this.lastT = t;
    const area = $("playArea");
    if (!area.isConnected || !this._stage || !this._stage.isConnected || this.done) return;

    // auto-pour (assist) overrides manual once it kicks in
    const side = this.auto || this.pouring;
    if (this.auto && this.pouring !== this.auto) { this.setStream(this.auto, true); this.tiltJug(this.auto); this.pouring = this.auto; }
    if (!side || this.jug <= 0) return;

    const cup = this.cups.find(c => c.side === side);
    const flow = Math.min(this.rate * dt, this.jug);
    cup.held += flow;
    this.jug -= flow;
    this.renderCup(cup);
    $("pfJug").innerHTML = PF_JUG(this.jug);

    if (cup.held >= cup.cap - 0.0001 && cup.cap < 1) { this.spill(cup); return; }
    if (this.jug <= 0.0005) this.win(cup);
  },

  renderCup(cup) {
    const pct = Math.min(1, cup.held / cup.cap) * 100;
    this._waterEls[cup.side].style.height = pct.toFixed(1) + "%";
  },

  spill(cup) {
    this.misses++;
    this.pouring = null; this.auto = null;
    this.setStream(cup.side, false); this.tiltJug(null);
    cup.held = cup.cap;
    this.renderCup(cup);
    const el = this._cupEls[cup.side];
    el.classList.add("pf-spill");
    sfx.bad();                          // gentle wooden "tock"; also nudges the perf model down
    if (!this.reduced) this.dropSpill(el);
    speak(pfL(PF_TXT.spill));
    // after three spills (or once a hint is showing and she keeps missing) just guide it home
    const rescue = this.misses >= 3;
    core.wait(() => {
      if (this.done) return;
      el.classList.remove("pf-spill");
      if (this.misses >= 2) this.showHint();
      if (rescue) { this.auto = this.correct[0]; return; }
      // reset this attempt so she can try another cup
      cup.held = 0; this.renderCup(cup);
      this.jug = 1; $("pfJug").innerHTML = PF_JUG(1);
      this.attempt = null;
    }, 1150);
  },

  win(cup) {
    if (this.done) return;
    this.done = true;
    this.pouring = null; this.auto = null;
    this.setStream(cup.side, false); this.tiltJug(null);
    cup.held = cup.cap; // keep the water settled
    this._waterEls[cup.side].style.height = Math.min(1, 1 / cup.cap) * 100 + "%";
    this.cleanupInput();
    const el = this._cupEls[cup.side];
    el.classList.add("pf-win");
    const r = el.getBoundingClientRect();
    miniStar(r.left + r.width / 2, r.top + r.height / 2);
    floaters(["✨", "💧", "🫧"], r.left + r.width / 2, r.top + r.height / 3, 4);
    speak(pfL(state.tier === 2 ? PF_TXT.winSame : PF_TXT.winBig) + " " + praise());
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    roundComplete();
  },

  showHint() {
    // point at the cup(s) that hold it all
    this.correct.forEach(side => this._cupEls[side] && this._cupEls[side].classList.add("pf-hint"));
    if (state.tier !== 2) speak(pfL(PF_TXT.hint));
  },

  setStream(side, on) {
    const s = this._stage && this._stage.querySelector(`.pf-stream[data-s="${side}"]`);
    if (s) s.classList.toggle("on", on && !this.reduced ? true : on);
  },

  tiltJug(side) {
    const j = $("pfJug"); if (!j) return;
    j.classList.remove("pf-tiltL", "pf-tiltR");
    if (this.reduced) return;
    if (side === "left")  j.classList.add("pf-tiltL");
    if (side === "right") j.classList.add("pf-tiltR");
    // 'mid' (tier 1 centre cup) pours straight down — no tilt
  },

  dropSpill(el) {
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      const d = document.createElement("div");
      d.className = "pf-drop"; d.textContent = "💧";
      d.style.left = (r.left + r.width * (0.2 + Math.random() * 0.6)) + "px";
      d.style.top = (r.top - 6) + "px";
      d.style.animationDelay = (Math.random() * 0.15) + "s";
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 950);
    }
  },

  cleanupInput() {
    if (this._up) {
      window.removeEventListener("pointerup", this._up);
      window.removeEventListener("pointercancel", this._up);
      this._up = null;
    }
  },

  cleanup() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    if (this.hintT) { clearTimeout(this.hintT); this.hintT = null; }
    if (this.autoT) { clearTimeout(this.autoT); this.autoT = null; }
    this.cleanupInput();
    this.pouring = null; this.auto = null; this.attempt = null;
    this._stage = null; this._cupEls = null; this._waterEls = null;
  }
};

registerGame({
  id: "pour", world: "brain", icon: "🫗", name: "Fill It Up!", es: "¡Llénalo!", yue: "裝滿佢",
  lvl: 1, v: 54, cue: "splash", level: pourLevel
});
