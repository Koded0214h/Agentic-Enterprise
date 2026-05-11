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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroveNoticeConfig = exports.getGroveSettings = void 0;
exports.markGroveNoticeViewed = markGroveNoticeViewed;
exports.updateGroveSettings = updateGroveSettings;
exports.isQualifiedForGrove = isQualifiedForGrove;
exports.calculateShouldShowGrove = calculateShouldShowGrove;
exports.checkGroveForNonInteractive = checkGroveForNonInteractive;
var axios_1 = require("axios");
var memoize_js_1 = require("lodash-es/memoize.js");
var index_js_1 = require("src/services/analytics/index.js");
var auth_js_1 = require("src/utils/auth.js");
var debug_js_1 = require("src/utils/debug.js");
var gracefulShutdown_js_1 = require("src/utils/gracefulShutdown.js");
var privacyLevel_js_1 = require("src/utils/privacyLevel.js");
var process_js_1 = require("src/utils/process.js");
var oauth_js_1 = require("../../constants/oauth.js");
var config_js_1 = require("../../utils/config.js");
var http_js_1 = require("../../utils/http.js");
var log_js_1 = require("../../utils/log.js");
var userAgent_js_1 = require("../../utils/userAgent.js");
// Cache expiration: 24 hours
var GROVE_CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;
/**
 * Get the current Grove settings for the user account.
 * Returns ApiResult to distinguish between API failure and success.
 * Uses existing OAuth 401 retry, then returns failure if that doesn't help.
 *
 * Memoized for the session to avoid redundant per-render requests.
 * Cache is invalidated in updateGroveSettings() so post-toggle reads are fresh.
 */
exports.getGroveSettings = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                // Grove is a notification feature; during an outage, skipping it is correct.
                if ((0, privacyLevel_js_1.isEssentialTrafficOnly)()) {
                    return [2 /*return*/, { success: false }];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, http_js_1.withOAuth401Retry)(function () {
                        var authHeaders = (0, http_js_1.getAuthHeaders)();
                        if (authHeaders.error) {
                            throw new Error("Failed to get auth headers: ".concat(authHeaders.error));
                        }
                        return axios_1.default.get("".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/oauth/account/settings"), {
                            headers: __assign(__assign({}, authHeaders.headers), { 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)() }),
                        });
                    })];
            case 2:
                response = _c.sent();
                return [2 /*return*/, { success: true, data: response.data }];
            case 3:
                err_1 = _c.sent();
                (0, log_js_1.logError)(err_1);
                // Don't cache failures — transient network issues would lock the user
                // out of privacy settings for the entire session (deadlock: dialog needs
                // success to render the toggle, toggle calls updateGroveSettings which
                // is the only other place the cache is cleared).
                (_b = (_a = exports.getGroveSettings.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
                return [2 /*return*/, { success: false }];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Mark that the Grove notice has been viewed by the user
 */
function markGroveNoticeViewed() {
    return __awaiter(this, void 0, void 0, function () {
        var err_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, http_js_1.withOAuth401Retry)(function () {
                            var authHeaders = (0, http_js_1.getAuthHeaders)();
                            if (authHeaders.error) {
                                throw new Error("Failed to get auth headers: ".concat(authHeaders.error));
                            }
                            return axios_1.default.post("".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/oauth/account/grove_notice_viewed"), {}, {
                                headers: __assign(__assign({}, authHeaders.headers), { 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)() }),
                            });
                        })
                        // This mutates grove_notice_viewed_at server-side — Grove.tsx:87 reads it
                        // to decide whether to show the dialog. Without invalidation a same-session
                        // remount would read stale viewed_at:null and re-show the dialog.
                    ];
                case 1:
                    _c.sent();
                    // This mutates grove_notice_viewed_at server-side — Grove.tsx:87 reads it
                    // to decide whether to show the dialog. Without invalidation a same-session
                    // remount would read stale viewed_at:null and re-show the dialog.
                    (_b = (_a = exports.getGroveSettings.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _c.sent();
                    (0, log_js_1.logError)(err_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update Grove settings for the user account
 */
function updateGroveSettings(groveEnabled) {
    return __awaiter(this, void 0, void 0, function () {
        var err_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, http_js_1.withOAuth401Retry)(function () {
                            var authHeaders = (0, http_js_1.getAuthHeaders)();
                            if (authHeaders.error) {
                                throw new Error("Failed to get auth headers: ".concat(authHeaders.error));
                            }
                            return axios_1.default.patch("".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/oauth/account/settings"), {
                                grove_enabled: groveEnabled,
                            }, {
                                headers: __assign(__assign({}, authHeaders.headers), { 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)() }),
                            });
                        })
                        // Invalidate memoized settings so the post-toggle confirmation
                        // read in privacy-settings.tsx picks up the new value.
                    ];
                case 1:
                    _c.sent();
                    // Invalidate memoized settings so the post-toggle confirmation
                    // read in privacy-settings.tsx picks up the new value.
                    (_b = (_a = exports.getGroveSettings.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _c.sent();
                    (0, log_js_1.logError)(err_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if user is qualified for Grove (non-blocking, cache-first).
 *
 * This function never blocks on network - it returns cached data immediately
 * and fetches in the background if needed. On cold start (no cache), it returns
 * false and the Grove dialog won't show until the next session.
 */
function isQualifiedForGrove() {
    return __awaiter(this, void 0, void 0, function () {
        var accountId, globalConfig, cachedEntry, now;
        var _a, _b;
        return __generator(this, function (_c) {
            if (!(0, auth_js_1.isConsumerSubscriber)()) {
                return [2 /*return*/, false];
            }
            accountId = (_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.accountUuid;
            if (!accountId) {
                return [2 /*return*/, false];
            }
            globalConfig = (0, config_js_1.getGlobalConfig)();
            cachedEntry = (_b = globalConfig.groveConfigCache) === null || _b === void 0 ? void 0 : _b[accountId];
            now = Date.now();
            // No cache - trigger background fetch and return false (non-blocking)
            // The Grove dialog won't show this session, but will next time if eligible
            if (!cachedEntry) {
                (0, debug_js_1.logForDebugging)('Grove: No cache, fetching config in background (dialog skipped this session)');
                void fetchAndStoreGroveConfig(accountId);
                return [2 /*return*/, false];
            }
            // Cache exists but is stale - return cached value and refresh in background
            if (now - cachedEntry.timestamp > GROVE_CACHE_EXPIRATION_MS) {
                (0, debug_js_1.logForDebugging)('Grove: Cache stale, returning cached data and refreshing in background');
                void fetchAndStoreGroveConfig(accountId);
                return [2 /*return*/, cachedEntry.grove_enabled];
            }
            // Cache is fresh - return it immediately
            (0, debug_js_1.logForDebugging)('Grove: Using fresh cached config');
            return [2 /*return*/, cachedEntry.grove_enabled];
        });
    });
}
/**
 * Fetch Grove config from API and store in cache
 */
function fetchAndStoreGroveConfig(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, groveEnabled_1, cachedEntry, err_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, exports.getGroveNoticeConfig)()];
                case 1:
                    result = _b.sent();
                    if (!result.success) {
                        return [2 /*return*/];
                    }
                    groveEnabled_1 = result.data.grove_enabled;
                    cachedEntry = (_a = (0, config_js_1.getGlobalConfig)().groveConfigCache) === null || _a === void 0 ? void 0 : _a[accountId];
                    if ((cachedEntry === null || cachedEntry === void 0 ? void 0 : cachedEntry.grove_enabled) === groveEnabled_1 &&
                        Date.now() - cachedEntry.timestamp <= GROVE_CACHE_EXPIRATION_MS) {
                        return [2 /*return*/];
                    }
                    (0, config_js_1.saveGlobalConfig)(function (current) {
                        var _a;
                        return (__assign(__assign({}, current), { groveConfigCache: __assign(__assign({}, current.groveConfigCache), (_a = {}, _a[accountId] = {
                                grove_enabled: groveEnabled_1,
                                timestamp: Date.now(),
                            }, _a)) }));
                    });
                    return [3 /*break*/, 3];
                case 2:
                    err_4 = _b.sent();
                    (0, debug_js_1.logForDebugging)("Grove: Failed to fetch and store config: ".concat(err_4));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get Grove Statsig configuration from the API.
 * Returns ApiResult to distinguish between API failure and success.
 * Uses existing OAuth 401 retry, then returns failure if that doesn't help.
 */
exports.getGroveNoticeConfig = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, _a, grove_enabled, domain_excluded, notice_is_grace_period, notice_reminder_frequency, err_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                // Grove is a notification feature; during an outage, skipping it is correct.
                if ((0, privacyLevel_js_1.isEssentialTrafficOnly)()) {
                    return [2 /*return*/, { success: false }];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, http_js_1.withOAuth401Retry)(function () {
                        var authHeaders = (0, http_js_1.getAuthHeaders)();
                        if (authHeaders.error) {
                            throw new Error("Failed to get auth headers: ".concat(authHeaders.error));
                        }
                        return axios_1.default.get("".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/claude_code_grove"), {
                            headers: __assign(__assign({}, authHeaders.headers), { 'User-Agent': (0, http_js_1.getUserAgent)() }),
                            timeout: 3000, // Short timeout - if slow, skip Grove dialog
                        });
                    })
                    // Map the API response to the GroveConfig type
                ];
            case 2:
                response = _b.sent();
                _a = response.data, grove_enabled = _a.grove_enabled, domain_excluded = _a.domain_excluded, notice_is_grace_period = _a.notice_is_grace_period, notice_reminder_frequency = _a.notice_reminder_frequency;
                return [2 /*return*/, {
                        success: true,
                        data: {
                            grove_enabled: grove_enabled,
                            domain_excluded: domain_excluded !== null && domain_excluded !== void 0 ? domain_excluded : false,
                            notice_is_grace_period: notice_is_grace_period !== null && notice_is_grace_period !== void 0 ? notice_is_grace_period : true,
                            notice_reminder_frequency: notice_reminder_frequency,
                        },
                    }];
            case 3:
                err_5 = _b.sent();
                (0, debug_js_1.logForDebugging)("Failed to fetch Grove notice config: ".concat(err_5));
                return [2 /*return*/, { success: false }];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Determines whether the Grove dialog should be shown.
 * Returns false if either API call failed (after retry) - we hide the dialog on API failure.
 */
function calculateShouldShowGrove(settingsResult, configResult, showIfAlreadyViewed) {
    // Hide dialog on API failure (after retry)
    if (!settingsResult.success || !configResult.success) {
        return false;
    }
    var settings = settingsResult.data;
    var config = configResult.data;
    var hasChosen = settings.grove_enabled !== null;
    if (hasChosen) {
        return false;
    }
    if (showIfAlreadyViewed) {
        return true;
    }
    if (!config.notice_is_grace_period) {
        return true;
    }
    // Check if we need to remind the user to accept the terms and choose
    // whether to help improve Claude.
    var reminderFrequency = config.notice_reminder_frequency;
    if (reminderFrequency !== null && settings.grove_notice_viewed_at) {
        var daysSinceViewed = Math.floor((Date.now() - new Date(settings.grove_notice_viewed_at).getTime()) /
            (1000 * 60 * 60 * 24));
        return daysSinceViewed >= reminderFrequency;
    }
    else {
        // Show if never viewed before
        var viewedAt = settings.grove_notice_viewed_at;
        return viewedAt === null || viewedAt === undefined;
    }
}
function checkGroveForNonInteractive() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, settingsResult, configResult, shouldShowGrove, config;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        (0, exports.getGroveSettings)(),
                        (0, exports.getGroveNoticeConfig)(),
                    ])
                    // Check if user hasn't made a choice yet (returns false on API failure)
                ];
                case 1:
                    _a = _b.sent(), settingsResult = _a[0], configResult = _a[1];
                    shouldShowGrove = calculateShouldShowGrove(settingsResult, configResult, false);
                    if (!shouldShowGrove) return [3 /*break*/, 5];
                    config = configResult.success ? configResult.data : null;
                    (0, index_js_1.logEvent)('tengu_grove_print_viewed', {
                        dismissable: config === null || config === void 0 ? void 0 : config.notice_is_grace_period,
                    });
                    if (!(config === null || config.notice_is_grace_period)) return [3 /*break*/, 3];
                    // Grace period is still active - show informational message and continue
                    (0, process_js_1.writeToStderr)('\nAn update to our Consumer Terms and Privacy Policy will take effect on October 8, 2025. Run `claude` to review the updated terms.\n\n');
                    return [4 /*yield*/, markGroveNoticeViewed()];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 3:
                    // Grace period has ended - show error message and exit
                    (0, process_js_1.writeToStderr)('\n[ACTION REQUIRED] An update to our Consumer Terms and Privacy Policy has taken effect on October 8, 2025. You must run `claude` to review the updated terms.\n\n');
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(1)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
