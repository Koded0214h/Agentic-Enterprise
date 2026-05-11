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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_UPDATE_SCOPES = exports.VALID_INSTALLABLE_SCOPES = void 0;
exports.installPlugin = installPlugin;
exports.uninstallPlugin = uninstallPlugin;
exports.enablePlugin = enablePlugin;
exports.disablePlugin = disablePlugin;
exports.disableAllPlugins = disableAllPlugins;
exports.updatePluginCli = updatePluginCli;
/**
 * CLI command wrappers for plugin operations
 *
 * This module provides thin wrappers around the core plugin operations
 * that handle CLI-specific concerns like console output and process exit.
 *
 * For the core operations (without CLI side effects), see pluginOperations.ts
 */
var figures_1 = require("figures");
var errors_js_1 = require("../../utils/errors.js");
var gracefulShutdown_js_1 = require("../../utils/gracefulShutdown.js");
var log_js_1 = require("../../utils/log.js");
var managedPlugins_js_1 = require("../../utils/plugins/managedPlugins.js");
var pluginIdentifier_js_1 = require("../../utils/plugins/pluginIdentifier.js");
var process_js_1 = require("../../utils/process.js");
var pluginTelemetry_js_1 = require("../../utils/telemetry/pluginTelemetry.js");
var index_js_1 = require("../analytics/index.js");
var pluginOperations_js_1 = require("./pluginOperations.js");
Object.defineProperty(exports, "VALID_INSTALLABLE_SCOPES", { enumerable: true, get: function () { return pluginOperations_js_1.VALID_INSTALLABLE_SCOPES; } });
Object.defineProperty(exports, "VALID_UPDATE_SCOPES", { enumerable: true, get: function () { return pluginOperations_js_1.VALID_UPDATE_SCOPES; } });
/**
 * Generic error handler for plugin CLI commands. Emits
 * tengu_plugin_command_failed before exit so dashboards can compute a
 * success rate against the corresponding success events.
 */
function handlePluginCommandError(error, command, plugin) {
    (0, log_js_1.logError)(error);
    var operation = plugin
        ? "".concat(command, " plugin \"").concat(plugin, "\"")
        : command === 'disable-all'
            ? 'disable all plugins'
            : "".concat(command, " plugins");
    // biome-ignore lint/suspicious/noConsole:: intentional console output
    console.error("".concat(figures_1.default.cross, " Failed to ").concat(operation, ": ").concat((0, errors_js_1.errorMessage)(error)));
    var telemetryFields = plugin
        ? (function () {
            var _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(plugin), name = _a.name, marketplace = _a.marketplace;
            return __assign(__assign({ _PROTO_plugin_name: name }, (marketplace && {
                _PROTO_marketplace_name: marketplace,
            })), (0, pluginTelemetry_js_1.buildPluginTelemetryFields)(name, marketplace, (0, managedPlugins_js_1.getManagedPluginNames)()));
        })()
        : {};
    (0, index_js_1.logEvent)('tengu_plugin_command_failed', __assign({ command: command, error_category: (0, pluginTelemetry_js_1.classifyPluginCommandError)(error) }, telemetryFields));
    // eslint-disable-next-line custom-rules/no-process-exit
    process.exit(1);
}
/**
 * CLI command: Install a plugin non-interactively
 * @param plugin Plugin identifier (name or plugin@marketplace)
 * @param scope Installation scope: user, project, or local (defaults to 'user')
 */
function installPlugin(plugin_1) {
    return __awaiter(this, arguments, void 0, function (plugin, scope) {
        var result, _a, name_1, marketplace, error_1;
        if (scope === void 0) { scope = 'user'; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.log("Installing plugin \"".concat(plugin, "\"..."));
                    return [4 /*yield*/, (0, pluginOperations_js_1.installPluginOp)(plugin, scope)];
                case 1:
                    result = _b.sent();
                    if (!result.success) {
                        throw new Error(result.message);
                    }
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.log("".concat(figures_1.default.tick, " ").concat(result.message));
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(result.pluginId || plugin), name_1 = _a.name, marketplace = _a.marketplace;
                    (0, index_js_1.logEvent)('tengu_plugin_installed_cli', __assign(__assign(__assign({ _PROTO_plugin_name: name_1 }, (marketplace && {
                        _PROTO_marketplace_name: marketplace,
                    })), { scope: (result.scope ||
                            scope), install_source: 'cli-explicit' }), (0, pluginTelemetry_js_1.buildPluginTelemetryFields)(name_1, marketplace, (0, managedPlugins_js_1.getManagedPluginNames)())));
                    // eslint-disable-next-line custom-rules/no-process-exit
                    process.exit(0);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    handlePluginCommandError(error_1, 'install', plugin);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * CLI command: Uninstall a plugin non-interactively
 * @param plugin Plugin name or plugin@marketplace identifier
 * @param scope Uninstall from scope: user, project, or local (defaults to 'user')
 */
function uninstallPlugin(plugin_1) {
    return __awaiter(this, arguments, void 0, function (plugin, scope, keepData) {
        var result, _a, name_2, marketplace, error_2;
        if (scope === void 0) { scope = 'user'; }
        if (keepData === void 0) { keepData = false; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, pluginOperations_js_1.uninstallPluginOp)(plugin, scope, !keepData)];
                case 1:
                    result = _b.sent();
                    if (!result.success) {
                        throw new Error(result.message);
                    }
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.log("".concat(figures_1.default.tick, " ").concat(result.message));
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(result.pluginId || plugin), name_2 = _a.name, marketplace = _a.marketplace;
                    (0, index_js_1.logEvent)('tengu_plugin_uninstalled_cli', __assign(__assign(__assign({ _PROTO_plugin_name: name_2 }, (marketplace && {
                        _PROTO_marketplace_name: marketplace,
                    })), { scope: (result.scope ||
                            scope) }), (0, pluginTelemetry_js_1.buildPluginTelemetryFields)(name_2, marketplace, (0, managedPlugins_js_1.getManagedPluginNames)())));
                    // eslint-disable-next-line custom-rules/no-process-exit
                    process.exit(0);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _b.sent();
                    handlePluginCommandError(error_2, 'uninstall', plugin);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * CLI command: Enable a plugin non-interactively
 * @param plugin Plugin name or plugin@marketplace identifier
 * @param scope Optional scope. If not provided, finds the most specific scope for the current project.
 */
function enablePlugin(plugin, scope) {
    return __awaiter(this, void 0, void 0, function () {
        var result, _a, name_3, marketplace, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, pluginOperations_js_1.enablePluginOp)(plugin, scope)];
                case 1:
                    result = _b.sent();
                    if (!result.success) {
                        throw new Error(result.message);
                    }
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.log("".concat(figures_1.default.tick, " ").concat(result.message));
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(result.pluginId || plugin), name_3 = _a.name, marketplace = _a.marketplace;
                    (0, index_js_1.logEvent)('tengu_plugin_enabled_cli', __assign(__assign(__assign({ _PROTO_plugin_name: name_3 }, (marketplace && {
                        _PROTO_marketplace_name: marketplace,
                    })), { scope: result.scope }), (0, pluginTelemetry_js_1.buildPluginTelemetryFields)(name_3, marketplace, (0, managedPlugins_js_1.getManagedPluginNames)())));
                    // eslint-disable-next-line custom-rules/no-process-exit
                    process.exit(0);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _b.sent();
                    handlePluginCommandError(error_3, 'enable', plugin);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * CLI command: Disable a plugin non-interactively
 * @param plugin Plugin name or plugin@marketplace identifier
 * @param scope Optional scope. If not provided, finds the most specific scope for the current project.
 */
function disablePlugin(plugin, scope) {
    return __awaiter(this, void 0, void 0, function () {
        var result, _a, name_4, marketplace, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, pluginOperations_js_1.disablePluginOp)(plugin, scope)];
                case 1:
                    result = _b.sent();
                    if (!result.success) {
                        throw new Error(result.message);
                    }
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.log("".concat(figures_1.default.tick, " ").concat(result.message));
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(result.pluginId || plugin), name_4 = _a.name, marketplace = _a.marketplace;
                    (0, index_js_1.logEvent)('tengu_plugin_disabled_cli', __assign(__assign(__assign({ _PROTO_plugin_name: name_4 }, (marketplace && {
                        _PROTO_marketplace_name: marketplace,
                    })), { scope: result.scope }), (0, pluginTelemetry_js_1.buildPluginTelemetryFields)(name_4, marketplace, (0, managedPlugins_js_1.getManagedPluginNames)())));
                    // eslint-disable-next-line custom-rules/no-process-exit
                    process.exit(0);
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _b.sent();
                    handlePluginCommandError(error_4, 'disable', plugin);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * CLI command: Disable all enabled plugins non-interactively
 */
function disableAllPlugins() {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, pluginOperations_js_1.disableAllPluginsOp)()];
                case 1:
                    result = _a.sent();
                    if (!result.success) {
                        throw new Error(result.message);
                    }
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.log("".concat(figures_1.default.tick, " ").concat(result.message));
                    (0, index_js_1.logEvent)('tengu_plugin_disabled_all_cli', {});
                    // eslint-disable-next-line custom-rules/no-process-exit
                    process.exit(0);
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    handlePluginCommandError(error_5, 'disable-all');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * CLI command: Update a plugin non-interactively
 * @param plugin Plugin name or plugin@marketplace identifier
 * @param scope Scope to update
 */
function updatePluginCli(plugin, scope) {
    return __awaiter(this, void 0, void 0, function () {
        var result, _a, name_5, marketplace, error_6;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    (0, process_js_1.writeToStdout)("Checking for updates for plugin \"".concat(plugin, "\" at ").concat(scope, " scope\u2026\n"));
                    return [4 /*yield*/, (0, pluginOperations_js_1.updatePluginOp)(plugin, scope)];
                case 1:
                    result = _b.sent();
                    if (!result.success) {
                        throw new Error(result.message);
                    }
                    (0, process_js_1.writeToStdout)("".concat(figures_1.default.tick, " ").concat(result.message, "\n"));
                    if (!result.alreadyUpToDate) {
                        _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(result.pluginId || plugin), name_5 = _a.name, marketplace = _a.marketplace;
                        (0, index_js_1.logEvent)('tengu_plugin_updated_cli', __assign(__assign(__assign({ _PROTO_plugin_name: name_5 }, (marketplace && {
                            _PROTO_marketplace_name: marketplace,
                        })), { old_version: (result.oldVersion ||
                                'unknown'), new_version: (result.newVersion ||
                                'unknown') }), (0, pluginTelemetry_js_1.buildPluginTelemetryFields)(name_5, marketplace, (0, managedPlugins_js_1.getManagedPluginNames)())));
                    }
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(0)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _b.sent();
                    handlePluginCommandError(error_6, 'update', plugin);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
