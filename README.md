# 🌈 Little Explorer's World

A colorful, voice-guided educational game for **2–4 year olds**. No reading required — every instruction is spoken aloud. Big tap targets, no fail states, no time pressure.

Runs entirely in the browser as a single static site (no build step, no dependencies) and installs to a phone/tablet home screen as an offline app (PWA).

## Quick Start

**👉 Open on any device:** Visit the [published link](./index.html) in a browser (desktop, tablet, or phone).

**📱 Install as app:** On a phone, tap your browser's **"Add to Home Screen"** to run full-screen and offline.

**💻 Run locally:**
```bash
# Python 3
python -m http.server 8765

# Or Node.js
npx http-server -p 8765

# Then open http://localhost:8765
```

## 📚 Table of Contents
- [Quick Start](#quick-start)
- [Features](#-features)
- [How It Works](#how-it-works)
- [Files](#-files)
- [Local Setup](#-run-it-locally)
- [Roadmap](#-roadmap)
- [Privacy](#-privacy)
- [License](#-license)

## ✨ Features

- **Enter your child's name** on first launch — the game greets them by name and stars them in the storybook (so it's easy to share with friends and cousins; each device sets its own name).
- **12 mini-games across 6 worlds:**
  - 🔢 **Numbers** — Count, Numbers (numeral recognition), Yum Count, Rocket Countdown
  - 🎨 **Colors & Shapes** — Ocean Colors, Pizza Kitchen, Magic Tracing
  - 🧩 **Brain Games** — Memory Match, Star Patterns, Big & Small
  - 🐾 **Animals** — Animal Band, Who Says That?
  - 🚀 **Space** — Rocket Countdown, Big & Small, Star Patterns
  - ✏️ **Create** — Paint Studio, Story Mode
- **STEM concepts:** counting & numerals, colors, shapes, size comparison, sorting/classification, and patterns/sequencing.
- **Auto-adjusting difficulty** that ramps as your child succeeds, plus a grown-up ⚙️ panel (Easy / Medium / Hard / Auto, voice on-off, change name, reset).
- **Sticker rewards** with a drag-and-snap sticker book, **fireworks**, a bouncy soundtrack, and a friendly animated snowman guide.
- **Works offline** once installed.

## How It Works

- **No build step:** Pure HTML, CSS, and JavaScript — open it in any modern browser
- **No dependencies:** Everything is self-contained in `index.html`
- **PWA magic:** Install as a standalone app with the Web App Manifest and Service Worker
- **Voice-first:** Web Speech API reads instructions aloud; children don't need to read
- **Local data only:** Child's name and progress stored in browser localStorage — never sent to any server
- **Responsive design:** Works on phones, tablets, and computers

## 📁 Files

| File | Purpose |
|------|---------|
| `index.html` | The entire game (HTML, CSS, JS, all artwork inline) |
| `manifest.json` | PWA app metadata (name, icon, fullscreen) |
| `sw.js` | Service worker for offline support |
| `icon.svg` | App icon for PWA |
| `CLAUDE.md` | Developer context and contribution guide |

## 🛠 Run it Locally

It's just static files — serve with any HTTP server:

```bash
# Python 3
python -m http.server 8765

# Node.js http-server
npx http-server -p 8765
```

Then open `http://localhost:8765` in your browser.

**Note:** Opening `index.html` directly with `file://` works, but the offline/PWA install features require `http://` or `https://`.

## 🗺 Roadmap

Ideas for future updates (contributions/suggestions welcome):

**New games & content kids love**
- 🦕 Dinosaurs world (counting eggs, big/small dinos, dino sounds)
- 🐶🐱 Pets world (feed the puppy, match cats & kittens)
- 🍦 Treat shop (build an ice-cream cone — counting scoops & colors)
- 👑 Princess & castle world (royal dress-up, shape crowns)
- 🦖 Dress-up / build-a-face creative toy (mix & match outfits)
- ☀️🌧 Weather & 🍂 Seasons (match clothes to weather, sort the seasons)
- 👵👴 Grandparents / family world (name family members, video-call pretend)

**Personalization**
- ✅ Choose your name (done)
- ✅ Choose your buddy character — snowman, dino, puppy, kitty, princess, unicorn, robot, bear, dragon (done)
- ✅ Selectable background music styles (done)
- 🎙 **Record your own voice** for instructions & praise (a parent records "Tap the red fish!" in their own voice — huge for pre-readers)
- 🔤 Trace your child's *actual* name (full A–Z letter set)

**Audio**
- ✅ Built-in synthesized music styles: Bouncy / Calm / March (done)
- 🎵 Optional richer recorded music tracks (royalty-free audio files)
- 🔊 Per-game sound themes

**Polish**
- 🌙 Calm/bedtime mode (softer sounds, dimmer colors)
- 👶 Extra-simple 2-year-old mode
- 📊 Grown-up progress peek (what they're playing & learning)

## 🔒 Privacy

The child's name is stored only in the browser's local storage on that device — it is never uploaded or shared anywhere. All progress (stars, stickers, settings) is local-only.

## 👩‍💻 For Developers

See [CLAUDE.md](CLAUDE.md) for:
- Project architecture and scene organization
- How to add new games and worlds
- Audio and personalization systems
- Testing and contribution guidelines

## 📄 License

MIT — see [LICENSE](LICENSE).
