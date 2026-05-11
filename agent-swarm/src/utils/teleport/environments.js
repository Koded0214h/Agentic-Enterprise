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
exports.fetchEnvironments = fetchEnvironments;
exports.createDefaultCloudEnvironment = createDefaultCloudEnvironment;
var axios_1 = require("axios");
var oauth_js_1 = require("src/constants/oauth.js");
var client_js_1 = require("src/services/oauth/client.js");
var auth_js_1 = require("../auth.js");
var errors_js_1 = require("../errors.js");
var log_js_1 = require("../log.js");
var api_js_1 = require("./api.js");
/**
 * Fetches the list of available environments from the Environment API
 * @returns Promise<EnvironmentResource[]> Array of available environments
 * @throws Error if the API request fails or no access token is available
 */
function fetchEnvironments() {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, orgUUID, url, headers, response, error_1, err;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    accessToken = (_a = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _a === void 0 ? void 0 : _a.accessToken;
                    if (!accessToken) {
                        throw new Error('Claude Code web sessions require authentication with a Claude.ai account. API key authentication is not sufficient. Please run /login to authenticate, or check your authentication status with /status.');
                    }
                    return [4 /*yield*/, (0, client_js_1.getOrganizationUUID)()];
                case 1:
                    orgUUID = _b.sent();
                    if (!orgUUID) {
                        throw new Error('Unable to get organization UUID');
                    }
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/v1/environment_providers");
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    headers = __assign(__assign({}, (0, api_js_1.getOAuthHeaders)(accessToken)), { 'x-organization-uuid': orgUUID });
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: headers,
                            timeout: 15000,
                        })];
                case 3:
                    response = _b.sent();
                    if (response.status !== 200) {
                        throw new Error("Failed to fetch environments: ".concat(response.status, " ").concat(response.statusText));
                    }
                    return [2 /*return*/, response.data.environments];
                case 4:
                    error_1 = _b.sent();
                    err = (0, errors_js_1.toError)(error_1);
                    (0, log_js_1.logError)(err);
                    throw new Error("Failed to fetch environments: ".concat(err.message));
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Creates a default anthropic_cloud environment for users who have none.
 * Uses the public environment_providers route (same auth as fetchEnvironments).
 */
function createDefaultCloudEnvironment(name) {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, orgUUID, url, response;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    accessToken = (_a = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _a === void 0 ? void 0 : _a.accessToken;
                    if (!accessToken) {
                        throw new Error('No access token available');
                    }
                    return [4 /*yield*/, (0, client_js_1.getOrganizationUUID)()];
                case 1:
                    orgUUID = _b.sent();
                    if (!orgUUID) {
                        throw new Error('Unable to get organization UUID');
                    }
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/v1/environment_providers/cloud/create");
                    return [4 /*yield*/, axios_1.default.post(url, {
                            name: name,
                            kind: 'anthropic_cloud',
                            description: '',
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
                        }, {
                            headers: __assign(__assign({}, (0, api_js_1.getOAuthHeaders)(accessToken)), { 'anthropic-beta': 'ccr-byoc-2025-07-29', 'x-organization-uuid': orgUUID }),
                            timeout: 15000,
                        })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
