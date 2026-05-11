"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionIngressAuthToken = getSessionIngressAuthToken;
exports.getSessionIngressAuthHeaders = getSessionIngressAuthHeaders;
exports.updateSessionIngressAuthToken = updateSessionIngressAuthToken;
var state_js_1 = require("../bootstrap/state.js");
var authFileDescriptor_js_1 = require("./authFileDescriptor.js");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var fsOperations_js_1 = require("./fsOperations.js");
/**
 * Read token via file descriptor, falling back to well-known file.
 * Uses global state to cache the result since file descriptors can only be read once.
 */
function getTokenFromFileDescriptor() {
    var _a, _b;
    // Check if we've already attempted to read the token
    var cachedToken = (0, state_js_1.getSessionIngressToken)();
    if (cachedToken !== undefined) {
        return cachedToken;
    }
    var fdEnv = process.env.CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR;
    if (!fdEnv) {
        // No FD env var — either we're not in CCR, or we're a subprocess whose
        // parent stripped the (useless) FD env var. Try the well-known file.
        var path = (_a = process.env.CLAUDE_SESSION_INGRESS_TOKEN_FILE) !== null && _a !== void 0 ? _a : authFileDescriptor_js_1.CCR_SESSION_INGRESS_TOKEN_PATH;
        var fromFile = (0, authFileDescriptor_js_1.readTokenFromWellKnownFile)(path, 'session ingress token');
        (0, state_js_1.setSessionIngressToken)(fromFile);
        return fromFile;
    }
    var fd = parseInt(fdEnv, 10);
    if (Number.isNaN(fd)) {
        (0, debug_js_1.logForDebugging)("CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR must be a valid file descriptor number, got: ".concat(fdEnv), { level: 'error' });
        (0, state_js_1.setSessionIngressToken)(null);
        return null;
    }
    try {
        // Read from the file descriptor
        // Use /dev/fd on macOS/BSD, /proc/self/fd on Linux
        var fsOps = (0, fsOperations_js_1.getFsImplementation)();
        var fdPath = process.platform === 'darwin' || process.platform === 'freebsd'
            ? "/dev/fd/".concat(fd)
            : "/proc/self/fd/".concat(fd);
        var token = fsOps.readFileSync(fdPath, { encoding: 'utf8' }).trim();
        if (!token) {
            (0, debug_js_1.logForDebugging)('File descriptor contained empty token', {
                level: 'error',
            });
            (0, state_js_1.setSessionIngressToken)(null);
            return null;
        }
        (0, debug_js_1.logForDebugging)("Successfully read token from file descriptor ".concat(fd));
        (0, state_js_1.setSessionIngressToken)(token);
        (0, authFileDescriptor_js_1.maybePersistTokenForSubprocesses)(authFileDescriptor_js_1.CCR_SESSION_INGRESS_TOKEN_PATH, token, 'session ingress token');
        return token;
    }
    catch (error) {
        (0, debug_js_1.logForDebugging)("Failed to read token from file descriptor ".concat(fd, ": ").concat((0, errors_js_1.errorMessage)(error)), { level: 'error' });
        // FD env var was set but read failed — typically a subprocess that
        // inherited the env var but not the FD (ENXIO). Try the well-known file.
        var path = (_b = process.env.CLAUDE_SESSION_INGRESS_TOKEN_FILE) !== null && _b !== void 0 ? _b : authFileDescriptor_js_1.CCR_SESSION_INGRESS_TOKEN_PATH;
        var fromFile = (0, authFileDescriptor_js_1.readTokenFromWellKnownFile)(path, 'session ingress token');
        (0, state_js_1.setSessionIngressToken)(fromFile);
        return fromFile;
    }
}
/**
 * Get session ingress authentication token.
 *
 * Priority order:
 *  1. Environment variable (CLAUDE_CODE_SESSION_ACCESS_TOKEN) — set at spawn time,
 *     updated in-process via updateSessionIngressAuthToken or
 *     update_environment_variables stdin message from the parent bridge process.
 *  2. File descriptor (legacy path) — CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR,
 *     read once and cached.
 *  3. Well-known file — CLAUDE_SESSION_INGRESS_TOKEN_FILE env var path, or
 *     /home/claude/.claude/remote/.session_ingress_token. Covers subprocesses
 *     that can't inherit the FD.
 */
function getSessionIngressAuthToken() {
    // 1. Check environment variable
    var envToken = process.env.CLAUDE_CODE_SESSION_ACCESS_TOKEN;
    if (envToken) {
        return envToken;
    }
    // 2. Check file descriptor (legacy path), with file fallback
    return getTokenFromFileDescriptor();
}
/**
 * Build auth headers for the current session token.
 * Session keys (sk-ant-sid) use Cookie auth + X-Organization-Uuid;
 * JWTs use Bearer auth.
 */
function getSessionIngressAuthHeaders() {
    var token = getSessionIngressAuthToken();
    if (!token)
        return {};
    if (token.startsWith('sk-ant-sid')) {
        var headers = {
            Cookie: "sessionKey=".concat(token),
        };
        var orgUuid = process.env.CLAUDE_CODE_ORGANIZATION_UUID;
        if (orgUuid) {
            headers['X-Organization-Uuid'] = orgUuid;
        }
        return headers;
    }
    return { Authorization: "Bearer ".concat(token) };
}
/**
 * Update the session ingress auth token in-process by setting the env var.
 * Used by the REPL bridge to inject a fresh token after reconnection
 * without restarting the process.
 */
function updateSessionIngressAuthToken(token) {
    process.env.CLAUDE_CODE_SESSION_ACCESS_TOKEN = token;
}
