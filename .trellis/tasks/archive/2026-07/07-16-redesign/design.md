# Design — Ink-Wash Academic Homepage

> **Approved visual reference**: [`prototype.html`](./prototype.html) in this folder.
> It is a self-contained, working mockup rendered with the real site content and
> **signed off by the owner**. When in doubt, match the prototype pixel-for-pixel.
> This doc is the spec; the prototype is the ground truth.

## Design direction

**水墨 (ink-wash) academic** — a strictly monochrome black/white/gray system on warm
"rice-paper" ground. High contrast, refined serif headings, generous whitespace. The
only color anywhere on the page is the (future) colored publication figure — it reads
like a seal stamp on an ink painting. No accent hue, no emoji, no colored badges.

Signature element: a faint **grayscale flow-field animation** in the hero (a nod to the
owner's research on time-dependent PDEs), reading as drifting ink.

---

## Design tokens

Set these in `_sass/_variables.scss` (or a token block at the top of `_sass/_custom.scss`).
Values are the exact ones used in the prototype. Every component reads through these tokens
— never hardcode a color in a component rule.

### Light (default)
```
--paper:          #f7f7f5   /* page ground, warm off-white */
--surface:        #ffffff   /* figure placeholder / raised fills */
--ink:            #131311   /* headings, strong text, borders-strong on hover */
--body:           #26251f   /* body copy */
--muted:          #565550   /* secondary text, venue, dates */
--faint:          #8b8a83   /* tertiary: indices, icon defaults, placeholders */
--hairline:       #dad8d0   /* dividers between rows */
--hairline-strong:#bab8ae   /* control borders, avatar ring */
--wash:           #13131112 /* highlight underlay behind .hl marks */
--shadow:         0 1px 2px #1313110c, 0 8px 24px #1313110f
--shadow-lift:    0 6px 16px #13131116, 0 20px 44px #1313111f
```

### Dark
```
--paper:          #101012   --surface: #1a1a1d   --ink: #f4f3ee   --body: #dcdbd4
--muted:          #a2a199   --faint:   #6d6c65
--hairline:       #2b2b2f   --hairline-strong: #45454b   --wash: #ffffff14
--shadow:         0 1px 2px #00000038, 0 8px 24px #0000004a
--shadow-lift:    0 6px 16px #0000004a, 0 20px 44px #00000060
```

### Theme wiring
- Define light tokens on `:root`.
- Redefine dark tokens under `@media (prefers-color-scheme: dark)`.
- Redefine **both** again under `:root[data-theme="light"]` / `:root[data-theme="dark"]`
  so the manual toggle overrides the OS preference in both directions.
- The prototype ships a JS toggle button; on the Jekyll site this can stay (small inline
  script) or be dropped — the media-query default works without it. Owner preference TBD;
  default to keeping the toggle.

### Typography
```
--serif: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Cambria, Georgia, serif;
--sans:  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
--mono:  ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```
- **All system fonts — do NOT add a Google Fonts `<link>`.** The serif stack renders as
  Palatino Linotype / Cambria on Windows and Iowan/Palatino on macOS; no webfont, no
  fallback risk, no CSP issue.
- Base body: `17px / line-height 1.7`, color `--body`.
- Serif is used for: brand, hero `h1`, section `h2`, publication/education/project titles.
- `--mono` is effectively unused in the final design (no eyebrow labels) — keep the token
  for figure captions only.
- Layout width token: `--maxw: 960px`.

---

## Layout & components

Single centered column (`max-width: var(--maxw)`), horizontal padding
`clamp(1.2rem, 4vw, 2rem)` used consistently by the top bar inner, hero inner, and content
`.wrap` so everything shares one left/right edge.

### 1. Top bar (sticky)
- Full-width sticky bar, translucent `--paper` + `backdrop-filter: blur(10px)`, bottom hairline.
- **Inner content is wrapped in `.topbar-inner` (max-width `--maxw`, centered, same
  horizontal padding as the content)** so the brand aligns with the hero's left edge and the
  Theme button aligns with the content's right edge. (This alignment was an explicit fix —
  do not revert to a full-bleed flex bar.)
- Left: brand "Zhenxin Huang" (serif). Center: section nav links. Right: Theme toggle.
- Nav hidden below 760px.

### 2. Hero
- Grid `1fr auto`: text left, circular avatar right; stacks below 680px with the avatar
  moved **above** the text (`order: -1`) and centered.
- **No kicker line** above the name (removed per owner). First element is the `h1`.
- `h1`: serif, `clamp(2.8rem, 7vw, 4.4rem)`, weight 600, letter-spacing -0.022em.
- Role paragraph: `--muted`, max-width 52ch, key terms bolded to `--ink`.
- Contacts row: email / GitHub / location, each an inline-flex icon + text in `--muted`,
  hover → `--ink`. Inline SVG icons (16–17px), no icon font.
- **Flow-field canvas** behind the hero (see §7).

### 3. Avatar (with hover animation)
- 172px circle (128px on mobile), `overflow: hidden`.
- Ring: `box-shadow: 0 0 0 6px var(--paper), 0 0 0 7px var(--hairline-strong), var(--shadow-lift)`.
- Empty state: a faint person-silhouette SVG. Real photo: `<img>` with `object-fit: cover`.
- **Hover (all transitions ≤ .55s):**
  - avatar: `translateY(-4px) scale(1.03)`, ring color → `--ink`.
  - `<img>`: `filter: grayscale(1)→grayscale(0)` + `scale(1.06)` (grayscale→color reveal).
  - placeholder svg: `scale(1.08)`, color → `--muted`.
- Wrap all avatar transitions in `@media (prefers-reduced-motion: reduce)` no-op.
- On the Jekyll site the real image is `images/profile.jpg` (already in repo).

### 4. Section headings
- Serif `h2`, `1.6rem`, `display: inline-block`, with a **3px solid `--ink` bottom border**
  (a "brush stroke" underline sized to the text). Margin-bottom ~1.4rem.
- **No emoji, no icons.** (The old emoji markers were explicitly rejected.)

### 5. About
- Plain serif-headed section, sans body paragraphs, `max-width: 72ch`.
- Key research terms wrapped in `.hl`: `--ink`, weight 600, with a highlight underlay
  `box-shadow: inset 0 -0.42em 0 var(--wash)`.

### 6. News
- Borderless list. Each row: fixed 78px bold `--ink` date (tabular-nums) + `--body` text.
- Rows separated by top hairline (`li + li`).

### 7. Publications — **borderless editorial index (NOT cards)**
> This section was iterated heavily. It is **not** a card layout — no border box, no shadow,
> no rounded background. Match the prototype exactly.
- Container is a plain column; each `.pub` is a grid `30px 1fr 210px`
  (index | text | figure-on-the-right), `gap: 1.7rem`, rows split by top hairline.
- **Index**: serif numeral in `--faint` (1, 2, …).
- **Text block** (left/center): 
  - venue: `0.74rem`, weight 700, uppercase, letter-spacing 0.11em, `--muted`
    (e.g. `AAAI 2027 · In preparation`).
  - title: serif `1.15rem`, weight 600, line-height 1.34, `text-wrap: pretty`
    (small size + wide column chosen specifically to avoid awkward 3-line wrapping).
  - authors: `--muted`, owner name `Zhenxin Huang` bolded to `--ink`.
  - links: inline-flex text links with a **15px inline SVG icon each** —
    PDF (document), Code (code brackets `< >`), Project (globe), BibTeX (bookmark/book).
    `gap: 1.15rem`, icons default `--muted` → `--ink` on hover, text underlines on hover.
    **No pill buttons.**
- **Figure** (right column): `aspect-ratio: 4/3`, rounded 8px, `overflow: hidden`,
  **NO border** (border was explicitly removed), subtle gradient placeholder + faint image
  icon when empty. Real image: `<img object-fit: cover>` that scales to 1.04 on `.pub:hover`.
  When the real (colored) figure loads it is the single spot of color on the page — intended.
- Responsive ≤640px: collapse to single column, hide the index, figure `order: 2` (below text),
  `max-width: 220px`.

### 8. Honors & Awards
- **Single column** list (a two-column version was rejected for ugly wrapping).
- Each row: 52px `--muted` bold year (tabular-nums) + `--body` text, hairline between rows.

### 9. Education
- Borderless entries, grid `1fr auto`: serif title left, `--muted` date right on the same
  baseline; description spans full width below. Bold key facts to `--ink`. No card box.

### 10. Projects — clickable rows
- Each project is an `<a>` row (whole row is the link to the project URL), grid `1fr 26px`.
- Title serif `1.2rem`; description `--muted`; a `↗` (arrow-up-right) SVG in the right cell.
- Hover: row shifts `padding-left: 0.5rem`, title underlines, arrow translates `(3px,-3px)`
  and darkens to `--ink`.
- `target="_blank" rel="noopener"`. Real URLs come from project data — leave a clear
  `TODO` where a project has no link yet (fall back to the GitHub profile).

### 11. Footer
- Centered, `--faint`, small, top hairline.

---

## Motion & flow-field (hero canvas)

- `<canvas id="field">` absolutely positioned to fill the hero, `opacity ~0.4` (0.5 dark).
- Particles trace a sine/cosine flow field; stroke color = current `--ink`, `globalAlpha ≈ .15`.
- DPR-aware sizing; reseed on resize; ~`min(80, width/12)` particles.
- `prefers-reduced-motion: reduce` → render a **single static frame**, no animation loop.
- Reuse the prototype's script verbatim (it's ~40 lines, no dependencies). In Jekyll, place
  it in `assets/js/` and include via `_includes/scripts.html`, or inline in the layout.

Global motion rules:
- Scroll-reveal (`.reveal` → IntersectionObserver adds `.in`) is optional polish; disabled
  under reduced-motion. Fine to keep or drop.
- Every hover/scroll animation must no-op under `prefers-reduced-motion: reduce`.

---

## Mapping to the Jekyll implementation

Follow the constraints in `prd.md` (override layer only; do not touch `_sass/vendor/**`).

| Prototype piece | Where it goes in the repo |
|---|---|
| Token block (`:root` + dark + `[data-theme]`) | `_sass/_variables.scss` values + `_sass/_custom.scss` |
| All component CSS | new `_sass/_custom.scss`, `@import`ed **last** in `assets/css/main.scss` |
| Serif/sans/mono stacks | `_sass/_variables.scss` font vars |
| Top bar, hero, section markup | `_layouts/default.html` / `_includes/*` (masthead, sidebar → repurpose or replace) |
| Section content (About/News/Pubs/Honors/Edu/Projects) | rendered from `_pages/about.md` — ideally via the `content-pipeline` task's `_data/*.yml` + Liquid includes; until then, style the existing markdown to match |
| Avatar image | `images/profile.jpg` |
| Flow-field + toggle JS | `assets/js/` included via `_includes/scripts.html` |
| Publication figures | `images/pubs/…` (written by the `paper-importer` task) |

**Coordination**: the publication list schema (venue, title, authors, links, figure) is the
same one defined by `content-pipeline` / `paper-importer`. Land `_data/publications.yml`
there and render this section from it so the importer tool and the design share one source.

## Acceptance (in addition to prd.md)
- [ ] Rendered site matches `prototype.html` for palette, type, spacing, and every section
      layout above (spot-check pubs = borderless list, honors = single column, no emoji).
- [ ] Light **and** dark themes both correct; manual toggle (if kept) overrides OS in both directions.
- [ ] Avatar hover reveal + flow field work; both no-op under `prefers-reduced-motion`.
- [ ] `_sass/vendor/**` unmodified; `_pages/about.md` content unchanged.
