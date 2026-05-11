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
exports.fetchAndStoreClaudeCodeFirstTokenDate = fetchAndStoreClaudeCodeFirstTokenDate;
var axios_1 = require("axios");
var oauth_js_1 = require("../../constants/oauth.js");
var config_js_1 = require("../../utils/config.js");
var http_js_1 = require("../../utils/http.js");
var log_js_1 = require("../../utils/log.js");
var userAgent_js_1 = require("../../utils/userAgent.js");
/**
 * Fetch the user's first Claude Code token date and store in config.
 * This is called after successful login to cache when they started using Claude Code.
 */
function fetchAndStoreClaudeCodeFirstTokenDate() {
    return __awaiter(this, void 0, void 0, function () {
        var config, authHeaders, oauthConfig, url, response, firstTokenDate_1, dateTime, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    config = (0, config_js_1.getGlobalConfig)();
                    if (config.claudeCodeFirstTokenDate !== undefined) {
                        return [2 /*return*/];
                    }
                    authHeaders = (0, http_js_1.getAuthHeaders)();
                    if (authHeaders.error) {
                        (0, log_js_1.logError)(new Error("Failed to get auth headers: ".concat(authHeaders.error)));
                        return [2 /*return*/];
                    }
                    oauthConfig = (0, oauth_js_1.getOauthConfig)();
                    url = "".concat(oauthConfig.BASE_API_URL, "/api/organization/claude_code_first_token_date");
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: __assign(__assign({}, authHeaders.headers), { 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)() }),
                            timeout: 10000,
                        })];
                case 1:
                    response = _c.sent();
                    firstTokenDate_1 = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.first_token_date) !== null && _b !== void 0 ? _b : null;
                    // Validate the date if it's not null
                    if (firstTokenDate_1 !== null) {
                        dateTime = new Date(firstTokenDate_1).getTime();
                        if (isNaN(dateTime)) {
                            (0, log_js_1.logError)(new Error("Received invalid first_token_date from API: ".concat(firstTokenDate_1)));
                            // Don't save invalid dates
                            return [2 /*return*/];
                        }
                    }
                    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { claudeCodeFirstTokenDate: firstTokenDate_1 })); });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _c.sent();
                    (0, log_js_1.logError)(error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
