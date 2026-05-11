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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageSizeError = void 0;
exports.validateImagesForAPI = validateImagesForAPI;
var apiLimits_js_1 = require("../constants/apiLimits.js");
var index_js_1 = require("../services/analytics/index.js");
var format_js_1 = require("./format.js");
/**
 * Error thrown when one or more images exceed the API size limit.
 */
var ImageSizeError = /** @class */ (function (_super) {
    __extends(ImageSizeError, _super);
    function ImageSizeError(oversizedImages, maxSize) {
        var _this = this;
        var message;
        var firstImage = oversizedImages[0];
        if (oversizedImages.length === 1 && firstImage) {
            message =
                "Image base64 size (".concat((0, format_js_1.formatFileSize)(firstImage.size), ") exceeds API limit (").concat((0, format_js_1.formatFileSize)(maxSize), "). ") +
                    "Please resize the image before sending.";
        }
        else {
            message =
                "".concat(oversizedImages.length, " images exceed the API limit (").concat((0, format_js_1.formatFileSize)(maxSize), "): ") +
                    oversizedImages
                        .map(function (img) { return "Image ".concat(img.index, ": ").concat((0, format_js_1.formatFileSize)(img.size)); })
                        .join(', ') +
                    ". Please resize these images before sending.";
        }
        _this = _super.call(this, message) || this;
        _this.name = 'ImageSizeError';
        return _this;
    }
    return ImageSizeError;
}(Error));
exports.ImageSizeError = ImageSizeError;
/**
 * Type guard to check if a block is a base64 image block
 */
function isBase64ImageBlock(block) {
    if (typeof block !== 'object' || block === null)
        return false;
    var b = block;
    if (b.type !== 'image')
        return false;
    if (typeof b.source !== 'object' || b.source === null)
        return false;
    var source = b.source;
    return source.type === 'base64' && typeof source.data === 'string';
}
/**
 * Validates that all images in messages are within the API size limit.
 * This is a safety net at the API boundary to catch any oversized images
 * that may have slipped through upstream processing.
 *
 * Note: The API's 5MB limit applies to the base64-encoded string length,
 * not the decoded raw bytes.
 *
 * Works with both UserMessage/AssistantMessage types (which have { type, message })
 * and raw MessageParam types (which have { role, content }).
 *
 * @param messages - Array of messages to validate
 * @throws ImageSizeError if any image exceeds the API limit
 */
function validateImagesForAPI(messages) {
    var oversizedImages = [];
    var imageIndex = 0;
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var msg = messages_1[_i];
        if (typeof msg !== 'object' || msg === null)
            continue;
        var m = msg;
        // Handle wrapped message format { type: 'user', message: { role, content } }
        // Only check user messages
        if (m.type !== 'user')
            continue;
        var innerMessage = m.message;
        if (!innerMessage)
            continue;
        var content = innerMessage.content;
        if (typeof content === 'string' || !Array.isArray(content))
            continue;
        for (var _a = 0, content_1 = content; _a < content_1.length; _a++) {
            var block = content_1[_a];
            if (isBase64ImageBlock(block)) {
                imageIndex++;
                // Check the base64-encoded string length directly (not decoded bytes)
                // The API limit applies to the base64 payload size
                var base64Size = block.source.data.length;
                if (base64Size > apiLimits_js_1.API_IMAGE_MAX_BASE64_SIZE) {
                    (0, index_js_1.logEvent)('tengu_image_api_validation_failed', {
                        base64_size_bytes: base64Size,
                        max_bytes: apiLimits_js_1.API_IMAGE_MAX_BASE64_SIZE,
                    });
                    oversizedImages.push({ index: imageIndex, size: base64Size });
                }
            }
        }
    }
    if (oversizedImages.length > 0) {
        throw new ImageSizeError(oversizedImages, apiLimits_js_1.API_IMAGE_MAX_BASE64_SIZE);
    }
}
