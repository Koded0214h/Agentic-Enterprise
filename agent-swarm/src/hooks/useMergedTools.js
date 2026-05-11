"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMergedTools = useMergedTools;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
var react_1 = require("react");
var tools_js_1 = require("../tools.js");
var toolPool_js_1 = require("../utils/toolPool.js");
/**
 * React hook that assembles the full tool pool for the REPL.
 *
 * Uses assembleToolPool() (the shared pure function used by both REPL and runAgent)
 * to combine built-in tools with MCP tools, applying deny rules and deduplication.
 * Any extra initialTools are merged on top.
 *
 * @param initialTools - Extra tools to include (built-in + startup MCP from props).
 *   These are merged with the assembled pool and take precedence in deduplication.
 * @param mcpTools - MCP tools discovered dynamically (from mcp state)
 * @param toolPermissionContext - Permission context for filtering
 */
function useMergedTools(initialTools, mcpTools, toolPermissionContext) {
    var replBridgeEnabled = false;
    var replBridgeOutboundOnly = false;
    return (0, react_1.useMemo)(function () {
        // assembleToolPool is the shared function that both REPL and runAgent use.
        // It handles: getTools() + MCP deny-rule filtering + dedup + MCP CLI exclusion.
        var assembled = (0, tools_js_1.assembleToolPool)(toolPermissionContext, mcpTools);
        return (0, toolPool_js_1.mergeAndFilterTools)(initialTools, assembled, toolPermissionContext.mode);
    }, [
        initialTools,
        mcpTools,
        toolPermissionContext,
        replBridgeEnabled,
        replBridgeOutboundOnly,
    ]);
}
