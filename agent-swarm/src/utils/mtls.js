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
exports.getMTLSAgent = exports.getMTLSConfig = void 0;
exports.getWebSocketTLSOptions = getWebSocketTLSOptions;
exports.getTLSFetchOptions = getTLSFetchOptions;
exports.clearMTLSCache = clearMTLSCache;
exports.configureGlobalMTLS = configureGlobalMTLS;
var https_1 = require("https");
var memoize_js_1 = require("lodash-es/memoize.js");
var caCerts_js_1 = require("./caCerts.js");
var debug_js_1 = require("./debug.js");
var fsOperations_js_1 = require("./fsOperations.js");
/**
 * Get mTLS configuration from environment variables
 */
exports.getMTLSConfig = (0, memoize_js_1.default)(function () {
    var config = {};
    // Note: NODE_EXTRA_CA_CERTS is automatically handled by Node.js at runtime
    // We don't need to manually load it - Node.js appends it to the built-in CAs automatically
    // Client certificate
    if (process.env.CLAUDE_CODE_CLIENT_CERT) {
        try {
            config.cert = (0, fsOperations_js_1.getFsImplementation)().readFileSync(process.env.CLAUDE_CODE_CLIENT_CERT, { encoding: 'utf8' });
            (0, debug_js_1.logForDebugging)('mTLS: Loaded client certificate from CLAUDE_CODE_CLIENT_CERT');
        }
        catch (error) {
            (0, debug_js_1.logForDebugging)("mTLS: Failed to load client certificate: ".concat(error), {
                level: 'error',
            });
        }
    }
    // Client key
    if (process.env.CLAUDE_CODE_CLIENT_KEY) {
        try {
            config.key = (0, fsOperations_js_1.getFsImplementation)().readFileSync(process.env.CLAUDE_CODE_CLIENT_KEY, { encoding: 'utf8' });
            (0, debug_js_1.logForDebugging)('mTLS: Loaded client key from CLAUDE_CODE_CLIENT_KEY');
        }
        catch (error) {
            (0, debug_js_1.logForDebugging)("mTLS: Failed to load client key: ".concat(error), {
                level: 'error',
            });
        }
    }
    // Key passphrase
    if (process.env.CLAUDE_CODE_CLIENT_KEY_PASSPHRASE) {
        config.passphrase = process.env.CLAUDE_CODE_CLIENT_KEY_PASSPHRASE;
        (0, debug_js_1.logForDebugging)('mTLS: Using client key passphrase');
    }
    // Only return config if at least one option is set
    if (Object.keys(config).length === 0) {
        return undefined;
    }
    return config;
});
/**
 * Create an HTTPS agent with mTLS configuration
 */
exports.getMTLSAgent = (0, memoize_js_1.default)(function () {
    var mtlsConfig = (0, exports.getMTLSConfig)();
    var caCerts = (0, caCerts_js_1.getCACertificates)();
    if (!mtlsConfig && !caCerts) {
        return undefined;
    }
    var agentOptions = __assign(__assign(__assign({}, mtlsConfig), (caCerts && { ca: caCerts })), { 
        // Enable keep-alive for better performance
        keepAlive: true });
    (0, debug_js_1.logForDebugging)('mTLS: Creating HTTPS agent with custom certificates');
    return new https_1.Agent(agentOptions);
});
/**
 * Get TLS options for WebSocket connections
 */
function getWebSocketTLSOptions() {
    var mtlsConfig = (0, exports.getMTLSConfig)();
    var caCerts = (0, caCerts_js_1.getCACertificates)();
    if (!mtlsConfig && !caCerts) {
        return undefined;
    }
    return __assign(__assign({}, mtlsConfig), (caCerts && { ca: caCerts }));
}
/**
 * Get fetch options with TLS configuration (mTLS + CA certs) for undici
 */
function getTLSFetchOptions() {
    var mtlsConfig = (0, exports.getMTLSConfig)();
    var caCerts = (0, caCerts_js_1.getCACertificates)();
    if (!mtlsConfig && !caCerts) {
        return {};
    }
    var tlsConfig = __assign(__assign({}, mtlsConfig), (caCerts && { ca: caCerts }));
    if (typeof Bun !== 'undefined') {
        return { tls: tlsConfig };
    }
    (0, debug_js_1.logForDebugging)('TLS: Created undici agent with custom certificates');
    // Create a custom undici Agent with TLS options. Lazy-required so that
    // the ~1.5MB undici package is only loaded when mTLS/CA certs are configured.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    var undiciMod = require('undici');
    var agent = new undiciMod.Agent({
        connect: __assign({ cert: tlsConfig.cert, key: tlsConfig.key, passphrase: tlsConfig.passphrase }, (tlsConfig.ca && { ca: tlsConfig.ca })),
        pipelining: 1,
    });
    return { dispatcher: agent };
}
/**
 * Clear the mTLS configuration cache.
 */
function clearMTLSCache() {
    var _a, _b, _c, _d;
    (_b = (_a = exports.getMTLSConfig.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (_d = (_c = exports.getMTLSAgent.cache).clear) === null || _d === void 0 ? void 0 : _d.call(_c);
    (0, debug_js_1.logForDebugging)('Cleared mTLS configuration cache');
}
/**
 * Configure global Node.js TLS settings
 */
function configureGlobalMTLS() {
    var mtlsConfig = (0, exports.getMTLSConfig)();
    if (!mtlsConfig) {
        return;
    }
    // NODE_EXTRA_CA_CERTS is automatically handled by Node.js at runtime
    if (process.env.NODE_EXTRA_CA_CERTS) {
        (0, debug_js_1.logForDebugging)('NODE_EXTRA_CA_CERTS detected - Node.js will automatically append to built-in CAs');
    }
}
