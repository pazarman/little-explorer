"use strict";
/* ================= LEVEL: Who Says That? ================= */
const whosaysLevel = {
  theme: "theme-whosays", rounds: 5,
  startRound() {
    const nChoices = [2, 3, 4][state.tier];
    const picks = shuffle(Object.keys(ANIMALS)).slice(0, nChoices);
    this.target = rand(picks);
    setInstruction("🔊 " + t("who_show"), t("who_say"));
    $("playArea").innerHTML = `<div class="ws-wrap">
        <button id="wsListen">🔊</button>
        <div class="ws-choices" id="wsChoices"></div></div>`;
    $("wsListen").onclick = () => speakAnimal(this.target);
    picks.forEach(key => {
      const b = document.createElement("button");
      b.className = "ws-animal"; b.textContent = ANIMALS[key].e;
      b.onclick = e => this.tap(key, b, e);
      $("wsChoices").appendChild(b);
    });
    setTimeout(() => speakAnimal(this.target), 700);
  },
  tap(key, btn, e) {
    if (state.busy) return;
    if (key === this.target) {
      btn.classList.add("popped"); miniStar(e.clientX, e.clientY);
      speak(t("yes_it", { animal: theWord(this.target), sound: animalSound(this.target) }) + " " + praise());
      roundComplete();
    } else { sfx.bad(); wiggle(btn); speakAnimal(this.target); }
  }
};
