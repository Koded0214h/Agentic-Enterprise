"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setReplBridgeHandle = setReplBridgeHandle;
exports.getReplBridgeHandle = getReplBridgeHandle;
exports.getSelfBridgeCompatId = getSelfBridgeCompatId;
var concurrentSessions_js_1 = require("../utils/concurrentSessions.js");
var sessionIdCompat_js_1 = require("./sessionIdCompat.js");
/**
 * Global pointer to the active REPL bridge handle, so callers outside
 * useReplBridge's React tree (tools, slash commands) can invoke handle methods
 * like subscribePR. Same one-bridge-per-process justification as bridgeDebug.ts
 * — the handle's closure captures the sessionId and getAccessToken that created
 * the session, and re-deriving those independently (BriefTool/upload.ts pattern)
 * risks staging/prod token divergence.
 *
 * Set from useReplBridge.tsx when init completes; cleared on teardown.
 */
var handle = null;
function setReplBridgeHandle(h) {
    var _a;
    handle = h;
    // Publish (or clear) our bridge session ID in the session record so other
    // local peers can dedup us out of their bridge list — local is preferred.
    void (0, concurrentSessions_js_1.updateSessionBridgeId)((_a = getSelfBridgeCompatId()) !== null && _a !== void 0 ? _a : null).catch(function () { });
}
function getReplBridgeHandle() {
    return handle;
}
/**
 * Our own bridge session ID in the session_* compat format the API returns
 * in /v1/sessions responses — or undefined if bridge isn't connected.
 */
function getSelfBridgeCompatId() {
    var h = getReplBridgeHandle();
    return h ? (0, sessionIdCompat_js_1.toCompatSessionId)(h.bridgeSessionId) : undefined;
}
