"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFrontmatterHooks = registerFrontmatterHooks;
var agentSdkTypes_js_1 = require("src/entrypoints/agentSdkTypes.js");
var debug_js_1 = require("../debug.js");
var sessionHooks_js_1 = require("./sessionHooks.js");
/**
 * Register hooks from frontmatter (agent or skill) into session-scoped hooks.
 * These hooks will be active for the duration of the session/agent and cleaned up
 * when the session/agent ends.
 *
 * @param setAppState Function to update app state
 * @param sessionId Session ID to scope the hooks (agent ID for agents, session ID for skills)
 * @param hooks The hooks settings from frontmatter
 * @param sourceName Human-readable source name for logging (e.g., "agent 'my-agent'")
 * @param isAgent If true, converts Stop hooks to SubagentStop (since subagents trigger SubagentStop, not Stop)
 */
function registerFrontmatterHooks(setAppState, sessionId, hooks, sourceName, isAgent) {
    var _a;
    if (isAgent === void 0) { isAgent = false; }
    if (!hooks || Object.keys(hooks).length === 0) {
        return;
    }
    var hookCount = 0;
    for (var _i = 0, HOOK_EVENTS_1 = agentSdkTypes_js_1.HOOK_EVENTS; _i < HOOK_EVENTS_1.length; _i++) {
        var event_1 = HOOK_EVENTS_1[_i];
        var matchers = hooks[event_1];
        if (!matchers || matchers.length === 0) {
            continue;
        }
        // For agents, convert Stop hooks to SubagentStop since that's what fires when an agent completes
        // (executeStopHooks uses SubagentStop when called with an agentId)
        var targetEvent = event_1;
        if (isAgent && event_1 === 'Stop') {
            targetEvent = 'SubagentStop';
            (0, debug_js_1.logForDebugging)("Converting Stop hook to SubagentStop for ".concat(sourceName, " (subagents trigger SubagentStop)"));
        }
        for (var _b = 0, matchers_1 = matchers; _b < matchers_1.length; _b++) {
            var matcherConfig = matchers_1[_b];
            var matcher = (_a = matcherConfig.matcher) !== null && _a !== void 0 ? _a : '';
            var hooksArray = matcherConfig.hooks;
            if (!hooksArray || hooksArray.length === 0) {
                continue;
            }
            for (var _c = 0, hooksArray_1 = hooksArray; _c < hooksArray_1.length; _c++) {
                var hook = hooksArray_1[_c];
                (0, sessionHooks_js_1.addSessionHook)(setAppState, sessionId, targetEvent, matcher, hook);
                hookCount++;
            }
        }
    }
    if (hookCount > 0) {
        (0, debug_js_1.logForDebugging)("Registered ".concat(hookCount, " frontmatter hook(s) from ").concat(sourceName, " for session ").concat(sessionId));
    }
}
