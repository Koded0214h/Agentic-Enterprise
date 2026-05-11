"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTempFilePath = generateTempFilePath;
var crypto_1 = require("crypto");
var os_1 = require("os");
var path_1 = require("path");
/**
 * Generate a temporary file path.
 *
 * @param prefix Optional prefix for the temp file name
 * @param extension Optional file extension (defaults to '.md')
 * @param options.contentHash When provided, the identifier is derived from a
 *   SHA-256 hash of this string (first 16 hex chars). This produces a path
 *   that is stable across process boundaries — any process with the same
 *   content will get the same path. Use this when the path ends up in content
 *   sent to the Anthropic API (e.g., sandbox deny lists in tool descriptions),
 *   because a random UUID would change on every subprocess spawn and
 *   invalidate the prompt cache prefix.
 * @returns Temp file path
 */
function generateTempFilePath(prefix, extension, options) {
    if (prefix === void 0) { prefix = 'claude-prompt'; }
    if (extension === void 0) { extension = '.md'; }
    var id = (options === null || options === void 0 ? void 0 : options.contentHash)
        ? (0, crypto_1.createHash)('sha256')
            .update(options.contentHash)
            .digest('hex')
            .slice(0, 16)
        : (0, crypto_1.randomUUID)();
    return (0, path_1.join)((0, os_1.tmpdir)(), "".concat(prefix, "-").concat(id).concat(extension));
}
