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
exports.GlobTool = void 0;
var v4_1 = require("zod/v4");
var Tool_js_1 = require("../../Tool.js");
var cwd_js_1 = require("../../utils/cwd.js");
var errors_js_1 = require("../../utils/errors.js");
var file_js_1 = require("../../utils/file.js");
var fsOperations_js_1 = require("../../utils/fsOperations.js");
var glob_js_1 = require("../../utils/glob.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var path_js_1 = require("../../utils/path.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
var shellRuleMatching_js_1 = require("../../utils/permissions/shellRuleMatching.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        pattern: v4_1.z.string().describe('The glob pattern to match files against'),
        path: v4_1.z
            .string()
            .optional()
            .describe('The directory to search in. If not specified, the current working directory will be used. IMPORTANT: Omit this field to use the default directory. DO NOT enter "undefined" or "null" - simply omit it for the default behavior. Must be a valid directory path if provided.'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        durationMs: v4_1.z
            .number()
            .describe('Time taken to execute the search in milliseconds'),
        numFiles: v4_1.z.number().describe('Total number of files found'),
        filenames: v4_1.z
            .array(v4_1.z.string())
            .describe('Array of file paths that match the pattern'),
        truncated: v4_1.z
            .boolean()
            .describe('Whether results were truncated (limited to 100 files)'),
    });
});
exports.GlobTool = (0, Tool_js_1.buildTool)({
    name: prompt_js_1.GLOB_TOOL_NAME,
    searchHint: 'find files by name pattern or wildcard',
    maxResultSizeChars: 100000,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.DESCRIPTION];
            });
        });
    },
    userFacingName: UI_js_1.userFacingName,
    getToolUseSummary: UI_js_1.getToolUseSummary,
    getActivityDescription: function (input) {
        var summary = (0, UI_js_1.getToolUseSummary)(input);
        return summary ? "Finding ".concat(summary) : 'Finding files';
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
    toAutoClassifierInput: function (input) {
        return input.pattern;
    },
    isSearchOrReadCommand: function () {
        return { isSearch: true, isRead: false };
    },
    getPath: function (_a) {
        var path = _a.path;
        return path ? (0, path_js_1.expandPath)(path) : (0, cwd_js_1.getCwd)();
    },
    preparePermissionMatcher: function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var pattern = _b.pattern;
            return __generator(this, function (_c) {
                return [2 /*return*/, function (rulePattern) { return (0, shellRuleMatching_js_1.matchWildcardPattern)(rulePattern, pattern); }];
            });
        });
    },
    validateInput: function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var fs, absolutePath, stats, e_1, cwdSuggestion, message;
            var path = _b.path;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!path) return [3 /*break*/, 7];
                        fs = (0, fsOperations_js_1.getFsImplementation)();
                        absolutePath = (0, path_js_1.expandPath)(path);
                        // SECURITY: Skip filesystem operations for UNC paths to prevent NTLM credential leaks.
                        if (absolutePath.startsWith('\\\\') || absolutePath.startsWith('//')) {
                            return [2 /*return*/, { result: true }];
                        }
                        stats = void 0;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 6]);
                        return [4 /*yield*/, fs.stat(absolutePath)];
                    case 2:
                        stats = _c.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        e_1 = _c.sent();
                        if (!(0, errors_js_1.isENOENT)(e_1)) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, file_js_1.suggestPathUnderCwd)(absolutePath)];
                    case 4:
                        cwdSuggestion = _c.sent();
                        message = "Directory does not exist: ".concat(path, ". ").concat(file_js_1.FILE_NOT_FOUND_CWD_NOTE, " ").concat((0, cwd_js_1.getCwd)(), ".");
                        if (cwdSuggestion) {
                            message += " Did you mean ".concat(cwdSuggestion, "?");
                        }
                        return [2 /*return*/, {
                                result: false,
                                message: message,
                                errorCode: 1,
                            }];
                    case 5: throw e_1;
                    case 6:
                        if (!stats.isDirectory()) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Path is not a directory: ".concat(path),
                                    errorCode: 2,
                                }];
                        }
                        _c.label = 7;
                    case 7: return [2 /*return*/, { result: true }];
                }
            });
        });
    },
    checkPermissions: function (input, context) {
        return __awaiter(this, void 0, void 0, function () {
            var appState;
            return __generator(this, function (_a) {
                appState = context.getAppState();
                return [2 /*return*/, (0, filesystem_js_1.checkReadPermissionForTool)(exports.GlobTool, input, appState.toolPermissionContext)];
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
    // Reuses Grep's render (UI.tsx:65) — shows filenames.join. durationMs/
    // numFiles are "Found 3 files in 12ms" chrome (under-count, fine).
    extractSearchText: function (_a) {
        var filenames = _a.filenames;
        return filenames.join('\n');
    },
    call: function (input_1, _a) {
        return __awaiter(this, arguments, void 0, function (input, _b) {
            var start, appState, limit, _c, files, truncated, filenames, output;
            var _d;
            var abortController = _b.abortController, getAppState = _b.getAppState, globLimits = _b.globLimits;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        start = Date.now();
                        appState = getAppState();
                        limit = (_d = globLimits === null || globLimits === void 0 ? void 0 : globLimits.maxResults) !== null && _d !== void 0 ? _d : 100;
                        return [4 /*yield*/, (0, glob_js_1.glob)(input.pattern, exports.GlobTool.getPath(input), { limit: limit, offset: 0 }, abortController.signal, appState.toolPermissionContext)
                            // Relativize paths under cwd to save tokens (same as GrepTool)
                        ];
                    case 1:
                        _c = _e.sent(), files = _c.files, truncated = _c.truncated;
                        filenames = files.map(path_js_1.toRelativePath);
                        output = {
                            filenames: filenames,
                            durationMs: Date.now() - start,
                            numFiles: filenames.length,
                            truncated: truncated,
                        };
                        return [2 /*return*/, {
                                data: output,
                            }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (output, toolUseID) {
        if (output.filenames.length === 0) {
            return {
                tool_use_id: toolUseID,
                type: 'tool_result',
                content: 'No files found',
            };
        }
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: __spreadArray(__spreadArray([], output.filenames, true), (output.truncated
                ? [
                    '(Results are truncated. Consider using a more specific path or pattern.)',
                ]
                : []), true).join('\n'),
        };
    },
});
