# SYSTEM_ARCHITECTURE

## Overview
This project uses a simple two-node architecture.

- **PC** = OpenClaw control plane, operator interface, task submission point, and result viewer
- **Hetzner** = always-on remote worker, task source of truth, repo execution host, and result producer

The design goal is to prove remote task orchestration with the fewest moving parts.

## Core Architecture

### 1. Control Plane (PC)
Responsibilities:
- accept operator requests
- create task requests
- send tasks to Hetzner
- read task status and final results
- avoid owning persistent task state

### 2. Worker Plane (Hetzner)
Responsibilities:
- own task storage in SQLite
- execute tasks
- maintain task lifecycle transitions
- access local repo working copies
- write logs and result payloads

### 3. Task Storage
Task state source of truth lives on Hetzner:
- database: `/srv/bobek/data/tasks.db`

This keeps the worker authoritative for execution state while the PC remains the control plane.

### 4. Repo Workspace on Hetzner
Repos live under:
- `/srv/bobek/repos`

Mapping rule:
- `owner/repo` -> `/srv/bobek/repos/owner__repo`

Any cloning needed for `repo.inspect` is internal worker behavior, not a public task type.

## MVP Task Types
Public task types for MVP:
- `system.health`
- `repo.inspect`

Excluded for now:
- `repo.sync`
- any code-edit task
- browser or UI automation
- multi-agent task distribution

## Task Lifecycle
Allowed states:
- `queued`
- `running`
- `done`
- `failed`
- `cancelled`

## Execution Metadata
Both task records and task results must minimally support:
- `workerId`
- `logPath`
- `artifactDir`

## GitHub Authentication
Use a GitHub fine-grained PAT with read-only access to selected repositories.

## Directory Mapping
- `docs/contracts/` — contract definitions for MVP behavior
- `src/` — future implementation
- `tests/` — future validation
- `docs/` — project documentation

## Implementation Principle
Do the smallest thing that proves the architecture:
- persist task on Hetzner
- run one read-only task
- return one structured result
