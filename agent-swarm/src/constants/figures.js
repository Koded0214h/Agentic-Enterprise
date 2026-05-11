"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRIDGE_FAILED_INDICATOR = exports.BRIDGE_READY_INDICATOR = exports.BRIDGE_SPINNER_FRAMES = exports.HEAVY_HORIZONTAL = exports.BLOCKQUOTE_BAR = exports.FLAG_ICON = exports.REFERENCE_MARK = exports.DIAMOND_FILLED = exports.DIAMOND_OPEN = exports.FORK_GLYPH = exports.INJECTED_ARROW = exports.CHANNEL_ARROW = exports.REFRESH_ARROW = exports.PAUSE_ICON = exports.PLAY_ICON = exports.EFFORT_MAX = exports.EFFORT_HIGH = exports.EFFORT_MEDIUM = exports.EFFORT_LOW = exports.LIGHTNING_BOLT = exports.DOWN_ARROW = exports.UP_ARROW = exports.TEARDROP_ASTERISK = exports.BULLET_OPERATOR = exports.BLACK_CIRCLE = void 0;
var env_js_1 = require("../utils/env.js");
// The former is better vertically aligned, but isn't usually supported on Windows/Linux
exports.BLACK_CIRCLE = env_js_1.env.platform === 'darwin' ? '⏺' : '●';
exports.BULLET_OPERATOR = '∙';
exports.TEARDROP_ASTERISK = '✻';
exports.UP_ARROW = '\u2191'; // ↑ - used for opus 1m merge notice
exports.DOWN_ARROW = '\u2193'; // ↓ - used for scroll hint
exports.LIGHTNING_BOLT = '↯'; // \u21af - used for fast mode indicator
exports.EFFORT_LOW = '○'; // \u25cb - effort level: low
exports.EFFORT_MEDIUM = '◐'; // \u25d0 - effort level: medium
exports.EFFORT_HIGH = '●'; // \u25cf - effort level: high
exports.EFFORT_MAX = '◉'; // \u25c9 - effort level: max (Opus 4.6 only)
// Media/trigger status indicators
exports.PLAY_ICON = '\u25b6'; // ▶
exports.PAUSE_ICON = '\u23f8'; // ⏸
// MCP subscription indicators
exports.REFRESH_ARROW = '\u21bb'; // ↻ - used for resource update indicator
exports.CHANNEL_ARROW = '\u2190'; // ← - inbound channel message indicator
exports.INJECTED_ARROW = '\u2192'; // → - cross-session injected message indicator
exports.FORK_GLYPH = '\u2442'; // ⑂ - fork directive indicator
// Review status indicators (ultrareview diamond states)
exports.DIAMOND_OPEN = '\u25c7'; // ◇ - running
exports.DIAMOND_FILLED = '\u25c6'; // ◆ - completed/failed
exports.REFERENCE_MARK = '\u203b'; // ※ - komejirushi, away-summary recap marker
// Issue flag indicator
exports.FLAG_ICON = '\u2691'; // ⚑ - used for issue flag banner
// Blockquote indicator
exports.BLOCKQUOTE_BAR = '\u258e'; // ▎ - left one-quarter block, used as blockquote line prefix
exports.HEAVY_HORIZONTAL = '\u2501'; // ━ - heavy box-drawing horizontal
// Bridge status indicators
exports.BRIDGE_SPINNER_FRAMES = [
    '\u00b7|\u00b7',
    '\u00b7/\u00b7',
    '\u00b7\u2014\u00b7',
    '\u00b7\\\u00b7',
];
exports.BRIDGE_READY_INDICATOR = '\u00b7\u2714\ufe0e\u00b7';
exports.BRIDGE_FAILED_INDICATOR = '\u00d7';
