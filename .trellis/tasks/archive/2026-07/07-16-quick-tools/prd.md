# Quick news add + local preview/deploy scripts

## Goal

Cut daily maintenance friction to one command each: add a dated News entry, and preview the
site locally before deploying.

## Requirements

### 1. News adder — `tools/add_news.py` (run via `uv run`)

```
uv run tools/add_news.py "Paper accepted at NeurIPS 2026" [--date 2026.09]
```

- Prepends a `{date, text}` entry to `_data/news.yml` (the `content-pipeline` source of truth).
  If `content-pipeline` hasn't landed yet, insert a `- *YYYY.MM*: text` line at the top of the
  `# 🔥 News` list in `_pages/about.md` instead. Detect which mode applies by file existence.
- `--date` defaults to the current year-month in the site's existing `YYYY.MM` format.
- Idempotent-safe: don't duplicate an identical entry; keep newest-first ordering.

### 2. Local preview + deploy — `tools/preview.sh` and `tools/deploy.sh`

- `preview.sh`: wraps `bundle exec jekyll serve --livereload` (the repo already has
  `run_server.sh` — reuse/replace it, don't add a parallel mechanism). Prints the local URL.
- `deploy.sh`: `git add -A && git commit` (Conventional Commits message from `$1`) `&& git push`.
  Refuse to run on a dirty merge state; show `git status` before pushing. Keep it a thin wrapper —
  no custom deploy logic (GitHub Pages builds on push).

## Constraints

- Reuse `run_server.sh` rather than inventing a new preview path.
- Windows-friendly: the user is on Windows/PowerShell + Git Bash. Provide the `.sh` scripts for
  Git Bash; if trivial, also note the PowerShell one-liner in comments. Don't build a cross-shell
  abstraction — YAGNI.
- Commit messages follow Conventional Commits (user convention).

## Acceptance Criteria

- [ ] `uv run tools/add_news.py "test entry"` adds a correctly-dated newest-first entry to the
      right target (`_data/news.yml` or `about.md`) and does not duplicate on re-run.
- [ ] `tools/preview.sh` serves the site locally with livereload and prints the URL.
- [ ] `tools/deploy.sh "docs: update news"` commits with that message and pushes; aborts cleanly
      on a dirty/conflicted tree.
- [ ] One offline `assert` self-check on the news date-formatting/dedup logic.

## Notes

- Coordinates with `content-pipeline` for the `_data/news.yml` schema. Order of landing doesn't
  matter — the adder auto-detects the target.
