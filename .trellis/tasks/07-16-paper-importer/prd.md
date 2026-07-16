# Paper importer: parse arxiv/conference link into publication entry

## Goal

A small local CLI: paste an **arXiv or conference URL** (or arXiv ID / DOI), auto-fetch
**title, authors, venue/year, abstract, and a teaser figure**, then generate a publication
entry and insert it into the site. Turns "add a paper" from manual copy-paste into one command.

## Constraints / laziness rules

- Single Python script under `tools/paper_importer.py`, run via `uv run` (user's stack is `uv`).
- **Reuse existing sources before scraping HTML**:
  - arXiv → the official **arXiv Atom API** (`export.arxiv.org/api/query`) for title/authors/
    abstract/date. No HTML scraping needed for metadata.
  - DOI / conference → **Crossref REST API** (`api.crossref.org/works/{doi}`) and/or the
    OpenReview API for OpenReview links.
  - Teaser figure: for arXiv, pull the first figure from the paper — simplest reliable path is
    the arXiv PDF first-page render or the first image in the HTML (ar5iv) version. Downloading
    the source tarball and grabbing the first `\includegraphics` is a fallback, not the default.
- Dependencies: stdlib `urllib` + `xml.etree` cover arXiv/Crossref JSON/Atom. Only add a dep
  (e.g. `pymupdf` for PDF first-page render) if the teaser truly needs it — gate it behind the
  `--teaser` mode and document it. Do not add a heavy scraping stack.
- Network calls need a timeout, a descriptive User-Agent, and graceful failure (print what was
  fetched, skip what failed — never crash the whole import on a missing abstract).

## Behavior

```
uv run tools/paper_importer.py <url-or-id> [--teaser] [--dry-run]
```

1. Detect source type (arXiv / DOI / OpenReview) from the input.
2. Fetch metadata; normalize authors to `First Last, First Last` and bold the site owner
   (`Zhenxin Huang`) if present.
3. Optionally download a teaser image into `images/pubs/<slug>.<ext>` (`--teaser`).
4. Emit a publication entry in the site's data format (see `content-pipeline` — write to the
   same `_data/publications.yml` if that task landed; otherwise print a ready-to-paste Markdown
   block for `_pages/about.md`'s `# 📝 Publications` section).
5. `--dry-run` prints the result without writing files.

## Acceptance Criteria

- [ ] `uv run tools/paper_importer.py https://arxiv.org/abs/1706.03762` prints correct
      title ("Attention Is All You Need"), all authors, year, and abstract.
- [ ] Accepts bare arXiv IDs (`1706.03762`), `/abs/`, `/pdf/`, and `arxiv.org` URLs.
- [ ] A DOI/Crossref link resolves title + authors + venue + year.
- [ ] `--teaser` saves an image under `images/pubs/` and references it in the emitted entry;
      absence of a figure degrades gracefully (entry still generated, no teaser).
- [ ] Writes into the content-pipeline data file when present, else prints paste-ready Markdown.
- [ ] `--dry-run` writes nothing.
- [ ] One runnable self-check (`assert`-based `--self-test` or `tests/test_paper_importer.py`)
      covers URL/ID parsing and author normalization offline (no network in the test).

## Notes

- Owner name to bold: `Zhenxin Huang` (`_config.yml` → `author.name`).
- Keep secrets out; these APIs need no keys.
