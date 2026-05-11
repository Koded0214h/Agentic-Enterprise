"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.assertMinVersion = assertMinVersion;
exports.getMaxVersion = getMaxVersion;
exports.getMaxVersionMessage = getMaxVersionMessage;
exports.shouldSkipVersion = shouldSkipVersion;
exports.getLockFilePath = getLockFilePath;
exports.checkGlobalInstallPermissions = checkGlobalInstallPermissions;
exports.getLatestVersion = getLatestVersion;
exports.getNpmDistTags = getNpmDistTags;
exports.getLatestVersionFromGcs = getLatestVersionFromGcs;
exports.getGcsDistTags = getGcsDistTags;
exports.getVersionHistory = getVersionHistory;
exports.installGlobalPackage = installGlobalPackage;
var axios_1 = require("axios");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var growthbook_js_1 = require("src/services/analytics/growthbook.js");
var index_js_1 = require("src/services/analytics/index.js");
var config_js_1 = require("./config.js");
var debug_js_1 = require("./debug.js");
var env_js_1 = require("./env.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var fsOperations_js_1 = require("./fsOperations.js");
var gracefulShutdown_js_1 = require("./gracefulShutdown.js");
var log_js_1 = require("./log.js");
var semver_js_1 = require("./semver.js");
var settings_js_1 = require("./settings/settings.js");
var shellConfig_js_1 = require("./shellConfig.js");
var slowOperations_js_1 = require("./slowOperations.js");
var GCS_BUCKET_URL = 'https://storage.googleapis.com/claude-code-dist-86c565f3-f756-42ad-8dfa-d59b1c096819/claude-code-releases';
var AutoUpdaterError = /** @class */ (function (_super) {
    __extends(AutoUpdaterError, _super);
    function AutoUpdaterError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AutoUpdaterError;
}(errors_js_1.ClaudeError));
/**
 * Checks if the current version meets the minimum required version from Statsig config
 * Terminates the process with an error message if the version is too old
 *
 * NOTE ON SHA-BASED VERSIONING:
 * We use SemVer-compliant versioning with build metadata format (X.X.X+SHA) for continuous deployment.
 * According to SemVer specs, build metadata (the +SHA part) is ignored when comparing versions.
 *
 * Versioning approach:
 * 1. For version requirements/compatibility (assertMinVersion), we use semver comparison that ignores build metadata
 * 2. For updates ('claude update'), we use exact string comparison to detect any change, including SHA
 *    - This ensures users always get the latest build, even when only the SHA changes
 *    - The UI clearly shows both versions including build metadata
 *
 * This approach keeps version comparison logic simple while maintaining traceability via the SHA.
 */
function assertMinVersion() {
    return __awaiter(this, void 0, void 0, function () {
        var versionConfig, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (process.env.NODE_ENV === 'test') {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, growthbook_js_1.getDynamicConfig_BLOCKS_ON_INIT)('tengu_version_config', { minVersion: '0.0.0' })];
                case 2:
                    versionConfig = _a.sent();
                    if (versionConfig.minVersion &&
                        (0, semver_js_1.lt)(MACRO.VERSION, versionConfig.minVersion)) {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error("\nIt looks like your version of Claude Code (".concat(MACRO.VERSION, ") needs an update.\nA newer version (").concat(versionConfig.minVersion, " or higher) is required to continue.\n\nTo update, please run:\n    claude update\n\nThis will ensure you have access to the latest features and improvements.\n"));
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Returns the maximum allowed version for the current user type.
 * For ants, returns the `ant` field (dev version format).
 * For external users, returns the `external` field (clean semver).
 * This is used as a server-side kill switch to pause auto-updates during incidents.
 * Returns undefined if no cap is configured.
 */
function getMaxVersion() {
    return __awaiter(this, void 0, void 0, function () {
        var config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getMaxVersionConfig()];
                case 1:
                    config = _a.sent();
                    if (process.env.USER_TYPE === 'ant') {
                        return [2 /*return*/, config.ant || undefined];
                    }
                    return [2 /*return*/, config.external || undefined];
            }
        });
    });
}
/**
 * Returns the server-driven message explaining the known issue, if configured.
 * Shown in the warning banner when the current version exceeds the max allowed version.
 */
function getMaxVersionMessage() {
    return __awaiter(this, void 0, void 0, function () {
        var config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getMaxVersionConfig()];
                case 1:
                    config = _a.sent();
                    if (process.env.USER_TYPE === 'ant') {
                        return [2 /*return*/, config.ant_message || undefined];
                    }
                    return [2 /*return*/, config.external_message || undefined];
            }
        });
    });
}
function getMaxVersionConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, growthbook_js_1.getDynamicConfig_BLOCKS_ON_INIT)('tengu_max_version_config', {})];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_2 = _a.sent();
                    (0, log_js_1.logError)(error_2);
                    return [2 /*return*/, {}];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Checks if a target version should be skipped due to user's minimumVersion setting.
 * This is used when switching to stable channel - the user can choose to stay on their
 * current version until stable catches up, preventing downgrades.
 */
function shouldSkipVersion(targetVersion) {
    var settings = (0, settings_js_1.getInitialSettings)();
    var minimumVersion = settings === null || settings === void 0 ? void 0 : settings.minimumVersion;
    if (!minimumVersion) {
        return false;
    }
    // Skip if target version is less than minimum
    var shouldSkip = !(0, semver_js_1.gte)(targetVersion, minimumVersion);
    if (shouldSkip) {
        (0, debug_js_1.logForDebugging)("Skipping update to ".concat(targetVersion, " - below minimumVersion ").concat(minimumVersion));
    }
    return shouldSkip;
}
// Lock file for auto-updater to prevent concurrent updates
var LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minute timeout for locks
/**
 * Get the path to the lock file
 * This is a function to ensure it's evaluated at runtime after test setup
 */
function getLockFilePath() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), '.update.lock');
}
/**
 * Attempts to acquire a lock for auto-updater
 * @returns true if lock was acquired, false if another process holds the lock
 */
function acquireLock() {
    return __awaiter(this, void 0, void 0, function () {
        var fs, lockPath, stats, age, recheck, err_1, err_2, err_3, code, mkdirErr_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    lockPath = getLockFilePath();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, fs.stat(lockPath)];
                case 2:
                    stats = _a.sent();
                    age = Date.now() - stats.mtimeMs;
                    if (age < LOCK_TIMEOUT_MS) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, fs.stat(lockPath)];
                case 4:
                    recheck = _a.sent();
                    if (Date.now() - recheck.mtimeMs < LOCK_TIMEOUT_MS) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, fs.unlink(lockPath)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    if (!(0, errors_js_1.isENOENT)(err_1)) {
                        (0, log_js_1.logError)(err_1);
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 9];
                case 8:
                    err_2 = _a.sent();
                    if (!(0, errors_js_1.isENOENT)(err_2)) {
                        (0, log_js_1.logError)(err_2);
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 9];
                case 9:
                    _a.trys.push([9, 11, , 17]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(lockPath, "".concat(process.pid), {
                            encoding: 'utf8',
                            flag: 'wx',
                        })];
                case 10:
                    _a.sent();
                    return [2 /*return*/, true];
                case 11:
                    err_3 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(err_3);
                    if (code === 'EEXIST') {
                        return [2 /*return*/, false];
                    }
                    if (!(code === 'ENOENT')) return [3 /*break*/, 16];
                    _a.label = 12;
                case 12:
                    _a.trys.push([12, 15, , 16]);
                    // fs.mkdir from getFsImplementation() is always recursive:true and
                    // swallows EEXIST internally, so a dir-creation race cannot reach the
                    // catch below — only writeFile's EEXIST (true lock contention) can.
                    return [4 /*yield*/, fs.mkdir((0, envUtils_js_1.getClaudeConfigHomeDir)())];
                case 13:
                    // fs.mkdir from getFsImplementation() is always recursive:true and
                    // swallows EEXIST internally, so a dir-creation race cannot reach the
                    // catch below — only writeFile's EEXIST (true lock contention) can.
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(lockPath, "".concat(process.pid), {
                            encoding: 'utf8',
                            flag: 'wx',
                        })];
                case 14:
                    _a.sent();
                    return [2 /*return*/, true];
                case 15:
                    mkdirErr_1 = _a.sent();
                    if ((0, errors_js_1.getErrnoCode)(mkdirErr_1) === 'EEXIST') {
                        return [2 /*return*/, false];
                    }
                    (0, log_js_1.logError)(mkdirErr_1);
                    return [2 /*return*/, false];
                case 16:
                    (0, log_js_1.logError)(err_3);
                    return [2 /*return*/, false];
                case 17: return [2 /*return*/];
            }
        });
    });
}
/**
 * Releases the update lock if it's held by this process
 */
function releaseLock() {
    return __awaiter(this, void 0, void 0, function () {
        var fs, lockPath, lockData, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    lockPath = getLockFilePath();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fs.readFile(lockPath, { encoding: 'utf8' })];
                case 2:
                    lockData = _a.sent();
                    if (!(lockData === "".concat(process.pid))) return [3 /*break*/, 4];
                    return [4 /*yield*/, fs.unlink(lockPath)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_4 = _a.sent();
                    if ((0, errors_js_1.isENOENT)(err_4)) {
                        return [2 /*return*/];
                    }
                    (0, log_js_1.logError)(err_4);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getInstallationPrefix() {
    return __awaiter(this, void 0, void 0, function () {
        var isBun, prefixResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isBun = env_js_1.env.isRunningWithBun();
                    prefixResult = null;
                    if (!isBun) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('bun', ['pm', 'bin', '-g'], {
                            cwd: (0, os_1.homedir)(),
                        })];
                case 1:
                    prefixResult = _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('npm', ['-g', 'config', 'get', 'prefix'], { cwd: (0, os_1.homedir)() })];
                case 3:
                    prefixResult = _a.sent();
                    _a.label = 4;
                case 4:
                    if (prefixResult.code !== 0) {
                        (0, log_js_1.logError)(new Error("Failed to check ".concat(isBun ? 'bun' : 'npm', " permissions")));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, prefixResult.stdout.trim()];
            }
        });
    });
}
function checkGlobalInstallPermissions() {
    return __awaiter(this, void 0, void 0, function () {
        var prefix, _a, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, getInstallationPrefix()];
                case 1:
                    prefix = _b.sent();
                    if (!prefix) {
                        return [2 /*return*/, { hasPermissions: false, npmPrefix: null }];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.access)(prefix, fs_1.constants.W_OK)];
                case 3:
                    _b.sent();
                    return [2 /*return*/, { hasPermissions: true, npmPrefix: prefix }];
                case 4:
                    _a = _b.sent();
                    (0, log_js_1.logError)(new AutoUpdaterError('Insufficient permissions for global npm install.'));
                    return [2 /*return*/, { hasPermissions: false, npmPrefix: prefix }];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _b.sent();
                    (0, log_js_1.logError)(error_3);
                    return [2 /*return*/, { hasPermissions: false, npmPrefix: null }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function getLatestVersion(channel) {
    return __awaiter(this, void 0, void 0, function () {
        var npmTag, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    npmTag = channel === 'stable' ? 'stable' : 'latest';
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('npm', ['view', "".concat(MACRO.PACKAGE_URL, "@").concat(npmTag), 'version', '--prefer-online'], { abortSignal: AbortSignal.timeout(5000), cwd: (0, os_1.homedir)() })];
                case 1:
                    result = _a.sent();
                    if (result.code !== 0) {
                        (0, debug_js_1.logForDebugging)("npm view failed with code ".concat(result.code));
                        if (result.stderr) {
                            (0, debug_js_1.logForDebugging)("npm stderr: ".concat(result.stderr.trim()));
                        }
                        else {
                            (0, debug_js_1.logForDebugging)('npm stderr: (empty)');
                        }
                        if (result.stdout) {
                            (0, debug_js_1.logForDebugging)("npm stdout: ".concat(result.stdout.trim()));
                        }
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, result.stdout.trim()];
            }
        });
    });
}
/**
 * Get npm dist-tags (latest and stable versions) from the registry.
 * This is used by the doctor command to show users what versions are available.
 */
function getNpmDistTags() {
    return __awaiter(this, void 0, void 0, function () {
        var result, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('npm', ['view', MACRO.PACKAGE_URL, 'dist-tags', '--json', '--prefer-online'], { abortSignal: AbortSignal.timeout(5000), cwd: (0, os_1.homedir)() })];
                case 1:
                    result = _a.sent();
                    if (result.code !== 0) {
                        (0, debug_js_1.logForDebugging)("npm view dist-tags failed with code ".concat(result.code));
                        return [2 /*return*/, { latest: null, stable: null }];
                    }
                    try {
                        parsed = (0, slowOperations_js_1.jsonParse)(result.stdout.trim());
                        return [2 /*return*/, {
                                latest: typeof parsed.latest === 'string' ? parsed.latest : null,
                                stable: typeof parsed.stable === 'string' ? parsed.stable : null,
                            }];
                    }
                    catch (error) {
                        (0, debug_js_1.logForDebugging)("Failed to parse dist-tags: ".concat(error));
                        return [2 /*return*/, { latest: null, stable: null }];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the latest version from GCS bucket for a given release channel.
 * This is used by installations that don't have npm (e.g. package manager installs).
 */
function getLatestVersionFromGcs(channel) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get("".concat(GCS_BUCKET_URL, "/").concat(channel), {
                            timeout: 5000,
                            responseType: 'text',
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.trim()];
                case 2:
                    error_4 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to fetch ".concat(channel, " from GCS: ").concat(error_4));
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get available versions from GCS bucket (for native installations).
 * Fetches both latest and stable channel pointers.
 */
function getGcsDistTags() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, latest, stable;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        getLatestVersionFromGcs('latest'),
                        getLatestVersionFromGcs('stable'),
                    ])];
                case 1:
                    _a = _b.sent(), latest = _a[0], stable = _a[1];
                    return [2 /*return*/, { latest: latest, stable: stable }];
            }
        });
    });
}
/**
 * Get version history from npm registry (ant-only feature)
 * Returns versions sorted newest-first, limited to the specified count
 *
 * Uses NATIVE_PACKAGE_URL when available because:
 * 1. Native installation is the primary installation method for ant users
 * 2. Not all JS package versions have corresponding native packages
 * 3. This prevents rollback from listing versions that don't have native binaries
 */
function getVersionHistory(limit) {
    return __awaiter(this, void 0, void 0, function () {
        var packageUrl, result, versions;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (process.env.USER_TYPE !== 'ant') {
                        return [2 /*return*/, []];
                    }
                    packageUrl = (_a = MACRO.NATIVE_PACKAGE_URL) !== null && _a !== void 0 ? _a : MACRO.PACKAGE_URL;
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('npm', ['view', packageUrl, 'versions', '--json', '--prefer-online'], 
                        // Longer timeout for version list
                        { abortSignal: AbortSignal.timeout(30000), cwd: (0, os_1.homedir)() })];
                case 1:
                    result = _b.sent();
                    if (result.code !== 0) {
                        (0, debug_js_1.logForDebugging)("npm view versions failed with code ".concat(result.code));
                        if (result.stderr) {
                            (0, debug_js_1.logForDebugging)("npm stderr: ".concat(result.stderr.trim()));
                        }
                        return [2 /*return*/, []];
                    }
                    try {
                        versions = (0, slowOperations_js_1.jsonParse)(result.stdout.trim());
                        // Take last N versions, then reverse to get newest first
                        return [2 /*return*/, versions.slice(-limit).reverse()];
                    }
                    catch (error) {
                        (0, debug_js_1.logForDebugging)("Failed to parse version history: ".concat(error));
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function installGlobalPackage(specificVersion) {
    return __awaiter(this, void 0, void 0, function () {
        var hasPermissions, packageSpec, packageManager, installResult, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, acquireLock()];
                case 1:
                    if (!(_a.sent())) {
                        (0, log_js_1.logError)(new AutoUpdaterError('Another process is currently installing an update'));
                        // Log the lock contention
                        (0, index_js_1.logEvent)('tengu_auto_updater_lock_contention', {
                            pid: process.pid,
                            currentVersion: MACRO.VERSION,
                        });
                        return [2 /*return*/, 'in_progress'];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 6, 8]);
                    return [4 /*yield*/, removeClaudeAliasesFromShellConfigs()
                        // Check if we're using npm from Windows path in WSL
                    ];
                case 3:
                    _a.sent();
                    // Check if we're using npm from Windows path in WSL
                    if (!env_js_1.env.isRunningWithBun() && env_js_1.env.isNpmFromWindowsPath()) {
                        (0, log_js_1.logError)(new Error('Windows NPM detected in WSL environment'));
                        (0, index_js_1.logEvent)('tengu_auto_updater_windows_npm_in_wsl', {
                            currentVersion: MACRO.VERSION,
                        });
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error("\nError: Windows NPM detected in WSL\n\nYou're running Claude Code in WSL but using the Windows NPM installation from /mnt/c/.\nThis configuration is not supported for updates.\n\nTo fix this issue:\n  1. Install Node.js within your Linux distribution: e.g. sudo apt install nodejs npm\n  2. Make sure Linux NPM is in your PATH before the Windows version\n  3. Try updating again with 'claude update'\n");
                        return [2 /*return*/, 'install_failed'];
                    }
                    return [4 /*yield*/, checkGlobalInstallPermissions()];
                case 4:
                    hasPermissions = (_a.sent()).hasPermissions;
                    if (!hasPermissions) {
                        return [2 /*return*/, 'no_permissions'];
                    }
                    packageSpec = specificVersion
                        ? "".concat(MACRO.PACKAGE_URL, "@").concat(specificVersion)
                        : MACRO.PACKAGE_URL;
                    packageManager = env_js_1.env.isRunningWithBun() ? 'bun' : 'npm';
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)(packageManager, ['install', '-g', packageSpec], { cwd: (0, os_1.homedir)() })];
                case 5:
                    installResult = _a.sent();
                    if (installResult.code !== 0) {
                        error = new AutoUpdaterError("Failed to install new version of claude: ".concat(installResult.stdout, " ").concat(installResult.stderr));
                        (0, log_js_1.logError)(error);
                        return [2 /*return*/, 'install_failed'];
                    }
                    // Set installMethod to 'global' to track npm global installations
                    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { installMethod: 'global' })); });
                    return [2 /*return*/, 'success'];
                case 6: 
                // Ensure we always release the lock
                return [4 /*yield*/, releaseLock()];
                case 7:
                    // Ensure we always release the lock
                    _a.sent();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Remove claude aliases from shell configuration files
 * This helps clean up old installation methods when switching to native or npm global
 */
function removeClaudeAliasesFromShellConfigs() {
    return __awaiter(this, void 0, void 0, function () {
        var configMap, _i, _a, _b, configFile, lines, _c, filtered, hadAlias, error_5;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    configMap = (0, shellConfig_js_1.getShellConfigPaths)();
                    _i = 0, _a = Object.entries(configMap);
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    _b = _a[_i], configFile = _b[1];
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, (0, shellConfig_js_1.readFileLines)(configFile)];
                case 3:
                    lines = _d.sent();
                    if (!lines)
                        return [3 /*break*/, 7];
                    _c = (0, shellConfig_js_1.filterClaudeAliases)(lines), filtered = _c.filtered, hadAlias = _c.hadAlias;
                    if (!hadAlias) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, shellConfig_js_1.writeFileLines)(configFile, filtered)];
                case 4:
                    _d.sent();
                    (0, debug_js_1.logForDebugging)("Removed claude alias from ".concat(configFile));
                    _d.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_5 = _d.sent();
                    // Don't fail the whole operation if one file can't be processed
                    (0, debug_js_1.logForDebugging)("Failed to remove alias from ".concat(configFile, ": ").concat(error_5), {
                        level: 'error',
                    });
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/];
            }
        });
    });
}
