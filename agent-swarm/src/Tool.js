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
exports.getEmptyToolPermissionContext = void 0;
exports.filterToolProgressMessages = filterToolProgressMessages;
exports.toolMatchesName = toolMatchesName;
exports.findToolByName = findToolByName;
exports.buildTool = buildTool;
var getEmptyToolPermissionContext = function () { return ({
    mode: 'default',
    additionalWorkingDirectories: new Map(),
    alwaysAllowRules: {},
    alwaysDenyRules: {},
    alwaysAskRules: {},
    isBypassPermissionsModeAvailable: false,
}); };
exports.getEmptyToolPermissionContext = getEmptyToolPermissionContext;
function filterToolProgressMessages(progressMessagesForMessage) {
    return progressMessagesForMessage.filter(function (msg) { var _a; return ((_a = msg.data) === null || _a === void 0 ? void 0 : _a.type) !== 'hook_progress'; });
}
/**
 * Checks if a tool matches the given name (primary name or alias).
 */
function toolMatchesName(tool, name) {
    var _a, _b;
    return tool.name === name || ((_b = (_a = tool.aliases) === null || _a === void 0 ? void 0 : _a.includes(name)) !== null && _b !== void 0 ? _b : false);
}
/**
 * Finds a tool by name or alias from a list of tools.
 */
function findToolByName(tools, name) {
    return tools.find(function (t) { return toolMatchesName(t, name); });
}
/**
 * Build a complete `Tool` from a partial definition, filling in safe defaults
 * for the commonly-stubbed methods. All tool exports should go through this so
 * that defaults live in one place and callers never need `?.() ?? default`.
 *
 * Defaults (fail-closed where it matters):
 * - `isEnabled` → `true`
 * - `isConcurrencySafe` → `false` (assume not safe)
 * - `isReadOnly` → `false` (assume writes)
 * - `isDestructive` → `false`
 * - `checkPermissions` → `{ behavior: 'allow', updatedInput }` (defer to general permission system)
 * - `toAutoClassifierInput` → `''` (skip classifier — security-relevant tools must override)
 * - `userFacingName` → `name`
 */
var TOOL_DEFAULTS = {
    isEnabled: function () { return true; },
    isConcurrencySafe: function (_input) { return false; },
    isReadOnly: function (_input) { return false; },
    isDestructive: function (_input) { return false; },
    checkPermissions: function (input, _ctx) {
        return Promise.resolve({ behavior: 'allow', updatedInput: input });
    },
    toAutoClassifierInput: function (_input) { return ''; },
    userFacingName: function (_input) { return ''; },
};
function buildTool(def) {
    // The runtime spread is straightforward; the `as` bridges the gap between
    // the structural-any constraint and the precise BuiltTool<D> return. The
    // type semantics are proven by the 0-error typecheck across all 60+ tools.
    return __assign(__assign(__assign({}, TOOL_DEFAULTS), { userFacingName: function () { return def.name; } }), def);
}
