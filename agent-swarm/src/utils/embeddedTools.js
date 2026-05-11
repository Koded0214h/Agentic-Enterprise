"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasEmbeddedSearchTools = hasEmbeddedSearchTools;
exports.embeddedSearchToolsBinaryPath = embeddedSearchToolsBinaryPath;
var envUtils_js_1 = require("./envUtils.js");
/**
 * Whether this build has bfs/ugrep embedded in the bun binary (ant-native only).
 *
 * When true:
 * - `find` and `grep` in Claude's Bash shell are shadowed by shell functions
 *   that invoke the bun binary with argv0='bfs' / argv0='ugrep' (same trick
 *   as embedded ripgrep)
 * - The dedicated Glob/Grep tools are removed from the tool registry
 * - Prompt guidance steering Claude away from find/grep is omitted
 *
 * Set as a build-time define in scripts/build-with-plugins.ts for ant-native builds.
 */
function hasEmbeddedSearchTools() {
    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.EMBEDDED_SEARCH_TOOLS))
        return false;
    var e = process.env.CLAUDE_CODE_ENTRYPOINT;
    return (e !== 'sdk-ts' && e !== 'sdk-py' && e !== 'sdk-cli' && e !== 'local-agent');
}
/**
 * Path to the bun binary that contains the embedded search tools.
 * Only meaningful when hasEmbeddedSearchTools() is true.
 */
function embeddedSearchToolsBinaryPath() {
    return process.execPath;
}
