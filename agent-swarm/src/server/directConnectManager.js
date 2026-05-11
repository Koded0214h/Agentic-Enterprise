"use strict";
/* eslint-disable eslint-plugin-n/no-unsupported-features/node-builtins */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectConnectSessionManager = void 0;
var debug_js_1 = require("../utils/debug.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
function isStdoutMessage(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        typeof value.type === 'string');
}
var DirectConnectSessionManager = /** @class */ (function () {
    function DirectConnectSessionManager(config, callbacks) {
        this.ws = null;
        this.config = config;
        this.callbacks = callbacks;
    }
    DirectConnectSessionManager.prototype.connect = function () {
        var _this = this;
        var headers = {};
        if (this.config.authToken) {
            headers['authorization'] = "Bearer ".concat(this.config.authToken);
        }
        // Bun's WebSocket supports headers option but the DOM typings don't
        this.ws = new WebSocket(this.config.wsUrl, {
            headers: headers,
        });
        this.ws.addEventListener('open', function () {
            var _a, _b;
            (_b = (_a = _this.callbacks).onConnected) === null || _b === void 0 ? void 0 : _b.call(_a);
        });
        this.ws.addEventListener('message', function (event) {
            var data = typeof event.data === 'string' ? event.data : '';
            var lines = data.split('\n').filter(function (l) { return l.trim(); });
            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                var line = lines_1[_i];
                var raw = void 0;
                try {
                    raw = (0, slowOperations_js_1.jsonParse)(line);
                }
                catch (_a) {
                    continue;
                }
                if (!isStdoutMessage(raw)) {
                    continue;
                }
                var parsed = raw;
                // Handle control requests (permission requests)
                if (parsed.type === 'control_request') {
                    if (parsed.request.subtype === 'can_use_tool') {
                        _this.callbacks.onPermissionRequest(parsed.request, parsed.request_id);
                    }
                    else {
                        // Send an error response for unrecognized subtypes so the
                        // server doesn't hang waiting for a reply that never comes.
                        (0, debug_js_1.logForDebugging)("[DirectConnect] Unsupported control request subtype: ".concat(parsed.request.subtype));
                        _this.sendErrorResponse(parsed.request_id, "Unsupported control request subtype: ".concat(parsed.request.subtype));
                    }
                    continue;
                }
                // Forward SDK messages (assistant, result, system, etc.)
                if (parsed.type !== 'control_response' &&
                    parsed.type !== 'keep_alive' &&
                    parsed.type !== 'control_cancel_request' &&
                    parsed.type !== 'streamlined_text' &&
                    parsed.type !== 'streamlined_tool_use_summary' &&
                    !(parsed.type === 'system' && parsed.subtype === 'post_turn_summary')) {
                    _this.callbacks.onMessage(parsed);
                }
            }
        });
        this.ws.addEventListener('close', function () {
            var _a, _b;
            (_b = (_a = _this.callbacks).onDisconnected) === null || _b === void 0 ? void 0 : _b.call(_a);
        });
        this.ws.addEventListener('error', function () {
            var _a, _b;
            (_b = (_a = _this.callbacks).onError) === null || _b === void 0 ? void 0 : _b.call(_a, new Error('WebSocket connection error'));
        });
    };
    DirectConnectSessionManager.prototype.sendMessage = function (content) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return false;
        }
        // Must match SDKUserMessage format expected by `--input-format stream-json`
        var message = (0, slowOperations_js_1.jsonStringify)({
            type: 'user',
            message: {
                role: 'user',
                content: content,
            },
            parent_tool_use_id: null,
            session_id: '',
        });
        this.ws.send(message);
        return true;
    };
    DirectConnectSessionManager.prototype.respondToPermissionRequest = function (requestId, result) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }
        // Must match SDKControlResponse format expected by StructuredIO
        var response = (0, slowOperations_js_1.jsonStringify)({
            type: 'control_response',
            response: {
                subtype: 'success',
                request_id: requestId,
                response: __assign({ behavior: result.behavior }, (result.behavior === 'allow'
                    ? { updatedInput: result.updatedInput }
                    : { message: result.message })),
            },
        });
        this.ws.send(response);
    };
    /**
     * Send an interrupt signal to cancel the current request
     */
    DirectConnectSessionManager.prototype.sendInterrupt = function () {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }
        // Must match SDKControlRequest format expected by StructuredIO
        var request = (0, slowOperations_js_1.jsonStringify)({
            type: 'control_request',
            request_id: crypto.randomUUID(),
            request: {
                subtype: 'interrupt',
            },
        });
        this.ws.send(request);
    };
    DirectConnectSessionManager.prototype.sendErrorResponse = function (requestId, error) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }
        var response = (0, slowOperations_js_1.jsonStringify)({
            type: 'control_response',
            response: {
                subtype: 'error',
                request_id: requestId,
                error: error,
            },
        });
        this.ws.send(response);
    };
    DirectConnectSessionManager.prototype.disconnect = function () {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    };
    DirectConnectSessionManager.prototype.isConnected = function () {
        var _a;
        return ((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN;
    };
    return DirectConnectSessionManager;
}());
exports.DirectConnectSessionManager = DirectConnectSessionManager;
