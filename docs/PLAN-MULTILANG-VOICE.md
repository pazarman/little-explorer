# 🎙️ Multi-Language Parent Voice Recording Plan

## Overview
Add the ability for parents to record instructions in **English, Spanish, and Cantonese**. The child hears the parent's voice guiding them through games in their native language — huge personalization + accessibility win.

### Current State
- Games use synthesized Web Speech API voice (robot voice)
- No language selection
- Works offline but feels impersonal

### Target State
- Parent records phrases once in all 3 languages
- Child picks language in settings
- All gameplay uses parent's voice in chosen language
- Graceful fallback to synthesis if not recorded

---

## 🗂️ Storage Structure

Each phrase stored with language prefix:

```javascript
// English
localStorage.setItem('voiceRecording_en_tapRed', audioBase64);
localStorage.setItem('voiceRecording_en_goodJob', audioBase64);

// Spanish
localStorage.setItem('voiceRecording_es_tapRed', audioBase64);
localStorage.setItem('voiceRecording_es_goodJob', audioBase64);

// Cantonese
localStorage.setItem('voiceRecording_yue_tapRed', audioBase64);
localStorage.setItem('voiceRecording_yue_goodJob', audioBase64);

// Current language setting
localStorage.setItem('language', 'en'); // or 'es', 'yue'
```

---

## 🎯 Playback Logic

Replace all `speak()` calls with `playVoice()`:

```javascript
const currentLanguage = localStorage.getItem('language') || 'en';

const playVoice = (phraseKey, englishText) => {
  const recorded = localStorage.getItem(`voiceRecording_${currentLanguage}_${phraseKey}`);
  
  if (recorded) {
    // Play parent's voice in their language
    const audio = new Audio('data:audio/mp3;base64,' + recorded);
    audio.play();
  } else {
    // Fallback to synthesis (if phrase not yet recorded)
    speakInLanguage(englishText, currentLanguage);
  }
};
```

---

## 📋 Core Phrases to Record (25 Total)

Record these phrases in all 3 languages:

| Key | English | Spanish | Cantonese |
|-----|---------|---------|-----------|
| `greeting` | "Let's play a game!" | "¡Vamos a jugar!" | "我哋一齊玩！" |
| `ready` | "Ready to start?" | "¿Listo para comenzar?" | "準備好未？" |
| `tapRed` | "Tap the red one" | "Toca el rojo" | "㩒紅色個一個" |
| `tapBlue` | "Tap the blue one" | "Toca el azul" | "㩒藍色個一個" |
| `tapYellow` | "Tap the yellow one" | "Toca el amarillo" | "㩒黃色個一個" |
| `count` | "Count these" | "Cuenta estos" | "數一數" |
| `countTo5` | "Count to five" | "Cuenta hasta cinco" | "數到五" |
| `great` | "Great job!" | "¡Muy bien!" | "做得好！" |
| `excellent` | "Excellent!" | "¡Excelente!" | "非常好！" |
| `wellDone` | "Well done!" | "¡Buen trabajo!" | "好棒！" |
| `correct` | "That's correct!" | "¡Eso es correcto!" | "啱啱啱！" |
| `tryAgain` | "Try again" | "Intenta de nuevo" | "再試一次" |
| `goodTry` | "Good try!" | "¡Buen intento!" | "都唔錯！" |
| `match` | "Find the match" | "Encuentra el par" | "搵匹配個" |
| `memory` | "Remember where it is" | "Recuerda dónde está" | "記得喺邊度" |
| `sing` | "Sing with me" | "Canta conmigo" | "同我唱歌" |
| `dance` | "Let's dance" | "Vamos a bailar" | "我哋跳舞" |
| `trace` | "Trace the shape" | "Traza la forma" | "跟住畫" |
| `draw` | "Draw on the screen" | "Dibuja en la pantalla" | "喺度度畫畫" |
| `goHome` | "Let's go home" | "Volvamos a casa" | "返屋企" |
| `backToWorlds` | "Back to the worlds" | "Volver a los mundos" | "返去世界" |
| `goodbye` | "Goodbye, see you soon!" | "¡Adiós, nos vemos pronto!" | "拜拜，下次見！" |
| `wellcome` | "Welcome, [name]!" | "¡Bienvenido, [name]!" | "歡迎，[name]！" |
| `funTime` | "Time for fun!" | "¡Hora de diversión!" | "玩樂時間！" |
| `almostThere` | "You're almost there!" | "¡Ya casi lo logras!" | "快要成功啦！" |

---

## 🎛️ Settings UI Changes

Add to settings panel (before or after existing options):

```
⚙️ Settings Panel
├─ Child's Name: [input field]
├─ Difficulty: [Easy] [Medium] [Hard] [Auto]
├─ Language: [Dropdown: English / Español / 廣東話]  ← NEW
├─ Music: [On/Off]
├─ Voice: [On/Off]
├─ Record Instructions: [Record Phrases Button]  ← NEW (colored differently)
└─ Reset Progress: [Yes/No?]
```

### Recording Modal (appears when "Record Phrases" tapped)

```
🎙️ Record Your Voice

Language: [English ▼]

📝 Phrases to Record (25 total)

[Phrase 1: "Let's play a game!"]
  [Record] [Play] [Delete] 🔴 Not recorded

[Phrase 2: "Tap the red one"]
  [Record] [Play] [Delete] ✅ Recorded

... (continue for all 25)

[Progress: 12/25 recorded]
[Difficulty: ████░░░░░░ 48%]
```

---

## 💾 Storage Capacity

- **Per phrase:** ~50-100KB (depending on audio quality/duration)
- **Per language:** ~1.5-2MB (25 phrases)
- **All three languages:** ~4-6MB total
- **localStorage limit:** 5-10MB per origin
- **Result:** ✅ Comfortable fit (can add more phrases later if needed)

---

## 🚀 Implementation Phases

### Phase 1: English Only (Week 1)
**Goal:** Prove the recording + playback flow works

- [ ] Add "Record Instructions" button to settings
- [ ] Build recording modal UI
- [ ] Implement `MediaRecorder` audio capture
- [ ] Store first 10 phrases in localStorage as base64
- [ ] Create `playVoice()` function with fallback
- [ ] Replace key `speak()` calls with `playVoice()`
- [ ] Test on device with actual recording
- [ ] Merge to main

**Effort:** 4-6 hours

### Phase 2: Spanish + Language Picker (Week 2)
**Goal:** Add language selection, record Spanish

- [ ] Add language picker dropdown to settings
- [ ] Update recording UI to show current language
- [ ] Record same 10 phrases in Spanish
- [ ] Test language switching
- [ ] Add remaining 15 phrases (English + Spanish)
- [ ] Merge to main

**Effort:** 3-4 hours

### Phase 3: Cantonese (Week 3)
**Goal:** Full tri-lingual support

- [ ] Add Cantonese (yue) as language option
- [ ] Record all 25 phrases in Cantonese
- [ ] Test all three language combinations
- [ ] Update README/docs with new feature
- [ ] Merge to main

**Effort:** 2-3 hours (mostly recording)

---

## 🎙️ Recording Tips

### Best Practices
- **Quiet room** — minimize background noise
- **Clear voice** — speak as if talking to a 2-3 year old (warm, encouraging)
- **Keep it short** — 2-4 seconds per phrase max
- **Consistent volume** — audio levels should be similar across phrases
- **Space it out** — record 5-8 phrases, then take a break (voice fatigue)
- **Record in all 3 languages consecutively** — easier to compare and redo if needed

### Tools
- **Record:** Use phone voice memo app or any browser recorder
- **Convert to base64:** Use online tool or small script
- **Test:** Play back immediately to catch quality issues

### Re-recording
- Parent can re-record any phrase anytime
- Just tap "Record" on that phrase again
- New recording overwrites the old

---

## 🔧 Code Changes Needed

### 1. Update Settings Modal HTML (in index.html)
- Add language dropdown
- Add recording button

### 2. Add Recording Logic (in index.html JS)
- `MediaRecorder` setup
- Phrase list management
- Base64 encoding for localStorage

### 3. Update speak() Calls
- Keep old `speak()` function
- Create new `playVoice(phraseKey, text)` function
- Replace key gameplay `speak()` calls

### 4. Update Settings Handlers
- Language picker onChange handler
- Recording button click handler
- Modal open/close

---

## 📊 Success Metrics (Post-Ship)

- [ ] 95%+ of recordings work on iOS + Android
- [ ] No stuttering/latency in playback
- [ ] Parents enjoy re-hearing their voice
- [ ] Fallback to synthesis works smoothly
- [ ] localStorage doesn't hit limits
- [ ] Easy to re-record or delete phrases

---

## 🎯 Next Step

Once you're rested and ready:

1. **Start with Phase 1** (English only)
2. **Build the UI** for recording modal
3. **Implement MediaRecorder** capture
4. **Record 10 test phrases** and wire up playback
5. **Test on device** before scaling to all 25 + multi-language

---

## 📝 Notes

- The `[name]` placeholder in "Welcome, [name]!" should interpolate the child's name from localStorage
- Voice synthesis fallback means even unrecorded phrases will work (in the chosen language)
- Consider adding a "language auto-detect" based on browser/device settings as bonus feature
- Could add volume control for recorded phrases separately from music volume

---

**Status:** Ready to implement Phase 1 ✅
