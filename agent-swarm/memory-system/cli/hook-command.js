"use strict";
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
exports.isWorkerUnavailableError = isWorkerUnavailableError;
exports.hookCommand = hookCommand;
var stdin_reader_js_1 = require("./stdin-reader.js");
var index_js_1 = require("./adapters/index.js");
var index_js_2 = require("./handlers/index.js");
var hook_constants_js_1 = require("../shared/hook-constants.js");
var logger_js_1 = require("../utils/logger.js");
/**
 * Classify whether an error indicates the worker is unavailable (graceful degradation)
 * vs a handler/client bug (blocking error that developers need to see).
 *
 * Exit 0 (graceful degradation):
 * - Transport failures: ECONNREFUSED, ECONNRESET, EPIPE, ETIMEDOUT, fetch failed
 * - Timeout errors: timed out, timeout
 * - Server errors: HTTP 5xx status codes
 *
 * Exit 2 (blocking error — handler/client bug):
 * - HTTP 4xx status codes (bad request, not found, validation error)
 * - Programming errors (TypeError, ReferenceError, SyntaxError)
 * - All other unexpected errors
 */
function isWorkerUnavailableError(error) {
    var message = error instanceof Error ? error.message : String(error);
    var lower = message.toLowerCase();
    // Transport failures — worker unreachable
    var transportPatterns = [
        'econnrefused',
        'econnreset',
        'epipe',
        'etimedout',
        'enotfound',
        'econnaborted',
        'enetunreach',
        'ehostunreach',
        'fetch failed',
        'unable to connect',
        'socket hang up',
    ];
    if (transportPatterns.some(function (p) { return lower.includes(p); }))
        return true;
    // Timeout errors — worker didn't respond in time
    if (lower.includes('timed out') || lower.includes('timeout'))
        return true;
    // HTTP 5xx server errors — worker has internal problems
    if (/failed:\s*5\d{2}/.test(message) || /status[:\s]+5\d{2}/.test(message))
        return true;
    // HTTP 429 (rate limit) — treat as transient unavailability, not a bug
    if (/failed:\s*429/.test(message) || /status[:\s]+429/.test(message))
        return true;
    // HTTP 4xx client errors — our bug, NOT worker unavailability
    if (/failed:\s*4\d{2}/.test(message) || /status[:\s]+4\d{2}/.test(message))
        return false;
    // Programming errors — code bugs, not worker unavailability
    // Note: TypeError('fetch failed') already handled by transport patterns above
    if (error instanceof TypeError || error instanceof ReferenceError || error instanceof SyntaxError) {
        return false;
    }
    // Default: treat unknown errors as blocking (conservative — surface bugs)
    return false;
}
function hookCommand(platform_1, event_1) {
    return __awaiter(this, arguments, void 0, function (platform, event, options) {
        var originalStderrWrite, adapter, handler, rawInput, input, result, output, exitCode, error_1;
        var _a;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    originalStderrWrite = process.stderr.write.bind(process.stderr);
                    process.stderr.write = (function () { return true; });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    adapter = (0, index_js_1.getPlatformAdapter)(platform);
                    handler = (0, index_js_2.getEventHandler)(event);
                    return [4 /*yield*/, (0, stdin_reader_js_1.readJsonFromStdin)()];
                case 2:
                    rawInput = _b.sent();
                    input = adapter.normalizeInput(rawInput);
                    input.platform = platform; // Inject platform for handler-level decisions
                    return [4 /*yield*/, handler.execute(input)];
                case 3:
                    result = _b.sent();
                    output = adapter.formatOutput(result);
                    console.log(JSON.stringify(output));
                    exitCode = (_a = result.exitCode) !== null && _a !== void 0 ? _a : hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS;
                    if (!options.skipExit) {
                        process.exit(exitCode);
                    }
                    return [2 /*return*/, exitCode];
                case 4:
                    error_1 = _b.sent();
                    if (isWorkerUnavailableError(error_1)) {
                        // Worker unavailable — degrade gracefully, don't block the user
                        // Log to file instead of stderr (#1181)
                        logger_js_1.logger.warn('HOOK', "Worker unavailable, skipping hook: ".concat(error_1 instanceof Error ? error_1.message : error_1));
                        if (!options.skipExit) {
                            process.exit(hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS); // = 0 (graceful)
                        }
                        return [2 /*return*/, hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS];
                    }
                    // Handler/client bug — log to file instead of stderr (#1181)
                    logger_js_1.logger.error('HOOK', "Hook error: ".concat(error_1 instanceof Error ? error_1.message : error_1), {}, error_1 instanceof Error ? error_1 : undefined);
                    if (!options.skipExit) {
                        process.exit(hook_constants_js_1.HOOK_EXIT_CODES.BLOCKING_ERROR); // = 2
                    }
                    return [2 /*return*/, hook_constants_js_1.HOOK_EXIT_CODES.BLOCKING_ERROR];
                case 5:
                    // Restore stderr for non-hook code paths (e.g., when skipExit is true and process continues as worker)
                    process.stderr.write = originalStderrWrite;
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
