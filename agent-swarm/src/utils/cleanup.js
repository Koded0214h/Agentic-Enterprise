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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCleanupResults = addCleanupResults;
exports.convertFileNameToDate = convertFileNameToDate;
exports.cleanupOldMessageFiles = cleanupOldMessageFiles;
exports.cleanupOldSessionFiles = cleanupOldSessionFiles;
exports.cleanupOldPlanFiles = cleanupOldPlanFiles;
exports.cleanupOldFileHistoryBackups = cleanupOldFileHistoryBackups;
exports.cleanupOldSessionEnvDirs = cleanupOldSessionEnvDirs;
exports.cleanupOldDebugLogs = cleanupOldDebugLogs;
exports.cleanupNpmCacheForAnthropicPackages = cleanupNpmCacheForAnthropicPackages;
exports.cleanupOldVersionsThrottled = cleanupOldVersionsThrottled;
exports.cleanupOldMessageFilesInBackground = cleanupOldMessageFilesInBackground;
var fs = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var index_js_1 = require("../services/analytics/index.js");
var cachePaths_js_1 = require("./cachePaths.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var fsOperations_js_1 = require("./fsOperations.js");
var imageStore_js_1 = require("./imageStore.js");
var lockfile = require("./lockfile.js");
var log_js_1 = require("./log.js");
var index_js_2 = require("./nativeInstaller/index.js");
var pasteStore_js_1 = require("./pasteStore.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
var allErrors_js_1 = require("./settings/allErrors.js");
var settings_js_1 = require("./settings/settings.js");
var toolResultStorage_js_1 = require("./toolResultStorage.js");
var worktree_js_1 = require("./worktree.js");
var DEFAULT_CLEANUP_PERIOD_DAYS = 30;
function getCutoffDate() {
    var _a;
    var settings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
    var cleanupPeriodDays = (_a = settings.cleanupPeriodDays) !== null && _a !== void 0 ? _a : DEFAULT_CLEANUP_PERIOD_DAYS;
    var cleanupPeriodMs = cleanupPeriodDays * 24 * 60 * 60 * 1000;
    return new Date(Date.now() - cleanupPeriodMs);
}
function addCleanupResults(a, b) {
    return {
        messages: a.messages + b.messages,
        errors: a.errors + b.errors,
    };
}
function convertFileNameToDate(filename) {
    var isoStr = filename
        .split('.')[0]
        .replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/, 'T$1:$2:$3.$4Z');
    return new Date(isoStr);
}
function cleanupOldFilesInDirectory(dirPath, cutoffDate, isMessagePath) {
    return __awaiter(this, void 0, void 0, function () {
        var result, files, _i, files_1, file, timestamp, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = { messages: 0, errors: 0 };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().readdir(dirPath)];
                case 2:
                    files = _a.sent();
                    _i = 0, files_1 = files;
                    _a.label = 3;
                case 3:
                    if (!(_i < files_1.length)) return [3 /*break*/, 9];
                    file = files_1[_i];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 7, , 8]);
                    timestamp = convertFileNameToDate(file.name);
                    if (!(timestamp < cutoffDate)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().unlink((0, path_1.join)(dirPath, file.name))
                        // Increment the appropriate counter
                    ];
                case 5:
                    _a.sent();
                    // Increment the appropriate counter
                    if (isMessagePath) {
                        result.messages++;
                    }
                    else {
                        result.errors++;
                    }
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    // Log but continue processing other files
                    (0, log_js_1.logError)(error_1);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 3];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_2 = _a.sent();
                    // Ignore if directory doesn't exist
                    if (error_2 instanceof Error && 'code' in error_2 && error_2.code !== 'ENOENT') {
                        (0, log_js_1.logError)(error_2);
                    }
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/, result];
            }
        });
    });
}
function cleanupOldMessageFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var fsImpl, cutoffDate, errorPath, baseCachePath, result, dirents, _a, mcpLogDirs, _i, mcpLogDirs_1, mcpLogDir, _b, _c, error_3;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    fsImpl = (0, fsOperations_js_1.getFsImplementation)();
                    cutoffDate = getCutoffDate();
                    errorPath = cachePaths_js_1.CACHE_PATHS.errors();
                    baseCachePath = cachePaths_js_1.CACHE_PATHS.baseLogs();
                    return [4 /*yield*/, cleanupOldFilesInDirectory(errorPath, cutoffDate, false)
                        // Clean up MCP logs
                    ];
                case 1:
                    result = _d.sent();
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 12, , 13]);
                    dirents = void 0;
                    _d.label = 3;
                case 3:
                    _d.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, fsImpl.readdir(baseCachePath)];
                case 4:
                    dirents = _d.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _d.sent();
                    return [2 /*return*/, result];
                case 6:
                    mcpLogDirs = dirents
                        .filter(function (dirent) { return dirent.isDirectory() && dirent.name.startsWith('mcp-logs-'); })
                        .map(function (dirent) { return (0, path_1.join)(baseCachePath, dirent.name); });
                    _i = 0, mcpLogDirs_1 = mcpLogDirs;
                    _d.label = 7;
                case 7:
                    if (!(_i < mcpLogDirs_1.length)) return [3 /*break*/, 11];
                    mcpLogDir = mcpLogDirs_1[_i];
                    _b = addCleanupResults;
                    _c = [result];
                    return [4 /*yield*/, cleanupOldFilesInDirectory(mcpLogDir, cutoffDate, true)];
                case 8:
                    // Clean up files in MCP log directory
                    result = _b.apply(void 0, _c.concat([_d.sent()]));
                    return [4 /*yield*/, tryRmdir(mcpLogDir, fsImpl)];
                case 9:
                    _d.sent();
                    _d.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 7];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_3 = _d.sent();
                    if (error_3 instanceof Error && 'code' in error_3 && error_3.code !== 'ENOENT') {
                        (0, log_js_1.logError)(error_3);
                    }
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/, result];
            }
        });
    });
}
function unlinkIfOld(filePath, cutoffDate, fsImpl) {
    return __awaiter(this, void 0, void 0, function () {
        var stats;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fsImpl.stat(filePath)];
                case 1:
                    stats = _a.sent();
                    if (!(stats.mtime < cutoffDate)) return [3 /*break*/, 3];
                    return [4 /*yield*/, fsImpl.unlink(filePath)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3: return [2 /*return*/, false];
            }
        });
    });
}
function tryRmdir(dirPath, fsImpl) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fsImpl.rmdir(dirPath)];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function cleanupOldSessionFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var cutoffDate, result, projectsDir, fsImpl, projectDirents, _a, _i, projectDirents_1, projectDirent, projectDir, entries, _b, _c, entries_1, entry, _d, sessionDir, toolResultsDir, toolDirs, _e, _f, toolDirs_1, toolEntry, _g, toolDirPath, toolFiles, _h, _j, toolFiles_1, tf, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    cutoffDate = getCutoffDate();
                    result = { messages: 0, errors: 0 };
                    projectsDir = (0, sessionStorage_js_1.getProjectsDir)();
                    fsImpl = (0, fsOperations_js_1.getFsImplementation)();
                    _l.label = 1;
                case 1:
                    _l.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fsImpl.readdir(projectsDir)];
                case 2:
                    projectDirents = _l.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _l.sent();
                    return [2 /*return*/, result];
                case 4:
                    _i = 0, projectDirents_1 = projectDirents;
                    _l.label = 5;
                case 5:
                    if (!(_i < projectDirents_1.length)) return [3 /*break*/, 46];
                    projectDirent = projectDirents_1[_i];
                    if (!projectDirent.isDirectory())
                        return [3 /*break*/, 45];
                    projectDir = (0, path_1.join)(projectsDir, projectDirent.name);
                    entries = void 0;
                    _l.label = 6;
                case 6:
                    _l.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, fsImpl.readdir(projectDir)];
                case 7:
                    entries = _l.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _b = _l.sent();
                    result.errors++;
                    return [3 /*break*/, 45];
                case 9:
                    _c = 0, entries_1 = entries;
                    _l.label = 10;
                case 10:
                    if (!(_c < entries_1.length)) return [3 /*break*/, 43];
                    entry = entries_1[_c];
                    if (!entry.isFile()) return [3 /*break*/, 15];
                    if (!entry.name.endsWith('.jsonl') && !entry.name.endsWith('.cast')) {
                        return [3 /*break*/, 42];
                    }
                    _l.label = 11;
                case 11:
                    _l.trys.push([11, 13, , 14]);
                    return [4 /*yield*/, unlinkIfOld((0, path_1.join)(projectDir, entry.name), cutoffDate, fsImpl)];
                case 12:
                    if (_l.sent()) {
                        result.messages++;
                    }
                    return [3 /*break*/, 14];
                case 13:
                    _d = _l.sent();
                    result.errors++;
                    return [3 /*break*/, 14];
                case 14: return [3 /*break*/, 42];
                case 15:
                    if (!entry.isDirectory()) return [3 /*break*/, 42];
                    sessionDir = (0, path_1.join)(projectDir, entry.name);
                    toolResultsDir = (0, path_1.join)(sessionDir, toolResultStorage_js_1.TOOL_RESULTS_SUBDIR);
                    toolDirs = void 0;
                    _l.label = 16;
                case 16:
                    _l.trys.push([16, 18, , 20]);
                    return [4 /*yield*/, fsImpl.readdir(toolResultsDir)];
                case 17:
                    toolDirs = _l.sent();
                    return [3 /*break*/, 20];
                case 18:
                    _e = _l.sent();
                    // No tool-results dir — still try to remove an empty session dir
                    return [4 /*yield*/, tryRmdir(sessionDir, fsImpl)];
                case 19:
                    // No tool-results dir — still try to remove an empty session dir
                    _l.sent();
                    return [3 /*break*/, 42];
                case 20:
                    _f = 0, toolDirs_1 = toolDirs;
                    _l.label = 21;
                case 21:
                    if (!(_f < toolDirs_1.length)) return [3 /*break*/, 39];
                    toolEntry = toolDirs_1[_f];
                    if (!toolEntry.isFile()) return [3 /*break*/, 26];
                    _l.label = 22;
                case 22:
                    _l.trys.push([22, 24, , 25]);
                    return [4 /*yield*/, unlinkIfOld((0, path_1.join)(toolResultsDir, toolEntry.name), cutoffDate, fsImpl)];
                case 23:
                    if (_l.sent()) {
                        result.messages++;
                    }
                    return [3 /*break*/, 25];
                case 24:
                    _g = _l.sent();
                    result.errors++;
                    return [3 /*break*/, 25];
                case 25: return [3 /*break*/, 38];
                case 26:
                    if (!toolEntry.isDirectory()) return [3 /*break*/, 38];
                    toolDirPath = (0, path_1.join)(toolResultsDir, toolEntry.name);
                    toolFiles = void 0;
                    _l.label = 27;
                case 27:
                    _l.trys.push([27, 29, , 30]);
                    return [4 /*yield*/, fsImpl.readdir(toolDirPath)];
                case 28:
                    toolFiles = _l.sent();
                    return [3 /*break*/, 30];
                case 29:
                    _h = _l.sent();
                    return [3 /*break*/, 38];
                case 30:
                    _j = 0, toolFiles_1 = toolFiles;
                    _l.label = 31;
                case 31:
                    if (!(_j < toolFiles_1.length)) return [3 /*break*/, 36];
                    tf = toolFiles_1[_j];
                    if (!tf.isFile())
                        return [3 /*break*/, 35];
                    _l.label = 32;
                case 32:
                    _l.trys.push([32, 34, , 35]);
                    return [4 /*yield*/, unlinkIfOld((0, path_1.join)(toolDirPath, tf.name), cutoffDate, fsImpl)];
                case 33:
                    if (_l.sent()) {
                        result.messages++;
                    }
                    return [3 /*break*/, 35];
                case 34:
                    _k = _l.sent();
                    result.errors++;
                    return [3 /*break*/, 35];
                case 35:
                    _j++;
                    return [3 /*break*/, 31];
                case 36: return [4 /*yield*/, tryRmdir(toolDirPath, fsImpl)];
                case 37:
                    _l.sent();
                    _l.label = 38;
                case 38:
                    _f++;
                    return [3 /*break*/, 21];
                case 39: return [4 /*yield*/, tryRmdir(toolResultsDir, fsImpl)];
                case 40:
                    _l.sent();
                    return [4 /*yield*/, tryRmdir(sessionDir, fsImpl)];
                case 41:
                    _l.sent();
                    _l.label = 42;
                case 42:
                    _c++;
                    return [3 /*break*/, 10];
                case 43: return [4 /*yield*/, tryRmdir(projectDir, fsImpl)];
                case 44:
                    _l.sent();
                    _l.label = 45;
                case 45:
                    _i++;
                    return [3 /*break*/, 5];
                case 46: return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Generic helper for cleaning up old files in a single directory
 * @param dirPath Path to the directory to clean
 * @param extension File extension to filter (e.g., '.md', '.jsonl')
 * @param removeEmptyDir Whether to remove the directory if empty after cleanup
 */
function cleanupSingleDirectory(dirPath_1, extension_1) {
    return __awaiter(this, arguments, void 0, function (dirPath, extension, removeEmptyDir) {
        var cutoffDate, result, fsImpl, dirents, _a, _i, dirents_1, dirent, _b;
        if (removeEmptyDir === void 0) { removeEmptyDir = true; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cutoffDate = getCutoffDate();
                    result = { messages: 0, errors: 0 };
                    fsImpl = (0, fsOperations_js_1.getFsImplementation)();
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fsImpl.readdir(dirPath)];
                case 2:
                    dirents = _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [2 /*return*/, result];
                case 4:
                    _i = 0, dirents_1 = dirents;
                    _c.label = 5;
                case 5:
                    if (!(_i < dirents_1.length)) return [3 /*break*/, 10];
                    dirent = dirents_1[_i];
                    if (!dirent.isFile() || !dirent.name.endsWith(extension))
                        return [3 /*break*/, 9];
                    _c.label = 6;
                case 6:
                    _c.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, unlinkIfOld((0, path_1.join)(dirPath, dirent.name), cutoffDate, fsImpl)];
                case 7:
                    if (_c.sent()) {
                        result.messages++;
                    }
                    return [3 /*break*/, 9];
                case 8:
                    _b = _c.sent();
                    result.errors++;
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 5];
                case 10:
                    if (!removeEmptyDir) return [3 /*break*/, 12];
                    return [4 /*yield*/, tryRmdir(dirPath, fsImpl)];
                case 11:
                    _c.sent();
                    _c.label = 12;
                case 12: return [2 /*return*/, result];
            }
        });
    });
}
function cleanupOldPlanFiles() {
    var plansDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'plans');
    return cleanupSingleDirectory(plansDir, '.md');
}
function cleanupOldFileHistoryBackups() {
    return __awaiter(this, void 0, void 0, function () {
        var cutoffDate, result, fsImpl, configDir, fileHistoryStorageDir_1, dirents, _a, fileHistorySessionsDirs, error_4;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cutoffDate = getCutoffDate();
                    result = { messages: 0, errors: 0 };
                    fsImpl = (0, fsOperations_js_1.getFsImplementation)();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, , 9]);
                    configDir = (0, envUtils_js_1.getClaudeConfigHomeDir)();
                    fileHistoryStorageDir_1 = (0, path_1.join)(configDir, 'file-history');
                    dirents = void 0;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fsImpl.readdir(fileHistoryStorageDir_1)];
                case 3:
                    dirents = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, result];
                case 5:
                    fileHistorySessionsDirs = dirents
                        .filter(function (dirent) { return dirent.isDirectory(); })
                        .map(function (dirent) { return (0, path_1.join)(fileHistoryStorageDir_1, dirent.name); });
                    return [4 /*yield*/, Promise.all(fileHistorySessionsDirs.map(function (fileHistorySessionDir) { return __awaiter(_this, void 0, void 0, function () {
                            var stats, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 4, , 5]);
                                        return [4 /*yield*/, fsImpl.stat(fileHistorySessionDir)];
                                    case 1:
                                        stats = _b.sent();
                                        if (!(stats.mtime < cutoffDate)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, fsImpl.rm(fileHistorySessionDir, {
                                                recursive: true,
                                                force: true,
                                            })];
                                    case 2:
                                        _b.sent();
                                        result.messages++;
                                        _b.label = 3;
                                    case 3: return [3 /*break*/, 5];
                                    case 4:
                                        _a = _b.sent();
                                        result.errors++;
                                        return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, tryRmdir(fileHistoryStorageDir_1, fsImpl)];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_4 = _b.sent();
                    (0, log_js_1.logError)(error_4);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/, result];
            }
        });
    });
}
function cleanupOldSessionEnvDirs() {
    return __awaiter(this, void 0, void 0, function () {
        var cutoffDate, result, fsImpl, configDir, sessionEnvBaseDir_1, dirents, _a, sessionEnvDirs, _i, sessionEnvDirs_1, sessionEnvDir, stats, _b, error_5;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cutoffDate = getCutoffDate();
                    result = { messages: 0, errors: 0 };
                    fsImpl = (0, fsOperations_js_1.getFsImplementation)();
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 15, , 16]);
                    configDir = (0, envUtils_js_1.getClaudeConfigHomeDir)();
                    sessionEnvBaseDir_1 = (0, path_1.join)(configDir, 'session-env');
                    dirents = void 0;
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fsImpl.readdir(sessionEnvBaseDir_1)];
                case 3:
                    dirents = _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    return [2 /*return*/, result];
                case 5:
                    sessionEnvDirs = dirents
                        .filter(function (dirent) { return dirent.isDirectory(); })
                        .map(function (dirent) { return (0, path_1.join)(sessionEnvBaseDir_1, dirent.name); });
                    _i = 0, sessionEnvDirs_1 = sessionEnvDirs;
                    _c.label = 6;
                case 6:
                    if (!(_i < sessionEnvDirs_1.length)) return [3 /*break*/, 13];
                    sessionEnvDir = sessionEnvDirs_1[_i];
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, 11, , 12]);
                    return [4 /*yield*/, fsImpl.stat(sessionEnvDir)];
                case 8:
                    stats = _c.sent();
                    if (!(stats.mtime < cutoffDate)) return [3 /*break*/, 10];
                    return [4 /*yield*/, fsImpl.rm(sessionEnvDir, { recursive: true, force: true })];
                case 9:
                    _c.sent();
                    result.messages++;
                    _c.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    _b = _c.sent();
                    result.errors++;
                    return [3 /*break*/, 12];
                case 12:
                    _i++;
                    return [3 /*break*/, 6];
                case 13: return [4 /*yield*/, tryRmdir(sessionEnvBaseDir_1, fsImpl)];
                case 14:
                    _c.sent();
                    return [3 /*break*/, 16];
                case 15:
                    error_5 = _c.sent();
                    (0, log_js_1.logError)(error_5);
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Cleans up old debug log files from ~/.claude/debug/
 * Preserves the 'latest' symlink which points to the current session's log.
 * Debug logs can grow very large (especially with the infinite logging loop bug)
 * and accumulate indefinitely without this cleanup.
 */
function cleanupOldDebugLogs() {
    return __awaiter(this, void 0, void 0, function () {
        var cutoffDate, result, fsImpl, debugDir, dirents, _a, _i, dirents_2, dirent, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cutoffDate = getCutoffDate();
                    result = { messages: 0, errors: 0 };
                    fsImpl = (0, fsOperations_js_1.getFsImplementation)();
                    debugDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'debug');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fsImpl.readdir(debugDir)];
                case 2:
                    dirents = _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [2 /*return*/, result];
                case 4:
                    _i = 0, dirents_2 = dirents;
                    _c.label = 5;
                case 5:
                    if (!(_i < dirents_2.length)) return [3 /*break*/, 10];
                    dirent = dirents_2[_i];
                    // Preserve the 'latest' symlink
                    if (!dirent.isFile() ||
                        !dirent.name.endsWith('.txt') ||
                        dirent.name === 'latest') {
                        return [3 /*break*/, 9];
                    }
                    _c.label = 6;
                case 6:
                    _c.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, unlinkIfOld((0, path_1.join)(debugDir, dirent.name), cutoffDate, fsImpl)];
                case 7:
                    if (_c.sent()) {
                        result.messages++;
                    }
                    return [3 /*break*/, 9];
                case 8:
                    _b = _c.sent();
                    result.errors++;
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 5];
                case 10: 
                // Intentionally do NOT remove debugDir even if empty — needed for future logs
                return [2 /*return*/, result];
            }
        });
    });
}
var ONE_DAY_MS = 24 * 60 * 60 * 1000;
/**
 * Clean up old npm cache entries for Anthropic packages.
 * This helps reduce disk usage since we publish many dev versions per day.
 * Only runs once per day for Ant users.
 */
function cleanupNpmCacheForAnthropicPackages() {
    return __awaiter(this, void 0, void 0, function () {
        var markerPath, stat, _a, _b, npmCachePath, NPM_CACHE_RETENTION_COUNT, startTime, cacache_1, cutoff, stream, anthropicEntries, _c, _d, _e, entry, e_1_1, byPackage, _i, anthropicEntries_1, entry, atVersionIdx, pkgName, existing, keysToRemove, _f, byPackage_1, _g, entries, i, entry, durationMs, error_6;
        var _h, e_1, _j, _k;
        var _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    markerPath = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), '.npm-cache-cleanup');
                    _m.label = 1;
                case 1:
                    _m.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.stat(markerPath)];
                case 2:
                    stat = _m.sent();
                    if (Date.now() - stat.mtimeMs < ONE_DAY_MS) {
                        (0, debug_js_1.logForDebugging)('npm cache cleanup: skipping, ran recently');
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _m.sent();
                    return [3 /*break*/, 4];
                case 4:
                    _m.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, lockfile.lock(markerPath, { retries: 0, realpath: false })];
                case 5:
                    _m.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _b = _m.sent();
                    (0, debug_js_1.logForDebugging)('npm cache cleanup: skipping, lock held');
                    return [2 /*return*/];
                case 7:
                    (0, debug_js_1.logForDebugging)('npm cache cleanup: starting');
                    npmCachePath = (0, path_1.join)((0, os_1.homedir)(), '.npm', '_cacache');
                    NPM_CACHE_RETENTION_COUNT = 5;
                    startTime = Date.now();
                    _m.label = 8;
                case 8:
                    _m.trys.push([8, 24, 25, 27]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('cacache'); })];
                case 9:
                    cacache_1 = _m.sent();
                    cutoff = startTime - ONE_DAY_MS;
                    stream = cacache_1.ls.stream(npmCachePath);
                    anthropicEntries = [];
                    _m.label = 10;
                case 10:
                    _m.trys.push([10, 15, 16, 21]);
                    _c = true, _d = __asyncValues(stream);
                    _m.label = 11;
                case 11: return [4 /*yield*/, _d.next()];
                case 12:
                    if (!(_e = _m.sent(), _h = _e.done, !_h)) return [3 /*break*/, 14];
                    _k = _e.value;
                    _c = false;
                    entry = _k;
                    if (entry.key.includes('@anthropic-ai/claude-')) {
                        anthropicEntries.push({ key: entry.key, time: entry.time });
                    }
                    _m.label = 13;
                case 13:
                    _c = true;
                    return [3 /*break*/, 11];
                case 14: return [3 /*break*/, 21];
                case 15:
                    e_1_1 = _m.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 21];
                case 16:
                    _m.trys.push([16, , 19, 20]);
                    if (!(!_c && !_h && (_j = _d.return))) return [3 /*break*/, 18];
                    return [4 /*yield*/, _j.call(_d)];
                case 17:
                    _m.sent();
                    _m.label = 18;
                case 18: return [3 /*break*/, 20];
                case 19:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 20: return [7 /*endfinally*/];
                case 21:
                    byPackage = new Map();
                    for (_i = 0, anthropicEntries_1 = anthropicEntries; _i < anthropicEntries_1.length; _i++) {
                        entry = anthropicEntries_1[_i];
                        atVersionIdx = entry.key.lastIndexOf('@');
                        pkgName = atVersionIdx > 0 ? entry.key.slice(0, atVersionIdx) : entry.key;
                        existing = (_l = byPackage.get(pkgName)) !== null && _l !== void 0 ? _l : [];
                        existing.push(entry);
                        byPackage.set(pkgName, existing);
                    }
                    keysToRemove = [];
                    for (_f = 0, byPackage_1 = byPackage; _f < byPackage_1.length; _f++) {
                        _g = byPackage_1[_f], entries = _g[1];
                        entries.sort(function (a, b) { return b.time - a.time; }); // newest first
                        for (i = 0; i < entries.length; i++) {
                            entry = entries[i];
                            if (entry.time < cutoff || i >= NPM_CACHE_RETENTION_COUNT) {
                                keysToRemove.push(entry.key);
                            }
                        }
                    }
                    return [4 /*yield*/, Promise.all(keysToRemove.map(function (key) { return cacache_1.rm.entry(npmCachePath, key); }))];
                case 22:
                    _m.sent();
                    return [4 /*yield*/, fs.writeFile(markerPath, new Date().toISOString())];
                case 23:
                    _m.sent();
                    durationMs = Date.now() - startTime;
                    if (keysToRemove.length > 0) {
                        (0, debug_js_1.logForDebugging)("npm cache cleanup: Removed ".concat(keysToRemove.length, " old @anthropic-ai entries in ").concat(durationMs, "ms"));
                    }
                    else {
                        (0, debug_js_1.logForDebugging)("npm cache cleanup: completed in ".concat(durationMs, "ms"));
                    }
                    (0, index_js_1.logEvent)('tengu_npm_cache_cleanup', {
                        success: true,
                        durationMs: durationMs,
                        entriesRemoved: keysToRemove.length,
                    });
                    return [3 /*break*/, 27];
                case 24:
                    error_6 = _m.sent();
                    (0, log_js_1.logError)(error_6);
                    (0, index_js_1.logEvent)('tengu_npm_cache_cleanup', {
                        success: false,
                        durationMs: Date.now() - startTime,
                    });
                    return [3 /*break*/, 27];
                case 25: return [4 /*yield*/, lockfile.unlock(markerPath, { realpath: false }).catch(function () { })];
                case 26:
                    _m.sent();
                    return [7 /*endfinally*/];
                case 27: return [2 /*return*/];
            }
        });
    });
}
/**
 * Throttled wrapper around cleanupOldVersions for recurring cleanup in long-running sessions.
 * Uses a marker file and lock to ensure it runs at most once per 24 hours,
 * and does not block if another process is already running cleanup.
 * The regular cleanupOldVersions() should still be used for installer flows.
 */
function cleanupOldVersionsThrottled() {
    return __awaiter(this, void 0, void 0, function () {
        var markerPath, stat, _a, _b, error_7;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    markerPath = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), '.version-cleanup');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.stat(markerPath)];
                case 2:
                    stat = _c.sent();
                    if (Date.now() - stat.mtimeMs < ONE_DAY_MS) {
                        (0, debug_js_1.logForDebugging)('version cleanup: skipping, ran recently');
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, lockfile.lock(markerPath, { retries: 0, realpath: false })];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _b = _c.sent();
                    (0, debug_js_1.logForDebugging)('version cleanup: skipping, lock held');
                    return [2 /*return*/];
                case 7:
                    (0, debug_js_1.logForDebugging)('version cleanup: starting (throttled)');
                    _c.label = 8;
                case 8:
                    _c.trys.push([8, 11, 12, 14]);
                    return [4 /*yield*/, (0, index_js_2.cleanupOldVersions)()];
                case 9:
                    _c.sent();
                    return [4 /*yield*/, fs.writeFile(markerPath, new Date().toISOString())];
                case 10:
                    _c.sent();
                    return [3 /*break*/, 14];
                case 11:
                    error_7 = _c.sent();
                    (0, log_js_1.logError)(error_7);
                    return [3 /*break*/, 14];
                case 12: return [4 /*yield*/, lockfile.unlock(markerPath, { realpath: false }).catch(function () { })];
                case 13:
                    _c.sent();
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
}
function cleanupOldMessageFilesInBackground() {
    return __awaiter(this, void 0, void 0, function () {
        var errors, removedWorktrees;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errors = (0, allErrors_js_1.getSettingsWithAllErrors)().errors;
                    if (errors.length > 0 && (0, settings_js_1.rawSettingsContainsKey)('cleanupPeriodDays')) {
                        (0, debug_js_1.logForDebugging)('Skipping cleanup: settings have validation errors but cleanupPeriodDays was explicitly set. Fix settings errors to enable cleanup.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, cleanupOldMessageFiles()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, cleanupOldSessionFiles()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, cleanupOldPlanFiles()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, cleanupOldFileHistoryBackups()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, cleanupOldSessionEnvDirs()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, cleanupOldDebugLogs()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, (0, imageStore_js_1.cleanupOldImageCaches)()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, (0, pasteStore_js_1.cleanupOldPastes)(getCutoffDate())];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, (0, worktree_js_1.cleanupStaleAgentWorktrees)(getCutoffDate())];
                case 9:
                    removedWorktrees = _a.sent();
                    if (removedWorktrees > 0) {
                        (0, index_js_1.logEvent)('tengu_worktree_cleanup', { removed: removedWorktrees });
                    }
                    if (!(process.env.USER_TYPE === 'ant')) return [3 /*break*/, 11];
                    return [4 /*yield*/, cleanupNpmCacheForAnthropicPackages()];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [2 /*return*/];
            }
        });
    });
}
