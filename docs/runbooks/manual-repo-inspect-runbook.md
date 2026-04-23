# RUNBOOK: MANUAL REPO.INSPECT

## Purpose
Repeat the first successful manual end-to-end workflow with the fewest steps.

## Preconditions
- PC available as control plane
- Hetzner reachable as worker
- Hetzner paths exist:
  - `/srv/bobek/data`
  - `/srv/bobek/repos`
  - `/srv/bobek/logs`
  - `/srv/bobek/artifacts`
- SQLite available on Hetzner
- `git` available on Hetzner
- one safe repo chosen for inspection

## Steps
1. Create a new `repo.inspect` task payload on the PC.
2. Insert the task into Hetzner task state with status `queued`.
3. On Hetzner, read the queued task.
4. Set task status to `running`.
5. Ensure the repo is locally available under `/srv/bobek/repos`.
6. Run read-only inspection checks:
   - repo exists
   - current branch
   - git status
   - latest commit
   - key build/package files detected
7. Write execution metadata:
   - `workerId`
   - `logPath`
   - `artifactDir`
8. Write the result payload.
9. Set task status to `done` or `failed`.
10. From the PC, read back final task status and result.

## Success Criteria
- task moves `queued -> running -> done`
- result payload is present
- result includes `workerId`, `logPath`, and `artifactDir`
- repository inspection remains read-only

## Failure Checks
If the run fails, check:
- wrong Hetzner DB path
- repo access/auth issues
- incorrect local repo path mapping
- missing log/artifact directories
- malformed task/result payload shape
