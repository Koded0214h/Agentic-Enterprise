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
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeKnownChannels = void 0;
exports.hasSlackMcpServer = hasSlackMcpServer;
exports.getKnownChannelsVersion = getKnownChannelsVersion;
exports.findSlackChannelPositions = findSlackChannelPositions;
exports.getSlackChannelSuggestions = getSlackChannelSuggestions;
exports.clearSlackChannelCache = clearSlackChannelCache;
var zod_1 = require("zod");
var debug_js_1 = require("../debug.js");
var lazySchema_js_1 = require("../lazySchema.js");
var signal_js_1 = require("../signal.js");
var slowOperations_js_1 = require("../slowOperations.js");
var SLACK_SEARCH_TOOL = 'slack_search_channels';
// Plain Map (not LRUCache) — findReusableCacheEntry needs to iterate all
// entries for prefix matching, which LRUCache doesn't expose cleanly.
var cache = new Map();
// Flat set of every channel name ever returned by MCP — used to gate
// highlighting so only confirmed-real channels turn blue in the prompt.
var knownChannels = new Set();
var knownChannelsVersion = 0;
var knownChannelsChanged = (0, signal_js_1.createSignal)();
exports.subscribeKnownChannels = knownChannelsChanged.subscribe;
var inflightQuery = null;
var inflightPromise = null;
function findSlackClient(clients) {
    return clients.find(function (c) { return c.type === 'connected' && c.name.includes('slack'); });
}
function fetchChannels(clients, query) {
    return __awaiter(this, void 0, void 0, function () {
        var slackClient, result, content, rawText, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    slackClient = findSlackClient(clients);
                    if (!slackClient || slackClient.type !== 'connected') {
                        return [2 /*return*/, []];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, slackClient.client.callTool({
                            name: SLACK_SEARCH_TOOL,
                            arguments: {
                                query: query,
                                limit: 20,
                                channel_types: 'public_channel,private_channel',
                            },
                        }, undefined, { timeout: 5000 })];
                case 2:
                    result = _a.sent();
                    content = result.content;
                    if (!Array.isArray(content))
                        return [2 /*return*/, []];
                    rawText = content
                        .filter(function (c) { return c.type === 'text'; })
                        .map(function (c) { return c.text; })
                        .join('\n');
                    return [2 /*return*/, parseChannels(unwrapResults(rawText))];
                case 3:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to fetch Slack channels: ".concat(error_1));
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// The Slack MCP server wraps its markdown in a JSON envelope:
// {"results":"# Search Results...\nName: #chan\n..."}
var resultsEnvelopeSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return zod_1.z.object({ results: zod_1.z.string() });
});
function unwrapResults(text) {
    var trimmed = text.trim();
    if (!trimmed.startsWith('{'))
        return text;
    try {
        var parsed = resultsEnvelopeSchema().safeParse((0, slowOperations_js_1.jsonParse)(trimmed));
        if (parsed.success)
            return parsed.data.results;
    }
    catch (_a) {
        // jsonParse threw — fall through
    }
    return text;
}
// Parse channel names from slack_search_channels text output.
// The Slack MCP server returns markdown with "Name: #channel-name" lines.
function parseChannels(text) {
    var channels = [];
    var seen = new Set();
    for (var _i = 0, _a = text.split('\n'); _i < _a.length; _i++) {
        var line = _a[_i];
        var m = line.match(/^Name:\s*#?([a-z0-9][a-z0-9_-]{0,79})\s*$/);
        if (m && !seen.has(m[1])) {
            seen.add(m[1]);
            channels.push(m[1]);
        }
    }
    return channels;
}
function hasSlackMcpServer(clients) {
    return findSlackClient(clients) !== undefined;
}
function getKnownChannelsVersion() {
    return knownChannelsVersion;
}
function findSlackChannelPositions(text) {
    var positions = [];
    var re = /(^|\s)#([a-z0-9][a-z0-9_-]{0,79})(?=\s|$)/g;
    var m;
    while ((m = re.exec(text)) !== null) {
        if (!knownChannels.has(m[2]))
            continue;
        var start = m.index + m[1].length;
        positions.push({ start: start, end: start + 1 + m[2].length });
    }
    return positions;
}
// Slack's search tokenizes on hyphens and requires whole-word matches, so
// "claude-code-team-en" returns 0 results. Strip the trailing partial segment
// so the MCP query is "claude-code-team" (complete words only), then filter
// locally. This keeps the query maximally specific (avoiding the 20-result
// cap) while never sending a partial word that kills the search.
function mcpQueryFor(searchToken) {
    var lastSep = Math.max(searchToken.lastIndexOf('-'), searchToken.lastIndexOf('_'));
    return lastSep > 0 ? searchToken.slice(0, lastSep) : searchToken;
}
// Find a cached entry whose key is a prefix of mcpQuery and still has
// matches for searchToken. Lets typing "c"→"cl"→"cla" reuse the "c" cache
// instead of issuing a new MCP call per keystroke.
function findReusableCacheEntry(mcpQuery, searchToken) {
    var best;
    var bestLen = 0;
    for (var _i = 0, cache_1 = cache; _i < cache_1.length; _i++) {
        var _a = cache_1[_i], key = _a[0], channels = _a[1];
        if (mcpQuery.startsWith(key) &&
            key.length > bestLen &&
            channels.some(function (c) { return c.startsWith(searchToken); })) {
            best = channels;
            bestLen = key.length;
        }
    }
    return best;
}
function getSlackChannelSuggestions(clients, searchToken) {
    return __awaiter(this, void 0, void 0, function () {
        var mcpQuery, lower, channels, before, _i, channels_1, c;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!searchToken)
                        return [2 /*return*/, []];
                    mcpQuery = mcpQueryFor(searchToken);
                    lower = searchToken.toLowerCase();
                    channels = (_a = cache.get(mcpQuery)) !== null && _a !== void 0 ? _a : findReusableCacheEntry(mcpQuery, lower);
                    if (!!channels) return [3 /*break*/, 4];
                    if (!(inflightQuery === mcpQuery && inflightPromise)) return [3 /*break*/, 2];
                    return [4 /*yield*/, inflightPromise];
                case 1:
                    channels = _b.sent();
                    return [3 /*break*/, 4];
                case 2:
                    inflightQuery = mcpQuery;
                    inflightPromise = fetchChannels(clients, mcpQuery);
                    return [4 /*yield*/, inflightPromise];
                case 3:
                    channels = _b.sent();
                    cache.set(mcpQuery, channels);
                    before = knownChannels.size;
                    for (_i = 0, channels_1 = channels; _i < channels_1.length; _i++) {
                        c = channels_1[_i];
                        knownChannels.add(c);
                    }
                    if (knownChannels.size !== before) {
                        knownChannelsVersion++;
                        knownChannelsChanged.emit();
                    }
                    if (cache.size > 50) {
                        cache.delete(cache.keys().next().value);
                    }
                    if (inflightQuery === mcpQuery) {
                        inflightQuery = null;
                        inflightPromise = null;
                    }
                    _b.label = 4;
                case 4: return [2 /*return*/, channels
                        .filter(function (c) { return c.startsWith(lower); })
                        .sort()
                        .slice(0, 10)
                        .map(function (c) { return ({
                        id: "slack-channel-".concat(c),
                        displayText: "#".concat(c),
                    }); })];
            }
        });
    });
}
function clearSlackChannelCache() {
    cache.clear();
    knownChannels.clear();
    knownChannelsVersion = 0;
    inflightQuery = null;
    inflightPromise = null;
}
