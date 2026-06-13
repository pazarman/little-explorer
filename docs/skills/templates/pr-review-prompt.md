# PR Review Prompt Template

Use this in Copilot Chat before merge.

---

Review this change with a strict toddler-game quality lens.

Review goals:
- Find regressions in child flow, clarity, safety, and accessibility.
- Flag weak feedback loops and overstimulation risks.
- Verify parent trust protections (settings/reset gating).
- Verify mobile and PWA behavior risks.

Use these standards:
- docs/skills/01-product-quality-bar.md
- docs/skills/02-learning-design-skill.md
- docs/skills/03-content-quality-skill.md
- docs/skills/04-accessibility-safety-skill.md
- docs/skills/05-release-gate-skill.md

Output format:
1. Findings by severity with exact file locations.
2. Gaps in tests and validation.
3. Ship/no-ship recommendation.
