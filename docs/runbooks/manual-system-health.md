# Manual system.health runbook

1. Create a `system.health` task on the PC.
2. Store it on Hetzner with status `queued`.
3. On Hetzner, mark it `running`.
4. Check basic worker readiness:
   - task DB path exists
   - repo root exists
   - log root exists
   - artifact root exists
   - `git` is available
5. Write `workerId`, `logPath`, `artifactDir`, and the result payload.
6. Mark the task `done`.
7. Read the final result from the PC.

Success = `queued -> running -> done` with all required checks passing.
