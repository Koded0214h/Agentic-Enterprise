"use strict";
/**
 * SSEBroadcaster: SSE client management
 *
 * Responsibility:
 * - Manage SSE client connections
 * - Broadcast events to all connected clients
 * - Handle disconnections gracefully
 * - Single-pass broadcast (no two-step cleanup)
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSEBroadcaster = void 0;
var logger_js_1 = require("../../utils/logger.js");
var SSEBroadcaster = /** @class */ (function () {
    function SSEBroadcaster() {
        this.sseClients = new Set();
    }
    /**
     * Add a new SSE client connection
     */
    SSEBroadcaster.prototype.addClient = function (res) {
        var _this = this;
        this.sseClients.add(res);
        logger_js_1.logger.debug('WORKER', 'Client connected', { total: this.sseClients.size });
        // Setup cleanup on disconnect
        res.on('close', function () {
            _this.removeClient(res);
        });
        // Send initial event
        this.sendToClient(res, { type: 'connected', timestamp: Date.now() });
    };
    /**
     * Remove a client connection
     */
    SSEBroadcaster.prototype.removeClient = function (res) {
        this.sseClients.delete(res);
        logger_js_1.logger.debug('WORKER', 'Client disconnected', { total: this.sseClients.size });
    };
    /**
     * Broadcast an event to all connected clients (single-pass)
     */
    SSEBroadcaster.prototype.broadcast = function (event) {
        if (this.sseClients.size === 0) {
            logger_js_1.logger.debug('WORKER', 'SSE broadcast skipped (no clients)', { eventType: event.type });
            return; // Short-circuit if no clients
        }
        var eventWithTimestamp = __assign(__assign({}, event), { timestamp: Date.now() });
        var data = "data: ".concat(JSON.stringify(eventWithTimestamp), "\n\n");
        logger_js_1.logger.debug('WORKER', 'SSE broadcast sent', { eventType: event.type, clients: this.sseClients.size });
        // Single-pass write
        for (var _i = 0, _a = this.sseClients; _i < _a.length; _i++) {
            var client = _a[_i];
            client.write(data);
        }
    };
    /**
     * Get number of connected clients
     */
    SSEBroadcaster.prototype.getClientCount = function () {
        return this.sseClients.size;
    };
    /**
     * Send event to a specific client
     */
    SSEBroadcaster.prototype.sendToClient = function (res, event) {
        var data = "data: ".concat(JSON.stringify(event), "\n\n");
        res.write(data);
    };
    return SSEBroadcaster;
}());
exports.SSEBroadcaster = SSEBroadcaster;
