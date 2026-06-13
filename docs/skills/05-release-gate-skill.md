# Skill 05: Release Gate

Run this before each deployment.

## Functional Checks

- Core navigation works across all scenes.
- No blocked progression in any game.
- Settings persist correctly after reload.
- PWA install and launch succeed.

## Quality Checks

- Adaptive difficulty behaves as expected.
- Hint ladder escalates correctly and resets each round.
- Audio levels and toggles work consistently.
- Parent gate and reset flow are safe.

## Device Checks

- At least one iOS browser test.
- At least one Android browser test.
- Installed PWA test on a mobile device.
- Offline behavior sanity check.

## Ship Decision

- Ship only if no critical child-journey blocker exists.
- If blocked, record issue, owner, and fix plan before release.
