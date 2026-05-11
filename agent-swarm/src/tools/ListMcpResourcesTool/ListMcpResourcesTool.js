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
exports.ListMcpResourcesTool = void 0;
var v4_1 = require("zod/v4");
var client_js_1 = require("../../services/mcp/client.js");
var Tool_js_1 = require("../../Tool.js");
var errors_js_1 = require("../../utils/errors.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var log_js_1 = require("../../utils/log.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var terminal_js_1 = require("../../utils/terminal.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        server: v4_1.z
            .string()
            .optional()
            .describe('Optional server name to filter resources by'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.array(v4_1.z.object({
        uri: v4_1.z.string().describe('Resource URI'),
        name: v4_1.z.string().describe('Resource name'),
        mimeType: v4_1.z.string().optional().describe('MIME type of the resource'),
        description: v4_1.z.string().optional().describe('Resource description'),
        server: v4_1.z.string().describe('Server that provides this resource'),
    }));
});
exports.ListMcpResourcesTool = (0, Tool_js_1.buildTool)({
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return true;
    },
    toAutoClassifierInput: function (input) {
        var _a;
        return (_a = input.server) !== null && _a !== void 0 ? _a : '';
    },
    shouldDefer: true,
    name: prompt_js_1.LIST_MCP_RESOURCES_TOOL_NAME,
    searchHint: 'list resources from connected MCP servers',
    maxResultSizeChars: 100000,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.DESCRIPTION];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.PROMPT];
            });
        });
    },
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    call: function (input_1, _a) {
        return __awaiter(this, arguments, void 0, function (input, _b) {
            var targetServer, clientsToProcess, results;
            var _this = this;
            var mcpClients = _b.options.mcpClients;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        targetServer = input.server;
                        clientsToProcess = targetServer
                            ? mcpClients.filter(function (client) { return client.name === targetServer; })
                            : mcpClients;
                        if (targetServer && clientsToProcess.length === 0) {
                            throw new Error("Server \"".concat(targetServer, "\" not found. Available servers: ").concat(mcpClients.map(function (c) { return c.name; }).join(', ')));
                        }
                        return [4 /*yield*/, Promise.all(clientsToProcess.map(function (client) { return __awaiter(_this, void 0, void 0, function () {
                                var fresh, error_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (client.type !== 'connected')
                                                return [2 /*return*/, []];
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 4, , 5]);
                                            return [4 /*yield*/, (0, client_js_1.ensureConnectedClient)(client)];
                                        case 2:
                                            fresh = _a.sent();
                                            return [4 /*yield*/, (0, client_js_1.fetchResourcesForClient)(fresh)];
                                        case 3: return [2 /*return*/, _a.sent()];
                                        case 4:
                                            error_1 = _a.sent();
                                            // One server's reconnect failure shouldn't sink the whole result.
                                            (0, log_js_1.logMCPError)(client.name, (0, errors_js_1.errorMessage)(error_1));
                                            return [2 /*return*/, []];
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        results = _c.sent();
                        return [2 /*return*/, {
                                data: results.flat(),
                            }];
                }
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    userFacingName: function () { return 'listMcpResources'; },
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    isResultTruncated: function (output) {
        return (0, terminal_js_1.isOutputLineTruncated)((0, slowOperations_js_1.jsonStringify)(output));
    },
    mapToolResultToToolResultBlockParam: function (content, toolUseID) {
        if (!content || content.length === 0) {
            return {
                tool_use_id: toolUseID,
                type: 'tool_result',
                content: 'No resources found. MCP servers may still provide tools even if they have no resources.',
            };
        }
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: (0, slowOperations_js_1.jsonStringify)(content),
        };
    },
});
