"use strict";
/**
 * Sync file-read path, extracted from file.ts.
 *
 * file.ts sits in the settings SCC via log.ts → types/logs.ts → types/message.ts →
 * Tool.ts → commands.ts → … Anything that needs readFileSync from file.ts
 * pulls in the whole chain. This leaf imports only fsOperations and debug,
 * both of which terminate in Node builtins.
 *
 * detectFileEncoding/detectLineEndings stay in file.ts — they call logError
 * (log.ts → SCC) on unexpected failures. The -ForResolvedPath/-ForString
 * helpers here are the pure parts; callers who need the logging wrappers
 * import from file.ts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectEncodingForResolvedPath = detectEncodingForResolvedPath;
exports.detectLineEndingsForString = detectLineEndingsForString;
exports.readFileSyncWithMetadata = readFileSyncWithMetadata;
exports.readFileSync = readFileSync;
var debug_js_1 = require("./debug.js");
var fsOperations_js_1 = require("./fsOperations.js");
function detectEncodingForResolvedPath(resolvedPath) {
    var _a = (0, fsOperations_js_1.getFsImplementation)().readSync(resolvedPath, {
        length: 4096,
    }), buffer = _a.buffer, bytesRead = _a.bytesRead;
    // Empty files should default to utf8, not ascii
    // This fixes a bug where writing emojis/CJK to empty files caused corruption
    if (bytesRead === 0) {
        return 'utf8';
    }
    if (bytesRead >= 2) {
        if (buffer[0] === 0xff && buffer[1] === 0xfe)
            return 'utf16le';
    }
    if (bytesRead >= 3 &&
        buffer[0] === 0xef &&
        buffer[1] === 0xbb &&
        buffer[2] === 0xbf) {
        return 'utf8';
    }
    // For non-empty files, default to utf8 since it's a superset of ascii
    // and handles all Unicode characters properly
    return 'utf8';
}
function detectLineEndingsForString(content) {
    var crlfCount = 0;
    var lfCount = 0;
    for (var i = 0; i < content.length; i++) {
        if (content[i] === '\n') {
            if (i > 0 && content[i - 1] === '\r') {
                crlfCount++;
            }
            else {
                lfCount++;
            }
        }
    }
    return crlfCount > lfCount ? 'CRLF' : 'LF';
}
/**
 * Like readFileSync but also returns the detected encoding and original line
 * ending style in one filesystem pass. Callers writing the file back (e.g.
 * FileEditTool) can reuse these instead of calling detectFileEncoding /
 * detectLineEndings separately, which would each redo safeResolvePath +
 * readSync(4KB).
 */
function readFileSyncWithMetadata(filePath) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var _a = (0, fsOperations_js_1.safeResolvePath)(fs, filePath), resolvedPath = _a.resolvedPath, isSymlink = _a.isSymlink;
    if (isSymlink) {
        (0, debug_js_1.logForDebugging)("Reading through symlink: ".concat(filePath, " -> ").concat(resolvedPath));
    }
    var encoding = detectEncodingForResolvedPath(resolvedPath);
    var raw = fs.readFileSync(resolvedPath, { encoding: encoding });
    // Detect line endings from the raw head before CRLF normalization erases
    // the distinction. 4096 code units is ≥ detectLineEndings's 4096-byte
    // readSync sample (line endings are ASCII, so the unit mismatch is moot).
    var lineEndings = detectLineEndingsForString(raw.slice(0, 4096));
    return {
        content: raw.replaceAll('\r\n', '\n'),
        encoding: encoding,
        lineEndings: lineEndings,
    };
}
function readFileSync(filePath) {
    return readFileSyncWithMetadata(filePath).content;
}
