"use strict";
/**
 * Package manager detection for Claude CLI
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
exports.getPackageManager = exports.detectApk = exports.detectRpm = exports.detectDeb = exports.detectPacman = exports.getOsRelease = void 0;
exports.detectMise = detectMise;
exports.detectAsdf = detectAsdf;
exports.detectHomebrew = detectHomebrew;
exports.detectWinget = detectWinget;
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var debug_js_1 = require("../debug.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var platform_js_1 = require("../platform.js");
/**
 * Parses /etc/os-release to extract the distro ID and ID_LIKE fields.
 * ID_LIKE identifies the distro family (e.g. Ubuntu has ID_LIKE=debian),
 * letting us skip package manager execs on distros that can't have them.
 * Returns null if the file is unreadable (pre-systemd or non-standard systems);
 * callers fall through to the exec in that case as a conservative fallback.
 */
exports.getOsRelease = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var content, idMatch, idLikeMatch, _a;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, promises_1.readFile)('/etc/os-release', 'utf8')];
            case 1:
                content = _e.sent();
                idMatch = content.match(/^ID=["']?(\S+?)["']?\s*$/m);
                idLikeMatch = content.match(/^ID_LIKE=["']?(.+?)["']?\s*$/m);
                return [2 /*return*/, {
                        id: (_b = idMatch === null || idMatch === void 0 ? void 0 : idMatch[1]) !== null && _b !== void 0 ? _b : '',
                        idLike: (_d = (_c = idLikeMatch === null || idLikeMatch === void 0 ? void 0 : idLikeMatch[1]) === null || _c === void 0 ? void 0 : _c.split(' ')) !== null && _d !== void 0 ? _d : [],
                    }];
            case 2:
                _a = _e.sent();
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); });
function isDistroFamily(osRelease, families) {
    return (families.includes(osRelease.id) ||
        osRelease.idLike.some(function (like) { return families.includes(like); }));
}
/**
 * Detects if the currently running Claude instance was installed via mise
 * (a polyglot tool version manager) by checking if the executable path
 * is within a mise installs directory.
 *
 * mise installs to: ~/.local/share/mise/installs/<tool>/<version>/
 */
function detectMise() {
    var execPath = process.execPath || process.argv[0] || '';
    // Check if the executable is within a mise installs directory
    if (/[/\\]mise[/\\]installs[/\\]/i.test(execPath)) {
        (0, debug_js_1.logForDebugging)("Detected mise installation: ".concat(execPath));
        return true;
    }
    return false;
}
/**
 * Detects if the currently running Claude instance was installed via asdf
 * (another polyglot tool version manager) by checking if the executable path
 * is within an asdf installs directory.
 *
 * asdf installs to: ~/.asdf/installs/<tool>/<version>/
 */
function detectAsdf() {
    var execPath = process.execPath || process.argv[0] || '';
    // Check if the executable is within an asdf installs directory
    if (/[/\\]\.?asdf[/\\]installs[/\\]/i.test(execPath)) {
        (0, debug_js_1.logForDebugging)("Detected asdf installation: ".concat(execPath));
        return true;
    }
    return false;
}
/**
 * Detects if the currently running Claude instance was installed via Homebrew
 * by checking if the executable path is within a Homebrew Caskroom directory.
 *
 * Note: We specifically check for Caskroom because npm can also be installed via
 * Homebrew, which would place npm global packages under the same Homebrew prefix
 * (e.g., /opt/homebrew/lib/node_modules). We need to distinguish between:
 * - Homebrew cask: /opt/homebrew/Caskroom/claude-code/...
 * - npm-global (via Homebrew's npm): /opt/homebrew/lib/node_modules/@anthropic-ai/...
 */
function detectHomebrew() {
    var platform = (0, platform_js_1.getPlatform)();
    // Homebrew is only for macOS and Linux
    if (platform !== 'macos' && platform !== 'linux' && platform !== 'wsl') {
        return false;
    }
    // Get the path of the currently running executable
    var execPath = process.execPath || process.argv[0] || '';
    // Check if the executable is within a Homebrew Caskroom directory
    // This is specific to Homebrew cask installations
    if (execPath.includes('/Caskroom/')) {
        (0, debug_js_1.logForDebugging)("Detected Homebrew cask installation: ".concat(execPath));
        return true;
    }
    return false;
}
/**
 * Detects if the currently running Claude instance was installed via winget
 * by checking if the executable path is within a WinGet directory.
 *
 * Winget installs to:
 * - User: %LOCALAPPDATA%\Microsoft\WinGet\Packages
 * - System: C:\Program Files\WinGet\Packages
 * And creates links at: %LOCALAPPDATA%\Microsoft\WinGet\Links\
 */
function detectWinget() {
    var platform = (0, platform_js_1.getPlatform)();
    // Winget is only for Windows
    if (platform !== 'windows') {
        return false;
    }
    var execPath = process.execPath || process.argv[0] || '';
    // Check for WinGet paths (handles both forward and backslashes)
    var wingetPatterns = [
        /Microsoft[/\\]WinGet[/\\]Packages/i,
        /Microsoft[/\\]WinGet[/\\]Links/i,
    ];
    for (var _i = 0, wingetPatterns_1 = wingetPatterns; _i < wingetPatterns_1.length; _i++) {
        var pattern = wingetPatterns_1[_i];
        if (pattern.test(execPath)) {
            (0, debug_js_1.logForDebugging)("Detected winget installation: ".concat(execPath));
            return true;
        }
    }
    return false;
}
/**
 * Detects if the currently running Claude instance was installed via pacman
 * by querying pacman's database for file ownership.
 *
 * We gate on the Arch distro family before invoking pacman. On other distros
 * like Ubuntu/Debian, 'pacman' in PATH may resolve to the pacman game
 * (/usr/games/pacman) rather than the Arch package manager.
 */
exports.detectPacman = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var platform, osRelease, execPath, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                platform = (0, platform_js_1.getPlatform)();
                if (platform !== 'linux') {
                    return [2 /*return*/, false];
                }
                return [4 /*yield*/, (0, exports.getOsRelease)()];
            case 1:
                osRelease = _a.sent();
                if (osRelease && !isDistroFamily(osRelease, ['arch'])) {
                    return [2 /*return*/, false];
                }
                execPath = process.execPath || process.argv[0] || '';
                return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('pacman', ['-Qo', execPath], {
                        timeout: 5000,
                        useCwd: false,
                    })];
            case 2:
                result = _a.sent();
                if (result.code === 0 && result.stdout) {
                    (0, debug_js_1.logForDebugging)("Detected pacman installation: ".concat(result.stdout.trim()));
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, false];
        }
    });
}); });
/**
 * Detects if the currently running Claude instance was installed via a .deb package
 * by querying dpkg's database for file ownership.
 *
 * We use `dpkg -S <execPath>` to check if the executable is owned by a dpkg-managed package.
 */
exports.detectDeb = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var platform, osRelease, execPath, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                platform = (0, platform_js_1.getPlatform)();
                if (platform !== 'linux') {
                    return [2 /*return*/, false];
                }
                return [4 /*yield*/, (0, exports.getOsRelease)()];
            case 1:
                osRelease = _a.sent();
                if (osRelease && !isDistroFamily(osRelease, ['debian'])) {
                    return [2 /*return*/, false];
                }
                execPath = process.execPath || process.argv[0] || '';
                return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('dpkg', ['-S', execPath], {
                        timeout: 5000,
                        useCwd: false,
                    })];
            case 2:
                result = _a.sent();
                if (result.code === 0 && result.stdout) {
                    (0, debug_js_1.logForDebugging)("Detected deb installation: ".concat(result.stdout.trim()));
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, false];
        }
    });
}); });
/**
 * Detects if the currently running Claude instance was installed via an RPM package
 * by querying the RPM database for file ownership.
 *
 * We use `rpm -qf <execPath>` to check if the executable is owned by an RPM package.
 */
exports.detectRpm = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var platform, osRelease, execPath, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                platform = (0, platform_js_1.getPlatform)();
                if (platform !== 'linux') {
                    return [2 /*return*/, false];
                }
                return [4 /*yield*/, (0, exports.getOsRelease)()];
            case 1:
                osRelease = _a.sent();
                if (osRelease && !isDistroFamily(osRelease, ['fedora', 'rhel', 'suse'])) {
                    return [2 /*return*/, false];
                }
                execPath = process.execPath || process.argv[0] || '';
                return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('rpm', ['-qf', execPath], {
                        timeout: 5000,
                        useCwd: false,
                    })];
            case 2:
                result = _a.sent();
                if (result.code === 0 && result.stdout) {
                    (0, debug_js_1.logForDebugging)("Detected rpm installation: ".concat(result.stdout.trim()));
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, false];
        }
    });
}); });
/**
 * Detects if the currently running Claude instance was installed via Alpine APK
 * by querying apk's database for file ownership.
 *
 * We use `apk info --who-owns <execPath>` to check if the executable is owned
 * by an apk-managed package.
 */
exports.detectApk = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var platform, osRelease, execPath, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                platform = (0, platform_js_1.getPlatform)();
                if (platform !== 'linux') {
                    return [2 /*return*/, false];
                }
                return [4 /*yield*/, (0, exports.getOsRelease)()];
            case 1:
                osRelease = _a.sent();
                if (osRelease && !isDistroFamily(osRelease, ['alpine'])) {
                    return [2 /*return*/, false];
                }
                execPath = process.execPath || process.argv[0] || '';
                return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('apk', ['info', '--who-owns', execPath], {
                        timeout: 5000,
                        useCwd: false,
                    })];
            case 2:
                result = _a.sent();
                if (result.code === 0 && result.stdout) {
                    (0, debug_js_1.logForDebugging)("Detected apk installation: ".concat(result.stdout.trim()));
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, false];
        }
    });
}); });
/**
 * Memoized function to detect which package manager installed Claude
 * Returns 'unknown' if no package manager is detected
 */
exports.getPackageManager = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (detectHomebrew()) {
                    return [2 /*return*/, 'homebrew'];
                }
                if (detectWinget()) {
                    return [2 /*return*/, 'winget'];
                }
                if (detectMise()) {
                    return [2 /*return*/, 'mise'];
                }
                if (detectAsdf()) {
                    return [2 /*return*/, 'asdf'];
                }
                return [4 /*yield*/, (0, exports.detectPacman)()];
            case 1:
                if (_a.sent()) {
                    return [2 /*return*/, 'pacman'];
                }
                return [4 /*yield*/, (0, exports.detectApk)()];
            case 2:
                if (_a.sent()) {
                    return [2 /*return*/, 'apk'];
                }
                return [4 /*yield*/, (0, exports.detectDeb)()];
            case 3:
                if (_a.sent()) {
                    return [2 /*return*/, 'deb'];
                }
                return [4 /*yield*/, (0, exports.detectRpm)()];
            case 4:
                if (_a.sent()) {
                    return [2 /*return*/, 'rpm'];
                }
                return [2 /*return*/, 'unknown'];
        }
    });
}); });
