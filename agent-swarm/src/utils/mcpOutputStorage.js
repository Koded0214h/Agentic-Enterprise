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
exports.getFormatDescription = getFormatDescription;
exports.getLargeOutputInstructions = getLargeOutputInstructions;
exports.extensionForMimeType = extensionForMimeType;
exports.isBinaryContentType = isBinaryContentType;
exports.persistBinaryContent = persistBinaryContent;
exports.getBinaryBlobSavedMessage = getBinaryBlobSavedMessage;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var index_js_1 = require("../services/analytics/index.js");
var errors_js_1 = require("./errors.js");
var format_js_1 = require("./format.js");
var log_js_1 = require("./log.js");
var toolResultStorage_js_1 = require("./toolResultStorage.js");
/**
 * Generates a format description string based on the MCP result type and schema.
 */
function getFormatDescription(type, schema) {
    switch (type) {
        case 'toolResult':
            return 'Plain text';
        case 'structuredContent':
            return schema ? "JSON with schema: ".concat(schema) : 'JSON';
        case 'contentArray':
            return schema ? "JSON array with schema: ".concat(schema) : 'JSON array';
    }
}
/**
 * Generates instruction text for Claude to read from a saved output file.
 *
 * @param rawOutputPath - Path to the saved output file
 * @param contentLength - Length of the content in characters
 * @param formatDescription - Description of the content format
 * @param maxReadLength - Optional max chars for Read tool (for Bash output context)
 * @returns Instruction text to include in the tool result
 */
function getLargeOutputInstructions(rawOutputPath, contentLength, formatDescription, maxReadLength) {
    var baseInstructions = "Error: result (".concat(contentLength.toLocaleString(), " characters) exceeds maximum allowed tokens. Output has been saved to ").concat(rawOutputPath, ".\n") +
        "Format: ".concat(formatDescription, "\n") +
        "Use offset and limit parameters to read specific portions of the file, search within it for specific content, and jq to make structured queries.\n" +
        "REQUIREMENTS FOR SUMMARIZATION/ANALYSIS/REVIEW:\n" +
        "- You MUST read the content from the file at ".concat(rawOutputPath, " in sequential chunks until 100% of the content has been read.\n");
    var truncationWarning = maxReadLength
        ? "- If you receive truncation warnings when reading the file (\"[N lines truncated]\"), reduce the chunk size until you have read 100% of the content without truncation ***DO NOT PROCEED UNTIL YOU HAVE DONE THIS***. Bash output is limited to ".concat(maxReadLength.toLocaleString(), " chars.\n")
        : "- If you receive truncation warnings when reading the file, reduce the chunk size until you have read 100% of the content without truncation.\n";
    var completionRequirement = "- Before producing ANY summary or analysis, you MUST explicitly describe what portion of the content you have read. ***If you did not read the entire content, you MUST explicitly state this.***\n";
    return baseInstructions + truncationWarning + completionRequirement;
}
/**
 * Map a mime type to a file extension. Conservative: known types get their
 * proper extension; unknown types get 'bin'. The extension matters because
 * the Read tool dispatches on it (PDFs, images, etc. need the right ext).
 */
function extensionForMimeType(mimeType) {
    var _a;
    if (!mimeType)
        return 'bin';
    // Strip any charset/boundary parameter
    var mt = ((_a = mimeType.split(';')[0]) !== null && _a !== void 0 ? _a : '').trim().toLowerCase();
    switch (mt) {
        case 'application/pdf':
            return 'pdf';
        case 'application/json':
            return 'json';
        case 'text/csv':
            return 'csv';
        case 'text/plain':
            return 'txt';
        case 'text/html':
            return 'html';
        case 'text/markdown':
            return 'md';
        case 'application/zip':
            return 'zip';
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'docx';
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return 'xlsx';
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            return 'pptx';
        case 'application/msword':
            return 'doc';
        case 'application/vnd.ms-excel':
            return 'xls';
        case 'audio/mpeg':
            return 'mp3';
        case 'audio/wav':
            return 'wav';
        case 'audio/ogg':
            return 'ogg';
        case 'video/mp4':
            return 'mp4';
        case 'video/webm':
            return 'webm';
        case 'image/png':
            return 'png';
        case 'image/jpeg':
            return 'jpg';
        case 'image/gif':
            return 'gif';
        case 'image/webp':
            return 'webp';
        case 'image/svg+xml':
            return 'svg';
        default:
            return 'bin';
    }
}
/**
 * Heuristic for whether a content-type header indicates binary content that
 * should be saved to disk rather than put into the model context.
 * Text-ish types (text/*, json, xml, form data) are treated as non-binary.
 */
function isBinaryContentType(contentType) {
    var _a;
    if (!contentType)
        return false;
    var mt = ((_a = contentType.split(';')[0]) !== null && _a !== void 0 ? _a : '').trim().toLowerCase();
    if (mt.startsWith('text/'))
        return false;
    // Structured text formats delivered with an application/ type. Use suffix
    // or exact match rather than substring so 'openxmlformats' (docx/xlsx) stays binary.
    if (mt.endsWith('+json') || mt === 'application/json')
        return false;
    if (mt.endsWith('+xml') || mt === 'application/xml')
        return false;
    if (mt.startsWith('application/javascript'))
        return false;
    if (mt === 'application/x-www-form-urlencoded')
        return false;
    return true;
}
/**
 * Write raw binary bytes to the tool-results directory with a mime-derived
 * extension. Unlike persistToolResult (which stringifies), this writes the
 * bytes as-is so the resulting file can be opened with native tools (Read
 * for PDFs, pandas for xlsx, etc.).
 */
function persistBinaryContent(bytes, mimeType, persistId) {
    return __awaiter(this, void 0, void 0, function () {
        var ext, filepath, error_1, err;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, toolResultStorage_js_1.ensureToolResultsDir)()];
                case 1:
                    _a.sent();
                    ext = extensionForMimeType(mimeType);
                    filepath = (0, path_1.join)((0, toolResultStorage_js_1.getToolResultsDir)(), "".concat(persistId, ".").concat(ext));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(filepath, bytes)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    err = (0, errors_js_1.toError)(error_1);
                    (0, log_js_1.logError)(err);
                    return [2 /*return*/, { error: err.message }];
                case 5:
                    // mime type and extension are safe fixed-vocabulary strings (not paths/code)
                    (0, index_js_1.logEvent)('tengu_binary_content_persisted', {
                        mimeType: (mimeType !== null && mimeType !== void 0 ? mimeType : 'unknown'),
                        sizeBytes: bytes.length,
                        ext: ext,
                    });
                    return [2 /*return*/, { filepath: filepath, size: bytes.length, ext: ext }];
            }
        });
    });
}
/**
 * Build a short message telling Claude where binary content was saved.
 * Just states the path — no prescriptive hint, since what the model can
 * actually do with the file depends on provider/tooling.
 */
function getBinaryBlobSavedMessage(filepath, mimeType, size, sourceDescription) {
    var mt = mimeType || 'unknown type';
    return "".concat(sourceDescription, "Binary content (").concat(mt, ", ").concat((0, format_js_1.formatFileSize)(size), ") saved to ").concat(filepath);
}
