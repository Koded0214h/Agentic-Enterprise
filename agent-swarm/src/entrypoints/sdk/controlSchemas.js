"use strict";
/**
 * SDK Control Schemas - Zod schemas for the control protocol.
 *
 * These schemas define the control protocol between SDK implementations and the CLI.
 * Used by SDK builders (e.g., Python SDK) to communicate with the CLI process.
 *
 * SDK consumers should use coreSchemas.ts instead.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StdinMessageSchema = exports.StdoutMessageSchema = exports.SDKUpdateEnvironmentVariablesMessageSchema = exports.SDKKeepAliveMessageSchema = exports.SDKControlCancelRequestSchema = exports.SDKControlResponseSchema = exports.ControlErrorResponseSchema = exports.ControlResponseSchema = exports.SDKControlRequestSchema = exports.SDKControlRequestInnerSchema = exports.SDKControlElicitationResponseSchema = exports.SDKControlElicitationRequestSchema = exports.SDKControlGetSettingsResponseSchema = exports.SDKControlGetSettingsRequestSchema = exports.SDKControlApplyFlagSettingsRequestSchema = exports.SDKControlStopTaskRequestSchema = exports.SDKControlMcpToggleRequestSchema = exports.SDKControlMcpReconnectRequestSchema = exports.SDKControlReloadPluginsResponseSchema = exports.SDKControlReloadPluginsRequestSchema = exports.SDKControlMcpSetServersResponseSchema = exports.SDKControlMcpSetServersRequestSchema = exports.SDKControlMcpMessageRequestSchema = exports.SDKHookCallbackRequestSchema = exports.SDKControlSeedReadStateRequestSchema = exports.SDKControlCancelAsyncMessageResponseSchema = exports.SDKControlCancelAsyncMessageRequestSchema = exports.SDKControlRewindFilesResponseSchema = exports.SDKControlRewindFilesRequestSchema = exports.SDKControlGetContextUsageResponseSchema = exports.SDKControlGetContextUsageRequestSchema = exports.SDKControlMcpStatusResponseSchema = exports.SDKControlMcpStatusRequestSchema = exports.SDKControlSetMaxThinkingTokensRequestSchema = exports.SDKControlSetModelRequestSchema = exports.SDKControlSetPermissionModeRequestSchema = exports.SDKControlPermissionRequestSchema = exports.SDKControlInterruptRequestSchema = exports.SDKControlInitializeResponseSchema = exports.SDKControlInitializeRequestSchema = exports.SDKHookCallbackMatcherSchema = exports.JSONRPCMessagePlaceholder = void 0;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var coreSchemas_js_1 = require("./coreSchemas.js");
// ============================================================================
// External Type Placeholders
// ============================================================================
// JSONRPCMessage from @modelcontextprotocol/sdk - treat as unknown
exports.JSONRPCMessagePlaceholder = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.unknown(); });
// ============================================================================
// Hook Callback Types
// ============================================================================
exports.SDKHookCallbackMatcherSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        matcher: v4_1.z.string().optional(),
        hookCallbackIds: v4_1.z.array(v4_1.z.string()),
        timeout: v4_1.z.number().optional(),
    })
        .describe('Configuration for matching and routing hook callbacks.');
});
// ============================================================================
// Control Request Types
// ============================================================================
exports.SDKControlInitializeRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('initialize'),
        hooks: v4_1.z
            .record((0, coreSchemas_js_1.HookEventSchema)(), v4_1.z.array((0, exports.SDKHookCallbackMatcherSchema)()))
            .optional(),
        sdkMcpServers: v4_1.z.array(v4_1.z.string()).optional(),
        jsonSchema: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
        systemPrompt: v4_1.z.string().optional(),
        appendSystemPrompt: v4_1.z.string().optional(),
        agents: v4_1.z.record(v4_1.z.string(), (0, coreSchemas_js_1.AgentDefinitionSchema)()).optional(),
        promptSuggestions: v4_1.z.boolean().optional(),
        agentProgressSummaries: v4_1.z.boolean().optional(),
    })
        .describe('Initializes the SDK session with hooks, MCP servers, and agent configuration.');
});
exports.SDKControlInitializeResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        commands: v4_1.z.array((0, coreSchemas_js_1.SlashCommandSchema)()),
        agents: v4_1.z.array((0, coreSchemas_js_1.AgentInfoSchema)()),
        output_style: v4_1.z.string(),
        available_output_styles: v4_1.z.array(v4_1.z.string()),
        models: v4_1.z.array((0, coreSchemas_js_1.ModelInfoSchema)()),
        account: (0, coreSchemas_js_1.AccountInfoSchema)(),
        pid: v4_1.z
            .number()
            .optional()
            .describe('@internal CLI process PID for tmux socket isolation'),
        fast_mode_state: (0, coreSchemas_js_1.FastModeStateSchema)().optional(),
    })
        .describe('Response from session initialization with available commands, models, and account info.');
});
exports.SDKControlInterruptRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('interrupt'),
    })
        .describe('Interrupts the currently running conversation turn.');
});
exports.SDKControlPermissionRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('can_use_tool'),
        tool_name: v4_1.z.string(),
        input: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()),
        permission_suggestions: v4_1.z.array((0, coreSchemas_js_1.PermissionUpdateSchema)()).optional(),
        blocked_path: v4_1.z.string().optional(),
        decision_reason: v4_1.z.string().optional(),
        title: v4_1.z.string().optional(),
        display_name: v4_1.z.string().optional(),
        tool_use_id: v4_1.z.string(),
        agent_id: v4_1.z.string().optional(),
        description: v4_1.z.string().optional(),
    })
        .describe('Requests permission to use a tool with the given input.');
});
exports.SDKControlSetPermissionModeRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('set_permission_mode'),
        mode: (0, coreSchemas_js_1.PermissionModeSchema)(),
        ultraplan: v4_1.z
            .boolean()
            .optional()
            .describe('@internal CCR ultraplan session marker.'),
    })
        .describe('Sets the permission mode for tool execution handling.');
});
exports.SDKControlSetModelRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('set_model'),
        model: v4_1.z.string().optional(),
    })
        .describe('Sets the model to use for subsequent conversation turns.');
});
exports.SDKControlSetMaxThinkingTokensRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('set_max_thinking_tokens'),
        max_thinking_tokens: v4_1.z.number().nullable(),
    })
        .describe('Sets the maximum number of thinking tokens for extended thinking.');
});
exports.SDKControlMcpStatusRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('mcp_status'),
    })
        .describe('Requests the current status of all MCP server connections.');
});
exports.SDKControlMcpStatusResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        mcpServers: v4_1.z.array((0, coreSchemas_js_1.McpServerStatusSchema)()),
    })
        .describe('Response containing the current status of all MCP server connections.');
});
exports.SDKControlGetContextUsageRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('get_context_usage'),
    })
        .describe('Requests a breakdown of current context window usage by category.');
});
var ContextCategorySchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        name: v4_1.z.string(),
        tokens: v4_1.z.number(),
        color: v4_1.z.string(),
        isDeferred: v4_1.z.boolean().optional(),
    });
});
var ContextGridSquareSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        color: v4_1.z.string(),
        isFilled: v4_1.z.boolean(),
        categoryName: v4_1.z.string(),
        tokens: v4_1.z.number(),
        percentage: v4_1.z.number(),
        squareFullness: v4_1.z.number(),
    });
});
exports.SDKControlGetContextUsageResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        categories: v4_1.z.array(ContextCategorySchema()),
        totalTokens: v4_1.z.number(),
        maxTokens: v4_1.z.number(),
        rawMaxTokens: v4_1.z.number(),
        percentage: v4_1.z.number(),
        gridRows: v4_1.z.array(v4_1.z.array(ContextGridSquareSchema())),
        model: v4_1.z.string(),
        memoryFiles: v4_1.z.array(v4_1.z.object({
            path: v4_1.z.string(),
            type: v4_1.z.string(),
            tokens: v4_1.z.number(),
        })),
        mcpTools: v4_1.z.array(v4_1.z.object({
            name: v4_1.z.string(),
            serverName: v4_1.z.string(),
            tokens: v4_1.z.number(),
            isLoaded: v4_1.z.boolean().optional(),
        })),
        deferredBuiltinTools: v4_1.z
            .array(v4_1.z.object({
            name: v4_1.z.string(),
            tokens: v4_1.z.number(),
            isLoaded: v4_1.z.boolean(),
        }))
            .optional(),
        systemTools: v4_1.z
            .array(v4_1.z.object({ name: v4_1.z.string(), tokens: v4_1.z.number() }))
            .optional(),
        systemPromptSections: v4_1.z
            .array(v4_1.z.object({ name: v4_1.z.string(), tokens: v4_1.z.number() }))
            .optional(),
        agents: v4_1.z.array(v4_1.z.object({
            agentType: v4_1.z.string(),
            source: v4_1.z.string(),
            tokens: v4_1.z.number(),
        })),
        slashCommands: v4_1.z
            .object({
            totalCommands: v4_1.z.number(),
            includedCommands: v4_1.z.number(),
            tokens: v4_1.z.number(),
        })
            .optional(),
        skills: v4_1.z
            .object({
            totalSkills: v4_1.z.number(),
            includedSkills: v4_1.z.number(),
            tokens: v4_1.z.number(),
            skillFrontmatter: v4_1.z.array(v4_1.z.object({
                name: v4_1.z.string(),
                source: v4_1.z.string(),
                tokens: v4_1.z.number(),
            })),
        })
            .optional(),
        autoCompactThreshold: v4_1.z.number().optional(),
        isAutoCompactEnabled: v4_1.z.boolean(),
        messageBreakdown: v4_1.z
            .object({
            toolCallTokens: v4_1.z.number(),
            toolResultTokens: v4_1.z.number(),
            attachmentTokens: v4_1.z.number(),
            assistantMessageTokens: v4_1.z.number(),
            userMessageTokens: v4_1.z.number(),
            toolCallsByType: v4_1.z.array(v4_1.z.object({
                name: v4_1.z.string(),
                callTokens: v4_1.z.number(),
                resultTokens: v4_1.z.number(),
            })),
            attachmentsByType: v4_1.z.array(v4_1.z.object({ name: v4_1.z.string(), tokens: v4_1.z.number() })),
        })
            .optional(),
        apiUsage: v4_1.z
            .object({
            input_tokens: v4_1.z.number(),
            output_tokens: v4_1.z.number(),
            cache_creation_input_tokens: v4_1.z.number(),
            cache_read_input_tokens: v4_1.z.number(),
        })
            .nullable(),
    })
        .describe('Breakdown of current context window usage by category (system prompt, tools, messages, etc.).');
});
exports.SDKControlRewindFilesRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('rewind_files'),
        user_message_id: v4_1.z.string(),
        dry_run: v4_1.z.boolean().optional(),
    })
        .describe('Rewinds file changes made since a specific user message.');
});
exports.SDKControlRewindFilesResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        canRewind: v4_1.z.boolean(),
        error: v4_1.z.string().optional(),
        filesChanged: v4_1.z.array(v4_1.z.string()).optional(),
        insertions: v4_1.z.number().optional(),
        deletions: v4_1.z.number().optional(),
    })
        .describe('Result of a rewindFiles operation.');
});
exports.SDKControlCancelAsyncMessageRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('cancel_async_message'),
        message_uuid: v4_1.z.string(),
    })
        .describe('Drops a pending async user message from the command queue by uuid. No-op if already dequeued for execution.');
});
exports.SDKControlCancelAsyncMessageResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        cancelled: v4_1.z.boolean(),
    })
        .describe('Result of a cancel_async_message operation. cancelled=false means the message was not in the queue (already dequeued or never enqueued).');
});
exports.SDKControlSeedReadStateRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('seed_read_state'),
        path: v4_1.z.string(),
        mtime: v4_1.z.number(),
    })
        .describe('Seeds the readFileState cache with a path+mtime entry. Use when a prior Read was removed from context (e.g. by snip) so Edit validation would fail despite the client having observed the Read. The mtime lets the CLI detect if the file changed since the seeded Read — same staleness check as the normal path.');
});
exports.SDKHookCallbackRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('hook_callback'),
        callback_id: v4_1.z.string(),
        input: (0, coreSchemas_js_1.HookInputSchema)(),
        tool_use_id: v4_1.z.string().optional(),
    })
        .describe('Delivers a hook callback with its input data.');
});
exports.SDKControlMcpMessageRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('mcp_message'),
        server_name: v4_1.z.string(),
        message: (0, exports.JSONRPCMessagePlaceholder)(),
    })
        .describe('Sends a JSON-RPC message to a specific MCP server.');
});
exports.SDKControlMcpSetServersRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('mcp_set_servers'),
        servers: v4_1.z.record(v4_1.z.string(), (0, coreSchemas_js_1.McpServerConfigForProcessTransportSchema)()),
    })
        .describe('Replaces the set of dynamically managed MCP servers.');
});
exports.SDKControlMcpSetServersResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        added: v4_1.z.array(v4_1.z.string()),
        removed: v4_1.z.array(v4_1.z.string()),
        errors: v4_1.z.record(v4_1.z.string(), v4_1.z.string()),
    })
        .describe('Result of replacing the set of dynamically managed MCP servers.');
});
exports.SDKControlReloadPluginsRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('reload_plugins'),
    })
        .describe('Reloads plugins from disk and returns the refreshed session components.');
});
exports.SDKControlReloadPluginsResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        commands: v4_1.z.array((0, coreSchemas_js_1.SlashCommandSchema)()),
        agents: v4_1.z.array((0, coreSchemas_js_1.AgentInfoSchema)()),
        plugins: v4_1.z.array(v4_1.z.object({
            name: v4_1.z.string(),
            path: v4_1.z.string(),
            source: v4_1.z.string().optional(),
        })),
        mcpServers: v4_1.z.array((0, coreSchemas_js_1.McpServerStatusSchema)()),
        error_count: v4_1.z.number(),
    })
        .describe('Refreshed commands, agents, plugins, and MCP server status after reload.');
});
exports.SDKControlMcpReconnectRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('mcp_reconnect'),
        serverName: v4_1.z.string(),
    })
        .describe('Reconnects a disconnected or failed MCP server.');
});
exports.SDKControlMcpToggleRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('mcp_toggle'),
        serverName: v4_1.z.string(),
        enabled: v4_1.z.boolean(),
    })
        .describe('Enables or disables an MCP server.');
});
exports.SDKControlStopTaskRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('stop_task'),
        task_id: v4_1.z.string(),
    })
        .describe('Stops a running task.');
});
exports.SDKControlApplyFlagSettingsRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('apply_flag_settings'),
        settings: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()),
    })
        .describe('Merges the provided settings into the flag settings layer, updating the active configuration.');
});
exports.SDKControlGetSettingsRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('get_settings'),
    })
        .describe('Returns the effective merged settings and the raw per-source settings.');
});
exports.SDKControlGetSettingsResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        effective: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()),
        sources: v4_1.z
            .array(v4_1.z.object({
            source: v4_1.z.enum([
                'userSettings',
                'projectSettings',
                'localSettings',
                'flagSettings',
                'policySettings',
            ]),
            settings: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()),
        }))
            .describe('Ordered low-to-high priority — later entries override earlier ones.'),
        applied: v4_1.z
            .object({
            model: v4_1.z.string(),
            // String levels only — numeric effort is ant-only and the
            // Zod→proto generator can't emit enum∪number unions.
            effort: v4_1.z.enum(['low', 'medium', 'high', 'max']).nullable(),
        })
            .optional()
            .describe('Runtime-resolved values after env overrides, session state, and model-specific defaults are applied. Unlike `effective` (disk merge), these reflect what will actually be sent to the API.'),
    })
        .describe('Effective merged settings plus raw per-source settings in merge order.');
});
exports.SDKControlElicitationRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        subtype: v4_1.z.literal('elicitation'),
        mcp_server_name: v4_1.z.string(),
        message: v4_1.z.string(),
        mode: v4_1.z.enum(['form', 'url']).optional(),
        url: v4_1.z.string().optional(),
        elicitation_id: v4_1.z.string().optional(),
        requested_schema: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
    })
        .describe('Requests the SDK consumer to handle an MCP elicitation (user input request).');
});
exports.SDKControlElicitationResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        action: v4_1.z.enum(['accept', 'decline', 'cancel']),
        content: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
    })
        .describe('Response from the SDK consumer for an elicitation request.');
});
// ============================================================================
// Control Request/Response Wrappers
// ============================================================================
exports.SDKControlRequestInnerSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        (0, exports.SDKControlInterruptRequestSchema)(),
        (0, exports.SDKControlPermissionRequestSchema)(),
        (0, exports.SDKControlInitializeRequestSchema)(),
        (0, exports.SDKControlSetPermissionModeRequestSchema)(),
        (0, exports.SDKControlSetModelRequestSchema)(),
        (0, exports.SDKControlSetMaxThinkingTokensRequestSchema)(),
        (0, exports.SDKControlMcpStatusRequestSchema)(),
        (0, exports.SDKControlGetContextUsageRequestSchema)(),
        (0, exports.SDKHookCallbackRequestSchema)(),
        (0, exports.SDKControlMcpMessageRequestSchema)(),
        (0, exports.SDKControlRewindFilesRequestSchema)(),
        (0, exports.SDKControlCancelAsyncMessageRequestSchema)(),
        (0, exports.SDKControlSeedReadStateRequestSchema)(),
        (0, exports.SDKControlMcpSetServersRequestSchema)(),
        (0, exports.SDKControlReloadPluginsRequestSchema)(),
        (0, exports.SDKControlMcpReconnectRequestSchema)(),
        (0, exports.SDKControlMcpToggleRequestSchema)(),
        (0, exports.SDKControlStopTaskRequestSchema)(),
        (0, exports.SDKControlApplyFlagSettingsRequestSchema)(),
        (0, exports.SDKControlGetSettingsRequestSchema)(),
        (0, exports.SDKControlElicitationRequestSchema)(),
    ]);
});
exports.SDKControlRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('control_request'),
        request_id: v4_1.z.string(),
        request: (0, exports.SDKControlRequestInnerSchema)(),
    });
});
exports.ControlResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        subtype: v4_1.z.literal('success'),
        request_id: v4_1.z.string(),
        response: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
    });
});
exports.ControlErrorResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        subtype: v4_1.z.literal('error'),
        request_id: v4_1.z.string(),
        error: v4_1.z.string(),
        pending_permission_requests: v4_1.z
            .array(v4_1.z.lazy(function () { return (0, exports.SDKControlRequestSchema)(); }))
            .optional(),
    });
});
exports.SDKControlResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('control_response'),
        response: v4_1.z.union([(0, exports.ControlResponseSchema)(), (0, exports.ControlErrorResponseSchema)()]),
    });
});
exports.SDKControlCancelRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('control_cancel_request'),
        request_id: v4_1.z.string(),
    })
        .describe('Cancels a currently open control request.');
});
exports.SDKKeepAliveMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('keep_alive'),
    })
        .describe('Keep-alive message to maintain WebSocket connection.');
});
exports.SDKUpdateEnvironmentVariablesMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('update_environment_variables'),
        variables: v4_1.z.record(v4_1.z.string(), v4_1.z.string()),
    })
        .describe('Updates environment variables at runtime.');
});
// ============================================================================
// Aggregate Message Types
// ============================================================================
exports.StdoutMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        (0, coreSchemas_js_1.SDKMessageSchema)(),
        (0, coreSchemas_js_1.SDKStreamlinedTextMessageSchema)(),
        (0, coreSchemas_js_1.SDKStreamlinedToolUseSummaryMessageSchema)(),
        (0, coreSchemas_js_1.SDKPostTurnSummaryMessageSchema)(),
        (0, exports.SDKControlResponseSchema)(),
        (0, exports.SDKControlRequestSchema)(),
        (0, exports.SDKControlCancelRequestSchema)(),
        (0, exports.SDKKeepAliveMessageSchema)(),
    ]);
});
exports.StdinMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        (0, coreSchemas_js_1.SDKUserMessageSchema)(),
        (0, exports.SDKControlRequestSchema)(),
        (0, exports.SDKControlResponseSchema)(),
        (0, exports.SDKKeepAliveMessageSchema)(),
        (0, exports.SDKUpdateEnvironmentVariablesMessageSchema)(),
    ]);
});
