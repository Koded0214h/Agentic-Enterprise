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
exports.createComputerUseMcpServerForCli = createComputerUseMcpServerForCli;
exports.runComputerUseMcpServer = runComputerUseMcpServer;
// import {
//   buildComputerUseTools,
//   createComputerUseMcpServer,
// } from '@ant/computer-use-mcp'
var buildComputerUseTools = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return [];
};
var createComputerUseMcpServer = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return ({
        setRequestHandler: function (schema, handler) { },
        connect: function (transport) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); },
    });
};
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var os_1 = require("os");
var datadog_js_1 = require("../../services/analytics/datadog.js");
var firstPartyEventLogger_js_1 = require("../../services/analytics/firstPartyEventLogger.js");
var sink_js_1 = require("../../services/analytics/sink.js");
var config_js_1 = require("../config.js");
var debug_js_1 = require("../debug.js");
var appNames_js_1 = require("./appNames.js");
var gates_js_1 = require("./gates.js");
var hostAdapter_js_1 = require("./hostAdapter.js");
var APP_ENUM_TIMEOUT_MS = 1000;
/**
 * Enumerate installed apps, timed. Fails soft — if Spotlight is slow or
 * claude-swift throws, the tool description just omits the list. Resolution
 * happens at call time regardless; the model just doesn't get hints.
 */
function tryGetInstalledAppNames() {
    return __awaiter(this, void 0, void 0, function () {
        var adapter, enumP, timer, timeoutP, installed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    adapter = (0, hostAdapter_js_1.getComputerUseHostAdapter)();
                    enumP = adapter.executor.listInstalledApps();
                    timeoutP = new Promise(function (resolve) {
                        timer = setTimeout(resolve, APP_ENUM_TIMEOUT_MS, undefined);
                    });
                    return [4 /*yield*/, Promise.race([enumP, timeoutP])
                            .catch(function () { return undefined; })
                            .finally(function () { return clearTimeout(timer); })];
                case 1:
                    installed = _a.sent();
                    if (!installed) {
                        // The enumeration continues in the background — swallow late rejections.
                        void enumP.catch(function () { });
                        (0, debug_js_1.logForDebugging)("[Computer Use MCP] app enumeration exceeded ".concat(APP_ENUM_TIMEOUT_MS, "ms or failed; tool description omits list"));
                        return [2 /*return*/, undefined];
                    }
                    return [2 /*return*/, (0, appNames_js_1.filterAppsForDescription)(installed, (0, os_1.homedir)())];
            }
        });
    });
}
/**
 * Construct the in-process server. Delegates to the package's
 * `createComputerUseMcpServer` for the Server object + stub CallTool handler,
 * then REPLACES the ListTools handler with one that includes installed-app
 * names in the `request_access` description (the package's factory doesn't
 * take `installedAppNames`, and Cowork builds its own tool array in
 * serverDef.ts for the same reason).
 *
 * Async so the 1s app-enumeration timeout doesn't block startup — called from
 * an `await import()` in `client.ts` on first CU connection, not `main.tsx`.
 *
 * Real dispatch still goes through `wrapper.tsx`'s `.call()` override; this
 * server exists only to answer ListTools.
 */
function createComputerUseMcpServerForCli() {
    return __awaiter(this, void 0, void 0, function () {
        var adapter, coordinateMode, server, installedAppNames, tools;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    adapter = (0, hostAdapter_js_1.getComputerUseHostAdapter)();
                    coordinateMode = (0, gates_js_1.getChicagoCoordinateMode)();
                    server = createComputerUseMcpServer(adapter, coordinateMode);
                    return [4 /*yield*/, tryGetInstalledAppNames()];
                case 1:
                    installedAppNames = _a.sent();
                    tools = buildComputerUseTools(adapter.executor.capabilities, coordinateMode, installedAppNames);
                    server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, adapter.isDisabled() ? { tools: [] } : { tools: tools }];
                    }); }); });
                    return [2 /*return*/, server];
            }
        });
    });
}
/**
 * Subprocess entrypoint for `--computer-use-mcp`. Mirror of
 * `runClaudeInChromeMcpServer` — stdio transport, exit on stdin close,
 * flush analytics before exit.
 */
function runComputerUseMcpServer() {
    return __awaiter(this, void 0, void 0, function () {
        var server, transport, exiting, shutdownAndExit;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, config_js_1.enableConfigs)();
                    (0, sink_js_1.initializeAnalyticsSink)();
                    return [4 /*yield*/, createComputerUseMcpServerForCli()];
                case 1:
                    server = _a.sent();
                    transport = new stdio_js_1.StdioServerTransport();
                    exiting = false;
                    shutdownAndExit = function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (exiting)
                                        return [2 /*return*/];
                                    exiting = true;
                                    return [4 /*yield*/, Promise.all([(0, firstPartyEventLogger_js_1.shutdown1PEventLogging)(), (0, datadog_js_1.shutdownDatadog)()])
                                        // eslint-disable-next-line custom-rules/no-process-exit
                                    ];
                                case 1:
                                    _a.sent();
                                    // eslint-disable-next-line custom-rules/no-process-exit
                                    process.exit(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    process.stdin.on('end', function () { return void shutdownAndExit(); });
                    process.stdin.on('error', function () { return void shutdownAndExit(); });
                    (0, debug_js_1.logForDebugging)('[Computer Use MCP] Starting MCP server');
                    return [4 /*yield*/, server.connect(transport)];
                case 2:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)('[Computer Use MCP] MCP server started');
                    return [2 /*return*/];
            }
        });
    });
}
