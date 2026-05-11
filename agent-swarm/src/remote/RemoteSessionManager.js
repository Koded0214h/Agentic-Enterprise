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
exports.RemoteSessionManager = void 0;
exports.createRemoteSessionConfig = createRemoteSessionConfig;
var debug_js_1 = require("../utils/debug.js");
var log_js_1 = require("../utils/log.js");
var api_js_1 = require("../utils/teleport/api.js");
var SessionsWebSocket_js_1 = require("./SessionsWebSocket.js");
/**
 * Type guard to check if a message is an SDKMessage (not a control message)
 */
function isSDKMessage(message) {
    return (message.type !== 'control_request' &&
        message.type !== 'control_response' &&
        message.type !== 'control_cancel_request');
}
/**
 * Manages a remote CCR session.
 *
 * Coordinates:
 * - WebSocket subscription for receiving messages from CCR
 * - HTTP POST for sending user messages to CCR
 * - Permission request/response flow
 */
var RemoteSessionManager = /** @class */ (function () {
    function RemoteSessionManager(config, callbacks) {
        this.config = config;
        this.callbacks = callbacks;
        this.websocket = null;
        this.pendingPermissionRequests = new Map();
    }
    /**
     * Connect to the remote session via WebSocket
     */
    RemoteSessionManager.prototype.connect = function () {
        var _this = this;
        (0, debug_js_1.logForDebugging)("[RemoteSessionManager] Connecting to session ".concat(this.config.sessionId));
        var wsCallbacks = {
            onMessage: function (message) { return _this.handleMessage(message); },
            onConnected: function () {
                var _a, _b;
                (0, debug_js_1.logForDebugging)('[RemoteSessionManager] Connected');
                (_b = (_a = _this.callbacks).onConnected) === null || _b === void 0 ? void 0 : _b.call(_a);
            },
            onClose: function () {
                var _a, _b;
                (0, debug_js_1.logForDebugging)('[RemoteSessionManager] Disconnected');
                (_b = (_a = _this.callbacks).onDisconnected) === null || _b === void 0 ? void 0 : _b.call(_a);
            },
            onReconnecting: function () {
                var _a, _b;
                (0, debug_js_1.logForDebugging)('[RemoteSessionManager] Reconnecting');
                (_b = (_a = _this.callbacks).onReconnecting) === null || _b === void 0 ? void 0 : _b.call(_a);
            },
            onError: function (error) {
                var _a, _b;
                (0, log_js_1.logError)(error);
                (_b = (_a = _this.callbacks).onError) === null || _b === void 0 ? void 0 : _b.call(_a, error);
            },
        };
        this.websocket = new SessionsWebSocket_js_1.SessionsWebSocket(this.config.sessionId, this.config.orgUuid, this.config.getAccessToken, wsCallbacks);
        void this.websocket.connect();
    };
    /**
     * Handle messages from WebSocket
     */
    RemoteSessionManager.prototype.handleMessage = function (message) {
        var _a, _b;
        // Handle control requests (permission prompts from CCR)
        if (message.type === 'control_request') {
            this.handleControlRequest(message);
            return;
        }
        // Handle control cancel requests (server cancelling a pending permission prompt)
        if (message.type === 'control_cancel_request') {
            var request_id = message.request_id;
            var pendingRequest = this.pendingPermissionRequests.get(request_id);
            (0, debug_js_1.logForDebugging)("[RemoteSessionManager] Permission request cancelled: ".concat(request_id));
            this.pendingPermissionRequests.delete(request_id);
            (_b = (_a = this.callbacks).onPermissionCancelled) === null || _b === void 0 ? void 0 : _b.call(_a, request_id, pendingRequest === null || pendingRequest === void 0 ? void 0 : pendingRequest.tool_use_id);
            return;
        }
        // Handle control responses (acknowledgments)
        if (message.type === 'control_response') {
            (0, debug_js_1.logForDebugging)('[RemoteSessionManager] Received control response');
            return;
        }
        // Forward SDK messages to callback (type guard ensures proper narrowing)
        if (isSDKMessage(message)) {
            this.callbacks.onMessage(message);
        }
    };
    /**
     * Handle control requests from CCR (e.g., permission requests)
     */
    RemoteSessionManager.prototype.handleControlRequest = function (request) {
        var _a;
        var request_id = request.request_id, inner = request.request;
        if (inner.subtype === 'can_use_tool') {
            (0, debug_js_1.logForDebugging)("[RemoteSessionManager] Permission request for tool: ".concat(inner.tool_name));
            this.pendingPermissionRequests.set(request_id, inner);
            this.callbacks.onPermissionRequest(inner, request_id);
        }
        else {
            // Send an error response for unrecognized subtypes so the server
            // doesn't hang waiting for a reply that never comes.
            (0, debug_js_1.logForDebugging)("[RemoteSessionManager] Unsupported control request subtype: ".concat(inner.subtype));
            var response = {
                type: 'control_response',
                response: {
                    subtype: 'error',
                    request_id: request_id,
                    error: "Unsupported control request subtype: ".concat(inner.subtype),
                },
            };
            (_a = this.websocket) === null || _a === void 0 ? void 0 : _a.sendControlResponse(response);
        }
    };
    /**
     * Send a user message to the remote session via HTTP POST
     */
    RemoteSessionManager.prototype.sendMessage = function (content, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, debug_js_1.logForDebugging)("[RemoteSessionManager] Sending message to session ".concat(this.config.sessionId));
                        return [4 /*yield*/, (0, api_js_1.sendEventToRemoteSession)(this.config.sessionId, content, opts)];
                    case 1:
                        success = _a.sent();
                        if (!success) {
                            (0, log_js_1.logError)(new Error("[RemoteSessionManager] Failed to send message to session ".concat(this.config.sessionId)));
                        }
                        return [2 /*return*/, success];
                }
            });
        });
    };
    /**
     * Respond to a permission request from CCR
     */
    RemoteSessionManager.prototype.respondToPermissionRequest = function (requestId, result) {
        var _a;
        var pendingRequest = this.pendingPermissionRequests.get(requestId);
        if (!pendingRequest) {
            (0, log_js_1.logError)(new Error("[RemoteSessionManager] No pending permission request with ID: ".concat(requestId)));
            return;
        }
        this.pendingPermissionRequests.delete(requestId);
        var response = {
            type: 'control_response',
            response: {
                subtype: 'success',
                request_id: requestId,
                response: __assign({ behavior: result.behavior }, (result.behavior === 'allow'
                    ? { updatedInput: result.updatedInput }
                    : { message: result.message })),
            },
        };
        (0, debug_js_1.logForDebugging)("[RemoteSessionManager] Sending permission response: ".concat(result.behavior));
        (_a = this.websocket) === null || _a === void 0 ? void 0 : _a.sendControlResponse(response);
    };
    /**
     * Check if connected to the remote session
     */
    RemoteSessionManager.prototype.isConnected = function () {
        var _a, _b;
        return (_b = (_a = this.websocket) === null || _a === void 0 ? void 0 : _a.isConnected()) !== null && _b !== void 0 ? _b : false;
    };
    /**
     * Send an interrupt signal to cancel the current request on the remote session
     */
    RemoteSessionManager.prototype.cancelSession = function () {
        var _a;
        (0, debug_js_1.logForDebugging)('[RemoteSessionManager] Sending interrupt signal');
        (_a = this.websocket) === null || _a === void 0 ? void 0 : _a.sendControlRequest({ subtype: 'interrupt' });
    };
    /**
     * Get the session ID
     */
    RemoteSessionManager.prototype.getSessionId = function () {
        return this.config.sessionId;
    };
    /**
     * Disconnect from the remote session
     */
    RemoteSessionManager.prototype.disconnect = function () {
        var _a;
        (0, debug_js_1.logForDebugging)('[RemoteSessionManager] Disconnecting');
        (_a = this.websocket) === null || _a === void 0 ? void 0 : _a.close();
        this.websocket = null;
        this.pendingPermissionRequests.clear();
    };
    /**
     * Force reconnect the WebSocket.
     * Useful when the subscription becomes stale after container shutdown.
     */
    RemoteSessionManager.prototype.reconnect = function () {
        var _a;
        (0, debug_js_1.logForDebugging)('[RemoteSessionManager] Reconnecting WebSocket');
        (_a = this.websocket) === null || _a === void 0 ? void 0 : _a.reconnect();
    };
    return RemoteSessionManager;
}());
exports.RemoteSessionManager = RemoteSessionManager;
/**
 * Create a remote session config from OAuth tokens
 */
function createRemoteSessionConfig(sessionId, getAccessToken, orgUuid, hasInitialPrompt, viewerOnly) {
    if (hasInitialPrompt === void 0) { hasInitialPrompt = false; }
    if (viewerOnly === void 0) { viewerOnly = false; }
    return {
        sessionId: sessionId,
        getAccessToken: getAccessToken,
        orgUuid: orgUuid,
        hasInitialPrompt: hasInitialPrompt,
        viewerOnly: viewerOnly,
    };
}
