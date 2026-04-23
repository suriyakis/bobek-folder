export type TaskStatus = "queued" | "running" | "done" | "failed" | "cancelled";
export type TaskType = "system.health" | "repo.inspect";

export interface RepoInfo {
 slug: string;
 branch?: string;
 localPath?: string;
}

export interface TaskRecord {
 id?: number;
 type: TaskType;
 targetHost: string;
 status: TaskStatus;
 repo?: RepoInfo | null;
 input?: Record<string, unknown> | null;
 result?: string | null;
 error?: string | null;
 createdAt?: string;
 startedAt?: string | null;
 finishedAt?: string | null;
}
