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
exports.loadPluginLspServers = loadPluginLspServers;
exports.resolvePluginLspEnvironment = resolvePluginLspEnvironment;
exports.addPluginScopeToLspServers = addPluginScopeToLspServers;
exports.getPluginLspServers = getPluginLspServers;
exports.extractLspServersFromPlugins = extractLspServersFromPlugins;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var envExpansion_js_1 = require("../../services/mcp/envExpansion.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var log_js_1 = require("../log.js");
var slowOperations_js_1 = require("../slowOperations.js");
var pluginDirectories_js_1 = require("./pluginDirectories.js");
var pluginOptionsStorage_js_1 = require("./pluginOptionsStorage.js");
var schemas_js_1 = require("./schemas.js");
/**
 * Validate that a resolved path stays within the plugin directory.
 * Prevents path traversal attacks via .. or absolute paths.
 */
function validatePathWithinPlugin(pluginPath, relativePath) {
    // Resolve both paths to absolute paths
    var resolvedPluginPath = (0, path_1.resolve)(pluginPath);
    var resolvedFilePath = (0, path_1.resolve)(pluginPath, relativePath);
    // Check if the resolved file path is within the plugin directory
    var rel = (0, path_1.relative)(resolvedPluginPath, resolvedFilePath);
    // If relative path starts with .. or is absolute, it's outside the plugin dir
    if (rel.startsWith('..') || (0, path_1.resolve)(rel) === rel) {
        return null;
    }
    return resolvedFilePath;
}
/**
 * Load LSP server configurations from a plugin.
 * Checks for:
 * 1. .lsp.json file in plugin directory
 * 2. manifest.lspServers field
 *
 * @param plugin - The loaded plugin
 * @param errors - Array to collect any errors encountered
 * @returns Record of server name to config, or undefined if no servers
 */
function loadPluginLspServers(plugin_1) {
    return __awaiter(this, arguments, void 0, function (plugin, errors) {
        var servers, lspJsonPath, content, parsed, result, errorMsg, error_1, _errorMsg, manifestServers;
        if (errors === void 0) { errors = []; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    servers = {};
                    lspJsonPath = (0, path_1.join)(plugin.path, '.lsp.json');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(lspJsonPath, 'utf-8')];
                case 2:
                    content = _a.sent();
                    parsed = (0, slowOperations_js_1.jsonParse)(content);
                    result = v4_1.z
                        .record(v4_1.z.string(), (0, schemas_js_1.LspServerConfigSchema)())
                        .safeParse(parsed);
                    if (result.success) {
                        Object.assign(servers, result.data);
                    }
                    else {
                        errorMsg = "LSP config validation failed for .lsp.json in plugin ".concat(plugin.name, ": ").concat(result.error.message);
                        (0, log_js_1.logError)(new Error(errorMsg));
                        errors.push({
                            type: 'lsp-config-invalid',
                            plugin: plugin.name,
                            serverName: '.lsp.json',
                            validationError: result.error.message,
                            source: 'plugin',
                        });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    // .lsp.json is optional, ignore if it doesn't exist
                    if (!(0, errors_js_1.isENOENT)(error_1)) {
                        _errorMsg = error_1 instanceof Error
                            ? "Failed to read/parse .lsp.json in plugin ".concat(plugin.name, ": ").concat(error_1.message)
                            : "Failed to read/parse .lsp.json file in plugin ".concat(plugin.name);
                        (0, log_js_1.logError)((0, errors_js_1.toError)(error_1));
                        errors.push({
                            type: 'lsp-config-invalid',
                            plugin: plugin.name,
                            serverName: '.lsp.json',
                            validationError: error_1 instanceof Error
                                ? "Failed to parse JSON: ".concat(error_1.message)
                                : 'Failed to parse JSON file',
                            source: 'plugin',
                        });
                    }
                    return [3 /*break*/, 4];
                case 4:
                    if (!plugin.manifest.lspServers) return [3 /*break*/, 6];
                    return [4 /*yield*/, loadLspServersFromManifest(plugin.manifest.lspServers, plugin.path, plugin.name, errors)];
                case 5:
                    manifestServers = _a.sent();
                    if (manifestServers) {
                        Object.assign(servers, manifestServers);
                    }
                    _a.label = 6;
                case 6: return [2 /*return*/, Object.keys(servers).length > 0 ? servers : undefined];
            }
        });
    });
}
/**
 * Load LSP servers from manifest declaration (handles multiple formats).
 */
function loadLspServersFromManifest(declaration, pluginPath, pluginName, errors) {
    return __awaiter(this, void 0, void 0, function () {
        var servers, declarations, _i, declarations_1, decl, validatedPath, securityMsg, content, parsed, result, errorMsg, error_2, _errorMsg, _a, _b, _c, serverName, config, result, errorMsg;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    servers = {};
                    declarations = Array.isArray(declaration) ? declaration : [declaration];
                    _i = 0, declarations_1 = declarations;
                    _d.label = 1;
                case 1:
                    if (!(_i < declarations_1.length)) return [3 /*break*/, 8];
                    decl = declarations_1[_i];
                    if (!(typeof decl === 'string')) return [3 /*break*/, 6];
                    validatedPath = validatePathWithinPlugin(pluginPath, decl);
                    if (!validatedPath) {
                        securityMsg = "Security: Path traversal attempt blocked in plugin ".concat(pluginName, ": ").concat(decl);
                        (0, log_js_1.logError)(new Error(securityMsg));
                        (0, debug_js_1.logForDebugging)(securityMsg, { level: 'warn' });
                        errors.push({
                            type: 'lsp-config-invalid',
                            plugin: pluginName,
                            serverName: decl,
                            validationError: 'Invalid path: must be relative and within plugin directory',
                            source: 'plugin',
                        });
                        return [3 /*break*/, 7];
                    }
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.readFile)(validatedPath, 'utf-8')];
                case 3:
                    content = _d.sent();
                    parsed = (0, slowOperations_js_1.jsonParse)(content);
                    result = v4_1.z
                        .record(v4_1.z.string(), (0, schemas_js_1.LspServerConfigSchema)())
                        .safeParse(parsed);
                    if (result.success) {
                        Object.assign(servers, result.data);
                    }
                    else {
                        errorMsg = "LSP config validation failed for ".concat(decl, " in plugin ").concat(pluginName, ": ").concat(result.error.message);
                        (0, log_js_1.logError)(new Error(errorMsg));
                        errors.push({
                            type: 'lsp-config-invalid',
                            plugin: pluginName,
                            serverName: decl,
                            validationError: result.error.message,
                            source: 'plugin',
                        });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _d.sent();
                    _errorMsg = error_2 instanceof Error
                        ? "Failed to read/parse LSP config from ".concat(decl, " in plugin ").concat(pluginName, ": ").concat(error_2.message)
                        : "Failed to read/parse LSP config file ".concat(decl, " in plugin ").concat(pluginName);
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_2));
                    errors.push({
                        type: 'lsp-config-invalid',
                        plugin: pluginName,
                        serverName: decl,
                        validationError: error_2 instanceof Error
                            ? "Failed to parse JSON: ".concat(error_2.message)
                            : 'Failed to parse JSON file',
                        source: 'plugin',
                    });
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    // Inline configs
                    for (_a = 0, _b = Object.entries(decl); _a < _b.length; _a++) {
                        _c = _b[_a], serverName = _c[0], config = _c[1];
                        result = (0, schemas_js_1.LspServerConfigSchema)().safeParse(config);
                        if (result.success) {
                            servers[serverName] = result.data;
                        }
                        else {
                            errorMsg = "LSP config validation failed for inline server \"".concat(serverName, "\" in plugin ").concat(pluginName, ": ").concat(result.error.message);
                            (0, log_js_1.logError)(new Error(errorMsg));
                            errors.push({
                                type: 'lsp-config-invalid',
                                plugin: pluginName,
                                serverName: serverName,
                                validationError: result.error.message,
                                source: 'plugin',
                            });
                        }
                    }
                    _d.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, Object.keys(servers).length > 0 ? servers : undefined];
            }
        });
    });
}
/**
 * Resolve environment variables for plugin LSP servers.
 * Handles ${CLAUDE_PLUGIN_ROOT}, ${user_config.X}, and general ${VAR}
 * substitution. Tracks missing environment variables for error reporting.
 */
function resolvePluginLspEnvironment(config, plugin, userConfig, _errors) {
    var allMissingVars = [];
    var resolveValue = function (value) {
        // First substitute plugin-specific variables
        var resolved = (0, pluginOptionsStorage_js_1.substitutePluginVariables)(value, plugin);
        // Then substitute user config variables if provided
        if (userConfig) {
            resolved = (0, pluginOptionsStorage_js_1.substituteUserConfigVariables)(resolved, userConfig);
        }
        // Finally expand general environment variables
        var _a = (0, envExpansion_js_1.expandEnvVarsInString)(resolved), expanded = _a.expanded, missingVars = _a.missingVars;
        allMissingVars.push.apply(allMissingVars, missingVars);
        return expanded;
    };
    var resolved = __assign({}, config);
    // Resolve command path
    if (resolved.command) {
        resolved.command = resolveValue(resolved.command);
    }
    // Resolve args
    if (resolved.args) {
        resolved.args = resolved.args.map(function (arg) { return resolveValue(arg); });
    }
    // Resolve environment variables and add CLAUDE_PLUGIN_ROOT / CLAUDE_PLUGIN_DATA
    var resolvedEnv = __assign({ CLAUDE_PLUGIN_ROOT: plugin.path, CLAUDE_PLUGIN_DATA: (0, pluginDirectories_js_1.getPluginDataDir)(plugin.source) }, (resolved.env || {}));
    for (var _i = 0, _a = Object.entries(resolvedEnv); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (key !== 'CLAUDE_PLUGIN_ROOT' && key !== 'CLAUDE_PLUGIN_DATA') {
            resolvedEnv[key] = resolveValue(value);
        }
    }
    resolved.env = resolvedEnv;
    // Resolve workspaceFolder if present
    if (resolved.workspaceFolder) {
        resolved.workspaceFolder = resolveValue(resolved.workspaceFolder);
    }
    // Log missing variables if any were found
    if (allMissingVars.length > 0) {
        var uniqueMissingVars = __spreadArray([], new Set(allMissingVars), true);
        var warnMsg = "Missing environment variables in plugin LSP config: ".concat(uniqueMissingVars.join(', '));
        (0, log_js_1.logError)(new Error(warnMsg));
        (0, debug_js_1.logForDebugging)(warnMsg, { level: 'warn' });
    }
    return resolved;
}
/**
 * Add plugin scope to LSP server configs
 * This adds a prefix to server names to avoid conflicts between plugins
 */
function addPluginScopeToLspServers(servers, pluginName) {
    var scopedServers = {};
    for (var _i = 0, _a = Object.entries(servers); _i < _a.length; _i++) {
        var _b = _a[_i], name_1 = _b[0], config = _b[1];
        // Add plugin prefix to server name to avoid conflicts
        var scopedName = "plugin:".concat(pluginName, ":").concat(name_1);
        scopedServers[scopedName] = __assign(__assign({}, config), { scope: 'dynamic', source: pluginName });
    }
    return scopedServers;
}
/**
 * Get LSP servers from a specific plugin with environment variable resolution and scoping
 * This function is called when the LSP servers need to be activated and ensures they have
 * the proper environment variables and scope applied
 */
function getPluginLspServers(plugin_1) {
    return __awaiter(this, arguments, void 0, function (plugin, errors) {
        var servers, _a, userConfig, resolvedServers, _i, _b, _c, name_2, config;
        if (errors === void 0) { errors = []; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!plugin.enabled) {
                        return [2 /*return*/, undefined];
                    }
                    _a = plugin.lspServers;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, loadPluginLspServers(plugin, errors)];
                case 1:
                    _a = (_d.sent());
                    _d.label = 2;
                case 2:
                    servers = _a;
                    if (!servers) {
                        return [2 /*return*/, undefined];
                    }
                    userConfig = plugin.manifest.userConfig
                        ? (0, pluginOptionsStorage_js_1.loadPluginOptions)((0, pluginOptionsStorage_js_1.getPluginStorageId)(plugin))
                        : undefined;
                    resolvedServers = {};
                    for (_i = 0, _b = Object.entries(servers); _i < _b.length; _i++) {
                        _c = _b[_i], name_2 = _c[0], config = _c[1];
                        resolvedServers[name_2] = resolvePluginLspEnvironment(config, plugin, userConfig, errors);
                    }
                    // Add plugin scope
                    return [2 /*return*/, addPluginScopeToLspServers(resolvedServers, plugin.name)];
            }
        });
    });
}
/**
 * Extract all LSP servers from loaded plugins
 */
function extractLspServersFromPlugins(plugins_1) {
    return __awaiter(this, arguments, void 0, function (plugins, errors) {
        var allServers, _i, plugins_2, plugin, servers, scopedServers;
        if (errors === void 0) { errors = []; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allServers = {};
                    _i = 0, plugins_2 = plugins;
                    _a.label = 1;
                case 1:
                    if (!(_i < plugins_2.length)) return [3 /*break*/, 4];
                    plugin = plugins_2[_i];
                    if (!plugin.enabled)
                        return [3 /*break*/, 3];
                    return [4 /*yield*/, loadPluginLspServers(plugin, errors)];
                case 2:
                    servers = _a.sent();
                    if (servers) {
                        scopedServers = addPluginScopeToLspServers(servers, plugin.name);
                        Object.assign(allServers, scopedServers);
                        // Store the servers on the plugin for caching
                        plugin.lspServers = servers;
                        (0, debug_js_1.logForDebugging)("Loaded ".concat(Object.keys(servers).length, " LSP servers from plugin ").concat(plugin.name));
                    }
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, allServers];
            }
        });
    });
}
