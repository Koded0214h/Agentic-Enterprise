"use strict";
// Stdin reading utility for Claude Code hooks
//
// Problem: Claude Code doesn't close stdin after writing hook input,
// so stdin.on('end') never fires and hooks hang indefinitely (#727).
//
// Solution: JSON is self-delimiting. We detect complete JSON by attempting
// to parse after each chunk. Once we have valid JSON, we resolve immediately
// without waiting for EOF. This is the proper fix, not a timeout workaround.
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
exports.readJsonFromStdin = readJsonFromStdin;
/**
 * Check if stdin is available and readable.
 *
 * Bun has a bug where accessing process.stdin can crash with EINVAL
 * if Claude Code doesn't provide a valid stdin file descriptor (#646).
 * This function safely checks if stdin is usable.
 */
function isStdinAvailable() {
    try {
        var stdin = process.stdin;
        // If stdin is a TTY, we're running interactively (not from Claude Code hook)
        if (stdin.isTTY) {
            return false;
        }
        // Accessing stdin.readable triggers Bun's lazy initialization.
        // If we get here without throwing, stdin is available.
        // Note: We don't check the value since Node/Bun don't reliably set it to false.
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        stdin.readable;
        return true;
    }
    catch (_a) {
        // Bun crashed trying to access stdin (EINVAL from fstat)
        // This is expected when Claude Code doesn't provide valid stdin
        return false;
    }
}
/**
 * Try to parse the accumulated input as JSON.
 * Returns the parsed value if successful, undefined if incomplete/invalid.
 */
function tryParseJson(input) {
    var trimmed = input.trim();
    if (!trimmed) {
        return { success: false };
    }
    try {
        var value = JSON.parse(trimmed);
        return { success: true, value: value };
    }
    catch (_a) {
        // JSON is incomplete or invalid
        return { success: false };
    }
}
// Safety timeout - only kicks in if JSON never completes (malformed input).
// This should rarely/never be hit in normal operation since we detect complete JSON.
var SAFETY_TIMEOUT_MS = 30000;
// Short delay after last data chunk to try parsing
// This handles the case where JSON arrives in multiple chunks
var PARSE_DELAY_MS = 50;
function readJsonFromStdin() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // First, check if stdin is even available
            // This catches the Bun EINVAL crash from issue #646
            if (!isStdinAvailable()) {
                return [2 /*return*/, undefined];
            }
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var input = '';
                    var resolved = false;
                    var parseDelayId = null;
                    var cleanup = function () {
                        try {
                            process.stdin.removeAllListeners('data');
                            process.stdin.removeAllListeners('end');
                            process.stdin.removeAllListeners('error');
                        }
                        catch (_a) {
                            // Ignore cleanup errors
                        }
                    };
                    var resolveWith = function (value) {
                        if (resolved)
                            return;
                        resolved = true;
                        if (parseDelayId)
                            clearTimeout(parseDelayId);
                        clearTimeout(safetyTimeoutId);
                        cleanup();
                        resolve(value);
                    };
                    var rejectWith = function (error) {
                        if (resolved)
                            return;
                        resolved = true;
                        if (parseDelayId)
                            clearTimeout(parseDelayId);
                        clearTimeout(safetyTimeoutId);
                        cleanup();
                        reject(error);
                    };
                    var tryResolveWithJson = function () {
                        var result = tryParseJson(input);
                        if (result.success) {
                            resolveWith(result.value);
                            return true;
                        }
                        return false;
                    };
                    // Safety timeout - fallback if JSON never completes
                    var safetyTimeoutId = setTimeout(function () {
                        if (!resolved) {
                            // Try one final parse attempt
                            if (!tryResolveWithJson()) {
                                // If we have data but it's not valid JSON, that's an error
                                if (input.trim()) {
                                    rejectWith(new Error("Incomplete JSON after ".concat(SAFETY_TIMEOUT_MS, "ms: ").concat(input.slice(0, 100), "...")));
                                }
                                else {
                                    // No data received - resolve with undefined
                                    resolveWith(undefined);
                                }
                            }
                        }
                    }, SAFETY_TIMEOUT_MS);
                    try {
                        process.stdin.on('data', function (chunk) {
                            input += chunk;
                            // Clear any pending parse delay
                            if (parseDelayId) {
                                clearTimeout(parseDelayId);
                                parseDelayId = null;
                            }
                            // Try to parse immediately - if JSON is complete, resolve now
                            if (tryResolveWithJson()) {
                                return;
                            }
                            // If immediate parse failed, set a short delay and try again
                            // This handles multi-chunk delivery where the last chunk completes the JSON
                            parseDelayId = setTimeout(function () {
                                tryResolveWithJson();
                            }, PARSE_DELAY_MS);
                        });
                        process.stdin.on('end', function () {
                            // stdin closed - parse whatever we have
                            if (!resolved) {
                                if (!tryResolveWithJson()) {
                                    // Empty or invalid - resolve with undefined
                                    resolveWith(input.trim() ? undefined : undefined);
                                }
                            }
                        });
                        process.stdin.on('error', function () {
                            if (!resolved) {
                                // Don't reject on stdin errors - just return undefined
                                // This is more graceful for hook execution
                                resolveWith(undefined);
                            }
                        });
                    }
                    catch (_a) {
                        // If attaching listeners fails (Bun stdin issue), resolve with undefined
                        resolved = true;
                        clearTimeout(safetyTimeoutId);
                        cleanup();
                        resolve(undefined);
                    }
                })];
        });
    });
}
