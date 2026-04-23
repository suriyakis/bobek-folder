import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [, , taskPath, outputPathArg] = process.argv;

function fail(message) {
 console.error(message);
 process.exit(1);
}

function runGit(args, cwd) {
 return execFileSync("git", args, {
  cwd,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
 }).trim();
}

if (!taskPath) {
 fail("Usage: node src/worker/repo-inspect-worker.mjs <task-json-path> [result-json-path]");
}

const task = JSON.parse(fs.readFileSync(taskPath, "utf8"));

if (task.type !== "repo.inspect") {
 fail("Only repo.inspect is supported");
}

if (!task.repo?.slug || !task.repo?.localPath) {
 fail("Task repo.slug and repo.localPath are required");
}

const repoPath = task.repo.localPath;
const resultPath = outputPathArg ?? `${taskPath}.result.json`;
const startedAt = new Date().toISOString();
const repoExists = fs.existsSync(repoPath);

if (!repoExists) {
 fs.mkdirSync(path.dirname(repoPath), { recursive: true });
 runGit(["clone", `https://github.com/${task.repo.slug}.git`, repoPath], process.cwd());
}

const currentBranch = runGit(["branch", "--show-current"], repoPath);
const gitStatusText = runGit(["status", "--short"], repoPath);
const latestCommitText = runGit(["log", "-1", "--pretty=format:%H%n%s"], repoPath);
const detectedFiles = fs.readdirSync(repoPath).filter((name) => name !== ".git").sort();
const [commitSha = "", commitMessage = ""] = latestCommitText.split("\n");
const finishedAt = new Date().toISOString();

const result = {
 ok: true,
 taskId: task.id,
 type: "repo.inspect",
 host: "hetzner",
 repo: {
  slug: task.repo.slug,
  branch: task.repo.branch ?? null,
  localPath: repoPath
 },
 summary: `Read-only inspection completed for ${task.repo.slug}`,
 details: {
  repoExists: true,
  currentBranch,
  gitStatus: gitStatusText || "clean",
  latestCommit: {
   sha: commitSha,
   message: commitMessage
  },
  detectedFiles
 },
 workerId: "hetzner-1",
 logPath: `/srv/bobek/logs/task-${task.id}.log`,
 artifactDir: "/srv/bobek/artifacts",
 error: null,
 startedAt,
 finishedAt
};

fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
console.log(resultPath);
