# PROVEN VS UNPROVEN

## Proven
- The two-node model can be exercised manually.
- The PC can serve as control plane.
- Hetzner can serve as worker.
- A read-only `repo.inspect` task can complete successfully.
- Task state can be treated as Hetzner-owned source of truth.
- A structured result can be produced after task execution.
- The documented lifecycle can reach `queued -> running -> done`.

## Still Unproven
- Automated task submission flow
- Automated task pickup/execution loop
- Application-level SQLite persistence logic
- Robust error handling and retries
- `system.health` end-to-end execution
- Private repo auth reliability across repeated runs
- Repeated run consistency
- Concurrency behavior
- Cancellation behavior
- Log and artifact conventions in real implementation
- Result ingestion/display workflow on the PC in implemented form
- Production hardening, monitoring, and recovery behavior

## Interpretation
The architecture has one successful manual proof. It is validated conceptually, but not yet implemented or hardened as an application.
