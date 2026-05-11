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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RedactedGithubToken_value;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedactedGithubToken = void 0;
exports.importGithubToken = importGithubToken;
exports.createDefaultEnvironment = createDefaultEnvironment;
exports.isSignedIn = isSignedIn;
exports.getCodeWebUrl = getCodeWebUrl;
var axios_1 = require("axios");
var oauth_js_1 = require("../../constants/oauth.js");
var debug_js_1 = require("../../utils/debug.js");
var api_js_1 = require("../../utils/teleport/api.js");
var environments_js_1 = require("../../utils/teleport/environments.js");
var CCR_BYOC_BETA_HEADER = 'ccr-byoc-2025-07-29';
/**
 * Wraps a raw GitHub token so that its string representation is redacted.
 * `String(token)`, template literals, `JSON.stringify(token)`, and any
 * attached error messages will show `[REDACTED:gh-token]` instead of the
 * token value. Call `.reveal()` only at the single point where the raw
 * value is placed into an HTTP body.
 */
var RedactedGithubToken = /** @class */ (function () {
    function RedactedGithubToken(raw) {
        _RedactedGithubToken_value.set(this, void 0);
        __classPrivateFieldSet(this, _RedactedGithubToken_value, raw, "f");
    }
    RedactedGithubToken.prototype.reveal = function () {
        return __classPrivateFieldGet(this, _RedactedGithubToken_value, "f");
    };
    RedactedGithubToken.prototype.toString = function () {
        return '[REDACTED:gh-token]';
    };
    RedactedGithubToken.prototype.toJSON = function () {
        return '[REDACTED:gh-token]';
    };
    RedactedGithubToken.prototype[(_RedactedGithubToken_value = new WeakMap(), Symbol.for('nodejs.util.inspect.custom'))] = function () {
        return '[REDACTED:gh-token]';
    };
    return RedactedGithubToken;
}());
exports.RedactedGithubToken = RedactedGithubToken;
/**
 * POSTs a GitHub token to the CCR backend, which validates it against
 * GitHub's /user endpoint and stores it Fernet-encrypted in sync_user_tokens.
 * The stored token satisfies the same read paths as an OAuth token, so
 * clone/push in claude.ai/code works immediately after this succeeds.
 */
function importGithubToken(token) {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, orgUUID, _a, url, headers, response, err_1;
        var _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    ;
                    return [4 /*yield*/, (0, api_js_1.prepareApiRequest)()];
                case 1:
                    (_b = _d.sent(), accessToken = _b.accessToken, orgUUID = _b.orgUUID);
                    return [3 /*break*/, 3];
                case 2:
                    _a = _d.sent();
                    return [2 /*return*/, { ok: false, error: { kind: 'not_signed_in' } }];
                case 3:
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/v1/code/github/import-token");
                    headers = __assign(__assign({}, (0, api_js_1.getOAuthHeaders)(accessToken)), { 'anthropic-beta': CCR_BYOC_BETA_HEADER, 'x-organization-uuid': orgUUID });
                    _d.label = 4;
                case 4:
                    _d.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, axios_1.default.post(url, { token: token.reveal() }, { headers: headers, timeout: 15000, validateStatus: function () { return true; } })];
                case 5:
                    response = _d.sent();
                    if (response.status === 200) {
                        return [2 /*return*/, { ok: true, result: response.data }];
                    }
                    if (response.status === 400) {
                        return [2 /*return*/, { ok: false, error: { kind: 'invalid_token' } }];
                    }
                    if (response.status === 401) {
                        return [2 /*return*/, { ok: false, error: { kind: 'not_signed_in' } }];
                    }
                    (0, debug_js_1.logForDebugging)("import-token returned ".concat(response.status), {
                        level: 'error',
                    });
                    return [2 /*return*/, { ok: false, error: { kind: 'server', status: response.status } }];
                case 6:
                    err_1 = _d.sent();
                    if (axios_1.default.isAxiosError(err_1)) {
                        // err.config.data would contain the POST body with the raw token.
                        // Do not include it in any log. The error code alone is enough.
                        (0, debug_js_1.logForDebugging)("import-token network error: ".concat((_c = err_1.code) !== null && _c !== void 0 ? _c : 'unknown'), {
                            level: 'error',
                        });
                    }
                    return [2 /*return*/, { ok: false, error: { kind: 'network' } }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function hasExistingEnvironment() {
    return __awaiter(this, void 0, void 0, function () {
        var envs, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, environments_js_1.fetchEnvironments)()];
                case 1:
                    envs = _b.sent();
                    return [2 /*return*/, envs.length > 0];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Best-effort default environment creation. Mirrors the web onboarding's
 * DEFAULT_CLOUD_ENVIRONMENT_REQUEST so a first-time user lands on the
 * composer instead of env-setup. Checks for existing environments first
 * so re-running /web-setup doesn't pile up duplicates. Failures are
 * non-fatal — the token import already succeeded, and the web state
 * machine falls back to env-setup on next load.
 */
function createDefaultEnvironment() {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, orgUUID, _a, url, headers, response, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    ;
                    return [4 /*yield*/, (0, api_js_1.prepareApiRequest)()];
                case 1:
                    (_c = _d.sent(), accessToken = _c.accessToken, orgUUID = _c.orgUUID);
                    return [3 /*break*/, 3];
                case 2:
                    _a = _d.sent();
                    return [2 /*return*/, false];
                case 3: return [4 /*yield*/, hasExistingEnvironment()];
                case 4:
                    if (_d.sent()) {
                        return [2 /*return*/, true];
                    }
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/v1/environment_providers/cloud/create");
                    headers = __assign(__assign({}, (0, api_js_1.getOAuthHeaders)(accessToken)), { 'x-organization-uuid': orgUUID });
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, axios_1.default.post(url, {
                            name: 'Default',
                            kind: 'anthropic_cloud',
                            description: 'Default - trusted network access',
                            config: {
                                environment_type: 'anthropic',
                                cwd: '/home/user',
                                init_script: null,
                                environment: {},
                                languages: [
                                    { name: 'python', version: '3.11' },
                                    { name: 'node', version: '20' },
                                ],
                                network_config: {
                                    allowed_hosts: [],
                                    allow_default_hosts: true,
                                },
                            },
                        }, { headers: headers, timeout: 15000, validateStatus: function () { return true; } })];
                case 6:
                    response = _d.sent();
                    return [2 /*return*/, response.status >= 200 && response.status < 300];
                case 7:
                    _b = _d.sent();
                    return [2 /*return*/, false];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/** Returns true when the user has valid Claude OAuth credentials. */
function isSignedIn() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, api_js_1.prepareApiRequest)()];
                case 1:
                    _b.sent();
                    return [2 /*return*/, true];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getCodeWebUrl() {
    return "".concat((0, oauth_js_1.getOauthConfig)().CLAUDE_AI_ORIGIN, "/code");
}
