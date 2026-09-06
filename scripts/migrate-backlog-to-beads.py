#!/usr/bin/env python3
"""
One-shot migration: docs/*BACKLOG.md  ->  beads issues.

Maps our markdown lanes onto native beads statuses so the workflow is expressed
in the tool rather than reinvented on top of it:

    [PROPOSED]   -> deferred     (frozen; excluded from `bd ready`)
    [READY]      -> open         (claimable; shows in `bd ready`)
    [IN_REVIEW]  -> in_progress  (claimed; excluded from `bd ready`)
    [DONE]       -> closed

Priority replaces line-position as the ordering signal, and the one real
dependency (art overhaul blocks Build-a-Buddy) becomes a true edge.

Run from the repo root, once:  python3 scripts/migrate-backlog-to-beads.py
"""
import json
import re
import subprocess
import sys

HEADING = re.compile(r"^\s*#{2,4}\s*\[(?P<status>[A-Z_]+)\]\s*(?P<title>.+?)\s*$")
# strip our decorations: trailing arrows/notes we added by hand in the markdown
DECOR = re.compile(r"\s*(⟵|←).*$")

STATUS_MAP = {
    "PROPOSED": "deferred",
    "READY": "open",
    "IN_REVIEW": "in_progress",
    "IN_PROGRESS": "in_progress",
    "DONE": "closed",
    "REJECTED": "closed",
}
# open work ranks above frozen work; refine later with `bd priority <id> <n>`
PRIORITY_MAP = {"open": 1, "in_progress": 1, "deferred": 2, "closed": 3}

SOURCES = [("docs/GAME_BACKLOG.md", "game"), ("docs/PLATFORM-BACKLOG.md", "platform")]

# Domain labels, matched against the entry body so items are queryable by
# curriculum area (e.g. `bd list -l literacy`).
DOMAIN_HINTS = {
    "literacy": ["phonological", "literacy", "letter", "rhyme", "blend"],
    "sel": ["social-emotional", "sel ", "empathy", "self-regulation", "feelings"],
    "science": ["scientific thinking", "living", "sink or float", "senses", "weather"],
    "math": ["number sense", "counting", "measurement", "capacity", "seriation", "quantity"],
    "spatial": ["spatial reasoning", "shape", "left/right", "fitting"],
    "logic": ["logic", "cause–effect", "cause-effect", "pattern", "sequenc"],
    "art": ["svg", "art overhaul", "graphics"],
    "hub": ["hub", "world map", "navigation", "category disc"],
}


def parse(path, kind):
    """Split a backlog file into (status, title, body, kind) entries."""
    try:
        lines = open(path, encoding="utf-8").read().split("\n")
    except FileNotFoundError:
        print(f"  ! {path} not found, skipping")
        return []
    out, cur = [], None
    for line in lines:
        m = HEADING.match(line)
        if m:
            if cur:
                out.append(cur)
            title = DECOR.sub("", m.group("title")).strip()
            cur = {"status": m.group("status"), "title": title, "body": [], "kind": kind}
        elif cur is not None:
            if line.startswith("## ") or line.startswith("---"):
                out.append(cur)
                cur = None
            else:
                cur["body"].append(line)
    if cur:
        out.append(cur)
    return out


def labels_for(entry):
    blob = (entry["title"] + " " + "\n".join(entry["body"])).lower()
    labels = [entry["kind"]]
    labels += [d for d, keys in DOMAIN_HINTS.items() if any(k in blob for k in keys)]
    return labels[:4]


def bd(args, stdin=None):
    r = subprocess.run(["bd"] + args, input=stdin, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  ! bd {' '.join(args[:3])} failed: {r.stderr.strip()[:200]}")
        return None
    return r.stdout


def create(entry):
    status = STATUS_MAP.get(entry["status"])
    if status is None:
        return None
    body = "\n".join(entry["body"]).strip() or "(migrated from markdown backlog)"
    itype = "feature" if entry["kind"] == "game" else "task"
    args = [
        "create", entry["title"],
        "-t", itype,
        "-p", str(PRIORITY_MAP[status]),
        "-l", ",".join(labels_for(entry)),
        "--body-file", "-",
        "--json",
    ]
    out = bd(args, stdin=body)
    if not out:
        return None
    try:
        iid = json.loads(out).get("id")
    except json.JSONDecodeError:
        m = re.search(r"\b([a-z]+-[0-9a-f]{4,})\b", out)
        iid = m.group(1) if m else None
    return (iid, status) if iid else None


def apply_status(iid, status):
    """Move an issue out of the default `open` state where the lane requires it."""
    if status == "open":
        return
    if status == "closed":
        bd(["close", iid, "--reason", "migrated: already shipped"])
    elif status == "deferred":
        bd(["defer", iid, "--reason", "awaiting PM approval (was [PROPOSED])"])
    elif status == "in_progress":
        bd(["update", iid, "--status", "in_progress"])


def main():
    entries = []
    for path, kind in SOURCES:
        found = parse(path, kind)
        print(f"  parsed {len(found):>3} entries from {path}")
        entries += found

    created = {}
    counts = {}
    for e in entries:
        res = create(e)
        if not res:
            continue
        iid, status = res
        apply_status(iid, status)
        created[e["title"]] = iid
        counts[status] = counts.get(status, 0) + 1
        print(f"  {iid:<12} {status:<12} {e['title'][:52]}")

    print(f"\n  created {len(created)} issues: " +
          ", ".join(f"{v} {k}" for k, v in sorted(counts.items())))

    # The one real dependency edge, promoted from prose to a checked constraint.
    blocker = next((v for k, v in created.items() if "art overhaul" in k.lower()
                    or "graphics" in k.lower()), None)
    blocked = next((v for k, v in created.items() if "build-a-buddy" in k.lower()), None)
    if blocker and blocked:
        bd(["dep", blocker, "--blocks", blocked])
        print(f"\n  edge: {blocker} blocks {blocked}  (art overhaul -> Build-a-Buddy)")
    else:
        print(f"\n  ! dependency not wired (blocker={blocker} blocked={blocked})")

    json.dump(created, open(".beads/migration-map.json", "w"), indent=2)
    print("  wrote .beads/migration-map.json (title -> id)")


if __name__ == "__main__":
    sys.exit(main())
