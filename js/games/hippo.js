"use strict";
// Number sense · count to N with one-to-one correspondence · age 2-4
// Success = child feeds the hippo exactly the number of foods the voice asks for, counting each one.

// this game holds its strings inline (like Night & Day) rather than in the core DICT
const hpL = obj => obj[curLang()] || obj.en;

const HP_FOODS = [
  { e: "🍉", name: "watermelons", es: "sandías",   yue: "西瓜" },
  { e: "🥕", name: "carrots",     es: "zanahorias", yue: "紅蘿蔔" },
  { e: "🍎", name: "apples",      es: "manzanas",   yue: "蘋果" },
  { e: "🍌", name: "bananas",     es: "guineos",    yue: "香蕉" },
  { e: "🥬", name: "leaves",      es: "hojas",      yue: "菜葉" }
];

const HIPPO_SVG = `<svg viewBox="0 0 200 180" width="100%" height="100%">
  <ellipse cx="50" cy="40" rx="16" ry="13" fill="#9c8aa8"/>
  <ellipse cx="150" cy="40" rx="16" ry="13" fill="#9c8aa8"/>
  <ellipse cx="50" cy="42" rx="8" ry="6" fill="#c9a6c0"/>
  <ellipse cx="150" cy="42" rx="8" ry="6" fill="#c9a6c0"/>
  <path d="M28 68 Q28 18 100 20 Q172 18 172 68 Q172 116 100 116 Q28 116 28 68 Z" fill="#9c8aa8"/>
  <circle cx="66" cy="56" r="14" fill="#fff"/><circle cx="134" cy="56" r="14" fill="#fff"/>
  <circle cx="67" cy="58" r="6" fill="#2a2233"/><circle cx="133" cy="58" r="6" fill="#2a2233"/>
  <path d="M44 92 Q44 150 100 158 Q156 150 156 92 Q156 126 100 130 Q44 126 44 92 Z" fill="#ab99b8"/>
  <ellipse cx="80" cy="102" rx="7" ry="5" fill="#5f4f6b"/>
  <ellipse cx="120" cy="102" rx="7" ry="5" fill="#5f4f6b"/>
  <ellipse cx="100" cy="138" rx="44" ry="28" fill="#7a3b52"/>
  <ellipse cx="100" cy="148" rx="36" ry="17" fill="#c05f7d"/>
  <rect x="76" y="116" width="12" height="16" rx="3" fill="#fff"/>
  <rect x="112" y="116" width="12" height="16" rx="3" fill="#fff"/>
</svg>`;

const hippoLevel = {
  theme: "theme-zoo", rounds: 5,

  startRound() {
    this.fed = 0;
    this.busyFeed = false;
    const ranges = [[1, 3], [2, 5], [4, 8]][state.tier];
    this.target = ranges[0] + Math.floor(Math.random() * (ranges[1] - ranges[0] + 1));
    const food = rand(HP_FOODS);
    this.food = food;
    const fName = hpL({ en: food.name, es: food.es, yue: food.yue });

    setInstruction(
      "🦛 " + hpL({ en: `Feed the hippo ${this.target} ${fName}!`, es: `¡Dale al hipopótamo ${this.target} ${fName}!`, yue: `餵河馬食${this.target}個${fName}！` }),
      hpL({ en: `Tap the food to feed the hippo ${this.target} ${fName}. Count them!`,
            es: `Toca la comida para dar ${this.target} ${fName} al hipopótamo. ¡Cuéntalos!`,
            yue: `㩒啲食物，餵河馬食${this.target}個${fName}。數住佢哋！` })
    );

    const slots = Array.from({ length: this.target }, (_, i) => `<span class="hp-slot" data-i="${i}">◯</span>`).join("");
    const trayFood = Array.from({ length: 5 }, () => `<button class="hp-food">${food.e}</button>`).join("");

    $("playArea").innerHTML = `
      <style>
        .hp-stage{position:absolute;inset:0;overflow:hidden;z-index:5;display:flex;flex-direction:column;align-items:center}
        .hp-ground{position:absolute;left:0;right:0;bottom:0;height:16%;background:linear-gradient(#c8e89a,#8fc85a);pointer-events:none;z-index:1}
        .hp-tummy{position:absolute;top:2%;left:50%;transform:translateX(-50%);display:flex;gap:clamp(3px,1vmin,7px);z-index:9;background:rgba(90,60,20,.28);padding:clamp(3px,1vmin,7px) clamp(8px,2.4vmin,16px);border-radius:999px;max-width:94%;flex-wrap:wrap;justify-content:center}
        .hp-slot{font-size:clamp(15px,4vmin,26px);color:#fff6e0;line-height:1}
        .hp-slot.on{color:#ffd23e}
        .hp-hippo{position:absolute;top:11%;left:50%;transform:translateX(-50%);width:clamp(150px,42vmin,300px);height:auto;z-index:4;filter:drop-shadow(0 6px 8px rgba(0,0,0,.25))}
        .hp-hippo.chomp{animation:hpChomp .3s ease}
        @keyframes hpChomp{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.06)}}
        .hp-count{position:absolute;top:12%;right:8%;font-size:clamp(30px,9vmin,68px);font-weight:800;color:#fff;text-shadow:0 3px 6px rgba(0,0,0,.4);z-index:6}
        .hp-tray{position:absolute;bottom:3%;left:2%;right:2%;display:flex;justify-content:center;gap:clamp(6px,2.4vmin,20px);z-index:6}
        .hp-food{border:none;background:rgba(255,255,255,.75);border-radius:50%;width:clamp(52px,15vmin,104px);height:clamp(52px,15vmin,104px);font-size:clamp(30px,9vmin,62px);line-height:1;cursor:pointer;touch-action:manipulation;box-shadow:0 3px 8px rgba(0,0,0,.2);transition:transform .12s}
        .hp-food:active{transform:scale(.9)}
        .hp-fly{position:fixed;z-index:40;font-size:clamp(30px,9vmin,62px);line-height:1;pointer-events:none;transition:left .38s cubic-bezier(.5,0,.7,1),top .38s cubic-bezier(.5,-0.3,.7,1),transform .38s ease}
      </style>
      <div class="hp-stage" id="hpStage">
        <div class="hp-ground"></div>
        <div class="hp-tummy" id="hpTummy">${slots}</div>
        <div class="hp-count" id="hpCount">0</div>
        <div class="hp-hippo" id="hpHippo">${HIPPO_SVG}</div>
        <div class="hp-tray" id="hpTray">${trayFood}</div>
      </div>`;

    $("hpStage").querySelectorAll(".hp-food").forEach(f => { f.onclick = ev => this.feed(f, ev); });
  },

  feed(foodEl, ev) {
    if (state.busy || this.fed >= this.target) return;

    this.fed++;
    const n = this.fed;

    // fly a copy of the food from the tray into the hippo's mouth
    const from = foodEl.getBoundingClientRect();
    const hippo = $("hpHippo").getBoundingClientRect();
    const mouthX = hippo.left + hippo.width / 2;
    const mouthY = hippo.top + hippo.height * 0.78;
    const fly = document.createElement("div");
    fly.className = "hp-fly";
    fly.textContent = this.food.e;
    fly.style.left = from.left + from.width / 2 - 20 + "px";
    fly.style.top = from.top + from.height / 2 - 20 + "px";
    document.body.appendChild(fly);
    void fly.offsetWidth;
    fly.style.left = mouthX - 20 + "px";
    fly.style.top = mouthY - 20 + "px";
    fly.style.transform = "scale(.4)";
    core.wait(() => { if (fly.isConnected) fly.remove(); }, 400);

    core.wait(() => {
      const h = $("hpHippo");
      if (h) { h.classList.remove("chomp"); void h.offsetWidth; h.classList.add("chomp"); }
      const cnt = $("hpCount"); if (cnt) cnt.textContent = n;
      const slot = $("hpTummy") && $("hpTummy").querySelector(`.hp-slot[data-i="${n - 1}"]`);
      if (slot) { slot.textContent = this.food.e; slot.classList.add("on"); }
      sfx.tap();
      tone(440 + n * 60, 0, .14, "sine", .14);
      miniStar(mouthX, mouthY);

      if (n >= this.target) {
        floaters(["💗", "✨", "⭐"], mouthX, mouthY, 5);
        speak(String(n) + "! " + hpL({ en: "All full!", es: "¡Lleno!", yue: "食飽喇！" }) + " " + praise());
        state.busy = true;
        roundComplete();
      } else {
        speak(String(n));
      }
    }, 360);
  }
};
