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
exports.IMAGE_EXTENSION_REGEX = exports.PASTE_THRESHOLD = void 0;
exports.hasImageInClipboard = hasImageInClipboard;
exports.getImageFromClipboard = getImageFromClipboard;
exports.getImagePathFromClipboard = getImagePathFromClipboard;
exports.isImageFilePath = isImageFilePath;
exports.asImageFilePath = asImageFilePath;
exports.tryReadImageFromPath = tryReadImageFromPath;
var bun_bundle_1 = require("bun:bundle");
var crypto_1 = require("crypto");
var execa_1 = require("execa");
var path_1 = require("path");
var apiLimits_js_1 = require("../constants/apiLimits.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var imageProcessor_js_1 = require("../tools/FileReadTool/imageProcessor.js");
var debug_js_1 = require("./debug.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var fsOperations_js_1 = require("./fsOperations.js");
var imageResizer_js_1 = require("./imageResizer.js");
var log_js_1 = require("./log.js");
// Threshold in characters for when to consider text a "large paste"
exports.PASTE_THRESHOLD = 800;
function getClipboardCommands() {
    var platform = process.platform;
    // Platform-specific temporary file paths
    // Use CLAUDE_CODE_TMPDIR if set, otherwise fall back to platform defaults
    var baseTmpDir = process.env.CLAUDE_CODE_TMPDIR ||
        (platform === 'win32' ? process.env.TEMP || 'C:\\Temp' : '/tmp');
    var screenshotFilename = 'claude_cli_latest_screenshot.png';
    var tempPaths = {
        darwin: (0, path_1.join)(baseTmpDir, screenshotFilename),
        linux: (0, path_1.join)(baseTmpDir, screenshotFilename),
        win32: (0, path_1.join)(baseTmpDir, screenshotFilename),
    };
    var screenshotPath = tempPaths[platform] || tempPaths.linux;
    // Platform-specific clipboard commands
    var commands = {
        darwin: {
            checkImage: "osascript -e 'the clipboard as \u00ABclass PNGf\u00BB'",
            saveImage: "osascript -e 'set png_data to (the clipboard as \u00ABclass PNGf\u00BB)' -e 'set fp to open for access POSIX file \"".concat(screenshotPath, "\" with write permission' -e 'write png_data to fp' -e 'close access fp'"),
            getPath: "osascript -e 'get POSIX path of (the clipboard as \u00ABclass furl\u00BB)'",
            deleteFile: "rm -f \"".concat(screenshotPath, "\""),
        },
        linux: {
            checkImage: 'xclip -selection clipboard -t TARGETS -o 2>/dev/null | grep -E "image/(png|jpeg|jpg|gif|webp|bmp)" || wl-paste -l 2>/dev/null | grep -E "image/(png|jpeg|jpg|gif|webp|bmp)"',
            saveImage: "xclip -selection clipboard -t image/png -o > \"".concat(screenshotPath, "\" 2>/dev/null || wl-paste --type image/png > \"").concat(screenshotPath, "\" 2>/dev/null || xclip -selection clipboard -t image/bmp -o > \"").concat(screenshotPath, "\" 2>/dev/null || wl-paste --type image/bmp > \"").concat(screenshotPath, "\""),
            getPath: 'xclip -selection clipboard -t text/plain -o 2>/dev/null || wl-paste 2>/dev/null',
            deleteFile: "rm -f \"".concat(screenshotPath, "\""),
        },
        win32: {
            checkImage: 'powershell -NoProfile -Command "(Get-Clipboard -Format Image) -ne $null"',
            saveImage: "powershell -NoProfile -Command \"$img = Get-Clipboard -Format Image; if ($img) { $img.Save('".concat(screenshotPath.replace(/\\/g, '\\\\'), "', [System.Drawing.Imaging.ImageFormat]::Png) }\""),
            getPath: 'powershell -NoProfile -Command "Get-Clipboard"',
            deleteFile: "del /f \"".concat(screenshotPath, "\""),
        },
    };
    return {
        commands: commands[platform] || commands.linux,
        screenshotPath: screenshotPath,
    };
}
/**
 * Check if clipboard contains an image without retrieving it.
 */
function hasImageInClipboard() {
    return __awaiter(this, void 0, void 0, function () {
        var getNativeModule, hasImage, e_1, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (process.platform !== 'darwin') {
                        return [2 /*return*/, false];
                    }
                    if (!((0, bun_bundle_1.feature)('NATIVE_CLIPBOARD_IMAGE') &&
                        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_collage_kaleidoscope', true))) return [3 /*break*/, 4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('image-processor-napi'); })];
                case 2:
                    getNativeModule = (_b.sent()).getNativeModule;
                    hasImage = (_a = getNativeModule()) === null || _a === void 0 ? void 0 : _a.hasClipboardImage;
                    if (hasImage) {
                        return [2 /*return*/, hasImage()];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    (0, log_js_1.logError)(e_1);
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('osascript', [
                        '-e',
                        'the clipboard as «class PNGf»',
                    ])];
                case 5:
                    result = _b.sent();
                    return [2 /*return*/, result.code === 0];
            }
        });
    });
}
function getImageFromClipboard() {
    return __awaiter(this, void 0, void 0, function () {
        var getNativeModule, readClipboard, native, buffer, resized, e_2, _a, commands, screenshotPath, checkResult, saveResult, imageBuffer, sharp, resized, base64Image, mediaType, _b;
        var _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (!((0, bun_bundle_1.feature)('NATIVE_CLIPBOARD_IMAGE') &&
                        process.platform === 'darwin' &&
                        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_collage_kaleidoscope', true))) return [3 /*break*/, 6];
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('image-processor-napi'); })];
                case 2:
                    getNativeModule = (_h.sent()).getNativeModule;
                    readClipboard = (_c = getNativeModule()) === null || _c === void 0 ? void 0 : _c.readClipboardImage;
                    if (!readClipboard) {
                        throw new Error('native clipboard reader unavailable');
                    }
                    native = readClipboard(apiLimits_js_1.IMAGE_MAX_WIDTH, apiLimits_js_1.IMAGE_MAX_HEIGHT);
                    if (!native) {
                        return [2 /*return*/, null];
                    }
                    buffer = native.png;
                    if (!(buffer.length > apiLimits_js_1.IMAGE_TARGET_RAW_SIZE)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, imageResizer_js_1.maybeResizeAndDownsampleImageBuffer)(buffer, buffer.length, 'png')];
                case 3:
                    resized = _h.sent();
                    return [2 /*return*/, {
                            base64: resized.buffer.toString('base64'),
                            mediaType: "image/".concat(resized.mediaType),
                            // resized.dimensions sees the already-downsampled buffer; native knows the true originals.
                            dimensions: {
                                originalWidth: native.originalWidth,
                                originalHeight: native.originalHeight,
                                displayWidth: (_e = (_d = resized.dimensions) === null || _d === void 0 ? void 0 : _d.displayWidth) !== null && _e !== void 0 ? _e : native.width,
                                displayHeight: (_g = (_f = resized.dimensions) === null || _f === void 0 ? void 0 : _f.displayHeight) !== null && _g !== void 0 ? _g : native.height,
                            },
                        }];
                case 4: return [2 /*return*/, {
                        base64: buffer.toString('base64'),
                        mediaType: 'image/png',
                        dimensions: {
                            originalWidth: native.originalWidth,
                            originalHeight: native.originalHeight,
                            displayWidth: native.width,
                            displayHeight: native.height,
                        },
                    }];
                case 5:
                    e_2 = _h.sent();
                    (0, log_js_1.logError)(e_2);
                    return [3 /*break*/, 6];
                case 6:
                    _a = getClipboardCommands(), commands = _a.commands, screenshotPath = _a.screenshotPath;
                    _h.label = 7;
                case 7:
                    _h.trys.push([7, 14, , 15]);
                    return [4 /*yield*/, (0, execa_1.execa)(commands.checkImage, {
                            shell: true,
                            reject: false,
                        })];
                case 8:
                    checkResult = _h.sent();
                    if (checkResult.exitCode !== 0) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, execa_1.execa)(commands.saveImage, {
                            shell: true,
                            reject: false,
                        })];
                case 9:
                    saveResult = _h.sent();
                    if (saveResult.exitCode !== 0) {
                        return [2 /*return*/, null];
                    }
                    imageBuffer = (0, fsOperations_js_1.getFsImplementation)().readFileBytesSync(screenshotPath);
                    if (!(imageBuffer.length >= 2 &&
                        imageBuffer[0] === 0x42 &&
                        imageBuffer[1] === 0x4d)) return [3 /*break*/, 12];
                    return [4 /*yield*/, (0, imageProcessor_js_1.getImageProcessor)()];
                case 10:
                    sharp = _h.sent();
                    return [4 /*yield*/, sharp(imageBuffer).png().toBuffer()];
                case 11:
                    imageBuffer = _h.sent();
                    _h.label = 12;
                case 12: return [4 /*yield*/, (0, imageResizer_js_1.maybeResizeAndDownsampleImageBuffer)(imageBuffer, imageBuffer.length, 'png')];
                case 13:
                    resized = _h.sent();
                    base64Image = resized.buffer.toString('base64');
                    mediaType = (0, imageResizer_js_1.detectImageFormatFromBase64)(base64Image);
                    // Cleanup (fire-and-forget, don't await)
                    void (0, execa_1.execa)(commands.deleteFile, { shell: true, reject: false });
                    return [2 /*return*/, {
                            base64: base64Image,
                            mediaType: mediaType,
                            dimensions: resized.dimensions,
                        }];
                case 14:
                    _b = _h.sent();
                    return [2 /*return*/, null];
                case 15: return [2 /*return*/];
            }
        });
    });
}
function getImagePathFromClipboard() {
    return __awaiter(this, void 0, void 0, function () {
        var commands, result, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    commands = getClipboardCommands().commands;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, execa_1.execa)(commands.getPath, {
                            shell: true,
                            reject: false,
                        })];
                case 2:
                    result = _a.sent();
                    if (result.exitCode !== 0 || !result.stdout) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, result.stdout.trim()];
                case 3:
                    e_3 = _a.sent();
                    (0, log_js_1.logError)(e_3);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Regex pattern to match supported image file extensions. Kept in sync with
 * MIME_BY_EXT in BriefTool/upload.ts — attachments.ts uses this to set isImage
 * on the wire, and remote viewers fetch /preview iff isImage is true. An ext
 * here but not in MIME_BY_EXT (e.g. bmp) uploads as octet-stream and has no
 * /preview variant → broken thumbnail.
 */
exports.IMAGE_EXTENSION_REGEX = /\.(png|jpe?g|gif|webp)$/i;
/**
 * Remove outer single or double quotes from a string
 * @param text Text to clean
 * @returns Text without outer quotes
 */
function removeOuterQuotes(text) {
    if ((text.startsWith('"') && text.endsWith('"')) ||
        (text.startsWith("'") && text.endsWith("'"))) {
        return text.slice(1, -1);
    }
    return text;
}
/**
 * Remove shell escape backslashes from a path (for macOS/Linux/WSL)
 * On Windows systems, this function returns the path unchanged
 * @param path Path that might contain shell-escaped characters
 * @returns Path with escape backslashes removed (on macOS/Linux/WSL only)
 */
function stripBackslashEscapes(path) {
    var platform = process.platform;
    // On Windows, don't remove backslashes as they're part of the path
    if (platform === 'win32') {
        return path;
    }
    // On macOS/Linux/WSL, handle shell-escaped paths
    // Double-backslashes (\\) represent actual backslashes in the filename
    // Single backslashes followed by special chars are shell escapes
    // First, temporarily replace double backslashes with a placeholder
    // Use random salt to prevent injection attacks where path contains literal placeholder
    var salt = (0, crypto_1.randomBytes)(8).toString('hex');
    var placeholder = "__DOUBLE_BACKSLASH_".concat(salt, "__");
    var withPlaceholder = path.replace(/\\\\/g, placeholder);
    // Remove single backslashes that are shell escapes
    // This handles cases like "name\ \(15\).png" -> "name (15).png"
    var withoutEscapes = withPlaceholder.replace(/\\(.)/g, '$1');
    // Replace placeholders back to single backslashes
    return withoutEscapes.replace(new RegExp(placeholder, 'g'), '\\');
}
/**
 * Check if a given text represents an image file path
 * @param text Text to check
 * @returns Boolean indicating if text is an image path
 */
function isImageFilePath(text) {
    var cleaned = removeOuterQuotes(text.trim());
    var unescaped = stripBackslashEscapes(cleaned);
    return exports.IMAGE_EXTENSION_REGEX.test(unescaped);
}
/**
 * Clean and normalize a text string that might be an image file path
 * @param text Text to process
 * @returns Cleaned text with quotes removed, whitespace trimmed, and shell escapes removed, or null if not an image path
 */
function asImageFilePath(text) {
    var cleaned = removeOuterQuotes(text.trim());
    var unescaped = stripBackslashEscapes(cleaned);
    if (exports.IMAGE_EXTENSION_REGEX.test(unescaped)) {
        return unescaped;
    }
    return null;
}
/**
 * Try to find and read an image file, falling back to clipboard search
 * @param text Pasted text that might be an image filename or path
 * @returns Object containing the image path and base64 data, or null if not found
 */
function tryReadImageFromPath(text) {
    return __awaiter(this, void 0, void 0, function () {
        var cleanedPath, imagePath, imageBuffer, clipboardPath, e_4, sharp, ext, resized, base64Image, mediaType;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cleanedPath = asImageFilePath(text);
                    if (!cleanedPath) {
                        return [2 /*return*/, null];
                    }
                    imagePath = cleanedPath;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    if (!(0, path_1.isAbsolute)(imagePath)) return [3 /*break*/, 2];
                    imageBuffer = (0, fsOperations_js_1.getFsImplementation)().readFileBytesSync(imagePath);
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, getImagePathFromClipboard()];
                case 3:
                    clipboardPath = _a.sent();
                    if (clipboardPath && imagePath === (0, path_1.basename)(clipboardPath)) {
                        imageBuffer = (0, fsOperations_js_1.getFsImplementation)().readFileBytesSync(clipboardPath);
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    e_4 = _a.sent();
                    (0, log_js_1.logError)(e_4);
                    return [2 /*return*/, null];
                case 6:
                    if (!imageBuffer) {
                        return [2 /*return*/, null];
                    }
                    if (imageBuffer.length === 0) {
                        (0, debug_js_1.logForDebugging)("Image file is empty: ".concat(imagePath), { level: 'warn' });
                        return [2 /*return*/, null];
                    }
                    if (!(imageBuffer.length >= 2 &&
                        imageBuffer[0] === 0x42 &&
                        imageBuffer[1] === 0x4d)) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, imageProcessor_js_1.getImageProcessor)()];
                case 7:
                    sharp = _a.sent();
                    return [4 /*yield*/, sharp(imageBuffer).png().toBuffer()];
                case 8:
                    imageBuffer = _a.sent();
                    _a.label = 9;
                case 9:
                    ext = (0, path_1.extname)(imagePath).slice(1).toLowerCase() || 'png';
                    return [4 /*yield*/, (0, imageResizer_js_1.maybeResizeAndDownsampleImageBuffer)(imageBuffer, imageBuffer.length, ext)];
                case 10:
                    resized = _a.sent();
                    base64Image = resized.buffer.toString('base64');
                    mediaType = (0, imageResizer_js_1.detectImageFormatFromBase64)(base64Image);
                    return [2 /*return*/, {
                            path: imagePath,
                            base64: base64Image,
                            mediaType: mediaType,
                            dimensions: resized.dimensions,
                        }];
            }
        });
    });
}
