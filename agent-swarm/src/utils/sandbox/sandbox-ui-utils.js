"use strict";
/**
 * UI utilities for sandbox violations
 * These utilities are used for displaying sandbox-related information in the UI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSandboxViolationTags = removeSandboxViolationTags;
/**
 * Remove <sandbox_violations> tags from text
 * Used to clean up error messages for display purposes
 */
function removeSandboxViolationTags(text) {
    return text.replace(/<sandbox_violations>[\s\S]*?<\/sandbox_violations>/g, '');
}
