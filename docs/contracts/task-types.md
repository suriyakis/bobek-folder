# TASK TYPES

## Public MVP Task Types

### `system.health`
Purpose:
- verify the Hetzner worker is reachable and minimally ready

Expected checks may include:
- worker process environment reachable
- SQLite path available
- git available
- repo root available
- log/artifact roots available

### `repo.inspect`
Purpose:
- perform read-only inspection of a repository on Hetzner

Expected checks may include:
- repo local availability
- current branch
- git status summary
- latest commit
- detected build/package files

## Explicitly Not Public Task Types Yet
- `repo.sync`
- code edit tasks
- test execution tasks
- deploy tasks

If cloning is required for inspection, it is internal worker behavior under `repo.inspect`.
