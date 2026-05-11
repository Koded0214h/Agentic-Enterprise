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
exports.initializeGrowthBook = void 0;
exports.onGrowthBookRefresh = onGrowthBookRefresh;
exports.hasGrowthBookEnvOverride = hasGrowthBookEnvOverride;
exports.getAllGrowthBookFeatures = getAllGrowthBookFeatures;
exports.getGrowthBookConfigOverrides = getGrowthBookConfigOverrides;
exports.setGrowthBookConfigOverride = setGrowthBookConfigOverride;
exports.clearGrowthBookConfigOverrides = clearGrowthBookConfigOverrides;
exports.getApiBaseUrlHost = getApiBaseUrlHost;
exports.getFeatureValue_DEPRECATED = getFeatureValue_DEPRECATED;
exports.getFeatureValue_CACHED_MAY_BE_STALE = getFeatureValue_CACHED_MAY_BE_STALE;
exports.getFeatureValue_CACHED_WITH_REFRESH = getFeatureValue_CACHED_WITH_REFRESH;
exports.checkStatsigFeatureGate_CACHED_MAY_BE_STALE = checkStatsigFeatureGate_CACHED_MAY_BE_STALE;
exports.checkSecurityRestrictionGate = checkSecurityRestrictionGate;
exports.checkGate_CACHED_OR_BLOCKING = checkGate_CACHED_OR_BLOCKING;
exports.refreshGrowthBookAfterAuthChange = refreshGrowthBookAfterAuthChange;
exports.resetGrowthBook = resetGrowthBook;
exports.refreshGrowthBookFeatures = refreshGrowthBookFeatures;
exports.setupPeriodicGrowthBookRefresh = setupPeriodicGrowthBookRefresh;
exports.stopPeriodicGrowthBookRefresh = stopPeriodicGrowthBookRefresh;
exports.getDynamicConfig_BLOCKS_ON_INIT = getDynamicConfig_BLOCKS_ON_INIT;
exports.getDynamicConfig_CACHED_MAY_BE_STALE = getDynamicConfig_CACHED_MAY_BE_STALE;
var growthbook_1 = require("@growthbook/growthbook");
var lodash_es_1 = require("lodash-es");
var state_js_1 = require("../../bootstrap/state.js");
var keys_js_1 = require("../../constants/keys.js");
var config_js_1 = require("../../utils/config.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var http_js_1 = require("../../utils/http.js");
var log_js_1 = require("../../utils/log.js");
var signal_js_1 = require("../../utils/signal.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var user_js_1 = require("../../utils/user.js");
var firstPartyEventLogger_js_1 = require("./firstPartyEventLogger.js");
var client = null;
// Named handler refs so resetGrowthBook can remove them to prevent accumulation
var currentBeforeExitHandler = null;
var currentExitHandler = null;
// Track whether auth was available when the client was created
// This allows us to detect when we need to recreate with fresh auth headers
var clientCreatedWithAuth = false;
var experimentDataByFeature = new Map();
// Cache for remote eval feature values - workaround for SDK not respecting remoteEval response
// The SDK's setForcedFeatures also doesn't work reliably with remoteEval
var remoteEvalFeatureValues = new Map();
// Track features accessed before init that need exposure logging
var pendingExposures = new Set();
// Track features that have already had their exposure logged this session (dedup)
// This prevents firing duplicate exposure events when getFeatureValue_CACHED_MAY_BE_STALE
// is called repeatedly in hot paths (e.g., isAutoMemoryEnabled in render loops)
var loggedExposures = new Set();
// Track re-initialization promise for security gate checks
// When GrowthBook is re-initializing (e.g., after auth change), security gate checks
// should wait for init to complete to avoid returning stale values
var reinitializingPromise = null;
var refreshed = (0, signal_js_1.createSignal)();
/** Call a listener with sync-throw and async-rejection both routed to logError. */
function callSafe(listener) {
    try {
        // Promise.resolve() normalizes sync returns and Promises so both
        // sync throws (caught by outer try) and async rejections (caught
        // by .catch) hit logError. Without the .catch, an async listener
        // that rejects becomes an unhandled rejection — the try/catch
        // only sees the Promise, not its eventual rejection.
        void Promise.resolve(listener()).catch(function (e) {
            (0, log_js_1.logError)(e);
        });
    }
    catch (e) {
        (0, log_js_1.logError)(e);
    }
}
/**
 * Register a callback to fire when GrowthBook feature values refresh.
 * Returns an unsubscribe function.
 *
 * If init has already completed with features by the time this is called
 * (remoteEvalFeatureValues is populated), the listener fires once on the
 * next microtask. This catch-up handles the race where GB's network response
 * lands before the REPL's useEffect commits — on external builds with fast
 * networks and MCP-heavy configs, init can finish in ~100ms while REPL mount
 * takes ~600ms (see #20951 external-build trace at 30.540 vs 31.046).
 *
 * Change detection is on the subscriber: the callback fires on every refresh;
 * use isEqual against your last-seen config to decide whether to act.
 */
function onGrowthBookRefresh(listener) {
    var subscribed = true;
    var unsubscribe = refreshed.subscribe(function () { return callSafe(listener); });
    if (remoteEvalFeatureValues.size > 0) {
        queueMicrotask(function () {
            // Re-check: listener may have been removed, or resetGrowthBook may have
            // cleared the Map, between registration and this microtask running.
            if (subscribed && remoteEvalFeatureValues.size > 0) {
                callSafe(listener);
            }
        });
    }
    return function () {
        subscribed = false;
        unsubscribe();
    };
}
/**
 * Parse env var overrides for GrowthBook features.
 * Set CLAUDE_INTERNAL_FC_OVERRIDES to a JSON object mapping feature keys to values
 * to bypass remote eval and disk cache. Useful for eval harnesses that need to
 * test specific feature flag configurations. Only active when USER_TYPE is 'ant'.
 *
 * Example: CLAUDE_INTERNAL_FC_OVERRIDES='{"my_feature": true, "my_config": {"key": "val"}}'
 */
var envOverrides = null;
var envOverridesParsed = false;
function getEnvOverrides() {
    if (!envOverridesParsed) {
        envOverridesParsed = true;
        if (process.env.USER_TYPE === 'ant') {
            var raw = process.env.CLAUDE_INTERNAL_FC_OVERRIDES;
            if (raw) {
                try {
                    envOverrides = JSON.parse(raw);
                    (0, debug_js_1.logForDebugging)("GrowthBook: Using env var overrides for ".concat(Object.keys(envOverrides).length, " features: ").concat(Object.keys(envOverrides).join(', ')));
                }
                catch (_a) {
                    (0, log_js_1.logError)(new Error("GrowthBook: Failed to parse CLAUDE_INTERNAL_FC_OVERRIDES: ".concat(raw)));
                }
            }
        }
    }
    return envOverrides;
}
/**
 * Check if a feature has an env-var override (CLAUDE_INTERNAL_FC_OVERRIDES).
 * When true, _CACHED_MAY_BE_STALE will return the override without touching
 * disk or network — callers can skip awaiting init for that feature.
 */
function hasGrowthBookEnvOverride(feature) {
    var overrides = getEnvOverrides();
    return overrides !== null && feature in overrides;
}
/**
 * Local config overrides set via /config Gates tab (ant-only). Checked after
 * env-var overrides — env wins so eval harnesses remain deterministic. Unlike
 * getEnvOverrides this is not memoized: the user can change overrides at
 * runtime, and getGlobalConfig() is already memory-cached (pointer-chase)
 * until the next saveGlobalConfig() invalidates it.
 */
function getConfigOverrides() {
    if (process.env.USER_TYPE !== 'ant')
        return undefined;
    try {
        return (0, config_js_1.getGlobalConfig)().growthBookOverrides;
    }
    catch (_a) {
        // getGlobalConfig() throws before configReadingAllowed is set (early
        // main.tsx startup path). Same degrade as the disk-cache fallback below.
        return undefined;
    }
}
/**
 * Enumerate all known GrowthBook features and their current resolved values
 * (not including overrides). In-memory payload first, disk cache fallback —
 * same priority as the getters. Used by the /config Gates tab.
 */
function getAllGrowthBookFeatures() {
    var _a;
    if (remoteEvalFeatureValues.size > 0) {
        return Object.fromEntries(remoteEvalFeatureValues);
    }
    return (_a = (0, config_js_1.getGlobalConfig)().cachedGrowthBookFeatures) !== null && _a !== void 0 ? _a : {};
}
function getGrowthBookConfigOverrides() {
    var _a;
    return (_a = getConfigOverrides()) !== null && _a !== void 0 ? _a : {};
}
/**
 * Set or clear a single config override. Pass undefined to clear.
 * Fires onGrowthBookRefresh listeners so systems that bake gate values into
 * long-lived objects (useMainLoopModel, useSkillsChange, etc.) rebuild —
 * otherwise overriding e.g. tengu_ant_model_override wouldn't actually
 * change the model until the next periodic refresh.
 */
function setGrowthBookConfigOverride(feature, value) {
    if (process.env.USER_TYPE !== 'ant')
        return;
    try {
        (0, config_js_1.saveGlobalConfig)(function (c) {
            var _a;
            var _b;
            var current = (_b = c.growthBookOverrides) !== null && _b !== void 0 ? _b : {};
            if (value === undefined) {
                if (!(feature in current))
                    return c;
                var _c = current, _d = feature, _1 = _c[_d], rest = __rest(_c, [typeof _d === "symbol" ? _d : _d + ""]);
                if (Object.keys(rest).length === 0) {
                    var __ = c.growthBookOverrides, configWithout = __rest(c, ["growthBookOverrides"]);
                    return configWithout;
                }
                return __assign(__assign({}, c), { growthBookOverrides: rest });
            }
            if ((0, lodash_es_1.isEqual)(current[feature], value))
                return c;
            return __assign(__assign({}, c), { growthBookOverrides: __assign(__assign({}, current), (_a = {}, _a[feature] = value, _a)) });
        });
        // Subscribers do their own change detection (see onGrowthBookRefresh docs),
        // so firing on a no-op write is fine.
        refreshed.emit();
    }
    catch (e) {
        (0, log_js_1.logError)(e);
    }
}
function clearGrowthBookConfigOverrides() {
    if (process.env.USER_TYPE !== 'ant')
        return;
    try {
        (0, config_js_1.saveGlobalConfig)(function (c) {
            if (!c.growthBookOverrides ||
                Object.keys(c.growthBookOverrides).length === 0) {
                return c;
            }
            var _ = c.growthBookOverrides, rest = __rest(c, ["growthBookOverrides"]);
            return rest;
        });
        refreshed.emit();
    }
    catch (e) {
        (0, log_js_1.logError)(e);
    }
}
/**
 * Log experiment exposure for a feature if it has experiment data.
 * Deduplicates within a session - each feature is logged at most once.
 */
function logExposureForFeature(feature) {
    // Skip if already logged this session (dedup)
    if (loggedExposures.has(feature)) {
        return;
    }
    var expData = experimentDataByFeature.get(feature);
    if (expData) {
        loggedExposures.add(feature);
        (0, firstPartyEventLogger_js_1.logGrowthBookExperimentTo1P)({
            experimentId: expData.experimentId,
            variationId: expData.variationId,
            userAttributes: getUserAttributes(),
            experimentMetadata: {
                feature_id: feature,
            },
        });
    }
}
/**
 * Process a remote eval payload from the GrowthBook server and populate
 * local caches. Called after both initial client.init() and after
 * client.refreshFeatures() so that _BLOCKS_ON_INIT callers see fresh values
 * across the process lifetime, not just init-time snapshots.
 *
 * Without this running on refresh, remoteEvalFeatureValues freezes at its
 * init-time snapshot and getDynamicConfig_BLOCKS_ON_INIT returns stale values
 * for the entire process lifetime — which broke the tengu_max_version_config
 * kill switch for long-running sessions.
 */
function processRemoteEvalPayload(gbClient) {
    return __awaiter(this, void 0, void 0, function () {
        var payload, transformedFeatures, _i, _a, _b, key, feature, f, expResult, exp, _c, _d, _e, key, feature, v;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    payload = gbClient.getPayload();
                    // Empty object is truthy — without the length check, `{features: {}}`
                    // (transient server bug, truncated response) would pass, clear the maps
                    // below, return true, and syncRemoteEvalToDisk would wholesale-write `{}`
                    // to disk: total flag blackout for every process sharing ~/.claude.json.
                    if (!(payload === null || payload === void 0 ? void 0 : payload.features) || Object.keys(payload.features).length === 0) {
                        return [2 /*return*/, false];
                    }
                    // Clear before rebuild so features removed between refreshes don't
                    // leave stale ghost entries that short-circuit getFeatureValueInternal.
                    experimentDataByFeature.clear();
                    transformedFeatures = {};
                    for (_i = 0, _a = Object.entries(payload.features); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], feature = _b[1];
                        f = feature;
                        if ('value' in f && !('defaultValue' in f)) {
                            transformedFeatures[key] = __assign(__assign({}, f), { defaultValue: f.value });
                        }
                        else {
                            transformedFeatures[key] = f;
                        }
                        // Store experiment data for later logging when feature is accessed
                        if (f.source === 'experiment' && f.experimentResult) {
                            expResult = f.experimentResult;
                            exp = f.experiment;
                            if ((exp === null || exp === void 0 ? void 0 : exp.key) && expResult.variationId !== undefined) {
                                experimentDataByFeature.set(key, {
                                    experimentId: exp.key,
                                    variationId: expResult.variationId,
                                });
                            }
                        }
                    }
                    // Re-set the payload with transformed features
                    return [4 /*yield*/, gbClient.setPayload(__assign(__assign({}, payload), { features: transformedFeatures }))
                        // WORKAROUND: Cache the evaluated values directly from remote eval response.
                        // The SDK's evalFeature() tries to re-evaluate rules locally, ignoring the
                        // pre-evaluated 'value' from remoteEval. setForcedFeatures also doesn't work
                        // reliably. So we cache values ourselves and use them in getFeatureValueInternal.
                    ];
                case 1:
                    // Re-set the payload with transformed features
                    _f.sent();
                    // WORKAROUND: Cache the evaluated values directly from remote eval response.
                    // The SDK's evalFeature() tries to re-evaluate rules locally, ignoring the
                    // pre-evaluated 'value' from remoteEval. setForcedFeatures also doesn't work
                    // reliably. So we cache values ourselves and use them in getFeatureValueInternal.
                    remoteEvalFeatureValues.clear();
                    for (_c = 0, _d = Object.entries(transformedFeatures); _c < _d.length; _c++) {
                        _e = _d[_c], key = _e[0], feature = _e[1];
                        v = 'value' in feature ? feature.value : feature.defaultValue;
                        if (v !== undefined) {
                            remoteEvalFeatureValues.set(key, v);
                        }
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
/**
 * Write the complete remoteEvalFeatureValues map to disk. Called exactly
 * once per successful processRemoteEvalPayload — never from a failure path,
 * so init-timeout poisoning is structurally impossible (the .catch() at init
 * never reaches here).
 *
 * Wholesale replace (not merge): features deleted server-side are dropped
 * from disk on the next successful payload. Ant builds ⊇ external, so
 * switching builds is safe — the write is always a complete answer for this
 * process's SDK key.
 */
function syncRemoteEvalToDisk() {
    var fresh = Object.fromEntries(remoteEvalFeatureValues);
    var config = (0, config_js_1.getGlobalConfig)();
    if ((0, lodash_es_1.isEqual)(config.cachedGrowthBookFeatures, fresh)) {
        return;
    }
    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { cachedGrowthBookFeatures: fresh })); });
}
/**
 * Check if GrowthBook operations should be enabled
 */
function isGrowthBookEnabled() {
    // GrowthBook depends on 1P event logging.
    return (0, firstPartyEventLogger_js_1.is1PEventLoggingEnabled)();
}
/**
 * Hostname of ANTHROPIC_BASE_URL when it points at a non-Anthropic proxy.
 *
 * Enterprise-proxy deployments (Epic, Marble, etc.) typically use
 * apiKeyHelper auth, which means isAnthropicAuthEnabled() returns false and
 * organizationUUID/accountUUID/email are all absent from GrowthBook
 * attributes. Without this, there's no stable attribute to target them on
 * — only per-device IDs. See src/utils/auth.ts isAnthropicAuthEnabled().
 *
 * Returns undefined for unset/default (api.anthropic.com) so the attribute
 * is absent for direct-API users. Hostname only — no path/query/creds.
 */
function getApiBaseUrlHost() {
    var baseUrl = process.env.ANTHROPIC_BASE_URL;
    if (!baseUrl)
        return undefined;
    try {
        var host = new URL(baseUrl).host;
        if (host === 'api.anthropic.com')
            return undefined;
        return host;
    }
    catch (_a) {
        return undefined;
    }
}
/**
 * Get user attributes for GrowthBook from CoreUserData
 */
function getUserAttributes() {
    var _a;
    var user = (0, user_js_1.getUserForGrowthBook)();
    // For ants, always try to include email from OAuth config even if ANTHROPIC_API_KEY is set.
    // This ensures GrowthBook targeting by email works regardless of auth method.
    var email = user.email;
    if (!email && process.env.USER_TYPE === 'ant') {
        email = (_a = (0, config_js_1.getGlobalConfig)().oauthAccount) === null || _a === void 0 ? void 0 : _a.emailAddress;
    }
    var apiBaseUrlHost = getApiBaseUrlHost();
    var attributes = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ id: user.deviceId, sessionId: user.sessionId, deviceID: user.deviceId, platform: user.platform }, (apiBaseUrlHost && { apiBaseUrlHost: apiBaseUrlHost })), (user.organizationUuid && { organizationUUID: user.organizationUuid })), (user.accountUuid && { accountUUID: user.accountUuid })), (user.userType && { userType: user.userType })), (user.subscriptionType && { subscriptionType: user.subscriptionType })), (user.rateLimitTier && { rateLimitTier: user.rateLimitTier })), (user.firstTokenTime && { firstTokenTime: user.firstTokenTime })), (email && { email: email })), (user.appVersion && { appVersion: user.appVersion })), (user.githubActionsMetadata && {
        githubActionsMetadata: user.githubActionsMetadata,
    }));
    return attributes;
}
/**
 * Get or create the GrowthBook client instance
 */
var getGrowthBookClient = (0, lodash_es_1.memoize)(function () {
    if (!isGrowthBookEnabled()) {
        return null;
    }
    var attributes = getUserAttributes();
    var clientKey = (0, keys_js_1.getGrowthBookClientKey)();
    if (process.env.USER_TYPE === 'ant') {
        (0, debug_js_1.logForDebugging)("GrowthBook: Creating client with clientKey=".concat(clientKey, ", attributes: ").concat((0, slowOperations_js_1.jsonStringify)(attributes)));
    }
    var baseUrl = process.env.USER_TYPE === 'ant'
        ? process.env.CLAUDE_CODE_GB_BASE_URL || 'https://api.anthropic.com/'
        : 'https://api.anthropic.com/';
    // Skip auth if trust hasn't been established yet
    // This prevents executing apiKeyHelper commands before the trust dialog
    // Non-interactive sessions implicitly have workspace trust
    // getSessionTrustAccepted() covers the case where the TrustDialog auto-resolved
    // without persisting trust for the specific CWD (e.g., home directory) —
    // showSetupScreens() sets this after the trust dialog flow completes.
    var hasTrust = (0, config_js_1.checkHasTrustDialogAccepted)() ||
        (0, state_js_1.getSessionTrustAccepted)() ||
        (0, state_js_1.getIsNonInteractiveSession)();
    var authHeaders = hasTrust
        ? (0, http_js_1.getAuthHeaders)()
        : { headers: {}, error: 'trust not established' };
    var hasAuth = !authHeaders.error;
    clientCreatedWithAuth = hasAuth;
    // Capture in local variable so the init callback operates on THIS client,
    // not a later client if reinitialization happens before init completes
    var thisClient = new growthbook_1.GrowthBook(__assign(__assign({ apiHost: baseUrl, clientKey: clientKey, attributes: attributes, remoteEval: true, 
        // Re-fetch when user ID or org changes (org change = login to different org)
        cacheKeyAttributes: ['id', 'organizationUUID'] }, (authHeaders.error
        ? {}
        : { apiHostRequestHeaders: authHeaders.headers })), (process.env.USER_TYPE === 'ant'
        ? {
            log: function (msg, ctx) {
                (0, debug_js_1.logForDebugging)("GrowthBook: ".concat(msg, " ").concat((0, slowOperations_js_1.jsonStringify)(ctx)));
            },
        }
        : {})));
    client = thisClient;
    if (!hasAuth) {
        // No auth available yet — skip HTTP init, rely on disk-cached values.
        // initializeGrowthBook() will reset and re-create with auth when available.
        return { client: thisClient, initialized: Promise.resolve() };
    }
    var initialized = thisClient
        .init({ timeout: 5000 })
        .then(function (result) { return __awaiter(void 0, void 0, void 0, function () {
        var hadFeatures, _i, pendingExposures_1, feature, features, featureKeys;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Guard: if this client was replaced by a newer one, skip processing
                    if (client !== thisClient) {
                        if (process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)('GrowthBook: Skipping init callback for replaced client');
                        }
                        return [2 /*return*/];
                    }
                    if (process.env.USER_TYPE === 'ant') {
                        (0, debug_js_1.logForDebugging)("GrowthBook initialized successfully, source: ".concat(result.source, ", success: ").concat(result.success));
                    }
                    return [4 /*yield*/, processRemoteEvalPayload(thisClient)
                        // Re-check: processRemoteEvalPayload yields at `await setPayload`.
                        // Microtask-only today (no encryption, no sticky-bucket service), but
                        // the guard at the top of this callback runs before that await;
                        // this runs after.
                    ];
                case 1:
                    hadFeatures = _a.sent();
                    // Re-check: processRemoteEvalPayload yields at `await setPayload`.
                    // Microtask-only today (no encryption, no sticky-bucket service), but
                    // the guard at the top of this callback runs before that await;
                    // this runs after.
                    if (client !== thisClient)
                        return [2 /*return*/];
                    if (hadFeatures) {
                        for (_i = 0, pendingExposures_1 = pendingExposures; _i < pendingExposures_1.length; _i++) {
                            feature = pendingExposures_1[_i];
                            logExposureForFeature(feature);
                        }
                        pendingExposures.clear();
                        syncRemoteEvalToDisk();
                        // Notify subscribers: remoteEvalFeatureValues is populated and
                        // disk is freshly synced. _CACHED_MAY_BE_STALE reads memory first
                        // (#22295), so subscribers see fresh values immediately.
                        refreshed.emit();
                    }
                    // Log what features were loaded
                    if (process.env.USER_TYPE === 'ant') {
                        features = thisClient.getFeatures();
                        if (features) {
                            featureKeys = Object.keys(features);
                            (0, debug_js_1.logForDebugging)("GrowthBook loaded ".concat(featureKeys.length, " features: ").concat(featureKeys.slice(0, 10).join(', ')).concat(featureKeys.length > 10 ? '...' : ''));
                        }
                    }
                    return [2 /*return*/];
            }
        });
    }); })
        .catch(function (error) {
        if (process.env.USER_TYPE === 'ant') {
            (0, log_js_1.logError)((0, errors_js_1.toError)(error));
        }
    });
    // Register cleanup handlers for graceful shutdown (named refs so resetGrowthBook can remove them)
    currentBeforeExitHandler = function () { return client === null || client === void 0 ? void 0 : client.destroy(); };
    currentExitHandler = function () { return client === null || client === void 0 ? void 0 : client.destroy(); };
    process.on('beforeExit', currentBeforeExitHandler);
    process.on('exit', currentExitHandler);
    return { client: thisClient, initialized: initialized };
});
/**
 * Initialize GrowthBook client (blocks until ready)
 */
exports.initializeGrowthBook = (0, lodash_es_1.memoize)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var clientWrapper, hasTrust, currentAuth;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                clientWrapper = getGrowthBookClient();
                if (!clientWrapper) {
                    return [2 /*return*/, null];
                }
                // Check if auth has become available since the client was created
                // If so, we need to recreate the client with fresh auth headers
                // Only check if trust is established to avoid triggering apiKeyHelper before trust dialog
                if (!clientCreatedWithAuth) {
                    hasTrust = (0, config_js_1.checkHasTrustDialogAccepted)() ||
                        (0, state_js_1.getSessionTrustAccepted)() ||
                        (0, state_js_1.getIsNonInteractiveSession)();
                    if (hasTrust) {
                        currentAuth = (0, http_js_1.getAuthHeaders)();
                        if (!currentAuth.error) {
                            if (process.env.USER_TYPE === 'ant') {
                                (0, debug_js_1.logForDebugging)('GrowthBook: Auth became available after client creation, reinitializing');
                            }
                            // Use resetGrowthBook to properly destroy old client and stop periodic refresh
                            // This prevents double-init where old client's init promise continues running
                            resetGrowthBook();
                            clientWrapper = getGrowthBookClient();
                            if (!clientWrapper) {
                                return [2 /*return*/, null];
                            }
                        }
                    }
                }
                return [4 /*yield*/, clientWrapper.initialized
                    // Set up periodic refresh after successful initialization
                    // This is called here (not separately) so it's always re-established after any reinit
                ];
            case 1:
                _a.sent();
                // Set up periodic refresh after successful initialization
                // This is called here (not separately) so it's always re-established after any reinit
                setupPeriodicGrowthBookRefresh();
                return [2 /*return*/, clientWrapper.client];
        }
    });
}); });
/**
 * Get a feature value with a default fallback - blocks until initialized.
 * @internal Used by both deprecated and cached functions.
 */
function getFeatureValueInternal(feature, defaultValue, logExposure) {
    return __awaiter(this, void 0, void 0, function () {
        var overrides, configOverrides, growthBookClient, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    overrides = getEnvOverrides();
                    if (overrides && feature in overrides) {
                        return [2 /*return*/, overrides[feature]];
                    }
                    configOverrides = getConfigOverrides();
                    if (configOverrides && feature in configOverrides) {
                        return [2 /*return*/, configOverrides[feature]];
                    }
                    if (!isGrowthBookEnabled()) {
                        return [2 /*return*/, defaultValue];
                    }
                    return [4 /*yield*/, (0, exports.initializeGrowthBook)()];
                case 1:
                    growthBookClient = _a.sent();
                    if (!growthBookClient) {
                        return [2 /*return*/, defaultValue];
                    }
                    if (remoteEvalFeatureValues.has(feature)) {
                        result = remoteEvalFeatureValues.get(feature);
                    }
                    else {
                        result = growthBookClient.getFeatureValue(feature, defaultValue);
                    }
                    // Log experiment exposure using stored experiment data
                    if (logExposure) {
                        logExposureForFeature(feature);
                    }
                    if (process.env.USER_TYPE === 'ant') {
                        (0, debug_js_1.logForDebugging)("GrowthBook: getFeatureValue(\"".concat(feature, "\") = ").concat((0, slowOperations_js_1.jsonStringify)(result)));
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * @deprecated Use getFeatureValue_CACHED_MAY_BE_STALE instead, which is non-blocking.
 * This function blocks on GrowthBook initialization which can slow down startup.
 */
function getFeatureValue_DEPRECATED(feature, defaultValue) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, getFeatureValueInternal(feature, defaultValue, true)];
        });
    });
}
/**
 * Get a feature value from disk cache immediately. Pure read — disk is
 * populated by syncRemoteEvalToDisk on every successful payload (init +
 * periodic refresh), not by this function.
 *
 * This is the preferred method for startup-critical paths and sync contexts.
 * The value may be stale if the cache was written by a previous process.
 */
function getFeatureValue_CACHED_MAY_BE_STALE(feature, defaultValue) {
    var _a;
    // Check env var overrides first (for eval harnesses)
    var overrides = getEnvOverrides();
    if (overrides && feature in overrides) {
        return overrides[feature];
    }
    var configOverrides = getConfigOverrides();
    if (configOverrides && feature in configOverrides) {
        return configOverrides[feature];
    }
    if (!isGrowthBookEnabled()) {
        return defaultValue;
    }
    // Log experiment exposure if data is available, otherwise defer until after init
    if (experimentDataByFeature.has(feature)) {
        logExposureForFeature(feature);
    }
    else {
        pendingExposures.add(feature);
    }
    // In-memory payload is authoritative once processRemoteEvalPayload has run.
    // Disk is also fresh by then (syncRemoteEvalToDisk runs synchronously inside
    // init), so this is correctness-equivalent to the disk read below — but it
    // skips the config JSON parse and is what onGrowthBookRefresh subscribers
    // depend on to read fresh values the instant they're notified.
    if (remoteEvalFeatureValues.has(feature)) {
        return remoteEvalFeatureValues.get(feature);
    }
    // Fall back to disk cache (survives across process restarts)
    try {
        var cached = (_a = (0, config_js_1.getGlobalConfig)().cachedGrowthBookFeatures) === null || _a === void 0 ? void 0 : _a[feature];
        return cached !== undefined ? cached : defaultValue;
    }
    catch (_b) {
        return defaultValue;
    }
}
/**
 * @deprecated Disk cache is now synced on every successful payload load
 * (init + 20min/6h periodic refresh). The per-feature TTL never fetched
 * fresh data from the server — it only re-wrote in-memory state to disk,
 * which is now redundant. Use getFeatureValue_CACHED_MAY_BE_STALE directly.
 */
function getFeatureValue_CACHED_WITH_REFRESH(feature, defaultValue, _refreshIntervalMs) {
    return getFeatureValue_CACHED_MAY_BE_STALE(feature, defaultValue);
}
/**
 * Check a Statsig feature gate value via GrowthBook, with fallback to Statsig cache.
 *
 * **MIGRATION ONLY**: This function is for migrating existing Statsig gates to GrowthBook.
 * For new features, use `getFeatureValue_CACHED_MAY_BE_STALE()` instead.
 *
 * - Checks GrowthBook disk cache first
 * - Falls back to Statsig's cachedStatsigGates during migration
 * - The value may be stale if the cache hasn't been updated recently
 *
 * @deprecated Use getFeatureValue_CACHED_MAY_BE_STALE() for new code. This function
 * exists only to support migration of existing Statsig gates.
 */
function checkStatsigFeatureGate_CACHED_MAY_BE_STALE(gate) {
    var _a, _b, _c;
    // Check env var overrides first (for eval harnesses)
    var overrides = getEnvOverrides();
    if (overrides && gate in overrides) {
        return Boolean(overrides[gate]);
    }
    var configOverrides = getConfigOverrides();
    if (configOverrides && gate in configOverrides) {
        return Boolean(configOverrides[gate]);
    }
    if (!isGrowthBookEnabled()) {
        return false;
    }
    // Log experiment exposure if data is available, otherwise defer until after init
    if (experimentDataByFeature.has(gate)) {
        logExposureForFeature(gate);
    }
    else {
        pendingExposures.add(gate);
    }
    // Return cached value immediately from disk
    // First check GrowthBook cache, then fall back to Statsig cache for migration
    var config = (0, config_js_1.getGlobalConfig)();
    var gbCached = (_a = config.cachedGrowthBookFeatures) === null || _a === void 0 ? void 0 : _a[gate];
    if (gbCached !== undefined) {
        return Boolean(gbCached);
    }
    // Fallback to Statsig cache for migration period
    return (_c = (_b = config.cachedStatsigGates) === null || _b === void 0 ? void 0 : _b[gate]) !== null && _c !== void 0 ? _c : false;
}
/**
 * Check a security restriction gate, waiting for re-init if in progress.
 *
 * Use this for security-critical gates where we need fresh values after auth changes.
 *
 * Behavior:
 * - If GrowthBook is re-initializing (e.g., after login), waits for it to complete
 * - Otherwise, returns cached value immediately (Statsig cache first, then GrowthBook)
 *
 * Statsig cache is checked first as a safety measure for security-related checks:
 * if the Statsig cache indicates the gate is enabled, we honor it.
 */
function checkSecurityRestrictionGate(gate) {
    return __awaiter(this, void 0, void 0, function () {
        var overrides, configOverrides, config, statsigCached, gbCached;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    overrides = getEnvOverrides();
                    if (overrides && gate in overrides) {
                        return [2 /*return*/, Boolean(overrides[gate])];
                    }
                    configOverrides = getConfigOverrides();
                    if (configOverrides && gate in configOverrides) {
                        return [2 /*return*/, Boolean(configOverrides[gate])];
                    }
                    if (!isGrowthBookEnabled()) {
                        return [2 /*return*/, false];
                    }
                    if (!reinitializingPromise) return [3 /*break*/, 2];
                    return [4 /*yield*/, reinitializingPromise];
                case 1:
                    _c.sent();
                    _c.label = 2;
                case 2:
                    config = (0, config_js_1.getGlobalConfig)();
                    statsigCached = (_a = config.cachedStatsigGates) === null || _a === void 0 ? void 0 : _a[gate];
                    if (statsigCached !== undefined) {
                        return [2 /*return*/, Boolean(statsigCached)];
                    }
                    gbCached = (_b = config.cachedGrowthBookFeatures) === null || _b === void 0 ? void 0 : _b[gate];
                    if (gbCached !== undefined) {
                        return [2 /*return*/, Boolean(gbCached)];
                    }
                    // No cache - return false (don't block on init for uncached gates)
                    return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Check a boolean entitlement gate with fallback-to-blocking semantics.
 *
 * Fast path: if the disk cache already says `true`, return it immediately.
 * Slow path: if disk says `false`/missing, await GrowthBook init and fetch the
 * fresh server value (max ~5s). Disk is populated by syncRemoteEvalToDisk
 * inside init, so by the time the slow path returns, disk already has the
 * fresh value — no write needed here.
 *
 * Use for user-invoked features (e.g. /remote-control) that are gated on
 * subscription/org, where a stale `false` would unfairly block access but a
 * stale `true` is acceptable (the server is the real gatekeeper).
 */
function checkGate_CACHED_OR_BLOCKING(gate) {
    return __awaiter(this, void 0, void 0, function () {
        var overrides, configOverrides, cached;
        var _a;
        return __generator(this, function (_b) {
            overrides = getEnvOverrides();
            if (overrides && gate in overrides) {
                return [2 /*return*/, Boolean(overrides[gate])];
            }
            configOverrides = getConfigOverrides();
            if (configOverrides && gate in configOverrides) {
                return [2 /*return*/, Boolean(configOverrides[gate])];
            }
            if (!isGrowthBookEnabled()) {
                return [2 /*return*/, false];
            }
            cached = (_a = (0, config_js_1.getGlobalConfig)().cachedGrowthBookFeatures) === null || _a === void 0 ? void 0 : _a[gate];
            if (cached === true) {
                // Log experiment exposure if data is available, otherwise defer
                if (experimentDataByFeature.has(gate)) {
                    logExposureForFeature(gate);
                }
                else {
                    pendingExposures.add(gate);
                }
                return [2 /*return*/, true];
            }
            // Slow path: disk says false/missing — may be stale, fetch fresh
            return [2 /*return*/, getFeatureValueInternal(gate, false, true)];
        });
    });
}
/**
 * Refresh GrowthBook after auth changes (login/logout).
 *
 * NOTE: This must destroy and recreate the client because GrowthBook's
 * apiHostRequestHeaders cannot be updated after client creation.
 */
function refreshGrowthBookAfterAuthChange() {
    if (!isGrowthBookEnabled()) {
        return;
    }
    try {
        // Reset the client completely to get fresh auth headers
        // This is necessary because apiHostRequestHeaders can't be updated after creation
        resetGrowthBook();
        // resetGrowthBook cleared remoteEvalFeatureValues. If re-init below
        // times out (hadFeatures=false) or short-circuits on !hasAuth (logout),
        // the init-callback notify never fires — subscribers stay synced to the
        // previous account's memoized state. Notify here so they re-read now
        // (falls to disk cache). If re-init succeeds, they'll notify again with
        // fresh values; if not, at least they're synced to the post-reset state.
        refreshed.emit();
        // Reinitialize with fresh auth headers and attributes
        // Track this promise so security gate checks can wait for it.
        // .catch before .finally: initializeGrowthBook can reject if its sync
        // helpers throw (getGrowthBookClient, getAuthHeaders, resetGrowthBook —
        // clientWrapper.initialized itself has its own .catch so never rejects),
        // and .finally re-settles with the original rejection — the sync
        // try/catch below cannot catch async rejections.
        reinitializingPromise = (0, exports.initializeGrowthBook)()
            .catch(function (error) {
            (0, log_js_1.logError)((0, errors_js_1.toError)(error));
            return null;
        })
            .finally(function () {
            reinitializingPromise = null;
        });
    }
    catch (error) {
        if (process.env.NODE_ENV === 'development') {
            throw error;
        }
        (0, log_js_1.logError)((0, errors_js_1.toError)(error));
    }
}
/**
 * Reset GrowthBook client state (primarily for testing)
 */
function resetGrowthBook() {
    var _a, _b, _c, _d;
    stopPeriodicGrowthBookRefresh();
    // Remove process handlers before destroying client to prevent accumulation
    if (currentBeforeExitHandler) {
        process.off('beforeExit', currentBeforeExitHandler);
        currentBeforeExitHandler = null;
    }
    if (currentExitHandler) {
        process.off('exit', currentExitHandler);
        currentExitHandler = null;
    }
    client === null || client === void 0 ? void 0 : client.destroy();
    client = null;
    clientCreatedWithAuth = false;
    reinitializingPromise = null;
    experimentDataByFeature.clear();
    pendingExposures.clear();
    loggedExposures.clear();
    remoteEvalFeatureValues.clear();
    (_b = (_a = getGrowthBookClient.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (_d = (_c = exports.initializeGrowthBook.cache) === null || _c === void 0 ? void 0 : _c.clear) === null || _d === void 0 ? void 0 : _d.call(_c);
    envOverrides = null;
    envOverridesParsed = false;
}
// Periodic refresh interval (matches Statsig's 6-hour interval)
var GROWTHBOOK_REFRESH_INTERVAL_MS = process.env.USER_TYPE !== 'ant'
    ? 6 * 60 * 60 * 1000 // 6 hours
    : 20 * 60 * 1000; // 20 min (for ants)
var refreshInterval = null;
var beforeExitListener = null;
/**
 * Light refresh - re-fetch features from server without recreating client.
 * Use this for periodic refresh when auth headers haven't changed.
 *
 * Unlike refreshGrowthBookAfterAuthChange() which destroys and recreates the client,
 * this preserves client state and just fetches fresh feature values.
 */
function refreshGrowthBookFeatures() {
    return __awaiter(this, void 0, void 0, function () {
        var growthBookClient, hadFeatures, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isGrowthBookEnabled()) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, (0, exports.initializeGrowthBook)()];
                case 2:
                    growthBookClient = _a.sent();
                    if (!growthBookClient) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, growthBookClient.refreshFeatures()
                        // Guard: if this client was replaced during the in-flight refresh
                        // (e.g. refreshGrowthBookAfterAuthChange ran), skip processing the
                        // stale payload. Mirrors the init-callback guard above.
                    ];
                case 3:
                    _a.sent();
                    // Guard: if this client was replaced during the in-flight refresh
                    // (e.g. refreshGrowthBookAfterAuthChange ran), skip processing the
                    // stale payload. Mirrors the init-callback guard above.
                    if (growthBookClient !== client) {
                        if (process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)('GrowthBook: Skipping refresh processing for replaced client');
                        }
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, processRemoteEvalPayload(growthBookClient)
                        // Same re-check as init path: covers the setPayload yield inside
                        // processRemoteEvalPayload (the guard above only covers refreshFeatures).
                    ];
                case 4:
                    hadFeatures = _a.sent();
                    // Same re-check as init path: covers the setPayload yield inside
                    // processRemoteEvalPayload (the guard above only covers refreshFeatures).
                    if (growthBookClient !== client)
                        return [2 /*return*/];
                    if (process.env.USER_TYPE === 'ant') {
                        (0, debug_js_1.logForDebugging)('GrowthBook: Light refresh completed');
                    }
                    // Gate on hadFeatures: if the payload was empty/malformed,
                    // remoteEvalFeatureValues wasn't rebuilt — skip both the no-op disk
                    // write and the spurious subscriber churn (clearCommandMemoizationCaches
                    // + getCommands + 4× model re-renders).
                    if (hadFeatures) {
                        syncRemoteEvalToDisk();
                        refreshed.emit();
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    if (process.env.NODE_ENV === 'development') {
                        throw error_1;
                    }
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_1));
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Set up periodic refresh of GrowthBook features.
 * Uses light refresh (refreshGrowthBookFeatures) to re-fetch without recreating client.
 *
 * Call this after initialization for long-running sessions to ensure
 * feature values stay fresh. Matches Statsig's 6-hour refresh interval.
 */
function setupPeriodicGrowthBookRefresh() {
    var _a;
    if (!isGrowthBookEnabled()) {
        return;
    }
    // Clear any existing interval to avoid duplicates
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    refreshInterval = setInterval(function () {
        void refreshGrowthBookFeatures();
    }, GROWTHBOOK_REFRESH_INTERVAL_MS);
    // Allow process to exit naturally - this timer shouldn't keep the process alive
    (_a = refreshInterval.unref) === null || _a === void 0 ? void 0 : _a.call(refreshInterval);
    // Register cleanup listener only once
    if (!beforeExitListener) {
        beforeExitListener = function () {
            stopPeriodicGrowthBookRefresh();
        };
        process.once('beforeExit', beforeExitListener);
    }
}
/**
 * Stop periodic refresh (for testing or cleanup)
 */
function stopPeriodicGrowthBookRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
    if (beforeExitListener) {
        process.removeListener('beforeExit', beforeExitListener);
        beforeExitListener = null;
    }
}
// ============================================================================
// Dynamic Config Functions
// These are semantic wrappers around feature functions for Statsig API parity.
// In GrowthBook, dynamic configs are just features with object values.
// ============================================================================
/**
 * Get a dynamic config value - blocks until GrowthBook is initialized.
 * Prefer getFeatureValue_CACHED_MAY_BE_STALE for startup-critical paths.
 */
function getDynamicConfig_BLOCKS_ON_INIT(configName, defaultValue) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, getFeatureValue_DEPRECATED(configName, defaultValue)];
        });
    });
}
/**
 * Get a dynamic config value from disk cache immediately. Pure read — see
 * getFeatureValue_CACHED_MAY_BE_STALE.
 * This is the preferred method for startup-critical paths and sync contexts.
 *
 * In GrowthBook, dynamic configs are just features with object values.
 */
function getDynamicConfig_CACHED_MAY_BE_STALE(configName, defaultValue) {
    return getFeatureValue_CACHED_MAY_BE_STALE(configName, defaultValue);
}
