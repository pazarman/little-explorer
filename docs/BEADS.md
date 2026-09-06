# Beads (`bd`) — how we use it, and what we learned adopting it

We track the backlog in [beads](https://github.com/steveyegge/beads), a git-backed issue
tracker built for coding agents. This file is the working reference; it is also the
write-up of the adoption, because the non-obvious parts are the ones worth keeping.

Installed version at adoption: **bd 1.2.2**, embedded Dolt backend, issue prefix `le`.

---

## Why we moved off the markdown backlog

`docs/GAME_BACKLOG.md` worked, but three failures kept recurring, and none of them were
fixable inside a markdown file:

1. **Status drifted from reality.** Games sat at `[IN_REVIEW]` for weeks after shipping —
   Tall or Short, Night & Day Sort, then Letter Lights and My Five Senses. Nothing
   reconciled a hand-typed label against the repo.
2. **Priority was the line number.** The builder took the first `[READY]` reading
   top-down, so an unrelated edit that inserted an item higher in the file silently
   changed what got built next. Blend-It! was ranked #1 and quietly lost its slot.
3. **The one dependency was a sentence.** Build-a-Buddy is blocked on the art overhaul.
   That was a prose warning nothing enforced.

Beads fixes all three structurally: status is a state machine, priority is a field, and a
dependency is an edge that `bd ready` actually honours.

---

## Our lane → status mapping

We express the existing workflow in **native beads statuses** rather than inventing labels
on top of them. This is the single most useful decision in the migration:

| Old markdown lane | beads status | Category | Effect |
| --- | --- | --- | --- |
| `[PROPOSED]` | `deferred` | frozen | Excluded from `bd ready`. **PM approves with `bd undefer <id>`** |
| `[READY]` | `open` | active | Claimable; appears in `bd ready` |
| `[IN_REVIEW]` | `in_progress` | wip | Claimed; excluded from `bd ready` |
| `[DONE]` | `closed` | done | Done |

The PM's "promote ~2 items per week" is now literally `bd undefer`. Nothing custom.

Domain labels are set on every issue so the backlog is queryable:
`game`, `platform`, `literacy`, `sel`, `science`, `math`, `spatial`, `logic`, `art`, `hub`.

---

## Daily commands

```bash
bd ready                  # the computed queue: open, unblocked, unclaimed
bd ready --explain        # why each item is ready or blocked
bd blocked                # what is waiting, and on what
bd show le-9s3            # full issue detail
bd list -l literacy       # query by domain label
bd status                 # database overview

bd undefer le-xxx         # PM: approve a proposal into the ready queue
bd priority le-xxx 0      # PM: rank it (0 = highest, default 2)
bd close le-xxx --reason "shipped: live on main at v43"
```

### The one that matters for multi-agent work

```bash
bd ready --claim --json   # atomically claim the top ready issue
```

This is a compare-and-swap: it selects **and locks** in a single call, setting
`status=in_progress`, `assignee`, and `started_at`. Two agents running it concurrently
cannot get the same issue. That property — not the dependency graph — is what makes
more than one builder safe. Hash-based IDs (`le-9s3`) exist for the same reason: they
avoid the merge collisions that sequential IDs cause when two agents create issues at once.

---

## Gotchas worth remembering

**`bd init` is invasive by default.** It does considerably more than create a database:

- appends a managed block to `CLAUDE.md` (versioned + content-hashed, so it self-updates
  idempotently — a good pattern to steal)
- adds a `SessionStart` hook to `.claude/settings.json` that runs `bd prime`
- installs git hooks in `.beads/hooks/` and writes `.codex/` config and a root `AGENTS.md`
- **auto-commits all of it**

Use `bd init --stealth` for a non-invasive install that keeps beads out of the repo
(git-excluded, personal use). Know which one you want *before* running it in a shared repo.

**The managed CLAUDE.md block tells agents to stop using TodoWrite / markdown TODOs.**
That is an opinionated takeover of task tracking. Fine here — it is why we adopted it —
but review it rather than inheriting it silently.

**Building `bd` from source needs ICU headers.** `go install` fails with
`fatal error: unicode/uregex.h: No such file or directory` because the Dolt backend links
against libicu. Fix: `apt-get install -y libicu-dev`, then reinstall.

---

## How state actually travels (the part that surprised us)

**The database is local. It does not travel through git.** The Dolt DB lives in
`.beads/embeddeddolt/` and is gitignored. What git carries is `.beads/issues.jsonl` — and
beads' own docs call that a *passive* export, not the sync channel.

Beads' native remote sync uses a `refs/dolt/data` ref on the git remote. **We are not
using it** — after our first push, `git ls-remote origin` showed no `refs/dolt/*` at all,
locally or remotely. So the portable path here is the JSONL round-trip:

```bash
# machine / container that did the work
bd export -o .beads/issues.jsonl && git add .beads/issues.jsonl && git commit && git push

# anywhere else (fresh clone, new container, your laptop)
bd import            # defaults to .beads/issues.jsonl; upsert semantics
```

Verified end to end: a brand-new empty database imported the committed JSONL and came back
with all 52 issues, the same 4-item ready queue, and the `le-xgs blocks le-9s3` edge
intact. Hash IDs are stable, so the import is idempotent and safe to re-run.

### What this means for multiple agents — the real constraint

`bd ready --claim` is atomic **within one database**. It is not a distributed lock.

Two agents in two containers each have their *own* embedded Dolt DB. Both can claim the
same issue, because neither DB knows about the other. You would only find out when both
push a modified `issues.jsonl` and git reports a conflict on one file — which is precisely
the failure mode we left markdown to escape.

So the claim primitive only becomes real mutual exclusion when the agents **share one
database**. The options, roughly in order of effort:

| Approach | What it gives you |
| --- | --- |
| JSONL round-trip *(what we do now)* | Portability. Fine for **one** builder at a time. No cross-agent locking. |
| `refs/dolt/data` sync | Dolt merges structurally rather than by text, so concurrent edits reconcile far better than a flat file. Still eventual — not mutual exclusion. |
| Shared Dolt server (`bd init --server`, `--server-host/--server-port`, `BEADS_DOLT_PASSWORD`; or `--global`) | **The actual multi-agent answer.** One database every agent connects to, so `--claim` is a true lock. |

Conclusion: running several builders concurrently is not a prompt change — it needs a
hosted `dolt sql-server` that every agent can reach. Embedded-per-container defeats the
whole point of the claim.

**Metrics are on by default.** `bd` reports which commands are run (not issue content).
`bd metrics off` opts out; `bd metrics example` shows what is sent.

---

## ⚠️ Before the scheduled agents can use this

**The `bd` binary is not in the routine container.** Routine runs get a fresh container
from the environment image, and `bd` was installed here at runtime (`apt-get install
libicu-dev` + `go install github.com/steveyegge/beads/cmd/bd@latest`, several minutes to
compile). Runtime installs do not persist.

So the cutover has a required order:

1. Merge this branch to `main`.
2. Make `bd` available in the routine environment — add the install to the environment's
   setup script. Compiling it inside every run is too slow to be practical.
3. **Only then** switch the Weekly Builder prompt from markdown to beads (draft below).
4. Retire the markdown backlogs last. Dual-writing a markdown file and a database is the
   worst of both — pick one.

Until step 2 is done, the agents must keep reading `docs/GAME_BACKLOG.md`, which is why
those files are still present and unchanged.

### Draft replacement for the Weekly Builder's step 2

```
2. Claim your work atomically:
     bd ready --claim --json --exclude-label platform
   This returns the issue JSON and marks it in_progress in one call, so two
   builders can never take the same item. If it returns nothing, reply
   "no ready work — standing by" and stop. Note the returned `id`.
   ...
7. On success, push your branch, then: bd close <id> --reason "built on <branch>"
   If the gate fails, leave it in_progress and add context:
     bd comment <id> "gate failed: <blockers>"
```

Keep the existing hard-won rules unchanged: stay on the session's own branch, push with
`git push -u origin HEAD`, and never invent a `feat/<id>` branch.
