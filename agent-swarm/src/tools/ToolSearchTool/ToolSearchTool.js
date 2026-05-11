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
exports.ToolSearchTool = exports.outputSchema = exports.inputSchema = void 0;
exports.clearToolSearchDescriptionCache = clearToolSearchDescriptionCache;
var memoize_js_1 = require("lodash-es/memoize.js");
var v4_1 = require("zod/v4");
var index_js_1 = require("../../services/analytics/index.js");
var Tool_js_1 = require("../../Tool.js");
var debug_js_1 = require("../../utils/debug.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
var toolSearch_js_1 = require("../../utils/toolSearch.js");
var prompt_js_1 = require("./prompt.js");
exports.inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        query: v4_1.z
            .string()
            .describe('Query to find deferred tools. Use "select:<tool_name>" for direct selection, or keywords to search.'),
        max_results: v4_1.z
            .number()
            .optional()
            .default(5)
            .describe('Maximum number of results to return (default: 5)'),
    });
});
exports.outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        matches: v4_1.z.array(v4_1.z.string()),
        query: v4_1.z.string(),
        total_deferred_tools: v4_1.z.number(),
        pending_mcp_servers: v4_1.z.array(v4_1.z.string()).optional(),
    });
});
// Track deferred tool names to detect when cache should be cleared
var cachedDeferredToolNames = null;
/**
 * Get a cache key representing the current set of deferred tools.
 */
function getDeferredToolsCacheKey(deferredTools) {
    return deferredTools
        .map(function (t) { return t.name; })
        .sort()
        .join(',');
}
/**
 * Get tool description, memoized by tool name.
 * Used for keyword search scoring.
 */
var getToolDescriptionMemoized = (0, memoize_js_1.default)(function (toolName, tools) { return __awaiter(void 0, void 0, void 0, function () {
    var tool;
    return __generator(this, function (_a) {
        tool = (0, Tool_js_1.findToolByName)(tools, toolName);
        if (!tool) {
            return [2 /*return*/, ''];
        }
        return [2 /*return*/, tool.prompt({
                getToolPermissionContext: function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, ({
                                mode: 'default',
                                additionalWorkingDirectories: new Map(),
                                alwaysAllowRules: {},
                                alwaysDenyRules: {},
                                alwaysAskRules: {},
                                isBypassPermissionsModeAvailable: false,
                            })];
                    });
                }); },
                tools: tools,
                agents: [],
            })];
    });
}); }, function (toolName) { return toolName; });
/**
 * Invalidate the description cache if deferred tools have changed.
 */
function maybeInvalidateCache(deferredTools) {
    var _a, _b;
    var currentKey = getDeferredToolsCacheKey(deferredTools);
    if (cachedDeferredToolNames !== currentKey) {
        (0, debug_js_1.logForDebugging)("ToolSearchTool: cache invalidated - deferred tools changed");
        (_b = (_a = getToolDescriptionMemoized.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
        cachedDeferredToolNames = currentKey;
    }
}
function clearToolSearchDescriptionCache() {
    var _a, _b;
    (_b = (_a = getToolDescriptionMemoized.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    cachedDeferredToolNames = null;
}
/**
 * Build the search result output structure.
 */
function buildSearchResult(matches, query, totalDeferredTools, pendingMcpServers) {
    return {
        data: __assign({ matches: matches, query: query, total_deferred_tools: totalDeferredTools }, (pendingMcpServers && pendingMcpServers.length > 0
            ? { pending_mcp_servers: pendingMcpServers }
            : {})),
    };
}
/**
 * Parse tool name into searchable parts.
 * Handles both MCP tools (mcp__server__action) and regular tools (CamelCase).
 */
function parseToolName(name) {
    // Check if it's an MCP tool
    if (name.startsWith('mcp__')) {
        var withoutPrefix = name.replace(/^mcp__/, '').toLowerCase();
        var parts_1 = withoutPrefix.split('__').flatMap(function (p) { return p.split('_'); });
        return {
            parts: parts_1.filter(Boolean),
            full: withoutPrefix.replace(/__/g, ' ').replace(/_/g, ' '),
            isMcp: true,
        };
    }
    // Regular tool - split by CamelCase and underscores
    var parts = name
        .replace(/([a-z])([A-Z])/g, '$1 $2') // CamelCase to spaces
        .replace(/_/g, ' ')
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
    return {
        parts: parts,
        full: parts.join(' '),
        isMcp: false,
    };
}
/**
 * Pre-compile word-boundary regexes for all search terms.
 * Called once per search instead of tools×terms×2 times.
 */
function compileTermPatterns(terms) {
    var patterns = new Map();
    for (var _i = 0, terms_1 = terms; _i < terms_1.length; _i++) {
        var term = terms_1[_i];
        if (!patterns.has(term)) {
            patterns.set(term, new RegExp("\\b".concat((0, stringUtils_js_1.escapeRegExp)(term), "\\b")));
        }
    }
    return patterns;
}
/**
 * Keyword-based search over tool names and descriptions.
 * Handles both MCP tools (mcp__server__action) and regular tools (CamelCase).
 *
 * The model typically queries with:
 * - Server names when it knows the integration (e.g., "slack", "github")
 * - Action words when looking for functionality (e.g., "read", "list", "create")
 * - Tool-specific terms (e.g., "notebook", "shell", "kill")
 */
function searchToolsWithKeywords(query, deferredTools, tools, maxResults) {
    return __awaiter(this, void 0, void 0, function () {
        var queryLower, exactMatch, prefixMatches, queryTerms, requiredTerms, optionalTerms, _i, queryTerms_1, term, allScoringTerms, termPatterns, candidateTools, matches, scored;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    queryLower = query.toLowerCase().trim();
                    exactMatch = (_a = deferredTools.find(function (t) { return t.name.toLowerCase() === queryLower; })) !== null && _a !== void 0 ? _a : tools.find(function (t) { return t.name.toLowerCase() === queryLower; });
                    if (exactMatch) {
                        return [2 /*return*/, [exactMatch.name]];
                    }
                    // If query looks like an MCP tool prefix (mcp__server), find matching tools.
                    // Handles models searching by server name with mcp__ prefix.
                    if (queryLower.startsWith('mcp__') && queryLower.length > 5) {
                        prefixMatches = deferredTools
                            .filter(function (t) { return t.name.toLowerCase().startsWith(queryLower); })
                            .slice(0, maxResults)
                            .map(function (t) { return t.name; });
                        if (prefixMatches.length > 0) {
                            return [2 /*return*/, prefixMatches];
                        }
                    }
                    queryTerms = queryLower.split(/\s+/).filter(function (term) { return term.length > 0; });
                    requiredTerms = [];
                    optionalTerms = [];
                    for (_i = 0, queryTerms_1 = queryTerms; _i < queryTerms_1.length; _i++) {
                        term = queryTerms_1[_i];
                        if (term.startsWith('+') && term.length > 1) {
                            requiredTerms.push(term.slice(1));
                        }
                        else {
                            optionalTerms.push(term);
                        }
                    }
                    allScoringTerms = requiredTerms.length > 0 ? __spreadArray(__spreadArray([], requiredTerms, true), optionalTerms, true) : queryTerms;
                    termPatterns = compileTermPatterns(allScoringTerms);
                    candidateTools = deferredTools;
                    if (!(requiredTerms.length > 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, Promise.all(deferredTools.map(function (tool) { return __awaiter(_this, void 0, void 0, function () {
                            var parsed, description, descNormalized, hintNormalized, matchesAll;
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        parsed = parseToolName(tool.name);
                                        return [4 /*yield*/, getToolDescriptionMemoized(tool.name, tools)];
                                    case 1:
                                        description = _c.sent();
                                        descNormalized = description.toLowerCase();
                                        hintNormalized = (_b = (_a = tool.searchHint) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '';
                                        matchesAll = requiredTerms.every(function (term) {
                                            var pattern = termPatterns.get(term);
                                            return (parsed.parts.includes(term) ||
                                                parsed.parts.some(function (part) { return part.includes(term); }) ||
                                                pattern.test(descNormalized) ||
                                                (hintNormalized && pattern.test(hintNormalized)));
                                        });
                                        return [2 /*return*/, matchesAll ? tool : null];
                                }
                            });
                        }); }))];
                case 1:
                    matches = _b.sent();
                    candidateTools = matches.filter(function (t) { return t !== null; });
                    _b.label = 2;
                case 2: return [4 /*yield*/, Promise.all(candidateTools.map(function (tool) { return __awaiter(_this, void 0, void 0, function () {
                        var parsed, description, descNormalized, hintNormalized, score, _loop_1, _i, allScoringTerms_1, term;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    parsed = parseToolName(tool.name);
                                    return [4 /*yield*/, getToolDescriptionMemoized(tool.name, tools)];
                                case 1:
                                    description = _c.sent();
                                    descNormalized = description.toLowerCase();
                                    hintNormalized = (_b = (_a = tool.searchHint) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '';
                                    score = 0;
                                    _loop_1 = function (term) {
                                        var pattern = termPatterns.get(term);
                                        // Exact part match (high weight for MCP server names, tool name parts)
                                        if (parsed.parts.includes(term)) {
                                            score += parsed.isMcp ? 12 : 10;
                                        }
                                        else if (parsed.parts.some(function (part) { return part.includes(term); })) {
                                            score += parsed.isMcp ? 6 : 5;
                                        }
                                        // Full name fallback (for edge cases)
                                        if (parsed.full.includes(term) && score === 0) {
                                            score += 3;
                                        }
                                        // searchHint match — curated capability phrase, higher signal than prompt
                                        if (hintNormalized && pattern.test(hintNormalized)) {
                                            score += 4;
                                        }
                                        // Description match - use word boundary to avoid false positives
                                        if (pattern.test(descNormalized)) {
                                            score += 2;
                                        }
                                    };
                                    for (_i = 0, allScoringTerms_1 = allScoringTerms; _i < allScoringTerms_1.length; _i++) {
                                        term = allScoringTerms_1[_i];
                                        _loop_1(term);
                                    }
                                    return [2 /*return*/, { name: tool.name, score: score }];
                            }
                        });
                    }); }))];
                case 3:
                    scored = _b.sent();
                    return [2 /*return*/, scored
                            .filter(function (item) { return item.score > 0; })
                            .sort(function (a, b) { return b.score - a.score; })
                            .slice(0, maxResults)
                            .map(function (item) { return item.name; })];
            }
        });
    });
}
exports.ToolSearchTool = (0, Tool_js_1.buildTool)({
    isEnabled: function () {
        return (0, toolSearch_js_1.isToolSearchEnabledOptimistic)();
    },
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return true;
    },
    name: prompt_js_1.TOOL_SEARCH_TOOL_NAME,
    maxResultSizeChars: 100000,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.getPrompt)()];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.getPrompt)()];
            });
        });
    },
    get inputSchema() {
        return (0, exports.inputSchema)();
    },
    get outputSchema() {
        return (0, exports.outputSchema)();
    },
    call: function (input_1, _a) {
        return __awaiter(this, arguments, void 0, function (input, _b) {
            // Check for MCP servers still connecting
            function getPendingServerNames() {
                var appState = getAppState();
                var pending = appState.mcp.clients.filter(function (c) { return c.type === 'pending'; });
                return pending.length > 0 ? pending.map(function (s) { return s.name; }) : undefined;
            }
            // Helper to log search outcome
            function logSearchOutcome(matches, queryType) {
                (0, index_js_1.logEvent)('tengu_tool_search_outcome', {
                    query: query,
                    queryType: queryType,
                    matchCount: matches.length,
                    totalDeferredTools: deferredTools.length,
                    maxResults: max_results,
                    hasMatches: matches.length > 0,
                });
            }
            var query, _c, max_results, deferredTools, selectMatch, requested, found, missing, _i, requested_1, toolName, tool, pendingServers, matches, pendingServers;
            var _d;
            var tools = _b.options.tools, getAppState = _b.getAppState;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        query = input.query, _c = input.max_results, max_results = _c === void 0 ? 5 : _c;
                        deferredTools = tools.filter(prompt_js_1.isDeferredTool);
                        maybeInvalidateCache(deferredTools);
                        selectMatch = query.match(/^select:(.+)$/i);
                        if (selectMatch) {
                            requested = selectMatch[1]
                                .split(',')
                                .map(function (s) { return s.trim(); })
                                .filter(Boolean);
                            found = [];
                            missing = [];
                            for (_i = 0, requested_1 = requested; _i < requested_1.length; _i++) {
                                toolName = requested_1[_i];
                                tool = (_d = (0, Tool_js_1.findToolByName)(deferredTools, toolName)) !== null && _d !== void 0 ? _d : (0, Tool_js_1.findToolByName)(tools, toolName);
                                if (tool) {
                                    if (!found.includes(tool.name))
                                        found.push(tool.name);
                                }
                                else {
                                    missing.push(toolName);
                                }
                            }
                            if (found.length === 0) {
                                (0, debug_js_1.logForDebugging)("ToolSearchTool: select failed \u2014 none found: ".concat(missing.join(', ')));
                                logSearchOutcome([], 'select');
                                pendingServers = getPendingServerNames();
                                return [2 /*return*/, buildSearchResult([], query, deferredTools.length, pendingServers)];
                            }
                            if (missing.length > 0) {
                                (0, debug_js_1.logForDebugging)("ToolSearchTool: partial select \u2014 found: ".concat(found.join(', '), ", missing: ").concat(missing.join(', ')));
                            }
                            else {
                                (0, debug_js_1.logForDebugging)("ToolSearchTool: selected ".concat(found.join(', ')));
                            }
                            logSearchOutcome(found, 'select');
                            return [2 /*return*/, buildSearchResult(found, query, deferredTools.length)];
                        }
                        return [4 /*yield*/, searchToolsWithKeywords(query, deferredTools, tools, max_results)];
                    case 1:
                        matches = _e.sent();
                        (0, debug_js_1.logForDebugging)("ToolSearchTool: keyword search for \"".concat(query, "\", found ").concat(matches.length, " matches"));
                        logSearchOutcome(matches, 'keyword');
                        // Include pending server info when search finds no matches
                        if (matches.length === 0) {
                            pendingServers = getPendingServerNames();
                            return [2 /*return*/, buildSearchResult(matches, query, deferredTools.length, pendingServers)];
                        }
                        return [2 /*return*/, buildSearchResult(matches, query, deferredTools.length)];
                }
            });
        });
    },
    renderToolUseMessage: function () {
        return null;
    },
    userFacingName: function () { return ''; },
    /**
     * Returns a tool_result with tool_reference blocks.
     * This format works on 1P/Foundry. Bedrock/Vertex may not support
     * client-side tool_reference expansion yet.
     */
    mapToolResultToToolResultBlockParam: function (content, toolUseID) {
        if (content.matches.length === 0) {
            var text = 'No matching deferred tools found';
            if (content.pending_mcp_servers &&
                content.pending_mcp_servers.length > 0) {
                text += ". Some MCP servers are still connecting: ".concat(content.pending_mcp_servers.join(', '), ". Their tools will become available shortly \u2014 try searching again.");
            }
            return {
                type: 'tool_result',
                tool_use_id: toolUseID,
                content: text,
            };
        }
        return {
            type: 'tool_result',
            tool_use_id: toolUseID,
            content: content.matches.map(function (name) { return ({
                type: 'tool_reference',
                tool_name: name,
            }); }),
        };
    },
});
