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
exports._wouldLoseAuthStateForTesting = exports._getConfigForTesting = exports.getProjectPathForConfig = exports.CONFIG_WRITE_DISPLAY_THRESHOLD = exports.PROJECT_CONFIG_KEYS = exports.GLOBAL_CONFIG_KEYS = exports.DEFAULT_GLOBAL_CONFIG = exports.NOTIFICATION_CHANNELS = exports.EDITOR_MODES = void 0;
exports.isGlobalConfigKey = isGlobalConfigKey;
exports.resetTrustDialogAcceptedCacheForTesting = resetTrustDialogAcceptedCacheForTesting;
exports.checkHasTrustDialogAccepted = checkHasTrustDialogAccepted;
exports.isPathTrusted = isPathTrusted;
exports.isProjectConfigKey = isProjectConfigKey;
exports.saveGlobalConfig = saveGlobalConfig;
exports.getGlobalConfigWriteCount = getGlobalConfigWriteCount;
exports.getGlobalConfig = getGlobalConfig;
exports.getRemoteControlAtStartup = getRemoteControlAtStartup;
exports.getCustomApiKeyStatus = getCustomApiKeyStatus;
exports.enableConfigs = enableConfigs;
exports.getCurrentProjectConfig = getCurrentProjectConfig;
exports.saveCurrentProjectConfig = saveCurrentProjectConfig;
exports.isAutoUpdaterDisabled = isAutoUpdaterDisabled;
exports.shouldSkipPluginAutoupdate = shouldSkipPluginAutoupdate;
exports.formatAutoUpdaterDisabledReason = formatAutoUpdaterDisabledReason;
exports.getAutoUpdaterDisabledReason = getAutoUpdaterDisabledReason;
exports.getOrCreateUserID = getOrCreateUserID;
exports.recordFirstStartTime = recordFirstStartTime;
exports.getMemoryPath = getMemoryPath;
exports.getManagedClaudeRulesDir = getManagedClaudeRulesDir;
exports.getUserClaudeRulesDir = getUserClaudeRulesDir;
exports._setGlobalConfigCacheForTesting = _setGlobalConfigCacheForTesting;
var bun_bundle_1 = require("bun:bundle");
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var memoize_js_1 = require("lodash-es/memoize.js");
var pickBy_js_1 = require("lodash-es/pickBy.js");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var paths_js_1 = require("../memdir/paths.js");
var index_js_1 = require("../services/analytics/index.js");
var cwd_js_1 = require("../utils/cwd.js");
var cleanupRegistry_js_1 = require("./cleanupRegistry.js");
var debug_js_1 = require("./debug.js");
var diagLogs_js_1 = require("./diagLogs.js");
var env_js_1 = require("./env.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var file_js_1 = require("./file.js");
var fsOperations_js_1 = require("./fsOperations.js");
var git_js_1 = require("./git.js");
var json_js_1 = require("./json.js");
var jsonRead_js_1 = require("./jsonRead.js");
var lockfile = require("./lockfile.js");
var log_js_1 = require("./log.js");
var path_js_1 = require("./path.js");
var privacyLevel_js_1 = require("./privacyLevel.js");
var managedPath_js_1 = require("./settings/managedPath.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var teamMemPaths = (0, bun_bundle_1.feature)('TEAMMEM')
    ? require('../memdir/teamMemPaths.js')
    : null;
var ccrAutoConnect = (0, bun_bundle_1.feature)('CCR_AUTO_CONNECT')
    ? require('../bridge/bridgeEnabled.js')
    : null;
var slowOperations_js_1 = require("./slowOperations.js");
// Re-entrancy guard: prevents getConfig → logEvent → getGlobalConfig → getConfig
// infinite recursion when the config file is corrupted. logEvent's sampling check
// reads GrowthBook features from the global config, which calls getConfig again.
var insideGetConfig = false;
var DEFAULT_PROJECT_CONFIG = {
    allowedTools: [],
    mcpContextUris: [],
    mcpServers: {},
    enabledMcpjsonServers: [],
    disabledMcpjsonServers: [],
    hasTrustDialogAccepted: false,
    projectOnboardingSeenCount: 0,
    hasClaudeMdExternalIncludesApproved: false,
    hasClaudeMdExternalIncludesWarningShown: false,
};
var configConstants_js_1 = require("./configConstants.js");
Object.defineProperty(exports, "EDITOR_MODES", { enumerable: true, get: function () { return configConstants_js_1.EDITOR_MODES; } });
Object.defineProperty(exports, "NOTIFICATION_CHANNELS", { enumerable: true, get: function () { return configConstants_js_1.NOTIFICATION_CHANNELS; } });
/**
 * Factory for a fresh default GlobalConfig. Used instead of deep-cloning a
 * shared constant — the nested containers (arrays, records) are all empty, so
 * a factory gives fresh refs at zero clone cost.
 */
function createDefaultGlobalConfig() {
    return {
        numStartups: 0,
        installMethod: undefined,
        autoUpdates: undefined,
        theme: 'dark',
        preferredNotifChannel: 'auto',
        verbose: false,
        editorMode: 'normal',
        autoCompactEnabled: true,
        showTurnDuration: true,
        hasSeenTasksHint: false,
        hasUsedStash: false,
        hasUsedBackgroundTask: false,
        queuedCommandUpHintCount: 0,
        diffTool: 'auto',
        customApiKeyResponses: {
            approved: [],
            rejected: [],
        },
        env: {},
        tipsHistory: {},
        memoryUsageCount: 0,
        promptQueueUseCount: 0,
        btwUseCount: 0,
        todoFeatureEnabled: true,
        showExpandedTodos: false,
        messageIdleNotifThresholdMs: 60000,
        autoConnectIde: false,
        autoInstallIdeExtension: true,
        fileCheckpointingEnabled: true,
        terminalProgressBarEnabled: true,
        cachedStatsigGates: {},
        cachedDynamicConfigs: {},
        cachedGrowthBookFeatures: {},
        respectGitignore: true,
        copyFullResponse: false,
    };
}
exports.DEFAULT_GLOBAL_CONFIG = createDefaultGlobalConfig();
exports.GLOBAL_CONFIG_KEYS = [
    'apiKeyHelper',
    'installMethod',
    'autoUpdates',
    'autoUpdatesProtectedForNative',
    'theme',
    'verbose',
    'preferredNotifChannel',
    'shiftEnterKeyBindingInstalled',
    'editorMode',
    'hasUsedBackslashReturn',
    'autoCompactEnabled',
    'showTurnDuration',
    'diffTool',
    'env',
    'tipsHistory',
    'todoFeatureEnabled',
    'showExpandedTodos',
    'messageIdleNotifThresholdMs',
    'autoConnectIde',
    'autoInstallIdeExtension',
    'fileCheckpointingEnabled',
    'terminalProgressBarEnabled',
    'showStatusInTerminalTab',
    'taskCompleteNotifEnabled',
    'inputNeededNotifEnabled',
    'agentPushNotifEnabled',
    'respectGitignore',
    'claudeInChromeDefaultEnabled',
    'hasCompletedClaudeInChromeOnboarding',
    'lspRecommendationDisabled',
    'lspRecommendationNeverPlugins',
    'lspRecommendationIgnoredCount',
    'copyFullResponse',
    'copyOnSelect',
    'permissionExplainerEnabled',
    'prStatusFooterEnabled',
    'remoteControlAtStartup',
    'remoteDialogSeen',
];
function isGlobalConfigKey(key) {
    return exports.GLOBAL_CONFIG_KEYS.includes(key);
}
exports.PROJECT_CONFIG_KEYS = [
    'allowedTools',
    'hasTrustDialogAccepted',
    'hasCompletedProjectOnboarding',
];
/**
 * Check if the user has already accepted the trust dialog for the cwd.
 *
 * This function traverses parent directories to check if a parent directory
 * had approval. Accepting trust for a directory implies trust for child
 * directories.
 *
 * @returns Whether the trust dialog has been accepted (i.e. "should not be shown")
 */
var _trustAccepted = false;
function resetTrustDialogAcceptedCacheForTesting() {
    _trustAccepted = false;
}
function checkHasTrustDialogAccepted() {
    // Trust only transitions false→true during a session (never the reverse),
    // so once true we can latch it. false is not cached — it gets re-checked
    // on every call so that trust dialog acceptance is picked up mid-session.
    // (lodash memoize doesn't fit here because it would also cache false.)
    return (_trustAccepted || (_trustAccepted = computeTrustDialogAccepted()));
}
function computeTrustDialogAccepted() {
    var _a, _b;
    // Check session-level trust (for home directory case where trust is not persisted)
    // When running from home dir, trust dialog is shown but acceptance is stored
    // in memory only. This allows hooks and other features to work during the session.
    if ((0, state_js_1.getSessionTrustAccepted)()) {
        return true;
    }
    var config = getGlobalConfig();
    // Always check where trust would be saved (git root or original cwd)
    // This is the primary location where trust is persisted by saveCurrentProjectConfig
    var projectPath = (0, exports.getProjectPathForConfig)();
    var projectConfig = (_a = config.projects) === null || _a === void 0 ? void 0 : _a[projectPath];
    if (projectConfig === null || projectConfig === void 0 ? void 0 : projectConfig.hasTrustDialogAccepted) {
        return true;
    }
    // Now check from current working directory and its parents
    // Normalize paths for consistent JSON key lookup
    var currentPath = (0, path_js_1.normalizePathForConfigKey)((0, cwd_js_1.getCwd)());
    // Traverse all parent directories
    while (true) {
        var pathConfig = (_b = config.projects) === null || _b === void 0 ? void 0 : _b[currentPath];
        if (pathConfig === null || pathConfig === void 0 ? void 0 : pathConfig.hasTrustDialogAccepted) {
            return true;
        }
        var parentPath = (0, path_js_1.normalizePathForConfigKey)((0, path_1.resolve)(currentPath, '..'));
        // Stop if we've reached the root (when parent is same as current)
        if (parentPath === currentPath) {
            break;
        }
        currentPath = parentPath;
    }
    return false;
}
/**
 * Check trust for an arbitrary directory (not the session cwd).
 * Walks up from `dir`, returning true if any ancestor has trust persisted.
 * Unlike checkHasTrustDialogAccepted, this does NOT consult session trust or
 * the memoized project path — use when the target dir differs from cwd (e.g.
 * /assistant installing into a user-typed path).
 */
function isPathTrusted(dir) {
    var _a, _b;
    var config = getGlobalConfig();
    var currentPath = (0, path_js_1.normalizePathForConfigKey)((0, path_1.resolve)(dir));
    while (true) {
        if ((_b = (_a = config.projects) === null || _a === void 0 ? void 0 : _a[currentPath]) === null || _b === void 0 ? void 0 : _b.hasTrustDialogAccepted)
            return true;
        var parentPath = (0, path_js_1.normalizePathForConfigKey)((0, path_1.resolve)(currentPath, '..'));
        if (parentPath === currentPath)
            return false;
        currentPath = parentPath;
    }
}
// We have to put this test code here because Jest doesn't support mocking ES modules :O
var TEST_GLOBAL_CONFIG_FOR_TESTING = __assign(__assign({}, exports.DEFAULT_GLOBAL_CONFIG), { autoUpdates: false });
var TEST_PROJECT_CONFIG_FOR_TESTING = __assign({}, DEFAULT_PROJECT_CONFIG);
function isProjectConfigKey(key) {
    return exports.PROJECT_CONFIG_KEYS.includes(key);
}
/**
 * Detect whether writing `fresh` would lose auth/onboarding state that the
 * in-memory cache still has. This happens when `getConfig` hits a corrupted
 * or truncated file mid-write (from another process or a non-atomic fallback)
 * and returns DEFAULT_GLOBAL_CONFIG. Writing that back would permanently
 * wipe auth. See GH #3117.
 */
function wouldLoseAuthState(fresh) {
    var cached = globalConfigCache.config;
    if (!cached)
        return false;
    var lostOauth = cached.oauthAccount !== undefined && fresh.oauthAccount === undefined;
    var lostOnboarding = cached.hasCompletedOnboarding === true &&
        fresh.hasCompletedOnboarding !== true;
    return lostOauth || lostOnboarding;
}
function saveGlobalConfig(updater) {
    if (process.env.NODE_ENV === 'test') {
        var config = updater(TEST_GLOBAL_CONFIG_FOR_TESTING);
        // Skip if no changes (same reference returned)
        if (config === TEST_GLOBAL_CONFIG_FOR_TESTING) {
            return;
        }
        Object.assign(TEST_GLOBAL_CONFIG_FOR_TESTING, config);
        return;
    }
    var written = null;
    try {
        var didWrite = saveConfigWithLock((0, env_js_1.getGlobalClaudeFile)(), createDefaultGlobalConfig, function (current) {
            var config = updater(current);
            // Skip if no changes (same reference returned)
            if (config === current) {
                return current;
            }
            written = __assign(__assign({}, config), { projects: removeProjectHistory(current.projects) });
            return written;
        });
        // Only write-through if we actually wrote. If the auth-loss guard
        // tripped (or the updater made no changes), the file is untouched and
        // the cache is still valid -- touching it would corrupt the guard.
        if (didWrite && written) {
            writeThroughGlobalConfigCache(written);
        }
    }
    catch (error) {
        (0, debug_js_1.logForDebugging)("Failed to save config with lock: ".concat(error), {
            level: 'error',
        });
        // Fall back to non-locked version on error. This fallback is a race
        // window: if another process is mid-write (or the file got truncated),
        // getConfig returns defaults. Refuse to write those over a good cached
        // config to avoid wiping auth. See GH #3117.
        var currentConfig = getConfig((0, env_js_1.getGlobalClaudeFile)(), createDefaultGlobalConfig);
        if (wouldLoseAuthState(currentConfig)) {
            (0, debug_js_1.logForDebugging)('saveGlobalConfig fallback: re-read config is missing auth that cache has; refusing to write. See GH #3117.', { level: 'error' });
            (0, index_js_1.logEvent)('tengu_config_auth_loss_prevented', {});
            return;
        }
        var config = updater(currentConfig);
        // Skip if no changes (same reference returned)
        if (config === currentConfig) {
            return;
        }
        written = __assign(__assign({}, config), { projects: removeProjectHistory(currentConfig.projects) });
        saveConfig((0, env_js_1.getGlobalClaudeFile)(), written, exports.DEFAULT_GLOBAL_CONFIG);
        writeThroughGlobalConfigCache(written);
    }
}
// Cache for global config
var globalConfigCache = {
    config: null,
    mtime: 0,
};
// Tracking for config file operations (telemetry)
var lastReadFileStats = null;
var configCacheHits = 0;
var configCacheMisses = 0;
// Session-total count of actual disk writes to the global config file.
// Exposed for ant-only dev diagnostics (see inc-4552) so anomalous write
// rates surface in the UI before they corrupt ~/.claude.json.
var globalConfigWriteCount = 0;
function getGlobalConfigWriteCount() {
    return globalConfigWriteCount;
}
exports.CONFIG_WRITE_DISPLAY_THRESHOLD = 20;
function reportConfigCacheStats() {
    var total = configCacheHits + configCacheMisses;
    if (total > 0) {
        (0, index_js_1.logEvent)('tengu_config_cache_stats', {
            cache_hits: configCacheHits,
            cache_misses: configCacheMisses,
            hit_rate: configCacheHits / total,
        });
    }
    configCacheHits = 0;
    configCacheMisses = 0;
}
// Register cleanup to report cache stats at session end
// eslint-disable-next-line custom-rules/no-top-level-side-effects
(0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        reportConfigCacheStats();
        return [2 /*return*/];
    });
}); });
/**
 * Migrates old autoUpdaterStatus to new installMethod and autoUpdates fields
 * @internal
 */
function migrateConfigFields(config) {
    var _a;
    // Already migrated
    if (config.installMethod !== undefined) {
        return config;
    }
    // autoUpdaterStatus is removed from the type but may exist in old configs
    var legacy = config;
    // Determine install method and auto-update preference from old field
    var installMethod = 'unknown';
    var autoUpdates = (_a = config.autoUpdates) !== null && _a !== void 0 ? _a : true; // Default to enabled unless explicitly disabled
    switch (legacy.autoUpdaterStatus) {
        case 'migrated':
            installMethod = 'local';
            break;
        case 'installed':
            installMethod = 'native';
            break;
        case 'disabled':
            // When disabled, we don't know the install method
            autoUpdates = false;
            break;
        case 'enabled':
        case 'no_permissions':
        case 'not_configured':
            // These imply global installation
            installMethod = 'global';
            break;
        case undefined:
            // No old status, keep defaults
            break;
    }
    return __assign(__assign({}, config), { installMethod: installMethod, autoUpdates: autoUpdates });
}
/**
 * Removes history field from projects (migrated to history.jsonl)
 * @internal
 */
function removeProjectHistory(projects) {
    if (!projects) {
        return projects;
    }
    var cleanedProjects = {};
    var needsCleaning = false;
    for (var _i = 0, _a = Object.entries(projects); _i < _a.length; _i++) {
        var _b = _a[_i], path = _b[0], projectConfig = _b[1];
        // history is removed from the type but may exist in old configs
        var legacy = projectConfig;
        if (legacy.history !== undefined) {
            needsCleaning = true;
            var history_1 = legacy.history, cleanedConfig = __rest(legacy, ["history"]);
            cleanedProjects[path] = cleanedConfig;
        }
        else {
            cleanedProjects[path] = projectConfig;
        }
    }
    return needsCleaning ? cleanedProjects : projects;
}
// fs.watchFile poll interval for detecting writes from other instances (ms)
var CONFIG_FRESHNESS_POLL_MS = 1000;
var freshnessWatcherStarted = false;
// fs.watchFile polls stat on the libuv threadpool and only calls us when mtime
// changed — a stalled stat never blocks the main thread.
function startGlobalConfigFreshnessWatcher() {
    var _this = this;
    if (freshnessWatcherStarted || process.env.NODE_ENV === 'test')
        return;
    freshnessWatcherStarted = true;
    var file = (0, env_js_1.getGlobalClaudeFile)();
    (0, fs_1.watchFile)(file, { interval: CONFIG_FRESHNESS_POLL_MS, persistent: false }, function (curr) {
        // Our own writes fire this too — the write-through's Date.now()
        // overshoot makes cache.mtime > file mtime, so we skip the re-read.
        // Bun/Node also fire with curr.mtimeMs=0 when the file doesn't exist
        // (initial callback or deletion) — the <= handles that too.
        if (curr.mtimeMs <= globalConfigCache.mtime)
            return;
        void (0, fsOperations_js_1.getFsImplementation)()
            .readFile(file, { encoding: 'utf-8' })
            .then(function (content) {
            // A write-through may have advanced the cache while we were reading;
            // don't regress to the stale snapshot watchFile stat'd.
            if (curr.mtimeMs <= globalConfigCache.mtime)
                return;
            var parsed = (0, json_js_1.safeParseJSON)((0, jsonRead_js_1.stripBOM)(content));
            if (parsed === null || typeof parsed !== 'object')
                return;
            globalConfigCache = {
                config: migrateConfigFields(__assign(__assign({}, createDefaultGlobalConfig()), parsed)),
                mtime: curr.mtimeMs,
            };
            lastReadFileStats = { mtime: curr.mtimeMs, size: curr.size };
        })
            .catch(function () { });
    });
    (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            (0, fs_1.unwatchFile)(file);
            freshnessWatcherStarted = false;
            return [2 /*return*/];
        });
    }); });
}
// Write-through: what we just wrote IS the new config. cache.mtime overshoots
// the file's real mtime (Date.now() is recorded after the write) so the
// freshness watcher skips re-reading our own write on its next tick.
function writeThroughGlobalConfigCache(config) {
    globalConfigCache = { config: config, mtime: Date.now() };
    lastReadFileStats = null;
}
function getGlobalConfig() {
    var _a;
    if (process.env.NODE_ENV === 'test') {
        return TEST_GLOBAL_CONFIG_FOR_TESTING;
    }
    // Fast path: pure memory read. After startup, this always hits — our own
    // writes go write-through and other instances' writes are picked up by the
    // background freshness watcher (never blocks this path).
    if (globalConfigCache.config) {
        configCacheHits++;
        return globalConfigCache.config;
    }
    // Slow path: startup load. Sync I/O here is acceptable because it runs
    // exactly once, before any UI is rendered. Stat before read so any race
    // self-corrects (old mtime + new content → watcher re-reads next tick).
    configCacheMisses++;
    try {
        var stats = null;
        try {
            stats = (0, fsOperations_js_1.getFsImplementation)().statSync((0, env_js_1.getGlobalClaudeFile)());
        }
        catch (_b) {
            // File doesn't exist
        }
        var config = migrateConfigFields(getConfig((0, env_js_1.getGlobalClaudeFile)(), createDefaultGlobalConfig));
        globalConfigCache = {
            config: config,
            mtime: (_a = stats === null || stats === void 0 ? void 0 : stats.mtimeMs) !== null && _a !== void 0 ? _a : Date.now(),
        };
        lastReadFileStats = stats
            ? { mtime: stats.mtimeMs, size: stats.size }
            : null;
        startGlobalConfigFreshnessWatcher();
        return config;
    }
    catch (_c) {
        // If anything goes wrong, fall back to uncached behavior
        return migrateConfigFields(getConfig((0, env_js_1.getGlobalClaudeFile)(), createDefaultGlobalConfig));
    }
}
/**
 * Returns the effective value of remoteControlAtStartup. Precedence:
 *   1. User's explicit config value (always wins — honors opt-out)
 *   2. CCR auto-connect default (ant-only build, GrowthBook-gated)
 *   3. false (Remote Control must be explicitly opted into)
 */
function getRemoteControlAtStartup() {
    var explicit = getGlobalConfig().remoteControlAtStartup;
    if (explicit !== undefined)
        return explicit;
    if ((0, bun_bundle_1.feature)('CCR_AUTO_CONNECT')) {
        if (ccrAutoConnect === null || ccrAutoConnect === void 0 ? void 0 : ccrAutoConnect.getCcrAutoConnectDefault())
            return true;
    }
    return false;
}
function getCustomApiKeyStatus(truncatedApiKey) {
    var _a, _b, _c, _d;
    var config = getGlobalConfig();
    if ((_b = (_a = config.customApiKeyResponses) === null || _a === void 0 ? void 0 : _a.approved) === null || _b === void 0 ? void 0 : _b.includes(truncatedApiKey)) {
        return 'approved';
    }
    if ((_d = (_c = config.customApiKeyResponses) === null || _c === void 0 ? void 0 : _c.rejected) === null || _d === void 0 ? void 0 : _d.includes(truncatedApiKey)) {
        return 'rejected';
    }
    return 'new';
}
function saveConfig(file, config, defaultConfig) {
    // Ensure the directory exists before writing the config file
    var dir = (0, path_1.dirname)(file);
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    // mkdirSync is already recursive in FsOperations implementation
    fs.mkdirSync(dir);
    // Filter out any values that match the defaults
    var filteredConfig = (0, pickBy_js_1.default)(config, function (value, key) {
        return (0, slowOperations_js_1.jsonStringify)(value) !== (0, slowOperations_js_1.jsonStringify)(defaultConfig[key]);
    });
    // Write config file with secure permissions - mode only applies to new files
    (0, file_js_1.writeFileSyncAndFlush_DEPRECATED)(file, (0, slowOperations_js_1.jsonStringify)(filteredConfig, null, 2), {
        encoding: 'utf-8',
        mode: 384,
    });
    if (file === (0, env_js_1.getGlobalClaudeFile)()) {
        globalConfigWriteCount++;
    }
}
/**
 * Returns true if a write was performed; false if the write was skipped
 * (no changes, or auth-loss guard tripped). Callers use this to decide
 * whether to invalidate the cache -- invalidating after a skipped write
 * destroys the good cached state the auth-loss guard depends on.
 */
function saveConfigWithLock(file, createDefault, mergeFn) {
    var defaultConfig = createDefault();
    var dir = (0, path_1.dirname)(file);
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    // Ensure directory exists (mkdirSync is already recursive in FsOperations)
    fs.mkdirSync(dir);
    var release;
    try {
        var lockFilePath = "".concat(file, ".lock");
        var startTime = Date.now();
        release = lockfile.lockSync(file, {
            lockfilePath: lockFilePath,
            onCompromised: function (err) {
                // Default onCompromised throws from a setTimeout callback, which
                // becomes an unhandled exception. Log instead -- the lock being
                // stolen (e.g. after a 10s event-loop stall) is recoverable.
                (0, debug_js_1.logForDebugging)("Config lock compromised: ".concat(err), { level: 'error' });
            },
        });
        var lockTime = Date.now() - startTime;
        if (lockTime > 100) {
            (0, debug_js_1.logForDebugging)('Lock acquisition took longer than expected - another Claude instance may be running');
            (0, index_js_1.logEvent)('tengu_config_lock_contention', {
                lock_time_ms: lockTime,
            });
        }
        // Check for stale write - file changed since we last read it
        // Only check for global config file since lastReadFileStats tracks that specific file
        if (lastReadFileStats && file === (0, env_js_1.getGlobalClaudeFile)()) {
            try {
                var currentStats = fs.statSync(file);
                if (currentStats.mtimeMs !== lastReadFileStats.mtime ||
                    currentStats.size !== lastReadFileStats.size) {
                    (0, index_js_1.logEvent)('tengu_config_stale_write', {
                        read_mtime: lastReadFileStats.mtime,
                        write_mtime: currentStats.mtimeMs,
                        read_size: lastReadFileStats.size,
                        write_size: currentStats.size,
                    });
                }
            }
            catch (e) {
                var code = (0, errors_js_1.getErrnoCode)(e);
                if (code !== 'ENOENT') {
                    throw e;
                }
                // File doesn't exist yet, no stale check needed
            }
        }
        // Re-read the current config to get latest state. If the file is
        // momentarily corrupted (concurrent writes, kill-during-write), this
        // returns defaults -- we must not write those back over good config.
        var currentConfig = getConfig(file, createDefault);
        if (file === (0, env_js_1.getGlobalClaudeFile)() && wouldLoseAuthState(currentConfig)) {
            (0, debug_js_1.logForDebugging)('saveConfigWithLock: re-read config is missing auth that cache has; refusing to write to avoid wiping ~/.claude.json. See GH #3117.', { level: 'error' });
            (0, index_js_1.logEvent)('tengu_config_auth_loss_prevented', {});
            return false;
        }
        // Apply the merge function to get the updated config
        var mergedConfig = mergeFn(currentConfig);
        // Skip write if no changes (same reference returned)
        if (mergedConfig === currentConfig) {
            return false;
        }
        // Filter out any values that match the defaults
        var filteredConfig = (0, pickBy_js_1.default)(mergedConfig, function (value, key) {
            return (0, slowOperations_js_1.jsonStringify)(value) !== (0, slowOperations_js_1.jsonStringify)(defaultConfig[key]);
        });
        // Create timestamped backup of existing config before writing
        // We keep multiple backups to prevent data loss if a reset/corrupted config
        // overwrites a good backup. Backups are stored in ~/.claude/backups/ to
        // keep the home directory clean.
        try {
            var fileBase_1 = (0, path_1.basename)(file);
            var backupDir = getConfigBackupDir();
            // Ensure backup directory exists
            try {
                fs.mkdirSync(backupDir);
            }
            catch (mkdirErr) {
                var mkdirCode = (0, errors_js_1.getErrnoCode)(mkdirErr);
                if (mkdirCode !== 'EEXIST') {
                    throw mkdirErr;
                }
            }
            // Check existing backups first -- skip creating a new one if a recent
            // backup already exists. During startup, many saveGlobalConfig calls fire
            // within milliseconds of each other; without this check, each call
            // creates a new backup file that accumulates on disk.
            var MIN_BACKUP_INTERVAL_MS = 60000;
            var existingBackups = fs
                .readdirStringSync(backupDir)
                .filter(function (f) { return f.startsWith("".concat(fileBase_1, ".backup.")); })
                .sort()
                .reverse(); // Most recent first (timestamps sort lexicographically)
            var mostRecentBackup = existingBackups[0];
            var mostRecentTimestamp = mostRecentBackup
                ? Number(mostRecentBackup.split('.backup.').pop())
                : 0;
            var shouldCreateBackup = Number.isNaN(mostRecentTimestamp) ||
                Date.now() - mostRecentTimestamp >= MIN_BACKUP_INTERVAL_MS;
            if (shouldCreateBackup) {
                var backupPath = (0, path_1.join)(backupDir, "".concat(fileBase_1, ".backup.").concat(Date.now()));
                fs.copyFileSync(file, backupPath);
            }
            // Clean up old backups, keeping only the 5 most recent
            var MAX_BACKUPS = 5;
            // Re-read if we just created one; otherwise reuse the list
            var backupsForCleanup = shouldCreateBackup
                ? fs
                    .readdirStringSync(backupDir)
                    .filter(function (f) { return f.startsWith("".concat(fileBase_1, ".backup.")); })
                    .sort()
                    .reverse()
                : existingBackups;
            for (var _i = 0, _a = backupsForCleanup.slice(MAX_BACKUPS); _i < _a.length; _i++) {
                var oldBackup = _a[_i];
                try {
                    fs.unlinkSync((0, path_1.join)(backupDir, oldBackup));
                }
                catch (_b) {
                    // Ignore cleanup errors
                }
            }
        }
        catch (e) {
            var code = (0, errors_js_1.getErrnoCode)(e);
            if (code !== 'ENOENT') {
                (0, debug_js_1.logForDebugging)("Failed to backup config: ".concat(e), {
                    level: 'error',
                });
            }
            // No file to backup or backup failed, continue with write
        }
        // Write config file with secure permissions - mode only applies to new files
        (0, file_js_1.writeFileSyncAndFlush_DEPRECATED)(file, (0, slowOperations_js_1.jsonStringify)(filteredConfig, null, 2), {
            encoding: 'utf-8',
            mode: 384,
        });
        if (file === (0, env_js_1.getGlobalClaudeFile)()) {
            globalConfigWriteCount++;
        }
        return true;
    }
    finally {
        if (release) {
            release();
        }
    }
}
// Flag to track if config reading is allowed
var configReadingAllowed = false;
function enableConfigs() {
    if (configReadingAllowed) {
        // Ensure this is idempotent
        return;
    }
    var startTime = Date.now();
    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'enable_configs_started');
    // Any reads to configuration before this flag is set show an console warning
    // to prevent us from adding config reading during module initialization
    configReadingAllowed = true;
    // We only check the global config because currently all the configs share a file
    getConfig((0, env_js_1.getGlobalClaudeFile)(), createDefaultGlobalConfig, true /* throw on invalid */);
    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'enable_configs_completed', {
        duration_ms: Date.now() - startTime,
    });
}
/**
 * Returns the directory where config backup files are stored.
 * Uses ~/.claude/backups/ to keep the home directory clean.
 */
function getConfigBackupDir() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'backups');
}
/**
 * Find the most recent backup file for a given config file.
 * Checks ~/.claude/backups/ first, then falls back to the legacy location
 * (next to the config file) for backwards compatibility.
 * Returns the full path to the most recent backup, or null if none exist.
 */
function findMostRecentBackup(file) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var fileBase = (0, path_1.basename)(file);
    var backupDir = getConfigBackupDir();
    // Check the new backup directory first
    try {
        var backups = fs
            .readdirStringSync(backupDir)
            .filter(function (f) { return f.startsWith("".concat(fileBase, ".backup.")); })
            .sort();
        var mostRecent = backups.at(-1); // Timestamps sort lexicographically
        if (mostRecent) {
            return (0, path_1.join)(backupDir, mostRecent);
        }
    }
    catch (_a) {
        // Backup dir doesn't exist yet
    }
    // Fall back to legacy location (next to the config file)
    var fileDir = (0, path_1.dirname)(file);
    try {
        var backups = fs
            .readdirStringSync(fileDir)
            .filter(function (f) { return f.startsWith("".concat(fileBase, ".backup.")); })
            .sort();
        var mostRecent = backups.at(-1); // Timestamps sort lexicographically
        if (mostRecent) {
            return (0, path_1.join)(fileDir, mostRecent);
        }
        // Check for legacy backup file (no timestamp)
        var legacyBackup = "".concat(file, ".backup");
        try {
            fs.statSync(legacyBackup);
            return legacyBackup;
        }
        catch (_b) {
            // Legacy backup doesn't exist
        }
    }
    catch (_c) {
        // Ignore errors reading directory
    }
    return null;
}
function getConfig(file, createDefault, throwOnInvalid) {
    // Log a warning if config is accessed before it's allowed
    if (!configReadingAllowed && process.env.NODE_ENV !== 'test') {
        throw new Error('Config accessed before allowed.');
    }
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    try {
        var fileContent = fs.readFileSync(file, {
            encoding: 'utf-8',
        });
        try {
            // Strip BOM before parsing - PowerShell 5.x adds BOM to UTF-8 files
            var parsedConfig = (0, slowOperations_js_1.jsonParse)((0, jsonRead_js_1.stripBOM)(fileContent));
            return __assign(__assign({}, createDefault()), parsedConfig);
        }
        catch (error) {
            // Throw a ConfigParseError with the file path and default config
            var errorMessage = error instanceof Error ? error.message : String(error);
            throw new errors_js_1.ConfigParseError(errorMessage, file, createDefault());
        }
    }
    catch (error) {
        // Handle file not found - check for backup and return default
        var errCode = (0, errors_js_1.getErrnoCode)(error);
        if (errCode === 'ENOENT') {
            var backupPath = findMostRecentBackup(file);
            if (backupPath) {
                process.stderr.write("\nClaude configuration file not found at: ".concat(file, "\n") +
                    "A backup file exists at: ".concat(backupPath, "\n") +
                    "You can manually restore it by running: cp \"".concat(backupPath, "\" \"").concat(file, "\"\n\n"));
            }
            return createDefault();
        }
        // Re-throw ConfigParseError if throwOnInvalid is true
        if (error instanceof errors_js_1.ConfigParseError && throwOnInvalid) {
            throw error;
        }
        // Log config parse errors so users know what happened
        if (error instanceof errors_js_1.ConfigParseError) {
            (0, debug_js_1.logForDebugging)("Config file corrupted, resetting to defaults: ".concat(error.message), { level: 'error' });
            // Guard: logEvent → shouldSampleEvent → getGlobalConfig → getConfig
            // causes infinite recursion when the config file is corrupted, because
            // the sampling check reads a GrowthBook feature from global config.
            // Only log analytics on the outermost call.
            if (!insideGetConfig) {
                insideGetConfig = true;
                try {
                    // Log the error for monitoring
                    (0, log_js_1.logError)(error);
                    // Log analytics event for config corruption
                    var hasBackup = false;
                    try {
                        fs.statSync("".concat(file, ".backup"));
                        hasBackup = true;
                    }
                    catch (_a) {
                        // No backup
                    }
                    (0, index_js_1.logEvent)('tengu_config_parse_error', {
                        has_backup: hasBackup,
                    });
                }
                finally {
                    insideGetConfig = false;
                }
            }
            process.stderr.write("\nClaude configuration file at ".concat(file, " is corrupted: ").concat(error.message, "\n"));
            // Try to backup the corrupted config file (only if not already backed up)
            var fileBase_2 = (0, path_1.basename)(file);
            var corruptedBackupDir = getConfigBackupDir();
            // Ensure backup directory exists
            try {
                fs.mkdirSync(corruptedBackupDir);
            }
            catch (mkdirErr) {
                var mkdirCode = (0, errors_js_1.getErrnoCode)(mkdirErr);
                if (mkdirCode !== 'EEXIST') {
                    throw mkdirErr;
                }
            }
            var existingCorruptedBackups = fs
                .readdirStringSync(corruptedBackupDir)
                .filter(function (f) { return f.startsWith("".concat(fileBase_2, ".corrupted.")); });
            var corruptedBackupPath = void 0;
            var alreadyBackedUp = false;
            // Check if current corrupted content matches any existing backup
            var currentContent = fs.readFileSync(file, { encoding: 'utf-8' });
            for (var _i = 0, existingCorruptedBackups_1 = existingCorruptedBackups; _i < existingCorruptedBackups_1.length; _i++) {
                var backup = existingCorruptedBackups_1[_i];
                try {
                    var backupContent = fs.readFileSync((0, path_1.join)(corruptedBackupDir, backup), { encoding: 'utf-8' });
                    if (currentContent === backupContent) {
                        alreadyBackedUp = true;
                        break;
                    }
                }
                catch (_b) {
                    // Ignore read errors on backups
                }
            }
            if (!alreadyBackedUp) {
                corruptedBackupPath = (0, path_1.join)(corruptedBackupDir, "".concat(fileBase_2, ".corrupted.").concat(Date.now()));
                try {
                    fs.copyFileSync(file, corruptedBackupPath);
                    (0, debug_js_1.logForDebugging)("Corrupted config backed up to: ".concat(corruptedBackupPath), {
                        level: 'error',
                    });
                }
                catch (_c) {
                    // Ignore backup errors
                }
            }
            // Notify user about corrupted config and available backup
            var backupPath = findMostRecentBackup(file);
            if (corruptedBackupPath) {
                process.stderr.write("The corrupted file has been backed up to: ".concat(corruptedBackupPath, "\n"));
            }
            else if (alreadyBackedUp) {
                process.stderr.write("The corrupted file has already been backed up.\n");
            }
            if (backupPath) {
                process.stderr.write("A backup file exists at: ".concat(backupPath, "\n") +
                    "You can manually restore it by running: cp \"".concat(backupPath, "\" \"").concat(file, "\"\n\n"));
            }
            else {
                process.stderr.write("\n");
            }
        }
        return createDefault();
    }
}
// Memoized function to get the project path for config lookup
exports.getProjectPathForConfig = (0, memoize_js_1.default)(function () {
    var originalCwd = (0, state_js_1.getOriginalCwd)();
    var gitRoot = (0, git_js_1.findCanonicalGitRoot)(originalCwd);
    if (gitRoot) {
        // Normalize for consistent JSON keys (forward slashes on all platforms)
        // This ensures paths like C:\Users\... and C:/Users/... map to the same key
        return (0, path_js_1.normalizePathForConfigKey)(gitRoot);
    }
    // Not in a git repo
    return (0, path_js_1.normalizePathForConfigKey)((0, path_1.resolve)(originalCwd));
});
function getCurrentProjectConfig() {
    var _a, _b;
    if (process.env.NODE_ENV === 'test') {
        return TEST_PROJECT_CONFIG_FOR_TESTING;
    }
    var absolutePath = (0, exports.getProjectPathForConfig)();
    var config = getGlobalConfig();
    if (!config.projects) {
        return DEFAULT_PROJECT_CONFIG;
    }
    var projectConfig = (_a = config.projects[absolutePath]) !== null && _a !== void 0 ? _a : DEFAULT_PROJECT_CONFIG;
    // Not sure how this became a string
    // TODO: Fix upstream
    if (typeof projectConfig.allowedTools === 'string') {
        projectConfig.allowedTools =
            (_b = (0, json_js_1.safeParseJSON)(projectConfig.allowedTools)) !== null && _b !== void 0 ? _b : [];
    }
    return projectConfig;
}
function saveCurrentProjectConfig(updater) {
    var _a;
    var _b, _c;
    if (process.env.NODE_ENV === 'test') {
        var config = updater(TEST_PROJECT_CONFIG_FOR_TESTING);
        // Skip if no changes (same reference returned)
        if (config === TEST_PROJECT_CONFIG_FOR_TESTING) {
            return;
        }
        Object.assign(TEST_PROJECT_CONFIG_FOR_TESTING, config);
        return;
    }
    var absolutePath = (0, exports.getProjectPathForConfig)();
    var written = null;
    try {
        var didWrite = saveConfigWithLock((0, env_js_1.getGlobalClaudeFile)(), createDefaultGlobalConfig, function (current) {
            var _a;
            var _b, _c;
            var currentProjectConfig = (_c = (_b = current.projects) === null || _b === void 0 ? void 0 : _b[absolutePath]) !== null && _c !== void 0 ? _c : DEFAULT_PROJECT_CONFIG;
            var newProjectConfig = updater(currentProjectConfig);
            // Skip if no changes (same reference returned)
            if (newProjectConfig === currentProjectConfig) {
                return current;
            }
            written = __assign(__assign({}, current), { projects: __assign(__assign({}, current.projects), (_a = {}, _a[absolutePath] = newProjectConfig, _a)) });
            return written;
        });
        if (didWrite && written) {
            writeThroughGlobalConfigCache(written);
        }
    }
    catch (error) {
        (0, debug_js_1.logForDebugging)("Failed to save config with lock: ".concat(error), {
            level: 'error',
        });
        // Same race window as saveGlobalConfig's fallback -- refuse to write
        // defaults over good cached config. See GH #3117.
        var config = getConfig((0, env_js_1.getGlobalClaudeFile)(), createDefaultGlobalConfig);
        if (wouldLoseAuthState(config)) {
            (0, debug_js_1.logForDebugging)('saveCurrentProjectConfig fallback: re-read config is missing auth that cache has; refusing to write. See GH #3117.', { level: 'error' });
            (0, index_js_1.logEvent)('tengu_config_auth_loss_prevented', {});
            return;
        }
        var currentProjectConfig = (_c = (_b = config.projects) === null || _b === void 0 ? void 0 : _b[absolutePath]) !== null && _c !== void 0 ? _c : DEFAULT_PROJECT_CONFIG;
        var newProjectConfig = updater(currentProjectConfig);
        // Skip if no changes (same reference returned)
        if (newProjectConfig === currentProjectConfig) {
            return;
        }
        written = __assign(__assign({}, config), { projects: __assign(__assign({}, config.projects), (_a = {}, _a[absolutePath] = newProjectConfig, _a)) });
        saveConfig((0, env_js_1.getGlobalClaudeFile)(), written, exports.DEFAULT_GLOBAL_CONFIG);
        writeThroughGlobalConfigCache(written);
    }
}
function isAutoUpdaterDisabled() {
    return getAutoUpdaterDisabledReason() !== null;
}
/**
 * Returns true if plugin autoupdate should be skipped.
 * This checks if the auto-updater is disabled AND the FORCE_AUTOUPDATE_PLUGINS
 * env var is not set to 'true'. The env var allows forcing plugin autoupdate
 * even when the auto-updater is otherwise disabled.
 */
function shouldSkipPluginAutoupdate() {
    return (isAutoUpdaterDisabled() &&
        !(0, envUtils_js_1.isEnvTruthy)(process.env.FORCE_AUTOUPDATE_PLUGINS));
}
function formatAutoUpdaterDisabledReason(reason) {
    switch (reason.type) {
        case 'development':
            return 'development build';
        case 'env':
            return "".concat(reason.envVar, " set");
        case 'config':
            return 'config';
    }
}
function getAutoUpdaterDisabledReason() {
    if (process.env.NODE_ENV === 'development') {
        return { type: 'development' };
    }
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_AUTOUPDATER)) {
        return { type: 'env', envVar: 'DISABLE_AUTOUPDATER' };
    }
    var essentialTrafficEnvVar = (0, privacyLevel_js_1.getEssentialTrafficOnlyReason)();
    if (essentialTrafficEnvVar) {
        return { type: 'env', envVar: essentialTrafficEnvVar };
    }
    var config = getGlobalConfig();
    if (config.autoUpdates === false &&
        (config.installMethod !== 'native' ||
            config.autoUpdatesProtectedForNative !== true)) {
        return { type: 'config' };
    }
    return null;
}
function getOrCreateUserID() {
    var config = getGlobalConfig();
    if (config.userID) {
        return config.userID;
    }
    var userID = (0, crypto_1.randomBytes)(32).toString('hex');
    saveGlobalConfig(function (current) { return (__assign(__assign({}, current), { userID: userID })); });
    return userID;
}
function recordFirstStartTime() {
    var config = getGlobalConfig();
    if (!config.firstStartTime) {
        var firstStartTime_1 = new Date().toISOString();
        saveGlobalConfig(function (current) {
            var _a;
            return (__assign(__assign({}, current), { firstStartTime: (_a = current.firstStartTime) !== null && _a !== void 0 ? _a : firstStartTime_1 }));
        });
    }
}
function getMemoryPath(memoryType) {
    var cwd = (0, state_js_1.getOriginalCwd)();
    switch (memoryType) {
        case 'User':
            return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'CLAUDE.md');
        case 'Local':
            return (0, path_1.join)(cwd, 'CLAUDE.local.md');
        case 'Project':
            return (0, path_1.join)(cwd, 'CLAUDE.md');
        case 'Managed':
            return (0, path_1.join)((0, managedPath_js_1.getManagedFilePath)(), 'CLAUDE.md');
        case 'AutoMem':
            return (0, paths_js_1.getAutoMemEntrypoint)();
    }
    // TeamMem is only a valid MemoryType when feature('TEAMMEM') is true
    if ((0, bun_bundle_1.feature)('TEAMMEM')) {
        return teamMemPaths.getTeamMemEntrypoint();
    }
    return ''; // unreachable in external builds where TeamMem is not in MemoryType
}
function getManagedClaudeRulesDir() {
    return (0, path_1.join)((0, managedPath_js_1.getManagedFilePath)(), '.claude', 'rules');
}
function getUserClaudeRulesDir() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'rules');
}
// Exported for testing only
exports._getConfigForTesting = getConfig;
exports._wouldLoseAuthStateForTesting = wouldLoseAuthState;
function _setGlobalConfigCacheForTesting(config) {
    globalConfigCache.config = config;
    globalConfigCache.mtime = config ? Date.now() : 0;
}
