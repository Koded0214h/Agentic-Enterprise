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
exports.readNotebook = readNotebook;
exports.mapNotebookCellsToToolResult = mapNotebookCellsToToolResult;
exports.parseCellId = parseCellId;
var toolName_js_1 = require("../tools/BashTool/toolName.js");
var utils_js_1 = require("../tools/BashTool/utils.js");
var fsOperations_js_1 = require("./fsOperations.js");
var path_js_1 = require("./path.js");
var slowOperations_js_1 = require("./slowOperations.js");
var LARGE_OUTPUT_THRESHOLD = 10000;
function isLargeOutputs(outputs) {
    var _a, _b, _c, _d;
    var size = 0;
    for (var _i = 0, outputs_1 = outputs; _i < outputs_1.length; _i++) {
        var o = outputs_1[_i];
        if (!o)
            continue;
        size += ((_b = (_a = o.text) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) + ((_d = (_c = o.image) === null || _c === void 0 ? void 0 : _c.image_data.length) !== null && _d !== void 0 ? _d : 0);
        if (size > LARGE_OUTPUT_THRESHOLD)
            return true;
    }
    return false;
}
function processOutputText(text) {
    if (!text)
        return '';
    var rawText = Array.isArray(text) ? text.join('') : text;
    var truncatedContent = (0, utils_js_1.formatOutput)(rawText).truncatedContent;
    return truncatedContent;
}
function extractImage(data) {
    if (typeof data['image/png'] === 'string') {
        return {
            image_data: data['image/png'].replace(/\s/g, ''),
            media_type: 'image/png',
        };
    }
    if (typeof data['image/jpeg'] === 'string') {
        return {
            image_data: data['image/jpeg'].replace(/\s/g, ''),
            media_type: 'image/jpeg',
        };
    }
    return undefined;
}
function processOutput(output) {
    var _a;
    switch (output.output_type) {
        case 'stream':
            return {
                output_type: output.output_type,
                text: processOutputText(output.text),
            };
        case 'execute_result':
        case 'display_data':
            return {
                output_type: output.output_type,
                text: processOutputText((_a = output.data) === null || _a === void 0 ? void 0 : _a['text/plain']),
                image: output.data && extractImage(output.data),
            };
        case 'error':
            return {
                output_type: output.output_type,
                text: processOutputText("".concat(output.ename, ": ").concat(output.evalue, "\n").concat(output.traceback.join('\n'))),
            };
    }
}
function processCell(cell, index, codeLanguage, includeLargeOutputs) {
    var _a, _b;
    var cellId = (_a = cell.id) !== null && _a !== void 0 ? _a : "cell-".concat(index);
    var cellData = {
        cellType: cell.cell_type,
        source: Array.isArray(cell.source) ? cell.source.join('') : cell.source,
        execution_count: cell.cell_type === 'code' ? cell.execution_count || undefined : undefined,
        cell_id: cellId,
    };
    // Avoid giving text cells the code language.
    if (cell.cell_type === 'code') {
        cellData.language = codeLanguage;
    }
    if (cell.cell_type === 'code' && ((_b = cell.outputs) === null || _b === void 0 ? void 0 : _b.length)) {
        var outputs = cell.outputs.map(processOutput);
        if (!includeLargeOutputs && isLargeOutputs(outputs)) {
            cellData.outputs = [
                {
                    output_type: 'stream',
                    text: "Outputs are too large to include. Use ".concat(toolName_js_1.BASH_TOOL_NAME, " with: cat <notebook_path> | jq '.cells[").concat(index, "].outputs'"),
                },
            ];
        }
        else {
            cellData.outputs = outputs;
        }
    }
    return cellData;
}
function cellContentToToolResult(cell) {
    var metadata = [];
    if (cell.cellType !== 'code') {
        metadata.push("<cell_type>".concat(cell.cellType, "</cell_type>"));
    }
    if (cell.language !== 'python' && cell.cellType === 'code') {
        metadata.push("<language>".concat(cell.language, "</language>"));
    }
    var cellContent = "<cell id=\"".concat(cell.cell_id, "\">").concat(metadata.join('')).concat(cell.source, "</cell id=\"").concat(cell.cell_id, "\">");
    return {
        text: cellContent,
        type: 'text',
    };
}
function cellOutputToToolResult(output) {
    var outputs = [];
    if (output.text) {
        outputs.push({
            text: "\n".concat(output.text),
            type: 'text',
        });
    }
    if (output.image) {
        outputs.push({
            type: 'image',
            source: {
                data: output.image.image_data,
                media_type: output.image.media_type,
                type: 'base64',
            },
        });
    }
    return outputs;
}
function getToolResultFromCell(cell) {
    var _a;
    var contentResult = cellContentToToolResult(cell);
    var outputResults = (_a = cell.outputs) === null || _a === void 0 ? void 0 : _a.flatMap(cellOutputToToolResult);
    return __spreadArray([contentResult], (outputResults !== null && outputResults !== void 0 ? outputResults : []), true);
}
/**
 * Reads and parses a Jupyter notebook file into processed cell data
 */
function readNotebook(notebookPath, cellId) {
    return __awaiter(this, void 0, void 0, function () {
        var fullPath, buffer, content, notebook, language, cell;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    fullPath = (0, path_js_1.expandPath)(notebookPath);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().readFileBytes(fullPath)];
                case 1:
                    buffer = _c.sent();
                    content = buffer.toString('utf-8');
                    notebook = (0, slowOperations_js_1.jsonParse)(content);
                    language = (_b = (_a = notebook.metadata.language_info) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'python';
                    if (cellId) {
                        cell = notebook.cells.find(function (c) { return c.id === cellId; });
                        if (!cell) {
                            throw new Error("Cell with ID \"".concat(cellId, "\" not found in notebook"));
                        }
                        return [2 /*return*/, [processCell(cell, notebook.cells.indexOf(cell), language, true)]];
                    }
                    return [2 /*return*/, notebook.cells.map(function (cell, index) {
                            return processCell(cell, index, language, false);
                        })];
            }
        });
    });
}
/**
 * Maps notebook cell data to tool result block parameters with sophisticated text block merging
 */
function mapNotebookCellsToToolResult(data, toolUseID) {
    var allResults = data.flatMap(getToolResultFromCell);
    // Merge adjacent text blocks
    return {
        tool_use_id: toolUseID,
        type: 'tool_result',
        content: allResults.reduce(function (acc, curr) {
            if (acc.length === 0)
                return [curr];
            var prev = acc[acc.length - 1];
            if (prev && prev.type === 'text' && curr.type === 'text') {
                // Merge the text blocks
                prev.text += '\n' + curr.text;
                return acc;
            }
            acc.push(curr);
            return acc;
        }, []),
    };
}
function parseCellId(cellId) {
    var match = cellId.match(/^cell-(\d+)$/);
    if (match && match[1]) {
        var index = parseInt(match[1], 10);
        return isNaN(index) ? undefined : index;
    }
    return undefined;
}
