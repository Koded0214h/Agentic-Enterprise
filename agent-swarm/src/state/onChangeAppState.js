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
exports.externalMetadataToAppState = externalMetadataToAppState;
exports.onChangeAppState = onChangeAppState;
var state_js_1 = require("../bootstrap/state.js");
var auth_js_1 = require("../utils/auth.js");
var config_js_1 = require("../utils/config.js");
var errors_js_1 = require("../utils/errors.js");
var log_js_1 = require("../utils/log.js");
var managedEnv_js_1 = require("../utils/managedEnv.js");
var PermissionMode_js_1 = require("../utils/permissions/PermissionMode.js");
var sessionState_js_1 = require("../utils/sessionState.js");
var settings_js_1 = require("../utils/settings/settings.js");
// Inverse of the push below — restore on worker restart.
function externalMetadataToAppState(metadata) {
    return function (prev) { return (__assign(__assign(__assign({}, prev), (typeof metadata.permission_mode === 'string'
        ? {
            toolPermissionContext: __assign(__assign({}, prev.toolPermissionContext), { mode: (0, PermissionMode_js_1.permissionModeFromString)(metadata.permission_mode) }),
        }
        : {})), (typeof metadata.is_ultraplan_mode === 'boolean'
        ? { isUltraplanMode: metadata.is_ultraplan_mode }
        : {}))); };
}
function onChangeAppState(_a) {
    var newState = _a.newState, oldState = _a.oldState;
    // toolPermissionContext.mode — single choke point for CCR/SDK mode sync.
    //
    // Prior to this block, mode changes were relayed to CCR by only 2 of 8+
    // mutation paths: a bespoke setAppState wrapper in print.ts (headless/SDK
    // mode only) and a manual notify in the set_permission_mode handler.
    // Every other path — Shift+Tab cycling, ExitPlanModePermissionRequest
    // dialog options, the /plan slash command, rewind, the REPL bridge's
    // onSetPermissionMode — mutated AppState without telling
    // CCR, leaving external_metadata.permission_mode stale and the web UI out
    // of sync with the CLI's actual mode.
    //
    // Hooking the diff here means ANY setAppState call that changes the mode
    // notifies CCR (via notifySessionMetadataChanged → ccrClient.reportMetadata)
    // and the SDK status stream (via notifyPermissionModeChanged → registered
    // in print.ts). The scattered callsites above need zero changes.
    var prevMode = oldState.toolPermissionContext.mode;
    var newMode = newState.toolPermissionContext.mode;
    if (prevMode !== newMode) {
        // CCR external_metadata must not receive internal-only mode names
        // (bubble, ungated auto). Externalize first — and skip
        // the CCR notify if the EXTERNAL mode didn't change (e.g.,
        // default→bubble→default is noise from CCR's POV since both
        // externalize to 'default'). The SDK channel (notifyPermissionModeChanged)
        // passes raw mode; its listener in print.ts applies its own filter.
        var prevExternal = (0, PermissionMode_js_1.toExternalPermissionMode)(prevMode);
        var newExternal = (0, PermissionMode_js_1.toExternalPermissionMode)(newMode);
        if (prevExternal !== newExternal) {
            // Ultraplan = first plan cycle only. The initial control_request
            // sets mode and isUltraplanMode atomically, so the flag's
            // transition gates it. null per RFC 7396 (removes the key).
            var isUltraplan = newExternal === 'plan' &&
                newState.isUltraplanMode &&
                !oldState.isUltraplanMode
                ? true
                : null;
            (0, sessionState_js_1.notifySessionMetadataChanged)({
                permission_mode: newExternal,
                is_ultraplan_mode: isUltraplan,
            });
        }
        (0, sessionState_js_1.notifyPermissionModeChanged)(newMode);
    }
    // mainLoopModel: remove it from settings?
    if (newState.mainLoopModel !== oldState.mainLoopModel &&
        newState.mainLoopModel === null) {
        // Remove from settings
        (0, settings_js_1.updateSettingsForSource)('userSettings', { model: undefined });
        (0, state_js_1.setMainLoopModelOverride)(null);
    }
    // mainLoopModel: add it to settings?
    if (newState.mainLoopModel !== oldState.mainLoopModel &&
        newState.mainLoopModel !== null) {
        // Save to settings
        (0, settings_js_1.updateSettingsForSource)('userSettings', { model: newState.mainLoopModel });
        (0, state_js_1.setMainLoopModelOverride)(newState.mainLoopModel);
    }
    // expandedView → persist as showExpandedTodos + showSpinnerTree for backwards compat
    if (newState.expandedView !== oldState.expandedView) {
        var showExpandedTodos_1 = newState.expandedView === 'tasks';
        var showSpinnerTree_1 = newState.expandedView === 'teammates';
        if ((0, config_js_1.getGlobalConfig)().showExpandedTodos !== showExpandedTodos_1 ||
            (0, config_js_1.getGlobalConfig)().showSpinnerTree !== showSpinnerTree_1) {
            (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { showExpandedTodos: showExpandedTodos_1, showSpinnerTree: showSpinnerTree_1 })); });
        }
    }
    // verbose
    if (newState.verbose !== oldState.verbose &&
        (0, config_js_1.getGlobalConfig)().verbose !== newState.verbose) {
        var verbose_1 = newState.verbose;
        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { verbose: verbose_1 })); });
    }
    // tungstenPanelVisible (ant-only tmux panel sticky toggle)
    if (process.env.USER_TYPE === 'ant') {
        if (newState.tungstenPanelVisible !== oldState.tungstenPanelVisible &&
            newState.tungstenPanelVisible !== undefined &&
            (0, config_js_1.getGlobalConfig)().tungstenPanelVisible !== newState.tungstenPanelVisible) {
            var tungstenPanelVisible_1 = newState.tungstenPanelVisible;
            (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { tungstenPanelVisible: tungstenPanelVisible_1 })); });
        }
    }
    // settings: clear auth-related caches when settings change
    // This ensures apiKeyHelper and AWS/GCP credential changes take effect immediately
    if (newState.settings !== oldState.settings) {
        try {
            (0, auth_js_1.clearApiKeyHelperCache)();
            (0, auth_js_1.clearAwsCredentialsCache)();
            (0, auth_js_1.clearGcpCredentialsCache)();
            // Re-apply environment variables when settings.env changes
            // This is additive-only: new vars are added, existing may be overwritten, nothing is deleted
            if (newState.settings.env !== oldState.settings.env) {
                (0, managedEnv_js_1.applyConfigEnvironmentVariables)();
            }
        }
        catch (error) {
            (0, log_js_1.logError)((0, errors_js_1.toError)(error));
        }
    }
}
