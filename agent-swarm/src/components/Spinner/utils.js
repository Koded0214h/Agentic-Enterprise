"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultCharacters = getDefaultCharacters;
exports.interpolateColor = interpolateColor;
exports.toRGBColor = toRGBColor;
exports.hueToRgb = hueToRgb;
exports.parseRGB = parseRGB;
function getDefaultCharacters() {
    if (process.env.TERM === 'xterm-ghostty') {
        return ['·', '✢', '✳', '✶', '✻', '*']; // Use * instead of ✽ for Ghostty because the latter renders in a way that's slightly offset
    }
    return process.platform === 'darwin'
        ? ['·', '✢', '✳', '✶', '✻', '✽']
        : ['·', '✢', '*', '✶', '✻', '✽'];
}
// Interpolate between two RGB colors
function interpolateColor(color1, color2, t) {
    return {
        r: Math.round(color1.r + (color2.r - color1.r) * t),
        g: Math.round(color1.g + (color2.g - color1.g) * t),
        b: Math.round(color1.b + (color2.b - color1.b) * t),
    };
}
// Convert RGB object to rgb() color string for Text component
function toRGBColor(color) {
    return "rgb(".concat(color.r, ",").concat(color.g, ",").concat(color.b, ")");
}
// HSL hue (0-360) to RGB, using voice-mode waveform parameters (s=0.7, l=0.6).
function hueToRgb(hue) {
    var h = ((hue % 360) + 360) % 360;
    var s = 0.7;
    var l = 0.6;
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    var m = l - c / 2;
    var r = 0;
    var g = 0;
    var b = 0;
    if (h < 60) {
        r = c;
        g = x;
    }
    else if (h < 120) {
        r = x;
        g = c;
    }
    else if (h < 180) {
        g = c;
        b = x;
    }
    else if (h < 240) {
        g = x;
        b = c;
    }
    else if (h < 300) {
        r = x;
        b = c;
    }
    else {
        r = c;
        b = x;
    }
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
    };
}
var RGB_CACHE = new Map();
function parseRGB(colorStr) {
    var cached = RGB_CACHE.get(colorStr);
    if (cached !== undefined)
        return cached;
    var match = colorStr.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    var result = match
        ? {
            r: parseInt(match[1], 10),
            g: parseInt(match[2], 10),
            b: parseInt(match[3], 10),
        }
        : null;
    RGB_CACHE.set(colorStr, result);
    return result;
}
