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
exports.generateUnifiedSuggestions = generateUnifiedSuggestions;
var fuse_js_1 = require("fuse.js");
var path_1 = require("path");
var fileSuggestions_js_1 = require("src/hooks/fileSuggestions.js");
var agentColorManager_js_1 = require("src/tools/AgentTool/agentColorManager.js");
var format_js_1 = require("src/utils/format.js");
var log_js_1 = require("src/utils/log.js");
/**
 * Creates a unified suggestion item from a source
 */
function createSuggestionFromSource(source) {
    switch (source.type) {
        case 'file':
            return {
                id: "file-".concat(source.path),
                displayText: source.displayText,
                description: source.description,
            };
        case 'mcp_resource':
            return {
                id: "mcp-resource-".concat(source.server, "__").concat(source.uri),
                displayText: source.displayText,
                description: source.description,
            };
        case 'agent':
            return {
                id: "agent-".concat(source.agentType),
                displayText: source.displayText,
                description: source.description,
                color: source.color,
            };
    }
}
var MAX_UNIFIED_SUGGESTIONS = 15;
var DESCRIPTION_MAX_LENGTH = 60;
function truncateDescription(description) {
    return (0, format_js_1.truncateToWidth)(description, DESCRIPTION_MAX_LENGTH);
}
function generateAgentSuggestions(agents, query, showOnEmpty) {
    if (showOnEmpty === void 0) { showOnEmpty = false; }
    if (!query && !showOnEmpty) {
        return [];
    }
    try {
        var agentSources = agents.map(function (agent) { return ({
            type: 'agent',
            displayText: "".concat(agent.agentType, " (agent)"),
            description: truncateDescription(agent.whenToUse),
            agentType: agent.agentType,
            color: (0, agentColorManager_js_1.getAgentColor)(agent.agentType),
        }); });
        if (!query) {
            return agentSources;
        }
        var queryLower_1 = query.toLowerCase();
        return agentSources.filter(function (agent) {
            return agent.agentType.toLowerCase().includes(queryLower_1) ||
                agent.displayText.toLowerCase().includes(queryLower_1);
        });
    }
    catch (error) {
        (0, log_js_1.logError)(error);
        return [];
    }
}
function generateUnifiedSuggestions(query_1, mcpResources_1, agents_1) {
    return __awaiter(this, arguments, void 0, function (query, mcpResources, agents, showOnEmpty) {
        var _a, fileSuggestions, agentSources, fileSources, mcpSources, allSources, nonFileSources, scoredResults, _i, fileSources_1, fileSource, fuse, fuseResults, _b, fuseResults_1, result;
        var _c, _d;
        if (showOnEmpty === void 0) { showOnEmpty = false; }
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!query && !showOnEmpty) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, Promise.all([
                            (0, fileSuggestions_js_1.generateFileSuggestions)(query, showOnEmpty),
                            Promise.resolve(generateAgentSuggestions(agents, query, showOnEmpty)),
                        ])];
                case 1:
                    _a = _e.sent(), fileSuggestions = _a[0], agentSources = _a[1];
                    fileSources = fileSuggestions.map(function (suggestion) {
                        var _a;
                        return ({
                            type: 'file',
                            displayText: suggestion.displayText,
                            description: suggestion.description,
                            path: suggestion.displayText, // Use displayText as path for files
                            filename: (0, path_1.basename)(suggestion.displayText),
                            score: (_a = suggestion.metadata) === null || _a === void 0 ? void 0 : _a.score,
                        });
                    });
                    mcpSources = Object.values(mcpResources)
                        .flat()
                        .map(function (resource) { return ({
                        type: 'mcp_resource',
                        displayText: "".concat(resource.server, ":").concat(resource.uri),
                        description: truncateDescription(resource.description || resource.name || resource.uri),
                        server: resource.server,
                        uri: resource.uri,
                        name: resource.name || resource.uri,
                    }); });
                    if (!query) {
                        allSources = __spreadArray(__spreadArray(__spreadArray([], fileSources, true), mcpSources, true), agentSources, true);
                        return [2 /*return*/, allSources
                                .slice(0, MAX_UNIFIED_SUGGESTIONS)
                                .map(createSuggestionFromSource)];
                    }
                    nonFileSources = __spreadArray(__spreadArray([], mcpSources, true), agentSources, true);
                    scoredResults = [];
                    // Add file sources with their nucleo scores (already 0-1, lower is better)
                    for (_i = 0, fileSources_1 = fileSources; _i < fileSources_1.length; _i++) {
                        fileSource = fileSources_1[_i];
                        scoredResults.push({
                            source: fileSource,
                            score: (_c = fileSource.score) !== null && _c !== void 0 ? _c : 0.5, // Default to middle score if missing
                        });
                    }
                    // Score non-file sources with Fuse.js and add them
                    if (nonFileSources.length > 0) {
                        fuse = new fuse_js_1.default(nonFileSources, {
                            includeScore: true,
                            threshold: 0.6, // Allow more matches through, we'll sort by score
                            keys: [
                                { name: 'displayText', weight: 2 },
                                { name: 'name', weight: 3 },
                                { name: 'server', weight: 1 },
                                { name: 'description', weight: 1 },
                                { name: 'agentType', weight: 3 },
                            ],
                        });
                        fuseResults = fuse.search(query, { limit: MAX_UNIFIED_SUGGESTIONS });
                        for (_b = 0, fuseResults_1 = fuseResults; _b < fuseResults_1.length; _b++) {
                            result = fuseResults_1[_b];
                            scoredResults.push({
                                source: result.item,
                                score: (_d = result.score) !== null && _d !== void 0 ? _d : 0.5,
                            });
                        }
                    }
                    // Sort all results by score (lower is better) and return top results
                    scoredResults.sort(function (a, b) { return a.score - b.score; });
                    return [2 /*return*/, scoredResults
                            .slice(0, MAX_UNIFIED_SUGGESTIONS)
                            .map(function (r) { return r.source; })
                            .map(createSuggestionFromSource)];
            }
        });
    });
}
