"use strict";
/* ================= PETS ================= */
const PETS = [
  { e: "🐶", name: "puppy" }, { e: "🐱", name: "kitty" }, { e: "🐰", name: "bunny" }, { e: "🐹", name: "hamster" },
  { e: "🐦", name: "birdie" }, { e: "🐠", name: "fishy" }, { e: "🐢", name: "turtle" }, { e: "🐴", name: "pony" }
];

/* LEVEL: Find Pet (vocabulary / identification)
   Domain · Sorting / classification / data · Concept · Age band 2–3 · Success = Child identifies animal by name. */
const petmatchLevel = {
  theme: "theme-pets", rounds: 5,
  startRound() {
    this.mistakes = 0;
    const n = [2, 3, 4][state.tier];
    const picks = shuffle(PETS).slice(0, n);
    this.target = rand(picks);
    setInstruction("🐾 " + t("tap_pet", { x: theWord(this.target.name) }), t("tap_pet", { x: theWord(this.target.name) }));
    $("playArea").innerHTML = `<div class="pet-choices" id="petChoices"></div>`;
    picks.forEach(p => {
      const b = document.createElement("button");
      b.className = "pet-choice"; b.textContent = p.e;
      b.dataset.name = p.name;
      b.onclick = e => this.tap(p, b, e);
      $("petChoices").appendChild(b);
    });
  },
  tap(p, btn, e) {
    if (state.busy) return;
    if (p.name === this.target.name) {
      btn.classList.add("popped"); miniStar(e.clientX, e.clientY);
      speak(t("yes_pet", { x: theWord(this.target.name) }) + " " + praise()); roundComplete();
    } else {
      this.mistakes++;
      sfx.bad(); wiggle(btn);
      if (this.mistakes === 2) {
        // Visual cue: highlight the correct target
        const correctBtn = Array.from(document.querySelectorAll(".pet-choice")).find(b => b.dataset.name === this.target.name);
        if (correctBtn) correctBtn.classList.add("hint-highlight");
      } else if (this.mistakes >= 3) {
        // Guided assist: wiggle the correct target
        const correctBtn = Array.from(document.querySelectorAll(".pet-choice")).find(b => b.dataset.name === this.target.name);
        if (correctBtn) wiggle(correctBtn);
      }
      speak(t("lookfor_pet", { x: theWord(this.target.name) }));
    }
  }
};

/* LEVEL: Pet Care (nurture / cause-effect / SEL)
   Domain · Logic / cause–effect · SEL · Concept · Age band 2–3 · Success = Child associates tool with pet need
   and hears emotion named at start, after each action, and on completion. */
const CARE_ICONS = { wash: "🧼", feed: "🍖", play: "🎾", cuddle: "🫂" };
const CARE_NEED_ICONS = { wash: "🫧", feed: "🍖", play: "🎾", cuddle: "💞" };
const CARE_MOODS = ["😢", "😐", "🙂", "😊", "💖"];
const petcareLevel = {
  theme: "theme-pets", rounds: 3,
  startRound() {
    this.pet = rand(PETS.slice(0, 6));
    // tier 0 → 2 needs, tier 1 → 3 needs, tier 2 → 4 needs (adds cuddle)
    const needSets = [["wash", "feed"], ["wash", "feed", "play"], ["wash", "feed", "play", "cuddle"]];
    this.needs = new Set(needSets[state.tier]);
    this.total = this.needs.size;
    this.done = 0;
    setInstruction("🛁 " + t("takecare_show", { x: theWord(this.pet.name) }), t("takecare_sad", { animal: theWord(this.pet.name) }));
    const toolBtns = [...this.needs].map(act =>
      `<button class="care-tool" data-act="${act}">${CARE_ICONS[act]}</button>`
    ).join("");
    $("playArea").innerHTML = `<div class="petcare-wrap">
        <div class="care-mood" id="careMood">${CARE_MOODS[0]}</div>
        <div class="care-pet" id="carePet">${this.pet.e}</div>
        <div class="care-status" id="careStatus">${[...this.needs].map(n => CARE_NEED_ICONS[n]).join(" ")}</div>
        <div class="care-tools" id="careTools">${toolBtns}</div></div>`;
    document.querySelectorAll(".care-tool").forEach(btn => btn.onclick = ev => this.use(btn.dataset.act, btn, ev));
    core.wait(() => speak(t("pet_sad", { animal: theWord(this.pet.name) })), 600);
  },
  use(act, btn, ev) {
    if (state.busy || !this.needs.has(act)) return;
    this.needs.delete(act);
    this.done++;
    // dim used button
    btn.classList.add("care-used");
    btn.disabled = true;
    const pet = $("carePet"); pet.classList.remove("happy"); void pet.offsetWidth; pet.classList.add("happy");
    const c = centerOf(pet);
    // update mood indicator with bounce
    const moodIdx = Math.min(this.done, CARE_MOODS.length - 1);
    const moodEl = $("careMood");
    moodEl.textContent = CARE_MOODS[moodIdx];
    moodEl.classList.remove("bump"); void moodEl.offsetWidth; moodEl.classList.add("bump");
    if (act === "wash")   { floaters(["🫧", "✨", "💧"], c.x, c.y, 9);       tone(700, 0, .2, "sine");     speak(t("pet_feels_clean",   { animal: theWord(this.pet.name) })); }
    else if (act === "feed")   { floaters(["😋", "❤️", "🍖"], c.x, c.y, 6);  tone(400, 0, .2, "square");   speak(t("pet_feels_fed",     { animal: theWord(this.pet.name) })); }
    else if (act === "play")   { floaters(["🎾", "⭐", "🐾"], c.x, c.y, 7);  tone(600, 0, .2, "triangle"); speak(t("pet_feels_played",  { animal: theWord(this.pet.name) })); }
    else                       { floaters(["💞", "💖", "✨"], c.x, c.y, 8);   tone(550, 0, .25, "sine");    speak(t("pet_feels_cuddled", { animal: theWord(this.pet.name) })); }
    // update needs strip
    $("careStatus").textContent = [...this.needs].map(n => CARE_NEED_ICONS[n]).join(" ") || "💖";
    if (this.needs.size === 0) {
      floaters(["💖", "⭐", "🐾", "✨"], c.x, c.y, 12);
      speak(t("pet_kind", { animal: theWord(this.pet.name) }) + " " + praise());
      roundComplete();
    }
  }
};

/* LEVEL: Feed Pet (counting)
   Domain · Number sense · Concept · Age band 3–4 · Success = Child counts 1–5 with 1:1 correspondence. */
const PET_FOODS = [
  { e: "🐶", treat: "🦴", name: "puppy" }, { e: "🐱", treat: "🐟", name: "kitty" },
  { e: "🐰", treat: "🥕", name: "bunny" }, { e: "🐹", treat: "🌰", name: "hamster" }
];
const petfeedLevel = {
  theme: "theme-pets", rounds: 5,
  startRound() {
    this.mistakes = 0;
    if (state.round === 0) this.pet = rand(PET_FOODS);
    const counts = [[1, 2, 2, 3, 3], [2, 3, 4, 4, 5], [3, 4, 5, 6, 7]][state.tier];
    const need = counts[state.round];
    this.need = need; this.fed = 0;
    setInstruction(t("give_pet_show", { animal: theWord(this.pet.name), count: need, x: words("treat", need) }), t("give_pet_show", { animal: theWord(this.pet.name), count: need, x: words("treat", need) }));
    $("playArea").innerHTML = `<div class="dragon-wrap"><div class="dragon" id="petEl">${this.pet.e}</div><div class="treat-row" id="treatRow"></div></div>`;
    for (let i = 0; i < need; i++) {
      const t = document.createElement("button");
      t.className = "treat"; t.textContent = this.pet.treat;
      makeDraggable(t, (el, ev, info) => this.release(el, ev, info));
      $("treatRow").appendChild(t);
    }
  },
  release(el, ev, info) {
    if (state.busy) { info.reset(); return; }
    if (inside(centerOf(el), $("petEl")) || !info.moved) this.feed(el, ev);
    else {
      this.mistakes++;
      sfx.bad(); info.reset();
      if (this.mistakes === 2) {
        $("petEl").classList.add("hint-highlight");
      } else if (this.mistakes >= 3) {
        wiggle($("petEl"));
      }
    }
  },
  feed(el, ev) {
    el.style.visibility = "hidden"; el.classList.add("on-plate");
    const d = $("petEl"); d.classList.remove("chomp"); void d.offsetWidth; d.classList.add("chomp");
    sfx.tap(); tone(300, 0, .15, "square", .14); miniStar(ev.clientX || innerWidth / 2, ev.clientY || innerHeight / 2);
    this.fed++;
    if (this.fed < this.need) speak(numWord(this.fed) + "!");
    else { floaters(["❤️", "✨", "🐾"], innerWidth / 2, innerHeight / 2.5, 8); speak(t("count_x", { count: this.need, x: words("treat", this.need) }) + " " + praise()); roundComplete(); }
  }
};

/* LEVEL: Body Match (scientific thinking / naming body parts)
   Domain · Scientific thinking · Age band 2–3 · Success = Child can identify and name major body parts. */
const bodyLevel = {
  theme: "theme-trace", rounds: 5,
  parts: [
    { name: "head",     x: 100, y: 96,  r: 58 },
    { name: "hand",     x: 18,  y: 278, r: 22 },
    { name: "hand",     x: 182, y: 278, r: 22 },
    { name: "foot",     x: 83,  y: 385, r: 18 },
    { name: "foot",     x: 117, y: 385, r: 18 },
    { name: "tummy",    x: 100, y: 235, r: 35 },
    { name: "eye",      x: 80,  y: 98,  r: 12 },
    { name: "eye",      x: 120, y: 98,  r: 12 },
    { name: "nose",     x: 100, y: 110, r: 10 },
    { name: "mouth",    x: 100, y: 129, r: 14 },
    { name: "ear",      x: 42,  y: 96,  r: 14 },
    { name: "ear",      x: 158, y: 96,  r: 14 },
    { name: "hair",     x: 100, y: 45,  r: 35 },
    { name: "arm",      x: 34,  y: 235, r: 25 },
    { name: "arm",      x: 166, y: 235, r: 25 },
    { name: "leg",      x: 75,  y: 320, r: 25 },
    { name: "leg",      x: 125, y: 320, r: 25 },
    { name: "knee",     x: 75,  y: 328, r: 14 },
    { name: "knee",     x: 125, y: 328, r: 14 },
    { name: "shoulder", x: 56,  y: 188, r: 18 },
    { name: "shoulder", x: 144, y: 188, r: 18 },
    { name: "toe",      x: 83,  y: 387, r: 13 },
    { name: "toe",      x: 117, y: 387, r: 13 },
    { name: "teeth",    x: 100, y: 122, r: 10 },
    { name: "neck",     x: 100, y: 163, r: 12 },
    { name: "tongue",   x: 100, y: 137, r: 9 },
    { name: "chin",     x: 100, y: 150, r: 11 },
    { name: "cheek",    x: 68,  y: 116, r: 13 },
    { name: "cheek",    x: 132, y: 116, r: 13 }
  ],
  tiers: [
    ["head", "hand", "tummy", "foot", "leg"],
    ["eye", "nose", "mouth", "ear", "hair", "arm"],
    ["knee", "shoulder", "toe", "teeth", "neck", "tongue", "chin", "cheek"]
  ],
  startRound() {
    const pool = this.tiers[state.tier];
    this.target = rand(pool);
    const isFace = ["eye", "nose", "mouth", "ear", "teeth", "neck", "tongue", "chin", "cheek", "hair"].includes(this.target);
    setInstruction("📍 " + t("tap_part", { part: theWord(this.target) }), t("tap_part", { part: theWord(this.target) }));

    const idx = { skin: 0, face: 1, hair: 1, hat: 0, glasses: 0, outfit: 3, friend: 0 };
    $("playArea").innerHTML = `<div class="body-wrap">
      <div class="body-doll${isFace ? " zoom-face" : ""}" id="bodyDoll">${dFullBodySVG(idx)}</div>
      <svg class="body-overlay${isFace ? " zoom-face" : ""}" viewBox="0 0 200 400" id="bodyOverlay"></svg>
    </div>`;
    
    const ov = $("bodyOverlay");
    this.parts.forEach(p => {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", p.r);
      c.setAttribute("fill", "transparent");
      c.style.cursor = "pointer";
      c.onclick = e => this.tap(p.name, e);
      ov.appendChild(c);
    });
  },
  tap(name, e) {
    if (state.busy) return;
    if (name === this.target) {
      sfx.tap(); miniStar(e.clientX, e.clientY);
      speak(t("yes_part", { part: theWord(name) }) + " " + praise());
      roundComplete();
    } else {
      sfx.bad(); wiggle($("bodyDoll"));
      speak(t("tap_part", { part: theWord(this.target) }));
    }
  }
};
