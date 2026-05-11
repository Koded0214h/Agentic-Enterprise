"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAntModelOverrideConfig = getAntModelOverrideConfig;
exports.getAntModels = getAntModels;
exports.resolveAntModel = resolveAntModel;
var growthbook_js_1 = require("src/services/analytics/growthbook.js");
// @[MODEL LAUNCH]: Update tengu_ant_model_override with new ant-only models
// @[MODEL LAUNCH]: Add the codename to scripts/excluded-strings.txt to prevent it from leaking to external builds.
function getAntModelOverrideConfig() {
    if (process.env.USER_TYPE !== 'ant') {
        return null;
    }
    return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_ant_model_override', null);
}
function getAntModels() {
    var _a, _b;
    if (process.env.USER_TYPE !== 'ant') {
        return [];
    }
    return (_b = (_a = getAntModelOverrideConfig()) === null || _a === void 0 ? void 0 : _a.antModels) !== null && _b !== void 0 ? _b : [];
}
function resolveAntModel(model) {
    if (process.env.USER_TYPE !== 'ant') {
        return undefined;
    }
    if (model === undefined) {
        return undefined;
    }
    var lower = model.toLowerCase();
    return getAntModels().find(function (m) { return m.alias === model || lower.includes(m.model.toLowerCase()); });
}
