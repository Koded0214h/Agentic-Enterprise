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
exports.decodeWorkSecret = decodeWorkSecret;
exports.buildSdkUrl = buildSdkUrl;
exports.sameSessionId = sameSessionId;
exports.buildCCRv2SdkUrl = buildCCRv2SdkUrl;
exports.registerWorker = registerWorker;
var axios_1 = require("axios");
var slowOperations_js_1 = require("../utils/slowOperations.js");
/** Decode a base64url-encoded work secret and validate its version. */
function decodeWorkSecret(secret) {
    var json = Buffer.from(secret, 'base64url').toString('utf-8');
    var parsed = (0, slowOperations_js_1.jsonParse)(json);
    if (!parsed ||
        typeof parsed !== 'object' ||
        !('version' in parsed) ||
        parsed.version !== 1) {
        throw new Error("Unsupported work secret version: ".concat(parsed && typeof parsed === 'object' && 'version' in parsed ? parsed.version : 'unknown'));
    }
    var obj = parsed;
    if (typeof obj.session_ingress_token !== 'string' ||
        obj.session_ingress_token.length === 0) {
        throw new Error('Invalid work secret: missing or empty session_ingress_token');
    }
    if (typeof obj.api_base_url !== 'string') {
        throw new Error('Invalid work secret: missing api_base_url');
    }
    return parsed;
}
/**
 * Build a WebSocket SDK URL from the API base URL and session ID.
 * Strips the HTTP(S) protocol and constructs a ws(s):// ingress URL.
 *
 * Uses /v2/ for localhost (direct to session-ingress, no Envoy rewrite)
 * and /v1/ for production (Envoy rewrites /v1/ → /v2/).
 */
function buildSdkUrl(apiBaseUrl, sessionId) {
    var isLocalhost = apiBaseUrl.includes('localhost') || apiBaseUrl.includes('127.0.0.1');
    var protocol = isLocalhost ? 'ws' : 'wss';
    var version = isLocalhost ? 'v2' : 'v1';
    var host = apiBaseUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    return "".concat(protocol, "://").concat(host, "/").concat(version, "/session_ingress/ws/").concat(sessionId);
}
/**
 * Compare two session IDs regardless of their tagged-ID prefix.
 *
 * Tagged IDs have the form {tag}_{body} or {tag}_staging_{body}, where the
 * body encodes a UUID. CCR v2's compat layer returns `session_*` to v1 API
 * clients (compat/convert.go:41) but the infrastructure layer (sandbox-gateway
 * work queue, work poll response) uses `cse_*` (compat/CLAUDE.md:13). Both
 * have the same underlying UUID.
 *
 * Without this, replBridge rejects its own session as "foreign" at the
 * work-received check when the ccr_v2_compat_enabled gate is on.
 */
function sameSessionId(a, b) {
    if (a === b)
        return true;
    // The body is everything after the last underscore — this handles both
    // `{tag}_{body}` and `{tag}_staging_{body}`.
    var aBody = a.slice(a.lastIndexOf('_') + 1);
    var bBody = b.slice(b.lastIndexOf('_') + 1);
    // Guard against IDs with no underscore (bare UUIDs): lastIndexOf returns -1,
    // slice(0) returns the whole string, and we already checked a === b above.
    // Require a minimum length to avoid accidental matches on short suffixes
    // (e.g. single-char tag remnants from malformed IDs).
    return aBody.length >= 4 && aBody === bBody;
}
/**
 * Build a CCR v2 session URL from the API base URL and session ID.
 * Unlike buildSdkUrl, this returns an HTTP(S) URL (not ws://) and points at
 * /v1/code/sessions/{id} — the child CC will derive the SSE stream path
 * and worker endpoints from this base.
 */
function buildCCRv2SdkUrl(apiBaseUrl, sessionId) {
    var base = apiBaseUrl.replace(/\/+$/, '');
    return "".concat(base, "/v1/code/sessions/").concat(sessionId);
}
/**
 * Register this bridge as the worker for a CCR v2 session.
 * Returns the worker_epoch, which must be passed to the child CC process
 * so its CCRClient can include it in every heartbeat/state/event request.
 *
 * Mirrors what environment-manager does in the container path
 * (api-go/environment-manager/cmd/cmd_task_run.go RegisterWorker).
 */
function registerWorker(sessionUrl, accessToken) {
    return __awaiter(this, void 0, void 0, function () {
        var response, raw, epoch;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, axios_1.default.post("".concat(sessionUrl, "/worker/register"), {}, {
                        headers: {
                            Authorization: "Bearer ".concat(accessToken),
                            'Content-Type': 'application/json',
                            'anthropic-version': '2023-06-01',
                        },
                        timeout: 10000,
                    })
                    // protojson serializes int64 as a string to avoid JS number precision loss;
                    // the Go side may also return a number depending on encoder settings.
                ];
                case 1:
                    response = _b.sent();
                    raw = (_a = response.data) === null || _a === void 0 ? void 0 : _a.worker_epoch;
                    epoch = typeof raw === 'string' ? Number(raw) : raw;
                    if (typeof epoch !== 'number' ||
                        !Number.isFinite(epoch) ||
                        !Number.isSafeInteger(epoch)) {
                        throw new Error("registerWorker: invalid worker_epoch in response: ".concat((0, slowOperations_js_1.jsonStringify)(response.data)));
                    }
                    return [2 /*return*/, epoch];
            }
        });
    });
}
