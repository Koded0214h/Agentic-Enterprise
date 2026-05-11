"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSkillHooks = registerSkillHooks;
var agentSdkTypes_js_1 = require("src/entrypoints/agentSdkTypes.js");
var debug_js_1 = require("../debug.js");
var sessionHooks_js_1 = require("./sessionHooks.js");
/**
 * Registers hooks from a skill's frontmatter as session hooks.
 *
 * Hooks are registered as session-scoped hooks that persist for the duration
 * of the session. If a hook has `once: true`, it will be automatically removed
 * after its first successful execution.
 *
 * @param setAppState - Function to update the app state
 * @param sessionId - The current session ID
 * @param hooks - The hooks settings from the skill's frontmatter
 * @param skillName - The name of the skill (for logging)
 * @param skillRoot - The base directory of the skill (for CLAUDE_PLUGIN_ROOT env var)
 */
function registerSkillHooks(setAppState, sessionId, hooks, skillName, skillRoot) {
    var registeredCount = 0;
    var _loop_1 = function (eventName) {
        var matchers = hooks[eventName];
        if (!matchers)
            return "continue";
        for (var _a = 0, matchers_1 = matchers; _a < matchers_1.length; _a++) {
            var matcher = matchers_1[_a];
            var _loop_2 = function (hook) {
                // For once: true hooks, use onHookSuccess callback to remove after execution
                var onHookSuccess = hook.once
                    ? function () {
                        (0, debug_js_1.logForDebugging)("Removing one-shot hook for event ".concat(eventName, " in skill '").concat(skillName, "'"));
                        (0, sessionHooks_js_1.removeSessionHook)(setAppState, sessionId, eventName, hook);
                    }
                    : undefined;
                (0, sessionHooks_js_1.addSessionHook)(setAppState, sessionId, eventName, matcher.matcher || '', hook, onHookSuccess, skillRoot);
                registeredCount++;
            };
            for (var _b = 0, _c = matcher.hooks; _b < _c.length; _b++) {
                var hook = _c[_b];
                _loop_2(hook);
            }
        }
    };
    for (var _i = 0, HOOK_EVENTS_1 = agentSdkTypes_js_1.HOOK_EVENTS; _i < HOOK_EVENTS_1.length; _i++) {
        var eventName = HOOK_EVENTS_1[_i];
        _loop_1(eventName);
    }
    if (registeredCount > 0) {
        (0, debug_js_1.logForDebugging)("Registered ".concat(registeredCount, " hooks from skill '").concat(skillName, "'"));
    }
}
