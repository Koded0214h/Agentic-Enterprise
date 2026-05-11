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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchReferralEligibility = fetchReferralEligibility;
exports.fetchReferralRedemptions = fetchReferralRedemptions;
exports.checkCachedPassesEligibility = checkCachedPassesEligibility;
exports.formatCreditAmount = formatCreditAmount;
exports.getCachedReferrerReward = getCachedReferrerReward;
exports.getCachedRemainingPasses = getCachedRemainingPasses;
exports.fetchAndStorePassesEligibility = fetchAndStorePassesEligibility;
exports.getCachedOrFetchPassesEligibility = getCachedOrFetchPassesEligibility;
exports.prefetchPassesEligibility = prefetchPassesEligibility;
var axios_1 = require("axios");
var oauth_js_1 = require("../../constants/oauth.js");
var auth_js_1 = require("../../utils/auth.js");
var config_js_1 = require("../../utils/config.js");
var debug_js_1 = require("../../utils/debug.js");
var log_js_1 = require("../../utils/log.js");
var privacyLevel_js_1 = require("../../utils/privacyLevel.js");
var api_js_1 = require("../../utils/teleport/api.js");
// Cache expiration time: 24 hours (eligibility changes only on subscription/experiment changes)
var CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;
// Track in-flight fetch to prevent duplicate API calls
var fetchInProgress = null;
function fetchReferralEligibility() {
    return __awaiter(this, arguments, void 0, function (campaign) {
        var _a, accessToken, orgUUID, headers, url, response;
        if (campaign === void 0) { campaign = 'claude_code_guest_pass'; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, api_js_1.prepareApiRequest)()];
                case 1:
                    _a = _b.sent(), accessToken = _a.accessToken, orgUUID = _a.orgUUID;
                    headers = __assign(__assign({}, (0, api_js_1.getOAuthHeaders)(accessToken)), { 'x-organization-uuid': orgUUID });
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/oauth/organizations/").concat(orgUUID, "/referral/eligibility");
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: headers,
                            params: { campaign: campaign },
                            timeout: 5000, // 5 second timeout for background fetch
                        })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
function fetchReferralRedemptions() {
    return __awaiter(this, arguments, void 0, function (campaign) {
        var _a, accessToken, orgUUID, headers, url, response;
        if (campaign === void 0) { campaign = 'claude_code_guest_pass'; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, api_js_1.prepareApiRequest)()];
                case 1:
                    _a = _b.sent(), accessToken = _a.accessToken, orgUUID = _a.orgUUID;
                    headers = __assign(__assign({}, (0, api_js_1.getOAuthHeaders)(accessToken)), { 'x-organization-uuid': orgUUID });
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/oauth/organizations/").concat(orgUUID, "/referral/redemptions");
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: headers,
                            params: { campaign: campaign },
                            timeout: 10000, // 10 second timeout
                        })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
/**
 * Prechecks for if user can access guest passes feature
 */
function shouldCheckForPasses() {
    var _a;
    return !!(((_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.organizationUuid) &&
        (0, auth_js_1.isClaudeAISubscriber)() &&
        (0, auth_js_1.getSubscriptionType)() === 'max');
}
/**
 * Check cached passes eligibility from GlobalConfig
 * Returns current cached state and cache status
 */
function checkCachedPassesEligibility() {
    var _a, _b;
    if (!shouldCheckForPasses()) {
        return {
            eligible: false,
            needsRefresh: false,
            hasCache: false,
        };
    }
    var orgId = (_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.organizationUuid;
    if (!orgId) {
        return {
            eligible: false,
            needsRefresh: false,
            hasCache: false,
        };
    }
    var config = (0, config_js_1.getGlobalConfig)();
    var cachedEntry = (_b = config.passesEligibilityCache) === null || _b === void 0 ? void 0 : _b[orgId];
    if (!cachedEntry) {
        // No cached entry, needs fetch
        return {
            eligible: false,
            needsRefresh: true,
            hasCache: false,
        };
    }
    var eligible = cachedEntry.eligible, timestamp = cachedEntry.timestamp;
    var now = Date.now();
    var needsRefresh = now - timestamp > CACHE_EXPIRATION_MS;
    return {
        eligible: eligible,
        needsRefresh: needsRefresh,
        hasCache: true,
    };
}
var CURRENCY_SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    BRL: 'R$',
    CAD: 'CA$',
    AUD: 'A$',
    NZD: 'NZ$',
    SGD: 'S$',
};
function formatCreditAmount(reward) {
    var _a;
    var symbol = (_a = CURRENCY_SYMBOLS[reward.currency]) !== null && _a !== void 0 ? _a : "".concat(reward.currency, " ");
    var amount = reward.amount_minor_units / 100;
    var formatted = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
    return "".concat(symbol).concat(formatted);
}
/**
 * Get cached referrer reward info from eligibility cache
 * Returns the reward info if the user is in a v1 campaign, null otherwise
 */
function getCachedReferrerReward() {
    var _a, _b, _c;
    var orgId = (_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.organizationUuid;
    if (!orgId)
        return null;
    var config = (0, config_js_1.getGlobalConfig)();
    var cachedEntry = (_b = config.passesEligibilityCache) === null || _b === void 0 ? void 0 : _b[orgId];
    return (_c = cachedEntry === null || cachedEntry === void 0 ? void 0 : cachedEntry.referrer_reward) !== null && _c !== void 0 ? _c : null;
}
/**
 * Get the cached remaining passes count from eligibility cache
 * Returns the number of remaining passes, or null if not available
 */
function getCachedRemainingPasses() {
    var _a, _b, _c;
    var orgId = (_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.organizationUuid;
    if (!orgId)
        return null;
    var config = (0, config_js_1.getGlobalConfig)();
    var cachedEntry = (_b = config.passesEligibilityCache) === null || _b === void 0 ? void 0 : _b[orgId];
    return (_c = cachedEntry === null || cachedEntry === void 0 ? void 0 : cachedEntry.remaining_passes) !== null && _c !== void 0 ? _c : null;
}
/**
 * Fetch passes eligibility and store in GlobalConfig
 * Returns the fetched response or null on error
 */
function fetchAndStorePassesEligibility() {
    return __awaiter(this, void 0, void 0, function () {
        var orgId;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            // Return existing promise if fetch is already in progress
            if (fetchInProgress) {
                (0, debug_js_1.logForDebugging)('Passes: Reusing in-flight eligibility fetch');
                return [2 /*return*/, fetchInProgress];
            }
            orgId = (_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.organizationUuid;
            if (!orgId) {
                return [2 /*return*/, null];
            }
            // Store the promise to share with concurrent calls
            fetchInProgress = (function () { return __awaiter(_this, void 0, void 0, function () {
                var response, cacheEntry_1, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, 3, 4]);
                            return [4 /*yield*/, fetchReferralEligibility()];
                        case 1:
                            response = _a.sent();
                            cacheEntry_1 = __assign(__assign({}, response), { timestamp: Date.now() });
                            (0, config_js_1.saveGlobalConfig)(function (current) {
                                var _a;
                                return (__assign(__assign({}, current), { passesEligibilityCache: __assign(__assign({}, current.passesEligibilityCache), (_a = {}, _a[orgId] = cacheEntry_1, _a)) }));
                            });
                            (0, debug_js_1.logForDebugging)("Passes eligibility cached for org ".concat(orgId, ": ").concat(response.eligible));
                            return [2 /*return*/, response];
                        case 2:
                            error_1 = _a.sent();
                            (0, debug_js_1.logForDebugging)('Failed to fetch and cache passes eligibility');
                            (0, log_js_1.logError)(error_1);
                            return [2 /*return*/, null];
                        case 3:
                            // Clear the promise when done
                            fetchInProgress = null;
                            return [7 /*endfinally*/];
                        case 4: return [2 /*return*/];
                    }
                });
            }); })();
            return [2 /*return*/, fetchInProgress];
        });
    });
}
/**
 * Get cached passes eligibility data or fetch if needed
 * Main entry point for all eligibility checks
 *
 * This function never blocks on network - it returns cached data immediately
 * and fetches in the background if needed. On cold start (no cache), it returns
 * null and the passes command won't be available until the next session.
 */
function getCachedOrFetchPassesEligibility() {
    return __awaiter(this, void 0, void 0, function () {
        var orgId, config, cachedEntry, now, timestamp_1, response_1, timestamp, response;
        var _a, _b;
        return __generator(this, function (_c) {
            if (!shouldCheckForPasses()) {
                return [2 /*return*/, null];
            }
            orgId = (_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.organizationUuid;
            if (!orgId) {
                return [2 /*return*/, null];
            }
            config = (0, config_js_1.getGlobalConfig)();
            cachedEntry = (_b = config.passesEligibilityCache) === null || _b === void 0 ? void 0 : _b[orgId];
            now = Date.now();
            // No cache - trigger background fetch and return null (non-blocking)
            // The passes command won't be available this session, but will be next time
            if (!cachedEntry) {
                (0, debug_js_1.logForDebugging)('Passes: No cache, fetching eligibility in background (command unavailable this session)');
                void fetchAndStorePassesEligibility();
                return [2 /*return*/, null];
            }
            // Cache exists but is stale - return stale cache and trigger background refresh
            if (now - cachedEntry.timestamp > CACHE_EXPIRATION_MS) {
                (0, debug_js_1.logForDebugging)('Passes: Cache stale, returning cached data and refreshing in background');
                void fetchAndStorePassesEligibility(); // Background refresh
                timestamp_1 = cachedEntry.timestamp, response_1 = __rest(cachedEntry, ["timestamp"]);
                return [2 /*return*/, response_1];
            }
            // Cache is fresh - return it immediately
            (0, debug_js_1.logForDebugging)('Passes: Using fresh cached eligibility data');
            timestamp = cachedEntry.timestamp, response = __rest(cachedEntry, ["timestamp"]);
            return [2 /*return*/, response];
        });
    });
}
/**
 * Prefetch passes eligibility on startup
 */
function prefetchPassesEligibility() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Skip network requests if nonessential traffic is disabled
            if ((0, privacyLevel_js_1.isEssentialTrafficOnly)()) {
                return [2 /*return*/];
            }
            void getCachedOrFetchPassesEligibility();
            return [2 /*return*/];
        });
    });
}
