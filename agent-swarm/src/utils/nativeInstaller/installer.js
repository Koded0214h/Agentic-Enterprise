"use strict";
/**
 * Native Installer Implementation
 *
 * This module implements the file-based native installer system described in
 * docs/native-installer.md. It provides:
 * - Directory structure management with symlinks
 * - Version installation and activation
 * - Multi-process safety with locking
 * - Simple fallback mechanism using modification time
 * - Support for both JS and native builds
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
exports.VERSION_RETENTION_COUNT = void 0;
exports.getPlatform = getPlatform;
exports.getBinaryName = getBinaryName;
exports.removeDirectoryIfEmpty = removeDirectoryIfEmpty;
exports.checkInstall = checkInstall;
exports.installLatest = installLatest;
exports.lockCurrentVersion = lockCurrentVersion;
exports.cleanupOldVersions = cleanupOldVersions;
exports.removeInstalledSymlink = removeInstalledSymlink;
exports.cleanupShellAliases = cleanupShellAliases;
exports.cleanupNpmInstallations = cleanupNpmInstallations;
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var index_js_1 = require("src/services/analytics/index.js");
var autoUpdater_js_1 = require("../autoUpdater.js");
var cleanupRegistry_js_1 = require("../cleanupRegistry.js");
var config_js_1 = require("../config.js");
var debug_js_1 = require("../debug.js");
var doctorDiagnostic_js_1 = require("../doctorDiagnostic.js");
var env_js_1 = require("../env.js");
var envDynamic_js_1 = require("../envDynamic.js");
var envUtils_js_1 = require("../envUtils.js");
var errors_js_1 = require("../errors.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var localInstaller_js_1 = require("../localInstaller.js");
var lockfile = require("../lockfile.js");
var log_js_1 = require("../log.js");
var semver_js_1 = require("../semver.js");
var shellConfig_js_1 = require("../shellConfig.js");
var sleep_js_1 = require("../sleep.js");
var xdg_js_1 = require("../xdg.js");
var download_js_1 = require("./download.js");
var pidLock_js_1 = require("./pidLock.js");
exports.VERSION_RETENTION_COUNT = 2;
// 7 days in milliseconds - used for mtime-based lock stale timeout.
// This is long enough to survive laptop sleep durations while still
// allowing cleanup of abandoned locks from crashed processes within a reasonable time.
var LOCK_STALE_MS = 7 * 24 * 60 * 60 * 1000;
function getPlatform() {
    // Use env.platform which already handles platform detection and defaults to 'linux'
    var os = env_js_1.env.platform;
    var arch = process.arch === 'x64' ? 'x64' : process.arch === 'arm64' ? 'arm64' : null;
    if (!arch) {
        var error = new Error("Unsupported architecture: ".concat(process.arch));
        (0, debug_js_1.logForDebugging)("Native installer does not support architecture: ".concat(process.arch), { level: 'error' });
        throw error;
    }
    // Check for musl on Linux and adjust platform accordingly
    if (os === 'linux' && envDynamic_js_1.envDynamic.isMuslEnvironment()) {
        return "linux-".concat(arch, "-musl");
    }
    return "".concat(os, "-").concat(arch);
}
function getBinaryName(platform) {
    return platform.startsWith('win32') ? 'claude.exe' : 'claude';
}
function getBaseDirectories() {
    var platform = getPlatform();
    var executableName = getBinaryName(platform);
    return {
        // Data directories (permanent storage)
        versions: (0, path_1.join)((0, xdg_js_1.getXDGDataHome)(), 'claude', 'versions'),
        // Cache directories (can be deleted)
        staging: (0, path_1.join)((0, xdg_js_1.getXDGCacheHome)(), 'claude', 'staging'),
        // State directories
        locks: (0, path_1.join)((0, xdg_js_1.getXDGStateHome)(), 'claude', 'locks'),
        // User bin
        executable: (0, path_1.join)((0, xdg_js_1.getUserBinDir)(), executableName),
    };
}
function isPossibleClaudeBinary(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var stats, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)
                        // before download, the version lock file (located at the same filePath) will be size 0
                        // also, we allow small sizes because we want to treat small wrapper scripts as valid
                    ];
                case 1:
                    stats = _b.sent();
                    // before download, the version lock file (located at the same filePath) will be size 0
                    // also, we allow small sizes because we want to treat small wrapper scripts as valid
                    if (!stats.isFile() || stats.size === 0) {
                        return [2 /*return*/, false];
                    }
                    // Check if file is executable. Note: On Windows, this relies on file extensions
                    // (.exe, .bat, .cmd) and ACL permissions rather than Unix permission bits,
                    // so it may not work perfectly for all executable files on Windows.
                    return [4 /*yield*/, (0, promises_1.access)(filePath, fs_1.constants.X_OK)];
                case 2:
                    // Check if file is executable. Note: On Windows, this relies on file extensions
                    // (.exe, .bat, .cmd) and ACL permissions rather than Unix permission bits,
                    // so it may not work perfectly for all executable files on Windows.
                    _b.sent();
                    return [2 /*return*/, true];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getVersionPaths(version) {
    return __awaiter(this, void 0, void 0, function () {
        var dirs, dirsToCreate, executableParentDir, installPath, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dirs = getBaseDirectories();
                    dirsToCreate = [dirs.versions, dirs.staging, dirs.locks];
                    return [4 /*yield*/, Promise.all(dirsToCreate.map(function (dir) { return (0, promises_1.mkdir)(dir, { recursive: true }); }))
                        // Ensure parent directory of executable exists
                    ];
                case 1:
                    _b.sent();
                    executableParentDir = (0, path_1.dirname)(dirs.executable);
                    return [4 /*yield*/, (0, promises_1.mkdir)(executableParentDir, { recursive: true })];
                case 2:
                    _b.sent();
                    installPath = (0, path_1.join)(dirs.versions, version);
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 7]);
                    return [4 /*yield*/, (0, promises_1.stat)(installPath)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 5:
                    _a = _b.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(installPath, '', { encoding: 'utf8' })];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, {
                        stagingPath: (0, path_1.join)(dirs.staging, version),
                        installPath: installPath,
                    }];
            }
        });
    });
}
// Execute a callback while holding a lock on a version file
// Returns false if the file is already locked, true if callback executed
function tryWithVersionLock(versionFilePath_1, callback_1) {
    return __awaiter(this, arguments, void 0, function (versionFilePath, callback, retries) {
        var dirs, lockfilePath, attempts, maxAttempts, minTimeout, maxTimeout, success, timeout, release, lockError_1, error_1;
        var _this = this;
        if (retries === void 0) { retries = 0; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dirs = getBaseDirectories();
                    lockfilePath = getLockFilePathFromVersionPath(dirs, versionFilePath);
                    // Ensure the locks directory exists
                    return [4 /*yield*/, (0, promises_1.mkdir)(dirs.locks, { recursive: true })];
                case 1:
                    // Ensure the locks directory exists
                    _a.sent();
                    if (!(0, pidLock_js_1.isPidBasedLockingEnabled)()) return [3 /*break*/, 7];
                    attempts = 0;
                    maxAttempts = retries + 1;
                    minTimeout = retries > 0 ? 1000 : 100;
                    maxTimeout = retries > 0 ? 5000 : 500;
                    _a.label = 2;
                case 2:
                    if (!(attempts < maxAttempts)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, pidLock_js_1.withLock)(versionFilePath, lockfilePath, function () { return __awaiter(_this, void 0, void 0, function () {
                            var error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, callback()];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_2 = _a.sent();
                                        (0, log_js_1.logError)(error_2);
                                        throw error_2;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3:
                    success = _a.sent();
                    if (success) {
                        (0, index_js_1.logEvent)('tengu_version_lock_acquired', {
                            is_pid_based: true,
                            is_lifetime_lock: false,
                            attempts: attempts + 1,
                        });
                        return [2 /*return*/, true];
                    }
                    attempts++;
                    if (!(attempts < maxAttempts)) return [3 /*break*/, 5];
                    timeout = Math.min(minTimeout * Math.pow(2, attempts - 1), maxTimeout);
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(timeout)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 2];
                case 6:
                    (0, index_js_1.logEvent)('tengu_version_lock_failed', {
                        is_pid_based: true,
                        is_lifetime_lock: false,
                        attempts: maxAttempts,
                    });
                    logLockAcquisitionError(versionFilePath, new Error('Lock held by another process'));
                    return [2 /*return*/, false];
                case 7:
                    release = null;
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, , 16, 19]);
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, lockfile.lock(versionFilePath, {
                            stale: LOCK_STALE_MS,
                            retries: {
                                retries: retries,
                                minTimeout: retries > 0 ? 1000 : 100,
                                maxTimeout: retries > 0 ? 5000 : 500,
                            },
                            lockfilePath: lockfilePath,
                            // Handle lock compromise gracefully to prevent unhandled rejections
                            // This can happen if another process deletes the lock directory while we hold it
                            onCompromised: function (err) {
                                (0, debug_js_1.logForDebugging)("NON-FATAL: Version lock was compromised during operation: ".concat(err.message), { level: 'info' });
                            },
                        })];
                case 10:
                    release = _a.sent();
                    return [3 /*break*/, 12];
                case 11:
                    lockError_1 = _a.sent();
                    (0, index_js_1.logEvent)('tengu_version_lock_failed', {
                        is_pid_based: false,
                        is_lifetime_lock: false,
                    });
                    logLockAcquisitionError(versionFilePath, lockError_1);
                    return [2 /*return*/, false];
                case 12:
                    _a.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, callback()];
                case 13:
                    _a.sent();
                    (0, index_js_1.logEvent)('tengu_version_lock_acquired', {
                        is_pid_based: false,
                        is_lifetime_lock: false,
                    });
                    return [2 /*return*/, true];
                case 14:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    throw error_1;
                case 15: return [3 /*break*/, 19];
                case 16:
                    if (!release) return [3 /*break*/, 18];
                    return [4 /*yield*/, release()];
                case 17:
                    _a.sent();
                    _a.label = 18;
                case 18: return [7 /*endfinally*/];
                case 19: return [2 /*return*/];
            }
        });
    });
}
function atomicMoveToInstallPath(stagedBinaryPath, installPath) {
    return __awaiter(this, void 0, void 0, function () {
        var tempInstallPath, error_3, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: 
                // Create installation directory if it doesn't exist
                return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(installPath), { recursive: true })
                    // Move from staging to final location atomically
                ];
                case 1:
                    // Create installation directory if it doesn't exist
                    _b.sent();
                    tempInstallPath = "".concat(installPath, ".tmp.").concat(process.pid, ".").concat(Date.now());
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 6, , 11]);
                    // Copy to temp next to install path, then rename. A direct rename from staging
                    // would fail with EXDEV if staging and install are on different filesystems.
                    return [4 /*yield*/, (0, promises_1.copyFile)(stagedBinaryPath, tempInstallPath)];
                case 3:
                    // Copy to temp next to install path, then rename. A direct rename from staging
                    // would fail with EXDEV if staging and install are on different filesystems.
                    _b.sent();
                    return [4 /*yield*/, (0, promises_1.chmod)(tempInstallPath, 493)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, (0, promises_1.rename)(tempInstallPath, installPath)];
                case 5:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)("Atomically installed binary to ".concat(installPath));
                    return [3 /*break*/, 11];
                case 6:
                    error_3 = _b.sent();
                    _b.label = 7;
                case 7:
                    _b.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, promises_1.unlink)(tempInstallPath)];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 9:
                    _a = _b.sent();
                    return [3 /*break*/, 10];
                case 10: throw error_3;
                case 11: return [2 /*return*/];
            }
        });
    });
}
function installVersionFromPackage(stagingPath, installPath) {
    return __awaiter(this, void 0, void 0, function () {
        var nodeModulesDir, entries, nativePackage, error, stagedBinaryPath, _a, error, error_4, msg;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    nodeModulesDir = (0, path_1.join)(stagingPath, 'node_modules', '@anthropic-ai');
                    return [4 /*yield*/, (0, promises_1.readdir)(nodeModulesDir)];
                case 1:
                    entries = _b.sent();
                    nativePackage = entries.find(function (entry) {
                        return entry.startsWith('claude-cli-native-');
                    });
                    if (!nativePackage) {
                        (0, index_js_1.logEvent)('tengu_native_install_package_failure', {
                            stage_find_package: true,
                            error_package_not_found: true,
                        });
                        error = new Error('Could not find platform-specific native package');
                        throw error;
                    }
                    stagedBinaryPath = (0, path_1.join)(nodeModulesDir, nativePackage, 'cli');
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.stat)(stagedBinaryPath)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    (0, index_js_1.logEvent)('tengu_native_install_package_failure', {
                        stage_binary_exists: true,
                        error_binary_not_found: true,
                    });
                    error = new Error('Native binary not found in staged package');
                    throw error;
                case 5: return [4 /*yield*/, atomicMoveToInstallPath(stagedBinaryPath, installPath)
                    // Clean up staging directory
                ];
                case 6:
                    _b.sent();
                    // Clean up staging directory
                    return [4 /*yield*/, (0, promises_1.rm)(stagingPath, { recursive: true, force: true })];
                case 7:
                    // Clean up staging directory
                    _b.sent();
                    (0, index_js_1.logEvent)('tengu_native_install_package_success', {});
                    return [3 /*break*/, 9];
                case 8:
                    error_4 = _b.sent();
                    msg = (0, errors_js_1.errorMessage)(error_4);
                    if (!msg.includes('Could not find platform-specific') &&
                        !msg.includes('Native binary not found')) {
                        (0, index_js_1.logEvent)('tengu_native_install_package_failure', {
                            stage_atomic_move: true,
                            error_move_failed: true,
                        });
                    }
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_4));
                    throw error_4;
                case 9: return [2 /*return*/];
            }
        });
    });
}
function installVersionFromBinary(stagingPath, installPath) {
    return __awaiter(this, void 0, void 0, function () {
        var platform, binaryName, stagedBinaryPath, _a, error, error_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    platform = getPlatform();
                    binaryName = getBinaryName(platform);
                    stagedBinaryPath = (0, path_1.join)(stagingPath, binaryName);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(stagedBinaryPath)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    (0, index_js_1.logEvent)('tengu_native_install_binary_failure', {
                        stage_binary_exists: true,
                        error_binary_not_found: true,
                    });
                    error = new Error('Staged binary not found');
                    throw error;
                case 4: return [4 /*yield*/, atomicMoveToInstallPath(stagedBinaryPath, installPath)
                    // Clean up staging directory
                ];
                case 5:
                    _b.sent();
                    // Clean up staging directory
                    return [4 /*yield*/, (0, promises_1.rm)(stagingPath, { recursive: true, force: true })];
                case 6:
                    // Clean up staging directory
                    _b.sent();
                    (0, index_js_1.logEvent)('tengu_native_install_binary_success', {});
                    return [3 /*break*/, 8];
                case 7:
                    error_5 = _b.sent();
                    if (!(0, errors_js_1.errorMessage)(error_5).includes('Staged binary not found')) {
                        (0, index_js_1.logEvent)('tengu_native_install_binary_failure', {
                            stage_atomic_move: true,
                            error_move_failed: true,
                        });
                    }
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_5));
                    throw error_5;
                case 8: return [2 /*return*/];
            }
        });
    });
}
function installVersion(stagingPath, installPath, downloadType) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(downloadType === 'npm')) return [3 /*break*/, 2];
                    return [4 /*yield*/, installVersionFromPackage(stagingPath, installPath)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, installVersionFromBinary(stagingPath, installPath)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Performs the core update operation: download (if needed), install, and update symlink.
 * Returns whether a new install was performed (vs just updating symlink).
 */
function performVersionUpdate(version, forceReinstall) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, baseStagingPath, installPath, executablePath, stagingPath, needsInstall, downloadType, installPathExists, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getVersionPaths(version)];
                case 1:
                    _a = _c.sent(), baseStagingPath = _a.stagingPath, installPath = _a.installPath;
                    executablePath = getBaseDirectories().executable;
                    stagingPath = (0, envUtils_js_1.isEnvTruthy)(process.env.ENABLE_LOCKLESS_UPDATES)
                        ? "".concat(baseStagingPath, ".").concat(process.pid, ".").concat(Date.now())
                        : baseStagingPath;
                    return [4 /*yield*/, versionIsAvailable(version)];
                case 2:
                    needsInstall = !(_c.sent()) || forceReinstall;
                    if (!needsInstall) return [3 /*break*/, 5];
                    (0, debug_js_1.logForDebugging)(forceReinstall
                        ? "Force reinstalling native installer version ".concat(version)
                        : "Downloading native installer version ".concat(version));
                    return [4 /*yield*/, (0, download_js_1.downloadVersion)(version, stagingPath)];
                case 3:
                    downloadType = _c.sent();
                    return [4 /*yield*/, installVersion(stagingPath, installPath, downloadType)];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    (0, debug_js_1.logForDebugging)("Version ".concat(version, " already installed, updating symlink"));
                    _c.label = 6;
                case 6: 
                // Create direct symlink from ~/.local/bin/claude to the version binary
                return [4 /*yield*/, removeDirectoryIfEmpty(executablePath)];
                case 7:
                    // Create direct symlink from ~/.local/bin/claude to the version binary
                    _c.sent();
                    return [4 /*yield*/, updateSymlink(executablePath, installPath)
                        // Verify the executable was actually created/updated
                    ];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, isPossibleClaudeBinary(executablePath)];
                case 9:
                    if (!!(_c.sent())) return [3 /*break*/, 14];
                    installPathExists = false;
                    _c.label = 10;
                case 10:
                    _c.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, (0, promises_1.stat)(installPath)];
                case 11:
                    _c.sent();
                    installPathExists = true;
                    return [3 /*break*/, 13];
                case 12:
                    _b = _c.sent();
                    return [3 /*break*/, 13];
                case 13: throw new Error("Failed to create executable at ".concat(executablePath, ". ") +
                    "Source file exists: ".concat(installPathExists, ". ") +
                    "Check write permissions to ".concat(executablePath, "."));
                case 14: return [2 /*return*/, needsInstall];
            }
        });
    });
}
function versionIsAvailable(version) {
    return __awaiter(this, void 0, void 0, function () {
        var installPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getVersionPaths(version)];
                case 1:
                    installPath = (_a.sent()).installPath;
                    return [2 /*return*/, isPossibleClaudeBinary(installPath)];
            }
        });
    });
}
function updateLatest(channelOrVersion_1) {
    return __awaiter(this, arguments, void 0, function (channelOrVersion, forceReinstall) {
        var startTime, version, executablePath, maxVersion, _a, _b, wasNewInstall, latencyMs, installPath, lockAcquired, dirs, lockHolderPid, lockfilePath;
        var _this = this;
        var _c;
        if (forceReinstall === void 0) { forceReinstall = false; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    startTime = Date.now();
                    return [4 /*yield*/, (0, download_js_1.getLatestVersion)(channelOrVersion)];
                case 1:
                    version = _d.sent();
                    executablePath = getBaseDirectories().executable;
                    (0, debug_js_1.logForDebugging)("Checking for native installer update to version ".concat(version));
                    if (!!forceReinstall) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, autoUpdater_js_1.getMaxVersion)()];
                case 2:
                    maxVersion = _d.sent();
                    if (maxVersion && (0, semver_js_1.gt)(version, maxVersion)) {
                        (0, debug_js_1.logForDebugging)("Native installer: maxVersion ".concat(maxVersion, " is set, capping update from ").concat(version, " to ").concat(maxVersion));
                        // If we're already at or above maxVersion, skip the update entirely
                        if ((0, semver_js_1.gte)(MACRO.VERSION, maxVersion)) {
                            (0, debug_js_1.logForDebugging)("Native installer: current version ".concat(MACRO.VERSION, " is already at or above maxVersion ").concat(maxVersion, ", skipping update"));
                            (0, index_js_1.logEvent)('tengu_native_update_skipped_max_version', {
                                latency_ms: Date.now() - startTime,
                                max_version: maxVersion,
                                available_version: version,
                            });
                            return [2 /*return*/, { success: true, latestVersion: version }];
                        }
                        version = maxVersion;
                    }
                    _d.label = 3;
                case 3:
                    _b = !forceReinstall &&
                        version === MACRO.VERSION;
                    if (!_b) return [3 /*break*/, 5];
                    return [4 /*yield*/, versionIsAvailable(version)];
                case 4:
                    _b = (_d.sent());
                    _d.label = 5;
                case 5:
                    _a = _b;
                    if (!_a) return [3 /*break*/, 7];
                    return [4 /*yield*/, isPossibleClaudeBinary(executablePath)];
                case 6:
                    _a = (_d.sent());
                    _d.label = 7;
                case 7:
                    // Early exit: if we're already running this exact version AND both the version binary
                    // and executable exist and are valid. We need to proceed if the executable doesn't exist,
                    // is invalid (e.g., empty/corrupted from a failed install), or we're running via npx.
                    if (_a) {
                        (0, debug_js_1.logForDebugging)("Found ".concat(version, " at ").concat(executablePath, ", skipping install"));
                        (0, index_js_1.logEvent)('tengu_native_update_complete', {
                            latency_ms: Date.now() - startTime,
                            was_new_install: false,
                            was_force_reinstall: false,
                            was_already_running: true,
                        });
                        return [2 /*return*/, { success: true, latestVersion: version }];
                    }
                    // Check if this version should be skipped due to minimumVersion setting
                    if (!forceReinstall && (0, autoUpdater_js_1.shouldSkipVersion)(version)) {
                        (0, index_js_1.logEvent)('tengu_native_update_skipped_minimum_version', {
                            latency_ms: Date.now() - startTime,
                            target_version: version,
                        });
                        return [2 /*return*/, { success: true, latestVersion: version }];
                    }
                    wasNewInstall = false;
                    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.ENABLE_LOCKLESS_UPDATES)) return [3 /*break*/, 9];
                    return [4 /*yield*/, performVersionUpdate(version, forceReinstall)];
                case 8:
                    // Lockless: rely on atomic operations, errors propagate
                    wasNewInstall = _d.sent();
                    latencyMs = Date.now() - startTime;
                    return [3 /*break*/, 14];
                case 9: return [4 /*yield*/, getVersionPaths(version)
                    // If force reinstall, remove any existing lock to bypass stale locks
                ];
                case 10:
                    installPath = (_d.sent()).installPath;
                    if (!forceReinstall) return [3 /*break*/, 12];
                    return [4 /*yield*/, forceRemoveLock(installPath)];
                case 11:
                    _d.sent();
                    _d.label = 12;
                case 12: return [4 /*yield*/, tryWithVersionLock(installPath, function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, performVersionUpdate(version, forceReinstall)];
                                case 1:
                                    wasNewInstall = _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }, 3)];
                case 13:
                    lockAcquired = _d.sent();
                    latencyMs = Date.now() - startTime;
                    // Lock acquisition failed - get lock holder PID for error message
                    if (!lockAcquired) {
                        dirs = getBaseDirectories();
                        lockHolderPid = void 0;
                        if ((0, pidLock_js_1.isPidBasedLockingEnabled)()) {
                            lockfilePath = getLockFilePathFromVersionPath(dirs, installPath);
                            if ((0, pidLock_js_1.isLockActive)(lockfilePath)) {
                                lockHolderPid = (_c = (0, pidLock_js_1.readLockContent)(lockfilePath)) === null || _c === void 0 ? void 0 : _c.pid;
                            }
                        }
                        (0, index_js_1.logEvent)('tengu_native_update_lock_failed', {
                            latency_ms: latencyMs,
                            lock_holder_pid: lockHolderPid,
                        });
                        return [2 /*return*/, {
                                success: false,
                                latestVersion: version,
                                lockFailed: true,
                                lockHolderPid: lockHolderPid,
                            }];
                    }
                    _d.label = 14;
                case 14:
                    (0, index_js_1.logEvent)('tengu_native_update_complete', {
                        latency_ms: latencyMs,
                        was_new_install: wasNewInstall,
                        was_force_reinstall: forceReinstall,
                    });
                    (0, debug_js_1.logForDebugging)("Successfully updated to version ".concat(version));
                    return [2 /*return*/, { success: true, latestVersion: version }];
            }
        });
    });
}
// Exported for testing
function removeDirectoryIfEmpty(path) {
    return __awaiter(this, void 0, void 0, function () {
        var error_6, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.rmdir)(path)];
                case 1:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("Removed empty directory at ".concat(path));
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_6);
                    // Expected cases (not-a-dir, missing, not-empty) — silently skip.
                    // ENOTDIR is the normal path: executablePath is typically a symlink.
                    if (code !== 'ENOTDIR' && code !== 'ENOENT' && code !== 'ENOTEMPTY') {
                        (0, debug_js_1.logForDebugging)("Could not remove directory at ".concat(path, ": ").concat(error_6));
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function updateSymlink(symlinkPath, targetPath) {
    return __awaiter(this, void 0, void 0, function () {
        var platform, isWindows, parentDir_1, existingStats, _a, targetStats, _b, oldFileName, _c, copyError_1, restoreError_1, errorWithCause, e_1, error_7, parentDir, mkdirError_1, symlinkExists, _d, currentTarget, resolvedCurrentTarget, resolvedTargetPath, _e, error_8, tempSymlink, error_9, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    platform = getPlatform();
                    isWindows = platform.startsWith('win32');
                    if (!isWindows) return [3 /*break*/, 29];
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 28, , 29]);
                    parentDir_1 = (0, path_1.dirname)(symlinkPath);
                    return [4 /*yield*/, (0, promises_1.mkdir)(parentDir_1, { recursive: true })
                        // Check if file already exists and has same content
                    ];
                case 2:
                    _g.sent();
                    existingStats = void 0;
                    _g.label = 3;
                case 3:
                    _g.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.stat)(symlinkPath)];
                case 4:
                    existingStats = _g.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _g.sent();
                    return [3 /*break*/, 6];
                case 6:
                    if (!existingStats) return [3 /*break*/, 24];
                    _g.label = 7;
                case 7:
                    _g.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, promises_1.stat)(targetPath)
                        // If sizes match, assume files are the same (avoid reading large files)
                    ];
                case 8:
                    targetStats = _g.sent();
                    // If sizes match, assume files are the same (avoid reading large files)
                    if (existingStats.size === targetStats.size) {
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 10];
                case 9:
                    _b = _g.sent();
                    return [3 /*break*/, 10];
                case 10:
                    oldFileName = "".concat(symlinkPath, ".old.").concat(Date.now());
                    return [4 /*yield*/, (0, promises_1.rename)(symlinkPath, oldFileName)
                        // Try to copy new executable, with rollback on failure
                    ];
                case 11:
                    _g.sent();
                    _g.label = 12;
                case 12:
                    _g.trys.push([12, 18, , 23]);
                    return [4 /*yield*/, (0, promises_1.copyFile)(targetPath, symlinkPath)
                        // Success - try immediate cleanup of old file (non-blocking)
                    ];
                case 13:
                    _g.sent();
                    _g.label = 14;
                case 14:
                    _g.trys.push([14, 16, , 17]);
                    return [4 /*yield*/, (0, promises_1.unlink)(oldFileName)];
                case 15:
                    _g.sent();
                    return [3 /*break*/, 17];
                case 16:
                    _c = _g.sent();
                    return [3 /*break*/, 17];
                case 17: return [3 /*break*/, 23];
                case 18:
                    copyError_1 = _g.sent();
                    _g.label = 19;
                case 19:
                    _g.trys.push([19, 21, , 22]);
                    return [4 /*yield*/, (0, promises_1.rename)(oldFileName, symlinkPath)];
                case 20:
                    _g.sent();
                    return [3 /*break*/, 22];
                case 21:
                    restoreError_1 = _g.sent();
                    errorWithCause = new Error("Failed to restore old executable: ".concat(restoreError_1), { cause: copyError_1 });
                    (0, log_js_1.logError)(errorWithCause);
                    throw errorWithCause;
                case 22: throw copyError_1;
                case 23: return [3 /*break*/, 27];
                case 24:
                    _g.trys.push([24, 26, , 27]);
                    return [4 /*yield*/, (0, promises_1.copyFile)(targetPath, symlinkPath)];
                case 25:
                    _g.sent();
                    return [3 /*break*/, 27];
                case 26:
                    e_1 = _g.sent();
                    if ((0, errors_js_1.isENOENT)(e_1)) {
                        throw new Error("Source file does not exist: ".concat(targetPath));
                    }
                    throw e_1;
                case 27: 
                // chmod is not needed on Windows - executability is determined by .exe extension
                return [2 /*return*/, true];
                case 28:
                    error_7 = _g.sent();
                    (0, log_js_1.logError)(new Error("Failed to copy executable from ".concat(targetPath, " to ").concat(symlinkPath, ": ").concat(error_7)));
                    return [2 /*return*/, false];
                case 29:
                    parentDir = (0, path_1.dirname)(symlinkPath);
                    _g.label = 30;
                case 30:
                    _g.trys.push([30, 32, , 33]);
                    return [4 /*yield*/, (0, promises_1.mkdir)(parentDir, { recursive: true })];
                case 31:
                    _g.sent();
                    (0, debug_js_1.logForDebugging)("Created directory ".concat(parentDir, " for symlink"));
                    return [3 /*break*/, 33];
                case 32:
                    mkdirError_1 = _g.sent();
                    (0, log_js_1.logError)(new Error("Failed to create directory ".concat(parentDir, ": ").concat(mkdirError_1)));
                    return [2 /*return*/, false];
                case 33:
                    _g.trys.push([33, 44, , 45]);
                    symlinkExists = false;
                    _g.label = 34;
                case 34:
                    _g.trys.push([34, 36, , 37]);
                    return [4 /*yield*/, (0, promises_1.stat)(symlinkPath)];
                case 35:
                    _g.sent();
                    symlinkExists = true;
                    return [3 /*break*/, 37];
                case 36:
                    _d = _g.sent();
                    return [3 /*break*/, 37];
                case 37:
                    if (!symlinkExists) return [3 /*break*/, 43];
                    _g.label = 38;
                case 38:
                    _g.trys.push([38, 40, , 41]);
                    return [4 /*yield*/, (0, promises_1.readlink)(symlinkPath)];
                case 39:
                    currentTarget = _g.sent();
                    resolvedCurrentTarget = (0, path_1.resolve)((0, path_1.dirname)(symlinkPath), currentTarget);
                    resolvedTargetPath = (0, path_1.resolve)(targetPath);
                    if (resolvedCurrentTarget === resolvedTargetPath) {
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 41];
                case 40:
                    _e = _g.sent();
                    return [3 /*break*/, 41];
                case 41: 
                // Remove existing file/symlink before creating new one
                return [4 /*yield*/, (0, promises_1.unlink)(symlinkPath)];
                case 42:
                    // Remove existing file/symlink before creating new one
                    _g.sent();
                    _g.label = 43;
                case 43: return [3 /*break*/, 45];
                case 44:
                    error_8 = _g.sent();
                    (0, log_js_1.logError)(new Error("Failed to check/remove existing symlink: ".concat(error_8)));
                    return [3 /*break*/, 45];
                case 45:
                    tempSymlink = "".concat(symlinkPath, ".tmp.").concat(process.pid, ".").concat(Date.now());
                    _g.label = 46;
                case 46:
                    _g.trys.push([46, 49, , 54]);
                    return [4 /*yield*/, (0, promises_1.symlink)(targetPath, tempSymlink)
                        // Atomically rename to final name (replaces existing)
                    ];
                case 47:
                    _g.sent();
                    // Atomically rename to final name (replaces existing)
                    return [4 /*yield*/, (0, promises_1.rename)(tempSymlink, symlinkPath)];
                case 48:
                    // Atomically rename to final name (replaces existing)
                    _g.sent();
                    (0, debug_js_1.logForDebugging)("Atomically updated symlink ".concat(symlinkPath, " -> ").concat(targetPath));
                    return [2 /*return*/, true];
                case 49:
                    error_9 = _g.sent();
                    _g.label = 50;
                case 50:
                    _g.trys.push([50, 52, , 53]);
                    return [4 /*yield*/, (0, promises_1.unlink)(tempSymlink)];
                case 51:
                    _g.sent();
                    return [3 /*break*/, 53];
                case 52:
                    _f = _g.sent();
                    return [3 /*break*/, 53];
                case 53:
                    (0, log_js_1.logError)(new Error("Failed to create symlink from ".concat(symlinkPath, " to ").concat(targetPath, ": ").concat(error_9)));
                    return [2 /*return*/, false];
                case 54: return [2 /*return*/];
            }
        });
    });
}
function checkInstall() {
    return __awaiter(this, arguments, void 0, function (force) {
        var installationType, config, shouldCheckNative, dirs, messages, localBinDir, resolvedLocalBinPath, platform, isWindows, _a, target, absoluteTarget, e_2, isInCurrentPath, windowsBinPath, shellType, configPaths, configFile, displayPath;
        if (force === void 0) { force = false; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Skip all installation checks if disabled via environment variable
                    if ((0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_INSTALLATION_CHECKS)) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, (0, doctorDiagnostic_js_1.getCurrentInstallationType)()
                        // Skip checks for development builds - config.installMethod from a previous
                        // native installation shouldn't trigger warnings when running dev builds
                    ];
                case 1:
                    installationType = _b.sent();
                    // Skip checks for development builds - config.installMethod from a previous
                    // native installation shouldn't trigger warnings when running dev builds
                    if (installationType === 'development') {
                        return [2 /*return*/, []];
                    }
                    config = (0, config_js_1.getGlobalConfig)();
                    shouldCheckNative = force || installationType === 'native' || config.installMethod === 'native';
                    if (!shouldCheckNative) {
                        return [2 /*return*/, []];
                    }
                    dirs = getBaseDirectories();
                    messages = [];
                    localBinDir = (0, path_1.dirname)(dirs.executable);
                    resolvedLocalBinPath = (0, path_1.resolve)(localBinDir);
                    platform = getPlatform();
                    isWindows = platform.startsWith('win32');
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.access)(localBinDir)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    messages.push({
                        message: "installMethod is native, but directory ".concat(localBinDir, " does not exist"),
                        userActionRequired: true,
                        type: 'error',
                    });
                    return [3 /*break*/, 5];
                case 5:
                    if (!isWindows) return [3 /*break*/, 7];
                    return [4 /*yield*/, isPossibleClaudeBinary(dirs.executable)];
                case 6:
                    // On Windows it's a copied executable, not a symlink
                    if (!(_b.sent())) {
                        messages.push({
                            message: "installMethod is native, but claude command is missing or invalid at ".concat(dirs.executable),
                            userActionRequired: true,
                            type: 'error',
                        });
                    }
                    return [3 /*break*/, 14];
                case 7:
                    _b.trys.push([7, 10, , 14]);
                    return [4 /*yield*/, (0, promises_1.readlink)(dirs.executable)];
                case 8:
                    target = _b.sent();
                    absoluteTarget = (0, path_1.resolve)((0, path_1.dirname)(dirs.executable), target);
                    return [4 /*yield*/, isPossibleClaudeBinary(absoluteTarget)];
                case 9:
                    if (!(_b.sent())) {
                        messages.push({
                            message: "Claude symlink points to missing or invalid binary: ".concat(target),
                            userActionRequired: true,
                            type: 'error',
                        });
                    }
                    return [3 /*break*/, 14];
                case 10:
                    e_2 = _b.sent();
                    if (!(0, errors_js_1.isENOENT)(e_2)) return [3 /*break*/, 11];
                    messages.push({
                        message: "installMethod is native, but claude command not found at ".concat(dirs.executable),
                        userActionRequired: true,
                        type: 'error',
                    });
                    return [3 /*break*/, 13];
                case 11: return [4 /*yield*/, isPossibleClaudeBinary(dirs.executable)];
                case 12:
                    // EINVAL (not a symlink) or other — check as regular binary
                    if (!(_b.sent())) {
                        messages.push({
                            message: "".concat(dirs.executable, " exists but is not a valid Claude binary"),
                            userActionRequired: true,
                            type: 'error',
                        });
                    }
                    _b.label = 13;
                case 13: return [3 /*break*/, 14];
                case 14:
                    isInCurrentPath = (process.env.PATH || '')
                        .split(path_1.delimiter)
                        .some(function (entry) {
                        try {
                            var resolvedEntry = (0, path_1.resolve)(entry);
                            // On Windows, perform case-insensitive comparison for paths
                            if (isWindows) {
                                return (resolvedEntry.toLowerCase() === resolvedLocalBinPath.toLowerCase());
                            }
                            return resolvedEntry === resolvedLocalBinPath;
                        }
                        catch (_a) {
                            return false;
                        }
                    });
                    if (!isInCurrentPath) {
                        if (isWindows) {
                            windowsBinPath = localBinDir.replace(/\//g, '\\');
                            messages.push({
                                message: "Native installation exists but ".concat(windowsBinPath, " is not in your PATH. Add it by opening: System Properties \u2192 Environment Variables \u2192 Edit User PATH \u2192 New \u2192 Add the path above. Then restart your terminal."),
                                userActionRequired: true,
                                type: 'path',
                            });
                        }
                        else {
                            shellType = (0, localInstaller_js_1.getShellType)();
                            configPaths = (0, shellConfig_js_1.getShellConfigPaths)();
                            configFile = configPaths[shellType];
                            displayPath = configFile
                                ? configFile.replace((0, os_1.homedir)(), '~')
                                : 'your shell config file';
                            messages.push({
                                message: "Native installation exists but ~/.local/bin is not in your PATH. Run:\n\necho 'export PATH=\"$HOME/.local/bin:$PATH\"' >> ".concat(displayPath, " && source ").concat(displayPath),
                                userActionRequired: true,
                                type: 'path',
                            });
                        }
                    }
                    return [2 /*return*/, messages];
            }
        });
    });
}
// In-process singleflight guard. NativeAutoUpdater remounts whenever the
// prompt suggestions overlay toggles (PromptInput.tsx:2916), and the
// isUpdating guard does not survive the remount. Each remount kicked off a
// fresh 271MB binary download while previous ones were still in flight.
// Telemetry: session 42fed33f saw arrayBuffers climb to 91GB at ~650MB/s.
var inFlightInstall = null;
function installLatest(channelOrVersion, forceReinstall) {
    if (forceReinstall === void 0) { forceReinstall = false; }
    if (forceReinstall) {
        return installLatestImpl(channelOrVersion, forceReinstall);
    }
    if (inFlightInstall) {
        (0, debug_js_1.logForDebugging)('installLatest: joining in-flight call');
        return inFlightInstall;
    }
    var promise = installLatestImpl(channelOrVersion, forceReinstall);
    inFlightInstall = promise;
    var clear = function () {
        inFlightInstall = null;
    };
    void promise.then(clear, clear);
    return promise;
}
function installLatestImpl(channelOrVersion_1) {
    return __awaiter(this, arguments, void 0, function (channelOrVersion, forceReinstall) {
        var updateResult, config;
        if (forceReinstall === void 0) { forceReinstall = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, updateLatest(channelOrVersion, forceReinstall)];
                case 1:
                    updateResult = _a.sent();
                    if (!updateResult.success) {
                        return [2 /*return*/, {
                                latestVersion: null,
                                wasUpdated: false,
                                lockFailed: updateResult.lockFailed,
                                lockHolderPid: updateResult.lockHolderPid,
                            }];
                    }
                    config = (0, config_js_1.getGlobalConfig)();
                    if (config.installMethod !== 'native') {
                        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { installMethod: 'native', 
                            // Disable legacy auto-updater to prevent npm sessions from deleting native symlinks.
                            // Native installations use NativeAutoUpdater instead, which respects native installation.
                            autoUpdates: false, 
                            // Mark this as protection-based, not user preference
                            autoUpdatesProtectedForNative: true })); });
                        (0, debug_js_1.logForDebugging)('Native installer: Set installMethod to "native" and disabled legacy auto-updater for protection');
                    }
                    void cleanupOldVersions();
                    return [2 /*return*/, {
                            latestVersion: updateResult.latestVersion,
                            wasUpdated: updateResult.success,
                            lockFailed: false,
                        }];
            }
        });
    });
}
function getVersionFromSymlink(symlinkPath) {
    return __awaiter(this, void 0, void 0, function () {
        var target, absoluteTarget, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readlink)(symlinkPath)];
                case 1:
                    target = _b.sent();
                    absoluteTarget = (0, path_1.resolve)((0, path_1.dirname)(symlinkPath), target);
                    return [4 /*yield*/, isPossibleClaudeBinary(absoluteTarget)];
                case 2:
                    if (_b.sent()) {
                        return [2 /*return*/, absoluteTarget];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, null];
            }
        });
    });
}
function getLockFilePathFromVersionPath(dirs, versionPath) {
    var versionName = (0, path_1.basename)(versionPath);
    return (0, path_1.join)(dirs.locks, "".concat(versionName, ".lock"));
}
/**
 * Acquire a lock on the current running version to prevent it from being deleted
 * This lock is held for the entire lifetime of the process
 *
 * Uses PID-based locking (when enabled) which can immediately detect crashed processes
 * (unlike mtime-based locking which requires a 30-day timeout)
 */
function lockCurrentVersion() {
    return __awaiter(this, void 0, void 0, function () {
        var dirs, versionPath, lockfilePath, acquired, release_1, lockError_2, error_10;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dirs = getBaseDirectories();
                    // Only lock if we're running from the versions directory
                    if (!process.execPath.includes(dirs.versions)) {
                        return [2 /*return*/];
                    }
                    versionPath = (0, path_1.resolve)(process.execPath);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    lockfilePath = getLockFilePathFromVersionPath(dirs, versionPath);
                    // Ensure locks directory exists
                    return [4 /*yield*/, (0, promises_1.mkdir)(dirs.locks, { recursive: true })];
                case 2:
                    // Ensure locks directory exists
                    _a.sent();
                    if (!(0, pidLock_js_1.isPidBasedLockingEnabled)()) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, pidLock_js_1.acquireProcessLifetimeLock)(versionPath, lockfilePath)];
                case 3:
                    acquired = _a.sent();
                    if (!acquired) {
                        (0, index_js_1.logEvent)('tengu_version_lock_failed', {
                            is_pid_based: true,
                            is_lifetime_lock: true,
                        });
                        logLockAcquisitionError(versionPath, new Error('Lock already held by another process'));
                        return [2 /*return*/];
                    }
                    (0, index_js_1.logEvent)('tengu_version_lock_acquired', {
                        is_pid_based: true,
                        is_lifetime_lock: true,
                    });
                    (0, debug_js_1.logForDebugging)("Acquired PID lock on running version: ".concat(versionPath));
                    return [3 /*break*/, 7];
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, lockfile.lock(versionPath, {
                            stale: LOCK_STALE_MS,
                            retries: 0, // Don't retry - if we can't lock, that's fine
                            lockfilePath: lockfilePath,
                            // Handle lock compromise gracefully (e.g., if another process deletes the lock directory)
                            onCompromised: function (err) {
                                (0, debug_js_1.logForDebugging)("NON-FATAL: Lock on running version was compromised: ".concat(err.message), { level: 'info' });
                            },
                        })];
                case 5:
                    release_1 = _a.sent();
                    (0, index_js_1.logEvent)('tengu_version_lock_acquired', {
                        is_pid_based: false,
                        is_lifetime_lock: true,
                    });
                    (0, debug_js_1.logForDebugging)("Acquired mtime-based lock on running version: ".concat(versionPath));
                    // Release lock explicitly; proper-lockfile's cleanup is unreliable with signal-exit v3+v4
                    (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (release_1 === null || release_1 === void 0 ? void 0 : release_1())];
                                case 1:
                                    _b.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    _a = _b.sent();
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [3 /*break*/, 7];
                case 6:
                    lockError_2 = _a.sent();
                    if ((0, errors_js_1.isENOENT)(lockError_2)) {
                        (0, debug_js_1.logForDebugging)("Cannot lock current version - file does not exist: ".concat(versionPath), { level: 'info' });
                        return [2 /*return*/];
                    }
                    (0, index_js_1.logEvent)('tengu_version_lock_failed', {
                        is_pid_based: false,
                        is_lifetime_lock: true,
                    });
                    logLockAcquisitionError(versionPath, lockError_2);
                    return [2 /*return*/];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_10 = _a.sent();
                    if ((0, errors_js_1.isENOENT)(error_10)) {
                        (0, debug_js_1.logForDebugging)("Cannot lock current version - file does not exist: ".concat(versionPath), { level: 'info' });
                        return [2 /*return*/];
                    }
                    // We fallback to previous behavior where we don't acquire a lock on a running version
                    // This ~mostly works but using native binaries like ripgrep will fail
                    (0, debug_js_1.logForDebugging)("NON-FATAL: Failed to lock current version during execution ".concat((0, errors_js_1.errorMessage)(error_10)), { level: 'info' });
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function logLockAcquisitionError(versionPath, lockError) {
    (0, log_js_1.logError)(new Error("NON-FATAL: Lock acquisition failed for ".concat(versionPath, " (expected in multi-process scenarios)"), { cause: lockError }));
}
/**
 * Force-remove a lock file for a given version path.
 * Used when --force is specified to bypass stale locks.
 */
function forceRemoveLock(versionFilePath) {
    return __awaiter(this, void 0, void 0, function () {
        var dirs, lockfilePath, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dirs = getBaseDirectories();
                    lockfilePath = getLockFilePathFromVersionPath(dirs, versionFilePath);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.unlink)(lockfilePath)];
                case 2:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("Force-removed lock file at ".concat(lockfilePath));
                    return [3 /*break*/, 4];
                case 3:
                    error_11 = _a.sent();
                    // Log but don't throw - we'll try to acquire the lock anyway
                    (0, debug_js_1.logForDebugging)("Failed to force-remove lock file: ".concat((0, errors_js_1.errorMessage)(error_11)));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function cleanupOldVersions() {
    return __awaiter(this, void 0, void 0, function () {
        var dirs, oneHourAgo, executableDir, files, cleanedCount, _i, files_1, file, _a, error_12, stagingEntries, stagingCleanedCount, _b, stagingEntries_1, entry, stagingPath, stats, _c, error_13, staleLocksCleaned, versionEntries, error_14, versionFiles, tempFilesCleanedCount, _d, versionEntries_1, entry, entryPath, stats, _e, stats, _f, currentBinaryPath, protectedVersions_1, currentSymlinkVersion, _g, versionFiles_1, v, lockFilePath, hasActiveLock, _h, eligibleVersions, versionsToDelete, deletedCount_1, lockFailedCount_1, errorCount_1, error_15;
        var _this = this;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0: 
                // Yield to ensure we don't block startup
                return [4 /*yield*/, Promise.resolve()];
                case 1:
                    // Yield to ensure we don't block startup
                    _j.sent();
                    dirs = getBaseDirectories();
                    oneHourAgo = Date.now() - 3600000;
                    if (!getPlatform().startsWith('win32')) return [3 /*break*/, 11];
                    executableDir = (0, path_1.dirname)(dirs.executable);
                    _j.label = 2;
                case 2:
                    _j.trys.push([2, 10, , 11]);
                    return [4 /*yield*/, (0, promises_1.readdir)(executableDir)];
                case 3:
                    files = _j.sent();
                    cleanedCount = 0;
                    _i = 0, files_1 = files;
                    _j.label = 4;
                case 4:
                    if (!(_i < files_1.length)) return [3 /*break*/, 9];
                    file = files_1[_i];
                    if (!/^claude\.exe\.old\.\d+$/.test(file))
                        return [3 /*break*/, 8];
                    _j.label = 5;
                case 5:
                    _j.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, promises_1.unlink)((0, path_1.join)(executableDir, file))];
                case 6:
                    _j.sent();
                    cleanedCount++;
                    return [3 /*break*/, 8];
                case 7:
                    _a = _j.sent();
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9:
                    if (cleanedCount > 0) {
                        (0, debug_js_1.logForDebugging)("Cleaned up ".concat(cleanedCount, " old Windows executables on startup"));
                    }
                    return [3 /*break*/, 11];
                case 10:
                    error_12 = _j.sent();
                    if (!(0, errors_js_1.isENOENT)(error_12)) {
                        (0, debug_js_1.logForDebugging)("Failed to clean up old Windows executables: ".concat(error_12));
                    }
                    return [3 /*break*/, 11];
                case 11:
                    _j.trys.push([11, 21, , 22]);
                    return [4 /*yield*/, (0, promises_1.readdir)(dirs.staging)];
                case 12:
                    stagingEntries = _j.sent();
                    stagingCleanedCount = 0;
                    _b = 0, stagingEntries_1 = stagingEntries;
                    _j.label = 13;
                case 13:
                    if (!(_b < stagingEntries_1.length)) return [3 /*break*/, 20];
                    entry = stagingEntries_1[_b];
                    stagingPath = (0, path_1.join)(dirs.staging, entry);
                    _j.label = 14;
                case 14:
                    _j.trys.push([14, 18, , 19]);
                    return [4 /*yield*/, (0, promises_1.stat)(stagingPath)];
                case 15:
                    stats = _j.sent();
                    if (!(stats.mtime.getTime() < oneHourAgo)) return [3 /*break*/, 17];
                    return [4 /*yield*/, (0, promises_1.rm)(stagingPath, { recursive: true, force: true })];
                case 16:
                    _j.sent();
                    stagingCleanedCount++;
                    (0, debug_js_1.logForDebugging)("Cleaned up old staging directory: ".concat(entry));
                    _j.label = 17;
                case 17: return [3 /*break*/, 19];
                case 18:
                    _c = _j.sent();
                    return [3 /*break*/, 19];
                case 19:
                    _b++;
                    return [3 /*break*/, 13];
                case 20:
                    if (stagingCleanedCount > 0) {
                        (0, debug_js_1.logForDebugging)("Cleaned up ".concat(stagingCleanedCount, " orphaned staging directories"));
                        (0, index_js_1.logEvent)('tengu_native_staging_cleanup', {
                            cleaned_count: stagingCleanedCount,
                        });
                    }
                    return [3 /*break*/, 22];
                case 21:
                    error_13 = _j.sent();
                    if (!(0, errors_js_1.isENOENT)(error_13)) {
                        (0, debug_js_1.logForDebugging)("Failed to clean up staging directories: ".concat(error_13));
                    }
                    return [3 /*break*/, 22];
                case 22:
                    // Clean up stale PID locks (crashed processes) — cleanupStaleLocks handles ENOENT
                    if ((0, pidLock_js_1.isPidBasedLockingEnabled)()) {
                        staleLocksCleaned = (0, pidLock_js_1.cleanupStaleLocks)(dirs.locks);
                        if (staleLocksCleaned > 0) {
                            (0, debug_js_1.logForDebugging)("Cleaned up ".concat(staleLocksCleaned, " stale version locks"));
                            (0, index_js_1.logEvent)('tengu_native_stale_locks_cleanup', {
                                cleaned_count: staleLocksCleaned,
                            });
                        }
                    }
                    _j.label = 23;
                case 23:
                    _j.trys.push([23, 25, , 26]);
                    return [4 /*yield*/, (0, promises_1.readdir)(dirs.versions)];
                case 24:
                    versionEntries = _j.sent();
                    return [3 /*break*/, 26];
                case 25:
                    error_14 = _j.sent();
                    if (!(0, errors_js_1.isENOENT)(error_14)) {
                        (0, debug_js_1.logForDebugging)("Failed to readdir versions directory: ".concat(error_14));
                    }
                    return [2 /*return*/];
                case 26:
                    versionFiles = [];
                    tempFilesCleanedCount = 0;
                    _d = 0, versionEntries_1 = versionEntries;
                    _j.label = 27;
                case 27:
                    if (!(_d < versionEntries_1.length)) return [3 /*break*/, 38];
                    entry = versionEntries_1[_d];
                    entryPath = (0, path_1.join)(dirs.versions, entry);
                    if (!/\.tmp\.\d+\.\d+$/.test(entry)) return [3 /*break*/, 34];
                    _j.label = 28;
                case 28:
                    _j.trys.push([28, 32, , 33]);
                    return [4 /*yield*/, (0, promises_1.stat)(entryPath)];
                case 29:
                    stats = _j.sent();
                    if (!(stats.mtime.getTime() < oneHourAgo)) return [3 /*break*/, 31];
                    return [4 /*yield*/, (0, promises_1.unlink)(entryPath)];
                case 30:
                    _j.sent();
                    tempFilesCleanedCount++;
                    (0, debug_js_1.logForDebugging)("Cleaned up orphaned temp install file: ".concat(entry));
                    _j.label = 31;
                case 31: return [3 /*break*/, 33];
                case 32:
                    _e = _j.sent();
                    return [3 /*break*/, 33];
                case 33: return [3 /*break*/, 37];
                case 34:
                    _j.trys.push([34, 36, , 37]);
                    return [4 /*yield*/, (0, promises_1.stat)(entryPath)];
                case 35:
                    stats = _j.sent();
                    if (!stats.isFile())
                        return [3 /*break*/, 37];
                    if (process.platform !== 'win32' &&
                        stats.size > 0 &&
                        (stats.mode & 73) === 0) {
                        // Check executability via mode bits from the existing stat result —
                        // avoids a second syscall (access(X_OK)) and the TOCTOU window between
                        // stat and access. Skip on Windows: libuv only sets execute bits for
                        // .exe/.com/.bat/.cmd, but version files are extensionless semver
                        // strings (e.g. "1.2.3"), so this check would reject all of them.
                        // The previous access(X_OK) passed any readable file on Windows anyway.
                        return [3 /*break*/, 37];
                    }
                    versionFiles.push({
                        name: entry,
                        path: entryPath,
                        resolvedPath: (0, path_1.resolve)(entryPath),
                        mtime: stats.mtime,
                    });
                    return [3 /*break*/, 37];
                case 36:
                    _f = _j.sent();
                    return [3 /*break*/, 37];
                case 37:
                    _d++;
                    return [3 /*break*/, 27];
                case 38:
                    if (tempFilesCleanedCount > 0) {
                        (0, debug_js_1.logForDebugging)("Cleaned up ".concat(tempFilesCleanedCount, " orphaned temp install files"));
                        (0, index_js_1.logEvent)('tengu_native_temp_files_cleanup', {
                            cleaned_count: tempFilesCleanedCount,
                        });
                    }
                    if (versionFiles.length === 0) {
                        return [2 /*return*/];
                    }
                    _j.label = 39;
                case 39:
                    _j.trys.push([39, 49, , 50]);
                    currentBinaryPath = process.execPath;
                    protectedVersions_1 = new Set();
                    if (currentBinaryPath && currentBinaryPath.includes(dirs.versions)) {
                        protectedVersions_1.add((0, path_1.resolve)(currentBinaryPath));
                    }
                    return [4 /*yield*/, getVersionFromSymlink(dirs.executable)];
                case 40:
                    currentSymlinkVersion = _j.sent();
                    if (currentSymlinkVersion) {
                        protectedVersions_1.add(currentSymlinkVersion);
                    }
                    _g = 0, versionFiles_1 = versionFiles;
                    _j.label = 41;
                case 41:
                    if (!(_g < versionFiles_1.length)) return [3 /*break*/, 47];
                    v = versionFiles_1[_g];
                    if (protectedVersions_1.has(v.resolvedPath))
                        return [3 /*break*/, 46];
                    lockFilePath = getLockFilePathFromVersionPath(dirs, v.resolvedPath);
                    hasActiveLock = false;
                    if (!(0, pidLock_js_1.isPidBasedLockingEnabled)()) return [3 /*break*/, 42];
                    hasActiveLock = (0, pidLock_js_1.isLockActive)(lockFilePath);
                    return [3 /*break*/, 45];
                case 42:
                    _j.trys.push([42, 44, , 45]);
                    return [4 /*yield*/, lockfile.check(v.resolvedPath, {
                            stale: LOCK_STALE_MS,
                            lockfilePath: lockFilePath,
                        })];
                case 43:
                    hasActiveLock = _j.sent();
                    return [3 /*break*/, 45];
                case 44:
                    _h = _j.sent();
                    hasActiveLock = false;
                    return [3 /*break*/, 45];
                case 45:
                    if (hasActiveLock) {
                        protectedVersions_1.add(v.resolvedPath);
                        (0, debug_js_1.logForDebugging)("Protecting locked version from cleanup: ".concat(v.name));
                    }
                    _j.label = 46;
                case 46:
                    _g++;
                    return [3 /*break*/, 41];
                case 47:
                    eligibleVersions = versionFiles
                        .filter(function (v) { return !protectedVersions_1.has(v.resolvedPath); })
                        .sort(function (a, b) { return b.mtime.getTime() - a.mtime.getTime(); });
                    versionsToDelete = eligibleVersions.slice(exports.VERSION_RETENTION_COUNT);
                    if (versionsToDelete.length === 0) {
                        (0, index_js_1.logEvent)('tengu_native_version_cleanup', {
                            total_count: versionFiles.length,
                            deleted_count: 0,
                            protected_count: protectedVersions_1.size,
                            retained_count: exports.VERSION_RETENTION_COUNT,
                            lock_failed_count: 0,
                            error_count: 0,
                        });
                        return [2 /*return*/];
                    }
                    deletedCount_1 = 0;
                    lockFailedCount_1 = 0;
                    errorCount_1 = 0;
                    return [4 /*yield*/, Promise.all(versionsToDelete.map(function (version) { return __awaiter(_this, void 0, void 0, function () {
                            var deleted, error_16;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, tryWithVersionLock(version.path, function () { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, (0, promises_1.unlink)(version.path)];
                                                        case 1:
                                                            _a.sent();
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 1:
                                        deleted = _a.sent();
                                        if (deleted) {
                                            deletedCount_1++;
                                        }
                                        else {
                                            lockFailedCount_1++;
                                            (0, debug_js_1.logForDebugging)("Skipping deletion of ".concat(version.name, " - locked by another process"));
                                        }
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_16 = _a.sent();
                                        errorCount_1++;
                                        (0, log_js_1.logError)(new Error("Failed to delete version ".concat(version.name, ": ").concat(error_16)));
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 48:
                    _j.sent();
                    (0, index_js_1.logEvent)('tengu_native_version_cleanup', {
                        total_count: versionFiles.length,
                        deleted_count: deletedCount_1,
                        protected_count: protectedVersions_1.size,
                        retained_count: exports.VERSION_RETENTION_COUNT,
                        lock_failed_count: lockFailedCount_1,
                        error_count: errorCount_1,
                    });
                    return [3 /*break*/, 50];
                case 49:
                    error_15 = _j.sent();
                    if (!(0, errors_js_1.isENOENT)(error_15)) {
                        (0, log_js_1.logError)(new Error("Version cleanup failed: ".concat(error_15)));
                    }
                    return [3 /*break*/, 50];
                case 50: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if a given path is managed by npm
 * @param executablePath - The path to check (can be a symlink)
 * @returns true if the path is npm-managed, false otherwise
 */
function isNpmSymlink(executablePath) {
    return __awaiter(this, void 0, void 0, function () {
        var targetPath, stats;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    targetPath = executablePath;
                    return [4 /*yield*/, (0, promises_1.lstat)(executablePath)];
                case 1:
                    stats = _a.sent();
                    if (!stats.isSymbolicLink()) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, promises_1.realpath)(executablePath)];
                case 2:
                    targetPath = _a.sent();
                    _a.label = 3;
                case 3: 
                // checking npm prefix isn't guaranteed to work, as prefix can change
                // and users may set --prefix manually when installing
                // thus we use this heuristic:
                return [2 /*return*/, targetPath.endsWith('.js') || targetPath.includes('node_modules')];
            }
        });
    });
}
/**
 * Remove the claude symlink from the executable directory
 * This is used when switching away from native installation
 * Will only remove if it's a native binary symlink, not npm-managed JS files
 */
function removeInstalledSymlink() {
    return __awaiter(this, void 0, void 0, function () {
        var dirs, error_17;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dirs = getBaseDirectories();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, isNpmSymlink(dirs.executable)];
                case 2:
                    // Check if this is an npm-managed installation
                    if (_a.sent()) {
                        (0, debug_js_1.logForDebugging)("Skipping removal of ".concat(dirs.executable, " - appears to be npm-managed"));
                        return [2 /*return*/];
                    }
                    // It's a native binary symlink, safe to remove
                    return [4 /*yield*/, (0, promises_1.unlink)(dirs.executable)];
                case 3:
                    // It's a native binary symlink, safe to remove
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("Removed claude symlink at ".concat(dirs.executable));
                    return [3 /*break*/, 5];
                case 4:
                    error_17 = _a.sent();
                    if ((0, errors_js_1.isENOENT)(error_17)) {
                        return [2 /*return*/];
                    }
                    (0, log_js_1.logError)(new Error("Failed to remove claude symlink: ".concat(error_17)));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Clean up old claude aliases from shell configuration files
 * Only handles alias removal, not PATH setup
 */
function cleanupShellAliases() {
    return __awaiter(this, void 0, void 0, function () {
        var messages, configMap, _i, _a, _b, shellType, configFile, lines, _c, filtered, hadAlias, error_18;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    messages = [];
                    configMap = (0, shellConfig_js_1.getShellConfigPaths)();
                    _i = 0, _a = Object.entries(configMap);
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    _b = _a[_i], shellType = _b[0], configFile = _b[1];
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
                    messages.push({
                        message: "Removed claude alias from ".concat(configFile, ". Run: unalias claude"),
                        userActionRequired: true,
                        type: 'alias',
                    });
                    (0, debug_js_1.logForDebugging)("Cleaned up claude alias from ".concat(shellType, " config"));
                    _d.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_18 = _d.sent();
                    (0, log_js_1.logError)(error_18);
                    messages.push({
                        message: "Failed to clean up ".concat(configFile, ": ").concat(error_18),
                        userActionRequired: false,
                        type: 'error',
                    });
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, messages];
            }
        });
    });
}
function manualRemoveNpmPackage(packageName) {
    return __awaiter(this, void 0, void 0, function () {
        // Helper to try removing a file. unlink alone is sufficient — it throws
        // ENOENT if the file is missing, which the catch handles identically.
        // A stat() pre-check would add a syscall and a TOCTOU window where
        // concurrent cleanup causes a false-negative return.
        function tryRemove(filePath, description) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, (0, promises_1.unlink)(filePath)];
                        case 1:
                            _b.sent();
                            (0, debug_js_1.logForDebugging)("Manually removed ".concat(description, ": ").concat(filePath));
                            return [2 /*return*/, true];
                        case 2:
                            _a = _b.sent();
                            return [2 /*return*/, false];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        var prefixResult, globalPrefix, manuallyRemoved, binCmd, binPs1, binExe, binSymlink, nodeModulesPath, manualError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('npm', [
                            'config',
                            'get',
                            'prefix',
                        ])];
                case 1:
                    prefixResult = _a.sent();
                    if (prefixResult.code !== 0 || !prefixResult.stdout) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Failed to get npm global prefix',
                            }];
                    }
                    globalPrefix = prefixResult.stdout.trim();
                    manuallyRemoved = false;
                    if (!getPlatform().startsWith('win32')) return [3 /*break*/, 5];
                    binCmd = (0, path_1.join)(globalPrefix, 'claude.cmd');
                    binPs1 = (0, path_1.join)(globalPrefix, 'claude.ps1');
                    binExe = (0, path_1.join)(globalPrefix, 'claude');
                    return [4 /*yield*/, tryRemove(binCmd, 'bin script')];
                case 2:
                    if (_a.sent()) {
                        manuallyRemoved = true;
                    }
                    return [4 /*yield*/, tryRemove(binPs1, 'PowerShell script')];
                case 3:
                    if (_a.sent()) {
                        manuallyRemoved = true;
                    }
                    return [4 /*yield*/, tryRemove(binExe, 'bin executable')];
                case 4:
                    if (_a.sent()) {
                        manuallyRemoved = true;
                    }
                    return [3 /*break*/, 7];
                case 5:
                    binSymlink = (0, path_1.join)(globalPrefix, 'bin', 'claude');
                    return [4 /*yield*/, tryRemove(binSymlink, 'bin symlink')];
                case 6:
                    if (_a.sent()) {
                        manuallyRemoved = true;
                    }
                    _a.label = 7;
                case 7:
                    if (manuallyRemoved) {
                        (0, debug_js_1.logForDebugging)("Successfully removed ".concat(packageName, " manually"));
                        nodeModulesPath = getPlatform().startsWith('win32')
                            ? (0, path_1.join)(globalPrefix, 'node_modules', packageName)
                            : (0, path_1.join)(globalPrefix, 'lib', 'node_modules', packageName);
                        return [2 /*return*/, {
                                success: true,
                                warning: "".concat(packageName, " executables removed, but node_modules directory was left intact for safety. You may manually delete it later at: ").concat(nodeModulesPath),
                            }];
                    }
                    else {
                        return [2 /*return*/, { success: false }];
                    }
                    return [3 /*break*/, 9];
                case 8:
                    manualError_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Manual removal failed: ".concat(manualError_1), {
                        level: 'error',
                    });
                    return [2 /*return*/, {
                            success: false,
                            error: "Manual removal failed: ".concat(manualError_1),
                        }];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function attemptNpmUninstall(packageName) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, code, stderr, manualResult;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('npm', ['uninstall', '-g', packageName], 
                    // eslint-disable-next-line custom-rules/no-process-cwd -- matches original behavior
                    { cwd: process.cwd() })];
                case 1:
                    _a = _b.sent(), code = _a.code, stderr = _a.stderr;
                    if (!(code === 0)) return [3 /*break*/, 2];
                    (0, debug_js_1.logForDebugging)("Removed global npm installation of ".concat(packageName));
                    return [2 /*return*/, { success: true }];
                case 2:
                    if (!(stderr && !stderr.includes('npm ERR! code E404'))) return [3 /*break*/, 5];
                    if (!stderr.includes('npm error code ENOTEMPTY')) return [3 /*break*/, 4];
                    (0, debug_js_1.logForDebugging)("Failed to uninstall global npm package ".concat(packageName, ": ").concat(stderr), { level: 'error' });
                    (0, debug_js_1.logForDebugging)("Attempting manual removal due to ENOTEMPTY error");
                    return [4 /*yield*/, manualRemoveNpmPackage(packageName)];
                case 3:
                    manualResult = _b.sent();
                    if (manualResult.success) {
                        return [2 /*return*/, { success: true, warning: manualResult.warning }];
                    }
                    else if (manualResult.error) {
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to remove global npm installation of ".concat(packageName, ": ").concat(stderr, ". Manual removal also failed: ").concat(manualResult.error),
                            }];
                    }
                    _b.label = 4;
                case 4:
                    // Only report as error if it's not a "package not found" error
                    (0, debug_js_1.logForDebugging)("Failed to uninstall global npm package ".concat(packageName, ": ").concat(stderr), { level: 'error' });
                    return [2 /*return*/, {
                            success: false,
                            error: "Failed to remove global npm installation of ".concat(packageName, ": ").concat(stderr),
                        }];
                case 5: return [2 /*return*/, { success: false }]; // Package not found, not an error
            }
        });
    });
}
function cleanupNpmInstallations() {
    return __awaiter(this, void 0, void 0, function () {
        var errors, warnings, removed, codePackageResult, macroPackageResult, localInstallDir, error_19;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errors = [];
                    warnings = [];
                    removed = 0;
                    return [4 /*yield*/, attemptNpmUninstall('@anthropic-ai/claude-code')];
                case 1:
                    codePackageResult = _a.sent();
                    if (codePackageResult.success) {
                        removed++;
                        if (codePackageResult.warning) {
                            warnings.push(codePackageResult.warning);
                        }
                    }
                    else if (codePackageResult.error) {
                        errors.push(codePackageResult.error);
                    }
                    if (!(MACRO.PACKAGE_URL && MACRO.PACKAGE_URL !== '@anthropic-ai/claude-code')) return [3 /*break*/, 3];
                    return [4 /*yield*/, attemptNpmUninstall(MACRO.PACKAGE_URL)];
                case 2:
                    macroPackageResult = _a.sent();
                    if (macroPackageResult.success) {
                        removed++;
                        if (macroPackageResult.warning) {
                            warnings.push(macroPackageResult.warning);
                        }
                    }
                    else if (macroPackageResult.error) {
                        errors.push(macroPackageResult.error);
                    }
                    _a.label = 3;
                case 3:
                    localInstallDir = (0, path_1.join)((0, os_1.homedir)(), '.claude', 'local');
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, promises_1.rm)(localInstallDir, { recursive: true })];
                case 5:
                    _a.sent();
                    removed++;
                    (0, debug_js_1.logForDebugging)("Removed local installation at ".concat(localInstallDir));
                    return [3 /*break*/, 7];
                case 6:
                    error_19 = _a.sent();
                    if (!(0, errors_js_1.isENOENT)(error_19)) {
                        errors.push("Failed to remove ".concat(localInstallDir, ": ").concat(error_19));
                        (0, debug_js_1.logForDebugging)("Failed to remove local installation: ".concat(error_19), {
                            level: 'error',
                        });
                    }
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, { removed: removed, errors: errors, warnings: warnings }];
            }
        });
    });
}
