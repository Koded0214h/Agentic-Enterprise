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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMcpAuthTool = createMcpAuthTool;
var reject_js_1 = require("lodash-es/reject.js");
var v4_1 = require("zod/v4");
var auth_js_1 = require("../../services/mcp/auth.js");
var client_js_1 = require("../../services/mcp/client.js");
var mcpStringUtils_js_1 = require("../../services/mcp/mcpStringUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var log_js_1 = require("../../utils/log.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.object({}); });
function getConfigUrl(config) {
    if ('url' in config)
        return config.url;
    return undefined;
}
/**
 * Creates a pseudo-tool for an MCP server that is installed but not
 * authenticated. Surfaced in place of the server's real tools so the model
 * knows the server exists and can start the OAuth flow on the user's behalf.
 *
 * When called, starts performMCPOAuthFlow with skipBrowserOpen and returns
 * the authorization URL. The OAuth callback completes in the background;
 * once it fires, reconnectMcpServerImpl runs and the server's real tools
 * are swapped into appState.mcp.tools via the existing prefix-based
 * replacement (useManageMCPConnections.updateServer wipes anything matching
 * mcp__<server>__*, so this pseudo-tool is removed automatically).
 */
function createMcpAuthTool(serverName, config) {
    var _a;
    var url = getConfigUrl(config);
    var transport = (_a = config.type) !== null && _a !== void 0 ? _a : 'stdio';
    var location = url ? "".concat(transport, " at ").concat(url) : transport;
    var description = "The `".concat(serverName, "` MCP server (").concat(location, ") is installed but requires authentication. ") +
        "Call this tool to start the OAuth flow \u2014 you'll receive an authorization URL to share with the user. " +
        "Once the user completes authorization in their browser, the server's real tools will become available automatically.";
    return {
        name: (0, mcpStringUtils_js_1.buildMcpToolName)(serverName, 'authenticate'),
        isMcp: true,
        mcpInfo: { serverName: serverName, toolName: 'authenticate' },
        isEnabled: function () { return true; },
        isConcurrencySafe: function () { return false; },
        isReadOnly: function () { return false; },
        toAutoClassifierInput: function () { return serverName; },
        userFacingName: function () { return "".concat(serverName, " - authenticate (MCP)"); },
        maxResultSizeChars: 10000,
        renderToolUseMessage: function () { return "Authenticate ".concat(serverName, " MCP server"); },
        description: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, description];
                });
            });
        },
        prompt: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, description];
                });
            });
        },
        get inputSchema() {
            return inputSchema();
        },
        checkPermissions: function (input) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, { behavior: 'allow', updatedInput: input }];
                });
            });
        },
        call: function (_input, context) {
            return __awaiter(this, void 0, void 0, function () {
                var sseOrHttpConfig, resolveAuthUrl, authUrlPromise, controller, setAppState, oauthPromise, authUrl, err_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // claude.ai connectors use a separate auth flow (handleClaudeAIAuth in
                            // MCPRemoteServerMenu) that we don't invoke programmatically here —
                            // just point the user at /mcp.
                            if (config.type === 'claudeai-proxy') {
                                return [2 /*return*/, {
                                        data: {
                                            status: 'unsupported',
                                            message: "This is a claude.ai MCP connector. Ask the user to run /mcp and select \"".concat(serverName, "\" to authenticate."),
                                        },
                                    }];
                            }
                            // performMCPOAuthFlow only accepts sse/http. needs-auth state is only
                            // set on HTTP 401 (UnauthorizedError) so other transports shouldn't
                            // reach here, but be defensive.
                            if (config.type !== 'sse' && config.type !== 'http') {
                                return [2 /*return*/, {
                                        data: {
                                            status: 'unsupported',
                                            message: "Server \"".concat(serverName, "\" uses ").concat(transport, " transport which does not support OAuth from this tool. Ask the user to run /mcp and authenticate manually."),
                                        },
                                    }];
                            }
                            sseOrHttpConfig = config;
                            authUrlPromise = new Promise(function (resolve) {
                                resolveAuthUrl = resolve;
                            });
                            controller = new AbortController();
                            setAppState = context.setAppState;
                            oauthPromise = (0, auth_js_1.performMCPOAuthFlow)(serverName, sseOrHttpConfig, function (u) { return resolveAuthUrl === null || resolveAuthUrl === void 0 ? void 0 : resolveAuthUrl(u); }, controller.signal, { skipBrowserOpen: true });
                            // Background continuation: once OAuth completes, reconnect and swap
                            // the real tools into appState. Prefix-based replacement removes this
                            // pseudo-tool since it shares the mcp__<server>__ prefix.
                            void oauthPromise
                                .then(function () { return __awaiter(_this, void 0, void 0, function () {
                                var result, prefix;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            (0, client_js_1.clearMcpAuthCache)();
                                            return [4 /*yield*/, (0, client_js_1.reconnectMcpServerImpl)(serverName, config)];
                                        case 1:
                                            result = _a.sent();
                                            prefix = (0, mcpStringUtils_js_1.getMcpPrefix)(serverName);
                                            setAppState(function (prev) {
                                                var _a;
                                                return (__assign(__assign({}, prev), { mcp: __assign(__assign({}, prev.mcp), { clients: prev.mcp.clients.map(function (c) {
                                                            return c.name === serverName ? result.client : c;
                                                        }), tools: __spreadArray(__spreadArray([], (0, reject_js_1.default)(prev.mcp.tools, function (t) { var _a; return (_a = t.name) === null || _a === void 0 ? void 0 : _a.startsWith(prefix); }), true), result.tools, true), commands: __spreadArray(__spreadArray([], (0, reject_js_1.default)(prev.mcp.commands, function (c) { var _a; return (_a = c.name) === null || _a === void 0 ? void 0 : _a.startsWith(prefix); }), true), result.commands, true), resources: result.resources
                                                            ? __assign(__assign({}, prev.mcp.resources), (_a = {}, _a[serverName] = result.resources, _a)) : prev.mcp.resources }) }));
                                            });
                                            (0, log_js_1.logMCPDebug)(serverName, "OAuth complete, reconnected with ".concat(result.tools.length, " tool(s)"));
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .catch(function (err) {
                                (0, log_js_1.logMCPError)(serverName, "OAuth flow failed after tool-triggered start: ".concat((0, errors_js_1.errorMessage)(err)));
                            });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, Promise.race([
                                    authUrlPromise,
                                    oauthPromise.then(function () { return null; }),
                                ])];
                        case 2:
                            authUrl = _a.sent();
                            if (authUrl) {
                                return [2 /*return*/, {
                                        data: {
                                            status: 'auth_url',
                                            authUrl: authUrl,
                                            message: "Ask the user to open this URL in their browser to authorize the ".concat(serverName, " MCP server:\n\n").concat(authUrl, "\n\nOnce they complete the flow, the server's tools will become available automatically."),
                                        },
                                    }];
                            }
                            return [2 /*return*/, {
                                    data: {
                                        status: 'auth_url',
                                        message: "Authentication completed silently for ".concat(serverName, ". The server's tools should now be available."),
                                    },
                                }];
                        case 3:
                            err_1 = _a.sent();
                            return [2 /*return*/, {
                                    data: {
                                        status: 'error',
                                        message: "Failed to start OAuth flow for ".concat(serverName, ": ").concat((0, errors_js_1.errorMessage)(err_1), ". Ask the user to run /mcp and authenticate manually."),
                                    },
                                }];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        mapToolResultToToolResultBlockParam: function (data, toolUseID) {
            return {
                tool_use_id: toolUseID,
                type: 'tool_result',
                content: data.message,
            };
        },
    };
}
