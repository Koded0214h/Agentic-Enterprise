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
exports.doesEnterpriseMcpConfigExist = void 0;
exports.getEnterpriseMcpFilePath = getEnterpriseMcpFilePath;
exports.unwrapCcrProxyUrl = unwrapCcrProxyUrl;
exports.getMcpServerSignature = getMcpServerSignature;
exports.dedupPluginMcpServers = dedupPluginMcpServers;
exports.dedupClaudeAiMcpServers = dedupClaudeAiMcpServers;
exports.filterMcpServersByPolicy = filterMcpServersByPolicy;
exports.addMcpConfig = addMcpConfig;
exports.removeMcpConfig = removeMcpConfig;
exports.getProjectMcpConfigsFromCwd = getProjectMcpConfigsFromCwd;
exports.getMcpConfigsByScope = getMcpConfigsByScope;
exports.getMcpConfigByName = getMcpConfigByName;
exports.getClaudeCodeMcpConfigs = getClaudeCodeMcpConfigs;
exports.getAllMcpConfigs = getAllMcpConfigs;
exports.parseMcpConfig = parseMcpConfig;
exports.parseMcpConfigFromFilePath = parseMcpConfigFromFilePath;
exports.shouldAllowManagedMcpServersOnly = shouldAllowManagedMcpServersOnly;
exports.areMcpConfigsAllowedWithEnterpriseMcpConfig = areMcpConfigsAllowedWithEnterpriseMcpConfig;
exports.isMcpServerDisabled = isMcpServerDisabled;
exports.setMcpServerEnabled = setMcpServerEnabled;
var bun_bundle_1 = require("bun:bundle");
var promises_1 = require("fs/promises");
var mapValues_js_1 = require("lodash-es/mapValues.js");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var platform_js_1 = require("src/utils/platform.js");
var plugin_js_1 = require("../../types/plugin.js");
var common_js_1 = require("../../utils/claudeInChrome/common.js");
var config_js_1 = require("../../utils/config.js");
var cwd_js_1 = require("../../utils/cwd.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var fsOperations_js_1 = require("../../utils/fsOperations.js");
var json_js_1 = require("../../utils/json.js");
var log_js_1 = require("../../utils/log.js");
var mcpPluginIntegration_js_1 = require("../../utils/plugins/mcpPluginIntegration.js");
var pluginLoader_js_1 = require("../../utils/plugins/pluginLoader.js");
var constants_js_1 = require("../../utils/settings/constants.js");
var managedPath_js_1 = require("../../utils/settings/managedPath.js");
var pluginOnlyPolicy_js_1 = require("../../utils/settings/pluginOnlyPolicy.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var types_js_1 = require("../../utils/settings/types.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var index_js_1 = require("../analytics/index.js");
var claudeai_js_1 = require("./claudeai.js");
var envExpansion_js_1 = require("./envExpansion.js");
var types_js_2 = require("./types.js");
var utils_js_1 = require("./utils.js");
/**
 * Get the path to the managed MCP configuration file
 */
function getEnterpriseMcpFilePath() {
    return (0, path_1.join)((0, managedPath_js_1.getManagedFilePath)(), 'managed-mcp.json');
}
/**
 * Internal utility: Add scope to server configs
 */
function addScopeToServers(servers, scope) {
    if (!servers) {
        return {};
    }
    var scopedServers = {};
    for (var _i = 0, _a = Object.entries(servers); _i < _a.length; _i++) {
        var _b = _a[_i], name_1 = _b[0], config = _b[1];
        scopedServers[name_1] = __assign(__assign({}, config), { scope: scope });
    }
    return scopedServers;
}
/**
 * Internal utility: Write MCP config to .mcp.json file.
 * Preserves file permissions and flushes to disk before rename.
 * Uses the original path for rename (does not follow symlinks).
 */
function writeMcpjsonFile(config) {
    return __awaiter(this, void 0, void 0, function () {
        var mcpJsonPath, existingMode, stats, e_1, code, tempPath, handle, e_2, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mcpJsonPath = (0, path_1.join)((0, cwd_js_1.getCwd)(), '.mcp.json');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(mcpJsonPath)];
                case 2:
                    stats = _b.sent();
                    existingMode = stats.mode;
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (code !== 'ENOENT') {
                        throw e_1;
                    }
                    return [3 /*break*/, 4];
                case 4:
                    tempPath = "".concat(mcpJsonPath, ".tmp.").concat(process.pid, ".").concat(Date.now());
                    return [4 /*yield*/, (0, promises_1.open)(tempPath, 'w', existingMode !== null && existingMode !== void 0 ? existingMode : 420)];
                case 5:
                    handle = _b.sent();
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, , 9, 11]);
                    return [4 /*yield*/, handle.writeFile((0, slowOperations_js_1.jsonStringify)(config, null, 2), {
                            encoding: 'utf8',
                        })];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, handle.datasync()];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, handle.close()];
                case 10:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 11:
                    _b.trys.push([11, 15, , 20]);
                    if (!(existingMode !== undefined)) return [3 /*break*/, 13];
                    return [4 /*yield*/, (0, promises_1.chmod)(tempPath, existingMode)];
                case 12:
                    _b.sent();
                    _b.label = 13;
                case 13: return [4 /*yield*/, (0, promises_1.rename)(tempPath, mcpJsonPath)];
                case 14:
                    _b.sent();
                    return [3 /*break*/, 20];
                case 15:
                    e_2 = _b.sent();
                    _b.label = 16;
                case 16:
                    _b.trys.push([16, 18, , 19]);
                    return [4 /*yield*/, (0, promises_1.unlink)(tempPath)];
                case 17:
                    _b.sent();
                    return [3 /*break*/, 19];
                case 18:
                    _a = _b.sent();
                    return [3 /*break*/, 19];
                case 19: throw e_2;
                case 20: return [2 /*return*/];
            }
        });
    });
}
/**
 * Extract command array from server config (stdio servers only)
 * Returns null for non-stdio servers
 */
function getServerCommandArray(config) {
    var _a;
    // Non-stdio servers don't have commands
    if (config.type !== undefined && config.type !== 'stdio') {
        return null;
    }
    var stdioConfig = config;
    return __spreadArray([stdioConfig.command], ((_a = stdioConfig.args) !== null && _a !== void 0 ? _a : []), true);
}
/**
 * Check if two command arrays match exactly
 */
function commandArraysMatch(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every(function (val, idx) { return val === b[idx]; });
}
/**
 * Extract URL from server config (remote servers only)
 * Returns null for stdio/sdk servers
 */
function getServerUrl(config) {
    return 'url' in config ? config.url : null;
}
/**
 * CCR proxy URL path markers. In remote sessions, claude.ai connectors arrive
 * via --mcp-config with URLs rewritten to route through the CCR/session-ingress
 * SHTTP proxy. The original vendor URL is preserved in the mcp_url query param
 * so the proxy knows where to forward. See api-go/ccr/internal/ccrshared/
 * mcp_url_rewriter.go and api-go/ccr/internal/mcpproxy/proxy.go.
 */
var CCR_PROXY_PATH_MARKERS = [
    '/v2/session_ingress/shttp/mcp/',
    '/v2/ccr-sessions/',
];
/**
 * If the URL is a CCR proxy URL, extract the original vendor URL from the
 * mcp_url query parameter. Otherwise return the URL unchanged. This lets
 * signature-based dedup match a plugin's raw vendor URL against a connector's
 * rewritten proxy URL when both point at the same MCP server.
 */
function unwrapCcrProxyUrl(url) {
    if (!CCR_PROXY_PATH_MARKERS.some(function (m) { return url.includes(m); })) {
        return url;
    }
    try {
        var parsed = new URL(url);
        var original = parsed.searchParams.get('mcp_url');
        return original || url;
    }
    catch (_a) {
        return url;
    }
}
/**
 * Compute a dedup signature for an MCP server config.
 * Two configs with the same signature are considered "the same server" for
 * plugin deduplication. Ignores env (plugins always inject CLAUDE_PLUGIN_ROOT)
 * and headers (same URL = same server regardless of auth).
 * Returns null only for configs with neither command nor url (sdk type).
 */
function getMcpServerSignature(config) {
    var cmd = getServerCommandArray(config);
    if (cmd) {
        return "stdio:".concat((0, slowOperations_js_1.jsonStringify)(cmd));
    }
    var url = getServerUrl(config);
    if (url) {
        return "url:".concat(unwrapCcrProxyUrl(url));
    }
    return null;
}
/**
 * Filter plugin MCP servers, dropping any whose signature matches a
 * manually-configured server or an earlier-loaded plugin server.
 * Manual wins over plugin; between plugins, first-loaded wins.
 *
 * Plugin servers are namespaced `plugin:name:server` so they never key-collide
 * with manual servers in the merge — this content-based check catches the case
 * where both actually launch the same underlying process/connection.
 */
function dedupPluginMcpServers(pluginServers, manualServers) {
    // Map signature -> server name so we can report which server a dup matches
    var manualSigs = new Map();
    for (var _i = 0, _a = Object.entries(manualServers); _i < _a.length; _i++) {
        var _b = _a[_i], name_2 = _b[0], config = _b[1];
        var sig = getMcpServerSignature(config);
        if (sig && !manualSigs.has(sig))
            manualSigs.set(sig, name_2);
    }
    var servers = {};
    var suppressed = [];
    var seenPluginSigs = new Map();
    for (var _c = 0, _d = Object.entries(pluginServers); _c < _d.length; _c++) {
        var _e = _d[_c], name_3 = _e[0], config = _e[1];
        var sig = getMcpServerSignature(config);
        if (sig === null) {
            servers[name_3] = config;
            continue;
        }
        var manualDup = manualSigs.get(sig);
        if (manualDup !== undefined) {
            (0, debug_js_1.logForDebugging)("Suppressing plugin MCP server \"".concat(name_3, "\": duplicates manually-configured \"").concat(manualDup, "\""));
            suppressed.push({ name: name_3, duplicateOf: manualDup });
            continue;
        }
        var pluginDup = seenPluginSigs.get(sig);
        if (pluginDup !== undefined) {
            (0, debug_js_1.logForDebugging)("Suppressing plugin MCP server \"".concat(name_3, "\": duplicates earlier plugin server \"").concat(pluginDup, "\""));
            suppressed.push({ name: name_3, duplicateOf: pluginDup });
            continue;
        }
        seenPluginSigs.set(sig, name_3);
        servers[name_3] = config;
    }
    return { servers: servers, suppressed: suppressed };
}
/**
 * Filter claude.ai connectors, dropping any whose signature matches an enabled
 * manually-configured server. Manual wins: a user who wrote .mcp.json or ran
 * `claude mcp add` expressed higher intent than a connector toggled in the web UI.
 *
 * Connector keys are `claude.ai <DisplayName>` so they never key-collide with
 * manual servers in the merge — this content-based check catches the case where
 * both point at the same underlying URL (e.g. `mcp__slack__*` and
 * `mcp__claude_ai_Slack__*` both hitting mcp.slack.com, ~600 chars/turn wasted).
 *
 * Only enabled manual servers count as dedup targets — a disabled manual server
 * mustn't suppress its connector twin, or neither runs.
 */
function dedupClaudeAiMcpServers(claudeAiServers, manualServers) {
    var manualSigs = new Map();
    for (var _i = 0, _a = Object.entries(manualServers); _i < _a.length; _i++) {
        var _b = _a[_i], name_4 = _b[0], config = _b[1];
        if (isMcpServerDisabled(name_4))
            continue;
        var sig = getMcpServerSignature(config);
        if (sig && !manualSigs.has(sig))
            manualSigs.set(sig, name_4);
    }
    var servers = {};
    var suppressed = [];
    for (var _c = 0, _d = Object.entries(claudeAiServers); _c < _d.length; _c++) {
        var _e = _d[_c], name_5 = _e[0], config = _e[1];
        var sig = getMcpServerSignature(config);
        var manualDup = sig !== null ? manualSigs.get(sig) : undefined;
        if (manualDup !== undefined) {
            (0, debug_js_1.logForDebugging)("Suppressing claude.ai connector \"".concat(name_5, "\": duplicates manually-configured \"").concat(manualDup, "\""));
            suppressed.push({ name: name_5, duplicateOf: manualDup });
            continue;
        }
        servers[name_5] = config;
    }
    return { servers: servers, suppressed: suppressed };
}
/**
 * Convert a URL pattern with wildcards to a RegExp
 * Supports * as wildcard matching any characters
 * Examples:
 *   "https://example.com/*" matches "https://example.com/api/v1"
 *   "https://*.example.com/*" matches "https://api.example.com/path"
 *   "https://example.com:*\/*" matches any port
 */
function urlPatternToRegex(pattern) {
    // Escape regex special characters except *
    var escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    // Replace * with regex equivalent (match any characters)
    var regexStr = escaped.replace(/\*/g, '.*');
    return new RegExp("^".concat(regexStr, "$"));
}
/**
 * Check if a URL matches a pattern with wildcard support
 */
function urlMatchesPattern(url, pattern) {
    var regex = urlPatternToRegex(pattern);
    return regex.test(url);
}
/**
 * Get the settings to use for MCP server allowlist policy.
 * When allowManagedMcpServersOnly is set in policySettings, only managed settings
 * control which servers are allowed. Otherwise, returns merged settings.
 */
function getMcpAllowlistSettings() {
    var _a;
    if (shouldAllowManagedMcpServersOnly()) {
        return (_a = (0, settings_js_1.getSettingsForSource)('policySettings')) !== null && _a !== void 0 ? _a : {};
    }
    return (0, settings_js_1.getInitialSettings)();
}
/**
 * Get the settings to use for MCP server denylist policy.
 * Denylists always merge from all sources — users can always deny servers
 * for themselves, even when allowManagedMcpServersOnly is set.
 */
function getMcpDenylistSettings() {
    return (0, settings_js_1.getInitialSettings)();
}
/**
 * Check if an MCP server is denied by enterprise policy
 * Checks name-based, command-based, and URL-based restrictions
 * @param serverName The name of the server to check
 * @param config Optional server config for command/URL-based matching
 * @returns true if denied, false if not on denylist
 */
function isMcpServerDenied(serverName, config) {
    var settings = getMcpDenylistSettings();
    if (!settings.deniedMcpServers) {
        return false; // No restrictions
    }
    // Check name-based denial
    for (var _i = 0, _a = settings.deniedMcpServers; _i < _a.length; _i++) {
        var entry = _a[_i];
        if ((0, types_js_1.isMcpServerNameEntry)(entry) && entry.serverName === serverName) {
            return true;
        }
    }
    // Check command-based denial (stdio servers only) and URL-based denial (remote servers only)
    if (config) {
        var serverCommand = getServerCommandArray(config);
        if (serverCommand) {
            for (var _b = 0, _c = settings.deniedMcpServers; _b < _c.length; _b++) {
                var entry = _c[_b];
                if ((0, types_js_1.isMcpServerCommandEntry)(entry) &&
                    commandArraysMatch(entry.serverCommand, serverCommand)) {
                    return true;
                }
            }
        }
        var serverUrl = getServerUrl(config);
        if (serverUrl) {
            for (var _d = 0, _e = settings.deniedMcpServers; _d < _e.length; _d++) {
                var entry = _e[_d];
                if ((0, types_js_1.isMcpServerUrlEntry)(entry) &&
                    urlMatchesPattern(serverUrl, entry.serverUrl)) {
                    return true;
                }
            }
        }
    }
    return false;
}
/**
 * Check if an MCP server is allowed by enterprise policy
 * Checks name-based, command-based, and URL-based restrictions
 * @param serverName The name of the server to check
 * @param config Optional server config for command/URL-based matching
 * @returns true if allowed, false if blocked by policy
 */
function isMcpServerAllowedByPolicy(serverName, config) {
    // Denylist takes absolute precedence
    if (isMcpServerDenied(serverName, config)) {
        return false;
    }
    var settings = getMcpAllowlistSettings();
    if (!settings.allowedMcpServers) {
        return true; // No allowlist restrictions (undefined)
    }
    // Empty allowlist means block all servers
    if (settings.allowedMcpServers.length === 0) {
        return false;
    }
    // Check if allowlist contains any command-based or URL-based entries
    var hasCommandEntries = settings.allowedMcpServers.some(types_js_1.isMcpServerCommandEntry);
    var hasUrlEntries = settings.allowedMcpServers.some(types_js_1.isMcpServerUrlEntry);
    if (config) {
        var serverCommand = getServerCommandArray(config);
        var serverUrl = getServerUrl(config);
        if (serverCommand) {
            // This is a stdio server
            if (hasCommandEntries) {
                // If ANY serverCommand entries exist, stdio servers MUST match one of them
                for (var _i = 0, _a = settings.allowedMcpServers; _i < _a.length; _i++) {
                    var entry = _a[_i];
                    if ((0, types_js_1.isMcpServerCommandEntry)(entry) &&
                        commandArraysMatch(entry.serverCommand, serverCommand)) {
                        return true;
                    }
                }
                return false; // Stdio server doesn't match any command entry
            }
            else {
                // No command entries, check name-based allowance
                for (var _b = 0, _c = settings.allowedMcpServers; _b < _c.length; _b++) {
                    var entry = _c[_b];
                    if ((0, types_js_1.isMcpServerNameEntry)(entry) && entry.serverName === serverName) {
                        return true;
                    }
                }
                return false;
            }
        }
        else if (serverUrl) {
            // This is a remote server (sse, http, ws, etc.)
            if (hasUrlEntries) {
                // If ANY serverUrl entries exist, remote servers MUST match one of them
                for (var _d = 0, _e = settings.allowedMcpServers; _d < _e.length; _d++) {
                    var entry = _e[_d];
                    if ((0, types_js_1.isMcpServerUrlEntry)(entry) &&
                        urlMatchesPattern(serverUrl, entry.serverUrl)) {
                        return true;
                    }
                }
                return false; // Remote server doesn't match any URL entry
            }
            else {
                // No URL entries, check name-based allowance
                for (var _f = 0, _g = settings.allowedMcpServers; _f < _g.length; _f++) {
                    var entry = _g[_f];
                    if ((0, types_js_1.isMcpServerNameEntry)(entry) && entry.serverName === serverName) {
                        return true;
                    }
                }
                return false;
            }
        }
        else {
            // Unknown server type - check name-based allowance only
            for (var _h = 0, _j = settings.allowedMcpServers; _h < _j.length; _h++) {
                var entry = _j[_h];
                if ((0, types_js_1.isMcpServerNameEntry)(entry) && entry.serverName === serverName) {
                    return true;
                }
            }
            return false;
        }
    }
    // No config provided - check name-based allowance only
    for (var _k = 0, _l = settings.allowedMcpServers; _k < _l.length; _k++) {
        var entry = _l[_k];
        if ((0, types_js_1.isMcpServerNameEntry)(entry) && entry.serverName === serverName) {
            return true;
        }
    }
    return false;
}
/**
 * Filter a record of MCP server configs by managed policy (allowedMcpServers /
 * deniedMcpServers). Servers blocked by policy are dropped and their names
 * returned so callers can warn the user.
 *
 * Intended for user-controlled config entry points that bypass the policy filter
 * in getClaudeCodeMcpConfigs(): --mcp-config (main.tsx) and the mcp_set_servers
 * control message (print.ts, SDK V2 Query.setMcpServers()).
 *
 * SDK-type servers are exempt — they are SDK-managed transport placeholders,
 * not CLI-managed connections. The CLI never spawns a process or opens a
 * network connection for them; tool calls route back to the SDK via
 * mcp_tool_call. URL/command-based allowlist entries are meaningless for them
 * (no url, no command), and gating by name would silently drop them during
 * installPluginsAndApplyMcpInBackground's sdkMcpConfigs carry-forward.
 *
 * The generic has no type constraint because the two callsites use different
 * config type families: main.tsx uses ScopedMcpServerConfig (service type,
 * args: string[] required), print.ts uses McpServerConfigForProcessTransport
 * (SDK wire type, args?: string[] optional). Both are structurally compatible
 * with what isMcpServerAllowedByPolicy actually reads (type/url/command/args)
 * — the policy check only reads, never requires any field to be present.
 * The `as McpServerConfig` widening is safe for that reason; the downstream
 * checks tolerate missing/undefined fields: `config` is optional, and
 * `getServerCommandArray` defaults `args` to `[]` via `?? []`.
 */
function filterMcpServersByPolicy(configs) {
    var allowed = {};
    var blocked = [];
    for (var _i = 0, _a = Object.entries(configs); _i < _a.length; _i++) {
        var _b = _a[_i], name_6 = _b[0], config = _b[1];
        var c = config;
        if (c.type === 'sdk' || isMcpServerAllowedByPolicy(name_6, c)) {
            allowed[name_6] = config;
        }
        else {
            blocked.push(name_6);
        }
    }
    return { allowed: allowed, blocked: blocked };
}
/**
 * Internal utility: Expands environment variables in an MCP server config
 */
function expandEnvVars(config) {
    var missingVars = [];
    function expandString(str) {
        var _a = (0, envExpansion_js_1.expandEnvVarsInString)(str), expanded = _a.expanded, vars = _a.missingVars;
        missingVars.push.apply(missingVars, vars);
        return expanded;
    }
    var expanded;
    switch (config.type) {
        case undefined:
        case 'stdio': {
            var stdioConfig = config;
            expanded = __assign(__assign({}, stdioConfig), { command: expandString(stdioConfig.command), args: stdioConfig.args.map(expandString), env: stdioConfig.env
                    ? (0, mapValues_js_1.default)(stdioConfig.env, expandString)
                    : undefined });
            break;
        }
        case 'sse':
        case 'http':
        case 'ws': {
            var remoteConfig = config;
            expanded = __assign(__assign({}, remoteConfig), { url: expandString(remoteConfig.url), headers: remoteConfig.headers
                    ? (0, mapValues_js_1.default)(remoteConfig.headers, expandString)
                    : undefined });
            break;
        }
        case 'sse-ide':
        case 'ws-ide':
            expanded = config;
            break;
        case 'sdk':
            expanded = config;
            break;
        case 'claudeai-proxy':
            expanded = config;
            break;
    }
    return {
        expanded: expanded,
        missingVars: __spreadArray([], new Set(missingVars), true),
    };
}
/**
 * Add a new MCP server configuration
 * @param name The name of the server
 * @param config The server configuration
 * @param scope The configuration scope
 * @throws Error if name is invalid or server already exists, or if the config is invalid
 */
function addMcpConfig(name, config, scope) {
    return __awaiter(this, void 0, void 0, function () {
        var isComputerUseMCPServer, result, formattedErrors, validatedConfig, servers, globalConfig, projectConfig, _a, existingServers, mcpServers, _i, _b, _c, serverName, serverConfig, _1, configWithoutScope, mcpConfig, error_1;
        var _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (name.match(/[^a-zA-Z0-9_-]/)) {
                        throw new Error("Invalid name ".concat(name, ". Names can only contain letters, numbers, hyphens, and underscores."));
                    }
                    // Block reserved server name "claude-in-chrome"
                    if ((0, common_js_1.isClaudeInChromeMCPServer)(name)) {
                        throw new Error("Cannot add MCP server \"".concat(name, "\": this name is reserved."));
                    }
                    if (!(0, bun_bundle_1.feature)('CHICAGO_MCP')) return [3 /*break*/, 2];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../utils/computerUse/common.js'); })];
                case 1:
                    isComputerUseMCPServer = (_f.sent()).isComputerUseMCPServer;
                    if (isComputerUseMCPServer(name)) {
                        throw new Error("Cannot add MCP server \"".concat(name, "\": this name is reserved."));
                    }
                    _f.label = 2;
                case 2:
                    // Block adding servers when enterprise MCP config exists (it has exclusive control)
                    if ((0, exports.doesEnterpriseMcpConfigExist)()) {
                        throw new Error("Cannot add MCP server: enterprise MCP configuration is active and has exclusive control over MCP servers");
                    }
                    result = (0, types_js_2.McpServerConfigSchema)().safeParse(config);
                    if (!result.success) {
                        formattedErrors = result.error.issues
                            .map(function (err) { return "".concat(err.path.join('.'), ": ").concat(err.message); })
                            .join(', ');
                        throw new Error("Invalid configuration: ".concat(formattedErrors));
                    }
                    validatedConfig = result.data;
                    // Check denylist (with config for command-based checks)
                    if (isMcpServerDenied(name, validatedConfig)) {
                        throw new Error("Cannot add MCP server \"".concat(name, "\": server is explicitly blocked by enterprise policy"));
                    }
                    // Check allowlist (with config for command-based checks)
                    if (!isMcpServerAllowedByPolicy(name, validatedConfig)) {
                        throw new Error("Cannot add MCP server \"".concat(name, "\": not allowed by enterprise policy"));
                    }
                    // Check if server already exists in the target scope
                    switch (scope) {
                        case 'project': {
                            servers = getProjectMcpConfigsFromCwd().servers;
                            if (servers[name]) {
                                throw new Error("MCP server ".concat(name, " already exists in .mcp.json"));
                            }
                            break;
                        }
                        case 'user': {
                            globalConfig = (0, config_js_1.getGlobalConfig)();
                            if ((_d = globalConfig.mcpServers) === null || _d === void 0 ? void 0 : _d[name]) {
                                throw new Error("MCP server ".concat(name, " already exists in user config"));
                            }
                            break;
                        }
                        case 'local': {
                            projectConfig = (0, config_js_1.getCurrentProjectConfig)();
                            if ((_e = projectConfig.mcpServers) === null || _e === void 0 ? void 0 : _e[name]) {
                                throw new Error("MCP server ".concat(name, " already exists in local config"));
                            }
                            break;
                        }
                        case 'dynamic':
                            throw new Error('Cannot add MCP server to scope: dynamic');
                        case 'enterprise':
                            throw new Error('Cannot add MCP server to scope: enterprise');
                        case 'claudeai':
                            throw new Error('Cannot add MCP server to scope: claudeai');
                    }
                    _a = scope;
                    switch (_a) {
                        case 'project': return [3 /*break*/, 3];
                        case 'user': return [3 /*break*/, 8];
                        case 'local': return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 10];
                case 3:
                    existingServers = getProjectMcpConfigsFromCwd().servers;
                    mcpServers = {};
                    for (_i = 0, _b = Object.entries(existingServers); _i < _b.length; _i++) {
                        _c = _b[_i], serverName = _c[0], serverConfig = _c[1];
                        _1 = serverConfig.scope, configWithoutScope = __rest(serverConfig, ["scope"]);
                        mcpServers[serverName] = configWithoutScope;
                    }
                    mcpServers[name] = validatedConfig;
                    mcpConfig = { mcpServers: mcpServers };
                    _f.label = 4;
                case 4:
                    _f.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, writeMcpjsonFile(mcpConfig)];
                case 5:
                    _f.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _f.sent();
                    throw new Error("Failed to write to .mcp.json: ".concat(error_1));
                case 7: return [3 /*break*/, 11];
                case 8:
                    {
                        (0, config_js_1.saveGlobalConfig)(function (current) {
                            var _a;
                            return (__assign(__assign({}, current), { mcpServers: __assign(__assign({}, current.mcpServers), (_a = {}, _a[name] = validatedConfig, _a)) }));
                        });
                        return [3 /*break*/, 11];
                    }
                    _f.label = 9;
                case 9:
                    {
                        (0, config_js_1.saveCurrentProjectConfig)(function (current) {
                            var _a;
                            return (__assign(__assign({}, current), { mcpServers: __assign(__assign({}, current.mcpServers), (_a = {}, _a[name] = validatedConfig, _a)) }));
                        });
                        return [3 /*break*/, 11];
                    }
                    _f.label = 10;
                case 10: throw new Error("Cannot add MCP server to scope: ".concat(scope));
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Remove an MCP server configuration
 * @param name The name of the server to remove
 * @param scope The configuration scope
 * @throws Error if server not found in specified scope
 */
function removeMcpConfig(name, scope) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, existingServers, mcpServers, _i, _b, _c, serverName, serverConfig, _2, configWithoutScope, mcpConfig, error_2, config, config;
        var _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _a = scope;
                    switch (_a) {
                        case 'project': return [3 /*break*/, 1];
                        case 'user': return [3 /*break*/, 6];
                        case 'local': return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 8];
                case 1:
                    existingServers = getProjectMcpConfigsFromCwd().servers;
                    if (!existingServers[name]) {
                        throw new Error("No MCP server found with name: ".concat(name, " in .mcp.json"));
                    }
                    mcpServers = {};
                    for (_i = 0, _b = Object.entries(existingServers); _i < _b.length; _i++) {
                        _c = _b[_i], serverName = _c[0], serverConfig = _c[1];
                        if (serverName !== name) {
                            _2 = serverConfig.scope, configWithoutScope = __rest(serverConfig, ["scope"]);
                            mcpServers[serverName] = configWithoutScope;
                        }
                    }
                    mcpConfig = { mcpServers: mcpServers };
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, writeMcpjsonFile(mcpConfig)];
                case 3:
                    _f.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _f.sent();
                    throw new Error("Failed to remove from .mcp.json: ".concat(error_2));
                case 5: return [3 /*break*/, 9];
                case 6:
                    {
                        config = (0, config_js_1.getGlobalConfig)();
                        if (!((_d = config.mcpServers) === null || _d === void 0 ? void 0 : _d[name])) {
                            throw new Error("No user-scoped MCP server found with name: ".concat(name));
                        }
                        (0, config_js_1.saveGlobalConfig)(function (current) {
                            var _a;
                            var _b = (_a = current.mcpServers) !== null && _a !== void 0 ? _a : {}, _c = name, _ = _b[_c], restMcpServers = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);
                            return __assign(__assign({}, current), { mcpServers: restMcpServers });
                        });
                        return [3 /*break*/, 9];
                    }
                    _f.label = 7;
                case 7:
                    {
                        config = (0, config_js_1.getCurrentProjectConfig)();
                        if (!((_e = config.mcpServers) === null || _e === void 0 ? void 0 : _e[name])) {
                            throw new Error("No project-local MCP server found with name: ".concat(name));
                        }
                        (0, config_js_1.saveCurrentProjectConfig)(function (current) {
                            var _a;
                            var _b = (_a = current.mcpServers) !== null && _a !== void 0 ? _a : {}, _c = name, _ = _b[_c], restMcpServers = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);
                            return __assign(__assign({}, current), { mcpServers: restMcpServers });
                        });
                        return [3 /*break*/, 9];
                    }
                    _f.label = 8;
                case 8: throw new Error("Cannot remove MCP server from scope: ".concat(scope));
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get MCP configs from current directory only (no parent traversal).
 * Used by addMcpConfig and removeMcpConfig to modify the local .mcp.json file.
 * Exported for testing purposes.
 *
 * @returns Servers with scope information and any validation errors from current directory's .mcp.json
 */
function getProjectMcpConfigsFromCwd() {
    // Check if project source is enabled
    if (!(0, constants_js_1.isSettingSourceEnabled)('projectSettings')) {
        return { servers: {}, errors: [] };
    }
    var mcpJsonPath = (0, path_1.join)((0, cwd_js_1.getCwd)(), '.mcp.json');
    var _a = parseMcpConfigFromFilePath({
        filePath: mcpJsonPath,
        expandVars: true,
        scope: 'project',
    }), config = _a.config, errors = _a.errors;
    // Missing .mcp.json is expected, but malformed files should report errors
    if (!config) {
        var nonMissingErrors = errors.filter(function (e) { return !e.message.startsWith('MCP config file not found'); });
        if (nonMissingErrors.length > 0) {
            (0, debug_js_1.logForDebugging)("MCP config errors for ".concat(mcpJsonPath, ": ").concat((0, slowOperations_js_1.jsonStringify)(nonMissingErrors.map(function (e) { return e.message; }))), { level: 'error' });
            return { servers: {}, errors: nonMissingErrors };
        }
        return { servers: {}, errors: [] };
    }
    return {
        servers: config.mcpServers
            ? addScopeToServers(config.mcpServers, 'project')
            : {},
        errors: errors || [],
    };
}
/**
 * Get all MCP configurations from a specific scope
 * @param scope The configuration scope
 * @returns Servers with scope information and any validation errors
 */
function getMcpConfigsByScope(scope) {
    // Check if this source is enabled
    var sourceMap = {
        project: 'projectSettings',
        user: 'userSettings',
        local: 'localSettings',
    };
    if (scope in sourceMap && !(0, constants_js_1.isSettingSourceEnabled)(sourceMap[scope])) {
        return { servers: {}, errors: [] };
    }
    switch (scope) {
        case 'project': {
            var allServers = {};
            var allErrors = [];
            // Build list of directories to check
            var dirs = [];
            var currentDir = (0, cwd_js_1.getCwd)();
            while (currentDir !== (0, path_1.parse)(currentDir).root) {
                dirs.push(currentDir);
                currentDir = (0, path_1.dirname)(currentDir);
            }
            // Process from root downward to CWD (so closer files have higher priority)
            for (var _i = 0, _a = dirs.reverse(); _i < _a.length; _i++) {
                var dir = _a[_i];
                var mcpJsonPath = (0, path_1.join)(dir, '.mcp.json');
                var _b = parseMcpConfigFromFilePath({
                    filePath: mcpJsonPath,
                    expandVars: true,
                    scope: 'project',
                }), config = _b.config, errors = _b.errors;
                // Missing .mcp.json in parent directories is expected, but malformed files should report errors
                if (!config) {
                    var nonMissingErrors = errors.filter(function (e) { return !e.message.startsWith('MCP config file not found'); });
                    if (nonMissingErrors.length > 0) {
                        (0, debug_js_1.logForDebugging)("MCP config errors for ".concat(mcpJsonPath, ": ").concat((0, slowOperations_js_1.jsonStringify)(nonMissingErrors.map(function (e) { return e.message; }))), { level: 'error' });
                        allErrors.push.apply(allErrors, nonMissingErrors);
                    }
                    continue;
                }
                if (config.mcpServers) {
                    // Merge servers, with files closer to CWD overriding parent configs
                    Object.assign(allServers, addScopeToServers(config.mcpServers, scope));
                }
                if (errors.length > 0) {
                    allErrors.push.apply(allErrors, errors);
                }
            }
            return {
                servers: allServers,
                errors: allErrors,
            };
        }
        case 'user': {
            var mcpServers = (0, config_js_1.getGlobalConfig)().mcpServers;
            if (!mcpServers) {
                return { servers: {}, errors: [] };
            }
            var _c = parseMcpConfig({
                configObject: { mcpServers: mcpServers },
                expandVars: true,
                scope: 'user',
            }), config = _c.config, errors = _c.errors;
            return {
                servers: addScopeToServers(config === null || config === void 0 ? void 0 : config.mcpServers, scope),
                errors: errors,
            };
        }
        case 'local': {
            var mcpServers = (0, config_js_1.getCurrentProjectConfig)().mcpServers;
            if (!mcpServers) {
                return { servers: {}, errors: [] };
            }
            var _d = parseMcpConfig({
                configObject: { mcpServers: mcpServers },
                expandVars: true,
                scope: 'local',
            }), config = _d.config, errors = _d.errors;
            return {
                servers: addScopeToServers(config === null || config === void 0 ? void 0 : config.mcpServers, scope),
                errors: errors,
            };
        }
        case 'enterprise': {
            var enterpriseMcpPath = getEnterpriseMcpFilePath();
            var _e = parseMcpConfigFromFilePath({
                filePath: enterpriseMcpPath,
                expandVars: true,
                scope: 'enterprise',
            }), config = _e.config, errors = _e.errors;
            // Missing enterprise config file is expected, but malformed files should report errors
            if (!config) {
                var nonMissingErrors = errors.filter(function (e) { return !e.message.startsWith('MCP config file not found'); });
                if (nonMissingErrors.length > 0) {
                    (0, debug_js_1.logForDebugging)("Enterprise MCP config errors for ".concat(enterpriseMcpPath, ": ").concat((0, slowOperations_js_1.jsonStringify)(nonMissingErrors.map(function (e) { return e.message; }))), { level: 'error' });
                    return { servers: {}, errors: nonMissingErrors };
                }
                return { servers: {}, errors: [] };
            }
            return {
                servers: addScopeToServers(config.mcpServers, scope),
                errors: errors,
            };
        }
    }
}
/**
 * Get an MCP server configuration by name
 * @param name The name of the server
 * @returns The server configuration with scope, or undefined if not found
 */
function getMcpConfigByName(name) {
    var _a;
    var enterpriseServers = getMcpConfigsByScope('enterprise').servers;
    // When MCP is locked to plugin-only, only enterprise servers are reachable
    // by name. User/project/local servers are blocked — same as getClaudeCodeMcpConfigs().
    if ((0, pluginOnlyPolicy_js_1.isRestrictedToPluginOnly)('mcp')) {
        return (_a = enterpriseServers[name]) !== null && _a !== void 0 ? _a : null;
    }
    var userServers = getMcpConfigsByScope('user').servers;
    var projectServers = getMcpConfigsByScope('project').servers;
    var localServers = getMcpConfigsByScope('local').servers;
    if (enterpriseServers[name]) {
        return enterpriseServers[name];
    }
    if (localServers[name]) {
        return localServers[name];
    }
    if (projectServers[name]) {
        return projectServers[name];
    }
    if (userServers[name]) {
        return userServers[name];
    }
    return null;
}
/**
 * Get Claude Code MCP configurations (excludes claude.ai servers from the
 * returned set — they're fetched separately and merged by callers).
 * This is fast: only local file reads; no awaited network calls on the
 * critical path. The optional extraDedupTargets promise (e.g. the in-flight
 * claude.ai connector fetch) is awaited only after loadAllPluginsCacheOnly() completes,
 * so the two overlap rather than serialize.
 * @returns Claude Code server configurations with appropriate scopes
 */
function getClaudeCodeMcpConfigs() {
    return __awaiter(this, arguments, void 0, function (dynamicServers, extraDedupTargets) {
        var enterpriseServers, filtered_1, _i, _a, _b, name_7, serverConfig, mcpLocked, noServers, userServers, projectServers, localServers, pluginMcpServers, pluginResult, mcpErrors, _c, _d, error, errorMessage, errorType, pluginServerResults, _e, pluginServerResults_1, servers, _f, mcpErrors_1, error, errorMessage, approvedProjectServers, _g, _h, _j, name_8, config, extraTargets, enabledManualServers, _k, _l, _m, name_9, config, enabledPluginServers, disabledPluginServers, _o, _p, _q, name_10, config, _r, dedupedPluginServers, suppressed, _s, suppressed_1, _t, name_11, duplicateOf, parts, configs, filtered, _u, _v, _w, name_12, serverConfig;
        if (dynamicServers === void 0) { dynamicServers = {}; }
        if (extraDedupTargets === void 0) { extraDedupTargets = Promise.resolve({}); }
        return __generator(this, function (_x) {
            switch (_x.label) {
                case 0:
                    enterpriseServers = getMcpConfigsByScope('enterprise').servers;
                    // If an enterprise mcp config exists, do not use any others; this has exclusive control over all MCP servers
                    // (enterprise customers often do not want their users to be able to add their own MCP servers).
                    if ((0, exports.doesEnterpriseMcpConfigExist)()) {
                        filtered_1 = {};
                        for (_i = 0, _a = Object.entries(enterpriseServers); _i < _a.length; _i++) {
                            _b = _a[_i], name_7 = _b[0], serverConfig = _b[1];
                            if (!isMcpServerAllowedByPolicy(name_7, serverConfig)) {
                                continue;
                            }
                            filtered_1[name_7] = serverConfig;
                        }
                        return [2 /*return*/, { servers: filtered_1, errors: [] }];
                    }
                    mcpLocked = (0, pluginOnlyPolicy_js_1.isRestrictedToPluginOnly)('mcp');
                    noServers = {
                        servers: {},
                    };
                    userServers = (mcpLocked
                        ? noServers
                        : getMcpConfigsByScope('user')).servers;
                    projectServers = (mcpLocked
                        ? noServers
                        : getMcpConfigsByScope('project')).servers;
                    localServers = (mcpLocked
                        ? noServers
                        : getMcpConfigsByScope('local')).servers;
                    pluginMcpServers = {};
                    return [4 /*yield*/, (0, pluginLoader_js_1.loadAllPluginsCacheOnly)()
                        // Collect MCP-specific errors during server loading
                    ];
                case 1:
                    pluginResult = _x.sent();
                    mcpErrors = [];
                    // Log any plugin loading errors - NEVER silently fail in production
                    if (pluginResult.errors.length > 0) {
                        for (_c = 0, _d = pluginResult.errors; _c < _d.length; _c++) {
                            error = _d[_c];
                            // Only log as MCP error if it's actually MCP-related
                            // Otherwise just log as debug since the plugin might not have MCP servers
                            if (error.type === 'mcp-config-invalid' ||
                                error.type === 'mcpb-download-failed' ||
                                error.type === 'mcpb-extract-failed' ||
                                error.type === 'mcpb-invalid-manifest') {
                                errorMessage = "Plugin MCP loading error - ".concat(error.type, ": ").concat((0, plugin_js_1.getPluginErrorMessage)(error));
                                (0, log_js_1.logError)(new Error(errorMessage));
                            }
                            else {
                                errorType = error.type;
                                (0, debug_js_1.logForDebugging)("Plugin not available for MCP: ".concat(error.source, " - error type: ").concat(errorType));
                            }
                        }
                    }
                    return [4 /*yield*/, Promise.all(pluginResult.enabled.map(function (plugin) { return (0, mcpPluginIntegration_js_1.getPluginMcpServers)(plugin, mcpErrors); }))];
                case 2:
                    pluginServerResults = _x.sent();
                    for (_e = 0, pluginServerResults_1 = pluginServerResults; _e < pluginServerResults_1.length; _e++) {
                        servers = pluginServerResults_1[_e];
                        if (servers) {
                            Object.assign(pluginMcpServers, servers);
                        }
                    }
                    // Add any MCP-specific errors from server loading to plugin errors
                    if (mcpErrors.length > 0) {
                        for (_f = 0, mcpErrors_1 = mcpErrors; _f < mcpErrors_1.length; _f++) {
                            error = mcpErrors_1[_f];
                            errorMessage = "Plugin MCP server error - ".concat(error.type, ": ").concat((0, plugin_js_1.getPluginErrorMessage)(error));
                            (0, log_js_1.logError)(new Error(errorMessage));
                        }
                    }
                    approvedProjectServers = {};
                    for (_g = 0, _h = Object.entries(projectServers); _g < _h.length; _g++) {
                        _j = _h[_g], name_8 = _j[0], config = _j[1];
                        if ((0, utils_js_1.getProjectMcpServerStatus)(name_8) === 'approved') {
                            approvedProjectServers[name_8] = config;
                        }
                    }
                    return [4 /*yield*/, extraDedupTargets];
                case 3:
                    extraTargets = _x.sent();
                    enabledManualServers = {};
                    for (_k = 0, _l = Object.entries(__assign(__assign(__assign(__assign(__assign({}, userServers), approvedProjectServers), localServers), dynamicServers), extraTargets)); _k < _l.length; _k++) {
                        _m = _l[_k], name_9 = _m[0], config = _m[1];
                        if (!isMcpServerDisabled(name_9) &&
                            isMcpServerAllowedByPolicy(name_9, config)) {
                            enabledManualServers[name_9] = config;
                        }
                    }
                    enabledPluginServers = {};
                    disabledPluginServers = {};
                    for (_o = 0, _p = Object.entries(pluginMcpServers); _o < _p.length; _o++) {
                        _q = _p[_o], name_10 = _q[0], config = _q[1];
                        if (isMcpServerDisabled(name_10) ||
                            !isMcpServerAllowedByPolicy(name_10, config)) {
                            disabledPluginServers[name_10] = config;
                        }
                        else {
                            enabledPluginServers[name_10] = config;
                        }
                    }
                    _r = dedupPluginMcpServers(enabledPluginServers, enabledManualServers), dedupedPluginServers = _r.servers, suppressed = _r.suppressed;
                    Object.assign(dedupedPluginServers, disabledPluginServers);
                    // Surface suppressions in /plugin UI. Pushed AFTER the logError loop above
                    // so these don't go to the error log — they're informational, not errors.
                    for (_s = 0, suppressed_1 = suppressed; _s < suppressed_1.length; _s++) {
                        _t = suppressed_1[_s], name_11 = _t.name, duplicateOf = _t.duplicateOf;
                        parts = name_11.split(':');
                        if (parts[0] !== 'plugin' || parts.length < 3)
                            continue;
                        mcpErrors.push({
                            type: 'mcp-server-suppressed-duplicate',
                            source: name_11,
                            plugin: parts[1],
                            serverName: parts.slice(2).join(':'),
                            duplicateOf: duplicateOf,
                        });
                    }
                    configs = Object.assign({}, dedupedPluginServers, userServers, approvedProjectServers, localServers);
                    filtered = {};
                    for (_u = 0, _v = Object.entries(configs); _u < _v.length; _u++) {
                        _w = _v[_u], name_12 = _w[0], serverConfig = _w[1];
                        if (!isMcpServerAllowedByPolicy(name_12, serverConfig)) {
                            continue;
                        }
                        filtered[name_12] = serverConfig;
                    }
                    return [2 /*return*/, { servers: filtered, errors: mcpErrors }];
            }
        });
    });
}
/**
 * Get all MCP configurations across all scopes, including claude.ai servers.
 * This may be slow due to network calls - use getClaudeCodeMcpConfigs() for fast startup.
 * @returns All server configurations with appropriate scopes
 */
function getAllMcpConfigs() {
    return __awaiter(this, void 0, void 0, function () {
        var claudeaiPromise, _a, claudeCodeServers, errors, claudeaiMcpServers, _b, dedupedClaudeAi, servers;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // In enterprise mode, don't load claude.ai servers (enterprise has exclusive control)
                    if ((0, exports.doesEnterpriseMcpConfigExist)()) {
                        return [2 /*return*/, getClaudeCodeMcpConfigs()];
                    }
                    claudeaiPromise = (0, claudeai_js_1.fetchClaudeAIMcpConfigsIfEligible)();
                    return [4 /*yield*/, getClaudeCodeMcpConfigs({}, claudeaiPromise)];
                case 1:
                    _a = _c.sent(), claudeCodeServers = _a.servers, errors = _a.errors;
                    _b = filterMcpServersByPolicy;
                    return [4 /*yield*/, claudeaiPromise];
                case 2:
                    claudeaiMcpServers = _b.apply(void 0, [_c.sent()]).allowed;
                    dedupedClaudeAi = dedupClaudeAiMcpServers(claudeaiMcpServers, claudeCodeServers).servers;
                    servers = Object.assign({}, dedupedClaudeAi, claudeCodeServers);
                    return [2 /*return*/, { servers: servers, errors: errors }];
            }
        });
    });
}
/**
 * Parse and validate an MCP configuration object
 * @param params Parsing parameters
 * @returns Validated configuration with any errors
 */
function parseMcpConfig(params) {
    var configObject = params.configObject, expandVars = params.expandVars, scope = params.scope, filePath = params.filePath;
    var schemaResult = (0, types_js_2.McpJsonConfigSchema)().safeParse(configObject);
    if (!schemaResult.success) {
        return {
            config: null,
            errors: schemaResult.error.issues.map(function (issue) { return (__assign(__assign({}, (filePath && { file: filePath })), { path: issue.path.join('.'), message: 'Does not adhere to MCP server configuration schema', mcpErrorMetadata: {
                    scope: scope,
                    severity: 'fatal',
                } })); }),
        };
    }
    // Validate each server and expand variables if requested
    var errors = [];
    var validatedServers = {};
    for (var _i = 0, _a = Object.entries(schemaResult.data.mcpServers); _i < _a.length; _i++) {
        var _b = _a[_i], name_13 = _b[0], config = _b[1];
        var configToCheck = config;
        if (expandVars) {
            var _c = expandEnvVars(config), expanded = _c.expanded, missingVars = _c.missingVars;
            if (missingVars.length > 0) {
                errors.push(__assign(__assign({}, (filePath && { file: filePath })), { path: "mcpServers.".concat(name_13), message: "Missing environment variables: ".concat(missingVars.join(', ')), suggestion: "Set the following environment variables: ".concat(missingVars.join(', ')), mcpErrorMetadata: {
                        scope: scope,
                        serverName: name_13,
                        severity: 'warning',
                    } }));
            }
            configToCheck = expanded;
        }
        // Check for Windows-specific npx usage without cmd wrapper
        if ((0, platform_js_1.getPlatform)() === 'windows' &&
            (!configToCheck.type || configToCheck.type === 'stdio') &&
            (configToCheck.command === 'npx' ||
                configToCheck.command.endsWith('\\npx') ||
                configToCheck.command.endsWith('/npx'))) {
            errors.push(__assign(__assign({}, (filePath && { file: filePath })), { path: "mcpServers.".concat(name_13), message: "Windows requires 'cmd /c' wrapper to execute npx", suggestion: "Change command to \"cmd\" with args [\"/c\", \"npx\", ...]. See: https://code.claude.com/docs/en/mcp#configure-mcp-servers", mcpErrorMetadata: {
                    scope: scope,
                    serverName: name_13,
                    severity: 'warning',
                } }));
        }
        validatedServers[name_13] = configToCheck;
    }
    return {
        config: { mcpServers: validatedServers },
        errors: errors,
    };
}
/**
 * Parse and validate an MCP configuration from a file path
 * @param params Parsing parameters
 * @returns Validated configuration with any errors
 */
function parseMcpConfigFromFilePath(params) {
    var filePath = params.filePath, expandVars = params.expandVars, scope = params.scope;
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var configContent;
    try {
        configContent = fs.readFileSync(filePath, { encoding: 'utf8' });
    }
    catch (error) {
        var code = (0, errors_js_1.getErrnoCode)(error);
        if (code === 'ENOENT') {
            return {
                config: null,
                errors: [
                    {
                        file: filePath,
                        path: '',
                        message: "MCP config file not found: ".concat(filePath),
                        suggestion: 'Check that the file path is correct',
                        mcpErrorMetadata: {
                            scope: scope,
                            severity: 'fatal',
                        },
                    },
                ],
            };
        }
        (0, debug_js_1.logForDebugging)("MCP config read error for ".concat(filePath, " (scope=").concat(scope, "): ").concat(error), { level: 'error' });
        return {
            config: null,
            errors: [
                {
                    file: filePath,
                    path: '',
                    message: "Failed to read file: ".concat(error),
                    suggestion: 'Check file permissions and ensure the file exists',
                    mcpErrorMetadata: {
                        scope: scope,
                        severity: 'fatal',
                    },
                },
            ],
        };
    }
    var parsedJson = (0, json_js_1.safeParseJSON)(configContent);
    if (!parsedJson) {
        (0, debug_js_1.logForDebugging)("MCP config is not valid JSON: ".concat(filePath, " (scope=").concat(scope, ", length=").concat(configContent.length, ", first100=").concat((0, slowOperations_js_1.jsonStringify)(configContent.slice(0, 100)), ")"), { level: 'error' });
        return {
            config: null,
            errors: [
                {
                    file: filePath,
                    path: '',
                    message: "MCP config is not a valid JSON",
                    suggestion: 'Fix the JSON syntax errors in the file',
                    mcpErrorMetadata: {
                        scope: scope,
                        severity: 'fatal',
                    },
                },
            ],
        };
    }
    return parseMcpConfig({
        configObject: parsedJson,
        expandVars: expandVars,
        scope: scope,
        filePath: filePath,
    });
}
exports.doesEnterpriseMcpConfigExist = (0, memoize_js_1.default)(function () {
    var config = parseMcpConfigFromFilePath({
        filePath: getEnterpriseMcpFilePath(),
        expandVars: true,
        scope: 'enterprise',
    }).config;
    return config !== null;
});
/**
 * Check if MCP allowlist policy should only come from managed settings.
 * This is true when policySettings has allowManagedMcpServersOnly: true.
 * When enabled, allowedMcpServers is read exclusively from managed settings.
 * Users can still add their own MCP servers and deny servers via deniedMcpServers.
 */
function shouldAllowManagedMcpServersOnly() {
    var _a;
    return (((_a = (0, settings_js_1.getSettingsForSource)('policySettings')) === null || _a === void 0 ? void 0 : _a.allowManagedMcpServersOnly) === true);
}
/**
 * Check if all MCP servers in a config are allowed with enterprise MCP config.
 */
function areMcpConfigsAllowedWithEnterpriseMcpConfig(configs) {
    // NOTE: While all SDK MCP servers should be safe from a security perspective, we are still discussing
    // what the best way to do this is. In the meantime, we are limiting this to claude-vscode for now to
    // unbreak the VSCode extension for certain enterprise customers who have enterprise MCP config enabled.
    // https://anthropic.slack.com/archives/C093UA0KLD7/p1764975463670109
    return Object.values(configs).every(function (c) { return c.type === 'sdk' && c.name === 'claude-vscode'; });
}
/**
 * Built-in MCP server that defaults to disabled. Unlike user-configured servers
 * (opt-out via disabledMcpServers), this requires explicit opt-in via
 * enabledMcpServers. Shows up in /mcp as disabled until the user enables it.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
var DEFAULT_DISABLED_BUILTIN = (0, bun_bundle_1.feature)('CHICAGO_MCP')
    ? require('../../utils/computerUse/common.js').COMPUTER_USE_MCP_SERVER_NAME
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
function isDefaultDisabledBuiltin(name) {
    return DEFAULT_DISABLED_BUILTIN !== null && name === DEFAULT_DISABLED_BUILTIN;
}
/**
 * Check if an MCP server is disabled
 * @param name The name of the server
 * @returns true if the server is disabled
 */
function isMcpServerDisabled(name) {
    var projectConfig = (0, config_js_1.getCurrentProjectConfig)();
    if (isDefaultDisabledBuiltin(name)) {
        var enabledServers = projectConfig.enabledMcpServers || [];
        return !enabledServers.includes(name);
    }
    var disabledServers = projectConfig.disabledMcpServers || [];
    return disabledServers.includes(name);
}
function toggleMembership(list, name, shouldContain) {
    var contains = list.includes(name);
    if (contains === shouldContain)
        return list;
    return shouldContain ? __spreadArray(__spreadArray([], list, true), [name], false) : list.filter(function (s) { return s !== name; });
}
/**
 * Enable or disable an MCP server
 * @param name The name of the server
 * @param enabled Whether the server should be enabled
 */
function setMcpServerEnabled(name, enabled) {
    var isBuiltinStateChange = isDefaultDisabledBuiltin(name) && isMcpServerDisabled(name) === enabled;
    (0, config_js_1.saveCurrentProjectConfig)(function (current) {
        if (isDefaultDisabledBuiltin(name)) {
            var prev_1 = current.enabledMcpServers || [];
            var next_1 = toggleMembership(prev_1, name, enabled);
            if (next_1 === prev_1)
                return current;
            return __assign(__assign({}, current), { enabledMcpServers: next_1 });
        }
        var prev = current.disabledMcpServers || [];
        var next = toggleMembership(prev, name, !enabled);
        if (next === prev)
            return current;
        return __assign(__assign({}, current), { disabledMcpServers: next });
    });
    if (isBuiltinStateChange) {
        (0, index_js_1.logEvent)('tengu_builtin_mcp_toggle', {
            serverName: name,
            enabled: enabled,
        });
    }
}
