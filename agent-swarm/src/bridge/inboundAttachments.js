"use strict";
/**
 * Resolve file_uuid attachments on inbound bridge user messages.
 *
 * Web composer uploads via cookie-authed /api/{org}/upload, sends file_uuid
 * alongside the message. Here we fetch each via GET /api/oauth/files/{uuid}/content
 * (oauth-authed, same store), write to ~/.claude/uploads/{sessionId}/, and
 * return @path refs to prepend. Claude's Read tool takes it from there.
 *
 * Best-effort: any failure (no token, network, non-2xx, disk) logs debug and
 * skips that attachment. The message still reaches Claude, just without @path.
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractInboundAttachments = extractInboundAttachments;
exports.resolveInboundAttachments = resolveInboundAttachments;
exports.prependPathRefs = prependPathRefs;
exports.resolveAndPrepend = resolveAndPrepend;
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var state_js_1 = require("../bootstrap/state.js");
var debug_js_1 = require("../utils/debug.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var lazySchema_js_1 = require("../utils/lazySchema.js");
var bridgeConfig_js_1 = require("./bridgeConfig.js");
var DOWNLOAD_TIMEOUT_MS = 30000;
function debug(msg) {
    (0, debug_js_1.logForDebugging)("[bridge:inbound-attach] ".concat(msg));
}
var attachmentSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        file_uuid: v4_1.z.string(),
        file_name: v4_1.z.string(),
    });
});
var attachmentsArraySchema = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.array(attachmentSchema()); });
/** Pull file_attachments off a loosely-typed inbound message. */
function extractInboundAttachments(msg) {
    if (typeof msg !== 'object' || msg === null || !('file_attachments' in msg)) {
        return [];
    }
    var parsed = attachmentsArraySchema().safeParse(msg.file_attachments);
    return parsed.success ? parsed.data : [];
}
/**
 * Strip path components and keep only filename-safe chars. file_name comes
 * from the network (web composer), so treat it as untrusted even though the
 * composer controls it.
 */
function sanitizeFileName(name) {
    var base = (0, path_1.basename)(name).replace(/[^a-zA-Z0-9._-]/g, '_');
    return base || 'attachment';
}
function uploadsDir() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'uploads', (0, state_js_1.getSessionId)());
}
/**
 * Fetch + write one attachment. Returns the absolute path on success,
 * undefined on any failure.
 */
function resolveOne(att) {
    return __awaiter(this, void 0, void 0, function () {
        var token, data, url, response, e_1, safeName, prefix, dir, outPath, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = (0, bridgeConfig_js_1.getBridgeAccessToken)();
                    if (!token) {
                        debug('skip: no oauth token');
                        return [2 /*return*/, undefined];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    url = "".concat((0, bridgeConfig_js_1.getBridgeBaseUrl)(), "/api/oauth/files/").concat(encodeURIComponent(att.file_uuid), "/content");
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: { Authorization: "Bearer ".concat(token) },
                            responseType: 'arraybuffer',
                            timeout: DOWNLOAD_TIMEOUT_MS,
                            validateStatus: function () { return true; },
                        })];
                case 2:
                    response = _a.sent();
                    if (response.status !== 200) {
                        debug("fetch ".concat(att.file_uuid, " failed: status=").concat(response.status));
                        return [2 /*return*/, undefined];
                    }
                    data = Buffer.from(response.data);
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    debug("fetch ".concat(att.file_uuid, " threw: ").concat(e_1));
                    return [2 /*return*/, undefined];
                case 4:
                    safeName = sanitizeFileName(att.file_name);
                    prefix = (att.file_uuid.slice(0, 8) || (0, crypto_1.randomUUID)().slice(0, 8)).replace(/[^a-zA-Z0-9_-]/g, '_');
                    dir = uploadsDir();
                    outPath = (0, path_1.join)(dir, "".concat(prefix, "-").concat(safeName));
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 8, , 9]);
                    return [4 /*yield*/, (0, promises_1.mkdir)(dir, { recursive: true })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(outPath, data)];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    e_2 = _a.sent();
                    debug("write ".concat(outPath, " failed: ").concat(e_2));
                    return [2 /*return*/, undefined];
                case 9:
                    debug("resolved ".concat(att.file_uuid, " \u2192 ").concat(outPath, " (").concat(data.length, " bytes)"));
                    return [2 /*return*/, outPath];
            }
        });
    });
}
/**
 * Resolve all attachments on an inbound message to a prefix string of
 * @path refs. Empty string if none resolved.
 */
function resolveInboundAttachments(attachments) {
    return __awaiter(this, void 0, void 0, function () {
        var paths, ok;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (attachments.length === 0)
                        return [2 /*return*/, ''];
                    debug("resolving ".concat(attachments.length, " attachment(s)"));
                    return [4 /*yield*/, Promise.all(attachments.map(resolveOne))];
                case 1:
                    paths = _a.sent();
                    ok = paths.filter(function (p) { return p !== undefined; });
                    if (ok.length === 0)
                        return [2 /*return*/, ''
                            // Quoted form — extractAtMentionedFiles truncates unquoted @refs at the
                            // first space, which breaks any home dir with spaces (/Users/John Smith/).
                        ];
                    // Quoted form — extractAtMentionedFiles truncates unquoted @refs at the
                    // first space, which breaks any home dir with spaces (/Users/John Smith/).
                    return [2 /*return*/, ok.map(function (p) { return "@\"".concat(p, "\""); }).join(' ') + ' '];
            }
        });
    });
}
/**
 * Prepend @path refs to content, whichever form it's in.
 * Targets the LAST text block — processUserInputBase reads inputString
 * from processedBlocks[processedBlocks.length - 1], so putting refs in
 * block[0] means they're silently ignored for [text, image] content.
 */
function prependPathRefs(content, prefix) {
    if (!prefix)
        return content;
    if (typeof content === 'string')
        return prefix + content;
    var i = content.findLastIndex(function (b) { return b.type === 'text'; });
    if (i !== -1) {
        var b = content[i];
        if (b.type === 'text') {
            return __spreadArray(__spreadArray(__spreadArray([], content.slice(0, i), true), [
                __assign(__assign({}, b), { text: prefix + b.text })
            ], false), content.slice(i + 1), true);
        }
    }
    // No text block — append one at the end so it's last.
    return __spreadArray(__spreadArray([], content, true), [{ type: 'text', text: prefix.trimEnd() }], false);
}
/**
 * Convenience: extract + resolve + prepend. No-op when the message has no
 * file_attachments field (fast path — no network, returns same reference).
 */
function resolveAndPrepend(msg, content) {
    return __awaiter(this, void 0, void 0, function () {
        var attachments, prefix;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    attachments = extractInboundAttachments(msg);
                    if (attachments.length === 0)
                        return [2 /*return*/, content];
                    return [4 /*yield*/, resolveInboundAttachments(attachments)];
                case 1:
                    prefix = _a.sent();
                    return [2 /*return*/, prependPathRefs(content, prefix)];
            }
        });
    });
}
