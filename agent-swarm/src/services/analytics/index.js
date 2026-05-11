"use strict";
/**
 * Analytics service - public API for event logging
 *
 * This module serves as the main entry point for analytics events in Claude CLI.
 *
 * DESIGN: This module has NO dependencies to avoid import cycles.
 * Events are queued until attachAnalyticsSink() is called during app initialization.
 * The sink handles routing to Datadog and 1P event logging.
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripProtoFields = stripProtoFields;
exports.attachAnalyticsSink = attachAnalyticsSink;
exports.logEvent = logEvent;
exports.logEventAsync = logEventAsync;
exports._resetForTesting = _resetForTesting;
/**
 * Strip `_PROTO_*` keys from a payload destined for general-access storage.
 * Used by:
 *   - sink.ts: before Datadog fanout (never sees PII-tagged values)
 *   - firstPartyEventLoggingExporter: defensive strip of additional_metadata
 *     after hoisting known _PROTO_* keys to proto fields — prevents a future
 *     unrecognized _PROTO_foo from silently landing in the BQ JSON blob.
 *
 * Returns the input unchanged (same reference) when no _PROTO_ keys present.
 */
function stripProtoFields(metadata) {
    var result;
    for (var key in metadata) {
        if (key.startsWith('_PROTO_')) {
            if (result === undefined) {
                result = __assign({}, metadata);
            }
            delete result[key];
        }
    }
    return result !== null && result !== void 0 ? result : metadata;
}
// Event queue for events logged before sink is attached
var eventQueue = [];
// Sink - initialized during app startup
var sink = null;
/**
 * Attach the analytics sink that will receive all events.
 * Queued events are drained asynchronously via queueMicrotask to avoid
 * adding latency to the startup path.
 *
 * Idempotent: if a sink is already attached, this is a no-op. This allows
 * calling from both the preAction hook (for subcommands) and setup() (for
 * the default command) without coordination.
 */
function attachAnalyticsSink(newSink) {
    if (sink !== null) {
        return;
    }
    sink = newSink;
    // Drain the queue asynchronously to avoid blocking startup
    if (eventQueue.length > 0) {
        var queuedEvents_1 = __spreadArray([], eventQueue, true);
        eventQueue.length = 0;
        // Log queue size for ants to help debug analytics initialization timing
        if (process.env.USER_TYPE === 'ant') {
            sink.logEvent('analytics_sink_attached', {
                queued_event_count: queuedEvents_1.length,
            });
        }
        queueMicrotask(function () {
            for (var _i = 0, queuedEvents_2 = queuedEvents_1; _i < queuedEvents_2.length; _i++) {
                var event_1 = queuedEvents_2[_i];
                if (event_1.async) {
                    void sink.logEventAsync(event_1.eventName, event_1.metadata);
                }
                else {
                    sink.logEvent(event_1.eventName, event_1.metadata);
                }
            }
        });
    }
}
/**
 * Log an event to analytics backends (synchronous)
 *
 * Events may be sampled based on the 'tengu_event_sampling_config' dynamic config.
 * When sampled, the sample_rate is added to the event metadata.
 *
 * If no sink is attached, events are queued and drained when the sink attaches.
 */
function logEvent(eventName, 
// intentionally no strings unless AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
// to avoid accidentally logging code/filepaths
metadata) {
    if (sink === null) {
        eventQueue.push({ eventName: eventName, metadata: metadata, async: false });
        return;
    }
    sink.logEvent(eventName, metadata);
}
/**
 * Log an event to analytics backends (asynchronous)
 *
 * Events may be sampled based on the 'tengu_event_sampling_config' dynamic config.
 * When sampled, the sample_rate is added to the event metadata.
 *
 * If no sink is attached, events are queued and drained when the sink attaches.
 */
function logEventAsync(eventName, 
// intentionally no strings, to avoid accidentally logging code/filepaths
metadata) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (sink === null) {
                        eventQueue.push({ eventName: eventName, metadata: metadata, async: true });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, sink.logEventAsync(eventName, metadata)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Reset analytics state for testing purposes only.
 * @internal
 */
function _resetForTesting() {
    sink = null;
    eventQueue.length = 0;
}
