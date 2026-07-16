# Implementation Plan — Editorial redesign

## Scope

- Preserve `_pages/about.md` byte-for-byte.
- Preserve Jekyll/GitHub Pages compatibility and existing content sources.
- Implement the approved `prototype.html` visual system through the theme override layer.

## Steps

1. Save the pre-redesign state in Git and tag it `pre-redesign-2026-07-16`.
2. Create `feat/editorial-redesign` from the saved baseline and activate the Trellis task.
3. Add `_sass/_custom.scss`; import it last from `assets/css/main.scss`; update only font/color variables needed by the override.
4. Repurpose `author-profile.html` as the hero shell and add one dependency-free script for theme toggle, flow field, and semantic section markup enhancement.
5. Include the script from `head.html`; keep all motion disabled under `prefers-reduced-motion: reduce`.
6. Build with `bundle exec jekyll build` and verify `_pages/about.md` plus `_sass/vendor/**` are unchanged.
7. Run browser QA at 375, 768, and 1280px: no horizontal scroll; light/dark theme; navigation; avatar hover; reduced motion; publication/honors/project layouts.
8. Commit the redesign, fast-forward `master`, push to `origin/master`, then verify `https://hzx-coder0.github.io/` after GitHub Pages deploys.

## Rollback

- Reset or revert to tag `pre-redesign-2026-07-16`.
