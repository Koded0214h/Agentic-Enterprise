"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useShellPermissionFeedback = useShellPermissionFeedback;
var react_1 = require("react");
var index_js_1 = require("../../services/analytics/index.js");
var metadata_js_1 = require("../../services/analytics/metadata.js");
var AppState_js_1 = require("../../state/AppState.js");
var utils_js_1 = require("./utils.js");
/**
 * Shared feedback-mode state + handlers for shell permission dialogs (Bash,
 * PowerShell). Encapsulates the yes/no input-mode toggle, feedback text state,
 * focus tracking, and reject handling.
 */
function useShellPermissionFeedback(_a) {
    var toolUseConfirm = _a.toolUseConfirm, onDone = _a.onDone, onReject = _a.onReject, explainerVisible = _a.explainerVisible;
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var _b = (0, react_1.useState)(''), rejectFeedback = _b[0], setRejectFeedback = _b[1];
    var _c = (0, react_1.useState)(''), acceptFeedback = _c[0], setAcceptFeedback = _c[1];
    var _d = (0, react_1.useState)(false), yesInputMode = _d[0], setYesInputMode = _d[1];
    var _e = (0, react_1.useState)(false), noInputMode = _e[0], setNoInputMode = _e[1];
    var _f = (0, react_1.useState)('yes'), focusedOption = _f[0], setFocusedOption = _f[1];
    // Track whether user ever entered feedback mode (persists after collapse)
    var _g = (0, react_1.useState)(false), yesFeedbackModeEntered = _g[0], setYesFeedbackModeEntered = _g[1];
    var _h = (0, react_1.useState)(false), noFeedbackModeEntered = _h[0], setNoFeedbackModeEntered = _h[1];
    // Handle Tab key toggling input mode for Yes/No options
    function handleInputModeToggle(option) {
        var _a;
        // Notify that user is interacting with the dialog
        toolUseConfirm.onUserInteraction();
        var analyticsProps = {
            toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(toolUseConfirm.tool.name),
            isMcp: (_a = toolUseConfirm.tool.isMcp) !== null && _a !== void 0 ? _a : false,
        };
        if (option === 'yes') {
            if (yesInputMode) {
                setYesInputMode(false);
                (0, index_js_1.logEvent)('tengu_accept_feedback_mode_collapsed', analyticsProps);
            }
            else {
                setYesInputMode(true);
                setYesFeedbackModeEntered(true);
                (0, index_js_1.logEvent)('tengu_accept_feedback_mode_entered', analyticsProps);
            }
        }
        else if (option === 'no') {
            if (noInputMode) {
                setNoInputMode(false);
                (0, index_js_1.logEvent)('tengu_reject_feedback_mode_collapsed', analyticsProps);
            }
            else {
                setNoInputMode(true);
                setNoFeedbackModeEntered(true);
                (0, index_js_1.logEvent)('tengu_reject_feedback_mode_entered', analyticsProps);
            }
        }
    }
    function handleReject(feedback) {
        var trimmedFeedback = feedback === null || feedback === void 0 ? void 0 : feedback.trim();
        var hasFeedback = !!trimmedFeedback;
        // Log escape if no feedback was provided (user pressed ESC)
        if (!hasFeedback) {
            (0, index_js_1.logEvent)('tengu_permission_request_escape', {
                explainer_visible: explainerVisible,
            });
            // Increment escape count for attribution tracking
            setAppState(function (prev) { return (__assign(__assign({}, prev), { attribution: __assign(__assign({}, prev.attribution), { escapeCount: prev.attribution.escapeCount + 1 }) })); });
        }
        (0, utils_js_1.logUnaryPermissionEvent)('tool_use_single', toolUseConfirm, 'reject', hasFeedback);
        if (trimmedFeedback) {
            toolUseConfirm.onReject(trimmedFeedback);
        }
        else {
            toolUseConfirm.onReject();
        }
        onReject();
        onDone();
    }
    function handleFocus(value) {
        // Notify that user is interacting with the dialog (only if focus changed)
        // This prevents triggering on the initial mount/render
        if (value !== focusedOption) {
            toolUseConfirm.onUserInteraction();
        }
        // Reset input mode when navigating away, but only if no text typed
        if (value !== 'yes' && yesInputMode && !acceptFeedback.trim()) {
            setYesInputMode(false);
        }
        if (value !== 'no' && noInputMode && !rejectFeedback.trim()) {
            setNoInputMode(false);
        }
        setFocusedOption(value);
    }
    return {
        yesInputMode: yesInputMode,
        noInputMode: noInputMode,
        yesFeedbackModeEntered: yesFeedbackModeEntered,
        noFeedbackModeEntered: noFeedbackModeEntered,
        acceptFeedback: acceptFeedback,
        rejectFeedback: rejectFeedback,
        setAcceptFeedback: setAcceptFeedback,
        setRejectFeedback: setRejectFeedback,
        focusedOption: focusedOption,
        handleInputModeToggle: handleInputModeToggle,
        handleReject: handleReject,
        handleFocus: handleFocus,
    };
}
