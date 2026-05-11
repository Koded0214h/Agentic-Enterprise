"use strict";
/**
 * Shared attachment validation + resolution for SendUserMessage and
 * SendUserFile. Lives in BriefTool/ so the dynamic `./upload.js` import
 * inside the feature('BRIDGE_MODE') guard stays relative and upload.ts
 * (axios, crypto, auth utils) remains tree-shakeable from non-bridge builds.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.validateAttachmentPaths = validateAttachmentPaths;
exports.resolveAttachments = resolveAttachments;
var bun_bundle_1 = require("bun:bundle");
var promises_1 = require("fs/promises");
var cwd_js_1 = require("../../utils/cwd.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var imagePaste_js_1 = require("../../utils/imagePaste.js");
var path_js_1 = require("../../utils/path.js");
function validateAttachmentPaths(rawPaths) {
    return __awaiter(this, void 0, void 0, function () {
        var cwd, _i, rawPaths_1, rawPath, fullPath, stats, e_1, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cwd = (0, cwd_js_1.getCwd)();
                    _i = 0, rawPaths_1 = rawPaths;
                    _a.label = 1;
                case 1:
                    if (!(_i < rawPaths_1.length)) return [3 /*break*/, 6];
                    rawPath = rawPaths_1[_i];
                    fullPath = (0, path_js_1.expandPath)(rawPath);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.stat)(fullPath)];
                case 3:
                    stats = _a.sent();
                    if (!stats.isFile()) {
                        return [2 /*return*/, {
                                result: false,
                                message: "Attachment \"".concat(rawPath, "\" is not a regular file."),
                                errorCode: 1,
                            }];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, {
                                result: false,
                                message: "Attachment \"".concat(rawPath, "\" does not exist. Current working directory: ").concat(cwd, "."),
                                errorCode: 1,
                            }];
                    }
                    if (code === 'EACCES' || code === 'EPERM') {
                        return [2 /*return*/, {
                                result: false,
                                message: "Attachment \"".concat(rawPath, "\" is not accessible (permission denied)."),
                                errorCode: 1,
                            }];
                    }
                    throw e_1;
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, { result: true }];
            }
        });
    });
}
function resolveAttachments(rawPaths, uploadCtx) {
    return __awaiter(this, void 0, void 0, function () {
        var stated, _i, rawPaths_2, rawPath, fullPath, stats, shouldUpload_1, uploadBriefAttachment_1, uuids_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stated = [];
                    _i = 0, rawPaths_2 = rawPaths;
                    _a.label = 1;
                case 1:
                    if (!(_i < rawPaths_2.length)) return [3 /*break*/, 4];
                    rawPath = rawPaths_2[_i];
                    fullPath = (0, path_js_1.expandPath)(rawPath);
                    return [4 /*yield*/, (0, promises_1.stat)(fullPath)];
                case 2:
                    stats = _a.sent();
                    stated.push({
                        path: fullPath,
                        size: stats.size,
                        isImage: imagePaste_js_1.IMAGE_EXTENSION_REGEX.test(fullPath),
                    });
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    if (!(0, bun_bundle_1.feature)('BRIDGE_MODE')) return [3 /*break*/, 7];
                    shouldUpload_1 = uploadCtx.replBridgeEnabled ||
                        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_BRIEF_UPLOAD);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./upload.js'); })];
                case 5:
                    uploadBriefAttachment_1 = (_a.sent()).uploadBriefAttachment;
                    return [4 /*yield*/, Promise.all(stated.map(function (a) {
                            return uploadBriefAttachment_1(a.path, a.size, {
                                replBridgeEnabled: shouldUpload_1,
                                signal: uploadCtx.signal,
                            });
                        }))];
                case 6:
                    uuids_1 = _a.sent();
                    return [2 /*return*/, stated.map(function (a, i) {
                            return uuids_1[i] === undefined ? a : __assign(__assign({}, a), { file_uuid: uuids_1[i] });
                        })];
                case 7: return [2 /*return*/, stated];
            }
        });
    });
}
