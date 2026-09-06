"use strict";
/* ================= Scene kit =================
   Shared, drawn-SVG scenery every game composes its screen from.

   Why this exists: measured across all 35 levels, the average play area carried a
   foreground object on 15% of its surface, and 20 games sat under 15% — objects
   floating in a gradient. Filling them one at a time is a job that never finishes,
   so this is the layer library that makes each one a few lines.

   It is also the fix for the art reading as three languages at once. Everything
   here is drawn SVG built from a small shape vocabulary: no emoji, no flat
   untextured primitives. Emoji stay for whole objects a game is *about*.

   Use:
     $("playArea").innerHTML = scene.html("reef") + `...the game...`;

   Layers, back to front — sky wash, far silhouettes, mid props, ground, drifting
   motes, then a foreground frame at the very edges. The frame is the one doing the
   most work: something nearest the eye is what makes a flat screen read as a place.

   Everything is seeded, so a scene lands identically on every repaint and across
   devices, and everything is decorative — `pointer-events:none` throughout, so no
   layer can ever steal a tap from the game. */

const SCENE_SHAPE = {
  // A rounded hill. Continuous shapes live in stretch-to-fit bands, where the
  // distortion is invisible; discrete props never do.
  hill: (x, w, h, fill, o = 1) =>
    `<path d="M${x} 100 Q${x + w * .25} ${100 - h * 1.15} ${x + w * .5} ${100 - h}
              Q${x + w * .75} ${100 - h * .85} ${x + w} 100 Z" fill="${fill}" opacity="${o}"/>`,

  pine: (x, base, h, fill, dark) => {
    const w = h * .58;
    return `<g opacity=".95">
      <rect x="${x - w * .07}" y="${base - h * .22}" width="${w * .14}" height="${h * .24}" rx="${w * .06}" fill="${dark}"/>
      <path d="M${x} ${base - h} L${x + w * .5} ${base - h * .52} L${x - w * .5} ${base - h * .52} Z" fill="${fill}"/>
      <path d="M${x} ${base - h * .76} L${x + w * .62} ${base - h * .2} L${x - w * .62} ${base - h * .2} Z" fill="${dark}"/>
    </g>`;
  },

  rock: (x, y, r, fill, light) =>
    `<g><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .74}" fill="${fill}"/>
        <ellipse cx="${x - r * .26}" cy="${y - r * .26}" rx="${r * .44}" ry="${r * .3}" fill="${light}" opacity=".55"/></g>`,

  // A wavy stalk — kelp underwater, wheat on land. Two strokes so it has a spine.
  stalk: (x, base, h, fill, sway = 10) =>
    `<path d="M${x} ${base} C${x + sway} ${base - h * .35} ${x - sway} ${base - h * .68} ${x} ${base - h}"
           fill="none" stroke="${fill}" stroke-width="${h * .12}" stroke-linecap="round" opacity=".9"/>`,

  coral: (x, base, h, fill, light) =>
    `<g stroke-linecap="round" fill="none" opacity=".95">
       <g stroke="${fill}" stroke-width="${h * .19}">
         <path d="M${x} ${base} C${x - h * .05} ${base - h * .3} ${x + h * .04} ${base - h * .4} ${x} ${base - h * .58}"/>
         <path d="M${x} ${base - h * .3} C${x - h * .2} ${base - h * .48} ${x - h * .28} ${base - h * .6} ${x - h * .3} ${base - h * .8}"/>
         <path d="M${x} ${base - h * .4} C${x + h * .2} ${base - h * .56} ${x + h * .3} ${base - h * .68} ${x + h * .32} ${base - h * .88}"/>
         <path d="M${x - h * .16} ${base - h * .42} C${x - h * .3} ${base - h * .5} ${x - h * .42} ${base - h * .56} ${x - h * .5} ${base - h * .66}"/>
         <path d="M${x + h * .14} ${base - h * .52} C${x + h * .3} ${base - h * .6} ${x + h * .42} ${base - h * .64} ${x + h * .52} ${base - h * .72}"/>
       </g>
       <g stroke="${light}" stroke-width="${h * .07}" opacity=".5">
         <path d="M${x} ${base - h * .05} V${base - h * .5}"/>
       </g>
     </g>`,

  flower: (x, y, r, petal, heart) => {
    let p = "";
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      p += `<ellipse cx="${(x + Math.cos(a) * r * .78).toFixed(1)}" cy="${(y + Math.sin(a) * r * .78).toFixed(1)}"
            rx="${r * .52}" ry="${r * .52}" fill="${petal}"/>`;
    }
    return `<g>${p}<circle cx="${x}" cy="${y}" r="${r * .46}" fill="${heart}"/></g>`;
  },

  // Grass/seagrass tuft — the workhorse of the foreground frame.
  tuft: (x, base, h, fill) => {
    let p = "";
    for (let i = -2; i <= 2; i++) {
      const lean = i * h * .22, hh = h * (1 - Math.abs(i) * .16);
      p += `<path d="M${x} ${base} Q${x + lean * .5} ${base - hh * .6} ${x + lean} ${base - hh}"
             fill="none" stroke="${fill}" stroke-width="${h * .105}" stroke-linecap="round"/>`;
    }
    return `<g opacity=".95">${p}</g>`;
  },

  star: (x, y, r, fill) =>
    `<path d="M${x} ${y - r} L${x + r * .3} ${y - r * .3} L${x + r} ${y} L${x + r * .3} ${y + r * .3}
              L${x} ${y + r} L${x - r * .3} ${y + r * .3} L${x - r} ${y} L${x - r * .3} ${y - r * .3} Z"
           fill="${fill}"/>`,

  // Flat and wide with a level underside. Three tall lobes read as a snowy hill
  // floating in the sky, which is what the first build looked like.
  cloud: (x, y, r, fill, o = .9) =>
    `<g opacity="${o}">
       <ellipse cx="${x}" cy="${y}" rx="${r * .74}" ry="${r * .40}" fill="${fill}"/>
       <ellipse cx="${x - r * .78}" cy="${y + r * .12}" rx="${r * .62}" ry="${r * .30}" fill="${fill}"/>
       <ellipse cx="${x + r * .82}" cy="${y + r * .13}" rx="${r * .56}" ry="${r * .27}" fill="${fill}"/>
       <ellipse cx="${x - r * .30}" cy="${y - r * .22}" rx="${r * .42}" ry="${r * .30}" fill="${fill}"/>
       <rect x="${x - r * 1.36}" y="${y + r * .06}" width="${r * 2.7}" height="${r * .36}" rx="${r * .18}" fill="${fill}"/>
     </g>`,
};

/* Each biome is a palette plus a recipe for what grows in each band. Bands are
   drawn into a 400x100 viewBox and stretched; props are placed by percentage so
   they never distort. */
const BIOMES = {
  snow: {
    drift:{ kind:"bird", fill:"rgba(255,255,255,.45)" },
    canopy:{ kind:"cloud", fill:"#dfeeff" },
    far:   { fill: "#bcd8f0", alt: "#a9cbe8" },
    ground:{ top: "rgba(255,255,255,0)", bottom: "#eaf4ff", line: "#dceaf8" },
    props: ["pine", "rock"],
    palette: { pine: "#5b9e77", pineDark: "#3f7d5c", rock: "#c8d6e4", rockLight: "#e8f0f8" },
    frame: { kind: "tuft", fill: "#b9d4ee" },
    motes: { kind: "snow", fill: "rgba(255,255,255,.9)" },
  },
  reef: {
    drift:{ kind:"fish", fill:"rgba(20,70,95,.20)" },
    canopy:{ kind:"caustic", fill:"#dff6ff" },
    far:   { fill: "#3f9fbd", alt: "#358aa6" },
    ground:{ top: "rgba(226,201,140,0)", bottom: "#e2c98c", line: "#d8bd7a" },
    props: ["coral", "stalk", "rock"],
    palette: { coral: "#f2795c", coralLight: "#ffc4ae", stalk: "#3fae7d", rock: "#9fb6c4", rockLight: "#c8dae6" },
    frame: { kind: "stalk", fill: "#2f9d6e" },
    motes: { kind: "bubble", fill: "rgba(255,255,255,.55)" },
  },
  meadow: {
    drift:{ kind:"bird", fill:"rgba(60,90,60,.30)" },
    canopy:{ kind:"cloud", fill:"#ffffff" },
    far:   { fill: "#9ed48a", alt: "#8ac77a" },
    ground:{ top: "rgba(140,200,110,0)", bottom: "#8fc96f", line: "#7cb85e" },
    props: ["pine", "flower"],
    palette: { pine: "#57a06f", pineDark: "#3d8055", flower: "#ff8fc0", flowerHeart: "#ffd23e" },
    frame: { kind: "tuft", fill: "#6cb35a" },
    motes: { kind: "pollen", fill: "rgba(255,240,170,.85)" },
  },
  savanna: {
    drift:{ kind:"bird", fill:"rgba(110,90,50,.30)" },
    canopy:{ kind:"cloud", fill:"#fff6e0" },
    far:   { fill: "#e6cf95", alt: "#d9bf80" },
    ground:{ top: "rgba(226,201,140,0)", bottom: "#e0c383", line: "#cfae6c" },
    props: ["rock", "stalk"],
    palette: { stalk: "#c9a44f", rock: "#b9a189", rockLight: "#d8c6b2" },
    frame: { kind: "tuft", fill: "#c4a054" },
    motes: { kind: "pollen", fill: "rgba(255,236,180,.7)" },
  },
  forest: {
    drift:{ kind:"leaf", fill:"rgba(60,110,70,.30)" },
    canopy:{ kind:"leaves", fill:"#3f8f5f" },
    far:   { fill: "#7fb976", alt: "#6aa663" },
    ground:{ top: "rgba(122,166,96,0)", bottom: "#7aa660", line: "#68914f" },
    props: ["pine", "rock", "flower"],
    palette: { pine: "#3f8f5f", pineDark: "#2c6e46", rock: "#a9a293", rockLight: "#c9c3b5",
               flower: "#ff9ec7", flowerHeart: "#fff0a8" },
    frame: { kind: "tuft", fill: "#4f9350" },
    motes: { kind: "pollen", fill: "rgba(215,245,180,.8)" },
  },
  space: {
    drift:{ kind:"leaf", fill:"rgba(180,170,230,.25)" },
    canopy:{ kind:"stars", fill:"#ffe98a" },
    far:   { fill: "#2b2560", alt: "#241f52" },
    ground:{ top: "rgba(60,50,110,0)", bottom: "#3a3170", line: "#4a3f88" },
    props: ["rock", "star"],
    palette: { rock: "#5a4f96", rockLight: "#7b6fbd", star: "#ffe98a" },
    frame: { kind: "rockline", fill: "#3a3170" },
    motes: { kind: "sparkle", fill: "rgba(255,240,170,.9)" },
  },
  cozy: {
    drift:{ kind:"leaf", fill:"rgba(180,150,120,.18)" },
    canopy:{ kind:"cloud", fill:"#fff2e4" },
    far:   { fill: "#e8d3bd", alt: "#dcc4ab" },
    ground:{ top: "rgba(214,178,146,0)", bottom: "#d8b492", line: "#c79f7c" },
    props: ["rock", "flower"],
    palette: { rock: "#c9a98f", rockLight: "#e2c9b3", flower: "#ffb3c9", flowerHeart: "#ffe08a" },
    frame: { kind: "cushion", fill: "#caa285" },
    motes: { kind: "dust", fill: "rgba(255,240,215,.7)" },
  },
};

// Which biome a body theme belongs to, so a game usually needs no argument at all.
const THEME_BIOME = {
  "theme-snow": "snow", "theme-ocean": "reef", "theme-sky": "meadow",
  "theme-bike": "meadow", "theme-pasta": "meadow", "theme-pizza": "meadow",
  "theme-space": "space", "theme-story": "meadow", "theme-music": "forest",
  "theme-whosays": "meadow", "theme-zoo": "savanna", "theme-farm": "savanna",
  "theme-dino": "forest", "theme-memory": "forest", "theme-trace": "space",
  "theme-icecream": "meadow", "theme-pets": "cozy", "theme-dressup": "cozy",
  "theme-feelings": "cozy", "theme-scavenger": "meadow", "theme-senses": "cozy",
  "theme-nightday": "space", "theme-measure": "meadow", "theme-sort": "reef",
  "theme-cups": "cozy", "theme-dragon": "forest",
};

const scene = {
  // 400x100 bands; props positioned in percentages so nothing is squashed.
  band(inner, cls, extra = "") {
    return `<div class="sc-band ${cls}" ${extra}>
              <svg viewBox="0 0 400 100" preserveAspectRatio="none">${inner}</svg>
            </div>`;
  },

  far(b, seed) {
    const S = SCENE_SHAPE;
    let h = "";
    for (let i = 0; i < 5; i++) {
      const r1 = seeded(seed + i * 7 + 1), r2 = seeded(seed + i * 13 + 5);
      h += S.hill(i * 92 - 40 + r1 * 30, 150 + r2 * 90, 42 + r1 * 34,
                  i % 2 ? b.far.alt : b.far.fill, .55 + r2 * .25);
    }
    return this.band(h, "sc-far");
  },

  // Discrete props: their own small SVGs, placed by percent, so a wide tablet does
  // not stretch a tree into a smear.
  mid(b, seed) {
    const S = SCENE_SHAPE, p = b.palette;
    let out = "";
    for (let i = 0; i < 9; i++) {
      const r1 = seeded(seed + i * 11 + 3), r2 = seeded(seed + i * 17 + 9), r3 = seeded(seed + i * 23 + 2);
      if (r3 < .18) continue;                                   // leave gaps
      const kind = b.props[Math.floor(r2 * b.props.length)];
      const x = 3 + i * 11.5 + r1 * 5, sz = 9 + r1 * 7;
      let art = "";
      if (kind === "pine")   art = S.pine(30, 58, 46 + r1 * 12, p.pine, p.pineDark);
      if (kind === "rock")   art = S.rock(30, 44, 17 + r2 * 7, p.rock, p.rockLight);
      if (kind === "coral")  art = S.coral(30, 58, 40 + r1 * 14, p.coral, p.coralLight);
      if (kind === "stalk")  art = S.stalk(30, 58, 44 + r2 * 12, p.stalk, 8 + r1 * 8);
      if (kind === "flower") art = S.flower(30, 40, 12 + r1 * 5, p.flower, p.flowerHeart);
      if (kind === "star")   art = S.star(30, 34, 12 + r1 * 6, p.star);
      if (!art) continue;
      // stagger depth: props nearer the front sit lower and draw a little larger, so the
      // band reads as ground receding rather than a row of stamps on one line
      const depth = seeded(seed + i * 31 + 7);
      const drop = (depth * 34).toFixed(0), scale = (0.82 + depth * 0.42).toFixed(2);
      out += `<span class="sc-prop" style="left:${x.toFixed(1)}%; width:${(sz * scale).toFixed(1)}%;
                 bottom:${(-drop / 6).toFixed(1)}%; opacity:${(0.72 + depth * 0.28).toFixed(2)};
                 z-index:${Math.round(depth * 5)}">
                <svg viewBox="0 0 60 60">${art}</svg></span>`;
    }
    return `<div class="sc-mid">${out}</div>`;
  },

  // The top band. The first build of this kit filled the floor and left two-thirds of
  // the screen bare, which looked barely different from having no scenery at all.
  canopy(b, seed) {
    const S = SCENE_SHAPE, c = b.canopy;
    if (!c) return "";
    let out = "";
    for (let i = 0; i < 5; i++) {
      const r1 = seeded(seed + i * 19 + 8), r2 = seeded(seed + i * 27 + 12);
      if (c.kind === "cloud") out += S.cloud(30 + i * 85 + r1 * 40, 26 + r2 * 22, 22 + r1 * 14, c.fill, .5 + r2 * .3);
      if (c.kind === "caustic")
        // light shafts: narrow, leaning, and faded to nothing at the bottom. Squared-off
        // full-opacity slabs read as UI panels, which is what the first build looked like.
        out += `<path d="M${i * 96 - 10} 0 L${i * 96 + 16 + r1 * 14} 0 L${i * 96 + 40 + r2 * 26} 100 L${i * 96 + 6} 100 Z"
                 fill="url(#scShaft)" opacity="${(.30 + r1 * .22).toFixed(2)}"/>`;
      if (c.kind === "stars") out += S.star(20 + i * 82 + r1 * 50, 18 + r2 * 46, 5 + r1 * 5, c.fill);
      if (c.kind === "leaves")
        out += `<ellipse cx="${16 + i * 84 + r1 * 40}" cy="${-6 + r2 * 26}" rx="${34 + r1 * 22}" ry="${26 + r2 * 14}"
                 fill="${c.fill}" opacity="${(.5 + r1 * .3).toFixed(2)}"/>`;
    }
    const defs = c.kind === "caustic"
      ? `<defs><linearGradient id="scShaft" x1="0" y1="0" x2="0" y2="1">
           <stop offset="0" stop-color="${c.fill}" stop-opacity=".85"/>
           <stop offset="1" stop-color="${c.fill}" stop-opacity="0"/>
         </linearGradient></defs>` : "";
    return this.band(defs + out, "sc-canopy");
  },

  /* Mid-water/mid-air drifters — the layer that fills the big empty middle of a tall
     phone screen, which neither the canopy nor the floor can reach.

     Deliberately NEUTRAL and unsaturated: in colour-naming games the tappable objects
     carry the answer, so a background shape must never wear a nameable colour or it
     competes with the question. Silhouettes only. */
  drift(b, seed) {
    const d = b.drift;
    if (!d) return "";
    let out = "";
    for (let i = 0; i < 6; i++) {
      const r1 = seeded(seed + i * 43 + 13), r2 = seeded(seed + i * 47 + 19), r3 = seeded(seed + i * 53 + 23);
      const y = 18 + r2 * 52, sz = 4 + r1 * 5, dur = (16 + r3 * 16).toFixed(1);
      let art = "";
      if (d.kind === "fish")
        art = `<path d="M2 8 Q10 1 20 8 Q10 15 2 8 Z M20 8 L26 3 L26 13 Z" fill="${d.fill}"/>`;
      if (d.kind === "bird")
        art = `<path d="M2 9 Q8 2 14 9 Q20 2 26 9" fill="none" stroke="${d.fill}" stroke-width="2" stroke-linecap="round"/>`;
      if (d.kind === "leaf")
        art = `<ellipse cx="14" cy="8" rx="9" ry="5" fill="${d.fill}" transform="rotate(${(r1 * 60 - 30).toFixed(0)} 14 8)"/>`;
      if (!art) continue;
      out += `<span class="sc-drift" style="top:${y.toFixed(1)}%; width:${sz.toFixed(1)}%;
                 animation-duration:${dur}s; animation-delay:-${(r2 * 20).toFixed(1)}s">
                <svg viewBox="0 0 28 16">${art}</svg></span>`;
    }
    return `<div class="sc-drifts">${out}</div>`;
  },

  ground(b) {
    return `<div class="sc-ground" style="background:linear-gradient(${b.ground.top}, ${b.ground.bottom} 62%)">
              <div class="sc-groundline" style="background:${b.ground.line}"></div>
            </div>`;
  },

  // The foreground frame: the nearest-eye layer, and the reason a flat screen
  // starts reading as a place. Deliberately large, dark and cropped by the edges.
  frame(b, seed) {
    const S = SCENE_SHAPE, f = b.frame;
    const draw = (x, base, h) =>
      f.kind === "stalk"    ? S.stalk(x, base, h, f.fill, 12)
      // indoors there is no grass: soft rounded forms read as a cushion or a rug edge
    : f.kind === "cushion"  ? `<rect x="${x - h * .42}" y="${base - h * .6}" width="${h * .84}"
                                 height="${h * .8}" rx="${h * .28}" fill="${f.fill}"/>`
      // in space the frame is the rim of whatever she is standing on
    : f.kind === "rockline" ? `<path d="M${x - h * .6} ${base} Q${x} ${base - h * .62} ${x + h * .6} ${base} Z"
                                 fill="${f.fill}"/>`
                            : S.tuft(x, base, h, f.fill);
    let left = "", right = "";
    for (let i = 0; i < 3; i++) {
      const r = seeded(seed + i * 29 + 4);
      left  += draw(10 + i * 20 + r * 8, 100, 56 + r * 30);
      right += draw(10 + i * 20 + r * 8, 100, 54 + r * 32);
    }
    return `<div class="sc-frame sc-frame-l"><svg viewBox="0 0 70 100" preserveAspectRatio="xMinYMax meet">${left}</svg></div>
            <div class="sc-frame sc-frame-r"><svg viewBox="0 0 70 100" preserveAspectRatio="xMaxYMax meet">${right}</svg></div>`;
  },

  motes(b, seed) {
    const m = b.motes;
    let out = "";
    for (let i = 0; i < 14; i++) {
      const r1 = seeded(seed + i * 31 + 6), r2 = seeded(seed + i * 37 + 11), r3 = seeded(seed + i * 41 + 17);
      const size = m.kind === "bubble" ? 5 + r1 * 12 : 3 + r1 * 6;
      out += `<i class="sc-mote sc-${m.kind}" style="left:${(r2 * 98).toFixed(1)}%; top:${(r3 * 96).toFixed(1)}%;
                 width:${size.toFixed(1)}px; height:${size.toFixed(1)}px; background:${m.fill};
                 animation-duration:${(7 + r1 * 9).toFixed(1)}s; animation-delay:-${(r3 * 12).toFixed(1)}s"></i>`;
    }
    return `<div class="sc-motes">${out}</div>`;
  },

  /* The whole kit, or any subset of it.
     opts.layers — defaults to everything; pass a subset to keep a busy game readable.
     opts.seed   — vary the scene between rounds without changing biome. */
  html(biome, opts = {}) {
    const b = BIOMES[biome] || BIOMES[THEME_BIOME[biome] || "meadow"] || BIOMES.meadow;
    const seed = opts.seed || 1;
    const want = opts.layers || ["canopy", "far", "drift", "mid", "ground", "motes", "frame"];
    const has = k => want.includes(k);
    return `<div class="sc-scene" aria-hidden="true">
      ${has("canopy") ? this.canopy(b, seed) : ""}
      ${has("far")    ? this.far(b, seed) : ""}
      ${has("drift")  ? this.drift(b, seed) : ""}
      ${has("mid")    ? this.mid(b, seed) : ""}
      ${has("ground") ? this.ground(b) : ""}
      ${has("motes")  ? this.motes(b, seed) : ""}
      ${has("frame")  ? this.frame(b, seed) : ""}
    </div>`;
  },

  // Biome for the level about to start, from its theme — so most games say nothing.
  forLevel(id) {
    const lv = (typeof LEVELS !== "undefined" && LEVELS[id]) || null;
    return (lv && THEME_BIOME[lv.theme]) || "meadow";
  },
};
