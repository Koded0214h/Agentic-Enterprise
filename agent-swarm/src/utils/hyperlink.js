"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OSC8_END = exports.OSC8_START = void 0;
exports.createHyperlink = createHyperlink;
var chalk_1 = require("chalk");
var supports_hyperlinks_js_1 = require("../ink/supports-hyperlinks.js");
// OSC 8 hyperlink escape sequences
// Format: \e]8;;URL\e\\TEXT\e]8;;\e\\
// Using \x07 (BEL) as terminator which is more widely supported
exports.OSC8_START = '\x1b]8;;';
exports.OSC8_END = '\x07';
/**
 * Create a clickable hyperlink using OSC 8 escape sequences.
 * Falls back to plain text if the terminal doesn't support hyperlinks.
 *
 * @param url - The URL to link to
 * @param content - Optional content to display as the link text (only when hyperlinks are supported).
 *                  If provided and hyperlinks are supported, this text is shown as a clickable link.
 *                  If hyperlinks are not supported, content is ignored and only the URL is shown.
 * @param options - Optional overrides for testing (supportsHyperlinks)
 */
function createHyperlink(url, content, options) {
    var _a;
    var hasSupport = (_a = options === null || options === void 0 ? void 0 : options.supportsHyperlinks) !== null && _a !== void 0 ? _a : (0, supports_hyperlinks_js_1.supportsHyperlinks)();
    if (!hasSupport) {
        return url;
    }
    // Apply basic ANSI blue color - wrap-ansi preserves this across line breaks
    // RGB colors (like theme colors) are NOT preserved by wrap-ansi with OSC 8
    var displayText = content !== null && content !== void 0 ? content : url;
    var coloredText = chalk_1.default.blue(displayText);
    return "".concat(exports.OSC8_START).concat(url).concat(exports.OSC8_END).concat(coloredText).concat(exports.OSC8_START).concat(exports.OSC8_END);
}
