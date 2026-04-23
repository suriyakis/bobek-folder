# Manual proof 01

Status: successful

What was proven:
- PC used as control plane
- Hetzner used as worker
- one manual read-only `repo.inspect` task completed
- one manual `system.health` task completed
- lifecycle reached `queued -> running -> done`
- structured results were produced with `workerId`, `logPath`, and `artifactDir`

What is not proven here:
- automation loop
- retries
- concurrent execution
- code editing

Implementation step 1 note:
- local task DB created
- CLI can create `system.health`
- CLI can create `repo.inspect`
- CLI can list tasks
- CLI can show task by id

Roundtrip note for `repo.inspect`:
- local task created
- task exported
- Hetzner executed read-only inspection
- result imported back
- final task marked done locally

Improved roundtrip note for `repo.inspect`:
- local task created
- task exported
- Hetzner worker executed
- normalized result returned
- result imported back
- final local task marked done

Dispatch note for `dispatch-repo-inspect`:
- local task created
- task exported automatically
- Hetzner worker executed
- result imported back
- final local task marked done

Run note for `run-repo-inspect`:
- end-to-end flow now works without password prompts

Run note for `run-system-health`:
- end-to-end flow now works

MVP one-command flows note:
- `run-repo-inspect`
- `run-system-health`
