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
exports.useClaudeAiLimits = useClaudeAiLimits;
var react_1 = require("react");
var claudeAiLimits_js_1 = require("./claudeAiLimits.js");
function useClaudeAiLimits() {
    var _a = (0, react_1.useState)(__assign({}, claudeAiLimits_js_1.currentLimits)), limits = _a[0], setLimits = _a[1];
    (0, react_1.useEffect)(function () {
        var listener = function (newLimits) {
            setLimits(__assign({}, newLimits));
        };
        claudeAiLimits_js_1.statusListeners.add(listener);
        return function () {
            claudeAiLimits_js_1.statusListeners.delete(listener);
        };
    }, []);
    return limits;
}
