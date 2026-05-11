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
exports.buildRedirectUri = buildRedirectUri;
exports.findAvailablePort = findAvailablePort;
/**
 * OAuth redirect port helpers — extracted from auth.ts to break the
 * auth.ts ↔ xaaIdpLogin.ts circular dependency.
 */
var http_1 = require("http");
var platform_js_1 = require("../../utils/platform.js");
// Windows dynamic port range 49152-65535 is reserved
var REDIRECT_PORT_RANGE = (0, platform_js_1.getPlatform)() === 'windows'
    ? { min: 39152, max: 49151 }
    : { min: 49152, max: 65535 };
var REDIRECT_PORT_FALLBACK = 3118;
/**
 * Builds a redirect URI on localhost with the given port and a fixed `/callback` path.
 *
 * RFC 8252 Section 7.3 (OAuth for Native Apps): loopback redirect URIs match any
 * port as long as the path matches.
 */
function buildRedirectUri(port) {
    if (port === void 0) { port = REDIRECT_PORT_FALLBACK; }
    return "http://localhost:".concat(port, "/callback");
}
function getMcpOAuthCallbackPort() {
    var port = parseInt(process.env.MCP_OAUTH_CALLBACK_PORT || '', 10);
    return port > 0 ? port : undefined;
}
/**
 * Finds an available port in the specified range for OAuth redirect
 * Uses random selection for better security
 */
function findAvailablePort() {
    return __awaiter(this, void 0, void 0, function () {
        var configuredPort, min, max, range, maxAttempts, _loop_1, attempt, state_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    configuredPort = getMcpOAuthCallbackPort();
                    if (configuredPort) {
                        return [2 /*return*/, configuredPort];
                    }
                    min = REDIRECT_PORT_RANGE.min, max = REDIRECT_PORT_RANGE.max;
                    range = max - min + 1;
                    maxAttempts = Math.min(range, 100) // Don't try forever
                    ;
                    _loop_1 = function (attempt) {
                        var port, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    port = min + Math.floor(Math.random() * range);
                                    _d.label = 1;
                                case 1:
                                    _d.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                                            var testServer = (0, http_1.createServer)();
                                            testServer.once('error', reject);
                                            testServer.listen(port, function () {
                                                testServer.close(function () { return resolve(); });
                                            });
                                        })];
                                case 2:
                                    _d.sent();
                                    return [2 /*return*/, { value: port }];
                                case 3:
                                    _c = _d.sent();
                                    return [2 /*return*/, "continue"];
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 0;
                    _b.label = 1;
                case 1:
                    if (!(attempt < maxAttempts)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1 = _b.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _b.label = 3;
                case 3:
                    attempt++;
                    return [3 /*break*/, 1];
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            var testServer = (0, http_1.createServer)();
                            testServer.once('error', reject);
                            testServer.listen(REDIRECT_PORT_FALLBACK, function () {
                                testServer.close(function () { return resolve(); });
                            });
                        })];
                case 5:
                    _b.sent();
                    return [2 /*return*/, REDIRECT_PORT_FALLBACK];
                case 6:
                    _a = _b.sent();
                    throw new Error("No available ports for OAuth redirect");
                case 7: return [2 /*return*/];
            }
        });
    });
}
