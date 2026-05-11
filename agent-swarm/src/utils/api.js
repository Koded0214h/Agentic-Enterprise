"use strict";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolToAPISchema = toolToAPISchema;
exports.logAPIPrefix = logAPIPrefix;
exports.splitSysPromptPrefix = splitSysPromptPrefix;
exports.appendSystemContext = appendSystemContext;
exports.prependUserContext = prependUserContext;
exports.logContextMetrics = logContextMetrics;
exports.normalizeToolInput = normalizeToolInput;
exports.normalizeToolInputForAPI = normalizeToolInputForAPI;
var crypto_1 = require("crypto");
var prompts_js_1 = require("src/constants/prompts.js");
var context_js_1 = require("src/context.js");
var config_js_1 = require("src/services/analytics/config.js");
var growthbook_js_1 = require("src/services/analytics/growthbook.js");
var index_js_1 = require("src/services/analytics/index.js");
var client_js_1 = require("src/services/mcp/client.js");
var BashTool_js_1 = require("src/tools/BashTool/BashTool.js");
var FileEditTool_js_1 = require("src/tools/FileEditTool/FileEditTool.js");
var utils_js_1 = require("src/tools/FileEditTool/utils.js");
var FileWriteTool_js_1 = require("src/tools/FileWriteTool/FileWriteTool.js");
var tools_js_1 = require("src/tools.js");
var system_js_1 = require("../constants/system.js");
var tokenEstimation_js_1 = require("../services/tokenEstimation.js");
var constants_js_1 = require("../tools/AgentTool/constants.js");
var constants_js_2 = require("../tools/ExitPlanModeTool/constants.js");
var constants_js_3 = require("../tools/TaskOutputTool/constants.js");
var agentSwarmsEnabled_js_1 = require("./agentSwarmsEnabled.js");
var betas_js_1 = require("./betas.js");
var cwd_js_1 = require("./cwd.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var messages_js_1 = require("./messages.js");
var providers_js_1 = require("./model/providers.js");
var filesystem_js_1 = require("./permissions/filesystem.js");
var plans_js_1 = require("./plans.js");
var platform_js_1 = require("./platform.js");
var ripgrep_js_1 = require("./ripgrep.js");
var slowOperations_js_1 = require("./slowOperations.js");
var toolSchemaCache_js_1 = require("./toolSchemaCache.js");
var windowsPaths_js_1 = require("./windowsPaths.js");
var zodToJsonSchema_js_1 = require("./zodToJsonSchema.js");
// Fields to filter from tool schemas when swarms are not enabled
var SWARM_FIELDS_BY_TOOL = (_a = {},
    _a[constants_js_2.EXIT_PLAN_MODE_V2_TOOL_NAME] = ['launchSwarm', 'teammateCount'],
    _a[constants_js_1.AGENT_TOOL_NAME] = ['name', 'team_name', 'mode'],
    _a);
/**
 * Filter swarm-related fields from a tool's input schema.
 * Called at runtime when isAgentSwarmsEnabled() returns false.
 */
function filterSwarmFieldsFromSchema(toolName, schema) {
    var fieldsToRemove = SWARM_FIELDS_BY_TOOL[toolName];
    if (!fieldsToRemove || fieldsToRemove.length === 0) {
        return schema;
    }
    // Clone the schema to avoid mutating the original
    var filtered = __assign({}, schema);
    var props = filtered.properties;
    if (props && typeof props === 'object') {
        var filteredProps = __assign({}, props);
        for (var _i = 0, fieldsToRemove_1 = fieldsToRemove; _i < fieldsToRemove_1.length; _i++) {
            var field = fieldsToRemove_1[_i];
            delete filteredProps[field];
        }
        filtered.properties = filteredProps;
    }
    return filtered;
}
function toolToAPISchema(tool, options) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, cache, base, strictToolsEnabled, input_schema, schema, allowed_1, stripped;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cacheKey = 'inputJSONSchema' in tool && tool.inputJSONSchema
                        ? "".concat(tool.name, ":").concat((0, slowOperations_js_1.jsonStringify)(tool.inputJSONSchema))
                        : tool.name;
                    cache = (0, toolSchemaCache_js_1.getToolSchemaCache)();
                    base = cache.get(cacheKey);
                    if (!!base) return [3 /*break*/, 2];
                    strictToolsEnabled = (0, growthbook_js_1.checkStatsigFeatureGate_CACHED_MAY_BE_STALE)('tengu_tool_pear');
                    input_schema = ('inputJSONSchema' in tool && tool.inputJSONSchema
                        ? tool.inputJSONSchema
                        : (0, zodToJsonSchema_js_1.zodToJsonSchema)(tool.inputSchema));
                    // Filter out swarm-related fields when swarms are not enabled
                    // This ensures external non-EAP users don't see swarm features in the schema
                    if (!(0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)()) {
                        input_schema = filterSwarmFieldsFromSchema(tool.name, input_schema);
                    }
                    _a = {
                        name: tool.name
                    };
                    return [4 /*yield*/, tool.prompt({
                            getToolPermissionContext: options.getToolPermissionContext,
                            tools: options.tools,
                            agents: options.agents,
                            allowedAgentTypes: options.allowedAgentTypes,
                        })];
                case 1:
                    base = (_a.description = _b.sent(),
                        _a.input_schema = input_schema,
                        _a);
                    // Only add strict if:
                    // 1. Feature flag is enabled
                    // 2. Tool has strict: true
                    // 3. Model is provided and supports it (not all models support it right now)
                    //    (if model is not provided, assume we can't use strict tools)
                    if (strictToolsEnabled &&
                        tool.strict === true &&
                        options.model &&
                        (0, betas_js_1.modelSupportsStructuredOutputs)(options.model)) {
                        base.strict = true;
                    }
                    // Enable fine-grained tool streaming via per-tool API field.
                    // Without FGTS, the API buffers entire tool input parameters before sending
                    // input_json_delta events, causing multi-minute hangs on large tool inputs.
                    // Gated to direct api.anthropic.com: proxies (LiteLLM etc.) and Bedrock/Vertex
                    // with Claude 4.5 reject this field with 400. See GH#32742, PR #21729.
                    if ((0, providers_js_1.getAPIProvider)() === 'firstParty' &&
                        (0, providers_js_1.isFirstPartyAnthropicBaseUrl)() &&
                        ((0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_fgts', false) ||
                            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_ENABLE_FINE_GRAINED_TOOL_STREAMING))) {
                        base.eager_input_streaming = true;
                    }
                    cache.set(cacheKey, base);
                    _b.label = 2;
                case 2:
                    schema = __assign(__assign({ name: base.name, description: base.description, input_schema: base.input_schema }, (base.strict && { strict: true })), (base.eager_input_streaming && { eager_input_streaming: true }));
                    // Add defer_loading if requested (for tool search feature)
                    if (options.deferLoading) {
                        schema.defer_loading = true;
                    }
                    if (options.cacheControl) {
                        schema.cache_control = options.cacheControl;
                    }
                    // CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS is the kill switch for beta API
                    // shapes. Proxy gateways (ANTHROPIC_BASE_URL → LiteLLM → Bedrock) reject
                    // fields like defer_loading with "Extra inputs are not permitted". The gates
                    // above each field are scattered and not all provider-aware, so this strips
                    // everything not in the base-tool allowlist at the one choke point all tool
                    // schemas pass through — including fields added in the future.
                    // cache_control is allowlisted: the base {type: 'ephemeral'} shape is
                    // standard prompt caching (Bedrock/Vertex supported); the beta sub-fields
                    // (scope, ttl) are already gated upstream by shouldIncludeFirstPartyOnlyBetas
                    // which independently respects this kill switch.
                    // github.com/anthropics/claude-code/issues/20031
                    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS)) {
                        allowed_1 = new Set([
                            'name',
                            'description',
                            'input_schema',
                            'cache_control',
                        ]);
                        stripped = Object.keys(schema).filter(function (k) { return !allowed_1.has(k); });
                        if (stripped.length > 0) {
                            logStripOnce(stripped);
                            return [2 /*return*/, __assign({ name: schema.name, description: schema.description, input_schema: schema.input_schema }, (schema.cache_control && { cache_control: schema.cache_control }))];
                        }
                    }
                    // Note: We cast to BetaTool but the extra fields are still present at runtime
                    // and will be serialized in the API request, even though they're not in the SDK's
                    // BetaTool type definition. This is intentional for beta features.
                    return [2 /*return*/, schema];
            }
        });
    });
}
var loggedStrip = false;
function logStripOnce(stripped) {
    if (loggedStrip)
        return;
    loggedStrip = true;
    (0, debug_js_1.logForDebugging)("[betas] Stripped from tool schemas: [".concat(stripped.join(', '), "] (CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1)"));
}
/**
 * Log stats about first block for analyzing prefix matching config
 * (see https://console.statsig.com/4aF3Ewatb6xPVpCwxb5nA3/dynamic_configs/claude_cli_system_prompt_prefixes)
 */
function logAPIPrefix(systemPrompt) {
    var _a;
    var firstSyspromptBlock = splitSysPromptPrefix(systemPrompt)[0];
    var firstSystemPrompt = firstSyspromptBlock === null || firstSyspromptBlock === void 0 ? void 0 : firstSyspromptBlock.text;
    (0, index_js_1.logEvent)('tengu_sysprompt_block', {
        snippet: firstSystemPrompt === null || firstSystemPrompt === void 0 ? void 0 : firstSystemPrompt.slice(0, 20),
        length: (_a = firstSystemPrompt === null || firstSystemPrompt === void 0 ? void 0 : firstSystemPrompt.length) !== null && _a !== void 0 ? _a : 0,
        hash: (firstSystemPrompt
            ? (0, crypto_1.createHash)('sha256').update(firstSystemPrompt).digest('hex')
            : ''),
    });
}
/**
 * Split system prompt blocks by content type for API matching and cache control.
 * See https://console.statsig.com/4aF3Ewatb6xPVpCwxb5nA3/dynamic_configs/claude_cli_system_prompt_prefixes
 *
 * Behavior depends on feature flags and options:
 *
 * 1. MCP tools present (skipGlobalCacheForSystemPrompt=true):
 *    Returns up to 3 blocks with org-level caching (no global cache on system prompt):
 *    - Attribution header (cacheScope=null)
 *    - System prompt prefix (cacheScope='org')
 *    - Everything else concatenated (cacheScope='org')
 *
 * 2. Global cache mode with boundary marker (1P only, boundary found):
 *    Returns up to 4 blocks:
 *    - Attribution header (cacheScope=null)
 *    - System prompt prefix (cacheScope=null)
 *    - Static content before boundary (cacheScope='global')
 *    - Dynamic content after boundary (cacheScope=null)
 *
 * 3. Default mode (3P providers, or boundary missing):
 *    Returns up to 3 blocks with org-level caching:
 *    - Attribution header (cacheScope=null)
 *    - System prompt prefix (cacheScope='org')
 *    - Everything else concatenated (cacheScope='org')
 */
function splitSysPromptPrefix(systemPrompt, options) {
    var useGlobalCacheFeature = (0, betas_js_1.shouldUseGlobalCacheScope)();
    if (useGlobalCacheFeature && (options === null || options === void 0 ? void 0 : options.skipGlobalCacheForSystemPrompt)) {
        (0, index_js_1.logEvent)('tengu_sysprompt_using_tool_based_cache', {
            promptBlockCount: systemPrompt.length,
        });
        // Filter out boundary marker, return blocks without global scope
        var attributionHeader_1;
        var systemPromptPrefix_1;
        var rest_1 = [];
        for (var _i = 0, systemPrompt_1 = systemPrompt; _i < systemPrompt_1.length; _i++) {
            var prompt_1 = systemPrompt_1[_i];
            if (!prompt_1)
                continue;
            if (prompt_1 === prompts_js_1.SYSTEM_PROMPT_DYNAMIC_BOUNDARY)
                continue; // Skip boundary
            if (prompt_1.startsWith('x-anthropic-billing-header')) {
                attributionHeader_1 = prompt_1;
            }
            else if (system_js_1.CLI_SYSPROMPT_PREFIXES.has(prompt_1)) {
                systemPromptPrefix_1 = prompt_1;
            }
            else {
                rest_1.push(prompt_1);
            }
        }
        var result_1 = [];
        if (attributionHeader_1) {
            result_1.push({ text: attributionHeader_1, cacheScope: null });
        }
        if (systemPromptPrefix_1) {
            result_1.push({ text: systemPromptPrefix_1, cacheScope: 'org' });
        }
        var restJoined_1 = rest_1.join('\n\n');
        if (restJoined_1) {
            result_1.push({ text: restJoined_1, cacheScope: 'org' });
        }
        return result_1;
    }
    if (useGlobalCacheFeature) {
        var boundaryIndex = systemPrompt.findIndex(function (s) { return s === prompts_js_1.SYSTEM_PROMPT_DYNAMIC_BOUNDARY; });
        if (boundaryIndex !== -1) {
            var attributionHeader_2;
            var systemPromptPrefix_2;
            var staticBlocks = [];
            var dynamicBlocks = [];
            for (var i = 0; i < systemPrompt.length; i++) {
                var block = systemPrompt[i];
                if (!block || block === prompts_js_1.SYSTEM_PROMPT_DYNAMIC_BOUNDARY)
                    continue;
                if (block.startsWith('x-anthropic-billing-header')) {
                    attributionHeader_2 = block;
                }
                else if (system_js_1.CLI_SYSPROMPT_PREFIXES.has(block)) {
                    systemPromptPrefix_2 = block;
                }
                else if (i < boundaryIndex) {
                    staticBlocks.push(block);
                }
                else {
                    dynamicBlocks.push(block);
                }
            }
            var result_2 = [];
            if (attributionHeader_2)
                result_2.push({ text: attributionHeader_2, cacheScope: null });
            if (systemPromptPrefix_2)
                result_2.push({ text: systemPromptPrefix_2, cacheScope: null });
            var staticJoined = staticBlocks.join('\n\n');
            if (staticJoined)
                result_2.push({ text: staticJoined, cacheScope: 'global' });
            var dynamicJoined = dynamicBlocks.join('\n\n');
            if (dynamicJoined)
                result_2.push({ text: dynamicJoined, cacheScope: null });
            (0, index_js_1.logEvent)('tengu_sysprompt_boundary_found', {
                blockCount: result_2.length,
                staticBlockLength: staticJoined.length,
                dynamicBlockLength: dynamicJoined.length,
            });
            return result_2;
        }
        else {
            (0, index_js_1.logEvent)('tengu_sysprompt_missing_boundary_marker', {
                promptBlockCount: systemPrompt.length,
            });
        }
    }
    var attributionHeader;
    var systemPromptPrefix;
    var rest = [];
    for (var _a = 0, systemPrompt_2 = systemPrompt; _a < systemPrompt_2.length; _a++) {
        var block = systemPrompt_2[_a];
        if (!block)
            continue;
        if (block.startsWith('x-anthropic-billing-header')) {
            attributionHeader = block;
        }
        else if (system_js_1.CLI_SYSPROMPT_PREFIXES.has(block)) {
            systemPromptPrefix = block;
        }
        else {
            rest.push(block);
        }
    }
    var result = [];
    if (attributionHeader)
        result.push({ text: attributionHeader, cacheScope: null });
    if (systemPromptPrefix)
        result.push({ text: systemPromptPrefix, cacheScope: 'org' });
    var restJoined = rest.join('\n\n');
    if (restJoined)
        result.push({ text: restJoined, cacheScope: 'org' });
    return result;
}
function appendSystemContext(systemPrompt, context) {
    return __spreadArray(__spreadArray([], systemPrompt, true), [
        Object.entries(context)
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return "".concat(key, ": ").concat(value);
        })
            .join('\n'),
    ], false).filter(Boolean);
}
function prependUserContext(messages, context) {
    if (process.env.NODE_ENV === 'test') {
        return messages;
    }
    if (Object.entries(context).length === 0) {
        return messages;
    }
    return __spreadArray([
        (0, messages_js_1.createUserMessage)({
            content: "<system-reminder>\nAs you answer the user's questions, you can use the following context:\n".concat(Object.entries(context)
                .map(function (_a) {
                var key = _a[0], value = _a[1];
                return "# ".concat(key, "\n").concat(value);
            })
                .join('\n'), "\n\n      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.\n</system-reminder>\n"),
            isMeta: true,
        })
    ], messages, true);
}
/**
 * Log metrics about context and system prompt size
 */
function logContextMetrics(mcpConfigs, toolPermissionContext) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, mcpTools, tools, userContext, systemContext, gitStatusSize, claudeMdSize, totalContextSize, currentDir, ignorePatternsByRoot, normalizedIgnorePatterns, fileCount, mcpToolsCount, mcpServersCount, mcpToolsTokens, nonMcpToolsCount, nonMcpToolsTokens, nonMcpTools, serverNames, _i, mcpTools_1, tool, parts, _b, mcpTools_2, tool, schema, _c, nonMcpTools_1, tool, schema;
        var _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    // Early return if logging is disabled
                    if ((0, config_js_1.isAnalyticsDisabled)()) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, Promise.all([
                            (0, client_js_1.prefetchAllMcpResources)(mcpConfigs),
                            (0, tools_js_1.getTools)(toolPermissionContext),
                            (0, context_js_1.getUserContext)(),
                            (0, context_js_1.getSystemContext)(),
                        ])
                        // Extract individual context sizes and calculate total
                    ];
                case 1:
                    _a = _h.sent(), mcpTools = _a[0].tools, tools = _a[1], userContext = _a[2], systemContext = _a[3];
                    gitStatusSize = (_e = (_d = systemContext.gitStatus) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0;
                    claudeMdSize = (_g = (_f = userContext.claudeMd) === null || _f === void 0 ? void 0 : _f.length) !== null && _g !== void 0 ? _g : 0;
                    totalContextSize = gitStatusSize + claudeMdSize;
                    currentDir = (0, cwd_js_1.getCwd)();
                    ignorePatternsByRoot = (0, filesystem_js_1.getFileReadIgnorePatterns)(toolPermissionContext);
                    normalizedIgnorePatterns = (0, filesystem_js_1.normalizePatternsToPath)(ignorePatternsByRoot, currentDir);
                    return [4 /*yield*/, (0, ripgrep_js_1.countFilesRoundedRg)(currentDir, AbortSignal.timeout(1000), normalizedIgnorePatterns)
                        // Calculate tool metrics
                    ];
                case 2:
                    fileCount = _h.sent();
                    mcpToolsCount = 0;
                    mcpServersCount = 0;
                    mcpToolsTokens = 0;
                    nonMcpToolsCount = 0;
                    nonMcpToolsTokens = 0;
                    nonMcpTools = tools.filter(function (tool) { return !tool.isMcp; });
                    mcpToolsCount = mcpTools.length;
                    nonMcpToolsCount = nonMcpTools.length;
                    serverNames = new Set();
                    for (_i = 0, mcpTools_1 = mcpTools; _i < mcpTools_1.length; _i++) {
                        tool = mcpTools_1[_i];
                        parts = tool.name.split('__');
                        if (parts.length >= 3 && parts[1]) {
                            serverNames.add(parts[1]);
                        }
                    }
                    mcpServersCount = serverNames.size;
                    // Estimate tool tokens locally for analytics (avoids N API calls per session)
                    // Use inputJSONSchema (plain JSON Schema) when available, otherwise convert Zod schema
                    for (_b = 0, mcpTools_2 = mcpTools; _b < mcpTools_2.length; _b++) {
                        tool = mcpTools_2[_b];
                        schema = 'inputJSONSchema' in tool && tool.inputJSONSchema
                            ? tool.inputJSONSchema
                            : (0, zodToJsonSchema_js_1.zodToJsonSchema)(tool.inputSchema);
                        mcpToolsTokens += (0, tokenEstimation_js_1.roughTokenCountEstimation)((0, slowOperations_js_1.jsonStringify)(schema));
                    }
                    for (_c = 0, nonMcpTools_1 = nonMcpTools; _c < nonMcpTools_1.length; _c++) {
                        tool = nonMcpTools_1[_c];
                        schema = 'inputJSONSchema' in tool && tool.inputJSONSchema
                            ? tool.inputJSONSchema
                            : (0, zodToJsonSchema_js_1.zodToJsonSchema)(tool.inputSchema);
                        nonMcpToolsTokens += (0, tokenEstimation_js_1.roughTokenCountEstimation)((0, slowOperations_js_1.jsonStringify)(schema));
                    }
                    (0, index_js_1.logEvent)('tengu_context_size', {
                        git_status_size: gitStatusSize,
                        claude_md_size: claudeMdSize,
                        total_context_size: totalContextSize,
                        project_file_count_rounded: fileCount,
                        mcp_tools_count: mcpToolsCount,
                        mcp_servers_count: mcpServersCount,
                        mcp_tools_tokens: mcpToolsTokens,
                        non_mcp_tools_count: nonMcpToolsCount,
                        non_mcp_tools_tokens: nonMcpToolsTokens,
                    });
                    return [2 /*return*/];
            }
        });
    });
}
// TODO: Generalize this to all tools
function normalizeToolInput(tool, input, agentId) {
    var _a, _b, _c, _d;
    switch (tool.name) {
        case constants_js_2.EXIT_PLAN_MODE_V2_TOOL_NAME: {
            // Always inject plan content and file path for ExitPlanModeV2 so hooks/SDK get the plan.
            // The V2 tool reads plan from file instead of input, but hooks/SDK
            var plan = (0, plans_js_1.getPlan)(agentId);
            var planFilePath = (0, plans_js_1.getPlanFilePath)(agentId);
            // Persist file snapshot for CCR sessions so the plan survives pod recycling
            void (0, plans_js_1.persistFileSnapshotIfRemote)();
            return plan !== null ? __assign(__assign({}, input), { plan: plan, planFilePath: planFilePath }) : input;
        }
        case BashTool_js_1.BashTool.name: {
            // Validated upstream, won't throw
            var parsed = BashTool_js_1.BashTool.inputSchema.parse(input);
            var command = parsed.command, timeout = parsed.timeout, description = parsed.description;
            var cwd = (0, cwd_js_1.getCwd)();
            var normalizedCommand = command.replace("cd ".concat(cwd, " && "), '');
            if ((0, platform_js_1.getPlatform)() === 'windows') {
                normalizedCommand = normalizedCommand.replace("cd ".concat((0, windowsPaths_js_1.windowsPathToPosixPath)(cwd), " && "), '');
            }
            // Replace \\; with \; (commonly needed for find -exec commands)
            normalizedCommand = normalizedCommand.replace(/\\\\;/g, '\\;');
            // Logging for commands that are only echoing a string. This is to help us understand how often  Claude talks via bash
            if (/^echo\s+["']?[^|&;><]*["']?$/i.test(normalizedCommand.trim())) {
                (0, index_js_1.logEvent)('tengu_bash_tool_simple_echo', {});
            }
            // Check for run_in_background (may not exist in schema if CLAUDE_CODE_DISABLE_BACKGROUND_TASKS is set)
            var run_in_background = 'run_in_background' in parsed ? parsed.run_in_background : undefined;
            // SAFETY: Cast is safe because input was validated by .parse() above.
            // TypeScript can't narrow the generic T based on switch(tool.name), so it
            // doesn't know the return type matches T['inputSchema']. This is a fundamental
            // TS limitation with generics, not bypassable without major refactoring.
            return __assign(__assign(__assign(__assign({ command: normalizedCommand, description: description }, (timeout !== undefined && { timeout: timeout })), (description !== undefined && { description: description })), (run_in_background !== undefined && { run_in_background: run_in_background })), ('dangerouslyDisableSandbox' in parsed &&
                parsed.dangerouslyDisableSandbox !== undefined && {
                dangerouslyDisableSandbox: parsed.dangerouslyDisableSandbox,
            }));
        }
        case FileEditTool_js_1.FileEditTool.name: {
            // Validated upstream, won't throw
            var parsedInput = FileEditTool_js_1.FileEditTool.inputSchema.parse(input);
            // This is a workaround for tokens claude can't see
            var _e = (0, utils_js_1.normalizeFileEditInput)({
                file_path: parsedInput.file_path,
                edits: [
                    {
                        old_string: parsedInput.old_string,
                        new_string: parsedInput.new_string,
                        replace_all: parsedInput.replace_all,
                    },
                ],
            }), file_path = _e.file_path, edits = _e.edits;
            // SAFETY: See comment in BashTool case above
            return {
                replace_all: edits[0].replace_all,
                file_path: file_path,
                old_string: edits[0].old_string,
                new_string: edits[0].new_string,
            };
        }
        case FileWriteTool_js_1.FileWriteTool.name: {
            // Validated upstream, won't throw
            var parsedInput = FileWriteTool_js_1.FileWriteTool.inputSchema.parse(input);
            // Markdown uses two trailing spaces as a hard line break — don't strip.
            var isMarkdown = /\.(md|mdx)$/i.test(parsedInput.file_path);
            // SAFETY: See comment in BashTool case above
            return {
                file_path: parsedInput.file_path,
                content: isMarkdown
                    ? parsedInput.content
                    : (0, utils_js_1.stripTrailingWhitespace)(parsedInput.content),
            };
        }
        case constants_js_3.TASK_OUTPUT_TOOL_NAME: {
            // Normalize legacy parameter names from AgentOutputTool/BashOutputTool
            var legacyInput = input;
            var taskId = (_b = (_a = legacyInput.task_id) !== null && _a !== void 0 ? _a : legacyInput.agentId) !== null && _b !== void 0 ? _b : legacyInput.bash_id;
            var timeout = (_c = legacyInput.timeout) !== null && _c !== void 0 ? _c : (typeof legacyInput.wait_up_to === 'number'
                ? legacyInput.wait_up_to * 1000
                : undefined);
            // SAFETY: See comment in BashTool case above
            return {
                task_id: taskId !== null && taskId !== void 0 ? taskId : '',
                block: (_d = legacyInput.block) !== null && _d !== void 0 ? _d : true,
                timeout: timeout !== null && timeout !== void 0 ? timeout : 30000,
            };
        }
        default:
            return input;
    }
}
// Strips fields that were added by normalizeToolInput before sending to API
// (e.g., plan field from ExitPlanModeV2 which has an empty input schema)
function normalizeToolInputForAPI(tool, input) {
    switch (tool.name) {
        case constants_js_2.EXIT_PLAN_MODE_V2_TOOL_NAME: {
            // Strip injected fields before sending to API (schema expects empty object)
            if (input &&
                typeof input === 'object' &&
                ('plan' in input || 'planFilePath' in input)) {
                var _a = input, plan = _a.plan, planFilePath = _a.planFilePath, rest = __rest(_a, ["plan", "planFilePath"]);
                return rest;
            }
            return input;
        }
        case FileEditTool_js_1.FileEditTool.name: {
            // Strip synthetic old_string/new_string/replace_all from OLD sessions
            // that were resumed from transcripts written before PR #20357, where
            // normalizeToolInput used to synthesize these. Needed so old --resume'd
            // transcripts don't send whole-file copies to the API. New sessions
            // don't need this (synthesis moved to emission time).
            if (input && typeof input === 'object' && 'edits' in input) {
                var _b = input, old_string = _b.old_string, new_string = _b.new_string, replace_all = _b.replace_all, rest = __rest(_b, ["old_string", "new_string", "replace_all"]);
                return rest;
            }
            return input;
        }
        default:
            return input;
    }
}
