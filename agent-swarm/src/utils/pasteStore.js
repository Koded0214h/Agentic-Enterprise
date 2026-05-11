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
exports.hashPastedText = hashPastedText;
exports.storePastedText = storePastedText;
exports.retrievePastedText = retrievePastedText;
exports.cleanupOldPastes = cleanupOldPastes;
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var PASTE_STORE_DIR = 'paste-cache';
/**
 * Get the paste store directory (persistent across sessions).
 */
function getPasteStoreDir() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), PASTE_STORE_DIR);
}
/**
 * Generate a hash for paste content to use as filename.
 * Exported so callers can get the hash synchronously before async storage.
 */
function hashPastedText(content) {
    return (0, crypto_1.createHash)('sha256').update(content).digest('hex').slice(0, 16);
}
/**
 * Get the file path for a paste by its content hash.
 */
function getPastePath(hash) {
    return (0, path_1.join)(getPasteStoreDir(), "".concat(hash, ".txt"));
}
/**
 * Store pasted text content to disk.
 * The hash should be pre-computed with hashPastedText() so the caller
 * can use it immediately without waiting for the async disk write.
 */
function storePastedText(hash, content) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, pastePath, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    dir = getPasteStoreDir();
                    return [4 /*yield*/, (0, promises_1.mkdir)(dir, { recursive: true })];
                case 1:
                    _a.sent();
                    pastePath = getPastePath(hash);
                    // Content-addressable: same hash = same content, so overwriting is safe
                    return [4 /*yield*/, (0, promises_1.writeFile)(pastePath, content, { encoding: 'utf8', mode: 384 })];
                case 2:
                    // Content-addressable: same hash = same content, so overwriting is safe
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("Stored paste ".concat(hash, " to ").concat(pastePath));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to store paste: ".concat(error_1));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Retrieve pasted text content by its hash.
 * Returns null if not found or on error.
 */
function retrievePastedText(hash) {
    return __awaiter(this, void 0, void 0, function () {
        var pastePath, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    pastePath = getPastePath(hash);
                    return [4 /*yield*/, (0, promises_1.readFile)(pastePath, { encoding: 'utf8' })];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_2 = _a.sent();
                    // ENOENT is expected when paste doesn't exist
                    if (!(0, errors_js_1.isENOENT)(error_2)) {
                        (0, debug_js_1.logForDebugging)("Failed to retrieve paste ".concat(hash, ": ").concat(error_2));
                    }
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Clean up old paste files that are no longer referenced.
 * This is a simple time-based cleanup - removes files older than cutoffDate.
 */
function cleanupOldPastes(cutoffDate) {
    return __awaiter(this, void 0, void 0, function () {
        var pasteDir, files, _a, cutoffTime, _i, files_1, file, filePath, stats, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    pasteDir = getPasteStoreDir();
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(pasteDir)];
                case 2:
                    files = _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    // Directory doesn't exist or can't be read - nothing to clean up
                    return [2 /*return*/];
                case 4:
                    cutoffTime = cutoffDate.getTime();
                    _i = 0, files_1 = files;
                    _c.label = 5;
                case 5:
                    if (!(_i < files_1.length)) return [3 /*break*/, 12];
                    file = files_1[_i];
                    if (!file.endsWith('.txt')) {
                        return [3 /*break*/, 11];
                    }
                    filePath = (0, path_1.join)(pasteDir, file);
                    _c.label = 6;
                case 6:
                    _c.trys.push([6, 10, , 11]);
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                case 7:
                    stats = _c.sent();
                    if (!(stats.mtimeMs < cutoffTime)) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, promises_1.unlink)(filePath)];
                case 8:
                    _c.sent();
                    (0, debug_js_1.logForDebugging)("Cleaned up old paste: ".concat(filePath));
                    _c.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    _b = _c.sent();
                    return [3 /*break*/, 11];
                case 11:
                    _i++;
                    return [3 /*break*/, 5];
                case 12: return [2 /*return*/];
            }
        });
    });
}
