"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiCliAdapter = void 0;
/**
 * Gemini CLI Platform Adapter
 *
 * Normalizes Gemini CLI's hook JSON to NormalizedHookInput.
 * Gemini CLI supports 11 lifecycle hooks; we register 8:
 *
 * Lifecycle:
 *   SessionStart  → context     (inject memory context)
 *   SessionEnd    → session-complete
 *   PreCompress   → summarize
 *   Notification  → observation (system events like ToolPermission)
 *
 * Agent:
 *   BeforeAgent   → user-message (captures user prompt)
 *   AfterAgent    → observation  (full agent response)
 *
 * Tool:
 *   BeforeTool    → observation  (tool intent before execution)
 *   AfterTool     → observation  (tool result after execution)
 *
 * Unmapped (not useful for memory):
 *   BeforeModel, AfterModel, BeforeToolSelection — model-level events
 *   that fire per-LLM-call, too chatty for observation capture.
 *
 * Base fields (all events): session_id, transcript_path, cwd, hook_event_name, timestamp
 *
 * Output format: { continue, stopReason, suppressOutput, systemMessage, decision, reason, hookSpecificOutput }
 * Advisory hooks (SessionStart, SessionEnd, PreCompress, Notification) ignore flow-control fields.
 */
exports.geminiCliAdapter = {
    normalizeInput: function (raw) {
        var _a, _b, _c, _d, _e, _f;
        var r = (raw !== null && raw !== void 0 ? raw : {});
        // CWD resolution chain: JSON field → env vars → process.cwd()
        var cwd = (_d = (_c = (_b = (_a = r.cwd) !== null && _a !== void 0 ? _a : process.env.GEMINI_CWD) !== null && _b !== void 0 ? _b : process.env.GEMINI_PROJECT_DIR) !== null && _c !== void 0 ? _c : process.env.CLAUDE_PROJECT_DIR) !== null && _d !== void 0 ? _d : process.cwd();
        var sessionId = (_f = (_e = r.session_id) !== null && _e !== void 0 ? _e : process.env.GEMINI_SESSION_ID) !== null && _f !== void 0 ? _f : undefined;
        var hookEventName = r.hook_event_name;
        // Tool fields — present in BeforeTool, AfterTool
        var toolName = r.tool_name;
        var toolInput = r.tool_input;
        var toolResponse = r.tool_response;
        // AfterAgent: synthesize observation shape from the full agent response
        if (hookEventName === 'AfterAgent' && r.prompt_response) {
            toolName = toolName !== null && toolName !== void 0 ? toolName : 'GeminiAgent';
            toolInput = toolInput !== null && toolInput !== void 0 ? toolInput : { prompt: r.prompt };
            toolResponse = toolResponse !== null && toolResponse !== void 0 ? toolResponse : { response: r.prompt_response };
        }
        // BeforeTool: has tool_name and tool_input but no tool_response yet
        // Synthesize a marker so observation handler knows this is pre-execution
        if (hookEventName === 'BeforeTool' && toolName && !toolResponse) {
            toolResponse = { _preExecution: true };
        }
        // Notification: capture as an observation with notification details
        if (hookEventName === 'Notification') {
            toolName = toolName !== null && toolName !== void 0 ? toolName : 'GeminiNotification';
            toolInput = toolInput !== null && toolInput !== void 0 ? toolInput : {
                notification_type: r.notification_type,
                message: r.message,
            };
            toolResponse = toolResponse !== null && toolResponse !== void 0 ? toolResponse : { details: r.details };
        }
        // Collect platform-specific metadata
        var metadata = {};
        if (r.source)
            metadata.source = r.source; // SessionStart: startup|resume|clear
        if (r.reason)
            metadata.reason = r.reason; // SessionEnd: exit|clear|logout|...
        if (r.trigger)
            metadata.trigger = r.trigger; // PreCompress: auto|manual
        if (r.mcp_context)
            metadata.mcp_context = r.mcp_context; // Tool hooks: MCP server context
        if (r.notification_type)
            metadata.notification_type = r.notification_type;
        if (r.stop_hook_active !== undefined)
            metadata.stop_hook_active = r.stop_hook_active;
        if (r.original_request_name)
            metadata.original_request_name = r.original_request_name;
        if (hookEventName)
            metadata.hook_event_name = hookEventName;
        return {
            sessionId: sessionId,
            cwd: cwd,
            prompt: r.prompt,
            toolName: toolName,
            toolInput: toolInput,
            toolResponse: toolResponse,
            transcriptPath: r.transcript_path,
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        };
    },
    formatOutput: function (result) {
        var _a;
        // Gemini CLI expects: { continue, stopReason, suppressOutput, systemMessage, decision, reason, hookSpecificOutput }
        var output = {};
        // Flow control — always include `continue` to prevent accidental agent termination
        output.continue = (_a = result.continue) !== null && _a !== void 0 ? _a : true;
        if (result.suppressOutput !== undefined) {
            output.suppressOutput = result.suppressOutput;
        }
        if (result.systemMessage) {
            // Strip ANSI escape sequences: matches colors, text formatting, and terminal control codes
            // Gemini CLI often has issues with ANSI escape sequences in tool output (showing them as raw text)
            var ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
            output.systemMessage = result.systemMessage.replace(ansiRegex, '');
        }
        // hookSpecificOutput is a first-class Gemini CLI field — pass through directly
        // This includes additionalContext for context injection in SessionStart, BeforeAgent, AfterTool
        if (result.hookSpecificOutput) {
            output.hookSpecificOutput = {
                additionalContext: result.hookSpecificOutput.additionalContext,
            };
        }
        return output;
    }
};
