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
exports.stdErrAppendShellResetMessage = void 0;
exports.stripEmptyLines = stripEmptyLines;
exports.isImageOutput = isImageOutput;
exports.parseDataUri = parseDataUri;
exports.buildImageToolResult = buildImageToolResult;
exports.resizeShellImageOutput = resizeShellImageOutput;
exports.formatOutput = formatOutput;
exports.resetCwdIfOutsideProject = resetCwdIfOutsideProject;
exports.createContentSummary = createContentSummary;
var promises_1 = require("fs/promises");
var state_js_1 = require("src/bootstrap/state.js");
var index_js_1 = require("src/services/analytics/index.js");
var cwd_js_1 = require("src/utils/cwd.js");
var filesystem_js_1 = require("src/utils/permissions/filesystem.js");
var Shell_js_1 = require("src/utils/Shell.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var imageResizer_js_1 = require("../../utils/imageResizer.js");
var outputLimits_js_1 = require("../../utils/shell/outputLimits.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
/**
 * Strips leading and trailing lines that contain only whitespace/newlines.
 * Unlike trim(), this preserves whitespace within content lines and only removes
 * completely empty lines from the beginning and end.
 */
function stripEmptyLines(content) {
    var _a, _b;
    var lines = content.split('\n');
    // Find the first non-empty line
    var startIndex = 0;
    while (startIndex < lines.length && ((_a = lines[startIndex]) === null || _a === void 0 ? void 0 : _a.trim()) === '') {
        startIndex++;
    }
    // Find the last non-empty line
    var endIndex = lines.length - 1;
    while (endIndex >= 0 && ((_b = lines[endIndex]) === null || _b === void 0 ? void 0 : _b.trim()) === '') {
        endIndex--;
    }
    // If all lines are empty, return empty string
    if (startIndex > endIndex) {
        return '';
    }
    // Return the slice with non-empty lines
    return lines.slice(startIndex, endIndex + 1).join('\n');
}
/**
 * Check if content is a base64 encoded image data URL
 */
function isImageOutput(content) {
    return /^data:image\/[a-z0-9.+_-]+;base64,/i.test(content);
}
var DATA_URI_RE = /^data:([^;]+);base64,(.+)$/;
/**
 * Parse a data-URI string into its media type and base64 payload.
 * Input is trimmed before matching.
 */
function parseDataUri(s) {
    var match = s.trim().match(DATA_URI_RE);
    if (!match || !match[1] || !match[2])
        return null;
    return { mediaType: match[1], data: match[2] };
}
/**
 * Build an image tool_result block from shell stdout containing a data URI.
 * Returns null if parse fails so callers can fall through to text handling.
 */
function buildImageToolResult(stdout, toolUseID) {
    var parsed = parseDataUri(stdout);
    if (!parsed)
        return null;
    return {
        tool_use_id: toolUseID,
        type: 'tool_result',
        content: [
            {
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: parsed.mediaType,
                    data: parsed.data,
                },
            },
        ],
    };
}
// Cap file reads to 20 MB — any image data URI larger than this is
// well beyond what the API accepts (5 MB base64) and would OOM if read
// into memory.
var MAX_IMAGE_FILE_SIZE = 20 * 1024 * 1024;
/**
 * Resize image output from a shell tool. stdout is capped at
 * getMaxOutputLength() when read back from the shell output file — if the
 * full output spilled to disk, re-read it from there, since truncated base64
 * would decode to a corrupt image that either throws here or gets rejected by
 * the API. Caps dimensions too: compressImageBuffer only checks byte size, so
 * a small-but-high-DPI PNG (e.g. matplotlib at dpi=300) sails through at full
 * resolution and poisons many-image requests (CC-304).
 *
 * Returns the re-encoded data URI on success, or null if the source didn't
 * parse as a data URI (caller decides whether to flip isImage).
 */
function resizeShellImageOutput(stdout, outputFilePath, outputFileSize) {
    return __awaiter(this, void 0, void 0, function () {
        var source, size, _a, parsed, buf, ext, resized;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    source = stdout;
                    if (!outputFilePath) return [3 /*break*/, 5];
                    if (!(outputFileSize !== null && outputFileSize !== void 0)) return [3 /*break*/, 1];
                    _a = outputFileSize;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, (0, promises_1.stat)(outputFilePath)];
                case 2:
                    _a = (_b.sent()).size;
                    _b.label = 3;
                case 3:
                    size = _a;
                    if (size > MAX_IMAGE_FILE_SIZE)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, (0, promises_1.readFile)(outputFilePath, 'utf8')];
                case 4:
                    source = _b.sent();
                    _b.label = 5;
                case 5:
                    parsed = parseDataUri(source);
                    if (!parsed)
                        return [2 /*return*/, null];
                    buf = Buffer.from(parsed.data, 'base64');
                    ext = parsed.mediaType.split('/')[1] || 'png';
                    return [4 /*yield*/, (0, imageResizer_js_1.maybeResizeAndDownsampleImageBuffer)(buf, buf.length, ext)];
                case 6:
                    resized = _b.sent();
                    return [2 /*return*/, "data:image/".concat(resized.mediaType, ";base64,").concat(resized.buffer.toString('base64'))];
            }
        });
    });
}
function formatOutput(content) {
    var isImage = isImageOutput(content);
    if (isImage) {
        return {
            totalLines: 1,
            truncatedContent: content,
            isImage: isImage,
        };
    }
    var maxOutputLength = (0, outputLimits_js_1.getMaxOutputLength)();
    if (content.length <= maxOutputLength) {
        return {
            totalLines: (0, stringUtils_js_1.countCharInString)(content, '\n') + 1,
            truncatedContent: content,
            isImage: isImage,
        };
    }
    var truncatedPart = content.slice(0, maxOutputLength);
    var remainingLines = (0, stringUtils_js_1.countCharInString)(content, '\n', maxOutputLength) + 1;
    var truncated = "".concat(truncatedPart, "\n\n... [").concat(remainingLines, " lines truncated] ...");
    return {
        totalLines: (0, stringUtils_js_1.countCharInString)(content, '\n') + 1,
        truncatedContent: truncated,
        isImage: isImage,
    };
}
var stdErrAppendShellResetMessage = function (stderr) {
    return "".concat(stderr.trim(), "\nShell cwd was reset to ").concat((0, state_js_1.getOriginalCwd)());
};
exports.stdErrAppendShellResetMessage = stdErrAppendShellResetMessage;
function resetCwdIfOutsideProject(toolPermissionContext) {
    var cwd = (0, cwd_js_1.getCwd)();
    var originalCwd = (0, state_js_1.getOriginalCwd)();
    var shouldMaintain = (0, envUtils_js_1.shouldMaintainProjectWorkingDir)();
    if (shouldMaintain ||
        // Fast path: originalCwd is unconditionally in allWorkingDirectories
        // (filesystem.ts), so when cwd hasn't moved, pathInAllowedWorkingPath is
        // trivially true — skip its syscalls for the no-cd common case.
        (cwd !== originalCwd &&
            !(0, filesystem_js_1.pathInAllowedWorkingPath)(cwd, toolPermissionContext))) {
        // Reset to original directory if maintaining project dir OR outside allowed working directory
        (0, Shell_js_1.setCwd)(originalCwd);
        if (!shouldMaintain) {
            (0, index_js_1.logEvent)('tengu_bash_tool_reset_to_original_dir', {});
            return true;
        }
    }
    return false;
}
/**
 * Creates a human-readable summary of structured content blocks.
 * Used to display MCP results with images and text in the UI.
 */
function createContentSummary(content) {
    var parts = [];
    var textCount = 0;
    var imageCount = 0;
    for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
        var block = content_1[_i];
        if (block.type === 'image') {
            imageCount++;
        }
        else if (block.type === 'text' && 'text' in block) {
            textCount++;
            // Include first 200 chars of text blocks for context
            var preview = block.text.slice(0, 200);
            parts.push(preview + (block.text.length > 200 ? '...' : ''));
        }
    }
    var summary = [];
    if (imageCount > 0) {
        summary.push("[".concat(imageCount, " ").concat((0, stringUtils_js_1.plural)(imageCount, 'image'), "]"));
    }
    if (textCount > 0) {
        summary.push("[".concat(textCount, " text ").concat((0, stringUtils_js_1.plural)(textCount, 'block'), "]"));
    }
    return "MCP Result: ".concat(summary.join(', ')).concat(parts.length > 0 ? '\n\n' + parts.join('\n\n') : '');
}
