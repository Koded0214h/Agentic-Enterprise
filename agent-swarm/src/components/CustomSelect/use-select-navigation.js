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
exports.useSelectNavigation = useSelectNavigation;
var react_1 = require("react");
var util_1 = require("util");
var option_map_js_1 = require("./option-map.js");
var reducer = function (state, action) {
    switch (action.type) {
        case 'focus-next-option': {
            if (state.focusedValue === undefined) {
                return state;
            }
            var item = state.optionMap.get(state.focusedValue);
            if (!item) {
                return state;
            }
            // Wrap to first item if at the end
            var next = item.next || state.optionMap.first;
            if (!next) {
                return state;
            }
            // When wrapping to first, reset viewport to start
            if (!item.next && next === state.optionMap.first) {
                return __assign(__assign({}, state), { focusedValue: next.value, visibleFromIndex: 0, visibleToIndex: state.visibleOptionCount });
            }
            var needsToScroll = next.index >= state.visibleToIndex;
            if (!needsToScroll) {
                return __assign(__assign({}, state), { focusedValue: next.value });
            }
            var nextVisibleToIndex = Math.min(state.optionMap.size, state.visibleToIndex + 1);
            var nextVisibleFromIndex = nextVisibleToIndex - state.visibleOptionCount;
            return __assign(__assign({}, state), { focusedValue: next.value, visibleFromIndex: nextVisibleFromIndex, visibleToIndex: nextVisibleToIndex });
        }
        case 'focus-previous-option': {
            if (state.focusedValue === undefined) {
                return state;
            }
            var item = state.optionMap.get(state.focusedValue);
            if (!item) {
                return state;
            }
            // Wrap to last item if at the beginning
            var previous = item.previous || state.optionMap.last;
            if (!previous) {
                return state;
            }
            // When wrapping to last, reset viewport to end
            if (!item.previous && previous === state.optionMap.last) {
                var nextVisibleToIndex_1 = state.optionMap.size;
                var nextVisibleFromIndex_1 = Math.max(0, nextVisibleToIndex_1 - state.visibleOptionCount);
                return __assign(__assign({}, state), { focusedValue: previous.value, visibleFromIndex: nextVisibleFromIndex_1, visibleToIndex: nextVisibleToIndex_1 });
            }
            var needsToScroll = previous.index <= state.visibleFromIndex;
            if (!needsToScroll) {
                return __assign(__assign({}, state), { focusedValue: previous.value });
            }
            var nextVisibleFromIndex = Math.max(0, state.visibleFromIndex - 1);
            var nextVisibleToIndex = nextVisibleFromIndex + state.visibleOptionCount;
            return __assign(__assign({}, state), { focusedValue: previous.value, visibleFromIndex: nextVisibleFromIndex, visibleToIndex: nextVisibleToIndex });
        }
        case 'focus-next-page': {
            if (state.focusedValue === undefined) {
                return state;
            }
            var item = state.optionMap.get(state.focusedValue);
            if (!item) {
                return state;
            }
            // Move by a full page (visibleOptionCount items)
            var targetIndex = Math.min(state.optionMap.size - 1, item.index + state.visibleOptionCount);
            // Find the item at the target index
            var targetItem = state.optionMap.first;
            while (targetItem && targetItem.index < targetIndex) {
                if (targetItem.next) {
                    targetItem = targetItem.next;
                }
                else {
                    break;
                }
            }
            if (!targetItem) {
                return state;
            }
            // Update the visible range to include the new focused item
            var nextVisibleToIndex = Math.min(state.optionMap.size, targetItem.index + 1);
            var nextVisibleFromIndex = Math.max(0, nextVisibleToIndex - state.visibleOptionCount);
            return __assign(__assign({}, state), { focusedValue: targetItem.value, visibleFromIndex: nextVisibleFromIndex, visibleToIndex: nextVisibleToIndex });
        }
        case 'focus-previous-page': {
            if (state.focusedValue === undefined) {
                return state;
            }
            var item = state.optionMap.get(state.focusedValue);
            if (!item) {
                return state;
            }
            // Move by a full page (visibleOptionCount items)
            var targetIndex = Math.max(0, item.index - state.visibleOptionCount);
            // Find the item at the target index
            var targetItem = state.optionMap.first;
            while (targetItem && targetItem.index < targetIndex) {
                if (targetItem.next) {
                    targetItem = targetItem.next;
                }
                else {
                    break;
                }
            }
            if (!targetItem) {
                return state;
            }
            // Update the visible range to include the new focused item
            var nextVisibleFromIndex = Math.max(0, targetItem.index);
            var nextVisibleToIndex = Math.min(state.optionMap.size, nextVisibleFromIndex + state.visibleOptionCount);
            return __assign(__assign({}, state), { focusedValue: targetItem.value, visibleFromIndex: nextVisibleFromIndex, visibleToIndex: nextVisibleToIndex });
        }
        case 'reset': {
            return action.state;
        }
        case 'set-focus': {
            // Early return if already focused on this value
            if (state.focusedValue === action.value) {
                return state;
            }
            var item = state.optionMap.get(action.value);
            if (!item) {
                return state;
            }
            // Check if the item is already in view
            if (item.index >= state.visibleFromIndex &&
                item.index < state.visibleToIndex) {
                // Already visible, just update focus
                return __assign(__assign({}, state), { focusedValue: action.value });
            }
            // Need to scroll to make the item visible
            // Scroll as little as possible - put item at edge of viewport
            var nextVisibleFromIndex = void 0;
            var nextVisibleToIndex = void 0;
            if (item.index < state.visibleFromIndex) {
                // Item is above viewport - scroll up to put it at the top
                nextVisibleFromIndex = item.index;
                nextVisibleToIndex = Math.min(state.optionMap.size, nextVisibleFromIndex + state.visibleOptionCount);
            }
            else {
                // Item is below viewport - scroll down to put it at the bottom
                nextVisibleToIndex = Math.min(state.optionMap.size, item.index + 1);
                nextVisibleFromIndex = Math.max(0, nextVisibleToIndex - state.visibleOptionCount);
            }
            return __assign(__assign({}, state), { focusedValue: action.value, visibleFromIndex: nextVisibleFromIndex, visibleToIndex: nextVisibleToIndex });
        }
    }
};
var createDefaultState = function (_a) {
    var _b;
    var customVisibleOptionCount = _a.visibleOptionCount, options = _a.options, initialFocusValue = _a.initialFocusValue, currentViewport = _a.currentViewport;
    var visibleOptionCount = typeof customVisibleOptionCount === 'number'
        ? Math.min(customVisibleOptionCount, options.length)
        : options.length;
    var optionMap = new option_map_js_1.default(options);
    var focusedItem = initialFocusValue !== undefined && optionMap.get(initialFocusValue);
    var focusedValue = focusedItem ? initialFocusValue : (_b = optionMap.first) === null || _b === void 0 ? void 0 : _b.value;
    var visibleFromIndex = 0;
    var visibleToIndex = visibleOptionCount;
    // When there's a valid focused item, adjust viewport to show it
    if (focusedItem) {
        var focusedIndex = focusedItem.index;
        if (currentViewport) {
            // If focused item is already in the current viewport range, try to preserve it
            if (focusedIndex >= currentViewport.visibleFromIndex &&
                focusedIndex < currentViewport.visibleToIndex) {
                // Keep the same viewport if it's valid
                visibleFromIndex = currentViewport.visibleFromIndex;
                visibleToIndex = Math.min(optionMap.size, currentViewport.visibleToIndex);
            }
            else {
                // Need to adjust viewport to show focused item
                // Use minimal scrolling - put item at edge of viewport
                if (focusedIndex < currentViewport.visibleFromIndex) {
                    // Item is above current viewport - scroll up to put it at the top
                    visibleFromIndex = focusedIndex;
                    visibleToIndex = Math.min(optionMap.size, visibleFromIndex + visibleOptionCount);
                }
                else {
                    // Item is below current viewport - scroll down to put it at the bottom
                    visibleToIndex = Math.min(optionMap.size, focusedIndex + 1);
                    visibleFromIndex = Math.max(0, visibleToIndex - visibleOptionCount);
                }
            }
        }
        else if (focusedIndex >= visibleOptionCount) {
            // No current viewport but focused item is outside default viewport
            // Scroll to show the focused item at the bottom of the viewport
            visibleToIndex = Math.min(optionMap.size, focusedIndex + 1);
            visibleFromIndex = Math.max(0, visibleToIndex - visibleOptionCount);
        }
        // Ensure viewport bounds are valid
        visibleFromIndex = Math.max(0, Math.min(visibleFromIndex, optionMap.size - 1));
        visibleToIndex = Math.min(optionMap.size, Math.max(visibleOptionCount, visibleToIndex));
    }
    return {
        optionMap: optionMap,
        visibleOptionCount: visibleOptionCount,
        focusedValue: focusedValue,
        visibleFromIndex: visibleFromIndex,
        visibleToIndex: visibleToIndex,
    };
};
function useSelectNavigation(_a) {
    var _b;
    var _c = _a.visibleOptionCount, visibleOptionCount = _c === void 0 ? 5 : _c, options = _a.options, initialFocusValue = _a.initialFocusValue, onFocus = _a.onFocus, focusValue = _a.focusValue;
    var _d = (0, react_1.useReducer)((reducer), {
        visibleOptionCount: visibleOptionCount,
        options: options,
        initialFocusValue: focusValue || initialFocusValue,
    }, (createDefaultState)), state = _d[0], dispatch = _d[1];
    // Store onFocus in a ref to avoid re-running useEffect when callback changes
    var onFocusRef = (0, react_1.useRef)(onFocus);
    onFocusRef.current = onFocus;
    var _e = (0, react_1.useState)(options), lastOptions = _e[0], setLastOptions = _e[1];
    if (options !== lastOptions && !(0, util_1.isDeepStrictEqual)(options, lastOptions)) {
        dispatch({
            type: 'reset',
            state: createDefaultState({
                visibleOptionCount: visibleOptionCount,
                options: options,
                initialFocusValue: (_b = focusValue !== null && focusValue !== void 0 ? focusValue : state.focusedValue) !== null && _b !== void 0 ? _b : initialFocusValue,
                currentViewport: {
                    visibleFromIndex: state.visibleFromIndex,
                    visibleToIndex: state.visibleToIndex,
                },
            }),
        });
        setLastOptions(options);
    }
    var focusNextOption = (0, react_1.useCallback)(function () {
        dispatch({
            type: 'focus-next-option',
        });
    }, []);
    var focusPreviousOption = (0, react_1.useCallback)(function () {
        dispatch({
            type: 'focus-previous-option',
        });
    }, []);
    var focusNextPage = (0, react_1.useCallback)(function () {
        dispatch({
            type: 'focus-next-page',
        });
    }, []);
    var focusPreviousPage = (0, react_1.useCallback)(function () {
        dispatch({
            type: 'focus-previous-page',
        });
    }, []);
    var focusOption = (0, react_1.useCallback)(function (value) {
        if (value !== undefined) {
            dispatch({
                type: 'set-focus',
                value: value,
            });
        }
    }, []);
    var visibleOptions = (0, react_1.useMemo)(function () {
        return options
            .map(function (option, index) { return (__assign(__assign({}, option), { index: index })); })
            .slice(state.visibleFromIndex, state.visibleToIndex);
    }, [options, state.visibleFromIndex, state.visibleToIndex]);
    // Validate that focusedValue exists in current options.
    // This handles the case where options change during render but the reset
    // action hasn't been processed yet - without this, the cursor would disappear
    // because focusedValue points to an option that no longer exists.
    var validatedFocusedValue = (0, react_1.useMemo)(function () {
        var _a;
        if (state.focusedValue === undefined) {
            return undefined;
        }
        var exists = options.some(function (opt) { return opt.value === state.focusedValue; });
        if (exists) {
            return state.focusedValue;
        }
        // Fall back to first option if focused value doesn't exist
        return (_a = options[0]) === null || _a === void 0 ? void 0 : _a.value;
    }, [state.focusedValue, options]);
    var isInInput = (0, react_1.useMemo)(function () {
        var focusedOption = options.find(function (opt) { return opt.value === validatedFocusedValue; });
        return (focusedOption === null || focusedOption === void 0 ? void 0 : focusedOption.type) === 'input';
    }, [validatedFocusedValue, options]);
    // Call onFocus with the validated value (what's actually displayed),
    // not the internal state value which may be stale if options changed.
    // Use ref to avoid re-running when callback reference changes.
    (0, react_1.useEffect)(function () {
        var _a;
        if (validatedFocusedValue !== undefined) {
            (_a = onFocusRef.current) === null || _a === void 0 ? void 0 : _a.call(onFocusRef, validatedFocusedValue);
        }
    }, [validatedFocusedValue]);
    // Allow parent to programmatically set focus via focusValue prop
    (0, react_1.useEffect)(function () {
        if (focusValue !== undefined) {
            dispatch({
                type: 'set-focus',
                value: focusValue,
            });
        }
    }, [focusValue]);
    // Compute 1-based focused index for scroll position display
    var focusedIndex = (0, react_1.useMemo)(function () {
        if (validatedFocusedValue === undefined) {
            return 0;
        }
        var index = options.findIndex(function (opt) { return opt.value === validatedFocusedValue; });
        return index >= 0 ? index + 1 : 0;
    }, [validatedFocusedValue, options]);
    return {
        focusedValue: validatedFocusedValue,
        focusedIndex: focusedIndex,
        visibleFromIndex: state.visibleFromIndex,
        visibleToIndex: state.visibleToIndex,
        visibleOptions: visibleOptions,
        isInInput: isInInput !== null && isInInput !== void 0 ? isInInput : false,
        focusNextOption: focusNextOption,
        focusPreviousOption: focusPreviousOption,
        focusNextPage: focusNextPage,
        focusPreviousPage: focusPreviousPage,
        focusOption: focusOption,
        options: options,
    };
}
