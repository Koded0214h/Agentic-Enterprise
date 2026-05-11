"use strict";
// Tab expansion, inspired by Ghostty's Tabstops.zig
// Uses 8-column intervals (POSIX default, hardcoded in terminals like Ghostty)
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandTabs = expandTabs;
var stringWidth_js_1 = require("./stringWidth.js");
var tokenize_js_1 = require("./termio/tokenize.js");
var DEFAULT_TAB_INTERVAL = 8;
function expandTabs(text, interval) {
    if (interval === void 0) { interval = DEFAULT_TAB_INTERVAL; }
    if (!text.includes('\t')) {
        return text;
    }
    var tokenizer = (0, tokenize_js_1.createTokenizer)();
    var tokens = tokenizer.feed(text);
    tokens.push.apply(tokens, tokenizer.flush());
    var result = '';
    var column = 0;
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if (token.type === 'sequence') {
            result += token.value;
        }
        else {
            var parts = token.value.split(/(\t|\n)/);
            for (var _a = 0, parts_1 = parts; _a < parts_1.length; _a++) {
                var part = parts_1[_a];
                if (part === '\t') {
                    var spaces = interval - (column % interval);
                    result += ' '.repeat(spaces);
                    column += spaces;
                }
                else if (part === '\n') {
                    result += part;
                    column = 0;
                }
                else {
                    result += part;
                    column += (0, stringWidth_js_1.stringWidth)(part);
                }
            }
        }
    }
    return result;
}
