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
exports.createAdminRequest = createAdminRequest;
exports.getMyAdminRequests = getMyAdminRequests;
exports.checkAdminRequestEligibility = checkAdminRequestEligibility;
var axios_1 = require("axios");
var oauth_js_1 = require("../../constants/oauth.js");
var api_js_1 = require("../../utils/teleport/api.js");
/**
 * Create an admin request (limit increase or seat upgrade).
 *
 * For Team/Enterprise users who don't have billing/admin permissions,
 * this creates a request that their admin can act on.
 *
 * If a pending request of the same type already exists for this user,
 * returns the existing request instead of creating a new one.
 */
function createAdminRequest(params) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, accessToken, orgUUID, headers, url, response;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, api_js_1.prepareApiRequest)()];
                case 1:
                    _a = _b.sent(), accessToken = _a.accessToken, orgUUID = _a.orgUUID;
                    headers = __assign(__assign({}, (0, api_js_1.getOAuthHeaders)(accessToken)), { 'x-organization-uuid': orgUUID });
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/oauth/organizations/").concat(orgUUID, "/admin_requests");
                    return [4 /*yield*/, axios_1.default.post(url, params, { headers: headers })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
/**
 * Get pending admin request of a specific type for the current user.
 *
 * Returns the pending request if one exists, otherwise null.
 */
function getMyAdminRequests(requestType, statuses) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, accessToken, orgUUID, headers, url, _i, statuses_1, status_1, response;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, api_js_1.prepareApiRequest)()];
                case 1:
                    _a = _b.sent(), accessToken = _a.accessToken, orgUUID = _a.orgUUID;
                    headers = __assign(__assign({}, (0, api_js_1.getOAuthHeaders)(accessToken)), { 'x-organization-uuid': orgUUID });
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/oauth/organizations/").concat(orgUUID, "/admin_requests/me?request_type=").concat(requestType);
                    for (_i = 0, statuses_1 = statuses; _i < statuses_1.length; _i++) {
                        status_1 = statuses_1[_i];
                        url += "&statuses=".concat(status_1);
                    }
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: headers,
                        })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
/**
 * Check if a specific admin request type is allowed for this org.
 */
function checkAdminRequestEligibility(requestType) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, accessToken, orgUUID, headers, url, response;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, api_js_1.prepareApiRequest)()];
                case 1:
                    _a = _b.sent(), accessToken = _a.accessToken, orgUUID = _a.orgUUID;
                    headers = __assign(__assign({}, (0, api_js_1.getOAuthHeaders)(accessToken)), { 'x-organization-uuid': orgUUID });
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/oauth/organizations/").concat(orgUUID, "/admin_requests/eligibility?request_type=").concat(requestType);
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: headers,
                        })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
