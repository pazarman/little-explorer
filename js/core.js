"use strict";
let NAME = localStorage.getItem("fionaName") || "Explorer";

const $ = id => document.getElementById(id);
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => arr.slice().sort(() => Math.random() - .5);
const randBetween = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const IRREGULAR = { snowman: "snowmen", reindeer: "reindeer" };
function plural(noun, n) {
  if (n === 1) return noun;
  if (IRREGULAR[noun]) return IRREGULAR[noun];
  if (/[^aeiou]y$/.test(noun)) return noun.slice(0, -1) + "ies";
  return noun + "s";
}

/* ================= Lifecycle & Persistence Registry ================= */
const core = {
  timers: new Set(),
  intervals: new Set(),
  pendingSaves: new Map(),
  saveTimer: null,
  
  // Register and return a timeout
  wait(fn, ms) {
    const id = setTimeout(() => { this.timers.delete(id); fn(); }, ms);
    this.timers.add(id);
    return id;
  },
  
  // Register and return an interval
  repeat(fn, ms) {
    const id = setInterval(fn, ms);
    this.intervals.add(id);
    return id;
  },
  
  // Clear all registered timers/intervals
  cleanup() {
    this.timers.forEach(clearTimeout);
    this.intervals.forEach(clearInterval);
    this.timers.clear();
    this.intervals.clear();
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    state.busy = false; // Safety reset for stuck busy states
  },
  
  // Throttled persistence to avoid localStorage jank
  save(key, val) {
    this.pendingSaves.set(key, JSON.stringify(val));
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.pendingSaves.forEach((v, k) => localStorage.setItem(k, v));
      this.pendingSaves.clear();
      this.saveTimer = null;
    }, 2000); // 2s debounce: perfect for "quiet" moments
  },
  
  // Force immediate save (e.g. before page unload)
  flush() {
    if (!this.saveTimer) return;
    this.pendingSaves.forEach((v, k) => localStorage.setItem(k, v));
    this.pendingSaves.clear();
    clearTimeout(this.saveTimer);
    this.saveTimer = null;
  }
};
window.addEventListener("beforeunload", () => core.flush());

/* ================= Persistent state ================= */
const completions = JSON.parse(localStorage.getItem("fionaStars") || "{}");
const stickers = JSON.parse(localStorage.getItem("fionaStickers") || "[]");
let settings = Object.assign({ lang: "en", diff: "auto", voice: 1, music: "bouncy" },
  JSON.parse(localStorage.getItem("fionaSettings") || "{}"));
const perf = JSON.parse(localStorage.getItem("fionaPerf") || "{}");
const saveCompletions = () => core.save("fionaStars", completions);
const saveStickers = () => core.save("fionaStickers", stickers);
const saveSettings = () => core.save("fionaSettings", settings);
const savePerf = () => core.save("fionaPerf", perf);

/* ================= Localization ================= */
const DICT = {
  en: {
    num: ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"],
    praise: ["Great job, {n}!", "Wonderful!", "Amazing!", "Hooray!", "You did it, {n}!", "Super!", "Fantastic!", "Woohoo!"],
    blastoff: "Blast off!",
    well_done: "You did it, {n}!",
    hi_let_play: "Hi {n}! Let's play!",
    hi_star_sparks: "Hi {n}! Let's find shiny Star Sparks to fix the rocket ship! Tap a world to play!",
    narrator_back: "Welcome back, {n}! 🌈",
    narrator_ready: "Where to today, {n}? 🗺️",
    narrator_postgame: "Amazing! What's next, {n}? ⭐",
    narrator_cat_num: "Let's count! 🔢",
    narrator_cat_shape: "Colors and shapes! 🎨",
    narrator_cat_brain: "Brain power time! 🧩",
    narrator_cat_animal: "Animal friends! 🐾",
    narrator_cat_pets: "Pets need us! 🐶",
    narrator_cat_space: "3, 2, 1... Blast off! 🚀",
    narrator_cat_fantasy: "Into make-believe! 🐉",
    narrator_cat_create: "Let's create! ✨",
    quest_fixed: "The rocket is all fixed! Get ready to blast off!",
    quest_fixed_praise: "Hooray {n}! You found the last Star Spark! The rocket is all fixed! Let's blast off!",
    quest_collect: "Hooray! You earned a Star Spark, {n}! {left} more to fix the rocket!",
    quest_status: "We're collecting Star Sparks to fix the rocket! {left} more to go. Tap a world to play!",
    quest_ready: "The rocket is fixed! Tap it to blast off!",
    settings_lang: "Language",
    settings_voice: "Talking voice",
    settings_music: "Music",
    settings_diff: "Difficulty",
    settings_buddy: "🧸 Buddy",
    settings_name: "✏️ Name",
    settings_progress: "📊 Progress",
    settings_reset: "Reset stars",
    settings_restart: "🔄 Start over",
    settings_restart_confirm: "This will erase all of {n}'s stars, stickers, and progress. Are you sure?",
    settings_done: "Done",
    back: "Back",
    next: "Next",
    home: "Home",
    clear: "Clear",
    done: "Done",
    big: "Big!",
    small: "Small!",
    try_again: "Try again!",
    look_at_pattern: "Look at the pattern!",
    yes_it: "Yes! {animal} says {sound}!",
    found_it: "Yes! You found {item}!",
    all_sorted: "All sorted!",
    found_all: "You found them all!",
    match: "A match! Two {item}!",
    beautiful_music: "Beautiful music!",
    traced_it: "You traced it!",
    yummy: "Yummy!",
    fed_all: "{count} {item}! Yum yum!",
    hatched_all: "{count} baby {item}!",
    icecream_finish: "A yummy {count}-scoop ice cream!",
    pet_clean: "All clean!",
    pet_yum: "Yum yum!",
    pet_whee: "Wheee!",
    pet_happy: "{animal} is so happy!",
    pet_sad: "{animal} looks sad 😢 Let's help them feel better!",
    pet_feels_clean: "Yay! {animal} feels so fresh and clean! 🫧",
    pet_feels_fed: "Yum! {animal} is not hungry anymore! 😋",
    pet_feels_played: "Wheee! {animal} feels so happy playing! 🎾",
    pet_feels_cuddled: "Aww! {animal} feels loved! 💞",
    pet_kind: "{animal} is so happy now! 💖 You were so kind!",
    settings_title: "⚙️ Grown-up Settings",
    lang_en: "English", lang_es: "Español",
    diff_auto: "Auto ⬆️", diff_easy: "Easy", diff_med: "Medium", diff_hard: "Hard",
    diff_title: "Grown-ups: pick a level!", diff_say: "Grown-ups, pick a level for your little one!",
    diff_easy_age: "Ages 2-3", diff_med_age: "Ages 3-4", diff_hard_age: "Ages 4-5",
    voice_on: "On", voice_off: "Off",
    music_bouncy: "Bouncy", music_calm: "Calm", music_march: "March", music_off: "Off",
    rocket_ready: "🚀 Rocket ready!",
    rocket_zoomed: "Amazing job {n}! The rocket zoomed to the stars! Let's find more Star Sparks!",
    tap_count: "Tap {count} {x}!",
    you_counted: "{num}! You counted {count}!",
    tap_fish: "Tap the {x} fish!",
    goodtry_fish: "Good try! Look for the {x} fish!",
    drag_pizza_show: "Drag {x} onto the pizza!",
    drag_pizza_say: "Find {x}, and drag it onto the pizza!",
    shape_fits: "Yummy! {x} fits!",
    thats_look: "That's {x}! Look for {y}!",
    put_pizza: "Put {count} {x} on the pizza!",
    placed_pizza: "{num}! {count} {x}!",
    drag_topping: "Drag the {color} topping onto the pizza!",
    color_excl: "{color}!",
    thats_find_one: "That's {color}! Find the {color2} one!",
    pop_balloon_show: "Pop balloon number {target}!",
    pop_balloon_say: "Pop the balloon with the number {target}!",
    thats_that_num: "{num}! That's {target}!",
    thats_find_num: "That's number {num}. Find number {target}!",
    put_base: "Put {count} {x} on {base}!",
    fed_count: "{num}! {count} {x}! Yummy!",
    new_shapes: "New shapes! Let's trace!",
    matching_show: "Find the matching pairs!",
    matching_say: "Find the matching {x}! Tap a card to flip it!",
    listen_show: "Listen to the animals!",
    listen_say: "Listen to the animal band!",
    yourturn_show: "Now you play! Press the glowing animals!",
    yourturn_say: "Your turn! Press the glowing animals!",
    who_show: "Who makes this sound?",
    who_say: "Listen! Who makes this sound?",
    countdown_show: "Count down! Tap {next}!",
    countdown_say: "Let's count down to blast off! Tap number {next}!",
    blastoff_screen: "🚀 BLAST OFF! 🌟",
    find_num: "Find number {next}!",
    sortsize_show: "Sort by size!",
    sortsize_say: "Drag the big ones to the big planet, and the small ones to the small planet!",
    that_big: "That one is big! Put it on the big planet!",
    that_small: "That one is small! Put it on the small planet!",
    sortcolor_show: "Sort by color!",
    sortkind_show: "Sort them out!",
    sorted_one: "{x}!",
    that_basket: "That one is {x}. Find the {x} basket!",
    goes_with: "That goes with {x}!",
    next_show: "What comes next?",
    next_say: "Look at the pattern! What comes next?",
    try_pattern: "Try again! Look at the pattern!",
    feed_dragon_show: "Feed the dragon {count} {x}!",
    eggs_show: "Tap {count} {x} to hatch the dinos!",
    eggs_say: "Tap {count} {x} to hatch the baby dinosaurs!",
    scoop_show: "Add a {x} scoop!",
    scoop_say: "Add a {x} scoop on top!",
    thats_find_scoop: "That's {color}! Find the {color2} scoop!",
    scoop_count: "{color}! {num} {x}!",
    cherry_show: "Tap the cherry on top!",
    cherry_say: "Now tap the cherry to finish your ice cream!",
    yummy_cherry: "Yummy! Now pop a cherry on top!",
    tap_pet: "Tap {x}!",
    yes_pet: "Yes! {x}!",
    lookfor_pet: "Look for {x}!",
    takecare_show: "Take care of {x}!",
    takecare_say: "Take care of {x}! Give it a bath, some food, and a toy!",
    takecare_sad: "{animal} looks sad 😢 Can you help them feel better?",
    give_pet_show: "Give {animal} {count} {x}!",
    count_x: "{count} {x}!",
    paint_intro: "Let's paint! Pick a color and draw with your finger, {n}!",
    paint_color_q: "Can you paint with {color}?",
    paint_stamp_q: "Can you put a {x} on your picture?",
    paint_outline_q: "Let's paint {x}!",
    paint_finish: "Beautiful painting!",
    paint_stamp_win: "Great! A {x}!",
    dash_title: "📊 Grown-up Progress",
    dash_stars: "Stars", dash_played: "Games played", dash_stickers: "Stickers",
    dash_tried: "Activities tried", dash_trips: "Rocket trips", dash_sparks: "Star Sparks",
    dressup_intro: "Let's dress up! Pick a part at the bottom to put it on, {n}!",
    cool_look: "What a cool look!",
    story_find: "Can you find the {x}? Tap it!",
    story_tap: "👆 Tap the picture!",
    story_end: "The end! Goodnight, {n}!",
    name_title: "Hi there! What's your name?", name_ph: "Type a name…",
    name_start: "Let's play! 🎉", name_skip: "Skip for now",
    char_title: "Pick your buddy!", char_done: "Let's go! 🎉",
    hub_title: "🌈 {n}'s World 🌈", book_title: "📒 {n}'s Sticker Book 📒",
    sticker_empty_hint: "Play games to earn stickers to decorate with!",
    sticker_empty_say: "Play games to earn stickers!",
    sticker_hint: "Tap a sticker, then tap the picture to place it! 🎨",
    sticker_intro: "Here is your sticker book, {n}! Tap a sticker, then tap the picture to place it!",
    sticker_belongs: "Perfect! The {x} belongs in the {scene}!",
    off_slot: "Off",
    theme_animals: "animals", theme_food: "food", theme_frozen: "frozen things", theme_ocean: "sea things",
    kind_animal: "the animals", kind_food: "the yummy food", kind_vehicle: "the things that go",
    celeb_done_sub: "⚡ You found the LAST Star Spark! The rocket is ready! 🚀",
    celeb_more_sub: "⚡ Star Spark collected! {left} more to fix the rocket 🚀",
    quest_onemore: "The rocket is all fixed! Play one more game to blast off!",
    trip_complete: "Trip #{trips} complete — you're a Star Explorer! {badge}",
    trace_number: "Trace the number {x}!", trace_letter: "Trace the letter {x}!", trace_shape: "Trace {x}!",
    follow_dots: "Follow the dots!",
    tap_next: "🚀 Tap {next}!", lbl_big: "BIG", lbl_small: "small",
    sortcolor_say: "Put each thing in the basket that matches its color!",
    sortkind_say: "Put each thing where it belongs!",
    tap_part: "Tap {part}!",
    yes_part: "Yes! {part}!",
    hideseek_show: "Put it {rel} the {spot}!",
    hideseek_say: "Put {buddy} {rel} the {spot}!",
    hideseek_retry: "Good try! Put it {rel} the {spot}!",
    hideseek_win: "Yes! {rel} the {spot}!",
    hideseek_next: "Now put it {rel} the {spot}!",
    hideseek_again: "Great! Now try a different spot!",
    cups_watch: "Watch the ball! Where does it go?",
    cups_find: "Where is the ball? Tap the cup!",
    cups_nope: "Not there! Peek under another cup!",
    cups_retry: "Keep looking! Find the ball!",
    cups_win: "You found it! 🎉",
    rel_in: "in", rel_on: "on", rel_under: "under",
    basket: { es: "canasta", g: "f" },
    box: { es: "caja", g: "f" },
    table: { es: "mesa", g: "f" }
  },
  es: {
    num: ["", "Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez"],
    praise: ["¡Buen trabajo, {n}!", "¡Maravilloso!", "¡Increíble!", "¡Hurra!", "¡Lo hiciste, {n}!", "¡Súper!", "¡Fantástico!", "¡Bravo!"],
    blastoff: "¡Despegue!",
    well_done: "¡Lo hiciste, {n}!",
    hi_let_play: "¡Hola {n}! ¡Vamos a jugar!",
    hi_star_sparks: "¡Hola {n}! ¡Busquemos Chispas de Estrella para arreglar el cohete! ¡Toca un mundo!",
    narrator_back: "¡Bienvenido de nuevo, {n}! 🌈",
    narrator_ready: "¿A dónde hoy, {n}? 🗺️",
    narrator_postgame: "¡Genial! ¿Qué sigue, {n}? ⭐",
    narrator_cat_num: "¡A contar! 🔢",
    narrator_cat_shape: "¡Colores y figuras! 🎨",
    narrator_cat_brain: "¡A pensar! 🧩",
    narrator_cat_animal: "¡Amigos animales! 🐾",
    narrator_cat_pets: "¡Las mascotas nos necesitan! 🐶",
    narrator_cat_space: "¡3, 2, 1... Despegue! 🚀",
    narrator_cat_fantasy: "¡Al mundo de fantasía! 🐉",
    narrator_cat_create: "¡Vamos a crear! ✨",
    quest_fixed: "¡El cohete está arreglado! ¡Prepárate para el despegue!",
    quest_fixed_praise: "¡Hurra {n}! ¡Encontraste la última Chispa de Estrella! ¡El cohete está listo!",
    quest_collect: "¡Hurra! ¡Ganaste una Chispa de Estrella, {n}! ¡Faltan {left} para arreglarlo!",
    quest_status: "¡Estamos juntando Chispas de Estrella! Faltan {left}. ¡Toca un mundo!",
    quest_ready: "¡El cohete está listo! ¡Tócalo para despegar!",
    settings_lang: "Idioma",
    settings_voice: "Voz",
    settings_music: "Música",
    settings_diff: "Dificultad",
    settings_buddy: "🧸 Amigo",
    settings_name: "✏️ Nombre",
    settings_progress: "📊 Progreso",
    settings_reset: "Reiniciar",
    settings_restart: "🔄 Empezar de nuevo",
    settings_restart_confirm: "Esto borrará todas las estrellas, pegatinas y progreso de {n}. ¿Estás seguro?",
    settings_done: "Listo",
    back: "Atrás",
    next: "Siguiente",
    home: "Inicio",
    clear: "Borrar",
    done: "Listo",
    big: "¡Grande!",
    small: "¡Pequeño!",
    try_again: "¡Inténtalo de nuevo!",
    look_at_pattern: "¡Mira el patrón!",
    yes_it: "¡Sí! ¡{animal} dice {sound}!",
    found_it: "¡Sí! ¡Encontraste {item}!",
    all_sorted: "¡Todo ordenado!",
    found_all: "¡Los encontraste todos!",
    match: "¡Pareja! ¡Dos {item}!",
    beautiful_music: "¡Música hermosa!",
    traced_it: "¡Lo trazaste!",
    yummy: "¡Qué rico!",
    fed_all: "¡{count} {item}! ¡Ñam ñam!",
    hatched_all: "¡{count} bebés {item}!",
    icecream_finish: "¡Un rico helado de {count} bolas!",
    pet_clean: "¡Muy limpio!",
    pet_yum: "¡Ñam ñam!",
    pet_whee: "¡Siiii!",
    pet_happy: "¡{animal} está muy feliz!",
    pet_sad: "{animal} se ve triste 😢 ¡Vamos a ayudarle a sentirse mejor!",
    pet_feels_clean: "¡Qué bien! ¡{animal} está muy limpio y fresco! 🫧",
    pet_feels_fed: "¡Ñam! ¡{animal} ya no tiene hambre! 😋",
    pet_feels_played: "¡Siiii! ¡{animal} está muy contento jugando! 🎾",
    pet_feels_cuddled: "¡Ahhh! ¡{animal} se siente querido! 💞",
    pet_kind: "¡{animal} está muy feliz ahora! 💖 ¡Fuiste muy amable!",
    settings_title: "⚙️ Ajustes para adultos",
    lang_en: "English", lang_es: "Español",
    diff_auto: "Auto ⬆️", diff_easy: "Fácil", diff_med: "Medio", diff_hard: "Difícil",
    diff_title: "Adultos: ¡elijan un nivel!", diff_say: "Adultos, elijan un nivel para su pequeño.",
    diff_easy_age: "2-3 años", diff_med_age: "3-4 años", diff_hard_age: "4-5 años",
    voice_on: "Sí", voice_off: "No",
    music_bouncy: "Alegre", music_calm: "Tranquila", music_march: "Marcha", music_off: "No",
    rocket_ready: "🚀 ¡Cohete listo!",
    rocket_zoomed: "¡Increíble {n}! ¡El cohete voló hasta las estrellas! ¡Busquemos más Chispas de Estrella!",
    tap_count: "¡Toca {count} {x}!",
    you_counted: "¡{num}! ¡Contaste {count}!",
    tap_fish: "¡Toca el pez {x}!",
    goodtry_fish: "¡Buen intento! ¡Busca el pez {x}!",
    drag_pizza_show: "¡Arrastra {x} a la pizza!",
    drag_pizza_say: "¡Encuentra {x} y arrástralo a la pizza!",
    shape_fits: "¡Qué rico! ¡{x} encaja!",
    thats_look: "¡Ese es {x}! ¡Busca {y}!",
    put_pizza: "¡Pon {count} {x} en la pizza!",
    placed_pizza: "¡{num}! ¡{count} {x}!",
    drag_topping: "¡Arrastra el ingrediente {color} a la pizza!",
    color_excl: "¡{color}!",
    thats_find_one: "¡Eso es {color}! ¡Busca el {color2}!",
    pop_balloon_show: "¡Explota el globo número {target}!",
    pop_balloon_say: "¡Explota el globo con el número {target}!",
    thats_that_num: "¡{num}! ¡Es el {target}!",
    thats_find_num: "Ese es el número {num}. ¡Busca el número {target}!",
    put_base: "¡Pon {count} {x} en {base}!",
    fed_count: "¡{num}! ¡{count} {x}! ¡Qué rico!",
    new_shapes: "¡Nuevas figuras! ¡A trazar!",
    matching_show: "¡Encuentra las parejas!",
    matching_say: "¡Encuentra {x} iguales! ¡Toca una carta para voltearla!",
    listen_show: "¡Escucha a los animales!",
    listen_say: "¡Escucha a la banda de animales!",
    yourturn_show: "¡Ahora tú! ¡Presiona los animales que brillan!",
    yourturn_say: "¡Tu turno! ¡Presiona los animales que brillan!",
    who_show: "¿Quién hace este sonido?",
    who_say: "¡Escucha! ¿Quién hace este sonido?",
    countdown_show: "¡Cuenta regresiva! ¡Toca {next}!",
    countdown_say: "¡Contemos para el despegue! ¡Toca el número {next}!",
    blastoff_screen: "🚀 ¡DESPEGUE! 🌟",
    find_num: "¡Busca el número {next}!",
    sortsize_show: "¡Ordena por tamaño!",
    sortsize_say: "¡Arrastra los grandes al planeta grande y los pequeños al planeta pequeño!",
    that_big: "¡Ese es grande! ¡Ponlo en el planeta grande!",
    that_small: "¡Ese es pequeño! ¡Ponlo en el planeta pequeño!",
    sortcolor_show: "¡Ordena por color!",
    sortkind_show: "¡A ordenar!",
    sorted_one: "¡{x}!",
    that_basket: "Eso es {x}. ¡Busca la canasta {y}!",
    goes_with: "¡Eso va con {x}!",
    next_show: "¿Qué sigue?",
    next_say: "¡Mira el patrón! ¿Qué sigue?",
    try_pattern: "¡Inténtalo otra vez! ¡Mira el patrón!",
    feed_dragon_show: "¡Dale {count} {x} al dragón!",
    eggs_show: "¡Toca {count} {x} para abrir los dinos!",
    eggs_say: "¡Toca {count} {x} para abrir los bebés dinosaurios!",
    scoop_show: "¡Agrega una bola {x}!",
    scoop_say: "¡Agrega una bola {x} encima!",
    thats_find_scoop: "¡Eso es {color}! ¡Busca la bola {color2}!",
    scoop_count: "¡{color}! ¡{num} {x}!",
    cherry_show: "¡Toca la cereza de arriba!",
    cherry_say: "¡Ahora toca la cereza para terminar tu helado!",
    yummy_cherry: "¡Qué rico! ¡Ahora pon una cereza arriba!",
    tap_pet: "¡Toca {x}!",
    yes_pet: "¡Sí! ¡{x}!",
    lookfor_pet: "¡Busca {x}!",
    takecare_show: "¡Cuida {x}!",
    takecare_say: "¡Cuida {x}! ¡Dale un baño, comida y un juguete!",
    takecare_sad: "{animal} se ve triste 😢 ¿Puedes ayudarle a sentirse mejor?",
    give_pet_show: "¡Dale {count} {x} para {animal}!",
    count_x: "¡{count} {x}!",
    paint_intro: "¡A pintar! Elige un color y dibuja con tu dedo, {n}!",
    paint_color_q: "¿Puedes pintar con {color}?",
    paint_stamp_q: "¿Puedes poner un {x} en tu dibujo?",
    paint_outline_q: "¡Vamos a pintar {x}!",
    paint_finish: "¡Qué bonito dibujo!",
    paint_stamp_win: "¡Genial! ¡Un {x}!",
    dash_title: "📊 Progreso para adultos",
    dash_stars: "Estrellas", dash_played: "Juegos jugados", dash_stickers: "Calcomanías",
    dash_tried: "Actividades probadas", dash_trips: "Viajes en cohete", dash_sparks: "Chispas de Estrella",
    dressup_intro: "¡A vestirse! Elige una parte abajo para ponerla, {n}!",
    cool_look: "¡Qué estilo tan genial!",
    story_find: "¿Puedes encontrar {x}? ¡Tócalo!",
    story_tap: "👆 ¡Toca el dibujo!",
    story_end: "¡Fin! ¡Buenas noches, {n}!",
    name_title: "¡Hola! ¿Cómo te llamas?", name_ph: "Escribe un nombre…",
    name_start: "¡A jugar! 🎉", name_skip: "Ahora no",
    char_title: "¡Elige tu amigo!", char_done: "¡Vamos! 🎉",
    hub_title: "🌈 El Mundo de {n} 🌈", book_title: "📒 Álbum de {n} 📒",
    sticker_empty_hint: "¡Juega para ganar calcomanías para decorar!",
    sticker_empty_say: "¡Juega para ganar calcomanías!",
    sticker_hint: "¡Toca una calcomanía y luego toca el dibujo para colocarla! 🎨",
    sticker_intro: "¡Aquí está tu álbum de calcomanías, {n}! ¡Toca una calcomanía y luego el dibujo para colocarla!",
    sticker_belongs: "¡Perfecto! ¡{x} va en {scene}!",
    off_slot: "Quitar",
    theme_animals: "los animales", theme_food: "las comidas", theme_frozen: "las cosas heladas", theme_ocean: "las cosas del mar",
    kind_animal: "los animales", kind_food: "la comida rica", kind_vehicle: "las cosas que ruedan",
    celeb_done_sub: "⚡ ¡Encontraste la ÚLTIMA Chispa de Estrella! ¡El cohete está listo! 🚀",
    celeb_more_sub: "⚡ ¡Chispa de Estrella! Faltan {left} para arreglar el cohete 🚀",
    quest_onemore: "¡El cohete está arreglado! ¡Juega un juego más para despegar!",
    trip_complete: "¡Viaje #{trips} completo — eres Explorador de Estrellas! {badge}",
    trace_number: "¡Traza el número {x}!", trace_letter: "¡Traza la letra {x}!", trace_shape: "¡Traza {x}!",
    follow_dots: "¡Sigue los puntos!",
    tap_next: "🚀 ¡Toca {next}!", lbl_big: "GRANDE", lbl_small: "pequeño",
    sortcolor_say: "¡Pon cada cosa en la canasta de su color!",
    sortkind_say: "¡Pon cada cosa donde va!",
    tap_part: "¡Toca {part}!",
    yes_part: "¡Sí! ¡{part}!",
    hideseek_show: "¡Ponlo {rel} {spot}!",
    hideseek_say: "¡Pon {buddy} {rel} {spot}!",
    hideseek_retry: "¡Buen intento! ¡Ponlo {rel} {spot}!",
    hideseek_win: "¡Sí! ¡{rel} {spot}!",
    hideseek_next: "¡Ahora ponlo {rel} {spot}!",
    hideseek_again: "¡Muy bien! ¡Ahora prueba un lugar diferente!",
    cups_watch: "¡Mira la pelota! ¿A dónde va?",
    cups_find: "¿Dónde está la pelota? ¡Toca el vaso!",
    cups_nope: "¡Ahí no! ¡Mira debajo de otro vaso!",
    cups_retry: "¡Sigue buscando! ¡Encuentra la pelota!",
    cups_win: "¡La encontraste! 🎉",
    rel_in: "dentro de", rel_on: "encima de", rel_under: "debajo de"
  }
};

function t(key, params = {}) {
  const lang = settings.lang || "en";
  let str = DICT[lang][key] || DICT["en"][key] || key;
  if (Array.isArray(str)) str = rand(str);
  params.n = NAME;
  for (const k in params) str = str.split(`{${k}}`).join(params[k]);
  return str;
}
const praise = () => t("praise");

/* ===== Content vocabulary (gendered nouns) for grammar-correct Spanish =====
   key = the English token already used in game data. es = Spanish noun, g = gender
   (m/f) for article + adjective agreement, espl = irregular/multiword Spanish plural. */
const VOC = {
  // shapes
  circle:{es:"círculo",g:"m"}, square:{es:"cuadrado",g:"m"}, triangle:{es:"triángulo",g:"m"},
  star:{es:"estrella",g:"f"}, heart:{es:"corazón",g:"m"}, oval:{es:"óvalo",g:"m"}, diamond:{es:"diamante",g:"m"},
  // animals (Who Says / band / pets)
  dog:{es:"perro",g:"m"}, cat:{es:"gato",g:"m"}, cow:{es:"vaca",g:"f"}, frog:{es:"rana",g:"f"},
  duck:{es:"pato",g:"m"}, sheep:{es:"oveja",g:"f"}, bird:{es:"pájaro",g:"m"}, lion:{es:"león",g:"m"},
  pig:{es:"cerdo",g:"m"}, horse:{es:"caballo",g:"m"},
  puppy:{es:"perrito",g:"m"}, kitten:{es:"gatito",g:"m"}, kitty:{es:"gatito",g:"m"}, bunny:{es:"conejito",g:"m"},
  hamster:{es:"hámster",g:"m"}, birdie:{es:"pajarito",g:"m"}, fishy:{es:"pececito",g:"m"}, pony:{es:"poni",g:"m"},
  butterfly:{es:"mariposa",g:"f"}, penguin:{es:"pingüino",g:"m"},
  // snow critters
  snowflake:{es:"copo de nieve",g:"m",espl:"copos de nieve"}, snowman:{es:"muñeco de nieve",g:"m",espl:"muñecos de nieve"},
  mitten:{es:"mitón",g:"m"}, reindeer:{es:"reno",g:"m"}, present:{es:"regalo",g:"m"},
  // pasta / food nouns
  meatball:{es:"albóndiga",g:"f"}, cookie:{es:"galleta",g:"f"}, blueberry:{es:"arándano",g:"m"},
  cherry:{es:"cereza",g:"f"}, strawberry:{es:"fresa",g:"f"}, grape:{es:"uva",g:"f"}, carrot:{es:"zanahoria",g:"f"},
  donut:{es:"dona",g:"f"}, egg:{es:"huevo",g:"m"}, banana:{es:"plátano",g:"m"}, cupcake:{es:"pastelito",g:"m"},
  pizza:{es:"pizza",g:"f"}, "ice cream":{es:"helado",g:"m"},
  // food bases
  spaghetti:{es:"espagueti",g:"m"}, plate:{es:"plato",g:"m"}, pancake:{es:"panqueque",g:"m"}, cake:{es:"pastel",g:"m"},
  // pizza toppings
  mushroom:{es:"champiñón",g:"m"}, olive:{es:"aceituna",g:"f"}, pepper:{es:"pimiento",g:"m"},
  // ocean / frozen memory items
  fish:{es:"pez",g:"m"}, dolphin:{es:"delfín",g:"m"}, shell:{es:"concha",g:"f"}, wave:{es:"ola",g:"f"},
  starfish:{es:"estrella de mar",g:"f",espl:"estrellas de mar"}, crab:{es:"cangrejo",g:"m"},
  octopus:{es:"pulpo",g:"m"}, turtle:{es:"tortuga",g:"f"},
  crown:{es:"corona",g:"f"}, castle:{es:"castillo",g:"m"}, sparkle:{es:"destello",g:"m"}, skate:{es:"patín",g:"m"},
  // body parts
  head:{es:"cabeza",g:"f"}, hand:{es:"mano",g:"f"}, foot:{es:"pie",g:"m"},
  eye:{es:"ojo",g:"m"}, nose:{es:"nariz",g:"f"}, mouth:{es:"boca",g:"f"},
  ear:{es:"oreja",g:"f"}, tummy:{es:"panza",g:"f"}, knee:{es:"rodilla",g:"f"},
  elbow:{es:"codo",g:"m"}, shoulder:{es:"hombro",g:"m"}, hair:{es:"pelo",g:"m"},
  arm:{es:"brazo",g:"m"}, leg:{es:"pierna",g:"f"}, finger:{es:"dedo",g:"m"},
  toe:{es:"dedo del pie",g:"m"}, teeth:{es:"dientes",g:"m"}, neck:{es:"cuello",g:"m"},
  tongue:{es:"lengua",g:"f"}, chin:{es:"barbilla",g:"f"}, cheek:{es:"mejilla",g:"f"},
  // misc
  treat:{es:"premio",g:"m"}, scoop:{es:"bola",g:"f"}, flower:{es:"flor",g:"f"}, dino:{es:"dino",g:"m"},
  // buddies (used in hide & seek "put {buddy} …")
  snowman:{es:"muñeco de nieve",g:"m"}, princess:{es:"princesa",g:"f"}, unicorn:{es:"unicornio",g:"m"},
  robot:{es:"robot",g:"m"}, bear:{es:"oso",g:"m"}, dragon:{es:"dragón",g:"m"}
};
const COLOR_ES = { red:"rojo", blue:"azul", yellow:"amarillo", green:"verde", orange:"naranja",
  purple:"morado", pink:"rosa", brown:"marrón", gray:"gris", black:"negro", white:"blanco" };
const curLang = () => settings.lang || "en";
function esPlural(w) {
  if (/[aeiouáéíóú]$/i.test(w)) return w + "s";
  if (/z$/i.test(w)) return w.slice(0, -1) + "ces";
  return w.replace(/ón$/, "on").replace(/ín$/, "in").replace(/én$/, "en") + "es";
}
const numWord = n => ((DICT[curLang()] && DICT[curLang()].num) || DICT.en.num)[n] || "";
function word(key) { const v = VOC[key]; return (curLang() === "es" && v) ? v.es : key; }      // bare singular
function words(key, n) {                                                                          // count-agreeing plural
  const v = VOC[key];
  if (curLang() === "es") return !v ? key : (n === 1 ? v.es : (v.espl || esPlural(v.es)));
  return (v && v.enpl && n !== 1) ? v.enpl : plural(key, n);
}
const genderOf = key => (VOC[key] ? VOC[key].g : "m");
function theWord(key) { return curLang() === "es" ? (genderOf(key) === "f" ? "la " : "el ") + word(key) : "the " + key; }
function aWord(key)   { return curLang() === "es" ? (genderOf(key) === "f" ? "una " : "un ") + word(key) : "a " + key; }
const locName = o => (curLang() === "es" && o && o.es) ? o.es : (o ? o.name : "");                // localized data-object name
function applyI18n(root = document) {                                                             // translate static [data-i18n] markup
  root.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  root.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
}
function colorName(key) { return curLang() === "es" ? (COLOR_ES[key] || key) : key; }            // standalone color
function colorAdj(key, g) {                                                                       // color agreeing with a noun's gender
  if (curLang() !== "es") return key;
  let c = COLOR_ES[key] || key;
  if (g === "f" && c.endsWith("o")) c = c.slice(0, -1) + "a";
  return c;
}

/* ===== Centralized quest ===== */
const QUEST_GOAL = 6;
let sparks = +(localStorage.getItem("fionaSparks") || 0);
let trips  = +(localStorage.getItem("fionaTrips")  || 0);
let questShown = sparks, questGreeted = false;
const saveQuest = () => { core.save("fionaSparks", sparks); core.save("fionaTrips", trips); };

/* difficulty tier 0..2 for a level */
function ensurePerf(level) {
  if (!perf[level]) perf[level] = { roundsPlayed: 0, roundsNoMistake: 0, roundsWithManyMistakes: 0, emaScore: 0.6 };
  return perf[level];
}
function roundScore(mistakes) {
  if (mistakes <= 0) return 1.0;
  if (mistakes === 1) return 0.75;
  if (mistakes === 2) return 0.5;
  return 0.2;
}
function recordRoundPerf(level, mistakes) {
  const p = ensurePerf(level);
  p.roundsPlayed++;
  if (mistakes === 0) p.roundsNoMistake++;
  if (mistakes >= 3) p.roundsWithManyMistakes++;
  const score = roundScore(mistakes);
  p.emaScore = clamp(p.emaScore * 0.7 + score * 0.3, 0, 1);
  savePerf();
}
function autoTierFor(level) {
  const p = ensurePerf(level);
  // Early sessions: stay conservative and use completion progress gently.
  if (p.roundsPlayed < 4) return clamp(Math.floor((completions[level] || 0) / 2), 0, 1);
  if (p.emaScore >= 0.8) return 2;
  if (p.emaScore >= 0.55) return 1;
  return 0;
}
function tierFor(level) {
  if (settings.diff === "easy") return 0;
  if (settings.diff === "med") return 1;
  if (settings.diff === "hard") return 2;
  return autoTierFor(level);
}

const state = { level: null, round: 0, busy: false, tier: 0 };
let roundMistakes = 0;

/* ================= Mascot ================= */
function mascotSVG() {
  return `<svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg">
    <path d="M27 116 L8 98" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/>
    <path d="M14 104 L8 110" stroke="#8a5a2b" stroke-width="3.5" stroke-linecap="round"/>
    <g class="armR">
      <path d="M93 116 L112 96" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/>
      <path d="M104 104 L113 107" stroke="#8a5a2b" stroke-width="3.5" stroke-linecap="round"/>
    </g>
    <circle cx="60" cy="128" r="36" fill="#fff" stroke="#dbe9f2" stroke-width="2"/>
    <circle cx="60" cy="120" r="3.2" fill="#26323a"/>
    <circle cx="60" cy="136" r="3.2" fill="#26323a"/>
    <circle cx="60" cy="62" r="26" fill="#fff" stroke="#dbe9f2" stroke-width="2"/>
    <path d="M36 84 Q60 97 84 84 L84 93 Q60 106 36 93 Z" fill="#e63946"/>
    <rect x="66" y="92" width="12" height="22" rx="5" fill="#e63946"/>
    <path d="M38 46 Q60 22 82 46 L82 52 Q60 42 38 52 Z" fill="#2f6fde"/>
    <circle cx="60" cy="28" r="7" fill="#fff" stroke="#dbe9f2" stroke-width="1.5"/>
    <g class="eyes">
      <circle cx="51" cy="57" r="3.4" fill="#26323a"/>
      <circle cx="69" cy="57" r="3.4" fill="#26323a"/>
    </g>
    <circle cx="45" cy="66" r="4" fill="#f8b3c0" opacity=".8"/>
    <circle cx="75" cy="66" r="4" fill="#f8b3c0" opacity=".8"/>
    <polygon points="60,61 60,68 82,65" fill="#f07f13"/>
    <path d="M50 74 Q60 81 70 74" stroke="#26323a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}
function setMascots(cls, on) { document.querySelectorAll(".mascot").forEach(m => m.classList.toggle(cls, on)); }

/* ================= Buddy (choosable guide character) ================= */
const BUDDIES = [
  { id: "snowman", e: "⛄", name: "Snowman" }, { id: "dino", e: "🦕", name: "Dino" },
  { id: "puppy", e: "🐶", name: "Puppy" },     { id: "kitty", e: "🐱", name: "Kitty" },
  { id: "princess", e: "👑", name: "Princess" }, { id: "unicorn", e: "🦄", name: "Unicorn" },
  { id: "robot", e: "🤖", name: "Robot" },     { id: "bear", e: "🧸", name: "Bear" },
  { id: "dragon", e: "🐉", name: "Dragon" }
];
let BUDDY = localStorage.getItem("fionaBuddy") || "snowman";
let charTimer = null;
function buddyMarkup() {
  if (BUDDY === "snowman") return mascotSVG();
  const b = BUDDIES.find(x => x.id === BUDDY) || BUDDIES[0];
  return `<span class="buddy">${b.e}</span>`;
}
function refreshBuddies() {
  ["hubMascot", "gameMascot", "celebMascot", "nameMascot"].forEach(id => { const el = $(id); if (el) el.innerHTML = buddyMarkup(); });
}

/* ================= Speech & sound ================= */
let lastSpeakEnd = 0;
function speak(text, opts = {}) {
  if (!settings.voice || !("speechSynthesis" in window)) { lastSpeakEnd = performance.now(); return; }
  if (!opts.queue) speechSynthesis.cancel();
  // Strip emoji before speaking — TTS reads them as "rainbow", "star", etc.
  const spoken = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").replace(/\s{2,}/g, " ").trim();
  lastSpeakEnd = performance.now() + Math.min(7000, 500 + spoken.length * 72);
  const u = new SpeechSynthesisUtterance(spoken + " ");  // trailing space: stops Chrome clipping the last word
  u.lang = settings.lang === "es" ? "es-MX" : "en-US";
  u.rate = opts.rate || 0.95;
  u.pitch = opts.pitch || 1.25;
  
  // Find a matching voice if possible (browser support varies)
  const voices = speechSynthesis.getVoices();
  const langTag = settings.lang === "es" ? "es" : "en";
  const v = voices.find(v => v.lang.startsWith(langTag) && (v.name.includes("Google") || v.localService));
  if (v) u.voice = v;

  setMascots("talking", true);
  
  const stopTalk = () => {
    if (!speechSynthesis.speaking && !speechSynthesis.pending) {
      setMascots("talking", false);
    }
  };
  u.onend = stopTalk; u.onerror = stopTalk;
  core.wait(() => setMascots("talking", false), Math.min(11000, 700 + text.length * 95));
  speechSynthesis.speak(u);
  // keep-alive: Chrome silently stops synthesis after ~15s unless nudged
  core.repeat(() => {
    if (speechSynthesis.speaking) speechSynthesis.resume();
  }, 4000);
}
// wait roughly as long as the praise takes to speak (capped) before running cb — so it's never cut off
function waitSpeech(cb, opts = {}) {
  const min = opts.min != null ? opts.min : 900, cap = opts.cap != null ? opts.cap : 4500;
  const wait = clamp(lastSpeakEnd - performance.now(), min, cap);
  core.wait(cb, wait);
}

let actx = null;
function audio() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === "suspended") actx.resume();
  return actx;
}
function tone(freq, start, dur, type = "sine", vol = 0.22) {
  const ctx = audio(), o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + dur);
}
// "Plump" voice — one filtered oscillator with a glide + soft attack/decay so taps
// sound round & organic instead of beepy. Pitch and lowpass cutoff both swoop.
function voice(o) {
  const ctx = audio(), t0 = ctx.currentTime + (o.start || 0), dur = o.dur;
  const osc = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  osc.type = o.type || "sine";
  osc.frequency.setValueAtTime(o.f0, t0);
  if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t0 + dur);
  f.type = "lowpass";
  f.frequency.setValueAtTime(o.cut || 2600, t0);
  if (o.cut1) f.frequency.exponentialRampToValueAtTime(o.cut1, t0 + dur);
  const v = o.vol == null ? 0.2 : o.vol, atk = o.atk || 0.012;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(v, t0 + atk);            // soft attack (no click)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);       // smooth decay
  osc.connect(f).connect(g).connect(ctx.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.03);
}
const sfx = {
  // soft organic bubble "pop" — body + a quieter sub-octave for roundness
  tap()  { voice({ type:"sine", f0:430, f1:760, dur:.13, cut:1700, cut1:3200, vol:.22, atk:.006 });
           voice({ type:"triangle", f0:215, f1:380, dur:.13, cut:1300, vol:.09, atk:.006 }); },
  tick() { voice({ type:"sine", f0:900, f1:1160, dur:.07, cut:3000, vol:.09 }); },
  // rich ascending magical chime: stacked sine+triangle, then a high sparkle
  good() { [523.25, 659.25, 784, 1046.5].forEach((fr, i) => {
             voice({ type:"sine", f0:fr, dur:.34, start:i*.085, cut:4200, vol:.16, atk:.01 });
             voice({ type:"triangle", f0:fr, dur:.30, start:i*.085, cut:2600, vol:.07 }); });
           voice({ type:"sine", f0:1568, f1:2093, dur:.5, start:.34, cut:6000, vol:.10 }); },
  // soft wooden-block "tock" for invalid taps — gentle, never harsh
  bad()  { voice({ type:"triangle", f0:300, f1:150, dur:.16, cut:1100, cut1:480, vol:.16, atk:.004 });
           voice({ type:"sine", f0:150, f1:90, dur:.16, cut:700, vol:.09, atk:.004 }); },
  win()  { [523.25, 659.25, 784, 1046.5, 1318.5].forEach((fr, i) => {
             voice({ type:"sine", f0:fr, dur:.42, start:i*.11, cut:5000, vol:.16, atk:.01 });
             voice({ type:"triangle", f0:fr, dur:.38, start:i*.11, cut:2800, vol:.07 }); });
           voice({ type:"sine", f0:2093, dur:.6, start:.58, cut:7000, vol:.10 }); }
};
const baseBad = sfx.bad;
sfx.bad = function (...args) {
  roundMistakes++;
  return baseBad.apply(this, args);
};

// selectable background music styles — each tune is [freq, beats]
const MUSIC = {
  bouncy: {
    beat: 300, wave: "triangle", bass: true, boing: true, tunes: [
      [[523, 1], [523, 1], [784, 1], [659, 1], [523, 1], [587, 1], [659, 2], [0, 1], [440, 1], [392, 1], [330, 1], [392, 2], [0, 1]],
      [[392, 1], [440, 1], [523, 1], [440, 1], [392, 1], [330, 1], [392, 2], [523, 1], [494, 1], [440, 1], [392, 2], [0, 1]],
      [[659, 1], [587, 1], [523, 1], [587, 1], [659, 1], [659, 2], [587, 1], [587, 1], [587, 2], [659, 1], [784, 1], [784, 2], [0, 1]]
    ]
  },
  calm: {
    beat: 540, wave: "sine", bass: false, boing: false, tunes: [
      [[392, 2], [440, 2], [523, 2], [440, 2], [349, 2], [392, 4], [0, 2]],
      [[523, 2], [494, 2], [440, 2], [392, 4], [440, 2], [392, 4], [0, 2]],
      [[330, 2], [392, 2], [440, 2], [392, 2], [330, 4], [294, 4], [0, 2]]
    ]
  },
  march: {
    beat: 250, wave: "square", bass: true, boing: false, tunes: [
      [[392, 1], [392, 1], [523, 1], [392, 1], [330, 1], [392, 1], [262, 2], [0, 1]],
      [[440, 1], [440, 1], [440, 1], [349, 1], [523, 1], [523, 2], [0, 1]],
      [[523, 1], [392, 1], [523, 1], [659, 1], [523, 1], [392, 1], [523, 2], [0, 1]]
    ]
  }
};
let musicOn = false, musicTimer = null;
function curStyle() { return MUSIC[settings.music] || MUSIC.bouncy; }
function playStep(tune, i, st) {
  if (!musicOn) return;
  const [f, b] = tune[i % tune.length];
  if (f > 0) {
    tone(f, 0, st.beat * b * 0.00085, st.wave, .06);
    if (st.bass && i % 2 === 0) tone(f / 2, 0, st.beat * b * 0.0006, "sine", .05);
  }
  const atEnd = i % tune.length === tune.length - 1;
  if (atEnd && st.boing && Math.random() < .35) tone(rand([180, 200, 240]), st.beat * b * 0.0004, .18, "sawtooth", .05);
  const nextTune = atEnd && Math.random() < .4 ? rand(st.tunes) : tune;
  musicTimer = core.wait(() => playStep(nextTune, i + 1, st), st.beat * b);
}
function startMusic() { audio(); musicOn = true; $("musicBtn").classList.add("on"); const st = curStyle(); playStep(rand(st.tunes), 0, st); }
function stopMusic() { musicOn = false; if (musicTimer) { clearTimeout(musicTimer); core.timers.delete(musicTimer); } $("musicBtn").classList.remove("on"); }
function toggleMusic() { if (musicOn) stopMusic(); else startMusic(); }

/* ================= Fireworks + floaters ================= */
let fxRaf = null;
function fireworks() {
  const c = $("fxC"), ctx = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const parts = [];
  const burst = (x, y) => {
    const hue = Math.random() * 360;
    for (let i = 0; i < 55; i++) {
      const a = Math.random() * Math.PI * 2, v = randBetween(1.5, 7);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
                   life: randBetween(45, 80), hue: hue + randBetween(-20, 20), r: randBetween(2, 4.5) });
    }
  };
  for (let i = 0; i < 4; i++)
    setTimeout(() => burst(randBetween(.2, .8) * c.width, randBetween(.15, .5) * c.height), i * 420);
  if (fxRaf) cancelAnimationFrame(fxRaf);
  const start = performance.now();
  const frame = () => {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of parts) {
      if (p.life <= 0) continue;
      p.x += p.vx; p.y += p.vy; p.vy += .07; p.vx *= .985; p.life--;
      ctx.globalAlpha = Math.min(1, p.life / 35);
      ctx.fillStyle = `hsl(${p.hue}, 95%, 62%)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (performance.now() - start < 3400) fxRaf = requestAnimationFrame(frame);
    else { ctx.clearRect(0, 0, c.width, c.height); fxRaf = null; }
  };
  fxRaf = requestAnimationFrame(frame);
}
function floaters(emojis, x, y, n = 8) {
  for (let i = 0; i < n; i++) {
    const f = document.createElement("div");
    f.className = "floater"; f.textContent = rand(emojis);
    f.style.left = (x + randBetween(-60, 60)) + "px";
    f.style.top = (y + randBetween(-20, 20)) + "px";
    f.style.animationDelay = (i * 0.05) + "s";
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1500);
  }
}

/* ===== Pointer sparkle trail — self-fading glitter behind fingers (paint + tracing) ===== */
const trail = {
  parts: [], raf: null, ctx: null, w: 0, h: 0,
  ensure() {
    const c = $("trailC");
    if (this.w !== innerWidth || this.h !== innerHeight) { this.w = c.width = innerWidth; this.h = c.height = innerHeight; this.ctx = c.getContext("2d"); }
    else if (!this.ctx) this.ctx = c.getContext("2d");
  },
  add(x, y, hue, n = 3) {
    this.ensure();
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = randBetween(.3, 2.1);
      this.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - .55,
        life: 1, decay: randBetween(.018, .04), r: randBetween(2.5, 6),
        hue: hue + randBetween(-18, 18), star: Math.random() < .45, spin: randBetween(-.22, .22), ang: Math.random() * 7 });
    }
    if (this.parts.length > 260) this.parts.splice(0, this.parts.length - 260);   // cap for low-end phones
    if (!this.raf) this.raf = requestAnimationFrame(() => this.frame());
  },
  frame() {
    const ctx = this.ctx; ctx.clearRect(0, 0, this.w, this.h);
    for (const p of this.parts) { p.x += p.vx; p.y += p.vy; p.vy += .04; p.vx *= .97; p.life -= p.decay; p.ang += p.spin; }
    this.parts = this.parts.filter(p => p.life > 0);
    for (const p of this.parts) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = `hsl(${p.hue}, 95%, 65%)`;
      if (p.star) {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ang); ctx.beginPath();
        for (let i = 0; i < 10; i++) { const rr = i % 2 ? p.r * .45 : p.r * 1.25, aa = i / 10 * Math.PI * 2, X = Math.cos(aa) * rr, Y = Math.sin(aa) * rr; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
        ctx.closePath(); ctx.fill(); ctx.restore();
      } else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (.6 + p.life * .6), 0, 7); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    if (this.parts.length) this.raf = requestAnimationFrame(() => this.frame());
    else { ctx.clearRect(0, 0, this.w, this.h); this.raf = null; }
  }
};

/* ================= Shared data ================= */
const fillName = s => s.replace(/\{n\}/g, NAME);
function applyName() {
  document.title = NAME + "'s World";
  const h1 = document.querySelector("#hub h1"); if (h1) h1.textContent = t("hub_title");
  const h2 = document.querySelector("#stickerbook h2"); if (h2) h2.textContent = t("book_title");
}
const COLORS = {
  red: "#e63946", blue: "#2f6fde", yellow: "#f4c726", green: "#3fa84f",
  purple: "#8e4fd0", orange: "#f07f13", pink: "#f06ba8",
  brown: "#8a5a2b", gray: "#8a96a3", black: "#2b2b2b", white: "#f4f6f9"
};
const COLOR_TIERS = [
  ["red", "blue", "yellow", "green", "orange", "purple"],          // tier 0: classics
  ["red", "blue", "yellow", "green", "orange", "purple", "pink", "brown"],
  ["red", "blue", "yellow", "green", "orange", "purple", "pink", "brown", "gray", "black", "white"]
];
const STICKER_POOL = ["🦄", "👑", "🦋", "🌈", "⛄", "🐬", "🌺", "🍦", "🎈", "🐠", "🍕", "💎", "🚲", "🌟", "🐧", "🦁", "🌸", "🍩",
  "🐉", "🦕", "🐶", "🐱", "🐰", "🦊", "🐻", "🐢", "🦩", "🐙", "🦜", "🌙", "⭐", "🍭", "🧁", "🎀", "🚀", "🪐", "🏰", "🦖", "🌷", "🍓"];

const ANIMALS = {
  dog:   { e: "🐶", sound: "Woof woof", es: "Guau guau", freq: 300 },
  cat:   { e: "🐱", sound: "Meow",      es: "Miau",      freq: 520 },
  cow:   { e: "🐮", sound: "Moo",       es: "Muu",       freq: 160 },
  frog:  { e: "🐸", sound: "Ribbit",    es: "Croac",     freq: 440 },
  duck:  { e: "🦆", sound: "Quack quack", es: "Cuac cuac", freq: 560 },
  sheep: { e: "🐑", sound: "Baa baa",   es: "Bee bee",   freq: 380 },
  bird:  { e: "🐦", sound: "Tweet tweet", es: "Pío pío", freq: 900 },
  lion:  { e: "🦁", sound: "Roar",      es: "Grr",       freq: 130 },
  pig:   { e: "🐷", sound: "Oink oink", es: "Oinc oinc", freq: 250 },
  horse: { e: "🐴", sound: "Neigh",     es: "Iiii",      freq: 320 }
};
const animalSound = key => curLang() === "es" ? ANIMALS[key].es : ANIMALS[key].sound;
function speakAnimal(key, opts = {}) {
  const a = ANIMALS[key];
  tone(a.freq, 0, .4, "sine", .16);
  speak(animalSound(key), { pitch: clamp(a.freq / 430, 0.6, 1.7), rate: 0.9, queue: opts.queue });
}

/* ================= Shared helpers ================= */
function setInstruction(text, spoken) {
  $("instruction").textContent = text;
  $("instruction").dataset.spoken = spoken || text;
  speak(spoken || text);
}
function totalRounds() { return LEVELS[state.level].rounds || 5; }
function drawProgress() {
  $("progress").innerHTML = Array.from({ length: totalRounds() },
    (_, i) => `<div class="dot ${i < state.round ? "done" : ""}"></div>`).join("");
}
function miniStar(x, y) {
  const s = document.createElement("div");
  s.className = "mini-star"; s.textContent = "⭐";
  s.style.left = (x - 20) + "px"; s.style.top = (y - 20) + "px";
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 900);
}
function confetti(n = 36) {
  const emojis = ["🎉", "⭐", "❄️", "🌺", "🍕", "💖", "🌈", "✨"];
  for (let i = 0; i < n; i++) {
    const c = document.createElement("div");
    c.className = "confetto"; c.textContent = rand(emojis);
    c.style.left = Math.random() * 100 + "vw";
    c.style.animationDuration = (2 + Math.random() * 2.5) + "s";
    c.style.animationDelay = Math.random() * .8 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 5500);
  }
}
function wiggle(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

function makeDraggable(el, onRelease) {
  el.style.touchAction = "none";
  el.addEventListener("pointerdown", e => {
    if (state.busy || el.classList.contains("on-plate")) return;
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    const r = el.getBoundingClientRect();
    const offX = e.clientX - r.left, offY = e.clientY - r.top;
    const startX = e.clientX, startY = e.clientY;
    const orig = { pos: el.style.position, left: el.style.left, top: el.style.top, z: el.style.zIndex };
    let moved = false;
    const move = ev => {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 7) moved = true;
      el.style.position = "fixed"; el.style.zIndex = 60;
      el.style.left = (ev.clientX - offX) + "px";
      el.style.top = (ev.clientY - offY) + "px";
    };
    const up = ev => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      onRelease(el, ev, {
        moved,
        reset() { el.style.position = orig.pos; el.style.left = orig.left; el.style.top = orig.top; el.style.zIndex = orig.z; }
      });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  });
}
const centerOf = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
const inside = (pt, el) => { const r = el.getBoundingClientRect(); return pt.x > r.left && pt.x < r.right && pt.y > r.top && pt.y < r.bottom; };

/* grid scatter (up to 12) so items never overlap */
function scatter(n) {
  const cols = 4, rows = 3;
  return shuffle([...Array(cols * rows).keys()]).slice(0, n).map(cell => {
    const c = cell % cols, r = Math.floor(cell / cols);
    return { left: (5 + c * 23 + Math.random() * 7) + "%", top: (6 + r * 30 + Math.random() * 7) + "%" };
  });
}

/* ================= Round / level flow ================= */
function cleanupLevel() { core.cleanup(); }
function roundComplete() {
  state.busy = true;
  const manyMistakes = roundMistakes >= 3;
  recordRoundPerf(state.level, roundMistakes);
  let nextTier = tierFor(state.level);
  if (settings.diff === "auto" && manyMistakes) nextTier = Math.max(0, nextTier - 1);
  roundMistakes = 0;
  sfx.good();
  waitSpeech(() => {                       // let the praise finish talking first
    state.round++;
    state.tier = nextTier;
    drawProgress();
    if (state.round >= totalRounds()) levelComplete();
    else { state.busy = false; LEVELS[state.level].startRound(); }
  });
}
function levelComplete() { core.cleanup(); celebrateWith(state.level); }
function celebrateWith(levelId, opts = {}) {
  completions[levelId] = (completions[levelId] || 0) + 1;
  saveCompletions();
  localStorage.setItem("fionaLastGame", levelId);
  const sticker = rand(STICKER_POOL);
  stickers.push({ e: sticker });           // position assigned by the sticker book's grid
  saveStickers();
  sparks = Math.min(QUEST_GOAL, sparks + 1); saveQuest();   // every win powers up the rocket
  const questDone = sparks >= QUEST_GOAL, left = QUEST_GOAL - sparks;
  sfx.win(); confetti(); fireworks();
  $("celebText").textContent = t("well_done");
  $("celebSticker").textContent = sticker;
  $("celebSub").textContent = questDone ? t("celeb_done_sub") : t("celeb_more_sub", { left });
  // when the rocket is full, swap the normal buttons for a big Blast off!
  $("celebLaunch").classList.toggle("hidden", !questDone);
  $("celebBook").classList.toggle("hidden", questDone);
  $("celebHome").classList.toggle("hidden", questDone);
  $("celebrate").classList.remove("hidden");
  speak(questDone ? t("quest_fixed_praise") : t("quest_collect", { left }));
}

/* ================= Rocket Quest ================= */
function renderQuest() {
  const slots = $("questSlots"); if (!slots) return;
  slots.innerHTML = "";
  for (let i = 0; i < QUEST_GOAL; i++) {
    const s = document.createElement("span");
    s.className = "q-slot" + (i < sparks ? " filled" : "");
    s.textContent = i < sparks ? "✨" : "";
    slots.appendChild(s);
  }
  // pop the slot(s) earned since we were last on the hub
  if (sparks > questShown) {
    for (let i = questShown; i < sparks; i++) { const el = slots.children[i]; if (el) el.classList.add("pop"); }
    miniStar(innerWidth / 2, innerHeight - 60);
  }
  questShown = sparks;
}
function questSpeak() {
  const left = QUEST_GOAL - sparks;
  speak(left <= 0 ? t("quest_onemore") : t("quest_status", { left }));
}
function questIntro() {
  speak(t("hi_star_sparks"));
}
function rocketLaunch() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  $("celebrate").classList.add("hidden");
  document.body.className = "theme-space";
  const ov = $("rocketLaunch"); ov.classList.remove("hidden");
  const rocket = $("rlRocket"), count = $("rlCount"), txt = $("rlText");
  rocket.className = "rl-rocket shake"; count.textContent = ""; txt.textContent = t("rocket_ready");
  speak(t("quest_fixed"));
  let n = 3;
  const tick = () => {
    if (n > 0) { count.textContent = n; speak(String(n)); tone(440, 0, .18, "triangle"); n--; setTimeout(tick, 900); }
    else {
      count.textContent = "🚀"; speak(t("blastoff"));
      rocket.className = "rl-rocket blast";
      sfx.win(); fireworks(); confetti(50);
      trips++; sparks = 0; saveQuest();                       // reset the journey for endless replay
      const badge = rand(["🏅", "🌟", "🚀", "👑", "🎖️"]); stickers.push({ e: badge }); saveStickers();
      txt.textContent = t("trip_complete", { trips, badge });
      setTimeout(() => {
        ov.classList.add("hidden");
        showHub();
        setTimeout(() => speak(t("rocket_zoomed")), 700);
      }, 3200);
    }
  };
  setTimeout(tick, 1100);
}
