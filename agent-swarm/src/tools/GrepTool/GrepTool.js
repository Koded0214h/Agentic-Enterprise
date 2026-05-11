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
exports.GrepTool = void 0;
var v4_1 = require("zod/v4");
var Tool_js_1 = require("../../Tool.js");
var cwd_js_1 = require("../../utils/cwd.js");
var errors_js_1 = require("../../utils/errors.js");
var file_js_1 = require("../../utils/file.js");
var fsOperations_js_1 = require("../../utils/fsOperations.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var path_js_1 = require("../../utils/path.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
var shellRuleMatching_js_1 = require("../../utils/permissions/shellRuleMatching.js");
var orphanedPluginFilter_js_1 = require("../../utils/plugins/orphanedPluginFilter.js");
var ripgrep_js_1 = require("../../utils/ripgrep.js");
var semanticBoolean_js_1 = require("../../utils/semanticBoolean.js");
var semanticNumber_js_1 = require("../../utils/semanticNumber.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        pattern: v4_1.z
            .string()
            .describe('The regular expression pattern to search for in file contents'),
        path: v4_1.z
            .string()
            .optional()
            .describe('File or directory to search in (rg PATH). Defaults to current working directory.'),
        glob: v4_1.z
            .string()
            .optional()
            .describe('Glob pattern to filter files (e.g. "*.js", "*.{ts,tsx}") - maps to rg --glob'),
        output_mode: v4_1.z
            .enum(['content', 'files_with_matches', 'count'])
            .optional()
            .describe('Output mode: "content" shows matching lines (supports -A/-B/-C context, -n line numbers, head_limit), "files_with_matches" shows file paths (supports head_limit), "count" shows match counts (supports head_limit). Defaults to "files_with_matches".'),
        '-B': (0, semanticNumber_js_1.semanticNumber)(v4_1.z.number().optional()).describe('Number of lines to show before each match (rg -B). Requires output_mode: "content", ignored otherwise.'),
        '-A': (0, semanticNumber_js_1.semanticNumber)(v4_1.z.number().optional()).describe('Number of lines to show after each match (rg -A). Requires output_mode: "content", ignored otherwise.'),
        '-C': (0, semanticNumber_js_1.semanticNumber)(v4_1.z.number().optional()).describe('Alias for context.'),
        context: (0, semanticNumber_js_1.semanticNumber)(v4_1.z.number().optional()).describe('Number of lines to show before and after each match (rg -C). Requires output_mode: "content", ignored otherwise.'),
        '-n': (0, semanticBoolean_js_1.semanticBoolean)(v4_1.z.boolean().optional()).describe('Show line numbers in output (rg -n). Requires output_mode: "content", ignored otherwise. Defaults to true.'),
        '-i': (0, semanticBoolean_js_1.semanticBoolean)(v4_1.z.boolean().optional()).describe('Case insensitive search (rg -i)'),
        type: v4_1.z
            .string()
            .optional()
            .describe('File type to search (rg --type). Common types: js, py, rust, go, java, etc. More efficient than include for standard file types.'),
        head_limit: (0, semanticNumber_js_1.semanticNumber)(v4_1.z.number().optional()).describe('Limit output to first N lines/entries, equivalent to "| head -N". Works across all output modes: content (limits output lines), files_with_matches (limits file paths), count (limits count entries). Defaults to 250 when unspecified. Pass 0 for unlimited (use sparingly — large result sets waste context).'),
        offset: (0, semanticNumber_js_1.semanticNumber)(v4_1.z.number().optional()).describe('Skip first N lines/entries before applying head_limit, equivalent to "| tail -n +N | head -N". Works across all output modes. Defaults to 0.'),
        multiline: (0, semanticBoolean_js_1.semanticBoolean)(v4_1.z.boolean().optional()).describe('Enable multiline mode where . matches newlines and patterns can span lines (rg -U --multiline-dotall). Default: false.'),
    });
});
// Version control system directories to exclude from searches
// These are excluded automatically because they create noise in search results
var VCS_DIRECTORIES_TO_EXCLUDE = [
    '.git',
    '.svn',
    '.hg',
    '.bzr',
    '.jj',
    '.sl',
];
// Default cap on grep results when head_limit is unspecified. Unbounded content-mode
// greps can fill up to the 20KB persist threshold (~6-24K tokens/grep-heavy session).
// 250 is generous enough for exploratory searches while preventing context bloat.
// Pass head_limit=0 explicitly for unlimited.
var DEFAULT_HEAD_LIMIT = 250;
function applyHeadLimit(items, limit, offset) {
    if (offset === void 0) { offset = 0; }
    // Explicit 0 = unlimited escape hatch
    if (limit === 0) {
        return { items: items.slice(offset), appliedLimit: undefined };
    }
    var effectiveLimit = limit !== null && limit !== void 0 ? limit : DEFAULT_HEAD_LIMIT;
    var sliced = items.slice(offset, offset + effectiveLimit);
    // Only report appliedLimit when truncation actually occurred, so the model
    // knows there may be more results and can paginate with offset.
    var wasTruncated = items.length - offset > effectiveLimit;
    return {
        items: sliced,
        appliedLimit: wasTruncated ? effectiveLimit : undefined,
    };
}
// Format limit/offset information for display in tool results.
// appliedLimit is only set when truncation actually occurred (see applyHeadLimit),
// so it may be undefined even when appliedOffset is set — build parts conditionally
// to avoid "limit: undefined" appearing in user-visible output.
function formatLimitInfo(appliedLimit, appliedOffset) {
    var parts = [];
    if (appliedLimit !== undefined)
        parts.push("limit: ".concat(appliedLimit));
    if (appliedOffset)
        parts.push("offset: ".concat(appliedOffset));
    return parts.join(', ');
}
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        mode: v4_1.z.enum(['content', 'files_with_matches', 'count']).optional(),
        numFiles: v4_1.z.number(),
        filenames: v4_1.z.array(v4_1.z.string()),
        content: v4_1.z.string().optional(),
        numLines: v4_1.z.number().optional(), // For content mode
        numMatches: v4_1.z.number().optional(), // For count mode
        appliedLimit: v4_1.z.number().optional(), // The limit that was applied (if any)
        appliedOffset: v4_1.z.number().optional(), // The offset that was applied
    });
});
exports.GrepTool = (0, Tool_js_1.buildTool)({
    name: prompt_js_1.GREP_TOOL_NAME,
    searchHint: 'search file contents with regex (ripgrep)',
    // 20K chars - tool result persistence threshold
    maxResultSizeChars: 20000,
    strict: true,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.getDescription)()];
            });
        });
    },
    userFacingName: function () {
        return 'Search';
    },
    getToolUseSummary: UI_js_1.getToolUseSummary,
    getActivityDescription: function (input) {
        var summary = (0, UI_js_1.getToolUseSummary)(input);
        return summary ? "Searching for ".concat(summary) : 'Searching';
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
        return input.path ? "".concat(input.pattern, " in ").concat(input.path) : input.pattern;
    },
    isSearchOrReadCommand: function () {
        return { isSearch: true, isRead: false };
    },
    getPath: function (_a) {
        var path = _a.path;
        return path || (0, cwd_js_1.getCwd)();
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
            var fs, absolutePath, e_1, cwdSuggestion, message;
            var path = _b.path;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!path) return [3 /*break*/, 6];
                        fs = (0, fsOperations_js_1.getFsImplementation)();
                        absolutePath = (0, path_js_1.expandPath)(path);
                        // SECURITY: Skip filesystem operations for UNC paths to prevent NTLM credential leaks.
                        if (absolutePath.startsWith('\\\\') || absolutePath.startsWith('//')) {
                            return [2 /*return*/, { result: true }];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 6]);
                        return [4 /*yield*/, fs.stat(absolutePath)];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        e_1 = _c.sent();
                        if (!(0, errors_js_1.isENOENT)(e_1)) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, file_js_1.suggestPathUnderCwd)(absolutePath)];
                    case 4:
                        cwdSuggestion = _c.sent();
                        message = "Path does not exist: ".concat(path, ". ").concat(file_js_1.FILE_NOT_FOUND_CWD_NOTE, " ").concat((0, cwd_js_1.getCwd)(), ".");
                        if (cwdSuggestion) {
                            message += " Did you mean ".concat(cwdSuggestion, "?");
                        }
                        return [2 /*return*/, {
                                result: false,
                                message: message,
                                errorCode: 1,
                            }];
                    case 5: throw e_1;
                    case 6: return [2 /*return*/, { result: true }];
                }
            });
        });
    },
    checkPermissions: function (input, context) {
        return __awaiter(this, void 0, void 0, function () {
            var appState;
            return __generator(this, function (_a) {
                appState = context.getAppState();
                return [2 /*return*/, (0, filesystem_js_1.checkReadPermissionForTool)(exports.GrepTool, input, appState.toolPermissionContext)];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.getDescription)()];
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolUseErrorMessage: UI_js_1.renderToolUseErrorMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    // SearchResultSummary shows content (mode=content) or filenames.join.
    // numFiles/numLines/numMatches are chrome ("Found 3 files") — fine to
    // skip (under-count, not phantom). Glob reuses this via UI.tsx:65.
    extractSearchText: function (_a) {
        var mode = _a.mode, content = _a.content, filenames = _a.filenames;
        if (mode === 'content' && content)
            return content;
        return filenames.join('\n');
    },
    mapToolResultToToolResultBlockParam: function (_a, toolUseID) {
        var _b = _a.mode, mode = _b === void 0 ? 'files_with_matches' : _b, numFiles = _a.numFiles, filenames = _a.filenames, content = _a.content, _numLines = _a.numLines, numMatches = _a.numMatches, appliedLimit = _a.appliedLimit, appliedOffset = _a.appliedOffset;
        if (mode === 'content') {
            var limitInfo_1 = formatLimitInfo(appliedLimit, appliedOffset);
            var resultContent = content || 'No matches found';
            var finalContent = limitInfo_1
                ? "".concat(resultContent, "\n\n[Showing results with pagination = ").concat(limitInfo_1, "]")
                : resultContent;
            return {
                tool_use_id: toolUseID,
                type: 'tool_result',
                content: finalContent,
            };
        }
        if (mode === 'count') {
            var limitInfo_2 = formatLimitInfo(appliedLimit, appliedOffset);
            var rawContent = content || 'No matches found';
            var matches = numMatches !== null && numMatches !== void 0 ? numMatches : 0;
            var files = numFiles !== null && numFiles !== void 0 ? numFiles : 0;
            var summary = "\n\nFound ".concat(matches, " total ").concat(matches === 1 ? 'occurrence' : 'occurrences', " across ").concat(files, " ").concat(files === 1 ? 'file' : 'files', ".").concat(limitInfo_2 ? " with pagination = ".concat(limitInfo_2) : '');
            return {
                tool_use_id: toolUseID,
                type: 'tool_result',
                content: rawContent + summary,
            };
        }
        // files_with_matches mode
        var limitInfo = formatLimitInfo(appliedLimit, appliedOffset);
        if (numFiles === 0) {
            return {
                tool_use_id: toolUseID,
                type: 'tool_result',
                content: 'No files found',
            };
        }
        // head_limit has already been applied in call() method, so just show all filenames
        var result = "Found ".concat(numFiles, " ").concat((0, stringUtils_js_1.plural)(numFiles, 'file')).concat(limitInfo ? " ".concat(limitInfo) : '', "\n").concat(filenames.join('\n'));
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: result,
        };
    },
    call: function (_a, _b) {
        return __awaiter(this, arguments, void 0, function (_c, _d) {
            var absolutePath, args, _i, VCS_DIRECTORIES_TO_EXCLUDE_1, dir, globPatterns, rawPatterns, _e, rawPatterns_1, rawPattern, _f, _g, globPattern, appState, ignorePatterns, _h, ignorePatterns_1, ignorePattern, rgIgnorePattern, _j, _k, exclusion, results, _l, limitedResults, appliedLimit_1, finalLines, output_1, _m, limitedResults, appliedLimit_2, finalCountLines, totalMatches, fileCount, _o, finalCountLines_1, line, colonIndex, countStr, count, output_2, stats, sortedMatches, _p, finalMatches, appliedLimit, relativeMatches, output;
            var pattern = _c.pattern, path = _c.path, glob = _c.glob, type = _c.type, _q = _c.output_mode, output_mode = _q === void 0 ? 'files_with_matches' : _q, context_before = _c["-B"], context_after = _c["-A"], context_c = _c["-C"], context = _c.context, _r = _c["-n"], show_line_numbers = _r === void 0 ? true : _r, _s = _c["-i"], case_insensitive = _s === void 0 ? false : _s, head_limit = _c.head_limit, _t = _c.offset, offset = _t === void 0 ? 0 : _t, _u = _c.multiline, multiline = _u === void 0 ? false : _u;
            var abortController = _d.abortController, getAppState = _d.getAppState;
            return __generator(this, function (_v) {
                switch (_v.label) {
                    case 0:
                        absolutePath = path ? (0, path_js_1.expandPath)(path) : (0, cwd_js_1.getCwd)();
                        args = ['--hidden'];
                        // Exclude VCS directories to avoid noise from version control metadata
                        for (_i = 0, VCS_DIRECTORIES_TO_EXCLUDE_1 = VCS_DIRECTORIES_TO_EXCLUDE; _i < VCS_DIRECTORIES_TO_EXCLUDE_1.length; _i++) {
                            dir = VCS_DIRECTORIES_TO_EXCLUDE_1[_i];
                            args.push('--glob', "!".concat(dir));
                        }
                        // Limit line length to prevent base64/minified content from cluttering output
                        args.push('--max-columns', '500');
                        // Only apply multiline flags when explicitly requested
                        if (multiline) {
                            args.push('-U', '--multiline-dotall');
                        }
                        // Add optional flags
                        if (case_insensitive) {
                            args.push('-i');
                        }
                        // Add output mode flags
                        if (output_mode === 'files_with_matches') {
                            args.push('-l');
                        }
                        else if (output_mode === 'count') {
                            args.push('-c');
                        }
                        // Add line numbers if requested
                        if (show_line_numbers && output_mode === 'content') {
                            args.push('-n');
                        }
                        // Add context flags (-C/context takes precedence over context_before/context_after)
                        if (output_mode === 'content') {
                            if (context !== undefined) {
                                args.push('-C', context.toString());
                            }
                            else if (context_c !== undefined) {
                                args.push('-C', context_c.toString());
                            }
                            else {
                                if (context_before !== undefined) {
                                    args.push('-B', context_before.toString());
                                }
                                if (context_after !== undefined) {
                                    args.push('-A', context_after.toString());
                                }
                            }
                        }
                        // If pattern starts with dash, use -e flag to specify it as a pattern
                        // This prevents ripgrep from interpreting it as a command-line option
                        if (pattern.startsWith('-')) {
                            args.push('-e', pattern);
                        }
                        else {
                            args.push(pattern);
                        }
                        // Add type filter if specified
                        if (type) {
                            args.push('--type', type);
                        }
                        if (glob) {
                            globPatterns = [];
                            rawPatterns = glob.split(/\s+/);
                            for (_e = 0, rawPatterns_1 = rawPatterns; _e < rawPatterns_1.length; _e++) {
                                rawPattern = rawPatterns_1[_e];
                                // If pattern contains braces, don't split further
                                if (rawPattern.includes('{') && rawPattern.includes('}')) {
                                    globPatterns.push(rawPattern);
                                }
                                else {
                                    // Split on commas for patterns without braces
                                    globPatterns.push.apply(globPatterns, rawPattern.split(',').filter(Boolean));
                                }
                            }
                            for (_f = 0, _g = globPatterns.filter(Boolean); _f < _g.length; _f++) {
                                globPattern = _g[_f];
                                args.push('--glob', globPattern);
                            }
                        }
                        appState = getAppState();
                        ignorePatterns = (0, filesystem_js_1.normalizePatternsToPath)((0, filesystem_js_1.getFileReadIgnorePatterns)(appState.toolPermissionContext), (0, cwd_js_1.getCwd)());
                        for (_h = 0, ignorePatterns_1 = ignorePatterns; _h < ignorePatterns_1.length; _h++) {
                            ignorePattern = ignorePatterns_1[_h];
                            rgIgnorePattern = ignorePattern.startsWith('/')
                                ? "!".concat(ignorePattern)
                                : "!**/".concat(ignorePattern);
                            args.push('--glob', rgIgnorePattern);
                        }
                        _j = 0;
                        return [4 /*yield*/, (0, orphanedPluginFilter_js_1.getGlobExclusionsForPluginCache)(absolutePath)];
                    case 1:
                        _k = _v.sent();
                        _v.label = 2;
                    case 2:
                        if (!(_j < _k.length)) return [3 /*break*/, 4];
                        exclusion = _k[_j];
                        args.push('--glob', exclusion);
                        _v.label = 3;
                    case 3:
                        _j++;
                        return [3 /*break*/, 2];
                    case 4: return [4 /*yield*/, (0, ripgrep_js_1.ripGrep)(args, absolutePath, abortController.signal)];
                    case 5:
                        results = _v.sent();
                        if (output_mode === 'content') {
                            _l = applyHeadLimit(results, head_limit, offset), limitedResults = _l.items, appliedLimit_1 = _l.appliedLimit;
                            finalLines = limitedResults.map(function (line) {
                                // Lines have format: /absolute/path:line_content or /absolute/path:num:content
                                var colonIndex = line.indexOf(':');
                                if (colonIndex > 0) {
                                    var filePath = line.substring(0, colonIndex);
                                    var rest = line.substring(colonIndex);
                                    return (0, path_js_1.toRelativePath)(filePath) + rest;
                                }
                                return line;
                            });
                            output_1 = __assign(__assign({ mode: 'content', numFiles: 0, filenames: [], content: finalLines.join('\n'), numLines: finalLines.length }, (appliedLimit_1 !== undefined && { appliedLimit: appliedLimit_1 })), (offset > 0 && { appliedOffset: offset }));
                            return [2 /*return*/, { data: output_1 }];
                        }
                        if (output_mode === 'count') {
                            _m = applyHeadLimit(results, head_limit, offset), limitedResults = _m.items, appliedLimit_2 = _m.appliedLimit;
                            finalCountLines = limitedResults.map(function (line) {
                                // Lines have format: /absolute/path:count
                                var colonIndex = line.lastIndexOf(':');
                                if (colonIndex > 0) {
                                    var filePath = line.substring(0, colonIndex);
                                    var count = line.substring(colonIndex);
                                    return (0, path_js_1.toRelativePath)(filePath) + count;
                                }
                                return line;
                            });
                            totalMatches = 0;
                            fileCount = 0;
                            for (_o = 0, finalCountLines_1 = finalCountLines; _o < finalCountLines_1.length; _o++) {
                                line = finalCountLines_1[_o];
                                colonIndex = line.lastIndexOf(':');
                                if (colonIndex > 0) {
                                    countStr = line.substring(colonIndex + 1);
                                    count = parseInt(countStr, 10);
                                    if (!isNaN(count)) {
                                        totalMatches += count;
                                        fileCount += 1;
                                    }
                                }
                            }
                            output_2 = __assign(__assign({ mode: 'count', numFiles: fileCount, filenames: [], content: finalCountLines.join('\n'), numMatches: totalMatches }, (appliedLimit_2 !== undefined && { appliedLimit: appliedLimit_2 })), (offset > 0 && { appliedOffset: offset }));
                            return [2 /*return*/, { data: output_2 }];
                        }
                        return [4 /*yield*/, Promise.allSettled(results.map(function (_) { return (0, fsOperations_js_1.getFsImplementation)().stat(_); }))];
                    case 6:
                        stats = _v.sent();
                        sortedMatches = results
                            // Sort by modification time
                            .map(function (_, i) {
                            var _a;
                            var r = stats[i];
                            return [
                                _,
                                r.status === 'fulfilled' ? ((_a = r.value.mtimeMs) !== null && _a !== void 0 ? _a : 0) : 0,
                            ];
                        })
                            .sort(function (a, b) {
                            if (process.env.NODE_ENV === 'test') {
                                // In tests, we always want to sort by filename, so that results are deterministic
                                return a[0].localeCompare(b[0]);
                            }
                            var timeComparison = b[1] - a[1];
                            if (timeComparison === 0) {
                                // Sort by filename as a tiebreaker
                                return a[0].localeCompare(b[0]);
                            }
                            return timeComparison;
                        })
                            .map(function (_) { return _[0]; });
                        _p = applyHeadLimit(sortedMatches, head_limit, offset), finalMatches = _p.items, appliedLimit = _p.appliedLimit;
                        relativeMatches = finalMatches.map(path_js_1.toRelativePath);
                        output = __assign(__assign({ mode: 'files_with_matches', filenames: relativeMatches, numFiles: relativeMatches.length }, (appliedLimit !== undefined && { appliedLimit: appliedLimit })), (offset > 0 && { appliedOffset: offset }));
                        return [2 /*return*/, {
                                data: output,
                            }];
                }
            });
        });
    },
});
