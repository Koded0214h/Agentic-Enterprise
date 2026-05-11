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
exports.copyAnsiToClipboard = copyAnsiToClipboard;
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var ansiToPng_js_1 = require("./ansiToPng.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var log_js_1 = require("./log.js");
var platform_js_1 = require("./platform.js");
/**
 * Copies an image (from ANSI text) to the system clipboard.
 * Supports macOS, Linux (with xclip/xsel), and Windows.
 *
 * Pure-TS pipeline: ANSI text → bitmap-font render → PNG encode. No WASM,
 * no system fonts, so this works in every build (native and JS).
 */
function copyAnsiToClipboard(ansiText, options) {
    return __awaiter(this, void 0, void 0, function () {
        var tempDir, pngPath, pngBuffer, result, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    tempDir = (0, path_1.join)((0, os_1.tmpdir)(), 'claude-code-screenshots');
                    return [4 /*yield*/, (0, promises_1.mkdir)(tempDir, { recursive: true })];
                case 1:
                    _b.sent();
                    pngPath = (0, path_1.join)(tempDir, "screenshot-".concat(Date.now(), ".png"));
                    pngBuffer = (0, ansiToPng_js_1.ansiToPng)(ansiText, options);
                    return [4 /*yield*/, (0, promises_1.writeFile)(pngPath, pngBuffer)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, copyPngToClipboard(pngPath)];
                case 3:
                    result = _b.sent();
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, promises_1.unlink)(pngPath)];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _a = _b.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, result];
                case 8:
                    error_1 = _b.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, {
                            success: false,
                            message: "Failed to copy screenshot: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'),
                        }];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function copyPngToClipboard(pngPath) {
    return __awaiter(this, void 0, void 0, function () {
        var platform, escapedPath, script, result, xclipResult, xselResult, psScript, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    platform = (0, platform_js_1.getPlatform)();
                    if (!(platform === 'macos')) return [3 /*break*/, 2];
                    escapedPath = pngPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                    script = "set the clipboard to (read (POSIX file \"".concat(escapedPath, "\") as \u00ABclass PNGf\u00BB)");
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('osascript', ['-e', script], {
                            timeout: 5000,
                        })];
                case 1:
                    result = _a.sent();
                    if (result.code === 0) {
                        return [2 /*return*/, { success: true, message: 'Screenshot copied to clipboard' }];
                    }
                    return [2 /*return*/, {
                            success: false,
                            message: "Failed to copy to clipboard: ".concat(result.stderr),
                        }];
                case 2:
                    if (!(platform === 'linux')) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('xclip', ['-selection', 'clipboard', '-t', 'image/png', '-i', pngPath], { timeout: 5000 })];
                case 3:
                    xclipResult = _a.sent();
                    if (xclipResult.code === 0) {
                        return [2 /*return*/, { success: true, message: 'Screenshot copied to clipboard' }];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('xsel', ['--clipboard', '--input', '--type', 'image/png'], { timeout: 5000 })];
                case 4:
                    xselResult = _a.sent();
                    if (xselResult.code === 0) {
                        return [2 /*return*/, { success: true, message: 'Screenshot copied to clipboard' }];
                    }
                    return [2 /*return*/, {
                            success: false,
                            message: 'Failed to copy to clipboard. Please install xclip or xsel: sudo apt install xclip',
                        }];
                case 5:
                    if (!(platform === 'windows')) return [3 /*break*/, 7];
                    psScript = "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Clipboard]::SetImage([System.Drawing.Image]::FromFile('".concat(pngPath.replace(/'/g, "''"), "'))");
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('powershell', ['-NoProfile', '-Command', psScript], { timeout: 5000 })];
                case 6:
                    result = _a.sent();
                    if (result.code === 0) {
                        return [2 /*return*/, { success: true, message: 'Screenshot copied to clipboard' }];
                    }
                    return [2 /*return*/, {
                            success: false,
                            message: "Failed to copy to clipboard: ".concat(result.stderr),
                        }];
                case 7: return [2 /*return*/, {
                        success: false,
                        message: "Screenshot to clipboard is not supported on ".concat(platform),
                    }];
            }
        });
    });
}
