# PROJECT_PLAN

## Project Definition
Build a two-node AI work system that delivers a practical, lower-cost Manus-like workflow: the PC acts as the OpenClaw control plane and operator cockpit, while Hetzner acts as the always-on remote worker for read-only repo inspection and worker health execution. The first version proves remote task orchestration, durable task tracking, and structured result return without multi-agent logic, browser automation, or code editing.

## Final MVP Scope
In scope:
- single orchestrator on PC
- single remote worker on Hetzner
- durable task storage on Hetzner SQLite
- public task types: `system.health`, `repo.inspect`
- structured task result payloads
- end-to-end status tracking

Out of scope:
- multi-agent routing
- browser automation
- code editing
- pull requests
- autonomous task chains
- separate public `repo.sync` task type

## First Runnable Slice
Read-only remote repo inspection:
1. submit `repo.inspect` from PC
2. persist task on Hetzner at `/srv/bobek/data/tasks.db`
3. dispatch task to Hetzner worker
4. worker ensures repo is locally available if needed as internal behavior
5. worker performs read-only inspection
6. worker writes structured result
7. task reaches `done` or `failed`
8. PC reads final result

## Recommended Stack
- OpenClaw on PC as control plane
- OpenClaw-connected worker on Hetzner
- TypeScript / Node.js
- SQLite on Hetzner at `/srv/bobek/data/tasks.db`
- local `git` on Hetzner
- GitHub fine-grained PAT with read-only repo access
- markdown + JSON contract files

## Milestones
- [ ] Finalize MVP contract documents
- [ ] Define task schema and payload schema in project docs
- [ ] Define Hetzner storage and repo layout
- [x] Build task persistence layer against local SQLite for implementation step 1
- [x] Build local CLI task creation/list/show flow for implementation step 1
- [ ] Build task persistence layer against Hetzner SQLite
- [ ] Build `system.health` task execution path
- [ ] Build `repo.inspect` read-only execution path
- [ ] Return structured task results to PC
- [ ] Validate end-to-end on one test repository

## Implementation Update
Implementation step 1 now works:
- local task DB created
- CLI can create `system.health`
- CLI can create `repo.inspect`
- CLI can list tasks
- CLI can show task by id

Roundtrip note:
- local task created
- task exported
- Hetzner executed read-only inspection
- result imported back
- final task marked done locally

Improved roundtrip note:
- local task created
- task exported
- Hetzner worker executed
- normalized result returned
- result imported back
- final local task marked done

Dispatch note:
- local task created
- task exported automatically
- Hetzner worker executed
- result imported back
- final local task marked done

Run note:
- `run-repo-inspect` now works end-to-end without password prompts
- `run-system-health` now works end-to-end

MVP one-command flows note:
- `run-repo-inspect`
- `run-system-health`

## Risks
- PC/Hetzner boundary may drift if contracts are vague
- repo access/auth may fail without clean GitHub credential setup
- internal clone behavior must stay read-only and predictable
- task result format must stay stable early to avoid rework
