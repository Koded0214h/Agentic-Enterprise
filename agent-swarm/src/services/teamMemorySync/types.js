"use strict";
/**
 * Team Memory Sync Types
 *
 * Zod schemas and types for the repo-scoped team memory sync API.
 * Based on the backend API contract from anthropic/anthropic#250711.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMemoryTooManyEntriesSchema = exports.TeamMemoryDataSchema = exports.TeamMemoryContentSchema = void 0;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
/**
 * Content portion of team memory data - flat key-value storage.
 * Keys are file paths relative to the team memory directory (e.g. "MEMORY.md", "patterns.md").
 * Values are UTF-8 string content (typically Markdown).
 */
exports.TeamMemoryContentSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        entries: v4_1.z.record(v4_1.z.string(), v4_1.z.string()),
        // Per-key SHA-256 of entry content (`sha256:<hex>`). Added in
        // anthropic/anthropic#283027. Optional for forward-compat with older
        // server deployments; empty map when entries is empty.
        entryChecksums: v4_1.z.record(v4_1.z.string(), v4_1.z.string()).optional(),
    });
});
/**
 * Full response from GET /api/claude_code/team_memory
 */
exports.TeamMemoryDataSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        organizationId: v4_1.z.string(),
        repo: v4_1.z.string(),
        version: v4_1.z.number(),
        lastModified: v4_1.z.string(), // ISO 8601 timestamp
        checksum: v4_1.z.string(), // SHA256 with 'sha256:' prefix
        content: (0, exports.TeamMemoryContentSchema)(),
    });
});
/**
 * Structured 413 error body from the server (anthropic/anthropic#293258).
 * The server's RequestTooLargeException serializes error_code and the
 * extra_details dict flattened into error.details. We only model the
 * too-many-entries case; entry-too-large is handled via MAX_FILE_SIZE_BYTES
 * pre-check on the client side and would need a separate schema.
 */
exports.TeamMemoryTooManyEntriesSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        error: v4_1.z.object({
            details: v4_1.z.object({
                error_code: v4_1.z.literal('team_memory_too_many_entries'),
                max_entries: v4_1.z.number().int().positive(),
                received_entries: v4_1.z.number().int().positive(),
            }),
        }),
    });
});
