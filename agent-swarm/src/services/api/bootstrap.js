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
exports.fetchBootstrapData = fetchBootstrapData;
var axios_1 = require("axios");
var isEqual_js_1 = require("lodash-es/isEqual.js");
var auth_js_1 = require("src/utils/auth.js");
var zod_1 = require("zod");
var oauth_js_1 = require("../../constants/oauth.js");
var config_js_1 = require("../../utils/config.js");
var debug_js_1 = require("../../utils/debug.js");
var http_js_1 = require("../../utils/http.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var log_js_1 = require("../../utils/log.js");
var providers_js_1 = require("../../utils/model/providers.js");
var privacyLevel_js_1 = require("../../utils/privacyLevel.js");
var userAgent_js_1 = require("../../utils/userAgent.js");
var bootstrapResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return zod_1.z.object({
        client_data: zod_1.z.record(zod_1.z.unknown()).nullish(),
        additional_model_options: zod_1.z
            .array(zod_1.z
            .object({
            model: zod_1.z.string(),
            name: zod_1.z.string(),
            description: zod_1.z.string(),
        })
            .transform(function (_a) {
            var model = _a.model, name = _a.name, description = _a.description;
            return ({
                value: model,
                label: name,
                description: description,
            });
        }))
            .nullish(),
    });
});
function fetchBootstrapAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, hasUsableOAuth, endpoint, error_1;
        var _this = this;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if ((0, privacyLevel_js_1.isEssentialTrafficOnly)()) {
                        (0, debug_js_1.logForDebugging)('[Bootstrap] Skipped: Nonessential traffic disabled');
                        return [2 /*return*/, null];
                    }
                    if ((0, providers_js_1.getAPIProvider)() !== 'firstParty') {
                        (0, debug_js_1.logForDebugging)('[Bootstrap] Skipped: 3P provider');
                        return [2 /*return*/, null];
                    }
                    apiKey = (0, auth_js_1.getAnthropicApiKey)();
                    hasUsableOAuth = ((_a = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _a === void 0 ? void 0 : _a.accessToken) && (0, auth_js_1.hasProfileScope)();
                    if (!hasUsableOAuth && !apiKey) {
                        (0, debug_js_1.logForDebugging)('[Bootstrap] Skipped: no usable OAuth or API key');
                        return [2 /*return*/, null];
                    }
                    endpoint = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/claude_cli/bootstrap");
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, http_js_1.withOAuth401Retry)(function () { return __awaiter(_this, void 0, void 0, function () {
                            var token, authHeaders, response, parsed;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        token = (_a = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _a === void 0 ? void 0 : _a.accessToken;
                                        if (token && (0, auth_js_1.hasProfileScope)()) {
                                            authHeaders = {
                                                Authorization: "Bearer ".concat(token),
                                                'anthropic-beta': oauth_js_1.OAUTH_BETA_HEADER,
                                            };
                                        }
                                        else if (apiKey) {
                                            authHeaders = { 'x-api-key': apiKey };
                                        }
                                        else {
                                            (0, debug_js_1.logForDebugging)('[Bootstrap] No auth available on retry, aborting');
                                            return [2 /*return*/, null];
                                        }
                                        (0, debug_js_1.logForDebugging)('[Bootstrap] Fetching');
                                        return [4 /*yield*/, axios_1.default.get(endpoint, {
                                                headers: __assign({ 'Content-Type': 'application/json', 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)() }, authHeaders),
                                                timeout: 5000,
                                            })];
                                    case 1:
                                        response = _b.sent();
                                        parsed = bootstrapResponseSchema().safeParse(response.data);
                                        if (!parsed.success) {
                                            (0, debug_js_1.logForDebugging)("[Bootstrap] Response failed validation: ".concat(parsed.error.message));
                                            return [2 /*return*/, null];
                                        }
                                        (0, debug_js_1.logForDebugging)('[Bootstrap] Fetch ok');
                                        return [2 /*return*/, parsed.data];
                                }
                            });
                        }); })];
                case 2: return [2 /*return*/, _d.sent()];
                case 3:
                    error_1 = _d.sent();
                    (0, debug_js_1.logForDebugging)("[Bootstrap] Fetch failed: ".concat(axios_1.default.isAxiosError(error_1) ? ((_c = (_b = error_1.response) === null || _b === void 0 ? void 0 : _b.status) !== null && _c !== void 0 ? _c : error_1.code) : 'unknown'));
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch bootstrap data from the API and persist to disk cache.
 */
function fetchBootstrapData() {
    return __awaiter(this, void 0, void 0, function () {
        var response, clientData_1, additionalModelOptions_1, config, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchBootstrapAPI()];
                case 1:
                    response = _c.sent();
                    if (!response)
                        return [2 /*return*/];
                    clientData_1 = (_a = response.client_data) !== null && _a !== void 0 ? _a : null;
                    additionalModelOptions_1 = (_b = response.additional_model_options) !== null && _b !== void 0 ? _b : [];
                    config = (0, config_js_1.getGlobalConfig)();
                    if ((0, isEqual_js_1.default)(config.clientDataCache, clientData_1) &&
                        (0, isEqual_js_1.default)(config.additionalModelOptionsCache, additionalModelOptions_1)) {
                        (0, debug_js_1.logForDebugging)('[Bootstrap] Cache unchanged, skipping write');
                        return [2 /*return*/];
                    }
                    (0, debug_js_1.logForDebugging)('[Bootstrap] Cache updated, persisting to disk');
                    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { clientDataCache: clientData_1, additionalModelOptionsCache: additionalModelOptions_1 })); });
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _c.sent();
                    (0, log_js_1.logError)(error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
