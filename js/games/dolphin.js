"use strict";
// Spatial reasoning · positional / directional language (over, under, left, right) · age 2-4
// Success = child sends the dolphin through the ring the voice names by its position,
//           mapping a spoken direction word to a place in space.

// Drawn hero dolphin (side view, facing right, mid-leap).
const DOLPHIN_ART = `<svg viewBox="0 0 150 108" width="100%" height="100%">
  <defs>
    <linearGradient id="dlBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8ec6e6"/><stop offset="1" stop-color="#4d84ab"/>
    </linearGradient>
  </defs>
  <g transform="rotate(-10 75 60)">
    <!-- tail flukes -->
    <path d="M20 58 Q2 44 16 44 Q14 54 30 60 Z" fill="#3f6e90"/>
    <path d="M18 64 Q4 80 18 74 Q18 64 32 62 Z" fill="#3a6484"/>
    <!-- body -->
    <path d="M26 60 Q60 40 104 42 Q132 43 144 30 Q140 46 126 52
             Q140 56 146 50 Q134 70 100 70 Q60 72 34 66 Q26 64 26 60 Z" fill="url(#dlBody)"/>
    <!-- lighter belly -->
    <path d="M40 65 Q72 74 112 68 Q96 74 66 73 Q50 72 40 65 Z" fill="#dff1fb" opacity=".9"/>
    <!-- beak -->
    <path d="M126 52 Q142 52 150 56 Q142 60 126 58 Z" fill="#4d84ab"/>
    <!-- dorsal fin -->
    <path d="M66 45 Q74 24 90 40 Q80 42 66 45 Z" fill="#3f6e90"/>
    <!-- pectoral fin -->
    <path d="M78 66 Q86 84 104 74 Q92 70 78 66 Z" fill="#3a6484"/>
    <!-- eye + smile -->
    <circle cx="121" cy="52" r="3.4" fill="#12303f"/>
    <path d="M128 60 Q136 64 145 60" stroke="#12303f" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;

// this game holds its strings inline (like Night & Day) rather than in the core DICT
const dlL = obj => obj[curLang()] || obj.en;

// each position: where the ring sits (% of play area) + all its spoken lines
const DL_POS = {
  over: {
    x: 50, y: 20,
    show: { en: "🐬 Jump OVER the wave!", es: "🐬 ¡Salta POR ENCIMA de la ola!", yue: "🐬 跳過個浪！" },
    say:  { en: "Tap the ring above the wave so the dolphin can jump over!", es: "¡Toca el aro sobre la ola para que el delfín salte!", yue: "㩒個浪上面嘅圈圈，海豚就可以跳過去！" },
    redirect: { en: "Look up high, over the wave!", es: "¡Mira arriba, por encima de la ola!", yue: "睇上面，跳過個浪！" },
    yes:  { en: "Over the wave — wheee!", es: "¡Por encima de la ola, yupi!", yue: "跳過個浪，好嘢！" }
  },
  under: {
    x: 50, y: 82,
    show: { en: "🐬 Dive UNDER the wave!", es: "🐬 ¡Bucea POR DEBAJO de la ola!", yue: "🐬 潛落個浪下面！" },
    say:  { en: "Tap the ring below the wave so the dolphin can dive under!", es: "¡Toca el aro bajo la ola para que el delfín bucee!", yue: "㩒個浪下面嘅圈圈，海豚就可以潛落去！" },
    redirect: { en: "Look down low, under the wave!", es: "¡Mira abajo, por debajo de la ola!", yue: "睇下面，潛落個浪！" },
    yes:  { en: "Under the wave — splash!", es: "¡Por debajo de la ola, splash!", yue: "潛落個浪，撲通！" }
  },
  left: {
    x: 15, y: 50,
    show: { en: "🐬 Swim to the LEFT!", es: "🐬 ¡Nada a la IZQUIERDA!", yue: "🐬 游去左邊！" },
    say:  { en: "Tap the ring on the left side!", es: "¡Toca el aro del lado izquierdo!", yue: "㩒左邊嘅圈圈！" },
    redirect: { en: "Look to the left!", es: "¡Mira a la izquierda!", yue: "睇左邊！" },
    yes:  { en: "To the left — great swimming!", es: "¡A la izquierda, qué bien nadas!", yue: "游去左邊，好叻！" }
  },
  right: {
    x: 85, y: 50,
    show: { en: "🐬 Swim to the RIGHT!", es: "🐬 ¡Nada a la DERECHA!", yue: "🐬 游去右邊！" },
    say:  { en: "Tap the ring on the right side!", es: "¡Toca el aro del lado derecho!", yue: "㩒右邊嘅圈圈！" },
    redirect: { en: "Look to the right!", es: "¡Mira a la derecha!", yue: "睇右邊！" },
    yes:  { en: "To the right — great swimming!", es: "¡A la derecha, qué bien nadas!", yue: "游去右邊，好叻！" }
  }
};

const DL_HOME = { x: 50, y: 50 };

const dolphinLevel = {
  theme: "theme-ocean", rounds: 5,

  makeRound(tier) {
    if (tier <= 0) {
      const shown = ["over", "under"];
      return { shown, target: rand(shown) };
    }
    if (tier === 1) {
      const shown = Math.random() < 0.5 ? ["over", "under"] : ["left", "right"];
      return { shown, target: rand(shown) };
    }
    const shown = ["over", "under", "left", "right"];
    return { shown, target: rand(shown) };
  },

  startRound() {
    this.wrong = 0;
    this.done = false;
    const { shown, target } = this.makeRound(state.tier);
    this.target = target;

    setInstruction(dlL(DL_POS[target].show), dlL(DL_POS[target].say));

    const rings = shown.map(pos =>
      `<button class="dl-ring" data-pos="${pos}" style="left:${DL_POS[pos].x}%;top:${DL_POS[pos].y}%"></button>`
    ).join("");

    $("playArea").innerHTML = `
      <style>
        .dl-stage{position:absolute;inset:0;overflow:hidden;z-index:5}
        .dl-wave{position:absolute;left:-2%;right:-2%;top:43%;height:12%;pointer-events:none}
        .dl-wave svg{width:100%;height:100%}
        .dl-floor{position:absolute;left:0;right:0;bottom:0;height:12%;background:linear-gradient(rgba(226,201,140,0),#e2c98c 60%);pointer-events:none}
        .dl-bubble{position:absolute;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.9),rgba(255,255,255,.15));animation:dlRise linear infinite;pointer-events:none}
        @keyframes dlRise{0%{transform:translateY(0);opacity:.7}100%{transform:translateY(-70vh);opacity:0}}
        .dl-ring{position:absolute;width:clamp(58px,15vmin,120px);height:clamp(58px,15vmin,120px);transform:translate(-50%,-50%);border-radius:50%;
                 border:clamp(7px,1.9vmin,15px) solid rgba(255,255,255,.92);background:rgba(255,255,255,.12);
                 box-shadow:0 0 16px rgba(255,255,255,.55),inset 0 0 14px rgba(140,220,255,.5);cursor:pointer;touch-action:manipulation;transition:transform .15s}
        .dl-ring:active{transform:translate(-50%,-50%) scale(.94)}
        .dl-ring.dl-hint{animation:dlPulse .7s ease-in-out infinite}
        @keyframes dlPulse{0%,100%{box-shadow:0 0 16px rgba(255,255,255,.55),inset 0 0 14px rgba(140,220,255,.5)}50%{box-shadow:0 0 30px 8px rgba(255,240,140,.95),inset 0 0 18px rgba(255,240,140,.7)}}
        .dl-ring.dl-cleared{border-color:#ffe36b;box-shadow:0 0 34px 10px rgba(255,227,107,.9)}
        .dl-dolphin{position:absolute;width:clamp(92px,26vmin,180px);height:auto;transform:translate(-50%,-50%);
                    transition:left .85s cubic-bezier(.4,0,.3,1),top .85s cubic-bezier(.4,0,.3,1),transform .85s ease;z-index:6;pointer-events:none;filter:drop-shadow(0 6px 8px rgba(0,40,70,.35))}
        .dl-dolphin.dl-face-left{transform:translate(-50%,-50%) scaleX(-1)}
      </style>
      <div class="dl-stage" id="dlStage">
        <div class="dl-wave">
          <svg viewBox="0 0 400 40" preserveAspectRatio="none">
            <path d="M0 22 Q25 6 50 22 T100 22 T150 22 T200 22 T250 22 T300 22 T350 22 T400 22 V40 H0 Z" fill="rgba(255,255,255,.22)"/>
            <path d="M0 22 Q25 6 50 22 T100 22 T150 22 T200 22 T250 22 T300 22 T350 22 T400 22" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="3"/>
          </svg>
        </div>
        <div class="dl-floor"></div>
        ${rings}
        <div class="dl-dolphin" id="dlDolphin" style="left:${DL_HOME.x}%;top:${DL_HOME.y}%">${DOLPHIN_ART}</div>
      </div>`;

    // ambient bubbles
    const stage = $("dlStage");
    for (let i = 0; i < 8; i++) {
      const b = document.createElement("span");
      b.className = "dl-bubble";
      const sz = randBetween(6, 16);
      b.style.width = b.style.height = sz + "px";
      b.style.left = randBetween(4, 96) + "%";
      b.style.bottom = randBetween(-10, 30) + "%";
      b.style.animationDuration = randBetween(6, 11) + "s";
      b.style.animationDelay = -randBetween(0, 8) + "s";
      stage.appendChild(b);
    }

    $("dlStage").querySelectorAll(".dl-ring").forEach(r =>
      r.onclick = ev => this.pick(r.dataset.pos, r, ev)
    );
  },

  pick(pos, ring, ev) {
    if (this.done) return;

    if (pos === this.target) { this.swimTo(pos, ring); return; }

    // wrong ring — never a fail state, just a positional re-cue that escalates into an assist
    this.wrong++;
    sfx.bad();
    wiggle(ring);
    speak(dlL(DL_POS[this.target].redirect));

    const good = $("dlStage").querySelector(`.dl-ring[data-pos="${this.target}"]`);
    if (this.wrong >= 3) {
      this.done = true;
      core.wait(() => this.swimTo(this.target, good), 750);
    } else if (this.wrong === 2 && good) {
      good.classList.add("dl-hint");
    }
  },

  swimTo(pos, ring) {
    this.done = true;
    state.busy = true;
    $("dlStage").querySelectorAll(".dl-ring").forEach(r => (r.onclick = null));
    ring.classList.remove("dl-hint");
    ring.classList.add("dl-cleared");

    const dolphin = $("dlDolphin");
    const p = DL_POS[pos];
    dolphin.style.left = p.x + "%";
    dolphin.style.top = p.y + "%";
    if (pos === "left") dolphin.classList.add("dl-face-left");

    sfx.tap();
    const rr = ring.getBoundingClientRect();
    const cx = rr.left + rr.width / 2, cy = rr.top + rr.height / 2;
    miniStar(cx, cy);
    floaters(["✨", "💧", "🫧"], cx, cy, 5);
    tone(pos === "over" ? 720 : pos === "under" ? 380 : 540, 0, .22, "sine", .15);

    speak(dlL(DL_POS[pos].yes) + " " + praise());
    roundComplete();
  }
};
