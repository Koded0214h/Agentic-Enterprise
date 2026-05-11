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
exports.getTrustedDeviceToken = getTrustedDeviceToken;
exports.clearTrustedDeviceTokenCache = clearTrustedDeviceTokenCache;
exports.clearTrustedDeviceToken = clearTrustedDeviceToken;
exports.enrollTrustedDevice = enrollTrustedDevice;
var axios_1 = require("axios");
var memoize_js_1 = require("lodash-es/memoize.js");
var os_1 = require("os");
var oauth_js_1 = require("../constants/oauth.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var debug_js_1 = require("../utils/debug.js");
var errors_js_1 = require("../utils/errors.js");
var privacyLevel_js_1 = require("../utils/privacyLevel.js");
var index_js_1 = require("../utils/secureStorage/index.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
/**
 * Trusted device token source for bridge (remote-control) sessions.
 *
 * Bridge sessions have SecurityTier=ELEVATED on the server (CCR v2).
 * The server gates ConnectBridgeWorker on its own flag
 * (sessions_elevated_auth_enforcement in Anthropic Main); this CLI-side
 * flag controls whether the CLI sends X-Trusted-Device-Token at all.
 * Two flags so rollout can be staged: flip CLI-side first (headers
 * start flowing, server still no-ops), then flip server-side.
 *
 * Enrollment (POST /auth/trusted_devices) is gated server-side by
 * account_session.created_at < 10min, so it must happen during /login.
 * Token is persistent (90d rolling expiry) and stored in keychain.
 *
 * See anthropics/anthropic#274559 (spec), #310375 (B1b tenant RPCs),
 * #295987 (B2 Python routes), #307150 (C1' CCR v2 gate).
 */
var TRUSTED_DEVICE_GATE = 'tengu_sessions_elevated_auth_enforcement';
function isGateEnabled() {
    return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)(TRUSTED_DEVICE_GATE, false);
}
// Memoized — secureStorage.read() spawns a macOS `security` subprocess (~40ms).
// bridgeApi.ts calls this from getHeaders() on every poll/heartbeat/ack.
// Cache cleared after enrollment (below) and on logout (clearAuthRelatedCaches).
//
// Only the storage read is memoized — the GrowthBook gate is checked live so
// that a gate flip after GrowthBook refresh takes effect without a restart.
var readStoredToken = (0, memoize_js_1.default)(function () {
    var _a;
    // Env var takes precedence for testing/canary.
    var envToken = process.env.CLAUDE_TRUSTED_DEVICE_TOKEN;
    if (envToken) {
        return envToken;
    }
    return (_a = (0, index_js_1.getSecureStorage)().read()) === null || _a === void 0 ? void 0 : _a.trustedDeviceToken;
});
function getTrustedDeviceToken() {
    if (!isGateEnabled()) {
        return undefined;
    }
    return readStoredToken();
}
function clearTrustedDeviceTokenCache() {
    var _a, _b;
    (_b = (_a = readStoredToken.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
/**
 * Clear the stored trusted device token from secure storage and the memo cache.
 * Called before enrollTrustedDevice() during /login so a stale token from the
 * previous account isn't sent as X-Trusted-Device-Token while enrollment is
 * in-flight (enrollTrustedDevice is async — bridge API calls between login and
 * enrollment completion would otherwise still read the old cached token).
 */
function clearTrustedDeviceToken() {
    var _a, _b;
    if (!isGateEnabled()) {
        return;
    }
    var secureStorage = (0, index_js_1.getSecureStorage)();
    try {
        var data = secureStorage.read();
        if (data === null || data === void 0 ? void 0 : data.trustedDeviceToken) {
            delete data.trustedDeviceToken;
            secureStorage.update(data);
        }
    }
    catch (_c) {
        // Best-effort — don't block login if storage is inaccessible
    }
    (_b = (_a = readStoredToken.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
/**
 * Enroll this device via POST /auth/trusted_devices and persist the token
 * to keychain. Best-effort — logs and returns on failure so callers
 * (post-login hooks) don't block the login flow.
 *
 * The server gates enrollment on account_session.created_at < 10min, so
 * this must be called immediately after a fresh /login. Calling it later
 * (e.g. lazy enrollment on /bridge 403) will fail with 403 stale_session.
 */
function enrollTrustedDevice() {
    return __awaiter(this, void 0, void 0, function () {
        var getClaudeAIOAuthTokens, accessToken, secureStorage, baseUrl, response, err_1, token, storageData, result, err_2;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, growthbook_js_1.checkGate_CACHED_OR_BLOCKING)(TRUSTED_DEVICE_GATE)];
                case 1:
                    // checkGate_CACHED_OR_BLOCKING awaits any in-flight GrowthBook re-init
                    // (triggered by refreshGrowthBookAfterAuthChange in login.tsx) before
                    // reading the gate, so we get the post-refresh value.
                    if (!(_g.sent())) {
                        (0, debug_js_1.logForDebugging)("[trusted-device] Gate ".concat(TRUSTED_DEVICE_GATE, " is off, skipping enrollment"));
                        return [2 /*return*/];
                    }
                    // If CLAUDE_TRUSTED_DEVICE_TOKEN is set (e.g. by an enterprise wrapper),
                    // skip enrollment — the env var takes precedence in readStoredToken() so
                    // any enrolled token would be shadowed and never used.
                    if (process.env.CLAUDE_TRUSTED_DEVICE_TOKEN) {
                        (0, debug_js_1.logForDebugging)('[trusted-device] CLAUDE_TRUSTED_DEVICE_TOKEN env var is set, skipping enrollment (env var takes precedence)');
                        return [2 /*return*/];
                    }
                    getClaudeAIOAuthTokens = require('../utils/auth.js').getClaudeAIOAuthTokens;
                    accessToken = (_a = getClaudeAIOAuthTokens()) === null || _a === void 0 ? void 0 : _a.accessToken;
                    if (!accessToken) {
                        (0, debug_js_1.logForDebugging)('[trusted-device] No OAuth token, skipping enrollment');
                        return [2 /*return*/];
                    }
                    secureStorage = (0, index_js_1.getSecureStorage)();
                    if ((0, privacyLevel_js_1.isEssentialTrafficOnly)()) {
                        (0, debug_js_1.logForDebugging)('[trusted-device] Essential traffic only, skipping enrollment');
                        return [2 /*return*/];
                    }
                    baseUrl = (0, oauth_js_1.getOauthConfig)().BASE_API_URL;
                    response = void 0;
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.post("".concat(baseUrl, "/api/auth/trusted_devices"), { display_name: "Claude Code on ".concat((0, os_1.hostname)(), " \u00B7 ").concat(process.platform) }, {
                            headers: {
                                Authorization: "Bearer ".concat(accessToken),
                                'Content-Type': 'application/json',
                            },
                            timeout: 10000,
                            validateStatus: function (s) { return s < 500; },
                        })];
                case 3:
                    response = _g.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _g.sent();
                    (0, debug_js_1.logForDebugging)("[trusted-device] Enrollment request failed: ".concat((0, errors_js_1.errorMessage)(err_1)));
                    return [2 /*return*/];
                case 5:
                    if (response.status !== 200 && response.status !== 201) {
                        (0, debug_js_1.logForDebugging)("[trusted-device] Enrollment failed ".concat(response.status, ": ").concat((0, slowOperations_js_1.jsonStringify)(response.data).slice(0, 200)));
                        return [2 /*return*/];
                    }
                    token = (_b = response.data) === null || _b === void 0 ? void 0 : _b.device_token;
                    if (!token || typeof token !== 'string') {
                        (0, debug_js_1.logForDebugging)('[trusted-device] Enrollment response missing device_token field');
                        return [2 /*return*/];
                    }
                    try {
                        storageData = secureStorage.read();
                        if (!storageData) {
                            (0, debug_js_1.logForDebugging)('[trusted-device] Cannot read storage, skipping token persist');
                            return [2 /*return*/];
                        }
                        storageData.trustedDeviceToken = token;
                        result = secureStorage.update(storageData);
                        if (!result.success) {
                            (0, debug_js_1.logForDebugging)("[trusted-device] Failed to persist token: ".concat((_c = result.warning) !== null && _c !== void 0 ? _c : 'unknown'));
                            return [2 /*return*/];
                        }
                        (_e = (_d = readStoredToken.cache) === null || _d === void 0 ? void 0 : _d.clear) === null || _e === void 0 ? void 0 : _e.call(_d);
                        (0, debug_js_1.logForDebugging)("[trusted-device] Enrolled device_id=".concat((_f = response.data.device_id) !== null && _f !== void 0 ? _f : 'unknown'));
                    }
                    catch (err) {
                        (0, debug_js_1.logForDebugging)("[trusted-device] Storage write failed: ".concat((0, errors_js_1.errorMessage)(err)));
                    }
                    return [3 /*break*/, 7];
                case 6:
                    err_2 = _g.sent();
                    (0, debug_js_1.logForDebugging)("[trusted-device] Enrollment error: ".concat((0, errors_js_1.errorMessage)(err_2)));
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
