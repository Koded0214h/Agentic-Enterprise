"use strict";
/**
 * Files API client for managing files
 *
 * This module provides functionality to download and upload files to Anthropic Public Files API.
 * Used by the Claude Code agent to download file attachments at session startup.
 *
 * API Reference: https://docs.anthropic.com/en/api/files-content
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
exports.downloadFile = downloadFile;
exports.buildDownloadPath = buildDownloadPath;
exports.downloadAndSaveFile = downloadAndSaveFile;
exports.downloadSessionFiles = downloadSessionFiles;
exports.uploadFile = uploadFile;
exports.uploadSessionFiles = uploadSessionFiles;
exports.listFilesCreatedAfter = listFilesCreatedAfter;
exports.parseFileSpecs = parseFileSpecs;
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var fs = require("fs/promises");
var path = require("path");
var array_js_1 = require("../../utils/array.js");
var cwd_js_1 = require("../../utils/cwd.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var sleep_js_1 = require("../../utils/sleep.js");
var index_js_1 = require("../analytics/index.js");
// Files API is currently in beta. oauth-2025-04-20 enables Bearer OAuth
// on public-api routes (auth.py: "oauth_auth" not in beta_versions → 404).
var FILES_API_BETA_HEADER = 'files-api-2025-04-14,oauth-2025-04-20';
var ANTHROPIC_VERSION = '2023-06-01';
// API base URL - uses ANTHROPIC_BASE_URL set by env-manager for the appropriate environment
// Falls back to public API for standalone usage
function getDefaultApiBaseUrl() {
    return (process.env.ANTHROPIC_BASE_URL ||
        process.env.CLAUDE_CODE_API_BASE_URL ||
        'https://api.anthropic.com');
}
function logDebugError(message) {
    (0, debug_js_1.logForDebugging)("[files-api] ".concat(message), { level: 'error' });
}
function logDebug(message) {
    (0, debug_js_1.logForDebugging)("[files-api] ".concat(message));
}
var MAX_RETRIES = 3;
var BASE_DELAY_MS = 500;
var MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB
/**
 * Executes an operation with exponential backoff retry logic
 *
 * @param operation - Operation name for logging
 * @param attemptFn - Function to execute on each attempt, returns RetryResult
 * @returns The successful result value
 * @throws Error if all retries exhausted
 */
function retryWithBackoff(operation, attemptFn) {
    return __awaiter(this, void 0, void 0, function () {
        var lastError, attempt, result, delayMs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lastError = '';
                    attempt = 1;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= MAX_RETRIES)) return [3 /*break*/, 5];
                    return [4 /*yield*/, attemptFn(attempt)];
                case 2:
                    result = _a.sent();
                    if (result.done) {
                        return [2 /*return*/, result.value];
                    }
                    lastError = result.error || "".concat(operation, " failed");
                    logDebug("".concat(operation, " attempt ").concat(attempt, "/").concat(MAX_RETRIES, " failed: ").concat(lastError));
                    if (!(attempt < MAX_RETRIES)) return [3 /*break*/, 4];
                    delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
                    logDebug("Retrying ".concat(operation, " in ").concat(delayMs, "ms..."));
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(delayMs)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    attempt++;
                    return [3 /*break*/, 1];
                case 5: throw new Error("".concat(lastError, " after ").concat(MAX_RETRIES, " attempts"));
            }
        });
    });
}
/**
 * Downloads a single file from the Anthropic Public Files API
 *
 * @param fileId - The file ID (e.g., "file_011CNha8iCJcU1wXNR6q4V8w")
 * @param config - Files API configuration
 * @returns The file content as a Buffer
 */
function downloadFile(fileId, config) {
    return __awaiter(this, void 0, void 0, function () {
        var baseUrl, url, headers;
        var _this = this;
        return __generator(this, function (_a) {
            baseUrl = config.baseUrl || getDefaultApiBaseUrl();
            url = "".concat(baseUrl, "/v1/files/").concat(fileId, "/content");
            headers = {
                Authorization: "Bearer ".concat(config.oauthToken),
                'anthropic-version': ANTHROPIC_VERSION,
                'anthropic-beta': FILES_API_BETA_HEADER,
            };
            logDebug("Downloading file ".concat(fileId, " from ").concat(url));
            return [2 /*return*/, retryWithBackoff("Download file ".concat(fileId), function () { return __awaiter(_this, void 0, void 0, function () {
                    var response, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, axios_1.default.get(url, {
                                        headers: headers,
                                        responseType: 'arraybuffer',
                                        timeout: 60000, // 60 second timeout for large files
                                        validateStatus: function (status) { return status < 500; },
                                    })];
                            case 1:
                                response = _a.sent();
                                if (response.status === 200) {
                                    logDebug("Downloaded file ".concat(fileId, " (").concat(response.data.length, " bytes)"));
                                    return [2 /*return*/, { done: true, value: Buffer.from(response.data) }];
                                }
                                // Non-retriable errors - throw immediately
                                if (response.status === 404) {
                                    throw new Error("File not found: ".concat(fileId));
                                }
                                if (response.status === 401) {
                                    throw new Error('Authentication failed: invalid or missing API key');
                                }
                                if (response.status === 403) {
                                    throw new Error("Access denied to file: ".concat(fileId));
                                }
                                return [2 /*return*/, { done: false, error: "status ".concat(response.status) }];
                            case 2:
                                error_1 = _a.sent();
                                if (!axios_1.default.isAxiosError(error_1)) {
                                    throw error_1;
                                }
                                return [2 /*return*/, { done: false, error: error_1.message }];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
/**
 * Normalizes a relative path, strips redundant prefixes, and builds the full
 * download path under {basePath}/{session_id}/uploads/.
 * Returns null if the path is invalid (e.g., path traversal).
 */
function buildDownloadPath(basePath, sessionId, relativePath) {
    var normalized = path.normalize(relativePath);
    if (normalized.startsWith('..')) {
        logDebugError("Invalid file path: ".concat(relativePath, ". Path must not traverse above workspace"));
        return null;
    }
    var uploadsBase = path.join(basePath, sessionId, 'uploads');
    var redundantPrefixes = [
        path.join(basePath, sessionId, 'uploads') + path.sep,
        path.sep + 'uploads' + path.sep,
    ];
    var matchedPrefix = redundantPrefixes.find(function (p) { return normalized.startsWith(p); });
    var cleanPath = matchedPrefix
        ? normalized.slice(matchedPrefix.length)
        : normalized;
    return path.join(uploadsBase, cleanPath);
}
/**
 * Downloads a file and saves it to the session-specific workspace directory
 *
 * @param attachment - The file attachment to download
 * @param config - Files API configuration
 * @returns Download result with success/failure status
 */
function downloadAndSaveFile(attachment, config) {
    return __awaiter(this, void 0, void 0, function () {
        var fileId, relativePath, fullPath, content, parentDir, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fileId = attachment.fileId, relativePath = attachment.relativePath;
                    fullPath = buildDownloadPath((0, cwd_js_1.getCwd)(), config.sessionId, relativePath);
                    if (!fullPath) {
                        return [2 /*return*/, {
                                fileId: fileId,
                                path: '',
                                success: false,
                                error: "Invalid file path: ".concat(relativePath),
                            }];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, downloadFile(fileId, config)
                        // Ensure the parent directory exists
                    ];
                case 2:
                    content = _a.sent();
                    parentDir = path.dirname(fullPath);
                    return [4 /*yield*/, fs.mkdir(parentDir, { recursive: true })
                        // Write the file
                    ];
                case 3:
                    _a.sent();
                    // Write the file
                    return [4 /*yield*/, fs.writeFile(fullPath, content)];
                case 4:
                    // Write the file
                    _a.sent();
                    logDebug("Saved file ".concat(fileId, " to ").concat(fullPath, " (").concat(content.length, " bytes)"));
                    return [2 /*return*/, {
                            fileId: fileId,
                            path: fullPath,
                            success: true,
                            bytesWritten: content.length,
                        }];
                case 5:
                    error_2 = _a.sent();
                    logDebugError("Failed to download file ".concat(fileId, ": ").concat((0, errors_js_1.errorMessage)(error_2)));
                    if (error_2 instanceof Error) {
                        (0, log_js_1.logError)(error_2);
                    }
                    return [2 /*return*/, {
                            fileId: fileId,
                            path: fullPath,
                            success: false,
                            error: (0, errors_js_1.errorMessage)(error_2),
                        }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Default concurrency limit for parallel downloads
var DEFAULT_CONCURRENCY = 5;
/**
 * Execute promises with limited concurrency
 *
 * @param items - Items to process
 * @param fn - Async function to apply to each item
 * @param concurrency - Maximum concurrent operations
 * @returns Results in the same order as input items
 */
function parallelWithLimit(items, fn, concurrency) {
    return __awaiter(this, void 0, void 0, function () {
        function worker() {
            return __awaiter(this, void 0, void 0, function () {
                var index, item, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!(currentIndex < items.length)) return [3 /*break*/, 3];
                            index = currentIndex++;
                            item = items[index];
                            if (!(item !== undefined)) return [3 /*break*/, 2];
                            _a = results;
                            _b = index;
                            return [4 /*yield*/, fn(item, index)];
                        case 1:
                            _a[_b] = _c.sent();
                            _c.label = 2;
                        case 2: return [3 /*break*/, 0];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        var results, currentIndex, workers, workerCount, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    results = new Array(items.length);
                    currentIndex = 0;
                    workers = [];
                    workerCount = Math.min(concurrency, items.length);
                    for (i = 0; i < workerCount; i++) {
                        workers.push(worker());
                    }
                    return [4 /*yield*/, Promise.all(workers)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, results];
            }
        });
    });
}
/**
 * Downloads all file attachments for a session in parallel
 *
 * @param attachments - List of file attachments to download
 * @param config - Files API configuration
 * @param concurrency - Maximum concurrent downloads (default: 5)
 * @returns Array of download results in the same order as input
 */
function downloadSessionFiles(files_1, config_1) {
    return __awaiter(this, arguments, void 0, function (files, config, concurrency) {
        var startTime, results, elapsedMs, successCount;
        if (concurrency === void 0) { concurrency = DEFAULT_CONCURRENCY; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (files.length === 0) {
                        return [2 /*return*/, []];
                    }
                    logDebug("Downloading ".concat(files.length, " file(s) for session ").concat(config.sessionId));
                    startTime = Date.now();
                    return [4 /*yield*/, parallelWithLimit(files, function (file) { return downloadAndSaveFile(file, config); }, concurrency)];
                case 1:
                    results = _a.sent();
                    elapsedMs = Date.now() - startTime;
                    successCount = (0, array_js_1.count)(results, function (r) { return r.success; });
                    logDebug("Downloaded ".concat(successCount, "/").concat(files.length, " file(s) in ").concat(elapsedMs, "ms"));
                    return [2 /*return*/, results];
            }
        });
    });
}
/**
 * Upload a single file to the Files API (BYOC mode)
 *
 * Size validation is performed after reading the file to avoid TOCTOU race
 * conditions where the file size could change between initial check and upload.
 *
 * @param filePath - Absolute path to the file to upload
 * @param relativePath - Relative path for the file (used as filename in API)
 * @param config - Files API configuration
 * @returns Upload result with success/failure status
 */
function uploadFile(filePath, relativePath, config, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var baseUrl, url, headers, content, error_3, fileSize, boundary, filename, bodyParts, body, error_4;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    baseUrl = config.baseUrl || getDefaultApiBaseUrl();
                    url = "".concat(baseUrl, "/v1/files");
                    headers = {
                        Authorization: "Bearer ".concat(config.oauthToken),
                        'anthropic-version': ANTHROPIC_VERSION,
                        'anthropic-beta': FILES_API_BETA_HEADER,
                    };
                    logDebug("Uploading file ".concat(filePath, " as ").concat(relativePath));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(filePath)];
                case 2:
                    content = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    (0, index_js_1.logEvent)('tengu_file_upload_failed', {
                        error_type: 'file_read',
                    });
                    return [2 /*return*/, {
                            path: relativePath,
                            error: (0, errors_js_1.errorMessage)(error_3),
                            success: false,
                        }];
                case 4:
                    fileSize = content.length;
                    if (fileSize > MAX_FILE_SIZE_BYTES) {
                        (0, index_js_1.logEvent)('tengu_file_upload_failed', {
                            error_type: 'file_too_large',
                        });
                        return [2 /*return*/, {
                                path: relativePath,
                                error: "File exceeds maximum size of ".concat(MAX_FILE_SIZE_BYTES, " bytes (actual: ").concat(fileSize, ")"),
                                success: false,
                            }];
                    }
                    boundary = "----FormBoundary".concat((0, crypto_1.randomUUID)());
                    filename = path.basename(relativePath);
                    bodyParts = [];
                    // File part
                    bodyParts.push(Buffer.from("--".concat(boundary, "\r\n") +
                        "Content-Disposition: form-data; name=\"file\"; filename=\"".concat(filename, "\"\r\n") +
                        "Content-Type: application/octet-stream\r\n\r\n"));
                    bodyParts.push(content);
                    bodyParts.push(Buffer.from('\r\n'));
                    // Purpose part
                    bodyParts.push(Buffer.from("--".concat(boundary, "\r\n") +
                        "Content-Disposition: form-data; name=\"purpose\"\r\n\r\n" +
                        "user_data\r\n"));
                    // End boundary
                    bodyParts.push(Buffer.from("--".concat(boundary, "--\r\n")));
                    body = Buffer.concat(bodyParts);
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, retryWithBackoff("Upload file ".concat(relativePath), function () { return __awaiter(_this, void 0, void 0, function () {
                            var response, fileId, error_5;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, axios_1.default.post(url, body, {
                                                headers: __assign(__assign({}, headers), { 'Content-Type': "multipart/form-data; boundary=".concat(boundary), 'Content-Length': body.length.toString() }),
                                                timeout: 120000, // 2 minute timeout for uploads
                                                signal: opts === null || opts === void 0 ? void 0 : opts.signal,
                                                validateStatus: function (status) { return status < 500; },
                                            })];
                                    case 1:
                                        response = _b.sent();
                                        if (response.status === 200 || response.status === 201) {
                                            fileId = (_a = response.data) === null || _a === void 0 ? void 0 : _a.id;
                                            if (!fileId) {
                                                return [2 /*return*/, {
                                                        done: false,
                                                        error: 'Upload succeeded but no file ID returned',
                                                    }];
                                            }
                                            logDebug("Uploaded file ".concat(filePath, " -> ").concat(fileId, " (").concat(fileSize, " bytes)"));
                                            return [2 /*return*/, {
                                                    done: true,
                                                    value: {
                                                        path: relativePath,
                                                        fileId: fileId,
                                                        size: fileSize,
                                                        success: true,
                                                    },
                                                }];
                                        }
                                        // Non-retriable errors - throw to exit retry loop
                                        if (response.status === 401) {
                                            (0, index_js_1.logEvent)('tengu_file_upload_failed', {
                                                error_type: 'auth',
                                            });
                                            throw new UploadNonRetriableError('Authentication failed: invalid or missing API key');
                                        }
                                        if (response.status === 403) {
                                            (0, index_js_1.logEvent)('tengu_file_upload_failed', {
                                                error_type: 'forbidden',
                                            });
                                            throw new UploadNonRetriableError('Access denied for upload');
                                        }
                                        if (response.status === 413) {
                                            (0, index_js_1.logEvent)('tengu_file_upload_failed', {
                                                error_type: 'size',
                                            });
                                            throw new UploadNonRetriableError('File too large for upload');
                                        }
                                        return [2 /*return*/, { done: false, error: "status ".concat(response.status) }];
                                    case 2:
                                        error_5 = _b.sent();
                                        // Non-retriable errors propagate up
                                        if (error_5 instanceof UploadNonRetriableError) {
                                            throw error_5;
                                        }
                                        if (axios_1.default.isCancel(error_5)) {
                                            throw new UploadNonRetriableError('Upload canceled');
                                        }
                                        // Network errors are retriable
                                        if (axios_1.default.isAxiosError(error_5)) {
                                            return [2 /*return*/, { done: false, error: error_5.message }];
                                        }
                                        throw error_5;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 6: return [2 /*return*/, _a.sent()];
                case 7:
                    error_4 = _a.sent();
                    if (error_4 instanceof UploadNonRetriableError) {
                        return [2 /*return*/, {
                                path: relativePath,
                                error: error_4.message,
                                success: false,
                            }];
                    }
                    (0, index_js_1.logEvent)('tengu_file_upload_failed', {
                        error_type: 'network',
                    });
                    return [2 /*return*/, {
                            path: relativePath,
                            error: (0, errors_js_1.errorMessage)(error_4),
                            success: false,
                        }];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/** Error class for non-retriable upload failures */
var UploadNonRetriableError = /** @class */ (function (_super) {
    __extends(UploadNonRetriableError, _super);
    function UploadNonRetriableError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'UploadNonRetriableError';
        return _this;
    }
    return UploadNonRetriableError;
}(Error));
/**
 * Upload multiple files in parallel with concurrency limit (BYOC mode)
 *
 * @param files - Array of files to upload (path and relativePath)
 * @param config - Files API configuration
 * @param concurrency - Maximum concurrent uploads (default: 5)
 * @returns Array of upload results in the same order as input
 */
function uploadSessionFiles(files_1, config_1) {
    return __awaiter(this, arguments, void 0, function (files, config, concurrency) {
        var startTime, results, elapsedMs, successCount;
        if (concurrency === void 0) { concurrency = DEFAULT_CONCURRENCY; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (files.length === 0) {
                        return [2 /*return*/, []];
                    }
                    logDebug("Uploading ".concat(files.length, " file(s) for session ").concat(config.sessionId));
                    startTime = Date.now();
                    return [4 /*yield*/, parallelWithLimit(files, function (file) { return uploadFile(file.path, file.relativePath, config); }, concurrency)];
                case 1:
                    results = _a.sent();
                    elapsedMs = Date.now() - startTime;
                    successCount = (0, array_js_1.count)(results, function (r) { return r.success; });
                    logDebug("Uploaded ".concat(successCount, "/").concat(files.length, " file(s) in ").concat(elapsedMs, "ms"));
                    return [2 /*return*/, results];
            }
        });
    });
}
/**
 * List files created after a given timestamp (1P/Cloud mode).
 * Uses the public GET /v1/files endpoint with after_created_at query param.
 * Handles pagination via after_id cursor when has_more is true.
 *
 * @param afterCreatedAt - ISO 8601 timestamp to filter files created after
 * @param config - Files API configuration
 * @returns Array of file metadata for files created after the timestamp
 */
function listFilesCreatedAfter(afterCreatedAt, config) {
    return __awaiter(this, void 0, void 0, function () {
        var baseUrl, headers, allFiles, afterId, _loop_1, state_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    baseUrl = config.baseUrl || getDefaultApiBaseUrl();
                    headers = {
                        Authorization: "Bearer ".concat(config.oauthToken),
                        'anthropic-version': ANTHROPIC_VERSION,
                        'anthropic-beta': FILES_API_BETA_HEADER,
                    };
                    logDebug("Listing files created after ".concat(afterCreatedAt));
                    allFiles = [];
                    _loop_1 = function () {
                        var params, page, files, _i, files_1, f, lastFile;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    params = {
                                        after_created_at: afterCreatedAt,
                                    };
                                    if (afterId) {
                                        params.after_id = afterId;
                                    }
                                    return [4 /*yield*/, retryWithBackoff("List files after ".concat(afterCreatedAt), function () { return __awaiter(_this, void 0, void 0, function () {
                                            var response, error_6;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 2, , 3]);
                                                        return [4 /*yield*/, axios_1.default.get("".concat(baseUrl, "/v1/files"), {
                                                                headers: headers,
                                                                params: params,
                                                                timeout: 60000,
                                                                validateStatus: function (status) { return status < 500; },
                                                            })];
                                                    case 1:
                                                        response = _a.sent();
                                                        if (response.status === 200) {
                                                            return [2 /*return*/, { done: true, value: response.data }];
                                                        }
                                                        if (response.status === 401) {
                                                            (0, index_js_1.logEvent)('tengu_file_list_failed', {
                                                                error_type: 'auth',
                                                            });
                                                            throw new Error('Authentication failed: invalid or missing API key');
                                                        }
                                                        if (response.status === 403) {
                                                            (0, index_js_1.logEvent)('tengu_file_list_failed', {
                                                                error_type: 'forbidden',
                                                            });
                                                            throw new Error('Access denied to list files');
                                                        }
                                                        return [2 /*return*/, { done: false, error: "status ".concat(response.status) }];
                                                    case 2:
                                                        error_6 = _a.sent();
                                                        if (!axios_1.default.isAxiosError(error_6)) {
                                                            throw error_6;
                                                        }
                                                        (0, index_js_1.logEvent)('tengu_file_list_failed', {
                                                            error_type: 'network',
                                                        });
                                                        return [2 /*return*/, { done: false, error: error_6.message }];
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        }); })];
                                case 1:
                                    page = _b.sent();
                                    files = page.data || [];
                                    for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                                        f = files_1[_i];
                                        allFiles.push({
                                            filename: f.filename,
                                            fileId: f.id,
                                            size: f.size_bytes,
                                        });
                                    }
                                    if (!page.has_more) {
                                        return [2 /*return*/, "break"];
                                    }
                                    lastFile = files.at(-1);
                                    if (!(lastFile === null || lastFile === void 0 ? void 0 : lastFile.id)) {
                                        return [2 /*return*/, "break"];
                                    }
                                    afterId = lastFile.id;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    return [5 /*yield**/, _loop_1()];
                case 2:
                    state_1 = _a.sent();
                    if (state_1 === "break")
                        return [3 /*break*/, 3];
                    return [3 /*break*/, 1];
                case 3:
                    logDebug("Listed ".concat(allFiles.length, " files created after ").concat(afterCreatedAt));
                    return [2 /*return*/, allFiles];
            }
        });
    });
}
// ============================================================================
// Parse Functions
// ============================================================================
/**
 * Parse file attachment specs from CLI arguments
 * Format: <file_id>:<relative_path>
 *
 * @param fileSpecs - Array of file spec strings
 * @returns Parsed file attachments
 */
function parseFileSpecs(fileSpecs) {
    var files = [];
    // Sandbox-gateway may pass multiple specs as a single space-separated string
    var expandedSpecs = fileSpecs.flatMap(function (s) { return s.split(' ').filter(Boolean); });
    for (var _i = 0, expandedSpecs_1 = expandedSpecs; _i < expandedSpecs_1.length; _i++) {
        var spec = expandedSpecs_1[_i];
        var colonIndex = spec.indexOf(':');
        if (colonIndex === -1) {
            continue;
        }
        var fileId = spec.substring(0, colonIndex);
        var relativePath = spec.substring(colonIndex + 1);
        if (!fileId || !relativePath) {
            logDebugError("Invalid file spec: ".concat(spec, ". Both file_id and path are required"));
            continue;
        }
        files.push({ fileId: fileId, relativePath: relativePath });
    }
    return files;
}
