"use strict";
/**
 * Tag Stripping Utilities
 *
 * Implements the tag system for meta-observation control:
 * 1. <claude-mem-context> - System-level tag for auto-injected observations
 *    (prevents recursive storage when context injection is active)
 * 2. <private> - User-level tag for manual privacy control
 *    (allows users to mark content they don't want persisted)
 * 3. <system_instruction> / <system-instruction> - Conductor-injected system instructions
 *    (should not be persisted to memory)
 *
 * EDGE PROCESSING PATTERN: Filter at hook layer before sending to worker/storage.
 * This keeps the worker service simple and follows one-way data stream.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripMemoryTagsFromJson = stripMemoryTagsFromJson;
exports.stripMemoryTagsFromPrompt = stripMemoryTagsFromPrompt;
var logger_js_1 = require("./logger.js");
/**
 * Maximum number of tags allowed in a single content block
 * This protects against ReDoS (Regular Expression Denial of Service) attacks
 * where malicious input with many nested/unclosed tags could cause catastrophic backtracking
 */
var MAX_TAG_COUNT = 100;
/**
 * Count total number of opening tags in content
 * Used for ReDoS protection before regex processing
 */
function countTags(content) {
    var privateCount = (content.match(/<private>/g) || []).length;
    var contextCount = (content.match(/<claude-mem-context>/g) || []).length;
    var systemInstructionCount = (content.match(/<system_instruction>/g) || []).length;
    var systemInstructionHyphenCount = (content.match(/<system-instruction>/g) || []).length;
    return privateCount + contextCount + systemInstructionCount + systemInstructionHyphenCount;
}
/**
 * Internal function to strip memory tags from content
 * Shared logic extracted from both JSON and prompt stripping functions
 */
function stripTagsInternal(content) {
    // ReDoS protection: limit tag count before regex processing
    var tagCount = countTags(content);
    if (tagCount > MAX_TAG_COUNT) {
        logger_js_1.logger.warn('SYSTEM', 'tag count exceeds limit', undefined, {
            tagCount: tagCount,
            maxAllowed: MAX_TAG_COUNT,
            contentLength: content.length
        });
        // Still process but log the anomaly
    }
    return content
        .replace(/<claude-mem-context>[\s\S]*?<\/claude-mem-context>/g, '')
        .replace(/<private>[\s\S]*?<\/private>/g, '')
        .replace(/<system_instruction>[\s\S]*?<\/system_instruction>/g, '')
        .replace(/<system-instruction>[\s\S]*?<\/system-instruction>/g, '')
        .trim();
}
/**
 * Strip memory tags from JSON-serialized content (tool inputs/responses)
 *
 * @param content - Stringified JSON content from tool_input or tool_response
 * @returns Cleaned content with tags removed, or '{}' if invalid
 */
function stripMemoryTagsFromJson(content) {
    return stripTagsInternal(content);
}
/**
 * Strip memory tags from user prompt content
 *
 * @param content - Raw user prompt text
 * @returns Cleaned content with tags removed
 */
function stripMemoryTagsFromPrompt(content) {
    return stripTagsInternal(content);
}
