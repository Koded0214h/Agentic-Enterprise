"use strict";
/**
 * Download functionality for native installer
 *
 * Handles downloading Claude binaries from various sources:
 * - Artifactory NPM packages
 * - GCS bucket
 */
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
exports._downloadAndVerifyBinaryForTesting = exports.STALL_TIMEOUT_MS = exports.MAX_DOWNLOAD_RETRIES = exports.StallTimeoutError = exports.ARTIFACTORY_REGISTRY_URL = void 0;
exports.getLatestVersionFromArtifactory = getLatestVersionFromArtifactory;
exports.getLatestVersionFromBinaryRepo = getLatestVersionFromBinaryRepo;
exports.getLatestVersion = getLatestVersion;
exports.downloadVersionFromArtifactory = downloadVersionFromArtifactory;
exports.downloadVersionFromBinaryRepo = downloadVersionFromBinaryRepo;
exports.downloadVersion = downloadVersion;
var bun_bundle_1 = require("bun:bundle");
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var index_js_1 = require("src/services/analytics/index.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var fsOperations_js_1 = require("../fsOperations.js");
var log_js_1 = require("../log.js");
var sleep_js_1 = require("../sleep.js");
var slowOperations_js_1 = require("../slowOperations.js");
var installer_js_1 = require("./installer.js");
var GCS_BUCKET_URL = 'https://storage.googleapis.com/claude-code-dist-86c565f3-f756-42ad-8dfa-d59b1c096819/claude-code-releases';
exports.ARTIFACTORY_REGISTRY_URL = 'https://artifactory.infra.ant.dev/artifactory/api/npm/npm-all/';
function getLatestVersionFromArtifactory() {
    return __awaiter(this, arguments, void 0, function (tag) {
        var startTime, _a, stdout, code, stderr, latencyMs, error, latestVersion;
        if (tag === void 0) { tag = 'latest'; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startTime = Date.now();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('npm', [
                            'view',
                            "".concat(MACRO.NATIVE_PACKAGE_URL, "@").concat(tag),
                            'version',
                            '--prefer-online',
                            '--registry',
                            exports.ARTIFACTORY_REGISTRY_URL,
                        ], {
                            timeout: 30000,
                            preserveOutputOnError: true,
                        })];
                case 1:
                    _a = _b.sent(), stdout = _a.stdout, code = _a.code, stderr = _a.stderr;
                    latencyMs = Date.now() - startTime;
                    if (code !== 0) {
                        (0, index_js_1.logEvent)('tengu_version_check_failure', {
                            latency_ms: latencyMs,
                            source_npm: true,
                            exit_code: code,
                        });
                        error = new Error("npm view failed with code ".concat(code, ": ").concat(stderr));
                        (0, log_js_1.logError)(error);
                        throw error;
                    }
                    (0, index_js_1.logEvent)('tengu_version_check_success', {
                        latency_ms: latencyMs,
                        source_npm: true,
                    });
                    (0, debug_js_1.logForDebugging)("npm view ".concat(MACRO.NATIVE_PACKAGE_URL, "@").concat(tag, " version: ").concat(stdout));
                    latestVersion = stdout.trim();
                    return [2 /*return*/, latestVersion];
            }
        });
    });
}
function getLatestVersionFromBinaryRepo() {
    return __awaiter(this, arguments, void 0, function (channel, baseUrl, authConfig) {
        var startTime, response, latencyMs, error_1, latencyMs, errorMessage, httpStatus, fetchError;
        if (channel === void 0) { channel = 'latest'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startTime = Date.now();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get("".concat(baseUrl, "/").concat(channel), __assign({ timeout: 30000, responseType: 'text' }, authConfig))];
                case 2:
                    response = _a.sent();
                    latencyMs = Date.now() - startTime;
                    (0, index_js_1.logEvent)('tengu_version_check_success', {
                        latency_ms: latencyMs,
                    });
                    return [2 /*return*/, response.data.trim()];
                case 3:
                    error_1 = _a.sent();
                    latencyMs = Date.now() - startTime;
                    errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                    httpStatus = void 0;
                    if (axios_1.default.isAxiosError(error_1) && error_1.response) {
                        httpStatus = error_1.response.status;
                    }
                    (0, index_js_1.logEvent)('tengu_version_check_failure', {
                        latency_ms: latencyMs,
                        http_status: httpStatus,
                        is_timeout: errorMessage.includes('timeout'),
                    });
                    fetchError = new Error("Failed to fetch version from ".concat(baseUrl, "/").concat(channel, ": ").concat(errorMessage));
                    (0, log_js_1.logError)(fetchError);
                    throw fetchError;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getLatestVersion(channelOrVersion) {
    return __awaiter(this, void 0, void 0, function () {
        var normalized, channel, npmTag;
        return __generator(this, function (_a) {
            // Direct version - match internal format too (e.g. 1.0.30-dev.shaf4937ce)
            if (/^v?\d+\.\d+\.\d+(-\S+)?$/.test(channelOrVersion)) {
                normalized = channelOrVersion.startsWith('v')
                    ? channelOrVersion.slice(1)
                    : channelOrVersion;
                // 99.99.x is reserved for CI smoke-test fixtures on real GCS.
                // feature() is false in all shipped builds — DCE collapses this to an
                // unconditional throw. Only `bun --feature=ALLOW_TEST_VERSIONS` (the
                // smoke test's source-level invocation) bypasses.
                if (/^99\.99\./.test(normalized) && !(0, bun_bundle_1.feature)('ALLOW_TEST_VERSIONS')) {
                    throw new Error("Version ".concat(normalized, " is not available for installation. Use 'stable' or 'latest'."));
                }
                return [2 /*return*/, normalized];
            }
            channel = channelOrVersion;
            if (channel !== 'stable' && channel !== 'latest') {
                throw new Error("Invalid channel: ".concat(channelOrVersion, ". Use 'stable' or 'latest'"));
            }
            // Route to appropriate source
            if (process.env.USER_TYPE === 'ant') {
                npmTag = channel === 'stable' ? 'stable' : 'latest';
                return [2 /*return*/, getLatestVersionFromArtifactory(npmTag)];
            }
            // Use GCS for external users
            return [2 /*return*/, getLatestVersionFromBinaryRepo(channel, GCS_BUCKET_URL)];
        });
    });
}
function downloadVersionFromArtifactory(version, stagingPath) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, platform, platformPackageName, _a, integrityOutput, code, stderr, integrity, packageJson, packageLock, result;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    // If we get here, we own the lock and can delete a partial download
                    return [4 /*yield*/, fs.rm(stagingPath, { recursive: true, force: true })
                        // Get the platform-specific package name
                    ];
                case 1:
                    // If we get here, we own the lock and can delete a partial download
                    _f.sent();
                    platform = (0, installer_js_1.getPlatform)();
                    platformPackageName = "".concat(MACRO.NATIVE_PACKAGE_URL, "-").concat(platform);
                    // Fetch integrity hash for the platform-specific package
                    (0, debug_js_1.logForDebugging)("Fetching integrity hash for ".concat(platformPackageName, "@").concat(version));
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('npm', [
                            'view',
                            "".concat(platformPackageName, "@").concat(version),
                            'dist.integrity',
                            '--registry',
                            exports.ARTIFACTORY_REGISTRY_URL,
                        ], {
                            timeout: 30000,
                            preserveOutputOnError: true,
                        })];
                case 2:
                    _a = _f.sent(), integrityOutput = _a.stdout, code = _a.code, stderr = _a.stderr;
                    if (code !== 0) {
                        throw new Error("npm view integrity failed with code ".concat(code, ": ").concat(stderr));
                    }
                    integrity = integrityOutput.trim();
                    if (!integrity) {
                        throw new Error("Failed to fetch integrity hash for ".concat(platformPackageName, "@").concat(version));
                    }
                    (0, debug_js_1.logForDebugging)("Got integrity hash for ".concat(platform, ": ").concat(integrity));
                    // Create isolated npm project in staging
                    return [4 /*yield*/, fs.mkdir(stagingPath)];
                case 3:
                    // Create isolated npm project in staging
                    _f.sent();
                    packageJson = {
                        name: 'claude-native-installer',
                        version: '0.0.1',
                        dependencies: (_b = {},
                            _b[MACRO.NATIVE_PACKAGE_URL] = version,
                            _b),
                    };
                    packageLock = {
                        name: 'claude-native-installer',
                        version: '0.0.1',
                        lockfileVersion: 3,
                        requires: true,
                        packages: (_c = {
                                '': {
                                    name: 'claude-native-installer',
                                    version: '0.0.1',
                                    dependencies: (_d = {},
                                        _d[MACRO.NATIVE_PACKAGE_URL] = version,
                                        _d),
                                }
                            },
                            _c["node_modules/".concat(MACRO.NATIVE_PACKAGE_URL)] = {
                                version: version,
                                optionalDependencies: (_e = {},
                                    _e[platformPackageName] = version,
                                    _e),
                            },
                            _c["node_modules/".concat(platformPackageName)] = {
                                version: version,
                                integrity: integrity,
                            },
                            _c),
                    };
                    (0, slowOperations_js_1.writeFileSync_DEPRECATED)((0, path_1.join)(stagingPath, 'package.json'), (0, slowOperations_js_1.jsonStringify)(packageJson, null, 2), { encoding: 'utf8', flush: true });
                    (0, slowOperations_js_1.writeFileSync_DEPRECATED)((0, path_1.join)(stagingPath, 'package-lock.json'), (0, slowOperations_js_1.jsonStringify)(packageLock, null, 2), { encoding: 'utf8', flush: true });
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('npm', ['ci', '--prefer-online', '--registry', exports.ARTIFACTORY_REGISTRY_URL], {
                            timeout: 60000,
                            preserveOutputOnError: true,
                            cwd: stagingPath,
                        })];
                case 4:
                    result = _f.sent();
                    if (result.code !== 0) {
                        throw new Error("npm ci failed with code ".concat(result.code, ": ").concat(result.stderr));
                    }
                    (0, debug_js_1.logForDebugging)("Successfully downloaded and verified ".concat(MACRO.NATIVE_PACKAGE_URL, "@").concat(version));
                    return [2 /*return*/];
            }
        });
    });
}
// Stall timeout: abort if no bytes received for this duration
var DEFAULT_STALL_TIMEOUT_MS = 60000; // 60 seconds
var MAX_DOWNLOAD_RETRIES = 3;
exports.MAX_DOWNLOAD_RETRIES = MAX_DOWNLOAD_RETRIES;
function getStallTimeoutMs() {
    return (Number(process.env.CLAUDE_CODE_STALL_TIMEOUT_MS_FOR_TESTING) ||
        DEFAULT_STALL_TIMEOUT_MS);
}
var StallTimeoutError = /** @class */ (function (_super) {
    __extends(StallTimeoutError, _super);
    function StallTimeoutError() {
        var _this = _super.call(this, 'Download stalled: no data received for 60 seconds') || this;
        _this.name = 'StallTimeoutError';
        return _this;
    }
    return StallTimeoutError;
}(Error));
exports.StallTimeoutError = StallTimeoutError;
/**
 * Common logic for downloading and verifying a binary.
 * Includes stall detection (aborts if no bytes for 60s) and retry logic.
 */
function downloadAndVerifyBinary(binaryUrl_1, expectedChecksum_1, binaryPath_1) {
    return __awaiter(this, arguments, void 0, function (binaryUrl, expectedChecksum, binaryPath, requestConfig) {
        var lastError, _loop_1, attempt, state_1;
        if (requestConfig === void 0) { requestConfig = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _loop_1 = function (attempt) {
                        var controller, stallTimer, clearStallTimer, resetStallTimer, response, hash, actualChecksum, error_2, isStallTimeout;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    controller = new AbortController();
                                    clearStallTimer = function () {
                                        if (stallTimer) {
                                            clearTimeout(stallTimer);
                                            stallTimer = undefined;
                                        }
                                    };
                                    resetStallTimer = function () {
                                        clearStallTimer();
                                        stallTimer = setTimeout(function (c) { return c.abort(); }, getStallTimeoutMs(), controller);
                                    };
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 5, , 8]);
                                    // Start the stall timer before the request
                                    resetStallTimer();
                                    return [4 /*yield*/, axios_1.default.get(binaryUrl, __assign({ timeout: 5 * 60000, responseType: 'arraybuffer', signal: controller.signal, onDownloadProgress: function () {
                                                // Reset stall timer on each chunk of data received
                                                resetStallTimer();
                                            } }, requestConfig))];
                                case 2:
                                    response = _b.sent();
                                    clearStallTimer();
                                    hash = (0, crypto_1.createHash)('sha256');
                                    hash.update(response.data);
                                    actualChecksum = hash.digest('hex');
                                    if (actualChecksum !== expectedChecksum) {
                                        throw new Error("Checksum mismatch: expected ".concat(expectedChecksum, ", got ").concat(actualChecksum));
                                    }
                                    // Write binary to disk
                                    return [4 /*yield*/, (0, promises_1.writeFile)(binaryPath, Buffer.from(response.data))];
                                case 3:
                                    // Write binary to disk
                                    _b.sent();
                                    return [4 /*yield*/, (0, promises_1.chmod)(binaryPath, 493)
                                        // Success - return early
                                    ];
                                case 4:
                                    _b.sent();
                                    return [2 /*return*/, { value: void 0 }];
                                case 5:
                                    error_2 = _b.sent();
                                    clearStallTimer();
                                    isStallTimeout = axios_1.default.isCancel(error_2);
                                    if (isStallTimeout) {
                                        lastError = new StallTimeoutError();
                                    }
                                    else {
                                        lastError = (0, errors_js_1.toError)(error_2);
                                    }
                                    if (!(isStallTimeout && attempt < MAX_DOWNLOAD_RETRIES)) return [3 /*break*/, 7];
                                    (0, debug_js_1.logForDebugging)("Download stalled on attempt ".concat(attempt, "/").concat(MAX_DOWNLOAD_RETRIES, ", retrying..."));
                                    // Brief pause before retry to let network recover
                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(1000)];
                                case 6:
                                    // Brief pause before retry to let network recover
                                    _b.sent();
                                    return [2 /*return*/, "continue"];
                                case 7: 
                                // Don't retry other errors (HTTP errors, checksum mismatches, etc.)
                                throw lastError;
                                case 8: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 1;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= MAX_DOWNLOAD_RETRIES)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _a.label = 3;
                case 3:
                    attempt++;
                    return [3 /*break*/, 1];
                case 4: 
                // Should not reach here, but just in case
                throw lastError !== null && lastError !== void 0 ? lastError : new Error('Download failed after all retries');
            }
        });
    });
}
function downloadVersionFromBinaryRepo(version, stagingPath, baseUrl, authConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, platform, startTime, manifest, manifestResponse, error_3, latencyMs, errorMessage, httpStatus, platformInfo, expectedChecksum, binaryName, binaryUrl, binaryPath, latencyMs, error_4, latencyMs, errorMessage, httpStatus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    // If we get here, we own the lock and can delete a partial download
                    return [4 /*yield*/, fs.rm(stagingPath, { recursive: true, force: true })
                        // Get platform
                    ];
                case 1:
                    // If we get here, we own the lock and can delete a partial download
                    _a.sent();
                    platform = (0, installer_js_1.getPlatform)();
                    startTime = Date.now();
                    // Log download attempt start
                    (0, index_js_1.logEvent)('tengu_binary_download_attempt', {});
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.get("".concat(baseUrl, "/").concat(version, "/manifest.json"), __assign({ timeout: 10000, responseType: 'json' }, authConfig))];
                case 3:
                    manifestResponse = _a.sent();
                    manifest = manifestResponse.data;
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    latencyMs = Date.now() - startTime;
                    errorMessage = error_3 instanceof Error ? error_3.message : String(error_3);
                    httpStatus = void 0;
                    if (axios_1.default.isAxiosError(error_3) && error_3.response) {
                        httpStatus = error_3.response.status;
                    }
                    (0, index_js_1.logEvent)('tengu_binary_manifest_fetch_failure', {
                        latency_ms: latencyMs,
                        http_status: httpStatus,
                        is_timeout: errorMessage.includes('timeout'),
                    });
                    (0, log_js_1.logError)(new Error("Failed to fetch manifest from ".concat(baseUrl, "/").concat(version, "/manifest.json: ").concat(errorMessage)));
                    throw error_3;
                case 5:
                    platformInfo = manifest.platforms[platform];
                    if (!platformInfo) {
                        (0, index_js_1.logEvent)('tengu_binary_platform_not_found', {});
                        throw new Error("Platform ".concat(platform, " not found in manifest for version ").concat(version));
                    }
                    expectedChecksum = platformInfo.checksum;
                    binaryName = (0, installer_js_1.getBinaryName)(platform);
                    binaryUrl = "".concat(baseUrl, "/").concat(version, "/").concat(platform, "/").concat(binaryName);
                    // Write to staging
                    return [4 /*yield*/, fs.mkdir(stagingPath)];
                case 6:
                    // Write to staging
                    _a.sent();
                    binaryPath = (0, path_1.join)(stagingPath, binaryName);
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, downloadAndVerifyBinary(binaryUrl, expectedChecksum, binaryPath, authConfig || {})];
                case 8:
                    _a.sent();
                    latencyMs = Date.now() - startTime;
                    (0, index_js_1.logEvent)('tengu_binary_download_success', {
                        latency_ms: latencyMs,
                    });
                    return [3 /*break*/, 10];
                case 9:
                    error_4 = _a.sent();
                    latencyMs = Date.now() - startTime;
                    errorMessage = error_4 instanceof Error ? error_4.message : String(error_4);
                    httpStatus = void 0;
                    if (axios_1.default.isAxiosError(error_4) && error_4.response) {
                        httpStatus = error_4.response.status;
                    }
                    (0, index_js_1.logEvent)('tengu_binary_download_failure', {
                        latency_ms: latencyMs,
                        http_status: httpStatus,
                        is_timeout: errorMessage.includes('timeout'),
                        is_checksum_mismatch: errorMessage.includes('Checksum mismatch'),
                    });
                    (0, log_js_1.logError)(new Error("Failed to download binary from ".concat(binaryUrl, ": ").concat(errorMessage)));
                    throw error_4;
                case 10: return [2 /*return*/];
            }
        });
    });
}
function downloadVersion(version, stagingPath) {
    return __awaiter(this, void 0, void 0, function () {
        var stdout;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!((0, bun_bundle_1.feature)('ALLOW_TEST_VERSIONS') && /^99\.99\./.test(version))) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('gcloud', [
                            'auth',
                            'print-access-token',
                        ])];
                case 1:
                    stdout = (_a.sent()).stdout;
                    return [4 /*yield*/, downloadVersionFromBinaryRepo(version, stagingPath, 'https://storage.googleapis.com/claude-code-ci-sentinel', { headers: { Authorization: "Bearer ".concat(stdout.trim()) } })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, 'binary'];
                case 3:
                    if (!(process.env.USER_TYPE === 'ant')) return [3 /*break*/, 5];
                    // Use Artifactory for ant users
                    return [4 /*yield*/, downloadVersionFromArtifactory(version, stagingPath)];
                case 4:
                    // Use Artifactory for ant users
                    _a.sent();
                    return [2 /*return*/, 'npm'];
                case 5: 
                // Use GCS for external users
                return [4 /*yield*/, downloadVersionFromBinaryRepo(version, stagingPath, GCS_BUCKET_URL)];
                case 6:
                    // Use GCS for external users
                    _a.sent();
                    return [2 /*return*/, 'binary'];
            }
        });
    });
}
exports.STALL_TIMEOUT_MS = DEFAULT_STALL_TIMEOUT_MS;
exports._downloadAndVerifyBinaryForTesting = downloadAndVerifyBinary;
