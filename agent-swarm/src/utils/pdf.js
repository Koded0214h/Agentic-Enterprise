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
exports.readPDF = readPDF;
exports.getPDFPageCount = getPDFPageCount;
exports.resetPdftoppmCache = resetPdftoppmCache;
exports.isPdftoppmAvailable = isPdftoppmAvailable;
exports.extractPDFPages = extractPDFPages;
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var apiLimits_js_1 = require("../constants/apiLimits.js");
var errors_js_1 = require("./errors.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var format_js_1 = require("./format.js");
var fsOperations_js_1 = require("./fsOperations.js");
var toolResultStorage_js_1 = require("./toolResultStorage.js");
/**
 * Read a PDF file and return it as base64-encoded data.
 * @param filePath Path to the PDF file
 * @returns Result containing PDF data or a structured error
 */
function readPDF(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, stats, originalSize, fileBuffer, header, base64, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    return [4 /*yield*/, fs.stat(filePath)];
                case 1:
                    stats = _a.sent();
                    originalSize = stats.size;
                    // Check if file is empty
                    if (originalSize === 0) {
                        return [2 /*return*/, {
                                success: false,
                                error: { reason: 'empty', message: "PDF file is empty: ".concat(filePath) },
                            }];
                    }
                    // Check if PDF exceeds maximum size
                    // The API has a 32MB total request limit. After base64 encoding (~33% larger),
                    // a PDF must be under ~20MB raw to leave room for conversation context.
                    if (originalSize > apiLimits_js_1.PDF_TARGET_RAW_SIZE) {
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    reason: 'too_large',
                                    message: "PDF file exceeds maximum allowed size of ".concat((0, format_js_1.formatFileSize)(apiLimits_js_1.PDF_TARGET_RAW_SIZE), "."),
                                },
                            }];
                    }
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath)
                        // Validate PDF magic bytes — reject files that aren't actually PDFs
                        // (e.g., HTML files renamed to .pdf) before they enter conversation context.
                        // Once an invalid PDF document block is in the message history, every subsequent
                        // API call fails with 400 "The PDF specified was not valid" and the session
                        // becomes unrecoverable without /clear.
                    ];
                case 2:
                    fileBuffer = _a.sent();
                    header = fileBuffer.subarray(0, 5).toString('ascii');
                    if (!header.startsWith('%PDF-')) {
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    reason: 'corrupted',
                                    message: "File is not a valid PDF (missing %PDF- header): ".concat(filePath),
                                },
                            }];
                    }
                    base64 = fileBuffer.toString('base64');
                    // Note: We cannot check page count here without parsing the PDF
                    // The API will enforce the 100-page limit and return an error if exceeded
                    return [2 /*return*/, {
                            success: true,
                            data: {
                                type: 'pdf',
                                file: {
                                    filePath: filePath,
                                    base64: base64,
                                    originalSize: originalSize,
                                },
                            },
                        }];
                case 3:
                    e_1 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: {
                                reason: 'unknown',
                                message: (0, errors_js_1.errorMessage)(e_1),
                            },
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the number of pages in a PDF file using `pdfinfo` (from poppler-utils).
 * Returns `null` if pdfinfo is not available or if the page count cannot be determined.
 */
function getPDFPageCount(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, code, stdout, match, count;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('pdfinfo', [filePath], {
                        timeout: 10000,
                        useCwd: false,
                    })];
                case 1:
                    _a = _b.sent(), code = _a.code, stdout = _a.stdout;
                    if (code !== 0) {
                        return [2 /*return*/, null];
                    }
                    match = /^Pages:\s+(\d+)/m.exec(stdout);
                    if (!match) {
                        return [2 /*return*/, null];
                    }
                    count = parseInt(match[1], 10);
                    return [2 /*return*/, isNaN(count) ? null : count];
            }
        });
    });
}
var pdftoppmAvailable;
/**
 * Reset the pdftoppm availability cache. Used by tests only.
 */
function resetPdftoppmCache() {
    pdftoppmAvailable = undefined;
}
/**
 * Check whether the `pdftoppm` binary (from poppler-utils) is available.
 * The result is cached for the lifetime of the process.
 */
function isPdftoppmAvailable() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, code, stderr;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (pdftoppmAvailable !== undefined)
                        return [2 /*return*/, pdftoppmAvailable];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('pdftoppm', ['-v'], {
                            timeout: 5000,
                            useCwd: false,
                        })
                        // pdftoppm prints version info to stderr and exits 0 (or sometimes 99 on older versions)
                    ];
                case 1:
                    _a = _b.sent(), code = _a.code, stderr = _a.stderr;
                    // pdftoppm prints version info to stderr and exits 0 (or sometimes 99 on older versions)
                    pdftoppmAvailable = code === 0 || stderr.length > 0;
                    return [2 /*return*/, pdftoppmAvailable];
            }
        });
    });
}
/**
 * Extract PDF pages as JPEG images using pdftoppm.
 * Produces page-01.jpg, page-02.jpg, etc. in an output directory.
 * This enables reading large PDFs and works with all API providers.
 *
 * @param filePath Path to the PDF file
 * @param options Optional page range (1-indexed, inclusive)
 */
function extractPDFPages(filePath, options) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, stats, originalSize, available, uuid, outputDir, prefix, args, _a, code, stderr, entries, imageFiles, pageCount, count, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    return [4 /*yield*/, fs.stat(filePath)];
                case 1:
                    stats = _b.sent();
                    originalSize = stats.size;
                    if (originalSize === 0) {
                        return [2 /*return*/, {
                                success: false,
                                error: { reason: 'empty', message: "PDF file is empty: ".concat(filePath) },
                            }];
                    }
                    if (originalSize > apiLimits_js_1.PDF_MAX_EXTRACT_SIZE) {
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    reason: 'too_large',
                                    message: "PDF file exceeds maximum allowed size for text extraction (".concat((0, format_js_1.formatFileSize)(apiLimits_js_1.PDF_MAX_EXTRACT_SIZE), ")."),
                                },
                            }];
                    }
                    return [4 /*yield*/, isPdftoppmAvailable()];
                case 2:
                    available = _b.sent();
                    if (!available) {
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    reason: 'unavailable',
                                    message: 'pdftoppm is not installed. Install poppler-utils (e.g. `brew install poppler` or `apt-get install poppler-utils`) to enable PDF page rendering.',
                                },
                            }];
                    }
                    uuid = (0, crypto_1.randomUUID)();
                    outputDir = (0, path_1.join)((0, toolResultStorage_js_1.getToolResultsDir)(), "pdf-".concat(uuid));
                    return [4 /*yield*/, (0, promises_1.mkdir)(outputDir, { recursive: true })
                        // pdftoppm produces files like <prefix>-01.jpg, <prefix>-02.jpg, etc.
                    ];
                case 3:
                    _b.sent();
                    prefix = (0, path_1.join)(outputDir, 'page');
                    args = ['-jpeg', '-r', '100'];
                    if (options === null || options === void 0 ? void 0 : options.firstPage) {
                        args.push('-f', String(options.firstPage));
                    }
                    if ((options === null || options === void 0 ? void 0 : options.lastPage) && options.lastPage !== Infinity) {
                        args.push('-l', String(options.lastPage));
                    }
                    args.push(filePath, prefix);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('pdftoppm', args, {
                            timeout: 120000,
                            useCwd: false,
                        })];
                case 4:
                    _a = _b.sent(), code = _a.code, stderr = _a.stderr;
                    if (code !== 0) {
                        if (/password/i.test(stderr)) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        reason: 'password_protected',
                                        message: 'PDF is password-protected. Please provide an unprotected version.',
                                    },
                                }];
                        }
                        if (/damaged|corrupt|invalid/i.test(stderr)) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        reason: 'corrupted',
                                        message: 'PDF file is corrupted or invalid.',
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                success: false,
                                error: { reason: 'unknown', message: "pdftoppm failed: ".concat(stderr) },
                            }];
                    }
                    return [4 /*yield*/, (0, promises_1.readdir)(outputDir)];
                case 5:
                    entries = _b.sent();
                    imageFiles = entries.filter(function (f) { return f.endsWith('.jpg'); }).sort();
                    pageCount = imageFiles.length;
                    if (pageCount === 0) {
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    reason: 'corrupted',
                                    message: 'pdftoppm produced no output pages. The PDF may be invalid.',
                                },
                            }];
                    }
                    count = imageFiles.length;
                    return [2 /*return*/, {
                            success: true,
                            data: {
                                type: 'parts',
                                file: {
                                    filePath: filePath,
                                    originalSize: originalSize,
                                    outputDir: outputDir,
                                    count: count,
                                },
                            },
                        }];
                case 6:
                    e_2 = _b.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: {
                                reason: 'unknown',
                                message: (0, errors_js_1.errorMessage)(e_2),
                            },
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
