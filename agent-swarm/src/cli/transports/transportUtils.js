"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransportForUrl = getTransportForUrl;
var url_1 = require("url");
var envUtils_js_1 = require("../../utils/envUtils.js");
var HybridTransport_js_1 = require("./HybridTransport.js");
var SSETransport_js_1 = require("./SSETransport.js");
var WebSocketTransport_js_1 = require("./WebSocketTransport.js");
/**
 * Helper function to get the appropriate transport for a URL.
 *
 * Transport selection priority:
 * 1. SSETransport (SSE reads + POST writes) when CLAUDE_CODE_USE_CCR_V2 is set
 * 2. HybridTransport (WS reads + POST writes) when CLAUDE_CODE_POST_FOR_SESSION_INGRESS_V2 is set
 * 3. WebSocketTransport (WS reads + WS writes) — default
 */
function getTransportForUrl(url, headers, sessionId, refreshHeaders) {
    if (headers === void 0) { headers = {}; }
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_CCR_V2)) {
        // v2: SSE for reads, HTTP POST for writes
        // --sdk-url is the session URL (.../sessions/{id});
        // derive the SSE stream URL by appending /worker/events/stream
        var sseUrl = new url_1.URL(url.href);
        if (sseUrl.protocol === 'wss:') {
            sseUrl.protocol = 'https:';
        }
        else if (sseUrl.protocol === 'ws:') {
            sseUrl.protocol = 'http:';
        }
        sseUrl.pathname =
            sseUrl.pathname.replace(/\/$/, '') + '/worker/events/stream';
        return new SSETransport_js_1.SSETransport(sseUrl, headers, sessionId, refreshHeaders);
    }
    if (url.protocol === 'ws:' || url.protocol === 'wss:') {
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_POST_FOR_SESSION_INGRESS_V2)) {
            return new HybridTransport_js_1.HybridTransport(url, headers, sessionId, refreshHeaders);
        }
        return new WebSocketTransport_js_1.WebSocketTransport(url, headers, sessionId, refreshHeaders);
    }
    else {
        throw new Error("Unsupported protocol: ".concat(url.protocol));
    }
}
