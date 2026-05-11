"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCACertificates = void 0;
exports.clearCACertsCache = clearCACertsCache;
var memoize_js_1 = require("lodash-es/memoize.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var fsOperations_js_1 = require("./fsOperations.js");
/**
 * Load CA certificates for TLS connections.
 *
 * Since setting `ca` on an HTTPS agent replaces the default certificate store,
 * we must always include base CAs (either system or bundled Mozilla) when returning.
 *
 * Returns undefined when no custom CA configuration is needed, allowing the
 * runtime's default certificate handling to apply.
 *
 * Behavior:
 * - Neither NODE_EXTRA_CA_CERTS nor --use-system-ca/--use-openssl-ca set: undefined (runtime defaults)
 * - NODE_EXTRA_CA_CERTS only: bundled Mozilla CAs + extra cert file contents
 * - --use-system-ca or --use-openssl-ca only: system CAs
 * - --use-system-ca + NODE_EXTRA_CA_CERTS: system CAs + extra cert file contents
 *
 * Memoized for performance. Call clearCACertsCache() to invalidate after
 * environment variable changes (e.g., after trust dialog applies settings.json).
 *
 * Reads ONLY `process.env.NODE_EXTRA_CA_CERTS`. `caCertsConfig.ts` populates
 * that env var from settings.json at CLI init; this module stays config-free
 * so `proxy.ts`/`mtls.ts` don't transitively pull in the command registry.
 */
exports.getCACertificates = (0, memoize_js_1.default)(function () {
    var useSystemCA = (0, envUtils_js_1.hasNodeOption)('--use-system-ca') || (0, envUtils_js_1.hasNodeOption)('--use-openssl-ca');
    var extraCertsPath = process.env.NODE_EXTRA_CA_CERTS;
    (0, debug_js_1.logForDebugging)("CA certs: useSystemCA=".concat(useSystemCA, ", extraCertsPath=").concat(extraCertsPath));
    // If neither is set, return undefined (use runtime defaults, no override)
    if (!useSystemCA && !extraCertsPath) {
        return undefined;
    }
    // Deferred load: Bun's node:tls module eagerly materializes ~150 Mozilla
    // root certificates (~750KB heap) on import, even if tls.rootCertificates
    // is never accessed. Most users hit the early return above, so we only
    // pay this cost when custom CA handling is actually needed.
    /* eslint-disable @typescript-eslint/no-require-imports */
    var tls = require('tls');
    /* eslint-enable @typescript-eslint/no-require-imports */
    var certs = [];
    if (useSystemCA) {
        // Load system CA store (Bun API)
        var getCACerts = tls.getCACertificates;
        var systemCAs = getCACerts === null || getCACerts === void 0 ? void 0 : getCACerts('system');
        if (systemCAs && systemCAs.length > 0) {
            certs.push.apply(certs, systemCAs);
            (0, debug_js_1.logForDebugging)("CA certs: Loaded ".concat(certs.length, " system CA certificates (--use-system-ca)"));
        }
        else if (!getCACerts && !extraCertsPath) {
            // Under Node.js where getCACertificates doesn't exist and no extra certs,
            // return undefined to let Node.js handle --use-system-ca natively.
            (0, debug_js_1.logForDebugging)('CA certs: --use-system-ca set but system CA API unavailable, deferring to runtime');
            return undefined;
        }
        else {
            // System CA API returned empty or unavailable; fall back to bundled root certs
            certs.push.apply(certs, tls.rootCertificates);
            (0, debug_js_1.logForDebugging)("CA certs: Loaded ".concat(certs.length, " bundled root certificates as base (--use-system-ca fallback)"));
        }
    }
    else {
        // Must include bundled Mozilla CAs as base since ca replaces defaults
        certs.push.apply(certs, tls.rootCertificates);
        (0, debug_js_1.logForDebugging)("CA certs: Loaded ".concat(certs.length, " bundled root certificates as base"));
    }
    // Append extra certs from file
    if (extraCertsPath) {
        try {
            var extraCert = (0, fsOperations_js_1.getFsImplementation)().readFileSync(extraCertsPath, {
                encoding: 'utf8',
            });
            certs.push(extraCert);
            (0, debug_js_1.logForDebugging)("CA certs: Appended extra certificates from NODE_EXTRA_CA_CERTS (".concat(extraCertsPath, ")"));
        }
        catch (error) {
            (0, debug_js_1.logForDebugging)("CA certs: Failed to read NODE_EXTRA_CA_CERTS file (".concat(extraCertsPath, "): ").concat(error), { level: 'error' });
        }
    }
    return certs.length > 0 ? certs : undefined;
});
/**
 * Clear the CA certificates cache.
 * Call this when environment variables that affect CA certs may have changed
 * (e.g., NODE_EXTRA_CA_CERTS, NODE_OPTIONS).
 */
function clearCACertsCache() {
    var _a, _b;
    (_b = (_a = exports.getCACertificates.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (0, debug_js_1.logForDebugging)('Cleared CA certificates cache');
}
