"use strict";
/**
 * REPL-specific wrapper around initBridgeCore. Owns the parts that read
 * bootstrap state — gates, cwd, session ID, git context, OAuth, title
 * derivation — then delegates to the bootstrap-free core.
 *
 * Split out of replBridge.ts because the sessionStorage import
 * (getCurrentSessionTitle) transitively pulls in src/commands.ts → the
 * entire slash command + React component tree (~1300 modules). Keeping
 * initBridgeCore in a file that doesn't touch sessionStorage lets
 * daemonBridge.ts import the core without bloating the Agent SDK bundle.
 *
 * Called via dynamic import by useReplBridge (auto-start) and print.ts
 * (SDK -p mode via query.enableRemoteControl).
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
exports.initReplBridge = initReplBridge;
var bun_bundle_1 = require("bun:bundle");
var os_1 = require("os");
var state_js_1 = require("../bootstrap/state.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var client_js_1 = require("../services/oauth/client.js");
var index_js_1 = require("../services/policyLimits/index.js");
var auth_js_1 = require("../utils/auth.js");
var config_js_1 = require("../utils/config.js");
var debug_js_1 = require("../utils/debug.js");
var displayTags_js_1 = require("../utils/displayTags.js");
var errors_js_1 = require("../utils/errors.js");
var git_js_1 = require("../utils/git.js");
var mappers_js_1 = require("../utils/messages/mappers.js");
var messages_js_1 = require("../utils/messages.js");
var sessionStorage_js_1 = require("../utils/sessionStorage.js");
var sessionTitle_js_1 = require("../utils/sessionTitle.js");
var words_js_1 = require("../utils/words.js");
var bridgeConfig_js_1 = require("./bridgeConfig.js");
var bridgeEnabled_js_1 = require("./bridgeEnabled.js");
var createSession_js_1 = require("./createSession.js");
var debugUtils_js_1 = require("./debugUtils.js");
var envLessBridgeConfig_js_1 = require("./envLessBridgeConfig.js");
var pollConfig_js_1 = require("./pollConfig.js");
var replBridge_js_1 = require("./replBridge.js");
var sessionIdCompat_js_1 = require("./sessionIdCompat.js");
function initReplBridge(options) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, onInboundMessage, onPermissionResponse, onInterrupt, onSetModel, onSetMaxThinkingTokens, onSetPermissionMode, onStateChange, initialMessages, getMessages, previouslyFlushedUUIDs, initialName, perpetual, outboundOnly, tags, cfg, tokens, deadExpiresAt_1, baseUrl, title, hasTitle, hasExplicitTitle, sessionId, customTitle, i, msg, rawContent, derived, userMessageCount, lastBridgeSessionId, genSeq, patch, generateAndPatch, onUserMessage, initialHistoryCap, orgUUID, versionError_1, initEnvLessBridgeCore, versionError, branch, gitRepoUrl, sessionIngressUrl, workerType, isAssistantMode;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = options !== null && options !== void 0 ? options : {}, onInboundMessage = _a.onInboundMessage, onPermissionResponse = _a.onPermissionResponse, onInterrupt = _a.onInterrupt, onSetModel = _a.onSetModel, onSetMaxThinkingTokens = _a.onSetMaxThinkingTokens, onSetPermissionMode = _a.onSetPermissionMode, onStateChange = _a.onStateChange, initialMessages = _a.initialMessages, getMessages = _a.getMessages, previouslyFlushedUUIDs = _a.previouslyFlushedUUIDs, initialName = _a.initialName, perpetual = _a.perpetual, outboundOnly = _a.outboundOnly, tags = _a.tags;
                    // Wire the cse_ shim kill switch so toCompatSessionId respects the
                    // GrowthBook gate. Daemon/SDK paths skip this — shim defaults to active.
                    (0, sessionIdCompat_js_1.setCseShimGate)(bridgeEnabled_js_1.isCseShimEnabled);
                    return [4 /*yield*/, (0, bridgeEnabled_js_1.isBridgeEnabledBlocking)()];
                case 1:
                    // 1. Runtime gate
                    if (!(_d.sent())) {
                        (0, debugUtils_js_1.logBridgeSkip)('not_enabled', '[bridge:repl] Skipping: bridge not enabled');
                        return [2 /*return*/, null];
                    }
                    // 1b. Minimum version check — deferred to after the v1/v2 branch below,
                    // since each implementation has its own floor (tengu_bridge_min_version
                    // for v1, tengu_bridge_repl_v2_config.min_version for v2).
                    // 2. Check OAuth — must be signed in with claude.ai. Runs before the
                    // policy check so console-auth users get the actionable "/login" hint
                    // instead of a misleading policy error from a stale/wrong-org cache.
                    if (!(0, bridgeConfig_js_1.getBridgeAccessToken)()) {
                        (0, debugUtils_js_1.logBridgeSkip)('no_oauth', '[bridge:repl] Skipping: no OAuth tokens');
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', '/login');
                        return [2 /*return*/, null];
                    }
                    // 3. Check organization policy — remote control may be disabled
                    return [4 /*yield*/, (0, index_js_1.waitForPolicyLimitsToLoad)()];
                case 2:
                    // 3. Check organization policy — remote control may be disabled
                    _d.sent();
                    if (!(0, index_js_1.isPolicyAllowed)('allow_remote_control')) {
                        (0, debugUtils_js_1.logBridgeSkip)('policy_denied', '[bridge:repl] Skipping: allow_remote_control policy not allowed');
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', "disabled by your organization's policy");
                        return [2 /*return*/, null];
                    }
                    if (!!(0, bridgeConfig_js_1.getBridgeTokenOverride)()) return [3 /*break*/, 4];
                    cfg = (0, config_js_1.getGlobalConfig)();
                    if (cfg.bridgeOauthDeadExpiresAt != null &&
                        ((_b = cfg.bridgeOauthDeadFailCount) !== null && _b !== void 0 ? _b : 0) >= 3 &&
                        ((_c = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _c === void 0 ? void 0 : _c.expiresAt) === cfg.bridgeOauthDeadExpiresAt) {
                        (0, debug_js_1.logForDebugging)("[bridge:repl] Skipping: cross-process backoff (dead token seen ".concat(cfg.bridgeOauthDeadFailCount, " times)"));
                        return [2 /*return*/, null];
                    }
                    // 2b. Proactively refresh if expired. Mirrors bridgeMain.ts:2096 — the REPL
                    // bridge fires at useEffect mount BEFORE any v1/messages call, making this
                    // usually the first OAuth request of the session. Without this, ~9% of
                    // registrations hit the server with a >8h-expired token → 401 → withOAuthRetry
                    // recovers, but the server logs a 401 we can avoid. VPN egress IPs observed
                    // at 30:1 401:200 when many unrelated users cluster at the 8h TTL boundary.
                    //
                    // Fresh-token cost: one memoized read + one Date.now() comparison (~µs).
                    // checkAndRefreshOAuthTokenIfNeeded clears its own cache in every path that
                    // touches the keychain (refresh success, lockfile race, throw), so no
                    // explicit clearOAuthTokenCache() here — that would force a blocking
                    // keychain spawn on the 91%+ fresh-token path.
                    return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()
                        // 2c. Skip if token is still expired post-refresh-attempt. Env-var / FD
                        // tokens (auth.ts:894-917) have expiresAt=null → never trip this. But a
                        // keychain token whose refresh token is dead (password change, org left,
                        // token GC'd) has expiresAt<now AND refresh just failed — the client would
                        // otherwise loop 401 forever: withOAuthRetry → handleOAuth401Error →
                        // refresh fails again → retry with same stale token → 401 again.
                        // Datadog 2026-03-08: single IPs generating 2,879 such 401s/day. Skip the
                        // guaranteed-fail API call; useReplBridge surfaces the failure.
                        //
                        // Intentionally NOT using isOAuthTokenExpired here — that has a 5-minute
                        // proactive-refresh buffer, which is the right heuristic for "should
                        // refresh soon" but wrong for "provably unusable". A token with 3min left
                        // + transient refresh endpoint blip (5xx/timeout/wifi-reconnect) would
                        // falsely trip a buffered check; the still-valid token would connect fine.
                        // Check actual expiry instead: past-expiry AND refresh-failed → truly dead.
                    ];
                case 3:
                    // 2b. Proactively refresh if expired. Mirrors bridgeMain.ts:2096 — the REPL
                    // bridge fires at useEffect mount BEFORE any v1/messages call, making this
                    // usually the first OAuth request of the session. Without this, ~9% of
                    // registrations hit the server with a >8h-expired token → 401 → withOAuthRetry
                    // recovers, but the server logs a 401 we can avoid. VPN egress IPs observed
                    // at 30:1 401:200 when many unrelated users cluster at the 8h TTL boundary.
                    //
                    // Fresh-token cost: one memoized read + one Date.now() comparison (~µs).
                    // checkAndRefreshOAuthTokenIfNeeded clears its own cache in every path that
                    // touches the keychain (refresh success, lockfile race, throw), so no
                    // explicit clearOAuthTokenCache() here — that would force a blocking
                    // keychain spawn on the 91%+ fresh-token path.
                    _d.sent();
                    tokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
                    if (tokens && tokens.expiresAt !== null && tokens.expiresAt <= Date.now()) {
                        (0, debugUtils_js_1.logBridgeSkip)('oauth_expired_unrefreshable', '[bridge:repl] Skipping: OAuth token expired and refresh failed (re-login required)');
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', '/login');
                        deadExpiresAt_1 = tokens.expiresAt;
                        (0, config_js_1.saveGlobalConfig)(function (c) {
                            var _a;
                            return (__assign(__assign({}, c), { bridgeOauthDeadExpiresAt: deadExpiresAt_1, bridgeOauthDeadFailCount: c.bridgeOauthDeadExpiresAt === deadExpiresAt_1
                                    ? ((_a = c.bridgeOauthDeadFailCount) !== null && _a !== void 0 ? _a : 0) + 1
                                    : 1 }));
                        });
                        return [2 /*return*/, null];
                    }
                    _d.label = 4;
                case 4:
                    baseUrl = (0, bridgeConfig_js_1.getBridgeBaseUrl)();
                    title = "remote-control-".concat((0, words_js_1.generateShortWordSlug)());
                    hasTitle = false;
                    hasExplicitTitle = false;
                    if (initialName) {
                        title = initialName;
                        hasTitle = true;
                        hasExplicitTitle = true;
                    }
                    else {
                        sessionId = (0, state_js_1.getSessionId)();
                        customTitle = sessionId
                            ? (0, sessionStorage_js_1.getCurrentSessionTitle)(sessionId)
                            : undefined;
                        if (customTitle) {
                            title = customTitle;
                            hasTitle = true;
                            hasExplicitTitle = true;
                        }
                        else if (initialMessages && initialMessages.length > 0) {
                            // Find the last user message that has meaningful content. Skip meta
                            // (nudges), tool results, compact summaries ("This session is being
                            // continued…"), non-human origins (task notifications, channel pushes),
                            // and synthetic interrupts ([Request interrupted by user]) — none are
                            // human-authored. Same filter as extractTitleText + isSyntheticMessage.
                            for (i = initialMessages.length - 1; i >= 0; i--) {
                                msg = initialMessages[i];
                                if (msg.type !== 'user' ||
                                    msg.isMeta ||
                                    msg.toolUseResult ||
                                    msg.isCompactSummary ||
                                    (msg.origin && msg.origin.kind !== 'human') ||
                                    (0, messages_js_1.isSyntheticMessage)(msg))
                                    continue;
                                rawContent = (0, messages_js_1.getContentText)(msg.message.content);
                                if (!rawContent)
                                    continue;
                                derived = deriveTitle(rawContent);
                                if (!derived)
                                    continue;
                                title = derived;
                                hasTitle = true;
                                break;
                            }
                        }
                    }
                    userMessageCount = 0;
                    genSeq = 0;
                    patch = function (derived, bridgeSessionId, atCount) {
                        hasTitle = true;
                        title = derived;
                        (0, debug_js_1.logForDebugging)("[bridge:repl] derived title from message ".concat(atCount, ": ").concat(derived));
                        void (0, createSession_js_1.updateBridgeSessionTitle)(bridgeSessionId, derived, {
                            baseUrl: baseUrl,
                            getAccessToken: bridgeConfig_js_1.getBridgeAccessToken,
                        }).catch(function () { });
                    };
                    generateAndPatch = function (input, bridgeSessionId) {
                        var gen = ++genSeq;
                        var atCount = userMessageCount;
                        void (0, sessionTitle_js_1.generateSessionTitle)(input, AbortSignal.timeout(15000)).then(function (generated) {
                            if (generated &&
                                gen === genSeq &&
                                lastBridgeSessionId === bridgeSessionId &&
                                !(0, sessionStorage_js_1.getCurrentSessionTitle)((0, state_js_1.getSessionId)())) {
                                patch(generated, bridgeSessionId, atCount);
                            }
                        });
                    };
                    onUserMessage = function (text, bridgeSessionId) {
                        if (hasExplicitTitle || (0, sessionStorage_js_1.getCurrentSessionTitle)((0, state_js_1.getSessionId)())) {
                            return true;
                        }
                        // v1 env-lost re-creates the session with a new ID. Reset the count so
                        // the new session gets its own count-3 derivation; hasTitle stays true
                        // (new session was created via getCurrentTitle(), which reads the count-1
                        // title from this closure), so count-1 of the fresh cycle correctly skips.
                        if (lastBridgeSessionId !== undefined &&
                            lastBridgeSessionId !== bridgeSessionId) {
                            userMessageCount = 0;
                        }
                        lastBridgeSessionId = bridgeSessionId;
                        userMessageCount++;
                        if (userMessageCount === 1 && !hasTitle) {
                            var placeholder = deriveTitle(text);
                            if (placeholder)
                                patch(placeholder, bridgeSessionId, userMessageCount);
                            generateAndPatch(text, bridgeSessionId);
                        }
                        else if (userMessageCount === 3) {
                            var msgs = getMessages === null || getMessages === void 0 ? void 0 : getMessages();
                            var input = msgs
                                ? (0, sessionTitle_js_1.extractConversationText)((0, messages_js_1.getMessagesAfterCompactBoundary)(msgs))
                                : text;
                            generateAndPatch(input, bridgeSessionId);
                        }
                        // Also re-latches if v1 env-lost resets the transport's done flag past 3.
                        return userMessageCount >= 3;
                    };
                    initialHistoryCap = (0, growthbook_js_1.getFeatureValue_CACHED_WITH_REFRESH)('tengu_bridge_initial_history_cap', 200, 5 * 60 * 1000);
                    return [4 /*yield*/, (0, client_js_1.getOrganizationUUID)()];
                case 5:
                    orgUUID = _d.sent();
                    if (!orgUUID) {
                        (0, debugUtils_js_1.logBridgeSkip)('no_org_uuid', '[bridge:repl] Skipping: no org UUID');
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', '/login');
                        return [2 /*return*/, null];
                    }
                    if (!((0, bridgeEnabled_js_1.isEnvLessBridgeEnabled)() && !perpetual)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, envLessBridgeConfig_js_1.checkEnvLessBridgeMinVersion)()];
                case 6:
                    versionError_1 = _d.sent();
                    if (versionError_1) {
                        (0, debugUtils_js_1.logBridgeSkip)('version_too_old', "[bridge:repl] Skipping: ".concat(versionError_1), true);
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', 'run `claude update` to upgrade');
                        return [2 /*return*/, null];
                    }
                    (0, debug_js_1.logForDebugging)('[bridge:repl] Using env-less bridge path (tengu_bridge_repl_v2)');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./remoteBridgeCore.js'); })];
                case 7:
                    initEnvLessBridgeCore = (_d.sent()).initEnvLessBridgeCore;
                    return [2 /*return*/, initEnvLessBridgeCore({
                            baseUrl: baseUrl,
                            orgUUID: orgUUID,
                            title: title,
                            getAccessToken: bridgeConfig_js_1.getBridgeAccessToken,
                            onAuth401: auth_js_1.handleOAuth401Error,
                            toSDKMessages: mappers_js_1.toSDKMessages,
                            initialHistoryCap: initialHistoryCap,
                            initialMessages: initialMessages,
                            // v2 always creates a fresh server session (new cse_* id), so
                            // previouslyFlushedUUIDs is not passed — there's no cross-session
                            // UUID collision risk, and the ref persists across enable→disable→
                            // re-enable cycles which would cause the new session to receive zero
                            // history (all UUIDs already in the set from the prior enable).
                            // v1 handles this by calling previouslyFlushedUUIDs.clear() on fresh
                            // session creation (replBridge.ts:768); v2 skips the param entirely.
                            onInboundMessage: onInboundMessage,
                            onUserMessage: onUserMessage,
                            onPermissionResponse: onPermissionResponse,
                            onInterrupt: onInterrupt,
                            onSetModel: onSetModel,
                            onSetMaxThinkingTokens: onSetMaxThinkingTokens,
                            onSetPermissionMode: onSetPermissionMode,
                            onStateChange: onStateChange,
                            outboundOnly: outboundOnly,
                            tags: tags,
                        })];
                case 8:
                    versionError = (0, bridgeEnabled_js_1.checkBridgeMinVersion)();
                    if (versionError) {
                        (0, debugUtils_js_1.logBridgeSkip)('version_too_old', "[bridge:repl] Skipping: ".concat(versionError));
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', 'run `claude update` to upgrade');
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, git_js_1.getBranch)()];
                case 9:
                    branch = _d.sent();
                    return [4 /*yield*/, (0, git_js_1.getRemoteUrl)()];
                case 10:
                    gitRepoUrl = _d.sent();
                    sessionIngressUrl = process.env.USER_TYPE === 'ant' &&
                        process.env.CLAUDE_BRIDGE_SESSION_INGRESS_URL
                        ? process.env.CLAUDE_BRIDGE_SESSION_INGRESS_URL
                        : baseUrl;
                    workerType = 'claude_code';
                    if ((0, bun_bundle_1.feature)('KAIROS')) {
                        isAssistantMode = require('../assistant/index.js').isAssistantMode;
                        /* eslint-enable @typescript-eslint/no-require-imports */
                        if (isAssistantMode()) {
                            workerType = 'claude_code_assistant';
                        }
                    }
                    // 6. Delegate. BridgeCoreHandle is a structural superset of
                    // ReplBridgeHandle (adds writeSdkMessages which REPL callers don't use),
                    // so no adapter needed — just the narrower type on the way out.
                    return [2 /*return*/, (0, replBridge_js_1.initBridgeCore)({
                            dir: (0, state_js_1.getOriginalCwd)(),
                            machineName: (0, os_1.hostname)(),
                            branch: branch,
                            gitRepoUrl: gitRepoUrl,
                            title: title,
                            baseUrl: baseUrl,
                            sessionIngressUrl: sessionIngressUrl,
                            workerType: workerType,
                            getAccessToken: bridgeConfig_js_1.getBridgeAccessToken,
                            createSession: function (opts) {
                                return (0, createSession_js_1.createBridgeSession)(__assign(__assign({}, opts), { events: [], baseUrl: baseUrl, getAccessToken: bridgeConfig_js_1.getBridgeAccessToken }));
                            },
                            archiveSession: function (sessionId) {
                                return (0, createSession_js_1.archiveBridgeSession)(sessionId, {
                                    baseUrl: baseUrl,
                                    getAccessToken: bridgeConfig_js_1.getBridgeAccessToken,
                                    // gracefulShutdown.ts:407 races runCleanupFunctions against 2s.
                                    // Teardown also does stopWork (parallel) + deregister (sequential),
                                    // so archive can't have the full budget. 1.5s matches v2's
                                    // teardown_archive_timeout_ms default.
                                    timeoutMs: 1500,
                                }).catch(function (err) {
                                    // archiveBridgeSession has no try/catch — 5xx/timeout/network throw
                                    // straight through. Previously swallowed silently, making archive
                                    // failures BQ-invisible and undiagnosable from debug logs.
                                    (0, debug_js_1.logForDebugging)("[bridge:repl] archiveBridgeSession threw: ".concat((0, errors_js_1.errorMessage)(err)), { level: 'error' });
                                });
                            },
                            // getCurrentTitle is read on reconnect-after-env-lost to re-title the new
                            // session. /rename writes to session storage; onUserMessage mutates
                            // `title` directly — both paths are picked up here.
                            getCurrentTitle: function () { var _a; return (_a = (0, sessionStorage_js_1.getCurrentSessionTitle)((0, state_js_1.getSessionId)())) !== null && _a !== void 0 ? _a : title; },
                            onUserMessage: onUserMessage,
                            toSDKMessages: mappers_js_1.toSDKMessages,
                            onAuth401: auth_js_1.handleOAuth401Error,
                            getPollIntervalConfig: pollConfig_js_1.getPollIntervalConfig,
                            initialHistoryCap: initialHistoryCap,
                            initialMessages: initialMessages,
                            previouslyFlushedUUIDs: previouslyFlushedUUIDs,
                            onInboundMessage: onInboundMessage,
                            onPermissionResponse: onPermissionResponse,
                            onInterrupt: onInterrupt,
                            onSetModel: onSetModel,
                            onSetMaxThinkingTokens: onSetMaxThinkingTokens,
                            onSetPermissionMode: onSetPermissionMode,
                            onStateChange: onStateChange,
                            perpetual: perpetual,
                        })];
            }
        });
    });
}
var TITLE_MAX_LEN = 50;
/**
 * Quick placeholder title: strip display tags, take the first sentence,
 * collapse whitespace, truncate to 50 chars. Returns undefined if the result
 * is empty (e.g. message was only <local-command-stdout>). Replaced by
 * generateSessionTitle once Haiku resolves (~1-15s).
 */
function deriveTitle(raw) {
    var _a, _b;
    // Strip <ide_opened_file>, <session-start-hook>, etc. — these appear in
    // user messages when IDE/hooks inject context. stripDisplayTagsAllowEmpty
    // returns '' (not the original) so pure-tag messages are skipped.
    var clean = (0, displayTags_js_1.stripDisplayTagsAllowEmpty)(raw);
    // First sentence is usually the intent; rest is often context/detail.
    // Capture group instead of lookbehind — keeps YARR JIT happy.
    var firstSentence = (_b = (_a = /^(.*?[.!?])\s/.exec(clean)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : clean;
    // Collapse newlines/tabs — titles are single-line in the claude.ai list.
    var flat = firstSentence.replace(/\s+/g, ' ').trim();
    if (!flat)
        return undefined;
    return flat.length > TITLE_MAX_LEN
        ? flat.slice(0, TITLE_MAX_LEN - 1) + '\u2026'
        : flat;
}
