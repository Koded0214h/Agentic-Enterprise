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
exports.diagnosticTracker = exports.DiagnosticTrackingService = void 0;
var figures_1 = require("figures");
var log_js_1 = require("src/utils/log.js");
var client_js_1 = require("../services/mcp/client.js");
var errors_js_1 = require("../utils/errors.js");
var file_js_1 = require("../utils/file.js");
var ide_js_1 = require("../utils/ide.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var DiagnosticsTrackingError = /** @class */ (function (_super) {
    __extends(DiagnosticsTrackingError, _super);
    function DiagnosticsTrackingError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DiagnosticsTrackingError;
}(errors_js_1.ClaudeError));
var MAX_DIAGNOSTICS_SUMMARY_CHARS = 4000;
var DiagnosticTrackingService = /** @class */ (function () {
    function DiagnosticTrackingService() {
        this.baseline = new Map();
        this.initialized = false;
        // Track when files were last processed/fetched
        this.lastProcessedTimestamps = new Map();
        // Track which files have received right file diagnostics and if they've changed
        // Map<normalizedPath, lastClaudeFsRightDiagnostics>
        this.rightFileDiagnosticsState = new Map();
    }
    DiagnosticTrackingService.getInstance = function () {
        if (!DiagnosticTrackingService.instance) {
            DiagnosticTrackingService.instance = new DiagnosticTrackingService();
        }
        return DiagnosticTrackingService.instance;
    };
    DiagnosticTrackingService.prototype.initialize = function (mcpClient) {
        if (this.initialized) {
            return;
        }
        // TODO: Do not cache the connected mcpClient since it can change.
        this.mcpClient = mcpClient;
        this.initialized = true;
    };
    DiagnosticTrackingService.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.initialized = false;
                this.baseline.clear();
                this.rightFileDiagnosticsState.clear();
                this.lastProcessedTimestamps.clear();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Reset tracking state while keeping the service initialized.
     * This clears all tracked files and diagnostics.
     */
    DiagnosticTrackingService.prototype.reset = function () {
        this.baseline.clear();
        this.rightFileDiagnosticsState.clear();
        this.lastProcessedTimestamps.clear();
    };
    DiagnosticTrackingService.prototype.normalizeFileUri = function (fileUri) {
        // Remove our protocol prefixes
        var protocolPrefixes = [
            'file://',
            '_claude_fs_right:',
            '_claude_fs_left:',
        ];
        var normalized = fileUri;
        for (var _i = 0, protocolPrefixes_1 = protocolPrefixes; _i < protocolPrefixes_1.length; _i++) {
            var prefix = protocolPrefixes_1[_i];
            if (fileUri.startsWith(prefix)) {
                normalized = fileUri.slice(prefix.length);
                break;
            }
        }
        // Use shared utility for platform-aware path normalization
        // (handles Windows case-insensitivity and path separators)
        return (0, file_js_1.normalizePathForComparison)(normalized);
    };
    /**
     * Ensure a file is opened in the IDE before processing.
     * This is important for language services like diagnostics to work properly.
     */
    DiagnosticTrackingService.prototype.ensureFileOpened = function (fileUri) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.initialized ||
                            !this.mcpClient ||
                            this.mcpClient.type !== 'connected') {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Call the openFile tool to ensure the file is loaded
                        return [4 /*yield*/, (0, client_js_1.callIdeRpc)('openFile', {
                                filePath: fileUri,
                                preview: false,
                                startText: '',
                                endText: '',
                                selectToEndOfLine: false,
                                makeFrontmost: false,
                            }, this.mcpClient)];
                    case 2:
                        // Call the openFile tool to ensure the file is loaded
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        (0, log_js_1.logError)(error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Capture baseline diagnostics for a specific file before editing.
     * This is called before editing a file to ensure we have a baseline to compare against.
     */
    DiagnosticTrackingService.prototype.beforeFileEdited = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, result, diagnosticFile, normalizedPath, normalizedPath, _error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.initialized ||
                            !this.mcpClient ||
                            this.mcpClient.type !== 'connected') {
                            return [2 /*return*/];
                        }
                        timestamp = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, client_js_1.callIdeRpc)('getDiagnostics', { uri: "file://".concat(filePath) }, this.mcpClient)];
                    case 2:
                        result = _a.sent();
                        diagnosticFile = this.parseDiagnosticResult(result)[0];
                        if (diagnosticFile) {
                            // Compare normalized paths (handles protocol prefixes and Windows case-insensitivity)
                            if (!(0, file_js_1.pathsEqual)(this.normalizeFileUri(filePath), this.normalizeFileUri(diagnosticFile.uri))) {
                                (0, log_js_1.logError)(new DiagnosticsTrackingError("Diagnostics file path mismatch: expected ".concat(filePath, ", got ").concat(diagnosticFile.uri, ")")));
                                return [2 /*return*/];
                            }
                            normalizedPath = this.normalizeFileUri(filePath);
                            this.baseline.set(normalizedPath, diagnosticFile.diagnostics);
                            this.lastProcessedTimestamps.set(normalizedPath, timestamp);
                        }
                        else {
                            normalizedPath = this.normalizeFileUri(filePath);
                            this.baseline.set(normalizedPath, []);
                            this.lastProcessedTimestamps.set(normalizedPath, timestamp);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _error_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get new diagnostics from file://, _claude_fs_right, and _claude_fs_ URIs that aren't in the baseline.
     * Only processes diagnostics for files that have been edited.
     */
    DiagnosticTrackingService.prototype.getNewDiagnostics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var allDiagnosticFiles, result, _error_2, diagnosticsForFileUrisWithBaselines, diagnosticsForClaudeFsRightUrisWithBaselinesMap, newDiagnosticFiles, _loop_1, this_1, _i, diagnosticsForFileUrisWithBaselines_1, file;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.initialized ||
                            !this.mcpClient ||
                            this.mcpClient.type !== 'connected') {
                            return [2 /*return*/, []];
                        }
                        allDiagnosticFiles = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, client_js_1.callIdeRpc)('getDiagnostics', {}, // Empty params fetches all diagnostics
                            this.mcpClient)];
                    case 2:
                        result = _a.sent();
                        allDiagnosticFiles = this.parseDiagnosticResult(result);
                        return [3 /*break*/, 4];
                    case 3:
                        _error_2 = _a.sent();
                        // If fetching all diagnostics fails, return empty
                        return [2 /*return*/, []];
                    case 4:
                        diagnosticsForFileUrisWithBaselines = allDiagnosticFiles
                            .filter(function (file) { return _this.baseline.has(_this.normalizeFileUri(file.uri)); })
                            .filter(function (file) { return file.uri.startsWith('file://'); });
                        diagnosticsForClaudeFsRightUrisWithBaselinesMap = new Map();
                        allDiagnosticFiles
                            .filter(function (file) { return _this.baseline.has(_this.normalizeFileUri(file.uri)); })
                            .filter(function (file) { return file.uri.startsWith('_claude_fs_right:'); })
                            .forEach(function (file) {
                            diagnosticsForClaudeFsRightUrisWithBaselinesMap.set(_this.normalizeFileUri(file.uri), file);
                        });
                        newDiagnosticFiles = [];
                        _loop_1 = function (file) {
                            var normalizedPath = this_1.normalizeFileUri(file.uri);
                            var baselineDiagnostics = this_1.baseline.get(normalizedPath) || [];
                            // Get the _claude_fs_right file if it exists
                            var claudeFsRightFile = diagnosticsForClaudeFsRightUrisWithBaselinesMap.get(normalizedPath);
                            // Determine which file to use based on the state of right file diagnostics
                            var fileToUse = file;
                            if (claudeFsRightFile) {
                                var previousRightDiagnostics = this_1.rightFileDiagnosticsState.get(normalizedPath);
                                // Use _claude_fs_right if:
                                // 1. We've never gotten right file diagnostics for this file (previousRightDiagnostics === undefined)
                                // 2. OR the right file diagnostics have just changed
                                if (!previousRightDiagnostics ||
                                    !this_1.areDiagnosticArraysEqual(previousRightDiagnostics, claudeFsRightFile.diagnostics)) {
                                    fileToUse = claudeFsRightFile;
                                }
                                // Update our tracking of right file diagnostics
                                this_1.rightFileDiagnosticsState.set(normalizedPath, claudeFsRightFile.diagnostics);
                            }
                            // Find new diagnostics that aren't in the baseline
                            var newDiagnostics = fileToUse.diagnostics.filter(function (d) { return !baselineDiagnostics.some(function (b) { return _this.areDiagnosticsEqual(d, b); }); });
                            if (newDiagnostics.length > 0) {
                                newDiagnosticFiles.push({
                                    uri: file.uri,
                                    diagnostics: newDiagnostics,
                                });
                            }
                            // Update baseline with current diagnostics
                            this_1.baseline.set(normalizedPath, fileToUse.diagnostics);
                        };
                        this_1 = this;
                        // Process file:// protocol diagnostics
                        for (_i = 0, diagnosticsForFileUrisWithBaselines_1 = diagnosticsForFileUrisWithBaselines; _i < diagnosticsForFileUrisWithBaselines_1.length; _i++) {
                            file = diagnosticsForFileUrisWithBaselines_1[_i];
                            _loop_1(file);
                        }
                        return [2 /*return*/, newDiagnosticFiles];
                }
            });
        });
    };
    DiagnosticTrackingService.prototype.parseDiagnosticResult = function (result) {
        if (Array.isArray(result)) {
            var textBlock = result.find(function (block) { return block.type === 'text'; });
            if (textBlock && 'text' in textBlock) {
                var parsed = (0, slowOperations_js_1.jsonParse)(textBlock.text);
                return parsed;
            }
        }
        return [];
    };
    DiagnosticTrackingService.prototype.areDiagnosticsEqual = function (a, b) {
        return (a.message === b.message &&
            a.severity === b.severity &&
            a.source === b.source &&
            a.code === b.code &&
            a.range.start.line === b.range.start.line &&
            a.range.start.character === b.range.start.character &&
            a.range.end.line === b.range.end.line &&
            a.range.end.character === b.range.end.character);
    };
    DiagnosticTrackingService.prototype.areDiagnosticArraysEqual = function (a, b) {
        var _this = this;
        if (a.length !== b.length)
            return false;
        // Check if every diagnostic in 'a' exists in 'b'
        return (a.every(function (diagA) {
            return b.some(function (diagB) { return _this.areDiagnosticsEqual(diagA, diagB); });
        }) &&
            b.every(function (diagB) { return a.some(function (diagA) { return _this.areDiagnosticsEqual(diagA, diagB); }); }));
    };
    /**
     * Handle the start of a new query. This method:
     * - Initializes the diagnostic tracker if not already initialized
     * - Resets the tracker if already initialized (for new query loops)
     * - Automatically finds the IDE client from the provided clients list
     *
     * @param clients Array of MCP clients that may include an IDE client
     * @param shouldQuery Whether a query is actually being made (not just a command)
     */
    DiagnosticTrackingService.prototype.handleQueryStart = function (clients) {
        return __awaiter(this, void 0, void 0, function () {
            var connectedIdeClient;
            return __generator(this, function (_a) {
                // Only proceed if we should query and have clients
                if (!this.initialized) {
                    connectedIdeClient = (0, ide_js_1.getConnectedIdeClient)(clients);
                    if (connectedIdeClient) {
                        this.initialize(connectedIdeClient);
                    }
                }
                else {
                    // Reset diagnostic tracking for new query loops
                    this.reset();
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Format diagnostics into a human-readable summary string.
     * This is useful for displaying diagnostics in messages or logs.
     *
     * @param files Array of diagnostic files to format
     * @returns Formatted string representation of the diagnostics
     */
    DiagnosticTrackingService.formatDiagnosticsSummary = function (files) {
        var truncationMarker = '…[truncated]';
        var result = files
            .map(function (file) {
            var filename = file.uri.split('/').pop() || file.uri;
            var diagnostics = file.diagnostics
                .map(function (d) {
                var severitySymbol = DiagnosticTrackingService.getSeveritySymbol(d.severity);
                return "  ".concat(severitySymbol, " [Line ").concat(d.range.start.line + 1, ":").concat(d.range.start.character + 1, "] ").concat(d.message).concat(d.code ? " [".concat(d.code, "]") : '').concat(d.source ? " (".concat(d.source, ")") : '');
            })
                .join('\n');
            return "".concat(filename, ":\n").concat(diagnostics);
        })
            .join('\n\n');
        if (result.length > MAX_DIAGNOSTICS_SUMMARY_CHARS) {
            return (result.slice(0, MAX_DIAGNOSTICS_SUMMARY_CHARS - truncationMarker.length) + truncationMarker);
        }
        return result;
    };
    /**
     * Get the severity symbol for a diagnostic
     */
    DiagnosticTrackingService.getSeveritySymbol = function (severity) {
        return ({
            Error: figures_1.default.cross,
            Warning: figures_1.default.warning,
            Info: figures_1.default.info,
            Hint: figures_1.default.star,
        }[severity] || figures_1.default.bullet);
    };
    return DiagnosticTrackingService;
}());
exports.DiagnosticTrackingService = DiagnosticTrackingService;
exports.diagnosticTracker = DiagnosticTrackingService.getInstance();
