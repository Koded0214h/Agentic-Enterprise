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
exports.STDOUT_GUARD_MARKER = void 0;
exports.installStreamJsonStdoutGuard = installStreamJsonStdoutGuard;
exports._resetStreamJsonStdoutGuardForTesting = _resetStreamJsonStdoutGuardForTesting;
var cleanupRegistry_js_1 = require("./cleanupRegistry.js");
var debug_js_1 = require("./debug.js");
/**
 * Sentinel written to stderr ahead of any diverted non-JSON line, so that
 * log scrapers and tests can grep for guard activity.
 */
exports.STDOUT_GUARD_MARKER = '[stdout-guard]';
var installed = false;
var buffer = '';
var originalWrite = null;
function isJsonLine(line) {
    // Empty lines are tolerated in NDJSON streams — treat them as valid so a
    // trailing newline or a blank separator doesn't trip the guard.
    if (line.length === 0) {
        return true;
    }
    try {
        JSON.parse(line);
        return true;
    }
    catch (_a) {
        return false;
    }
}
/**
 * Install a runtime guard on process.stdout.write for --output-format=stream-json.
 *
 * SDK clients consuming stream-json parse stdout line-by-line as NDJSON. Any
 * stray write — a console.log from a dependency, a debug print that slipped
 * past review, a library banner — breaks the client's parser mid-stream with
 * no recovery path.
 *
 * This guard wraps process.stdout.write at the same layer the asciicast
 * recorder does (see asciicast.ts). Writes are buffered until a newline
 * arrives, then each complete line is JSON-parsed. Lines that parse are
 * forwarded to the real stdout; lines that don't are diverted to stderr
 * tagged with STDOUT_GUARD_MARKER so they remain visible without corrupting
 * the JSON stream.
 *
 * The blessed JSON path (structuredIO.write → writeToStdout → stdout.write)
 * always emits `ndjsonSafeStringify(msg) + '\n'`, so it passes straight
 * through. Only out-of-band writes are diverted.
 *
 * Installing twice is a no-op. Call before any stream-json output is emitted.
 */
function installStreamJsonStdoutGuard() {
    var _this = this;
    if (installed) {
        return;
    }
    installed = true;
    originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = function (chunk, encodingOrCb, cb) {
        var text = typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf-8');
        buffer += text;
        var newlineIdx;
        var wrote = true;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
            var line = buffer.slice(0, newlineIdx);
            buffer = buffer.slice(newlineIdx + 1);
            if (isJsonLine(line)) {
                wrote = originalWrite(line + '\n');
            }
            else {
                process.stderr.write("".concat(exports.STDOUT_GUARD_MARKER, " ").concat(line, "\n"));
                (0, debug_js_1.logForDebugging)("streamJsonStdoutGuard diverted non-JSON stdout line: ".concat(line.slice(0, 200)));
            }
        }
        // Fire the callback once buffering is done. We report success even when
        // a line was diverted — the caller's intent (emit text) was honored,
        // just on a different fd.
        var callback = typeof encodingOrCb === 'function' ? encodingOrCb : cb;
        if (callback) {
            queueMicrotask(function () { return callback(); });
        }
        return wrote;
    };
    (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Flush any partial line left in the buffer at shutdown. If it's a JSON
            // fragment it won't parse — divert it rather than drop it silently.
            if (buffer.length > 0) {
                if (originalWrite && isJsonLine(buffer)) {
                    originalWrite(buffer + '\n');
                }
                else {
                    process.stderr.write("".concat(exports.STDOUT_GUARD_MARKER, " ").concat(buffer, "\n"));
                }
                buffer = '';
            }
            if (originalWrite) {
                process.stdout.write = originalWrite;
                originalWrite = null;
            }
            installed = false;
            return [2 /*return*/];
        });
    }); });
}
/**
 * Testing-only reset. Restores the real stdout.write and clears the line
 * buffer so subsequent tests start from a clean slate.
 */
function _resetStreamJsonStdoutGuardForTesting() {
    if (originalWrite) {
        process.stdout.write = originalWrite;
        originalWrite = null;
    }
    buffer = '';
    installed = false;
}
