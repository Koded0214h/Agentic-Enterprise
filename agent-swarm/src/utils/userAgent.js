"use strict";
/**
 * User-Agent string helpers.
 *
 * Kept dependency-free so SDK-bundled code (bridge, cli/transports) can
 * import without pulling in auth.ts and its transitive dependency tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClaudeCodeUserAgent = getClaudeCodeUserAgent;
function getClaudeCodeUserAgent() {
    return "claude-code/".concat(MACRO.VERSION);
}
