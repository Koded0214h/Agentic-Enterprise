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
exports.callIdeRpc = exports.isSupportedTerminal = exports.isSupportedJetBrainsTerminal = exports.isSupportedVSCodeTerminal = void 0;
exports.isVSCodeIde = isVSCodeIde;
exports.isJetBrainsIde = isJetBrainsIde;
exports.getTerminalIdeType = getTerminalIdeType;
exports.getSortedIdeLockfiles = getSortedIdeLockfiles;
exports.getIdeLockfilesPaths = getIdeLockfilesPaths;
exports.cleanupStaleIdeLockfiles = cleanupStaleIdeLockfiles;
exports.maybeInstallIDEExtension = maybeInstallIDEExtension;
exports.findAvailableIDE = findAvailableIDE;
exports.detectIDEs = detectIDEs;
exports.maybeNotifyIDEConnected = maybeNotifyIDEConnected;
exports.hasAccessToIDEExtensionDiffFeature = hasAccessToIDEExtensionDiffFeature;
exports.isIDEExtensionInstalled = isIDEExtensionInstalled;
exports.isCursorInstalled = isCursorInstalled;
exports.isWindsurfInstalled = isWindsurfInstalled;
exports.isVSCodeInstalled = isVSCodeInstalled;
exports.detectRunningIDEs = detectRunningIDEs;
exports.detectRunningIDEsCached = detectRunningIDEsCached;
exports.resetDetectRunningIDEs = resetDetectRunningIDEs;
exports.getConnectedIdeName = getConnectedIdeName;
exports.getIdeClientName = getIdeClientName;
exports.toIDEDisplayName = toIDEDisplayName;
exports.getConnectedIdeClient = getConnectedIdeClient;
exports.closeOpenDiffs = closeOpenDiffs;
exports.initializeIdeIntegration = initializeIdeIntegration;
var axios_1 = require("axios");
var execa_1 = require("execa");
var capitalize_js_1 = require("lodash-es/capitalize.js");
var memoize_js_1 = require("lodash-es/memoize.js");
var net_1 = require("net");
var os = require("os");
var path_1 = require("path");
var index_js_1 = require("src/services/analytics/index.js");
var state_js_1 = require("../bootstrap/state.js");
var client_js_1 = require("../services/mcp/client.js");
Object.defineProperty(exports, "callIdeRpc", { enumerable: true, get: function () { return client_js_1.callIdeRpc; } });
var config_js_1 = require("./config.js");
var env_js_1 = require("./env.js");
var envUtils_js_1 = require("./envUtils.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var fsOperations_js_1 = require("./fsOperations.js");
var genericProcessUtils_js_1 = require("./genericProcessUtils.js");
var jetbrains_js_1 = require("./jetbrains.js");
var log_js_1 = require("./log.js");
var platform_js_1 = require("./platform.js");
var semver_js_1 = require("./semver.js");
// Lazy: IdeOnboardingDialog.tsx pulls React/ink; only needed in interactive onboarding path
/* eslint-disable @typescript-eslint/no-require-imports */
var ideOnboardingDialog = function () {
    return require('src/components/IdeOnboardingDialog.js');
};
var abortController_js_1 = require("./abortController.js");
var debug_js_1 = require("./debug.js");
var envDynamic_js_1 = require("./envDynamic.js");
var errors_js_1 = require("./errors.js");
/* eslint-enable @typescript-eslint/no-require-imports */
var idePathConversion_js_1 = require("./idePathConversion.js");
var sleep_js_1 = require("./sleep.js");
var slowOperations_js_1 = require("./slowOperations.js");
function isProcessRunning(pid) {
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (_a) {
        return false;
    }
}
// Returns a function that lazily fetches our process's ancestor PID chain,
// caching within the closure's lifetime. Callers should scope this to a
// single detection pass — PIDs recycle and process trees change over time.
function makeAncestorPidLookup() {
    var promise = null;
    return function () {
        if (!promise) {
            promise = (0, genericProcessUtils_js_1.getAncestorPidsAsync)(process.ppid, 10).then(function (pids) { return new Set(pids); });
        }
        return promise;
    };
}
var supportedIdeConfigs = {
    cursor: {
        ideKind: 'vscode',
        displayName: 'Cursor',
        processKeywordsMac: ['Cursor Helper', 'Cursor.app'],
        processKeywordsWindows: ['cursor.exe'],
        processKeywordsLinux: ['cursor'],
    },
    windsurf: {
        ideKind: 'vscode',
        displayName: 'Windsurf',
        processKeywordsMac: ['Windsurf Helper', 'Windsurf.app'],
        processKeywordsWindows: ['windsurf.exe'],
        processKeywordsLinux: ['windsurf'],
    },
    vscode: {
        ideKind: 'vscode',
        displayName: 'VS Code',
        processKeywordsMac: ['Visual Studio Code', 'Code Helper'],
        processKeywordsWindows: ['code.exe'],
        processKeywordsLinux: ['code'],
    },
    intellij: {
        ideKind: 'jetbrains',
        displayName: 'IntelliJ IDEA',
        processKeywordsMac: ['IntelliJ IDEA'],
        processKeywordsWindows: ['idea64.exe'],
        processKeywordsLinux: ['idea', 'intellij'],
    },
    pycharm: {
        ideKind: 'jetbrains',
        displayName: 'PyCharm',
        processKeywordsMac: ['PyCharm'],
        processKeywordsWindows: ['pycharm64.exe'],
        processKeywordsLinux: ['pycharm'],
    },
    webstorm: {
        ideKind: 'jetbrains',
        displayName: 'WebStorm',
        processKeywordsMac: ['WebStorm'],
        processKeywordsWindows: ['webstorm64.exe'],
        processKeywordsLinux: ['webstorm'],
    },
    phpstorm: {
        ideKind: 'jetbrains',
        displayName: 'PhpStorm',
        processKeywordsMac: ['PhpStorm'],
        processKeywordsWindows: ['phpstorm64.exe'],
        processKeywordsLinux: ['phpstorm'],
    },
    rubymine: {
        ideKind: 'jetbrains',
        displayName: 'RubyMine',
        processKeywordsMac: ['RubyMine'],
        processKeywordsWindows: ['rubymine64.exe'],
        processKeywordsLinux: ['rubymine'],
    },
    clion: {
        ideKind: 'jetbrains',
        displayName: 'CLion',
        processKeywordsMac: ['CLion'],
        processKeywordsWindows: ['clion64.exe'],
        processKeywordsLinux: ['clion'],
    },
    goland: {
        ideKind: 'jetbrains',
        displayName: 'GoLand',
        processKeywordsMac: ['GoLand'],
        processKeywordsWindows: ['goland64.exe'],
        processKeywordsLinux: ['goland'],
    },
    rider: {
        ideKind: 'jetbrains',
        displayName: 'Rider',
        processKeywordsMac: ['Rider'],
        processKeywordsWindows: ['rider64.exe'],
        processKeywordsLinux: ['rider'],
    },
    datagrip: {
        ideKind: 'jetbrains',
        displayName: 'DataGrip',
        processKeywordsMac: ['DataGrip'],
        processKeywordsWindows: ['datagrip64.exe'],
        processKeywordsLinux: ['datagrip'],
    },
    appcode: {
        ideKind: 'jetbrains',
        displayName: 'AppCode',
        processKeywordsMac: ['AppCode'],
        processKeywordsWindows: ['appcode.exe'],
        processKeywordsLinux: ['appcode'],
    },
    dataspell: {
        ideKind: 'jetbrains',
        displayName: 'DataSpell',
        processKeywordsMac: ['DataSpell'],
        processKeywordsWindows: ['dataspell64.exe'],
        processKeywordsLinux: ['dataspell'],
    },
    aqua: {
        ideKind: 'jetbrains',
        displayName: 'Aqua',
        processKeywordsMac: [], // Do not auto-detect since aqua is too common
        processKeywordsWindows: ['aqua64.exe'],
        processKeywordsLinux: [],
    },
    gateway: {
        ideKind: 'jetbrains',
        displayName: 'Gateway',
        processKeywordsMac: [], // Do not auto-detect since gateway is too common
        processKeywordsWindows: ['gateway64.exe'],
        processKeywordsLinux: [],
    },
    fleet: {
        ideKind: 'jetbrains',
        displayName: 'Fleet',
        processKeywordsMac: [], // Do not auto-detect since fleet is too common
        processKeywordsWindows: ['fleet.exe'],
        processKeywordsLinux: [],
    },
    androidstudio: {
        ideKind: 'jetbrains',
        displayName: 'Android Studio',
        processKeywordsMac: ['Android Studio'],
        processKeywordsWindows: ['studio64.exe'],
        processKeywordsLinux: ['android-studio'],
    },
};
function isVSCodeIde(ide) {
    if (!ide)
        return false;
    var config = supportedIdeConfigs[ide];
    return config && config.ideKind === 'vscode';
}
function isJetBrainsIde(ide) {
    if (!ide)
        return false;
    var config = supportedIdeConfigs[ide];
    return config && config.ideKind === 'jetbrains';
}
exports.isSupportedVSCodeTerminal = (0, memoize_js_1.default)(function () {
    return isVSCodeIde(env_js_1.env.terminal);
});
exports.isSupportedJetBrainsTerminal = (0, memoize_js_1.default)(function () {
    return isJetBrainsIde(envDynamic_js_1.envDynamic.terminal);
});
exports.isSupportedTerminal = (0, memoize_js_1.default)(function () {
    return ((0, exports.isSupportedVSCodeTerminal)() ||
        (0, exports.isSupportedJetBrainsTerminal)() ||
        Boolean(process.env.FORCE_CODE_TERMINAL));
});
function getTerminalIdeType() {
    if (!(0, exports.isSupportedTerminal)()) {
        return null;
    }
    return env_js_1.env.terminal;
}
/**
 * Gets sorted IDE lockfiles from ~/.claude/ide directory
 * @returns Array of full lockfile paths sorted by modification time (newest first)
 */
function getSortedIdeLockfiles() {
    return __awaiter(this, void 0, void 0, function () {
        var ideLockFilePaths, allLockfiles, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getIdeLockfilesPaths()
                        // Collect all lockfiles from all directories
                    ];
                case 1:
                    ideLockFilePaths = _a.sent();
                    return [4 /*yield*/, Promise.all(ideLockFilePaths.map(function (ideLockFilePath) { return __awaiter(_this, void 0, void 0, function () {
                            var entries, lockEntries, stats, error_2;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().readdir(ideLockFilePath)];
                                    case 1:
                                        entries = _a.sent();
                                        lockEntries = entries.filter(function (file) {
                                            return file.name.endsWith('.lock');
                                        });
                                        return [4 /*yield*/, Promise.all(lockEntries.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                                                var fullPath, fileStat, _a;
                                                return __generator(this, function (_b) {
                                                    switch (_b.label) {
                                                        case 0:
                                                            fullPath = (0, path_1.join)(ideLockFilePath, file.name);
                                                            _b.label = 1;
                                                        case 1:
                                                            _b.trys.push([1, 3, , 4]);
                                                            return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().stat(fullPath)];
                                                        case 2:
                                                            fileStat = _b.sent();
                                                            return [2 /*return*/, { path: fullPath, mtime: fileStat.mtime }];
                                                        case 3:
                                                            _a = _b.sent();
                                                            return [2 /*return*/, null];
                                                        case 4: return [2 /*return*/];
                                                    }
                                                });
                                            }); }))];
                                    case 2:
                                        stats = _a.sent();
                                        return [2 /*return*/, stats.filter(function (s) { return s !== null; })];
                                    case 3:
                                        error_2 = _a.sent();
                                        // Candidate paths are pushed without pre-checking existence, so
                                        // missing/inaccessible dirs are expected here — skip silently.
                                        if (!(0, errors_js_1.isFsInaccessible)(error_2)) {
                                            (0, log_js_1.logError)(error_2);
                                        }
                                        return [2 /*return*/, []];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))
                        // Flatten and sort all lockfiles by last modified date (newest first)
                    ];
                case 2:
                    allLockfiles = _a.sent();
                    // Flatten and sort all lockfiles by last modified date (newest first)
                    return [2 /*return*/, allLockfiles
                            .flat()
                            .sort(function (a, b) { return b.mtime.getTime() - a.mtime.getTime(); })
                            .map(function (file) { return file.path; })];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function readIdeLockfile(path) {
    return __awaiter(this, void 0, void 0, function () {
        var content, workspaceFolders, pid, ideName, useWebSocket, runningInWindows, authToken, parsedContent, filename, port, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().readFile(path, {
                            encoding: 'utf-8',
                        })];
                case 1:
                    content = _a.sent();
                    workspaceFolders = [];
                    pid = void 0;
                    ideName = void 0;
                    useWebSocket = false;
                    runningInWindows = false;
                    authToken = void 0;
                    try {
                        parsedContent = (0, slowOperations_js_1.jsonParse)(content);
                        if (parsedContent.workspaceFolders) {
                            workspaceFolders = parsedContent.workspaceFolders;
                        }
                        pid = parsedContent.pid;
                        ideName = parsedContent.ideName;
                        useWebSocket = parsedContent.transport === 'ws';
                        runningInWindows = parsedContent.runningInWindows === true;
                        authToken = parsedContent.authToken;
                    }
                    catch (_) {
                        // Older format- just a list of paths.
                        workspaceFolders = content.split('\n').map(function (line) { return line.trim(); });
                    }
                    filename = path.split(path_1.sep).pop();
                    if (!filename)
                        return [2 /*return*/, null];
                    port = filename.replace('.lock', '');
                    return [2 /*return*/, {
                            workspaceFolders: workspaceFolders,
                            port: parseInt(port),
                            pid: pid,
                            ideName: ideName,
                            useWebSocket: useWebSocket,
                            runningInWindows: runningInWindows,
                            authToken: authToken,
                        }];
                case 2:
                    error_3 = _a.sent();
                    (0, log_js_1.logError)(error_3);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Checks if the IDE connection is responding by testing if the port is open
 * @param host Host to connect to
 * @param port Port to connect to
 * @param timeout Optional timeout in milliseconds (defaults to 500ms)
 * @returns true if the port is open, false otherwise
 */
function checkIdeConnection(host_1, port_1) {
    return __awaiter(this, arguments, void 0, function (host, port, timeout) {
        if (timeout === void 0) { timeout = 500; }
        return __generator(this, function (_a) {
            try {
                return [2 /*return*/, new Promise(function (resolve) {
                        var socket = (0, net_1.createConnection)({
                            host: host,
                            port: port,
                            timeout: timeout,
                        });
                        socket.on('connect', function () {
                            socket.destroy();
                            void resolve(true);
                        });
                        socket.on('error', function () {
                            void resolve(false);
                        });
                        socket.on('timeout', function () {
                            socket.destroy();
                            void resolve(false);
                        });
                    })];
            }
            catch (_) {
                // Invalid URL or other errors
                return [2 /*return*/, false];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Resolve the Windows USERPROFILE path. WSL often doesn't pass USERPROFILE
 * through, so fall back to shelling out to powershell.exe. That spawn is
 * ~500ms–2s cold; the value is static per session.
 */
var getWindowsUserProfile = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, stdout, code;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (process.env.USERPROFILE)
                    return [2 /*return*/, process.env.USERPROFILE];
                return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('powershell.exe', [
                        '-NoProfile',
                        '-NonInteractive',
                        '-Command',
                        '$env:USERPROFILE',
                    ])];
            case 1:
                _a = _b.sent(), stdout = _a.stdout, code = _a.code;
                if (code === 0 && stdout.trim())
                    return [2 /*return*/, stdout.trim()];
                (0, debug_js_1.logForDebugging)('Unable to get Windows USERPROFILE via PowerShell - IDE detection may be incomplete');
                return [2 /*return*/, undefined];
        }
    });
}); });
/**
 * Gets the potential IDE lockfiles directories path based on platform.
 * Paths are not pre-checked for existence — the consumer readdirs each
 * and handles ENOENT. Pre-checking with stat() would double syscalls,
 * and on WSL (where /mnt/c access is 2-10x slower) the per-user-dir
 * stat loop compounded startup latency.
 */
function getIdeLockfilesPaths() {
    return __awaiter(this, void 0, void 0, function () {
        var paths, windowsHome, converter, wslPath, usersDir, userDirs, _i, userDirs_1, user, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    paths = [(0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'ide')];
                    if ((0, platform_js_1.getPlatform)() !== 'wsl') {
                        return [2 /*return*/, paths];
                    }
                    return [4 /*yield*/, getWindowsUserProfile()];
                case 1:
                    windowsHome = _a.sent();
                    if (windowsHome) {
                        converter = new idePathConversion_js_1.WindowsToWSLConverter(process.env.WSL_DISTRO_NAME);
                        wslPath = converter.toLocalPath(windowsHome);
                        paths.push((0, path_1.resolve)(wslPath, '.claude', 'ide'));
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    usersDir = '/mnt/c/Users';
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().readdir(usersDir)];
                case 3:
                    userDirs = _a.sent();
                    for (_i = 0, userDirs_1 = userDirs; _i < userDirs_1.length; _i++) {
                        user = userDirs_1[_i];
                        // Skip files (e.g. desktop.ini) — readdir on a file path throws ENOTDIR.
                        // isFsInaccessible covers ENOTDIR, but pre-filtering here avoids the
                        // cost of attempting to readdir non-directories. Symlinks are kept since
                        // Windows creates junction points for user profiles.
                        if (!user.isDirectory() && !user.isSymbolicLink()) {
                            continue;
                        }
                        if (user.name === 'Public' ||
                            user.name === 'Default' ||
                            user.name === 'Default User' ||
                            user.name === 'All Users') {
                            continue; // Skip system directories
                        }
                        paths.push((0, path_1.join)(usersDir, user.name, '.claude', 'ide'));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    if ((0, errors_js_1.isFsInaccessible)(error_4)) {
                        // Expected on WSL when C: drive is not mounted or user lacks permissions
                        (0, debug_js_1.logForDebugging)("WSL IDE lockfile path detection failed (".concat(error_4.code, "): ").concat((0, errors_js_1.errorMessage)(error_4)));
                    }
                    else {
                        (0, log_js_1.logError)(error_4);
                    }
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, paths];
            }
        });
    });
}
/**
 * Cleans up stale IDE lockfiles
 * - Removes lockfiles for processes that are no longer running
 * - Removes lockfiles for ports that are not responding
 */
function cleanupStaleIdeLockfiles() {
    return __awaiter(this, void 0, void 0, function () {
        var lockfiles, _i, lockfiles_1, lockfilePath, lockfileInfo, error_5, host, shouldDelete, isResponding, isResponding, error_6, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 21, , 22]);
                    return [4 /*yield*/, getSortedIdeLockfiles()];
                case 1:
                    lockfiles = _a.sent();
                    _i = 0, lockfiles_1 = lockfiles;
                    _a.label = 2;
                case 2:
                    if (!(_i < lockfiles_1.length)) return [3 /*break*/, 20];
                    lockfilePath = lockfiles_1[_i];
                    return [4 /*yield*/, readIdeLockfile(lockfilePath)];
                case 3:
                    lockfileInfo = _a.sent();
                    if (!!lockfileInfo) return [3 /*break*/, 8];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().unlink(lockfilePath)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_5 = _a.sent();
                    (0, log_js_1.logError)(error_5);
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 19];
                case 8: return [4 /*yield*/, detectHostIP(lockfileInfo.runningInWindows, lockfileInfo.port)];
                case 9:
                    host = _a.sent();
                    shouldDelete = false;
                    if (!lockfileInfo.pid) return [3 /*break*/, 13];
                    if (!!isProcessRunning(lockfileInfo.pid)) return [3 /*break*/, 12];
                    if (!((0, platform_js_1.getPlatform)() !== 'wsl')) return [3 /*break*/, 10];
                    shouldDelete = true;
                    return [3 /*break*/, 12];
                case 10: return [4 /*yield*/, checkIdeConnection(host, lockfileInfo.port)];
                case 11:
                    isResponding = _a.sent();
                    if (!isResponding) {
                        shouldDelete = true;
                    }
                    _a.label = 12;
                case 12: return [3 /*break*/, 15];
                case 13: return [4 /*yield*/, checkIdeConnection(host, lockfileInfo.port)];
                case 14:
                    isResponding = _a.sent();
                    if (!isResponding) {
                        shouldDelete = true;
                    }
                    _a.label = 15;
                case 15:
                    if (!shouldDelete) return [3 /*break*/, 19];
                    _a.label = 16;
                case 16:
                    _a.trys.push([16, 18, , 19]);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().unlink(lockfilePath)];
                case 17:
                    _a.sent();
                    return [3 /*break*/, 19];
                case 18:
                    error_6 = _a.sent();
                    (0, log_js_1.logError)(error_6);
                    return [3 /*break*/, 19];
                case 19:
                    _i++;
                    return [3 /*break*/, 2];
                case 20: return [3 /*break*/, 22];
                case 21:
                    error_7 = _a.sent();
                    (0, log_js_1.logError)(error_7);
                    return [3 /*break*/, 22];
                case 22: return [2 /*return*/];
            }
        });
    });
}
function maybeInstallIDEExtension(ideType) {
    return __awaiter(this, void 0, void 0, function () {
        var installedVersion, globalConfig, error_8, errorMessage_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, installIDEExtension(ideType)
                        // Only track successful installations
                    ];
                case 1:
                    installedVersion = _a.sent();
                    // Only track successful installations
                    (0, index_js_1.logEvent)('tengu_ext_installed', {});
                    globalConfig = (0, config_js_1.getGlobalConfig)();
                    if (!globalConfig.diffTool) {
                        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { diffTool: 'auto' })); });
                    }
                    return [2 /*return*/, {
                            installed: true,
                            error: null,
                            installedVersion: installedVersion,
                            ideType: ideType,
                        }];
                case 2:
                    error_8 = _a.sent();
                    (0, index_js_1.logEvent)('tengu_ext_install_error', {});
                    errorMessage_1 = error_8 instanceof Error ? error_8.message : String(error_8);
                    (0, log_js_1.logError)(error_8);
                    return [2 /*return*/, {
                            installed: false,
                            error: errorMessage_1,
                            installedVersion: null,
                            ideType: ideType,
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var currentIDESearch = null;
function findAvailableIDE() {
    return __awaiter(this, void 0, void 0, function () {
        var signal, startTime, ides;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (currentIDESearch) {
                        currentIDESearch.abort();
                    }
                    currentIDESearch = (0, abortController_js_1.createAbortController)();
                    signal = currentIDESearch.signal;
                    // Clean up stale IDE lockfiles first so we don't check them at all.
                    return [4 /*yield*/, cleanupStaleIdeLockfiles()];
                case 1:
                    // Clean up stale IDE lockfiles first so we don't check them at all.
                    _a.sent();
                    startTime = Date.now();
                    _a.label = 2;
                case 2:
                    if (!(Date.now() - startTime < 30000 && !signal.aborted)) return [3 /*break*/, 7];
                    if (!(0, state_js_1.getIsScrollDraining)()) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(1000, signal)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 2];
                case 4: return [4 /*yield*/, detectIDEs(false)];
                case 5:
                    ides = _a.sent();
                    if (signal.aborted) {
                        return [2 /*return*/, null];
                    }
                    // Return the IDE if and only if there is exactly one match, otherwise the user must
                    // use /ide to select an IDE. When running from a supported built-in terminal, detectIDEs()
                    // should return at most one IDE.
                    if (ides.length === 1) {
                        return [2 /*return*/, ides[0]];
                    }
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(1000, signal)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 2];
                case 7: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Detects IDEs that have a running extension/plugin.
 * @param includeInvalid If true, also return IDEs that are invalid (ie. where
 * the workspace directory does not match the cwd)
 */
function detectIDEs(includeInvalid) {
    return __awaiter(this, void 0, void 0, function () {
        var detectedIDEs, ssePort, envPort_1, cwd_1, lockfiles, lockfileInfos, getAncestors, needsAncestryCheck, _loop_1, _i, lockfileInfos_1, lockfileInfo, envPortMatch, error_9;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    detectedIDEs = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, , 9]);
                    ssePort = process.env.CLAUDE_CODE_SSE_PORT;
                    envPort_1 = ssePort ? parseInt(ssePort) : null;
                    cwd_1 = (0, state_js_1.getOriginalCwd)().normalize('NFC');
                    return [4 /*yield*/, getSortedIdeLockfiles()];
                case 2:
                    lockfiles = _b.sent();
                    return [4 /*yield*/, Promise.all(lockfiles.map(readIdeLockfile))
                        // Ancestor PID walk shells out (ps in a loop, up to 10x). Make it lazy and
                        // single-shot per detectIDEs() call; with the workspace-check-first ordering
                        // below, this often never fires at all.
                    ];
                case 3:
                    lockfileInfos = _b.sent();
                    getAncestors = makeAncestorPidLookup();
                    needsAncestryCheck = (0, platform_js_1.getPlatform)() !== 'wsl' && (0, exports.isSupportedTerminal)();
                    _loop_1 = function (lockfileInfo) {
                        var isValid, portMatchesEnv, ancestors, ideName, host, url;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (!lockfileInfo)
                                        return [2 /*return*/, "continue"];
                                    isValid = false;
                                    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_IDE_SKIP_VALID_CHECK)) {
                                        isValid = true;
                                    }
                                    else if (lockfileInfo.port === envPort_1) {
                                        // If the port matches the environment variable, mark as valid regardless of directory
                                        isValid = true;
                                    }
                                    else {
                                        // Otherwise, check if the current working directory is within the workspace folders
                                        isValid = lockfileInfo.workspaceFolders.some(function (idePath) {
                                            if (!idePath)
                                                return false;
                                            var localPath = idePath;
                                            // Handle WSL-specific path conversion and distro matching
                                            if ((0, platform_js_1.getPlatform)() === 'wsl' &&
                                                lockfileInfo.runningInWindows &&
                                                process.env.WSL_DISTRO_NAME) {
                                                // Check for WSL distro mismatch
                                                if (!(0, idePathConversion_js_1.checkWSLDistroMatch)(idePath, process.env.WSL_DISTRO_NAME)) {
                                                    return false;
                                                }
                                                // Try both the original path and the converted path
                                                // This handles cases where the IDE might report either format
                                                var resolvedOriginal = (0, path_1.resolve)(localPath).normalize('NFC');
                                                if (cwd_1 === resolvedOriginal ||
                                                    cwd_1.startsWith(resolvedOriginal + path_1.sep)) {
                                                    return true;
                                                }
                                                // Convert Windows IDE path to WSL local path and check that too
                                                var converter = new idePathConversion_js_1.WindowsToWSLConverter(process.env.WSL_DISTRO_NAME);
                                                localPath = converter.toLocalPath(idePath);
                                            }
                                            var resolvedPath = (0, path_1.resolve)(localPath).normalize('NFC');
                                            // On Windows, normalize paths for case-insensitive drive letter comparison
                                            if ((0, platform_js_1.getPlatform)() === 'windows') {
                                                var normalizedCwd = cwd_1.replace(/^[a-zA-Z]:/, function (match) {
                                                    return match.toUpperCase();
                                                });
                                                var normalizedResolvedPath = resolvedPath.replace(/^[a-zA-Z]:/, function (match) { return match.toUpperCase(); });
                                                return (normalizedCwd === normalizedResolvedPath ||
                                                    normalizedCwd.startsWith(normalizedResolvedPath + path_1.sep));
                                            }
                                            return (cwd_1 === resolvedPath || cwd_1.startsWith(resolvedPath + path_1.sep));
                                        });
                                    }
                                    if (!isValid && !includeInvalid) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!needsAncestryCheck) return [3 /*break*/, 2];
                                    portMatchesEnv = envPort_1 !== null && lockfileInfo.port === envPort_1;
                                    if (!!portMatchesEnv) return [3 /*break*/, 2];
                                    if (!lockfileInfo.pid || !isProcessRunning(lockfileInfo.pid)) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!(process.ppid !== lockfileInfo.pid)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, getAncestors()];
                                case 1:
                                    ancestors = _c.sent();
                                    if (!ancestors.has(lockfileInfo.pid)) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    _c.label = 2;
                                case 2:
                                    ideName = (_a = lockfileInfo.ideName) !== null && _a !== void 0 ? _a : ((0, exports.isSupportedTerminal)() ? toIDEDisplayName(envDynamic_js_1.envDynamic.terminal) : 'IDE');
                                    return [4 /*yield*/, detectHostIP(lockfileInfo.runningInWindows, lockfileInfo.port)];
                                case 3:
                                    host = _c.sent();
                                    url = void 0;
                                    if (lockfileInfo.useWebSocket) {
                                        url = "ws://".concat(host, ":").concat(lockfileInfo.port);
                                    }
                                    else {
                                        url = "http://".concat(host, ":").concat(lockfileInfo.port, "/sse");
                                    }
                                    detectedIDEs.push({
                                        url: url,
                                        name: ideName,
                                        workspaceFolders: lockfileInfo.workspaceFolders,
                                        port: lockfileInfo.port,
                                        isValid: isValid,
                                        authToken: lockfileInfo.authToken,
                                        ideRunningInWindows: lockfileInfo.runningInWindows,
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, lockfileInfos_1 = lockfileInfos;
                    _b.label = 4;
                case 4:
                    if (!(_i < lockfileInfos_1.length)) return [3 /*break*/, 7];
                    lockfileInfo = lockfileInfos_1[_i];
                    return [5 /*yield**/, _loop_1(lockfileInfo)];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    // The envPort should be defined for supported IDE terminals. If there is
                    // an extension with a matching envPort, then we will single that one out
                    // and return it, otherwise we return all the valid ones.
                    if (!includeInvalid && envPort_1) {
                        envPortMatch = detectedIDEs.filter(function (ide) { return ide.isValid && ide.port === envPort_1; });
                        if (envPortMatch.length === 1) {
                            return [2 /*return*/, envPortMatch];
                        }
                    }
                    return [3 /*break*/, 9];
                case 8:
                    error_9 = _b.sent();
                    (0, log_js_1.logError)(error_9);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/, detectedIDEs];
            }
        });
    });
}
function maybeNotifyIDEConnected(client) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.notification({
                        method: 'ide_connected',
                        params: {
                            pid: process.pid,
                        },
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function hasAccessToIDEExtensionDiffFeature(mcpClients) {
    // Check if there's a connected IDE client in the provided MCP clients list
    return mcpClients.some(function (client) { return client.type === 'connected' && client.name === 'ide'; });
}
var EXTENSION_ID = process.env.USER_TYPE === 'ant'
    ? 'anthropic.claude-code-internal'
    : 'anthropic.claude-code';
function isIDEExtensionInstalled(ideType) {
    return __awaiter(this, void 0, void 0, function () {
        var command, result, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!isVSCodeIde(ideType)) return [3 /*break*/, 6];
                    return [4 /*yield*/, getVSCodeIDECommand(ideType)];
                case 1:
                    command = _c.sent();
                    if (!command) return [3 /*break*/, 5];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)(command, ['--list-extensions'], {
                            env: getInstallationEnv(),
                        })];
                case 3:
                    result = _c.sent();
                    if ((_b = result.stdout) === null || _b === void 0 ? void 0 : _b.includes(EXTENSION_ID)) {
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 8];
                case 6:
                    if (!isJetBrainsIde(ideType)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, jetbrains_js_1.isJetBrainsPluginInstalledCached)(ideType)];
                case 7: return [2 /*return*/, _c.sent()];
                case 8: return [2 /*return*/, false];
            }
        });
    });
}
function installIDEExtension(ideType) {
    return __awaiter(this, void 0, void 0, function () {
        var command, version, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isVSCodeIde(ideType)) return [3 /*break*/, 8];
                    return [4 /*yield*/, getVSCodeIDECommand(ideType)];
                case 1:
                    command = _a.sent();
                    if (!command) return [3 /*break*/, 8];
                    if (!(process.env.USER_TYPE === 'ant')) return [3 /*break*/, 3];
                    return [4 /*yield*/, installFromArtifactory(command)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3: return [4 /*yield*/, getInstalledVSCodeExtensionVersion(command)
                    // If it's not installed or the version is older than the one we have bundled,
                ];
                case 4:
                    version = _a.sent();
                    if (!(!version || (0, semver_js_1.lt)(version, getClaudeCodeVersion()))) return [3 /*break*/, 7];
                    // `code` may crash when invoked too quickly in succession
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(500)];
                case 5:
                    // `code` may crash when invoked too quickly in succession
                    _a.sent();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)(command, ['--force', '--install-extension', 'anthropic.claude-code'], {
                            env: getInstallationEnv(),
                        })];
                case 6:
                    result = _a.sent();
                    if (result.code !== 0) {
                        throw new Error("".concat(result.code, ": ").concat(result.error, " ").concat(result.stderr));
                    }
                    version = getClaudeCodeVersion();
                    _a.label = 7;
                case 7: return [2 /*return*/, version];
                case 8: 
                // No automatic installation for JetBrains IDEs as it is not supported in native
                // builds. We show a prominent notice for them to download from the marketplace
                // instead.
                return [2 /*return*/, null];
            }
        });
    });
}
function getInstallationEnv() {
    // Cursor on Linux may incorrectly implement
    // the `code` command and actually launch the UI.
    // Make this error out if this happens by clearing the DISPLAY
    // environment variable.
    if ((0, platform_js_1.getPlatform)() === 'linux') {
        return __assign(__assign({}, process.env), { DISPLAY: '' });
    }
    return undefined;
}
function getClaudeCodeVersion() {
    return MACRO.VERSION;
}
function getInstalledVSCodeExtensionVersion(command) {
    return __awaiter(this, void 0, void 0, function () {
        var stdout, lines, _i, lines_1, line, _a, extensionId, version;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(command, ['--list-extensions', '--show-versions'], {
                        env: getInstallationEnv(),
                    })];
                case 1:
                    stdout = (_b.sent()).stdout;
                    lines = (stdout === null || stdout === void 0 ? void 0 : stdout.split('\n')) || [];
                    for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        line = lines_1[_i];
                        _a = line.split('@'), extensionId = _a[0], version = _a[1];
                        if (extensionId === 'anthropic.claude-code' && version) {
                            return [2 /*return*/, version];
                        }
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
function getVSCodeIDECommandByParentProcess() {
    var _a, _b;
    try {
        var platform = (0, platform_js_1.getPlatform)();
        // Only supported on OSX, where Cursor has the ability to
        // register itself as the 'code' command.
        if (platform !== 'macos') {
            return null;
        }
        var pid = process.ppid;
        // Walk up the process tree to find the actual app
        for (var i = 0; i < 10; i++) {
            if (!pid || pid === 0 || pid === 1)
                break;
            // Get the command for this PID
            // this function already returned if not running on macos
            var command = (_a = (0, execFileNoThrow_js_1.execSyncWithDefaults_DEPRECATED)(
            // eslint-disable-next-line custom-rules/no-direct-ps-commands
            "ps -o command= -p ".concat(pid))) === null || _a === void 0 ? void 0 : _a.trim();
            if (command) {
                // Check for known applications and extract the path up to and including .app
                var appNames = {
                    'Visual Studio Code.app': 'code',
                    'Cursor.app': 'cursor',
                    'Windsurf.app': 'windsurf',
                    'Visual Studio Code - Insiders.app': 'code',
                    'VSCodium.app': 'codium',
                };
                var pathToExecutable = '/Contents/MacOS/Electron';
                for (var _i = 0, _c = Object.entries(appNames); _i < _c.length; _i++) {
                    var _d = _c[_i], appName = _d[0], executableName = _d[1];
                    var appIndex = command.indexOf(appName + pathToExecutable);
                    if (appIndex !== -1) {
                        // Extract the path from the beginning to the end of the .app name
                        var folderPathEnd = appIndex + appName.length;
                        // These are all known VSCode variants with the same structure
                        return (command.substring(0, folderPathEnd) +
                            '/Contents/Resources/app/bin/' +
                            executableName);
                    }
                }
            }
            // Get parent PID
            // this function already returned if not running on macos
            var ppidStr = (_b = (0, execFileNoThrow_js_1.execSyncWithDefaults_DEPRECATED)(
            // eslint-disable-next-line custom-rules/no-direct-ps-commands
            "ps -o ppid= -p ".concat(pid))) === null || _b === void 0 ? void 0 : _b.trim();
            if (!ppidStr) {
                break;
            }
            pid = parseInt(ppidStr.trim());
        }
        return null;
    }
    catch (_e) {
        return null;
    }
}
function getVSCodeIDECommand(ideType) {
    return __awaiter(this, void 0, void 0, function () {
        var parentExecutable, _a, ext;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    parentExecutable = getVSCodeIDECommandByParentProcess();
                    if (!parentExecutable) return [3 /*break*/, 4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().stat(parentExecutable)];
                case 2:
                    _b.sent();
                    return [2 /*return*/, parentExecutable];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4:
                    ext = (0, platform_js_1.getPlatform)() === 'windows' ? '.cmd' : '';
                    switch (ideType) {
                        case 'vscode':
                            return [2 /*return*/, 'code' + ext];
                        case 'cursor':
                            return [2 /*return*/, 'cursor' + ext];
                        case 'windsurf':
                            return [2 /*return*/, 'windsurf' + ext];
                        default:
                            break;
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
function isCursorInstalled() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('cursor', ['--version'])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.code === 0];
            }
        });
    });
}
function isWindsurfInstalled() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('windsurf', ['--version'])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.code === 0];
            }
        });
    });
}
function isVSCodeInstalled() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('code', ['--help'])
                    // Check if the output indicates this is actually Visual Studio Code
                ];
                case 1:
                    result = _b.sent();
                    // Check if the output indicates this is actually Visual Studio Code
                    return [2 /*return*/, (result.code === 0 && Boolean((_a = result.stdout) === null || _a === void 0 ? void 0 : _a.includes('Visual Studio Code')))];
            }
        });
    });
}
// Cache for IDE detection results
var cachedRunningIDEs = null;
/**
 * Internal implementation of IDE detection.
 */
function detectRunningIDEsImpl() {
    return __awaiter(this, void 0, void 0, function () {
        var runningIDEs, platform, result, stdout, _i, _a, _b, ide, config, _c, _d, keyword, result, stdout, normalizedStdout, _e, _f, _g, ide, config, _h, _j, keyword, result, stdout, normalizedStdout, _k, _l, _m, ide, config, _o, _p, keyword, error_10;
        var _q, _r, _s;
        return __generator(this, function (_t) {
            switch (_t.label) {
                case 0:
                    runningIDEs = [];
                    _t.label = 1;
                case 1:
                    _t.trys.push([1, 8, , 9]);
                    platform = (0, platform_js_1.getPlatform)();
                    if (!(platform === 'macos')) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, execa_1.execa)('ps aux | grep -E "Visual Studio Code|Code Helper|Cursor Helper|Windsurf Helper|IntelliJ IDEA|PyCharm|WebStorm|PhpStorm|RubyMine|CLion|GoLand|Rider|DataGrip|AppCode|DataSpell|Aqua|Gateway|Fleet|Android Studio" | grep -v grep', { shell: true, reject: false })];
                case 2:
                    result = _t.sent();
                    stdout = (_q = result.stdout) !== null && _q !== void 0 ? _q : '';
                    for (_i = 0, _a = Object.entries(supportedIdeConfigs); _i < _a.length; _i++) {
                        _b = _a[_i], ide = _b[0], config = _b[1];
                        for (_c = 0, _d = config.processKeywordsMac; _c < _d.length; _c++) {
                            keyword = _d[_c];
                            if (stdout.includes(keyword)) {
                                runningIDEs.push(ide);
                                break;
                            }
                        }
                    }
                    return [3 /*break*/, 7];
                case 3:
                    if (!(platform === 'windows')) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, execa_1.execa)('tasklist | findstr /I "Code.exe Cursor.exe Windsurf.exe idea64.exe pycharm64.exe webstorm64.exe phpstorm64.exe rubymine64.exe clion64.exe goland64.exe rider64.exe datagrip64.exe appcode.exe dataspell64.exe aqua64.exe gateway64.exe fleet.exe studio64.exe"', { shell: true, reject: false })];
                case 4:
                    result = _t.sent();
                    stdout = (_r = result.stdout) !== null && _r !== void 0 ? _r : '';
                    normalizedStdout = stdout.toLowerCase();
                    for (_e = 0, _f = Object.entries(supportedIdeConfigs); _e < _f.length; _e++) {
                        _g = _f[_e], ide = _g[0], config = _g[1];
                        for (_h = 0, _j = config.processKeywordsWindows; _h < _j.length; _h++) {
                            keyword = _j[_h];
                            if (normalizedStdout.includes(keyword.toLowerCase())) {
                                runningIDEs.push(ide);
                                break;
                            }
                        }
                    }
                    return [3 /*break*/, 7];
                case 5:
                    if (!(platform === 'linux')) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, execa_1.execa)('ps aux | grep -E "code|cursor|windsurf|idea|pycharm|webstorm|phpstorm|rubymine|clion|goland|rider|datagrip|dataspell|aqua|gateway|fleet|android-studio" | grep -v grep', { shell: true, reject: false })];
                case 6:
                    result = _t.sent();
                    stdout = (_s = result.stdout) !== null && _s !== void 0 ? _s : '';
                    normalizedStdout = stdout.toLowerCase();
                    for (_k = 0, _l = Object.entries(supportedIdeConfigs); _k < _l.length; _k++) {
                        _m = _l[_k], ide = _m[0], config = _m[1];
                        for (_o = 0, _p = config.processKeywordsLinux; _o < _p.length; _o++) {
                            keyword = _p[_o];
                            if (normalizedStdout.includes(keyword)) {
                                if (ide !== 'vscode') {
                                    runningIDEs.push(ide);
                                    break;
                                }
                                else if (!normalizedStdout.includes('cursor') &&
                                    !normalizedStdout.includes('appcode')) {
                                    // Special case conflicting keywords from some of the IDEs.
                                    runningIDEs.push(ide);
                                    break;
                                }
                            }
                        }
                    }
                    _t.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_10 = _t.sent();
                    // If process detection fails, return empty array
                    (0, log_js_1.logError)(error_10);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/, runningIDEs];
            }
        });
    });
}
/**
 * Detects running IDEs and returns an array of IdeType for those that are running.
 * This performs fresh detection (~150ms) and updates the cache for subsequent
 * detectRunningIDEsCached() calls.
 */
function detectRunningIDEs() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, detectRunningIDEsImpl()];
                case 1:
                    result = _a.sent();
                    cachedRunningIDEs = result;
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Returns cached IDE detection results, or performs detection if cache is empty.
 * Use this for performance-sensitive paths like tips where fresh results aren't needed.
 */
function detectRunningIDEsCached() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (cachedRunningIDEs === null) {
                return [2 /*return*/, detectRunningIDEs()];
            }
            return [2 /*return*/, cachedRunningIDEs];
        });
    });
}
/**
 * Resets the cache for detectRunningIDEsCached.
 * Exported for testing - allows resetting state between tests.
 */
function resetDetectRunningIDEs() {
    cachedRunningIDEs = null;
}
function getConnectedIdeName(mcpClients) {
    var ideClient = mcpClients.find(function (client) { return client.type === 'connected' && client.name === 'ide'; });
    return getIdeClientName(ideClient);
}
function getIdeClientName(ideClient) {
    var config = ideClient === null || ideClient === void 0 ? void 0 : ideClient.config;
    return (config === null || config === void 0 ? void 0 : config.type) === 'sse-ide' || (config === null || config === void 0 ? void 0 : config.type) === 'ws-ide'
        ? config.ideName
        : (0, exports.isSupportedTerminal)()
            ? toIDEDisplayName(envDynamic_js_1.envDynamic.terminal)
            : null;
}
var EDITOR_DISPLAY_NAMES = {
    code: 'VS Code',
    cursor: 'Cursor',
    windsurf: 'Windsurf',
    antigravity: 'Antigravity',
    vi: 'Vim',
    vim: 'Vim',
    nano: 'nano',
    notepad: 'Notepad',
    'start /wait notepad': 'Notepad',
    emacs: 'Emacs',
    subl: 'Sublime Text',
    atom: 'Atom',
};
function toIDEDisplayName(terminal) {
    if (!terminal)
        return 'IDE';
    var config = supportedIdeConfigs[terminal];
    if (config) {
        return config.displayName;
    }
    // Check editor command names (exact match first)
    var editorName = EDITOR_DISPLAY_NAMES[terminal.toLowerCase().trim()];
    if (editorName) {
        return editorName;
    }
    // Extract command name from path/arguments (e.g., "/usr/bin/code --wait" -> "code")
    var command = terminal.split(' ')[0];
    var commandName = command ? (0, path_1.basename)(command).toLowerCase() : null;
    if (commandName) {
        var mappedName = EDITOR_DISPLAY_NAMES[commandName];
        if (mappedName) {
            return mappedName;
        }
        // Fallback: capitalize the command basename
        return (0, capitalize_js_1.default)(commandName);
    }
    // Fallback: capitalize first letter
    return (0, capitalize_js_1.default)(terminal);
}
/**
 * Gets the connected IDE client from a list of MCP clients
 * @param mcpClients - Array of wrapped MCP clients
 * @returns The connected IDE client, or undefined if not found
 */
function getConnectedIdeClient(mcpClients) {
    if (!mcpClients) {
        return undefined;
    }
    var ideClient = mcpClients.find(function (client) { return client.type === 'connected' && client.name === 'ide'; });
    // Type guard to ensure we return the correct type
    return (ideClient === null || ideClient === void 0 ? void 0 : ideClient.type) === 'connected' ? ideClient : undefined;
}
/**
 * Notifies the IDE that a new prompt has been submitted.
 * This triggers IDE-specific actions like closing all diff tabs.
 */
function closeOpenDiffs(ideClient) {
    return __awaiter(this, void 0, void 0, function () {
        var _1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, client_js_1.callIdeRpc)('closeAllDiffTabs', {}, ideClient)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _1 = _a.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Initializes IDE detection and extension installation, then calls the provided callback
 * with the detected IDE information and installation status.
 * @param ideToInstallExtension The ide to install the extension to (if installing from external terminal)
 * @param onIdeDetected Callback to be called when an IDE is detected (including null)
 * @param onInstallationComplete Callback to be called when extension installation is complete
 */
function initializeIdeIntegration(onIdeDetected, ideToInstallExtension, onShowIdeOnboarding, onInstallationComplete) {
    return __awaiter(this, void 0, void 0, function () {
        var shouldAutoInstall, ideType_1;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            // Don't await so we don't block startup, but return a promise that resolves with the status
            void findAvailableIDE().then(onIdeDetected);
            shouldAutoInstall = (_a = (0, config_js_1.getGlobalConfig)().autoInstallIdeExtension) !== null && _a !== void 0 ? _a : true;
            if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL) &&
                shouldAutoInstall) {
                ideType_1 = ideToInstallExtension !== null && ideToInstallExtension !== void 0 ? ideToInstallExtension : getTerminalIdeType();
                if (ideType_1) {
                    if (isVSCodeIde(ideType_1)) {
                        void isIDEExtensionInstalled(ideType_1).then(function (isAlreadyInstalled) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                void maybeInstallIDEExtension(ideType_1)
                                    .catch(function (error) {
                                    var ideInstallationStatus = {
                                        installed: false,
                                        error: error.message || 'Installation failed',
                                        installedVersion: null,
                                        ideType: ideType_1,
                                    };
                                    return ideInstallationStatus;
                                })
                                    .then(function (status) {
                                    onInstallationComplete(status);
                                    if (status === null || status === void 0 ? void 0 : status.installed) {
                                        // If we installed and don't yet have an IDE, search again.
                                        void findAvailableIDE().then(onIdeDetected);
                                    }
                                    if (!isAlreadyInstalled &&
                                        (status === null || status === void 0 ? void 0 : status.installed) === true &&
                                        !ideOnboardingDialog().hasIdeOnboardingDialogBeenShown()) {
                                        onShowIdeOnboarding();
                                    }
                                });
                                return [2 /*return*/];
                            });
                        }); });
                    }
                    else if (isJetBrainsIde(ideType_1)) {
                        // Always check installation to populate the sync cache used by status notices
                        void isIDEExtensionInstalled(ideType_1).then(function (installed) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (installed &&
                                    !ideOnboardingDialog().hasIdeOnboardingDialogBeenShown()) {
                                    onShowIdeOnboarding();
                                }
                                return [2 /*return*/];
                            });
                        }); });
                    }
                }
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Detects the host IP to use to connect to the extension.
 */
var detectHostIP = (0, memoize_js_1.default)(function (isIdeRunningInWindows, port) { return __awaiter(void 0, void 0, void 0, function () {
    var routeResult, gatewayMatch, gatewayIP, _2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.env.CLAUDE_CODE_IDE_HOST_OVERRIDE) {
                    return [2 /*return*/, process.env.CLAUDE_CODE_IDE_HOST_OVERRIDE];
                }
                if ((0, platform_js_1.getPlatform)() !== 'wsl' || !isIdeRunningInWindows) {
                    return [2 /*return*/, '127.0.0.1'];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, (0, execa_1.execa)('ip route show | grep -i default', {
                        shell: true,
                        reject: false,
                    })];
            case 2:
                routeResult = _a.sent();
                if (!(routeResult.exitCode === 0 && routeResult.stdout)) return [3 /*break*/, 4];
                gatewayMatch = routeResult.stdout.match(/default via (\d+\.\d+\.\d+\.\d+)/);
                if (!gatewayMatch) return [3 /*break*/, 4];
                gatewayIP = gatewayMatch[1];
                return [4 /*yield*/, checkIdeConnection(gatewayIP, port)];
            case 3:
                if (_a.sent()) {
                    return [2 /*return*/, gatewayIP];
                }
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                _2 = _a.sent();
                return [3 /*break*/, 6];
            case 6: 
            // Fallback to the default if we cannot find anything
            return [2 /*return*/, '127.0.0.1'];
        }
    });
}); }, function (isIdeRunningInWindows, port) { return "".concat(isIdeRunningInWindows, ":").concat(port); });
function installFromArtifactory(command) {
    return __awaiter(this, void 0, void 0, function () {
        var npmrcPath, authToken, fs, npmrcContent, lines, _i, lines_2, line, match, error_11, versionUrl, versionResponse, version, vsixUrl, tempVsixPath, vsixResponse_1, writeStream_1, result, _a, error_12;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    npmrcPath = (0, path_1.join)(os.homedir(), '.npmrc');
                    authToken = null;
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(npmrcPath, {
                            encoding: 'utf8',
                        })];
                case 2:
                    npmrcContent = _b.sent();
                    lines = npmrcContent.split('\n');
                    for (_i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
                        line = lines_2[_i];
                        match = line.match(/\/\/artifactory\.infra\.ant\.dev\/artifactory\/api\/npm\/npm-all\/:_authToken=(.+)/);
                        if (match && match[1]) {
                            authToken = match[1].trim();
                            break;
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_11 = _b.sent();
                    (0, log_js_1.logError)(error_11);
                    throw new Error("Failed to read npm authentication: ".concat(error_11));
                case 4:
                    if (!authToken) {
                        throw new Error('No artifactory auth token found in ~/.npmrc');
                    }
                    versionUrl = 'https://artifactory.infra.ant.dev/artifactory/armorcode-claude-code-internal/claude-vscode-releases/stable';
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 17, , 18]);
                    return [4 /*yield*/, axios_1.default.get(versionUrl, {
                            headers: {
                                Authorization: "Bearer ".concat(authToken),
                            },
                        })];
                case 6:
                    versionResponse = _b.sent();
                    version = versionResponse.data.trim();
                    if (!version) {
                        throw new Error('No version found in artifactory response');
                    }
                    vsixUrl = "https://artifactory.infra.ant.dev/artifactory/armorcode-claude-code-internal/claude-vscode-releases/".concat(version, "/claude-code.vsix");
                    tempVsixPath = (0, path_1.join)(os.tmpdir(), "claude-code-".concat(version, "-").concat(Date.now(), ".vsix"));
                    _b.label = 7;
                case 7:
                    _b.trys.push([7, , 12, 16]);
                    return [4 /*yield*/, axios_1.default.get(vsixUrl, {
                            headers: {
                                Authorization: "Bearer ".concat(authToken),
                            },
                            responseType: 'stream',
                        })
                        // Write the downloaded file to disk
                    ];
                case 8:
                    vsixResponse_1 = _b.sent();
                    writeStream_1 = (0, fsOperations_js_1.getFsImplementation)().createWriteStream(tempVsixPath);
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            vsixResponse_1.data.pipe(writeStream_1);
                            writeStream_1.on('finish', resolve);
                            writeStream_1.on('error', reject);
                        })
                        // Install the .vsix file
                        // Add delay to prevent code command crashes
                    ];
                case 9:
                    _b.sent();
                    // Install the .vsix file
                    // Add delay to prevent code command crashes
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(500)];
                case 10:
                    // Install the .vsix file
                    // Add delay to prevent code command crashes
                    _b.sent();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)(command, ['--force', '--install-extension', tempVsixPath], {
                            env: getInstallationEnv(),
                        })];
                case 11:
                    result = _b.sent();
                    if (result.code !== 0) {
                        throw new Error("".concat(result.code, ": ").concat(result.error, " ").concat(result.stderr));
                    }
                    return [2 /*return*/, version];
                case 12:
                    _b.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, fs.unlink(tempVsixPath)];
                case 13:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 14:
                    _a = _b.sent();
                    return [3 /*break*/, 15];
                case 15: return [7 /*endfinally*/];
                case 16: return [3 /*break*/, 18];
                case 17:
                    error_12 = _b.sent();
                    if (axios_1.default.isAxiosError(error_12)) {
                        throw new Error("Failed to fetch extension version from artifactory: ".concat(error_12.message));
                    }
                    throw error_12;
                case 18: return [2 /*return*/];
            }
        });
    });
}
