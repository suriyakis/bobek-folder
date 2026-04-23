# TASK LIFECYCLE

## Allowed States
- `queued`
- `running`
- `done`
- `failed`
- `cancelled`

## State Rules
- A new task starts in `queued`
- The worker moves the task to `running` when execution begins
- The worker moves the task to `done` on success
- The worker moves the task to `failed` on execution error
- `cancelled` is reserved for explicit stop behavior

## Ownership
Hetzner is the source of truth for lifecycle state because the task database lives on Hetzner.
