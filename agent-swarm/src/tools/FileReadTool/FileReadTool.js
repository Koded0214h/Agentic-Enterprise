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
exports.CYBER_RISK_MITIGATION_REMINDER = exports.FileReadTool = exports.MaxFileReadTokenExceededError = void 0;
exports.registerFileReadListener = registerFileReadListener;
exports.readImageWithTokenBudget = readImageWithTokenBudget;
var promises_1 = require("fs/promises");
var path = require("path");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var apiLimits_js_1 = require("../../constants/apiLimits.js");
var files_js_1 = require("../../constants/files.js");
var memoryAge_js_1 = require("../../memdir/memoryAge.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/analytics/index.js");
var metadata_js_1 = require("../../services/analytics/metadata.js");
var tokenEstimation_js_1 = require("../../services/tokenEstimation.js");
var loadSkillsDir_js_1 = require("../../skills/loadSkillsDir.js");
var Tool_js_1 = require("../../Tool.js");
var cwd_js_1 = require("../../utils/cwd.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var file_js_1 = require("../../utils/file.js");
var fileOperationAnalytics_js_1 = require("../../utils/fileOperationAnalytics.js");
var format_js_1 = require("../../utils/format.js");
var fsOperations_js_1 = require("../../utils/fsOperations.js");
var imageResizer_js_1 = require("../../utils/imageResizer.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var log_js_1 = require("../../utils/log.js");
var memoryFileDetection_js_1 = require("../../utils/memoryFileDetection.js");
var messages_js_1 = require("../../utils/messages.js");
var model_js_1 = require("../../utils/model/model.js");
var notebook_js_1 = require("../../utils/notebook.js");
var path_js_1 = require("../../utils/path.js");
var pdf_js_1 = require("../../utils/pdf.js");
var pdfUtils_js_1 = require("../../utils/pdfUtils.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
var shellRuleMatching_js_1 = require("../../utils/permissions/shellRuleMatching.js");
var readFileInRange_js_1 = require("../../utils/readFileInRange.js");
var semanticNumber_js_1 = require("../../utils/semanticNumber.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var toolName_js_1 = require("../BashTool/toolName.js");
var limits_js_1 = require("./limits.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
// Device files that would hang the process: infinite output or blocking input.
// Checked by path only (no I/O). Safe devices like /dev/null are intentionally omitted.
var BLOCKED_DEVICE_PATHS = new Set([
    // Infinite output — never reach EOF
    '/dev/zero',
    '/dev/random',
    '/dev/urandom',
    '/dev/full',
    // Blocks waiting for input
    '/dev/stdin',
    '/dev/tty',
    '/dev/console',
    // Nonsensical to read
    '/dev/stdout',
    '/dev/stderr',
    // fd aliases for stdin/stdout/stderr
    '/dev/fd/0',
    '/dev/fd/1',
    '/dev/fd/2',
]);
function isBlockedDevicePath(filePath) {
    if (BLOCKED_DEVICE_PATHS.has(filePath))
        return true;
    // /proc/self/fd/0-2 and /proc/<pid>/fd/0-2 are Linux aliases for stdio
    if (filePath.startsWith('/proc/') &&
        (filePath.endsWith('/fd/0') ||
            filePath.endsWith('/fd/1') ||
            filePath.endsWith('/fd/2')))
        return true;
    return false;
}
// Narrow no-break space (U+202F) used by some macOS versions in screenshot filenames
var THIN_SPACE = String.fromCharCode(8239);
/**
 * Resolves macOS screenshot paths that may have different space characters.
 * macOS uses either regular space or thin space (U+202F) before AM/PM in screenshot
 * filenames depending on the macOS version. This function tries the alternate space
 * character if the file doesn't exist with the given path.
 *
 * @param filePath - The normalized file path to resolve
 * @returns The path to the actual file on disk (may differ in space character)
 */
/**
 * For macOS screenshot paths with AM/PM, the space before AM/PM may be a
 * regular space or a thin space depending on the macOS version.  Returns
 * the alternate path to try if the original doesn't exist, or undefined.
 */
function getAlternateScreenshotPath(filePath) {
    var filename = path.basename(filePath);
    var amPmPattern = /^(.+)([ \u202F])(AM|PM)(\.png)$/;
    var match = filename.match(amPmPattern);
    if (!match)
        return undefined;
    var currentSpace = match[2];
    var alternateSpace = currentSpace === ' ' ? THIN_SPACE : ' ';
    return filePath.replace("".concat(currentSpace).concat(match[3]).concat(match[4]), "".concat(alternateSpace).concat(match[3]).concat(match[4]));
}
var fileReadListeners = [];
function registerFileReadListener(listener) {
    fileReadListeners.push(listener);
    return function () {
        var i = fileReadListeners.indexOf(listener);
        if (i >= 0)
            fileReadListeners.splice(i, 1);
    };
}
var MaxFileReadTokenExceededError = /** @class */ (function (_super) {
    __extends(MaxFileReadTokenExceededError, _super);
    function MaxFileReadTokenExceededError(tokenCount, maxTokens) {
        var _this = _super.call(this, "File content (".concat(tokenCount, " tokens) exceeds maximum allowed tokens (").concat(maxTokens, "). Use offset and limit parameters to read specific portions of the file, or search for specific content instead of reading the whole file.")) || this;
        _this.tokenCount = tokenCount;
        _this.maxTokens = maxTokens;
        _this.name = 'MaxFileReadTokenExceededError';
        return _this;
    }
    return MaxFileReadTokenExceededError;
}(Error));
exports.MaxFileReadTokenExceededError = MaxFileReadTokenExceededError;
// Common image extensions
var IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp']);
/**
 * Detects if a file path is a session-related file for analytics logging.
 * Only matches files within the Claude config directory (e.g., ~/.claude).
 * Returns the type of session file or null if not a session file.
 */
function detectSessionFileType(filePath) {
    var configDir = (0, envUtils_js_1.getClaudeConfigHomeDir)();
    // Only match files within the Claude config directory
    if (!filePath.startsWith(configDir)) {
        return null;
    }
    // Normalize path to use forward slashes for consistent matching across platforms
    var normalizedPath = filePath.split(path_1.win32.sep).join(path_1.posix.sep);
    // Session memory files: ~/.claude/session-memory/*.md (including summary.md)
    if (normalizedPath.includes('/session-memory/') &&
        normalizedPath.endsWith('.md')) {
        return 'session_memory';
    }
    // Session JSONL transcript files: ~/.claude/projects/*/*.jsonl
    if (normalizedPath.includes('/projects/') &&
        normalizedPath.endsWith('.jsonl')) {
        return 'session_transcript';
    }
    return null;
}
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        file_path: v4_1.z.string().describe('The absolute path to the file to read'),
        offset: (0, semanticNumber_js_1.semanticNumber)(v4_1.z.number().int().nonnegative().optional()).describe('The line number to start reading from. Only provide if the file is too large to read at once'),
        limit: (0, semanticNumber_js_1.semanticNumber)(v4_1.z.number().int().positive().optional()).describe('The number of lines to read. Only provide if the file is too large to read at once.'),
        pages: v4_1.z
            .string()
            .optional()
            .describe("Page range for PDF files (e.g., \"1-5\", \"3\", \"10-20\"). Only applicable to PDF files. Maximum ".concat(apiLimits_js_1.PDF_MAX_PAGES_PER_READ, " pages per request.")),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    // Define the media types supported for images
    var imageMediaTypes = v4_1.z.enum([
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ]);
    return v4_1.z.discriminatedUnion('type', [
        v4_1.z.object({
            type: v4_1.z.literal('text'),
            file: v4_1.z.object({
                filePath: v4_1.z.string().describe('The path to the file that was read'),
                content: v4_1.z.string().describe('The content of the file'),
                numLines: v4_1.z
                    .number()
                    .describe('Number of lines in the returned content'),
                startLine: v4_1.z.number().describe('The starting line number'),
                totalLines: v4_1.z.number().describe('Total number of lines in the file'),
            }),
        }),
        v4_1.z.object({
            type: v4_1.z.literal('image'),
            file: v4_1.z.object({
                base64: v4_1.z.string().describe('Base64-encoded image data'),
                type: imageMediaTypes.describe('The MIME type of the image'),
                originalSize: v4_1.z.number().describe('Original file size in bytes'),
                dimensions: v4_1.z
                    .object({
                    originalWidth: v4_1.z
                        .number()
                        .optional()
                        .describe('Original image width in pixels'),
                    originalHeight: v4_1.z
                        .number()
                        .optional()
                        .describe('Original image height in pixels'),
                    displayWidth: v4_1.z
                        .number()
                        .optional()
                        .describe('Displayed image width in pixels (after resizing)'),
                    displayHeight: v4_1.z
                        .number()
                        .optional()
                        .describe('Displayed image height in pixels (after resizing)'),
                })
                    .optional()
                    .describe('Image dimension info for coordinate mapping'),
            }),
        }),
        v4_1.z.object({
            type: v4_1.z.literal('notebook'),
            file: v4_1.z.object({
                filePath: v4_1.z.string().describe('The path to the notebook file'),
                cells: v4_1.z.array(v4_1.z.any()).describe('Array of notebook cells'),
            }),
        }),
        v4_1.z.object({
            type: v4_1.z.literal('pdf'),
            file: v4_1.z.object({
                filePath: v4_1.z.string().describe('The path to the PDF file'),
                base64: v4_1.z.string().describe('Base64-encoded PDF data'),
                originalSize: v4_1.z.number().describe('Original file size in bytes'),
            }),
        }),
        v4_1.z.object({
            type: v4_1.z.literal('parts'),
            file: v4_1.z.object({
                filePath: v4_1.z.string().describe('The path to the PDF file'),
                originalSize: v4_1.z.number().describe('Original file size in bytes'),
                count: v4_1.z.number().describe('Number of pages extracted'),
                outputDir: v4_1.z
                    .string()
                    .describe('Directory containing extracted page images'),
            }),
        }),
        v4_1.z.object({
            type: v4_1.z.literal('file_unchanged'),
            file: v4_1.z.object({
                filePath: v4_1.z.string().describe('The path to the file'),
            }),
        }),
    ]);
});
exports.FileReadTool = (0, Tool_js_1.buildTool)({
    name: prompt_js_1.FILE_READ_TOOL_NAME,
    searchHint: 'read files, images, PDFs, notebooks',
    // Output is bounded by maxTokens (validateContentTokens). Persisting to a
    // file the model reads back with Read is circular — never persist.
    maxResultSizeChars: Infinity,
    strict: true,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.DESCRIPTION];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            var limits, maxSizeInstruction, offsetInstruction;
            return __generator(this, function (_a) {
                limits = (0, limits_js_1.getDefaultFileReadingLimits)();
                maxSizeInstruction = limits.includeMaxSizeInPrompt
                    ? ". Files larger than ".concat((0, format_js_1.formatFileSize)(limits.maxSizeBytes), " will return an error; use offset and limit for larger files")
                    : '';
                offsetInstruction = limits.targetedRangeNudge
                    ? prompt_js_1.OFFSET_INSTRUCTION_TARGETED
                    : prompt_js_1.OFFSET_INSTRUCTION_DEFAULT;
                return [2 /*return*/, (0, prompt_js_1.renderPromptTemplate)(pickLineFormatInstruction(), maxSizeInstruction, offsetInstruction)];
            });
        });
    },
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    userFacingName: UI_js_1.userFacingName,
    getToolUseSummary: UI_js_1.getToolUseSummary,
    getActivityDescription: function (input) {
        var summary = (0, UI_js_1.getToolUseSummary)(input);
        return summary ? "Reading ".concat(summary) : 'Reading file';
    },
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return true;
    },
    toAutoClassifierInput: function (input) {
        return input.file_path;
    },
    isSearchOrReadCommand: function () {
        return { isSearch: false, isRead: true };
    },
    getPath: function (_a) {
        var file_path = _a.file_path;
        return file_path || (0, cwd_js_1.getCwd)();
    },
    backfillObservableInput: function (input) {
        // hooks.mdx documents file_path as absolute; expand so hook allowlists
        // can't be bypassed via ~ or relative paths.
        if (typeof input.file_path === 'string') {
            input.file_path = (0, path_js_1.expandPath)(input.file_path);
        }
    },
    preparePermissionMatcher: function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var file_path = _b.file_path;
            return __generator(this, function (_c) {
                return [2 /*return*/, function (pattern) { return (0, shellRuleMatching_js_1.matchWildcardPattern)(pattern, file_path); }];
            });
        });
    },
    checkPermissions: function (input, context) {
        return __awaiter(this, void 0, void 0, function () {
            var appState;
            return __generator(this, function (_a) {
                appState = context.getAppState();
                return [2 /*return*/, (0, filesystem_js_1.checkReadPermissionForTool)(exports.FileReadTool, input, appState.toolPermissionContext)];
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolUseTag: UI_js_1.renderToolUseTag,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    // UI.tsx:140 — ALL types render summary chrome only: "Read N lines",
    // "Read image (42KB)". Never the content itself. The model-facing
    // serialization (below) sends content + CYBER_RISK_MITIGATION_REMINDER
    // + line prefixes; UI shows none of it. Nothing to index. Caught by
    // the render-fidelity test when this initially claimed file.content.
    extractSearchText: function () {
        return '';
    },
    renderToolUseErrorMessage: UI_js_1.renderToolUseErrorMessage,
    validateInput: function (_a, toolUseContext_1) {
        return __awaiter(this, arguments, void 0, function (_b, toolUseContext) {
            var parsed, rangeSize, fullFilePath, appState, denyRule, isUncPath, ext;
            var file_path = _b.file_path, pages = _b.pages;
            return __generator(this, function (_c) {
                // Validate pages parameter (pure string parsing, no I/O)
                if (pages !== undefined) {
                    parsed = (0, pdfUtils_js_1.parsePDFPageRange)(pages);
                    if (!parsed) {
                        return [2 /*return*/, {
                                result: false,
                                message: "Invalid pages parameter: \"".concat(pages, "\". Use formats like \"1-5\", \"3\", or \"10-20\". Pages are 1-indexed."),
                                errorCode: 7,
                            }];
                    }
                    rangeSize = parsed.lastPage === Infinity
                        ? apiLimits_js_1.PDF_MAX_PAGES_PER_READ + 1
                        : parsed.lastPage - parsed.firstPage + 1;
                    if (rangeSize > apiLimits_js_1.PDF_MAX_PAGES_PER_READ) {
                        return [2 /*return*/, {
                                result: false,
                                message: "Page range \"".concat(pages, "\" exceeds maximum of ").concat(apiLimits_js_1.PDF_MAX_PAGES_PER_READ, " pages per request. Please use a smaller range."),
                                errorCode: 8,
                            }];
                    }
                }
                fullFilePath = (0, path_js_1.expandPath)(file_path);
                appState = toolUseContext.getAppState();
                denyRule = (0, filesystem_js_1.matchingRuleForInput)(fullFilePath, appState.toolPermissionContext, 'read', 'deny');
                if (denyRule !== null) {
                    return [2 /*return*/, {
                            result: false,
                            message: 'File is in a directory that is denied by your permission settings.',
                            errorCode: 1,
                        }];
                }
                isUncPath = fullFilePath.startsWith('\\\\') || fullFilePath.startsWith('//');
                if (isUncPath) {
                    return [2 /*return*/, { result: true }];
                }
                ext = path.extname(fullFilePath).toLowerCase();
                if ((0, files_js_1.hasBinaryExtension)(fullFilePath) &&
                    !(0, pdfUtils_js_1.isPDFExtension)(ext) &&
                    !IMAGE_EXTENSIONS.has(ext.slice(1))) {
                    return [2 /*return*/, {
                            result: false,
                            message: "This tool cannot read binary files. The file appears to be a binary ".concat(ext, " file. Please use appropriate tools for binary file analysis."),
                            errorCode: 4,
                        }];
                }
                // Block specific device files that would hang (infinite output or blocking input).
                // This is a path-based check with no I/O — safe special files like /dev/null are allowed.
                if (isBlockedDevicePath(fullFilePath)) {
                    return [2 /*return*/, {
                            result: false,
                            message: "Cannot read '".concat(file_path, "': this device file would block or produce infinite output."),
                            errorCode: 9,
                        }];
                }
                return [2 /*return*/, { result: true }];
            });
        });
    },
    call: function (_a, context_1, _canUseTool_1, parentMessage_1) {
        return __awaiter(this, arguments, void 0, function (_b, context, _canUseTool, parentMessage) {
            var readFileState, fileReadingLimits, defaults, maxSizeBytes, maxTokens, ext, fullFilePath, dedupKillswitch, existingState, rangeMatch, mtimeMs, analyticsExt, _c, cwd, newSkillDirs, _i, newSkillDirs_1, dir, error_1, code, altPath, altError_1, similarFilename, cwdSuggestion, message;
            var _d, _e, _f;
            var file_path = _b.file_path, _g = _b.offset, offset = _g === void 0 ? 1 : _g, _h = _b.limit, limit = _h === void 0 ? undefined : _h, pages = _b.pages;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        readFileState = context.readFileState, fileReadingLimits = context.fileReadingLimits;
                        defaults = (0, limits_js_1.getDefaultFileReadingLimits)();
                        maxSizeBytes = (_d = fileReadingLimits === null || fileReadingLimits === void 0 ? void 0 : fileReadingLimits.maxSizeBytes) !== null && _d !== void 0 ? _d : defaults.maxSizeBytes;
                        maxTokens = (_e = fileReadingLimits === null || fileReadingLimits === void 0 ? void 0 : fileReadingLimits.maxTokens) !== null && _e !== void 0 ? _e : defaults.maxTokens;
                        // Telemetry: track when callers override default read limits.
                        // Only fires on override (low volume) — event count = override frequency.
                        if (fileReadingLimits !== undefined) {
                            (0, index_js_1.logEvent)('tengu_file_read_limits_override', {
                                hasMaxTokens: fileReadingLimits.maxTokens !== undefined,
                                hasMaxSizeBytes: fileReadingLimits.maxSizeBytes !== undefined,
                            });
                        }
                        ext = path.extname(file_path).toLowerCase().slice(1);
                        fullFilePath = (0, path_js_1.expandPath)(file_path);
                        dedupKillswitch = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_read_dedup_killswitch', false);
                        existingState = dedupKillswitch
                            ? undefined
                            : readFileState.get(fullFilePath);
                        if (!(existingState &&
                            !existingState.isPartialView &&
                            existingState.offset !== undefined)) return [3 /*break*/, 4];
                        rangeMatch = existingState.offset === offset && existingState.limit === limit;
                        if (!rangeMatch) return [3 /*break*/, 4];
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, file_js_1.getFileModificationTimeAsync)(fullFilePath)];
                    case 2:
                        mtimeMs = _j.sent();
                        if (mtimeMs === existingState.timestamp) {
                            analyticsExt = (0, metadata_js_1.getFileExtensionForAnalytics)(fullFilePath);
                            (0, index_js_1.logEvent)('tengu_file_read_dedup', __assign({}, (analyticsExt !== undefined && { ext: analyticsExt })));
                            return [2 /*return*/, {
                                    data: {
                                        type: 'file_unchanged',
                                        file: { filePath: file_path },
                                    },
                                }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _c = _j.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        cwd = (0, cwd_js_1.getCwd)();
                        if (!!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SIMPLE)) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, loadSkillsDir_js_1.discoverSkillDirsForPaths)([fullFilePath], cwd)];
                    case 5:
                        newSkillDirs = _j.sent();
                        if (newSkillDirs.length > 0) {
                            // Store discovered dirs for attachment display
                            for (_i = 0, newSkillDirs_1 = newSkillDirs; _i < newSkillDirs_1.length; _i++) {
                                dir = newSkillDirs_1[_i];
                                (_f = context.dynamicSkillDirTriggers) === null || _f === void 0 ? void 0 : _f.add(dir);
                            }
                            // Don't await - let skill loading happen in the background
                            (0, loadSkillsDir_js_1.addSkillDirectories)(newSkillDirs).catch(function () { });
                        }
                        // Activate conditional skills whose path patterns match this file
                        (0, loadSkillsDir_js_1.activateConditionalSkillsForPaths)([fullFilePath], cwd);
                        _j.label = 6;
                    case 6:
                        _j.trys.push([6, 8, , 15]);
                        return [4 /*yield*/, callInner(file_path, fullFilePath, fullFilePath, ext, offset, limit, pages, maxSizeBytes, maxTokens, readFileState, context, parentMessage === null || parentMessage === void 0 ? void 0 : parentMessage.message.id)];
                    case 7: return [2 /*return*/, _j.sent()];
                    case 8:
                        error_1 = _j.sent();
                        code = (0, errors_js_1.getErrnoCode)(error_1);
                        if (!(code === 'ENOENT')) return [3 /*break*/, 14];
                        altPath = getAlternateScreenshotPath(fullFilePath);
                        if (!altPath) return [3 /*break*/, 12];
                        _j.label = 9;
                    case 9:
                        _j.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, callInner(file_path, fullFilePath, altPath, ext, offset, limit, pages, maxSizeBytes, maxTokens, readFileState, context, parentMessage === null || parentMessage === void 0 ? void 0 : parentMessage.message.id)];
                    case 10: return [2 /*return*/, _j.sent()];
                    case 11:
                        altError_1 = _j.sent();
                        if (!(0, errors_js_1.isENOENT)(altError_1)) {
                            throw altError_1;
                        }
                        return [3 /*break*/, 12];
                    case 12:
                        similarFilename = (0, file_js_1.findSimilarFile)(fullFilePath);
                        return [4 /*yield*/, (0, file_js_1.suggestPathUnderCwd)(fullFilePath)];
                    case 13:
                        cwdSuggestion = _j.sent();
                        message = "File does not exist. ".concat(file_js_1.FILE_NOT_FOUND_CWD_NOTE, " ").concat((0, cwd_js_1.getCwd)(), ".");
                        if (cwdSuggestion) {
                            message += " Did you mean ".concat(cwdSuggestion, "?");
                        }
                        else if (similarFilename) {
                            message += " Did you mean ".concat(similarFilename, "?");
                        }
                        throw new Error(message);
                    case 14: throw error_1;
                    case 15: return [2 /*return*/];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (data, toolUseID) {
        switch (data.type) {
            case 'image': {
                return {
                    tool_use_id: toolUseID,
                    type: 'tool_result',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                data: data.file.base64,
                                media_type: data.file.type,
                            },
                        },
                    ],
                };
            }
            case 'notebook':
                return (0, notebook_js_1.mapNotebookCellsToToolResult)(data.file.cells, toolUseID);
            case 'pdf':
                // Return PDF metadata only - the actual content is sent as a supplemental DocumentBlockParam
                return {
                    tool_use_id: toolUseID,
                    type: 'tool_result',
                    content: "PDF file read: ".concat(data.file.filePath, " (").concat((0, format_js_1.formatFileSize)(data.file.originalSize), ")"),
                };
            case 'parts':
                // Extracted page images are read and sent as image blocks in mapToolResultToAPIMessage
                return {
                    tool_use_id: toolUseID,
                    type: 'tool_result',
                    content: "PDF pages extracted: ".concat(data.file.count, " page(s) from ").concat(data.file.filePath, " (").concat((0, format_js_1.formatFileSize)(data.file.originalSize), ")"),
                };
            case 'file_unchanged':
                return {
                    tool_use_id: toolUseID,
                    type: 'tool_result',
                    content: prompt_js_1.FILE_UNCHANGED_STUB,
                };
            case 'text': {
                var content = void 0;
                if (data.file.content) {
                    content =
                        memoryFileFreshnessPrefix(data) +
                            formatFileLines(data.file) +
                            (shouldIncludeFileReadMitigation()
                                ? exports.CYBER_RISK_MITIGATION_REMINDER
                                : '');
                }
                else {
                    // Determine the appropriate warning message
                    content =
                        data.file.totalLines === 0
                            ? '<system-reminder>Warning: the file exists but the contents are empty.</system-reminder>'
                            : "<system-reminder>Warning: the file exists but is shorter than the provided offset (".concat(data.file.startLine, "). The file has ").concat(data.file.totalLines, " lines.</system-reminder>");
                }
                return {
                    tool_use_id: toolUseID,
                    type: 'tool_result',
                    content: content,
                };
            }
        }
    },
});
function pickLineFormatInstruction() {
    return prompt_js_1.LINE_FORMAT_INSTRUCTION;
}
/** Format file content with line numbers. */
function formatFileLines(file) {
    return (0, file_js_1.addLineNumbers)(file);
}
exports.CYBER_RISK_MITIGATION_REMINDER = '\n\n<system-reminder>\nWhenever you read a file, you should consider whether it would be considered malware. You CAN and SHOULD provide analysis of malware, what it is doing. But you MUST refuse to improve or augment the code. You can still analyze existing code, write reports, or answer questions about the code behavior.\n</system-reminder>\n';
// Models where cyber risk mitigation should be skipped
var MITIGATION_EXEMPT_MODELS = new Set(['claude-opus-4-6']);
function shouldIncludeFileReadMitigation() {
    var shortName = (0, model_js_1.getCanonicalName)((0, model_js_1.getMainLoopModel)());
    return !MITIGATION_EXEMPT_MODELS.has(shortName);
}
/**
 * Side-channel from call() to mapToolResultToToolResultBlockParam: mtime
 * of auto-memory files, keyed by the `data` object identity. Avoids
 * adding a presentation-only field to the output schema (which flows
 * into SDK types) and avoids sync fs in the mapper. WeakMap auto-GCs
 * when the data object becomes unreachable after rendering.
 */
var memoryFileMtimes = new WeakMap();
function memoryFileFreshnessPrefix(data) {
    var mtimeMs = memoryFileMtimes.get(data);
    if (mtimeMs === undefined)
        return '';
    return (0, memoryAge_js_1.memoryFreshnessNote)(mtimeMs);
}
function validateContentTokens(content, ext, maxTokens) {
    return __awaiter(this, void 0, void 0, function () {
        var effectiveMaxTokens, tokenEstimate, tokenCount, effectiveCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    effectiveMaxTokens = maxTokens !== null && maxTokens !== void 0 ? maxTokens : (0, limits_js_1.getDefaultFileReadingLimits)().maxTokens;
                    tokenEstimate = (0, tokenEstimation_js_1.roughTokenCountEstimationForFileType)(content, ext);
                    if (!tokenEstimate || tokenEstimate <= effectiveMaxTokens / 4)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, tokenEstimation_js_1.countTokensWithAPI)(content)];
                case 1:
                    tokenCount = _a.sent();
                    effectiveCount = tokenCount !== null && tokenCount !== void 0 ? tokenCount : tokenEstimate;
                    if (effectiveCount > effectiveMaxTokens) {
                        throw new MaxFileReadTokenExceededError(effectiveCount, effectiveMaxTokens);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function createImageResponse(buffer, mediaType, originalSize, dimensions) {
    return {
        type: 'image',
        file: {
            base64: buffer.toString('base64'),
            type: "image/".concat(mediaType),
            originalSize: originalSize,
            dimensions: dimensions,
        },
    };
}
/**
 * Inner implementation of call, separated to allow ENOENT handling in the outer call.
 */
function callInner(file_path, fullFilePath, resolvedFilePath, ext, offset, limit, pages, maxSizeBytes, maxTokens, readFileState, context, messageId) {
    return __awaiter(this, void 0, void 0, function () {
        var cells, cellsJson, cellsJsonBytes, stats, data_1, data_2, metadataText, parsedRange, extractResult_1, entries, imageFiles, imageBlocks, pageCount, fs, stats, shouldExtractPages, extractResult, readResult, pdfData, lineOffset, _a, content, lineCount, totalLines, totalBytes, readBytes, mtimeMs, _i, _b, listener, data, sessionFileType, analyticsExt;
        var _this = this;
        var _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!(ext === 'ipynb')) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, notebook_js_1.readNotebook)(resolvedFilePath)];
                case 1:
                    cells = _f.sent();
                    cellsJson = (0, slowOperations_js_1.jsonStringify)(cells);
                    cellsJsonBytes = Buffer.byteLength(cellsJson);
                    if (cellsJsonBytes > maxSizeBytes) {
                        throw new Error("Notebook content (".concat((0, format_js_1.formatFileSize)(cellsJsonBytes), ") exceeds maximum allowed size (").concat((0, format_js_1.formatFileSize)(maxSizeBytes), "). ") +
                            "Use ".concat(toolName_js_1.BASH_TOOL_NAME, " with jq to read specific portions:\n") +
                            "  cat \"".concat(file_path, "\" | jq '.cells[:20]' # First 20 cells\n") +
                            "  cat \"".concat(file_path, "\" | jq '.cells[100:120]' # Cells 100-120\n") +
                            "  cat \"".concat(file_path, "\" | jq '.cells | length' # Count total cells\n") +
                            "  cat \"".concat(file_path, "\" | jq '.cells[] | select(.cell_type==\"code\") | .source' # All code sources"));
                    }
                    return [4 /*yield*/, validateContentTokens(cellsJson, ext, maxTokens)
                        // Get mtime via async stat (single call, no prior existence check)
                    ];
                case 2:
                    _f.sent();
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().stat(resolvedFilePath)];
                case 3:
                    stats = _f.sent();
                    readFileState.set(fullFilePath, {
                        content: cellsJson,
                        timestamp: Math.floor(stats.mtimeMs),
                        offset: offset,
                        limit: limit,
                    });
                    (_c = context.nestedMemoryAttachmentTriggers) === null || _c === void 0 ? void 0 : _c.add(fullFilePath);
                    data_1 = {
                        type: 'notebook',
                        file: { filePath: file_path, cells: cells },
                    };
                    (0, fileOperationAnalytics_js_1.logFileOperation)({
                        operation: 'read',
                        tool: 'FileReadTool',
                        filePath: fullFilePath,
                        content: cellsJson,
                    });
                    return [2 /*return*/, { data: data_1 }];
                case 4:
                    if (!IMAGE_EXTENSIONS.has(ext)) return [3 /*break*/, 6];
                    return [4 /*yield*/, readImageWithTokenBudget(resolvedFilePath, maxTokens)];
                case 5:
                    data_2 = _f.sent();
                    (_d = context.nestedMemoryAttachmentTriggers) === null || _d === void 0 ? void 0 : _d.add(fullFilePath);
                    (0, fileOperationAnalytics_js_1.logFileOperation)({
                        operation: 'read',
                        tool: 'FileReadTool',
                        filePath: fullFilePath,
                        content: data_2.file.base64,
                    });
                    metadataText = data_2.file.dimensions
                        ? (0, imageResizer_js_1.createImageMetadataText)(data_2.file.dimensions)
                        : null;
                    return [2 /*return*/, __assign({ data: data_2 }, (metadataText && {
                            newMessages: [
                                (0, messages_js_1.createUserMessage)({ content: metadataText, isMeta: true }),
                            ],
                        }))];
                case 6:
                    if (!(0, pdfUtils_js_1.isPDFExtension)(ext)) return [3 /*break*/, 16];
                    if (!pages) return [3 /*break*/, 10];
                    parsedRange = (0, pdfUtils_js_1.parsePDFPageRange)(pages);
                    return [4 /*yield*/, (0, pdf_js_1.extractPDFPages)(resolvedFilePath, parsedRange !== null && parsedRange !== void 0 ? parsedRange : undefined)];
                case 7:
                    extractResult_1 = _f.sent();
                    if (!extractResult_1.success) {
                        throw new Error(extractResult_1.error.message);
                    }
                    (0, index_js_1.logEvent)('tengu_pdf_page_extraction', {
                        success: true,
                        pageCount: extractResult_1.data.file.count,
                        fileSize: extractResult_1.data.file.originalSize,
                        hasPageRange: true,
                    });
                    (0, fileOperationAnalytics_js_1.logFileOperation)({
                        operation: 'read',
                        tool: 'FileReadTool',
                        filePath: fullFilePath,
                        content: "PDF pages ".concat(pages),
                    });
                    return [4 /*yield*/, (0, promises_1.readdir)(extractResult_1.data.file.outputDir)];
                case 8:
                    entries = _f.sent();
                    imageFiles = entries.filter(function (f) { return f.endsWith('.jpg'); }).sort();
                    return [4 /*yield*/, Promise.all(imageFiles.map(function (f) { return __awaiter(_this, void 0, void 0, function () {
                            var imgPath, imgBuffer, resized;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        imgPath = path.join(extractResult_1.data.file.outputDir, f);
                                        return [4 /*yield*/, (0, promises_1.readFile)(imgPath)];
                                    case 1:
                                        imgBuffer = _a.sent();
                                        return [4 /*yield*/, (0, imageResizer_js_1.maybeResizeAndDownsampleImageBuffer)(imgBuffer, imgBuffer.length, 'jpeg')];
                                    case 2:
                                        resized = _a.sent();
                                        return [2 /*return*/, {
                                                type: 'image',
                                                source: {
                                                    type: 'base64',
                                                    media_type: "image/".concat(resized.mediaType),
                                                    data: resized.buffer.toString('base64'),
                                                },
                                            }];
                                }
                            });
                        }); }))];
                case 9:
                    imageBlocks = _f.sent();
                    return [2 /*return*/, __assign({ data: extractResult_1.data }, (imageBlocks.length > 0 && {
                            newMessages: [
                                (0, messages_js_1.createUserMessage)({ content: imageBlocks, isMeta: true }),
                            ],
                        }))];
                case 10: return [4 /*yield*/, (0, pdf_js_1.getPDFPageCount)(resolvedFilePath)];
                case 11:
                    pageCount = _f.sent();
                    if (pageCount !== null && pageCount > apiLimits_js_1.PDF_AT_MENTION_INLINE_THRESHOLD) {
                        throw new Error("This PDF has ".concat(pageCount, " pages, which is too many to read at once. ") +
                            "Use the pages parameter to read specific page ranges (e.g., pages: \"1-5\"). " +
                            "Maximum ".concat(apiLimits_js_1.PDF_MAX_PAGES_PER_READ, " pages per request."));
                    }
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    return [4 /*yield*/, fs.stat(resolvedFilePath)];
                case 12:
                    stats = _f.sent();
                    shouldExtractPages = !(0, pdfUtils_js_1.isPDFSupported)() || stats.size > apiLimits_js_1.PDF_EXTRACT_SIZE_THRESHOLD;
                    if (!shouldExtractPages) return [3 /*break*/, 14];
                    return [4 /*yield*/, (0, pdf_js_1.extractPDFPages)(resolvedFilePath)];
                case 13:
                    extractResult = _f.sent();
                    if (extractResult.success) {
                        (0, index_js_1.logEvent)('tengu_pdf_page_extraction', {
                            success: true,
                            pageCount: extractResult.data.file.count,
                            fileSize: extractResult.data.file.originalSize,
                        });
                    }
                    else {
                        (0, index_js_1.logEvent)('tengu_pdf_page_extraction', {
                            success: false,
                            available: extractResult.error.reason !== 'unavailable',
                            fileSize: stats.size,
                        });
                    }
                    _f.label = 14;
                case 14:
                    if (!(0, pdfUtils_js_1.isPDFSupported)()) {
                        throw new Error('Reading full PDFs is not supported with this model. Use a newer model (Sonnet 3.5 v2 or later), ' +
                            "or use the pages parameter to read specific page ranges (e.g., pages: \"1-5\", maximum ".concat(apiLimits_js_1.PDF_MAX_PAGES_PER_READ, " pages per request). ") +
                            'Page extraction requires poppler-utils: install with `brew install poppler` on macOS or `apt-get install poppler-utils` on Debian/Ubuntu.');
                    }
                    return [4 /*yield*/, (0, pdf_js_1.readPDF)(resolvedFilePath)];
                case 15:
                    readResult = _f.sent();
                    if (!readResult.success) {
                        throw new Error(readResult.error.message);
                    }
                    pdfData = readResult.data;
                    (0, fileOperationAnalytics_js_1.logFileOperation)({
                        operation: 'read',
                        tool: 'FileReadTool',
                        filePath: fullFilePath,
                        content: pdfData.file.base64,
                    });
                    return [2 /*return*/, {
                            data: pdfData,
                            newMessages: [
                                (0, messages_js_1.createUserMessage)({
                                    content: [
                                        {
                                            type: 'document',
                                            source: {
                                                type: 'base64',
                                                media_type: 'application/pdf',
                                                data: pdfData.file.base64,
                                            },
                                        },
                                    ],
                                    isMeta: true,
                                }),
                            ],
                        }];
                case 16:
                    lineOffset = offset === 0 ? 0 : offset - 1;
                    return [4 /*yield*/, (0, readFileInRange_js_1.readFileInRange)(resolvedFilePath, lineOffset, limit, limit === undefined ? maxSizeBytes : undefined, context.abortController.signal)];
                case 17:
                    _a = _f.sent(), content = _a.content, lineCount = _a.lineCount, totalLines = _a.totalLines, totalBytes = _a.totalBytes, readBytes = _a.readBytes, mtimeMs = _a.mtimeMs;
                    return [4 /*yield*/, validateContentTokens(content, ext, maxTokens)];
                case 18:
                    _f.sent();
                    readFileState.set(fullFilePath, {
                        content: content,
                        timestamp: Math.floor(mtimeMs),
                        offset: offset,
                        limit: limit,
                    });
                    (_e = context.nestedMemoryAttachmentTriggers) === null || _e === void 0 ? void 0 : _e.add(fullFilePath);
                    // Snapshot before iterating — a listener that unsubscribes mid-callback
                    // would splice the live array and skip the next listener.
                    for (_i = 0, _b = fileReadListeners.slice(); _i < _b.length; _i++) {
                        listener = _b[_i];
                        listener(resolvedFilePath, content);
                    }
                    data = {
                        type: 'text',
                        file: {
                            filePath: file_path,
                            content: content,
                            numLines: lineCount,
                            startLine: offset,
                            totalLines: totalLines,
                        },
                    };
                    if ((0, memoryFileDetection_js_1.isAutoMemFile)(fullFilePath)) {
                        memoryFileMtimes.set(data, mtimeMs);
                    }
                    (0, fileOperationAnalytics_js_1.logFileOperation)({
                        operation: 'read',
                        tool: 'FileReadTool',
                        filePath: fullFilePath,
                        content: content,
                    });
                    sessionFileType = detectSessionFileType(fullFilePath);
                    analyticsExt = (0, metadata_js_1.getFileExtensionForAnalytics)(fullFilePath);
                    (0, index_js_1.logEvent)('tengu_session_file_read', __assign(__assign(__assign(__assign({ totalLines: totalLines, readLines: lineCount, totalBytes: totalBytes, readBytes: readBytes, offset: offset }, (limit !== undefined && { limit: limit })), (analyticsExt !== undefined && { ext: analyticsExt })), (messageId !== undefined && {
                        messageID: messageId,
                    })), { is_session_memory: sessionFileType === 'session_memory', is_session_transcript: sessionFileType === 'session_transcript' }));
                    return [2 /*return*/, { data: data }];
            }
        });
    });
}
/**
 * Reads an image file and applies token-based compression if needed.
 * Reads the file ONCE, then applies standard resize. If the result exceeds
 * the token limit, applies aggressive compression from the same buffer.
 *
 * @param filePath - Path to the image file
 * @param maxTokens - Maximum token budget for the image
 * @returns Image data with appropriate compression applied
 */
function readImageWithTokenBudget(filePath_1) {
    return __awaiter(this, arguments, void 0, function (filePath, maxTokens, maxBytes) {
        var imageBuffer, originalSize, detectedMediaType, detectedFormat, result, resized, e_1, estimatedTokens, compressed, e_2, sharpModule, sharp, fallbackBuffer, error_2;
        if (maxTokens === void 0) { maxTokens = (0, limits_js_1.getDefaultFileReadingLimits)().maxTokens; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().readFileBytes(filePath, maxBytes)];
                case 1:
                    imageBuffer = _a.sent();
                    originalSize = imageBuffer.length;
                    if (originalSize === 0) {
                        throw new Error("Image file is empty: ".concat(filePath));
                    }
                    detectedMediaType = (0, imageResizer_js_1.detectImageFormatFromBuffer)(imageBuffer);
                    detectedFormat = detectedMediaType.split('/')[1] || 'png';
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, imageResizer_js_1.maybeResizeAndDownsampleImageBuffer)(imageBuffer, originalSize, detectedFormat)];
                case 3:
                    resized = _a.sent();
                    result = createImageResponse(resized.buffer, resized.mediaType, originalSize, resized.dimensions);
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    if (e_1 instanceof imageResizer_js_1.ImageResizeError)
                        throw e_1;
                    (0, log_js_1.logError)(e_1);
                    result = createImageResponse(imageBuffer, detectedFormat, originalSize);
                    return [3 /*break*/, 5];
                case 5:
                    estimatedTokens = Math.ceil(result.file.base64.length * 0.125);
                    if (!(estimatedTokens > maxTokens)) return [3 /*break*/, 14];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 14]);
                    return [4 /*yield*/, (0, imageResizer_js_1.compressImageBufferWithTokenLimit)(imageBuffer, maxTokens, detectedMediaType)];
                case 7:
                    compressed = _a.sent();
                    return [2 /*return*/, {
                            type: 'image',
                            file: {
                                base64: compressed.base64,
                                type: compressed.mediaType,
                                originalSize: originalSize,
                            },
                        }];
                case 8:
                    e_2 = _a.sent();
                    (0, log_js_1.logError)(e_2);
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 12, , 13]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('sharp'); })];
                case 10:
                    sharpModule = _a.sent();
                    sharp = sharpModule.default || sharpModule;
                    return [4 /*yield*/, sharp(imageBuffer)
                            .resize(400, 400, {
                            fit: 'inside',
                            withoutEnlargement: true,
                        })
                            .jpeg({ quality: 20 })
                            .toBuffer()];
                case 11:
                    fallbackBuffer = _a.sent();
                    return [2 /*return*/, createImageResponse(fallbackBuffer, 'jpeg', originalSize)];
                case 12:
                    error_2 = _a.sent();
                    (0, log_js_1.logError)(error_2);
                    return [2 /*return*/, createImageResponse(imageBuffer, detectedFormat, originalSize)];
                case 13: return [3 /*break*/, 14];
                case 14: return [2 /*return*/, result];
            }
        });
    });
}
