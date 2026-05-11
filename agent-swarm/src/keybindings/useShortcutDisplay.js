"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useShortcutDisplay = useShortcutDisplay;
var react_1 = require("react");
var index_js_1 = require("../services/analytics/index.js");
var KeybindingContext_js_1 = require("./KeybindingContext.js");
// TODO(keybindings-migration): Remove fallback parameter after migration is complete
// and we've confirmed no 'keybinding_fallback_used' events are being logged.
// The fallback exists as a safety net during migration - if bindings fail to load
// or an action isn't found, we fall back to hardcoded values. Once stable, callers
// should be able to trust that getBindingDisplayText always returns a value for
// known actions, and we can remove this defensive pattern.
/**
 * Hook to get the display text for a configured shortcut.
 * Returns the configured binding or a fallback if unavailable.
 *
 * @param action - The action name (e.g., 'app:toggleTranscript')
 * @param context - The keybinding context (e.g., 'Global')
 * @param fallback - Fallback text if keybinding context unavailable
 * @returns The configured shortcut display text
 *
 * @example
 * const expandShortcut = useShortcutDisplay('app:toggleTranscript', 'Global', 'ctrl+o')
 * // Returns the user's configured binding, or 'ctrl+o' as default
 */
function useShortcutDisplay(action, context, fallback) {
    var keybindingContext = (0, KeybindingContext_js_1.useOptionalKeybindingContext)();
    var resolved = keybindingContext === null || keybindingContext === void 0 ? void 0 : keybindingContext.getDisplayText(action, context);
    var isFallback = resolved === undefined;
    var reason = keybindingContext ? 'action_not_found' : 'no_context';
    // Log fallback usage once per mount (not on every render) to avoid
    // flooding analytics with events from frequent re-renders.
    var hasLoggedRef = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        if (isFallback && !hasLoggedRef.current) {
            hasLoggedRef.current = true;
            (0, index_js_1.logEvent)('tengu_keybinding_fallback_used', {
                action: action,
                context: context,
                fallback: fallback,
                reason: reason,
            });
        }
    }, [isFallback, action, context, fallback, reason]);
    return isFallback ? fallback : resolved;
}
