"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DESCRIPTION = exports.FILE_WRITE_TOOL_NAME = void 0;
exports.getWriteToolDescription = getWriteToolDescription;
var prompt_js_1 = require("../FileReadTool/prompt.js");
exports.FILE_WRITE_TOOL_NAME = 'Write';
exports.DESCRIPTION = 'Write a file to the local filesystem.';
function getPreReadInstruction() {
    return "\n- If this is an existing file, you MUST use the ".concat(prompt_js_1.FILE_READ_TOOL_NAME, " tool first to read the file's contents. This tool will fail if you did not read the file first.");
}
function getWriteToolDescription() {
    return "Writes a file to the local filesystem.\n\nUsage:\n- This tool will overwrite the existing file if there is one at the provided path.".concat(getPreReadInstruction(), "\n- Prefer the Edit tool for modifying existing files \u2014 it only sends the diff. Only use this tool to create new files or for complete rewrites.\n- NEVER create documentation files (*.md) or README files unless explicitly requested by the User.\n- Only use emojis if the user explicitly requests it. Avoid writing emojis to files unless asked.");
}
