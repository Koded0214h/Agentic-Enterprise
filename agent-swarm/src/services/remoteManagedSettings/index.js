"use strict";
/**
 * Remote Managed Settings Service
 *
 * Manages fetching, caching, and validation of remote-managed settings
 * for enterprise customers. Uses checksum-based validation to minimize
 * network traffic and provides graceful degradation on failures.
 *
 * Eligibility:
 * - Console users (API key): All eligible
 * - OAuth users (Claude.ai): Only Enterprise/C4E and Team subscribers are eligible
 * - API fails open (non-blocking) - if fetch fails, continues without remote settings
 * - API returns empty settings for users without managed settings
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
exports.initializeRemoteManagedSettingsLoadingPromise = initializeRemoteManagedSettingsLoadingPromise;
exports.computeChecksumFromSettings = computeChecksumFromSettings;
exports.isEligibleForRemoteManagedSettings = isEligibleForRemoteManagedSettings;
exports.waitForRemoteManagedSettingsToLoad = waitForRemoteManagedSettingsToLoad;
exports.clearRemoteManagedSettingsCache = clearRemoteManagedSettingsCache;
exports.loadRemoteManagedSettings = loadRemoteManagedSettings;
exports.refreshRemoteManagedSettings = refreshRemoteManagedSettings;
exports.startBackgroundPolling = startBackgroundPolling;
exports.stopBackgroundPolling = stopBackgroundPolling;
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var oauth_js_1 = require("../../constants/oauth.js");
var auth_js_1 = require("../../utils/auth.js");
var cleanupRegistry_js_1 = require("../../utils/cleanupRegistry.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var changeDetector_js_1 = require("../../utils/settings/changeDetector.js");
var types_js_1 = require("../../utils/settings/types.js");
var sleep_js_1 = require("../../utils/sleep.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var userAgent_js_1 = require("../../utils/userAgent.js");
var withRetry_js_1 = require("../api/withRetry.js");
var securityCheck_jsx_1 = require("./securityCheck.jsx");
var syncCache_js_1 = require("./syncCache.js");
var syncCacheState_js_1 = require("./syncCacheState.js");
var types_js_2 = require("./types.js");
// Constants
var SETTINGS_TIMEOUT_MS = 10000; // 10 seconds for settings fetch
var DEFAULT_MAX_RETRIES = 5;
var POLLING_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
// Background polling state
var pollingIntervalId = null;
// Promise that resolves when initial remote settings loading completes
// This allows other systems to wait for remote settings before initializing
var loadingCompletePromise = null;
var loadingCompleteResolve = null;
// Timeout for the loading promise to prevent deadlocks if loadRemoteManagedSettings() is never called
// (e.g., in Agent SDK tests that don't go through main.tsx)
var LOADING_PROMISE_TIMEOUT_MS = 30000; // 30 seconds
/**
 * Initialize the loading promise for remote managed settings
 * This should be called early (e.g., in init.ts) to allow other systems
 * to await remote settings loading even if loadRemoteManagedSettings()
 * hasn't been called yet.
 *
 * Only creates the promise if the user is eligible for remote settings.
 * Includes a timeout to prevent deadlocks if loadRemoteManagedSettings() is never called.
 */
function initializeRemoteManagedSettingsLoadingPromise() {
    if (loadingCompletePromise) {
        return;
    }
    if ((0, syncCache_js_1.isRemoteManagedSettingsEligible)()) {
        loadingCompletePromise = new Promise(function (resolve) {
            loadingCompleteResolve = resolve;
            // Set a timeout to resolve the promise even if loadRemoteManagedSettings() is never called
            // This prevents deadlocks in Agent SDK tests and other non-CLI contexts
            setTimeout(function () {
                if (loadingCompleteResolve) {
                    (0, debug_js_1.logForDebugging)('Remote settings: Loading promise timed out, resolving anyway');
                    loadingCompleteResolve();
                    loadingCompleteResolve = null;
                }
            }, LOADING_PROMISE_TIMEOUT_MS);
        });
    }
}
/**
 * Get the remote settings API endpoint
 * Uses the OAuth config base API URL
 */
function getRemoteManagedSettingsEndpoint() {
    return "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/claude_code/settings");
}
/**
 * Recursively sort all keys in an object to match Python's json.dumps(sort_keys=True)
 */
function sortKeysDeep(obj) {
    if (Array.isArray(obj)) {
        return obj.map(sortKeysDeep);
    }
    if (obj !== null && typeof obj === 'object') {
        var sorted = {};
        for (var _i = 0, _a = Object.keys(obj).sort(); _i < _a.length; _i++) {
            var key = _a[_i];
            sorted[key] = sortKeysDeep(obj[key]);
        }
        return sorted;
    }
    return obj;
}
/**
 * Compute checksum from settings content for HTTP caching
 * Must match server's Python: json.dumps(settings, sort_keys=True, separators=(",", ":"))
 * Exported for testing to verify compatibility with server-side implementation
 */
function computeChecksumFromSettings(settings) {
    var sorted = sortKeysDeep(settings);
    // No spaces after separators to match Python's separators=(",", ":")
    var normalized = (0, slowOperations_js_1.jsonStringify)(sorted);
    var hash = (0, crypto_1.createHash)('sha256').update(normalized).digest('hex');
    return "sha256:".concat(hash);
}
/**
 * Check if the current user is eligible for remote managed settings
 * This is the public API for other systems to check eligibility
 * Used to determine if they should wait for remote settings to load
 */
function isEligibleForRemoteManagedSettings() {
    return (0, syncCache_js_1.isRemoteManagedSettingsEligible)();
}
/**
 * Wait for the initial remote settings loading to complete
 * Returns immediately if:
 * - User is not eligible for remote settings
 * - Loading has already completed
 * - Loading was never started
 */
function waitForRemoteManagedSettingsToLoad() {
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
 * Get auth headers for remote settings without calling getSettings()
 * This avoids circular dependencies during settings loading
 * Supports both API key and OAuth authentication
 */
function getRemoteSettingsAuthHeaders() {
    // Try API key first (for Console users)
    // Skip apiKeyHelper to avoid circular dependency with getSettings()
    // Wrap in try-catch because getAnthropicApiKeyWithSource throws in CI/test environments
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
 * Fetch remote settings with retry logic and exponential backoff
 * Uses existing codebase retry utilities for consistency
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
                    return [4 /*yield*/, fetchRemoteManagedSettings(cachedChecksum)
                        // Return immediately on success
                    ];
                case 2:
                    lastResult = _a.sent();
                    // Return immediately on success
                    if (lastResult.success) {
                        return [2 /*return*/, lastResult];
                    }
                    // Don't retry if the error is not retryable (e.g., auth errors)
                    if (lastResult.skipRetry) {
                        return [2 /*return*/, lastResult];
                    }
                    // If we've exhausted retries, return the last error
                    if (attempt > DEFAULT_MAX_RETRIES) {
                        return [2 /*return*/, lastResult];
                    }
                    delayMs = (0, withRetry_js_1.getRetryDelay)(attempt);
                    (0, debug_js_1.logForDebugging)("Remote settings: Retry ".concat(attempt, "/").concat(DEFAULT_MAX_RETRIES, " after ").concat(delayMs, "ms"));
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(delayMs)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    attempt++;
                    return [3 /*break*/, 1];
                case 5: 
                // Should never reach here, but TypeScript needs it
                return [2 /*return*/, lastResult];
            }
        });
    });
}
/**
 * Fetch the full remote settings (single attempt, no retries)
 * Optionally pass a cached checksum for ETag-based caching
 */
function fetchRemoteManagedSettings(cachedChecksum) {
    return __awaiter(this, void 0, void 0, function () {
        var authHeaders, endpoint, headers, response, parsed, settingsValidation, error_1, _a, kind, status_1, message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    // Ensure OAuth token is fresh before fetching settings
                    // This prevents 401 errors from stale cached tokens
                    return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()
                        // Use local auth header getter to avoid circular dependency with getSettings()
                    ];
                case 1:
                    // Ensure OAuth token is fresh before fetching settings
                    // This prevents 401 errors from stale cached tokens
                    _b.sent();
                    authHeaders = getRemoteSettingsAuthHeaders();
                    if (authHeaders.error) {
                        // Auth errors should not be retried - return a special flag to skip retries
                        return [2 /*return*/, {
                                success: false,
                                error: "Authentication required for remote settings",
                                skipRetry: true,
                            }];
                    }
                    endpoint = getRemoteManagedSettingsEndpoint();
                    headers = __assign(__assign({}, authHeaders.headers), { 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)() });
                    // Add If-None-Match header for ETag-based caching
                    if (cachedChecksum) {
                        headers['If-None-Match'] = "\"".concat(cachedChecksum, "\"");
                    }
                    return [4 /*yield*/, axios_1.default.get(endpoint, {
                            headers: headers,
                            timeout: SETTINGS_TIMEOUT_MS,
                            // Allow 204, 304, and 404 responses without treating them as errors.
                            // 204/404 are returned when no settings exist for the user or the feature flag is off.
                            validateStatus: function (status) {
                                return status === 200 || status === 204 || status === 304 || status === 404;
                            },
                        })
                        // Handle 304 Not Modified - cached version is still valid
                    ];
                case 2:
                    response = _b.sent();
                    // Handle 304 Not Modified - cached version is still valid
                    if (response.status === 304) {
                        (0, debug_js_1.logForDebugging)('Remote settings: Using cached settings (304)');
                        return [2 /*return*/, {
                                success: true,
                                settings: null, // Signal that cache is valid
                                checksum: cachedChecksum,
                            }];
                    }
                    // Handle 204 No Content / 404 Not Found - no settings exist or feature flag is off.
                    // Return empty object (not null) so callers don't fall back to cached settings.
                    if (response.status === 204 || response.status === 404) {
                        (0, debug_js_1.logForDebugging)("Remote settings: No settings found (".concat(response.status, ")"));
                        return [2 /*return*/, {
                                success: true,
                                settings: {},
                                checksum: undefined,
                            }];
                    }
                    parsed = (0, types_js_2.RemoteManagedSettingsResponseSchema)().safeParse(response.data);
                    if (!parsed.success) {
                        (0, debug_js_1.logForDebugging)("Remote settings: Invalid response format - ".concat(parsed.error.message));
                        return [2 /*return*/, {
                                success: false,
                                error: 'Invalid remote settings format',
                            }];
                    }
                    settingsValidation = (0, types_js_1.SettingsSchema)().safeParse(parsed.data.settings);
                    if (!settingsValidation.success) {
                        (0, debug_js_1.logForDebugging)("Remote settings: Settings validation failed - ".concat(settingsValidation.error.message));
                        return [2 /*return*/, {
                                success: false,
                                error: 'Invalid settings structure',
                            }];
                    }
                    (0, debug_js_1.logForDebugging)('Remote settings: Fetched successfully');
                    return [2 /*return*/, {
                            success: true,
                            settings: settingsValidation.data,
                            checksum: parsed.data.checksum,
                        }];
                case 3:
                    error_1 = _b.sent();
                    _a = (0, errors_js_1.classifyAxiosError)(error_1), kind = _a.kind, status_1 = _a.status, message = _a.message;
                    if (status_1 === 404) {
                        // 404 means no remote settings configured
                        return [2 /*return*/, { success: true, settings: {}, checksum: '' }];
                    }
                    switch (kind) {
                        case 'auth':
                            // Auth errors (401, 403) should not be retried - the API key doesn't have access
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Not authorized for remote settings',
                                    skipRetry: true,
                                }];
                        case 'timeout':
                            return [2 /*return*/, { success: false, error: 'Remote settings request timeout' }];
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
 * Save remote settings to file
 * Stores raw settings JSON (checksum is computed on-demand when needed)
 */
function saveSettings(settings) {
    return __awaiter(this, void 0, void 0, function () {
        var path, handle, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    path = (0, syncCacheState_js_1.getSettingsPath)();
                    return [4 /*yield*/, (0, promises_1.open)(path, 'w', 384)];
                case 1:
                    handle = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 5, 7]);
                    return [4 /*yield*/, handle.writeFile((0, slowOperations_js_1.jsonStringify)(settings, null, 2), {
                            encoding: 'utf-8',
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, handle.datasync()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, handle.close()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7:
                    (0, debug_js_1.logForDebugging)("Remote settings: Saved to ".concat(path));
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Remote settings: Failed to save - ".concat(error_2 instanceof Error ? error_2.message : 'unknown error'));
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Clear all remote settings (session, persistent, and stop polling)
 */
function clearRemoteManagedSettingsCache() {
    return __awaiter(this, void 0, void 0, function () {
        var path, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Stop background polling
                    stopBackgroundPolling();
                    // Clear session cache
                    (0, syncCache_js_1.resetSyncCache)();
                    // Clear loading promise state
                    loadingCompletePromise = null;
                    loadingCompleteResolve = null;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    path = (0, syncCacheState_js_1.getSettingsPath)();
                    return [4 /*yield*/, (0, promises_1.unlink)(path)];
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
 * Fetch and load remote settings with file caching
 * Internal function that handles the full load/fetch logic
 * Fails open - returns null if fetch fails and no cache exists
 */
function fetchAndLoadRemoteManagedSettings() {
    return __awaiter(this, void 0, void 0, function () {
        var cachedSettings, cachedChecksum, result, newSettings, hasContent, securityResult, path, e_1, code, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(0, syncCache_js_1.isRemoteManagedSettingsEligible)()) {
                        return [2 /*return*/, null];
                    }
                    cachedSettings = (0, syncCacheState_js_1.getRemoteManagedSettingsSyncFromCache)();
                    cachedChecksum = cachedSettings
                        ? computeChecksumFromSettings(cachedSettings)
                        : undefined;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, fetchWithRetry(cachedChecksum)];
                case 2:
                    result = _b.sent();
                    if (!result.success) {
                        // On fetch failure, use stale file if available (graceful degradation)
                        if (cachedSettings) {
                            (0, debug_js_1.logForDebugging)('Remote settings: Using stale cache after fetch failure');
                            (0, syncCacheState_js_1.setSessionCache)(cachedSettings);
                            return [2 /*return*/, cachedSettings];
                        }
                        // No cache available - fail open, continue without remote settings
                        return [2 /*return*/, null];
                    }
                    // Handle 304 Not Modified - cached settings are still valid
                    if (result.settings === null && cachedSettings) {
                        (0, debug_js_1.logForDebugging)('Remote settings: Cache still valid (304 Not Modified)');
                        (0, syncCacheState_js_1.setSessionCache)(cachedSettings);
                        return [2 /*return*/, cachedSettings];
                    }
                    newSettings = result.settings || {};
                    hasContent = Object.keys(newSettings).length > 0;
                    if (!hasContent) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, securityCheck_jsx_1.checkManagedSettingsSecurity)(cachedSettings, newSettings)];
                case 3:
                    securityResult = _b.sent();
                    if (!(0, securityCheck_jsx_1.handleSecurityCheckResult)(securityResult)) {
                        // User rejected - don't apply settings, return cached or null
                        (0, debug_js_1.logForDebugging)('Remote settings: User rejected new settings, using cached settings');
                        return [2 /*return*/, cachedSettings];
                    }
                    (0, syncCacheState_js_1.setSessionCache)(newSettings);
                    return [4 /*yield*/, saveSettings(newSettings)];
                case 4:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)('Remote settings: Applied new settings successfully');
                    return [2 /*return*/, newSettings];
                case 5:
                    // Empty settings (404 response) - delete cached file if it exists
                    // This ensures stale settings don't persist when a user's remote settings are removed
                    (0, syncCacheState_js_1.setSessionCache)(newSettings);
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, 8, , 9]);
                    path = (0, syncCacheState_js_1.getSettingsPath)();
                    return [4 /*yield*/, (0, promises_1.unlink)(path)];
                case 7:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)('Remote settings: Deleted cached file (404 response)');
                    return [3 /*break*/, 9];
                case 8:
                    e_1 = _b.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (code !== 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("Remote settings: Failed to delete cached file - ".concat(e_1 instanceof Error ? e_1.message : 'unknown error'));
                    }
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/, newSettings];
                case 10:
                    _a = _b.sent();
                    // On any error, use stale file if available (graceful degradation)
                    if (cachedSettings) {
                        (0, debug_js_1.logForDebugging)('Remote settings: Using stale cache after error');
                        (0, syncCacheState_js_1.setSessionCache)(cachedSettings);
                        return [2 /*return*/, cachedSettings];
                    }
                    // No cache available - fail open, continue without remote settings
                    return [2 /*return*/, null];
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Load remote settings during CLI initialization
 * Fails open - if fetch fails, continues without remote settings
 * Also starts background polling to pick up settings changes mid-session
 *
 * This function sets up a promise that other systems can await via
 * waitForRemoteManagedSettingsToLoad() to ensure they don't initialize
 * until remote settings have been fetched.
 */
function loadRemoteManagedSettings() {
    return __awaiter(this, void 0, void 0, function () {
        var settings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Set up the promise for other systems to wait on
                    // Only if the user is eligible for remote settings AND promise not already set up
                    // (initializeRemoteManagedSettingsLoadingPromise may have been called earlier)
                    if ((0, syncCache_js_1.isRemoteManagedSettingsEligible)() && !loadingCompletePromise) {
                        loadingCompletePromise = new Promise(function (resolve) {
                            loadingCompleteResolve = resolve;
                        });
                    }
                    // Cache-first: if we have cached settings on disk, apply them and unblock
                    // waiters immediately. The fetch still runs below; notifyChange fires once,
                    // after the fetch, as before. Saves the ~77ms fetch-wait on print-mode startup.
                    // getRemoteManagedSettingsSyncFromCache has the eligibility guard and populates
                    // the session cache internally — no need to call setSessionCache here.
                    if ((0, syncCacheState_js_1.getRemoteManagedSettingsSyncFromCache)() && loadingCompleteResolve) {
                        loadingCompleteResolve();
                        loadingCompleteResolve = null;
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, fetchAndLoadRemoteManagedSettings()
                        // Start background polling to pick up settings changes mid-session
                    ];
                case 2:
                    settings = _a.sent();
                    // Start background polling to pick up settings changes mid-session
                    if ((0, syncCache_js_1.isRemoteManagedSettingsEligible)()) {
                        startBackgroundPolling();
                    }
                    // Trigger hot-reload if settings were loaded (new or from cache).
                    // notifyChange resets the settings cache internally before iterating
                    // listeners — env vars, telemetry, and permissions update on next read.
                    if (settings !== null) {
                        changeDetector_js_1.settingsChangeDetector.notifyChange('policySettings');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    // Always resolve the promise, even if fetch failed (fail-open)
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
 * Refresh remote settings asynchronously (for auth state changes)
 * This is used when login/logout occurs
 * Fails open - if fetch fails, continues without remote settings
 */
function refreshRemoteManagedSettings() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Clear caches first
                return [4 /*yield*/, clearRemoteManagedSettingsCache()
                    // If not enabled, notify that policy settings changed (to empty)
                ];
                case 1:
                    // Clear caches first
                    _a.sent();
                    // If not enabled, notify that policy settings changed (to empty)
                    if (!(0, syncCache_js_1.isRemoteManagedSettingsEligible)()) {
                        changeDetector_js_1.settingsChangeDetector.notifyChange('policySettings');
                        return [2 /*return*/];
                    }
                    // Try to load new settings (fails open if fetch fails)
                    return [4 /*yield*/, fetchAndLoadRemoteManagedSettings()];
                case 2:
                    // Try to load new settings (fails open if fetch fails)
                    _a.sent();
                    (0, debug_js_1.logForDebugging)('Remote settings: Refreshed after auth change');
                    // Notify listeners. notifyChange resets the settings cache internally;
                    // this triggers hot-reload (AppState update, env var application, etc.)
                    changeDetector_js_1.settingsChangeDetector.notifyChange('policySettings');
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Background polling callback - fetches settings and triggers hot-reload if changed
 */
function pollRemoteSettings() {
    return __awaiter(this, void 0, void 0, function () {
        var prevCache, previousSettings, newCache, newSettings, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(0, syncCache_js_1.isRemoteManagedSettingsEligible)()) {
                        return [2 /*return*/];
                    }
                    prevCache = (0, syncCacheState_js_1.getRemoteManagedSettingsSyncFromCache)();
                    previousSettings = prevCache ? (0, slowOperations_js_1.jsonStringify)(prevCache) : null;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetchAndLoadRemoteManagedSettings()
                        // Check if settings actually changed
                    ];
                case 2:
                    _b.sent();
                    newCache = (0, syncCacheState_js_1.getRemoteManagedSettingsSyncFromCache)();
                    newSettings = newCache ? (0, slowOperations_js_1.jsonStringify)(newCache) : null;
                    if (newSettings !== previousSettings) {
                        (0, debug_js_1.logForDebugging)('Remote settings: Changed during background poll');
                        changeDetector_js_1.settingsChangeDetector.notifyChange('policySettings');
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
 * Start background polling for remote settings
 * Polls every hour to pick up settings changes mid-session
 */
function startBackgroundPolling() {
    var _this = this;
    if (pollingIntervalId !== null) {
        return;
    }
    if (!(0, syncCache_js_1.isRemoteManagedSettingsEligible)()) {
        return;
    }
    pollingIntervalId = setInterval(function () {
        void pollRemoteSettings();
    }, POLLING_INTERVAL_MS);
    pollingIntervalId.unref();
    // Register cleanup to stop polling on shutdown
    (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, stopBackgroundPolling()];
    }); }); });
}
/**
 * Stop background polling for remote settings
 */
function stopBackgroundPolling() {
    if (pollingIntervalId !== null) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
    }
}
