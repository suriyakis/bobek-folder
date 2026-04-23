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
);
