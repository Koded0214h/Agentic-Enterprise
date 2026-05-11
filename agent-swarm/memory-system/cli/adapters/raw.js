"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawAdapter = void 0;
// Raw adapter passes through with minimal transformation - useful for testing
exports.rawAdapter = {
    normalizeInput: function (raw) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var r = raw;
        return {
            sessionId: (_b = (_a = r.sessionId) !== null && _a !== void 0 ? _a : r.session_id) !== null && _b !== void 0 ? _b : 'unknown',
            cwd: (_c = r.cwd) !== null && _c !== void 0 ? _c : process.cwd(),
            prompt: r.prompt,
            toolName: (_d = r.toolName) !== null && _d !== void 0 ? _d : r.tool_name,
            toolInput: (_e = r.toolInput) !== null && _e !== void 0 ? _e : r.tool_input,
            toolResponse: (_f = r.toolResponse) !== null && _f !== void 0 ? _f : r.tool_response,
            transcriptPath: (_g = r.transcriptPath) !== null && _g !== void 0 ? _g : r.transcript_path,
            filePath: (_h = r.filePath) !== null && _h !== void 0 ? _h : r.file_path,
            edits: r.edits,
        };
    },
    formatOutput: function (result) {
        return result;
    }
};
