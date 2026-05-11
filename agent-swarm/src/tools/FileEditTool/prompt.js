"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEditToolDescription = getEditToolDescription;
var file_js_1 = require("../../utils/file.js");
var prompt_js_1 = require("../FileReadTool/prompt.js");
function getPreReadInstruction() {
    return "\n- You must use your `".concat(prompt_js_1.FILE_READ_TOOL_NAME, "` tool at least once in the conversation before editing. This tool will error if you attempt an edit without reading the file. ");
}
function getEditToolDescription() {
    return getDefaultEditDescription();
}
function getDefaultEditDescription() {
    var prefixFormat = (0, file_js_1.isCompactLinePrefixEnabled)()
        ? 'line number + tab'
        : 'spaces + line number + arrow';
    var minimalUniquenessHint = process.env.USER_TYPE === 'ant'
        ? "\n- Use the smallest old_string that's clearly unique \u2014 usually 2-4 adjacent lines is sufficient. Avoid including 10+ lines of context when less uniquely identifies the target."
        : '';
    return "Performs exact string replacements in files.\n\nUsage:".concat(getPreReadInstruction(), "\n- When editing text from Read tool output, ensure you preserve the exact indentation (tabs/spaces) as it appears AFTER the line number prefix. The line number prefix format is: ").concat(prefixFormat, ". Everything after that is the actual file content to match. Never include any part of the line number prefix in the old_string or new_string.\n- ALWAYS prefer editing existing files in the codebase. NEVER write new files unless explicitly required.\n- Only use emojis if the user explicitly requests it. Avoid adding emojis to files unless asked.\n- The edit will FAIL if `old_string` is not unique in the file. Either provide a larger string with more surrounding context to make it unique or use `replace_all` to change every instance of `old_string`.").concat(minimalUniquenessHint, "\n- Use `replace_all` for replacing and renaming strings across the file. This parameter is useful if you want to rename a variable for instance.");
}
