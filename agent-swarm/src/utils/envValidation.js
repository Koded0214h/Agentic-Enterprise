"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBoundedIntEnvVar = validateBoundedIntEnvVar;
var debug_js_1 = require("./debug.js");
function validateBoundedIntEnvVar(name, value, defaultValue, upperLimit) {
    if (!value) {
        return { effective: defaultValue, status: 'valid' };
    }
    var parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed <= 0) {
        var result = {
            effective: defaultValue,
            status: 'invalid',
            message: "Invalid value \"".concat(value, "\" (using default: ").concat(defaultValue, ")"),
        };
        (0, debug_js_1.logForDebugging)("".concat(name, " ").concat(result.message));
        return result;
    }
    if (parsed > upperLimit) {
        var result = {
            effective: upperLimit,
            status: 'capped',
            message: "Capped from ".concat(parsed, " to ").concat(upperLimit),
        };
        (0, debug_js_1.logForDebugging)("".concat(name, " ").concat(result.message));
        return result;
    }
    return { effective: parsed, status: 'valid' };
}
