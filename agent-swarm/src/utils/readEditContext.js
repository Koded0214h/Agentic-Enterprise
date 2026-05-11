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
exports.MAX_SCAN_BYTES = exports.CHUNK_SIZE = void 0;
exports.readEditContext = readEditContext;
exports.openForScan = openForScan;
exports.scanForContext = scanForContext;
exports.readCapped = readCapped;
var promises_1 = require("fs/promises");
var errors_js_1 = require("./errors.js");
exports.CHUNK_SIZE = 8 * 1024;
exports.MAX_SCAN_BYTES = 10 * 1024 * 1024;
var NL = 0x0a;
/**
 * Finds `needle` in the file at `path` and returns a context-window slice
 * containing the match plus `contextLines` of surrounding context on each side.
 *
 * Scans in 8KB chunks with a straddle overlap so matches crossing a chunk
 * boundary are found. Capped at MAX_SCAN_BYTES. No stat — EOF detected via
 * bytesRead.
 *
 * React callers: wrap in useState lazy-init then use() + Suspense. useMemo
 * re-runs when callers pass fresh array literals.
 *
 * Returns null on ENOENT. Returns { truncated: true, content: '' } if the
 * needle isn't found within MAX_SCAN_BYTES.
 */
function readEditContext(path_1, needle_1) {
    return __awaiter(this, arguments, void 0, function (path, needle, contextLines) {
        var handle;
        if (contextLines === void 0) { contextLines = 3; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, openForScan(path)];
                case 1:
                    handle = _a.sent();
                    if (handle === null)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 4, 6]);
                    return [4 /*yield*/, scanForContext(handle, needle, contextLines)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4: return [4 /*yield*/, handle.close()];
                case 5:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Opens `path` for reading. Returns null on ENOENT. Caller owns close().
 */
function openForScan(path) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.open)(path, 'r')];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    e_1 = _a.sent();
                    if ((0, errors_js_1.isENOENT)(e_1))
                        return [2 /*return*/, null];
                    throw e_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle-accepting core of readEditContext. Caller owns open/close.
 */
function scanForContext(handle, needle, contextLines) {
    return __awaiter(this, void 0, void 0, function () {
        var needleLF, nlCount, i, needleCRLF, overlap, buf, pos, linesBeforePos, prevTail, bytesRead, viewLen, matchAt, matchLen, absMatch, nextTail;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (needle === '')
                        return [2 /*return*/, { content: '', lineOffset: 1, truncated: false }];
                    needleLF = Buffer.from(needle, 'utf8');
                    nlCount = 0;
                    for (i = 0; i < needleLF.length; i++)
                        if (needleLF[i] === NL)
                            nlCount++;
                    overlap = needleLF.length + nlCount - 1;
                    buf = Buffer.allocUnsafe(exports.CHUNK_SIZE + overlap);
                    pos = 0;
                    linesBeforePos = 0;
                    prevTail = 0;
                    _a.label = 1;
                case 1:
                    if (!(pos < exports.MAX_SCAN_BYTES)) return [3 /*break*/, 5];
                    return [4 /*yield*/, handle.read(buf, prevTail, exports.CHUNK_SIZE, pos)];
                case 2:
                    bytesRead = (_a.sent()).bytesRead;
                    if (bytesRead === 0)
                        return [3 /*break*/, 5];
                    viewLen = prevTail + bytesRead;
                    matchAt = indexOfWithin(buf, needleLF, viewLen);
                    matchLen = needleLF.length;
                    if (matchAt === -1 && nlCount > 0) {
                        needleCRLF !== null && needleCRLF !== void 0 ? needleCRLF : (needleCRLF = Buffer.from(needle.replaceAll('\n', '\r\n'), 'utf8'));
                        matchAt = indexOfWithin(buf, needleCRLF, viewLen);
                        matchLen = needleCRLF.length;
                    }
                    if (!(matchAt !== -1)) return [3 /*break*/, 4];
                    absMatch = pos - prevTail + matchAt;
                    return [4 /*yield*/, sliceContext(handle, buf, absMatch, matchLen, contextLines, linesBeforePos + countNewlines(buf, 0, matchAt))];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    pos += bytesRead;
                    nextTail = Math.min(overlap, viewLen);
                    linesBeforePos += countNewlines(buf, 0, viewLen - nextTail);
                    prevTail = nextTail;
                    buf.copyWithin(0, viewLen - prevTail, viewLen);
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, { content: '', lineOffset: 1, truncated: pos >= exports.MAX_SCAN_BYTES }];
            }
        });
    });
}
/**
 * Reads the entire file via `handle` up to MAX_SCAN_BYTES. Returns null if the
 * file exceeds the cap. For the multi-edit path in FileEditToolDiff where
 * sequential replacements need the full string.
 *
 * Single buffer, doubles on fill — ~log2(size/8KB) allocs instead of O(n)
 * chunks + concat. Reads directly into the right offset; no intermediate copies.
 */
function readCapped(handle) {
    return __awaiter(this, void 0, void 0, function () {
        var buf, total, grown, bytesRead;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    buf = Buffer.allocUnsafe(exports.CHUNK_SIZE);
                    total = 0;
                    _a.label = 1;
                case 1:
                    if (total === buf.length) {
                        grown = Buffer.allocUnsafe(Math.min(buf.length * 2, exports.MAX_SCAN_BYTES + exports.CHUNK_SIZE));
                        buf.copy(grown, 0, 0, total);
                        buf = grown;
                    }
                    return [4 /*yield*/, handle.read(buf, total, buf.length - total, total)];
                case 2:
                    bytesRead = (_a.sent()).bytesRead;
                    if (bytesRead === 0)
                        return [3 /*break*/, 4];
                    total += bytesRead;
                    if (total > exports.MAX_SCAN_BYTES)
                        return [2 /*return*/, null];
                    _a.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [2 /*return*/, normalizeCRLF(buf, total)];
            }
        });
    });
}
/** buf.indexOf bounded to [0, end) without allocating a view. */
function indexOfWithin(buf, needle, end) {
    var at = buf.indexOf(needle);
    return at === -1 || at + needle.length > end ? -1 : at;
}
function countNewlines(buf, start, end) {
    var n = 0;
    for (var i = start; i < end; i++)
        if (buf[i] === NL)
            n++;
    return n;
}
/** Decode buf[0..len) to utf8, normalizing CRLF only if CR is present. */
function normalizeCRLF(buf, len) {
    var s = buf.toString('utf8', 0, len);
    return s.includes('\r') ? s.replaceAll('\r\n', '\n') : s;
}
/**
 * Given an absolute match offset, read ±contextLines around it and return
 * the decoded slice with its starting line number. Reuses `scratch` (the
 * caller's scan buffer) for back/forward/output reads — zero new allocs
 * when the context fits, one alloc otherwise.
 */
function sliceContext(handle, scratch, matchStart, matchLen, contextLines, linesBeforeMatch) {
    return __awaiter(this, void 0, void 0, function () {
        var backChunk, backRead, ctxStart, nlSeen, i, walkedBack, lineOffset, matchEnd, fwdRead, ctxEnd, i, len, out, outRead;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    backChunk = Math.min(matchStart, exports.CHUNK_SIZE);
                    return [4 /*yield*/, handle.read(scratch, 0, backChunk, matchStart - backChunk)];
                case 1:
                    backRead = (_a.sent()).bytesRead;
                    ctxStart = matchStart;
                    nlSeen = 0;
                    for (i = backRead - 1; i >= 0 && nlSeen <= contextLines; i--) {
                        if (scratch[i] === NL) {
                            nlSeen++;
                            if (nlSeen > contextLines)
                                break;
                        }
                        ctxStart--;
                    }
                    walkedBack = matchStart - ctxStart;
                    lineOffset = linesBeforeMatch -
                        countNewlines(scratch, backRead - walkedBack, backRead) +
                        1;
                    matchEnd = matchStart + matchLen;
                    return [4 /*yield*/, handle.read(scratch, 0, exports.CHUNK_SIZE, matchEnd)];
                case 2:
                    fwdRead = (_a.sent()).bytesRead;
                    ctxEnd = matchEnd;
                    nlSeen = 0;
                    for (i = 0; i < fwdRead; i++) {
                        ctxEnd++;
                        if (scratch[i] === NL) {
                            nlSeen++;
                            if (nlSeen >= contextLines + 1)
                                break;
                        }
                    }
                    len = ctxEnd - ctxStart;
                    out = len <= scratch.length ? scratch : Buffer.allocUnsafe(len);
                    return [4 /*yield*/, handle.read(out, 0, len, ctxStart)];
                case 3:
                    outRead = (_a.sent()).bytesRead;
                    return [2 /*return*/, { content: normalizeCRLF(out, outRead), lineOffset: lineOffset, truncated: false }];
            }
        });
    });
}
