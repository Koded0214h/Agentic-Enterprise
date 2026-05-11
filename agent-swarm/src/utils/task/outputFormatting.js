"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TASK_MAX_OUTPUT_DEFAULT = exports.TASK_MAX_OUTPUT_UPPER_LIMIT = void 0;
exports.getMaxTaskOutputLength = getMaxTaskOutputLength;
exports.formatTaskOutput = formatTaskOutput;
var envValidation_js_1 = require("../envValidation.js");
var diskOutput_js_1 = require("./diskOutput.js");
exports.TASK_MAX_OUTPUT_UPPER_LIMIT = 160000;
exports.TASK_MAX_OUTPUT_DEFAULT = 32000;
function getMaxTaskOutputLength() {
    var result = (0, envValidation_js_1.validateBoundedIntEnvVar)('TASK_MAX_OUTPUT_LENGTH', process.env.TASK_MAX_OUTPUT_LENGTH, exports.TASK_MAX_OUTPUT_DEFAULT, exports.TASK_MAX_OUTPUT_UPPER_LIMIT);
    return result.effective;
}
/**
 * Format task output for API consumption, truncating if too large.
 * When truncated, includes a header with the file path and returns
 * the last N characters that fit within the limit.
 */
function formatTaskOutput(output, taskId) {
    var maxLen = getMaxTaskOutputLength();
    if (output.length <= maxLen) {
        return { content: output, wasTruncated: false };
    }
    var filePath = (0, diskOutput_js_1.getTaskOutputPath)(taskId);
    var header = "[Truncated. Full output: ".concat(filePath, "]\n\n");
    var availableSpace = maxLen - header.length;
    var truncated = output.slice(-availableSpace);
    return { content: header + truncated, wasTruncated: true };
}
