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
exports.getClaudeAIOAuthTokens = exports.getApiKeyFromConfigOrMacOSKeychain = exports.refreshGcpCredentialsIfNeeded = exports.refreshAndGetAwsCredentials = void 0;
exports.isAnthropicAuthEnabled = isAnthropicAuthEnabled;
exports.getAuthTokenSource = getAuthTokenSource;
exports.getAnthropicApiKey = getAnthropicApiKey;
exports.hasAnthropicApiKeyAuth = hasAnthropicApiKeyAuth;
exports.getAnthropicApiKeyWithSource = getAnthropicApiKeyWithSource;
exports.getConfiguredApiKeyHelper = getConfiguredApiKeyHelper;
exports.isAwsAuthRefreshFromProjectSettings = isAwsAuthRefreshFromProjectSettings;
exports.isAwsCredentialExportFromProjectSettings = isAwsCredentialExportFromProjectSettings;
exports.calculateApiKeyHelperTTL = calculateApiKeyHelperTTL;
exports.getApiKeyHelperElapsedMs = getApiKeyHelperElapsedMs;
exports.getApiKeyFromApiKeyHelper = getApiKeyFromApiKeyHelper;
exports.getApiKeyFromApiKeyHelperCached = getApiKeyFromApiKeyHelperCached;
exports.clearApiKeyHelperCache = clearApiKeyHelperCache;
exports.prefetchApiKeyFromApiKeyHelperIfSafe = prefetchApiKeyFromApiKeyHelperIfSafe;
exports.refreshAwsAuth = refreshAwsAuth;
exports.clearAwsCredentialsCache = clearAwsCredentialsCache;
exports.isGcpAuthRefreshFromProjectSettings = isGcpAuthRefreshFromProjectSettings;
exports.checkGcpCredentialsValid = checkGcpCredentialsValid;
exports.refreshGcpAuth = refreshGcpAuth;
exports.clearGcpCredentialsCache = clearGcpCredentialsCache;
exports.prefetchGcpCredentialsIfSafe = prefetchGcpCredentialsIfSafe;
exports.prefetchAwsCredentialsAndBedRockInfoIfSafe = prefetchAwsCredentialsAndBedRockInfoIfSafe;
exports.saveApiKey = saveApiKey;
exports.isCustomApiKeyApproved = isCustomApiKeyApproved;
exports.removeApiKey = removeApiKey;
exports.saveOAuthTokensIfNeeded = saveOAuthTokensIfNeeded;
exports.clearOAuthTokenCache = clearOAuthTokenCache;
exports.handleOAuth401Error = handleOAuth401Error;
exports.getClaudeAIOAuthTokensAsync = getClaudeAIOAuthTokensAsync;
exports.checkAndRefreshOAuthTokenIfNeeded = checkAndRefreshOAuthTokenIfNeeded;
exports.isClaudeAISubscriber = isClaudeAISubscriber;
exports.hasProfileScope = hasProfileScope;
exports.is1PApiCustomer = is1PApiCustomer;
exports.getOauthAccountInfo = getOauthAccountInfo;
exports.isOverageProvisioningAllowed = isOverageProvisioningAllowed;
exports.hasOpusAccess = hasOpusAccess;
exports.getSubscriptionType = getSubscriptionType;
exports.isMaxSubscriber = isMaxSubscriber;
exports.isTeamSubscriber = isTeamSubscriber;
exports.isTeamPremiumSubscriber = isTeamPremiumSubscriber;
exports.isEnterpriseSubscriber = isEnterpriseSubscriber;
exports.isProSubscriber = isProSubscriber;
exports.getRateLimitTier = getRateLimitTier;
exports.getSubscriptionName = getSubscriptionName;
exports.isUsing3PServices = isUsing3PServices;
exports.isOtelHeadersHelperFromProjectOrLocalSettings = isOtelHeadersHelperFromProjectOrLocalSettings;
exports.getOtelHeadersFromHelper = getOtelHeadersFromHelper;
exports.isConsumerSubscriber = isConsumerSubscriber;
exports.getAccountInformation = getAccountInformation;
exports.validateForceLoginOrg = validateForceLoginOrg;
var chalk_1 = require("chalk");
var child_process_1 = require("child_process");
var execa_1 = require("execa");
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var oauth_js_1 = require("src/constants/oauth.js");
var index_js_1 = require("src/services/analytics/index.js");
var modelStrings_js_1 = require("src/utils/model/modelStrings.js");
var providers_js_1 = require("src/utils/model/providers.js");
var state_js_1 = require("../bootstrap/state.js");
var mockRateLimits_js_1 = require("../services/mockRateLimits.js");
var client_js_1 = require("../services/oauth/client.js");
var getOauthProfile_js_1 = require("../services/oauth/getOauthProfile.js");
var authFileDescriptor_js_1 = require("./authFileDescriptor.js");
var authPortable_js_1 = require("./authPortable.js");
var aws_js_1 = require("./aws.js");
var awsAuthStatusManager_js_1 = require("./awsAuthStatusManager.js");
var betas_js_1 = require("./betas.js");
var config_js_1 = require("./config.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var lockfile = require("./lockfile.js");
var log_js_1 = require("./log.js");
var memoize_js_2 = require("./memoize.js");
var index_js_2 = require("./secureStorage/index.js");
var keychainPrefetch_js_1 = require("./secureStorage/keychainPrefetch.js");
var macOsKeychainHelpers_js_1 = require("./secureStorage/macOsKeychainHelpers.js");
var settings_js_1 = require("./settings/settings.js");
var sleep_js_1 = require("./sleep.js");
var slowOperations_js_1 = require("./slowOperations.js");
var toolSchemaCache_js_1 = require("./toolSchemaCache.js");
/** Default TTL for API key helper cache in milliseconds (5 minutes) */
var DEFAULT_API_KEY_HELPER_TTL = 5 * 60 * 1000;
/**
 * CCR and Claude Desktop spawn the CLI with OAuth and should never fall back
 * to the user's ~/.claude/settings.json API-key config (apiKeyHelper,
 * env.ANTHROPIC_API_KEY, env.ANTHROPIC_AUTH_TOKEN). Those settings exist for
 * the user's terminal CLI, not managed sessions. Without this guard, a user
 * who runs `claude` in their terminal with an API key sees every CCD session
 * also use that key — and fail if it's stale/wrong-org.
 */
function isManagedOAuthContext() {
    return ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) ||
        process.env.CLAUDE_CODE_ENTRYPOINT === 'claude-desktop');
}
/** Whether we are supporting direct 1P auth. */
// this code is closely related to getAuthTokenSource
function isAnthropicAuthEnabled() {
    // --bare: API-key-only, never OAuth.
    if ((0, envUtils_js_1.isBareMode)())
        return false;
    // `claude ssh` remote: ANTHROPIC_UNIX_SOCKET tunnels API calls through a
    // local auth-injecting proxy. The launcher sets CLAUDE_CODE_OAUTH_TOKEN as a
    // placeholder iff the local side is a subscriber (so the remote includes the
    // oauth-2025 beta header to match what the proxy will inject). The remote's
    // ~/.claude settings (apiKeyHelper, settings.env.ANTHROPIC_API_KEY) MUST NOT
    // flip this — they'd cause a header mismatch with the proxy and a bogus
    // "invalid x-api-key" from the API. See src/ssh/sshAuthProxy.ts.
    if (process.env.ANTHROPIC_UNIX_SOCKET) {
        return !!process.env.CLAUDE_CODE_OAUTH_TOKEN;
    }
    var is3P = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_BEDROCK) ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_VERTEX) ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_FOUNDRY);
    // Check if user has configured an external API key source
    // This allows externally-provided API keys to work (without requiring proxy configuration)
    var settings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
    var apiKeyHelper = settings.apiKeyHelper;
    var hasExternalAuthToken = process.env.ANTHROPIC_AUTH_TOKEN ||
        apiKeyHelper ||
        process.env.CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR;
    // Check if API key is from an external source (not managed by /login)
    var apiKeySource = getAnthropicApiKeyWithSource({
        skipRetrievingKeyFromApiKeyHelper: true,
    }).source;
    var hasExternalApiKey = apiKeySource === 'ANTHROPIC_API_KEY' || apiKeySource === 'apiKeyHelper';
    // Disable Anthropic auth if:
    // 1. Using 3rd party services (Bedrock/Vertex/Foundry)
    // 2. User has an external API key (regardless of proxy configuration)
    // 3. User has an external auth token (regardless of proxy configuration)
    // this may cause issues if users have complex proxy / gateway "client-side creds" auth scenarios,
    // e.g. if they want to set X-Api-Key to a gateway key but use Anthropic OAuth for the Authorization
    // if we get reports of that, we should probably add an env var to force OAuth enablement
    var shouldDisableAuth = is3P ||
        (hasExternalAuthToken && !isManagedOAuthContext()) ||
        (hasExternalApiKey && !isManagedOAuthContext());
    return !shouldDisableAuth;
}
/** Where the auth token is being sourced from, if any. */
// this code is closely related to isAnthropicAuthEnabled
function getAuthTokenSource() {
    // --bare: API-key-only. apiKeyHelper (from --settings) is the only
    // bearer-token-shaped source allowed. OAuth env vars, FD tokens, and
    // keychain are ignored.
    if ((0, envUtils_js_1.isBareMode)()) {
        if (getConfiguredApiKeyHelper()) {
            return { source: 'apiKeyHelper', hasToken: true };
        }
        return { source: 'none', hasToken: false };
    }
    if (process.env.ANTHROPIC_AUTH_TOKEN && !isManagedOAuthContext()) {
        return { source: 'ANTHROPIC_AUTH_TOKEN', hasToken: true };
    }
    if (process.env.CLAUDE_CODE_OAUTH_TOKEN) {
        return { source: 'CLAUDE_CODE_OAUTH_TOKEN', hasToken: true };
    }
    // Check for OAuth token from file descriptor (or its CCR disk fallback)
    var oauthTokenFromFd = (0, authFileDescriptor_js_1.getOAuthTokenFromFileDescriptor)();
    if (oauthTokenFromFd) {
        // getOAuthTokenFromFileDescriptor has a disk fallback for CCR subprocesses
        // that can't inherit the pipe FD. Distinguish by env var presence so the
        // org-mismatch message doesn't tell the user to unset a variable that
        // doesn't exist. Call sites fall through correctly — the new source is
        // !== 'none' (cli/handlers/auth.ts → oauth_token) and not in the
        // isEnvVarToken set (auth.ts:1844 → generic re-login message).
        if (process.env.CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR) {
            return {
                source: 'CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR',
                hasToken: true,
            };
        }
        return {
            source: 'CCR_OAUTH_TOKEN_FILE',
            hasToken: true,
        };
    }
    // Check if apiKeyHelper is configured without executing it
    // This prevents security issues where arbitrary code could execute before trust is established
    var apiKeyHelper = getConfiguredApiKeyHelper();
    if (apiKeyHelper && !isManagedOAuthContext()) {
        return { source: 'apiKeyHelper', hasToken: true };
    }
    var oauthTokens = (0, exports.getClaudeAIOAuthTokens)();
    if ((0, client_js_1.shouldUseClaudeAIAuth)(oauthTokens === null || oauthTokens === void 0 ? void 0 : oauthTokens.scopes) && (oauthTokens === null || oauthTokens === void 0 ? void 0 : oauthTokens.accessToken)) {
        return { source: 'claude.ai', hasToken: true };
    }
    return { source: 'none', hasToken: false };
}
function getAnthropicApiKey() {
    var key = getAnthropicApiKeyWithSource().key;
    return key;
}
function hasAnthropicApiKeyAuth() {
    var _a = getAnthropicApiKeyWithSource({
        skipRetrievingKeyFromApiKeyHelper: true,
    }), key = _a.key, source = _a.source;
    return key !== null && source !== 'none';
}
function getAnthropicApiKeyWithSource(opts) {
    var _a, _b;
    if (opts === void 0) { opts = {}; }
    // --bare: hermetic auth. Only ANTHROPIC_API_KEY env or apiKeyHelper from
    // the --settings flag. Never touches keychain, config file, or approval
    // lists. 3P (Bedrock/Vertex/Foundry) uses provider creds, not this path.
    if ((0, envUtils_js_1.isBareMode)()) {
        if (process.env.ANTHROPIC_API_KEY) {
            return { key: process.env.ANTHROPIC_API_KEY, source: 'ANTHROPIC_API_KEY' };
        }
        if (getConfiguredApiKeyHelper()) {
            return {
                key: opts.skipRetrievingKeyFromApiKeyHelper
                    ? null
                    : getApiKeyFromApiKeyHelperCached(),
                source: 'apiKeyHelper',
            };
        }
        return { key: null, source: 'none' };
    }
    // On homespace, don't use ANTHROPIC_API_KEY (use Console key instead)
    // https://anthropic.slack.com/archives/C08428WSLKV/p1747331773214779
    var apiKeyEnv = (0, envUtils_js_1.isRunningOnHomespace)()
        ? undefined
        : process.env.ANTHROPIC_API_KEY;
    // Always check for direct environment variable when the user ran claude --print.
    // This is useful for CI, etc.
    if ((0, state_js_1.preferThirdPartyAuthentication)() && apiKeyEnv) {
        return {
            key: apiKeyEnv,
            source: 'ANTHROPIC_API_KEY',
        };
    }
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CI) || process.env.NODE_ENV === 'test') {
        // Check for API key from file descriptor first
        var apiKeyFromFd_1 = (0, authFileDescriptor_js_1.getApiKeyFromFileDescriptor)();
        if (apiKeyFromFd_1) {
            return {
                key: apiKeyFromFd_1,
                source: 'ANTHROPIC_API_KEY',
            };
        }
        if (!apiKeyEnv &&
            !process.env.CLAUDE_CODE_OAUTH_TOKEN &&
            !process.env.CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR) {
            throw new Error('ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN env var is required');
        }
        if (apiKeyEnv) {
            return {
                key: apiKeyEnv,
                source: 'ANTHROPIC_API_KEY',
            };
        }
        // OAuth token is present but this function returns API keys only
        return {
            key: null,
            source: 'none',
        };
    }
    // Check for ANTHROPIC_API_KEY before checking the apiKeyHelper or /login-managed key
    if (apiKeyEnv &&
        ((_b = (_a = (0, config_js_1.getGlobalConfig)().customApiKeyResponses) === null || _a === void 0 ? void 0 : _a.approved) === null || _b === void 0 ? void 0 : _b.includes((0, authPortable_js_1.normalizeApiKeyForConfig)(apiKeyEnv)))) {
        return {
            key: apiKeyEnv,
            source: 'ANTHROPIC_API_KEY',
        };
    }
    // Check for API key from file descriptor
    var apiKeyFromFd = (0, authFileDescriptor_js_1.getApiKeyFromFileDescriptor)();
    if (apiKeyFromFd) {
        return {
            key: apiKeyFromFd,
            source: 'ANTHROPIC_API_KEY',
        };
    }
    // Check for apiKeyHelper — use sync cache, never block
    var apiKeyHelperCommand = getConfiguredApiKeyHelper();
    if (apiKeyHelperCommand) {
        if (opts.skipRetrievingKeyFromApiKeyHelper) {
            return {
                key: null,
                source: 'apiKeyHelper',
            };
        }
        // Cache may be cold (helper hasn't finished yet). Return null with
        // source='apiKeyHelper' rather than falling through to keychain —
        // apiKeyHelper must win. Callers needing a real key must await
        // getApiKeyFromApiKeyHelper() first (client.ts, useApiKeyVerification do).
        return {
            key: getApiKeyFromApiKeyHelperCached(),
            source: 'apiKeyHelper',
        };
    }
    var apiKeyFromConfigOrMacOSKeychain = (0, exports.getApiKeyFromConfigOrMacOSKeychain)();
    if (apiKeyFromConfigOrMacOSKeychain) {
        return apiKeyFromConfigOrMacOSKeychain;
    }
    return {
        key: null,
        source: 'none',
    };
}
/**
 * Get the configured apiKeyHelper from settings.
 * In bare mode, only the --settings flag source is consulted — apiKeyHelper
 * from ~/.claude/settings.json or project settings is ignored.
 */
function getConfiguredApiKeyHelper() {
    var _a;
    if ((0, envUtils_js_1.isBareMode)()) {
        return (_a = (0, settings_js_1.getSettingsForSource)('flagSettings')) === null || _a === void 0 ? void 0 : _a.apiKeyHelper;
    }
    var mergedSettings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
    return mergedSettings.apiKeyHelper;
}
/**
 * Check if the configured apiKeyHelper comes from project settings (projectSettings or localSettings)
 */
function isApiKeyHelperFromProjectOrLocalSettings() {
    var apiKeyHelper = getConfiguredApiKeyHelper();
    if (!apiKeyHelper) {
        return false;
    }
    var projectSettings = (0, settings_js_1.getSettingsForSource)('projectSettings');
    var localSettings = (0, settings_js_1.getSettingsForSource)('localSettings');
    return ((projectSettings === null || projectSettings === void 0 ? void 0 : projectSettings.apiKeyHelper) === apiKeyHelper ||
        (localSettings === null || localSettings === void 0 ? void 0 : localSettings.apiKeyHelper) === apiKeyHelper);
}
/**
 * Get the configured awsAuthRefresh from settings
 */
function getConfiguredAwsAuthRefresh() {
    var mergedSettings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
    return mergedSettings.awsAuthRefresh;
}
/**
 * Check if the configured awsAuthRefresh comes from project settings
 */
function isAwsAuthRefreshFromProjectSettings() {
    var awsAuthRefresh = getConfiguredAwsAuthRefresh();
    if (!awsAuthRefresh) {
        return false;
    }
    var projectSettings = (0, settings_js_1.getSettingsForSource)('projectSettings');
    var localSettings = (0, settings_js_1.getSettingsForSource)('localSettings');
    return ((projectSettings === null || projectSettings === void 0 ? void 0 : projectSettings.awsAuthRefresh) === awsAuthRefresh ||
        (localSettings === null || localSettings === void 0 ? void 0 : localSettings.awsAuthRefresh) === awsAuthRefresh);
}
/**
 * Get the configured awsCredentialExport from settings
 */
function getConfiguredAwsCredentialExport() {
    var mergedSettings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
    return mergedSettings.awsCredentialExport;
}
/**
 * Check if the configured awsCredentialExport comes from project settings
 */
function isAwsCredentialExportFromProjectSettings() {
    var awsCredentialExport = getConfiguredAwsCredentialExport();
    if (!awsCredentialExport) {
        return false;
    }
    var projectSettings = (0, settings_js_1.getSettingsForSource)('projectSettings');
    var localSettings = (0, settings_js_1.getSettingsForSource)('localSettings');
    return ((projectSettings === null || projectSettings === void 0 ? void 0 : projectSettings.awsCredentialExport) === awsCredentialExport ||
        (localSettings === null || localSettings === void 0 ? void 0 : localSettings.awsCredentialExport) === awsCredentialExport);
}
/**
 * Calculate TTL in milliseconds for the API key helper cache
 * Uses CLAUDE_CODE_API_KEY_HELPER_TTL_MS env var if set and valid,
 * otherwise defaults to 5 minutes
 */
function calculateApiKeyHelperTTL() {
    var envTtl = process.env.CLAUDE_CODE_API_KEY_HELPER_TTL_MS;
    if (envTtl) {
        var parsed = parseInt(envTtl, 10);
        if (!Number.isNaN(parsed) && parsed >= 0) {
            return parsed;
        }
        (0, debug_js_1.logForDebugging)("Found CLAUDE_CODE_API_KEY_HELPER_TTL_MS env var, but it was not a valid number. Got ".concat(envTtl), { level: 'error' });
    }
    return DEFAULT_API_KEY_HELPER_TTL;
}
// Async API key helper with sync cache for non-blocking reads.
// Epoch bumps on clearApiKeyHelperCache() — orphaned executions check their
// captured epoch before touching module state so a settings-change or 401-retry
// mid-flight can't clobber the newer cache/inflight.
var _apiKeyHelperCache = null;
var _apiKeyHelperInflight = null;
var _apiKeyHelperEpoch = 0;
function getApiKeyHelperElapsedMs() {
    var startedAt = _apiKeyHelperInflight === null || _apiKeyHelperInflight === void 0 ? void 0 : _apiKeyHelperInflight.startedAt;
    return startedAt ? Date.now() - startedAt : 0;
}
function getApiKeyFromApiKeyHelper(isNonInteractiveSession) {
    return __awaiter(this, void 0, void 0, function () {
        var ttl;
        return __generator(this, function (_a) {
            if (!getConfiguredApiKeyHelper())
                return [2 /*return*/, null];
            ttl = calculateApiKeyHelperTTL();
            if (_apiKeyHelperCache) {
                if (Date.now() - _apiKeyHelperCache.timestamp < ttl) {
                    return [2 /*return*/, _apiKeyHelperCache.value];
                }
                // Stale — return stale value now, refresh in the background.
                // `??=` banned here by eslint no-nullish-assign-object-call (bun bug).
                if (!_apiKeyHelperInflight) {
                    _apiKeyHelperInflight = {
                        promise: _runAndCache(isNonInteractiveSession, false, _apiKeyHelperEpoch),
                        startedAt: null,
                    };
                }
                return [2 /*return*/, _apiKeyHelperCache.value];
            }
            // Cold cache — deduplicate concurrent calls
            if (_apiKeyHelperInflight)
                return [2 /*return*/, _apiKeyHelperInflight.promise];
            _apiKeyHelperInflight = {
                promise: _runAndCache(isNonInteractiveSession, true, _apiKeyHelperEpoch),
                startedAt: Date.now(),
            };
            return [2 /*return*/, _apiKeyHelperInflight.promise];
        });
    });
}
function _runAndCache(isNonInteractiveSession, isCold, epoch) {
    return __awaiter(this, void 0, void 0, function () {
        var value, e_1, detail;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    return [4 /*yield*/, _executeApiKeyHelper(isNonInteractiveSession)];
                case 1:
                    value = _a.sent();
                    if (epoch !== _apiKeyHelperEpoch)
                        return [2 /*return*/, value];
                    if (value !== null) {
                        _apiKeyHelperCache = { value: value, timestamp: Date.now() };
                    }
                    return [2 /*return*/, value];
                case 2:
                    e_1 = _a.sent();
                    if (epoch !== _apiKeyHelperEpoch)
                        return [2 /*return*/, ' '];
                    detail = e_1 instanceof Error ? e_1.message : String(e_1);
                    // biome-ignore lint/suspicious/noConsole: user-configured script failed; must be visible without --debug
                    console.error(chalk_1.default.red("apiKeyHelper failed: ".concat(detail)));
                    (0, debug_js_1.logForDebugging)("Error getting API key from apiKeyHelper: ".concat(detail), {
                        level: 'error',
                    });
                    // SWR path: a transient failure shouldn't replace a working key with
                    // the ' ' sentinel — keep serving the stale value and bump timestamp
                    // so we don't hammer-retry every call.
                    if (!isCold && _apiKeyHelperCache && _apiKeyHelperCache.value !== ' ') {
                        _apiKeyHelperCache = __assign(__assign({}, _apiKeyHelperCache), { timestamp: Date.now() });
                        return [2 /*return*/, _apiKeyHelperCache.value];
                    }
                    // Cold cache or prior error — cache ' ' so callers don't fall back to OAuth
                    _apiKeyHelperCache = { value: ' ', timestamp: Date.now() };
                    return [2 /*return*/, ' '];
                case 3:
                    if (epoch === _apiKeyHelperEpoch) {
                        _apiKeyHelperInflight = null;
                    }
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function _executeApiKeyHelper(isNonInteractiveSession) {
    return __awaiter(this, void 0, void 0, function () {
        var apiKeyHelper, hasTrust, error, result, why, stderr, stdout;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    apiKeyHelper = getConfiguredApiKeyHelper();
                    if (!apiKeyHelper) {
                        return [2 /*return*/, null];
                    }
                    if (isApiKeyHelperFromProjectOrLocalSettings()) {
                        hasTrust = (0, config_js_1.checkHasTrustDialogAccepted)();
                        if (!hasTrust && !isNonInteractiveSession) {
                            error = new Error("Security: apiKeyHelper executed before workspace trust is confirmed. If you see this message, post in ".concat(MACRO.FEEDBACK_CHANNEL, "."));
                            (0, debug_js_1.logAntError)('apiKeyHelper invoked before trust check', error);
                            (0, index_js_1.logEvent)('tengu_apiKeyHelper_missing_trust11', {});
                            return [2 /*return*/, null];
                        }
                    }
                    return [4 /*yield*/, (0, execa_1.execa)(apiKeyHelper, {
                            shell: true,
                            timeout: 10 * 60 * 1000,
                            reject: false,
                        })];
                case 1:
                    result = _c.sent();
                    if (result.failed) {
                        why = result.timedOut ? 'timed out' : "exited ".concat(result.exitCode);
                        stderr = (_a = result.stderr) === null || _a === void 0 ? void 0 : _a.trim();
                        throw new Error(stderr ? "".concat(why, ": ").concat(stderr) : why);
                    }
                    stdout = (_b = result.stdout) === null || _b === void 0 ? void 0 : _b.trim();
                    if (!stdout) {
                        throw new Error('did not return a value');
                    }
                    return [2 /*return*/, stdout];
            }
        });
    });
}
/**
 * Sync cache reader — returns the last fetched apiKeyHelper value without executing.
 * Returns stale values to match SWR semantics of the async reader.
 * Returns null only if the async fetch hasn't completed yet.
 */
function getApiKeyFromApiKeyHelperCached() {
    var _a;
    return (_a = _apiKeyHelperCache === null || _apiKeyHelperCache === void 0 ? void 0 : _apiKeyHelperCache.value) !== null && _a !== void 0 ? _a : null;
}
function clearApiKeyHelperCache() {
    _apiKeyHelperEpoch++;
    _apiKeyHelperCache = null;
    _apiKeyHelperInflight = null;
}
function prefetchApiKeyFromApiKeyHelperIfSafe(isNonInteractiveSession) {
    // Skip if trust not yet accepted — the inner _executeApiKeyHelper check
    // would catch this too, but would fire a false-positive analytics event.
    if (isApiKeyHelperFromProjectOrLocalSettings() &&
        !(0, config_js_1.checkHasTrustDialogAccepted)()) {
        return;
    }
    void getApiKeyFromApiKeyHelper(isNonInteractiveSession);
}
/** Default STS credentials are one hour. We manually manage invalidation, so not too worried about this being accurate. */
var DEFAULT_AWS_STS_TTL = 60 * 60 * 1000;
/**
 * Run awsAuthRefresh to perform interactive authentication (e.g., aws sso login)
 * Streams output in real-time for user visibility
 */
function runAwsAuthRefresh() {
    return __awaiter(this, void 0, void 0, function () {
        var awsAuthRefresh, hasTrust, error, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    awsAuthRefresh = getConfiguredAwsAuthRefresh();
                    if (!awsAuthRefresh) {
                        return [2 /*return*/, false]; // Not configured, treat as success
                    }
                    // SECURITY: Check if awsAuthRefresh is from project settings
                    if (isAwsAuthRefreshFromProjectSettings()) {
                        hasTrust = (0, config_js_1.checkHasTrustDialogAccepted)();
                        if (!hasTrust && !(0, state_js_1.getIsNonInteractiveSession)()) {
                            error = new Error("Security: awsAuthRefresh executed before workspace trust is confirmed. If you see this message, post in ".concat(MACRO.FEEDBACK_CHANNEL, "."));
                            (0, debug_js_1.logAntError)('awsAuthRefresh invoked before trust check', error);
                            (0, index_js_1.logEvent)('tengu_awsAuthRefresh_missing_trust', {});
                            return [2 /*return*/, false];
                        }
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    (0, debug_js_1.logForDebugging)('Fetching AWS caller identity for AWS auth refresh command');
                    return [4 /*yield*/, (0, aws_js_1.checkStsCallerIdentity)()];
                case 2:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)('Fetched AWS caller identity, skipping AWS auth refresh command');
                    return [2 /*return*/, false];
                case 3:
                    _a = _b.sent();
                    // only actually do the refresh if caller-identity calls
                    return [2 /*return*/, refreshAwsAuth(awsAuthRefresh)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Timeout for AWS auth refresh command (3 minutes).
// Long enough for browser-based SSO flows, short enough to prevent indefinite hangs.
var AWS_AUTH_REFRESH_TIMEOUT_MS = 3 * 60 * 1000;
function refreshAwsAuth(awsAuthRefresh) {
    (0, debug_js_1.logForDebugging)('Running AWS auth refresh command');
    // Start tracking authentication status
    var authStatusManager = awsAuthStatusManager_js_1.AwsAuthStatusManager.getInstance();
    authStatusManager.startAuthentication();
    return new Promise(function (resolve) {
        var refreshProc = (0, child_process_1.exec)(awsAuthRefresh, {
            timeout: AWS_AUTH_REFRESH_TIMEOUT_MS,
        });
        refreshProc.stdout.on('data', function (data) {
            var output = data.toString().trim();
            if (output) {
                // Add output to status manager for UI display
                authStatusManager.addOutput(output);
                // Also log for debugging
                (0, debug_js_1.logForDebugging)(output, { level: 'debug' });
            }
        });
        refreshProc.stderr.on('data', function (data) {
            var error = data.toString().trim();
            if (error) {
                authStatusManager.setError(error);
                (0, debug_js_1.logForDebugging)(error, { level: 'error' });
            }
        });
        refreshProc.on('close', function (code, signal) {
            if (code === 0) {
                (0, debug_js_1.logForDebugging)('AWS auth refresh completed successfully');
                authStatusManager.endAuthentication(true);
                void resolve(true);
            }
            else {
                var timedOut = signal === 'SIGTERM';
                var message = timedOut
                    ? chalk_1.default.red('AWS auth refresh timed out after 3 minutes. Run your auth command manually in a separate terminal.')
                    : chalk_1.default.red('Error running awsAuthRefresh (in settings or ~/.claude.json):');
                // biome-ignore lint/suspicious/noConsole:: intentional console output
                console.error(message);
                authStatusManager.endAuthentication(false);
                void resolve(false);
            }
        });
    });
}
/**
 * Run awsCredentialExport to get credentials and set environment variables
 * Expects JSON output containing AWS credentials
 */
function getAwsCredsFromCredentialExport() {
    return __awaiter(this, void 0, void 0, function () {
        var awsCredentialExport, hasTrust, error, _a, result, awsOutput, e_2, message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    awsCredentialExport = getConfiguredAwsCredentialExport();
                    if (!awsCredentialExport) {
                        return [2 /*return*/, null];
                    }
                    // SECURITY: Check if awsCredentialExport is from project settings
                    if (isAwsCredentialExportFromProjectSettings()) {
                        hasTrust = (0, config_js_1.checkHasTrustDialogAccepted)();
                        if (!hasTrust && !(0, state_js_1.getIsNonInteractiveSession)()) {
                            error = new Error("Security: awsCredentialExport executed before workspace trust is confirmed. If you see this message, post in ".concat(MACRO.FEEDBACK_CHANNEL, "."));
                            (0, debug_js_1.logAntError)('awsCredentialExport invoked before trust check', error);
                            (0, index_js_1.logEvent)('tengu_awsCredentialExport_missing_trust', {});
                            return [2 /*return*/, null];
                        }
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 8]);
                    (0, debug_js_1.logForDebugging)('Fetching AWS caller identity for credential export command');
                    return [4 /*yield*/, (0, aws_js_1.checkStsCallerIdentity)()];
                case 2:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)('Fetched AWS caller identity, skipping AWS credential export command');
                    return [2 /*return*/, null];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    (0, debug_js_1.logForDebugging)('Running AWS credential export command');
                    return [4 /*yield*/, (0, execa_1.execa)(awsCredentialExport, {
                            shell: true,
                            reject: false,
                        })];
                case 5:
                    result = _b.sent();
                    if (result.exitCode !== 0 || !result.stdout) {
                        throw new Error('awsCredentialExport did not return a valid value');
                    }
                    awsOutput = (0, slowOperations_js_1.jsonParse)(result.stdout.trim());
                    if (!(0, aws_js_1.isValidAwsStsOutput)(awsOutput)) {
                        throw new Error('awsCredentialExport did not return valid AWS STS output structure');
                    }
                    (0, debug_js_1.logForDebugging)('AWS credentials retrieved from awsCredentialExport');
                    return [2 /*return*/, {
                            accessKeyId: awsOutput.Credentials.AccessKeyId,
                            secretAccessKey: awsOutput.Credentials.SecretAccessKey,
                            sessionToken: awsOutput.Credentials.SessionToken,
                        }];
                case 6:
                    e_2 = _b.sent();
                    message = chalk_1.default.red('Error getting AWS credentials from awsCredentialExport (in settings or ~/.claude.json):');
                    if (e_2 instanceof Error) {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error(message, e_2.message);
                    }
                    else {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error(message, e_2);
                    }
                    return [2 /*return*/, null];
                case 7: return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Refresh AWS authentication and get credentials with cache clearing
 * This combines runAwsAuthRefresh, getAwsCredsFromCredentialExport, and clearAwsIniCache
 * to ensure fresh credentials are always used
 */
exports.refreshAndGetAwsCredentials = (0, memoize_js_2.memoizeWithTTLAsync)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var refreshed, credentials;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, runAwsAuthRefresh()
                // Get credentials from export
            ];
            case 1:
                refreshed = _a.sent();
                return [4 /*yield*/, getAwsCredsFromCredentialExport()
                    // Clear AWS INI cache to ensure fresh credentials are used
                ];
            case 2:
                credentials = _a.sent();
                if (!(refreshed || credentials)) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, aws_js_1.clearAwsIniCache)()];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/, credentials];
        }
    });
}); }, DEFAULT_AWS_STS_TTL);
function clearAwsCredentialsCache() {
    exports.refreshAndGetAwsCredentials.cache.clear();
}
/**
 * Get the configured gcpAuthRefresh from settings
 */
function getConfiguredGcpAuthRefresh() {
    var mergedSettings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
    return mergedSettings.gcpAuthRefresh;
}
/**
 * Check if the configured gcpAuthRefresh comes from project settings
 */
function isGcpAuthRefreshFromProjectSettings() {
    var gcpAuthRefresh = getConfiguredGcpAuthRefresh();
    if (!gcpAuthRefresh) {
        return false;
    }
    var projectSettings = (0, settings_js_1.getSettingsForSource)('projectSettings');
    var localSettings = (0, settings_js_1.getSettingsForSource)('localSettings');
    return ((projectSettings === null || projectSettings === void 0 ? void 0 : projectSettings.gcpAuthRefresh) === gcpAuthRefresh ||
        (localSettings === null || localSettings === void 0 ? void 0 : localSettings.gcpAuthRefresh) === gcpAuthRefresh);
}
/** Short timeout for the GCP credentials probe. Without this, when no local
 *  credential source exists (no ADC file, no env var), google-auth-library falls
 *  through to the GCE metadata server which hangs ~12s outside GCP. */
var GCP_CREDENTIALS_CHECK_TIMEOUT_MS = 5000;
/**
 * Check if GCP credentials are currently valid by attempting to get an access token.
 * This uses the same authentication chain that the Vertex SDK uses.
 */
function checkGcpCredentialsValid() {
    return __awaiter(this, void 0, void 0, function () {
        var GoogleAuth, auth_1, probe, timeout, _a;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('google-auth-library'); })];
                case 1:
                    GoogleAuth = (_b.sent()).GoogleAuth;
                    auth_1 = new GoogleAuth({
                        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
                    });
                    probe = (function () { return __awaiter(_this, void 0, void 0, function () {
                        var client;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, auth_1.getClient()];
                                case 1:
                                    client = _a.sent();
                                    return [4 /*yield*/, client.getAccessToken()];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })();
                    timeout = (0, sleep_js_1.sleep)(GCP_CREDENTIALS_CHECK_TIMEOUT_MS).then(function () {
                        throw new GcpCredentialsTimeoutError('GCP credentials check timed out');
                    });
                    return [4 /*yield*/, Promise.race([probe, timeout])];
                case 2:
                    _b.sent();
                    return [2 /*return*/, true];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/** Default GCP credential TTL - 1 hour to match typical ADC token lifetime */
var DEFAULT_GCP_CREDENTIAL_TTL = 60 * 60 * 1000;
/**
 * Run gcpAuthRefresh to perform interactive authentication (e.g., gcloud auth application-default login)
 * Streams output in real-time for user visibility
 */
function runGcpAuthRefresh() {
    return __awaiter(this, void 0, void 0, function () {
        var gcpAuthRefresh, hasTrust, error, isValid, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    gcpAuthRefresh = getConfiguredGcpAuthRefresh();
                    if (!gcpAuthRefresh) {
                        return [2 /*return*/, false]; // Not configured, treat as success
                    }
                    // SECURITY: Check if gcpAuthRefresh is from project settings
                    if (isGcpAuthRefreshFromProjectSettings()) {
                        hasTrust = (0, config_js_1.checkHasTrustDialogAccepted)();
                        if (!hasTrust && !(0, state_js_1.getIsNonInteractiveSession)()) {
                            error = new Error("Security: gcpAuthRefresh executed before workspace trust is confirmed. If you see this message, post in ".concat(MACRO.FEEDBACK_CHANNEL, "."));
                            (0, debug_js_1.logAntError)('gcpAuthRefresh invoked before trust check', error);
                            (0, index_js_1.logEvent)('tengu_gcpAuthRefresh_missing_trust', {});
                            return [2 /*return*/, false];
                        }
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    (0, debug_js_1.logForDebugging)('Checking GCP credentials validity for auth refresh');
                    return [4 /*yield*/, checkGcpCredentialsValid()];
                case 2:
                    isValid = _b.sent();
                    if (isValid) {
                        (0, debug_js_1.logForDebugging)('GCP credentials are valid, skipping auth refresh command');
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, refreshGcpAuth(gcpAuthRefresh)];
            }
        });
    });
}
// Timeout for GCP auth refresh command (3 minutes).
// Long enough for browser-based auth flows, short enough to prevent indefinite hangs.
var GCP_AUTH_REFRESH_TIMEOUT_MS = 3 * 60 * 1000;
function refreshGcpAuth(gcpAuthRefresh) {
    (0, debug_js_1.logForDebugging)('Running GCP auth refresh command');
    // Start tracking authentication status. AwsAuthStatusManager is cloud-provider-agnostic
    // despite the name — print.ts emits its updates as generic SDK 'auth_status' messages.
    var authStatusManager = awsAuthStatusManager_js_1.AwsAuthStatusManager.getInstance();
    authStatusManager.startAuthentication();
    return new Promise(function (resolve) {
        var refreshProc = (0, child_process_1.exec)(gcpAuthRefresh, {
            timeout: GCP_AUTH_REFRESH_TIMEOUT_MS,
        });
        refreshProc.stdout.on('data', function (data) {
            var output = data.toString().trim();
            if (output) {
                // Add output to status manager for UI display
                authStatusManager.addOutput(output);
                // Also log for debugging
                (0, debug_js_1.logForDebugging)(output, { level: 'debug' });
            }
        });
        refreshProc.stderr.on('data', function (data) {
            var error = data.toString().trim();
            if (error) {
                authStatusManager.setError(error);
                (0, debug_js_1.logForDebugging)(error, { level: 'error' });
            }
        });
        refreshProc.on('close', function (code, signal) {
            if (code === 0) {
                (0, debug_js_1.logForDebugging)('GCP auth refresh completed successfully');
                authStatusManager.endAuthentication(true);
                void resolve(true);
            }
            else {
                var timedOut = signal === 'SIGTERM';
                var message = timedOut
                    ? chalk_1.default.red('GCP auth refresh timed out after 3 minutes. Run your auth command manually in a separate terminal.')
                    : chalk_1.default.red('Error running gcpAuthRefresh (in settings or ~/.claude.json):');
                // biome-ignore lint/suspicious/noConsole:: intentional console output
                console.error(message);
                authStatusManager.endAuthentication(false);
                void resolve(false);
            }
        });
    });
}
/**
 * Refresh GCP authentication if needed.
 * This function checks if credentials are valid and runs the refresh command if not.
 * Memoized with TTL to avoid excessive refresh attempts.
 */
exports.refreshGcpCredentialsIfNeeded = (0, memoize_js_2.memoizeWithTTLAsync)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var refreshed;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, runGcpAuthRefresh()];
            case 1:
                refreshed = _a.sent();
                return [2 /*return*/, refreshed];
        }
    });
}); }, DEFAULT_GCP_CREDENTIAL_TTL);
function clearGcpCredentialsCache() {
    exports.refreshGcpCredentialsIfNeeded.cache.clear();
}
/**
 * Prefetches GCP credentials only if workspace trust has already been established.
 * This allows us to start the potentially slow GCP commands early for trusted workspaces
 * while maintaining security for untrusted ones.
 *
 * Returns void to prevent misuse - use refreshGcpCredentialsIfNeeded() to actually refresh.
 */
function prefetchGcpCredentialsIfSafe() {
    // Check if gcpAuthRefresh is configured
    var gcpAuthRefresh = getConfiguredGcpAuthRefresh();
    if (!gcpAuthRefresh) {
        return;
    }
    // Check if gcpAuthRefresh is from project settings
    if (isGcpAuthRefreshFromProjectSettings()) {
        // Only prefetch if trust has already been established
        var hasTrust = (0, config_js_1.checkHasTrustDialogAccepted)();
        if (!hasTrust && !(0, state_js_1.getIsNonInteractiveSession)()) {
            // Don't prefetch - wait for trust to be established first
            return;
        }
    }
    // Safe to prefetch - either not from project settings or trust already established
    void (0, exports.refreshGcpCredentialsIfNeeded)();
}
/**
 * Prefetches AWS credentials only if workspace trust has already been established.
 * This allows us to start the potentially slow AWS commands early for trusted workspaces
 * while maintaining security for untrusted ones.
 *
 * Returns void to prevent misuse - use refreshAndGetAwsCredentials() to actually retrieve credentials.
 */
function prefetchAwsCredentialsAndBedRockInfoIfSafe() {
    // Check if either AWS command is configured
    var awsAuthRefresh = getConfiguredAwsAuthRefresh();
    var awsCredentialExport = getConfiguredAwsCredentialExport();
    if (!awsAuthRefresh && !awsCredentialExport) {
        return;
    }
    // Check if either command is from project settings
    if (isAwsAuthRefreshFromProjectSettings() ||
        isAwsCredentialExportFromProjectSettings()) {
        // Only prefetch if trust has already been established
        var hasTrust = (0, config_js_1.checkHasTrustDialogAccepted)();
        if (!hasTrust && !(0, state_js_1.getIsNonInteractiveSession)()) {
            // Don't prefetch - wait for trust to be established first
            return;
        }
    }
    // Safe to prefetch - either not from project settings or trust already established
    void (0, exports.refreshAndGetAwsCredentials)();
    (0, modelStrings_js_1.getModelStrings)();
}
/** @private Use {@link getAnthropicApiKey} or {@link getAnthropicApiKeyWithSource} */
exports.getApiKeyFromConfigOrMacOSKeychain = (0, memoize_js_1.default)(function () {
    if ((0, envUtils_js_1.isBareMode)())
        return null;
    // TODO: migrate to SecureStorage
    if (process.platform === 'darwin') {
        // keychainPrefetch.ts fires this read at main.tsx top-level in parallel
        // with module imports. If it completed, use that instead of spawning a
        // sync `security` subprocess here (~33ms).
        var prefetch = (0, keychainPrefetch_js_1.getLegacyApiKeyPrefetchResult)();
        if (prefetch) {
            if (prefetch.stdout) {
                return { key: prefetch.stdout, source: '/login managed key' };
            }
            // Prefetch completed with no key — fall through to config, not keychain.
        }
        else {
            var storageServiceName = (0, macOsKeychainHelpers_js_1.getMacOsKeychainStorageServiceName)();
            try {
                var result = (0, execFileNoThrow_js_1.execSyncWithDefaults_DEPRECATED)("security find-generic-password -a $USER -w -s \"".concat(storageServiceName, "\""));
                if (result) {
                    return { key: result, source: '/login managed key' };
                }
            }
            catch (e) {
                (0, log_js_1.logError)(e);
            }
        }
    }
    var config = (0, config_js_1.getGlobalConfig)();
    if (!config.primaryApiKey) {
        return null;
    }
    return { key: config.primaryApiKey, source: '/login managed key' };
});
function isValidApiKey(apiKey) {
    // Only allow alphanumeric characters, dashes, and underscores
    return /^[a-zA-Z0-9-_]+$/.test(apiKey);
}
function saveApiKey(apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var savedToKeychain, storageServiceName, username, hexValue, command, e_3, normalizedKey;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!isValidApiKey(apiKey)) {
                        throw new Error('Invalid API key format. API key must contain only alphanumeric characters, dashes, and underscores.');
                    }
                    // Store as primary API key
                    return [4 /*yield*/, maybeRemoveApiKeyFromMacOSKeychain()];
                case 1:
                    // Store as primary API key
                    _c.sent();
                    savedToKeychain = false;
                    if (!(process.platform === 'darwin')) return [3 /*break*/, 6];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    storageServiceName = (0, macOsKeychainHelpers_js_1.getMacOsKeychainStorageServiceName)();
                    username = (0, macOsKeychainHelpers_js_1.getUsername)();
                    hexValue = Buffer.from(apiKey, 'utf-8').toString('hex');
                    command = "add-generic-password -U -a \"".concat(username, "\" -s \"").concat(storageServiceName, "\" -X \"").concat(hexValue, "\"\n");
                    return [4 /*yield*/, (0, execa_1.execa)('security', ['-i'], {
                            input: command,
                            reject: false,
                        })];
                case 3:
                    _c.sent();
                    (0, index_js_1.logEvent)('tengu_api_key_saved_to_keychain', {});
                    savedToKeychain = true;
                    return [3 /*break*/, 5];
                case 4:
                    e_3 = _c.sent();
                    (0, log_js_1.logError)(e_3);
                    (0, index_js_1.logEvent)('tengu_api_key_keychain_error', {
                        error: (0, errors_js_1.errorMessage)(e_3),
                    });
                    (0, index_js_1.logEvent)('tengu_api_key_saved_to_config', {});
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    (0, index_js_1.logEvent)('tengu_api_key_saved_to_config', {});
                    _c.label = 7;
                case 7:
                    normalizedKey = (0, authPortable_js_1.normalizeApiKeyForConfig)(apiKey);
                    // Save config with all updates
                    (0, config_js_1.saveGlobalConfig)(function (current) {
                        var _a, _b, _c, _d;
                        var approved = (_b = (_a = current.customApiKeyResponses) === null || _a === void 0 ? void 0 : _a.approved) !== null && _b !== void 0 ? _b : [];
                        return __assign(__assign({}, current), { 
                            // Only save to config if keychain save failed or not on darwin
                            primaryApiKey: savedToKeychain ? current.primaryApiKey : apiKey, customApiKeyResponses: __assign(__assign({}, current.customApiKeyResponses), { approved: approved.includes(normalizedKey)
                                    ? approved
                                    : __spreadArray(__spreadArray([], approved, true), [normalizedKey], false), rejected: (_d = (_c = current.customApiKeyResponses) === null || _c === void 0 ? void 0 : _c.rejected) !== null && _d !== void 0 ? _d : [] }) });
                    });
                    // Clear memo cache
                    (_b = (_a = exports.getApiKeyFromConfigOrMacOSKeychain.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
                    (0, keychainPrefetch_js_1.clearLegacyApiKeyPrefetch)();
                    return [2 /*return*/];
            }
        });
    });
}
function isCustomApiKeyApproved(apiKey) {
    var _a, _b, _c;
    var config = (0, config_js_1.getGlobalConfig)();
    var normalizedKey = (0, authPortable_js_1.normalizeApiKeyForConfig)(apiKey);
    return ((_c = (_b = (_a = config.customApiKeyResponses) === null || _a === void 0 ? void 0 : _a.approved) === null || _b === void 0 ? void 0 : _b.includes(normalizedKey)) !== null && _c !== void 0 ? _c : false);
}
function removeApiKey() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, maybeRemoveApiKeyFromMacOSKeychain()
                    // Also remove from config instead of returning early, for older clients
                    // that set keys before we supported keychain.
                ];
                case 1:
                    _c.sent();
                    // Also remove from config instead of returning early, for older clients
                    // that set keys before we supported keychain.
                    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { primaryApiKey: undefined })); });
                    // Clear memo cache
                    (_b = (_a = exports.getApiKeyFromConfigOrMacOSKeychain.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
                    (0, keychainPrefetch_js_1.clearLegacyApiKeyPrefetch)();
                    return [2 /*return*/];
            }
        });
    });
}
function maybeRemoveApiKeyFromMacOSKeychain() {
    return __awaiter(this, void 0, void 0, function () {
        var e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, authPortable_js_1.maybeRemoveApiKeyFromMacOSKeychainThrows)()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_4 = _a.sent();
                    (0, log_js_1.logError)(e_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Function to store OAuth tokens in secure storage
function saveOAuthTokensIfNeeded(tokens) {
    var _a, _b, _c, _d, _e, _f;
    if (!(0, client_js_1.shouldUseClaudeAIAuth)(tokens.scopes)) {
        (0, index_js_1.logEvent)('tengu_oauth_tokens_not_claude_ai', {});
        return { success: true };
    }
    // Skip saving inference-only tokens (they come from env vars)
    if (!tokens.refreshToken || !tokens.expiresAt) {
        (0, index_js_1.logEvent)('tengu_oauth_tokens_inference_only', {});
        return { success: true };
    }
    var secureStorage = (0, index_js_2.getSecureStorage)();
    var storageBackend = secureStorage.name;
    try {
        var storageData = secureStorage.read() || {};
        var existingOauth = storageData.claudeAiOauth;
        storageData.claudeAiOauth = {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
            scopes: tokens.scopes,
            // Profile fetch in refreshOAuthToken swallows errors and returns null on
            // transient failures (network, 5xx, rate limit). Don't clobber a valid
            // stored subscription with null — fall back to the existing value.
            subscriptionType: (_b = (_a = tokens.subscriptionType) !== null && _a !== void 0 ? _a : existingOauth === null || existingOauth === void 0 ? void 0 : existingOauth.subscriptionType) !== null && _b !== void 0 ? _b : null,
            rateLimitTier: (_d = (_c = tokens.rateLimitTier) !== null && _c !== void 0 ? _c : existingOauth === null || existingOauth === void 0 ? void 0 : existingOauth.rateLimitTier) !== null && _d !== void 0 ? _d : null,
        };
        var updateStatus = secureStorage.update(storageData);
        if (updateStatus.success) {
            (0, index_js_1.logEvent)('tengu_oauth_tokens_saved', { storageBackend: storageBackend });
        }
        else {
            (0, index_js_1.logEvent)('tengu_oauth_tokens_save_failed', { storageBackend: storageBackend });
        }
        (_f = (_e = exports.getClaudeAIOAuthTokens.cache) === null || _e === void 0 ? void 0 : _e.clear) === null || _f === void 0 ? void 0 : _f.call(_e);
        (0, betas_js_1.clearBetasCaches)();
        (0, toolSchemaCache_js_1.clearToolSchemaCache)();
        return updateStatus;
    }
    catch (error) {
        (0, log_js_1.logError)(error);
        (0, index_js_1.logEvent)('tengu_oauth_tokens_save_exception', {
            storageBackend: storageBackend,
            error: (0, errors_js_1.errorMessage)(error),
        });
        return { success: false, warning: 'Failed to save OAuth tokens' };
    }
}
exports.getClaudeAIOAuthTokens = (0, memoize_js_1.default)(function () {
    // --bare: API-key-only. No OAuth env tokens, no keychain, no credentials file.
    if ((0, envUtils_js_1.isBareMode)())
        return null;
    // Check for force-set OAuth token from environment variable
    if (process.env.CLAUDE_CODE_OAUTH_TOKEN) {
        // Return an inference-only token (unknown refresh and expiry)
        return {
            accessToken: process.env.CLAUDE_CODE_OAUTH_TOKEN,
            refreshToken: null,
            expiresAt: null,
            scopes: ['user:inference'],
            subscriptionType: null,
            rateLimitTier: null,
        };
    }
    // Check for OAuth token from file descriptor
    var oauthTokenFromFd = (0, authFileDescriptor_js_1.getOAuthTokenFromFileDescriptor)();
    if (oauthTokenFromFd) {
        // Return an inference-only token (unknown refresh and expiry)
        return {
            accessToken: oauthTokenFromFd,
            refreshToken: null,
            expiresAt: null,
            scopes: ['user:inference'],
            subscriptionType: null,
            rateLimitTier: null,
        };
    }
    try {
        var secureStorage = (0, index_js_2.getSecureStorage)();
        var storageData = secureStorage.read();
        var oauthData = storageData === null || storageData === void 0 ? void 0 : storageData.claudeAiOauth;
        if (!(oauthData === null || oauthData === void 0 ? void 0 : oauthData.accessToken)) {
            return null;
        }
        return oauthData;
    }
    catch (error) {
        (0, log_js_1.logError)(error);
        return null;
    }
});
/**
 * Clears all OAuth token caches. Call this on 401 errors to ensure
 * the next token read comes from secure storage, not stale in-memory caches.
 * This handles the case where the local expiration check disagrees with the
 * server (e.g., due to clock corrections after token was issued).
 */
function clearOAuthTokenCache() {
    var _a, _b;
    (_b = (_a = exports.getClaudeAIOAuthTokens.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (0, macOsKeychainHelpers_js_1.clearKeychainCache)();
}
var lastCredentialsMtimeMs = 0;
// Cross-process staleness: another CC instance may write fresh tokens to
// disk (refresh or /login), but this process's memoize caches forever.
// Without this, terminal 1's /login fixes terminal 1; terminal 2's /login
// then revokes terminal 1 server-side, and terminal 1's memoize never
// re-reads — infinite /login regress (CC-1096, GH#24317).
function invalidateOAuthCacheIfDiskChanged() {
    return __awaiter(this, void 0, void 0, function () {
        var mtimeMs, _a;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.stat)((0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), '.credentials.json'))];
                case 1:
                    mtimeMs = (_d.sent()).mtimeMs;
                    if (mtimeMs !== lastCredentialsMtimeMs) {
                        lastCredentialsMtimeMs = mtimeMs;
                        clearOAuthTokenCache();
                    }
                    return [3 /*break*/, 3];
                case 2:
                    _a = _d.sent();
                    // ENOENT — macOS keychain path (file deleted on migration). Clear only
                    // the memoize so it delegates to the keychain cache's 30s TTL instead
                    // of caching forever on top. `security find-generic-password` is
                    // ~15ms; bounded to once per 30s by the keychain cache.
                    (_c = (_b = exports.getClaudeAIOAuthTokens.cache) === null || _b === void 0 ? void 0 : _b.clear) === null || _c === void 0 ? void 0 : _c.call(_b);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// In-flight dedup: when N claude.ai proxy connectors hit 401 with the same
// token simultaneously (common at startup — #20930), only one should clear
// caches and re-read the keychain. Without this, each call's clearOAuthTokenCache()
// nukes readInFlight in macOsKeychainStorage and triggers a fresh spawn —
// sync spawns stacked to 800ms+ of blocked render frames.
var pending401Handlers = new Map();
/**
 * Handle a 401 "OAuth token has expired" error from the API.
 *
 * This function forces a token refresh when the server says the token is expired,
 * even if our local expiration check disagrees (which can happen due to clock
 * issues when the token was issued).
 *
 * Safety: We compare the failed token with what's in keychain. If another tab
 * already refreshed (different token in keychain), we use that instead of
 * refreshing again. Concurrent calls with the same failedAccessToken are
 * deduplicated to a single keychain read.
 *
 * @param failedAccessToken - The access token that was rejected with 401
 * @returns true if we now have a valid token, false otherwise
 */
function handleOAuth401Error(failedAccessToken) {
    var pending = pending401Handlers.get(failedAccessToken);
    if (pending)
        return pending;
    var promise = handleOAuth401ErrorImpl(failedAccessToken).finally(function () {
        pending401Handlers.delete(failedAccessToken);
    });
    pending401Handlers.set(failedAccessToken, promise);
    return promise;
}
function handleOAuth401ErrorImpl(failedAccessToken) {
    return __awaiter(this, void 0, void 0, function () {
        var currentTokens;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Clear caches and re-read from keychain (async — sync read blocks ~100ms/call)
                    clearOAuthTokenCache();
                    return [4 /*yield*/, getClaudeAIOAuthTokensAsync()];
                case 1:
                    currentTokens = _a.sent();
                    if (!(currentTokens === null || currentTokens === void 0 ? void 0 : currentTokens.refreshToken)) {
                        return [2 /*return*/, false];
                    }
                    // If keychain has a different token, another tab already refreshed - use it
                    if (currentTokens.accessToken !== failedAccessToken) {
                        (0, index_js_1.logEvent)('tengu_oauth_401_recovered_from_keychain', {});
                        return [2 /*return*/, true];
                    }
                    // Same token that failed - force refresh, bypassing local expiration check
                    return [2 /*return*/, checkAndRefreshOAuthTokenIfNeeded(0, true)];
            }
        });
    });
}
/**
 * Reads OAuth tokens asynchronously, avoiding blocking keychain reads.
 * Delegates to the sync memoized version for env var / file descriptor tokens
 * (which don't hit the keychain), and only uses async for storage reads.
 */
function getClaudeAIOAuthTokensAsync() {
    return __awaiter(this, void 0, void 0, function () {
        var secureStorage, storageData, oauthData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if ((0, envUtils_js_1.isBareMode)())
                        return [2 /*return*/, null
                            // Env var and FD tokens are sync and don't hit the keychain
                        ];
                    // Env var and FD tokens are sync and don't hit the keychain
                    if (process.env.CLAUDE_CODE_OAUTH_TOKEN ||
                        (0, authFileDescriptor_js_1.getOAuthTokenFromFileDescriptor)()) {
                        return [2 /*return*/, (0, exports.getClaudeAIOAuthTokens)()];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    secureStorage = (0, index_js_2.getSecureStorage)();
                    return [4 /*yield*/, secureStorage.readAsync()];
                case 2:
                    storageData = _a.sent();
                    oauthData = storageData === null || storageData === void 0 ? void 0 : storageData.claudeAiOauth;
                    if (!(oauthData === null || oauthData === void 0 ? void 0 : oauthData.accessToken)) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, oauthData];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// In-flight promise for deduplicating concurrent calls
var pendingRefreshCheck = null;
function checkAndRefreshOAuthTokenIfNeeded(retryCount, force) {
    if (retryCount === void 0) { retryCount = 0; }
    if (force === void 0) { force = false; }
    // Deduplicate concurrent non-retry, non-force calls
    if (retryCount === 0 && !force) {
        if (pendingRefreshCheck) {
            return pendingRefreshCheck;
        }
        var promise = checkAndRefreshOAuthTokenIfNeededImpl(retryCount, force);
        pendingRefreshCheck = promise.finally(function () {
            pendingRefreshCheck = null;
        });
        return pendingRefreshCheck;
    }
    return checkAndRefreshOAuthTokenIfNeededImpl(retryCount, force);
}
function checkAndRefreshOAuthTokenIfNeededImpl(retryCount, force) {
    return __awaiter(this, void 0, void 0, function () {
        var MAX_RETRIES, tokens, freshTokens, claudeDir, release, err_1, lockedTokens, refreshedTokens, error_2, currentTokens;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    MAX_RETRIES = 5;
                    return [4 /*yield*/, invalidateOAuthCacheIfDiskChanged()
                        // First check if token is expired with cached value
                        // Skip this check if force=true (server already told us token is bad)
                    ];
                case 1:
                    _j.sent();
                    tokens = (0, exports.getClaudeAIOAuthTokens)();
                    if (!force) {
                        if (!(tokens === null || tokens === void 0 ? void 0 : tokens.refreshToken) || !(0, client_js_1.isOAuthTokenExpired)(tokens.expiresAt)) {
                            return [2 /*return*/, false];
                        }
                    }
                    if (!(tokens === null || tokens === void 0 ? void 0 : tokens.refreshToken)) {
                        return [2 /*return*/, false];
                    }
                    if (!(0, client_js_1.shouldUseClaudeAIAuth)(tokens.scopes)) {
                        return [2 /*return*/, false];
                    }
                    // Re-read tokens async to check if they're still expired
                    // Another process might have refreshed them
                    (_b = (_a = exports.getClaudeAIOAuthTokens.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
                    (0, macOsKeychainHelpers_js_1.clearKeychainCache)();
                    return [4 /*yield*/, getClaudeAIOAuthTokensAsync()];
                case 2:
                    freshTokens = _j.sent();
                    if (!(freshTokens === null || freshTokens === void 0 ? void 0 : freshTokens.refreshToken) ||
                        !(0, client_js_1.isOAuthTokenExpired)(freshTokens.expiresAt)) {
                        return [2 /*return*/, false];
                    }
                    claudeDir = (0, envUtils_js_1.getClaudeConfigHomeDir)();
                    return [4 /*yield*/, (0, promises_1.mkdir)(claudeDir, { recursive: true })];
                case 3:
                    _j.sent();
                    _j.label = 4;
                case 4:
                    _j.trys.push([4, 6, , 10]);
                    (0, index_js_1.logEvent)('tengu_oauth_token_refresh_lock_acquiring', {});
                    return [4 /*yield*/, lockfile.lock(claudeDir)];
                case 5:
                    release = _j.sent();
                    (0, index_js_1.logEvent)('tengu_oauth_token_refresh_lock_acquired', {});
                    return [3 /*break*/, 10];
                case 6:
                    err_1 = _j.sent();
                    if (!(err_1.code === 'ELOCKED')) return [3 /*break*/, 9];
                    if (!(retryCount < MAX_RETRIES)) return [3 /*break*/, 8];
                    (0, index_js_1.logEvent)('tengu_oauth_token_refresh_lock_retry', {
                        retryCount: retryCount + 1,
                    });
                    // Wait a bit before retrying
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(1000 + Math.random() * 1000)];
                case 7:
                    // Wait a bit before retrying
                    _j.sent();
                    return [2 /*return*/, checkAndRefreshOAuthTokenIfNeededImpl(retryCount + 1, force)];
                case 8:
                    (0, index_js_1.logEvent)('tengu_oauth_token_refresh_lock_retry_limit_reached', {
                        maxRetries: MAX_RETRIES,
                    });
                    return [2 /*return*/, false];
                case 9:
                    (0, log_js_1.logError)(err_1);
                    (0, index_js_1.logEvent)('tengu_oauth_token_refresh_lock_error', {
                        error: (0, errors_js_1.errorMessage)(err_1),
                    });
                    return [2 /*return*/, false];
                case 10:
                    _j.trys.push([10, 13, 15, 17]);
                    // Check one more time after acquiring lock
                    (_d = (_c = exports.getClaudeAIOAuthTokens.cache) === null || _c === void 0 ? void 0 : _c.clear) === null || _d === void 0 ? void 0 : _d.call(_c);
                    (0, macOsKeychainHelpers_js_1.clearKeychainCache)();
                    return [4 /*yield*/, getClaudeAIOAuthTokensAsync()];
                case 11:
                    lockedTokens = _j.sent();
                    if (!(lockedTokens === null || lockedTokens === void 0 ? void 0 : lockedTokens.refreshToken) ||
                        !(0, client_js_1.isOAuthTokenExpired)(lockedTokens.expiresAt)) {
                        (0, index_js_1.logEvent)('tengu_oauth_token_refresh_race_resolved', {});
                        return [2 /*return*/, false];
                    }
                    (0, index_js_1.logEvent)('tengu_oauth_token_refresh_starting', {});
                    return [4 /*yield*/, (0, client_js_1.refreshOAuthToken)(lockedTokens.refreshToken, {
                            // For Claude.ai subscribers, omit scopes so the default
                            // CLAUDE_AI_OAUTH_SCOPES applies — this allows scope expansion
                            // (e.g. adding user:file_upload) on refresh without re-login.
                            scopes: (0, client_js_1.shouldUseClaudeAIAuth)(lockedTokens.scopes)
                                ? undefined
                                : lockedTokens.scopes,
                        })];
                case 12:
                    refreshedTokens = _j.sent();
                    saveOAuthTokensIfNeeded(refreshedTokens);
                    // Clear the cache after refreshing token
                    (_f = (_e = exports.getClaudeAIOAuthTokens.cache) === null || _e === void 0 ? void 0 : _e.clear) === null || _f === void 0 ? void 0 : _f.call(_e);
                    (0, macOsKeychainHelpers_js_1.clearKeychainCache)();
                    return [2 /*return*/, true];
                case 13:
                    error_2 = _j.sent();
                    (0, log_js_1.logError)(error_2);
                    (_h = (_g = exports.getClaudeAIOAuthTokens.cache) === null || _g === void 0 ? void 0 : _g.clear) === null || _h === void 0 ? void 0 : _h.call(_g);
                    (0, macOsKeychainHelpers_js_1.clearKeychainCache)();
                    return [4 /*yield*/, getClaudeAIOAuthTokensAsync()];
                case 14:
                    currentTokens = _j.sent();
                    if (currentTokens && !(0, client_js_1.isOAuthTokenExpired)(currentTokens.expiresAt)) {
                        (0, index_js_1.logEvent)('tengu_oauth_token_refresh_race_recovered', {});
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
                case 15:
                    (0, index_js_1.logEvent)('tengu_oauth_token_refresh_lock_releasing', {});
                    return [4 /*yield*/, release()];
                case 16:
                    _j.sent();
                    (0, index_js_1.logEvent)('tengu_oauth_token_refresh_lock_released', {});
                    return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    });
}
function isClaudeAISubscriber() {
    var _a;
    if (!isAnthropicAuthEnabled()) {
        return false;
    }
    return (0, client_js_1.shouldUseClaudeAIAuth)((_a = (0, exports.getClaudeAIOAuthTokens)()) === null || _a === void 0 ? void 0 : _a.scopes);
}
/**
 * Check if the current OAuth token has the user:profile scope.
 *
 * Real /login tokens always include this scope. Env-var and file-descriptor
 * tokens (service keys) hardcode scopes to ['user:inference'] only. Use this
 * to gate calls to profile-scoped endpoints so service key sessions don't
 * generate 403 storms against /api/oauth/profile, bootstrap, etc.
 */
function hasProfileScope() {
    var _a, _b, _c;
    return ((_c = (_b = (_a = (0, exports.getClaudeAIOAuthTokens)()) === null || _a === void 0 ? void 0 : _a.scopes) === null || _b === void 0 ? void 0 : _b.includes(oauth_js_1.CLAUDE_AI_PROFILE_SCOPE)) !== null && _c !== void 0 ? _c : false);
}
function is1PApiCustomer() {
    // 1P API customers are users who are NOT:
    // 1. Claude.ai subscribers (Max, Pro, Enterprise, Team)
    // 2. Vertex AI users
    // 3. AWS Bedrock users
    // 4. Foundry users
    // Exclude Vertex, Bedrock, and Foundry customers
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_BEDROCK) ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_VERTEX) ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_FOUNDRY)) {
        return false;
    }
    // Exclude Claude.ai subscribers
    if (isClaudeAISubscriber()) {
        return false;
    }
    // Everyone else is an API customer (OAuth API customers, direct API key users, etc.)
    return true;
}
/**
 * Gets OAuth account information when Anthropic auth is enabled.
 * Returns undefined when using external API keys or third-party services.
 */
function getOauthAccountInfo() {
    return isAnthropicAuthEnabled() ? (0, config_js_1.getGlobalConfig)().oauthAccount : undefined;
}
/**
 * Checks if overage/extra usage provisioning is allowed for this organization.
 * This mirrors the logic in apps/claude-ai `useIsOverageProvisioningAllowed` hook as closely as possible.
 */
function isOverageProvisioningAllowed() {
    var accountInfo = getOauthAccountInfo();
    var billingType = accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.billingType;
    // Must be a Claude subscriber with a supported subscription type
    if (!isClaudeAISubscriber() || !billingType) {
        return false;
    }
    // only allow Stripe and mobile billing types to purchase extra usage
    if (billingType !== 'stripe_subscription' &&
        billingType !== 'stripe_subscription_contracted' &&
        billingType !== 'apple_subscription' &&
        billingType !== 'google_play_subscription') {
        return false;
    }
    return true;
}
// Returns whether the user has Opus access at all, regardless of whether they
// are a subscriber or PayG.
function hasOpusAccess() {
    var subscriptionType = getSubscriptionType();
    return (subscriptionType === 'max' ||
        subscriptionType === 'enterprise' ||
        subscriptionType === 'team' ||
        subscriptionType === 'pro' ||
        // subscriptionType === null covers both API users and the case where
        // subscribers do not have subscription type populated. For those
        // subscribers, when in doubt, we should not limit their access to Opus.
        subscriptionType === null);
}
function getSubscriptionType() {
    var _a;
    // Check for mock subscription type first (ANT-only testing)
    if ((0, mockRateLimits_js_1.shouldUseMockSubscription)()) {
        return (0, mockRateLimits_js_1.getMockSubscriptionType)();
    }
    if (!isAnthropicAuthEnabled()) {
        return null;
    }
    var oauthTokens = (0, exports.getClaudeAIOAuthTokens)();
    if (!oauthTokens) {
        return null;
    }
    return (_a = oauthTokens.subscriptionType) !== null && _a !== void 0 ? _a : null;
}
function isMaxSubscriber() {
    return getSubscriptionType() === 'max';
}
function isTeamSubscriber() {
    return getSubscriptionType() === 'team';
}
function isTeamPremiumSubscriber() {
    return (getSubscriptionType() === 'team' &&
        getRateLimitTier() === 'default_claude_max_5x');
}
function isEnterpriseSubscriber() {
    return getSubscriptionType() === 'enterprise';
}
function isProSubscriber() {
    return getSubscriptionType() === 'pro';
}
function getRateLimitTier() {
    var _a;
    if (!isAnthropicAuthEnabled()) {
        return null;
    }
    var oauthTokens = (0, exports.getClaudeAIOAuthTokens)();
    if (!oauthTokens) {
        return null;
    }
    return (_a = oauthTokens.rateLimitTier) !== null && _a !== void 0 ? _a : null;
}
function getSubscriptionName() {
    var subscriptionType = getSubscriptionType();
    switch (subscriptionType) {
        case 'enterprise':
            return 'Claude Enterprise';
        case 'team':
            return 'Claude Team';
        case 'max':
            return 'Claude Max';
        case 'pro':
            return 'Claude Pro';
        default:
            return 'Claude API';
    }
}
/** Check if using third-party services (Bedrock or Vertex or Foundry) */
function isUsing3PServices() {
    return !!((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_BEDROCK) ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_VERTEX) ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_FOUNDRY));
}
/**
 * Get the configured otelHeadersHelper from settings
 */
function getConfiguredOtelHeadersHelper() {
    var mergedSettings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
    return mergedSettings.otelHeadersHelper;
}
/**
 * Check if the configured otelHeadersHelper comes from project settings (projectSettings or localSettings)
 */
function isOtelHeadersHelperFromProjectOrLocalSettings() {
    var otelHeadersHelper = getConfiguredOtelHeadersHelper();
    if (!otelHeadersHelper) {
        return false;
    }
    var projectSettings = (0, settings_js_1.getSettingsForSource)('projectSettings');
    var localSettings = (0, settings_js_1.getSettingsForSource)('localSettings');
    return ((projectSettings === null || projectSettings === void 0 ? void 0 : projectSettings.otelHeadersHelper) === otelHeadersHelper ||
        (localSettings === null || localSettings === void 0 ? void 0 : localSettings.otelHeadersHelper) === otelHeadersHelper);
}
// Cache for debouncing otelHeadersHelper calls
var cachedOtelHeaders = null;
var cachedOtelHeadersTimestamp = 0;
var DEFAULT_OTEL_HEADERS_DEBOUNCE_MS = 29 * 60 * 1000; // 29 minutes
function getOtelHeadersFromHelper() {
    var _a;
    var otelHeadersHelper = getConfiguredOtelHeadersHelper();
    if (!otelHeadersHelper) {
        return {};
    }
    // Return cached headers if still valid (debounce)
    var debounceMs = parseInt(process.env.CLAUDE_CODE_OTEL_HEADERS_HELPER_DEBOUNCE_MS ||
        DEFAULT_OTEL_HEADERS_DEBOUNCE_MS.toString());
    if (cachedOtelHeaders &&
        Date.now() - cachedOtelHeadersTimestamp < debounceMs) {
        return cachedOtelHeaders;
    }
    if (isOtelHeadersHelperFromProjectOrLocalSettings()) {
        // Check if trust has been established for this project
        var hasTrust = (0, config_js_1.checkHasTrustDialogAccepted)();
        if (!hasTrust) {
            return {};
        }
    }
    try {
        var result = (_a = (0, execFileNoThrow_js_1.execSyncWithDefaults_DEPRECATED)(otelHeadersHelper, {
            timeout: 30000, // 30 seconds - allows for auth service latency
        })) === null || _a === void 0 ? void 0 : _a.toString().trim();
        if (!result) {
            throw new Error('otelHeadersHelper did not return a valid value');
        }
        var headers = (0, slowOperations_js_1.jsonParse)(result);
        if (typeof headers !== 'object' ||
            headers === null ||
            Array.isArray(headers)) {
            throw new Error('otelHeadersHelper must return a JSON object with string key-value pairs');
        }
        // Validate all values are strings
        for (var _i = 0, _b = Object.entries(headers); _i < _b.length; _i++) {
            var _c = _b[_i], key = _c[0], value = _c[1];
            if (typeof value !== 'string') {
                throw new Error("otelHeadersHelper returned non-string value for key \"".concat(key, "\": ").concat(typeof value));
            }
        }
        // Cache the result
        cachedOtelHeaders = headers;
        cachedOtelHeadersTimestamp = Date.now();
        return cachedOtelHeaders;
    }
    catch (error) {
        (0, log_js_1.logError)(new Error("Error getting OpenTelemetry headers from otelHeadersHelper (in settings): ".concat((0, errors_js_1.errorMessage)(error))));
        throw error;
    }
}
function isConsumerPlan(plan) {
    return plan === 'max' || plan === 'pro';
}
function isConsumerSubscriber() {
    var subscriptionType = getSubscriptionType();
    return (isClaudeAISubscriber() &&
        subscriptionType !== null &&
        isConsumerPlan(subscriptionType));
}
function getAccountInformation() {
    var _a, _b;
    var apiProvider = (0, providers_js_1.getAPIProvider)();
    // Only provide account info for first-party Anthropic API
    if (apiProvider !== 'firstParty') {
        return undefined;
    }
    var authTokenSource = getAuthTokenSource().source;
    var accountInfo = {};
    if (authTokenSource === 'CLAUDE_CODE_OAUTH_TOKEN' ||
        authTokenSource === 'CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR') {
        accountInfo.tokenSource = authTokenSource;
    }
    else if (isClaudeAISubscriber()) {
        accountInfo.subscription = getSubscriptionName();
    }
    else {
        accountInfo.tokenSource = authTokenSource;
    }
    var _c = getAnthropicApiKeyWithSource(), apiKey = _c.key, apiKeySource = _c.source;
    if (apiKey) {
        accountInfo.apiKeySource = apiKeySource;
    }
    // We don't know the organization if we're relying on an external API key or auth token
    if (authTokenSource === 'claude.ai' ||
        apiKeySource === '/login managed key') {
        // Get organization name from OAuth account info
        var orgName = (_a = getOauthAccountInfo()) === null || _a === void 0 ? void 0 : _a.organizationName;
        if (orgName) {
            accountInfo.organization = orgName;
        }
    }
    var email = (_b = getOauthAccountInfo()) === null || _b === void 0 ? void 0 : _b.emailAddress;
    if ((authTokenSource === 'claude.ai' ||
        apiKeySource === '/login managed key') &&
        email) {
        accountInfo.email = email;
    }
    return accountInfo;
}
/**
 * Validate that the active OAuth token belongs to the organization required
 * by `forceLoginOrgUUID` in managed settings. Returns a result object
 * rather than throwing so callers can choose how to surface the error.
 *
 * Fails closed: if `forceLoginOrgUUID` is set and we cannot determine the
 * token's org (network error, missing profile data), validation fails.
 */
function validateForceLoginOrg() {
    return __awaiter(this, void 0, void 0, function () {
        var requiredOrgUuid, tokens, source, isEnvVarToken, profile, tokenOrgUuid, envVarName;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // `claude ssh` remote: real auth lives on the local machine and is injected
                    // by the proxy. The placeholder token can't be validated against the profile
                    // endpoint. The local side already ran this check before establishing the session.
                    if (process.env.ANTHROPIC_UNIX_SOCKET) {
                        return [2 /*return*/, { valid: true }];
                    }
                    if (!isAnthropicAuthEnabled()) {
                        return [2 /*return*/, { valid: true }];
                    }
                    requiredOrgUuid = (_a = (0, settings_js_1.getSettingsForSource)('policySettings')) === null || _a === void 0 ? void 0 : _a.forceLoginOrgUUID;
                    if (!requiredOrgUuid) {
                        return [2 /*return*/, { valid: true }];
                    }
                    // Ensure the access token is fresh before hitting the profile endpoint.
                    // No-op for env-var tokens (refreshToken is null).
                    return [4 /*yield*/, checkAndRefreshOAuthTokenIfNeeded()];
                case 1:
                    // Ensure the access token is fresh before hitting the profile endpoint.
                    // No-op for env-var tokens (refreshToken is null).
                    _b.sent();
                    tokens = (0, exports.getClaudeAIOAuthTokens)();
                    if (!tokens) {
                        return [2 /*return*/, { valid: true }];
                    }
                    source = getAuthTokenSource().source;
                    isEnvVarToken = source === 'CLAUDE_CODE_OAUTH_TOKEN' ||
                        source === 'CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR';
                    return [4 /*yield*/, (0, getOauthProfile_js_1.getOauthProfileFromOauthToken)(tokens.accessToken)];
                case 2:
                    profile = _b.sent();
                    if (!profile) {
                        // Fail closed — we can't verify the org
                        return [2 /*return*/, {
                                valid: false,
                                message: "Unable to verify organization for the current authentication token.\n" +
                                    "This machine requires organization ".concat(requiredOrgUuid, " but the profile could not be fetched.\n") +
                                    "This may be a network error, or the token may lack the user:profile scope required for\n" +
                                    "verification (tokens from 'claude setup-token' do not include this scope).\n" +
                                    "Try again, or obtain a full-scope token via 'claude auth login'.",
                            }];
                    }
                    tokenOrgUuid = profile.organization.uuid;
                    if (tokenOrgUuid === requiredOrgUuid) {
                        return [2 /*return*/, { valid: true }];
                    }
                    if (isEnvVarToken) {
                        envVarName = source === 'CLAUDE_CODE_OAUTH_TOKEN'
                            ? 'CLAUDE_CODE_OAUTH_TOKEN'
                            : 'CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR';
                        return [2 /*return*/, {
                                valid: false,
                                message: "The ".concat(envVarName, " environment variable provides a token for a\n") +
                                    "different organization than required by this machine's managed settings.\n\n" +
                                    "Required organization: ".concat(requiredOrgUuid, "\n") +
                                    "Token organization:   ".concat(tokenOrgUuid, "\n\n") +
                                    "Remove the environment variable or obtain a token for the correct organization.",
                            }];
                    }
                    return [2 /*return*/, {
                            valid: false,
                            message: "Your authentication token belongs to organization ".concat(tokenOrgUuid, ",\n") +
                                "but this machine requires organization ".concat(requiredOrgUuid, ".\n\n") +
                                "Please log in with the correct organization: claude auth login",
                        }];
            }
        });
    });
}
var GcpCredentialsTimeoutError = /** @class */ (function (_super) {
    __extends(GcpCredentialsTimeoutError, _super);
    function GcpCredentialsTimeoutError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return GcpCredentialsTimeoutError;
}(Error));
