"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logFileOperation = logFileOperation;
var crypto_1 = require("crypto");
var index_js_1 = require("src/services/analytics/index.js");
/**
 * Creates a truncated SHA256 hash (16 chars) for file paths
 * Used for privacy-preserving analytics on file operations
 */
function hashFilePath(filePath) {
    return (0, crypto_1.createHash)('sha256')
        .update(filePath)
        .digest('hex')
        .slice(0, 16);
}
/**
 * Creates a full SHA256 hash (64 chars) for file contents
 * Used for deduplication and change detection analytics
 */
function hashFileContent(content) {
    return (0, crypto_1.createHash)('sha256')
        .update(content)
        .digest('hex');
}
// Maximum content size to hash (100KB)
// Prevents memory exhaustion when hashing large files (e.g., base64-encoded images)
var MAX_CONTENT_HASH_SIZE = 100 * 1024;
/**
 * Logs file operation analytics to Statsig
 */
function logFileOperation(params) {
    var metadata = {
        operation: params.operation,
        tool: params.tool,
        filePathHash: hashFilePath(params.filePath),
    };
    // Only hash content if it's provided and below size limit
    // This prevents memory exhaustion from hashing large files (e.g., base64-encoded images)
    if (params.content !== undefined &&
        params.content.length <= MAX_CONTENT_HASH_SIZE) {
        metadata.contentHash = hashFileContent(params.content);
    }
    if (params.type !== undefined) {
        metadata.type =
            params.type;
    }
    (0, index_js_1.logEvent)('tengu_file_operation', metadata);
}
