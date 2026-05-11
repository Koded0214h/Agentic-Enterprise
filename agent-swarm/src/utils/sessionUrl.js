"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSessionIdentifier = parseSessionIdentifier;
var crypto_1 = require("crypto");
var uuid_js_1 = require("./uuid.js");
/**
 * Parses a session resume identifier which can be either:
 * - A URL containing session ID (e.g., https://api.example.com/v1/session_ingress/session/550e8400-e29b-41d4-a716-446655440000)
 * - A plain session ID (UUID)
 *
 * @param resumeIdentifier - The URL or session ID to parse
 * @returns Parsed session information or null if invalid
 */
function parseSessionIdentifier(resumeIdentifier) {
    // Check for JSONL file path before URL parsing, since Windows absolute
    // paths (e.g., C:\path\file.jsonl) are parsed as valid URLs with C: as protocol
    if (resumeIdentifier.toLowerCase().endsWith('.jsonl')) {
        return {
            sessionId: (0, crypto_1.randomUUID)(),
            ingressUrl: null,
            isUrl: false,
            jsonlFile: resumeIdentifier,
            isJsonlFile: true,
        };
    }
    // Check if it's a plain UUID
    if ((0, uuid_js_1.validateUuid)(resumeIdentifier)) {
        return {
            sessionId: resumeIdentifier,
            ingressUrl: null,
            isUrl: false,
            jsonlFile: null,
            isJsonlFile: false,
        };
    }
    // Check if it's a URL
    try {
        var url = new URL(resumeIdentifier);
        // Use the entire URL as the ingress URL
        // Always generate a random session ID
        return {
            sessionId: (0, crypto_1.randomUUID)(),
            ingressUrl: url.href,
            isUrl: true,
            jsonlFile: null,
            isJsonlFile: false,
        };
    }
    catch (_a) {
        // Not a valid URL
    }
    return null;
}
