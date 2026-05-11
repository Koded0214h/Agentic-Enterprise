"use strict";
/**
 * Leaf state module for the remote-managed-settings sync cache.
 *
 * Split from syncCache.ts to break the settings.ts → syncCache.ts → auth.ts →
 * settings.ts cycle. auth.ts sits inside the large settings SCC; importing it
 * from settings.ts's own dependency chain pulls hundreds of modules into the
 * eagerly-evaluated SCC at startup.
 *
 * This module imports only leaves (path, envUtils, file, json, types,
 * settings/settingsCache — also a leaf, only type-imports validation). settings.ts
 * reads the cache from here. syncCache.ts keeps isRemoteManagedSettingsEligible
 * (the auth-touching part) and re-exports everything from here for callers that
 * don't care about the cycle.
 *
 * Eligibility is a tri-state here: undefined (not yet determined — return
 * null), false (ineligible — return null), true (proceed). managedEnv.ts
 * calls isRemoteManagedSettingsEligible() just before the policySettings
 * read — after userSettings/flagSettings env vars are applied, so the check
 * sees config-provided CLAUDE_CODE_USE_BEDROCK/ANTHROPIC_BASE_URL. That call
 * computes once and mirrors the result here via setEligibility(). Every
 * subsequent read hits the cached bool instead of re-running the auth chain.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSessionCache = setSessionCache;
exports.resetSyncCache = resetSyncCache;
exports.setEligibility = setEligibility;
exports.getSettingsPath = getSettingsPath;
exports.getRemoteManagedSettingsSyncFromCache = getRemoteManagedSettingsSyncFromCache;
var path_1 = require("path");
var envUtils_js_1 = require("../../utils/envUtils.js");
var fileRead_js_1 = require("../../utils/fileRead.js");
var jsonRead_js_1 = require("../../utils/jsonRead.js");
var settingsCache_js_1 = require("../../utils/settings/settingsCache.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var SETTINGS_FILENAME = 'remote-settings.json';
var sessionCache = null;
var eligible;
function setSessionCache(value) {
    sessionCache = value;
}
function resetSyncCache() {
    sessionCache = null;
    eligible = undefined;
}
function setEligibility(v) {
    eligible = v;
    return v;
}
function getSettingsPath() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), SETTINGS_FILENAME);
}
// sync IO — settings pipeline is sync. fileRead and jsonRead are leaves;
// file.ts and json.ts both sit in the settings SCC.
function loadSettings() {
    try {
        var content = (0, fileRead_js_1.readFileSync)(getSettingsPath());
        var data = (0, slowOperations_js_1.jsonParse)((0, jsonRead_js_1.stripBOM)(content));
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return null;
        }
        return data;
    }
    catch (_a) {
        return null;
    }
}
function getRemoteManagedSettingsSyncFromCache() {
    if (eligible !== true)
        return null;
    if (sessionCache)
        return sessionCache;
    var cachedSettings = loadSettings();
    if (cachedSettings) {
        sessionCache = cachedSettings;
        // Remote settings just became available for the first time. Any merged
        // getSettings_DEPRECATED() result cached before this moment is missing
        // the policySettings layer (the `eligible !== true` guard above returned
        // null). Flush so the next merged read re-merges with this layer visible.
        //
        // Fires at most once: subsequent calls hit `if (sessionCache)` above.
        // When called from loadSettingsFromDisk() (settings.ts:546), the merged
        // cache is still null (setSessionSettingsCache runs at :732 after
        // loadSettingsFromDisk returns) — no-op. The async-fetch arm (index.ts
        // setSessionCache + notifyChange) already handles its own reset.
        //
        // gh-23085: isBridgeEnabled() at main.tsx Commander-definition time
        // (before preAction → init() → isRemoteManagedSettingsEligible()) reached
        // getSettings_DEPRECATED() at auth.ts:115. The try/catch in bridgeEnabled
        // swallowed the later getGlobalConfig() throw, but the merged settings
        // cache was already poisoned. See managedSettingsHeadless.int.test.ts.
        (0, settingsCache_js_1.resetSettingsCache)();
        return cachedSettings;
    }
    return null;
}
