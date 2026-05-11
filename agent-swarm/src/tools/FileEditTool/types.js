"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputSchema = exports.inputSchema = exports.gitDiffSchema = exports.hunkSchema = void 0;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var semanticBoolean_js_1 = require("../../utils/semanticBoolean.js");
// The input schema with optional replace_all
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        file_path: v4_1.z.string().describe('The absolute path to the file to modify'),
        old_string: v4_1.z.string().describe('The text to replace'),
        new_string: v4_1.z
            .string()
            .describe('The text to replace it with (must be different from old_string)'),
        replace_all: (0, semanticBoolean_js_1.semanticBoolean)(v4_1.z.boolean().default(false).optional()).describe('Replace all occurrences of old_string (default false)'),
    });
});
exports.inputSchema = inputSchema;
exports.hunkSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        oldStart: v4_1.z.number(),
        oldLines: v4_1.z.number(),
        newStart: v4_1.z.number(),
        newLines: v4_1.z.number(),
        lines: v4_1.z.array(v4_1.z.string()),
    });
});
exports.gitDiffSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        filename: v4_1.z.string(),
        status: v4_1.z.enum(['modified', 'added']),
        additions: v4_1.z.number(),
        deletions: v4_1.z.number(),
        changes: v4_1.z.number(),
        patch: v4_1.z.string(),
        repository: v4_1.z
            .string()
            .nullable()
            .optional()
            .describe('GitHub owner/repo when available'),
    });
});
// Output schema for FileEditTool
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        filePath: v4_1.z.string().describe('The file path that was edited'),
        oldString: v4_1.z.string().describe('The original string that was replaced'),
        newString: v4_1.z.string().describe('The new string that replaced it'),
        originalFile: v4_1.z
            .string()
            .describe('The original file contents before editing'),
        structuredPatch: v4_1.z
            .array((0, exports.hunkSchema)())
            .describe('Diff patch showing the changes'),
        userModified: v4_1.z
            .boolean()
            .describe('Whether the user modified the proposed changes'),
        replaceAll: v4_1.z.boolean().describe('Whether all occurrences were replaced'),
        gitDiff: (0, exports.gitDiffSchema)().optional(),
    });
});
exports.outputSchema = outputSchema;
