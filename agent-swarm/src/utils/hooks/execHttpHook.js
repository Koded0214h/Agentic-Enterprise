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
exports.execHttpHook = execHttpHook;
var axios_1 = require("axios");
var combinedAbortSignal_js_1 = require("../combinedAbortSignal.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var proxy_js_1 = require("../proxy.js");
// Import as namespace so spyOn works in tests (direct imports bypass spies)
var settingsModule = require("../settings/settings.js");
var ssrfGuard_js_1 = require("./ssrfGuard.js");
var DEFAULT_HTTP_HOOK_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes (matches TOOL_HOOK_EXECUTION_TIMEOUT_MS)
/**
 * Get the sandbox proxy config for routing HTTP hook requests through the
 * sandbox network proxy when sandboxing is enabled.
 *
 * Uses dynamic import to avoid a static import cycle
 * (sandbox-adapter -> settings -> ... -> hooks -> execHttpHook).
 */
function getSandboxProxyConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var SandboxManager, proxyPort;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../sandbox/sandbox-adapter.js'); })];
                case 1:
                    SandboxManager = (_a.sent()).SandboxManager;
                    if (!SandboxManager.isSandboxingEnabled()) {
                        return [2 /*return*/, undefined];
                    }
                    // Wait for the sandbox network proxy to finish initializing. In REPL mode,
                    // SandboxManager.initialize() is fire-and-forget so the proxy may not be
                    // ready yet when the first hook fires.
                    return [4 /*yield*/, SandboxManager.waitForNetworkInitialization()];
                case 2:
                    // Wait for the sandbox network proxy to finish initializing. In REPL mode,
                    // SandboxManager.initialize() is fire-and-forget so the proxy may not be
                    // ready yet when the first hook fires.
                    _a.sent();
                    proxyPort = SandboxManager.getProxyPort();
                    if (!proxyPort) {
                        return [2 /*return*/, undefined];
                    }
                    return [2 /*return*/, { host: '127.0.0.1', port: proxyPort, protocol: 'http' }];
            }
        });
    });
}
/**
 * Read HTTP hook allowlist restrictions from merged settings (all sources).
 * Follows the allowedMcpServers precedent: arrays concatenate across sources.
 * When allowManagedHooksOnly is set in managed settings, only admin-defined
 * hooks run anyway, so no separate lock-down boolean is needed here.
 */
function getHttpHookPolicy() {
    var settings = settingsModule.getInitialSettings();
    return {
        allowedUrls: settings.allowedHttpHookUrls,
        allowedEnvVars: settings.httpHookAllowedEnvVars,
    };
}
/**
 * Match a URL against a pattern with * as a wildcard (any characters).
 * Same semantics as the MCP server allowlist patterns.
 */
function urlMatchesPattern(url, pattern) {
    var escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    var regexStr = escaped.replace(/\*/g, '.*');
    return new RegExp("^".concat(regexStr, "$")).test(url);
}
/**
 * Strip CR, LF, and NUL bytes from a header value to prevent HTTP header
 * injection (CRLF injection) via env var values or hook-configured header
 * templates. A malicious env var like "token\r\nX-Evil: 1" would otherwise
 * inject a second header into the request.
 */
function sanitizeHeaderValue(value) {
    // eslint-disable-next-line no-control-regex
    return value.replace(/[\r\n\x00]/g, '');
}
/**
 * Interpolate $VAR_NAME and ${VAR_NAME} patterns in a string using process.env,
 * but only for variable names present in the allowlist. References to variables
 * not in the allowlist are replaced with empty strings to prevent exfiltration
 * of secrets via project-configured HTTP hooks.
 *
 * The result is sanitized to strip CR/LF/NUL bytes to prevent header injection.
 */
function interpolateEnvVars(value, allowedEnvVars) {
    var interpolated = value.replace(/\$\{([A-Z_][A-Z0-9_]*)\}|\$([A-Z_][A-Z0-9_]*)/g, function (_, braced, unbraced) {
        var _a;
        var varName = braced !== null && braced !== void 0 ? braced : unbraced;
        if (!allowedEnvVars.has(varName)) {
            (0, debug_js_1.logForDebugging)("Hooks: env var $".concat(varName, " not in allowedEnvVars, skipping interpolation"), { level: 'warn' });
            return '';
        }
        return (_a = process.env[varName]) !== null && _a !== void 0 ? _a : '';
    });
    return sanitizeHeaderValue(interpolated);
}
/**
 * Execute an HTTP hook by POSTing the hook input JSON to the configured URL.
 * Returns the raw response for the caller to interpret.
 *
 * When sandboxing is enabled, requests are routed through the sandbox network
 * proxy which enforces the domain allowlist. The proxy returns HTTP 403 for
 * blocked domains.
 *
 * Header values support $VAR_NAME and ${VAR_NAME} env var interpolation so that
 * secrets (e.g. "Authorization: Bearer $MY_TOKEN") are not stored in settings.json.
 * Only env vars explicitly listed in the hook's `allowedEnvVars` array are resolved;
 * all other references are replaced with empty strings.
 */
function execHttpHook(hook, _hookEvent, jsonInput, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var policy, matched, msg, timeoutMs, _a, combinedSignal, cleanup, headers, hookVars, effectiveVars, allowedEnvVars, _i, _b, _c, name_1, value, sandboxProxy, envProxyActive, response, body, error_1, errorMsg;
        var _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    policy = getHttpHookPolicy();
                    if (policy.allowedUrls !== undefined) {
                        matched = policy.allowedUrls.some(function (p) { return urlMatchesPattern(hook.url, p); });
                        if (!matched) {
                            msg = "HTTP hook blocked: ".concat(hook.url, " does not match any pattern in allowedHttpHookUrls");
                            (0, debug_js_1.logForDebugging)(msg, { level: 'warn' });
                            return [2 /*return*/, { ok: false, body: '', error: msg }];
                        }
                    }
                    timeoutMs = hook.timeout
                        ? hook.timeout * 1000
                        : DEFAULT_HTTP_HOOK_TIMEOUT_MS;
                    _a = (0, combinedAbortSignal_js_1.createCombinedAbortSignal)(signal, { timeoutMs: timeoutMs }), combinedSignal = _a.signal, cleanup = _a.cleanup;
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 4, , 5]);
                    headers = {
                        'Content-Type': 'application/json',
                    };
                    if (hook.headers) {
                        hookVars = (_d = hook.allowedEnvVars) !== null && _d !== void 0 ? _d : [];
                        effectiveVars = policy.allowedEnvVars !== undefined
                            ? hookVars.filter(function (v) { return policy.allowedEnvVars.includes(v); })
                            : hookVars;
                        allowedEnvVars = new Set(effectiveVars);
                        for (_i = 0, _b = Object.entries(hook.headers); _i < _b.length; _i++) {
                            _c = _b[_i], name_1 = _c[0], value = _c[1];
                            headers[name_1] = interpolateEnvVars(value, allowedEnvVars);
                        }
                    }
                    return [4 /*yield*/, getSandboxProxyConfig()
                        // Detect env var proxy (HTTP_PROXY / HTTPS_PROXY, respecting NO_PROXY).
                        // When set, configureGlobalAgents() has already installed a request
                        // interceptor that sets httpsAgent to an HttpsProxyAgent — the proxy
                        // handles DNS for the target. Skip the SSRF guard in that case, same
                        // as we do for the sandbox proxy, so that we don't accidentally block
                        // a corporate proxy sitting on a private IP (e.g. 10.0.0.1:3128).
                    ];
                case 2:
                    sandboxProxy = _f.sent();
                    envProxyActive = !sandboxProxy &&
                        (0, proxy_js_1.getProxyUrl)() !== undefined &&
                        !(0, proxy_js_1.shouldBypassProxy)(hook.url);
                    if (sandboxProxy) {
                        (0, debug_js_1.logForDebugging)("Hooks: HTTP hook POST to ".concat(hook.url, " (via sandbox proxy :").concat(sandboxProxy.port, ")"));
                    }
                    else if (envProxyActive) {
                        (0, debug_js_1.logForDebugging)("Hooks: HTTP hook POST to ".concat(hook.url, " (via env-var proxy)"));
                    }
                    else {
                        (0, debug_js_1.logForDebugging)("Hooks: HTTP hook POST to ".concat(hook.url));
                    }
                    return [4 /*yield*/, axios_1.default.post(hook.url, jsonInput, {
                            headers: headers,
                            signal: combinedSignal,
                            responseType: 'text',
                            validateStatus: function () { return true; },
                            maxRedirects: 0,
                            // Explicit false prevents axios's own env-var proxy detection; when an
                            // env-var proxy is configured, the global axios interceptor installed
                            // by configureGlobalAgents() handles it via httpsAgent instead.
                            proxy: sandboxProxy !== null && sandboxProxy !== void 0 ? sandboxProxy : false,
                            // SSRF guard: validate resolved IPs, block private/link-local ranges
                            // (but allow loopback for local dev). Skipped when any proxy is in
                            // use — the proxy performs DNS for the target, and applying the
                            // guard would instead validate the proxy's own IP, breaking
                            // connections to corporate proxies on private networks.
                            lookup: sandboxProxy || envProxyActive ? undefined : ssrfGuard_js_1.ssrfGuardedLookup,
                        })];
                case 3:
                    response = _f.sent();
                    cleanup();
                    body = (_e = response.data) !== null && _e !== void 0 ? _e : '';
                    (0, debug_js_1.logForDebugging)("Hooks: HTTP hook response status ".concat(response.status, ", body length ").concat(body.length));
                    return [2 /*return*/, {
                            ok: response.status >= 200 && response.status < 300,
                            statusCode: response.status,
                            body: body,
                        }];
                case 4:
                    error_1 = _f.sent();
                    cleanup();
                    if (combinedSignal.aborted) {
                        return [2 /*return*/, { ok: false, body: '', aborted: true }];
                    }
                    errorMsg = (0, errors_js_1.errorMessage)(error_1);
                    (0, debug_js_1.logForDebugging)("Hooks: HTTP hook error: ".concat(errorMsg), { level: 'error' });
                    return [2 /*return*/, { ok: false, body: '', error: errorMsg }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
