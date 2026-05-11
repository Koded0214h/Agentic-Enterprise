"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentSourceDisplayName = getAgentSourceDisplayName;
var capitalize_js_1 = require("lodash-es/capitalize.js");
var constants_js_1 = require("src/utils/settings/constants.js");
function getAgentSourceDisplayName(source) {
    if (source === 'all') {
        return 'Agents';
    }
    if (source === 'built-in') {
        return 'Built-in agents';
    }
    if (source === 'plugin') {
        return 'Plugin agents';
    }
    return (0, capitalize_js_1.default)((0, constants_js_1.getSettingSourceName)(source));
}
