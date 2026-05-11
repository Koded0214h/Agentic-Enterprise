"use strict";
/**
 * Utilities for handling local installation
 */
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
exports.getLocalClaudePath = getLocalClaudePath;
exports.isRunningFromLocalInstallation = isRunningFromLocalInstallation;
exports.ensureLocalPackageEnvironment = ensureLocalPackageEnvironment;
exports.installOrUpdateClaudePackage = installOrUpdateClaudePackage;
exports.localInstallationExists = localInstallationExists;
exports.getShellType = getShellType;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var config_js_1 = require("./config.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var fsOperations_js_1 = require("./fsOperations.js");
var log_js_1 = require("./log.js");
var slowOperations_js_1 = require("./slowOperations.js");
// Lazy getters: getClaudeConfigHomeDir() is memoized and reads process.env.
// Evaluating at module scope would capture the value before entrypoints like
// hfi.tsx get a chance to set CLAUDE_CONFIG_DIR in main(), and would also
// populate the memoize cache with that stale value for all 150+ other callers.
function getLocalInstallDir() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'local');
}
function getLocalClaudePath() {
    return (0, path_1.join)(getLocalInstallDir(), 'claude');
}
/**
 * Check if we're running from our managed local installation
 */
function isRunningFromLocalInstallation() {
    var execPath = process.argv[1] || '';
    return execPath.includes('/.claude/local/node_modules/');
}
/**
 * Write `content` to `path` only if the file does not already exist.
 * Uses O_EXCL ('wx') for atomic create-if-missing.
 */
function writeIfMissing(path, content, mode) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(path, content, { encoding: 'utf8', flag: 'wx', mode: mode })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
                case 2:
                    e_1 = _a.sent();
                    if ((0, errors_js_1.getErrnoCode)(e_1) === 'EEXIST')
                        return [2 /*return*/, false];
                    throw e_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Ensure the local package environment is set up
 * Creates the directory, package.json, and wrapper script
 */
function ensureLocalPackageEnvironment() {
    return __awaiter(this, void 0, void 0, function () {
        var localInstallDir, wrapperPath, created, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    localInstallDir = getLocalInstallDir();
                    // Create installation directory (recursive, idempotent)
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir(localInstallDir)
                        // Create package.json if it doesn't exist
                    ];
                case 1:
                    // Create installation directory (recursive, idempotent)
                    _a.sent();
                    // Create package.json if it doesn't exist
                    return [4 /*yield*/, writeIfMissing((0, path_1.join)(localInstallDir, 'package.json'), (0, slowOperations_js_1.jsonStringify)({ name: 'claude-local', version: '0.0.1', private: true }, null, 2))
                        // Create the wrapper script if it doesn't exist
                    ];
                case 2:
                    // Create package.json if it doesn't exist
                    _a.sent();
                    wrapperPath = (0, path_1.join)(localInstallDir, 'claude');
                    return [4 /*yield*/, writeIfMissing(wrapperPath, "#!/bin/sh\nexec \"".concat(localInstallDir, "/node_modules/.bin/claude\" \"$@\""), 493)];
                case 3:
                    created = _a.sent();
                    if (!created) return [3 /*break*/, 5];
                    // Mode in writeFile is masked by umask; chmod to ensure executable bit.
                    return [4 /*yield*/, (0, promises_1.chmod)(wrapperPath, 493)];
                case 4:
                    // Mode in writeFile is masked by umask; chmod to ensure executable bit.
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/, true];
                case 6:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, false];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Install or update Claude CLI package in the local directory
 * @param channel - Release channel to use (latest or stable)
 * @param specificVersion - Optional specific version to install (overrides channel)
 */
function installOrUpdateClaudePackage(channel, specificVersion) {
    return __awaiter(this, void 0, void 0, function () {
        var versionSpec, result, error, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ensureLocalPackageEnvironment()];
                case 1:
                    // First ensure the environment is set up
                    if (!(_a.sent())) {
                        return [2 /*return*/, 'install_failed'];
                    }
                    versionSpec = specificVersion
                        ? specificVersion
                        : channel === 'stable'
                            ? 'stable'
                            : 'latest';
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('npm', ['install', "".concat(MACRO.PACKAGE_URL, "@").concat(versionSpec)], { cwd: getLocalInstallDir(), maxBuffer: 1000000 })];
                case 2:
                    result = _a.sent();
                    if (result.code !== 0) {
                        error = new Error("Failed to install Claude CLI package: ".concat(result.stderr));
                        (0, log_js_1.logError)(error);
                        return [2 /*return*/, result.code === 190 ? 'in_progress' : 'install_failed'];
                    }
                    // Set installMethod to 'local' to prevent npm permission warnings
                    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { installMethod: 'local' })); });
                    return [2 /*return*/, 'success'];
                case 3:
                    error_2 = _a.sent();
                    (0, log_js_1.logError)(error_2);
                    return [2 /*return*/, 'install_failed'];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if local installation exists.
 * Pure existence probe — callers use this to choose update path / UI hints.
 */
function localInstallationExists() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.access)((0, path_1.join)(getLocalInstallDir(), 'node_modules', '.bin', 'claude'))];
                case 1:
                    _b.sent();
                    return [2 /*return*/, true];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get shell type to determine appropriate path setup
 */
function getShellType() {
    var shellPath = process.env.SHELL || '';
    if (shellPath.includes('zsh'))
        return 'zsh';
    if (shellPath.includes('bash'))
        return 'bash';
    if (shellPath.includes('fish'))
        return 'fish';
    return 'unknown';
}
