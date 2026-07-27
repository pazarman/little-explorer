"use strict";
// Patterns / logic · rhythm + timing (tap to swing) with counting · age 3-5
// Success = child taps in time to swing the monkey up and grab bananas at different heights.

const moL = obj => obj[curLang()] || obj.en;

const MO_TXT = {
  show: { en: "🐒 Swing and grab the bananas!", es: "🐒 ¡Balancéate y agarra los guineos!", yue: "🐒 盪過去攞香蕉！" },
  say:  { en: "Tap the screen to swing the monkey up and catch the bananas!",
          es: "¡Toca la pantalla para que el mono salte y atrape los guineos!",
          yue: "㩒下畫面，等馬騮盪高啲，接住香蕉！" }
};

const MO_TREES = "🌴 🌳 🌿 🌴 🍃 🌳 ";

const monkeyLevel = {
  theme: "theme-zoo", rounds: 5, raf: null,

  startRound() {
    this.cleanup();
    this.done = false;
    this.got = 0;
    this.goal = [4, 5, 6][state.tier];
    this.speedMul = [1, 1.25, 1.5][state.tier];
    this.bananas = [];
    this.spawnIn = 0.6;

    setInstruction(moL(MO_TXT.show), moL(MO_TXT.say));

    const pips = Array.from({ length: this.goal }, (_, i) => `<span class="mo-pip" data-i="${i}">◯</span>`).join("");
    $("playArea").innerHTML = `
      <style>
        .mo-stage{position:absolute;inset:0;overflow:hidden;z-index:5;touch-action:none;cursor:pointer}
        .mo-canopy{position:absolute;top:0;left:0;right:0;height:16%;overflow:hidden;white-space:nowrap;font-size:clamp(30px,9vmin,64px);z-index:1;opacity:.9}
        .mo-far{position:absolute;bottom:20%;left:0;right:0;overflow:hidden;white-space:nowrap;font-size:clamp(20px,6vmin,44px);opacity:.5;z-index:1}
        .mo-ground{position:absolute;left:0;right:0;bottom:0;height:20%;background:linear-gradient(#c8e89a,#8fc85a 55%,#6fb23f);pointer-events:none;z-index:1}
        .mo-hud{position:absolute;top:17%;left:50%;transform:translateX(-50%);display:flex;gap:clamp(3px,1vmin,7px);z-index:9;background:rgba(30,80,20,.32);padding:clamp(3px,1vmin,7px) clamp(8px,2.4vmin,16px);border-radius:999px}
        .mo-pip{font-size:clamp(15px,4vmin,26px);line-height:1;color:#eafbe0}
        .mo-pip.on{color:#ffd23e}
        .mo-banana{position:absolute;font-size:clamp(30px,8.5vmin,60px);line-height:1;transform:translate(-50%,-50%);z-index:4;pointer-events:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.25))}
        .mo-banana.got{animation:moPop .3s ease forwards}
        @keyframes moPop{0%{transform:translate(-50%,-50%) scale(1)}100%{transform:translate(-50%,-50%) scale(1.6);opacity:0}}
        .mo-monkey{position:absolute;font-size:clamp(56px,16vmin,120px);line-height:1;transform:translate(-50%,-50%);z-index:6;pointer-events:none;filter:drop-shadow(0 5px 6px rgba(0,0,0,.3));will-change:top,transform}
      </style>
      <div class="mo-stage" id="moStage">
        <div class="mo-canopy"><span class="marquee" style="animation-duration:${(18 / this.speedMul).toFixed(1)}s">${MO_TREES.repeat(6)}</span></div>
        <div class="mo-far"><span class="marquee" style="animation-duration:${(26 / this.speedMul).toFixed(1)}s">${MO_TREES.repeat(6)}</span></div>
        <div class="mo-ground"></div>
        <div class="mo-hud" id="moHud">${pips}</div>
        <div class="mo-bananas" id="moBananas"></div>
        <div class="mo-monkey" id="moMonkey">🐒</div>
      </div>`;

    const stage = $("moStage");
    const H0 = stage.clientHeight || $("playArea").clientHeight;
    this.groundY = H0 * 0.78;
    this.ceilY = H0 * 0.24;
    this.y = this.groundY;
    this.vy = 0;
    this.g = H0 * 2.4;
    this.jumpV = H0 * 1.5;
    this.monkey = $("moMonkey");
    this.monkey.style.left = "22%";
    this.monkey.style.top = this.y + "px";

    this._tap = () => this.jump();
    stage.addEventListener("pointerdown", this._tap);
    this._stage = stage;

    this.lastT = performance.now();
    const loop = t => { this.frame(t); if (this.raf !== null) this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  },

  jump() {
    if (this.done) return;
    this.vy = -this.jumpV;   // tap swings the monkey up; taps chain for extra lift
    sfx.tap();
    tone(500, 0, .08, "sine", .1);
  },

  frame(t) {
    const dt = Math.min(50, t - this.lastT) / 1000;
    this.lastT = t;
    if (!$("playArea").isConnected || !$("moBananas") || this.done) return;
    const stage = this._stage;
    const W = stage.clientWidth, H = stage.clientHeight;
    this.groundY = H * 0.78; this.ceilY = H * 0.24;

    // monkey physics: tap = up impulse, gravity pulls back to the ground (never falls off)
    this.vy += this.g * dt;
    this.y += this.vy * dt;
    if (this.y >= this.groundY) { this.y = this.groundY; this.vy = 0; }
    if (this.y < this.ceilY) { this.y = this.ceilY; this.vy = 0; }
    const rot = clamp(this.vy * 0.03, -22, 26);
    this.monkey.style.top = this.y + "px";
    this.monkey.style.transform = `translate(-50%,-50%) rotate(${rot.toFixed(1)}deg) scaleX(-1)`;

    // spawn bananas — bias toward reachable heights, some low enough to grab while running
    this.spawnIn -= dt;
    if (this.spawnIn <= 0 && this.bananas.filter(b => !b.hit).length < 3 && this.got < this.goal) {
      this.spawnBanana(W, H);
      this.spawnIn = randBetween(0.85, 1.4) / this.speedMul;
    }

    const monkeyCX = W * 0.22;
    const speed = (W / 700) * 150 * this.speedMul;
    for (const bn of this.bananas) {
      if (bn.hit) continue;
      bn.x -= speed * dt;
      bn.el.style.left = bn.x + "px";
      if (Math.abs(bn.x - monkeyCX) < W * 0.1 && Math.abs(bn.y - this.y) < H * 0.07) this.grab(bn);
    }
    this.bananas = this.bananas.filter(bn => {
      if (bn.hit) return false;
      if (bn.x < -60) { if (bn.el.isConnected) bn.el.remove(); return false; }
      return true;
    });
  },

  spawnBanana(W, H) {
    const el = document.createElement("div");
    el.className = "mo-banana";
    el.textContent = "🍌";
    // 45% low (grabbable at a run / small hop), rest spread up toward the canopy
    const low = Math.random() < 0.45;
    const y = low
      ? randBetween(this.groundY - H * 0.06, this.groundY)
      : randBetween(this.ceilY + H * 0.02, this.groundY - H * 0.08);
    const x = W + 50;
    el.style.left = x + "px";
    el.style.top = y + "px";
    $("moBananas").appendChild(el);
    this.bananas.push({ el, x, y, hit: false });
  },

  grab(bn) {
    bn.hit = true;
    bn.el.classList.add("got");
    core.wait(() => { if (bn.el.isConnected) bn.el.remove(); }, 300);
    const r = bn.el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    sfx.tap();
    this.got++;
    tone(560 + this.got * 70, 0, .14, "sine", .14);
    miniStar(cx, cy);
    floaters(["⭐", "✨"], cx, cy, 3);
    const pip = $("moHud") && $("moHud").querySelector(`.mo-pip[data-i="${this.got - 1}"]`);
    if (pip) { pip.textContent = "🍌"; pip.classList.add("on"); }
    if (this.got >= this.goal) this.finish();
  },

  finish() {
    if (this.done) return;
    this.done = true;
    this.cleanup();
    speak(praise());
    roundComplete();
  },

  cleanup() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    if (this._stage) { this._stage.removeEventListener("pointerdown", this._tap); this._stage = null; }
    this.bananas = [];
  }
};
