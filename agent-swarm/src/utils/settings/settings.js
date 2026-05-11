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
exports.getSettings_DEPRECATED = void 0;
exports.loadManagedFileSettings = loadManagedFileSettings;
exports.getManagedFileSettingsPresence = getManagedFileSettingsPresence;
exports.parseSettingsFile = parseSettingsFile;
exports.getSettingsRootPathForSource = getSettingsRootPathForSource;
exports.getSettingsFilePathForSource = getSettingsFilePathForSource;
exports.getRelativeSettingsFilePathForSource = getRelativeSettingsFilePathForSource;
exports.getSettingsForSource = getSettingsForSource;
exports.getPolicySettingsOrigin = getPolicySettingsOrigin;
exports.updateSettingsForSource = updateSettingsForSource;
exports.settingsMergeCustomizer = settingsMergeCustomizer;
exports.getManagedSettingsKeysForLogging = getManagedSettingsKeysForLogging;
exports.getInitialSettings = getInitialSettings;
exports.getSettingsWithSources = getSettingsWithSources;
exports.getSettingsWithErrors = getSettingsWithErrors;
exports.hasSkipDangerousModePermissionPrompt = hasSkipDangerousModePermissionPrompt;
exports.hasAutoModeOptIn = hasAutoModeOptIn;
exports.getUseAutoModeDuringPlan = getUseAutoModeDuringPlan;
exports.getAutoModeConfig = getAutoModeConfig;
exports.rawSettingsContainsKey = rawSettingsContainsKey;
var bun_bundle_1 = require("bun:bundle");
var mergeWith_js_1 = require("lodash-es/mergeWith.js");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var state_js_1 = require("../../bootstrap/state.js");
var syncCacheState_js_1 = require("../../services/remoteManagedSettings/syncCacheState.js");
var array_js_1 = require("../array.js");
var debug_js_1 = require("../debug.js");
var diagLogs_js_1 = require("../diagLogs.js");
var envUtils_js_1 = require("../envUtils.js");
var errors_js_1 = require("../errors.js");
var file_js_1 = require("../file.js");
var fileRead_js_1 = require("../fileRead.js");
var fsOperations_js_1 = require("../fsOperations.js");
var gitignore_js_1 = require("../git/gitignore.js");
var json_js_1 = require("../json.js");
var log_js_1 = require("../log.js");
var platform_js_1 = require("../platform.js");
var slowOperations_js_1 = require("../slowOperations.js");
var startupProfiler_js_1 = require("../startupProfiler.js");
var constants_js_1 = require("./constants.js");
var internalWrites_js_1 = require("./internalWrites.js");
var managedPath_js_1 = require("./managedPath.js");
var settings_js_1 = require("./mdm/settings.js");
var settingsCache_js_1 = require("./settingsCache.js");
var types_js_1 = require("./types.js");
var validation_js_1 = require("./validation.js");
/**
 * Get the path to the managed settings file based on the current platform
 */
function getManagedSettingsFilePath() {
    return (0, path_1.join)((0, managedPath_js_1.getManagedFilePath)(), 'managed-settings.json');
}
/**
 * Load file-based managed settings: managed-settings.json + managed-settings.d/*.json.
 *
 * managed-settings.json is merged first (lowest precedence / base), then drop-in
 * files are sorted alphabetically and merged on top (higher precedence, later
 * files win). This matches the systemd/sudoers drop-in convention: the base
 * file provides defaults, drop-ins customize. Separate teams can ship
 * independent policy fragments (e.g. 10-otel.json, 20-security.json) without
 * coordinating edits to a single admin-owned file.
 *
 * Exported for testing.
 */
function loadManagedFileSettings() {
    var errors = [];
    var merged = {};
    var found = false;
    var _a = parseSettingsFile(getManagedSettingsFilePath()), settings = _a.settings, baseErrors = _a.errors;
    errors.push.apply(errors, baseErrors);
    if (settings && Object.keys(settings).length > 0) {
        merged = (0, mergeWith_js_1.default)(merged, settings, settingsMergeCustomizer);
        found = true;
    }
    var dropInDir = (0, managedPath_js_1.getManagedSettingsDropInDir)();
    try {
        var entries = (0, fsOperations_js_1.getFsImplementation)()
            .readdirSync(dropInDir)
            .filter(function (d) {
            return (d.isFile() || d.isSymbolicLink()) &&
                d.name.endsWith('.json') &&
                !d.name.startsWith('.');
        })
            .map(function (d) { return d.name; })
            .sort();
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var name_1 = entries_1[_i];
            var _b = parseSettingsFile((0, path_1.join)(dropInDir, name_1)), settings_1 = _b.settings, fileErrors = _b.errors;
            errors.push.apply(errors, fileErrors);
            if (settings_1 && Object.keys(settings_1).length > 0) {
                merged = (0, mergeWith_js_1.default)(merged, settings_1, settingsMergeCustomizer);
                found = true;
            }
        }
    }
    catch (e) {
        var code = (0, errors_js_1.getErrnoCode)(e);
        if (code !== 'ENOENT' && code !== 'ENOTDIR') {
            (0, log_js_1.logError)(e);
        }
    }
    return { settings: found ? merged : null, errors: errors };
}
/**
 * Check which file-based managed settings sources are present.
 * Used by /status to show "(file)", "(drop-ins)", or "(file + drop-ins)".
 */
function getManagedFileSettingsPresence() {
    var base = parseSettingsFile(getManagedSettingsFilePath()).settings;
    var hasBase = !!base && Object.keys(base).length > 0;
    var hasDropIns = false;
    var dropInDir = (0, managedPath_js_1.getManagedSettingsDropInDir)();
    try {
        hasDropIns = (0, fsOperations_js_1.getFsImplementation)()
            .readdirSync(dropInDir)
            .some(function (d) {
            return (d.isFile() || d.isSymbolicLink()) &&
                d.name.endsWith('.json') &&
                !d.name.startsWith('.');
        });
    }
    catch (_a) {
        // dir doesn't exist
    }
    return { hasBase: hasBase, hasDropIns: hasDropIns };
}
/**
 * Handles file system errors appropriately
 * @param error The error to handle
 * @param path The file path that caused the error
 */
function handleFileSystemError(error, path) {
    if (typeof error === 'object' &&
        error &&
        'code' in error &&
        error.code === 'ENOENT') {
        (0, debug_js_1.logForDebugging)("Broken symlink or missing file encountered for settings.json at path: ".concat(path));
    }
    else {
        (0, log_js_1.logError)(error);
    }
}
/**
 * Parses a settings file into a structured format
 * @param path The path to the permissions file
 * @param source The source of the settings (optional, for error reporting)
 * @returns Parsed settings data and validation errors
 */
function parseSettingsFile(path) {
    var cached = (0, settingsCache_js_1.getCachedParsedFile)(path);
    if (cached) {
        // Clone so callers (e.g. mergeWith in getSettingsForSourceUncached,
        // updateSettingsForSource) can't mutate the cached entry.
        return {
            settings: cached.settings ? (0, slowOperations_js_1.clone)(cached.settings) : null,
            errors: cached.errors,
        };
    }
    var result = parseSettingsFileUncached(path);
    (0, settingsCache_js_1.setCachedParsedFile)(path, result);
    // Clone the first return too — the caller may mutate before
    // another caller reads the same cache entry.
    return {
        settings: result.settings ? (0, slowOperations_js_1.clone)(result.settings) : null,
        errors: result.errors,
    };
}
function parseSettingsFileUncached(path) {
    try {
        var resolvedPath = (0, fsOperations_js_1.safeResolvePath)((0, fsOperations_js_1.getFsImplementation)(), path).resolvedPath;
        var content = (0, fileRead_js_1.readFileSync)(resolvedPath);
        if (content.trim() === '') {
            return { settings: {}, errors: [] };
        }
        var data = (0, json_js_1.safeParseJSON)(content, false);
        // Filter invalid permission rules before schema validation so one bad
        // rule doesn't cause the entire settings file to be rejected.
        var ruleWarnings = (0, validation_js_1.filterInvalidPermissionRules)(data, path);
        var result = (0, types_js_1.SettingsSchema)().safeParse(data);
        if (!result.success) {
            var errors = (0, validation_js_1.formatZodError)(result.error, path);
            return { settings: null, errors: __spreadArray(__spreadArray([], ruleWarnings, true), errors, true) };
        }
        return { settings: result.data, errors: ruleWarnings };
    }
    catch (error) {
        handleFileSystemError(error, path);
        return { settings: null, errors: [] };
    }
}
/**
 * Get the absolute path to the associated file root for a given settings source
 * (e.g. for $PROJ_DIR/.claude/settings.json, returns $PROJ_DIR)
 * @param source The source of the settings
 * @returns The root path of the settings file
 */
function getSettingsRootPathForSource(source) {
    switch (source) {
        case 'userSettings':
            return (0, path_1.resolve)((0, envUtils_js_1.getClaudeConfigHomeDir)());
        case 'policySettings':
        case 'projectSettings':
        case 'localSettings': {
            return (0, path_1.resolve)((0, state_js_1.getOriginalCwd)());
        }
        case 'flagSettings': {
            var path = (0, state_js_1.getFlagSettingsPath)();
            return path ? (0, path_1.dirname)((0, path_1.resolve)(path)) : (0, path_1.resolve)((0, state_js_1.getOriginalCwd)());
        }
    }
}
/**
 * Get the user settings filename based on cowork mode.
 * Returns 'cowork_settings.json' when in cowork mode, 'settings.json' otherwise.
 *
 * Priority:
 * 1. Session state (set by CLI flag --cowork)
 * 2. Environment variable CLAUDE_CODE_USE_COWORK_PLUGINS
 * 3. Default: 'settings.json'
 */
function getUserSettingsFilePath() {
    if ((0, state_js_1.getUseCoworkPlugins)() ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_COWORK_PLUGINS)) {
        return 'cowork_settings.json';
    }
    return 'settings.json';
}
function getSettingsFilePathForSource(source) {
    switch (source) {
        case 'userSettings':
            return (0, path_1.join)(getSettingsRootPathForSource(source), getUserSettingsFilePath());
        case 'projectSettings':
        case 'localSettings': {
            return (0, path_1.join)(getSettingsRootPathForSource(source), getRelativeSettingsFilePathForSource(source));
        }
        case 'policySettings':
            return getManagedSettingsFilePath();
        case 'flagSettings': {
            return (0, state_js_1.getFlagSettingsPath)();
        }
    }
}
function getRelativeSettingsFilePathForSource(source) {
    switch (source) {
        case 'projectSettings':
            return (0, path_1.join)('.claude', 'settings.json');
        case 'localSettings':
            return (0, path_1.join)('.claude', 'settings.local.json');
    }
}
function getSettingsForSource(source) {
    var cached = (0, settingsCache_js_1.getCachedSettingsForSource)(source);
    if (cached !== undefined)
        return cached;
    var result = getSettingsForSourceUncached(source);
    (0, settingsCache_js_1.setCachedSettingsForSource)(source, result);
    return result;
}
function getSettingsForSourceUncached(source) {
    // For policySettings: first source wins (remote > HKLM/plist > file > HKCU)
    if (source === 'policySettings') {
        var remoteSettings = (0, syncCacheState_js_1.getRemoteManagedSettingsSyncFromCache)();
        if (remoteSettings && Object.keys(remoteSettings).length > 0) {
            return remoteSettings;
        }
        var mdmResult = (0, settings_js_1.getMdmSettings)();
        if (Object.keys(mdmResult.settings).length > 0) {
            return mdmResult.settings;
        }
        var fileSettings_1 = loadManagedFileSettings().settings;
        if (fileSettings_1) {
            return fileSettings_1;
        }
        var hkcu = (0, settings_js_1.getHkcuSettings)();
        if (Object.keys(hkcu.settings).length > 0) {
            return hkcu.settings;
        }
        return null;
    }
    var settingsFilePath = getSettingsFilePathForSource(source);
    var fileSettings = (settingsFilePath
        ? parseSettingsFile(settingsFilePath)
        : { settings: null }).settings;
    // For flagSettings, merge in any inline settings set via the SDK
    if (source === 'flagSettings') {
        var inlineSettings = (0, state_js_1.getFlagSettingsInline)();
        if (inlineSettings) {
            var parsed = (0, types_js_1.SettingsSchema)().safeParse(inlineSettings);
            if (parsed.success) {
                return (0, mergeWith_js_1.default)(fileSettings || {}, parsed.data, settingsMergeCustomizer);
            }
        }
    }
    return fileSettings;
}
/**
 * Get the origin of the highest-priority active policy settings source.
 * Uses "first source wins" — returns the first source that has content.
 * Priority: remote > plist/hklm > file (managed-settings.json) > hkcu
 */
function getPolicySettingsOrigin() {
    // 1. Remote (highest)
    var remoteSettings = (0, syncCacheState_js_1.getRemoteManagedSettingsSyncFromCache)();
    if (remoteSettings && Object.keys(remoteSettings).length > 0) {
        return 'remote';
    }
    // 2. Admin-only MDM (HKLM / macOS plist)
    var mdmResult = (0, settings_js_1.getMdmSettings)();
    if (Object.keys(mdmResult.settings).length > 0) {
        return (0, platform_js_1.getPlatform)() === 'macos' ? 'plist' : 'hklm';
    }
    // 3. managed-settings.json + managed-settings.d/ (file-based, requires admin)
    var fileSettings = loadManagedFileSettings().settings;
    if (fileSettings) {
        return 'file';
    }
    // 4. HKCU (lowest — user-writable)
    var hkcu = (0, settings_js_1.getHkcuSettings)();
    if (Object.keys(hkcu.settings).length > 0) {
        return 'hkcu';
    }
    return null;
}
/**
 * Merges `settings` into the existing settings for `source` using lodash mergeWith.
 *
 * To delete a key from a record field (e.g. enabledPlugins, extraKnownMarketplaces),
 * set it to `undefined` — do NOT use `delete`. mergeWith only detects deletion when
 * the key is present with an explicit `undefined` value.
 */
function updateSettingsForSource(source, settings) {
    if (source === 'policySettings' ||
        source === 'flagSettings') {
        return { error: null };
    }
    // Create the folder if needed
    var filePath = getSettingsFilePathForSource(source);
    if (!filePath) {
        return { error: null };
    }
    try {
        (0, fsOperations_js_1.getFsImplementation)().mkdirSync((0, path_1.dirname)(filePath));
        // Try to get existing settings with validation. Bypass the per-source
        // cache — mergeWith below mutates its target (including nested refs),
        // and mutating the cached object would leak unpersisted state if the
        // write fails before resetSettingsCache().
        var existingSettings = getSettingsForSourceUncached(source);
        // If validation failed, check if file exists with a JSON syntax error
        if (!existingSettings) {
            var content = null;
            try {
                content = (0, fileRead_js_1.readFileSync)(filePath);
            }
            catch (e) {
                if (!(0, errors_js_1.isENOENT)(e)) {
                    throw e;
                }
                // File doesn't exist — fall through to merge with empty settings
            }
            if (content !== null) {
                var rawData = (0, json_js_1.safeParseJSON)(content);
                if (rawData === null) {
                    // JSON syntax error - return validation error instead of overwriting
                    // safeParseJSON will already log the error, so we'll just return the error here
                    return {
                        error: new Error("Invalid JSON syntax in settings file at ".concat(filePath)),
                    };
                }
                if (rawData && typeof rawData === 'object') {
                    existingSettings = rawData;
                    (0, debug_js_1.logForDebugging)("Using raw settings from ".concat(filePath, " due to validation failure"));
                }
            }
        }
        var updatedSettings = (0, mergeWith_js_1.default)(existingSettings || {}, settings, function (_objValue, srcValue, key, object) {
            // Handle undefined as deletion
            if (srcValue === undefined && object && typeof key === 'string') {
                delete object[key];
                return undefined;
            }
            // For arrays, always replace with the provided array
            // This puts the responsibility on the caller to compute the desired final state
            if (Array.isArray(srcValue)) {
                return srcValue;
            }
            // For non-arrays, let lodash handle the default merge behavior
            return undefined;
        });
        // Mark this as an internal write before writing the file
        (0, internalWrites_js_1.markInternalWrite)(filePath);
        (0, file_js_1.writeFileSyncAndFlush_DEPRECATED)(filePath, (0, slowOperations_js_1.jsonStringify)(updatedSettings, null, 2) + '\n');
        // Invalidate the session cache since settings have been updated
        (0, settingsCache_js_1.resetSettingsCache)();
        if (source === 'localSettings') {
            // Okay to add to gitignore async without awaiting
            void (0, gitignore_js_1.addFileGlobRuleToGitignore)(getRelativeSettingsFilePathForSource('localSettings'), (0, state_js_1.getOriginalCwd)());
        }
    }
    catch (e) {
        var error = new Error("Failed to read raw settings from ".concat(filePath, ": ").concat(e));
        (0, log_js_1.logError)(error);
        return { error: error };
    }
    return { error: null };
}
/**
 * Custom merge function for arrays - concatenate and deduplicate
 */
function mergeArrays(targetArray, sourceArray) {
    return (0, array_js_1.uniq)(__spreadArray(__spreadArray([], targetArray, true), sourceArray, true));
}
/**
 * Custom merge function for lodash mergeWith when merging settings.
 * Arrays are concatenated and deduplicated; other values use default lodash merge behavior.
 * Exported for testing.
 */
function settingsMergeCustomizer(objValue, srcValue) {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        return mergeArrays(objValue, srcValue);
    }
    // Return undefined to let lodash handle default merge behavior
    return undefined;
}
/**
 * Get a list of setting keys from managed settings for logging purposes.
 * For certain nested settings (permissions, sandbox, hooks), expands to show
 * one level of nesting (e.g., "permissions.allow"). For other settings,
 * returns only the top-level key.
 *
 * @param settings The settings object to extract keys from
 * @returns Sorted array of key paths
 */
function getManagedSettingsKeysForLogging(settings) {
    // Use .strip() to get only valid schema keys
    var validSettings = (0, types_js_1.SettingsSchema)().strip().parse(settings);
    var keysToExpand = ['permissions', 'sandbox', 'hooks'];
    var allKeys = [];
    // Define valid nested keys for each nested setting we expand
    var validNestedKeys = {
        permissions: new Set(__spreadArray(__spreadArray([
            'allow',
            'deny',
            'ask',
            'defaultMode',
            'disableBypassPermissionsMode'
        ], ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') ? ['disableAutoMode'] : []), true), [
            'additionalDirectories',
        ], false)),
        sandbox: new Set([
            'enabled',
            'failIfUnavailable',
            'allowUnsandboxedCommands',
            'network',
            'filesystem',
            'ignoreViolations',
            'excludedCommands',
            'autoAllowBashIfSandboxed',
            'enableWeakerNestedSandbox',
            'enableWeakerNetworkIsolation',
            'ripgrep',
        ]),
        // For hooks, we use z.record with enum keys, so we validate separately
        hooks: new Set([
            'PreToolUse',
            'PostToolUse',
            'Notification',
            'UserPromptSubmit',
            'SessionStart',
            'SessionEnd',
            'Stop',
            'SubagentStop',
            'PreCompact',
            'PostCompact',
            'TeammateIdle',
            'TaskCreated',
            'TaskCompleted',
        ]),
    };
    for (var _i = 0, _a = Object.keys(validSettings); _i < _a.length; _i++) {
        var key = _a[_i];
        if (keysToExpand.includes(key) &&
            validSettings[key] &&
            typeof validSettings[key] === 'object') {
            // Expand nested keys for these special settings (one level deep only)
            var nestedObj = validSettings[key];
            var validKeys = validNestedKeys[key];
            if (validKeys) {
                for (var _b = 0, _c = Object.keys(nestedObj); _b < _c.length; _b++) {
                    var nestedKey = _c[_b];
                    // Only include known valid nested keys
                    if (validKeys.has(nestedKey)) {
                        allKeys.push("".concat(key, ".").concat(nestedKey));
                    }
                }
            }
        }
        else {
            // For other settings, just use the top-level key
            allKeys.push(key);
        }
    }
    return allKeys.sort();
}
// Flag to prevent infinite recursion when loading settings
var isLoadingSettings = false;
/**
 * Load settings from disk without using cache
 * This is the original implementation that actually reads from files
 */
function loadSettingsFromDisk() {
    // Prevent recursive calls to loadSettingsFromDisk
    if (isLoadingSettings) {
        return { settings: {}, errors: [] };
    }
    var startTime = Date.now();
    (0, startupProfiler_js_1.profileCheckpoint)('loadSettingsFromDisk_start');
    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_load_started');
    isLoadingSettings = true;
    try {
        // Start with plugin settings as the lowest priority base.
        // All file-based sources (user, project, local, flag, policy) override these.
        // Plugin settings only contain allowlisted keys (e.g., agent) that are valid SettingsJson fields.
        var pluginSettings = (0, settingsCache_js_1.getPluginSettingsBase)();
        var mergedSettings = {};
        if (pluginSettings) {
            mergedSettings = (0, mergeWith_js_1.default)(mergedSettings, pluginSettings, settingsMergeCustomizer);
        }
        var allErrors = [];
        var seenErrors = new Set();
        var seenFiles = new Set();
        // Merge settings from each source in priority order with deep merging
        for (var _i = 0, _a = (0, constants_js_1.getEnabledSettingSources)(); _i < _a.length; _i++) {
            var source = _a[_i];
            // policySettings: "first source wins" — use the highest-priority source
            // that has content. Priority: remote > HKLM/plist > managed-settings.json > HKCU
            if (source === 'policySettings') {
                var policySettings = null;
                var policyErrors = [];
                // 1. Remote (highest priority)
                var remoteSettings = (0, syncCacheState_js_1.getRemoteManagedSettingsSyncFromCache)();
                if (remoteSettings && Object.keys(remoteSettings).length > 0) {
                    var result = (0, types_js_1.SettingsSchema)().safeParse(remoteSettings);
                    if (result.success) {
                        policySettings = result.data;
                    }
                    else {
                        // Remote exists but is invalid — surface errors even as we fall through
                        policyErrors.push.apply(policyErrors, (0, validation_js_1.formatZodError)(result.error, 'remote managed settings'));
                    }
                }
                // 2. Admin-only MDM (HKLM / macOS plist)
                if (!policySettings) {
                    var mdmResult = (0, settings_js_1.getMdmSettings)();
                    if (Object.keys(mdmResult.settings).length > 0) {
                        policySettings = mdmResult.settings;
                    }
                    policyErrors.push.apply(policyErrors, mdmResult.errors);
                }
                // 3. managed-settings.json + managed-settings.d/ (file-based, requires admin)
                if (!policySettings) {
                    var _b = loadManagedFileSettings(), settings = _b.settings, errors = _b.errors;
                    if (settings) {
                        policySettings = settings;
                    }
                    policyErrors.push.apply(policyErrors, errors);
                }
                // 4. HKCU (lowest — user-writable, only if nothing above exists)
                if (!policySettings) {
                    var hkcu = (0, settings_js_1.getHkcuSettings)();
                    if (Object.keys(hkcu.settings).length > 0) {
                        policySettings = hkcu.settings;
                    }
                    policyErrors.push.apply(policyErrors, hkcu.errors);
                }
                // Merge the winning policy source into the settings chain
                if (policySettings) {
                    mergedSettings = (0, mergeWith_js_1.default)(mergedSettings, policySettings, settingsMergeCustomizer);
                }
                for (var _c = 0, policyErrors_1 = policyErrors; _c < policyErrors_1.length; _c++) {
                    var error = policyErrors_1[_c];
                    var errorKey = "".concat(error.file, ":").concat(error.path, ":").concat(error.message);
                    if (!seenErrors.has(errorKey)) {
                        seenErrors.add(errorKey);
                        allErrors.push(error);
                    }
                }
                continue;
            }
            var filePath = getSettingsFilePathForSource(source);
            if (filePath) {
                var resolvedPath = (0, path_1.resolve)(filePath);
                // Skip if we've already loaded this file from another source
                if (!seenFiles.has(resolvedPath)) {
                    seenFiles.add(resolvedPath);
                    var _d = parseSettingsFile(filePath), settings = _d.settings, errors = _d.errors;
                    // Add unique errors (deduplication)
                    for (var _e = 0, errors_1 = errors; _e < errors_1.length; _e++) {
                        var error = errors_1[_e];
                        var errorKey = "".concat(error.file, ":").concat(error.path, ":").concat(error.message);
                        if (!seenErrors.has(errorKey)) {
                            seenErrors.add(errorKey);
                            allErrors.push(error);
                        }
                    }
                    if (settings) {
                        mergedSettings = (0, mergeWith_js_1.default)(mergedSettings, settings, settingsMergeCustomizer);
                    }
                }
            }
            // For flagSettings, also merge any inline settings set via the SDK
            if (source === 'flagSettings') {
                var inlineSettings = (0, state_js_1.getFlagSettingsInline)();
                if (inlineSettings) {
                    var parsed = (0, types_js_1.SettingsSchema)().safeParse(inlineSettings);
                    if (parsed.success) {
                        mergedSettings = (0, mergeWith_js_1.default)(mergedSettings, parsed.data, settingsMergeCustomizer);
                    }
                }
            }
        }
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'settings_load_completed', {
            duration_ms: Date.now() - startTime,
            source_count: seenFiles.size,
            error_count: allErrors.length,
        });
        return { settings: mergedSettings, errors: allErrors };
    }
    finally {
        isLoadingSettings = false;
    }
}
/**
 * Get merged settings from all sources in priority order
 * Settings are merged from lowest to highest priority:
 * userSettings -> projectSettings -> localSettings -> policySettings
 *
 * This function returns a snapshot of settings at the time of call.
 * For React components, prefer using useSettings() hook for reactive updates
 * when settings change on disk.
 *
 * Uses session-level caching to avoid repeated file I/O.
 * Cache is invalidated when settings files change via resetSettingsCache().
 *
 * @returns Merged settings from all available sources (always returns at least empty object)
 */
function getInitialSettings() {
    var settings = getSettingsWithErrors().settings;
    return settings || {};
}
/**
 * @deprecated Use getInitialSettings() instead. This alias exists for backwards compatibility.
 */
exports.getSettings_DEPRECATED = getInitialSettings;
/**
 * Get the effective merged settings alongside the raw per-source settings,
 * in merge-priority order. Only includes sources that are enabled and have
 * non-empty content.
 *
 * Always reads fresh from disk — resets the session cache so that `effective`
 * and `sources` are consistent even if the change detector hasn't fired yet.
 */
function getSettingsWithSources() {
    // Reset both caches so getSettingsForSource (per-source cache) and
    // getInitialSettings (session cache) agree on the current disk state.
    (0, settingsCache_js_1.resetSettingsCache)();
    var sources = [];
    for (var _i = 0, _a = (0, constants_js_1.getEnabledSettingSources)(); _i < _a.length; _i++) {
        var source = _a[_i];
        var settings = getSettingsForSource(source);
        if (settings && Object.keys(settings).length > 0) {
            sources.push({ source: source, settings: settings });
        }
    }
    return { effective: getInitialSettings(), sources: sources };
}
/**
 * Get merged settings and validation errors from all sources
 * This function now uses session-level caching to avoid repeated file I/O.
 * Settings changes require Claude Code restart, so cache is valid for entire session.
 * @returns Merged settings and all validation errors encountered
 */
function getSettingsWithErrors() {
    // Use cached result if available
    var cached = (0, settingsCache_js_1.getSessionSettingsCache)();
    if (cached !== null) {
        return cached;
    }
    // Load from disk and cache the result
    var result = loadSettingsFromDisk();
    (0, startupProfiler_js_1.profileCheckpoint)('loadSettingsFromDisk_end');
    (0, settingsCache_js_1.setSessionSettingsCache)(result);
    return result;
}
/**
 * Check if any raw settings file contains a specific key, regardless of validation.
 * This is useful for detecting user intent even when settings validation fails.
 * For example, if a user set cleanupPeriodDays but has validation errors elsewhere,
 * we can detect they explicitly configured cleanup and skip cleanup rather than
 * falling back to defaults.
 */
/**
 * Returns true if any trusted settings source has accepted the bypass
 * permissions mode dialog. projectSettings is intentionally excluded —
 * a malicious project could otherwise auto-bypass the dialog (RCE risk).
 */
function hasSkipDangerousModePermissionPrompt() {
    var _a, _b, _c, _d;
    return !!(((_a = getSettingsForSource('userSettings')) === null || _a === void 0 ? void 0 : _a.skipDangerousModePermissionPrompt) ||
        ((_b = getSettingsForSource('localSettings')) === null || _b === void 0 ? void 0 : _b.skipDangerousModePermissionPrompt) ||
        ((_c = getSettingsForSource('flagSettings')) === null || _c === void 0 ? void 0 : _c.skipDangerousModePermissionPrompt) ||
        ((_d = getSettingsForSource('policySettings')) === null || _d === void 0 ? void 0 : _d.skipDangerousModePermissionPrompt));
}
/**
 * Returns true if any trusted settings source has accepted the auto
 * mode opt-in dialog. projectSettings is intentionally excluded —
 * a malicious project could otherwise auto-bypass the dialog (RCE risk).
 */
function hasAutoModeOptIn() {
    var _a, _b, _c, _d;
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
        var user = (_a = getSettingsForSource('userSettings')) === null || _a === void 0 ? void 0 : _a.skipAutoPermissionPrompt;
        var local = (_b = getSettingsForSource('localSettings')) === null || _b === void 0 ? void 0 : _b.skipAutoPermissionPrompt;
        var flag = (_c = getSettingsForSource('flagSettings')) === null || _c === void 0 ? void 0 : _c.skipAutoPermissionPrompt;
        var policy = (_d = getSettingsForSource('policySettings')) === null || _d === void 0 ? void 0 : _d.skipAutoPermissionPrompt;
        var result = !!(user || local || flag || policy);
        (0, debug_js_1.logForDebugging)("[auto-mode] hasAutoModeOptIn=".concat(result, " skipAutoPermissionPrompt: user=").concat(user, " local=").concat(local, " flag=").concat(flag, " policy=").concat(policy));
        return result;
    }
    return false;
}
/**
 * Returns whether plan mode should use auto mode semantics. Default true
 * (opt-out). Returns false if any trusted source explicitly sets false.
 * projectSettings is excluded so a malicious project can't control this.
 */
function getUseAutoModeDuringPlan() {
    var _a, _b, _c, _d;
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
        return (((_a = getSettingsForSource('policySettings')) === null || _a === void 0 ? void 0 : _a.useAutoModeDuringPlan) !== false &&
            ((_b = getSettingsForSource('flagSettings')) === null || _b === void 0 ? void 0 : _b.useAutoModeDuringPlan) !== false &&
            ((_c = getSettingsForSource('userSettings')) === null || _c === void 0 ? void 0 : _c.useAutoModeDuringPlan) !== false &&
            ((_d = getSettingsForSource('localSettings')) === null || _d === void 0 ? void 0 : _d.useAutoModeDuringPlan) !== false);
    }
    return true;
}
/**
 * Returns the merged autoMode config from trusted settings sources.
 * Only available when TRANSCRIPT_CLASSIFIER is active; returns undefined otherwise.
 * projectSettings is intentionally excluded — a malicious project could
 * otherwise inject classifier allow/deny rules (RCE risk).
 */
function getAutoModeConfig() {
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
        var schema = v4_1.z.object({
            allow: v4_1.z.array(v4_1.z.string()).optional(),
            soft_deny: v4_1.z.array(v4_1.z.string()).optional(),
            deny: v4_1.z.array(v4_1.z.string()).optional(),
            environment: v4_1.z.array(v4_1.z.string()).optional(),
        });
        var allow = [];
        var soft_deny = [];
        var environment = [];
        for (var _i = 0, _a = [
            'userSettings',
            'localSettings',
            'flagSettings',
            'policySettings',
        ]; _i < _a.length; _i++) {
            var source = _a[_i];
            var settings = getSettingsForSource(source);
            if (!settings)
                continue;
            var result = schema.safeParse(settings.autoMode);
            if (result.success) {
                if (result.data.allow)
                    allow.push.apply(allow, result.data.allow);
                if (result.data.soft_deny)
                    soft_deny.push.apply(soft_deny, result.data.soft_deny);
                if (process.env.USER_TYPE === 'ant') {
                    if (result.data.deny)
                        soft_deny.push.apply(soft_deny, result.data.deny);
                }
                if (result.data.environment)
                    environment.push.apply(environment, result.data.environment);
            }
        }
        if (allow.length > 0 || soft_deny.length > 0 || environment.length > 0) {
            return __assign(__assign(__assign({}, (allow.length > 0 && { allow: allow })), (soft_deny.length > 0 && { soft_deny: soft_deny })), (environment.length > 0 && { environment: environment }));
        }
    }
    return undefined;
}
function rawSettingsContainsKey(key) {
    for (var _i = 0, _a = (0, constants_js_1.getEnabledSettingSources)(); _i < _a.length; _i++) {
        var source = _a[_i];
        // Skip policySettings - we only care about user-configured settings
        if (source === 'policySettings') {
            continue;
        }
        var filePath = getSettingsFilePathForSource(source);
        if (!filePath) {
            continue;
        }
        try {
            var resolvedPath = (0, fsOperations_js_1.safeResolvePath)((0, fsOperations_js_1.getFsImplementation)(), filePath).resolvedPath;
            var content = (0, fileRead_js_1.readFileSync)(resolvedPath);
            if (!content.trim()) {
                continue;
            }
            var rawData = (0, json_js_1.safeParseJSON)(content, false);
            if (rawData && typeof rawData === 'object' && key in rawData) {
                return true;
            }
        }
        catch (error) {
            // File not found is expected - not all settings files exist
            // Other errors (permissions, I/O) should be tracked
            handleFileSystemError(error, filePath);
        }
    }
    return false;
}
