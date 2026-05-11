"use strict";
/**
 * Tool Search utilities for dynamically discovering deferred tools.
 *
 * When enabled, deferred tools (MCP and shouldDefer tools) are sent with
 * defer_loading: true and discovered via ToolSearchTool rather than being
 * loaded upfront.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
exports.getAutoToolSearchCharThreshold = getAutoToolSearchCharThreshold;
exports.getToolSearchMode = getToolSearchMode;
exports.modelSupportsToolReference = modelSupportsToolReference;
exports.isToolSearchEnabledOptimistic = isToolSearchEnabledOptimistic;
exports.isToolSearchToolAvailable = isToolSearchToolAvailable;
exports.isToolSearchEnabled = isToolSearchEnabled;
exports.isToolReferenceBlock = isToolReferenceBlock;
exports.extractDiscoveredToolNames = extractDiscoveredToolNames;
exports.isDeferredToolsDeltaEnabled = isDeferredToolsDeltaEnabled;
exports.getDeferredToolsDelta = getDeferredToolsDelta;
var memoize_js_1 = require("lodash-es/memoize.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var index_js_1 = require("../services/analytics/index.js");
var Tool_js_1 = require("../Tool.js");
var prompt_js_1 = require("../tools/ToolSearchTool/prompt.js");
var analyzeContext_js_1 = require("./analyzeContext.js");
var array_js_1 = require("./array.js");
var betas_js_1 = require("./betas.js");
var context_js_1 = require("./context.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var providers_js_1 = require("./model/providers.js");
var slowOperations_js_1 = require("./slowOperations.js");
var zodToJsonSchema_js_1 = require("./zodToJsonSchema.js");
/**
 * Default percentage of context window at which to auto-enable tool search.
 * When MCP tool descriptions exceed this percentage (in tokens), tool search is enabled.
 * Can be overridden via ENABLE_TOOL_SEARCH=auto:N where N is 0-100.
 */
var DEFAULT_AUTO_TOOL_SEARCH_PERCENTAGE = 10; // 10%
/**
 * Parse auto:N syntax from ENABLE_TOOL_SEARCH env var.
 * Returns the percentage clamped to 0-100, or null if not auto:N format or not a number.
 */
function parseAutoPercentage(value) {
    if (!value.startsWith('auto:'))
        return null;
    var percentStr = value.slice(5);
    var percent = parseInt(percentStr, 10);
    if (isNaN(percent)) {
        (0, debug_js_1.logForDebugging)("Invalid ENABLE_TOOL_SEARCH value \"".concat(value, "\": expected auto:N where N is a number."));
        return null;
    }
    // Clamp to valid range
    return Math.max(0, Math.min(100, percent));
}
/**
 * Check if ENABLE_TOOL_SEARCH is set to auto mode (auto or auto:N).
 */
function isAutoToolSearchMode(value) {
    if (!value)
        return false;
    return value === 'auto' || value.startsWith('auto:');
}
/**
 * Get the auto-enable percentage from env var or default.
 */
function getAutoToolSearchPercentage() {
    var value = process.env.ENABLE_TOOL_SEARCH;
    if (!value)
        return DEFAULT_AUTO_TOOL_SEARCH_PERCENTAGE;
    if (value === 'auto')
        return DEFAULT_AUTO_TOOL_SEARCH_PERCENTAGE;
    var parsed = parseAutoPercentage(value);
    if (parsed !== null)
        return parsed;
    return DEFAULT_AUTO_TOOL_SEARCH_PERCENTAGE;
}
/**
 * Approximate chars per token for MCP tool definitions (name + description + input schema).
 * Used as fallback when the token counting API is unavailable.
 */
var CHARS_PER_TOKEN = 2.5;
/**
 * Get the token threshold for auto-enabling tool search for a given model.
 */
function getAutoToolSearchTokenThreshold(model) {
    var betas = (0, betas_js_1.getMergedBetas)(model);
    var contextWindow = (0, context_js_1.getContextWindowForModel)(model, betas);
    var percentage = getAutoToolSearchPercentage() / 100;
    return Math.floor(contextWindow * percentage);
}
/**
 * Get the character threshold for auto-enabling tool search for a given model.
 * Used as fallback when the token counting API is unavailable.
 */
function getAutoToolSearchCharThreshold(model) {
    return Math.floor(getAutoToolSearchTokenThreshold(model) * CHARS_PER_TOKEN);
}
/**
 * Get the total token count for all deferred tools using the token counting API.
 * Memoized by deferred tool names — cache is invalidated when MCP servers connect/disconnect.
 * Returns null if the API is unavailable (caller should fall back to char heuristic).
 */
var getDeferredToolTokenCount = (0, memoize_js_1.default)(function (tools, getToolPermissionContext, agents, model) { return __awaiter(void 0, void 0, void 0, function () {
    var deferredTools, total, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                deferredTools = tools.filter(function (t) { return (0, prompt_js_1.isDeferredTool)(t); });
                if (deferredTools.length === 0)
                    return [2 /*return*/, 0];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, analyzeContext_js_1.countToolDefinitionTokens)(deferredTools, getToolPermissionContext, { activeAgents: agents, allAgents: agents }, model)];
            case 2:
                total = _b.sent();
                if (total === 0)
                    return [2 /*return*/, null]; // API unavailable
                return [2 /*return*/, Math.max(0, total - analyzeContext_js_1.TOOL_TOKEN_COUNT_OVERHEAD)];
            case 3:
                _a = _b.sent();
                return [2 /*return*/, null]; // Fall back to char heuristic
            case 4: return [2 /*return*/];
        }
    });
}); }, function (tools) {
    return tools
        .filter(function (t) { return (0, prompt_js_1.isDeferredTool)(t); })
        .map(function (t) { return t.name; })
        .join(',');
});
/**
 * Determines the tool search mode from ENABLE_TOOL_SEARCH.
 *
 *   ENABLE_TOOL_SEARCH    Mode
 *   auto / auto:1-99      tst-auto
 *   true / auto:0         tst
 *   false / auto:100      standard
 *   (unset)               tst (default: always defer MCP and shouldDefer tools)
 */
function getToolSearchMode() {
    // CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS is a kill switch for beta API
    // features. Tool search emits defer_loading on tool definitions and
    // tool_reference content blocks — both require the API to accept a beta
    // header. When the kill switch is set, force 'standard' so no beta shapes
    // reach the wire, even if ENABLE_TOOL_SEARCH is also set. This is the
    // explicit escape hatch for proxy gateways that the heuristic in
    // isToolSearchEnabledOptimistic doesn't cover.
    // github.com/anthropics/claude-code/issues/20031
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS)) {
        return 'standard';
    }
    var value = process.env.ENABLE_TOOL_SEARCH;
    // Handle auto:N syntax - check edge cases first
    var autoPercent = value ? parseAutoPercentage(value) : null;
    if (autoPercent === 0)
        return 'tst'; // auto:0 = always enabled
    if (autoPercent === 100)
        return 'standard';
    if (isAutoToolSearchMode(value)) {
        return 'tst-auto'; // auto or auto:1-99
    }
    if ((0, envUtils_js_1.isEnvTruthy)(value))
        return 'tst';
    if ((0, envUtils_js_1.isEnvDefinedFalsy)(process.env.ENABLE_TOOL_SEARCH))
        return 'standard';
    return 'tst'; // default: always defer MCP and shouldDefer tools
}
/**
 * Default patterns for models that do NOT support tool_reference.
 * New models are assumed to support tool_reference unless explicitly listed here.
 */
var DEFAULT_UNSUPPORTED_MODEL_PATTERNS = ['haiku'];
/**
 * Get the list of model patterns that do NOT support tool_reference.
 * Can be configured via GrowthBook for live updates without code changes.
 */
function getUnsupportedToolReferencePatterns() {
    try {
        // Try to get from GrowthBook for live configuration
        var patterns = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_tool_search_unsupported_models', null);
        if (patterns && Array.isArray(patterns) && patterns.length > 0) {
            return patterns;
        }
    }
    catch (_a) {
        // GrowthBook not ready, use defaults
    }
    return DEFAULT_UNSUPPORTED_MODEL_PATTERNS;
}
/**
 * Check if a model supports tool_reference blocks (required for tool search).
 *
 * This uses a negative test: models are assumed to support tool_reference
 * UNLESS they match a pattern in the unsupported list. This ensures new
 * models work by default without code changes.
 *
 * Currently, Haiku models do NOT support tool_reference. This can be
 * updated via GrowthBook feature 'tengu_tool_search_unsupported_models'.
 *
 * @param model The model name to check
 * @returns true if the model supports tool_reference, false otherwise
 */
function modelSupportsToolReference(model) {
    var normalizedModel = model.toLowerCase();
    var unsupportedPatterns = getUnsupportedToolReferencePatterns();
    // Check if model matches any unsupported pattern
    for (var _i = 0, unsupportedPatterns_1 = unsupportedPatterns; _i < unsupportedPatterns_1.length; _i++) {
        var pattern = unsupportedPatterns_1[_i];
        if (normalizedModel.includes(pattern.toLowerCase())) {
            return false;
        }
    }
    // New models are assumed to support tool_reference
    return true;
}
/**
 * Check if tool search *might* be enabled (optimistic check).
 *
 * Returns true if tool search could potentially be enabled, without checking
 * dynamic factors like model support or threshold. Use this for:
 * - Including ToolSearchTool in base tools (so it's available if needed)
 * - Preserving tool_reference fields in messages (can be stripped later)
 * - Checking if ToolSearchTool should report itself as enabled
 *
 * Returns false only when tool search is definitively disabled (standard mode).
 *
 * For the definitive check that includes model support and threshold,
 * use isToolSearchEnabled().
 */
var loggedOptimistic = false;
function isToolSearchEnabledOptimistic() {
    var mode = getToolSearchMode();
    if (mode === 'standard') {
        if (!loggedOptimistic) {
            loggedOptimistic = true;
            (0, debug_js_1.logForDebugging)("[ToolSearch:optimistic] mode=".concat(mode, ", ENABLE_TOOL_SEARCH=").concat(process.env.ENABLE_TOOL_SEARCH, ", result=false"));
        }
        return false;
    }
    // tool_reference is a beta content type that third-party API gateways
    // (ANTHROPIC_BASE_URL proxies) typically don't support. When the provider
    // is 'firstParty' but the base URL points elsewhere, the proxy will reject
    // tool_reference blocks with a 400. Vertex/Bedrock/Foundry are unaffected —
    // they have their own endpoints and beta headers.
    // https://github.com/anthropics/claude-code/issues/30912
    //
    // HOWEVER: some proxies DO support tool_reference (LiteLLM passthrough,
    // Cloudflare AI Gateway, corp gateways that forward beta headers). The
    // blanket disable breaks defer_loading for those users — all MCP tools
    // loaded into main context instead of on-demand (gh-31936 / CC-457,
    // likely the real cause of CC-330 "v2.1.70 defer_loading regression").
    // This gate only applies when ENABLE_TOOL_SEARCH is unset/empty (default
    // behavior). Setting any non-empty value — 'true', 'auto', 'auto:N' —
    // means the user is explicitly configuring tool search and asserts their
    // setup supports it. The falsy check (rather than === undefined) aligns
    // with getToolSearchMode(), which also treats "" as unset.
    if (!process.env.ENABLE_TOOL_SEARCH &&
        (0, providers_js_1.getAPIProvider)() === 'firstParty' &&
        !(0, providers_js_1.isFirstPartyAnthropicBaseUrl)()) {
        if (!loggedOptimistic) {
            loggedOptimistic = true;
            (0, debug_js_1.logForDebugging)("[ToolSearch:optimistic] disabled: ANTHROPIC_BASE_URL=".concat(process.env.ANTHROPIC_BASE_URL, " is not a first-party Anthropic host. Set ENABLE_TOOL_SEARCH=true (or auto / auto:N) if your proxy forwards tool_reference blocks."));
        }
        return false;
    }
    if (!loggedOptimistic) {
        loggedOptimistic = true;
        (0, debug_js_1.logForDebugging)("[ToolSearch:optimistic] mode=".concat(mode, ", ENABLE_TOOL_SEARCH=").concat(process.env.ENABLE_TOOL_SEARCH, ", result=true"));
    }
    return true;
}
/**
 * Check if ToolSearchTool is available in the provided tools list.
 * If ToolSearchTool is not available (e.g., disallowed via disallowedTools),
 * tool search cannot function and should be disabled.
 *
 * @param tools Array of tools with a 'name' property
 * @returns true if ToolSearchTool is in the tools list, false otherwise
 */
function isToolSearchToolAvailable(tools) {
    return tools.some(function (tool) { return (0, Tool_js_1.toolMatchesName)(tool, prompt_js_1.TOOL_SEARCH_TOOL_NAME); });
}
/**
 * Calculate total deferred tool description size in characters.
 * Includes name, description text, and input schema to match what's actually sent to the API.
 */
function calculateDeferredToolDescriptionChars(tools, getToolPermissionContext, agents) {
    return __awaiter(this, void 0, void 0, function () {
        var deferredTools, sizes;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    deferredTools = tools.filter(function (t) { return (0, prompt_js_1.isDeferredTool)(t); });
                    if (deferredTools.length === 0)
                        return [2 /*return*/, 0];
                    return [4 /*yield*/, Promise.all(deferredTools.map(function (tool) { return __awaiter(_this, void 0, void 0, function () {
                            var description, inputSchema;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tool.prompt({
                                            getToolPermissionContext: getToolPermissionContext,
                                            tools: tools,
                                            agents: agents,
                                        })];
                                    case 1:
                                        description = _a.sent();
                                        inputSchema = tool.inputJSONSchema
                                            ? (0, slowOperations_js_1.jsonStringify)(tool.inputJSONSchema)
                                            : tool.inputSchema
                                                ? (0, slowOperations_js_1.jsonStringify)((0, zodToJsonSchema_js_1.zodToJsonSchema)(tool.inputSchema))
                                                : '';
                                        return [2 /*return*/, tool.name.length + description.length + inputSchema.length];
                                }
                            });
                        }); }))];
                case 1:
                    sizes = _a.sent();
                    return [2 /*return*/, sizes.reduce(function (total, size) { return total + size; }, 0)];
            }
        });
    });
}
/**
 * Check if tool search (MCP tool deferral with tool_reference) is enabled for a specific request.
 *
 * This is the definitive check that includes:
 * - MCP mode (Tst, TstAuto, McpCli, Standard)
 * - Model compatibility (haiku doesn't support tool_reference)
 * - ToolSearchTool availability (must be in tools list)
 * - Threshold check for TstAuto mode
 *
 * Use this when making actual API calls where all context is available.
 *
 * @param model The model to check for tool_reference support
 * @param tools Array of available tools (including MCP tools)
 * @param getToolPermissionContext Function to get tool permission context
 * @param agents Array of agent definitions
 * @param source Optional identifier for the caller (for debugging)
 * @returns true if tool search should be enabled for this request
 */
function isToolSearchEnabled(model, tools, getToolPermissionContext, agents, source) {
    return __awaiter(this, void 0, void 0, function () {
        // Helper to log the mode decision event
        function logModeDecision(enabled, mode, reason, extraProps) {
            var _a;
            (0, index_js_1.logEvent)('tengu_tool_search_mode_decision', __assign({ enabled: enabled, mode: mode, reason: reason, 
                // Log the actual model being checked, not the session's main model.
                // This is important for debugging subagent tool search decisions where
                // the subagent model (e.g., haiku) differs from the session model (e.g., opus).
                checkedModel: model, mcpToolCount: mcpToolCount, userType: ((_a = process.env.USER_TYPE) !== null && _a !== void 0 ? _a : 'external') }, extraProps));
        }
        var mcpToolCount, mode, _a, _b, enabled, debugDescription, metrics;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    mcpToolCount = (0, array_js_1.count)(tools, function (t) { return t.isMcp; });
                    // Check if model supports tool_reference
                    if (!modelSupportsToolReference(model)) {
                        (0, debug_js_1.logForDebugging)("Tool search disabled for model '".concat(model, "': model does not support tool_reference blocks. ") +
                            "This feature is only available on Claude Sonnet 4+, Opus 4+, and newer models.");
                        logModeDecision(false, 'standard', 'model_unsupported');
                        return [2 /*return*/, false];
                    }
                    // Check if ToolSearchTool is available (respects disallowedTools)
                    if (!isToolSearchToolAvailable(tools)) {
                        (0, debug_js_1.logForDebugging)("Tool search disabled: ToolSearchTool is not available (may have been disallowed via disallowedTools).");
                        logModeDecision(false, 'standard', 'mcp_search_unavailable');
                        return [2 /*return*/, false];
                    }
                    mode = getToolSearchMode();
                    _a = mode;
                    switch (_a) {
                        case 'tst': return [3 /*break*/, 1];
                        case 'tst-auto': return [3 /*break*/, 2];
                        case 'standard': return [3 /*break*/, 4];
                    }
                    return [3 /*break*/, 5];
                case 1:
                    logModeDecision(true, mode, 'tst_enabled');
                    return [2 /*return*/, true];
                case 2: return [4 /*yield*/, checkAutoThreshold(tools, getToolPermissionContext, agents, model)];
                case 3:
                    _b = _c.sent(), enabled = _b.enabled, debugDescription = _b.debugDescription, metrics = _b.metrics;
                    if (enabled) {
                        (0, debug_js_1.logForDebugging)("Auto tool search enabled: ".concat(debugDescription) +
                            (source ? " [source: ".concat(source, "]") : ''));
                        logModeDecision(true, mode, 'auto_above_threshold', metrics);
                        return [2 /*return*/, true];
                    }
                    (0, debug_js_1.logForDebugging)("Auto tool search disabled: ".concat(debugDescription) +
                        (source ? " [source: ".concat(source, "]") : ''));
                    logModeDecision(false, mode, 'auto_below_threshold', metrics);
                    return [2 /*return*/, false];
                case 4:
                    logModeDecision(false, mode, 'standard_mode');
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if an object is a tool_reference block.
 * tool_reference is a beta feature not in the SDK types, so we need runtime checks.
 */
function isToolReferenceBlock(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'type' in obj &&
        obj.type === 'tool_reference');
}
/**
 * Type guard for tool_reference block with tool_name.
 */
function isToolReferenceWithName(obj) {
    return (isToolReferenceBlock(obj) &&
        'tool_name' in obj &&
        typeof obj.tool_name === 'string');
}
/**
 * Type guard for tool_result blocks with array content.
 */
function isToolResultBlockWithContent(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'type' in obj &&
        obj.type === 'tool_result' &&
        'content' in obj &&
        Array.isArray(obj.content));
}
/**
 * Extract tool names from tool_reference blocks in message history.
 *
 * When dynamic tool loading is enabled, MCP tools are not predeclared in the
 * tools array. Instead, they are discovered via ToolSearchTool which returns
 * tool_reference blocks. This function scans the message history to find all
 * tool names that have been referenced, so we can include only those tools
 * in subsequent API requests.
 *
 * This approach:
 * - Eliminates the need to predeclare all MCP tools upfront
 * - Removes limits on total quantity of MCP tools
 *
 * Compaction replaces tool_reference-bearing messages with a summary, so it
 * snapshots the discovered set onto compactMetadata.preCompactDiscoveredTools
 * on the boundary marker; this scan reads it back. Snip instead protects the
 * tool_reference-carrying messages from removal.
 *
 * @param messages Array of messages that may contain tool_result blocks with tool_reference content
 * @returns Set of tool names that have been discovered via tool_reference blocks
 */
function extractDiscoveredToolNames(messages) {
    var _a, _b;
    var discoveredTools = new Set();
    var carriedFromBoundary = 0;
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var msg = messages_1[_i];
        // Compact boundary carries the pre-compact discovered set. Inline type
        // check rather than isCompactBoundaryMessage — utils/messages.ts imports
        // from this file, so importing back would be circular.
        if (msg.type === 'system' && msg.subtype === 'compact_boundary') {
            var carried = (_a = msg.compactMetadata) === null || _a === void 0 ? void 0 : _a.preCompactDiscoveredTools;
            if (carried) {
                for (var _c = 0, carried_1 = carried; _c < carried_1.length; _c++) {
                    var name_1 = carried_1[_c];
                    discoveredTools.add(name_1);
                }
                carriedFromBoundary += carried.length;
            }
            continue;
        }
        // Only user messages contain tool_result blocks (responses to tool_use)
        if (msg.type !== 'user')
            continue;
        var content = (_b = msg.message) === null || _b === void 0 ? void 0 : _b.content;
        if (!Array.isArray(content))
            continue;
        for (var _d = 0, content_1 = content; _d < content_1.length; _d++) {
            var block = content_1[_d];
            // tool_reference blocks only appear inside tool_result content, specifically
            // in results from ToolSearchTool. The API expands these references into full
            // tool definitions in the model's context.
            if (isToolResultBlockWithContent(block)) {
                for (var _e = 0, _f = block.content; _e < _f.length; _e++) {
                    var item = _f[_e];
                    if (isToolReferenceWithName(item)) {
                        discoveredTools.add(item.tool_name);
                    }
                }
            }
        }
    }
    if (discoveredTools.size > 0) {
        (0, debug_js_1.logForDebugging)("Dynamic tool loading: found ".concat(discoveredTools.size, " discovered tools in message history") +
            (carriedFromBoundary > 0
                ? " (".concat(carriedFromBoundary, " carried from compact boundary)")
                : ''));
    }
    return discoveredTools;
}
/**
 * True → announce deferred tools via persisted delta attachments.
 * False → claude.ts keeps its per-call <available-deferred-tools>
 * header prepend (the attachment does not fire).
 */
function isDeferredToolsDeltaEnabled() {
    return (process.env.USER_TYPE === 'ant' ||
        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_glacier_2xr', false));
}
/**
 * Diff the current deferred-tool pool against what's already been
 * announced in this conversation (reconstructed by scanning for prior
 * deferred_tools_delta attachments). Returns null if nothing changed.
 *
 * A name that was announced but has since stopped being deferred — yet
 * is still in the base pool — is NOT reported as removed. It's now
 * loaded directly, so telling the model "no longer available" would be
 * wrong.
 */
function getDeferredToolsDelta(tools, messages, scanContext) {
    var _a, _b;
    var announced = new Set();
    var attachmentCount = 0;
    var dtdCount = 0;
    var attachmentTypesSeen = new Set();
    for (var _i = 0, messages_2 = messages; _i < messages_2.length; _i++) {
        var msg = messages_2[_i];
        if (msg.type !== 'attachment')
            continue;
        attachmentCount++;
        attachmentTypesSeen.add(msg.attachment.type);
        if (msg.attachment.type !== 'deferred_tools_delta')
            continue;
        dtdCount++;
        for (var _c = 0, _d = msg.attachment.addedNames; _c < _d.length; _c++) {
            var n = _d[_c];
            announced.add(n);
        }
        for (var _e = 0, _f = msg.attachment.removedNames; _e < _f.length; _e++) {
            var n = _f[_e];
            announced.delete(n);
        }
    }
    var deferred = tools.filter(prompt_js_1.isDeferredTool);
    var deferredNames = new Set(deferred.map(function (t) { return t.name; }));
    var poolNames = new Set(tools.map(function (t) { return t.name; }));
    var added = deferred.filter(function (t) { return !announced.has(t.name); });
    var removed = [];
    for (var _g = 0, announced_1 = announced; _g < announced_1.length; _g++) {
        var n = announced_1[_g];
        if (deferredNames.has(n))
            continue;
        if (!poolNames.has(n))
            removed.push(n);
        // else: undeferred — silent
    }
    if (added.length === 0 && removed.length === 0)
        return null;
    // Diagnostic for the inc-4747 scan-finds-nothing bug. Round-1 fields
    // (messagesLength/attachmentCount/dtdCount from #23167) showed 45.6% of
    // events have attachments-but-no-DTD, but those numbers are confounded:
    // subagent first-fires and compact-path scans have EXPECTED prior=0 and
    // dominate the stat. callSite/querySource/attachmentTypesSeen split the
    // buckets so the real main-thread cross-turn failure is isolable in BQ.
    (0, index_js_1.logEvent)('tengu_deferred_tools_pool_change', {
        addedCount: added.length,
        removedCount: removed.length,
        priorAnnouncedCount: announced.size,
        messagesLength: messages.length,
        attachmentCount: attachmentCount,
        dtdCount: dtdCount,
        callSite: ((_a = scanContext === null || scanContext === void 0 ? void 0 : scanContext.callSite) !== null && _a !== void 0 ? _a : 'unknown'),
        querySource: ((_b = scanContext === null || scanContext === void 0 ? void 0 : scanContext.querySource) !== null && _b !== void 0 ? _b : 'unknown'),
        attachmentTypesSeen: __spreadArray([], attachmentTypesSeen, true).sort()
            .join(','),
    });
    return {
        addedNames: added.map(function (t) { return t.name; }).sort(),
        addedLines: added.map(prompt_js_1.formatDeferredToolLine).sort(),
        removedNames: removed.sort(),
    };
}
/**
 * Check whether deferred tools exceed the auto-threshold for enabling TST.
 * Tries exact token count first; falls back to character-based heuristic.
 */
function checkAutoThreshold(tools, getToolPermissionContext, agents, model) {
    return __awaiter(this, void 0, void 0, function () {
        var deferredToolTokens, threshold, deferredToolDescriptionChars, charThreshold;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDeferredToolTokenCount(tools, getToolPermissionContext, agents, model)];
                case 1:
                    deferredToolTokens = _a.sent();
                    if (deferredToolTokens !== null) {
                        threshold = getAutoToolSearchTokenThreshold(model);
                        return [2 /*return*/, {
                                enabled: deferredToolTokens >= threshold,
                                debugDescription: "".concat(deferredToolTokens, " tokens (threshold: ").concat(threshold, ", ") +
                                    "".concat(getAutoToolSearchPercentage(), "% of context)"),
                                metrics: { deferredToolTokens: deferredToolTokens, threshold: threshold },
                            }];
                    }
                    return [4 /*yield*/, calculateDeferredToolDescriptionChars(tools, getToolPermissionContext, agents)];
                case 2:
                    deferredToolDescriptionChars = _a.sent();
                    charThreshold = getAutoToolSearchCharThreshold(model);
                    return [2 /*return*/, {
                            enabled: deferredToolDescriptionChars >= charThreshold,
                            debugDescription: "".concat(deferredToolDescriptionChars, " chars (threshold: ").concat(charThreshold, ", ") +
                                "".concat(getAutoToolSearchPercentage(), "% of context) (char fallback)"),
                            metrics: { deferredToolDescriptionChars: deferredToolDescriptionChars, charThreshold: charThreshold },
                        }];
            }
        });
    });
}
