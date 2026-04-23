import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");
const dataDir = path.join(rootDir, "data");
const dbPath = path.join(dataDir, "tasks.db");

fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 type TEXT NOT NULL,
 target_host TEXT NOT NULL,
 status TEXT NOT NULL,
 repo_json TEXT,
 input_json TEXT,
 result_json TEXT,
 error TEXT,
 created_at TEXT NOT NULL,
 started_at TEXT,
 finished_at TEXT
)
`);

export function createTask(task) {
 const stmt = db.prepare(`
 INSERT INTO tasks (
 type, target_host, status, repo_json, input_json, result_json, error, created_at, started_at, finished_at
 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
 `);

 const result = stmt.run(
 task.type,
 task.targetHost,
 task.status,
 task.repo ? JSON.stringify(task.repo) : null,
 task.input ? JSON.stringify(task.input) : null,
 task.result ? JSON.stringify(task.result) : null,
 task.error ?? null,
 task.createdAt ?? new Date().toISOString(),
 task.startedAt ?? null,
 task.finishedAt ?? null
 );

 return Number(result.lastInsertRowid);
}

export function listTasks() {
 return db.prepare(`
 SELECT id, type, target_host, status, created_at
 FROM tasks
 ORDER BY id DESC
 `).all();
}

export function getTask(id) {
 return db.prepare(`
 SELECT *
 FROM tasks
 WHERE id = ?
 `).get(id);
}

export function setTaskStatus(id, status) {
 db.prepare(`
 UPDATE tasks
 SET status = ?
 WHERE id = ?
 `).run(status, id);
}

export function setTaskStartedAt(id, startedAt) {
 db.prepare(`
 UPDATE tasks
 SET started_at = ?
 WHERE id = ?
 `).run(startedAt, id);
}

export function setTaskFinishedAt(id, finishedAt) {
 db.prepare(`
 UPDATE tasks
 SET finished_at = ?
 WHERE id = ?
 `).run(finishedAt, id);
}

export function setTaskError(id, error) {
 db.prepare(`
 UPDATE tasks
 SET error = ?
 WHERE id = ?
 `).run(error, id);
}

export function setTaskResultJson(id, result) {
 db.prepare(`
 UPDATE tasks
 SET result_json = ?
 WHERE id = ?
 `).run(result ? JSON.stringify(result) : null, id);
}

function parseJson(value) {
 return value ? JSON.parse(value) : null;
}

export function getTaskExportData(id) {
 const task = getTask(id);
 if (!task) {
  return null;
 }

 return {
  id: task.id,
  type: task.type,
  targetHost: task.target_host,
  status: task.status,
  repo: parseJson(task.repo_json),
  input: parseJson(task.input_json),
  createdAt: task.created_at,
  startedAt: task.started_at,
  finishedAt: task.finished_at
 };
}
