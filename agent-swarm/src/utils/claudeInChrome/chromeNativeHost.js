"use strict";
// biome-ignore-all lint/suspicious/noConsole: file uses console intentionally
/**
 * Chrome Native Host - Pure TypeScript Implementation
 *
 * This module provides the Chrome native messaging host functionality,
 * previously implemented as a Rust NAPI binding but now in pure TypeScript.
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
exports.sendChromeMessage = sendChromeMessage;
exports.runChromeNativeHost = runChromeNativeHost;
var promises_1 = require("fs/promises");
var net_1 = require("net");
var os_1 = require("os");
var path_1 = require("path");
var zod_1 = require("zod");
var lazySchema_js_1 = require("../lazySchema.js");
var slowOperations_js_1 = require("../slowOperations.js");
var common_js_1 = require("./common.js");
var VERSION = '1.0.0';
var MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB - Max message size that can be sent to Chrome
var LOG_FILE = process.env.USER_TYPE === 'ant'
    ? (0, path_1.join)((0, os_1.homedir)(), '.claude', 'debug', 'chrome-native-host.txt')
    : undefined;
function log(message) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (LOG_FILE) {
        var timestamp = new Date().toISOString();
        var formattedArgs = args.length > 0 ? ' ' + (0, slowOperations_js_1.jsonStringify)(args) : '';
        var logLine = "[".concat(timestamp, "] [Claude Chrome Native Host] ").concat(message).concat(formattedArgs, "\n");
        // Fire-and-forget: logging is best-effort and callers (including event
        // handlers) don't await
        void (0, promises_1.appendFile)(LOG_FILE, logLine).catch(function () {
            // Ignore file write errors
        });
    }
    console.error.apply(console, __spreadArray(["[Claude Chrome Native Host] ".concat(message)], args, false));
}
/**
 * Send a message to stdout (Chrome native messaging protocol)
 */
function sendChromeMessage(message) {
    var jsonBytes = Buffer.from(message, 'utf-8');
    var lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32LE(jsonBytes.length, 0);
    process.stdout.write(lengthBuffer);
    process.stdout.write(jsonBytes);
}
function runChromeNativeHost() {
    return __awaiter(this, void 0, void 0, function () {
        var host, messageReader, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log('Initializing...');
                    host = new ChromeNativeHost();
                    messageReader = new ChromeMessageReader();
                    // Start the native host server
                    return [4 /*yield*/, host.start()
                        // Process messages from Chrome until stdin closes
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    ];
                case 1:
                    // Start the native host server
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 5];
                    return [4 /*yield*/, messageReader.read()];
                case 3:
                    message = _a.sent();
                    if (message === null) {
                        // stdin closed, Chrome disconnected
                        return [3 /*break*/, 5];
                    }
                    return [4 /*yield*/, host.handleMessage(message)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 2];
                case 5: 
                // Stop the server
                return [4 /*yield*/, host.stop()];
                case 6:
                    // Stop the server
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var messageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return zod_1.z
        .object({
        type: zod_1.z.string(),
    })
        .passthrough();
});
var ChromeNativeHost = /** @class */ (function () {
    function ChromeNativeHost() {
        this.mcpClients = new Map();
        this.nextClientId = 1;
        this.server = null;
        this.running = false;
        this.socketPath = null;
    }
    ChromeNativeHost.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var socketDir, dirStats, _a, files, _i, files_1, file, pid, _b, _c, e_1;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (this.running) {
                            return [2 /*return*/];
                        }
                        this.socketPath = (0, common_js_1.getSecureSocketPath)();
                        if (!((0, os_1.platform)() !== 'win32')) return [3 /*break*/, 18];
                        socketDir = (0, common_js_1.getSocketDir)();
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, (0, promises_1.stat)(socketDir)];
                    case 2:
                        dirStats = _d.sent();
                        if (!!dirStats.isDirectory()) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, promises_1.unlink)(socketDir)];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        _a = _d.sent();
                        return [3 /*break*/, 6];
                    case 6: 
                    // Create socket directory with secure permissions
                    return [4 /*yield*/, (0, promises_1.mkdir)(socketDir, { recursive: true, mode: 448 })
                        // Fix perms if directory already existed
                    ];
                    case 7:
                        // Create socket directory with secure permissions
                        _d.sent();
                        // Fix perms if directory already existed
                        return [4 /*yield*/, (0, promises_1.chmod)(socketDir, 448).catch(function () {
                                // Ignore
                            })
                            // Clean up stale sockets
                        ];
                    case 8:
                        // Fix perms if directory already existed
                        _d.sent();
                        _d.label = 9;
                    case 9:
                        _d.trys.push([9, 17, , 18]);
                        return [4 /*yield*/, (0, promises_1.readdir)(socketDir)];
                    case 10:
                        files = _d.sent();
                        _i = 0, files_1 = files;
                        _d.label = 11;
                    case 11:
                        if (!(_i < files_1.length)) return [3 /*break*/, 16];
                        file = files_1[_i];
                        if (!file.endsWith('.sock')) {
                            return [3 /*break*/, 15];
                        }
                        pid = parseInt(file.replace('.sock', ''), 10);
                        if (isNaN(pid)) {
                            return [3 /*break*/, 15];
                        }
                        _d.label = 12;
                    case 12:
                        _d.trys.push([12, 13, , 15]);
                        process.kill(pid, 0);
                        return [3 /*break*/, 15];
                    case 13:
                        _b = _d.sent();
                        // Process is dead, remove stale socket
                        return [4 /*yield*/, (0, promises_1.unlink)((0, path_1.join)(socketDir, file)).catch(function () {
                                // Ignore
                            })];
                    case 14:
                        // Process is dead, remove stale socket
                        _d.sent();
                        log("Removed stale socket for PID ".concat(pid));
                        return [3 /*break*/, 15];
                    case 15:
                        _i++;
                        return [3 /*break*/, 11];
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        _c = _d.sent();
                        return [3 /*break*/, 18];
                    case 18:
                        log("Creating socket listener: ".concat(this.socketPath));
                        this.server = (0, net_1.createServer)(function (socket) { return _this.handleMcpClient(socket); });
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                _this.server.listen(_this.socketPath, function () {
                                    log('Socket server listening for connections');
                                    _this.running = true;
                                    resolve();
                                });
                                _this.server.on('error', function (err) {
                                    log('Socket server error:', err);
                                    reject(err);
                                });
                            })
                            // Set permissions on Unix (after listen resolves so socket file exists)
                        ];
                    case 19:
                        _d.sent();
                        if (!((0, os_1.platform)() !== 'win32')) return [3 /*break*/, 23];
                        _d.label = 20;
                    case 20:
                        _d.trys.push([20, 22, , 23]);
                        return [4 /*yield*/, (0, promises_1.chmod)(this.socketPath, 384)];
                    case 21:
                        _d.sent();
                        log('Socket permissions set to 0600');
                        return [3 /*break*/, 23];
                    case 22:
                        e_1 = _d.sent();
                        log('Failed to set socket permissions:', e_1);
                        return [3 /*break*/, 23];
                    case 23: return [2 /*return*/];
                }
            });
        });
    };
    ChromeNativeHost.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, client, _c, socketDir, remaining, _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!this.running) {
                            return [2 /*return*/];
                        }
                        // Close all MCP clients
                        for (_i = 0, _a = this.mcpClients; _i < _a.length; _i++) {
                            _b = _a[_i], client = _b[1];
                            client.socket.destroy();
                        }
                        this.mcpClients.clear();
                        if (!this.server) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) {
                                _this.server.close(function () { return resolve(); });
                            })];
                    case 1:
                        _e.sent();
                        this.server = null;
                        _e.label = 2;
                    case 2:
                        if (!((0, os_1.platform)() !== 'win32' && this.socketPath)) return [3 /*break*/, 11];
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, (0, promises_1.unlink)(this.socketPath)];
                    case 4:
                        _e.sent();
                        log('Cleaned up socket file');
                        return [3 /*break*/, 6];
                    case 5:
                        _c = _e.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        _e.trys.push([6, 10, , 11]);
                        socketDir = (0, common_js_1.getSocketDir)();
                        return [4 /*yield*/, (0, promises_1.readdir)(socketDir)];
                    case 7:
                        remaining = _e.sent();
                        if (!(remaining.length === 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, (0, promises_1.rmdir)(socketDir)];
                    case 8:
                        _e.sent();
                        log('Removed empty socket directory');
                        _e.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        _d = _e.sent();
                        return [3 /*break*/, 11];
                    case 11:
                        this.running = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    ChromeNativeHost.prototype.isRunning = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.running];
            });
        });
    };
    ChromeNativeHost.prototype.getClientCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.mcpClients.size];
            });
        });
    };
    ChromeNativeHost.prototype.handleMessage = function (messageJson) {
        return __awaiter(this, void 0, void 0, function () {
            var rawMessage, parsed, message, _1, data, responseData, lengthBuffer, responseMsg, _i, _a, _b, id, client, _2, data, notificationData, lengthBuffer, notificationMsg, _c, _d, _e, id, client;
            return __generator(this, function (_f) {
                try {
                    rawMessage = (0, slowOperations_js_1.jsonParse)(messageJson);
                }
                catch (e) {
                    log('Invalid JSON from Chrome:', e.message);
                    sendChromeMessage((0, slowOperations_js_1.jsonStringify)({
                        type: 'error',
                        error: 'Invalid message format',
                    }));
                    return [2 /*return*/];
                }
                parsed = messageSchema().safeParse(rawMessage);
                if (!parsed.success) {
                    log('Invalid message from Chrome:', parsed.error.message);
                    sendChromeMessage((0, slowOperations_js_1.jsonStringify)({
                        type: 'error',
                        error: 'Invalid message format',
                    }));
                    return [2 /*return*/];
                }
                message = parsed.data;
                log("Handling Chrome message type: ".concat(message.type));
                switch (message.type) {
                    case 'ping':
                        log('Responding to ping');
                        sendChromeMessage((0, slowOperations_js_1.jsonStringify)({
                            type: 'pong',
                            timestamp: Date.now(),
                        }));
                        break;
                    case 'get_status':
                        sendChromeMessage((0, slowOperations_js_1.jsonStringify)({
                            type: 'status_response',
                            native_host_version: VERSION,
                        }));
                        break;
                    case 'tool_response': {
                        if (this.mcpClients.size > 0) {
                            log("Forwarding tool response to ".concat(this.mcpClients.size, " MCP clients"));
                            _1 = message.type, data = __rest(message, ["type"]);
                            responseData = Buffer.from((0, slowOperations_js_1.jsonStringify)(data), 'utf-8');
                            lengthBuffer = Buffer.alloc(4);
                            lengthBuffer.writeUInt32LE(responseData.length, 0);
                            responseMsg = Buffer.concat([lengthBuffer, responseData]);
                            for (_i = 0, _a = this.mcpClients; _i < _a.length; _i++) {
                                _b = _a[_i], id = _b[0], client = _b[1];
                                try {
                                    client.socket.write(responseMsg);
                                }
                                catch (e) {
                                    log("Failed to send to MCP client ".concat(id, ":"), e);
                                }
                            }
                        }
                        break;
                    }
                    case 'notification': {
                        if (this.mcpClients.size > 0) {
                            log("Forwarding notification to ".concat(this.mcpClients.size, " MCP clients"));
                            _2 = message.type, data = __rest(message, ["type"]);
                            notificationData = Buffer.from((0, slowOperations_js_1.jsonStringify)(data), 'utf-8');
                            lengthBuffer = Buffer.alloc(4);
                            lengthBuffer.writeUInt32LE(notificationData.length, 0);
                            notificationMsg = Buffer.concat([
                                lengthBuffer,
                                notificationData,
                            ]);
                            for (_c = 0, _d = this.mcpClients; _c < _d.length; _c++) {
                                _e = _d[_c], id = _e[0], client = _e[1];
                                try {
                                    client.socket.write(notificationMsg);
                                }
                                catch (e) {
                                    log("Failed to send notification to MCP client ".concat(id, ":"), e);
                                }
                            }
                        }
                        break;
                    }
                    default:
                        log("Unknown message type: ".concat(message.type));
                        sendChromeMessage((0, slowOperations_js_1.jsonStringify)({
                            type: 'error',
                            error: "Unknown message type: ".concat(message.type),
                        }));
                }
                return [2 /*return*/];
            });
        });
    };
    ChromeNativeHost.prototype.handleMcpClient = function (socket) {
        var _this = this;
        var clientId = this.nextClientId++;
        var client = {
            id: clientId,
            socket: socket,
            buffer: Buffer.alloc(0),
        };
        this.mcpClients.set(clientId, client);
        log("MCP client ".concat(clientId, " connected. Total clients: ").concat(this.mcpClients.size));
        // Notify Chrome of connection
        sendChromeMessage((0, slowOperations_js_1.jsonStringify)({
            type: 'mcp_connected',
        }));
        socket.on('data', function (data) {
            client.buffer = Buffer.concat([client.buffer, data]);
            // Process complete messages
            while (client.buffer.length >= 4) {
                var length_1 = client.buffer.readUInt32LE(0);
                if (length_1 === 0 || length_1 > MAX_MESSAGE_SIZE) {
                    log("Invalid message length from MCP client ".concat(clientId, ": ").concat(length_1));
                    socket.destroy();
                    return;
                }
                if (client.buffer.length < 4 + length_1) {
                    break; // Wait for more data
                }
                var messageBytes = client.buffer.slice(4, 4 + length_1);
                client.buffer = client.buffer.slice(4 + length_1);
                try {
                    var request = (0, slowOperations_js_1.jsonParse)(messageBytes.toString('utf-8'));
                    log("Forwarding tool request from MCP client ".concat(clientId, ": ").concat(request.method));
                    // Forward to Chrome
                    sendChromeMessage((0, slowOperations_js_1.jsonStringify)({
                        type: 'tool_request',
                        method: request.method,
                        params: request.params,
                    }));
                }
                catch (e) {
                    log("Failed to parse tool request from MCP client ".concat(clientId, ":"), e);
                }
            }
        });
        socket.on('error', function (err) {
            log("MCP client ".concat(clientId, " error: ").concat(err));
        });
        socket.on('close', function () {
            log("MCP client ".concat(clientId, " disconnected. Remaining clients: ").concat(_this.mcpClients.size - 1));
            _this.mcpClients.delete(clientId);
            // Notify Chrome of disconnection
            sendChromeMessage((0, slowOperations_js_1.jsonStringify)({
                type: 'mcp_disconnected',
            }));
        });
    };
    return ChromeNativeHost;
}());
/**
 * Chrome message reader using async stdin. Synchronous reads can crash Bun, so we use
 * async reads with a buffer.
 */
var ChromeMessageReader = /** @class */ (function () {
    function ChromeMessageReader() {
        var _this = this;
        this.buffer = Buffer.alloc(0);
        this.pendingResolve = null;
        this.closed = false;
        process.stdin.on('data', function (chunk) {
            _this.buffer = Buffer.concat([_this.buffer, chunk]);
            _this.tryProcessMessage();
        });
        process.stdin.on('end', function () {
            _this.closed = true;
            if (_this.pendingResolve) {
                _this.pendingResolve(null);
                _this.pendingResolve = null;
            }
        });
        process.stdin.on('error', function () {
            _this.closed = true;
            if (_this.pendingResolve) {
                _this.pendingResolve(null);
                _this.pendingResolve = null;
            }
        });
    }
    ChromeMessageReader.prototype.tryProcessMessage = function () {
        if (!this.pendingResolve) {
            return;
        }
        // Need at least 4 bytes for length prefix
        if (this.buffer.length < 4) {
            return;
        }
        var length = this.buffer.readUInt32LE(0);
        if (length === 0 || length > MAX_MESSAGE_SIZE) {
            log("Invalid message length: ".concat(length));
            this.pendingResolve(null);
            this.pendingResolve = null;
            return;
        }
        // Check if we have the full message
        if (this.buffer.length < 4 + length) {
            return; // Wait for more data
        }
        // Extract the message
        var messageBytes = this.buffer.subarray(4, 4 + length);
        this.buffer = this.buffer.subarray(4 + length);
        var message = messageBytes.toString('utf-8');
        this.pendingResolve(message);
        this.pendingResolve = null;
    };
    ChromeMessageReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var length_2, messageBytes;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.closed) {
                    return [2 /*return*/, null];
                }
                // Check if we already have a complete message buffered
                if (this.buffer.length >= 4) {
                    length_2 = this.buffer.readUInt32LE(0);
                    if (length_2 > 0 &&
                        length_2 <= MAX_MESSAGE_SIZE &&
                        this.buffer.length >= 4 + length_2) {
                        messageBytes = this.buffer.subarray(4, 4 + length_2);
                        this.buffer = this.buffer.subarray(4 + length_2);
                        return [2 /*return*/, messageBytes.toString('utf-8')];
                    }
                }
                // Wait for more data
                return [2 /*return*/, new Promise(function (resolve) {
                        _this.pendingResolve = resolve;
                        // In case data arrived between check and setting pendingResolve
                        _this.tryProcessMessage();
                    })];
            });
        });
    };
    return ChromeMessageReader;
}());
