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
exports.prefetchOfficialMcpUrls = prefetchOfficialMcpUrls;
exports.isOfficialMcpUrl = isOfficialMcpUrl;
exports.resetOfficialMcpUrlsForTesting = resetOfficialMcpUrlsForTesting;
var axios_1 = require("axios");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
// URLs stripped of query string and trailing slash — matches the normalization
// done by getLoggingSafeMcpBaseUrl so direct Set.has() lookup works.
var officialUrls = undefined;
function normalizeUrl(url) {
    try {
        var u = new URL(url);
        u.search = '';
        return u.toString().replace(/\/$/, '');
    }
    catch (_a) {
        return undefined;
    }
}
/**
 * Fire-and-forget fetch of the official MCP registry.
 * Populates officialUrls for isOfficialMcpUrl lookups.
 */
function prefetchOfficialMcpUrls() {
    return __awaiter(this, void 0, void 0, function () {
        var response, urls, _i, _a, entry, _b, _c, remote, normalized, error_1;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (process.env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC) {
                        return [2 /*return*/];
                    }
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get('https://api.anthropic.com/mcp-registry/v0/servers?version=latest&visibility=commercial', { timeout: 5000 })];
                case 2:
                    response = _e.sent();
                    urls = new Set();
                    for (_i = 0, _a = response.data.servers; _i < _a.length; _i++) {
                        entry = _a[_i];
                        for (_b = 0, _c = (_d = entry.server.remotes) !== null && _d !== void 0 ? _d : []; _b < _c.length; _b++) {
                            remote = _c[_b];
                            normalized = normalizeUrl(remote.url);
                            if (normalized) {
                                urls.add(normalized);
                            }
                        }
                    }
                    officialUrls = urls;
                    (0, debug_js_1.logForDebugging)("[mcp-registry] Loaded ".concat(urls.size, " official MCP URLs"));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _e.sent();
                    (0, debug_js_1.logForDebugging)("Failed to fetch MCP registry: ".concat((0, errors_js_1.errorMessage)(error_1)), {
                        level: 'error',
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Returns true iff the given (already-normalized via getLoggingSafeMcpBaseUrl)
 * URL is in the official MCP registry. Undefined registry → false (fail-closed).
 */
function isOfficialMcpUrl(normalizedUrl) {
    var _a;
    return (_a = officialUrls === null || officialUrls === void 0 ? void 0 : officialUrls.has(normalizedUrl)) !== null && _a !== void 0 ? _a : false;
}
function resetOfficialMcpUrlsForTesting() {
    officialUrls = undefined;
}
