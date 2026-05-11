"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
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
exports.FallbackTriggeredError = exports.CannotRetryError = exports.BASE_DELAY_MS = void 0;
exports.withRetry = withRetry;
exports.getRetryDelay = getRetryDelay;
exports.parseMaxTokensContextOverflowError = parseMaxTokensContextOverflowError;
exports.is529Error = is529Error;
exports.getDefaultMaxRetries = getDefaultMaxRetries;
var bun_bundle_1 = require("bun:bundle");
var sdk_1 = require("@anthropic-ai/sdk");
var aws_js_1 = require("src/utils/aws.js");
var debug_js_1 = require("src/utils/debug.js");
var log_js_1 = require("src/utils/log.js");
var messages_js_1 = require("src/utils/messages.js");
var providers_js_1 = require("src/utils/model/providers.js");
var auth_js_1 = require("../../utils/auth.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var fastMode_js_1 = require("../../utils/fastMode.js");
var model_js_1 = require("../../utils/model/model.js");
var proxy_js_1 = require("../../utils/proxy.js");
var sleep_js_1 = require("../../utils/sleep.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
var index_js_1 = require("../analytics/index.js");
var rateLimitMocking_js_1 = require("../rateLimitMocking.js");
var errors_js_2 = require("./errors.js");
var errorUtils_js_1 = require("./errorUtils.js");
var abortError = function () { return new sdk_1.APIUserAbortError(); };
var DEFAULT_MAX_RETRIES = 10;
var FLOOR_OUTPUT_TOKENS = 3000;
var MAX_529_RETRIES = 3;
exports.BASE_DELAY_MS = 500;
// Foreground query sources where the user IS blocking on the result — these
// retry on 529. Everything else (summaries, titles, suggestions, classifiers)
// bails immediately: during a capacity cascade each retry is 3-10× gateway
// amplification, and the user never sees those fail anyway. New sources
// default to no-retry — add here only if the user is waiting on the result.
var FOREGROUND_529_RETRY_SOURCES = new Set(__spreadArray([
    'repl_main_thread',
    'repl_main_thread:outputStyle:custom',
    'repl_main_thread:outputStyle:Explanatory',
    'repl_main_thread:outputStyle:Learning',
    'sdk',
    'agent:custom',
    'agent:default',
    'agent:builtin',
    'compact',
    'hook_agent',
    'hook_prompt',
    'verification_agent',
    'side_question',
    // Security classifiers — must complete for auto-mode correctness.
    // yoloClassifier.ts uses 'auto_mode' (not 'yolo_classifier' — that's
    // type-only). bash_classifier is ant-only; feature-gate so the string
    // tree-shakes out of external builds (excluded-strings.txt).
    'auto_mode'
], ((0, bun_bundle_1.feature)('BASH_CLASSIFIER') ? ['bash_classifier'] : []), true));
function shouldRetry529(querySource) {
    // undefined → retry (conservative for untagged call paths)
    return (querySource === undefined || FOREGROUND_529_RETRY_SOURCES.has(querySource));
}
// CLAUDE_CODE_UNATTENDED_RETRY: for unattended sessions (ant-only). Retries 429/529
// indefinitely with higher backoff and periodic keep-alive yields so the host
// environment does not mark the session idle mid-wait.
// TODO(ANT-344): the keep-alive via SystemAPIErrorMessage yields is a stopgap
// until there's a dedicated keep-alive channel.
var PERSISTENT_MAX_BACKOFF_MS = 5 * 60 * 1000;
var PERSISTENT_RESET_CAP_MS = 6 * 60 * 60 * 1000;
var HEARTBEAT_INTERVAL_MS = 30000;
function isPersistentRetryEnabled() {
    return (0, bun_bundle_1.feature)('UNATTENDED_RETRY')
        ? (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_UNATTENDED_RETRY)
        : false;
}
function isTransientCapacityError(error) {
    return (is529Error(error) || (error instanceof sdk_1.APIError && error.status === 429));
}
function isStaleConnectionError(error) {
    if (!(error instanceof sdk_1.APIConnectionError)) {
        return false;
    }
    var details = (0, errorUtils_js_1.extractConnectionErrorDetails)(error);
    return (details === null || details === void 0 ? void 0 : details.code) === 'ECONNRESET' || (details === null || details === void 0 ? void 0 : details.code) === 'EPIPE';
}
var CannotRetryError = /** @class */ (function (_super) {
    __extends(CannotRetryError, _super);
    function CannotRetryError(originalError, retryContext) {
        var _this = this;
        var message = (0, errors_js_1.errorMessage)(originalError);
        _this = _super.call(this, message) || this;
        _this.originalError = originalError;
        _this.retryContext = retryContext;
        _this.name = 'RetryError';
        // Preserve the original stack trace if available
        if (originalError instanceof Error && originalError.stack) {
            _this.stack = originalError.stack;
        }
        return _this;
    }
    return CannotRetryError;
}(Error));
exports.CannotRetryError = CannotRetryError;
var FallbackTriggeredError = /** @class */ (function (_super) {
    __extends(FallbackTriggeredError, _super);
    function FallbackTriggeredError(originalModel, fallbackModel) {
        var _this = _super.call(this, "Model fallback triggered: ".concat(originalModel, " -> ").concat(fallbackModel)) || this;
        _this.originalModel = originalModel;
        _this.fallbackModel = fallbackModel;
        _this.name = 'FallbackTriggeredError';
        return _this;
    }
    return FallbackTriggeredError;
}(Error));
exports.FallbackTriggeredError = FallbackTriggeredError;
function withRetry(getClient, operation, options) {
    return __asyncGenerator(this, arguments, function withRetry_1() {
        var maxRetries, retryContext, client, consecutive529Errors, lastError, persistentAttempt, attempt, wasFastModeActive, mockError, isStaleConnection, failedAccessToken, error_1, overageReason, retryAfterMs, cooldownMs, cooldownReason, persistent, handledCloudAuthError, overflowData, inputTokens, contextLimit, safetyBuffer, availableContext, minRequired, adjustedMaxTokens, retryAfter, delayMs, resetDelay, reportedAttempt, remaining, chunk;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    maxRetries = getMaxRetries(options);
                    retryContext = __assign({ model: options.model, thinkingConfig: options.thinkingConfig }, ((0, fastMode_js_1.isFastModeEnabled)() && { fastMode: options.fastMode }));
                    client = null;
                    consecutive529Errors = (_a = options.initialConsecutive529Errors) !== null && _a !== void 0 ? _a : 0;
                    persistentAttempt = 0;
                    attempt = 1;
                    _f.label = 1;
                case 1:
                    if (!(attempt <= maxRetries + 1)) return [3 /*break*/, 26];
                    if ((_b = options.signal) === null || _b === void 0 ? void 0 : _b.aborted) {
                        throw new sdk_1.APIUserAbortError();
                    }
                    wasFastModeActive = (0, fastMode_js_1.isFastModeEnabled)()
                        ? retryContext.fastMode && !(0, fastMode_js_1.isFastModeCooldown)()
                        : false;
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 9, , 25]);
                    // Check for mock rate limits (used by /mock-limits command for Ant employees)
                    if (process.env.USER_TYPE === 'ant') {
                        mockError = (0, rateLimitMocking_js_1.checkMockRateLimitError)(retryContext.model, wasFastModeActive);
                        if (mockError) {
                            throw mockError;
                        }
                    }
                    isStaleConnection = isStaleConnectionError(lastError);
                    if (isStaleConnection &&
                        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_disable_keepalive_on_econnreset', false)) {
                        (0, debug_js_1.logForDebugging)('Stale connection (ECONNRESET/EPIPE) — disabling keep-alive for retry');
                        (0, proxy_js_1.disableKeepAlive)();
                    }
                    if (!(client === null ||
                        (lastError instanceof sdk_1.APIError && lastError.status === 401) ||
                        isOAuthTokenRevokedError(lastError) ||
                        isBedrockAuthError(lastError) ||
                        isVertexAuthError(lastError) ||
                        isStaleConnection)) return [3 /*break*/, 6];
                    if (!((lastError instanceof sdk_1.APIError && lastError.status === 401) ||
                        isOAuthTokenRevokedError(lastError))) return [3 /*break*/, 4];
                    failedAccessToken = (_c = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _c === void 0 ? void 0 : _c.accessToken;
                    if (!failedAccessToken) return [3 /*break*/, 4];
                    return [4 /*yield*/, __await((0, auth_js_1.handleOAuth401Error)(failedAccessToken))];
                case 3:
                    _f.sent();
                    _f.label = 4;
                case 4: return [4 /*yield*/, __await(getClient())];
                case 5:
                    client = _f.sent();
                    _f.label = 6;
                case 6: return [4 /*yield*/, __await(operation(client, attempt, retryContext))];
                case 7: return [4 /*yield*/, __await.apply(void 0, [_f.sent()])];
                case 8: return [2 /*return*/, _f.sent()];
                case 9:
                    error_1 = _f.sent();
                    lastError = error_1;
                    (0, debug_js_1.logForDebugging)("API error (attempt ".concat(attempt, "/").concat(maxRetries + 1, "): ").concat(error_1 instanceof sdk_1.APIError ? "".concat(error_1.status, " ").concat(error_1.message) : (0, errors_js_1.errorMessage)(error_1)), { level: 'error' });
                    if (!(wasFastModeActive &&
                        !isPersistentRetryEnabled() &&
                        error_1 instanceof sdk_1.APIError &&
                        (error_1.status === 429 || is529Error(error_1)))) return [3 /*break*/, 12];
                    overageReason = (_d = error_1.headers) === null || _d === void 0 ? void 0 : _d.get('anthropic-ratelimit-unified-overage-disabled-reason');
                    if (overageReason !== null && overageReason !== undefined) {
                        (0, fastMode_js_1.handleFastModeOverageRejection)(overageReason);
                        retryContext.fastMode = false;
                        return [3 /*break*/, 25];
                    }
                    retryAfterMs = getRetryAfterMs(error_1);
                    if (!(retryAfterMs !== null && retryAfterMs < SHORT_RETRY_THRESHOLD_MS)) return [3 /*break*/, 11];
                    // Short retry-after: wait and retry with fast mode still active
                    // to preserve prompt cache (same model name on retry).
                    return [4 /*yield*/, __await((0, sleep_js_1.sleep)(retryAfterMs, options.signal, { abortError: abortError }))];
                case 10:
                    // Short retry-after: wait and retry with fast mode still active
                    // to preserve prompt cache (same model name on retry).
                    _f.sent();
                    return [3 /*break*/, 25];
                case 11:
                    cooldownMs = Math.max(retryAfterMs !== null && retryAfterMs !== void 0 ? retryAfterMs : DEFAULT_FAST_MODE_FALLBACK_HOLD_MS, MIN_COOLDOWN_MS);
                    cooldownReason = is529Error(error_1)
                        ? 'overloaded'
                        : 'rate_limit';
                    (0, fastMode_js_1.triggerFastModeCooldown)(Date.now() + cooldownMs, cooldownReason);
                    if ((0, fastMode_js_1.isFastModeEnabled)()) {
                        retryContext.fastMode = false;
                    }
                    return [3 /*break*/, 25];
                case 12:
                    // Fast mode fallback: if the API rejects the fast mode parameter
                    // (e.g., org doesn't have fast mode enabled), permanently disable fast
                    // mode and retry at standard speed.
                    if (wasFastModeActive && isFastModeNotEnabledError(error_1)) {
                        (0, fastMode_js_1.handleFastModeRejectedByAPI)();
                        retryContext.fastMode = false;
                        return [3 /*break*/, 25];
                    }
                    // Non-foreground sources bail immediately on 529 — no retry amplification
                    // during capacity cascades. User never sees these fail.
                    if (is529Error(error_1) && !shouldRetry529(options.querySource)) {
                        (0, index_js_1.logEvent)('tengu_api_529_background_dropped', {
                            query_source: options.querySource,
                        });
                        throw new CannotRetryError(error_1, retryContext);
                    }
                    // Track consecutive 529 errors
                    if (is529Error(error_1) &&
                        // If FALLBACK_FOR_ALL_PRIMARY_MODELS is not set, fall through only if the primary model is a non-custom Opus model.
                        // TODO: Revisit if the isNonCustomOpusModel check should still exist, or if isNonCustomOpusModel is a stale artifact of when Claude Code was hardcoded on Opus.
                        (process.env.FALLBACK_FOR_ALL_PRIMARY_MODELS ||
                            (!(0, auth_js_1.isClaudeAISubscriber)() && (0, model_js_1.isNonCustomOpusModel)(options.model)))) {
                        consecutive529Errors++;
                        if (consecutive529Errors >= MAX_529_RETRIES) {
                            // Check if fallback model is specified
                            if (options.fallbackModel) {
                                (0, index_js_1.logEvent)('tengu_api_opus_fallback_triggered', {
                                    original_model: options.model,
                                    fallback_model: options.fallbackModel,
                                    provider: (0, providers_js_1.getAPIProviderForStatsig)(),
                                });
                                // Throw special error to indicate fallback was triggered
                                throw new FallbackTriggeredError(options.model, options.fallbackModel);
                            }
                            if (process.env.USER_TYPE === 'external' &&
                                !process.env.IS_SANDBOX &&
                                !isPersistentRetryEnabled()) {
                                (0, index_js_1.logEvent)('tengu_api_custom_529_overloaded_error', {});
                                throw new CannotRetryError(new Error(errors_js_2.REPEATED_529_ERROR_MESSAGE), retryContext);
                            }
                        }
                    }
                    persistent = isPersistentRetryEnabled() && isTransientCapacityError(error_1);
                    if (attempt > maxRetries && !persistent) {
                        throw new CannotRetryError(error_1, retryContext);
                    }
                    handledCloudAuthError = handleAwsCredentialError(error_1) || handleGcpCredentialError(error_1);
                    if (!handledCloudAuthError &&
                        (!(error_1 instanceof sdk_1.APIError) || !shouldRetry(error_1))) {
                        throw new CannotRetryError(error_1, retryContext);
                    }
                    // Handle max tokens context overflow errors by adjusting max_tokens for the next attempt
                    // NOTE: With extended-context-window beta, this 400 error should not occur.
                    // The API now returns 'model_context_window_exceeded' stop_reason instead.
                    // Keeping for backward compatibility.
                    if (error_1 instanceof sdk_1.APIError) {
                        overflowData = parseMaxTokensContextOverflowError(error_1);
                        if (overflowData) {
                            inputTokens = overflowData.inputTokens, contextLimit = overflowData.contextLimit;
                            safetyBuffer = 1000;
                            availableContext = Math.max(0, contextLimit - inputTokens - safetyBuffer);
                            if (availableContext < FLOOR_OUTPUT_TOKENS) {
                                (0, log_js_1.logError)(new Error("availableContext ".concat(availableContext, " is less than FLOOR_OUTPUT_TOKENS ").concat(FLOOR_OUTPUT_TOKENS)));
                                throw error_1;
                            }
                            minRequired = (retryContext.thinkingConfig.type === 'enabled'
                                ? retryContext.thinkingConfig.budgetTokens
                                : 0) + 1;
                            adjustedMaxTokens = Math.max(FLOOR_OUTPUT_TOKENS, availableContext, minRequired);
                            retryContext.maxTokensOverride = adjustedMaxTokens;
                            (0, index_js_1.logEvent)('tengu_max_tokens_context_overflow_adjustment', {
                                inputTokens: inputTokens,
                                contextLimit: contextLimit,
                                adjustedMaxTokens: adjustedMaxTokens,
                                attempt: attempt,
                            });
                            return [3 /*break*/, 25];
                        }
                    }
                    retryAfter = getRetryAfter(error_1);
                    delayMs = void 0;
                    if (persistent && error_1 instanceof sdk_1.APIError && error_1.status === 429) {
                        persistentAttempt++;
                        resetDelay = getRateLimitResetDelayMs(error_1);
                        delayMs =
                            resetDelay !== null && resetDelay !== void 0 ? resetDelay : Math.min(getRetryDelay(persistentAttempt, retryAfter, PERSISTENT_MAX_BACKOFF_MS), PERSISTENT_RESET_CAP_MS);
                    }
                    else if (persistent) {
                        persistentAttempt++;
                        // Retry-After is a server directive and bypasses maxDelayMs inside
                        // getRetryDelay (intentional — honoring it is correct). Cap at the
                        // 6hr reset-cap here so a pathological header can't wait unbounded.
                        delayMs = Math.min(getRetryDelay(persistentAttempt, retryAfter, PERSISTENT_MAX_BACKOFF_MS), PERSISTENT_RESET_CAP_MS);
                    }
                    else {
                        delayMs = getRetryDelay(attempt, retryAfter);
                    }
                    reportedAttempt = persistent ? persistentAttempt : attempt;
                    (0, index_js_1.logEvent)('tengu_api_retry', {
                        attempt: reportedAttempt,
                        delayMs: delayMs,
                        error: error_1
                            .message,
                        status: error_1.status,
                        provider: (0, providers_js_1.getAPIProviderForStatsig)(),
                    });
                    if (!persistent) return [3 /*break*/, 19];
                    if (delayMs > 60000) {
                        (0, index_js_1.logEvent)('tengu_api_persistent_retry_wait', {
                            status: error_1.status,
                            delayMs: delayMs,
                            attempt: reportedAttempt,
                            provider: (0, providers_js_1.getAPIProviderForStatsig)(),
                        });
                    }
                    remaining = delayMs;
                    _f.label = 13;
                case 13:
                    if (!(remaining > 0)) return [3 /*break*/, 18];
                    if ((_e = options.signal) === null || _e === void 0 ? void 0 : _e.aborted)
                        throw new sdk_1.APIUserAbortError();
                    if (!(error_1 instanceof sdk_1.APIError)) return [3 /*break*/, 16];
                    return [4 /*yield*/, __await((0, messages_js_1.createSystemAPIErrorMessage)(error_1, remaining, reportedAttempt, maxRetries))];
                case 14: return [4 /*yield*/, _f.sent()];
                case 15:
                    _f.sent();
                    _f.label = 16;
                case 16:
                    chunk = Math.min(remaining, HEARTBEAT_INTERVAL_MS);
                    return [4 /*yield*/, __await((0, sleep_js_1.sleep)(chunk, options.signal, { abortError: abortError }))];
                case 17:
                    _f.sent();
                    remaining -= chunk;
                    return [3 /*break*/, 13];
                case 18:
                    // Clamp so the for-loop never terminates. Backoff uses the separate
                    // persistentAttempt counter which keeps growing to the 5-min cap.
                    if (attempt >= maxRetries)
                        attempt = maxRetries;
                    return [3 /*break*/, 24];
                case 19:
                    if (!(error_1 instanceof sdk_1.APIError)) return [3 /*break*/, 22];
                    return [4 /*yield*/, __await((0, messages_js_1.createSystemAPIErrorMessage)(error_1, delayMs, attempt, maxRetries))];
                case 20: return [4 /*yield*/, _f.sent()];
                case 21:
                    _f.sent();
                    _f.label = 22;
                case 22: return [4 /*yield*/, __await((0, sleep_js_1.sleep)(delayMs, options.signal, { abortError: abortError }))];
                case 23:
                    _f.sent();
                    _f.label = 24;
                case 24: return [3 /*break*/, 25];
                case 25:
                    attempt++;
                    return [3 /*break*/, 1];
                case 26: throw new CannotRetryError(lastError, retryContext);
            }
        });
    });
}
function getRetryAfter(error) {
    var _a, _b, _c, _d;
    return ((_d = (((_a = error.headers) === null || _a === void 0 ? void 0 : _a['retry-after']) ||
        (
        // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
        (_c = (_b = error.headers) === null || _b === void 0 ? void 0 : _b.get) === null || _c === void 0 ? void 0 : _c.call(_b, 'retry-after')))) !== null && _d !== void 0 ? _d : null);
}
function getRetryDelay(attempt, retryAfterHeader, maxDelayMs) {
    if (maxDelayMs === void 0) { maxDelayMs = 32000; }
    if (retryAfterHeader) {
        var seconds = parseInt(retryAfterHeader, 10);
        if (!isNaN(seconds)) {
            return seconds * 1000;
        }
    }
    var baseDelay = Math.min(exports.BASE_DELAY_MS * Math.pow(2, attempt - 1), maxDelayMs);
    var jitter = Math.random() * 0.25 * baseDelay;
    return baseDelay + jitter;
}
function parseMaxTokensContextOverflowError(error) {
    if (error.status !== 400 || !error.message) {
        return undefined;
    }
    if (!error.message.includes('input length and `max_tokens` exceed context limit')) {
        return undefined;
    }
    // Example format: "input length and `max_tokens` exceed context limit: 188059 + 20000 > 200000"
    var regex = /input length and `max_tokens` exceed context limit: (\d+) \+ (\d+) > (\d+)/;
    var match = error.message.match(regex);
    if (!match || match.length !== 4) {
        return undefined;
    }
    if (!match[1] || !match[2] || !match[3]) {
        (0, log_js_1.logError)(new Error('Unable to parse max_tokens from max_tokens exceed context limit error message'));
        return undefined;
    }
    var inputTokens = parseInt(match[1], 10);
    var maxTokens = parseInt(match[2], 10);
    var contextLimit = parseInt(match[3], 10);
    if (isNaN(inputTokens) || isNaN(maxTokens) || isNaN(contextLimit)) {
        return undefined;
    }
    return { inputTokens: inputTokens, maxTokens: maxTokens, contextLimit: contextLimit };
}
// TODO: Replace with a response header check once the API adds a dedicated
// header for fast-mode rejection (e.g., x-fast-mode-rejected). String-matching
// the error message is fragile and will break if the API wording changes.
function isFastModeNotEnabledError(error) {
    var _a, _b;
    if (!(error instanceof sdk_1.APIError)) {
        return false;
    }
    return (error.status === 400 &&
        ((_b = (_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('Fast mode is not enabled')) !== null && _b !== void 0 ? _b : false));
}
function is529Error(error) {
    var _a, _b;
    if (!(error instanceof sdk_1.APIError)) {
        return false;
    }
    // Check for 529 status code or overloaded error in message
    return (error.status === 529 ||
        // See below: the SDK sometimes fails to properly pass the 529 status code during streaming
        ((_b = (_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('"type":"overloaded_error"')) !== null && _b !== void 0 ? _b : false));
}
function isOAuthTokenRevokedError(error) {
    var _a, _b;
    return (error instanceof sdk_1.APIError &&
        error.status === 403 &&
        ((_b = (_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('OAuth token has been revoked')) !== null && _b !== void 0 ? _b : false));
}
function isBedrockAuthError(error) {
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_BEDROCK)) {
        // AWS libs reject without an API call if .aws holds a past Expiration value
        // otherwise, API calls that receive expired tokens give generic 403
        // "The security token included in the request is invalid"
        if ((0, aws_js_1.isAwsCredentialsProviderError)(error) ||
            (error instanceof sdk_1.APIError && error.status === 403)) {
            return true;
        }
    }
    return false;
}
/**
 * Clear AWS auth caches if appropriate.
 * @returns true if action was taken.
 */
function handleAwsCredentialError(error) {
    if (isBedrockAuthError(error)) {
        (0, auth_js_1.clearAwsCredentialsCache)();
        return true;
    }
    return false;
}
// google-auth-library throws plain Error (no typed name like AWS's
// CredentialsProviderError). Match common SDK-level credential-failure messages.
function isGoogleAuthLibraryCredentialError(error) {
    if (!(error instanceof Error))
        return false;
    var msg = error.message;
    return (msg.includes('Could not load the default credentials') ||
        msg.includes('Could not refresh access token') ||
        msg.includes('invalid_grant'));
}
function isVertexAuthError(error) {
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_VERTEX)) {
        // SDK-level: google-auth-library fails in prepareOptions() before the HTTP call
        if (isGoogleAuthLibraryCredentialError(error)) {
            return true;
        }
        // Server-side: Vertex returns 401 for expired/invalid tokens
        if (error instanceof sdk_1.APIError && error.status === 401) {
            return true;
        }
    }
    return false;
}
/**
 * Clear GCP auth caches if appropriate.
 * @returns true if action was taken.
 */
function handleGcpCredentialError(error) {
    if (isVertexAuthError(error)) {
        (0, auth_js_1.clearGcpCredentialsCache)();
        return true;
    }
    return false;
}
function shouldRetry(error) {
    var _a, _b;
    // Never retry mock errors - they're from /mock-limits command for testing
    if ((0, rateLimitMocking_js_1.isMockRateLimitError)(error)) {
        return false;
    }
    // Persistent mode: 429/529 always retryable, bypass subscriber gates and
    // x-should-retry header.
    if (isPersistentRetryEnabled() && isTransientCapacityError(error)) {
        return true;
    }
    // CCR mode: auth is via infrastructure-provided JWTs, so a 401/403 is a
    // transient blip (auth service flap, network hiccup) rather than bad
    // credentials. Bypass x-should-retry:false — the server assumes we'd retry
    // the same bad key, but our key is fine.
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) &&
        (error.status === 401 || error.status === 403)) {
        return true;
    }
    // Check for overloaded errors first by examining the message content
    // The SDK sometimes fails to properly pass the 529 status code during streaming,
    // so we need to check the error message directly
    if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('"type":"overloaded_error"')) {
        return true;
    }
    // Check for max tokens context overflow errors that we can handle
    if (parseMaxTokensContextOverflowError(error)) {
        return true;
    }
    // Note this is not a standard header.
    var shouldRetryHeader = (_b = error.headers) === null || _b === void 0 ? void 0 : _b.get('x-should-retry');
    // If the server explicitly says whether or not to retry, obey.
    // For Max and Pro users, should-retry is true, but in several hours, so we shouldn't.
    // Enterprise users can retry because they typically use PAYG instead of rate limits.
    if (shouldRetryHeader === 'true' &&
        (!(0, auth_js_1.isClaudeAISubscriber)() || (0, auth_js_1.isEnterpriseSubscriber)())) {
        return true;
    }
    // Ants can ignore x-should-retry: false for 5xx server errors only.
    // For other status codes (401, 403, 400, 429, etc.), respect the header.
    if (shouldRetryHeader === 'false') {
        var is5xxError = error.status !== undefined && error.status >= 500;
        if (!(process.env.USER_TYPE === 'ant' && is5xxError)) {
            return false;
        }
    }
    if (error instanceof sdk_1.APIConnectionError) {
        return true;
    }
    if (!error.status)
        return false;
    // Retry on request timeouts.
    if (error.status === 408)
        return true;
    // Retry on lock timeouts.
    if (error.status === 409)
        return true;
    // Retry on rate limits, but not for ClaudeAI Subscription users
    // Enterprise users can retry because they typically use PAYG instead of rate limits
    if (error.status === 429) {
        return !(0, auth_js_1.isClaudeAISubscriber)() || (0, auth_js_1.isEnterpriseSubscriber)();
    }
    // Clear API key cache on 401 and allow retry.
    // OAuth token handling is done in the main retry loop via handleOAuth401Error.
    if (error.status === 401) {
        (0, auth_js_1.clearApiKeyHelperCache)();
        return true;
    }
    // Retry on 403 "token revoked" (same refresh logic as 401, see above)
    if (isOAuthTokenRevokedError(error)) {
        return true;
    }
    // Retry internal errors.
    if (error.status && error.status >= 500)
        return true;
    return false;
}
function getDefaultMaxRetries() {
    if (process.env.CLAUDE_CODE_MAX_RETRIES) {
        return parseInt(process.env.CLAUDE_CODE_MAX_RETRIES, 10);
    }
    return DEFAULT_MAX_RETRIES;
}
function getMaxRetries(options) {
    var _a;
    return (_a = options.maxRetries) !== null && _a !== void 0 ? _a : getDefaultMaxRetries();
}
var DEFAULT_FAST_MODE_FALLBACK_HOLD_MS = 30 * 60 * 1000; // 30 minutes
var SHORT_RETRY_THRESHOLD_MS = 20 * 1000; // 20 seconds
var MIN_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
function getRetryAfterMs(error) {
    var retryAfter = getRetryAfter(error);
    if (retryAfter) {
        var seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) {
            return seconds * 1000;
        }
    }
    return null;
}
function getRateLimitResetDelayMs(error) {
    var _a, _b;
    var resetHeader = (_b = (_a = error.headers) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(_a, 'anthropic-ratelimit-unified-reset');
    if (!resetHeader)
        return null;
    var resetUnixSec = Number(resetHeader);
    if (!Number.isFinite(resetUnixSec))
        return null;
    var delayMs = resetUnixSec * 1000 - Date.now();
    if (delayMs <= 0)
        return null;
    return Math.min(delayMs, PERSISTENT_RESET_CAP_MS);
}
