"use strict";
/* ================= LEVEL: Balloon bike ride ================= */
const BALLOON_COLORS = ["#e63946", "#2f6fde", "#3fa84f", "#8e4fd0", "#f07f13", "#f06ba8"];
const bikeLevel = {
  theme: "theme-bike", rounds: 5, raf: null,
  startRound() {
    this.cleanup();
    const maxN = [5, 8, 10][state.tier];
    if (state.round === 0) {
      const pool = shuffle([...Array(maxN).keys()].map(i => i + 1));
      this.order = pool.slice(0, 5);
    }
    this.target = this.order[state.round];
    this.maxN = maxN;
    this.speedMul = [1, 1.25, 1.5][state.tier];
    this.maxBalloons = [3, 4, 5][state.tier];
    setInstruction("🎈 " + t("pop_balloon_show", { target: this.target }), t("pop_balloon_say", { target: this.target }));
    const trees = "🌳 🌲 🌳 🛝 🌳 🌷 🌲 🌳 ⛲ 🌳 ";
    $("playArea").innerHTML = `
      <div class="treeline far"><div class="marquee" style="animation-duration:26s;">${trees.repeat(2)}${trees.repeat(2)}</div></div>
      <div class="treeline"><div class="marquee" style="animation-duration:13s;">${trees}${trees}</div></div>
      <div class="road"></div>
      <div class="rider">🚴</div>
      <div id="balloonField"></div>`;
    this.balloons = [];
    this.spawnIn = randBetween(0.2, 0.6);
    this.sinceTarget = 0;
    this.spawnCount = 0;
    this.lastT = performance.now();
    const loop = t => { this.frame(t); if (this.raf !== null) this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  },
  frame(t) {
    const dt = Math.min(50, t - this.lastT) / 1000;
    this.lastT = t;
    const area = $("playArea");
    if (!area.isConnected || !$("balloonField")) { this.cleanup(); return; }
    const W = area.clientWidth;
    const targetAlive = this.balloons.some(b => b.num === this.target && !b.el.classList.contains("popped"));
    this.sinceTarget = targetAlive ? 0 : this.sinceTarget + dt;
    this.spawnIn -= dt;
    if (this.spawnIn <= 0 && this.balloons.length < this.maxBalloons) {
      let num;
      if (this.spawnCount === 0) {
        // the FIRST balloon is never the target, so she has to scan & wait
        do { num = Math.ceil(Math.random() * this.maxN); } while (num === this.target && this.maxN > 1);
      } else {
        const forceTarget = !targetAlive && this.sinceTarget > 2.5;
        num = forceTarget ? this.target
            : (!targetAlive && Math.random() < 0.35 ? this.target
            : Math.ceil(Math.random() * this.maxN));
      }
      this.spawnCount++;
      this.spawn(W, num);
      this.spawnIn = randBetween(1.0, 1.8);
    }
    for (const b of this.balloons) { b.x -= b.speed * dt; b.el.style.left = b.x + "px"; }
    this.balloons = this.balloons.filter(b => { if (b.x < -160) { b.el.remove(); return false; } return true; });
  },
  spawn(W, num) {
    const el = document.createElement("button");
    el.className = "balloon";
    if (num === this.target) el.dataset.target = "1";
    const color = rand(BALLOON_COLORS);
    el.innerHTML = `<div class="b-body" style="background:${color}; animation-delay:${Math.random() * 2}s;"><span class="b-shine"></span><span class="b-num">${num}</span></div><div class="b-knot" style="border-top-color:${color}"></div><div class="b-string"></div>`;
    el.style.top = randBetween(3, 48) + "%";
    el.style.left = W + 20 + "px";
    const b = { el, num, x: W + 20, speed: randBetween(55, 95) * (W / 700) * this.speedMul };
    el.onclick = e => this.tap(b, e);
    $("balloonField").appendChild(el);
    this.balloons.push(b);
  },
  tap(b, e) {
    if (state.busy || b.el.classList.contains("popped")) return;
    if (b.num === this.target) {
      b.el.classList.add("popped");
      tone(1100, 0, .04, "square", .2); tone(180, .03, .14, "sawtooth", .12);   // snappy balloon pop
      floaters(["🎈", "⭐", "✨"], e.clientX, e.clientY, b.num);                  // burst exactly b.num pieces = the quantity
      miniStar(e.clientX, e.clientY);
      speak(t("thats_that_num", { num: numWord(b.num), target: b.num }) + " " + praise()); roundComplete();
    } else {
      this.mistakes++;
      sfx.bad(); wiggle(b.el);
      if (this.mistakes === 2) {
        document.querySelectorAll(".balloon[data-target='1']").forEach(el => el.classList.add("hint-highlight"));
      } else if (this.mistakes >= 3) {
        document.querySelectorAll(".balloon[data-target='1']").forEach(el => wiggle(el));
      }
      speak(t("thats_find_num", { num: b.num, target: this.target }));
    }
  },
  cleanup() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; this.balloons = []; }
};
