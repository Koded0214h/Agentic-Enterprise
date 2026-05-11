"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASH_MAX_OUTPUT_DEFAULT = exports.BASH_MAX_OUTPUT_UPPER_LIMIT = void 0;
exports.getMaxOutputLength = getMaxOutputLength;
var envValidation_js_1 = require("../envValidation.js");
exports.BASH_MAX_OUTPUT_UPPER_LIMIT = 150000;
exports.BASH_MAX_OUTPUT_DEFAULT = 30000;
function getMaxOutputLength() {
    var result = (0, envValidation_js_1.validateBoundedIntEnvVar)('BASH_MAX_OUTPUT_LENGTH', process.env.BASH_MAX_OUTPUT_LENGTH, exports.BASH_MAX_OUTPUT_DEFAULT, exports.BASH_MAX_OUTPUT_UPPER_LIMIT);
    return result.effective;
}
