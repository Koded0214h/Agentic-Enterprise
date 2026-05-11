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
exports.getCurrentInstallationType = getCurrentInstallationType;
exports.getInvokedBinary = getInvokedBinary;
exports.detectLinuxGlobPatternWarnings = detectLinuxGlobPatternWarnings;
exports.getDoctorDiagnostic = getDoctorDiagnostic;
var execa_1 = require("execa");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var autoUpdater_js_1 = require("./autoUpdater.js");
var bundledMode_js_1 = require("./bundledMode.js");
var config_js_1 = require("./config.js");
var cwd_js_1 = require("./cwd.js");
var envUtils_js_1 = require("./envUtils.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var fsOperations_js_1 = require("./fsOperations.js");
var localInstaller_js_1 = require("./localInstaller.js");
var packageManagers_js_1 = require("./nativeInstaller/packageManagers.js");
var platform_js_1 = require("./platform.js");
var ripgrep_js_1 = require("./ripgrep.js");
var sandbox_adapter_js_1 = require("./sandbox/sandbox-adapter.js");
var managedPath_js_1 = require("./settings/managedPath.js");
var types_js_1 = require("./settings/types.js");
var shellConfig_js_1 = require("./shellConfig.js");
var slowOperations_js_1 = require("./slowOperations.js");
var which_js_1 = require("./which.js");
function getNormalizedPaths() {
    var invokedPath = process.argv[1] || '';
    var execPath = process.execPath || process.argv[0] || '';
    // On Windows, convert backslashes to forward slashes for consistent path matching
    if ((0, platform_js_1.getPlatform)() === 'windows') {
        invokedPath = invokedPath.split(path_1.win32.sep).join(path_1.posix.sep);
        execPath = execPath.split(path_1.win32.sep).join(path_1.posix.sep);
    }
    return [invokedPath, execPath];
}
function getCurrentInstallationType() {
    return __awaiter(this, void 0, void 0, function () {
        var invokedPath, _a, _b, _c, _d, npmGlobalPaths, npmConfigResult, globalPrefix;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (process.env.NODE_ENV === 'development') {
                        return [2 /*return*/, 'development'];
                    }
                    invokedPath = getNormalizedPaths()[0];
                    if (!(0, bundledMode_js_1.isInBundledMode)()) return [3 /*break*/, 9];
                    _d = (0, packageManagers_js_1.detectHomebrew)() ||
                        (0, packageManagers_js_1.detectWinget)() ||
                        (0, packageManagers_js_1.detectMise)() ||
                        (0, packageManagers_js_1.detectAsdf)();
                    if (_d) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, packageManagers_js_1.detectPacman)()];
                case 1:
                    _d = (_e.sent());
                    _e.label = 2;
                case 2:
                    _c = _d;
                    if (_c) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, packageManagers_js_1.detectDeb)()];
                case 3:
                    _c = (_e.sent());
                    _e.label = 4;
                case 4:
                    _b = _c;
                    if (_b) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, packageManagers_js_1.detectRpm)()];
                case 5:
                    _b = (_e.sent());
                    _e.label = 6;
                case 6:
                    _a = _b;
                    if (_a) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, packageManagers_js_1.detectApk)()];
                case 7:
                    _a = (_e.sent());
                    _e.label = 8;
                case 8:
                    // Check if this bundled instance was installed by a package manager
                    if (_a) {
                        return [2 /*return*/, 'package-manager'];
                    }
                    return [2 /*return*/, 'native'];
                case 9:
                    // Check if running from local npm installation
                    if ((0, localInstaller_js_1.isRunningFromLocalInstallation)()) {
                        return [2 /*return*/, 'npm-local'];
                    }
                    npmGlobalPaths = [
                        '/usr/local/lib/node_modules',
                        '/usr/lib/node_modules',
                        '/opt/homebrew/lib/node_modules',
                        '/opt/homebrew/bin',
                        '/usr/local/bin',
                        '/.nvm/versions/node/', // nvm installations
                    ];
                    if (npmGlobalPaths.some(function (path) { return invokedPath.includes(path); })) {
                        return [2 /*return*/, 'npm-global'];
                    }
                    // Also check for npm/nvm in the path even if not in standard locations
                    if (invokedPath.includes('/npm/') || invokedPath.includes('/nvm/')) {
                        return [2 /*return*/, 'npm-global'];
                    }
                    return [4 /*yield*/, (0, execa_1.execa)('npm config get prefix', {
                            shell: true,
                            reject: false,
                        })];
                case 10:
                    npmConfigResult = _e.sent();
                    globalPrefix = npmConfigResult.exitCode === 0 ? npmConfigResult.stdout.trim() : null;
                    if (globalPrefix && invokedPath.startsWith(globalPrefix)) {
                        return [2 /*return*/, 'npm-global'];
                    }
                    // If we can't determine, return unknown
                    return [2 /*return*/, 'unknown'];
            }
        });
    });
}
function getInstallationPath() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, path, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (process.env.NODE_ENV === 'development') {
                        return [2 /*return*/, (0, cwd_js_1.getCwd)()];
                    }
                    if (!(0, bundledMode_js_1.isInBundledMode)()) return [3 /*break*/, 11];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.realpath)(process.execPath)];
                case 2: return [2 /*return*/, _d.sent()];
                case 3:
                    _a = _d.sent();
                    return [3 /*break*/, 4];
                case 4:
                    _d.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, which_js_1.which)('claude')];
                case 5:
                    path = _d.sent();
                    if (path) {
                        return [2 /*return*/, path];
                    }
                    return [3 /*break*/, 7];
                case 6:
                    _b = _d.sent();
                    return [3 /*break*/, 7];
                case 7:
                    _d.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().stat((0, path_1.join)((0, os_1.homedir)(), '.local/bin/claude'))];
                case 8:
                    _d.sent();
                    return [2 /*return*/, (0, path_1.join)((0, os_1.homedir)(), '.local/bin/claude')];
                case 9:
                    _c = _d.sent();
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/, 'native'];
                case 11:
                    // For npm installations, use the path of the executable
                    try {
                        return [2 /*return*/, process.argv[0] || 'unknown'];
                    }
                    catch (_e) {
                        return [2 /*return*/, 'unknown'];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function getInvokedBinary() {
    try {
        // For bundled/compiled executables, show the actual binary path
        if ((0, bundledMode_js_1.isInBundledMode)()) {
            return process.execPath || 'unknown';
        }
        // For npm/development, show the script path
        return process.argv[1] || 'unknown';
    }
    catch (_a) {
        return 'unknown';
    }
}
function detectMultipleInstallations() {
    return __awaiter(this, void 0, void 0, function () {
        var fs, installations, localPath, packagesToCheck, npmResult, npmPrefix, isWindows, globalBinPath, globalBinExists, _a, isCurrentHomebrewInstallation, realPath, _b, _i, packagesToCheck_1, packageName, globalPackagePath, _c, nativeBinPath, _d, config, nativeDataPath, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    installations = [];
                    localPath = (0, path_1.join)((0, os_1.homedir)(), '.claude', 'local');
                    return [4 /*yield*/, (0, localInstaller_js_1.localInstallationExists)()];
                case 1:
                    if (_f.sent()) {
                        installations.push({ type: 'npm-local', path: localPath });
                    }
                    packagesToCheck = ['@anthropic-ai/claude-code'];
                    if (MACRO.PACKAGE_URL && MACRO.PACKAGE_URL !== '@anthropic-ai/claude-code') {
                        packagesToCheck.push(MACRO.PACKAGE_URL);
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('npm', [
                            '-g',
                            'config',
                            'get',
                            'prefix',
                        ])];
                case 2:
                    npmResult = _f.sent();
                    if (!(npmResult.code === 0 && npmResult.stdout)) return [3 /*break*/, 17];
                    npmPrefix = npmResult.stdout.trim();
                    isWindows = (0, platform_js_1.getPlatform)() === 'windows';
                    globalBinPath = isWindows
                        ? (0, path_1.join)(npmPrefix, 'claude')
                        : (0, path_1.join)(npmPrefix, 'bin', 'claude');
                    globalBinExists = false;
                    _f.label = 3;
                case 3:
                    _f.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, fs.stat(globalBinPath)];
                case 4:
                    _f.sent();
                    globalBinExists = true;
                    return [3 /*break*/, 6];
                case 5:
                    _a = _f.sent();
                    return [3 /*break*/, 6];
                case 6:
                    if (!globalBinExists) return [3 /*break*/, 11];
                    isCurrentHomebrewInstallation = false;
                    _f.label = 7;
                case 7:
                    _f.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, promises_1.realpath)(globalBinPath)
                        // If the symlink points to a Caskroom directory, it's a Homebrew cask
                        // Only skip it if it's the same Homebrew installation we're currently running from
                    ];
                case 8:
                    realPath = _f.sent();
                    // If the symlink points to a Caskroom directory, it's a Homebrew cask
                    // Only skip it if it's the same Homebrew installation we're currently running from
                    if (realPath.includes('/Caskroom/')) {
                        isCurrentHomebrewInstallation = (0, packageManagers_js_1.detectHomebrew)();
                    }
                    return [3 /*break*/, 10];
                case 9:
                    _b = _f.sent();
                    return [3 /*break*/, 10];
                case 10:
                    if (!isCurrentHomebrewInstallation) {
                        installations.push({ type: 'npm-global', path: globalBinPath });
                    }
                    return [3 /*break*/, 17];
                case 11:
                    _i = 0, packagesToCheck_1 = packagesToCheck;
                    _f.label = 12;
                case 12:
                    if (!(_i < packagesToCheck_1.length)) return [3 /*break*/, 17];
                    packageName = packagesToCheck_1[_i];
                    globalPackagePath = isWindows
                        ? (0, path_1.join)(npmPrefix, 'node_modules', packageName)
                        : (0, path_1.join)(npmPrefix, 'lib', 'node_modules', packageName);
                    _f.label = 13;
                case 13:
                    _f.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, fs.stat(globalPackagePath)];
                case 14:
                    _f.sent();
                    installations.push({
                        type: 'npm-global-orphan',
                        path: globalPackagePath,
                    });
                    return [3 /*break*/, 16];
                case 15:
                    _c = _f.sent();
                    return [3 /*break*/, 16];
                case 16:
                    _i++;
                    return [3 /*break*/, 12];
                case 17:
                    nativeBinPath = (0, path_1.join)((0, os_1.homedir)(), '.local', 'bin', 'claude');
                    _f.label = 18;
                case 18:
                    _f.trys.push([18, 20, , 21]);
                    return [4 /*yield*/, fs.stat(nativeBinPath)];
                case 19:
                    _f.sent();
                    installations.push({ type: 'native', path: nativeBinPath });
                    return [3 /*break*/, 21];
                case 20:
                    _d = _f.sent();
                    return [3 /*break*/, 21];
                case 21:
                    config = (0, config_js_1.getGlobalConfig)();
                    if (!(config.installMethod === 'native')) return [3 /*break*/, 25];
                    nativeDataPath = (0, path_1.join)((0, os_1.homedir)(), '.local', 'share', 'claude');
                    _f.label = 22;
                case 22:
                    _f.trys.push([22, 24, , 25]);
                    return [4 /*yield*/, fs.stat(nativeDataPath)];
                case 23:
                    _f.sent();
                    if (!installations.some(function (i) { return i.type === 'native'; })) {
                        installations.push({ type: 'native', path: nativeDataPath });
                    }
                    return [3 /*break*/, 25];
                case 24:
                    _e = _f.sent();
                    return [3 /*break*/, 25];
                case 25: return [2 /*return*/, installations];
            }
        });
    });
}
function detectConfigurationIssues(type) {
    return __awaiter(this, void 0, void 0, function () {
        var warnings, raw, parsed, field, unknown, _a, config, path, pathDirectories, homeDir, localBinPath, normalizedLocalBinPath_1, localBinInPath, isWindows, windowsLocalBinPath, shellType, configPaths, configFile, displayPath, _b, existingAlias, validAlias, whichResult, claudeInPath;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    warnings = [];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)((0, managedPath_js_1.getManagedFilePath)(), 'managed-settings.json'), 'utf-8')];
                case 2:
                    raw = _c.sent();
                    parsed = (0, slowOperations_js_1.jsonParse)(raw);
                    field = parsed && typeof parsed === 'object'
                        ? parsed.strictPluginOnlyCustomization
                        : undefined;
                    if (field !== undefined && typeof field !== 'boolean') {
                        if (!Array.isArray(field)) {
                            // .catch(undefined) in the schema silently drops this, so the rest
                            // of managed settings survive — but the admin typed something
                            // wrong (an object, a string, etc.).
                            warnings.push({
                                issue: "managed-settings.json: strictPluginOnlyCustomization has an invalid value (expected true or an array, got ".concat(typeof field, ")"),
                                fix: "The field is silently ignored (schema .catch rescues it). Set it to true, or an array of: ".concat(types_js_1.CUSTOMIZATION_SURFACES.join(', '), "."),
                            });
                        }
                        else {
                            unknown = field.filter(function (x) {
                                return typeof x === 'string' &&
                                    !types_js_1.CUSTOMIZATION_SURFACES.includes(x);
                            });
                            if (unknown.length > 0) {
                                warnings.push({
                                    issue: "managed-settings.json: strictPluginOnlyCustomization has ".concat(unknown.length, " value(s) this client doesn't recognize: ").concat(unknown.map(String).join(', ')),
                                    fix: "These are silently ignored (forwards-compat). Known surfaces for this version: ".concat(types_js_1.CUSTOMIZATION_SURFACES.join(', '), ". Either remove them, or this client is older than the managed-settings intended."),
                                });
                            }
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 4:
                    config = (0, config_js_1.getGlobalConfig)();
                    // Skip most warnings for development mode
                    if (type === 'development') {
                        return [2 /*return*/, warnings];
                    }
                    // Check if ~/.local/bin is in PATH for native installations
                    if (type === 'native') {
                        path = process.env.PATH || '';
                        pathDirectories = path.split(path_1.delimiter);
                        homeDir = (0, os_1.homedir)();
                        localBinPath = (0, path_1.join)(homeDir, '.local', 'bin');
                        normalizedLocalBinPath_1 = localBinPath;
                        if ((0, platform_js_1.getPlatform)() === 'windows') {
                            normalizedLocalBinPath_1 = localBinPath.split(path_1.win32.sep).join(path_1.posix.sep);
                        }
                        localBinInPath = pathDirectories.some(function (dir) {
                            var normalizedDir = dir;
                            if ((0, platform_js_1.getPlatform)() === 'windows') {
                                normalizedDir = dir.split(path_1.win32.sep).join(path_1.posix.sep);
                            }
                            // Remove trailing slashes for comparison (handles paths like /home/user/.local/bin/)
                            var trimmedDir = normalizedDir.replace(/\/+$/, '');
                            var trimmedRawDir = dir.replace(/[/\\]+$/, '');
                            return (trimmedDir === normalizedLocalBinPath_1 ||
                                trimmedRawDir === '~/.local/bin' ||
                                trimmedRawDir === '$HOME/.local/bin');
                        });
                        if (!localBinInPath) {
                            isWindows = (0, platform_js_1.getPlatform)() === 'windows';
                            if (isWindows) {
                                windowsLocalBinPath = localBinPath
                                    .split(path_1.posix.sep)
                                    .join(path_1.win32.sep);
                                warnings.push({
                                    issue: "Native installation exists but ".concat(windowsLocalBinPath, " is not in your PATH"),
                                    fix: "Add it by opening: System Properties \u2192 Environment Variables \u2192 Edit User PATH \u2192 New \u2192 Add the path above. Then restart your terminal.",
                                });
                            }
                            else {
                                shellType = (0, localInstaller_js_1.getShellType)();
                                configPaths = (0, shellConfig_js_1.getShellConfigPaths)();
                                configFile = configPaths[shellType];
                                displayPath = configFile
                                    ? configFile.replace((0, os_1.homedir)(), '~')
                                    : 'your shell config file';
                                warnings.push({
                                    issue: 'Native installation exists but ~/.local/bin is not in your PATH',
                                    fix: "Run: echo 'export PATH=\"$HOME/.local/bin:$PATH\"' >> ".concat(displayPath, " then open a new terminal or run: source ").concat(displayPath),
                                });
                            }
                        }
                    }
                    // Check for configuration mismatches
                    // Skip these checks if DISABLE_INSTALLATION_CHECKS is set (e.g., in HFI)
                    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_INSTALLATION_CHECKS)) {
                        if (type === 'npm-local' && config.installMethod !== 'local') {
                            warnings.push({
                                issue: "Running from local installation but config install method is '".concat(config.installMethod, "'"),
                                fix: 'Consider using native installation: claude install',
                            });
                        }
                        if (type === 'native' && config.installMethod !== 'native') {
                            warnings.push({
                                issue: "Running native installation but config install method is '".concat(config.installMethod, "'"),
                                fix: 'Run claude install to update configuration',
                            });
                        }
                    }
                    _b = type === 'npm-global';
                    if (!_b) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, localInstaller_js_1.localInstallationExists)()];
                case 5:
                    _b = (_c.sent());
                    _c.label = 6;
                case 6:
                    if (_b) {
                        warnings.push({
                            issue: 'Local installation exists but not being used',
                            fix: 'Consider using native installation: claude install',
                        });
                    }
                    return [4 /*yield*/, (0, shellConfig_js_1.findClaudeAlias)()];
                case 7:
                    existingAlias = _c.sent();
                    return [4 /*yield*/, (0, shellConfig_js_1.findValidClaudeAlias)()
                        // Check if running local installation but it's not in PATH
                    ];
                case 8:
                    validAlias = _c.sent();
                    if (!(type === 'npm-local')) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, which_js_1.which)('claude')];
                case 9:
                    whichResult = _c.sent();
                    claudeInPath = !!whichResult;
                    // Only show warning if claude is NOT in PATH AND no valid alias exists
                    if (!claudeInPath && !validAlias) {
                        if (existingAlias) {
                            // Alias exists but points to invalid target
                            warnings.push({
                                issue: 'Local installation not accessible',
                                fix: "Alias exists but points to invalid target: ".concat(existingAlias, ". Update alias: alias claude=\"~/.claude/local/claude\""),
                            });
                        }
                        else {
                            // No alias exists and not in PATH
                            warnings.push({
                                issue: 'Local installation not accessible',
                                fix: 'Create alias: alias claude="~/.claude/local/claude"',
                            });
                        }
                    }
                    _c.label = 10;
                case 10: return [2 /*return*/, warnings];
            }
        });
    });
}
function detectLinuxGlobPatternWarnings() {
    if ((0, platform_js_1.getPlatform)() !== 'linux') {
        return [];
    }
    var warnings = [];
    var globPatterns = sandbox_adapter_js_1.SandboxManager.getLinuxGlobPatternWarnings();
    if (globPatterns.length > 0) {
        // Show first 3 patterns, then indicate if there are more
        var displayPatterns = globPatterns.slice(0, 3).join(', ');
        var remaining = globPatterns.length - 3;
        var patternList = remaining > 0 ? "".concat(displayPatterns, " (").concat(remaining, " more)") : displayPatterns;
        warnings.push({
            issue: "Glob patterns in sandbox permission rules are not fully supported on Linux",
            fix: "Found ".concat(globPatterns.length, " pattern(s): ").concat(patternList, ". On Linux, glob patterns in Edit/Read rules will be ignored."),
        });
    }
    return warnings;
}
function getDoctorDiagnostic() {
    return __awaiter(this, void 0, void 0, function () {
        var installationType, version, installationPath, invokedBinary, multipleInstallations, warnings, npmInstalls, isWindows, _i, npmInstalls_1, install, uninstallCmd, config, configInstallMethod, hasUpdatePermissions, permCheck, ripgrepStatusRaw, ripgrepStatus, packageManager, _a, diagnostic;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getCurrentInstallationType()];
                case 1:
                    installationType = _c.sent();
                    version = typeof MACRO !== 'undefined' && MACRO.VERSION ? MACRO.VERSION : 'unknown';
                    return [4 /*yield*/, getInstallationPath()];
                case 2:
                    installationPath = _c.sent();
                    invokedBinary = getInvokedBinary();
                    return [4 /*yield*/, detectMultipleInstallations()];
                case 3:
                    multipleInstallations = _c.sent();
                    return [4 /*yield*/, detectConfigurationIssues(installationType)
                        // Add glob pattern warnings for Linux sandboxing
                    ];
                case 4:
                    warnings = _c.sent();
                    // Add glob pattern warnings for Linux sandboxing
                    warnings.push.apply(warnings, detectLinuxGlobPatternWarnings());
                    // Add warnings for leftover npm installations when running native
                    if (installationType === 'native') {
                        npmInstalls = multipleInstallations.filter(function (i) {
                            return i.type === 'npm-global' ||
                                i.type === 'npm-global-orphan' ||
                                i.type === 'npm-local';
                        });
                        isWindows = (0, platform_js_1.getPlatform)() === 'windows';
                        for (_i = 0, npmInstalls_1 = npmInstalls; _i < npmInstalls_1.length; _i++) {
                            install = npmInstalls_1[_i];
                            if (install.type === 'npm-global') {
                                uninstallCmd = 'npm -g uninstall @anthropic-ai/claude-code';
                                if (MACRO.PACKAGE_URL &&
                                    MACRO.PACKAGE_URL !== '@anthropic-ai/claude-code') {
                                    uninstallCmd += " && npm -g uninstall ".concat(MACRO.PACKAGE_URL);
                                }
                                warnings.push({
                                    issue: "Leftover npm global installation at ".concat(install.path),
                                    fix: "Run: ".concat(uninstallCmd),
                                });
                            }
                            else if (install.type === 'npm-global-orphan') {
                                warnings.push({
                                    issue: "Orphaned npm global package at ".concat(install.path),
                                    fix: isWindows
                                        ? "Run: rmdir /s /q \"".concat(install.path, "\"")
                                        : "Run: rm -rf ".concat(install.path),
                                });
                            }
                            else if (install.type === 'npm-local') {
                                warnings.push({
                                    issue: "Leftover npm local installation at ".concat(install.path),
                                    fix: isWindows
                                        ? "Run: rmdir /s /q \"".concat(install.path, "\"")
                                        : "Run: rm -rf ".concat(install.path),
                                });
                            }
                        }
                    }
                    config = (0, config_js_1.getGlobalConfig)();
                    configInstallMethod = config.installMethod || 'not set';
                    hasUpdatePermissions = null;
                    if (!(installationType === 'npm-global')) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, autoUpdater_js_1.checkGlobalInstallPermissions)()];
                case 5:
                    permCheck = _c.sent();
                    hasUpdatePermissions = permCheck.hasPermissions;
                    // Add warning if no permissions
                    if (!hasUpdatePermissions && !(0, config_js_1.getAutoUpdaterDisabledReason)()) {
                        warnings.push({
                            issue: 'Insufficient permissions for auto-updates',
                            fix: 'Do one of: (1) Re-install node without sudo, or (2) Use `claude install` for native installation',
                        });
                    }
                    _c.label = 6;
                case 6:
                    ripgrepStatusRaw = (0, ripgrep_js_1.getRipgrepStatus)();
                    ripgrepStatus = {
                        working: (_b = ripgrepStatusRaw.working) !== null && _b !== void 0 ? _b : true, // Assume working if not yet tested
                        mode: ripgrepStatusRaw.mode,
                        systemPath: ripgrepStatusRaw.mode === 'system' ? ripgrepStatusRaw.path : null,
                    };
                    if (!(installationType === 'package-manager')) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, packageManagers_js_1.getPackageManager)()];
                case 7:
                    _a = _c.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _a = undefined;
                    _c.label = 9;
                case 9:
                    packageManager = _a;
                    diagnostic = {
                        installationType: installationType,
                        version: version,
                        installationPath: installationPath,
                        invokedBinary: invokedBinary,
                        configInstallMethod: configInstallMethod,
                        autoUpdates: (function () {
                            var reason = (0, config_js_1.getAutoUpdaterDisabledReason)();
                            return reason
                                ? "disabled (".concat((0, config_js_1.formatAutoUpdaterDisabledReason)(reason), ")")
                                : 'enabled';
                        })(),
                        hasUpdatePermissions: hasUpdatePermissions,
                        multipleInstallations: multipleInstallations,
                        warnings: warnings,
                        packageManager: packageManager,
                        ripgrepStatus: ripgrepStatus,
                    };
                    return [2 /*return*/, diagnostic];
            }
        });
    });
}
