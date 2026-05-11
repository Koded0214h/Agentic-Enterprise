"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeXml = escapeXml;
exports.escapeXmlAttr = escapeXmlAttr;
/**
 * Escape XML/HTML special characters for safe interpolation into element
 * text content (between tags). Use when untrusted strings (process stdout,
 * user input, external data) go inside `<tag>${here}</tag>`.
 */
function escapeXml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
/**
 * Escape for interpolation into a double- or single-quoted attribute value:
 * `<tag attr="${here}">`. Escapes quotes in addition to `& < >`.
 */
function escapeXmlAttr(s) {
    return escapeXml(s).replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
