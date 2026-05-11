"use strict";
/**
 * Portable session storage utilities.
 *
 * Pure Node.js — no internal dependencies on logging, experiments, or feature
 * flags. Shared between the CLI (src/utils/sessionStorage.ts) and the VS Code
 * extension (packages/claude-vscode/src/common-host/sessionStorage.ts).
 */
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
exports.SKIP_PRECOMPACT_THRESHOLD = exports.MAX_SANITIZED_LENGTH = exports.LITE_READ_BUF_SIZE = void 0;
exports.validateUuid = validateUuid;
exports.unescapeJsonString = unescapeJsonString;
exports.extractJsonStringField = extractJsonStringField;
exports.extractLastJsonStringField = extractLastJsonStringField;
exports.extractFirstPromptFromHead = extractFirstPromptFromHead;
exports.readHeadAndTail = readHeadAndTail;
exports.readSessionLite = readSessionLite;
exports.sanitizePath = sanitizePath;
exports.getProjectsDir = getProjectsDir;
exports.getProjectDir = getProjectDir;
exports.canonicalizePath = canonicalizePath;
exports.findProjectDir = findProjectDir;
exports.resolveSessionFilePath = resolveSessionFilePath;
exports.readTranscriptForLoad = readTranscriptForLoad;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var envUtils_js_1 = require("./envUtils.js");
var getWorktreePathsPortable_js_1 = require("./getWorktreePathsPortable.js");
var hash_js_1 = require("./hash.js");
/** Size of the head/tail buffer for lite metadata reads. */
exports.LITE_READ_BUF_SIZE = 65536;
// ---------------------------------------------------------------------------
// UUID validation
// ---------------------------------------------------------------------------
var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function validateUuid(maybeUuid) {
    if (typeof maybeUuid !== 'string')
        return null;
    return uuidRegex.test(maybeUuid) ? maybeUuid : null;
}
// ---------------------------------------------------------------------------
// JSON string field extraction — no full parse, works on truncated lines
// ---------------------------------------------------------------------------
/**
 * Unescape a JSON string value extracted as raw text.
 * Only allocates a new string when escape sequences are present.
 */
function unescapeJsonString(raw) {
    if (!raw.includes('\\'))
        return raw;
    try {
        return JSON.parse("\"".concat(raw, "\""));
    }
    catch (_a) {
        return raw;
    }
}
/**
 * Extracts a simple JSON string field value from raw text without full parsing.
 * Looks for `"key":"value"` or `"key": "value"` patterns.
 * Returns the first match, or undefined if not found.
 */
function extractJsonStringField(text, key) {
    var patterns = ["\"".concat(key, "\":\""), "\"".concat(key, "\": \"")];
    for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
        var pattern = patterns_1[_i];
        var idx = text.indexOf(pattern);
        if (idx < 0)
            continue;
        var valueStart = idx + pattern.length;
        var i = valueStart;
        while (i < text.length) {
            if (text[i] === '\\') {
                i += 2;
                continue;
            }
            if (text[i] === '"') {
                return unescapeJsonString(text.slice(valueStart, i));
            }
            i++;
        }
    }
    return undefined;
}
/**
 * Like extractJsonStringField but finds the LAST occurrence.
 * Useful for fields that are appended (customTitle, tag, etc.).
 */
function extractLastJsonStringField(text, key) {
    var patterns = ["\"".concat(key, "\":\""), "\"".concat(key, "\": \"")];
    var lastValue;
    for (var _i = 0, patterns_2 = patterns; _i < patterns_2.length; _i++) {
        var pattern = patterns_2[_i];
        var searchFrom = 0;
        while (true) {
            var idx = text.indexOf(pattern, searchFrom);
            if (idx < 0)
                break;
            var valueStart = idx + pattern.length;
            var i = valueStart;
            while (i < text.length) {
                if (text[i] === '\\') {
                    i += 2;
                    continue;
                }
                if (text[i] === '"') {
                    lastValue = unescapeJsonString(text.slice(valueStart, i));
                    break;
                }
                i++;
            }
            searchFrom = i + 1;
        }
    }
    return lastValue;
}
// ---------------------------------------------------------------------------
// First prompt extraction from head chunk
// ---------------------------------------------------------------------------
/**
 * Pattern matching auto-generated or system messages that should be skipped
 * when looking for the first meaningful user prompt. Matches anything that
 * starts with a lowercase XML-like tag (IDE context, hook output, task
 * notifications, channel messages, etc.) or a synthetic interrupt marker.
 */
var SKIP_FIRST_PROMPT_PATTERN = /^(?:\s*<[a-z][\w-]*[\s>]|\[Request interrupted by user[^\]]*\])/;
var COMMAND_NAME_RE = /<command-name>(.*?)<\/command-name>/;
/**
 * Extracts the first meaningful user prompt from a JSONL head chunk.
 *
 * Skips tool_result messages, isMeta, isCompactSummary, command-name messages,
 * and auto-generated patterns (session hooks, tick, IDE metadata, etc.).
 * Truncates to 200 chars.
 */
function extractFirstPromptFromHead(head) {
    var start = 0;
    var commandFallback = '';
    while (start < head.length) {
        var newlineIdx = head.indexOf('\n', start);
        var line = newlineIdx >= 0 ? head.slice(start, newlineIdx) : head.slice(start);
        start = newlineIdx >= 0 ? newlineIdx + 1 : head.length;
        if (!line.includes('"type":"user"') && !line.includes('"type": "user"'))
            continue;
        if (line.includes('"tool_result"'))
            continue;
        if (line.includes('"isMeta":true') || line.includes('"isMeta": true'))
            continue;
        if (line.includes('"isCompactSummary":true') ||
            line.includes('"isCompactSummary": true'))
            continue;
        try {
            var entry = JSON.parse(line);
            if (entry.type !== 'user')
                continue;
            var message = entry.message;
            if (!message)
                continue;
            var content = message.content;
            var texts = [];
            if (typeof content === 'string') {
                texts.push(content);
            }
            else if (Array.isArray(content)) {
                for (var _i = 0, _a = content; _i < _a.length; _i++) {
                    var block = _a[_i];
                    if (block.type === 'text' && typeof block.text === 'string') {
                        texts.push(block.text);
                    }
                }
            }
            for (var _b = 0, texts_1 = texts; _b < texts_1.length; _b++) {
                var raw = texts_1[_b];
                var result = raw.replace(/\n/g, ' ').trim();
                if (!result)
                    continue;
                // Skip slash-command messages but remember first as fallback
                var cmdMatch = COMMAND_NAME_RE.exec(result);
                if (cmdMatch) {
                    if (!commandFallback)
                        commandFallback = cmdMatch[1];
                    continue;
                }
                // Format bash input with ! prefix before the generic XML skip
                var bashMatch = /<bash-input>([\s\S]*?)<\/bash-input>/.exec(result);
                if (bashMatch)
                    return "! ".concat(bashMatch[1].trim());
                if (SKIP_FIRST_PROMPT_PATTERN.test(result))
                    continue;
                if (result.length > 200) {
                    result = result.slice(0, 200).trim() + '\u2026';
                }
                return result;
            }
        }
        catch (_c) {
            continue;
        }
    }
    if (commandFallback)
        return commandFallback;
    return '';
}
// ---------------------------------------------------------------------------
// File I/O — read head and tail of a file
// ---------------------------------------------------------------------------
/**
 * Reads the first and last LITE_READ_BUF_SIZE bytes of a file.
 *
 * For small files where head covers tail, `tail === head`.
 * Accepts a shared Buffer to avoid per-file allocation overhead.
 * Returns `{ head: '', tail: '' }` on any error.
 */
function readHeadAndTail(filePath, fileSize, buf) {
    return __awaiter(this, void 0, void 0, function () {
        var fh, headResult, head, tailOffset, tail, tailResult, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, (0, promises_1.open)(filePath, 'r')];
                case 1:
                    fh = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, , 6, 8]);
                    return [4 /*yield*/, fh.read(buf, 0, exports.LITE_READ_BUF_SIZE, 0)];
                case 3:
                    headResult = _b.sent();
                    if (headResult.bytesRead === 0)
                        return [2 /*return*/, { head: '', tail: '' }];
                    head = buf.toString('utf8', 0, headResult.bytesRead);
                    tailOffset = Math.max(0, fileSize - exports.LITE_READ_BUF_SIZE);
                    tail = head;
                    if (!(tailOffset > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, fh.read(buf, 0, exports.LITE_READ_BUF_SIZE, tailOffset)];
                case 4:
                    tailResult = _b.sent();
                    tail = buf.toString('utf8', 0, tailResult.bytesRead);
                    _b.label = 5;
                case 5: return [2 /*return*/, { head: head, tail: tail }];
                case 6: return [4 /*yield*/, fh.close()];
                case 7:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 8: return [3 /*break*/, 10];
                case 9:
                    _a = _b.sent();
                    return [2 /*return*/, { head: '', tail: '' }];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Opens a single session file, stats it, and reads head + tail in one fd.
 * Allocates its own buffer — safe for concurrent use with Promise.all.
 * Returns null on any error.
 */
function readSessionLite(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var fh, stat_1, buf, headResult, head, tailOffset, tail, tailResult, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, (0, promises_1.open)(filePath, 'r')];
                case 1:
                    fh = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, , 7, 9]);
                    return [4 /*yield*/, fh.stat()];
                case 3:
                    stat_1 = _b.sent();
                    buf = Buffer.allocUnsafe(exports.LITE_READ_BUF_SIZE);
                    return [4 /*yield*/, fh.read(buf, 0, exports.LITE_READ_BUF_SIZE, 0)];
                case 4:
                    headResult = _b.sent();
                    if (headResult.bytesRead === 0)
                        return [2 /*return*/, null];
                    head = buf.toString('utf8', 0, headResult.bytesRead);
                    tailOffset = Math.max(0, stat_1.size - exports.LITE_READ_BUF_SIZE);
                    tail = head;
                    if (!(tailOffset > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, fh.read(buf, 0, exports.LITE_READ_BUF_SIZE, tailOffset)];
                case 5:
                    tailResult = _b.sent();
                    tail = buf.toString('utf8', 0, tailResult.bytesRead);
                    _b.label = 6;
                case 6: return [2 /*return*/, { mtime: stat_1.mtime.getTime(), size: stat_1.size, head: head, tail: tail }];
                case 7: return [4 /*yield*/, fh.close()];
                case 8:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 9: return [3 /*break*/, 11];
                case 10:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// ---------------------------------------------------------------------------
// Path sanitization
// ---------------------------------------------------------------------------
/**
 * Maximum length for a single filesystem path component (directory or file name).
 * Most filesystems (ext4, APFS, NTFS) limit individual components to 255 bytes.
 * We use 200 to leave room for the hash suffix and separator.
 */
exports.MAX_SANITIZED_LENGTH = 200;
function simpleHash(str) {
    return Math.abs((0, hash_js_1.djb2Hash)(str)).toString(36);
}
/**
 * Makes a string safe for use as a directory or file name.
 * Replaces all non-alphanumeric characters with hyphens.
 * This ensures compatibility across all platforms, including Windows
 * where characters like colons are reserved.
 *
 * For deeply nested paths that would exceed filesystem limits (255 bytes),
 * truncates and appends a hash suffix for uniqueness.
 *
 * @param name - The string to make safe (e.g., '/Users/foo/my-project' or 'plugin:name:server')
 * @returns A safe name (e.g., '-Users-foo-my-project' or 'plugin-name-server')
 */
function sanitizePath(name) {
    var sanitized = name.replace(/[^a-zA-Z0-9]/g, '-');
    if (sanitized.length <= exports.MAX_SANITIZED_LENGTH) {
        return sanitized;
    }
    var hash = typeof Bun !== 'undefined' ? Bun.hash(name).toString(36) : simpleHash(name);
    return "".concat(sanitized.slice(0, exports.MAX_SANITIZED_LENGTH), "-").concat(hash);
}
// ---------------------------------------------------------------------------
// Project directory discovery (shared by listSessions & getSessionMessages)
// ---------------------------------------------------------------------------
function getProjectsDir() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'projects');
}
function getProjectDir(projectDir) {
    return (0, path_1.join)(getProjectsDir(), sanitizePath(projectDir));
}
/**
 * Resolves a directory path to its canonical form using realpath + NFC
 * normalization. Falls back to NFC-only if realpath fails (e.g., the
 * directory doesn't exist yet). Ensures symlinked paths (e.g.,
 * /tmp → /private/tmp on macOS) resolve to the same project directory.
 */
function canonicalizePath(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.realpath)(dir)];
                case 1: return [2 /*return*/, (_b.sent()).normalize('NFC')];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, dir.normalize('NFC')];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Finds the project directory for a given path, tolerating hash mismatches
 * for long paths (>200 chars). The CLI uses Bun.hash while the SDK under
 * Node.js uses simpleHash — for paths that exceed MAX_SANITIZED_LENGTH,
 * these produce different directory suffixes. This function falls back to
 * prefix-based scanning when the exact match doesn't exist.
 */
function findProjectDir(projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var exact, _a, sanitized, prefix_1, projectsDir, dirents, match, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    exact = getProjectDir(projectPath);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 8]);
                    return [4 /*yield*/, (0, promises_1.readdir)(exact)];
                case 2:
                    _c.sent();
                    return [2 /*return*/, exact];
                case 3:
                    _a = _c.sent();
                    sanitized = sanitizePath(projectPath);
                    if (sanitized.length <= exports.MAX_SANITIZED_LENGTH) {
                        return [2 /*return*/, undefined];
                    }
                    prefix_1 = sanitized.slice(0, exports.MAX_SANITIZED_LENGTH);
                    projectsDir = getProjectsDir();
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, promises_1.readdir)(projectsDir, { withFileTypes: true })];
                case 5:
                    dirents = _c.sent();
                    match = dirents.find(function (d) { return d.isDirectory() && d.name.startsWith(prefix_1 + '-'); });
                    return [2 /*return*/, match ? (0, path_1.join)(projectsDir, match.name) : undefined];
                case 6:
                    _b = _c.sent();
                    return [2 /*return*/, undefined];
                case 7: return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Resolve a sessionId to its on-disk JSONL file path.
 *
 * When `dir` is provided: canonicalize it, look in that project's directory
 * (with findProjectDir fallback for Bun/Node hash mismatches), then fall back
 * to sibling git worktrees. `projectPath` in the result is the canonical
 * user-facing directory the file was found under.
 *
 * When `dir` is omitted: scan all project directories under ~/.claude/projects/.
 * `projectPath` is undefined in this case (no meaningful project path to report).
 *
 * Existence is checked by stat (operate-then-catch-ENOENT, no existsSync).
 * Zero-byte files are treated as not-found so callers continue searching past
 * a truncated copy to find a valid one in a sibling directory.
 *
 * `fileSize` is returned so callers (loadSessionBuffer) don't need to re-stat.
 *
 * Shared by getSessionInfoImpl and getSessionMessagesImpl — the caller
 * invokes its own reader (readSessionLite / loadSessionBuffer) on the
 * resolved path.
 */
function resolveSessionFilePath(sessionId, dir) {
    return __awaiter(this, void 0, void 0, function () {
        var fileName, canonical, projectDir, filePath, s, _a, worktreePaths, _b, _i, worktreePaths_1, wt, wtProjectDir, filePath, s, _c, projectsDir, dirents, _d, _e, dirents_1, name_1, filePath, s, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    fileName = "".concat(sessionId, ".jsonl");
                    if (!dir) return [3 /*break*/, 18];
                    return [4 /*yield*/, canonicalizePath(dir)];
                case 1:
                    canonical = _g.sent();
                    return [4 /*yield*/, findProjectDir(canonical)];
                case 2:
                    projectDir = _g.sent();
                    if (!projectDir) return [3 /*break*/, 6];
                    filePath = (0, path_1.join)(projectDir, fileName);
                    _g.label = 3;
                case 3:
                    _g.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                case 4:
                    s = _g.sent();
                    if (s.size > 0)
                        return [2 /*return*/, { filePath: filePath, projectPath: canonical, fileSize: s.size }];
                    return [3 /*break*/, 6];
                case 5:
                    _a = _g.sent();
                    return [3 /*break*/, 6];
                case 6:
                    worktreePaths = void 0;
                    _g.label = 7;
                case 7:
                    _g.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, getWorktreePathsPortable_js_1.getWorktreePathsPortable)(canonical)];
                case 8:
                    worktreePaths = _g.sent();
                    return [3 /*break*/, 10];
                case 9:
                    _b = _g.sent();
                    worktreePaths = [];
                    return [3 /*break*/, 10];
                case 10:
                    _i = 0, worktreePaths_1 = worktreePaths;
                    _g.label = 11;
                case 11:
                    if (!(_i < worktreePaths_1.length)) return [3 /*break*/, 17];
                    wt = worktreePaths_1[_i];
                    if (wt === canonical)
                        return [3 /*break*/, 16];
                    return [4 /*yield*/, findProjectDir(wt)];
                case 12:
                    wtProjectDir = _g.sent();
                    if (!wtProjectDir)
                        return [3 /*break*/, 16];
                    filePath = (0, path_1.join)(wtProjectDir, fileName);
                    _g.label = 13;
                case 13:
                    _g.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                case 14:
                    s = _g.sent();
                    if (s.size > 0)
                        return [2 /*return*/, { filePath: filePath, projectPath: wt, fileSize: s.size }];
                    return [3 /*break*/, 16];
                case 15:
                    _c = _g.sent();
                    return [3 /*break*/, 16];
                case 16:
                    _i++;
                    return [3 /*break*/, 11];
                case 17: return [2 /*return*/, undefined];
                case 18:
                    projectsDir = getProjectsDir();
                    _g.label = 19;
                case 19:
                    _g.trys.push([19, 21, , 22]);
                    return [4 /*yield*/, (0, promises_1.readdir)(projectsDir)];
                case 20:
                    dirents = _g.sent();
                    return [3 /*break*/, 22];
                case 21:
                    _d = _g.sent();
                    return [2 /*return*/, undefined];
                case 22:
                    _e = 0, dirents_1 = dirents;
                    _g.label = 23;
                case 23:
                    if (!(_e < dirents_1.length)) return [3 /*break*/, 28];
                    name_1 = dirents_1[_e];
                    filePath = (0, path_1.join)(projectsDir, name_1, fileName);
                    _g.label = 24;
                case 24:
                    _g.trys.push([24, 26, , 27]);
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                case 25:
                    s = _g.sent();
                    if (s.size > 0)
                        return [2 /*return*/, { filePath: filePath, projectPath: undefined, fileSize: s.size }];
                    return [3 /*break*/, 27];
                case 26:
                    _f = _g.sent();
                    return [3 /*break*/, 27];
                case 27:
                    _e++;
                    return [3 /*break*/, 23];
                case 28: return [2 /*return*/, undefined];
            }
        });
    });
}
// ---------------------------------------------------------------------------
// Compact-boundary chunked read (shared by loadTranscriptFile & SDK getSessionMessages)
// ---------------------------------------------------------------------------
/** Chunk size for the forward transcript reader. 1 MB balances I/O calls vs buffer growth. */
var TRANSCRIPT_READ_CHUNK_SIZE = 1024 * 1024;
/**
 * File size below which precompact filtering is skipped.
 * Large sessions (>5 MB) almost always have compact boundaries — they got big
 * because of many turns triggering auto-compact.
 */
exports.SKIP_PRECOMPACT_THRESHOLD = 5 * 1024 * 1024;
/** Marker bytes searched for when locating the boundary. Lazy: allocated on
 * first use, not at module load. Most sessions never resume. */
var _compactBoundaryMarker;
function compactBoundaryMarker() {
    return (_compactBoundaryMarker !== null && _compactBoundaryMarker !== void 0 ? _compactBoundaryMarker : (_compactBoundaryMarker = Buffer.from('"compact_boundary"')));
}
/**
 * Confirm a byte-matched line is a real compact_boundary (marker can appear
 * inside user content) and check for preservedSegment.
 */
function parseBoundaryLine(line) {
    var _a;
    try {
        var parsed = JSON.parse(line);
        if (parsed.type !== 'system' || parsed.subtype !== 'compact_boundary') {
            return null;
        }
        return {
            hasPreservedSegment: Boolean((_a = parsed.compactMetadata) === null || _a === void 0 ? void 0 : _a.preservedSegment),
        };
    }
    catch (_b) {
        return null;
    }
}
function sinkWrite(s, src, start, end) {
    var n = end - start;
    if (n <= 0)
        return;
    if (s.len + n > s.buf.length) {
        var grown = Buffer.allocUnsafe(Math.min(Math.max(s.buf.length * 2, s.len + n), s.cap));
        s.buf.copy(grown, 0, 0, s.len);
        s.buf = grown;
    }
    src.copy(s.buf, s.len, start, end);
    s.len += n;
}
function hasPrefix(src, prefix, at, end) {
    return (end - at >= prefix.length &&
        src.compare(prefix, 0, prefix.length, at, at + prefix.length) === 0);
}
var ATTR_SNAP_PREFIX = Buffer.from('{"type":"attribution-snapshot"');
var SYSTEM_PREFIX = Buffer.from('{"type":"system"');
var LF = 0x0a;
var LF_BYTE = Buffer.from([LF]);
var BOUNDARY_SEARCH_BOUND = 256; // marker sits ~28 bytes in; 256 is slack
// Line spanning the chunk seam. 0 = fall through to concat.
function processStraddle(s, chunk, bytesRead) {
    s.straddleSnapCarryLen = 0;
    s.straddleSnapTailEnd = 0;
    if (s.carryLen === 0)
        return 0;
    var cb = s.carryBuf;
    var firstNl = chunk.indexOf(LF);
    if (firstNl === -1 || firstNl >= bytesRead)
        return 0;
    var tailEnd = firstNl + 1;
    if (hasPrefix(cb, ATTR_SNAP_PREFIX, 0, s.carryLen)) {
        s.straddleSnapCarryLen = s.carryLen;
        s.straddleSnapTailEnd = tailEnd;
        s.lastSnapSrc = null;
    }
    else if (s.carryLen < ATTR_SNAP_PREFIX.length) {
        return 0; // too short to rule out attr-snap
    }
    else {
        if (hasPrefix(cb, SYSTEM_PREFIX, 0, s.carryLen)) {
            var hit = parseBoundaryLine(cb.toString('utf-8', 0, s.carryLen) +
                chunk.toString('utf-8', 0, firstNl));
            if (hit === null || hit === void 0 ? void 0 : hit.hasPreservedSegment) {
                s.hasPreservedSegment = true;
            }
            else if (hit) {
                s.out.len = 0;
                s.boundaryStartOffset = s.bufFileOff;
                s.hasPreservedSegment = false;
                s.lastSnapSrc = null;
            }
        }
        sinkWrite(s.out, cb, 0, s.carryLen);
        sinkWrite(s.out, chunk, 0, tailEnd);
    }
    s.bufFileOff += s.carryLen + tailEnd;
    s.carryLen = 0;
    return tailEnd;
}
// Strip attr-snaps, truncate on boundaries. Kept lines write as runs.
function scanChunkLines(s, buf, boundaryMarker) {
    var boundaryAt = buf.indexOf(boundaryMarker);
    var runStart = 0;
    var lineStart = 0;
    var lastSnapStart = -1;
    var lastSnapEnd = -1;
    var nl = buf.indexOf(LF);
    while (nl !== -1) {
        var lineEnd = nl + 1;
        if (boundaryAt !== -1 && boundaryAt < lineStart) {
            boundaryAt = buf.indexOf(boundaryMarker, lineStart);
        }
        if (hasPrefix(buf, ATTR_SNAP_PREFIX, lineStart, lineEnd)) {
            sinkWrite(s.out, buf, runStart, lineStart);
            lastSnapStart = lineStart;
            lastSnapEnd = lineEnd;
            runStart = lineEnd;
        }
        else if (boundaryAt >= lineStart &&
            boundaryAt < Math.min(lineStart + BOUNDARY_SEARCH_BOUND, lineEnd)) {
            var hit = parseBoundaryLine(buf.toString('utf-8', lineStart, nl));
            if (hit === null || hit === void 0 ? void 0 : hit.hasPreservedSegment) {
                s.hasPreservedSegment = true; // don't truncate; preserved msgs already in output
            }
            else if (hit) {
                s.out.len = 0;
                s.boundaryStartOffset = s.bufFileOff + lineStart;
                s.hasPreservedSegment = false;
                s.lastSnapSrc = null;
                lastSnapStart = -1;
                s.straddleSnapCarryLen = 0;
                runStart = lineStart;
            }
            boundaryAt = buf.indexOf(boundaryMarker, boundaryAt + boundaryMarker.length);
        }
        lineStart = lineEnd;
        nl = buf.indexOf(LF, lineStart);
    }
    sinkWrite(s.out, buf, runStart, lineStart);
    return { lastSnapStart: lastSnapStart, lastSnapEnd: lastSnapEnd, trailStart: lineStart };
}
// In-buf snap wins over straddle (later in file). carryBuf still valid here.
function captureSnap(s, buf, chunk, lastSnapStart, lastSnapEnd) {
    if (lastSnapStart !== -1) {
        s.lastSnapLen = lastSnapEnd - lastSnapStart;
        if (s.lastSnapBuf === undefined || s.lastSnapLen > s.lastSnapBuf.length) {
            s.lastSnapBuf = Buffer.allocUnsafe(s.lastSnapLen);
        }
        buf.copy(s.lastSnapBuf, 0, lastSnapStart, lastSnapEnd);
        s.lastSnapSrc = s.lastSnapBuf;
    }
    else if (s.straddleSnapCarryLen > 0) {
        s.lastSnapLen = s.straddleSnapCarryLen + s.straddleSnapTailEnd;
        if (s.lastSnapBuf === undefined || s.lastSnapLen > s.lastSnapBuf.length) {
            s.lastSnapBuf = Buffer.allocUnsafe(s.lastSnapLen);
        }
        s.carryBuf.copy(s.lastSnapBuf, 0, 0, s.straddleSnapCarryLen);
        chunk.copy(s.lastSnapBuf, s.straddleSnapCarryLen, 0, s.straddleSnapTailEnd);
        s.lastSnapSrc = s.lastSnapBuf;
    }
}
function captureCarry(s, buf, trailStart) {
    s.carryLen = buf.length - trailStart;
    if (s.carryLen > 0) {
        if (s.carryBuf === undefined || s.carryLen > s.carryBuf.length) {
            s.carryBuf = Buffer.allocUnsafe(s.carryLen);
        }
        buf.copy(s.carryBuf, 0, trailStart, buf.length);
    }
}
function finalizeOutput(s) {
    if (s.carryLen > 0) {
        var cb = s.carryBuf;
        if (hasPrefix(cb, ATTR_SNAP_PREFIX, 0, s.carryLen)) {
            s.lastSnapSrc = cb;
            s.lastSnapLen = s.carryLen;
        }
        else {
            sinkWrite(s.out, cb, 0, s.carryLen);
        }
    }
    if (s.lastSnapSrc) {
        if (s.out.len > 0 && s.out.buf[s.out.len - 1] !== LF) {
            sinkWrite(s.out, LF_BYTE, 0, 1);
        }
        sinkWrite(s.out, s.lastSnapSrc, 0, s.lastSnapLen);
    }
}
function readTranscriptForLoad(filePath, fileSize) {
    return __awaiter(this, void 0, void 0, function () {
        var boundaryMarker, CHUNK_SIZE, s, chunk, fd, filePos, bytesRead, chunkOff, buf, bufLen, r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    boundaryMarker = compactBoundaryMarker();
                    CHUNK_SIZE = TRANSCRIPT_READ_CHUNK_SIZE;
                    s = {
                        out: {
                            // Gated callers enter with fileSize > 5MB, so min(fileSize, 8MB) lands
                            // in [5, 8]MB; large boundaryless sessions (24-31MB output) take 2
                            // grows. Ungated callers (attribution.ts) pass small files too — the
                            // min just right-sizes the initial buf, no grows.
                            buf: Buffer.allocUnsafe(Math.min(fileSize, 8 * 1024 * 1024)),
                            len: 0,
                            // +1: finalizeOutput may insert one LF between a non-LF-terminated
                            // carry and the reordered last attr-snap (crash-truncated file).
                            cap: fileSize + 1,
                        },
                        boundaryStartOffset: 0,
                        hasPreservedSegment: false,
                        lastSnapSrc: null,
                        lastSnapLen: 0,
                        lastSnapBuf: undefined,
                        bufFileOff: 0,
                        carryLen: 0,
                        carryBuf: undefined,
                        straddleSnapCarryLen: 0,
                        straddleSnapTailEnd: 0,
                    };
                    chunk = Buffer.allocUnsafe(CHUNK_SIZE);
                    return [4 /*yield*/, (0, promises_1.open)(filePath, 'r')];
                case 1:
                    fd = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 6, 8]);
                    filePos = 0;
                    _a.label = 3;
                case 3:
                    if (!(filePos < fileSize)) return [3 /*break*/, 5];
                    return [4 /*yield*/, fd.read(chunk, 0, Math.min(CHUNK_SIZE, fileSize - filePos), filePos)];
                case 4:
                    bytesRead = (_a.sent()).bytesRead;
                    if (bytesRead === 0)
                        return [3 /*break*/, 5];
                    filePos += bytesRead;
                    chunkOff = processStraddle(s, chunk, bytesRead);
                    buf = void 0;
                    if (s.carryLen > 0) {
                        bufLen = s.carryLen + (bytesRead - chunkOff);
                        buf = Buffer.allocUnsafe(bufLen);
                        s.carryBuf.copy(buf, 0, 0, s.carryLen);
                        chunk.copy(buf, s.carryLen, chunkOff, bytesRead);
                    }
                    else {
                        buf = chunk.subarray(chunkOff, bytesRead);
                    }
                    r = scanChunkLines(s, buf, boundaryMarker);
                    captureSnap(s, buf, chunk, r.lastSnapStart, r.lastSnapEnd);
                    captureCarry(s, buf, r.trailStart);
                    s.bufFileOff += r.trailStart;
                    return [3 /*break*/, 3];
                case 5:
                    finalizeOutput(s);
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, fd.close()];
                case 7:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/, {
                        boundaryStartOffset: s.boundaryStartOffset,
                        postBoundaryBuf: s.out.buf.subarray(0, s.out.len),
                        hasPreservedSegment: s.hasPreservedSegment,
                    }];
            }
        });
    });
}
