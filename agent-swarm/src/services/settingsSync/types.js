"use strict";
/**
 * Settings Sync Types
 *
 * Zod schemas and types for the user settings sync API.
 * Based on the backend API contract from anthropic/anthropic#218817.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYNC_KEYS = exports.UserSyncDataSchema = exports.UserSyncContentSchema = void 0;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
/**
 * Content portion of user sync data - flat key-value storage.
 * Keys are opaque strings (typically file paths).
 * Values are UTF-8 string content (JSON, Markdown, etc).
 */
exports.UserSyncContentSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        entries: v4_1.z.record(v4_1.z.string(), v4_1.z.string()),
    });
});
/**
 * Full response from GET /api/claude_code/user_settings
 */
exports.UserSyncDataSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        userId: v4_1.z.string(),
        version: v4_1.z.number(),
        lastModified: v4_1.z.string(), // ISO 8601 timestamp
        checksum: v4_1.z.string(), // MD5 hash
        content: (0, exports.UserSyncContentSchema)(),
    });
});
/**
 * Keys used for sync entries
 */
exports.SYNC_KEYS = {
    USER_SETTINGS: '~/.claude/settings.json',
    USER_MEMORY: '~/.claude/CLAUDE.md',
    projectSettings: function (projectId) {
        return "projects/".concat(projectId, "/.claude/settings.local.json");
    },
    projectMemory: function (projectId) { return "projects/".concat(projectId, "/CLAUDE.local.md"); },
};
