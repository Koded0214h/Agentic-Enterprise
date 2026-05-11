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
exports.createLSPServerManager = createLSPServerManager;
var path = require("path");
var url_1 = require("url");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var config_js_1 = require("./config.js");
var LSPServerInstance_js_1 = require("./LSPServerInstance.js");
/**
 * Creates an LSP server manager instance.
 *
 * Manages multiple LSP server instances and routes requests based on file extensions.
 * Uses factory function pattern with closures for state encapsulation (avoiding classes).
 *
 * @returns LSP server manager instance
 *
 * @example
 * const manager = createLSPServerManager()
 * await manager.initialize()
 * const result = await manager.sendRequest('/path/to/file.ts', 'textDocument/definition', params)
 * await manager.shutdown()
 */
function createLSPServerManager() {
    // Private state managed via closures
    var servers = new Map();
    var extensionMap = new Map();
    // Track which files have been opened on which servers (URI -> server name)
    var openedFiles = new Map();
    /**
     * Initialize the manager by loading all configured LSP servers.
     *
     * @throws {Error} If configuration loading fails
     */
    function initialize() {
        return __awaiter(this, void 0, void 0, function () {
            var serverConfigs, result, error_1, err, _loop_1, _i, _a, _b, serverName, config;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, config_js_1.getAllLspServers)()];
                    case 1:
                        result = _c.sent();
                        serverConfigs = result.servers;
                        (0, debug_js_1.logForDebugging)("[LSP SERVER MANAGER] getAllLspServers returned ".concat(Object.keys(serverConfigs).length, " server(s)"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        err = error_1;
                        (0, log_js_1.logError)(new Error("Failed to load LSP server configuration: ".concat(err.message)));
                        throw error_1;
                    case 3:
                        _loop_1 = function (serverName, config) {
                            try {
                                // Validate config before using it
                                if (!config.command) {
                                    throw new Error("Server ".concat(serverName, " missing required 'command' field"));
                                }
                                if (!config.extensionToLanguage ||
                                    Object.keys(config.extensionToLanguage).length === 0) {
                                    throw new Error("Server ".concat(serverName, " missing required 'extensionToLanguage' field"));
                                }
                                // Map file extensions to this server (derive from extensionToLanguage)
                                var fileExtensions = Object.keys(config.extensionToLanguage);
                                for (var _d = 0, fileExtensions_1 = fileExtensions; _d < fileExtensions_1.length; _d++) {
                                    var ext = fileExtensions_1[_d];
                                    var normalized = ext.toLowerCase();
                                    if (!extensionMap.has(normalized)) {
                                        extensionMap.set(normalized, []);
                                    }
                                    var serverList = extensionMap.get(normalized);
                                    if (serverList) {
                                        serverList.push(serverName);
                                    }
                                }
                                // Create server instance
                                var instance = (0, LSPServerInstance_js_1.createLSPServerInstance)(serverName, config);
                                servers.set(serverName, instance);
                                // Register handler for workspace/configuration requests from the server
                                // Some servers (like TypeScript) send these even when we say we don't support them
                                instance.onRequest('workspace/configuration', function (params) {
                                    (0, debug_js_1.logForDebugging)("LSP: Received workspace/configuration request from ".concat(serverName));
                                    // Return empty/null config for each requested item
                                    // This satisfies the protocol without providing actual configuration
                                    return params.items.map(function () { return null; });
                                });
                            }
                            catch (error) {
                                var err = error;
                                (0, log_js_1.logError)(new Error("Failed to initialize LSP server ".concat(serverName, ": ").concat(err.message)));
                                // Continue with other servers - don't fail entire initialization
                            }
                        };
                        // Build extension → server mapping
                        for (_i = 0, _a = Object.entries(serverConfigs); _i < _a.length; _i++) {
                            _b = _a[_i], serverName = _b[0], config = _b[1];
                            _loop_1(serverName, config);
                        }
                        (0, debug_js_1.logForDebugging)("LSP manager initialized with ".concat(servers.size, " servers"));
                        return [2 /*return*/];
                }
            });
        });
    }
    /**
     * Shutdown all running servers and clear state.
     * Only servers in 'running' state are explicitly stopped;
     * servers in other states are cleared without shutdown.
     *
     * @throws {Error} If one or more servers fail to stop
     */
    function shutdown() {
        return __awaiter(this, void 0, void 0, function () {
            var toStop, results, errors, err;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        toStop = Array.from(servers.entries()).filter(function (_a) {
                            var s = _a[1];
                            return s.state === 'running' || s.state === 'error';
                        });
                        return [4 /*yield*/, Promise.allSettled(toStop.map(function (_a) {
                                var server = _a[1];
                                return server.stop();
                            }))];
                    case 1:
                        results = _a.sent();
                        servers.clear();
                        extensionMap.clear();
                        openedFiles.clear();
                        errors = results
                            .map(function (r, i) {
                            return r.status === 'rejected'
                                ? "".concat(toStop[i][0], ": ").concat((0, errors_js_1.errorMessage)(r.reason))
                                : null;
                        })
                            .filter(function (e) { return e !== null; });
                        if (errors.length > 0) {
                            err = new Error("Failed to stop ".concat(errors.length, " LSP server(s): ").concat(errors.join('; ')));
                            (0, log_js_1.logError)(err);
                            throw err;
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    /**
     * Get the LSP server instance for a given file path.
     * If multiple servers handle the same extension, returns the first registered server.
     * Returns undefined if no server handles this file type.
     */
    function getServerForFile(filePath) {
        var ext = path.extname(filePath).toLowerCase();
        var serverNames = extensionMap.get(ext);
        if (!serverNames || serverNames.length === 0) {
            return undefined;
        }
        // Use first server (can add priority later)
        var serverName = serverNames[0];
        if (!serverName) {
            return undefined;
        }
        return servers.get(serverName);
    }
    /**
     * Ensure the appropriate LSP server is started for the given file.
     * Returns undefined if no server handles this file type.
     *
     * @throws {Error} If server fails to start
     */
    function ensureServerStarted(filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var server, error_2, err;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        server = getServerForFile(filePath);
                        if (!server)
                            return [2 /*return*/, undefined];
                        if (!(server.state === 'stopped' || server.state === 'error')) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, server.start()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        err = error_2;
                        (0, log_js_1.logError)(new Error("Failed to start LSP server for file ".concat(filePath, ": ").concat(err.message)));
                        throw error_2;
                    case 4: return [2 /*return*/, server];
                }
            });
        });
    }
    /**
     * Send a request to the appropriate LSP server for the given file.
     * Returns undefined if no server handles this file type.
     *
     * @throws {Error} If server fails to start or request fails
     */
    function sendRequest(filePath, method, params) {
        return __awaiter(this, void 0, void 0, function () {
            var server, error_3, err;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ensureServerStarted(filePath)];
                    case 1:
                        server = _a.sent();
                        if (!server)
                            return [2 /*return*/, undefined];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, server.sendRequest(method, params)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_3 = _a.sent();
                        err = error_3;
                        (0, log_js_1.logError)(new Error("LSP request failed for file ".concat(filePath, ", method '").concat(method, "': ").concat(err.message)));
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    // Return public interface
    function getAllServers() {
        return servers;
    }
    function openFile(filePath, content) {
        return __awaiter(this, void 0, void 0, function () {
            var server, fileUri, ext, languageId, error_4, err;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ensureServerStarted(filePath)];
                    case 1:
                        server = _a.sent();
                        if (!server)
                            return [2 /*return*/];
                        fileUri = (0, url_1.pathToFileURL)(path.resolve(filePath)).href;
                        // Skip if already opened on this server
                        if (openedFiles.get(fileUri) === server.name) {
                            (0, debug_js_1.logForDebugging)("LSP: File already open, skipping didOpen for ".concat(filePath));
                            return [2 /*return*/];
                        }
                        ext = path.extname(filePath).toLowerCase();
                        languageId = server.config.extensionToLanguage[ext] || 'plaintext';
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, server.sendNotification('textDocument/didOpen', {
                                textDocument: {
                                    uri: fileUri,
                                    languageId: languageId,
                                    version: 1,
                                    text: content,
                                },
                            })
                            // Track that this file is now open on this server
                        ];
                    case 3:
                        _a.sent();
                        // Track that this file is now open on this server
                        openedFiles.set(fileUri, server.name);
                        (0, debug_js_1.logForDebugging)("LSP: Sent didOpen for ".concat(filePath, " (languageId: ").concat(languageId, ")"));
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        err = new Error("Failed to sync file open ".concat(filePath, ": ").concat((0, errors_js_1.errorMessage)(error_4)));
                        (0, log_js_1.logError)(err);
                        // Re-throw to propagate error to caller
                        throw err;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function changeFile(filePath, content) {
        return __awaiter(this, void 0, void 0, function () {
            var server, fileUri, error_5, err;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        server = getServerForFile(filePath);
                        if (!server || server.state !== 'running') {
                            return [2 /*return*/, openFile(filePath, content)];
                        }
                        fileUri = (0, url_1.pathToFileURL)(path.resolve(filePath)).href;
                        // If file hasn't been opened on this server yet, open it first
                        // LSP servers require didOpen before didChange
                        if (openedFiles.get(fileUri) !== server.name) {
                            return [2 /*return*/, openFile(filePath, content)];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, server.sendNotification('textDocument/didChange', {
                                textDocument: {
                                    uri: fileUri,
                                    version: 1,
                                },
                                contentChanges: [{ text: content }],
                            })];
                    case 2:
                        _a.sent();
                        (0, debug_js_1.logForDebugging)("LSP: Sent didChange for ".concat(filePath));
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        err = new Error("Failed to sync file change ".concat(filePath, ": ").concat((0, errors_js_1.errorMessage)(error_5)));
                        (0, log_js_1.logError)(err);
                        // Re-throw to propagate error to caller
                        throw err;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    /**
     * Save a file in LSP servers (sends didSave notification)
     * Called after file is written to disk to trigger diagnostics
     */
    function saveFile(filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var server, error_6, err;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        server = getServerForFile(filePath);
                        if (!server || server.state !== 'running')
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, server.sendNotification('textDocument/didSave', {
                                textDocument: {
                                    uri: (0, url_1.pathToFileURL)(path.resolve(filePath)).href,
                                },
                            })];
                    case 2:
                        _a.sent();
                        (0, debug_js_1.logForDebugging)("LSP: Sent didSave for ".concat(filePath));
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        err = new Error("Failed to sync file save ".concat(filePath, ": ").concat((0, errors_js_1.errorMessage)(error_6)));
                        (0, log_js_1.logError)(err);
                        // Re-throw to propagate error to caller
                        throw err;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    /**
     * Close a file in LSP servers (sends didClose notification)
     *
     * NOTE: Currently available but not yet integrated with compact flow.
     * TODO: Integrate with compact - call closeFile() when compact removes files from context
     * This will notify LSP servers that files are no longer in active use.
     */
    function closeFile(filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var server, fileUri, error_7, err;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        server = getServerForFile(filePath);
                        if (!server || server.state !== 'running')
                            return [2 /*return*/];
                        fileUri = (0, url_1.pathToFileURL)(path.resolve(filePath)).href;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, server.sendNotification('textDocument/didClose', {
                                textDocument: {
                                    uri: fileUri,
                                },
                            })
                            // Remove from tracking so file can be reopened later
                        ];
                    case 2:
                        _a.sent();
                        // Remove from tracking so file can be reopened later
                        openedFiles.delete(fileUri);
                        (0, debug_js_1.logForDebugging)("LSP: Sent didClose for ".concat(filePath));
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        err = new Error("Failed to sync file close ".concat(filePath, ": ").concat((0, errors_js_1.errorMessage)(error_7)));
                        (0, log_js_1.logError)(err);
                        // Re-throw to propagate error to caller
                        throw err;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function isFileOpen(filePath) {
        var fileUri = (0, url_1.pathToFileURL)(path.resolve(filePath)).href;
        return openedFiles.has(fileUri);
    }
    return {
        initialize: initialize,
        shutdown: shutdown,
        getServerForFile: getServerForFile,
        ensureServerStarted: ensureServerStarted,
        sendRequest: sendRequest,
        getAllServers: getAllServers,
        openFile: openFile,
        changeFile: changeFile,
        saveFile: saveFile,
        closeFile: closeFile,
        isFileOpen: isFileOpen,
    };
}
