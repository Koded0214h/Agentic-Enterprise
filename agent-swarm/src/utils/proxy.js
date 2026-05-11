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
exports.getProxyAgent = void 0;
exports.disableKeepAlive = disableKeepAlive;
exports._resetKeepAliveForTesting = _resetKeepAliveForTesting;
exports.getAddressFamily = getAddressFamily;
exports.getProxyUrl = getProxyUrl;
exports.getNoProxy = getNoProxy;
exports.shouldBypassProxy = shouldBypassProxy;
exports.createAxiosInstance = createAxiosInstance;
exports.getWebSocketProxyAgent = getWebSocketProxyAgent;
exports.getWebSocketProxyUrl = getWebSocketProxyUrl;
exports.getProxyFetchOptions = getProxyFetchOptions;
exports.configureGlobalAgents = configureGlobalAgents;
exports.getAWSClientProxyConfig = getAWSClientProxyConfig;
exports.clearProxyCache = clearProxyCache;
// @aws-sdk/credential-provider-node and @smithy/node-http-handler are imported
// dynamically in getAWSClientProxyConfig() to defer ~929KB of AWS SDK.
// undici is lazy-required inside getProxyAgent/configureGlobalAgents to defer
// ~1.5MB when no HTTPS_PROXY/mTLS env vars are set (the common case).
var axios_1 = require("axios");
var https_proxy_agent_1 = require("https-proxy-agent");
var memoize_js_1 = require("lodash-es/memoize.js");
var caCerts_js_1 = require("./caCerts.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var mtls_js_1 = require("./mtls.js");
// Disable fetch keep-alive after a stale-pool ECONNRESET so retries open a
// fresh TCP connection instead of reusing the dead pooled socket. Sticky for
// the process lifetime — once the pool is known-bad, don't trust it again.
// Works under Bun (native fetch respects keepalive:false for pooling).
// Under Node/undici, keepalive is a no-op for pooling, but undici
// naturally evicts dead sockets from the pool on ECONNRESET.
var keepAliveDisabled = false;
function disableKeepAlive() {
    keepAliveDisabled = true;
}
function _resetKeepAliveForTesting() {
    keepAliveDisabled = false;
}
/**
 * Convert dns.LookupOptions.family to a numeric address family value
 * Handles: 0 | 4 | 6 | 'IPv4' | 'IPv6' | undefined
 */
function getAddressFamily(options) {
    switch (options.family) {
        case 0:
        case 4:
        case 6:
            return options.family;
        case 'IPv6':
            return 6;
        case 'IPv4':
        case undefined:
            return 4;
        default:
            throw new Error("Unsupported address family: ".concat(options.family));
    }
}
/**
 * Get the active proxy URL if one is configured
 * Prefers lowercase variants over uppercase (https_proxy > HTTPS_PROXY > http_proxy > HTTP_PROXY)
 * @param env Environment variables to check (defaults to process.env for production use)
 */
function getProxyUrl(env) {
    if (env === void 0) { env = process.env; }
    return env.https_proxy || env.HTTPS_PROXY || env.http_proxy || env.HTTP_PROXY;
}
/**
 * Get the NO_PROXY environment variable value
 * Prefers lowercase over uppercase (no_proxy > NO_PROXY)
 * @param env Environment variables to check (defaults to process.env for production use)
 */
function getNoProxy(env) {
    if (env === void 0) { env = process.env; }
    return env.no_proxy || env.NO_PROXY;
}
/**
 * Check if a URL should bypass the proxy based on NO_PROXY environment variable
 * Supports:
 * - Exact hostname matches (e.g., "localhost")
 * - Domain suffix matches with leading dot (e.g., ".example.com")
 * - Wildcard "*" to bypass all
 * - Port-specific matches (e.g., "example.com:8080")
 * - IP addresses (e.g., "127.0.0.1")
 * @param urlString URL to check
 * @param noProxy NO_PROXY value (defaults to getNoProxy() for production use)
 */
function shouldBypassProxy(urlString, noProxy) {
    if (noProxy === void 0) { noProxy = getNoProxy(); }
    if (!noProxy)
        return false;
    // Handle wildcard
    if (noProxy === '*')
        return true;
    try {
        var url = new URL(urlString);
        var hostname_1 = url.hostname.toLowerCase();
        var port = url.port || (url.protocol === 'https:' ? '443' : '80');
        var hostWithPort_1 = "".concat(hostname_1, ":").concat(port);
        // Split by comma or space and trim each entry
        var noProxyList = noProxy.split(/[,\s]+/).filter(Boolean);
        return noProxyList.some(function (pattern) {
            pattern = pattern.toLowerCase().trim();
            // Check for port-specific match
            if (pattern.includes(':')) {
                return hostWithPort_1 === pattern;
            }
            // Check for domain suffix match (with or without leading dot)
            if (pattern.startsWith('.')) {
                // Pattern ".example.com" should match "sub.example.com" and "example.com"
                // but NOT "notexample.com"
                var suffix = pattern;
                return hostname_1 === pattern.substring(1) || hostname_1.endsWith(suffix);
            }
            // Check for exact hostname match or IP address
            return hostname_1 === pattern;
        });
    }
    catch (_a) {
        // If URL parsing fails, don't bypass proxy
        return false;
    }
}
/**
 * Create an HttpsProxyAgent with optional mTLS configuration
 * Skips local DNS resolution to let the proxy handle it
 */
function createHttpsProxyAgent(proxyUrl, extra) {
    if (extra === void 0) { extra = {}; }
    var mtlsConfig = (0, mtls_js_1.getMTLSConfig)();
    var caCerts = (0, caCerts_js_1.getCACertificates)();
    var agentOptions = __assign(__assign({}, (mtlsConfig && {
        cert: mtlsConfig.cert,
        key: mtlsConfig.key,
        passphrase: mtlsConfig.passphrase,
    })), (caCerts && { ca: caCerts }));
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_PROXY_RESOLVES_HOSTS)) {
        // Skip local DNS resolution - let the proxy resolve hostnames
        // This is needed for environments where DNS is not configured locally
        // and instead handled by the proxy (as in sandboxes)
        agentOptions.lookup = function (hostname, options, callback) {
            callback(null, hostname, getAddressFamily(options));
        };
    }
    return new https_proxy_agent_1.HttpsProxyAgent(proxyUrl, __assign(__assign({}, agentOptions), extra));
}
/**
 * Axios instance with its own proxy agent. Same NO_PROXY/mTLS/CA
 * resolution as the global interceptor, but agent options stay
 * scoped to this instance.
 */
function createAxiosInstance(extra) {
    if (extra === void 0) { extra = {}; }
    var proxyUrl = getProxyUrl();
    var mtlsAgent = (0, mtls_js_1.getMTLSAgent)();
    var instance = axios_1.default.create({ proxy: false });
    if (!proxyUrl) {
        if (mtlsAgent)
            instance.defaults.httpsAgent = mtlsAgent;
        return instance;
    }
    var proxyAgent = createHttpsProxyAgent(proxyUrl, extra);
    instance.interceptors.request.use(function (config) {
        if (config.url && shouldBypassProxy(config.url)) {
            config.httpsAgent = mtlsAgent;
            config.httpAgent = mtlsAgent;
        }
        else {
            config.httpsAgent = proxyAgent;
            config.httpAgent = proxyAgent;
        }
        return config;
    });
    return instance;
}
/**
 * Get or create a memoized proxy agent for the given URI
 * Now respects NO_PROXY environment variable
 */
exports.getProxyAgent = (0, memoize_js_1.default)(function (uri) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    var undiciMod = require('undici');
    var mtlsConfig = (0, mtls_js_1.getMTLSConfig)();
    var caCerts = (0, caCerts_js_1.getCACertificates)();
    // Use EnvHttpProxyAgent to respect NO_PROXY
    // This agent automatically checks NO_PROXY for each request
    var proxyOptions = {
        // Override both HTTP and HTTPS proxy with the provided URI
        httpProxy: uri,
        httpsProxy: uri,
        noProxy: process.env.NO_PROXY || process.env.no_proxy,
    };
    // Set both connect and requestTls so TLS options apply to both paths:
    // - requestTls: used by ProxyAgent for the TLS connection through CONNECT tunnels
    // - connect: used by Agent for direct (no-proxy) connections
    if (mtlsConfig || caCerts) {
        var tlsOpts = __assign(__assign({}, (mtlsConfig && {
            cert: mtlsConfig.cert,
            key: mtlsConfig.key,
            passphrase: mtlsConfig.passphrase,
        })), (caCerts && { ca: caCerts }));
        proxyOptions.connect = tlsOpts;
        proxyOptions.requestTls = tlsOpts;
    }
    return new undiciMod.EnvHttpProxyAgent(proxyOptions);
});
/**
 * Get an HTTP agent configured for WebSocket proxy support
 * Returns undefined if no proxy is configured or URL should bypass proxy
 */
function getWebSocketProxyAgent(url) {
    var proxyUrl = getProxyUrl();
    if (!proxyUrl) {
        return undefined;
    }
    // Check if URL should bypass proxy
    if (shouldBypassProxy(url)) {
        return undefined;
    }
    return createHttpsProxyAgent(proxyUrl);
}
/**
 * Get the proxy URL for WebSocket connections under Bun.
 * Bun's native WebSocket supports a `proxy` string option instead of Node's `agent`.
 * Returns undefined if no proxy is configured or URL should bypass proxy.
 */
function getWebSocketProxyUrl(url) {
    var proxyUrl = getProxyUrl();
    if (!proxyUrl) {
        return undefined;
    }
    if (shouldBypassProxy(url)) {
        return undefined;
    }
    return proxyUrl;
}
/**
 * Get fetch options for the Anthropic SDK with proxy and mTLS configuration
 * Returns fetch options with appropriate dispatcher for proxy and/or mTLS
 *
 * @param opts.forAnthropicAPI - Enables ANTHROPIC_UNIX_SOCKET tunneling. This
 *   env var is set by `claude ssh` on the remote CLI to route API calls through
 *   an ssh -R forwarded unix socket to a local auth proxy. It MUST NOT leak
 *   into non-Anthropic-API fetch paths (MCP HTTP/SSE transports, etc.) or those
 *   requests get misrouted to api.anthropic.com. Only the Anthropic SDK client
 *   should pass `true` here.
 */
function getProxyFetchOptions(opts) {
    var base = keepAliveDisabled ? { keepalive: false } : {};
    // ANTHROPIC_UNIX_SOCKET tunnels through the `claude ssh` auth proxy, which
    // hardcodes the upstream to the Anthropic API. Scope to the Anthropic API
    // client so MCP/SSE/other callers don't get their requests misrouted.
    if (opts === null || opts === void 0 ? void 0 : opts.forAnthropicAPI) {
        var unixSocket = process.env.ANTHROPIC_UNIX_SOCKET;
        if (unixSocket && typeof Bun !== 'undefined') {
            return __assign(__assign({}, base), { unix: unixSocket });
        }
    }
    var proxyUrl = getProxyUrl();
    // If we have a proxy, use the proxy agent (which includes mTLS config)
    if (proxyUrl) {
        if (typeof Bun !== 'undefined') {
            return __assign(__assign(__assign({}, base), { proxy: proxyUrl }), (0, mtls_js_1.getTLSFetchOptions)());
        }
        return __assign(__assign({}, base), { dispatcher: (0, exports.getProxyAgent)(proxyUrl) });
    }
    // Otherwise, use TLS options directly if available
    return __assign(__assign({}, base), (0, mtls_js_1.getTLSFetchOptions)());
}
/**
 * Configure global HTTP agents for both axios and undici
 * This ensures all HTTP requests use the proxy and/or mTLS if configured
 */
var proxyInterceptorId;
function configureGlobalAgents() {
    var proxyUrl = getProxyUrl();
    var mtlsAgent = (0, mtls_js_1.getMTLSAgent)();
    // Eject previous interceptor to avoid stacking on repeated calls
    if (proxyInterceptorId !== undefined) {
        axios_1.default.interceptors.request.eject(proxyInterceptorId);
        proxyInterceptorId = undefined;
    }
    // Reset proxy-related defaults so reconfiguration is clean
    axios_1.default.defaults.proxy = undefined;
    axios_1.default.defaults.httpAgent = undefined;
    axios_1.default.defaults.httpsAgent = undefined;
    if (proxyUrl) {
        // workaround for https://github.com/axios/axios/issues/4531
        axios_1.default.defaults.proxy = false;
        // Create proxy agent with mTLS options if available
        var proxyAgent_1 = createHttpsProxyAgent(proxyUrl);
        // Add axios request interceptor to handle NO_PROXY
        proxyInterceptorId = axios_1.default.interceptors.request.use(function (config) {
            // Check if URL should bypass proxy based on NO_PROXY
            if (config.url && shouldBypassProxy(config.url)) {
                // Bypass proxy - use mTLS agent if configured, otherwise undefined
                if (mtlsAgent) {
                    config.httpsAgent = mtlsAgent;
                    config.httpAgent = mtlsAgent;
                }
                else {
                    // Remove any proxy agents to use direct connection
                    delete config.httpsAgent;
                    delete config.httpAgent;
                }
            }
            else {
                // Use proxy agent
                config.httpsAgent = proxyAgent_1;
                config.httpAgent = proxyAgent_1;
            }
            return config;
        });
        require('undici').setGlobalDispatcher((0, exports.getProxyAgent)(proxyUrl));
    }
    else if (mtlsAgent) {
        // No proxy but mTLS is configured
        axios_1.default.defaults.httpsAgent = mtlsAgent;
        // Set undici global dispatcher with mTLS
        var mtlsOptions = (0, mtls_js_1.getTLSFetchOptions)();
        if (mtlsOptions.dispatcher) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            ;
            require('undici').setGlobalDispatcher(mtlsOptions.dispatcher);
        }
    }
}
/**
 * Get AWS SDK client configuration with proxy support
 * Returns configuration object that can be spread into AWS service client constructors
 */
function getAWSClientProxyConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var proxyUrl, _a, NodeHttpHandler, defaultProvider, agent, requestHandler;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    proxyUrl = getProxyUrl();
                    if (!proxyUrl) {
                        return [2 /*return*/, {}];
                    }
                    return [4 /*yield*/, Promise.all([
                            Promise.resolve().then(function () { return require('@smithy/node-http-handler'); }),
                            Promise.resolve().then(function () { return require('@aws-sdk/credential-provider-node'); }),
                        ])];
                case 1:
                    _a = _b.sent(), NodeHttpHandler = _a[0].NodeHttpHandler, defaultProvider = _a[1].defaultProvider;
                    agent = createHttpsProxyAgent(proxyUrl);
                    requestHandler = new NodeHttpHandler({
                        httpAgent: agent,
                        httpsAgent: agent,
                    });
                    return [2 /*return*/, {
                            requestHandler: requestHandler,
                            credentials: defaultProvider({
                                clientConfig: { requestHandler: requestHandler },
                            }),
                        }];
            }
        });
    });
}
/**
 * Clear proxy agent cache.
 */
function clearProxyCache() {
    var _a, _b;
    (_b = (_a = exports.getProxyAgent.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (0, debug_js_1.logForDebugging)('Cleared proxy agent cache');
}
