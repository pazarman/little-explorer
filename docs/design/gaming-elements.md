# Gaming elements worth stealing (and the ones to refuse)

An exploration doc, not a plan. Started from the owner's note that **Super Mario Bros. 3** was a
childhood favourite and that its world map is what we already borrowed (`HUB_LAYOUT` in `js/hub.js`,
`js/worldtrail.js`). The question: what *else* from real games transfers to a 2–5 year old?

---

## 1. Why the SMB3 map actually worked here

It's worth being precise, because the reason is the filter for everything below. The map didn't help
because it's a map. It helped because it does three things a pre-reader needs:

1. **Place instead of text.** A world lives at a fixed spot, so she navigates by location and colour.
   That is why `HUB_LAYOUT` coordinates are fixed per orientation rather than reflowed.
2. **Progress you can see without counting.** The buddy stands further along the road than it did
   last week. No numeral, no percentage, no reading.
3. **An anticipation beat.** The walk in `worldTrail.travelTo()` is a held breath before the reward.
   Anticipation is most of the pleasure, and toddlers have plenty of it — what they don't have is
   patience across *sessions*.

Any mechanic that delivers place, visible-without-reading progress, or anticipation will transfer.
Any mechanic that leans on deferred payoff, loss aversion, or social comparison will not.

### The four developmental facts that decide every call below

- **Working memory is ~2 items at three, ~3 at five.** A goal she has to *carry* between screens is
  simply gone. Goals must be visible on screen at the moment they matter. (This is why the quest
  slots are drawn on the hub rather than counted in a menu.)
- **Delayed gratification barely exists.** A reward more than one session away isn't a weak reward,
  it's not a reward. But a reward that *arrives while she's away* is magic — a different thing.
- **Loss aversion is present and raw.** Taking away something earned reads as a real loss at three.
  This is exactly the bug already fixed in `worldStars()` — a rounded average could remove a star she
  had earned. Every mechanic below must be monotonic.
- **Pretend play peaks from three to five.** Role and story motivate far harder than points do. She
  wants to *be* the vet; she does not want to score in vet-game.

And one that changes the economics: **repetition is the mechanic, not a failure of it.** She'll replay
the same thing forty times, and that's mastery. We are not under content-consumption pressure. 38
games can carry a year.

---

## 2. SMB3 had six map ideas. We took two.

| SMB3 element | Taken? | Toddler read |
|---|---|---|
| The world map itself | ✅ Layer 1 (v43) | place-based navigation |
| Walking the path between levels | ✅ Layer 2 (v44) | anticipation, visible progress |
| **Toad/mushroom houses** — nodes on the map that aren't levels | ❌ | exploration pays, not performance |
| **The end-of-world castle** — a bigger, different node that closes a world | ❌ | a real destination |
| **Letters from the Princess** between worlds | ❌ | narrative payoff, zero skill required |
| **The map having a state** (cleared castles, wandering Hammer Bros) | ❌ | "this place remembers me" |

Three of the four we skipped are age-perfect. That's the cheapest place to look first.

---

## 3. The shortlist

Ranked by (age fit × fit with the code we already have × learning value).

### 3.1 Surprise huts on the trail — *SMB3's mushroom house*
A node between games that isn't a game. Tap it and something happens: a short song, a sticker, the
buddy dances, a critter follows her to the next node. **Always a gift, never a chance** — no rarity,
no empty result.

Why it fits: it rewards *exploring* rather than *performing*, which is the only kind of reward that's
safe when the child can't yet distinguish "I failed" from "the game said no." It also solves the
known nit logged against Layer 2 — there's currently no affordance telling her the trail scrolls
past the games she knows. A hut sitting two nodes further along is that affordance.

Code: `worldTrail.pts` is already a generic node list; this is a second node type in `paintNodes()`.
**Effort: low.**

### 3.2 The end-of-world party — *SMB3's castle*
A bigger node at the far end of each trail. It plays three short rounds drawn from games she has
already played **in that world** — a counting round, then a colour round, then a shape round. Then
confetti and the buddy throws a party.

This is the highest learning value on the list and it isn't close. Mixed retrieval practice —
interleaving concepts instead of blocking them — is one of the best-evidenced levers in learning
science, and we currently do none of it: every game drills one concept in isolation. Disguising it as
the treat at the end of the road is the whole trick.

Guardrails: **no gating** — tappable from the first visit, per the Core Bar. It simply draws from
whatever she's played, so it starts short and grows richer. No score, no pass/fail.
**Effort: medium-high** (needs a round-runner that can host rounds from arbitrary levels).

### 3.3 A world that knows what time it is — *Animal Crossing*
Tint the hub from the real clock: morning gold, afternoon blue, dusk pink, night indigo with the
buddy yawning. There is currently no `getHours()` anywhere in `js/`.

Why it's worth more than it costs: "the world lives even when I'm not here" is the strongest
*non-coercive* reason to come back that exists — it's the honest alternative to a streak. It also
puts the `nightday` game's vocabulary into the wrapper, where she meets it every single session.
**Effort: tiny** — one `getHours()` → a body class → a palette swap.

### 3.4 Steer the buddy yourself
Right now `travelTo()` taps and auto-walks. Let her **drag** the buddy along the road instead: it
walks where she pulls, the camera follows, and it steps onto whatever node she stops beside.

BAR-CONFIG says prefer real-time, child-driven mechanics over tap-and-wait, and Dolphin Dive is the
reference. Navigation is the one screen we left as tap-and-wait. Keep tap-to-go as a fallback for
reduced-motion and for the days she doesn't want to.
**Effort: low-medium.**

### 3.5 A collection that names things — *Pokémon, done honestly*
We already have the collection (`fionaStickers`, the sticker book, `fionaDecor`). What's missing is
the meaning. `js/hub.js:334` reads `STICKER_DATA[palSel]` to fire a "this sticker belongs here!"
moment — and **`STICKER_DATA` is not defined anywhere in the repository.** The naming bonus has never
fired once.

Define it — each sticker gets a name and a home scene — and the sticker book stops being decoration
and becomes vocabulary plus classification: *collecting is naming, placing correctly is sorting.*
It's also the prerequisite for the already-proposed Layer 3 merge of `SCENES` into `CATEGORIES`.
**Effort: low** (a data table plus the strings). This is a bug fix that happens to be a feature.

### 3.6 The grown-up is player two — *couch co-op*
Not an arcade element, a living-room one, and the best-evidenced item here: joint media engagement —
an adult talking with the child during the activity — is the largest known multiplier on what a young
child actually learns from a screen. Bigger than any content change we could make.

Concretely: a two-player toggle where the app addresses both. "Grown-up — say a word that rhymes with
*cat*. Explorer — find it!" Costs content and voice lines, not engine.
**Effort: medium**, and it's the item most likely to change outcomes rather than engagement.

### 3.7 Something grew while you were away — *idle games, de-fanged*
A tree or garden on the hub that advances one visible step per visit. Never backwards, never dies,
no counter.

Worth stating plainly why this is allowed when streaks are not, because they look similar: a streak's
power comes from **fear of losing** what you built, and it punishes a parent's reasonable decision to
skip a day. A growing plant's power comes from **curiosity about what changed**. Same return
behaviour, opposite emotion, and only one of them is fair to a three-year-old.

### 3.8 Physics as a toy — *stacking, tumbling, rolling*
Already in the game backlog as Animal Stack, and it deserves promoting for a reason that isn't
obvious: physics games are the one genre where **the failure is the reward**. A tower that collapses
with a comic thud is funny, not punishing. That sidesteps the no-fail-state rule instead of working
around it, and gives real-time, embodied, infinitely repeatable cause-and-effect — the exact pleasure
this age is built for.

### 3.9 Ceremony instead of gates — *Zelda's key, minus the lock*
We refuse gating, correctly. But the *feeling* of turning a key isn't the lock — it's the ritual. A
gate at the entrance to each world that she opens herself, the same way, every single visit, is pure
gain: predictable ritual is how this age builds a sense of safety and control. `rocketLaunch()` is
already exactly this and it's the most beloved thing in the app. There's room for more of it.

### 3.10 A letter from the buddy — *SMB3's princess letters*
After she's tried three distinct games in a world, the buddy leaves a spoken postcard on the hub:
"You found all three animals in the meadow! Look what I drew for you." Narrative payoff, no skill
required, no number involved — and a natural slot for a full-sentence vocabulary model, which the
rubric's axis 2 rewards.

### 3.11 Seasonal reskin — *New Game+*
Snow on the map in December, leaves in October. No mechanics at all, and it signals that someone
tends this place. Cheapest delight-per-line on the list.

---

## 4. What to refuse, and why

These aren't squeamishness — each one fails on a specific developmental fact from §1.

| Element | Why not |
|---|---|
| **Timers / countdown pressure** | Converts a learning task into a performance task, which is precisely when a young child stops exploring. |
| **Lives / hearts** | Loss aversion is raw at three. Losing a heart is a real loss, not a game state. |
| **Streaks / daily login** | Coercive by design, and it punishes the parent — who is the one deciding screen time. Already banned in the Layer 3 guardrails; keep it banned. |
| **Leaderboards / competition** | Social comparison isn't developed yet, and it's harmful when it arrives. |
| **RNG rarity, loot boxes** | Variable-ratio reinforcement is the literal addiction mechanic. She also can't reason about probability, so "rare" just reads as *the game refused me*. |
| **Locks and gating** | Already refused. The trail is wayfinding, not a gate. |
| **Currency + a scarcity shop** | Introduces regret — spending wrong. A *free* shop where she "buys" with a tap is fine: that's pretend play, not an economy. |
| **Tamagotchi decay** | A pet that gets sad because she was away is guilt aimed at a three-year-old. `js/games/pets.js` keeps sadness inside a round, never across time. Keep it that way. |
| **Twitch precision** | Motor control isn't there. Already covered by the ≥44px target rule. |

The pattern: **every refused mechanic works by creating a small, manageable anxiety.** That's a fair
deal with an adult who opted in. It isn't one here.

---

## 5. If we build four, build these

1. **Time-of-day hub** (§3.3) — hours of work, immediate magic, teaches vocabulary in the wrapper.
2. **Surprise huts** (§3.1) — low effort, and it fixes Layer 2's known scroll-affordance nit.
3. **`STICKER_DATA` + naming** (§3.5) — repairs dead code and converts decoration into curriculum.
4. **End-of-world party** (§3.2) — the real prize: mixed retrieval practice, disguised as a party.

1–3 are one release. 4 is its own.

---

*Next step if these are wanted: promote the chosen ones into `PLATFORM-BACKLOG.md` as `[PROPOSED]`
entries for the PM to vet, per the process in that file.*
