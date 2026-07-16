# Structured content pipeline (fixed-structure source → rendered sections)

## Goal

Make homepage content **structured and machine-editable** so the other tools (paper importer,
news adder, scholar badge) can read/write it reliably, while authoring stays human-friendly.
Two directions must both work:

1. **Data → render**: structured data files drive the rendered sections on the page.
2. **Fixed-structure Markdown → extract**: content authored in a fixed-structure Markdown can be
   parsed back into the structured data (the "reverse" step the user asked for), so hand-edits in
   Markdown and tool-writes to data stay in sync.

## Approach (lazy-correct, stays in Jekyll)

- Single source of truth = **`_data/*.yml`** (Jekyll renders `_data` natively — no plugin):
  - `_data/news.yml` — list of `{date, text}`
  - `_data/publications.yml` — list of `{title, authors, venue, year, status, teaser, links:{pdf,code,project,bibtex}}`
  - `_data/honors.yml`, `_data/education.yml`, `_data/projects.yml` — simple lists.
- `_pages/about.md` sections render from these via small Liquid includes
  (`_includes/sections/publications.html`, etc.) instead of hardcoded Markdown lists.
  Prose (the About Me intro) stays as plain Markdown in `about.md`.
- **Reverse extractor**: `tools/md_to_data.py` (run via `uv run`) parses a fixed-structure
  Markdown block (the current `about.md` conventions: `# 📝 Publications`, `- **Title**. venue`,
  `- *YYYY.MM*: text` for news) into the corresponding `_data/*.yml`. This is a one-shot
  migration + an ongoing "I edited Markdown, sync it back" tool. Define the exact expected
  Markdown grammar in a docstring and keep the parser tolerant (skip malformed lines with a warning).
- **CV export**: `tools/build_cv.py` reads the same `_data/*.yml` and emits a CV. Simplest path:
  render a Markdown/HTML CV and convert with a tool already likely present; if a PDF engine is
  needed, prefer `weasyprint` or headless-chrome and gate it behind a flag. Do NOT hand-maintain
  a separate CV — it must be generated from the single source.

## Acceptance Criteria

- [ ] `_data/news.yml`, `publications.yml`, `honors.yml`, `education.yml`, `projects.yml` exist,
      populated from the current `_pages/about.md` content (no information lost).
- [ ] Homepage renders those sections from `_data` via Liquid includes; visual output matches or
      improves on the current content (coordinate styling with `redesign`).
- [ ] `uv run tools/md_to_data.py _pages/about.md` regenerates the `_data` files and is idempotent
      on already-synced content.
- [ ] `uv run tools/build_cv.py` produces a CV file (PDF or self-contained HTML) from `_data/*.yml`.
- [ ] Round-trip check: data → render and Markdown → data agree on the same content.
- [ ] One runnable self-check on the Markdown parser (offline `assert` test on a sample block).

## Notes

- This task defines the `_data/publications.yml` schema that `paper-importer` writes into and
  `redesign` styles as cards. Land the schema early; the other tasks depend on it.
- Keep `about.md` valid even mid-migration (render from `_data` OR keep Markdown, not a broken half).
