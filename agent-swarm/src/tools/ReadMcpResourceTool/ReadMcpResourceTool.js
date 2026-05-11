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
exports.ReadMcpResourceTool = exports.outputSchema = exports.inputSchema = void 0;
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var v4_1 = require("zod/v4");
var client_js_1 = require("../../services/mcp/client.js");
var Tool_js_1 = require("../../Tool.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var mcpOutputStorage_js_1 = require("../../utils/mcpOutputStorage.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var terminal_js_1 = require("../../utils/terminal.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
exports.inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        server: v4_1.z.string().describe('The MCP server name'),
        uri: v4_1.z.string().describe('The resource URI to read'),
    });
});
exports.outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        contents: v4_1.z.array(v4_1.z.object({
            uri: v4_1.z.string().describe('Resource URI'),
            mimeType: v4_1.z.string().optional().describe('MIME type of the content'),
            text: v4_1.z.string().optional().describe('Text content of the resource'),
            blobSavedTo: v4_1.z
                .string()
                .optional()
                .describe('Path where binary blob content was saved'),
        })),
    });
});
exports.ReadMcpResourceTool = (0, Tool_js_1.buildTool)({
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return true;
    },
    toAutoClassifierInput: function (input) {
        return "".concat(input.server, " ").concat(input.uri);
    },
    shouldDefer: true,
    name: 'ReadMcpResourceTool',
    searchHint: 'read a specific MCP resource by URI',
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
        return (0, exports.inputSchema)();
    },
    get outputSchema() {
        return (0, exports.outputSchema)();
    },
    call: function (input_1, _a) {
        return __awaiter(this, arguments, void 0, function (input, _b) {
            var serverName, uri, client, connectedClient, result, contents;
            var _this = this;
            var _c;
            var mcpClients = _b.options.mcpClients;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        serverName = input.server, uri = input.uri;
                        client = mcpClients.find(function (client) { return client.name === serverName; });
                        if (!client) {
                            throw new Error("Server \"".concat(serverName, "\" not found. Available servers: ").concat(mcpClients.map(function (c) { return c.name; }).join(', ')));
                        }
                        if (client.type !== 'connected') {
                            throw new Error("Server \"".concat(serverName, "\" is not connected"));
                        }
                        if (!((_c = client.capabilities) === null || _c === void 0 ? void 0 : _c.resources)) {
                            throw new Error("Server \"".concat(serverName, "\" does not support resources"));
                        }
                        return [4 /*yield*/, (0, client_js_1.ensureConnectedClient)(client)];
                    case 1:
                        connectedClient = _d.sent();
                        return [4 /*yield*/, connectedClient.client.request({
                                method: 'resources/read',
                                params: { uri: uri },
                            }, types_js_1.ReadResourceResultSchema)];
                    case 2:
                        result = (_d.sent());
                        return [4 /*yield*/, Promise.all(result.contents.map(function (c, i) { return __awaiter(_this, void 0, void 0, function () {
                                var persistId, persisted;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if ('text' in c) {
                                                return [2 /*return*/, { uri: c.uri, mimeType: c.mimeType, text: c.text }];
                                            }
                                            if (!('blob' in c) || typeof c.blob !== 'string') {
                                                return [2 /*return*/, { uri: c.uri, mimeType: c.mimeType }];
                                            }
                                            persistId = "mcp-resource-".concat(Date.now(), "-").concat(i, "-").concat(Math.random().toString(36).slice(2, 8));
                                            return [4 /*yield*/, (0, mcpOutputStorage_js_1.persistBinaryContent)(Buffer.from(c.blob, 'base64'), c.mimeType, persistId)];
                                        case 1:
                                            persisted = _a.sent();
                                            if ('error' in persisted) {
                                                return [2 /*return*/, {
                                                        uri: c.uri,
                                                        mimeType: c.mimeType,
                                                        text: "Binary content could not be saved to disk: ".concat(persisted.error),
                                                    }];
                                            }
                                            return [2 /*return*/, {
                                                    uri: c.uri,
                                                    mimeType: c.mimeType,
                                                    blobSavedTo: persisted.filepath,
                                                    text: (0, mcpOutputStorage_js_1.getBinaryBlobSavedMessage)(persisted.filepath, c.mimeType, persisted.size, "[Resource from ".concat(serverName, " at ").concat(c.uri, "] ")),
                                                }];
                                    }
                                });
                            }); }))];
                    case 3:
                        contents = _d.sent();
                        return [2 /*return*/, {
                                data: { contents: contents },
                            }];
                }
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    userFacingName: UI_js_1.userFacingName,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    isResultTruncated: function (output) {
        return (0, terminal_js_1.isOutputLineTruncated)((0, slowOperations_js_1.jsonStringify)(output));
    },
    mapToolResultToToolResultBlockParam: function (content, toolUseID) {
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: (0, slowOperations_js_1.jsonStringify)(content),
        };
    },
});
