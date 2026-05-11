"use strict";
/**
 * Centralized plugin directory configuration.
 *
 * This module provides the single source of truth for the plugins directory path.
 * It supports switching between 'plugins' and 'cowork_plugins' directories via:
 * - CLI flag: --cowork
 * - Environment variable: CLAUDE_CODE_USE_COWORK_PLUGINS
 *
 * The base directory can be overridden via CLAUDE_CODE_PLUGIN_CACHE_DIR.
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
exports.getPluginsDirectory = getPluginsDirectory;
exports.getPluginSeedDirs = getPluginSeedDirs;
exports.pluginDataDirPath = pluginDataDirPath;
exports.getPluginDataDir = getPluginDataDir;
exports.getPluginDataDirSize = getPluginDataDirSize;
exports.deletePluginDataDir = deletePluginDataDir;
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var debug_js_1 = require("../debug.js");
var envUtils_js_1 = require("../envUtils.js");
var errors_js_1 = require("../errors.js");
var format_js_1 = require("../format.js");
var pathValidation_js_1 = require("../permissions/pathValidation.js");
var PLUGINS_DIR = 'plugins';
var COWORK_PLUGINS_DIR = 'cowork_plugins';
/**
 * Get the plugins directory name based on current mode.
 * Uses session state (from --cowork flag) or env var.
 *
 * Priority:
 * 1. Session state (set by CLI flag --cowork)
 * 2. Environment variable CLAUDE_CODE_USE_COWORK_PLUGINS
 * 3. Default: 'plugins'
 */
function getPluginsDirectoryName() {
    // Session state takes precedence (set by CLI flag)
    if ((0, state_js_1.getUseCoworkPlugins)()) {
        return COWORK_PLUGINS_DIR;
    }
    // Fall back to env var
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_COWORK_PLUGINS)) {
        return COWORK_PLUGINS_DIR;
    }
    return PLUGINS_DIR;
}
/**
 * Get the full path to the plugins directory.
 *
 * Priority:
 * 1. CLAUDE_CODE_PLUGIN_CACHE_DIR env var (explicit override)
 * 2. Default: ~/.claude/plugins or ~/.claude/cowork_plugins
 */
function getPluginsDirectory() {
    // expandTilde: when CLAUDE_CODE_PLUGIN_CACHE_DIR is set via settings.json
    // `env` (not shell), ~ is not expanded by the shell. Without this, a value
    // like "~/.claude/plugins" becomes a literal `~` directory created in the
    // cwd of every project (gh-30794 / CC-212).
    var envOverride = process.env.CLAUDE_CODE_PLUGIN_CACHE_DIR;
    if (envOverride) {
        return (0, pathValidation_js_1.expandTilde)(envOverride);
    }
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), getPluginsDirectoryName());
}
/**
 * Get the read-only plugin seed directories, if configured.
 *
 * Customers can pre-bake a populated plugins directory into their container
 * image and point CLAUDE_CODE_PLUGIN_SEED_DIR at it. CC will use it as a
 * read-only fallback layer under the primary plugins directory — marketplaces
 * and plugin caches found in the seed are used in place without re-cloning.
 *
 * Multiple seed directories can be layered using the platform path delimiter
 * (':' on Unix, ';' on Windows), in PATH-like precedence order — the first
 * seed that contains a given marketplace or plugin cache wins.
 *
 * Seed structure mirrors the primary plugins directory:
 *   $CLAUDE_CODE_PLUGIN_SEED_DIR/
 *     known_marketplaces.json
 *     marketplaces/<name>/...
 *     cache/<marketplace>/<plugin>/<version>/...
 *
 * @returns Absolute paths to seed dirs in precedence order (empty if unset)
 */
function getPluginSeedDirs() {
    // Same tilde-expansion rationale as getPluginsDirectory (gh-30794).
    var raw = process.env.CLAUDE_CODE_PLUGIN_SEED_DIR;
    if (!raw)
        return [];
    return raw.split(path_1.delimiter).filter(Boolean).map(pathValidation_js_1.expandTilde);
}
function sanitizePluginId(pluginId) {
    // Same character class as the install-cache sanitizer (pluginLoader.ts)
    return pluginId.replace(/[^a-zA-Z0-9\-_]/g, '-');
}
/** Pure path — no mkdir. For display (e.g. uninstall dialog). */
function pluginDataDirPath(pluginId) {
    return (0, path_1.join)(getPluginsDirectory(), 'data', sanitizePluginId(pluginId));
}
/**
 * Persistent per-plugin data directory, exposed to plugins as
 * ${CLAUDE_PLUGIN_DATA}. Unlike the version-scoped install cache
 * (${CLAUDE_PLUGIN_ROOT}, which is orphaned and GC'd on every update),
 * this survives plugin updates — only removed on last-scope uninstall.
 *
 * Creates the directory on call (mkdir). The *lazy* behavior is at the
 * substitutePluginVariables call site — the DATA pattern uses function-form
 * .replace() so this isn't invoked unless ${CLAUDE_PLUGIN_DATA} is present
 * (ROOT also uses function-form, but for $-pattern safety, not laziness).
 * Env-var export sites (MCP/LSP server env, hook env) call this eagerly
 * since subprocesses may expect the dir to exist before writing to it.
 *
 * Sync because it's called from substitutePluginVariables (sync, inside
 * String.replace) — making this async would cascade through 6 call sites
 * and their sync iteration loops. One mkdir in plugin-load path is cheap.
 */
function getPluginDataDir(pluginId) {
    var dir = pluginDataDirPath(pluginId);
    (0, fs_1.mkdirSync)(dir, { recursive: true });
    return dir;
}
/**
 * Size of the data dir for the uninstall confirmation prompt. Returns null
 * when the dir is absent or empty so callers can skip the prompt entirely.
 * Recursive walk — not hot-path (only on uninstall).
 */
function getPluginDataDirSize(pluginId) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, bytes, walk, e_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dir = pluginDataDirPath(pluginId);
                    bytes = 0;
                    walk = function (p) { return __awaiter(_this, void 0, void 0, function () {
                        var _i, _a, entry, full, _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _i = 0;
                                    return [4 /*yield*/, (0, promises_1.readdir)(p, { withFileTypes: true })];
                                case 1:
                                    _a = _d.sent();
                                    _d.label = 2;
                                case 2:
                                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                                    entry = _a[_i];
                                    full = (0, path_1.join)(p, entry.name);
                                    if (!entry.isDirectory()) return [3 /*break*/, 4];
                                    return [4 /*yield*/, walk(full)];
                                case 3:
                                    _d.sent();
                                    return [3 /*break*/, 7];
                                case 4:
                                    _d.trys.push([4, 6, , 7]);
                                    _b = bytes;
                                    return [4 /*yield*/, (0, promises_1.stat)(full)];
                                case 5:
                                    bytes = _b + (_d.sent()).size;
                                    return [3 /*break*/, 7];
                                case 6:
                                    _c = _d.sent();
                                    return [3 /*break*/, 7];
                                case 7:
                                    _i++;
                                    return [3 /*break*/, 2];
                                case 8: return [2 /*return*/];
                            }
                        });
                    }); };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, walk(dir)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    if ((0, errors_js_1.isFsInaccessible)(e_1))
                        return [2 /*return*/, null];
                    throw e_1;
                case 4:
                    if (bytes === 0)
                        return [2 /*return*/, null];
                    return [2 /*return*/, { bytes: bytes, human: (0, format_js_1.formatFileSize)(bytes) }];
            }
        });
    });
}
/**
 * Best-effort cleanup on last-scope uninstall. Failure is logged but does
 * not throw — the uninstall itself already succeeded; we don't want a
 * cleanup side-effect surfacing as "uninstall failed". Same rationale as
 * deletePluginOptions (pluginOptionsStorage.ts).
 */
function deletePluginDataDir(pluginId) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dir = pluginDataDirPath(pluginId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.rm)(dir, { recursive: true, force: true })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to delete plugin data dir ".concat(dir, ": ").concat((0, errors_js_1.errorMessage)(e_2)), { level: 'warn' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
