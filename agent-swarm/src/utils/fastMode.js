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
exports.onOrgFastModeChanged = exports.onFastModeOverageRejection = exports.onCooldownExpired = exports.onCooldownTriggered = exports.FAST_MODE_MODEL_DISPLAY = void 0;
exports.isFastModeEnabled = isFastModeEnabled;
exports.isFastModeAvailable = isFastModeAvailable;
exports.getFastModeUnavailableReason = getFastModeUnavailableReason;
exports.getFastModeModel = getFastModeModel;
exports.getInitialFastModeSetting = getInitialFastModeSetting;
exports.isFastModeSupportedByModel = isFastModeSupportedByModel;
exports.getFastModeRuntimeState = getFastModeRuntimeState;
exports.triggerFastModeCooldown = triggerFastModeCooldown;
exports.clearFastModeCooldown = clearFastModeCooldown;
exports.handleFastModeRejectedByAPI = handleFastModeRejectedByAPI;
exports.handleFastModeOverageRejection = handleFastModeOverageRejection;
exports.isFastModeCooldown = isFastModeCooldown;
exports.getFastModeState = getFastModeState;
exports.resolveFastModeStatusFromCache = resolveFastModeStatusFromCache;
exports.prefetchFastModeStatus = prefetchFastModeStatus;
var axios_1 = require("axios");
var oauth_js_1 = require("src/constants/oauth.js");
var growthbook_js_1 = require("src/services/analytics/growthbook.js");
var state_js_1 = require("../bootstrap/state.js");
var index_js_1 = require("../services/analytics/index.js");
var auth_js_1 = require("./auth.js");
var bundledMode_js_1 = require("./bundledMode.js");
var config_js_1 = require("./config.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var model_js_1 = require("./model/model.js");
var providers_js_1 = require("./model/providers.js");
var privacyLevel_js_1 = require("./privacyLevel.js");
var settings_js_1 = require("./settings/settings.js");
var signal_js_1 = require("./signal.js");
function isFastModeEnabled() {
    return !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_FAST_MODE);
}
function isFastModeAvailable() {
    if (!isFastModeEnabled()) {
        return false;
    }
    return getFastModeUnavailableReason() === null;
}
function getDisabledReasonMessage(disabledReason, authType) {
    switch (disabledReason) {
        case 'free':
            return authType === 'oauth'
                ? 'Fast mode requires a paid subscription'
                : 'Fast mode unavailable during evaluation. Please purchase credits.';
        case 'preference':
            return 'Fast mode has been disabled by your organization';
        case 'extra_usage_disabled':
            // Only OAuth users can have extra_usage_disabled; console users don't have this concept
            return 'Fast mode requires extra usage billing · /extra-usage to enable';
        case 'network_error':
            return 'Fast mode unavailable due to network connectivity issues';
        case 'unknown':
            return 'Fast mode is currently unavailable';
    }
}
function getFastModeUnavailableReason() {
    var _a;
    if (!isFastModeEnabled()) {
        return 'Fast mode is not available';
    }
    var statigReason = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_penguins_off', null);
    // Statsig reason has priority over other reasons.
    if (statigReason !== null) {
        (0, debug_js_1.logForDebugging)("Fast mode unavailable: ".concat(statigReason));
        return statigReason;
    }
    // Previously, fast mode required the native binary (bun build). This is no
    // longer necessary, but we keep this option behind a flag just in case.
    if (!(0, bundledMode_js_1.isInBundledMode)() &&
        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_marble_sandcastle', false)) {
        return 'Fast mode requires the native binary · Install from: https://claude.com/product/claude-code';
    }
    // Not available in the SDK unless explicitly opted in via --settings.
    // Assistant daemon mode is exempt — it's first-party orchestration, and
    // kairosActive is set before this check runs (main.tsx:~1626 vs ~3249).
    if ((0, state_js_1.getIsNonInteractiveSession)() &&
        (0, state_js_1.preferThirdPartyAuthentication)() &&
        !(0, state_js_1.getKairosActive)()) {
        var flagFastMode = (_a = (0, settings_js_1.getSettingsForSource)('flagSettings')) === null || _a === void 0 ? void 0 : _a.fastMode;
        if (!flagFastMode) {
            var reason = 'Fast mode is not available in the Agent SDK';
            (0, debug_js_1.logForDebugging)("Fast mode unavailable: ".concat(reason));
            return reason;
        }
    }
    // Only available for 1P (not Bedrock/Vertex/Foundry)
    if ((0, providers_js_1.getAPIProvider)() !== 'firstParty') {
        var reason = 'Fast mode is not available on Bedrock, Vertex, or Foundry';
        (0, debug_js_1.logForDebugging)("Fast mode unavailable: ".concat(reason));
        return reason;
    }
    if (orgStatus.status === 'disabled') {
        if (orgStatus.reason === 'network_error' ||
            orgStatus.reason === 'unknown') {
            // The org check can fail behind corporate proxies that block the
            // endpoint. We add CLAUDE_CODE_SKIP_FAST_MODE_NETWORK_ERRORS=1 to
            // bypass this check in the CC binary. This is OK since we have
            // another check in the API to error out when disabled by org.
            if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SKIP_FAST_MODE_NETWORK_ERRORS)) {
                return null;
            }
        }
        var authType = (0, auth_js_1.getClaudeAIOAuthTokens)() !== null ? 'oauth' : 'api-key';
        var reason = getDisabledReasonMessage(orgStatus.reason, authType);
        (0, debug_js_1.logForDebugging)("Fast mode unavailable: ".concat(reason));
        return reason;
    }
    return null;
}
// @[MODEL LAUNCH]: Update supported Fast Mode models.
exports.FAST_MODE_MODEL_DISPLAY = 'Opus 4.6';
function getFastModeModel() {
    return 'opus' + ((0, model_js_1.isOpus1mMergeEnabled)() ? '[1m]' : '');
}
function getInitialFastModeSetting(model) {
    if (!isFastModeEnabled()) {
        return false;
    }
    if (!isFastModeAvailable()) {
        return false;
    }
    if (!isFastModeSupportedByModel(model)) {
        return false;
    }
    var settings = (0, settings_js_1.getInitialSettings)();
    // If per-session opt-in is required, fast mode starts off each session
    if (settings.fastModePerSessionOptIn) {
        return false;
    }
    return settings.fastMode === true;
}
function isFastModeSupportedByModel(modelSetting) {
    if (!isFastModeEnabled()) {
        return false;
    }
    var model = modelSetting !== null && modelSetting !== void 0 ? modelSetting : (0, model_js_1.getDefaultMainLoopModelSetting)();
    var parsedModel = (0, model_js_1.parseUserSpecifiedModel)(model);
    return parsedModel.toLowerCase().includes('opus-4-6');
}
var runtimeState = { status: 'active' };
var hasLoggedCooldownExpiry = false;
var cooldownTriggered = (0, signal_js_1.createSignal)();
var cooldownExpired = (0, signal_js_1.createSignal)();
exports.onCooldownTriggered = cooldownTriggered.subscribe;
exports.onCooldownExpired = cooldownExpired.subscribe;
function getFastModeRuntimeState() {
    if (runtimeState.status === 'cooldown' &&
        Date.now() >= runtimeState.resetAt) {
        if (isFastModeEnabled() && !hasLoggedCooldownExpiry) {
            (0, debug_js_1.logForDebugging)('Fast mode cooldown expired, re-enabling fast mode');
            hasLoggedCooldownExpiry = true;
            cooldownExpired.emit();
        }
        runtimeState = { status: 'active' };
    }
    return runtimeState;
}
function triggerFastModeCooldown(resetTimestamp, reason) {
    if (!isFastModeEnabled()) {
        return;
    }
    runtimeState = { status: 'cooldown', resetAt: resetTimestamp, reason: reason };
    hasLoggedCooldownExpiry = false;
    var cooldownDurationMs = resetTimestamp - Date.now();
    (0, debug_js_1.logForDebugging)("Fast mode cooldown triggered (".concat(reason, "), duration ").concat(Math.round(cooldownDurationMs / 1000), "s"));
    (0, index_js_1.logEvent)('tengu_fast_mode_fallback_triggered', {
        cooldown_duration_ms: cooldownDurationMs,
        cooldown_reason: reason,
    });
    cooldownTriggered.emit(resetTimestamp, reason);
}
function clearFastModeCooldown() {
    runtimeState = { status: 'active' };
}
/**
 * Called when the API rejects a fast mode request (e.g., 400 "Fast mode is
 * not enabled for your organization"). Permanently disables fast mode using
 * the same flow as when the prefetch discovers the org has it disabled.
 */
function handleFastModeRejectedByAPI() {
    if (orgStatus.status === 'disabled') {
        return;
    }
    orgStatus = { status: 'disabled', reason: 'preference' };
    (0, settings_js_1.updateSettingsForSource)('userSettings', { fastMode: undefined });
    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { penguinModeOrgEnabled: false })); });
    orgFastModeChange.emit(false);
}
// --- Overage rejection listeners ---
// Fired when a 429 indicates fast mode was rejected because extra usage
// (overage billing) is not available. Distinct from org-level disabling.
var overageRejection = (0, signal_js_1.createSignal)();
exports.onFastModeOverageRejection = overageRejection.subscribe;
function getOverageDisabledMessage(reason) {
    switch (reason) {
        case 'out_of_credits':
            return 'Fast mode disabled · extra usage credits exhausted';
        case 'org_level_disabled':
        case 'org_service_level_disabled':
            return 'Fast mode disabled · extra usage disabled by your organization';
        case 'org_level_disabled_until':
            return 'Fast mode disabled · extra usage spending cap reached';
        case 'member_level_disabled':
            return 'Fast mode disabled · extra usage disabled for your account';
        case 'seat_tier_level_disabled':
        case 'seat_tier_zero_credit_limit':
        case 'member_zero_credit_limit':
            return 'Fast mode disabled · extra usage not available for your plan';
        case 'overage_not_provisioned':
        case 'no_limits_configured':
            return 'Fast mode requires extra usage billing · /extra-usage to enable';
        default:
            return 'Fast mode disabled · extra usage not available';
    }
}
function isOutOfCreditsReason(reason) {
    return reason === 'org_level_disabled_until' || reason === 'out_of_credits';
}
/**
 * Called when a 429 indicates fast mode was rejected because extra usage
 * is not available. Permanently disables fast mode (unless the user has
 * ran out of credits) and notifies with a reason-specific message.
 */
function handleFastModeOverageRejection(reason) {
    var message = getOverageDisabledMessage(reason);
    (0, debug_js_1.logForDebugging)("Fast mode overage rejection: ".concat(reason !== null && reason !== void 0 ? reason : 'unknown', " \u2014 ").concat(message));
    (0, index_js_1.logEvent)('tengu_fast_mode_overage_rejected', {
        overage_disabled_reason: (reason !== null && reason !== void 0 ? reason : 'unknown'),
    });
    // Disable fast mode permanently unless the user has ran out of credits
    if (!isOutOfCreditsReason(reason)) {
        (0, settings_js_1.updateSettingsForSource)('userSettings', { fastMode: undefined });
        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { penguinModeOrgEnabled: false })); });
    }
    overageRejection.emit(message);
}
function isFastModeCooldown() {
    return getFastModeRuntimeState().status === 'cooldown';
}
function getFastModeState(model, fastModeUserEnabled) {
    var enabled = isFastModeEnabled() &&
        isFastModeAvailable() &&
        !!fastModeUserEnabled &&
        isFastModeSupportedByModel(model);
    if (enabled && isFastModeCooldown()) {
        return 'cooldown';
    }
    if (enabled) {
        return 'on';
    }
    return 'off';
}
var orgStatus = { status: 'pending' };
// Listeners notified when org-level fast mode status changes
var orgFastModeChange = (0, signal_js_1.createSignal)();
exports.onOrgFastModeChanged = orgFastModeChange.subscribe;
function fetchFastModeStatus(auth) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, headers, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/claude_code_penguin_mode");
                    headers = 'accessToken' in auth
                        ? {
                            Authorization: "Bearer ".concat(auth.accessToken),
                            'anthropic-beta': oauth_js_1.OAUTH_BETA_HEADER,
                        }
                        : { 'x-api-key': auth.apiKey };
                    return [4 /*yield*/, axios_1.default.get(endpoint, { headers: headers })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
var PREFETCH_MIN_INTERVAL_MS = 30000;
var lastPrefetchAt = 0;
var inflightPrefetch = null;
/**
 * Resolve orgStatus from the persisted cache without making any API calls.
 * Used when startup prefetches are throttled to avoid hitting the network
 * while still making fast mode availability checks work.
 */
function resolveFastModeStatusFromCache() {
    if (!isFastModeEnabled()) {
        return;
    }
    if (orgStatus.status !== 'pending') {
        return;
    }
    var isAnt = process.env.USER_TYPE === 'ant';
    var cachedEnabled = (0, config_js_1.getGlobalConfig)().penguinModeOrgEnabled === true;
    orgStatus =
        isAnt || cachedEnabled
            ? { status: 'enabled' }
            : { status: 'disabled', reason: 'unknown' };
}
function prefetchFastModeStatus() {
    return __awaiter(this, void 0, void 0, function () {
        function doFetch() {
            return __awaiter(this, void 0, void 0, function () {
                var status_1, err_1, isAuthError, failedAccessToken, previousEnabled, err_2, isAnt, cachedEnabled;
                var _a, _b, _c, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            _g.trys.push([0, 11, 12, 13]);
                            _g.label = 1;
                        case 1:
                            _g.trys.push([1, 3, , 10]);
                            return [4 /*yield*/, fetchWithCurrentAuth()];
                        case 2:
                            status_1 = _g.sent();
                            return [3 /*break*/, 10];
                        case 3:
                            err_1 = _g.sent();
                            isAuthError = axios_1.default.isAxiosError(err_1) &&
                                (((_a = err_1.response) === null || _a === void 0 ? void 0 : _a.status) === 401 ||
                                    (((_b = err_1.response) === null || _b === void 0 ? void 0 : _b.status) === 403 &&
                                        typeof ((_c = err_1.response) === null || _c === void 0 ? void 0 : _c.data) === 'string' &&
                                        err_1.response.data.includes('OAuth token has been revoked')));
                            if (!isAuthError) return [3 /*break*/, 8];
                            failedAccessToken = (_d = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _d === void 0 ? void 0 : _d.accessToken;
                            if (!failedAccessToken) return [3 /*break*/, 6];
                            return [4 /*yield*/, (0, auth_js_1.handleOAuth401Error)(failedAccessToken)];
                        case 4:
                            _g.sent();
                            return [4 /*yield*/, fetchWithCurrentAuth()];
                        case 5:
                            status_1 = _g.sent();
                            return [3 /*break*/, 7];
                        case 6: throw err_1;
                        case 7: return [3 /*break*/, 9];
                        case 8: throw err_1;
                        case 9: return [3 /*break*/, 10];
                        case 10:
                            previousEnabled = orgStatus.status !== 'pending'
                                ? orgStatus.status === 'enabled'
                                : (0, config_js_1.getGlobalConfig)().penguinModeOrgEnabled;
                            orgStatus = status_1.enabled
                                ? { status: 'enabled' }
                                : {
                                    status: 'disabled',
                                    reason: (_e = status_1.disabled_reason) !== null && _e !== void 0 ? _e : 'preference',
                                };
                            if (previousEnabled !== status_1.enabled) {
                                // When org disables fast mode, permanently turn off the user's fast mode setting
                                if (!status_1.enabled) {
                                    (0, settings_js_1.updateSettingsForSource)('userSettings', { fastMode: undefined });
                                }
                                (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { penguinModeOrgEnabled: status_1.enabled })); });
                                orgFastModeChange.emit(status_1.enabled);
                            }
                            (0, debug_js_1.logForDebugging)("Org fast mode: ".concat(status_1.enabled ? 'enabled' : "disabled (".concat((_f = status_1.disabled_reason) !== null && _f !== void 0 ? _f : 'preference', ")")));
                            return [3 /*break*/, 13];
                        case 11:
                            err_2 = _g.sent();
                            isAnt = process.env.USER_TYPE === 'ant';
                            cachedEnabled = (0, config_js_1.getGlobalConfig)().penguinModeOrgEnabled === true;
                            orgStatus =
                                isAnt || cachedEnabled
                                    ? { status: 'enabled' }
                                    : { status: 'disabled', reason: 'network_error' };
                            (0, debug_js_1.logForDebugging)("Failed to fetch org fast mode status, defaulting to ".concat(orgStatus.status === 'enabled' ? 'enabled (cached)' : 'disabled (network_error)', ": ").concat(err_2), { level: 'error' });
                            (0, index_js_1.logEvent)('tengu_org_penguin_mode_fetch_failed', {});
                            return [3 /*break*/, 13];
                        case 12:
                            inflightPrefetch = null;
                            return [7 /*endfinally*/];
                        case 13: return [2 /*return*/];
                    }
                });
            });
        }
        var apiKey, hasUsableOAuth, isAnt, cachedEnabled, now, fetchWithCurrentAuth;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            // Skip network requests if nonessential traffic is disabled
            if ((0, privacyLevel_js_1.isEssentialTrafficOnly)()) {
                return [2 /*return*/];
            }
            if (!isFastModeEnabled()) {
                return [2 /*return*/];
            }
            if (inflightPrefetch) {
                (0, debug_js_1.logForDebugging)('Fast mode prefetch in progress, returning in-flight promise');
                return [2 /*return*/, inflightPrefetch];
            }
            apiKey = (0, auth_js_1.getAnthropicApiKey)();
            hasUsableOAuth = ((_a = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _a === void 0 ? void 0 : _a.accessToken) && (0, auth_js_1.hasProfileScope)();
            if (!hasUsableOAuth && !apiKey) {
                isAnt = process.env.USER_TYPE === 'ant';
                cachedEnabled = (0, config_js_1.getGlobalConfig)().penguinModeOrgEnabled === true;
                orgStatus =
                    isAnt || cachedEnabled
                        ? { status: 'enabled' }
                        : { status: 'disabled', reason: 'preference' };
                return [2 /*return*/];
            }
            now = Date.now();
            if (now - lastPrefetchAt < PREFETCH_MIN_INTERVAL_MS) {
                (0, debug_js_1.logForDebugging)('Skipping fast mode prefetch, fetched recently');
                return [2 /*return*/];
            }
            lastPrefetchAt = now;
            fetchWithCurrentAuth = function () { return __awaiter(_this, void 0, void 0, function () {
                var currentTokens, auth;
                return __generator(this, function (_a) {
                    currentTokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
                    auth = (currentTokens === null || currentTokens === void 0 ? void 0 : currentTokens.accessToken) && (0, auth_js_1.hasProfileScope)()
                        ? { accessToken: currentTokens.accessToken }
                        : apiKey
                            ? { apiKey: apiKey }
                            : null;
                    if (!auth) {
                        throw new Error('No auth available');
                    }
                    return [2 /*return*/, fetchFastModeStatus(auth)];
                });
            }); };
            inflightPrefetch = doFetch();
            return [2 /*return*/, inflightPrefetch];
        });
    });
}
