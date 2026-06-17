"use strict";
/* ================= LEVEL: Counting Critters (snow) ================= */
const CRITTERS = [["❄️", "snowflake"], ["⛄", "snowman"], ["🐧", "penguin"], ["🧤", "mitten"], ["🦌", "reindeer"], ["🎁", "present"]];
const snowLevel = {
  theme: "theme-snow", rounds: 5,
  startRound() {
    const counts = [[1, 2, 2, 3, 3], [2, 3, 4, 4, 5], [3, 4, 5, 6, 7]][state.tier];
    const count = counts[state.round];
    if (state.round === 0) this.critter = rand(CRITTERS);   // one critter per playthrough
    this.count = count; this.done = 0;
    const [emoji, noun] = this.critter;
    const x = words(noun, count);
    setInstruction(`${emoji} ` + t("tap_count", { count, x }), t("tap_count", { count, x }));
    const area = $("playArea");
    area.innerHTML = `
      <svg class="snow-scene" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="84" cy="15" r="11" fill="#fff7c0" opacity=".85"/>
        <path d="M0 67 Q26 53 52 65 Q76 77 100 61 L100 100 L0 100 Z" fill="#dcecff" opacity=".7"/>
        <path d="M0 83 Q30 70 58 81 Q82 90 100 79 L100 100 L0 100 Z" fill="#ffffff" opacity=".85"/>
      </svg>
      <div class="snowfield" id="snowfield"></div>
      <div class="count-tray"><div class="count-num" id="countNum">0</div><div class="count-slots" id="countSlots"></div></div>`;
    const field = $("snowfield");
    for (let i = 0; i < 16; i++) {
      const d = document.createElement("span");
      d.className = "snowdust"; d.textContent = "❄";
      d.style.left = Math.random() * 98 + "%";
      d.style.fontSize = randBetween(8, 20) + "px";
      d.style.opacity = randBetween(.3, .8);
      d.style.animationDuration = randBetween(5, 11) + "s";
      d.style.animationDelay = -Math.random() * 10 + "s";
      field.appendChild(d);
    }
    const slots = $("countSlots");
    for (let i = 0; i < count; i++) { const s = document.createElement("div"); s.className = "count-slot"; slots.appendChild(s); }
    scatter(count).forEach(pos => {
      const b = document.createElement("button");
      b.className = "snowflake critter"; b.textContent = emoji;
      b.style.left = pos.left; b.style.top = Math.min(parseFloat(pos.top), 64) + "%";   // keep clear of the count tray
      b.style.animationDelay = Math.random() * 2 + "s";
      b.onclick = e => this.tap(b, e);
      field.appendChild(b);
    });
  },
  tap(el, e) {
    if (state.busy || el.classList.contains("tapped")) return;
    el.classList.add("tapped");
    sfx.tap(); miniStar(e.clientX, e.clientY);
    const n = ++this.done;
    const slot = $("countSlots").children[n - 1];               // a critter hops into the tray...
    if (slot) { slot.textContent = this.critter[0]; slot.classList.add("filled"); }
    const num = $("countNum");                                  // ...and the numeral grows: quantity ↔ symbol
    num.textContent = n; num.classList.remove("bump"); void num.offsetWidth; num.classList.add("bump");
    tone(440 + n * 60, 0, .14, "sine", .14);
    if (n < this.count) speak(numWord(n) + "!");
    else { speak(t("you_counted", { num: numWord(n), count: this.count }) + " " + praise()); roundComplete(); }
    setTimeout(() => el.remove(), 480);
  }
};
