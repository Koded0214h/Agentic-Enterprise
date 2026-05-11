"use strict";
/**
 * File persistence orchestrator
 *
 * This module provides the main orchestration logic for persisting files
 * at the end of each turn:
 * - BYOC mode: Upload files to Files API and collect file IDs
 * - 1P/Cloud mode: Query Files API listDirectory for file IDs (rclone handles sync)
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
exports.runFilePersistence = runFilePersistence;
exports.executeFilePersistence = executeFilePersistence;
exports.isFilePersistenceEnabled = isFilePersistenceEnabled;
var bun_bundle_1 = require("bun:bundle");
var path_1 = require("path");
var index_js_1 = require("../../services/analytics/index.js");
var filesApi_js_1 = require("../../services/api/filesApi.js");
var cwd_js_1 = require("../cwd.js");
var errors_js_1 = require("../errors.js");
var log_js_1 = require("../log.js");
var sessionIngressAuth_js_1 = require("../sessionIngressAuth.js");
var outputsScanner_js_1 = require("./outputsScanner.js");
var types_js_1 = require("./types.js");
/**
 * Execute file persistence for modified files in the outputs directory.
 *
 * Assembles all config internally:
 * - Checks environment kind (CLAUDE_CODE_ENVIRONMENT_KIND)
 * - Retrieves session access token
 * - Requires CLAUDE_CODE_REMOTE_SESSION_ID for session ID
 *
 * @param turnStartTime - The timestamp when the turn started
 * @param signal - Optional abort signal for cancellation
 * @returns Event data, or null if not enabled or no files to persist
 */
function runFilePersistence(turnStartTime, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var environmentKind, sessionAccessToken, sessionId, config, outputsDir, startTime, result, durationMs, error_1, durationMs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    environmentKind = (0, outputsScanner_js_1.getEnvironmentKind)();
                    if (environmentKind !== 'byoc') {
                        return [2 /*return*/, null];
                    }
                    sessionAccessToken = (0, sessionIngressAuth_js_1.getSessionIngressAuthToken)();
                    if (!sessionAccessToken) {
                        return [2 /*return*/, null];
                    }
                    sessionId = process.env.CLAUDE_CODE_REMOTE_SESSION_ID;
                    if (!sessionId) {
                        (0, log_js_1.logError)(new Error('File persistence enabled but CLAUDE_CODE_REMOTE_SESSION_ID is not set'));
                        return [2 /*return*/, null];
                    }
                    config = {
                        oauthToken: sessionAccessToken,
                        sessionId: sessionId,
                    };
                    outputsDir = (0, path_1.join)((0, cwd_js_1.getCwd)(), sessionId, types_js_1.OUTPUTS_SUBDIR);
                    // Check if aborted
                    if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                        (0, outputsScanner_js_1.logDebug)('Persistence aborted before processing');
                        return [2 /*return*/, null];
                    }
                    startTime = Date.now();
                    (0, index_js_1.logEvent)('tengu_file_persistence_started', {
                        mode: environmentKind,
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    result = void 0;
                    if (!(environmentKind === 'byoc')) return [3 /*break*/, 3];
                    return [4 /*yield*/, executeBYOCPersistence(turnStartTime, config, outputsDir, signal)];
                case 2:
                    result = _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, executeCloudPersistence()];
                case 4:
                    result = _a.sent();
                    _a.label = 5;
                case 5:
                    // Nothing to report
                    if (result.files.length === 0 && result.failed.length === 0) {
                        return [2 /*return*/, null];
                    }
                    durationMs = Date.now() - startTime;
                    (0, index_js_1.logEvent)('tengu_file_persistence_completed', {
                        success_count: result.files.length,
                        failure_count: result.failed.length,
                        duration_ms: durationMs,
                        mode: environmentKind,
                    });
                    return [2 /*return*/, result];
                case 6:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    (0, outputsScanner_js_1.logDebug)("File persistence failed: ".concat(error_1));
                    durationMs = Date.now() - startTime;
                    (0, index_js_1.logEvent)('tengu_file_persistence_completed', {
                        success_count: 0,
                        failure_count: 0,
                        duration_ms: durationMs,
                        mode: environmentKind,
                        error: 'exception',
                    });
                    return [2 /*return*/, {
                            files: [],
                            failed: [
                                {
                                    filename: outputsDir,
                                    error: (0, errors_js_1.errorMessage)(error_1),
                                },
                            ],
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute BYOC mode persistence: scan local filesystem for modified files,
 * then upload to Files API.
 */
function executeBYOCPersistence(turnStartTime, config, outputsDir, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var modifiedFiles, filesToProcess, results, persistedFiles, failedFiles, _i, results_1, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, outputsScanner_js_1.findModifiedFiles)(turnStartTime, outputsDir)];
                case 1:
                    modifiedFiles = _a.sent();
                    if (modifiedFiles.length === 0) {
                        (0, outputsScanner_js_1.logDebug)('No modified files to persist');
                        return [2 /*return*/, { files: [], failed: [] }];
                    }
                    (0, outputsScanner_js_1.logDebug)("Found ".concat(modifiedFiles.length, " modified files"));
                    if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                        return [2 /*return*/, { files: [], failed: [] }];
                    }
                    // Enforce file count limit
                    if (modifiedFiles.length > types_js_1.FILE_COUNT_LIMIT) {
                        (0, outputsScanner_js_1.logDebug)("File count limit exceeded: ".concat(modifiedFiles.length, " > ").concat(types_js_1.FILE_COUNT_LIMIT));
                        (0, index_js_1.logEvent)('tengu_file_persistence_limit_exceeded', {
                            file_count: modifiedFiles.length,
                            limit: types_js_1.FILE_COUNT_LIMIT,
                        });
                        return [2 /*return*/, {
                                files: [],
                                failed: [
                                    {
                                        filename: outputsDir,
                                        error: "Too many files modified (".concat(modifiedFiles.length, "). Maximum: ").concat(types_js_1.FILE_COUNT_LIMIT, "."),
                                    },
                                ],
                            }];
                    }
                    filesToProcess = modifiedFiles
                        .map(function (filePath) { return ({
                        path: filePath,
                        relativePath: (0, path_1.relative)(outputsDir, filePath),
                    }); })
                        .filter(function (_a) {
                        var relativePath = _a.relativePath;
                        // Security: skip files that resolve outside the outputs directory
                        if (relativePath.startsWith('..')) {
                            (0, outputsScanner_js_1.logDebug)("Skipping file outside outputs directory: ".concat(relativePath));
                            return false;
                        }
                        return true;
                    });
                    (0, outputsScanner_js_1.logDebug)("BYOC mode: uploading ".concat(filesToProcess.length, " files"));
                    return [4 /*yield*/, (0, filesApi_js_1.uploadSessionFiles)(filesToProcess, config, types_js_1.DEFAULT_UPLOAD_CONCURRENCY)
                        // Separate successful and failed uploads
                    ];
                case 2:
                    results = _a.sent();
                    persistedFiles = [];
                    failedFiles = [];
                    for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                        result = results_1[_i];
                        if (result.success) {
                            persistedFiles.push({
                                filename: result.path,
                                file_id: result.fileId,
                            });
                        }
                        else {
                            failedFiles.push({
                                filename: result.path,
                                error: result.error,
                            });
                        }
                    }
                    (0, outputsScanner_js_1.logDebug)("BYOC persistence complete: ".concat(persistedFiles.length, " uploaded, ").concat(failedFiles.length, " failed"));
                    return [2 /*return*/, {
                            files: persistedFiles,
                            failed: failedFiles,
                        }];
            }
        });
    });
}
/**
 * Execute Cloud (1P) mode persistence.
 * TODO: Read file_id from xattr on output files. xattr-based file IDs are
 * currently being added for 1P environments.
 */
function executeCloudPersistence() {
    (0, outputsScanner_js_1.logDebug)('Cloud mode: xattr-based file ID reading not yet implemented');
    return { files: [], failed: [] };
}
/**
 * Execute file persistence and emit result via callback.
 * Handles errors internally.
 */
function executeFilePersistence(turnStartTime, signal, onResult) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, runFilePersistence(turnStartTime, signal)];
                case 1:
                    result = _a.sent();
                    if (result) {
                        onResult(result);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    (0, log_js_1.logError)(error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if file persistence is enabled.
 * Requires: feature flag ON, valid environment kind, session access token,
 * and CLAUDE_CODE_REMOTE_SESSION_ID.
 * This ensures only public-api/sessions users trigger file persistence,
 * not normal Claude Code CLI users.
 */
function isFilePersistenceEnabled() {
    if ((0, bun_bundle_1.feature)('FILE_PERSISTENCE')) {
        return ((0, outputsScanner_js_1.getEnvironmentKind)() === 'byoc' &&
            !!(0, sessionIngressAuth_js_1.getSessionIngressAuthToken)() &&
            !!process.env.CLAUDE_CODE_REMOTE_SESSION_ID);
    }
    return false;
}
