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
exports.usePromptSuggestion = usePromptSuggestion;
var react_1 = require("react");
var use_terminal_focus_js_1 = require("../ink/hooks/use-terminal-focus.js");
var index_js_1 = require("../services/analytics/index.js");
var speculation_js_1 = require("../services/PromptSuggestion/speculation.js");
var AppState_js_1 = require("../state/AppState.js");
function usePromptSuggestion(_a) {
    var inputValue = _a.inputValue, isAssistantResponding = _a.isAssistantResponding;
    var promptSuggestion = (0, AppState_js_1.useAppState)(function (s) { return s.promptSuggestion; });
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var isTerminalFocused = (0, use_terminal_focus_js_1.useTerminalFocus)();
    var suggestionText = promptSuggestion.text, promptId = promptSuggestion.promptId, shownAt = promptSuggestion.shownAt, acceptedAt = promptSuggestion.acceptedAt, generationRequestId = promptSuggestion.generationRequestId;
    var suggestion = isAssistantResponding || inputValue.length > 0 ? null : suggestionText;
    var isValidSuggestion = suggestionText && shownAt > 0;
    // Track engagement depth for telemetry
    var firstKeystrokeAt = (0, react_1.useRef)(0);
    var wasFocusedWhenShown = (0, react_1.useRef)(true);
    var prevShownAt = (0, react_1.useRef)(0);
    // Capture focus state when a new suggestion appears (shownAt changes)
    if (shownAt > 0 && shownAt !== prevShownAt.current) {
        prevShownAt.current = shownAt;
        wasFocusedWhenShown.current = isTerminalFocused;
        firstKeystrokeAt.current = 0;
    }
    else if (shownAt === 0) {
        prevShownAt.current = 0;
    }
    // Record first keystroke while suggestion is visible
    if (inputValue.length > 0 &&
        firstKeystrokeAt.current === 0 &&
        isValidSuggestion) {
        firstKeystrokeAt.current = Date.now();
    }
    var resetSuggestion = (0, react_1.useCallback)(function () {
        (0, speculation_js_1.abortSpeculation)(setAppState);
        setAppState(function (prev) { return (__assign(__assign({}, prev), { promptSuggestion: {
                text: null,
                promptId: null,
                shownAt: 0,
                acceptedAt: 0,
                generationRequestId: null,
            } })); });
    }, [setAppState]);
    var markAccepted = (0, react_1.useCallback)(function () {
        if (!isValidSuggestion)
            return;
        setAppState(function (prev) { return (__assign(__assign({}, prev), { promptSuggestion: __assign(__assign({}, prev.promptSuggestion), { acceptedAt: Date.now() }) })); });
    }, [isValidSuggestion, setAppState]);
    var markShown = (0, react_1.useCallback)(function () {
        // Check shownAt inside setAppState callback to avoid depending on it
        // (depending on shownAt causes infinite loop when this callback is called)
        setAppState(function (prev) {
            // Only mark shown if not already shown and suggestion exists
            if (prev.promptSuggestion.shownAt !== 0 || !prev.promptSuggestion.text) {
                return prev;
            }
            return __assign(__assign({}, prev), { promptSuggestion: __assign(__assign({}, prev.promptSuggestion), { shownAt: Date.now() }) });
        });
    }, [setAppState]);
    var logOutcomeAtSubmission = (0, react_1.useCallback)(function (finalInput, opts) {
        if (!isValidSuggestion)
            return;
        // Determine if accepted: either Tab was pressed (acceptedAt set) OR
        // final input matches suggestion (empty Enter case)
        var tabWasPressed = acceptedAt > shownAt;
        var wasAccepted = tabWasPressed || finalInput === suggestionText;
        var timeMs = wasAccepted ? acceptedAt || Date.now() : Date.now();
        (0, index_js_1.logEvent)('tengu_prompt_suggestion', __assign(__assign(__assign(__assign(__assign(__assign(__assign({ source: 'cli', outcome: (wasAccepted
                ? 'accepted'
                : 'ignored'), prompt_id: promptId }, (generationRequestId && {
            generationRequestId: generationRequestId,
        })), (wasAccepted && {
            acceptMethod: (tabWasPressed
                ? 'tab'
                : 'enter'),
        })), (wasAccepted && {
            timeToAcceptMs: timeMs - shownAt,
        })), (!wasAccepted && {
            timeToIgnoreMs: timeMs - shownAt,
        })), (firstKeystrokeAt.current > 0 && {
            timeToFirstKeystrokeMs: firstKeystrokeAt.current - shownAt,
        })), { wasFocusedWhenShown: wasFocusedWhenShown.current, similarity: Math.round((finalInput.length / ((suggestionText === null || suggestionText === void 0 ? void 0 : suggestionText.length) || 1)) * 100) / 100 }), (process.env.USER_TYPE === 'ant' && {
            suggestion: suggestionText,
            userInput: finalInput,
        })));
        if (!(opts === null || opts === void 0 ? void 0 : opts.skipReset))
            resetSuggestion();
    }, [
        isValidSuggestion,
        acceptedAt,
        shownAt,
        suggestionText,
        promptId,
        generationRequestId,
        resetSuggestion,
    ]);
    return {
        suggestion: suggestion,
        markAccepted: markAccepted,
        markShown: markShown,
        logOutcomeAtSubmission: logOutcomeAtSubmission,
    };
}
