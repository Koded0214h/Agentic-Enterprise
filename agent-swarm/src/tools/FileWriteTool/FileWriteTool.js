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
exports.FileWriteTool = void 0;
var path_1 = require("path");
var index_js_1 = require("src/services/analytics/index.js");
var v4_1 = require("zod/v4");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var diagnosticTracking_js_1 = require("../../services/diagnosticTracking.js");
var LSPDiagnosticRegistry_js_1 = require("../../services/lsp/LSPDiagnosticRegistry.js");
var manager_js_1 = require("../../services/lsp/manager.js");
var vscodeSdkMcp_js_1 = require("../../services/mcp/vscodeSdkMcp.js");
var teamMemSecretGuard_js_1 = require("../../services/teamMemorySync/teamMemSecretGuard.js");
var loadSkillsDir_js_1 = require("../../skills/loadSkillsDir.js");
var Tool_js_1 = require("../../Tool.js");
var cwd_js_1 = require("../../utils/cwd.js");
var debug_js_1 = require("../../utils/debug.js");
var diff_js_1 = require("../../utils/diff.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var file_js_1 = require("../../utils/file.js");
var fileHistory_js_1 = require("../../utils/fileHistory.js");
var fileOperationAnalytics_js_1 = require("../../utils/fileOperationAnalytics.js");
var fileRead_js_1 = require("../../utils/fileRead.js");
var fsOperations_js_1 = require("../../utils/fsOperations.js");
var gitDiff_js_1 = require("../../utils/gitDiff.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var log_js_1 = require("../../utils/log.js");
var path_js_1 = require("../../utils/path.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
var shellRuleMatching_js_1 = require("../../utils/permissions/shellRuleMatching.js");
var constants_js_1 = require("../FileEditTool/constants.js");
var types_js_1 = require("../FileEditTool/types.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        file_path: v4_1.z
            .string()
            .describe('The absolute path to the file to write (must be absolute, not relative)'),
        content: v4_1.z.string().describe('The content to write to the file'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z
            .enum(['create', 'update'])
            .describe('Whether a new file was created or an existing file was updated'),
        filePath: v4_1.z.string().describe('The path to the file that was written'),
        content: v4_1.z.string().describe('The content that was written to the file'),
        structuredPatch: v4_1.z
            .array((0, types_js_1.hunkSchema)())
            .describe('Diff patch showing the changes'),
        originalFile: v4_1.z
            .string()
            .nullable()
            .describe('The original file content before the write (null for new files)'),
        gitDiff: (0, types_js_1.gitDiffSchema)().optional(),
    });
});
exports.FileWriteTool = (0, Tool_js_1.buildTool)({
    name: prompt_js_1.FILE_WRITE_TOOL_NAME,
    searchHint: 'create or overwrite files',
    maxResultSizeChars: 100000,
    strict: true,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 'Write a file to the local filesystem.'];
            });
        });
    },
    userFacingName: UI_js_1.userFacingName,
    getToolUseSummary: UI_js_1.getToolUseSummary,
    getActivityDescription: function (input) {
        var summary = (0, UI_js_1.getToolUseSummary)(input);
        return summary ? "Writing ".concat(summary) : 'Writing file';
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.getWriteToolDescription)()];
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    isResultTruncated: UI_js_1.isResultTruncated,
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    toAutoClassifierInput: function (input) {
        return "".concat(input.file_path, ": ").concat(input.content);
    },
    getPath: function (input) {
        return input.file_path;
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
                return [2 /*return*/, (0, filesystem_js_1.checkWritePermissionForTool)(exports.FileWriteTool, input, appState.toolPermissionContext)];
            });
        });
    },
    renderToolUseRejectedMessage: UI_js_1.renderToolUseRejectedMessage,
    renderToolUseErrorMessage: UI_js_1.renderToolUseErrorMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    extractSearchText: function () {
        // Transcript render shows either content (create, via HighlightedCode)
        // or a structured diff (update). The heuristic's 'content' allowlist key
        // would index the raw content string even in update mode where it's NOT
        // shown — phantom. Under-count: tool_use already indexes file_path.
        return '';
    },
    validateInput: function (_a, toolUseContext_1) {
        return __awaiter(this, arguments, void 0, function (_b, toolUseContext) {
            var fullFilePath, secretError, appState, denyRule, fs, fileMtimeMs, fileStat, e_1, readTimestamp, lastWriteTime;
            var file_path = _b.file_path, content = _b.content;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        fullFilePath = (0, path_js_1.expandPath)(file_path);
                        secretError = (0, teamMemSecretGuard_js_1.checkTeamMemSecrets)(fullFilePath, content);
                        if (secretError) {
                            return [2 /*return*/, { result: false, message: secretError, errorCode: 0 }];
                        }
                        appState = toolUseContext.getAppState();
                        denyRule = (0, filesystem_js_1.matchingRuleForInput)(fullFilePath, appState.toolPermissionContext, 'edit', 'deny');
                        if (denyRule !== null) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: 'File is in a directory that is denied by your permission settings.',
                                    errorCode: 1,
                                }];
                        }
                        // SECURITY: Skip filesystem operations for UNC paths to prevent NTLM credential leaks.
                        // On Windows, fs.existsSync() on UNC paths triggers SMB authentication which could
                        // leak credentials to malicious servers. Let the permission check handle UNC paths.
                        if (fullFilePath.startsWith('\\\\') || fullFilePath.startsWith('//')) {
                            return [2 /*return*/, { result: true }];
                        }
                        fs = (0, fsOperations_js_1.getFsImplementation)();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.stat(fullFilePath)];
                    case 2:
                        fileStat = _c.sent();
                        fileMtimeMs = fileStat.mtimeMs;
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _c.sent();
                        if ((0, errors_js_1.isENOENT)(e_1)) {
                            return [2 /*return*/, { result: true }];
                        }
                        throw e_1;
                    case 4:
                        readTimestamp = toolUseContext.readFileState.get(fullFilePath);
                        if (!readTimestamp || readTimestamp.isPartialView) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: 'File has not been read yet. Read it first before writing to it.',
                                    errorCode: 2,
                                }];
                        }
                        lastWriteTime = Math.floor(fileMtimeMs);
                        if (lastWriteTime > readTimestamp.timestamp) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: 'File has been modified since read, either by the user or by a linter. Read it again before attempting to write it.',
                                    errorCode: 3,
                                }];
                        }
                        return [2 /*return*/, { result: true }];
                }
            });
        });
    },
    call: function (_a, _b, _1, parentMessage_1) {
        return __awaiter(this, arguments, void 0, function (_c, _d, _, parentMessage) {
            var fullFilePath, dir, cwd, newSkillDirs, _i, newSkillDirs_1, dir_1, meta, lastWriteTime, lastRead, isFullRead, enc, oldContent, lspManager, gitDiff, startTime, diff, patch, data_1, data;
            var _e, _f;
            var file_path = _c.file_path, content = _c.content;
            var readFileState = _d.readFileState, updateFileHistoryState = _d.updateFileHistoryState, dynamicSkillDirTriggers = _d.dynamicSkillDirTriggers;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        fullFilePath = (0, path_js_1.expandPath)(file_path);
                        dir = (0, path_1.dirname)(fullFilePath);
                        cwd = (0, cwd_js_1.getCwd)();
                        return [4 /*yield*/, (0, loadSkillsDir_js_1.discoverSkillDirsForPaths)([fullFilePath], cwd)];
                    case 1:
                        newSkillDirs = _g.sent();
                        if (newSkillDirs.length > 0) {
                            // Store discovered dirs for attachment display
                            for (_i = 0, newSkillDirs_1 = newSkillDirs; _i < newSkillDirs_1.length; _i++) {
                                dir_1 = newSkillDirs_1[_i];
                                dynamicSkillDirTriggers === null || dynamicSkillDirTriggers === void 0 ? void 0 : dynamicSkillDirTriggers.add(dir_1);
                            }
                            // Don't await - let skill loading happen in the background
                            (0, loadSkillsDir_js_1.addSkillDirectories)(newSkillDirs).catch(function () { });
                        }
                        // Activate conditional skills whose path patterns match this file
                        (0, loadSkillsDir_js_1.activateConditionalSkillsForPaths)([fullFilePath], cwd);
                        return [4 /*yield*/, diagnosticTracking_js_1.diagnosticTracker.beforeFileEdited(fullFilePath)
                            // Ensure parent directory exists before the atomic read-modify-write section.
                            // Must stay OUTSIDE the critical section below (a yield between the staleness
                            // check and writeTextContent lets concurrent edits interleave), and BEFORE the
                            // write (lazy-mkdir-on-ENOENT would fire a spurious tengu_atomic_write_error
                            // inside writeFileSyncAndFlush_DEPRECATED before ENOENT propagates back).
                        ];
                    case 2:
                        _g.sent();
                        // Ensure parent directory exists before the atomic read-modify-write section.
                        // Must stay OUTSIDE the critical section below (a yield between the staleness
                        // check and writeTextContent lets concurrent edits interleave), and BEFORE the
                        // write (lazy-mkdir-on-ENOENT would fire a spurious tengu_atomic_write_error
                        // inside writeFileSyncAndFlush_DEPRECATED before ENOENT propagates back).
                        return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir(dir)];
                    case 3:
                        // Ensure parent directory exists before the atomic read-modify-write section.
                        // Must stay OUTSIDE the critical section below (a yield between the staleness
                        // check and writeTextContent lets concurrent edits interleave), and BEFORE the
                        // write (lazy-mkdir-on-ENOENT would fire a spurious tengu_atomic_write_error
                        // inside writeFileSyncAndFlush_DEPRECATED before ENOENT propagates back).
                        _g.sent();
                        if (!(0, fileHistory_js_1.fileHistoryEnabled)()) return [3 /*break*/, 5];
                        // Backup captures pre-edit content — safe to call before the staleness
                        // check (idempotent v1 backup keyed on content hash; if staleness fails
                        // later we just have an unused backup, not corrupt state).
                        return [4 /*yield*/, (0, fileHistory_js_1.fileHistoryTrackEdit)(updateFileHistoryState, fullFilePath, parentMessage.uuid)];
                    case 4:
                        // Backup captures pre-edit content — safe to call before the staleness
                        // check (idempotent v1 backup keyed on content hash; if staleness fails
                        // later we just have an unused backup, not corrupt state).
                        _g.sent();
                        _g.label = 5;
                    case 5:
                        try {
                            meta = (0, fileRead_js_1.readFileSyncWithMetadata)(fullFilePath);
                        }
                        catch (e) {
                            if ((0, errors_js_1.isENOENT)(e)) {
                                meta = null;
                            }
                            else {
                                throw e;
                            }
                        }
                        if (meta !== null) {
                            lastWriteTime = (0, file_js_1.getFileModificationTime)(fullFilePath);
                            lastRead = readFileState.get(fullFilePath);
                            if (!lastRead || lastWriteTime > lastRead.timestamp) {
                                isFullRead = lastRead &&
                                    lastRead.offset === undefined &&
                                    lastRead.limit === undefined;
                                // meta.content is CRLF-normalized — matches readFileState's normalized form.
                                if (!isFullRead || meta.content !== lastRead.content) {
                                    throw new Error(constants_js_1.FILE_UNEXPECTEDLY_MODIFIED_ERROR);
                                }
                            }
                        }
                        enc = (_e = meta === null || meta === void 0 ? void 0 : meta.encoding) !== null && _e !== void 0 ? _e : 'utf8';
                        oldContent = (_f = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _f !== void 0 ? _f : null;
                        // Write is a full content replacement — the model sent explicit line endings
                        // in `content` and meant them. Do not rewrite them. Previously we preserved
                        // the old file's line endings (or sampled the repo via ripgrep for new
                        // files), which silently corrupted e.g. bash scripts with \r on Linux when
                        // overwriting a CRLF file or when binaries in cwd poisoned the repo sample.
                        (0, file_js_1.writeTextContent)(fullFilePath, content, enc, 'LF');
                        lspManager = (0, manager_js_1.getLspServerManager)();
                        if (lspManager) {
                            // Clear previously delivered diagnostics so new ones will be shown
                            (0, LSPDiagnosticRegistry_js_1.clearDeliveredDiagnosticsForFile)("file://".concat(fullFilePath));
                            // didChange: Content has been modified
                            lspManager.changeFile(fullFilePath, content).catch(function (err) {
                                (0, debug_js_1.logForDebugging)("LSP: Failed to notify server of file change for ".concat(fullFilePath, ": ").concat(err.message));
                                (0, log_js_1.logError)(err);
                            });
                            // didSave: File has been saved to disk (triggers diagnostics in TypeScript server)
                            lspManager.saveFile(fullFilePath).catch(function (err) {
                                (0, debug_js_1.logForDebugging)("LSP: Failed to notify server of file save for ".concat(fullFilePath, ": ").concat(err.message));
                                (0, log_js_1.logError)(err);
                            });
                        }
                        // Notify VSCode about the file change for diff view
                        (0, vscodeSdkMcp_js_1.notifyVscodeFileUpdated)(fullFilePath, oldContent, content);
                        // Update read timestamp, to invalidate stale writes
                        readFileState.set(fullFilePath, {
                            content: content,
                            timestamp: (0, file_js_1.getFileModificationTime)(fullFilePath),
                            offset: undefined,
                            limit: undefined,
                        });
                        // Log when writing to CLAUDE.md
                        if (fullFilePath.endsWith("".concat(path_1.sep, "CLAUDE.md"))) {
                            (0, index_js_1.logEvent)('tengu_write_claudemd', {});
                        }
                        if (!((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) &&
                            (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_quartz_lantern', false))) return [3 /*break*/, 7];
                        startTime = Date.now();
                        return [4 /*yield*/, (0, gitDiff_js_1.fetchSingleFileGitDiff)(fullFilePath)];
                    case 6:
                        diff = _g.sent();
                        if (diff)
                            gitDiff = diff;
                        (0, index_js_1.logEvent)('tengu_tool_use_diff_computed', {
                            isWriteTool: true,
                            durationMs: Date.now() - startTime,
                            hasDiff: !!diff,
                        });
                        _g.label = 7;
                    case 7:
                        if (oldContent) {
                            patch = (0, diff_js_1.getPatchForDisplay)({
                                filePath: file_path,
                                fileContents: oldContent,
                                edits: [
                                    {
                                        old_string: oldContent,
                                        new_string: content,
                                        replace_all: false,
                                    },
                                ],
                            });
                            data_1 = __assign({ type: 'update', filePath: file_path, content: content, structuredPatch: patch, originalFile: oldContent }, (gitDiff && { gitDiff: gitDiff }));
                            // Track lines added and removed for file updates, right before yielding result
                            (0, diff_js_1.countLinesChanged)(patch);
                            (0, fileOperationAnalytics_js_1.logFileOperation)({
                                operation: 'write',
                                tool: 'FileWriteTool',
                                filePath: fullFilePath,
                                type: 'update',
                            });
                            return [2 /*return*/, {
                                    data: data_1,
                                }];
                        }
                        data = __assign({ type: 'create', filePath: file_path, content: content, structuredPatch: [], originalFile: null }, (gitDiff && { gitDiff: gitDiff }));
                        // For creation of new files, count all lines as additions, right before yielding the result
                        (0, diff_js_1.countLinesChanged)([], content);
                        (0, fileOperationAnalytics_js_1.logFileOperation)({
                            operation: 'write',
                            tool: 'FileWriteTool',
                            filePath: fullFilePath,
                            type: 'create',
                        });
                        return [2 /*return*/, {
                                data: data,
                            }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (_a, toolUseID) {
        var filePath = _a.filePath, type = _a.type;
        switch (type) {
            case 'create':
                return {
                    tool_use_id: toolUseID,
                    type: 'tool_result',
                    content: "File created successfully at: ".concat(filePath),
                };
            case 'update':
                return {
                    tool_use_id: toolUseID,
                    type: 'tool_result',
                    content: "The file ".concat(filePath, " has been updated successfully."),
                };
        }
    },
});
