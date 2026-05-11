"use strict";
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteIO = void 0;
var stream_1 = require("stream");
var url_1 = require("url");
var state_js_1 = require("../bootstrap/state.js");
var pollConfig_js_1 = require("../bridge/pollConfig.js");
var cleanupRegistry_js_1 = require("../utils/cleanupRegistry.js");
var commandLifecycle_js_1 = require("../utils/commandLifecycle.js");
var debug_js_1 = require("../utils/debug.js");
var diagLogs_js_1 = require("../utils/diagLogs.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var errors_js_1 = require("../utils/errors.js");
var gracefulShutdown_js_1 = require("../utils/gracefulShutdown.js");
var log_js_1 = require("../utils/log.js");
var process_js_1 = require("../utils/process.js");
var sessionIngressAuth_js_1 = require("../utils/sessionIngressAuth.js");
var sessionState_js_1 = require("../utils/sessionState.js");
var sessionStorage_js_1 = require("../utils/sessionStorage.js");
var ndjsonSafeStringify_js_1 = require("./ndjsonSafeStringify.js");
var structuredIO_js_1 = require("./structuredIO.js");
var ccrClient_js_1 = require("./transports/ccrClient.js");
var SSETransport_js_1 = require("./transports/SSETransport.js");
var transportUtils_js_1 = require("./transports/transportUtils.js");
/**
 * Bidirectional streaming for SDK mode with session tracking
 * Supports WebSocket transport
 */
var RemoteIO = /** @class */ (function (_super) {
    __extends(RemoteIO, _super);
    function RemoteIO(streamUrl, initialPrompt, replayUserMessages) {
        var _this = this;
        var _a, _b;
        var inputStream = new stream_1.PassThrough({ encoding: 'utf8' });
        _this = _super.call(this, inputStream, replayUserMessages) || this;
        _this.isBridge = false;
        _this.isDebug = false;
        _this.ccrClient = null;
        _this.keepAliveTimer = null;
        _this.inputStream = inputStream;
        _this.url = new url_1.URL(streamUrl);
        // Prepare headers with session token if available
        var headers = {};
        var sessionToken = (0, sessionIngressAuth_js_1.getSessionIngressAuthToken)();
        if (sessionToken) {
            headers['Authorization'] = "Bearer ".concat(sessionToken);
        }
        else {
            (0, debug_js_1.logForDebugging)('[remote-io] No session ingress token available', {
                level: 'error',
            });
        }
        // Add environment runner version if available (set by Environment Manager)
        var erVersion = process.env.CLAUDE_CODE_ENVIRONMENT_RUNNER_VERSION;
        if (erVersion) {
            headers['x-environment-runner-version'] = erVersion;
        }
        // Provide a callback that re-reads the session token dynamically.
        // When the parent process refreshes the token (via token file or env var),
        // the transport can pick it up on reconnection.
        var refreshHeaders = function () {
            var h = {};
            var freshToken = (0, sessionIngressAuth_js_1.getSessionIngressAuthToken)();
            if (freshToken) {
                h['Authorization'] = "Bearer ".concat(freshToken);
            }
            var freshErVersion = process.env.CLAUDE_CODE_ENVIRONMENT_RUNNER_VERSION;
            if (freshErVersion) {
                h['x-environment-runner-version'] = freshErVersion;
            }
            return h;
        };
        // Get appropriate transport based on URL protocol
        _this.transport = (0, transportUtils_js_1.getTransportForUrl)(_this.url, headers, (0, state_js_1.getSessionId)(), refreshHeaders);
        // Set up data callback
        _this.isBridge = process.env.CLAUDE_CODE_ENVIRONMENT_KIND === 'bridge';
        _this.isDebug = (0, debug_js_1.isDebugMode)();
        _this.transport.setOnData(function (data) {
            _this.inputStream.write(data);
            if (_this.isBridge && _this.isDebug) {
                (0, process_js_1.writeToStdout)(data.endsWith('\n') ? data : data + '\n');
            }
        });
        // Set up close callback to handle connection failures
        _this.transport.setOnClose(function () {
            // End the input stream to trigger graceful shutdown
            _this.inputStream.end();
        });
        // Initialize CCR v2 client (heartbeats, epoch, state reporting, event writes).
        // The CCRClient constructor wires the SSE received-ack handler
        // synchronously, so new CCRClient() MUST run before transport.connect() —
        // otherwise early SSE frames hit an unwired onEventCallback and their
        // 'received' delivery acks are silently dropped.
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_CCR_V2)) {
            // CCR v2 is SSE+POST by definition. getTransportForUrl returns
            // SSETransport under the same env var, but the two checks live in
            // different files — assert the invariant so a future decoupling
            // fails loudly here instead of confusingly inside CCRClient.
            if (!(_this.transport instanceof SSETransport_js_1.SSETransport)) {
                throw new Error('CCR v2 requires SSETransport; check getTransportForUrl');
            }
            _this.ccrClient = new ccrClient_js_1.CCRClient(_this.transport, _this.url);
            var init = _this.ccrClient.initialize();
            _this.restoredWorkerState = init.catch(function () { return null; });
            init.catch(function (error) {
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_worker_lifecycle_init_failed', {
                    reason: error instanceof ccrClient_js_1.CCRInitError ? error.reason : 'unknown',
                });
                (0, log_js_1.logError)(new Error("CCRClient initialization failed: ".concat((0, errors_js_1.errorMessage)(error))));
                void (0, gracefulShutdown_js_1.gracefulShutdown)(1, 'other');
            });
            (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                return [2 /*return*/, (_a = this.ccrClient) === null || _a === void 0 ? void 0 : _a.close()];
            }); }); });
            // Register internal event writer for transcript persistence.
            // When set, sessionStorage writes transcript messages as CCR v2
            // internal events instead of v1 Session Ingress.
            (0, sessionStorage_js_1.setInternalEventWriter)(function (eventType, payload, options) {
                return _this.ccrClient.writeInternalEvent(eventType, payload, options);
            });
            // Register internal event readers for session resume.
            // When set, hydrateFromCCRv2InternalEvents() can fetch foreground
            // and subagent internal events to reconstruct conversation state.
            (0, sessionStorage_js_1.setInternalEventReader)(function () { return _this.ccrClient.readInternalEvents(); }, function () { return _this.ccrClient.readSubagentInternalEvents(); });
            var LIFECYCLE_TO_DELIVERY_1 = {
                started: 'processing',
                completed: 'processed',
            };
            (0, commandLifecycle_js_1.setCommandLifecycleListener)(function (uuid, state) {
                var _a;
                (_a = _this.ccrClient) === null || _a === void 0 ? void 0 : _a.reportDelivery(uuid, LIFECYCLE_TO_DELIVERY_1[state]);
            });
            (0, sessionState_js_1.setSessionStateChangedListener)(function (state, details) {
                var _a;
                (_a = _this.ccrClient) === null || _a === void 0 ? void 0 : _a.reportState(state, details);
            });
            (0, sessionState_js_1.setSessionMetadataChangedListener)(function (metadata) {
                var _a;
                (_a = _this.ccrClient) === null || _a === void 0 ? void 0 : _a.reportMetadata(metadata);
            });
        }
        // Start connection only after all callbacks are wired (setOnData above,
        // setOnEvent inside new CCRClient() when CCR v2 is enabled).
        void _this.transport.connect();
        // Push a silent keep_alive frame on a fixed interval so upstream
        // proxies and the session-ingress layer don't GC an otherwise-idle
        // remote control session. The keep_alive type is filtered before
        // reaching any client UI (Query.ts drops it; structuredIO.ts drops it;
        // web/iOS/Android never see it in their message loop). Interval comes
        // from GrowthBook (tengu_bridge_poll_interval_config
        // session_keepalive_interval_v2_ms, default 120s); 0 = disabled.
        // Bridge-only: fixes Envoy idle timeout on bridge-topology sessions
        // (#21931). byoc workers ran without this before #21931 and do not
        // need it — different network path.
        var keepAliveIntervalMs = (0, pollConfig_js_1.getPollIntervalConfig)().session_keepalive_interval_v2_ms;
        if (_this.isBridge && keepAliveIntervalMs > 0) {
            _this.keepAliveTimer = setInterval(function () {
                (0, debug_js_1.logForDebugging)('[remote-io] keep_alive sent');
                void _this.write({ type: 'keep_alive' }).catch(function (err) {
                    (0, debug_js_1.logForDebugging)("[remote-io] keep_alive write failed: ".concat((0, errors_js_1.errorMessage)(err)));
                });
            }, keepAliveIntervalMs);
            (_b = (_a = _this.keepAliveTimer).unref) === null || _b === void 0 ? void 0 : _b.call(_a);
        }
        // Register for graceful shutdown cleanup
        (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, this.close()];
        }); }); });
        // If initial prompt is provided, send it through the input stream
        if (initialPrompt) {
            // Convert the initial prompt to the input stream format.
            // Chunks from stdin may already contain trailing newlines, so strip
            // them before appending our own to avoid double-newline issues that
            // cause structuredIO to parse empty lines. String() handles both
            // string chunks and Buffer objects from process.stdin.
            var stream_2 = _this.inputStream;
            void (function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, initialPrompt_1, initialPrompt_1_1, chunk, e_1_1;
                var _b, e_1, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 5, 6, 11]);
                            _a = true, initialPrompt_1 = __asyncValues(initialPrompt);
                            _e.label = 1;
                        case 1: return [4 /*yield*/, initialPrompt_1.next()];
                        case 2:
                            if (!(initialPrompt_1_1 = _e.sent(), _b = initialPrompt_1_1.done, !_b)) return [3 /*break*/, 4];
                            _d = initialPrompt_1_1.value;
                            _a = false;
                            chunk = _d;
                            stream_2.write(String(chunk).replace(/\n$/, '') + '\n');
                            _e.label = 3;
                        case 3:
                            _a = true;
                            return [3 /*break*/, 1];
                        case 4: return [3 /*break*/, 11];
                        case 5:
                            e_1_1 = _e.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 11];
                        case 6:
                            _e.trys.push([6, , 9, 10]);
                            if (!(!_a && !_b && (_c = initialPrompt_1.return))) return [3 /*break*/, 8];
                            return [4 /*yield*/, _c.call(initialPrompt_1)];
                        case 7:
                            _e.sent();
                            _e.label = 8;
                        case 8: return [3 /*break*/, 10];
                        case 9:
                            if (e_1) throw e_1.error;
                            return [7 /*endfinally*/];
                        case 10: return [7 /*endfinally*/];
                        case 11: return [2 /*return*/];
                    }
                });
            }); })();
        }
        return _this;
    }
    RemoteIO.prototype.flushInternalEvents = function () {
        var _a, _b;
        return (_b = (_a = this.ccrClient) === null || _a === void 0 ? void 0 : _a.flushInternalEvents()) !== null && _b !== void 0 ? _b : Promise.resolve();
    };
    Object.defineProperty(RemoteIO.prototype, "internalEventsPending", {
        get: function () {
            var _a, _b;
            return (_b = (_a = this.ccrClient) === null || _a === void 0 ? void 0 : _a.internalEventsPending) !== null && _b !== void 0 ? _b : 0;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Send output to the transport.
     * In bridge mode, control_request messages are always echoed to stdout so the
     * bridge parent can detect permission requests. Other messages are echoed only
     * in debug mode.
     */
    RemoteIO.prototype.write = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.ccrClient) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.ccrClient.writeEvent(message)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.transport.write(message)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (this.isBridge) {
                            if (message.type === 'control_request' || this.isDebug) {
                                (0, process_js_1.writeToStdout)((0, ndjsonSafeStringify_js_1.ndjsonSafeStringify)(message) + '\n');
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up connections gracefully
     */
    RemoteIO.prototype.close = function () {
        if (this.keepAliveTimer) {
            clearInterval(this.keepAliveTimer);
            this.keepAliveTimer = null;
        }
        this.transport.close();
        this.inputStream.end();
    };
    return RemoteIO;
}(structuredIO_js_1.StructuredIO));
exports.RemoteIO = RemoteIO;
