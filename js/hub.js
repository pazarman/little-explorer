"use strict";
const APP_VERSION = "27";
const LEVELS = {
  snow: snowLevel, ocean: oceanLevel, memory: memoryLevel, bike: bikeLevel,
  music: musicLevel, whosays: whosaysLevel, pizza: pizzaLevel, pasta: pastaLevel, trace: traceLevel,
  rocket: rocketLevel, sort: sortLevel, pattern: patternLevel, sortkind: sortkindLevel,
  dragon: dragonLevel, dino: dinoLevel, icecream: icecreamLevel,
  petmatch: petmatchLevel, petcare: petcareLevel, petfeed: petfeedLevel, body: bodyLevel,
  hideseek: hideseekLevel, cups: cupsLevel, nightday: nightdayLevel
};

/* ================= Categories & games ================= */
// lvl: difficulty rating (0 = easy/ages 2-3, 1 = medium/3-4, 2 = hard/4-5). Used to hide games above the chosen level.
const GAMES = {
  snow:    { icon: "❄️", name: "Count", es: "Contar", lvl: 0 },     ocean:   { icon: "🐠", name: "Colors", es: "Colores", lvl: 0 },
  memory:  { icon: "🃏", name: "Memory", es: "Memoria", lvl: 1 },    bike:    { icon: "🚲", name: "Numbers", es: "Números", lvl: 1 },
  music:   { icon: "🥁", name: "Animal Band", es: "Banda Animal", lvl: 1 }, whosays: { icon: "🔊", name: "Who Says?", es: "¿Quién Dice?", lvl: 0 },
  pizza:   { icon: "🍕", name: "Pizza", es: "Pizza", lvl: 1 },     pasta:   { icon: "🍝", name: "Yum Count", es: "A Contar", lvl: 0 },
  trace:   { icon: "✨", name: "Tracing", es: "Trazar", lvl: 2 },   rocket:  { icon: "🚀", name: "Countdown", es: "Cuenta Atrás", lvl: 2 },
  sort:    { icon: "🪐", name: "Big & Small", es: "Grande y Pequeño", lvl: 0 }, pattern: { icon: "🔮", name: "Patterns", es: "Patrones", lvl: 2 },
  sortkind:{ icon: "🧺", name: "Sort It", es: "A Ordenar", lvl: 1 },
  paint:   { icon: "🎨", name: "Paint", es: "Pintar", lvl: 0 },     story:   { icon: "📖", name: "Story", es: "Cuento", lvl: 0 },
  dragon:  { icon: "🐉", name: "Dragon Feed", es: "Alimenta al Dragón", lvl: 0 }, dino:  { icon: "🦕", name: "Flash Count", es: "Cuenta Rápida", lvl: 0 },
  icecream:{ icon: "🍦", name: "Ice Cream", es: "Helado", lvl: 0 },  petfeed: { icon: "🦴", name: "Same Treats", es: "Mismos Premios", lvl: 1 },
  petmatch:{ icon: "🐶", name: "Find Pet", es: "Busca", lvl: 0 },   petcare: { icon: "🛁", name: "Pet Care", es: "Cuida", lvl: 0 },
  body:    { icon: "😊", name: "Body Match", es: "El Cuerpo", lvl: 0 },
  dressup: { icon: "👗", name: "Dress Up", es: "Vestir", lvl: 0 },
  hideseek: { icon: "🐾", name: "Hide & Seek", es: "Escondite", lvl: 0 },
  cups:     { icon: "🥤", name: "Three Cups",  es: "Tres Vasos", lvl: 1 },
  nightday: { icon: "🌙", name: "Day & Night", es: "Día y Noche", lvl: 0 }
};
// chosen difficulty → max game level shown (auto/hard show everything)
const diffLevel = () => settings.diff === "easy" ? 0 : settings.diff === "med" ? 1 : 2;
const gameVisible = gid => (GAMES[gid].lvl || 0) <= diffLevel();
const visibleGames = cat => cat.games.filter(gameVisible);
const CATEGORIES = [
  { id: "num",    icon: "🔢", name: "Numbers",         es: "Números",          cls: "c-num",    games: ["snow", "bike", "pasta", "rocket", "dragon"] },
  { id: "shape",  icon: "🎨", name: "Colors & Shapes", es: "Colores y Figuras", cls: "c-shape",  games: ["ocean", "pizza", "trace", "icecream"] },
  { id: "brain",  icon: "🧩", name: "Brain Games",     es: "Juegos de Mente",   cls: "c-brain",  games: ["memory", "cups", "pattern", "sort", "sortkind", "nightday"] },
  { id: "animal", icon: "🐾", name: "Animals",         es: "Animales",          cls: "c-animal", games: ["music", "whosays", "dino", "body"] },
  { id: "pets",   icon: "🐶", name: "Pets",            es: "Mascotas",          cls: "c-pets",   games: ["petcare", "petmatch", "petfeed", "hideseek"] },
  { id: "create", icon: "✏️", name: "Create",          es: "Crear",             cls: "c-create", games: ["paint", "story", "dressup"] }
];
/* ── Narrator speech bubble ── */
let _narratorTimer = null;
function narratorSay(line) {
  const el = $("buddySpeech"); if (!el) return;
  if (_narratorTimer) { clearTimeout(_narratorTimer); _narratorTimer = null; }
  el.textContent = line;
  el.classList.remove("hidden", "narrator-out");
  void el.offsetWidth;
  speak(line);
  _narratorTimer = setTimeout(() => {
    el.classList.add("narrator-out");
    setTimeout(() => el.classList.add("hidden"), 380);
  }, 4200);
}
function gameCategory(gid) {
  for (const cat of CATEGORIES) { if (cat.games.includes(gid)) return cat.id; }
  return "create";
}
function hubGreeting() {
  const last = localStorage.getItem("fionaLastGame");
  if (last) { localStorage.removeItem("fionaLastGame"); return t("narrator_postgame"); }
  return rand([t("narrator_back"), t("narrator_ready")]);
}

function launchGame(id) {
  narratorSay(t("narrator_cat_" + gameCategory(id)));
  core.wait(() => {
    if (id === "paint") paint.show();
    else if (id === "story") showStory();
    else if (id === "dressup") dressup.show();
    else startLevel(id);
  }, 900);
}
function buildHub() {
  $("mapPath").setAttribute("points", "");
  const wrap = $("mapNodes"); wrap.className = "cats"; wrap.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const games = visibleGames(cat);
    if (!games.length) return;
    const earned = games.reduce((s, gid) => s + Math.min(3, completions[gid] || 0), 0);
    const b = document.createElement("button");
    b.className = "node";
    b.innerHTML = `<div class="node-disc ${cat.cls}"><span>${cat.icon}</span></div>
                   <div class="node-label">${locName(cat)}</div>
                   <div class="node-stars">${"⭐".repeat(Math.min(3, Math.round(earned / games.length)))}</div>`;
    b.onclick = () => { sfx.tap(); openCategory(cat.id); };
    wrap.appendChild(b);
  });
  renderQuest();
}
function openCategory(id) {
  audio();
  const cat = CATEGORIES.find(c => c.id === id);
  hideAllScreens();
  $("games").classList.remove("hidden");
  animScreen("games", "fwd");
  document.body.className = "";
  $("gamesTitle").textContent = `${cat.icon} ${locName(cat)}`;
  const wrap = $("gameNodes"); wrap.innerHTML = "";
  visibleGames(cat).forEach(gid => {
    const g = GAMES[gid];
    const b = document.createElement("button");
    b.className = "node";
    b.innerHTML = `<div class="node-disc b-${gid}"><span>${g.icon}</span></div>
                   <div class="node-label">${locName(g)}</div>
                   <div class="node-stars">${"⭐".repeat(Math.min(3, completions[gid] || 0))}</div>`;
    b.onclick = () => { sfx.tap(); launchGame(gid); };
    wrap.appendChild(b);
  });
}

/* ================= Story mode ================= */
const STORY = [
  { theme: "theme-bike",  art: "🚲☀️🌳", text: "One bright morning, {n} hopped on her bike. “I'm going on an adventure!” she said, and rode into the magical park.", es: "Una mañana soleada, {n} se subió a su bici. «¡Voy de aventura!», dijo, y entró al parque mágico.", tapEmoji: ["💨", "🔔", "🌸"], tapSound: () => tone(660, 0, .25, "triangle"), task: "🚲" },
  { theme: "theme-snow",  art: "🏔️⛄❄️", text: "First she climbed a sparkly snow mountain. A friendly snowman waved hello. Together they counted the snowflakes: one, two, three!", es: "Primero subió una montaña de nieve brillante. Un muñeco de nieve la saludó. ¡Juntos contaron los copos de nieve: uno, dos, tres!", tapEmoji: ["❄️", "✨", "⛄"], tapSound: () => tone(880, 0, .2, "sine"), task: "⛄" },
  { theme: "theme-ocean", art: "🌊🐠🐬", text: "Next, {n} sailed across the bright blue ocean. Red, yellow, and green fish swam all around, and a dolphin did a happy flip!", es: "Después, {n} navegó por el océano azul. Peces rojos, amarillos y verdes nadaban alrededor, ¡y un delfín dio un saltito feliz!", tapEmoji: ["🐠", "💦", "🐬"], tapSound: () => tone(523, 0, .25, "sine"), task: "🐬" },
  { theme: "theme-pizza", art: "🍕🍝🧆", text: "All that adventuring made {n} hungry! She stopped in Yummy Town for a slice of pizza and spaghetti with three little meatballs.", es: "¡Tanta aventura le dio hambre a {n}! Paró en Pueblo Rico por una rebanada de pizza y espagueti con tres albóndigas.", tapEmoji: ["🍕", "😋", "🍝"], tapSound: () => tone(440, 0, .2, "triangle"), task: "🍕" },
  { theme: "theme-music", art: "🐸🐱🐮", text: "In the meadow, the animal band was playing! The frog went ribbit, the cat went meow, and the cow went moo. {n} danced and danced.", es: "En el prado, ¡la banda de animales tocaba! La rana hacía croac, el gato miau y la vaca muu. {n} bailó y bailó.", tapEmoji: ["🎵", "🎶", "💃"], tapSound: () => speakAnimal(rand(["frog", "cat", "cow", "duck"]), { queue: true }), task: "🐱" },
  { theme: "theme-space", art: "🚀🌙⭐", text: "Then {n} put on a shiny space helmet and zoomed to the moon in a rocket! Five, four, three, two, one... blast off! She counted the twinkly stars up high.", es: "Luego {n} se puso un casco espacial brillante y voló a la luna en un cohete. ¡Cinco, cuatro, tres, dos, uno... despegue! Contó las estrellas brillantes en lo alto.", tapEmoji: ["⭐", "🚀", "🪐"], tapSound: () => tone(130, 0, .5, "sawtooth", .15), task: "🚀" },
  { theme: "theme-story", art: "🌈⭐💖", text: "As the sun set, {n} flew home, happy and sleepy. “What a wonderful day!” she yawned. Goodnight, {n}. The End. 💖", es: "Cuando el sol se ocultó, {n} voló a casa, feliz y con sueño. «¡Qué día tan maravilloso!», bostezó. Buenas noches, {n}. Fin. 💖", tapEmoji: ["⭐", "🌙", "💖"], tapSound: () => sfx.good(), last: true }
];
const storyText = p => fillName(curLang() === "es" ? p.es : p.text);
let storyPage = 0, storySolved = false;
function showStory() {
  cleanupLevel();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  hideAllScreens();
  $("story").classList.remove("hidden");
  storyPage = 0;
  renderStory();
}
function renderStory() {
  const p = STORY[storyPage];
  storySolved = !p.task;
  document.body.className = p.theme;
  const scene = $("storyScene");
  scene.className = "story-scene";
  
  // split art into interactive emojis
  const artHtml = [...p.art].map(e => `<span class="s-em" onclick="storyTap('${e}', event)">${e}</span>`).join("");
  
  scene.innerHTML = `<div class="story-art">${artHtml}</div>
      <div class="story-textbox" id="storyText">${storyText(p)}</div>
      <div class="story-tap-hint">${t("story_tap")}</div>`;
  
  $("storyDots").innerHTML = STORY.map((_, i) => `<div class="sdot ${i === storyPage ? "on" : ""}"></div>`).join("");
  $("storyPrev").style.visibility = storyPage === 0 ? "hidden" : "visible";
  updateStoryNav();
  speak(storyText(p));
  if (p.task) core.wait(() => speak(t("story_find", { x: p.task })), 6000);
}
function updateStoryNav() {
  const p = STORY[storyPage];
  const btn = $("storyNext");
  btn.textContent = p.last ? "🎉" : "▶️";
  btn.style.opacity = storySolved ? "1" : "0.3";
  btn.style.pointerEvents = storySolved ? "auto" : "none";
}
function storyTap(e, ev) {
  const p = STORY[storyPage];
  floaters(p.tapEmoji, ev.clientX || innerWidth / 2, ev.clientY || innerHeight / 2, 5);
  if (p.tapSound) p.tapSound();
  
  if (p.task && e === p.task && !storySolved) {
    storySolved = true;
    sfx.good();
    confetti();
    speak(t("found_it", { item: e }) + " " + praise());
    updateStoryNav();
  }
}
function storyNav(dir) {
  const p = STORY[storyPage];
  if (dir > 0 && p.last) { confetti(); sfx.win(); speak(t("story_end")); setTimeout(showHub, 1800); return; }
  storyPage = clamp(storyPage + dir, 0, STORY.length - 1);
  renderStory();
}

/* ================= Sticker book ================= */
const SCENES = [
  { id: "park",   name: "Park 🌳",   es: "Parque 🌳",   cls: "sc-park",   deco: "🌳 🛝 🌷 🌳 ⛲" },
  { id: "space",  name: "Space 🚀",  es: "Espacio 🚀",  cls: "sc-space",  deco: "🌑 🪐 ⭐ 🌙 ⭐" },
  { id: "ocean",  name: "Ocean 🌊",  es: "Océano 🌊",  cls: "sc-ocean",  deco: "🐚 🪸 🌊 🐚 🌊" },
  { id: "castle", name: "Castle 🏰", es: "Castillo 🏰", cls: "sc-castle", deco: "🌸 🏰 🌳 🌸" },
  { id: "bed",    name: "Cozy 🌙",   es: "Acogedor 🌙", cls: "sc-bed",    deco: "🛏️ 🧸 🪟 🌙" }
];
let decor = JSON.parse(localStorage.getItem("fionaDecor") || "{}");
let curScene = localStorage.getItem("fionaScene") || "park";
let palSel = null;
const saveDecor = () => localStorage.setItem("fionaDecor", JSON.stringify(decor));

function showStickerBook() {
  cleanupLevel();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  document.body.className = "";
  hideAllScreens();
  $("stickerbook").classList.remove("hidden");
  // scene buttons
  const sb = $("sceneBtns"); sb.innerHTML = "";
  SCENES.forEach(sc => {
    const b = document.createElement("button");
    b.className = "scene-btn" + (sc.id === curScene ? " sel" : "");
    b.textContent = locName(sc);
    b.onclick = () => { curScene = sc.id; localStorage.setItem("fionaScene", curScene); palSel = null; showStickerBook(); };
    sb.appendChild(b);
  });
  renderScene();
  // palette of earned sticker types
  const earned = [...new Set(stickers.map(s => s.e))];
  const pal = $("stickerPalette"); pal.innerHTML = "";
  if (!earned.length) {
    $("stickerHint").textContent = t("sticker_empty_hint");
    speak(t("sticker_empty_say"));
    return;
  }
  $("stickerHint").textContent = t("sticker_hint");
  speak(t("sticker_intro"));
  earned.forEach(e => {
    const b = document.createElement("button");
    b.className = "pal-item" + (e === palSel ? " sel" : "");
    b.textContent = e;
    b.onclick = () => { palSel = (palSel === e ? null : e); sfx.tick(); document.querySelectorAll(".pal-item").forEach(x => x.classList.toggle("sel", x.textContent === palSel)); };
    pal.appendChild(b);
  });
}
function renderScene() {
  const sc = SCENES.find(s => s.id === curScene) || SCENES[0];
  const scene = $("stickerScene");
  scene.className = sc.cls;
  scene.innerHTML = `<div class="scene-deco">${sc.deco}</div>`;
  scene.onpointerdown = e => {
    if (!palSel || e.target !== scene && e.target.className !== "scene-deco") return;
    const r = scene.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100;
    (decor[curScene] = decor[curScene] || []).push({ e: palSel, x, y });
    saveDecor(); sfx.tap();
    const d = (typeof STICKER_DATA !== "undefined") ? STICKER_DATA[palSel] : null;
    if (d && d.h === curScene) {
      confetti();
      speak(t("sticker_belongs", { x: d.n, scene: locName(SCENES.find(s => s.id === curScene)) }));
    }
    addPlaced({ e: palSel, x, y }, decor[curScene].length - 1);
  };
  (decor[curScene] || []).forEach((d, i) => addPlaced(d, i));
}
function addPlaced(d, idx) {
  const scene = $("stickerScene");
  const el = document.createElement("div");
  el.className = "sticker"; el.textContent = d.e;
  el.style.left = d.x + "%"; el.style.top = d.y + "%";
  el.addEventListener("pointerdown", e => {
    e.preventDefault(); e.stopPropagation();
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    el.classList.remove("settle"); el.classList.add("lifted");   // pick it up: enlarge, tilt, cast shadow
    sfx.tick();
    let moved = false; const sx = e.clientX, sy = e.clientY;
    const pct = ev => { const r = scene.getBoundingClientRect(); return { x: clamp((ev.clientX - r.left) / r.width * 100, 1, 99), y: clamp((ev.clientY - r.top) / r.height * 100, 1, 99) }; };
    const move = ev => {
      if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) moved = true;
      const q = pct(ev); el.style.left = q.x + "%"; el.style.top = q.y + "%";
      d.x = q.x; d.y = q.y;
    };
    const up = () => {
      el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up);
      el.classList.remove("lifted"); el.classList.add("settle");   // drop it: physical settlement bounce
      el.addEventListener("animationend", () => el.classList.remove("settle"), { once: true });
      sfx.tap(); saveDecor();
    };
    el.addEventListener("pointermove", move); el.addEventListener("pointerup", up);
  });
  scene.appendChild(el);
}

/* ================= Settings ================= */
function openSettings() {
  $("charscreen").classList.add("hidden"); $("namescreen").classList.add("hidden");
  $("settings").classList.remove("hidden");
  applyI18n($("settings"));
  document.querySelectorAll("#segLang button").forEach(b => b.classList.toggle("sel", b.dataset.l === (settings.lang || "en")));
  document.querySelectorAll("#segDiff button").forEach(b => b.classList.toggle("sel", b.dataset.d === settings.diff));
  document.querySelectorAll("#segVoice button").forEach(b => b.classList.toggle("sel", String(settings.voice) === b.dataset.v));
  document.querySelectorAll("#segMusic button").forEach(b => b.classList.toggle("sel", b.dataset.m === settings.music));
  const vEl = $("settingsVersion"); if (vEl) vEl.textContent = "v" + APP_VERSION;
}
function showCharScreen(returnTo) {
  hideAllScreens();
  applyI18n($("charscreen"));
  $("charscreen").classList.remove("hidden");
  $("charDone").dataset.return = returnTo || "hub";
  const grid = $("charGrid"); grid.innerHTML = "";
  BUDDIES.forEach(b => {
    const btn = document.createElement("button");
    btn.className = "char-btn" + (b.id === BUDDY ? " sel" : "");
    btn.innerHTML = `<span class="ch-e">${b.e}</span><span class="ch-n">${b.name}</span>`;
    btn.onclick = () => {
      BUDDY = b.id; localStorage.setItem("fionaBuddy", BUDDY); localStorage.setItem("fionaBuddySet", "1");
      refreshBuddies(); sfx.tap(); speak(b.name + "!");
      grid.querySelectorAll(".char-btn").forEach(x => x.classList.remove("sel")); btn.classList.add("sel");
      clearTimeout(charTimer);                       // tapping a buddy auto-advances (no need to find the button)
      charTimer = setTimeout(() => { $("charDone").dataset.return === "settings" ? openSettings() : showHub(); }, 800);
    };
    grid.appendChild(btn);
  });
}
function showDiffScreen() {
  hideAllScreens();
  $("diffMascot").innerHTML = buddyMarkup();
  applyI18n($("diffscreen"));
  $("diffscreen").classList.remove("hidden");
  speak(t("diff_say"));
}
// first-run chain: name → difficulty → buddy → hub (each step only if not already set)
function proceedAfterName() {
  if (!localStorage.getItem("fionaDiffSet")) showDiffScreen();
  else if (!localStorage.getItem("fionaBuddySet")) showCharScreen("hub");
  else showHub();
}

/* ================= Navigation ================= */
const ALL_SCREENS = ["hub", "games", "game", "stickerbook", "story", "paint", "dressup", "dashboard", "namescreen", "charscreen", "diffscreen", "settings", "celebrate"];
function hideAllScreens() { ALL_SCREENS.forEach(id => { const e = $(id); if (e) e.classList.add("hidden"); }); playWipe(); }
function playWipe() { const w = $("wipe"); if (!w) return; w.classList.remove("run"); void w.offsetWidth; w.classList.add("run"); }
// contextual screen entrance: "fwd" (drill in) or "back" (go home); falls back to default screenIn
function animScreen(id, cls) { const el = $(id); if (!el) return; el.classList.remove("fwd", "back"); void el.offsetWidth; el.classList.add(cls); }
function showHub() {
  cleanupLevel();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  setMascots("talking", false);
  document.body.className = "";
  hideAllScreens();
  $("hub").classList.remove("hidden");
  animScreen("hub", "back");
  applyName();
  buildHub();
  if (!questGreeted && settings.voice) { questGreeted = true; core.wait(questIntro, 800); }
  else core.wait(() => narratorSay(hubGreeting()), 700);
}
function startLevel(name) {
  audio(); cleanupLevel();
  state.level = name; state.round = 0; state.busy = false; state.tier = tierFor(name);
  roundMistakes = 0;
  document.body.className = LEVELS[name].theme;
  hideAllScreens();
  $("game").classList.remove("hidden");
  animScreen("game", "fwd");
  drawProgress();
  LEVELS[name].startRound();
}
function showDashboard() {
  cleanupLevel();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  document.body.className = "";
  hideAllScreens();
  applyI18n($("dashboard"));
  $("dashboard").classList.remove("hidden");
  const plays = id => completions[id] || 0;
  const totalPlays = Object.values(completions).reduce((a, b) => a + b, 0);
  const totalStars = Object.keys(completions).reduce((a, k) => a + Math.min(3, completions[k]), 0);
  const gamesTried = Object.keys(completions).filter(k => completions[k] > 0).length;
  $("dashStats").innerHTML =
    `<div class="stat"><div class="sv">⭐ ${totalStars}</div><div class="sl">${t("dash_stars")}</div></div>
     <div class="stat"><div class="sv">🎮 ${totalPlays}</div><div class="sl">${t("dash_played")}</div></div>
     <div class="stat"><div class="sv">📒 ${stickers.length}</div><div class="sl">${t("dash_stickers")}</div></div>
     <div class="stat"><div class="sv">🗂️ ${gamesTried}/${Object.keys(GAMES).length}</div><div class="sl">${t("dash_tried")}</div></div>
     <div class="stat"><div class="sv">🚀 ${trips}</div><div class="sl">${t("dash_trips")}</div></div>
     <div class="stat"><div class="sv">⚡ ${sparks}/${QUEST_GOAL}</div><div class="sl">${t("dash_sparks")}</div></div>`;
  const list = $("dashList"); list.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const rows = cat.games.map(gid => {
      const g = GAMES[gid], p = plays(gid);
      return `<div class="dash-row"><span class="dg">${g.icon} ${locName(g)}</span>
              <span class="dp">${p ? "⭐".repeat(Math.min(3, p)) + (p > 3 ? ` ×${p}` : "") : "—"}</span></div>`;
    }).join("");
    list.innerHTML += `<div class="dash-cat"><h3>${cat.icon} ${locName(cat)}</h3>${rows}</div>`;
  });
}

/* ================= Boot ================= */
refreshBuddies();
buildHub();
document.addEventListener("contextmenu", e => e.preventDefault());   // no right-click / long-press menus for little hands
$("homeBtn").onclick = showHub;
$("gamesHome").onclick = showHub;
$("celebHome").onclick = showHub;
$("celebBook").onclick = showStickerBook;
$("celebLaunch").onclick = rocketLaunch;
$("questBar").onclick = () => { sfx.tap(); questSpeak(); };
$("bookBtn").onclick = () => { audio(); showStickerBook(); };
$("bookHome").onclick = showHub;
$("musicBtn").onclick = toggleMusic;
$("speakBtn").onclick = () => speak($("instruction").dataset.spoken || $("instruction").textContent);
$("settingsBtn").onclick = openSettings;
$("setDone").onclick = () => { $("settings").classList.add("hidden"); buildHub(); };   // rebuild hub so a difficulty change re-filters games
$("setReset").onclick = () => {
  if (confirm("Reset all of " + NAME + "'s stars and stickers?")) {
    for (const k in completions) delete completions[k];
    stickers.length = 0; sparks = 0; trips = 0; questShown = 0;
    saveCompletions(); saveStickers(); saveQuest(); buildHub();
  }
};
$("setRestart").onclick = () => {
  if (confirm(t("settings_restart_confirm"))) { localStorage.clear(); location.reload(); }
};
$("setName").onclick = () => { $("settings").classList.add("hidden"); showNameScreen(NAME); };
document.querySelectorAll("#segLang button").forEach(b => b.onclick = () => {
  settings.lang = b.dataset.l; saveSettings();
  document.documentElement.lang = settings.lang === "es" ? "es" : "en";
  sfx.tap(); openSettings();
});
document.querySelectorAll("#segDiff button").forEach(b => b.onclick = () => { settings.diff = b.dataset.d; saveSettings(); openSettings(); });
document.querySelectorAll("#segVoice button").forEach(b => b.onclick = () => { settings.voice = +b.dataset.v; saveSettings(); openSettings(); });
document.querySelectorAll("#segMusic button").forEach(b => b.onclick = () => {
  settings.music = b.dataset.m; saveSettings();
  if (settings.music === "off") stopMusic(); else { stopMusic(); startMusic(); }
  openSettings();
});
$("setBuddy").onclick = () => { $("settings").classList.add("hidden"); showCharScreen("settings"); };
$("charDone").onclick = () => { clearTimeout(charTimer); $("charDone").dataset.return === "settings" ? openSettings() : showHub(); };
$("storyHome").onclick = showHub;
$("storyPrev").onclick = () => storyNav(-1);
$("storyNext").onclick = () => storyNav(1);
$("storyRead").onclick = () => speak(storyText(STORY[storyPage]));
$("paintHome").onclick = showHub;
$("paintStamp").onclick = () => {
  if (paint.mode !== "stamp") paint.mode = "stamp";
  else paint.stampIdx = (paint.stampIdx + 1) % paint.stamps.length;
  $("paintStamp").textContent = paint.stamps[paint.stampIdx];
  $("paintStamp").classList.add("on"); $("paintErase").classList.remove("on");
};
$("paintErase").onclick = () => { paint.mode = "erase"; $("paintErase").classList.add("on"); $("paintStamp").classList.remove("on"); };
$("paintClear").onclick = () => paint.redraw();
$("paintDone").onclick = () => { celebrateWith("paint", { noLevelUp: true }); };

// Keep drawing canvases aligned with their container when the viewport changes (rotation,
// mobile address-bar collapse). Coalesced via rAF so layout has settled before we re-measure.
let _canvasResizeRAF = 0;
function syncDrawingCanvases() {
  const p = $("paint");
  if (p && !p.classList.contains("hidden") && $("paintC")) paint.resize();
  if ($("inkC") && $("guideC")) traceLevel.resize();   // trace canvases only exist while that level is active
}
function onCanvasViewportChange() {
  cancelAnimationFrame(_canvasResizeRAF);
  _canvasResizeRAF = requestAnimationFrame(syncDrawingCanvases);
}
addEventListener("resize", onCanvasViewportChange);
addEventListener("orientationchange", onCanvasViewportChange);
if (window.visualViewport) visualViewport.addEventListener("resize", onCanvasViewportChange);

/* ---- dress-up ---- */
$("dressHome").onclick = showHub;
$("dressBg").onclick = () => dressup.cycleBg();
$("dressShuffle").onclick = () => dressup.shuffle();
$("dressDone").onclick = () => dressup.done();

/* ---- dashboard ---- */
$("dashHome").onclick = showHub;
$("setDash").onclick = () => { $("settings").classList.add("hidden"); showDashboard(); };

/* ---- sticker book clear ---- */
$("sceneClear").onclick = () => { if (decor[curScene] && decor[curScene].length) { decor[curScene] = []; saveDecor(); sfx.tick(); renderScene(); } };

/* ---- name entry ---- */
function showNameScreen(prefill) {
  $("nameMascot").innerHTML = buddyMarkup();
  $("nameInput").value = prefill || "";
  hideAllScreens();
  applyI18n($("namescreen"));
  $("namescreen").classList.remove("hidden");
  setTimeout(() => { try { $("nameInput").focus(); } catch (_) {} }, 250);
}
function commitName() {
  audio();
  const v = $("nameInput").value.trim();
  NAME = v ? v.slice(0, 12) : "Explorer";
  localStorage.setItem("fionaName", NAME);
  localStorage.setItem("fionaNameSet", "1");
  applyName();
  $("namescreen").classList.add("hidden");
  if (settings.music !== "off" && !musicOn) startMusic();   // kick off the happy background tune
  speak(t("hi_let_play"));
  proceedAfterName();   // first run: difficulty → buddy → hub
}
$("nameStart").onclick = commitName;
$("nameSkip").onclick = () => {
  NAME = $("nameInput").value.trim().slice(0, 12) || "Explorer";
  localStorage.setItem("fionaName", NAME); localStorage.setItem("fionaNameSet", "1");
  applyName(); $("namescreen").classList.add("hidden");
  if (settings.music !== "off" && !musicOn) startMusic();
  proceedAfterName();
};
document.querySelectorAll("#diffGrid .diff-btn").forEach(b => b.onclick = () => {
  settings.diff = b.dataset.d; saveSettings();
  localStorage.setItem("fionaDiffSet", "1");
  sfx.good(); $("diffscreen").classList.add("hidden");
  if (!localStorage.getItem("fionaBuddySet")) showCharScreen("hub"); else showHub();
});
$("nameInput").addEventListener("keydown", e => { if (e.key === "Enter") commitName(); });

document.documentElement.lang = (settings.lang === "es") ? "es" : "en";
applyName();
if (!localStorage.getItem("fionaNameSet")) showNameScreen("");
else showHub();

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}