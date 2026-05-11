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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
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
exports.getPastedTextRefNumLines = getPastedTextRefNumLines;
exports.formatPastedTextRef = formatPastedTextRef;
exports.formatImageRef = formatImageRef;
exports.parseReferences = parseReferences;
exports.expandPastedTextRefs = expandPastedTextRefs;
exports.makeHistoryReader = makeHistoryReader;
exports.getTimestampedHistory = getTimestampedHistory;
exports.getHistory = getHistory;
exports.addToHistory = addToHistory;
exports.clearPendingHistoryEntries = clearPendingHistoryEntries;
exports.removeLastFromHistory = removeLastFromHistory;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("./bootstrap/state.js");
var cleanupRegistry_js_1 = require("./utils/cleanupRegistry.js");
var debug_js_1 = require("./utils/debug.js");
var envUtils_js_1 = require("./utils/envUtils.js");
var errors_js_1 = require("./utils/errors.js");
var fsOperations_js_1 = require("./utils/fsOperations.js");
var lockfile_js_1 = require("./utils/lockfile.js");
var pasteStore_js_1 = require("./utils/pasteStore.js");
var sleep_js_1 = require("./utils/sleep.js");
var slowOperations_js_1 = require("./utils/slowOperations.js");
var MAX_HISTORY_ITEMS = 100;
var MAX_PASTED_CONTENT_LENGTH = 1024;
/**
 * Claude Code parses history for pasted content references to match back to
 * pasted content. The references look like:
 *   Text: [Pasted text #1 +10 lines]
 *   Image: [Image #2]
 * The numbers are expected to be unique within a single prompt but not across
 * prompts. We choose numeric, auto-incrementing IDs as they are more
 * user-friendly than other ID options.
 */
// Note: The original text paste implementation would consider input like
// "line1\nline2\nline3" to have +2 lines, not 3 lines. We preserve that
// behavior here.
function getPastedTextRefNumLines(text) {
    return (text.match(/\r\n|\r|\n/g) || []).length;
}
function formatPastedTextRef(id, numLines) {
    if (numLines === 0) {
        return "[Pasted text #".concat(id, "]");
    }
    return "[Pasted text #".concat(id, " +").concat(numLines, " lines]");
}
function formatImageRef(id) {
    return "[Image #".concat(id, "]");
}
function parseReferences(input) {
    var referencePattern = /\[(Pasted text|Image|\.\.\.Truncated text) #(\d+)(?: \+\d+ lines)?(\.)*\]/g;
    var matches = __spreadArray([], input.matchAll(referencePattern), true);
    return matches
        .map(function (match) { return ({
        id: parseInt(match[2] || '0'),
        match: match[0],
        index: match.index,
    }); })
        .filter(function (match) { return match.id > 0; });
}
/**
 * Replace [Pasted text #N] placeholders in input with their actual content.
 * Image refs are left alone — they become content blocks, not inlined text.
 */
function expandPastedTextRefs(input, pastedContents) {
    var refs = parseReferences(input);
    var expanded = input;
    // Splice at the original match offsets so placeholder-like strings inside
    // pasted content are never confused for real refs. Reverse order keeps
    // earlier offsets valid after later replacements.
    for (var i = refs.length - 1; i >= 0; i--) {
        var ref = refs[i];
        var content = pastedContents[ref.id];
        if ((content === null || content === void 0 ? void 0 : content.type) !== 'text')
            continue;
        expanded =
            expanded.slice(0, ref.index) +
                content.content +
                expanded.slice(ref.index + ref.match.length);
    }
    return expanded;
}
function deserializeLogEntry(line) {
    return (0, slowOperations_js_1.jsonParse)(line);
}
function makeLogEntryReader() {
    return __asyncGenerator(this, arguments, function makeLogEntryReader_1() {
        var currentSession, i, historyPath, _a, _b, _c, line, entry, error_1, e_1_1, e_2, code;
        var _d, e_1, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    currentSession = (0, state_js_1.getSessionId)();
                    i = pendingEntries.length - 1;
                    _g.label = 1;
                case 1:
                    if (!(i >= 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, __await(pendingEntries[i])];
                case 2: return [4 /*yield*/, _g.sent()];
                case 3:
                    _g.sent();
                    _g.label = 4;
                case 4:
                    i--;
                    return [3 /*break*/, 1];
                case 5:
                    historyPath = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'history.jsonl');
                    _g.label = 6;
                case 6:
                    _g.trys.push([6, 23, , 26]);
                    _g.label = 7;
                case 7:
                    _g.trys.push([7, 16, 17, 22]);
                    _a = true, _b = __asyncValues((0, fsOperations_js_1.readLinesReverse)(historyPath));
                    _g.label = 8;
                case 8: return [4 /*yield*/, __await(_b.next())];
                case 9:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 15];
                    _f = _c.value;
                    _a = false;
                    line = _f;
                    _g.label = 10;
                case 10:
                    _g.trys.push([10, 13, , 14]);
                    entry = deserializeLogEntry(line);
                    // removeLastFromHistory slow path: entry was flushed before removal,
                    // so filter here so both getHistory (Up-arrow) and makeHistoryReader
                    // (ctrl+r search) skip it consistently.
                    if (entry.sessionId === currentSession &&
                        skippedTimestamps.has(entry.timestamp)) {
                        return [3 /*break*/, 14];
                    }
                    return [4 /*yield*/, __await(entry)];
                case 11: return [4 /*yield*/, _g.sent()];
                case 12:
                    _g.sent();
                    return [3 /*break*/, 14];
                case 13:
                    error_1 = _g.sent();
                    // Not a critical error - just skip malformed lines
                    (0, debug_js_1.logForDebugging)("Failed to parse history line: ".concat(error_1));
                    return [3 /*break*/, 14];
                case 14:
                    _a = true;
                    return [3 /*break*/, 8];
                case 15: return [3 /*break*/, 22];
                case 16:
                    e_1_1 = _g.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 22];
                case 17:
                    _g.trys.push([17, , 20, 21]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 19];
                    return [4 /*yield*/, __await(_e.call(_b))];
                case 18:
                    _g.sent();
                    _g.label = 19;
                case 19: return [3 /*break*/, 21];
                case 20:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 21: return [7 /*endfinally*/];
                case 22: return [3 /*break*/, 26];
                case 23:
                    e_2 = _g.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_2);
                    if (!(code === 'ENOENT')) return [3 /*break*/, 25];
                    return [4 /*yield*/, __await(void 0)];
                case 24: return [2 /*return*/, _g.sent()];
                case 25: throw e_2;
                case 26: return [2 /*return*/];
            }
        });
    });
}
function makeHistoryReader() {
    return __asyncGenerator(this, arguments, function makeHistoryReader_1() {
        var _a, _b, _c, entry, e_3_1;
        var _d, e_3, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 8, 9, 14]);
                    _a = true, _b = __asyncValues(makeLogEntryReader());
                    _g.label = 1;
                case 1: return [4 /*yield*/, __await(_b.next())];
                case 2:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 7];
                    _f = _c.value;
                    _a = false;
                    entry = _f;
                    return [4 /*yield*/, __await(logEntryToHistoryEntry(entry))];
                case 3: return [4 /*yield*/, __await.apply(void 0, [_g.sent()])];
                case 4: return [4 /*yield*/, _g.sent()];
                case 5:
                    _g.sent();
                    _g.label = 6;
                case 6:
                    _a = true;
                    return [3 /*break*/, 1];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_3_1 = _g.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _g.trys.push([9, , 12, 13]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 11];
                    return [4 /*yield*/, __await(_e.call(_b))];
                case 10:
                    _g.sent();
                    _g.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_3) throw e_3.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
}
/**
 * Current-project history for the ctrl+r picker: deduped by display text,
 * newest first, with timestamps. Paste contents are resolved lazily via
 * `resolve()` — the picker only reads display+timestamp for the list.
 */
function getTimestampedHistory() {
    return __asyncGenerator(this, arguments, function getTimestampedHistory_1() {
        var currentProject, seen, _loop_1, _a, _b, _c, state_1, e_4_1;
        var _d, e_4, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    currentProject = (0, state_js_1.getProjectRoot)();
                    seen = new Set();
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 7, 8, 13]);
                    _loop_1 = function () {
                        var entry, _h;
                        return __generator(this, function (_j) {
                            switch (_j.label) {
                                case 0:
                                    _f = _c.value;
                                    _a = false;
                                    entry = _f;
                                    if (!entry || typeof entry.project !== 'string')
                                        return [2 /*return*/, "continue"];
                                    if (entry.project !== currentProject)
                                        return [2 /*return*/, "continue"];
                                    if (seen.has(entry.display))
                                        return [2 /*return*/, "continue"];
                                    seen.add(entry.display);
                                    return [4 /*yield*/, __await({
                                            display: entry.display,
                                            timestamp: entry.timestamp,
                                            resolve: function () { return logEntryToHistoryEntry(entry); },
                                        })];
                                case 1: return [4 /*yield*/, _j.sent()];
                                case 2:
                                    _j.sent();
                                    if (!(seen.size >= MAX_HISTORY_ITEMS)) return [3 /*break*/, 4];
                                    _h = {};
                                    return [4 /*yield*/, __await(void 0)];
                                case 3: return [2 /*return*/, (_h.value = _j.sent(), _h)];
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _a = true, _b = __asyncValues(makeLogEntryReader());
                    _g.label = 2;
                case 2: return [4 /*yield*/, __await(_b.next())];
                case 3:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 6];
                    return [5 /*yield**/, _loop_1()];
                case 4:
                    state_1 = _g.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _g.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_4_1 = _g.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _g.trys.push([8, , 11, 12]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, __await(_e.call(_b))];
                case 9:
                    _g.sent();
                    _g.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_4) throw e_4.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get history entries for the current project, with current session's entries first.
 *
 * Entries from the current session are yielded before entries from other sessions,
 * so concurrent sessions don't interleave their up-arrow history. Within each group,
 * order is newest-first. Scans the same MAX_HISTORY_ITEMS window as before —
 * entries are reordered within that window, not beyond it.
 */
function getHistory() {
    return __asyncGenerator(this, arguments, function getHistory_1() {
        var currentProject, currentSession, otherSessionEntries, yielded, _a, _b, _c, entry, e_5_1, _i, otherSessionEntries_1, entry;
        var _d, e_5, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    currentProject = (0, state_js_1.getProjectRoot)();
                    currentSession = (0, state_js_1.getSessionId)();
                    otherSessionEntries = [];
                    yielded = 0;
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 11, 12, 17]);
                    _a = true, _b = __asyncValues(makeLogEntryReader());
                    _g.label = 2;
                case 2: return [4 /*yield*/, __await(_b.next())];
                case 3:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 10];
                    _f = _c.value;
                    _a = false;
                    entry = _f;
                    // Skip malformed entries (corrupted file, old format, or invalid JSON structure)
                    if (!entry || typeof entry.project !== 'string')
                        return [3 /*break*/, 9];
                    if (entry.project !== currentProject)
                        return [3 /*break*/, 9];
                    if (!(entry.sessionId === currentSession)) return [3 /*break*/, 7];
                    return [4 /*yield*/, __await(logEntryToHistoryEntry(entry))];
                case 4: return [4 /*yield*/, __await.apply(void 0, [_g.sent()])];
                case 5: return [4 /*yield*/, _g.sent()];
                case 6:
                    _g.sent();
                    yielded++;
                    return [3 /*break*/, 8];
                case 7:
                    otherSessionEntries.push(entry);
                    _g.label = 8;
                case 8:
                    // Same MAX_HISTORY_ITEMS window as before — just reordered within it.
                    if (yielded + otherSessionEntries.length >= MAX_HISTORY_ITEMS)
                        return [3 /*break*/, 10];
                    _g.label = 9;
                case 9:
                    _a = true;
                    return [3 /*break*/, 2];
                case 10: return [3 /*break*/, 17];
                case 11:
                    e_5_1 = _g.sent();
                    e_5 = { error: e_5_1 };
                    return [3 /*break*/, 17];
                case 12:
                    _g.trys.push([12, , 15, 16]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 14];
                    return [4 /*yield*/, __await(_e.call(_b))];
                case 13:
                    _g.sent();
                    _g.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    if (e_5) throw e_5.error;
                    return [7 /*endfinally*/];
                case 16: return [7 /*endfinally*/];
                case 17:
                    _i = 0, otherSessionEntries_1 = otherSessionEntries;
                    _g.label = 18;
                case 18:
                    if (!(_i < otherSessionEntries_1.length)) return [3 /*break*/, 25];
                    entry = otherSessionEntries_1[_i];
                    if (!(yielded >= MAX_HISTORY_ITEMS)) return [3 /*break*/, 20];
                    return [4 /*yield*/, __await(void 0)];
                case 19: return [2 /*return*/, _g.sent()];
                case 20: return [4 /*yield*/, __await(logEntryToHistoryEntry(entry))];
                case 21: return [4 /*yield*/, __await.apply(void 0, [_g.sent()])];
                case 22: return [4 /*yield*/, _g.sent()];
                case 23:
                    _g.sent();
                    yielded++;
                    _g.label = 24;
                case 24:
                    _i++;
                    return [3 /*break*/, 18];
                case 25: return [2 /*return*/];
            }
        });
    });
}
/**
 * Resolve stored paste content to full PastedContent by fetching from paste store if needed.
 */
function resolveStoredPastedContent(stored) {
    return __awaiter(this, void 0, void 0, function () {
        var content;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // If we have inline content, use it directly
                    if (stored.content) {
                        return [2 /*return*/, {
                                id: stored.id,
                                type: stored.type,
                                content: stored.content,
                                mediaType: stored.mediaType,
                                filename: stored.filename,
                            }];
                    }
                    if (!stored.contentHash) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, pasteStore_js_1.retrievePastedText)(stored.contentHash)];
                case 1:
                    content = _a.sent();
                    if (content) {
                        return [2 /*return*/, {
                                id: stored.id,
                                type: stored.type,
                                content: content,
                                mediaType: stored.mediaType,
                                filename: stored.filename,
                            }];
                    }
                    _a.label = 2;
                case 2: 
                // Content not available
                return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Convert LogEntry to HistoryEntry by resolving paste store references.
 */
function logEntryToHistoryEntry(entry) {
    return __awaiter(this, void 0, void 0, function () {
        var pastedContents, _i, _a, _b, id, stored, resolved;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    pastedContents = {};
                    _i = 0, _a = Object.entries(entry.pastedContents || {});
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    _b = _a[_i], id = _b[0], stored = _b[1];
                    return [4 /*yield*/, resolveStoredPastedContent(stored)];
                case 2:
                    resolved = _c.sent();
                    if (resolved) {
                        pastedContents[Number(id)] = resolved;
                    }
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, {
                        display: entry.display,
                        pastedContents: pastedContents,
                    }];
            }
        });
    });
}
var pendingEntries = [];
var isWriting = false;
var currentFlushPromise = null;
var cleanupRegistered = false;
var lastAddedEntry = null;
// Timestamps of entries already flushed to disk that should be skipped when
// reading. Used by removeLastFromHistory when the entry has raced past the
// pending buffer. Session-scoped (module state resets on process restart).
var skippedTimestamps = new Set();
// Core flush logic - writes pending entries to disk
function immediateFlushHistory() {
    return __awaiter(this, void 0, void 0, function () {
        var release, historyPath, jsonLines, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (pendingEntries.length === 0) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 9]);
                    historyPath = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'history.jsonl');
                    // Ensure the file exists before acquiring lock (append mode creates if missing)
                    return [4 /*yield*/, (0, promises_1.writeFile)(historyPath, '', {
                            encoding: 'utf8',
                            mode: 384,
                            flag: 'a',
                        })];
                case 2:
                    // Ensure the file exists before acquiring lock (append mode creates if missing)
                    _a.sent();
                    return [4 /*yield*/, (0, lockfile_js_1.lock)(historyPath, {
                            stale: 10000,
                            retries: {
                                retries: 3,
                                minTimeout: 50,
                            },
                        })];
                case 3:
                    release = _a.sent();
                    jsonLines = pendingEntries.map(function (entry) { return (0, slowOperations_js_1.jsonStringify)(entry) + '\n'; });
                    pendingEntries = [];
                    return [4 /*yield*/, (0, promises_1.appendFile)(historyPath, jsonLines.join(''), { mode: 384 })];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 5:
                    error_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to write prompt history: ".concat(error_2));
                    return [3 /*break*/, 9];
                case 6:
                    if (!release) return [3 /*break*/, 8];
                    return [4 /*yield*/, release()];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function flushPromptHistory(retries) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isWriting || pendingEntries.length === 0) {
                        return [2 /*return*/];
                    }
                    // Stop trying to flush history until the next user prompt
                    if (retries > 5) {
                        return [2 /*return*/];
                    }
                    isWriting = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 6]);
                    return [4 /*yield*/, immediateFlushHistory()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 3:
                    isWriting = false;
                    if (!(pendingEntries.length > 0)) return [3 /*break*/, 5];
                    // Avoid trying again in a hot loop
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(500)];
                case 4:
                    // Avoid trying again in a hot loop
                    _a.sent();
                    void flushPromptHistory(retries + 1);
                    _a.label = 5;
                case 5: return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function addToPromptHistory(command) {
    return __awaiter(this, void 0, void 0, function () {
        var entry, storedPastedContents, _i, _a, _b, id, content, hash, logEntry;
        return __generator(this, function (_c) {
            entry = typeof command === 'string'
                ? { display: command, pastedContents: {} }
                : command;
            storedPastedContents = {};
            if (entry.pastedContents) {
                for (_i = 0, _a = Object.entries(entry.pastedContents); _i < _a.length; _i++) {
                    _b = _a[_i], id = _b[0], content = _b[1];
                    // Filter out images (they're stored separately in image-cache)
                    if (content.type === 'image') {
                        continue;
                    }
                    // For small text content, store inline
                    if (content.content.length <= MAX_PASTED_CONTENT_LENGTH) {
                        storedPastedContents[Number(id)] = {
                            id: content.id,
                            type: content.type,
                            content: content.content,
                            mediaType: content.mediaType,
                            filename: content.filename,
                        };
                    }
                    else {
                        hash = (0, pasteStore_js_1.hashPastedText)(content.content);
                        storedPastedContents[Number(id)] = {
                            id: content.id,
                            type: content.type,
                            contentHash: hash,
                            mediaType: content.mediaType,
                            filename: content.filename,
                        };
                        // Fire-and-forget disk write - don't block history entry creation
                        void (0, pasteStore_js_1.storePastedText)(hash, content.content);
                    }
                }
            }
            logEntry = __assign(__assign({}, entry), { pastedContents: storedPastedContents, timestamp: Date.now(), project: (0, state_js_1.getProjectRoot)(), sessionId: (0, state_js_1.getSessionId)() });
            pendingEntries.push(logEntry);
            lastAddedEntry = logEntry;
            currentFlushPromise = flushPromptHistory(0);
            void currentFlushPromise;
            return [2 /*return*/];
        });
    });
}
function addToHistory(command) {
    var _this = this;
    // Skip history when running in a tmux session spawned by Claude Code's Tungsten tool.
    // This prevents verification/test sessions from polluting the user's real command history.
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SKIP_PROMPT_HISTORY)) {
        return;
    }
    // Register cleanup on first use
    if (!cleanupRegistered) {
        cleanupRegistered = true;
        (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!currentFlushPromise) return [3 /*break*/, 2];
                        return [4 /*yield*/, currentFlushPromise];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(pendingEntries.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, immediateFlushHistory()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    }
    void addToPromptHistory(command);
}
function clearPendingHistoryEntries() {
    pendingEntries = [];
    lastAddedEntry = null;
    skippedTimestamps.clear();
}
/**
 * Undo the most recent addToHistory call. Used by auto-restore-on-interrupt:
 * when Esc rewinds the conversation before any response arrives, the submit is
 * semantically undone — the history entry should be too, otherwise Up-arrow
 * shows the restored text twice (once from the input box, once from disk).
 *
 * Fast path pops from the pending buffer. If the async flush already won the
 * race (TTFT is typically >> disk write latency), the entry's timestamp is
 * added to a skip-set consulted by getHistory. One-shot: clears the tracked
 * entry so a second call is a no-op.
 */
function removeLastFromHistory() {
    if (!lastAddedEntry)
        return;
    var entry = lastAddedEntry;
    lastAddedEntry = null;
    var idx = pendingEntries.lastIndexOf(entry);
    if (idx !== -1) {
        pendingEntries.splice(idx, 1);
    }
    else {
        skippedTimestamps.add(entry.timestamp);
    }
}
