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
exports.getMcpHeadersFromHelper = getMcpHeadersFromHelper;
exports.getMcpServerHeaders = getMcpServerHeaders;
var state_js_1 = require("../../bootstrap/state.js");
var config_js_1 = require("../../utils/config.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var execFileNoThrow_js_1 = require("../../utils/execFileNoThrow.js");
var log_js_1 = require("../../utils/log.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var index_js_1 = require("../analytics/index.js");
/**
 * Check if the MCP server config comes from project settings (projectSettings or localSettings)
 * This is important for security checks
 */
function isMcpServerFromProjectOrLocalSettings(config) {
    return config.scope === 'project' || config.scope === 'local';
}
/**
 * Get dynamic headers for an MCP server using the headersHelper script
 * @param serverName The name of the MCP server
 * @param config The MCP server configuration
 * @returns Headers object or null if not configured or failed
 */
function getMcpHeadersFromHelper(serverName, config) {
    return __awaiter(this, void 0, void 0, function () {
        var hasTrust, error, execResult, result, headers, _i, _a, _b, key, value, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!config.headersHelper) {
                        return [2 /*return*/, null];
                    }
                    // Security check for project/local settings
                    // Skip trust check in non-interactive mode (e.g., CI/CD, automation)
                    if ('scope' in config &&
                        isMcpServerFromProjectOrLocalSettings(config) &&
                        !(0, state_js_1.getIsNonInteractiveSession)()) {
                        hasTrust = (0, config_js_1.checkHasTrustDialogAccepted)();
                        if (!hasTrust) {
                            error = new Error("Security: headersHelper for MCP server '".concat(serverName, "' executed before workspace trust is confirmed. If you see this message, post in ").concat(MACRO.FEEDBACK_CHANNEL, "."));
                            (0, debug_js_1.logAntError)('MCP headersHelper invoked before trust check', error);
                            (0, index_js_1.logEvent)('tengu_mcp_headersHelper_missing_trust', {});
                            return [2 /*return*/, null];
                        }
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    (0, log_js_1.logMCPDebug)(serverName, 'Executing headersHelper to get dynamic headers');
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)(config.headersHelper, [], {
                            shell: true,
                            timeout: 10000,
                            // Pass server context so one helper script can serve multiple MCP servers
                            // (git credential-helper style). See deshaw/anthropic-issues#28.
                            env: __assign(__assign({}, process.env), { CLAUDE_CODE_MCP_SERVER_NAME: serverName, CLAUDE_CODE_MCP_SERVER_URL: config.url }),
                        })];
                case 2:
                    execResult = _c.sent();
                    if (execResult.code !== 0 || !execResult.stdout) {
                        throw new Error("headersHelper for MCP server '".concat(serverName, "' did not return a valid value"));
                    }
                    result = execResult.stdout.trim();
                    headers = (0, slowOperations_js_1.jsonParse)(result);
                    if (typeof headers !== 'object' ||
                        headers === null ||
                        Array.isArray(headers)) {
                        throw new Error("headersHelper for MCP server '".concat(serverName, "' must return a JSON object with string key-value pairs"));
                    }
                    // Validate all values are strings
                    for (_i = 0, _a = Object.entries(headers); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], value = _b[1];
                        if (typeof value !== 'string') {
                            throw new Error("headersHelper for MCP server '".concat(serverName, "' returned non-string value for key \"").concat(key, "\": ").concat(typeof value));
                        }
                    }
                    (0, log_js_1.logMCPDebug)(serverName, "Successfully retrieved ".concat(Object.keys(headers).length, " headers from headersHelper"));
                    return [2 /*return*/, headers];
                case 3:
                    error_1 = _c.sent();
                    (0, log_js_1.logMCPError)(serverName, "Error getting headers from headersHelper: ".concat((0, errors_js_1.errorMessage)(error_1)));
                    (0, log_js_1.logError)(new Error("Error getting MCP headers from headersHelper for server '".concat(serverName, "': ").concat((0, errors_js_1.errorMessage)(error_1))));
                    // Return null instead of throwing to avoid blocking the connection
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get combined headers for an MCP server (static + dynamic)
 * @param serverName The name of the MCP server
 * @param config The MCP server configuration
 * @returns Combined headers object
 */
function getMcpServerHeaders(serverName, config) {
    return __awaiter(this, void 0, void 0, function () {
        var staticHeaders, dynamicHeaders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    staticHeaders = config.headers || {};
                    return [4 /*yield*/, getMcpHeadersFromHelper(serverName, config)];
                case 1:
                    dynamicHeaders = (_a.sent()) || {};
                    // Dynamic headers override static headers if both are present
                    return [2 /*return*/, __assign(__assign({}, staticHeaders), dynamicHeaders)];
            }
        });
    });
}
