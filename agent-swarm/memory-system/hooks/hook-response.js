"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STANDARD_HOOK_RESPONSE = void 0;
/**
 * Standard hook response for all hooks.
 * Tells Claude Code to continue processing and suppress the hook's output.
 *
 * Note: SessionStart uses context-hook.ts which constructs its own response
 * with hookSpecificOutput for context injection.
 */
exports.STANDARD_HOOK_RESPONSE = JSON.stringify({
    continue: true,
    suppressOutput: true
});
