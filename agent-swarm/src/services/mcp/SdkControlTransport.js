"use strict";
/**
 * SDK MCP Transport Bridge
 *
 * This file implements a transport bridge that allows MCP servers running in the SDK process
 * to communicate with the Claude Code CLI process through control messages.
 *
 * ## Architecture Overview
 *
 * Unlike regular MCP servers that run as separate processes, SDK MCP servers run in-process
 * within the SDK. This requires a special transport mechanism to bridge communication between:
 * - The CLI process (where the MCP client runs)
 * - The SDK process (where the SDK MCP server runs)
 *
 * ## Message Flow
 *
 * ### CLI → SDK (via SdkControlClientTransport)
 * 1. CLI's MCP Client calls a tool → sends JSONRPC request to SdkControlClientTransport
 * 2. Transport wraps the message in a control request with server_name and request_id
 * 3. Control request is sent via stdout to the SDK process
 * 4. SDK's StructuredIO receives the control response and routes it back to the transport
 * 5. Transport unwraps the response and returns it to the MCP Client
 *
 * ### SDK → CLI (via SdkControlServerTransport)
 * 1. Query receives control request with MCP message and calls transport.onmessage
 * 2. MCP server processes the message and calls transport.send() with response
 * 3. Transport calls sendMcpMessage callback with the response
 * 4. Query's callback resolves the pending promise with the response
 * 5. Query returns the response to complete the control request
 *
 * ## Key Design Points
 *
 * - SdkControlClientTransport: StructuredIO tracks pending requests
 * - SdkControlServerTransport: Query tracks pending requests
 * - The control request wrapper includes server_name to route to the correct SDK server
 * - The system supports multiple SDK MCP servers running simultaneously
 * - Message IDs are preserved through the entire flow for proper correlation
 */
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
exports.SdkControlServerTransport = exports.SdkControlClientTransport = void 0;
/**
 * CLI-side transport for SDK MCP servers.
 *
 * This transport is used in the CLI process to bridge communication between:
 * - The CLI's MCP Client (which wants to call tools on SDK MCP servers)
 * - The SDK process (where the actual MCP server runs)
 *
 * It converts MCP protocol messages into control requests that can be sent
 * through stdout/stdin to the SDK process.
 */
var SdkControlClientTransport = /** @class */ (function () {
    function SdkControlClientTransport(serverName, sendMcpMessage) {
        this.serverName = serverName;
        this.sendMcpMessage = sendMcpMessage;
        this.isClosed = false;
    }
    SdkControlClientTransport.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    SdkControlClientTransport.prototype.send = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isClosed) {
                            throw new Error('Transport is closed');
                        }
                        return [4 /*yield*/, this.sendMcpMessage(this.serverName, message)
                            // Pass the response back to the MCP client
                        ];
                    case 1:
                        response = _a.sent();
                        // Pass the response back to the MCP client
                        if (this.onmessage) {
                            this.onmessage(response);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SdkControlClientTransport.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                if (this.isClosed) {
                    return [2 /*return*/];
                }
                this.isClosed = true;
                (_a = this.onclose) === null || _a === void 0 ? void 0 : _a.call(this);
                return [2 /*return*/];
            });
        });
    };
    return SdkControlClientTransport;
}());
exports.SdkControlClientTransport = SdkControlClientTransport;
/**
 * SDK-side transport for SDK MCP servers.
 *
 * This transport is used in the SDK process to bridge communication between:
 * - Control requests coming from the CLI (via stdin)
 * - The actual MCP server running in the SDK process
 *
 * It acts as a simple pass-through that forwards messages to the MCP server
 * and sends responses back via a callback.
 *
 * Note: Query handles all request/response correlation and async flow.
 */
var SdkControlServerTransport = /** @class */ (function () {
    function SdkControlServerTransport(sendMcpMessage) {
        this.sendMcpMessage = sendMcpMessage;
        this.isClosed = false;
    }
    SdkControlServerTransport.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    SdkControlServerTransport.prototype.send = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isClosed) {
                    throw new Error('Transport is closed');
                }
                // Simply pass the response back through the callback
                this.sendMcpMessage(message);
                return [2 /*return*/];
            });
        });
    };
    SdkControlServerTransport.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                if (this.isClosed) {
                    return [2 /*return*/];
                }
                this.isClosed = true;
                (_a = this.onclose) === null || _a === void 0 ? void 0 : _a.call(this);
                return [2 /*return*/];
            });
        });
    };
    return SdkControlServerTransport;
}());
exports.SdkControlServerTransport = SdkControlServerTransport;
