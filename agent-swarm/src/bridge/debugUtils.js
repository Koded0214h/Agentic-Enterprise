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
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactSecrets = redactSecrets;
exports.debugTruncate = debugTruncate;
exports.debugBody = debugBody;
exports.describeAxiosError = describeAxiosError;
exports.extractHttpStatus = extractHttpStatus;
exports.extractErrorDetail = extractErrorDetail;
exports.logBridgeSkip = logBridgeSkip;
var index_js_1 = require("../services/analytics/index.js");
var debug_js_1 = require("../utils/debug.js");
var errors_js_1 = require("../utils/errors.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var DEBUG_MSG_LIMIT = 2000;
var SECRET_FIELD_NAMES = [
    'session_ingress_token',
    'environment_secret',
    'access_token',
    'secret',
    'token',
];
var SECRET_PATTERN = new RegExp("\"(".concat(SECRET_FIELD_NAMES.join('|'), ")\"\\s*:\\s*\"([^\"]*)\""), 'g');
var REDACT_MIN_LENGTH = 16;
function redactSecrets(s) {
    return s.replace(SECRET_PATTERN, function (_match, field, value) {
        if (value.length < REDACT_MIN_LENGTH) {
            return "\"".concat(field, "\":\"[REDACTED]\"");
        }
        var redacted = "".concat(value.slice(0, 8), "...").concat(value.slice(-4));
        return "\"".concat(field, "\":\"").concat(redacted, "\"");
    });
}
/** Truncate a string for debug logging, collapsing newlines. */
function debugTruncate(s) {
    var flat = s.replace(/\n/g, '\\n');
    if (flat.length <= DEBUG_MSG_LIMIT) {
        return flat;
    }
    return flat.slice(0, DEBUG_MSG_LIMIT) + "... (".concat(flat.length, " chars)");
}
/** Truncate a JSON-serializable value for debug logging. */
function debugBody(data) {
    var raw = typeof data === 'string' ? data : (0, slowOperations_js_1.jsonStringify)(data);
    var s = redactSecrets(raw);
    if (s.length <= DEBUG_MSG_LIMIT) {
        return s;
    }
    return s.slice(0, DEBUG_MSG_LIMIT) + "... (".concat(s.length, " chars)");
}
/**
 * Extract a descriptive error message from an axios error (or any error).
 * For HTTP errors, appends the server's response body message if available,
 * since axios's default message only includes the status code.
 */
function describeAxiosError(err) {
    var msg = (0, errors_js_1.errorMessage)(err);
    if (err && typeof err === 'object' && 'response' in err) {
        var response = err.response;
        if ((response === null || response === void 0 ? void 0 : response.data) && typeof response.data === 'object') {
            var data = response.data;
            var detail = typeof data.message === 'string'
                ? data.message
                : typeof data.error === 'object' &&
                    data.error &&
                    'message' in data.error &&
                    typeof data.error.message ===
                        'string'
                    ? data.error.message
                    : undefined;
            if (detail) {
                return "".concat(msg, ": ").concat(detail);
            }
        }
    }
    return msg;
}
/**
 * Extract the HTTP status code from an axios error, if present.
 * Returns undefined for non-HTTP errors (e.g. network failures).
 */
function extractHttpStatus(err) {
    if (err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response.status ===
            'number') {
        return err.response.status;
    }
    return undefined;
}
/**
 * Pull a human-readable message out of an API error response body.
 * Checks `data.message` first, then `data.error.message`.
 */
function extractErrorDetail(data) {
    if (!data || typeof data !== 'object')
        return undefined;
    if ('message' in data && typeof data.message === 'string') {
        return data.message;
    }
    if ('error' in data &&
        data.error !== null &&
        typeof data.error === 'object' &&
        'message' in data.error &&
        typeof data.error.message === 'string') {
        return data.error.message;
    }
    return undefined;
}
/**
 * Log a bridge init skip — debug message + `tengu_bridge_repl_skipped`
 * analytics event. Centralizes the event name and the AnalyticsMetadata
 * cast so call sites don't each repeat the 5-line boilerplate.
 */
function logBridgeSkip(reason, debugMsg, v2) {
    if (debugMsg) {
        (0, debug_js_1.logForDebugging)(debugMsg);
    }
    (0, index_js_1.logEvent)('tengu_bridge_repl_skipped', __assign({ reason: reason }, (v2 !== undefined && { v2: v2 })));
}
