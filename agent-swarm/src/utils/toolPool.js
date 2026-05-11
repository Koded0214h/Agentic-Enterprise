"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrActivitySubscriptionTool = isPrActivitySubscriptionTool;
exports.applyCoordinatorToolFilter = applyCoordinatorToolFilter;
exports.mergeAndFilterTools = mergeAndFilterTools;
var bun_bundle_1 = require("bun:bundle");
var partition_js_1 = require("lodash-es/partition.js");
var uniqBy_js_1 = require("lodash-es/uniqBy.js");
var tools_js_1 = require("../constants/tools.js");
var utils_js_1 = require("../services/mcp/utils.js");
// MCP tool name suffixes for PR activity subscription. These are lightweight
// orchestration actions the coordinator calls directly rather than delegating
// to workers. Matched by suffix since the MCP server name prefix may vary.
var PR_ACTIVITY_TOOL_SUFFIXES = [
    'subscribe_pr_activity',
    'unsubscribe_pr_activity',
];
function isPrActivitySubscriptionTool(name) {
    return PR_ACTIVITY_TOOL_SUFFIXES.some(function (suffix) { return name.endsWith(suffix); });
}
// Dead code elimination: conditional imports for feature-gated modules
/* eslint-disable @typescript-eslint/no-require-imports */
var coordinatorModeModule = (0, bun_bundle_1.feature)('COORDINATOR_MODE')
    ? require('../coordinator/coordinatorMode.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
/**
 * Filters a tool array to the set allowed in coordinator mode.
 * Shared between the REPL path (mergeAndFilterTools) and the headless
 * path (main.tsx) so both stay in sync.
 *
 * PR activity subscription tools are always allowed since subscription
 * management is orchestration.
 */
function applyCoordinatorToolFilter(tools) {
    return tools.filter(function (t) {
        return tools_js_1.COORDINATOR_MODE_ALLOWED_TOOLS.has(t.name) ||
            isPrActivitySubscriptionTool(t.name);
    });
}
/**
 * Pure function that merges tool pools and applies coordinator mode filtering.
 *
 * Lives in a React-free file so print.ts can import it without pulling
 * react/ink into the SDK module graph. The useMergedTools hook delegates
 * to this function inside useMemo.
 *
 * @param initialTools - Extra tools to include (built-in + startup MCP from props).
 * @param assembled - Tools from assembleToolPool (built-in + MCP, deduped).
 * @param mode - The permission context mode.
 * @returns Merged, deduplicated, and coordinator-filtered tool array.
 */
function mergeAndFilterTools(initialTools, assembled, mode) {
    // Merge initialTools on top - they take precedence in deduplication.
    // initialTools may include built-in tools (from getTools() in REPL.tsx) which
    // overlap with assembled tools. uniqBy handles this deduplication.
    // Partition-sort for prompt-cache stability (same as assembleToolPool):
    // built-ins must stay a contiguous prefix for the server's cache policy.
    var _a = (0, partition_js_1.default)((0, uniqBy_js_1.default)(__spreadArray(__spreadArray([], initialTools, true), assembled, true), 'name'), utils_js_1.isMcpTool), mcp = _a[0], builtIn = _a[1];
    var byName = function (a, b) { return a.name.localeCompare(b.name); };
    var tools = __spreadArray(__spreadArray([], builtIn.sort(byName), true), mcp.sort(byName), true);
    if ((0, bun_bundle_1.feature)('COORDINATOR_MODE') && coordinatorModeModule) {
        if (coordinatorModeModule.isCoordinatorMode()) {
            return applyCoordinatorToolFilter(tools);
        }
    }
    return tools;
}
