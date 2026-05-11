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
exports.NotebookEditTool = exports.outputSchema = exports.inputSchema = void 0;
var bun_bundle_1 = require("bun:bundle");
var path_1 = require("path");
var fileHistory_js_1 = require("src/utils/fileHistory.js");
var v4_1 = require("zod/v4");
var Tool_js_1 = require("../../Tool.js");
var cwd_js_1 = require("../../utils/cwd.js");
var errors_js_1 = require("../../utils/errors.js");
var file_js_1 = require("../../utils/file.js");
var fileRead_js_1 = require("../../utils/fileRead.js");
var json_js_1 = require("../../utils/json.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var notebook_js_1 = require("../../utils/notebook.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var constants_js_1 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
exports.inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        notebook_path: v4_1.z
            .string()
            .describe('The absolute path to the Jupyter notebook file to edit (must be absolute, not relative)'),
        cell_id: v4_1.z
            .string()
            .optional()
            .describe('The ID of the cell to edit. When inserting a new cell, the new cell will be inserted after the cell with this ID, or at the beginning if not specified.'),
        new_source: v4_1.z.string().describe('The new source for the cell'),
        cell_type: v4_1.z
            .enum(['code', 'markdown'])
            .optional()
            .describe('The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required.'),
        edit_mode: v4_1.z
            .enum(['replace', 'insert', 'delete'])
            .optional()
            .describe('The type of edit to make (replace, insert, delete). Defaults to replace.'),
    });
});
exports.outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        new_source: v4_1.z
            .string()
            .describe('The new source code that was written to the cell'),
        cell_id: v4_1.z
            .string()
            .optional()
            .describe('The ID of the cell that was edited'),
        cell_type: v4_1.z.enum(['code', 'markdown']).describe('The type of the cell'),
        language: v4_1.z.string().describe('The programming language of the notebook'),
        edit_mode: v4_1.z.string().describe('The edit mode that was used'),
        error: v4_1.z
            .string()
            .optional()
            .describe('Error message if the operation failed'),
        // Fields for attribution tracking
        notebook_path: v4_1.z.string().describe('The path to the notebook file'),
        original_file: v4_1.z
            .string()
            .describe('The original notebook content before modification'),
        updated_file: v4_1.z
            .string()
            .describe('The updated notebook content after modification'),
    });
});
exports.NotebookEditTool = (0, Tool_js_1.buildTool)({
    name: constants_js_1.NOTEBOOK_EDIT_TOOL_NAME,
    searchHint: 'edit Jupyter notebook cells (.ipynb)',
    maxResultSizeChars: 100000,
    shouldDefer: true,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.DESCRIPTION];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.PROMPT];
            });
        });
    },
    userFacingName: function () {
        return 'Edit Notebook';
    },
    getToolUseSummary: UI_js_1.getToolUseSummary,
    getActivityDescription: function (input) {
        var summary = (0, UI_js_1.getToolUseSummary)(input);
        return summary ? "Editing notebook ".concat(summary) : 'Editing notebook';
    },
    get inputSchema() {
        return (0, exports.inputSchema)();
    },
    get outputSchema() {
        return (0, exports.outputSchema)();
    },
    toAutoClassifierInput: function (input) {
        var _a;
        if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
            var mode = (_a = input.edit_mode) !== null && _a !== void 0 ? _a : 'replace';
            return "".concat(input.notebook_path, " ").concat(mode, ": ").concat(input.new_source);
        }
        return '';
    },
    getPath: function (input) {
        return input.notebook_path;
    },
    checkPermissions: function (input, context) {
        return __awaiter(this, void 0, void 0, function () {
            var appState;
            return __generator(this, function (_a) {
                appState = context.getAppState();
                return [2 /*return*/, (0, filesystem_js_1.checkWritePermissionForTool)(exports.NotebookEditTool, input, appState.toolPermissionContext)];
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (_a, toolUseID) {
        var cell_id = _a.cell_id, edit_mode = _a.edit_mode, new_source = _a.new_source, error = _a.error;
        if (error) {
            return {
                tool_use_id: toolUseID,
                type: 'tool_result',
                content: error,
                is_error: true,
            };
        }
        switch (edit_mode) {
            case 'replace':
                return {
                    tool_use_id: toolUseID,
                    type: 'tool_result',
                    content: "Updated cell ".concat(cell_id, " with ").concat(new_source),
                };
            case 'insert':
                return {
                    tool_use_id: toolUseID,
                    type: 'tool_result',
                    content: "Inserted cell ".concat(cell_id, " with ").concat(new_source),
                };
            case 'delete':
                return {
                    tool_use_id: toolUseID,
                    type: 'tool_result',
                    content: "Deleted cell ".concat(cell_id),
                };
            default:
                return {
                    tool_use_id: toolUseID,
                    type: 'tool_result',
                    content: 'Unknown edit mode',
                };
        }
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolUseRejectedMessage: UI_js_1.renderToolUseRejectedMessage,
    renderToolUseErrorMessage: UI_js_1.renderToolUseErrorMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    validateInput: function (_a, toolUseContext_1) {
        return __awaiter(this, arguments, void 0, function (_b, toolUseContext) {
            var fullPath, readTimestamp, content, notebook, cellIndex, parsedCellIndex;
            var notebook_path = _b.notebook_path, cell_type = _b.cell_type, cell_id = _b.cell_id, _c = _b.edit_mode, edit_mode = _c === void 0 ? 'replace' : _c;
            return __generator(this, function (_d) {
                fullPath = (0, path_1.isAbsolute)(notebook_path)
                    ? notebook_path
                    : (0, path_1.resolve)((0, cwd_js_1.getCwd)(), notebook_path);
                // SECURITY: Skip filesystem operations for UNC paths to prevent NTLM credential leaks.
                if (fullPath.startsWith('\\\\') || fullPath.startsWith('//')) {
                    return [2 /*return*/, { result: true }];
                }
                if ((0, path_1.extname)(fullPath) !== '.ipynb') {
                    return [2 /*return*/, {
                            result: false,
                            message: 'File must be a Jupyter notebook (.ipynb file). For editing other file types, use the FileEdit tool.',
                            errorCode: 2,
                        }];
                }
                if (edit_mode !== 'replace' &&
                    edit_mode !== 'insert' &&
                    edit_mode !== 'delete') {
                    return [2 /*return*/, {
                            result: false,
                            message: 'Edit mode must be replace, insert, or delete.',
                            errorCode: 4,
                        }];
                }
                if (edit_mode === 'insert' && !cell_type) {
                    return [2 /*return*/, {
                            result: false,
                            message: 'Cell type is required when using edit_mode=insert.',
                            errorCode: 5,
                        }];
                }
                readTimestamp = toolUseContext.readFileState.get(fullPath);
                if (!readTimestamp) {
                    return [2 /*return*/, {
                            result: false,
                            message: 'File has not been read yet. Read it first before writing to it.',
                            errorCode: 9,
                        }];
                }
                if ((0, file_js_1.getFileModificationTime)(fullPath) > readTimestamp.timestamp) {
                    return [2 /*return*/, {
                            result: false,
                            message: 'File has been modified since read, either by the user or by a linter. Read it again before attempting to write it.',
                            errorCode: 10,
                        }];
                }
                try {
                    content = (0, fileRead_js_1.readFileSyncWithMetadata)(fullPath).content;
                }
                catch (e) {
                    if ((0, errors_js_1.isENOENT)(e)) {
                        return [2 /*return*/, {
                                result: false,
                                message: 'Notebook file does not exist.',
                                errorCode: 1,
                            }];
                    }
                    throw e;
                }
                notebook = (0, json_js_1.safeParseJSON)(content);
                if (!notebook) {
                    return [2 /*return*/, {
                            result: false,
                            message: 'Notebook is not valid JSON.',
                            errorCode: 6,
                        }];
                }
                if (!cell_id) {
                    if (edit_mode !== 'insert') {
                        return [2 /*return*/, {
                                result: false,
                                message: 'Cell ID must be specified when not inserting a new cell.',
                                errorCode: 7,
                            }];
                    }
                }
                else {
                    cellIndex = notebook.cells.findIndex(function (cell) { return cell.id === cell_id; });
                    if (cellIndex === -1) {
                        parsedCellIndex = (0, notebook_js_1.parseCellId)(cell_id);
                        if (parsedCellIndex !== undefined) {
                            if (!notebook.cells[parsedCellIndex]) {
                                return [2 /*return*/, {
                                        result: false,
                                        message: "Cell with index ".concat(parsedCellIndex, " does not exist in notebook."),
                                        errorCode: 7,
                                    }];
                            }
                        }
                        else {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Cell with ID \"".concat(cell_id, "\" not found in notebook."),
                                    errorCode: 8,
                                }];
                        }
                    }
                }
                return [2 /*return*/, { result: true }];
            });
        });
    },
    call: function (_a, _b, _1, parentMessage_1) {
        return __awaiter(this, arguments, void 0, function (_c, _d, _, parentMessage) {
            var fullPath, _e, content, encoding, lineEndings, notebook, cellIndex, parsedCellIndex, edit_mode, language, new_cell_id, new_cell, targetCell, IPYNB_INDENT, updatedContent, data, data_1, data;
            var _f, _g;
            var notebook_path = _c.notebook_path, new_source = _c.new_source, cell_id = _c.cell_id, cell_type = _c.cell_type, originalEditMode = _c.edit_mode;
            var readFileState = _d.readFileState, updateFileHistoryState = _d.updateFileHistoryState;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        fullPath = (0, path_1.isAbsolute)(notebook_path)
                            ? notebook_path
                            : (0, path_1.resolve)((0, cwd_js_1.getCwd)(), notebook_path);
                        if (!(0, fileHistory_js_1.fileHistoryEnabled)()) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, fileHistory_js_1.fileHistoryTrackEdit)(updateFileHistoryState, fullPath, parentMessage.uuid)];
                    case 1:
                        _h.sent();
                        _h.label = 2;
                    case 2:
                        try {
                            _e = (0, fileRead_js_1.readFileSyncWithMetadata)(fullPath), content = _e.content, encoding = _e.encoding, lineEndings = _e.lineEndings;
                            notebook = void 0;
                            try {
                                notebook = (0, slowOperations_js_1.jsonParse)(content);
                            }
                            catch (_j) {
                                return [2 /*return*/, {
                                        data: {
                                            new_source: new_source,
                                            cell_type: cell_type !== null && cell_type !== void 0 ? cell_type : 'code',
                                            language: 'python',
                                            edit_mode: 'replace',
                                            error: 'Notebook is not valid JSON.',
                                            cell_id: cell_id,
                                            notebook_path: fullPath,
                                            original_file: '',
                                            updated_file: '',
                                        },
                                    }];
                            }
                            cellIndex = void 0;
                            if (!cell_id) {
                                cellIndex = 0; // Default to inserting at the beginning if no cell_id is provided
                            }
                            else {
                                // First try to find the cell by its actual ID
                                cellIndex = notebook.cells.findIndex(function (cell) { return cell.id === cell_id; });
                                // If not found, try to parse as a numeric index (cell-N format)
                                if (cellIndex === -1) {
                                    parsedCellIndex = (0, notebook_js_1.parseCellId)(cell_id);
                                    if (parsedCellIndex !== undefined) {
                                        cellIndex = parsedCellIndex;
                                    }
                                }
                                if (originalEditMode === 'insert') {
                                    cellIndex += 1; // Insert after the cell with this ID
                                }
                            }
                            edit_mode = originalEditMode;
                            if (edit_mode === 'replace' && cellIndex === notebook.cells.length) {
                                edit_mode = 'insert';
                                if (!cell_type) {
                                    cell_type = 'code'; // Default to code if no cell_type specified
                                }
                            }
                            language = (_g = (_f = notebook.metadata.language_info) === null || _f === void 0 ? void 0 : _f.name) !== null && _g !== void 0 ? _g : 'python';
                            new_cell_id = undefined;
                            if (notebook.nbformat > 4 ||
                                (notebook.nbformat === 4 && notebook.nbformat_minor >= 5)) {
                                if (edit_mode === 'insert') {
                                    new_cell_id = Math.random().toString(36).substring(2, 15);
                                }
                                else if (cell_id !== null) {
                                    new_cell_id = cell_id;
                                }
                            }
                            if (edit_mode === 'delete') {
                                // Delete the specified cell
                                notebook.cells.splice(cellIndex, 1);
                            }
                            else if (edit_mode === 'insert') {
                                new_cell = void 0;
                                if (cell_type === 'markdown') {
                                    new_cell = {
                                        cell_type: 'markdown',
                                        id: new_cell_id,
                                        source: new_source,
                                        metadata: {},
                                    };
                                }
                                else {
                                    new_cell = {
                                        cell_type: 'code',
                                        id: new_cell_id,
                                        source: new_source,
                                        metadata: {},
                                        execution_count: null,
                                        outputs: [],
                                    };
                                }
                                // Insert the new cell
                                notebook.cells.splice(cellIndex, 0, new_cell);
                            }
                            else {
                                targetCell = notebook.cells[cellIndex] // validateInput ensures cell_number is in bounds
                                ;
                                targetCell.source = new_source;
                                if (targetCell.cell_type === 'code') {
                                    // Reset execution count and clear outputs since cell was modified
                                    targetCell.execution_count = null;
                                    targetCell.outputs = [];
                                }
                                if (cell_type && cell_type !== targetCell.cell_type) {
                                    targetCell.cell_type = cell_type;
                                }
                            }
                            IPYNB_INDENT = 1;
                            updatedContent = (0, slowOperations_js_1.jsonStringify)(notebook, null, IPYNB_INDENT);
                            (0, file_js_1.writeTextContent)(fullPath, updatedContent, encoding, lineEndings);
                            // Update readFileState with post-write mtime (matches FileEditTool/
                            // FileWriteTool). offset:undefined breaks FileReadTool's dedup match —
                            // without this, Read→NotebookEdit→Read in the same millisecond would
                            // return the file_unchanged stub against stale in-context content.
                            readFileState.set(fullPath, {
                                content: updatedContent,
                                timestamp: (0, file_js_1.getFileModificationTime)(fullPath),
                                offset: undefined,
                                limit: undefined,
                            });
                            data = {
                                new_source: new_source,
                                cell_type: cell_type !== null && cell_type !== void 0 ? cell_type : 'code',
                                language: language,
                                edit_mode: edit_mode !== null && edit_mode !== void 0 ? edit_mode : 'replace',
                                cell_id: new_cell_id || undefined,
                                error: '',
                                notebook_path: fullPath,
                                original_file: content,
                                updated_file: updatedContent,
                            };
                            return [2 /*return*/, {
                                    data: data,
                                }];
                        }
                        catch (error) {
                            if (error instanceof Error) {
                                data_1 = {
                                    new_source: new_source,
                                    cell_type: cell_type !== null && cell_type !== void 0 ? cell_type : 'code',
                                    language: 'python',
                                    edit_mode: 'replace',
                                    error: error.message,
                                    cell_id: cell_id,
                                    notebook_path: fullPath,
                                    original_file: '',
                                    updated_file: '',
                                };
                                return [2 /*return*/, {
                                        data: data_1,
                                    }];
                            }
                            data = {
                                new_source: new_source,
                                cell_type: cell_type !== null && cell_type !== void 0 ? cell_type : 'code',
                                language: 'python',
                                edit_mode: 'replace',
                                error: 'Unknown error occurred while editing notebook',
                                cell_id: cell_id,
                                notebook_path: fullPath,
                                original_file: '',
                                updated_file: '',
                            };
                            return [2 /*return*/, {
                                    data: data,
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    },
});
