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
exports.CHANGELOG_URL = void 0;
exports._resetChangelogCacheForTesting = _resetChangelogCacheForTesting;
exports.migrateChangelogFromConfig = migrateChangelogFromConfig;
exports.fetchAndStoreChangelog = fetchAndStoreChangelog;
exports.getStoredChangelog = getStoredChangelog;
exports.getStoredChangelogFromMemory = getStoredChangelogFromMemory;
exports.parseChangelog = parseChangelog;
exports.getRecentReleaseNotes = getRecentReleaseNotes;
exports.getAllReleaseNotes = getAllReleaseNotes;
exports.checkForReleaseNotes = checkForReleaseNotes;
exports.checkForReleaseNotesSync = checkForReleaseNotesSync;
var axios_1 = require("axios");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var semver_1 = require("semver");
var state_js_1 = require("../bootstrap/state.js");
var config_js_1 = require("./config.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var log_js_1 = require("./log.js");
var privacyLevel_js_1 = require("./privacyLevel.js");
var semver_js_1 = require("./semver.js");
var MAX_RELEASE_NOTES_SHOWN = 5;
/**
 * We fetch the changelog from GitHub instead of bundling it with the build.
 *
 * This is necessary because Ink's static rendering makes it difficult to
 * dynamically update/show components after initial render. By storing the
 * changelog in config, we ensure it's available on the next startup without
 * requiring a full re-render of the current UI.
 *
 * The flow is:
 * 1. User updates to a new version
 * 2. We fetch the changelog in the background and store it in config
 * 3. Next time the user starts Claude, the cached changelog is available immediately
 */
exports.CHANGELOG_URL = 'https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md';
var RAW_CHANGELOG_URL = 'https://raw.githubusercontent.com/anthropics/claude-code/refs/heads/main/CHANGELOG.md';
/**
 * Get the path for the cached changelog file.
 * The changelog is stored at ~/.claude/cache/changelog.md
 */
function getChangelogCachePath() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'cache', 'changelog.md');
}
// In-memory cache populated by async reads. Sync callers (React render, sync
// helpers) read from this cache after setup.ts awaits checkForReleaseNotes().
var changelogMemoryCache = null;
/** @internal exported for tests */
function _resetChangelogCacheForTesting() {
    changelogMemoryCache = null;
}
/**
 * Migrate changelog from old config-based storage to file-based storage.
 * This should be called once at startup to ensure the migration happens
 * before any other config saves that might re-add the deprecated field.
 */
function migrateChangelogFromConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var config, cachePath, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    config = (0, config_js_1.getGlobalConfig)();
                    if (!config.cachedChangelog) {
                        return [2 /*return*/];
                    }
                    cachePath = getChangelogCachePath();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(cachePath), { recursive: true })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(cachePath, config.cachedChangelog, {
                            encoding: 'utf-8',
                            flag: 'wx', // Write only if file doesn't exist
                        })];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 5:
                    // Remove the deprecated field from config
                    (0, config_js_1.saveGlobalConfig)(function (_a) {
                        var _ = _a.cachedChangelog, rest = __rest(_a, ["cachedChangelog"]);
                        return rest;
                    });
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch the changelog from GitHub and store it in cache file
 * This runs in the background and doesn't block the UI
 */
function fetchAndStoreChangelog() {
    return __awaiter(this, void 0, void 0, function () {
        var response, changelogContent, cachePath, changelogLastFetched_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Skip in noninteractive mode
                    if ((0, state_js_1.getIsNonInteractiveSession)()) {
                        return [2 /*return*/];
                    }
                    // Skip network requests if nonessential traffic is disabled
                    if ((0, privacyLevel_js_1.isEssentialTrafficOnly)()) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, axios_1.default.get(RAW_CHANGELOG_URL)];
                case 1:
                    response = _a.sent();
                    if (!(response.status === 200)) return [3 /*break*/, 4];
                    changelogContent = response.data;
                    // Skip write if content unchanged — writing Date.now() defeats the
                    // dirty-check in saveGlobalConfig since the timestamp always differs.
                    if (changelogContent === changelogMemoryCache) {
                        return [2 /*return*/];
                    }
                    cachePath = getChangelogCachePath();
                    // Ensure cache directory exists
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(cachePath), { recursive: true })
                        // Write changelog to cache file
                    ];
                case 2:
                    // Ensure cache directory exists
                    _a.sent();
                    // Write changelog to cache file
                    return [4 /*yield*/, (0, promises_1.writeFile)(cachePath, changelogContent, { encoding: 'utf-8' })];
                case 3:
                    // Write changelog to cache file
                    _a.sent();
                    changelogMemoryCache = changelogContent;
                    changelogLastFetched_1 = Date.now();
                    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { changelogLastFetched: changelogLastFetched_1 })); });
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the stored changelog from cache file if available.
 * Populates the in-memory cache for subsequent sync reads.
 * @returns The cached changelog content or empty string if not available
 */
function getStoredChangelog() {
    return __awaiter(this, void 0, void 0, function () {
        var cachePath, content, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (changelogMemoryCache !== null) {
                        return [2 /*return*/, changelogMemoryCache];
                    }
                    cachePath = getChangelogCachePath();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(cachePath, 'utf-8')];
                case 2:
                    content = _b.sent();
                    changelogMemoryCache = content;
                    return [2 /*return*/, content];
                case 3:
                    _a = _b.sent();
                    changelogMemoryCache = '';
                    return [2 /*return*/, ''];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Synchronous accessor for the changelog, reading only from the in-memory cache.
 * Returns empty string if the async getStoredChangelog() hasn't been called yet.
 * Intended for React render paths where async is not possible; setup.ts ensures
 * the cache is populated before first render via `await checkForReleaseNotes()`.
 */
function getStoredChangelogFromMemory() {
    return changelogMemoryCache !== null && changelogMemoryCache !== void 0 ? changelogMemoryCache : '';
}
/**
 * Parses a changelog string in markdown format into a structured format
 * @param content - The changelog content string
 * @returns Record mapping version numbers to arrays of release notes
 */
function parseChangelog(content) {
    var _a;
    try {
        if (!content)
            return {};
        // Parse the content
        var releaseNotes = {};
        // Split by heading lines (## X.X.X)
        var sections = content.split(/^## /gm).slice(1); // Skip the first section which is the header
        for (var _i = 0, sections_1 = sections; _i < sections_1.length; _i++) {
            var section = sections_1[_i];
            var lines = section.trim().split('\n');
            if (lines.length === 0)
                continue;
            // Extract version from the first line
            // Handle both "1.2.3" and "1.2.3 - YYYY-MM-DD" formats
            var versionLine = lines[0];
            if (!versionLine)
                continue;
            // First part before any dash is the version
            var version = ((_a = versionLine.split(' - ')[0]) === null || _a === void 0 ? void 0 : _a.trim()) || '';
            if (!version)
                continue;
            // Extract bullet points
            var notes = lines
                .slice(1)
                .filter(function (line) { return line.trim().startsWith('- '); })
                .map(function (line) { return line.trim().substring(2).trim(); })
                .filter(Boolean);
            if (notes.length > 0) {
                releaseNotes[version] = notes;
            }
        }
        return releaseNotes;
    }
    catch (error) {
        (0, log_js_1.logError)((0, errors_js_1.toError)(error));
        return {};
    }
}
/**
 * Gets release notes to show based on the previously seen version.
 * Shows up to MAX_RELEASE_NOTES_SHOWN items total, prioritizing the most recent versions.
 *
 * @param currentVersion - The current app version
 * @param previousVersion - The last version where release notes were seen (or null if first time)
 * @param readChangelog - Function to read the changelog (defaults to readChangelogFile)
 * @returns Array of release notes to display
 */
function getRecentReleaseNotes(currentVersion, previousVersion, changelogContent) {
    if (changelogContent === void 0) { changelogContent = getStoredChangelogFromMemory(); }
    try {
        var releaseNotes = parseChangelog(changelogContent);
        // Strip SHA from both versions to compare only the base versions
        var baseCurrentVersion = (0, semver_1.coerce)(currentVersion);
        var basePreviousVersion_1 = previousVersion ? (0, semver_1.coerce)(previousVersion) : null;
        if (!basePreviousVersion_1 ||
            (baseCurrentVersion &&
                (0, semver_js_1.gt)(baseCurrentVersion.version, basePreviousVersion_1.version))) {
            // Get all versions that are newer than the last seen version
            return Object.entries(releaseNotes)
                .filter(function (_a) {
                var version = _a[0];
                return !basePreviousVersion_1 || (0, semver_js_1.gt)(version, basePreviousVersion_1.version);
            })
                .sort(function (_a, _b) {
                var versionA = _a[0];
                var versionB = _b[0];
                return ((0, semver_js_1.gt)(versionA, versionB) ? -1 : 1);
            }) // Sort newest first
                .flatMap(function (_a) {
                var _ = _a[0], notes = _a[1];
                return notes;
            })
                .filter(Boolean)
                .slice(0, MAX_RELEASE_NOTES_SHOWN);
        }
    }
    catch (error) {
        (0, log_js_1.logError)((0, errors_js_1.toError)(error));
        return [];
    }
    return [];
}
/**
 * Gets all release notes as an array of [version, notes] arrays.
 * Versions are sorted with oldest first.
 *
 * @param readChangelog - Function to read the changelog (defaults to readChangelogFile)
 * @returns Array of [version, notes[]] arrays
 */
function getAllReleaseNotes(changelogContent) {
    if (changelogContent === void 0) { changelogContent = getStoredChangelogFromMemory(); }
    try {
        var releaseNotes_1 = parseChangelog(changelogContent);
        // Sort versions with oldest first
        var sortedVersions = Object.keys(releaseNotes_1).sort(function (a, b) {
            return (0, semver_js_1.gt)(a, b) ? 1 : -1;
        });
        // Return array of [version, notes] arrays
        return sortedVersions
            .map(function (version) {
            var versionNotes = releaseNotes_1[version];
            if (!versionNotes || versionNotes.length === 0)
                return null;
            var notes = versionNotes.filter(Boolean);
            if (notes.length === 0)
                return null;
            return [version, notes];
        })
            .filter(function (item) { return item !== null; });
    }
    catch (error) {
        (0, log_js_1.logError)((0, errors_js_1.toError)(error));
        return [];
    }
}
/**
 * Checks if there are release notes to show based on the last seen version.
 * Can be used by multiple components to determine whether to display release notes.
 * Also triggers a fetch of the latest changelog if the version has changed.
 *
 * @param lastSeenVersion The last version of release notes the user has seen
 * @param currentVersion The current application version, defaults to MACRO.VERSION
 * @returns An object with hasReleaseNotes and the releaseNotes content
 */
function checkForReleaseNotes(lastSeenVersion_1) {
    return __awaiter(this, arguments, void 0, function (lastSeenVersion, currentVersion) {
        var changelog, commits, cachedChangelog, releaseNotes, hasReleaseNotes;
        if (currentVersion === void 0) { currentVersion = MACRO.VERSION; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // For Ant builds, use VERSION_CHANGELOG bundled at build time
                    if (process.env.USER_TYPE === 'ant') {
                        changelog = MACRO.VERSION_CHANGELOG;
                        if (changelog) {
                            commits = changelog.trim().split('\n').filter(Boolean);
                            return [2 /*return*/, {
                                    hasReleaseNotes: commits.length > 0,
                                    releaseNotes: commits,
                                }];
                        }
                        return [2 /*return*/, {
                                hasReleaseNotes: false,
                                releaseNotes: [],
                            }];
                    }
                    return [4 /*yield*/, getStoredChangelog()
                        // If the version has changed or we don't have a cached changelog, fetch a new one
                        // This happens in the background and doesn't block the UI
                    ];
                case 1:
                    cachedChangelog = _a.sent();
                    // If the version has changed or we don't have a cached changelog, fetch a new one
                    // This happens in the background and doesn't block the UI
                    if (lastSeenVersion !== currentVersion || !cachedChangelog) {
                        fetchAndStoreChangelog().catch(function (error) { return (0, log_js_1.logError)((0, errors_js_1.toError)(error)); });
                    }
                    releaseNotes = getRecentReleaseNotes(currentVersion, lastSeenVersion, cachedChangelog);
                    hasReleaseNotes = releaseNotes.length > 0;
                    return [2 /*return*/, {
                            hasReleaseNotes: hasReleaseNotes,
                            releaseNotes: releaseNotes,
                        }];
            }
        });
    });
}
/**
 * Synchronous variant of checkForReleaseNotes for React render paths.
 * Reads only from the in-memory cache populated by the async version.
 * setup.ts awaits checkForReleaseNotes() before first render, so this
 * returns accurate results in component render bodies.
 */
function checkForReleaseNotesSync(lastSeenVersion, currentVersion) {
    if (currentVersion === void 0) { currentVersion = MACRO.VERSION; }
    // For Ant builds, use VERSION_CHANGELOG bundled at build time
    if (process.env.USER_TYPE === 'ant') {
        var changelog = MACRO.VERSION_CHANGELOG;
        if (changelog) {
            var commits = changelog.trim().split('\n').filter(Boolean);
            return {
                hasReleaseNotes: commits.length > 0,
                releaseNotes: commits,
            };
        }
        return {
            hasReleaseNotes: false,
            releaseNotes: [],
        };
    }
    var releaseNotes = getRecentReleaseNotes(currentVersion, lastSeenVersion);
    return {
        hasReleaseNotes: releaseNotes.length > 0,
        releaseNotes: releaseNotes,
    };
}
