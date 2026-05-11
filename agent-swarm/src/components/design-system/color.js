"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.color = color;
var colorize_js_1 = require("../../ink/colorize.js");
var theme_js_1 = require("../../utils/theme.js");
/**
 * Curried theme-aware color function. Resolves theme keys to raw color
 * values before delegating to the ink renderer's colorize.
 */
function color(c, theme, type) {
    if (type === void 0) { type = 'foreground'; }
    return function (text) {
        if (!c) {
            return text;
        }
        // Raw color values bypass theme lookup
        if (c.startsWith('rgb(') ||
            c.startsWith('#') ||
            c.startsWith('ansi256(') ||
            c.startsWith('ansi:')) {
            return (0, colorize_js_1.colorize)(text, c, type);
        }
        // Theme key lookup
        return (0, colorize_js_1.colorize)(text, (0, theme_js_1.getTheme)(theme)[c], type);
    };
}
