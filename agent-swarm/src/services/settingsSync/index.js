"use strict";
/**
 * Settings Sync Service
 *
 * Syncs user settings and memory files across Claude Code environments.
 *
 * - Interactive CLI: Uploads local settings to remote (incremental, only changed entries)
 * - CCR: Downloads remote settings to local before plugin installation
 *
 * Backend API: anthropic/anthropic#218817
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
exports.uploadUserSettingsInBackground = uploadUserSettingsInBackground;
exports._resetDownloadPromiseForTesting = _resetDownloadPromiseForTesting;
exports.downloadUserSettings = downloadUserSettings;
exports.redownloadUserSettings = redownloadUserSettings;
var bun_bundle_1 = require("bun:bundle");
var axios_1 = require("axios");
var promises_1 = require("fs/promises");
var pickBy_js_1 = require("lodash-es/pickBy.js");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var oauth_js_1 = require("../../constants/oauth.js");
var auth_js_1 = require("../../utils/auth.js");
var claudemd_js_1 = require("../../utils/claudemd.js");
var config_js_1 = require("../../utils/config.js");
var diagLogs_js_1 = require("../../utils/diagLogs.js");
var errors_js_1 = require("../../utils/errors.js");
var git_js_1 = require("../../utils/git.js");
var providers_js_1 = require("../../utils/model/providers.js");
var internalWrites_js_1 = require("../../utils/settings/internalWrites.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var settingsCache_js_1 = require("../../utils/settings/settingsCache.js");
var sleep_js_1 = require("../../utils/sleep.js");
var userAgent_js_1 = require("../../utils/userAgent.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
var index_js_1 = require("../analytics/index.js");
var withRetry_js_1 = require("../api/withRetry.js");
var types_js_1 = require("./types.js");
var SETTINGS_SYNC_TIMEOUT_MS = 10000; // 10 seconds
var DEFAULT_MAX_RETRIES = 3;
var MAX_FILE_SIZE_BYTES = 500 * 1024; // 500 KB per file (matches backend limit)
/**
 * Upload local settings to remote (interactive CLI only).
 * Called from main.tsx preAction.
 * Runs in background - caller should not await unless needed.
 */
function uploadUserSettingsInBackground() {
    return __awaiter(this, void 0, void 0, function () {
        var result, projectId, localEntries, remoteEntries_1, changedEntries, entryCount, uploadResult, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    if (!(0, bun_bundle_1.feature)('UPLOAD_USER_SETTINGS') ||
                        !(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_enable_settings_sync_push', false) ||
                        !(0, state_js_1.getIsInteractive)() ||
                        !isUsingOAuth()) {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_upload_skipped');
                        (0, index_js_1.logEvent)('tengu_settings_sync_upload_skipped_ineligible', {});
                        return [2 /*return*/];
                    }
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_upload_starting');
                    return [4 /*yield*/, fetchUserSettings()];
                case 1:
                    result = _b.sent();
                    if (!result.success) {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'settings_sync_upload_fetch_failed');
                        (0, index_js_1.logEvent)('tengu_settings_sync_upload_fetch_failed', {});
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, git_js_1.getRepoRemoteHash)()];
                case 2:
                    projectId = _b.sent();
                    return [4 /*yield*/, buildEntriesFromLocalFiles(projectId)];
                case 3:
                    localEntries = _b.sent();
                    remoteEntries_1 = result.isEmpty ? {} : result.data.content.entries;
                    changedEntries = (0, pickBy_js_1.default)(localEntries, function (value, key) { return remoteEntries_1[key] !== value; });
                    entryCount = Object.keys(changedEntries).length;
                    if (entryCount === 0) {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_upload_no_changes');
                        (0, index_js_1.logEvent)('tengu_settings_sync_upload_skipped', {});
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, uploadUserSettings(changedEntries)];
                case 4:
                    uploadResult = _b.sent();
                    if (uploadResult.success) {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_upload_success');
                        (0, index_js_1.logEvent)('tengu_settings_sync_upload_success', { entryCount: entryCount });
                    }
                    else {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'settings_sync_upload_failed');
                        (0, index_js_1.logEvent)('tengu_settings_sync_upload_failed', { entryCount: entryCount });
                    }
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    // Fail-open: log unexpected errors but don't block startup
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'settings_sync_unexpected_error');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Cached so the fire-and-forget at runHeadless entry and the await in
// installPluginsAndApplyMcpInBackground share one fetch.
var downloadPromise = null;
/** Test-only: clear the cached download promise between tests. */
function _resetDownloadPromiseForTesting() {
    downloadPromise = null;
}
/**
 * Download settings from remote for CCR mode.
 * Fired fire-and-forget at the top of print.ts runHeadless(); awaited in
 * installPluginsAndApplyMcpInBackground before plugin install. First call
 * starts the fetch; subsequent calls join it.
 * Returns true if settings were applied, false otherwise.
 */
function downloadUserSettings() {
    if (downloadPromise) {
        return downloadPromise;
    }
    downloadPromise = doDownloadUserSettings();
    return downloadPromise;
}
/**
 * Force a fresh download, bypassing the cached startup promise.
 * Called by /reload-plugins in CCR so mid-session settings changes
 * (enabledPlugins, extraKnownMarketplaces) pushed from the user's local
 * CLI are picked up before the plugin-cache sweep.
 *
 * No retries: user-initiated command, one attempt + fail-open. The user
 * can re-run /reload-plugins to retry. Startup path keeps DEFAULT_MAX_RETRIES.
 *
 * Caller is responsible for firing settingsChangeDetector.notifyChange
 * when this returns true — applyRemoteEntriesToLocal uses markInternalWrite
 * to suppress detection (correct for startup, but mid-session needs
 * applySettingsChange to run). Kept out of this module to avoid the
 * settingsSync → changeDetector cycle edge.
 */
function redownloadUserSettings() {
    downloadPromise = doDownloadUserSettings(0);
    return downloadPromise;
}
function doDownloadUserSettings() {
    return __awaiter(this, arguments, void 0, function (maxRetries) {
        var result, entries, projectId, entryCount, _a;
        if (maxRetries === void 0) { maxRetries = DEFAULT_MAX_RETRIES; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(0, bun_bundle_1.feature)('DOWNLOAD_USER_SETTINGS')) return [3 /*break*/, 6];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    if (!(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_strap_foyer', false) ||
                        !isUsingOAuth()) {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_download_skipped');
                        (0, index_js_1.logEvent)('tengu_settings_sync_download_skipped', {});
                        return [2 /*return*/, false];
                    }
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_download_starting');
                    return [4 /*yield*/, fetchUserSettings(maxRetries)];
                case 2:
                    result = _b.sent();
                    if (!result.success) {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'settings_sync_download_fetch_failed');
                        (0, index_js_1.logEvent)('tengu_settings_sync_download_fetch_failed', {});
                        return [2 /*return*/, false];
                    }
                    if (result.isEmpty) {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_download_empty');
                        (0, index_js_1.logEvent)('tengu_settings_sync_download_empty', {});
                        return [2 /*return*/, false];
                    }
                    entries = result.data.content.entries;
                    return [4 /*yield*/, (0, git_js_1.getRepoRemoteHash)()];
                case 3:
                    projectId = _b.sent();
                    entryCount = Object.keys(entries).length;
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_download_applying', {
                        entryCount: entryCount,
                    });
                    return [4 /*yield*/, applyRemoteEntriesToLocal(entries, projectId)];
                case 4:
                    _b.sent();
                    (0, index_js_1.logEvent)('tengu_settings_sync_download_success', { entryCount: entryCount });
                    return [2 /*return*/, true];
                case 5:
                    _a = _b.sent();
                    // Fail-open: log error but don't block CCR startup
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'settings_sync_download_error');
                    (0, index_js_1.logEvent)('tengu_settings_sync_download_error', {});
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Check if user is authenticated with first-party OAuth.
 * Required for settings sync in both CLI (upload) and CCR (download) modes.
 *
 * Only checks user:inference (not user:profile) — CCR's file-descriptor token
 * hardcodes scopes to ['user:inference'] only, so requiring profile would make
 * download a no-op there. Upload is independently guarded by getIsInteractive().
 */
function isUsingOAuth() {
    var _a;
    if ((0, providers_js_1.getAPIProvider)() !== 'firstParty' || !(0, providers_js_1.isFirstPartyAnthropicBaseUrl)()) {
        return false;
    }
    var tokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
    return Boolean((tokens === null || tokens === void 0 ? void 0 : tokens.accessToken) && ((_a = tokens.scopes) === null || _a === void 0 ? void 0 : _a.includes(oauth_js_1.CLAUDE_AI_INFERENCE_SCOPE)));
}
function getSettingsSyncEndpoint() {
    return "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/claude_code/user_settings");
}
function getSettingsSyncAuthHeaders() {
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
        error: 'No OAuth token available',
    };
}
function fetchUserSettingsOnce() {
    return __awaiter(this, void 0, void 0, function () {
        var authHeaders, headers, endpoint, response, parsed, error_1, _a, kind, message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()];
                case 1:
                    _b.sent();
                    authHeaders = getSettingsSyncAuthHeaders();
                    if (authHeaders.error) {
                        return [2 /*return*/, {
                                success: false,
                                error: authHeaders.error,
                                skipRetry: true,
                            }];
                    }
                    headers = __assign(__assign({}, authHeaders.headers), { 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)() });
                    endpoint = getSettingsSyncEndpoint();
                    return [4 /*yield*/, axios_1.default.get(endpoint, {
                            headers: headers,
                            timeout: SETTINGS_SYNC_TIMEOUT_MS,
                            validateStatus: function (status) { return status === 200 || status === 404; },
                        })
                        // 404 means no settings exist yet
                    ];
                case 2:
                    response = _b.sent();
                    // 404 means no settings exist yet
                    if (response.status === 404) {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_fetch_empty');
                        return [2 /*return*/, {
                                success: true,
                                isEmpty: true,
                            }];
                    }
                    parsed = (0, types_js_1.UserSyncDataSchema)().safeParse(response.data);
                    if (!parsed.success) {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'settings_sync_fetch_invalid_format');
                        return [2 /*return*/, {
                                success: false,
                                error: 'Invalid settings sync response format',
                            }];
                    }
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_fetch_success');
                    return [2 /*return*/, {
                            success: true,
                            data: parsed.data,
                            isEmpty: false,
                        }];
                case 3:
                    error_1 = _b.sent();
                    _a = (0, errors_js_1.classifyAxiosError)(error_1), kind = _a.kind, message = _a.message;
                    switch (kind) {
                        case 'auth':
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Not authorized for settings sync',
                                    skipRetry: true,
                                }];
                        case 'timeout':
                            return [2 /*return*/, { success: false, error: 'Settings sync request timeout' }];
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
function fetchUserSettings() {
    return __awaiter(this, arguments, void 0, function (maxRetries) {
        var lastResult, attempt, delayMs;
        if (maxRetries === void 0) { maxRetries = DEFAULT_MAX_RETRIES; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lastResult = null;
                    attempt = 1;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= maxRetries + 1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, fetchUserSettingsOnce()];
                case 2:
                    lastResult = _a.sent();
                    if (lastResult.success) {
                        return [2 /*return*/, lastResult];
                    }
                    if (lastResult.skipRetry) {
                        return [2 /*return*/, lastResult];
                    }
                    if (attempt > maxRetries) {
                        return [2 /*return*/, lastResult];
                    }
                    delayMs = (0, withRetry_js_1.getRetryDelay)(attempt);
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_retry', {
                        attempt: attempt,
                        maxRetries: maxRetries,
                        delayMs: delayMs,
                    });
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
function uploadUserSettings(entries) {
    return __awaiter(this, void 0, void 0, function () {
        var authHeaders, headers, endpoint, response, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()];
                case 1:
                    _c.sent();
                    authHeaders = getSettingsSyncAuthHeaders();
                    if (authHeaders.error) {
                        return [2 /*return*/, {
                                success: false,
                                error: authHeaders.error,
                            }];
                    }
                    headers = __assign(__assign({}, authHeaders.headers), { 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)(), 'Content-Type': 'application/json' });
                    endpoint = getSettingsSyncEndpoint();
                    return [4 /*yield*/, axios_1.default.put(endpoint, { entries: entries }, {
                            headers: headers,
                            timeout: SETTINGS_SYNC_TIMEOUT_MS,
                        })];
                case 2:
                    response = _c.sent();
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_uploaded', {
                        entryCount: Object.keys(entries).length,
                    });
                    return [2 /*return*/, {
                            success: true,
                            checksum: (_a = response.data) === null || _a === void 0 ? void 0 : _a.checksum,
                            lastModified: (_b = response.data) === null || _b === void 0 ? void 0 : _b.lastModified,
                        }];
                case 3:
                    error_2 = _c.sent();
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'settings_sync_upload_error');
                    return [2 /*return*/, {
                            success: false,
                            error: error_2 instanceof Error ? error_2.message : 'Unknown error',
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Try to read a file for sync, with size limit and error handling.
 * Returns null if file doesn't exist, is empty, or exceeds size limit.
 */
function tryReadFileForSync(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var stats, content, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                case 1:
                    stats = _b.sent();
                    if (stats.size > MAX_FILE_SIZE_BYTES) {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_file_too_large');
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, 'utf8')
                        // Check for empty/whitespace-only without allocating a trimmed copy
                    ];
                case 2:
                    content = _b.sent();
                    // Check for empty/whitespace-only without allocating a trimmed copy
                    if (!content || /^\s*$/.test(content)) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, content];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function buildEntriesFromLocalFiles(projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var entries, userSettingsPath, content, userMemoryPath, userMemoryContent, localSettingsPath, content, localMemoryPath, localMemoryContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    entries = {};
                    userSettingsPath = (0, settings_js_1.getSettingsFilePathForSource)('userSettings');
                    if (!userSettingsPath) return [3 /*break*/, 2];
                    return [4 /*yield*/, tryReadFileForSync(userSettingsPath)];
                case 1:
                    content = _a.sent();
                    if (content) {
                        entries[types_js_1.SYNC_KEYS.USER_SETTINGS] = content;
                    }
                    _a.label = 2;
                case 2:
                    userMemoryPath = (0, config_js_1.getMemoryPath)('User');
                    return [4 /*yield*/, tryReadFileForSync(userMemoryPath)];
                case 3:
                    userMemoryContent = _a.sent();
                    if (userMemoryContent) {
                        entries[types_js_1.SYNC_KEYS.USER_MEMORY] = userMemoryContent;
                    }
                    if (!projectId) return [3 /*break*/, 7];
                    localSettingsPath = (0, settings_js_1.getSettingsFilePathForSource)('localSettings');
                    if (!localSettingsPath) return [3 /*break*/, 5];
                    return [4 /*yield*/, tryReadFileForSync(localSettingsPath)];
                case 4:
                    content = _a.sent();
                    if (content) {
                        entries[types_js_1.SYNC_KEYS.projectSettings(projectId)] = content;
                    }
                    _a.label = 5;
                case 5:
                    localMemoryPath = (0, config_js_1.getMemoryPath)('Local');
                    return [4 /*yield*/, tryReadFileForSync(localMemoryPath)];
                case 6:
                    localMemoryContent = _a.sent();
                    if (localMemoryContent) {
                        entries[types_js_1.SYNC_KEYS.projectMemory(projectId)] = localMemoryContent;
                    }
                    _a.label = 7;
                case 7: return [2 /*return*/, entries];
            }
        });
    });
}
function writeFileForSync(filePath, content) {
    return __awaiter(this, void 0, void 0, function () {
        var parentDir, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    parentDir = (0, path_1.dirname)(filePath);
                    if (!parentDir) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, promises_1.mkdir)(parentDir, { recursive: true })];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2: return [4 /*yield*/, (0, promises_1.writeFile)(filePath, content, 'utf8')];
                case 3:
                    _b.sent();
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_file_written');
                    return [2 /*return*/, true];
                case 4:
                    _a = _b.sent();
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'settings_sync_file_write_failed');
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Apply remote entries to local files (CCR pull pattern).
 * Only writes files that match expected keys.
 *
 * After writing, invalidates relevant caches:
 * - resetSettingsCache() for settings files
 * - clearMemoryFileCaches() for memory files (CLAUDE.md)
 */
function applyRemoteEntriesToLocal(entries, projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var appliedCount, settingsWritten, memoryWritten, exceedsSizeLimit, userSettingsContent, userSettingsPath, userMemoryContent, userMemoryPath, projectSettingsKey, projectSettingsContent, localSettingsPath, projectMemoryKey, projectMemoryContent, localMemoryPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    appliedCount = 0;
                    settingsWritten = false;
                    memoryWritten = false;
                    exceedsSizeLimit = function (content, _path) {
                        var sizeBytes = Buffer.byteLength(content, 'utf8');
                        if (sizeBytes > MAX_FILE_SIZE_BYTES) {
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_file_too_large', {
                                sizeBytes: sizeBytes,
                                maxBytes: MAX_FILE_SIZE_BYTES,
                            });
                            return true;
                        }
                        return false;
                    };
                    userSettingsContent = entries[types_js_1.SYNC_KEYS.USER_SETTINGS];
                    if (!userSettingsContent) return [3 /*break*/, 2];
                    userSettingsPath = (0, settings_js_1.getSettingsFilePathForSource)('userSettings');
                    if (!(userSettingsPath &&
                        !exceedsSizeLimit(userSettingsContent, userSettingsPath))) return [3 /*break*/, 2];
                    // Mark as internal write to prevent spurious change detection
                    (0, internalWrites_js_1.markInternalWrite)(userSettingsPath);
                    return [4 /*yield*/, writeFileForSync(userSettingsPath, userSettingsContent)];
                case 1:
                    if (_a.sent()) {
                        appliedCount++;
                        settingsWritten = true;
                    }
                    _a.label = 2;
                case 2:
                    userMemoryContent = entries[types_js_1.SYNC_KEYS.USER_MEMORY];
                    if (!userMemoryContent) return [3 /*break*/, 4];
                    userMemoryPath = (0, config_js_1.getMemoryPath)('User');
                    if (!!exceedsSizeLimit(userMemoryContent, userMemoryPath)) return [3 /*break*/, 4];
                    return [4 /*yield*/, writeFileForSync(userMemoryPath, userMemoryContent)];
                case 3:
                    if (_a.sent()) {
                        appliedCount++;
                        memoryWritten = true;
                    }
                    _a.label = 4;
                case 4:
                    if (!projectId) return [3 /*break*/, 8];
                    projectSettingsKey = types_js_1.SYNC_KEYS.projectSettings(projectId);
                    projectSettingsContent = entries[projectSettingsKey];
                    if (!projectSettingsContent) return [3 /*break*/, 6];
                    localSettingsPath = (0, settings_js_1.getSettingsFilePathForSource)('localSettings');
                    if (!(localSettingsPath &&
                        !exceedsSizeLimit(projectSettingsContent, localSettingsPath))) return [3 /*break*/, 6];
                    // Mark as internal write to prevent spurious change detection
                    (0, internalWrites_js_1.markInternalWrite)(localSettingsPath);
                    return [4 /*yield*/, writeFileForSync(localSettingsPath, projectSettingsContent)];
                case 5:
                    if (_a.sent()) {
                        appliedCount++;
                        settingsWritten = true;
                    }
                    _a.label = 6;
                case 6:
                    projectMemoryKey = types_js_1.SYNC_KEYS.projectMemory(projectId);
                    projectMemoryContent = entries[projectMemoryKey];
                    if (!projectMemoryContent) return [3 /*break*/, 8];
                    localMemoryPath = (0, config_js_1.getMemoryPath)('Local');
                    if (!!exceedsSizeLimit(projectMemoryContent, localMemoryPath)) return [3 /*break*/, 8];
                    return [4 /*yield*/, writeFileForSync(localMemoryPath, projectMemoryContent)];
                case 7:
                    if (_a.sent()) {
                        appliedCount++;
                        memoryWritten = true;
                    }
                    _a.label = 8;
                case 8:
                    // Invalidate caches so subsequent reads pick up new content
                    if (settingsWritten) {
                        (0, settingsCache_js_1.resetSettingsCache)();
                    }
                    if (memoryWritten) {
                        (0, claudemd_js_1.clearMemoryFileCaches)();
                    }
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_sync_applied', {
                        appliedCount: appliedCount,
                    });
                    return [2 /*return*/];
            }
        });
    });
}
