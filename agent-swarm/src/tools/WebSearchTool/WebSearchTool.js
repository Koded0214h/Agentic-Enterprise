"use strict";
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSearchTool = void 0;
var providers_js_1 = require("src/utils/model/providers.js");
var v4_1 = require("zod/v4");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var claude_js_1 = require("../../services/api/claude.js");
var Tool_js_1 = require("../../Tool.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var log_js_1 = require("../../utils/log.js");
var messages_js_1 = require("../../utils/messages.js");
var model_js_1 = require("../../utils/model/model.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var systemPromptType_js_1 = require("../../utils/systemPromptType.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        query: v4_1.z.string().min(2).describe('The search query to use'),
        allowed_domains: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Only include search results from these domains'),
        blocked_domains: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Never include search results from these domains'),
    });
});
var searchResultSchema = (0, lazySchema_js_1.lazySchema)(function () {
    var searchHitSchema = v4_1.z.object({
        title: v4_1.z.string().describe('The title of the search result'),
        url: v4_1.z.string().describe('The URL of the search result'),
    });
    return v4_1.z.object({
        tool_use_id: v4_1.z.string().describe('ID of the tool use'),
        content: v4_1.z.array(searchHitSchema).describe('Array of search hits'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        query: v4_1.z.string().describe('The search query that was executed'),
        results: v4_1.z
            .array(v4_1.z.union([searchResultSchema(), v4_1.z.string()]))
            .describe('Search results and/or text commentary from the model'),
        durationSeconds: v4_1.z
            .number()
            .describe('Time taken to complete the search operation'),
    });
});
function makeToolSchema(input) {
    return {
        type: 'web_search_20250305',
        name: 'web_search',
        allowed_domains: input.allowed_domains,
        blocked_domains: input.blocked_domains,
        max_uses: 8, // Hardcoded to 8 searches maximum
    };
}
function makeOutputFromSearchResponse(result, query, durationSeconds) {
    // The result is a sequence of these blocks:
    // - text to start -- always?
    // [
    //    - server_tool_use
    //    - web_search_tool_result
    //    - text and citation blocks intermingled
    //  ]+  (this block repeated for each search)
    var results = [];
    var textAcc = '';
    var inText = true;
    for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
        var block = result_1[_i];
        if (block.type === 'server_tool_use') {
            if (inText) {
                inText = false;
                if (textAcc.trim().length > 0) {
                    results.push(textAcc.trim());
                }
                textAcc = '';
            }
            continue;
        }
        if (block.type === 'web_search_tool_result') {
            // Handle error case - content is a WebSearchToolResultError
            if (!Array.isArray(block.content)) {
                var errorMessage = "Web search error: ".concat(block.content.error_code);
                (0, log_js_1.logError)(new Error(errorMessage));
                results.push(errorMessage);
                continue;
            }
            // Success case - add results to our collection
            var hits = block.content.map(function (r) { return ({ title: r.title, url: r.url }); });
            results.push({
                tool_use_id: block.tool_use_id,
                content: hits,
            });
        }
        if (block.type === 'text') {
            if (inText) {
                textAcc += block.text;
            }
            else {
                inText = true;
                textAcc = block.text;
            }
        }
    }
    if (textAcc.length) {
        results.push(textAcc.trim());
    }
    return {
        query: query,
        results: results,
        durationSeconds: durationSeconds,
    };
}
exports.WebSearchTool = (0, Tool_js_1.buildTool)({
    name: prompt_js_1.WEB_SEARCH_TOOL_NAME,
    searchHint: 'search the web for current information',
    maxResultSizeChars: 100000,
    shouldDefer: true,
    description: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, "Claude wants to search the web for: ".concat(input.query)];
            });
        });
    },
    userFacingName: function () {
        return 'Web Search';
    },
    getToolUseSummary: UI_js_1.getToolUseSummary,
    getActivityDescription: function (input) {
        var summary = (0, UI_js_1.getToolUseSummary)(input);
        return summary ? "Searching for ".concat(summary) : 'Searching the web';
    },
    isEnabled: function () {
        var provider = (0, providers_js_1.getAPIProvider)();
        var model = (0, model_js_1.getMainLoopModel)();
        // Enable for firstParty
        if (provider === 'firstParty') {
            return true;
        }
        // Enable for Vertex AI with supported models (Claude 4.0+)
        if (provider === 'vertex') {
            var supportsWebSearch = model.includes('claude-opus-4') ||
                model.includes('claude-sonnet-4') ||
                model.includes('claude-haiku-4');
            return supportsWebSearch;
        }
        // Foundry only ships models that already support Web Search
        if (provider === 'foundry') {
            return true;
        }
        return false;
    },
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return true;
    },
    toAutoClassifierInput: function (input) {
        return input.query;
    },
    checkPermissions: function (_input) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        behavior: 'passthrough',
                        message: 'WebSearchTool requires permission.',
                        suggestions: [
                            {
                                type: 'addRules',
                                rules: [{ toolName: prompt_js_1.WEB_SEARCH_TOOL_NAME }],
                                behavior: 'allow',
                                destination: 'localSettings',
                            },
                        ],
                    }];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.getWebSearchPrompt)()];
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolUseProgressMessage: UI_js_1.renderToolUseProgressMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    extractSearchText: function () {
        // renderToolResultMessage shows only "Did N searches in Xs" chrome —
        // the results[] content never appears on screen. Heuristic would index
        // string entries in results[] (phantom match). Nothing to search.
        return '';
    },
    validateInput: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var query, allowed_domains, blocked_domains;
            return __generator(this, function (_a) {
                query = input.query, allowed_domains = input.allowed_domains, blocked_domains = input.blocked_domains;
                if (!query.length) {
                    return [2 /*return*/, {
                            result: false,
                            message: 'Error: Missing query',
                            errorCode: 1,
                        }];
                }
                if ((allowed_domains === null || allowed_domains === void 0 ? void 0 : allowed_domains.length) && (blocked_domains === null || blocked_domains === void 0 ? void 0 : blocked_domains.length)) {
                    return [2 /*return*/, {
                            result: false,
                            message: 'Error: Cannot specify both allowed_domains and blocked_domains in the same request',
                            errorCode: 2,
                        }];
                }
                return [2 /*return*/, { result: true }];
            });
        });
    },
    call: function (input, context, _canUseTool, _parentMessage, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, query, userMessage, toolSchema, useHaiku, appState, queryStream, allContentBlocks, currentToolUseId, currentToolUseJson, progressCounter, toolUseQueries, _a, queryStream_1, queryStream_1_1, event_1, contentBlock, delta, queryMatch, query_1, contentBlock, toolUseId, actualQuery, content, e_1_1, endTime, durationSeconds, data;
            var _this = this;
            var _b, e_1, _c, _d;
            var _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        startTime = performance.now();
                        query = input.query;
                        userMessage = (0, messages_js_1.createUserMessage)({
                            content: 'Perform a web search for the query: ' + query,
                        });
                        toolSchema = makeToolSchema(input);
                        useHaiku = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_plum_vx3', false);
                        appState = context.getAppState();
                        queryStream = (0, claude_js_1.queryModelWithStreaming)({
                            messages: [userMessage],
                            systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)([
                                'You are an assistant for performing a web search tool use',
                            ]),
                            thinkingConfig: useHaiku
                                ? { type: 'disabled' }
                                : context.options.thinkingConfig,
                            tools: [],
                            signal: context.abortController.signal,
                            options: {
                                getToolPermissionContext: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/, appState.toolPermissionContext];
                                }); }); },
                                model: useHaiku ? (0, model_js_1.getSmallFastModel)() : context.options.mainLoopModel,
                                toolChoice: useHaiku ? { type: 'tool', name: 'web_search' } : undefined,
                                isNonInteractiveSession: context.options.isNonInteractiveSession,
                                hasAppendSystemPrompt: !!context.options.appendSystemPrompt,
                                extraToolSchemas: [toolSchema],
                                querySource: 'web_search_tool',
                                agents: context.options.agentDefinitions.activeAgents,
                                mcpTools: [],
                                agentId: context.agentId,
                                effortValue: appState.effortValue,
                            },
                        });
                        allContentBlocks = [];
                        currentToolUseId = null;
                        currentToolUseJson = '';
                        progressCounter = 0;
                        toolUseQueries = new Map() // Map of tool_use_id to query
                        ;
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 6, 7, 12]);
                        _a = true, queryStream_1 = __asyncValues(queryStream);
                        _h.label = 2;
                    case 2: return [4 /*yield*/, queryStream_1.next()];
                    case 3:
                        if (!(queryStream_1_1 = _h.sent(), _b = queryStream_1_1.done, !_b)) return [3 /*break*/, 5];
                        _d = queryStream_1_1.value;
                        _a = false;
                        event_1 = _d;
                        if (event_1.type === 'assistant') {
                            allContentBlocks.push.apply(allContentBlocks, event_1.message.content);
                            return [3 /*break*/, 4];
                        }
                        // Track tool use ID when server_tool_use starts
                        if (event_1.type === 'stream_event' &&
                            ((_e = event_1.event) === null || _e === void 0 ? void 0 : _e.type) === 'content_block_start') {
                            contentBlock = event_1.event.content_block;
                            if (contentBlock && contentBlock.type === 'server_tool_use') {
                                currentToolUseId = contentBlock.id;
                                currentToolUseJson = '';
                                // Note: The ServerToolUseBlock doesn't contain input.query
                                // The actual query comes through input_json_delta events
                                return [3 /*break*/, 4];
                            }
                        }
                        // Accumulate JSON for current tool use
                        if (currentToolUseId &&
                            event_1.type === 'stream_event' &&
                            ((_f = event_1.event) === null || _f === void 0 ? void 0 : _f.type) === 'content_block_delta') {
                            delta = event_1.event.delta;
                            if ((delta === null || delta === void 0 ? void 0 : delta.type) === 'input_json_delta' && delta.partial_json) {
                                currentToolUseJson += delta.partial_json;
                                // Try to extract query from partial JSON for progress updates
                                try {
                                    queryMatch = currentToolUseJson.match(/"query"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                                    if (queryMatch && queryMatch[1]) {
                                        query_1 = (0, slowOperations_js_1.jsonParse)('"' + queryMatch[1] + '"');
                                        if (!toolUseQueries.has(currentToolUseId) ||
                                            toolUseQueries.get(currentToolUseId) !== query_1) {
                                            toolUseQueries.set(currentToolUseId, query_1);
                                            progressCounter++;
                                            if (onProgress) {
                                                onProgress({
                                                    toolUseID: "search-progress-".concat(progressCounter),
                                                    data: {
                                                        type: 'query_update',
                                                        query: query_1,
                                                    },
                                                });
                                            }
                                        }
                                    }
                                }
                                catch (_j) {
                                    // Ignore parsing errors for partial JSON
                                }
                            }
                        }
                        // Yield progress when search results come in
                        if (event_1.type === 'stream_event' &&
                            ((_g = event_1.event) === null || _g === void 0 ? void 0 : _g.type) === 'content_block_start') {
                            contentBlock = event_1.event.content_block;
                            if (contentBlock && contentBlock.type === 'web_search_tool_result') {
                                toolUseId = contentBlock.tool_use_id;
                                actualQuery = toolUseQueries.get(toolUseId) || query;
                                content = contentBlock.content;
                                progressCounter++;
                                if (onProgress) {
                                    onProgress({
                                        toolUseID: toolUseId || "search-progress-".concat(progressCounter),
                                        data: {
                                            type: 'search_results_received',
                                            resultCount: Array.isArray(content) ? content.length : 0,
                                            query: actualQuery,
                                        },
                                    });
                                }
                            }
                        }
                        _h.label = 4;
                    case 4:
                        _a = true;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 12];
                    case 6:
                        e_1_1 = _h.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 12];
                    case 7:
                        _h.trys.push([7, , 10, 11]);
                        if (!(!_a && !_b && (_c = queryStream_1.return))) return [3 /*break*/, 9];
                        return [4 /*yield*/, _c.call(queryStream_1)];
                    case 8:
                        _h.sent();
                        _h.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 11: return [7 /*endfinally*/];
                    case 12:
                        endTime = performance.now();
                        durationSeconds = (endTime - startTime) / 1000;
                        data = makeOutputFromSearchResponse(allContentBlocks, query, durationSeconds);
                        return [2 /*return*/, { data: data }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (output, toolUseID) {
        var query = output.query, results = output.results;
        var formattedOutput = "Web search results for query: \"".concat(query, "\"\n\n");
        (results !== null && results !== void 0 ? results : []).forEach(function (result) {
            var _a;
            if (result == null) {
                return;
            }
            if (typeof result === 'string') {
                // Text summary
                formattedOutput += result + '\n\n';
            }
            else {
                // Search result with links
                if (((_a = result.content) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    formattedOutput += "Links: ".concat((0, slowOperations_js_1.jsonStringify)(result.content), "\n\n");
                }
                else {
                    formattedOutput += 'No links found.\n\n';
                }
            }
        });
        formattedOutput +=
            '\nREMINDER: You MUST include the sources above in your response to the user using markdown hyperlinks.';
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: formattedOutput.trim(),
        };
    },
});
