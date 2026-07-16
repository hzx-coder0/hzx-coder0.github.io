# Google Scholar citation sync

## Goal

Restore automatic Google Scholar citation syncing and surface a live **citation badge** on the
homepage, reusing the existing (currently dormant) infrastructure.

## Current state (verified)

- `google_scholar_crawler/main.py` already fetches an author via `scholarly`, writes
  `results/gs_data.json` and `results/gs_data_shieldsio.json`.
- `_includes/fetch_google_scholar_stats.html` already reads
  `.../google-scholar-stats/gs_data.json` at runtime and fills `#total_cit` +
  `.show_paper_citations` elements.
- **Missing pieces**: no GitHub Actions workflow runs the crawler; no `google-scholar-stats`
  branch exists; `_config.yml` `author.googlescholar` is empty; there's no visible badge element
  in the rendered page.

## Requirements

- Add `.github/workflows/google-scholar-stats.yml`:
  - Scheduled (`cron`, e.g. daily) + manual `workflow_dispatch`.
  - Installs `google_scholar_crawler/requirements.txt`, runs `main.py` with env
    `GOOGLE_SCHOLAR_ID` (from repo secret/var), and pushes `results/*` to a dedicated
    `google-scholar-stats` branch (do not pollute `master`).
  - Use a maintained action for the branch push (e.g. `peaceiris/actions-gh-pages` or a plain
    `git` push to an orphan branch). Pin action versions.
- Wire the badge into the page: a citation count element (`#total_cit`) in the sidebar or
  Publications header, styled per `redesign`. Ensure `_includes/fetch_google_scholar_stats.html`
  is actually included (via `scripts.html` or the layout).
- Set `author.googlescholar` in `_config.yml` and document where `GOOGLE_SCHOLAR_ID` comes from.

## Acceptance Criteria

- [ ] Workflow file exists, is valid YAML, and runs `main.py` on schedule + manual dispatch.
- [ ] Workflow pushes `gs_data.json` to the `google-scholar-stats` branch without touching `master`.
- [ ] A citation badge renders on the homepage and populates from the fetched JSON.
- [ ] `GOOGLE_SCHOLAR_ID` is read from a secret/var, never hardcoded.
- [ ] README documents the one-time setup (set `GOOGLE_SCHOLAR_ID`, enable Actions).

## Notes / priority

- **Lower priority**: the owner currently has manuscripts in preparation and may not have a
  populated Scholar profile yet. Build the pipeline so it's ready, but the badge should degrade
  gracefully (hide or show `--` when data/ID is absent) rather than showing a broken widget.
- Depends on `redesign` only for where/how the badge is styled; functionally independent.
