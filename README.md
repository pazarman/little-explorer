# 🌈 Little Explorer's World

A colorful, voice-guided educational game for **2–5 year olds**. No reading required — every instruction is spoken aloud. Big tap targets, no fail states, no time pressure.

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
- **A world map you travel.** Six worlds sit as islands on a map, each in a fixed spot so a child finds
  them by place and colour rather than by reading. Inside a world is a winding road she scrolls along:
  her buddy stands on the game she last played, walks the road to whichever game she taps, and the camera
  follows. Nothing is ever locked.
- **38 mini-games across 6 worlds:**
  - 🔢 **Numbers** — Count, Numbers (numeral recognition), Yum Count, Countdown, Dragon Feed, Fuel Up, Feed Hippo
  - 🎨 **Colors & Shapes** — Ocean Colors, Pizza Kitchen, Magic Tracing, Ice Cream, Egg Catch
  - 🧩 **Brain Games** — Memory, Three Cups, Patterns, Big & Small, Sort It, Day & Night, Tall or Short,
    Plane Land, Feelings, Go Find It, Letter Lights, Five Senses
  - 🐾 **Animals** — Animal Band, Who Says?, Flash Count, Body Match, Dolphin Dive, Zoo Pop, Monkey Swing
  - 🐶 **Pets** — Pet Care, Find Pet, Same Treats, Hide & Seek
  - ✏️ **Create** — Paint Studio, Story Mode, Dress Up
- **STEM concepts:** counting & numerals, colors, shapes, size comparison, sorting/classification,
  patterns/sequencing, positional language, letter names, the senses, and emotion naming.
- **Auto-adjusting difficulty** that ramps as your child succeeds, plus a grown-up ⚙️ panel (Easy / Medium /
  Hard / Auto, voice on-off, music style, change name or buddy, progress peek, reset).
- **Three languages:** English, Spanish, and Cantonese (Cantonese falls back to English on devices with no
  Cantonese voice installed, so nothing is ever shown that cannot be read aloud).
- **Sticker rewards** with a drag-and-snap sticker book, a Star Spark rocket quest, **fireworks**, a bouncy
  soundtrack, and a choosable buddy who guides the journey.
- **Works offline** once installed.

## How It Works

- **No build step:** Pure HTML, CSS, and JavaScript — open it in any modern browser
- **No dependencies:** Plain `<script src>` tags, no bundler, no framework. All artwork is inline SVG or
  emoji and every sound is synthesised in the browser — there are no image or audio files to download
- **PWA magic:** Install as a standalone app with the Web App Manifest and Service Worker
- **Voice-first:** Web Speech API reads instructions aloud; children don't need to read
- **Local data only:** Child's name and progress stored in browser localStorage — never sent to any server
- **Responsive design:** Works on phones, tablets, and computers

## 📁 Files

| Path | Purpose |
|------|---------|
| `index.html` | Markup for every screen, and the script tags that load the rest |
| `css/style.css` | All styling and animation |
| `js/core.js` | Engine: translations, speech, sound synthesis, difficulty model, quest, persistence |
| `js/hub.js` | The world map, navigation, story mode, sticker book, settings |
| `js/worldtrail.js` | The scrollable road inside a world, and the buddy that walks it |
| `js/games/*.js` | One file per mini-game |
| `manifest.json` | PWA app metadata (name, icon, fullscreen) |
| `sw.js` | Service worker for offline support — bump `CACHE` when shipping |
| `icon.svg` | App icon for PWA |
| `tests/` | Playwright smoke tests (`npm test`) |
| `CLAUDE.md` | Developer context and contribution guide |
| `docs/` | Quality bar, curriculum map, and the backlogs |

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
- ✅ Dinosaurs — Flash Count (done)
- ✅ Pets world — feed, wash, match and hide-and-seek with the pets (done)
- ✅ Treat shop — Ice Cream, counting scoops & colors (done)
- ✅ Dress-up creative toy — mix & match outfits (done)
- ☀️🌧 Weather & 🍂 Seasons (match clothes to weather, sort the seasons)
- 👵👴 Grandparents / family world (name family members, video-call pretend)
- 💛 A dedicated Feelings & Me world for the social-emotional games

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
- ✅ World map hub with a road through each world (done)
- ✅ Grown-up progress peek — what they're playing & learning (done)
- 🌙 Calm/bedtime mode (softer sounds, dimmer colors)
- 👶 Extra-simple 2-year-old mode
- 🗺 A map that keeps a visible record of the journey as it is played

## 🔒 Privacy

The child's name is stored only in the browser's local storage on that device — it is never uploaded or shared anywhere. All progress (stars, stickers, settings) is local-only.

## 👩‍💻 For Developers

See [CLAUDE.md](CLAUDE.md) for:
- Project architecture and scene organization
- How to add new games and worlds (including tagging a new game so it flies a "New!" flag)
- Audio and personalization systems
- Testing and contribution guidelines

Quality is gated, not vibes-based: `docs/skills/01-product-quality-bar.md` is the rubric every game is
scored against, and `docs/skills/05-release-gate-skill.md` runs before anything ships.

## 📄 License

MIT — see [LICENSE](LICENSE).
