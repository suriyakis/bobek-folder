import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TaskRecord } from "../types/task.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");
const dataDir = path.join(rootDir, "data");
const dbPath = path.join(dataDir, "tasks.db");
const schemaPath = path.join(__dirname, "schema.sql");

fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(dbPath);
db.exec(fs.readFileSync(schemaPath, "utf8"));

export function createTask(task: TaskRecord): number {
 const stmt = db.prepare(`
 INSERT INTO tasks (
 type, target_host, status, repo_json, input_json, result_json, error, created_at, started_at, finished_at
 ) VALUES (
 @type, @target_host, @status, @repo_json, @input_json, @result_json, @error, @created_at, @started_at, @finished_at
 )
 `);

 const info = stmt.run({
 type: task.type,
 target_host: task.targetHost,
 status: task.status,
 repo_json: task.repo ? JSON.stringify(task.repo) : null,
 input_json: task.input ? JSON.stringify(task.input) : null,
 result_json: task.result ?? null,
 error: task.error ?? null,
 created_at: task.createdAt ?? new Date().toISOString(),
 started_at: task.startedAt ?? null,
 finished_at: task.finishedAt ?? null
 });

 return Number(info.lastInsertRowid);
}

export function listTasks() {
 return db.prepare(`SELECT id, type, target_host, status, created_at FROM tasks ORDER BY id DESC`).all();
}

export function getTask(id: number) {
 return db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(id);
}
