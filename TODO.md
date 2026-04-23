# TODO

Implementation note: step 1 now works with a local task DB and CLI support for `system.health`, `repo.inspect`, `list`, and `show` by id.

Roundtrip note: the first real PC -> Hetzner -> PC flow now works for `repo.inspect` with local create, export, Hetzner read-only execution, result import, and local final done status.

Improved roundtrip note: `repo.inspect` now also works with the normalized worker result shape through local create, export, Hetzner worker execution, normalized result return, result import, and local final done status.

Dispatch note: `dispatch-repo-inspect` now works with local task creation, automatic export, Hetzner worker execution, result import, and local final done status.

Run note: `run-repo-inspect` now works end-to-end without password prompts.
Run note: `run-system-health` now works end-to-end.

MVP one-command flows note:
- `run-repo-inspect`
- `run-system-health`

1. [ ] Finalize and freeze MVP contract documents
2. [ ] Confirm Hetzner path layout: `/srv/bobek/data`, `/srv/bobek/repos`, `/srv/bobek/logs`, `/srv/bobek/artifacts`
3. [ ] Define final task schema with execution metadata
4. [ ] Define final result payload schema with execution metadata
5. [ ] Define exact `system.health` checks for MVP
6. [ ] Define exact `repo.inspect` read-only checks for MVP
7. [ ] Decide how PC submits tasks to Hetzner in the simplest OpenClaw-native way
8. [ ] Prepare one safe test repository for inspection
9. [ ] Implement Hetzner SQLite persistence layer
10. [ ] Implement first end-to-end `system.health` run
11. [ ] Implement first end-to-end `repo.inspect` run
12. [ ] Validate structured results from Hetzner back to PC
