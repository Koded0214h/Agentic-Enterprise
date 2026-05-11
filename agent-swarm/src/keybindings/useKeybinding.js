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
exports.useKeybinding = useKeybinding;
exports.useKeybindings = useKeybindings;
var react_1 = require("react");
var ink_js_1 = require("../ink.js");
var KeybindingContext_js_1 = require("./KeybindingContext.js");
/**
 * Ink-native hook for handling a keybinding.
 *
 * The handler stays in the component (React way).
 * The binding (keystroke → action) comes from config.
 *
 * Supports chord sequences (e.g., "ctrl+k ctrl+s"). When a chord is started,
 * the hook will manage the pending state automatically.
 *
 * Uses stopImmediatePropagation() to prevent other handlers from firing
 * once this binding is handled.
 *
 * @example
 * ```tsx
 * useKeybinding('app:toggleTodos', () => {
 *   setShowTodos(prev => !prev)
 * }, { context: 'Global' })
 * ```
 */
function useKeybinding(action, handler, options) {
    if (options === void 0) { options = {}; }
    var _a = options.context, context = _a === void 0 ? 'Global' : _a, _b = options.isActive, isActive = _b === void 0 ? true : _b;
    var keybindingContext = (0, KeybindingContext_js_1.useOptionalKeybindingContext)();
    // Register handler with the context for ChordInterceptor to invoke
    (0, react_1.useEffect)(function () {
        if (!keybindingContext || !isActive)
            return;
        return keybindingContext.registerHandler({ action: action, context: context, handler: handler });
    }, [action, context, handler, keybindingContext, isActive]);
    var handleInput = (0, react_1.useCallback)(function (input, key, event) {
        // If no keybinding context available, skip resolution
        if (!keybindingContext)
            return;
        // Build context list: registered active contexts + this context + Global
        // More specific contexts (registered ones) take precedence over Global
        var contextsToCheck = __spreadArray(__spreadArray([], keybindingContext.activeContexts, true), [
            context,
            'Global',
        ], false);
        // Deduplicate while preserving order (first occurrence wins for priority)
        var uniqueContexts = __spreadArray([], new Set(contextsToCheck), true);
        var result = keybindingContext.resolve(input, key, uniqueContexts);
        switch (result.type) {
            case 'match':
                // Chord completed (if any) - clear pending state
                keybindingContext.setPendingChord(null);
                if (result.action === action) {
                    if (handler() !== false) {
                        event.stopImmediatePropagation();
                    }
                }
                break;
            case 'chord_started':
                // User started a chord sequence - update pending state
                keybindingContext.setPendingChord(result.pending);
                event.stopImmediatePropagation();
                break;
            case 'chord_cancelled':
                // Chord was cancelled (escape or invalid key)
                keybindingContext.setPendingChord(null);
                break;
            case 'unbound':
                // Explicitly unbound - clear any pending chord
                keybindingContext.setPendingChord(null);
                event.stopImmediatePropagation();
                break;
            case 'none':
                // No match - let other handlers try
                break;
        }
    }, [action, context, handler, keybindingContext]);
    (0, ink_js_1.useInput)(handleInput, { isActive: isActive });
}
/**
 * Handle multiple keybindings in one hook (reduces useInput calls).
 *
 * Supports chord sequences. When a chord is started, the hook will
 * manage the pending state automatically.
 *
 * @example
 * ```tsx
 * useKeybindings({
 *   'chat:submit': () => handleSubmit(),
 *   'chat:cancel': () => handleCancel(),
 * }, { context: 'Chat' })
 * ```
 */
function useKeybindings(
// Handler returning `false` means "not consumed" — the event propagates
// to later useInput/useKeybindings handlers. Useful for fall-through:
// e.g. ScrollKeybindingHandler's scroll:line* returns false when the
// ScrollBox content fits (scroll is a no-op), letting a child component's
// handler take the wheel event for list navigation instead. Promise<void>
// is allowed for fire-and-forget async handlers (the `!== false` check
// only skips propagation for a sync `false`, not a pending Promise).
handlers, options) {
    if (options === void 0) { options = {}; }
    var _a = options.context, context = _a === void 0 ? 'Global' : _a, _b = options.isActive, isActive = _b === void 0 ? true : _b;
    var keybindingContext = (0, KeybindingContext_js_1.useOptionalKeybindingContext)();
    // Register all handlers with the context for ChordInterceptor to invoke
    (0, react_1.useEffect)(function () {
        if (!keybindingContext || !isActive)
            return;
        var unregisterFns = [];
        for (var _i = 0, _a = Object.entries(handlers); _i < _a.length; _i++) {
            var _b = _a[_i], action = _b[0], handler = _b[1];
            unregisterFns.push(keybindingContext.registerHandler({ action: action, context: context, handler: handler }));
        }
        return function () {
            for (var _i = 0, unregisterFns_1 = unregisterFns; _i < unregisterFns_1.length; _i++) {
                var unregister = unregisterFns_1[_i];
                unregister();
            }
        };
    }, [context, handlers, keybindingContext, isActive]);
    var handleInput = (0, react_1.useCallback)(function (input, key, event) {
        // If no keybinding context available, skip resolution
        if (!keybindingContext)
            return;
        // Build context list: registered active contexts + this context + Global
        // More specific contexts (registered ones) take precedence over Global
        var contextsToCheck = __spreadArray(__spreadArray([], keybindingContext.activeContexts, true), [
            context,
            'Global',
        ], false);
        // Deduplicate while preserving order (first occurrence wins for priority)
        var uniqueContexts = __spreadArray([], new Set(contextsToCheck), true);
        var result = keybindingContext.resolve(input, key, uniqueContexts);
        switch (result.type) {
            case 'match':
                // Chord completed (if any) - clear pending state
                keybindingContext.setPendingChord(null);
                if (result.action in handlers) {
                    var handler = handlers[result.action];
                    if (handler && handler() !== false) {
                        event.stopImmediatePropagation();
                    }
                }
                break;
            case 'chord_started':
                // User started a chord sequence - update pending state
                keybindingContext.setPendingChord(result.pending);
                event.stopImmediatePropagation();
                break;
            case 'chord_cancelled':
                // Chord was cancelled (escape or invalid key)
                keybindingContext.setPendingChord(null);
                break;
            case 'unbound':
                // Explicitly unbound - clear any pending chord
                keybindingContext.setPendingChord(null);
                event.stopImmediatePropagation();
                break;
            case 'none':
                // No match - let other handlers try
                break;
        }
    }, [context, handlers, keybindingContext]);
    (0, ink_js_1.useInput)(handleInput, { isActive: isActive });
}
