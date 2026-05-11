"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDynamicConfig = useDynamicConfig;
var react_1 = require("react");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
/**
 * React hook for dynamic config values.
 * Returns the default value initially, then updates when the config is fetched.
 */
function useDynamicConfig(configName, defaultValue) {
    var _a = react_1.default.useState(defaultValue), configValue = _a[0], setConfigValue = _a[1];
    react_1.default.useEffect(function () {
        if (process.env.NODE_ENV === 'test') {
            // Prevents a test hang when using this hook in tests
            return;
        }
        void (0, growthbook_js_1.getDynamicConfig_BLOCKS_ON_INIT)(configName, defaultValue).then(setConfigValue);
    }, [configName, defaultValue]);
    return configValue;
}
