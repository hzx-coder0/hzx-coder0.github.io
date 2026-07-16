# Editorial redesign of academic homepage

## Goal

Restyle the site from the stock AcadHomepage/Minimal-Mistakes look into a distinctive
**editorial / minimalist academic** design, **without leaving Jekyll or breaking the
GitHub Pages build**. Content in `_pages/about.md` stays untouched; this is a pure
presentation-layer change.

## Constraints (read first — do not violate)

- Do **NOT** fork or edit vendor theme files under `_sass/vendor/**`.
- Do **NOT** rewrite the whole theme. Work through an **override layer**:
  - Add `_sass/_custom.scss` and import it **last** in `assets/css/main.scss`
    (after every existing `@import`, so overrides win).
  - Edit design tokens in `_sass/_variables.scss` only (colors, fonts, type scale).
  - Font loading: add `<link>` tags in `_includes/head.html` (or under `_includes/head/`).
- Must build cleanly with GitHub Pages `--safe` mode (no new plugins).
- `sass: style: compressed` is on — keep SCSS valid.
- Respect `prefers-reduced-motion`: all animations disabled under it.

## Design system (target)

**The full, owner-approved design system lives in [`design.md`](./design.md), with a
working reference mockup in [`prototype.html`](./prototype.html).** Read those first — they
supersede any earlier direction. Summary:

- **水墨 (ink-wash) monochrome**: black / white / warm-gray only. No accent hue, no emoji,
  no colored badges. The single spot of color is the (future) colored publication figure.
- **Type**: system serif stack (Palatino/Iowan/Cambria — **no Google Fonts**) for headings;
  system sans for body at 17px/1.7.
- **Layout**: single 960px centered column; sticky top bar whose inner content shares the
  content column's edges; hero with circular avatar (animated hover reveal) + grayscale
  flow-field canvas.
- **Sections**: ink-underlined serif headings; **publications = borderless editorial index
  (not cards)** with figure on the right and icon text-links; honors = single column;
  projects = clickable rows. See `design.md` for exact specs.

## Acceptance Criteria

- [ ] `bundle exec jekyll build` succeeds with no new SCSS errors/warnings.
- [ ] Changes confined to `_sass/_custom.scss`, `_sass/_variables.scss`, `assets/css/main.scss`,
      `_includes/head*.html`, optionally `_includes/sidebar.html`/`author-profile.html` + one
      small JS file. `_sass/vendor/**` unmodified (verify `git diff --stat`).
- [ ] Homepage matches `prototype.html`: ink-wash monochrome, serif ink-underlined headings,
      borderless publication index, single-column honors, circular animated avatar.
- [ ] Responsive: no horizontal scroll at 375 / 768 / 1280px; sidebar collapses gracefully.
- [ ] `prefers-reduced-motion: reduce` disables all animations.
- [ ] `_pages/about.md` content unchanged (diff shows no content edits).

## Notes

- Publication card action links depend on structured data — coordinate with `content-pipeline`.
  If that lands first, cards read from its data source; otherwise style the existing markdown
  list as cards via CSS + a Liquid include.
- Reference `taste-skill` / `minimalist-skill` design language when executing.
