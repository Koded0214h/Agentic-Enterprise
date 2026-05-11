"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpgradeMessage = getUpgradeMessage;
var check1mAccess_js_1 = require("./check1mAccess.js");
var model_js_1 = require("./model.js");
// @[MODEL LAUNCH]: Add a branch for the new model if it supports a 1M context upgrade path.
/**
 * Get available model upgrade for more context
 * Returns null if no upgrade available or user already has max context
 */
function getAvailableUpgrade() {
    var currentModelSetting = (0, model_js_1.getUserSpecifiedModelSetting)();
    if (currentModelSetting === 'opus' && (0, check1mAccess_js_1.checkOpus1mAccess)()) {
        return {
            alias: 'opus[1m]',
            name: 'Opus 1M',
            multiplier: 5,
        };
    }
    else if (currentModelSetting === 'sonnet' && (0, check1mAccess_js_1.checkSonnet1mAccess)()) {
        return {
            alias: 'sonnet[1m]',
            name: 'Sonnet 1M',
            multiplier: 5,
        };
    }
    return null;
}
/**
 * Get upgrade message for different contexts
 */
function getUpgradeMessage(context) {
    var upgrade = getAvailableUpgrade();
    if (!upgrade)
        return null;
    switch (context) {
        case 'warning':
            return "/model ".concat(upgrade.alias);
        case 'tip':
            return "Tip: You have access to ".concat(upgrade.name, " with ").concat(upgrade.multiplier, "x more context");
        default:
            return null;
    }
}
