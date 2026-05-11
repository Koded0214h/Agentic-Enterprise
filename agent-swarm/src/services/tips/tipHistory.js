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
exports.recordTipShown = recordTipShown;
exports.getSessionsSinceLastShown = getSessionsSinceLastShown;
var config_js_1 = require("../../utils/config.js");
function recordTipShown(tipId) {
    var numStartups = (0, config_js_1.getGlobalConfig)().numStartups;
    (0, config_js_1.saveGlobalConfig)(function (c) {
        var _a;
        var _b;
        var history = (_b = c.tipsHistory) !== null && _b !== void 0 ? _b : {};
        if (history[tipId] === numStartups)
            return c;
        return __assign(__assign({}, c), { tipsHistory: __assign(__assign({}, history), (_a = {}, _a[tipId] = numStartups, _a)) });
    });
}
function getSessionsSinceLastShown(tipId) {
    var _a;
    var config = (0, config_js_1.getGlobalConfig)();
    var lastShown = (_a = config.tipsHistory) === null || _a === void 0 ? void 0 : _a[tipId];
    if (!lastShown)
        return Infinity;
    return config.numStartups - lastShown;
}
