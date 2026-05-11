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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChicagoEnabled = getChicagoEnabled;
exports.getChicagoSubGates = getChicagoSubGates;
exports.getChicagoCoordinateMode = getChicagoCoordinateMode;
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var auth_js_1 = require("../auth.js");
var envUtils_js_1 = require("../envUtils.js");
var DEFAULTS = {
    enabled: false,
    pixelValidation: false,
    clipboardPasteMultiline: true,
    mouseAnimation: true,
    hideBeforeAction: true,
    autoTargetDisplay: true,
    clipboardGuard: true,
    coordinateMode: 'pixels',
};
// Spread over defaults so a partial JSON ({"enabled": true} alone) inherits the
// rest. The generic on getDynamicConfig is a type assertion, not a validator —
// GB returning a partial object would otherwise surface undefined fields.
function readConfig() {
    return __assign(__assign({}, DEFAULTS), (0, growthbook_js_1.getDynamicConfig_CACHED_MAY_BE_STALE)('tengu_malort_pedway', DEFAULTS));
}
// Max/Pro only for external rollout. Ant bypass so dogfooding continues
// regardless of subscription tier — not all ants are max/pro, and per
// CLAUDE.md:281, USER_TYPE !== 'ant' branches get zero antfooding.
function hasRequiredSubscription() {
    if (process.env.USER_TYPE === 'ant')
        return true;
    var tier = (0, auth_js_1.getSubscriptionType)();
    return tier === 'max' || tier === 'pro';
}
function getChicagoEnabled() {
    // Disable for ants whose shell inherited monorepo dev config.
    // MONOREPO_ROOT_DIR is exported by config/local/zsh/zshrc, which
    // laptop-setup.sh wires into ~/.zshrc — its presence is the cheap
    // proxy for "has monorepo access". Override: ALLOW_ANT_COMPUTER_USE_MCP=1.
    if (process.env.USER_TYPE === 'ant' &&
        process.env.MONOREPO_ROOT_DIR &&
        !(0, envUtils_js_1.isEnvTruthy)(process.env.ALLOW_ANT_COMPUTER_USE_MCP)) {
        return false;
    }
    return hasRequiredSubscription() && readConfig().enabled;
}
function getChicagoSubGates() {
    var _a = readConfig(), _e = _a.enabled, _c = _a.coordinateMode, subGates = __rest(_a, ["enabled", "coordinateMode"]);
    return subGates;
}
// Frozen at first read — setup.ts builds tool descriptions and executor.ts
// scales coordinates off the same value. A live read here lets a mid-session
// GB flip tell the model "pixels" while transforming clicks as normalized.
var frozenCoordinateMode;
function getChicagoCoordinateMode() {
    frozenCoordinateMode !== null && frozenCoordinateMode !== void 0 ? frozenCoordinateMode : (frozenCoordinateMode = readConfig().coordinateMode);
    return frozenCoordinateMode;
}
