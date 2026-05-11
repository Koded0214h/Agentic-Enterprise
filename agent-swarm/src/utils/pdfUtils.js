"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOCUMENT_EXTENSIONS = void 0;
exports.parsePDFPageRange = parsePDFPageRange;
exports.isPDFSupported = isPDFSupported;
exports.isPDFExtension = isPDFExtension;
var model_js_1 = require("./model/model.js");
// Document extensions that are handled specially
exports.DOCUMENT_EXTENSIONS = new Set(['pdf']);
/**
 * Parse a page range string into firstPage/lastPage numbers.
 * Supported formats:
 * - "5" → { firstPage: 5, lastPage: 5 }
 * - "1-10" → { firstPage: 1, lastPage: 10 }
 * - "3-" → { firstPage: 3, lastPage: Infinity }
 *
 * Returns null on invalid input (non-numeric, zero, inverted range).
 * Pages are 1-indexed.
 */
function parsePDFPageRange(pages) {
    var trimmed = pages.trim();
    if (!trimmed) {
        return null;
    }
    // "N-" open-ended range
    if (trimmed.endsWith('-')) {
        var first_1 = parseInt(trimmed.slice(0, -1), 10);
        if (isNaN(first_1) || first_1 < 1) {
            return null;
        }
        return { firstPage: first_1, lastPage: Infinity };
    }
    var dashIndex = trimmed.indexOf('-');
    if (dashIndex === -1) {
        // Single page: "5"
        var page = parseInt(trimmed, 10);
        if (isNaN(page) || page < 1) {
            return null;
        }
        return { firstPage: page, lastPage: page };
    }
    // Range: "1-10"
    var first = parseInt(trimmed.slice(0, dashIndex), 10);
    var last = parseInt(trimmed.slice(dashIndex + 1), 10);
    if (isNaN(first) || isNaN(last) || first < 1 || last < 1 || last < first) {
        return null;
    }
    return { firstPage: first, lastPage: last };
}
/**
 * Check if PDF reading is supported with the current model.
 * PDF document blocks work on all providers (1P, Vertex, Bedrock, Foundry).
 * Haiku 3 is the only remaining model that predates PDF support; users on
 * it fall back to the page-extraction path (poppler-utils). Substring match
 * covers all provider ID formats (Bedrock prefixes, Vertex @-dates).
 */
function isPDFSupported() {
    return !(0, model_js_1.getMainLoopModel)().toLowerCase().includes('claude-3-haiku');
}
/**
 * Check if a file extension is a PDF document.
 * @param ext File extension (with or without leading dot)
 */
function isPDFExtension(ext) {
    var normalized = ext.startsWith('.') ? ext.slice(1) : ext;
    return exports.DOCUMENT_EXTENSIONS.has(normalized.toLowerCase());
}
