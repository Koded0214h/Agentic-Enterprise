"use strict";
/**
 * Memory-directory scanning primitives. Split out of findRelevantMemories.ts
 * so extractMemories can import the scan without pulling in sideQuery and
 * the API-client chain (which closed a cycle through memdir.ts — #25372).
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
exports.scanMemoryFiles = scanMemoryFiles;
exports.formatMemoryManifest = formatMemoryManifest;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var frontmatterParser_js_1 = require("../utils/frontmatterParser.js");
var readFileInRange_js_1 = require("../utils/readFileInRange.js");
var memoryTypes_js_1 = require("./memoryTypes.js");
var MAX_MEMORY_FILES = 200;
var FRONTMATTER_MAX_LINES = 30;
/**
 * Scan a memory directory for .md files, read their frontmatter, and return
 * a header list sorted newest-first (capped at MAX_MEMORY_FILES). Shared by
 * findRelevantMemories (query-time recall) and extractMemories (pre-injects
 * the listing so the extraction agent doesn't spend a turn on `ls`).
 *
 * Single-pass: readFileInRange stats internally and returns mtimeMs, so we
 * read-then-sort rather than stat-sort-read. For the common case (N ≤ 200)
 * this halves syscalls vs a separate stat round; for large N we read a few
 * extra small files but still avoid the double-stat on the surviving 200.
 */
function scanMemoryFiles(memoryDir, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var entries, mdFiles, headerResults, _a;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(memoryDir, { recursive: true })];
                case 1:
                    entries = _b.sent();
                    mdFiles = entries.filter(function (f) { return f.endsWith('.md') && (0, path_1.basename)(f) !== 'MEMORY.md'; });
                    return [4 /*yield*/, Promise.allSettled(mdFiles.map(function (relativePath) { return __awaiter(_this, void 0, void 0, function () {
                            var filePath, _a, content, mtimeMs, frontmatter;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        filePath = (0, path_1.join)(memoryDir, relativePath);
                                        return [4 /*yield*/, (0, readFileInRange_js_1.readFileInRange)(filePath, 0, FRONTMATTER_MAX_LINES, undefined, signal)];
                                    case 1:
                                        _a = _b.sent(), content = _a.content, mtimeMs = _a.mtimeMs;
                                        frontmatter = (0, frontmatterParser_js_1.parseFrontmatter)(content, filePath).frontmatter;
                                        return [2 /*return*/, {
                                                filename: relativePath,
                                                filePath: filePath,
                                                mtimeMs: mtimeMs,
                                                description: frontmatter.description || null,
                                                type: (0, memoryTypes_js_1.parseMemoryType)(frontmatter.type),
                                            }];
                                }
                            });
                        }); }))];
                case 2:
                    headerResults = _b.sent();
                    return [2 /*return*/, headerResults
                            .filter(function (r) {
                            return r.status === 'fulfilled';
                        })
                            .map(function (r) { return r.value; })
                            .sort(function (a, b) { return b.mtimeMs - a.mtimeMs; })
                            .slice(0, MAX_MEMORY_FILES)];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Format memory headers as a text manifest: one line per file with
 * [type] filename (timestamp): description. Used by both the recall
 * selector prompt and the extraction-agent prompt.
 */
function formatMemoryManifest(memories) {
    return memories
        .map(function (m) {
        var tag = m.type ? "[".concat(m.type, "] ") : '';
        var ts = new Date(m.mtimeMs).toISOString();
        return m.description
            ? "- ".concat(tag).concat(m.filename, " (").concat(ts, "): ").concat(m.description)
            : "- ".concat(tag).concat(m.filename, " (").concat(ts, ")");
    })
        .join('\n');
}
