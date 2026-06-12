# 🌈 Little Explorer's World

A colorful, voice-guided educational game for **2–4 year olds**. No reading required — every instruction is spoken aloud. Big tap targets, no fail states, no time pressure.

Runs entirely in the browser as a single static site (no build step, no dependencies) and installs to a phone/tablet home screen as an offline app (PWA).

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

## ▶️ Play it

Open the published link on a phone, tablet, or computer. On a phone, use your browser's **"Add to Home Screen"** to install it as a fullscreen app that works without internet.

## 🛠 Run it locally

It's just static files — serve the folder with anything, e.g.:

```bash
# Python 3
python -m http.server 8765
# then open http://localhost:8765
```

(Opening `index.html` directly with a `file://` URL also works, except the offline/install feature, which needs `http`/`https`.)

## 📁 Files

| File | Purpose |
|------|---------|
| `index.html` | The entire game (HTML, CSS, JS, all artwork inline) |
| `manifest.json` | PWA app metadata (name, icon, fullscreen) |
| `sw.js` | Service worker for offline support |
| `icon.svg` | App icon |

## 🔒 Privacy

The child's name is stored only in the browser's local storage on that device — it is never uploaded or shared anywhere. All progress (stars, stickers, settings) is local-only.

## 📄 License

MIT — see [LICENSE](LICENSE).
