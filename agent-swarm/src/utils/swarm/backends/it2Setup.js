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
exports.detectPythonPackageManager = detectPythonPackageManager;
exports.isIt2CliAvailable = isIt2CliAvailable;
exports.installIt2 = installIt2;
exports.verifyIt2Setup = verifyIt2Setup;
exports.getPythonApiInstructions = getPythonApiInstructions;
exports.markIt2SetupComplete = markIt2SetupComplete;
exports.setPreferTmuxOverIterm2 = setPreferTmuxOverIterm2;
exports.getPreferTmuxOverIterm2 = getPreferTmuxOverIterm2;
var os_1 = require("os");
var config_js_1 = require("../../../utils/config.js");
var debug_js_1 = require("../../../utils/debug.js");
var execFileNoThrow_js_1 = require("../../../utils/execFileNoThrow.js");
var log_js_1 = require("../../../utils/log.js");
/**
 * Detects which Python package manager is available on the system.
 * Checks in order of preference: uvx, pipx, pip.
 *
 * @returns The detected package manager, or null if none found
 */
function detectPythonPackageManager() {
    return __awaiter(this, void 0, void 0, function () {
        var uvResult, pipxResult, pipResult, pip3Result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('which', ['uv'])];
                case 1:
                    uvResult = _a.sent();
                    if (uvResult.code === 0) {
                        (0, debug_js_1.logForDebugging)('[it2Setup] Found uv (will use uv tool install)');
                        return [2 /*return*/, 'uvx']; // Keep the type name for compatibility
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('which', ['pipx'])];
                case 2:
                    pipxResult = _a.sent();
                    if (pipxResult.code === 0) {
                        (0, debug_js_1.logForDebugging)('[it2Setup] Found pipx package manager');
                        return [2 /*return*/, 'pipx'];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('which', ['pip'])];
                case 3:
                    pipResult = _a.sent();
                    if (pipResult.code === 0) {
                        (0, debug_js_1.logForDebugging)('[it2Setup] Found pip package manager');
                        return [2 /*return*/, 'pip'];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('which', ['pip3'])];
                case 4:
                    pip3Result = _a.sent();
                    if (pip3Result.code === 0) {
                        (0, debug_js_1.logForDebugging)('[it2Setup] Found pip3 package manager');
                        return [2 /*return*/, 'pip'];
                    }
                    (0, debug_js_1.logForDebugging)('[it2Setup] No Python package manager found');
                    return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Checks if the it2 CLI tool is installed and accessible.
 *
 * @returns true if it2 is available
 */
function isIt2CliAvailable() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('which', ['it2'])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.code === 0];
            }
        });
    });
}
/**
 * Installs the it2 CLI tool using the detected package manager.
 *
 * @param packageManager - The package manager to use for installation
 * @returns Result indicating success or failure
 */
function installIt2(packageManager) {
    return __awaiter(this, void 0, void 0, function () {
        var result, _a, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)("[it2Setup] Installing it2 using ".concat(packageManager));
                    _a = packageManager;
                    switch (_a) {
                        case 'uvx': return [3 /*break*/, 1];
                        case 'pipx': return [3 /*break*/, 3];
                        case 'pip': return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 9];
                case 1: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('uv', ['tool', 'install', 'it2'], {
                        cwd: (0, os_1.homedir)(),
                    })];
                case 2:
                    // uv tool install it2 installs it globally in isolated env
                    // (uvx is for running, uv tool install is for installing)
                    result = _b.sent();
                    return [3 /*break*/, 9];
                case 3: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('pipx', ['install', 'it2'], {
                        cwd: (0, os_1.homedir)(),
                    })];
                case 4:
                    result = _b.sent();
                    return [3 /*break*/, 9];
                case 5: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('pip', ['install', '--user', 'it2'], { cwd: (0, os_1.homedir)() })];
                case 6:
                    // Use --user to install without sudo
                    result = _b.sent();
                    if (!(result.code !== 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('pip3', ['install', '--user', 'it2'], { cwd: (0, os_1.homedir)() })];
                case 7:
                    // Try pip3 if pip fails
                    result = _b.sent();
                    _b.label = 8;
                case 8: return [3 /*break*/, 9];
                case 9:
                    if (result.code !== 0) {
                        error = result.stderr || 'Unknown installation error';
                        (0, log_js_1.logError)(new Error("[it2Setup] Failed to install it2: ".concat(error)));
                        return [2 /*return*/, {
                                success: false,
                                error: error,
                                packageManager: packageManager,
                            }];
                    }
                    (0, debug_js_1.logForDebugging)('[it2Setup] it2 installed successfully');
                    return [2 /*return*/, {
                            success: true,
                            packageManager: packageManager,
                        }];
            }
        });
    });
}
/**
 * Verifies that it2 is properly configured and can communicate with iTerm2.
 * This tests the Python API connection by running a simple it2 command.
 *
 * @returns Result indicating success or the specific failure reason
 */
function verifyIt2Setup() {
    return __awaiter(this, void 0, void 0, function () {
        var installed, result, stderr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)('[it2Setup] Verifying it2 setup...');
                    return [4 /*yield*/, isIt2CliAvailable()];
                case 1:
                    installed = _a.sent();
                    if (!installed) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'it2 CLI is not installed or not in PATH',
                            }];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('it2', ['session', 'list'])];
                case 2:
                    result = _a.sent();
                    if (result.code !== 0) {
                        stderr = result.stderr.toLowerCase();
                        // Check for common Python API errors
                        if (stderr.includes('api') ||
                            stderr.includes('python') ||
                            stderr.includes('connection refused') ||
                            stderr.includes('not enabled')) {
                            (0, debug_js_1.logForDebugging)('[it2Setup] Python API not enabled in iTerm2');
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Python API not enabled in iTerm2 preferences',
                                    needsPythonApiEnabled: true,
                                }];
                        }
                        return [2 /*return*/, {
                                success: false,
                                error: result.stderr || 'Failed to communicate with iTerm2',
                            }];
                    }
                    (0, debug_js_1.logForDebugging)('[it2Setup] it2 setup verified successfully');
                    return [2 /*return*/, {
                            success: true,
                        }];
            }
        });
    });
}
/**
 * Returns instructions for enabling the Python API in iTerm2.
 */
function getPythonApiInstructions() {
    return [
        'Almost done! Enable the Python API in iTerm2:',
        '',
        '  iTerm2 → Settings → General → Magic → Enable Python API',
        '',
        'After enabling, you may need to restart iTerm2.',
    ];
}
/**
 * Marks that it2 setup has been completed successfully.
 * This prevents showing the setup prompt again.
 */
function markIt2SetupComplete() {
    var config = (0, config_js_1.getGlobalConfig)();
    if (config.iterm2It2SetupComplete !== true) {
        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { iterm2It2SetupComplete: true })); });
        (0, debug_js_1.logForDebugging)('[it2Setup] Marked it2 setup as complete');
    }
}
/**
 * Marks that the user prefers to use tmux over iTerm2 split panes.
 * This prevents showing the setup prompt when in iTerm2.
 */
function setPreferTmuxOverIterm2(prefer) {
    var config = (0, config_js_1.getGlobalConfig)();
    if (config.preferTmuxOverIterm2 !== prefer) {
        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { preferTmuxOverIterm2: prefer })); });
        (0, debug_js_1.logForDebugging)("[it2Setup] Set preferTmuxOverIterm2 = ".concat(prefer));
    }
}
/**
 * Checks if the user prefers tmux over iTerm2 split panes.
 */
function getPreferTmuxOverIterm2() {
    return (0, config_js_1.getGlobalConfig)().preferTmuxOverIterm2 === true;
}
