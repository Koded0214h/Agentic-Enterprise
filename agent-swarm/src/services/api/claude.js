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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
};
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_NON_STREAMING_TOKENS = void 0;
exports.getExtraBodyParams = getExtraBodyParams;
exports.getPromptCachingEnabled = getPromptCachingEnabled;
exports.getCacheControl = getCacheControl;
exports.configureTaskBudgetParams = configureTaskBudgetParams;
exports.getAPIMetadata = getAPIMetadata;
exports.verifyApiKey = verifyApiKey;
exports.userMessageToMessageParam = userMessageToMessageParam;
exports.assistantMessageToMessageParam = assistantMessageToMessageParam;
exports.queryModelWithoutStreaming = queryModelWithoutStreaming;
exports.queryModelWithStreaming = queryModelWithStreaming;
exports.executeNonStreamingRequest = executeNonStreamingRequest;
exports.stripExcessMediaItems = stripExcessMediaItems;
exports.cleanupStream = cleanupStream;
exports.updateUsage = updateUsage;
exports.accumulateUsage = accumulateUsage;
exports.addCacheBreakpoints = addCacheBreakpoints;
exports.buildSystemPromptBlocks = buildSystemPromptBlocks;
exports.queryHaiku = queryHaiku;
exports.queryWithModel = queryWithModel;
exports.adjustParamsForNonStreaming = adjustParamsForNonStreaming;
exports.getMaxOutputTokensForModel = getMaxOutputTokensForModel;
var crypto_1 = require("crypto");
var providers_js_1 = require("src/utils/model/providers.js");
var system_js_1 = require("../../constants/system.js");
var Tool_js_1 = require("../../Tool.js");
var connectorText_js_1 = require("../../types/connectorText.js");
var api_js_1 = require("../../utils/api.js");
var auth_js_1 = require("../../utils/auth.js");
var betas_js_1 = require("../../utils/betas.js");
var config_js_1 = require("../../utils/config.js");
var context_js_1 = require("../../utils/context.js");
var effort_js_1 = require("../../utils/effort.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var fingerprint_js_1 = require("../../utils/fingerprint.js");
var log_js_1 = require("../../utils/log.js");
var messages_js_1 = require("../../utils/messages.js");
var model_js_1 = require("../../utils/model/model.js");
var systemPromptType_js_1 = require("../../utils/systemPromptType.js");
var tokens_js_1 = require("../../utils/tokens.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
var claudeAiLimits_js_1 = require("../claudeAiLimits.js");
var apiMicrocompact_js_1 = require("../compact/apiMicrocompact.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var autoModeStateModule = (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')
    ? require('../../utils/permissions/autoModeState.js')
    : null;
var bun_bundle_1 = require("bun:bundle");
var error_1 = require("@anthropic-ai/sdk/error");
var state_js_1 = require("src/bootstrap/state.js");
var betas_js_2 = require("src/constants/betas.js");
var cost_tracker_js_1 = require("src/cost-tracker.js");
var growthbook_js_2 = require("src/services/analytics/growthbook.js");
var advisor_js_1 = require("src/utils/advisor.js");
var agentContext_js_1 = require("src/utils/agentContext.js");
var auth_js_2 = require("src/utils/auth.js");
var betas_js_3 = require("src/utils/betas.js");
var common_js_1 = require("src/utils/claudeInChrome/common.js");
var prompt_js_1 = require("src/utils/claudeInChrome/prompt.js");
var context_js_2 = require("src/utils/context.js");
var debug_js_1 = require("src/utils/debug.js");
var diagLogs_js_1 = require("src/utils/diagLogs.js");
var effort_js_2 = require("src/utils/effort.js");
var fastMode_js_1 = require("src/utils/fastMode.js");
var generators_js_1 = require("src/utils/generators.js");
var headlessProfiler_js_1 = require("src/utils/headlessProfiler.js");
var mcpInstructionsDelta_js_1 = require("src/utils/mcpInstructionsDelta.js");
var modelCost_js_1 = require("src/utils/modelCost.js");
var queryProfiler_js_1 = require("src/utils/queryProfiler.js");
var thinking_js_1 = require("src/utils/thinking.js");
var toolSearch_js_1 = require("src/utils/toolSearch.js");
var apiLimits_js_1 = require("../../constants/apiLimits.js");
var betas_js_4 = require("../../constants/betas.js");
var prompt_js_2 = require("../../tools/ToolSearchTool/prompt.js");
var array_js_1 = require("../../utils/array.js");
var contentArray_js_1 = require("../../utils/contentArray.js");
var envValidation_js_1 = require("../../utils/envValidation.js");
var json_js_1 = require("../../utils/json.js");
var bedrock_js_1 = require("../../utils/model/bedrock.js");
var model_js_2 = require("../../utils/model/model.js");
var sessionActivity_js_1 = require("../../utils/sessionActivity.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var sessionTracing_js_1 = require("../../utils/telemetry/sessionTracing.js");
/* eslint-enable @typescript-eslint/no-require-imports */
var index_js_1 = require("../analytics/index.js");
var microCompact_js_1 = require("../compact/microCompact.js");
var manager_js_1 = require("../lsp/manager.js");
var utils_js_1 = require("../mcp/utils.js");
var vcr_js_1 = require("../vcr.js");
var client_js_1 = require("./client.js");
var errors_js_2 = require("./errors.js");
var logging_js_1 = require("./logging.js");
var promptCacheBreakDetection_js_1 = require("./promptCacheBreakDetection.js");
var withRetry_js_1 = require("./withRetry.js");
/**
 * Assemble the extra body parameters for the API request, based on the
 * CLAUDE_CODE_EXTRA_BODY environment variable if present and on any beta
 * headers (primarily for Bedrock requests).
 *
 * @param betaHeaders - An array of beta headers to include in the request.
 * @returns A JSON object representing the extra body parameters.
 */
function getExtraBodyParams(betaHeaders) {
    // Parse user's extra body parameters first
    var extraBodyStr = process.env.CLAUDE_CODE_EXTRA_BODY;
    var result = {};
    if (extraBodyStr) {
        try {
            // Parse as JSON, which can be null, boolean, number, string, array or object
            var parsed = (0, json_js_1.safeParseJSON)(extraBodyStr);
            // We expect an object with key-value pairs to spread into API parameters
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                // Shallow clone — safeParseJSON is LRU-cached and returns the same
                // object reference for the same string. Mutating `result` below
                // would poison the cache, causing stale values to persist.
                result = __assign({}, parsed);
            }
            else {
                (0, debug_js_1.logForDebugging)("CLAUDE_CODE_EXTRA_BODY env var must be a JSON object, but was given ".concat(extraBodyStr), { level: 'error' });
            }
        }
        catch (error) {
            (0, debug_js_1.logForDebugging)("Error parsing CLAUDE_CODE_EXTRA_BODY: ".concat((0, errors_js_1.errorMessage)(error)), { level: 'error' });
        }
    }
    // Anti-distillation: send fake_tools opt-in for 1P CLI only
    if ((0, bun_bundle_1.feature)('ANTI_DISTILLATION_CC')
        ? process.env.CLAUDE_CODE_ENTRYPOINT === 'cli' &&
            (0, betas_js_3.shouldIncludeFirstPartyOnlyBetas)() &&
            (0, growthbook_js_2.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_anti_distill_fake_tool_injection', false)
        : false) {
        result.anti_distillation = ['fake_tools'];
    }
    // Handle beta headers if provided
    if (betaHeaders && betaHeaders.length > 0) {
        if (result.anthropic_beta && Array.isArray(result.anthropic_beta)) {
            // Add to existing array, avoiding duplicates
            var existingHeaders_1 = result.anthropic_beta;
            var newHeaders = betaHeaders.filter(function (header) { return !existingHeaders_1.includes(header); });
            result.anthropic_beta = __spreadArray(__spreadArray([], existingHeaders_1, true), newHeaders, true);
        }
        else {
            // Create new array with the beta headers
            result.anthropic_beta = betaHeaders;
        }
    }
    return result;
}
function getPromptCachingEnabled(model) {
    // Global disable takes precedence
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_PROMPT_CACHING))
        return false;
    // Check if we should disable for small/fast model
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_PROMPT_CACHING_HAIKU)) {
        var smallFastModel = (0, model_js_1.getSmallFastModel)();
        if (model === smallFastModel)
            return false;
    }
    // Check if we should disable for default Sonnet
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_PROMPT_CACHING_SONNET)) {
        var defaultSonnet = (0, model_js_1.getDefaultSonnetModel)();
        if (model === defaultSonnet)
            return false;
    }
    // Check if we should disable for default Opus
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_PROMPT_CACHING_OPUS)) {
        var defaultOpus = (0, model_js_1.getDefaultOpusModel)();
        if (model === defaultOpus)
            return false;
    }
    return true;
}
function getCacheControl(_a) {
    var _b = _a === void 0 ? {} : _a, scope = _b.scope, querySource = _b.querySource;
    return __assign(__assign({ type: 'ephemeral' }, (should1hCacheTTL(querySource) && { ttl: '1h' })), (scope === 'global' && { scope: scope }));
}
/**
 * Determines if 1h TTL should be used for prompt caching.
 *
 * Only applied when:
 * 1. User is eligible (ant or subscriber within rate limits)
 * 2. The query source matches a pattern in the GrowthBook allowlist
 *
 * GrowthBook config shape: { allowlist: string[] }
 * Patterns support trailing '*' for prefix matching.
 * Examples:
 * - { allowlist: ["repl_main_thread*", "sdk"] } — main thread + SDK only
 * - { allowlist: ["repl_main_thread*", "sdk", "agent:*"] } — also subagents
 * - { allowlist: ["*"] } — all sources
 *
 * The allowlist is cached in STATE for session stability — prevents mixed
 * TTLs when GrowthBook's disk cache updates mid-request.
 */
function should1hCacheTTL(querySource) {
    var _a;
    // 3P Bedrock users get 1h TTL when opted in via env var — they manage their own billing
    // No GrowthBook gating needed since 3P users don't have GrowthBook configured
    if ((0, providers_js_1.getAPIProvider)() === 'bedrock' &&
        (0, envUtils_js_1.isEnvTruthy)(process.env.ENABLE_PROMPT_CACHING_1H_BEDROCK)) {
        return true;
    }
    // Latch eligibility in bootstrap state for session stability — prevents
    // mid-session overage flips from changing the cache_control TTL, which
    // would bust the server-side prompt cache (~20K tokens per flip).
    var userEligible = (0, state_js_1.getPromptCache1hEligible)();
    if (userEligible === null) {
        userEligible =
            process.env.USER_TYPE === 'ant' ||
                ((0, auth_js_2.isClaudeAISubscriber)() && !claudeAiLimits_js_1.currentLimits.isUsingOverage);
        (0, state_js_1.setPromptCache1hEligible)(userEligible);
    }
    if (!userEligible)
        return false;
    // Cache allowlist in bootstrap state for session stability — prevents mixed
    // TTLs when GrowthBook's disk cache updates mid-request
    var allowlist = (0, state_js_1.getPromptCache1hAllowlist)();
    if (allowlist === null) {
        var config = (0, growthbook_js_2.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_prompt_cache_1h_config', {});
        allowlist = (_a = config.allowlist) !== null && _a !== void 0 ? _a : [];
        (0, state_js_1.setPromptCache1hAllowlist)(allowlist);
    }
    return (querySource !== undefined &&
        allowlist.some(function (pattern) {
            return pattern.endsWith('*')
                ? querySource.startsWith(pattern.slice(0, -1))
                : querySource === pattern;
        }));
}
/**
 * Configure effort parameters for API request.
 *
 */
function configureEffortParams(effortValue, outputConfig, extraBodyParams, betas, model) {
    if (!(0, effort_js_2.modelSupportsEffort)(model) || 'effort' in outputConfig) {
        return;
    }
    if (effortValue === undefined) {
        betas.push(betas_js_2.EFFORT_BETA_HEADER);
    }
    else if (typeof effortValue === 'string') {
        // Send string effort level as is
        outputConfig.effort = effortValue;
        betas.push(betas_js_2.EFFORT_BETA_HEADER);
    }
    else if (process.env.USER_TYPE === 'ant') {
        // Numeric effort override - ant-only (uses anthropic_internal)
        var existingInternal = extraBodyParams.anthropic_internal || {};
        extraBodyParams.anthropic_internal = __assign(__assign({}, existingInternal), { effort_override: effortValue });
    }
}
function configureTaskBudgetParams(taskBudget, outputConfig, betas) {
    if (!taskBudget ||
        'task_budget' in outputConfig ||
        !(0, betas_js_3.shouldIncludeFirstPartyOnlyBetas)()) {
        return;
    }
    outputConfig.task_budget = __assign({ type: 'tokens', total: taskBudget.total }, (taskBudget.remaining !== undefined && {
        remaining: taskBudget.remaining,
    }));
    if (!betas.includes(betas_js_2.TASK_BUDGETS_BETA_HEADER)) {
        betas.push(betas_js_2.TASK_BUDGETS_BETA_HEADER);
    }
}
function getAPIMetadata() {
    var _a, _b;
    // https://docs.google.com/document/d/1dURO9ycXXQCBS0V4Vhl4poDBRgkelFc5t2BNPoEgH5Q/edit?tab=t.0#heading=h.5g7nec5b09w5
    var extra = {};
    var extraStr = process.env.CLAUDE_CODE_EXTRA_METADATA;
    if (extraStr) {
        var parsed = (0, json_js_1.safeParseJSON)(extraStr, false);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            extra = parsed;
        }
        else {
            (0, debug_js_1.logForDebugging)("CLAUDE_CODE_EXTRA_METADATA env var must be a JSON object, but was given ".concat(extraStr), { level: 'error' });
        }
    }
    return {
        user_id: (0, slowOperations_js_1.jsonStringify)(__assign(__assign({}, extra), { device_id: (0, config_js_1.getOrCreateUserID)(), 
            // Only include OAuth account UUID when actively using OAuth authentication
            account_uuid: (_b = (_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.accountUuid) !== null && _b !== void 0 ? _b : '', session_id: (0, state_js_1.getSessionId)() })),
    };
}
function verifyApiKey(apiKey, isNonInteractiveSession) {
    return __awaiter(this, void 0, void 0, function () {
        var model_1, betas_1, errorFromRetry_1, error;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Skip API verification if running in print mode (isNonInteractiveSession)
                    if (isNonInteractiveSession) {
                        return [2 /*return*/, true];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    model_1 = (0, model_js_1.getSmallFastModel)();
                    betas_1 = (0, betas_js_1.getModelBetas)(model_1);
                    return [4 /*yield*/, (0, generators_js_1.returnValue)((0, withRetry_js_1.withRetry)(function () {
                            return (0, client_js_1.getAnthropicClient)({
                                apiKey: apiKey,
                                maxRetries: 3,
                                model: model_1,
                                source: 'verify_api_key',
                            });
                        }, function (anthropic) { return __awaiter(_this, void 0, void 0, function () {
                            var messages;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        messages = [{ role: 'user', content: 'test' }];
                                        // biome-ignore lint/plugin: API key verification is intentionally a minimal direct call
                                        return [4 /*yield*/, anthropic.beta.messages.create(__assign(__assign(__assign({ model: model_1, max_tokens: 1, messages: messages, temperature: 1 }, (betas_1.length > 0 && { betas: betas_1 })), { metadata: getAPIMetadata() }), getExtraBodyParams()))];
                                    case 1:
                                        // biome-ignore lint/plugin: API key verification is intentionally a minimal direct call
                                        _a.sent();
                                        return [2 /*return*/, true];
                                }
                            });
                        }); }, { maxRetries: 2, model: model_1, thinkingConfig: { type: 'disabled' } }))];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    errorFromRetry_1 = _a.sent();
                    error = errorFromRetry_1;
                    if (errorFromRetry_1 instanceof withRetry_js_1.CannotRetryError) {
                        error = errorFromRetry_1.originalError;
                    }
                    (0, log_js_1.logError)(error);
                    // Check for authentication error
                    if (error instanceof Error &&
                        error.message.includes('{"type":"error","error":{"type":"authentication_error","message":"invalid x-api-key"}}')) {
                        return [2 /*return*/, false];
                    }
                    throw error;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function userMessageToMessageParam(message, addCache, enablePromptCaching, querySource) {
    if (addCache === void 0) { addCache = false; }
    if (addCache) {
        if (typeof message.message.content === 'string') {
            return {
                role: 'user',
                content: [
                    __assign({ type: 'text', text: message.message.content }, (enablePromptCaching && {
                        cache_control: getCacheControl({ querySource: querySource }),
                    })),
                ],
            };
        }
        else {
            return {
                role: 'user',
                content: message.message.content.map(function (_, i) { return (__assign(__assign({}, _), (i === message.message.content.length - 1
                    ? enablePromptCaching
                        ? { cache_control: getCacheControl({ querySource: querySource }) }
                        : {}
                    : {}))); }),
            };
        }
    }
    // Clone array content to prevent in-place mutations (e.g., insertCacheEditsBlock's
    // splice) from contaminating the original message. Without cloning, multiple calls
    // to addCacheBreakpoints share the same array and each splices in duplicate cache_edits.
    return {
        role: 'user',
        content: Array.isArray(message.message.content)
            ? __spreadArray([], message.message.content, true) : message.message.content,
    };
}
function assistantMessageToMessageParam(message, addCache, enablePromptCaching, querySource) {
    if (addCache === void 0) { addCache = false; }
    if (addCache) {
        if (typeof message.message.content === 'string') {
            return {
                role: 'assistant',
                content: [
                    __assign({ type: 'text', text: message.message.content }, (enablePromptCaching && {
                        cache_control: getCacheControl({ querySource: querySource }),
                    })),
                ],
            };
        }
        else {
            return {
                role: 'assistant',
                content: message.message.content.map(function (_, i) { return (__assign(__assign({}, _), (i === message.message.content.length - 1 &&
                    _.type !== 'thinking' &&
                    _.type !== 'redacted_thinking' &&
                    ((0, bun_bundle_1.feature)('CONNECTOR_TEXT') ? !(0, connectorText_js_1.isConnectorTextBlock)(_) : true)
                    ? enablePromptCaching
                        ? { cache_control: getCacheControl({ querySource: querySource }) }
                        : {}
                    : {}))); }),
            };
        }
    }
    return {
        role: 'assistant',
        content: message.message.content,
    };
}
function queryModelWithoutStreaming(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var assistantMessage, _c, _d, _e, message, e_1_1;
        var _f, e_1, _g, _h;
        var messages = _b.messages, systemPrompt = _b.systemPrompt, thinkingConfig = _b.thinkingConfig, tools = _b.tools, signal = _b.signal, options = _b.options;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 5, 6, 11]);
                    _c = true, _d = __asyncValues((0, vcr_js_1.withStreamingVCR)(messages, function () {
                        return __asyncGenerator(this, arguments, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(queryModel(messages, systemPrompt, thinkingConfig, tools, signal, options))))];
                                    case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        });
                    }));
                    _j.label = 1;
                case 1: return [4 /*yield*/, _d.next()];
                case 2:
                    if (!(_e = _j.sent(), _f = _e.done, !_f)) return [3 /*break*/, 4];
                    _h = _e.value;
                    _c = false;
                    message = _h;
                    if (message.type === 'assistant') {
                        assistantMessage = message;
                    }
                    _j.label = 3;
                case 3:
                    _c = true;
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 11];
                case 5:
                    e_1_1 = _j.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 11];
                case 6:
                    _j.trys.push([6, , 9, 10]);
                    if (!(!_c && !_f && (_g = _d.return))) return [3 /*break*/, 8];
                    return [4 /*yield*/, _g.call(_d)];
                case 7:
                    _j.sent();
                    _j.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 10: return [7 /*endfinally*/];
                case 11:
                    if (!assistantMessage) {
                        // If the signal was aborted, throw APIUserAbortError instead of a generic error
                        // This allows callers to handle abort scenarios gracefully
                        if (signal.aborted) {
                            throw new error_1.APIUserAbortError();
                        }
                        throw new Error('No assistant message found');
                    }
                    return [2 /*return*/, assistantMessage];
            }
        });
    });
}
function queryModelWithStreaming(_a) {
    return __asyncGenerator(this, arguments, function queryModelWithStreaming_1(_b) {
        var messages = _b.messages, systemPrompt = _b.systemPrompt, thinkingConfig = _b.thinkingConfig, tools = _b.tools, signal = _b.signal, options = _b.options;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [5 /*yield**/, __values(__asyncDelegator(__asyncValues((0, vcr_js_1.withStreamingVCR)(messages, function () {
                        return __asyncGenerator(this, arguments, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(queryModel(messages, systemPrompt, thinkingConfig, tools, signal, options))))];
                                    case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        });
                    }))))];
                case 1: return [4 /*yield*/, __await.apply(void 0, [_c.sent()])];
                case 2: return [4 /*yield*/, __await.apply(void 0, [_c.sent()])];
                case 3: return [2 /*return*/, _c.sent()];
            }
        });
    });
}
/**
 * Determines if an LSP tool should be deferred (tool appears with defer_loading: true)
 * because LSP initialization is not yet complete.
 */
function shouldDeferLspTool(tool) {
    if (!('isLsp' in tool) || !tool.isLsp) {
        return false;
    }
    var status = (0, manager_js_1.getInitializationStatus)();
    // Defer when pending or not started
    return status.status === 'pending' || status.status === 'not-started';
}
/**
 * Per-attempt timeout for non-streaming fallback requests, in milliseconds.
 * Reads API_TIMEOUT_MS when set so slow backends and the streaming path
 * share the same ceiling.
 *
 * Remote sessions default to 120s to stay under CCR's container idle-kill
 * (~5min) so a hung fallback to a wedged backend surfaces a clean
 * APIConnectionTimeoutError instead of stalling past SIGKILL.
 *
 * Otherwise defaults to 300s — long enough for slow backends without
 * approaching the API's 10-minute non-streaming boundary.
 */
function getNonstreamingFallbackTimeoutMs() {
    var override = parseInt(process.env.API_TIMEOUT_MS || '', 10);
    if (override)
        return override;
    return (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) ? 120000 : 300000;
}
/**
 * Helper generator for non-streaming API requests.
 * Encapsulates the common pattern of creating a withRetry generator,
 * iterating to yield system messages, and returning the final BetaMessage.
 */
function executeNonStreamingRequest(clientOptions, retryOptions, paramsFromContext, onAttempt, captureRequest, 
/**
 * Request ID of the failed streaming attempt this fallback is recovering
 * from. Emitted in tengu_nonstreaming_fallback_error for funnel correlation.
 */
originatingRequestId) {
    return __asyncGenerator(this, arguments, function executeNonStreamingRequest_1() {
        var fallbackTimeoutMs, generator, e;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fallbackTimeoutMs = getNonstreamingFallbackTimeoutMs();
                    generator = (0, withRetry_js_1.withRetry)(function () {
                        return (0, client_js_1.getAnthropicClient)({
                            maxRetries: 0,
                            model: clientOptions.model,
                            fetchOverride: clientOptions.fetchOverride,
                            source: clientOptions.source,
                        });
                    }, function (anthropic, attempt, context) { return __awaiter(_this, void 0, void 0, function () {
                        var start, retryParams, adjustedParams, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    start = Date.now();
                                    retryParams = paramsFromContext(context);
                                    captureRequest(retryParams);
                                    onAttempt(attempt, start, retryParams.max_tokens);
                                    adjustedParams = adjustParamsForNonStreaming(retryParams, exports.MAX_NON_STREAMING_TOKENS);
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, anthropic.beta.messages.create(__assign(__assign({}, adjustedParams), { model: (0, model_js_2.normalizeModelStringForAPI)(adjustedParams.model) }), {
                                            signal: retryOptions.signal,
                                            timeout: fallbackTimeoutMs,
                                        })];
                                case 2: 
                                // biome-ignore lint/plugin: non-streaming API call
                                return [2 /*return*/, _a.sent()];
                                case 3:
                                    err_1 = _a.sent();
                                    // User aborts are not errors — re-throw immediately without logging
                                    if (err_1 instanceof error_1.APIUserAbortError)
                                        throw err_1;
                                    // Instrumentation: record when the non-streaming request errors (including
                                    // timeouts). Lets us distinguish "fallback hung past container kill"
                                    // (no event) from "fallback hit the bounded timeout" (this event).
                                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_nonstreaming_fallback_error');
                                    (0, index_js_1.logEvent)('tengu_nonstreaming_fallback_error', {
                                        model: clientOptions.model,
                                        error: err_1 instanceof Error
                                            ? err_1.name
                                            : 'unknown',
                                        attempt: attempt,
                                        timeout_ms: fallbackTimeoutMs,
                                        request_id: (originatingRequestId !== null && originatingRequestId !== void 0 ? originatingRequestId : 'unknown'),
                                    });
                                    throw err_1;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); }, __assign(__assign({ model: retryOptions.model, fallbackModel: retryOptions.fallbackModel, thinkingConfig: retryOptions.thinkingConfig }, ((0, fastMode_js_1.isFastModeEnabled)() && { fastMode: retryOptions.fastMode })), { signal: retryOptions.signal, initialConsecutive529Errors: retryOptions.initialConsecutive529Errors, querySource: retryOptions.querySource }));
                    _a.label = 1;
                case 1: return [4 /*yield*/, __await(generator.next())];
                case 2:
                    e = _a.sent();
                    if (!(!e.done && e.value.type === 'system')) return [3 /*break*/, 5];
                    return [4 /*yield*/, __await(e.value)];
                case 3: return [4 /*yield*/, _a.sent()];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (!e.done) return [3 /*break*/, 1];
                    _a.label = 6;
                case 6: return [4 /*yield*/, __await(e.value)];
                case 7: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Extracts the request ID from the most recent assistant message in the
 * conversation. Used to link consecutive API requests in analytics so we can
 * join them for cache-hit-rate analysis and incremental token tracking.
 *
 * Deriving this from the message array (rather than global state) ensures each
 * query chain (main thread, subagent, teammate) tracks its own request chain
 * independently, and rollback/undo naturally updates the value.
 */
function getPreviousRequestIdFromMessages(messages) {
    for (var i = messages.length - 1; i >= 0; i--) {
        var msg = messages[i];
        if (msg.type === 'assistant' && msg.requestId) {
            return msg.requestId;
        }
    }
    return undefined;
}
function isMedia(block) {
    return block.type === 'image' || block.type === 'document';
}
function isToolResult(block) {
    return block.type === 'tool_result';
}
/**
 * Ensures messages contain at most `limit` media items (images + documents).
 * Strips oldest media first to preserve the most recent.
 */
function stripExcessMediaItems(messages, limit) {
    var toRemove = 0;
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var msg = messages_1[_i];
        if (!Array.isArray(msg.message.content))
            continue;
        for (var _a = 0, _b = msg.message.content; _a < _b.length; _a++) {
            var block = _b[_a];
            if (isMedia(block))
                toRemove++;
            if (isToolResult(block) && Array.isArray(block.content)) {
                for (var _c = 0, _d = block.content; _c < _d.length; _c++) {
                    var nested = _d[_c];
                    if (isMedia(nested))
                        toRemove++;
                }
            }
        }
    }
    toRemove -= limit;
    if (toRemove <= 0)
        return messages;
    return messages.map(function (msg) {
        if (toRemove <= 0)
            return msg;
        var content = msg.message.content;
        if (!Array.isArray(content))
            return msg;
        var before = toRemove;
        var stripped = content
            .map(function (block) {
            if (toRemove <= 0 ||
                !isToolResult(block) ||
                !Array.isArray(block.content))
                return block;
            var filtered = block.content.filter(function (n) {
                if (toRemove > 0 && isMedia(n)) {
                    toRemove--;
                    return false;
                }
                return true;
            });
            return filtered.length === block.content.length
                ? block
                : __assign(__assign({}, block), { content: filtered });
        })
            .filter(function (block) {
            if (toRemove > 0 && isMedia(block)) {
                toRemove--;
                return false;
            }
            return true;
        });
        return before === toRemove
            ? msg
            : __assign(__assign({}, msg), { message: __assign(__assign({}, msg.message), { content: stripped }) });
    });
}
function queryModel(messages, systemPrompt, thinkingConfig, tools, signal, options) {
    return __asyncGenerator(this, arguments, function queryModel_1() {
        // Release all stream resources to prevent native memory leaks.
        // The Response object holds native TLS/socket buffers that live outside the
        // V8 heap (observed on the Node.js/npm path; see GH #32920), so we must
        // explicitly cancel and release it regardless of how the generator exits.
        function releaseStreamResources() {
            var _a;
            cleanupStream(stream);
            stream = undefined;
            if (streamResponse) {
                (_a = streamResponse.body) === null || _a === void 0 ? void 0 : _a.cancel().catch(function () { });
                streamResponse = undefined;
            }
        }
        function clearStreamIdleTimers() {
            if (streamIdleWarningTimer_1 !== null) {
                clearTimeout(streamIdleWarningTimer_1);
                streamIdleWarningTimer_1 = null;
            }
            if (streamIdleTimer_1 !== null) {
                clearTimeout(streamIdleTimer_1);
                streamIdleTimer_1 = null;
            }
        }
        function resetStreamIdleTimer() {
            clearStreamIdleTimers();
            if (!streamWatchdogEnabled_1) {
                return;
            }
            streamIdleWarningTimer_1 = setTimeout(function (warnMs) {
                (0, debug_js_1.logForDebugging)("Streaming idle warning: no chunks received for ".concat(warnMs / 1000, "s"), { level: 'warn' });
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_streaming_idle_warning');
            }, STREAM_IDLE_WARNING_MS_1, STREAM_IDLE_WARNING_MS_1);
            streamIdleTimer_1 = setTimeout(function () {
                streamIdleAborted_1 = true;
                streamWatchdogFiredAt_1 = performance.now();
                (0, debug_js_1.logForDebugging)("Streaming idle timeout: no chunks received for ".concat(STREAM_IDLE_TIMEOUT_MS_1 / 1000, "s, aborting stream"), { level: 'error' });
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_streaming_idle_timeout');
                (0, index_js_1.logEvent)('tengu_streaming_idle_timeout', {
                    model: options.model,
                    request_id: (streamRequestId !== null && streamRequestId !== void 0 ? streamRequestId : 'unknown'),
                    timeout_ms: STREAM_IDLE_TIMEOUT_MS_1,
                });
                releaseStreamResources();
            }, STREAM_IDLE_TIMEOUT_MS_1);
        }
        var _a, previousRequestId, resolvedModel, _b, isAgenticQuery, betas, advisorModel, advisorOption, advisorExperiment, normalizedAdvisorModel, useToolSearch, deferredToolNames, _i, tools_1, t, filteredTools, discoveredToolNames_1, toolSearchHeader, cachedMCEnabled, cacheEditingBetaHeader, _c, isCachedMicrocompactEnabled, isModelSupportedForCacheEditing, getCachedMCConfig, betas_2, featureEnabled, modelSupported, config, useGlobalCacheFeature, willDefer, needsToolBasedCacheMarker, globalCacheStrategy, toolSchemas, includedDeferredTools, messagesForAPI, fingerprint, deferredToolList, hasChromeTools, injectChromeHere, enablePromptCaching, system, useBetas, extraToolSchemas, allTools, isFastMode, afkHeaderLatched, fastModeHeaderLatched, cacheEditingHeaderLatched, thinkingClearLatched, lastCompletion, effort, toolsForCacheDetection, newContext, llmSpan, startIncludingRetries, start, attemptNumber, attemptStartTimes, stream, streamRequestId, clientRequestId, streamResponse, consumedCacheEdits, consumedPinnedEdits, lastRequestBetas, paramsFromContext, queryParams, logMessagesLength_1, logBetas_1, logThinkingType_1, logEffortValue_1, newMessages, ttftMs, partialMessage, contentBlocks, usage, costUSD, stopReason, didFallBackToNonStreaming, fallbackMessage, maxOutputTokens, responseHeaders, research, isFastModeRequest, isAdvisorInProgress, generator, e, streamWatchdogEnabled_1, STREAM_IDLE_TIMEOUT_MS_1, STREAM_IDLE_WARNING_MS_1, streamIdleAborted_1, streamWatchdogFiredAt_1, streamIdleWarningTimer_1, streamIdleTimer_1, isFirstChunk, lastEventTime, STALL_THRESHOLD_MS, totalStallTime, stallCount, _d, stream_1, stream_1_1, part, now, timeSinceLastEvent, _e, contentBlock, delta, contentBlock, m, _f, newMessages_1, msg, lastMsg, costUSDForPart, refusalMessage, e_2_1, exitDelayMs, resp, streamingError_1, exitDelayMs, disableFallback, result, m, errorFromRetry_2, is404StreamCreationError, failedRequestId, result, m, fallbackError_1, error, errorModel, requestId, error, errorModel, requestId, fallbackUsage, fallbackCost, logMessageCount, logMessageTokens;
        var _this = this;
        var _g, e_2, _h, _j;
        var _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
        return __generator(this, function (_y) {
            switch (_y.label) {
                case 0:
                    _a = !(0, auth_js_2.isClaudeAISubscriber)() &&
                        (0, model_js_1.isNonCustomOpusModel)(options.model);
                    if (!_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, __await((0, growthbook_js_1.getDynamicConfig_BLOCKS_ON_INIT)('tengu-off-switch', {
                            activated: false,
                        }))];
                case 1:
                    _a = (_y.sent()).activated;
                    _y.label = 2;
                case 2:
                    if (!_a) return [3 /*break*/, 6];
                    (0, index_js_1.logEvent)('tengu_off_switch_query', {});
                    return [4 /*yield*/, __await((0, errors_js_2.getAssistantMessageFromError)(new Error(errors_js_2.CUSTOM_OFF_SWITCH_MESSAGE), options.model))];
                case 3: return [4 /*yield*/, _y.sent()];
                case 4:
                    _y.sent();
                    return [4 /*yield*/, __await(void 0)];
                case 5: return [2 /*return*/, _y.sent()];
                case 6:
                    previousRequestId = getPreviousRequestIdFromMessages(messages);
                    if (!((0, providers_js_1.getAPIProvider)() === 'bedrock' &&
                        options.model.includes('application-inference-profile'))) return [3 /*break*/, 8];
                    return [4 /*yield*/, __await((0, bedrock_js_1.getInferenceProfileBackingModel)(options.model))];
                case 7:
                    _b = ((_k = (_y.sent())) !== null && _k !== void 0 ? _k : options.model);
                    return [3 /*break*/, 9];
                case 8:
                    _b = options.model;
                    _y.label = 9;
                case 9:
                    resolvedModel = _b;
                    (0, queryProfiler_js_1.queryCheckpoint)('query_tool_schema_build_start');
                    isAgenticQuery = options.querySource.startsWith('repl_main_thread') ||
                        options.querySource.startsWith('agent:') ||
                        options.querySource === 'sdk' ||
                        options.querySource === 'hook_agent' ||
                        options.querySource === 'verification_agent';
                    betas = (0, betas_js_1.getMergedBetas)(options.model, { isAgenticQuery: isAgenticQuery });
                    // Always send the advisor beta header when advisor is enabled, so
                    // non-agentic queries (compact, side_question, extract_memories, etc.)
                    // can parse advisor server_tool_use blocks already in the conversation history.
                    if ((0, advisor_js_1.isAdvisorEnabled)()) {
                        betas.push(betas_js_4.ADVISOR_BETA_HEADER);
                    }
                    if (isAgenticQuery && (0, advisor_js_1.isAdvisorEnabled)()) {
                        advisorOption = options.advisorModel;
                        advisorExperiment = (0, advisor_js_1.getExperimentAdvisorModels)();
                        if (advisorExperiment !== undefined) {
                            if ((0, model_js_2.normalizeModelStringForAPI)(advisorExperiment.baseModel) ===
                                (0, model_js_2.normalizeModelStringForAPI)(options.model)) {
                                // Override the advisor model if the base model matches. We
                                // should only have experiment models if the user cannot
                                // configure it themselves.
                                advisorOption = advisorExperiment.advisorModel;
                            }
                        }
                        if (advisorOption) {
                            normalizedAdvisorModel = (0, model_js_2.normalizeModelStringForAPI)((0, model_js_2.parseUserSpecifiedModel)(advisorOption));
                            if (!(0, advisor_js_1.modelSupportsAdvisor)(options.model)) {
                                (0, debug_js_1.logForDebugging)("[AdvisorTool] Skipping advisor - base model ".concat(options.model, " does not support advisor"));
                            }
                            else if (!(0, advisor_js_1.isValidAdvisorModel)(normalizedAdvisorModel)) {
                                (0, debug_js_1.logForDebugging)("[AdvisorTool] Skipping advisor - ".concat(normalizedAdvisorModel, " is not a valid advisor model"));
                            }
                            else {
                                advisorModel = normalizedAdvisorModel;
                                (0, debug_js_1.logForDebugging)("[AdvisorTool] Server-side tool enabled with ".concat(advisorModel, " as the advisor model"));
                            }
                        }
                    }
                    return [4 /*yield*/, __await((0, toolSearch_js_1.isToolSearchEnabled)(options.model, tools, options.getToolPermissionContext, options.agents, 'query')
                        // Precompute once — isDeferredTool does 2 GrowthBook lookups per call
                        )];
                case 10:
                    useToolSearch = _y.sent();
                    deferredToolNames = new Set();
                    if (useToolSearch) {
                        for (_i = 0, tools_1 = tools; _i < tools_1.length; _i++) {
                            t = tools_1[_i];
                            if ((0, prompt_js_2.isDeferredTool)(t))
                                deferredToolNames.add(t.name);
                        }
                    }
                    // Even if tool search mode is enabled, skip if there are no deferred tools
                    // AND no MCP servers are still connecting. When servers are pending, keep
                    // ToolSearch available so the model can discover tools after they connect.
                    if (useToolSearch &&
                        deferredToolNames.size === 0 &&
                        !options.hasPendingMcpServers) {
                        (0, debug_js_1.logForDebugging)('Tool search disabled: no deferred tools available to search');
                        useToolSearch = false;
                    }
                    if (useToolSearch) {
                        discoveredToolNames_1 = (0, toolSearch_js_1.extractDiscoveredToolNames)(messages);
                        filteredTools = tools.filter(function (tool) {
                            // Always include non-deferred tools
                            if (!deferredToolNames.has(tool.name))
                                return true;
                            // Always include ToolSearchTool (so it can discover more tools)
                            if ((0, Tool_js_1.toolMatchesName)(tool, prompt_js_2.TOOL_SEARCH_TOOL_NAME))
                                return true;
                            // Only include deferred tools that have been discovered
                            return discoveredToolNames_1.has(tool.name);
                        });
                    }
                    else {
                        filteredTools = tools.filter(function (t) { return !(0, Tool_js_1.toolMatchesName)(t, prompt_js_2.TOOL_SEARCH_TOOL_NAME); });
                    }
                    toolSearchHeader = useToolSearch ? (0, betas_js_3.getToolSearchBetaHeader)() : null;
                    if (toolSearchHeader && (0, providers_js_1.getAPIProvider)() !== 'bedrock') {
                        if (!betas.includes(toolSearchHeader)) {
                            betas.push(toolSearchHeader);
                        }
                    }
                    cachedMCEnabled = false;
                    cacheEditingBetaHeader = '';
                    if (!(0, bun_bundle_1.feature)('CACHED_MICROCOMPACT')) return [3 /*break*/, 13];
                    return [4 /*yield*/, __await(Promise.resolve().then(function () { return require('../compact/cachedMicrocompact.js'); }))];
                case 11:
                    _c = _y.sent(), isCachedMicrocompactEnabled = _c.isCachedMicrocompactEnabled, isModelSupportedForCacheEditing = _c.isModelSupportedForCacheEditing, getCachedMCConfig = _c.getCachedMCConfig;
                    return [4 /*yield*/, __await(Promise.resolve().then(function () { return require('src/constants/betas.js'); }))];
                case 12:
                    betas_2 = _y.sent();
                    cacheEditingBetaHeader = betas_2.CACHE_EDITING_BETA_HEADER;
                    featureEnabled = isCachedMicrocompactEnabled();
                    modelSupported = isModelSupportedForCacheEditing(options.model);
                    cachedMCEnabled = featureEnabled && modelSupported;
                    config = getCachedMCConfig();
                    (0, debug_js_1.logForDebugging)("Cached MC gate: enabled=".concat(featureEnabled, " modelSupported=").concat(modelSupported, " model=").concat(options.model, " supportedModels=").concat((0, slowOperations_js_1.jsonStringify)(config.supportedModels)));
                    _y.label = 13;
                case 13:
                    useGlobalCacheFeature = (0, betas_js_3.shouldUseGlobalCacheScope)();
                    willDefer = function (t) {
                        return useToolSearch && (deferredToolNames.has(t.name) || shouldDeferLspTool(t));
                    };
                    needsToolBasedCacheMarker = useGlobalCacheFeature &&
                        filteredTools.some(function (t) { return t.isMcp === true && !willDefer(t); });
                    // Ensure prompt_caching_scope beta header is present when global cache is enabled.
                    if (useGlobalCacheFeature &&
                        !betas.includes(betas_js_2.PROMPT_CACHING_SCOPE_BETA_HEADER)) {
                        betas.push(betas_js_2.PROMPT_CACHING_SCOPE_BETA_HEADER);
                    }
                    globalCacheStrategy = useGlobalCacheFeature
                        ? needsToolBasedCacheMarker
                            ? 'none'
                            : 'system_prompt'
                        : 'none';
                    return [4 /*yield*/, __await(Promise.all(filteredTools.map(function (tool) {
                            return (0, api_js_1.toolToAPISchema)(tool, {
                                getToolPermissionContext: options.getToolPermissionContext,
                                tools: tools,
                                agents: options.agents,
                                allowedAgentTypes: options.allowedAgentTypes,
                                model: options.model,
                                deferLoading: willDefer(tool),
                            });
                        })))];
                case 14:
                    toolSchemas = _y.sent();
                    if (useToolSearch) {
                        includedDeferredTools = (0, array_js_1.count)(filteredTools, function (t) {
                            return deferredToolNames.has(t.name);
                        });
                        (0, debug_js_1.logForDebugging)("Dynamic tool loading: ".concat(includedDeferredTools, "/").concat(deferredToolNames.size, " deferred tools included"));
                    }
                    (0, queryProfiler_js_1.queryCheckpoint)('query_tool_schema_build_end');
                    // Normalize messages before building system prompt (needed for fingerprinting)
                    // Instrumentation: Track message count before normalization
                    (0, index_js_1.logEvent)('tengu_api_before_normalize', {
                        preNormalizedMessageCount: messages.length,
                    });
                    (0, queryProfiler_js_1.queryCheckpoint)('query_message_normalization_start');
                    messagesForAPI = (0, messages_js_1.normalizeMessagesForAPI)(messages, filteredTools);
                    (0, queryProfiler_js_1.queryCheckpoint)('query_message_normalization_end');
                    // Model-specific post-processing: strip tool-search-specific fields if the
                    // selected model doesn't support tool search.
                    //
                    // Why is this needed in addition to normalizeMessagesForAPI?
                    // - normalizeMessagesForAPI uses isToolSearchEnabledNoModelCheck() because it's
                    //   called from ~20 places (analytics, feedback, sharing, etc.), many of which
                    //   don't have model context. Adding model to its signature would be a large refactor.
                    // - This post-processing uses the model-aware isToolSearchEnabled() check
                    // - This handles mid-conversation model switching (e.g., Sonnet → Haiku) where
                    //   stale tool-search fields from the previous model would cause 400 errors
                    //
                    // Note: For assistant messages, normalizeMessagesForAPI already normalized the
                    // tool inputs, so stripCallerFieldFromAssistantMessage only needs to remove the
                    // 'caller' field (not re-normalize inputs).
                    if (!useToolSearch) {
                        messagesForAPI = messagesForAPI.map(function (msg) {
                            switch (msg.type) {
                                case 'user':
                                    // Strip tool_reference blocks from tool_result content
                                    return (0, messages_js_1.stripToolReferenceBlocksFromUserMessage)(msg);
                                case 'assistant':
                                    // Strip 'caller' field from tool_use blocks
                                    return (0, messages_js_1.stripCallerFieldFromAssistantMessage)(msg);
                                default:
                                    return msg;
                            }
                        });
                    }
                    // Repair tool_use/tool_result pairing mismatches that can occur when resuming
                    // remote/teleport sessions. Inserts synthetic error tool_results for orphaned
                    // tool_uses and strips orphaned tool_results referencing non-existent tool_uses.
                    messagesForAPI = (0, messages_js_1.ensureToolResultPairing)(messagesForAPI);
                    // Strip advisor blocks — the API rejects them without the beta header.
                    if (!betas.includes(betas_js_4.ADVISOR_BETA_HEADER)) {
                        messagesForAPI = (0, messages_js_1.stripAdvisorBlocks)(messagesForAPI);
                    }
                    // Strip excess media items before making the API call.
                    // The API rejects requests with >100 media items but returns a confusing error.
                    // Rather than erroring (which is hard to recover from in Cowork/CCD), we
                    // silently drop the oldest media items to stay within the limit.
                    messagesForAPI = stripExcessMediaItems(messagesForAPI, apiLimits_js_1.API_MAX_MEDIA_PER_REQUEST);
                    // Instrumentation: Track message count after normalization
                    (0, index_js_1.logEvent)('tengu_api_after_normalize', {
                        postNormalizedMessageCount: messagesForAPI.length,
                    });
                    fingerprint = (0, fingerprint_js_1.computeFingerprintFromMessages)(messagesForAPI);
                    // When the delta attachment is enabled, deferred tools are announced
                    // via persisted deferred_tools_delta attachments instead of this
                    // ephemeral prepend (which busts cache whenever the pool changes).
                    if (useToolSearch && !(0, toolSearch_js_1.isDeferredToolsDeltaEnabled)()) {
                        deferredToolList = tools
                            .filter(function (t) { return deferredToolNames.has(t.name); })
                            .map(prompt_js_2.formatDeferredToolLine)
                            .sort()
                            .join('\n');
                        if (deferredToolList) {
                            messagesForAPI = __spreadArray([
                                (0, messages_js_1.createUserMessage)({
                                    content: "<available-deferred-tools>\n".concat(deferredToolList, "\n</available-deferred-tools>"),
                                    isMeta: true,
                                })
                            ], messagesForAPI, true);
                        }
                    }
                    hasChromeTools = filteredTools.some(function (t) {
                        return (0, utils_js_1.isToolFromMcpServer)(t.name, common_js_1.CLAUDE_IN_CHROME_MCP_SERVER_NAME);
                    });
                    injectChromeHere = useToolSearch && hasChromeTools && !(0, mcpInstructionsDelta_js_1.isMcpInstructionsDeltaEnabled)();
                    // filter(Boolean) works by converting each element to a boolean - empty strings become false and are filtered out.
                    systemPrompt = (0, systemPromptType_js_1.asSystemPrompt)(__spreadArray(__spreadArray(__spreadArray([
                        (0, system_js_1.getAttributionHeader)(fingerprint),
                        (0, system_js_1.getCLISyspromptPrefix)({
                            isNonInteractive: options.isNonInteractiveSession,
                            hasAppendSystemPrompt: options.hasAppendSystemPrompt,
                        })
                    ], systemPrompt, true), (advisorModel ? [advisor_js_1.ADVISOR_TOOL_INSTRUCTIONS] : []), true), (injectChromeHere ? [prompt_js_1.CHROME_TOOL_SEARCH_INSTRUCTIONS] : []), true).filter(Boolean));
                    // Prepend system prompt block for easy API identification
                    (0, api_js_1.logAPIPrefix)(systemPrompt);
                    enablePromptCaching = (_l = options.enablePromptCaching) !== null && _l !== void 0 ? _l : getPromptCachingEnabled(options.model);
                    system = buildSystemPromptBlocks(systemPrompt, enablePromptCaching, {
                        skipGlobalCacheForSystemPrompt: needsToolBasedCacheMarker,
                        querySource: options.querySource,
                    });
                    useBetas = betas.length > 0;
                    extraToolSchemas = __spreadArray([], ((_m = options.extraToolSchemas) !== null && _m !== void 0 ? _m : []), true);
                    if (advisorModel) {
                        // Server tools must be in the tools array by API contract. Appended after
                        // toolSchemas (which carries the cache_control marker) so toggling /advisor
                        // only churns the small suffix, not the cached prefix.
                        extraToolSchemas.push({
                            type: 'advisor_20260301',
                            name: 'advisor',
                            model: advisorModel,
                        });
                    }
                    allTools = __spreadArray(__spreadArray([], toolSchemas, true), extraToolSchemas, true);
                    isFastMode = (0, fastMode_js_1.isFastModeEnabled)() &&
                        (0, fastMode_js_1.isFastModeAvailable)() &&
                        !(0, fastMode_js_1.isFastModeCooldown)() &&
                        (0, fastMode_js_1.isFastModeSupportedByModel)(options.model) &&
                        !!options.fastMode;
                    afkHeaderLatched = (0, state_js_1.getAfkModeHeaderLatched)() === true;
                    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
                        if (!afkHeaderLatched &&
                            isAgenticQuery &&
                            (0, betas_js_3.shouldIncludeFirstPartyOnlyBetas)() &&
                            ((_o = autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.isAutoModeActive()) !== null && _o !== void 0 ? _o : false)) {
                            afkHeaderLatched = true;
                            (0, state_js_1.setAfkModeHeaderLatched)(true);
                        }
                    }
                    fastModeHeaderLatched = (0, state_js_1.getFastModeHeaderLatched)() === true;
                    if (!fastModeHeaderLatched && isFastMode) {
                        fastModeHeaderLatched = true;
                        (0, state_js_1.setFastModeHeaderLatched)(true);
                    }
                    cacheEditingHeaderLatched = (0, state_js_1.getCacheEditingHeaderLatched)() === true;
                    if ((0, bun_bundle_1.feature)('CACHED_MICROCOMPACT')) {
                        if (!cacheEditingHeaderLatched &&
                            cachedMCEnabled &&
                            (0, providers_js_1.getAPIProvider)() === 'firstParty' &&
                            options.querySource === 'repl_main_thread') {
                            cacheEditingHeaderLatched = true;
                            (0, state_js_1.setCacheEditingHeaderLatched)(true);
                        }
                    }
                    thinkingClearLatched = (0, state_js_1.getThinkingClearLatched)() === true;
                    if (!thinkingClearLatched && isAgenticQuery) {
                        lastCompletion = (0, state_js_1.getLastApiCompletionTimestamp)();
                        if (lastCompletion !== null &&
                            Date.now() - lastCompletion > promptCacheBreakDetection_js_1.CACHE_TTL_1HOUR_MS) {
                            thinkingClearLatched = true;
                            (0, state_js_1.setThinkingClearLatched)(true);
                        }
                    }
                    effort = (0, effort_js_1.resolveAppliedEffort)(options.model, options.effortValue);
                    if ((0, bun_bundle_1.feature)('PROMPT_CACHE_BREAK_DETECTION')) {
                        toolsForCacheDetection = allTools.filter(function (t) { return !('defer_loading' in t && t.defer_loading); });
                        // Capture everything that could affect the server-side cache key.
                        // Pass latched header values (not live state) so break detection
                        // reflects what we actually send, not what the user toggled.
                        (0, promptCacheBreakDetection_js_1.recordPromptState)({
                            system: system,
                            toolSchemas: toolsForCacheDetection,
                            querySource: options.querySource,
                            model: options.model,
                            agentId: options.agentId,
                            fastMode: fastModeHeaderLatched,
                            globalCacheStrategy: globalCacheStrategy,
                            betas: betas,
                            autoModeActive: afkHeaderLatched,
                            isUsingOverage: (_p = claudeAiLimits_js_1.currentLimits.isUsingOverage) !== null && _p !== void 0 ? _p : false,
                            cachedMCEnabled: cacheEditingHeaderLatched,
                            effortValue: effort,
                            extraBodyParams: getExtraBodyParams(),
                        });
                    }
                    newContext = (0, sessionTracing_js_1.isBetaTracingEnabled)()
                        ? {
                            systemPrompt: systemPrompt.join('\n\n'),
                            querySource: options.querySource,
                            tools: (0, slowOperations_js_1.jsonStringify)(allTools),
                        }
                        : undefined;
                    llmSpan = (0, sessionTracing_js_1.startLLMRequestSpan)(options.model, newContext, messagesForAPI, isFastMode);
                    startIncludingRetries = Date.now();
                    start = Date.now();
                    attemptNumber = 0;
                    attemptStartTimes = [];
                    stream = undefined;
                    streamRequestId = undefined;
                    clientRequestId = undefined;
                    streamResponse = undefined;
                    consumedCacheEdits = cachedMCEnabled ? (0, microCompact_js_1.consumePendingCacheEdits)() : null;
                    consumedPinnedEdits = cachedMCEnabled ? (0, microCompact_js_1.getPinnedCacheEdits)() : [];
                    paramsFromContext = function (retryContext) {
                        var _a, _b, _c;
                        var betasParams = __spreadArray([], betas, true);
                        // Append 1M beta dynamically for the Sonnet 1M experiment.
                        if (!betasParams.includes(betas_js_2.CONTEXT_1M_BETA_HEADER) &&
                            (0, context_js_1.getSonnet1mExpTreatmentEnabled)(retryContext.model)) {
                            betasParams.push(betas_js_2.CONTEXT_1M_BETA_HEADER);
                        }
                        // For Bedrock, include both model-based betas and dynamically-added tool search header
                        var bedrockBetas = (0, providers_js_1.getAPIProvider)() === 'bedrock'
                            ? __spreadArray(__spreadArray([], (0, betas_js_1.getBedrockExtraBodyParamsBetas)(retryContext.model), true), (toolSearchHeader ? [toolSearchHeader] : []), true) : [];
                        var extraBodyParams = getExtraBodyParams(bedrockBetas);
                        var outputConfig = __assign({}, ((_a = extraBodyParams.output_config) !== null && _a !== void 0 ? _a : {}));
                        configureEffortParams(effort, outputConfig, extraBodyParams, betasParams, options.model);
                        configureTaskBudgetParams(options.taskBudget, outputConfig, betasParams);
                        // Merge outputFormat into extraBodyParams.output_config alongside effort
                        // Requires structured-outputs beta header per SDK (see parse() in messages.mjs)
                        if (options.outputFormat && !('format' in outputConfig)) {
                            outputConfig.format = options.outputFormat;
                            // Add beta header if not already present and provider supports it
                            if ((0, betas_js_3.modelSupportsStructuredOutputs)(options.model) &&
                                !betasParams.includes(betas_js_2.STRUCTURED_OUTPUTS_BETA_HEADER)) {
                                betasParams.push(betas_js_2.STRUCTURED_OUTPUTS_BETA_HEADER);
                            }
                        }
                        // Retry context gets preference because it tries to course correct if we exceed the context window limit
                        var maxOutputTokens = (retryContext === null || retryContext === void 0 ? void 0 : retryContext.maxTokensOverride) ||
                            options.maxOutputTokensOverride ||
                            getMaxOutputTokensForModel(options.model);
                        var hasThinking = thinkingConfig.type !== 'disabled' &&
                            !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_THINKING);
                        var thinking = undefined;
                        // IMPORTANT: Do not change the adaptive-vs-budget thinking selection below
                        // without notifying the model launch DRI and research. This is a sensitive
                        // setting that can greatly affect model quality and bashing.
                        if (hasThinking && (0, thinking_js_1.modelSupportsThinking)(options.model)) {
                            if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING) &&
                                (0, thinking_js_1.modelSupportsAdaptiveThinking)(options.model)) {
                                // For models that support adaptive thinking, always use adaptive
                                // thinking without a budget.
                                thinking = {
                                    type: 'adaptive',
                                };
                            }
                            else {
                                // For models that do not support adaptive thinking, use the default
                                // thinking budget unless explicitly specified.
                                var thinkingBudget = (0, context_js_2.getMaxThinkingTokensForModel)(options.model);
                                if (thinkingConfig.type === 'enabled' &&
                                    thinkingConfig.budgetTokens !== undefined) {
                                    thinkingBudget = thinkingConfig.budgetTokens;
                                }
                                thinkingBudget = Math.min(maxOutputTokens - 1, thinkingBudget);
                                thinking = {
                                    budget_tokens: thinkingBudget,
                                    type: 'enabled',
                                };
                            }
                        }
                        // Get API context management strategies if enabled
                        var contextManagement = (0, apiMicrocompact_js_1.getAPIContextManagement)({
                            hasThinking: hasThinking,
                            isRedactThinkingActive: betasParams.includes(betas_js_2.REDACT_THINKING_BETA_HEADER),
                            clearAllThinking: thinkingClearLatched,
                        });
                        var enablePromptCaching = (_b = options.enablePromptCaching) !== null && _b !== void 0 ? _b : getPromptCachingEnabled(retryContext.model);
                        // Fast mode: header is latched session-stable (cache-safe), but
                        // `speed='fast'` stays dynamic so cooldown still suppresses the actual
                        // fast-mode request without changing the cache key.
                        var speed;
                        var isFastModeForRetry = (0, fastMode_js_1.isFastModeEnabled)() &&
                            (0, fastMode_js_1.isFastModeAvailable)() &&
                            !(0, fastMode_js_1.isFastModeCooldown)() &&
                            (0, fastMode_js_1.isFastModeSupportedByModel)(options.model) &&
                            !!retryContext.fastMode;
                        if (isFastModeForRetry) {
                            speed = 'fast';
                        }
                        if (fastModeHeaderLatched && !betasParams.includes(betas_js_2.FAST_MODE_BETA_HEADER)) {
                            betasParams.push(betas_js_2.FAST_MODE_BETA_HEADER);
                        }
                        // AFK mode beta: latched once auto mode is first activated. Still gated
                        // by isAgenticQuery per-call so classifiers/compaction don't get it.
                        if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
                            if (afkHeaderLatched &&
                                (0, betas_js_3.shouldIncludeFirstPartyOnlyBetas)() &&
                                isAgenticQuery &&
                                !betasParams.includes(betas_js_2.AFK_MODE_BETA_HEADER)) {
                                betasParams.push(betas_js_2.AFK_MODE_BETA_HEADER);
                            }
                        }
                        // Cache editing beta: header is latched session-stable; useCachedMC
                        // (controls cache_edits body behavior) stays live so edits stop when
                        // the feature disables but the header doesn't flip.
                        var useCachedMC = cachedMCEnabled &&
                            (0, providers_js_1.getAPIProvider)() === 'firstParty' &&
                            options.querySource === 'repl_main_thread';
                        if (cacheEditingHeaderLatched &&
                            (0, providers_js_1.getAPIProvider)() === 'firstParty' &&
                            options.querySource === 'repl_main_thread' &&
                            !betasParams.includes(cacheEditingBetaHeader)) {
                            betasParams.push(cacheEditingBetaHeader);
                            (0, debug_js_1.logForDebugging)('Cache editing beta header enabled for cached microcompact');
                        }
                        // Only send temperature when thinking is disabled — the API requires
                        // temperature: 1 when thinking is enabled, which is already the default.
                        var temperature = !hasThinking
                            ? ((_c = options.temperatureOverride) !== null && _c !== void 0 ? _c : 1)
                            : undefined;
                        lastRequestBetas = betasParams;
                        return __assign(__assign(__assign(__assign(__assign(__assign(__assign({ model: (0, model_js_2.normalizeModelStringForAPI)(options.model), messages: addCacheBreakpoints(messagesForAPI, enablePromptCaching, options.querySource, useCachedMC, consumedCacheEdits, consumedPinnedEdits, options.skipCacheWrite), system: system, tools: allTools, tool_choice: options.toolChoice }, (useBetas && { betas: betasParams })), { metadata: getAPIMetadata(), max_tokens: maxOutputTokens, thinking: thinking }), (temperature !== undefined && { temperature: temperature })), (contextManagement &&
                            useBetas &&
                            betasParams.includes(betas_js_2.CONTEXT_MANAGEMENT_BETA_HEADER) && {
                            context_management: contextManagement,
                        })), extraBodyParams), (Object.keys(outputConfig).length > 0 && {
                            output_config: outputConfig,
                        })), (speed !== undefined && { speed: speed }));
                    };
                    // Compute log scalars synchronously so the fire-and-forget .then() closure
                    // captures only primitives instead of paramsFromContext's full closure scope
                    // (messagesForAPI, system, allTools, betas — the entire request-building
                    // context), which would otherwise be pinned until the promise resolves.
                    {
                        queryParams = paramsFromContext({
                            model: options.model,
                            thinkingConfig: thinkingConfig,
                        });
                        logMessagesLength_1 = queryParams.messages.length;
                        logBetas_1 = useBetas ? ((_q = queryParams.betas) !== null && _q !== void 0 ? _q : []) : [];
                        logThinkingType_1 = (_s = (_r = queryParams.thinking) === null || _r === void 0 ? void 0 : _r.type) !== null && _s !== void 0 ? _s : 'disabled';
                        logEffortValue_1 = (_t = queryParams.output_config) === null || _t === void 0 ? void 0 : _t.effort;
                        void options.getToolPermissionContext().then(function (permissionContext) {
                            var _a;
                            (0, logging_js_1.logAPIQuery)({
                                model: options.model,
                                messagesLength: logMessagesLength_1,
                                temperature: (_a = options.temperatureOverride) !== null && _a !== void 0 ? _a : 1,
                                betas: logBetas_1,
                                permissionMode: permissionContext.mode,
                                querySource: options.querySource,
                                queryTracking: options.queryTracking,
                                thinkingType: logThinkingType_1,
                                effortValue: logEffortValue_1,
                                fastMode: isFastMode,
                                previousRequestId: previousRequestId,
                            });
                        });
                    }
                    newMessages = [];
                    ttftMs = 0;
                    partialMessage = undefined;
                    contentBlocks = [];
                    usage = logging_js_1.EMPTY_USAGE;
                    costUSD = 0;
                    stopReason = null;
                    didFallBackToNonStreaming = false;
                    maxOutputTokens = 0;
                    responseHeaders = undefined;
                    research = undefined;
                    isFastModeRequest = isFastMode // Keep separate state as it may change if falling back
                    ;
                    isAdvisorInProgress = false;
                    _y.label = 15;
                case 15:
                    _y.trys.push([15, 62, 82, 83]);
                    (0, queryProfiler_js_1.queryCheckpoint)('query_client_creation_start');
                    generator = (0, withRetry_js_1.withRetry)(function () {
                        return (0, client_js_1.getAnthropicClient)({
                            maxRetries: 0, // Disabled auto-retry in favor of manual implementation
                            model: options.model,
                            fetchOverride: options.fetchOverride,
                            source: options.querySource,
                        });
                    }, function (anthropic, attempt, context) { return __awaiter(_this, void 0, void 0, function () {
                        var params, result;
                        var _a;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    attemptNumber = attempt;
                                    isFastModeRequest = (_b = context.fastMode) !== null && _b !== void 0 ? _b : false;
                                    start = Date.now();
                                    attemptStartTimes.push(start);
                                    // Client has been created by withRetry's getClient() call. This fires
                                    // once per attempt; on retries the client is usually cached (withRetry
                                    // only calls getClient() again after auth errors), so the delta from
                                    // client_creation_start is meaningful on attempt 1.
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_client_creation_end');
                                    params = paramsFromContext(context);
                                    (0, log_js_1.captureAPIRequest)(params, options.querySource); // Capture for bug reports
                                    maxOutputTokens = params.max_tokens;
                                    // Fire immediately before the fetch is dispatched. .withResponse() below
                                    // awaits until response headers arrive, so this MUST be before the await
                                    // or the "Network TTFB" phase measurement is wrong.
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_api_request_sent');
                                    if (!options.agentId) {
                                        (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('api_request_sent');
                                    }
                                    // Generate and track client request ID so timeouts (which return no
                                    // server request ID) can still be correlated with server logs.
                                    // First-party only — 3P providers don't log it (inc-4029 class).
                                    clientRequestId =
                                        (0, providers_js_1.getAPIProvider)() === 'firstParty' && (0, providers_js_1.isFirstPartyAnthropicBaseUrl)()
                                            ? (0, crypto_1.randomUUID)()
                                            : undefined;
                                    return [4 /*yield*/, anthropic.beta.messages
                                            .create(__assign(__assign({}, params), { stream: true }), __assign({ signal: signal }, (clientRequestId && {
                                            headers: (_a = {}, _a[client_js_1.CLIENT_REQUEST_ID_HEADER] = clientRequestId, _a),
                                        })))
                                            .withResponse()];
                                case 1:
                                    result = _c.sent();
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_response_headers_received');
                                    streamRequestId = result.request_id;
                                    streamResponse = result.response;
                                    return [2 /*return*/, result.data];
                            }
                        });
                    }); }, __assign(__assign({ model: options.model, fallbackModel: options.fallbackModel, thinkingConfig: thinkingConfig }, ((0, fastMode_js_1.isFastModeEnabled)() ? { fastMode: isFastMode } : false)), { signal: signal, querySource: options.querySource }));
                    e = void 0;
                    _y.label = 16;
                case 16: return [4 /*yield*/, __await(generator.next()
                    // yield API error messages (the stream has a 'controller' property, error messages don't)
                    )];
                case 17:
                    e = _y.sent();
                    if (!!('controller' in e.value)) return [3 /*break*/, 20];
                    return [4 /*yield*/, __await(e.value)];
                case 18: return [4 /*yield*/, _y.sent()];
                case 19:
                    _y.sent();
                    _y.label = 20;
                case 20:
                    if (!e.done) return [3 /*break*/, 16];
                    _y.label = 21;
                case 21:
                    stream = e.value;
                    // reset state
                    newMessages.length = 0;
                    ttftMs = 0;
                    partialMessage = undefined;
                    contentBlocks.length = 0;
                    usage = logging_js_1.EMPTY_USAGE;
                    stopReason = null;
                    isAdvisorInProgress = false;
                    streamWatchdogEnabled_1 = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_ENABLE_STREAM_WATCHDOG);
                    STREAM_IDLE_TIMEOUT_MS_1 = parseInt(process.env.CLAUDE_STREAM_IDLE_TIMEOUT_MS || '', 10) || 90000;
                    STREAM_IDLE_WARNING_MS_1 = STREAM_IDLE_TIMEOUT_MS_1 / 2;
                    streamIdleAborted_1 = false;
                    streamWatchdogFiredAt_1 = null;
                    streamIdleWarningTimer_1 = null;
                    streamIdleTimer_1 = null;
                    resetStreamIdleTimer();
                    (0, sessionActivity_js_1.startSessionActivity)('api_call');
                    _y.label = 22;
                case 22:
                    _y.trys.push([22, 55, 60, 61]);
                    isFirstChunk = true;
                    lastEventTime = null // Set after first chunk to avoid measuring TTFB as a stall
                    ;
                    STALL_THRESHOLD_MS = 30000 // 30 seconds
                    ;
                    totalStallTime = 0;
                    stallCount = 0;
                    _y.label = 23;
                case 23:
                    _y.trys.push([23, 48, 49, 54]);
                    _d = true, stream_1 = __asyncValues(stream);
                    _y.label = 24;
                case 24: return [4 /*yield*/, __await(stream_1.next())];
                case 25:
                    if (!(stream_1_1 = _y.sent(), _g = stream_1_1.done, !_g)) return [3 /*break*/, 47];
                    _j = stream_1_1.value;
                    _d = false;
                    part = _j;
                    resetStreamIdleTimer();
                    now = Date.now();
                    // Detect and log streaming stalls (only after first event to avoid counting TTFB)
                    if (lastEventTime !== null) {
                        timeSinceLastEvent = now - lastEventTime;
                        if (timeSinceLastEvent > STALL_THRESHOLD_MS) {
                            stallCount++;
                            totalStallTime += timeSinceLastEvent;
                            (0, debug_js_1.logForDebugging)("Streaming stall detected: ".concat((timeSinceLastEvent / 1000).toFixed(1), "s gap between events (stall #").concat(stallCount, ")"), { level: 'warn' });
                            (0, index_js_1.logEvent)('tengu_streaming_stall', {
                                stall_duration_ms: timeSinceLastEvent,
                                stall_count: stallCount,
                                total_stall_time_ms: totalStallTime,
                                event_type: part.type,
                                model: options.model,
                                request_id: (streamRequestId !== null && streamRequestId !== void 0 ? streamRequestId : 'unknown'),
                            });
                        }
                    }
                    lastEventTime = now;
                    if (isFirstChunk) {
                        (0, debug_js_1.logForDebugging)('Stream started - received first chunk');
                        (0, queryProfiler_js_1.queryCheckpoint)('query_first_chunk_received');
                        if (!options.agentId) {
                            (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('first_chunk');
                        }
                        (0, queryProfiler_js_1.endQueryProfile)();
                        isFirstChunk = false;
                    }
                    _e = part.type;
                    switch (_e) {
                        case 'message_start': return [3 /*break*/, 26];
                        case 'content_block_start': return [3 /*break*/, 27];
                        case 'content_block_delta': return [3 /*break*/, 28];
                        case 'content_block_stop': return [3 /*break*/, 29];
                        case 'message_delta': return [3 /*break*/, 32];
                        case 'message_stop': return [3 /*break*/, 42];
                    }
                    return [3 /*break*/, 43];
                case 26:
                    {
                        partialMessage = part.message;
                        ttftMs = Date.now() - start;
                        usage = updateUsage(usage, (_u = part.message) === null || _u === void 0 ? void 0 : _u.usage);
                        // Capture research from message_start if available (internal only).
                        // Always overwrite with the latest value.
                        if (process.env.USER_TYPE === 'ant' &&
                            'research' in part.message) {
                            research = part.message
                                .research;
                        }
                        return [3 /*break*/, 43];
                    }
                    _y.label = 27;
                case 27:
                    switch (part.content_block.type) {
                        case 'tool_use':
                            contentBlocks[part.index] = __assign(__assign({}, part.content_block), { input: '' });
                            break;
                        case 'server_tool_use':
                            contentBlocks[part.index] = __assign(__assign({}, part.content_block), { input: '' });
                            if (part.content_block.name === 'advisor') {
                                isAdvisorInProgress = true;
                                (0, debug_js_1.logForDebugging)("[AdvisorTool] Advisor tool called");
                                (0, index_js_1.logEvent)('tengu_advisor_tool_call', {
                                    model: options.model,
                                    advisor_model: (advisorModel !== null && advisorModel !== void 0 ? advisorModel : 'unknown'),
                                });
                            }
                            break;
                        case 'text':
                            contentBlocks[part.index] = __assign(__assign({}, part.content_block), { 
                                // awkwardly, the sdk sometimes returns text as part of a
                                // content_block_start message, then returns the same text
                                // again in a content_block_delta message. we ignore it here
                                // since there doesn't seem to be a way to detect when a
                                // content_block_delta message duplicates the text.
                                text: '' });
                            break;
                        case 'thinking':
                            contentBlocks[part.index] = __assign(__assign({}, part.content_block), { 
                                // also awkward
                                thinking: '', 
                                // initialize signature to ensure field exists even if signature_delta never arrives
                                signature: '' });
                            break;
                        default:
                            // even more awkwardly, the sdk mutates the contents of text blocks
                            // as it works. we want the blocks to be immutable, so that we can
                            // accumulate state ourselves.
                            contentBlocks[part.index] = __assign({}, part.content_block);
                            if (part.content_block.type === 'advisor_tool_result') {
                                isAdvisorInProgress = false;
                                (0, debug_js_1.logForDebugging)("[AdvisorTool] Advisor tool result received");
                            }
                            break;
                    }
                    return [3 /*break*/, 43];
                case 28:
                    {
                        contentBlock = contentBlocks[part.index];
                        delta = part.delta;
                        if (!contentBlock) {
                            (0, index_js_1.logEvent)('tengu_streaming_error', {
                                error_type: 'content_block_not_found_delta',
                                part_type: part.type,
                                part_index: part.index,
                            });
                            throw new RangeError('Content block not found');
                        }
                        if ((0, bun_bundle_1.feature)('CONNECTOR_TEXT') &&
                            delta.type === 'connector_text_delta') {
                            if (contentBlock.type !== 'connector_text') {
                                (0, index_js_1.logEvent)('tengu_streaming_error', {
                                    error_type: 'content_block_type_mismatch_connector_text',
                                    expected_type: 'connector_text',
                                    actual_type: contentBlock.type,
                                });
                                throw new Error('Content block is not a connector_text block');
                            }
                            contentBlock.connector_text += delta.connector_text;
                        }
                        else {
                            switch (delta.type) {
                                case 'citations_delta':
                                    // TODO: handle citations
                                    break;
                                case 'input_json_delta':
                                    if (contentBlock.type !== 'tool_use' &&
                                        contentBlock.type !== 'server_tool_use') {
                                        (0, index_js_1.logEvent)('tengu_streaming_error', {
                                            error_type: 'content_block_type_mismatch_input_json',
                                            expected_type: 'tool_use',
                                            actual_type: contentBlock.type,
                                        });
                                        throw new Error('Content block is not a input_json block');
                                    }
                                    if (typeof contentBlock.input !== 'string') {
                                        (0, index_js_1.logEvent)('tengu_streaming_error', {
                                            error_type: 'content_block_input_not_string',
                                            input_type: typeof contentBlock.input,
                                        });
                                        throw new Error('Content block input is not a string');
                                    }
                                    contentBlock.input += delta.partial_json;
                                    break;
                                case 'text_delta':
                                    if (contentBlock.type !== 'text') {
                                        (0, index_js_1.logEvent)('tengu_streaming_error', {
                                            error_type: 'content_block_type_mismatch_text',
                                            expected_type: 'text',
                                            actual_type: contentBlock.type,
                                        });
                                        throw new Error('Content block is not a text block');
                                    }
                                    contentBlock.text += delta.text;
                                    break;
                                case 'signature_delta':
                                    if ((0, bun_bundle_1.feature)('CONNECTOR_TEXT') &&
                                        contentBlock.type === 'connector_text') {
                                        contentBlock.signature = delta.signature;
                                        break;
                                    }
                                    if (contentBlock.type !== 'thinking') {
                                        (0, index_js_1.logEvent)('tengu_streaming_error', {
                                            error_type: 'content_block_type_mismatch_thinking_signature',
                                            expected_type: 'thinking',
                                            actual_type: contentBlock.type,
                                        });
                                        throw new Error('Content block is not a thinking block');
                                    }
                                    contentBlock.signature = delta.signature;
                                    break;
                                case 'thinking_delta':
                                    if (contentBlock.type !== 'thinking') {
                                        (0, index_js_1.logEvent)('tengu_streaming_error', {
                                            error_type: 'content_block_type_mismatch_thinking_delta',
                                            expected_type: 'thinking',
                                            actual_type: contentBlock.type,
                                        });
                                        throw new Error('Content block is not a thinking block');
                                    }
                                    contentBlock.thinking += delta.thinking;
                                    break;
                            }
                        }
                        // Capture research from content_block_delta if available (internal only).
                        // Always overwrite with the latest value.
                        if (process.env.USER_TYPE === 'ant' && 'research' in part) {
                            research = part.research;
                        }
                        return [3 /*break*/, 43];
                    }
                    _y.label = 29;
                case 29:
                    contentBlock = contentBlocks[part.index];
                    if (!contentBlock) {
                        (0, index_js_1.logEvent)('tengu_streaming_error', {
                            error_type: 'content_block_not_found_stop',
                            part_type: part.type,
                            part_index: part.index,
                        });
                        throw new RangeError('Content block not found');
                    }
                    if (!partialMessage) {
                        (0, index_js_1.logEvent)('tengu_streaming_error', {
                            error_type: 'partial_message_not_found',
                            part_type: part.type,
                        });
                        throw new Error('Message not found');
                    }
                    m = __assign(__assign({ message: __assign(__assign({}, partialMessage), { content: (0, messages_js_1.normalizeContentFromAPI)([contentBlock], tools, options.agentId) }), requestId: streamRequestId !== null && streamRequestId !== void 0 ? streamRequestId : undefined, type: 'assistant', uuid: (0, crypto_1.randomUUID)(), timestamp: new Date().toISOString() }, (process.env.USER_TYPE === 'ant' &&
                        research !== undefined && { research: research })), (advisorModel && { advisorModel: advisorModel }));
                    newMessages.push(m);
                    return [4 /*yield*/, __await(m)];
                case 30: return [4 /*yield*/, _y.sent()];
                case 31:
                    _y.sent();
                    return [3 /*break*/, 43];
                case 32:
                    usage = updateUsage(usage, part.usage);
                    // Capture research from message_delta if available (internal only).
                    // Always overwrite with the latest value. Also write back to
                    // already-yielded messages since message_delta arrives after
                    // content_block_stop.
                    if (process.env.USER_TYPE === 'ant' &&
                        'research' in part) {
                        research = part.research;
                        for (_f = 0, newMessages_1 = newMessages; _f < newMessages_1.length; _f++) {
                            msg = newMessages_1[_f];
                            msg.research = research;
                        }
                    }
                    // Write final usage and stop_reason back to the last yielded
                    // message. Messages are created at content_block_stop from
                    // partialMessage, which was set at message_start before any tokens
                    // were generated (output_tokens: 0, stop_reason: null).
                    // message_delta arrives after content_block_stop with the real
                    // values.
                    //
                    // IMPORTANT: Use direct property mutation, not object replacement.
                    // The transcript write queue holds a reference to message.message
                    // and serializes it lazily (100ms flush interval). Object
                    // replacement ({ ...lastMsg.message, usage }) would disconnect
                    // the queued reference; direct mutation ensures the transcript
                    // captures the final values.
                    stopReason = part.delta.stop_reason;
                    lastMsg = newMessages.at(-1);
                    if (lastMsg) {
                        lastMsg.message.usage = usage;
                        lastMsg.message.stop_reason = stopReason;
                    }
                    costUSDForPart = (0, modelCost_js_1.calculateUSDCost)(resolvedModel, usage);
                    costUSD += (0, cost_tracker_js_1.addToTotalSessionCost)(costUSDForPart, usage, options.model);
                    refusalMessage = (0, errors_js_2.getErrorMessageIfRefusal)(part.delta.stop_reason, options.model);
                    if (!refusalMessage) return [3 /*break*/, 35];
                    return [4 /*yield*/, __await(refusalMessage)];
                case 33: return [4 /*yield*/, _y.sent()];
                case 34:
                    _y.sent();
                    _y.label = 35;
                case 35:
                    if (!(stopReason === 'max_tokens')) return [3 /*break*/, 38];
                    (0, index_js_1.logEvent)('tengu_max_tokens_reached', {
                        max_tokens: maxOutputTokens,
                    });
                    return [4 /*yield*/, __await((0, messages_js_1.createAssistantAPIErrorMessage)({
                            content: "".concat(errors_js_2.API_ERROR_MESSAGE_PREFIX, ": Claude's response exceeded the ").concat(maxOutputTokens, " output token maximum. To configure this behavior, set the CLAUDE_CODE_MAX_OUTPUT_TOKENS environment variable."),
                            apiError: 'max_output_tokens',
                            error: 'max_output_tokens',
                        }))];
                case 36: return [4 /*yield*/, _y.sent()];
                case 37:
                    _y.sent();
                    _y.label = 38;
                case 38:
                    if (!(stopReason === 'model_context_window_exceeded')) return [3 /*break*/, 41];
                    (0, index_js_1.logEvent)('tengu_context_window_exceeded', {
                        max_tokens: maxOutputTokens,
                        output_tokens: usage.output_tokens,
                    });
                    return [4 /*yield*/, __await((0, messages_js_1.createAssistantAPIErrorMessage)({
                            content: "".concat(errors_js_2.API_ERROR_MESSAGE_PREFIX, ": The model has reached its context window limit."),
                            apiError: 'max_output_tokens',
                            error: 'max_output_tokens',
                        }))];
                case 39: 
                // Reuse the max_output_tokens recovery path — from the model's
                // perspective, both mean "response was cut off, continue from
                // where you left off."
                return [4 /*yield*/, _y.sent()];
                case 40:
                    // Reuse the max_output_tokens recovery path — from the model's
                    // perspective, both mean "response was cut off, continue from
                    // where you left off."
                    _y.sent();
                    _y.label = 41;
                case 41: return [3 /*break*/, 43];
                case 42: return [3 /*break*/, 43];
                case 43: return [4 /*yield*/, __await(__assign({ type: 'stream_event', event: part }, (part.type === 'message_start' ? { ttftMs: ttftMs } : undefined)))];
                case 44: return [4 /*yield*/, _y.sent()];
                case 45:
                    _y.sent();
                    _y.label = 46;
                case 46:
                    _d = true;
                    return [3 /*break*/, 24];
                case 47: return [3 /*break*/, 54];
                case 48:
                    e_2_1 = _y.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 54];
                case 49:
                    _y.trys.push([49, , 52, 53]);
                    if (!(!_d && !_g && (_h = stream_1.return))) return [3 /*break*/, 51];
                    return [4 /*yield*/, __await(_h.call(stream_1))];
                case 50:
                    _y.sent();
                    _y.label = 51;
                case 51: return [3 /*break*/, 53];
                case 52:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 53: return [7 /*endfinally*/];
                case 54:
                    // Clear the idle timeout watchdog now that the stream loop has exited
                    clearStreamIdleTimers();
                    // If the stream was aborted by our idle timeout watchdog, fall back to
                    // non-streaming retry rather than treating it as a completed stream.
                    if (streamIdleAborted_1) {
                        exitDelayMs = streamWatchdogFiredAt_1 !== null
                            ? Math.round(performance.now() - streamWatchdogFiredAt_1)
                            : -1;
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_stream_loop_exited_after_watchdog_clean');
                        (0, index_js_1.logEvent)('tengu_stream_loop_exited_after_watchdog', {
                            request_id: (streamRequestId !== null && streamRequestId !== void 0 ? streamRequestId : 'unknown'),
                            exit_delay_ms: exitDelayMs,
                            exit_path: 'clean',
                            model: options.model,
                        });
                        // Prevent double-emit: this throw lands in the catch block below,
                        // whose exit_path='error' probe guards on streamWatchdogFiredAt.
                        streamWatchdogFiredAt_1 = null;
                        throw new Error('Stream idle timeout - no chunks received');
                    }
                    // Detect when the stream completed without producing any assistant messages.
                    // This covers two proxy failure modes:
                    // 1. No events at all (!partialMessage): proxy returned 200 with non-SSE body
                    // 2. Partial events (partialMessage set but no content blocks completed AND
                    //    no stop_reason received): proxy returned message_start but stream ended
                    //    before content_block_stop and before message_delta with stop_reason
                    // BetaMessageStream had the first check in _endRequest() but the raw Stream
                    // does not - without it the generator silently returns no assistant messages,
                    // causing "Execution error" in -p mode.
                    // Note: We must check stopReason to avoid false positives. For example, with
                    // structured output (--json-schema), the model calls a StructuredOutput tool
                    // on turn 1, then on turn 2 responds with end_turn and no content blocks.
                    // That's a legitimate empty response, not an incomplete stream.
                    if (!partialMessage || (newMessages.length === 0 && !stopReason)) {
                        (0, debug_js_1.logForDebugging)(!partialMessage
                            ? 'Stream completed without receiving message_start event - triggering non-streaming fallback'
                            : 'Stream completed with message_start but no content blocks completed - triggering non-streaming fallback', { level: 'error' });
                        (0, index_js_1.logEvent)('tengu_stream_no_events', {
                            model: options.model,
                            request_id: (streamRequestId !== null && streamRequestId !== void 0 ? streamRequestId : 'unknown'),
                        });
                        throw new Error('Stream ended without receiving any events');
                    }
                    // Log summary if any stalls occurred during streaming
                    if (stallCount > 0) {
                        (0, debug_js_1.logForDebugging)("Streaming completed with ".concat(stallCount, " stall(s), total stall time: ").concat((totalStallTime / 1000).toFixed(1), "s"), { level: 'warn' });
                        (0, index_js_1.logEvent)('tengu_streaming_stall_summary', {
                            stall_count: stallCount,
                            total_stall_time_ms: totalStallTime,
                            model: options.model,
                            request_id: (streamRequestId !== null && streamRequestId !== void 0 ? streamRequestId : 'unknown'),
                        });
                    }
                    // Check if the cache actually broke based on response tokens
                    if ((0, bun_bundle_1.feature)('PROMPT_CACHE_BREAK_DETECTION')) {
                        void (0, promptCacheBreakDetection_js_1.checkResponseForCacheBreak)(options.querySource, usage.cache_read_input_tokens, usage.cache_creation_input_tokens, messages, options.agentId, streamRequestId);
                    }
                    resp = streamResponse;
                    if (resp) {
                        (0, claudeAiLimits_js_1.extractQuotaStatusFromHeaders)(resp.headers);
                        // Store headers for gateway detection
                        responseHeaders = resp.headers;
                    }
                    return [3 /*break*/, 61];
                case 55:
                    streamingError_1 = _y.sent();
                    // Clear the idle timeout watchdog on error path too
                    clearStreamIdleTimers();
                    // Instrumentation: if the watchdog had already fired and the for-await
                    // threw (rather than exiting cleanly), record that the loop DID exit and
                    // how long after the watchdog. Distinguishes true hangs from error exits.
                    if (streamIdleAborted_1 && streamWatchdogFiredAt_1 !== null) {
                        exitDelayMs = Math.round(performance.now() - streamWatchdogFiredAt_1);
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_stream_loop_exited_after_watchdog_error');
                        (0, index_js_1.logEvent)('tengu_stream_loop_exited_after_watchdog', {
                            request_id: (streamRequestId !== null && streamRequestId !== void 0 ? streamRequestId : 'unknown'),
                            exit_delay_ms: exitDelayMs,
                            exit_path: 'error',
                            error_name: streamingError_1 instanceof Error
                                ? streamingError_1.name
                                : 'unknown',
                            model: options.model,
                        });
                    }
                    if (streamingError_1 instanceof error_1.APIUserAbortError) {
                        // Check if the abort signal was triggered by the user (ESC key)
                        // If the signal is aborted, it's a user-initiated abort
                        // If not, it's likely a timeout from the SDK
                        if (signal.aborted) {
                            // This is a real user abort (ESC key was pressed)
                            (0, debug_js_1.logForDebugging)("Streaming aborted by user: ".concat((0, errors_js_1.errorMessage)(streamingError_1)));
                            if (isAdvisorInProgress) {
                                (0, index_js_1.logEvent)('tengu_advisor_tool_interrupted', {
                                    model: options.model,
                                    advisor_model: (advisorModel !== null && advisorModel !== void 0 ? advisorModel : 'unknown'),
                                });
                            }
                            throw streamingError_1;
                        }
                        else {
                            // The SDK threw APIUserAbortError but our signal wasn't aborted
                            // This means it's a timeout from the SDK's internal timeout
                            (0, debug_js_1.logForDebugging)("Streaming timeout (SDK abort): ".concat(streamingError_1.message), { level: 'error' });
                            // Throw a more specific error for timeout
                            throw new error_1.APIConnectionTimeoutError({ message: 'Request timed out' });
                        }
                    }
                    disableFallback = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_NONSTREAMING_FALLBACK) ||
                        (0, growthbook_js_2.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_disable_streaming_to_non_streaming_fallback', false);
                    if (disableFallback) {
                        (0, debug_js_1.logForDebugging)("Error streaming (non-streaming fallback disabled): ".concat((0, errors_js_1.errorMessage)(streamingError_1)), { level: 'error' });
                        (0, index_js_1.logEvent)('tengu_streaming_fallback_to_non_streaming', {
                            model: options.model,
                            error: streamingError_1 instanceof Error
                                ? streamingError_1.name
                                : String(streamingError_1),
                            attemptNumber: attemptNumber,
                            maxOutputTokens: maxOutputTokens,
                            thinkingType: thinkingConfig.type,
                            fallback_disabled: true,
                            request_id: (streamRequestId !== null && streamRequestId !== void 0 ? streamRequestId : 'unknown'),
                            fallback_cause: (streamIdleAborted_1
                                ? 'watchdog'
                                : 'other'),
                        });
                        throw streamingError_1;
                    }
                    (0, debug_js_1.logForDebugging)("Error streaming, falling back to non-streaming mode: ".concat((0, errors_js_1.errorMessage)(streamingError_1)), { level: 'error' });
                    didFallBackToNonStreaming = true;
                    if (options.onStreamingFallback) {
                        options.onStreamingFallback();
                    }
                    (0, index_js_1.logEvent)('tengu_streaming_fallback_to_non_streaming', {
                        model: options.model,
                        error: streamingError_1 instanceof Error
                            ? streamingError_1.name
                            : String(streamingError_1),
                        attemptNumber: attemptNumber,
                        maxOutputTokens: maxOutputTokens,
                        thinkingType: thinkingConfig.type,
                        fallback_disabled: false,
                        request_id: (streamRequestId !== null && streamRequestId !== void 0 ? streamRequestId : 'unknown'),
                        fallback_cause: (streamIdleAborted_1
                            ? 'watchdog'
                            : 'other'),
                    });
                    // Fall back to non-streaming mode with retries.
                    // If the streaming failure was itself a 529, count it toward the
                    // consecutive-529 budget so total 529s-before-model-fallback is the
                    // same whether the overload was hit in streaming or non-streaming mode.
                    // This is a speculative fix for https://github.com/anthropics/claude-code/issues/1513
                    // Instrumentation: proves executeNonStreamingRequest was entered (vs. the
                    // fallback event firing but the call itself hanging at dispatch).
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_nonstreaming_fallback_started');
                    (0, index_js_1.logEvent)('tengu_nonstreaming_fallback_started', {
                        request_id: (streamRequestId !== null && streamRequestId !== void 0 ? streamRequestId : 'unknown'),
                        model: options.model,
                        fallback_cause: (streamIdleAborted_1
                            ? 'watchdog'
                            : 'other'),
                    });
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeNonStreamingRequest({ model: options.model, source: options.querySource }, __assign(__assign({ model: options.model, fallbackModel: options.fallbackModel, thinkingConfig: thinkingConfig }, ((0, fastMode_js_1.isFastModeEnabled)() && { fastMode: isFastMode })), { signal: signal, initialConsecutive529Errors: (0, withRetry_js_1.is529Error)(streamingError_1) ? 1 : 0, querySource: options.querySource }), paramsFromContext, function (attempt, _startTime, tokens) {
                            attemptNumber = attempt;
                            maxOutputTokens = tokens;
                        }, function (params) { return (0, log_js_1.captureAPIRequest)(params, options.querySource); }, streamRequestId))))];
                case 56: return [4 /*yield*/, __await.apply(void 0, [_y.sent()])];
                case 57:
                    result = _y.sent();
                    m = __assign(__assign({ message: __assign(__assign({}, result), { content: (0, messages_js_1.normalizeContentFromAPI)(result.content, tools, options.agentId) }), requestId: streamRequestId !== null && streamRequestId !== void 0 ? streamRequestId : undefined, type: 'assistant', uuid: (0, crypto_1.randomUUID)(), timestamp: new Date().toISOString() }, (process.env.USER_TYPE === 'ant' &&
                        research !== undefined && {
                        research: research,
                    })), (advisorModel && {
                        advisorModel: advisorModel,
                    }));
                    newMessages.push(m);
                    fallbackMessage = m;
                    return [4 /*yield*/, __await(m)];
                case 58: return [4 /*yield*/, _y.sent()];
                case 59:
                    _y.sent();
                    return [3 /*break*/, 61];
                case 60:
                    clearStreamIdleTimers();
                    return [7 /*endfinally*/];
                case 61: return [3 /*break*/, 83];
                case 62:
                    errorFromRetry_2 = _y.sent();
                    // FallbackTriggeredError must propagate to query.ts, which performs the
                    // actual model switch. Swallowing it here would turn the fallback into a
                    // no-op — the user would just see "Model fallback triggered: X -> Y" as
                    // an error message with no actual retry on the fallback model.
                    if (errorFromRetry_2 instanceof withRetry_js_1.FallbackTriggeredError) {
                        throw errorFromRetry_2;
                    }
                    is404StreamCreationError = !didFallBackToNonStreaming &&
                        errorFromRetry_2 instanceof withRetry_js_1.CannotRetryError &&
                        errorFromRetry_2.originalError instanceof error_1.APIError &&
                        errorFromRetry_2.originalError.status === 404;
                    if (!is404StreamCreationError) return [3 /*break*/, 75];
                    failedRequestId = (_v = errorFromRetry_2.originalError.requestID) !== null && _v !== void 0 ? _v : 'unknown';
                    (0, debug_js_1.logForDebugging)('Streaming endpoint returned 404, falling back to non-streaming mode', { level: 'warn' });
                    didFallBackToNonStreaming = true;
                    if (options.onStreamingFallback) {
                        options.onStreamingFallback();
                    }
                    (0, index_js_1.logEvent)('tengu_streaming_fallback_to_non_streaming', {
                        model: options.model,
                        error: '404_stream_creation',
                        attemptNumber: attemptNumber,
                        maxOutputTokens: maxOutputTokens,
                        thinkingType: thinkingConfig.type,
                        request_id: failedRequestId,
                        fallback_cause: '404_stream_creation',
                    });
                    _y.label = 63;
                case 63:
                    _y.trys.push([63, 68, , 74]);
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeNonStreamingRequest({ model: options.model, source: options.querySource }, __assign(__assign({ model: options.model, fallbackModel: options.fallbackModel, thinkingConfig: thinkingConfig }, ((0, fastMode_js_1.isFastModeEnabled)() && { fastMode: isFastMode })), { signal: signal }), paramsFromContext, function (attempt, _startTime, tokens) {
                            attemptNumber = attempt;
                            maxOutputTokens = tokens;
                        }, function (params) { return (0, log_js_1.captureAPIRequest)(params, options.querySource); }, failedRequestId))))];
                case 64: return [4 /*yield*/, __await.apply(void 0, [_y.sent()])];
                case 65:
                    result = _y.sent();
                    m = __assign(__assign({ message: __assign(__assign({}, result), { content: (0, messages_js_1.normalizeContentFromAPI)(result.content, tools, options.agentId) }), requestId: streamRequestId !== null && streamRequestId !== void 0 ? streamRequestId : undefined, type: 'assistant', uuid: (0, crypto_1.randomUUID)(), timestamp: new Date().toISOString() }, (process.env.USER_TYPE === 'ant' &&
                        research !== undefined && { research: research })), (advisorModel && { advisorModel: advisorModel }));
                    newMessages.push(m);
                    fallbackMessage = m;
                    return [4 /*yield*/, __await(m
                        // Continue to success logging below
                        )];
                case 66: return [4 /*yield*/, _y.sent()];
                case 67:
                    _y.sent();
                    return [3 /*break*/, 74];
                case 68:
                    fallbackError_1 = _y.sent();
                    // Propagate model-fallback signal to query.ts (see comment above).
                    if (fallbackError_1 instanceof withRetry_js_1.FallbackTriggeredError) {
                        throw fallbackError_1;
                    }
                    // Fallback also failed, handle as normal error
                    (0, debug_js_1.logForDebugging)("Non-streaming fallback also failed: ".concat((0, errors_js_1.errorMessage)(fallbackError_1)), { level: 'error' });
                    error = fallbackError_1;
                    errorModel = options.model;
                    if (fallbackError_1 instanceof withRetry_js_1.CannotRetryError) {
                        error = fallbackError_1.originalError;
                        errorModel = fallbackError_1.retryContext.model;
                    }
                    if (error instanceof error_1.APIError) {
                        (0, claudeAiLimits_js_1.extractQuotaStatusFromError)(error);
                    }
                    requestId = streamRequestId ||
                        (error instanceof error_1.APIError ? error.requestID : undefined) ||
                        (error instanceof error_1.APIError
                            ? (_w = error.error) === null || _w === void 0 ? void 0 : _w.request_id
                            : undefined);
                    (0, logging_js_1.logAPIError)({
                        error: error,
                        model: errorModel,
                        messageCount: messagesForAPI.length,
                        messageTokens: (0, tokens_js_1.tokenCountFromLastAPIResponse)(messagesForAPI),
                        durationMs: Date.now() - start,
                        durationMsIncludingRetries: Date.now() - startIncludingRetries,
                        attempt: attemptNumber,
                        requestId: requestId,
                        clientRequestId: clientRequestId,
                        didFallBackToNonStreaming: didFallBackToNonStreaming,
                        queryTracking: options.queryTracking,
                        querySource: options.querySource,
                        llmSpan: llmSpan,
                        fastMode: isFastModeRequest,
                        previousRequestId: previousRequestId,
                    });
                    if (!(error instanceof error_1.APIUserAbortError)) return [3 /*break*/, 70];
                    releaseStreamResources();
                    return [4 /*yield*/, __await(void 0)];
                case 69: return [2 /*return*/, _y.sent()];
                case 70: return [4 /*yield*/, __await((0, errors_js_2.getAssistantMessageFromError)(error, errorModel, {
                        messages: messages,
                        messagesForAPI: messagesForAPI,
                    }))];
                case 71: return [4 /*yield*/, _y.sent()];
                case 72:
                    _y.sent();
                    releaseStreamResources();
                    return [4 /*yield*/, __await(void 0)];
                case 73: return [2 /*return*/, _y.sent()];
                case 74: return [3 /*break*/, 81];
                case 75:
                    // Original error handling for non-404 errors
                    (0, debug_js_1.logForDebugging)("Error in API request: ".concat((0, errors_js_1.errorMessage)(errorFromRetry_2)), {
                        level: 'error',
                    });
                    error = errorFromRetry_2;
                    errorModel = options.model;
                    if (errorFromRetry_2 instanceof withRetry_js_1.CannotRetryError) {
                        error = errorFromRetry_2.originalError;
                        errorModel = errorFromRetry_2.retryContext.model;
                    }
                    // Extract quota status from error headers if it's a rate limit error
                    if (error instanceof error_1.APIError) {
                        (0, claudeAiLimits_js_1.extractQuotaStatusFromError)(error);
                    }
                    requestId = streamRequestId ||
                        (error instanceof error_1.APIError ? error.requestID : undefined) ||
                        (error instanceof error_1.APIError
                            ? (_x = error.error) === null || _x === void 0 ? void 0 : _x.request_id
                            : undefined);
                    (0, logging_js_1.logAPIError)({
                        error: error,
                        model: errorModel,
                        messageCount: messagesForAPI.length,
                        messageTokens: (0, tokens_js_1.tokenCountFromLastAPIResponse)(messagesForAPI),
                        durationMs: Date.now() - start,
                        durationMsIncludingRetries: Date.now() - startIncludingRetries,
                        attempt: attemptNumber,
                        requestId: requestId,
                        clientRequestId: clientRequestId,
                        didFallBackToNonStreaming: didFallBackToNonStreaming,
                        queryTracking: options.queryTracking,
                        querySource: options.querySource,
                        llmSpan: llmSpan,
                        fastMode: isFastModeRequest,
                        previousRequestId: previousRequestId,
                    });
                    if (!(error instanceof error_1.APIUserAbortError)) return [3 /*break*/, 77];
                    releaseStreamResources();
                    return [4 /*yield*/, __await(void 0)];
                case 76: return [2 /*return*/, _y.sent()];
                case 77: return [4 /*yield*/, __await((0, errors_js_2.getAssistantMessageFromError)(error, errorModel, {
                        messages: messages,
                        messagesForAPI: messagesForAPI,
                    }))];
                case 78: return [4 /*yield*/, _y.sent()];
                case 79:
                    _y.sent();
                    releaseStreamResources();
                    return [4 /*yield*/, __await(void 0)];
                case 80: return [2 /*return*/, _y.sent()];
                case 81: return [3 /*break*/, 83];
                case 82:
                    (0, sessionActivity_js_1.stopSessionActivity)('api_call');
                    // Must be in the finally block: if the generator is terminated early
                    // via .return() (e.g. consumer breaks out of for-await-of, or query.ts
                    // encounters an abort), code after the try/finally never executes.
                    // Without this, the Response object's native TLS/socket buffers leak
                    // until the generator itself is GC'd (see GH #32920).
                    releaseStreamResources();
                    // Non-streaming fallback cost: the streaming path tracks cost in the
                    // message_delta handler before any yield. Fallback pushes to newMessages
                    // then yields, so tracking must be here to survive .return() at the yield.
                    if (fallbackMessage) {
                        fallbackUsage = fallbackMessage.message.usage;
                        usage = updateUsage(logging_js_1.EMPTY_USAGE, fallbackUsage);
                        stopReason = fallbackMessage.message.stop_reason;
                        fallbackCost = (0, modelCost_js_1.calculateUSDCost)(resolvedModel, fallbackUsage);
                        costUSD += (0, cost_tracker_js_1.addToTotalSessionCost)(fallbackCost, fallbackUsage, options.model);
                    }
                    return [7 /*endfinally*/];
                case 83:
                    // Mark all registered tools as sent to API so they become eligible for deletion
                    if ((0, bun_bundle_1.feature)('CACHED_MICROCOMPACT') && cachedMCEnabled) {
                        (0, microCompact_js_1.markToolsSentToAPIState)();
                    }
                    // Track the last requestId for the main conversation chain so shutdown
                    // can send a cache eviction hint to inference. Exclude backgrounded
                    // sessions (Ctrl+B) which share the repl_main_thread querySource but
                    // run inside an agent context — they are independent conversation chains
                    // whose cache should not be evicted when the foreground session clears.
                    if (streamRequestId &&
                        !(0, agentContext_js_1.getAgentContext)() &&
                        (options.querySource.startsWith('repl_main_thread') ||
                            options.querySource === 'sdk')) {
                        (0, state_js_1.setLastMainRequestId)(streamRequestId);
                    }
                    logMessageCount = messagesForAPI.length;
                    logMessageTokens = (0, tokens_js_1.tokenCountFromLastAPIResponse)(messagesForAPI);
                    void options.getToolPermissionContext().then(function (permissionContext) {
                        var _a, _b, _c;
                        (0, logging_js_1.logAPISuccessAndDuration)({
                            model: (_c = (_b = (_a = newMessages[0]) === null || _a === void 0 ? void 0 : _a.message.model) !== null && _b !== void 0 ? _b : partialMessage === null || partialMessage === void 0 ? void 0 : partialMessage.model) !== null && _c !== void 0 ? _c : options.model,
                            preNormalizedModel: options.model,
                            usage: usage,
                            start: start,
                            startIncludingRetries: startIncludingRetries,
                            attempt: attemptNumber,
                            messageCount: logMessageCount,
                            messageTokens: logMessageTokens,
                            requestId: streamRequestId !== null && streamRequestId !== void 0 ? streamRequestId : null,
                            stopReason: stopReason,
                            ttftMs: ttftMs,
                            didFallBackToNonStreaming: didFallBackToNonStreaming,
                            querySource: options.querySource,
                            headers: responseHeaders,
                            costUSD: costUSD,
                            queryTracking: options.queryTracking,
                            permissionMode: permissionContext.mode,
                            // Pass newMessages for beta tracing - extraction happens in logging.ts
                            // only when beta tracing is enabled
                            newMessages: newMessages,
                            llmSpan: llmSpan,
                            globalCacheStrategy: globalCacheStrategy,
                            requestSetupMs: start - startIncludingRetries,
                            attemptStartTimes: attemptStartTimes,
                            fastMode: isFastModeRequest,
                            previousRequestId: previousRequestId,
                            betas: lastRequestBetas,
                        });
                    });
                    // Defensive: also release on normal completion (no-op if finally already ran).
                    releaseStreamResources();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Cleans up stream resources to prevent memory leaks.
 * @internal Exported for testing
 */
function cleanupStream(stream) {
    if (!stream) {
        return;
    }
    try {
        // Abort the stream via its controller if not already aborted
        if (!stream.controller.signal.aborted) {
            stream.controller.abort();
        }
    }
    catch (_a) {
        // Ignore - stream may already be closed
    }
}
/**
 * Updates usage statistics with new values from streaming API events.
 * Note: Anthropic's streaming API provides cumulative usage totals, not incremental deltas.
 * Each event contains the complete usage up to that point in the stream.
 *
 * Input-related tokens (input_tokens, cache_creation_input_tokens, cache_read_input_tokens)
 * are typically set in message_start and remain constant. message_delta events may send
 * explicit 0 values for these fields, which should not overwrite the values from message_start.
 * We only update these fields if they have a non-null, non-zero value.
 */
function updateUsage(usage, partUsage) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    if (!partUsage) {
        return __assign({}, usage);
    }
    return __assign(__assign({ input_tokens: partUsage.input_tokens !== null && partUsage.input_tokens > 0
            ? partUsage.input_tokens
            : usage.input_tokens, cache_creation_input_tokens: partUsage.cache_creation_input_tokens !== null &&
            partUsage.cache_creation_input_tokens > 0
            ? partUsage.cache_creation_input_tokens
            : usage.cache_creation_input_tokens, cache_read_input_tokens: partUsage.cache_read_input_tokens !== null &&
            partUsage.cache_read_input_tokens > 0
            ? partUsage.cache_read_input_tokens
            : usage.cache_read_input_tokens, output_tokens: (_a = partUsage.output_tokens) !== null && _a !== void 0 ? _a : usage.output_tokens, server_tool_use: {
            web_search_requests: (_c = (_b = partUsage.server_tool_use) === null || _b === void 0 ? void 0 : _b.web_search_requests) !== null && _c !== void 0 ? _c : usage.server_tool_use.web_search_requests,
            web_fetch_requests: (_e = (_d = partUsage.server_tool_use) === null || _d === void 0 ? void 0 : _d.web_fetch_requests) !== null && _e !== void 0 ? _e : usage.server_tool_use.web_fetch_requests,
        }, service_tier: usage.service_tier, cache_creation: {
            // SDK type BetaMessageDeltaUsage is missing cache_creation, but it's real!
            ephemeral_1h_input_tokens: (_g = (_f = partUsage.cache_creation) === null || _f === void 0 ? void 0 : _f.ephemeral_1h_input_tokens) !== null && _g !== void 0 ? _g : usage.cache_creation.ephemeral_1h_input_tokens,
            ephemeral_5m_input_tokens: (_j = (_h = partUsage.cache_creation) === null || _h === void 0 ? void 0 : _h.ephemeral_5m_input_tokens) !== null && _j !== void 0 ? _j : usage.cache_creation.ephemeral_5m_input_tokens,
        } }, ((0, bun_bundle_1.feature)('CACHED_MICROCOMPACT')
        ? {
            cache_deleted_input_tokens: partUsage
                .cache_deleted_input_tokens != null &&
                partUsage
                    .cache_deleted_input_tokens > 0
                ? partUsage
                    .cache_deleted_input_tokens
                : ((_k = usage
                    .cache_deleted_input_tokens) !== null && _k !== void 0 ? _k : 0),
        }
        : {})), { inference_geo: usage.inference_geo, iterations: (_l = partUsage.iterations) !== null && _l !== void 0 ? _l : usage.iterations, speed: (_m = partUsage.speed) !== null && _m !== void 0 ? _m : usage.speed });
}
/**
 * Accumulates usage from one message into a total usage object.
 * Used to track cumulative usage across multiple assistant turns.
 */
function accumulateUsage(totalUsage, messageUsage) {
    var _a, _b;
    return __assign(__assign({ input_tokens: totalUsage.input_tokens + messageUsage.input_tokens, cache_creation_input_tokens: totalUsage.cache_creation_input_tokens +
            messageUsage.cache_creation_input_tokens, cache_read_input_tokens: totalUsage.cache_read_input_tokens + messageUsage.cache_read_input_tokens, output_tokens: totalUsage.output_tokens + messageUsage.output_tokens, server_tool_use: {
            web_search_requests: totalUsage.server_tool_use.web_search_requests +
                messageUsage.server_tool_use.web_search_requests,
            web_fetch_requests: totalUsage.server_tool_use.web_fetch_requests +
                messageUsage.server_tool_use.web_fetch_requests,
        }, service_tier: messageUsage.service_tier, cache_creation: {
            ephemeral_1h_input_tokens: totalUsage.cache_creation.ephemeral_1h_input_tokens +
                messageUsage.cache_creation.ephemeral_1h_input_tokens,
            ephemeral_5m_input_tokens: totalUsage.cache_creation.ephemeral_5m_input_tokens +
                messageUsage.cache_creation.ephemeral_5m_input_tokens,
        } }, ((0, bun_bundle_1.feature)('CACHED_MICROCOMPACT')
        ? {
            cache_deleted_input_tokens: ((_a = totalUsage
                .cache_deleted_input_tokens) !== null && _a !== void 0 ? _a : 0) +
                ((_b = messageUsage.cache_deleted_input_tokens) !== null && _b !== void 0 ? _b : 0),
        }
        : {})), { inference_geo: messageUsage.inference_geo, iterations: messageUsage.iterations, speed: messageUsage.speed });
}
function isToolResultBlock(block) {
    return (block !== null &&
        typeof block === 'object' &&
        'type' in block &&
        block.type === 'tool_result' &&
        'tool_use_id' in block);
}
// Exported for testing cache_reference placement constraints
function addCacheBreakpoints(messages, enablePromptCaching, querySource, useCachedMC, newCacheEdits, pinnedEdits, skipCacheWrite) {
    if (useCachedMC === void 0) { useCachedMC = false; }
    if (skipCacheWrite === void 0) { skipCacheWrite = false; }
    (0, index_js_1.logEvent)('tengu_api_cache_breakpoints', {
        totalMessageCount: messages.length,
        cachingEnabled: enablePromptCaching,
        skipCacheWrite: skipCacheWrite,
    });
    // Exactly one message-level cache_control marker per request. Mycro's
    // turn-to-turn eviction (page_manager/index.rs: Index::insert) frees
    // local-attention KV pages at any cached prefix position NOT in
    // cache_store_int_token_boundaries. With two markers the second-to-last
    // position is protected and its locals survive an extra turn even though
    // nothing will ever resume from there — with one marker they're freed
    // immediately. For fire-and-forget forks (skipCacheWrite) we shift the
    // marker to the second-to-last message: that's the last shared-prefix
    // point, so the write is a no-op merge on mycro (entry already exists)
    // and the fork doesn't leave its own tail in the KVCC. Dense pages are
    // refcounted and survive via the new hash either way.
    var markerIndex = skipCacheWrite ? messages.length - 2 : messages.length - 1;
    var result = messages.map(function (msg, index) {
        var addCache = index === markerIndex;
        if (msg.type === 'user') {
            return userMessageToMessageParam(msg, addCache, enablePromptCaching, querySource);
        }
        return assistantMessageToMessageParam(msg, addCache, enablePromptCaching, querySource);
    });
    if (!useCachedMC) {
        return result;
    }
    // Track all cache_references being deleted to prevent duplicates across blocks.
    var seenDeleteRefs = new Set();
    // Helper to deduplicate a cache_edits block against already-seen deletions
    var deduplicateEdits = function (block) {
        var uniqueEdits = block.edits.filter(function (edit) {
            if (seenDeleteRefs.has(edit.cache_reference)) {
                return false;
            }
            seenDeleteRefs.add(edit.cache_reference);
            return true;
        });
        return __assign(__assign({}, block), { edits: uniqueEdits });
    };
    // Re-insert all previously-pinned cache_edits at their original positions
    for (var _i = 0, _a = pinnedEdits !== null && pinnedEdits !== void 0 ? pinnedEdits : []; _i < _a.length; _i++) {
        var pinned = _a[_i];
        var msg = result[pinned.userMessageIndex];
        if (msg && msg.role === 'user') {
            if (!Array.isArray(msg.content)) {
                msg.content = [{ type: 'text', text: msg.content }];
            }
            var dedupedBlock = deduplicateEdits(pinned.block);
            if (dedupedBlock.edits.length > 0) {
                (0, contentArray_js_1.insertBlockAfterToolResults)(msg.content, dedupedBlock);
            }
        }
    }
    // Insert new cache_edits into the last user message and pin them
    if (newCacheEdits && result.length > 0) {
        var dedupedNewEdits = deduplicateEdits(newCacheEdits);
        if (dedupedNewEdits.edits.length > 0) {
            for (var i = result.length - 1; i >= 0; i--) {
                var msg = result[i];
                if (msg && msg.role === 'user') {
                    if (!Array.isArray(msg.content)) {
                        msg.content = [{ type: 'text', text: msg.content }];
                    }
                    (0, contentArray_js_1.insertBlockAfterToolResults)(msg.content, dedupedNewEdits);
                    // Pin so this block is re-sent at the same position in future calls
                    (0, microCompact_js_1.pinCacheEdits)(i, newCacheEdits);
                    (0, debug_js_1.logForDebugging)("Added cache_edits block with ".concat(dedupedNewEdits.edits.length, " deletion(s) to message[").concat(i, "]: ").concat(dedupedNewEdits.edits.map(function (e) { return e.cache_reference; }).join(', ')));
                    break;
                }
            }
        }
    }
    // Add cache_reference to tool_result blocks that are within the cached prefix.
    // Must be done AFTER cache_edits insertion since that modifies content arrays.
    if (enablePromptCaching) {
        // Find the last message containing a cache_control marker
        var lastCCMsg = -1;
        for (var i = 0; i < result.length; i++) {
            var msg = result[i];
            if (Array.isArray(msg.content)) {
                for (var _b = 0, _c = msg.content; _b < _c.length; _b++) {
                    var block = _c[_b];
                    if (block && typeof block === 'object' && 'cache_control' in block) {
                        lastCCMsg = i;
                    }
                }
            }
        }
        // Add cache_reference to tool_result blocks that are strictly before
        // the last cache_control marker. The API requires cache_reference to
        // appear "before or on" the last cache_control — we use strict "before"
        // to avoid edge cases where cache_edits splicing shifts block indices.
        //
        // Create new objects instead of mutating in-place to avoid contaminating
        // blocks reused by secondary queries that use models without cache_editing support.
        if (lastCCMsg >= 0) {
            for (var i = 0; i < lastCCMsg; i++) {
                var msg = result[i];
                if (msg.role !== 'user' || !Array.isArray(msg.content)) {
                    continue;
                }
                var cloned = false;
                for (var j = 0; j < msg.content.length; j++) {
                    var block = msg.content[j];
                    if (block && isToolResultBlock(block)) {
                        if (!cloned) {
                            msg.content = __spreadArray([], msg.content, true);
                            cloned = true;
                        }
                        msg.content[j] = Object.assign({}, block, {
                            cache_reference: block.tool_use_id,
                        });
                    }
                }
            }
        }
    }
    return result;
}
function buildSystemPromptBlocks(systemPrompt, enablePromptCaching, options) {
    // IMPORTANT: Do not add any more blocks for caching or you will get a 400
    return (0, api_js_1.splitSysPromptPrefix)(systemPrompt, {
        skipGlobalCacheForSystemPrompt: options === null || options === void 0 ? void 0 : options.skipGlobalCacheForSystemPrompt,
    }).map(function (block) {
        return __assign({ type: 'text', text: block.text }, (enablePromptCaching &&
            block.cacheScope !== null && {
            cache_control: getCacheControl({
                scope: block.cacheScope,
                querySource: options === null || options === void 0 ? void 0 : options.querySource,
            }),
        }));
    });
}
function queryHaiku(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var result;
        var _this = this;
        var _c = _b.systemPrompt, systemPrompt = _c === void 0 ? (0, systemPromptType_js_1.asSystemPrompt)([]) : _c, userPrompt = _b.userPrompt, outputFormat = _b.outputFormat, signal = _b.signal, options = _b.options;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, vcr_js_1.withVCR)([
                        (0, messages_js_1.createUserMessage)({
                            content: systemPrompt.map(function (text) { return ({ type: 'text', text: text }); }),
                        }),
                        (0, messages_js_1.createUserMessage)({
                            content: userPrompt,
                        }),
                    ], function () { return __awaiter(_this, void 0, void 0, function () {
                        var messages, result;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    messages = [
                                        (0, messages_js_1.createUserMessage)({
                                            content: userPrompt,
                                        }),
                                    ];
                                    return [4 /*yield*/, queryModelWithoutStreaming({
                                            messages: messages,
                                            systemPrompt: systemPrompt,
                                            thinkingConfig: { type: 'disabled' },
                                            tools: [],
                                            signal: signal,
                                            options: __assign(__assign({}, options), { model: (0, model_js_1.getSmallFastModel)(), enablePromptCaching: (_a = options.enablePromptCaching) !== null && _a !== void 0 ? _a : false, outputFormat: outputFormat, getToolPermissionContext: function () {
                                                    return __awaiter(this, void 0, void 0, function () {
                                                        return __generator(this, function (_a) {
                                                            return [2 /*return*/, (0, Tool_js_1.getEmptyToolPermissionContext)()];
                                                        });
                                                    });
                                                } }),
                                        })];
                                case 1:
                                    result = _b.sent();
                                    return [2 /*return*/, [result]];
                            }
                        });
                    }); })
                    // We don't use streaming for Haiku so this is safe
                ];
                case 1:
                    result = _d.sent();
                    // We don't use streaming for Haiku so this is safe
                    return [2 /*return*/, result[0]];
            }
        });
    });
}
/**
 * Query a specific model through the Claude Code infrastructure.
 * This goes through the full query pipeline including proper authentication,
 * betas, and headers - unlike direct API calls.
 */
function queryWithModel(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var result;
        var _this = this;
        var _c = _b.systemPrompt, systemPrompt = _c === void 0 ? (0, systemPromptType_js_1.asSystemPrompt)([]) : _c, userPrompt = _b.userPrompt, outputFormat = _b.outputFormat, signal = _b.signal, options = _b.options;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, vcr_js_1.withVCR)([
                        (0, messages_js_1.createUserMessage)({
                            content: systemPrompt.map(function (text) { return ({ type: 'text', text: text }); }),
                        }),
                        (0, messages_js_1.createUserMessage)({
                            content: userPrompt,
                        }),
                    ], function () { return __awaiter(_this, void 0, void 0, function () {
                        var messages, result;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    messages = [
                                        (0, messages_js_1.createUserMessage)({
                                            content: userPrompt,
                                        }),
                                    ];
                                    return [4 /*yield*/, queryModelWithoutStreaming({
                                            messages: messages,
                                            systemPrompt: systemPrompt,
                                            thinkingConfig: { type: 'disabled' },
                                            tools: [],
                                            signal: signal,
                                            options: __assign(__assign({}, options), { enablePromptCaching: (_a = options.enablePromptCaching) !== null && _a !== void 0 ? _a : false, outputFormat: outputFormat, getToolPermissionContext: function () {
                                                    return __awaiter(this, void 0, void 0, function () {
                                                        return __generator(this, function (_a) {
                                                            return [2 /*return*/, (0, Tool_js_1.getEmptyToolPermissionContext)()];
                                                        });
                                                    });
                                                } }),
                                        })];
                                case 1:
                                    result = _b.sent();
                                    return [2 /*return*/, [result]];
                            }
                        });
                    }); })];
                case 1:
                    result = _d.sent();
                    return [2 /*return*/, result[0]];
            }
        });
    });
}
// Non-streaming requests have a 10min max per the docs:
// https://platform.claude.com/docs/en/api/errors#long-requests
// The SDK's 21333-token cap is derived from 10min × 128k tokens/hour, but we
// bypass it by setting a client-level timeout, so we can cap higher.
exports.MAX_NON_STREAMING_TOKENS = 64000;
/**
 * Adjusts thinking budget when max_tokens is capped for non-streaming fallback.
 * Ensures the API constraint: max_tokens > thinking.budget_tokens
 *
 * @param params - The parameters that will be sent to the API
 * @param maxTokensCap - The maximum allowed tokens (MAX_NON_STREAMING_TOKENS)
 * @returns Adjusted parameters with thinking budget capped if needed
 */
function adjustParamsForNonStreaming(params, maxTokensCap) {
    var _a;
    var cappedMaxTokens = Math.min(params.max_tokens, maxTokensCap);
    // Adjust thinking budget if it would exceed capped max_tokens
    // to maintain the constraint: max_tokens > thinking.budget_tokens
    var adjustedParams = __assign({}, params);
    if (((_a = adjustedParams.thinking) === null || _a === void 0 ? void 0 : _a.type) === 'enabled' &&
        adjustedParams.thinking.budget_tokens) {
        adjustedParams.thinking = __assign(__assign({}, adjustedParams.thinking), { budget_tokens: Math.min(adjustedParams.thinking.budget_tokens, cappedMaxTokens - 1) });
    }
    return __assign(__assign({}, adjustedParams), { max_tokens: cappedMaxTokens });
}
function isMaxTokensCapEnabled() {
    // 3P default: false (not validated on Bedrock/Vertex)
    return (0, growthbook_js_2.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_otk_slot_v1', false);
}
function getMaxOutputTokensForModel(model) {
    var maxOutputTokens = (0, context_js_1.getModelMaxOutputTokens)(model);
    // Slot-reservation cap: drop default to 8k for all models. BQ p99 output
    // = 4,911 tokens; 32k/64k defaults over-reserve 8-16× slot capacity.
    // Requests hitting the cap get one clean retry at 64k (query.ts
    // max_output_tokens_escalate). Math.min keeps models with lower native
    // defaults (e.g. claude-3-opus at 4k) at their native value. Applied
    // before the env-var override so CLAUDE_CODE_MAX_OUTPUT_TOKENS still wins.
    var defaultTokens = isMaxTokensCapEnabled()
        ? Math.min(maxOutputTokens.default, context_js_1.CAPPED_DEFAULT_MAX_TOKENS)
        : maxOutputTokens.default;
    var result = (0, envValidation_js_1.validateBoundedIntEnvVar)('CLAUDE_CODE_MAX_OUTPUT_TOKENS', process.env.CLAUDE_CODE_MAX_OUTPUT_TOKENS, defaultTokens, maxOutputTokens.upperLimit);
    return result.effective;
}
