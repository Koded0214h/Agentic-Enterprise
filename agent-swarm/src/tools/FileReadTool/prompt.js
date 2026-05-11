"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OFFSET_INSTRUCTION_TARGETED = exports.OFFSET_INSTRUCTION_DEFAULT = exports.LINE_FORMAT_INSTRUCTION = exports.DESCRIPTION = exports.MAX_LINES_TO_READ = exports.FILE_UNCHANGED_STUB = exports.FILE_READ_TOOL_NAME = void 0;
exports.renderPromptTemplate = renderPromptTemplate;
var pdfUtils_js_1 = require("../../utils/pdfUtils.js");
var toolName_js_1 = require("../BashTool/toolName.js");
// Use a string constant for tool names to avoid circular dependencies
exports.FILE_READ_TOOL_NAME = 'Read';
exports.FILE_UNCHANGED_STUB = 'File unchanged since last read. The content from the earlier Read tool_result in this conversation is still current — refer to that instead of re-reading.';
exports.MAX_LINES_TO_READ = 2000;
exports.DESCRIPTION = 'Read a file from the local filesystem.';
exports.LINE_FORMAT_INSTRUCTION = '- Results are returned using cat -n format, with line numbers starting at 1';
exports.OFFSET_INSTRUCTION_DEFAULT = "- You can optionally specify a line offset and limit (especially handy for long files), but it's recommended to read the whole file by not providing these parameters";
exports.OFFSET_INSTRUCTION_TARGETED = '- When you already know which part of the file you need, only read that part. This can be important for larger files.';
/**
 * Renders the Read tool prompt template.  The caller (FileReadTool) supplies
 * the runtime-computed parts.
 */
function renderPromptTemplate(lineFormat, maxSizeInstruction, offsetInstruction) {
    return "Reads a file from the local filesystem. You can access any file directly by using this tool.\nAssume this tool is able to read all files on the machine. If the User provides a path to a file assume that path is valid. It is okay to read a file that does not exist; an error will be returned.\n\nUsage:\n- The file_path parameter must be an absolute path, not a relative path\n- By default, it reads up to ".concat(exports.MAX_LINES_TO_READ, " lines starting from the beginning of the file").concat(maxSizeInstruction, "\n").concat(offsetInstruction, "\n").concat(lineFormat, "\n- This tool allows Claude Code to read images (eg PNG, JPG, etc). When reading an image file the contents are presented visually as Claude Code is a multimodal LLM.").concat((0, pdfUtils_js_1.isPDFSupported)()
        ? '\n- This tool can read PDF files (.pdf). For large PDFs (more than 10 pages), you MUST provide the pages parameter to read specific page ranges (e.g., pages: "1-5"). Reading a large PDF without the pages parameter will fail. Maximum 20 pages per request.'
        : '', "\n- This tool can read Jupyter notebooks (.ipynb files) and returns all cells with their outputs, combining code, text, and visualizations.\n- This tool can only read files, not directories. To read a directory, use an ls command via the ").concat(toolName_js_1.BASH_TOOL_NAME, " tool.\n- You will regularly be asked to read screenshots. If the user provides a path to a screenshot, ALWAYS use this tool to view the file at the path. This tool will work with all temporary file paths.\n- If you read a file that exists but has empty contents you will receive a system reminder warning in place of file contents.");
}
