"use strict";
/**
 * ANSI Parser Module
 *
 * A semantic ANSI escape sequence parser inspired by ghostty, tmux, and iTerm2.
 *
 * Key features:
 * - Semantic output: produces structured actions, not string tokens
 * - Streaming: can parse input incrementally via Parser class
 * - Style tracking: maintains text style state across parse calls
 * - Comprehensive: supports SGR, CSI, OSC, ESC sequences
 *
 * Usage:
 *
 * ```typescript
 * import { Parser } from './termio.js'
 *
 * const parser = new Parser()
 * const actions = parser.feed('\x1b[31mred\x1b[0m')
 * // => [{ type: 'text', graphemes: [...], style: { fg: { type: 'named', name: 'red' }, ... } }]
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stylesEqual = exports.defaultStyle = exports.colorsEqual = exports.Parser = void 0;
// Parser
var parser_js_1 = require("./termio/parser.js");
Object.defineProperty(exports, "Parser", { enumerable: true, get: function () { return parser_js_1.Parser; } });
var types_js_1 = require("./termio/types.js");
Object.defineProperty(exports, "colorsEqual", { enumerable: true, get: function () { return types_js_1.colorsEqual; } });
Object.defineProperty(exports, "defaultStyle", { enumerable: true, get: function () { return types_js_1.defaultStyle; } });
Object.defineProperty(exports, "stylesEqual", { enumerable: true, get: function () { return types_js_1.stylesEqual; } });
