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
exports.VALID_UPDATE_SCOPES = exports.VALID_INSTALLABLE_SCOPES = void 0;
exports.handleMarketplaceError = handleMarketplaceError;
exports.pluginValidateHandler = pluginValidateHandler;
exports.pluginListHandler = pluginListHandler;
exports.marketplaceAddHandler = marketplaceAddHandler;
exports.marketplaceListHandler = marketplaceListHandler;
exports.marketplaceRemoveHandler = marketplaceRemoveHandler;
exports.marketplaceUpdateHandler = marketplaceUpdateHandler;
exports.pluginInstallHandler = pluginInstallHandler;
exports.pluginUninstallHandler = pluginUninstallHandler;
exports.pluginEnableHandler = pluginEnableHandler;
exports.pluginDisableHandler = pluginDisableHandler;
exports.pluginUpdateHandler = pluginUpdateHandler;
/**
 * Plugin and marketplace subcommand handlers — extracted from main.tsx for lazy loading.
 * These are dynamically imported only when `claude plugin *` or `claude plugin marketplace *` runs.
 */
/* eslint-disable custom-rules/no-process-exit -- CLI subcommand handlers intentionally exit */
var figures_1 = require("figures");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var index_js_1 = require("../../services/analytics/index.js");
var pluginCliCommands_js_1 = require("../../services/plugins/pluginCliCommands.js");
Object.defineProperty(exports, "VALID_INSTALLABLE_SCOPES", { enumerable: true, get: function () { return pluginCliCommands_js_1.VALID_INSTALLABLE_SCOPES; } });
Object.defineProperty(exports, "VALID_UPDATE_SCOPES", { enumerable: true, get: function () { return pluginCliCommands_js_1.VALID_UPDATE_SCOPES; } });
var plugin_js_1 = require("../../types/plugin.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var cacheUtils_js_1 = require("../../utils/plugins/cacheUtils.js");
var installCounts_js_1 = require("../../utils/plugins/installCounts.js");
var installedPluginsManager_js_1 = require("../../utils/plugins/installedPluginsManager.js");
var marketplaceHelpers_js_1 = require("../../utils/plugins/marketplaceHelpers.js");
var marketplaceManager_js_1 = require("../../utils/plugins/marketplaceManager.js");
var mcpPluginIntegration_js_1 = require("../../utils/plugins/mcpPluginIntegration.js");
var parseMarketplaceInput_js_1 = require("../../utils/plugins/parseMarketplaceInput.js");
var pluginIdentifier_js_1 = require("../../utils/plugins/pluginIdentifier.js");
var pluginLoader_js_1 = require("../../utils/plugins/pluginLoader.js");
var validatePlugin_js_1 = require("../../utils/plugins/validatePlugin.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
var exit_js_1 = require("../exit.js");
/**
 * Helper function to handle marketplace command errors consistently.
 */
function handleMarketplaceError(error, action) {
    (0, log_js_1.logError)(error);
    (0, exit_js_1.cliError)("".concat(figures_1.default.cross, " Failed to ").concat(action, ": ").concat((0, errors_js_1.errorMessage)(error)));
}
function printValidationResult(result) {
    if (result.errors.length > 0) {
        // biome-ignore lint/suspicious/noConsole:: intentional console output
        console.log("".concat(figures_1.default.cross, " Found ").concat(result.errors.length, " ").concat((0, stringUtils_js_1.plural)(result.errors.length, 'error'), ":\n"));
        result.errors.forEach(function (error) {
            // biome-ignore lint/suspicious/noConsole:: intentional console output
            console.log("  ".concat(figures_1.default.pointer, " ").concat(error.path, ": ").concat(error.message));
        });
        // biome-ignore lint/suspicious/noConsole:: intentional console output
        console.log('');
    }
    if (result.warnings.length > 0) {
        // biome-ignore lint/suspicious/noConsole:: intentional console output
        console.log("".concat(figures_1.default.warning, " Found ").concat(result.warnings.length, " ").concat((0, stringUtils_js_1.plural)(result.warnings.length, 'warning'), ":\n"));
        result.warnings.forEach(function (warning) {
            // biome-ignore lint/suspicious/noConsole:: intentional console output
            console.log("  ".concat(figures_1.default.pointer, " ").concat(warning.path, ": ").concat(warning.message));
        });
        // biome-ignore lint/suspicious/noConsole:: intentional console output
        console.log('');
    }
}
// plugin validate
function pluginValidateHandler(manifestPath, options) {
    return __awaiter(this, void 0, void 0, function () {
        var result, contentResults, manifestDir, _i, contentResults_1, r, allSuccess, hasWarnings, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (options.cowork)
                        (0, state_js_1.setUseCoworkPlugins)(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, (0, validatePlugin_js_1.validateManifest)(manifestPath)
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                    ];
                case 2:
                    result = _a.sent();
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.log("Validating ".concat(result.fileType, " manifest: ").concat(result.filePath, "\n"));
                    printValidationResult(result);
                    contentResults = [];
                    if (!(result.fileType === 'plugin')) return [3 /*break*/, 4];
                    manifestDir = (0, path_1.dirname)(result.filePath);
                    if (!((0, path_1.basename)(manifestDir) === '.claude-plugin')) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, validatePlugin_js_1.validatePluginContents)((0, path_1.dirname)(manifestDir))];
                case 3:
                    contentResults = _a.sent();
                    for (_i = 0, contentResults_1 = contentResults; _i < contentResults_1.length; _i++) {
                        r = contentResults_1[_i];
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.log("Validating ".concat(r.fileType, ": ").concat(r.filePath, "\n"));
                        printValidationResult(r);
                    }
                    _a.label = 4;
                case 4:
                    allSuccess = result.success && contentResults.every(function (r) { return r.success; });
                    hasWarnings = result.warnings.length > 0 ||
                        contentResults.some(function (r) { return r.warnings.length > 0; });
                    if (allSuccess) {
                        (0, exit_js_1.cliOk)(hasWarnings
                            ? "".concat(figures_1.default.tick, " Validation passed with warnings")
                            : "".concat(figures_1.default.tick, " Validation passed"));
                    }
                    else {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.log("".concat(figures_1.default.cross, " Validation failed"));
                        process.exit(1);
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.error("".concat(figures_1.default.cross, " Unexpected error during validation: ").concat((0, errors_js_1.errorMessage)(error_1)));
                    process.exit(2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// plugin list (lines 5217–5416)
function pluginListHandler(options) {
    return __awaiter(this, void 0, void 0, function () {
        var installedData, getPluginEditableScopes, enabledPlugins, pluginIds, _a, loadedEnabled, loadedDisabled, loadErrors, allLoadedPlugins, inlinePlugins, inlineLoadErrors, loadedPluginMap, plugins, _loop_1, _i, _b, pluginId, _loop_2, _c, inlinePlugins_1, p, _d, _e, e, available, _f, config, installCounts, marketplaces, _g, marketplaces_1, _h, marketplaceName, marketplace, _j, _k, entry, pluginId, _l, _loop_3, _m, _o, pluginId, _loop_4, _p, inlinePlugins_2, p, _q, _r, e;
        var _s, _t;
        return __generator(this, function (_u) {
            switch (_u.label) {
                case 0:
                    if (options.cowork)
                        (0, state_js_1.setUseCoworkPlugins)(true);
                    (0, index_js_1.logEvent)('tengu_plugin_list_command', {});
                    installedData = (0, installedPluginsManager_js_1.loadInstalledPluginsV2)();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../utils/plugins/pluginStartupCheck.js'); })];
                case 1:
                    getPluginEditableScopes = (_u.sent()).getPluginEditableScopes;
                    enabledPlugins = getPluginEditableScopes();
                    pluginIds = Object.keys(installedData.plugins);
                    return [4 /*yield*/, (0, pluginLoader_js_1.loadAllPlugins)()];
                case 2:
                    _a = _u.sent(), loadedEnabled = _a.enabled, loadedDisabled = _a.disabled, loadErrors = _a.errors;
                    allLoadedPlugins = __spreadArray(__spreadArray([], loadedEnabled, true), loadedDisabled, true);
                    inlinePlugins = allLoadedPlugins.filter(function (p) {
                        return p.source.endsWith('@inline');
                    });
                    inlineLoadErrors = loadErrors.filter(function (e) { return e.source.endsWith('@inline') || e.source.startsWith('inline['); });
                    if (!options.json) return [3 /*break*/, 17];
                    loadedPluginMap = new Map(allLoadedPlugins.map(function (p) { return [p.source, p]; }));
                    plugins = [];
                    _loop_1 = function (pluginId) {
                        var installations, pluginName, pluginErrors, _v, installations_1, installation, loadedPlugin, mcpServers, servers, _w;
                        return __generator(this, function (_x) {
                            switch (_x.label) {
                                case 0:
                                    installations = installedData.plugins[pluginId];
                                    if (!installations || installations.length === 0)
                                        return [2 /*return*/, "continue"];
                                    pluginName = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId).name;
                                    pluginErrors = loadErrors
                                        .filter(function (e) {
                                        return e.source === pluginId || ('plugin' in e && e.plugin === pluginName);
                                    })
                                        .map(plugin_js_1.getPluginErrorMessage);
                                    _v = 0, installations_1 = installations;
                                    _x.label = 1;
                                case 1:
                                    if (!(_v < installations_1.length)) return [3 /*break*/, 6];
                                    installation = installations_1[_v];
                                    loadedPlugin = loadedPluginMap.get(pluginId);
                                    mcpServers = void 0;
                                    if (!loadedPlugin) return [3 /*break*/, 4];
                                    _w = loadedPlugin.mcpServers;
                                    if (_w) return [3 /*break*/, 3];
                                    return [4 /*yield*/, (0, mcpPluginIntegration_js_1.loadPluginMcpServers)(loadedPlugin)];
                                case 2:
                                    _w = (_x.sent());
                                    _x.label = 3;
                                case 3:
                                    servers = _w;
                                    if (servers && Object.keys(servers).length > 0) {
                                        mcpServers = servers;
                                    }
                                    _x.label = 4;
                                case 4:
                                    plugins.push({
                                        id: pluginId,
                                        version: installation.version || 'unknown',
                                        scope: installation.scope,
                                        enabled: enabledPlugins.has(pluginId),
                                        installPath: installation.installPath,
                                        installedAt: installation.installedAt,
                                        lastUpdated: installation.lastUpdated,
                                        projectPath: installation.projectPath,
                                        mcpServers: mcpServers,
                                        errors: pluginErrors.length > 0 ? pluginErrors : undefined,
                                    });
                                    _x.label = 5;
                                case 5:
                                    _v++;
                                    return [3 /*break*/, 1];
                                case 6: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _b = pluginIds.sort();
                    _u.label = 3;
                case 3:
                    if (!(_i < _b.length)) return [3 /*break*/, 6];
                    pluginId = _b[_i];
                    return [5 /*yield**/, _loop_1(pluginId)];
                case 4:
                    _u.sent();
                    _u.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    _loop_2 = function (p) {
                        var servers, _y, pErrors;
                        return __generator(this, function (_z) {
                            switch (_z.label) {
                                case 0:
                                    _y = p.mcpServers;
                                    if (_y) return [3 /*break*/, 2];
                                    return [4 /*yield*/, (0, mcpPluginIntegration_js_1.loadPluginMcpServers)(p)];
                                case 1:
                                    _y = (_z.sent());
                                    _z.label = 2;
                                case 2:
                                    servers = _y;
                                    pErrors = inlineLoadErrors
                                        .filter(function (e) { return e.source === p.source || ('plugin' in e && e.plugin === p.name); })
                                        .map(plugin_js_1.getPluginErrorMessage);
                                    plugins.push({
                                        id: p.source,
                                        version: (_s = p.manifest.version) !== null && _s !== void 0 ? _s : 'unknown',
                                        scope: 'session',
                                        enabled: p.enabled !== false,
                                        installPath: p.path,
                                        mcpServers: servers && Object.keys(servers).length > 0 ? servers : undefined,
                                        errors: pErrors.length > 0 ? pErrors : undefined,
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _c = 0, inlinePlugins_1 = inlinePlugins;
                    _u.label = 7;
                case 7:
                    if (!(_c < inlinePlugins_1.length)) return [3 /*break*/, 10];
                    p = inlinePlugins_1[_c];
                    return [5 /*yield**/, _loop_2(p)];
                case 8:
                    _u.sent();
                    _u.label = 9;
                case 9:
                    _c++;
                    return [3 /*break*/, 7];
                case 10:
                    // Path-level inline failures (--plugin-dir /nonexistent): no LoadedPlugin
                    // exists so the loop above can't surface them. Mirror the human-path
                    // handling so JSON consumers see the failure instead of silent omission.
                    for (_d = 0, _e = inlineLoadErrors.filter(function (e) {
                        return e.source.startsWith('inline[');
                    }); _d < _e.length; _d++) {
                        e = _e[_d];
                        plugins.push({
                            id: e.source,
                            version: 'unknown',
                            scope: 'session',
                            enabled: false,
                            installPath: 'path' in e ? e.path : '',
                            errors: [(0, plugin_js_1.getPluginErrorMessage)(e)],
                        });
                    }
                    if (!options.available) return [3 /*break*/, 16];
                    available = [];
                    _u.label = 11;
                case 11:
                    _u.trys.push([11, 14, , 15]);
                    return [4 /*yield*/, Promise.all([
                            (0, marketplaceManager_js_1.loadKnownMarketplacesConfig)(),
                            (0, installCounts_js_1.getInstallCounts)(),
                        ])];
                case 12:
                    _f = _u.sent(), config = _f[0], installCounts = _f[1];
                    return [4 /*yield*/, (0, marketplaceHelpers_js_1.loadMarketplacesWithGracefulDegradation)(config)];
                case 13:
                    marketplaces = (_u.sent()).marketplaces;
                    for (_g = 0, marketplaces_1 = marketplaces; _g < marketplaces_1.length; _g++) {
                        _h = marketplaces_1[_g], marketplaceName = _h.name, marketplace = _h.data;
                        if (marketplace) {
                            for (_j = 0, _k = marketplace.plugins; _j < _k.length; _j++) {
                                entry = _k[_j];
                                pluginId = (0, marketplaceHelpers_js_1.createPluginId)(entry.name, marketplaceName);
                                // Only include plugins that are not already installed
                                if (!(0, installedPluginsManager_js_1.isPluginInstalled)(pluginId)) {
                                    available.push({
                                        pluginId: pluginId,
                                        name: entry.name,
                                        description: entry.description,
                                        marketplaceName: marketplaceName,
                                        version: entry.version,
                                        source: entry.source,
                                        installCount: installCounts === null || installCounts === void 0 ? void 0 : installCounts.get(pluginId),
                                    });
                                }
                            }
                        }
                    }
                    return [3 /*break*/, 15];
                case 14:
                    _l = _u.sent();
                    return [3 /*break*/, 15];
                case 15:
                    (0, exit_js_1.cliOk)((0, slowOperations_js_1.jsonStringify)({ installed: plugins, available: available }, null, 2));
                    return [3 /*break*/, 17];
                case 16:
                    (0, exit_js_1.cliOk)((0, slowOperations_js_1.jsonStringify)(plugins, null, 2));
                    _u.label = 17;
                case 17:
                    if (pluginIds.length === 0 && inlinePlugins.length === 0) {
                        // inlineLoadErrors can exist with zero inline plugins (e.g. --plugin-dir
                        // points at a nonexistent path). Don't early-exit over them — fall
                        // through to the session section so the failure is visible.
                        if (inlineLoadErrors.length === 0) {
                            (0, exit_js_1.cliOk)('No plugins installed. Use `claude plugin install` to install a plugin.');
                        }
                    }
                    if (pluginIds.length > 0) {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.log('Installed plugins:\n');
                    }
                    _loop_3 = function (pluginId) {
                        var installations = installedData.plugins[pluginId];
                        if (!installations || installations.length === 0)
                            return "continue";
                        // Find loading errors for this plugin
                        var pluginName = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId).name;
                        var pluginErrors = loadErrors.filter(function (e) { return e.source === pluginId || ('plugin' in e && e.plugin === pluginName); });
                        for (var _0 = 0, installations_2 = installations; _0 < installations_2.length; _0++) {
                            var installation = installations_2[_0];
                            var isEnabled = enabledPlugins.has(pluginId);
                            var status_1 = pluginErrors.length > 0
                                ? "".concat(figures_1.default.cross, " failed to load")
                                : isEnabled
                                    ? "".concat(figures_1.default.tick, " enabled")
                                    : "".concat(figures_1.default.cross, " disabled");
                            var version = installation.version || 'unknown';
                            var scope = installation.scope;
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.log("  ".concat(figures_1.default.pointer, " ").concat(pluginId));
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.log("    Version: ".concat(version));
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.log("    Scope: ".concat(scope));
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.log("    Status: ".concat(status_1));
                            for (var _1 = 0, pluginErrors_1 = pluginErrors; _1 < pluginErrors_1.length; _1++) {
                                var error = pluginErrors_1[_1];
                                // biome-ignore lint/suspicious/noConsole:: intentional console output
                                console.log("    Error: ".concat((0, plugin_js_1.getPluginErrorMessage)(error)));
                            }
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.log('');
                        }
                    };
                    for (_m = 0, _o = pluginIds.sort(); _m < _o.length; _m++) {
                        pluginId = _o[_m];
                        _loop_3(pluginId);
                    }
                    if (inlinePlugins.length > 0 || inlineLoadErrors.length > 0) {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.log('Session-only plugins (--plugin-dir):\n');
                        _loop_4 = function (p) {
                            // Same dirName≠manifestName fallback as the JSON path above — error
                            // sources use the dir basename but p.source uses the manifest name.
                            var pErrors = inlineLoadErrors.filter(function (e) { return e.source === p.source || ('plugin' in e && e.plugin === p.name); });
                            var status_2 = pErrors.length > 0
                                ? "".concat(figures_1.default.cross, " loaded with errors")
                                : "".concat(figures_1.default.tick, " loaded");
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.log("  ".concat(figures_1.default.pointer, " ").concat(p.source));
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.log("    Version: ".concat((_t = p.manifest.version) !== null && _t !== void 0 ? _t : 'unknown'));
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.log("    Path: ".concat(p.path));
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.log("    Status: ".concat(status_2));
                            for (var _2 = 0, pErrors_1 = pErrors; _2 < pErrors_1.length; _2++) {
                                var e = pErrors_1[_2];
                                // biome-ignore lint/suspicious/noConsole:: intentional console output
                                console.log("    Error: ".concat((0, plugin_js_1.getPluginErrorMessage)(e)));
                            }
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.log('');
                        };
                        for (_p = 0, inlinePlugins_2 = inlinePlugins; _p < inlinePlugins_2.length; _p++) {
                            p = inlinePlugins_2[_p];
                            _loop_4(p);
                        }
                        // Path-level failures: no LoadedPlugin object exists. Show them so
                        // `--plugin-dir /typo` doesn't just silently produce nothing.
                        for (_q = 0, _r = inlineLoadErrors.filter(function (e) {
                            return e.source.startsWith('inline[');
                        }); _q < _r.length; _q++) {
                            e = _r[_q];
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.log("  ".concat(figures_1.default.pointer, " ").concat(e.source, ": ").concat(figures_1.default.cross, " ").concat((0, plugin_js_1.getPluginErrorMessage)(e), "\n"));
                        }
                    }
                    (0, exit_js_1.cliOk)();
                    return [2 /*return*/];
            }
        });
    });
}
// marketplace add (lines 5433–5487)
function marketplaceAddHandler(source, options) {
    return __awaiter(this, void 0, void 0, function () {
        var parsed, scope, settingSource, marketplaceSource, _a, name_1, alreadyMaterialized, resolvedSource, sourceType, error_2;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (options.cowork)
                        (0, state_js_1.setUseCoworkPlugins)(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, parseMarketplaceInput_js_1.parseMarketplaceInput)(source)];
                case 2:
                    parsed = _c.sent();
                    if (!parsed) {
                        (0, exit_js_1.cliError)("".concat(figures_1.default.cross, " Invalid marketplace source format. Try: owner/repo, https://..., or ./path"));
                    }
                    if ('error' in parsed) {
                        (0, exit_js_1.cliError)("".concat(figures_1.default.cross, " ").concat(parsed.error));
                    }
                    scope = (_b = options.scope) !== null && _b !== void 0 ? _b : 'user';
                    if (scope !== 'user' && scope !== 'project' && scope !== 'local') {
                        (0, exit_js_1.cliError)("".concat(figures_1.default.cross, " Invalid scope '").concat(scope, "'. Use: user, project, or local"));
                    }
                    settingSource = (0, pluginIdentifier_js_1.scopeToSettingSource)(scope);
                    marketplaceSource = parsed;
                    if (options.sparse && options.sparse.length > 0) {
                        if (marketplaceSource.source === 'github' ||
                            marketplaceSource.source === 'git') {
                            marketplaceSource = __assign(__assign({}, marketplaceSource), { sparsePaths: options.sparse });
                        }
                        else {
                            (0, exit_js_1.cliError)("".concat(figures_1.default.cross, " --sparse is only supported for github and git marketplace sources (got: ").concat(marketplaceSource.source, ")"));
                        }
                    }
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.log('Adding marketplace...');
                    return [4 /*yield*/, (0, marketplaceManager_js_1.addMarketplaceSource)(marketplaceSource, function (message) {
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.log(message);
                        })
                        // Write intent to settings at the requested scope
                    ];
                case 3:
                    _a = _c.sent(), name_1 = _a.name, alreadyMaterialized = _a.alreadyMaterialized, resolvedSource = _a.resolvedSource;
                    // Write intent to settings at the requested scope
                    (0, marketplaceManager_js_1.saveMarketplaceToSettings)(name_1, { source: resolvedSource }, settingSource);
                    (0, cacheUtils_js_1.clearAllCaches)();
                    sourceType = marketplaceSource.source;
                    if (marketplaceSource.source === 'github') {
                        sourceType =
                            marketplaceSource.repo;
                    }
                    (0, index_js_1.logEvent)('tengu_marketplace_added', {
                        source_type: sourceType,
                    });
                    (0, exit_js_1.cliOk)(alreadyMaterialized
                        ? "".concat(figures_1.default.tick, " Marketplace '").concat(name_1, "' already on disk \u2014 declared in ").concat(scope, " settings")
                        : "".concat(figures_1.default.tick, " Successfully added marketplace: ").concat(name_1, " (declared in ").concat(scope, " settings)"));
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _c.sent();
                    handleMarketplaceError(error_2, 'add marketplace');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// marketplace list (lines 5497–5565)
function marketplaceListHandler(options) {
    return __awaiter(this, void 0, void 0, function () {
        var config_1, names, marketplaces, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (options.cowork)
                        (0, state_js_1.setUseCoworkPlugins)(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, marketplaceManager_js_1.loadKnownMarketplacesConfig)()];
                case 2:
                    config_1 = _a.sent();
                    names = Object.keys(config_1);
                    if (options.json) {
                        marketplaces = names.sort().map(function (name) {
                            var marketplace = config_1[name];
                            var source = marketplace === null || marketplace === void 0 ? void 0 : marketplace.source;
                            return __assign(__assign(__assign(__assign(__assign(__assign({ name: name, source: source === null || source === void 0 ? void 0 : source.source }, ((source === null || source === void 0 ? void 0 : source.source) === 'github' && { repo: source.repo })), ((source === null || source === void 0 ? void 0 : source.source) === 'git' && { url: source.url })), ((source === null || source === void 0 ? void 0 : source.source) === 'url' && { url: source.url })), ((source === null || source === void 0 ? void 0 : source.source) === 'directory' && { path: source.path })), ((source === null || source === void 0 ? void 0 : source.source) === 'file' && { path: source.path })), { installLocation: marketplace === null || marketplace === void 0 ? void 0 : marketplace.installLocation });
                        });
                        (0, exit_js_1.cliOk)((0, slowOperations_js_1.jsonStringify)(marketplaces, null, 2));
                    }
                    if (names.length === 0) {
                        (0, exit_js_1.cliOk)('No marketplaces configured');
                    }
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.log('Configured marketplaces:\n');
                    names.forEach(function (name) {
                        var marketplace = config_1[name];
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.log("  ".concat(figures_1.default.pointer, " ").concat(name));
                        if (marketplace === null || marketplace === void 0 ? void 0 : marketplace.source) {
                            var src = marketplace.source;
                            if (src.source === 'github') {
                                // biome-ignore lint/suspicious/noConsole:: intentional console output
                                console.log("    Source: GitHub (".concat(src.repo, ")"));
                            }
                            else if (src.source === 'git') {
                                // biome-ignore lint/suspicious/noConsole:: intentional console output
                                console.log("    Source: Git (".concat(src.url, ")"));
                            }
                            else if (src.source === 'url') {
                                // biome-ignore lint/suspicious/noConsole:: intentional console output
                                console.log("    Source: URL (".concat(src.url, ")"));
                            }
                            else if (src.source === 'directory') {
                                // biome-ignore lint/suspicious/noConsole:: intentional console output
                                console.log("    Source: Directory (".concat(src.path, ")"));
                            }
                            else if (src.source === 'file') {
                                // biome-ignore lint/suspicious/noConsole:: intentional console output
                                console.log("    Source: File (".concat(src.path, ")"));
                            }
                        }
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.log('');
                    });
                    (0, exit_js_1.cliOk)();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    handleMarketplaceError(error_3, 'list marketplaces');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// marketplace remove (lines 5576–5598)
function marketplaceRemoveHandler(name, options) {
    return __awaiter(this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (options.cowork)
                        (0, state_js_1.setUseCoworkPlugins)(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, marketplaceManager_js_1.removeMarketplaceSource)(name)];
                case 2:
                    _a.sent();
                    (0, cacheUtils_js_1.clearAllCaches)();
                    (0, index_js_1.logEvent)('tengu_marketplace_removed', {
                        marketplace_name: name,
                    });
                    (0, exit_js_1.cliOk)("".concat(figures_1.default.tick, " Successfully removed marketplace: ").concat(name));
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    handleMarketplaceError(error_4, 'remove marketplace');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// marketplace update (lines 5609–5672)
function marketplaceUpdateHandler(name, options) {
    return __awaiter(this, void 0, void 0, function () {
        var config, marketplaceNames, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (options.cowork)
                        (0, state_js_1.setUseCoworkPlugins)(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    if (!name) return [3 /*break*/, 3];
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.log("Updating marketplace: ".concat(name, "..."));
                    return [4 /*yield*/, (0, marketplaceManager_js_1.refreshMarketplace)(name, function (message) {
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.log(message);
                        })];
                case 2:
                    _a.sent();
                    (0, cacheUtils_js_1.clearAllCaches)();
                    (0, index_js_1.logEvent)('tengu_marketplace_updated', {
                        marketplace_name: name,
                    });
                    (0, exit_js_1.cliOk)("".concat(figures_1.default.tick, " Successfully updated marketplace: ").concat(name));
                    return [3 /*break*/, 6];
                case 3: return [4 /*yield*/, (0, marketplaceManager_js_1.loadKnownMarketplacesConfig)()];
                case 4:
                    config = _a.sent();
                    marketplaceNames = Object.keys(config);
                    if (marketplaceNames.length === 0) {
                        (0, exit_js_1.cliOk)('No marketplaces configured');
                    }
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.log("Updating ".concat(marketplaceNames.length, " marketplace(s)..."));
                    return [4 /*yield*/, (0, marketplaceManager_js_1.refreshAllMarketplaces)()];
                case 5:
                    _a.sent();
                    (0, cacheUtils_js_1.clearAllCaches)();
                    (0, index_js_1.logEvent)('tengu_marketplace_updated_all', {
                        count: marketplaceNames.length,
                    });
                    (0, exit_js_1.cliOk)("".concat(figures_1.default.tick, " Successfully updated ").concat(marketplaceNames.length, " marketplace(s)"));
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_5 = _a.sent();
                    handleMarketplaceError(error_5, 'update marketplace(s)');
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// plugin install (lines 5690–5721)
function pluginInstallHandler(plugin, options) {
    return __awaiter(this, void 0, void 0, function () {
        var scope, _a, name, marketplace;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (options.cowork)
                        (0, state_js_1.setUseCoworkPlugins)(true);
                    scope = options.scope || 'user';
                    if (options.cowork && scope !== 'user') {
                        (0, exit_js_1.cliError)('--cowork can only be used with user scope');
                    }
                    if (!pluginCliCommands_js_1.VALID_INSTALLABLE_SCOPES.includes(scope)) {
                        (0, exit_js_1.cliError)("Invalid scope: ".concat(scope, ". Must be one of: ").concat(pluginCliCommands_js_1.VALID_INSTALLABLE_SCOPES.join(', '), "."));
                    }
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(plugin), name = _a.name, marketplace = _a.marketplace;
                    (0, index_js_1.logEvent)('tengu_plugin_install_command', __assign(__assign({ _PROTO_plugin_name: name }, (marketplace && {
                        _PROTO_marketplace_name: marketplace,
                    })), { scope: scope }));
                    return [4 /*yield*/, (0, pluginCliCommands_js_1.installPlugin)(plugin, scope)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// plugin uninstall (lines 5738–5769)
function pluginUninstallHandler(plugin, options) {
    return __awaiter(this, void 0, void 0, function () {
        var scope, _a, name, marketplace;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (options.cowork)
                        (0, state_js_1.setUseCoworkPlugins)(true);
                    scope = options.scope || 'user';
                    if (options.cowork && scope !== 'user') {
                        (0, exit_js_1.cliError)('--cowork can only be used with user scope');
                    }
                    if (!pluginCliCommands_js_1.VALID_INSTALLABLE_SCOPES.includes(scope)) {
                        (0, exit_js_1.cliError)("Invalid scope: ".concat(scope, ". Must be one of: ").concat(pluginCliCommands_js_1.VALID_INSTALLABLE_SCOPES.join(', '), "."));
                    }
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(plugin), name = _a.name, marketplace = _a.marketplace;
                    (0, index_js_1.logEvent)('tengu_plugin_uninstall_command', __assign(__assign({ _PROTO_plugin_name: name }, (marketplace && {
                        _PROTO_marketplace_name: marketplace,
                    })), { scope: scope }));
                    return [4 /*yield*/, (0, pluginCliCommands_js_1.uninstallPlugin)(plugin, scope, options.keepData)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// plugin enable (lines 5783–5818)
function pluginEnableHandler(plugin, options) {
    return __awaiter(this, void 0, void 0, function () {
        var scope, _a, name, marketplace;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (options.cowork)
                        (0, state_js_1.setUseCoworkPlugins)(true);
                    if (options.scope) {
                        if (!pluginCliCommands_js_1.VALID_INSTALLABLE_SCOPES.includes(options.scope)) {
                            (0, exit_js_1.cliError)("Invalid scope \"".concat(options.scope, "\". Valid scopes: ").concat(pluginCliCommands_js_1.VALID_INSTALLABLE_SCOPES.join(', ')));
                        }
                        scope = options.scope;
                    }
                    if (options.cowork && scope !== undefined && scope !== 'user') {
                        (0, exit_js_1.cliError)('--cowork can only be used with user scope');
                    }
                    // --cowork always operates at user scope
                    if (options.cowork && scope === undefined) {
                        scope = 'user';
                    }
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(plugin), name = _a.name, marketplace = _a.marketplace;
                    (0, index_js_1.logEvent)('tengu_plugin_enable_command', __assign(__assign({ _PROTO_plugin_name: name }, (marketplace && {
                        _PROTO_marketplace_name: marketplace,
                    })), { scope: (scope !== null && scope !== void 0 ? scope : 'auto') }));
                    return [4 /*yield*/, (0, pluginCliCommands_js_1.enablePlugin)(plugin, scope)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// plugin disable (lines 5833–5902)
function pluginDisableHandler(plugin, options) {
    return __awaiter(this, void 0, void 0, function () {
        var scope, _a, name, marketplace;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (options.all && plugin) {
                        (0, exit_js_1.cliError)('Cannot use --all with a specific plugin');
                    }
                    if (!options.all && !plugin) {
                        (0, exit_js_1.cliError)('Please specify a plugin name or use --all to disable all plugins');
                    }
                    if (options.cowork)
                        (0, state_js_1.setUseCoworkPlugins)(true);
                    if (!options.all) return [3 /*break*/, 2];
                    if (options.scope) {
                        (0, exit_js_1.cliError)('Cannot use --scope with --all');
                    }
                    // No _PROTO_plugin_name here — --all disables all plugins.
                    // Distinguishable from the specific-plugin branch by plugin_name IS NULL.
                    (0, index_js_1.logEvent)('tengu_plugin_disable_command', {});
                    return [4 /*yield*/, (0, pluginCliCommands_js_1.disableAllPlugins)()];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
                case 2:
                    if (options.scope) {
                        if (!pluginCliCommands_js_1.VALID_INSTALLABLE_SCOPES.includes(options.scope)) {
                            (0, exit_js_1.cliError)("Invalid scope \"".concat(options.scope, "\". Valid scopes: ").concat(pluginCliCommands_js_1.VALID_INSTALLABLE_SCOPES.join(', ')));
                        }
                        scope = options.scope;
                    }
                    if (options.cowork && scope !== undefined && scope !== 'user') {
                        (0, exit_js_1.cliError)('--cowork can only be used with user scope');
                    }
                    // --cowork always operates at user scope
                    if (options.cowork && scope === undefined) {
                        scope = 'user';
                    }
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(plugin), name = _a.name, marketplace = _a.marketplace;
                    (0, index_js_1.logEvent)('tengu_plugin_disable_command', __assign(__assign({ _PROTO_plugin_name: name }, (marketplace && {
                        _PROTO_marketplace_name: marketplace,
                    })), { scope: (scope !== null && scope !== void 0 ? scope : 'auto') }));
                    return [4 /*yield*/, (0, pluginCliCommands_js_1.disablePlugin)(plugin, scope)];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// plugin update (lines 5918–5948)
function pluginUpdateHandler(plugin, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, name, marketplace, scope;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (options.cowork)
                        (0, state_js_1.setUseCoworkPlugins)(true);
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(plugin), name = _a.name, marketplace = _a.marketplace;
                    (0, index_js_1.logEvent)('tengu_plugin_update_command', __assign({ _PROTO_plugin_name: name }, (marketplace && {
                        _PROTO_marketplace_name: marketplace,
                    })));
                    scope = 'user';
                    if (options.scope) {
                        if (!pluginCliCommands_js_1.VALID_UPDATE_SCOPES.includes(options.scope)) {
                            (0, exit_js_1.cliError)("Invalid scope \"".concat(options.scope, "\". Valid scopes: ").concat(pluginCliCommands_js_1.VALID_UPDATE_SCOPES.join(', ')));
                        }
                        scope = options.scope;
                    }
                    if (options.cowork && scope !== 'user') {
                        (0, exit_js_1.cliError)('--cowork can only be used with user scope');
                    }
                    return [4 /*yield*/, (0, pluginCliCommands_js_1.updatePluginCli)(plugin, scope)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
