"use strict";

/**
 * STEM Objective: Spatial Reasoning · Positional Language · Age band 2–3 · Success = Child identifies object position (in/on/under).
 */

/* ================= LEVEL: Hide & Seek ================= */

/**
 * Procedural SVG for the hiding spots.
 * explicit rendering ensures no parts (like "tongue") are ever missing.
 */
const HIDE_SPOTS = {
  basket: (color = "#d9913b") => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 40 Q50 30 90 40 L80 90 Q50 95 20 90 Z" fill="${color}"/>
    <path d="M10 40 Q50 50 90 40" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="3"/>
    <path d="M20 20 Q50 10 80 20" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>
  </svg>`,
  box: (color = "#4dabf7") => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="45" width="70" height="45" fill="${color}"/>
    <path d="M15 45 L5 30 L75 30 L85 45 Z" fill="${color}" opacity="0.8"/>
    <path d="M85 45 L95 30 L95 75 L85 90 Z" fill="${color}" opacity="0.6"/>
  </svg>`,
  table: (color = "#8a5a2b") => `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="20" width="100" height="10" rx="5" fill="${color}"/>
    <rect x="20" y="30" width="8" height="60" fill="${color}" opacity="0.9"/>
    <rect x="92" y="30" width="8" height="60" fill="${color}" opacity="0.9"/>
  </svg>`
};

const hideseekLevel = {
  theme: "theme-pets",
  rounds: 5,

  startRound() {
    this.mistakes = 0;
    const difficulty = [
      { spots: 2, relations: ["in", "on"] },
      { spots: 3, relations: ["in", "on", "under"] },
      { spots: 3, relations: ["in", "on", "under"] }
    ][state.tier];

    // Pick a random relation and target spot
    this.relation = rand(difficulty.relations);
    const spotTypes = shuffle(Object.keys(HIDE_SPOTS)).slice(0, difficulty.spots);
    this.targetSpot = rand(spotTypes);
    
    const buddyEmoji = buddyMarkup().includes("buddy") ? buddyMarkup().match(/>(.*?)</)[1] : "🐶";
    
    setInstruction(
      t("hideseek_show", { rel: t("rel_" + this.relation), spot: word(this.targetSpot) }),
      t("hideseek_say", { buddy: word(BUDDY), rel: t("rel_" + this.relation), spot: theWord(this.targetSpot) })
    );

    const area = $("playArea");
    area.innerHTML = `<div class="hideseek-wrap" id="hideseekWrap">
      <div class="hideseek-spots" id="spotRow"></div>
      <div class="hideseek-buddy" id="buddyActor" style="font-size: 80px; cursor: pointer;">${buddyEmoji}</div>
    </div>`;

    // Render spots
    spotTypes.forEach(type => {
      const b = document.createElement("div");
      b.className = "hide-spot-container";
      b.dataset.type = type;
      b.innerHTML = HIDE_SPOTS[type]();
      
      // Define sub-regions for relations
      b.insertAdjacentHTML('beforeend', `
        <div class="rel-zone zone-in" data-rel="in"></div>
        <div class="rel-zone zone-on" data-rel="on"></div>
        <div class="rel-zone zone-under" data-rel="under"></div>
      `);
      
      $("spotRow").appendChild(b);
    });

    const buddy = $("buddyActor");
    makeDraggable(buddy, (el, ev, info) => this.release(el, ev, info));
  },

  release(el, ev, info) {
    if (state.busy) { info.reset(); return; }
    
    const buddyCenter = centerOf(el);
    const zones = document.querySelectorAll(".rel-zone");
    let targetZone = null;

    // Find if we are over a zone
    for (const zone of zones) {
      if (inside(buddyCenter, zone)) {
        targetZone = zone;
        break;
      }
    }

    if (targetZone) {
      const gotRel = targetZone.dataset.rel;
      const gotSpot = targetZone.closest(".hide-spot-container").dataset.type;

      if (gotRel === this.relation && gotSpot === this.targetSpot) {
        // Correct Placement
        el.classList.add("on-plate");
        targetZone.appendChild(el);
        el.style.position = "absolute";
        el.style.left = "50%"; el.style.top = "50%";
        el.style.transform = "translate(-50%, -50%)";
        
        sfx.good();
        miniStar(ev.clientX, ev.clientY);
        speak(praise());
        roundComplete();
      } else {
        // Wrong Placement
        this.mistakes++;
        sfx.bad();
        info.reset();
        wiggle(el);
        
        if (this.mistakes === 2) {
          const correctZone = [...document.querySelectorAll(".rel-zone")].find(z => 
            z.dataset.rel === this.relation && z.closest(".hide-spot-container").dataset.type === this.targetSpot
          );
          if (correctZone) correctZone.classList.add("hint-highlight");
        } else if (this.mistakes >= 3) {
           const container = [...document.querySelectorAll(".hide-spot-container")].find(c => c.dataset.type === this.targetSpot);
           if (container) wiggle(container);
        }
        
        speak(t("hideseek_retry", { rel: t("rel_" + this.relation), spot: theWord(this.targetSpot) }));
      }
    } else {
      info.reset();
    }
  }
};
