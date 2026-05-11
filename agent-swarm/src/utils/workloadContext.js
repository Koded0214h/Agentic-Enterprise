"use strict";
/**
 * Turn-scoped workload tag via AsyncLocalStorage.
 *
 * WHY a separate module from bootstrap/state.ts:
 * bootstrap is transitively imported by src/entrypoints/browser-sdk.ts, and
 * the browser bundle cannot import Node's async_hooks. This module is only
 * imported from CLI/SDK code paths that never end up in the browser build.
 *
 * WHY AsyncLocalStorage (not a global mutable slot):
 * void-detached background agents (executeForkedSlashCommand, AgentTool)
 * yield at their first await. The parent turn's synchronous continuation —
 * including any `finally` block — runs to completion BEFORE the detached
 * closure resumes. A global setWorkload('cron') at the top of the closure
 * is deterministically clobbered. ALS captures context at invocation time
 * and survives every await in that chain, isolated from the parent. Same
 * pattern as agentContext.ts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKLOAD_CRON = void 0;
exports.getWorkload = getWorkload;
exports.runWithWorkload = runWithWorkload;
var async_hooks_1 = require("async_hooks");
exports.WORKLOAD_CRON = 'cron';
var workloadStorage = new async_hooks_1.AsyncLocalStorage();
function getWorkload() {
    var _a;
    return (_a = workloadStorage.getStore()) === null || _a === void 0 ? void 0 : _a.workload;
}
/**
 * Wrap `fn` in a workload ALS context. ALWAYS establishes a new context
 * boundary, even when `workload` is undefined.
 *
 * The previous implementation short-circuited on `undefined` with
 * `return fn()` — but that's a pass-through, not a boundary. If the caller
 * is already inside a leaked cron context (REPL: queryGuard.end() →
 * _notify() → React subscriber → scheduled re-render captures ALS at
 * scheduling time → useQueueProcessor effect → executeQueuedInput → here),
 * a pass-through lets `getWorkload()` inside `fn` return the leaked tag.
 * Once leaked, it's sticky forever: every turn's end-notify re-propagates
 * the ambient context to the next turn's scheduling chain.
 *
 * Always calling `.run()` guarantees `getWorkload()` inside `fn` returns
 * exactly what the caller passed — including `undefined`.
 */
function runWithWorkload(workload, fn) {
    return workloadStorage.run({ workload: workload }, fn);
}
