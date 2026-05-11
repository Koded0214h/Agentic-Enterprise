"use strict";
/**
 * Marketplace manager for Claude Code plugins
 *
 * This module provides functionality to:
 * - Manage known marketplace sources (URLs, GitHub repos, npm packages, local files)
 * - Cache marketplace manifests locally for offline access
 * - Install plugins from marketplace entries
 * - Track and update marketplace configurations
 *
 * File structure managed by this module:
 * ~/.claude/
 *   └── plugins/
 *       ├── known_marketplaces.json    # Configuration of all known marketplaces
 *       └── marketplaces/              # Cache directory for marketplace data
 *           ├── my-marketplace.json    # Cached marketplace from URL source
 *           └── github-marketplace/    # Cloned repository for GitHub source
 *               └── .claude-plugin/
 *                   └── marketplace.json
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
exports._test = exports.getMarketplace = void 0;
exports.getMarketplacesCacheDir = getMarketplacesCacheDir;
exports.clearMarketplacesCache = clearMarketplacesCache;
exports.getDeclaredMarketplaces = getDeclaredMarketplaces;
exports.getMarketplaceDeclaringSource = getMarketplaceDeclaringSource;
exports.saveMarketplaceToSettings = saveMarketplaceToSettings;
exports.loadKnownMarketplacesConfig = loadKnownMarketplacesConfig;
exports.loadKnownMarketplacesConfigSafe = loadKnownMarketplacesConfigSafe;
exports.saveKnownMarketplacesConfig = saveKnownMarketplacesConfig;
exports.registerSeedMarketplaces = registerSeedMarketplaces;
exports.gitPull = gitPull;
exports.gitClone = gitClone;
exports.reconcileSparseCheckout = reconcileSparseCheckout;
exports.addMarketplaceSource = addMarketplaceSource;
exports.removeMarketplaceSource = removeMarketplaceSource;
exports.getMarketplaceCacheOnly = getMarketplaceCacheOnly;
exports.getPluginByIdCacheOnly = getPluginByIdCacheOnly;
exports.getPluginById = getPluginById;
exports.refreshAllMarketplaces = refreshAllMarketplaces;
exports.refreshMarketplace = refreshMarketplace;
exports.setMarketplaceAutoUpdate = setMarketplaceAutoUpdate;
var axios_1 = require("axios");
var promises_1 = require("fs/promises");
var isEqual_js_1 = require("lodash-es/isEqual.js");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var debug_js_1 = require("../debug.js");
var envUtils_js_1 = require("../envUtils.js");
var errors_js_1 = require("../errors.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var fsOperations_js_1 = require("../fsOperations.js");
var git_js_1 = require("../git.js");
var log_js_1 = require("../log.js");
var settings_js_1 = require("../settings/settings.js");
var slowOperations_js_1 = require("../slowOperations.js");
var addDirPluginSettings_js_1 = require("./addDirPluginSettings.js");
var cacheUtils_js_1 = require("./cacheUtils.js");
var fetchTelemetry_js_1 = require("./fetchTelemetry.js");
var installedPluginsManager_js_1 = require("./installedPluginsManager.js");
var marketplaceHelpers_js_1 = require("./marketplaceHelpers.js");
var officialMarketplace_js_1 = require("./officialMarketplace.js");
var officialMarketplaceGcs_js_1 = require("./officialMarketplaceGcs.js");
var pluginDirectories_js_1 = require("./pluginDirectories.js");
var pluginIdentifier_js_1 = require("./pluginIdentifier.js");
var pluginOptionsStorage_js_1 = require("./pluginOptionsStorage.js");
var schemas_js_1 = require("./schemas.js");
/**
 * Get the path to the known marketplaces configuration file
 * Using a function instead of a constant allows proper mocking in tests
 */
function getKnownMarketplacesFile() {
    return (0, path_1.join)((0, pluginDirectories_js_1.getPluginsDirectory)(), 'known_marketplaces.json');
}
/**
 * Get the path to the marketplaces cache directory
 * Using a function instead of a constant allows proper mocking in tests
 */
function getMarketplacesCacheDir() {
    return (0, path_1.join)((0, pluginDirectories_js_1.getPluginsDirectory)(), 'marketplaces');
}
/**
 * Memoized inner function to get marketplace data.
 * This caches the marketplace in memory after loading from disk or network.
 */
/**
 * Clear all cached marketplace data (for testing)
 */
function clearMarketplacesCache() {
    var _a, _b;
    (_b = (_a = exports.getMarketplace.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
/**
 * Get declared marketplace intent from merged settings and --add-dir sources.
 * This is what SHOULD exist — used by the reconciler to find gaps.
 *
 * The official marketplace is implicitly declared with `sourceIsFallback: true`
 * when any enabled plugin references it.
 */
function getDeclaredMarketplaces() {
    var _a, _b;
    var implicit = {};
    // Only the official marketplace can be implicitly declared — it's the one
    // built-in source we know. Other marketplaces have no default source to inject.
    // Explicitly-disabled entries (value: false) don't count.
    var enabledPlugins = __assign(__assign({}, (0, addDirPluginSettings_js_1.getAddDirEnabledPlugins)()), ((_a = (0, settings_js_1.getInitialSettings)().enabledPlugins) !== null && _a !== void 0 ? _a : {}));
    for (var _i = 0, _c = Object.entries(enabledPlugins); _i < _c.length; _i++) {
        var _d = _c[_i], pluginId = _d[0], value = _d[1];
        if (value &&
            (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId).marketplace === officialMarketplace_js_1.OFFICIAL_MARKETPLACE_NAME) {
            implicit[officialMarketplace_js_1.OFFICIAL_MARKETPLACE_NAME] = {
                source: officialMarketplace_js_1.OFFICIAL_MARKETPLACE_SOURCE,
                sourceIsFallback: true,
            };
            break;
        }
    }
    // Lowest precedence: implicit < --add-dir < merged settings.
    // An explicit extraKnownMarketplaces entry for claude-plugins-official
    // in --add-dir or settings wins.
    return __assign(__assign(__assign({}, implicit), (0, addDirPluginSettings_js_1.getAddDirExtraMarketplaces)()), ((_b = (0, settings_js_1.getInitialSettings)().extraKnownMarketplaces) !== null && _b !== void 0 ? _b : {}));
}
/**
 * Find which editable settings source declared a marketplace.
 * Checks in reverse precedence order (highest priority last) so the
 * result is the source that "wins" in the merged view.
 * Returns null if the marketplace isn't declared in any editable source.
 */
function getMarketplaceDeclaringSource(name) {
    var _a;
    // Check highest-precedence editable sources first — the one that wins
    // in the merged view is the one we should write back to.
    var editableSources = ['localSettings', 'projectSettings', 'userSettings'];
    for (var _i = 0, editableSources_1 = editableSources; _i < editableSources_1.length; _i++) {
        var source = editableSources_1[_i];
        var settings = (0, settings_js_1.getSettingsForSource)(source);
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.extraKnownMarketplaces) === null || _a === void 0 ? void 0 : _a[name]) {
            return source;
        }
    }
    return null;
}
/**
 * Save a marketplace entry to settings (intent layer).
 * Does NOT touch known_marketplaces.json (state layer).
 *
 * @param name - The marketplace name
 * @param entry - The marketplace config
 * @param settingSource - Which settings source to write to (defaults to userSettings)
 */
function saveMarketplaceToSettings(name, entry, settingSource) {
    var _a;
    if (settingSource === void 0) { settingSource = 'userSettings'; }
    var existing = (_a = (0, settings_js_1.getSettingsForSource)(settingSource)) !== null && _a !== void 0 ? _a : {};
    var current = __assign({}, existing.extraKnownMarketplaces);
    current[name] = entry;
    (0, settings_js_1.updateSettingsForSource)(settingSource, { extraKnownMarketplaces: current });
}
/**
 * Load known marketplaces configuration from disk
 *
 * Reads the configuration file at ~/.claude/plugins/known_marketplaces.json
 * which contains a mapping of marketplace names to their sources and metadata.
 *
 * Example configuration file content:
 * ```json
 * {
 *   "official-marketplace": {
 *     "source": { "source": "url", "url": "https://example.com/marketplace.json" },
 *     "installLocation": "/Users/me/.claude/plugins/marketplaces/official-marketplace.json",
 *     "lastUpdated": "2024-01-15T10:30:00.000Z"
 *   },
 *   "company-plugins": {
 *     "source": { "source": "github", "repo": "mycompany/plugins" },
 *     "installLocation": "/Users/me/.claude/plugins/marketplaces/company-plugins",
 *     "lastUpdated": "2024-01-14T15:45:00.000Z"
 *   }
 * }
 * ```
 *
 * @returns Configuration object mapping marketplace names to their metadata
 */
function loadKnownMarketplacesConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var fs, configFile, content, data, parsed, errorMsg, error_1, errorMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    configFile = getKnownMarketplacesFile();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(configFile, {
                            encoding: 'utf-8',
                        })];
                case 2:
                    content = _a.sent();
                    data = (0, slowOperations_js_1.jsonParse)(content);
                    parsed = (0, schemas_js_1.KnownMarketplacesFileSchema)().safeParse(data);
                    if (!parsed.success) {
                        errorMsg = "Marketplace configuration file is corrupted: ".concat(parsed.error.issues.map(function (e) { return "".concat(e.path.join('.'), ": ").concat(e.message); }).join(', '));
                        (0, debug_js_1.logForDebugging)(errorMsg, {
                            level: 'error',
                        });
                        throw new errors_js_1.ConfigParseError(errorMsg, configFile, data);
                    }
                    return [2 /*return*/, parsed.data];
                case 3:
                    error_1 = _a.sent();
                    if ((0, errors_js_1.isENOENT)(error_1)) {
                        return [2 /*return*/, {}];
                    }
                    // If it's already a ConfigParseError, re-throw it
                    if (error_1 instanceof errors_js_1.ConfigParseError) {
                        throw error_1;
                    }
                    errorMsg = "Failed to load marketplace configuration: ".concat((0, errors_js_1.errorMessage)(error_1));
                    (0, debug_js_1.logForDebugging)(errorMsg, {
                        level: 'error',
                    });
                    throw new Error(errorMsg);
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Load known marketplaces config, returning {} on any error instead of throwing.
 *
 * Use this on read-only paths (plugin loading, feature checks) where a corrupted
 * config should degrade gracefully rather than crash. DO NOT use on load→mutate→save
 * paths — returning {} there would cause the save to overwrite the corrupted file
 * with just the new entry, permanently destroying the user's other entries. The
 * throwing variant preserves the file so the user can fix the corruption and recover.
 */
function loadKnownMarketplacesConfigSafe() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, loadKnownMarketplacesConfig()];
                case 1: return [2 /*return*/, _b.sent()];
                case 2:
                    _a = _b.sent();
                    // Inner function already logged via logForDebugging. Don't logError here —
                    // corrupted user config isn't a Claude Code bug, shouldn't hit the error file.
                    return [2 /*return*/, {}];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Save known marketplaces configuration to disk
 *
 * Writes the configuration to ~/.claude/plugins/known_marketplaces.json,
 * creating the directory structure if it doesn't exist.
 *
 * @param config - The marketplace configuration to save
 */
function saveKnownMarketplacesConfig(config) {
    return __awaiter(this, void 0, void 0, function () {
        var parsed, configFile, fs, dir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parsed = (0, schemas_js_1.KnownMarketplacesFileSchema)().safeParse(config);
                    configFile = getKnownMarketplacesFile();
                    if (!parsed.success) {
                        throw new errors_js_1.ConfigParseError("Invalid marketplace config: ".concat(parsed.error.message), configFile, config);
                    }
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    dir = (0, path_1.join)(configFile, '..');
                    return [4 /*yield*/, fs.mkdir(dir)];
                case 1:
                    _a.sent();
                    (0, slowOperations_js_1.writeFileSync_DEPRECATED)(configFile, (0, slowOperations_js_1.jsonStringify)(parsed.data, null, 2), {
                        encoding: 'utf-8',
                        flush: true,
                    });
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Register marketplaces from the read-only seed directories into the primary
 * known_marketplaces.json.
 *
 * The seed's known_marketplaces.json contains installLocation paths pointing
 * into the seed dir itself. Registering those entries into the primary JSON
 * makes them visible to all marketplace readers (getMarketplaceCacheOnly,
 * getPluginByIdCacheOnly, etc.) without any loader changes — they just follow
 * the installLocation wherever it points.
 *
 * Seed entries always win for marketplaces declared in the seed — the seed is
 * admin-managed (baked into the container image). If admin updates the seed
 * in a new image, those changes propagate on next boot. Users opt out of seed
 * plugins via `plugin disable`, not by removing the marketplace.
 *
 * With multiple seed dirs (path-delimiter-separated), first-seed-wins: a
 * marketplace name claimed by an earlier seed is skipped by later seeds.
 *
 * autoUpdate is forced to false since the seed is read-only and git-pull would
 * fail. installLocation is computed from the runtime seedDir, not trusted from
 * the seed's JSON (handles multi-stage Docker mount-path drift).
 *
 * Idempotent: second call with unchanged seed writes nothing.
 *
 * @returns true if any marketplace entries were written/changed (caller should
 *   clear caches so earlier plugin-load passes don't keep stale "marketplace
 *   not found" state)
 */
function registerSeedMarketplaces() {
    return __awaiter(this, void 0, void 0, function () {
        var seedDirs, primary, claimed, changed, _i, seedDirs_1, seedDir, seedConfig, _a, _b, _c, name_1, seedEntry, resolvedLocation, desired;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    seedDirs = (0, pluginDirectories_js_1.getPluginSeedDirs)();
                    if (seedDirs.length === 0)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, loadKnownMarketplacesConfig()
                        // First-seed-wins across this registration pass. Can't use the isEqual check
                        // alone — two seeds with the same name will have different installLocations.
                    ];
                case 1:
                    primary = _d.sent();
                    claimed = new Set();
                    changed = 0;
                    _i = 0, seedDirs_1 = seedDirs;
                    _d.label = 2;
                case 2:
                    if (!(_i < seedDirs_1.length)) return [3 /*break*/, 8];
                    seedDir = seedDirs_1[_i];
                    return [4 /*yield*/, readSeedKnownMarketplaces(seedDir)];
                case 3:
                    seedConfig = _d.sent();
                    if (!seedConfig)
                        return [3 /*break*/, 7];
                    _a = 0, _b = Object.entries(seedConfig);
                    _d.label = 4;
                case 4:
                    if (!(_a < _b.length)) return [3 /*break*/, 7];
                    _c = _b[_a], name_1 = _c[0], seedEntry = _c[1];
                    if (claimed.has(name_1))
                        return [3 /*break*/, 6];
                    return [4 /*yield*/, findSeedMarketplaceLocation(seedDir, name_1)];
                case 5:
                    resolvedLocation = _d.sent();
                    if (!resolvedLocation) {
                        // Seed content missing (incomplete build) — leave primary alone, but
                        // don't claim the name either: a later seed may have working content.
                        (0, debug_js_1.logForDebugging)("Seed marketplace '".concat(name_1, "' not found under ").concat(seedDir, "/marketplaces/, skipping"), { level: 'warn' });
                        return [3 /*break*/, 6];
                    }
                    claimed.add(name_1);
                    desired = {
                        source: seedEntry.source,
                        installLocation: resolvedLocation,
                        lastUpdated: seedEntry.lastUpdated,
                        autoUpdate: false,
                    };
                    // Skip if primary already matches — idempotent no-op, no write.
                    if ((0, isEqual_js_1.default)(primary[name_1], desired))
                        return [3 /*break*/, 6];
                    // Seed wins — admin-managed. Overwrite any existing primary entry.
                    primary[name_1] = desired;
                    changed++;
                    _d.label = 6;
                case 6:
                    _a++;
                    return [3 /*break*/, 4];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8:
                    if (!(changed > 0)) return [3 /*break*/, 10];
                    return [4 /*yield*/, saveKnownMarketplacesConfig(primary)];
                case 9:
                    _d.sent();
                    (0, debug_js_1.logForDebugging)("Synced ".concat(changed, " marketplace(s) from seed dir(s)"));
                    return [2 /*return*/, true];
                case 10: return [2 /*return*/, false];
            }
        });
    });
}
function readSeedKnownMarketplaces(seedDir) {
    return __awaiter(this, void 0, void 0, function () {
        var seedJsonPath, content, parsed, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    seedJsonPath = (0, path_1.join)(seedDir, 'known_marketplaces.json');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().readFile(seedJsonPath, {
                            encoding: 'utf-8',
                        })];
                case 2:
                    content = _a.sent();
                    parsed = (0, schemas_js_1.KnownMarketplacesFileSchema)().safeParse((0, slowOperations_js_1.jsonParse)(content));
                    if (!parsed.success) {
                        (0, debug_js_1.logForDebugging)("Seed known_marketplaces.json invalid at ".concat(seedDir, ": ").concat(parsed.error.message), { level: 'warn' });
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, parsed.data];
                case 3:
                    e_1 = _a.sent();
                    if (!(0, errors_js_1.isENOENT)(e_1)) {
                        (0, debug_js_1.logForDebugging)("Failed to read seed known_marketplaces.json at ".concat(seedDir, ": ").concat(e_1), { level: 'warn' });
                    }
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Locate a marketplace in the seed directory by name.
 *
 * Probes the canonical locations under seedDir/marketplaces/ rather than
 * trusting the seed's stored installLocation (which may have a stale absolute
 * path from a different build-time mount point).
 *
 * @returns Readable location, or null if neither format exists/validates
 */
function findSeedMarketplaceLocation(seedDir, name) {
    return __awaiter(this, void 0, void 0, function () {
        var dirCandidate, jsonCandidate, _i, _a, candidate, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    dirCandidate = (0, path_1.join)(seedDir, 'marketplaces', name);
                    jsonCandidate = (0, path_1.join)(seedDir, 'marketplaces', "".concat(name, ".json"));
                    _i = 0, _a = [dirCandidate, jsonCandidate];
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    candidate = _a[_i];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, readCachedMarketplace(candidate)];
                case 3:
                    _c.sent();
                    return [2 /*return*/, candidate];
                case 4:
                    _b = _c.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * If installLocation points into a configured seed directory, return that seed
 * directory. Seed-managed entries are admin-controlled — users can't
 * remove/refresh/modify them (they'd be overwritten by registerSeedMarketplaces
 * on next startup). Returning the specific seed lets error messages name it.
 */
function seedDirFor(installLocation) {
    return (0, pluginDirectories_js_1.getPluginSeedDirs)().find(function (d) { return installLocation === d || installLocation.startsWith(d + path_1.sep); });
}
/**
 * Git pull operation (exported for testing)
 *
 * Pulls latest changes with a configurable timeout (default 120s, override via CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS).
 * Provides helpful error messages for common failure scenarios.
 * If a ref is specified, fetches and checks out that specific branch or tag.
 */
// Environment variables to prevent git from prompting for credentials
var GIT_NO_PROMPT_ENV = {
    GIT_TERMINAL_PROMPT: '0', // Prevent terminal credential prompts
    GIT_ASKPASS: '', // Disable askpass GUI programs
};
var DEFAULT_PLUGIN_GIT_TIMEOUT_MS = 120 * 1000;
function getPluginGitTimeoutMs() {
    var envValue = process.env.CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS;
    if (envValue) {
        var parsed = parseInt(envValue, 10);
        if (!isNaN(parsed) && parsed > 0) {
            return parsed;
        }
    }
    return DEFAULT_PLUGIN_GIT_TIMEOUT_MS;
}
function gitPull(cwd, ref, options) {
    return __awaiter(this, void 0, void 0, function () {
        var env, credentialArgs, fetchResult, checkoutResult, pullResult, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)("git pull: cwd=".concat(cwd, " ref=").concat(ref !== null && ref !== void 0 ? ref : 'default'));
                    env = __assign(__assign({}, process.env), GIT_NO_PROMPT_ENV);
                    credentialArgs = (options === null || options === void 0 ? void 0 : options.disableCredentialHelper)
                        ? ['-c', 'credential.helper=']
                        : [];
                    if (!ref) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), __spreadArray(__spreadArray([], credentialArgs, true), ['fetch', 'origin', ref], false), { cwd: cwd, timeout: getPluginGitTimeoutMs(), stdin: 'ignore', env: env })];
                case 1:
                    fetchResult = _a.sent();
                    if (fetchResult.code !== 0) {
                        return [2 /*return*/, enhanceGitPullErrorMessages(fetchResult)];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), __spreadArray(__spreadArray([], credentialArgs, true), ['checkout', ref], false), { cwd: cwd, timeout: getPluginGitTimeoutMs(), stdin: 'ignore', env: env })];
                case 2:
                    checkoutResult = _a.sent();
                    if (checkoutResult.code !== 0) {
                        return [2 /*return*/, enhanceGitPullErrorMessages(checkoutResult)];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), __spreadArray(__spreadArray([], credentialArgs, true), ['pull', 'origin', ref], false), { cwd: cwd, timeout: getPluginGitTimeoutMs(), stdin: 'ignore', env: env })];
                case 3:
                    pullResult = _a.sent();
                    if (pullResult.code !== 0) {
                        return [2 /*return*/, enhanceGitPullErrorMessages(pullResult)];
                    }
                    return [4 /*yield*/, gitSubmoduleUpdate(cwd, credentialArgs, env, options === null || options === void 0 ? void 0 : options.sparsePaths)];
                case 4:
                    _a.sent();
                    return [2 /*return*/, pullResult];
                case 5: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), __spreadArray(__spreadArray([], credentialArgs, true), ['pull', 'origin', 'HEAD'], false), { cwd: cwd, timeout: getPluginGitTimeoutMs(), stdin: 'ignore', env: env })];
                case 6:
                    result = _a.sent();
                    if (result.code !== 0) {
                        return [2 /*return*/, enhanceGitPullErrorMessages(result)];
                    }
                    return [4 /*yield*/, gitSubmoduleUpdate(cwd, credentialArgs, env, options === null || options === void 0 ? void 0 : options.sparsePaths)];
                case 7:
                    _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Sync submodule working dirs after a successful pull. gitClone() uses
 * --recurse-submodules, but gitPull() didn't — the parent repo's submodule
 * pointer would advance while the working dir stayed at the old commit,
 * making plugin sources in submodules unresolvable after marketplace update.
 * Non-fatal: a failed submodule update logs a warning; most marketplaces
 * don't use submodules at all. (gh-30696)
 *
 * Skipped for sparse clones — gitClone's sparse path intentionally omits
 * --recurse-submodules to preserve partial-clone bandwidth savings, and
 * .gitmodules is a root file that cone-mode sparse-checkout always
 * materializes, so the .gitmodules gate alone can't distinguish sparse repos.
 *
 * Perf: git-submodule is a bash script that spawns ~20 subprocesses (~35ms+)
 * even when no submodules exist. .gitmodules is a tracked file — pull
 * materializes it iff the repo has submodules — so gate on its presence to
 * skip the spawn for the common case.
 *
 * --init performs first-contact clone of newly-added submodules, so maintain
 * parity with gitClone's non-sparse path: StrictHostKeyChecking=yes for
 * fail-closed SSH (unknown hosts reject rather than silently populate
 * known_hosts), and --depth 1 for shallow clone (matching --shallow-submodules).
 * --depth only affects not-yet-initialized submodules; existing shallow
 * submodules are unaffected.
 */
function gitSubmoduleUpdate(cwd, credentialArgs, env, sparsePaths) {
    return __awaiter(this, void 0, void 0, function () {
        var hasGitmodules, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (sparsePaths && sparsePaths.length > 0)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)()
                            .stat((0, path_1.join)(cwd, '.gitmodules'))
                            .then(function () { return true; }, function () { return false; })];
                case 1:
                    hasGitmodules = _a.sent();
                    if (!hasGitmodules)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), __spreadArray(__spreadArray([
                            '-c',
                            'core.sshCommand=ssh -o BatchMode=yes -o StrictHostKeyChecking=yes'
                        ], credentialArgs, true), [
                            'submodule',
                            'update',
                            '--init',
                            '--recursive',
                            '--depth',
                            '1',
                        ], false), { cwd: cwd, timeout: getPluginGitTimeoutMs(), stdin: 'ignore', env: env })];
                case 2:
                    result = _a.sent();
                    if (result.code !== 0) {
                        (0, debug_js_1.logForDebugging)("git submodule update failed (non-fatal): ".concat(result.stderr), { level: 'warn' });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Enhance error messages for git pull failures
 */
function enhanceGitPullErrorMessages(result) {
    var _a;
    if (result.code === 0) {
        return result;
    }
    // Detect execa timeout kills via the error field (stderr won't contain "timed out"
    // when the process is killed by SIGTERM — the timeout info is only in error)
    if ((_a = result.error) === null || _a === void 0 ? void 0 : _a.includes('timed out')) {
        var timeoutSec = Math.round(getPluginGitTimeoutMs() / 1000);
        return __assign(__assign({}, result), { stderr: "Git pull timed out after ".concat(timeoutSec, "s. Try increasing the timeout via CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS environment variable.\n\nOriginal error: ").concat(result.stderr) });
    }
    // Detect SSH host key verification failures (check before the generic
    // 'Could not read from remote' catch — that string appears in both cases).
    // OpenSSH emits "Host key verification failed" for BOTH host-not-in-known_hosts
    // and host-key-has-changed — the latter also includes the "REMOTE HOST
    // IDENTIFICATION HAS CHANGED" banner, which needs different remediation.
    if (result.stderr.includes('REMOTE HOST IDENTIFICATION HAS CHANGED')) {
        return __assign(__assign({}, result), { stderr: "SSH host key for this marketplace's git host has changed (server key rotation or possible MITM). Remove the stale entry with: ssh-keygen -R <host>\nThen connect once manually to accept the new key.\n\nOriginal error: ".concat(result.stderr) });
    }
    if (result.stderr.includes('Host key verification failed')) {
        return __assign(__assign({}, result), { stderr: "SSH host key verification failed while updating marketplace. The host key is not in your known_hosts file. Connect once manually to add it (e.g., ssh -T git@<host>), or remove and re-add the marketplace with an HTTPS URL.\n\nOriginal error: ".concat(result.stderr) });
    }
    // Detect SSH authentication failures
    if (result.stderr.includes('Permission denied (publickey)') ||
        result.stderr.includes('Could not read from remote repository')) {
        return __assign(__assign({}, result), { stderr: "SSH authentication failed while updating marketplace. Please ensure your SSH keys are configured.\n\nOriginal error: ".concat(result.stderr) });
    }
    // Detect network issues
    if (result.stderr.includes('timed out') ||
        result.stderr.includes('Could not resolve host')) {
        return __assign(__assign({}, result), { stderr: "Network error while updating marketplace. Please check your internet connection.\n\nOriginal error: ".concat(result.stderr) });
    }
    return result;
}
/**
 * Check if SSH is likely to work for GitHub
 * This is a quick heuristic check that avoids the full clone timeout
 *
 * Uses StrictHostKeyChecking=yes (not accept-new) so an unknown github.com
 * host key fails closed rather than being silently added to known_hosts.
 * This prevents a network-level MITM from poisoning known_hosts on first
 * contact. Users who already have github.com in known_hosts see no change;
 * users who don't are routed to the HTTPS clone path.
 *
 * @returns true if SSH auth succeeds and github.com is already trusted
 */
function isGitHubSshLikelyConfigured() {
    return __awaiter(this, void 0, void 0, function () {
        var result, configured, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('ssh', [
                            '-T',
                            '-o',
                            'BatchMode=yes',
                            '-o',
                            'ConnectTimeout=2',
                            '-o',
                            'StrictHostKeyChecking=yes',
                            'git@github.com',
                        ], {
                            timeout: 3000, // 3 second total timeout
                        })
                        // SSH to github.com always returns exit code 1 with "successfully authenticated"
                        // or exit code 255 with "Permission denied" - we want the former
                    ];
                case 1:
                    result = _c.sent();
                    configured = result.code === 1 &&
                        (((_a = result.stderr) === null || _a === void 0 ? void 0 : _a.includes('successfully authenticated')) ||
                            ((_b = result.stdout) === null || _b === void 0 ? void 0 : _b.includes('successfully authenticated')));
                    (0, debug_js_1.logForDebugging)("SSH config check: code=".concat(result.code, " configured=").concat(configured));
                    return [2 /*return*/, configured];
                case 2:
                    error_2 = _c.sent();
                    // Any error means SSH isn't configured properly
                    (0, debug_js_1.logForDebugging)("SSH configuration check failed: ".concat((0, errors_js_1.errorMessage)(error_2)), {
                        level: 'warn',
                    });
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if a git error indicates authentication failure.
 * Used to provide enhanced error messages for auth failures.
 */
function isAuthenticationError(stderr) {
    return (stderr.includes('Authentication failed') ||
        stderr.includes('could not read Username') ||
        stderr.includes('terminal prompts disabled') ||
        stderr.includes('403') ||
        stderr.includes('401'));
}
/**
 * Extract the SSH host from a git URL for error messaging.
 * Matches the SSH format user@host:path (e.g., git@github.com:owner/repo.git).
 */
function extractSshHost(gitUrl) {
    var _a;
    var match = gitUrl.match(/^[^@]+@([^:]+):/);
    return (_a = match === null || match === void 0 ? void 0 : match[1]) !== null && _a !== void 0 ? _a : null;
}
/**
 * Git clone operation (exported for testing)
 *
 * Clones a git repository with a configurable timeout (default 120s, override via CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS)
 * and larger repositories. Provides helpful error messages for common failure scenarios.
 * Optionally checks out a specific branch or tag.
 *
 * Does NOT disable credential helpers — this allows the user's existing auth setup
 * (gh auth, keychain, git-credential-store, etc.) to work natively for private repos.
 * Interactive prompts are still prevented via GIT_TERMINAL_PROMPT=0, GIT_ASKPASS='',
 * stdin: 'ignore', and BatchMode=yes for SSH.
 *
 * Uses StrictHostKeyChecking=yes (not accept-new): unknown SSH hosts fail closed
 * with a clear message rather than being silently trusted on first contact. For
 * the github source type, the preflight check routes unknown-host users to HTTPS
 * automatically; for explicit git@host:… URLs, users see an actionable error.
 */
function gitClone(gitUrl, targetPath, ref, sparsePaths) {
    return __awaiter(this, void 0, void 0, function () {
        var useSparse, args, timeoutMs, result, redacted, sparseResult, checkoutResult, host, removeHint, host, connectHint;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    useSparse = sparsePaths && sparsePaths.length > 0;
                    args = [
                        '-c',
                        'core.sshCommand=ssh -o BatchMode=yes -o StrictHostKeyChecking=yes',
                        'clone',
                        '--depth',
                        '1',
                    ];
                    if (useSparse) {
                        // Partial clone: skip blob download until checkout, defer checkout until
                        // after sparse-checkout is configured. Submodules are intentionally dropped
                        // for sparse clones — sparse monorepos rarely need them, and recursing
                        // submodules would defeat the partial-clone bandwidth savings.
                        args.push('--filter=blob:none', '--no-checkout');
                    }
                    else {
                        args.push('--recurse-submodules', '--shallow-submodules');
                    }
                    if (ref) {
                        args.push('--branch', ref);
                    }
                    args.push(gitUrl, targetPath);
                    timeoutMs = getPluginGitTimeoutMs();
                    (0, debug_js_1.logForDebugging)("git clone: url=".concat(redactUrlCredentials(gitUrl), " ref=").concat(ref !== null && ref !== void 0 ? ref : 'default', " timeout=").concat(timeoutMs, "ms"));
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), args, {
                            timeout: timeoutMs,
                            stdin: 'ignore',
                            env: __assign(__assign({}, process.env), GIT_NO_PROMPT_ENV),
                        })
                        // Scrub credentials from execa's error/stderr fields before any logging or
                        // returning. execa's shortMessage embeds the full command line (including
                        // the credentialed URL), and result.stderr may also contain it on some git
                        // versions.
                    ];
                case 1:
                    result = _c.sent();
                    redacted = redactUrlCredentials(gitUrl);
                    if (gitUrl !== redacted) {
                        if (result.error)
                            result.error = result.error.replaceAll(gitUrl, redacted);
                        if (result.stderr)
                            result.stderr = result.stderr.replaceAll(gitUrl, redacted);
                    }
                    if (!(result.code === 0)) return [3 /*break*/, 5];
                    if (!useSparse) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), __spreadArray(['sparse-checkout', 'set', '--cone', '--'], sparsePaths, true), {
                            cwd: targetPath,
                            timeout: timeoutMs,
                            stdin: 'ignore',
                            env: __assign(__assign({}, process.env), GIT_NO_PROMPT_ENV),
                        })];
                case 2:
                    sparseResult = _c.sent();
                    if (sparseResult.code !== 0) {
                        return [2 /*return*/, {
                                code: sparseResult.code,
                                stderr: "git sparse-checkout set failed: ".concat(sparseResult.stderr),
                            }];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), 
                        // ref was already passed to clone via --branch, so HEAD points to it;
                        // if no ref, HEAD points to the remote's default branch.
                        ['checkout', 'HEAD'], {
                            cwd: targetPath,
                            timeout: timeoutMs,
                            stdin: 'ignore',
                            env: __assign(__assign({}, process.env), GIT_NO_PROMPT_ENV),
                        })];
                case 3:
                    checkoutResult = _c.sent();
                    if (checkoutResult.code !== 0) {
                        return [2 /*return*/, {
                                code: checkoutResult.code,
                                stderr: "git checkout after sparse-checkout failed: ".concat(checkoutResult.stderr),
                            }];
                    }
                    _c.label = 4;
                case 4:
                    (0, debug_js_1.logForDebugging)("git clone succeeded: ".concat(redactUrlCredentials(gitUrl)));
                    return [2 /*return*/, result];
                case 5:
                    (0, debug_js_1.logForDebugging)("git clone failed: url=".concat(redactUrlCredentials(gitUrl), " code=").concat(result.code, " error=").concat((_a = result.error) !== null && _a !== void 0 ? _a : 'none', " stderr=").concat(result.stderr), { level: 'warn' });
                    // Detect timeout kills — when execFileNoThrowWithCwd kills the process via SIGTERM,
                    // stderr may only contain partial output (e.g. "Cloning into '...'") with no
                    // "timed out" string. Check the error field from execa which contains the
                    // timeout message.
                    if ((_b = result.error) === null || _b === void 0 ? void 0 : _b.includes('timed out')) {
                        return [2 /*return*/, __assign(__assign({}, result), { stderr: "Git clone timed out after ".concat(Math.round(timeoutMs / 1000), "s. The repository may be too large for the current timeout. Set CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS to increase it (e.g., 300000 for 5 minutes).\n\nOriginal error: ").concat(result.stderr) })];
                    }
                    // Enhance error messages for common scenarios
                    if (result.stderr) {
                        // Host key verification failure — check FIRST, before the generic
                        // 'Could not read from remote repository' catch (that string appears
                        // in both stderr outputs, so order matters). OpenSSH emits
                        // "Host key verification failed" for BOTH host-not-in-known_hosts and
                        // host-key-has-changed; distinguish them by the key-change banner.
                        if (result.stderr.includes('REMOTE HOST IDENTIFICATION HAS CHANGED')) {
                            host = extractSshHost(gitUrl);
                            removeHint = host ? "ssh-keygen -R ".concat(host) : 'ssh-keygen -R <host>';
                            return [2 /*return*/, __assign(__assign({}, result), { stderr: "SSH host key has changed (server key rotation or possible MITM). Remove the stale known_hosts entry:\n  ".concat(removeHint, "\nThen connect once manually to verify and accept the new key.\n\nOriginal error: ").concat(result.stderr) })];
                        }
                        if (result.stderr.includes('Host key verification failed')) {
                            host = extractSshHost(gitUrl);
                            connectHint = host ? "ssh -T git@".concat(host) : 'ssh -T git@<host>';
                            return [2 /*return*/, __assign(__assign({}, result), { stderr: "SSH host key is not in your known_hosts file. To add it, connect once manually (this will show the fingerprint for you to verify):\n  ".concat(connectHint, "\n\nOr use an HTTPS URL instead (recommended for public repos).\n\nOriginal error: ").concat(result.stderr) })];
                        }
                        if (result.stderr.includes('Permission denied (publickey)') ||
                            result.stderr.includes('Could not read from remote repository')) {
                            return [2 /*return*/, __assign(__assign({}, result), { stderr: "SSH authentication failed. Please ensure your SSH keys are configured for GitHub, or use an HTTPS URL instead.\n\nOriginal error: ".concat(result.stderr) })];
                        }
                        if (isAuthenticationError(result.stderr)) {
                            return [2 /*return*/, __assign(__assign({}, result), { stderr: "HTTPS authentication failed. Please ensure your credential helper is configured (e.g., gh auth login).\n\nOriginal error: ".concat(result.stderr) })];
                        }
                        if (result.stderr.includes('timed out') ||
                            result.stderr.includes('timeout') ||
                            result.stderr.includes('Could not resolve host')) {
                            return [2 /*return*/, __assign(__assign({}, result), { stderr: "Network error or timeout while cloning repository. Please check your internet connection and try again.\n\nOriginal error: ".concat(result.stderr) })];
                        }
                    }
                    // Fallback for empty stderr — gh-28373: user saw "Failed to clone
                    // marketplace repository:" with nothing after the colon. Git CAN fail
                    // without writing to stderr (stdout instead, or output swallowed by
                    // credential helper / signal). execa's error field has the execa-level
                    // message (command, exit code, signal); exit code is the minimum.
                    if (!result.stderr) {
                        return [2 /*return*/, {
                                code: result.code,
                                stderr: result.error ||
                                    "git clone exited with code ".concat(result.code, " (no stderr output). Run with --debug to see the full command."),
                            }];
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Safely invoke a progress callback, catching and logging any errors.
 * Prevents callback errors from aborting marketplace operations.
 *
 * @param onProgress - The progress callback to invoke
 * @param message - Progress message to pass to the callback
 */
function safeCallProgress(onProgress, message) {
    if (!onProgress)
        return;
    try {
        onProgress(message);
    }
    catch (callbackError) {
        (0, debug_js_1.logForDebugging)("Progress callback error: ".concat((0, errors_js_1.errorMessage)(callbackError)), {
            level: 'warn',
        });
    }
}
/**
 * Reconcile the on-disk sparse-checkout state with the desired config.
 *
 * Runs before gitPull to handle transitions:
 * - Full→Sparse or SparseA→SparseB: run `sparse-checkout set --cone` (idempotent)
 * - Sparse→Full: return non-zero so caller falls back to rm+reclone. Avoids
 *   `sparse-checkout disable` on a --filter=blob:none partial clone, which would
 *   trigger a lazy fetch of every blob in the monorepo.
 * - Full→Full (common case): single local `git config --get` check, no-op.
 *
 * Failures here (ENOENT, not a repo) are harmless — gitPull will also fail and
 * trigger the clone path, which establishes the correct state from scratch.
 */
function reconcileSparseCheckout(cwd, sparsePaths) {
    return __awaiter(this, void 0, void 0, function () {
        var env, check;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    env = __assign(__assign({}, process.env), GIT_NO_PROMPT_ENV);
                    if (sparsePaths && sparsePaths.length > 0) {
                        return [2 /*return*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), __spreadArray(['sparse-checkout', 'set', '--cone', '--'], sparsePaths, true), { cwd: cwd, timeout: getPluginGitTimeoutMs(), stdin: 'ignore', env: env })];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['config', '--get', 'core.sparseCheckout'], { cwd: cwd, stdin: 'ignore', env: env })];
                case 1:
                    check = _a.sent();
                    if (check.code === 0 && check.stdout.trim() === 'true') {
                        return [2 /*return*/, {
                                code: 1,
                                stderr: 'sparsePaths removed from config but repository is sparse; re-cloning for full checkout',
                            }];
                    }
                    return [2 /*return*/, { code: 0, stderr: '' }];
            }
        });
    });
}
/**
 * Cache a marketplace from a git repository
 *
 * Clones or updates a git repository containing marketplace data.
 * If the repository already exists at cachePath, pulls the latest changes.
 * If pulling fails, removes the directory and re-clones.
 *
 * Example repository structure:
 * ```
 * my-marketplace/
 *   ├── .claude-plugin/
 *   │   └── marketplace.json    # Default location for marketplace manifest
 *   ├── plugins/                # Plugin implementations
 *   └── README.md
 * ```
 *
 * @param gitUrl - The git URL to clone (https or ssh)
 * @param cachePath - Local directory path to clone/update the repository
 * @param ref - Optional git branch or tag to checkout
 * @param onProgress - Optional callback to report progress
 */
function cacheMarketplaceFromGit(gitUrl, cachePath, ref, sparsePaths, onProgress, options) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, timeoutSec, reconcileResult, pullStarted, pullResult, rmError_1, rmErrorMsg, refMessage, cloneStarted, result, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    timeoutSec = Math.round(getPluginGitTimeoutMs() / 1000);
                    safeCallProgress(onProgress, "Refreshing marketplace cache (timeout: ".concat(timeoutSec, "s)\u2026"));
                    return [4 /*yield*/, reconcileSparseCheckout(cachePath, sparsePaths)];
                case 1:
                    reconcileResult = _b.sent();
                    if (!(reconcileResult.code === 0)) return [3 /*break*/, 3];
                    pullStarted = performance.now();
                    return [4 /*yield*/, gitPull(cachePath, ref, {
                            disableCredentialHelper: options === null || options === void 0 ? void 0 : options.disableCredentialHelper,
                            sparsePaths: sparsePaths,
                        })];
                case 2:
                    pullResult = _b.sent();
                    (0, fetchTelemetry_js_1.logPluginFetch)('marketplace_pull', gitUrl, pullResult.code === 0 ? 'success' : 'failure', performance.now() - pullStarted, pullResult.code === 0 ? undefined : (0, fetchTelemetry_js_1.classifyFetchError)(pullResult.stderr));
                    if (pullResult.code === 0)
                        return [2 /*return*/];
                    (0, debug_js_1.logForDebugging)("git pull failed, will re-clone: ".concat(pullResult.stderr), {
                        level: 'warn',
                    });
                    return [3 /*break*/, 4];
                case 3:
                    (0, debug_js_1.logForDebugging)("sparse-checkout reconcile requires re-clone: ".concat(reconcileResult.stderr));
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, fs.rm(cachePath, { recursive: true })
                        // rm succeeded — a stale or partially-cloned directory existed; log for diagnostics
                    ];
                case 5:
                    _b.sent();
                    // rm succeeded — a stale or partially-cloned directory existed; log for diagnostics
                    (0, debug_js_1.logForDebugging)("Found stale marketplace directory at ".concat(cachePath, ", cleaning up to allow re-clone"), { level: 'warn' });
                    safeCallProgress(onProgress, 'Found stale directory, cleaning up and re-cloning…');
                    return [3 /*break*/, 7];
                case 6:
                    rmError_1 = _b.sent();
                    if (!(0, errors_js_1.isENOENT)(rmError_1)) {
                        rmErrorMsg = (0, errors_js_1.errorMessage)(rmError_1);
                        throw new Error("Failed to clean up existing marketplace directory. Please manually delete the directory at ".concat(cachePath, " and try again.\n\nTechnical details: ").concat(rmErrorMsg));
                    }
                    return [3 /*break*/, 7];
                case 7:
                    refMessage = ref ? " (ref: ".concat(ref, ")") : '';
                    safeCallProgress(onProgress, "Cloning repository (timeout: ".concat(timeoutSec, "s): ").concat(redactUrlCredentials(gitUrl)).concat(refMessage));
                    cloneStarted = performance.now();
                    return [4 /*yield*/, gitClone(gitUrl, cachePath, ref, sparsePaths)];
                case 8:
                    result = _b.sent();
                    (0, fetchTelemetry_js_1.logPluginFetch)('marketplace_clone', gitUrl, result.code === 0 ? 'success' : 'failure', performance.now() - cloneStarted, result.code === 0 ? undefined : (0, fetchTelemetry_js_1.classifyFetchError)(result.stderr));
                    if (!(result.code !== 0)) return [3 /*break*/, 13];
                    _b.label = 9;
                case 9:
                    _b.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, fs.rm(cachePath, { recursive: true, force: true })];
                case 10:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 11:
                    _a = _b.sent();
                    return [3 /*break*/, 12];
                case 12: throw new Error("Failed to clone marketplace repository: ".concat(result.stderr));
                case 13:
                    safeCallProgress(onProgress, 'Clone complete, validating marketplace…');
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Redact header values for safe logging
 *
 * @param headers - Headers to redact
 * @returns Headers with values replaced by '***REDACTED***'
 */
function redactHeaders(headers) {
    return Object.fromEntries(Object.entries(headers).map(function (_a) {
        var key = _a[0];
        return [key, '***REDACTED***'];
    }));
}
/**
 * Redact userinfo (username:password) in a URL to avoid logging credentials.
 *
 * Marketplace URLs may embed credentials (e.g. GitHub PATs in
 * `https://user:token@github.com/org/repo`). Debug logs and progress output
 * are written to disk and may be included in bug reports, so credentials must
 * be redacted before logging.
 *
 * Redacts all credentials from http(s) URLs:
 *   https://user:token@github.com/repo → https://***:***@github.com/repo
 *   https://:token@github.com/repo     → https://:***@github.com/repo
 *   https://token@github.com/repo      → https://***@github.com/repo
 *
 * Both username and password are redacted unconditionally on http(s) because
 * it is impossible to distinguish `placeholder:secret` (e.g. x-access-token:ghp_...)
 * from `secret:placeholder` (e.g. ghp_...:x-oauth-basic) by parsing alone.
 * Non-http(s) schemes (ssh://git@...) and non-URL inputs (`owner/repo` shorthand)
 * pass through unchanged.
 */
function redactUrlCredentials(urlString) {
    try {
        var parsed = new URL(urlString);
        var isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
        if (isHttp && (parsed.username || parsed.password)) {
            if (parsed.username)
                parsed.username = '***';
            if (parsed.password)
                parsed.password = '***';
            return parsed.toString();
        }
    }
    catch (_a) {
        // Not a valid URL — safe as-is
    }
    return urlString;
}
/**
 * Cache a marketplace from a URL
 *
 * Downloads a marketplace.json file from a URL and saves it locally.
 * Creates the cache directory structure if it doesn't exist.
 *
 * Example marketplace.json structure:
 * ```json
 * {
 *   "name": "my-marketplace",
 *   "owner": { "name": "John Doe", "email": "john@example.com" },
 *   "plugins": [
 *     {
 *       "id": "my-plugin",
 *       "name": "My Plugin",
 *       "source": "./plugins/my-plugin.json",
 *       "category": "productivity",
 *       "description": "A helpful plugin"
 *     }
 *   ]
 * }
 * ```
 *
 * @param url - The URL to download the marketplace.json from
 * @param cachePath - Local file path to save the downloaded marketplace
 * @param customHeaders - Optional custom HTTP headers for authentication
 * @param onProgress - Optional callback to report progress
 */
function cacheMarketplaceFromUrl(url, cachePath, customHeaders, onProgress) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, redactedUrl, headers, response, fetchStarted, error_3, result, cacheDir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    redactedUrl = redactUrlCredentials(url);
                    safeCallProgress(onProgress, "Downloading marketplace from ".concat(redactedUrl));
                    (0, debug_js_1.logForDebugging)("Downloading marketplace from URL: ".concat(redactedUrl));
                    if (customHeaders && Object.keys(customHeaders).length > 0) {
                        (0, debug_js_1.logForDebugging)("Using custom headers: ".concat((0, slowOperations_js_1.jsonStringify)(redactHeaders(customHeaders))));
                    }
                    headers = __assign(__assign({}, customHeaders), { 
                        // User-Agent must come last to prevent override (for consistency with WebFetch)
                        'User-Agent': 'Claude-Code-Plugin-Manager' });
                    fetchStarted = performance.now();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(url, {
                            timeout: 10000,
                            headers: headers,
                        })];
                case 2:
                    response = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    (0, fetchTelemetry_js_1.logPluginFetch)('marketplace_url', url, 'failure', performance.now() - fetchStarted, (0, fetchTelemetry_js_1.classifyFetchError)(error_3));
                    if (axios_1.default.isAxiosError(error_3)) {
                        if (error_3.code === 'ECONNREFUSED' || error_3.code === 'ENOTFOUND') {
                            throw new Error("Could not connect to ".concat(redactedUrl, ". Please check your internet connection and verify the URL is correct.\n\nTechnical details: ").concat(error_3.message));
                        }
                        if (error_3.code === 'ETIMEDOUT') {
                            throw new Error("Request timed out while downloading marketplace from ".concat(redactedUrl, ". The server may be slow or unreachable.\n\nTechnical details: ").concat(error_3.message));
                        }
                        if (error_3.response) {
                            throw new Error("HTTP ".concat(error_3.response.status, " error while downloading marketplace from ").concat(redactedUrl, ". The marketplace file may not exist at this URL.\n\nTechnical details: ").concat(error_3.message));
                        }
                    }
                    throw new Error("Failed to download marketplace from ".concat(redactedUrl, ": ").concat((0, errors_js_1.errorMessage)(error_3)));
                case 4:
                    safeCallProgress(onProgress, 'Validating marketplace data');
                    result = (0, schemas_js_1.PluginMarketplaceSchema)().safeParse(response.data);
                    if (!result.success) {
                        (0, fetchTelemetry_js_1.logPluginFetch)('marketplace_url', url, 'failure', performance.now() - fetchStarted, 'invalid_schema');
                        throw new errors_js_1.ConfigParseError("Invalid marketplace schema from URL: ".concat(result.error.issues.map(function (e) { return "".concat(e.path.join('.'), ": ").concat(e.message); }).join(', ')), redactedUrl, response.data);
                    }
                    (0, fetchTelemetry_js_1.logPluginFetch)('marketplace_url', url, 'success', performance.now() - fetchStarted);
                    safeCallProgress(onProgress, 'Saving marketplace to cache');
                    cacheDir = (0, path_1.join)(cachePath, '..');
                    return [4 /*yield*/, fs.mkdir(cacheDir)
                        // Write the validated marketplace file
                    ];
                case 5:
                    _a.sent();
                    // Write the validated marketplace file
                    (0, slowOperations_js_1.writeFileSync_DEPRECATED)(cachePath, (0, slowOperations_js_1.jsonStringify)(result.data, null, 2), {
                        encoding: 'utf-8',
                        flush: true,
                    });
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate a cache path for a marketplace source
 */
function getCachePathForSource(source) {
    var tempName = source.source === 'github'
        ? source.repo.replace('/', '-')
        : source.source === 'npm'
            ? source.package.replace('@', '').replace('/', '-')
            : source.source === 'file'
                ? (0, path_1.basename)(source.path).replace('.json', '')
                : source.source === 'directory'
                    ? (0, path_1.basename)(source.path)
                    : 'temp_' + Date.now();
    return tempName;
}
/**
 * Parse and validate JSON file with a Zod schema
 */
function parseFileWithSchema(filePath, schema) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, content, data, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    return [4 /*yield*/, fs.readFile(filePath, { encoding: 'utf-8' })];
                case 1:
                    content = _b.sent();
                    try {
                        data = (0, slowOperations_js_1.jsonParse)(content);
                    }
                    catch (error) {
                        throw new errors_js_1.ConfigParseError("Invalid JSON in ".concat(filePath, ": ").concat((0, errors_js_1.errorMessage)(error)), filePath, content);
                    }
                    result = schema.safeParse(data);
                    if (!result.success) {
                        throw new errors_js_1.ConfigParseError("Invalid schema: ".concat(filePath, " ").concat((_a = result.error) === null || _a === void 0 ? void 0 : _a.issues.map(function (e) { return "".concat(e.path.join('.'), ": ").concat(e.message); }).join(', ')), filePath, data);
                    }
                    return [2 /*return*/, result.data];
            }
        });
    });
}
/**
 * Load and cache a marketplace from its source
 *
 * Handles different source types:
 * - URL: Downloads marketplace.json directly
 * - GitHub: Clones repo and looks for .claude-plugin/marketplace.json
 * - Git: Clones repository from git URL
 * - NPM: (Not yet implemented) Would fetch from npm package
 * - File: Reads from local filesystem
 *
 * After loading, validates the marketplace schema and renames the cache
 * to match the marketplace's actual name from the manifest.
 *
 * Cache structure:
 * ~/.claude/plugins/marketplaces/
 *   ├── official-marketplace.json     # From URL source
 *   ├── github-marketplace/          # From GitHub/Git source
 *   │   └── .claude-plugin/
 *   │       └── marketplace.json
 *   └── local-marketplace.json       # From file source
 *
 * @param source - The marketplace source to load from
 * @param onProgress - Optional callback to report progress
 * @returns Object containing the validated marketplace and its cache path
 * @throws If marketplace file not found or validation fails
 */
function loadAndCacheMarketplace(source, onProgress) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, cacheDir, temporaryCachePath, marketplacePath, cleanupNeeded, tempName, _a, sshUrl, httpsUrl, lastError, sshConfigured, err_1, httpsErr_1, err_2, sshErr_1, absPath, absPath, marketplace, e_2, finalCachePath, resolvedFinal, resolvedCacheDir, error_4, errorMsg, error_5, cleanupError_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    cacheDir = getMarketplacesCacheDir();
                    // Ensure cache directory exists
                    return [4 /*yield*/, fs.mkdir(cacheDir)];
                case 1:
                    // Ensure cache directory exists
                    _c.sent();
                    cleanupNeeded = false;
                    tempName = getCachePathForSource(source);
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 45, , 50]);
                    _a = source.source;
                    switch (_a) {
                        case 'url': return [3 /*break*/, 3];
                        case 'github': return [3 /*break*/, 5];
                        case 'git': return [3 /*break*/, 26];
                        case 'npm': return [3 /*break*/, 28];
                        case 'file': return [3 /*break*/, 29];
                        case 'directory': return [3 /*break*/, 30];
                        case 'settings': return [3 /*break*/, 31];
                    }
                    return [3 /*break*/, 34];
                case 3:
                    // Direct URL to marketplace.json
                    temporaryCachePath = (0, path_1.join)(cacheDir, "".concat(tempName, ".json"));
                    cleanupNeeded = true;
                    return [4 /*yield*/, cacheMarketplaceFromUrl(source.url, temporaryCachePath, source.headers, onProgress)];
                case 4:
                    _c.sent();
                    marketplacePath = temporaryCachePath;
                    return [3 /*break*/, 35];
                case 5:
                    sshUrl = "git@github.com:".concat(source.repo, ".git");
                    httpsUrl = "https://github.com/".concat(source.repo, ".git");
                    temporaryCachePath = (0, path_1.join)(cacheDir, tempName);
                    cleanupNeeded = true;
                    lastError = null;
                    return [4 /*yield*/, isGitHubSshLikelyConfigured()];
                case 6:
                    sshConfigured = _c.sent();
                    if (!sshConfigured) return [3 /*break*/, 16];
                    // SSH looks good, try it first
                    safeCallProgress(onProgress, "Cloning via SSH: ".concat(sshUrl));
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, 9, , 15]);
                    return [4 /*yield*/, cacheMarketplaceFromGit(sshUrl, temporaryCachePath, source.ref, source.sparsePaths, onProgress)];
                case 8:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 9:
                    err_1 = _c.sent();
                    lastError = (0, errors_js_1.toError)(err_1);
                    // Log SSH failure for monitoring
                    (0, log_js_1.logError)(lastError);
                    // SSH failed despite being configured, try HTTPS fallback
                    safeCallProgress(onProgress, "SSH clone failed, retrying with HTTPS: ".concat(httpsUrl));
                    (0, debug_js_1.logForDebugging)("SSH clone failed for ".concat(source.repo, " despite SSH being configured, falling back to HTTPS"), { level: 'info' });
                    // Clean up failed SSH attempt if it created anything
                    return [4 /*yield*/, fs.rm(temporaryCachePath, { recursive: true, force: true })
                        // Try HTTPS
                    ];
                case 10:
                    // Clean up failed SSH attempt if it created anything
                    _c.sent();
                    _c.label = 11;
                case 11:
                    _c.trys.push([11, 13, , 14]);
                    return [4 /*yield*/, cacheMarketplaceFromGit(httpsUrl, temporaryCachePath, source.ref, source.sparsePaths, onProgress)];
                case 12:
                    _c.sent();
                    lastError = null; // Success!
                    return [3 /*break*/, 14];
                case 13:
                    httpsErr_1 = _c.sent();
                    // HTTPS also failed - use HTTPS error as the final error
                    lastError = (0, errors_js_1.toError)(httpsErr_1);
                    // Log HTTPS failure for monitoring (both SSH and HTTPS failed)
                    (0, log_js_1.logError)(lastError);
                    return [3 /*break*/, 14];
                case 14: return [3 /*break*/, 15];
                case 15: return [3 /*break*/, 25];
                case 16:
                    // SSH not configured, go straight to HTTPS
                    safeCallProgress(onProgress, "SSH not configured, cloning via HTTPS: ".concat(httpsUrl));
                    (0, debug_js_1.logForDebugging)("SSH not configured for GitHub, using HTTPS for ".concat(source.repo), { level: 'info' });
                    _c.label = 17;
                case 17:
                    _c.trys.push([17, 19, , 25]);
                    return [4 /*yield*/, cacheMarketplaceFromGit(httpsUrl, temporaryCachePath, source.ref, source.sparsePaths, onProgress)];
                case 18:
                    _c.sent();
                    return [3 /*break*/, 25];
                case 19:
                    err_2 = _c.sent();
                    lastError = (0, errors_js_1.toError)(err_2);
                    // Always try SSH as fallback for ANY HTTPS failure
                    // Log HTTPS failure for monitoring
                    (0, log_js_1.logError)(lastError);
                    // HTTPS failed, try SSH as fallback
                    safeCallProgress(onProgress, "HTTPS clone failed, retrying with SSH: ".concat(sshUrl));
                    (0, debug_js_1.logForDebugging)("HTTPS clone failed for ".concat(source.repo, " (").concat(lastError.message, "), falling back to SSH"), { level: 'info' });
                    // Clean up failed HTTPS attempt if it created anything
                    return [4 /*yield*/, fs.rm(temporaryCachePath, { recursive: true, force: true })
                        // Try SSH
                    ];
                case 20:
                    // Clean up failed HTTPS attempt if it created anything
                    _c.sent();
                    _c.label = 21;
                case 21:
                    _c.trys.push([21, 23, , 24]);
                    return [4 /*yield*/, cacheMarketplaceFromGit(sshUrl, temporaryCachePath, source.ref, source.sparsePaths, onProgress)];
                case 22:
                    _c.sent();
                    lastError = null; // Success!
                    return [3 /*break*/, 24];
                case 23:
                    sshErr_1 = _c.sent();
                    // SSH also failed - use SSH error as the final error
                    lastError = (0, errors_js_1.toError)(sshErr_1);
                    // Log SSH failure for monitoring (both HTTPS and SSH failed)
                    (0, log_js_1.logError)(lastError);
                    return [3 /*break*/, 24];
                case 24: return [3 /*break*/, 25];
                case 25:
                    // If we still have an error, throw it
                    if (lastError) {
                        throw lastError;
                    }
                    marketplacePath = (0, path_1.join)(temporaryCachePath, source.path || '.claude-plugin/marketplace.json');
                    return [3 /*break*/, 35];
                case 26:
                    temporaryCachePath = (0, path_1.join)(cacheDir, tempName);
                    cleanupNeeded = true;
                    return [4 /*yield*/, cacheMarketplaceFromGit(source.url, temporaryCachePath, source.ref, source.sparsePaths, onProgress)];
                case 27:
                    _c.sent();
                    marketplacePath = (0, path_1.join)(temporaryCachePath, source.path || '.claude-plugin/marketplace.json');
                    return [3 /*break*/, 35];
                case 28:
                    {
                        // TODO: Implement npm package support
                        throw new Error('NPM marketplace sources not yet implemented');
                    }
                    _c.label = 29;
                case 29:
                    {
                        absPath = (0, path_1.resolve)(source.path);
                        marketplacePath = absPath;
                        temporaryCachePath = (0, path_1.dirname)((0, path_1.dirname)(absPath));
                        cleanupNeeded = false;
                        return [3 /*break*/, 35];
                    }
                    _c.label = 30;
                case 30:
                    {
                        absPath = (0, path_1.resolve)(source.path);
                        marketplacePath = (0, path_1.join)(absPath, '.claude-plugin', 'marketplace.json');
                        temporaryCachePath = absPath;
                        cleanupNeeded = false;
                        return [3 /*break*/, 35];
                    }
                    _c.label = 31;
                case 31:
                    // Inline manifest from settings.json — no fetch. Synthesize the
                    // marketplace.json on disk so getMarketplaceCacheOnly reads it
                    // like any other source. The plugins array already passed
                    // PluginMarketplaceEntrySchema validation when settings were parsed;
                    // the post-switch parseFileWithSchema re-validates the full
                    // PluginMarketplaceSchema (catches schema drift between the two).
                    //
                    // Writing to source.name up front means the rename below is a no-op
                    // (temporaryCachePath === finalCachePath). known_marketplaces.json
                    // stores this source object including the plugins array, so
                    // diffMarketplaces detects settings edits via isEqual — no special
                    // dirty-tracking needed.
                    temporaryCachePath = (0, path_1.join)(cacheDir, source.name);
                    marketplacePath = (0, path_1.join)(temporaryCachePath, '.claude-plugin', 'marketplace.json');
                    cleanupNeeded = false;
                    return [4 /*yield*/, fs.mkdir((0, path_1.dirname)(marketplacePath))
                        // No `satisfies PluginMarketplace` here: source.plugins is the narrow
                        // SettingsMarketplacePlugin type (no strict/.default(), no manifest
                        // fields). The parseFileWithSchema(PluginMarketplaceSchema()) call
                        // below widens and validates — that's the real check.
                    ];
                case 32:
                    _c.sent();
                    // No `satisfies PluginMarketplace` here: source.plugins is the narrow
                    // SettingsMarketplacePlugin type (no strict/.default(), no manifest
                    // fields). The parseFileWithSchema(PluginMarketplaceSchema()) call
                    // below widens and validates — that's the real check.
                    return [4 /*yield*/, (0, promises_1.writeFile)(marketplacePath, (0, slowOperations_js_1.jsonStringify)({
                            name: source.name,
                            owner: (_b = source.owner) !== null && _b !== void 0 ? _b : { name: 'settings' },
                            plugins: source.plugins,
                        }, null, 2))];
                case 33:
                    // No `satisfies PluginMarketplace` here: source.plugins is the narrow
                    // SettingsMarketplacePlugin type (no strict/.default(), no manifest
                    // fields). The parseFileWithSchema(PluginMarketplaceSchema()) call
                    // below widens and validates — that's the real check.
                    _c.sent();
                    return [3 /*break*/, 35];
                case 34: throw new Error("Unsupported marketplace source type");
                case 35:
                    // Load and validate the marketplace
                    (0, debug_js_1.logForDebugging)("Reading marketplace from ".concat(marketplacePath));
                    marketplace = void 0;
                    _c.label = 36;
                case 36:
                    _c.trys.push([36, 38, , 39]);
                    return [4 /*yield*/, parseFileWithSchema(marketplacePath, (0, schemas_js_1.PluginMarketplaceSchema)())];
                case 37:
                    marketplace = _c.sent();
                    return [3 /*break*/, 39];
                case 38:
                    e_2 = _c.sent();
                    if ((0, errors_js_1.isENOENT)(e_2)) {
                        throw new Error("Marketplace file not found at ".concat(marketplacePath));
                    }
                    throw new Error("Failed to parse marketplace file at ".concat(marketplacePath, ": ").concat((0, errors_js_1.errorMessage)(e_2)));
                case 39:
                    finalCachePath = (0, path_1.join)(cacheDir, marketplace.name);
                    resolvedFinal = (0, path_1.resolve)(finalCachePath);
                    resolvedCacheDir = (0, path_1.resolve)(cacheDir);
                    if (!resolvedFinal.startsWith(resolvedCacheDir + path_1.sep)) {
                        throw new Error("Marketplace name '".concat(marketplace.name, "' resolves to a path outside the cache directory"));
                    }
                    if (!(temporaryCachePath !== finalCachePath &&
                        !(0, schemas_js_1.isLocalMarketplaceSource)(source))) return [3 /*break*/, 44];
                    _c.label = 40;
                case 40:
                    _c.trys.push([40, 43, , 44]);
                    // Remove the destination if it already exists, then rename
                    try {
                        onProgress === null || onProgress === void 0 ? void 0 : onProgress('Cleaning up old marketplace cache…');
                    }
                    catch (callbackError) {
                        (0, debug_js_1.logForDebugging)("Progress callback error: ".concat((0, errors_js_1.errorMessage)(callbackError)), { level: 'warn' });
                    }
                    return [4 /*yield*/, fs.rm(finalCachePath, { recursive: true, force: true })
                        // Rename temp cache to final name
                    ];
                case 41:
                    _c.sent();
                    // Rename temp cache to final name
                    return [4 /*yield*/, fs.rename(temporaryCachePath, finalCachePath)];
                case 42:
                    // Rename temp cache to final name
                    _c.sent();
                    temporaryCachePath = finalCachePath;
                    cleanupNeeded = false; // Successfully renamed, no cleanup needed
                    return [3 /*break*/, 44];
                case 43:
                    error_4 = _c.sent();
                    errorMsg = (0, errors_js_1.errorMessage)(error_4);
                    throw new Error("Failed to finalize marketplace cache. Please manually delete the directory at ".concat(finalCachePath, " if it exists and try again.\n\nTechnical details: ").concat(errorMsg));
                case 44: return [2 /*return*/, { marketplace: marketplace, cachePath: temporaryCachePath }];
                case 45:
                    error_5 = _c.sent();
                    if (!(cleanupNeeded &&
                        temporaryCachePath &&
                        !(0, schemas_js_1.isLocalMarketplaceSource)(source))) return [3 /*break*/, 49];
                    _c.label = 46;
                case 46:
                    _c.trys.push([46, 48, , 49]);
                    return [4 /*yield*/, fs.rm(temporaryCachePath, { recursive: true, force: true })];
                case 47:
                    _c.sent();
                    return [3 /*break*/, 49];
                case 48:
                    cleanupError_1 = _c.sent();
                    (0, debug_js_1.logForDebugging)("Warning: Failed to clean up temporary marketplace cache at ".concat(temporaryCachePath, ": ").concat((0, errors_js_1.errorMessage)(cleanupError_1)), { level: 'warn' });
                    return [3 /*break*/, 49];
                case 49: throw error_5;
                case 50: return [2 /*return*/];
            }
        });
    });
}
/**
 * Add a marketplace source to the known marketplaces
 *
 * The marketplace is fetched, validated, and cached locally.
 * The configuration is saved to ~/.claude/plugins/known_marketplaces.json.
 *
 * @param source - MarketplaceSource object representing the marketplace source.
 *                 Callers should parse user input into MarketplaceSource format
 *                 (see AddMarketplace.parseMarketplaceInput for handling shortcuts like "owner/repo").
 * @param onProgress - Optional callback for progress updates during marketplace installation
 * @throws If source format is invalid or marketplace cannot be loaded
 */
function addMarketplaceSource(source, onProgress) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedSource, allowlist, hostPatterns, sourceHost, errorMessage_1, existingConfig, _i, _a, _b, existingName, existingEntry, _c, marketplace, cachePath, sourceValidationError, config, oldEntry, seedDir, cacheDir, resolvedOld, resolvedNew, fs;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    resolvedSource = source;
                    if ((0, schemas_js_1.isLocalMarketplaceSource)(source) && !(0, path_1.isAbsolute)(source.path)) {
                        resolvedSource = __assign(__assign({}, source), { path: (0, path_1.resolve)(source.path) });
                    }
                    // Check policy FIRST, before any network/filesystem operations
                    // This prevents downloading/cloning when the source is blocked
                    if (!(0, marketplaceHelpers_js_1.isSourceAllowedByPolicy)(resolvedSource)) {
                        // Check if explicitly blocked vs not in allowlist for better error messages
                        if ((0, marketplaceHelpers_js_1.isSourceInBlocklist)(resolvedSource)) {
                            throw new Error("Marketplace source '".concat((0, marketplaceHelpers_js_1.formatSourceForDisplay)(resolvedSource), "' is blocked by enterprise policy."));
                        }
                        allowlist = (0, marketplaceHelpers_js_1.getStrictKnownMarketplaces)() || [];
                        hostPatterns = (0, marketplaceHelpers_js_1.getHostPatternsFromAllowlist)();
                        sourceHost = (0, marketplaceHelpers_js_1.extractHostFromSource)(resolvedSource);
                        errorMessage_1 = "Marketplace source '".concat((0, marketplaceHelpers_js_1.formatSourceForDisplay)(resolvedSource), "'");
                        if (sourceHost) {
                            errorMessage_1 += " (".concat(sourceHost, ")");
                        }
                        errorMessage_1 += ' is blocked by enterprise policy.';
                        if (allowlist.length > 0) {
                            errorMessage_1 += " Allowed sources: ".concat(allowlist.map(function (s) { return (0, marketplaceHelpers_js_1.formatSourceForDisplay)(s); }).join(', '));
                        }
                        else {
                            errorMessage_1 += ' No external marketplaces are allowed.';
                        }
                        // If source is a github shorthand and there are hostPatterns, suggest using full URL
                        if (resolvedSource.source === 'github' && hostPatterns.length > 0) {
                            errorMessage_1 +=
                                "\n\nTip: The shorthand \"".concat(resolvedSource.repo, "\" assumes github.com. ") +
                                    "For internal GitHub Enterprise, use the full URL:\n" +
                                    "  git@your-github-host.com:".concat(resolvedSource.repo, ".git");
                        }
                        throw new Error(errorMessage_1);
                    }
                    return [4 /*yield*/, loadKnownMarketplacesConfig()];
                case 1:
                    existingConfig = _d.sent();
                    for (_i = 0, _a = Object.entries(existingConfig); _i < _a.length; _i++) {
                        _b = _a[_i], existingName = _b[0], existingEntry = _b[1];
                        if ((0, isEqual_js_1.default)(existingEntry.source, resolvedSource)) {
                            (0, debug_js_1.logForDebugging)("Source already materialized as '".concat(existingName, "', skipping clone"));
                            return [2 /*return*/, { name: existingName, alreadyMaterialized: true, resolvedSource: resolvedSource }];
                        }
                    }
                    return [4 /*yield*/, loadAndCacheMarketplace(resolvedSource, onProgress)
                        // Validate that reserved names come from official sources
                    ];
                case 2:
                    _c = _d.sent(), marketplace = _c.marketplace, cachePath = _c.cachePath;
                    sourceValidationError = (0, schemas_js_1.validateOfficialNameSource)(marketplace.name, resolvedSource);
                    if (sourceValidationError) {
                        throw new Error(sourceValidationError);
                    }
                    return [4 /*yield*/, loadKnownMarketplacesConfig()];
                case 3:
                    config = _d.sent();
                    oldEntry = config[marketplace.name];
                    if (!oldEntry) return [3 /*break*/, 7];
                    seedDir = seedDirFor(oldEntry.installLocation);
                    if (seedDir) {
                        throw new Error("Marketplace '".concat(marketplace.name, "' is seed-managed (").concat(seedDir, "). ") +
                            "To use a different source, ask your admin to update the seed, " +
                            "or use a different marketplace name.");
                    }
                    (0, debug_js_1.logForDebugging)("Marketplace '".concat(marketplace.name, "' exists with different source \u2014 overwriting"));
                    if (!!(0, schemas_js_1.isLocalMarketplaceSource)(oldEntry.source)) return [3 /*break*/, 7];
                    cacheDir = (0, path_1.resolve)(getMarketplacesCacheDir());
                    resolvedOld = (0, path_1.resolve)(oldEntry.installLocation);
                    resolvedNew = (0, path_1.resolve)(cachePath);
                    if (!(resolvedOld === resolvedNew)) return [3 /*break*/, 4];
                    return [3 /*break*/, 7];
                case 4:
                    if (!(resolvedOld === cacheDir ||
                        resolvedOld.startsWith(cacheDir + path_1.sep))) return [3 /*break*/, 6];
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    return [4 /*yield*/, fs.rm(oldEntry.installLocation, { recursive: true, force: true })];
                case 5:
                    _d.sent();
                    return [3 /*break*/, 7];
                case 6:
                    (0, debug_js_1.logForDebugging)("Skipping cleanup of old installLocation (".concat(oldEntry.installLocation, ") \u2014 ") +
                        "outside ".concat(cacheDir, ". The path is corrupted; leaving it alone and ") +
                        "overwriting the config entry.", { level: 'warn' });
                    _d.label = 7;
                case 7:
                    // Update config using the marketplace's actual name
                    config[marketplace.name] = {
                        source: resolvedSource,
                        installLocation: cachePath,
                        lastUpdated: new Date().toISOString(),
                    };
                    return [4 /*yield*/, saveKnownMarketplacesConfig(config)];
                case 8:
                    _d.sent();
                    (0, debug_js_1.logForDebugging)("Added marketplace source: ".concat(marketplace.name));
                    return [2 /*return*/, { name: marketplace.name, alreadyMaterialized: false, resolvedSource: resolvedSource }];
            }
        });
    });
}
/**
 * Remove a marketplace source from known marketplaces
 *
 * Removes the marketplace configuration and cleans up cached files.
 * Deletes both directory caches (for git sources) and file caches (for URL sources).
 * Also cleans up the marketplace from settings.json (extraKnownMarketplaces) and
 * removes related plugin entries from enabledPlugins.
 *
 * @param name - The marketplace name to remove
 * @throws If marketplace with given name is not found
 */
function removeMarketplaceSource(name) {
    return __awaiter(this, void 0, void 0, function () {
        var config, entry, seedDir, fs, cacheDir, cachePath, jsonCachePath, editableSources, _i, editableSources_2, source, settings, needsUpdate, updates, updatedMarketplaces, marketplaceSuffix, updatedPlugins, removedPlugins, pluginId, result, _a, orphanedPaths, removedPluginIds, _b, orphanedPaths_1, installPath, _c, removedPluginIds_1, pluginId;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, loadKnownMarketplacesConfig()];
                case 1:
                    config = _e.sent();
                    if (!config[name]) {
                        throw new Error("Marketplace '".concat(name, "' not found"));
                    }
                    entry = config[name];
                    seedDir = seedDirFor(entry.installLocation);
                    if (seedDir) {
                        throw new Error("Marketplace '".concat(name, "' is registered from the read-only seed directory ") +
                            "(".concat(seedDir, ") and will be re-registered on next startup. ") +
                            "To stop using its plugins: claude plugin disable <plugin>@".concat(name));
                    }
                    // Remove from config
                    delete config[name];
                    return [4 /*yield*/, saveKnownMarketplacesConfig(config)
                        // Clean up cached files (both directory and JSON formats)
                    ];
                case 2:
                    _e.sent();
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    cacheDir = getMarketplacesCacheDir();
                    cachePath = (0, path_1.join)(cacheDir, name);
                    return [4 /*yield*/, fs.rm(cachePath, { recursive: true, force: true })];
                case 3:
                    _e.sent();
                    jsonCachePath = (0, path_1.join)(cacheDir, "".concat(name, ".json"));
                    return [4 /*yield*/, fs.rm(jsonCachePath, { force: true })
                        // Clean up settings.json - remove marketplace from extraKnownMarketplaces
                        // and remove related plugin entries from enabledPlugins
                        // Check each editable settings source
                    ];
                case 4:
                    _e.sent();
                    editableSources = ['userSettings', 'projectSettings', 'localSettings'];
                    for (_i = 0, editableSources_2 = editableSources; _i < editableSources_2.length; _i++) {
                        source = editableSources_2[_i];
                        settings = (0, settings_js_1.getSettingsForSource)(source);
                        if (!settings)
                            continue;
                        needsUpdate = false;
                        updates = {};
                        // Remove from extraKnownMarketplaces if present
                        if ((_d = settings.extraKnownMarketplaces) === null || _d === void 0 ? void 0 : _d[name]) {
                            updatedMarketplaces = __assign({}, settings.extraKnownMarketplaces);
                            // Use undefined values (NOT delete) to signal key removal via mergeWith
                            updatedMarketplaces[name] = undefined;
                            updates.extraKnownMarketplaces =
                                updatedMarketplaces;
                            needsUpdate = true;
                        }
                        // Remove related plugins from enabledPlugins (format: "plugin@marketplace")
                        if (settings.enabledPlugins) {
                            marketplaceSuffix = "@".concat(name);
                            updatedPlugins = __assign({}, settings.enabledPlugins);
                            removedPlugins = false;
                            for (pluginId in updatedPlugins) {
                                if (pluginId.endsWith(marketplaceSuffix)) {
                                    updatedPlugins[pluginId] = undefined;
                                    removedPlugins = true;
                                }
                            }
                            if (removedPlugins) {
                                updates.enabledPlugins = updatedPlugins;
                                needsUpdate = true;
                            }
                        }
                        // Update settings if changes were made
                        if (needsUpdate) {
                            result = (0, settings_js_1.updateSettingsForSource)(source, updates);
                            if (result.error) {
                                (0, log_js_1.logError)(result.error);
                                (0, debug_js_1.logForDebugging)("Failed to clean up marketplace '".concat(name, "' from ").concat(source, " settings: ").concat(result.error.message));
                            }
                            else {
                                (0, debug_js_1.logForDebugging)("Cleaned up marketplace '".concat(name, "' from ").concat(source, " settings"));
                            }
                        }
                    }
                    _a = (0, installedPluginsManager_js_1.removeAllPluginsForMarketplace)(name), orphanedPaths = _a.orphanedPaths, removedPluginIds = _a.removedPluginIds;
                    _b = 0, orphanedPaths_1 = orphanedPaths;
                    _e.label = 5;
                case 5:
                    if (!(_b < orphanedPaths_1.length)) return [3 /*break*/, 8];
                    installPath = orphanedPaths_1[_b];
                    return [4 /*yield*/, (0, cacheUtils_js_1.markPluginVersionOrphaned)(installPath)];
                case 6:
                    _e.sent();
                    _e.label = 7;
                case 7:
                    _b++;
                    return [3 /*break*/, 5];
                case 8:
                    _c = 0, removedPluginIds_1 = removedPluginIds;
                    _e.label = 9;
                case 9:
                    if (!(_c < removedPluginIds_1.length)) return [3 /*break*/, 12];
                    pluginId = removedPluginIds_1[_c];
                    (0, pluginOptionsStorage_js_1.deletePluginOptions)(pluginId);
                    return [4 /*yield*/, (0, pluginDirectories_js_1.deletePluginDataDir)(pluginId)];
                case 10:
                    _e.sent();
                    _e.label = 11;
                case 11:
                    _c++;
                    return [3 /*break*/, 9];
                case 12:
                    (0, debug_js_1.logForDebugging)("Removed marketplace source: ".concat(name));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Read a cached marketplace from disk without updating it
 *
 * @param installLocation - Path to the cached marketplace
 * @returns The marketplace object
 * @throws If marketplace file not found or invalid
 */
function readCachedMarketplace(installLocation) {
    return __awaiter(this, void 0, void 0, function () {
        var nestedPath, e_3, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nestedPath = (0, path_1.join)(installLocation, '.claude-plugin', 'marketplace.json');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, parseFileWithSchema(nestedPath, (0, schemas_js_1.PluginMarketplaceSchema)())];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    e_3 = _a.sent();
                    if (e_3 instanceof errors_js_1.ConfigParseError)
                        throw e_3;
                    code = (0, errors_js_1.getErrnoCode)(e_3);
                    if (code !== 'ENOENT' && code !== 'ENOTDIR')
                        throw e_3;
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, parseFileWithSchema(installLocation, (0, schemas_js_1.PluginMarketplaceSchema)())];
                case 5: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Get a specific marketplace by name from cache only (no network).
 * Returns null if cache is missing or corrupted.
 * Use this for startup paths that should never block on network.
 */
function getMarketplaceCacheOnly(name) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, configFile, content, config, entry, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    configFile = getKnownMarketplacesFile();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fs.readFile(configFile, { encoding: 'utf-8' })];
                case 2:
                    content = _a.sent();
                    config = (0, slowOperations_js_1.jsonParse)(content);
                    entry = config[name];
                    if (!entry) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, readCachedMarketplace(entry.installLocation)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    error_6 = _a.sent();
                    if ((0, errors_js_1.isENOENT)(error_6)) {
                        return [2 /*return*/, null];
                    }
                    (0, debug_js_1.logForDebugging)("Failed to read cached marketplace ".concat(name, ": ").concat((0, errors_js_1.errorMessage)(error_6)), { level: 'warn' });
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get a specific marketplace by name
 *
 * First attempts to read from cache. Only fetches from source if:
 * - No cached version exists
 * - Cache is invalid/corrupted
 *
 * This avoids unnecessary network/git operations on every access.
 * Use refreshMarketplace() to explicitly update from source.
 *
 * @param name - The marketplace name to fetch
 * @returns The marketplace object or null if not found/failed
 */
exports.getMarketplace = (0, memoize_js_1.default)(function (name) { return __awaiter(void 0, void 0, void 0, function () {
    var config, entry, error_7, marketplace, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, loadKnownMarketplacesConfig()];
            case 1:
                config = _a.sent();
                entry = config[name];
                if (!entry) {
                    throw new Error("Marketplace '".concat(name, "' not found in configuration. Available marketplaces: ").concat(Object.keys(config).join(', ')));
                }
                // Legacy entries (pre-#19708) may have relative paths in global config.
                // These are meaningless outside the project that wrote them — resolving
                // against process.cwd() produces the wrong path. Give actionable guidance
                // instead of a misleading ENOENT.
                if ((0, schemas_js_1.isLocalMarketplaceSource)(entry.source) &&
                    !(0, path_1.isAbsolute)(entry.source.path)) {
                    throw new Error("Marketplace \"".concat(name, "\" has a relative source path (").concat(entry.source.path, ") ") +
                        "in known_marketplaces.json \u2014 this is stale state from an older " +
                        "Claude Code version. Run 'claude marketplace remove ".concat(name, "' and ") +
                        "re-add it from the original project directory.");
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, readCachedMarketplace(entry.installLocation)];
            case 3: return [2 /*return*/, _a.sent()];
            case 4:
                error_7 = _a.sent();
                // Log cache corruption before re-fetching
                (0, debug_js_1.logForDebugging)("Cache corrupted or missing for marketplace ".concat(name, ", re-fetching from source: ").concat((0, errors_js_1.errorMessage)(error_7)), {
                    level: 'warn',
                });
                return [3 /*break*/, 5];
            case 5:
                _a.trys.push([5, 7, , 8]);
                ;
                return [4 /*yield*/, loadAndCacheMarketplace(entry.source)];
            case 6:
                (marketplace = (_a.sent()).marketplace);
                return [3 /*break*/, 8];
            case 7:
                error_8 = _a.sent();
                throw new Error("Failed to load marketplace \"".concat(name, "\" from source (").concat(entry.source.source, "): ").concat((0, errors_js_1.errorMessage)(error_8)));
            case 8:
                // Update lastUpdated only when we actually fetch
                config[name].lastUpdated = new Date().toISOString();
                return [4 /*yield*/, saveKnownMarketplacesConfig(config)];
            case 9:
                _a.sent();
                return [2 /*return*/, marketplace];
        }
    });
}); });
/**
 * Get plugin by ID from cache only (no network calls).
 * Returns null if marketplace cache is missing or corrupted.
 * Use this for startup paths that should never block on network.
 *
 * @param pluginId - The plugin ID in format "name@marketplace"
 * @returns The plugin entry or null if not found/cache missing
 */
function getPluginByIdCacheOnly(pluginId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, pluginName, marketplaceName, fs, configFile, content, config, marketplaceConfig, marketplace, plugin, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId), pluginName = _a.name, marketplaceName = _a.marketplace;
                    if (!pluginName || !marketplaceName) {
                        return [2 /*return*/, null];
                    }
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    configFile = getKnownMarketplacesFile();
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fs.readFile(configFile, { encoding: 'utf-8' })];
                case 2:
                    content = _c.sent();
                    config = (0, slowOperations_js_1.jsonParse)(content);
                    marketplaceConfig = config[marketplaceName];
                    if (!marketplaceConfig) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, getMarketplaceCacheOnly(marketplaceName)];
                case 3:
                    marketplace = _c.sent();
                    if (!marketplace) {
                        return [2 /*return*/, null];
                    }
                    plugin = marketplace.plugins.find(function (p) { return p.name === pluginName; });
                    if (!plugin) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, {
                            entry: plugin,
                            marketplaceInstallLocation: marketplaceConfig.installLocation,
                        }];
                case 4:
                    _b = _c.sent();
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get plugin by ID from a specific marketplace
 *
 * First tries cache-only lookup. If cache is missing/corrupted,
 * falls back to fetching from source.
 *
 * @param pluginId - The plugin ID in format "name@marketplace"
 * @returns The plugin entry or null if not found
 */
function getPluginById(pluginId) {
    return __awaiter(this, void 0, void 0, function () {
        var cached, _a, pluginName, marketplaceName, config, marketplaceConfig, marketplace, plugin, error_9;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getPluginByIdCacheOnly(pluginId)];
                case 1:
                    cached = _b.sent();
                    if (cached) {
                        return [2 /*return*/, cached];
                    }
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId), pluginName = _a.name, marketplaceName = _a.marketplace;
                    if (!pluginName || !marketplaceName) {
                        return [2 /*return*/, null];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, loadKnownMarketplacesConfig()];
                case 3:
                    config = _b.sent();
                    marketplaceConfig = config[marketplaceName];
                    if (!marketplaceConfig) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, exports.getMarketplace)(marketplaceName)];
                case 4:
                    marketplace = _b.sent();
                    plugin = marketplace.plugins.find(function (p) { return p.name === pluginName; });
                    if (!plugin) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, {
                            entry: plugin,
                            marketplaceInstallLocation: marketplaceConfig.installLocation,
                        }];
                case 5:
                    error_9 = _b.sent();
                    (0, debug_js_1.logForDebugging)("Could not find plugin ".concat(pluginId, ": ").concat((0, errors_js_1.errorMessage)(error_9)), { level: 'debug' });
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Refresh all marketplace caches
 *
 * Updates all configured marketplaces from their sources.
 * Continues refreshing even if some marketplaces fail.
 * Updates lastUpdated timestamps for successful refreshes.
 *
 * This is useful for:
 * - Periodic updates to get new plugins
 * - Syncing after network connectivity is restored
 * - Ensuring caches are up-to-date before browsing
 *
 * @returns Promise that resolves when all refresh attempts complete
 */
function refreshAllMarketplaces() {
    return __awaiter(this, void 0, void 0, function () {
        var config, _i, _a, _b, name_2, entry, sha, cachePath, error_10;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, loadKnownMarketplacesConfig()];
                case 1:
                    config = _c.sent();
                    _i = 0, _a = Object.entries(config);
                    _c.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    _b = _a[_i], name_2 = _b[0], entry = _b[1];
                    // Seed-managed marketplaces are controlled by the seed image — refreshing
                    // them is pointless (registerSeedMarketplaces overwrites on next startup).
                    if (seedDirFor(entry.installLocation)) {
                        (0, debug_js_1.logForDebugging)("Skipping seed-managed marketplace '".concat(name_2, "' in bulk refresh"));
                        return [3 /*break*/, 7];
                    }
                    // settings-sourced marketplaces have no upstream — see refreshMarketplace.
                    if (entry.source.source === 'settings') {
                        return [3 /*break*/, 7];
                    }
                    if (!(name_2 === officialMarketplace_js_1.OFFICIAL_MARKETPLACE_NAME)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, officialMarketplaceGcs_js_1.fetchOfficialMarketplaceFromGcs)(entry.installLocation, getMarketplacesCacheDir())];
                case 3:
                    sha = _c.sent();
                    if (sha !== null) {
                        config[name_2].lastUpdated = new Date().toISOString();
                        return [3 /*break*/, 7];
                    }
                    if (!(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_plugin_official_mkt_git_fallback', true)) {
                        (0, debug_js_1.logForDebugging)("Skipping official marketplace bulk refresh: GCS failed, git fallback disabled");
                        return [3 /*break*/, 7];
                    }
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, loadAndCacheMarketplace(entry.source)];
                case 5:
                    cachePath = (_c.sent()).cachePath;
                    config[name_2].lastUpdated = new Date().toISOString();
                    config[name_2].installLocation = cachePath;
                    return [3 /*break*/, 7];
                case 6:
                    error_10 = _c.sent();
                    (0, debug_js_1.logForDebugging)("Failed to refresh marketplace ".concat(name_2, ": ").concat((0, errors_js_1.errorMessage)(error_10)), {
                        level: 'error',
                    });
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8: return [4 /*yield*/, saveKnownMarketplacesConfig(config)];
                case 9:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Refresh a single marketplace cache
 *
 * Updates a specific marketplace from its source by doing an in-place update.
 * For git sources, runs git pull in the existing directory.
 * For URL sources, re-downloads to the existing file.
 * Clears the memoization cache and updates the lastUpdated timestamp.
 *
 * @param name - The name of the marketplace to refresh
 * @param onProgress - Optional callback to report progress
 * @throws If marketplace not found or refresh fails
 */
function refreshMarketplace(name, onProgress, options) {
    return __awaiter(this, void 0, void 0, function () {
        var config, entry, installLocation, source, seedDir, cacheDir, resolvedLoc, sha, sshUrl, httpsUrl, sshConfigured, primaryUrl, fallbackUrl, _a, _b, sourceDisplay, reason, error_11, errorMessage_2;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, loadKnownMarketplacesConfig()];
                case 1:
                    config = _e.sent();
                    entry = config[name];
                    if (!entry) {
                        throw new Error("Marketplace '".concat(name, "' not found. Available marketplaces: ").concat(Object.keys(config).join(', ')));
                    }
                    // Clear the memoization cache for this specific marketplace
                    (_d = (_c = exports.getMarketplace.cache) === null || _c === void 0 ? void 0 : _c.delete) === null || _d === void 0 ? void 0 : _d.call(_c, name);
                    // settings-sourced marketplaces have no upstream to pull. Edits to the
                    // inline plugins array surface as sourceChanged in the reconciler, which
                    // re-materializes via addMarketplaceSource — refresh is not the vehicle.
                    if (entry.source.source === 'settings') {
                        (0, debug_js_1.logForDebugging)("Skipping refresh for settings-sourced marketplace '".concat(name, "' \u2014 no upstream"));
                        return [2 /*return*/];
                    }
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 28, , 29]);
                    installLocation = entry.installLocation;
                    source = entry.source;
                    seedDir = seedDirFor(installLocation);
                    if (seedDir) {
                        throw new Error("Marketplace '".concat(name, "' is seed-managed (").concat(seedDir, ") and its content is ") +
                            "controlled by the seed image. To update: ask your admin to update the seed.");
                    }
                    // For remote sources (github/git/url), installLocation must be inside the
                    // marketplaces cache dir. A corrupted value (gh-32793, gh-32661 — e.g.
                    // Windows path read on WSL, literal tilde, manual edit) can point at the
                    // user's project. cacheMarketplaceFromGit would then run git ops with that
                    // cwd (git walks up to the user's .git) and fs.rm it on pull failure.
                    // Refuse instead of auto-fixing so the user knows their state is corrupted.
                    if (!(0, schemas_js_1.isLocalMarketplaceSource)(source)) {
                        cacheDir = (0, path_1.resolve)(getMarketplacesCacheDir());
                        resolvedLoc = (0, path_1.resolve)(installLocation);
                        if (resolvedLoc !== cacheDir && !resolvedLoc.startsWith(cacheDir + path_1.sep)) {
                            throw new Error("Marketplace '".concat(name, "' has a corrupted installLocation ") +
                                "(".concat(installLocation, ") \u2014 expected a path inside ").concat(cacheDir, ". ") +
                                "This can happen after cross-platform path writes or manual edits " +
                                "to known_marketplaces.json. " +
                                "Run: claude plugin marketplace remove \"".concat(name, "\" and re-add it."));
                        }
                    }
                    if (!(name === officialMarketplace_js_1.OFFICIAL_MARKETPLACE_NAME)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, officialMarketplaceGcs_js_1.fetchOfficialMarketplaceFromGcs)(installLocation, getMarketplacesCacheDir())];
                case 3:
                    sha = _e.sent();
                    if (!(sha !== null)) return [3 /*break*/, 5];
                    config[name] = __assign(__assign({}, entry), { lastUpdated: new Date().toISOString() });
                    return [4 /*yield*/, saveKnownMarketplacesConfig(config)];
                case 4:
                    _e.sent();
                    return [2 /*return*/];
                case 5:
                    // GCS failed — fall through to git ONLY if the kill-switch allows.
                    // Default true (backend write perms are pending as of inc-5046); flip
                    // to false via GrowthBook once the backend is confirmed live so new
                    // clients NEVER hit GitHub for the official marketplace.
                    if (!(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_plugin_official_mkt_git_fallback', true)) {
                        // Throw, don't return — every other failure path in this function
                        // throws, and callers like ManageMarketplaces.tsx:259 increment
                        // updatedCount on any non-throwing return. A silent return would
                        // report "Updated 1 marketplace" when nothing was refreshed.
                        throw new Error('Official marketplace GCS fetch failed and git fallback is disabled');
                    }
                    (0, debug_js_1.logForDebugging)('Official marketplace GCS failed; falling back to git', {
                        level: 'warn',
                    });
                    _e.label = 6;
                case 6:
                    if (!(source.source === 'github' || source.source === 'git')) return [3 /*break*/, 21];
                    if (!(source.source === 'github')) return [3 /*break*/, 15];
                    sshUrl = "git@github.com:".concat(source.repo, ".git");
                    httpsUrl = "https://github.com/".concat(source.repo, ".git");
                    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE)) return [3 /*break*/, 8];
                    // CCR: always HTTPS (no SSH keys available)
                    return [4 /*yield*/, cacheMarketplaceFromGit(httpsUrl, installLocation, source.ref, source.sparsePaths, onProgress, options)];
                case 7:
                    // CCR: always HTTPS (no SSH keys available)
                    _e.sent();
                    return [3 /*break*/, 14];
                case 8: return [4 /*yield*/, isGitHubSshLikelyConfigured()];
                case 9:
                    sshConfigured = _e.sent();
                    primaryUrl = sshConfigured ? sshUrl : httpsUrl;
                    fallbackUrl = sshConfigured ? httpsUrl : sshUrl;
                    _e.label = 10;
                case 10:
                    _e.trys.push([10, 12, , 14]);
                    return [4 /*yield*/, cacheMarketplaceFromGit(primaryUrl, installLocation, source.ref, source.sparsePaths, onProgress, options)];
                case 11:
                    _e.sent();
                    return [3 /*break*/, 14];
                case 12:
                    _a = _e.sent();
                    (0, debug_js_1.logForDebugging)("Marketplace refresh failed with ".concat(sshConfigured ? 'SSH' : 'HTTPS', " for ").concat(source.repo, ", falling back to ").concat(sshConfigured ? 'HTTPS' : 'SSH'), { level: 'info' });
                    return [4 /*yield*/, cacheMarketplaceFromGit(fallbackUrl, installLocation, source.ref, source.sparsePaths, onProgress, options)];
                case 13:
                    _e.sent();
                    return [3 /*break*/, 14];
                case 14: return [3 /*break*/, 17];
                case 15: 
                // Explicit git URL: use as-is (no fallback available)
                return [4 /*yield*/, cacheMarketplaceFromGit(source.url, installLocation, source.ref, source.sparsePaths, onProgress, options)];
                case 16:
                    // Explicit git URL: use as-is (no fallback available)
                    _e.sent();
                    _e.label = 17;
                case 17:
                    _e.trys.push([17, 19, , 20]);
                    return [4 /*yield*/, readCachedMarketplace(installLocation)];
                case 18:
                    _e.sent();
                    return [3 /*break*/, 20];
                case 19:
                    _b = _e.sent();
                    sourceDisplay = source.source === 'github'
                        ? source.repo
                        : redactUrlCredentials(source.url);
                    reason = name === 'claude-code-plugins'
                        ? "We've deprecated \"claude-code-plugins\" in favor of \"claude-plugins-official\"."
                        : "This marketplace may have been deprecated or moved to a new location.";
                    throw new Error("The marketplace.json file is no longer present in this repository.\n\n" +
                        "".concat(reason, "\n") +
                        "Source: ".concat(sourceDisplay, "\n\n") +
                        "You can remove this marketplace with: claude plugin marketplace remove \"".concat(name, "\""));
                case 20: return [3 /*break*/, 26];
                case 21:
                    if (!(source.source === 'url')) return [3 /*break*/, 23];
                    // URL sources: re-download to existing file
                    return [4 /*yield*/, cacheMarketplaceFromUrl(source.url, installLocation, source.headers, onProgress)];
                case 22:
                    // URL sources: re-download to existing file
                    _e.sent();
                    return [3 /*break*/, 26];
                case 23:
                    if (!(0, schemas_js_1.isLocalMarketplaceSource)(source)) return [3 /*break*/, 25];
                    // Local sources: no remote to update from, but validate the file still exists and is valid
                    safeCallProgress(onProgress, 'Validating local marketplace');
                    // Read and validate to ensure the marketplace file is still valid
                    return [4 /*yield*/, readCachedMarketplace(installLocation)];
                case 24:
                    // Read and validate to ensure the marketplace file is still valid
                    _e.sent();
                    return [3 /*break*/, 26];
                case 25: throw new Error("Unsupported marketplace source type for refresh");
                case 26:
                    // Update lastUpdated timestamp
                    config[name].lastUpdated = new Date().toISOString();
                    return [4 /*yield*/, saveKnownMarketplacesConfig(config)];
                case 27:
                    _e.sent();
                    (0, debug_js_1.logForDebugging)("Successfully refreshed marketplace: ".concat(name));
                    return [3 /*break*/, 29];
                case 28:
                    error_11 = _e.sent();
                    errorMessage_2 = error_11 instanceof Error ? error_11.message : String(error_11);
                    (0, debug_js_1.logForDebugging)("Failed to refresh marketplace ".concat(name, ": ").concat(errorMessage_2), {
                        level: 'error',
                    });
                    throw new Error("Failed to refresh marketplace '".concat(name, "': ").concat(errorMessage_2));
                case 29: return [2 /*return*/];
            }
        });
    });
}
/**
 * Set the autoUpdate flag for a marketplace
 *
 * When autoUpdate is enabled, the marketplace and its installed plugins
 * will be automatically updated on startup.
 *
 * @param name - The name of the marketplace to update
 * @param autoUpdate - Whether to enable auto-update
 * @throws If marketplace not found
 */
function setMarketplaceAutoUpdate(name, autoUpdate) {
    return __awaiter(this, void 0, void 0, function () {
        var config, entry, seedDir, declaringSource, declared;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, loadKnownMarketplacesConfig()];
                case 1:
                    config = _c.sent();
                    entry = config[name];
                    if (!entry) {
                        throw new Error("Marketplace '".concat(name, "' not found. Available marketplaces: ").concat(Object.keys(config).join(', ')));
                    }
                    seedDir = seedDirFor(entry.installLocation);
                    if (seedDir) {
                        throw new Error("Marketplace '".concat(name, "' is seed-managed (").concat(seedDir, ") and ") +
                            "auto-update is always disabled for seed content. " +
                            "To update: ask your admin to update the seed.");
                    }
                    // Only update if the value is actually changing
                    if (entry.autoUpdate === autoUpdate) {
                        return [2 /*return*/];
                    }
                    config[name] = __assign(__assign({}, entry), { autoUpdate: autoUpdate });
                    return [4 /*yield*/, saveKnownMarketplacesConfig(config)
                        // Also update intent in settings if declared there — write to the SAME
                        // source that declared it to avoid creating duplicates at wrong scope
                    ];
                case 2:
                    _c.sent();
                    declaringSource = getMarketplaceDeclaringSource(name);
                    if (declaringSource) {
                        declared = (_b = (_a = (0, settings_js_1.getSettingsForSource)(declaringSource)) === null || _a === void 0 ? void 0 : _a.extraKnownMarketplaces) === null || _b === void 0 ? void 0 : _b[name];
                        if (declared) {
                            saveMarketplaceToSettings(name, { source: declared.source, autoUpdate: autoUpdate }, declaringSource);
                        }
                    }
                    (0, debug_js_1.logForDebugging)("Set autoUpdate=".concat(autoUpdate, " for marketplace: ").concat(name));
                    return [2 /*return*/];
            }
        });
    });
}
exports._test = {
    redactUrlCredentials: redactUrlCredentials,
};
