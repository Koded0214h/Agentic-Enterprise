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
exports.clearAllPluginCaches = clearAllPluginCaches;
exports.clearAllCaches = clearAllCaches;
exports.markPluginVersionOrphaned = markPluginVersionOrphaned;
exports.cleanupOrphanedPluginVersionsInBackground = cleanupOrphanedPluginVersionsInBackground;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var commands_js_1 = require("../../commands.js");
var outputStyles_js_1 = require("../../constants/outputStyles.js");
var loadAgentsDir_js_1 = require("../../tools/AgentTool/loadAgentsDir.js");
var prompt_js_1 = require("../../tools/SkillTool/prompt.js");
var attachments_js_1 = require("../attachments.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var log_js_1 = require("../log.js");
var installedPluginsManager_js_1 = require("./installedPluginsManager.js");
var loadPluginAgents_js_1 = require("./loadPluginAgents.js");
var loadPluginCommands_js_1 = require("./loadPluginCommands.js");
var loadPluginHooks_js_1 = require("./loadPluginHooks.js");
var loadPluginOutputStyles_js_1 = require("./loadPluginOutputStyles.js");
var pluginLoader_js_1 = require("./pluginLoader.js");
var pluginOptionsStorage_js_1 = require("./pluginOptionsStorage.js");
var zipCache_js_1 = require("./zipCache.js");
var ORPHANED_AT_FILENAME = '.orphaned_at';
var CLEANUP_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
function clearAllPluginCaches() {
    (0, pluginLoader_js_1.clearPluginCache)();
    (0, loadPluginCommands_js_1.clearPluginCommandCache)();
    (0, loadPluginAgents_js_1.clearPluginAgentCache)();
    (0, loadPluginHooks_js_1.clearPluginHookCache)();
    // Prune hooks from plugins no longer in the enabled set so uninstalled/
    // disabled plugins stop firing immediately (gh-36995). Prune-only: hooks
    // from newly-enabled plugins are NOT added here — they wait for
    // /reload-plugins like commands/agents/MCP do. Fire-and-forget: old hooks
    // stay valid until the prune completes (preserves gh-29767). No-op when
    // STATE.registeredHooks is empty (test/preload.ts beforeEach clears it via
    // resetStateForTests before reaching here).
    (0, loadPluginHooks_js_1.pruneRemovedPluginHooks)().catch(function (e) { return (0, log_js_1.logError)(e); });
    (0, pluginOptionsStorage_js_1.clearPluginOptionsCache)();
    (0, loadPluginOutputStyles_js_1.clearPluginOutputStyleCache)();
    (0, outputStyles_js_1.clearAllOutputStylesCache)();
}
function clearAllCaches() {
    clearAllPluginCaches();
    (0, commands_js_1.clearCommandsCache)();
    (0, loadAgentsDir_js_1.clearAgentDefinitionsCache)();
    (0, prompt_js_1.clearPromptCache)();
    (0, attachments_js_1.resetSentSkillNames)();
}
/**
 * Mark a plugin version as orphaned.
 * Called when a plugin is uninstalled or updated to a new version.
 */
function markPluginVersionOrphaned(versionPath) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(getOrphanedAtPath(versionPath), "".concat(Date.now()), 'utf-8')];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to write .orphaned_at: ".concat(versionPath, ": ").concat(error_1));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Clean up orphaned plugin versions that have been orphaned for more than 7 days.
 *
 * Pass 1: Remove .orphaned_at from installed versions (clears stale markers)
 * Pass 2: For each cached version not in installed_plugins.json:
 *   - If no .orphaned_at exists: create it (handles old CC versions, manual edits)
 *   - If .orphaned_at exists and > 7 days old: delete the version
 */
function cleanupOrphanedPluginVersionsInBackground() {
    return __awaiter(this, void 0, void 0, function () {
        var installedVersions, cachePath, now, _i, _a, marketplace, marketplacePath, _b, _c, plugin, pluginPath, _d, _e, version, versionPath, error_2;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    // Zip cache mode stores plugins as .zip files, not directories. readSubdirs
                    // filters to directories only, so removeIfEmpty would see plugin dirs as empty
                    // and delete them (including the ZIPs). Skip cleanup entirely in zip mode.
                    if ((0, zipCache_js_1.isPluginZipCacheEnabled)()) {
                        return [2 /*return*/];
                    }
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 18, , 19]);
                    installedVersions = getInstalledVersionPaths();
                    if (!installedVersions)
                        return [2 /*return*/];
                    cachePath = (0, pluginLoader_js_1.getPluginCachePath)();
                    now = Date.now();
                    // Pass 1: Remove .orphaned_at from installed versions
                    // This handles cases where a plugin was reinstalled after being orphaned
                    return [4 /*yield*/, Promise.all(__spreadArray([], installedVersions, true).map(function (p) { return removeOrphanedAtMarker(p); }))
                        // Pass 2: Process orphaned versions
                    ];
                case 2:
                    // Pass 1: Remove .orphaned_at from installed versions
                    // This handles cases where a plugin was reinstalled after being orphaned
                    _f.sent();
                    _i = 0;
                    return [4 /*yield*/, readSubdirs(cachePath)];
                case 3:
                    _a = _f.sent();
                    _f.label = 4;
                case 4:
                    if (!(_i < _a.length)) return [3 /*break*/, 17];
                    marketplace = _a[_i];
                    marketplacePath = (0, path_1.join)(cachePath, marketplace);
                    _b = 0;
                    return [4 /*yield*/, readSubdirs(marketplacePath)];
                case 5:
                    _c = _f.sent();
                    _f.label = 6;
                case 6:
                    if (!(_b < _c.length)) return [3 /*break*/, 14];
                    plugin = _c[_b];
                    pluginPath = (0, path_1.join)(marketplacePath, plugin);
                    _d = 0;
                    return [4 /*yield*/, readSubdirs(pluginPath)];
                case 7:
                    _e = _f.sent();
                    _f.label = 8;
                case 8:
                    if (!(_d < _e.length)) return [3 /*break*/, 11];
                    version = _e[_d];
                    versionPath = (0, path_1.join)(pluginPath, version);
                    if (installedVersions.has(versionPath))
                        return [3 /*break*/, 10];
                    return [4 /*yield*/, processOrphanedPluginVersion(versionPath, now)];
                case 9:
                    _f.sent();
                    _f.label = 10;
                case 10:
                    _d++;
                    return [3 /*break*/, 8];
                case 11: return [4 /*yield*/, removeIfEmpty(pluginPath)];
                case 12:
                    _f.sent();
                    _f.label = 13;
                case 13:
                    _b++;
                    return [3 /*break*/, 6];
                case 14: return [4 /*yield*/, removeIfEmpty(marketplacePath)];
                case 15:
                    _f.sent();
                    _f.label = 16;
                case 16:
                    _i++;
                    return [3 /*break*/, 4];
                case 17: return [3 /*break*/, 19];
                case 18:
                    error_2 = _f.sent();
                    (0, debug_js_1.logForDebugging)("Plugin cache cleanup failed: ".concat(error_2));
                    return [3 /*break*/, 19];
                case 19: return [2 /*return*/];
            }
        });
    });
}
function getOrphanedAtPath(versionPath) {
    return (0, path_1.join)(versionPath, ORPHANED_AT_FILENAME);
}
function removeOrphanedAtMarker(versionPath) {
    return __awaiter(this, void 0, void 0, function () {
        var orphanedAtPath, error_3, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    orphanedAtPath = getOrphanedAtPath(versionPath);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.unlink)(orphanedAtPath)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_3);
                    if (code === 'ENOENT')
                        return [2 /*return*/];
                    (0, debug_js_1.logForDebugging)("Failed to remove .orphaned_at: ".concat(versionPath, ": ").concat(error_3));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getInstalledVersionPaths() {
    try {
        var paths = new Set();
        var diskData = (0, installedPluginsManager_js_1.loadInstalledPluginsFromDisk)();
        for (var _i = 0, _a = Object.values(diskData.plugins); _i < _a.length; _i++) {
            var installations = _a[_i];
            for (var _b = 0, installations_1 = installations; _b < installations_1.length; _b++) {
                var entry = installations_1[_b];
                paths.add(entry.installPath);
            }
        }
        return paths;
    }
    catch (error) {
        (0, debug_js_1.logForDebugging)("Failed to load installed plugins: ".concat(error));
        return null;
    }
}
function processOrphanedPluginVersion(versionPath, now) {
    return __awaiter(this, void 0, void 0, function () {
        var orphanedAtPath, orphanedAt, error_4, code, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    orphanedAtPath = getOrphanedAtPath(versionPath);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 6]);
                    return [4 /*yield*/, (0, promises_1.stat)(orphanedAtPath)];
                case 2:
                    orphanedAt = (_a.sent()).mtimeMs;
                    return [3 /*break*/, 6];
                case 3:
                    error_4 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_4);
                    if (!(code === 'ENOENT')) return [3 /*break*/, 5];
                    return [4 /*yield*/, markPluginVersionOrphaned(versionPath)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
                case 5:
                    (0, debug_js_1.logForDebugging)("Failed to stat orphaned marker: ".concat(versionPath, ": ").concat(error_4));
                    return [2 /*return*/];
                case 6:
                    if (!(now - orphanedAt > CLEANUP_AGE_MS)) return [3 /*break*/, 10];
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, promises_1.rm)(versionPath, { recursive: true, force: true })];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    error_5 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to delete orphaned version: ".concat(versionPath, ": ").concat(error_5));
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function removeIfEmpty(dirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readSubdirs(dirPath)];
                case 1:
                    if (!((_a.sent()).length === 0)) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.rm)(dirPath, { recursive: true, force: true })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_6 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to remove empty dir: ".concat(dirPath, ": ").concat(error_6));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function readSubdirs(dirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var entries, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readdir)(dirPath, { withFileTypes: true })];
                case 1:
                    entries = _b.sent();
                    return [2 /*return*/, entries.filter(function (d) { return d.isDirectory(); }).map(function (d) { return d.name; })];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
