"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAutoModeUnavailableNotification = useAutoModeUnavailableNotification;
var bun_bundle_1 = require("bun:bundle");
var react_1 = require("react");
var notifications_js_1 = require("src/context/notifications.js");
var state_js_1 = require("../../bootstrap/state.js");
var AppState_js_1 = require("../../state/AppState.js");
var permissionSetup_js_1 = require("../../utils/permissions/permissionSetup.js");
var settings_js_1 = require("../../utils/settings/settings.js");
/**
 * Shows a one-shot notification when the shift-tab carousel wraps past where
 * auto mode would have been. Covers all reasons (settings, circuit-breaker,
 * org-allowlist). The startup case (defaultMode: auto silently downgraded) is
 * handled by verifyAutoModeGateAccess → checkAndDisableAutoModeIfNeeded.
 */
function useAutoModeUnavailableNotification() {
    var addNotification = (0, notifications_js_1.useNotifications)().addNotification;
    var mode = (0, AppState_js_1.useAppState)(function (s) { return s.toolPermissionContext.mode; });
    var isAutoModeAvailable = (0, AppState_js_1.useAppState)(function (s) { return s.toolPermissionContext.isAutoModeAvailable; });
    var shownRef = (0, react_1.useRef)(false);
    var prevModeRef = (0, react_1.useRef)(mode);
    (0, react_1.useEffect)(function () {
        var prevMode = prevModeRef.current;
        prevModeRef.current = mode;
        if (!(0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER'))
            return;
        if ((0, state_js_1.getIsRemoteMode)())
            return;
        if (shownRef.current)
            return;
        var wrappedPastAutoSlot = mode === 'default' &&
            prevMode !== 'default' &&
            prevMode !== 'auto' &&
            !isAutoModeAvailable &&
            (0, settings_js_1.hasAutoModeOptIn)();
        if (!wrappedPastAutoSlot)
            return;
        var reason = (0, permissionSetup_js_1.getAutoModeUnavailableReason)();
        if (!reason)
            return;
        shownRef.current = true;
        addNotification({
            key: 'auto-mode-unavailable',
            text: (0, permissionSetup_js_1.getAutoModeUnavailableNotification)(reason),
            color: 'warning',
            priority: 'medium',
        });
    }, [mode, isAutoModeAvailable, addNotification]);
}
