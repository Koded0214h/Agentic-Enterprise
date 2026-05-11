"use strict";
/**
 * Shared Intl object instances with lazy initialization.
 *
 * Intl constructors are expensive (~0.05-0.1ms each), so we cache instances
 * for reuse across the codebase instead of creating new ones each time.
 * Lazy initialization ensures we only pay the cost when actually needed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGraphemeSegmenter = getGraphemeSegmenter;
exports.firstGrapheme = firstGrapheme;
exports.lastGrapheme = lastGrapheme;
exports.getWordSegmenter = getWordSegmenter;
exports.getRelativeTimeFormat = getRelativeTimeFormat;
exports.getTimeZone = getTimeZone;
exports.getSystemLocaleLanguage = getSystemLocaleLanguage;
// Segmenters for Unicode text processing (lazily initialized)
var graphemeSegmenter = null;
var wordSegmenter = null;
function getGraphemeSegmenter() {
    if (!graphemeSegmenter) {
        graphemeSegmenter = new Intl.Segmenter(undefined, {
            granularity: 'grapheme',
        });
    }
    return graphemeSegmenter;
}
/**
 * Extract the first grapheme cluster from a string.
 * Returns '' for empty strings.
 */
function firstGrapheme(text) {
    var _a;
    if (!text)
        return '';
    var segments = getGraphemeSegmenter().segment(text);
    var first = segments[Symbol.iterator]().next().value;
    return (_a = first === null || first === void 0 ? void 0 : first.segment) !== null && _a !== void 0 ? _a : '';
}
/**
 * Extract the last grapheme cluster from a string.
 * Returns '' for empty strings.
 */
function lastGrapheme(text) {
    if (!text)
        return '';
    var last = '';
    for (var _i = 0, _a = getGraphemeSegmenter().segment(text); _i < _a.length; _i++) {
        var segment = _a[_i].segment;
        last = segment;
    }
    return last;
}
function getWordSegmenter() {
    if (!wordSegmenter) {
        wordSegmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
    }
    return wordSegmenter;
}
// RelativeTimeFormat cache (keyed by style:numeric)
var rtfCache = new Map();
function getRelativeTimeFormat(style, numeric) {
    var key = "".concat(style, ":").concat(numeric);
    var rtf = rtfCache.get(key);
    if (!rtf) {
        rtf = new Intl.RelativeTimeFormat('en', { style: style, numeric: numeric });
        rtfCache.set(key, rtf);
    }
    return rtf;
}
// Timezone is constant for the process lifetime
var cachedTimeZone = null;
function getTimeZone() {
    if (!cachedTimeZone) {
        cachedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return cachedTimeZone;
}
// System locale language subtag (e.g. 'en', 'ja') is constant for the process
// lifetime. null = not yet computed; undefined = computed but unavailable (so
// a stripped-ICU environment fails once instead of retrying on every call).
var cachedSystemLocaleLanguage = null;
function getSystemLocaleLanguage() {
    if (cachedSystemLocaleLanguage === null) {
        try {
            var locale = Intl.DateTimeFormat().resolvedOptions().locale;
            cachedSystemLocaleLanguage = new Intl.Locale(locale).language;
        }
        catch (_a) {
            cachedSystemLocaleLanguage = undefined;
        }
    }
    return cachedSystemLocaleLanguage;
}
