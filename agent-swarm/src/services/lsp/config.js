"use strict";
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
exports.getAllLspServers = getAllLspServers;
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var lspPluginIntegration_js_1 = require("../../utils/plugins/lspPluginIntegration.js");
var pluginLoader_js_1 = require("../../utils/plugins/pluginLoader.js");
/**
 * Get all configured LSP servers from plugins.
 * LSP servers are only supported via plugins, not user/project settings.
 *
 * @returns Object containing servers configuration keyed by scoped server name
 */
function getAllLspServers() {
    return __awaiter(this, void 0, void 0, function () {
        var allServers, plugins, results, _i, results_1, _a, plugin, scopedServers, errors, serverCount, error_1;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    allServers = {};
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, pluginLoader_js_1.loadAllPluginsCacheOnly)()
                        // Load LSP servers from each plugin in parallel.
                        // Each plugin is independent — results are merged in original order so
                        // Object.assign collision precedence (later plugins win) is preserved.
                    ];
                case 2:
                    plugins = (_b.sent()).enabled;
                    return [4 /*yield*/, Promise.all(plugins.map(function (plugin) { return __awaiter(_this, void 0, void 0, function () {
                            var errors, scopedServers, e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        errors = [];
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, (0, lspPluginIntegration_js_1.getPluginLspServers)(plugin, errors)];
                                    case 2:
                                        scopedServers = _a.sent();
                                        return [2 /*return*/, { plugin: plugin, scopedServers: scopedServers, errors: errors }];
                                    case 3:
                                        e_1 = _a.sent();
                                        // Defensive: if one plugin throws, don't lose results from the
                                        // others. The previous serial loop implicitly tolerated this.
                                        (0, debug_js_1.logForDebugging)("Failed to load LSP servers for plugin ".concat(plugin.name, ": ").concat(e_1), { level: 'error' });
                                        return [2 /*return*/, { plugin: plugin, scopedServers: undefined, errors: errors }];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 3:
                    results = _b.sent();
                    for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                        _a = results_1[_i], plugin = _a.plugin, scopedServers = _a.scopedServers, errors = _a.errors;
                        serverCount = scopedServers ? Object.keys(scopedServers).length : 0;
                        if (serverCount > 0) {
                            // Merge into all servers (already scoped by getPluginLspServers)
                            Object.assign(allServers, scopedServers);
                            (0, debug_js_1.logForDebugging)("Loaded ".concat(serverCount, " LSP server(s) from plugin: ").concat(plugin.name));
                        }
                        // Log any errors encountered
                        if (errors.length > 0) {
                            (0, debug_js_1.logForDebugging)("".concat(errors.length, " error(s) loading LSP servers from plugin: ").concat(plugin.name));
                        }
                    }
                    (0, debug_js_1.logForDebugging)("Total LSP servers loaded: ".concat(Object.keys(allServers).length));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    // Log error for monitoring production issues.
                    // LSP is optional, so we don't throw - but we need visibility
                    // into why plugin loading fails to improve the feature.
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_1));
                    (0, debug_js_1.logForDebugging)("Error loading LSP servers: ".concat((0, errors_js_1.errorMessage)(error_1)));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, {
                        servers: allServers,
                    }];
            }
        });
    });
}
