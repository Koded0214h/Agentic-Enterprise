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
exports.useSelectState = useSelectState;
var react_1 = require("react");
var use_select_navigation_js_1 = require("./use-select-navigation.js");
function useSelectState(_a) {
    var _b = _a.visibleOptionCount, visibleOptionCount = _b === void 0 ? 5 : _b, options = _a.options, defaultValue = _a.defaultValue, onChange = _a.onChange, onCancel = _a.onCancel, onFocus = _a.onFocus, focusValue = _a.focusValue;
    var _c = (0, react_1.useState)(defaultValue), value = _c[0], setValue = _c[1];
    var navigation = (0, use_select_navigation_js_1.useSelectNavigation)({
        visibleOptionCount: visibleOptionCount,
        options: options,
        initialFocusValue: undefined,
        onFocus: onFocus,
        focusValue: focusValue,
    });
    var selectFocusedOption = (0, react_1.useCallback)(function () {
        setValue(navigation.focusedValue);
    }, [navigation.focusedValue]);
    return __assign(__assign({}, navigation), { value: value, selectFocusedOption: selectFocusedOption, onChange: onChange, onCancel: onCancel });
}
