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
exports.isHookEqual = isHookEqual;
exports.getHookDisplayText = getHookDisplayText;
exports.getAllHooks = getAllHooks;
exports.getHooksForEvent = getHooksForEvent;
exports.hookSourceDescriptionDisplayString = hookSourceDescriptionDisplayString;
exports.hookSourceHeaderDisplayString = hookSourceHeaderDisplayString;
exports.hookSourceInlineDisplayString = hookSourceInlineDisplayString;
exports.sortMatchersByPriority = sortMatchersByPriority;
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var constants_js_1 = require("../settings/constants.js");
var settings_js_1 = require("../settings/settings.js");
var shellProvider_js_1 = require("../shell/shellProvider.js");
var sessionHooks_js_1 = require("./sessionHooks.js");
/**
 * Check if two hooks are equal (comparing only command/prompt content, not timeout)
 */
function isHookEqual(a, b) {
    var _a, _b;
    if (a.type !== b.type)
        return false;
    // Use switch for exhaustive type checking
    // Note: We only compare command/prompt content, not timeout
    // `if` is part of identity: same command with different `if` conditions
    // are distinct hooks (e.g., setup.sh if=Bash(git *) vs if=Bash(npm *)).
    var sameIf = function (x, y) { var _a, _b; return ((_a = x.if) !== null && _a !== void 0 ? _a : '') === ((_b = y.if) !== null && _b !== void 0 ? _b : ''); };
    switch (a.type) {
        case 'command':
            // shell is part of identity: same command string with different
            // shells are distinct hooks. Default 'bash' so undefined === 'bash'.
            return (b.type === 'command' &&
                a.command === b.command &&
                ((_a = a.shell) !== null && _a !== void 0 ? _a : shellProvider_js_1.DEFAULT_HOOK_SHELL) === ((_b = b.shell) !== null && _b !== void 0 ? _b : shellProvider_js_1.DEFAULT_HOOK_SHELL) &&
                sameIf(a, b));
        case 'prompt':
            return b.type === 'prompt' && a.prompt === b.prompt && sameIf(a, b);
        case 'agent':
            return b.type === 'agent' && a.prompt === b.prompt && sameIf(a, b);
        case 'http':
            return b.type === 'http' && a.url === b.url && sameIf(a, b);
        case 'function':
            // Function hooks can't be compared (no stable identifier)
            return false;
    }
}
/** Get the display text for a hook */
function getHookDisplayText(hook) {
    // Return custom status message if provided
    if ('statusMessage' in hook && hook.statusMessage) {
        return hook.statusMessage;
    }
    switch (hook.type) {
        case 'command':
            return hook.command;
        case 'prompt':
            return hook.prompt;
        case 'agent':
            return hook.prompt;
        case 'http':
            return hook.url;
        case 'callback':
            return 'callback';
        case 'function':
            return 'function';
    }
}
function getAllHooks(appState) {
    var hooks = [];
    // Check if restricted to managed hooks only
    var policySettings = (0, settings_js_1.getSettingsForSource)('policySettings');
    var restrictedToManagedOnly = (policySettings === null || policySettings === void 0 ? void 0 : policySettings.allowManagedHooksOnly) === true;
    // If allowManagedHooksOnly is set, don't show any hooks in the UI
    // (user/project/local are blocked, and managed hooks are intentionally hidden)
    if (!restrictedToManagedOnly) {
        // Get hooks from all editable sources
        var sources = [
            'userSettings',
            'projectSettings',
            'localSettings',
        ];
        // Track which settings files we've already processed to avoid duplicates
        // (e.g., when running from home directory, userSettings and projectSettings
        // both resolve to ~/.claude/settings.json)
        var seenFiles = new Set();
        for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
            var source = sources_1[_i];
            var filePath = (0, settings_js_1.getSettingsFilePathForSource)(source);
            if (filePath) {
                var resolvedPath = (0, path_1.resolve)(filePath);
                if (seenFiles.has(resolvedPath)) {
                    continue;
                }
                seenFiles.add(resolvedPath);
            }
            var sourceSettings = (0, settings_js_1.getSettingsForSource)(source);
            if (!(sourceSettings === null || sourceSettings === void 0 ? void 0 : sourceSettings.hooks)) {
                continue;
            }
            for (var _a = 0, _b = Object.entries(sourceSettings.hooks); _a < _b.length; _a++) {
                var _c = _b[_a], event_1 = _c[0], matchers = _c[1];
                for (var _d = 0, _e = matchers; _d < _e.length; _d++) {
                    var matcher = _e[_d];
                    for (var _f = 0, _g = matcher.hooks; _f < _g.length; _f++) {
                        var hookCommand = _g[_f];
                        hooks.push({
                            event: event_1,
                            config: hookCommand,
                            matcher: matcher.matcher,
                            source: source,
                        });
                    }
                }
            }
        }
    }
    // Get session hooks
    var sessionId = (0, state_js_1.getSessionId)();
    var sessionHooks = (0, sessionHooks_js_1.getSessionHooks)(appState, sessionId);
    for (var _h = 0, _j = sessionHooks.entries(); _h < _j.length; _h++) {
        var _k = _j[_h], event_2 = _k[0], matchers = _k[1];
        for (var _l = 0, matchers_1 = matchers; _l < matchers_1.length; _l++) {
            var matcher = matchers_1[_l];
            for (var _m = 0, _o = matcher.hooks; _m < _o.length; _m++) {
                var hookCommand = _o[_m];
                hooks.push({
                    event: event_2,
                    config: hookCommand,
                    matcher: matcher.matcher,
                    source: 'sessionHook',
                });
            }
        }
    }
    return hooks;
}
function getHooksForEvent(appState, event) {
    return getAllHooks(appState).filter(function (hook) { return hook.event === event; });
}
function hookSourceDescriptionDisplayString(source) {
    switch (source) {
        case 'userSettings':
            return 'User settings (~/.claude/settings.json)';
        case 'projectSettings':
            return 'Project settings (.claude/settings.json)';
        case 'localSettings':
            return 'Local settings (.claude/settings.local.json)';
        case 'pluginHook':
            // TODO: Get the actual plugin hook file paths instead of using glob pattern
            // We should capture the specific plugin paths during hook registration and display them here
            // e.g., "Plugin hooks (~/.claude/plugins/repos/source/example-plugin/example-plugin/hooks/hooks.json)"
            return 'Plugin hooks (~/.claude/plugins/*/hooks/hooks.json)';
        case 'sessionHook':
            return 'Session hooks (in-memory, temporary)';
        case 'builtinHook':
            return 'Built-in hooks (registered internally by Claude Code)';
        default:
            return source;
    }
}
function hookSourceHeaderDisplayString(source) {
    switch (source) {
        case 'userSettings':
            return 'User Settings';
        case 'projectSettings':
            return 'Project Settings';
        case 'localSettings':
            return 'Local Settings';
        case 'pluginHook':
            return 'Plugin Hooks';
        case 'sessionHook':
            return 'Session Hooks';
        case 'builtinHook':
            return 'Built-in Hooks';
        default:
            return source;
    }
}
function hookSourceInlineDisplayString(source) {
    switch (source) {
        case 'userSettings':
            return 'User';
        case 'projectSettings':
            return 'Project';
        case 'localSettings':
            return 'Local';
        case 'pluginHook':
            return 'Plugin';
        case 'sessionHook':
            return 'Session';
        case 'builtinHook':
            return 'Built-in';
        default:
            return source;
    }
}
function sortMatchersByPriority(matchers, hooksByEventAndMatcher, selectedEvent) {
    // Create a priority map based on SOURCES order (lower index = higher priority)
    var sourcePriority = constants_js_1.SOURCES.reduce(function (acc, source, index) {
        acc[source] = index;
        return acc;
    }, {});
    return __spreadArray([], matchers, true).sort(function (a, b) {
        var _a, _b;
        var aHooks = ((_a = hooksByEventAndMatcher[selectedEvent]) === null || _a === void 0 ? void 0 : _a[a]) || [];
        var bHooks = ((_b = hooksByEventAndMatcher[selectedEvent]) === null || _b === void 0 ? void 0 : _b[b]) || [];
        var aSources = Array.from(new Set(aHooks.map(function (h) { return h.source; })));
        var bSources = Array.from(new Set(bHooks.map(function (h) { return h.source; })));
        // Sort by highest priority source first (lowest priority number)
        // Plugin hooks get lowest priority (highest number)
        var getSourcePriority = function (source) {
            return source === 'pluginHook' || source === 'builtinHook'
                ? 999
                : sourcePriority[source];
        };
        var aHighestPriority = Math.min.apply(Math, aSources.map(getSourcePriority));
        var bHighestPriority = Math.min.apply(Math, bSources.map(getSourcePriority));
        if (aHighestPriority !== bHighestPriority) {
            return aHighestPriority - bHighestPriority;
        }
        // If same priority, sort by matcher name
        return a.localeCompare(b);
    });
}
