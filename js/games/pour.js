"use strict";
// Measurement / comparison · capacity — which container holds MORE? · age 3-4
// STEM objective: capacity (volume a container holds) — a distinct measurement sub-concept
// from height/quantity. Child pours water in real time (hold to pour) and discovers that
// the bigger container needs MORE water, and that a taller shape can hold the SAME as a
// wider one (a gentle first taste of conservation). Real-time, child-driven mechanic:
// the pouring IS the learning practice, not a tap-and-wait.

// Inline strings (like Dolphin Dive / Night & Day) — self-contained, no core DICT edits.
const puL = obj => obj[curLang()] || obj.en;

const PU_TXT = {
  // tier 0 / 1: pick and fill the biggest
  showMore: { en: "💧 Fill the one that holds MORE!", es: "💧 ¡Llena el que tiene MÁS!", yue: "💧 裝滿裝得最多嗰個！" },
  sayMore:  { en: "Hold the BIGGEST cup to pour water in. Which one holds more?",
              es: "Mantén el dedo en el vaso más GRANDE para echar agua. ¿Cuál tiene más?",
              yue: "㩒住最大嗰個杯倒水入去。邊個裝得多啲？" },
  yesMore:  { en: "Yes! The BIG cup holds MORE water!",
              es: "¡Sí! ¡El vaso GRANDE tiene MÁS agua!",
              yue: "啱喇！大杯裝得多啲水！" },
  wrong:    { en: "That one is full! But the BIG cup holds more. Try the big one!",
              es: "¡Ese ya está lleno! Pero el vaso GRANDE tiene más. ¡Prueba el grande!",
              yue: "嗰個滿咗喇！不過大杯裝得多啲。試下大杯啦！" },
  hint:     { en: "Here — this one holds the most!",
              es: "¡Aquí! Este tiene más.",
              yue: "呢度！呢個裝得最多。" },
  // tier 2: same amount, different shape (conservation)
  showBoth: { en: "💧 Fill them both up!", es: "💧 ¡Llena los dos!", yue: "💧 兩個都裝滿佢！" },
  sayBoth:  { en: "Hold each one to fill it. Do they hold the same?",
              es: "Mantén el dedo en cada uno para llenarlo. ¿Tienen lo mismo?",
              yue: "㩒住每一個嚟裝水。佢哋係咪一樣多？" },
  yesSame:  { en: "Look! They hold the SAME amount!",
              es: "¡Mira! ¡Tienen lo MISMO!",
              yue: "睇下！佢哋一樣咁多！" }
};

// A drawn-SVG face — the "hero" on every jar. Eyes-with-a-highlight + rosy cheeks + smile,
// per the art style guide. It sits high on the glass so the rising water never hides it.
const PU_FACE = mood => `<svg viewBox="0 0 100 70" width="100%" height="100%">
  <circle cx="34" cy="30" r="12" fill="#fff"/>
  <circle cx="66" cy="30" r="12" fill="#fff"/>
  <circle cx="36" cy="32" r="6.2" fill="#25405a"/>
  <circle cx="64" cy="32" r="6.2" fill="#25405a"/>
  <circle cx="33.5" cy="29" r="2.2" fill="#fff"/>
  <circle cx="61.5" cy="29" r="2.2" fill="#fff"/>
  <circle cx="22" cy="46" r="7" fill="#ff7fb6" opacity=".5"/>
  <circle cx="78" cy="46" r="7" fill="#ff7fb6" opacity=".5"/>
  ${mood === "full"
    ? `<path d="M34 46 Q50 64 66 46" stroke="#25405a" stroke-width="5" fill="none" stroke-linecap="round"/>`
    : `<path d="M38 48 Q50 58 62 48" stroke="#25405a" stroke-width="5" fill="none" stroke-linecap="round"/>`}
</svg>`;

const pourLevel = {
  theme: "theme-ocean", rounds: 5, raf: null,

  startRound() {
    this.cleanup();
    this.done = false;
    this.mistakes = 0;              // local, for the assist ladder (startRound must set a number)
    this.assisting = false;
    this.idleNudged = false;
    this.reduced = reducedMotion();
    this.active = -1;               // index currently being poured into (-1 = none)
    this.lastActivity = performance.now();

    // Build this round's containers. Capacity == on-screen area (w*h vmin), so a bigger
    // jar visibly holds more, and a constant pour makes the big one take the most water.
    const tier = state.tier;
    let jars;                      // {w, h, shape}
    if (tier === 0) {
      jars = [{ w: 27, h: 39, shape: "cup" }, { w: 20, h: 26, shape: "cup" }];
    } else if (tier === 1) {
      jars = [{ w: 20, h: 25, shape: "cup" }, { w: 24, h: 31, shape: "cup" }, { w: 30, h: 41, shape: "cup" }];
    } else {
      // conservation: equal area (840), different silhouette — tall-thin vs short-wide
      jars = [{ w: 20, h: 42, shape: "tall" }, { w: 35, h: 24, shape: "wide" }];
    }
    jars.forEach(j => { j.cap = j.w * j.h; j.level = 0; j.locked = false; });
    jars = shuffle(jars);
    this.jars = jars;
    this.maxCap = Math.max(...jars.map(j => j.cap));
    // tier 0/1: fill the biggest. tier 2: fill them all (discover they're the same).
    this.targets = tier === 2 ? jars.map((_, i) => i) : [jars.findIndex(j => j.cap === this.maxCap)];
    this.pourVol = this.maxCap / 3.2;                 // biggest jar fills in ~3.2s of holding

    setInstruction(
      tier === 2 ? puL(PU_TXT.showBoth) : puL(PU_TXT.showMore),
      tier === 2 ? puL(PU_TXT.sayBoth)  : puL(PU_TXT.sayMore)
    );

    const jarHTML = jars.map((j, i) => `
      <button class="pu-jar" id="pu${i}" data-i="${i}"
              style="width:${j.w}vmin;height:${j.h}vmin" aria-label="cup">
        <div class="pu-glass">
          <div class="pu-fill" id="puFill${i}"></div>
          <div class="pu-shine"></div>
        </div>
        <div class="pu-face" id="puFace${i}">${PU_FACE("idle")}</div>
        <div class="pu-stream" id="puStream${i}"></div>
      </button>`).join("");

    $("playArea").innerHTML =
      scene.html("reef", { seed: 11 + state.round * 6, layers: ["canopy", "far", "drift", "motes", "frame"] }) +
      `<style>
        .pu-stage{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;
                  gap:clamp(14px,5vmin,52px);padding:0 4vmin 8vmin;z-index:5}
        .pu-jar{position:relative;background:none;border:none;padding:0;cursor:pointer;
                touch-action:none;-webkit-tap-highlight-color:transparent;transition:transform .12s}
        .pu-jar:active{transform:scale(.97)}
        .pu-jar.pu-win{animation:puWin .5s ease}
        @keyframes puWin{0%,100%{transform:translateY(0)}45%{transform:translateY(-6%) scale(1.05)}}
        .pu-glass{position:absolute;inset:0;border:clamp(3px,1vmin,7px) solid rgba(255,255,255,.85);
                  border-top:none;border-radius:8% 8% 26% 26%/4% 4% 16% 16%;overflow:hidden;
                  background:linear-gradient(rgba(210,240,255,.14),rgba(160,215,245,.24));
                  box-shadow:inset 0 0 10px rgba(120,190,235,.35),0 6px 12px rgba(0,60,100,.18)}
        .pu-fill{position:absolute;left:0;right:0;bottom:0;height:0%;
                 background:linear-gradient(#7ecbff,#2f8fd6);border-radius:0 0 22% 22%/0 0 14% 14%;
                 box-shadow:inset 0 4px 6px rgba(255,255,255,.35)}
        .pu-fill::before{content:"";position:absolute;left:0;right:0;top:-3px;height:6px;border-radius:50%;
                 background:rgba(255,255,255,.55)}
        .pu-shine{position:absolute;top:8%;left:14%;width:12%;height:70%;border-radius:40%;
                  background:linear-gradient(rgba(255,255,255,.55),rgba(255,255,255,0));pointer-events:none}
        .pu-face{position:absolute;top:8%;left:50%;transform:translateX(-50%);width:56%;height:32%;
                 pointer-events:none;z-index:2}
        .pu-jar.pu-target-hint .pu-glass{border-color:#ffe36b;box-shadow:0 0 0 4px rgba(255,227,107,.6),
                 inset 0 0 12px rgba(120,190,235,.4)}
        .pu-stream{position:absolute;left:50%;top:-16%;width:8%;height:22%;transform:translateX(-50%);
                   background:linear-gradient(rgba(126,203,255,0),#7ecbff);border-radius:40%;
                   opacity:0;pointer-events:none}
        .pu-jar.pu-pouring .pu-stream{opacity:.9;animation:puPour .5s linear infinite}
        @keyframes puPour{0%{transform:translateX(-50%) scaleY(.7)}50%{transform:translateX(-50%) scaleY(1.1)}100%{transform:translateX(-50%) scaleY(.7)}}
        @media (prefers-reduced-motion: reduce){.pu-jar.pu-pouring .pu-stream{animation:none}}
      </style>
      <div class="pu-stage" id="puStage">${jarHTML}</div>`;

    const stage = $("puStage");
    this._stage = stage;
    this._down = ev => {
      const jar = ev.target.closest(".pu-jar");
      if (!jar || this.done) return;
      const i = +jar.dataset.i;
      if (this.jars[i].locked) return;
      this.active = i;
      this.lastActivity = performance.now();
      this.idleNudged = false;
      this.clearHint();
      jar.classList.add("pu-pouring");
      try { jar.setPointerCapture(ev.pointerId); } catch (_) {}
    };
    this._up = () => {
      if (this.active >= 0) { const el = $("pu" + this.active); if (el) el.classList.remove("pu-pouring"); }
      this.active = -1;
    };
    stage.addEventListener("pointerdown", this._down);
    stage.addEventListener("pointerup", this._up);
    stage.addEventListener("pointercancel", this._up);
    stage.addEventListener("pointerleave", this._up);

    this.lastT = performance.now();
    const loop = t => { this.frame(t); if (this.raf !== null) this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  },

  frame(t) {
    const dt = Math.min(60, t - this.lastT) / 1000;
    this.lastT = t;
    // If we've left this screen (nav to hub, next round), stop the loop cleanly.
    if (this.done || !this._stage || !this._stage.isConnected) { this.stopRaf(); return; }

    const now = performance.now();

    // Auto-assist: rescue a passive or repeatedly-missing player. Pour the next unfilled
    // target for her so a round can never stall.
    if (this.assisting) {
      const tgt = this.targets.find(i => this.jars[i].level < 0.999);
      if (tgt === undefined) { this.finish(); return; }
      this.pourInto(tgt, dt * 2.4);
    } else if (this.active >= 0 && !this.jars[this.active].locked) {
      this.pourInto(this.active, dt);
    } else {
      // idle nudges — she isn't pouring anything
      const idle = now - this.lastActivity;
      if (idle > 4500 && !this.idleNudged) {
        this.idleNudged = true;
        this.hintTargets();
        speak(puL(PU_TXT.hint));
      }
      if (idle > 7500) this.beginAssist();
    }
  },

  pourInto(i, dt) {
    const j = this.jars[i];
    if (j.locked || j.level >= 0.999) return;
    const prev = j.level;
    j.level = Math.min(1, j.level + (this.pourVol * dt) / j.cap);
    const fill = $("puFill" + i);
    if (fill) fill.style.height = (j.level * 100).toFixed(1) + "%";
    // a soft rising blip as the level climbs (every ~15%), never a continuous drone
    if (Math.floor(j.level / 0.15) > Math.floor(prev / 0.15) && j.level < 0.999)
      tone(360 + j.level * 520, 0, .09, "sine", .07);
    if (j.level >= 0.999 && prev < 0.999) this.onFull(i);
  },

  onFull(i) {
    const jar = $("pu" + i);
    const face = $("puFace" + i);
    if (face) face.innerHTML = PU_FACE("full");
    const isTarget = this.targets.includes(i);

    if (isTarget) {
      // remove this target from what's left; when none remain, the round is won
      const remaining = this.targets.filter(k => this.jars[k].level < 0.999);
      if (jar) { jar.classList.add("pu-win"); const c = centerOf(jar); miniStar(c.x, c.y);
                 if (!this.reduced) floaters(["💧", "✨", "🫧"], c.x, c.y, 5); }
      if (remaining.length === 0) {
        this.done = true; this.active = -1;
        const say = state.tier === 2 ? puL(PU_TXT.yesSame) : puL(PU_TXT.yesMore);
        speak(say + " " + praise());
        core.wait(() => this.finish(), 40);
      }
    } else {
      // filled a smaller cup by mistake (tier 0/1). No fail — gently redirect and drain it
      // back so she can try the big one. Repeated misses escalate to the assist.
      this.mistakes++;
      sfx.bad();                      // also feeds the auto-difficulty model via roundMistakes
      speak(puL(PU_TXT.wrong));
      j_drain(this, i);
      if (this.mistakes >= 3) this.beginAssist();
    }
  },

  beginAssist() {
    if (this.assisting || this.done) return;
    this.assisting = true;
    this.active = -1;
    this.hintTargets();
    speak(puL(PU_TXT.hint));
  },

  hintTargets() {
    this.targets.forEach(i => { const el = $("pu" + i); if (el) el.classList.add("pu-target-hint"); });
  },
  clearHint() {
    if (!this.jars) return;
    this.jars.forEach((_, i) => { const el = $("pu" + i); if (el) el.classList.remove("pu-target-hint"); });
  },

  finish() {
    if (this._finished) return;
    this._finished = true;
    this.done = true;
    this.cleanup();
    roundComplete();
  },

  stopRaf() { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; } },

  cleanup() {
    this.stopRaf();
    if (this._stage) {
      this._stage.removeEventListener("pointerdown", this._down);
      this._stage.removeEventListener("pointerup", this._up);
      this._stage.removeEventListener("pointercancel", this._up);
      this._stage.removeEventListener("pointerleave", this._up);
      this._stage = null;
    }
    this.active = -1;
    this._finished = false;
  }
};

// Drain a mistakenly-filled cup back to empty over a short beat, then unlock it.
function j_drain(level, i) {
  const j = level.jars[i];
  j.locked = true;
  const fill = $("puFill" + i);
  const face = $("puFace" + i);
  const step = () => {
    j.level = Math.max(0, j.level - 0.12);
    if (fill) fill.style.height = (j.level * 100).toFixed(1) + "%";
    if (j.level > 0) core.wait(step, 40);
    else { j.locked = false; if (face) face.innerHTML = PU_FACE("idle"); }
  };
  step();
}

registerGame({
  id: "pour", world: "brain", icon: "🫗", name: "Fill It Up", es: "Llénalo",
  yue: "裝滿佢", lvl: 1, cue: "splash", v: 54, level: pourLevel
});
