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
exports.startMCPServer = startMCPServer;
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var AppStateStore_js_1 = require("src/state/AppStateStore.js");
var review_js_1 = require("../commands/review.js");
var Tool_js_1 = require("../Tool.js");
var tools_js_1 = require("../tools.js");
var abortController_js_1 = require("../utils/abortController.js");
var fileStateCache_js_1 = require("../utils/fileStateCache.js");
var log_js_1 = require("../utils/log.js");
var messages_js_1 = require("../utils/messages.js");
var model_js_1 = require("../utils/model/model.js");
var permissions_js_1 = require("../utils/permissions/permissions.js");
var Shell_js_1 = require("../utils/Shell.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var toolErrors_js_1 = require("../utils/toolErrors.js");
var zodToJsonSchema_js_1 = require("../utils/zodToJsonSchema.js");
var MCP_COMMANDS = [review_js_1.default];
function startMCPServer(cwd, debug, verbose) {
    return __awaiter(this, void 0, void 0, function () {
        function runServer() {
            return __awaiter(this, void 0, void 0, function () {
                var transport;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            transport = new stdio_js_1.StdioServerTransport();
                            return [4 /*yield*/, server.connect(transport)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        var READ_FILE_STATE_CACHE_SIZE, readFileStateCache, server;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    READ_FILE_STATE_CACHE_SIZE = 100;
                    readFileStateCache = (0, fileStateCache_js_1.createFileStateCacheWithSizeLimit)(READ_FILE_STATE_CACHE_SIZE);
                    (0, Shell_js_1.setCwd)(cwd);
                    server = new index_js_1.Server({
                        name: 'claude/tengu',
                        version: MACRO.VERSION,
                    }, {
                        capabilities: {
                            tools: {},
                        },
                    });
                    server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(_this, void 0, void 0, function () {
                        var toolPermissionContext, tools;
                        var _a;
                        var _this = this;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    toolPermissionContext = (0, Tool_js_1.getEmptyToolPermissionContext)();
                                    tools = (0, tools_js_1.getTools)(toolPermissionContext);
                                    _a = {};
                                    return [4 /*yield*/, Promise.all(tools.map(function (tool) { return __awaiter(_this, void 0, void 0, function () {
                                            var outputSchema, convertedSchema, _a;
                                            var _b;
                                            var _this = this;
                                            return __generator(this, function (_c) {
                                                switch (_c.label) {
                                                    case 0:
                                                        if (tool.outputSchema) {
                                                            convertedSchema = (0, zodToJsonSchema_js_1.zodToJsonSchema)(tool.outputSchema);
                                                            // MCP SDK requires outputSchema to have type: "object" at root level
                                                            // Skip schemas with anyOf/oneOf at root (from z.union, z.discriminatedUnion, etc.)
                                                            // See: https://github.com/anthropics/claude-code/issues/8014
                                                            if (typeof convertedSchema === 'object' &&
                                                                convertedSchema !== null &&
                                                                'type' in convertedSchema &&
                                                                convertedSchema.type === 'object') {
                                                                outputSchema = convertedSchema;
                                                            }
                                                        }
                                                        _a = [__assign({}, tool)];
                                                        _b = {};
                                                        return [4 /*yield*/, tool.prompt({
                                                                getToolPermissionContext: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                                                    return [2 /*return*/, toolPermissionContext];
                                                                }); }); },
                                                                tools: tools,
                                                                agents: [],
                                                            })];
                                                    case 1: return [2 /*return*/, __assign.apply(void 0, _a.concat([(_b.description = _c.sent(), _b.inputSchema = (0, zodToJsonSchema_js_1.zodToJsonSchema)(tool.inputSchema), _b.outputSchema = outputSchema, _b)]))];
                                                }
                                            });
                                        }); }))];
                                case 1: return [2 /*return*/, (_a.tools = _b.sent(),
                                        _a)];
                            }
                        });
                    }); });
                    server.setRequestHandler(types_js_1.CallToolRequestSchema, function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                        var toolPermissionContext, tools, tool, toolUseContext, validationResult, finalResult, error_1, parts, errorText;
                        var _c, _d;
                        var _e = _b.params, name = _e.name, args = _e.arguments;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    toolPermissionContext = (0, Tool_js_1.getEmptyToolPermissionContext)();
                                    tools = (0, tools_js_1.getTools)(toolPermissionContext);
                                    tool = (0, Tool_js_1.findToolByName)(tools, name);
                                    if (!tool) {
                                        throw new Error("Tool ".concat(name, " not found"));
                                    }
                                    toolUseContext = {
                                        abortController: (0, abortController_js_1.createAbortController)(),
                                        options: {
                                            commands: MCP_COMMANDS,
                                            tools: tools,
                                            mainLoopModel: (0, model_js_1.getMainLoopModel)(),
                                            thinkingConfig: { type: 'disabled' },
                                            mcpClients: [],
                                            mcpResources: {},
                                            isNonInteractiveSession: true,
                                            debug: debug,
                                            verbose: verbose,
                                            agentDefinitions: { activeAgents: [], allAgents: [] },
                                        },
                                        getAppState: function () { return (0, AppStateStore_js_1.getDefaultAppState)(); },
                                        setAppState: function () { },
                                        messages: [],
                                        readFileState: readFileStateCache,
                                        setInProgressToolUseIDs: function () { },
                                        setResponseLength: function () { },
                                        updateFileHistoryState: function () { },
                                        updateAttributionState: function () { },
                                    };
                                    _f.label = 1;
                                case 1:
                                    _f.trys.push([1, 4, , 5]);
                                    if (!tool.isEnabled()) {
                                        throw new Error("Tool ".concat(name, " is not enabled"));
                                    }
                                    return [4 /*yield*/, ((_c = tool.validateInput) === null || _c === void 0 ? void 0 : _c.call(tool, (_d = args) !== null && _d !== void 0 ? _d : {}, toolUseContext))];
                                case 2:
                                    validationResult = _f.sent();
                                    if (validationResult && !validationResult.result) {
                                        throw new Error("Tool ".concat(name, " input is invalid: ").concat(validationResult.message));
                                    }
                                    return [4 /*yield*/, tool.call((args !== null && args !== void 0 ? args : {}), toolUseContext, permissions_js_1.hasPermissionsToUseTool, (0, messages_js_1.createAssistantMessage)({
                                            content: [],
                                        }))];
                                case 3:
                                    finalResult = _f.sent();
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: 'text',
                                                    text: typeof finalResult === 'string'
                                                        ? finalResult
                                                        : (0, slowOperations_js_1.jsonStringify)(finalResult.data),
                                                },
                                            ],
                                        }];
                                case 4:
                                    error_1 = _f.sent();
                                    (0, log_js_1.logError)(error_1);
                                    parts = error_1 instanceof Error ? (0, toolErrors_js_1.getErrorParts)(error_1) : [String(error_1)];
                                    errorText = parts.filter(Boolean).join('\n').trim() || 'Error';
                                    return [2 /*return*/, {
                                            isError: true,
                                            content: [
                                                {
                                                    type: 'text',
                                                    text: errorText,
                                                },
                                            ],
                                        }];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, runServer()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
