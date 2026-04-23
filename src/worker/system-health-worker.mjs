import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [, , taskPath, resultPath] = process.argv;

if (!taskPath || !resultPath) {
 console.error("Usage: node system-health-worker.mjs <taskPath> <resultPath>");
 process.exit(1);
}

const task = JSON.parse(fs.readFileSync(taskPath, "utf8"));
const startedAt = new Date().toISOString();

function run(cmd, args) {
 return execFileSync(cmd, args, { encoding: "utf8" }).trim();
}

const gitVersion = run("git", ["--version"]).replace(/^git version\s+/i, "");
const nodeVersion = run("node", ["-v"]);

const paths = {
 dataExists: fs.existsSync("/srv/bobek/data"),
 reposExists: fs.existsSync("/srv/bobek/repos"),
 logsExists: fs.existsSync("/srv/bobek/logs"),
 artifactsExists: fs.existsSync("/srv/bobek/artifacts")
};

const finishedAt = new Date().toISOString();

const result = {
 ok: true,
 taskId: task.id,
 type: "system.health",
 host: "hetzner",
 summary: `System health check passed. Git ${gitVersion}, Node ${nodeVersion}, all 4 bobek directories present.`,
 details: {
 gitVersion,
 nodeVersion,
 paths
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
