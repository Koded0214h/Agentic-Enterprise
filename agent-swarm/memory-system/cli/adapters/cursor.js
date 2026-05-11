"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cursorAdapter = void 0;
// Maps Cursor stdin format - field names differ from Claude Code
// Cursor uses: conversation_id, workspace_roots[], result_json, command/output
// Handle undefined input gracefully for hooks that don't receive stdin
//
// Cursor payload variations (#838, #1049):
//   Session ID: conversation_id, generation_id, or id
//   Prompt: prompt, query, input, or message (varies by Cursor version/hook type)
//   CWD: workspace_roots[0] or cwd
exports.cursorAdapter = {
    normalizeInput: function (raw) {
        var _a, _b, _c, _d, _e, _f;
        var r = (raw !== null && raw !== void 0 ? raw : {});
        // Cursor-specific: shell commands come as command/output instead of tool_name/input/response
        var isShellCommand = !!r.command && !r.tool_name;
        return {
            sessionId: r.conversation_id || r.generation_id || r.id,
            cwd: (_c = (_b = (_a = r.workspace_roots) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : r.cwd) !== null && _c !== void 0 ? _c : process.cwd(),
            prompt: (_f = (_e = (_d = r.prompt) !== null && _d !== void 0 ? _d : r.query) !== null && _e !== void 0 ? _e : r.input) !== null && _f !== void 0 ? _f : r.message,
            toolName: isShellCommand ? 'Bash' : r.tool_name,
            toolInput: isShellCommand ? { command: r.command } : r.tool_input,
            toolResponse: isShellCommand ? { output: r.output } : r.result_json, // result_json not tool_response
            transcriptPath: undefined, // Cursor doesn't provide transcript
            // Cursor-specific fields for file edits
            filePath: r.file_path,
            edits: r.edits,
        };
    },
    formatOutput: function (result) {
        var _a;
        // Cursor expects simpler response - just continue flag
        return { continue: (_a = result.continue) !== null && _a !== void 0 ? _a : true };
    }
};
