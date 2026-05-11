"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureMarked = configureMarked;
exports.applyMarkdown = applyMarkdown;
exports.formatToken = formatToken;
exports.padAligned = padAligned;
var chalk_1 = require("chalk");
var marked_1 = require("marked");
var strip_ansi_1 = require("strip-ansi");
var color_js_1 = require("../components/design-system/color.js");
var figures_js_1 = require("../constants/figures.js");
var stringWidth_js_1 = require("../ink/stringWidth.js");
var supports_hyperlinks_js_1 = require("../ink/supports-hyperlinks.js");
var debug_js_1 = require("./debug.js");
var hyperlink_js_1 = require("./hyperlink.js");
var messages_js_1 = require("./messages.js");
// Use \n unconditionally — os.EOL is \r\n on Windows, and the extra \r
// breaks the character-to-segment mapping in applyStylesToWrappedText,
// causing styled text to shift right.
var EOL = '\n';
var markedConfigured = false;
function configureMarked() {
    if (markedConfigured)
        return;
    markedConfigured = true;
    // Disable strikethrough parsing - the model often uses ~ for "approximate"
    // (e.g., ~100) and rarely intends actual strikethrough formatting
    marked_1.marked.use({
        tokenizer: {
            del: function () {
                return undefined;
            },
        },
    });
}
function applyMarkdown(content, theme, highlight) {
    if (highlight === void 0) { highlight = null; }
    configureMarked();
    return marked_1.marked
        .lexer((0, messages_js_1.stripPromptXMLTags)(content))
        .map(function (_) { return formatToken(_, theme, 0, null, null, highlight); })
        .join('')
        .trim();
}
function formatToken(token, theme, listDepth, orderedListNumber, parent, highlight) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    if (listDepth === void 0) { listDepth = 0; }
    if (orderedListNumber === void 0) { orderedListNumber = null; }
    if (parent === void 0) { parent = null; }
    if (highlight === void 0) { highlight = null; }
    switch (token.type) {
        case 'blockquote': {
            var inner = ((_a = token.tokens) !== null && _a !== void 0 ? _a : [])
                .map(function (_) { return formatToken(_, theme, 0, null, null, highlight); })
                .join('');
            // Prefix each line with a dim vertical bar. Keep text italic but at
            // normal brightness — chalk.dim is nearly invisible on dark themes.
            var bar_1 = chalk_1.default.dim(figures_js_1.BLOCKQUOTE_BAR);
            return inner
                .split(EOL)
                .map(function (line) {
                return (0, strip_ansi_1.default)(line).trim() ? "".concat(bar_1, " ").concat(chalk_1.default.italic(line)) : line;
            })
                .join(EOL);
        }
        case 'code': {
            if (!highlight) {
                return token.text + EOL;
            }
            var language = 'plaintext';
            if (token.lang) {
                if (highlight.supportsLanguage(token.lang)) {
                    language = token.lang;
                }
                else {
                    (0, debug_js_1.logForDebugging)("Language not supported while highlighting code, falling back to plaintext: ".concat(token.lang));
                }
            }
            return highlight.highlight(token.text, { language: language }) + EOL;
        }
        case 'codespan': {
            // inline code
            return (0, color_js_1.color)('permission', theme)(token.text);
        }
        case 'em':
            return chalk_1.default.italic(((_b = token.tokens) !== null && _b !== void 0 ? _b : [])
                .map(function (_) { return formatToken(_, theme, 0, null, parent, highlight); })
                .join(''));
        case 'strong':
            return chalk_1.default.bold(((_c = token.tokens) !== null && _c !== void 0 ? _c : [])
                .map(function (_) { return formatToken(_, theme, 0, null, parent, highlight); })
                .join(''));
        case 'heading':
            switch (token.depth) {
                case 1: // h1
                    return (chalk_1.default.bold.italic.underline(((_d = token.tokens) !== null && _d !== void 0 ? _d : [])
                        .map(function (_) { return formatToken(_, theme, 0, null, null, highlight); })
                        .join('')) +
                        EOL +
                        EOL);
                case 2: // h2
                    return (chalk_1.default.bold(((_e = token.tokens) !== null && _e !== void 0 ? _e : [])
                        .map(function (_) { return formatToken(_, theme, 0, null, null, highlight); })
                        .join('')) +
                        EOL +
                        EOL);
                default: // h3+
                    return (chalk_1.default.bold(((_f = token.tokens) !== null && _f !== void 0 ? _f : [])
                        .map(function (_) { return formatToken(_, theme, 0, null, null, highlight); })
                        .join('')) +
                        EOL +
                        EOL);
            }
        case 'hr':
            return '---';
        case 'image':
            return token.href;
        case 'link': {
            // Prevent mailto links from being displayed as clickable links
            if (token.href.startsWith('mailto:')) {
                // Extract email from mailto: link and display as plain text
                var email = token.href.replace(/^mailto:/, '');
                return email;
            }
            // Extract display text from the link's child tokens
            var linkText = ((_g = token.tokens) !== null && _g !== void 0 ? _g : [])
                .map(function (_) { return formatToken(_, theme, 0, null, token, highlight); })
                .join('');
            var plainLinkText = (0, strip_ansi_1.default)(linkText);
            // If the link has meaningful display text (different from the URL),
            // show it as a clickable hyperlink. In terminals that support OSC 8,
            // users see the text and can hover/click to see the URL.
            if (plainLinkText && plainLinkText !== token.href) {
                return (0, hyperlink_js_1.createHyperlink)(token.href, linkText);
            }
            // When the display text matches the URL (or is empty), just show the URL
            return (0, hyperlink_js_1.createHyperlink)(token.href);
        }
        case 'list': {
            return token.items
                .map(function (_, index) {
                return formatToken(_, theme, listDepth, token.ordered ? token.start + index : null, token, highlight);
            })
                .join('');
        }
        case 'list_item':
            return ((_h = token.tokens) !== null && _h !== void 0 ? _h : [])
                .map(function (_) {
                return "".concat('  '.repeat(listDepth)).concat(formatToken(_, theme, listDepth + 1, orderedListNumber, token, highlight));
            })
                .join('');
        case 'paragraph':
            return (((_j = token.tokens) !== null && _j !== void 0 ? _j : [])
                .map(function (_) { return formatToken(_, theme, 0, null, null, highlight); })
                .join('') + EOL);
        case 'space':
            return EOL;
        case 'br':
            return EOL;
        case 'text':
            if ((parent === null || parent === void 0 ? void 0 : parent.type) === 'link') {
                // Already inside a markdown link — the link handler will wrap this
                // in an OSC 8 hyperlink. Linkifying here would nest a second OSC 8
                // sequence, and terminals honor the innermost one, overriding the
                // link's actual href.
                return token.text;
            }
            if ((parent === null || parent === void 0 ? void 0 : parent.type) === 'list_item') {
                return "".concat(orderedListNumber === null ? '-' : getListNumber(listDepth, orderedListNumber) + '.', " ").concat(token.tokens ? token.tokens.map(function (_) { return formatToken(_, theme, listDepth, orderedListNumber, token, highlight); }).join('') : linkifyIssueReferences(token.text)).concat(EOL);
            }
            return linkifyIssueReferences(token.text);
        case 'table': {
            var tableToken_1 = token;
            // Helper function to get the text content that will be displayed (after stripAnsi)
            function getDisplayText(tokens) {
                var _a;
                return (0, strip_ansi_1.default)((_a = tokens === null || tokens === void 0 ? void 0 : tokens.map(function (_) { return formatToken(_, theme, 0, null, null, highlight); }).join('')) !== null && _a !== void 0 ? _a : '');
            }
            // Determine column widths based on displayed content (without formatting)
            var columnWidths_1 = tableToken_1.header.map(function (header, index) {
                var _a;
                var maxWidth = (0, stringWidth_js_1.stringWidth)(getDisplayText(header.tokens));
                for (var _i = 0, _b = tableToken_1.rows; _i < _b.length; _i++) {
                    var row = _b[_i];
                    var cellLength = (0, stringWidth_js_1.stringWidth)(getDisplayText((_a = row[index]) === null || _a === void 0 ? void 0 : _a.tokens));
                    maxWidth = Math.max(maxWidth, cellLength);
                }
                return Math.max(maxWidth, 3); // Minimum width of 3
            });
            // Format header row
            var tableOutput_1 = '| ';
            tableToken_1.header.forEach(function (header, index) {
                var _a, _b, _c;
                var content = (_b = (_a = header.tokens) === null || _a === void 0 ? void 0 : _a.map(function (_) { return formatToken(_, theme, 0, null, null, highlight); }).join('')) !== null && _b !== void 0 ? _b : '';
                var displayText = getDisplayText(header.tokens);
                var width = columnWidths_1[index];
                var align = (_c = tableToken_1.align) === null || _c === void 0 ? void 0 : _c[index];
                tableOutput_1 +=
                    padAligned(content, (0, stringWidth_js_1.stringWidth)(displayText), width, align) + ' | ';
            });
            tableOutput_1 = tableOutput_1.trimEnd() + EOL;
            // Add separator row
            tableOutput_1 += '|';
            columnWidths_1.forEach(function (width) {
                // Always use dashes, don't show alignment colons in the output
                var separator = '-'.repeat(width + 2); // +2 for spaces on each side
                tableOutput_1 += separator + '|';
            });
            tableOutput_1 += EOL;
            // Format data rows
            tableToken_1.rows.forEach(function (row) {
                tableOutput_1 += '| ';
                row.forEach(function (cell, index) {
                    var _a, _b, _c;
                    var content = (_b = (_a = cell.tokens) === null || _a === void 0 ? void 0 : _a.map(function (_) { return formatToken(_, theme, 0, null, null, highlight); }).join('')) !== null && _b !== void 0 ? _b : '';
                    var displayText = getDisplayText(cell.tokens);
                    var width = columnWidths_1[index];
                    var align = (_c = tableToken_1.align) === null || _c === void 0 ? void 0 : _c[index];
                    tableOutput_1 +=
                        padAligned(content, (0, stringWidth_js_1.stringWidth)(displayText), width, align) + ' | ';
                });
                tableOutput_1 = tableOutput_1.trimEnd() + EOL;
            });
            return tableOutput_1 + EOL;
        }
        case 'escape':
            // Markdown escape: \) → ), \\ → \, etc.
            return token.text;
        case 'def':
        case 'del':
        case 'html':
            // These token types are not rendered
            return '';
    }
    return '';
}
// Matches owner/repo#NNN style GitHub issue/PR references. The qualified form
// is unambiguous — bare #NNN was removed because it guessed the current repo
// and was wrong whenever the assistant discussed a different one.
// Owner segment disallows dots (GitHub usernames are alphanumerics + hyphens
// only) so hostnames like docs.github.io/guide#42 don't false-positive. Repo
// segment allows dots (e.g. cc.kurs.web). Lookbehind is avoided — it defeats
// YARR JIT in JSC.
var ISSUE_REF_PATTERN = /(^|[^\w./-])([A-Za-z0-9][\w-]*\/[A-Za-z0-9][\w.-]*)#(\d+)\b/g;
/**
 * Replaces owner/repo#123 references with clickable hyperlinks to GitHub.
 */
function linkifyIssueReferences(text) {
    if (!(0, supports_hyperlinks_js_1.supportsHyperlinks)()) {
        return text;
    }
    return text.replace(ISSUE_REF_PATTERN, function (_match, prefix, repo, num) {
        return prefix +
            (0, hyperlink_js_1.createHyperlink)("https://github.com/".concat(repo, "/issues/").concat(num), "".concat(repo, "#").concat(num));
    });
}
function numberToLetter(n) {
    var result = '';
    while (n > 0) {
        n--;
        result = String.fromCharCode(97 + (n % 26)) + result;
        n = Math.floor(n / 26);
    }
    return result;
}
var ROMAN_VALUES = [
    [1000, 'm'],
    [900, 'cm'],
    [500, 'd'],
    [400, 'cd'],
    [100, 'c'],
    [90, 'xc'],
    [50, 'l'],
    [40, 'xl'],
    [10, 'x'],
    [9, 'ix'],
    [5, 'v'],
    [4, 'iv'],
    [1, 'i'],
];
function numberToRoman(n) {
    var result = '';
    for (var _i = 0, ROMAN_VALUES_1 = ROMAN_VALUES; _i < ROMAN_VALUES_1.length; _i++) {
        var _a = ROMAN_VALUES_1[_i], value = _a[0], numeral = _a[1];
        while (n >= value) {
            result += numeral;
            n -= value;
        }
    }
    return result;
}
function getListNumber(listDepth, orderedListNumber) {
    switch (listDepth) {
        case 0:
        case 1:
            return orderedListNumber.toString();
        case 2:
            return numberToLetter(orderedListNumber);
        case 3:
            return numberToRoman(orderedListNumber);
        default:
            return orderedListNumber.toString();
    }
}
/**
 * Pad `content` to `targetWidth` according to alignment. `displayWidth` is the
 * visible width of `content` (caller computes this, e.g. via stringWidth on
 * stripAnsi'd text, so ANSI codes in `content` don't affect padding).
 */
function padAligned(content, displayWidth, targetWidth, align) {
    var padding = Math.max(0, targetWidth - displayWidth);
    if (align === 'center') {
        var leftPad = Math.floor(padding / 2);
        return ' '.repeat(leftPad) + content + ' '.repeat(padding - leftPad);
    }
    if (align === 'right') {
        return ' '.repeat(padding) + content;
    }
    return content + ' '.repeat(padding);
}
