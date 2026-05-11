"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractInboundMessageFields = extractInboundMessageFields;
exports.normalizeImageBlocks = normalizeImageBlocks;
var imageResizer_js_1 = require("../utils/imageResizer.js");
/**
 * Process an inbound user message from the bridge, extracting content
 * and UUID for enqueueing. Supports both string content and
 * ContentBlockParam[] (e.g. messages containing images).
 *
 * Normalizes image blocks from bridge clients that may use camelCase
 * `mediaType` instead of snake_case `media_type` (mobile-apps#5825).
 *
 * Returns the extracted fields, or undefined if the message should be
 * skipped (non-user type, missing/empty content).
 */
function extractInboundMessageFields(msg) {
    var _a;
    if (msg.type !== 'user')
        return undefined;
    var content = (_a = msg.message) === null || _a === void 0 ? void 0 : _a.content;
    if (!content)
        return undefined;
    if (Array.isArray(content) && content.length === 0)
        return undefined;
    var uuid = 'uuid' in msg && typeof msg.uuid === 'string'
        ? msg.uuid
        : undefined;
    return {
        content: Array.isArray(content) ? normalizeImageBlocks(content) : content,
        uuid: uuid,
    };
}
/**
 * Normalize image content blocks from bridge clients. iOS/web clients may
 * send `mediaType` (camelCase) instead of `media_type` (snake_case), or
 * omit the field entirely. Without normalization, the bad block poisons
 * the session — every subsequent API call fails with
 * "media_type: Field required".
 *
 * Fast-path scan returns the original array reference when no
 * normalization is needed (zero allocation on the happy path).
 */
function normalizeImageBlocks(blocks) {
    if (!blocks.some(isMalformedBase64Image))
        return blocks;
    return blocks.map(function (block) {
        if (!isMalformedBase64Image(block))
            return block;
        var src = block.source;
        var mediaType = typeof src.mediaType === 'string' && src.mediaType
            ? src.mediaType
            : (0, imageResizer_js_1.detectImageFormatFromBase64)(block.source.data);
        return __assign(__assign({}, block), { source: {
                type: 'base64',
                media_type: mediaType,
                data: block.source.data,
            } });
    });
}
function isMalformedBase64Image(block) {
    var _a;
    if (block.type !== 'image' || ((_a = block.source) === null || _a === void 0 ? void 0 : _a.type) !== 'base64')
        return false;
    return !block.source.media_type;
}
