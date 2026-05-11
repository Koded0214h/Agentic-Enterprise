"use strict";
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
exports.ImageResizeError = void 0;
exports.maybeResizeAndDownsampleImageBuffer = maybeResizeAndDownsampleImageBuffer;
exports.maybeResizeAndDownsampleImageBlock = maybeResizeAndDownsampleImageBlock;
exports.compressImageBuffer = compressImageBuffer;
exports.compressImageBufferWithTokenLimit = compressImageBufferWithTokenLimit;
exports.compressImageBlock = compressImageBlock;
exports.detectImageFormatFromBuffer = detectImageFormatFromBuffer;
exports.detectImageFormatFromBase64 = detectImageFormatFromBase64;
exports.createImageMetadataText = createImageMetadataText;
var apiLimits_js_1 = require("../constants/apiLimits.js");
var index_js_1 = require("../services/analytics/index.js");
var imageProcessor_js_1 = require("../tools/FileReadTool/imageProcessor.js");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var format_js_1 = require("./format.js");
var log_js_1 = require("./log.js");
// Error type constants for analytics (numeric to comply with logEvent restrictions)
var ERROR_TYPE_MODULE_LOAD = 1;
var ERROR_TYPE_PROCESSING = 2;
var ERROR_TYPE_UNKNOWN = 3;
var ERROR_TYPE_PIXEL_LIMIT = 4;
var ERROR_TYPE_MEMORY = 5;
var ERROR_TYPE_TIMEOUT = 6;
var ERROR_TYPE_VIPS = 7;
var ERROR_TYPE_PERMISSION = 8;
/**
 * Error thrown when image resizing fails and the image exceeds the API limit.
 */
var ImageResizeError = /** @class */ (function (_super) {
    __extends(ImageResizeError, _super);
    function ImageResizeError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'ImageResizeError';
        return _this;
    }
    return ImageResizeError;
}(Error));
exports.ImageResizeError = ImageResizeError;
/**
 * Classifies image processing errors for analytics.
 *
 * Uses error codes when available (Node.js module errors), falls back to
 * message matching for libraries like sharp that don't expose error codes.
 */
function classifyImageError(error) {
    // Check for Node.js error codes first (more reliable than string matching)
    if (error instanceof Error) {
        var errorWithCode = error;
        if (errorWithCode.code === 'MODULE_NOT_FOUND' ||
            errorWithCode.code === 'ERR_MODULE_NOT_FOUND' ||
            errorWithCode.code === 'ERR_DLOPEN_FAILED') {
            return ERROR_TYPE_MODULE_LOAD;
        }
        if (errorWithCode.code === 'EACCES' || errorWithCode.code === 'EPERM') {
            return ERROR_TYPE_PERMISSION;
        }
        if (errorWithCode.code === 'ENOMEM') {
            return ERROR_TYPE_MEMORY;
        }
    }
    // Fall back to message matching for errors without codes
    // Note: sharp doesn't expose error codes, so we must match on messages
    var message = (0, errors_js_1.errorMessage)(error);
    // Module loading errors from our native wrapper
    if (message.includes('Native image processor module not available')) {
        return ERROR_TYPE_MODULE_LOAD;
    }
    // Sharp/vips processing errors (format detection, corrupt data, etc.)
    if (message.includes('unsupported image format') ||
        message.includes('Input buffer') ||
        message.includes('Input file is missing') ||
        message.includes('Input file has corrupt header') ||
        message.includes('corrupt header') ||
        message.includes('corrupt image') ||
        message.includes('premature end') ||
        message.includes('zlib: data error') ||
        message.includes('zero width') ||
        message.includes('zero height')) {
        return ERROR_TYPE_PROCESSING;
    }
    // Pixel/dimension limit errors from sharp/vips
    if (message.includes('pixel limit') ||
        message.includes('too many pixels') ||
        message.includes('exceeds pixel') ||
        message.includes('image dimensions')) {
        return ERROR_TYPE_PIXEL_LIMIT;
    }
    // Memory allocation failures
    if (message.includes('out of memory') ||
        message.includes('Cannot allocate') ||
        message.includes('memory allocation')) {
        return ERROR_TYPE_MEMORY;
    }
    // Timeout errors
    if (message.includes('timeout') || message.includes('timed out')) {
        return ERROR_TYPE_TIMEOUT;
    }
    // Vips-specific errors (VipsJpeg, VipsPng, VipsWebp, etc.)
    if (message.includes('Vips')) {
        return ERROR_TYPE_VIPS;
    }
    return ERROR_TYPE_UNKNOWN;
}
/**
 * Computes a simple numeric hash of a string for analytics grouping.
 * Uses djb2 algorithm, returning a 32-bit unsigned integer.
 */
function hashString(str) {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
    }
    return hash >>> 0;
}
/**
 * Extracted from FileReadTool's readImage function
 * Resizes image buffer to meet size and dimension constraints
 */
function maybeResizeAndDownsampleImageBuffer(imageBuffer, originalSize, ext) {
    return __awaiter(this, void 0, void 0, function () {
        var sharp, image, metadata, mediaType, normalizedMediaType, compressedBuffer, originalWidth, originalHeight, width, height, needsDimensionResize, isPng, pngCompressed, _i, _a, quality, compressedBuffer, resizedImageBuffer, pngCompressed, _b, _c, quality, compressedBuffer_1, smallerWidth, smallerHeight, compressedBuffer, error_1, errorType, errorMsg, detected, normalizedExt, base64Size, overDim;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (imageBuffer.length === 0) {
                        // Empty buffer would fall through the catch block below (sharp throws
                        // "Unable to determine image format"), and the fallback's size check
                        // `0 ≤ 5MB` would pass it through, yielding an empty base64 string
                        // that the API rejects with `image cannot be empty`.
                        throw new ImageResizeError('Image file is empty (0 bytes)');
                    }
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 22, , 23]);
                    return [4 /*yield*/, (0, imageProcessor_js_1.getImageProcessor)()];
                case 2:
                    sharp = _e.sent();
                    image = sharp(imageBuffer);
                    return [4 /*yield*/, image.metadata()];
                case 3:
                    metadata = _e.sent();
                    mediaType = (_d = metadata.format) !== null && _d !== void 0 ? _d : ext;
                    normalizedMediaType = mediaType === 'jpg' ? 'jpeg' : mediaType;
                    if (!(!metadata.width || !metadata.height)) return [3 /*break*/, 6];
                    if (!(originalSize > apiLimits_js_1.IMAGE_TARGET_RAW_SIZE)) return [3 /*break*/, 5];
                    return [4 /*yield*/, sharp(imageBuffer)
                            .jpeg({ quality: 80 })
                            .toBuffer()];
                case 4:
                    compressedBuffer = _e.sent();
                    return [2 /*return*/, { buffer: compressedBuffer, mediaType: 'jpeg' }];
                case 5: 
                // Return without dimensions if we can't determine them
                return [2 /*return*/, { buffer: imageBuffer, mediaType: normalizedMediaType }];
                case 6:
                    originalWidth = metadata.width;
                    originalHeight = metadata.height;
                    width = originalWidth;
                    height = originalHeight;
                    // Check if the original file just works
                    if (originalSize <= apiLimits_js_1.IMAGE_TARGET_RAW_SIZE &&
                        width <= apiLimits_js_1.IMAGE_MAX_WIDTH &&
                        height <= apiLimits_js_1.IMAGE_MAX_HEIGHT) {
                        return [2 /*return*/, {
                                buffer: imageBuffer,
                                mediaType: normalizedMediaType,
                                dimensions: {
                                    originalWidth: originalWidth,
                                    originalHeight: originalHeight,
                                    displayWidth: width,
                                    displayHeight: height,
                                },
                            }];
                    }
                    needsDimensionResize = width > apiLimits_js_1.IMAGE_MAX_WIDTH || height > apiLimits_js_1.IMAGE_MAX_HEIGHT;
                    isPng = normalizedMediaType === 'png';
                    if (!(!needsDimensionResize && originalSize > apiLimits_js_1.IMAGE_TARGET_RAW_SIZE)) return [3 /*break*/, 12];
                    if (!isPng) return [3 /*break*/, 8];
                    return [4 /*yield*/, sharp(imageBuffer)
                            .png({ compressionLevel: 9, palette: true })
                            .toBuffer()];
                case 7:
                    pngCompressed = _e.sent();
                    if (pngCompressed.length <= apiLimits_js_1.IMAGE_TARGET_RAW_SIZE) {
                        return [2 /*return*/, {
                                buffer: pngCompressed,
                                mediaType: 'png',
                                dimensions: {
                                    originalWidth: originalWidth,
                                    originalHeight: originalHeight,
                                    displayWidth: width,
                                    displayHeight: height,
                                },
                            }];
                    }
                    _e.label = 8;
                case 8:
                    _i = 0, _a = [80, 60, 40, 20];
                    _e.label = 9;
                case 9:
                    if (!(_i < _a.length)) return [3 /*break*/, 12];
                    quality = _a[_i];
                    return [4 /*yield*/, sharp(imageBuffer)
                            .jpeg({ quality: quality })
                            .toBuffer()];
                case 10:
                    compressedBuffer = _e.sent();
                    if (compressedBuffer.length <= apiLimits_js_1.IMAGE_TARGET_RAW_SIZE) {
                        return [2 /*return*/, {
                                buffer: compressedBuffer,
                                mediaType: 'jpeg',
                                dimensions: {
                                    originalWidth: originalWidth,
                                    originalHeight: originalHeight,
                                    displayWidth: width,
                                    displayHeight: height,
                                },
                            }];
                    }
                    _e.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 9];
                case 12:
                    // Constrain dimensions if needed
                    if (width > apiLimits_js_1.IMAGE_MAX_WIDTH) {
                        height = Math.round((height * apiLimits_js_1.IMAGE_MAX_WIDTH) / width);
                        width = apiLimits_js_1.IMAGE_MAX_WIDTH;
                    }
                    if (height > apiLimits_js_1.IMAGE_MAX_HEIGHT) {
                        width = Math.round((width * apiLimits_js_1.IMAGE_MAX_HEIGHT) / height);
                        height = apiLimits_js_1.IMAGE_MAX_HEIGHT;
                    }
                    // IMPORTANT: Always create fresh sharp(imageBuffer) instances for each operation.
                    // The native image-processor-napi module doesn't properly apply format conversions
                    // when reusing a sharp instance after calling toBuffer(). This caused a bug where
                    // all compression attempts (PNG, JPEG at various qualities) returned identical sizes.
                    (0, debug_js_1.logForDebugging)("Resizing to ".concat(width, "x").concat(height));
                    return [4 /*yield*/, sharp(imageBuffer)
                            .resize(width, height, {
                            fit: 'inside',
                            withoutEnlargement: true,
                        })
                            .toBuffer()
                        // If still too large after resize, try compression
                    ];
                case 13:
                    resizedImageBuffer = _e.sent();
                    if (!(resizedImageBuffer.length > apiLimits_js_1.IMAGE_TARGET_RAW_SIZE)) return [3 /*break*/, 21];
                    if (!isPng) return [3 /*break*/, 15];
                    return [4 /*yield*/, sharp(imageBuffer)
                            .resize(width, height, {
                            fit: 'inside',
                            withoutEnlargement: true,
                        })
                            .png({ compressionLevel: 9, palette: true })
                            .toBuffer()];
                case 14:
                    pngCompressed = _e.sent();
                    if (pngCompressed.length <= apiLimits_js_1.IMAGE_TARGET_RAW_SIZE) {
                        return [2 /*return*/, {
                                buffer: pngCompressed,
                                mediaType: 'png',
                                dimensions: {
                                    originalWidth: originalWidth,
                                    originalHeight: originalHeight,
                                    displayWidth: width,
                                    displayHeight: height,
                                },
                            }];
                    }
                    _e.label = 15;
                case 15:
                    _b = 0, _c = [80, 60, 40, 20];
                    _e.label = 16;
                case 16:
                    if (!(_b < _c.length)) return [3 /*break*/, 19];
                    quality = _c[_b];
                    return [4 /*yield*/, sharp(imageBuffer)
                            .resize(width, height, {
                            fit: 'inside',
                            withoutEnlargement: true,
                        })
                            .jpeg({ quality: quality })
                            .toBuffer()];
                case 17:
                    compressedBuffer_1 = _e.sent();
                    if (compressedBuffer_1.length <= apiLimits_js_1.IMAGE_TARGET_RAW_SIZE) {
                        return [2 /*return*/, {
                                buffer: compressedBuffer_1,
                                mediaType: 'jpeg',
                                dimensions: {
                                    originalWidth: originalWidth,
                                    originalHeight: originalHeight,
                                    displayWidth: width,
                                    displayHeight: height,
                                },
                            }];
                    }
                    _e.label = 18;
                case 18:
                    _b++;
                    return [3 /*break*/, 16];
                case 19:
                    smallerWidth = Math.min(width, 1000);
                    smallerHeight = Math.round((height * smallerWidth) / Math.max(width, 1));
                    (0, debug_js_1.logForDebugging)('Still too large, compressing with JPEG');
                    return [4 /*yield*/, sharp(imageBuffer)
                            .resize(smallerWidth, smallerHeight, {
                            fit: 'inside',
                            withoutEnlargement: true,
                        })
                            .jpeg({ quality: 20 })
                            .toBuffer()];
                case 20:
                    compressedBuffer = _e.sent();
                    (0, debug_js_1.logForDebugging)("JPEG compressed buffer size: ".concat(compressedBuffer.length));
                    return [2 /*return*/, {
                            buffer: compressedBuffer,
                            mediaType: 'jpeg',
                            dimensions: {
                                originalWidth: originalWidth,
                                originalHeight: originalHeight,
                                displayWidth: smallerWidth,
                                displayHeight: smallerHeight,
                            },
                        }];
                case 21: return [2 /*return*/, {
                        buffer: resizedImageBuffer,
                        mediaType: normalizedMediaType,
                        dimensions: {
                            originalWidth: originalWidth,
                            originalHeight: originalHeight,
                            displayWidth: width,
                            displayHeight: height,
                        },
                    }];
                case 22:
                    error_1 = _e.sent();
                    // Log the error and emit analytics event
                    (0, log_js_1.logError)(error_1);
                    errorType = classifyImageError(error_1);
                    errorMsg = (0, errors_js_1.errorMessage)(error_1);
                    (0, index_js_1.logEvent)('tengu_image_resize_failed', {
                        original_size_bytes: originalSize,
                        error_type: errorType,
                        error_message_hash: hashString(errorMsg),
                    });
                    detected = detectImageFormatFromBuffer(imageBuffer);
                    normalizedExt = detected.slice(6) // Remove 'image/' prefix
                    ;
                    base64Size = Math.ceil((originalSize * 4) / 3);
                    overDim = imageBuffer.length >= 24 &&
                        imageBuffer[0] === 0x89 &&
                        imageBuffer[1] === 0x50 &&
                        imageBuffer[2] === 0x4e &&
                        imageBuffer[3] === 0x47 &&
                        (imageBuffer.readUInt32BE(16) > apiLimits_js_1.IMAGE_MAX_WIDTH ||
                            imageBuffer.readUInt32BE(20) > apiLimits_js_1.IMAGE_MAX_HEIGHT);
                    // If original image's base64 encoding is within API limit, allow it through uncompressed
                    if (base64Size <= apiLimits_js_1.API_IMAGE_MAX_BASE64_SIZE && !overDim) {
                        (0, index_js_1.logEvent)('tengu_image_resize_fallback', {
                            original_size_bytes: originalSize,
                            base64_size_bytes: base64Size,
                            error_type: errorType,
                        });
                        return [2 /*return*/, { buffer: imageBuffer, mediaType: normalizedExt }];
                    }
                    // Image is too large and we failed to compress it - fail with user-friendly error
                    throw new ImageResizeError(overDim
                        ? "Unable to resize image \u2014 dimensions exceed the ".concat(apiLimits_js_1.IMAGE_MAX_WIDTH, "x").concat(apiLimits_js_1.IMAGE_MAX_HEIGHT, "px limit and image processing failed. ") +
                            "Please resize the image to reduce its pixel dimensions."
                        : "Unable to resize image (".concat((0, format_js_1.formatFileSize)(originalSize), " raw, ").concat((0, format_js_1.formatFileSize)(base64Size), " base64). ") +
                            "The image exceeds the 5MB API limit and compression failed. " +
                            "Please resize the image manually or use a smaller image.");
                case 23: return [2 /*return*/];
            }
        });
    });
}
/**
 * Resizes an image content block if needed
 * Takes an image ImageBlockParam and returns a resized version if necessary
 * Also returns dimension information for coordinate mapping
 */
function maybeResizeAndDownsampleImageBlock(imageBlock) {
    return __awaiter(this, void 0, void 0, function () {
        var imageBuffer, originalSize, mediaType, ext, resized;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Only process base64 images
                    if (imageBlock.source.type !== 'base64') {
                        return [2 /*return*/, { block: imageBlock }];
                    }
                    imageBuffer = Buffer.from(imageBlock.source.data, 'base64');
                    originalSize = imageBuffer.length;
                    mediaType = imageBlock.source.media_type;
                    ext = (mediaType === null || mediaType === void 0 ? void 0 : mediaType.split('/')[1]) || 'png';
                    return [4 /*yield*/, maybeResizeAndDownsampleImageBuffer(imageBuffer, originalSize, ext)
                        // Return resized image block with dimension info
                    ];
                case 1:
                    resized = _a.sent();
                    // Return resized image block with dimension info
                    return [2 /*return*/, {
                            block: {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: "image/".concat(resized.mediaType),
                                    data: resized.buffer.toString('base64'),
                                },
                            },
                            dimensions: resized.dimensions,
                        }];
            }
        });
    });
}
/**
 * Compresses an image buffer to fit within a maximum byte size.
 *
 * Uses a multi-strategy fallback approach because simple compression often fails for
 * large screenshots, high-resolution photos, or images with complex gradients. Each
 * strategy is progressively more aggressive to handle edge cases where earlier
 * strategies produce files still exceeding the size limit.
 *
 * Strategy (from FileReadTool):
 * 1. Try to preserve original format (PNG, JPEG, WebP) with progressive resizing
 * 2. For PNG: Use palette optimization and color reduction if needed
 * 3. Last resort: Convert to JPEG with aggressive compression
 *
 * This ensures images fit within context windows while maintaining format when possible.
 */
function compressImageBuffer(imageBuffer_1) {
    return __awaiter(this, arguments, void 0, function (imageBuffer, maxBytes, originalMediaType) {
        var fallbackFormat, normalizedFallback, sharp, metadata, format, originalSize, context, resizedResult, palettizedResult, jpegResult, error_2, errorType, errorMsg, detected;
        if (maxBytes === void 0) { maxBytes = apiLimits_js_1.IMAGE_TARGET_RAW_SIZE; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fallbackFormat = (originalMediaType === null || originalMediaType === void 0 ? void 0 : originalMediaType.split('/')[1]) || 'jpeg';
                    normalizedFallback = fallbackFormat === 'jpg' ? 'jpeg' : fallbackFormat;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, (0, imageProcessor_js_1.getImageProcessor)()];
                case 2:
                    sharp = _a.sent();
                    return [4 /*yield*/, sharp(imageBuffer).metadata()];
                case 3:
                    metadata = _a.sent();
                    format = metadata.format || normalizedFallback;
                    originalSize = imageBuffer.length;
                    context = {
                        imageBuffer: imageBuffer,
                        metadata: metadata,
                        format: format,
                        maxBytes: maxBytes,
                        originalSize: originalSize,
                    };
                    // If image is already within size limit, return as-is without processing
                    if (originalSize <= maxBytes) {
                        return [2 /*return*/, createCompressedImageResult(imageBuffer, format, originalSize)];
                    }
                    return [4 /*yield*/, tryProgressiveResizing(context, sharp)];
                case 4:
                    resizedResult = _a.sent();
                    if (resizedResult) {
                        return [2 /*return*/, resizedResult];
                    }
                    if (!(format === 'png')) return [3 /*break*/, 6];
                    return [4 /*yield*/, tryPalettePNG(context, sharp)];
                case 5:
                    palettizedResult = _a.sent();
                    if (palettizedResult) {
                        return [2 /*return*/, palettizedResult];
                    }
                    _a.label = 6;
                case 6: return [4 /*yield*/, tryJPEGConversion(context, 50, sharp)];
                case 7:
                    jpegResult = _a.sent();
                    if (jpegResult) {
                        return [2 /*return*/, jpegResult];
                    }
                    return [4 /*yield*/, createUltraCompressedJPEG(context, sharp)];
                case 8: 
                // Last resort: ultra-compressed JPEG
                return [2 /*return*/, _a.sent()];
                case 9:
                    error_2 = _a.sent();
                    // Log the error and emit analytics event
                    (0, log_js_1.logError)(error_2);
                    errorType = classifyImageError(error_2);
                    errorMsg = (0, errors_js_1.errorMessage)(error_2);
                    (0, index_js_1.logEvent)('tengu_image_compress_failed', {
                        original_size_bytes: imageBuffer.length,
                        max_bytes: maxBytes,
                        error_type: errorType,
                        error_message_hash: hashString(errorMsg),
                    });
                    // If original image is within the requested limit, allow it through
                    if (imageBuffer.length <= maxBytes) {
                        detected = detectImageFormatFromBuffer(imageBuffer);
                        return [2 /*return*/, {
                                base64: imageBuffer.toString('base64'),
                                mediaType: detected,
                                originalSize: imageBuffer.length,
                            }];
                    }
                    // Image is too large and compression failed - throw error
                    throw new ImageResizeError("Unable to compress image (".concat((0, format_js_1.formatFileSize)(imageBuffer.length), ") to fit within ").concat((0, format_js_1.formatFileSize)(maxBytes), ". ") +
                        "Please use a smaller image.");
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Compresses an image buffer to fit within a token limit.
 * Converts tokens to bytes using the formula: maxBytes = (maxTokens / 0.125) * 0.75
 */
function compressImageBufferWithTokenLimit(imageBuffer, maxTokens, originalMediaType) {
    return __awaiter(this, void 0, void 0, function () {
        var maxBase64Chars, maxBytes;
        return __generator(this, function (_a) {
            maxBase64Chars = Math.floor(maxTokens / 0.125);
            maxBytes = Math.floor(maxBase64Chars * 0.75);
            return [2 /*return*/, compressImageBuffer(imageBuffer, maxBytes, originalMediaType)];
        });
    });
}
/**
 * Compresses an image block to fit within a maximum byte size.
 * Wrapper around compressImageBuffer for ImageBlockParam.
 */
function compressImageBlock(imageBlock_1) {
    return __awaiter(this, arguments, void 0, function (imageBlock, maxBytes) {
        var imageBuffer, compressed;
        if (maxBytes === void 0) { maxBytes = apiLimits_js_1.IMAGE_TARGET_RAW_SIZE; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Only process base64 images
                    if (imageBlock.source.type !== 'base64') {
                        return [2 /*return*/, imageBlock];
                    }
                    imageBuffer = Buffer.from(imageBlock.source.data, 'base64');
                    // Check if already within size limit
                    if (imageBuffer.length <= maxBytes) {
                        return [2 /*return*/, imageBlock];
                    }
                    return [4 /*yield*/, compressImageBuffer(imageBuffer, maxBytes)];
                case 1:
                    compressed = _a.sent();
                    return [2 /*return*/, {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: compressed.mediaType,
                                data: compressed.base64,
                            },
                        }];
            }
        });
    });
}
// Helper functions for compression pipeline
function createCompressedImageResult(buffer, mediaType, originalSize) {
    var normalizedMediaType = mediaType === 'jpg' ? 'jpeg' : mediaType;
    return {
        base64: buffer.toString('base64'),
        mediaType: "image/".concat(normalizedMediaType),
        originalSize: originalSize,
    };
}
function tryProgressiveResizing(context, sharp) {
    return __awaiter(this, void 0, void 0, function () {
        var scalingFactors, _i, scalingFactors_1, scalingFactor, newWidth, newHeight, resizedImage, resizedBuffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    scalingFactors = [1.0, 0.75, 0.5, 0.25];
                    _i = 0, scalingFactors_1 = scalingFactors;
                    _a.label = 1;
                case 1:
                    if (!(_i < scalingFactors_1.length)) return [3 /*break*/, 4];
                    scalingFactor = scalingFactors_1[_i];
                    newWidth = Math.round((context.metadata.width || 2000) * scalingFactor);
                    newHeight = Math.round((context.metadata.height || 2000) * scalingFactor);
                    resizedImage = sharp(context.imageBuffer).resize(newWidth, newHeight, {
                        fit: 'inside',
                        withoutEnlargement: true,
                    });
                    // Apply format-specific optimizations
                    resizedImage = applyFormatOptimizations(resizedImage, context.format);
                    return [4 /*yield*/, resizedImage.toBuffer()];
                case 2:
                    resizedBuffer = _a.sent();
                    if (resizedBuffer.length <= context.maxBytes) {
                        return [2 /*return*/, createCompressedImageResult(resizedBuffer, context.format, context.originalSize)];
                    }
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, null];
            }
        });
    });
}
function applyFormatOptimizations(image, format) {
    switch (format) {
        case 'png':
            return image.png({
                compressionLevel: 9,
                palette: true,
            });
        case 'jpeg':
        case 'jpg':
            return image.jpeg({ quality: 80 });
        case 'webp':
            return image.webp({ quality: 80 });
        default:
            return image;
    }
}
function tryPalettePNG(context, sharp) {
    return __awaiter(this, void 0, void 0, function () {
        var palettePng;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sharp(context.imageBuffer)
                        .resize(800, 800, {
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                        .png({
                        compressionLevel: 9,
                        palette: true,
                        colors: 64, // Reduce colors to 64 for better compression
                    })
                        .toBuffer()];
                case 1:
                    palettePng = _a.sent();
                    if (palettePng.length <= context.maxBytes) {
                        return [2 /*return*/, createCompressedImageResult(palettePng, 'png', context.originalSize)];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
function tryJPEGConversion(context, quality, sharp) {
    return __awaiter(this, void 0, void 0, function () {
        var jpegBuffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sharp(context.imageBuffer)
                        .resize(600, 600, {
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                        .jpeg({ quality: quality })
                        .toBuffer()];
                case 1:
                    jpegBuffer = _a.sent();
                    if (jpegBuffer.length <= context.maxBytes) {
                        return [2 /*return*/, createCompressedImageResult(jpegBuffer, 'jpeg', context.originalSize)];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
function createUltraCompressedJPEG(context, sharp) {
    return __awaiter(this, void 0, void 0, function () {
        var ultraCompressedBuffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sharp(context.imageBuffer)
                        .resize(400, 400, {
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                        .jpeg({ quality: 20 })
                        .toBuffer()];
                case 1:
                    ultraCompressedBuffer = _a.sent();
                    return [2 /*return*/, createCompressedImageResult(ultraCompressedBuffer, 'jpeg', context.originalSize)];
            }
        });
    });
}
/**
 * Detect image format from a buffer using magic bytes
 * @param buffer Buffer containing image data
 * @returns Media type string (e.g., 'image/png', 'image/jpeg') or 'image/png' as default
 */
function detectImageFormatFromBuffer(buffer) {
    if (buffer.length < 4)
        return 'image/png'; // default
    // Check PNG signature
    if (buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47) {
        return 'image/png';
    }
    // Check JPEG signature (FFD8FF)
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'image/jpeg';
    }
    // Check GIF signature (GIF87a or GIF89a)
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        return 'image/gif';
    }
    // Check WebP signature (RIFF....WEBP)
    if (buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46) {
        if (buffer.length >= 12 &&
            buffer[8] === 0x57 &&
            buffer[9] === 0x45 &&
            buffer[10] === 0x42 &&
            buffer[11] === 0x50) {
            return 'image/webp';
        }
    }
    // Default to PNG if unknown
    return 'image/png';
}
/**
 * Detect image format from base64 data using magic bytes
 * @param base64Data Base64 encoded image data
 * @returns Media type string (e.g., 'image/png', 'image/jpeg') or 'image/png' as default
 */
function detectImageFormatFromBase64(base64Data) {
    try {
        var buffer = Buffer.from(base64Data, 'base64');
        return detectImageFormatFromBuffer(buffer);
    }
    catch (_a) {
        // Default to PNG on any error
        return 'image/png';
    }
}
/**
 * Creates a text description of image metadata including dimensions and source path.
 * Returns null if no useful metadata is available.
 */
function createImageMetadataText(dims, sourcePath) {
    var originalWidth = dims.originalWidth, originalHeight = dims.originalHeight, displayWidth = dims.displayWidth, displayHeight = dims.displayHeight;
    // Skip if dimensions are not available or invalid
    // Note: checks for undefined/null and zero to prevent division by zero
    if (!originalWidth ||
        !originalHeight ||
        !displayWidth ||
        !displayHeight ||
        displayWidth <= 0 ||
        displayHeight <= 0) {
        // If we have a source path but no valid dimensions, still return source info
        if (sourcePath) {
            return "[Image source: ".concat(sourcePath, "]");
        }
        return null;
    }
    // Check if image was resized
    var wasResized = originalWidth !== displayWidth || originalHeight !== displayHeight;
    // Only include metadata if there's useful info (resized or has source path)
    if (!wasResized && !sourcePath) {
        return null;
    }
    // Build metadata parts
    var parts = [];
    if (sourcePath) {
        parts.push("source: ".concat(sourcePath));
    }
    if (wasResized) {
        var scaleFactor = originalWidth / displayWidth;
        parts.push("original ".concat(originalWidth, "x").concat(originalHeight, ", displayed at ").concat(displayWidth, "x").concat(displayHeight, ". Multiply coordinates by ").concat(scaleFactor.toFixed(2), " to map to original image."));
    }
    return "[Image: ".concat(parts.join(', '), "]");
}
