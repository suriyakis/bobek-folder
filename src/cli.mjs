import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
 classifyRoute,
 createTask,
 getTask,
 getTaskExportData,
 listTasks,
 setTaskError,
 setTaskFinishedAt,
 setTaskResultJson,
 setTaskStartedAt,
 setTaskStatus
} from "./db/index.mjs";

const [, , command, arg, ...rest] = process.argv;

// Action verbs that signal "edit/build this project" and must win over codex.review.
// Uses whole-word matching (\b) to avoid substring false positives.
const BUILD_ACTION_VERBS = [
 "implement", "build", "fix", "improve", "add", "edit",
 "change", "update", "create", "make", "write", "generate",
 "apply", "modify", "support", "enable", "integrate"
];

function resolveRoute(prompt) {
 const { route, reason } = classifyRoute(prompt);
 if (route === "codex.review") {
  const lower = prompt.toLowerCase();
  const hit = BUILD_ACTION_VERBS.find(v => new RegExp(`\\b${v}\\b`).test(lower));
  if (hit) {
   return { route: "local.build", reason: `action verb "${hit}" overrides codex.review` };
  }
 }
 return { route, reason };
}
const HETZNER_HOST = "root@195.201.16.169";

function runCommand(command, args) {
 return execFileSync(command, args, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
 }).trim();
}

function usage() {
 console.log("Usage:");
 console.log(" npm run cli -- create system.health");
 console.log(" npm run cli -- create repo.inspect");
 console.log(" npm run cli -- list");
 console.log(" npm run cli -- show <id>");
 console.log(" npm run cli -- start <id>");
 console.log(" npm run cli -- done <id>");
 console.log(" npm run cli -- fail <id> <message>");
 console.log(" npm run cli -- result <id> <summary>");
 console.log(" npm run cli -- clear-error <id>");
 console.log(" npm run cli -- export-task <id> <path>");
 console.log(" npm run cli -- import-result <id> <path>");
 console.log(" npm run cli -- dispatch-repo-inspect");
 console.log(" npm run cli -- complete-from-file <id> <resultPath>");
 console.log(" npm run cli -- run-repo-inspect");
 console.log(" npm run cli -- run-system-health");
 console.log(" npm run cli -- route \"<prompt>\"");
 console.log(" npm run cli -- do \"<prompt>\"");
}

if (!command) {
 usage();
 process.exit(1);
}

if (command === "create") {
 if (arg !== "system.health" && arg !== "repo.inspect") {
 usage();
 process.exit(1);
 }

 const task = {
 type: arg,
 targetHost: "hetzner",
 status: "queued",
 input: { readOnly: true }
 };

 if (arg === "repo.inspect") {
 task.repo = {
 slug: "octocat/Hello-World",
 branch: "master",
 localPath: "/srv/bobek/repos/octocat__Hello-World"
 };
 }

 const id = createTask(task);
 console.log(`Created task ${id}`);
 process.exit(0);
}

if (command === "list") {
 console.log(JSON.stringify(listTasks(), null, 2));
 process.exit(0);
}

if (command === "show") {
 const id = Number(arg);
 if (!id) {
 usage();
 process.exit(1);
 }
 console.log(JSON.stringify(getTask(id), null, 2));
 process.exit(0);
}

if (command === "start") {
 const id = Number(arg);
 if (!id) {
 usage();
 process.exit(1);
 }

 setTaskStatus(id, "running");
 setTaskStartedAt(id, new Date().toISOString());
 console.log(`Started task ${id}`);
 process.exit(0);
}

if (command === "done") {
 const id = Number(arg);
 if (!id) {
 usage();
 process.exit(1);
 }

 setTaskStatus(id, "done");
 setTaskFinishedAt(id, new Date().toISOString());
 setTaskError(id, null);
 console.log(`Completed task ${id}`);
 process.exit(0);
}

if (command === "fail") {
 const id = Number(arg);
 const message = rest.join(" ");
 if (!id || !message) {
 usage();
 process.exit(1);
 }

 setTaskStatus(id, "failed");
 setTaskFinishedAt(id, new Date().toISOString());
 setTaskError(id, message);
 console.log(`Failed task ${id}`);
 process.exit(0);
}

if (command === "result") {
 const id = Number(arg);
 const summary = rest.join(" ");
 if (!id || !summary) {
 usage();
 process.exit(1);
 }

 setTaskResultJson(id, {
  ok: true,
  taskId: id,
  summary
 });
 console.log(`Stored result for task ${id}`);
 process.exit(0);
}

if (command === "clear-error") {
 const id = Number(arg);
 if (!id) {
  usage();
  process.exit(1);
 }

 setTaskError(id, null);
 console.log(`Cleared error for task ${id}`);
 process.exit(0);
}

if (command === "export-task") {
 const id = Number(arg);
 const filePath = rest.join(" ");
 if (!id || !filePath) {
  usage();
  process.exit(1);
 }

 const task = getTaskExportData(id);
 if (!task) {
  console.log(`Task ${id} not found`);
  process.exit(1);
 }

 fs.mkdirSync(path.dirname(filePath), { recursive: true });
 fs.writeFileSync(filePath, JSON.stringify(task, null, 2));
 console.log(`Exported task ${id}`);
 process.exit(0);
}

if (command === "import-result") {
 const id = Number(arg);
 const filePath = rest.join(" ");
 if (!id || !filePath) {
  usage();
  process.exit(1);
 }

 const result = JSON.parse(fs.readFileSync(filePath, "utf8"));
 setTaskResultJson(id, result);
 console.log(`Imported result for task ${id}`);
 process.exit(0);
}

if (command === "dispatch-repo-inspect") {
 const id = createTask({
  type: "repo.inspect",
  targetHost: "hetzner",
  status: "queued",
  input: { readOnly: true },
  repo: {
   slug: "octocat/Hello-World",
   branch: "master",
   localPath: "/srv/bobek/repos/octocat__Hello-World"
  }
 });

 const task = getTaskExportData(id);
 const filePath = path.join("out", `task-${id}.json`);
 fs.mkdirSync(path.dirname(filePath), { recursive: true });
 fs.writeFileSync(filePath, JSON.stringify(task, null, 2));
 console.log(`${id} ${filePath}`);
 process.exit(0);
}

if (command === "complete-from-file") {
 const id = Number(arg);
 const filePath = rest.join(" ");
 if (!id || !filePath) {
  usage();
  process.exit(1);
 }

 const result = JSON.parse(fs.readFileSync(filePath, "utf8"));
 setTaskResultJson(id, result);
 setTaskStatus(id, "done");
 setTaskFinishedAt(id, new Date().toISOString());
 setTaskError(id, null);
 console.log(`Completed task ${id} from file`);
 process.exit(0);
}

if (command === "run-repo-inspect") {
 const id = createTask({
  type: "repo.inspect",
  targetHost: "hetzner",
  status: "queued",
  input: { readOnly: true },
  repo: {
   slug: "octocat/Hello-World",
   branch: "master",
   localPath: "/srv/bobek/repos/octocat__Hello-World"
  }
 });

 const task = getTaskExportData(id);
 const localTaskPath = path.join("out", `task-${id}.json`);
 const localResultPath = path.join("out", `task-${id}-result.json`);
 const remoteTaskPath = `/srv/bobek/state/task-${id}.json`;
 const remoteResultPath = `/srv/bobek/artifacts/task-${id}-result.json`;
 const remoteWorkerPath = "/srv/bobek/repo-inspect-worker.mjs";

 fs.mkdirSync(path.dirname(localTaskPath), { recursive: true });
 fs.writeFileSync(localTaskPath, JSON.stringify(task, null, 2));

 runCommand("scp", [localTaskPath, `${HETZNER_HOST}:${remoteTaskPath}`]);
 runCommand("ssh", [HETZNER_HOST, `node ${remoteWorkerPath} ${remoteTaskPath} ${remoteResultPath}`]);
 runCommand("scp", [`${HETZNER_HOST}:${remoteResultPath}`, localResultPath]);

 const result = JSON.parse(fs.readFileSync(localResultPath, "utf8"));
 setTaskResultJson(id, result);
 setTaskStatus(id, "done");
 setTaskFinishedAt(id, new Date().toISOString());
 setTaskError(id, null);
 console.log(`${id} ${localResultPath}`);
 process.exit(0);
}

if (command === "run-system-health") {
 const id = createTask({
  type: "system.health",
  targetHost: "hetzner",
  status: "queued",
  input: { readOnly: true }
 });

 const task = getTaskExportData(id);
 const localTaskPath = path.join("out", `task-${id}.json`);
 const localResultPath = path.join("out", `task-${id}-result.json`);
 const remoteTaskPath = `/srv/bobek/state/task-${id}.json`;
 const remoteResultPath = `/srv/bobek/artifacts/task-${id}-result.json`;
 const remoteWorkerPath = "/srv/bobek/system-health-worker.mjs";

 fs.mkdirSync(path.dirname(localTaskPath), { recursive: true });
 fs.writeFileSync(localTaskPath, JSON.stringify(task, null, 2));

 runCommand("scp", [localTaskPath, `${HETZNER_HOST}:${remoteTaskPath}`]);
 runCommand("ssh", [HETZNER_HOST, `node ${remoteWorkerPath} ${remoteTaskPath} ${remoteResultPath}`]);
 runCommand("scp", [`${HETZNER_HOST}:${remoteResultPath}`, localResultPath]);

 const result = JSON.parse(fs.readFileSync(localResultPath, "utf8"));
 setTaskResultJson(id, result);
 setTaskStatus(id, "done");
 setTaskFinishedAt(id, new Date().toISOString());
 setTaskError(id, null);
 console.log(`${id} ${localResultPath}`);
 process.exit(0);
}

if (command === "do") {
 if (!arg) {
  console.error("Usage: npm run cli -- do \"<prompt>\"");
  process.exit(1);
 }

 const doPrompt = [arg, ...rest].join(" ");
 const { route } = resolveRoute(doPrompt);

 if (route === "local.build") {
  const ts = Date.now();
  const outPath = path.join("out", `local-build-${ts}.txt`);
  fs.mkdirSync("out", { recursive: true });

  // Capture full path after "at " (preserves spaces); fall back to cwd if not found
  const atMatch = doPrompt.match(/\bat\s+(.+)$/i);
  let targetPath = null;
  if (atMatch) {
    const candidate = atMatch[1].trim().replace(/^["']|["']$/g, "");
    if (fs.existsSync(candidate)) {
      targetPath = candidate;
    }
  }
  const cdTarget = targetPath ?? process.cwd();

  const lines = [
   `You are inside ${cdTarget}.`,
   `Apply this task directly:`,
   doPrompt,
   `Do not ask for file names if they can be found in the current project.`,
   `Reply only: DONE`
  ];

  fs.writeFileSync(outPath, lines.join("\n") + "\n");

  const absOutPath = path.resolve(outPath);
  const cmdPath = path.join("out", `open-local-build-${ts}.cmd`);
  const absCmdPath = path.resolve(cmdPath);
  const cmdLines = [
   `@echo off`,
   `cd /d "${cdTarget}"`,
   `type "${absOutPath}" | clip`,
   `start notepad "${absOutPath}"`,
   `start cmd /k openclaw tui`
  ];
  fs.writeFileSync(cmdPath, cmdLines.join("\r\n") + "\r\n");

  execFileSync("cmd", ["/c", absCmdPath], { stdio: "ignore" });

  console.log("ACTION:      local.build");
  console.log("MODEL:       anthropic/claude-sonnet-4-6");
  console.log(`TARGET:      ${cdTarget}`);
  console.log(`PROMPT_FILE: ${outPath}`);
  console.log(`OPEN_CMD:    ${cmdPath}`);
  console.log("EXECUTED:    yes");
  process.exit(0);
 }

 if (route === "codex.review") {
  const ts = Date.now();
  const outPath = path.join("out", `codex-review-${ts}.txt`);
  fs.mkdirSync("out", { recursive: true });

  const cdTarget = process.cwd();

  const lines = [
   `You are inside ${cdTarget}.`,
   `This is a review and analysis task. Do not edit files unless explicitly asked.`,
   `Use your full reasoning. Apply it to the following:`,
   doPrompt,
   `Provide a structured analysis. Reply when done.`
  ];

  fs.writeFileSync(outPath, lines.join("\n") + "\n");

  const absOutPath = path.resolve(outPath);
  const cmdPath = path.join("out", `open-codex-review-${ts}.cmd`);
  const absCmdPath = path.resolve(cmdPath);
  const cmdLines = [
   `@echo off`,
   `cd /d "${cdTarget}"`,
   `type "${absOutPath}" | clip`,
   `start notepad "${absOutPath}"`,
   `start cmd /k openclaw tui`
  ];
  fs.writeFileSync(cmdPath, cmdLines.join("\r\n") + "\r\n");

  execFileSync("cmd", ["/c", absCmdPath], { stdio: "ignore" });

  console.log("ACTION:      codex.review");
  console.log("MODEL:       openai-codex/gpt-5.4");
  console.log(`TARGET:      ${cdTarget}`);
  console.log(`PROMPT_FILE: ${outPath}`);
  console.log(`OPEN_CMD:    ${cmdPath}`);
  console.log("EXECUTED:    yes");
  process.exit(0);
 }

 if (route === "remote.worker") {
  const isRepoInspect = doPrompt.toLowerCase().includes("inspect repo");

  if (isRepoInspect) {
   const id = createTask({
    type: "repo.inspect",
    targetHost: "hetzner",
    status: "queued",
    input: { readOnly: true },
    repo: {
     slug: "octocat/Hello-World",
     branch: "master",
     localPath: "/srv/bobek/repos/octocat__Hello-World"
    }
   });

   const task = getTaskExportData(id);
   const localTaskPath = path.join("out", `task-${id}.json`);
   const localResultPath = path.join("out", `task-${id}-result.json`);
   const remoteTaskPath = `/srv/bobek/state/task-${id}.json`;
   const remoteResultPath = `/srv/bobek/artifacts/task-${id}-result.json`;
   const remoteWorkerPath = "/srv/bobek/repo-inspect-worker.mjs";

   fs.mkdirSync(path.dirname(localTaskPath), { recursive: true });
   fs.writeFileSync(localTaskPath, JSON.stringify(task, null, 2));

   setTaskStatus(id, "running");
   setTaskStartedAt(id, new Date().toISOString());

   runCommand("scp", [localTaskPath, `${HETZNER_HOST}:${remoteTaskPath}`]);
   runCommand("ssh", [HETZNER_HOST, `node ${remoteWorkerPath} ${remoteTaskPath} ${remoteResultPath}`]);
   runCommand("scp", [`${HETZNER_HOST}:${remoteResultPath}`, localResultPath]);

   const result = JSON.parse(fs.readFileSync(localResultPath, "utf8"));
   setTaskResultJson(id, result);
   setTaskStatus(id, "done");
   setTaskFinishedAt(id, new Date().toISOString());
   setTaskError(id, null);

   console.log("ACTION:      remote.worker");
   console.log(`TASK_ID:     ${id}`);
   console.log(`RESULT_PATH: ${localResultPath}`);
  } else {
   const id = createTask({
    type: "system.health",
    targetHost: "hetzner",
    status: "queued",
    input: { readOnly: true }
   });

   const task = getTaskExportData(id);
   const localTaskPath = path.join("out", `task-${id}.json`);
   const localResultPath = path.join("out", `task-${id}-result.json`);
   const remoteTaskPath = `/srv/bobek/state/task-${id}.json`;
   const remoteResultPath = `/srv/bobek/artifacts/task-${id}-result.json`;
   const remoteWorkerPath = "/srv/bobek/system-health-worker.mjs";

   fs.mkdirSync(path.dirname(localTaskPath), { recursive: true });
   fs.writeFileSync(localTaskPath, JSON.stringify(task, null, 2));

   setTaskStatus(id, "running");
   setTaskStartedAt(id, new Date().toISOString());

   runCommand("scp", [localTaskPath, `${HETZNER_HOST}:${remoteTaskPath}`]);
   runCommand("ssh", [HETZNER_HOST, `node ${remoteWorkerPath} ${remoteTaskPath} ${remoteResultPath}`]);
   runCommand("scp", [`${HETZNER_HOST}:${remoteResultPath}`, localResultPath]);

   const result = JSON.parse(fs.readFileSync(localResultPath, "utf8"));
   setTaskResultJson(id, result);
   setTaskStatus(id, "done");
   setTaskFinishedAt(id, new Date().toISOString());
   setTaskError(id, null);

   console.log("ACTION:      remote.worker");
   console.log(`TASK_ID:     ${id}`);
   console.log(`RESULT_PATH: ${localResultPath}`);
  }

  process.exit(0);
 }
}

if (command === "route") {
 if (!arg) {
  console.error("Usage: npm run cli -- route \"<prompt>\"");
  process.exit(1);
 }

 const prompt = [arg, ...rest].join(" ");
 const { route, reason } = resolveRoute(prompt);
 console.log(`Route:  ${route}`);
 console.log(`Reason: ${reason}`);
 process.exit(0);
}

usage();
process.exit(1);
