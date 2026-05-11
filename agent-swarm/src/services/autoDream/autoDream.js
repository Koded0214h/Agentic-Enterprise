"use strict";
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
// Background memory consolidation. Fires the /dream prompt as a forked
// subagent when time-gate passes AND enough sessions have accumulated.
//
// Gate order (cheapest first):
//   1. Time: hours since lastConsolidatedAt >= minHours (one stat)
//   2. Sessions: transcript count with mtime > lastConsolidatedAt >= minSessions
//   3. Lock: no other process mid-consolidation
//
// State is closure-scoped inside initAutoDream() rather than module-level
// (tests call initAutoDream() in beforeEach for a fresh closure).
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAutoDream = initAutoDream;
exports.executeAutoDream = executeAutoDream;
var forkedAgent_js_1 = require("../../utils/forkedAgent.js");
var messages_js_1 = require("../../utils/messages.js");
var debug_js_1 = require("../../utils/debug.js");
var index_js_1 = require("../analytics/index.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
var paths_js_1 = require("../../memdir/paths.js");
var config_js_1 = require("./config.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var state_js_1 = require("../../bootstrap/state.js");
var extractMemories_js_1 = require("../extractMemories/extractMemories.js");
var consolidationPrompt_js_1 = require("./consolidationPrompt.js");
var consolidationLock_js_1 = require("./consolidationLock.js");
var DreamTask_js_1 = require("../../tasks/DreamTask/DreamTask.js");
var constants_js_1 = require("../../tools/FileEditTool/constants.js");
var prompt_js_1 = require("../../tools/FileWriteTool/prompt.js");
// Scan throttle: when time-gate passes but session-gate doesn't, the lock
// mtime doesn't advance, so the time-gate keeps passing every turn.
var SESSION_SCAN_INTERVAL_MS = 10 * 60 * 1000;
var DEFAULTS = {
    minHours: 24,
    minSessions: 5,
};
/**
 * Thresholds from tengu_onyx_plover. The enabled gate lives in config.ts
 * (isAutoDreamEnabled); this returns only the scheduling knobs. Defensive
 * per-field validation since GB cache can return stale wrong-type values.
 */
function getConfig() {
    var raw = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_onyx_plover', null);
    return {
        minHours: typeof (raw === null || raw === void 0 ? void 0 : raw.minHours) === 'number' &&
            Number.isFinite(raw.minHours) &&
            raw.minHours > 0
            ? raw.minHours
            : DEFAULTS.minHours,
        minSessions: typeof (raw === null || raw === void 0 ? void 0 : raw.minSessions) === 'number' &&
            Number.isFinite(raw.minSessions) &&
            raw.minSessions > 0
            ? raw.minSessions
            : DEFAULTS.minSessions,
    };
}
function isGateOpen() {
    if ((0, state_js_1.getKairosActive)())
        return false; // KAIROS mode uses disk-skill dream
    if ((0, state_js_1.getIsRemoteMode)())
        return false;
    if (!(0, paths_js_1.isAutoMemoryEnabled)())
        return false;
    return (0, config_js_1.isAutoDreamEnabled)();
}
// Ant-build-only test override. Bypasses enabled/time/session gates but NOT
// the lock (so repeated turns don't pile up dreams) or the memory-dir
// precondition. Still scans sessions so the prompt's session-hint is populated.
function isForced() {
    return false;
}
var runner = null;
/**
 * Call once at startup (from backgroundHousekeeping alongside
 * initExtractMemories), or per-test in beforeEach for a fresh closure.
 */
function initAutoDream() {
    var lastSessionScanAt = 0;
    runner = function runAutoDream(context, appendSystemMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var cfg, force, lastAt, e_1, hoursSince, sinceScanMs, sessionIds, e_2, currentSession, priorMtime, e_3, setAppState, abortController, taskId, memoryRoot, transcriptDir, extra, prompt_1, result, dreamState, e_4;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        cfg = getConfig();
                        force = isForced();
                        if (!force && !isGateOpen())
                            return [2 /*return*/];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, consolidationLock_js_1.readLastConsolidatedAt)()];
                    case 2:
                        lastAt = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _c.sent();
                        (0, debug_js_1.logForDebugging)("[autoDream] readLastConsolidatedAt failed: ".concat(e_1.message));
                        return [2 /*return*/];
                    case 4:
                        hoursSince = (Date.now() - lastAt) / 3600000;
                        if (!force && hoursSince < cfg.minHours)
                            return [2 /*return*/];
                        sinceScanMs = Date.now() - lastSessionScanAt;
                        if (!force && sinceScanMs < SESSION_SCAN_INTERVAL_MS) {
                            (0, debug_js_1.logForDebugging)("[autoDream] scan throttle \u2014 time-gate passed but last scan was ".concat(Math.round(sinceScanMs / 1000), "s ago"));
                            return [2 /*return*/];
                        }
                        lastSessionScanAt = Date.now();
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, (0, consolidationLock_js_1.listSessionsTouchedSince)(lastAt)];
                    case 6:
                        sessionIds = _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_2 = _c.sent();
                        (0, debug_js_1.logForDebugging)("[autoDream] listSessionsTouchedSince failed: ".concat(e_2.message));
                        return [2 /*return*/];
                    case 8:
                        currentSession = (0, state_js_1.getSessionId)();
                        sessionIds = sessionIds.filter(function (id) { return id !== currentSession; });
                        if (!force && sessionIds.length < cfg.minSessions) {
                            (0, debug_js_1.logForDebugging)("[autoDream] skip \u2014 ".concat(sessionIds.length, " sessions since last consolidation, need ").concat(cfg.minSessions));
                            return [2 /*return*/];
                        }
                        if (!force) return [3 /*break*/, 9];
                        priorMtime = lastAt;
                        return [3 /*break*/, 13];
                    case 9:
                        _c.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, (0, consolidationLock_js_1.tryAcquireConsolidationLock)()];
                    case 10:
                        priorMtime = _c.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        e_3 = _c.sent();
                        (0, debug_js_1.logForDebugging)("[autoDream] lock acquire failed: ".concat(e_3.message));
                        return [2 /*return*/];
                    case 12:
                        if (priorMtime === null)
                            return [2 /*return*/];
                        _c.label = 13;
                    case 13:
                        (0, debug_js_1.logForDebugging)("[autoDream] firing \u2014 ".concat(hoursSince.toFixed(1), "h since last, ").concat(sessionIds.length, " sessions to review"));
                        (0, index_js_1.logEvent)('tengu_auto_dream_fired', {
                            hours_since: Math.round(hoursSince),
                            sessions_since: sessionIds.length,
                        });
                        setAppState = (_a = context.toolUseContext.setAppStateForTasks) !== null && _a !== void 0 ? _a : context.toolUseContext.setAppState;
                        abortController = new AbortController();
                        taskId = (0, DreamTask_js_1.registerDreamTask)(setAppState, {
                            sessionsReviewing: sessionIds.length,
                            priorMtime: priorMtime,
                            abortController: abortController,
                        });
                        _c.label = 14;
                    case 14:
                        _c.trys.push([14, 16, , 18]);
                        memoryRoot = (0, paths_js_1.getAutoMemPath)();
                        transcriptDir = (0, sessionStorage_js_1.getProjectDir)((0, state_js_1.getOriginalCwd)());
                        extra = "\n\n**Tool constraints for this run:** Bash is restricted to read-only commands (`ls`, `find`, `grep`, `cat`, `stat`, `wc`, `head`, `tail`, and similar). Anything that writes, redirects to a file, or modifies state will be denied. Plan your exploration with this in mind \u2014 no need to probe.\n\nSessions since last consolidation (".concat(sessionIds.length, "):\n").concat(sessionIds.map(function (id) { return "- ".concat(id); }).join('\n'));
                        prompt_1 = (0, consolidationPrompt_js_1.buildConsolidationPrompt)(memoryRoot, transcriptDir, extra);
                        return [4 /*yield*/, (0, forkedAgent_js_1.runForkedAgent)({
                                promptMessages: [(0, messages_js_1.createUserMessage)({ content: prompt_1 })],
                                cacheSafeParams: (0, forkedAgent_js_1.createCacheSafeParams)(context),
                                canUseTool: (0, extractMemories_js_1.createAutoMemCanUseTool)(memoryRoot),
                                querySource: 'auto_dream',
                                forkLabel: 'auto_dream',
                                skipTranscript: true,
                                overrides: { abortController: abortController },
                                onMessage: makeDreamProgressWatcher(taskId, setAppState),
                            })];
                    case 15:
                        result = _c.sent();
                        (0, DreamTask_js_1.completeDreamTask)(taskId, setAppState);
                        dreamState = (_b = context.toolUseContext.getAppState().tasks) === null || _b === void 0 ? void 0 : _b[taskId];
                        if (appendSystemMessage &&
                            (0, DreamTask_js_1.isDreamTask)(dreamState) &&
                            dreamState.filesTouched.length > 0) {
                            appendSystemMessage(__assign(__assign({}, (0, messages_js_1.createMemorySavedMessage)(dreamState.filesTouched)), { verb: 'Improved' }));
                        }
                        (0, debug_js_1.logForDebugging)("[autoDream] completed \u2014 cache: read=".concat(result.totalUsage.cache_read_input_tokens, " created=").concat(result.totalUsage.cache_creation_input_tokens));
                        (0, index_js_1.logEvent)('tengu_auto_dream_completed', {
                            cache_read: result.totalUsage.cache_read_input_tokens,
                            cache_created: result.totalUsage.cache_creation_input_tokens,
                            output: result.totalUsage.output_tokens,
                            sessions_reviewed: sessionIds.length,
                        });
                        return [3 /*break*/, 18];
                    case 16:
                        e_4 = _c.sent();
                        // If the user killed from the bg-tasks dialog, DreamTask.kill already
                        // aborted, rolled back the lock, and set status=killed. Don't overwrite
                        // or double-rollback.
                        if (abortController.signal.aborted) {
                            (0, debug_js_1.logForDebugging)('[autoDream] aborted by user');
                            return [2 /*return*/];
                        }
                        (0, debug_js_1.logForDebugging)("[autoDream] fork failed: ".concat(e_4.message));
                        (0, index_js_1.logEvent)('tengu_auto_dream_failed', {});
                        (0, DreamTask_js_1.failDreamTask)(taskId, setAppState);
                        // Rewind mtime so time-gate passes again. Scan throttle is the backoff.
                        return [4 /*yield*/, (0, consolidationLock_js_1.rollbackConsolidationLock)(priorMtime)];
                    case 17:
                        // Rewind mtime so time-gate passes again. Scan throttle is the backoff.
                        _c.sent();
                        return [3 /*break*/, 18];
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
}
/**
 * Watch the forked agent's messages. For each assistant turn, extracts any
 * text blocks (the agent's reasoning/summary — what the user wants to see)
 * and collapses tool_use blocks to a count. Edit/Write file_paths are
 * collected for phase-flip + the inline completion message.
 */
function makeDreamProgressWatcher(taskId, setAppState) {
    return function (msg) {
        if (msg.type !== 'assistant')
            return;
        var text = '';
        var toolUseCount = 0;
        var touchedPaths = [];
        for (var _i = 0, _a = msg.message.content; _i < _a.length; _i++) {
            var block = _a[_i];
            if (block.type === 'text') {
                text += block.text;
            }
            else if (block.type === 'tool_use') {
                toolUseCount++;
                if (block.name === constants_js_1.FILE_EDIT_TOOL_NAME ||
                    block.name === prompt_js_1.FILE_WRITE_TOOL_NAME) {
                    var input = block.input;
                    if (typeof input.file_path === 'string') {
                        touchedPaths.push(input.file_path);
                    }
                }
            }
        }
        (0, DreamTask_js_1.addDreamTurn)(taskId, { text: text.trim(), toolUseCount: toolUseCount }, touchedPaths, setAppState);
    };
}
/**
 * Entry point from stopHooks. No-op until initAutoDream() has been called.
 * Per-turn cost when enabled: one GB cache read + one stat.
 */
function executeAutoDream(context, appendSystemMessage) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (runner === null || runner === void 0 ? void 0 : runner(context, appendSystemMessage))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
