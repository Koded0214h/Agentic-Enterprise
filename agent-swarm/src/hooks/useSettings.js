"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSettings = useSettings;
var AppState_js_1 = require("../state/AppState.js");
/**
 * React hook to access current settings from AppState.
 * Settings automatically update when files change on disk via settingsChangeDetector.
 *
 * Use this instead of getSettings_DEPRECATED() in React components for reactive updates.
 */
function useSettings() {
    return (0, AppState_js_1.useAppState)(function (s) { return s.settings; });
}
