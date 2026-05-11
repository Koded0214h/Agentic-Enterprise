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
exports.MANUAL_COMPACT_BUFFER_TOKENS = exports.ERROR_THRESHOLD_BUFFER_TOKENS = exports.WARNING_THRESHOLD_BUFFER_TOKENS = exports.AUTOCOMPACT_BUFFER_TOKENS = void 0;
exports.getEffectiveContextWindowSize = getEffectiveContextWindowSize;
exports.getAutoCompactThreshold = getAutoCompactThreshold;
exports.calculateTokenWarningState = calculateTokenWarningState;
exports.isAutoCompactEnabled = isAutoCompactEnabled;
exports.shouldAutoCompact = shouldAutoCompact;
exports.autoCompactIfNeeded = autoCompactIfNeeded;
var bun_bundle_1 = require("bun:bundle");
var state_js_1 = require("src/bootstrap/state.js");
var state_js_2 = require("../../bootstrap/state.js");
var config_js_1 = require("../../utils/config.js");
var context_js_1 = require("../../utils/context.js");
var debug_js_1 = require("../../utils/debug.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var tokens_js_1 = require("../../utils/tokens.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
var claude_js_1 = require("../api/claude.js");
var promptCacheBreakDetection_js_1 = require("../api/promptCacheBreakDetection.js");
var sessionMemoryUtils_js_1 = require("../SessionMemory/sessionMemoryUtils.js");
var compact_js_1 = require("./compact.js");
var postCompactCleanup_js_1 = require("./postCompactCleanup.js");
var sessionMemoryCompact_js_1 = require("./sessionMemoryCompact.js");
// Reserve this many tokens for output during compaction
// Based on p99.99 of compact summary output being 17,387 tokens.
var MAX_OUTPUT_TOKENS_FOR_SUMMARY = 20000;
// Returns the context window size minus the max output tokens for the model
function getEffectiveContextWindowSize(model) {
    var reservedTokensForSummary = Math.min((0, claude_js_1.getMaxOutputTokensForModel)(model), MAX_OUTPUT_TOKENS_FOR_SUMMARY);
    var contextWindow = (0, context_js_1.getContextWindowForModel)(model, (0, state_js_2.getSdkBetas)());
    var autoCompactWindow = process.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW;
    if (autoCompactWindow) {
        var parsed = parseInt(autoCompactWindow, 10);
        if (!isNaN(parsed) && parsed > 0) {
            contextWindow = Math.min(contextWindow, parsed);
        }
    }
    return contextWindow - reservedTokensForSummary;
}
exports.AUTOCOMPACT_BUFFER_TOKENS = 13000;
exports.WARNING_THRESHOLD_BUFFER_TOKENS = 20000;
exports.ERROR_THRESHOLD_BUFFER_TOKENS = 20000;
exports.MANUAL_COMPACT_BUFFER_TOKENS = 3000;
// Stop trying autocompact after this many consecutive failures.
// BQ 2026-03-10: 1,279 sessions had 50+ consecutive failures (up to 3,272)
// in a single session, wasting ~250K API calls/day globally.
var MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES = 3;
function getAutoCompactThreshold(model) {
    var effectiveContextWindow = getEffectiveContextWindowSize(model);
    var autocompactThreshold = effectiveContextWindow - exports.AUTOCOMPACT_BUFFER_TOKENS;
    // Override for easier testing of autocompact
    var envPercent = process.env.CLAUDE_AUTOCOMPACT_PCT_OVERRIDE;
    if (envPercent) {
        var parsed = parseFloat(envPercent);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
            var percentageThreshold = Math.floor(effectiveContextWindow * (parsed / 100));
            return Math.min(percentageThreshold, autocompactThreshold);
        }
    }
    return autocompactThreshold;
}
function calculateTokenWarningState(tokenUsage, model) {
    var autoCompactThreshold = getAutoCompactThreshold(model);
    var threshold = isAutoCompactEnabled()
        ? autoCompactThreshold
        : getEffectiveContextWindowSize(model);
    var percentLeft = Math.max(0, Math.round(((threshold - tokenUsage) / threshold) * 100));
    var warningThreshold = threshold - exports.WARNING_THRESHOLD_BUFFER_TOKENS;
    var errorThreshold = threshold - exports.ERROR_THRESHOLD_BUFFER_TOKENS;
    var isAboveWarningThreshold = tokenUsage >= warningThreshold;
    var isAboveErrorThreshold = tokenUsage >= errorThreshold;
    var isAboveAutoCompactThreshold = isAutoCompactEnabled() && tokenUsage >= autoCompactThreshold;
    var actualContextWindow = getEffectiveContextWindowSize(model);
    var defaultBlockingLimit = actualContextWindow - exports.MANUAL_COMPACT_BUFFER_TOKENS;
    // Allow override for testing
    var blockingLimitOverride = process.env.CLAUDE_CODE_BLOCKING_LIMIT_OVERRIDE;
    var parsedOverride = blockingLimitOverride
        ? parseInt(blockingLimitOverride, 10)
        : NaN;
    var blockingLimit = !isNaN(parsedOverride) && parsedOverride > 0
        ? parsedOverride
        : defaultBlockingLimit;
    var isAtBlockingLimit = tokenUsage >= blockingLimit;
    return {
        percentLeft: percentLeft,
        isAboveWarningThreshold: isAboveWarningThreshold,
        isAboveErrorThreshold: isAboveErrorThreshold,
        isAboveAutoCompactThreshold: isAboveAutoCompactThreshold,
        isAtBlockingLimit: isAtBlockingLimit,
    };
}
function isAutoCompactEnabled() {
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_COMPACT)) {
        return false;
    }
    // Allow disabling just auto-compact (keeps manual /compact working)
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_AUTO_COMPACT)) {
        return false;
    }
    // Check if user has disabled auto-compact in their settings
    var userConfig = (0, config_js_1.getGlobalConfig)();
    return userConfig.autoCompactEnabled;
}
function shouldAutoCompact(messages_1, model_1, querySource_1) {
    return __awaiter(this, arguments, void 0, function (messages, model, querySource, 
    // Snip removes messages but the surviving assistant's usage still reflects
    // pre-snip context, so tokenCountWithEstimation can't see the savings.
    // Subtract the rough-delta that snip already computed.
    snipTokensFreed) {
        var isContextCollapseEnabled, tokenCount, threshold, effectiveWindow, isAboveAutoCompactThreshold;
        if (snipTokensFreed === void 0) { snipTokensFreed = 0; }
        return __generator(this, function (_a) {
            // Recursion guards. session_memory and compact are forked agents that
            // would deadlock.
            if (querySource === 'session_memory' || querySource === 'compact') {
                return [2 /*return*/, false];
            }
            // marble_origami is the ctx-agent — if ITS context blows up and
            // autocompact fires, runPostCompactCleanup calls resetContextCollapse()
            // which destroys the MAIN thread's committed log (module-level state
            // shared across forks). Inside feature() so the string DCEs from
            // external builds (it's in excluded-strings.txt).
            if ((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')) {
                if (querySource === 'marble_origami') {
                    return [2 /*return*/, false];
                }
            }
            if (!isAutoCompactEnabled()) {
                return [2 /*return*/, false];
            }
            // Reactive-only mode: suppress proactive autocompact, let reactive compact
            // catch the API's prompt-too-long. feature() wrapper keeps the flag string
            // out of external builds (REACTIVE_COMPACT is ant-only).
            // Note: returning false here also means autoCompactIfNeeded never reaches
            // trySessionMemoryCompaction in the query loop — the /compact call site
            // still tries session memory first. Revisit if reactive-only graduates.
            if ((0, bun_bundle_1.feature)('REACTIVE_COMPACT')) {
                if ((0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_cobalt_raccoon', false)) {
                    return [2 /*return*/, false];
                }
            }
            // Context-collapse mode: same suppression. Collapse IS the context
            // management system when it's on — the 90% commit / 95% blocking-spawn
            // flow owns the headroom problem. Autocompact firing at effective-13k
            // (~93% of effective) sits right between collapse's commit-start (90%)
            // and blocking (95%), so it would race collapse and usually win, nuking
            // granular context that collapse was about to save. Gating here rather
            // than in isAutoCompactEnabled() keeps reactiveCompact alive as the 413
            // fallback (it consults isAutoCompactEnabled directly) and leaves
            // sessionMemory + manual /compact working.
            //
            // Consult isContextCollapseEnabled (not the raw gate) so the
            // CLAUDE_CONTEXT_COLLAPSE env override is honored here too. require()
            // inside the block breaks the init-time cycle (this file exports
            // getEffectiveContextWindowSize which collapse's index imports).
            if ((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')) {
                isContextCollapseEnabled = require('../contextCollapse/index.js').isContextCollapseEnabled;
                /* eslint-enable @typescript-eslint/no-require-imports */
                if (isContextCollapseEnabled()) {
                    return [2 /*return*/, false];
                }
            }
            tokenCount = (0, tokens_js_1.tokenCountWithEstimation)(messages) - snipTokensFreed;
            threshold = getAutoCompactThreshold(model);
            effectiveWindow = getEffectiveContextWindowSize(model);
            (0, debug_js_1.logForDebugging)("autocompact: tokens=".concat(tokenCount, " threshold=").concat(threshold, " effectiveWindow=").concat(effectiveWindow).concat(snipTokensFreed > 0 ? " snipFreed=".concat(snipTokensFreed) : ''));
            isAboveAutoCompactThreshold = calculateTokenWarningState(tokenCount, model).isAboveAutoCompactThreshold;
            return [2 /*return*/, isAboveAutoCompactThreshold];
        });
    });
}
function autoCompactIfNeeded(messages, toolUseContext, cacheSafeParams, querySource, tracking, snipTokensFreed) {
    return __awaiter(this, void 0, void 0, function () {
        var model, shouldCompact, recompactionInfo, sessionMemoryResult, compactionResult, error_1, prevFailures, nextFailures;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if ((0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_COMPACT)) {
                        return [2 /*return*/, { wasCompacted: false }];
                    }
                    // Circuit breaker: stop retrying after N consecutive failures.
                    // Without this, sessions where context is irrecoverably over the limit
                    // hammer the API with doomed compaction attempts on every turn.
                    if ((tracking === null || tracking === void 0 ? void 0 : tracking.consecutiveFailures) !== undefined &&
                        tracking.consecutiveFailures >= MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES) {
                        return [2 /*return*/, { wasCompacted: false }];
                    }
                    model = toolUseContext.options.mainLoopModel;
                    return [4 /*yield*/, shouldAutoCompact(messages, model, querySource, snipTokensFreed)];
                case 1:
                    shouldCompact = _c.sent();
                    if (!shouldCompact) {
                        return [2 /*return*/, { wasCompacted: false }];
                    }
                    recompactionInfo = {
                        isRecompactionInChain: (tracking === null || tracking === void 0 ? void 0 : tracking.compacted) === true,
                        turnsSincePreviousCompact: (_a = tracking === null || tracking === void 0 ? void 0 : tracking.turnCounter) !== null && _a !== void 0 ? _a : -1,
                        previousCompactTurnId: tracking === null || tracking === void 0 ? void 0 : tracking.turnId,
                        autoCompactThreshold: getAutoCompactThreshold(model),
                        querySource: querySource,
                    };
                    return [4 /*yield*/, (0, sessionMemoryCompact_js_1.trySessionMemoryCompaction)(messages, toolUseContext.agentId, recompactionInfo.autoCompactThreshold)];
                case 2:
                    sessionMemoryResult = _c.sent();
                    if (sessionMemoryResult) {
                        // Reset lastSummarizedMessageId since session memory compaction prunes messages
                        // and the old message UUID will no longer exist after the REPL replaces messages
                        (0, sessionMemoryUtils_js_1.setLastSummarizedMessageId)(undefined);
                        (0, postCompactCleanup_js_1.runPostCompactCleanup)(querySource);
                        // Reset cache read baseline so the post-compact drop isn't flagged as a
                        // break. compactConversation does this internally; SM-compact doesn't.
                        // BQ 2026-03-01: missing this made 20% of tengu_prompt_cache_break events
                        // false positives (systemPromptChanged=true, timeSinceLastAssistantMsg=-1).
                        if ((0, bun_bundle_1.feature)('PROMPT_CACHE_BREAK_DETECTION')) {
                            (0, promptCacheBreakDetection_js_1.notifyCompaction)(querySource !== null && querySource !== void 0 ? querySource : 'compact', toolUseContext.agentId);
                        }
                        (0, state_js_1.markPostCompaction)();
                        return [2 /*return*/, {
                                wasCompacted: true,
                                compactionResult: sessionMemoryResult,
                            }];
                    }
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, compact_js_1.compactConversation)(messages, toolUseContext, cacheSafeParams, true, // Suppress user questions for autocompact
                        undefined, // No custom instructions for autocompact
                        true, // isAutoCompact
                        recompactionInfo)
                        // Reset lastSummarizedMessageId since legacy compaction replaces all messages
                        // and the old message UUID will no longer exist in the new messages array
                    ];
                case 4:
                    compactionResult = _c.sent();
                    // Reset lastSummarizedMessageId since legacy compaction replaces all messages
                    // and the old message UUID will no longer exist in the new messages array
                    (0, sessionMemoryUtils_js_1.setLastSummarizedMessageId)(undefined);
                    (0, postCompactCleanup_js_1.runPostCompactCleanup)(querySource);
                    return [2 /*return*/, {
                            wasCompacted: true,
                            compactionResult: compactionResult,
                            // Reset failure count on success
                            consecutiveFailures: 0,
                        }];
                case 5:
                    error_1 = _c.sent();
                    if (!(0, errors_js_1.hasExactErrorMessage)(error_1, compact_js_1.ERROR_MESSAGE_USER_ABORT)) {
                        (0, log_js_1.logError)(error_1);
                    }
                    prevFailures = (_b = tracking === null || tracking === void 0 ? void 0 : tracking.consecutiveFailures) !== null && _b !== void 0 ? _b : 0;
                    nextFailures = prevFailures + 1;
                    if (nextFailures >= MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES) {
                        (0, debug_js_1.logForDebugging)("autocompact: circuit breaker tripped after ".concat(nextFailures, " consecutive failures \u2014 skipping future attempts this session"), { level: 'warn' });
                    }
                    return [2 /*return*/, { wasCompacted: false, consecutiveFailures: nextFailures }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
