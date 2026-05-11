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
exports.CHROME_EXTENSION_URL = void 0;
exports.getAllBrowserDataPathsPortable = getAllBrowserDataPathsPortable;
exports.detectExtensionInstallationPortable = detectExtensionInstallationPortable;
exports.isChromeExtensionInstalledPortable = isChromeExtensionInstalledPortable;
exports.isChromeExtensionInstalled = isChromeExtensionInstalled;
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var errors_js_1 = require("../errors.js");
exports.CHROME_EXTENSION_URL = 'https://claude.ai/chrome';
// Production extension ID
var PROD_EXTENSION_ID = 'fcoeoabgfenejglbffodgkkbkcdhcgfn';
// Dev extension IDs (for internal use)
var DEV_EXTENSION_ID = 'dihbgbndebgnbjfmelmegjepbnkhlgni';
var ANT_EXTENSION_ID = 'dngcpimnedloihjnnfngkgjoidhnaolf';
function getExtensionIds() {
    return process.env.USER_TYPE === 'ant'
        ? [PROD_EXTENSION_ID, DEV_EXTENSION_ID, ANT_EXTENSION_ID]
        : [PROD_EXTENSION_ID];
}
// Browser detection order - must match BROWSER_DETECTION_ORDER from common.ts
var BROWSER_DETECTION_ORDER = [
    'chrome',
    'brave',
    'arc',
    'edge',
    'chromium',
    'vivaldi',
    'opera',
];
// Must match CHROMIUM_BROWSERS dataPath from common.ts
var CHROMIUM_BROWSERS = {
    chrome: {
        macos: ['Library', 'Application Support', 'Google', 'Chrome'],
        linux: ['.config', 'google-chrome'],
        windows: { path: ['Google', 'Chrome', 'User Data'] },
    },
    brave: {
        macos: ['Library', 'Application Support', 'BraveSoftware', 'Brave-Browser'],
        linux: ['.config', 'BraveSoftware', 'Brave-Browser'],
        windows: { path: ['BraveSoftware', 'Brave-Browser', 'User Data'] },
    },
    arc: {
        macos: ['Library', 'Application Support', 'Arc', 'User Data'],
        linux: [],
        windows: { path: ['Arc', 'User Data'] },
    },
    chromium: {
        macos: ['Library', 'Application Support', 'Chromium'],
        linux: ['.config', 'chromium'],
        windows: { path: ['Chromium', 'User Data'] },
    },
    edge: {
        macos: ['Library', 'Application Support', 'Microsoft Edge'],
        linux: ['.config', 'microsoft-edge'],
        windows: { path: ['Microsoft', 'Edge', 'User Data'] },
    },
    vivaldi: {
        macos: ['Library', 'Application Support', 'Vivaldi'],
        linux: ['.config', 'vivaldi'],
        windows: { path: ['Vivaldi', 'User Data'] },
    },
    opera: {
        macos: ['Library', 'Application Support', 'com.operasoftware.Opera'],
        linux: ['.config', 'opera'],
        windows: { path: ['Opera Software', 'Opera Stable'], useRoaming: true },
    },
};
/**
 * Get all browser data paths to check for extension installation.
 * Portable version that uses process.platform directly.
 */
function getAllBrowserDataPathsPortable() {
    var home = (0, os_1.homedir)();
    var paths = [];
    for (var _i = 0, BROWSER_DETECTION_ORDER_1 = BROWSER_DETECTION_ORDER; _i < BROWSER_DETECTION_ORDER_1.length; _i++) {
        var browserId = BROWSER_DETECTION_ORDER_1[_i];
        var config = CHROMIUM_BROWSERS[browserId];
        var dataPath = void 0;
        switch (process.platform) {
            case 'darwin':
                dataPath = config.macos;
                break;
            case 'linux':
                dataPath = config.linux;
                break;
            case 'win32': {
                if (config.windows.path.length > 0) {
                    var appDataBase = config.windows.useRoaming
                        ? (0, path_1.join)(home, 'AppData', 'Roaming')
                        : (0, path_1.join)(home, 'AppData', 'Local');
                    paths.push({
                        browser: browserId,
                        path: path_1.join.apply(void 0, __spreadArray([appDataBase], config.windows.path, false)),
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
 * Detects if the Claude in Chrome extension is installed by checking the Extensions
 * directory across all supported Chromium-based browsers and their profiles.
 *
 * This is a portable version that can be used by both TUI and VS Code extension.
 *
 * @param browserPaths - Array of browser data paths to check (from getAllBrowserDataPaths)
 * @param log - Optional logging callback for debug messages
 * @returns Object with isInstalled boolean and the browser where the extension was found
 */
function detectExtensionInstallationPortable(browserPaths, log) {
    return __awaiter(this, void 0, void 0, function () {
        var extensionIds, _i, browserPaths_1, _a, browser, browserBasePath, browserProfileEntries, e_1, profileDirs, _b, profileDirs_1, profile, _c, extensionIds_1, extensionId, extensionPath, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (browserPaths.length === 0) {
                        log === null || log === void 0 ? void 0 : log("[Claude in Chrome] No browser paths to check");
                        return [2 /*return*/, { isInstalled: false, browser: null }];
                    }
                    extensionIds = getExtensionIds();
                    _i = 0, browserPaths_1 = browserPaths;
                    _e.label = 1;
                case 1:
                    if (!(_i < browserPaths_1.length)) return [3 /*break*/, 14];
                    _a = browserPaths_1[_i], browser = _a.browser, browserBasePath = _a.path;
                    browserProfileEntries = [];
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.readdir)(browserBasePath, {
                            withFileTypes: true,
                        })];
                case 3:
                    browserProfileEntries = _e.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _e.sent();
                    // Browser not installed or path doesn't exist, continue to next browser
                    if ((0, errors_js_1.isFsInaccessible)(e_1))
                        return [3 /*break*/, 13];
                    throw e_1;
                case 5:
                    profileDirs = browserProfileEntries
                        .filter(function (entry) { return entry.isDirectory(); })
                        .filter(function (entry) { return entry.name === 'Default' || entry.name.startsWith('Profile '); })
                        .map(function (entry) { return entry.name; });
                    if (profileDirs.length > 0) {
                        log === null || log === void 0 ? void 0 : log("[Claude in Chrome] Found ".concat(browser, " profiles: ").concat(profileDirs.join(', ')));
                    }
                    _b = 0, profileDirs_1 = profileDirs;
                    _e.label = 6;
                case 6:
                    if (!(_b < profileDirs_1.length)) return [3 /*break*/, 13];
                    profile = profileDirs_1[_b];
                    _c = 0, extensionIds_1 = extensionIds;
                    _e.label = 7;
                case 7:
                    if (!(_c < extensionIds_1.length)) return [3 /*break*/, 12];
                    extensionId = extensionIds_1[_c];
                    extensionPath = (0, path_1.join)(browserBasePath, profile, 'Extensions', extensionId);
                    _e.label = 8;
                case 8:
                    _e.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, (0, promises_1.readdir)(extensionPath)];
                case 9:
                    _e.sent();
                    log === null || log === void 0 ? void 0 : log("[Claude in Chrome] Extension ".concat(extensionId, " found in ").concat(browser, " ").concat(profile));
                    return [2 /*return*/, { isInstalled: true, browser: browser }];
                case 10:
                    _d = _e.sent();
                    return [3 /*break*/, 11];
                case 11:
                    _c++;
                    return [3 /*break*/, 7];
                case 12:
                    _b++;
                    return [3 /*break*/, 6];
                case 13:
                    _i++;
                    return [3 /*break*/, 1];
                case 14:
                    log === null || log === void 0 ? void 0 : log("[Claude in Chrome] Extension not found in any browser");
                    return [2 /*return*/, { isInstalled: false, browser: null }];
            }
        });
    });
}
/**
 * Simple wrapper that returns just the boolean result
 */
function isChromeExtensionInstalledPortable(browserPaths, log) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, detectExtensionInstallationPortable(browserPaths, log)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.isInstalled];
            }
        });
    });
}
/**
 * Convenience function that gets browser paths automatically.
 * Use this when you don't need to provide custom browser paths.
 */
function isChromeExtensionInstalled(log) {
    var browserPaths = getAllBrowserDataPathsPortable();
    return isChromeExtensionInstalledPortable(browserPaths, log);
}
