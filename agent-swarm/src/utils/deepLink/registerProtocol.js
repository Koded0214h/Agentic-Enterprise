"use strict";
/**
 * Protocol Handler Registration
 *
 * Registers the `claude-cli://` custom URI scheme with the OS,
 * so that clicking a `claude-cli://` link in a browser (or any app) will
 * invoke `claude --handle-uri <url>`.
 *
 * Platform details:
 *   macOS  — Creates a minimal .app trampoline in ~/Applications with
 *            CFBundleURLTypes in its Info.plist
 *   Linux  — Creates a .desktop file in $XDG_DATA_HOME/applications
 *            (default ~/.local/share/applications) and registers it with xdg-mime
 *   Windows — Writes registry keys under HKEY_CURRENT_USER\Software\Classes
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
exports.MACOS_BUNDLE_ID = void 0;
exports.registerProtocolHandler = registerProtocolHandler;
exports.isProtocolHandlerCurrent = isProtocolHandlerCurrent;
exports.ensureDeepLinkProtocolRegistered = ensureDeepLinkProtocolRegistered;
var fs_1 = require("fs");
var os = require("os");
var path = require("path");
var growthbook_js_1 = require("src/services/analytics/growthbook.js");
var index_js_1 = require("src/services/analytics/index.js");
var debug_js_1 = require("../debug.js");
var envUtils_js_1 = require("../envUtils.js");
var errors_js_1 = require("../errors.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var settings_js_1 = require("../settings/settings.js");
var which_js_1 = require("../which.js");
var xdg_js_1 = require("../xdg.js");
var parseDeepLink_js_1 = require("./parseDeepLink.js");
exports.MACOS_BUNDLE_ID = 'com.anthropic.claude-code-url-handler';
var APP_NAME = 'Claude Code URL Handler';
var DESKTOP_FILE_NAME = 'claude-code-url-handler.desktop';
var MACOS_APP_NAME = 'Claude Code URL Handler.app';
// Shared between register* (writes these paths/values) and
// isProtocolHandlerCurrent (reads them back). Keep the writer and reader
// in lockstep — drift here means the check returns a perpetual false.
var MACOS_APP_DIR = path.join(os.homedir(), 'Applications', MACOS_APP_NAME);
var MACOS_SYMLINK_PATH = path.join(MACOS_APP_DIR, 'Contents', 'MacOS', 'claude');
function linuxDesktopPath() {
    return path.join((0, xdg_js_1.getXDGDataHome)(), 'applications', DESKTOP_FILE_NAME);
}
var WINDOWS_REG_KEY = "HKEY_CURRENT_USER\\Software\\Classes\\".concat(parseDeepLink_js_1.DEEP_LINK_PROTOCOL);
var WINDOWS_COMMAND_KEY = "".concat(WINDOWS_REG_KEY, "\\shell\\open\\command");
var FAILURE_BACKOFF_MS = 24 * 60 * 60 * 1000;
function linuxExecLine(claudePath) {
    return "Exec=\"".concat(claudePath, "\" --handle-uri %u");
}
function windowsCommandValue(claudePath) {
    return "\"".concat(claudePath, "\" --handle-uri \"%1\"");
}
/**
 * Register the protocol handler on macOS.
 *
 * Creates a .app bundle where the CFBundleExecutable is a symlink to the
 * already-installed (and signed) `claude` binary. When macOS opens a
 * `claude-cli://` URL, it launches `claude` through this app bundle.
 * Claude then uses the url-handler NAPI module to read the URL from the
 * Apple Event and handles it normally.
 *
 * This approach avoids shipping a separate executable (which would need
 * to be signed and allowlisted by endpoint security tools like Santa).
 */
function registerMacos(claudePath) {
    return __awaiter(this, void 0, void 0, function () {
        var contentsDir, e_1, code, infoPlist, lsregister;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    contentsDir = path.join(MACOS_APP_DIR, 'Contents');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs_1.promises.rm(MACOS_APP_DIR, { recursive: true })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (code !== 'ENOENT') {
                        throw e_1;
                    }
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, fs_1.promises.mkdir(path.dirname(MACOS_SYMLINK_PATH), { recursive: true })
                    // Info.plist — registers the URL scheme with claude as the executable
                ];
                case 5:
                    _a.sent();
                    infoPlist = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n<plist version=\"1.0\">\n<dict>\n  <key>CFBundleIdentifier</key>\n  <string>".concat(exports.MACOS_BUNDLE_ID, "</string>\n  <key>CFBundleName</key>\n  <string>").concat(APP_NAME, "</string>\n  <key>CFBundleExecutable</key>\n  <string>claude</string>\n  <key>CFBundleVersion</key>\n  <string>1.0</string>\n  <key>CFBundlePackageType</key>\n  <string>APPL</string>\n  <key>LSBackgroundOnly</key>\n  <true/>\n  <key>CFBundleURLTypes</key>\n  <array>\n    <dict>\n      <key>CFBundleURLName</key>\n      <string>Claude Code Deep Link</string>\n      <key>CFBundleURLSchemes</key>\n      <array>\n        <string>").concat(parseDeepLink_js_1.DEEP_LINK_PROTOCOL, "</string>\n      </array>\n    </dict>\n  </array>\n</dict>\n</plist>");
                    return [4 /*yield*/, fs_1.promises.writeFile(path.join(contentsDir, 'Info.plist'), infoPlist)
                        // Symlink to the already-signed claude binary — avoids a new executable
                        // that would need signing and endpoint-security allowlisting.
                        // Written LAST among the throwing fs calls: isProtocolHandlerCurrent reads
                        // this symlink, so it acts as the commit marker. If Info.plist write
                        // failed above, no symlink → next session retries.
                    ];
                case 6:
                    _a.sent();
                    // Symlink to the already-signed claude binary — avoids a new executable
                    // that would need signing and endpoint-security allowlisting.
                    // Written LAST among the throwing fs calls: isProtocolHandlerCurrent reads
                    // this symlink, so it acts as the commit marker. If Info.plist write
                    // failed above, no symlink → next session retries.
                    return [4 /*yield*/, fs_1.promises.symlink(claudePath, MACOS_SYMLINK_PATH)
                        // Re-register the app with LaunchServices so macOS picks up the URL scheme.
                    ];
                case 7:
                    // Symlink to the already-signed claude binary — avoids a new executable
                    // that would need signing and endpoint-security allowlisting.
                    // Written LAST among the throwing fs calls: isProtocolHandlerCurrent reads
                    // this symlink, so it acts as the commit marker. If Info.plist write
                    // failed above, no symlink → next session retries.
                    _a.sent();
                    lsregister = '/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister';
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(lsregister, ['-R', MACOS_APP_DIR], { useCwd: false })];
                case 8:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("Registered ".concat(parseDeepLink_js_1.DEEP_LINK_PROTOCOL, ":// protocol handler at ").concat(MACOS_APP_DIR));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Register the protocol handler on Linux.
 * Creates a .desktop file and registers it with xdg-mime.
 */
function registerLinux(claudePath) {
    return __awaiter(this, void 0, void 0, function () {
        var desktopEntry, xdgMime, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_1.promises.mkdir(path.dirname(linuxDesktopPath()), { recursive: true })];
                case 1:
                    _a.sent();
                    desktopEntry = "[Desktop Entry]\nName=".concat(APP_NAME, "\nComment=Handle ").concat(parseDeepLink_js_1.DEEP_LINK_PROTOCOL, ":// deep links for Claude Code\n").concat(linuxExecLine(claudePath), "\nType=Application\nNoDisplay=true\nMimeType=x-scheme-handler/").concat(parseDeepLink_js_1.DEEP_LINK_PROTOCOL, ";\n");
                    return [4 /*yield*/, fs_1.promises.writeFile(linuxDesktopPath(), desktopEntry)
                        // Register as the default handler for the scheme. On headless boxes
                        // (WSL, Docker, CI) xdg-utils isn't installed — not a failure: there's
                        // no desktop to click links from, and some apps read the .desktop
                        // MimeType line directly. The artifact check still short-circuits
                        // next session since the .desktop file is present.
                    ];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, which_js_1.which)('xdg-mime')];
                case 3:
                    xdgMime = _a.sent();
                    if (!xdgMime) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(xdgMime, ['default', DESKTOP_FILE_NAME, "x-scheme-handler/".concat(parseDeepLink_js_1.DEEP_LINK_PROTOCOL)], { useCwd: false })];
                case 4:
                    code = (_a.sent()).code;
                    if (code !== 0) {
                        throw Object.assign(new Error("xdg-mime exited with code ".concat(code)), {
                            code: 'XDG_MIME_FAILED',
                        });
                    }
                    _a.label = 5;
                case 5:
                    (0, debug_js_1.logForDebugging)("Registered ".concat(parseDeepLink_js_1.DEEP_LINK_PROTOCOL, ":// protocol handler at ").concat(linuxDesktopPath()));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Register the protocol handler on Windows via the registry.
 */
function registerWindows(claudePath) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, args, code;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, _a = [
                        ['add', WINDOWS_REG_KEY, '/ve', '/d', "URL:".concat(APP_NAME), '/f'],
                        ['add', WINDOWS_REG_KEY, '/v', 'URL Protocol', '/d', '', '/f'],
                        [
                            'add',
                            WINDOWS_COMMAND_KEY,
                            '/ve',
                            '/d',
                            windowsCommandValue(claudePath),
                            '/f',
                        ],
                    ];
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    args = _a[_i];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('reg', args, { useCwd: false })];
                case 2:
                    code = (_b.sent()).code;
                    if (code !== 0) {
                        throw Object.assign(new Error("reg add exited with code ".concat(code)), {
                            code: 'REG_FAILED',
                        });
                    }
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    (0, debug_js_1.logForDebugging)("Registered ".concat(parseDeepLink_js_1.DEEP_LINK_PROTOCOL, ":// protocol handler in Windows registry"));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Register the `claude-cli://` protocol handler with the operating system.
 * After registration, clicking a `claude-cli://` link will invoke claude.
 */
function registerProtocolHandler(claudePath) {
    return __awaiter(this, void 0, void 0, function () {
        var resolved, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(claudePath !== null && claudePath !== void 0)) return [3 /*break*/, 1];
                    _a = claudePath;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, resolveClaudePath()];
                case 2:
                    _a = (_c.sent());
                    _c.label = 3;
                case 3:
                    resolved = _a;
                    _b = process.platform;
                    switch (_b) {
                        case 'darwin': return [3 /*break*/, 4];
                        case 'linux': return [3 /*break*/, 6];
                        case 'win32': return [3 /*break*/, 8];
                    }
                    return [3 /*break*/, 10];
                case 4: return [4 /*yield*/, registerMacos(resolved)];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 11];
                case 6: return [4 /*yield*/, registerLinux(resolved)];
                case 7:
                    _c.sent();
                    return [3 /*break*/, 11];
                case 8: return [4 /*yield*/, registerWindows(resolved)];
                case 9:
                    _c.sent();
                    return [3 /*break*/, 11];
                case 10: throw new Error("Unsupported platform: ".concat(process.platform));
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Resolve the claude binary path for protocol registration. Prefers the
 * native installer's stable symlink (~/.local/bin/claude) which survives
 * auto-updates; falls back to process.execPath when the symlink is absent
 * (dev builds, non-native installs).
 */
function resolveClaudePath() {
    return __awaiter(this, void 0, void 0, function () {
        var binaryName, stablePath, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    binaryName = process.platform === 'win32' ? 'claude.exe' : 'claude';
                    stablePath = path.join((0, xdg_js_1.getUserBinDir)(), binaryName);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs_1.promises.realpath(stablePath)];
                case 2:
                    _b.sent();
                    return [2 /*return*/, stablePath];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, process.execPath];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check whether the OS-level protocol handler is already registered AND
 * points at the expected `claude` binary. Reads the registration artifact
 * directly (symlink target, .desktop Exec line, registry value) rather than
 * a cached flag in ~/.claude.json, so:
 *   - the check is per-machine (config can sync across machines; OS state can't)
 *   - stale paths self-heal (install-method change → re-register next session)
 *   - deleted artifacts self-heal
 *
 * Any read error (ENOENT, EACCES, reg nonzero) → false → re-register.
 */
function isProtocolHandlerCurrent(claudePath) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, target, content, _b, stdout, code, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 9, , 10]);
                    _a = process.platform;
                    switch (_a) {
                        case 'darwin': return [3 /*break*/, 1];
                        case 'linux': return [3 /*break*/, 3];
                        case 'win32': return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 7];
                case 1: return [4 /*yield*/, fs_1.promises.readlink(MACOS_SYMLINK_PATH)];
                case 2:
                    target = _d.sent();
                    return [2 /*return*/, target === claudePath];
                case 3: return [4 /*yield*/, fs_1.promises.readFile(linuxDesktopPath(), 'utf8')];
                case 4:
                    content = _d.sent();
                    return [2 /*return*/, content.includes(linuxExecLine(claudePath))];
                case 5: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('reg', ['query', WINDOWS_COMMAND_KEY, '/ve'], { useCwd: false })];
                case 6:
                    _b = _d.sent(), stdout = _b.stdout, code = _b.code;
                    return [2 /*return*/, code === 0 && stdout.includes(windowsCommandValue(claudePath))];
                case 7: return [2 /*return*/, false];
                case 8: return [3 /*break*/, 10];
                case 9:
                    _c = _d.sent();
                    return [2 /*return*/, false];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Auto-register the claude-cli:// deep link protocol handler when missing
 * or stale. Runs every session from backgroundHousekeeping (fire-and-forget),
 * but the artifact check makes it a no-op after the first successful run
 * unless the install path moves or the OS artifact is deleted.
 */
function ensureDeepLinkProtocolRegistered() {
    return __awaiter(this, void 0, void 0, function () {
        var claudePath, failureMarkerPath, stat, _a, error_1, code;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if ((0, settings_js_1.getInitialSettings)().disableDeepLinkRegistration === 'disable') {
                        return [2 /*return*/];
                    }
                    if (!(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_lodestone_enabled', false)) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, resolveClaudePath()];
                case 1:
                    claudePath = _b.sent();
                    return [4 /*yield*/, isProtocolHandlerCurrent(claudePath)];
                case 2:
                    if (_b.sent()) {
                        return [2 /*return*/];
                    }
                    failureMarkerPath = path.join((0, envUtils_js_1.getClaudeConfigHomeDir)(), '.deep-link-register-failed');
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, fs_1.promises.stat(failureMarkerPath)];
                case 4:
                    stat = _b.sent();
                    if (Date.now() - stat.mtimeMs < FAILURE_BACKOFF_MS) {
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 6:
                    _b.trys.push([6, 9, , 12]);
                    return [4 /*yield*/, registerProtocolHandler(claudePath)];
                case 7:
                    _b.sent();
                    (0, index_js_1.logEvent)('tengu_deep_link_registered', { success: true });
                    (0, debug_js_1.logForDebugging)('Auto-registered claude-cli:// deep link protocol handler');
                    return [4 /*yield*/, fs_1.promises.rm(failureMarkerPath, { force: true }).catch(function () { })];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 9:
                    error_1 = _b.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_1);
                    (0, index_js_1.logEvent)('tengu_deep_link_registered', {
                        success: false,
                        error_code: code,
                    });
                    (0, debug_js_1.logForDebugging)("Failed to auto-register deep link protocol handler: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)), { level: 'warn' });
                    if (!(code === 'EACCES' || code === 'ENOSPC')) return [3 /*break*/, 11];
                    return [4 /*yield*/, fs_1.promises.writeFile(failureMarkerPath, '').catch(function () { })];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11: return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
