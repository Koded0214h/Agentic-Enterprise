"use strict";
/**
 * Hook Zod schemas extracted to break import cycles.
 *
 * This file contains hook-related schema definitions that were originally
 * in src/utils/settings/types.ts. By extracting them here, we break the
 * circular dependency between settings/types.ts and plugins/schemas.ts.
 *
 * Both files now import from this shared location instead of each other.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HooksSchema = exports.HookMatcherSchema = exports.HookCommandSchema = void 0;
var agentSdkTypes_js_1 = require("src/entrypoints/agentSdkTypes.js");
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../utils/lazySchema.js");
var shellProvider_js_1 = require("../utils/shell/shellProvider.js");
// Shared schema for the `if` condition field.
// Uses permission rule syntax (e.g., "Bash(git *)", "Read(*.ts)") to filter hooks
// before spawning. Evaluated against the hook input's tool_name and tool_input.
var IfConditionSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .string()
        .optional()
        .describe('Permission rule syntax to filter when this hook runs (e.g., "Bash(git *)"). ' +
        'Only runs if the tool call matches the pattern. Avoids spawning hooks for non-matching commands.');
});
// Internal factory for individual hook schemas (shared between exported
// discriminated union members and the HookCommandSchema factory)
function buildHookSchemas() {
    var BashCommandHookSchema = v4_1.z.object({
        type: v4_1.z.literal('command').describe('Shell command hook type'),
        command: v4_1.z.string().describe('Shell command to execute'),
        if: IfConditionSchema(),
        shell: v4_1.z
            .enum(shellProvider_js_1.SHELL_TYPES)
            .optional()
            .describe("Shell interpreter. 'bash' uses your $SHELL (bash/zsh/sh); 'powershell' uses pwsh. Defaults to bash."),
        timeout: v4_1.z
            .number()
            .positive()
            .optional()
            .describe('Timeout in seconds for this specific command'),
        statusMessage: v4_1.z
            .string()
            .optional()
            .describe('Custom status message to display in spinner while hook runs'),
        once: v4_1.z
            .boolean()
            .optional()
            .describe('If true, hook runs once and is removed after execution'),
        async: v4_1.z
            .boolean()
            .optional()
            .describe('If true, hook runs in background without blocking'),
        asyncRewake: v4_1.z
            .boolean()
            .optional()
            .describe('If true, hook runs in background and wakes the model on exit code 2 (blocking error). Implies async.'),
    });
    var PromptHookSchema = v4_1.z.object({
        type: v4_1.z.literal('prompt').describe('LLM prompt hook type'),
        prompt: v4_1.z
            .string()
            .describe('Prompt to evaluate with LLM. Use $ARGUMENTS placeholder for hook input JSON.'),
        if: IfConditionSchema(),
        timeout: v4_1.z
            .number()
            .positive()
            .optional()
            .describe('Timeout in seconds for this specific prompt evaluation'),
        // @[MODEL LAUNCH]: Update the example model ID in the .describe() strings below (prompt + agent hooks).
        model: v4_1.z
            .string()
            .optional()
            .describe('Model to use for this prompt hook (e.g., "claude-sonnet-4-6"). If not specified, uses the default small fast model.'),
        statusMessage: v4_1.z
            .string()
            .optional()
            .describe('Custom status message to display in spinner while hook runs'),
        once: v4_1.z
            .boolean()
            .optional()
            .describe('If true, hook runs once and is removed after execution'),
    });
    var HttpHookSchema = v4_1.z.object({
        type: v4_1.z.literal('http').describe('HTTP hook type'),
        url: v4_1.z.string().url().describe('URL to POST the hook input JSON to'),
        if: IfConditionSchema(),
        timeout: v4_1.z
            .number()
            .positive()
            .optional()
            .describe('Timeout in seconds for this specific request'),
        headers: v4_1.z
            .record(v4_1.z.string(), v4_1.z.string())
            .optional()
            .describe('Additional headers to include in the request. Values may reference environment variables using $VAR_NAME or ${VAR_NAME} syntax (e.g., "Authorization": "Bearer $MY_TOKEN"). Only variables listed in allowedEnvVars will be interpolated.'),
        allowedEnvVars: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Explicit list of environment variable names that may be interpolated in header values. Only variables listed here will be resolved; all other $VAR references are left as empty strings. Required for env var interpolation to work.'),
        statusMessage: v4_1.z
            .string()
            .optional()
            .describe('Custom status message to display in spinner while hook runs'),
        once: v4_1.z
            .boolean()
            .optional()
            .describe('If true, hook runs once and is removed after execution'),
    });
    var AgentHookSchema = v4_1.z.object({
        type: v4_1.z.literal('agent').describe('Agentic verifier hook type'),
        // DO NOT add .transform() here. This schema is used by parseSettingsFile,
        // and updateSettingsForSource round-trips the parsed result through
        // JSON.stringify — a transformed function value is silently dropped,
        // deleting the user's prompt from settings.json (gh-24920, CC-79). The
        // transform (from #10594) wrapped the string in `(_msgs) => prompt`
        // for a programmatic-construction use case in ExitPlanModeV2Tool that
        // has since been refactored into VerifyPlanExecutionTool, which no
        // longer constructs AgentHook objects at all.
        prompt: v4_1.z
            .string()
            .describe('Prompt describing what to verify (e.g. "Verify that unit tests ran and passed."). Use $ARGUMENTS placeholder for hook input JSON.'),
        if: IfConditionSchema(),
        timeout: v4_1.z
            .number()
            .positive()
            .optional()
            .describe('Timeout in seconds for agent execution (default 60)'),
        model: v4_1.z
            .string()
            .optional()
            .describe('Model to use for this agent hook (e.g., "claude-sonnet-4-6"). If not specified, uses Haiku.'),
        statusMessage: v4_1.z
            .string()
            .optional()
            .describe('Custom status message to display in spinner while hook runs'),
        once: v4_1.z
            .boolean()
            .optional()
            .describe('If true, hook runs once and is removed after execution'),
    });
    return {
        BashCommandHookSchema: BashCommandHookSchema,
        PromptHookSchema: PromptHookSchema,
        HttpHookSchema: HttpHookSchema,
        AgentHookSchema: AgentHookSchema,
    };
}
/**
 * Schema for hook command (excludes function hooks - they can't be persisted)
 */
exports.HookCommandSchema = (0, lazySchema_js_1.lazySchema)(function () {
    var _a = buildHookSchemas(), BashCommandHookSchema = _a.BashCommandHookSchema, PromptHookSchema = _a.PromptHookSchema, AgentHookSchema = _a.AgentHookSchema, HttpHookSchema = _a.HttpHookSchema;
    return v4_1.z.discriminatedUnion('type', [
        BashCommandHookSchema,
        PromptHookSchema,
        AgentHookSchema,
        HttpHookSchema,
    ]);
});
/**
 * Schema for matcher configuration with multiple hooks
 */
exports.HookMatcherSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        matcher: v4_1.z
            .string()
            .optional()
            .describe('String pattern to match (e.g. tool names like "Write")'), // String (e.g. Write) to match values related to the hook event, e.g. tool names
        hooks: v4_1.z
            .array((0, exports.HookCommandSchema)())
            .describe('List of hooks to execute when the matcher matches'),
    });
});
/**
 * Schema for hooks configuration
 * The key is the hook event. The value is an array of matcher configurations.
 * Uses partialRecord since not all hook events need to be defined.
 */
exports.HooksSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.partialRecord(v4_1.z.enum(agentSdkTypes_js_1.HOOK_EVENTS), v4_1.z.array((0, exports.HookMatcherSchema)()));
});
