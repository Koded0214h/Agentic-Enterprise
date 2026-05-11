"use strict";
/**
 * CCR upstreamproxy — container-side wiring.
 *
 * When running inside a CCR session container with upstreamproxy configured,
 * this module:
 *   1. Reads the session token from /run/ccr/session_token
 *   2. Sets prctl(PR_SET_DUMPABLE, 0) to block same-UID ptrace of the heap
 *   3. Downloads the upstreamproxy CA cert and concatenates it with the
 *      system bundle so curl/gh/python trust the MITM proxy
 *   4. Starts a local CONNECT→WebSocket relay (see relay.ts)
 *   5. Unlinks the token file (token stays heap-only; file is gone before
 *      the agent loop can see it, but only after the relay is confirmed up
 *      so a supervisor restart can retry)
 *   6. Exposes HTTPS_PROXY / SSL_CERT_FILE env vars for all agent subprocesses
 *
 * Every step fails open: any error logs a warning and disables the proxy.
 * A broken proxy setup must never break an otherwise-working session.
 *
 * Design doc: api-go/ccr/docs/plans/CCR_AUTH_DESIGN.md § "Week-1 pilot scope".
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION_TOKEN_PATH = void 0;
exports.initUpstreamProxy = initUpstreamProxy;
exports.getUpstreamProxyEnv = getUpstreamProxyEnv;
exports.resetUpstreamProxyForTests = resetUpstreamProxyForTests;
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var cleanupRegistry_js_1 = require("../utils/cleanupRegistry.js");
var debug_js_1 = require("../utils/debug.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var errors_js_1 = require("../utils/errors.js");
var relay_js_1 = require("./relay.js");
exports.SESSION_TOKEN_PATH = '/run/ccr/session_token';
var SYSTEM_CA_BUNDLE = '/etc/ssl/certs/ca-certificates.crt';
// Hosts the proxy must NOT intercept. Covers loopback, RFC1918, the IMDS
// range, and the package registries + GitHub that CCR containers already
// reach directly. Mirrors airlock/scripts/sandbox-shell-ccr.sh.
var NO_PROXY_LIST = [
    'localhost',
    '127.0.0.1',
    '::1',
    '169.254.0.0/16',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    // Anthropic API: no upstream route will ever match, and the MITM breaks
    // non-Bun runtimes (Python httpx/certifi doesn't trust the forged CA).
    // Three forms because NO_PROXY parsing differs across runtimes:
    //   *.anthropic.com  — Bun, curl, Go (glob match)
    //   .anthropic.com   — Python urllib/httpx (suffix match, strips leading dot)
    //   anthropic.com    — apex domain fallback
    'anthropic.com',
    '.anthropic.com',
    '*.anthropic.com',
    'github.com',
    'api.github.com',
    '*.github.com',
    '*.githubusercontent.com',
    'registry.npmjs.org',
    'pypi.org',
    'files.pythonhosted.org',
    'index.crates.io',
    'proxy.golang.org',
].join(',');
var state = { enabled: false };
/**
 * Initialize upstreamproxy. Called once from init.ts. Safe to call when the
 * feature is off or the token file is absent — returns {enabled: false}.
 *
 * Overridable paths are for tests; production uses the defaults.
 */
function initUpstreamProxy(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionId, tokenPath, token, baseUrl, caBundlePath, caOk, wsUrl, relay_1, err_1;
        var _this = this;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE)) {
                        return [2 /*return*/, state];
                    }
                    // CCR evaluates ccr_upstream_proxy_enabled server-side (where GrowthBook is
                    // warm) and injects this env var via StartupContext.EnvironmentVariables.
                    // Every CCR session is a fresh container with no GB cache, so a client-side
                    // GB check here always returned the default (false).
                    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CCR_UPSTREAM_PROXY_ENABLED)) {
                        return [2 /*return*/, state];
                    }
                    sessionId = process.env.CLAUDE_CODE_REMOTE_SESSION_ID;
                    if (!sessionId) {
                        (0, debug_js_1.logForDebugging)('[upstreamproxy] CLAUDE_CODE_REMOTE_SESSION_ID unset; proxy disabled', { level: 'warn' });
                        return [2 /*return*/, state];
                    }
                    tokenPath = (_a = opts === null || opts === void 0 ? void 0 : opts.tokenPath) !== null && _a !== void 0 ? _a : exports.SESSION_TOKEN_PATH;
                    return [4 /*yield*/, readToken(tokenPath)];
                case 1:
                    token = _f.sent();
                    if (!token) {
                        (0, debug_js_1.logForDebugging)('[upstreamproxy] no session token file; proxy disabled');
                        return [2 /*return*/, state];
                    }
                    setNonDumpable();
                    baseUrl = (_c = (_b = opts === null || opts === void 0 ? void 0 : opts.ccrBaseUrl) !== null && _b !== void 0 ? _b : process.env.ANTHROPIC_BASE_URL) !== null && _c !== void 0 ? _c : 'https://api.anthropic.com';
                    caBundlePath = (_d = opts === null || opts === void 0 ? void 0 : opts.caBundlePath) !== null && _d !== void 0 ? _d : (0, path_1.join)((0, os_1.homedir)(), '.ccr', 'ca-bundle.crt');
                    return [4 /*yield*/, downloadCaBundle(baseUrl, (_e = opts === null || opts === void 0 ? void 0 : opts.systemCaPath) !== null && _e !== void 0 ? _e : SYSTEM_CA_BUNDLE, caBundlePath)];
                case 2:
                    caOk = _f.sent();
                    if (!caOk)
                        return [2 /*return*/, state];
                    _f.label = 3;
                case 3:
                    _f.trys.push([3, 6, , 7]);
                    wsUrl = baseUrl.replace(/^http/, 'ws') + '/v1/code/upstreamproxy/ws';
                    return [4 /*yield*/, (0, relay_js_1.startUpstreamProxyRelay)({ wsUrl: wsUrl, sessionId: sessionId, token: token })];
                case 4:
                    relay_1 = _f.sent();
                    (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, relay_1.stop()];
                    }); }); });
                    state = { enabled: true, port: relay_1.port, caBundlePath: caBundlePath };
                    (0, debug_js_1.logForDebugging)("[upstreamproxy] enabled on 127.0.0.1:".concat(relay_1.port));
                    // Only unlink after the listener is up: if CA download or listen()
                    // fails, a supervisor restart can retry with the token still on disk.
                    return [4 /*yield*/, (0, promises_1.unlink)(tokenPath).catch(function () {
                            (0, debug_js_1.logForDebugging)('[upstreamproxy] token file unlink failed', {
                                level: 'warn',
                            });
                        })];
                case 5:
                    // Only unlink after the listener is up: if CA download or listen()
                    // fails, a supervisor restart can retry with the token still on disk.
                    _f.sent();
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _f.sent();
                    (0, debug_js_1.logForDebugging)("[upstreamproxy] relay start failed: ".concat(err_1 instanceof Error ? err_1.message : String(err_1), "; proxy disabled"), { level: 'warn' });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, state];
            }
        });
    });
}
/**
 * Env vars to merge into every agent subprocess. Empty when the proxy is
 * disabled. Called from subprocessEnv() so Bash/MCP/LSP/hooks all inherit
 * the same recipe.
 */
function getUpstreamProxyEnv() {
    if (!state.enabled || !state.port || !state.caBundlePath) {
        // Child CLI processes can't re-initialize the relay (token file was
        // unlinked by the parent), but the parent's relay is still running and
        // reachable at 127.0.0.1:<port>. If we inherited proxy vars from the
        // parent (HTTPS_PROXY + SSL_CERT_FILE both set), pass them through so
        // our subprocesses also route through the parent's relay.
        if (process.env.HTTPS_PROXY && process.env.SSL_CERT_FILE) {
            var inherited = {};
            for (var _i = 0, _a = [
                'HTTPS_PROXY',
                'https_proxy',
                'NO_PROXY',
                'no_proxy',
                'SSL_CERT_FILE',
                'NODE_EXTRA_CA_CERTS',
                'REQUESTS_CA_BUNDLE',
                'CURL_CA_BUNDLE',
            ]; _i < _a.length; _i++) {
                var key = _a[_i];
                if (process.env[key])
                    inherited[key] = process.env[key];
            }
            return inherited;
        }
        return {};
    }
    var proxyUrl = "http://127.0.0.1:".concat(state.port);
    // HTTPS only: the relay handles CONNECT and nothing else. Plain HTTP has
    // no credentials to inject, so routing it through the relay would just
    // break the request with a 405.
    return {
        HTTPS_PROXY: proxyUrl,
        https_proxy: proxyUrl,
        NO_PROXY: NO_PROXY_LIST,
        no_proxy: NO_PROXY_LIST,
        SSL_CERT_FILE: state.caBundlePath,
        NODE_EXTRA_CA_CERTS: state.caBundlePath,
        REQUESTS_CA_BUNDLE: state.caBundlePath,
        CURL_CA_BUNDLE: state.caBundlePath,
    };
}
/** Test-only: reset module state between test cases. */
function resetUpstreamProxyForTests() {
    state = { enabled: false };
}
function readToken(path) {
    return __awaiter(this, void 0, void 0, function () {
        var raw, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)(path, 'utf8')];
                case 1:
                    raw = _a.sent();
                    return [2 /*return*/, raw.trim() || null];
                case 2:
                    err_2 = _a.sent();
                    if ((0, errors_js_1.isENOENT)(err_2))
                        return [2 /*return*/, null];
                    (0, debug_js_1.logForDebugging)("[upstreamproxy] token read failed: ".concat(err_2 instanceof Error ? err_2.message : String(err_2)), { level: 'warn' });
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * prctl(PR_SET_DUMPABLE, 0) via libc FFI. Blocks same-UID ptrace of this
 * process, so a prompt-injected `gdb -p $PPID` can't scrape the token from
 * the heap. Linux-only; silently no-ops elsewhere.
 */
function setNonDumpable() {
    if (process.platform !== 'linux' || typeof Bun === 'undefined')
        return;
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        var ffi = require('bun:ffi');
        var lib = ffi.dlopen('libc.so.6', {
            prctl: {
                args: ['int', 'u64', 'u64', 'u64', 'u64'],
                returns: 'int',
            },
        });
        var PR_SET_DUMPABLE = 4;
        var rc = lib.symbols.prctl(PR_SET_DUMPABLE, 0n, 0n, 0n, 0n);
        if (rc !== 0) {
            (0, debug_js_1.logForDebugging)('[upstreamproxy] prctl(PR_SET_DUMPABLE,0) returned nonzero', {
                level: 'warn',
            });
        }
    }
    catch (err) {
        (0, debug_js_1.logForDebugging)("[upstreamproxy] prctl unavailable: ".concat(err instanceof Error ? err.message : String(err)), { level: 'warn' });
    }
}
function downloadCaBundle(baseUrl, systemCaPath, outPath) {
    return __awaiter(this, void 0, void 0, function () {
        var resp, ccrCa, systemCa, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, fetch("".concat(baseUrl, "/v1/code/upstreamproxy/ca-cert"), {
                            // Bun has no default fetch timeout — a hung endpoint would block CLI
                            // startup forever. 5s is generous for a small PEM.
                            signal: AbortSignal.timeout(5000),
                        })];
                case 1:
                    resp = _a.sent();
                    if (!resp.ok) {
                        (0, debug_js_1.logForDebugging)("[upstreamproxy] ca-cert fetch ".concat(resp.status, "; proxy disabled"), { level: 'warn' });
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, resp.text()];
                case 2:
                    ccrCa = _a.sent();
                    return [4 /*yield*/, (0, promises_1.readFile)(systemCaPath, 'utf8').catch(function () { return ''; })];
                case 3:
                    systemCa = _a.sent();
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.join)(outPath, '..'), { recursive: true })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(outPath, systemCa + '\n' + ccrCa, 'utf8')];
                case 5:
                    _a.sent();
                    return [2 /*return*/, true];
                case 6:
                    err_3 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[upstreamproxy] ca-cert download failed: ".concat(err_3 instanceof Error ? err_3.message : String(err_3), "; proxy disabled"), { level: 'warn' });
                    return [2 /*return*/, false];
                case 7: return [2 /*return*/];
            }
        });
    });
}
