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
exports.cacheImagePath = cacheImagePath;
exports.storeImage = storeImage;
exports.storeImages = storeImages;
exports.getStoredImagePath = getStoredImagePath;
exports.clearStoredImagePaths = clearStoredImagePaths;
exports.cleanupOldImageCaches = cleanupOldImageCaches;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var fsOperations_js_1 = require("./fsOperations.js");
var IMAGE_STORE_DIR = 'image-cache';
var MAX_STORED_IMAGE_PATHS = 200;
// In-memory cache of stored image paths
var storedImagePaths = new Map();
/**
 * Get the image store directory for the current session.
 */
function getImageStoreDir() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), IMAGE_STORE_DIR, (0, state_js_1.getSessionId)());
}
/**
 * Ensure the image store directory exists.
 */
function ensureImageStoreDir() {
    return __awaiter(this, void 0, void 0, function () {
        var dir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dir = getImageStoreDir();
                    return [4 /*yield*/, (0, promises_1.mkdir)(dir, { recursive: true })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the file path for an image by ID.
 */
function getImagePath(imageId, mediaType) {
    var extension = mediaType.split('/')[1] || 'png';
    return (0, path_1.join)(getImageStoreDir(), "".concat(imageId, ".").concat(extension));
}
/**
 * Cache the image path immediately (fast, no file I/O).
 */
function cacheImagePath(content) {
    if (content.type !== 'image') {
        return null;
    }
    var imagePath = getImagePath(content.id, content.mediaType || 'image/png');
    evictOldestIfAtCap();
    storedImagePaths.set(content.id, imagePath);
    return imagePath;
}
/**
 * Store an image from pastedContents to disk.
 */
function storeImage(content) {
    return __awaiter(this, void 0, void 0, function () {
        var imagePath, fh, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (content.type !== 'image') {
                        return [2 /*return*/, null];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, ensureImageStoreDir()];
                case 2:
                    _a.sent();
                    imagePath = getImagePath(content.id, content.mediaType || 'image/png');
                    return [4 /*yield*/, (0, promises_1.open)(imagePath, 'w', 384)];
                case 3:
                    fh = _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, , 7, 9]);
                    return [4 /*yield*/, fh.writeFile(content.content, { encoding: 'base64' })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, fh.datasync()];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, fh.close()];
                case 8:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 9:
                    evictOldestIfAtCap();
                    storedImagePaths.set(content.id, imagePath);
                    (0, debug_js_1.logForDebugging)("Stored image ".concat(content.id, " to ").concat(imagePath));
                    return [2 /*return*/, imagePath];
                case 10:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to store image: ".concat(error_1));
                    return [2 /*return*/, null];
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Store all images from pastedContents to disk.
 */
function storeImages(pastedContents) {
    return __awaiter(this, void 0, void 0, function () {
        var pathMap, _i, _a, _b, id, content, path;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    pathMap = new Map();
                    _i = 0, _a = Object.entries(pastedContents);
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    _b = _a[_i], id = _b[0], content = _b[1];
                    if (!(content.type === 'image')) return [3 /*break*/, 3];
                    return [4 /*yield*/, storeImage(content)];
                case 2:
                    path = _c.sent();
                    if (path) {
                        pathMap.set(Number(id), path);
                    }
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, pathMap];
            }
        });
    });
}
/**
 * Get the file path for a stored image by ID.
 */
function getStoredImagePath(imageId) {
    var _a;
    return (_a = storedImagePaths.get(imageId)) !== null && _a !== void 0 ? _a : null;
}
/**
 * Clear the in-memory cache of stored image paths.
 */
function clearStoredImagePaths() {
    storedImagePaths.clear();
}
function evictOldestIfAtCap() {
    while (storedImagePaths.size >= MAX_STORED_IMAGE_PATHS) {
        var oldest = storedImagePaths.keys().next().value;
        if (oldest !== undefined) {
            storedImagePaths.delete(oldest);
        }
        else {
            break;
        }
    }
}
/**
 * Clean up old image cache directories from previous sessions.
 */
function cleanupOldImageCaches() {
    return __awaiter(this, void 0, void 0, function () {
        var fsImpl, baseDir, currentSessionId, sessionDirs, _a, _i, sessionDirs_1, sessionDir, sessionPath, _b, remaining, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    fsImpl = (0, fsOperations_js_1.getFsImplementation)();
                    baseDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), IMAGE_STORE_DIR);
                    currentSessionId = (0, state_js_1.getSessionId)();
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 17, , 18]);
                    sessionDirs = void 0;
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fsImpl.readdir(baseDir)];
                case 3:
                    sessionDirs = _e.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _e.sent();
                    return [2 /*return*/];
                case 5:
                    _i = 0, sessionDirs_1 = sessionDirs;
                    _e.label = 6;
                case 6:
                    if (!(_i < sessionDirs_1.length)) return [3 /*break*/, 11];
                    sessionDir = sessionDirs_1[_i];
                    if (sessionDir.name === currentSessionId) {
                        return [3 /*break*/, 10];
                    }
                    sessionPath = (0, path_1.join)(baseDir, sessionDir.name);
                    _e.label = 7;
                case 7:
                    _e.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, fsImpl.rm(sessionPath, { recursive: true, force: true })];
                case 8:
                    _e.sent();
                    (0, debug_js_1.logForDebugging)("Cleaned up old image cache: ".concat(sessionPath));
                    return [3 /*break*/, 10];
                case 9:
                    _b = _e.sent();
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 6];
                case 11:
                    _e.trys.push([11, 15, , 16]);
                    return [4 /*yield*/, fsImpl.readdir(baseDir)];
                case 12:
                    remaining = _e.sent();
                    if (!(remaining.length === 0)) return [3 /*break*/, 14];
                    return [4 /*yield*/, fsImpl.rmdir(baseDir)];
                case 13:
                    _e.sent();
                    _e.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    _c = _e.sent();
                    return [3 /*break*/, 16];
                case 16: return [3 /*break*/, 18];
                case 17:
                    _d = _e.sent();
                    return [3 /*break*/, 18];
                case 18: return [2 /*return*/];
            }
        });
    });
}
