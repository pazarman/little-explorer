"use strict";
/* ================= LEVEL: Ocean colors ================= */
function fishSVG(color) {
  const stroke = color === "#f4f6f9" ? ` stroke="#9bb" stroke-width="1.5"` : "";
  return `<svg viewBox="0 0 125 80" xmlns="http://www.w3.org/2000/svg">
    <polygon points="95,40 120,15 120,65" fill="${color}"${stroke}/>
    <ellipse cx="55" cy="40" rx="42" ry="27" fill="${color}"${stroke}/>
    <circle cx="36" cy="32" r="6.5" fill="#fff"/><circle cx="36" cy="32" r="3" fill="#222"/>
    <path d="M22 48 Q30 55 40 50" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`;
}
const oceanLevel = {
  theme: "theme-ocean", rounds: 5,
  startRound() {
    const howMany = [3, 4, 5][state.tier];
    const palette = COLOR_TIERS[state.tier];
    const picks = shuffle(palette).slice(0, howMany);
    this.target = rand(picks);
    setInstruction("🐠 " + t("tap_fish", { x: colorAdj(this.target, "m") }), t("tap_fish", { x: colorAdj(this.target, "m") }));
    const area = $("playArea");
    area.innerHTML = `<div class="wave" style="animation-duration:7s;"></div>
                      <div class="wave" style="animation-duration:9.5s; height:18%; bottom:-4%;"></div>`;
    for (let i = 0; i < 9; i++) {
      const b = document.createElement("span");
      b.className = "bubble";
      const s = randBetween(8, 26);
      b.style.width = s + "px"; b.style.height = s + "px";
      b.style.left = Math.random() * 96 + "%";
      b.style.animationDuration = randBetween(6, 13) + "s";
      b.style.animationDelay = -Math.random() * 12 + "s";
      area.appendChild(b);
    }
    const spots = scatter(howMany);
    picks.forEach((color, i) => {
      const b = document.createElement("button");
      b.className = "fish-btn";
      b.style.left = spots[i].left; b.style.top = spots[i].top;
      b.style.animationDelay = Math.random() * 2.5 + "s";
      b.innerHTML = fishSVG(COLORS[color]);
      b.onclick = e => this.tap(b, color, e);
      area.appendChild(b);
    });
  },
  tap(btn, color, e) {
    if (state.busy) return;
    if (color === this.target) {
      btn.classList.add("popped");
      miniStar(e.clientX, e.clientY);
      speak(t("color_excl", { color: colorName(color) }) + " " + praise());
      roundComplete();
    } else {
      this.mistakes++;
      sfx.bad(); wiggle(btn);
      if (this.mistakes === 2) {
        const correct = [...document.querySelectorAll(".fish-btn")].find(x => x.dataset.color === this.target);
        if (correct) correct.classList.add("hint-highlight");
      } else if (this.mistakes >= 3) {
        const correct = [...document.querySelectorAll(".fish-btn")].find(x => x.dataset.color === this.target);
        if (correct) wiggle(correct);
      }
      speak(t("goodtry_fish", { x: colorAdj(this.target, "m") }));
    }
  }
};
