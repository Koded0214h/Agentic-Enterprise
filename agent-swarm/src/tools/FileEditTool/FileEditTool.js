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
exports.FileEditTool = void 0;
var path_1 = require("path");
var index_js_1 = require("src/services/analytics/index.js");
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
var format_js_1 = require("../../utils/format.js");
var fsOperations_js_1 = require("../../utils/fsOperations.js");
var gitDiff_js_1 = require("../../utils/gitDiff.js");
var log_js_1 = require("../../utils/log.js");
var path_js_1 = require("../../utils/path.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
var shellRuleMatching_js_1 = require("../../utils/permissions/shellRuleMatching.js");
var validateEditTool_js_1 = require("../../utils/settings/validateEditTool.js");
var constants_js_1 = require("../NotebookEditTool/constants.js");
var constants_js_2 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var types_js_1 = require("./types.js");
var UI_js_1 = require("./UI.js");
var utils_js_1 = require("./utils.js");
// V8/Bun string length limit is ~2^30 characters (~1 billion). For typical
// ASCII/Latin-1 files, 1 byte on disk = 1 character, so 1 GiB in stat bytes
// ≈ 1 billion characters ≈ the runtime string limit. Multi-byte UTF-8 files
// can be larger on disk per character, but 1 GiB is a safe byte-level guard
// that prevents OOM without being unnecessarily restrictive.
var MAX_EDIT_FILE_SIZE = 1024 * 1024 * 1024; // 1 GiB (stat bytes)
exports.FileEditTool = (0, Tool_js_1.buildTool)({
    name: constants_js_2.FILE_EDIT_TOOL_NAME,
    searchHint: 'modify file contents in place',
    maxResultSizeChars: 100000,
    strict: true,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 'A tool for editing files'];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.getEditToolDescription)()];
            });
        });
    },
    userFacingName: UI_js_1.userFacingName,
    getToolUseSummary: UI_js_1.getToolUseSummary,
    getActivityDescription: function (input) {
        var summary = (0, UI_js_1.getToolUseSummary)(input);
        return summary ? "Editing ".concat(summary) : 'Editing file';
    },
    get inputSchema() {
        return (0, types_js_1.inputSchema)();
    },
    get outputSchema() {
        return (0, types_js_1.outputSchema)();
    },
    toAutoClassifierInput: function (input) {
        return "".concat(input.file_path, ": ").concat(input.new_string);
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
                return [2 /*return*/, (0, filesystem_js_1.checkWritePermissionForTool)(exports.FileEditTool, input, appState.toolPermissionContext)];
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    renderToolUseRejectedMessage: UI_js_1.renderToolUseRejectedMessage,
    renderToolUseErrorMessage: UI_js_1.renderToolUseErrorMessage,
    validateInput: function (input, toolUseContext) {
        return __awaiter(this, void 0, void 0, function () {
            var file_path, old_string, new_string, _a, replace_all, fullFilePath, secretError, appState, denyRule, fs, size, e_1, fileContent, fileBuffer, encoding, e_2, similarFilename, cwdSuggestion, message, readTimestamp, lastWriteTime, isFullRead, file, actualOldString, matches, settingsValidationResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        file_path = input.file_path, old_string = input.old_string, new_string = input.new_string, _a = input.replace_all, replace_all = _a === void 0 ? false : _a;
                        fullFilePath = (0, path_js_1.expandPath)(file_path);
                        secretError = (0, teamMemSecretGuard_js_1.checkTeamMemSecrets)(fullFilePath, new_string);
                        if (secretError) {
                            return [2 /*return*/, { result: false, message: secretError, errorCode: 0 }];
                        }
                        if (old_string === new_string) {
                            return [2 /*return*/, {
                                    result: false,
                                    behavior: 'ask',
                                    message: 'No changes to make: old_string and new_string are exactly the same.',
                                    errorCode: 1,
                                }];
                        }
                        appState = toolUseContext.getAppState();
                        denyRule = (0, filesystem_js_1.matchingRuleForInput)(fullFilePath, appState.toolPermissionContext, 'edit', 'deny');
                        if (denyRule !== null) {
                            return [2 /*return*/, {
                                    result: false,
                                    behavior: 'ask',
                                    message: 'File is in a directory that is denied by your permission settings.',
                                    errorCode: 2,
                                }];
                        }
                        // SECURITY: Skip filesystem operations for UNC paths to prevent NTLM credential leaks.
                        // On Windows, fs.existsSync() on UNC paths triggers SMB authentication which could
                        // leak credentials to malicious servers. Let the permission check handle UNC paths.
                        if (fullFilePath.startsWith('\\\\') || fullFilePath.startsWith('//')) {
                            return [2 /*return*/, { result: true }];
                        }
                        fs = (0, fsOperations_js_1.getFsImplementation)();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.stat(fullFilePath)];
                    case 2:
                        size = (_b.sent()).size;
                        if (size > MAX_EDIT_FILE_SIZE) {
                            return [2 /*return*/, {
                                    result: false,
                                    behavior: 'ask',
                                    message: "File is too large to edit (".concat((0, format_js_1.formatFileSize)(size), "). Maximum editable file size is ").concat((0, format_js_1.formatFileSize)(MAX_EDIT_FILE_SIZE), "."),
                                    errorCode: 10,
                                }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        if (!(0, errors_js_1.isENOENT)(e_1)) {
                            throw e_1;
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, fs.readFileBytes(fullFilePath)];
                    case 5:
                        fileBuffer = _b.sent();
                        encoding = fileBuffer.length >= 2 &&
                            fileBuffer[0] === 0xff &&
                            fileBuffer[1] === 0xfe
                            ? 'utf16le'
                            : 'utf8';
                        fileContent = fileBuffer.toString(encoding).replaceAll('\r\n', '\n');
                        return [3 /*break*/, 7];
                    case 6:
                        e_2 = _b.sent();
                        if ((0, errors_js_1.isENOENT)(e_2)) {
                            fileContent = null;
                        }
                        else {
                            throw e_2;
                        }
                        return [3 /*break*/, 7];
                    case 7:
                        if (!(fileContent === null)) return [3 /*break*/, 9];
                        // Empty old_string on nonexistent file means new file creation — valid
                        if (old_string === '') {
                            return [2 /*return*/, { result: true }];
                        }
                        similarFilename = (0, file_js_1.findSimilarFile)(fullFilePath);
                        return [4 /*yield*/, (0, file_js_1.suggestPathUnderCwd)(fullFilePath)];
                    case 8:
                        cwdSuggestion = _b.sent();
                        message = "File does not exist. ".concat(file_js_1.FILE_NOT_FOUND_CWD_NOTE, " ").concat((0, cwd_js_1.getCwd)(), ".");
                        if (cwdSuggestion) {
                            message += " Did you mean ".concat(cwdSuggestion, "?");
                        }
                        else if (similarFilename) {
                            message += " Did you mean ".concat(similarFilename, "?");
                        }
                        return [2 /*return*/, {
                                result: false,
                                behavior: 'ask',
                                message: message,
                                errorCode: 4,
                            }];
                    case 9:
                        // File exists with empty old_string — only valid if file is empty
                        if (old_string === '') {
                            // Only reject if the file has content (for file creation attempt)
                            if (fileContent.trim() !== '') {
                                return [2 /*return*/, {
                                        result: false,
                                        behavior: 'ask',
                                        message: 'Cannot create new file - file already exists.',
                                        errorCode: 3,
                                    }];
                            }
                            // Empty file with empty old_string is valid - we're replacing empty with content
                            return [2 /*return*/, {
                                    result: true,
                                }];
                        }
                        if (fullFilePath.endsWith('.ipynb')) {
                            return [2 /*return*/, {
                                    result: false,
                                    behavior: 'ask',
                                    message: "File is a Jupyter Notebook. Use the ".concat(constants_js_1.NOTEBOOK_EDIT_TOOL_NAME, " to edit this file."),
                                    errorCode: 5,
                                }];
                        }
                        readTimestamp = toolUseContext.readFileState.get(fullFilePath);
                        if (!readTimestamp || readTimestamp.isPartialView) {
                            return [2 /*return*/, {
                                    result: false,
                                    behavior: 'ask',
                                    message: 'File has not been read yet. Read it first before writing to it.',
                                    meta: {
                                        isFilePathAbsolute: String((0, path_1.isAbsolute)(file_path)),
                                    },
                                    errorCode: 6,
                                }];
                        }
                        // Check if file exists and get its last modified time
                        if (readTimestamp) {
                            lastWriteTime = (0, file_js_1.getFileModificationTime)(fullFilePath);
                            if (lastWriteTime > readTimestamp.timestamp) {
                                isFullRead = readTimestamp.offset === undefined &&
                                    readTimestamp.limit === undefined;
                                if (isFullRead && fileContent === readTimestamp.content) {
                                    // Content unchanged, safe to proceed
                                }
                                else {
                                    return [2 /*return*/, {
                                            result: false,
                                            behavior: 'ask',
                                            message: 'File has been modified since read, either by the user or by a linter. Read it again before attempting to write it.',
                                            errorCode: 7,
                                        }];
                                }
                            }
                        }
                        file = fileContent;
                        actualOldString = (0, utils_js_1.findActualString)(file, old_string);
                        if (!actualOldString) {
                            return [2 /*return*/, {
                                    result: false,
                                    behavior: 'ask',
                                    message: "String to replace not found in file.\nString: ".concat(old_string),
                                    meta: {
                                        isFilePathAbsolute: String((0, path_1.isAbsolute)(file_path)),
                                    },
                                    errorCode: 8,
                                }];
                        }
                        matches = file.split(actualOldString).length - 1;
                        // Check if we have multiple matches but replace_all is false
                        if (matches > 1 && !replace_all) {
                            return [2 /*return*/, {
                                    result: false,
                                    behavior: 'ask',
                                    message: "Found ".concat(matches, " matches of the string to replace, but replace_all is false. To replace all occurrences, set replace_all to true. To replace only one occurrence, please provide more context to uniquely identify the instance.\nString: ").concat(old_string),
                                    meta: {
                                        isFilePathAbsolute: String((0, path_1.isAbsolute)(file_path)),
                                        actualOldString: actualOldString,
                                    },
                                    errorCode: 9,
                                }];
                        }
                        settingsValidationResult = (0, validateEditTool_js_1.validateInputForSettingsFileEdit)(fullFilePath, file, function () {
                            // Simulate the edit to get the final content using the exact same logic as the tool
                            return replace_all
                                ? file.replaceAll(actualOldString, new_string)
                                : file.replace(actualOldString, new_string);
                        });
                        if (settingsValidationResult !== null) {
                            return [2 /*return*/, settingsValidationResult];
                        }
                        return [2 /*return*/, { result: true, meta: { actualOldString: actualOldString } }];
                }
            });
        });
    },
    inputsEquivalent: function (input1, input2) {
        var _a, _b;
        return (0, utils_js_1.areFileEditsInputsEquivalent)({
            file_path: input1.file_path,
            edits: [
                {
                    old_string: input1.old_string,
                    new_string: input1.new_string,
                    replace_all: (_a = input1.replace_all) !== null && _a !== void 0 ? _a : false,
                },
            ],
        }, {
            file_path: input2.file_path,
            edits: [
                {
                    old_string: input2.old_string,
                    new_string: input2.new_string,
                    replace_all: (_b = input2.replace_all) !== null && _b !== void 0 ? _b : false,
                },
            ],
        });
    },
    call: function (input_1, _a, _1, parentMessage_1) {
        return __awaiter(this, arguments, void 0, function (input, _b, _, parentMessage) {
            var file_path, old_string, new_string, _c, replace_all, fs, absoluteFilePath, cwd, newSkillDirs, _i, newSkillDirs_1, dir, _d, originalFileContents, fileExists, encoding, endings, lastWriteTime, lastRead, isFullRead, contentUnchanged, actualOldString, actualNewString, _e, patch, updatedFile, lspManager, gitDiff, startTime, diff, data;
            var readFileState = _b.readFileState, userModified = _b.userModified, updateFileHistoryState = _b.updateFileHistoryState, dynamicSkillDirTriggers = _b.dynamicSkillDirTriggers;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        file_path = input.file_path, old_string = input.old_string, new_string = input.new_string, _c = input.replace_all, replace_all = _c === void 0 ? false : _c;
                        fs = (0, fsOperations_js_1.getFsImplementation)();
                        absoluteFilePath = (0, path_js_1.expandPath)(file_path);
                        cwd = (0, cwd_js_1.getCwd)();
                        if (!!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SIMPLE)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, loadSkillsDir_js_1.discoverSkillDirsForPaths)([absoluteFilePath], cwd)];
                    case 1:
                        newSkillDirs = _f.sent();
                        if (newSkillDirs.length > 0) {
                            // Store discovered dirs for attachment display
                            for (_i = 0, newSkillDirs_1 = newSkillDirs; _i < newSkillDirs_1.length; _i++) {
                                dir = newSkillDirs_1[_i];
                                dynamicSkillDirTriggers === null || dynamicSkillDirTriggers === void 0 ? void 0 : dynamicSkillDirTriggers.add(dir);
                            }
                            // Don't await - let skill loading happen in the background
                            (0, loadSkillsDir_js_1.addSkillDirectories)(newSkillDirs).catch(function () { });
                        }
                        // Activate conditional skills whose path patterns match this file
                        (0, loadSkillsDir_js_1.activateConditionalSkillsForPaths)([absoluteFilePath], cwd);
                        _f.label = 2;
                    case 2: return [4 /*yield*/, diagnosticTracking_js_1.diagnosticTracker.beforeFileEdited(absoluteFilePath)
                        // Ensure parent directory exists before the atomic read-modify-write section.
                        // These awaits must stay OUTSIDE the critical section below — a yield between
                        // the staleness check and writeTextContent lets concurrent edits interleave.
                    ];
                    case 3:
                        _f.sent();
                        // Ensure parent directory exists before the atomic read-modify-write section.
                        // These awaits must stay OUTSIDE the critical section below — a yield between
                        // the staleness check and writeTextContent lets concurrent edits interleave.
                        return [4 /*yield*/, fs.mkdir((0, path_1.dirname)(absoluteFilePath))];
                    case 4:
                        // Ensure parent directory exists before the atomic read-modify-write section.
                        // These awaits must stay OUTSIDE the critical section below — a yield between
                        // the staleness check and writeTextContent lets concurrent edits interleave.
                        _f.sent();
                        if (!(0, fileHistory_js_1.fileHistoryEnabled)()) return [3 /*break*/, 6];
                        // Backup captures pre-edit content — safe to call before the staleness
                        // check (idempotent v1 backup keyed on content hash; if staleness fails
                        // later we just have an unused backup, not corrupt state).
                        return [4 /*yield*/, (0, fileHistory_js_1.fileHistoryTrackEdit)(updateFileHistoryState, absoluteFilePath, parentMessage.uuid)];
                    case 5:
                        // Backup captures pre-edit content — safe to call before the staleness
                        // check (idempotent v1 backup keyed on content hash; if staleness fails
                        // later we just have an unused backup, not corrupt state).
                        _f.sent();
                        _f.label = 6;
                    case 6:
                        _d = readFileForEdit(absoluteFilePath), originalFileContents = _d.content, fileExists = _d.fileExists, encoding = _d.encoding, endings = _d.lineEndings;
                        if (fileExists) {
                            lastWriteTime = (0, file_js_1.getFileModificationTime)(absoluteFilePath);
                            lastRead = readFileState.get(absoluteFilePath);
                            if (!lastRead || lastWriteTime > lastRead.timestamp) {
                                isFullRead = lastRead &&
                                    lastRead.offset === undefined &&
                                    lastRead.limit === undefined;
                                contentUnchanged = isFullRead && originalFileContents === lastRead.content;
                                if (!contentUnchanged) {
                                    throw new Error(constants_js_2.FILE_UNEXPECTEDLY_MODIFIED_ERROR);
                                }
                            }
                        }
                        actualOldString = (0, utils_js_1.findActualString)(originalFileContents, old_string) || old_string;
                        actualNewString = (0, utils_js_1.preserveQuoteStyle)(old_string, actualOldString, new_string);
                        _e = (0, utils_js_1.getPatchForEdit)({
                            filePath: absoluteFilePath,
                            fileContents: originalFileContents,
                            oldString: actualOldString,
                            newString: actualNewString,
                            replaceAll: replace_all,
                        }), patch = _e.patch, updatedFile = _e.updatedFile;
                        // 5. Write to disk
                        (0, file_js_1.writeTextContent)(absoluteFilePath, updatedFile, encoding, endings);
                        lspManager = (0, manager_js_1.getLspServerManager)();
                        if (lspManager) {
                            // Clear previously delivered diagnostics so new ones will be shown
                            (0, LSPDiagnosticRegistry_js_1.clearDeliveredDiagnosticsForFile)("file://".concat(absoluteFilePath));
                            // didChange: Content has been modified
                            lspManager
                                .changeFile(absoluteFilePath, updatedFile)
                                .catch(function (err) {
                                (0, debug_js_1.logForDebugging)("LSP: Failed to notify server of file change for ".concat(absoluteFilePath, ": ").concat(err.message));
                                (0, log_js_1.logError)(err);
                            });
                            // didSave: File has been saved to disk (triggers diagnostics in TypeScript server)
                            lspManager.saveFile(absoluteFilePath).catch(function (err) {
                                (0, debug_js_1.logForDebugging)("LSP: Failed to notify server of file save for ".concat(absoluteFilePath, ": ").concat(err.message));
                                (0, log_js_1.logError)(err);
                            });
                        }
                        // Notify VSCode about the file change for diff view
                        (0, vscodeSdkMcp_js_1.notifyVscodeFileUpdated)(absoluteFilePath, originalFileContents, updatedFile);
                        // 6. Update read timestamp, to invalidate stale writes
                        readFileState.set(absoluteFilePath, {
                            content: updatedFile,
                            timestamp: (0, file_js_1.getFileModificationTime)(absoluteFilePath),
                            offset: undefined,
                            limit: undefined,
                        });
                        // 7. Log events
                        if (absoluteFilePath.endsWith("".concat(path_1.sep, "CLAUDE.md"))) {
                            (0, index_js_1.logEvent)('tengu_write_claudemd', {});
                        }
                        (0, diff_js_1.countLinesChanged)(patch);
                        (0, fileOperationAnalytics_js_1.logFileOperation)({
                            operation: 'edit',
                            tool: 'FileEditTool',
                            filePath: absoluteFilePath,
                        });
                        (0, index_js_1.logEvent)('tengu_edit_string_lengths', {
                            oldStringBytes: Buffer.byteLength(old_string, 'utf8'),
                            newStringBytes: Buffer.byteLength(new_string, 'utf8'),
                            replaceAll: replace_all,
                        });
                        if (!((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) &&
                            (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_quartz_lantern', false))) return [3 /*break*/, 8];
                        startTime = Date.now();
                        return [4 /*yield*/, (0, gitDiff_js_1.fetchSingleFileGitDiff)(absoluteFilePath)];
                    case 7:
                        diff = _f.sent();
                        if (diff)
                            gitDiff = diff;
                        (0, index_js_1.logEvent)('tengu_tool_use_diff_computed', {
                            isEditTool: true,
                            durationMs: Date.now() - startTime,
                            hasDiff: !!diff,
                        });
                        _f.label = 8;
                    case 8:
                        data = __assign({ filePath: file_path, oldString: actualOldString, newString: new_string, originalFile: originalFileContents, structuredPatch: patch, userModified: userModified !== null && userModified !== void 0 ? userModified : false, replaceAll: replace_all }, (gitDiff && { gitDiff: gitDiff }));
                        return [2 /*return*/, {
                                data: data,
                            }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (data, toolUseID) {
        var filePath = data.filePath, userModified = data.userModified, replaceAll = data.replaceAll;
        var modifiedNote = userModified
            ? '.  The user modified your proposed changes before accepting them. '
            : '';
        if (replaceAll) {
            return {
                tool_use_id: toolUseID,
                type: 'tool_result',
                content: "The file ".concat(filePath, " has been updated").concat(modifiedNote, ". All occurrences were successfully replaced."),
            };
        }
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: "The file ".concat(filePath, " has been updated successfully").concat(modifiedNote, "."),
        };
    },
});
// --
function readFileForEdit(absoluteFilePath) {
    try {
        // eslint-disable-next-line custom-rules/no-sync-fs
        var meta = (0, fileRead_js_1.readFileSyncWithMetadata)(absoluteFilePath);
        return {
            content: meta.content,
            fileExists: true,
            encoding: meta.encoding,
            lineEndings: meta.lineEndings,
        };
    }
    catch (e) {
        if ((0, errors_js_1.isENOENT)(e)) {
            return {
                content: '',
                fileExists: false,
                encoding: 'utf8',
                lineEndings: 'LF',
            };
        }
        throw e;
    }
}
