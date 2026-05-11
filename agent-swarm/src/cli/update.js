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
exports.update = update;
var chalk_1 = require("chalk");
var index_js_1 = require("src/services/analytics/index.js");
var autoUpdater_js_1 = require("src/utils/autoUpdater.js");
var completionCache_js_1 = require("src/utils/completionCache.js");
var config_js_1 = require("src/utils/config.js");
var debug_js_1 = require("src/utils/debug.js");
var doctorDiagnostic_js_1 = require("src/utils/doctorDiagnostic.js");
var gracefulShutdown_js_1 = require("src/utils/gracefulShutdown.js");
var localInstaller_js_1 = require("src/utils/localInstaller.js");
var index_js_2 = require("src/utils/nativeInstaller/index.js");
var packageManagers_js_1 = require("src/utils/nativeInstaller/packageManagers.js");
var process_js_1 = require("src/utils/process.js");
var semver_js_1 = require("src/utils/semver.js");
var settings_js_1 = require("src/utils/settings/settings.js");
function update() {
    return __awaiter(this, void 0, void 0, function () {
        var channel, diagnostic, _i, _a, install, current, _b, _c, warning, config, detectedMethod_1, packageManager, latest, latest, latest, runningType, configExpects, typeMapping, normalizedRunningType_1, result, pidInfo, error_1, npmTag, npmCommand, latestVersion, packageName, useLocalUpdate, updateMethodName, _d, isLocal, status, _e;
        var _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    (0, index_js_1.logEvent)('tengu_update_check', {});
                    (0, process_js_1.writeToStdout)("Current version: ".concat(MACRO.VERSION, "\n"));
                    channel = (_g = (_f = (0, settings_js_1.getInitialSettings)()) === null || _f === void 0 ? void 0 : _f.autoUpdatesChannel) !== null && _g !== void 0 ? _g : 'latest';
                    (0, process_js_1.writeToStdout)("Checking for updates to ".concat(channel, " version...\n"));
                    (0, debug_js_1.logForDebugging)('update: Starting update check');
                    // Run diagnostic to detect potential issues
                    (0, debug_js_1.logForDebugging)('update: Running diagnostic');
                    return [4 /*yield*/, (0, doctorDiagnostic_js_1.getDoctorDiagnostic)()];
                case 1:
                    diagnostic = _h.sent();
                    (0, debug_js_1.logForDebugging)("update: Installation type: ".concat(diagnostic.installationType));
                    (0, debug_js_1.logForDebugging)("update: Config install method: ".concat(diagnostic.configInstallMethod));
                    // Check for multiple installations
                    if (diagnostic.multipleInstallations.length > 1) {
                        (0, process_js_1.writeToStdout)('\n');
                        (0, process_js_1.writeToStdout)(chalk_1.default.yellow('Warning: Multiple installations found') + '\n');
                        for (_i = 0, _a = diagnostic.multipleInstallations; _i < _a.length; _i++) {
                            install = _a[_i];
                            current = diagnostic.installationType === install.type
                                ? ' (currently running)'
                                : '';
                            (0, process_js_1.writeToStdout)("- ".concat(install.type, " at ").concat(install.path).concat(current, "\n"));
                        }
                    }
                    // Display warnings if any exist
                    if (diagnostic.warnings.length > 0) {
                        (0, process_js_1.writeToStdout)('\n');
                        for (_b = 0, _c = diagnostic.warnings; _b < _c.length; _b++) {
                            warning = _c[_b];
                            (0, debug_js_1.logForDebugging)("update: Warning detected: ".concat(warning.issue));
                            // Don't skip PATH warnings - they're always relevant
                            // The user needs to know that 'which claude' points elsewhere
                            (0, debug_js_1.logForDebugging)("update: Showing warning: ".concat(warning.issue));
                            (0, process_js_1.writeToStdout)(chalk_1.default.yellow("Warning: ".concat(warning.issue, "\n")));
                            (0, process_js_1.writeToStdout)(chalk_1.default.bold("Fix: ".concat(warning.fix, "\n")));
                        }
                    }
                    config = (0, config_js_1.getGlobalConfig)();
                    if (!config.installMethod &&
                        diagnostic.installationType !== 'package-manager') {
                        (0, process_js_1.writeToStdout)('\n');
                        (0, process_js_1.writeToStdout)('Updating configuration to track installation method...\n');
                        detectedMethod_1 = 'unknown';
                        // Map diagnostic installation type to config install method
                        switch (diagnostic.installationType) {
                            case 'npm-local':
                                detectedMethod_1 = 'local';
                                break;
                            case 'native':
                                detectedMethod_1 = 'native';
                                break;
                            case 'npm-global':
                                detectedMethod_1 = 'global';
                                break;
                            default:
                                detectedMethod_1 = 'unknown';
                        }
                        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { installMethod: detectedMethod_1 })); });
                        (0, process_js_1.writeToStdout)("Installation method set to: ".concat(detectedMethod_1, "\n"));
                    }
                    if (!(diagnostic.installationType === 'development')) return [3 /*break*/, 3];
                    (0, process_js_1.writeToStdout)('\n');
                    (0, process_js_1.writeToStdout)(chalk_1.default.yellow('Warning: Cannot update development build') + '\n');
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(1)];
                case 2:
                    _h.sent();
                    _h.label = 3;
                case 3:
                    if (!(diagnostic.installationType === 'package-manager')) return [3 /*break*/, 13];
                    return [4 /*yield*/, (0, packageManagers_js_1.getPackageManager)()];
                case 4:
                    packageManager = _h.sent();
                    (0, process_js_1.writeToStdout)('\n');
                    if (!(packageManager === 'homebrew')) return [3 /*break*/, 6];
                    (0, process_js_1.writeToStdout)('Claude is managed by Homebrew.\n');
                    return [4 /*yield*/, (0, autoUpdater_js_1.getLatestVersion)(channel)];
                case 5:
                    latest = _h.sent();
                    if (latest && !(0, semver_js_1.gte)(MACRO.VERSION, latest)) {
                        (0, process_js_1.writeToStdout)("Update available: ".concat(MACRO.VERSION, " \u2192 ").concat(latest, "\n"));
                        (0, process_js_1.writeToStdout)('\n');
                        (0, process_js_1.writeToStdout)('To update, run:\n');
                        (0, process_js_1.writeToStdout)(chalk_1.default.bold('  brew upgrade claude-code') + '\n');
                    }
                    else {
                        (0, process_js_1.writeToStdout)('Claude is up to date!\n');
                    }
                    return [3 /*break*/, 11];
                case 6:
                    if (!(packageManager === 'winget')) return [3 /*break*/, 8];
                    (0, process_js_1.writeToStdout)('Claude is managed by winget.\n');
                    return [4 /*yield*/, (0, autoUpdater_js_1.getLatestVersion)(channel)];
                case 7:
                    latest = _h.sent();
                    if (latest && !(0, semver_js_1.gte)(MACRO.VERSION, latest)) {
                        (0, process_js_1.writeToStdout)("Update available: ".concat(MACRO.VERSION, " \u2192 ").concat(latest, "\n"));
                        (0, process_js_1.writeToStdout)('\n');
                        (0, process_js_1.writeToStdout)('To update, run:\n');
                        (0, process_js_1.writeToStdout)(chalk_1.default.bold('  winget upgrade Anthropic.ClaudeCode') + '\n');
                    }
                    else {
                        (0, process_js_1.writeToStdout)('Claude is up to date!\n');
                    }
                    return [3 /*break*/, 11];
                case 8:
                    if (!(packageManager === 'apk')) return [3 /*break*/, 10];
                    (0, process_js_1.writeToStdout)('Claude is managed by apk.\n');
                    return [4 /*yield*/, (0, autoUpdater_js_1.getLatestVersion)(channel)];
                case 9:
                    latest = _h.sent();
                    if (latest && !(0, semver_js_1.gte)(MACRO.VERSION, latest)) {
                        (0, process_js_1.writeToStdout)("Update available: ".concat(MACRO.VERSION, " \u2192 ").concat(latest, "\n"));
                        (0, process_js_1.writeToStdout)('\n');
                        (0, process_js_1.writeToStdout)('To update, run:\n');
                        (0, process_js_1.writeToStdout)(chalk_1.default.bold('  apk upgrade claude-code') + '\n');
                    }
                    else {
                        (0, process_js_1.writeToStdout)('Claude is up to date!\n');
                    }
                    return [3 /*break*/, 11];
                case 10:
                    // pacman, deb, and rpm don't get specific commands because they each have
                    // multiple frontends (pacman: yay/paru/makepkg, deb: apt/apt-get/aptitude/nala,
                    // rpm: dnf/yum/zypper)
                    (0, process_js_1.writeToStdout)('Claude is managed by a package manager.\n');
                    (0, process_js_1.writeToStdout)('Please use your package manager to update.\n');
                    _h.label = 11;
                case 11: return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(0)];
                case 12:
                    _h.sent();
                    _h.label = 13;
                case 13:
                    // Check for config/reality mismatch (skip for package-manager installs)
                    if (config.installMethod &&
                        diagnostic.configInstallMethod !== 'not set' &&
                        diagnostic.installationType !== 'package-manager') {
                        runningType = diagnostic.installationType;
                        configExpects = diagnostic.configInstallMethod;
                        typeMapping = {
                            'npm-local': 'local',
                            'npm-global': 'global',
                            native: 'native',
                            development: 'development',
                            unknown: 'unknown',
                        };
                        normalizedRunningType_1 = typeMapping[runningType] || runningType;
                        if (normalizedRunningType_1 !== configExpects &&
                            configExpects !== 'unknown') {
                            (0, process_js_1.writeToStdout)('\n');
                            (0, process_js_1.writeToStdout)(chalk_1.default.yellow('Warning: Configuration mismatch') + '\n');
                            (0, process_js_1.writeToStdout)("Config expects: ".concat(configExpects, " installation\n"));
                            (0, process_js_1.writeToStdout)("Currently running: ".concat(runningType, "\n"));
                            (0, process_js_1.writeToStdout)(chalk_1.default.yellow("Updating the ".concat(runningType, " installation you are currently using")) + '\n');
                            // Update config to match reality
                            (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { installMethod: normalizedRunningType_1 })); });
                            (0, process_js_1.writeToStdout)("Config updated to reflect current installation method: ".concat(normalizedRunningType_1, "\n"));
                        }
                    }
                    if (!(diagnostic.installationType === 'native')) return [3 /*break*/, 26];
                    (0, debug_js_1.logForDebugging)('update: Detected native installation, using native updater');
                    _h.label = 14;
                case 14:
                    _h.trys.push([14, 24, , 26]);
                    return [4 /*yield*/, (0, index_js_2.installLatest)(channel, true)
                        // Handle lock contention gracefully
                    ];
                case 15:
                    result = _h.sent();
                    if (!result.lockFailed) return [3 /*break*/, 17];
                    pidInfo = result.lockHolderPid
                        ? " (PID ".concat(result.lockHolderPid, ")")
                        : '';
                    (0, process_js_1.writeToStdout)(chalk_1.default.yellow("Another Claude process".concat(pidInfo, " is currently running. Please try again in a moment.")) + '\n');
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(0)];
                case 16:
                    _h.sent();
                    _h.label = 17;
                case 17:
                    if (!!result.latestVersion) return [3 /*break*/, 19];
                    process.stderr.write('Failed to check for updates\n');
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(1)];
                case 18:
                    _h.sent();
                    _h.label = 19;
                case 19:
                    if (!(result.latestVersion === MACRO.VERSION)) return [3 /*break*/, 20];
                    (0, process_js_1.writeToStdout)(chalk_1.default.green("Claude Code is up to date (".concat(MACRO.VERSION, ")")) + '\n');
                    return [3 /*break*/, 22];
                case 20:
                    (0, process_js_1.writeToStdout)(chalk_1.default.green("Successfully updated from ".concat(MACRO.VERSION, " to version ").concat(result.latestVersion)) + '\n');
                    return [4 /*yield*/, (0, completionCache_js_1.regenerateCompletionCache)()];
                case 21:
                    _h.sent();
                    _h.label = 22;
                case 22: return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(0)];
                case 23:
                    _h.sent();
                    return [3 /*break*/, 26];
                case 24:
                    error_1 = _h.sent();
                    process.stderr.write('Error: Failed to install native update\n');
                    process.stderr.write(String(error_1) + '\n');
                    process.stderr.write('Try running "claude doctor" for diagnostics\n');
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(1)];
                case 25:
                    _h.sent();
                    return [3 /*break*/, 26];
                case 26:
                    if (!(config.installMethod !== 'native')) return [3 /*break*/, 28];
                    return [4 /*yield*/, (0, index_js_2.removeInstalledSymlink)()];
                case 27:
                    _h.sent();
                    _h.label = 28;
                case 28:
                    (0, debug_js_1.logForDebugging)('update: Checking npm registry for latest version');
                    (0, debug_js_1.logForDebugging)("update: Package URL: ".concat(MACRO.PACKAGE_URL));
                    npmTag = channel === 'stable' ? 'stable' : 'latest';
                    npmCommand = "npm view ".concat(MACRO.PACKAGE_URL, "@").concat(npmTag, " version");
                    (0, debug_js_1.logForDebugging)("update: Running: ".concat(npmCommand));
                    return [4 /*yield*/, (0, autoUpdater_js_1.getLatestVersion)(channel)];
                case 29:
                    latestVersion = _h.sent();
                    (0, debug_js_1.logForDebugging)("update: Latest version from npm: ".concat(latestVersion || 'FAILED'));
                    if (!!latestVersion) return [3 /*break*/, 31];
                    (0, debug_js_1.logForDebugging)('update: Failed to get latest version from npm registry');
                    process.stderr.write(chalk_1.default.red('Failed to check for updates') + '\n');
                    process.stderr.write('Unable to fetch latest version from npm registry\n');
                    process.stderr.write('\n');
                    process.stderr.write('Possible causes:\n');
                    process.stderr.write('  • Network connectivity issues\n');
                    process.stderr.write('  • npm registry is unreachable\n');
                    process.stderr.write('  • Corporate proxy/firewall blocking npm\n');
                    if (MACRO.PACKAGE_URL && !MACRO.PACKAGE_URL.startsWith('@anthropic')) {
                        process.stderr.write('  • Internal/development build not published to npm\n');
                    }
                    process.stderr.write('\n');
                    process.stderr.write('Try:\n');
                    process.stderr.write('  • Check your internet connection\n');
                    process.stderr.write('  • Run with --debug flag for more details\n');
                    packageName = MACRO.PACKAGE_URL ||
                        (process.env.USER_TYPE === 'ant'
                            ? '@anthropic-ai/claude-cli'
                            : '@anthropic-ai/claude-code');
                    process.stderr.write("  \u2022 Manually check: npm view ".concat(packageName, " version\n"));
                    process.stderr.write('  • Check if you need to login: npm whoami\n');
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(1)];
                case 30:
                    _h.sent();
                    _h.label = 31;
                case 31:
                    if (!(latestVersion === MACRO.VERSION)) return [3 /*break*/, 33];
                    (0, process_js_1.writeToStdout)(chalk_1.default.green("Claude Code is up to date (".concat(MACRO.VERSION, ")")) + '\n');
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(0)];
                case 32:
                    _h.sent();
                    _h.label = 33;
                case 33:
                    (0, process_js_1.writeToStdout)("New version available: ".concat(latestVersion, " (current: ").concat(MACRO.VERSION, ")\n"));
                    (0, process_js_1.writeToStdout)('Installing update...\n');
                    useLocalUpdate = false;
                    updateMethodName = '';
                    _d = diagnostic.installationType;
                    switch (_d) {
                        case 'npm-local': return [3 /*break*/, 34];
                        case 'npm-global': return [3 /*break*/, 35];
                        case 'unknown': return [3 /*break*/, 36];
                    }
                    return [3 /*break*/, 38];
                case 34:
                    useLocalUpdate = true;
                    updateMethodName = 'local';
                    return [3 /*break*/, 40];
                case 35:
                    useLocalUpdate = false;
                    updateMethodName = 'global';
                    return [3 /*break*/, 40];
                case 36: return [4 /*yield*/, (0, localInstaller_js_1.localInstallationExists)()];
                case 37:
                    isLocal = _h.sent();
                    useLocalUpdate = isLocal;
                    updateMethodName = isLocal ? 'local' : 'global';
                    (0, process_js_1.writeToStdout)(chalk_1.default.yellow('Warning: Could not determine installation type') + '\n');
                    (0, process_js_1.writeToStdout)("Attempting ".concat(updateMethodName, " update based on file detection...\n"));
                    return [3 /*break*/, 40];
                case 38:
                    process.stderr.write("Error: Cannot update ".concat(diagnostic.installationType, " installation\n"));
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(1)];
                case 39:
                    _h.sent();
                    _h.label = 40;
                case 40:
                    (0, process_js_1.writeToStdout)("Using ".concat(updateMethodName, " installation update method...\n"));
                    (0, debug_js_1.logForDebugging)("update: Update method determined: ".concat(updateMethodName));
                    (0, debug_js_1.logForDebugging)("update: useLocalUpdate: ".concat(useLocalUpdate));
                    if (!useLocalUpdate) return [3 /*break*/, 42];
                    (0, debug_js_1.logForDebugging)('update: Calling installOrUpdateClaudePackage() for local update');
                    return [4 /*yield*/, (0, localInstaller_js_1.installOrUpdateClaudePackage)(channel)];
                case 41:
                    status = _h.sent();
                    return [3 /*break*/, 44];
                case 42:
                    (0, debug_js_1.logForDebugging)('update: Calling installGlobalPackage() for global update');
                    return [4 /*yield*/, (0, autoUpdater_js_1.installGlobalPackage)()];
                case 43:
                    status = _h.sent();
                    _h.label = 44;
                case 44:
                    (0, debug_js_1.logForDebugging)("update: Installation status: ".concat(status));
                    _e = status;
                    switch (_e) {
                        case 'success': return [3 /*break*/, 45];
                        case 'no_permissions': return [3 /*break*/, 47];
                        case 'install_failed': return [3 /*break*/, 49];
                        case 'in_progress': return [3 /*break*/, 51];
                    }
                    return [3 /*break*/, 53];
                case 45:
                    (0, process_js_1.writeToStdout)(chalk_1.default.green("Successfully updated from ".concat(MACRO.VERSION, " to version ").concat(latestVersion)) + '\n');
                    return [4 /*yield*/, (0, completionCache_js_1.regenerateCompletionCache)()];
                case 46:
                    _h.sent();
                    return [3 /*break*/, 53];
                case 47:
                    process.stderr.write('Error: Insufficient permissions to install update\n');
                    if (useLocalUpdate) {
                        process.stderr.write('Try manually updating with:\n');
                        process.stderr.write("  cd ~/.claude/local && npm update ".concat(MACRO.PACKAGE_URL, "\n"));
                    }
                    else {
                        process.stderr.write('Try running with sudo or fix npm permissions\n');
                        process.stderr.write('Or consider using native installation with: claude install\n');
                    }
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(1)];
                case 48:
                    _h.sent();
                    return [3 /*break*/, 53];
                case 49:
                    process.stderr.write('Error: Failed to install update\n');
                    if (useLocalUpdate) {
                        process.stderr.write('Try manually updating with:\n');
                        process.stderr.write("  cd ~/.claude/local && npm update ".concat(MACRO.PACKAGE_URL, "\n"));
                    }
                    else {
                        process.stderr.write('Or consider using native installation with: claude install\n');
                    }
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(1)];
                case 50:
                    _h.sent();
                    return [3 /*break*/, 53];
                case 51:
                    process.stderr.write('Error: Another instance is currently performing an update\n');
                    process.stderr.write('Please wait and try again later\n');
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(1)];
                case 52:
                    _h.sent();
                    return [3 /*break*/, 53];
                case 53: return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(0)];
                case 54:
                    _h.sent();
                    return [2 /*return*/];
            }
        });
    });
}
