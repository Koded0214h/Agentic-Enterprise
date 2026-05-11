"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionUpdateSchema = exports.permissionUpdateDestinationSchema = void 0;
/**
 * Zod schemas for permission updates.
 *
 * This file is intentionally kept minimal with no complex dependencies
 * so it can be safely imported by src/types/hooks.ts without creating
 * circular dependencies.
 */
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../lazySchema.js");
var PermissionMode_js_1 = require("./PermissionMode.js");
var PermissionRule_js_1 = require("./PermissionRule.js");
/**
 * PermissionUpdateDestination is where a new permission rule should be saved to.
 */
exports.permissionUpdateDestinationSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.default.enum([
        // User settings (global)
        'userSettings',
        // Project settings (shared per-directory)
        'projectSettings',
        // Local settings (gitignored)
        'localSettings',
        // In-memory for the current session only
        'session',
        // From the command line arguments
        'cliArg',
    ]);
});
exports.permissionUpdateSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.default.discriminatedUnion('type', [
        v4_1.default.object({
            type: v4_1.default.literal('addRules'),
            rules: v4_1.default.array((0, PermissionRule_js_1.permissionRuleValueSchema)()),
            behavior: (0, PermissionRule_js_1.permissionBehaviorSchema)(),
            destination: (0, exports.permissionUpdateDestinationSchema)(),
        }),
        v4_1.default.object({
            type: v4_1.default.literal('replaceRules'),
            rules: v4_1.default.array((0, PermissionRule_js_1.permissionRuleValueSchema)()),
            behavior: (0, PermissionRule_js_1.permissionBehaviorSchema)(),
            destination: (0, exports.permissionUpdateDestinationSchema)(),
        }),
        v4_1.default.object({
            type: v4_1.default.literal('removeRules'),
            rules: v4_1.default.array((0, PermissionRule_js_1.permissionRuleValueSchema)()),
            behavior: (0, PermissionRule_js_1.permissionBehaviorSchema)(),
            destination: (0, exports.permissionUpdateDestinationSchema)(),
        }),
        v4_1.default.object({
            type: v4_1.default.literal('setMode'),
            mode: (0, PermissionMode_js_1.externalPermissionModeSchema)(),
            destination: (0, exports.permissionUpdateDestinationSchema)(),
        }),
        v4_1.default.object({
            type: v4_1.default.literal('addDirectories'),
            directories: v4_1.default.array(v4_1.default.string()),
            destination: (0, exports.permissionUpdateDestinationSchema)(),
        }),
        v4_1.default.object({
            type: v4_1.default.literal('removeDirectories'),
            directories: v4_1.default.array(v4_1.default.string()),
            destination: (0, exports.permissionUpdateDestinationSchema)(),
        }),
    ]);
});
