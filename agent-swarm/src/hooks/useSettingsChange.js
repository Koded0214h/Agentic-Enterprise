"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSettingsChange = useSettingsChange;
var react_1 = require("react");
var changeDetector_js_1 = require("../utils/settings/changeDetector.js");
var settings_js_1 = require("../utils/settings/settings.js");
function useSettingsChange(onChange) {
    var handleChange = (0, react_1.useCallback)(function (source) {
        // Cache is already reset by the notifier (changeDetector.fanOut) —
        // resetting here caused N-way thrashing with N subscribers: each
        // cleared the cache, re-read from disk, then the next cleared again.
        var newSettings = (0, settings_js_1.getSettings_DEPRECATED)();
        onChange(source, newSettings);
    }, [onChange]);
    (0, react_1.useEffect)(function () { return changeDetector_js_1.settingsChangeDetector.subscribe(handleChange); }, [handleChange]);
}
