# MVP CONTRACT

## Objective
Prove a minimal two-node architecture where the PC submits tasks and Hetzner executes them with durable task state and structured results.

## Final Scope
Included:
- PC as control plane only
- Hetzner as worker and task state authority
- SQLite on Hetzner at `/srv/bobek/data/tasks.db`
- public task types: `system.health`, `repo.inspect`
- read-only repo inspection only
- structured task result payloads

Excluded:
- multi-agent logic
- browser automation
- code-editing tasks
- PR creation
- public `repo.sync`

## First Runnable Slice
A read-only `repo.inspect` task:
1. submitted from PC
2. stored on Hetzner
3. executed on Hetzner
4. repo made locally available if needed as internal worker behavior
5. read-only inspection performed
6. result persisted and returned

## Success Condition
The system can complete `system.health` and `repo.inspect` tasks end-to-end with correct lifecycle state and structured output.
