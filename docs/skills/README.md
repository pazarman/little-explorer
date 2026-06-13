# Reusable Skills Kit

This folder defines reusable "skills" for maintaining high content and product quality in Little Explorer.

Use these files before implementing a feature, before merging a pull request, and before releasing.

## Skills

- `01-product-quality-bar.md`
  - Non-negotiable standards for toddler game quality.
- `02-learning-design-skill.md`
  - How to design and evaluate learning interactions.
- `03-content-quality-skill.md`
  - Voice script, tone, and language quality controls.
- `04-accessibility-safety-skill.md`
  - Sensory safety, touch ergonomics, and parent controls.
- `05-release-gate-skill.md`
  - Final pre-ship quality gate.

## Templates

- `templates/feature-kickoff-prompt.md`
  - Prompt to plan a new feature against all quality bars.
- `templates/pr-review-prompt.md`
  - Prompt to review a code change critically before merge.
- `templates/post-release-retro-prompt.md`
  - Prompt for post-release learning and iteration.

## Recommended Workflow

1. Start with `templates/feature-kickoff-prompt.md`.
2. Build the feature.
3. Run `templates/pr-review-prompt.md` before merging.
4. Run `05-release-gate-skill.md` checks before deploying.
5. Run `templates/post-release-retro-prompt.md` after launch.
