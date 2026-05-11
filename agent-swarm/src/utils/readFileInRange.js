"use strict";
// ---------------------------------------------------------------------------
// readFileInRange — line-oriented file reader with two code paths
// ---------------------------------------------------------------------------
//
// Returns lines [offset, offset + maxLines) from a file.
//
// Fast path (regular files < 10 MB):
//   Opens the file, stats the fd, reads the whole file with readFile(),
//   then splits lines in memory.  This avoids the per-chunk async overhead
//   of createReadStream and is ~2x faster for typical source files.
//
// Streaming path (large files, pipes, devices, etc.):
//   Uses createReadStream with manual indexOf('\n') scanning.  Content is
//   only accumulated for lines inside the requested range — lines outside
//   the range are counted (for totalLines) but discarded, so reading line
//   1 of a 100 GB file won't balloon RSS.
//
//   All event handlers (streamOnOpen/Data/End) are module-level named
//   functions with zero closures.  State lives in a StreamState object;
//   handlers access it via `this`, bound at registration time.
//
//   Lifecycle: `open`, `end`, and `error` use .once() (auto-remove).
//   `data` fires until the stream ends or is destroyed — either way the
//   stream and state become unreachable together and are GC'd.
//
//   On error (including maxBytes exceeded), stream.destroy(err) emits
//   'error' → reject (passed directly to .once('error')).
//
// Both paths strip UTF-8 BOM and \r (CRLF → LF).
//
// mtime comes from fstat/stat on the already-open fd — no extra open().
//
// maxBytes behavior depends on options.truncateOnByteLimit:
//   false (default): legacy semantics — throws FileTooLargeError if the FILE
//     size (fast path) or total streamed bytes (streaming) exceed maxBytes.
//   true: caps SELECTED OUTPUT at maxBytes.  Stops at the last complete line
//     that fits; sets truncatedByBytes in the result.  Never throws.
// ---------------------------------------------------------------------------
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
exports.FileTooLargeError = void 0;
exports.readFileInRange = readFileInRange;
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var format_js_1 = require("./format.js");
var FAST_PATH_MAX_SIZE = 10 * 1024 * 1024; // 10 MB
var FileTooLargeError = /** @class */ (function (_super) {
    __extends(FileTooLargeError, _super);
    function FileTooLargeError(sizeInBytes, maxSizeBytes) {
        var _this = _super.call(this, "File content (".concat((0, format_js_1.formatFileSize)(sizeInBytes), ") exceeds maximum allowed size (").concat((0, format_js_1.formatFileSize)(maxSizeBytes), "). Use offset and limit parameters to read specific portions of the file, or search for specific content instead of reading the whole file.")) || this;
        _this.sizeInBytes = sizeInBytes;
        _this.maxSizeBytes = maxSizeBytes;
        _this.name = 'FileTooLargeError';
        return _this;
    }
    return FileTooLargeError;
}(Error));
exports.FileTooLargeError = FileTooLargeError;
// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------
function readFileInRange(filePath_1) {
    return __awaiter(this, arguments, void 0, function (filePath, offset, maxLines, maxBytes, signal, options) {
        var truncateOnByteLimit, stats, text;
        var _a;
        if (offset === void 0) { offset = 0; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    signal === null || signal === void 0 ? void 0 : signal.throwIfAborted();
                    truncateOnByteLimit = (_a = options === null || options === void 0 ? void 0 : options.truncateOnByteLimit) !== null && _a !== void 0 ? _a : false;
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                case 1:
                    stats = _b.sent();
                    if (stats.isDirectory()) {
                        throw new Error("EISDIR: illegal operation on a directory, read '".concat(filePath, "'"));
                    }
                    if (!(stats.isFile() && stats.size < FAST_PATH_MAX_SIZE)) return [3 /*break*/, 3];
                    if (!truncateOnByteLimit &&
                        maxBytes !== undefined &&
                        stats.size > maxBytes) {
                        throw new FileTooLargeError(stats.size, maxBytes);
                    }
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, { encoding: 'utf8', signal: signal })];
                case 2:
                    text = _b.sent();
                    return [2 /*return*/, readFileInRangeFast(text, stats.mtimeMs, offset, maxLines, truncateOnByteLimit ? maxBytes : undefined)];
                case 3: return [2 /*return*/, readFileInRangeStreaming(filePath, offset, maxLines, maxBytes, truncateOnByteLimit, signal)];
            }
        });
    });
}
// ---------------------------------------------------------------------------
// Fast path — readFile + in-memory split
// ---------------------------------------------------------------------------
function readFileInRangeFast(raw, mtimeMs, offset, maxLines, truncateAtBytes) {
    var endLine = maxLines !== undefined ? offset + maxLines : Infinity;
    // Strip BOM.
    var text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
    // Split lines, strip \r, select range.
    var selectedLines = [];
    var lineIndex = 0;
    var startPos = 0;
    var newlinePos;
    var selectedBytes = 0;
    var truncatedByBytes = false;
    function tryPush(line) {
        if (truncateAtBytes !== undefined) {
            var sep = selectedLines.length > 0 ? 1 : 0;
            var nextBytes = selectedBytes + sep + Buffer.byteLength(line);
            if (nextBytes > truncateAtBytes) {
                truncatedByBytes = true;
                return false;
            }
            selectedBytes = nextBytes;
        }
        selectedLines.push(line);
        return true;
    }
    while ((newlinePos = text.indexOf('\n', startPos)) !== -1) {
        if (lineIndex >= offset && lineIndex < endLine && !truncatedByBytes) {
            var line = text.slice(startPos, newlinePos);
            if (line.endsWith('\r')) {
                line = line.slice(0, -1);
            }
            tryPush(line);
        }
        lineIndex++;
        startPos = newlinePos + 1;
    }
    // Final fragment (no trailing newline).
    if (lineIndex >= offset && lineIndex < endLine && !truncatedByBytes) {
        var line = text.slice(startPos);
        if (line.endsWith('\r')) {
            line = line.slice(0, -1);
        }
        tryPush(line);
    }
    lineIndex++;
    var content = selectedLines.join('\n');
    return __assign({ content: content, lineCount: selectedLines.length, totalLines: lineIndex, totalBytes: Buffer.byteLength(text, 'utf8'), readBytes: Buffer.byteLength(content, 'utf8'), mtimeMs: mtimeMs }, (truncatedByBytes ? { truncatedByBytes: true } : {}));
}
function streamOnOpen(fd) {
    var _this = this;
    (0, fs_1.fstat)(fd, function (err, stats) {
        _this.resolveMtime(err ? 0 : stats.mtimeMs);
    });
}
function streamOnData(chunk) {
    if (this.isFirstChunk) {
        this.isFirstChunk = false;
        if (chunk.charCodeAt(0) === 0xfeff) {
            chunk = chunk.slice(1);
        }
    }
    this.totalBytesRead += Buffer.byteLength(chunk);
    if (!this.truncateOnByteLimit &&
        this.maxBytes !== undefined &&
        this.totalBytesRead > this.maxBytes) {
        this.stream.destroy(new FileTooLargeError(this.totalBytesRead, this.maxBytes));
        return;
    }
    var data = this.partial.length > 0 ? this.partial + chunk : chunk;
    this.partial = '';
    var startPos = 0;
    var newlinePos;
    while ((newlinePos = data.indexOf('\n', startPos)) !== -1) {
        if (this.currentLineIndex >= this.offset &&
            this.currentLineIndex < this.endLine) {
            var line = data.slice(startPos, newlinePos);
            if (line.endsWith('\r')) {
                line = line.slice(0, -1);
            }
            if (this.truncateOnByteLimit && this.maxBytes !== undefined) {
                var sep = this.selectedLines.length > 0 ? 1 : 0;
                var nextBytes = this.selectedBytes + sep + Buffer.byteLength(line);
                if (nextBytes > this.maxBytes) {
                    // Cap hit — collapse the selection range so nothing more is
                    // accumulated.  Stream continues (to count totalLines).
                    this.truncatedByBytes = true;
                    this.endLine = this.currentLineIndex;
                }
                else {
                    this.selectedBytes = nextBytes;
                    this.selectedLines.push(line);
                }
            }
            else {
                this.selectedLines.push(line);
            }
        }
        this.currentLineIndex++;
        startPos = newlinePos + 1;
    }
    // Only keep the trailing fragment when inside the selected range.
    // Outside the range we just count newlines — discarding prevents
    // unbounded memory growth on huge single-line files.
    if (startPos < data.length) {
        if (this.currentLineIndex >= this.offset &&
            this.currentLineIndex < this.endLine) {
            var fragment = data.slice(startPos);
            // In truncate mode, `partial` can grow unboundedly if the selected
            // range contains a huge single line (no newline across many chunks).
            // Once the fragment alone would overflow the remaining budget, we know
            // the completed line can never fit — set truncated, collapse the
            // selection range, and discard the fragment to stop accumulation.
            if (this.truncateOnByteLimit && this.maxBytes !== undefined) {
                var sep = this.selectedLines.length > 0 ? 1 : 0;
                var fragBytes = this.selectedBytes + sep + Buffer.byteLength(fragment);
                if (fragBytes > this.maxBytes) {
                    this.truncatedByBytes = true;
                    this.endLine = this.currentLineIndex;
                    return;
                }
            }
            this.partial = fragment;
        }
    }
}
function streamOnEnd() {
    var _this = this;
    var line = this.partial;
    if (line.endsWith('\r')) {
        line = line.slice(0, -1);
    }
    if (this.currentLineIndex >= this.offset &&
        this.currentLineIndex < this.endLine) {
        if (this.truncateOnByteLimit && this.maxBytes !== undefined) {
            var sep = this.selectedLines.length > 0 ? 1 : 0;
            var nextBytes = this.selectedBytes + sep + Buffer.byteLength(line);
            if (nextBytes > this.maxBytes) {
                this.truncatedByBytes = true;
            }
            else {
                this.selectedLines.push(line);
            }
        }
        else {
            this.selectedLines.push(line);
        }
    }
    this.currentLineIndex++;
    var content = this.selectedLines.join('\n');
    var truncated = this.truncatedByBytes;
    this.mtimeReady.then(function (mtimeMs) {
        _this.resolve(__assign({ content: content, lineCount: _this.selectedLines.length, totalLines: _this.currentLineIndex, totalBytes: _this.totalBytesRead, readBytes: Buffer.byteLength(content, 'utf8'), mtimeMs: mtimeMs }, (truncated ? { truncatedByBytes: true } : {})));
    });
}
function readFileInRangeStreaming(filePath, offset, maxLines, maxBytes, truncateOnByteLimit, signal) {
    return new Promise(function (resolve, reject) {
        var state = {
            stream: (0, fs_1.createReadStream)(filePath, __assign({ encoding: 'utf8', highWaterMark: 512 * 1024 }, (signal ? { signal: signal } : undefined))),
            offset: offset,
            endLine: maxLines !== undefined ? offset + maxLines : Infinity,
            maxBytes: maxBytes,
            truncateOnByteLimit: truncateOnByteLimit,
            resolve: resolve,
            totalBytesRead: 0,
            selectedBytes: 0,
            truncatedByBytes: false,
            currentLineIndex: 0,
            selectedLines: [],
            partial: '',
            isFirstChunk: true,
            resolveMtime: function () { },
            mtimeReady: null,
        };
        state.mtimeReady = new Promise(function (r) {
            state.resolveMtime = r;
        });
        state.stream.once('open', streamOnOpen.bind(state));
        state.stream.on('data', streamOnData.bind(state));
        state.stream.once('end', streamOnEnd.bind(state));
        state.stream.once('error', reject);
    });
}
