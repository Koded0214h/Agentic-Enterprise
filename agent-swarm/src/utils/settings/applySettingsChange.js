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
exports.applySettingsChange = applySettingsChange;
var debug_js_1 = require("../debug.js");
var hooksConfigSnapshot_js_1 = require("../hooks/hooksConfigSnapshot.js");
var permissionSetup_js_1 = require("../permissions/permissionSetup.js");
var permissions_js_1 = require("../permissions/permissions.js");
var permissionsLoader_js_1 = require("../permissions/permissionsLoader.js");
var settings_js_1 = require("./settings.js");
/**
 * Apply a settings change to app state. Re-reads settings from disk,
 * reloads permissions and hooks, and pushes the new state.
 *
 * Used by both the interactive path (AppState.tsx via useSettingsChange) and
 * the headless/SDK path (print.ts direct subscribe) so that managed-settings
 * / policy changes are fully applied in both modes.
 *
 * The settings cache is reset by the notifier (changeDetector.fanOut) before
 * listeners are iterated, so getInitialSettings() here reads fresh disk
 * state. Previously this function reset the cache itself, which — combined
 * with useSettingsChange's own reset — caused N disk reloads per notification
 * for N subscribers.
 *
 * Side-effects like clearing auth caches and applying env vars are handled by
 * `onChangeAppState` which fires when `settings` changes in state.
 */
function applySettingsChange(source, setAppState) {
    var newSettings = (0, settings_js_1.getInitialSettings)();
    (0, debug_js_1.logForDebugging)("Settings changed from ".concat(source, ", updating app state"));
    var updatedRules = (0, permissionsLoader_js_1.loadAllPermissionRulesFromDisk)();
    (0, hooksConfigSnapshot_js_1.updateHooksConfigSnapshot)();
    setAppState(function (prev) {
        var newContext = (0, permissions_js_1.syncPermissionRulesFromDisk)(prev.toolPermissionContext, updatedRules);
        // Ant-only: re-strip overly broad Bash allow rules after settings sync
        if (process.env.USER_TYPE === 'ant' &&
            process.env.CLAUDE_CODE_ENTRYPOINT !== 'local-agent') {
            var overlyBroad = (0, permissionSetup_js_1.findOverlyBroadBashPermissions)(updatedRules, []);
            if (overlyBroad.length > 0) {
                newContext = (0, permissionSetup_js_1.removeDangerousPermissions)(newContext, overlyBroad);
            }
        }
        if (newContext.isBypassPermissionsModeAvailable &&
            (0, permissionSetup_js_1.isBypassPermissionsModeDisabled)()) {
            newContext = (0, permissionSetup_js_1.createDisabledBypassPermissionsContext)(newContext);
        }
        newContext = (0, permissionSetup_js_1.transitionPlanAutoMode)(newContext);
        // Sync effortLevel from settings to top-level AppState when it changes
        // (e.g. via applyFlagSettings from IDE). Only propagate if the setting
        // itself changed — otherwise unrelated settings churn (e.g. tips dismissal
        // on startup) would clobber a --effort CLI flag value held in AppState.
        var prevEffort = prev.settings.effortLevel;
        var newEffort = newSettings.effortLevel;
        var effortChanged = prevEffort !== newEffort;
        return __assign(__assign(__assign({}, prev), { settings: newSettings, toolPermissionContext: newContext }), (effortChanged && newEffort !== undefined
            ? { effortValue: newEffort }
            : {}));
    });
}
