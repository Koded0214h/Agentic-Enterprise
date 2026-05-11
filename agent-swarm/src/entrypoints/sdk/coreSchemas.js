"use strict";
/**
 * SDK Core Schemas - Zod schemas for serializable SDK data types.
 *
 * These schemas are the single source of truth for SDK data types.
 * TypeScript types are generated from these schemas and committed for IDE support.
 *
 * @see scripts/generate-sdk-types.ts for type generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElicitationHookInputSchema = exports.TaskCompletedHookInputSchema = exports.TaskCreatedHookInputSchema = exports.TeammateIdleHookInputSchema = exports.PostCompactHookInputSchema = exports.PreCompactHookInputSchema = exports.SubagentStopHookInputSchema = exports.SubagentStartHookInputSchema = exports.StopFailureHookInputSchema = exports.StopHookInputSchema = exports.SetupHookInputSchema = exports.SessionStartHookInputSchema = exports.UserPromptSubmitHookInputSchema = exports.NotificationHookInputSchema = exports.PermissionDeniedHookInputSchema = exports.PostToolUseFailureHookInputSchema = exports.PostToolUseHookInputSchema = exports.PermissionRequestHookInputSchema = exports.PreToolUseHookInputSchema = exports.BaseHookInputSchema = exports.HookEventSchema = exports.HOOK_EVENTS = exports.PermissionModeSchema = exports.PermissionResultSchema = exports.PermissionDecisionClassificationSchema = exports.PermissionUpdateSchema = exports.PermissionRuleValueSchema = exports.PermissionBehaviorSchema = exports.PermissionUpdateDestinationSchema = exports.McpSetServersResultSchema = exports.McpServerStatusSchema = exports.McpServerStatusConfigSchema = exports.McpClaudeAIProxyServerConfigSchema = exports.McpServerConfigForProcessTransportSchema = exports.McpSdkServerConfigSchema = exports.McpHttpServerConfigSchema = exports.McpSSEServerConfigSchema = exports.McpStdioServerConfigSchema = exports.ThinkingConfigSchema = exports.ThinkingDisabledSchema = exports.ThinkingEnabledSchema = exports.ThinkingAdaptiveSchema = exports.SdkBetaSchema = exports.ConfigScopeSchema = exports.ApiKeySourceSchema = exports.OutputFormatSchema = exports.JsonSchemaOutputFormatSchema = exports.BaseOutputFormatSchema = exports.OutputFormatTypeSchema = exports.ModelUsageSchema = void 0;
exports.SDKAssistantMessageErrorSchema = exports.NonNullableUsagePlaceholder = exports.UUIDPlaceholder = exports.RawMessageStreamEventPlaceholder = exports.APIAssistantMessagePlaceholder = exports.APIUserMessagePlaceholder = exports.RewindFilesResultSchema = exports.SdkPluginConfigSchema = exports.SettingSourceSchema = exports.AgentDefinitionSchema = exports.AgentMcpServerSpecSchema = exports.AccountInfoSchema = exports.ModelInfoSchema = exports.AgentInfoSchema = exports.SlashCommandSchema = exports.PromptResponseSchema = exports.PromptRequestSchema = exports.PromptRequestOptionSchema = exports.HookJSONOutputSchema = exports.WorktreeCreateHookSpecificOutputSchema = exports.ElicitationResultHookSpecificOutputSchema = exports.ElicitationHookSpecificOutputSchema = exports.SyncHookJSONOutputSchema = exports.FileChangedHookSpecificOutputSchema = exports.CwdChangedHookSpecificOutputSchema = exports.PermissionRequestHookSpecificOutputSchema = exports.NotificationHookSpecificOutputSchema = exports.PermissionDeniedHookSpecificOutputSchema = exports.PostToolUseFailureHookSpecificOutputSchema = exports.PostToolUseHookSpecificOutputSchema = exports.SubagentStartHookSpecificOutputSchema = exports.SetupHookSpecificOutputSchema = exports.SessionStartHookSpecificOutputSchema = exports.UserPromptSubmitHookSpecificOutputSchema = exports.PreToolUseHookSpecificOutputSchema = exports.AsyncHookJSONOutputSchema = exports.HookInputSchema = exports.SessionEndHookInputSchema = exports.ExitReasonSchema = exports.EXIT_REASONS = exports.FileChangedHookInputSchema = exports.CwdChangedHookInputSchema = exports.WorktreeRemoveHookInputSchema = exports.WorktreeCreateHookInputSchema = exports.InstructionsLoadedHookInputSchema = exports.INSTRUCTIONS_MEMORY_TYPES = exports.INSTRUCTIONS_LOAD_REASONS = exports.ConfigChangeHookInputSchema = exports.CONFIG_CHANGE_SOURCES = exports.ElicitationResultHookInputSchema = void 0;
exports.FastModeStateSchema = exports.SDKMessageSchema = exports.SDKSessionInfoSchema = exports.SDKPromptSuggestionMessageSchema = exports.SDKElicitationCompleteMessageSchema = exports.SDKToolUseSummaryMessageSchema = exports.SDKTaskProgressMessageSchema = exports.SDKSessionStateChangedMessageSchema = exports.SDKTaskStartedMessageSchema = exports.SDKTaskNotificationMessageSchema = exports.SDKFilesPersistedEventSchema = exports.SDKAuthStatusMessageSchema = exports.SDKToolProgressMessageSchema = exports.SDKHookResponseMessageSchema = exports.SDKHookProgressMessageSchema = exports.SDKHookStartedMessageSchema = exports.SDKLocalCommandOutputMessageSchema = exports.SDKAPIRetryMessageSchema = exports.SDKPostTurnSummaryMessageSchema = exports.SDKStatusMessageSchema = exports.SDKCompactBoundaryMessageSchema = exports.SDKPartialAssistantMessageSchema = exports.SDKSystemMessageSchema = exports.SDKResultMessageSchema = exports.SDKResultErrorSchema = exports.SDKResultSuccessSchema = exports.SDKPermissionDenialSchema = exports.SDKStreamlinedToolUseSummaryMessageSchema = exports.SDKStreamlinedTextMessageSchema = exports.SDKRateLimitEventSchema = exports.SDKAssistantMessageSchema = exports.SDKRateLimitInfoSchema = exports.SDKUserMessageReplaySchema = exports.SDKUserMessageSchema = exports.SDKStatusSchema = void 0;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
// ============================================================================
// Usage & Model Types
// ============================================================================
exports.ModelUsageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        inputTokens: v4_1.z.number(),
        outputTokens: v4_1.z.number(),
        cacheReadInputTokens: v4_1.z.number(),
        cacheCreationInputTokens: v4_1.z.number(),
        webSearchRequests: v4_1.z.number(),
        costUSD: v4_1.z.number(),
        contextWindow: v4_1.z.number(),
        maxOutputTokens: v4_1.z.number(),
    });
});
// ============================================================================
// Output Format Types
// ============================================================================
exports.OutputFormatTypeSchema = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.literal('json_schema'); });
exports.BaseOutputFormatSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: (0, exports.OutputFormatTypeSchema)(),
    });
});
exports.JsonSchemaOutputFormatSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('json_schema'),
        schema: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()),
    });
});
exports.OutputFormatSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.JsonSchemaOutputFormatSchema)();
});
// ============================================================================
// Config Types
// ============================================================================
exports.ApiKeySourceSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.enum(['user', 'project', 'org', 'temporary', 'oauth']);
});
exports.ConfigScopeSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.enum(['local', 'user', 'project']).describe('Config scope for settings.');
});
exports.SdkBetaSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.literal('context-1m-2025-08-07');
});
exports.ThinkingAdaptiveSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('adaptive'),
    })
        .describe('Claude decides when and how much to think (Opus 4.6+).');
});
exports.ThinkingEnabledSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('enabled'),
        budgetTokens: v4_1.z.number().optional(),
    })
        .describe('Fixed thinking token budget (older models)');
});
exports.ThinkingDisabledSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('disabled'),
    })
        .describe('No extended thinking');
});
exports.ThinkingConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .union([
        (0, exports.ThinkingAdaptiveSchema)(),
        (0, exports.ThinkingEnabledSchema)(),
        (0, exports.ThinkingDisabledSchema)(),
    ])
        .describe("Controls Claude's thinking/reasoning behavior. When set, takes precedence over the deprecated maxThinkingTokens.");
});
// ============================================================================
// MCP Server Config Types (serializable only)
// ============================================================================
exports.McpStdioServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('stdio').optional(), // Optional for backwards compatibility
        command: v4_1.z.string(),
        args: v4_1.z.array(v4_1.z.string()).optional(),
        env: v4_1.z.record(v4_1.z.string(), v4_1.z.string()).optional(),
    });
});
exports.McpSSEServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('sse'),
        url: v4_1.z.string(),
        headers: v4_1.z.record(v4_1.z.string(), v4_1.z.string()).optional(),
    });
});
exports.McpHttpServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('http'),
        url: v4_1.z.string(),
        headers: v4_1.z.record(v4_1.z.string(), v4_1.z.string()).optional(),
    });
});
exports.McpSdkServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('sdk'),
        name: v4_1.z.string(),
    });
});
exports.McpServerConfigForProcessTransportSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        (0, exports.McpStdioServerConfigSchema)(),
        (0, exports.McpSSEServerConfigSchema)(),
        (0, exports.McpHttpServerConfigSchema)(),
        (0, exports.McpSdkServerConfigSchema)(),
    ]);
});
exports.McpClaudeAIProxyServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('claudeai-proxy'),
        url: v4_1.z.string(),
        id: v4_1.z.string(),
    });
});
// Broader config type for status responses (includes claudeai-proxy which is output-only)
exports.McpServerStatusConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        (0, exports.McpServerConfigForProcessTransportSchema)(),
        (0, exports.McpClaudeAIProxyServerConfigSchema)(),
    ]);
});
exports.McpServerStatusSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        name: v4_1.z.string().describe('Server name as configured'),
        status: v4_1.z
            .enum(['connected', 'failed', 'needs-auth', 'pending', 'disabled'])
            .describe('Current connection status'),
        serverInfo: v4_1.z
            .object({
            name: v4_1.z.string(),
            version: v4_1.z.string(),
        })
            .optional()
            .describe('Server information (available when connected)'),
        error: v4_1.z
            .string()
            .optional()
            .describe("Error message (available when status is 'failed')"),
        config: (0, exports.McpServerStatusConfigSchema)()
            .optional()
            .describe('Server configuration (includes URL for HTTP/SSE servers)'),
        scope: v4_1.z
            .string()
            .optional()
            .describe('Configuration scope (e.g., project, user, local, claudeai, managed)'),
        tools: v4_1.z
            .array(v4_1.z.object({
            name: v4_1.z.string(),
            description: v4_1.z.string().optional(),
            annotations: v4_1.z
                .object({
                readOnly: v4_1.z.boolean().optional(),
                destructive: v4_1.z.boolean().optional(),
                openWorld: v4_1.z.boolean().optional(),
            })
                .optional(),
        }))
            .optional()
            .describe('Tools provided by this server (available when connected)'),
        capabilities: v4_1.z
            .object({
            experimental: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
        })
            .optional()
            .describe("@internal Server capabilities (available when connected). experimental['claude/channel'] is only present if the server's plugin is on the approved channels allowlist — use its presence to decide whether to show an Enable-channel prompt."),
    })
        .describe('Status information for an MCP server connection.');
});
exports.McpSetServersResultSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        added: v4_1.z.array(v4_1.z.string()).describe('Names of servers that were added'),
        removed: v4_1.z
            .array(v4_1.z.string())
            .describe('Names of servers that were removed'),
        errors: v4_1.z
            .record(v4_1.z.string(), v4_1.z.string())
            .describe('Map of server names to error messages for servers that failed to connect'),
    })
        .describe('Result of a setMcpServers operation.');
});
// ============================================================================
// Permission Types
// ============================================================================
exports.PermissionUpdateDestinationSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.enum([
        'userSettings',
        'projectSettings',
        'localSettings',
        'session',
        'cliArg',
    ]);
});
exports.PermissionBehaviorSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.enum(['allow', 'deny', 'ask']);
});
exports.PermissionRuleValueSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        toolName: v4_1.z.string(),
        ruleContent: v4_1.z.string().optional(),
    });
});
exports.PermissionUpdateSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.discriminatedUnion('type', [
        v4_1.z.object({
            type: v4_1.z.literal('addRules'),
            rules: v4_1.z.array((0, exports.PermissionRuleValueSchema)()),
            behavior: (0, exports.PermissionBehaviorSchema)(),
            destination: (0, exports.PermissionUpdateDestinationSchema)(),
        }),
        v4_1.z.object({
            type: v4_1.z.literal('replaceRules'),
            rules: v4_1.z.array((0, exports.PermissionRuleValueSchema)()),
            behavior: (0, exports.PermissionBehaviorSchema)(),
            destination: (0, exports.PermissionUpdateDestinationSchema)(),
        }),
        v4_1.z.object({
            type: v4_1.z.literal('removeRules'),
            rules: v4_1.z.array((0, exports.PermissionRuleValueSchema)()),
            behavior: (0, exports.PermissionBehaviorSchema)(),
            destination: (0, exports.PermissionUpdateDestinationSchema)(),
        }),
        v4_1.z.object({
            type: v4_1.z.literal('setMode'),
            mode: v4_1.z.lazy(function () { return (0, exports.PermissionModeSchema)(); }),
            destination: (0, exports.PermissionUpdateDestinationSchema)(),
        }),
        v4_1.z.object({
            type: v4_1.z.literal('addDirectories'),
            directories: v4_1.z.array(v4_1.z.string()),
            destination: (0, exports.PermissionUpdateDestinationSchema)(),
        }),
        v4_1.z.object({
            type: v4_1.z.literal('removeDirectories'),
            directories: v4_1.z.array(v4_1.z.string()),
            destination: (0, exports.PermissionUpdateDestinationSchema)(),
        }),
    ]);
});
exports.PermissionDecisionClassificationSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .enum(['user_temporary', 'user_permanent', 'user_reject'])
        .describe('Classification of this permission decision for telemetry. SDK hosts ' +
        'that prompt users (desktop apps, IDEs) should set this to reflect ' +
        'what actually happened: user_temporary for allow-once, user_permanent ' +
        'for always-allow (both the click and later cache hits), user_reject ' +
        'for deny. If unset, the CLI infers conservatively (temporary for ' +
        'allow, reject for deny). The vocabulary matches tool_decision OTel ' +
        'events (monitoring-usage docs).');
});
exports.PermissionResultSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        v4_1.z.object({
            behavior: v4_1.z.literal('allow'),
            // Optional - may not be provided if hook sets permission without input modification
            updatedInput: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
            updatedPermissions: v4_1.z.array((0, exports.PermissionUpdateSchema)()).optional(),
            toolUseID: v4_1.z.string().optional(),
            decisionClassification: (0, exports.PermissionDecisionClassificationSchema)().optional(),
        }),
        v4_1.z.object({
            behavior: v4_1.z.literal('deny'),
            message: v4_1.z.string(),
            interrupt: v4_1.z.boolean().optional(),
            toolUseID: v4_1.z.string().optional(),
            decisionClassification: (0, exports.PermissionDecisionClassificationSchema)().optional(),
        }),
    ]);
});
exports.PermissionModeSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .enum(['default', 'acceptEdits', 'bypassPermissions', 'plan', 'dontAsk'])
        .describe('Permission mode for controlling how tool executions are handled. ' +
        "'default' - Standard behavior, prompts for dangerous operations. " +
        "'acceptEdits' - Auto-accept file edit operations. " +
        "'bypassPermissions' - Bypass all permission checks (requires allowDangerouslySkipPermissions). " +
        "'plan' - Planning mode, no actual tool execution. " +
        "'dontAsk' - Don't prompt for permissions, deny if not pre-approved.");
});
// ============================================================================
// Hook Types
// ============================================================================
exports.HOOK_EVENTS = [
    'PreToolUse',
    'PostToolUse',
    'PostToolUseFailure',
    'Notification',
    'UserPromptSubmit',
    'SessionStart',
    'SessionEnd',
    'Stop',
    'StopFailure',
    'SubagentStart',
    'SubagentStop',
    'PreCompact',
    'PostCompact',
    'PermissionRequest',
    'PermissionDenied',
    'Setup',
    'TeammateIdle',
    'TaskCreated',
    'TaskCompleted',
    'Elicitation',
    'ElicitationResult',
    'ConfigChange',
    'WorktreeCreate',
    'WorktreeRemove',
    'InstructionsLoaded',
    'CwdChanged',
    'FileChanged',
];
exports.HookEventSchema = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.enum(exports.HOOK_EVENTS); });
exports.BaseHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        session_id: v4_1.z.string(),
        transcript_path: v4_1.z.string(),
        cwd: v4_1.z.string(),
        permission_mode: v4_1.z.string().optional(),
        agent_id: v4_1.z
            .string()
            .optional()
            .describe('Subagent identifier. Present only when the hook fires from within a subagent ' +
            '(e.g., a tool called by an AgentTool worker). Absent for the main thread, ' +
            'even in --agent sessions. Use this field (not agent_type) to distinguish ' +
            'subagent calls from main-thread calls.'),
        agent_type: v4_1.z
            .string()
            .optional()
            .describe('Agent type name (e.g., "general-purpose", "code-reviewer"). Present when the ' +
            'hook fires from within a subagent (alongside agent_id), or on the main thread ' +
            'of a session started with --agent (without agent_id).'),
    });
});
// Use .and() instead of .extend() to preserve BaseHookInput & {...} in generated types
exports.PreToolUseHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('PreToolUse'),
        tool_name: v4_1.z.string(),
        tool_input: v4_1.z.unknown(),
        tool_use_id: v4_1.z.string(),
    }));
});
exports.PermissionRequestHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('PermissionRequest'),
        tool_name: v4_1.z.string(),
        tool_input: v4_1.z.unknown(),
        permission_suggestions: v4_1.z.array((0, exports.PermissionUpdateSchema)()).optional(),
    }));
});
exports.PostToolUseHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('PostToolUse'),
        tool_name: v4_1.z.string(),
        tool_input: v4_1.z.unknown(),
        tool_response: v4_1.z.unknown(),
        tool_use_id: v4_1.z.string(),
    }));
});
exports.PostToolUseFailureHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('PostToolUseFailure'),
        tool_name: v4_1.z.string(),
        tool_input: v4_1.z.unknown(),
        tool_use_id: v4_1.z.string(),
        error: v4_1.z.string(),
        is_interrupt: v4_1.z.boolean().optional(),
    }));
});
exports.PermissionDeniedHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('PermissionDenied'),
        tool_name: v4_1.z.string(),
        tool_input: v4_1.z.unknown(),
        tool_use_id: v4_1.z.string(),
        reason: v4_1.z.string(),
    }));
});
exports.NotificationHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('Notification'),
        message: v4_1.z.string(),
        title: v4_1.z.string().optional(),
        notification_type: v4_1.z.string(),
    }));
});
exports.UserPromptSubmitHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('UserPromptSubmit'),
        prompt: v4_1.z.string(),
    }));
});
exports.SessionStartHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('SessionStart'),
        source: v4_1.z.enum(['startup', 'resume', 'clear', 'compact']),
        agent_type: v4_1.z.string().optional(),
        model: v4_1.z.string().optional(),
    }));
});
exports.SetupHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('Setup'),
        trigger: v4_1.z.enum(['init', 'maintenance']),
    }));
});
exports.StopHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('Stop'),
        stop_hook_active: v4_1.z.boolean(),
        last_assistant_message: v4_1.z
            .string()
            .optional()
            .describe('Text content of the last assistant message before stopping. ' +
            'Avoids the need to read and parse the transcript file.'),
    }));
});
exports.StopFailureHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('StopFailure'),
        error: (0, exports.SDKAssistantMessageErrorSchema)(),
        error_details: v4_1.z.string().optional(),
        last_assistant_message: v4_1.z.string().optional(),
    }));
});
exports.SubagentStartHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('SubagentStart'),
        agent_id: v4_1.z.string(),
        agent_type: v4_1.z.string(),
    }));
});
exports.SubagentStopHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('SubagentStop'),
        stop_hook_active: v4_1.z.boolean(),
        agent_id: v4_1.z.string(),
        agent_transcript_path: v4_1.z.string(),
        agent_type: v4_1.z.string(),
        last_assistant_message: v4_1.z
            .string()
            .optional()
            .describe('Text content of the last assistant message before stopping. ' +
            'Avoids the need to read and parse the transcript file.'),
    }));
});
exports.PreCompactHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('PreCompact'),
        trigger: v4_1.z.enum(['manual', 'auto']),
        custom_instructions: v4_1.z.string().nullable(),
    }));
});
exports.PostCompactHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('PostCompact'),
        trigger: v4_1.z.enum(['manual', 'auto']),
        compact_summary: v4_1.z
            .string()
            .describe('The conversation summary produced by compaction'),
    }));
});
exports.TeammateIdleHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('TeammateIdle'),
        teammate_name: v4_1.z.string(),
        team_name: v4_1.z.string(),
    }));
});
exports.TaskCreatedHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('TaskCreated'),
        task_id: v4_1.z.string(),
        task_subject: v4_1.z.string(),
        task_description: v4_1.z.string().optional(),
        teammate_name: v4_1.z.string().optional(),
        team_name: v4_1.z.string().optional(),
    }));
});
exports.TaskCompletedHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('TaskCompleted'),
        task_id: v4_1.z.string(),
        task_subject: v4_1.z.string(),
        task_description: v4_1.z.string().optional(),
        teammate_name: v4_1.z.string().optional(),
        team_name: v4_1.z.string().optional(),
    }));
});
exports.ElicitationHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)()
        .and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('Elicitation'),
        mcp_server_name: v4_1.z.string(),
        message: v4_1.z.string(),
        mode: v4_1.z.enum(['form', 'url']).optional(),
        url: v4_1.z.string().optional(),
        elicitation_id: v4_1.z.string().optional(),
        requested_schema: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
    }))
        .describe('Hook input for the Elicitation event. Fired when an MCP server requests user input. Hooks can auto-respond (accept/decline) instead of showing the dialog.');
});
exports.ElicitationResultHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)()
        .and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('ElicitationResult'),
        mcp_server_name: v4_1.z.string(),
        elicitation_id: v4_1.z.string().optional(),
        mode: v4_1.z.enum(['form', 'url']).optional(),
        action: v4_1.z.enum(['accept', 'decline', 'cancel']),
        content: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
    }))
        .describe('Hook input for the ElicitationResult event. Fired after the user responds to an MCP elicitation. Hooks can observe or override the response before it is sent to the server.');
});
exports.CONFIG_CHANGE_SOURCES = [
    'user_settings',
    'project_settings',
    'local_settings',
    'policy_settings',
    'skills',
];
exports.ConfigChangeHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('ConfigChange'),
        source: v4_1.z.enum(exports.CONFIG_CHANGE_SOURCES),
        file_path: v4_1.z.string().optional(),
    }));
});
exports.INSTRUCTIONS_LOAD_REASONS = [
    'session_start',
    'nested_traversal',
    'path_glob_match',
    'include',
    'compact',
];
exports.INSTRUCTIONS_MEMORY_TYPES = [
    'User',
    'Project',
    'Local',
    'Managed',
];
exports.InstructionsLoadedHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('InstructionsLoaded'),
        file_path: v4_1.z.string(),
        memory_type: v4_1.z.enum(exports.INSTRUCTIONS_MEMORY_TYPES),
        load_reason: v4_1.z.enum(exports.INSTRUCTIONS_LOAD_REASONS),
        globs: v4_1.z.array(v4_1.z.string()).optional(),
        trigger_file_path: v4_1.z.string().optional(),
        parent_file_path: v4_1.z.string().optional(),
    }));
});
exports.WorktreeCreateHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('WorktreeCreate'),
        name: v4_1.z.string(),
    }));
});
exports.WorktreeRemoveHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('WorktreeRemove'),
        worktree_path: v4_1.z.string(),
    }));
});
exports.CwdChangedHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('CwdChanged'),
        old_cwd: v4_1.z.string(),
        new_cwd: v4_1.z.string(),
    }));
});
exports.FileChangedHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('FileChanged'),
        file_path: v4_1.z.string(),
        event: v4_1.z.enum(['change', 'add', 'unlink']),
    }));
});
exports.EXIT_REASONS = [
    'clear',
    'resume',
    'logout',
    'prompt_input_exit',
    'other',
    'bypass_permissions_disabled',
];
exports.ExitReasonSchema = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.enum(exports.EXIT_REASONS); });
exports.SessionEndHookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.BaseHookInputSchema)().and(v4_1.z.object({
        hook_event_name: v4_1.z.literal('SessionEnd'),
        reason: (0, exports.ExitReasonSchema)(),
    }));
});
exports.HookInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        (0, exports.PreToolUseHookInputSchema)(),
        (0, exports.PostToolUseHookInputSchema)(),
        (0, exports.PostToolUseFailureHookInputSchema)(),
        (0, exports.PermissionDeniedHookInputSchema)(),
        (0, exports.NotificationHookInputSchema)(),
        (0, exports.UserPromptSubmitHookInputSchema)(),
        (0, exports.SessionStartHookInputSchema)(),
        (0, exports.SessionEndHookInputSchema)(),
        (0, exports.StopHookInputSchema)(),
        (0, exports.StopFailureHookInputSchema)(),
        (0, exports.SubagentStartHookInputSchema)(),
        (0, exports.SubagentStopHookInputSchema)(),
        (0, exports.PreCompactHookInputSchema)(),
        (0, exports.PostCompactHookInputSchema)(),
        (0, exports.PermissionRequestHookInputSchema)(),
        (0, exports.SetupHookInputSchema)(),
        (0, exports.TeammateIdleHookInputSchema)(),
        (0, exports.TaskCreatedHookInputSchema)(),
        (0, exports.TaskCompletedHookInputSchema)(),
        (0, exports.ElicitationHookInputSchema)(),
        (0, exports.ElicitationResultHookInputSchema)(),
        (0, exports.ConfigChangeHookInputSchema)(),
        (0, exports.InstructionsLoadedHookInputSchema)(),
        (0, exports.WorktreeCreateHookInputSchema)(),
        (0, exports.WorktreeRemoveHookInputSchema)(),
        (0, exports.CwdChangedHookInputSchema)(),
        (0, exports.FileChangedHookInputSchema)(),
    ]);
});
exports.AsyncHookJSONOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        async: v4_1.z.literal(true),
        asyncTimeout: v4_1.z.number().optional(),
    });
});
exports.PreToolUseHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        hookEventName: v4_1.z.literal('PreToolUse'),
        permissionDecision: (0, exports.PermissionBehaviorSchema)().optional(),
        permissionDecisionReason: v4_1.z.string().optional(),
        updatedInput: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
        additionalContext: v4_1.z.string().optional(),
    });
});
exports.UserPromptSubmitHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        hookEventName: v4_1.z.literal('UserPromptSubmit'),
        additionalContext: v4_1.z.string().optional(),
    });
});
exports.SessionStartHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        hookEventName: v4_1.z.literal('SessionStart'),
        additionalContext: v4_1.z.string().optional(),
        initialUserMessage: v4_1.z.string().optional(),
        watchPaths: v4_1.z.array(v4_1.z.string()).optional(),
    });
});
exports.SetupHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        hookEventName: v4_1.z.literal('Setup'),
        additionalContext: v4_1.z.string().optional(),
    });
});
exports.SubagentStartHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        hookEventName: v4_1.z.literal('SubagentStart'),
        additionalContext: v4_1.z.string().optional(),
    });
});
exports.PostToolUseHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        hookEventName: v4_1.z.literal('PostToolUse'),
        additionalContext: v4_1.z.string().optional(),
        updatedMCPToolOutput: v4_1.z.unknown().optional(),
    });
});
exports.PostToolUseFailureHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        hookEventName: v4_1.z.literal('PostToolUseFailure'),
        additionalContext: v4_1.z.string().optional(),
    });
});
exports.PermissionDeniedHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        hookEventName: v4_1.z.literal('PermissionDenied'),
        retry: v4_1.z.boolean().optional(),
    });
});
exports.NotificationHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        hookEventName: v4_1.z.literal('Notification'),
        additionalContext: v4_1.z.string().optional(),
    });
});
exports.PermissionRequestHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        hookEventName: v4_1.z.literal('PermissionRequest'),
        decision: v4_1.z.union([
            v4_1.z.object({
                behavior: v4_1.z.literal('allow'),
                updatedInput: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
                updatedPermissions: v4_1.z.array((0, exports.PermissionUpdateSchema)()).optional(),
            }),
            v4_1.z.object({
                behavior: v4_1.z.literal('deny'),
                message: v4_1.z.string().optional(),
                interrupt: v4_1.z.boolean().optional(),
            }),
        ]),
    });
});
exports.CwdChangedHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        hookEventName: v4_1.z.literal('CwdChanged'),
        watchPaths: v4_1.z.array(v4_1.z.string()).optional(),
    });
});
exports.FileChangedHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        hookEventName: v4_1.z.literal('FileChanged'),
        watchPaths: v4_1.z.array(v4_1.z.string()).optional(),
    });
});
exports.SyncHookJSONOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        continue: v4_1.z.boolean().optional(),
        suppressOutput: v4_1.z.boolean().optional(),
        stopReason: v4_1.z.string().optional(),
        decision: v4_1.z.enum(['approve', 'block']).optional(),
        systemMessage: v4_1.z.string().optional(),
        reason: v4_1.z.string().optional(),
        hookSpecificOutput: v4_1.z
            .union([
            (0, exports.PreToolUseHookSpecificOutputSchema)(),
            (0, exports.UserPromptSubmitHookSpecificOutputSchema)(),
            (0, exports.SessionStartHookSpecificOutputSchema)(),
            (0, exports.SetupHookSpecificOutputSchema)(),
            (0, exports.SubagentStartHookSpecificOutputSchema)(),
            (0, exports.PostToolUseHookSpecificOutputSchema)(),
            (0, exports.PostToolUseFailureHookSpecificOutputSchema)(),
            (0, exports.PermissionDeniedHookSpecificOutputSchema)(),
            (0, exports.NotificationHookSpecificOutputSchema)(),
            (0, exports.PermissionRequestHookSpecificOutputSchema)(),
            (0, exports.ElicitationHookSpecificOutputSchema)(),
            (0, exports.ElicitationResultHookSpecificOutputSchema)(),
            (0, exports.CwdChangedHookSpecificOutputSchema)(),
            (0, exports.FileChangedHookSpecificOutputSchema)(),
            (0, exports.WorktreeCreateHookSpecificOutputSchema)(),
        ])
            .optional(),
    });
});
exports.ElicitationHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        hookEventName: v4_1.z.literal('Elicitation'),
        action: v4_1.z.enum(['accept', 'decline', 'cancel']).optional(),
        content: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
    })
        .describe('Hook-specific output for the Elicitation event. Return this to programmatically accept or decline an MCP elicitation request.');
});
exports.ElicitationResultHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        hookEventName: v4_1.z.literal('ElicitationResult'),
        action: v4_1.z.enum(['accept', 'decline', 'cancel']).optional(),
        content: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
    })
        .describe('Hook-specific output for the ElicitationResult event. Return this to override the action or content before the response is sent to the MCP server.');
});
exports.WorktreeCreateHookSpecificOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        hookEventName: v4_1.z.literal('WorktreeCreate'),
        worktreePath: v4_1.z.string(),
    })
        .describe('Hook-specific output for the WorktreeCreate event. Provides the absolute path to the created worktree directory. Command hooks print the path on stdout instead.');
});
exports.HookJSONOutputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([(0, exports.AsyncHookJSONOutputSchema)(), (0, exports.SyncHookJSONOutputSchema)()]);
});
exports.PromptRequestOptionSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        key: v4_1.z
            .string()
            .describe('Unique key for this option, returned in the response'),
        label: v4_1.z.string().describe('Display text for this option'),
        description: v4_1.z
            .string()
            .optional()
            .describe('Optional description shown below the label'),
    });
});
exports.PromptRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        prompt: v4_1.z
            .string()
            .describe('Request ID. Presence of this key marks the line as a prompt request.'),
        message: v4_1.z.string().describe('The prompt message to display to the user'),
        options: v4_1.z
            .array((0, exports.PromptRequestOptionSchema)())
            .describe('Available options for the user to choose from'),
    });
});
exports.PromptResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        prompt_response: v4_1.z
            .string()
            .describe('The request ID from the corresponding prompt request'),
        selected: v4_1.z.string().describe('The key of the selected option'),
    });
});
// ============================================================================
// Skill/Command Types
// ============================================================================
exports.SlashCommandSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        name: v4_1.z.string().describe('Skill name (without the leading slash)'),
        description: v4_1.z.string().describe('Description of what the skill does'),
        argumentHint: v4_1.z
            .string()
            .describe('Hint for skill arguments (e.g., "<file>")'),
    })
        .describe('Information about an available skill (invoked via /command syntax).');
});
exports.AgentInfoSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        name: v4_1.z.string().describe('Agent type identifier (e.g., "Explore")'),
        description: v4_1.z.string().describe('Description of when to use this agent'),
        model: v4_1.z
            .string()
            .optional()
            .describe("Model alias this agent uses. If omitted, inherits the parent's model"),
    })
        .describe('Information about an available subagent that can be invoked via the Task tool.');
});
exports.ModelInfoSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        value: v4_1.z.string().describe('Model identifier to use in API calls'),
        displayName: v4_1.z.string().describe('Human-readable display name'),
        description: v4_1.z
            .string()
            .describe("Description of the model's capabilities"),
        supportsEffort: v4_1.z
            .boolean()
            .optional()
            .describe('Whether this model supports effort levels'),
        supportedEffortLevels: v4_1.z
            .array(v4_1.z.enum(['low', 'medium', 'high', 'max']))
            .optional()
            .describe('Available effort levels for this model'),
        supportsAdaptiveThinking: v4_1.z
            .boolean()
            .optional()
            .describe('Whether this model supports adaptive thinking (Claude decides when and how much to think)'),
        supportsFastMode: v4_1.z
            .boolean()
            .optional()
            .describe('Whether this model supports fast mode'),
        supportsAutoMode: v4_1.z
            .boolean()
            .optional()
            .describe('Whether this model supports auto mode'),
    })
        .describe('Information about an available model.');
});
exports.AccountInfoSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        email: v4_1.z.string().optional(),
        organization: v4_1.z.string().optional(),
        subscriptionType: v4_1.z.string().optional(),
        tokenSource: v4_1.z.string().optional(),
        apiKeySource: v4_1.z.string().optional(),
        apiProvider: v4_1.z
            .enum(['firstParty', 'bedrock', 'vertex', 'foundry'])
            .optional()
            .describe('Active API backend. Anthropic OAuth login only applies when "firstParty"; for 3P providers the other fields are absent and auth is external (AWS creds, gcloud ADC, etc.).'),
    })
        .describe("Information about the logged in user's account.");
});
// ============================================================================
// Agent Definition Types
// ============================================================================
exports.AgentMcpServerSpecSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        v4_1.z.string(),
        v4_1.z.record(v4_1.z.string(), (0, exports.McpServerConfigForProcessTransportSchema)()),
    ]);
});
exports.AgentDefinitionSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        description: v4_1.z
            .string()
            .describe('Natural language description of when to use this agent'),
        tools: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Array of allowed tool names. If omitted, inherits all tools from parent'),
        disallowedTools: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Array of tool names to explicitly disallow for this agent'),
        prompt: v4_1.z.string().describe("The agent's system prompt"),
        model: v4_1.z
            .string()
            .optional()
            .describe("Model alias (e.g. 'sonnet', 'opus', 'haiku') or full model ID (e.g. 'claude-opus-4-5'). If omitted or 'inherit', uses the main model"),
        mcpServers: v4_1.z.array((0, exports.AgentMcpServerSpecSchema)()).optional(),
        criticalSystemReminder_EXPERIMENTAL: v4_1.z
            .string()
            .optional()
            .describe('Experimental: Critical reminder added to system prompt'),
        skills: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Array of skill names to preload into the agent context'),
        initialPrompt: v4_1.z
            .string()
            .optional()
            .describe('Auto-submitted as the first user turn when this agent is the main thread agent. Slash commands are processed. Prepended to any user-provided prompt.'),
        maxTurns: v4_1.z
            .number()
            .int()
            .positive()
            .optional()
            .describe('Maximum number of agentic turns (API round-trips) before stopping'),
        background: v4_1.z
            .boolean()
            .optional()
            .describe('Run this agent as a background task (non-blocking, fire-and-forget) when invoked'),
        memory: v4_1.z
            .enum(['user', 'project', 'local'])
            .optional()
            .describe("Scope for auto-loading agent memory files. 'user' - ~/.claude/agent-memory/<agentType>/, 'project' - .claude/agent-memory/<agentType>/, 'local' - .claude/agent-memory-local/<agentType>/"),
        effort: v4_1.z
            .union([v4_1.z.enum(['low', 'medium', 'high', 'max']), v4_1.z.number().int()])
            .optional()
            .describe('Reasoning effort level for this agent. Either a named level or an integer'),
        permissionMode: (0, exports.PermissionModeSchema)()
            .optional()
            .describe('Permission mode controlling how tool executions are handled'),
    })
        .describe('Definition for a custom subagent that can be invoked via the Agent tool.');
});
// ============================================================================
// Settings Types
// ============================================================================
exports.SettingSourceSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .enum(['user', 'project', 'local'])
        .describe('Source for loading filesystem-based settings. ' +
        "'user' - Global user settings (~/.claude/settings.json). " +
        "'project' - Project settings (.claude/settings.json). " +
        "'local' - Local settings (.claude/settings.local.json).");
});
exports.SdkPluginConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z
            .literal('local')
            .describe("Plugin type. Currently only 'local' is supported"),
        path: v4_1.z
            .string()
            .describe('Absolute or relative path to the plugin directory'),
    })
        .describe('Configuration for loading a plugin.');
});
// ============================================================================
// Rewind Types
// ============================================================================
exports.RewindFilesResultSchema = (0, lazySchema_js_1.lazySchema)(function () {
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
// ============================================================================
// External Type Placeholders
// ============================================================================
//
// These schemas use z.unknown() as placeholders for external types.
// The generation script uses TypeOverrideMap to output the correct TS type references.
// This allows us to define SDK message types in Zod while maintaining proper typing.
/** Placeholder for APIUserMessage from @anthropic-ai/sdk */
exports.APIUserMessagePlaceholder = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.unknown(); });
/** Placeholder for APIAssistantMessage from @anthropic-ai/sdk */
exports.APIAssistantMessagePlaceholder = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.unknown(); });
/** Placeholder for RawMessageStreamEvent from @anthropic-ai/sdk */
exports.RawMessageStreamEventPlaceholder = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.unknown(); });
/** Placeholder for UUID from crypto */
exports.UUIDPlaceholder = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.string(); });
/** Placeholder for NonNullableUsage (mapped type over Usage) */
exports.NonNullableUsagePlaceholder = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.unknown(); });
// ============================================================================
// SDK Message Types
// ============================================================================
exports.SDKAssistantMessageErrorSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.enum([
        'authentication_failed',
        'billing_error',
        'rate_limit',
        'invalid_request',
        'server_error',
        'unknown',
        'max_output_tokens',
    ]);
});
exports.SDKStatusSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([v4_1.z.literal('compacting'), v4_1.z.null()]);
});
// SDKUserMessage content without uuid/session_id
var SDKUserMessageContentSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('user'),
        message: (0, exports.APIUserMessagePlaceholder)(),
        parent_tool_use_id: v4_1.z.string().nullable(),
        isSynthetic: v4_1.z.boolean().optional(),
        tool_use_result: v4_1.z.unknown().optional(),
        priority: v4_1.z.enum(['now', 'next', 'later']).optional(),
        timestamp: v4_1.z
            .string()
            .optional()
            .describe('ISO timestamp when the message was created on the originating process. Older emitters omit it; consumers should fall back to receive time.'),
    });
});
exports.SDKUserMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return SDKUserMessageContentSchema().extend({
        uuid: (0, exports.UUIDPlaceholder)().optional(),
        session_id: v4_1.z.string().optional(),
    });
});
exports.SDKUserMessageReplaySchema = (0, lazySchema_js_1.lazySchema)(function () {
    return SDKUserMessageContentSchema().extend({
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
        isReplay: v4_1.z.literal(true),
    });
});
exports.SDKRateLimitInfoSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        status: v4_1.z.enum(['allowed', 'allowed_warning', 'rejected']),
        resetsAt: v4_1.z.number().optional(),
        rateLimitType: v4_1.z
            .enum([
            'five_hour',
            'seven_day',
            'seven_day_opus',
            'seven_day_sonnet',
            'overage',
        ])
            .optional(),
        utilization: v4_1.z.number().optional(),
        overageStatus: v4_1.z
            .enum(['allowed', 'allowed_warning', 'rejected'])
            .optional(),
        overageResetsAt: v4_1.z.number().optional(),
        overageDisabledReason: v4_1.z
            .enum([
            'overage_not_provisioned',
            'org_level_disabled',
            'org_level_disabled_until',
            'out_of_credits',
            'seat_tier_level_disabled',
            'member_level_disabled',
            'seat_tier_zero_credit_limit',
            'group_zero_credit_limit',
            'member_zero_credit_limit',
            'org_service_level_disabled',
            'org_service_zero_credit_limit',
            'no_limits_configured',
            'unknown',
        ])
            .optional(),
        isUsingOverage: v4_1.z.boolean().optional(),
        surpassedThreshold: v4_1.z.number().optional(),
    })
        .describe('Rate limit information for claude.ai subscription users.');
});
exports.SDKAssistantMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('assistant'),
        message: (0, exports.APIAssistantMessagePlaceholder)(),
        parent_tool_use_id: v4_1.z.string().nullable(),
        error: (0, exports.SDKAssistantMessageErrorSchema)().optional(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKRateLimitEventSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('rate_limit_event'),
        rate_limit_info: (0, exports.SDKRateLimitInfoSchema)(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    })
        .describe('Rate limit event emitted when rate limit info changes.');
});
exports.SDKStreamlinedTextMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('streamlined_text'),
        text: v4_1.z
            .string()
            .describe('Text content preserved from the assistant message'),
        session_id: v4_1.z.string(),
        uuid: (0, exports.UUIDPlaceholder)(),
    })
        .describe('@internal Streamlined text message - replaces SDKAssistantMessage in streamlined output. Text content preserved, thinking and tool_use blocks removed.');
});
exports.SDKStreamlinedToolUseSummaryMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('streamlined_tool_use_summary'),
        tool_summary: v4_1.z
            .string()
            .describe('Summary of tool calls (e.g., "Read 2 files, wrote 1 file")'),
        session_id: v4_1.z.string(),
        uuid: (0, exports.UUIDPlaceholder)(),
    })
        .describe('@internal Streamlined tool use summary - replaces tool_use blocks in streamlined output with a cumulative summary string.');
});
exports.SDKPermissionDenialSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        tool_name: v4_1.z.string(),
        tool_use_id: v4_1.z.string(),
        tool_input: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()),
    });
});
exports.SDKResultSuccessSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('result'),
        subtype: v4_1.z.literal('success'),
        duration_ms: v4_1.z.number(),
        duration_api_ms: v4_1.z.number(),
        is_error: v4_1.z.boolean(),
        num_turns: v4_1.z.number(),
        result: v4_1.z.string(),
        stop_reason: v4_1.z.string().nullable(),
        total_cost_usd: v4_1.z.number(),
        usage: (0, exports.NonNullableUsagePlaceholder)(),
        modelUsage: v4_1.z.record(v4_1.z.string(), (0, exports.ModelUsageSchema)()),
        permission_denials: v4_1.z.array((0, exports.SDKPermissionDenialSchema)()),
        structured_output: v4_1.z.unknown().optional(),
        fast_mode_state: (0, exports.FastModeStateSchema)().optional(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKResultErrorSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('result'),
        subtype: v4_1.z.enum([
            'error_during_execution',
            'error_max_turns',
            'error_max_budget_usd',
            'error_max_structured_output_retries',
        ]),
        duration_ms: v4_1.z.number(),
        duration_api_ms: v4_1.z.number(),
        is_error: v4_1.z.boolean(),
        num_turns: v4_1.z.number(),
        stop_reason: v4_1.z.string().nullable(),
        total_cost_usd: v4_1.z.number(),
        usage: (0, exports.NonNullableUsagePlaceholder)(),
        modelUsage: v4_1.z.record(v4_1.z.string(), (0, exports.ModelUsageSchema)()),
        permission_denials: v4_1.z.array((0, exports.SDKPermissionDenialSchema)()),
        errors: v4_1.z.array(v4_1.z.string()),
        fast_mode_state: (0, exports.FastModeStateSchema)().optional(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKResultMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([(0, exports.SDKResultSuccessSchema)(), (0, exports.SDKResultErrorSchema)()]);
});
exports.SDKSystemMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('init'),
        agents: v4_1.z.array(v4_1.z.string()).optional(),
        apiKeySource: (0, exports.ApiKeySourceSchema)(),
        betas: v4_1.z.array(v4_1.z.string()).optional(),
        claude_code_version: v4_1.z.string(),
        cwd: v4_1.z.string(),
        tools: v4_1.z.array(v4_1.z.string()),
        mcp_servers: v4_1.z.array(v4_1.z.object({
            name: v4_1.z.string(),
            status: v4_1.z.string(),
        })),
        model: v4_1.z.string(),
        permissionMode: (0, exports.PermissionModeSchema)(),
        slash_commands: v4_1.z.array(v4_1.z.string()),
        output_style: v4_1.z.string(),
        skills: v4_1.z.array(v4_1.z.string()),
        plugins: v4_1.z.array(v4_1.z.object({
            name: v4_1.z.string(),
            path: v4_1.z.string(),
            source: v4_1.z
                .string()
                .optional()
                .describe('@internal Plugin source identifier in "name\\@marketplace" format. Sentinels: "name\\@inline" for --plugin-dir, "name\\@builtin" for built-in plugins.'),
        })),
        fast_mode_state: (0, exports.FastModeStateSchema)().optional(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKPartialAssistantMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('stream_event'),
        event: (0, exports.RawMessageStreamEventPlaceholder)(),
        parent_tool_use_id: v4_1.z.string().nullable(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKCompactBoundaryMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('compact_boundary'),
        compact_metadata: v4_1.z.object({
            trigger: v4_1.z.enum(['manual', 'auto']),
            pre_tokens: v4_1.z.number(),
            preserved_segment: v4_1.z
                .object({
                head_uuid: (0, exports.UUIDPlaceholder)(),
                anchor_uuid: (0, exports.UUIDPlaceholder)(),
                tail_uuid: (0, exports.UUIDPlaceholder)(),
            })
                .optional()
                .describe('Relink info for messagesToKeep. Loaders splice the preserved ' +
                'segment at anchor_uuid (summary for suffix-preserving, ' +
                'boundary for prefix-preserving partial compact) so resume ' +
                'includes preserved content. Unset when compaction summarizes ' +
                'everything (no messagesToKeep).'),
        }),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKStatusMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('status'),
        status: (0, exports.SDKStatusSchema)(),
        permissionMode: (0, exports.PermissionModeSchema)().optional(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKPostTurnSummaryMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('post_turn_summary'),
        summarizes_uuid: v4_1.z.string(),
        status_category: v4_1.z.enum([
            'blocked',
            'waiting',
            'completed',
            'review_ready',
            'failed',
        ]),
        status_detail: v4_1.z.string(),
        is_noteworthy: v4_1.z.boolean(),
        title: v4_1.z.string(),
        description: v4_1.z.string(),
        recent_action: v4_1.z.string(),
        needs_action: v4_1.z.string(),
        artifact_urls: v4_1.z.array(v4_1.z.string()),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    })
        .describe('@internal Background post-turn summary emitted after each assistant turn. summarizes_uuid points to the assistant message this summarizes.');
});
exports.SDKAPIRetryMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('api_retry'),
        attempt: v4_1.z.number(),
        max_retries: v4_1.z.number(),
        retry_delay_ms: v4_1.z.number(),
        error_status: v4_1.z.number().nullable(),
        error: (0, exports.SDKAssistantMessageErrorSchema)(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    })
        .describe('Emitted when an API request fails with a retryable error and will be retried after a delay. error_status is null for connection errors (e.g. timeouts) that had no HTTP response.');
});
exports.SDKLocalCommandOutputMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('local_command_output'),
        content: v4_1.z.string(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    })
        .describe('Output from a local slash command (e.g. /voice, /cost). Displayed as assistant-style text in the transcript.');
});
exports.SDKHookStartedMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('hook_started'),
        hook_id: v4_1.z.string(),
        hook_name: v4_1.z.string(),
        hook_event: v4_1.z.string(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKHookProgressMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('hook_progress'),
        hook_id: v4_1.z.string(),
        hook_name: v4_1.z.string(),
        hook_event: v4_1.z.string(),
        stdout: v4_1.z.string(),
        stderr: v4_1.z.string(),
        output: v4_1.z.string(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKHookResponseMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('hook_response'),
        hook_id: v4_1.z.string(),
        hook_name: v4_1.z.string(),
        hook_event: v4_1.z.string(),
        output: v4_1.z.string(),
        stdout: v4_1.z.string(),
        stderr: v4_1.z.string(),
        exit_code: v4_1.z.number().optional(),
        outcome: v4_1.z.enum(['success', 'error', 'cancelled']),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKToolProgressMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('tool_progress'),
        tool_use_id: v4_1.z.string(),
        tool_name: v4_1.z.string(),
        parent_tool_use_id: v4_1.z.string().nullable(),
        elapsed_time_seconds: v4_1.z.number(),
        task_id: v4_1.z.string().optional(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKAuthStatusMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('auth_status'),
        isAuthenticating: v4_1.z.boolean(),
        output: v4_1.z.array(v4_1.z.string()),
        error: v4_1.z.string().optional(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKFilesPersistedEventSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('files_persisted'),
        files: v4_1.z.array(v4_1.z.object({
            filename: v4_1.z.string(),
            file_id: v4_1.z.string(),
        })),
        failed: v4_1.z.array(v4_1.z.object({
            filename: v4_1.z.string(),
            error: v4_1.z.string(),
        })),
        processed_at: v4_1.z.string(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKTaskNotificationMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('task_notification'),
        task_id: v4_1.z.string(),
        tool_use_id: v4_1.z.string().optional(),
        status: v4_1.z.enum(['completed', 'failed', 'stopped']),
        output_file: v4_1.z.string(),
        summary: v4_1.z.string(),
        usage: v4_1.z
            .object({
            total_tokens: v4_1.z.number(),
            tool_uses: v4_1.z.number(),
            duration_ms: v4_1.z.number(),
        })
            .optional(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKTaskStartedMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('task_started'),
        task_id: v4_1.z.string(),
        tool_use_id: v4_1.z.string().optional(),
        description: v4_1.z.string(),
        task_type: v4_1.z.string().optional(),
        workflow_name: v4_1.z
            .string()
            .optional()
            .describe("meta.name from the workflow script (e.g. 'spec'). Only set when task_type is 'local_workflow'."),
        prompt: v4_1.z.string().optional(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKSessionStateChangedMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('session_state_changed'),
        state: v4_1.z.enum(['idle', 'running', 'requires_action']),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    })
        .describe("Mirrors notifySessionStateChanged. 'idle' fires after heldBackResult flushes and the bg-agent do-while exits — authoritative turn-over signal.");
});
exports.SDKTaskProgressMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('task_progress'),
        task_id: v4_1.z.string(),
        tool_use_id: v4_1.z.string().optional(),
        description: v4_1.z.string(),
        usage: v4_1.z.object({
            total_tokens: v4_1.z.number(),
            tool_uses: v4_1.z.number(),
            duration_ms: v4_1.z.number(),
        }),
        last_tool_name: v4_1.z.string().optional(),
        summary: v4_1.z.string().optional(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKToolUseSummaryMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('tool_use_summary'),
        summary: v4_1.z.string(),
        preceding_tool_use_ids: v4_1.z.array(v4_1.z.string()),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    });
});
exports.SDKElicitationCompleteMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('system'),
        subtype: v4_1.z.literal('elicitation_complete'),
        mcp_server_name: v4_1.z.string(),
        elicitation_id: v4_1.z.string(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    })
        .describe('Emitted when an MCP server confirms that a URL-mode elicitation is complete.');
});
/** @internal */
exports.SDKPromptSuggestionMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z.literal('prompt_suggestion'),
        suggestion: v4_1.z.string(),
        uuid: (0, exports.UUIDPlaceholder)(),
        session_id: v4_1.z.string(),
    })
        .describe('Predicted next user prompt, emitted after each turn when promptSuggestions is enabled.');
});
// ============================================================================
// Session Listing Types
// ============================================================================
exports.SDKSessionInfoSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        sessionId: v4_1.z.string().describe('Unique session identifier (UUID).'),
        summary: v4_1.z
            .string()
            .describe('Display title for the session: custom title, auto-generated summary, or first prompt.'),
        lastModified: v4_1.z
            .number()
            .describe('Last modified time in milliseconds since epoch.'),
        fileSize: v4_1.z
            .number()
            .optional()
            .describe('File size in bytes. Only populated for local JSONL storage.'),
        customTitle: v4_1.z
            .string()
            .optional()
            .describe('User-set session title via /rename.'),
        firstPrompt: v4_1.z
            .string()
            .optional()
            .describe('First meaningful user prompt in the session.'),
        gitBranch: v4_1.z
            .string()
            .optional()
            .describe('Git branch at the end of the session.'),
        cwd: v4_1.z.string().optional().describe('Working directory for the session.'),
        tag: v4_1.z.string().optional().describe('User-set session tag.'),
        createdAt: v4_1.z
            .number()
            .optional()
            .describe("Creation time in milliseconds since epoch, extracted from the first entry's timestamp."),
    })
        .describe('Session metadata returned by listSessions and getSessionInfo.');
});
exports.SDKMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        (0, exports.SDKAssistantMessageSchema)(),
        (0, exports.SDKUserMessageSchema)(),
        (0, exports.SDKUserMessageReplaySchema)(),
        (0, exports.SDKResultMessageSchema)(),
        (0, exports.SDKSystemMessageSchema)(),
        (0, exports.SDKPartialAssistantMessageSchema)(),
        (0, exports.SDKCompactBoundaryMessageSchema)(),
        (0, exports.SDKStatusMessageSchema)(),
        (0, exports.SDKAPIRetryMessageSchema)(),
        (0, exports.SDKLocalCommandOutputMessageSchema)(),
        (0, exports.SDKHookStartedMessageSchema)(),
        (0, exports.SDKHookProgressMessageSchema)(),
        (0, exports.SDKHookResponseMessageSchema)(),
        (0, exports.SDKToolProgressMessageSchema)(),
        (0, exports.SDKAuthStatusMessageSchema)(),
        (0, exports.SDKTaskNotificationMessageSchema)(),
        (0, exports.SDKTaskStartedMessageSchema)(),
        (0, exports.SDKTaskProgressMessageSchema)(),
        (0, exports.SDKSessionStateChangedMessageSchema)(),
        (0, exports.SDKFilesPersistedEventSchema)(),
        (0, exports.SDKToolUseSummaryMessageSchema)(),
        (0, exports.SDKRateLimitEventSchema)(),
        (0, exports.SDKElicitationCompleteMessageSchema)(),
        (0, exports.SDKPromptSuggestionMessageSchema)(),
    ]);
});
exports.FastModeStateSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .enum(['off', 'cooldown', 'on'])
        .describe('Fast mode state: off, in cooldown after rate limit, or actively enabled.');
});
