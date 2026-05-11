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
exports.getDesktopInstallStatus = getDesktopInstallStatus;
exports.openCurrentSessionInDesktop = openCurrentSessionInDesktop;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var semver_1 = require("semver");
var state_js_1 = require("../bootstrap/state.js");
var cwd_js_1 = require("./cwd.js");
var debug_js_1 = require("./debug.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var file_js_1 = require("./file.js");
var semver_js_1 = require("./semver.js");
var MIN_DESKTOP_VERSION = '1.1.2396';
function isDevMode() {
    if (process.env.NODE_ENV === 'development') {
        return true;
    }
    // Local builds from build directories are dev mode even with NODE_ENV=production
    var pathsToCheck = [process.argv[1] || '', process.execPath || ''];
    var buildDirs = [
        '/build-ant/',
        '/build-ant-native/',
        '/build-external/',
        '/build-external-native/',
    ];
    return pathsToCheck.some(function (p) { return buildDirs.some(function (dir) { return p.includes(dir); }); });
}
/**
 * Builds a deep link URL for Claude Desktop to resume a CLI session.
 * Format: claude://resume?session={sessionId}&cwd={cwd}
 * In dev mode: claude-dev://resume?session={sessionId}&cwd={cwd}
 */
function buildDesktopDeepLink(sessionId) {
    var protocol = isDevMode() ? 'claude-dev' : 'claude';
    var url = new URL("".concat(protocol, "://resume"));
    url.searchParams.set('session', sessionId);
    url.searchParams.set('cwd', (0, cwd_js_1.getCwd)());
    return url.toString();
}
/**
 * Check if Claude Desktop app is installed.
 * On macOS, checks for /Applications/Claude.app.
 * On Linux, checks if xdg-open can handle claude:// protocol.
 * On Windows, checks if the protocol handler exists.
 * In dev mode, always returns true (assumes dev Desktop is running).
 */
function isDesktopInstalled() {
    return __awaiter(this, void 0, void 0, function () {
        var platform, _a, code, stdout, code;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // In dev mode, assume the dev Desktop app is running
                    if (isDevMode()) {
                        return [2 /*return*/, true];
                    }
                    platform = process.platform;
                    if (!(platform === 'darwin')) return [3 /*break*/, 1];
                    // Check for Claude.app in /Applications
                    return [2 /*return*/, (0, file_js_1.pathExists)('/Applications/Claude.app')];
                case 1:
                    if (!(platform === 'linux')) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('xdg-mime', [
                            'query',
                            'default',
                            'x-scheme-handler/claude',
                        ])];
                case 2:
                    _a = _b.sent(), code = _a.code, stdout = _a.stdout;
                    return [2 /*return*/, code === 0 && stdout.trim().length > 0];
                case 3:
                    if (!(platform === 'win32')) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('reg', [
                            'query',
                            'HKEY_CLASSES_ROOT\\claude',
                            '/ve',
                        ])];
                case 4:
                    code = (_b.sent()).code;
                    return [2 /*return*/, code === 0];
                case 5: return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Detect the installed Claude Desktop version.
 * On macOS, reads CFBundleShortVersionString from the app plist.
 * On Windows, finds the highest app-X.Y.Z directory in the Squirrel install.
 * Returns null if version cannot be determined.
 */
function getDesktopVersion() {
    return __awaiter(this, void 0, void 0, function () {
        var platform, _a, code, stdout, version, localAppData, installDir, entries, versions, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    platform = process.platform;
                    if (!(platform === 'darwin')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('defaults', [
                            'read',
                            '/Applications/Claude.app/Contents/Info.plist',
                            'CFBundleShortVersionString',
                        ])];
                case 1:
                    _a = _c.sent(), code = _a.code, stdout = _a.stdout;
                    if (code !== 0) {
                        return [2 /*return*/, null];
                    }
                    version = stdout.trim();
                    return [2 /*return*/, version.length > 0 ? version : null];
                case 2:
                    if (!(platform === 'win32')) return [3 /*break*/, 6];
                    localAppData = process.env.LOCALAPPDATA;
                    if (!localAppData) {
                        return [2 /*return*/, null];
                    }
                    installDir = (0, path_1.join)(localAppData, 'AnthropicClaude');
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.readdir)(installDir)];
                case 4:
                    entries = _c.sent();
                    versions = entries
                        .filter(function (e) { return e.startsWith('app-'); })
                        .map(function (e) { return e.slice(4); })
                        .filter(function (v) { return (0, semver_1.coerce)(v) !== null; })
                        .sort(function (a, b) {
                        var ca = (0, semver_1.coerce)(a);
                        var cb = (0, semver_1.coerce)(b);
                        return ca.compare(cb);
                    });
                    return [2 /*return*/, versions.length > 0 ? versions[versions.length - 1] : null];
                case 5:
                    _b = _c.sent();
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Check Desktop install status including version compatibility.
 */
function getDesktopInstallStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var installed, version, _a, coerced;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, isDesktopInstalled()];
                case 1:
                    installed = _b.sent();
                    if (!installed) {
                        return [2 /*return*/, { status: 'not-installed' }];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, getDesktopVersion()];
                case 3:
                    version = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    // Best effort — proceed with handoff if version detection fails
                    return [2 /*return*/, { status: 'ready', version: 'unknown' }];
                case 5:
                    if (!version) {
                        // Can't determine version — assume it's ready (dev mode or unknown install)
                        return [2 /*return*/, { status: 'ready', version: 'unknown' }];
                    }
                    coerced = (0, semver_1.coerce)(version);
                    if (!coerced || !(0, semver_js_1.gte)(coerced.version, MIN_DESKTOP_VERSION)) {
                        return [2 /*return*/, { status: 'version-too-old', version: version }];
                    }
                    return [2 /*return*/, { status: 'ready', version: version }];
            }
        });
    });
}
/**
 * Opens a deep link URL using the platform-specific mechanism.
 * Returns true if the command succeeded, false otherwise.
 */
function openDeepLink(deepLinkUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var platform, code_1, code, code, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    platform = process.platform;
                    (0, debug_js_1.logForDebugging)("Opening deep link: ".concat(deepLinkUrl));
                    if (!(platform === 'darwin')) return [3 /*break*/, 4];
                    if (!isDevMode()) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('osascript', [
                            '-e',
                            "tell application \"Electron\" to open location \"".concat(deepLinkUrl, "\""),
                        ])];
                case 1:
                    code_1 = (_a.sent()).code;
                    return [2 /*return*/, code_1 === 0];
                case 2: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('open', [deepLinkUrl])];
                case 3:
                    code = (_a.sent()).code;
                    return [2 /*return*/, code === 0];
                case 4:
                    if (!(platform === 'linux')) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('xdg-open', [deepLinkUrl])];
                case 5:
                    code = (_a.sent()).code;
                    return [2 /*return*/, code === 0];
                case 6:
                    if (!(platform === 'win32')) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('cmd', [
                            '/c',
                            'start',
                            '',
                            deepLinkUrl,
                        ])];
                case 7:
                    code = (_a.sent()).code;
                    return [2 /*return*/, code === 0];
                case 8: return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Build and open a deep link to resume the current session in Claude Desktop.
 * Returns an object with success status and any error message.
 */
function openCurrentSessionInDesktop() {
    return __awaiter(this, void 0, void 0, function () {
        var sessionId, installed, deepLinkUrl, opened;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sessionId = (0, state_js_1.getSessionId)();
                    return [4 /*yield*/, isDesktopInstalled()];
                case 1:
                    installed = _a.sent();
                    if (!installed) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Claude Desktop is not installed. Install it from https://claude.ai/download',
                            }];
                    }
                    deepLinkUrl = buildDesktopDeepLink(sessionId);
                    return [4 /*yield*/, openDeepLink(deepLinkUrl)];
                case 2:
                    opened = _a.sent();
                    if (!opened) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Failed to open Claude Desktop. Please try opening it manually.',
                                deepLinkUrl: deepLinkUrl,
                            }];
                    }
                    return [2 /*return*/, { success: true, deepLinkUrl: deepLinkUrl }];
            }
        });
    });
}
