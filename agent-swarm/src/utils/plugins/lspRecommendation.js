"use strict";
/**
 * LSP Plugin Recommendation Utility
 *
 * Scans installed marketplaces for LSP plugins and recommends plugins
 * based on file extensions, but ONLY when the LSP binary is already
 * installed on the system.
 *
 * Limitation: Can only detect LSP plugins that declare their servers
 * inline in the marketplace entry. Plugins with separate .lsp.json files
 * are not detectable until after installation.
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
exports.getMatchingLspPlugins = getMatchingLspPlugins;
exports.addToNeverSuggest = addToNeverSuggest;
exports.incrementIgnoredCount = incrementIgnoredCount;
exports.isLspRecommendationsDisabled = isLspRecommendationsDisabled;
exports.resetIgnoredCount = resetIgnoredCount;
var path_1 = require("path");
var binaryCheck_js_1 = require("../binaryCheck.js");
var config_js_1 = require("../config.js");
var debug_js_1 = require("../debug.js");
var installedPluginsManager_js_1 = require("./installedPluginsManager.js");
var marketplaceManager_js_1 = require("./marketplaceManager.js");
var schemas_js_1 = require("./schemas.js");
// Maximum number of times user can ignore recommendations before we stop showing
var MAX_IGNORED_COUNT = 5;
/**
 * Check if a marketplace is official (from Anthropic)
 */
function isOfficialMarketplace(name) {
    return schemas_js_1.ALLOWED_OFFICIAL_MARKETPLACE_NAMES.has(name.toLowerCase());
}
/**
 * Extract LSP info (extensions and command) from inline lspServers config.
 *
 * NOTE: Can only read inline configs, not external .lsp.json files.
 * String paths are skipped as they reference files only available after installation.
 *
 * @param lspServers - The lspServers field from PluginMarketplaceEntry
 * @returns LSP info with extensions and command, or null if not extractable
 */
function extractLspInfoFromManifest(lspServers) {
    if (!lspServers) {
        return null;
    }
    // If it's a string path (e.g., "./.lsp.json"), we can't read it from marketplace
    if (typeof lspServers === 'string') {
        (0, debug_js_1.logForDebugging)('[lspRecommendation] Skipping string path lspServers (not readable from marketplace)');
        return null;
    }
    // If it's an array, process each element
    if (Array.isArray(lspServers)) {
        for (var _i = 0, lspServers_1 = lspServers; _i < lspServers_1.length; _i++) {
            var item = lspServers_1[_i];
            // Skip string paths in arrays
            if (typeof item === 'string') {
                continue;
            }
            // Try to extract from inline config object
            var info = extractFromServerConfigRecord(item);
            if (info) {
                return info;
            }
        }
        return null;
    }
    // It's an inline config object: Record<string, LspServerConfig>
    return extractFromServerConfigRecord(lspServers);
}
/**
 * Extract LSP info from a server config record (inline object format)
 */
/**
 * Type guard to check if a value is a record object
 */
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function extractFromServerConfigRecord(serverConfigs) {
    var extensions = new Set();
    var command = null;
    for (var _i = 0, _a = Object.entries(serverConfigs); _i < _a.length; _i++) {
        var _b = _a[_i], _serverName = _b[0], config = _b[1];
        if (!isRecord(config)) {
            continue;
        }
        // Get command from first valid server config
        if (!command && typeof config.command === 'string') {
            command = config.command;
        }
        // Collect all extensions from extensionToLanguage mapping
        var extMapping = config.extensionToLanguage;
        if (isRecord(extMapping)) {
            for (var _c = 0, _d = Object.keys(extMapping); _c < _d.length; _c++) {
                var ext = _d[_c];
                extensions.add(ext.toLowerCase());
            }
        }
    }
    if (!command || extensions.size === 0) {
        return null;
    }
    return { extensions: extensions, command: command };
}
/**
 * Get all LSP plugins from all installed marketplaces
 *
 * @returns Map of pluginId to plugin info with LSP metadata
 */
function getLspPluginsFromMarketplaces() {
    return __awaiter(this, void 0, void 0, function () {
        var result, config, _i, _a, marketplaceName, marketplace, isOfficial, _b, _c, entry, lspInfo, pluginId, error_1, error_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    result = new Map();
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, (0, marketplaceManager_js_1.loadKnownMarketplacesConfig)()];
                case 2:
                    config = _d.sent();
                    _i = 0, _a = Object.keys(config);
                    _d.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    marketplaceName = _a[_i];
                    _d.label = 4;
                case 4:
                    _d.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, marketplaceManager_js_1.getMarketplace)(marketplaceName)];
                case 5:
                    marketplace = _d.sent();
                    isOfficial = isOfficialMarketplace(marketplaceName);
                    for (_b = 0, _c = marketplace.plugins; _b < _c.length; _b++) {
                        entry = _c[_b];
                        // Skip plugins without lspServers
                        if (!entry.lspServers) {
                            continue;
                        }
                        lspInfo = extractLspInfoFromManifest(entry.lspServers);
                        if (!lspInfo) {
                            continue;
                        }
                        pluginId = "".concat(entry.name, "@").concat(marketplaceName);
                        result.set(pluginId, {
                            entry: entry,
                            marketplaceName: marketplaceName,
                            extensions: lspInfo.extensions,
                            command: lspInfo.command,
                            isOfficial: isOfficial,
                        });
                    }
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _d.sent();
                    (0, debug_js_1.logForDebugging)("[lspRecommendation] Failed to load marketplace ".concat(marketplaceName, ": ").concat(error_1));
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_2 = _d.sent();
                    (0, debug_js_1.logForDebugging)("[lspRecommendation] Failed to load marketplaces config: ".concat(error_2));
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Find matching LSP plugins for a file path.
 *
 * Returns recommendations for plugins that:
 * 1. Support the file's extension
 * 2. Have their LSP binary installed on the system
 * 3. Are not already installed
 * 4. Are not in the user's "never suggest" list
 *
 * Results are sorted with official marketplace plugins first.
 *
 * @param filePath - Path to the file to find LSP plugins for
 * @returns Array of matching plugin recommendations (empty if none or disabled)
 */
function getMatchingLspPlugins(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var ext, allLspPlugins, config, neverPlugins, matchingPlugins, _i, allLspPlugins_1, _a, pluginId, info, pluginsWithBinary, _b, matchingPlugins_1, _c, info, pluginId, binaryExists;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    // Check if globally disabled
                    if (isLspRecommendationsDisabled()) {
                        (0, debug_js_1.logForDebugging)('[lspRecommendation] Recommendations are disabled');
                        return [2 /*return*/, []];
                    }
                    ext = (0, path_1.extname)(filePath).toLowerCase();
                    if (!ext) {
                        (0, debug_js_1.logForDebugging)('[lspRecommendation] No file extension found');
                        return [2 /*return*/, []];
                    }
                    (0, debug_js_1.logForDebugging)("[lspRecommendation] Looking for LSP plugins for ".concat(ext));
                    return [4 /*yield*/, getLspPluginsFromMarketplaces()
                        // Get config for filtering
                    ];
                case 1:
                    allLspPlugins = _e.sent();
                    config = (0, config_js_1.getGlobalConfig)();
                    neverPlugins = (_d = config.lspRecommendationNeverPlugins) !== null && _d !== void 0 ? _d : [];
                    matchingPlugins = [];
                    for (_i = 0, allLspPlugins_1 = allLspPlugins; _i < allLspPlugins_1.length; _i++) {
                        _a = allLspPlugins_1[_i], pluginId = _a[0], info = _a[1];
                        // Check extension match
                        if (!info.extensions.has(ext)) {
                            continue;
                        }
                        // Filter: not in "never" list
                        if (neverPlugins.includes(pluginId)) {
                            (0, debug_js_1.logForDebugging)("[lspRecommendation] Skipping ".concat(pluginId, " (in never suggest list)"));
                            continue;
                        }
                        // Filter: not already installed
                        if ((0, installedPluginsManager_js_1.isPluginInstalled)(pluginId)) {
                            (0, debug_js_1.logForDebugging)("[lspRecommendation] Skipping ".concat(pluginId, " (already installed)"));
                            continue;
                        }
                        matchingPlugins.push({ info: info, pluginId: pluginId });
                    }
                    pluginsWithBinary = [];
                    _b = 0, matchingPlugins_1 = matchingPlugins;
                    _e.label = 2;
                case 2:
                    if (!(_b < matchingPlugins_1.length)) return [3 /*break*/, 5];
                    _c = matchingPlugins_1[_b], info = _c.info, pluginId = _c.pluginId;
                    return [4 /*yield*/, (0, binaryCheck_js_1.isBinaryInstalled)(info.command)];
                case 3:
                    binaryExists = _e.sent();
                    if (binaryExists) {
                        pluginsWithBinary.push({ info: info, pluginId: pluginId });
                        (0, debug_js_1.logForDebugging)("[lspRecommendation] Binary '".concat(info.command, "' found for ").concat(pluginId));
                    }
                    else {
                        (0, debug_js_1.logForDebugging)("[lspRecommendation] Skipping ".concat(pluginId, " (binary '").concat(info.command, "' not found)"));
                    }
                    _e.label = 4;
                case 4:
                    _b++;
                    return [3 /*break*/, 2];
                case 5:
                    // Sort: official marketplaces first
                    pluginsWithBinary.sort(function (a, b) {
                        if (a.info.isOfficial && !b.info.isOfficial)
                            return -1;
                        if (!a.info.isOfficial && b.info.isOfficial)
                            return 1;
                        return 0;
                    });
                    // Convert to recommendations
                    return [2 /*return*/, pluginsWithBinary.map(function (_a) {
                            var info = _a.info, pluginId = _a.pluginId;
                            return ({
                                pluginId: pluginId,
                                pluginName: info.entry.name,
                                marketplaceName: info.marketplaceName,
                                description: info.entry.description,
                                isOfficial: info.isOfficial,
                                extensions: Array.from(info.extensions),
                                command: info.command,
                            });
                        })];
            }
        });
    });
}
/**
 * Add a plugin to the "never suggest" list
 *
 * @param pluginId - Plugin ID to never suggest again
 */
function addToNeverSuggest(pluginId) {
    (0, config_js_1.saveGlobalConfig)(function (currentConfig) {
        var _a;
        var current = (_a = currentConfig.lspRecommendationNeverPlugins) !== null && _a !== void 0 ? _a : [];
        if (current.includes(pluginId)) {
            return currentConfig;
        }
        return __assign(__assign({}, currentConfig), { lspRecommendationNeverPlugins: __spreadArray(__spreadArray([], current, true), [pluginId], false) });
    });
    (0, debug_js_1.logForDebugging)("[lspRecommendation] Added ".concat(pluginId, " to never suggest"));
}
/**
 * Increment the ignored recommendation count.
 * After MAX_IGNORED_COUNT ignores, recommendations are disabled.
 */
function incrementIgnoredCount() {
    (0, config_js_1.saveGlobalConfig)(function (currentConfig) {
        var _a;
        var newCount = ((_a = currentConfig.lspRecommendationIgnoredCount) !== null && _a !== void 0 ? _a : 0) + 1;
        return __assign(__assign({}, currentConfig), { lspRecommendationIgnoredCount: newCount });
    });
    (0, debug_js_1.logForDebugging)('[lspRecommendation] Incremented ignored count');
}
/**
 * Check if LSP recommendations are disabled.
 * Disabled when:
 * - User explicitly disabled via config
 * - User has ignored MAX_IGNORED_COUNT recommendations
 */
function isLspRecommendationsDisabled() {
    var _a;
    var config = (0, config_js_1.getGlobalConfig)();
    return (config.lspRecommendationDisabled === true ||
        ((_a = config.lspRecommendationIgnoredCount) !== null && _a !== void 0 ? _a : 0) >= MAX_IGNORED_COUNT);
}
/**
 * Reset the ignored count (useful if user re-enables recommendations)
 */
function resetIgnoredCount() {
    (0, config_js_1.saveGlobalConfig)(function (currentConfig) {
        var _a;
        var currentCount = (_a = currentConfig.lspRecommendationIgnoredCount) !== null && _a !== void 0 ? _a : 0;
        if (currentCount === 0) {
            return currentConfig;
        }
        return __assign(__assign({}, currentConfig), { lspRecommendationIgnoredCount: 0 });
    });
    (0, debug_js_1.logForDebugging)('[lspRecommendation] Reset ignored count');
}
