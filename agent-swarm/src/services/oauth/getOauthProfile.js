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
exports.getOauthProfileFromApiKey = getOauthProfileFromApiKey;
exports.getOauthProfileFromOauthToken = getOauthProfileFromOauthToken;
var axios_1 = require("axios");
var oauth_js_1 = require("src/constants/oauth.js");
var auth_js_1 = require("src/utils/auth.js");
var config_js_1 = require("src/utils/config.js");
var log_js_1 = require("src/utils/log.js");
function getOauthProfileFromApiKey() {
    return __awaiter(this, void 0, void 0, function () {
        var config, accountUuid, apiKey, endpoint, response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    config = (0, config_js_1.getGlobalConfig)();
                    accountUuid = (_a = config.oauthAccount) === null || _a === void 0 ? void 0 : _a.accountUuid;
                    apiKey = (0, auth_js_1.getAnthropicApiKey)();
                    // Need both account UUID and API key to check
                    if (!accountUuid || !apiKey) {
                        return [2 /*return*/];
                    }
                    endpoint = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/claude_cli_profile");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(endpoint, {
                            headers: {
                                'x-api-key': apiKey,
                                'anthropic-beta': oauth_js_1.OAUTH_BETA_HEADER,
                            },
                            params: {
                                account_uuid: accountUuid,
                            },
                            timeout: 10000,
                        })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    error_1 = _b.sent();
                    (0, log_js_1.logError)(error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getOauthProfileFromOauthToken(accessToken) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/oauth/profile");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(endpoint, {
                            headers: {
                                Authorization: "Bearer ".concat(accessToken),
                                'Content-Type': 'application/json',
                            },
                            timeout: 10000,
                        })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    error_2 = _a.sent();
                    (0, log_js_1.logError)(error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
