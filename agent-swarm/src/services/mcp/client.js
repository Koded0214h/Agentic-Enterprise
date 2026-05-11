"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.fetchCommandsForClient = exports.fetchResourcesForClient = exports.fetchToolsForClient = exports.connectToServer = exports.McpToolCallError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS = exports.McpAuthError = void 0;
exports.isMcpSessionExpiredError = isMcpSessionExpiredError;
exports.clearMcpAuthCache = clearMcpAuthCache;
exports.createClaudeAiProxyFetch = createClaudeAiProxyFetch;
exports.wrapFetchWithTimeout = wrapFetchWithTimeout;
exports.getMcpServerConnectionBatchSize = getMcpServerConnectionBatchSize;
exports.getServerCacheKey = getServerCacheKey;
exports.clearServerCache = clearServerCache;
exports.ensureConnectedClient = ensureConnectedClient;
exports.areMcpConfigsEqual = areMcpConfigsEqual;
exports.mcpToolInputToAutoClassifierInput = mcpToolInputToAutoClassifierInput;
exports.callIdeRpc = callIdeRpc;
exports.reconnectMcpServerImpl = reconnectMcpServerImpl;
exports.getMcpToolsCommandsAndResources = getMcpToolsCommandsAndResources;
exports.prefetchAllMcpResources = prefetchAllMcpResources;
exports.transformResultContent = transformResultContent;
exports.inferCompactSchema = inferCompactSchema;
exports.transformMCPResult = transformMCPResult;
exports.processMCPResult = processMCPResult;
exports.callMCPToolWithUrlElicitationRetry = callMCPToolWithUrlElicitationRetry;
exports.setupSdkMcpClients = setupSdkMcpClients;
var bun_bundle_1 = require("bun:bundle");
var index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
var sse_js_1 = require("@modelcontextprotocol/sdk/client/sse.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
var streamableHttp_js_1 = require("@modelcontextprotocol/sdk/client/streamableHttp.js");
var transport_js_1 = require("@modelcontextprotocol/sdk/shared/transport.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var mapValues_js_1 = require("lodash-es/mapValues.js");
var memoize_js_1 = require("lodash-es/memoize.js");
var zipObject_js_1 = require("lodash-es/zipObject.js");
var p_map_1 = require("p-map");
var state_js_1 = require("../../bootstrap/state.js");
var oauth_js_1 = require("../../constants/oauth.js");
var product_js_1 = require("../../constants/product.js");
var Tool_js_1 = require("../../Tool.js");
var ListMcpResourcesTool_js_1 = require("../../tools/ListMcpResourcesTool/ListMcpResourcesTool.js");
var MCPTool_js_1 = require("../../tools/MCPTool/MCPTool.js");
var McpAuthTool_js_1 = require("../../tools/McpAuthTool/McpAuthTool.js");
var ReadMcpResourceTool_js_1 = require("../../tools/ReadMcpResourceTool/ReadMcpResourceTool.js");
var abortController_js_1 = require("../../utils/abortController.js");
var array_js_1 = require("../../utils/array.js");
var auth_js_1 = require("../../utils/auth.js");
var cleanupRegistry_js_1 = require("../../utils/cleanupRegistry.js");
var codeIndexing_js_1 = require("../../utils/codeIndexing.js");
var debug_js_1 = require("../../utils/debug.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var http_js_1 = require("../../utils/http.js");
var ide_js_1 = require("../../utils/ide.js");
var imageResizer_js_1 = require("../../utils/imageResizer.js");
var log_js_1 = require("../../utils/log.js");
var mcpOutputStorage_js_1 = require("../../utils/mcpOutputStorage.js");
var mcpValidation_js_1 = require("../../utils/mcpValidation.js");
var mcpWebSocketTransport_js_1 = require("../../utils/mcpWebSocketTransport.js");
var memoize_js_2 = require("../../utils/memoize.js");
var mtls_js_1 = require("../../utils/mtls.js");
var proxy_js_1 = require("../../utils/proxy.js");
var sanitization_js_1 = require("../../utils/sanitization.js");
var sessionIngressAuth_js_1 = require("../../utils/sessionIngressAuth.js");
var subprocessEnv_js_1 = require("../../utils/subprocessEnv.js");
var toolResultStorage_js_1 = require("../../utils/toolResultStorage.js");
var index_js_2 = require("../analytics/index.js");
var elicitationHandler_js_1 = require("./elicitationHandler.js");
var mcpStringUtils_js_1 = require("./mcpStringUtils.js");
var normalization_js_1 = require("./normalization.js");
var utils_js_1 = require("./utils.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var fetchMcpSkillsForClient = (0, bun_bundle_1.feature)('MCP_SKILLS')
    ? require('../../skills/mcpSkills.js').fetchMcpSkillsForClient
    : null;
var auth_js_2 = require("@modelcontextprotocol/sdk/client/auth.js");
/* eslint-enable @typescript-eslint/no-require-imports */
var classifyForCollapse_js_1 = require("../../tools/MCPTool/classifyForCollapse.js");
var macOsKeychainHelpers_js_1 = require("../../utils/secureStorage/macOsKeychainHelpers.js");
var sleep_js_1 = require("../../utils/sleep.js");
var auth_js_3 = require("./auth.js");
var claudeai_js_1 = require("./claudeai.js");
var config_js_1 = require("./config.js");
var headersHelper_js_1 = require("./headersHelper.js");
var SdkControlTransport_js_1 = require("./SdkControlTransport.js");
/**
 * Custom error class to indicate that an MCP tool call failed due to
 * authentication issues (e.g., expired OAuth token returning 401).
 * This error should be caught at the tool execution layer to update
 * the client's status to 'needs-auth'.
 */
var McpAuthError = /** @class */ (function (_super) {
    __extends(McpAuthError, _super);
    function McpAuthError(serverName, message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'McpAuthError';
        _this.serverName = serverName;
        return _this;
    }
    return McpAuthError;
}(Error));
exports.McpAuthError = McpAuthError;
/**
 * Thrown when an MCP session has expired and the connection cache has been cleared.
 * The caller should get a fresh client via ensureConnectedClient and retry.
 */
var McpSessionExpiredError = /** @class */ (function (_super) {
    __extends(McpSessionExpiredError, _super);
    function McpSessionExpiredError(serverName) {
        var _this = _super.call(this, "MCP server \"".concat(serverName, "\" session expired")) || this;
        _this.name = 'McpSessionExpiredError';
        return _this;
    }
    return McpSessionExpiredError;
}(Error));
/**
 * Thrown when an MCP tool returns `isError: true`. Carries the result's `_meta`
 * so SDK consumers can still receive it — per the MCP spec, `_meta` is on the
 * base Result type and is valid on error results.
 */
var McpToolCallError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS = /** @class */ (function (_super) {
    __extends(McpToolCallError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS, _super);
    function McpToolCallError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS(message, telemetryMessage, mcpMeta) {
        var _this = _super.call(this, message, telemetryMessage) || this;
        _this.mcpMeta = mcpMeta;
        _this.name = 'McpToolCallError';
        return _this;
    }
    return McpToolCallError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS;
}(errors_js_1.TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS));
exports.McpToolCallError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS = McpToolCallError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS;
/**
 * Detects whether an error is an MCP "Session not found" error (HTTP 404 + JSON-RPC code -32001).
 * Per the MCP spec, servers return 404 when a session ID is no longer valid.
 * We check both signals to avoid false positives from generic 404s (wrong URL, server gone, etc.).
 */
function isMcpSessionExpiredError(error) {
    var httpStatus = 'code' in error ? error.code : undefined;
    if (httpStatus !== 404) {
        return false;
    }
    // The SDK embeds the response body text in the error message.
    // MCP servers return: {"error":{"code":-32001,"message":"Session not found"},...}
    // Check for the JSON-RPC error code to distinguish from generic web server 404s.
    return (error.message.includes('"code":-32001') ||
        error.message.includes('"code": -32001'));
}
/**
 * Default timeout for MCP tool calls (effectively infinite - ~27.8 hours).
 */
var DEFAULT_MCP_TOOL_TIMEOUT_MS = 100000000;
/**
 * Cap on MCP tool descriptions and server instructions sent to the model.
 * OpenAPI-generated MCP servers have been observed dumping 15-60KB of endpoint
 * docs into tool.description; this caps the p95 tail without losing the intent.
 */
var MAX_MCP_DESCRIPTION_LENGTH = 2048;
/**
 * Gets the timeout for MCP tool calls in milliseconds.
 * Uses MCP_TOOL_TIMEOUT environment variable if set, otherwise defaults to ~27.8 hours.
 */
function getMcpToolTimeoutMs() {
    return (parseInt(process.env.MCP_TOOL_TIMEOUT || '', 10) ||
        DEFAULT_MCP_TOOL_TIMEOUT_MS);
}
var common_js_1 = require("../../utils/claudeInChrome/common.js");
// Lazy: toolRendering.tsx pulls React/ink; only needed when Claude-in-Chrome MCP server is connected
/* eslint-disable @typescript-eslint/no-require-imports */
var claudeInChromeToolRendering = function () {
    return require('../../utils/claudeInChrome/toolRendering.js');
};
// Lazy: wrapper.tsx → hostAdapter.ts → executor.ts pulls both native modules
// (@ant/computer-use-input + @ant/computer-use-swift). Runtime-gated by
// GrowthBook tengu_malort_pedway (see gates.ts).
var computerUseWrapper = (0, bun_bundle_1.feature)('CHICAGO_MCP')
    ? function () {
        return require('../../utils/computerUse/wrapper.js');
    }
    : undefined;
var isComputerUseMCPServer = (0, bun_bundle_1.feature)('CHICAGO_MCP')
    ? require('../../utils/computerUse/common.js').isComputerUseMCPServer
    : undefined;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var envUtils_js_2 = require("../../utils/envUtils.js");
/* eslint-enable @typescript-eslint/no-require-imports */
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var MCP_AUTH_CACHE_TTL_MS = 15 * 60 * 1000; // 15 min
function getMcpAuthCachePath() {
    return (0, path_1.join)((0, envUtils_js_2.getClaudeConfigHomeDir)(), 'mcp-needs-auth-cache.json');
}
// Memoized so N concurrent isMcpAuthCached() calls during batched connection
// share a single file read instead of N reads of the same file. Invalidated
// on write (setMcpAuthCacheEntry) and clear (clearMcpAuthCache). Not using
// lodash memoize because we need to null out the cache, not delete by key.
var authCachePromise = null;
function getMcpAuthCache() {
    if (!authCachePromise) {
        authCachePromise = (0, promises_1.readFile)(getMcpAuthCachePath(), 'utf-8')
            .then(function (data) { return (0, slowOperations_js_1.jsonParse)(data); })
            .catch(function () { return ({}); });
    }
    return authCachePromise;
}
function isMcpAuthCached(serverId) {
    return __awaiter(this, void 0, void 0, function () {
        var cache, entry;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getMcpAuthCache()];
                case 1:
                    cache = _a.sent();
                    entry = cache[serverId];
                    if (!entry) {
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, Date.now() - entry.timestamp < MCP_AUTH_CACHE_TTL_MS];
            }
        });
    });
}
// Serialize cache writes through a promise chain to prevent concurrent
// read-modify-write races when multiple servers return 401 in the same batch
var writeChain = Promise.resolve();
function setMcpAuthCacheEntry(serverId) {
    var _this = this;
    writeChain = writeChain
        .then(function () { return __awaiter(_this, void 0, void 0, function () {
        var cache, cachePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getMcpAuthCache()];
                case 1:
                    cache = _a.sent();
                    cache[serverId] = { timestamp: Date.now() };
                    cachePath = getMcpAuthCachePath();
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(cachePath), { recursive: true })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(cachePath, (0, slowOperations_js_1.jsonStringify)(cache))
                        // Invalidate the read cache so subsequent reads see the new entry.
                        // Safe because writeChain serializes writes: the next write's
                        // getMcpAuthCache() call will re-read the file with this entry present.
                    ];
                case 3:
                    _a.sent();
                    // Invalidate the read cache so subsequent reads see the new entry.
                    // Safe because writeChain serializes writes: the next write's
                    // getMcpAuthCache() call will re-read the file with this entry present.
                    authCachePromise = null;
                    return [2 /*return*/];
            }
        });
    }); })
        .catch(function () {
        // Best-effort cache write
    });
}
function clearMcpAuthCache() {
    authCachePromise = null;
    void (0, promises_1.unlink)(getMcpAuthCachePath()).catch(function () {
        // Cache file may not exist
    });
}
/**
 * Spread-ready analytics field for the server's base URL. Calls
 * getLoggingSafeMcpBaseUrl once (not twice like the inline ternary it replaces).
 * Typed as AnalyticsMetadata since the URL is query-stripped and safe to log.
 */
function mcpBaseUrlAnalytics(serverRef) {
    var url = (0, utils_js_1.getLoggingSafeMcpBaseUrl)(serverRef);
    return url
        ? {
            mcpServerBaseUrl: url,
        }
        : {};
}
/**
 * Shared handler for sse/http/claudeai-proxy auth failures during connect:
 * emits tengu_mcp_server_needs_auth, caches the needs-auth entry, and returns
 * the needs-auth connection result.
 */
function handleRemoteAuthFailure(name, serverRef, transportType) {
    (0, index_js_2.logEvent)('tengu_mcp_server_needs_auth', __assign({ transportType: transportType }, mcpBaseUrlAnalytics(serverRef)));
    var label = {
        sse: 'SSE',
        http: 'HTTP',
        'claudeai-proxy': 'claude.ai proxy',
    };
    (0, log_js_1.logMCPDebug)(name, "Authentication required for ".concat(label[transportType], " server"));
    setMcpAuthCacheEntry(name);
    return { name: name, type: 'needs-auth', config: serverRef };
}
/**
 * Fetch wrapper for claude.ai proxy connections. Attaches the OAuth bearer
 * token and retries once on 401 via handleOAuth401Error (force-refresh).
 *
 * The Anthropic API path has this retry (withRetry.ts, grove.ts) to handle
 * memoize-cache staleness and clock drift. Without the same here, a single
 * stale token mass-401s every claude.ai connector and sticks them all in the
 * 15-min needs-auth cache.
 */
function createClaudeAiProxyFetch(innerFetch) {
    var _this = this;
    return function (url, init) { return __awaiter(_this, void 0, void 0, function () {
        var doRequest, _a, response, sentToken, tokenChanged, now, _b;
        var _this = this;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    doRequest = function () { return __awaiter(_this, void 0, void 0, function () {
                        var currentTokens, headers, response;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()];
                                case 1:
                                    _a.sent();
                                    currentTokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
                                    if (!currentTokens) {
                                        throw new Error('No claude.ai OAuth token available');
                                    }
                                    headers = new Headers(init === null || init === void 0 ? void 0 : init.headers);
                                    headers.set('Authorization', "Bearer ".concat(currentTokens.accessToken));
                                    return [4 /*yield*/, innerFetch(url, __assign(__assign({}, init), { headers: headers }))
                                        // Return the exact token that was sent. Reading getClaudeAIOAuthTokens()
                                        // again after the request is wrong under concurrent 401s: another
                                        // connector's handleOAuth401Error clears the memoize cache, so we'd read
                                        // the NEW token from keychain, pass it to handleOAuth401Error, which
                                        // finds same-as-keychain → returns false → skips retry. Same pattern as
                                        // bridgeApi.ts withOAuthRetry (token passed as fn param).
                                    ];
                                case 2:
                                    response = _a.sent();
                                    // Return the exact token that was sent. Reading getClaudeAIOAuthTokens()
                                    // again after the request is wrong under concurrent 401s: another
                                    // connector's handleOAuth401Error clears the memoize cache, so we'd read
                                    // the NEW token from keychain, pass it to handleOAuth401Error, which
                                    // finds same-as-keychain → returns false → skips retry. Same pattern as
                                    // bridgeApi.ts withOAuthRetry (token passed as fn param).
                                    return [2 /*return*/, { response: response, sentToken: currentTokens.accessToken }];
                            }
                        });
                    }); };
                    return [4 /*yield*/, doRequest()];
                case 1:
                    _a = _d.sent(), response = _a.response, sentToken = _a.sentToken;
                    if (response.status !== 401) {
                        return [2 /*return*/, response];
                    }
                    return [4 /*yield*/, (0, auth_js_1.handleOAuth401Error)(sentToken).catch(function () { return false; })];
                case 2:
                    tokenChanged = _d.sent();
                    (0, index_js_2.logEvent)('tengu_mcp_claudeai_proxy_401', {
                        tokenChanged: tokenChanged,
                    });
                    if (!tokenChanged) {
                        now = (_c = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _c === void 0 ? void 0 : _c.accessToken;
                        if (!now || now === sentToken) {
                            return [2 /*return*/, response];
                        }
                    }
                    _d.label = 3;
                case 3:
                    _d.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, doRequest()];
                case 4: return [2 /*return*/, (_d.sent()).response];
                case 5:
                    _b = _d.sent();
                    // Retry itself failed (network error). Return the original 401 so the
                    // outer handler can classify it.
                    return [2 /*return*/, response];
                case 6: return [2 /*return*/];
            }
        });
    }); };
}
/**
 * Create a ws.WebSocket client with the MCP protocol.
 * Bun's ws shim types lack the 3-arg constructor (url, protocols, options)
 * that the real ws package supports, so we cast the constructor here.
 */
function createNodeWsClient(url, options) {
    return __awaiter(this, void 0, void 0, function () {
        var wsModule, WS;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('ws'); })];
                case 1:
                    wsModule = _a.sent();
                    WS = wsModule.default;
                    return [2 /*return*/, new WS(url, ['mcp'], options)];
            }
        });
    });
}
var IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
]);
function getConnectionTimeoutMs() {
    return parseInt(process.env.MCP_TIMEOUT || '', 10) || 30000;
}
/**
 * Default timeout for individual MCP requests (auth, tool calls, etc.)
 */
var MCP_REQUEST_TIMEOUT_MS = 60000;
/**
 * MCP Streamable HTTP spec requires clients to advertise acceptance of both
 * JSON and SSE on every POST. Servers that enforce this strictly reject
 * requests without it (HTTP 406).
 * https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#sending-messages-to-the-server
 */
var MCP_STREAMABLE_HTTP_ACCEPT = 'application/json, text/event-stream';
/**
 * Wraps a fetch function to apply a fresh timeout signal to each request.
 * This avoids the bug where a single AbortSignal.timeout() created at connection
 * time becomes stale after 60 seconds, causing all subsequent requests to fail
 * immediately with "The operation timed out." Uses a 60-second timeout.
 *
 * Also ensures the Accept header required by the MCP Streamable HTTP spec is
 * present on POSTs. The MCP SDK sets this inside StreamableHTTPClientTransport.send(),
 * but it is attached to a Headers instance that passes through an object spread here,
 * and some runtimes/agents have been observed dropping it before it reaches the wire.
 * See https://github.com/anthropics/claude-agent-sdk-typescript/issues/202.
 * Normalizing here (the last wrapper before fetch()) guarantees it is sent.
 *
 * GET requests are excluded from the timeout since, for MCP transports, they are
 * long-lived SSE streams meant to stay open indefinitely. (Auth-related GETs use
 * a separate fetch wrapper with its own timeout in auth.ts.)
 *
 * @param baseFetch - The fetch function to wrap
 */
function wrapFetchWithTimeout(baseFetch) {
    var _this = this;
    return function (url, init) { return __awaiter(_this, void 0, void 0, function () {
        var method, headers, controller, timer, parentSignal, abort, cleanup, response, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    method = ((_a = init === null || init === void 0 ? void 0 : init.method) !== null && _a !== void 0 ? _a : 'GET').toUpperCase();
                    // Skip timeout for GET requests - in MCP transports, these are long-lived SSE streams.
                    // (OAuth discovery GETs in auth.ts use a separate createAuthFetch() with its own timeout.)
                    if (method === 'GET') {
                        return [2 /*return*/, baseFetch(url, init)];
                    }
                    headers = new Headers(init === null || init === void 0 ? void 0 : init.headers);
                    if (!headers.has('accept')) {
                        headers.set('accept', MCP_STREAMABLE_HTTP_ACCEPT);
                    }
                    controller = new AbortController();
                    timer = setTimeout(function (c) {
                        return c.abort(new DOMException('The operation timed out.', 'TimeoutError'));
                    }, MCP_REQUEST_TIMEOUT_MS, controller);
                    (_b = timer.unref) === null || _b === void 0 ? void 0 : _b.call(timer);
                    parentSignal = init === null || init === void 0 ? void 0 : init.signal;
                    abort = function () { return controller.abort(parentSignal === null || parentSignal === void 0 ? void 0 : parentSignal.reason); };
                    parentSignal === null || parentSignal === void 0 ? void 0 : parentSignal.addEventListener('abort', abort);
                    if (parentSignal === null || parentSignal === void 0 ? void 0 : parentSignal.aborted) {
                        controller.abort(parentSignal.reason);
                    }
                    cleanup = function () {
                        clearTimeout(timer);
                        parentSignal === null || parentSignal === void 0 ? void 0 : parentSignal.removeEventListener('abort', abort);
                    };
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, baseFetch(url, __assign(__assign({}, init), { headers: headers, signal: controller.signal }))];
                case 2:
                    response = _c.sent();
                    cleanup();
                    return [2 /*return*/, response];
                case 3:
                    error_1 = _c.sent();
                    cleanup();
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    }); };
}
function getMcpServerConnectionBatchSize() {
    return parseInt(process.env.MCP_SERVER_CONNECTION_BATCH_SIZE || '', 10) || 3;
}
function getRemoteMcpServerConnectionBatchSize() {
    return (parseInt(process.env.MCP_REMOTE_SERVER_CONNECTION_BATCH_SIZE || '', 10) ||
        20);
}
function isLocalMcpServer(config) {
    return !config.type || config.type === 'stdio' || config.type === 'sdk';
}
// For the IDE MCP servers, we only include specific tools
var ALLOWED_IDE_TOOLS = ['mcp__ide__executeCode', 'mcp__ide__getDiagnostics'];
function isIncludedMcpTool(tool) {
    return (!tool.name.startsWith('mcp__ide__') || ALLOWED_IDE_TOOLS.includes(tool.name));
}
/**
 * Generates the cache key for a server connection
 * @param name Server name
 * @param serverRef Server configuration
 * @returns Cache key string
 */
function getServerCacheKey(name, serverRef) {
    return "".concat(name, "-").concat((0, slowOperations_js_1.jsonStringify)(serverRef));
}
/**
 * TODO (ollie): The memoization here increases complexity by a lot, and im not sure it really improves performance
 * Attempts to connect to a single MCP server
 * @param name Server name
 * @param serverRef Scoped server configuration
 * @returns A wrapped client (either connected or failed)
 */
exports.connectToServer = (0, memoize_js_1.default)(function (name, serverRef, serverStats) { return __awaiter(void 0, void 0, void 0, function () {
    var connectStartTime, inProcessServer, transport_1, sessionIngressToken, authProvider_1, combinedHeaders_1, transportOptions, proxyOptions_1, transportOptions, tlsOptions, wsHeaders, wsClient, combinedHeaders, tlsOptions, wsHeaders, wsHeadersForLogging, wsClient, authProvider, combinedHeaders, hasOAuthTokens, proxyOptions, transportOptions, headersForLogging, tokens, oauthConfig, proxyUrl, fetchWithAuth, proxyOptions, transportOptions, createChromeContext, createClaudeForChromeMcpServer, createLinkedTransportPair, context, _a, clientTransport, serverTransport, createComputerUseMcpServerForCli, createLinkedTransportPair, _b, clientTransport, serverTransport, finalCommand, finalArgs, stderrHandler_1, stderrOutput_1, stdioTransport, client_1, testUrl, connectPromise_1, timeoutPromise, elapsed, error_2, elapsed, errorObj, errorCode, capabilities, serverVersion, rawInstructions, instructions, ideConnectionDurationMs, connectionStartTime_1, hasErrorOccurred_1, originalOnerror_1, originalOnclose_1, consecutiveConnectionErrors_1, MAX_ERRORS_BEFORE_RECONNECT_1, hasTriggeredClose_1, closeTransportAndRejectPending_1, isTerminalConnectionError_1, cleanup_1, cleanupUnregister_1, wrappedCleanup, connectionDurationMs, error_3, connectionDurationMs;
    var _c, _d, _e, _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                connectStartTime = Date.now();
                _j.label = 1;
            case 1:
                _j.trys.push([1, 34, , 35]);
                sessionIngressToken = (0, sessionIngressAuth_js_1.getSessionIngressAuthToken)();
                if (!(serverRef.type === 'sse')) return [3 /*break*/, 3];
                authProvider_1 = new auth_js_3.ClaudeAuthProvider(name, serverRef);
                return [4 /*yield*/, (0, headersHelper_js_1.getMcpServerHeaders)(name, serverRef)
                    // Use the auth provider with SSEClientTransport
                ];
            case 2:
                combinedHeaders_1 = _j.sent();
                transportOptions = {
                    authProvider: authProvider_1,
                    // Use fresh timeout per request to avoid stale AbortSignal bug.
                    // Step-up detection wraps innermost so the 403 is seen before the
                    // SDK's handler calls auth() → tokens().
                    fetch: wrapFetchWithTimeout((0, auth_js_3.wrapFetchWithStepUpDetection)((0, transport_js_1.createFetchWithInit)(), authProvider_1)),
                    requestInit: {
                        headers: __assign({ 'User-Agent': (0, http_js_1.getMCPUserAgent)() }, combinedHeaders_1),
                    },
                };
                // IMPORTANT: Always set eventSourceInit with a fetch that does NOT use the
                // timeout wrapper. The EventSource connection is long-lived (stays open indefinitely
                // to receive server-sent events), so applying a 60-second timeout would kill it.
                // The timeout is only meant for individual API requests (POST, auth refresh), not
                // the persistent SSE stream.
                transportOptions.eventSourceInit = {
                    fetch: function (url, init) { return __awaiter(void 0, void 0, void 0, function () {
                        var authHeaders, tokens, proxyOptions;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    authHeaders = {};
                                    return [4 /*yield*/, authProvider_1.tokens()];
                                case 1:
                                    tokens = _a.sent();
                                    if (tokens) {
                                        authHeaders.Authorization = "Bearer ".concat(tokens.access_token);
                                    }
                                    proxyOptions = (0, proxy_js_1.getProxyFetchOptions)();
                                    // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
                                    return [2 /*return*/, fetch(url, __assign(__assign(__assign({}, init), proxyOptions), { headers: __assign(__assign(__assign(__assign({ 'User-Agent': (0, http_js_1.getMCPUserAgent)() }, authHeaders), init === null || init === void 0 ? void 0 : init.headers), combinedHeaders_1), { Accept: 'text/event-stream' }) }))];
                            }
                        });
                    }); },
                };
                transport_1 = new sse_js_1.SSEClientTransport(new URL(serverRef.url), transportOptions);
                (0, log_js_1.logMCPDebug)(name, "SSE transport initialized, awaiting connection");
                return [3 /*break*/, 29];
            case 3:
                if (!(serverRef.type === 'sse-ide')) return [3 /*break*/, 4];
                (0, log_js_1.logMCPDebug)(name, "Setting up SSE-IDE transport to ".concat(serverRef.url));
                proxyOptions_1 = (0, proxy_js_1.getProxyFetchOptions)();
                transportOptions = proxyOptions_1.dispatcher
                    ? {
                        eventSourceInit: {
                            fetch: function (url, init) { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
                                    return [2 /*return*/, fetch(url, __assign(__assign(__assign({}, init), proxyOptions_1), { headers: __assign({ 'User-Agent': (0, http_js_1.getMCPUserAgent)() }, init === null || init === void 0 ? void 0 : init.headers) }))];
                                });
                            }); },
                        },
                    }
                    : {};
                transport_1 = new sse_js_1.SSEClientTransport(new URL(serverRef.url), Object.keys(transportOptions).length > 0
                    ? transportOptions
                    : undefined);
                return [3 /*break*/, 29];
            case 4:
                if (!(serverRef.type === 'ws-ide')) return [3 /*break*/, 8];
                tlsOptions = (0, mtls_js_1.getWebSocketTLSOptions)();
                wsHeaders = __assign({ 'User-Agent': (0, http_js_1.getMCPUserAgent)() }, (serverRef.authToken && {
                    'X-Claude-Code-Ide-Authorization': serverRef.authToken,
                }));
                wsClient = void 0;
                if (!(typeof Bun !== 'undefined')) return [3 /*break*/, 5];
                // Bun's WebSocket supports headers/proxy/tls options but the DOM typings don't
                // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
                wsClient = new globalThis.WebSocket(serverRef.url, {
                    protocols: ['mcp'],
                    headers: wsHeaders,
                    proxy: (0, proxy_js_1.getWebSocketProxyUrl)(serverRef.url),
                    tls: tlsOptions || undefined,
                });
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, createNodeWsClient(serverRef.url, __assign({ headers: wsHeaders, agent: (0, proxy_js_1.getWebSocketProxyAgent)(serverRef.url) }, (tlsOptions || {})))];
            case 6:
                wsClient = _j.sent();
                _j.label = 7;
            case 7:
                transport_1 = new mcpWebSocketTransport_js_1.WebSocketTransport(wsClient);
                return [3 /*break*/, 29];
            case 8:
                if (!(serverRef.type === 'ws')) return [3 /*break*/, 13];
                (0, log_js_1.logMCPDebug)(name, "Initializing WebSocket transport to ".concat(serverRef.url));
                return [4 /*yield*/, (0, headersHelper_js_1.getMcpServerHeaders)(name, serverRef)];
            case 9:
                combinedHeaders = _j.sent();
                tlsOptions = (0, mtls_js_1.getWebSocketTLSOptions)();
                wsHeaders = __assign(__assign({ 'User-Agent': (0, http_js_1.getMCPUserAgent)() }, (sessionIngressToken && {
                    Authorization: "Bearer ".concat(sessionIngressToken),
                })), combinedHeaders);
                wsHeadersForLogging = (0, mapValues_js_1.default)(wsHeaders, function (value, key) {
                    return key.toLowerCase() === 'authorization' ? '[REDACTED]' : value;
                });
                (0, log_js_1.logMCPDebug)(name, "WebSocket transport options: ".concat((0, slowOperations_js_1.jsonStringify)({
                    url: serverRef.url,
                    headers: wsHeadersForLogging,
                    hasSessionAuth: !!sessionIngressToken,
                })));
                wsClient = void 0;
                if (!(typeof Bun !== 'undefined')) return [3 /*break*/, 10];
                // Bun's WebSocket supports headers/proxy/tls options but the DOM typings don't
                // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
                wsClient = new globalThis.WebSocket(serverRef.url, {
                    protocols: ['mcp'],
                    headers: wsHeaders,
                    proxy: (0, proxy_js_1.getWebSocketProxyUrl)(serverRef.url),
                    tls: tlsOptions || undefined,
                });
                return [3 /*break*/, 12];
            case 10: return [4 /*yield*/, createNodeWsClient(serverRef.url, __assign({ headers: wsHeaders, agent: (0, proxy_js_1.getWebSocketProxyAgent)(serverRef.url) }, (tlsOptions || {})))];
            case 11:
                wsClient = _j.sent();
                _j.label = 12;
            case 12:
                transport_1 = new mcpWebSocketTransport_js_1.WebSocketTransport(wsClient);
                return [3 /*break*/, 29];
            case 13:
                if (!(serverRef.type === 'http')) return [3 /*break*/, 16];
                (0, log_js_1.logMCPDebug)(name, "Initializing HTTP transport to ".concat(serverRef.url));
                (0, log_js_1.logMCPDebug)(name, "Node version: ".concat(process.version, ", Platform: ").concat(process.platform));
                (0, log_js_1.logMCPDebug)(name, "Environment: ".concat((0, slowOperations_js_1.jsonStringify)({
                    NODE_OPTIONS: process.env.NODE_OPTIONS || 'not set',
                    UV_THREADPOOL_SIZE: process.env.UV_THREADPOOL_SIZE || 'default',
                    HTTP_PROXY: process.env.HTTP_PROXY || 'not set',
                    HTTPS_PROXY: process.env.HTTPS_PROXY || 'not set',
                    NO_PROXY: process.env.NO_PROXY || 'not set',
                })));
                authProvider = new auth_js_3.ClaudeAuthProvider(name, serverRef);
                return [4 /*yield*/, (0, headersHelper_js_1.getMcpServerHeaders)(name, serverRef)
                    // Check if this server has stored OAuth tokens. If so, the SDK's
                    // authProvider will set Authorization — don't override with the
                    // session ingress token (SDK merges requestInit AFTER authProvider).
                    // CCR proxy URLs (ccr_shttp_mcp) have no stored OAuth, so they still
                    // get the ingress token. See PR #24454 discussion.
                ];
            case 14:
                combinedHeaders = _j.sent();
                return [4 /*yield*/, authProvider.tokens()];
            case 15:
                hasOAuthTokens = !!(_j.sent());
                proxyOptions = (0, proxy_js_1.getProxyFetchOptions)();
                (0, log_js_1.logMCPDebug)(name, "Proxy options: ".concat(proxyOptions.dispatcher ? 'custom dispatcher' : 'default'));
                transportOptions = {
                    authProvider: authProvider,
                    // Use fresh timeout per request to avoid stale AbortSignal bug.
                    // Step-up detection wraps innermost so the 403 is seen before the
                    // SDK's handler calls auth() → tokens().
                    fetch: wrapFetchWithTimeout((0, auth_js_3.wrapFetchWithStepUpDetection)((0, transport_js_1.createFetchWithInit)(), authProvider)),
                    requestInit: __assign(__assign({}, proxyOptions), { headers: __assign(__assign({ 'User-Agent': (0, http_js_1.getMCPUserAgent)() }, (sessionIngressToken &&
                            !hasOAuthTokens && {
                            Authorization: "Bearer ".concat(sessionIngressToken),
                        })), combinedHeaders) }),
                };
                headersForLogging = ((_c = transportOptions.requestInit) === null || _c === void 0 ? void 0 : _c.headers)
                    ? (0, mapValues_js_1.default)(transportOptions.requestInit.headers, function (value, key) {
                        return key.toLowerCase() === 'authorization' ? '[REDACTED]' : value;
                    })
                    : undefined;
                (0, log_js_1.logMCPDebug)(name, "HTTP transport options: ".concat((0, slowOperations_js_1.jsonStringify)({
                    url: serverRef.url,
                    headers: headersForLogging,
                    hasAuthProvider: !!authProvider,
                    timeoutMs: MCP_REQUEST_TIMEOUT_MS,
                })));
                transport_1 = new streamableHttp_js_1.StreamableHTTPClientTransport(new URL(serverRef.url), transportOptions);
                (0, log_js_1.logMCPDebug)(name, "HTTP transport created successfully");
                return [3 /*break*/, 29];
            case 16:
                if (!(serverRef.type === 'sdk')) return [3 /*break*/, 17];
                throw new Error('SDK servers should be handled in print.ts');
            case 17:
                if (!(serverRef.type === 'claudeai-proxy')) return [3 /*break*/, 18];
                (0, log_js_1.logMCPDebug)(name, "Initializing claude.ai proxy transport for server ".concat(serverRef.id));
                tokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
                if (!tokens) {
                    throw new Error('No claude.ai OAuth token found');
                }
                oauthConfig = (0, oauth_js_1.getOauthConfig)();
                proxyUrl = "".concat(oauthConfig.MCP_PROXY_URL).concat(oauthConfig.MCP_PROXY_PATH.replace('{server_id}', serverRef.id));
                (0, log_js_1.logMCPDebug)(name, "Using claude.ai proxy at ".concat(proxyUrl));
                fetchWithAuth = createClaudeAiProxyFetch(globalThis.fetch);
                proxyOptions = (0, proxy_js_1.getProxyFetchOptions)();
                transportOptions = {
                    // Wrap fetchWithAuth with fresh timeout per request
                    fetch: wrapFetchWithTimeout(fetchWithAuth),
                    requestInit: __assign(__assign({}, proxyOptions), { headers: {
                            'User-Agent': (0, http_js_1.getMCPUserAgent)(),
                            'X-Mcp-Client-Session-Id': (0, state_js_1.getSessionId)(),
                        } }),
                };
                transport_1 = new streamableHttp_js_1.StreamableHTTPClientTransport(new URL(proxyUrl), transportOptions);
                (0, log_js_1.logMCPDebug)(name, "claude.ai proxy transport created successfully");
                return [3 /*break*/, 29];
            case 18:
                if (!((serverRef.type === 'stdio' || !serverRef.type) &&
                    (0, common_js_1.isClaudeInChromeMCPServer)(name))) return [3 /*break*/, 23];
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../../utils/claudeInChrome/mcpServer.js'); })];
            case 19:
                createChromeContext = (_j.sent()).createChromeContext;
                return [4 /*yield*/, Promise.resolve().then(function () { return require('@ant/claude-for-chrome-mcp'); })];
            case 20:
                createClaudeForChromeMcpServer = (_j.sent()).createClaudeForChromeMcpServer;
                return [4 /*yield*/, Promise.resolve().then(function () { return require('./InProcessTransport.js'); })];
            case 21:
                createLinkedTransportPair = (_j.sent()).createLinkedTransportPair;
                context = createChromeContext(serverRef.env);
                inProcessServer = createClaudeForChromeMcpServer(context);
                _a = createLinkedTransportPair(), clientTransport = _a[0], serverTransport = _a[1];
                return [4 /*yield*/, inProcessServer.connect(serverTransport)];
            case 22:
                _j.sent();
                transport_1 = clientTransport;
                (0, log_js_1.logMCPDebug)(name, "In-process Chrome MCP server started");
                return [3 /*break*/, 29];
            case 23:
                if (!((0, bun_bundle_1.feature)('CHICAGO_MCP') &&
                    (serverRef.type === 'stdio' || !serverRef.type) &&
                    isComputerUseMCPServer(name))) return [3 /*break*/, 28];
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../../utils/computerUse/mcpServer.js'); })];
            case 24:
                createComputerUseMcpServerForCli = (_j.sent()).createComputerUseMcpServerForCli;
                return [4 /*yield*/, Promise.resolve().then(function () { return require('./InProcessTransport.js'); })];
            case 25:
                createLinkedTransportPair = (_j.sent()).createLinkedTransportPair;
                return [4 /*yield*/, createComputerUseMcpServerForCli()];
            case 26:
                inProcessServer = _j.sent();
                _b = createLinkedTransportPair(), clientTransport = _b[0], serverTransport = _b[1];
                return [4 /*yield*/, inProcessServer.connect(serverTransport)];
            case 27:
                _j.sent();
                transport_1 = clientTransport;
                (0, log_js_1.logMCPDebug)(name, "In-process Computer Use MCP server started");
                return [3 /*break*/, 29];
            case 28:
                if (serverRef.type === 'stdio' || !serverRef.type) {
                    finalCommand = process.env.CLAUDE_CODE_SHELL_PREFIX || serverRef.command;
                    finalArgs = process.env.CLAUDE_CODE_SHELL_PREFIX
                        ? [__spreadArray([serverRef.command], serverRef.args, true).join(' ')]
                        : serverRef.args;
                    transport_1 = new stdio_js_1.StdioClientTransport({
                        command: finalCommand,
                        args: finalArgs,
                        env: __assign(__assign({}, (0, subprocessEnv_js_1.subprocessEnv)()), serverRef.env),
                        stderr: 'pipe', // prevents error output from the MCP server from printing to the UI
                    });
                }
                else {
                    throw new Error("Unsupported server type: ".concat(serverRef.type));
                }
                _j.label = 29;
            case 29:
                stderrOutput_1 = '';
                if (serverRef.type === 'stdio' || !serverRef.type) {
                    stdioTransport = transport_1;
                    if (stdioTransport.stderr) {
                        stderrHandler_1 = function (data) {
                            // Cap stderr accumulation to prevent unbounded memory growth
                            if (stderrOutput_1.length < 64 * 1024 * 1024) {
                                try {
                                    stderrOutput_1 += data.toString();
                                }
                                catch (_a) {
                                    // Ignore errors from exceeding max string length
                                }
                            }
                        };
                        stdioTransport.stderr.on('data', stderrHandler_1);
                    }
                }
                client_1 = new index_js_1.Client({
                    name: 'claude-code',
                    title: 'Claude Code',
                    version: (_d = MACRO.VERSION) !== null && _d !== void 0 ? _d : 'unknown',
                    description: "Anthropic's agentic coding tool",
                    websiteUrl: product_js_1.PRODUCT_URL,
                }, {
                    capabilities: {
                        roots: {},
                        // Empty object declares the capability. Sending {form:{},url:{}}
                        // breaks Java MCP SDK servers (Spring AI) whose Elicitation class
                        // has zero fields and fails on unknown properties.
                        elicitation: {},
                    },
                });
                // Add debug logging for client events if available
                if (serverRef.type === 'http') {
                    (0, log_js_1.logMCPDebug)(name, "Client created, setting up request handler");
                }
                client_1.setRequestHandler(types_js_1.ListRootsRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        (0, log_js_1.logMCPDebug)(name, "Received ListRoots request from server");
                        return [2 /*return*/, {
                                roots: [
                                    {
                                        uri: "file://".concat((0, state_js_1.getOriginalCwd)()),
                                    },
                                ],
                            }];
                    });
                }); });
                // Add a timeout to connection attempts to prevent tests from hanging indefinitely
                (0, log_js_1.logMCPDebug)(name, "Starting connection with timeout of ".concat(getConnectionTimeoutMs(), "ms"));
                // For HTTP transport, try a basic connectivity test first
                if (serverRef.type === 'http') {
                    (0, log_js_1.logMCPDebug)(name, "Testing basic HTTP connectivity to ".concat(serverRef.url));
                    try {
                        testUrl = new URL(serverRef.url);
                        (0, log_js_1.logMCPDebug)(name, "Parsed URL: host=".concat(testUrl.hostname, ", port=").concat(testUrl.port || 'default', ", protocol=").concat(testUrl.protocol));
                        // Log DNS resolution attempt
                        if (testUrl.hostname === '127.0.0.1' ||
                            testUrl.hostname === 'localhost') {
                            (0, log_js_1.logMCPDebug)(name, "Using loopback address: ".concat(testUrl.hostname));
                        }
                    }
                    catch (urlError) {
                        (0, log_js_1.logMCPDebug)(name, "Failed to parse URL: ".concat(urlError));
                    }
                }
                connectPromise_1 = client_1.connect(transport_1);
                timeoutPromise = new Promise(function (_, reject) {
                    var timeoutId = setTimeout(function () {
                        var elapsed = Date.now() - connectStartTime;
                        (0, log_js_1.logMCPDebug)(name, "Connection timeout triggered after ".concat(elapsed, "ms (limit: ").concat(getConnectionTimeoutMs(), "ms)"));
                        if (inProcessServer) {
                            inProcessServer.close().catch(function () { });
                        }
                        transport_1.close().catch(function () { });
                        reject(new errors_js_1.TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS("MCP server \"".concat(name, "\" connection timed out after ").concat(getConnectionTimeoutMs(), "ms"), 'MCP connection timeout'));
                    }, getConnectionTimeoutMs());
                    // Clean up timeout if connect resolves or rejects
                    connectPromise_1.then(function () {
                        clearTimeout(timeoutId);
                    }, function (_error) {
                        clearTimeout(timeoutId);
                    });
                });
                _j.label = 30;
            case 30:
                _j.trys.push([30, 32, , 33]);
                return [4 /*yield*/, Promise.race([connectPromise_1, timeoutPromise])];
            case 31:
                _j.sent();
                if (stderrOutput_1) {
                    (0, log_js_1.logMCPError)(name, "Server stderr: ".concat(stderrOutput_1));
                    stderrOutput_1 = ''; // Release accumulated string to prevent memory growth
                }
                elapsed = Date.now() - connectStartTime;
                (0, log_js_1.logMCPDebug)(name, "Successfully connected (transport: ".concat(serverRef.type || 'stdio', ") in ").concat(elapsed, "ms"));
                return [3 /*break*/, 33];
            case 32:
                error_2 = _j.sent();
                elapsed = Date.now() - connectStartTime;
                // SSE-specific error logging
                if (serverRef.type === 'sse' && error_2 instanceof Error) {
                    (0, log_js_1.logMCPDebug)(name, "SSE Connection failed after ".concat(elapsed, "ms: ").concat((0, slowOperations_js_1.jsonStringify)({
                        url: serverRef.url,
                        error: error_2.message,
                        errorType: error_2.constructor.name,
                        stack: error_2.stack,
                    })));
                    (0, log_js_1.logMCPError)(name, error_2);
                    if (error_2 instanceof auth_js_2.UnauthorizedError) {
                        return [2 /*return*/, handleRemoteAuthFailure(name, serverRef, 'sse')];
                    }
                }
                else if (serverRef.type === 'http' && error_2 instanceof Error) {
                    errorObj = error_2;
                    (0, log_js_1.logMCPDebug)(name, "HTTP Connection failed after ".concat(elapsed, "ms: ").concat(error_2.message, " (code: ").concat(errorObj.code || 'none', ", errno: ").concat(errorObj.errno || 'none', ")"));
                    (0, log_js_1.logMCPError)(name, error_2);
                    if (error_2 instanceof auth_js_2.UnauthorizedError) {
                        return [2 /*return*/, handleRemoteAuthFailure(name, serverRef, 'http')];
                    }
                }
                else if (serverRef.type === 'claudeai-proxy' &&
                    error_2 instanceof Error) {
                    (0, log_js_1.logMCPDebug)(name, "claude.ai proxy connection failed after ".concat(elapsed, "ms: ").concat(error_2.message));
                    (0, log_js_1.logMCPError)(name, error_2);
                    errorCode = error_2.code;
                    if (errorCode === 401) {
                        return [2 /*return*/, handleRemoteAuthFailure(name, serverRef, 'claudeai-proxy')];
                    }
                }
                else if (serverRef.type === 'sse-ide' ||
                    serverRef.type === 'ws-ide') {
                    (0, index_js_2.logEvent)('tengu_mcp_ide_server_connection_failed', {
                        connectionDurationMs: elapsed,
                    });
                }
                if (inProcessServer) {
                    inProcessServer.close().catch(function () { });
                }
                transport_1.close().catch(function () { });
                if (stderrOutput_1) {
                    (0, log_js_1.logMCPError)(name, "Server stderr: ".concat(stderrOutput_1));
                }
                throw error_2;
            case 33:
                capabilities = client_1.getServerCapabilities();
                serverVersion = client_1.getServerVersion();
                rawInstructions = client_1.getInstructions();
                instructions = rawInstructions;
                if (rawInstructions &&
                    rawInstructions.length > MAX_MCP_DESCRIPTION_LENGTH) {
                    instructions =
                        rawInstructions.slice(0, MAX_MCP_DESCRIPTION_LENGTH) + '… [truncated]';
                    (0, log_js_1.logMCPDebug)(name, "Server instructions truncated from ".concat(rawInstructions.length, " to ").concat(MAX_MCP_DESCRIPTION_LENGTH, " chars"));
                }
                // Log successful connection details
                (0, log_js_1.logMCPDebug)(name, "Connection established with capabilities: ".concat((0, slowOperations_js_1.jsonStringify)({
                    hasTools: !!(capabilities === null || capabilities === void 0 ? void 0 : capabilities.tools),
                    hasPrompts: !!(capabilities === null || capabilities === void 0 ? void 0 : capabilities.prompts),
                    hasResources: !!(capabilities === null || capabilities === void 0 ? void 0 : capabilities.resources),
                    hasResourceSubscribe: !!((_e = capabilities === null || capabilities === void 0 ? void 0 : capabilities.resources) === null || _e === void 0 ? void 0 : _e.subscribe),
                    serverVersion: serverVersion || 'unknown',
                })));
                (0, debug_js_1.logForDebugging)("[MCP] Server \"".concat(name, "\" connected with subscribe=").concat(!!((_f = capabilities === null || capabilities === void 0 ? void 0 : capabilities.resources) === null || _f === void 0 ? void 0 : _f.subscribe)));
                // Register default elicitation handler that returns cancel during the
                // window before registerElicitationHandler overwrites it in
                // onConnectionAttempt (useManageMCPConnections).
                client_1.setRequestHandler(types_js_1.ElicitRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        (0, log_js_1.logMCPDebug)(name, "Elicitation request received during initialization: ".concat((0, slowOperations_js_1.jsonStringify)(request)));
                        return [2 /*return*/, { action: 'cancel' }];
                    });
                }); });
                if (serverRef.type === 'sse-ide' || serverRef.type === 'ws-ide') {
                    ideConnectionDurationMs = Date.now() - connectStartTime;
                    (0, index_js_2.logEvent)('tengu_mcp_ide_server_connection_succeeded', {
                        connectionDurationMs: ideConnectionDurationMs,
                        serverVersion: serverVersion,
                    });
                    try {
                        void (0, ide_js_1.maybeNotifyIDEConnected)(client_1);
                    }
                    catch (error) {
                        (0, log_js_1.logMCPError)(name, "Failed to send ide_connected notification: ".concat(error));
                    }
                }
                connectionStartTime_1 = Date.now();
                hasErrorOccurred_1 = false;
                originalOnerror_1 = client_1.onerror;
                originalOnclose_1 = client_1.onclose;
                consecutiveConnectionErrors_1 = 0;
                MAX_ERRORS_BEFORE_RECONNECT_1 = 3;
                hasTriggeredClose_1 = false;
                closeTransportAndRejectPending_1 = function (reason) {
                    if (hasTriggeredClose_1)
                        return;
                    hasTriggeredClose_1 = true;
                    (0, log_js_1.logMCPDebug)(name, "Closing transport (".concat(reason, ")"));
                    void client_1.close().catch(function (e) {
                        (0, log_js_1.logMCPDebug)(name, "Error during close: ".concat((0, errors_js_1.errorMessage)(e)));
                    });
                };
                isTerminalConnectionError_1 = function (msg) {
                    return (msg.includes('ECONNRESET') ||
                        msg.includes('ETIMEDOUT') ||
                        msg.includes('EPIPE') ||
                        msg.includes('EHOSTUNREACH') ||
                        msg.includes('ECONNREFUSED') ||
                        msg.includes('Body Timeout Error') ||
                        msg.includes('terminated') ||
                        // SDK SSE reconnection intermediate errors — may be wrapped around the
                        // actual network error, so the substrings above won't match
                        msg.includes('SSE stream disconnected') ||
                        msg.includes('Failed to reconnect SSE stream'));
                };
                // Enhanced error handler with detailed logging
                client_1.onerror = function (error) {
                    var uptime = Date.now() - connectionStartTime_1;
                    hasErrorOccurred_1 = true;
                    var transportType = serverRef.type || 'stdio';
                    // Log the connection drop with context
                    (0, log_js_1.logMCPDebug)(name, "".concat(transportType.toUpperCase(), " connection dropped after ").concat(Math.floor(uptime / 1000), "s uptime"));
                    // Log specific error details for debugging
                    if (error.message) {
                        if (error.message.includes('ECONNRESET')) {
                            (0, log_js_1.logMCPDebug)(name, "Connection reset - server may have crashed or restarted");
                        }
                        else if (error.message.includes('ETIMEDOUT')) {
                            (0, log_js_1.logMCPDebug)(name, "Connection timeout - network issue or server unresponsive");
                        }
                        else if (error.message.includes('ECONNREFUSED')) {
                            (0, log_js_1.logMCPDebug)(name, "Connection refused - server may be down");
                        }
                        else if (error.message.includes('EPIPE')) {
                            (0, log_js_1.logMCPDebug)(name, "Broken pipe - server closed connection unexpectedly");
                        }
                        else if (error.message.includes('EHOSTUNREACH')) {
                            (0, log_js_1.logMCPDebug)(name, "Host unreachable - network connectivity issue");
                        }
                        else if (error.message.includes('ESRCH')) {
                            (0, log_js_1.logMCPDebug)(name, "Process not found - stdio server process terminated");
                        }
                        else if (error.message.includes('spawn')) {
                            (0, log_js_1.logMCPDebug)(name, "Failed to spawn process - check command and permissions");
                        }
                        else {
                            (0, log_js_1.logMCPDebug)(name, "Connection error: ".concat(error.message));
                        }
                    }
                    // For HTTP transports, detect session expiry (404 + JSON-RPC -32001)
                    // and close the transport so pending tool calls reject and the next
                    // call reconnects with a fresh session ID.
                    if ((transportType === 'http' || transportType === 'claudeai-proxy') &&
                        isMcpSessionExpiredError(error)) {
                        (0, log_js_1.logMCPDebug)(name, "MCP session expired (server returned 404 with session-not-found), triggering reconnection");
                        closeTransportAndRejectPending_1('session expired');
                        if (originalOnerror_1) {
                            originalOnerror_1(error);
                        }
                        return;
                    }
                    // For remote transports (SSE/HTTP), track terminal connection errors
                    // and trigger reconnection via close if we see repeated failures.
                    if (transportType === 'sse' ||
                        transportType === 'http' ||
                        transportType === 'claudeai-proxy') {
                        // The SDK's StreamableHTTP transport fires this after exhausting its
                        // own SSE reconnect attempts (default maxRetries: 2) — but it never
                        // calls onclose, so pending callTool() promises hang indefinitely.
                        // This is the definitive "transport gave up" signal.
                        if (error.message.includes('Maximum reconnection attempts')) {
                            closeTransportAndRejectPending_1('SSE reconnection exhausted');
                            if (originalOnerror_1) {
                                originalOnerror_1(error);
                            }
                            return;
                        }
                        if (isTerminalConnectionError_1(error.message)) {
                            consecutiveConnectionErrors_1++;
                            (0, log_js_1.logMCPDebug)(name, "Terminal connection error ".concat(consecutiveConnectionErrors_1, "/").concat(MAX_ERRORS_BEFORE_RECONNECT_1));
                            if (consecutiveConnectionErrors_1 >= MAX_ERRORS_BEFORE_RECONNECT_1) {
                                consecutiveConnectionErrors_1 = 0;
                                closeTransportAndRejectPending_1('max consecutive terminal errors');
                            }
                        }
                        else {
                            // Non-terminal error (e.g., transient issue), reset counter
                            consecutiveConnectionErrors_1 = 0;
                        }
                    }
                    // Call original handler
                    if (originalOnerror_1) {
                        originalOnerror_1(error);
                    }
                };
                // Enhanced close handler with connection drop context
                client_1.onclose = function () {
                    var _a;
                    var uptime = Date.now() - connectionStartTime_1;
                    var transportType = (_a = serverRef.type) !== null && _a !== void 0 ? _a : 'unknown';
                    (0, log_js_1.logMCPDebug)(name, "".concat(transportType.toUpperCase(), " connection closed after ").concat(Math.floor(uptime / 1000), "s (").concat(hasErrorOccurred_1 ? 'with errors' : 'cleanly', ")"));
                    // Clear the memoization cache so next operation reconnects
                    var key = getServerCacheKey(name, serverRef);
                    // Also clear fetch caches (keyed by server name). Reconnection
                    // creates a new connection object; without clearing, the next
                    // fetch would return stale tools/resources from the old connection.
                    exports.fetchToolsForClient.cache.delete(name);
                    exports.fetchResourcesForClient.cache.delete(name);
                    exports.fetchCommandsForClient.cache.delete(name);
                    if ((0, bun_bundle_1.feature)('MCP_SKILLS')) {
                        fetchMcpSkillsForClient.cache.delete(name);
                    }
                    exports.connectToServer.cache.delete(key);
                    (0, log_js_1.logMCPDebug)(name, "Cleared connection cache for reconnection");
                    if (originalOnclose_1) {
                        originalOnclose_1();
                    }
                };
                cleanup_1 = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var error_4, error_5, stdioTransport, stdioTransport, childPid_1, processError_1, error_6;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!inProcessServer) return [3 /*break*/, 8];
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, inProcessServer.close()];
                            case 2:
                                _b.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                error_4 = _b.sent();
                                (0, log_js_1.logMCPDebug)(name, "Error closing in-process server: ".concat(error_4));
                                return [3 /*break*/, 4];
                            case 4:
                                _b.trys.push([4, 6, , 7]);
                                return [4 /*yield*/, client_1.close()];
                            case 5:
                                _b.sent();
                                return [3 /*break*/, 7];
                            case 6:
                                error_5 = _b.sent();
                                (0, log_js_1.logMCPDebug)(name, "Error closing client: ".concat(error_5));
                                return [3 /*break*/, 7];
                            case 7: return [2 /*return*/];
                            case 8:
                                // Remove stderr event listener to prevent memory leaks
                                if (stderrHandler_1 && (serverRef.type === 'stdio' || !serverRef.type)) {
                                    stdioTransport = transport_1;
                                    (_a = stdioTransport.stderr) === null || _a === void 0 ? void 0 : _a.off('data', stderrHandler_1);
                                }
                                if (!(serverRef.type === 'stdio')) return [3 /*break*/, 13];
                                _b.label = 9;
                            case 9:
                                _b.trys.push([9, 12, , 13]);
                                stdioTransport = transport_1;
                                childPid_1 = stdioTransport.pid;
                                if (!childPid_1) return [3 /*break*/, 11];
                                (0, log_js_1.logMCPDebug)(name, 'Sending SIGINT to MCP server process');
                                // First try SIGINT (like Ctrl+C)
                                try {
                                    process.kill(childPid_1, 'SIGINT');
                                }
                                catch (error) {
                                    (0, log_js_1.logMCPDebug)(name, "Error sending SIGINT: ".concat(error));
                                    return [2 /*return*/];
                                }
                                // Wait for graceful shutdown with rapid escalation (total 500ms to keep CLI responsive)
                                return [4 /*yield*/, new Promise(function (resolve) { return __awaiter(void 0, void 0, void 0, function () {
                                        var resolved, checkInterval, failsafeTimeout, _a;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    resolved = false;
                                                    checkInterval = setInterval(function () {
                                                        try {
                                                            // process.kill(pid, 0) checks if process exists without killing it
                                                            process.kill(childPid_1, 0);
                                                        }
                                                        catch (_a) {
                                                            // Process no longer exists
                                                            if (!resolved) {
                                                                resolved = true;
                                                                clearInterval(checkInterval);
                                                                clearTimeout(failsafeTimeout);
                                                                (0, log_js_1.logMCPDebug)(name, 'MCP server process exited cleanly');
                                                                resolve();
                                                            }
                                                        }
                                                    }, 50);
                                                    failsafeTimeout = setTimeout(function () {
                                                        if (!resolved) {
                                                            resolved = true;
                                                            clearInterval(checkInterval);
                                                            (0, log_js_1.logMCPDebug)(name, 'Cleanup timeout reached, stopping process monitoring');
                                                            resolve();
                                                        }
                                                    }, 600);
                                                    _b.label = 1;
                                                case 1:
                                                    _b.trys.push([1, 5, , 6]);
                                                    // Wait 100ms for SIGINT to work (usually much faster)
                                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(100)];
                                                case 2:
                                                    // Wait 100ms for SIGINT to work (usually much faster)
                                                    _b.sent();
                                                    if (!!resolved) return [3 /*break*/, 4];
                                                    // Check if process still exists
                                                    try {
                                                        process.kill(childPid_1, 0);
                                                        // Process still exists, SIGINT failed, try SIGTERM
                                                        (0, log_js_1.logMCPDebug)(name, 'SIGINT failed, sending SIGTERM to MCP server process');
                                                        try {
                                                            process.kill(childPid_1, 'SIGTERM');
                                                        }
                                                        catch (termError) {
                                                            (0, log_js_1.logMCPDebug)(name, "Error sending SIGTERM: ".concat(termError));
                                                            resolved = true;
                                                            clearInterval(checkInterval);
                                                            clearTimeout(failsafeTimeout);
                                                            resolve();
                                                            return [2 /*return*/];
                                                        }
                                                    }
                                                    catch (_c) {
                                                        // Process already exited
                                                        resolved = true;
                                                        clearInterval(checkInterval);
                                                        clearTimeout(failsafeTimeout);
                                                        resolve();
                                                        return [2 /*return*/];
                                                    }
                                                    // Wait 400ms for SIGTERM to work (slower than SIGINT, often used for cleanup)
                                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(400)];
                                                case 3:
                                                    // Wait 400ms for SIGTERM to work (slower than SIGINT, often used for cleanup)
                                                    _b.sent();
                                                    if (!resolved) {
                                                        // Check if process still exists
                                                        try {
                                                            process.kill(childPid_1, 0);
                                                            // Process still exists, SIGTERM failed, force kill with SIGKILL
                                                            (0, log_js_1.logMCPDebug)(name, 'SIGTERM failed, sending SIGKILL to MCP server process');
                                                            try {
                                                                process.kill(childPid_1, 'SIGKILL');
                                                            }
                                                            catch (killError) {
                                                                (0, log_js_1.logMCPDebug)(name, "Error sending SIGKILL: ".concat(killError));
                                                            }
                                                        }
                                                        catch (_d) {
                                                            // Process already exited
                                                            resolved = true;
                                                            clearInterval(checkInterval);
                                                            clearTimeout(failsafeTimeout);
                                                            resolve();
                                                        }
                                                    }
                                                    _b.label = 4;
                                                case 4:
                                                    // Final timeout - always resolve after 500ms max (total cleanup time)
                                                    if (!resolved) {
                                                        resolved = true;
                                                        clearInterval(checkInterval);
                                                        clearTimeout(failsafeTimeout);
                                                        resolve();
                                                    }
                                                    return [3 /*break*/, 6];
                                                case 5:
                                                    _a = _b.sent();
                                                    // Handle any errors in the escalation sequence
                                                    if (!resolved) {
                                                        resolved = true;
                                                        clearInterval(checkInterval);
                                                        clearTimeout(failsafeTimeout);
                                                        resolve();
                                                    }
                                                    return [3 /*break*/, 6];
                                                case 6: return [2 /*return*/];
                                            }
                                        });
                                    }); })];
                            case 10:
                                // Wait for graceful shutdown with rapid escalation (total 500ms to keep CLI responsive)
                                _b.sent();
                                _b.label = 11;
                            case 11: return [3 /*break*/, 13];
                            case 12:
                                processError_1 = _b.sent();
                                (0, log_js_1.logMCPDebug)(name, "Error terminating process: ".concat(processError_1));
                                return [3 /*break*/, 13];
                            case 13:
                                _b.trys.push([13, 15, , 16]);
                                return [4 /*yield*/, client_1.close()];
                            case 14:
                                _b.sent();
                                return [3 /*break*/, 16];
                            case 15:
                                error_6 = _b.sent();
                                (0, log_js_1.logMCPDebug)(name, "Error closing client: ".concat(error_6));
                                return [3 /*break*/, 16];
                            case 16: return [2 /*return*/];
                        }
                    });
                }); };
                cleanupUnregister_1 = (0, cleanupRegistry_js_1.registerCleanup)(cleanup_1);
                wrappedCleanup = function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                cleanupUnregister_1 === null || cleanupUnregister_1 === void 0 ? void 0 : cleanupUnregister_1();
                                return [4 /*yield*/, cleanup_1()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                connectionDurationMs = Date.now() - connectStartTime;
                (0, index_js_2.logEvent)('tengu_mcp_server_connection_succeeded', __assign({ connectionDurationMs: connectionDurationMs, transportType: ((_g = serverRef.type) !== null && _g !== void 0 ? _g : 'stdio'), totalServers: serverStats === null || serverStats === void 0 ? void 0 : serverStats.totalServers, stdioCount: serverStats === null || serverStats === void 0 ? void 0 : serverStats.stdioCount, sseCount: serverStats === null || serverStats === void 0 ? void 0 : serverStats.sseCount, httpCount: serverStats === null || serverStats === void 0 ? void 0 : serverStats.httpCount, sseIdeCount: serverStats === null || serverStats === void 0 ? void 0 : serverStats.sseIdeCount, wsIdeCount: serverStats === null || serverStats === void 0 ? void 0 : serverStats.wsIdeCount }, mcpBaseUrlAnalytics(serverRef)));
                return [2 /*return*/, {
                        name: name,
                        client: client_1,
                        type: 'connected',
                        capabilities: capabilities !== null && capabilities !== void 0 ? capabilities : {},
                        serverInfo: serverVersion,
                        instructions: instructions,
                        config: serverRef,
                        cleanup: wrappedCleanup,
                    }];
            case 34:
                error_3 = _j.sent();
                connectionDurationMs = Date.now() - connectStartTime;
                (0, index_js_2.logEvent)('tengu_mcp_server_connection_failed', __assign({ connectionDurationMs: connectionDurationMs, totalServers: (serverStats === null || serverStats === void 0 ? void 0 : serverStats.totalServers) || 1, stdioCount: (serverStats === null || serverStats === void 0 ? void 0 : serverStats.stdioCount) || (serverRef.type === 'stdio' ? 1 : 0), sseCount: (serverStats === null || serverStats === void 0 ? void 0 : serverStats.sseCount) || (serverRef.type === 'sse' ? 1 : 0), httpCount: (serverStats === null || serverStats === void 0 ? void 0 : serverStats.httpCount) || (serverRef.type === 'http' ? 1 : 0), sseIdeCount: (serverStats === null || serverStats === void 0 ? void 0 : serverStats.sseIdeCount) || (serverRef.type === 'sse-ide' ? 1 : 0), wsIdeCount: (serverStats === null || serverStats === void 0 ? void 0 : serverStats.wsIdeCount) || (serverRef.type === 'ws-ide' ? 1 : 0), transportType: ((_h = serverRef.type) !== null && _h !== void 0 ? _h : 'stdio') }, mcpBaseUrlAnalytics(serverRef)));
                (0, log_js_1.logMCPDebug)(name, "Connection failed after ".concat(connectionDurationMs, "ms: ").concat((0, errors_js_1.errorMessage)(error_3)));
                (0, log_js_1.logMCPError)(name, "Connection failed: ".concat((0, errors_js_1.errorMessage)(error_3)));
                if (inProcessServer) {
                    inProcessServer.close().catch(function () { });
                }
                return [2 /*return*/, {
                        name: name,
                        type: 'failed',
                        config: serverRef,
                        error: (0, errors_js_1.errorMessage)(error_3),
                    }];
            case 35: return [2 /*return*/];
        }
    });
}); }, getServerCacheKey);
/**
 * Clears the memoize cache for a specific server
 * @param name Server name
 * @param serverRef Server configuration
 */
function clearServerCache(name, serverRef) {
    return __awaiter(this, void 0, void 0, function () {
        var key, wrappedClient, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    key = getServerCacheKey(name, serverRef);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, (0, exports.connectToServer)(name, serverRef)];
                case 2:
                    wrappedClient = _b.sent();
                    if (!(wrappedClient.type === 'connected')) return [3 /*break*/, 4];
                    return [4 /*yield*/, wrappedClient.cleanup()];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 6:
                    // Clear from cache (both connection and fetch caches so reconnect
                    // fetches fresh tools/resources/commands instead of stale ones)
                    exports.connectToServer.cache.delete(key);
                    exports.fetchToolsForClient.cache.delete(name);
                    exports.fetchResourcesForClient.cache.delete(name);
                    exports.fetchCommandsForClient.cache.delete(name);
                    if ((0, bun_bundle_1.feature)('MCP_SKILLS')) {
                        fetchMcpSkillsForClient.cache.delete(name);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Ensures a valid connected client for an MCP server.
 * For most server types, uses the memoization cache if available, or reconnects
 * if the cache was cleared (e.g., after onclose). This ensures tool/resource
 * calls always use a valid connection.
 *
 * SDK MCP servers run in-process and are handled separately via setupSdkMcpClients,
 * so they are returned as-is without going through connectToServer.
 *
 * @param client The connected MCP server client
 * @returns Connected MCP server client (same or reconnected)
 * @throws Error if server cannot be connected
 */
function ensureConnectedClient(client) {
    return __awaiter(this, void 0, void 0, function () {
        var connectedClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // SDK MCP servers run in-process and are handled separately via setupSdkMcpClients
                    if (client.config.type === 'sdk') {
                        return [2 /*return*/, client];
                    }
                    return [4 /*yield*/, (0, exports.connectToServer)(client.name, client.config)];
                case 1:
                    connectedClient = _a.sent();
                    if (connectedClient.type !== 'connected') {
                        throw new errors_js_1.TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS("MCP server \"".concat(client.name, "\" is not connected"), 'MCP server not connected');
                    }
                    return [2 /*return*/, connectedClient];
            }
        });
    });
}
/**
 * Compares two MCP server configurations to determine if they are equivalent.
 * Used to detect when a server needs to be reconnected due to config changes.
 */
function areMcpConfigsEqual(a, b) {
    // Quick type check first
    if (a.type !== b.type)
        return false;
    // Compare by serializing - this handles all config variations
    // We exclude 'scope' from comparison since it's metadata, not connection config
    var _scopeA = a.scope, configA = __rest(a, ["scope"]);
    var _scopeB = b.scope, configB = __rest(b, ["scope"]);
    return (0, slowOperations_js_1.jsonStringify)(configA) === (0, slowOperations_js_1.jsonStringify)(configB);
}
// Max cache size for fetch* caches. Keyed by server name (stable across
// reconnects), bounded to prevent unbounded growth with many MCP servers.
var MCP_FETCH_CACHE_SIZE = 20;
/**
 * Encode MCP tool input for the auto-mode security classifier.
 * Exported so the auto-mode eval scripts can mirror production encoding
 * for `mcp__*` tool stubs without duplicating this logic.
 */
function mcpToolInputToAutoClassifierInput(input, toolName) {
    var keys = Object.keys(input);
    return keys.length > 0
        ? keys.map(function (k) { return "".concat(k, "=").concat(String(input[k])); }).join(' ')
        : toolName;
}
exports.fetchToolsForClient = (0, memoize_js_2.memoizeWithLRU)(function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var result, toolsToProcess, skipPrefix_1, error_7;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (client.type !== 'connected')
                    return [2 /*return*/, []];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                if (!((_a = client.capabilities) === null || _a === void 0 ? void 0 : _a.tools)) {
                    return [2 /*return*/, []];
                }
                return [4 /*yield*/, client.client.request({ method: 'tools/list' }, types_js_1.ListToolsResultSchema)];
            case 2:
                result = (_b.sent());
                toolsToProcess = (0, sanitization_js_1.recursivelySanitizeUnicode)(result.tools);
                skipPrefix_1 = client.config.type === 'sdk' &&
                    (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_AGENT_SDK_MCP_NO_PREFIX);
                // Convert MCP tools to our Tool format
                return [2 /*return*/, toolsToProcess
                        .map(function (tool) {
                        var _a, _b;
                        var fullyQualifiedName = (0, mcpStringUtils_js_1.buildMcpToolName)(client.name, tool.name);
                        return __assign(__assign(__assign(__assign({}, MCPTool_js_1.MCPTool), { 
                            // In skip-prefix mode, use the original name for model invocation so MCP tools
                            // can override builtins by name. mcpInfo is used for permission checking.
                            name: skipPrefix_1 ? tool.name : fullyQualifiedName, mcpInfo: { serverName: client.name, toolName: tool.name }, isMcp: true, 
                            // Collapse whitespace: _meta is open to external MCP servers, and
                            // a newline here would inject orphan lines into the deferred-tool
                            // list (formatDeferredToolLine joins on '\n').
                            searchHint: typeof ((_a = tool._meta) === null || _a === void 0 ? void 0 : _a['anthropic/searchHint']) === 'string'
                                ? tool._meta['anthropic/searchHint']
                                    .replace(/\s+/g, ' ')
                                    .trim() || undefined
                                : undefined, alwaysLoad: ((_b = tool._meta) === null || _b === void 0 ? void 0 : _b['anthropic/alwaysLoad']) === true, description: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var _a;
                                    return __generator(this, function (_b) {
                                        return [2 /*return*/, (_a = tool.description) !== null && _a !== void 0 ? _a : ''];
                                    });
                                });
                            }, prompt: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var desc;
                                    var _a;
                                    return __generator(this, function (_b) {
                                        desc = (_a = tool.description) !== null && _a !== void 0 ? _a : '';
                                        return [2 /*return*/, desc.length > MAX_MCP_DESCRIPTION_LENGTH
                                                ? desc.slice(0, MAX_MCP_DESCRIPTION_LENGTH) + '… [truncated]'
                                                : desc];
                                    });
                                });
                            }, isConcurrencySafe: function () {
                                var _a, _b;
                                return (_b = (_a = tool.annotations) === null || _a === void 0 ? void 0 : _a.readOnlyHint) !== null && _b !== void 0 ? _b : false;
                            }, isReadOnly: function () {
                                var _a, _b;
                                return (_b = (_a = tool.annotations) === null || _a === void 0 ? void 0 : _a.readOnlyHint) !== null && _b !== void 0 ? _b : false;
                            }, toAutoClassifierInput: function (input) {
                                return mcpToolInputToAutoClassifierInput(input, tool.name);
                            }, isDestructive: function () {
                                var _a, _b;
                                return (_b = (_a = tool.annotations) === null || _a === void 0 ? void 0 : _a.destructiveHint) !== null && _b !== void 0 ? _b : false;
                            }, isOpenWorld: function () {
                                var _a, _b;
                                return (_b = (_a = tool.annotations) === null || _a === void 0 ? void 0 : _a.openWorldHint) !== null && _b !== void 0 ? _b : false;
                            }, isSearchOrReadCommand: function () {
                                return (0, classifyForCollapse_js_1.classifyMcpToolForCollapse)(client.name, tool.name);
                            }, inputJSONSchema: tool.inputSchema, checkPermissions: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        return [2 /*return*/, {
                                                behavior: 'passthrough',
                                                message: 'MCPTool requires permission.',
                                                suggestions: [
                                                    {
                                                        type: 'addRules',
                                                        rules: [
                                                            {
                                                                toolName: fullyQualifiedName,
                                                                ruleContent: undefined,
                                                            },
                                                        ],
                                                        behavior: 'allow',
                                                        destination: 'localSettings',
                                                    },
                                                ],
                                            }];
                                    });
                                });
                            }, call: function (args, context, _canUseTool, parentMessage, onProgress) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var toolUseId, meta, startTime, MAX_SESSION_RETRIES, attempt, connectedClient, mcpResult, error_8, name_1;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                toolUseId = extractToolUseId(parentMessage);
                                                meta = toolUseId
                                                    ? { 'claudecode/toolUseId': toolUseId }
                                                    : {};
                                                // Emit progress when tool starts
                                                if (onProgress && toolUseId) {
                                                    onProgress({
                                                        toolUseID: toolUseId,
                                                        data: {
                                                            type: 'mcp_progress',
                                                            status: 'started',
                                                            serverName: client.name,
                                                            toolName: tool.name,
                                                        },
                                                    });
                                                }
                                                startTime = Date.now();
                                                MAX_SESSION_RETRIES = 1;
                                                attempt = 0;
                                                _a.label = 1;
                                            case 1:
                                                _a.trys.push([1, 4, , 5]);
                                                return [4 /*yield*/, ensureConnectedClient(client)];
                                            case 2:
                                                connectedClient = _a.sent();
                                                return [4 /*yield*/, callMCPToolWithUrlElicitationRetry({
                                                        client: connectedClient,
                                                        clientConnection: client,
                                                        tool: tool.name,
                                                        args: args,
                                                        meta: meta,
                                                        signal: context.abortController.signal,
                                                        setAppState: context.setAppState,
                                                        onProgress: onProgress && toolUseId
                                                            ? function (progressData) {
                                                                onProgress({
                                                                    toolUseID: toolUseId,
                                                                    data: progressData,
                                                                });
                                                            }
                                                            : undefined,
                                                        handleElicitation: context.handleElicitation,
                                                    })
                                                    // Emit progress when tool completes successfully
                                                ];
                                            case 3:
                                                mcpResult = _a.sent();
                                                // Emit progress when tool completes successfully
                                                if (onProgress && toolUseId) {
                                                    onProgress({
                                                        toolUseID: toolUseId,
                                                        data: {
                                                            type: 'mcp_progress',
                                                            status: 'completed',
                                                            serverName: client.name,
                                                            toolName: tool.name,
                                                            elapsedTimeMs: Date.now() - startTime,
                                                        },
                                                    });
                                                }
                                                return [2 /*return*/, __assign({ data: mcpResult.content }, ((mcpResult._meta || mcpResult.structuredContent) && {
                                                        mcpMeta: __assign(__assign({}, (mcpResult._meta && {
                                                            _meta: mcpResult._meta,
                                                        })), (mcpResult.structuredContent && {
                                                            structuredContent: mcpResult.structuredContent,
                                                        })),
                                                    }))];
                                            case 4:
                                                error_8 = _a.sent();
                                                // Session expired — the connection cache has been
                                                // cleared, so retry with a fresh client.
                                                if (error_8 instanceof McpSessionExpiredError &&
                                                    attempt < MAX_SESSION_RETRIES) {
                                                    (0, log_js_1.logMCPDebug)(client.name, "Retrying tool '".concat(tool.name, "' after session recovery"));
                                                    return [3 /*break*/, 5];
                                                }
                                                // Emit progress when tool fails
                                                if (onProgress && toolUseId) {
                                                    onProgress({
                                                        toolUseID: toolUseId,
                                                        data: {
                                                            type: 'mcp_progress',
                                                            status: 'failed',
                                                            serverName: client.name,
                                                            toolName: tool.name,
                                                            elapsedTimeMs: Date.now() - startTime,
                                                        },
                                                    });
                                                }
                                                // Wrap MCP SDK errors so telemetry gets useful context
                                                // instead of just "Error" or "McpError" (the constructor
                                                // name). MCP SDK errors are protocol-level messages and
                                                // don't contain user file paths or code.
                                                if (error_8 instanceof Error &&
                                                    !(error_8 instanceof
                                                        errors_js_1.TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS)) {
                                                    name_1 = error_8.constructor.name;
                                                    if (name_1 === 'Error') {
                                                        throw new errors_js_1.TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS(error_8.message, error_8.message.slice(0, 200));
                                                    }
                                                    // McpError has a numeric `code` with the JSON-RPC error
                                                    // code (e.g. -32000 ConnectionClosed, -32001 RequestTimeout)
                                                    if (name_1 === 'McpError' &&
                                                        'code' in error_8 &&
                                                        typeof error_8.code === 'number') {
                                                        throw new errors_js_1.TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS(error_8.message, "McpError ".concat(error_8.code));
                                                    }
                                                }
                                                throw error_8;
                                            case 5:
                                                attempt++;
                                                return [3 /*break*/, 1];
                                            case 6: return [2 /*return*/];
                                        }
                                    });
                                });
                            }, userFacingName: function () {
                                var _a;
                                // Prefer title annotation if available, otherwise use tool name
                                var displayName = ((_a = tool.annotations) === null || _a === void 0 ? void 0 : _a.title) || tool.name;
                                return "".concat(client.name, " - ").concat(displayName, " (MCP)");
                            } }), ((0, common_js_1.isClaudeInChromeMCPServer)(client.name) &&
                            (client.config.type === 'stdio' || !client.config.type)
                            ? claudeInChromeToolRendering().getClaudeInChromeMCPToolOverrides(tool.name)
                            : {})), ((0, bun_bundle_1.feature)('CHICAGO_MCP') &&
                            (client.config.type === 'stdio' || !client.config.type) &&
                            isComputerUseMCPServer(client.name)
                            ? computerUseWrapper().getComputerUseMCPToolOverrides(tool.name)
                            : {}));
                    })
                        .filter(isIncludedMcpTool)];
            case 3:
                error_7 = _b.sent();
                (0, log_js_1.logMCPError)(client.name, "Failed to fetch tools: ".concat((0, errors_js_1.errorMessage)(error_7)));
                return [2 /*return*/, []];
            case 4: return [2 /*return*/];
        }
    });
}); }, function (client) { return client.name; }, MCP_FETCH_CACHE_SIZE);
exports.fetchResourcesForClient = (0, memoize_js_2.memoizeWithLRU)(function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_9;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (client.type !== 'connected')
                    return [2 /*return*/, []];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                if (!((_a = client.capabilities) === null || _a === void 0 ? void 0 : _a.resources)) {
                    return [2 /*return*/, []];
                }
                return [4 /*yield*/, client.client.request({ method: 'resources/list' }, types_js_1.ListResourcesResultSchema)];
            case 2:
                result = _b.sent();
                if (!result.resources)
                    return [2 /*return*/, []
                        // Add server name to each resource
                    ];
                // Add server name to each resource
                return [2 /*return*/, result.resources.map(function (resource) { return (__assign(__assign({}, resource), { server: client.name })); })];
            case 3:
                error_9 = _b.sent();
                (0, log_js_1.logMCPError)(client.name, "Failed to fetch resources: ".concat((0, errors_js_1.errorMessage)(error_9)));
                return [2 /*return*/, []];
            case 4: return [2 /*return*/];
        }
    });
}); }, function (client) { return client.name; }, MCP_FETCH_CACHE_SIZE);
exports.fetchCommandsForClient = (0, memoize_js_2.memoizeWithLRU)(function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var result, promptsToProcess, error_10;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (client.type !== 'connected')
                    return [2 /*return*/, []];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                if (!((_a = client.capabilities) === null || _a === void 0 ? void 0 : _a.prompts)) {
                    return [2 /*return*/, []];
                }
                return [4 /*yield*/, client.client.request({ method: 'prompts/list' }, types_js_1.ListPromptsResultSchema)];
            case 2:
                result = (_b.sent());
                if (!result.prompts)
                    return [2 /*return*/, []
                        // Sanitize prompt data from MCP server
                    ];
                promptsToProcess = (0, sanitization_js_1.recursivelySanitizeUnicode)(result.prompts);
                // Convert MCP prompts to our Command format
                return [2 /*return*/, promptsToProcess.map(function (prompt) {
                        var _a, _b;
                        var argNames = Object.values((_a = prompt.arguments) !== null && _a !== void 0 ? _a : {}).map(function (k) { return k.name; });
                        return {
                            type: 'prompt',
                            name: 'mcp__' + (0, normalization_js_1.normalizeNameForMCP)(client.name) + '__' + prompt.name,
                            description: (_b = prompt.description) !== null && _b !== void 0 ? _b : '',
                            hasUserSpecifiedDescription: !!prompt.description,
                            contentLength: 0, // Dynamic MCP content
                            isEnabled: function () { return true; },
                            isHidden: false,
                            isMcp: true,
                            progressMessage: 'running',
                            userFacingName: function () {
                                // Use prompt.name (programmatic identifier) not prompt.title (display name)
                                // to avoid spaces breaking slash command parsing
                                return "".concat(client.name, ":").concat(prompt.name, " (MCP)");
                            },
                            argNames: argNames,
                            source: 'mcp',
                            getPromptForCommand: function (args) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var argsArray, connectedClient_1, result_1, transformed, error_11;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                argsArray = args.split(' ');
                                                _a.label = 1;
                                            case 1:
                                                _a.trys.push([1, 5, , 6]);
                                                return [4 /*yield*/, ensureConnectedClient(client)];
                                            case 2:
                                                connectedClient_1 = _a.sent();
                                                return [4 /*yield*/, connectedClient_1.client.getPrompt({
                                                        name: prompt.name,
                                                        arguments: (0, zipObject_js_1.default)(argNames, argsArray),
                                                    })];
                                            case 3:
                                                result_1 = _a.sent();
                                                return [4 /*yield*/, Promise.all(result_1.messages.map(function (message) {
                                                        return transformResultContent(message.content, connectedClient_1.name);
                                                    }))];
                                            case 4:
                                                transformed = _a.sent();
                                                return [2 /*return*/, transformed.flat()];
                                            case 5:
                                                error_11 = _a.sent();
                                                (0, log_js_1.logMCPError)(client.name, "Error running command '".concat(prompt.name, "': ").concat((0, errors_js_1.errorMessage)(error_11)));
                                                throw error_11;
                                            case 6: return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                        };
                    })];
            case 3:
                error_10 = _b.sent();
                (0, log_js_1.logMCPError)(client.name, "Failed to fetch commands: ".concat((0, errors_js_1.errorMessage)(error_10)));
                return [2 /*return*/, []];
            case 4: return [2 /*return*/];
        }
    });
}); }, function (client) { return client.name; }, MCP_FETCH_CACHE_SIZE);
/**
 * Call an IDE tool directly as an RPC
 * @param toolName The name of the tool to call
 * @param args The arguments to pass to the tool
 * @param client The IDE client to use for the RPC call
 * @returns The result of the tool call
 */
function callIdeRpc(toolName, args, client) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, callMCPTool({
                        client: client,
                        tool: toolName,
                        args: args,
                        signal: (0, abortController_js_1.createAbortController)().signal,
                    })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.content];
            }
        });
    });
}
/**
 * Note: This should not be called by UI components directly, they should use the reconnectMcpServer
 * function from useManageMcpConnections.
 * @param name Server name
 * @param config Server configuration
 * @returns Object containing the client connection and its resources
 */
function reconnectMcpServerImpl(name, config) {
    return __awaiter(this, void 0, void 0, function () {
        var client, supportsResources, _a, tools_1, mcpCommands, mcpSkills, resources, commands, resourceTools, hasResourceTools, error_12;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    // Invalidate the keychain cache so we read fresh credentials from disk.
                    // This is necessary when another process (e.g. the VS Code extension host)
                    // has modified stored tokens (cleared auth, saved new OAuth tokens) and then
                    // asks the CLI subprocess to reconnect.  Without this, the subprocess would
                    // use stale cached data and never notice the tokens were removed.
                    (0, macOsKeychainHelpers_js_1.clearKeychainCache)();
                    return [4 /*yield*/, clearServerCache(name, config)];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, exports.connectToServer)(name, config)];
                case 2:
                    client = _c.sent();
                    if (client.type !== 'connected') {
                        return [2 /*return*/, {
                                client: client,
                                tools: [],
                                commands: [],
                            }];
                    }
                    if (config.type === 'claudeai-proxy') {
                        (0, claudeai_js_1.markClaudeAiMcpConnected)(name);
                    }
                    supportsResources = !!((_b = client.capabilities) === null || _b === void 0 ? void 0 : _b.resources);
                    return [4 /*yield*/, Promise.all([
                            (0, exports.fetchToolsForClient)(client),
                            (0, exports.fetchCommandsForClient)(client),
                            (0, bun_bundle_1.feature)('MCP_SKILLS') && supportsResources
                                ? fetchMcpSkillsForClient(client)
                                : Promise.resolve([]),
                            supportsResources ? (0, exports.fetchResourcesForClient)(client) : Promise.resolve([]),
                        ])];
                case 3:
                    _a = _c.sent(), tools_1 = _a[0], mcpCommands = _a[1], mcpSkills = _a[2], resources = _a[3];
                    commands = __spreadArray(__spreadArray([], mcpCommands, true), mcpSkills, true);
                    resourceTools = [];
                    if (supportsResources) {
                        hasResourceTools = [ListMcpResourcesTool_js_1.ListMcpResourcesTool, ReadMcpResourceTool_js_1.ReadMcpResourceTool].some(function (tool) { return tools_1.some(function (t) { return (0, Tool_js_1.toolMatchesName)(t, tool.name); }); });
                        if (!hasResourceTools) {
                            resourceTools.push(ListMcpResourcesTool_js_1.ListMcpResourcesTool, ReadMcpResourceTool_js_1.ReadMcpResourceTool);
                        }
                    }
                    return [2 /*return*/, {
                            client: client,
                            tools: __spreadArray(__spreadArray([], tools_1, true), resourceTools, true),
                            commands: commands,
                            resources: resources.length > 0 ? resources : undefined,
                        }];
                case 4:
                    error_12 = _c.sent();
                    // Handle errors gracefully - connection might have closed during fetch
                    (0, log_js_1.logMCPError)(name, "Error during reconnection: ".concat((0, errors_js_1.errorMessage)(error_12)));
                    // Return with failed status
                    return [2 /*return*/, {
                            client: { name: name, type: 'failed', config: config },
                            tools: [],
                            commands: [],
                        }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Replaced 2026-03: previous implementation ran fixed-size sequential batches
// (await batch 1 fully, then start batch 2). That meant one slow server in
// batch N held up ALL servers in batch N+1, even if the other 19 slots were
// idle. pMap frees each slot as soon as its server completes, so a single
// slow server only occupies one slot instead of blocking an entire batch
// boundary. Same concurrency ceiling, same results, better scheduling.
function processBatched(items, concurrency, processor) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, p_map_1.default)(items, processor, { concurrency: concurrency })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getMcpToolsCommandsAndResources(onConnectionAttempt, mcpConfigs) {
    return __awaiter(this, void 0, void 0, function () {
        var resourceToolsAdded, allConfigEntries, _a, _b, _c, configEntries, _i, allConfigEntries_1, entry, totalServers, stdioCount, sseCount, httpCount, sseIdeCount, wsIdeCount, localServers, remoteServers, serverStats, processServer;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    resourceToolsAdded = false;
                    _b = (_a = Object).entries;
                    if (!(mcpConfigs !== null && mcpConfigs !== void 0)) return [3 /*break*/, 1];
                    _c = mcpConfigs;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, (0, config_js_1.getAllMcpConfigs)()];
                case 2:
                    _c = (_d.sent()).servers;
                    _d.label = 3;
                case 3:
                    allConfigEntries = _b.apply(_a, [_c]);
                    configEntries = [];
                    for (_i = 0, allConfigEntries_1 = allConfigEntries; _i < allConfigEntries_1.length; _i++) {
                        entry = allConfigEntries_1[_i];
                        if ((0, config_js_1.isMcpServerDisabled)(entry[0])) {
                            onConnectionAttempt({
                                client: { name: entry[0], type: 'disabled', config: entry[1] },
                                tools: [],
                                commands: [],
                            });
                        }
                        else {
                            configEntries.push(entry);
                        }
                    }
                    totalServers = configEntries.length;
                    stdioCount = (0, array_js_1.count)(configEntries, function (_a) {
                        var _ = _a[0], c = _a[1];
                        return c.type === 'stdio';
                    });
                    sseCount = (0, array_js_1.count)(configEntries, function (_a) {
                        var _ = _a[0], c = _a[1];
                        return c.type === 'sse';
                    });
                    httpCount = (0, array_js_1.count)(configEntries, function (_a) {
                        var _ = _a[0], c = _a[1];
                        return c.type === 'http';
                    });
                    sseIdeCount = (0, array_js_1.count)(configEntries, function (_a) {
                        var _ = _a[0], c = _a[1];
                        return c.type === 'sse-ide';
                    });
                    wsIdeCount = (0, array_js_1.count)(configEntries, function (_a) {
                        var _ = _a[0], c = _a[1];
                        return c.type === 'ws-ide';
                    });
                    localServers = configEntries.filter(function (_a) {
                        var _ = _a[0], config = _a[1];
                        return isLocalMcpServer(config);
                    });
                    remoteServers = configEntries.filter(function (_a) {
                        var _ = _a[0], config = _a[1];
                        return !isLocalMcpServer(config);
                    });
                    serverStats = {
                        totalServers: totalServers,
                        stdioCount: stdioCount,
                        sseCount: sseCount,
                        httpCount: httpCount,
                        sseIdeCount: sseIdeCount,
                        wsIdeCount: wsIdeCount,
                    };
                    processServer = function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                        var _c, client, supportsResources, _d, tools, mcpCommands, mcpSkills, resources, commands, resourceTools, error_13;
                        var _e;
                        var name = _b[0], config = _b[1];
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    _f.trys.push([0, 5, , 6]);
                                    // Check if server is disabled - if so, just add it to state without connecting
                                    if ((0, config_js_1.isMcpServerDisabled)(name)) {
                                        onConnectionAttempt({
                                            client: {
                                                name: name,
                                                type: 'disabled',
                                                config: config,
                                            },
                                            tools: [],
                                            commands: [],
                                        });
                                        return [2 /*return*/];
                                    }
                                    _c = (config.type === 'claudeai-proxy' ||
                                        config.type === 'http' ||
                                        config.type === 'sse');
                                    if (!_c) return [3 /*break*/, 2];
                                    return [4 /*yield*/, isMcpAuthCached(name)];
                                case 1:
                                    _c = ((_f.sent()) ||
                                        ((config.type === 'http' || config.type === 'sse') &&
                                            (0, auth_js_3.hasMcpDiscoveryButNoToken)(name, config)));
                                    _f.label = 2;
                                case 2:
                                    // Skip connection for servers that recently returned 401 (15min TTL),
                                    // or that we have probed before but hold no token for. The second
                                    // check closes the gap the TTL leaves open: without it, every 15min
                                    // we re-probe servers that cannot succeed until the user runs /mcp.
                                    // Each probe is a network round-trip for connect-401 plus OAuth
                                    // discovery, and print mode awaits the whole batch (main.tsx:3503).
                                    if (_c) {
                                        (0, log_js_1.logMCPDebug)(name, "Skipping connection (cached needs-auth)");
                                        onConnectionAttempt({
                                            client: { name: name, type: 'needs-auth', config: config },
                                            tools: [(0, McpAuthTool_js_1.createMcpAuthTool)(name, config)],
                                            commands: [],
                                        });
                                        return [2 /*return*/];
                                    }
                                    return [4 /*yield*/, (0, exports.connectToServer)(name, config, serverStats)];
                                case 3:
                                    client = _f.sent();
                                    if (client.type !== 'connected') {
                                        onConnectionAttempt({
                                            client: client,
                                            tools: client.type === 'needs-auth'
                                                ? [(0, McpAuthTool_js_1.createMcpAuthTool)(name, config)]
                                                : [],
                                            commands: [],
                                        });
                                        return [2 /*return*/];
                                    }
                                    if (config.type === 'claudeai-proxy') {
                                        (0, claudeai_js_1.markClaudeAiMcpConnected)(name);
                                    }
                                    supportsResources = !!((_e = client.capabilities) === null || _e === void 0 ? void 0 : _e.resources);
                                    return [4 /*yield*/, Promise.all([
                                            (0, exports.fetchToolsForClient)(client),
                                            (0, exports.fetchCommandsForClient)(client),
                                            // Discover skills from skill:// resources
                                            (0, bun_bundle_1.feature)('MCP_SKILLS') && supportsResources
                                                ? fetchMcpSkillsForClient(client)
                                                : Promise.resolve([]),
                                            // Fetch resources if supported
                                            supportsResources
                                                ? (0, exports.fetchResourcesForClient)(client)
                                                : Promise.resolve([]),
                                        ])];
                                case 4:
                                    _d = _f.sent(), tools = _d[0], mcpCommands = _d[1], mcpSkills = _d[2], resources = _d[3];
                                    commands = __spreadArray(__spreadArray([], mcpCommands, true), mcpSkills, true);
                                    resourceTools = [];
                                    if (supportsResources && !resourceToolsAdded) {
                                        resourceToolsAdded = true;
                                        resourceTools.push(ListMcpResourcesTool_js_1.ListMcpResourcesTool, ReadMcpResourceTool_js_1.ReadMcpResourceTool);
                                    }
                                    onConnectionAttempt({
                                        client: client,
                                        tools: __spreadArray(__spreadArray([], tools, true), resourceTools, true),
                                        commands: commands,
                                        resources: resources.length > 0 ? resources : undefined,
                                    });
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_13 = _f.sent();
                                    // Handle errors gracefully - connection might have closed during fetch
                                    (0, log_js_1.logMCPError)(name, "Error fetching tools/commands/resources: ".concat((0, errors_js_1.errorMessage)(error_13)));
                                    // Still update with the client but no tools/commands
                                    onConnectionAttempt({
                                        client: { name: name, type: 'failed', config: config },
                                        tools: [],
                                        commands: [],
                                    });
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); };
                    // Process both groups concurrently, each with their own concurrency limits:
                    // - Local servers (stdio/sdk): lower concurrency to avoid process spawning resource contention
                    // - Remote servers: higher concurrency since they're just network connections
                    return [4 /*yield*/, Promise.all([
                            processBatched(localServers, getMcpServerConnectionBatchSize(), processServer),
                            processBatched(remoteServers, getRemoteMcpServerConnectionBatchSize(), processServer),
                        ])];
                case 4:
                    // Process both groups concurrently, each with their own concurrency limits:
                    // - Local servers (stdio/sdk): lower concurrency to avoid process spawning resource contention
                    // - Remote servers: higher concurrency since they're just network connections
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Not memoized: called only 2-3 times at startup/reconfig. The inner work
// (connectToServer, fetch*ForClient) is already cached. Memoizing here by
// mcpConfigs object ref leaked — main.tsx creates fresh config objects each call.
function prefetchAllMcpResources(mcpConfigs) {
    return new Promise(function (resolve) {
        var pendingCount = 0;
        var completedCount = 0;
        pendingCount = Object.keys(mcpConfigs).length;
        if (pendingCount === 0) {
            void resolve({
                clients: [],
                tools: [],
                commands: [],
            });
            return;
        }
        var clients = [];
        var tools = [];
        var commands = [];
        getMcpToolsCommandsAndResources(function (result) {
            clients.push(result.client);
            tools.push.apply(tools, result.tools);
            commands.push.apply(commands, result.commands);
            completedCount++;
            if (completedCount >= pendingCount) {
                var commandsMetadataLength = commands.reduce(function (sum, command) {
                    var _a, _b;
                    var commandMetadataLength = command.name.length +
                        ((_a = command.description) !== null && _a !== void 0 ? _a : '').length +
                        ((_b = command.argumentHint) !== null && _b !== void 0 ? _b : '').length;
                    return sum + commandMetadataLength;
                }, 0);
                (0, index_js_2.logEvent)('tengu_mcp_tools_commands_loaded', {
                    tools_count: tools.length,
                    commands_count: commands.length,
                    commands_metadata_length: commandsMetadataLength,
                });
                void resolve({
                    clients: clients,
                    tools: tools,
                    commands: commands,
                });
            }
        }, mcpConfigs).catch(function (error) {
            (0, log_js_1.logMCPError)('prefetchAllMcpResources', "Failed to get MCP resources: ".concat((0, errors_js_1.errorMessage)(error)));
            // Still resolve with empty results
            void resolve({
                clients: [],
                tools: [],
                commands: [],
            });
        });
    });
}
/**
 * Transform result content from an MCP tool or MCP prompt into message blocks
 */
function transformResultContent(resultContent, serverName) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, audioData, imageBuffer, ext, resized, resource, prefix, isImage, imageBuffer, ext, resized, content, resourceLink, text;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _a = resultContent.type;
                    switch (_a) {
                        case 'text': return [3 /*break*/, 1];
                        case 'audio': return [3 /*break*/, 2];
                        case 'image': return [3 /*break*/, 4];
                        case 'resource': return [3 /*break*/, 6];
                        case 'resource_link': return [3 /*break*/, 12];
                    }
                    return [3 /*break*/, 13];
                case 1: return [2 /*return*/, [
                        {
                            type: 'text',
                            text: resultContent.text,
                        },
                    ]];
                case 2:
                    audioData = resultContent;
                    return [4 /*yield*/, persistBlobToTextBlock(Buffer.from(audioData.data, 'base64'), audioData.mimeType, serverName, "[Audio from ".concat(serverName, "] "))];
                case 3: return [2 /*return*/, _e.sent()];
                case 4:
                    imageBuffer = Buffer.from(String(resultContent.data), 'base64');
                    ext = ((_b = resultContent.mimeType) === null || _b === void 0 ? void 0 : _b.split('/')[1]) || 'png';
                    return [4 /*yield*/, (0, imageResizer_js_1.maybeResizeAndDownsampleImageBuffer)(imageBuffer, imageBuffer.length, ext)];
                case 5:
                    resized = _e.sent();
                    return [2 /*return*/, [
                            {
                                type: 'image',
                                source: {
                                    data: resized.buffer.toString('base64'),
                                    media_type: "image/".concat(resized.mediaType),
                                    type: 'base64',
                                },
                            },
                        ]];
                case 6:
                    resource = resultContent.resource;
                    prefix = "[Resource from ".concat(serverName, " at ").concat(resource.uri, "] ");
                    if (!('text' in resource)) return [3 /*break*/, 7];
                    return [2 /*return*/, [
                            {
                                type: 'text',
                                text: "".concat(prefix).concat(resource.text),
                            },
                        ]];
                case 7:
                    if (!('blob' in resource)) return [3 /*break*/, 11];
                    isImage = IMAGE_MIME_TYPES.has((_c = resource.mimeType) !== null && _c !== void 0 ? _c : '');
                    if (!isImage) return [3 /*break*/, 9];
                    imageBuffer = Buffer.from(resource.blob, 'base64');
                    ext = ((_d = resource.mimeType) === null || _d === void 0 ? void 0 : _d.split('/')[1]) || 'png';
                    return [4 /*yield*/, (0, imageResizer_js_1.maybeResizeAndDownsampleImageBuffer)(imageBuffer, imageBuffer.length, ext)];
                case 8:
                    resized = _e.sent();
                    content = [];
                    if (prefix) {
                        content.push({
                            type: 'text',
                            text: prefix,
                        });
                    }
                    content.push({
                        type: 'image',
                        source: {
                            data: resized.buffer.toString('base64'),
                            media_type: "image/".concat(resized.mediaType),
                            type: 'base64',
                        },
                    });
                    return [2 /*return*/, content];
                case 9: return [4 /*yield*/, persistBlobToTextBlock(Buffer.from(resource.blob, 'base64'), resource.mimeType, serverName, prefix)];
                case 10: return [2 /*return*/, _e.sent()];
                case 11: return [2 /*return*/, []];
                case 12:
                    {
                        resourceLink = resultContent;
                        text = "[Resource link: ".concat(resourceLink.name, "] ").concat(resourceLink.uri);
                        if (resourceLink.description) {
                            text += " (".concat(resourceLink.description, ")");
                        }
                        return [2 /*return*/, [
                                {
                                    type: 'text',
                                    text: text,
                                },
                            ]];
                    }
                    _e.label = 13;
                case 13: return [2 /*return*/, []];
            }
        });
    });
}
/**
 * Decode base64 binary content, write it to disk with the proper extension,
 * and return a small text block with the file path. Replaces the old behavior
 * of dumping raw base64 into the context.
 */
function persistBlobToTextBlock(bytes, mimeType, serverName, sourceDescription) {
    return __awaiter(this, void 0, void 0, function () {
        var persistId, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    persistId = "mcp-".concat((0, normalization_js_1.normalizeNameForMCP)(serverName), "-blob-").concat(Date.now(), "-").concat(Math.random().toString(36).slice(2, 8));
                    return [4 /*yield*/, (0, mcpOutputStorage_js_1.persistBinaryContent)(bytes, mimeType, persistId)];
                case 1:
                    result = _a.sent();
                    if ('error' in result) {
                        return [2 /*return*/, [
                                {
                                    type: 'text',
                                    text: "".concat(sourceDescription, "Binary content (").concat(mimeType || 'unknown type', ", ").concat(bytes.length, " bytes) could not be saved to disk: ").concat(result.error),
                                },
                            ]];
                    }
                    return [2 /*return*/, [
                            {
                                type: 'text',
                                text: (0, mcpOutputStorage_js_1.getBinaryBlobSavedMessage)(result.filepath, mimeType, result.size, sourceDescription),
                            },
                        ]];
            }
        });
    });
}
/**
 * Generates a compact, jq-friendly type signature for a value.
 * e.g. "{title: string, items: [{id: number, name: string}]}"
 */
function inferCompactSchema(value, depth) {
    if (depth === void 0) { depth = 2; }
    if (value === null)
        return 'null';
    if (Array.isArray(value)) {
        if (value.length === 0)
            return '[]';
        return "[".concat(inferCompactSchema(value[0], depth - 1), "]");
    }
    if (typeof value === 'object') {
        if (depth <= 0)
            return '{...}';
        var entries = Object.entries(value).slice(0, 10);
        var props = entries.map(function (_a) {
            var k = _a[0], v = _a[1];
            return "".concat(k, ": ").concat(inferCompactSchema(v, depth - 1));
        });
        var suffix = Object.keys(value).length > 10 ? ', ...' : '';
        return "{".concat(props.join(', ')).concat(suffix, "}");
    }
    return typeof value;
}
function transformMCPResult(result, tool, // Tool name for validation (e.g., "search")
name) {
    return __awaiter(this, void 0, void 0, function () {
        var transformedContent, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(result && typeof result === 'object')) return [3 /*break*/, 2];
                    if ('toolResult' in result) {
                        return [2 /*return*/, {
                                content: String(result.toolResult),
                                type: 'toolResult',
                            }];
                    }
                    if ('structuredContent' in result &&
                        result.structuredContent !== undefined) {
                        return [2 /*return*/, {
                                content: (0, slowOperations_js_1.jsonStringify)(result.structuredContent),
                                type: 'structuredContent',
                                schema: inferCompactSchema(result.structuredContent),
                            }];
                    }
                    if (!('content' in result && Array.isArray(result.content))) return [3 /*break*/, 2];
                    return [4 /*yield*/, Promise.all(result.content.map(function (item) { return transformResultContent(item, name); }))];
                case 1:
                    transformedContent = (_a.sent()).flat();
                    return [2 /*return*/, {
                            content: transformedContent,
                            type: 'contentArray',
                            schema: inferCompactSchema(transformedContent),
                        }];
                case 2:
                    errorMessage = "MCP server \"".concat(name, "\" tool \"").concat(tool, "\": unexpected response format");
                    (0, log_js_1.logMCPError)(name, errorMessage);
                    throw new errors_js_1.TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS(errorMessage, 'MCP tool unexpected response format');
            }
        });
    });
}
/**
 * Check if MCP content contains any image blocks.
 * Used to decide whether to persist to file (images should use truncation instead
 * to preserve image compression and viewability).
 */
function contentContainsImages(content) {
    if (!content || typeof content === 'string') {
        return false;
    }
    return content.some(function (block) { return block.type === 'image'; });
}
function processMCPResult(result, tool, // Tool name for validation (e.g., "search")
name) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, content, type, schema, sizeEstimateTokens, timestamp, persistId, contentStr, persistResult, contentLength, formatDescription;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, transformMCPResult(result, tool, name)
                    // IDE tools are not going to the model directly, so we don't need to
                    // handle large output.
                ];
                case 1:
                    _a = _b.sent(), content = _a.content, type = _a.type, schema = _a.schema;
                    // IDE tools are not going to the model directly, so we don't need to
                    // handle large output.
                    if (name === 'ide') {
                        return [2 /*return*/, content];
                    }
                    return [4 /*yield*/, (0, mcpValidation_js_1.mcpContentNeedsTruncation)(content)];
                case 2:
                    // Check if content needs truncation (i.e., is too large)
                    if (!(_b.sent())) {
                        return [2 /*return*/, content];
                    }
                    sizeEstimateTokens = (0, mcpValidation_js_1.getContentSizeEstimate)(content);
                    if (!(0, envUtils_js_1.isEnvDefinedFalsy)(process.env.ENABLE_MCP_LARGE_OUTPUT_FILES)) return [3 /*break*/, 4];
                    (0, index_js_2.logEvent)('tengu_mcp_large_result_handled', {
                        outcome: 'truncated',
                        reason: 'env_disabled',
                        sizeEstimateTokens: sizeEstimateTokens,
                    });
                    return [4 /*yield*/, (0, mcpValidation_js_1.truncateMcpContentIfNeeded)(content)];
                case 3: return [2 /*return*/, _b.sent()];
                case 4:
                    // Save large output to file and return instructions for reading it
                    // Content is guaranteed to exist at this point (we checked mcpContentNeedsTruncation)
                    if (!content) {
                        return [2 /*return*/, content];
                    }
                    if (!contentContainsImages(content)) return [3 /*break*/, 6];
                    (0, index_js_2.logEvent)('tengu_mcp_large_result_handled', {
                        outcome: 'truncated',
                        reason: 'contains_images',
                        sizeEstimateTokens: sizeEstimateTokens,
                    });
                    return [4 /*yield*/, (0, mcpValidation_js_1.truncateMcpContentIfNeeded)(content)];
                case 5: return [2 /*return*/, _b.sent()];
                case 6:
                    timestamp = Date.now();
                    persistId = "mcp-".concat((0, normalization_js_1.normalizeNameForMCP)(name), "-").concat((0, normalization_js_1.normalizeNameForMCP)(tool), "-").concat(timestamp);
                    contentStr = typeof content === 'string' ? content : (0, slowOperations_js_1.jsonStringify)(content, null, 2);
                    return [4 /*yield*/, (0, toolResultStorage_js_1.persistToolResult)(contentStr, persistId)];
                case 7:
                    persistResult = _b.sent();
                    if ((0, toolResultStorage_js_1.isPersistError)(persistResult)) {
                        contentLength = contentStr.length;
                        (0, index_js_2.logEvent)('tengu_mcp_large_result_handled', {
                            outcome: 'truncated',
                            reason: 'persist_failed',
                            sizeEstimateTokens: sizeEstimateTokens,
                        });
                        return [2 /*return*/, "Error: result (".concat(contentLength.toLocaleString(), " characters) exceeds maximum allowed tokens. Failed to save output to file: ").concat(persistResult.error, ". If this MCP server provides pagination or filtering tools, use them to retrieve specific portions of the data.")];
                    }
                    (0, index_js_2.logEvent)('tengu_mcp_large_result_handled', {
                        outcome: 'persisted',
                        reason: 'file_saved',
                        sizeEstimateTokens: sizeEstimateTokens,
                        persistedSizeChars: persistResult.originalSize,
                    });
                    formatDescription = (0, mcpOutputStorage_js_1.getFormatDescription)(type, schema);
                    return [2 /*return*/, (0, mcpOutputStorage_js_1.getLargeOutputInstructions)(persistResult.filepath, persistResult.originalSize, formatDescription)];
            }
        });
    });
}
/** @internal Exported for testing. */
function callMCPToolWithUrlElicitationRetry(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var MAX_URL_ELICITATION_RETRIES, _loop_1, attempt, state_1;
        var connectedClient = _b.client, clientConnection = _b.clientConnection, tool = _b.tool, args = _b.args, meta = _b.meta, signal = _b.signal, setAppState = _b.setAppState, onProgress = _b.onProgress, _c = _b.callToolFn, callToolFn = _c === void 0 ? callMCPTool : _c, handleElicitation = _b.handleElicitation;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    MAX_URL_ELICITATION_RETRIES = 3;
                    _loop_1 = function (attempt) {
                        var _e, error_14, errorData, rawElicitations, elicitations, serverName_1, _loop_2, _i, elicitations_1, elicitation, state_2;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    _f.trys.push([0, 2, , 7]);
                                    _e = {};
                                    return [4 /*yield*/, callToolFn({
                                            client: connectedClient,
                                            tool: tool,
                                            args: args,
                                            meta: meta,
                                            signal: signal,
                                            onProgress: onProgress,
                                        })];
                                case 1: return [2 /*return*/, (_e.value = _f.sent(), _e)];
                                case 2:
                                    error_14 = _f.sent();
                                    // The MCP SDK's Protocol creates plain McpError (not UrlElicitationRequiredError)
                                    // for error responses, so we check the error code instead of instanceof.
                                    if (!(error_14 instanceof types_js_1.McpError) ||
                                        error_14.code !== types_js_1.ErrorCode.UrlElicitationRequired) {
                                        throw error_14;
                                    }
                                    // Limit the number of URL elicitation retries
                                    if (attempt >= MAX_URL_ELICITATION_RETRIES) {
                                        throw error_14;
                                    }
                                    errorData = error_14.data;
                                    rawElicitations = errorData != null &&
                                        typeof errorData === 'object' &&
                                        'elicitations' in errorData &&
                                        Array.isArray(errorData.elicitations)
                                        ? errorData.elicitations
                                        : [];
                                    elicitations = rawElicitations.filter(function (e) {
                                        if (e == null || typeof e !== 'object')
                                            return false;
                                        var obj = e;
                                        return (obj.mode === 'url' &&
                                            typeof obj.url === 'string' &&
                                            typeof obj.elicitationId === 'string' &&
                                            typeof obj.message === 'string');
                                    });
                                    serverName_1 = clientConnection.type === 'connected'
                                        ? clientConnection.name
                                        : 'unknown';
                                    if (elicitations.length === 0) {
                                        (0, log_js_1.logMCPDebug)(serverName_1, "Tool '".concat(tool, "' returned -32042 but no valid elicitations in error data"));
                                        throw error_14;
                                    }
                                    (0, log_js_1.logMCPDebug)(serverName_1, "Tool '".concat(tool, "' requires URL elicitation (error -32042, attempt ").concat(attempt + 1, "), processing ").concat(elicitations.length, " elicitation(s)"));
                                    _loop_2 = function (elicitation) {
                                        var elicitationId, hookResponse, userResult, waitingState_1, finalResult;
                                        return __generator(this, function (_g) {
                                            switch (_g.label) {
                                                case 0:
                                                    elicitationId = elicitation.elicitationId;
                                                    return [4 /*yield*/, (0, elicitationHandler_js_1.runElicitationHooks)(serverName_1, elicitation, signal)];
                                                case 1:
                                                    hookResponse = _g.sent();
                                                    if (hookResponse) {
                                                        (0, log_js_1.logMCPDebug)(serverName_1, "URL elicitation ".concat(elicitationId, " resolved by hook: ").concat((0, slowOperations_js_1.jsonStringify)(hookResponse)));
                                                        if (hookResponse.action !== 'accept') {
                                                            return [2 /*return*/, { value: {
                                                                        content: "URL elicitation was ".concat(hookResponse.action === 'decline' ? 'declined' : hookResponse.action + 'ed', " by a hook. The tool \"").concat(tool, "\" could not complete because it requires the user to open a URL."),
                                                                    } }];
                                                        }
                                                        return [2 /*return*/, "continue"];
                                                    }
                                                    userResult = void 0;
                                                    if (!handleElicitation) return [3 /*break*/, 3];
                                                    return [4 /*yield*/, handleElicitation(serverName_1, elicitation, signal)];
                                                case 2:
                                                    // Print/SDK mode: delegate to structuredIO which sends a control request
                                                    userResult = _g.sent();
                                                    return [3 /*break*/, 5];
                                                case 3:
                                                    waitingState_1 = {
                                                        actionLabel: 'Retry now',
                                                        showCancel: true,
                                                    };
                                                    return [4 /*yield*/, new Promise(function (resolve) {
                                                            var onAbort = function () {
                                                                void resolve({ action: 'cancel' });
                                                            };
                                                            if (signal.aborted) {
                                                                onAbort();
                                                                return;
                                                            }
                                                            signal.addEventListener('abort', onAbort, { once: true });
                                                            setAppState(function (prev) { return (__assign(__assign({}, prev), { elicitation: {
                                                                    queue: __spreadArray(__spreadArray([], prev.elicitation.queue, true), [
                                                                        {
                                                                            serverName: serverName_1,
                                                                            requestId: "error-elicit-".concat(elicitationId),
                                                                            params: elicitation,
                                                                            signal: signal,
                                                                            waitingState: waitingState_1,
                                                                            respond: function (result) {
                                                                                // Phase 1 consent: accept is a no-op (doesn't resolve retry Promise)
                                                                                if (result.action === 'accept') {
                                                                                    return;
                                                                                }
                                                                                // Decline or cancel: resolve the retry Promise
                                                                                signal.removeEventListener('abort', onAbort);
                                                                                void resolve(result);
                                                                            },
                                                                            onWaitingDismiss: function (action) {
                                                                                signal.removeEventListener('abort', onAbort);
                                                                                if (action === 'retry') {
                                                                                    void resolve({ action: 'accept' });
                                                                                }
                                                                                else {
                                                                                    void resolve({ action: 'cancel' });
                                                                                }
                                                                            },
                                                                        },
                                                                    ], false),
                                                                } })); });
                                                        })];
                                                case 4:
                                                    userResult = _g.sent();
                                                    _g.label = 5;
                                                case 5: return [4 /*yield*/, (0, elicitationHandler_js_1.runElicitationResultHooks)(serverName_1, userResult, signal, 'url', elicitationId)];
                                                case 6:
                                                    finalResult = _g.sent();
                                                    if (finalResult.action !== 'accept') {
                                                        (0, log_js_1.logMCPDebug)(serverName_1, "User ".concat(finalResult.action === 'decline' ? 'declined' : finalResult.action + 'ed', " URL elicitation ").concat(elicitationId));
                                                        return [2 /*return*/, { value: {
                                                                    content: "URL elicitation was ".concat(finalResult.action === 'decline' ? 'declined' : finalResult.action + 'ed', " by the user. The tool \"").concat(tool, "\" could not complete because it requires the user to open a URL."),
                                                                } }];
                                                    }
                                                    (0, log_js_1.logMCPDebug)(serverName_1, "Elicitation ".concat(elicitationId, " completed, retrying tool call"));
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _i = 0, elicitations_1 = elicitations;
                                    _f.label = 3;
                                case 3:
                                    if (!(_i < elicitations_1.length)) return [3 /*break*/, 6];
                                    elicitation = elicitations_1[_i];
                                    return [5 /*yield**/, _loop_2(elicitation)];
                                case 4:
                                    state_2 = _f.sent();
                                    if (typeof state_2 === "object")
                                        return [2 /*return*/, state_2];
                                    _f.label = 5;
                                case 5:
                                    _i++;
                                    return [3 /*break*/, 3];
                                case 6: return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 0;
                    _d.label = 1;
                case 1: return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1 = _d.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _d.label = 3;
                case 3:
                    attempt++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function callMCPTool(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var toolStartTime, progressInterval, timeoutMs_1, timeoutId_1, timeoutPromise, result, errorDetails, firstContent, elapsed, duration, codeIndexingTool, content, e_1, elapsed, errorCode, isSessionExpired, isConnectionClosedOnHttp;
        var _c = _b.client, client = _c.client, name = _c.name, config = _c.config, tool = _b.tool, args = _b.args, meta = _b.meta, signal = _b.signal, onProgress = _b.onProgress;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    toolStartTime = Date.now();
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, 7, 8]);
                    (0, log_js_1.logMCPDebug)(name, "Calling MCP tool: ".concat(tool));
                    // Set up progress logging for long-running tools (every 30 seconds)
                    progressInterval = setInterval(function (startTime, name, tool) {
                        var elapsed = Date.now() - startTime;
                        var elapsedSeconds = Math.floor(elapsed / 1000);
                        var duration = "".concat(elapsedSeconds, "s");
                        (0, log_js_1.logMCPDebug)(name, "Tool '".concat(tool, "' still running (").concat(duration, " elapsed)"));
                    }, 30000, // Log every 30 seconds
                    toolStartTime, name, tool);
                    timeoutMs_1 = getMcpToolTimeoutMs();
                    timeoutPromise = new Promise(function (_, reject) {
                        timeoutId_1 = setTimeout(function (reject, name, tool, timeoutMs) {
                            reject(new errors_js_1.TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS("MCP server \"".concat(name, "\" tool \"").concat(tool, "\" timed out after ").concat(Math.floor(timeoutMs / 1000), "s"), 'MCP tool timeout'));
                        }, timeoutMs_1, reject, name, tool, timeoutMs_1);
                    });
                    return [4 /*yield*/, Promise.race([
                            client.callTool({
                                name: tool,
                                arguments: args,
                                _meta: meta,
                            }, types_js_1.CallToolResultSchema, {
                                signal: signal,
                                timeout: timeoutMs_1,
                                onprogress: onProgress
                                    ? function (sdkProgress) {
                                        onProgress({
                                            type: 'mcp_progress',
                                            status: 'progress',
                                            serverName: name,
                                            toolName: tool,
                                            progress: sdkProgress.progress,
                                            total: sdkProgress.total,
                                            progressMessage: sdkProgress.message,
                                        });
                                    }
                                    : undefined,
                            }),
                            timeoutPromise,
                        ]).finally(function () {
                            if (timeoutId_1) {
                                clearTimeout(timeoutId_1);
                            }
                        })];
                case 2:
                    result = _d.sent();
                    if ('isError' in result && result.isError) {
                        errorDetails = 'Unknown error';
                        if ('content' in result &&
                            Array.isArray(result.content) &&
                            result.content.length > 0) {
                            firstContent = result.content[0];
                            if (firstContent &&
                                typeof firstContent === 'object' &&
                                'text' in firstContent) {
                                errorDetails = firstContent.text;
                            }
                        }
                        else if ('error' in result) {
                            // Fallback for legacy error format
                            errorDetails = String(result.error);
                        }
                        (0, log_js_1.logMCPError)(name, errorDetails);
                        throw new McpToolCallError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS(errorDetails, 'MCP tool returned error', '_meta' in result && result._meta ? { _meta: result._meta } : undefined);
                    }
                    elapsed = Date.now() - toolStartTime;
                    duration = elapsed < 1000
                        ? "".concat(elapsed, "ms")
                        : elapsed < 60000
                            ? "".concat(Math.floor(elapsed / 1000), "s")
                            : "".concat(Math.floor(elapsed / 60000), "m ").concat(Math.floor((elapsed % 60000) / 1000), "s");
                    (0, log_js_1.logMCPDebug)(name, "Tool '".concat(tool, "' completed successfully in ").concat(duration));
                    codeIndexingTool = (0, codeIndexing_js_1.detectCodeIndexingFromMcpServerName)(name);
                    if (codeIndexingTool) {
                        (0, index_js_2.logEvent)('tengu_code_indexing_tool_used', {
                            tool: codeIndexingTool,
                            source: 'mcp',
                            success: true,
                        });
                    }
                    return [4 /*yield*/, processMCPResult(result, tool, name)];
                case 3:
                    content = _d.sent();
                    return [2 /*return*/, {
                            content: content,
                            _meta: result._meta,
                            structuredContent: result.structuredContent,
                        }];
                case 4:
                    e_1 = _d.sent();
                    // Clear intervals on error
                    if (progressInterval !== undefined) {
                        clearInterval(progressInterval);
                    }
                    elapsed = Date.now() - toolStartTime;
                    if (e_1 instanceof Error && e_1.name !== 'AbortError') {
                        (0, log_js_1.logMCPDebug)(name, "Tool '".concat(tool, "' failed after ").concat(Math.floor(elapsed / 1000), "s: ").concat(e_1.message));
                    }
                    if (!(e_1 instanceof Error)) return [3 /*break*/, 6];
                    errorCode = 'code' in e_1 ? e_1.code : undefined;
                    if (errorCode === 401 || e_1 instanceof auth_js_2.UnauthorizedError) {
                        (0, log_js_1.logMCPDebug)(name, "Tool call returned 401 Unauthorized - token may have expired");
                        (0, index_js_2.logEvent)('tengu_mcp_tool_call_auth_error', {});
                        throw new McpAuthError(name, "MCP server \"".concat(name, "\" requires re-authorization (token expired)"));
                    }
                    isSessionExpired = isMcpSessionExpiredError(e_1);
                    isConnectionClosedOnHttp = 'code' in e_1 &&
                        e_1.code === -32000 &&
                        e_1.message.includes('Connection closed') &&
                        (config.type === 'http' || config.type === 'claudeai-proxy');
                    if (!(isSessionExpired || isConnectionClosedOnHttp)) return [3 /*break*/, 6];
                    (0, log_js_1.logMCPDebug)(name, "MCP session expired during tool call (".concat(isSessionExpired ? '404/-32001' : 'connection closed', "), clearing connection cache for re-initialization"));
                    (0, index_js_2.logEvent)('tengu_mcp_session_expired', {});
                    return [4 /*yield*/, clearServerCache(name, config)];
                case 5:
                    _d.sent();
                    throw new McpSessionExpiredError(name);
                case 6:
                    // When the users hits esc, avoid logspew
                    if (!(e_1 instanceof Error) || e_1.name !== 'AbortError') {
                        throw e_1;
                    }
                    return [2 /*return*/, { content: undefined }];
                case 7:
                    // Always clear intervals
                    if (progressInterval !== undefined) {
                        clearInterval(progressInterval);
                    }
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function extractToolUseId(message) {
    var _a;
    if (((_a = message.message.content[0]) === null || _a === void 0 ? void 0 : _a.type) !== 'tool_use') {
        return undefined;
    }
    return message.message.content[0].id;
}
/**
 * Sets up SDK MCP clients by creating transports and connecting them.
 * This is used for SDK MCP servers that run in the same process as the SDK.
 *
 * @param sdkMcpConfigs - The SDK MCP server configurations
 * @param sendMcpMessage - Callback to send MCP messages through the control channel
 * @returns Connected clients, their tools, and transport map for message routing
 */
function setupSdkMcpClients(sdkMcpConfigs, sendMcpMessage) {
    return __awaiter(this, void 0, void 0, function () {
        var clients, tools, results, _i, results_1, result;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clients = [];
                    tools = [];
                    return [4 /*yield*/, Promise.allSettled(Object.entries(sdkMcpConfigs).map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var transport, client, capabilities, connectedClient, serverTools, sdkTools, error_15;
                            var _this = this;
                            var _c;
                            var name = _b[0], config = _b[1];
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        transport = new SdkControlTransport_js_1.SdkControlClientTransport(name, sendMcpMessage);
                                        client = new index_js_1.Client({
                                            name: 'claude-code',
                                            title: 'Claude Code',
                                            version: (_c = MACRO.VERSION) !== null && _c !== void 0 ? _c : 'unknown',
                                            description: "Anthropic's agentic coding tool",
                                            websiteUrl: product_js_1.PRODUCT_URL,
                                        }, {
                                            capabilities: {},
                                        });
                                        _d.label = 1;
                                    case 1:
                                        _d.trys.push([1, 5, , 6]);
                                        // Connect the client
                                        return [4 /*yield*/, client.connect(transport)
                                            // Get capabilities from the server
                                        ];
                                    case 2:
                                        // Connect the client
                                        _d.sent();
                                        capabilities = client.getServerCapabilities();
                                        connectedClient = {
                                            type: 'connected',
                                            name: name,
                                            capabilities: capabilities || {},
                                            client: client,
                                            config: __assign(__assign({}, config), { scope: 'dynamic' }),
                                            cleanup: function () { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, client.close()];
                                                        case 1:
                                                            _a.sent();
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); },
                                        };
                                        serverTools = [];
                                        if (!(capabilities === null || capabilities === void 0 ? void 0 : capabilities.tools)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, (0, exports.fetchToolsForClient)(connectedClient)];
                                    case 3:
                                        sdkTools = _d.sent();
                                        serverTools.push.apply(serverTools, sdkTools);
                                        _d.label = 4;
                                    case 4: return [2 /*return*/, {
                                            client: connectedClient,
                                            tools: serverTools,
                                        }];
                                    case 5:
                                        error_15 = _d.sent();
                                        // If connection fails, return failed server
                                        (0, log_js_1.logMCPError)(name, "Failed to connect SDK MCP server: ".concat(error_15));
                                        return [2 /*return*/, {
                                                client: {
                                                    type: 'failed',
                                                    name: name,
                                                    config: __assign(__assign({}, config), { scope: 'user' }),
                                                },
                                                tools: [],
                                            }];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); }))
                        // Process results and collect clients and tools
                    ];
                case 1:
                    results = _a.sent();
                    // Process results and collect clients and tools
                    for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                        result = results_1[_i];
                        if (result.status === 'fulfilled') {
                            clients.push(result.value.client);
                            tools.push.apply(tools, result.value.tools);
                        }
                        // If rejected (unexpected), the error was already logged inside the promise
                    }
                    return [2 /*return*/, { clients: clients, tools: tools }];
            }
        });
    });
}
