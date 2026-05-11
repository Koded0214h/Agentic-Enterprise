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
exports.WebSocketTransport = void 0;
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var diagLogs_js_1 = require("./diagLogs.js");
var errors_js_1 = require("./errors.js");
var slowOperations_js_1 = require("./slowOperations.js");
// WebSocket readyState constants (same for both native and ws)
var WS_CONNECTING = 0;
var WS_OPEN = 1;
var WebSocketTransport = /** @class */ (function () {
    function WebSocketTransport(ws) {
        var _this = this;
        this.ws = ws;
        this.started = false;
        this.isBun = typeof Bun !== 'undefined';
        // Bun (native WebSocket) event handlers
        this.onBunMessage = function (event) {
            var _a;
            try {
                var data = typeof event.data === 'string' ? event.data : String(event.data);
                var messageObj = (0, slowOperations_js_1.jsonParse)(data);
                var message = types_js_1.JSONRPCMessageSchema.parse(messageObj);
                (_a = _this.onmessage) === null || _a === void 0 ? void 0 : _a.call(_this, message);
            }
            catch (error) {
                _this.handleError(error);
            }
        };
        this.onBunError = function () {
            _this.handleError(new Error('WebSocket error'));
        };
        this.onBunClose = function () {
            _this.handleCloseCleanup();
        };
        // Node (ws package) event handlers
        this.onNodeMessage = function (data) {
            var _a;
            try {
                var messageObj = (0, slowOperations_js_1.jsonParse)(data.toString('utf-8'));
                var message = types_js_1.JSONRPCMessageSchema.parse(messageObj);
                (_a = _this.onmessage) === null || _a === void 0 ? void 0 : _a.call(_this, message);
            }
            catch (error) {
                _this.handleError(error);
            }
        };
        this.onNodeError = function (error) {
            _this.handleError(error);
        };
        this.onNodeClose = function () {
            _this.handleCloseCleanup();
        };
        this.opened = new Promise(function (resolve, reject) {
            if (_this.ws.readyState === WS_OPEN) {
                resolve();
            }
            else if (_this.isBun) {
                var nws_1 = _this.ws;
                var onOpen_1 = function () {
                    nws_1.removeEventListener('open', onOpen_1);
                    nws_1.removeEventListener('error', onError_1);
                    resolve();
                };
                var onError_1 = function (event) {
                    nws_1.removeEventListener('open', onOpen_1);
                    nws_1.removeEventListener('error', onError_1);
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'mcp_websocket_connect_fail');
                    reject(event);
                };
                nws_1.addEventListener('open', onOpen_1);
                nws_1.addEventListener('error', onError_1);
            }
            else {
                var nws = _this.ws;
                nws.on('open', function () {
                    resolve();
                });
                nws.on('error', function (error) {
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'mcp_websocket_connect_fail');
                    reject(error);
                });
            }
        });
        // Attach persistent event handlers
        if (this.isBun) {
            var nws = this.ws;
            nws.addEventListener('message', this.onBunMessage);
            nws.addEventListener('error', this.onBunError);
            nws.addEventListener('close', this.onBunClose);
        }
        else {
            var nws = this.ws;
            nws.on('message', this.onNodeMessage);
            nws.on('error', this.onNodeError);
            nws.on('close', this.onNodeClose);
        }
    }
    // Shared error handler
    WebSocketTransport.prototype.handleError = function (error) {
        var _a;
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'mcp_websocket_message_fail');
        (_a = this.onerror) === null || _a === void 0 ? void 0 : _a.call(this, (0, errors_js_1.toError)(error));
    };
    // Shared close handler with listener cleanup
    WebSocketTransport.prototype.handleCloseCleanup = function () {
        var _a;
        (_a = this.onclose) === null || _a === void 0 ? void 0 : _a.call(this);
        // Clean up listeners after close
        if (this.isBun) {
            var nws = this.ws;
            nws.removeEventListener('message', this.onBunMessage);
            nws.removeEventListener('error', this.onBunError);
            nws.removeEventListener('close', this.onBunClose);
        }
        else {
            var nws = this.ws;
            nws.off('message', this.onNodeMessage);
            nws.off('error', this.onNodeError);
            nws.off('close', this.onNodeClose);
        }
    };
    /**
     * Starts listening for messages on the WebSocket.
     */
    WebSocketTransport.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.started) {
                            throw new Error('Start can only be called once per transport.');
                        }
                        return [4 /*yield*/, this.opened];
                    case 1:
                        _a.sent();
                        if (this.ws.readyState !== WS_OPEN) {
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'mcp_websocket_start_not_opened');
                            throw new Error('WebSocket is not open. Cannot start transport.');
                        }
                        this.started = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Closes the WebSocket connection.
     */
    WebSocketTransport.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.ws.readyState === WS_OPEN ||
                    this.ws.readyState === WS_CONNECTING) {
                    this.ws.close();
                }
                // Ensure listeners are removed even if close was called externally or connection was already closed
                this.handleCloseCleanup();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Sends a JSON-RPC message over the WebSocket connection.
     */
    WebSocketTransport.prototype.send = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var json, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.ws.readyState !== WS_OPEN) {
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'mcp_websocket_send_not_opened');
                            throw new Error('WebSocket is not open. Cannot send message.');
                        }
                        json = (0, slowOperations_js_1.jsonStringify)(message);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        if (!this.isBun) return [3 /*break*/, 2];
                        // Native WebSocket.send() is synchronous (no callback)
                        this.ws.send(json);
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, new Promise(function (resolve, reject) {
                            ;
                            _this.ws.send(json, function (error) {
                                if (error) {
                                    reject(error);
                                }
                                else {
                                    resolve();
                                }
                            });
                        })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        this.handleError(error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return WebSocketTransport;
}());
exports.WebSocketTransport = WebSocketTransport;
