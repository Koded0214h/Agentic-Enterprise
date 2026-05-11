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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMultiSelectState = useMultiSelectState;
var react_1 = require("react");
var util_1 = require("util");
var overlayContext_js_1 = require("../../context/overlayContext.js");
// eslint-disable-next-line custom-rules/prefer-use-keybindings -- raw space/arrow multiselect input
var ink_js_1 = require("../../ink.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
var use_select_navigation_js_1 = require("./use-select-navigation.js");
function useMultiSelectState(_a) {
    var _b;
    var _c = _a.isDisabled, isDisabled = _c === void 0 ? false : _c, _d = _a.visibleOptionCount, visibleOptionCount = _d === void 0 ? 5 : _d, options = _a.options, _e = _a.defaultValue, defaultValue = _e === void 0 ? [] : _e, onChange = _a.onChange, onCancel = _a.onCancel, onFocus = _a.onFocus, focusValue = _a.focusValue, submitButtonText = _a.submitButtonText, onSubmit = _a.onSubmit, onDownFromLastItem = _a.onDownFromLastItem, onUpFromFirstItem = _a.onUpFromFirstItem, initialFocusLast = _a.initialFocusLast, _f = _a.hideIndexes, hideIndexes = _f === void 0 ? false : _f;
    var _g = (0, react_1.useState)(defaultValue), selectedValues = _g[0], setSelectedValues = _g[1];
    var _h = (0, react_1.useState)(false), isSubmitFocused = _h[0], setIsSubmitFocused = _h[1];
    // Reset selectedValues when options change (e.g. async-loaded data changes
    // defaultValue after mount). Mirrors the reset pattern in use-select-navigation.ts
    // and the deleted ui/useMultiSelectState.ts — without this, MCPServerDesktopImportDialog
    // keeps colliding servers checked after getAllMcpConfigs() resolves.
    var _j = (0, react_1.useState)(options), lastOptions = _j[0], setLastOptions = _j[1];
    if (options !== lastOptions && !(0, util_1.isDeepStrictEqual)(options, lastOptions)) {
        setSelectedValues(defaultValue);
        setLastOptions(options);
    }
    // State for input type options
    var _k = (0, react_1.useState)(function () {
        var initialMap = new Map();
        options.forEach(function (option) {
            if (option.type === 'input' && option.initialValue) {
                initialMap.set(option.value, option.initialValue);
            }
        });
        return initialMap;
    }), inputValues = _k[0], setInputValues = _k[1];
    var updateSelectedValues = (0, react_1.useCallback)(function (values) {
        var newValues = typeof values === 'function' ? values(selectedValues) : values;
        setSelectedValues(newValues);
        onChange === null || onChange === void 0 ? void 0 : onChange(newValues);
    }, [selectedValues, onChange]);
    var navigation = (0, use_select_navigation_js_1.useSelectNavigation)({
        visibleOptionCount: visibleOptionCount,
        options: options,
        initialFocusValue: initialFocusLast
            ? (_b = options[options.length - 1]) === null || _b === void 0 ? void 0 : _b.value
            : undefined,
        onFocus: onFocus,
        focusValue: focusValue,
    });
    // Automatically register as an overlay.
    // This ensures CancelRequestHandler won't intercept Escape when the multi-select is active.
    (0, overlayContext_js_1.useRegisterOverlay)('multi-select');
    var updateInputValue = (0, react_1.useCallback)(function (value, inputValue) {
        setInputValues(function (prev) {
            var next = new Map(prev);
            next.set(value, inputValue);
            return next;
        });
        // Find the option and call its onChange
        var option = options.find(function (opt) { return opt.value === value; });
        if (option && option.type === 'input') {
            option.onChange(inputValue);
        }
        // Update selected values to include/exclude based on input
        updateSelectedValues(function (prev) {
            if (inputValue) {
                if (!prev.includes(value)) {
                    return __spreadArray(__spreadArray([], prev, true), [value], false);
                }
                return prev;
            }
            else {
                return prev.filter(function (v) { return v !== value; });
            }
        });
    }, [options, updateSelectedValues]);
    // Handle all keyboard input
    (0, ink_js_1.useInput)(function (input, key, event) {
        var _a, _b;
        var normalizedInput = (0, stringUtils_js_1.normalizeFullWidthDigits)(input);
        var focusedOption = options.find(function (opt) { return opt.value === navigation.focusedValue; });
        var isInInput = (focusedOption === null || focusedOption === void 0 ? void 0 : focusedOption.type) === 'input';
        // When in input field, only allow navigation keys
        if (isInInput) {
            var isAllowedKey = key.upArrow ||
                key.downArrow ||
                key.escape ||
                key.tab ||
                key.return ||
                (key.ctrl && (input === 'n' || input === 'p' || key.return));
            if (!isAllowedKey)
                return;
        }
        var lastOptionValue = (_a = options[options.length - 1]) === null || _a === void 0 ? void 0 : _a.value;
        // Handle Tab to move forward
        if (key.tab && !key.shift) {
            if (submitButtonText &&
                onSubmit &&
                navigation.focusedValue === lastOptionValue &&
                !isSubmitFocused) {
                setIsSubmitFocused(true);
            }
            else if (!isSubmitFocused) {
                navigation.focusNextOption();
            }
            return;
        }
        // Handle Shift+Tab to move backward
        if (key.tab && key.shift) {
            if (submitButtonText && onSubmit && isSubmitFocused) {
                setIsSubmitFocused(false);
                navigation.focusOption(lastOptionValue);
            }
            else {
                navigation.focusPreviousOption();
            }
            return;
        }
        // Handle arrow down / Ctrl+N / j
        if (key.downArrow ||
            (key.ctrl && input === 'n') ||
            (!key.ctrl && !key.shift && input === 'j')) {
            if (isSubmitFocused && onDownFromLastItem) {
                onDownFromLastItem();
            }
            else if (submitButtonText &&
                onSubmit &&
                navigation.focusedValue === lastOptionValue &&
                !isSubmitFocused) {
                setIsSubmitFocused(true);
            }
            else if (!submitButtonText &&
                onDownFromLastItem &&
                navigation.focusedValue === lastOptionValue) {
                // No submit button — exit from the last option
                onDownFromLastItem();
            }
            else if (!isSubmitFocused) {
                navigation.focusNextOption();
            }
            return;
        }
        // Handle arrow up / Ctrl+P / k
        if (key.upArrow ||
            (key.ctrl && input === 'p') ||
            (!key.ctrl && !key.shift && input === 'k')) {
            if (submitButtonText && onSubmit && isSubmitFocused) {
                setIsSubmitFocused(false);
                navigation.focusOption(lastOptionValue);
            }
            else if (onUpFromFirstItem &&
                navigation.focusedValue === ((_b = options[0]) === null || _b === void 0 ? void 0 : _b.value)) {
                onUpFromFirstItem();
            }
            else {
                navigation.focusPreviousOption();
            }
            return;
        }
        // Handle page navigation
        if (key.pageDown) {
            navigation.focusNextPage();
            return;
        }
        if (key.pageUp) {
            navigation.focusPreviousPage();
            return;
        }
        // Handle Enter or Space for selection/submit
        if (key.return || (0, stringUtils_js_1.normalizeFullWidthSpace)(input) === ' ') {
            // Ctrl+Enter from input field submits
            if (key.ctrl && key.return && isInInput && onSubmit) {
                onSubmit(selectedValues);
                return;
            }
            // Enter on submit button submits
            if (isSubmitFocused && onSubmit) {
                onSubmit(selectedValues);
                return;
            }
            // No submit button: Enter submits directly, Space still toggles
            if (key.return && !submitButtonText && onSubmit) {
                onSubmit(selectedValues);
                return;
            }
            // Enter or Space toggles selection (including for input fields)
            if (navigation.focusedValue !== undefined) {
                var newValues = selectedValues.includes(navigation.focusedValue)
                    ? selectedValues.filter(function (v) { return v !== navigation.focusedValue; })
                    : __spreadArray(__spreadArray([], selectedValues, true), [navigation.focusedValue], false);
                updateSelectedValues(newValues);
            }
            return;
        }
        // Handle numeric keys (1-9) for direct selection
        if (!hideIndexes && /^[0-9]+$/.test(normalizedInput)) {
            var index = parseInt(normalizedInput) - 1;
            if (index >= 0 && index < options.length) {
                var value_1 = options[index].value;
                var newValues = selectedValues.includes(value_1)
                    ? selectedValues.filter(function (v) { return v !== value_1; })
                    : __spreadArray(__spreadArray([], selectedValues, true), [value_1], false);
                updateSelectedValues(newValues);
            }
            return;
        }
        // Handle Escape
        if (key.escape) {
            onCancel();
            event.stopImmediatePropagation();
        }
    }, { isActive: !isDisabled });
    return __assign(__assign({}, navigation), { selectedValues: selectedValues, inputValues: inputValues, isSubmitFocused: isSubmitFocused, updateInputValue: updateInputValue, onCancel: onCancel });
}
