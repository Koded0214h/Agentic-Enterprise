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
exports.isPathSafe = isPathSafe;
exports.validateZipFile = validateZipFile;
exports.unzipFile = unzipFile;
exports.parseZipModes = parseZipModes;
exports.readAndUnzipFile = readAndUnzipFile;
var path_1 = require("path");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var fsOperations_js_1 = require("../fsOperations.js");
var path_js_1 = require("../path.js");
var LIMITS = {
    MAX_FILE_SIZE: 512 * 1024 * 1024, // 512MB per file
    MAX_TOTAL_SIZE: 1024 * 1024 * 1024, // 1024MB total uncompressed
    MAX_FILE_COUNT: 100000, // Maximum number of files
    MAX_COMPRESSION_RATIO: 50, // Anything above 50:1 is suspicious
    MIN_COMPRESSION_RATIO: 0.5, // Below 0.5:1 might indicate already compressed malicious content
};
/**
 * Validates a file path to prevent path traversal attacks
 */
function isPathSafe(filePath) {
    if ((0, path_js_1.containsPathTraversal)(filePath)) {
        return false;
    }
    // Normalize the path to resolve any '.' segments
    var normalized = (0, path_1.normalize)(filePath);
    // Check for absolute paths (we only want relative paths in archives)
    if ((0, path_1.isAbsolute)(normalized)) {
        return false;
    }
    return true;
}
/**
 * Validates a single file during zip extraction
 */
function validateZipFile(file, state) {
    state.fileCount++;
    var error;
    // Check file count
    if (state.fileCount > LIMITS.MAX_FILE_COUNT) {
        error = "Archive contains too many files: ".concat(state.fileCount, " (max: ").concat(LIMITS.MAX_FILE_COUNT, ")");
    }
    // Validate path safety
    if (!isPathSafe(file.name)) {
        error = "Unsafe file path detected: \"".concat(file.name, "\". Path traversal or absolute paths are not allowed.");
    }
    // Check individual file size
    var fileSize = file.originalSize || 0;
    if (fileSize > LIMITS.MAX_FILE_SIZE) {
        error = "File \"".concat(file.name, "\" is too large: ").concat(Math.round(fileSize / 1024 / 1024), "MB (max: ").concat(Math.round(LIMITS.MAX_FILE_SIZE / 1024 / 1024), "MB)");
    }
    // Track total uncompressed size
    state.totalUncompressedSize += fileSize;
    // Check total size
    if (state.totalUncompressedSize > LIMITS.MAX_TOTAL_SIZE) {
        error = "Archive total size is too large: ".concat(Math.round(state.totalUncompressedSize / 1024 / 1024), "MB (max: ").concat(Math.round(LIMITS.MAX_TOTAL_SIZE / 1024 / 1024), "MB)");
    }
    // Check compression ratio for zip bomb detection
    var currentRatio = state.totalUncompressedSize / state.compressedSize;
    if (currentRatio > LIMITS.MAX_COMPRESSION_RATIO) {
        error = "Suspicious compression ratio detected: ".concat(currentRatio.toFixed(1), ":1 (max: ").concat(LIMITS.MAX_COMPRESSION_RATIO, ":1). This may be a zip bomb.");
    }
    return error ? { isValid: false, error: error } : { isValid: true };
}
/**
 * Unzips data from a Buffer and returns its contents as a record of file paths to Uint8Array data.
 * Uses unzipSync to avoid fflate worker termination crashes in bun.
 * Accepts raw zip bytes so that the caller can read the file asynchronously.
 *
 * fflate is lazy-imported to avoid its ~196KB of top-level lookup tables (revfd
 * Int32Array(32769), rev Uint16Array(32768), etc.) being allocated at startup
 * when this module is reached via the plugin loader chain.
 */
function unzipFile(zipData) {
    return __awaiter(this, void 0, void 0, function () {
        var unzipSync, compressedSize, state, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('fflate'); })];
                case 1:
                    unzipSync = (_a.sent()).unzipSync;
                    compressedSize = zipData.length;
                    state = {
                        fileCount: 0,
                        totalUncompressedSize: 0,
                        compressedSize: compressedSize,
                        errors: [],
                    };
                    result = unzipSync(new Uint8Array(zipData), {
                        filter: function (file) {
                            var validationResult = validateZipFile(file, state);
                            if (!validationResult.isValid) {
                                throw new Error(validationResult.error);
                            }
                            return true;
                        },
                    });
                    (0, debug_js_1.logForDebugging)("Zip extraction completed: ".concat(state.fileCount, " files, ").concat(Math.round(state.totalUncompressedSize / 1024), "KB uncompressed"));
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Parse Unix file modes from a zip's central directory.
 *
 * fflate's `unzipSync` returns only `Record<string, Uint8Array>` — it does not
 * surface the external file attributes stored in the central directory. This
 * means executable bits are lost during extraction (everything becomes 0644).
 * The git-clone path preserves +x natively, but the GCS/zip path needs this
 * helper to keep parity.
 *
 * Returns `name → mode` for entries created on a Unix host (`versionMadeBy`
 * high byte === 3). Entries from other hosts, or with no mode bits set, are
 * omitted. Callers should treat a missing key as "use default mode".
 *
 * Format per PKZIP APPNOTE.TXT §4.3.12 (central directory) and §4.3.16 (EOCD).
 * ZIP64 is not handled — returns `{}` on archives >4GB or >65535 entries,
 * which is fine for marketplace zips (~3.5MB) and MCPB bundles.
 */
function parseZipModes(data) {
    // Buffer view for readUInt* methods — shares memory, no copy.
    var buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    var modes = {};
    // 1. Find the End of Central Directory record (sig 0x06054b50). It lives in
    //    the trailing 22 + 65535 bytes (fixed EOCD size + max comment length).
    //    Scan backwards — the EOCD is typically the last 22 bytes.
    var minEocd = Math.max(0, buf.length - 22 - 0xffff);
    var eocd = -1;
    for (var i = buf.length - 22; i >= minEocd; i--) {
        if (buf.readUInt32LE(i) === 0x06054b50) {
            eocd = i;
            break;
        }
    }
    if (eocd < 0)
        return modes; // malformed — let fflate's error surface elsewhere
    var entryCount = buf.readUInt16LE(eocd + 10);
    var off = buf.readUInt32LE(eocd + 16); // central directory start offset
    // 2. Walk central directory entries (sig 0x02014b50). Each entry has a
    //    46-byte fixed header followed by variable-length name/extra/comment.
    for (var i = 0; i < entryCount; i++) {
        if (off + 46 > buf.length || buf.readUInt32LE(off) !== 0x02014b50)
            break;
        var versionMadeBy = buf.readUInt16LE(off + 4);
        var nameLen = buf.readUInt16LE(off + 28);
        var extraLen = buf.readUInt16LE(off + 30);
        var commentLen = buf.readUInt16LE(off + 32);
        var externalAttr = buf.readUInt32LE(off + 38);
        var name_1 = buf.toString('utf8', off + 46, off + 46 + nameLen);
        // versionMadeBy high byte = host OS. 3 = Unix. For Unix zips, the high
        // 16 bits of externalAttr hold st_mode (file type + permission bits).
        if (versionMadeBy >> 8 === 3) {
            var mode = (externalAttr >>> 16) & 0xffff;
            if (mode)
                modes[name_1] = mode;
        }
        off += 46 + nameLen + extraLen + commentLen;
    }
    return modes;
}
/**
 * Reads a zip file from disk asynchronously and unzips it.
 * Returns its contents as a record of file paths to Uint8Array data.
 */
function readAndUnzipFile(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, zipData, error_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fs.readFileBytes(filePath)
                        // await is required here: without it, rejections from the now-async
                        // unzipFile() escape the try/catch and bypass the error wrapping below.
                    ];
                case 2:
                    zipData = _a.sent();
                    return [4 /*yield*/, unzipFile(zipData)];
                case 3: 
                // await is required here: without it, rejections from the now-async
                // unzipFile() escape the try/catch and bypass the error wrapping below.
                return [2 /*return*/, _a.sent()];
                case 4:
                    error_1 = _a.sent();
                    if ((0, errors_js_1.isENOENT)(error_1)) {
                        throw error_1;
                    }
                    errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                    throw new Error("Failed to read or unzip file: ".concat(errorMessage));
                case 5: return [2 /*return*/];
            }
        });
    });
}
