"use strict";
/**
 * Manages plugin installation metadata stored in installed_plugins.json
 *
 * This module separates plugin installation state (global) from enabled/disabled
 * state (per-repository). The installed_plugins.json file tracks:
 * - Which plugins are installed globally
 * - Installation metadata (version, timestamps, paths)
 *
 * The enabled/disabled state remains in .claude/settings.json for per-repo control.
 *
 * Rationale: Installation is global (a plugin is either on disk or not), while
 * enabled/disabled state is per-repository (different projects may want different
 * plugins active).
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
exports.getInstalledPluginsFilePath = getInstalledPluginsFilePath;
exports.getInstalledPluginsV2FilePath = getInstalledPluginsV2FilePath;
exports.clearInstalledPluginsCache = clearInstalledPluginsCache;
exports.migrateToSinglePluginFile = migrateToSinglePluginFile;
exports.resetMigrationState = resetMigrationState;
exports.loadInstalledPluginsV2 = loadInstalledPluginsV2;
exports.addPluginInstallation = addPluginInstallation;
exports.removePluginInstallation = removePluginInstallation;
exports.getInMemoryInstalledPlugins = getInMemoryInstalledPlugins;
exports.loadInstalledPluginsFromDisk = loadInstalledPluginsFromDisk;
exports.updateInstallationPathOnDisk = updateInstallationPathOnDisk;
exports.hasPendingUpdates = hasPendingUpdates;
exports.getPendingUpdateCount = getPendingUpdateCount;
exports.getPendingUpdatesDetails = getPendingUpdatesDetails;
exports.resetInMemoryState = resetInMemoryState;
exports.initializeVersionedPlugins = initializeVersionedPlugins;
exports.removeAllPluginsForMarketplace = removeAllPluginsForMarketplace;
exports.isInstallationRelevantToCurrentProject = isInstallationRelevantToCurrentProject;
exports.isPluginInstalled = isPluginInstalled;
exports.isPluginGloballyInstalled = isPluginGloballyInstalled;
exports.addInstalledPlugin = addInstalledPlugin;
exports.removeInstalledPlugin = removeInstalledPlugin;
exports.getGitCommitSha = getGitCommitSha;
exports.deletePluginCache = deletePluginCache;
exports.migrateFromEnabledPlugins = migrateFromEnabledPlugins;
var path_1 = require("path");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var fsOperations_js_1 = require("../fsOperations.js");
var log_js_1 = require("../log.js");
var slowOperations_js_1 = require("../slowOperations.js");
var pluginDirectories_js_1 = require("./pluginDirectories.js");
var schemas_js_1 = require("./schemas.js");
var state_js_1 = require("../../bootstrap/state.js");
var cwd_js_1 = require("../cwd.js");
var gitFilesystem_js_1 = require("../git/gitFilesystem.js");
var settings_js_1 = require("../settings/settings.js");
var marketplaceManager_js_1 = require("./marketplaceManager.js");
var pluginIdentifier_js_1 = require("./pluginIdentifier.js");
var pluginLoader_js_1 = require("./pluginLoader.js");
// Migration state to prevent running migration multiple times per session
var migrationCompleted = false;
/**
 * Memoized cache of installed plugins data (V2 format)
 * Cleared by clearInstalledPluginsCache() when file is modified.
 * Prevents repeated filesystem reads within a single CLI session.
 */
var installedPluginsCacheV2 = null;
/**
 * Session-level snapshot of installed plugins at startup.
 * This is what the running session uses - it's NOT updated by background operations.
 * Background updates modify the disk file only.
 */
var inMemoryInstalledPlugins = null;
/**
 * Get the path to the installed_plugins.json file
 */
function getInstalledPluginsFilePath() {
    return (0, path_1.join)((0, pluginDirectories_js_1.getPluginsDirectory)(), 'installed_plugins.json');
}
/**
 * Get the path to the legacy installed_plugins_v2.json file.
 * Used only during migration to consolidate into single file.
 */
function getInstalledPluginsV2FilePath() {
    return (0, path_1.join)((0, pluginDirectories_js_1.getPluginsDirectory)(), 'installed_plugins_v2.json');
}
/**
 * Clear the installed plugins cache
 * Call this when the file is modified to force a reload
 *
 * Note: This also clears the in-memory session state (inMemoryInstalledPlugins).
 * In most cases, this is only called during initialization or testing.
 * For background updates, use updateInstallationPathOnDisk() which preserves
 * the in-memory state.
 */
function clearInstalledPluginsCache() {
    installedPluginsCacheV2 = null;
    inMemoryInstalledPlugins = null;
    (0, debug_js_1.logForDebugging)('Cleared installed plugins cache');
}
/**
 * Migrate to single plugin file format.
 *
 * This consolidates the V1/V2 dual-file system into a single file:
 * 1. If installed_plugins_v2.json exists: copy to installed_plugins.json (version=2), delete V2 file
 * 2. If only installed_plugins.json exists with version=1: convert to version=2 in-place
 * 3. Clean up legacy non-versioned cache directories
 *
 * This migration runs once per session at startup.
 */
function migrateToSinglePluginFile() {
    if (migrationCompleted) {
        return;
    }
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var mainFilePath = getInstalledPluginsFilePath();
    var v2FilePath = getInstalledPluginsV2FilePath();
    try {
        // Case 1: Try renaming v2→main directly; ENOENT = v2 doesn't exist
        try {
            fs.renameSync(v2FilePath, mainFilePath);
            (0, debug_js_1.logForDebugging)("Renamed installed_plugins_v2.json to installed_plugins.json");
            // Clean up legacy cache directories
            var v2Data = loadInstalledPluginsV2();
            cleanupLegacyCache(v2Data);
            migrationCompleted = true;
            return;
        }
        catch (e) {
            if (!(0, errors_js_1.isENOENT)(e))
                throw e;
        }
        // Case 2: v2 absent — try reading main; ENOENT = neither exists (case 3)
        var mainContent = void 0;
        try {
            mainContent = fs.readFileSync(mainFilePath, { encoding: 'utf-8' });
        }
        catch (e) {
            if (!(0, errors_js_1.isENOENT)(e))
                throw e;
            // Case 3: No file exists - nothing to migrate
            migrationCompleted = true;
            return;
        }
        var mainData = (0, slowOperations_js_1.jsonParse)(mainContent);
        var version = typeof (mainData === null || mainData === void 0 ? void 0 : mainData.version) === 'number' ? mainData.version : 1;
        if (version === 1) {
            // Convert V1 to V2 format in-place
            var v1Data = (0, schemas_js_1.InstalledPluginsFileSchemaV1)().parse(mainData);
            var v2Data = migrateV1ToV2(v1Data);
            (0, slowOperations_js_1.writeFileSync_DEPRECATED)(mainFilePath, (0, slowOperations_js_1.jsonStringify)(v2Data, null, 2), {
                encoding: 'utf-8',
                flush: true,
            });
            (0, debug_js_1.logForDebugging)("Converted installed_plugins.json from V1 to V2 format (".concat(Object.keys(v1Data.plugins).length, " plugins)"));
            // Clean up legacy cache directories
            cleanupLegacyCache(v2Data);
        }
        // If version=2, already in correct format, no action needed
        migrationCompleted = true;
    }
    catch (error) {
        var errorMsg = (0, errors_js_1.errorMessage)(error);
        (0, debug_js_1.logForDebugging)("Failed to migrate plugin files: ".concat(errorMsg), {
            level: 'error',
        });
        (0, log_js_1.logError)((0, errors_js_1.toError)(error));
        // Mark as completed to avoid retrying failed migration
        migrationCompleted = true;
    }
}
/**
 * Clean up legacy non-versioned cache directories.
 *
 * Legacy cache structure: ~/.claude/plugins/cache/{plugin-name}/
 * Versioned cache structure: ~/.claude/plugins/cache/{marketplace}/{plugin}/{version}/
 *
 * This function removes legacy directories that are not referenced by any installation.
 */
function cleanupLegacyCache(v2Data) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var cachePath = (0, pluginLoader_js_1.getPluginCachePath)();
    try {
        // Collect all install paths that are referenced
        var referencedPaths = new Set();
        for (var _i = 0, _a = Object.values(v2Data.plugins); _i < _a.length; _i++) {
            var installations = _a[_i];
            for (var _b = 0, installations_1 = installations; _b < installations_1.length; _b++) {
                var entry = installations_1[_b];
                referencedPaths.add(entry.installPath);
            }
        }
        // List top-level directories in cache
        var entries = fs.readdirSync(cachePath);
        var _loop_1 = function (dirent) {
            if (!dirent.isDirectory()) {
                return "continue";
            }
            var entry = dirent.name;
            var entryPath = (0, path_1.join)(cachePath, entry);
            // Check if this is a versioned cache (marketplace dir with plugin/version subdirs)
            // or a legacy cache (flat plugin directory)
            var subEntries = fs.readdirSync(entryPath);
            var hasVersionedStructure = subEntries.some(function (subDirent) {
                if (!subDirent.isDirectory())
                    return false;
                var subPath = (0, path_1.join)(entryPath, subDirent.name);
                // Check if subdir contains version directories (semver-like or hash)
                var versionEntries = fs.readdirSync(subPath);
                return versionEntries.some(function (vDirent) { return vDirent.isDirectory(); });
            });
            if (hasVersionedStructure) {
                return "continue";
            }
            // This is a legacy flat cache directory
            // Check if it's referenced by any installation
            if (!referencedPaths.has(entryPath)) {
                // Not referenced - safe to delete
                fs.rmSync(entryPath, { recursive: true, force: true });
                (0, debug_js_1.logForDebugging)("Cleaned up legacy cache directory: ".concat(entry));
            }
        };
        for (var _c = 0, entries_1 = entries; _c < entries_1.length; _c++) {
            var dirent = entries_1[_c];
            _loop_1(dirent);
        }
    }
    catch (error) {
        var errorMsg = (0, errors_js_1.errorMessage)(error);
        (0, debug_js_1.logForDebugging)("Failed to clean up legacy cache: ".concat(errorMsg), {
            level: 'warn',
        });
    }
}
/**
 * Reset migration state (for testing)
 */
function resetMigrationState() {
    migrationCompleted = false;
}
/**
 * Read raw file data from installed_plugins.json
 * Returns null if file doesn't exist.
 * Throws error if file exists but can't be parsed.
 */
function readInstalledPluginsFileRaw() {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var filePath = getInstalledPluginsFilePath();
    var fileContent;
    try {
        fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    }
    catch (e) {
        if ((0, errors_js_1.isENOENT)(e)) {
            return null;
        }
        throw e;
    }
    var data = (0, slowOperations_js_1.jsonParse)(fileContent);
    var version = typeof (data === null || data === void 0 ? void 0 : data.version) === 'number' ? data.version : 1;
    return { version: version, data: data };
}
/**
 * Migrate V1 data to V2 format.
 * All V1 plugins are migrated to 'user' scope since V1 had no scope concept.
 */
function migrateV1ToV2(v1Data) {
    var v2Plugins = {};
    for (var _i = 0, _a = Object.entries(v1Data.plugins); _i < _a.length; _i++) {
        var _b = _a[_i], pluginId = _b[0], plugin = _b[1];
        // V2 format uses versioned cache path: ~/.claude/plugins/cache/{marketplace}/{plugin}/{version}
        // Compute it from pluginId and version instead of using the V1 installPath
        var versionedCachePath = (0, pluginLoader_js_1.getVersionedCachePath)(pluginId, plugin.version);
        v2Plugins[pluginId] = [
            {
                scope: 'user', // Default all existing installs to user scope
                installPath: versionedCachePath,
                version: plugin.version,
                installedAt: plugin.installedAt,
                lastUpdated: plugin.lastUpdated,
                gitCommitSha: plugin.gitCommitSha,
            },
        ];
    }
    return { version: 2, plugins: v2Plugins };
}
/**
 * Load installed plugins in V2 format.
 *
 * Reads from installed_plugins.json. If file has version=1,
 * converts to V2 format in memory.
 *
 * @returns V2 format data with array-per-plugin structure
 */
function loadInstalledPluginsV2() {
    // Return cached V2 data if available
    if (installedPluginsCacheV2 !== null) {
        return installedPluginsCacheV2;
    }
    var filePath = getInstalledPluginsFilePath();
    try {
        var rawData = readInstalledPluginsFileRaw();
        if (rawData) {
            if (rawData.version === 2) {
                // V2 format - validate and return
                var validated = (0, schemas_js_1.InstalledPluginsFileSchemaV2)().parse(rawData.data);
                installedPluginsCacheV2 = validated;
                (0, debug_js_1.logForDebugging)("Loaded ".concat(Object.keys(validated.plugins).length, " installed plugins from ").concat(filePath));
                return validated;
            }
            // V1 format - convert to V2
            var v1Validated = (0, schemas_js_1.InstalledPluginsFileSchemaV1)().parse(rawData.data);
            var v2Data = migrateV1ToV2(v1Validated);
            installedPluginsCacheV2 = v2Data;
            (0, debug_js_1.logForDebugging)("Loaded and converted ".concat(Object.keys(v1Validated.plugins).length, " plugins from V1 format"));
            return v2Data;
        }
        // File doesn't exist - return empty V2
        (0, debug_js_1.logForDebugging)("installed_plugins.json doesn't exist, returning empty V2 object");
        installedPluginsCacheV2 = { version: 2, plugins: {} };
        return installedPluginsCacheV2;
    }
    catch (error) {
        var errorMsg = (0, errors_js_1.errorMessage)(error);
        (0, debug_js_1.logForDebugging)("Failed to load installed_plugins.json: ".concat(errorMsg, ". Starting with empty state."), { level: 'error' });
        (0, log_js_1.logError)((0, errors_js_1.toError)(error));
        installedPluginsCacheV2 = { version: 2, plugins: {} };
        return installedPluginsCacheV2;
    }
}
/**
 * Save installed plugins in V2 format to installed_plugins.json.
 * This is the single source of truth after V1/V2 consolidation.
 */
function saveInstalledPluginsV2(data) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var filePath = getInstalledPluginsFilePath();
    try {
        fs.mkdirSync((0, pluginDirectories_js_1.getPluginsDirectory)());
        var jsonContent = (0, slowOperations_js_1.jsonStringify)(data, null, 2);
        (0, slowOperations_js_1.writeFileSync_DEPRECATED)(filePath, jsonContent, {
            encoding: 'utf-8',
            flush: true,
        });
        // Update cache
        installedPluginsCacheV2 = data;
        (0, debug_js_1.logForDebugging)("Saved ".concat(Object.keys(data.plugins).length, " installed plugins to ").concat(filePath));
    }
    catch (error) {
        var _errorMsg = (0, errors_js_1.errorMessage)(error);
        (0, log_js_1.logError)((0, errors_js_1.toError)(error));
        throw error;
    }
}
/**
 * Add or update a plugin installation entry at a specific scope.
 * Used for V2 format where each plugin has an array of installations.
 *
 * @param pluginId - Plugin ID in "plugin@marketplace" format
 * @param scope - Installation scope (managed/user/project/local)
 * @param installPath - Path to versioned plugin directory
 * @param metadata - Additional installation metadata
 * @param projectPath - Project path (required for project/local scopes)
 */
function addPluginInstallation(pluginId, scope, installPath, metadata, projectPath) {
    var data = loadInstalledPluginsFromDisk();
    // Get or create array for this plugin
    var installations = data.plugins[pluginId] || [];
    // Find existing entry for this scope+projectPath
    var existingIndex = installations.findIndex(function (entry) { return entry.scope === scope && entry.projectPath === projectPath; });
    var newEntry = __assign({ scope: scope, installPath: installPath, version: metadata.version, installedAt: metadata.installedAt || new Date().toISOString(), lastUpdated: new Date().toISOString(), gitCommitSha: metadata.gitCommitSha }, (projectPath && { projectPath: projectPath }));
    if (existingIndex >= 0) {
        installations[existingIndex] = newEntry;
        (0, debug_js_1.logForDebugging)("Updated installation for ".concat(pluginId, " at scope ").concat(scope));
    }
    else {
        installations.push(newEntry);
        (0, debug_js_1.logForDebugging)("Added installation for ".concat(pluginId, " at scope ").concat(scope));
    }
    data.plugins[pluginId] = installations;
    saveInstalledPluginsV2(data);
}
/**
 * Remove a plugin installation entry from a specific scope.
 *
 * @param pluginId - Plugin ID in "plugin@marketplace" format
 * @param scope - Installation scope to remove
 * @param projectPath - Project path (for project/local scopes)
 */
function removePluginInstallation(pluginId, scope, projectPath) {
    var data = loadInstalledPluginsFromDisk();
    var installations = data.plugins[pluginId];
    if (!installations) {
        return;
    }
    data.plugins[pluginId] = installations.filter(function (entry) { return !(entry.scope === scope && entry.projectPath === projectPath); });
    // Remove plugin entirely if no installations left
    if (data.plugins[pluginId].length === 0) {
        delete data.plugins[pluginId];
    }
    saveInstalledPluginsV2(data);
    (0, debug_js_1.logForDebugging)("Removed installation for ".concat(pluginId, " at scope ").concat(scope));
}
// =============================================================================
// In-Memory vs Disk State Management (for non-in-place updates)
// =============================================================================
/**
 * Get the in-memory installed plugins (session state).
 * This snapshot is loaded at startup and used for the entire session.
 * It is NOT updated by background operations.
 *
 * @returns V2 format data representing the session's view of installed plugins
 */
function getInMemoryInstalledPlugins() {
    if (inMemoryInstalledPlugins === null) {
        inMemoryInstalledPlugins = loadInstalledPluginsV2();
    }
    return inMemoryInstalledPlugins;
}
/**
 * Load installed plugins directly from disk, bypassing all caches.
 * Used by background updater to check for changes without affecting
 * the running session's view.
 *
 * @returns V2 format data read fresh from disk
 */
function loadInstalledPluginsFromDisk() {
    try {
        // Read from main file
        var rawData = readInstalledPluginsFileRaw();
        if (rawData) {
            if (rawData.version === 2) {
                return (0, schemas_js_1.InstalledPluginsFileSchemaV2)().parse(rawData.data);
            }
            // V1 format - convert to V2
            var v1Data = (0, schemas_js_1.InstalledPluginsFileSchemaV1)().parse(rawData.data);
            return migrateV1ToV2(v1Data);
        }
        return { version: 2, plugins: {} };
    }
    catch (error) {
        var errorMsg = (0, errors_js_1.errorMessage)(error);
        (0, debug_js_1.logForDebugging)("Failed to load installed plugins from disk: ".concat(errorMsg), {
            level: 'error',
        });
        return { version: 2, plugins: {} };
    }
}
/**
 * Update a plugin's install path on disk only, without modifying in-memory state.
 * Used by background updater to record new version on disk while session
 * continues using the old version.
 *
 * @param pluginId - Plugin ID in "plugin@marketplace" format
 * @param scope - Installation scope
 * @param projectPath - Project path (for project/local scopes)
 * @param newPath - New install path (to new version directory)
 * @param newVersion - New version string
 */
function updateInstallationPathOnDisk(pluginId, scope, projectPath, newPath, newVersion, gitCommitSha) {
    var diskData = loadInstalledPluginsFromDisk();
    var installations = diskData.plugins[pluginId];
    if (!installations) {
        (0, debug_js_1.logForDebugging)("Cannot update ".concat(pluginId, " on disk: plugin not found in installed plugins"));
        return;
    }
    var entry = installations.find(function (e) { return e.scope === scope && e.projectPath === projectPath; });
    if (entry) {
        entry.installPath = newPath;
        entry.version = newVersion;
        entry.lastUpdated = new Date().toISOString();
        if (gitCommitSha !== undefined) {
            entry.gitCommitSha = gitCommitSha;
        }
        var filePath = getInstalledPluginsFilePath();
        // Write to single file (V2 format with version=2)
        (0, slowOperations_js_1.writeFileSync_DEPRECATED)(filePath, (0, slowOperations_js_1.jsonStringify)(diskData, null, 2), {
            encoding: 'utf-8',
            flush: true,
        });
        // Clear cache since disk changed, but do NOT update inMemoryInstalledPlugins
        installedPluginsCacheV2 = null;
        (0, debug_js_1.logForDebugging)("Updated ".concat(pluginId, " on disk to version ").concat(newVersion, " at ").concat(newPath));
    }
    else {
        (0, debug_js_1.logForDebugging)("Cannot update ".concat(pluginId, " on disk: no installation for scope ").concat(scope));
    }
    // Note: inMemoryInstalledPlugins is NOT updated
}
/**
 * Check if there are pending updates (disk differs from memory).
 * This happens when background updater has downloaded new versions.
 *
 * @returns true if any plugin has a different install path on disk vs memory
 */
function hasPendingUpdates() {
    var memoryState = getInMemoryInstalledPlugins();
    var diskState = loadInstalledPluginsFromDisk();
    for (var _i = 0, _a = Object.entries(diskState.plugins); _i < _a.length; _i++) {
        var _b = _a[_i], pluginId = _b[0], diskInstallations = _b[1];
        var memoryInstallations = memoryState.plugins[pluginId];
        if (!memoryInstallations)
            continue;
        var _loop_2 = function (diskEntry) {
            var memoryEntry = memoryInstallations.find(function (m) {
                return m.scope === diskEntry.scope &&
                    m.projectPath === diskEntry.projectPath;
            });
            if (memoryEntry && memoryEntry.installPath !== diskEntry.installPath) {
                return { value: true // Disk has different version than memory
                 };
            }
        };
        for (var _c = 0, diskInstallations_1 = diskInstallations; _c < diskInstallations_1.length; _c++) {
            var diskEntry = diskInstallations_1[_c];
            var state_1 = _loop_2(diskEntry);
            if (typeof state_1 === "object")
                return state_1.value;
        }
    }
    return false;
}
/**
 * Get the count of pending updates (installations where disk differs from memory).
 *
 * @returns Number of installations with pending updates
 */
function getPendingUpdateCount() {
    var count = 0;
    var memoryState = getInMemoryInstalledPlugins();
    var diskState = loadInstalledPluginsFromDisk();
    for (var _i = 0, _a = Object.entries(diskState.plugins); _i < _a.length; _i++) {
        var _b = _a[_i], pluginId = _b[0], diskInstallations = _b[1];
        var memoryInstallations = memoryState.plugins[pluginId];
        if (!memoryInstallations)
            continue;
        var _loop_3 = function (diskEntry) {
            var memoryEntry = memoryInstallations.find(function (m) {
                return m.scope === diskEntry.scope &&
                    m.projectPath === diskEntry.projectPath;
            });
            if (memoryEntry && memoryEntry.installPath !== diskEntry.installPath) {
                count++;
            }
        };
        for (var _c = 0, diskInstallations_2 = diskInstallations; _c < diskInstallations_2.length; _c++) {
            var diskEntry = diskInstallations_2[_c];
            _loop_3(diskEntry);
        }
    }
    return count;
}
/**
 * Get details about pending updates for display.
 *
 * @returns Array of objects with pluginId, scope, oldVersion, newVersion
 */
function getPendingUpdatesDetails() {
    var updates = [];
    var memoryState = getInMemoryInstalledPlugins();
    var diskState = loadInstalledPluginsFromDisk();
    for (var _i = 0, _a = Object.entries(diskState.plugins); _i < _a.length; _i++) {
        var _b = _a[_i], pluginId = _b[0], diskInstallations = _b[1];
        var memoryInstallations = memoryState.plugins[pluginId];
        if (!memoryInstallations)
            continue;
        var _loop_4 = function (diskEntry) {
            var memoryEntry = memoryInstallations.find(function (m) {
                return m.scope === diskEntry.scope &&
                    m.projectPath === diskEntry.projectPath;
            });
            if (memoryEntry && memoryEntry.installPath !== diskEntry.installPath) {
                updates.push({
                    pluginId: pluginId,
                    scope: diskEntry.scope,
                    oldVersion: memoryEntry.version || 'unknown',
                    newVersion: diskEntry.version || 'unknown',
                });
            }
        };
        for (var _c = 0, diskInstallations_3 = diskInstallations; _c < diskInstallations_3.length; _c++) {
            var diskEntry = diskInstallations_3[_c];
            _loop_4(diskEntry);
        }
    }
    return updates;
}
/**
 * Reset the in-memory session state.
 * This should only be called at startup or for testing.
 */
function resetInMemoryState() {
    inMemoryInstalledPlugins = null;
}
/**
 * Initialize the versioned plugins system.
 * This triggers V1→V2 migration and initializes the in-memory session state.
 *
 * This should be called early during startup in all modes (REPL and headless).
 *
 * @returns Promise that resolves when initialization is complete
 */
function initializeVersionedPlugins() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Step 1: Migrate to single file format (consolidates V1/V2 files, cleans up legacy cache)
                    migrateToSinglePluginFile();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, migrateFromEnabledPlugins()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [3 /*break*/, 4];
                case 4:
                    data = getInMemoryInstalledPlugins();
                    (0, debug_js_1.logForDebugging)("Initialized versioned plugins system with ".concat(Object.keys(data.plugins).length, " plugins"));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Remove all plugin entries belonging to a specific marketplace from installed_plugins.json.
 *
 * Loads V2 data once, finds all plugin IDs matching the `@{marketplaceName}` suffix,
 * collects their install paths, removes the entries, and saves once.
 *
 * @param marketplaceName - The marketplace name (matched against `@{name}` suffix)
 * @returns orphanedPaths (for markPluginVersionOrphaned) and removedPluginIds
 *   (for deletePluginOptions) from the removed entries
 */
function removeAllPluginsForMarketplace(marketplaceName) {
    var _a;
    if (!marketplaceName) {
        return { orphanedPaths: [], removedPluginIds: [] };
    }
    var data = loadInstalledPluginsFromDisk();
    var suffix = "@".concat(marketplaceName);
    var orphanedPaths = new Set();
    var removedPluginIds = [];
    for (var _i = 0, _b = Object.keys(data.plugins); _i < _b.length; _i++) {
        var pluginId = _b[_i];
        if (!pluginId.endsWith(suffix)) {
            continue;
        }
        for (var _c = 0, _d = (_a = data.plugins[pluginId]) !== null && _a !== void 0 ? _a : []; _c < _d.length; _c++) {
            var entry = _d[_c];
            if (entry.installPath) {
                orphanedPaths.add(entry.installPath);
            }
        }
        delete data.plugins[pluginId];
        removedPluginIds.push(pluginId);
        (0, debug_js_1.logForDebugging)("Removed installed plugin for marketplace removal: ".concat(pluginId));
    }
    if (removedPluginIds.length > 0) {
        saveInstalledPluginsV2(data);
    }
    return { orphanedPaths: Array.from(orphanedPaths), removedPluginIds: removedPluginIds };
}
/**
 * Predicate: is this installation relevant to the current project context?
 *
 * V2 installed_plugins.json may contain project-scoped entries from OTHER
 * projects (a single user-level file tracks all scopes). Callers asking
 * "is this plugin installed" almost always mean "installed in a way that's
 * active here" — not "installed anywhere on this machine". See #29608:
 * DiscoverPlugins.tsx was hiding plugins that were only installed in an
 * unrelated project.
 *
 * - user/managed scopes: always relevant (global)
 * - project/local scopes: only if projectPath matches the current project
 *
 * getOriginalCwd() (not getCwd()) because "current project" is where Claude
 * Code was launched from, not wherever the working directory has drifted to.
 */
function isInstallationRelevantToCurrentProject(inst) {
    return (inst.scope === 'user' ||
        inst.scope === 'managed' ||
        inst.projectPath === (0, state_js_1.getOriginalCwd)());
}
/**
 * Check if a plugin is installed in a way relevant to the current project.
 *
 * @param pluginId - Plugin ID in "plugin@marketplace" format
 * @returns True if the plugin has a user/managed-scoped installation, OR a
 *   project/local-scoped installation whose projectPath matches the current
 *   project. Returns false for plugins only installed in other projects.
 */
function isPluginInstalled(pluginId) {
    var _a;
    var v2Data = loadInstalledPluginsV2();
    var installations = v2Data.plugins[pluginId];
    if (!installations || installations.length === 0) {
        return false;
    }
    if (!installations.some(isInstallationRelevantToCurrentProject)) {
        return false;
    }
    // Plugins are loaded from settings.enabledPlugins
    // If settings.enabledPlugins and installed_plugins.json diverge
    // (via settings.json clobber), return false
    return ((_a = (0, settings_js_1.getSettings_DEPRECATED)().enabledPlugins) === null || _a === void 0 ? void 0 : _a[pluginId]) !== undefined;
}
/**
 * True only if the plugin has a USER or MANAGED scope installation.
 *
 * Use this in UI flows that decide whether to offer installation at all.
 * A user/managed-scope install means the plugin is available everywhere —
 * there's nothing the user can add. A project/local-scope install means the
 * user might still want to install at user scope to make it global.
 *
 * gh-29997 / gh-29240 / gh-29392: the browse UI was blocking on
 * isPluginInstalled() which returns true for project-scope installs,
 * preventing users from adding a user-scope entry for the same plugin.
 * The backend (installPluginOp → addInstalledPlugin) already supports
 * multiple scope entries per plugin — only the UI gate was wrong.
 *
 * @param pluginId - Plugin ID in "plugin@marketplace" format
 */
function isPluginGloballyInstalled(pluginId) {
    var _a;
    var v2Data = loadInstalledPluginsV2();
    var installations = v2Data.plugins[pluginId];
    if (!installations || installations.length === 0) {
        return false;
    }
    var hasGlobalEntry = installations.some(function (entry) { return entry.scope === 'user' || entry.scope === 'managed'; });
    if (!hasGlobalEntry)
        return false;
    // Same settings divergence guard as isPluginInstalled — if enabledPlugins
    // was clobbered, treat as not-installed so the user can re-enable.
    return ((_a = (0, settings_js_1.getSettings_DEPRECATED)().enabledPlugins) === null || _a === void 0 ? void 0 : _a[pluginId]) !== undefined;
}
/**
 * Add or update a plugin's installation metadata
 *
 * Implements double-write: updates both V1 and V2 files.
 *
 * @param pluginId - Plugin ID in "plugin@marketplace" format
 * @param metadata - Installation metadata
 * @param scope - Installation scope (defaults to 'user' for backward compatibility)
 * @param projectPath - Project path (for project/local scopes)
 */
function addInstalledPlugin(pluginId, metadata, scope, projectPath) {
    if (scope === void 0) { scope = 'user'; }
    var v2Data = loadInstalledPluginsFromDisk();
    var v2Entry = __assign({ scope: scope, installPath: metadata.installPath, version: metadata.version, installedAt: metadata.installedAt, lastUpdated: metadata.lastUpdated, gitCommitSha: metadata.gitCommitSha }, (projectPath && { projectPath: projectPath }));
    // Get or create array for this plugin (preserves other scope installations)
    var installations = v2Data.plugins[pluginId] || [];
    // Find existing entry for this scope+projectPath
    var existingIndex = installations.findIndex(function (entry) { return entry.scope === scope && entry.projectPath === projectPath; });
    var isUpdate = existingIndex >= 0;
    if (isUpdate) {
        installations[existingIndex] = v2Entry;
    }
    else {
        installations.push(v2Entry);
    }
    v2Data.plugins[pluginId] = installations;
    saveInstalledPluginsV2(v2Data);
    (0, debug_js_1.logForDebugging)("".concat(isUpdate ? 'Updated' : 'Added', " installed plugin: ").concat(pluginId, " (scope: ").concat(scope, ")"));
}
/**
 * Remove a plugin from the installed plugins registry
 * This should be called when a plugin is uninstalled.
 *
 * Note: This function only updates the registry file. To fully uninstall,
 * call deletePluginCache() afterward to remove the physical files.
 *
 * @param pluginId - Plugin ID in "plugin@marketplace" format
 * @returns The removed plugin metadata, or undefined if it wasn't installed
 */
function removeInstalledPlugin(pluginId) {
    var v2Data = loadInstalledPluginsFromDisk();
    var installations = v2Data.plugins[pluginId];
    if (!installations || installations.length === 0) {
        return undefined;
    }
    // Extract V1-compatible metadata from first installation for return value
    var firstInstall = installations[0];
    var metadata = firstInstall
        ? {
            version: firstInstall.version || 'unknown',
            installedAt: firstInstall.installedAt || new Date().toISOString(),
            lastUpdated: firstInstall.lastUpdated,
            installPath: firstInstall.installPath,
            gitCommitSha: firstInstall.gitCommitSha,
        }
        : undefined;
    delete v2Data.plugins[pluginId];
    saveInstalledPluginsV2(v2Data);
    (0, debug_js_1.logForDebugging)("Removed installed plugin: ".concat(pluginId));
    return metadata;
}
function deletePluginCache(installPath) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    try {
        fs.rmSync(installPath, { recursive: true, force: true });
        (0, debug_js_1.logForDebugging)("Deleted plugin cache at ".concat(installPath));
        // Clean up empty parent plugin directory (cache/{marketplace}/{plugin})
        // Versioned paths have structure: cache/{marketplace}/{plugin}/{version}
        var cachePath = (0, pluginLoader_js_1.getPluginCachePath)();
        if (installPath.includes('/cache/') && installPath.startsWith(cachePath)) {
            var pluginDir = (0, path_1.dirname)(installPath); // e.g., cache/{marketplace}/{plugin}
            if (pluginDir !== cachePath && pluginDir.startsWith(cachePath)) {
                try {
                    var contents = fs.readdirSync(pluginDir);
                    if (contents.length === 0) {
                        fs.rmdirSync(pluginDir);
                        (0, debug_js_1.logForDebugging)("Deleted empty plugin directory at ".concat(pluginDir));
                    }
                }
                catch (_a) {
                    // Parent dir doesn't exist or isn't readable — skip cleanup
                }
            }
        }
    }
    catch (error) {
        var errorMsg = (0, errors_js_1.errorMessage)(error);
        (0, log_js_1.logError)((0, errors_js_1.toError)(error));
        throw new Error("Failed to delete plugin cache at ".concat(installPath, ": ").concat(errorMsg));
    }
}
/**
 * Get the git commit SHA from a git repository directory
 * Returns undefined if not a git repo or if operation fails
 */
function getGitCommitSha(dirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var sha;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, gitFilesystem_js_1.getHeadForDir)(dirPath)];
                case 1:
                    sha = _a.sent();
                    return [2 /*return*/, sha !== null && sha !== void 0 ? sha : undefined];
            }
        });
    });
}
/**
 * Try to read version from plugin manifest
 */
function getPluginVersionFromManifest(pluginCachePath, pluginId) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var manifestPath = (0, path_1.join)(pluginCachePath, '.claude-plugin', 'plugin.json');
    try {
        var manifestContent = fs.readFileSync(manifestPath, { encoding: 'utf-8' });
        var manifest = (0, slowOperations_js_1.jsonParse)(manifestContent);
        return manifest.version || 'unknown';
    }
    catch (_a) {
        (0, debug_js_1.logForDebugging)("Could not read version from manifest for ".concat(pluginId));
        return 'unknown';
    }
}
/**
 * Sync installed_plugins.json with enabledPlugins from settings
 *
 * Checks the schema version and only updates if:
 * - File doesn't exist (version 0 → current)
 * - Schema version is outdated (old version → current)
 * - New plugins appear in enabledPlugins
 *
 * This version-based approach makes it easy to add new fields in the future:
 * 1. Increment CURRENT_SCHEMA_VERSION
 * 2. Add migration logic for the new version
 * 3. File is automatically updated on next startup
 *
 * For each plugin in enabledPlugins that's not in installed_plugins.json:
 * - Queries marketplace to get actual install path
 * - Extracts version from manifest if available
 * - Captures git commit SHA for git-based plugins
 *
 * Being present in enabledPlugins (whether true or false) indicates the plugin
 * has been installed. The enabled/disabled state remains in settings.json.
 */
function migrateFromEnabledPlugins() {
    return __awaiter(this, void 0, void 0, function () {
        var settings, enabledPlugins, rawFileData, fileExists, isV2Format, existingData, plugins_1, allPluginsExist, now, projectPath, pluginScopeFromSettings, settingSources, _i, settingSources_1, source, sourceSettings, sourceEnabledPlugins, _a, _b, pluginId, scope, v2Plugins, existingData, updatedCount, addedCount, _c, pluginScopeFromSettings_1, _d, pluginId, scopeInfo, existingInstallations, existingEntry, _e, pluginName, marketplace, pluginInfo, entry, marketplaceInstallLocation, installPath, version, gitCommitSha, cachePath, sanitizedName, pluginCachePath, dirEntries, e_1, error_2, v2Data;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    settings = (0, settings_js_1.getSettings_DEPRECATED)();
                    enabledPlugins = settings.enabledPlugins || {};
                    // No plugins in settings = nothing to sync
                    if (Object.keys(enabledPlugins).length === 0) {
                        return [2 /*return*/];
                    }
                    rawFileData = readInstalledPluginsFileRaw();
                    fileExists = rawFileData !== null;
                    isV2Format = fileExists && (rawFileData === null || rawFileData === void 0 ? void 0 : rawFileData.version) === 2;
                    // If file exists with V2 format, check if we can skip the expensive migration
                    if (isV2Format && rawFileData) {
                        existingData = (0, schemas_js_1.InstalledPluginsFileSchemaV2)().safeParse(rawFileData.data);
                        if (existingData === null || existingData === void 0 ? void 0 : existingData.success) {
                            plugins_1 = existingData.data.plugins;
                            allPluginsExist = Object.keys(enabledPlugins)
                                .filter(function (id) { return id.includes('@'); })
                                .every(function (id) {
                                var installations = plugins_1[id];
                                return installations && installations.length > 0;
                            });
                            if (allPluginsExist) {
                                (0, debug_js_1.logForDebugging)('All plugins already exist, skipping migration');
                                return [2 /*return*/];
                            }
                        }
                    }
                    (0, debug_js_1.logForDebugging)(fileExists
                        ? 'Syncing installed_plugins.json with enabledPlugins from all settings.json files'
                        : 'Creating installed_plugins.json from settings.json files');
                    now = new Date().toISOString();
                    projectPath = (0, cwd_js_1.getCwd)();
                    pluginScopeFromSettings = new Map();
                    settingSources = [
                        'userSettings',
                        'projectSettings',
                        'localSettings',
                    ];
                    for (_i = 0, settingSources_1 = settingSources; _i < settingSources_1.length; _i++) {
                        source = settingSources_1[_i];
                        sourceSettings = (0, settings_js_1.getSettingsForSource)(source);
                        sourceEnabledPlugins = (sourceSettings === null || sourceSettings === void 0 ? void 0 : sourceSettings.enabledPlugins) || {};
                        for (_a = 0, _b = Object.keys(sourceEnabledPlugins); _a < _b.length; _a++) {
                            pluginId = _b[_a];
                            // Skip non-standard plugin IDs
                            if (!pluginId.includes('@'))
                                continue;
                            scope = (0, pluginIdentifier_js_1.settingSourceToScope)(source);
                            pluginScopeFromSettings.set(pluginId, {
                                scope: scope,
                                projectPath: scope === 'user' ? undefined : projectPath,
                            });
                        }
                    }
                    v2Plugins = {};
                    if (fileExists) {
                        existingData = loadInstalledPluginsV2();
                        v2Plugins = __assign({}, existingData.plugins);
                    }
                    updatedCount = 0;
                    addedCount = 0;
                    _c = 0, pluginScopeFromSettings_1 = pluginScopeFromSettings;
                    _f.label = 1;
                case 1:
                    if (!(_c < pluginScopeFromSettings_1.length)) return [3 /*break*/, 15];
                    _d = pluginScopeFromSettings_1[_c], pluginId = _d[0], scopeInfo = _d[1];
                    existingInstallations = v2Plugins[pluginId];
                    if (!(existingInstallations && existingInstallations.length > 0)) return [3 /*break*/, 2];
                    existingEntry = existingInstallations[0];
                    if (existingEntry &&
                        (existingEntry.scope !== scopeInfo.scope ||
                            existingEntry.projectPath !== scopeInfo.projectPath)) {
                        existingEntry.scope = scopeInfo.scope;
                        if (scopeInfo.projectPath) {
                            existingEntry.projectPath = scopeInfo.projectPath;
                        }
                        else {
                            delete existingEntry.projectPath;
                        }
                        existingEntry.lastUpdated = now;
                        updatedCount++;
                        (0, debug_js_1.logForDebugging)("Updated ".concat(pluginId, " scope to ").concat(scopeInfo.scope, " (settings.json is source of truth)"));
                    }
                    return [3 /*break*/, 14];
                case 2:
                    _e = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId), pluginName = _e.name, marketplace = _e.marketplace;
                    if (!pluginName || !marketplace) {
                        return [3 /*break*/, 14];
                    }
                    _f.label = 3;
                case 3:
                    _f.trys.push([3, 13, , 14]);
                    (0, debug_js_1.logForDebugging)("Looking up plugin ".concat(pluginId, " in marketplace ").concat(marketplace));
                    return [4 /*yield*/, (0, marketplaceManager_js_1.getPluginById)(pluginId)];
                case 4:
                    pluginInfo = _f.sent();
                    if (!pluginInfo) {
                        (0, debug_js_1.logForDebugging)("Plugin ".concat(pluginId, " not found in any marketplace, skipping"));
                        return [3 /*break*/, 14];
                    }
                    entry = pluginInfo.entry, marketplaceInstallLocation = pluginInfo.marketplaceInstallLocation;
                    installPath = void 0;
                    version = 'unknown';
                    gitCommitSha = undefined;
                    if (!(typeof entry.source === 'string')) return [3 /*break*/, 6];
                    installPath = (0, path_1.join)(marketplaceInstallLocation, entry.source);
                    version = getPluginVersionFromManifest(installPath, pluginId);
                    return [4 /*yield*/, getGitCommitSha(installPath)];
                case 5:
                    gitCommitSha = _f.sent();
                    return [3 /*break*/, 12];
                case 6:
                    cachePath = (0, pluginLoader_js_1.getPluginCachePath)();
                    sanitizedName = pluginName.replace(/[^a-zA-Z0-9-_]/g, '-');
                    pluginCachePath = (0, path_1.join)(cachePath, sanitizedName);
                    dirEntries = void 0;
                    _f.label = 7;
                case 7:
                    _f.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().readdir(pluginCachePath)];
                case 8:
                    dirEntries = (_f.sent()).map(function (e) { return (typeof e === 'string' ? e : e.name); });
                    return [3 /*break*/, 10];
                case 9:
                    e_1 = _f.sent();
                    if (!(0, errors_js_1.isENOENT)(e_1))
                        throw e_1;
                    (0, debug_js_1.logForDebugging)("External plugin ".concat(pluginId, " not in cache, skipping"));
                    return [3 /*break*/, 14];
                case 10:
                    installPath = pluginCachePath;
                    // Only read manifest if the .claude-plugin dir is present
                    if (dirEntries.includes('.claude-plugin')) {
                        version = getPluginVersionFromManifest(pluginCachePath, pluginId);
                    }
                    return [4 /*yield*/, getGitCommitSha(pluginCachePath)];
                case 11:
                    gitCommitSha = _f.sent();
                    _f.label = 12;
                case 12:
                    if (version === 'unknown' && entry.version) {
                        version = entry.version;
                    }
                    if (version === 'unknown' && gitCommitSha) {
                        version = gitCommitSha.substring(0, 12);
                    }
                    v2Plugins[pluginId] = [
                        __assign({ scope: scopeInfo.scope, installPath: (0, pluginLoader_js_1.getVersionedCachePath)(pluginId, version), version: version, installedAt: now, lastUpdated: now, gitCommitSha: gitCommitSha }, (scopeInfo.projectPath && {
                            projectPath: scopeInfo.projectPath,
                        })),
                    ];
                    addedCount++;
                    (0, debug_js_1.logForDebugging)("Added ".concat(pluginId, " with scope ").concat(scopeInfo.scope));
                    return [3 /*break*/, 14];
                case 13:
                    error_2 = _f.sent();
                    (0, debug_js_1.logForDebugging)("Failed to add plugin ".concat(pluginId, ": ").concat(error_2));
                    return [3 /*break*/, 14];
                case 14:
                    _c++;
                    return [3 /*break*/, 1];
                case 15:
                    // Step 4: Save to single file (V2 format)
                    if (!fileExists || updatedCount > 0 || addedCount > 0) {
                        v2Data = { version: 2, plugins: v2Plugins };
                        saveInstalledPluginsV2(v2Data);
                        (0, debug_js_1.logForDebugging)("Sync completed: ".concat(addedCount, " added, ").concat(updatedCount, " updated in installed_plugins.json"));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
