"use strict";
// STEM: Measurement / comparison · capacity — which container holds more? · age 3-4
// Success = child holds to pour water into two or three containers, watches them fill,
//           and discovers which one holds MORE (took the most water to fill).
// Real-time, child-driven: an rAF pour loop raises the water level while the finger is
// down — the interaction IS the measurement. No fail state; a passive player is rescued
// by an auto-pour assist that fills the containers on its own.

// this game holds its strings inline (like Dolphin Dive / Night & Day) rather than in DICT
const pvL = obj => obj[curLang()] || obj.en;

const PV_TXT = {
  show: { en: "💧 Which one holds more?", es: "💧 ¿Cuál guarda más?", yue: "💧 邊個裝得多啲？" },
  say:  { en: "Hold the water to pour! Which cup holds more?",
          es: "¡Mantén pulsado para verter! ¿Cuál taza guarda más?",
          yue: "㩒住個水嚟倒！邊個杯裝得多啲？" },
  nudge:{ en: "Hold your finger down to pour the water!",
          es: "¡Mantén el dedo apretado para verter el agua!",
          yue: "㩒住手指嚟倒水啊！" },
  full: { en: "Full!", es: "¡Lleno!", yue: "滿喇！" },
  most: { en: n => `The ${n} holds the MOST water!`,
          es: n => `¡${n} guarda MÁS agua!`,
          yue: n => `${n}裝得最多水呀！` },
  same: { en: "They both hold the SAME! Tall doesn't always mean more.",
          es: "¡Las dos guardan lo MISMO! Más alto no siempre es más.",
          yue: "兩個裝得一樣多！高唔一定係多啲。" },
};

// A friendly face — eyes with a highlight, rosy cheeks, a soft smile — floats on the
// glass so each container feels awake and chunky (see docs/ART-STYLE-GUIDE.md).
function pvFace(cx, ey) {
  return `<g>
    <circle cx="${cx - 13}" cy="${ey}" r="7.6" fill="#fff" stroke="#2b3a44" stroke-width="1.4"/>
    <circle cx="${cx + 13}" cy="${ey}" r="7.6" fill="#fff" stroke="#2b3a44" stroke-width="1.4"/>
    <circle cx="${cx - 12}" cy="${ey + 1}" r="3.6" fill="#26323a"/>
    <circle cx="${cx + 14}" cy="${ey + 1}" r="3.6" fill="#26323a"/>
    <circle cx="${cx - 13}" cy="${ey - 1.6}" r="1.5" fill="#fff"/>
    <circle cx="${cx + 13}" cy="${ey - 1.6}" r="1.5" fill="#fff"/>
    <circle cx="${cx - 22}" cy="${ey + 12}" r="6.2" fill="#ff7fb6" opacity=".5"/>
    <circle cx="${cx + 22}" cy="${ey + 12}" r="6.2" fill="#ff7fb6" opacity=".5"/>
    <path d="M${cx - 9} ${ey + 13} Q${cx} ${ey + 22} ${cx + 9} ${ey + 13}" fill="none" stroke="#2b3a44" stroke-width="2.6" stroke-linecap="round"/>
  </g>`;
}

// Each container: a straight-sided (so the water column matches the outline) chunky
// glass with a distinguishing silhouette. `in` is the interior rect the water fills;
// capacity is that rectangle's AREA, so the vessel that LOOKS bigger truthfully holds
// more, and two differently-shaped vessels with equal area hold exactly the same.
const PV_VESSELS = {
  cup:    { name: { en: "cup",    es: "taza",    yue: "杯仔" },   vb: [130, 180], in: { x: 34, y: 66, w: 62, h: 96 },
            body: `<rect x="31" y="63" width="68" height="102" rx="15" fill="none" stroke="#5f9ec2" stroke-width="6"/>
                   <ellipse cx="65" cy="63" rx="37" ry="10" fill="#d6eefa" stroke="#5f9ec2" stroke-width="5"/>`,
            eye: [65, 108] },
  jug:    { name: { en: "jug",    es: "jarra",   yue: "水壺" },   vb: [150, 190], in: { x: 40, y: 34, w: 58, h: 140 },
            body: `<path d="M100 70 q34 6 34 40 q0 34 -34 40" fill="none" stroke="#5f9ec2" stroke-width="7" stroke-linecap="round"/>
                   <rect x="37" y="31" width="64" height="146" rx="16" fill="none" stroke="#5f9ec2" stroke-width="6"/>
                   <path d="M37 42 q-16 2 -18 16 q10 -6 18 -4 Z" fill="#d6eefa" stroke="#5f9ec2" stroke-width="4" stroke-linejoin="round"/>
                   <ellipse cx="69" cy="31" rx="33" ry="9" fill="#d6eefa" stroke="#5f9ec2" stroke-width="5"/>`,
            eye: [69, 108] },
  bucket: { name: { en: "bucket", es: "cubeta",  yue: "水桶" },   vb: [200, 180], in: { x: 44, y: 60, w: 118, h: 108 },
            body: `<path d="M52 40 q48 -22 96 0" fill="none" stroke="#5f9ec2" stroke-width="6" stroke-linecap="round"/>
                   <rect x="41" y="57" width="124" height="114" rx="18" fill="none" stroke="#5f9ec2" stroke-width="7"/>
                   <ellipse cx="103" cy="57" rx="63" ry="12" fill="#d6eefa" stroke="#5f9ec2" stroke-width="6"/>`,
            eye: [103, 108] },
  bottle: { name: { en: "bottle", es: "botella", yue: "樽仔" },   vb: [120, 200], in: { x: 34, y: 60, w: 52, h: 130 },
            body: `<rect x="50" y="16" width="20" height="26" rx="5" fill="#d6eefa" stroke="#5f9ec2" stroke-width="5"/>
                   <path d="M52 40 q-20 6 -21 26" fill="none" stroke="#5f9ec2" stroke-width="6" stroke-linecap="round"/>
                   <path d="M68 40 q20 6 21 26" fill="none" stroke="#5f9ec2" stroke-width="6" stroke-linecap="round"/>
                   <rect x="31" y="63" width="58" height="130" rx="16" fill="none" stroke="#5f9ec2" stroke-width="6"/>`,
            eye: [60, 120] },
  // bottle (tall, narrow) and bowl (wide, short) are drawn with EQUAL interior area
  // (52×130 = 130×52 = 6760) so they hold exactly the same — the tier-2 conservation pair.
  bowl:   { name: { en: "bowl",   es: "tazón",   yue: "大碗" },   vb: [210, 150], in: { x: 40, y: 52, w: 130, h: 52 },
            body: `<path d="M31 55 q74 34 148 0" fill="none" stroke="#5f9ec2" stroke-width="7" stroke-linecap="round"/>
                   <path d="M35 55 q70 92 140 0" fill="none" stroke="#5f9ec2" stroke-width="7" stroke-linecap="round"/>`,
            eye: [105, 84] },
};

// Interior AREA is the capacity, normalised so a mid vessel is ~1.
const pvCap = v => (v.in.w * v.in.h) / 7800;

// Which vessels each tier uses. Tier 2 pairs two EQUAL-capacity shapes (a tall bottle
// and a wide bowl) so she discovers that taller isn't more — a gentle first taste of
// conservation of volume.
const PV_TIERS = [
  ["cup", "bucket"],
  ["cup", "jug", "bucket"],
  ["bottle", "bowl"],
];

const pourLevel = {
  theme: "theme-measure", rounds: 4, raf: null,

  startRound() {
    this.stop();
    this.done = false;
    this.pouring = false;
    this.assist = false;
    this.idle = 0;
    this.nudged = false;
    this.reduced = reducedMotion();
    // gentle, steady pour — a mid vessel fills in ~3s; the biggest takes longer, which
    // is exactly the point. Slower still with reduced motion so nothing rushes.
    this.rate = (this.reduced ? 0.28 : 0.38);

    const keys = shuffle(PV_TIERS[state.tier].slice());
    this.vessels = keys.map((k, i) => {
      const spec = PV_VESSELS[k];
      return { key: k, spec, name: spec.name, cap: pvCap(spec), fill: 0, full: false, idx: i };
    });

    setInstruction(pvL(PV_TXT.show), pvL(PV_TXT.say));

    const cells = this.vessels.map((v, i) => `
      <div class="pv-cell">
        <div class="pv-stream" data-i="${i}"></div>
        <div class="pv-vessel" data-i="${i}">${pvVesselSVG(v.spec, i)}</div>
        <div class="pv-full" data-i="${i}">${pvL(PV_TXT.full)}</div>
      </div>`).join("");

    $("playArea").innerHTML =
      scene.html("meadow", { seed: 61 + state.round * 5, layers: ["canopy", "far", "drift", "mid", "motes", "frame"] }) +
      `
      <style>
        .pv-stage{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;
                  align-items:center;justify-content:flex-end;touch-action:none;cursor:pointer;user-select:none}
        .pv-cloud{position:absolute;top:2%;left:50%;transform:translateX(-50%);width:clamp(120px,34vmin,240px);
                  z-index:7;pointer-events:none;filter:drop-shadow(0 6px 8px rgba(70,110,140,.22))}
        .pv-cloud .pv-hint{opacity:.9}
        .pv-stage.pouring .pv-cloud{animation:pvBob 1.1s ease-in-out infinite}
        @keyframes pvBob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-6px)}}
        .pv-row{display:flex;align-items:flex-end;justify-content:center;gap:clamp(14px,5vmin,54px);
                width:100%;padding:0 clamp(8px,3vw,28px) clamp(10px,3vh,34px);box-sizing:border-box;z-index:6}
        .pv-cell{position:relative;display:flex;flex-direction:column;align-items:center;flex:0 1 auto}
        .pv-vessel{width:clamp(84px,26vmin,200px);height:auto}
        .pv-vessel svg{width:100%;height:auto;display:block;filter:drop-shadow(0 5px 6px rgba(60,100,130,.25))}
        .pv-vessel.pv-cheer{animation:pvPop .5s ease}
        @keyframes pvPop{0%{transform:scale(1)}45%{transform:scale(1.09)}100%{transform:scale(1)}}
        .pv-stream{position:absolute;top:-38%;left:50%;transform:translateX(-50%);width:clamp(7px,1.6vmin,13px);
                   height:42%;border-radius:6px;background:linear-gradient(rgba(120,215,255,0),#54c6f2);
                   opacity:0;transition:opacity .12s;pointer-events:none}
        .pv-stage.pouring .pv-stream.on{opacity:.85;animation:pvFlow .5s linear infinite}
        @keyframes pvFlow{0%{background-position:0 0}100%{background-position:0 16px}}
        .pv-full{margin-top:clamp(4px,1.4vmin,10px);font-size:clamp(15px,4vmin,26px);font-weight:800;
                 color:#2a7fb0;background:#eaf7ff;border-radius:999px;padding:2px clamp(8px,2vmin,14px);
                 opacity:0;transform:scale(.7);transition:opacity .2s,transform .2s}
        .pv-full.show{opacity:1;transform:scale(1)}
      </style>
      <div class="pv-stage" id="pvStage">
        <svg class="pv-cloud" viewBox="0 0 200 130">
          <g class="pv-hint">
            <ellipse cx="70" cy="60" rx="46" ry="34" fill="#ffffff"/>
            <ellipse cx="120" cy="52" rx="52" ry="40" fill="#ffffff"/>
            <ellipse cx="150" cy="70" rx="38" ry="30" fill="#f2f8fc"/>
            <ellipse cx="60" cy="78" rx="40" ry="26" fill="#f2f8fc"/>
            <circle cx="92" cy="60" r="8.5" fill="#fff" stroke="#2b3a44" stroke-width="1.4"/>
            <circle cx="128" cy="58" r="8.5" fill="#fff" stroke="#2b3a44" stroke-width="1.4"/>
            <circle cx="94" cy="61" r="4" fill="#26323a"/><circle cx="130" cy="59" r="4" fill="#26323a"/>
            <circle cx="92.5" cy="59" r="1.6" fill="#fff"/><circle cx="128.5" cy="57" r="1.6" fill="#fff"/>
            <circle cx="78" cy="74" r="7" fill="#ff7fb6" opacity=".45"/>
            <circle cx="142" cy="72" r="7" fill="#ff7fb6" opacity=".45"/>
            <path d="M104 74 q7 7 14 0" fill="none" stroke="#2b3a44" stroke-width="2.4" stroke-linecap="round"/>
          </g>
        </svg>
        <div class="pv-row" id="pvRow">${cells}</div>
      </div>`;

    const stage = $("pvStage");
    this._stage = stage;
    this._down = ev => { ev.preventDefault(); this.pouring = true; this.idle = 0; stage.classList.add("pouring"); };
    this._up = () => { if (!this.assist) { this.pouring = false; this._stage && this._stage.classList.remove("pouring"); } };
    stage.addEventListener("pointerdown", this._down);
    stage.addEventListener("pointerup", this._up);
    stage.addEventListener("pointercancel", this._up);
    stage.addEventListener("pointerleave", this._up);

    // cache water elements per vessel for the rAF loop
    this.vessels.forEach((v, i) => {
      const svg = stage.querySelector(`.pv-vessel[data-i="${i}"] svg`);
      v.water = svg.querySelector(".pv-water");
      v.wtop = svg.querySelector(".pv-water-top");
      v.top = +svg.dataset.top; v.bot = +svg.dataset.bot;
      v.stream = stage.querySelector(`.pv-stream[data-i="${i}"]`);
    });

    this.lastT = performance.now();
    const loop = t => {
      if (!this._stage || !this._stage.isConnected) { this.stop(); return; }
      this.frame(t);
      if (this.raf !== null) this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  },

  frame(t) {
    const dt = Math.min(50, t - this.lastT) / 1000;
    this.lastT = t;
    if (this.done) return;

    // idle → nudge → auto-pour assist, so a child who never presses is still rescued
    if (!this.pouring && !this.assist) {
      this.idle += dt;
      if (!this.nudged && this.idle > 3.5) { this.nudged = true; speak(pvL(PV_TXT.nudge)); }
      if (this.idle > 6.5) { this.assist = true; this.pouring = true; this._stage.classList.add("pouring"); }
    }

    const flowing = this.pouring;
    for (const v of this.vessels) {
      if (v.stream) v.stream.classList.toggle("on", flowing && !v.full);
      if (!flowing || v.full) continue;
      v.fill = Math.min(v.cap, v.fill + this.rate * dt);
      const f = v.fill / v.cap;
      const h = Math.max(0, f * (v.bot - v.top));
      const y = v.bot - h;
      v.water.setAttribute("y", y.toFixed(1));
      v.water.setAttribute("height", h.toFixed(1));
      v.wtop.setAttribute("y", Math.max(0, y - 3).toFixed(1));
      v.wtop.setAttribute("height", h > 0 ? "3" : "0");
      if (v.fill >= v.cap - 1e-4) this.vesselFull(v);
    }
  },

  vesselFull(v) {
    v.full = true;
    if (v.stream) v.stream.classList.remove("on");
    const cell = this._stage.querySelector(`.pv-full[data-i="${v.idx}"]`);
    if (cell) cell.classList.add("show");
    const vessel = this._stage.querySelector(`.pv-vessel[data-i="${v.idx}"]`);
    if (vessel) { vessel.classList.remove("pv-cheer"); void vessel.offsetWidth; vessel.classList.add("pv-cheer"); }
    const r = (vessel || this._stage).getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.4;
    sfx.tap(); tone(560, 0, .16, "sine", .13);
    miniStar(cx, cy); floaters(["✨", "💧", "🫧"], cx, cy, 4);
    if (this.vessels.every(x => x.full)) this.finish();
  },

  finish() {
    if (this.done) return;
    this.done = true;
    this.pouring = false;
    this.stop();

    const maxCap = Math.max(...this.vessels.map(v => v.cap));
    const winners = this.vessels.filter(v => v.cap >= maxCap - 1e-3);
    const allSame = this.vessels.every(v => Math.abs(v.cap - this.vessels[0].cap) < 1e-3);

    let line;
    if (allSame) line = pvL(PV_TXT.same);
    else { const win = winners[0]; line = PV_TXT.most[curLang()] ? PV_TXT.most[curLang()](pvL(win.name)) : PV_TXT.most.en(pvL(win.name)); }
    speak(line + " " + praise());
    roundComplete();
  },

  stop() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    if (this._stage) {
      this._stage.removeEventListener("pointerdown", this._down);
      this._stage.removeEventListener("pointerup", this._up);
      this._stage.removeEventListener("pointercancel", this._up);
      this._stage.removeEventListener("pointerleave", this._up);
      this._stage = null;
    }
    this.pouring = false;
  },
};

// A vessel SVG: light interior, the water rect (clipped to the interior) that the loop
// grows upward, then the outline + face on top. data-top/data-bot give the loop the
// water's travel in viewBox units.
function pvVesselSVG(spec, i) {
  const { x, y, w, h } = spec.in;
  const bot = y + h, top = y;
  const clip = "pvClip" + i;
  const [ex, ey] = spec.eye;
  return `<svg viewBox="0 0 ${spec.vb[0]} ${spec.vb[1]}" width="100%" data-top="${top}" data-bot="${bot}">
    <defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/></clipPath></defs>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#eef7fc"/>
    <g clip-path="url(#${clip})">
      <rect class="pv-water" x="${x - 6}" width="${w + 12}" y="${bot}" height="0" fill="#3fb0ee"/>
      <rect class="pv-water-top" x="${x - 6}" width="${w + 12}" y="${bot}" height="3" fill="#a5e4ff" opacity=".9"/>
    </g>
    ${spec.body}
    ${pvFace(ex, ey)}
  </svg>`;
}

registerGame({
  id: "pour", world: "brain", icon: "💧", name: "Fill It Up!", es: "¡Llénalo!",
  yue: "裝滿佢", lvl: 1, v: 54, cue: "splash", level: pourLevel
});
