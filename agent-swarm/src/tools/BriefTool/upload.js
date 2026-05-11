"use strict";
/**
 * Upload BriefTool attachments to private_api so web viewers can preview them.
 *
 * When the repl bridge is active, attachment paths are meaningless to a web
 * viewer (they're on Claude's machine). We upload to /api/oauth/file_upload —
 * the same store MessageComposer/SpaceMessage render from — and stash the
 * returned file_uuid alongside the path. Web resolves file_uuid → preview;
 * desktop/local try path first.
 *
 * Best-effort: any failure (no token, bridge off, network error, 4xx) logs
 * debug and returns undefined. The attachment still carries {path, size,
 * isImage}, so local-terminal and same-machine-desktop render unaffected.
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
exports.uploadBriefAttachment = uploadBriefAttachment;
var bun_bundle_1 = require("bun:bundle");
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var bridgeConfig_js_1 = require("../../bridge/bridgeConfig.js");
var oauth_js_1 = require("../../constants/oauth.js");
var debug_js_1 = require("../../utils/debug.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
// Matches the private_api backend limit
var MAX_UPLOAD_BYTES = 30 * 1024 * 1024;
var UPLOAD_TIMEOUT_MS = 30000;
// Backend dispatches on mime: image/* → upload_image_wrapped (writes
// PREVIEW/THUMBNAIL, no ORIGINAL), everything else → upload_generic_file
// (ORIGINAL only, no preview). Only whitelist raster formats the
// transcoder reliably handles — svg/bmp/ico risk a 400, and pdf routes
// to upload_pdf_file_wrapped which also skips ORIGINAL. Dispatch
// viewers use /preview for images and /contents for everything else,
// so images go image/* and the rest go octet-stream.
var MIME_BY_EXT = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
};
function guessMimeType(filename) {
    var _a;
    var ext = (0, path_1.extname)(filename).toLowerCase();
    return (_a = MIME_BY_EXT[ext]) !== null && _a !== void 0 ? _a : 'application/octet-stream';
}
function debug(msg) {
    (0, debug_js_1.logForDebugging)("[brief:upload] ".concat(msg));
}
/**
 * Base URL for uploads. Must match the host the token is valid for.
 *
 * Subprocess hosts (cowork) pass ANTHROPIC_BASE_URL alongside
 * CLAUDE_CODE_OAUTH_TOKEN — prefer that since getOauthConfig() only
 * returns staging when USE_STAGING_OAUTH is set, which such hosts don't
 * set. Without this a staging token hits api.anthropic.com → 401 → silent
 * skip → web viewer sees inert cards with no file_uuid.
 */
function getBridgeBaseUrl() {
    var _a, _b;
    return ((_b = (_a = (0, bridgeConfig_js_1.getBridgeBaseUrlOverride)()) !== null && _a !== void 0 ? _a : process.env.ANTHROPIC_BASE_URL) !== null && _b !== void 0 ? _b : (0, oauth_js_1.getOauthConfig)().BASE_API_URL);
}
// /api/oauth/file_upload returns one of ChatMessage{Image,Blob,Document}FileSchema.
// All share file_uuid; that's the only field we need.
var uploadResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({ file_uuid: v4_1.z.string() });
});
/**
 * Upload a single attachment. Returns file_uuid on success, undefined otherwise.
 * Every early-return is intentional graceful degradation.
 */
function uploadBriefAttachment(fullPath, size, ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var token, content, e_1, baseUrl, url, filename, mimeType, boundary, body, response, parsed, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(0, bun_bundle_1.feature)('BRIDGE_MODE')) return [3 /*break*/, 8];
                    if (!ctx.replBridgeEnabled)
                        return [2 /*return*/, undefined];
                    if (size > MAX_UPLOAD_BYTES) {
                        debug("skip ".concat(fullPath, ": ").concat(size, " bytes exceeds ").concat(MAX_UPLOAD_BYTES, " limit"));
                        return [2 /*return*/, undefined];
                    }
                    token = (0, bridgeConfig_js_1.getBridgeAccessToken)();
                    if (!token) {
                        debug('skip: no oauth token');
                        return [2 /*return*/, undefined];
                    }
                    content = void 0;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(fullPath)];
                case 2:
                    content = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    debug("read failed for ".concat(fullPath, ": ").concat(e_1));
                    return [2 /*return*/, undefined];
                case 4:
                    baseUrl = getBridgeBaseUrl();
                    url = "".concat(baseUrl, "/api/oauth/file_upload");
                    filename = (0, path_1.basename)(fullPath);
                    mimeType = guessMimeType(filename);
                    boundary = "----FormBoundary".concat((0, crypto_1.randomUUID)());
                    body = Buffer.concat([
                        Buffer.from("--".concat(boundary, "\r\n") +
                            "Content-Disposition: form-data; name=\"file\"; filename=\"".concat(filename, "\"\r\n") +
                            "Content-Type: ".concat(mimeType, "\r\n\r\n")),
                        content,
                        Buffer.from("\r\n--".concat(boundary, "--\r\n")),
                    ]);
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, axios_1.default.post(url, body, {
                            headers: {
                                Authorization: "Bearer ".concat(token),
                                'Content-Type': "multipart/form-data; boundary=".concat(boundary),
                                'Content-Length': body.length.toString(),
                            },
                            timeout: UPLOAD_TIMEOUT_MS,
                            signal: ctx.signal,
                            validateStatus: function () { return true; },
                        })];
                case 6:
                    response = _a.sent();
                    if (response.status !== 201) {
                        debug("upload failed for ".concat(fullPath, ": status=").concat(response.status, " body=").concat((0, slowOperations_js_1.jsonStringify)(response.data).slice(0, 200)));
                        return [2 /*return*/, undefined];
                    }
                    parsed = uploadResponseSchema().safeParse(response.data);
                    if (!parsed.success) {
                        debug("unexpected response shape for ".concat(fullPath, ": ").concat(parsed.error.message));
                        return [2 /*return*/, undefined];
                    }
                    debug("uploaded ".concat(fullPath, " \u2192 ").concat(parsed.data.file_uuid, " (").concat(size, " bytes)"));
                    return [2 /*return*/, parsed.data.file_uuid];
                case 7:
                    e_2 = _a.sent();
                    debug("upload threw for ".concat(fullPath, ": ").concat(e_2));
                    return [2 /*return*/, undefined];
                case 8: return [2 /*return*/, undefined];
            }
        });
    });
}
