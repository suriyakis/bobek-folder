# ROUTING.md — Bobek Agentic Routing Rules

These rules govern how Bobek decides what to do when given a natural-language request.
They are the authoritative source. Do not override them without updating this file.

---

## Routes

### local.build
**Use when:** the task is to change, build, fix, improve, add, implement, or edit anything in
the current project — including Bobek itself.

**Behaviour:**
- Inspect files directly (read tool)
- Edit files directly (edit/write tools)
- Run relevant tests directly (exec tool)
- Do NOT generate handoff prompt-files or .cmd launchers unless explicitly asked
- Never delegate a self-edit task away from local.build

**Triggers (whole-word):** implement, build, fix, improve, add, edit, change, update, create,
make, write, generate, apply, modify, support, enable, integrate

### remote.worker
**Use when:** the task targets the Hetzner worker — repo inspection, system health, or
anything that requires SSH / remote execution.

**Behaviour:**
- Use the existing CLI automation (`run-repo-inspect`, `run-system-health`, or the `do` command)
- Never try to inline-execute these locally

**Triggers:** hetzner, server, health, repo.inspect, worker, ssh, remote, system, inspect,
background, deploy, vps, run-system, run-repo

### codex.review
**Use when:** the task is purely analytical — architecture review, refactor reasoning,
code audit, explaining something difficult — with no editing intent.

**Behaviour:**
- Writes a review-framed prompt file (`out/codex-review-<ts>.txt`) with a structured
  analysis preamble and the full prompt
- Creates a launcher `out/open-codex-review-<ts>.cmd` that copies the prompt to clipboard,
  opens it in notepad, and opens openclaw TUI — then executes it automatically
- Prints ACTION / MODEL / TARGET / PROMPT_FILE / OPEN_CMD / EXECUTED: yes (same shape as local.build)
- Do NOT claim this route if any build/change action verb is present

**Triggers:** debug, refactor, architecture, review, analyze, analyse, reasoning, difficult,
hard, complex, understand, explain, audit

---

## Precedence Rules

1. **Self-edit always wins as local.build.**
   Any request that asks Bobek to improve/change/build Bobek → `local.build`, no exceptions.

2. **Action verb beats codex.review.**
   If the best-scoring route is `codex.review` but a build action verb is present
   (whole-word match), reroute to `local.build`.
   Reason text: `action verb "<verb>" overrides codex.review`

3. **Ties go to the route with the higher keyword score.**
   If scores tie, prefer `local.build` > `codex.review` > `remote.worker`.

4. **No match → local.build.**
   Default to `local.build` with reason `no keywords matched`.

---

## Conceptual Test Cases

| Prompt | Expected route | Why |
|---|---|---|
| improve the router so it can execute codex.review automatically later | `local.build` | "improve" is a build action verb |
| inspect repo on Hetzner | `remote.worker` | "inspect" + "hetzner" both score remote.worker |
| analyze architecture and review refactor | `codex.review` | pure analysis, no build verb |
| change Bobek so review tasks can execute automatically | `local.build` | "change" is a build verb; self-edit rule also applies |
| build support for automatic review routing | `local.build` | "build" verb present; "review" alone doesn't override |
