"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawAdapter = exports.geminiCliAdapter = exports.cursorAdapter = exports.claudeCodeAdapter = void 0;
exports.getPlatformAdapter = getPlatformAdapter;
var claude_code_js_1 = require("./claude-code.js");
Object.defineProperty(exports, "claudeCodeAdapter", { enumerable: true, get: function () { return claude_code_js_1.claudeCodeAdapter; } });
var cursor_js_1 = require("./cursor.js");
Object.defineProperty(exports, "cursorAdapter", { enumerable: true, get: function () { return cursor_js_1.cursorAdapter; } });
var gemini_cli_js_1 = require("./gemini-cli.js");
Object.defineProperty(exports, "geminiCliAdapter", { enumerable: true, get: function () { return gemini_cli_js_1.geminiCliAdapter; } });
var raw_js_1 = require("./raw.js");
Object.defineProperty(exports, "rawAdapter", { enumerable: true, get: function () { return raw_js_1.rawAdapter; } });
function getPlatformAdapter(platform) {
    switch (platform) {
        case 'claude-code': return claude_code_js_1.claudeCodeAdapter;
        case 'cursor': return cursor_js_1.cursorAdapter;
        case 'gemini':
        case 'gemini-cli': return gemini_cli_js_1.geminiCliAdapter;
        case 'raw': return raw_js_1.rawAdapter;
        // Codex CLI and other compatible platforms use the raw adapter (accepts both camelCase and snake_case fields)
        default: return raw_js_1.rawAdapter;
    }
}
