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
exports.registerMcpXaaIdpCommand = registerMcpXaaIdpCommand;
var exit_js_1 = require("../../cli/exit.js");
var xaaIdpLogin_js_1 = require("../../services/mcp/xaaIdpLogin.js");
var errors_js_1 = require("../../utils/errors.js");
var settings_js_1 = require("../../utils/settings/settings.js");
function registerMcpXaaIdpCommand(mcp) {
    var _this = this;
    var xaaIdp = mcp
        .command('xaa')
        .description('Manage the XAA (SEP-990) IdP connection');
    xaaIdp
        .command('setup')
        .description('Configure the IdP connection (one-time setup for all XAA-enabled servers)')
        .requiredOption('--issuer <url>', 'IdP issuer URL (OIDC discovery)')
        .requiredOption('--client-id <id>', "Claude Code's client_id at the IdP")
        .option('--client-secret', 'Read IdP client secret from MCP_XAA_IDP_CLIENT_SECRET env var')
        .option('--callback-port <port>', 'Fixed loopback callback port (only if IdP does not honor RFC 8252 port-any matching)')
        .action(function (options) {
        // Validate everything BEFORE any writes. An exit(1) mid-write leaves
        // settings configured but keychain missing — confusing state.
        // updateSettingsForSource doesn't schema-check on write; a non-URL
        // issuer lands on disk and then poisons the whole userSettings source
        // on next launch (SettingsSchema .url() fails → parseSettingsFile
        // returns { settings: null }, dropping everything, not just xaaIdp).
        var issuerUrl;
        try {
            issuerUrl = new URL(options.issuer);
        }
        catch (_a) {
            return (0, exit_js_1.cliError)("Error: --issuer must be a valid URL (got \"".concat(options.issuer, "\")"));
        }
        // OIDC discovery + token exchange run against this host. Allow http://
        // only for loopback (conformance harness mock IdP); anything else leaks
        // the client secret and authorization code over plaintext.
        if (issuerUrl.protocol !== 'https:' &&
            !(issuerUrl.protocol === 'http:' &&
                (issuerUrl.hostname === 'localhost' ||
                    issuerUrl.hostname === '127.0.0.1' ||
                    issuerUrl.hostname === '[::1]'))) {
            return (0, exit_js_1.cliError)("Error: --issuer must use https:// (got \"".concat(issuerUrl.protocol, "//").concat(issuerUrl.host, "\")"));
        }
        var callbackPort = options.callbackPort
            ? parseInt(options.callbackPort, 10)
            : undefined;
        // callbackPort <= 0 fails Zod's .positive() on next launch — same
        // settings-poisoning failure mode as the issuer check above.
        if (callbackPort !== undefined &&
            (!Number.isInteger(callbackPort) || callbackPort <= 0)) {
            return (0, exit_js_1.cliError)('Error: --callback-port must be a positive integer');
        }
        var secret = options.clientSecret
            ? process.env.MCP_XAA_IDP_CLIENT_SECRET
            : undefined;
        if (options.clientSecret && !secret) {
            return (0, exit_js_1.cliError)('Error: --client-secret requires MCP_XAA_IDP_CLIENT_SECRET env var');
        }
        // Read old config now (before settings overwrite) so we can clear stale
        // keychain slots after a successful write. `clear` can't do this after
        // the fact — it reads the *current* settings.xaaIdp, which by then is
        // the new one.
        var old = (0, xaaIdpLogin_js_1.getXaaIdpSettings)();
        var oldIssuer = old === null || old === void 0 ? void 0 : old.issuer;
        var oldClientId = old === null || old === void 0 ? void 0 : old.clientId;
        // callbackPort MUST be present (even as undefined) — mergeWith deep-merges
        // and only deletes on explicit `undefined`, not on absent key. A conditional
        // spread would leak a prior fixed port into a new IdP's config.
        var error = (0, settings_js_1.updateSettingsForSource)('userSettings', {
            xaaIdp: {
                issuer: options.issuer,
                clientId: options.clientId,
                callbackPort: callbackPort,
            },
        }).error;
        if (error) {
            return (0, exit_js_1.cliError)("Error writing settings: ".concat(error.message));
        }
        // Clear stale keychain slots only after settings write succeeded —
        // otherwise a write failure leaves settings pointing at oldIssuer with
        // its secret already gone. Compare via issuerKey(): trailing-slash or
        // host-case differences normalize to the same keychain slot.
        if (oldIssuer) {
            if ((0, xaaIdpLogin_js_1.issuerKey)(oldIssuer) !== (0, xaaIdpLogin_js_1.issuerKey)(options.issuer)) {
                (0, xaaIdpLogin_js_1.clearIdpIdToken)(oldIssuer);
                (0, xaaIdpLogin_js_1.clearIdpClientSecret)(oldIssuer);
            }
            else if (oldClientId !== options.clientId) {
                // Same issuer slot but different OAuth client registration — the
                // cached id_token's aud claim and the stored secret are both for the
                // old client. `xaa login` would send {new clientId, old secret} and
                // fail with opaque `invalid_client`; downstream SEP-990 exchange
                // would fail aud validation. Keep both when clientId is unchanged:
                // re-setup without --client-secret means "tweak port, keep secret".
                (0, xaaIdpLogin_js_1.clearIdpIdToken)(oldIssuer);
                (0, xaaIdpLogin_js_1.clearIdpClientSecret)(oldIssuer);
            }
        }
        if (secret) {
            var _b = (0, xaaIdpLogin_js_1.saveIdpClientSecret)(options.issuer, secret), success = _b.success, warning = _b.warning;
            if (!success) {
                return (0, exit_js_1.cliError)("Error: settings written but keychain save failed".concat(warning ? " \u2014 ".concat(warning) : '', ". ") +
                    "Re-run with --client-secret once keychain is available.");
            }
        }
        (0, exit_js_1.cliOk)("XAA IdP connection configured for ".concat(options.issuer));
    });
    xaaIdp
        .command('login')
        .description('Cache an IdP id_token so XAA-enabled MCP servers authenticate ' +
        'silently. Default: run the OIDC browser login. With --id-token: ' +
        'write a pre-obtained JWT directly (used by conformance/e2e tests ' +
        'where the mock IdP does not serve /authorize).')
        .option('--force', 'Ignore any cached id_token and re-login (useful after IdP-side revocation)')
        // TODO(paulc): read the JWT from stdin instead of argv to keep it out of
        // shell history. Fine for conformance (docker exec uses argv directly,
        // no shell parser), but a real user would want `echo $TOKEN | ... --stdin`.
        .option('--id-token <jwt>', 'Write this pre-obtained id_token directly to cache, skipping the OIDC browser login')
        .action(function (options) { return __awaiter(_this, void 0, void 0, function () {
        var idp, expiresAt, wasCached, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    idp = (0, xaaIdpLogin_js_1.getXaaIdpSettings)();
                    if (!idp) {
                        return [2 /*return*/, (0, exit_js_1.cliError)("Error: no XAA IdP connection. Run 'claude mcp xaa setup' first.")];
                    }
                    // Direct-inject path: skip cache check, skip OIDC. Writing IS the
                    // operation. Issuer comes from settings (single source of truth), not
                    // a separate flag — one less thing to desync.
                    if (options.idToken) {
                        expiresAt = (0, xaaIdpLogin_js_1.saveIdpIdTokenFromJwt)(idp.issuer, options.idToken);
                        return [2 /*return*/, (0, exit_js_1.cliOk)("id_token cached for ".concat(idp.issuer, " (expires ").concat(new Date(expiresAt).toISOString(), ")"))];
                    }
                    if (options.force) {
                        (0, xaaIdpLogin_js_1.clearIdpIdToken)(idp.issuer);
                    }
                    wasCached = (0, xaaIdpLogin_js_1.getCachedIdpIdToken)(idp.issuer) !== undefined;
                    if (wasCached) {
                        return [2 /*return*/, (0, exit_js_1.cliOk)("Already logged in to ".concat(idp.issuer, " (cached id_token still valid). Use --force to re-login."))];
                    }
                    process.stdout.write("Opening browser for IdP login at ".concat(idp.issuer, "\u2026\n"));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, xaaIdpLogin_js_1.acquireIdpIdToken)({
                            idpIssuer: idp.issuer,
                            idpClientId: idp.clientId,
                            idpClientSecret: (0, xaaIdpLogin_js_1.getIdpClientSecret)(idp.issuer),
                            callbackPort: idp.callbackPort,
                            onAuthorizationUrl: function (url) {
                                process.stdout.write("If the browser did not open, visit:\n  ".concat(url, "\n"));
                            },
                        })];
                case 2:
                    _a.sent();
                    (0, exit_js_1.cliOk)("Logged in. MCP servers with --xaa will now authenticate silently.");
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    (0, exit_js_1.cliError)("IdP login failed: ".concat((0, errors_js_1.errorMessage)(e_1)));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    xaaIdp
        .command('show')
        .description('Show the current IdP connection config')
        .action(function () {
        var idp = (0, xaaIdpLogin_js_1.getXaaIdpSettings)();
        if (!idp) {
            return (0, exit_js_1.cliOk)('No XAA IdP connection configured.');
        }
        var hasSecret = (0, xaaIdpLogin_js_1.getIdpClientSecret)(idp.issuer) !== undefined;
        var hasIdToken = (0, xaaIdpLogin_js_1.getCachedIdpIdToken)(idp.issuer) !== undefined;
        process.stdout.write("Issuer:        ".concat(idp.issuer, "\n"));
        process.stdout.write("Client ID:     ".concat(idp.clientId, "\n"));
        if (idp.callbackPort !== undefined) {
            process.stdout.write("Callback port: ".concat(idp.callbackPort, "\n"));
        }
        process.stdout.write("Client secret: ".concat(hasSecret ? '(stored in keychain)' : '(not set — PKCE-only)', "\n"));
        process.stdout.write("Logged in:     ".concat(hasIdToken ? 'yes (id_token cached)' : "no — run 'claude mcp xaa login'", "\n"));
        (0, exit_js_1.cliOk)();
    });
    xaaIdp
        .command('clear')
        .description('Clear the IdP connection config and cached id_token')
        .action(function () {
        // Read issuer first so we can clear the right keychain slots.
        var idp = (0, xaaIdpLogin_js_1.getXaaIdpSettings)();
        // updateSettingsForSource uses mergeWith: set to undefined (not delete)
        // to signal key removal.
        var error = (0, settings_js_1.updateSettingsForSource)('userSettings', {
            xaaIdp: undefined,
        }).error;
        if (error) {
            return (0, exit_js_1.cliError)("Error writing settings: ".concat(error.message));
        }
        // Clear keychain only after settings write succeeded — otherwise a
        // write failure leaves settings pointing at the IdP with its secrets
        // already gone (same pattern as `setup`'s old-issuer cleanup).
        if (idp) {
            (0, xaaIdpLogin_js_1.clearIdpIdToken)(idp.issuer);
            (0, xaaIdpLogin_js_1.clearIdpClientSecret)(idp.issuer);
        }
        (0, exit_js_1.cliOk)('XAA IdP connection cleared');
    });
}
