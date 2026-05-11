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
exports.addSessionHook = addSessionHook;
exports.addFunctionHook = addFunctionHook;
exports.removeFunctionHook = removeFunctionHook;
exports.removeSessionHook = removeSessionHook;
exports.getSessionHooks = getSessionHooks;
exports.getSessionFunctionHooks = getSessionFunctionHooks;
exports.getSessionHookCallback = getSessionHookCallback;
exports.clearSessionHooks = clearSessionHooks;
var agentSdkTypes_js_1 = require("src/entrypoints/agentSdkTypes.js");
var debug_js_1 = require("../debug.js");
var hooksSettings_js_1 = require("./hooksSettings.js");
/**
 * Add a command or prompt hook to the session.
 * Session hooks are temporary, in-memory only, and cleared when session ends.
 */
function addSessionHook(setAppState, sessionId, event, matcher, hook, onHookSuccess, skillRoot) {
    addHookToSession(setAppState, sessionId, event, matcher, hook, onHookSuccess, skillRoot);
}
/**
 * Add a function hook to the session.
 * Function hooks execute TypeScript callbacks in-memory for validation.
 * @returns The hook ID (for removal)
 */
function addFunctionHook(setAppState, sessionId, event, matcher, callback, errorMessage, options) {
    var id = (options === null || options === void 0 ? void 0 : options.id) || "function-hook-".concat(Date.now(), "-").concat(Math.random());
    var hook = {
        type: 'function',
        id: id,
        timeout: (options === null || options === void 0 ? void 0 : options.timeout) || 5000,
        callback: callback,
        errorMessage: errorMessage,
    };
    addHookToSession(setAppState, sessionId, event, matcher, hook);
    return id;
}
/**
 * Remove a function hook by ID from the session.
 */
function removeFunctionHook(setAppState, sessionId, event, hookId) {
    setAppState(function (prev) {
        var _a;
        var store = prev.sessionHooks.get(sessionId);
        if (!store) {
            return prev;
        }
        var eventMatchers = store.hooks[event] || [];
        // Remove the hook with matching ID from all matchers
        var updatedMatchers = eventMatchers
            .map(function (matcher) {
            var updatedHooks = matcher.hooks.filter(function (h) {
                if (h.hook.type !== 'function')
                    return true;
                return h.hook.id !== hookId;
            });
            return updatedHooks.length > 0
                ? __assign(__assign({}, matcher), { hooks: updatedHooks }) : null;
        })
            .filter(function (m) { return m !== null; });
        var newHooks = updatedMatchers.length > 0
            ? __assign(__assign({}, store.hooks), (_a = {}, _a[event] = updatedMatchers, _a)) : Object.fromEntries(Object.entries(store.hooks).filter(function (_a) {
            var e = _a[0];
            return e !== event;
        }));
        prev.sessionHooks.set(sessionId, { hooks: newHooks });
        return prev;
    });
    (0, debug_js_1.logForDebugging)("Removed function hook ".concat(hookId, " for event ").concat(event, " in session ").concat(sessionId));
}
/**
 * Internal helper to add a hook to session state
 */
function addHookToSession(setAppState, sessionId, event, matcher, hook, onHookSuccess, skillRoot) {
    setAppState(function (prev) {
        var _a;
        var _b;
        var store = (_b = prev.sessionHooks.get(sessionId)) !== null && _b !== void 0 ? _b : { hooks: {} };
        var eventMatchers = store.hooks[event] || [];
        // Find existing matcher or create new one
        var existingMatcherIndex = eventMatchers.findIndex(function (m) { return m.matcher === matcher && m.skillRoot === skillRoot; });
        var updatedMatchers;
        if (existingMatcherIndex >= 0) {
            // Add to existing matcher
            updatedMatchers = __spreadArray([], eventMatchers, true);
            var existingMatcher = updatedMatchers[existingMatcherIndex];
            updatedMatchers[existingMatcherIndex] = {
                matcher: existingMatcher.matcher,
                skillRoot: existingMatcher.skillRoot,
                hooks: __spreadArray(__spreadArray([], existingMatcher.hooks, true), [{ hook: hook, onHookSuccess: onHookSuccess }], false),
            };
        }
        else {
            // Create new matcher
            updatedMatchers = __spreadArray(__spreadArray([], eventMatchers, true), [
                {
                    matcher: matcher,
                    skillRoot: skillRoot,
                    hooks: [{ hook: hook, onHookSuccess: onHookSuccess }],
                },
            ], false);
        }
        var newHooks = __assign(__assign({}, store.hooks), (_a = {}, _a[event] = updatedMatchers, _a));
        prev.sessionHooks.set(sessionId, { hooks: newHooks });
        return prev;
    });
    (0, debug_js_1.logForDebugging)("Added session hook for event ".concat(event, " in session ").concat(sessionId));
}
/**
 * Remove a specific hook from the session
 * @param setAppState The function to update the app state
 * @param sessionId The session ID
 * @param event The hook event
 * @param hook The hook command to remove
 */
function removeSessionHook(setAppState, sessionId, event, hook) {
    setAppState(function (prev) {
        var _a;
        var store = prev.sessionHooks.get(sessionId);
        if (!store) {
            return prev;
        }
        var eventMatchers = store.hooks[event] || [];
        // Remove the hook from all matchers
        var updatedMatchers = eventMatchers
            .map(function (matcher) {
            var updatedHooks = matcher.hooks.filter(function (h) { return !(0, hooksSettings_js_1.isHookEqual)(h.hook, hook); });
            return updatedHooks.length > 0
                ? __assign(__assign({}, matcher), { hooks: updatedHooks }) : null;
        })
            .filter(function (m) { return m !== null; });
        var newHooks = updatedMatchers.length > 0
            ? __assign(__assign({}, store.hooks), (_a = {}, _a[event] = updatedMatchers, _a)) : __assign({}, store.hooks);
        if (updatedMatchers.length === 0) {
            delete newHooks[event];
        }
        prev.sessionHooks.set(sessionId, __assign(__assign({}, store), { hooks: newHooks }));
        return prev;
    });
    (0, debug_js_1.logForDebugging)("Removed session hook for event ".concat(event, " in session ").concat(sessionId));
}
/**
 * Convert session hook matchers to regular hook matchers
 * @param sessionMatchers The session hook matchers to convert
 * @returns Regular hook matchers (with optional skillRoot preserved)
 */
function convertToHookMatchers(sessionMatchers) {
    return sessionMatchers.map(function (sm) { return ({
        matcher: sm.matcher,
        skillRoot: sm.skillRoot,
        // Filter out function hooks - they can't be persisted to HookMatcher format
        hooks: sm.hooks
            .map(function (h) { return h.hook; })
            .filter(function (h) { return h.type !== 'function'; }),
    }); });
}
/**
 * Get all session hooks for a specific event (excluding function hooks)
 * @param appState The app state
 * @param sessionId The session ID
 * @param event Optional event to filter by
 * @returns Hook matchers for the event, or all hooks if no event specified
 */
function getSessionHooks(appState, sessionId, event) {
    var store = appState.sessionHooks.get(sessionId);
    if (!store) {
        return new Map();
    }
    var result = new Map();
    if (event) {
        var sessionMatchers = store.hooks[event];
        if (sessionMatchers) {
            result.set(event, convertToHookMatchers(sessionMatchers));
        }
        return result;
    }
    for (var _i = 0, HOOK_EVENTS_1 = agentSdkTypes_js_1.HOOK_EVENTS; _i < HOOK_EVENTS_1.length; _i++) {
        var evt = HOOK_EVENTS_1[_i];
        var sessionMatchers = store.hooks[evt];
        if (sessionMatchers) {
            result.set(evt, convertToHookMatchers(sessionMatchers));
        }
    }
    return result;
}
/**
 * Get all session function hooks for a specific event
 * Function hooks are kept separate because they can't be persisted to HookMatcher format.
 * @param appState The app state
 * @param sessionId The session ID
 * @param event Optional event to filter by
 * @returns Function hook matchers for the event
 */
function getSessionFunctionHooks(appState, sessionId, event) {
    var store = appState.sessionHooks.get(sessionId);
    if (!store) {
        return new Map();
    }
    var result = new Map();
    var extractFunctionHooks = function (sessionMatchers) {
        return sessionMatchers
            .map(function (sm) { return ({
            matcher: sm.matcher,
            hooks: sm.hooks
                .map(function (h) { return h.hook; })
                .filter(function (h) { return h.type === 'function'; }),
        }); })
            .filter(function (m) { return m.hooks.length > 0; });
    };
    if (event) {
        var sessionMatchers = store.hooks[event];
        if (sessionMatchers) {
            var functionMatchers = extractFunctionHooks(sessionMatchers);
            if (functionMatchers.length > 0) {
                result.set(event, functionMatchers);
            }
        }
        return result;
    }
    for (var _i = 0, HOOK_EVENTS_2 = agentSdkTypes_js_1.HOOK_EVENTS; _i < HOOK_EVENTS_2.length; _i++) {
        var evt = HOOK_EVENTS_2[_i];
        var sessionMatchers = store.hooks[evt];
        if (sessionMatchers) {
            var functionMatchers = extractFunctionHooks(sessionMatchers);
            if (functionMatchers.length > 0) {
                result.set(evt, functionMatchers);
            }
        }
    }
    return result;
}
/**
 * Get the full hook entry (including callbacks) for a specific session hook
 */
function getSessionHookCallback(appState, sessionId, event, matcher, hook) {
    var store = appState.sessionHooks.get(sessionId);
    if (!store) {
        return undefined;
    }
    var eventMatchers = store.hooks[event];
    if (!eventMatchers) {
        return undefined;
    }
    // Find the hook in the matchers
    for (var _i = 0, eventMatchers_1 = eventMatchers; _i < eventMatchers_1.length; _i++) {
        var matcherEntry = eventMatchers_1[_i];
        if (matcherEntry.matcher === matcher || matcher === '') {
            var hookEntry = matcherEntry.hooks.find(function (h) { return (0, hooksSettings_js_1.isHookEqual)(h.hook, hook); });
            if (hookEntry) {
                return hookEntry;
            }
        }
    }
    return undefined;
}
/**
 * Clear all session hooks for a specific session
 * @param setAppState The function to update the app state
 * @param sessionId The session ID
 */
function clearSessionHooks(setAppState, sessionId) {
    setAppState(function (prev) {
        prev.sessionHooks.delete(sessionId);
        return prev;
    });
    (0, debug_js_1.logForDebugging)("Cleared all session hooks for session ".concat(sessionId));
}
