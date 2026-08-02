"use strict";
/* ================= LEVEL: Ocean colors ================= */
function fishSVG(color) {
  // Whole fish is ONE color (fins/tail match body) so color identity stays clear; overlays add life.
  const stroke = color === "#f4f6f9" ? ` stroke="#9bb" stroke-width="1.5"` : "";
  return `<svg viewBox="0 0 125 90" xmlns="http://www.w3.org/2000/svg">
    <path d="M92 45 Q118 21 121 31 Q112 45 121 59 Q118 69 92 45 Z" fill="${color}"${stroke}/>
    <path d="M46 17 Q64 5 78 19 Q62 21 46 27 Z" fill="${color}"${stroke}/>
    <path d="M52 67 Q62 79 76 71 Q64 65 52 63 Z" fill="${color}"${stroke}/>
    <ellipse cx="56" cy="45" rx="44" ry="28" fill="${color}"${stroke}/>
    <path d="M22 53 Q56 75 92 53 Q84 69 56 69 Q34 69 22 53 Z" fill="#fff" opacity=".28"/>
    <path d="M40 25 Q34 45 40 65" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round" opacity=".18"/>
    <circle cx="30" cy="37" r="9" fill="#fff"/>
    <circle cx="31" cy="38" r="4.6" fill="#222"/>
    <circle cx="33" cy="35.5" r="1.9" fill="#fff"/>
    <circle cx="30" cy="51" r="6" fill="#ff6f91" opacity=".45"/>
    <path d="M18 51 Q26 58 36 53" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round" opacity=".35"/>
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
