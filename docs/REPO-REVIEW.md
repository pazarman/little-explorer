# Repo review — 2026-09-06

A full pass over the repository for stale files, dead code, bad practice, testing gaps,
duplication and improvements. Findings are ordered by what they cost, not by where they live.
Every claim below was verified against the running app or the file at the line cited — the
"how I checked" line says how.

**Headline:** the code is in better shape than the process around it. The two most serious
findings are not bugs in a game — they are that **the live site deploys without the tests
passing**, and that **the app violates its own Core Bar on parent gating**.

---

## P0 — Fix before the next release

### 1. The deploy is not gated on the test suite
`.github/workflows/pages-deploy.yml:40` — the `deploy` job is `needs: validate`, and `validate`
only checks that files exist, that `manifest.json` parses, and that inline JS has no syntax
errors. The 28 smoke tests live in a **separate workflow** (`ci.yml`) that runs in parallel and
blocks nothing. A merge with a red suite still ships to the live site.

`ci.yml` ends with a comment admitting this: *"once this is green a few times, gate the deploy
on it by adding `needs: [validate, smoke]`"*. It has been green for many releases.

**Fix:** move the smoke job into `pages-deploy.yml` (or make it a required check in branch
protection) and set `needs: [validate, smoke]`. One line, removes the whole class of
"we shipped it broken to a child's tablet".

*How I checked:* read both workflow files; confirmed `deploy: needs: validate` only.

### 2. Grown-up settings — and total data wipe — are three child taps away
The Core Bar (`docs/skills/01-product-quality-bar.md:15`) is explicit: *"settings + destructive
actions are gated (long-press + a simple parent check), **never one child tap**"*, and
BAR-CONFIG sets "Parent controls: Medium gate". A Core Bar failure is an auto-fail.

What actually ships:
- `js/hub.js:521` — `$("settingsBtn").onclick = openSettings;` — a single tap on the ⚙️ on the hub.
- `js/hub.js:531` — `Start over` → `confirm()` → `localStorage.clear()` + reload.

So: tap ⚙️ → tap "🔄 Start over" → tap OK on a native dialog. Every star, sticker, the buddy,
her name — gone. A native `confirm()` is not a parent check; it is a big button a 3-year-old
will happily press. This is the repo's own rule, unmet.

**Fix:** long-press (or a two-step hold) on ⚙️, plus a simple adult check before the two
destructive buttons — the pattern BAR-CONFIG already prescribes.

*How I checked:* read the handlers; traced the tap path from the hub.

### 3. One storage failure permanently disables all saving for the session
`js/core.js:84-92` — `core.save()` debounces writes and then does, with no `try`/`catch`:

```js
this.saveTimer = setTimeout(() => {
  this.pendingSaves.forEach((v, k) => localStorage.setItem(k, v));   // can throw
  this.pendingSaves.clear();
  this.saveTimer = null;
}, 2000);
```

`setItem` throws on quota-exceeded and in Safari private browsing. When it does, the throw
escapes the timer callback, so `pendingSaves.clear()` and `saveTimer = null` never run. Because
the next `save()` starts with `if (this.saveTimer) return;`, **no further save is ever
scheduled** — persistence is silently dead for the rest of the session, and the child's progress
stops being recorded with no sign anything is wrong. `flush()` (line 96) has the same gap.

**Fix:** wrap both loops in `try`/`catch`, and reset the timer state in a `finally`.

### 4. Up to 2 seconds of progress is lost every time the app is backgrounded on iOS
`js/core.js:104` — the only flush trigger is `window.addEventListener("beforeunload", ...)`.
iOS Safari frequently does not fire `beforeunload`; the reliable signals are `pagehide` and
`visibilitychange`. Combined with the 2-second debounce, the normal way this app ends — a
toddler hitting the home button, or iOS reclaiming the tab — routinely drops the last save.
On a PWA on a phone, which the README calls the primary surface, this is the common path.

**Fix:** also flush on `pagehide` and on `visibilitychange` when `document.hidden`.

---

## P1 — Live bugs

### 5. Spanish Hide & Seek says "el basket", "el box", "el table"
`js/core.js:319-321` puts three **object-valued** entries inside `DICT.en`, the string
dictionary:

```js
basket: { es: "canasta", g: "f" },
box:    { es: "caja",    g: "f" },
table:  { es: "mesa",    g: "f" }
```

But `word()` / `genderOf()` (`js/core.js:847,857`) read the separate `VOC` table at line 734 —
which does **not** contain these three. So the Spanish translations exist in the repo and are
never reached. Verified live, switching the app to Spanish:

| key | says | should say |
|---|---|---|
| basket | `el basket` | `la canasta` |
| box | `el box` | `la caja` |
| table | `el table` | `la mesa` |

Both wrong noun *and* wrong article (they are feminine). Hide & Seek is a positional-language
game — the noun is the content. `VOC_YUE` (line 811) has all three, so Cantonese is fine.

**Fix:** move the three entries from `DICT.en` into `VOC`, where every other noun lives.

*How I checked:* called `theWord()` for each key in each language in the running app.

### 6. The reset confirmation is hardcoded English
`js/hub.js:524` — `confirm("Reset all of " + NAME + "'s stars and stickers?")`. The sibling
handler one line below correctly uses `t("settings_restart_confirm")`. In a Spanish or
Cantonese session the parent gets an English dialog.

### 7. `STICKER_DATA` is read but never defined (still open)
`js/hub.js:362` guards on `typeof STICKER_DATA !== "undefined"` and it is defined nowhere in the
repo, so the "this sticker belongs here!" reward has never fired. Already written up in
`docs/design/gaming-elements.md` §3.5 — repeated here because it is a live dead feature, not
just a design note.

---

## P2 — Testing gaps

The suite (28 tests) is genuinely good where it exists — it drives real gameplay, not just
smoke. The gap is *what it was pointed at*.

### 8. 26 of 38 games have no gameplay test
Tests that actually drive a level exist for 12: `dolphin, eggcatch, feelings, fuelup, hippo,
letternames, meerkat, monkey, body, runway, scavenger, senses`.

No gameplay test for: `bike, cups, dino, dragon, dressup, hideseek, icecream, measure, memory,
music, nightday, ocean, paint, pasta, petcare, petmatch, petfeed, pizza, rocket, snow, pattern,
sort, sortkind, story, trace, whosays`.

The pattern is chronological: **the recently built games are tested and the original ones are
not.** The untested set includes the core curriculum — counting (`snow`), colours (`ocean`),
numerals (`bike`), shapes (`pizza`), patterns (`pattern`). `every registered game opens without
throwing` covers all 38, but only that they open.

### 9. The adaptive difficulty engine has zero tests
`fionaPerf`, `autoTierFor`, `tierFor`, `roundComplete`, the EMA of round quality and the
down-shift on ≥3 mistakes are named in CLAUDE.md as a central system and appear **zero** times
in the test file. This is the machinery that decides what a child sees next; a regression in it
is invisible until she is bored or defeated.

### 10. The reward loop has zero tests
`sparks`, `QUEST_GOAL`, `rocketLaunch`, `trips`, `stickers`, `saveCompletions` — zero mentions.
The Star Spark → rocket journey is the app's spine of motivation.

### 11. Also untested
- **Reduced motion** — honoured in CSS and in `worldTrail`, never asserted.
- **Rendering in Spanish/Cantonese** — the new test checks that spoken strings avoid "grown-ups"
  and that key sets match, but nothing renders a screen in `es`/`yue` and checks it fits or reads.
- **Persistence round-trip** — nothing writes state, reloads, and asserts it came back.

**Suggested order:** difficulty engine → reward loop → the five core-curriculum games. That is
three focused sessions and it covers what actually matters.

---

## P3 — Stale, dead and duplicated

### 12. The quality system contradicts itself in four places
`docs/skills/01-product-quality-bar.md` was upgraded to **v2 (12 axes, max 24, pass ≥ 18)** on
2026-06-18 and its own changelog records it. Still describing the retired v1:

| File | Says |
|---|---|
| `CLAUDE.md:13` | "7-axis rubric (0/1/2, **pass ≥ 11/14**)" |
| `.claude/skills/toddler-game-quality/SKILL.md:17` | "skill 01, 7 axes ×0/1/2, pass ≥ 11/14" |
| `.claude/skills/toddler-game-quality/SKILL.md:3` | "the 7-axis product quality bar" |
| `.claude/commands/review-game.md:10-13` | "Score each of the 7 axes… against the 11/14 threshold" |

These are the *entry points* — CLAUDE.md is what an agent reads first, and `/review-game` is how
a game gets scored. Every review run today is scored against a retired rubric with five of the
axes missing, including SEL and STEM Coverage Value. **Highest-leverage doc fix in the repo.**

### 13. Two "auto-updated" docs have not updated since June
- `docs/TESTS.md` — "Auto-updated by the Analyst agent after each merge. Last updated:
  2026-06-25." Its coverage table reads `(none yet)` while 28 tests exist.
- `docs/COVERAGE.md` — same date, 30 rows against 38 shipped games.

They assert freshness they do not have, which is worse than being absent: an agent reading
TESTS.md concludes there are no tests. Either wire them to something real or delete them and
let the suite be the record.

### 14. The child's first name is in four committed, publicly served files
`CLAUDE.md` closes with: *"The child's name … must not appear in any committed/public file."*
It appears as the project slug `fiona-game` in:
- `CLAUDE.md:67`
- `docs/skills/templates/feature-kickoff-prompt.md:7`
- `docs/skills/templates/post-release-retro-prompt.md:7`
- `docs/IMPLEMENTATION-PROMPTS.md:9,43,70,95`

An earlier commit ("get a real name out of them") swept the docs but missed these because
`fiona-game` reads as a project name. Note also that the localStorage keys shipped in the
public JS are `fionaStars`, `fionaBuddy`, … — that is the documented convention, but it is the
same name in the same public place, so it is worth an explicit decision rather than an accident.

### 15. The entire repository is published to the web
`.github/workflows/pages-deploy.yml` uploads `path: .`, so GitHub Pages serves `docs/`
(including the backlogs and the quality bar), `sandbox/`, `.claude/`, `.gemini/`, `tests/`,
`scripts/`, `CLAUDE.md` and `package.json` alongside the app. Nothing here is a secret, but it
publishes internal planning and roughly triples what a phone downloads on first visit.

**Fix:** build the artifact from an allowlist, or add the non-app directories to an exclusion step.

### 16. Dead code
- `js/hub.js:128` `launchGame()` — the pre-trail navigation path, replaced by
  `worldTrail.travelTo()`. Zero callers.
- `js/hub.js:107` `gameCategory()` — called **only** by `launchGame`, so it dies with it.
- `js/core.js:862` `aWord()` — an "a X"/"un/una X" i18n helper with zero callers.

### 17. Dead CSS
`c-fantasy` (`css/style.css:167`) — a world colour for a world that does not exist;
`ice-spikes` (:433); `dino-egg` and `.dino-egg.hatched` (:737-739). Confirmed unreferenced
including dynamic construction. *(The 23 `b-*` classes look dead to a naive grep but are built
as `` b-${gid} `` in `worldtrail.js:176` — they are live. Any future dead-CSS sweep must account
for that.)*

### 18. Unreferenced files
Nothing links to `sandbox/cantonese-review.html`, `sandbox/cantonese-tts.html` (41 KB together),
`docs/agent-dashboard.html`, `scripts/run-implementer.ps1` or `scripts/implementer-prompt.md`.
The sandbox pages are a genuine Cantonese review tool and worth keeping — but they should say so
at the top, or move under `docs/`, so the next reader knows they are not dead. The `scripts/`
pair is a PowerShell runner last touched 2026-07-06, on a repo otherwise driven from the web.

### 19. README drift
`README.md` still lists `js/hub.js` as holding "story mode" — it moved to `js/games/story.js`
in the registry refactor. One line.

---

## What is in good shape

Worth recording so it does not get "fixed":

- **No leaks.** Cycling all 38 games twice and replaying one rAF game ten times leaves the DOM
  flat (418 → 495 nodes, 1 style element). All six rAF games cancel their loop.
- **i18n parity is real.** 236/233/233 keys; the only gaps are the three misplaced vocabulary
  entries in §5. No untranslated stubs.
- **The Cantonese fallback is deliberate, not a bug.** `curLang()` (`js/core.js:825`) returns
  English when no Cantonese voice is installed, rather than showing text it cannot speak.
- **Per-game injected `<style>` is fine.** 13 games do it inside `playArea.innerHTML`, so it is
  replaced rather than accumulated.
- **The new registry guards hold.** Both the trail-order and service-worker tests were
  mutation-tested when they landed.

---

## Suggested sequence

1. **Gate the deploy on the suite** (§1) — one line, biggest risk removed.
2. **Fix the rubric contradiction** (§12) — one edit in four files; everything downstream is
   being judged against the wrong standard until it lands.
3. **Parent gate** (§2) — a real Core Bar violation, needs a small design decision.
4. **Storage robustness** (§3, §4) — silent, and it costs her actual progress.
5. **Spanish nouns** (§5) and the English confirm (§6) — small, visible.
6. **Backfill tests** (§9, §10, §8) in that order.
7. **Sweep** (§13-§19) — dead code, dead CSS, stale docs, publish scope, in one cleanup pass.
