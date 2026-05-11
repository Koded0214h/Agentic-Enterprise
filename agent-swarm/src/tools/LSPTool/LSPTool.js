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
exports.LSPTool = void 0;
var promises_1 = require("fs/promises");
var path = require("path");
var url_1 = require("url");
var v4_1 = require("zod/v4");
var manager_js_1 = require("../../services/lsp/manager.js");
var Tool_js_1 = require("../../Tool.js");
var array_js_1 = require("../../utils/array.js");
var cwd_js_1 = require("../../utils/cwd.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var execFileNoThrow_js_1 = require("../../utils/execFileNoThrow.js");
var fsOperations_js_1 = require("../../utils/fsOperations.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var log_js_1 = require("../../utils/log.js");
var path_js_1 = require("../../utils/path.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
var formatters_js_1 = require("./formatters.js");
var prompt_js_1 = require("./prompt.js");
var schemas_js_1 = require("./schemas.js");
var UI_js_1 = require("./UI.js");
var MAX_LSP_FILE_SIZE_BYTES = 10000000;
/**
 * Tool-compatible input schema (regular ZodObject instead of discriminated union)
 * We validate against the discriminated union in validateInput for better error messages
 */
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        operation: v4_1.z
            .enum([
            'goToDefinition',
            'findReferences',
            'hover',
            'documentSymbol',
            'workspaceSymbol',
            'goToImplementation',
            'prepareCallHierarchy',
            'incomingCalls',
            'outgoingCalls',
        ])
            .describe('The LSP operation to perform'),
        filePath: v4_1.z.string().describe('The absolute or relative path to the file'),
        line: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The line number (1-based, as shown in editors)'),
        character: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The character offset (1-based, as shown in editors)'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        operation: v4_1.z
            .enum([
            'goToDefinition',
            'findReferences',
            'hover',
            'documentSymbol',
            'workspaceSymbol',
            'goToImplementation',
            'prepareCallHierarchy',
            'incomingCalls',
            'outgoingCalls',
        ])
            .describe('The LSP operation that was performed'),
        result: v4_1.z.string().describe('The formatted result of the LSP operation'),
        filePath: v4_1.z
            .string()
            .describe('The file path the operation was performed on'),
        resultCount: v4_1.z
            .number()
            .int()
            .nonnegative()
            .optional()
            .describe('Number of results (definitions, references, symbols)'),
        fileCount: v4_1.z
            .number()
            .int()
            .nonnegative()
            .optional()
            .describe('Number of files containing results'),
    });
});
exports.LSPTool = (0, Tool_js_1.buildTool)({
    name: prompt_js_1.LSP_TOOL_NAME,
    searchHint: 'code intelligence (definitions, references, symbols, hover)',
    maxResultSizeChars: 100000,
    isLsp: true,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.DESCRIPTION];
            });
        });
    },
    userFacingName: UI_js_1.userFacingName,
    shouldDefer: true,
    isEnabled: function () {
        return (0, manager_js_1.isLspConnected)();
    },
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return true;
    },
    getPath: function (_a) {
        var filePath = _a.filePath;
        return (0, path_js_1.expandPath)(filePath);
    },
    validateInput: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var parseResult, fs, absolutePath, stats, error_1, err;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parseResult = (0, schemas_js_1.lspToolInputSchema)().safeParse(input);
                        if (!parseResult.success) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Invalid input: ".concat(parseResult.error.message),
                                    errorCode: 3,
                                }];
                        }
                        fs = (0, fsOperations_js_1.getFsImplementation)();
                        absolutePath = (0, path_js_1.expandPath)(input.filePath);
                        // SECURITY: Skip filesystem operations for UNC paths to prevent NTLM credential leaks.
                        if (absolutePath.startsWith('\\\\') || absolutePath.startsWith('//')) {
                            return [2 /*return*/, { result: true }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.stat(absolutePath)];
                    case 2:
                        stats = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        if ((0, errors_js_1.isENOENT)(error_1)) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "File does not exist: ".concat(input.filePath),
                                    errorCode: 1,
                                }];
                        }
                        err = (0, errors_js_1.toError)(error_1);
                        // Log filesystem access errors for tracking
                        (0, log_js_1.logError)(new Error("Failed to access file stats for LSP operation on ".concat(input.filePath, ": ").concat(err.message)));
                        return [2 /*return*/, {
                                result: false,
                                message: "Cannot access file: ".concat(input.filePath, ". ").concat(err.message),
                                errorCode: 4,
                            }];
                    case 4:
                        if (!stats.isFile()) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Path is not a file: ".concat(input.filePath),
                                    errorCode: 2,
                                }];
                        }
                        return [2 /*return*/, { result: true }];
                }
            });
        });
    },
    checkPermissions: function (input, context) {
        return __awaiter(this, void 0, void 0, function () {
            var appState;
            return __generator(this, function (_a) {
                appState = context.getAppState();
                return [2 /*return*/, (0, filesystem_js_1.checkReadPermissionForTool)(exports.LSPTool, input, appState.toolPermissionContext)];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.DESCRIPTION];
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolUseErrorMessage: UI_js_1.renderToolUseErrorMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    call: function (input, _context) {
        return __awaiter(this, void 0, void 0, function () {
            var absolutePath, cwd, status, manager, output, _a, method, params, handle, stats, output_1, fileContent, result, output_2, callItems, output_3, callMethod, symbols, locations, filteredLocations, filteredUris_1, locations, filteredLocations, filteredUris_2, _b, formatted, resultCount, fileCount, output, error_2, err, errorMessage, output;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        absolutePath = (0, path_js_1.expandPath)(input.filePath);
                        cwd = (0, cwd_js_1.getCwd)();
                        status = (0, manager_js_1.getInitializationStatus)();
                        if (!(status.status === 'pending')) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, manager_js_1.waitForInitialization)()];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2:
                        manager = (0, manager_js_1.getLspServerManager)();
                        if (!manager) {
                            // Log this system-level failure for tracking
                            (0, log_js_1.logError)(new Error('LSP server manager not initialized when tool was called'));
                            output = {
                                operation: input.operation,
                                result: 'LSP server manager not initialized. This may indicate a startup issue.',
                                filePath: input.filePath,
                            };
                            return [2 /*return*/, {
                                    data: output,
                                }];
                        }
                        _a = getMethodAndParams(input, absolutePath), method = _a.method, params = _a.params;
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 19, , 20]);
                        if (!!manager.isFileOpen(absolutePath)) return [3 /*break*/, 11];
                        return [4 /*yield*/, (0, promises_1.open)(absolutePath, 'r')];
                    case 4:
                        handle = _c.sent();
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, , 9, 11]);
                        return [4 /*yield*/, handle.stat()];
                    case 6:
                        stats = _c.sent();
                        if (stats.size > MAX_LSP_FILE_SIZE_BYTES) {
                            output_1 = {
                                operation: input.operation,
                                result: "File too large for LSP analysis (".concat(Math.ceil(stats.size / 1000000), "MB exceeds 10MB limit)"),
                                filePath: input.filePath,
                            };
                            return [2 /*return*/, { data: output_1 }];
                        }
                        return [4 /*yield*/, handle.readFile({ encoding: 'utf-8' })];
                    case 7:
                        fileContent = _c.sent();
                        return [4 /*yield*/, manager.openFile(absolutePath, fileContent)];
                    case 8:
                        _c.sent();
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, handle.close()];
                    case 10:
                        _c.sent();
                        return [7 /*endfinally*/];
                    case 11: return [4 /*yield*/, manager.sendRequest(absolutePath, method, params)];
                    case 12:
                        result = _c.sent();
                        if (result === undefined) {
                            // Log for diagnostic purposes - helps track usage patterns and potential bugs
                            (0, debug_js_1.logForDebugging)("No LSP server available for file type ".concat(path.extname(absolutePath), " for operation ").concat(input.operation, " on file ").concat(input.filePath));
                            output_2 = {
                                operation: input.operation,
                                result: "No LSP server available for file type: ".concat(path.extname(absolutePath)),
                                filePath: input.filePath,
                            };
                            return [2 /*return*/, {
                                    data: output_2,
                                }];
                        }
                        if (!(input.operation === 'incomingCalls' ||
                            input.operation === 'outgoingCalls')) return [3 /*break*/, 14];
                        callItems = result;
                        if (!callItems || callItems.length === 0) {
                            output_3 = {
                                operation: input.operation,
                                result: 'No call hierarchy item found at this position',
                                filePath: input.filePath,
                                resultCount: 0,
                                fileCount: 0,
                            };
                            return [2 /*return*/, { data: output_3 }];
                        }
                        callMethod = input.operation === 'incomingCalls'
                            ? 'callHierarchy/incomingCalls'
                            : 'callHierarchy/outgoingCalls';
                        return [4 /*yield*/, manager.sendRequest(absolutePath, callMethod, {
                                item: callItems[0],
                            })];
                    case 13:
                        result = _c.sent();
                        if (result === undefined) {
                            (0, debug_js_1.logForDebugging)("LSP server returned undefined for ".concat(callMethod, " on ").concat(input.filePath));
                            // Continue to formatter which will handle empty/null gracefully
                        }
                        _c.label = 14;
                    case 14:
                        if (!(result &&
                            Array.isArray(result) &&
                            (input.operation === 'findReferences' ||
                                input.operation === 'goToDefinition' ||
                                input.operation === 'goToImplementation' ||
                                input.operation === 'workspaceSymbol'))) return [3 /*break*/, 18];
                        if (!(input.operation === 'workspaceSymbol')) return [3 /*break*/, 16];
                        symbols = result;
                        locations = symbols
                            .filter(function (s) { var _a; return (_a = s === null || s === void 0 ? void 0 : s.location) === null || _a === void 0 ? void 0 : _a.uri; })
                            .map(function (s) { return s.location; });
                        return [4 /*yield*/, filterGitIgnoredLocations(locations, cwd)];
                    case 15:
                        filteredLocations = _c.sent();
                        filteredUris_1 = new Set(filteredLocations.map(function (l) { return l.uri; }));
                        result = symbols.filter(function (s) { var _a; return !((_a = s === null || s === void 0 ? void 0 : s.location) === null || _a === void 0 ? void 0 : _a.uri) || filteredUris_1.has(s.location.uri); });
                        return [3 /*break*/, 18];
                    case 16:
                        locations = result.map(toLocation);
                        return [4 /*yield*/, filterGitIgnoredLocations(locations, cwd)];
                    case 17:
                        filteredLocations = _c.sent();
                        filteredUris_2 = new Set(filteredLocations.map(function (l) { return l.uri; }));
                        result = result.filter(function (item) {
                            var loc = toLocation(item);
                            return !loc.uri || filteredUris_2.has(loc.uri);
                        });
                        _c.label = 18;
                    case 18:
                        _b = formatResult(input.operation, result, cwd), formatted = _b.formatted, resultCount = _b.resultCount, fileCount = _b.fileCount;
                        output = {
                            operation: input.operation,
                            result: formatted,
                            filePath: input.filePath,
                            resultCount: resultCount,
                            fileCount: fileCount,
                        };
                        return [2 /*return*/, {
                                data: output,
                            }];
                    case 19:
                        error_2 = _c.sent();
                        err = (0, errors_js_1.toError)(error_2);
                        errorMessage = err.message;
                        // Log error for tracking
                        (0, log_js_1.logError)(new Error("LSP tool request failed for ".concat(input.operation, " on ").concat(input.filePath, ": ").concat(errorMessage)));
                        output = {
                            operation: input.operation,
                            result: "Error performing ".concat(input.operation, ": ").concat(errorMessage),
                            filePath: input.filePath,
                        };
                        return [2 /*return*/, {
                                data: output,
                            }];
                    case 20: return [2 /*return*/];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (output, toolUseID) {
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: output.result,
        };
    },
});
/**
 * Maps LSPTool operation to LSP method and params
 */
function getMethodAndParams(input, absolutePath) {
    var uri = (0, url_1.pathToFileURL)(absolutePath).href;
    // Convert from 1-based (user-friendly) to 0-based (LSP protocol)
    var position = {
        line: input.line - 1,
        character: input.character - 1,
    };
    switch (input.operation) {
        case 'goToDefinition':
            return {
                method: 'textDocument/definition',
                params: {
                    textDocument: { uri: uri },
                    position: position,
                },
            };
        case 'findReferences':
            return {
                method: 'textDocument/references',
                params: {
                    textDocument: { uri: uri },
                    position: position,
                    context: { includeDeclaration: true },
                },
            };
        case 'hover':
            return {
                method: 'textDocument/hover',
                params: {
                    textDocument: { uri: uri },
                    position: position,
                },
            };
        case 'documentSymbol':
            return {
                method: 'textDocument/documentSymbol',
                params: {
                    textDocument: { uri: uri },
                },
            };
        case 'workspaceSymbol':
            return {
                method: 'workspace/symbol',
                params: {
                    query: '', // Empty query returns all symbols
                },
            };
        case 'goToImplementation':
            return {
                method: 'textDocument/implementation',
                params: {
                    textDocument: { uri: uri },
                    position: position,
                },
            };
        case 'prepareCallHierarchy':
            return {
                method: 'textDocument/prepareCallHierarchy',
                params: {
                    textDocument: { uri: uri },
                    position: position,
                },
            };
        case 'incomingCalls':
            // For incoming/outgoing calls, we first need to prepare the call hierarchy
            // The LSP server will return CallHierarchyItem(s) that we pass to the calls request
            return {
                method: 'textDocument/prepareCallHierarchy',
                params: {
                    textDocument: { uri: uri },
                    position: position,
                },
            };
        case 'outgoingCalls':
            return {
                method: 'textDocument/prepareCallHierarchy',
                params: {
                    textDocument: { uri: uri },
                    position: position,
                },
            };
    }
}
/**
 * Counts the total number of symbols including nested children
 */
function countSymbols(symbols) {
    var count = symbols.length;
    for (var _i = 0, symbols_1 = symbols; _i < symbols_1.length; _i++) {
        var symbol = symbols_1[_i];
        if (symbol.children && symbol.children.length > 0) {
            count += countSymbols(symbol.children);
        }
    }
    return count;
}
/**
 * Counts unique files from an array of locations
 */
function countUniqueFiles(locations) {
    return new Set(locations.map(function (loc) { return loc.uri; })).size;
}
/**
 * Extracts a file path from a file:// URI, decoding percent-encoded characters.
 */
function uriToFilePath(uri) {
    var filePath = uri.replace(/^file:\/\//, '');
    // On Windows, file:///C:/path becomes /C:/path — strip the leading slash
    if (/^\/[A-Za-z]:/.test(filePath)) {
        filePath = filePath.slice(1);
    }
    try {
        filePath = decodeURIComponent(filePath);
    }
    catch (_a) {
        // Use un-decoded path if malformed
    }
    return filePath;
}
/**
 * Filters out locations whose file paths are gitignored.
 * Uses `git check-ignore` with batched path arguments for efficiency.
 */
function filterGitIgnoredLocations(locations, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var uriToPath, _i, locations_1, loc, uniquePaths, ignoredPaths, BATCH_SIZE, i, batch, result, _a, _b, line, trimmed;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (locations.length === 0) {
                        return [2 /*return*/, locations];
                    }
                    uriToPath = new Map();
                    for (_i = 0, locations_1 = locations; _i < locations_1.length; _i++) {
                        loc = locations_1[_i];
                        if (loc.uri && !uriToPath.has(loc.uri)) {
                            uriToPath.set(loc.uri, uriToFilePath(loc.uri));
                        }
                    }
                    uniquePaths = (0, array_js_1.uniq)(uriToPath.values());
                    if (uniquePaths.length === 0) {
                        return [2 /*return*/, locations];
                    }
                    ignoredPaths = new Set();
                    BATCH_SIZE = 50;
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < uniquePaths.length)) return [3 /*break*/, 4];
                    batch = uniquePaths.slice(i, i + BATCH_SIZE);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('git', __spreadArray(['check-ignore'], batch, true), {
                            cwd: cwd,
                            preserveOutputOnError: false,
                            timeout: 5000,
                        })];
                case 2:
                    result = _c.sent();
                    if (result.code === 0 && result.stdout) {
                        for (_a = 0, _b = result.stdout.split('\n'); _a < _b.length; _a++) {
                            line = _b[_a];
                            trimmed = line.trim();
                            if (trimmed) {
                                ignoredPaths.add(trimmed);
                            }
                        }
                    }
                    _c.label = 3;
                case 3:
                    i += BATCH_SIZE;
                    return [3 /*break*/, 1];
                case 4:
                    if (ignoredPaths.size === 0) {
                        return [2 /*return*/, locations];
                    }
                    return [2 /*return*/, locations.filter(function (loc) {
                            var filePath = uriToPath.get(loc.uri);
                            return !filePath || !ignoredPaths.has(filePath);
                        })];
            }
        });
    });
}
/**
 * Checks if item is LocationLink (has targetUri) vs Location (has uri)
 */
function isLocationLink(item) {
    return 'targetUri' in item;
}
/**
 * Converts LocationLink to Location format for uniform handling
 */
function toLocation(item) {
    if (isLocationLink(item)) {
        return {
            uri: item.targetUri,
            range: item.targetSelectionRange || item.targetRange,
        };
    }
    return item;
}
/**
 * Formats LSP result based on operation type and extracts summary counts
 */
function formatResult(operation, result, cwd) {
    switch (operation) {
        case 'goToDefinition': {
            // Handle both Location and LocationLink formats
            var rawResults = Array.isArray(result)
                ? result
                : result
                    ? [result]
                    : [];
            // Convert LocationLinks to Locations for uniform handling
            var locations = rawResults.map(toLocation);
            // Log and filter out locations with undefined uris
            var invalidLocations = locations.filter(function (loc) { return !loc || !loc.uri; });
            if (invalidLocations.length > 0) {
                (0, log_js_1.logError)(new Error("LSP server returned ".concat(invalidLocations.length, " location(s) with undefined URI for goToDefinition on ").concat(cwd, ". ") +
                    "This indicates malformed data from the LSP server."));
            }
            var validLocations = locations.filter(function (loc) { return loc && loc.uri; });
            return {
                formatted: (0, formatters_js_1.formatGoToDefinitionResult)(result, cwd),
                resultCount: validLocations.length,
                fileCount: countUniqueFiles(validLocations),
            };
        }
        case 'findReferences': {
            var locations = result || [];
            // Log and filter out locations with undefined uris
            var invalidLocations = locations.filter(function (loc) { return !loc || !loc.uri; });
            if (invalidLocations.length > 0) {
                (0, log_js_1.logError)(new Error("LSP server returned ".concat(invalidLocations.length, " location(s) with undefined URI for findReferences on ").concat(cwd, ". ") +
                    "This indicates malformed data from the LSP server."));
            }
            var validLocations = locations.filter(function (loc) { return loc && loc.uri; });
            return {
                formatted: (0, formatters_js_1.formatFindReferencesResult)(result, cwd),
                resultCount: validLocations.length,
                fileCount: countUniqueFiles(validLocations),
            };
        }
        case 'hover': {
            return {
                formatted: (0, formatters_js_1.formatHoverResult)(result, cwd),
                resultCount: result ? 1 : 0,
                fileCount: result ? 1 : 0,
            };
        }
        case 'documentSymbol': {
            // LSP allows documentSymbol to return either DocumentSymbol[] or SymbolInformation[]
            var symbols = result || [];
            // Detect format: DocumentSymbol has 'range', SymbolInformation has 'location'
            var isDocumentSymbol = symbols.length > 0 && symbols[0] && 'range' in symbols[0];
            // Count symbols - DocumentSymbol can have nested children, SymbolInformation is flat
            var count = isDocumentSymbol
                ? countSymbols(symbols)
                : symbols.length;
            return {
                formatted: (0, formatters_js_1.formatDocumentSymbolResult)(result, cwd),
                resultCount: count,
                fileCount: symbols.length > 0 ? 1 : 0,
            };
        }
        case 'workspaceSymbol': {
            var symbols = result || [];
            // Log and filter out symbols with undefined location.uri
            var invalidSymbols = symbols.filter(function (sym) { return !sym || !sym.location || !sym.location.uri; });
            if (invalidSymbols.length > 0) {
                (0, log_js_1.logError)(new Error("LSP server returned ".concat(invalidSymbols.length, " symbol(s) with undefined location URI for workspaceSymbol on ").concat(cwd, ". ") +
                    "This indicates malformed data from the LSP server."));
            }
            var validSymbols = symbols.filter(function (sym) { return sym && sym.location && sym.location.uri; });
            var locations = validSymbols.map(function (s) { return s.location; });
            return {
                formatted: (0, formatters_js_1.formatWorkspaceSymbolResult)(result, cwd),
                resultCount: validSymbols.length,
                fileCount: countUniqueFiles(locations),
            };
        }
        case 'goToImplementation': {
            // Handle both Location and LocationLink formats (same as goToDefinition)
            var rawResults = Array.isArray(result)
                ? result
                : result
                    ? [result]
                    : [];
            // Convert LocationLinks to Locations for uniform handling
            var locations = rawResults.map(toLocation);
            // Log and filter out locations with undefined uris
            var invalidLocations = locations.filter(function (loc) { return !loc || !loc.uri; });
            if (invalidLocations.length > 0) {
                (0, log_js_1.logError)(new Error("LSP server returned ".concat(invalidLocations.length, " location(s) with undefined URI for goToImplementation on ").concat(cwd, ". ") +
                    "This indicates malformed data from the LSP server."));
            }
            var validLocations = locations.filter(function (loc) { return loc && loc.uri; });
            return {
                // Reuse goToDefinition formatter since the result format is identical
                formatted: (0, formatters_js_1.formatGoToDefinitionResult)(result, cwd),
                resultCount: validLocations.length,
                fileCount: countUniqueFiles(validLocations),
            };
        }
        case 'prepareCallHierarchy': {
            var items = result || [];
            return {
                formatted: (0, formatters_js_1.formatPrepareCallHierarchyResult)(result, cwd),
                resultCount: items.length,
                fileCount: items.length > 0 ? countUniqueFilesFromCallItems(items) : 0,
            };
        }
        case 'incomingCalls': {
            var calls = result || [];
            return {
                formatted: (0, formatters_js_1.formatIncomingCallsResult)(result, cwd),
                resultCount: calls.length,
                fileCount: calls.length > 0 ? countUniqueFilesFromIncomingCalls(calls) : 0,
            };
        }
        case 'outgoingCalls': {
            var calls = result || [];
            return {
                formatted: (0, formatters_js_1.formatOutgoingCallsResult)(result, cwd),
                resultCount: calls.length,
                fileCount: calls.length > 0 ? countUniqueFilesFromOutgoingCalls(calls) : 0,
            };
        }
    }
}
/**
 * Counts unique files from CallHierarchyItem array
 * Filters out items with undefined URIs
 */
function countUniqueFilesFromCallItems(items) {
    var validUris = items.map(function (item) { return item.uri; }).filter(function (uri) { return uri; });
    return new Set(validUris).size;
}
/**
 * Counts unique files from CallHierarchyIncomingCall array
 * Filters out calls with undefined URIs
 */
function countUniqueFilesFromIncomingCalls(calls) {
    var validUris = calls.map(function (call) { var _a; return (_a = call.from) === null || _a === void 0 ? void 0 : _a.uri; }).filter(function (uri) { return uri; });
    return new Set(validUris).size;
}
/**
 * Counts unique files from CallHierarchyOutgoingCall array
 * Filters out calls with undefined URIs
 */
function countUniqueFilesFromOutgoingCalls(calls) {
    var validUris = calls.map(function (call) { var _a; return (_a = call.to) === null || _a === void 0 ? void 0 : _a.uri; }).filter(function (uri) { return uri; });
    return new Set(validUris).size;
}
