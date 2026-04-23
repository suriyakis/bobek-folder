import { createTask, getTask, listTasks } from "./db/index.js";
import type { TaskRecord } from "./types/task.js";

const [, , command, arg] = process.argv;

function usage() {
 console.log("Usage:");
 console.log(" npm run cli -- create system.health");
 console.log(" npm run cli -- create repo.inspect");
 console.log(" npm run cli -- list");
 console.log(" npm run cli -- show <id>");
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

 const task: TaskRecord = {
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

usage();
process.exit(1);
