# CLAUDE.md — Little Explorer's World

## Project Overview
**Little Explorer's World** is a colorful, voice-guided educational game for toddlers (2–5 years old). It's a **Progressive Web App (PWA)** that runs entirely in the browser as static files — no build process, no dependencies, no backend needed.

### Key Features
- 12 mini-games across 6 themed worlds (Numbers, Colors & Shapes, Brain Games, Animals, Space, Create)
- Voice-guided gameplay — every instruction is spoken aloud for pre-readers
- Child personalization — enter the child's name on first launch
- Offline-first — works as a standalone app installed to home screen
- Fully accessible — large tap targets, no fail states, no time pressure
- STEM learning — counting, numerals, colors, shapes, size, sorting, patterns

### Tech Stack
- **Platform:** Static HTML/CSS/JS — runs in any browser
- **PWA:** Service Worker (`sw.js`) for offline support
- **Manifest:** `manifest.json` for home screen installation
- **Data Storage:** Browser localStorage only (child's name, progress, settings)
- **No dependencies** — everything is inline in `index.html`
- **No build step** — serve with any HTTP server or open `file://` locally (except offline features need HTTP)

## File Structure
| File | Purpose |
|------|---------|
| `index.html` | Entire game: HTML, CSS, JS, SVG artwork — all inline |
| `manifest.json` | PWA metadata for home screen installation |
| `sw.js` | Service Worker for offline caching |
| `icon.svg` | App icon (used by PWA) |
| `README.md` | User-facing feature and roadmap docs |
| `CLAUDE.md` | Developer context (this file) |

## Local Development

### Run locally
```bash
# Python 3 (simple HTTP server)
python -m http.server 8765
# then open http://localhost:8765

# Or Node.js http-server
npx http-server -p 8765

# Or just open in browser (works but disables offline feature)
file:///path/to/fiona-game/index.html
```

**Note:** The offline/PWA install feature requires `http://` or `https://` — `file://` URLs bypass service workers.

### Test on phone/tablet
1. Deploy or serve locally
2. Open in phone browser
3. Tap "Add to Home Screen" (or ⋮ → Install app)
4. Tap the home screen icon to launch fullscreen

## Game Architecture

### Scenes (game states)
- **hub** — World map; tap a world disc to enter it
- **12 game scenes** — Each world has 1-2 games (Numbers, Ocean Colors, Pizza Kitchen, Magic Tracing, Memory Match, Star Patterns, Big & Small, Animal Band, Who Says That, Rocket Countdown, Paint Studio, Story Mode)

### Navigation
- Games are accessed from the hub
- Back button returns to hub
- Settings panel (gear icon) is accessible from the hub

### Audio
- **Synthesized speech** via Web Speech API (`window.speechSynthesis`)
- **Background music** — toggleable, three styles: Bouncy / Calm / March
- **Sound effects** — game-specific (coins, success sounds, etc.)

### Difficulty & Personalization
- **Difficulty levels:** Easy / Medium / Hard / Auto
- **Auto mode** — ramps difficulty as child succeeds
- **Settings panel** (⚙️ icon) — change name, difficulty, music style, voice on/off, reset progress
- **Sticker rewards** — drag-and-drop sticker book with fireworks animation
- **Character buddy** — animated snowman guide (extensible to other characters)

## Common Tasks

### Add a new game
1. Define the game scene object in `index.html`
2. Add it to the scene router
3. Create a world node on the hub that links to it
4. Add audio prompts using `speak(text)`
5. Handle tap input and game logic
6. Test difficulty scaling and accessibility

### Add a new world
1. Create 1-2 game scenes for the world
2. Add a `.node` element to the hub with styling (`.b-{worldname}` color gradient)
3. Update the scene colors (`body.theme-{worldname}`)
4. Add to the roadmap in README.md

### Modify audio (speech/music)
- **Speech:** Edit `speak()` calls throughout the code
- **Music:** Change the synth patterns in the `Synth` class
- **Difficulty:** Adjust game logic to scale with difficulty level

### Update branding / personalization
- **Child name:** Stored in localStorage, used in all speech prompts (e.g., `speak("Welcome, " + name + "!")`)
- **Character:** Extend `Buddy` class to add new animated friends
- **Colors/theme:** Add new `.theme-{name}` and `.b-{name}` CSS classes

## Privacy & Data
- **No telemetry** — nothing is sent to any server
- **Offline-first** — no internet connection required after PWA install
- **Local storage only** — child's name, progress, and settings are stored only in the device's browser
- **No tracking** — no analytics, no ads, no cookies

## Performance Notes
- **Target:** Sub-100ms touch latency on older tablets
- **Inline everything** — no external JS/CSS/images (performance + offline guarantee)
- **Minimize paint/layout thrashing** — use transform/opacity for animations
- **Accessibility first** — all buttons sized for finger taps, high contrast

## Roadmap & Future Ideas
See README.md for planned features (dinosaurs world, pets world, record your own voice, calmer bedtime mode, progress tracking for grown-ups, etc.).

## Tips for Contributing

1. **Test on real devices** — emulators and desktop browsers don't capture the UX for toddlers
2. **Respect the constraints** — offline-first, no dependencies, single HTML file
3. **Voice-first design** — assume the child can't read; every action should be voice-guided
4. **Accessibility** — big tap targets (min 44px), high contrast, clear visual feedback
5. **No fail states** — games should be encouraging, never punitive
6. **Progressive difficulty** — easy tasks first, scale as they succeed
