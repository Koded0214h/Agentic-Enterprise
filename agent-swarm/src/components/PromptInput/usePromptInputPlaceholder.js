"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePromptInputPlaceholder = usePromptInputPlaceholder;
var bun_bundle_1 = require("bun:bundle");
var react_1 = require("react");
var useCommandQueue_js_1 = require("src/hooks/useCommandQueue.js");
var AppState_js_1 = require("src/state/AppState.js");
var config_js_1 = require("src/utils/config.js");
var exampleCommands_js_1 = require("src/utils/exampleCommands.js");
var messageQueueManager_js_1 = require("src/utils/messageQueueManager.js");
// Dead code elimination: conditional import for proactive mode
/* eslint-disable @typescript-eslint/no-require-imports */
var proactiveModule = (0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')
    ? require('../../proactive/index.js')
    : null;
var NUM_TIMES_QUEUE_HINT_SHOWN = 3;
var MAX_TEAMMATE_NAME_LENGTH = 20;
function usePromptInputPlaceholder(_a) {
    var input = _a.input, submitCount = _a.submitCount, viewingAgentName = _a.viewingAgentName;
    var queuedCommands = (0, useCommandQueue_js_1.useCommandQueue)();
    var promptSuggestionEnabled = (0, AppState_js_1.useAppState)(function (s) { return s.promptSuggestionEnabled; });
    var placeholder = (0, react_1.useMemo)(function () {
        if (input !== '') {
            return;
        }
        // Show teammate hint when viewing teammate
        if (viewingAgentName) {
            var displayName = viewingAgentName.length > MAX_TEAMMATE_NAME_LENGTH
                ? viewingAgentName.slice(0, MAX_TEAMMATE_NAME_LENGTH - 3) + '...'
                : viewingAgentName;
            return "Message @".concat(displayName, "\u2026");
        }
        // Show queue hint if user has not seen it yet.
        // Only count user-editable commands — task-notification and isMeta
        // are hidden from the prompt area (see PromptInputQueuedCommands).
        if (queuedCommands.some(messageQueueManager_js_1.isQueuedCommandEditable) &&
            ((0, config_js_1.getGlobalConfig)().queuedCommandUpHintCount || 0) <
                NUM_TIMES_QUEUE_HINT_SHOWN) {
            return 'Press up to edit queued messages';
        }
        // Show example command if user has not submitted yet and suggestions are enabled.
        // Skip in proactive mode — the model drives the conversation so onboarding
        // examples are irrelevant and block prompt suggestions from showing.
        if (submitCount < 1 &&
            promptSuggestionEnabled &&
            !(proactiveModule === null || proactiveModule === void 0 ? void 0 : proactiveModule.isProactiveActive())) {
            return (0, exampleCommands_js_1.getExampleCommandFromCache)();
        }
    }, [
        input,
        queuedCommands,
        submitCount,
        promptSuggestionEnabled,
        viewingAgentName,
    ]);
    return placeholder;
}
