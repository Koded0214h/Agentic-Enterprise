"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSelectInput = void 0;
var react_1 = require("react");
var overlayContext_js_1 = require("../../context/overlayContext.js");
var ink_js_1 = require("../../ink.js");
var useKeybinding_js_1 = require("../../keybindings/useKeybinding.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
var useSelectInput = function (_a) {
    var _b = _a.isDisabled, isDisabled = _b === void 0 ? false : _b, _c = _a.disableSelection, disableSelection = _c === void 0 ? false : _c, state = _a.state, options = _a.options, _d = _a.isMultiSelect, isMultiSelect = _d === void 0 ? false : _d, onUpFromFirstItem = _a.onUpFromFirstItem, onDownFromLastItem = _a.onDownFromLastItem, onInputModeToggle = _a.onInputModeToggle, inputValues = _a.inputValues, _e = _a.imagesSelected, imagesSelected = _e === void 0 ? false : _e, onEnterImageSelection = _a.onEnterImageSelection;
    // Automatically register as an overlay when onCancel is provided.
    // This ensures CancelRequestHandler won't intercept Escape when the select is active.
    (0, overlayContext_js_1.useRegisterOverlay)('select', !!state.onCancel);
    // Determine if the focused option is an input type
    var isInInput = (0, react_1.useMemo)(function () {
        var focusedOption = options.find(function (opt) { return opt.value === state.focusedValue; });
        return (focusedOption === null || focusedOption === void 0 ? void 0 : focusedOption.type) === 'input';
    }, [options, state.focusedValue]);
    // Core navigation via keybindings (up/down/enter/escape)
    // When in input mode, exclude navigation/accept keybindings so that
    // j/k/enter pass through to the TextInput instead of being intercepted.
    var keybindingHandlers = (0, react_1.useMemo)(function () {
        var handlers = {};
        if (!isInInput) {
            handlers['select:next'] = function () {
                if (onDownFromLastItem) {
                    var lastOption = options[options.length - 1];
                    if (lastOption && state.focusedValue === lastOption.value) {
                        onDownFromLastItem();
                        return;
                    }
                }
                state.focusNextOption();
            };
            handlers['select:previous'] = function () {
                if (onUpFromFirstItem && state.visibleFromIndex === 0) {
                    var firstOption = options[0];
                    if (firstOption && state.focusedValue === firstOption.value) {
                        onUpFromFirstItem();
                        return;
                    }
                }
                state.focusPreviousOption();
            };
            handlers['select:accept'] = function () {
                var _a, _b;
                if (disableSelection === true)
                    return;
                if (state.focusedValue === undefined)
                    return;
                var focusedOption = options.find(function (opt) { return opt.value === state.focusedValue; });
                if ((focusedOption === null || focusedOption === void 0 ? void 0 : focusedOption.disabled) === true)
                    return;
                (_a = state.selectFocusedOption) === null || _a === void 0 ? void 0 : _a.call(state);
                (_b = state.onChange) === null || _b === void 0 ? void 0 : _b.call(state, state.focusedValue);
            };
        }
        if (state.onCancel) {
            handlers['select:cancel'] = function () {
                state.onCancel();
            };
        }
        return handlers;
    }, [
        options,
        state,
        onDownFromLastItem,
        onUpFromFirstItem,
        isInInput,
        disableSelection,
    ]);
    (0, useKeybinding_js_1.useKeybindings)(keybindingHandlers, {
        context: 'Select',
        isActive: !isDisabled,
    });
    // Remaining keys that stay as useInput: number keys, pageUp/pageDown, tab, space,
    // and arrow key navigation when in input mode
    (0, ink_js_1.useInput)(function (input, key, event) {
        var _a, _b, _c, _d, _e, _f;
        var normalizedInput = (0, stringUtils_js_1.normalizeFullWidthDigits)(input);
        var focusedOption = options.find(function (opt) { return opt.value === state.focusedValue; });
        var currentIsInInput = (focusedOption === null || focusedOption === void 0 ? void 0 : focusedOption.type) === 'input';
        // Handle Tab key for input mode toggling
        if (key.tab && onInputModeToggle && state.focusedValue !== undefined) {
            onInputModeToggle(state.focusedValue);
            return;
        }
        if (currentIsInInput) {
            // When in image selection mode, suppress all input handling so
            // Attachments keybindings can handle navigation/deletion instead
            if (imagesSelected)
                return;
            // DOWN arrow enters image selection mode if images exist
            if (key.downArrow && (onEnterImageSelection === null || onEnterImageSelection === void 0 ? void 0 : onEnterImageSelection())) {
                event.stopImmediatePropagation();
                return;
            }
            // Arrow keys still navigate the select even while in input mode
            if (key.downArrow || (key.ctrl && input === 'n')) {
                if (onDownFromLastItem) {
                    var lastOption = options[options.length - 1];
                    if (lastOption && state.focusedValue === lastOption.value) {
                        onDownFromLastItem();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                state.focusNextOption();
                event.stopImmediatePropagation();
                return;
            }
            if (key.upArrow || (key.ctrl && input === 'p')) {
                if (onUpFromFirstItem && state.visibleFromIndex === 0) {
                    var firstOption = options[0];
                    if (firstOption && state.focusedValue === firstOption.value) {
                        onUpFromFirstItem();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                state.focusPreviousOption();
                event.stopImmediatePropagation();
                return;
            }
            // All other keys (including digits) pass through to TextInput.
            // Digits should type literally into the input rather than select
            // options — the user has focused a text field and expects typing
            // to insert characters, not jump to a different option.
            return;
        }
        if (key.pageDown) {
            state.focusNextPage();
        }
        if (key.pageUp) {
            state.focusPreviousPage();
        }
        if (disableSelection !== true) {
            // Space for multi-select toggle
            if (isMultiSelect &&
                (0, stringUtils_js_1.normalizeFullWidthSpace)(input) === ' ' &&
                state.focusedValue !== undefined) {
                var isFocusedOptionDisabled = (focusedOption === null || focusedOption === void 0 ? void 0 : focusedOption.disabled) === true;
                if (!isFocusedOptionDisabled) {
                    (_a = state.selectFocusedOption) === null || _a === void 0 ? void 0 : _a.call(state);
                    (_b = state.onChange) === null || _b === void 0 ? void 0 : _b.call(state, state.focusedValue);
                }
            }
            if (disableSelection !== 'numeric' &&
                /^[0-9]+$/.test(normalizedInput)) {
                var index = parseInt(normalizedInput) - 1;
                if (index >= 0 && index < state.options.length) {
                    var selectedOption = state.options[index];
                    if (selectedOption.disabled === true) {
                        return;
                    }
                    if (selectedOption.type === 'input') {
                        var currentValue = (_c = inputValues === null || inputValues === void 0 ? void 0 : inputValues.get(selectedOption.value)) !== null && _c !== void 0 ? _c : '';
                        if (currentValue.trim()) {
                            // Pre-filled input: auto-submit (user can Tab to edit instead)
                            (_d = state.onChange) === null || _d === void 0 ? void 0 : _d.call(state, selectedOption.value);
                            return;
                        }
                        if (selectedOption.allowEmptySubmitToCancel) {
                            (_e = state.onChange) === null || _e === void 0 ? void 0 : _e.call(state, selectedOption.value);
                            return;
                        }
                        state.focusOption(selectedOption.value);
                        return;
                    }
                    (_f = state.onChange) === null || _f === void 0 ? void 0 : _f.call(state, selectedOption.value);
                    return;
                }
            }
        }
    }, { isActive: !isDisabled });
};
exports.useSelectInput = useSelectInput;
