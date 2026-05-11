"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFilePermissionDialog = useFilePermissionDialog;
var react_1 = require("react");
var AppState_js_1 = require("src/state/AppState.js");
var useKeybinding_js_1 = require("../../../keybindings/useKeybinding.js");
var index_js_1 = require("../../../services/analytics/index.js");
var metadata_js_1 = require("../../../services/analytics/metadata.js");
var permissionOptions_js_1 = require("./permissionOptions.js");
var usePermissionHandler_js_1 = require("./usePermissionHandler.js");
/**
 * Hook for handling file permission dialogs with common logic
 */
function useFilePermissionDialog(_a) {
    var filePath = _a.filePath, completionType = _a.completionType, languageName = _a.languageName, toolUseConfirm = _a.toolUseConfirm, onDone = _a.onDone, onReject = _a.onReject, parseInput = _a.parseInput, _b = _a.operationType, operationType = _b === void 0 ? 'write' : _b;
    var toolPermissionContext = (0, AppState_js_1.useAppState)(function (s) { return s.toolPermissionContext; });
    var _c = (0, react_1.useState)(''), acceptFeedback = _c[0], setAcceptFeedback = _c[1];
    var _d = (0, react_1.useState)(''), rejectFeedback = _d[0], setRejectFeedback = _d[1];
    var _e = (0, react_1.useState)('yes'), focusedOption = _e[0], setFocusedOption = _e[1];
    var _f = (0, react_1.useState)(false), yesInputMode = _f[0], setYesInputMode = _f[1];
    var _g = (0, react_1.useState)(false), noInputMode = _g[0], setNoInputMode = _g[1];
    // Track whether user ever entered feedback mode (persists after collapse)
    var _h = (0, react_1.useState)(false), yesFeedbackModeEntered = _h[0], setYesFeedbackModeEntered = _h[1];
    var _j = (0, react_1.useState)(false), noFeedbackModeEntered = _j[0], setNoFeedbackModeEntered = _j[1];
    // Generate options based on context
    var options = (0, react_1.useMemo)(function () {
        return (0, permissionOptions_js_1.getFilePermissionOptions)({
            filePath: filePath,
            toolPermissionContext: toolPermissionContext,
            operationType: operationType,
            onRejectFeedbackChange: setRejectFeedback,
            onAcceptFeedbackChange: setAcceptFeedback,
            yesInputMode: yesInputMode,
            noInputMode: noInputMode,
        });
    }, [filePath, toolPermissionContext, operationType, yesInputMode, noInputMode]);
    // Handle option selection using shared handlers
    var onChange = (0, react_1.useCallback)(function (option, input, feedback) {
        var params = {
            messageId: toolUseConfirm.assistantMessage.message.id,
            path: filePath,
            toolUseConfirm: toolUseConfirm,
            toolPermissionContext: toolPermissionContext,
            onDone: onDone,
            onReject: onReject,
            completionType: completionType,
            languageName: languageName,
            operationType: operationType,
        };
        // Override the input in toolUseConfirm to pass the parsed input
        var originalOnAllow = toolUseConfirm.onAllow;
        toolUseConfirm.onAllow = function (_input, permissionUpdates, feedback) {
            originalOnAllow(input, permissionUpdates, feedback);
        };
        var handler = usePermissionHandler_js_1.PERMISSION_HANDLERS[option.type];
        handler(params, {
            feedback: feedback,
            hasFeedback: !!feedback,
            enteredFeedbackMode: option.type === 'accept-once'
                ? yesFeedbackModeEntered
                : noFeedbackModeEntered,
            scope: option.type === 'accept-session' ? option.scope : undefined,
        });
    }, [
        filePath,
        completionType,
        languageName,
        toolUseConfirm,
        toolPermissionContext,
        onDone,
        onReject,
        operationType,
        yesFeedbackModeEntered,
        noFeedbackModeEntered,
    ]);
    // Handler for confirm:cycleMode - select accept-session option
    var handleCycleMode = (0, react_1.useCallback)(function () {
        var sessionOption = options.find(function (o) { return o.option.type === 'accept-session'; });
        if (sessionOption) {
            var parsedInput = parseInput(toolUseConfirm.input);
            onChange(sessionOption.option, parsedInput);
        }
    }, [options, parseInput, toolUseConfirm.input, onChange]);
    // Register keyboard shortcut handler via keybindings system
    (0, useKeybinding_js_1.useKeybindings)({ 'confirm:cycleMode': handleCycleMode }, { context: 'Confirmation' });
    // Wrap setFocusedOption and reset input mode when navigating away
    var handleFocusedOptionChange = (0, react_1.useCallback)(function (value) {
        // Reset input mode when navigating away, but only if no text typed
        if (value !== 'yes' && yesInputMode && !acceptFeedback.trim()) {
            setYesInputMode(false);
        }
        if (value !== 'no' && noInputMode && !rejectFeedback.trim()) {
            setNoInputMode(false);
        }
        setFocusedOption(value);
    }, [yesInputMode, noInputMode, acceptFeedback, rejectFeedback]);
    // Handle Tab key toggling input mode for Yes/No options
    var handleInputModeToggle = (0, react_1.useCallback)(function (value) {
        var _a;
        var analyticsProps = {
            toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(toolUseConfirm.tool.name),
            isMcp: (_a = toolUseConfirm.tool.isMcp) !== null && _a !== void 0 ? _a : false,
        };
        if (value === 'yes') {
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
        else if (value === 'no') {
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
    }, [yesInputMode, noInputMode, toolUseConfirm]);
    return {
        options: options,
        onChange: onChange,
        acceptFeedback: acceptFeedback,
        rejectFeedback: rejectFeedback,
        focusedOption: focusedOption,
        setFocusedOption: handleFocusedOptionChange,
        handleInputModeToggle: handleInputModeToggle,
        yesInputMode: yesInputMode,
        noInputMode: noInputMode,
    };
}
