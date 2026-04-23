export interface ResultPayload {
 ok: boolean;
 taskId: number | string;
 type: string;
 host: string;
 summary: string;
 details?: Record<string, unknown>;
 workerId?: string | null;
 logPath?: string | null;
 artifactDir?: string | null;
 error?: string | null;
 startedAt?: string | null;
 finishedAt?: string | null;
}
