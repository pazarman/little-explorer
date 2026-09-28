"use strict";
// STEM: Measurement / comparison · capacity — which container holds more? · age 3-4
// Success = child pours water (hold-to-pour, real-time) to fill each container, watches the
// level rise cup-by-cup, and discovers which vessel holds the MOST — and at tier 2 that a
// tall glass and a wide bowl can hold the SAME (a gentle first taste of conservation of volume).

// Strings live inline (like Dolphin Dive) rather than in the core DICT.
const prL = obj => obj[curLang()] || obj.en;

const PR_TXT = {
  show: { en: "💧 Fill the cups!", es: "💧 ¡Llena las tazas!", yue: "💧 裝滿啲杯！" },
  say:  { en: "Hold a cup to pour water in. Fill them all the way up!",
          es: "Mantén una taza para echar agua. ¡Llénalas hasta arriba!",
          yue: "撳住個杯倒水入去，裝到滿哂佢！" },
  full: { en: "Full! {n} cups!", es: "¡Llena! ¡{n} tazas!", yue: "滿喇！{n} 杯水！" },
  most: { en: "The {name} holds the MOST!", es: "¡El {name} guarda MÁS!", yue: "{name} 裝到最多水！" },
  same: { en: "Same! They both hold {n} cups!", es: "¡Igual! Las dos guardan {n} tazas!", yue: "一樣多！兩個都裝到 {n} 杯！" },
  help: { en: "Hold a cup to fill it up!", es: "¡Mantén una taza para llenarla!", yue: "撳住個杯就會裝滿㗎！" }
};

// Vessel shapes. Each is a local 100x150 SVG whose interior rectangle {x,y,w,h,rx} is
// where the water sits; `cap` is how many "cups" it holds (drives the tick marks, the
// spoken count, and the which-holds-more comparison).
const PR_SHAPES = {
  tinycup:   { cap: 2, name: { en: "little cup", es: "tacita",     yue: "細杯" },     geo: { x: 34, y: 58, w: 32, h: 64,  rx: 8  } },
  glass:     { cap: 3, name: { en: "glass",      es: "vaso",       yue: "玻璃杯" },   geo: { x: 34, y: 30, w: 32, h: 92,  rx: 7  } },
  jar:       { cap: 4, name: { en: "jar",        es: "frasco",     yue: "樽" },       geo: { x: 26, y: 34, w: 48, h: 88,  rx: 10 } },
  bucket:    { cap: 5, name: { en: "bucket",     es: "balde",      yue: "水桶" },     geo: { x: 20, y: 38, w: 60, h: 84,  rx: 10 } },
  pot:       { cap: 5, name: { en: "pot",        es: "olla",       yue: "煲" },       geo: { x: 22, y: 46, w: 56, h: 76,  rx: 12 } },
  jug:       { cap: 6, name: { en: "jug",        es: "jarra",      yue: "水壺" },     geo: { x: 24, y: 30, w: 52, h: 92,  rx: 14 } },
  tallGlass: { cap: 4, name: { en: "tall glass", es: "vaso alto",  yue: "高玻璃杯" }, geo: { x: 36, y: 22, w: 28, h: 100, rx: 6  } },
  wideBowl:  { cap: 4, name: { en: "wide bowl",  es: "tazón",      yue: "闊碗" },     geo: { x: 10, y: 70, w: 80, h: 48,  rx: 24 } }
};

const pourLevel = {
  theme: "theme-pour", rounds: 5, raf: null,

  // Pick the vessels for this round's tier.
  buildSet(tier) {
    if (tier === 2) return ["tallGlass", "wideBowl"];                 // equal capacity, different shape
    if (tier === 1) return shuffle(["glass", rand(["jar", "bucket", "pot"]), "jug"]); // 3 distinct caps
    return shuffle([rand(["tinycup", "glass"]), rand(["bucket", "jug"])]);            // 2 very different
  },

  startRound() {
    this.cleanup();
    this.done = false;
    this.reduced = reducedMotion();
    this.pouring = -1;
    this.lastPour = performance.now();
    this.helped = false;

    const ids = this.buildSet(state.tier);
    this.vessels = ids.map((id, i) => {
      const s = PR_SHAPES[id];
      return { id, cap: s.cap, name: s.name, geo: s.geo, level: 0, lit: 0, full: false, idx: i };
    });

    setInstruction(prL(PR_TXT.show), prL(PR_TXT.say));

    const cards = this.vessels.map((v, i) => `
      <div class="pr-vessel" id="prV${i}" data-i="${i}">
        <div class="pr-badge" id="prBadge${i}"></div>
        <div class="pr-svgwrap">
          <div class="pr-stream" id="prStream${i}"></div>
          ${this.vesselSVG(v, i)}
        </div>
        <div class="pr-count" id="prCount${i}">0</div>
      </div>`).join("");

    $("playArea").innerHTML = `
      <style>
        .pr-stage{position:absolute;inset:0;overflow:hidden;z-index:5;touch-action:none;
                  display:flex;align-items:flex-end;justify-content:center;gap:clamp(10px,4vw,44px);
                  padding:0 clamp(8px,3vw,28px) 8%}
        .pr-vessel{position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;
                   -webkit-tap-highlight-color:transparent;flex:0 1 auto}
        .pr-svgwrap{position:relative;width:clamp(84px,26vw,160px);height:clamp(126px,39vw,240px)}
        .pr-svgwrap svg{width:100%;height:100%;overflow:visible;
                        filter:drop-shadow(0 6px 7px rgba(0,50,80,.28))}
        .pr-vessel.pr-hint .pr-svgwrap{animation:prNudge .9s ease-in-out infinite}
        .pr-vessel.pr-win .pr-svgwrap{animation:prWin .5s ease}
        @keyframes prNudge{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        @keyframes prWin{0%,100%{transform:scale(1)}40%{transform:scale(1.14)}}
        .pr-count{margin-top:clamp(3px,1vh,8px);font-size:clamp(22px,6.4vmin,40px);font-weight:800;
                  color:#fff;text-shadow:0 2px 4px rgba(0,60,90,.5);min-height:1.1em;line-height:1}
        .pr-badge{position:absolute;top:-6%;right:2%;width:clamp(30px,8vmin,50px);height:clamp(30px,8vmin,50px);
                  display:flex;align-items:center;justify-content:center;font-weight:800;color:#2a6a3a;
                  font-size:clamp(15px,4.4vmin,26px);background:radial-gradient(circle at 40% 35%,#fff6b0,#ffdf5e);
                  border-radius:50%;box-shadow:0 3px 6px rgba(0,50,80,.3);opacity:0;transform:scale(.3);
                  transition:opacity .3s,transform .3s;z-index:6;pointer-events:none}
        .pr-badge.on{opacity:1;transform:scale(1)}
        .pr-stream{position:absolute;left:50%;top:-14%;width:clamp(8px,2.3vmin,15px);height:26%;
                   transform:translateX(-50%);border-radius:0 0 40% 40%;pointer-events:none;opacity:0;z-index:4;
                   background:linear-gradient(rgba(191,240,255,.2),#6fc9ee)}
        .pr-stream.on{opacity:.9;animation:prPour .5s linear infinite}
        @keyframes prPour{0%{background-position:0 0}100%{background-position:0 14px}}
        .pr-tick{transition:stroke .18s,opacity .18s}
        .pr-eye-hl{fill:#fff}
      </style>
      <div class="pr-stage" id="prStage">${cards}</div>`;

    // Scene kit AFTER the stage so it sits behind; drop ground/mid so scenery props never
    // cover the vessels the child pours into.
    $("playArea").insertAdjacentHTML("afterbegin",
      scene.html("reef", { seed: 2 + state.round * 3, layers: ["far", "drift", "motes", "frame"] }));

    this._stage = $("prStage");
    this.vessels.forEach((v, i) => {
      const el = $("prV" + i);
      v.el = el;
      v.stream = $("prStream" + i);
      const down = ev => {
        if (this.done) return;
        ev.preventDefault();
        try { el.setPointerCapture(ev.pointerId); } catch (_) {}
        if (!v.full) this.setPouring(i);
      };
      const up = () => this.setPouring(-1);
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
      v._down = down; v._up = up;
    });

    this.lastT = performance.now();
    const loop = t => { this.frame(t); if (this.raf !== null) this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  },

  // The vessel as a friendly little character: chunky glass body, water rect clipped to the
  // interior, tick marks up the side, and an awake face (eyes-with-highlight + cheeks).
  vesselSVG(v, i) {
    const g = v.geo, cx = g.x + g.w / 2;
    const eyeY = g.y + g.h * 0.30, ex = 13;
    const ticks = Array.from({ length: v.cap - 1 }, (_, k) => {
      const y = (g.y + g.h * (1 - (k + 1) / v.cap)).toFixed(1);
      return `<line class="pr-tick" id="prTick${i}_${k}" x1="${g.x + 3}" x2="${g.x + g.w - 3}" y1="${y}" y2="${y}"
                    stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 4"/>`;
    }).join("");
    return `<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="prClip${i}"><rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="${g.rx}"/></clipPath>
        <linearGradient id="prWater${i}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#bff0ff"/><stop offset="1" stop-color="#3fb0e0"/>
        </linearGradient>
      </defs>
      <rect x="${g.x - 3}" y="${g.y - 3}" width="${g.w + 6}" height="${g.h + 6}" rx="${g.rx + 3}"
            fill="rgba(255,255,255,.14)" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/>
      <g clip-path="url(#prClip${i})">
        <rect id="prWaterR${i}" x="${g.x}" y="${g.y + g.h}" width="${g.w}" height="0" fill="url(#prWater${i})"/>
      </g>
      ${ticks}
      <g>
        <circle cx="${cx - ex}" cy="${eyeY}" r="6.2" fill="#fff"/>
        <circle cx="${cx + ex}" cy="${eyeY}" r="6.2" fill="#fff"/>
        <circle cx="${cx - ex}" cy="${eyeY + 0.5}" r="3.3" fill="#173a4a"/>
        <circle cx="${cx + ex}" cy="${eyeY + 0.5}" r="3.3" fill="#173a4a"/>
        <circle class="pr-eye-hl" cx="${cx - ex - 1.3}" cy="${eyeY - 1.4}" r="1.4"/>
        <circle class="pr-eye-hl" cx="${cx + ex - 1.3}" cy="${eyeY - 1.4}" r="1.4"/>
        <circle cx="${cx - ex - 2}" cy="${eyeY + 9}" r="4.6" fill="#ff7fb6" opacity=".5"/>
        <circle cx="${cx + ex + 2}" cy="${eyeY + 9}" r="4.6" fill="#ff7fb6" opacity=".5"/>
        <path id="prMouth${i}" d="M${cx - 9} ${eyeY + 11} Q${cx} ${eyeY + 17} ${cx + 9} ${eyeY + 11}"
              stroke="#173a4a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      </g>
    </svg>`;
  },

  setPouring(i) {
    if (this.pouring === i) return;
    if (this.pouring >= 0 && this.vessels[this.pouring]) this.vessels[this.pouring].stream.classList.remove("on");
    this.pouring = i;
    if (i >= 0 && this.vessels[i] && !this.vessels[i].full) {
      this.vessels[i].stream.classList.add("on");
      this.lastPour = performance.now();
    }
  },

  frame(t) {
    const dt = Math.min(60, t - this.lastT) / 1000;
    this.lastT = t;
    const area = $("playArea");
    if (!area || !area.isConnected || !$("prStage") || this.done) return;

    const now = t;
    // Active hold pours into the chosen vessel.
    if (this.pouring >= 0 && this.vessels[this.pouring] && !this.vessels[this.pouring].full) {
      this.pour(this.vessels[this.pouring], 0.5 * dt);
      this.lastPour = now;
    }

    // Passive-player rescue: after a few idle seconds with nothing filling, a helping hand
    // gently pours into the emptiest cup on its own, so a child who never touches still
    // completes the round.
    if (!this.allFull() && now - this.lastPour > 4500) {
      if (!this.helped) { speak(prL(PR_TXT.help)); this.helped = true; }
      const target = this.vessels.filter(v => !v.full).sort((a, b) => a.level - b.level)[0];
      if (target) {
        target.el.classList.add("pr-hint");
        this.pour(target, 0.28 * dt);
      }
    } else {
      this.vessels.forEach(v => v.el && v.el.classList.remove("pr-hint"));
    }
  },

  pour(v, amount) {
    if (v.full) return;
    v.level = clamp(v.level + amount, 0, 1);
    const g = v.geo;
    const wr = $("prWaterR" + v.idx);
    if (wr) { const h = g.h * v.level; wr.setAttribute("y", (g.y + g.h - h).toFixed(1)); wr.setAttribute("height", h.toFixed(1)); }

    const lit = Math.min(v.cap, Math.floor(v.level * v.cap + 1e-6));
    if (lit > v.lit) {
      for (let k = v.lit; k < lit && k < v.cap - 1; k++) {
        const tk = $(`prTick${v.idx}_${k}`);
        if (tk) { tk.setAttribute("stroke", "#eaffff"); tk.style.opacity = ".95"; }
      }
      v.lit = lit;
      const cnt = $("prCount" + v.idx);
      if (cnt) cnt.textContent = lit;
      tone(360 + lit * 70, 0, .12, "sine", .13);
      if (!this.reduced) {
        const r = v.el.getBoundingClientRect();
        floaters(["💧", "🫧"], r.left + r.width / 2, r.top + r.height * 0.4, 3);
      }
    }

    if (v.level >= 1 && !v.full) this.fill(v);
  },

  fill(v) {
    v.full = true;
    v.stream.classList.remove("on");
    if (this.pouring === v.idx) this.pouring = -1;
    const badge = $("prBadge" + v.idx);
    if (badge) { badge.textContent = v.cap; badge.classList.add("on"); }
    const mouth = $("prMouth" + v.idx);           // widen into a happy grin when full
    if (mouth) { const g = v.geo, cx = g.x + g.w / 2, my = g.y + g.h * 0.30 + 11;
                 mouth.setAttribute("d", `M${cx - 11} ${my} Q${cx} ${my + 9} ${cx + 11} ${my}`); }
    v.el.classList.remove("pr-hint");
    v.el.classList.add("pr-win");
    sfx.tap();
    speak(prL(PR_TXT.full).replace("{n}", v.cap));
    if (!this.reduced) {
      const r = v.el.getBoundingClientRect();
      miniStar(r.left + r.width / 2, r.top + r.height * 0.3);
    }
    if (this.allFull()) this.finish();
  },

  allFull() { return this.vessels.every(v => v.full); },

  finish() {
    if (this.done) return;
    this.done = true;
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    const max = Math.max(...this.vessels.map(v => v.cap));
    const winners = this.vessels.filter(v => v.cap === max);
    winners.forEach(v => { v.el.classList.remove("pr-win"); void v.el.offsetWidth; v.el.classList.add("pr-win"); });
    core.wait(() => {
      if (winners.length === 1) speak(prL(PR_TXT.most).replace("{name}", prL(winners[0].name)));
      else speak(prL(PR_TXT.same).replace("{n}", max));
      core.wait(() => { if (!$("prStage")) return; speak(praise()); roundComplete(); }, 1700);
    }, 550);
  },

  cleanup() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    if (this.vessels) this.vessels.forEach(v => {
      if (v.el && v._down) {
        v.el.removeEventListener("pointerdown", v._down);
        v.el.removeEventListener("pointerup", v._up);
        v.el.removeEventListener("pointercancel", v._up);
      }
    });
    this.pouring = -1;
    this._stage = null;
  }
};

registerGame({
  id: "pour", world: "brain", icon: "💧", name: "Fill It Up!", es: "¡A Llenar!", yue: "裝滿水",
  lvl: 1, v: 54, cue: "splash", level: pourLevel
});
