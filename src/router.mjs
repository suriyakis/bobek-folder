/**
 * router.mjs — single source of truth for prompt routing.
 *
 * Both cli.mjs and the Bobek Panel backend import resolveRoute from here.
 * Do not duplicate this logic elsewhere.
 *
 * Routes:
 *   local.build   — coding/editing task for a local agent (Claude, Codex, etc.)
 *   codex.review  — read-only review/analysis task
 *   remote.worker — dispatch to Hetzner worker via SSH
 */

import { classifyRoute } from "./db/index.mjs";

/**
 * Action verbs that signal an edit/build intent.
 * When classifyRoute returns codex.review but the prompt contains one of
 * these verbs at a word boundary, the route is overridden to local.build.
 *
 * Extend this list here — never in cli.mjs or the backend.
 */
export const BUILD_ACTION_VERBS = [
  "implement", "build", "fix", "improve", "add", "edit",
  "change", "update", "create", "make", "write", "generate",
  "apply", "modify", "support", "enable", "integrate"
];

/**
 * Resolve the final route for a prompt.
 *
 * @param {string} prompt  Raw user prompt.
 * @returns {{ route: string, reason: string }}
 */
export function resolveRoute(prompt) {
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
