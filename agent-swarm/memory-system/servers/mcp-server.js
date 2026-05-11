"use strict";
/**
 * Claude-mem MCP Search Server - Thin HTTP Wrapper
 *
 * Refactored from 2,718 lines to ~600-800 lines
 * Delegates all business logic to Worker HTTP API at localhost:37777
 * Maintains MCP protocol handling and tool schemas
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
var packageVersion = typeof __DEFAULT_PACKAGE_VERSION__ !== 'undefined' ? __DEFAULT_PACKAGE_VERSION__ : '0.0.0-dev';
// Import logger first
var logger_js_1 = require("../utils/logger.js");
// CRITICAL: Redirect console to stderr BEFORE other imports
// MCP uses stdio transport where stdout is reserved for JSON-RPC protocol messages.
// Any logs to stdout break the protocol (Claude Desktop parses "[2025..." as JSON array).
var _originalLog = console['log'];
console['log'] = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    logger_js_1.logger.error('CONSOLE', 'Intercepted console output (MCP protocol protection)', undefined, { args: args });
};
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var worker_utils_js_1 = require("../shared/worker-utils.js");
var search_js_1 = require("../services/smart-file-read/search.js");
var parser_js_1 = require("../services/smart-file-read/parser.js");
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
/**
 * Map tool names to Worker HTTP endpoints
 */
var TOOL_ENDPOINT_MAP = {
    'search': '/api/search',
    'timeline': '/api/timeline'
};
/**
 * Call Worker HTTP API endpoint (uses socket or TCP automatically)
 */
function callWorkerAPI(endpoint, params) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, _i, _a, _b, key, value, apiPath, response, errorText, data, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    logger_js_1.logger.debug('SYSTEM', '→ Worker API', undefined, { endpoint: endpoint, params: params });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    searchParams = new URLSearchParams();
                    // Convert params to query string
                    for (_i = 0, _a = Object.entries(params); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], value = _b[1];
                        if (value !== undefined && value !== null) {
                            searchParams.append(key, String(value));
                        }
                    }
                    apiPath = "".concat(endpoint, "?").concat(searchParams);
                    return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)(apiPath)];
                case 2:
                    response = _c.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.text()];
                case 3:
                    errorText = _c.sent();
                    throw new Error("Worker API error (".concat(response.status, "): ").concat(errorText));
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _c.sent();
                    logger_js_1.logger.debug('SYSTEM', '← Worker API success', undefined, { endpoint: endpoint });
                    // Worker returns { content: [...] } format directly
                    return [2 /*return*/, data];
                case 6:
                    error_1 = _c.sent();
                    logger_js_1.logger.error('SYSTEM', '← Worker API error', { endpoint: endpoint }, error_1);
                    return [2 /*return*/, {
                            content: [{
                                    type: 'text',
                                    text: "Error calling Worker API: ".concat(error_1 instanceof Error ? error_1.message : String(error_1))
                                }],
                            isError: true
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Call Worker HTTP API with POST body
 */
function callWorkerAPIPost(endpoint, body) {
    return __awaiter(this, void 0, void 0, function () {
        var response, errorText, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_js_1.logger.debug('HTTP', 'Worker API request (POST)', undefined, { endpoint: endpoint });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body)
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.text()];
                case 3:
                    errorText = _a.sent();
                    throw new Error("Worker API error (".concat(response.status, "): ").concat(errorText));
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    logger_js_1.logger.debug('HTTP', 'Worker API success (POST)', undefined, { endpoint: endpoint });
                    // Wrap raw data in MCP format
                    return [2 /*return*/, {
                            content: [{
                                    type: 'text',
                                    text: JSON.stringify(data, null, 2)
                                }]
                        }];
                case 6:
                    error_2 = _a.sent();
                    logger_js_1.logger.error('HTTP', 'Worker API error (POST)', { endpoint: endpoint }, error_2);
                    return [2 /*return*/, {
                            content: [{
                                    type: 'text',
                                    text: "Error calling Worker API: ".concat(error_2 instanceof Error ? error_2.message : String(error_2))
                                }],
                            isError: true
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Verify Worker is accessible
 */
function verifyWorkerConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)('/api/health')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.ok];
                case 2:
                    error_3 = _a.sent();
                    // Expected during worker startup or if worker is down
                    logger_js_1.logger.debug('SYSTEM', 'Worker health check failed', {}, error_3);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Tool definitions with HTTP-based handlers
 * Minimal descriptions - use help() tool with operation parameter for detailed docs
 */
var tools = [
    {
        name: '__IMPORTANT',
        description: "3-LAYER WORKFLOW (ALWAYS FOLLOW):\n1. search(query) \u2192 Get index with IDs (~50-100 tokens/result)\n2. timeline(anchor=ID) \u2192 Get context around interesting results\n3. get_observations([IDs]) \u2192 Fetch full details ONLY for filtered IDs\nNEVER fetch full details without filtering first. 10x token savings.",
        inputSchema: {
            type: 'object',
            properties: {}
        },
        handler: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ({
                        content: [{
                                type: 'text',
                                text: "# Memory Search Workflow\n\n**3-Layer Pattern (ALWAYS follow this):**\n\n1. **Search** - Get index of results with IDs\n   `search(query=\"...\", limit=20, project=\"...\")`\n   Returns: Table with IDs, titles, dates (~50-100 tokens/result)\n\n2. **Timeline** - Get context around interesting results\n   `timeline(anchor=<ID>, depth_before=3, depth_after=3)`\n   Returns: Chronological context showing what was happening\n\n3. **Fetch** - Get full details ONLY for relevant IDs\n   `get_observations(ids=[...])`  # ALWAYS batch for 2+ items\n   Returns: Complete details (~500-1000 tokens/result)\n\n**Why:** 10x token savings. Never fetch full details without filtering first."
                            }]
                    })];
            });
        }); }
    },
    {
        name: 'search',
        description: 'Step 1: Search memory. Returns index with IDs. Params: query, limit, project, type, obs_type, dateStart, dateEnd, offset, orderBy',
        inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: true
        },
        handler: function (args) { return __awaiter(void 0, void 0, void 0, function () {
            var endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = TOOL_ENDPOINT_MAP['search'];
                        return [4 /*yield*/, callWorkerAPI(endpoint, args)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); }
    },
    {
        name: 'timeline',
        description: 'Step 2: Get context around results. Params: anchor (observation ID) OR query (finds anchor automatically), depth_before, depth_after, project',
        inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: true
        },
        handler: function (args) { return __awaiter(void 0, void 0, void 0, function () {
            var endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = TOOL_ENDPOINT_MAP['timeline'];
                        return [4 /*yield*/, callWorkerAPI(endpoint, args)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); }
    },
    {
        name: 'get_observations',
        description: 'Step 3: Fetch full details for filtered IDs. Params: ids (array of observation IDs, required), orderBy, limit, project',
        inputSchema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Array of observation IDs to fetch (required)'
                }
            },
            required: ['ids'],
            additionalProperties: true
        },
        handler: function (args) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, callWorkerAPIPost('/api/observations/batch', args)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); }
    },
    {
        name: 'smart_search',
        description: 'Search codebase for symbols, functions, classes using tree-sitter AST parsing. Returns folded structural views with token counts. Use path parameter to scope the search.',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search term — matches against symbol names, file names, and file content'
                },
                path: {
                    type: 'string',
                    description: 'Root directory to search (default: current working directory)'
                },
                max_results: {
                    type: 'number',
                    description: 'Maximum results to return (default: 20)'
                },
                file_pattern: {
                    type: 'string',
                    description: 'Substring filter for file paths (e.g. ".ts", "src/services")'
                }
            },
            required: ['query']
        },
        handler: function (args) { return __awaiter(void 0, void 0, void 0, function () {
            var rootDir, result, formatted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rootDir = (0, node_path_1.resolve)(args.path || process.cwd());
                        return [4 /*yield*/, (0, search_js_1.searchCodebase)(rootDir, args.query, {
                                maxResults: args.max_results || 20,
                                filePattern: args.file_pattern
                            })];
                    case 1:
                        result = _a.sent();
                        formatted = (0, search_js_1.formatSearchResults)(result, args.query);
                        return [2 /*return*/, {
                                content: [{ type: 'text', text: formatted }]
                            }];
                }
            });
        }); }
    },
    {
        name: 'smart_unfold',
        description: 'Expand a specific symbol (function, class, method) from a file. Returns the full source code of just that symbol. Use after smart_search or smart_outline to read specific code.',
        inputSchema: {
            type: 'object',
            properties: {
                file_path: {
                    type: 'string',
                    description: 'Path to the source file'
                },
                symbol_name: {
                    type: 'string',
                    description: 'Name of the symbol to unfold (function, class, method, etc.)'
                }
            },
            required: ['file_path', 'symbol_name']
        },
        handler: function (args) { return __awaiter(void 0, void 0, void 0, function () {
            var filePath, content, unfolded, parsed, available;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filePath = (0, node_path_1.resolve)(args.file_path);
                        return [4 /*yield*/, (0, promises_1.readFile)(filePath, 'utf-8')];
                    case 1:
                        content = _a.sent();
                        unfolded = (0, parser_js_1.unfoldSymbol)(content, filePath, args.symbol_name);
                        if (unfolded) {
                            return [2 /*return*/, {
                                    content: [{ type: 'text', text: unfolded }]
                                }];
                        }
                        parsed = (0, parser_js_1.parseFile)(content, filePath);
                        if (parsed.symbols.length > 0) {
                            available = parsed.symbols.map(function (s) { return "  - ".concat(s.name, " (").concat(s.kind, ")"); }).join('\n');
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: "Symbol \"".concat(args.symbol_name, "\" not found in ").concat(args.file_path, ".\n\nAvailable symbols:\n").concat(available)
                                        }]
                                }];
                        }
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: "Could not parse ".concat(args.file_path, ". File may be unsupported or empty.")
                                    }]
                            }];
                }
            });
        }); }
    },
    {
        name: 'smart_outline',
        description: 'Get structural outline of a file — shows all symbols (functions, classes, methods, types) with signatures but bodies folded. Much cheaper than reading the full file.',
        inputSchema: {
            type: 'object',
            properties: {
                file_path: {
                    type: 'string',
                    description: 'Path to the source file'
                }
            },
            required: ['file_path']
        },
        handler: function (args) { return __awaiter(void 0, void 0, void 0, function () {
            var filePath, content, parsed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filePath = (0, node_path_1.resolve)(args.file_path);
                        return [4 /*yield*/, (0, promises_1.readFile)(filePath, 'utf-8')];
                    case 1:
                        content = _a.sent();
                        parsed = (0, parser_js_1.parseFile)(content, filePath);
                        if (parsed.symbols.length > 0) {
                            return [2 /*return*/, {
                                    content: [{ type: 'text', text: (0, parser_js_1.formatFoldedView)(parsed) }]
                                }];
                        }
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: "Could not parse ".concat(args.file_path, ". File may use an unsupported language or be empty.")
                                    }]
                            }];
                }
            });
        }); }
    }
];
// Create the MCP server
var server = new index_js_1.Server({
    name: 'claude-mem',
    version: packageVersion,
}, {
    capabilities: {
        tools: {}, // Exposes tools capability (handled by ListToolsRequestSchema and CallToolRequestSchema)
    },
});
// Register tools/list handler
server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, {
                tools: tools.map(function (tool) { return ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema
                }); })
            }];
    });
}); });
// Register tools/call handler
server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var tool, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tool = tools.find(function (t) { return t.name === request.params.name; });
                if (!tool) {
                    throw new Error("Unknown tool: ".concat(request.params.name));
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, tool.handler(request.params.arguments || {})];
            case 2: return [2 /*return*/, _a.sent()];
            case 3:
                error_4 = _a.sent();
                logger_js_1.logger.error('SYSTEM', 'Tool execution failed', { tool: request.params.name }, error_4);
                return [2 /*return*/, {
                        content: [{
                                type: 'text',
                                text: "Tool execution failed: ".concat(error_4 instanceof Error ? error_4.message : String(error_4))
                            }],
                        isError: true
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Parent heartbeat: self-exit when parent dies (ppid=1 on Unix means orphaned)
// Prevents orphaned MCP server processes when Claude Code exits unexpectedly
var HEARTBEAT_INTERVAL_MS = 30000;
var heartbeatTimer = null;
function startParentHeartbeat() {
    // ppid-based orphan detection only works on Unix
    if (process.platform === 'win32')
        return;
    var initialPpid = process.ppid;
    heartbeatTimer = setInterval(function () {
        if (process.ppid === 1 || process.ppid !== initialPpid) {
            logger_js_1.logger.info('SYSTEM', 'Parent process died, self-exiting to prevent orphan', {
                initialPpid: initialPpid,
                currentPpid: process.ppid
            });
            cleanup();
        }
    }, HEARTBEAT_INTERVAL_MS);
    // Don't let the heartbeat timer keep the process alive
    if (heartbeatTimer.unref)
        heartbeatTimer.unref();
}
// Cleanup function — synchronous to ensure consistent behavior whether called
// from signal handlers, heartbeat interval, or awaited in async context
function cleanup() {
    if (heartbeatTimer)
        clearInterval(heartbeatTimer);
    logger_js_1.logger.info('SYSTEM', 'MCP server shutting down');
    process.exit(0);
}
// Register cleanup handlers for graceful shutdown
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
// Start the server
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transport;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    logger_js_1.logger.info('SYSTEM', 'Claude-mem search server started');
                    // Start parent heartbeat to detect orphaned MCP servers
                    startParentHeartbeat();
                    // Check Worker availability in background
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        var workerAvailable;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, verifyWorkerConnection()];
                                case 1:
                                    workerAvailable = _a.sent();
                                    if (!workerAvailable) {
                                        logger_js_1.logger.error('SYSTEM', 'Worker not available', undefined, {});
                                        logger_js_1.logger.error('SYSTEM', 'Tools will fail until Worker is started');
                                        logger_js_1.logger.error('SYSTEM', 'Start Worker with: npm run worker:restart');
                                    }
                                    else {
                                        logger_js_1.logger.info('SYSTEM', 'Worker available', undefined, {});
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); }, 0);
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    logger_js_1.logger.error('SYSTEM', 'Fatal error', undefined, error);
    // Exit gracefully: Windows Terminal won't keep tab open on exit 0
    // The wrapper/plugin will handle restart logic if needed
    process.exit(0);
});
