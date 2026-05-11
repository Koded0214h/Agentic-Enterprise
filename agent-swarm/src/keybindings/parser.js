"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseKeystroke = parseKeystroke;
exports.parseChord = parseChord;
exports.keystrokeToString = keystrokeToString;
exports.chordToString = chordToString;
exports.keystrokeToDisplayString = keystrokeToDisplayString;
exports.chordToDisplayString = chordToDisplayString;
exports.parseBindings = parseBindings;
/**
 * Parse a keystroke string like "ctrl+shift+k" into a ParsedKeystroke.
 * Supports various modifier aliases (ctrl/control, alt/opt/option/meta,
 * cmd/command/super/win).
 */
function parseKeystroke(input) {
    var parts = input.split('+');
    var keystroke = {
        key: '',
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
        super: false,
    };
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        var lower = part.toLowerCase();
        switch (lower) {
            case 'ctrl':
            case 'control':
                keystroke.ctrl = true;
                break;
            case 'alt':
            case 'opt':
            case 'option':
                keystroke.alt = true;
                break;
            case 'shift':
                keystroke.shift = true;
                break;
            case 'meta':
                keystroke.meta = true;
                break;
            case 'cmd':
            case 'command':
            case 'super':
            case 'win':
                keystroke.super = true;
                break;
            case 'esc':
                keystroke.key = 'escape';
                break;
            case 'return':
                keystroke.key = 'enter';
                break;
            case 'space':
                keystroke.key = ' ';
                break;
            case '↑':
                keystroke.key = 'up';
                break;
            case '↓':
                keystroke.key = 'down';
                break;
            case '←':
                keystroke.key = 'left';
                break;
            case '→':
                keystroke.key = 'right';
                break;
            default:
                keystroke.key = lower;
                break;
        }
    }
    return keystroke;
}
/**
 * Parse a chord string like "ctrl+k ctrl+s" into an array of ParsedKeystrokes.
 */
function parseChord(input) {
    // A lone space character IS the space key binding, not a separator
    if (input === ' ')
        return [parseKeystroke('space')];
    return input.trim().split(/\s+/).map(parseKeystroke);
}
/**
 * Convert a ParsedKeystroke to its canonical string representation for display.
 */
function keystrokeToString(ks) {
    var parts = [];
    if (ks.ctrl)
        parts.push('ctrl');
    if (ks.alt)
        parts.push('alt');
    if (ks.shift)
        parts.push('shift');
    if (ks.meta)
        parts.push('meta');
    if (ks.super)
        parts.push('cmd');
    // Use readable names for display
    var displayKey = keyToDisplayName(ks.key);
    parts.push(displayKey);
    return parts.join('+');
}
/**
 * Map internal key names to human-readable display names.
 */
function keyToDisplayName(key) {
    switch (key) {
        case 'escape':
            return 'Esc';
        case ' ':
            return 'Space';
        case 'tab':
            return 'tab';
        case 'enter':
            return 'Enter';
        case 'backspace':
            return 'Backspace';
        case 'delete':
            return 'Delete';
        case 'up':
            return '↑';
        case 'down':
            return '↓';
        case 'left':
            return '←';
        case 'right':
            return '→';
        case 'pageup':
            return 'PageUp';
        case 'pagedown':
            return 'PageDown';
        case 'home':
            return 'Home';
        case 'end':
            return 'End';
        default:
            return key;
    }
}
/**
 * Convert a Chord to its canonical string representation for display.
 */
function chordToString(chord) {
    return chord.map(keystrokeToString).join(' ');
}
/**
 * Convert a ParsedKeystroke to a platform-appropriate display string.
 * Uses "opt" for alt on macOS, "alt" elsewhere.
 */
function keystrokeToDisplayString(ks, platform) {
    if (platform === void 0) { platform = 'linux'; }
    var parts = [];
    if (ks.ctrl)
        parts.push('ctrl');
    // Alt/meta are equivalent in terminals, show platform-appropriate name
    if (ks.alt || ks.meta) {
        // Only macOS uses "opt", all other platforms use "alt"
        parts.push(platform === 'macos' ? 'opt' : 'alt');
    }
    if (ks.shift)
        parts.push('shift');
    if (ks.super) {
        parts.push(platform === 'macos' ? 'cmd' : 'super');
    }
    // Use readable names for display
    var displayKey = keyToDisplayName(ks.key);
    parts.push(displayKey);
    return parts.join('+');
}
/**
 * Convert a Chord to a platform-appropriate display string.
 */
function chordToDisplayString(chord, platform) {
    if (platform === void 0) { platform = 'linux'; }
    return chord.map(function (ks) { return keystrokeToDisplayString(ks, platform); }).join(' ');
}
/**
 * Parse keybinding blocks (from JSON config) into a flat list of ParsedBindings.
 */
function parseBindings(blocks) {
    var bindings = [];
    for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
        var block = blocks_1[_i];
        for (var _a = 0, _b = Object.entries(block.bindings); _a < _b.length; _a++) {
            var _c = _b[_a], key = _c[0], action = _c[1];
            bindings.push({
                chord: parseChord(key),
                action: action,
                context: block.context,
            });
        }
    }
    return bindings;
}
