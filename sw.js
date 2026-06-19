// Bump CACHE whenever you ship an update (forces old caches to clear).
const CACHE = "little-explorer-v20";
const ASSETS = [
  "./", "./index.html", "./manifest.json", "./icon.svg",
  "./css/style.css",
  "./js/core.js",
  "./js/hub.js",
  "./js/games/snow.js", "./js/games/ocean.js", "./js/games/pizza.js",
  "./js/games/bike.js", "./js/games/pasta.js", "./js/games/trace.js",
  "./js/games/memory.js", "./js/games/music.js", "./js/games/whosays.js",
  "./js/games/rocket.js", "./js/games/sort.js", "./js/games/dragon.js",
  "./js/games/dino.js", "./js/games/icecream.js", "./js/games/pets.js",
  "./js/games/paint.js", "./js/games/dressup.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first with timeout: always try freshest version but fallback quickly if slow.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  
  // Create a timeout promise to race against the fetch — reject so the catch() triggers cache fallback
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));
  
  e.respondWith(
    Promise.race([
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }),
      timeout // if timeout wins, the catch() below will trigger the cache fallback
    ])
    .catch(() => caches.match(e.request).then(hit => hit || caches.match("./index.html")))
  );
});
