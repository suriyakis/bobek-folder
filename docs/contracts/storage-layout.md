# STORAGE LAYOUT

## Source of Truth
Task state source of truth lives on Hetzner.

## Paths on Hetzner
- task database: `/srv/bobek/data/tasks.db`
- repo root: `/srv/bobek/repos`
- logs root: `/srv/bobek/logs`
- artifacts root: `/srv/bobek/artifacts`

## Repo Mapping Rule
- `owner/repo` -> `/srv/bobek/repos/owner__repo`

## Notes
- The PC does not host the authoritative task database
- Hetzner owns execution metadata and result persistence
- `logPath` should point under `/srv/bobek/logs`
- `artifactDir` should point under `/srv/bobek/artifacts`
