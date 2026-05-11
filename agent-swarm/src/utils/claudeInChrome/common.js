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
exports.BROWSER_DETECTION_ORDER = exports.CHROMIUM_BROWSERS = exports.CLAUDE_IN_CHROME_MCP_SERVER_NAME = void 0;
exports.getAllBrowserDataPaths = getAllBrowserDataPaths;
exports.getAllNativeMessagingHostsDirs = getAllNativeMessagingHostsDirs;
exports.getAllWindowsRegistryKeys = getAllWindowsRegistryKeys;
exports.detectAvailableBrowser = detectAvailableBrowser;
exports.isClaudeInChromeMCPServer = isClaudeInChromeMCPServer;
exports.trackClaudeInChromeTabId = trackClaudeInChromeTabId;
exports.isTrackedClaudeInChromeTabId = isTrackedClaudeInChromeTabId;
exports.openInChrome = openInChrome;
exports.getSocketDir = getSocketDir;
exports.getSecureSocketPath = getSecureSocketPath;
exports.getAllSocketPaths = getAllSocketPaths;
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var normalization_js_1 = require("../../services/mcp/normalization.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var platform_js_1 = require("../platform.js");
var which_js_1 = require("../which.js");
exports.CLAUDE_IN_CHROME_MCP_SERVER_NAME = 'claude-in-chrome';
exports.CHROMIUM_BROWSERS = {
    chrome: {
        name: 'Google Chrome',
        macos: {
            appName: 'Google Chrome',
            dataPath: ['Library', 'Application Support', 'Google', 'Chrome'],
            nativeMessagingPath: [
                'Library',
                'Application Support',
                'Google',
                'Chrome',
                'NativeMessagingHosts',
            ],
        },
        linux: {
            binaries: ['google-chrome', 'google-chrome-stable'],
            dataPath: ['.config', 'google-chrome'],
            nativeMessagingPath: ['.config', 'google-chrome', 'NativeMessagingHosts'],
        },
        windows: {
            dataPath: ['Google', 'Chrome', 'User Data'],
            registryKey: 'HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts',
        },
    },
    brave: {
        name: 'Brave',
        macos: {
            appName: 'Brave Browser',
            dataPath: [
                'Library',
                'Application Support',
                'BraveSoftware',
                'Brave-Browser',
            ],
            nativeMessagingPath: [
                'Library',
                'Application Support',
                'BraveSoftware',
                'Brave-Browser',
                'NativeMessagingHosts',
            ],
        },
        linux: {
            binaries: ['brave-browser', 'brave'],
            dataPath: ['.config', 'BraveSoftware', 'Brave-Browser'],
            nativeMessagingPath: [
                '.config',
                'BraveSoftware',
                'Brave-Browser',
                'NativeMessagingHosts',
            ],
        },
        windows: {
            dataPath: ['BraveSoftware', 'Brave-Browser', 'User Data'],
            registryKey: 'HKCU\\Software\\BraveSoftware\\Brave-Browser\\NativeMessagingHosts',
        },
    },
    arc: {
        name: 'Arc',
        macos: {
            appName: 'Arc',
            dataPath: ['Library', 'Application Support', 'Arc', 'User Data'],
            nativeMessagingPath: [
                'Library',
                'Application Support',
                'Arc',
                'User Data',
                'NativeMessagingHosts',
            ],
        },
        linux: {
            // Arc is not available on Linux
            binaries: [],
            dataPath: [],
            nativeMessagingPath: [],
        },
        windows: {
            // Arc Windows is Chromium-based
            dataPath: ['Arc', 'User Data'],
            registryKey: 'HKCU\\Software\\ArcBrowser\\Arc\\NativeMessagingHosts',
        },
    },
    chromium: {
        name: 'Chromium',
        macos: {
            appName: 'Chromium',
            dataPath: ['Library', 'Application Support', 'Chromium'],
            nativeMessagingPath: [
                'Library',
                'Application Support',
                'Chromium',
                'NativeMessagingHosts',
            ],
        },
        linux: {
            binaries: ['chromium', 'chromium-browser'],
            dataPath: ['.config', 'chromium'],
            nativeMessagingPath: ['.config', 'chromium', 'NativeMessagingHosts'],
        },
        windows: {
            dataPath: ['Chromium', 'User Data'],
            registryKey: 'HKCU\\Software\\Chromium\\NativeMessagingHosts',
        },
    },
    edge: {
        name: 'Microsoft Edge',
        macos: {
            appName: 'Microsoft Edge',
            dataPath: ['Library', 'Application Support', 'Microsoft Edge'],
            nativeMessagingPath: [
                'Library',
                'Application Support',
                'Microsoft Edge',
                'NativeMessagingHosts',
            ],
        },
        linux: {
            binaries: ['microsoft-edge', 'microsoft-edge-stable'],
            dataPath: ['.config', 'microsoft-edge'],
            nativeMessagingPath: [
                '.config',
                'microsoft-edge',
                'NativeMessagingHosts',
            ],
        },
        windows: {
            dataPath: ['Microsoft', 'Edge', 'User Data'],
            registryKey: 'HKCU\\Software\\Microsoft\\Edge\\NativeMessagingHosts',
        },
    },
    vivaldi: {
        name: 'Vivaldi',
        macos: {
            appName: 'Vivaldi',
            dataPath: ['Library', 'Application Support', 'Vivaldi'],
            nativeMessagingPath: [
                'Library',
                'Application Support',
                'Vivaldi',
                'NativeMessagingHosts',
            ],
        },
        linux: {
            binaries: ['vivaldi', 'vivaldi-stable'],
            dataPath: ['.config', 'vivaldi'],
            nativeMessagingPath: ['.config', 'vivaldi', 'NativeMessagingHosts'],
        },
        windows: {
            dataPath: ['Vivaldi', 'User Data'],
            registryKey: 'HKCU\\Software\\Vivaldi\\NativeMessagingHosts',
        },
    },
    opera: {
        name: 'Opera',
        macos: {
            appName: 'Opera',
            dataPath: ['Library', 'Application Support', 'com.operasoftware.Opera'],
            nativeMessagingPath: [
                'Library',
                'Application Support',
                'com.operasoftware.Opera',
                'NativeMessagingHosts',
            ],
        },
        linux: {
            binaries: ['opera'],
            dataPath: ['.config', 'opera'],
            nativeMessagingPath: ['.config', 'opera', 'NativeMessagingHosts'],
        },
        windows: {
            dataPath: ['Opera Software', 'Opera Stable'],
            registryKey: 'HKCU\\Software\\Opera Software\\Opera Stable\\NativeMessagingHosts',
            useRoaming: true, // Opera uses Roaming AppData, not Local
        },
    },
};
// Priority order for browser detection (most common first)
exports.BROWSER_DETECTION_ORDER = [
    'chrome',
    'brave',
    'arc',
    'edge',
    'chromium',
    'vivaldi',
    'opera',
];
/**
 * Get all browser data paths to check for extension installation
 */
function getAllBrowserDataPaths() {
    var platform = (0, platform_js_1.getPlatform)();
    var home = (0, os_1.homedir)();
    var paths = [];
    for (var _i = 0, BROWSER_DETECTION_ORDER_1 = exports.BROWSER_DETECTION_ORDER; _i < BROWSER_DETECTION_ORDER_1.length; _i++) {
        var browserId = BROWSER_DETECTION_ORDER_1[_i];
        var config = exports.CHROMIUM_BROWSERS[browserId];
        var dataPath = void 0;
        switch (platform) {
            case 'macos':
                dataPath = config.macos.dataPath;
                break;
            case 'linux':
            case 'wsl':
                dataPath = config.linux.dataPath;
                break;
            case 'windows': {
                if (config.windows.dataPath.length > 0) {
                    var appDataBase = config.windows.useRoaming
                        ? (0, path_1.join)(home, 'AppData', 'Roaming')
                        : (0, path_1.join)(home, 'AppData', 'Local');
                    paths.push({
                        browser: browserId,
                        path: path_1.join.apply(void 0, __spreadArray([appDataBase], config.windows.dataPath, false)),
                    });
                }
                continue;
            }
        }
        if (dataPath && dataPath.length > 0) {
            paths.push({
                browser: browserId,
                path: path_1.join.apply(void 0, __spreadArray([home], dataPath, false)),
            });
        }
    }
    return paths;
}
/**
 * Get native messaging host directories for all supported browsers
 */
function getAllNativeMessagingHostsDirs() {
    var platform = (0, platform_js_1.getPlatform)();
    var home = (0, os_1.homedir)();
    var paths = [];
    for (var _i = 0, BROWSER_DETECTION_ORDER_2 = exports.BROWSER_DETECTION_ORDER; _i < BROWSER_DETECTION_ORDER_2.length; _i++) {
        var browserId = BROWSER_DETECTION_ORDER_2[_i];
        var config = exports.CHROMIUM_BROWSERS[browserId];
        switch (platform) {
            case 'macos':
                if (config.macos.nativeMessagingPath.length > 0) {
                    paths.push({
                        browser: browserId,
                        path: path_1.join.apply(void 0, __spreadArray([home], config.macos.nativeMessagingPath, false)),
                    });
                }
                break;
            case 'linux':
            case 'wsl':
                if (config.linux.nativeMessagingPath.length > 0) {
                    paths.push({
                        browser: browserId,
                        path: path_1.join.apply(void 0, __spreadArray([home], config.linux.nativeMessagingPath, false)),
                    });
                }
                break;
            case 'windows':
                // Windows uses registry, not file paths for native messaging
                // We'll use a common location for the manifest file
                break;
        }
    }
    return paths;
}
/**
 * Get Windows registry keys for all supported browsers
 */
function getAllWindowsRegistryKeys() {
    var keys = [];
    for (var _i = 0, BROWSER_DETECTION_ORDER_3 = exports.BROWSER_DETECTION_ORDER; _i < BROWSER_DETECTION_ORDER_3.length; _i++) {
        var browserId = BROWSER_DETECTION_ORDER_3[_i];
        var config = exports.CHROMIUM_BROWSERS[browserId];
        if (config.windows.registryKey) {
            keys.push({
                browser: browserId,
                key: config.windows.registryKey,
            });
        }
    }
    return keys;
}
/**
 * Detect which browser to use for opening URLs
 * Returns the first available browser, or null if none found
 */
function detectAvailableBrowser() {
    return __awaiter(this, void 0, void 0, function () {
        var platform, _i, BROWSER_DETECTION_ORDER_4, browserId, config, _a, appPath, stats, e_1, _b, _c, binary, home, appDataBase, dataPath, stats, e_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    platform = (0, platform_js_1.getPlatform)();
                    _i = 0, BROWSER_DETECTION_ORDER_4 = exports.BROWSER_DETECTION_ORDER;
                    _d.label = 1;
                case 1:
                    if (!(_i < BROWSER_DETECTION_ORDER_4.length)) return [3 /*break*/, 18];
                    browserId = BROWSER_DETECTION_ORDER_4[_i];
                    config = exports.CHROMIUM_BROWSERS[browserId];
                    _a = platform;
                    switch (_a) {
                        case 'macos': return [3 /*break*/, 2];
                        case 'wsl': return [3 /*break*/, 7];
                        case 'linux': return [3 /*break*/, 7];
                        case 'windows': return [3 /*break*/, 12];
                    }
                    return [3 /*break*/, 17];
                case 2:
                    appPath = "/Applications/".concat(config.macos.appName, ".app");
                    _d.label = 3;
                case 3:
                    _d.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.stat)(appPath)];
                case 4:
                    stats = _d.sent();
                    if (stats.isDirectory()) {
                        (0, debug_js_1.logForDebugging)("[Claude in Chrome] Detected browser: ".concat(config.name));
                        return [2 /*return*/, browserId];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _d.sent();
                    if (!(0, errors_js_1.isFsInaccessible)(e_1))
                        throw e_1;
                    return [3 /*break*/, 6];
                case 6: return [3 /*break*/, 17];
                case 7:
                    _b = 0, _c = config.linux.binaries;
                    _d.label = 8;
                case 8:
                    if (!(_b < _c.length)) return [3 /*break*/, 11];
                    binary = _c[_b];
                    return [4 /*yield*/, (0, which_js_1.which)(binary).catch(function () { return null; })];
                case 9:
                    if (_d.sent()) {
                        (0, debug_js_1.logForDebugging)("[Claude in Chrome] Detected browser: ".concat(config.name));
                        return [2 /*return*/, browserId];
                    }
                    _d.label = 10;
                case 10:
                    _b++;
                    return [3 /*break*/, 8];
                case 11: return [3 /*break*/, 17];
                case 12:
                    home = (0, os_1.homedir)();
                    if (!(config.windows.dataPath.length > 0)) return [3 /*break*/, 16];
                    appDataBase = config.windows.useRoaming
                        ? (0, path_1.join)(home, 'AppData', 'Roaming')
                        : (0, path_1.join)(home, 'AppData', 'Local');
                    dataPath = path_1.join.apply(void 0, __spreadArray([appDataBase], config.windows.dataPath, false));
                    _d.label = 13;
                case 13:
                    _d.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, (0, promises_1.stat)(dataPath)];
                case 14:
                    stats = _d.sent();
                    if (stats.isDirectory()) {
                        (0, debug_js_1.logForDebugging)("[Claude in Chrome] Detected browser: ".concat(config.name));
                        return [2 /*return*/, browserId];
                    }
                    return [3 /*break*/, 16];
                case 15:
                    e_2 = _d.sent();
                    if (!(0, errors_js_1.isFsInaccessible)(e_2))
                        throw e_2;
                    return [3 /*break*/, 16];
                case 16: return [3 /*break*/, 17];
                case 17:
                    _i++;
                    return [3 /*break*/, 1];
                case 18: return [2 /*return*/, null];
            }
        });
    });
}
function isClaudeInChromeMCPServer(name) {
    return (0, normalization_js_1.normalizeNameForMCP)(name) === exports.CLAUDE_IN_CHROME_MCP_SERVER_NAME;
}
var MAX_TRACKED_TABS = 200;
var trackedTabIds = new Set();
function trackClaudeInChromeTabId(tabId) {
    if (trackedTabIds.size >= MAX_TRACKED_TABS && !trackedTabIds.has(tabId)) {
        trackedTabIds.clear();
    }
    trackedTabIds.add(tabId);
}
function isTrackedClaudeInChromeTabId(tabId) {
    return trackedTabIds.has(tabId);
}
function openInChrome(url) {
    return __awaiter(this, void 0, void 0, function () {
        var currentPlatform, browser, config, _a, code, code, _i, _b, binary, code;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    currentPlatform = (0, platform_js_1.getPlatform)();
                    return [4 /*yield*/, detectAvailableBrowser()];
                case 1:
                    browser = _c.sent();
                    if (!browser) {
                        (0, debug_js_1.logForDebugging)('[Claude in Chrome] No compatible browser found');
                        return [2 /*return*/, false];
                    }
                    config = exports.CHROMIUM_BROWSERS[browser];
                    _a = currentPlatform;
                    switch (_a) {
                        case 'macos': return [3 /*break*/, 2];
                        case 'windows': return [3 /*break*/, 4];
                        case 'wsl': return [3 /*break*/, 6];
                        case 'linux': return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 11];
                case 2: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('open', [
                        '-a',
                        config.macos.appName,
                        url,
                    ])];
                case 3:
                    code = (_c.sent()).code;
                    return [2 /*return*/, code === 0];
                case 4: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('rundll32', ['url,OpenURL', url])];
                case 5:
                    code = (_c.sent()).code;
                    return [2 /*return*/, code === 0];
                case 6:
                    _i = 0, _b = config.linux.binaries;
                    _c.label = 7;
                case 7:
                    if (!(_i < _b.length)) return [3 /*break*/, 10];
                    binary = _b[_i];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(binary, [url])];
                case 8:
                    code = (_c.sent()).code;
                    if (code === 0) {
                        return [2 /*return*/, true];
                    }
                    _c.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 7];
                case 10: return [2 /*return*/, false];
                case 11: return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Get the socket directory path (Unix only)
 */
function getSocketDir() {
    return "/tmp/claude-mcp-browser-bridge-".concat(getUsername());
}
/**
 * Get the socket path (Unix) or pipe name (Windows)
 */
function getSecureSocketPath() {
    if ((0, os_1.platform)() === 'win32') {
        return "\\\\.\\pipe\\".concat(getSocketName());
    }
    return (0, path_1.join)(getSocketDir(), "".concat(process.pid, ".sock"));
}
/**
 * Get all socket paths including PID-based sockets in the directory
 * and legacy fallback paths
 */
function getAllSocketPaths() {
    // Windows uses named pipes, not Unix sockets
    if ((0, os_1.platform)() === 'win32') {
        return ["\\\\.\\pipe\\".concat(getSocketName())];
    }
    var paths = [];
    var socketDir = getSocketDir();
    // Scan for *.sock files in the socket directory
    try {
        // eslint-disable-next-line custom-rules/no-sync-fs -- ClaudeForChromeContext.getSocketPaths (external @ant/claude-for-chrome-mcp) requires a sync () => string[] callback
        var files = (0, fs_1.readdirSync)(socketDir);
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            if (file.endsWith('.sock')) {
                paths.push((0, path_1.join)(socketDir, file));
            }
        }
    }
    catch (_a) {
        // Directory may not exist yet
    }
    // Legacy fallback paths
    var legacyName = "claude-mcp-browser-bridge-".concat(getUsername());
    var legacyTmpdir = (0, path_1.join)((0, os_1.tmpdir)(), legacyName);
    var legacyTmp = "/tmp/".concat(legacyName);
    if (!paths.includes(legacyTmpdir)) {
        paths.push(legacyTmpdir);
    }
    if (legacyTmpdir !== legacyTmp && !paths.includes(legacyTmp)) {
        paths.push(legacyTmp);
    }
    return paths;
}
function getSocketName() {
    // NOTE: This must match the one used in the Claude in Chrome MCP
    return "claude-mcp-browser-bridge-".concat(getUsername());
}
function getUsername() {
    try {
        return (0, os_1.userInfo)().username || 'default';
    }
    catch (_a) {
        return process.env.USER || process.env.USERNAME || 'default';
    }
}
