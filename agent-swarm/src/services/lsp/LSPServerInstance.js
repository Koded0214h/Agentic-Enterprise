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
exports.createLSPServerInstance = createLSPServerInstance;
var path = require("path");
var url_1 = require("url");
var cwd_js_1 = require("../../utils/cwd.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var sleep_js_1 = require("../../utils/sleep.js");
/**
 * LSP error code for "content modified" - indicates the server's state changed
 * during request processing (e.g., rust-analyzer still indexing the project).
 * This is a transient error that can be retried.
 */
var LSP_ERROR_CONTENT_MODIFIED = -32801;
/**
 * Maximum number of retries for transient LSP errors like "content modified".
 */
var MAX_RETRIES_FOR_TRANSIENT_ERRORS = 3;
/**
 * Base delay in milliseconds for exponential backoff on transient errors.
 * Actual delays: 500ms, 1000ms, 2000ms
 */
var RETRY_BASE_DELAY_MS = 500;
/**
 * Creates and manages a single LSP server instance.
 *
 * Uses factory function pattern with closures for state encapsulation (avoiding classes).
 * Provides state tracking, health monitoring, and request forwarding for an LSP server.
 * Supports manual restart with configurable retry limits.
 *
 * State machine transitions:
 * - stopped → starting → running
 * - running → stopping → stopped
 * - any → error (on failure)
 * - error → starting (on retry)
 *
 * @param name - Unique identifier for this server instance
 * @param config - Server configuration including command, args, and limits
 * @returns LSP server instance with lifecycle management methods
 *
 * @example
 * const instance = createLSPServerInstance('my-server', config)
 * await instance.start()
 * const result = await instance.sendRequest('textDocument/definition', params)
 * await instance.stop()
 */
function createLSPServerInstance(name, config) {
    // Validate that unimplemented fields are not set
    if (config.restartOnCrash !== undefined) {
        throw new Error("LSP server '".concat(name, "': restartOnCrash is not yet implemented. Remove this field from the configuration."));
    }
    if (config.shutdownTimeout !== undefined) {
        throw new Error("LSP server '".concat(name, "': shutdownTimeout is not yet implemented. Remove this field from the configuration."));
    }
    // Private state encapsulated via closures. Lazy-require LSPClient so
    // vscode-jsonrpc (~129KB) only loads when an LSP server is actually
    // instantiated, not when the static import chain reaches this module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    var createLSPClient = require('./LSPClient.js').createLSPClient;
    var state = 'stopped';
    var startTime;
    var lastError;
    var restartCount = 0;
    var crashRecoveryCount = 0;
    // Propagate crash state so ensureServerStarted can restart on next use.
    // Without this, state stays 'running' after crash and the server is never
    // restarted (zombie state).
    var client = createLSPClient(name, function (error) {
        state = 'error';
        lastError = error;
        crashRecoveryCount++;
    });
    /**
     * Starts the LSP server and initializes it with workspace information.
     *
     * If the server is already running or starting, this method returns immediately.
     * On failure, sets state to 'error', logs for monitoring, and throws.
     *
     * @throws {Error} If server fails to start or initialize
     */
    function start() {
        return __awaiter(this, void 0, void 0, function () {
            var maxRestarts, error, initPromise, workspaceFolder, workspaceUri, initParams, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (state === 'running' || state === 'starting') {
                            return [2 /*return*/];
                        }
                        maxRestarts = (_a = config.maxRestarts) !== null && _a !== void 0 ? _a : 3;
                        if (state === 'error' && crashRecoveryCount > maxRestarts) {
                            error = new Error("LSP server '".concat(name, "' exceeded max crash recovery attempts (").concat(maxRestarts, ")"));
                            lastError = error;
                            (0, log_js_1.logError)(error);
                            throw error;
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 7, , 8]);
                        state = 'starting';
                        (0, debug_js_1.logForDebugging)("Starting LSP server instance: ".concat(name));
                        // Start the client
                        return [4 /*yield*/, client.start(config.command, config.args || [], {
                                env: config.env,
                                cwd: config.workspaceFolder,
                            })
                            // Initialize with workspace info
                        ];
                    case 2:
                        // Start the client
                        _c.sent();
                        workspaceFolder = config.workspaceFolder || (0, cwd_js_1.getCwd)();
                        workspaceUri = (0, url_1.pathToFileURL)(workspaceFolder).href;
                        initParams = {
                            processId: process.pid,
                            // Pass server-specific initialization options from plugin config
                            // Required by vue-language-server, optional for others
                            // Provide empty object as default to avoid undefined errors in servers
                            // that expect this field to exist
                            initializationOptions: (_b = config.initializationOptions) !== null && _b !== void 0 ? _b : {},
                            // Modern approach (LSP 3.16+) - required for Pyright, gopls
                            workspaceFolders: [
                                {
                                    uri: workspaceUri,
                                    name: path.basename(workspaceFolder),
                                },
                            ],
                            // Deprecated fields - some servers still need these for proper URI resolution
                            rootPath: workspaceFolder, // Deprecated in LSP 3.8 but needed by some servers
                            rootUri: workspaceUri, // Deprecated in LSP 3.16 but needed by typescript-language-server for goToDefinition
                            // Client capabilities - declare what features we support
                            capabilities: {
                                workspace: {
                                    // Don't claim to support workspace/configuration since we don't implement it
                                    // This prevents servers from requesting config we can't provide
                                    configuration: false,
                                    // Don't claim to support workspace folders changes since we don't handle
                                    // workspace/didChangeWorkspaceFolders notifications
                                    workspaceFolders: false,
                                },
                                textDocument: {
                                    synchronization: {
                                        dynamicRegistration: false,
                                        willSave: false,
                                        willSaveWaitUntil: false,
                                        didSave: true,
                                    },
                                    publishDiagnostics: {
                                        relatedInformation: true,
                                        tagSupport: {
                                            valueSet: [1, 2], // Unnecessary (1), Deprecated (2)
                                        },
                                        versionSupport: false,
                                        codeDescriptionSupport: true,
                                        dataSupport: false,
                                    },
                                    hover: {
                                        dynamicRegistration: false,
                                        contentFormat: ['markdown', 'plaintext'],
                                    },
                                    definition: {
                                        dynamicRegistration: false,
                                        linkSupport: true,
                                    },
                                    references: {
                                        dynamicRegistration: false,
                                    },
                                    documentSymbol: {
                                        dynamicRegistration: false,
                                        hierarchicalDocumentSymbolSupport: true,
                                    },
                                    callHierarchy: {
                                        dynamicRegistration: false,
                                    },
                                },
                                general: {
                                    positionEncodings: ['utf-16'],
                                },
                            },
                        };
                        initPromise = client.initialize(initParams);
                        if (!(config.startupTimeout !== undefined)) return [3 /*break*/, 4];
                        return [4 /*yield*/, withTimeout(initPromise, config.startupTimeout, "LSP server '".concat(name, "' timed out after ").concat(config.startupTimeout, "ms during initialization"))];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, initPromise];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        state = 'running';
                        startTime = new Date();
                        crashRecoveryCount = 0;
                        (0, debug_js_1.logForDebugging)("LSP server instance started: ".concat(name));
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _c.sent();
                        // Clean up the spawned child process on timeout/error
                        client.stop().catch(function () { });
                        // Prevent unhandled rejection from abandoned initialize promise
                        initPromise === null || initPromise === void 0 ? void 0 : initPromise.catch(function () { });
                        state = 'error';
                        lastError = error_1;
                        (0, log_js_1.logError)(error_1);
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    }
    /**
     * Stops the LSP server gracefully.
     *
     * If already stopped or stopping, returns immediately.
     * On failure, sets state to 'error', logs for monitoring, and throws.
     *
     * @throws {Error} If server fails to stop
     */
    function stop() {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (state === 'stopped' || state === 'stopping') {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        state = 'stopping';
                        return [4 /*yield*/, client.stop()];
                    case 2:
                        _a.sent();
                        state = 'stopped';
                        (0, debug_js_1.logForDebugging)("LSP server instance stopped: ".concat(name));
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        state = 'error';
                        lastError = error_2;
                        (0, log_js_1.logError)(error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    /**
     * Manually restarts the server by stopping and starting it.
     *
     * Increments restartCount and enforces maxRestarts limit.
     * Note: This is NOT automatic - must be called explicitly.
     *
     * @throws {Error} If stop or start fails, or if restartCount exceeds config.maxRestarts (default: 3)
     */
    function restart() {
        return __awaiter(this, void 0, void 0, function () {
            var error_3, stopError, maxRestarts, error, error_4, startError;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, stop()];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        stopError = new Error("Failed to stop LSP server '".concat(name, "' during restart: ").concat((0, errors_js_1.errorMessage)(error_3)));
                        (0, log_js_1.logError)(stopError);
                        throw stopError;
                    case 3:
                        restartCount++;
                        maxRestarts = (_a = config.maxRestarts) !== null && _a !== void 0 ? _a : 3;
                        if (restartCount > maxRestarts) {
                            error = new Error("Max restart attempts (".concat(maxRestarts, ") exceeded for server '").concat(name, "'"));
                            (0, log_js_1.logError)(error);
                            throw error;
                        }
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, start()];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_4 = _b.sent();
                        startError = new Error("Failed to start LSP server '".concat(name, "' during restart (attempt ").concat(restartCount, "/").concat(maxRestarts, "): ").concat((0, errors_js_1.errorMessage)(error_4)));
                        (0, log_js_1.logError)(startError);
                        throw startError;
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    /**
     * Checks if the server is healthy and ready to handle requests.
     *
     * @returns true if state is 'running' AND the client has completed initialization
     */
    function isHealthy() {
        return state === 'running' && client.isInitialized;
    }
    /**
     * Sends an LSP request to the server with retry logic for transient errors.
     *
     * Checks server health before sending and wraps errors with context.
     * Automatically retries on "content modified" errors (code -32801) which occur
     * when servers like rust-analyzer are still indexing. This is expected LSP behavior
     * and clients should retry silently per the LSP specification.
     *
     * @param method - LSP method name (e.g., 'textDocument/definition')
     * @param params - Method-specific parameters
     * @returns The server's response
     * @throws {Error} If server is not healthy or request fails after all retries
     */
    function sendRequest(method, params) {
        return __awaiter(this, void 0, void 0, function () {
            var error, lastAttemptError, attempt, error_5, errorCode, isContentModifiedError, delay, requestError;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!isHealthy()) {
                            error = new Error("Cannot send request to LSP server '".concat(name, "': server is ").concat(state) +
                                "".concat(lastError ? ", last error: ".concat(lastError.message) : ''));
                            (0, log_js_1.logError)(error);
                            throw error;
                        }
                        attempt = 0;
                        _b.label = 1;
                    case 1:
                        if (!(attempt <= MAX_RETRIES_FOR_TRANSIENT_ERRORS)) return [3 /*break*/, 8];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 7]);
                        return [4 /*yield*/, client.sendRequest(method, params)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        error_5 = _b.sent();
                        lastAttemptError = error_5;
                        errorCode = error_5.code;
                        isContentModifiedError = typeof errorCode === 'number' &&
                            errorCode === LSP_ERROR_CONTENT_MODIFIED;
                        if (!(isContentModifiedError &&
                            attempt < MAX_RETRIES_FOR_TRANSIENT_ERRORS)) return [3 /*break*/, 6];
                        delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
                        (0, debug_js_1.logForDebugging)("LSP request '".concat(method, "' to '").concat(name, "' got ContentModified error, ") +
                            "retrying in ".concat(delay, "ms (attempt ").concat(attempt + 1, "/").concat(MAX_RETRIES_FOR_TRANSIENT_ERRORS, ")\u2026"));
                        return [4 /*yield*/, (0, sleep_js_1.sleep)(delay)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6: 
                    // Non-retryable error or max retries exceeded
                    return [3 /*break*/, 8];
                    case 7:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 8:
                        requestError = new Error("LSP request '".concat(method, "' failed for server '").concat(name, "': ").concat((_a = lastAttemptError === null || lastAttemptError === void 0 ? void 0 : lastAttemptError.message) !== null && _a !== void 0 ? _a : 'unknown error'));
                        (0, log_js_1.logError)(requestError);
                        throw requestError;
                }
            });
        });
    }
    /**
     * Send a notification to the LSP server (fire-and-forget).
     * Used for file synchronization (didOpen, didChange, didClose).
     */
    function sendNotification(method, params) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_6, notificationError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isHealthy()) {
                            error = new Error("Cannot send notification to LSP server '".concat(name, "': server is ").concat(state));
                            (0, log_js_1.logError)(error);
                            throw error;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, client.sendNotification(method, params)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        notificationError = new Error("LSP notification '".concat(method, "' failed for server '").concat(name, "': ").concat((0, errors_js_1.errorMessage)(error_6)));
                        (0, log_js_1.logError)(notificationError);
                        throw notificationError;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    /**
     * Registers a handler for LSP notifications from the server.
     *
     * @param method - LSP notification method (e.g., 'window/logMessage')
     * @param handler - Callback function to handle the notification
     */
    function onNotification(method, handler) {
        client.onNotification(method, handler);
    }
    /**
     * Registers a handler for LSP requests from the server.
     *
     * Some LSP servers send requests TO the client (reverse direction).
     * This allows registering handlers for such requests.
     *
     * @param method - LSP request method (e.g., 'workspace/configuration')
     * @param handler - Callback function to handle the request and return a response
     */
    function onRequest(method, handler) {
        client.onRequest(method, handler);
    }
    // Return public API
    return {
        name: name,
        config: config,
        get state() {
            return state;
        },
        get startTime() {
            return startTime;
        },
        get lastError() {
            return lastError;
        },
        get restartCount() {
            return restartCount;
        },
        start: start,
        stop: stop,
        restart: restart,
        isHealthy: isHealthy,
        sendRequest: sendRequest,
        sendNotification: sendNotification,
        onNotification: onNotification,
        onRequest: onRequest,
    };
}
/**
 * Race a promise against a timeout. Cleans up the timer regardless of outcome
 * to avoid unhandled rejections from orphaned setTimeout callbacks.
 */
function withTimeout(promise, ms, message) {
    var timer;
    var timeoutPromise = new Promise(function (_, reject) {
        timer = setTimeout(function (rej, msg) { return rej(new Error(msg)); }, ms, reject, message);
    });
    return Promise.race([promise, timeoutPromise]).finally(function () {
        return clearTimeout(timer);
    });
}
