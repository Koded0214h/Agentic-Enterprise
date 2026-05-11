"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claudeCodeAdapter = void 0;
// Maps Claude Code stdin format (session_id, cwd, tool_name, etc.)
// SessionStart hooks receive no stdin, so we must handle undefined input gracefully
exports.claudeCodeAdapter = {
    normalizeInput: function (raw) {
        var _a, _b, _c;
        var r = (raw !== null && raw !== void 0 ? raw : {});
        return {
            sessionId: (_b = (_a = r.session_id) !== null && _a !== void 0 ? _a : r.id) !== null && _b !== void 0 ? _b : r.sessionId,
            cwd: (_c = r.cwd) !== null && _c !== void 0 ? _c : process.cwd(),
            prompt: r.prompt,
            toolName: r.tool_name,
            toolInput: r.tool_input,
            toolResponse: r.tool_response,
            transcriptPath: r.transcript_path,
        };
    },
    formatOutput: function (result) {
        var r = result !== null && result !== void 0 ? result : {};
        if (r.hookSpecificOutput) {
            var output_1 = { hookSpecificOutput: result.hookSpecificOutput };
            if (r.systemMessage) {
                output_1.systemMessage = r.systemMessage;
            }
            return output_1;
        }
        // Only emit fields in the Claude Code hook contract — unrecognized fields
        // cause "JSON validation failed" in Stop hooks.
        var output = {};
        if (r.systemMessage) {
            output.systemMessage = r.systemMessage;
        }
        return output;
    }
};
