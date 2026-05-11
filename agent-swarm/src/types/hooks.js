"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookJSONOutputSchema = exports.syncHookResponseSchema = exports.promptRequestSchema = void 0;
exports.isHookEvent = isHookEvent;
exports.isSyncHookJSONOutput = isSyncHookJSONOutput;
exports.isAsyncHookJSONOutput = isAsyncHookJSONOutput;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../utils/lazySchema.js");
var agentSdkTypes_js_1 = require("src/entrypoints/agentSdkTypes.js");
var PermissionRule_js_1 = require("src/utils/permissions/PermissionRule.js");
var PermissionUpdateSchema_js_1 = require("src/utils/permissions/PermissionUpdateSchema.js");
function isHookEvent(value) {
    return agentSdkTypes_js_1.HOOK_EVENTS.includes(value);
}
// Prompt elicitation protocol types. The `prompt` key acts as discriminator
// (mirroring the {async:true} pattern), with the id as its value.
exports.promptRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        prompt: v4_1.z.string(), // request id
        message: v4_1.z.string(),
        options: v4_1.z.array(v4_1.z.object({
            key: v4_1.z.string(),
            label: v4_1.z.string(),
            description: v4_1.z.string().optional(),
        })),
    });
});
// Sync hook response schema
exports.syncHookResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        continue: v4_1.z
            .boolean()
            .describe('Whether Claude should continue after hook (default: true)')
            .optional(),
        suppressOutput: v4_1.z
            .boolean()
            .describe('Hide stdout from transcript (default: false)')
            .optional(),
        stopReason: v4_1.z
            .string()
            .describe('Message shown when continue is false')
            .optional(),
        decision: v4_1.z.enum(['approve', 'block']).optional(),
        reason: v4_1.z.string().describe('Explanation for the decision').optional(),
        systemMessage: v4_1.z
            .string()
            .describe('Warning message shown to the user')
            .optional(),
        hookSpecificOutput: v4_1.z
            .union([
            v4_1.z.object({
                hookEventName: v4_1.z.literal('PreToolUse'),
                permissionDecision: (0, PermissionRule_js_1.permissionBehaviorSchema)().optional(),
                permissionDecisionReason: v4_1.z.string().optional(),
                updatedInput: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
                additionalContext: v4_1.z.string().optional(),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('UserPromptSubmit'),
                additionalContext: v4_1.z.string().optional(),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('SessionStart'),
                additionalContext: v4_1.z.string().optional(),
                initialUserMessage: v4_1.z.string().optional(),
                watchPaths: v4_1.z
                    .array(v4_1.z.string())
                    .describe('Absolute paths to watch for FileChanged hooks')
                    .optional(),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('Setup'),
                additionalContext: v4_1.z.string().optional(),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('SubagentStart'),
                additionalContext: v4_1.z.string().optional(),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('PostToolUse'),
                additionalContext: v4_1.z.string().optional(),
                updatedMCPToolOutput: v4_1.z
                    .unknown()
                    .describe('Updates the output for MCP tools')
                    .optional(),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('PostToolUseFailure'),
                additionalContext: v4_1.z.string().optional(),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('PermissionDenied'),
                retry: v4_1.z.boolean().optional(),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('Notification'),
                additionalContext: v4_1.z.string().optional(),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('PermissionRequest'),
                decision: v4_1.z.union([
                    v4_1.z.object({
                        behavior: v4_1.z.literal('allow'),
                        updatedInput: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
                        updatedPermissions: v4_1.z.array((0, PermissionUpdateSchema_js_1.permissionUpdateSchema)()).optional(),
                    }),
                    v4_1.z.object({
                        behavior: v4_1.z.literal('deny'),
                        message: v4_1.z.string().optional(),
                        interrupt: v4_1.z.boolean().optional(),
                    }),
                ]),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('Elicitation'),
                action: v4_1.z.enum(['accept', 'decline', 'cancel']).optional(),
                content: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('ElicitationResult'),
                action: v4_1.z.enum(['accept', 'decline', 'cancel']).optional(),
                content: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('CwdChanged'),
                watchPaths: v4_1.z
                    .array(v4_1.z.string())
                    .describe('Absolute paths to watch for FileChanged hooks')
                    .optional(),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('FileChanged'),
                watchPaths: v4_1.z
                    .array(v4_1.z.string())
                    .describe('Absolute paths to watch for FileChanged hooks')
                    .optional(),
            }),
            v4_1.z.object({
                hookEventName: v4_1.z.literal('WorktreeCreate'),
                worktreePath: v4_1.z.string(),
            }),
        ])
            .optional(),
    });
});
// Zod schema for hook JSON output validation
exports.hookJSONOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    // Async hook response schema
    var asyncHookResponseSchema = v4_1.z.object({
        async: v4_1.z.literal(true),
        asyncTimeout: v4_1.z.number().optional(),
    });
    return v4_1.z.union([asyncHookResponseSchema, (0, exports.syncHookResponseSchema)()]);
});
// Type guard function to check if response is sync
function isSyncHookJSONOutput(json) {
    return !('async' in json && json.async === true);
}
// Type guard function to check if response is async
function isAsyncHookJSONOutput(json) {
    return 'async' in json && json.async === true;
}
