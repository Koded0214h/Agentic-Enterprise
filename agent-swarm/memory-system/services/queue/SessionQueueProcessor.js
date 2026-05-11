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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionQueueProcessor = void 0;
var logger_js_1 = require("../../utils/logger.js");
var IDLE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes
var SessionQueueProcessor = /** @class */ (function () {
    function SessionQueueProcessor(store, events) {
        this.store = store;
        this.events = events;
    }
    /**
     * Create an async iterator that yields messages as they become available.
     * Uses atomic claim-confirm to prevent duplicates.
     * Messages are claimed (marked processing) and stay in DB until confirmProcessed().
     * Self-heals stale processing messages before each claim.
     * Waits for 'message' event when queue is empty.
     *
     * CRITICAL: Calls onIdleTimeout callback after 3 minutes of inactivity.
     * The callback should trigger abortController.abort() to kill the SDK subprocess.
     * Just returning from the iterator is NOT enough - the subprocess stays alive!
     */
    SessionQueueProcessor.prototype.createIterator = function (options) {
        return __asyncGenerator(this, arguments, function createIterator_1() {
            var sessionDbId, signal, onIdleTimeout, lastActivityTime, persistentMessage, receivedMessage, idleDuration, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionDbId = options.sessionDbId, signal = options.signal, onIdleTimeout = options.onIdleTimeout;
                        lastActivityTime = Date.now();
                        _a.label = 1;
                    case 1:
                        if (!!signal.aborted) return [3 /*break*/, 15];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 10, , 14]);
                        persistentMessage = this.store.claimNextMessage(sessionDbId);
                        if (!persistentMessage) return [3 /*break*/, 5];
                        // Reset activity time when we successfully yield a message
                        lastActivityTime = Date.now();
                        return [4 /*yield*/, __await(this.toPendingMessageWithId(persistentMessage))];
                    case 3: 
                    // Yield the message for processing (it's marked as 'processing' in DB)
                    return [4 /*yield*/, _a.sent()];
                    case 4:
                        // Yield the message for processing (it's marked as 'processing' in DB)
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 5: return [4 /*yield*/, __await(this.waitForMessage(signal, IDLE_TIMEOUT_MS))];
                    case 6:
                        receivedMessage = _a.sent();
                        if (!(!receivedMessage && !signal.aborted)) return [3 /*break*/, 9];
                        idleDuration = Date.now() - lastActivityTime;
                        if (!(idleDuration >= IDLE_TIMEOUT_MS)) return [3 /*break*/, 8];
                        logger_js_1.logger.info('SESSION', 'Idle timeout reached, triggering abort to kill subprocess', {
                            sessionDbId: sessionDbId,
                            idleDurationMs: idleDuration,
                            thresholdMs: IDLE_TIMEOUT_MS
                        });
                        onIdleTimeout === null || onIdleTimeout === void 0 ? void 0 : onIdleTimeout();
                        return [4 /*yield*/, __await(void 0)];
                    case 7: return [2 /*return*/, _a.sent()];
                    case 8:
                        // Reset timer on spurious wakeup - queue is empty but duration check failed
                        lastActivityTime = Date.now();
                        _a.label = 9;
                    case 9: return [3 /*break*/, 14];
                    case 10:
                        error_1 = _a.sent();
                        if (!signal.aborted) return [3 /*break*/, 12];
                        return [4 /*yield*/, __await(void 0)];
                    case 11: return [2 /*return*/, _a.sent()];
                    case 12:
                        logger_js_1.logger.error('SESSION', 'Error in queue processor loop', { sessionDbId: sessionDbId }, error_1);
                        // Small backoff to prevent tight loop on DB error
                        return [4 /*yield*/, __await(new Promise(function (resolve) { return setTimeout(resolve, 1000); }))];
                    case 13:
                        // Small backoff to prevent tight loop on DB error
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 14: return [3 /*break*/, 1];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    SessionQueueProcessor.prototype.toPendingMessageWithId = function (msg) {
        var pending = this.store.toPendingMessage(msg);
        return __assign(__assign({}, pending), { _persistentId: msg.id, _originalTimestamp: msg.created_at_epoch });
    };
    /**
     * Wait for a message event or timeout.
     * @param signal - AbortSignal to cancel waiting
     * @param timeoutMs - Maximum time to wait before returning
     * @returns true if a message was received, false if timeout occurred
     */
    SessionQueueProcessor.prototype.waitForMessage = function (signal, timeoutMs) {
        var _this = this;
        if (timeoutMs === void 0) { timeoutMs = IDLE_TIMEOUT_MS; }
        return new Promise(function (resolve) {
            var timeoutId;
            var onMessage = function () {
                cleanup();
                resolve(true); // Message received
            };
            var onAbort = function () {
                cleanup();
                resolve(false); // Aborted, let loop check signal.aborted
            };
            var onTimeout = function () {
                cleanup();
                resolve(false); // Timeout occurred
            };
            var cleanup = function () {
                if (timeoutId !== undefined) {
                    clearTimeout(timeoutId);
                }
                _this.events.off('message', onMessage);
                signal.removeEventListener('abort', onAbort);
            };
            _this.events.once('message', onMessage);
            signal.addEventListener('abort', onAbort, { once: true });
            timeoutId = setTimeout(onTimeout, timeoutMs);
        });
    };
    return SessionQueueProcessor;
}());
exports.SessionQueueProcessor = SessionQueueProcessor;
