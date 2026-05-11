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
exports.getAttributionTexts = getAttributionTexts;
exports.countUserPromptsInMessages = countUserPromptsInMessages;
exports.getEnhancedPRAttribution = getEnhancedPRAttribution;
var bun_bundle_1 = require("bun:bundle");
var promises_1 = require("fs/promises");
var state_js_1 = require("../bootstrap/state.js");
var product_js_1 = require("../constants/product.js");
var xml_js_1 = require("../constants/xml.js");
var constants_js_1 = require("../tools/FileEditTool/constants.js");
var prompt_js_1 = require("../tools/FileReadTool/prompt.js");
var prompt_js_2 = require("../tools/FileWriteTool/prompt.js");
var prompt_js_3 = require("../tools/GlobTool/prompt.js");
var prompt_js_4 = require("../tools/GrepTool/prompt.js");
var commitAttribution_js_1 = require("./commitAttribution.js");
var debug_js_1 = require("./debug.js");
var json_js_1 = require("./json.js");
var log_js_1 = require("./log.js");
var model_js_1 = require("./model/model.js");
var sessionFileAccessHooks_js_1 = require("./sessionFileAccessHooks.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
var sessionStoragePortable_js_1 = require("./sessionStoragePortable.js");
var settings_js_1 = require("./settings/settings.js");
var undercover_js_1 = require("./undercover.js");
/**
 * Returns attribution text for commits and PRs based on user settings.
 * Handles:
 * - Dynamic model name via getPublicModelName()
 * - Custom attribution settings (settings.attribution.commit/pr)
 * - Backward compatibility with deprecated includeCoAuthoredBy setting
 * - Remote mode: returns session URL for attribution
 */
function getAttributionTexts() {
    var _a, _b;
    if (process.env.USER_TYPE === 'ant' && (0, undercover_js_1.isUndercover)()) {
        return { commit: '', pr: '' };
    }
    if ((0, state_js_1.getClientType)() === 'remote') {
        var remoteSessionId = process.env.CLAUDE_CODE_REMOTE_SESSION_ID;
        if (remoteSessionId) {
            var ingressUrl = process.env.SESSION_INGRESS_URL;
            // Skip for local dev - URLs won't persist
            if (!(0, product_js_1.isRemoteSessionLocal)(remoteSessionId, ingressUrl)) {
                var sessionUrl = (0, product_js_1.getRemoteSessionUrl)(remoteSessionId, ingressUrl);
                return { commit: sessionUrl, pr: sessionUrl };
            }
        }
        return { commit: '', pr: '' };
    }
    // @[MODEL LAUNCH]: Update the hardcoded fallback model name below (guards against codename leaks).
    // For internal repos, use the real model name. For external repos,
    // fall back to "Claude Opus 4.6" for unrecognized models to avoid leaking codenames.
    var model = (0, model_js_1.getMainLoopModel)();
    var isKnownPublicModel = (0, model_js_1.getPublicModelDisplayName)(model) !== null;
    var modelName = (0, commitAttribution_js_1.isInternalModelRepoCached)() || isKnownPublicModel
        ? (0, model_js_1.getPublicModelName)(model)
        : 'Claude Opus 4.6';
    var defaultAttribution = "\uD83E\uDD16 Generated with [Claude Code](".concat(product_js_1.PRODUCT_URL, ")");
    var defaultCommit = "Co-Authored-By: ".concat(modelName, " <noreply@anthropic.com>");
    var settings = (0, settings_js_1.getInitialSettings)();
    // New attribution setting takes precedence over deprecated includeCoAuthoredBy
    if (settings.attribution) {
        return {
            commit: (_a = settings.attribution.commit) !== null && _a !== void 0 ? _a : defaultCommit,
            pr: (_b = settings.attribution.pr) !== null && _b !== void 0 ? _b : defaultAttribution,
        };
    }
    // Backward compatibility: deprecated includeCoAuthoredBy setting
    if (settings.includeCoAuthoredBy === false) {
        return { commit: '', pr: '' };
    }
    return { commit: defaultCommit, pr: defaultAttribution };
}
/**
 * Check if a message content string is terminal output rather than a user prompt.
 * Terminal output includes bash input/output tags and caveat messages about local commands.
 */
function isTerminalOutput(content) {
    for (var _i = 0, TERMINAL_OUTPUT_TAGS_1 = xml_js_1.TERMINAL_OUTPUT_TAGS; _i < TERMINAL_OUTPUT_TAGS_1.length; _i++) {
        var tag = TERMINAL_OUTPUT_TAGS_1[_i];
        if (content.includes("<".concat(tag, ">"))) {
            return true;
        }
    }
    return false;
}
/**
 * Count user messages with visible text content in a list of non-sidechain messages.
 * Excludes tool_result blocks, terminal output, and empty messages.
 *
 * Callers should pass messages already filtered to exclude sidechain messages.
 */
function countUserPromptsInMessages(messages) {
    var _a;
    var count = 0;
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var message = messages_1[_i];
        if (message.type !== 'user') {
            continue;
        }
        var content = (_a = message.message) === null || _a === void 0 ? void 0 : _a.content;
        if (!content) {
            continue;
        }
        var hasUserText = false;
        if (typeof content === 'string') {
            if (isTerminalOutput(content)) {
                continue;
            }
            hasUserText = content.trim().length > 0;
        }
        else if (Array.isArray(content)) {
            hasUserText = content.some(function (block) {
                if (!block || typeof block !== 'object' || !('type' in block)) {
                    return false;
                }
                return ((block.type === 'text' &&
                    typeof block.text === 'string' &&
                    !isTerminalOutput(block.text)) ||
                    block.type === 'image' ||
                    block.type === 'document');
            });
        }
        if (hasUserText) {
            count++;
        }
    }
    return count;
}
/**
 * Count non-sidechain user messages in transcript entries.
 * Used to calculate the number of "steers" (user prompts - 1).
 *
 * Counts user messages that contain actual user-typed text,
 * excluding tool_result blocks, sidechain messages, and terminal output.
 */
function countUserPromptsFromEntries(entries) {
    var nonSidechain = entries.filter(function (entry) {
        return entry.type === 'user' && !('isSidechain' in entry && entry.isSidechain);
    });
    return countUserPromptsInMessages(nonSidechain);
}
/**
 * Get full attribution data from the provided AppState's attribution state.
 * Uses ALL tracked files from the attribution state (not just staged files)
 * because for PR attribution, files may not be staged yet.
 * Returns null if no attribution data is available.
 */
function getPRAttributionData(appState) {
    return __awaiter(this, void 0, void 0, function () {
        var attribution, fileStates, isMap, trackedFiles, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    attribution = appState.attribution;
                    if (!attribution) {
                        return [2 /*return*/, null];
                    }
                    fileStates = attribution.fileStates;
                    isMap = fileStates instanceof Map;
                    trackedFiles = isMap
                        ? Array.from(fileStates.keys())
                        : Object.keys(fileStates);
                    if (trackedFiles.length === 0) {
                        return [2 /*return*/, null];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, commitAttribution_js_1.calculateCommitAttribution)([attribution], trackedFiles)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var MEMORY_ACCESS_TOOL_NAMES = new Set([
    prompt_js_1.FILE_READ_TOOL_NAME,
    prompt_js_4.GREP_TOOL_NAME,
    prompt_js_3.GLOB_TOOL_NAME,
    constants_js_1.FILE_EDIT_TOOL_NAME,
    prompt_js_2.FILE_WRITE_TOOL_NAME,
]);
/**
 * Count memory file accesses in transcript entries.
 * Uses the same detection conditions as the PostToolUse session file access hooks.
 */
function countMemoryFileAccessFromEntries(entries) {
    var _a;
    var count = 0;
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var entry = entries_1[_i];
        if (entry.type !== 'assistant')
            continue;
        var content = (_a = entry.message) === null || _a === void 0 ? void 0 : _a.content;
        if (!Array.isArray(content))
            continue;
        for (var _b = 0, content_1 = content; _b < content_1.length; _b++) {
            var block = content_1[_b];
            if (block.type !== 'tool_use' ||
                !MEMORY_ACCESS_TOOL_NAMES.has(block.name))
                continue;
            if ((0, sessionFileAccessHooks_js_1.isMemoryFileAccess)(block.name, block.input))
                count++;
        }
    }
    return count;
}
/**
 * Read session transcript entries and compute prompt count and memory access
 * count. Pre-compact entries are skipped — the N-shot count and memory-access
 * count should reflect only the current conversation arc, not accumulated
 * prompts from before a compaction boundary.
 */
function getTranscriptStats() {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, fileSize, scan, buf, entries, lastBoundaryIdx, postBoundary, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    filePath = (0, sessionStorage_js_1.getTranscriptPath)();
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                case 1:
                    fileSize = (_b.sent()).size;
                    return [4 /*yield*/, (0, sessionStoragePortable_js_1.readTranscriptForLoad)(filePath, fileSize)];
                case 2:
                    scan = _b.sent();
                    buf = scan.postBoundaryBuf;
                    entries = (0, json_js_1.parseJSONL)(buf);
                    lastBoundaryIdx = entries.findLastIndex(function (e) {
                        return e.type === 'system' &&
                            'subtype' in e &&
                            e.subtype === 'compact_boundary';
                    });
                    postBoundary = lastBoundaryIdx >= 0 ? entries.slice(lastBoundaryIdx + 1) : entries;
                    return [2 /*return*/, {
                            promptCount: countUserPromptsFromEntries(postBoundary),
                            memoryAccessCount: countMemoryFileAccessFromEntries(postBoundary),
                        }];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, { promptCount: 0, memoryAccessCount: 0 }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get enhanced PR attribution text with Claude contribution stats.
 *
 * Format: "🤖 Generated with Claude Code (93% 3-shotted by claude-opus-4-5)"
 *
 * Rules:
 * - Shows Claude contribution percentage from commit attribution
 * - Shows N-shotted where N is the prompt count (1-shotted, 2-shotted, etc.)
 * - Shows short model name (e.g., claude-opus-4-5)
 * - Returns default attribution if stats can't be computed
 *
 * @param getAppState Function to get the current AppState (from command context)
 */
function getEnhancedPRAttribution(getAppState) {
    return __awaiter(this, void 0, void 0, function () {
        var remoteSessionId, ingressUrl, settings, defaultAttribution, appState, fileStates, isMap, fileCount, _a, attributionData, _b, promptCount, memoryAccessCount, isInternal, claudePercent, rawModelName, shortModelName, memSuffix, summary, buildPRTrailers, trailers, result;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (process.env.USER_TYPE === 'ant' && (0, undercover_js_1.isUndercover)()) {
                        return [2 /*return*/, ''];
                    }
                    if ((0, state_js_1.getClientType)() === 'remote') {
                        remoteSessionId = process.env.CLAUDE_CODE_REMOTE_SESSION_ID;
                        if (remoteSessionId) {
                            ingressUrl = process.env.SESSION_INGRESS_URL;
                            // Skip for local dev - URLs won't persist
                            if (!(0, product_js_1.isRemoteSessionLocal)(remoteSessionId, ingressUrl)) {
                                return [2 /*return*/, (0, product_js_1.getRemoteSessionUrl)(remoteSessionId, ingressUrl)];
                            }
                        }
                        return [2 /*return*/, ''];
                    }
                    settings = (0, settings_js_1.getInitialSettings)();
                    // If user has custom PR attribution, use that
                    if ((_c = settings.attribution) === null || _c === void 0 ? void 0 : _c.pr) {
                        return [2 /*return*/, settings.attribution.pr];
                    }
                    // Backward compatibility: deprecated includeCoAuthoredBy setting
                    if (settings.includeCoAuthoredBy === false) {
                        return [2 /*return*/, ''];
                    }
                    defaultAttribution = "\uD83E\uDD16 Generated with [Claude Code](".concat(product_js_1.PRODUCT_URL, ")");
                    appState = getAppState();
                    (0, debug_js_1.logForDebugging)("PR Attribution: appState.attribution exists: ".concat(!!appState.attribution));
                    if (appState.attribution) {
                        fileStates = appState.attribution.fileStates;
                        isMap = fileStates instanceof Map;
                        fileCount = isMap ? fileStates.size : Object.keys(fileStates).length;
                        (0, debug_js_1.logForDebugging)("PR Attribution: fileStates count: ".concat(fileCount));
                    }
                    return [4 /*yield*/, Promise.all([
                            getPRAttributionData(appState),
                            getTranscriptStats(),
                            (0, commitAttribution_js_1.isInternalModelRepo)(),
                        ])];
                case 1:
                    _a = _e.sent(), attributionData = _a[0], _b = _a[1], promptCount = _b.promptCount, memoryAccessCount = _b.memoryAccessCount, isInternal = _a[2];
                    claudePercent = (_d = attributionData === null || attributionData === void 0 ? void 0 : attributionData.summary.claudePercent) !== null && _d !== void 0 ? _d : 0;
                    (0, debug_js_1.logForDebugging)("PR Attribution: claudePercent: ".concat(claudePercent, ", promptCount: ").concat(promptCount, ", memoryAccessCount: ").concat(memoryAccessCount));
                    rawModelName = (0, model_js_1.getCanonicalName)((0, model_js_1.getMainLoopModel)());
                    shortModelName = isInternal
                        ? rawModelName
                        : (0, commitAttribution_js_1.sanitizeModelName)(rawModelName);
                    // If no attribution data, return default
                    if (claudePercent === 0 && promptCount === 0 && memoryAccessCount === 0) {
                        (0, debug_js_1.logForDebugging)('PR Attribution: returning default (no data)');
                        return [2 /*return*/, defaultAttribution];
                    }
                    memSuffix = memoryAccessCount > 0
                        ? ", ".concat(memoryAccessCount, " ").concat(memoryAccessCount === 1 ? 'memory' : 'memories', " recalled")
                        : '';
                    summary = "\uD83E\uDD16 Generated with [Claude Code](".concat(product_js_1.PRODUCT_URL, ") (").concat(claudePercent, "% ").concat(promptCount, "-shotted by ").concat(shortModelName).concat(memSuffix, ")");
                    if (!((0, bun_bundle_1.feature)('COMMIT_ATTRIBUTION') && isInternal && attributionData)) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./attributionTrailer.js'); })];
                case 2:
                    buildPRTrailers = (_e.sent()).buildPRTrailers;
                    trailers = buildPRTrailers(attributionData, appState.attribution);
                    result = "".concat(summary, "\n\n").concat(trailers.join('\n'));
                    (0, debug_js_1.logForDebugging)("PR Attribution: returning with trailers: ".concat(result));
                    return [2 /*return*/, result];
                case 3:
                    (0, debug_js_1.logForDebugging)("PR Attribution: returning summary: ".concat(summary));
                    return [2 /*return*/, summary];
            }
        });
    });
}
