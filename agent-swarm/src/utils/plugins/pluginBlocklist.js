"use strict";
/**
 * Plugin delisting detection.
 *
 * Compares installed plugins against marketplace manifests to find plugins
 * that have been removed, and auto-uninstalls them.
 *
 * The security.json fetch was removed (see #25447) — ~29.5M/week GitHub hits
 * for UI reason/text only. If re-introduced, serve from downloads.claude.ai.
 */
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
exports.detectDelistedPlugins = detectDelistedPlugins;
exports.detectAndUninstallDelistedPlugins = detectAndUninstallDelistedPlugins;
var pluginOperations_js_1 = require("../../services/plugins/pluginOperations.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var installedPluginsManager_js_1 = require("./installedPluginsManager.js");
var marketplaceManager_js_1 = require("./marketplaceManager.js");
var pluginFlagging_js_1 = require("./pluginFlagging.js");
/**
 * Detect plugins installed from a marketplace that are no longer listed there.
 *
 * @param installedPlugins All installed plugins
 * @param marketplace The marketplace to check against
 * @param marketplaceName The marketplace name suffix (e.g. "claude-plugins-official")
 * @returns List of delisted plugin IDs in "name@marketplace" format
 */
function detectDelistedPlugins(installedPlugins, marketplace, marketplaceName) {
    var marketplacePluginNames = new Set(marketplace.plugins.map(function (p) { return p.name; }));
    var suffix = "@".concat(marketplaceName);
    var delisted = [];
    for (var _i = 0, _a = Object.keys(installedPlugins.plugins); _i < _a.length; _i++) {
        var pluginId = _a[_i];
        if (!pluginId.endsWith(suffix))
            continue;
        var pluginName = pluginId.slice(0, -suffix.length);
        if (!marketplacePluginNames.has(pluginName)) {
            delisted.push(pluginId);
        }
    }
    return delisted;
}
/**
 * Detect delisted plugins across all marketplaces, auto-uninstall them,
 * and record them as flagged.
 *
 * This is the core delisting enforcement logic, shared between interactive
 * mode (useManagePlugins) and headless mode (main.tsx print path).
 *
 * @returns List of newly flagged plugin IDs
 */
function detectAndUninstallDelistedPlugins() {
    return __awaiter(this, void 0, void 0, function () {
        var installedPlugins, alreadyFlagged, knownMarketplaces, newlyFlagged, _i, _a, marketplaceName, marketplace, delisted, _b, delisted_1, pluginId, installations, hasUserInstall, _c, installations_1, installation, scope, error_1, error_2;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, (0, pluginFlagging_js_1.loadFlaggedPlugins)()];
                case 1:
                    _e.sent();
                    installedPlugins = (0, installedPluginsManager_js_1.loadInstalledPluginsV2)();
                    alreadyFlagged = (0, pluginFlagging_js_1.getFlaggedPlugins)();
                    return [4 /*yield*/, (0, marketplaceManager_js_1.loadKnownMarketplacesConfigSafe)()];
                case 2:
                    knownMarketplaces = _e.sent();
                    newlyFlagged = [];
                    _i = 0, _a = Object.keys(knownMarketplaces);
                    _e.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 18];
                    marketplaceName = _a[_i];
                    _e.label = 4;
                case 4:
                    _e.trys.push([4, 16, , 17]);
                    return [4 /*yield*/, (0, marketplaceManager_js_1.getMarketplace)(marketplaceName)];
                case 5:
                    marketplace = _e.sent();
                    if (!marketplace.forceRemoveDeletedPlugins)
                        return [3 /*break*/, 17];
                    delisted = detectDelistedPlugins(installedPlugins, marketplace, marketplaceName);
                    _b = 0, delisted_1 = delisted;
                    _e.label = 6;
                case 6:
                    if (!(_b < delisted_1.length)) return [3 /*break*/, 15];
                    pluginId = delisted_1[_b];
                    if (pluginId in alreadyFlagged)
                        return [3 /*break*/, 14];
                    installations = (_d = installedPlugins.plugins[pluginId]) !== null && _d !== void 0 ? _d : [];
                    hasUserInstall = installations.some(function (i) {
                        return i.scope === 'user' || i.scope === 'project' || i.scope === 'local';
                    });
                    if (!hasUserInstall)
                        return [3 /*break*/, 14];
                    _c = 0, installations_1 = installations;
                    _e.label = 7;
                case 7:
                    if (!(_c < installations_1.length)) return [3 /*break*/, 12];
                    installation = installations_1[_c];
                    scope = installation.scope;
                    if (scope !== 'user' && scope !== 'project' && scope !== 'local') {
                        return [3 /*break*/, 11];
                    }
                    _e.label = 8;
                case 8:
                    _e.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, (0, pluginOperations_js_1.uninstallPluginOp)(pluginId, scope)];
                case 9:
                    _e.sent();
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _e.sent();
                    (0, debug_js_1.logForDebugging)("Failed to auto-uninstall delisted plugin ".concat(pluginId, " from ").concat(scope, ": ").concat((0, errors_js_1.errorMessage)(error_1)), { level: 'error' });
                    return [3 /*break*/, 11];
                case 11:
                    _c++;
                    return [3 /*break*/, 7];
                case 12: return [4 /*yield*/, (0, pluginFlagging_js_1.addFlaggedPlugin)(pluginId)];
                case 13:
                    _e.sent();
                    newlyFlagged.push(pluginId);
                    _e.label = 14;
                case 14:
                    _b++;
                    return [3 /*break*/, 6];
                case 15: return [3 /*break*/, 17];
                case 16:
                    error_2 = _e.sent();
                    // Marketplace may not be available yet — log and continue
                    (0, debug_js_1.logForDebugging)("Failed to check for delisted plugins in \"".concat(marketplaceName, "\": ").concat((0, errors_js_1.errorMessage)(error_2)), { level: 'warn' });
                    return [3 /*break*/, 17];
                case 17:
                    _i++;
                    return [3 /*break*/, 3];
                case 18: return [2 /*return*/, newlyFlagged];
            }
        });
    });
}
