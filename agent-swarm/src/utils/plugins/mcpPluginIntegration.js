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
exports.loadPluginMcpServers = loadPluginMcpServers;
exports.getUnconfiguredChannels = getUnconfiguredChannels;
exports.addPluginScopeToServers = addPluginScopeToServers;
exports.extractMcpServersFromPlugins = extractMcpServersFromPlugins;
exports.resolvePluginMcpEnvironment = resolvePluginMcpEnvironment;
exports.getPluginMcpServers = getPluginMcpServers;
var path_1 = require("path");
var envExpansion_js_1 = require("../../services/mcp/envExpansion.js");
var types_js_1 = require("../../services/mcp/types.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var fsOperations_js_1 = require("../fsOperations.js");
var slowOperations_js_1 = require("../slowOperations.js");
var mcpbHandler_js_1 = require("./mcpbHandler.js");
var pluginDirectories_js_1 = require("./pluginDirectories.js");
var pluginOptionsStorage_js_1 = require("./pluginOptionsStorage.js");
/**
 * Load MCP servers from an MCPB file
 * Handles downloading, extracting, and converting DXT manifest to MCP config
 */
function loadMcpServersFromMcpb(plugin, mcpbPath, errors) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginId, result, successResult, serverName, error_1, errorMsg, source, isUrl;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    (0, debug_js_1.logForDebugging)("Loading MCP servers from MCPB: ".concat(mcpbPath));
                    pluginId = plugin.repository;
                    return [4 /*yield*/, (0, mcpbHandler_js_1.loadMcpbFile)(mcpbPath, plugin.path, pluginId, function (status) {
                            (0, debug_js_1.logForDebugging)("MCPB [".concat(plugin.name, "]: ").concat(status));
                        })
                        // Check if MCPB needs user configuration
                    ];
                case 1:
                    result = _b.sent();
                    // Check if MCPB needs user configuration
                    if ('status' in result && result.status === 'needs-config') {
                        // User config needed - this is normal for unconfigured plugins
                        // Don't load the MCP server yet - user can configure via /plugin menu
                        (0, debug_js_1.logForDebugging)("MCPB ".concat(mcpbPath, " requires user configuration. ") +
                            "User can configure via: /plugin \u2192 Manage plugins \u2192 ".concat(plugin.name, " \u2192 Configure"));
                        // Return null to skip this server for now (not an error)
                        return [2 /*return*/, null];
                    }
                    successResult = result;
                    serverName = successResult.manifest.name;
                    // Check for server name conflicts with existing servers
                    // This will be checked later when merging all servers, but we log here for debugging
                    (0, debug_js_1.logForDebugging)("Loaded MCP server \"".concat(serverName, "\" from MCPB (extracted to ").concat(successResult.extractedPath, ")"));
                    return [2 /*return*/, (_a = {}, _a[serverName] = successResult.mcpConfig, _a)];
                case 2:
                    error_1 = _b.sent();
                    errorMsg = (0, errors_js_1.errorMessage)(error_1);
                    (0, debug_js_1.logForDebugging)("Failed to load MCPB ".concat(mcpbPath, ": ").concat(errorMsg), {
                        level: 'error',
                    });
                    source = "".concat(plugin.name, "@").concat(plugin.repository);
                    isUrl = mcpbPath.startsWith('http');
                    if (isUrl &&
                        (errorMsg.includes('download') || errorMsg.includes('network'))) {
                        errors.push({
                            type: 'mcpb-download-failed',
                            source: source,
                            plugin: plugin.name,
                            url: mcpbPath,
                            reason: errorMsg,
                        });
                    }
                    else if (errorMsg.includes('manifest') ||
                        errorMsg.includes('user configuration')) {
                        errors.push({
                            type: 'mcpb-invalid-manifest',
                            source: source,
                            plugin: plugin.name,
                            mcpbPath: mcpbPath,
                            validationError: errorMsg,
                        });
                    }
                    else {
                        errors.push({
                            type: 'mcpb-extract-failed',
                            source: source,
                            plugin: plugin.name,
                            mcpbPath: mcpbPath,
                            reason: errorMsg,
                        });
                    }
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Load MCP servers from a plugin's manifest
 * This function loads MCP server configurations from various sources within the plugin
 * including manifest entries, .mcp.json files, and .mcpb files
 */
function loadPluginMcpServers(plugin_1) {
    return __awaiter(this, arguments, void 0, function (plugin, errors) {
        var servers, defaultMcpServers, mcpServersSpec, mcpbServers, mcpServers, results, _i, results_1, result;
        var _this = this;
        if (errors === void 0) { errors = []; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    servers = {};
                    return [4 /*yield*/, loadMcpServersFromFile(plugin.path, '.mcp.json')];
                case 1:
                    defaultMcpServers = _a.sent();
                    if (defaultMcpServers) {
                        servers = __assign(__assign({}, servers), defaultMcpServers);
                    }
                    if (!plugin.manifest.mcpServers) return [3 /*break*/, 9];
                    mcpServersSpec = plugin.manifest.mcpServers;
                    if (!(typeof mcpServersSpec === 'string')) return [3 /*break*/, 6];
                    if (!(0, mcpbHandler_js_1.isMcpbSource)(mcpServersSpec)) return [3 /*break*/, 3];
                    return [4 /*yield*/, loadMcpServersFromMcpb(plugin, mcpServersSpec, errors)];
                case 2:
                    mcpbServers = _a.sent();
                    if (mcpbServers) {
                        servers = __assign(__assign({}, servers), mcpbServers);
                    }
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, loadMcpServersFromFile(plugin.path, mcpServersSpec)];
                case 4:
                    mcpServers = _a.sent();
                    if (mcpServers) {
                        servers = __assign(__assign({}, servers), mcpServers);
                    }
                    _a.label = 5;
                case 5: return [3 /*break*/, 9];
                case 6:
                    if (!Array.isArray(mcpServersSpec)) return [3 /*break*/, 8];
                    return [4 /*yield*/, Promise.all(mcpServersSpec.map(function (spec) { return __awaiter(_this, void 0, void 0, function () {
                            var e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 5, , 6]);
                                        if (!(typeof spec === 'string')) return [3 /*break*/, 4];
                                        if (!(0, mcpbHandler_js_1.isMcpbSource)(spec)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, loadMcpServersFromMcpb(plugin, spec, errors)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                    case 2: return [4 /*yield*/, loadMcpServersFromFile(plugin.path, spec)];
                                    case 3: 
                                    // Path to JSON file
                                    return [2 /*return*/, _a.sent()];
                                    case 4: 
                                    // Inline MCP server configs (sync)
                                    return [2 /*return*/, spec];
                                    case 5:
                                        e_1 = _a.sent();
                                        // Defensive: if one spec throws, don't lose results from the
                                        // others. The previous serial loop implicitly tolerated this.
                                        (0, debug_js_1.logForDebugging)("Failed to load MCP servers from spec for plugin ".concat(plugin.name, ": ").concat(e_1), { level: 'error' });
                                        return [2 /*return*/, null];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 7:
                    results = _a.sent();
                    for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                        result = results_1[_i];
                        if (result) {
                            servers = __assign(__assign({}, servers), result);
                        }
                    }
                    return [3 /*break*/, 9];
                case 8:
                    // Direct MCP server configs
                    servers = __assign(__assign({}, servers), mcpServersSpec);
                    _a.label = 9;
                case 9: return [2 /*return*/, Object.keys(servers).length > 0 ? servers : undefined];
            }
        });
    });
}
/**
 * Load MCP servers from a JSON file within a plugin
 * This is a simplified version that doesn't expand environment variables
 * and is specifically for plugin MCP configs
 */
function loadMcpServersFromFile(pluginPath, relativePath) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, filePath, content, e_2, parsed, mcpServers, validatedServers, _i, _a, _b, name_1, config, result;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    filePath = (0, path_1.join)(pluginPath, relativePath);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(filePath, { encoding: 'utf-8' })];
                case 2:
                    content = _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _c.sent();
                    if ((0, errors_js_1.isENOENT)(e_2)) {
                        return [2 /*return*/, null];
                    }
                    (0, debug_js_1.logForDebugging)("Failed to load MCP servers from ".concat(filePath, ": ").concat(e_2), {
                        level: 'error',
                    });
                    return [2 /*return*/, null];
                case 4:
                    try {
                        parsed = (0, slowOperations_js_1.jsonParse)(content);
                        mcpServers = parsed.mcpServers || parsed;
                        validatedServers = {};
                        for (_i = 0, _a = Object.entries(mcpServers); _i < _a.length; _i++) {
                            _b = _a[_i], name_1 = _b[0], config = _b[1];
                            result = (0, types_js_1.McpServerConfigSchema)().safeParse(config);
                            if (result.success) {
                                validatedServers[name_1] = result.data;
                            }
                            else {
                                (0, debug_js_1.logForDebugging)("Invalid MCP server config for ".concat(name_1, " in ").concat(filePath, ": ").concat(result.error.message), { level: 'error' });
                            }
                        }
                        return [2 /*return*/, validatedServers];
                    }
                    catch (error) {
                        (0, debug_js_1.logForDebugging)("Failed to load MCP servers from ".concat(filePath, ": ").concat(error), {
                            level: 'error',
                        });
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Find channel entries in a plugin's manifest whose required userConfig
 * fields are not yet saved. Pure function — no React, no prompting.
 * ManagePlugins.tsx calls this after a plugin is enabled to decide whether
 * to show the config dialog.
 *
 * Entries without a `userConfig` schema are skipped (nothing to prompt for).
 * Entries whose saved config already satisfies `validateUserConfig` are
 * skipped. The `configSchema` in the return value is structurally a
 * `UserConfigSchema` because the Zod schema in schemas.ts matches
 * `McpbUserConfigurationOption` field-for-field.
 */
function getUnconfiguredChannels(plugin) {
    var _a, _b;
    var channels = plugin.manifest.channels;
    if (!channels || channels.length === 0) {
        return [];
    }
    // plugin.repository is already in "plugin@marketplace" format — same key
    // loadMcpServerUserConfig / saveMcpServerUserConfig use.
    var pluginId = plugin.repository;
    var unconfigured = [];
    for (var _i = 0, channels_1 = channels; _i < channels_1.length; _i++) {
        var channel = channels_1[_i];
        if (!channel.userConfig || Object.keys(channel.userConfig).length === 0) {
            continue;
        }
        var saved = (_a = (0, mcpbHandler_js_1.loadMcpServerUserConfig)(pluginId, channel.server)) !== null && _a !== void 0 ? _a : {};
        var validation = (0, mcpbHandler_js_1.validateUserConfig)(saved, channel.userConfig);
        if (!validation.valid) {
            unconfigured.push({
                server: channel.server,
                displayName: (_b = channel.displayName) !== null && _b !== void 0 ? _b : channel.server,
                configSchema: channel.userConfig,
            });
        }
    }
    return unconfigured;
}
/**
 * Look up saved user config for a server, if this server is declared as a
 * channel in the plugin's manifest. Returns undefined for non-channel servers
 * or channels without a userConfig schema — resolvePluginMcpEnvironment will
 * then skip ${user_config.X} substitution for that server.
 */
function loadChannelUserConfig(plugin, serverName) {
    var _a, _b;
    var channel = (_a = plugin.manifest.channels) === null || _a === void 0 ? void 0 : _a.find(function (c) { return c.server === serverName; });
    if (!(channel === null || channel === void 0 ? void 0 : channel.userConfig)) {
        return undefined;
    }
    return (_b = (0, mcpbHandler_js_1.loadMcpServerUserConfig)(plugin.repository, serverName)) !== null && _b !== void 0 ? _b : undefined;
}
/**
 * Add plugin scope to MCP server configs
 * This adds a prefix to server names to avoid conflicts between plugins
 */
function addPluginScopeToServers(servers, pluginName, pluginSource) {
    var scopedServers = {};
    for (var _i = 0, _a = Object.entries(servers); _i < _a.length; _i++) {
        var _b = _a[_i], name_2 = _b[0], config = _b[1];
        // Add plugin prefix to server name to avoid conflicts
        var scopedName = "plugin:".concat(pluginName, ":").concat(name_2);
        var scoped = __assign(__assign({}, config), { scope: 'dynamic', // Use dynamic scope for plugin servers
            pluginSource: pluginSource });
        scopedServers[scopedName] = scoped;
    }
    return scopedServers;
}
/**
 * Extract all MCP servers from loaded plugins
 * NOTE: Resolves environment variables for all servers before returning
 */
function extractMcpServersFromPlugins(plugins_1) {
    return __awaiter(this, arguments, void 0, function (plugins, errors) {
        var allServers, scopedResults, _i, scopedResults_1, scopedServers;
        var _this = this;
        if (errors === void 0) { errors = []; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allServers = {};
                    return [4 /*yield*/, Promise.all(plugins.map(function (plugin) { return __awaiter(_this, void 0, void 0, function () {
                            var servers, resolvedServers, _i, _a, _b, name_3, config, userConfig;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        if (!plugin.enabled)
                                            return [2 /*return*/, null];
                                        return [4 /*yield*/, loadPluginMcpServers(plugin, errors)];
                                    case 1:
                                        servers = _c.sent();
                                        if (!servers)
                                            return [2 /*return*/, null
                                                // Resolve environment variables before scoping. When a saved channel
                                                // config is missing a key (plugin update added a required field, or a
                                                // hand-edited settings.json), substituteUserConfigVariables throws
                                                // inside resolvePluginMcpEnvironment — catch per-server so one bad
                                                // config doesn't crash the whole plugin load via Promise.all.
                                            ];
                                        resolvedServers = {};
                                        for (_i = 0, _a = Object.entries(servers); _i < _a.length; _i++) {
                                            _b = _a[_i], name_3 = _b[0], config = _b[1];
                                            userConfig = buildMcpUserConfig(plugin, name_3);
                                            try {
                                                resolvedServers[name_3] = resolvePluginMcpEnvironment(config, plugin, userConfig, errors, plugin.name, name_3);
                                            }
                                            catch (err) {
                                                errors === null || errors === void 0 ? void 0 : errors.push({
                                                    type: 'generic-error',
                                                    source: name_3,
                                                    plugin: plugin.name,
                                                    error: (0, errors_js_1.errorMessage)(err),
                                                });
                                            }
                                        }
                                        // Store the UNRESOLVED servers on the plugin for caching
                                        // (Environment variables will be resolved fresh each time they're needed)
                                        plugin.mcpServers = servers;
                                        (0, debug_js_1.logForDebugging)("Loaded ".concat(Object.keys(servers).length, " MCP servers from plugin ").concat(plugin.name));
                                        return [2 /*return*/, addPluginScopeToServers(resolvedServers, plugin.name, plugin.source)];
                                }
                            });
                        }); }))];
                case 1:
                    scopedResults = _a.sent();
                    for (_i = 0, scopedResults_1 = scopedResults; _i < scopedResults_1.length; _i++) {
                        scopedServers = scopedResults_1[_i];
                        if (scopedServers) {
                            Object.assign(allServers, scopedServers);
                        }
                    }
                    return [2 /*return*/, allServers];
            }
        });
    });
}
/**
 * Build the userConfig map for a single MCP server by merging the plugin's
 * top-level manifest.userConfig values with the channel-specific per-server
 * config (assistant-mode channels). Channel-specific wins on collision so
 * plugins that declare the same key at both levels get the more specific value.
 *
 * Returns undefined when neither source has anything — resolvePluginMcpEnvironment
 * skips substituteUserConfigVariables in that case.
 */
function buildMcpUserConfig(plugin, serverName) {
    // Gate on manifest.userConfig. loadPluginOptions always returns at least {}
    // (it spreads two `?? {}` fallbacks), so without this guard topLevel is never
    // undefined — the `!topLevel` check below is dead, we return {} for
    // unconfigured plugins, and resolvePluginMcpEnvironment runs
    // substituteUserConfigVariables against an empty map → throws on any
    // ${user_config.X} ref. The manifest check also skips the unconditional
    // keychain read (~50-100ms on macOS) for plugins that don't use options.
    var topLevel = plugin.manifest.userConfig
        ? (0, pluginOptionsStorage_js_1.loadPluginOptions)((0, pluginOptionsStorage_js_1.getPluginStorageId)(plugin))
        : undefined;
    var channelSpecific = loadChannelUserConfig(plugin, serverName);
    if (!topLevel && !channelSpecific)
        return undefined;
    return __assign(__assign({}, topLevel), channelSpecific);
}
/**
 * Resolve environment variables for plugin MCP servers
 * Handles ${CLAUDE_PLUGIN_ROOT}, ${user_config.X}, and general ${VAR} substitution
 * Tracks missing environment variables for error reporting
 */
function resolvePluginMcpEnvironment(config, plugin, userConfig, errors, pluginName, serverName) {
    var allMissingVars = [];
    var resolveValue = function (value) {
        // First substitute plugin-specific variables
        var resolved = (0, pluginOptionsStorage_js_1.substitutePluginVariables)(value, plugin);
        // Then substitute user config variables if provided
        if (userConfig) {
            resolved = (0, pluginOptionsStorage_js_1.substituteUserConfigVariables)(resolved, userConfig);
        }
        // Finally expand general environment variables
        // This is done last so plugin-specific and user config vars take precedence
        var _a = (0, envExpansion_js_1.expandEnvVarsInString)(resolved), expanded = _a.expanded, missingVars = _a.missingVars;
        allMissingVars.push.apply(allMissingVars, missingVars);
        return expanded;
    };
    var resolved;
    // Handle different server types
    switch (config.type) {
        case undefined:
        case 'stdio': {
            var stdioConfig = __assign({}, config);
            // Resolve command path
            if (stdioConfig.command) {
                stdioConfig.command = resolveValue(stdioConfig.command);
            }
            // Resolve args
            if (stdioConfig.args) {
                stdioConfig.args = stdioConfig.args.map(function (arg) { return resolveValue(arg); });
            }
            // Resolve environment variables and add CLAUDE_PLUGIN_ROOT / CLAUDE_PLUGIN_DATA
            var resolvedEnv = __assign({ CLAUDE_PLUGIN_ROOT: plugin.path, CLAUDE_PLUGIN_DATA: (0, pluginDirectories_js_1.getPluginDataDir)(plugin.source) }, (stdioConfig.env || {}));
            for (var _i = 0, _a = Object.entries(resolvedEnv); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                if (key !== 'CLAUDE_PLUGIN_ROOT' && key !== 'CLAUDE_PLUGIN_DATA') {
                    resolvedEnv[key] = resolveValue(value);
                }
            }
            stdioConfig.env = resolvedEnv;
            resolved = stdioConfig;
            break;
        }
        case 'sse':
        case 'http':
        case 'ws': {
            var remoteConfig = __assign({}, config);
            // Resolve URL
            if (remoteConfig.url) {
                remoteConfig.url = resolveValue(remoteConfig.url);
            }
            // Resolve headers
            if (remoteConfig.headers) {
                var resolvedHeaders = {};
                for (var _c = 0, _d = Object.entries(remoteConfig.headers); _c < _d.length; _c++) {
                    var _e = _d[_c], key = _e[0], value = _e[1];
                    resolvedHeaders[key] = resolveValue(value);
                }
                remoteConfig.headers = resolvedHeaders;
            }
            resolved = remoteConfig;
            break;
        }
        // For other types (sse-ide, ws-ide, sdk, claudeai-proxy), pass through unchanged
        case 'sse-ide':
        case 'ws-ide':
        case 'sdk':
        case 'claudeai-proxy':
            resolved = config;
            break;
    }
    // Log and track missing variables if any were found and errors array provided
    if (errors && allMissingVars.length > 0) {
        var uniqueMissingVars = __spreadArray([], new Set(allMissingVars), true);
        var varList = uniqueMissingVars.join(', ');
        (0, debug_js_1.logForDebugging)("Missing environment variables in plugin MCP config: ".concat(varList), { level: 'warn' });
        // Add error to the errors array if plugin and server names are provided
        if (pluginName && serverName) {
            errors.push({
                type: 'mcp-config-invalid',
                source: "plugin:".concat(pluginName),
                plugin: pluginName,
                serverName: serverName,
                validationError: "Missing environment variables: ".concat(varList),
            });
        }
    }
    return resolved;
}
/**
 * Get MCP servers from a specific plugin with environment variable resolution and scoping
 * This function is called when the MCP servers need to be activated and ensures they have
 * the proper environment variables and scope applied
 */
function getPluginMcpServers(plugin_1) {
    return __awaiter(this, arguments, void 0, function (plugin, errors) {
        var servers, _a, resolvedServers, _i, _b, _c, name_4, config, userConfig;
        if (errors === void 0) { errors = []; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!plugin.enabled) {
                        return [2 /*return*/, undefined];
                    }
                    _a = plugin.mcpServers;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, loadPluginMcpServers(plugin, errors)];
                case 1:
                    _a = (_d.sent());
                    _d.label = 2;
                case 2:
                    servers = _a;
                    if (!servers) {
                        return [2 /*return*/, undefined];
                    }
                    resolvedServers = {};
                    for (_i = 0, _b = Object.entries(servers); _i < _b.length; _i++) {
                        _c = _b[_i], name_4 = _c[0], config = _c[1];
                        userConfig = buildMcpUserConfig(plugin, name_4);
                        try {
                            resolvedServers[name_4] = resolvePluginMcpEnvironment(config, plugin, userConfig, errors, plugin.name, name_4);
                        }
                        catch (err) {
                            errors === null || errors === void 0 ? void 0 : errors.push({
                                type: 'generic-error',
                                source: name_4,
                                plugin: plugin.name,
                                error: (0, errors_js_1.errorMessage)(err),
                            });
                        }
                    }
                    // Add plugin scope
                    return [2 /*return*/, addPluginScopeToServers(resolvedServers, plugin.name, plugin.source)];
            }
        });
    });
}
