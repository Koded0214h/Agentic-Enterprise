"use strict";
/**
 * General string utility functions and classes for safe string accumulation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndTruncatingAccumulator = void 0;
exports.escapeRegExp = escapeRegExp;
exports.capitalize = capitalize;
exports.plural = plural;
exports.firstLineOf = firstLineOf;
exports.countCharInString = countCharInString;
exports.normalizeFullWidthDigits = normalizeFullWidthDigits;
exports.normalizeFullWidthSpace = normalizeFullWidthSpace;
exports.safeJoinLines = safeJoinLines;
exports.truncateToLines = truncateToLines;
/**
 * Escapes special regex characters in a string so it can be used as a literal
 * pattern in a RegExp constructor.
 */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * Uppercases the first character of a string, leaving the rest unchanged.
 * Unlike lodash `capitalize`, this does NOT lowercase the remaining characters.
 *
 * @example capitalize('fooBar') → 'FooBar'
 * @example capitalize('hello world') → 'Hello world'
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * Returns the singular or plural form of a word based on count.
 * Replaces the inline `word${n === 1 ? '' : 's'}` idiom.
 *
 * @example plural(1, 'file') → 'file'
 * @example plural(3, 'file') → 'files'
 * @example plural(2, 'entry', 'entries') → 'entries'
 */
function plural(n, word, pluralWord) {
    if (pluralWord === void 0) { pluralWord = word + 's'; }
    return n === 1 ? word : pluralWord;
}
/**
 * Returns the first line of a string without allocating a split array.
 * Used for shebang detection in diff rendering.
 */
function firstLineOf(s) {
    var nl = s.indexOf('\n');
    return nl === -1 ? s : s.slice(0, nl);
}
/**
 * Counts occurrences of `char` in `str` using indexOf jumps instead of
 * per-character iteration. Structurally typed so Buffer works too
 * (Buffer.indexOf accepts string needles).
 */
function countCharInString(str, char, start) {
    if (start === void 0) { start = 0; }
    var count = 0;
    var i = str.indexOf(char, start);
    while (i !== -1) {
        count++;
        i = str.indexOf(char, i + 1);
    }
    return count;
}
/**
 * Normalize full-width (zenkaku) digits to half-width digits.
 * Useful for accepting input from Japanese/CJK IMEs.
 */
function normalizeFullWidthDigits(input) {
    return input.replace(/[０-９]/g, function (ch) {
        return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
    });
}
/**
 * Normalize full-width (zenkaku) space to half-width space.
 * Useful for accepting input from Japanese/CJK IMEs (U+3000 → U+0020).
 */
function normalizeFullWidthSpace(input) {
    return input.replace(/\u3000/g, ' ');
}
// Keep in-memory accumulation modest to avoid blowing up RSS.
// Overflow beyond this limit is spilled to disk by ShellCommand.
var MAX_STRING_LENGTH = Math.pow(2, 25);
/**
 * Safely joins an array of strings with a delimiter, truncating if the result exceeds maxSize.
 *
 * @param lines Array of strings to join
 * @param delimiter Delimiter to use between strings (default: ',')
 * @param maxSize Maximum size of the resulting string
 * @returns The joined string, truncated if necessary
 */
function safeJoinLines(lines, delimiter, maxSize) {
    if (delimiter === void 0) { delimiter = ','; }
    if (maxSize === void 0) { maxSize = MAX_STRING_LENGTH; }
    var truncationMarker = '...[truncated]';
    var result = '';
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var delimiterToAdd = result ? delimiter : '';
        var fullAddition = delimiterToAdd + line;
        if (result.length + fullAddition.length <= maxSize) {
            // The full line fits
            result += fullAddition;
        }
        else {
            // Need to truncate
            var remainingSpace = maxSize -
                result.length -
                delimiterToAdd.length -
                truncationMarker.length;
            if (remainingSpace > 0) {
                // Add delimiter and as much of the line as will fit
                result +=
                    delimiterToAdd + line.slice(0, remainingSpace) + truncationMarker;
            }
            else {
                // No room for any of this line, just add truncation marker
                result += truncationMarker;
            }
            return result;
        }
    }
    return result;
}
/**
 * A string accumulator that safely handles large outputs by truncating from the end
 * when a size limit is exceeded. This prevents RangeError crashes while preserving
 * the beginning of the output.
 */
var EndTruncatingAccumulator = /** @class */ (function () {
    /**
     * Creates a new EndTruncatingAccumulator
     * @param maxSize Maximum size in characters before truncation occurs
     */
    function EndTruncatingAccumulator(maxSize) {
        if (maxSize === void 0) { maxSize = MAX_STRING_LENGTH; }
        this.maxSize = maxSize;
        this.content = '';
        this.isTruncated = false;
        this.totalBytesReceived = 0;
    }
    /**
     * Appends data to the accumulator. If the total size exceeds maxSize,
     * the end is truncated to maintain the size limit.
     * @param data The string data to append
     */
    EndTruncatingAccumulator.prototype.append = function (data) {
        var str = typeof data === 'string' ? data : data.toString();
        this.totalBytesReceived += str.length;
        // If already at capacity and truncated, don't modify content
        if (this.isTruncated && this.content.length >= this.maxSize) {
            return;
        }
        // Check if adding the string would exceed the limit
        if (this.content.length + str.length > this.maxSize) {
            // Only append what we can fit
            var remainingSpace = this.maxSize - this.content.length;
            if (remainingSpace > 0) {
                this.content += str.slice(0, remainingSpace);
            }
            this.isTruncated = true;
        }
        else {
            this.content += str;
        }
    };
    /**
     * Returns the accumulated string, with truncation marker if truncated
     */
    EndTruncatingAccumulator.prototype.toString = function () {
        if (!this.isTruncated) {
            return this.content;
        }
        var truncatedBytes = this.totalBytesReceived - this.maxSize;
        var truncatedKB = Math.round(truncatedBytes / 1024);
        return this.content + "\n... [output truncated - ".concat(truncatedKB, "KB removed]");
    };
    /**
     * Clears all accumulated data
     */
    EndTruncatingAccumulator.prototype.clear = function () {
        this.content = '';
        this.isTruncated = false;
        this.totalBytesReceived = 0;
    };
    Object.defineProperty(EndTruncatingAccumulator.prototype, "length", {
        /**
         * Returns the current size of accumulated data
         */
        get: function () {
            return this.content.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EndTruncatingAccumulator.prototype, "truncated", {
        /**
         * Returns whether truncation has occurred
         */
        get: function () {
            return this.isTruncated;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EndTruncatingAccumulator.prototype, "totalBytes", {
        /**
         * Returns total bytes received (before truncation)
         */
        get: function () {
            return this.totalBytesReceived;
        },
        enumerable: false,
        configurable: true
    });
    return EndTruncatingAccumulator;
}());
exports.EndTruncatingAccumulator = EndTruncatingAccumulator;
/**
 * Truncates text to a maximum number of lines, adding an ellipsis if truncated.
 *
 * @param text The text to truncate
 * @param maxLines Maximum number of lines to keep
 * @returns The truncated text with ellipsis if truncated
 */
function truncateToLines(text, maxLines) {
    var lines = text.split('\n');
    if (lines.length <= maxLines) {
        return text;
    }
    return lines.slice(0, maxLines).join('\n') + '…';
}
