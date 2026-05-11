"use strict";
/**
 * Thin HTTP wrappers for the CCR v2 code-session API.
 *
 * Separate file from remoteBridgeCore.ts so the SDK /bridge subpath can
 * export createCodeSession + fetchRemoteCredentials without bundling the
 * heavy CLI tree (analytics, transport, etc.). Callers supply explicit
 * accessToken + baseUrl — no implicit auth or config reads.
 */
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
exports.createCodeSession = createCodeSession;
exports.fetchRemoteCredentials = fetchRemoteCredentials;
var axios_1 = require("axios");
var debug_js_1 = require("../utils/debug.js");
var errors_js_1 = require("../utils/errors.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var debugUtils_js_1 = require("./debugUtils.js");
var ANTHROPIC_VERSION = '2023-06-01';
function oauthHeaders(accessToken) {
    return {
        Authorization: "Bearer ".concat(accessToken),
        'Content-Type': 'application/json',
        'anthropic-version': ANTHROPIC_VERSION,
    };
}
function createCodeSession(baseUrl, accessToken, title, timeoutMs, tags) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, err_1, detail, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "".concat(baseUrl, "/v1/code/sessions");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post(url, __assign({ title: title, bridge: {} }, ((tags === null || tags === void 0 ? void 0 : tags.length) ? { tags: tags } : {})), {
                            headers: oauthHeaders(accessToken),
                            timeout: timeoutMs,
                            validateStatus: function (s) { return s < 500; },
                        })];
                case 2:
                    response = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[code-session] Session create request failed: ".concat((0, errors_js_1.errorMessage)(err_1)));
                    return [2 /*return*/, null];
                case 4:
                    if (response.status !== 200 && response.status !== 201) {
                        detail = (0, debugUtils_js_1.extractErrorDetail)(response.data);
                        (0, debug_js_1.logForDebugging)("[code-session] Session create failed ".concat(response.status).concat(detail ? ": ".concat(detail) : ''));
                        return [2 /*return*/, null];
                    }
                    data = response.data;
                    if (!data ||
                        typeof data !== 'object' ||
                        !('session' in data) ||
                        !data.session ||
                        typeof data.session !== 'object' ||
                        !('id' in data.session) ||
                        typeof data.session.id !== 'string' ||
                        !data.session.id.startsWith('cse_')) {
                        (0, debug_js_1.logForDebugging)("[code-session] No session.id (cse_*) in response: ".concat((0, slowOperations_js_1.jsonStringify)(data).slice(0, 200)));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, data.session.id];
            }
        });
    });
}
function fetchRemoteCredentials(sessionId, baseUrl, accessToken, timeoutMs, trustedDeviceToken) {
    return __awaiter(this, void 0, void 0, function () {
        var url, headers, response, err_2, detail, data, rawEpoch, epoch;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "".concat(baseUrl, "/v1/code/sessions/").concat(sessionId, "/bridge");
                    headers = oauthHeaders(accessToken);
                    if (trustedDeviceToken) {
                        headers['X-Trusted-Device-Token'] = trustedDeviceToken;
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post(url, {}, {
                            headers: headers,
                            timeout: timeoutMs,
                            validateStatus: function (s) { return s < 500; },
                        })];
                case 2:
                    response = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[code-session] /bridge request failed: ".concat((0, errors_js_1.errorMessage)(err_2)));
                    return [2 /*return*/, null];
                case 4:
                    if (response.status !== 200) {
                        detail = (0, debugUtils_js_1.extractErrorDetail)(response.data);
                        (0, debug_js_1.logForDebugging)("[code-session] /bridge failed ".concat(response.status).concat(detail ? ": ".concat(detail) : ''));
                        return [2 /*return*/, null];
                    }
                    data = response.data;
                    if (data === null ||
                        typeof data !== 'object' ||
                        !('worker_jwt' in data) ||
                        typeof data.worker_jwt !== 'string' ||
                        !('expires_in' in data) ||
                        typeof data.expires_in !== 'number' ||
                        !('api_base_url' in data) ||
                        typeof data.api_base_url !== 'string' ||
                        !('worker_epoch' in data)) {
                        (0, debug_js_1.logForDebugging)("[code-session] /bridge response malformed (need worker_jwt, expires_in, api_base_url, worker_epoch): ".concat((0, slowOperations_js_1.jsonStringify)(data).slice(0, 200)));
                        return [2 /*return*/, null];
                    }
                    rawEpoch = data.worker_epoch;
                    epoch = typeof rawEpoch === 'string' ? Number(rawEpoch) : rawEpoch;
                    if (typeof epoch !== 'number' ||
                        !Number.isFinite(epoch) ||
                        !Number.isSafeInteger(epoch)) {
                        (0, debug_js_1.logForDebugging)("[code-session] /bridge worker_epoch invalid: ".concat((0, slowOperations_js_1.jsonStringify)(rawEpoch)));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, {
                            worker_jwt: data.worker_jwt,
                            api_base_url: data.api_base_url,
                            expires_in: data.expires_in,
                            worker_epoch: epoch,
                        }];
            }
        });
    });
}
