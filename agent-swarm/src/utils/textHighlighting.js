"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.segmentTextByHighlights = segmentTextByHighlights;
var ansi_tokenize_1 = require("@alcalzone/ansi-tokenize");
function segmentTextByHighlights(text, highlights) {
    if (highlights.length === 0) {
        return [{ text: text, start: 0 }];
    }
    var sortedHighlights = __spreadArray([], highlights, true).sort(function (a, b) {
        if (a.start !== b.start)
            return a.start - b.start;
        return b.priority - a.priority;
    });
    var resolvedHighlights = [];
    var usedRanges = [];
    var _loop_1 = function (highlight) {
        if (highlight.start === highlight.end)
            return "continue";
        var overlaps = usedRanges.some(function (range) {
            return (highlight.start >= range.start && highlight.start < range.end) ||
                (highlight.end > range.start && highlight.end <= range.end) ||
                (highlight.start <= range.start && highlight.end >= range.end);
        });
        if (!overlaps) {
            resolvedHighlights.push(highlight);
            usedRanges.push({ start: highlight.start, end: highlight.end });
        }
    };
    for (var _i = 0, sortedHighlights_1 = sortedHighlights; _i < sortedHighlights_1.length; _i++) {
        var highlight = sortedHighlights_1[_i];
        _loop_1(highlight);
    }
    return new HighlightSegmenter(text).segment(resolvedHighlights);
}
var HighlightSegmenter = /** @class */ (function () {
    function HighlightSegmenter(text) {
        this.text = text;
        // Two position systems: "visible" (what the user sees, excluding ANSI codes)
        // and "string" (raw positions including ANSI codes for substring extraction)
        this.visiblePos = 0;
        this.stringPos = 0;
        this.tokenIdx = 0;
        this.charIdx = 0; // offset within current text token (for partial consumption)
        this.codes = [];
        this.tokens = (0, ansi_tokenize_1.tokenize)(text);
    }
    HighlightSegmenter.prototype.segment = function (highlights) {
        var segments = [];
        for (var _i = 0, highlights_1 = highlights; _i < highlights_1.length; _i++) {
            var highlight = highlights_1[_i];
            var before = this.segmentTo(highlight.start);
            if (before)
                segments.push(before);
            var highlighted = this.segmentTo(highlight.end);
            if (highlighted) {
                highlighted.highlight = highlight;
                segments.push(highlighted);
            }
        }
        var after = this.segmentTo(Infinity);
        if (after)
            segments.push(after);
        return segments;
    };
    HighlightSegmenter.prototype.segmentTo = function (targetVisiblePos) {
        if (this.tokenIdx >= this.tokens.length ||
            targetVisiblePos <= this.visiblePos) {
            return null;
        }
        var visibleStart = this.visiblePos;
        // Consume leading ANSI codes before first visible char
        while (this.tokenIdx < this.tokens.length) {
            var token = this.tokens[this.tokenIdx];
            if (token.type !== 'ansi')
                break;
            this.codes.push(token);
            this.stringPos += token.code.length;
            this.tokenIdx++;
        }
        var stringStart = this.stringPos;
        var codesStart = __spreadArray([], this.codes, true);
        // Advance through tokens until we reach target
        while (this.visiblePos < targetVisiblePos &&
            this.tokenIdx < this.tokens.length) {
            var token = this.tokens[this.tokenIdx];
            if (token.type === 'ansi') {
                this.codes.push(token);
                this.stringPos += token.code.length;
                this.tokenIdx++;
            }
            else {
                var charsNeeded = targetVisiblePos - this.visiblePos;
                var charsAvailable = token.value.length - this.charIdx;
                var charsToTake = Math.min(charsNeeded, charsAvailable);
                this.stringPos += charsToTake;
                this.visiblePos += charsToTake;
                this.charIdx += charsToTake;
                if (this.charIdx >= token.value.length) {
                    this.tokenIdx++;
                    this.charIdx = 0;
                }
            }
        }
        // Empty segment (can occur when only trailing ANSI codes remain)
        if (this.stringPos === stringStart) {
            return null;
        }
        var prefixCodes = reduceCodes(codesStart);
        var suffixCodes = reduceCodes(this.codes);
        this.codes = suffixCodes;
        var prefix = (0, ansi_tokenize_1.ansiCodesToString)(prefixCodes);
        var suffix = (0, ansi_tokenize_1.ansiCodesToString)((0, ansi_tokenize_1.undoAnsiCodes)(suffixCodes));
        return {
            text: prefix + this.text.substring(stringStart, this.stringPos) + suffix,
            start: visibleStart,
        };
    };
    return HighlightSegmenter;
}());
function reduceCodes(codes) {
    return (0, ansi_tokenize_1.reduceAnsiCodes)(codes).filter(function (c) { return c.code !== c.endCode; });
}
