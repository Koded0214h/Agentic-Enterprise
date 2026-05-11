"use strict";
/**
 * Service for heap dump capture.
 * Used by the /heapdump command.
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
exports.captureMemoryDiagnostics = captureMemoryDiagnostics;
exports.performHeapDump = performHeapDump;
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var promises_2 = require("stream/promises");
var v8_1 = require("v8");
var state_js_1 = require("../bootstrap/state.js");
var index_js_1 = require("../services/analytics/index.js");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var file_js_1 = require("./file.js");
var fsOperations_js_1 = require("./fsOperations.js");
var log_js_1 = require("./log.js");
var slowOperations_js_1 = require("./slowOperations.js");
/**
 * Capture memory diagnostics.
 * This helps identify if the leak is in V8 heap (captured) or native memory (not captured).
 */
function captureMemoryDiagnostics(trigger_1) {
    return __awaiter(this, arguments, void 0, function (trigger, dumpNumber) {
        var usage, heapStats, resourceUsage, uptimeSeconds, heapSpaceStats, activeHandles, activeRequests, openFileDescriptors, _a, smapsRollup, _b, nativeMemory, bytesPerSecond, mbPerHour, potentialLeaks;
        if (dumpNumber === void 0) { dumpNumber = 0; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    usage = process.memoryUsage();
                    heapStats = (0, v8_1.getHeapStatistics)();
                    resourceUsage = process.resourceUsage();
                    uptimeSeconds = process.uptime();
                    try {
                        heapSpaceStats = (0, v8_1.getHeapSpaceStatistics)();
                    }
                    catch (_d) {
                        // Not available in Bun runtime
                    }
                    activeHandles = process._getActiveHandles().length;
                    activeRequests = process._getActiveRequests().length;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)('/proc/self/fd')];
                case 2:
                    openFileDescriptors = (_c.sent()).length;
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, promises_1.readFile)('/proc/self/smaps_rollup', 'utf8')];
                case 5:
                    smapsRollup = _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _b = _c.sent();
                    return [3 /*break*/, 7];
                case 7:
                    nativeMemory = usage.rss - usage.heapUsed;
                    bytesPerSecond = uptimeSeconds > 0 ? usage.rss / uptimeSeconds : 0;
                    mbPerHour = (bytesPerSecond * 3600) / (1024 * 1024);
                    potentialLeaks = [];
                    if (heapStats.number_of_detached_contexts > 0) {
                        potentialLeaks.push("".concat(heapStats.number_of_detached_contexts, " detached context(s) - possible iframe/context leak"));
                    }
                    if (activeHandles > 100) {
                        potentialLeaks.push("".concat(activeHandles, " active handles - possible timer/socket leak"));
                    }
                    if (nativeMemory > usage.heapUsed) {
                        potentialLeaks.push('Native memory > heap - leak may be in native addons (node-pty, sharp, etc.)');
                    }
                    if (mbPerHour > 100) {
                        potentialLeaks.push("High memory growth rate: ".concat(mbPerHour.toFixed(1), " MB/hour"));
                    }
                    if (openFileDescriptors && openFileDescriptors > 500) {
                        potentialLeaks.push("".concat(openFileDescriptors, " open file descriptors - possible file/socket leak"));
                    }
                    return [2 /*return*/, {
                            timestamp: new Date().toISOString(),
                            sessionId: (0, state_js_1.getSessionId)(),
                            trigger: trigger,
                            dumpNumber: dumpNumber,
                            uptimeSeconds: uptimeSeconds,
                            memoryUsage: {
                                heapUsed: usage.heapUsed,
                                heapTotal: usage.heapTotal,
                                external: usage.external,
                                arrayBuffers: usage.arrayBuffers,
                                rss: usage.rss,
                            },
                            memoryGrowthRate: {
                                bytesPerSecond: bytesPerSecond,
                                mbPerHour: mbPerHour,
                            },
                            v8HeapStats: {
                                heapSizeLimit: heapStats.heap_size_limit,
                                mallocedMemory: heapStats.malloced_memory,
                                peakMallocedMemory: heapStats.peak_malloced_memory,
                                detachedContexts: heapStats.number_of_detached_contexts,
                                nativeContexts: heapStats.number_of_native_contexts,
                            },
                            v8HeapSpaces: heapSpaceStats === null || heapSpaceStats === void 0 ? void 0 : heapSpaceStats.map(function (space) { return ({
                                name: space.space_name,
                                size: space.space_size,
                                used: space.space_used_size,
                                available: space.space_available_size,
                            }); }),
                            resourceUsage: {
                                maxRSS: resourceUsage.maxRSS * 1024, // Convert KB to bytes
                                userCPUTime: resourceUsage.userCPUTime,
                                systemCPUTime: resourceUsage.systemCPUTime,
                            },
                            activeHandles: activeHandles,
                            activeRequests: activeRequests,
                            openFileDescriptors: openFileDescriptors,
                            analysis: {
                                potentialLeaks: potentialLeaks,
                                recommendation: potentialLeaks.length > 0
                                    ? "WARNING: ".concat(potentialLeaks.length, " potential leak indicator(s) found. See potentialLeaks array.")
                                    : 'No obvious leak indicators. Check heap snapshot for retained objects.',
                            },
                            smapsRollup: smapsRollup,
                            platform: process.platform,
                            nodeVersion: process.version,
                            ccVersion: MACRO.VERSION,
                        }];
            }
        });
    });
}
/**
 * Core heap dump function — captures heap snapshot + diagnostics to ~/Desktop.
 *
 * Diagnostics are written BEFORE the heap snapshot is captured, because the
 * V8 heap snapshot serialization can crash for very large heaps. By writing
 * diagnostics first, we still get useful memory info even if the snapshot fails.
 */
function performHeapDump() {
    return __awaiter(this, arguments, void 0, function (trigger, dumpNumber) {
        var sessionId, diagnostics, toGB, dumpDir, suffix, heapFilename, diagFilename, heapPath, diagPath, err_1, error;
        if (trigger === void 0) { trigger = 'manual'; }
        if (dumpNumber === void 0) { dumpNumber = 0; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    sessionId = (0, state_js_1.getSessionId)();
                    return [4 /*yield*/, captureMemoryDiagnostics(trigger, dumpNumber)];
                case 1:
                    diagnostics = _a.sent();
                    toGB = function (bytes) {
                        return (bytes / 1024 / 1024 / 1024).toFixed(3);
                    };
                    (0, debug_js_1.logForDebugging)("[HeapDump] Memory state:\n  heapUsed: ".concat(toGB(diagnostics.memoryUsage.heapUsed), " GB (in snapshot)\n  external: ").concat(toGB(diagnostics.memoryUsage.external), " GB (NOT in snapshot)\n  rss: ").concat(toGB(diagnostics.memoryUsage.rss), " GB (total process)\n  ").concat(diagnostics.analysis.recommendation));
                    dumpDir = (0, file_js_1.getDesktopPath)();
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir(dumpDir)];
                case 2:
                    _a.sent();
                    suffix = dumpNumber > 0 ? "-dump".concat(dumpNumber) : '';
                    heapFilename = "".concat(sessionId).concat(suffix, ".heapsnapshot");
                    diagFilename = "".concat(sessionId).concat(suffix, "-diagnostics.json");
                    heapPath = (0, path_1.join)(dumpDir, heapFilename);
                    diagPath = (0, path_1.join)(dumpDir, diagFilename);
                    // Write diagnostics first (cheap, unlikely to fail)
                    return [4 /*yield*/, (0, promises_1.writeFile)(diagPath, (0, slowOperations_js_1.jsonStringify)(diagnostics, null, 2), {
                            mode: 384,
                        })];
                case 3:
                    // Write diagnostics first (cheap, unlikely to fail)
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[HeapDump] Diagnostics written to ".concat(diagPath));
                    // Write heap snapshot (this can crash for very large heaps)
                    return [4 /*yield*/, writeHeapSnapshot(heapPath)];
                case 4:
                    // Write heap snapshot (this can crash for very large heaps)
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[HeapDump] Heap dump written to ".concat(heapPath));
                    (0, index_js_1.logEvent)('tengu_heap_dump', {
                        triggerManual: trigger === 'manual',
                        triggerAuto15GB: trigger === 'auto-1.5GB',
                        dumpNumber: dumpNumber,
                        success: true,
                    });
                    return [2 /*return*/, { success: true, heapPath: heapPath, diagPath: diagPath }];
                case 5:
                    err_1 = _a.sent();
                    error = (0, errors_js_1.toError)(err_1);
                    (0, log_js_1.logError)(error);
                    (0, index_js_1.logEvent)('tengu_heap_dump', {
                        triggerManual: trigger === 'manual',
                        triggerAuto15GB: trigger === 'auto-1.5GB',
                        dumpNumber: dumpNumber,
                        success: false,
                    });
                    return [2 /*return*/, { success: false, error: error.message }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Write heap snapshot to a file.
 * Uses pipeline() which handles stream cleanup automatically on errors.
 */
function writeHeapSnapshot(filepath) {
    return __awaiter(this, void 0, void 0, function () {
        var writeStream, heapSnapshotStream;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof Bun !== 'undefined') {
                        // In Bun, heapsnapshots are currently not streaming.
                        // Use synchronous I/O despite potentially large filesize so that we avoid cloning the string for cross-thread usage.
                        //
                        /* eslint-disable custom-rules/no-sync-fs -- intentionally sync to avoid cloning large heap snapshot string for cross-thread usage */
                        // @ts-expect-error 2nd argument is in the next version of Bun
                        (0, fs_1.writeFileSync)(filepath, Bun.generateHeapSnapshot('v8', 'arraybuffer'), {
                            mode: 384,
                        });
                        /* eslint-enable custom-rules/no-sync-fs */
                        // Force GC to try to free that heap snapshot sooner.
                        Bun.gc(true);
                        return [2 /*return*/];
                    }
                    writeStream = (0, fs_1.createWriteStream)(filepath, { mode: 384 });
                    heapSnapshotStream = (0, v8_1.getHeapSnapshot)();
                    return [4 /*yield*/, (0, promises_2.pipeline)(heapSnapshotStream, writeStream)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
