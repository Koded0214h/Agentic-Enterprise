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
exports.resolveKey = resolveKey;
exports.getBindingDisplayText = getBindingDisplayText;
exports.keystrokesEqual = keystrokesEqual;
exports.resolveKeyWithChordState = resolveKeyWithChordState;
var match_js_1 = require("./match.js");
var parser_js_1 = require("./parser.js");
/**
 * Resolve a key input to an action.
 * Pure function - no state, no side effects, just matching logic.
 *
 * @param input - The character input from Ink
 * @param key - The Key object from Ink with modifier flags
 * @param activeContexts - Array of currently active contexts (e.g., ['Chat', 'Global'])
 * @param bindings - All parsed bindings to search through
 * @returns The resolution result
 */
function resolveKey(input, key, activeContexts, bindings) {
    // Find matching bindings (last one wins for user overrides)
    var match;
    var ctxSet = new Set(activeContexts);
    for (var _i = 0, bindings_1 = bindings; _i < bindings_1.length; _i++) {
        var binding = bindings_1[_i];
        // Phase 1: Only single-keystroke bindings
        if (binding.chord.length !== 1)
            continue;
        if (!ctxSet.has(binding.context))
            continue;
        if ((0, match_js_1.matchesBinding)(input, key, binding)) {
            match = binding;
        }
    }
    if (!match) {
        return { type: 'none' };
    }
    if (match.action === null) {
        return { type: 'unbound' };
    }
    return { type: 'match', action: match.action };
}
/**
 * Get display text for an action from bindings (e.g., "ctrl+t" for "app:toggleTodos").
 * Searches in reverse order so user overrides take precedence.
 */
function getBindingDisplayText(action, context, bindings) {
    // Find the last binding for this action in this context
    var binding = bindings.findLast(function (b) { return b.action === action && b.context === context; });
    return binding ? (0, parser_js_1.chordToString)(binding.chord) : undefined;
}
/**
 * Build a ParsedKeystroke from Ink's input/key.
 */
function buildKeystroke(input, key) {
    var keyName = (0, match_js_1.getKeyName)(input, key);
    if (!keyName)
        return null;
    // QUIRK: Ink sets key.meta=true when escape is pressed (see input-event.ts).
    // This is legacy terminal behavior - we should NOT record this as a modifier
    // for the escape key itself, otherwise chord matching will fail.
    var effectiveMeta = key.escape ? false : key.meta;
    return {
        key: keyName,
        ctrl: key.ctrl,
        alt: effectiveMeta,
        shift: key.shift,
        meta: effectiveMeta,
        super: key.super,
    };
}
/**
 * Compare two ParsedKeystrokes for equality. Collapses alt/meta into
 * one logical modifier — legacy terminals can't distinguish them (see
 * match.ts modifiersMatch), so "alt+k" and "meta+k" are the same key.
 * Super (cmd/win) is distinct — only arrives via kitty keyboard protocol.
 */
function keystrokesEqual(a, b) {
    return (a.key === b.key &&
        a.ctrl === b.ctrl &&
        a.shift === b.shift &&
        (a.alt || a.meta) === (b.alt || b.meta) &&
        a.super === b.super);
}
/**
 * Check if a chord prefix matches the beginning of a binding's chord.
 */
function chordPrefixMatches(prefix, binding) {
    if (prefix.length >= binding.chord.length)
        return false;
    for (var i = 0; i < prefix.length; i++) {
        var prefixKey = prefix[i];
        var bindingKey = binding.chord[i];
        if (!prefixKey || !bindingKey)
            return false;
        if (!keystrokesEqual(prefixKey, bindingKey))
            return false;
    }
    return true;
}
/**
 * Check if a full chord matches a binding's chord.
 */
function chordExactlyMatches(chord, binding) {
    if (chord.length !== binding.chord.length)
        return false;
    for (var i = 0; i < chord.length; i++) {
        var chordKey = chord[i];
        var bindingKey = binding.chord[i];
        if (!chordKey || !bindingKey)
            return false;
        if (!keystrokesEqual(chordKey, bindingKey))
            return false;
    }
    return true;
}
/**
 * Resolve a key with chord state support.
 *
 * This function handles multi-keystroke chord bindings like "ctrl+k ctrl+s".
 *
 * @param input - The character input from Ink
 * @param key - The Key object from Ink with modifier flags
 * @param activeContexts - Array of currently active contexts
 * @param bindings - All parsed bindings
 * @param pending - Current chord state (null if not in a chord)
 * @returns Resolution result with chord state
 */
function resolveKeyWithChordState(input, key, activeContexts, bindings, pending) {
    // Cancel chord on escape
    if (key.escape && pending !== null) {
        return { type: 'chord_cancelled' };
    }
    // Build current keystroke
    var currentKeystroke = buildKeystroke(input, key);
    if (!currentKeystroke) {
        if (pending !== null) {
            return { type: 'chord_cancelled' };
        }
        return { type: 'none' };
    }
    // Build the full chord sequence to test
    var testChord = pending
        ? __spreadArray(__spreadArray([], pending, true), [currentKeystroke], false) : [currentKeystroke];
    // Filter bindings by active contexts (Set lookup: O(n) instead of O(n·m))
    var ctxSet = new Set(activeContexts);
    var contextBindings = bindings.filter(function (b) { return ctxSet.has(b.context); });
    // Check if this could be a prefix for longer chords. Group by chord
    // string so a later null-override shadows the default it unbinds —
    // otherwise null-unbinding `ctrl+x ctrl+k` still makes `ctrl+x` enter
    // chord-wait and the single-key binding on the prefix never fires.
    var chordWinners = new Map();
    for (var _i = 0, contextBindings_1 = contextBindings; _i < contextBindings_1.length; _i++) {
        var binding = contextBindings_1[_i];
        if (binding.chord.length > testChord.length &&
            chordPrefixMatches(testChord, binding)) {
            chordWinners.set((0, parser_js_1.chordToString)(binding.chord), binding.action);
        }
    }
    var hasLongerChords = false;
    for (var _a = 0, _b = chordWinners.values(); _a < _b.length; _a++) {
        var action = _b[_a];
        if (action !== null) {
            hasLongerChords = true;
            break;
        }
    }
    // If this keystroke could start a longer chord, prefer that
    // (even if there's an exact single-key match)
    if (hasLongerChords) {
        return { type: 'chord_started', pending: testChord };
    }
    // Check for exact matches (last one wins)
    var exactMatch;
    for (var _c = 0, contextBindings_2 = contextBindings; _c < contextBindings_2.length; _c++) {
        var binding = contextBindings_2[_c];
        if (chordExactlyMatches(testChord, binding)) {
            exactMatch = binding;
        }
    }
    if (exactMatch) {
        if (exactMatch.action === null) {
            return { type: 'unbound' };
        }
        return { type: 'match', action: exactMatch.action };
    }
    // No match and no potential longer chords
    if (pending !== null) {
        return { type: 'chord_cancelled' };
    }
    return { type: 'none' };
}
