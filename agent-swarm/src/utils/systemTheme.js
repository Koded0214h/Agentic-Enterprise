"use strict";
/**
 * Terminal dark/light mode detection for the 'auto' theme setting.
 *
 * Detection is based on the terminal's actual background color (queried via
 * OSC 11 by systemThemeWatcher.ts) rather than the OS appearance setting —
 * a dark terminal on a light-mode OS should still resolve to 'dark'.
 *
 * The detected theme is cached module-level so callers can resolve 'auto'
 * without awaiting the async OSC round-trip. The cache is seeded from
 * $COLORFGBG (synchronous, set by some terminals at launch) and then
 * updated by the watcher once the OSC 11 response arrives.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemThemeName = getSystemThemeName;
exports.setCachedSystemTheme = setCachedSystemTheme;
exports.resolveThemeSetting = resolveThemeSetting;
exports.themeFromOscColor = themeFromOscColor;
var cachedSystemTheme;
/**
 * Get the current terminal theme. Cached after first detection; the watcher
 * updates the cache on live changes.
 */
function getSystemThemeName() {
    var _a;
    if (cachedSystemTheme === undefined) {
        cachedSystemTheme = (_a = detectFromColorFgBg()) !== null && _a !== void 0 ? _a : 'dark';
    }
    return cachedSystemTheme;
}
/**
 * Update the cached terminal theme. Called by the watcher when the OSC 11
 * query returns so non-React call sites stay in sync.
 */
function setCachedSystemTheme(theme) {
    cachedSystemTheme = theme;
}
/**
 * Resolve a ThemeSetting (which may be 'auto') to a concrete ThemeName.
 */
function resolveThemeSetting(setting) {
    if (setting === 'auto') {
        return getSystemThemeName();
    }
    return setting;
}
/**
 * Parse an OSC color response data string into a theme.
 *
 * Accepts XParseColor formats returned by OSC 10/11 queries:
 * - `rgb:R/G/B` where each component is 1–4 hex digits (each scaled to
 *   [0, 16^n - 1] for n digits). This is what xterm, iTerm2, Terminal.app,
 *   Ghostty, kitty, Alacritty, etc. return.
 * - `#RRGGBB` / `#RRRRGGGGBBBB` (rare, but cheap to accept).
 *
 * Returns undefined for unrecognized formats so callers can fall back.
 */
function themeFromOscColor(data) {
    var rgb = parseOscRgb(data);
    if (!rgb)
        return undefined;
    // ITU-R BT.709 relative luminance. Midpoint split: > 0.5 is light.
    var luminance = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
    return luminance > 0.5 ? 'light' : 'dark';
}
function parseOscRgb(data) {
    // rgb:RRRR/GGGG/BBBB — each component is 1–4 hex digits.
    // Some terminals append an alpha component (rgba:…/…/…/…); ignore it.
    var rgbMatch = /^rgba?:([0-9a-f]{1,4})\/([0-9a-f]{1,4})\/([0-9a-f]{1,4})/i.exec(data);
    if (rgbMatch) {
        return {
            r: hexComponent(rgbMatch[1]),
            g: hexComponent(rgbMatch[2]),
            b: hexComponent(rgbMatch[3]),
        };
    }
    // #RRGGBB or #RRRRGGGGBBBB — split into three equal hex runs.
    var hashMatch = /^#([0-9a-f]+)$/i.exec(data);
    if (hashMatch && hashMatch[1].length % 3 === 0) {
        var hex = hashMatch[1];
        var n = hex.length / 3;
        return {
            r: hexComponent(hex.slice(0, n)),
            g: hexComponent(hex.slice(n, 2 * n)),
            b: hexComponent(hex.slice(2 * n)),
        };
    }
    return undefined;
}
/** Normalize a 1–4 digit hex component to [0, 1]. */
function hexComponent(hex) {
    var max = Math.pow(16, hex.length) - 1;
    return parseInt(hex, 16) / max;
}
/**
 * Read $COLORFGBG for a synchronous initial guess before the OSC 11
 * round-trip completes. Format is `fg;bg` (or `fg;other;bg`) where values
 * are ANSI color indices. rxvt convention: bg 0–6 or 8 are dark; bg 7
 * and 9–15 are light. Only set by some terminals (rxvt-family, Konsole,
 * iTerm2 with the option enabled), so this is a best-effort hint.
 */
function detectFromColorFgBg() {
    var colorfgbg = process.env['COLORFGBG'];
    if (!colorfgbg)
        return undefined;
    var parts = colorfgbg.split(';');
    var bg = parts[parts.length - 1];
    if (bg === undefined || bg === '')
        return undefined;
    var bgNum = Number(bg);
    if (!Number.isInteger(bgNum) || bgNum < 0 || bgNum > 15)
        return undefined;
    // 0–6 and 8 are dark ANSI colors; 7 (white) and 9–15 (bright) are light.
    return bgNum <= 6 || bgNum === 8 ? 'dark' : 'light';
}
