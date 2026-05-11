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
exports.createChromeContext = createChromeContext;
exports.runClaudeInChromeMcpServer = runClaudeInChromeMcpServer;
var createClaudeForChromeMcpServer = function (ctx) { return ({
    setRequestHandler: function () { },
    connect: function (transport) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); }); },
}); };
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var util_1 = require("util");
var datadog_js_1 = require("../../services/analytics/datadog.js");
var firstPartyEventLogger_js_1 = require("../../services/analytics/firstPartyEventLogger.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/analytics/index.js");
var sink_js_1 = require("../../services/analytics/sink.js");
var auth_js_1 = require("../auth.js");
var config_js_1 = require("../config.js");
var debug_js_1 = require("../debug.js");
var envUtils_js_1 = require("../envUtils.js");
var sideQuery_js_1 = require("../sideQuery.js");
var common_js_1 = require("./common.js");
var EXTENSION_DOWNLOAD_URL = 'https://claude.ai/chrome';
var BUG_REPORT_URL = 'https://github.com/anthropics/claude-code/issues/new?labels=bug,claude-in-chrome';
// String metadata keys safe to forward to analytics. Keys like error_message
// are excluded because they could contain page content or user data.
var SAFE_BRIDGE_STRING_KEYS = new Set([
    'bridge_status',
    'error_type',
    'tool_name',
]);
var PERMISSION_MODES = [
    'ask',
    'skip_all_permission_checks',
    'follow_a_plan',
];
function isPermissionMode(raw) {
    return PERMISSION_MODES.some(function (m) { return m === raw; });
}
/**
 * Resolves the Chrome bridge URL based on environment and feature flag.
 * Bridge is used when the feature flag is enabled; ant users always get
 * bridge. API key / 3P users fall back to native messaging.
 */
function getChromeBridgeUrl() {
    var bridgeEnabled = process.env.USER_TYPE === 'ant' ||
        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_copper_bridge', false);
    if (!bridgeEnabled) {
        return undefined;
    }
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.USE_LOCAL_OAUTH) ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.LOCAL_BRIDGE)) {
        return 'ws://localhost:8765';
    }
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.USE_STAGING_OAUTH)) {
        return 'wss://bridge-staging.claudeusercontent.com';
    }
    return 'wss://bridge.claudeusercontent.com';
}
function isLocalBridge() {
    return ((0, envUtils_js_1.isEnvTruthy)(process.env.USE_LOCAL_OAUTH) ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.LOCAL_BRIDGE));
}
/**
 * Build the ClaudeForChromeContext used by both the subprocess MCP server
 * and the in-process path in the MCP client.
 */
function createChromeContext(env) {
    var _this = this;
    var _a;
    var logger = new DebugLogger();
    var chromeBridgeUrl = getChromeBridgeUrl();
    logger.info("Bridge URL: ".concat(chromeBridgeUrl !== null && chromeBridgeUrl !== void 0 ? chromeBridgeUrl : 'none (using native socket)'));
    var rawPermissionMode = (_a = env === null || env === void 0 ? void 0 : env.CLAUDE_CHROME_PERMISSION_MODE) !== null && _a !== void 0 ? _a : process.env.CLAUDE_CHROME_PERMISSION_MODE;
    var initialPermissionMode;
    if (rawPermissionMode) {
        if (isPermissionMode(rawPermissionMode)) {
            initialPermissionMode = rawPermissionMode;
        }
        else {
            logger.warn("Invalid CLAUDE_CHROME_PERMISSION_MODE \"".concat(rawPermissionMode, "\". Valid values: ").concat(PERMISSION_MODES.join(', ')));
        }
    }
    return __assign(__assign(__assign(__assign({ serverName: 'Claude in Chrome', logger: logger, socketPath: (0, common_js_1.getSecureSocketPath)(), getSocketPaths: common_js_1.getAllSocketPaths, clientTypeId: 'claude-code', onAuthenticationError: function () {
            logger.warn('Authentication error occurred. Please ensure you are logged into the Claude browser extension with the same claude.ai account as Claude Code.');
        }, onToolCallDisconnected: function () {
            return "Browser extension is not connected. Please ensure the Claude browser extension is installed and running (".concat(EXTENSION_DOWNLOAD_URL, "), and that you are logged into claude.ai with the same account as Claude Code. If this is your first time connecting to Chrome, you may need to restart Chrome for the installation to take effect. If you continue to experience issues, please report a bug: ").concat(BUG_REPORT_URL);
        }, onExtensionPaired: function (deviceId, name) {
            (0, config_js_1.saveGlobalConfig)(function (config) {
                var _a, _b;
                if (((_a = config.chromeExtension) === null || _a === void 0 ? void 0 : _a.pairedDeviceId) === deviceId &&
                    ((_b = config.chromeExtension) === null || _b === void 0 ? void 0 : _b.pairedDeviceName) === name) {
                    return config;
                }
                return __assign(__assign({}, config), { chromeExtension: {
                        pairedDeviceId: deviceId,
                        pairedDeviceName: name,
                    } });
            });
            logger.info("Paired with \"".concat(name, "\" (").concat(deviceId.slice(0, 8), ")"));
        }, getPersistedDeviceId: function () {
            var _a;
            return (_a = (0, config_js_1.getGlobalConfig)().chromeExtension) === null || _a === void 0 ? void 0 : _a.pairedDeviceId;
        } }, (chromeBridgeUrl && {
        bridgeConfig: __assign({ url: chromeBridgeUrl, getUserId: function () { return __awaiter(_this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    return [2 /*return*/, (_a = (0, config_js_1.getGlobalConfig)().oauthAccount) === null || _a === void 0 ? void 0 : _a.accountUuid];
                });
            }); }, getOAuthToken: function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    return [2 /*return*/, (_b = (_a = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _a === void 0 ? void 0 : _a.accessToken) !== null && _b !== void 0 ? _b : ''];
                });
            }); } }, (isLocalBridge() && { devUserId: 'dev_user_local' })),
    })), (initialPermissionMode && { initialPermissionMode: initialPermissionMode })), (process.env.USER_TYPE === 'ant' && {
        callAnthropicMessages: function (req) { return __awaiter(_this, void 0, void 0, function () {
            var response, textBlocks, _i, _a, b;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, sideQuery_js_1.sideQuery)({
                            model: req.model,
                            system: req.system,
                            messages: req.messages,
                            max_tokens: req.max_tokens,
                            stop_sequences: req.stop_sequences,
                            signal: req.signal,
                            skipSystemPromptPrefix: true,
                            tools: [],
                            querySource: 'chrome_mcp',
                        })
                        // BetaContentBlock is TextBlock | ThinkingBlock | ToolUseBlock | ...
                        // Only text blocks carry the model's command output.
                    ];
                    case 1:
                        response = _b.sent();
                        textBlocks = [];
                        for (_i = 0, _a = response.content; _i < _a.length; _i++) {
                            b = _a[_i];
                            if (b.type === 'text') {
                                textBlocks.push({ type: 'text', text: b.text });
                            }
                        }
                        return [2 /*return*/, {
                                content: textBlocks,
                                stop_reason: response.stop_reason,
                                usage: {
                                    input_tokens: response.usage.input_tokens,
                                    output_tokens: response.usage.output_tokens,
                                },
                            }];
                }
            });
        }); },
    })), { trackEvent: function (eventName, metadata) {
            var safeMetadata = {};
            if (metadata) {
                for (var _i = 0, _a = Object.entries(metadata); _i < _a.length; _i++) {
                    var _b = _a[_i], key = _b[0], value = _b[1];
                    // Rename 'status' to 'bridge_status' to avoid Datadog's reserved field
                    var safeKey = key === 'status' ? 'bridge_status' : key;
                    if (typeof value === 'boolean' || typeof value === 'number') {
                        safeMetadata[safeKey] = value;
                    }
                    else if (typeof value === 'string' &&
                        SAFE_BRIDGE_STRING_KEYS.has(safeKey)) {
                        // Only forward allowlisted string keys — fields like error_message
                        // could contain page content or user data
                        safeMetadata[safeKey] =
                            value;
                    }
                }
            }
            (0, index_js_1.logEvent)(eventName, safeMetadata);
        } });
}
function runClaudeInChromeMcpServer() {
    return __awaiter(this, void 0, void 0, function () {
        var context, server, transport, exiting, shutdownAndExit;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, config_js_1.enableConfigs)();
                    (0, sink_js_1.initializeAnalyticsSink)();
                    context = createChromeContext();
                    server = createClaudeForChromeMcpServer(context);
                    transport = new stdio_js_1.StdioServerTransport();
                    exiting = false;
                    shutdownAndExit = function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (exiting) {
                                        return [2 /*return*/];
                                    }
                                    exiting = true;
                                    return [4 /*yield*/, (0, firstPartyEventLogger_js_1.shutdown1PEventLogging)()];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, (0, datadog_js_1.shutdownDatadog)()
                                        // eslint-disable-next-line custom-rules/no-process-exit
                                    ];
                                case 2:
                                    _a.sent();
                                    // eslint-disable-next-line custom-rules/no-process-exit
                                    process.exit(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    process.stdin.on('end', function () { return void shutdownAndExit(); });
                    process.stdin.on('error', function () { return void shutdownAndExit(); });
                    (0, debug_js_1.logForDebugging)('[Claude in Chrome] Starting MCP server');
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)('[Claude in Chrome] MCP server started');
                    return [2 /*return*/];
            }
        });
    });
}
var DebugLogger = /** @class */ (function () {
    function DebugLogger() {
    }
    DebugLogger.prototype.silly = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (0, debug_js_1.logForDebugging)(util_1.format.apply(void 0, __spreadArray([message], args, false)), { level: 'debug' });
    };
    DebugLogger.prototype.debug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (0, debug_js_1.logForDebugging)(util_1.format.apply(void 0, __spreadArray([message], args, false)), { level: 'debug' });
    };
    DebugLogger.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (0, debug_js_1.logForDebugging)(util_1.format.apply(void 0, __spreadArray([message], args, false)), { level: 'info' });
    };
    DebugLogger.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (0, debug_js_1.logForDebugging)(util_1.format.apply(void 0, __spreadArray([message], args, false)), { level: 'warn' });
    };
    DebugLogger.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (0, debug_js_1.logForDebugging)(util_1.format.apply(void 0, __spreadArray([message], args, false)), { level: 'error' });
    };
    return DebugLogger;
}());
