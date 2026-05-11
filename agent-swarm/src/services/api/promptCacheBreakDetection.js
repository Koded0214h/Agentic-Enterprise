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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL_1HOUR_MS = void 0;
exports.recordPromptState = recordPromptState;
exports.checkResponseForCacheBreak = checkResponseForCacheBreak;
exports.notifyCacheDeletion = notifyCacheDeletion;
exports.notifyCompaction = notifyCompaction;
exports.cleanupAgentTracking = cleanupAgentTracking;
exports.resetPromptCacheBreakDetection = resetPromptCacheBreakDetection;
var diff_1 = require("diff");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var debug_js_1 = require("src/utils/debug.js");
var hash_js_1 = require("src/utils/hash.js");
var log_js_1 = require("src/utils/log.js");
var filesystem_js_1 = require("src/utils/permissions/filesystem.js");
var slowOperations_js_1 = require("src/utils/slowOperations.js");
var index_js_1 = require("../analytics/index.js");
function getCacheBreakDiffPath() {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var suffix = '';
    for (var i = 0; i < 4; i++) {
        suffix += chars[Math.floor(Math.random() * chars.length)];
    }
    return (0, path_1.join)((0, filesystem_js_1.getClaudeTempDir)(), "cache-break-".concat(suffix, ".diff"));
}
var previousStateBySource = new Map();
// Cap the number of tracked sources to prevent unbounded memory growth.
// Each entry stores a ~300KB+ diffableContent string (serialized system prompt
// + tool schemas). Without a cap, spawning many subagents (each with a unique
// agentId key) causes the map to grow indefinitely.
var MAX_TRACKED_SOURCES = 10;
var TRACKED_SOURCE_PREFIXES = [
    'repl_main_thread',
    'sdk',
    'agent:custom',
    'agent:default',
    'agent:builtin',
];
// Minimum absolute token drop required to trigger a cache break warning.
// Small drops (e.g., a few thousand tokens) can happen due to normal variation
// and aren't worth alerting on.
var MIN_CACHE_MISS_TOKENS = 2000;
// Anthropic's server-side prompt cache TTL thresholds to test.
// Cache breaks after these durations are likely due to TTL expiration
// rather than client-side changes.
var CACHE_TTL_5MIN_MS = 5 * 60 * 1000;
exports.CACHE_TTL_1HOUR_MS = 60 * 60 * 1000;
// Models to exclude from cache break detection (e.g., haiku has different caching behavior)
function isExcludedModel(model) {
    return model.includes('haiku');
}
/**
 * Returns the tracking key for a querySource, or null if untracked.
 * Compact shares the same server-side cache as repl_main_thread
 * (same cacheSafeParams), so they share tracking state.
 *
 * For subagents with a tracked querySource, uses the unique agentId to
 * isolate tracking state. This prevents false positive cache break
 * notifications when multiple instances of the same agent type run
 * concurrently.
 *
 * Untracked sources (speculation, session_memory, prompt_suggestion, etc.)
 * are short-lived forked agents where cache break detection provides no
 * value — they run 1-3 turns with a fresh agentId each time, so there's
 * nothing meaningful to compare against. Their cache metrics are still
 * logged via tengu_api_success for analytics.
 */
function getTrackingKey(querySource, agentId) {
    if (querySource === 'compact')
        return 'repl_main_thread';
    for (var _i = 0, TRACKED_SOURCE_PREFIXES_1 = TRACKED_SOURCE_PREFIXES; _i < TRACKED_SOURCE_PREFIXES_1.length; _i++) {
        var prefix = TRACKED_SOURCE_PREFIXES_1[_i];
        if (querySource.startsWith(prefix))
            return agentId || querySource;
    }
    return null;
}
function stripCacheControl(items) {
    return items.map(function (item) {
        if (!('cache_control' in item))
            return item;
        var _ = item.cache_control, rest = __rest(item, ["cache_control"]);
        return rest;
    });
}
function computeHash(data) {
    var str = (0, slowOperations_js_1.jsonStringify)(data);
    if (typeof Bun !== 'undefined') {
        var hash = Bun.hash(str);
        // Bun.hash can return bigint for large inputs; convert to number safely
        return typeof hash === 'bigint' ? Number(hash & 0xffffffffn) : hash;
    }
    // Fallback for non-Bun runtimes (e.g. Node.js via npm global install)
    return (0, hash_js_1.djb2Hash)(str);
}
/** MCP tool names are user-controlled (server config) and may leak filepaths.
 *  Collapse them to 'mcp'; built-in names are a fixed vocabulary. */
function sanitizeToolName(name) {
    return name.startsWith('mcp__') ? 'mcp' : name;
}
function computePerToolHashes(strippedTools, names) {
    var _a;
    var hashes = {};
    for (var i = 0; i < strippedTools.length; i++) {
        hashes[(_a = names[i]) !== null && _a !== void 0 ? _a : "__idx_".concat(i)] = computeHash(strippedTools[i]);
    }
    return hashes;
}
function getSystemCharCount(system) {
    var total = 0;
    for (var _i = 0, system_1 = system; _i < system_1.length; _i++) {
        var block = system_1[_i];
        total += block.text.length;
    }
    return total;
}
function buildDiffableContent(system, tools, model) {
    var systemText = system.map(function (b) { return b.text; }).join('\n\n');
    var toolDetails = tools
        .map(function (t) {
        if (!('name' in t))
            return 'unknown';
        var desc = 'description' in t ? t.description : '';
        var schema = 'input_schema' in t ? (0, slowOperations_js_1.jsonStringify)(t.input_schema) : '';
        return "".concat(t.name, "\n  description: ").concat(desc, "\n  input_schema: ").concat(schema);
    })
        .sort()
        .join('\n\n');
    return "Model: ".concat(model, "\n\n=== System Prompt ===\n\n").concat(systemText, "\n\n=== Tools (").concat(tools.length, ") ===\n\n").concat(toolDetails, "\n");
}
/**
 * Phase 1 (pre-call): Record the current prompt/tool state and detect what changed.
 * Does NOT fire events — just stores pending changes for phase 2 to use.
 */
function recordPromptState(snapshot) {
    try {
        var system_2 = snapshot.system, toolSchemas_1 = snapshot.toolSchemas, querySource = snapshot.querySource, model_1 = snapshot.model, agentId = snapshot.agentId, fastMode = snapshot.fastMode, _a = snapshot.globalCacheStrategy, globalCacheStrategy = _a === void 0 ? '' : _a, _b = snapshot.betas, betas = _b === void 0 ? [] : _b, _c = snapshot.autoModeActive, autoModeActive = _c === void 0 ? false : _c, _d = snapshot.isUsingOverage, isUsingOverage = _d === void 0 ? false : _d, _e = snapshot.cachedMCEnabled, cachedMCEnabled = _e === void 0 ? false : _e, effortValue = snapshot.effortValue, extraBodyParams = snapshot.extraBodyParams;
        var key = getTrackingKey(querySource, agentId);
        if (!key)
            return;
        var strippedSystem = stripCacheControl(system_2);
        var strippedTools_1 = stripCacheControl(toolSchemas_1);
        var systemHash = computeHash(strippedSystem);
        var toolsHash = computeHash(strippedTools_1);
        // Hash the full system array INCLUDING cache_control — this catches
        // scope flips (global↔org/none) and TTL flips (1h↔5m) that the stripped
        // hash can't see because the text content is identical.
        var cacheControlHash = computeHash(system_2.map(function (b) { return ('cache_control' in b ? b.cache_control : null); }));
        var toolNames_2 = toolSchemas_1.map(function (t) { return ('name' in t ? t.name : 'unknown'); });
        // Only compute per-tool hashes when the aggregate changed — common case
        // (tools unchanged) skips N extra jsonStringify calls.
        var computeToolHashes = function () {
            return computePerToolHashes(strippedTools_1, toolNames_2);
        };
        var systemCharCount = getSystemCharCount(system_2);
        var lazyDiffableContent = function () {
            return buildDiffableContent(system_2, toolSchemas_1, model_1);
        };
        var isFastMode = fastMode !== null && fastMode !== void 0 ? fastMode : false;
        var sortedBetas = __spreadArray([], betas, true).sort();
        var effortStr = effortValue === undefined ? '' : String(effortValue);
        var extraBodyHash = extraBodyParams === undefined ? 0 : computeHash(extraBodyParams);
        var prev_1 = previousStateBySource.get(key);
        if (!prev_1) {
            // Evict oldest entries if map is at capacity
            while (previousStateBySource.size >= MAX_TRACKED_SOURCES) {
                var oldest = previousStateBySource.keys().next().value;
                if (oldest !== undefined)
                    previousStateBySource.delete(oldest);
            }
            previousStateBySource.set(key, {
                systemHash: systemHash,
                toolsHash: toolsHash,
                cacheControlHash: cacheControlHash,
                toolNames: toolNames_2,
                systemCharCount: systemCharCount,
                model: model_1,
                fastMode: isFastMode,
                globalCacheStrategy: globalCacheStrategy,
                betas: sortedBetas,
                autoModeActive: autoModeActive,
                isUsingOverage: isUsingOverage,
                cachedMCEnabled: cachedMCEnabled,
                effortValue: effortStr,
                extraBodyHash: extraBodyHash,
                callCount: 1,
                pendingChanges: null,
                prevCacheReadTokens: null,
                cacheDeletionsPending: false,
                buildDiffableContent: lazyDiffableContent,
                perToolHashes: computeToolHashes(),
            });
            return;
        }
        prev_1.callCount++;
        var systemPromptChanged = systemHash !== prev_1.systemHash;
        var toolSchemasChanged = toolsHash !== prev_1.toolsHash;
        var modelChanged = model_1 !== prev_1.model;
        var fastModeChanged = isFastMode !== prev_1.fastMode;
        var cacheControlChanged = cacheControlHash !== prev_1.cacheControlHash;
        var globalCacheStrategyChanged = globalCacheStrategy !== prev_1.globalCacheStrategy;
        var betasChanged = sortedBetas.length !== prev_1.betas.length ||
            sortedBetas.some(function (b, i) { return b !== prev_1.betas[i]; });
        var autoModeChanged = autoModeActive !== prev_1.autoModeActive;
        var overageChanged = isUsingOverage !== prev_1.isUsingOverage;
        var cachedMCChanged = cachedMCEnabled !== prev_1.cachedMCEnabled;
        var effortChanged = effortStr !== prev_1.effortValue;
        var extraBodyChanged = extraBodyHash !== prev_1.extraBodyHash;
        if (systemPromptChanged ||
            toolSchemasChanged ||
            modelChanged ||
            fastModeChanged ||
            cacheControlChanged ||
            globalCacheStrategyChanged ||
            betasChanged ||
            autoModeChanged ||
            overageChanged ||
            cachedMCChanged ||
            effortChanged ||
            extraBodyChanged) {
            var prevToolSet_1 = new Set(prev_1.toolNames);
            var newToolSet_1 = new Set(toolNames_2);
            var prevBetaSet_1 = new Set(prev_1.betas);
            var newBetaSet_1 = new Set(sortedBetas);
            var addedTools = toolNames_2.filter(function (n) { return !prevToolSet_1.has(n); });
            var removedTools = prev_1.toolNames.filter(function (n) { return !newToolSet_1.has(n); });
            var changedToolSchemas = [];
            if (toolSchemasChanged) {
                var newHashes = computeToolHashes();
                for (var _i = 0, toolNames_1 = toolNames_2; _i < toolNames_1.length; _i++) {
                    var name_1 = toolNames_1[_i];
                    if (!prevToolSet_1.has(name_1))
                        continue;
                    if (newHashes[name_1] !== prev_1.perToolHashes[name_1]) {
                        changedToolSchemas.push(name_1);
                    }
                }
                prev_1.perToolHashes = newHashes;
            }
            prev_1.pendingChanges = {
                systemPromptChanged: systemPromptChanged,
                toolSchemasChanged: toolSchemasChanged,
                modelChanged: modelChanged,
                fastModeChanged: fastModeChanged,
                cacheControlChanged: cacheControlChanged,
                globalCacheStrategyChanged: globalCacheStrategyChanged,
                betasChanged: betasChanged,
                autoModeChanged: autoModeChanged,
                overageChanged: overageChanged,
                cachedMCChanged: cachedMCChanged,
                effortChanged: effortChanged,
                extraBodyChanged: extraBodyChanged,
                addedToolCount: addedTools.length,
                removedToolCount: removedTools.length,
                addedTools: addedTools,
                removedTools: removedTools,
                changedToolSchemas: changedToolSchemas,
                systemCharDelta: systemCharCount - prev_1.systemCharCount,
                previousModel: prev_1.model,
                newModel: model_1,
                prevGlobalCacheStrategy: prev_1.globalCacheStrategy,
                newGlobalCacheStrategy: globalCacheStrategy,
                addedBetas: sortedBetas.filter(function (b) { return !prevBetaSet_1.has(b); }),
                removedBetas: prev_1.betas.filter(function (b) { return !newBetaSet_1.has(b); }),
                prevEffortValue: prev_1.effortValue,
                newEffortValue: effortStr,
                buildPrevDiffableContent: prev_1.buildDiffableContent,
            };
        }
        else {
            prev_1.pendingChanges = null;
        }
        prev_1.systemHash = systemHash;
        prev_1.toolsHash = toolsHash;
        prev_1.cacheControlHash = cacheControlHash;
        prev_1.toolNames = toolNames_2;
        prev_1.systemCharCount = systemCharCount;
        prev_1.model = model_1;
        prev_1.fastMode = isFastMode;
        prev_1.globalCacheStrategy = globalCacheStrategy;
        prev_1.betas = sortedBetas;
        prev_1.autoModeActive = autoModeActive;
        prev_1.isUsingOverage = isUsingOverage;
        prev_1.cachedMCEnabled = cachedMCEnabled;
        prev_1.effortValue = effortStr;
        prev_1.extraBodyHash = extraBodyHash;
        prev_1.buildDiffableContent = lazyDiffableContent;
    }
    catch (e) {
        (0, log_js_1.logError)(e);
    }
}
/**
 * Phase 2 (post-call): Check the API response's cache tokens to determine
 * if a cache break actually occurred. If it did, use the pending changes
 * from phase 1 to explain why.
 */
function checkResponseForCacheBreak(querySource, cacheReadTokens, cacheCreationTokens, messages, agentId, requestId) {
    return __awaiter(this, void 0, void 0, function () {
        var key, state, prevCacheRead, lastAssistantMessage, timeSinceLastAssistantMsg, changes, tokenDrop, parts, charDelta, charInfo, toolDiff, added, removed, diff, lastAssistantMsgOver5minAgo, lastAssistantMsgOver1hAgo, reason, diffPath, diffSuffix, summary, e_1;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
        return __generator(this, function (_y) {
            switch (_y.label) {
                case 0:
                    _y.trys.push([0, 3, , 4]);
                    key = getTrackingKey(querySource, agentId);
                    if (!key)
                        return [2 /*return*/];
                    state = previousStateBySource.get(key);
                    if (!state)
                        return [2 /*return*/];
                    // Skip excluded models (e.g., haiku has different caching behavior)
                    if (isExcludedModel(state.model))
                        return [2 /*return*/];
                    prevCacheRead = state.prevCacheReadTokens;
                    state.prevCacheReadTokens = cacheReadTokens;
                    lastAssistantMessage = messages.findLast(function (m) { return m.type === 'assistant'; });
                    timeSinceLastAssistantMsg = lastAssistantMessage
                        ? Date.now() - new Date(lastAssistantMessage.timestamp).getTime()
                        : null;
                    // Skip the first call — no previous value to compare against
                    if (prevCacheRead === null)
                        return [2 /*return*/];
                    changes = state.pendingChanges;
                    // Cache deletions via cached microcompact intentionally reduce the cached
                    // prefix. The drop in cache read tokens is expected — reset the baseline
                    // so we don't false-positive on the next call.
                    if (state.cacheDeletionsPending) {
                        state.cacheDeletionsPending = false;
                        (0, debug_js_1.logForDebugging)("[PROMPT CACHE] cache deletion applied, cache read: ".concat(prevCacheRead, " \u2192 ").concat(cacheReadTokens, " (expected drop)"));
                        // Don't flag as a break — the remaining state is still valid
                        state.pendingChanges = null;
                        return [2 /*return*/];
                    }
                    tokenDrop = prevCacheRead - cacheReadTokens;
                    if (cacheReadTokens >= prevCacheRead * 0.95 ||
                        tokenDrop < MIN_CACHE_MISS_TOKENS) {
                        state.pendingChanges = null;
                        return [2 /*return*/];
                    }
                    parts = [];
                    if (changes) {
                        if (changes.modelChanged) {
                            parts.push("model changed (".concat(changes.previousModel, " \u2192 ").concat(changes.newModel, ")"));
                        }
                        if (changes.systemPromptChanged) {
                            charDelta = changes.systemCharDelta;
                            charInfo = charDelta === 0
                                ? ''
                                : charDelta > 0
                                    ? " (+".concat(charDelta, " chars)")
                                    : " (".concat(charDelta, " chars)");
                            parts.push("system prompt changed".concat(charInfo));
                        }
                        if (changes.toolSchemasChanged) {
                            toolDiff = changes.addedToolCount > 0 || changes.removedToolCount > 0
                                ? " (+".concat(changes.addedToolCount, "/-").concat(changes.removedToolCount, " tools)")
                                : ' (tool prompt/schema changed, same tool set)';
                            parts.push("tools changed".concat(toolDiff));
                        }
                        if (changes.fastModeChanged) {
                            parts.push('fast mode toggled');
                        }
                        if (changes.globalCacheStrategyChanged) {
                            parts.push("global cache strategy changed (".concat(changes.prevGlobalCacheStrategy || 'none', " \u2192 ").concat(changes.newGlobalCacheStrategy || 'none', ")"));
                        }
                        if (changes.cacheControlChanged &&
                            !changes.globalCacheStrategyChanged &&
                            !changes.systemPromptChanged) {
                            // Only report as standalone cause if nothing else explains it —
                            // otherwise the scope/TTL flip is a consequence, not the root cause.
                            parts.push('cache_control changed (scope or TTL)');
                        }
                        if (changes.betasChanged) {
                            added = changes.addedBetas.length
                                ? "+".concat(changes.addedBetas.join(','))
                                : '';
                            removed = changes.removedBetas.length
                                ? "-".concat(changes.removedBetas.join(','))
                                : '';
                            diff = [added, removed].filter(Boolean).join(' ');
                            parts.push("betas changed".concat(diff ? " (".concat(diff, ")") : ''));
                        }
                        if (changes.autoModeChanged) {
                            parts.push('auto mode toggled');
                        }
                        if (changes.overageChanged) {
                            parts.push('overage state changed (TTL latched, no flip)');
                        }
                        if (changes.cachedMCChanged) {
                            parts.push('cached microcompact toggled');
                        }
                        if (changes.effortChanged) {
                            parts.push("effort changed (".concat(changes.prevEffortValue || 'default', " \u2192 ").concat(changes.newEffortValue || 'default', ")"));
                        }
                        if (changes.extraBodyChanged) {
                            parts.push('extra body params changed');
                        }
                    }
                    lastAssistantMsgOver5minAgo = timeSinceLastAssistantMsg !== null &&
                        timeSinceLastAssistantMsg > CACHE_TTL_5MIN_MS;
                    lastAssistantMsgOver1hAgo = timeSinceLastAssistantMsg !== null &&
                        timeSinceLastAssistantMsg > exports.CACHE_TTL_1HOUR_MS;
                    reason = void 0;
                    if (parts.length > 0) {
                        reason = parts.join(', ');
                    }
                    else if (lastAssistantMsgOver1hAgo) {
                        reason = 'possible 1h TTL expiry (prompt unchanged)';
                    }
                    else if (lastAssistantMsgOver5minAgo) {
                        reason = 'possible 5min TTL expiry (prompt unchanged)';
                    }
                    else if (timeSinceLastAssistantMsg !== null) {
                        reason = 'likely server-side (prompt unchanged, <5min gap)';
                    }
                    else {
                        reason = 'unknown cause';
                    }
                    (0, index_js_1.logEvent)('tengu_prompt_cache_break', {
                        systemPromptChanged: (_a = changes === null || changes === void 0 ? void 0 : changes.systemPromptChanged) !== null && _a !== void 0 ? _a : false,
                        toolSchemasChanged: (_b = changes === null || changes === void 0 ? void 0 : changes.toolSchemasChanged) !== null && _b !== void 0 ? _b : false,
                        modelChanged: (_c = changes === null || changes === void 0 ? void 0 : changes.modelChanged) !== null && _c !== void 0 ? _c : false,
                        fastModeChanged: (_d = changes === null || changes === void 0 ? void 0 : changes.fastModeChanged) !== null && _d !== void 0 ? _d : false,
                        cacheControlChanged: (_e = changes === null || changes === void 0 ? void 0 : changes.cacheControlChanged) !== null && _e !== void 0 ? _e : false,
                        globalCacheStrategyChanged: (_f = changes === null || changes === void 0 ? void 0 : changes.globalCacheStrategyChanged) !== null && _f !== void 0 ? _f : false,
                        betasChanged: (_g = changes === null || changes === void 0 ? void 0 : changes.betasChanged) !== null && _g !== void 0 ? _g : false,
                        autoModeChanged: (_h = changes === null || changes === void 0 ? void 0 : changes.autoModeChanged) !== null && _h !== void 0 ? _h : false,
                        overageChanged: (_j = changes === null || changes === void 0 ? void 0 : changes.overageChanged) !== null && _j !== void 0 ? _j : false,
                        cachedMCChanged: (_k = changes === null || changes === void 0 ? void 0 : changes.cachedMCChanged) !== null && _k !== void 0 ? _k : false,
                        effortChanged: (_l = changes === null || changes === void 0 ? void 0 : changes.effortChanged) !== null && _l !== void 0 ? _l : false,
                        extraBodyChanged: (_m = changes === null || changes === void 0 ? void 0 : changes.extraBodyChanged) !== null && _m !== void 0 ? _m : false,
                        addedToolCount: (_o = changes === null || changes === void 0 ? void 0 : changes.addedToolCount) !== null && _o !== void 0 ? _o : 0,
                        removedToolCount: (_p = changes === null || changes === void 0 ? void 0 : changes.removedToolCount) !== null && _p !== void 0 ? _p : 0,
                        systemCharDelta: (_q = changes === null || changes === void 0 ? void 0 : changes.systemCharDelta) !== null && _q !== void 0 ? _q : 0,
                        // Tool names are sanitized: built-in names are a fixed vocabulary,
                        // MCP tools collapse to 'mcp' (user-configured, could leak paths).
                        addedTools: ((_r = changes === null || changes === void 0 ? void 0 : changes.addedTools) !== null && _r !== void 0 ? _r : [])
                            .map(sanitizeToolName)
                            .join(','),
                        removedTools: ((_s = changes === null || changes === void 0 ? void 0 : changes.removedTools) !== null && _s !== void 0 ? _s : [])
                            .map(sanitizeToolName)
                            .join(','),
                        changedToolSchemas: ((_t = changes === null || changes === void 0 ? void 0 : changes.changedToolSchemas) !== null && _t !== void 0 ? _t : [])
                            .map(sanitizeToolName)
                            .join(','),
                        // Beta header names and cache strategy are fixed enum-like values,
                        // not code or filepaths. requestId is an opaque server-generated ID.
                        addedBetas: ((_u = changes === null || changes === void 0 ? void 0 : changes.addedBetas) !== null && _u !== void 0 ? _u : []).join(','),
                        removedBetas: ((_v = changes === null || changes === void 0 ? void 0 : changes.removedBetas) !== null && _v !== void 0 ? _v : []).join(','),
                        prevGlobalCacheStrategy: ((_w = changes === null || changes === void 0 ? void 0 : changes.prevGlobalCacheStrategy) !== null && _w !== void 0 ? _w : ''),
                        newGlobalCacheStrategy: ((_x = changes === null || changes === void 0 ? void 0 : changes.newGlobalCacheStrategy) !== null && _x !== void 0 ? _x : ''),
                        callNumber: state.callCount,
                        prevCacheReadTokens: prevCacheRead,
                        cacheReadTokens: cacheReadTokens,
                        cacheCreationTokens: cacheCreationTokens,
                        timeSinceLastAssistantMsg: timeSinceLastAssistantMsg !== null && timeSinceLastAssistantMsg !== void 0 ? timeSinceLastAssistantMsg : -1,
                        lastAssistantMsgOver5minAgo: lastAssistantMsgOver5minAgo,
                        lastAssistantMsgOver1hAgo: lastAssistantMsgOver1hAgo,
                        requestId: (requestId !== null && requestId !== void 0 ? requestId : ''),
                    });
                    diffPath = void 0;
                    if (!(changes === null || changes === void 0 ? void 0 : changes.buildPrevDiffableContent)) return [3 /*break*/, 2];
                    return [4 /*yield*/, writeCacheBreakDiff(changes.buildPrevDiffableContent(), state.buildDiffableContent())];
                case 1:
                    diffPath = _y.sent();
                    _y.label = 2;
                case 2:
                    diffSuffix = diffPath ? ", diff: ".concat(diffPath) : '';
                    summary = "[PROMPT CACHE BREAK] ".concat(reason, " [source=").concat(querySource, ", call #").concat(state.callCount, ", cache read: ").concat(prevCacheRead, " \u2192 ").concat(cacheReadTokens, ", creation: ").concat(cacheCreationTokens).concat(diffSuffix, "]");
                    (0, debug_js_1.logForDebugging)(summary, { level: 'warn' });
                    state.pendingChanges = null;
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _y.sent();
                    (0, log_js_1.logError)(e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Call when cached microcompact sends cache_edits deletions.
 * The next API response will have lower cache read tokens — that's
 * expected, not a cache break.
 */
function notifyCacheDeletion(querySource, agentId) {
    var key = getTrackingKey(querySource, agentId);
    var state = key ? previousStateBySource.get(key) : undefined;
    if (state) {
        state.cacheDeletionsPending = true;
    }
}
/**
 * Call after compaction to reset the cache read baseline.
 * Compaction legitimately reduces message count, so cache read tokens
 * will naturally drop on the next call — that's not a break.
 */
function notifyCompaction(querySource, agentId) {
    var key = getTrackingKey(querySource, agentId);
    var state = key ? previousStateBySource.get(key) : undefined;
    if (state) {
        state.prevCacheReadTokens = null;
    }
}
function cleanupAgentTracking(agentId) {
    previousStateBySource.delete(agentId);
}
function resetPromptCacheBreakDetection() {
    previousStateBySource.clear();
}
function writeCacheBreakDiff(prevContent, newContent) {
    return __awaiter(this, void 0, void 0, function () {
        var diffPath, patch, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    diffPath = getCacheBreakDiffPath();
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, filesystem_js_1.getClaudeTempDir)(), { recursive: true })];
                case 1:
                    _b.sent();
                    patch = (0, diff_1.createPatch)('prompt-state', prevContent, newContent, 'before', 'after');
                    return [4 /*yield*/, (0, promises_1.writeFile)(diffPath, patch)];
                case 2:
                    _b.sent();
                    return [2 /*return*/, diffPath];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, undefined];
                case 4: return [2 /*return*/];
            }
        });
    });
}
