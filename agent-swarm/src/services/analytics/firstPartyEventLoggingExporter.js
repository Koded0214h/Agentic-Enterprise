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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirstPartyEventLoggingExporter = void 0;
var core_1 = require("@opentelemetry/core");
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var claude_code_internal_event_js_1 = require("../../types/generated/events_mono/claude_code/v1/claude_code_internal_event.js");
var growthbook_experiment_event_js_1 = require("../../types/generated/events_mono/growthbook/v1/growthbook_experiment_event.js");
var auth_js_1 = require("../../utils/auth.js");
var config_js_1 = require("../../utils/config.js");
var debug_js_1 = require("../../utils/debug.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var http_js_1 = require("../../utils/http.js");
var json_js_1 = require("../../utils/json.js");
var log_js_1 = require("../../utils/log.js");
var sleep_js_1 = require("../../utils/sleep.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var userAgent_js_1 = require("../../utils/userAgent.js");
var client_js_1 = require("../oauth/client.js");
var index_js_1 = require("./index.js");
var metadata_js_1 = require("./metadata.js");
// Unique ID for this process run - used to isolate failed event files between runs
var BATCH_UUID = (0, crypto_1.randomUUID)();
// File prefix for failed event storage
var FILE_PREFIX = '1p_failed_events.';
// Storage directory for failed events - evaluated at runtime to respect CLAUDE_CONFIG_DIR in tests
function getStorageDir() {
    return path.join((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'telemetry');
}
/**
 * Exporter for 1st-party event logging to /api/event_logging/batch.
 *
 * Export cycles are controlled by OpenTelemetry's BatchLogRecordProcessor, which
 * triggers export() when either:
 * - Time interval elapses (default: 5 seconds via scheduledDelayMillis)
 * - Batch size is reached (default: 200 events via maxExportBatchSize)
 *
 * This exporter adds resilience on top:
 * - Append-only log for failed events (concurrency-safe)
 * - Quadratic backoff retry for failed events, dropped after maxAttempts
 * - Immediate retry of queued events when any export succeeds (endpoint is healthy)
 * - Chunking large event sets into smaller batches
 * - Auth fallback: retries without auth on 401 errors
 */
var FirstPartyEventLoggingExporter = /** @class */ (function () {
    function FirstPartyEventLoggingExporter(options) {
        if (options === void 0) { options = {}; }
        var _a, _b, _c, _d;
        this.pendingExports = [];
        this.isShutdown = false;
        this.cancelBackoff = null;
        this.attempts = 0;
        this.isRetrying = false;
        // Default: prod, except when ANTHROPIC_BASE_URL is explicitly staging.
        // Overridable via tengu_1p_event_batch_config.baseUrl.
        var baseUrl = options.baseUrl ||
            (process.env.ANTHROPIC_BASE_URL === 'https://api-staging.anthropic.com'
                ? 'https://api-staging.anthropic.com'
                : 'https://api.anthropic.com');
        this.endpoint = "".concat(baseUrl).concat(options.path || '/api/event_logging/batch');
        this.timeout = options.timeout || 10000;
        this.maxBatchSize = options.maxBatchSize || 200;
        this.skipAuth = (_a = options.skipAuth) !== null && _a !== void 0 ? _a : false;
        this.batchDelayMs = options.batchDelayMs || 100;
        this.baseBackoffDelayMs = options.baseBackoffDelayMs || 500;
        this.maxBackoffDelayMs = options.maxBackoffDelayMs || 30000;
        this.maxAttempts = (_b = options.maxAttempts) !== null && _b !== void 0 ? _b : 8;
        this.isKilled = (_c = options.isKilled) !== null && _c !== void 0 ? _c : (function () { return false; });
        this.schedule =
            (_d = options.schedule) !== null && _d !== void 0 ? _d : (function (fn, ms) {
                var t = setTimeout(fn, ms);
                return function () { return clearTimeout(t); };
            });
        // Retry any failed events from previous runs of this session (in background)
        void this.retryPreviousBatches();
    }
    // Expose for testing
    FirstPartyEventLoggingExporter.prototype.getQueuedEventCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadEventsFromCurrentBatch()];
                    case 1: return [2 /*return*/, (_a.sent()).length];
                }
            });
        });
    };
    // --- Storage helpers ---
    FirstPartyEventLoggingExporter.prototype.getCurrentBatchFilePath = function () {
        return path.join(getStorageDir(), "".concat(FILE_PREFIX).concat((0, state_js_1.getSessionId)(), ".").concat(BATCH_UUID, ".json"));
    };
    FirstPartyEventLoggingExporter.prototype.loadEventsFromFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, json_js_1.readJSONLFile)(filePath)];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FirstPartyEventLoggingExporter.prototype.loadEventsFromCurrentBatch = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.loadEventsFromFile(this.getCurrentBatchFilePath())];
            });
        });
    };
    FirstPartyEventLoggingExporter.prototype.saveEventsToFile = function (filePath, events) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, content, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        if (!(events.length === 0)) return [3 /*break*/, 5];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, promises_1.unlink)(filePath)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 8];
                    case 5: 
                    // Ensure storage directory exists
                    return [4 /*yield*/, (0, promises_1.mkdir)(getStorageDir(), { recursive: true })
                        // Write as JSON lines (one event per line)
                    ];
                    case 6:
                        // Ensure storage directory exists
                        _b.sent();
                        content = events.map(function (e) { return (0, slowOperations_js_1.jsonStringify)(e); }).join('\n') + '\n';
                        return [4 /*yield*/, (0, promises_1.writeFile)(filePath, content, 'utf8')];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_1 = _b.sent();
                        (0, log_js_1.logError)(error_1);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    FirstPartyEventLoggingExporter.prototype.appendEventsToFile = function (filePath, events) {
        return __awaiter(this, void 0, void 0, function () {
            var content, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (events.length === 0)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        // Ensure storage directory exists
                        return [4 /*yield*/, (0, promises_1.mkdir)(getStorageDir(), { recursive: true })
                            // Append as JSON lines (one event per line) - atomic on most filesystems
                        ];
                    case 2:
                        // Ensure storage directory exists
                        _a.sent();
                        content = events.map(function (e) { return (0, slowOperations_js_1.jsonStringify)(e); }).join('\n') + '\n';
                        return [4 /*yield*/, (0, promises_1.appendFile)(filePath, content, 'utf8')];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        (0, log_js_1.logError)(error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    FirstPartyEventLoggingExporter.prototype.deleteFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, promises_1.unlink)(filePath)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // --- Previous batch retry (startup) ---
    FirstPartyEventLoggingExporter.prototype.retryPreviousBatches = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prefix_1, files, e_1, _i, files_1, file, filePath, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        prefix_1 = "".concat(FILE_PREFIX).concat((0, state_js_1.getSessionId)(), ".");
                        files = void 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, promises_1.readdir)(getStorageDir())];
                    case 2:
                        files = (_a.sent())
                            .filter(function (f) { return f.startsWith(prefix_1) && f.endsWith('.json'); })
                            .filter(function (f) { return !f.includes(BATCH_UUID); }); // Exclude current batch
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        if ((0, errors_js_1.isFsInaccessible)(e_1))
                            return [2 /*return*/];
                        throw e_1;
                    case 4:
                        for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                            file = files_1[_i];
                            filePath = path.join(getStorageDir(), file);
                            void this.retryFileInBackground(filePath);
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        (0, log_js_1.logError)(error_3);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    FirstPartyEventLoggingExporter.prototype.retryFileInBackground = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var events, failedEvents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.attempts >= this.maxAttempts)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.deleteFile(filePath)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, this.loadEventsFromFile(filePath)];
                    case 3:
                        events = _a.sent();
                        if (!(events.length === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.deleteFile(filePath)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                    case 5:
                        if (process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)("1P event logging: retrying ".concat(events.length, " events from previous batch"));
                        }
                        return [4 /*yield*/, this.sendEventsInBatches(events)];
                    case 6:
                        failedEvents = _a.sent();
                        if (!(failedEvents.length === 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.deleteFile(filePath)];
                    case 7:
                        _a.sent();
                        if (process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)('1P event logging: previous batch retry succeeded');
                        }
                        return [3 /*break*/, 10];
                    case 8: 
                    // Save only the failed events back (not all original events)
                    return [4 /*yield*/, this.saveEventsToFile(filePath, failedEvents)];
                    case 9:
                        // Save only the failed events back (not all original events)
                        _a.sent();
                        if (process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)("1P event logging: previous batch retry failed, ".concat(failedEvents.length, " events remain"));
                        }
                        _a.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    FirstPartyEventLoggingExporter.prototype.export = function (logs, resultCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var exportPromise;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.isShutdown) {
                    if (process.env.USER_TYPE === 'ant') {
                        (0, debug_js_1.logForDebugging)('1P event logging export failed: Exporter has been shutdown');
                    }
                    resultCallback({
                        code: core_1.ExportResultCode.FAILED,
                        error: new Error('Exporter has been shutdown'),
                    });
                    return [2 /*return*/];
                }
                exportPromise = this.doExport(logs, resultCallback);
                this.pendingExports.push(exportPromise);
                // Clean up completed exports
                void exportPromise.finally(function () {
                    var index = _this.pendingExports.indexOf(exportPromise);
                    if (index > -1) {
                        void _this.pendingExports.splice(index, 1);
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    FirstPartyEventLoggingExporter.prototype.doExport = function (logs, resultCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var eventLogs, events, failedEvents, context, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        eventLogs = logs.filter(function (log) { var _a; return ((_a = log.instrumentationScope) === null || _a === void 0 ? void 0 : _a.name) === 'com.anthropic.claude_code.events'; });
                        if (eventLogs.length === 0) {
                            resultCallback({ code: core_1.ExportResultCode.SUCCESS });
                            return [2 /*return*/];
                        }
                        events = this.transformLogsToEvents(eventLogs).events;
                        if (events.length === 0) {
                            resultCallback({ code: core_1.ExportResultCode.SUCCESS });
                            return [2 /*return*/];
                        }
                        if (this.attempts >= this.maxAttempts) {
                            resultCallback({
                                code: core_1.ExportResultCode.FAILED,
                                error: new Error("Dropped ".concat(events.length, " events: max attempts (").concat(this.maxAttempts, ") reached")),
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.sendEventsInBatches(events)];
                    case 1:
                        failedEvents = _a.sent();
                        this.attempts++;
                        if (!(failedEvents.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.queueFailedEvents(failedEvents)];
                    case 2:
                        _a.sent();
                        this.scheduleBackoffRetry();
                        context = this.lastExportErrorContext
                            ? " (".concat(this.lastExportErrorContext, ")")
                            : '';
                        resultCallback({
                            code: core_1.ExportResultCode.FAILED,
                            error: new Error("Failed to export ".concat(failedEvents.length, " events").concat(context)),
                        });
                        return [2 /*return*/];
                    case 3:
                        // Success - reset backoff and immediately retry any queued events
                        this.resetBackoff();
                        return [4 /*yield*/, this.getQueuedEventCount()];
                    case 4:
                        if ((_a.sent()) > 0 && !this.isRetrying) {
                            void this.retryFailedEvents();
                        }
                        resultCallback({ code: core_1.ExportResultCode.SUCCESS });
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        if (process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)("1P event logging export failed: ".concat((0, errors_js_1.errorMessage)(error_4)));
                        }
                        (0, log_js_1.logError)(error_4);
                        resultCallback({
                            code: core_1.ExportResultCode.FAILED,
                            error: (0, errors_js_1.toError)(error_4),
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    FirstPartyEventLoggingExporter.prototype.sendEventsInBatches = function (events) {
        return __awaiter(this, void 0, void 0, function () {
            var batches, i, failedBatchEvents, lastErrorContext, i, batch, error_5, j, skipped;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batches = [];
                        for (i = 0; i < events.length; i += this.maxBatchSize) {
                            batches.push(events.slice(i, i + this.maxBatchSize));
                        }
                        if (process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)("1P event logging: exporting ".concat(events.length, " events in ").concat(batches.length, " batch(es)"));
                        }
                        failedBatchEvents = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < batches.length)) return [3 /*break*/, 8];
                        batch = batches[i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.sendBatchWithRetry({ events: batch })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        lastErrorContext = getAxiosErrorContext(error_5);
                        for (j = i; j < batches.length; j++) {
                            failedBatchEvents.push.apply(failedBatchEvents, batches[j]);
                        }
                        if (process.env.USER_TYPE === 'ant') {
                            skipped = batches.length - 1 - i;
                            (0, debug_js_1.logForDebugging)("1P event logging: batch ".concat(i + 1, "/").concat(batches.length, " failed (").concat(lastErrorContext, "); short-circuiting ").concat(skipped, " remaining batch(es)"));
                        }
                        return [3 /*break*/, 8];
                    case 5:
                        if (!(i < batches.length - 1 && this.batchDelayMs > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, sleep_js_1.sleep)(this.batchDelayMs)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 1];
                    case 8:
                        if (failedBatchEvents.length > 0 && lastErrorContext) {
                            this.lastExportErrorContext = lastErrorContext;
                        }
                        return [2 /*return*/, failedBatchEvents];
                }
            });
        });
    };
    FirstPartyEventLoggingExporter.prototype.queueFailedEvents = function (events) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, context, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filePath = this.getCurrentBatchFilePath();
                        // Append-only: just add new events to file (atomic on most filesystems)
                        return [4 /*yield*/, this.appendEventsToFile(filePath, events)];
                    case 1:
                        // Append-only: just add new events to file (atomic on most filesystems)
                        _a.sent();
                        context = this.lastExportErrorContext
                            ? " (".concat(this.lastExportErrorContext, ")")
                            : '';
                        message = "1P event logging: ".concat(events.length, " events failed to export").concat(context);
                        (0, log_js_1.logError)(new Error(message));
                        return [2 /*return*/];
                }
            });
        });
    };
    FirstPartyEventLoggingExporter.prototype.scheduleBackoffRetry = function () {
        var _this = this;
        // Don't schedule if already retrying or shutdown
        if (this.cancelBackoff || this.isRetrying || this.isShutdown) {
            return;
        }
        // Quadratic backoff (matching Statsig SDK): base * attempts²
        var delay = Math.min(this.baseBackoffDelayMs * this.attempts * this.attempts, this.maxBackoffDelayMs);
        if (process.env.USER_TYPE === 'ant') {
            (0, debug_js_1.logForDebugging)("1P event logging: scheduling backoff retry in ".concat(delay, "ms (attempt ").concat(this.attempts, ")"));
        }
        this.cancelBackoff = this.schedule(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.cancelBackoff = null;
                        return [4 /*yield*/, this.retryFailedEvents()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, delay);
    };
    FirstPartyEventLoggingExporter.prototype.retryFailedEvents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, events, failedEvents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filePath = this.getCurrentBatchFilePath();
                        _a.label = 1;
                    case 1:
                        if (!!this.isShutdown) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.loadEventsFromFile(filePath)];
                    case 2:
                        events = _a.sent();
                        if (events.length === 0)
                            return [3 /*break*/, 9];
                        if (!(this.attempts >= this.maxAttempts)) return [3 /*break*/, 4];
                        if (process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)("1P event logging: max attempts (".concat(this.maxAttempts, ") reached, dropping ").concat(events.length, " events"));
                        }
                        return [4 /*yield*/, this.deleteFile(filePath)];
                    case 3:
                        _a.sent();
                        this.resetBackoff();
                        return [2 /*return*/];
                    case 4:
                        this.isRetrying = true;
                        // Clear file before retry (we have events in memory now)
                        return [4 /*yield*/, this.deleteFile(filePath)];
                    case 5:
                        // Clear file before retry (we have events in memory now)
                        _a.sent();
                        if (process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)("1P event logging: retrying ".concat(events.length, " failed events (attempt ").concat(this.attempts + 1, ")"));
                        }
                        return [4 /*yield*/, this.sendEventsInBatches(events)];
                    case 6:
                        failedEvents = _a.sent();
                        this.attempts++;
                        this.isRetrying = false;
                        if (!(failedEvents.length > 0)) return [3 /*break*/, 8];
                        // Write failures back to disk
                        return [4 /*yield*/, this.saveEventsToFile(filePath, failedEvents)];
                    case 7:
                        // Write failures back to disk
                        _a.sent();
                        this.scheduleBackoffRetry();
                        return [2 /*return*/]; // Failed - wait for backoff
                    case 8:
                        // Success - reset backoff and continue loop to drain any newly queued events
                        this.resetBackoff();
                        if (process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)('1P event logging: backoff retry succeeded');
                        }
                        return [3 /*break*/, 1];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    FirstPartyEventLoggingExporter.prototype.resetBackoff = function () {
        this.attempts = 0;
        if (this.cancelBackoff) {
            this.cancelBackoff();
            this.cancelBackoff = null;
        }
    };
    FirstPartyEventLoggingExporter.prototype.sendBatchWithRetry = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var baseHeaders, hasTrust, shouldSkipAuth, tokens, authResult, useAuth, headers, response, error_6, response;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isKilled()) {
                            // Throw so the caller short-circuits remaining batches and queues
                            // everything to disk. Zero network traffic while killed; the backoff
                            // timer keeps ticking and will resume POSTs as soon as the GrowthBook
                            // cache picks up the cleared flag.
                            throw new Error('firstParty sink killswitch active');
                        }
                        baseHeaders = {
                            'Content-Type': 'application/json',
                            'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)(),
                            'x-service-name': 'claude-code',
                        };
                        hasTrust = (0, config_js_1.checkHasTrustDialogAccepted)() || (0, state_js_1.getIsNonInteractiveSession)();
                        if (process.env.USER_TYPE === 'ant' && !hasTrust) {
                            (0, debug_js_1.logForDebugging)('1P event logging: Trust not accepted');
                        }
                        shouldSkipAuth = this.skipAuth || !hasTrust;
                        if (!shouldSkipAuth && (0, auth_js_1.isClaudeAISubscriber)()) {
                            tokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
                            if (!(0, auth_js_1.hasProfileScope)()) {
                                shouldSkipAuth = true;
                            }
                            else if (tokens && (0, client_js_1.isOAuthTokenExpired)(tokens.expiresAt)) {
                                shouldSkipAuth = true;
                                if (process.env.USER_TYPE === 'ant') {
                                    (0, debug_js_1.logForDebugging)('1P event logging: OAuth token expired, skipping auth to avoid 401');
                                }
                            }
                        }
                        authResult = shouldSkipAuth
                            ? { headers: {}, error: 'trust not established or Oauth token expired' }
                            : (0, http_js_1.getAuthHeaders)();
                        useAuth = !authResult.error;
                        if (!useAuth && process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)("1P event logging: auth not available, sending without auth");
                        }
                        headers = useAuth
                            ? __assign(__assign({}, baseHeaders), authResult.headers) : baseHeaders;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 6]);
                        return [4 /*yield*/, axios_1.default.post(this.endpoint, payload, {
                                timeout: this.timeout,
                                headers: headers,
                            })];
                    case 2:
                        response = _b.sent();
                        this.logSuccess(payload.events.length, useAuth, response.data);
                        return [2 /*return*/];
                    case 3:
                        error_6 = _b.sent();
                        if (!(useAuth &&
                            axios_1.default.isAxiosError(error_6) &&
                            ((_a = error_6.response) === null || _a === void 0 ? void 0 : _a.status) === 401)) return [3 /*break*/, 5];
                        if (process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)('1P event logging: 401 auth error, retrying without auth');
                        }
                        return [4 /*yield*/, axios_1.default.post(this.endpoint, payload, {
                                timeout: this.timeout,
                                headers: baseHeaders,
                            })];
                    case 4:
                        response = _b.sent();
                        this.logSuccess(payload.events.length, false, response.data);
                        return [2 /*return*/];
                    case 5: throw error_6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    FirstPartyEventLoggingExporter.prototype.logSuccess = function (eventCount, withAuth, responseData) {
        if (process.env.USER_TYPE === 'ant') {
            (0, debug_js_1.logForDebugging)("1P event logging: ".concat(eventCount, " events exported successfully").concat(withAuth ? ' (with auth)' : ' (without auth)'));
            (0, debug_js_1.logForDebugging)("API Response: ".concat((0, slowOperations_js_1.jsonStringify)(responseData, null, 2)));
        }
    };
    FirstPartyEventLoggingExporter.prototype.hrTimeToDate = function (hrTime) {
        var seconds = hrTime[0], nanoseconds = hrTime[1];
        return new Date(seconds * 1000 + nanoseconds / 1000000);
    };
    FirstPartyEventLoggingExporter.prototype.transformLogsToEvents = function (logs) {
        var events = [];
        for (var _i = 0, logs_1 = logs; _i < logs_1.length; _i++) {
            var log = logs_1[_i];
            var attributes = log.attributes || {};
            // Check if this is a GrowthBook experiment event
            if (attributes.event_type === 'GrowthbookExperimentEvent') {
                var timestamp = this.hrTimeToDate(log.hrTime);
                var account_uuid = attributes.account_uuid;
                var organization_uuid = attributes.organization_uuid;
                events.push({
                    event_type: 'GrowthbookExperimentEvent',
                    event_data: growthbook_experiment_event_js_1.GrowthbookExperimentEvent.toJSON({
                        event_id: attributes.event_id,
                        timestamp: timestamp,
                        experiment_id: attributes.experiment_id,
                        variation_id: attributes.variation_id,
                        environment: attributes.environment,
                        user_attributes: attributes.user_attributes,
                        experiment_metadata: attributes.experiment_metadata,
                        device_id: attributes.device_id,
                        session_id: attributes.session_id,
                        auth: account_uuid || organization_uuid
                            ? { account_uuid: account_uuid, organization_uuid: organization_uuid }
                            : undefined,
                    }),
                });
                continue;
            }
            // Extract event name
            var eventName = attributes.event_name || log.body || 'unknown';
            // Extract metadata objects directly (no JSON parsing needed)
            var coreMetadata = attributes.core_metadata;
            var userMetadata = attributes.user_metadata;
            var eventMetadata = (attributes.event_metadata || {});
            if (!coreMetadata) {
                // Emit partial event if core metadata is missing
                if (process.env.USER_TYPE === 'ant') {
                    (0, debug_js_1.logForDebugging)("1P event logging: core_metadata missing for event ".concat(eventName));
                }
                events.push({
                    event_type: 'ClaudeCodeInternalEvent',
                    event_data: claude_code_internal_event_js_1.ClaudeCodeInternalEvent.toJSON({
                        event_id: attributes.event_id,
                        event_name: eventName,
                        client_timestamp: this.hrTimeToDate(log.hrTime),
                        session_id: (0, state_js_1.getSessionId)(),
                        additional_metadata: Buffer.from((0, slowOperations_js_1.jsonStringify)({
                            transform_error: 'core_metadata attribute is missing',
                        })).toString('base64'),
                    }),
                });
                continue;
            }
            // Transform to 1P format
            var formatted = (0, metadata_js_1.to1PEventFormat)(coreMetadata, userMetadata, eventMetadata);
            // _PROTO_* keys are PII-tagged values meant only for privileged BQ
            // columns. Hoist known keys to proto fields, then defensively strip any
            // remaining _PROTO_* so an unrecognized future key can't silently land
            // in the general-access additional_metadata blob. sink.ts applies the
            // same strip before Datadog; this closes the 1P side.
            var _a = formatted.additional, _PROTO_skill_name = _a._PROTO_skill_name, _PROTO_plugin_name = _a._PROTO_plugin_name, _PROTO_marketplace_name = _a._PROTO_marketplace_name, rest = __rest(_a, ["_PROTO_skill_name", "_PROTO_plugin_name", "_PROTO_marketplace_name"]);
            var additionalMetadata = (0, index_js_1.stripProtoFields)(rest);
            events.push({
                event_type: 'ClaudeCodeInternalEvent',
                event_data: claude_code_internal_event_js_1.ClaudeCodeInternalEvent.toJSON(__assign(__assign({ event_id: attributes.event_id, event_name: eventName, client_timestamp: this.hrTimeToDate(log.hrTime), device_id: attributes.user_id, email: userMetadata === null || userMetadata === void 0 ? void 0 : userMetadata.email, auth: formatted.auth }, formatted.core), { env: formatted.env, process: formatted.process, skill_name: typeof _PROTO_skill_name === 'string'
                        ? _PROTO_skill_name
                        : undefined, plugin_name: typeof _PROTO_plugin_name === 'string'
                        ? _PROTO_plugin_name
                        : undefined, marketplace_name: typeof _PROTO_marketplace_name === 'string'
                        ? _PROTO_marketplace_name
                        : undefined, additional_metadata: Object.keys(additionalMetadata).length > 0
                        ? Buffer.from((0, slowOperations_js_1.jsonStringify)(additionalMetadata)).toString('base64')
                        : undefined })),
            });
        }
        return { events: events };
    };
    FirstPartyEventLoggingExporter.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isShutdown = true;
                        this.resetBackoff();
                        return [4 /*yield*/, this.forceFlush()];
                    case 1:
                        _a.sent();
                        if (process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)('1P event logging exporter shutdown complete');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    FirstPartyEventLoggingExporter.prototype.forceFlush = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(this.pendingExports)];
                    case 1:
                        _a.sent();
                        if (process.env.USER_TYPE === 'ant') {
                            (0, debug_js_1.logForDebugging)('1P event logging exporter flush complete');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return FirstPartyEventLoggingExporter;
}());
exports.FirstPartyEventLoggingExporter = FirstPartyEventLoggingExporter;
function getAxiosErrorContext(error) {
    var _a, _b, _c;
    if (!axios_1.default.isAxiosError(error)) {
        return (0, errors_js_1.errorMessage)(error);
    }
    var parts = [];
    var requestId = (_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b['request-id'];
    if (requestId) {
        parts.push("request-id=".concat(requestId));
    }
    if ((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) {
        parts.push("status=".concat(error.response.status));
    }
    if (error.code) {
        parts.push("code=".concat(error.code));
    }
    if (error.message) {
        parts.push(error.message);
    }
    return parts.join(', ');
}
