"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldAllowManagedHooksOnly = shouldAllowManagedHooksOnly;
exports.shouldDisableAllHooksIncludingManaged = shouldDisableAllHooksIncludingManaged;
exports.captureHooksConfigSnapshot = captureHooksConfigSnapshot;
exports.updateHooksConfigSnapshot = updateHooksConfigSnapshot;
exports.getHooksConfigFromSnapshot = getHooksConfigFromSnapshot;
exports.resetHooksConfigSnapshot = resetHooksConfigSnapshot;
var state_js_1 = require("../../bootstrap/state.js");
var pluginOnlyPolicy_js_1 = require("../settings/pluginOnlyPolicy.js");
// Import as module object so spyOn works in tests (direct imports bypass spies)
var settingsModule = require("../settings/settings.js");
var settingsCache_js_1 = require("../settings/settingsCache.js");
var initialHooksConfig = null;
/**
 * Get hooks from allowed sources.
 * If allowManagedHooksOnly is set in policySettings, only managed hooks are returned.
 * If disableAllHooks is set in policySettings, no hooks are returned.
 * If disableAllHooks is set in non-managed settings, only managed hooks are returned
 * (non-managed settings cannot disable managed hooks).
 * Otherwise, returns merged hooks from all sources (backwards compatible).
 */
function getHooksFromAllowedSources() {
    var _a, _b, _c, _d;
    var policySettings = settingsModule.getSettingsForSource('policySettings');
    // If managed settings disables all hooks, return empty
    if ((policySettings === null || policySettings === void 0 ? void 0 : policySettings.disableAllHooks) === true) {
        return {};
    }
    // If allowManagedHooksOnly is set in managed settings, only use managed hooks
    if ((policySettings === null || policySettings === void 0 ? void 0 : policySettings.allowManagedHooksOnly) === true) {
        return (_a = policySettings.hooks) !== null && _a !== void 0 ? _a : {};
    }
    // strictPluginOnlyCustomization: block user/project/local settings hooks.
    // Plugin hooks (registered channel, hooks.ts:1391) are NOT affected —
    // they're assembled separately and the managedOnly skip there is keyed
    // on shouldAllowManagedHooksOnly(), not on this policy. Agent frontmatter
    // hooks are gated at REGISTRATION (runAgent.ts:~535) by agent source —
    // plugin/built-in/policySettings agents register normally, user-sourced
    // agents skip registration under ["hooks"]. A blanket execution-time
    // block here would over-kill plugin agents' hooks.
    if ((0, pluginOnlyPolicy_js_1.isRestrictedToPluginOnly)('hooks')) {
        return (_b = policySettings === null || policySettings === void 0 ? void 0 : policySettings.hooks) !== null && _b !== void 0 ? _b : {};
    }
    var mergedSettings = settingsModule.getSettings_DEPRECATED();
    // If disableAllHooks is set in non-managed settings, only managed hooks still run
    // (non-managed settings cannot override managed hooks)
    if (mergedSettings.disableAllHooks === true) {
        return (_c = policySettings === null || policySettings === void 0 ? void 0 : policySettings.hooks) !== null && _c !== void 0 ? _c : {};
    }
    // Otherwise, use all hooks (merged from all sources) - backwards compatible
    return (_d = mergedSettings.hooks) !== null && _d !== void 0 ? _d : {};
}
/**
 * Check if only managed hooks should run.
 * This is true when:
 * - policySettings has allowManagedHooksOnly: true, OR
 * - disableAllHooks is set in non-managed settings (non-managed settings
 *   cannot disable managed hooks, so they effectively become managed-only)
 */
function shouldAllowManagedHooksOnly() {
    var policySettings = settingsModule.getSettingsForSource('policySettings');
    if ((policySettings === null || policySettings === void 0 ? void 0 : policySettings.allowManagedHooksOnly) === true) {
        return true;
    }
    // If disableAllHooks is set but NOT from managed settings,
    // treat as managed-only (non-managed hooks disabled, managed hooks still run)
    if (settingsModule.getSettings_DEPRECATED().disableAllHooks === true &&
        (policySettings === null || policySettings === void 0 ? void 0 : policySettings.disableAllHooks) !== true) {
        return true;
    }
    return false;
}
/**
 * Check if all hooks (including managed) should be disabled.
 * This is only true when managed/policy settings has disableAllHooks: true.
 * When disableAllHooks is set in non-managed settings, managed hooks still run.
 */
function shouldDisableAllHooksIncludingManaged() {
    var _a;
    return (((_a = settingsModule.getSettingsForSource('policySettings')) === null || _a === void 0 ? void 0 : _a.disableAllHooks) ===
        true);
}
/**
 * Capture a snapshot of the current hooks configuration
 * This should be called once during application startup
 * Respects the allowManagedHooksOnly setting
 */
function captureHooksConfigSnapshot() {
    initialHooksConfig = getHooksFromAllowedSources();
}
/**
 * Update the hooks configuration snapshot
 * This should be called when hooks are modified through the settings
 * Respects the allowManagedHooksOnly setting
 */
function updateHooksConfigSnapshot() {
    // Reset the session cache to ensure we read fresh settings from disk.
    // Without this, the snapshot could use stale cached settings when the user
    // edits settings.json externally and then runs /hooks - the session cache
    // may not have been invalidated yet (e.g., if the file watcher's stability
    // threshold hasn't elapsed).
    (0, settingsCache_js_1.resetSettingsCache)();
    initialHooksConfig = getHooksFromAllowedSources();
}
/**
 * Get the current hooks configuration from snapshot
 * Falls back to settings if no snapshot exists
 * @returns The hooks configuration
 */
function getHooksConfigFromSnapshot() {
    if (initialHooksConfig === null) {
        captureHooksConfigSnapshot();
    }
    return initialHooksConfig;
}
/**
 * Reset the hooks configuration snapshot (useful for testing)
 * Also resets SDK init state to prevent test pollution
 */
function resetHooksConfigSnapshot() {
    initialHooksConfig = null;
    (0, state_js_1.resetSdkInitState)();
}
