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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLSPClient = createLSPClient;
var child_process_1 = require("child_process");
var node_js_1 = require("vscode-jsonrpc/node.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var subprocessEnv_js_1 = require("../../utils/subprocessEnv.js");
/**
 * Create an LSP client wrapper using vscode-jsonrpc.
 * Manages communication with an LSP server process via stdio.
 *
 * @param onCrash - Called when the server process exits unexpectedly (non-zero
 *   exit code during operation, not during intentional stop). Allows the owner
 *   to propagate crash state so the server can be restarted on next use.
 */
function createLSPClient(serverName, onCrash) {
    // State variables in closure
    var process;
    var connection;
    var capabilities;
    var isInitialized = false;
    var startFailed = false;
    var startError;
    var isStopping = false; // Track intentional shutdown to avoid spurious error logging
    // Queue handlers registered before connection ready (lazy initialization support)
    var pendingHandlers = [];
    var pendingRequestHandlers = [];
    function checkStartFailed() {
        if (startFailed) {
            throw startError || new Error("LSP server ".concat(serverName, " failed to start"));
        }
    }
    return {
        get capabilities() {
            return capabilities;
        },
        get isInitialized() {
            return isInitialized;
        },
        start: function (command, args, options) {
            return __awaiter(this, void 0, void 0, function () {
                var spawnedProcess_1, reader, writer, _i, pendingHandlers_1, _a, method, handler, _b, pendingRequestHandlers_1, _c, method, handler, error_1, err;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 2, , 3]);
                            // 1. Spawn LSP server process
                            process = (0, child_process_1.spawn)(command, args, {
                                stdio: ['pipe', 'pipe', 'pipe'],
                                env: __assign(__assign({}, (0, subprocessEnv_js_1.subprocessEnv)()), options === null || options === void 0 ? void 0 : options.env),
                                cwd: options === null || options === void 0 ? void 0 : options.cwd,
                                // Prevent visible console window on Windows (no-op on other platforms)
                                windowsHide: true,
                            });
                            if (!process.stdout || !process.stdin) {
                                throw new Error('LSP server process stdio not available');
                            }
                            spawnedProcess_1 = process // Capture for closure
                            ;
                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    var onSpawn = function () {
                                        cleanup();
                                        resolve();
                                    };
                                    var onError = function (error) {
                                        cleanup();
                                        reject(error);
                                    };
                                    var cleanup = function () {
                                        spawnedProcess_1.removeListener('spawn', onSpawn);
                                        spawnedProcess_1.removeListener('error', onError);
                                    };
                                    spawnedProcess_1.once('spawn', onSpawn);
                                    spawnedProcess_1.once('error', onError);
                                })
                                // Capture stderr for server diagnostics and errors
                            ];
                        case 1:
                            _d.sent();
                            // Capture stderr for server diagnostics and errors
                            if (process.stderr) {
                                process.stderr.on('data', function (data) {
                                    var output = data.toString().trim();
                                    if (output) {
                                        (0, debug_js_1.logForDebugging)("[LSP SERVER ".concat(serverName, "] ").concat(output));
                                    }
                                });
                            }
                            // Handle process errors (after successful spawn, e.g., crash during operation)
                            process.on('error', function (error) {
                                if (!isStopping) {
                                    startFailed = true;
                                    startError = error;
                                    (0, log_js_1.logError)(new Error("LSP server ".concat(serverName, " failed to start: ").concat(error.message)));
                                }
                            });
                            process.on('exit', function (code, _signal) {
                                if (code !== 0 && code !== null && !isStopping) {
                                    isInitialized = false;
                                    startFailed = false;
                                    startError = undefined;
                                    var crashError = new Error("LSP server ".concat(serverName, " crashed with exit code ").concat(code));
                                    (0, log_js_1.logError)(crashError);
                                    onCrash === null || onCrash === void 0 ? void 0 : onCrash(crashError);
                                }
                            });
                            // Handle stdin stream errors to prevent unhandled promise rejections
                            // when the LSP server process exits before we finish writing
                            process.stdin.on('error', function (error) {
                                if (!isStopping) {
                                    (0, debug_js_1.logForDebugging)("LSP server ".concat(serverName, " stdin error: ").concat(error.message));
                                }
                                // Error is logged but not thrown - the connection error handler will catch this
                            });
                            reader = new node_js_1.StreamMessageReader(process.stdout);
                            writer = new node_js_1.StreamMessageWriter(process.stdin);
                            connection = (0, node_js_1.createMessageConnection)(reader, writer);
                            // 2.5. Register error/close handlers BEFORE listen() to catch all errors
                            // This prevents unhandled promise rejections when the server crashes or closes unexpectedly
                            connection.onError(function (_a) {
                                var error = _a[0], _message = _a[1], _code = _a[2];
                                // Only log if not intentionally stopping (avoid spurious errors during shutdown)
                                if (!isStopping) {
                                    startFailed = true;
                                    startError = error;
                                    (0, log_js_1.logError)(new Error("LSP server ".concat(serverName, " connection error: ").concat(error.message)));
                                }
                            });
                            connection.onClose(function () {
                                // Only treat as error if not intentionally stopping
                                if (!isStopping) {
                                    isInitialized = false;
                                    // Don't set startFailed here - the connection may close after graceful shutdown
                                    (0, debug_js_1.logForDebugging)("LSP server ".concat(serverName, " connection closed"));
                                }
                            });
                            // 3. Start listening for messages
                            connection.listen();
                            // 3.5. Enable protocol tracing for debugging
                            // Note: trace() sends a $/setTrace notification which can fail if the server
                            // process has already exited. We catch and log the error rather than letting
                            // it become an unhandled promise rejection.
                            connection
                                .trace(node_js_1.Trace.Verbose, {
                                log: function (message) {
                                    (0, debug_js_1.logForDebugging)("[LSP PROTOCOL ".concat(serverName, "] ").concat(message));
                                },
                            })
                                .catch(function (error) {
                                (0, debug_js_1.logForDebugging)("Failed to enable tracing for ".concat(serverName, ": ").concat(error.message));
                            });
                            // 4. Apply any queued notification handlers
                            for (_i = 0, pendingHandlers_1 = pendingHandlers; _i < pendingHandlers_1.length; _i++) {
                                _a = pendingHandlers_1[_i], method = _a.method, handler = _a.handler;
                                connection.onNotification(method, handler);
                                (0, debug_js_1.logForDebugging)("Applied queued notification handler for ".concat(serverName, ".").concat(method));
                            }
                            pendingHandlers.length = 0; // Clear the queue
                            // 5. Apply any queued request handlers
                            for (_b = 0, pendingRequestHandlers_1 = pendingRequestHandlers; _b < pendingRequestHandlers_1.length; _b++) {
                                _c = pendingRequestHandlers_1[_b], method = _c.method, handler = _c.handler;
                                connection.onRequest(method, handler);
                                (0, debug_js_1.logForDebugging)("Applied queued request handler for ".concat(serverName, ".").concat(method));
                            }
                            pendingRequestHandlers.length = 0; // Clear the queue
                            (0, debug_js_1.logForDebugging)("LSP client started for ".concat(serverName));
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _d.sent();
                            err = error_1;
                            (0, log_js_1.logError)(new Error("LSP server ".concat(serverName, " failed to start: ").concat(err.message)));
                            throw error_1;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        initialize: function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var result, error_2, err;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!connection) {
                                throw new Error('LSP client not started');
                            }
                            checkStartFailed();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, connection.sendRequest('initialize', params)];
                        case 2:
                            result = _a.sent();
                            capabilities = result.capabilities;
                            // Send initialized notification
                            return [4 /*yield*/, connection.sendNotification('initialized', {})];
                        case 3:
                            // Send initialized notification
                            _a.sent();
                            isInitialized = true;
                            (0, debug_js_1.logForDebugging)("LSP server ".concat(serverName, " initialized"));
                            return [2 /*return*/, result];
                        case 4:
                            error_2 = _a.sent();
                            err = error_2;
                            (0, log_js_1.logError)(new Error("LSP server ".concat(serverName, " initialize failed: ").concat(err.message)));
                            throw error_2;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        sendRequest: function (method, params) {
            return __awaiter(this, void 0, void 0, function () {
                var error_3, err;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!connection) {
                                throw new Error('LSP client not started');
                            }
                            checkStartFailed();
                            if (!isInitialized) {
                                throw new Error('LSP server not initialized');
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, connection.sendRequest(method, params)];
                        case 2: return [2 /*return*/, _a.sent()];
                        case 3:
                            error_3 = _a.sent();
                            err = error_3;
                            (0, log_js_1.logError)(new Error("LSP server ".concat(serverName, " request ").concat(method, " failed: ").concat(err.message)));
                            throw error_3;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        sendNotification: function (method, params) {
            return __awaiter(this, void 0, void 0, function () {
                var error_4, err;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!connection) {
                                throw new Error('LSP client not started');
                            }
                            checkStartFailed();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, connection.sendNotification(method, params)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_4 = _a.sent();
                            err = error_4;
                            (0, log_js_1.logError)(new Error("LSP server ".concat(serverName, " notification ").concat(method, " failed: ").concat(err.message)));
                            // Don't re-throw for notifications - they're fire-and-forget
                            (0, debug_js_1.logForDebugging)("Notification ".concat(method, " failed but continuing"));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        onNotification: function (method, handler) {
            if (!connection) {
                // Queue handler for application when connection is ready (lazy initialization)
                pendingHandlers.push({ method: method, handler: handler });
                (0, debug_js_1.logForDebugging)("Queued notification handler for ".concat(serverName, ".").concat(method, " (connection not ready)"));
                return;
            }
            checkStartFailed();
            connection.onNotification(method, handler);
        },
        onRequest: function (method, handler) {
            if (!connection) {
                // Queue handler for application when connection is ready (lazy initialization)
                pendingRequestHandlers.push({
                    method: method,
                    handler: handler,
                });
                (0, debug_js_1.logForDebugging)("Queued request handler for ".concat(serverName, ".").concat(method, " (connection not ready)"));
                return;
            }
            checkStartFailed();
            connection.onRequest(method, handler);
        },
        stop: function () {
            return __awaiter(this, void 0, void 0, function () {
                var shutdownError, error_5, err;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Mark as stopping to prevent error handlers from logging spurious errors
                            isStopping = true;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, 6, 7]);
                            if (!connection) return [3 /*break*/, 4];
                            // Try to send shutdown request and exit notification
                            return [4 /*yield*/, connection.sendRequest('shutdown', {})];
                        case 2:
                            // Try to send shutdown request and exit notification
                            _a.sent();
                            return [4 /*yield*/, connection.sendNotification('exit', {})];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [3 /*break*/, 7];
                        case 5:
                            error_5 = _a.sent();
                            err = error_5;
                            (0, log_js_1.logError)(new Error("LSP server ".concat(serverName, " stop failed: ").concat(err.message)));
                            shutdownError = err;
                            return [3 /*break*/, 7];
                        case 6:
                            // Always cleanup resources, even if shutdown/exit failed
                            if (connection) {
                                try {
                                    connection.dispose();
                                }
                                catch (error) {
                                    // Log but don't throw - disposal errors are less critical
                                    (0, debug_js_1.logForDebugging)("Connection disposal failed for ".concat(serverName, ": ").concat((0, errors_js_1.errorMessage)(error)));
                                }
                                connection = undefined;
                            }
                            if (process) {
                                // Remove event listeners to prevent memory leaks
                                process.removeAllListeners('error');
                                process.removeAllListeners('exit');
                                if (process.stdin) {
                                    process.stdin.removeAllListeners('error');
                                }
                                if (process.stderr) {
                                    process.stderr.removeAllListeners('data');
                                }
                                try {
                                    process.kill();
                                }
                                catch (error) {
                                    // Process might already be dead, which is fine
                                    (0, debug_js_1.logForDebugging)("Process kill failed for ".concat(serverName, " (may already be dead): ").concat((0, errors_js_1.errorMessage)(error)));
                                }
                                process = undefined;
                            }
                            isInitialized = false;
                            capabilities = undefined;
                            isStopping = false; // Reset for potential restart
                            // Don't reset startFailed - preserve error state for diagnostics
                            // startFailed and startError remain as-is
                            if (shutdownError) {
                                startFailed = true;
                                startError = shutdownError;
                            }
                            (0, debug_js_1.logForDebugging)("LSP client stopped for ".concat(serverName));
                            return [7 /*endfinally*/];
                        case 7:
                            // Re-throw shutdown error after cleanup is complete
                            if (shutdownError) {
                                throw shutdownError;
                            }
                            return [2 /*return*/];
                    }
                });
            });
        },
    };
}
