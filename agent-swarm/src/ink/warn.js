"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ifNotInteger = ifNotInteger;
var debug_js_1 = require("../utils/debug.js");
function ifNotInteger(value, name) {
    if (value === undefined)
        return;
    if (Number.isInteger(value))
        return;
    (0, debug_js_1.logForDebugging)("".concat(name, " should be an integer, got ").concat(value), {
        level: 'warn',
    });
}
