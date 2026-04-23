# Manual repo.inspect runbook

1. Create a `repo.inspect` task on the PC.
2. Store it on Hetzner with status `queued`.
3. On Hetzner, mark it `running`.
4. Ensure the repo exists under `/srv/bobek/repos`.
5. Run read-only checks: branch, status, latest commit, key files.
6. Write `workerId`, `logPath`, `artifactDir`, and the result payload.
7. Mark the task `done`.
8. Read the final result from the PC.

Success = `queued -> running -> done` with no repo modifications.
