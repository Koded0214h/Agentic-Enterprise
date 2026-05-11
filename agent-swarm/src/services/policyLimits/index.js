"use strict";
/**
 * Policy Limits Service
 *
 * Fetches organization-level policy restrictions from the API and uses them
 * to disable CLI features. Follows the same patterns as remote managed settings
 * (fail open, ETag caching, background polling, retry logic).
 *
 * Eligibility:
 * - Console users (API key): All eligible
 * - OAuth users (Claude.ai): Only Team and Enterprise/C4E subscribers are eligible
 * - API fails open (non-blocking) - if fetch fails, continues without restrictions
 * - API returns empty restrictions for users without policy limits
 */
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
exports._resetPolicyLimitsForTesting = _resetPolicyLimitsForTesting;
exports.initializePolicyLimitsLoadingPromise = initializePolicyLimitsLoadingPromise;
exports.isPolicyLimitsEligible = isPolicyLimitsEligible;
exports.waitForPolicyLimitsToLoad = waitForPolicyLimitsToLoad;
exports.isPolicyAllowed = isPolicyAllowed;
exports.loadPolicyLimits = loadPolicyLimits;
exports.refreshPolicyLimits = refreshPolicyLimits;
exports.clearPolicyLimitsCache = clearPolicyLimitsCache;
exports.startBackgroundPolling = startBackgroundPolling;
exports.stopBackgroundPolling = stopBackgroundPolling;
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var oauth_js_1 = require("../../constants/oauth.js");
var auth_js_1 = require("../../utils/auth.js");
var cleanupRegistry_js_1 = require("../../utils/cleanupRegistry.js");
var debug_js_1 = require("../../utils/debug.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var json_js_1 = require("../../utils/json.js");
var providers_js_1 = require("../../utils/model/providers.js");
var privacyLevel_js_1 = require("../../utils/privacyLevel.js");
var sleep_js_1 = require("../../utils/sleep.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var userAgent_js_1 = require("../../utils/userAgent.js");
var withRetry_js_1 = require("../api/withRetry.js");
var types_js_1 = require("./types.js");
function isNodeError(e) {
    return e instanceof Error;
}
// Constants
var CACHE_FILENAME = 'policy-limits.json';
var FETCH_TIMEOUT_MS = 10000; // 10 seconds
var DEFAULT_MAX_RETRIES = 5;
var POLLING_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
// Background polling state
var pollingIntervalId = null;
var cleanupRegistered = false;
// Promise that resolves when initial policy limits loading completes
var loadingCompletePromise = null;
var loadingCompleteResolve = null;
// Timeout for the loading promise to prevent deadlocks
var LOADING_PROMISE_TIMEOUT_MS = 30000; // 30 seconds
// Session-level cache for policy restrictions
var sessionCache = null;
/**
 * Test-only sync reset. clearPolicyLimitsCache() does file I/O and is too
 * expensive for preload beforeEach; this only clears the module-level
 * singleton so downstream tests in the same shard see a clean slate.
 */
function _resetPolicyLimitsForTesting() {
    stopBackgroundPolling();
    sessionCache = null;
    loadingCompletePromise = null;
    loadingCompleteResolve = null;
}
/**
 * Initialize the loading promise for policy limits
 * This should be called early (e.g., in init.ts) to allow other systems
 * to await policy limits loading even if loadPolicyLimits() hasn't been called yet.
 *
 * Only creates the promise if the user is eligible for policy limits.
 * Includes a timeout to prevent deadlocks if loadPolicyLimits() is never called.
 */
function initializePolicyLimitsLoadingPromise() {
    if (loadingCompletePromise) {
        return;
    }
    if (isPolicyLimitsEligible()) {
        loadingCompletePromise = new Promise(function (resolve) {
            loadingCompleteResolve = resolve;
            setTimeout(function () {
                if (loadingCompleteResolve) {
                    (0, debug_js_1.logForDebugging)('Policy limits: Loading promise timed out, resolving anyway');
                    loadingCompleteResolve();
                    loadingCompleteResolve = null;
                }
            }, LOADING_PROMISE_TIMEOUT_MS);
        });
    }
}
/**
 * Get the path to the policy limits cache file
 */
function getCachePath() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), CACHE_FILENAME);
}
/**
 * Get the policy limits API endpoint
 */
function getPolicyLimitsEndpoint() {
    return "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/claude_code/policy_limits");
}
/**
 * Recursively sort all keys in an object for consistent hashing
 */
function sortKeysDeep(obj) {
    if (Array.isArray(obj)) {
        return obj.map(sortKeysDeep);
    }
    if (obj !== null && typeof obj === 'object') {
        var sorted = {};
        for (var _i = 0, _a = Object.entries(obj).sort(function (_a, _b) {
            var a = _a[0];
            var b = _b[0];
            return a.localeCompare(b);
        }); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            sorted[key] = sortKeysDeep(value);
        }
        return sorted;
    }
    return obj;
}
/**
 * Compute a checksum from restrictions content for HTTP caching
 */
function computeChecksum(restrictions) {
    var sorted = sortKeysDeep(restrictions);
    var normalized = (0, slowOperations_js_1.jsonStringify)(sorted);
    var hash = (0, crypto_1.createHash)('sha256').update(normalized).digest('hex');
    return "sha256:".concat(hash);
}
/**
 * Check if the current user is eligible for policy limits.
 *
 * IMPORTANT: This function must NOT call getSettings() or any function that calls
 * getSettings() to avoid circular dependencies during settings loading.
 */
function isPolicyLimitsEligible() {
    var _a;
    // 3p provider users should not hit the policy limits endpoint
    if ((0, providers_js_1.getAPIProvider)() !== 'firstParty') {
        return false;
    }
    // Custom base URL users should not hit the policy limits endpoint
    if (!(0, providers_js_1.isFirstPartyAnthropicBaseUrl)()) {
        return false;
    }
    // Console users (API key) are eligible if we can get the actual key
    try {
        var apiKey = (0, auth_js_1.getAnthropicApiKeyWithSource)({
            skipRetrievingKeyFromApiKeyHelper: true,
        }).key;
        if (apiKey) {
            return true;
        }
    }
    catch (_b) {
        // No API key available - continue to check OAuth
    }
    // For OAuth users, check if they have Claude.ai tokens
    var tokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
    if (!(tokens === null || tokens === void 0 ? void 0 : tokens.accessToken)) {
        return false;
    }
    // Must have Claude.ai inference scope
    if (!((_a = tokens.scopes) === null || _a === void 0 ? void 0 : _a.includes(oauth_js_1.CLAUDE_AI_INFERENCE_SCOPE))) {
        return false;
    }
    // Only Team and Enterprise OAuth users are eligible — these orgs have
    // admin-configurable policy restrictions (e.g. allow_remote_sessions)
    if (tokens.subscriptionType !== 'enterprise' &&
        tokens.subscriptionType !== 'team') {
        return false;
    }
    return true;
}
/**
 * Wait for the initial policy limits loading to complete
 * Returns immediately if user is not eligible or loading has already completed
 */
function waitForPolicyLimitsToLoad() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!loadingCompletePromise) return [3 /*break*/, 2];
                    return [4 /*yield*/, loadingCompletePromise];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get auth headers for policy limits without calling getSettings()
 * Supports both API key and OAuth authentication
 */
function getAuthHeaders() {
    // Try API key first (for Console users)
    try {
        var apiKey = (0, auth_js_1.getAnthropicApiKeyWithSource)({
            skipRetrievingKeyFromApiKeyHelper: true,
        }).key;
        if (apiKey) {
            return {
                headers: {
                    'x-api-key': apiKey,
                },
            };
        }
    }
    catch (_a) {
        // No API key available - continue to check OAuth
    }
    // Fall back to OAuth tokens (for Claude.ai users)
    var oauthTokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
    if (oauthTokens === null || oauthTokens === void 0 ? void 0 : oauthTokens.accessToken) {
        return {
            headers: {
                Authorization: "Bearer ".concat(oauthTokens.accessToken),
                'anthropic-beta': oauth_js_1.OAUTH_BETA_HEADER,
            },
        };
    }
    return {
        headers: {},
        error: 'No authentication available',
    };
}
/**
 * Fetch policy limits with retry logic and exponential backoff
 */
function fetchWithRetry(cachedChecksum) {
    return __awaiter(this, void 0, void 0, function () {
        var lastResult, attempt, delayMs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lastResult = null;
                    attempt = 1;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= DEFAULT_MAX_RETRIES + 1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, fetchPolicyLimits(cachedChecksum)];
                case 2:
                    lastResult = _a.sent();
                    if (lastResult.success) {
                        return [2 /*return*/, lastResult];
                    }
                    if (lastResult.skipRetry) {
                        return [2 /*return*/, lastResult];
                    }
                    if (attempt > DEFAULT_MAX_RETRIES) {
                        return [2 /*return*/, lastResult];
                    }
                    delayMs = (0, withRetry_js_1.getRetryDelay)(attempt);
                    (0, debug_js_1.logForDebugging)("Policy limits: Retry ".concat(attempt, "/").concat(DEFAULT_MAX_RETRIES, " after ").concat(delayMs, "ms"));
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(delayMs)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    attempt++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, lastResult];
            }
        });
    });
}
/**
 * Fetch policy limits (single attempt, no retries)
 */
function fetchPolicyLimits(cachedChecksum) {
    return __awaiter(this, void 0, void 0, function () {
        var authHeaders, endpoint, headers, response, parsed, error_1, _a, kind, message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()];
                case 1:
                    _b.sent();
                    authHeaders = getAuthHeaders();
                    if (authHeaders.error) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Authentication required for policy limits',
                                skipRetry: true,
                            }];
                    }
                    endpoint = getPolicyLimitsEndpoint();
                    headers = __assign(__assign({}, authHeaders.headers), { 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)() });
                    if (cachedChecksum) {
                        headers['If-None-Match'] = "\"".concat(cachedChecksum, "\"");
                    }
                    return [4 /*yield*/, axios_1.default.get(endpoint, {
                            headers: headers,
                            timeout: FETCH_TIMEOUT_MS,
                            validateStatus: function (status) {
                                return status === 200 || status === 304 || status === 404;
                            },
                        })
                        // Handle 304 Not Modified - cached version is still valid
                    ];
                case 2:
                    response = _b.sent();
                    // Handle 304 Not Modified - cached version is still valid
                    if (response.status === 304) {
                        (0, debug_js_1.logForDebugging)('Policy limits: Using cached restrictions (304)');
                        return [2 /*return*/, {
                                success: true,
                                restrictions: null, // Signal that cache is valid
                                etag: cachedChecksum,
                            }];
                    }
                    // Handle 404 Not Found - no policy limits exist or feature not enabled
                    if (response.status === 404) {
                        (0, debug_js_1.logForDebugging)('Policy limits: No restrictions found (404)');
                        return [2 /*return*/, {
                                success: true,
                                restrictions: {},
                                etag: undefined,
                            }];
                    }
                    parsed = (0, types_js_1.PolicyLimitsResponseSchema)().safeParse(response.data);
                    if (!parsed.success) {
                        (0, debug_js_1.logForDebugging)("Policy limits: Invalid response format - ".concat(parsed.error.message));
                        return [2 /*return*/, {
                                success: false,
                                error: 'Invalid policy limits format',
                            }];
                    }
                    (0, debug_js_1.logForDebugging)('Policy limits: Fetched successfully');
                    return [2 /*return*/, {
                            success: true,
                            restrictions: parsed.data.restrictions,
                        }];
                case 3:
                    error_1 = _b.sent();
                    _a = (0, errors_js_1.classifyAxiosError)(error_1), kind = _a.kind, message = _a.message;
                    switch (kind) {
                        case 'auth':
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Not authorized for policy limits',
                                    skipRetry: true,
                                }];
                        case 'timeout':
                            return [2 /*return*/, { success: false, error: 'Policy limits request timeout' }];
                        case 'network':
                            return [2 /*return*/, { success: false, error: 'Cannot connect to server' }];
                        default:
                            return [2 /*return*/, { success: false, error: message }];
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Load restrictions from cache file
 */
// sync IO: called from sync context (getRestrictionsFromCache -> isPolicyAllowed)
function loadCachedRestrictions() {
    try {
        var content = (0, fs_1.readFileSync)(getCachePath(), 'utf-8');
        var data = (0, json_js_1.safeParseJSON)(content, false);
        var parsed = (0, types_js_1.PolicyLimitsResponseSchema)().safeParse(data);
        if (!parsed.success) {
            return null;
        }
        return parsed.data.restrictions;
    }
    catch (_a) {
        return null;
    }
}
/**
 * Save restrictions to cache file
 */
function saveCachedRestrictions(restrictions) {
    return __awaiter(this, void 0, void 0, function () {
        var path, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    path = getCachePath();
                    data = { restrictions: restrictions };
                    return [4 /*yield*/, (0, promises_1.writeFile)(path, (0, slowOperations_js_1.jsonStringify)(data, null, 2), {
                            encoding: 'utf-8',
                            mode: 384,
                        })];
                case 1:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("Policy limits: Saved to ".concat(path));
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Policy limits: Failed to save - ".concat(error_2 instanceof Error ? error_2.message : 'unknown error'));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch and load policy limits with file caching
 * Fails open - returns null if fetch fails and no cache exists
 */
function fetchAndLoadPolicyLimits() {
    return __awaiter(this, void 0, void 0, function () {
        var cachedRestrictions, cachedChecksum, result, newRestrictions, hasContent, e_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!isPolicyLimitsEligible()) {
                        return [2 /*return*/, null];
                    }
                    cachedRestrictions = loadCachedRestrictions();
                    cachedChecksum = cachedRestrictions
                        ? computeChecksum(cachedRestrictions)
                        : undefined;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, fetchWithRetry(cachedChecksum)];
                case 2:
                    result = _b.sent();
                    if (!result.success) {
                        if (cachedRestrictions) {
                            (0, debug_js_1.logForDebugging)('Policy limits: Using stale cache after fetch failure');
                            sessionCache = cachedRestrictions;
                            return [2 /*return*/, cachedRestrictions];
                        }
                        return [2 /*return*/, null];
                    }
                    // Handle 304 Not Modified
                    if (result.restrictions === null && cachedRestrictions) {
                        (0, debug_js_1.logForDebugging)('Policy limits: Cache still valid (304 Not Modified)');
                        sessionCache = cachedRestrictions;
                        return [2 /*return*/, cachedRestrictions];
                    }
                    newRestrictions = result.restrictions || {};
                    hasContent = Object.keys(newRestrictions).length > 0;
                    if (!hasContent) return [3 /*break*/, 4];
                    sessionCache = newRestrictions;
                    return [4 /*yield*/, saveCachedRestrictions(newRestrictions)];
                case 3:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)('Policy limits: Applied new restrictions successfully');
                    return [2 /*return*/, newRestrictions];
                case 4:
                    // Empty restrictions (404 response) - delete cached file if it exists
                    sessionCache = newRestrictions;
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, promises_1.unlink)(getCachePath())];
                case 6:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)('Policy limits: Deleted cached file (404 response)');
                    return [3 /*break*/, 8];
                case 7:
                    e_1 = _b.sent();
                    if (isNodeError(e_1) && e_1.code !== 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("Policy limits: Failed to delete cached file - ".concat(e_1.message));
                    }
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, newRestrictions];
                case 9:
                    _a = _b.sent();
                    if (cachedRestrictions) {
                        (0, debug_js_1.logForDebugging)('Policy limits: Using stale cache after error');
                        sessionCache = cachedRestrictions;
                        return [2 /*return*/, cachedRestrictions];
                    }
                    return [2 /*return*/, null];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Policies that default to denied when essential-traffic-only mode is active
 * and the policy cache is unavailable. Without this, a cache miss or network
 * timeout would silently re-enable these features for HIPAA orgs.
 */
var ESSENTIAL_TRAFFIC_DENY_ON_MISS = new Set(['allow_product_feedback']);
/**
 * Check if a specific policy is allowed
 * Returns true if the policy is unknown, unavailable, or explicitly allowed (fail open).
 * Exception: policies in ESSENTIAL_TRAFFIC_DENY_ON_MISS fail closed when
 * essential-traffic-only mode is active and the cache is unavailable.
 */
function isPolicyAllowed(policy) {
    var restrictions = getRestrictionsFromCache();
    if (!restrictions) {
        if ((0, privacyLevel_js_1.isEssentialTrafficOnly)() &&
            ESSENTIAL_TRAFFIC_DENY_ON_MISS.has(policy)) {
            return false;
        }
        return true; // fail open
    }
    var restriction = restrictions[policy];
    if (!restriction) {
        return true; // unknown policy = allowed
    }
    return restriction.allowed;
}
/**
 * Get restrictions synchronously from session cache or file
 */
function getRestrictionsFromCache() {
    if (!isPolicyLimitsEligible()) {
        return null;
    }
    if (sessionCache) {
        return sessionCache;
    }
    var cachedRestrictions = loadCachedRestrictions();
    if (cachedRestrictions) {
        sessionCache = cachedRestrictions;
        return cachedRestrictions;
    }
    return null;
}
/**
 * Load policy limits during CLI initialization
 * Fails open - if fetch fails, continues without restrictions
 * Also starts background polling to pick up changes mid-session
 */
function loadPolicyLimits() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isPolicyLimitsEligible() && !loadingCompletePromise) {
                        loadingCompletePromise = new Promise(function (resolve) {
                            loadingCompleteResolve = resolve;
                        });
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, fetchAndLoadPolicyLimits()];
                case 2:
                    _a.sent();
                    if (isPolicyLimitsEligible()) {
                        startBackgroundPolling();
                    }
                    return [3 /*break*/, 4];
                case 3:
                    if (loadingCompleteResolve) {
                        loadingCompleteResolve();
                        loadingCompleteResolve = null;
                    }
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Refresh policy limits asynchronously (for auth state changes)
 * Used when login occurs
 */
function refreshPolicyLimits() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, clearPolicyLimitsCache()];
                case 1:
                    _a.sent();
                    if (!isPolicyLimitsEligible()) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetchAndLoadPolicyLimits()];
                case 2:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)('Policy limits: Refreshed after auth change');
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Clear all policy limits (session, persistent, and stop polling)
 */
function clearPolicyLimitsCache() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    stopBackgroundPolling();
                    sessionCache = null;
                    loadingCompletePromise = null;
                    loadingCompleteResolve = null;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.unlink)(getCachePath())];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Background polling callback
 */
function pollPolicyLimits() {
    return __awaiter(this, void 0, void 0, function () {
        var previousCache, newCache, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!isPolicyLimitsEligible()) {
                        return [2 /*return*/];
                    }
                    previousCache = sessionCache ? (0, slowOperations_js_1.jsonStringify)(sessionCache) : null;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetchAndLoadPolicyLimits()];
                case 2:
                    _b.sent();
                    newCache = sessionCache ? (0, slowOperations_js_1.jsonStringify)(sessionCache) : null;
                    if (newCache !== previousCache) {
                        (0, debug_js_1.logForDebugging)('Policy limits: Changed during background poll');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Start background polling for policy limits
 */
function startBackgroundPolling() {
    var _this = this;
    if (pollingIntervalId !== null) {
        return;
    }
    if (!isPolicyLimitsEligible()) {
        return;
    }
    pollingIntervalId = setInterval(function () {
        void pollPolicyLimits();
    }, POLLING_INTERVAL_MS);
    pollingIntervalId.unref();
    if (!cleanupRegistered) {
        cleanupRegistered = true;
        (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, stopBackgroundPolling()];
        }); }); });
    }
}
/**
 * Stop background polling for policy limits
 */
function stopBackgroundPolling() {
    if (pollingIntervalId !== null) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
    }
}
