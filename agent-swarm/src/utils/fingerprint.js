"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FINGERPRINT_SALT = void 0;
exports.extractFirstMessageText = extractFirstMessageText;
exports.computeFingerprint = computeFingerprint;
exports.computeFingerprintFromMessages = computeFingerprintFromMessages;
var crypto_1 = require("crypto");
/**
 * Hardcoded salt from backend validation.
 * Must match exactly for fingerprint validation to pass.
 */
exports.FINGERPRINT_SALT = '59cf53e54c78';
/**
 * Extracts text content from the first user message.
 *
 * @param messages - Array of internal message types
 * @returns First text content, or empty string if not found
 */
function extractFirstMessageText(messages) {
    var firstUserMessage = messages.find(function (msg) { return msg.type === 'user'; });
    if (!firstUserMessage) {
        return '';
    }
    var content = firstUserMessage.message.content;
    if (typeof content === 'string') {
        return content;
    }
    if (Array.isArray(content)) {
        var textBlock = content.find(function (block) { return block.type === 'text'; });
        if (textBlock && textBlock.type === 'text') {
            return textBlock.text;
        }
    }
    return '';
}
/**
 * Computes 3-character fingerprint for Claude Code attribution.
 * Algorithm: SHA256(SALT + msg[4] + msg[7] + msg[20] + version)[:3]
 * IMPORTANT: Do not change this method without careful coordination with
 * 1P and 3P (Bedrock, Vertex, Azure) APIs.
 *
 * @param messageText - First user message text content
 * @param version - Version string (from MACRO.VERSION)
 * @returns 3-character hex fingerprint
 */
function computeFingerprint(messageText, version) {
    // Extract chars at indices [4, 7, 20], use "0" if index not found
    var indices = [4, 7, 20];
    var chars = indices.map(function (i) { return messageText[i] || '0'; }).join('');
    var fingerprintInput = "".concat(exports.FINGERPRINT_SALT).concat(chars).concat(version);
    // SHA256 hash, return first 3 hex chars
    var hash = (0, crypto_1.createHash)('sha256').update(fingerprintInput).digest('hex');
    return hash.slice(0, 3);
}
/**
 * Computes fingerprint from the first user message.
 *
 * @param messages - Array of normalized messages
 * @returns 3-character hex fingerprint
 */
function computeFingerprintFromMessages(messages) {
    var firstMessageText = extractFirstMessageText(messages);
    return computeFingerprint(firstMessageText, MACRO.VERSION);
}
