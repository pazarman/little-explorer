"use strict";
/* ================= LEVEL: Dino Eggs (counting + hatching) ================= */
const BABY_DINOS = ["🦕", "🦖", "🐊", "🐲"];
const dinoLevel = {
  theme: "theme-dino", rounds: 5,
  startRound() {
    const counts = [[1, 2, 2, 3, 3], [2, 3, 4, 4, 5], [3, 4, 5, 6, 7]][state.tier];
    const count = counts[state.round];
    this.left = count; this.count = count;
    setInstruction("🥚 " + t("eggs_show", { count, x: words("egg", count) }), t("eggs_say", { count, x: words("egg", count) }));
    const area = $("playArea"); area.innerHTML = "";
    scatter(count).forEach(pos => {
      const b = document.createElement("button");
      b.className = "dino-egg"; b.textContent = "🥚";
      b.style.left = pos.left; b.style.top = pos.top; b.style.animationDelay = Math.random() * 2 + "s";
      b.onclick = e => this.tap(b, e);
      area.appendChild(b);
    });
  },
  tap(el, e) {
    if (state.busy || el.dataset.hatched) return;
    el.dataset.hatched = "1"; el.textContent = rand(BABY_DINOS); el.classList.add("hatched");
    sfx.tap(); tone(500, 0, .12, "triangle"); miniStar(e.clientX, e.clientY);
    const n = this.count - (--this.left);
    if (this.left > 0) speak(numWord(n) + "!");
    else { speak(numWord(n) + "! " + t("hatched_all", { count: this.count, item: words("dino", this.count) }) + " " + praise()); roundComplete(); }
  }
};
