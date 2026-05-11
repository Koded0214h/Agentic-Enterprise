"use strict";
/**
 * Search module — finds code files and symbols matching a query.
 *
 * Two search modes:
 * 1. Grep-style: find files/lines containing the query string
 * 2. Structural: parse files and match against symbol names/signatures
 *
 * Both return folded views, not raw content.
 *
 * Uses batch parsing (one CLI call per language) for fast multi-file search.
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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCodebase = searchCodebase;
exports.formatSearchResults = formatSearchResults;
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
var parser_js_1 = require("./parser.js");
var CODE_EXTENSIONS = new Set([
    ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
    ".py", ".pyw",
    ".go",
    ".rs",
    ".rb",
    ".java",
    ".cs",
    ".cpp", ".c", ".h", ".hpp",
    ".swift",
    ".kt",
    ".php",
    ".vue", ".svelte",
]);
var IGNORE_DIRS = new Set([
    "node_modules", ".git", "dist", "build", ".next", "__pycache__",
    ".venv", "venv", "env", ".env", "target", "vendor",
    ".cache", ".turbo", "coverage", ".nyc_output",
    ".claude", ".smart-file-read",
]);
var MAX_FILE_SIZE = 512 * 1024; // 512KB — skip huge files
/**
 * Walk a directory recursively, yielding file paths.
 */
function walkDir(dir_1, rootDir_1) {
    return __asyncGenerator(this, arguments, function walkDir_1(dir, rootDir, maxDepth) {
        var entries, _a, _i, entries_1, entry, fullPath, ext;
        if (maxDepth === void 0) { maxDepth = 20; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(maxDepth <= 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, __await(void 0)];
                case 1: return [2 /*return*/, _b.sent()];
                case 2:
                    _b.trys.push([2, 4, , 6]);
                    return [4 /*yield*/, __await((0, promises_1.readdir)(dir, { withFileTypes: true }))];
                case 3:
                    entries = _b.sent();
                    return [3 /*break*/, 6];
                case 4:
                    _a = _b.sent();
                    return [4 /*yield*/, __await(void 0)];
                case 5: return [2 /*return*/, _b.sent()]; // permission denied, etc.
                case 6:
                    _i = 0, entries_1 = entries;
                    _b.label = 7;
                case 7:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 14];
                    entry = entries_1[_i];
                    if (entry.name.startsWith(".") && entry.name !== ".")
                        return [3 /*break*/, 13];
                    if (IGNORE_DIRS.has(entry.name))
                        return [3 /*break*/, 13];
                    fullPath = (0, node_path_1.join)(dir, entry.name);
                    if (!entry.isDirectory()) return [3 /*break*/, 10];
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(walkDir(fullPath, rootDir, maxDepth - 1))))];
                case 8: return [4 /*yield*/, __await.apply(void 0, [_b.sent()])];
                case 9:
                    _b.sent();
                    return [3 /*break*/, 13];
                case 10:
                    if (!entry.isFile()) return [3 /*break*/, 13];
                    ext = entry.name.slice(entry.name.lastIndexOf("."));
                    if (!CODE_EXTENSIONS.has(ext)) return [3 /*break*/, 13];
                    return [4 /*yield*/, __await(fullPath)];
                case 11: return [4 /*yield*/, _b.sent()];
                case 12:
                    _b.sent();
                    _b.label = 13;
                case 13:
                    _i++;
                    return [3 /*break*/, 7];
                case 14: return [2 /*return*/];
            }
        });
    });
}
/**
 * Read a file safely, skipping if too large or binary.
 */
function safeReadFile(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var stats, content, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                case 1:
                    stats = _b.sent();
                    if (stats.size > MAX_FILE_SIZE)
                        return [2 /*return*/, null];
                    if (stats.size === 0)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, "utf-8")];
                case 2:
                    content = _b.sent();
                    // Quick binary check — if first 1000 chars have null bytes, skip
                    if (content.slice(0, 1000).includes("\0"))
                        return [2 /*return*/, null];
                    return [2 /*return*/, content];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Search a codebase for symbols matching a query.
 *
 * Phase 1: Collect files and read content
 * Phase 2: Batch parse all files (one CLI call per language)
 * Phase 3: Match query against parsed symbols
 */
function searchCodebase(rootDir_1, query_1) {
    return __awaiter(this, arguments, void 0, function (rootDir, query, options) {
        var maxResults, queryLower, queryParts, filesToParse, _a, _b, _c, filePath, relPath, content, e_1_1, parsedFiles, foldedFiles, matchingSymbols, totalSymbolsFound, _loop_1, _i, parsedFiles_1, _d, relPath, parsed, trimmedSymbols, relevantFiles, trimmedFiles, tokenEstimate;
        var _e, e_1, _f, _g;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    maxResults = options.maxResults || 20;
                    queryLower = query.toLowerCase();
                    queryParts = queryLower.split(/[\s_\-./]+/).filter(function (p) { return p.length > 0; });
                    filesToParse = [];
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, 7, 8, 13]);
                    _a = true, _b = __asyncValues(walkDir(rootDir, rootDir));
                    _h.label = 2;
                case 2: return [4 /*yield*/, _b.next()];
                case 3:
                    if (!(_c = _h.sent(), _e = _c.done, !_e)) return [3 /*break*/, 6];
                    _g = _c.value;
                    _a = false;
                    filePath = _g;
                    if (options.filePattern) {
                        relPath = (0, node_path_1.relative)(rootDir, filePath);
                        if (!relPath.toLowerCase().includes(options.filePattern.toLowerCase()))
                            return [3 /*break*/, 5];
                    }
                    return [4 /*yield*/, safeReadFile(filePath)];
                case 4:
                    content = _h.sent();
                    if (!content)
                        return [3 /*break*/, 5];
                    filesToParse.push({
                        absolutePath: filePath,
                        relativePath: (0, node_path_1.relative)(rootDir, filePath),
                        content: content,
                    });
                    _h.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _h.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _h.trys.push([8, , 11, 12]);
                    if (!(!_a && !_e && (_f = _b.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _f.call(_b)];
                case 9:
                    _h.sent();
                    _h.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    parsedFiles = (0, parser_js_1.parseFilesBatch)(filesToParse);
                    foldedFiles = [];
                    matchingSymbols = [];
                    totalSymbolsFound = 0;
                    _loop_1 = function (relPath, parsed) {
                        totalSymbolsFound += countSymbols(parsed);
                        var pathMatch = matchScore(relPath.toLowerCase(), queryParts);
                        var fileHasMatch = pathMatch > 0;
                        var fileSymbolMatches = [];
                        var checkSymbols = function (symbols, parent) {
                            for (var _i = 0, symbols_1 = symbols; _i < symbols_1.length; _i++) {
                                var sym = symbols_1[_i];
                                var score = 0;
                                var reason = "";
                                var nameScore = matchScore(sym.name.toLowerCase(), queryParts);
                                if (nameScore > 0) {
                                    score += nameScore * 3;
                                    reason = "name match";
                                }
                                if (sym.signature.toLowerCase().includes(queryLower)) {
                                    score += 2;
                                    reason = reason ? "".concat(reason, " + signature") : "signature match";
                                }
                                if (sym.jsdoc && sym.jsdoc.toLowerCase().includes(queryLower)) {
                                    score += 1;
                                    reason = reason ? "".concat(reason, " + jsdoc") : "jsdoc match";
                                }
                                if (score > 0) {
                                    fileHasMatch = true;
                                    fileSymbolMatches.push({
                                        filePath: relPath,
                                        symbolName: parent ? "".concat(parent, ".").concat(sym.name) : sym.name,
                                        kind: sym.kind,
                                        signature: sym.signature,
                                        jsdoc: sym.jsdoc,
                                        lineStart: sym.lineStart,
                                        lineEnd: sym.lineEnd,
                                        matchReason: reason,
                                    });
                                }
                                if (sym.children) {
                                    checkSymbols(sym.children, sym.name);
                                }
                            }
                        };
                        checkSymbols(parsed.symbols);
                        if (fileHasMatch) {
                            foldedFiles.push(parsed);
                            matchingSymbols.push.apply(matchingSymbols, fileSymbolMatches);
                        }
                    };
                    for (_i = 0, parsedFiles_1 = parsedFiles; _i < parsedFiles_1.length; _i++) {
                        _d = parsedFiles_1[_i], relPath = _d[0], parsed = _d[1];
                        _loop_1(relPath, parsed);
                    }
                    // Sort by relevance and trim
                    matchingSymbols.sort(function (a, b) {
                        var aScore = matchScore(a.symbolName.toLowerCase(), queryParts);
                        var bScore = matchScore(b.symbolName.toLowerCase(), queryParts);
                        return bScore - aScore;
                    });
                    trimmedSymbols = matchingSymbols.slice(0, maxResults);
                    relevantFiles = new Set(trimmedSymbols.map(function (s) { return s.filePath; }));
                    trimmedFiles = foldedFiles.filter(function (f) { return relevantFiles.has(f.filePath); }).slice(0, maxResults);
                    tokenEstimate = trimmedFiles.reduce(function (sum, f) { return sum + f.foldedTokenEstimate; }, 0);
                    return [2 /*return*/, {
                            foldedFiles: trimmedFiles,
                            matchingSymbols: trimmedSymbols,
                            totalFilesScanned: filesToParse.length,
                            totalSymbolsFound: totalSymbolsFound,
                            tokenEstimate: tokenEstimate,
                        }];
            }
        });
    });
}
/**
 * Score how well query parts match a string.
 * Returns 0 for no match, higher for better matches.
 */
function matchScore(text, queryParts) {
    var score = 0;
    for (var _i = 0, queryParts_1 = queryParts; _i < queryParts_1.length; _i++) {
        var part = queryParts_1[_i];
        if (text === part) {
            score += 10; // exact match
        }
        else if (text.includes(part)) {
            score += 5; // substring match
        }
        else {
            // Fuzzy: check if all chars appear in order
            var ti = 0;
            var matched = 0;
            for (var _a = 0, part_1 = part; _a < part_1.length; _a++) {
                var ch = part_1[_a];
                var idx = text.indexOf(ch, ti);
                if (idx !== -1) {
                    matched++;
                    ti = idx + 1;
                }
            }
            if (matched === part.length) {
                score += 1; // loose fuzzy match
            }
        }
    }
    return score;
}
function countSymbols(file) {
    var count = file.symbols.length;
    for (var _i = 0, _a = file.symbols; _i < _a.length; _i++) {
        var sym = _a[_i];
        if (sym.children)
            count += sym.children.length;
    }
    return count;
}
/**
 * Format search results for LLM consumption.
 */
function formatSearchResults(result, query) {
    var parts = [];
    parts.push("\uD83D\uDD0D Smart Search: \"".concat(query, "\""));
    parts.push("   Scanned ".concat(result.totalFilesScanned, " files, found ").concat(result.totalSymbolsFound, " symbols"));
    parts.push("   ".concat(result.matchingSymbols.length, " matches across ").concat(result.foldedFiles.length, " files (~").concat(result.tokenEstimate, " tokens for folded view)"));
    parts.push("");
    if (result.matchingSymbols.length === 0) {
        parts.push("   No matching symbols found.");
        return parts.join("\n");
    }
    // Show matching symbols first (compact)
    parts.push("── Matching Symbols ──");
    parts.push("");
    for (var _i = 0, _a = result.matchingSymbols; _i < _a.length; _i++) {
        var match = _a[_i];
        parts.push("  ".concat(match.kind, " ").concat(match.symbolName, " (").concat(match.filePath, ":").concat(match.lineStart + 1, ")"));
        parts.push("    ".concat(match.signature));
        if (match.jsdoc) {
            var firstLine = match.jsdoc.split("\n").find(function (l) { return l.replace(/^[\s*/]+/, "").trim().length > 0; });
            if (firstLine) {
                parts.push("    \uD83D\uDCAC ".concat(firstLine.replace(/^[\s*/]+/, "").trim()));
            }
        }
        parts.push("");
    }
    // Show folded file views
    parts.push("── Folded File Views ──");
    parts.push("");
    for (var _b = 0, _c = result.foldedFiles; _b < _c.length; _b++) {
        var file = _c[_b];
        parts.push((0, parser_js_1.formatFoldedView)(file));
        parts.push("");
    }
    parts.push("── Actions ──");
    parts.push('  To see full implementation: use smart_unfold with file path and symbol name');
    return parts.join("\n");
}
